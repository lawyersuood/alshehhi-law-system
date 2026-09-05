// ============================================================
// واجهة برمجة المبيعات — النظام المحاسبي المتكامل (نفس نمط accountingApi.ts)
// ============================================================

import { Router } from "express";
import { randomUUID } from "crypto";
import { getPool } from "../db";
import type { AuthedRequest } from "../auth";

export const salesRouter = Router();

async function fetchInvoicesWithLines(pool: any, whereSql = "", params: any[] = []) {
  const [invoices]: any = await pool.query(
    `SELECT id, invoice_number AS invoiceNumber, date, due_date AS dueDate, client_name AS clientName,
            client_trn AS clientTRN, place_of_supply AS placeOfSupply, notes, status,
            journal_entry_id AS journalEntryId, created_at AS createdAt, created_by AS createdBy,
            approved_at AS approvedAt, approved_by AS approvedBy, cancelled_at AS cancelledAt
     FROM sales_invoices ${whereSql} ORDER BY date DESC, invoice_number DESC`,
    params
  );
  if (invoices.length === 0) return [];
  const ids = invoices.map((i: any) => i.id);
  const [lines]: any = await pool.query(
    `SELECT id, invoice_id AS invoiceId, description, quantity, unit_price AS unitPrice, vat_rate AS vatRate, account_id AS accountId
     FROM sales_invoice_lines WHERE invoice_id IN (?) ORDER BY line_order ASC`,
    [ids]
  );
  const byInvoice = new Map<string, any[]>();
  for (const l of lines) {
    if (!byInvoice.has(l.invoiceId)) byInvoice.set(l.invoiceId, []);
    byInvoice.get(l.invoiceId)!.push({
      id: l.id,
      description: l.description,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      vatRate: Number(l.vatRate),
      accountId: l.accountId,
    });
  }
  return invoices.map((i: any) => ({ ...i, lines: byInvoice.get(i.id) || [] }));
}

salesRouter.get("/sales-invoices", async (_req, res) => {
  try {
    const pool = getPool();
    res.json(await fetchInvoicesWithLines(pool));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل فواتير المبيعات." });
  }
});

// إنشاء فاتورة مبيعات (مسودة). لا تُنشئ قيداً محاسبياً إلا عند الاعتماد.
salesRouter.post("/sales-invoices", async (req: AuthedRequest, res) => {
  const { invoiceNumber, date, dueDate, clientName, clientTRN, placeOfSupply, lines, notes } = req.body || {};
  if (!invoiceNumber || !date || !clientName || !placeOfSupply || !Array.isArray(lines) || lines.length === 0) {
    res.status(400).json({ error: "بيانات الفاتورة غير مكتملة." });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = randomUUID();
    await conn.query(
      `INSERT INTO sales_invoices (id, invoice_number, date, due_date, client_name, client_trn, place_of_supply, notes, status, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), ?)`,
      [id, invoiceNumber, date, dueDate || null, clientName, clientTRN || null, placeOfSupply, notes || null, req.authUser?.email || null]
    );
    let order = 0;
    for (const l of lines) {
      await conn.query(
        `INSERT INTO sales_invoice_lines (id, invoice_id, description, quantity, unit_price, vat_rate, account_id, line_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), id, l.description, Number(l.quantity) || 0, Number(l.unitPrice) || 0, Number(l.vatRate) || 0, l.accountId, order++]
      );
    }
    await conn.commit();
    res.status(201).json({ id });
  } catch (err: any) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "رقم الفاتورة هذا مستخدم بالفعل." });
      return;
    }
    res.status(500).json({ error: err?.message || "فشل إنشاء فاتورة المبيعات." });
  } finally {
    conn.release();
  }
});

// اعتماد فاتورة: يستقبل بنود القيد المحسوبة مسبقاً من الواجهة الأمامية (المدين: ذمم العملاء، الدائن: الإيراد + الضريبة)
salesRouter.post("/sales-invoices/:id/approve", async (req: AuthedRequest, res) => {
  const { entryNumber, date, description, lines } = req.body || {};
  if (!entryNumber || !date || !description || !Array.isArray(lines) || lines.length < 2) {
    res.status(400).json({ error: "بيانات قيد الاعتماد غير مكتملة." });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const entryId = randomUUID();
    await conn.query(
      `INSERT INTO journal_entries (id, entry_number, date, description, reference, status, created_at, created_by, posted_at, posted_by)
       VALUES (?, ?, ?, ?, ?, 'posted', NOW(), ?, NOW(), ?)`,
      [entryId, entryNumber, date, description, req.params.id, req.authUser?.email || null, req.authUser?.email || null]
    );
    let order = 0;
    for (const l of lines) {
      await conn.query(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), entryId, l.accountId, Number(l.debit) || 0, Number(l.credit) || 0, l.description || null, order++]
      );
    }
    await conn.query(
      `UPDATE sales_invoices SET status = 'approved', journal_entry_id = ?, approved_at = NOW(), approved_by = ? WHERE id = ?`,
      [entryId, req.authUser?.email || null, req.params.id]
    );
    await conn.commit();
    res.json({ journalEntryId: entryId });
  } catch (err: any) {
    await conn.rollback();
    res.status(500).json({ error: err?.message || "فشل اعتماد الفاتورة." });
  } finally {
    conn.release();
  }
});

salesRouter.post("/sales-invoices/:id/cancel", async (req: AuthedRequest, res) => {
  try {
    const pool = getPool();
    await pool.query(`UPDATE sales_invoices SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل إلغاء الفاتورة." });
  }
});

// تسجيل دفعة على فاتورة مبيعات — تُنشئ قيداً محاسبياً (مدين: البنك/الصندوق، دائن: ذمم العملاء)
salesRouter.post("/sales-payments", async (req: AuthedRequest, res) => {
  const { invoiceId, date, amount, receivingAccountId, reference, entryNumber, arAccountId } = req.body || {};
  if (!invoiceId || !date || !amount || !receivingAccountId || !entryNumber || !arAccountId) {
    res.status(400).json({ error: "بيانات الدفعة غير مكتملة." });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const entryId = randomUUID();
    const description = `تحصيل دفعة على فاتورة مبيعات`;
    await conn.query(
      `INSERT INTO journal_entries (id, entry_number, date, description, reference, status, created_at, created_by, posted_at, posted_by)
       VALUES (?, ?, ?, ?, ?, 'posted', NOW(), ?, NOW(), ?)`,
      [entryId, entryNumber, date, description, reference || invoiceId, req.authUser?.email || null, req.authUser?.email || null]
    );
    await conn.query(
      `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, ?, 0, ?, 0)`,
      [randomUUID(), entryId, receivingAccountId, Number(amount), description]
    );
    await conn.query(
      `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, 0, ?, ?, 1)`,
      [randomUUID(), entryId, arAccountId, Number(amount), description]
    );
    const payId = randomUUID();
    await conn.query(
      `INSERT INTO sales_payments (id, invoice_id, date, amount, receiving_account_id, reference, journal_entry_id, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [payId, invoiceId, date, Number(amount), receivingAccountId, reference || null, entryId, req.authUser?.email || null]
    );
    await conn.commit();
    res.status(201).json({ id: payId, journalEntryId: entryId });
  } catch (err: any) {
    await conn.rollback();
    res.status(500).json({ error: err?.message || "فشل تسجيل الدفعة." });
  } finally {
    conn.release();
  }
});

salesRouter.get("/sales-payments", async (req, res) => {
  try {
    const pool = getPool();
    const invoiceId = req.query.invoiceId as string | undefined;
    const [rows] = invoiceId
      ? await pool.query(
          `SELECT id, invoice_id AS invoiceId, date, amount, receiving_account_id AS receivingAccountId, reference,
                  journal_entry_id AS journalEntryId, created_at AS createdAt, created_by AS createdBy
           FROM sales_payments WHERE invoice_id = ? ORDER BY date DESC`,
          [invoiceId]
        )
      : await pool.query(
          `SELECT id, invoice_id AS invoiceId, date, amount, receiving_account_id AS receivingAccountId, reference,
                  journal_entry_id AS journalEntryId, created_at AS createdAt, created_by AS createdBy
           FROM sales_payments ORDER BY date DESC`
        );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل الدفعات." });
  }
});
