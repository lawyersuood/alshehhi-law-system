import React, { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Lock } from "lucide-react";
import { Account, AccountType, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ORDER } from "./types";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition";

const TYPE_BADGE_CLS: Record<AccountType, string> = {
  asset: "bg-sky-50 text-sky-700 border-sky-200",
  liability: "bg-rose-50 text-rose-700 border-rose-200",
  equity: "bg-violet-50 text-violet-700 border-violet-200",
  revenue: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expense: "bg-amber-50 text-amber-700 border-amber-200",
};

interface FormState {
  id?: string;
  code: string;
  name: string;
  type: AccountType;
  notes: string;
  isActive: boolean;
}

const emptyForm: FormState = { code: "", name: "", type: "asset", notes: "", isActive: true };

export default function ChartOfAccounts({
  accounts,
  setAccounts,
  canManage,
}: {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "all">("all");
  const [showInactive, setShowInactive] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (!showInactive && !a.isActive) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!a.code.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [accounts, typeFilter, showInactive, query]);

  const grouped = useMemo(() => {
    const map = new Map<AccountType, Account[]>();
    for (const t of ACCOUNT_TYPE_ORDER) map.set(t, []);
    for (const a of filtered) map.get(a.type)?.push(a);
    for (const arr of map.values()) arr.sort((a, b) => a.code.localeCompare(b.code));
    return map;
  }, [filtered]);

  const openNew = () => {
    setError("");
    setForm({ ...emptyForm });
  };

  const openEdit = (a: Account) => {
    setError("");
    setForm({ id: a.id, code: a.code, name: a.name, type: a.type, notes: a.notes || "", isActive: a.isActive });
  };

  const closeForm = () => setForm(null);

  const saveForm = () => {
    if (!form) return;
    const code = form.code.trim();
    const name = form.name.trim();
    if (!code || !name) {
      setError("يرجى إدخال رقم الحساب واسمه");
      return;
    }
    const duplicate = accounts.find((a) => a.code === code && a.id !== form.id);
    if (duplicate) {
      setError(`رقم الحساب ${code} مستخدم بالفعل لحساب "${duplicate.name}"`);
      return;
    }
    if (form.id) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === form.id ? { ...a, code, name, type: form.type, notes: form.notes.trim() || undefined, isActive: form.isActive } : a
        )
      );
    } else {
      setAccounts((prev) => [
        ...prev,
        {
          id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name,
          type: form.type,
          parentId: null,
          isActive: true,
          isSystem: false,
          notes: form.notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setForm(null);
  };

  const requestDelete = (a: Account) => setConfirmDeleteId(a.id);

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setAccounts((prev) => prev.filter((a) => a.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const toggleActive = (a: Account) => {
    setAccounts((prev) => prev.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)));
  };

  const deletingAccount = accounts.find((a) => a.id === confirmDeleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">شجرة الحسابات</h2>
          <p className="text-xs text-slate-500">دليل الحسابات المحاسبي المعتمد للمكتب — {accounts.length} حساب مسجّل</p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"
          >
            <Plus size={16} /> إضافة حساب جديد
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث برقم الحساب أو اسمه…"
            className={inputCls + " pr-9"}
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as AccountType | "all")} className={inputCls + " w-auto"}>
          <option value="all">كل الأنواع</option>
          {ACCOUNT_TYPE_ORDER.map((t) => (
            <option key={t} value={t}>
              {ACCOUNT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          إظهار الحسابات المعطّلة
        </label>
      </div>

      <div className="space-y-5">
        {ACCOUNT_TYPE_ORDER.map((t) => {
          const list = grouped.get(t) || [];
          if (list.length === 0) return null;
          return (
            <div key={t} className="app-card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <h3 className="text-sm font-bold text-slate-800">{ACCOUNT_TYPE_LABELS[t]}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right text-xs text-slate-500 border-b border-slate-100">
                      <th className="px-4 py-2 font-semibold">الرقم</th>
                      <th className="px-4 py-2 font-semibold">اسم الحساب</th>
                      <th className="px-4 py-2 font-semibold">ملاحظات</th>
                      <th className="px-4 py-2 font-semibold">الحالة</th>
                      {canManage && <th className="px-4 py-2 font-semibold"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((a) => (
                      <tr key={a.id} className={`border-b border-slate-50 last:border-0 ${!a.isActive ? "opacity-50" : ""}`}>
                        <td className="px-4 py-2.5 font-mono text-slate-700">{a.code}</td>
                        <td className="px-4 py-2.5 text-slate-800 font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            {a.name}
                            {a.isSystem && <Lock size={12} className="text-slate-300" title="حساب أساسي من الشجرة الافتراضية" />}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{a.notes || "—"}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              a.isActive ? TYPE_BADGE_CLS[a.type] : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {a.isActive ? "فعّال" : "معطّل"}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => toggleActive(a)} className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1">
                                {a.isActive ? "تعطيل" : "تفعيل"}
                              </button>
                              <button onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50">
                                <Pencil size={14} />
                              </button>
                              {!a.isSystem && (
                                <button onClick={() => requestDelete(a)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="app-card p-8 text-center text-sm text-slate-500">لا توجد حسابات مطابقة لخيارات البحث الحالية</div>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{form.id ? "تعديل الحساب" : "إضافة حساب جديد"}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">رقم الحساب</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="مثال: 1015"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم الحساب</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: صندوق فرع دبي"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">نوع الحساب</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })} className={inputCls}>
                  {ACCOUNT_TYPE_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {ACCOUNT_TYPE_LABELS[t]}
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
              <button onClick={saveForm} className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingAccount && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد حذف الحساب</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من حذف الحساب <span className="font-bold">{deletingAccount.code} — {deletingAccount.name}</span>؟ لا يمكن التراجع عن هذا
              الإجراء.
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
