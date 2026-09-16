import React, { useMemo, useState } from "react";
import { Plus, X, AlertTriangle, PlayCircle, Eye, CreditCard, CheckCircle2 } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { nextEntryNumber } from "./storage";
import {
  PayrollEmployee,
  PayrollRun,
  Payslip,
  grossSalary,
  allowancesTotal,
  hasRunForPeriod,
  currentPayrollPeriodLabel,
  fmtPeriodLabel,
} from "./payrollTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const fmtDateLabel = (d: string) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

export default function PayrollRuns({
  accounts,
  employees,
  runs,
  setRuns,
  payslips,
  setPayslips,
  entries,
  setEntries,
  canRun,
  canRecordPayment,
  currentUserName,
}: {
  accounts: Account[];
  employees: PayrollEmployee[];
  runs: PayrollRun[];
  setRuns: React.Dispatch<React.SetStateAction<PayrollRun[]>>;
  payslips: Payslip[];
  setPayslips: React.Dispatch<React.SetStateAction<Payslip[]>>;
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canRun: boolean;
  canRecordPayment: boolean;
  currentUserName?: string;
}) {
  const [period, setPeriod] = useState(currentPayrollPeriodLabel());
  const [runError, setRunError] = useState("");
  const [viewingRunId, setViewingRunId] = useState<string | null>(null);
  const [payingRunId, setPayingRunId] = useState<string | null>(null);
  const [payingAccountId, setPayingAccountId] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const assetTypeAccounts = useMemo(
    () =>
      accounts
        .filter((a) => a.isActive && !a.isGroup && a.type === "asset")
        .sort((a, b) => a.code.localeCompare(b.code)),
    [accounts],
  );
  const activeEmployees = useMemo(() => employees.filter((e) => e.isActive), [employees]);
  const alreadyRun = hasRunForPeriod(period, runs);

  const accountLabel = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} — ${a.name}` : "—";
  };

  const previewTotal = useMemo(
    () => activeEmployees.reduce((sum, e) => sum + grossSalary(e), 0),
    [activeEmployees],
  );

  const runPayroll = () => {
    setRunError("");
    if (alreadyRun) {
      setRunError("تم تشغيل الرواتب لهذه الفترة مسبقاً");
      return;
    }
    if (activeEmployees.length === 0) {
      setRunError("لا يوجد موظفون فعّالون لتشغيل الرواتب لهم");
      return;
    }
    const now = new Date().toISOString();
    const runDate = new Date().toISOString().slice(0, 10);
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const runId = `pr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const expenseByAccount = new Map<string, number>();
    const payableByAccount = new Map<string, number>();
    const newPayslips: Payslip[] = [];
    for (const emp of activeEmployees) {
      const gross = grossSalary(emp);
      expenseByAccount.set(
        emp.salaryExpenseAccountId,
        (expenseByAccount.get(emp.salaryExpenseAccountId) || 0) + gross,
      );
      payableByAccount.set(
        emp.salaryPayableAccountId,
        (payableByAccount.get(emp.salaryPayableAccountId) || 0) + gross,
      );
      newPayslips.push({
        id: `ps-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${emp.id}`,
        payrollRunId: runId,
        employeeId: emp.id,
        employeeName: emp.name,
        periodLabel: period,
        basicSalary: emp.basicSalary,
        allowances: emp.allowances.map((a) => ({ ...a })),
        grossSalary: gross,
        createdAt: now,
      });
    }

    const lines = [
      ...Array.from(expenseByAccount.entries()).map(([accountId, amount], idx) => ({
        id: `l-${journalEntryId}-exp-${idx}`,
        accountId,
        debit: amount,
        credit: 0,
      })),
      ...Array.from(payableByAccount.entries()).map(([accountId, amount], idx) => ({
        id: `l-${journalEntryId}-pay-${idx}`,
        accountId,
        debit: 0,
        credit: amount,
      })),
    ];

    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: runDate,
      description: `استحقاق رواتب فترة ${fmtPeriodLabel(period)} — ${activeEmployees.length} موظف`,
      reference: period,
      lines,
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };

    const newRun: PayrollRun = {
      id: runId,
      periodLabel: period,
      runDate,
      totalGross: previewTotal,
      journalEntryId,
      payableBreakdown: Array.from(payableByAccount.entries()).map(([accountId, amount]) => ({
        accountId,
        amount,
      })),
      paid: false,
      createdAt: now,
      createdBy: currentUserName,
    };

    setEntries((prev) => [...prev, newEntry]);
    setPayslips((prev) => [...prev, ...newPayslips]);
    setRuns((prev) => [...prev, newRun]);
  };

  const openPayment = (run: PayrollRun) => {
    setPaymentError("");
    setPayingAccountId("");
    setPayingRunId(run.id);
  };

  const confirmPayment = (run: PayrollRun) => {
    if (!payingAccountId) {
      setPaymentError("يرجى اختيار الحساب الذي دُفعت منه الرواتب");
      return;
    }
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const lines = [
      ...run.payableBreakdown.map((b, idx) => ({
        id: `l-${journalEntryId}-pay-${idx}`,
        accountId: b.accountId,
        debit: b.amount,
        credit: 0,
      })),
      {
        id: `l-${journalEntryId}-cash`,
        accountId: payingAccountId,
        debit: 0,
        credit: run.totalGross,
      },
    ];
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: new Date().toISOString().slice(0, 10),
      description: `سداد رواتب فترة ${fmtPeriodLabel(run.periodLabel)}`,
      reference: run.periodLabel,
      lines,
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    setEntries((prev) => [...prev, newEntry]);
    setRuns((prev) =>
      prev.map((r) =>
        r.id === run.id
          ? {
              ...r,
              paid: true,
              paidAt: now,
              paymentJournalEntryId: journalEntryId,
              payingAccountId,
            }
          : r,
      ),
    );
    setPayingRunId(null);
  };

  const sortedRuns = useMemo(
    () => [...runs].sort((a, b) => (a.periodLabel < b.periodLabel ? 1 : -1)),
    [runs],
  );
  const viewingRun = runs.find((r) => r.id === viewingRunId) || null;
  const viewingPayslips = viewingRun
    ? payslips.filter((p) => p.payrollRunId === viewingRun.id)
    : [];
  const payingRun = runs.find((r) => r.id === payingRunId) || null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">تشغيل الرواتب الشهري</h2>
        <p className="text-xs text-slate-500">
          يولّد قسيمة راتب لكل موظف فعّال وقيداً محاسبياً واحداً مجمّعاً عن الفترة المختارة
        </p>
      </div>

      <div className="app-card p-5 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">الفترة (شهر)</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={inputCls}
            />
          </div>
          {alreadyRun && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 size={14} /> تم تشغيل الرواتب لهذه الفترة مسبقاً
            </div>
          )}
        </div>

        {runError && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            <AlertTriangle size={14} /> {runError}
          </div>
        )}

        {!alreadyRun && (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 bg-slate-50/70">
                  <th className="px-3 py-2 text-right font-semibold">الموظف</th>
                  <th className="px-3 py-2 text-right font-semibold">الراتب الأساسي</th>
                  <th className="px-3 py-2 text-right font-semibold">البدلات</th>
                  <th className="px-3 py-2 text-right font-semibold">إجمالي الراتب</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map((e) => (
                  <tr key={e.id} className="border-t border-slate-50">
                    <td className="px-3 py-2">{e.name}</td>
                    <td className="px-3 py-2 font-mono">{fmtMoney(e.basicSalary)}</td>
                    <td className="px-3 py-2 font-mono">
                      {fmtMoney(allowancesTotal(e.allowances))}
                    </td>
                    <td className="px-3 py-2 font-mono font-semibold">
                      {fmtMoney(grossSalary(e))}
                    </td>
                  </tr>
                ))}
                {activeEmployees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-xs text-slate-500">
                      لا يوجد موظفون فعّالون
                    </td>
                  </tr>
                )}
              </tbody>
              {activeEmployees.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-200 font-bold text-slate-800">
                    <td className="px-3 py-2" colSpan={3}>
                      الإجمالي
                    </td>
                    <td className="px-3 py-2 font-mono">{fmtMoney(previewTotal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {canRun && !alreadyRun && (
          <button
            onClick={runPayroll}
            disabled={activeEmployees.length === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm disabled:opacity-40"
          >
            <PlayCircle size={16} /> تشغيل الرواتب وترحيل القيد ({activeEmployees.length} موظف)
          </button>
        )}
      </div>

      <div className="app-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <p className="text-xs font-semibold text-slate-500">سجل تشغيلات الرواتب السابقة</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100">
                <th className="px-4 py-2.5 font-semibold">الفترة</th>
                <th className="px-4 py-2.5 font-semibold">تاريخ التشغيل</th>
                <th className="px-4 py-2.5 font-semibold">إجمالي الرواتب</th>
                <th className="px-4 py-2.5 font-semibold">حالة السداد</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {sortedRuns.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 text-slate-800">{fmtPeriodLabel(r.periodLabel)}</td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    {fmtDateLabel(r.runDate)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(r.totalGross)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        r.paid
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15"
                      }`}
                    >
                      {r.paid ? "تم السداد" : "لم يُسدَّد بعد"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setViewingRunId(r.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="عرض قسائم الرواتب"
                      >
                        <Eye size={14} />
                      </button>
                      {!r.paid && canRecordPayment && (
                        <button
                          onClick={() => openPayment(r)}
                          className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <CreditCard size={13} /> تسجيل السداد
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedRuns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد تشغيلات رواتب منفّذة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingRun && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingRunId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                قسائم رواتب فترة {fmtPeriodLabel(viewingRun.periodLabel)}
              </h3>
              <button
                onClick={() => setViewingRunId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {viewingPayslips.map((p) => (
                <div key={p.id} className="border border-slate-100 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-slate-800">{p.employeeName}</p>
                    <p className="font-mono font-bold text-slate-900">{fmtMoney(p.grossSalary)}</p>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>الراتب الأساسي: {fmtMoney(p.basicSalary)}</span>
                    <span>البدلات: {fmtMoney(allowancesTotal(p.allowances))}</span>
                  </div>
                  {p.allowances.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.allowances.map((a) => (
                        <span
                          key={a.id}
                          className="text-[11px] bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5 text-slate-600"
                        >
                          {a.label}: {fmtMoney(a.amount)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {viewingPayslips.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  لا توجد قسائم لهذا التشغيل
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {payingRun && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPayingRunId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                تسجيل سداد رواتب فترة {fmtPeriodLabel(payingRun.periodLabel)}
              </h3>
              <button
                onClick={() => setPayingRunId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            {paymentError && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {paymentError}
              </div>
            )}
            <p className="text-sm text-slate-600">
              إجمالي المبلغ المطلوب سداده:{" "}
              <span className="font-mono font-bold text-slate-900">
                {fmtMoney(payingRun.totalGross)}
              </span>
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                دُفع من حساب
              </label>
              <select
                value={payingAccountId}
                onChange={(e) => setPayingAccountId(e.target.value)}
                className={inputCls}
              >
                <option value="">اختر الحساب…</option>
                {assetTypeAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setPayingRunId(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={() => confirmPayment(payingRun)}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                تأكيد السداد وترحيل القيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
