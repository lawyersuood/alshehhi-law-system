import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, Ban, PlayCircle, PauseCircle, Zap } from "lucide-react";
import { Account } from "./types";
import { InvoiceLineItem, SalesInvoice, invoiceTotals } from "./salesTypes";
import {
  RecurringInvoiceTemplate,
  RecurringFrequency,
  RecurringInvoiceStatus,
  RECURRING_FREQUENCY_LABELS,
  RECURRING_STATUS_LABELS,
  addFrequency,
} from "./recurringInvoiceTypes";
import { nextInvoiceNumber } from "./storage";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

function emptyLine(): InvoiceLineItem {
  return { id: `rl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, description: "", quantity: 1, unitPrice: 0, vatRate: 5, accountId: "" };
}

interface DraftForm {
  id?: string;
  clientName: string;
  placeOfSupply: string;
  frequency: RecurringFrequency;
  startDate: string;
  notes: string;
  lines: InvoiceLineItem[];
}

function newDraft(): DraftForm {
  return {
    clientName: "",
    placeOfSupply: "",
    frequency: "monthly",
    startDate: new Date().toISOString().slice(0, 10),
    notes: "",
    lines: [emptyLine()],
  };
}

function nextTemplateNumber(existing: RecurringInvoiceTemplate[]): string {
  const year = new Date().getFullYear();
  const prefix = `REC-${year}-`;
  let max = 0;
  for (const t of existing) {
    if (t.templateNumber?.startsWith(prefix)) {
      const n = parseInt(t.templateNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

const STATUS_BADGE: Record<RecurringInvoiceStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  paused: "bg-amber-50 text-amber-700",
  cancelled: "bg-rose-50 text-rose-700",
};

export default function RecurringInvoices({
  accounts,
  templates,
  setTemplates,
  invoices,
  setInvoices,
  canManage,
  currentUserName,
}: {
  accounts: Account[];
  templates: RecurringInvoiceTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<RecurringInvoiceTemplate[]>>;
  invoices: SalesInvoice[];
  setInvoices: React.Dispatch<React.SetStateAction<SalesInvoice[]>>;
  canManage: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const revenueAccounts = useMemo(() => accounts.filter((a) => a.isActive && a.type === "revenue").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => (a.nextRunDate < b.nextRunDate ? -1 : a.nextRunDate > b.nextRunDate ? 1 : 0)),
    [templates]
  );

  const today = new Date().toISOString().slice(0, 10);

  const openNew = () => {
    setError("");
    setDraft(newDraft());
    setShowForm(true);
  };

  const openEdit = (t: RecurringInvoiceTemplate) => {
    setError("");
    setDraft({
      id: t.id,
      clientName: t.clientName,
      placeOfSupply: t.placeOfSupply,
      frequency: t.frequency,
      startDate: t.startDate,
      notes: t.notes || "",
      lines: t.lines.map((l) => ({ ...l })),
    });
    setShowForm(true);
  };

  const updateLine = (id: string, patch: Partial<InvoiceLineItem>) =>
    setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const addLine = () => setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] }));
  const removeLine = (id: string) => setDraft((d) => (d.lines.length > 1 ? { ...d, lines: d.lines.filter((l) => l.id !== id) } : d));

  const draftTotals = invoiceTotals(draft);

  const saveDraft = () => {
    if (!draft.clientName.trim()) {
      setError("يرجى إدخال اسم العميل");
      return;
    }
    const validLines = draft.lines.filter((l) => l.description.trim() && l.quantity > 0 && l.accountId);
    if (validLines.length === 0) {
      setError("يجب إدخال بند واحد على الأقل ببيان وكمية وحساب إيراد مرتبط");
      return;
    }
    if (draft.id) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === draft.id
            ? {
                ...t,
                clientName: draft.clientName.trim(),
                placeOfSupply: draft.placeOfSupply,
                frequency: draft.frequency,
                startDate: draft.startDate,
                notes: draft.notes.trim() || undefined,
                lines: validLines,
              }
            : t
        )
      );
    } else {
      setTemplates((prev) => [
        ...prev,
        {
          id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          templateNumber: nextTemplateNumber(templates),
          clientName: draft.clientName.trim(),
          placeOfSupply: draft.placeOfSupply,
          lines: validLines,
          notes: draft.notes.trim() || undefined,
          frequency: draft.frequency,
          startDate: draft.startDate,
          nextRunDate: draft.startDate,
          status: "active",
          generatedInvoiceIds: [],
          createdAt: new Date().toISOString(),
          createdBy: currentUserName,
        },
      ]);
    }
    setShowForm(false);
  };

  const setStatus = (t: RecurringInvoiceTemplate, status: RecurringInvoiceStatus) =>
    setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)));

  const generateNow = (t: RecurringInvoiceTemplate) => {
    const newInvoiceId = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setInvoices((prev) => [
      ...prev,
      {
        id: newInvoiceId,
        invoiceNumber: nextInvoiceNumber(invoices),
        date: today,
        clientName: t.clientName,
        placeOfSupply: t.placeOfSupply,
        lines: t.lines.map((l) => ({ ...l, id: `il-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
        notes: `فاتورة مجدولة تلقائياً من القالب ${t.templateNumber} (${RECURRING_FREQUENCY_LABELS[t.frequency]})`,
        status: "draft",
        createdAt: new Date().toISOString(),
        createdBy: currentUserName,
      },
    ]);
    setTemplates((prev) =>
      prev.map((x) =>
        x.id === t.id
          ? {
              ...x,
              generatedInvoiceIds: [...x.generatedInvoiceIds, newInvoiceId],
              nextRunDate: addFrequency(x.nextRunDate, x.frequency),
              lastGeneratedAt: new Date().toISOString(),
            }
          : x
      )
    );
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setTemplates((prev) => prev.filter((t) => t.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">الفواتير المجدولة</h2>
          <p className="text-xs text-slate-500">
            قوالب اشتراك أو أتعاب دورية تُصدر فاتورة بيع جديدة تلقائياً كل دورة بنفس البنود — {templates.length} قالب مسجّل
          </p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> قالب فوترة مجدولة جديد
          </button>
        )}
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/60 border-b border-slate-200 bg-[#0D382B]/[0.02]">
              <th className="px-4 py-1.5 font-bold">رقم القالب</th>
              <th className="px-4 py-1.5 font-bold">العميل</th>
              <th className="px-4 py-1.5 font-bold">التكرار</th>
              <th className="px-4 py-1.5 font-bold">الموعد القادم</th>
              <th className="px-4 py-1.5 font-bold">قيمة الفاتورة</th>
              <th className="px-4 py-1.5 font-bold">عدد الفواتير المُصدرة</th>
              <th className="px-4 py-1.5 font-bold">الحالة</th>
              <th className="px-4 py-1.5 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {sortedTemplates.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                  لا توجد قوالب فوترة مجدولة بعد
                </td>
              </tr>
            )}
            {sortedTemplates.map((t) => {
              const totals = invoiceTotals(t);
              const isDue = t.status === "active" && t.nextRunDate <= today;
              return (
                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-[#0D382B]/[0.02] transition-colors">
                  <td className="px-4 py-1.5 font-mono text-slate-700">{t.templateNumber}</td>
                  <td className="px-4 py-1.5 text-slate-800 font-medium">{t.clientName}</td>
                  <td className="px-4 py-1.5 text-slate-600">{RECURRING_FREQUENCY_LABELS[t.frequency]}</td>
                  <td className={`px-4 py-1.5 ${isDue ? "font-bold text-[#C5A059]" : "text-slate-600"}`}>
                    {t.nextRunDate} {isDue && "· مستحق الآن"}
                  </td>
                  <td className="px-4 py-1.5 font-bold text-slate-800">{fmtMoney(totals.grandTotal)}</td>
                  <td className="px-4 py-1.5 text-slate-600">{t.generatedInvoiceIds.length}</td>
                  <td className="px-4 py-1.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[t.status]}`}>
                      {RECURRING_STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {canManage && t.status !== "cancelled" && (
                        <button onClick={() => openEdit(t)} className="text-xs font-bold text-[#0D382B] hover:underline">
                          تعديل
                        </button>
                      )}
                      {canManage && t.status === "active" && (
                        <button onClick={() => generateNow(t)} className="text-xs font-bold text-[#C5A059] hover:underline flex items-center gap-1">
                          <Zap size={13} /> توليد فاتورة الآن
                        </button>
                      )}
                      {canManage && t.status === "active" && (
                        <button onClick={() => setStatus(t, "paused")} className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                          <PauseCircle size={13} /> إيقاف مؤقت
                        </button>
                      )}
                      {canManage && t.status === "paused" && (
                        <button onClick={() => setStatus(t, "active")} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                          <PlayCircle size={13} /> استئناف
                        </button>
                      )}
                      {canManage && t.status !== "cancelled" && (
                        <button onClick={() => setStatus(t, "cancelled")} className="text-xs font-bold text-rose-600 hover:underline">
                          إلغاء
                        </button>
                      )}
                      {canManage && t.generatedInvoiceIds.length === 0 && (
                        <button onClick={() => requestDelete(t.id)} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
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
              <h3 className="text-lg font-black text-[#0D382B]">{draft.id ? "تعديل قالب الفوترة المجدولة" : "قالب فوترة مجدولة جديد"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {error && <div className="rounded-xl bg-rose-50 text-rose-700 text-sm px-4 py-2.5">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم العميل *</label>
                <input className={inputCls} value={draft.clientName} onChange={(e) => setDraft((d) => ({ ...d, clientName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">إمارة مكان التوريد</label>
                <input className={inputCls} value={draft.placeOfSupply} onChange={(e) => setDraft((d) => ({ ...d, placeOfSupply: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">التكرار</label>
                <select
                  className={inputCls}
                  value={draft.frequency}
                  onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value as RecurringFrequency }))}
                >
                  <option value="monthly">شهرياً</option>
                  <option value="quarterly">كل 3 أشهر</option>
                  <option value="yearly">سنوياً</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ بدء التكرار / أول فاتورة</label>
                <input type="date" className={inputCls} value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">بنود الفاتورة المتكررة</label>
                <button onClick={addLine} className="text-xs font-bold text-[#0D382B] hover:underline flex items-center gap-1">
                  <Plus size={13} /> إضافة بند
                </button>
              </div>
              {draft.lines.map((l) => (
                <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className={`${inputCls} col-span-5`}
                    placeholder="وصف الخدمة / البند"
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
                    {revenueAccounts.map((a) => (
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
                قيمة كل فاتورة تُصدر: <span className="font-black text-[#0D382B] text-base">{fmtMoney(draftTotals.grandTotal)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">
                  إلغاء
                </button>
                <button
                  onClick={saveDraft}
                  className="rounded-xl bg-[#0D382B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors"
                >
                  حفظ القالب
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
            <p className="text-sm text-slate-700">هل تريد حذف قالب الفوترة المجدولة هذا نهائياً؟</p>
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
