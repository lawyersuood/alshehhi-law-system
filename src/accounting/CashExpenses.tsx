import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, Ban } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { nextEntryNumber } from "./storage";
import { CashExpense, CASH_EXPENSE_LS_KEYS } from "./cashExpenseTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

function nextExpenseNumber(existing: CashExpense[]): string {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;
  let max = 0;
  for (const e of existing) {
    if (e.expenseNumber?.startsWith(prefix)) {
      const n = parseInt(e.expenseNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

interface DraftForm {
  date: string;
  description: string;
  vendorName: string;
  accountId: string;
  paidFromAccountId: string;
  amount: string;
  caseRef: string;
}

function newDraft(): DraftForm {
  return {
    date: new Date().toISOString().slice(0, 10),
    description: "",
    vendorName: "",
    accountId: "",
    paidFromAccountId: "",
    amount: "",
    caseRef: "",
  };
}

export default function CashExpenses({
  accounts,
  expenses,
  setExpenses,
  entries,
  setEntries,
  canManage,
  canDelete,
  currentUserName,
}: {
  accounts: Account[];
  expenses: CashExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<CashExpense[]>>;
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canManage: boolean;
  canDelete: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const expenseAccounts = useMemo(
    () =>
      accounts
        .filter((a) => a.isActive && !a.isGroup && a.type === "expense")
        .sort((a, b) => a.code.localeCompare(b.code)),
    [accounts],
  );
  const paymentAccounts = useMemo(
    () =>
      accounts
        .filter((a) => a.isActive && !a.isGroup && a.type === "asset")
        .sort((a, b) => a.code.localeCompare(b.code)),
    [accounts],
  );

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.expenseNumber.localeCompare(a.expenseNumber),
      ),
    [expenses],
  );

  const openNew = () => {
    setError("");
    setDraft(newDraft());
    setShowForm(true);
  };

  const accountName = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} - ${a.name}` : "—";
  };

  const saveExpense = () => {
    const amount = Number(draft.amount);
    if (!draft.accountId) {
      setError("يرجى اختيار حساب المصروف");
      return;
    }
    if (!draft.paidFromAccountId) {
      setError("يرجى اختيار الحساب الذي تم الدفع منه (نقد أو بنك)");
      return;
    }
    if (!amount || amount <= 0) {
      setError("يرجى إدخال مبلغ صحيح أكبر من صفر");
      return;
    }
    if (!draft.description.trim()) {
      setError("يرجى إدخال وصف مختصر للمصروف");
      return;
    }

    const now = new Date().toISOString();
    const expenseId = `cexp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: draft.date,
      description: `مصروف نقدي — ${draft.description.trim()}${draft.vendorName ? " — " + draft.vendorName.trim() : ""}`,
      reference: undefined,
      lines: [
        { id: `l-${journalEntryId}-exp`, accountId: draft.accountId, debit: amount, credit: 0 },
        {
          id: `l-${journalEntryId}-pay`,
          accountId: draft.paidFromAccountId,
          debit: 0,
          credit: amount,
        },
      ],
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };

    setEntries((prev) => [...prev, newEntry]);
    setExpenses((prev) => [
      ...prev,
      {
        id: expenseId,
        expenseNumber: nextExpenseNumber(expenses),
        date: draft.date,
        description: draft.description.trim(),
        vendorName: draft.vendorName.trim() || undefined,
        accountId: draft.accountId,
        paidFromAccountId: draft.paidFromAccountId,
        amount,
        caseRef: draft.caseRef.trim() || undefined,
        journalEntryId,
        createdAt: now,
        createdBy: currentUserName,
      },
    ]);
    setShowForm(false);
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const exp = expenses.find((e) => e.id === confirmDeleteId);
    setExpenses((prev) => prev.filter((e) => e.id !== confirmDeleteId));
    if (exp?.journalEntryId) {
      setEntries((prev) => prev.filter((en) => en.id !== exp.journalEntryId));
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">المصروفات النقدية</h2>
          <p className="text-xs text-slate-500">
            مصروفات متفرقة بدون فاتورة مورد رسمية (رسوم كاتب عدل، مواقف، طباعة مستندات) —{" "}
            {expenses.length} مصروف مسجّل
          </p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> تسجيل مصروف
          </button>
        )}
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/60 border-b border-slate-200 bg-[#0D382B]/[0.02]">
              <th className="px-4 py-1.5 font-bold">المرجع</th>
              <th className="px-4 py-1.5 font-bold">التاريخ</th>
              <th className="px-4 py-1.5 font-bold">الوصف</th>
              <th className="px-4 py-1.5 font-bold">الجهة</th>
              <th className="px-4 py-1.5 font-bold">حساب المصروف</th>
              <th className="px-4 py-1.5 font-bold">تم الدفع من خلال</th>
              <th className="px-4 py-1.5 font-bold">القضية / المشروع</th>
              <th className="px-4 py-1.5 font-bold">المبلغ</th>
              <th className="px-4 py-1.5 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                  لا توجد مصروفات نقدية مسجّلة بعد
                </td>
              </tr>
            )}
            {sortedExpenses.map((e) => (
              <tr
                key={e.id}
                className="border-b border-slate-50 last:border-0 hover:bg-[#0D382B]/[0.02] transition-colors"
              >
                <td className="px-4 py-1.5 font-mono text-slate-700">{e.expenseNumber}</td>
                <td className="px-4 py-1.5 text-slate-600">{e.date}</td>
                <td className="px-4 py-1.5 text-slate-800 font-medium">{e.description}</td>
                <td className="px-4 py-1.5 text-slate-600">{e.vendorName || "—"}</td>
                <td className="px-4 py-1.5 text-slate-600">{accountName(e.accountId)}</td>
                <td className="px-4 py-1.5 text-slate-600">{accountName(e.paidFromAccountId)}</td>
                <td className="px-4 py-1.5 text-slate-600">{e.caseRef || "—"}</td>
                <td className="px-4 py-1.5 font-bold text-slate-800">{fmtMoney(e.amount)}</td>
                <td className="px-4 py-1.5">
                  {canDelete && (
                    <button
                      onClick={() => requestDelete(e.id)}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="app-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#0D382B]">تسجيل مصروف نقدي</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 text-rose-700 text-sm px-4 py-2.5">{error}</div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">الوصف *</label>
              <input
                className={inputCls}
                placeholder="مثال: رسوم كاتب عدل - توكيل"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  الجهة (اختياري)
                </label>
                <input
                  className={inputCls}
                  value={draft.vendorName}
                  onChange={(e) => setDraft((d) => ({ ...d, vendorName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">التاريخ *</label>
                <input
                  type="date"
                  className={inputCls}
                  value={draft.date}
                  onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  حساب المصروف *
                </label>
                <select
                  className={inputCls}
                  value={draft.accountId}
                  onChange={(e) => setDraft((d) => ({ ...d, accountId: e.target.value }))}
                >
                  <option value="">تحديد</option>
                  {expenseAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  تم الدفع من خلال *
                </label>
                <select
                  className={inputCls}
                  value={draft.paidFromAccountId}
                  onChange={(e) => setDraft((d) => ({ ...d, paidFromAccountId: e.target.value }))}
                >
                  <option value="">تحديد</option>
                  {paymentAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  المبلغ (AED) *
                </label>
                <input
                  type="number"
                  className={inputCls}
                  value={draft.amount}
                  onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  ربط بقضية / مشروع (اختياري)
                </label>
                <input
                  className={inputCls}
                  value={draft.caseRef}
                  onChange={(e) => setDraft((d) => ({ ...d, caseRef: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={saveExpense}
                className="rounded-xl bg-[#0D382B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors"
              >
                حفظ وترحيل المصروف
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="app-card w-full max-w-sm p-6 space-y-4 text-center">
            <Ban className="mx-auto text-rose-500" size={28} />
            <p className="text-sm text-slate-700">
              هل تريد حذف هذا المصروف والقيد المحاسبي المرتبط به نهائياً؟
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50"
              >
                تراجع
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
