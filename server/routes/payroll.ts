// ============================================================
// واجهة برمجة الرواتب والموظفين — النظام المحاسبي المتكامل
// ============================================================

import { Router } from "express";
import { randomUUID } from "crypto";
import { getPool } from "../db";
import { requireServerRole, type AuthedRequest } from "../auth";

export const payrollRouter = Router();

async function fetchEmployeesWithAllowances(pool: any) {
  const [emps]: any = await pool.query(
    `SELECT id, name, job_title AS jobTitle, basic_salary AS basicSalary, salary_expense_account_id AS salaryExpenseAccountId,
            salary_payable_account_id AS salaryPayableAccountId, is_active AS isActive, notes, created_at AS createdAt, created_by AS createdBy
     FROM payroll_employees ORDER BY name ASC`,
  );
  if (emps.length === 0) return [];
  const ids = emps.map((e: any) => e.id);
  const [allowances]: any = await pool.query(
    `SELECT id, employee_id AS employeeId, label, amount FROM employee_allowances WHERE employee_id IN (?)`,
    [ids],
  );
  const byEmp = new Map<string, any[]>();
  for (const a of allowances) {
    if (!byEmp.has(a.employeeId)) byEmp.set(a.employeeId, []);
    byEmp.get(a.employeeId)!.push({ id: a.id, label: a.label, amount: Number(a.amount) });
  }
  return emps.map((e: any) => ({ ...e, allowances: byEmp.get(e.id) || [] }));
}

payrollRouter.get("/payroll-employees", async (_req, res) => {
  try {
    const pool = getPool();
    res.json(await fetchEmployeesWithAllowances(pool));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل موظفي الرواتب." });
  }
});

payrollRouter.post("/payroll-employees", async (req: AuthedRequest, res) => {
  const {
    name,
    jobTitle,
    basicSalary,
    allowances,
    salaryExpenseAccountId,
    salaryPayableAccountId,
    isActive,
    notes,
  } = req.body || {};
  if (!name || !salaryExpenseAccountId || !salaryPayableAccountId) {
    res.status(400).json({ error: "بيانات الموظف غير مكتملة." });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = randomUUID();
    await conn.query(
      `INSERT INTO payroll_employees (id, name, job_title, basic_salary, salary_expense_account_id, salary_payable_account_id, is_active, notes, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        id,
        name,
        jobTitle || null,
        Number(basicSalary) || 0,
        salaryExpenseAccountId,
        salaryPayableAccountId,
        isActive === false ? 0 : 1,
        notes || null,
        req.authUser?.email || null,
      ],
    );
    for (const a of Array.isArray(allowances) ? allowances : []) {
      await conn.query(
        `INSERT INTO employee_allowances (id, employee_id, label, amount) VALUES (?, ?, ?, ?)`,
        [randomUUID(), id, a.label, Number(a.amount) || 0],
      );
    }
    await conn.commit();
    res.status(201).json({ id });
  } catch (err: any) {
    await conn.rollback();
    res.status(500).json({ error: err?.message || "فشل إنشاء الموظف." });
  } finally {
    conn.release();
  }
});

payrollRouter.put("/payroll-employees/:id", async (req: AuthedRequest, res) => {
  const {
    name,
    jobTitle,
    basicSalary,
    allowances,
    salaryExpenseAccountId,
    salaryPayableAccountId,
    isActive,
    notes,
  } = req.body || {};
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE payroll_employees SET name = ?, job_title = ?, basic_salary = ?, salary_expense_account_id = ?, salary_payable_account_id = ?, is_active = ?, notes = ? WHERE id = ?`,
      [
        name,
        jobTitle || null,
        Number(basicSalary) || 0,
        salaryExpenseAccountId,
        salaryPayableAccountId,
        isActive ? 1 : 0,
        notes || null,
        req.params.id,
      ],
    );
    await conn.query(`DELETE FROM employee_allowances WHERE employee_id = ?`, [req.params.id]);
    for (const a of Array.isArray(allowances) ? allowances : []) {
      await conn.query(
        `INSERT INTO employee_allowances (id, employee_id, label, amount) VALUES (?, ?, ?, ?)`,
        [randomUUID(), req.params.id, a.label, Number(a.amount) || 0],
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err: any) {
    await conn.rollback();
    res.status(500).json({ error: err?.message || "فشل تحديث الموظف." });
  } finally {
    conn.release();
  }
});

payrollRouter.delete(
  "/payroll-employees/:id",
  requireServerRole("admin", "accountant"),
  async (req, res) => {
  try {
    const pool = getPool();
    const [slips]: any = await pool.query(
      `SELECT COUNT(*) AS cnt FROM payslips WHERE employee_id = ?`,
      [req.params.id],
    );
    if (slips[0]?.cnt > 0) {
      res.status(409).json({ error: "لا يمكن حذف موظف له قسائم رواتب سابقة." });
      return;
    }
    await pool.query(`DELETE FROM payroll_employees WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل حذف الموظف." });
  }
});

// ---------------- تشغيلات الرواتب ----------------

payrollRouter.get(
  "/payroll-runs",
  requireServerRole("admin", "accountant"),
  async (_req, res) => {
  try {
    const pool = getPool();
    const [runs]: any = await pool.query(
      `SELECT id, period_label AS periodLabel, run_date AS runDate, total_gross AS totalGross, journal_entry_id AS journalEntryId,
              paid, paid_at AS paidAt, payment_journal_entry_id AS paymentJournalEntryId, paying_account_id AS payingAccountId,
              created_at AS createdAt, created_by AS createdBy
       FROM payroll_runs ORDER BY period_label DESC`,
    );
    if (runs.length === 0) {
      res.json([]);
      return;
    }
    const ids = runs.map((r: any) => r.id);
    const [breakdown]: any = await pool.query(
      `SELECT id, payroll_run_id AS payrollRunId, account_id AS accountId, amount FROM payroll_run_payable_breakdown WHERE payroll_run_id IN (?)`,
      [ids],
    );
    const byRun = new Map<string, any[]>();
    for (const b of breakdown) {
      if (!byRun.has(b.payrollRunId)) byRun.set(b.payrollRunId, []);
      byRun.get(b.payrollRunId)!.push({ accountId: b.accountId, amount: Number(b.amount) });
    }
    res.json(
      runs.map((r: any) => ({
        ...r,
        paid: Boolean(r.paid),
        payableBreakdown: byRun.get(r.id) || [],
      })),
    );
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل تشغيلات الرواتب." });
  }
});

// تشغيل رواتب جديد: قيد استحقاق مجمّع + قسيمة لكل موظف نشط (لقطة كاملة) — دفعة واحدة لكل فترة
payrollRouter.post("/payroll-runs", async (req: AuthedRequest, res) => {
  const {
    periodLabel,
    runDate,
    entryNumber,
    description,
    lines,
    totalGross,
    payableBreakdown,
    payslips,
  } = req.body || {};
  if (
    !periodLabel ||
    !runDate ||
    !entryNumber ||
    !description ||
    !Array.isArray(lines) ||
    lines.length < 2 ||
    !Array.isArray(payableBreakdown) ||
    payableBreakdown.length === 0 ||
    !Array.isArray(payslips) ||
    payslips.length === 0
  ) {
    res.status(400).json({ error: "بيانات تشغيل الرواتب غير مكتملة." });
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
        runDate,
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

    const runId = randomUUID();
    await conn.query(
      `INSERT INTO payroll_runs (id, period_label, run_date, total_gross, journal_entry_id, paid, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, 0, NOW(), ?)`,
      [runId, periodLabel, runDate, Number(totalGross) || 0, entryId, req.authUser?.email || null],
    );
    for (const b of payableBreakdown) {
      await conn.query(
        `INSERT INTO payroll_run_payable_breakdown (id, payroll_run_id, account_id, amount) VALUES (?, ?, ?, ?)`,
        [randomUUID(), runId, b.accountId, Number(b.amount) || 0],
      );
    }
    for (const p of payslips) {
      const slipId = randomUUID();
      await conn.query(
        `INSERT INTO payslips (id, payroll_run_id, employee_id, employee_name, period_label, basic_salary, gross_salary, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          slipId,
          runId,
          p.employeeId,
          p.employeeName,
          periodLabel,
          Number(p.basicSalary) || 0,
          Number(p.grossSalary) || 0,
        ],
      );
      for (const a of Array.isArray(p.allowances) ? p.allowances : []) {
        await conn.query(
          `INSERT INTO payslip_allowances (id, payslip_id, label, amount) VALUES (?, ?, ?, ?)`,
          [randomUUID(), slipId, a.label, Number(a.amount) || 0],
        );
      }
    }

    await conn.commit();
    res.status(201).json({ id: runId, journalEntryId: entryId });
  } catch (err: any) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "تم تشغيل رواتب هذه الفترة مسبقاً." });
      return;
    }
    res.status(500).json({ error: err?.message || "فشل تشغيل الرواتب." });
  } finally {
    conn.release();
  }
});

// تسجيل سداد تشغيل رواتب — يستخدم لقطة payable_breakdown المحفوظة وقت الاستحقاق
payrollRouter.post("/payroll-runs/:id/pay", async (req: AuthedRequest, res) => {
  const { entryNumber, date, description, payingAccountId, totalAmount } = req.body || {};
  if (!entryNumber || !date || !description || !payingAccountId || !totalAmount) {
    res.status(400).json({ error: "بيانات السداد غير مكتملة." });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [breakdown]: any = await conn.query(
      `SELECT account_id AS accountId, amount FROM payroll_run_payable_breakdown WHERE payroll_run_id = ?`,
      [req.params.id],
    );
    if (breakdown.length === 0) {
      throw new Error("لا يوجد توزيع مستحقات محفوظ لهذا التشغيل.");
    }
    const entryId = randomUUID();
    await conn.query(
      `INSERT INTO journal_entries (id, entry_number, date, description, reference, status, created_at, created_by, posted_at, posted_by)
       VALUES (?, ?, ?, ?, ?, 'posted', NOW(), ?, NOW(), ?)`,
      [
        entryId,
        entryNumber,
        date,
        description,
        req.params.id,
        req.authUser?.email || null,
        req.authUser?.email || null,
      ],
    );
    let order = 0;
    for (const b of breakdown) {
      await conn.query(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [randomUUID(), entryId, b.accountId, Number(b.amount), description, order++],
      );
    }
    await conn.query(
      `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, description, line_order) VALUES (?, ?, ?, 0, ?, ?, ?)`,
      [randomUUID(), entryId, payingAccountId, Number(totalAmount), description, order++],
    );
    await conn.query(
      `UPDATE payroll_runs SET paid = 1, paid_at = NOW(), payment_journal_entry_id = ?, paying_account_id = ? WHERE id = ?`,
      [entryId, payingAccountId, req.params.id],
    );
    await conn.commit();
    res.json({ journalEntryId: entryId });
  } catch (err: any) {
    await conn.rollback();
    res.status(500).json({ error: err?.message || "فشل تسجيل سداد الرواتب." });
  } finally {
    conn.release();
  }
});

payrollRouter.get("/payslips", requireServerRole("admin", "accountant"), async (req, res) => {
  try {
    const pool = getPool();
    const payrollRunId = req.query.payrollRunId as string | undefined;
    const [slips]: any = payrollRunId
      ? await pool.query(
          `SELECT id, payroll_run_id AS payrollRunId, employee_id AS employeeId, employee_name AS employeeName,
                  period_label AS periodLabel, basic_salary AS basicSalary, gross_salary AS grossSalary, created_at AS createdAt
           FROM payslips WHERE payroll_run_id = ?`,
          [payrollRunId],
        )
      : await pool.query(
          `SELECT id, payroll_run_id AS payrollRunId, employee_id AS employeeId, employee_name AS employeeName,
                  period_label AS periodLabel, basic_salary AS basicSalary, gross_salary AS grossSalary, created_at AS createdAt
           FROM payslips`,
        );
    if (slips.length === 0) {
      res.json([]);
      return;
    }
    const ids = slips.map((s: any) => s.id);
    const [allowances]: any = await pool.query(
      `SELECT id, payslip_id AS payslipId, label, amount FROM payslip_allowances WHERE payslip_id IN (?)`,
      [ids],
    );
    const byPayslip = new Map<string, any[]>();
    for (const a of allowances) {
      if (!byPayslip.has(a.payslipId)) byPayslip.set(a.payslipId, []);
      byPayslip.get(a.payslipId)!.push({ label: a.label, amount: Number(a.amount) });
    }
    res.json(slips.map((s: any) => ({ ...s, allowances: byPayslip.get(s.id) || [] })));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "فشل تحميل قسائم الرواتب." });
  }
});
