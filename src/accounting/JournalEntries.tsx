import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { Account, JournalEntry, JournalLine, entryTotals, isEntryBalanced } from "./types";
import { nextEntryNumber } from "./storage";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const fmtDateLabel = (d: string) => (d ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }) : "—");

function emptyLine(): JournalLine {
  return { id: `ln-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, accountId: "", debit: 0, credit: 0, description: "" };
}

interface DraftForm {
  date: string;
  description: string;
  reference: string;
  lines: JournalLine[];
}

function newDraft(): DraftForm {
  return { date: new Date().toISOString().slice(0, 10), description: "", reference: "", lines: [emptyLine(), emptyLine()] };
}

export default function JournalEntries({
  accounts,
  entries,
  setEntries,
  canPost,
  canDelete,
  currentUserName,
}: {
  accounts: Account[];
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canPost: boolean;
  canDelete: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const activeAccounts = useMemo(() => accounts.filter((a) => a.isActive && !a.isGroup).sort((a, b) => a.code.localeCompare(b.code)), [accounts]);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.entryNumber.localeCompare(a.entryNumber))), [entries]);

  const { totalDebit: draftDebit, totalCredit: draftCredit } = entryTotals(draft);
  const draftBalanced = isEntryBalanced(draft);

  const openNew = () => {
    setError("");
    setDraft(newDraft());
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const updateLine = (id: string, patch: Partial<JournalLine>) => {
    setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  };

  const addLine = () => setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] }));

  const removeLine = (id: string) => setDraft((d) => (d.lines.length > 2 ? { ...d, lines: d.lines.filter((l) => l.id !== id) } : d));

  const saveEntry = (status: "draft" | "posted") => {
    if (!draft.description.trim()) {
      setError("يرجى إدخال بيان/وصف القيد");
      return;
    }
    const validLines = draft.lines.filter((l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0));
    if (validLines.length < 2) {
      setError("يجب إدخال سطرين على الأقل مع تحديد الحساب والمبلغ");
      return;
    }
    for (const l of validLines) {
      if (Number(l.debit) > 0 && Number(l.credit) > 0) {
        setError("لا يمكن أن يحتوي السطر الواحد على مبلغ مدين ودائن معاً");
        return;
      }
    }
    const candidateEntry = { lines: validLines };
    if (status === "posted" && !isEntryBalanced(candidateEntry)) {
      setError("القيد غير متوازن: يجب أن يتساوى إجمالي المدين مع إجمالي الدائن قبل الترحيل");
      return;
    }
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entryNumber: nextEntryNumber(entries),
      date: draft.date,
      description: draft.description.trim(),
      reference: draft.reference.trim() || undefined,
      lines: validLines,
      status,
      createdAt: now,
      createdBy: currentUserName,
      postedAt: status === "posted" ? now : undefined,
      postedBy: status === "posted" ? currentUserName : undefined,
    };
    setEntries((prev) => [...prev, entry]);
    setShowForm(false);
  };

  const postDraftEntry = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (!isEntryBalanced(e)) return e;
        return { ...e, status: "posted", postedAt: new Date().toISOString(), postedBy: currentUserName };
      })
    );
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setEntries((prev) => prev.filter((e) => e.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const accountLabel = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} — ${a.name}` : "—";
  };

  const viewingEntry = entries.find((e) => e.id === viewingId);
  const deletingEntry = entries.find((e) => e.id === confirmDeleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">القيود اليومية</h2>
          <p className="text-xs text-slate-500">تسجيل وترحيل القيود المحاسبية بنظام القيد المزدوج (مدين/دائن) — {entries.length} قيد مسجّل</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
        >
          <Plus size={16} /> قيد جديد
        </button>
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">رقم القيد</th>
                <th className="px-4 py-2.5 font-semibold">التاريخ</th>
                <th className="px-4 py-2.5 font-semibold">البيان</th>
                <th className="px-4 py-2.5 font-semibold">الإجمالي</th>
                <th className="px-4 py-2.5 font-semibold">الحالة</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((e) => {
                const { totalDebit } = entryTotals(e);
                return (
                  <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-mono text-slate-700">{e.entryNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">{fmtDateLabel(e.date)}</td>
                    <td className="px-4 py-2.5 text-slate-800">{e.description}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{fmtMoney(totalDebit)}</td>
                    <td className="px-4 py-2.5">
                      {e.status === "posted" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> مرحّل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          مسودة
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewingId(e.id)} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100">
                          <FileText size={14} />
                        </button>
                        {e.status === "draft" && canPost && (
                          <button
                            onClick={() => postDraftEntry(e.id)}
                            className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg"
                          >
                            ترحيل
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => requestDelete(e.id)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد قيود مسجّلة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">قيد يومية جديد</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">تاريخ القيد</label>
                <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">مرجع (اختياري)</label>
                <input
                  value={draft.reference}
                  onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
                  placeholder="رقم فاتورة، شيك، إلخ"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">بيان القيد</label>
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="مثال: تحصيل أتعاب من الموكل فلان مقابل القضية رقم..."
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-1">
                <div className="col-span-5">الحساب</div>
                <div className="col-span-3">مدين</div>
                <div className="col-span-3">دائن</div>
                <div className="col-span-1"></div>
              </div>
              {draft.lines.map((l) => (
                <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                  <select
                    value={l.accountId}
                    onChange={(e) => updateLine(l.id, { accountId: e.target.value })}
                    className={inputCls + " col-span-5"}
                  >
                    <option value="">اختر الحساب…</option>
                    {activeAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={l.debit || ""}
                    onChange={(e) => updateLine(l.id, { debit: Number(e.target.value) || 0, credit: 0 })}
                    placeholder="0.00"
                    className={inputCls + " col-span-3 font-mono"}
                  />
                  <input
                    type="number"
                    min={0}
                    value={l.credit || ""}
                    onChange={(e) => updateLine(l.id, { credit: Number(e.target.value) || 0, debit: 0 })}
                    placeholder="0.00"
                    className={inputCls + " col-span-3 font-mono"}
                  />
                  <button
                    onClick={() => removeLine(l.id)}
                    disabled={draft.lines.length <= 2}
                    className="col-span-1 p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addLine} className="text-xs font-semibold text-[#0D382B] hover:bg-[#0D382B]/[0.06] px-2 py-1.5 rounded-lg flex items-center gap-1">
                <Plus size={13} /> إضافة سطر
              </button>
            </div>

            <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${draftBalanced ? "bg-emerald-50 text-emerald-700" : "bg-[#0D382B]/[0.05] text-[#0D382B]"}`}>
              <span>إجمالي المدين: {fmtMoney(draftDebit)}</span>
              <span>إجمالي الدائن: {fmtMoney(draftCredit)}</span>
              <span>{draftBalanced ? "القيد متوازن ✓" : "القيد غير متوازن"}</span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={closeForm} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                إلغاء
              </button>
              <button onClick={() => saveEntry("draft")} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">
                حفظ كمسودة
              </button>
              {canPost && (
                <button
                  onClick={() => saveEntry("posted")}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  حفظ وترحيل
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingEntry && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">تفاصيل القيد {viewingEntry.entryNumber}</h3>
              <button onClick={() => setViewingId(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600">{viewingEntry.description}</p>
            <p className="text-xs text-slate-400">{fmtDateLabel(viewingEntry.date)}{viewingEntry.reference ? ` · مرجع: ${viewingEntry.reference}` : ""}</p>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 bg-slate-50/70">
                    <th className="px-3 py-2 text-right font-semibold">الحساب</th>
                    <th className="px-3 py-2 text-right font-semibold">مدين</th>
                    <th className="px-3 py-2 text-right font-semibold">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingEntry.lines.map((l) => (
                    <tr key={l.id} className="border-t border-slate-50">
                      <td className="px-3 py-2 text-slate-700">{accountLabel(l.accountId)}</td>
                      <td className="px-3 py-2 font-mono">{l.debit ? fmtMoney(l.debit) : "—"}</td>
                      <td className="px-3 py-2 font-mono">{l.credit ? fmtMoney(l.credit) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingEntry && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد حذف القيد</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من حذف القيد <span className="font-bold">{deletingEntry.entryNumber}</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                إلغاء
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
