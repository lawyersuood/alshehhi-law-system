import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, CheckCircle2, Ban } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { nextEntryNumber } from "./storage";
import { InvoiceLineItem, SalesInvoice, AR_ACCOUNT_CODE, VAT_OUTPUT_ACCOUNT_CODE, invoiceTotals, lineNetAmount } from "./salesTypes";
import { CreditNote, CreditNoteStatus } from "./creditNoteTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

function emptyLine(): InvoiceLineItem {
  return { id: `cnl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, description: "", quantity: 1, unitPrice: 0, vatRate: 5, accountId: "" };
}

function nextCreditNoteNumber(existing: CreditNote[]): string {
  const year = new Date().getFullYear();
  const prefix = `CN-${year}-`;
  let max = 0;
  for (const c of existing) {
    if (c.creditNoteNumber?.startsWith(prefix)) {
      const n = parseInt(c.creditNoteNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

interface DraftForm {
  id?: string;
  date: string;
  clientName: string;
  relatedInvoiceId: string;
  notes: string;
  lines: InvoiceLineItem[];
}

function newDraft(): DraftForm {
  return { date: new Date().toISOString().slice(0, 10), clientName: "", relatedInvoiceId: "", notes: "", lines: [emptyLine()] };
}

const STATUS_BADGE: Record<CreditNoteStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  approved: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};
const STATUS_LABEL: Record<CreditNoteStatus, string> = { draft: "مسودة", approved: "معتمد", cancelled: "ملغى" };

export default function CreditNotes({
  accounts,
  creditNotes,
  setCreditNotes,
  invoices,
  entries,
  setEntries,
  canManage,
  canApprove,
  currentUserName,
}: {
  accounts: Account[];
  creditNotes: CreditNote[];
  setCreditNotes: React.Dispatch<React.SetStateAction<CreditNote[]>>;
  invoices: SalesInvoice[];
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canManage: boolean;
  canApprove: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const revenueAccounts = useMemo(() => accounts.filter((a) => a.isActive && !a.isGroup && a.type === "revenue").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const arAccount = useMemo(() => accounts.find((a) => a.code === AR_ACCOUNT_CODE), [accounts]);
  const vatAccount = useMemo(() => accounts.find((a) => a.code === VAT_OUTPUT_ACCOUNT_CODE), [accounts]);

  const sortedNotes = useMemo(
    () => [...creditNotes].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.creditNoteNumber.localeCompare(a.creditNoteNumber))),
    [creditNotes]
  );

  const openNew = () => {
    setError("");
    setDraft(newDraft());
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
    setCreditNotes((prev) => [
      ...prev,
      {
        id: `cn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        creditNoteNumber: nextCreditNoteNumber(creditNotes),
        date: draft.date,
        clientName: draft.clientName.trim(),
        relatedInvoiceId: draft.relatedInvoiceId || undefined,
        lines: validLines,
        notes: draft.notes.trim() || undefined,
        status: "draft",
        createdAt: new Date().toISOString(),
        createdBy: currentUserName,
      },
    ]);
    setShowForm(false);
  };

  const approveCreditNote = (cn: CreditNote) => {
    if (!arAccount) {
      alert("تعذر العثور على حساب ذمم العملاء المدينة في شجرة الحسابات");
      return;
    }
    const { vatTotal, grandTotal } = invoiceTotals(cn);
    if (grandTotal <= 0) return;
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const revenueByAccount = new Map<string, number>();
    for (const l of cn.lines) revenueByAccount.set(l.accountId, (revenueByAccount.get(l.accountId) || 0) + lineNetAmount(l));
    const lines = [
      ...Array.from(revenueByAccount.entries()).map(([accountId, amount], idx) => ({
        id: `l-${journalEntryId}-rev-${idx}`,
        accountId,
        debit: amount,
        credit: 0,
      })),
      { id: `l-${journalEntryId}-ar`, accountId: arAccount.id, debit: 0, credit: grandTotal },
    ];
    if (vatTotal > 0 && vatAccount) {
      lines.splice(lines.length - 1, 0, { id: `l-${journalEntryId}-vat`, accountId: vatAccount.id, debit: vatTotal, credit: 0 });
    }
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: cn.date,
      description: `اعتماد إشعار دائن رقم ${cn.creditNoteNumber} — ${cn.clientName}`,
      reference: cn.creditNoteNumber,
      lines,
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    setEntries((prev) => [...prev, newEntry]);
    setCreditNotes((prev) =>
      prev.map((x) => (x.id === cn.id ? { ...x, status: "approved", journalEntryId, approvedAt: now, approvedBy: currentUserName } : x))
    );
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setCreditNotes((prev) => prev.filter((c) => c.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">إشعارات دائنة</h2>
          <p className="text-xs text-slate-500">لتصحيح أو تخفيض قيمة فاتورة بيع صادرة سابقاً — {creditNotes.length} إشعار مسجّل</p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> إشعار دائن جديد
          </button>
        )}
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/60 border-b border-slate-200 bg-[#0D382B]/[0.02]">
              <th className="px-4 py-1.5 font-bold">رقم الإشعار</th>
              <th className="px-4 py-1.5 font-bold">العميل</th>
              <th className="px-4 py-1.5 font-bold">التاريخ</th>
              <th className="px-4 py-1.5 font-bold">القيمة</th>
              <th className="px-4 py-1.5 font-bold">الحالة</th>
              <th className="px-4 py-1.5 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {sortedNotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  لا توجد إشعارات دائنة مسجّلة بعد
                </td>
              </tr>
            )}
            {sortedNotes.map((cn) => {
              const totals = invoiceTotals(cn);
              return (
                <tr key={cn.id} className="border-b border-slate-50 last:border-0 hover:bg-[#0D382B]/[0.02] transition-colors">
                  <td className="px-4 py-1.5 font-mono text-slate-700">{cn.creditNoteNumber}</td>
                  <td className="px-4 py-1.5 text-slate-800 font-medium">{cn.clientName}</td>
                  <td className="px-4 py-1.5 text-slate-600">{cn.date}</td>
                  <td className="px-4 py-1.5 font-bold text-rose-600">- {fmtMoney(totals.grandTotal)}</td>
                  <td className="px-4 py-1.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[cn.status]}`}>
                      {STATUS_LABEL[cn.status]}
                    </span>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {canApprove && cn.status === "draft" && (
                        <button onClick={() => approveCreditNote(cn)} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                          <CheckCircle2 size={13} /> اعتماد
                        </button>
                      )}
                      {canManage && cn.status === "draft" && (
                        <button onClick={() => requestDelete(cn.id)} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
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
              <h3 className="text-lg font-black text-[#0D382B]">إشعار دائن جديد</h3>
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
                <label className="block text-xs font-bold text-slate-600 mb-1.5">مرتبط بفاتورة (اختياري)</label>
                <select className={inputCls} value={draft.relatedInvoiceId} onChange={(e) => setDraft((d) => ({ ...d, relatedInvoiceId: e.target.value }))}>
                  <option value="">بدون ربط</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.clientName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ الإشعار</label>
                <input type="date" className={inputCls} value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">البنود المخصومة</label>
                <button onClick={addLine} className="text-xs font-bold text-[#0D382B] hover:underline flex items-center gap-1">
                  <Plus size={13} /> إضافة بند
                </button>
              </div>
              {draft.lines.map((l) => (
                <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className={`${inputCls} col-span-5`}
                    placeholder="سبب الخصم / البند"
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
                قيمة الإشعار: <span className="font-black text-rose-600 text-base">- {fmtMoney(draftTotals.grandTotal)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">
                  إلغاء
                </button>
                <button onClick={saveDraft} className="rounded-xl bg-[#0D382B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors">
                  حفظ الإشعار
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
            <p className="text-sm text-slate-700">هل تريد حذف هذا الإشعار الدائن نهائياً؟</p>
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
