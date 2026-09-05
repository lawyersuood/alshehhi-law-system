import React, { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { SalesInvoice, SalesPayment, amountDue as salesAmountDue } from "./salesTypes";
import { Vendor, PurchaseInvoice, PurchasePayment, amountDue as purchaseAmountDue } from "./purchaseTypes";
import { AgingBucket, AGING_BUCKET_LABELS, agingBucketFor, fmtMoney, fmtDateLabel } from "./reportHelpers";

const BUCKET_ORDER: AgingBucket[] = ["current", "d1_30", "d31_60", "d61_90", "d90_plus"];

interface AgingRow {
  id: string;
  number: string;
  partyName: string;
  dueDate: string;
  bucket: AgingBucket;
  amount: number;
}

function BucketSummaryTable({ title, rows }: { title: string; rows: AgingRow[] }) {
  const totalsByBucket = useMemo(() => {
    const totals: Record<AgingBucket, number> = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0 };
    for (const r of rows) totals[r.bucket] += r.amount;
    return totals;
  }, [rows]);
  const grandTotal = BUCKET_ORDER.reduce((s, b) => s + totalsByBucket[b], 0);

  return (
    <div className="app-card overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-xs text-slate-500 border-b border-slate-100">
              {BUCKET_ORDER.map((b) => (
                <th key={b} className="px-4 py-2.5 font-semibold whitespace-nowrap">
                  {AGING_BUCKET_LABELS[b]}
                </th>
              ))}
              <th className="px-4 py-2.5 font-semibold">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {BUCKET_ORDER.map((b) => (
                <td key={b} className="px-4 py-2.5 font-mono">
                  {totalsByBucket[b] ? fmtMoney(totalsByBucket[b]) : "—"}
                </td>
              ))}
              <td className="px-4 py-2.5 font-mono font-bold">{fmtMoney(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailTable({ rows }: { rows: AgingRow[] }) {
  return (
    <div className="app-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
              <th className="px-4 py-2.5 font-semibold">الرقم</th>
              <th className="px-4 py-2.5 font-semibold">الجهة</th>
              <th className="px-4 py-2.5 font-semibold">تاريخ الاستحقاق</th>
              <th className="px-4 py-2.5 font-semibold">الشريحة</th>
              <th className="px-4 py-2.5 font-semibold">المبلغ المستحق</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5 font-mono text-slate-700">{r.number}</td>
                <td className="px-4 py-2.5 text-slate-800">{r.partyName}</td>
                <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{fmtDateLabel(r.dueDate)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      r.bucket === "current"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : r.bucket === "d90_plus"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {AGING_BUCKET_LABELS[r.bucket]}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono">{fmtMoney(r.amount)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                  لا توجد أرصدة مستحقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AgedReceivablesPayables({
  salesInvoices,
  salesPayments,
  vendors,
  purchaseInvoices,
  purchasePayments,
}: {
  salesInvoices: SalesInvoice[];
  salesPayments: SalesPayment[];
  vendors: Vendor[];
  purchaseInvoices: PurchaseInvoice[];
  purchasePayments: PurchasePayment[];
}) {
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const receivableRows = useMemo(() => {
    const rows: AgingRow[] = [];
    for (const inv of salesInvoices) {
      if (inv.status !== "approved") continue;
      const due = salesAmountDue(inv, salesPayments);
      if (due <= 0.005) continue;
      const refDate = inv.dueDate || inv.date;
      rows.push({ id: inv.id, number: inv.invoiceNumber, partyName: inv.clientName, dueDate: refDate, bucket: agingBucketFor(refDate, asOf), amount: due });
    }
    return rows.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  }, [salesInvoices, salesPayments, asOf]);

  const payableRows = useMemo(() => {
    const rows: AgingRow[] = [];
    for (const bill of purchaseInvoices) {
      if (bill.status !== "approved") continue;
      const due = purchaseAmountDue(bill, purchasePayments);
      if (due <= 0.005) continue;
      const refDate = bill.dueDate || bill.date;
      const vendorName = vendors.find((v) => v.id === bill.vendorId)?.name || "—";
      rows.push({ id: bill.id, number: bill.billNumber, partyName: vendorName, dueDate: refDate, bucket: agingBucketFor(refDate, asOf), amount: due });
    }
    return rows.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  }, [purchaseInvoices, purchasePayments, vendors, asOf]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">أعمار الذمم المدينة والدائنة</h2>
        <p className="text-xs text-slate-500">تصنيف الفواتير المعتمدة غير المسدّدة بالكامل حسب عدد أيام التأخير عن تاريخ الاستحقاق</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">كما في تاريخ</label>
        <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Clock size={16} className="text-slate-400" /> الذمم المدينة (مستحقات على العملاء)
        </div>
        <BucketSummaryTable title="ملخص أعمار الذمم المدينة" rows={receivableRows} />
        <DetailTable rows={receivableRows} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Clock size={16} className="text-slate-400" /> الذمم الدائنة (مستحقات للموردين)
        </div>
        <BucketSummaryTable title="ملخص أعمار الذمم الدائنة" rows={payableRows} />
        <DetailTable rows={payableRows} />
      </div>
    </div>
  );
}
