import React, { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { accountBalanceAsOf, netBalance, fmtMoney } from "./reportHelpers";

export default function BalanceSheet({ accounts, entries }: { accounts: Account[]; entries: JournalEntry[] }) {
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const { assetRows, liabilityRows, equityRows, totalAssets, totalLiabilities, totalEquity, retainedEarnings } = useMemo(() => {
    const assetRows: Array<{ account: Account; amount: number }> = [];
    const liabilityRows: Array<{ account: Account; amount: number }> = [];
    const equityRows: Array<{ account: Account; amount: number }> = [];
    let retainedEarnings = 0;
    for (const a of accounts) {
      const mv = accountBalanceAsOf(a.id, entries, asOf);
      const amount = netBalance(a.type, mv);
      if (a.type === "revenue" || a.type === "expense") {
        // صافي الدخل المتراكم منذ بداية النظام وحتى هذا التاريخ يُرحّل ضمن حقوق الملكية (الأرباح المرحّلة)
        // لعدم وجود آلية إقفال دورية للحسابات في هذه المرحلة
        retainedEarnings += a.type === "revenue" ? amount : -amount;
        continue;
      }
      if (Math.abs(amount) < 0.005) continue;
      if (a.type === "asset") assetRows.push({ account: a, amount });
      else if (a.type === "liability") liabilityRows.push({ account: a, amount });
      else equityRows.push({ account: a, amount });
    }
    assetRows.sort((x, y) => x.account.code.localeCompare(y.account.code));
    liabilityRows.sort((x, y) => x.account.code.localeCompare(y.account.code));
    equityRows.sort((x, y) => x.account.code.localeCompare(y.account.code));
    const totalAssets = assetRows.reduce((s, r) => s + r.amount, 0);
    const totalLiabilities = liabilityRows.reduce((s, r) => s + r.amount, 0);
    const totalEquity = equityRows.reduce((s, r) => s + r.amount, 0) + retainedEarnings;
    return { assetRows, liabilityRows, equityRows, totalAssets, totalLiabilities, totalEquity, retainedEarnings };
  }, [accounts, entries, asOf]);

  const balanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.005;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">الميزانية العمومية</h2>
        <p className="text-xs text-slate-500">أرصدة الأصول والالتزامات وحقوق الملكية كما في تاريخ معيّن</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">كما في تاريخ</label>
        <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="app-card overflow-hidden self-start">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <p className="text-xs font-semibold text-slate-500">الأصول</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {assetRows.map((r) => (
                  <tr key={r.account.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 font-mono text-xs text-slate-500 w-20">{r.account.code}</td>
                    <td className="px-4 py-2 text-slate-800">{r.account.name}</td>
                    <td className="px-4 py-2 font-mono text-left">{fmtMoney(r.amount)}</td>
                  </tr>
                ))}
                {assetRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-xs text-slate-500">
                      لا توجد أرصدة أصول
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 font-semibold text-slate-800">
                  <td className="px-4 py-2" colSpan={2}>
                    إجمالي الأصول
                  </td>
                  <td className="px-4 py-2 font-mono text-left">{fmtMoney(totalAssets)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="app-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <p className="text-xs font-semibold text-slate-500">الالتزامات</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {liabilityRows.map((r) => (
                    <tr key={r.account.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-2 font-mono text-xs text-slate-500 w-20">{r.account.code}</td>
                      <td className="px-4 py-2 text-slate-800">{r.account.name}</td>
                      <td className="px-4 py-2 font-mono text-left">{fmtMoney(r.amount)}</td>
                    </tr>
                  ))}
                  {liabilityRows.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-xs text-slate-500">
                        لا توجد التزامات
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 font-semibold text-slate-800">
                    <td className="px-4 py-2" colSpan={2}>
                      إجمالي الالتزامات
                    </td>
                    <td className="px-4 py-2 font-mono text-left">{fmtMoney(totalLiabilities)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="app-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <p className="text-xs font-semibold text-slate-500">حقوق الملكية</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {equityRows.map((r) => (
                    <tr key={r.account.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-2 font-mono text-xs text-slate-500 w-20">{r.account.code}</td>
                      <td className="px-4 py-2 text-slate-800">{r.account.name}</td>
                      <td className="px-4 py-2 font-mono text-left">{fmtMoney(r.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-50 last:border-0 bg-[#0D382B]/[0.05]/40">
                    <td className="px-4 py-2 font-mono text-xs text-slate-500 w-20">—</td>
                    <td className="px-4 py-2 text-slate-800">الأرباح المرحّلة (صافي الدخل المتراكم)</td>
                    <td className="px-4 py-2 font-mono text-left">{fmtMoney(retainedEarnings)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 font-semibold text-slate-800">
                    <td className="px-4 py-2" colSpan={2}>
                      إجمالي حقوق الملكية
                    </td>
                    <td className="px-4 py-2 font-mono text-left">{fmtMoney(totalEquity)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${balanced ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
        {balanced ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        {balanced ? "الميزانية متوازنة: الأصول = الالتزامات + حقوق الملكية" : "تنبيه: الميزانية غير متوازنة — يرجى مراجعة القيود"}
      </div>
    </div>
  );
}
