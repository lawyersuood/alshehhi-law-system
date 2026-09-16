import React, { useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { accountMovementInRange, netBalance, defaultPeriod, fmtMoney } from "./reportHelpers";

export default function IncomeStatement({
  accounts,
  entries,
}: {
  accounts: Account[];
  entries: JournalEntry[];
}) {
  const initialPeriod = useMemo(() => defaultPeriod(), []);
  const [from, setFrom] = useState(initialPeriod.from);
  const [to, setTo] = useState(initialPeriod.to);

  const { revenueRows, expenseRows, totalRevenue, totalExpense } = useMemo(() => {
    const revenueRows: Array<{ account: Account; amount: number }> = [];
    const expenseRows: Array<{ account: Account; amount: number }> = [];
    for (const a of accounts) {
      if (a.type !== "revenue" && a.type !== "expense") continue;
      const mv = accountMovementInRange(a.id, entries, from, to);
      const amount = netBalance(a.type, mv);
      if (Math.abs(amount) < 0.005) continue;
      if (a.type === "revenue") revenueRows.push({ account: a, amount });
      else expenseRows.push({ account: a, amount });
    }
    revenueRows.sort((x, y) => x.account.code.localeCompare(y.account.code));
    expenseRows.sort((x, y) => x.account.code.localeCompare(y.account.code));
    const totalRevenue = revenueRows.reduce((s, r) => s + r.amount, 0);
    const totalExpense = expenseRows.reduce((s, r) => s + r.amount, 0);
    return { revenueRows, expenseRows, totalRevenue, totalExpense };
  }, [accounts, entries, from, to]);

  const netIncome = totalRevenue - totalExpense;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">قائمة الدخل (الأرباح والخسائر)</h2>
        <p className="text-xs text-slate-500">
          إجمالي الإيرادات والمصروفات المرحّلة خلال فترة محددة
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">من تاريخ</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">إلى تاريخ</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <p className="text-xs font-semibold text-slate-500">الإيرادات</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {revenueRows.map((r) => (
                <tr key={r.account.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-slate-500 w-20">
                    {r.account.code}
                  </td>
                  <td className="px-4 py-2 text-slate-800">{r.account.name}</td>
                  <td className="px-4 py-2 font-mono text-left">{fmtMoney(r.amount)}</td>
                </tr>
              ))}
              {revenueRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-xs text-slate-500">
                    لا توجد إيرادات مسجّلة ضمن هذه الفترة
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold text-slate-800">
                <td className="px-4 py-2" colSpan={2}>
                  إجمالي الإيرادات
                </td>
                <td className="px-4 py-2 font-mono text-left">{fmtMoney(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <p className="text-xs font-semibold text-slate-500">المصروفات</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {expenseRows.map((r) => (
                <tr key={r.account.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-slate-500 w-20">
                    {r.account.code}
                  </td>
                  <td className="px-4 py-2 text-slate-800">{r.account.name}</td>
                  <td className="px-4 py-2 font-mono text-left">{fmtMoney(r.amount)}</td>
                </tr>
              ))}
              {expenseRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-xs text-slate-500">
                    لا توجد مصروفات مسجّلة ضمن هذه الفترة
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold text-slate-800">
                <td className="px-4 py-2" colSpan={2}>
                  إجمالي المصروفات
                </td>
                <td className="px-4 py-2 font-mono text-left">{fmtMoney(totalExpense)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div
        className={`rounded-2xl px-5 py-4 flex items-center justify-between font-bold ${
          netIncome >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        }`}
      >
        <span className="flex items-center gap-2">
          {netIncome >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          {netIncome >= 0 ? "صافي الربح" : "صافي الخسارة"}
        </span>
        <span className="font-mono">{fmtMoney(Math.abs(netIncome))}</span>
      </div>
    </div>
  );
}
