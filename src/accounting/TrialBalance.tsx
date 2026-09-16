import React, { useMemo } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Account, ACCOUNT_TYPE_LABELS, JournalEntry } from "./types";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const isDebitNature = (type: Account["type"]) => type === "asset" || type === "expense";

export default function TrialBalance({
  accounts,
  entries,
}: {
  accounts: Account[];
  entries: JournalEntry[];
}) {
  const rows = useMemo(() => {
    const balances = new Map<string, { debitMovements: number; creditMovements: number }>();
    for (const e of entries) {
      if (e.status !== "posted") continue;
      for (const l of e.lines) {
        const cur = balances.get(l.accountId) || { debitMovements: 0, creditMovements: 0 };
        cur.debitMovements += l.debit || 0;
        cur.creditMovements += l.credit || 0;
        balances.set(l.accountId, cur);
      }
    }
    return accounts
      .map((a) => {
        const mv = balances.get(a.id);
        if (!mv) return null;
        const net = isDebitNature(a.type)
          ? mv.debitMovements - mv.creditMovements
          : mv.creditMovements - mv.debitMovements;
        const debitCol = isDebitNature(a.type) ? Math.max(net, 0) : Math.max(-net, 0);
        const creditCol = isDebitNature(a.type) ? Math.max(-net, 0) : Math.max(net, 0);
        if (debitCol === 0 && creditCol === 0) return null;
        return { account: a, debitCol, creditCol };
      })
      .filter((r): r is { account: Account; debitCol: number; creditCol: number } => r !== null)
      .sort((a, b) => a.account.code.localeCompare(b.account.code));
  }, [accounts, entries]);

  const totals = rows.reduce(
    (acc, r) => ({ debit: acc.debit + r.debitCol, credit: acc.credit + r.creditCol }),
    { debit: 0, credit: 0 },
  );
  const balanced = Math.abs(totals.debit - totals.credit) < 0.005;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">ميزان المراجعة</h2>
        <p className="text-xs text-slate-500">
          إجمالي أرصدة الحسابات المرحّلة حتى تاريخه — يجب أن يتساوى إجمالي المدين مع إجمالي الدائن
        </p>
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">الرقم</th>
                <th className="px-4 py-2.5 font-semibold">اسم الحساب</th>
                <th className="px-4 py-2.5 font-semibold">النوع</th>
                <th className="px-4 py-2.5 font-semibold">مدين</th>
                <th className="px-4 py-2.5 font-semibold">دائن</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.account.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{r.account.code}</td>
                  <td className="px-4 py-2.5 text-slate-800">{r.account.name}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    {ACCOUNT_TYPE_LABELS[r.account.type]}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {r.debitCol ? fmtMoney(r.debitCol) : "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {r.creditCol ? fmtMoney(r.creditCol) : "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد قيود مرحّلة بعد لعرض ميزان المراجعة
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/70 font-semibold text-slate-800">
                  <td className="px-4 py-2.5" colSpan={3}>
                    الإجمالي
                  </td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.debit)}</td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.credit)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {rows.length > 0 && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${balanced ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
        >
          {balanced ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {balanced
            ? "ميزان المراجعة متوازن"
            : "تنبيه: ميزان المراجعة غير متوازن — يرجى مراجعة القيود"}
        </div>
      )}
    </div>
  );
}
