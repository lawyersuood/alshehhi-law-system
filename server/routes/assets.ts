// ============================================================
// واجهة برمجة الأصول الثابتة والإهلاك — النظام المحاسبي المتكامل
// ============================================================

import { Router } from "express";
import { randomUUID } from "crypto";
import { getPool } from "../db";
import type { AuthedRequest } from "../auth";

export const assetsRouter = Router();

assetsRouter.get("/fixed-assets", async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, category, asset_account_id AS assetAccountId,
              accumulated_depreciation_account_id AS accumulatedDepreciationAccountId,
              depreciation_expense_account_id AS depreciationExpenseAccountId,
              cost, purchase_date AS purchaseDate, useful_life_years AS usefulLifeYears, salvage_value AS salvageValue,
              depreciation_method AS depreciationMethod, status, notes, created_at AS createdAt, created_by AS createdBy, disposed_at AS disposedAt
       FROM fixed_assets ORDER BY purchase_date DESC`,
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل الأصول الثابتة." });
  }
});

assetsRouter.post("/fixed-assets", async (req: AuthedRequest, res) => {
  const {
    name,
    category,
    assetAccountId,
    accumulatedDepreciationAccountId,
    depreciationExpenseAccountId,
    cost,
    purchaseDate,
    usefulLifeYears,
    salvageValue,
    notes,
  } = req.body || {};
  if (
    !name ||
    !category ||
    !assetAccountId ||
    !accumulatedDepreciationAccountId ||
    !depreciationExpenseAccountId ||
    !cost ||
    !purchaseDate ||
    !usefulLifeYears
  ) {
    res.status(400).json({ error: "بيانات الأصل الثابت غير مكتملة." });
    return;
  }
  try {
    const pool = getPool();
    const id = randomUUID();
    await pool.query(
      `INSERT INTO fixed_assets (id, name, category, asset_account_id, accumulated_depreciation_account_id, depreciation_expense_account_id,
                                  cost, purchase_date, useful_life_years, salvage_value, depreciation_method, status, notes, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'straight_line', 'active', ?, NOW(), ?)`,
      [
        id,
        name,
        category,
        assetAccountId,
        accumulatedDepreciationAccountId,
        depreciationExpenseAccountId,
        Number(cost),
        purchaseDate,
        Number(usefulLifeYears),
        Number(salvageValue) || 0,
        notes || null,
        req.authUser?.email || null,
      ],
    );
    res.status(201).json({ id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل إنشاء الأصل الثابت." });
  }
});

assetsRouter.post("/fixed-assets/:id/dispose", async (req, res) => {
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE fixed_assets SET status = 'disposed', disposed_at = NOW() WHERE id = ?`,
      [req.params.id],
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل استبعاد الأصل." });
  }
});

assetsRouter.delete("/fixed-assets/:id", async (req, res) => {
  try {
    const pool = getPool();
    const [runs]: any = await pool.query(
      `SELECT COUNT(*) AS cnt FROM depreciation_runs WHERE asset_id = ?`,
      [req.params.id],
    );
    if (runs[0]?.cnt > 0) {
      res.status(409).json({ error: "لا يمكن حذف أصل له قيود إهلاك منفّذة مسبقاً." });
      return;
    }
    await pool.query(`DELETE FROM fixed_assets WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل حذف الأصل." });
  }
});

assetsRouter.get("/depreciation-runs", async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, asset_id AS assetId, period_label AS periodLabel, date, amount, journal_entry_id AS journalEntryId,
              created_at AS createdAt, created_by AS createdBy
       FROM depreciation_runs ORDER BY period_label DESC`,
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل سجل قيود الإهلاك." });
  }
});

// توليد قيد إهلاك دوري مجمّع لعدة أصول دفعة واحدة — يستقبل بنود القيد المجمّعة جاهزة من الواجهة الأمامية
// (نفس منطق aggregation المستخدم في PurchaseInvoices/FixedAssets بالواجهة الأمامية)
assetsRouter.post("/depreciation-runs", async (req: AuthedRequest, res) => {
  const { periodLabel, date, entryNumber, description, lines, runs } = req.body || {};
  if (
    !periodLabel ||
    !date ||
    !entryNumber ||
    !description ||
    !Array.isArray(lines) ||
    lines.length < 2 ||
    !Array.isArray(runs) ||
    runs.length === 0
  ) {
    res.status(400).json({ error: "بيانات تشغيل الإهلاك غير مكتملة." });
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
      [
        entryId,
        entryNumber,
        date,
        description,
        periodLabel,
        req.authUser?.email || null,
        req.authUser?.email || null,
      ],
    );
    let order = 0;
    for (const l of lines) {
      await conn.query(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          entryId,
          l.accountId,
          Number(l.debit) || 0,
          Number(l.credit) || 0,
          l.description || null,
          order++,
        ],
      );
    }
    const createdRunIds: string[] = [];
    for (const r of runs) {
      const runId = randomUUID();
      await conn.query(
        `INSERT INTO depreciation_runs (id, asset_id, period_label, date, amount, journal_entry_id, created_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          runId,
          r.assetId,
          periodLabel,
          date,
          Number(r.amount),
          entryId,
          req.authUser?.email || null,
        ],
      );
      createdRunIds.push(runId);
    }
    await conn.commit();
    res.status(201).json({ journalEntryId: entryId, runIds: createdRunIds });
  } catch (err: any) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "تم تنفيذ قيد إهلاك لأحد هذه الأصول عن هذه الفترة مسبقاً." });
      return;
    }
    res.status(500).json({ error: err?.message || "فشل توليد قيد الإهلاك." });
  } finally {
    conn.release();
  }
});
