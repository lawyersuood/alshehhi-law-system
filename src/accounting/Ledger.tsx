import React, { useMemo, useState } from "react";
import { Account, JournalEntry } from "./types";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const fmtDateLabel = (d: string) => (d ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }) : "—");

// الحسابات ذات الرصيد الطبيعي مدين (أصول ومصروفات) مقابل دائن (التزامات وحقوق ملكية وإيرادات)
const isDebitNature = (type: Account["type"]) => type === "asset" || type === "expense";

export default function Ledger({ accounts, entries }: { accounts: Account[]; entries: JournalEntry[] }) {
  const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const [accountId, setAccountId] = useState<string>(sortedAccounts[0]?.id || "");

  const account = accounts.find((a) => a.id === accountId);

  const rows = useMemo(() => {
    if (!account) return [];
    const movements: Array<{ date: string; entryNumber: string; description: string; debit: number; credit: number; status: JournalEntry["status"] }> = [];
    for (const e of entries) {
      if (e.status !== "posted") continue;
      for (const l of e.lines) {
        if (l.accountId !== accountId) continue;
        movements.push({ date: e.date, entryNumber: e.entryNumber, description: l.description || e.description, debit: l.debit, credit: l.credit, status: e.status });
      }
    }
    movements.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.entryNumber.localeCompare(b.entryNumber)));
    let running = 0;
    const debitNature = isDebitNature(account.type);
    return movements.map((m) => {
      running += debitNature ? m.debit - m.credit : m.credit - m.debit;
      return { ...m, balance: running };
    });
  }, [account, accountId, entries]);

  const totals = rows.reduce(
    (acc, r) => ({ debit: acc.debit + r.debit, credit: acc.credit + r.credit }),
    { debit: 0, credit: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">دفتر الأستاذ</h2>
        <p className="text-xs text-slate-500">كشف حركة القيود المرحّلة على مستوى الحساب الواحد مع الرصيد التراكمي</p>
      </div>

      <div className="max-w-md">
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputCls}>
          <option value="">اختر الحساب…</option>
          {sortedAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name}
            </option>
          ))}
        </select>
      </div>

      {account && (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                  <th className="px-4 py-2.5 font-semibold">التاريخ</th>
                  <th className="px-4 py-2.5 font-semibold">رقم القيد</th>
                  <th className="px-4 py-2.5 font-semibold">البيان</th>
                  <th className="px-4 py-2.5 font-semibold">مدين</th>
                  <th className="px-4 py-2.5 font-semibold">دائن</th>
                  <th className="px-4 py-2.5 font-semibold">الرصيد</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{fmtDateLabel(r.date)}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{r.entryNumber}</td>
                    <td className="px-4 py-2.5 text-slate-800">{r.description}</td>
                    <td className="px-4 py-2.5 font-mono">{r.debit ? fmtMoney(r.debit) : "—"}</td>
                    <td className="px-4 py-2.5 font-mono">{r.credit ? fmtMoney(r.credit) : "—"}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">{fmtMoney(r.balance)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                      لا توجد حركات مرحّلة على هذا الحساب بعد
                    </td>
                  </tr>
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50/70 font-semibold text-slate-800">
                    <td className="px-4 py-2.5" colSpan={3}>الإجمالي</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.debit)}</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.credit)}</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(rows[rows.length - 1]?.balance || 0)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
