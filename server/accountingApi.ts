// ============================================================
// واجهة برمجة النظام المحاسبي الكاملة (كل المراحل: الحسابات، القيود، البنوك، المبيعات،
// المشتريات، الأصول الثابتة، الرواتب) — تجميعة موجّهات فرعية لكل وحدة في server/routes/*.
//
// كل المسارات هنا محمية بـ requireSupabaseAuth (لا يمكن الوصول إليها دون تسجيل دخول
// فعلي عبر نفس نظام الدخول الحالي للموقع). لا شيء هنا مستدعى بعد من الواجهة الأمامية —
// الوحدة المحاسبية بالكامل لا تزال ACCOUNTING_MODULE_ENABLED = false وتعمل بـ localStorage.
// ملاحظة نطاق: هذا يتحقق فقط من "تسجيل الدخول"، وليس بعد من صلاحيات كل عملية بدقة
// (RolePermissions) — تلك لا تزال تُفرض في الواجهة الأمامية فقط، كبقية النظام حالياً.
// ============================================================

import { Router } from "express";
import { randomUUID } from "crypto";
import { getPool, isAccountingDbConfigured } from "./db";
import { requireSupabaseAuth, type AuthedRequest } from "./auth";
import { bankRouter } from "./routes/bank";
import { salesRouter } from "./routes/sales";
import { purchasesRouter } from "./routes/purchases";
import { assetsRouter } from "./routes/assets";
import { payrollRouter } from "./routes/payroll";

export const accountingRouter = Router();

accountingRouter.use(requireSupabaseAuth);
accountingRouter.use(bankRouter);
accountingRouter.use(salesRouter);
accountingRouter.use(purchasesRouter);
accountingRouter.use(assetsRouter);
accountingRouter.use(payrollRouter);

// فحص سريع: هل قاعدة البيانات مهيأة ويمكن الاتصال بها؟
accountingRouter.get("/status", async (_req, res) => {
  if (!isAccountingDbConfigured()) {
    res.json({ configured: false, connected: false });
    return;
  }
  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    res.json({ configured: true, connected: true });
  } catch (err: any) {
    res.json({ configured: true, connected: false, error: err?.message || String(err) });
  }
});

// ---------------- شجرة الحسابات ----------------

accountingRouter.get("/accounts", async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, code, name, type, parent_id AS parentId, is_active AS isActive,
              is_system AS isSystem, notes, created_at AS createdAt
       FROM accounts ORDER BY code ASC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل شجرة الحسابات." });
  }
});

accountingRouter.post("/accounts", async (req: AuthedRequest, res) => {
  const { code, name, type, parentId, isActive, isSystem, notes } = req.body || {};
  if (!code || !name || !type) {
    res.status(400).json({ error: "الرمز والاسم والنوع حقول إلزامية." });
    return;
  }
  try {
    const pool = getPool();
    const id = randomUUID();
    await pool.query(
      `INSERT INTO accounts (id, code, name, type, parent_id, is_active, is_system, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, code, name, type, parentId || null, isActive ? 1 : 0, isSystem ? 1 : 0, notes || null]
    );
    res.status(201).json({ id });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "رمز الحساب هذا مستخدم بالفعل." });
      return;
    }
    res.status(500).json({ error: err?.message || "فشل إنشاء الحساب." });
  }
});

accountingRouter.put("/accounts/:id", async (req: AuthedRequest, res) => {
  const { name, type, parentId, isActive, notes } = req.body || {};
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE accounts SET name = ?, type = ?, parent_id = ?, is_active = ?, notes = ? WHERE id = ?`,
      [name, type, parentId || null, isActive ? 1 : 0, notes || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحديث الحساب." });
  }
});

// ---------------- القيود اليومية ----------------

accountingRouter.get("/journal-entries", async (_req, res) => {
  try {
    const pool = getPool();
    const [entries]: any = await pool.query(
      `SELECT id, entry_number AS entryNumber, date, description, reference, status,
              created_at AS createdAt, created_by AS createdBy, posted_at AS postedAt, posted_by AS postedBy
       FROM journal_entries ORDER BY date DESC, entry_number DESC`
    );
    if (entries.length === 0) {
      res.json([]);
      return;
    }
    const ids = entries.map((e: any) => e.id);
    const [lines]: any = await pool.query(
      `SELECT id, journal_entry_id AS journalEntryId, account_id AS accountId, debit, credit, description
       FROM journal_lines WHERE journal_entry_id IN (?) ORDER BY line_order ASC`,
      [ids]
    );
    const linesByEntry = new Map<string, any[]>();
    for (const l of lines) {
      if (!linesByEntry.has(l.journalEntryId)) linesByEntry.set(l.journalEntryId, []);
      linesByEntry.get(l.journalEntryId)!.push({
        id: l.id,
        accountId: l.accountId,
        debit: Number(l.debit),
        credit: Number(l.credit),
        description: l.description || undefined,
      });
    }
    const result = entries.map((e: any) => ({ ...e, lines: linesByEntry.get(e.id) || [] }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل القيود اليومية." });
  }
});

// إنشاء قيد يومية جديد (مع بنوده) بشكل متكامل (Transaction) — يُستخدم من كل الوحدات
// الأخرى (البنوك، المبيعات، المشتريات، إلخ) عند توليد قيودها التلقائية.
accountingRouter.post("/journal-entries", async (req: AuthedRequest, res) => {
  const { entryNumber, date, description, reference, lines, status } = req.body || {};
  if (!entryNumber || !date || !description || !Array.isArray(lines) || lines.length < 2) {
    res.status(400).json({ error: "بيانات القيد غير مكتملة (يجب توفر رقم القيد والتاريخ والوصف وسطرين على الأقل)." });
    return;
  }
  const totalDebit = lines.reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s: number, l: any) => s + (Number(l.credit) || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.005 || totalDebit <= 0) {
    res.status(400).json({ error: "القيد غير متوازن (إجمالي المدين لا يساوي إجمالي الدائن)." });
    return;
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = randomUUID();
    const finalStatus = status === "posted" ? "posted" : "draft";
    await conn.query(
      `INSERT INTO journal_entries (id, entry_number, date, description, reference, status, created_at, created_by, posted_at, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        id,
        entryNumber,
        date,
        description,
        reference || null,
        finalStatus,
        req.authUser?.email || req.authUser?.id || null,
        finalStatus === "posted" ? new Date() : null,
        finalStatus === "posted" ? req.authUser?.email || req.authUser?.id || null : null,
      ]
    );
    let order = 0;
    for (const l of lines) {
      await conn.query(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), id, l.accountId, Number(l.debit) || 0, Number(l.credit) || 0, l.description || null, order++]
      );
    }
    await conn.commit();
    res.status(201).json({ id });
  } catch (err: any) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "رقم القيد هذا مستخدم بالفعل." });
      return;
    }
    res.status(500).json({ error: err?.message || "فشل إنشاء القيد اليومي." });
  } finally {
    conn.release();
  }
});
