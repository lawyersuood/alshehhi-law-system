// ============================================================
// واجهة برمجة الحسابات البنكية — النظام المحاسبي المتكامل
// نفس نمط server/accountingApi.ts تماماً (حماية عبر requireSupabaseAuth من الموجّه الأب)
// ============================================================

import { Router } from "express";
import { randomUUID } from "crypto";
import { getPool } from "../db";
import { requireServerRole, type AuthedRequest } from "../auth";

export const bankRouter = Router();

bankRouter.get("/bank-accounts", async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, bank_name AS bankName, account_label AS accountLabel, iban, account_number AS accountNumber,
              currency, opening_balance AS openingBalance, opening_date AS openingDate,
              linked_account_id AS linkedAccountId, is_active AS isActive, notes, created_at AS createdAt
       FROM bank_accounts ORDER BY created_at ASC`,
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل الحسابات البنكية." });
  }
});

bankRouter.post(
  "/bank-accounts",
  requireServerRole("admin", "accountant"),
  async (req: AuthedRequest, res) => {
    const {
      bankName,
      accountLabel,
      iban,
      accountNumber,
      currency,
      openingBalance,
      openingDate,
      linkedAccountId,
      isActive,
      notes,
    } = req.body || {};
    if (!bankName || !accountLabel || !openingDate || !linkedAccountId) {
      res
        .status(400)
        .json({ error: "اسم البنك ووصف الحساب وتاريخ الافتتاح والحساب المرتبط حقول إلزامية." });
      return;
    }
    try {
      const pool = getPool();
      const id = randomUUID();
      await pool.query(
        `INSERT INTO bank_accounts (id, bank_name, account_label, iban, account_number, currency, opening_balance, opening_date, linked_account_id, is_active, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          id,
          bankName,
          accountLabel,
          iban || null,
          accountNumber || null,
          currency || "AED",
          Number(openingBalance) || 0,
          openingDate,
          linkedAccountId,
          isActive ? 1 : 0,
          notes || null,
        ],
      );
      res.status(201).json({ id });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "فشل إنشاء الحساب البنكي." });
    }
  },
);

bankRouter.put(
  "/bank-accounts/:id",
  requireServerRole("admin", "accountant"),
  async (req: AuthedRequest, res) => {
    const { bankName, accountLabel, iban, accountNumber, currency, isActive, notes } =
      req.body || {};
    try {
      const pool = getPool();
      await pool.query(
        `UPDATE bank_accounts SET bank_name = ?, account_label = ?, iban = ?, account_number = ?, currency = ?, is_active = ?, notes = ? WHERE id = ?`,
        [
          bankName,
          accountLabel,
          iban || null,
          accountNumber || null,
          currency || "AED",
          isActive ? 1 : 0,
          notes || null,
          req.params.id,
        ],
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "فشل تحديث الحساب البنكي." });
    }
  },
);

// حركة بنكية جديدة (إيداع/سحب) — تُنشئ القيد اليومي المقابل ضمن معاملة واحدة متكاملة
bankRouter.post(
  "/bank-transactions",
  requireServerRole("admin", "accountant"),
  async (req: AuthedRequest, res) => {
    const {
      bankAccountId,
      date,
      type,
      amount,
      description,
      contraAccountId,
      reference,
      linkedAccountId,
      entryNumber,
    } = req.body || {};
    if (
      !bankAccountId ||
      !date ||
      !type ||
      !amount ||
      !description ||
      !contraAccountId ||
      !linkedAccountId ||
      !entryNumber
    ) {
      res.status(400).json({ error: "بيانات الحركة البنكية غير مكتملة." });
      return;
    }
    if (type !== "deposit" && type !== "withdrawal") {
      res.status(400).json({ error: "نوع الحركة يجب أن يكون إيداع أو سحب." });
      return;
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const entryId = randomUUID();
      const isDeposit = type === "deposit";
      // إيداع: مدين على حساب البنك (أصل)، دائن على الحساب المقابل. سحب: العكس.
      const bankDebit = isDeposit ? Number(amount) : 0;
      const bankCredit = isDeposit ? 0 : Number(amount);
      const contraDebit = isDeposit ? 0 : Number(amount);
      const contraCredit = isDeposit ? Number(amount) : 0;

      await conn.query(
        `INSERT INTO journal_entries (id, entry_number, date, description, reference, status, created_at, created_by, posted_at, posted_by)
       VALUES (?, ?, ?, ?, ?, 'posted', NOW(), ?, NOW(), ?)`,
        [
          entryId,
          entryNumber,
          date,
          description,
          reference || null,
          req.authUser?.email || null,
          req.authUser?.email || null,
        ],
      );
      await conn.query(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [randomUUID(), entryId, linkedAccountId, bankDebit, bankCredit, description],
      );
      await conn.query(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [randomUUID(), entryId, contraAccountId, contraDebit, contraCredit, description],
      );

      const txId = randomUUID();
      await conn.query(
        `INSERT INTO bank_transactions (id, bank_account_id, date, type, amount, description, contra_account_id, reference, journal_entry_id, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          txId,
          bankAccountId,
          date,
          type,
          Number(amount),
          description,
          contraAccountId,
          reference || null,
          entryId,
          req.authUser?.email || null,
        ],
      );

      await conn.commit();
      res.status(201).json({ id: txId, journalEntryId: entryId });
    } catch (err: any) {
      await conn.rollback();
      res.status(500).json({ error: err?.message || "فشل تسجيل الحركة البنكية." });
    } finally {
      conn.release();
    }
  },
);

bankRouter.get("/bank-transactions", async (req, res) => {
  try {
    const pool = getPool();
    const bankAccountId = req.query.bankAccountId as string | undefined;
    const [rows] = bankAccountId
      ? await pool.query(
          `SELECT id, bank_account_id AS bankAccountId, date, type, amount, description,
                  contra_account_id AS contraAccountId, reference, journal_entry_id AS journalEntryId,
                  created_at AS createdAt, created_by AS createdBy
           FROM bank_transactions WHERE bank_account_id = ? ORDER BY date DESC`,
          [bankAccountId],
        )
      : await pool.query(
          `SELECT id, bank_account_id AS bankAccountId, date, type, amount, description,
                  contra_account_id AS contraAccountId, reference, journal_entry_id AS journalEntryId,
                  created_at AS createdAt, created_by AS createdBy
           FROM bank_transactions ORDER BY date DESC`,
        );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل الحركات البنكية." });
  }
});
