import React, { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { BankAccount, BankTransaction } from "./bankTypes";
import { defaultPeriod, fmtMoney } from "./reportHelpers";

// رصيد حساب بنكي معيّن كما في تاريخ محدد (الرصيد الافتتاحي + كل الحركات حتى ذلك التاريخ)
function balanceAsOf(account: BankAccount, transactions: BankTransaction[], asOf: string): number {
  let balance = account.openingBalance;
  for (const t of transactions) {
    if (t.bankAccountId !== account.id) continue;
    if (t.date > asOf) continue;
    balance += t.type === "deposit" ? t.amount : -t.amount;
  }
  return balance;
}

export default function CashFlowSummary({ bankAccounts, transactions }: { bankAccounts: BankAccount[]; transactions: BankTransaction[] }) {
  const initialPeriod = useMemo(() => defaultPeriod(), []);
  const [from, setFrom] = useState(initialPeriod.from);
  const [to, setTo] = useState(initialPeriod.to);

  const dayBeforeFrom = useMemo(() => {
    const d = new Date(from + "T00:00:00");
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, [from]);

  const rows = useMemo(
    () =>
      bankAccounts.map((acc) => {
        const opening = balanceAsOf(acc, transactions, dayBeforeFrom);
        const closing = balanceAsOf(acc, transactions, to);
        const deposits = transactions
          .filter((t) => t.bankAccountId === acc.id && t.type === "deposit" && t.date >= from && t.date <= to)
          .reduce((s, t) => s + t.amount, 0);
        const withdrawals = transactions
          .filter((t) => t.bankAccountId === acc.id && t.type === "withdrawal" && t.date >= from && t.date <= to)
          .reduce((s, t) => s + t.amount, 0);
        return { account: acc, opening, closing, deposits, withdrawals, net: deposits - withdrawals };
      }),
    [bankAccounts, transactions, from, to, dayBeforeFrom]
  );

  const totals = rows.reduce(
    (acc, r) => ({
      opening: acc.opening + r.opening,
      closing: acc.closing + r.closing,
      deposits: acc.deposits + r.deposits,
      withdrawals: acc.withdrawals + r.withdrawals,
      net: acc.net + r.net,
    }),
    { opening: 0, closing: 0, deposits: 0, withdrawals: 0, net: 0 }
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">التدفق النقدي المبسّط</h2>
        <p className="text-xs text-slate-500">حركة الإيداعات والسحوبات على كل الحسابات البنكية المسجّلة خلال فترة محددة</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">من تاريخ</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">إلى تاريخ</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="app-card px-4 py-3.5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowDownCircle size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">إجمالي الإيداعات</p>
            <p className="font-mono font-bold text-slate-900">{fmtMoney(totals.deposits)}</p>
          </div>
        </div>
        <div className="app-card px-4 py-3.5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <ArrowUpCircle size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">إجمالي السحوبات</p>
            <p className="font-mono font-bold text-slate-900">{fmtMoney(totals.withdrawals)}</p>
          </div>
        </div>
        <div className="app-card px-4 py-3.5 flex items-center gap-3">
          <div className={`p-2 rounded-xl ${totals.net >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">صافي التغيّر في النقدية</p>
            <p className={`font-mono font-bold ${totals.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{fmtMoney(totals.net)}</p>
          </div>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">الحساب البنكي</th>
                <th className="px-4 py-2.5 font-semibold">الرصيد الافتتاحي</th>
                <th className="px-4 py-2.5 font-semibold">الإيداعات</th>
                <th className="px-4 py-2.5 font-semibold">السحوبات</th>
                <th className="px-4 py-2.5 font-semibold">الرصيد الختامي</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.account.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 text-slate-800">
                    {r.account.bankName} <span className="text-xs text-slate-400">— {r.account.accountLabel}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(r.opening)}</td>
                  <td className="px-4 py-2.5 font-mono text-emerald-700">{fmtMoney(r.deposits)}</td>
                  <td className="px-4 py-2.5 font-mono text-rose-700">{fmtMoney(r.withdrawals)}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold">{fmtMoney(r.closing)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد حسابات بنكية مسجّلة بعد
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/70 font-semibold text-slate-800">
                  <td className="px-4 py-2.5">الإجمالي</td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.opening)}</td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.deposits)}</td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.withdrawals)}</td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(totals.closing)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
