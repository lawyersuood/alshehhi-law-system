import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { nextEntryNumber } from "./storage";
import { BankAccount, BankTransaction, BankTransactionType, computeBankBalance } from "./bankTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition";

const fmtMoney = (n: number, currency: string) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: currency || "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const fmtDateLabel = (d: string) => (d ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }) : "—");

interface DraftForm {
  date: string;
  type: BankTransactionType;
  amount: string;
  description: string;
  contraAccountId: string;
  reference: string;
}

function newDraft(): DraftForm {
  return { date: new Date().toISOString().slice(0, 10), type: "deposit", amount: "", description: "", contraAccountId: "", reference: "" };
}

export default function BankAccountLedger({
  bankAccount,
  accounts,
  transactions,
  setTransactions,
  entries,
  setEntries,
  canRecord,
  canDelete,
  currentUserName,
}: {
  bankAccount: BankAccount;
  accounts: Account[];
  transactions: BankTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<BankTransaction[]>>;
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canRecord: boolean;
  canDelete: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const otherAccounts = useMemo(
    () => accounts.filter((a) => a.isActive && a.id !== bankAccount.linkedAccountId).sort((a, b) => a.code.localeCompare(b.code)),
    [accounts, bankAccount.linkedAccountId]
  );

  const accountLabel = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} — ${a.name}` : "—";
  };

  const rows = useMemo(() => {
    const list = transactions
      .filter((t) => t.bankAccountId === bankAccount.id)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt.localeCompare(b.createdAt)));
    let running = bankAccount.openingBalance;
    return list.map((t) => {
      running += t.type === "deposit" ? t.amount : -t.amount;
      return { ...t, balance: running };
    });
  }, [transactions, bankAccount]);

  const currentBalance = computeBankBalance(bankAccount, transactions);

  const openNew = () => {
    setError("");
    setDraft(newDraft());
    setShowForm(true);
  };

  const saveTransaction = () => {
    const amount = Number(draft.amount);
    if (!amount || amount <= 0) {
      setError("يرجى إدخال مبلغ صحيح أكبر من صفر");
      return;
    }
    if (!draft.contraAccountId) {
      setError("يرجى اختيار الحساب المقابل لهذه الحركة");
      return;
    }
    if (!draft.description.trim()) {
      setError("يرجى إدخال وصف مختصر للحركة");
      return;
    }
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const isDeposit = draft.type === "deposit";
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: draft.date,
      description: `${isDeposit ? "إيداع بنكي" : "سحب/صرف بنكي"} — ${bankAccount.bankName} (${bankAccount.accountLabel}): ${draft.description.trim()}`,
      reference: draft.reference.trim() || undefined,
      lines: isDeposit
        ? [
            { id: `l-${journalEntryId}-1`, accountId: bankAccount.linkedAccountId, debit: amount, credit: 0 },
            { id: `l-${journalEntryId}-2`, accountId: draft.contraAccountId, debit: 0, credit: amount },
          ]
        : [
            { id: `l-${journalEntryId}-1`, accountId: draft.contraAccountId, debit: amount, credit: 0 },
            { id: `l-${journalEntryId}-2`, accountId: bankAccount.linkedAccountId, debit: 0, credit: amount },
          ],
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    const newTransaction: BankTransaction = {
      id: `btx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      bankAccountId: bankAccount.id,
      date: draft.date,
      type: draft.type,
      amount,
      description: draft.description.trim(),
      contraAccountId: draft.contraAccountId,
      reference: draft.reference.trim() || undefined,
      journalEntryId,
      createdAt: now,
      createdBy: currentUserName,
    };
    setEntries((prev) => [...prev, newEntry]);
    setTransactions((prev) => [...prev, newTransaction]);
    setShowForm(false);
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const tx = transactions.find((t) => t.id === confirmDeleteId);
    setTransactions((prev) => prev.filter((t) => t.id !== confirmDeleteId));
    if (tx) setEntries((prev) => prev.filter((e) => e.id !== tx.journalEntryId));
    setConfirmDeleteId(null);
  };

  const deletingTx = transactions.find((t) => t.id === confirmDeleteId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {bankAccount.bankName} — {bankAccount.accountLabel}
          </h3>
          <p className="text-xs text-slate-500">
            الرصيد الحالي: <span className="font-mono font-semibold text-slate-800">{fmtMoney(currentBalance, bankAccount.currency)}</span>
          </p>
        </div>
        {canRecord && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"
          >
            <Plus size={16} /> تسجيل حركة بنكية
          </button>
        )}
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">التاريخ</th>
                <th className="px-4 py-2.5 font-semibold">النوع</th>
                <th className="px-4 py-2.5 font-semibold">البيان</th>
                <th className="px-4 py-2.5 font-semibold">الحساب المقابل</th>
                <th className="px-4 py-2.5 font-semibold">المبلغ</th>
                <th className="px-4 py-2.5 font-semibold">الرصيد بعد الحركة</th>
                {canDelete && <th className="px-4 py-2.5 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{fmtDateLabel(t.date)}</td>
                  <td className="px-4 py-2.5">
                    {t.type === "deposit" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                        <ArrowDownCircle size={14} /> إيداع
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-semibold">
                        <ArrowUpCircle size={14} /> سحب
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-800">{t.description}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{accountLabel(t.contraAccountId)}</td>
                  <td className={`px-4 py-2.5 font-mono font-semibold ${t.type === "deposit" ? "text-emerald-700" : "text-rose-700"}`}>
                    {t.type === "deposit" ? "+" : "-"}
                    {fmtMoney(t.amount, bankAccount.currency)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-900">{fmtMoney(t.balance, bankAccount.currency)}</td>
                  {canDelete && (
                    <td className="px-4 py-2.5">
                      <button onClick={() => requestDelete(t.id)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد حركات مسجّلة على هذا الحساب بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">تسجيل حركة بنكية جديدة</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDraft({ ...draft, type: "deposit" })}
                className={`rounded-xl border py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 ${
                  draft.type === "deposit" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                }`}
              >
                <ArrowDownCircle size={15} /> إيداع
              </button>
              <button
                onClick={() => setDraft({ ...draft, type: "withdrawal" })}
                className={`rounded-xl border py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 ${
                  draft.type === "withdrawal" ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500"
                }`}
              >
                <ArrowUpCircle size={15} /> سحب / صرف
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">التاريخ</label>
                <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">المبلغ ({bankAccount.currency})</label>
                <input
                  type="number"
                  min={0}
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                  placeholder="0.00"
                  className={inputCls + " font-mono"}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                {draft.type === "deposit" ? "مصدر الإيداع (الحساب المقابل)" : "وجهة الصرف (الحساب المقابل)"}
              </label>
              <select value={draft.contraAccountId} onChange={(e) => setDraft({ ...draft, contraAccountId: e.target.value })} className={inputCls}>
                <option value="">اختر الحساب…</option>
                {otherAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">البيان</label>
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="مثال: تحصيل أتعاب الموكل فلان"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">مرجع (اختياري)</label>
              <input value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} className={inputCls} />
            </div>
            <p className="text-[11px] text-slate-400">
              سيتم إنشاء قيد يومية مرحّل تلقائياً بهذه الحركة، متوازن بين حساب البنك والحساب المقابل المختار.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                إلغاء
              </button>
              <button onClick={saveTransaction} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                حفظ وترحيل
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingTx && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد حذف الحركة البنكية</h3>
            <p className="text-sm text-slate-600">
              سيتم حذف هذه الحركة وقيد اليومية المرتبط بها معاً. هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.
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
