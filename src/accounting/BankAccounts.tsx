import React, { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Landmark } from "lucide-react";
import { Account } from "./types";
import { BankAccount, BankTransaction, CURRENCIES, computeBankBalance } from "./bankTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number, currency: string) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: currency || "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

interface FormState {
  id?: string;
  bankName: string;
  accountLabel: string;
  iban: string;
  accountNumber: string;
  currency: string;
  openingBalance: string;
  openingDate: string;
  linkedAccountId: string;
  notes: string;
}

function emptyForm(): FormState {
  return {
    bankName: "",
    accountLabel: "",
    iban: "",
    accountNumber: "",
    currency: "AED",
    openingBalance: "0",
    openingDate: new Date().toISOString().slice(0, 10),
    linkedAccountId: "",
    notes: "",
  };
}

export default function BankAccounts({
  accounts,
  bankAccounts,
  setBankAccounts,
  transactions,
  canManage,
  selectedId,
  onSelect,
}: {
  accounts: Account[];
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  transactions: BankTransaction[];
  canManage: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // حسابات الأصول فقط تصلح لتمثيل حساب بنكي في شجرة الحسابات
  const assetAccounts = useMemo(() => accounts.filter((a) => a.isActive && !a.isGroup && a.type === "asset").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);

  const openNew = () => {
    setError("");
    setForm(emptyForm());
  };

  const openEdit = (b: BankAccount) => {
    setError("");
    setForm({
      id: b.id,
      bankName: b.bankName,
      accountLabel: b.accountLabel,
      iban: b.iban || "",
      accountNumber: b.accountNumber || "",
      currency: b.currency,
      openingBalance: String(b.openingBalance),
      openingDate: b.openingDate,
      linkedAccountId: b.linkedAccountId,
      notes: b.notes || "",
    });
  };

  const closeForm = () => setForm(null);

  const saveForm = () => {
    if (!form) return;
    if (!form.bankName.trim() || !form.accountLabel.trim()) {
      setError("يرجى إدخال اسم البنك ووصف الحساب");
      return;
    }
    if (!form.linkedAccountId) {
      setError("يرجى ربط هذا الحساب البنكي بحساب من شجرة الحسابات (نوع أصول)");
      return;
    }
    const opening = Number(form.openingBalance) || 0;
    if (form.id) {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.id === form.id
            ? {
                ...b,
                bankName: form.bankName.trim(),
                accountLabel: form.accountLabel.trim(),
                iban: form.iban.trim() || undefined,
                accountNumber: form.accountNumber.trim() || undefined,
                currency: form.currency,
                openingBalance: opening,
                openingDate: form.openingDate,
                linkedAccountId: form.linkedAccountId,
                notes: form.notes.trim() || undefined,
              }
            : b
        )
      );
    } else {
      setBankAccounts((prev) => [
        ...prev,
        {
          id: `bank-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          bankName: form.bankName.trim(),
          accountLabel: form.accountLabel.trim(),
          iban: form.iban.trim() || undefined,
          accountNumber: form.accountNumber.trim() || undefined,
          currency: form.currency,
          openingBalance: opening,
          openingDate: form.openingDate,
          linkedAccountId: form.linkedAccountId,
          isActive: true,
          notes: form.notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setForm(null);
  };

  const toggleActive = (b: BankAccount) => setBankAccounts((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x)));

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setBankAccounts((prev) => prev.filter((b) => b.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const accountLabel = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} — ${a.name}` : "—";
  };

  const deletingAccount = bankAccounts.find((b) => b.id === confirmDeleteId);
  const hasTransactions = confirmDeleteId ? transactions.some((t) => t.bankAccountId === confirmDeleteId) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">الحسابات البنكية</h2>
          <p className="text-xs text-slate-500">سجل حسابات المكتب البنكية كأساس لتسجيل المقبوضات والمدفوعات ومطابقتها</p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> إضافة حساب بنكي
          </button>
        )}
      </div>

      {bankAccounts.length === 0 ? (
        <div className="app-card p-8 text-center text-sm text-slate-500">لا توجد حسابات بنكية مسجّلة بعد</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bankAccounts.map((b) => {
            const balance = computeBankBalance(b, transactions);
            const isSelected = selectedId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelect(b.id)}
                className={`text-right app-card p-4 space-y-3 transition-shadow ${isSelected ? "ring-2 ring-[#0D382B]/40" : ""} ${!b.isActive ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                      <Landmark size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{b.bankName}</p>
                      <p className="text-xs text-slate-500">{b.accountLabel}</p>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-0.5">
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(b);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#0D382B] rounded-lg hover:bg-[#0D382B]/[0.06]"
                      >
                        <Pencil size={13} />
                      </span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDelete(b.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={13} />
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">الرصيد الحالي</p>
                  <p className="text-lg font-bold font-mono text-slate-900">{fmtMoney(balance, b.currency)}</p>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  {b.iban && <p className="font-mono">{b.iban}</p>}
                  <p>مرتبط بحساب: {accountLabel(b.linkedAccountId)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{form.id ? "تعديل الحساب البنكي" : "إضافة حساب بنكي جديد"}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم البنك</label>
                <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="مثال: بنك الإمارات دبي الوطني" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">وصف الحساب</label>
                <input value={form.accountLabel} onChange={(e) => setForm({ ...form, accountLabel: e.target.value })} placeholder="مثال: الحساب الجاري الرئيسي" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">رقم الآيبان (IBAN)</label>
                  <input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} className={inputCls + " font-mono"} dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">رقم الحساب</label>
                  <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} className={inputCls + " font-mono"} dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">العملة</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">الرصيد الافتتاحي</label>
                  <input
                    type="number"
                    value={form.openingBalance}
                    onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                    className={inputCls + " font-mono"}
                    disabled={Boolean(form.id)}
                    title={form.id ? "لا يمكن تعديل الرصيد الافتتاحي بعد الإنشاء" : undefined}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">تاريخ الرصيد الافتتاحي</label>
                <input
                  type="date"
                  value={form.openingDate}
                  onChange={(e) => setForm({ ...form, openingDate: e.target.value })}
                  className={inputCls}
                  disabled={Boolean(form.id)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">الحساب المرتبط في شجرة الحسابات</label>
                <select value={form.linkedAccountId} onChange={(e) => setForm({ ...form, linkedAccountId: e.target.value })} className={inputCls}>
                  <option value="">اختر الحساب…</option>
                  {assetAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">ملاحظات (اختياري)</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={closeForm} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                إلغاء
              </button>
              <button onClick={saveForm} className="px-4 py-2 text-sm font-semibold text-white bg-[#0D382B] hover:bg-[#124d40] transition-colors rounded-xl">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingAccount && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد حذف الحساب البنكي</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من حذف <span className="font-bold">{deletingAccount.bankName} — {deletingAccount.accountLabel}</span>؟
              {hasTransactions && (
                <span className="block mt-2 text-rose-600 font-semibold">
                  تنبيه: توجد حركات بنكية مسجّلة على هذا الحساب، وستبقى مرتبطة بحساب محذوف. يُنصح بأرشفة الحساب (تعطيله) بدلاً من حذفه.
                </span>
              )}
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
