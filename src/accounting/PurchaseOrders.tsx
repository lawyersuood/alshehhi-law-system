import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, CheckCircle2, ArrowLeftRight, Ban } from "lucide-react";
import { Account } from "./types";
import { PurchaseLineItem, PurchaseInvoice, Vendor, purchaseTotals } from "./purchaseTypes";
import { PurchaseOrder, PurchaseOrderStatus, PURCHASE_ORDER_STATUS_LABELS } from "./purchaseOrderTypes";
import { nextBillNumber } from "./storage";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

function emptyLine(): PurchaseLineItem {
  return { id: `pol-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, description: "", quantity: 1, unitPrice: 0, vatRate: 5, accountId: "" };
}

function nextOrderNumber(existing: PurchaseOrder[]): string {
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;
  let max = 0;
  for (const o of existing) {
    if (o.orderNumber?.startsWith(prefix)) {
      const n = parseInt(o.orderNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

interface DraftForm {
  date: string;
  expectedDate: string;
  vendorId: string;
  notes: string;
  lines: PurchaseLineItem[];
}

function newDraft(): DraftForm {
  return { date: new Date().toISOString().slice(0, 10), expectedDate: "", vendorId: "", notes: "", lines: [emptyLine()] };
}

const STATUS_BADGE: Record<PurchaseOrderStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-amber-50 text-amber-700",
  fulfilled: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  converted: "bg-[#0D382B]/[0.08] text-[#0D382B]",
};

export default function PurchaseOrders({
  accounts,
  orders,
  setOrders,
  vendors,
  bills,
  setBills,
  canManage,
  currentUserName,
}: {
  accounts: Account[];
  orders: PurchaseOrder[];
  setOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  vendors: Vendor[];
  bills: PurchaseInvoice[];
  setBills: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
  canManage: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const expenseAccounts = useMemo(() => accounts.filter((a) => a.isActive && a.type === "expense").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name || "—";

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.orderNumber.localeCompare(a.orderNumber))),
    [orders]
  );

  const openNew = () => {
    setError("");
    setDraft(newDraft());
    setShowForm(true);
  };

  const updateLine = (id: string, patch: Partial<PurchaseLineItem>) =>
    setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const addLine = () => setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] }));
  const removeLine = (id: string) => setDraft((d) => (d.lines.length > 1 ? { ...d, lines: d.lines.filter((l) => l.id !== id) } : d));

  const draftTotals = purchaseTotals(draft);

  const saveDraft = () => {
    if (!draft.vendorId) {
      setError("يرجى اختيار المورد");
      return;
    }
    const validLines = draft.lines.filter((l) => l.description.trim() && l.quantity > 0 && l.accountId);
    if (validLines.length === 0) {
      setError("يجب إدخال بند واحد على الأقل ببيان وكمية وحساب مصروف مرتبط");
      return;
    }
    setOrders((prev) => [
      ...prev,
      {
        id: `po-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        orderNumber: nextOrderNumber(orders),
        date: draft.date,
        expectedDate: draft.expectedDate || undefined,
        vendorId: draft.vendorId,
        lines: validLines,
        notes: draft.notes.trim() || undefined,
        status: "draft",
        createdAt: new Date().toISOString(),
        createdBy: currentUserName,
      },
    ]);
    setShowForm(false);
  };

  const setStatus = (o: PurchaseOrder, status: PurchaseOrderStatus) => setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status } : x)));

  const convertToBill = (o: PurchaseOrder) => {
    const newBillId = `bill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setBills((prev) => [
      ...prev,
      {
        id: newBillId,
        billNumber: nextBillNumber(bills),
        vendorId: o.vendorId,
        date: new Date().toISOString().slice(0, 10),
        lines: o.lines.map((l) => ({ ...l, id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
        notes: `بناءً على أمر الشراء ${o.orderNumber}`,
        status: "draft",
        createdAt: new Date().toISOString(),
        createdBy: currentUserName,
      },
    ]);
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: "converted", convertedBillId: newBillId } : x)));
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setOrders((prev) => prev.filter((o) => o.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">أوامر الشراء</h2>
          <p className="text-xs text-slate-500">طلب شراء أولي للمورد قبل استلام الفاتورة الرسمية — {orders.length} أمر مسجّل</p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> أمر شراء جديد
          </button>
        )}
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/60 border-b border-slate-200 bg-[#0D382B]/[0.02]">
              <th className="px-4 py-1.5 font-bold">رقم الأمر</th>
              <th className="px-4 py-1.5 font-bold">المورد</th>
              <th className="px-4 py-1.5 font-bold">التاريخ</th>
              <th className="px-4 py-1.5 font-bold">الإجمالي</th>
              <th className="px-4 py-1.5 font-bold">الحالة</th>
              <th className="px-4 py-1.5 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  لا توجد أوامر شراء مسجّلة بعد
                </td>
              </tr>
            )}
            {sortedOrders.map((o) => {
              const totals = purchaseTotals(o);
              return (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-[#0D382B]/[0.02] transition-colors">
                  <td className="px-4 py-1.5 font-mono text-slate-700">{o.orderNumber}</td>
                  <td className="px-4 py-1.5 text-slate-800 font-medium">{vendorName(o.vendorId)}</td>
                  <td className="px-4 py-1.5 text-slate-600">{o.date}</td>
                  <td className="px-4 py-1.5 font-bold text-slate-800">{fmtMoney(totals.grandTotal)}</td>
                  <td className="px-4 py-1.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[o.status]}`}>
                      {PURCHASE_ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {canManage && (o.status === "draft" || o.status === "sent") && (
                        <button onClick={() => setStatus(o, "fulfilled")} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                          <CheckCircle2 size={13} /> تم التوريد
                        </button>
                      )}
                      {canManage && o.status === "fulfilled" && (
                        <button onClick={() => convertToBill(o)} className="text-xs font-bold text-[#C5A059] hover:underline flex items-center gap-1">
                          <ArrowLeftRight size={13} /> تحويل لفاتورة
                        </button>
                      )}
                      {canManage && o.status !== "converted" && (
                        <button onClick={() => requestDelete(o.id)} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="app-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#0D382B]">أمر شراء جديد</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {error && <div className="rounded-xl bg-rose-50 text-rose-700 text-sm px-4 py-2.5">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">المورد *</label>
                <select className={inputCls} value={draft.vendorId} onChange={(e) => setDraft((d) => ({ ...d, vendorId: e.target.value }))}>
                  <option value="">تحديد</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ التوريد المتوقع</label>
                <input type="date" className={inputCls} value={draft.expectedDate} onChange={(e) => setDraft((d) => ({ ...d, expectedDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ الأمر</label>
                <input type="date" className={inputCls} value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">بنود الأمر</label>
                <button onClick={addLine} className="text-xs font-bold text-[#0D382B] hover:underline flex items-center gap-1">
                  <Plus size={13} /> إضافة بند
                </button>
              </div>
              {draft.lines.map((l) => (
                <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className={`${inputCls} col-span-5`}
                    placeholder="وصف الصنف / الخدمة"
                    value={l.description}
                    onChange={(e) => updateLine(l.id, { description: e.target.value })}
                  />
                  <input
                    type="number"
                    className={`${inputCls} col-span-2`}
                    placeholder="الكمية"
                    value={l.quantity}
                    onChange={(e) => updateLine(l.id, { quantity: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    className={`${inputCls} col-span-2`}
                    placeholder="السعر"
                    value={l.unitPrice}
                    onChange={(e) => updateLine(l.id, { unitPrice: Number(e.target.value) })}
                  />
                  <select className={`${inputCls} col-span-2`} value={l.accountId} onChange={(e) => updateLine(l.id, { accountId: e.target.value })}>
                    <option value="">الحساب</option>
                    {expenseAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => removeLine(l.id)} className="col-span-1 text-rose-500 hover:text-rose-700 flex justify-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">ملاحظات</label>
              <textarea className={inputCls} rows={2} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="text-sm text-slate-500">
                إجمالي الأمر: <span className="font-black text-[#0D382B] text-base">{fmtMoney(draftTotals.grandTotal)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">
                  إلغاء
                </button>
                <button onClick={saveDraft} className="rounded-xl bg-[#0D382B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors">
                  حفظ الأمر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="app-card w-full max-w-sm p-6 space-y-4 text-center">
            <Ban className="mx-auto text-rose-500" size={28} />
            <p className="text-sm text-slate-700">هل تريد حذف أمر الشراء هذا نهائياً؟</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50">
                تراجع
              </button>
              <button onClick={confirmDelete} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
