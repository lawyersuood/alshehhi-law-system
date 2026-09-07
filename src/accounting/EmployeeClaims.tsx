import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, Ban, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { nextEntryNumber } from "./storage";
import {
  EmployeeClaim,
  EmployeeClaimStatus,
  EMPLOYEE_CLAIM_STATUS_LABELS,
  EMPLOYEE_CLAIMS_PAYABLE_ACCOUNT_CODE,
} from "./employeeClaimTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

function nextClaimNumber(existing: EmployeeClaim[]): string {
  const year = new Date().getFullYear();
  const prefix = `CLM-${year}-`;
  let max = 0;
  for (const c of existing) {
    if (c.claimNumber?.startsWith(prefix)) {
      const n = parseInt(c.claimNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

interface DraftForm {
  date: string;
  employeeName: string;
  description: string;
  accountId: string;
  amount: string;
}

function newDraft(): DraftForm {
  return { date: new Date().toISOString().slice(0, 10), employeeName: "", description: "", accountId: "", amount: "" };
}

const STATUS_BADGE: Record<EmployeeClaimStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-sky-50 text-sky-700",
  paid: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

export default function EmployeeClaims({
  accounts,
  claims,
  setClaims,
  entries,
  setEntries,
  canManage,
  canApprove,
  canDelete,
  currentUserName,
}: {
  accounts: Account[];
  claims: EmployeeClaim[];
  setClaims: React.Dispatch<React.SetStateAction<EmployeeClaim[]>>;
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canManage: boolean;
  canApprove: boolean;
  canDelete: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [payClaim, setPayClaim] = useState<EmployeeClaim | null>(null);
  const [payAccountId, setPayAccountId] = useState("");

  const expenseAccounts = useMemo(() => accounts.filter((a) => a.isActive && !a.isGroup && a.type === "expense").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const paymentAccounts = useMemo(() => accounts.filter((a) => a.isActive && !a.isGroup && a.type === "asset").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const claimsPayableAccount = useMemo(() => accounts.find((a) => a.code === EMPLOYEE_CLAIMS_PAYABLE_ACCOUNT_CODE), [accounts]);

  const sortedClaims = useMemo(
    () => [...claims].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.claimNumber.localeCompare(a.claimNumber))),
    [claims]
  );

  const accountName = (id?: string) => {
    if (!id) return "—";
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} - ${a.name}` : "—";
  };

  const openNew = () => {
    setError("");
    setDraft(newDraft());
    setShowForm(true);
  };

  const saveClaim = () => {
    const amount = Number(draft.amount);
    if (!draft.employeeName.trim()) {
      setError("يرجى إدخال اسم الموظف");
      return;
    }
    if (!draft.accountId) {
      setError("يرجى اختيار حساب المصروف المرتبط بالمطالبة");
      return;
    }
    if (!amount || amount <= 0) {
      setError("يرجى إدخال مبلغ صحيح أكبر من صفر");
      return;
    }
    if (!draft.description.trim()) {
      setError("يرجى إدخال وصف مختصر للمطالبة");
      return;
    }
    setClaims((prev) => [
      ...prev,
      {
        id: `clm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        claimNumber: nextClaimNumber(claims),
        date: draft.date,
        employeeName: draft.employeeName.trim(),
        description: draft.description.trim(),
        accountId: draft.accountId,
        amount,
        status: "pending",
        createdAt: new Date().toISOString(),
        createdBy: currentUserName,
      },
    ]);
    setShowForm(false);
  };

  const approveClaim = (c: EmployeeClaim) => {
    if (!claimsPayableAccount) {
      alert("تعذر العثور على حساب ذمم دائنة أخرى ومصروفات مستحقة (2130) في شجرة الحسابات");
      return;
    }
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: c.date,
      description: `اعتماد مطالبة موظف رقم ${c.claimNumber} — ${c.employeeName}`,
      reference: c.claimNumber,
      lines: [
        { id: `l-${journalEntryId}-exp`, accountId: c.accountId, debit: c.amount, credit: 0 },
        { id: `l-${journalEntryId}-pay`, accountId: claimsPayableAccount.id, debit: 0, credit: c.amount },
      ],
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    setEntries((prev) => [...prev, newEntry]);
    setClaims((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status: "approved", journalEntryId, approvedAt: now, approvedBy: currentUserName } : x))
    );
  };

  const rejectClaim = (c: EmployeeClaim) =>
    setClaims((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "rejected", rejectedAt: new Date().toISOString() } : x)));

  const openPay = (c: EmployeeClaim) => {
    setPayAccountId("");
    setPayClaim(c);
  };

  const confirmPay = () => {
    if (!payClaim || !payAccountId || !claimsPayableAccount) return;
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: now.slice(0, 10),
      description: `سداد مطالبة موظف رقم ${payClaim.claimNumber} — ${payClaim.employeeName}`,
      reference: payClaim.claimNumber,
      lines: [
        { id: `l-${journalEntryId}-pay`, accountId: claimsPayableAccount.id, debit: payClaim.amount, credit: 0 },
        { id: `l-${journalEntryId}-cash`, accountId: payAccountId, debit: 0, credit: payClaim.amount },
      ],
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    setEntries((prev) => [...prev, newEntry]);
    setClaims((prev) =>
      prev.map((x) =>
        x.id === payClaim.id
          ? { ...x, status: "paid", paymentJournalEntryId: journalEntryId, payingAccountId: payAccountId, paidAt: now }
          : x
      )
    );
    setPayClaim(null);
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const c = claims.find((x) => x.id === confirmDeleteId);
    setClaims((prev) => prev.filter((x) => x.id !== confirmDeleteId));
    if (c) {
      const idsToRemove = [c.journalEntryId, c.paymentJournalEntryId].filter(Boolean) as string[];
      if (idsToRemove.length) setEntries((prev) => prev.filter((en) => !idsToRemove.includes(en.id)));
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">مطالبات الموظفين</h2>
          <p className="text-xs text-slate-500">مبالغ دفعها موظف من جيبه لصالح المكتب ويطلب استردادها — {claims.length} مطالبة مسجّلة</p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> تسجيل مطالبة
          </button>
        )}
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/60 border-b border-slate-200 bg-[#0D382B]/[0.02]">
              <th className="px-4 py-1.5 font-bold">رقم المطالبة</th>
              <th className="px-4 py-1.5 font-bold">الموظف</th>
              <th className="px-4 py-1.5 font-bold">الوصف</th>
              <th className="px-4 py-1.5 font-bold">التاريخ</th>
              <th className="px-4 py-1.5 font-bold">حساب المصروف</th>
              <th className="px-4 py-1.5 font-bold">المبلغ</th>
              <th className="px-4 py-1.5 font-bold">الحالة</th>
              <th className="px-4 py-1.5 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {sortedClaims.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                  لا توجد مطالبات موظفين مسجّلة بعد
                </td>
              </tr>
            )}
            {sortedClaims.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-[#0D382B]/[0.02] transition-colors">
                <td className="px-4 py-1.5 font-mono text-slate-700">{c.claimNumber}</td>
                <td className="px-4 py-1.5 text-slate-800 font-medium">{c.employeeName}</td>
                <td className="px-4 py-1.5 text-slate-600">{c.description}</td>
                <td className="px-4 py-1.5 text-slate-600">{c.date}</td>
                <td className="px-4 py-1.5 text-slate-600">{accountName(c.accountId)}</td>
                <td className="px-4 py-1.5 font-bold text-slate-800">{fmtMoney(c.amount)}</td>
                <td className="px-4 py-1.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[c.status]}`}>
                    {EMPLOYEE_CLAIM_STATUS_LABELS[c.status]}
                  </span>
                </td>
                <td className="px-4 py-1.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {canApprove && c.status === "pending" && (
                      <>
                        <button onClick={() => approveClaim(c)} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                          <CheckCircle2 size={13} /> اعتماد
                        </button>
                        <button onClick={() => rejectClaim(c)} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                          <XCircle size={13} /> رفض
                        </button>
                      </>
                    )}
                    {canApprove && c.status === "approved" && (
                      <button onClick={() => openPay(c)} className="text-xs font-bold text-[#C5A059] hover:underline flex items-center gap-1">
                        <Wallet size={13} /> تسديد
                      </button>
                    )}
                    {canDelete && c.status !== "paid" && (
                      <button onClick={() => requestDelete(c.id)} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
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
              <h3 className="text-lg font-black text-[#0D382B]">تسجيل مطالبة موظف</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {error && <div className="rounded-xl bg-rose-50 text-rose-700 text-sm px-4 py-2.5">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم الموظف *</label>
                <input className={inputCls} value={draft.employeeName} onChange={(e) => setDraft((d) => ({ ...d, employeeName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">التاريخ *</label>
                <input type="date" className={inputCls} value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">الوصف *</label>
              <input
                className={inputCls}
                placeholder="مثال: مواصلات لمراجعة محكمة"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">حساب المصروف *</label>
                <select className={inputCls} value={draft.accountId} onChange={(e) => setDraft((d) => ({ ...d, accountId: e.target.value }))}>
                  <option value="">تحديد</option>
                  {expenseAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">المبلغ (AED) *</label>
                <input type="number" className={inputCls} value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">
                إلغاء
              </button>
              <button onClick={saveClaim} className="rounded-xl bg-[#0D382B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors">
                حفظ المطالبة
              </button>
            </div>
          </div>
        </div>
      )}

      {payClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="app-card w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#0D382B]">تسديد المطالبة {payClaim.claimNumber}</h3>
              <button onClick={() => setPayClaim(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              سيتم سداد <span className="font-bold text-slate-800">{fmtMoney(payClaim.amount)}</span> للموظف{" "}
              <span className="font-bold text-slate-800">{payClaim.employeeName}</span>
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">السداد من خلال (نقد أو بنك) *</label>
              <select className={inputCls} value={payAccountId} onChange={(e) => setPayAccountId(e.target.value)}>
                <option value="">تحديد</option>
                {paymentAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button onClick={() => setPayClaim(null)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">
                إلغاء
              </button>
              <button
                onClick={confirmPay}
                disabled={!payAccountId}
                className="rounded-xl bg-[#0D382B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] disabled:opacity-40 transition-colors"
              >
                تأكيد السداد
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="app-card w-full max-w-sm p-6 space-y-4 text-center">
            <Ban className="mx-auto text-rose-500" size={28} />
            <p className="text-sm text-slate-700">هل تريد حذف هذه المطالبة وأي قيود محاسبية مرتبطة بها نهائياً؟</p>
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
