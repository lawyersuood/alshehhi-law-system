import React, { useMemo, useState } from "react";
import { ArrowLeftRight, CheckSquare, Square, History } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { BulkReclassLogEntry } from "./bulkReclassTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

interface MatchingLine {
  entryId: string;
  entryNumber: string;
  date: string;
  description: string;
  lineId: string;
  debit: number;
  credit: number;
}

export default function BulkReclass({
  accounts,
  entries,
  setEntries,
  reclassLog,
  setReclassLog,
  canManage,
  currentUserName,
}: {
  accounts: Account[];
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  reclassLog: BulkReclassLogEntry[];
  setReclassLog: React.Dispatch<React.SetStateAction<BulkReclassLogEntry[]>>;
  canManage: boolean;
  currentUserName?: string;
}) {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set());
  const [showLog, setShowLog] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const sortedAccounts = useMemo(() => [...accounts].filter((a) => a.isActive).sort((a, b) => a.code.localeCompare(b.code)), [accounts]);

  const accountName = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} - ${a.name}` : "—";
  };

  const matchingLines: MatchingLine[] = useMemo(() => {
    if (!fromAccountId) return [];
    const result: MatchingLine[] = [];
    for (const e of entries) {
      if (e.status !== "posted") continue;
      if (dateFrom && e.date < dateFrom) continue;
      if (dateTo && e.date > dateTo) continue;
      for (const l of e.lines) {
        if (l.accountId === fromAccountId) {
          result.push({ entryId: e.id, entryNumber: e.entryNumber, date: e.date, description: e.description, lineId: l.id, debit: l.debit, credit: l.credit });
        }
      }
    }
    return result.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [entries, fromAccountId, dateFrom, dateTo]);

  const toggleLine = (lineId: string) => {
    setSelectedLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedLineIds.size === matchingLines.length) {
      setSelectedLineIds(new Set());
    } else {
      setSelectedLineIds(new Set(matchingLines.map((l) => l.lineId)));
    }
  };

  const resetSelection = () => {
    setSelectedLineIds(new Set());
    setError("");
    setSuccessMsg("");
  };

  const applyReclass = () => {
    setError("");
    setSuccessMsg("");
    if (!fromAccountId || !toAccountId) {
      setError("يرجى اختيار الحساب الحالي والحساب الجديد");
      return;
    }
    if (fromAccountId === toAccountId) {
      setError("لا يمكن أن يكون الحساب الجديد نفس الحساب الحالي");
      return;
    }
    const selected = matchingLines.filter((l) => selectedLineIds.has(l.lineId));
    if (selected.length === 0) {
      setError("يرجى تحديد سطر واحد على الأقل لإعادة تصنيفه");
      return;
    }

    const selectedLineIdSet = new Set(selected.map((l) => l.lineId));
    const affectedEntryIds = new Set(selected.map((l) => l.entryId));
    let totalAmount = 0;
    for (const l of selected) totalAmount += (Number(l.debit) || 0) + (Number(l.credit) || 0);

    setEntries((prev) =>
      prev.map((e) => {
        if (!affectedEntryIds.has(e.id)) return e;
        return {
          ...e,
          lines: e.lines.map((l) => (selectedLineIdSet.has(l.id) ? { ...l, accountId: toAccountId } : l)),
        };
      })
    );

    const now = new Date().toISOString();
    setReclassLog((prev) => [
      {
        id: `rcl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: now.slice(0, 10),
        fromAccountId,
        toAccountId,
        entryIds: Array.from(affectedEntryIds),
        linesCount: selected.length,
        totalAmount,
        performedBy: currentUserName,
        createdAt: now,
      },
      ...prev,
    ]);

    setSuccessMsg(`تم إعادة تصنيف ${selected.length} سطر في ${affectedEntryIds.size} قيد بنجاح`);
    setSelectedLineIds(new Set());
  };

  const sortedLog = useMemo(() => [...reclassLog].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), [reclassLog]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">إعادة التصنيف الجماعي</h2>
          <p className="text-xs text-slate-500">تصحيح تصنيف عدة قيود دفعة واحدة (نقلها لحساب آخر) بدل تعديل كل قيد على حدة</p>
        </div>
        <button
          onClick={() => setShowLog((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <History size={16} /> {showLog ? "إخفاء السجل" : "سجل العمليات السابقة"}
        </button>
      </div>

      {showLog && (
        <div className="app-card overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/60 border-b border-slate-200 bg-[#0D382B]/[0.02]">
                <th className="px-4 py-1.5 font-bold">التاريخ</th>
                <th className="px-4 py-1.5 font-bold">من حساب</th>
                <th className="px-4 py-1.5 font-bold">إلى حساب</th>
                <th className="px-4 py-1.5 font-bold">عدد الأسطر</th>
                <th className="px-4 py-1.5 font-bold">عدد القيود</th>
                <th className="px-4 py-1.5 font-bold">الإجمالي المنقول</th>
                <th className="px-4 py-1.5 font-bold">بواسطة</th>
              </tr>
            </thead>
            <tbody>
              {sortedLog.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    لا توجد عمليات إعادة تصنيف سابقة
                  </td>
                </tr>
              )}
              {sortedLog.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-[#0D382B]/[0.02] transition-colors">
                  <td className="px-4 py-1.5 text-slate-600">{r.date}</td>
                  <td className="px-4 py-1.5 text-slate-700">{accountName(r.fromAccountId)}</td>
                  <td className="px-4 py-1.5 text-slate-700">{accountName(r.toAccountId)}</td>
                  <td className="px-4 py-1.5 text-slate-600">{r.linesCount}</td>
                  <td className="px-4 py-1.5 text-slate-600">{r.entryIds.length}</td>
                  <td className="px-4 py-1.5 font-bold text-slate-800">{fmtMoney(r.totalAmount)}</td>
                  <td className="px-4 py-1.5 text-slate-500">{r.performedBy || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="app-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">من حساب (الحالي) *</label>
            <select className={inputCls} value={fromAccountId} onChange={(e) => { setFromAccountId(e.target.value); resetSelection(); }}>
              <option value="">تحديد</option>
              {sortedAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">إلى حساب (الجديد) *</label>
            <select className={inputCls} value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
              <option value="">تحديد</option>
              {sortedAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">من تاريخ (اختياري)</label>
            <input type="date" className={inputCls} value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); resetSelection(); }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">إلى تاريخ (اختياري)</label>
            <input type="date" className={inputCls} value={dateTo} onChange={(e) => { setDateTo(e.target.value); resetSelection(); }} />
          </div>
        </div>

        {error && <div className="rounded-xl bg-rose-50 text-rose-700 text-sm px-4 py-2.5">{error}</div>}
        {successMsg && <div className="rounded-xl bg-emerald-50 text-emerald-700 text-sm px-4 py-2.5">{successMsg}</div>}

        {fromAccountId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs font-bold text-[#0D382B] hover:underline">
                {selectedLineIds.size === matchingLines.length && matchingLines.length > 0 ? <CheckSquare size={15} /> : <Square size={15} />}
                تحديد الكل ({matchingLines.length} سطر مطابق)
              </button>
              <span className="text-xs text-slate-500">{selectedLineIds.size} سطر محدد</span>
            </div>

            <div className="app-card overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/60 border-b border-slate-200 bg-[#0D382B]/[0.02]">
                    <th className="px-4 py-1.5 font-bold"></th>
                    <th className="px-4 py-1.5 font-bold">رقم القيد</th>
                    <th className="px-4 py-1.5 font-bold">التاريخ</th>
                    <th className="px-4 py-1.5 font-bold">البيان</th>
                    <th className="px-4 py-1.5 font-bold">مدين</th>
                    <th className="px-4 py-1.5 font-bold">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {matchingLines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                        لا توجد أسطر قيود مرحّلة على هذا الحساب ضمن النطاق المحدد
                      </td>
                    </tr>
                  )}
                  {matchingLines.map((l) => (
                    <tr
                      key={l.lineId}
                      onClick={() => toggleLine(l.lineId)}
                      className={`border-b border-slate-50 last:border-0 cursor-pointer transition-colors ${
                        selectedLineIds.has(l.lineId) ? "bg-[#0D382B]/[0.06]" : "hover:bg-[#0D382B]/[0.02]"
                      }`}
                    >
                      <td className="px-4 py-1.5">{selectedLineIds.has(l.lineId) ? <CheckSquare size={15} className="text-[#0D382B]" /> : <Square size={15} className="text-slate-300" />}</td>
                      <td className="px-4 py-1.5 font-mono text-slate-700">{l.entryNumber}</td>
                      <td className="px-4 py-1.5 text-slate-600">{l.date}</td>
                      <td className="px-4 py-1.5 text-slate-600">{l.description}</td>
                      <td className="px-4 py-1.5 text-slate-800">{l.debit > 0 ? fmtMoney(l.debit) : "—"}</td>
                      <td className="px-4 py-1.5 text-slate-800">{l.credit > 0 ? fmtMoney(l.credit) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canManage && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={applyReclass}
                  disabled={selectedLineIds.size === 0 || !toAccountId}
                  className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] disabled:opacity-40 transition-colors"
                >
                  <ArrowLeftRight size={16} /> تنفيذ إعادة التصنيف ({selectedLineIds.size})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
