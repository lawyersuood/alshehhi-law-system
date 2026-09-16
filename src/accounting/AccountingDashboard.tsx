import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { BankAccount, BankTransaction, computeBankBalance } from "./bankTypes";
import {
  SalesInvoice,
  SalesPayment,
  invoiceTotals,
  amountDue as salesAmountDue,
} from "./salesTypes";
import {
  Vendor,
  PurchaseInvoice,
  PurchasePayment,
  purchaseTotals,
  amountDue as purchaseAmountDue,
} from "./purchaseTypes";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);

const todayStr = () => new Date().toISOString().slice(0, 10);

function monthLabel(offset: number): { key: string; label: string } {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - offset);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const label = d.toLocaleDateString("ar-AE", { month: "short" });
  return { key, label };
}

export default function AccountingDashboard({
  accounts,
  entries,
  bankAccounts,
  transactions,
  salesInvoices,
  salesPayments,
  vendors,
  purchaseInvoices,
  purchasePayments,
}: {
  accounts: Account[];
  entries: JournalEntry[];
  bankAccounts: BankAccount[];
  transactions: BankTransaction[];
  salesInvoices: SalesInvoice[];
  salesPayments: SalesPayment[];
  vendors: Vendor[];
  purchaseInvoices: PurchaseInvoice[];
  purchasePayments: PurchasePayment[];
}) {
  const accountTypeMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.type])), [accounts]);

  const postedEntries = useMemo(() => entries.filter((e) => e.status === "posted"), [entries]);

  const { totalRevenue, totalExpense } = useMemo(() => {
    let rev = 0;
    let exp = 0;
    for (const e of postedEntries) {
      for (const l of e.lines) {
        const t = accountTypeMap.get(l.accountId);
        if (t === "revenue") rev += l.credit - l.debit;
        if (t === "expense") exp += l.debit - l.credit;
      }
    }
    return { totalRevenue: rev, totalExpense: exp };
  }, [postedEntries, accountTypeMap]);

  const netProfit = totalRevenue - totalExpense;

  const cashBalance = useMemo(
    () =>
      bankAccounts
        .filter((b) => b.isActive)
        .reduce((sum, b) => sum + computeBankBalance(b, transactions), 0),
    [bankAccounts, transactions],
  );

  // آخر 6 أشهر: إيرادات ومصروفات مجمّعة شهرياً من القيود المرحّلة
  const monthlySeries = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => monthLabel(5 - i));
    const map = new Map(months.map((m) => [m.key, { revenue: 0, expense: 0 }]));
    for (const e of postedEntries) {
      const key = e.date?.slice(0, 7);
      if (!map.has(key)) continue;
      const bucket = map.get(key)!;
      for (const l of e.lines) {
        const t = accountTypeMap.get(l.accountId);
        if (t === "revenue") bucket.revenue += l.credit - l.debit;
        if (t === "expense") bucket.expense += l.debit - l.credit;
      }
    }
    return months.map((m) => ({ ...m, ...map.get(m.key)! }));
  }, [postedEntries, accountTypeMap]);

  const maxSeriesValue = Math.max(1, ...monthlySeries.flatMap((m) => [m.revenue, m.expense]));

  const overdueSales = useMemo(() => {
    const today = todayStr();
    return salesInvoices
      .filter(
        (inv) =>
          inv.status === "approved" &&
          inv.dueDate &&
          inv.dueDate < today &&
          salesAmountDue(inv, salesPayments) > 0.01,
      )
      .map((inv) => ({ inv, due: salesAmountDue(inv, salesPayments) }))
      .sort((a, b) => b.due - a.due)
      .slice(0, 5);
  }, [salesInvoices, salesPayments]);

  const overduePurchases = useMemo(() => {
    const today = todayStr();
    return purchaseInvoices
      .filter(
        (b) =>
          b.status === "approved" &&
          b.dueDate &&
          b.dueDate < today &&
          purchaseAmountDue(b, purchasePayments) > 0.01,
      )
      .map((b) => ({
        b,
        due: purchaseAmountDue(b, purchasePayments),
        vendor: vendors.find((v) => v.id === b.vendorId)?.name || "—",
      }))
      .sort((a, b2) => b2.due - a.due)
      .slice(0, 5);
  }, [purchaseInvoices, purchasePayments, vendors]);

  const kpis = [
    {
      label: "إجمالي الإيرادات",
      value: totalRevenue,
      icon: TrendingUp,
      tone: "text-[#0D382B] bg-[#0D382B]/[0.08]",
    },
    {
      label: "إجمالي المصروفات",
      value: totalExpense,
      icon: TrendingDown,
      tone: "text-rose-700 bg-rose-50",
    },
    {
      label: "صافي الربح",
      value: netProfit,
      icon: Wallet,
      tone: netProfit >= 0 ? "text-[#0D382B] bg-[#C5A059]/[0.15]" : "text-rose-700 bg-rose-50",
    },
    {
      label: "الرصيد النقدي بالبنوك",
      value: cashBalance,
      icon: Wallet,
      tone: "text-slate-700 bg-slate-100",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="app-card p-4 flex flex-col gap-2">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${k.tone}`}>
              <k.icon size={17} />
            </div>
            <div className="text-[11px] font-bold text-slate-500">{k.label}</div>
            <div className="text-lg font-black text-slate-800 tabular-nums">
              {fmtMoney(k.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="app-card p-5">
        <h3 className="text-sm font-black text-[#0D382B] mb-4">
          الإيرادات والمصروفات — آخر 6 أشهر
        </h3>
        <div className="flex items-end gap-4 h-40">
          {monthlySeries.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center gap-1 h-32">
                <div
                  className="w-2.5 rounded-t bg-[#0D382B]"
                  style={{ height: `${Math.max(2, (m.revenue / maxSeriesValue) * 100)}%` }}
                  title={`إيرادات: ${fmtMoney(m.revenue)}`}
                />
                <div
                  className="w-2.5 rounded-t bg-[#C5A059]"
                  style={{ height: `${Math.max(2, (m.expense / maxSeriesValue) * 100)}%` }}
                  title={`مصروفات: ${fmtMoney(m.expense)}`}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#0D382B]" /> إيرادات
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#C5A059]" /> مصروفات
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="app-card p-5">
          <h3 className="text-sm font-black text-[#0D382B] mb-3 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500" /> أكبر فواتير بيع متأخرة
          </h3>
          {overdueSales.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">لا توجد فواتير بيع متأخرة</p>
          ) : (
            <table className="w-full text-[12px]">
              <tbody>
                {overdueSales.map(({ inv, due }) => (
                  <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-mono text-slate-600">{inv.invoiceNumber}</td>
                    <td className="py-2 text-slate-700">{inv.clientName}</td>
                    <td className="py-2 text-left font-bold text-rose-600">{fmtMoney(due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="app-card p-5">
          <h3 className="text-sm font-black text-[#0D382B] mb-3 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500" /> أكبر فواتير مشتريات متأخرة
          </h3>
          {overduePurchases.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">لا توجد فواتير مشتريات متأخرة</p>
          ) : (
            <table className="w-full text-[12px]">
              <tbody>
                {overduePurchases.map(({ b, due, vendor }) => (
                  <tr key={b.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-mono text-slate-600">{b.billNumber}</td>
                    <td className="py-2 text-slate-700">{vendor}</td>
                    <td className="py-2 text-left font-bold text-rose-600">{fmtMoney(due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
