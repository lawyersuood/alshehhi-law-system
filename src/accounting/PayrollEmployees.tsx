import React, { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, AlertTriangle, UserRound } from "lucide-react";
import { Account } from "./types";
import {
  PayrollEmployee,
  AllowanceItem,
  Payslip,
  SALARY_EXPENSE_ACCOUNT_CODE,
  SALARY_PAYABLE_ACCOUNT_CODE,
  grossSalary,
} from "./payrollTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

function emptyAllowance(): AllowanceItem {
  return { id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: "", amount: 0 };
}

interface FormState {
  id?: string;
  name: string;
  jobTitle: string;
  basicSalary: string;
  allowances: AllowanceItem[];
  salaryExpenseAccountId: string;
  salaryPayableAccountId: string;
  notes: string;
}

function emptyForm(defaults: { expId: string; payableId: string }): FormState {
  return {
    name: "",
    jobTitle: "",
    basicSalary: "",
    allowances: [],
    salaryExpenseAccountId: defaults.expId,
    salaryPayableAccountId: defaults.payableId,
    notes: "",
  };
}

export default function PayrollEmployees({
  accounts,
  employees,
  setEmployees,
  payslips,
  canManage,
  canDelete,
  currentUserName,
}: {
  accounts: Account[];
  employees: PayrollEmployee[];
  setEmployees: React.Dispatch<React.SetStateAction<PayrollEmployee[]>>;
  payslips: Payslip[];
  canManage: boolean;
  canDelete: boolean;
  currentUserName?: string;
}) {
  const expenseTypeAccounts = useMemo(() => accounts.filter((a) => a.isActive && a.type === "expense").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const liabilityTypeAccounts = useMemo(() => accounts.filter((a) => a.isActive && a.type === "liability").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const defaultExpAccount = useMemo(() => accounts.find((a) => a.code === SALARY_EXPENSE_ACCOUNT_CODE), [accounts]);
  const defaultPayableAccount = useMemo(() => accounts.find((a) => a.code === SALARY_PAYABLE_ACCOUNT_CODE), [accounts]);

  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setError("");
    setForm(emptyForm({ expId: defaultExpAccount?.id || "", payableId: defaultPayableAccount?.id || "" }));
  };

  const openEdit = (e: PayrollEmployee) => {
    setError("");
    setForm({
      id: e.id,
      name: e.name,
      jobTitle: e.jobTitle || "",
      basicSalary: String(e.basicSalary),
      allowances: e.allowances.map((a) => ({ ...a })),
      salaryExpenseAccountId: e.salaryExpenseAccountId,
      salaryPayableAccountId: e.salaryPayableAccountId,
      notes: e.notes || "",
    });
  };

  const updateAllowance = (id: string, patch: Partial<AllowanceItem>) =>
    setForm((f) => (f ? { ...f, allowances: f.allowances.map((a) => (a.id === id ? { ...a, ...patch } : a)) } : f));
  const addAllowance = () => setForm((f) => (f ? { ...f, allowances: [...f.allowances, emptyAllowance()] } : f));
  const removeAllowance = (id: string) => setForm((f) => (f ? { ...f, allowances: f.allowances.filter((a) => a.id !== id) } : f));

  const saveForm = () => {
    if (!form) return;
    if (!form.name.trim()) {
      setError("يرجى إدخال اسم الموظف");
      return;
    }
    const basicSalary = Number(form.basicSalary);
    if (!basicSalary || basicSalary <= 0) {
      setError("يرجى إدخال راتب أساسي صحيح أكبر من صفر");
      return;
    }
    if (!form.salaryExpenseAccountId || !form.salaryPayableAccountId) {
      setError("يرجى اختيار حساب مصروف الرواتب وحساب مستحقات الرواتب");
      return;
    }
    const validAllowances = form.allowances.filter((a) => a.label.trim() && a.amount > 0);
    if (form.id) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === form.id
            ? {
                ...e,
                name: form.name.trim(),
                jobTitle: form.jobTitle.trim() || undefined,
                basicSalary,
                allowances: validAllowances,
                salaryExpenseAccountId: form.salaryExpenseAccountId,
                salaryPayableAccountId: form.salaryPayableAccountId,
                notes: form.notes.trim() || undefined,
              }
            : e
        )
      );
    } else {
      setEmployees((prev) => [
        ...prev,
        {
          id: `emp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: form.name.trim(),
          jobTitle: form.jobTitle.trim() || undefined,
          basicSalary,
          allowances: validAllowances,
          salaryExpenseAccountId: form.salaryExpenseAccountId,
          salaryPayableAccountId: form.salaryPayableAccountId,
          isActive: true,
          notes: form.notes.trim() || undefined,
          createdAt: new Date().toISOString(),
          createdBy: currentUserName,
        },
      ]);
    }
    setForm(null);
  };

  const toggleActive = (e: PayrollEmployee) => setEmployees((prev) => prev.map((x) => (x.id === e.id ? { ...x, isActive: !x.isActive } : x)));
  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setEmployees((prev) => prev.filter((e) => e.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const deletingEmployee = employees.find((e) => e.id === confirmDeleteId);
  const canDeleteEmployee = (e: PayrollEmployee) => !payslips.some((p) => p.employeeId === e.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">سجل الموظفين (الرواتب)</h2>
          <p className="text-xs text-slate-500">سجل مستقل خاص بدورة الرواتب — {employees.length} موظف مسجّل</p>
        </div>
        {canManage && (
          <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]">
            <Plus size={16} /> إضافة موظف
          </button>
        )}
      </div>

      {(!defaultExpAccount || !defaultPayableAccount) && (
        <div className="flex items-center gap-2 rounded-xl bg-[#0D382B]/[0.05] border border-[#0D382B]/15 px-4 py-3 text-xs text-[#0D382B]">
          <AlertTriangle size={15} />
          تنبيه: لم يتم العثور على حساب "رواتب وأجور الموظفين" ({SALARY_EXPENSE_ACCOUNT_CODE}) أو حساب "رواتب ومستحقات الموظفين" (
          {SALARY_PAYABLE_ACCOUNT_CODE}) في شجرة الحسابات — يمكن اختيار حسابات بديلة يدوياً عند إضافة كل موظف.
        </div>
      )}

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">الموظف</th>
                <th className="px-4 py-2.5 font-semibold">المسمى الوظيفي</th>
                <th className="px-4 py-2.5 font-semibold">الراتب الأساسي</th>
                <th className="px-4 py-2.5 font-semibold">إجمالي البدلات</th>
                <th className="px-4 py-2.5 font-semibold">إجمالي الراتب</th>
                <th className="px-4 py-2.5 font-semibold">الحالة</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className={`border-b border-slate-50 last:border-0 ${!e.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-2.5 text-slate-800 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound size={13} className="text-slate-400" /> {e.name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{e.jobTitle || "—"}</td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(e.basicSalary)}</td>
                  <td className="px-4 py-2.5 font-mono">{fmtMoney(grossSalary(e) - e.basicSalary)}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold">{fmtMoney(grossSalary(e))}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        e.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {e.isActive ? "فعّال" : "معطّل"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      {canManage && (
                        <>
                          <button onClick={() => toggleActive(e)} className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1">
                            {e.isActive ? "تعطيل" : "تفعيل"}
                          </button>
                          <button onClick={() => openEdit(e)} className="p-1.5 text-slate-500 hover:text-[#0D382B] rounded-lg hover:bg-[#0D382B]/[0.06]">
                            <Pencil size={14} />
                          </button>
                        </>
                      )}
                      {canDelete && canDeleteEmployee(e) && (
                        <button onClick={() => requestDelete(e.id)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا يوجد موظفون مسجّلون بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{form.id ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</h3>
              <button onClick={() => setForm(null)} className="text-slate-400 hover:text-slate-700">
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
                <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم الموظف</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">المسمى الوظيفي (اختياري)</label>
                <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">الراتب الأساسي</label>
              <input type="number" min={0} value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} className={inputCls + " font-mono"} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">البدلات (اختياري)</label>
              {form.allowances.map((a) => (
                <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={a.label}
                    onChange={(e) => updateAllowance(a.id, { label: e.target.value })}
                    placeholder="مثال: بدل سكن"
                    className={inputCls + " col-span-7"}
                  />
                  <input
                    type="number"
                    min={0}
                    value={a.amount}
                    onChange={(e) => updateAllowance(a.id, { amount: Number(e.target.value) || 0 })}
                    className={inputCls + " col-span-4 font-mono"}
                  />
                  <button onClick={() => removeAllowance(a.id)} className="col-span-1 p-2 text-slate-400 hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addAllowance} className="text-xs font-semibold text-[#0D382B] hover:bg-[#0D382B]/[0.06] px-2 py-1.5 rounded-lg flex items-center gap-1">
                <Plus size={13} /> إضافة بدل
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">حساب مصروف الرواتب</label>
                <select value={form.salaryExpenseAccountId} onChange={(e) => setForm({ ...form, salaryExpenseAccountId: e.target.value })} className={inputCls}>
                  <option value="">اختر…</option>
                  {expenseTypeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">حساب مستحقات الرواتب</label>
                <select value={form.salaryPayableAccountId} onChange={(e) => setForm({ ...form, salaryPayableAccountId: e.target.value })} className={inputCls}>
                  <option value="">اختر…</option>
                  {liabilityTypeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">ملاحظات (اختياري)</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                إلغاء
              </button>
              <button onClick={saveForm} className="px-4 py-2 text-sm font-semibold text-white bg-[#0D382B] hover:bg-[#124d40] transition-colors rounded-xl">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingEmployee && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد حذف الموظف</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من حذف <span className="font-bold">{deletingEmployee.name}</span>؟
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
