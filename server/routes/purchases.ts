// ============================================================
// واجهة برمجة الموردين والمشتريات — النظام المحاسبي المتكامل (نفس نمط sales.ts)
// ============================================================

import { Router } from "express";
import { randomUUID } from "crypto";
import { getPool } from "../db";
import type { AuthedRequest } from "../auth";

export const purchasesRouter = Router();

// ---------------- الموردون ----------------

purchasesRouter.get("/vendors", async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, trn, phone, email, notes, is_active AS isActive, created_at AS createdAt FROM vendors ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل الموردين." });
  }
});

purchasesRouter.post("/vendors", async (req: AuthedRequest, res) => {
  const { name, trn, phone, email, notes, isActive } = req.body || {};
  if (!name) {
    res.status(400).json({ error: "اسم المورد إلزامي." });
    return;
  }
  try {
    const pool = getPool();
    const id = randomUUID();
    await pool.query(
      `INSERT INTO vendors (id, name, trn, phone, email, notes, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, name, trn || null, phone || null, email || null, notes || null, isActive === false ? 0 : 1]
    );
    res.status(201).json({ id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل إنشاء المورد." });
  }
});

purchasesRouter.put("/vendors/:id", async (req: AuthedRequest, res) => {
  const { name, trn, phone, email, notes, isActive } = req.body || {};
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE vendors SET name = ?, trn = ?, phone = ?, email = ?, notes = ?, is_active = ? WHERE id = ?`,
      [name, trn || null, phone || null, email || null, notes || null, isActive ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحديث المورد." });
  }
});

purchasesRouter.delete("/vendors/:id", async (req, res) => {
  try {
    const pool = getPool();
    await pool.query(`DELETE FROM vendors WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل حذف المورد (تأكد من عدم وجود فواتير مرتبطة به)." });
  }
});

// ---------------- فواتير المشتريات ----------------

async function fetchBillsWithLines(pool: any) {
  const [bills]: any = await pool.query(
    `SELECT id, bill_number AS billNumber, vendor_invoice_number AS vendorInvoiceNumber, vendor_id AS vendorId,
            date, due_date AS dueDate, notes, status, journal_entry_id AS journalEntryId,
            created_at AS createdAt, created_by AS createdBy, approved_at AS approvedAt, approved_by AS approvedBy, cancelled_at AS cancelledAt
     FROM purchase_invoices ORDER BY date DESC, bill_number DESC`
  );
  if (bills.length === 0) return [];
  const ids = bills.map((b: any) => b.id);
  const [lines]: any = await pool.query(
    `SELECT id, invoice_id AS invoiceId, description, quantity, unit_price AS unitPrice, vat_rate AS vatRate, account_id AS accountId
     FROM purchase_invoice_lines WHERE invoice_id IN (?) ORDER BY line_order ASC`,
    [ids]
  );
  const byBill = new Map<string, any[]>();
  for (const l of lines) {
    if (!byBill.has(l.invoiceId)) byBill.set(l.invoiceId, []);
    byBill.get(l.invoiceId)!.push({
      id: l.id,
      description: l.description,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      vatRate: Number(l.vatRate),
      accountId: l.accountId,
    });
  }
  return bills.map((b: any) => ({ ...b, lines: byBill.get(b.id) || [] }));
}

purchasesRouter.get("/purchase-invoices", async (_req, res) => {
  try {
    const pool = getPool();
    res.json(await fetchBillsWithLines(pool));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل فواتير المشتريات." });
  }
});

purchasesRouter.post("/purchase-invoices", async (req: AuthedRequest, res) => {
  const { billNumber, vendorInvoiceNumber, vendorId, date, dueDate, lines, notes } = req.body || {};
  if (!billNumber || !vendorId || !date || !Array.isArray(lines) || lines.length === 0) {
    res.status(400).json({ error: "بيانات فاتورة المشتريات غير مكتملة." });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = randomUUID();
    await conn.query(
      `INSERT INTO purchase_invoices (id, bill_number, vendor_invoice_number, vendor_id, date, due_date, notes, status, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), ?)`,
      [id, billNumber, vendorInvoiceNumber || null, vendorId, date, dueDate || null, notes || null, req.authUser?.email || null]
    );
    let order = 0;
    for (const l of lines) {
      await conn.query(
        `INSERT INTO purchase_invoice_lines (id, invoice_id, description, quantity, unit_price, vat_rate, account_id, line_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), id, l.description, Number(l.quantity) || 0, Number(l.unitPrice) || 0, Number(l.vatRate) || 0, l.accountId, order++]
      );
    }
    await conn.commit();
    res.status(201).json({ id });
  } catch (err: any) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "رقم الفاتورة الداخلي هذا مستخدم بالفعل." });
      return;
    }
    res.status(500).json({ error: err?.message || "فشل إنشاء فاتورة المشتريات." });
  } finally {
    conn.release();
  }
});

purchasesRouter.post("/purchase-invoices/:id/approve", async (req: AuthedRequest, res) => {
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
      `UPDATE purchase_invoices SET status = 'approved', journal_entry_id = ?, approved_at = NOW(), approved_by = ? WHERE id = ?`,
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

purchasesRouter.post("/purchase-invoices/:id/cancel", async (req, res) => {
  try {
    const pool = getPool();
    await pool.query(`UPDATE purchase_invoices SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل إلغاء الفاتورة." });
  }
});

purchasesRouter.post("/purchase-payments", async (req: AuthedRequest, res) => {
  const { billId, date, amount, payingAccountId, reference, entryNumber, apAccountId } = req.body || {};
  if (!billId || !date || !amount || !payingAccountId || !entryNumber || !apAccountId) {
    res.status(400).json({ error: "بيانات الدفعة غير مكتملة." });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const entryId = randomUUID();
    const description = `سداد دفعة على فاتورة مشتريات`;
    await conn.query(
      `INSERT INTO journal_entries (id, entry_number, date, description, reference, status, created_at, created_by, posted_at, posted_by)
       VALUES (?, ?, ?, ?, ?, 'posted', NOW(), ?, NOW(), ?)`,
      [entryId, entryNumber, date, description, reference || billId, req.authUser?.email || null, req.authUser?.email || null]
    );
    await conn.query(
      `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, 0, ?, ?, 0)`,
      [randomUUID(), entryId, payingAccountId, Number(amount), description]
    );
    await conn.query(
      `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, ?, 0, ?, 1)`,
      [randomUUID(), entryId, apAccountId, Number(amount), description]
    );
    const payId = randomUUID();
    await conn.query(
      `INSERT INTO purchase_payments (id, bill_id, date, amount, paying_account_id, reference, journal_entry_id, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [payId, billId, date, Number(amount), payingAccountId, reference || null, entryId, req.authUser?.email || null]
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

purchasesRouter.get("/purchase-payments", async (req, res) => {
  try {
    const pool = getPool();
    const billId = req.query.billId as string | undefined;
    const [rows] = billId
      ? await pool.query(
          `SELECT id, bill_id AS billId, date, amount, paying_account_id AS payingAccountId, reference,
                  journal_entry_id AS journalEntryId, created_at AS createdAt, created_by AS createdBy
           FROM purchase_payments WHERE bill_id = ? ORDER BY date DESC`,
          [billId]
        )
      : await pool.query(
          `SELECT id, bill_id AS billId, date, amount, paying_account_id AS payingAccountId, reference,
                  journal_entry_id AS journalEntryId, created_at AS createdAt, created_by AS createdBy
           FROM purchase_payments ORDER BY date DESC`
        );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل الدفعات." });
  }
});
