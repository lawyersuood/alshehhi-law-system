import React, { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, User } from "lucide-react";
import { Customer } from "./customerTypes";
import { SalesInvoice, SalesPayment, invoiceTotals, amountPaid } from "./salesTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

interface FormState {
  id?: string;
  name: string;
  trn: string;
  phone: string;
  email: string;
  notes: string;
}

function emptyForm(): FormState {
  return { name: "", trn: "", phone: "", email: "", notes: "" };
}

export default function Customers({
  customers,
  setCustomers,
  invoices,
  payments,
  canManage,
  canDelete = canManage,
}: {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  invoices: SalesInvoice[];
  payments: SalesPayment[];
  canManage: boolean;
  canDelete?: boolean;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // مطابقة بالاسم فقط — لا يوجد ربط هيكلي حقيقي بمعرّف العميل على الفاتورة بعد
  // (انظر ROADMAP_NOTES.md لخطة الربط المؤجلة)
  const statsByName = useMemo(() => {
    const map = new Map<string, { invoiced: number; paid: number; count: number }>();
    for (const inv of invoices) {
      if (inv.status === "cancelled") continue;
      const key = inv.clientName.trim().toLowerCase();
      const totals = invoiceTotals(inv);
      const paid = amountPaid(inv.id, payments);
      const cur = map.get(key) || { invoiced: 0, paid: 0, count: 0 };
      cur.invoiced += totals.grandTotal;
      cur.paid += paid;
      cur.count += 1;
      map.set(key, cur);
    }
    return map;
  }, [invoices, payments]);

  const openNew = () => {
    setError("");
    setForm(emptyForm());
  };

  const openEdit = (c: Customer) => {
    setError("");
    setForm({
      id: c.id,
      name: c.name,
      trn: c.trn || "",
      phone: c.phone || "",
      email: c.email || "",
      notes: c.notes || "",
    });
  };

  const saveForm = () => {
    if (!form) return;
    if (!form.name.trim()) {
      setError("يرجى إدخال اسم العميل");
      return;
    }
    if (form.id) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === form.id
            ? {
                ...c,
                name: form.name.trim(),
                trn: form.trn.trim() || undefined,
                phone: form.phone.trim() || undefined,
                email: form.email.trim() || undefined,
                notes: form.notes.trim() || undefined,
              }
            : c,
        ),
      );
    } else {
      setCustomers((prev) => [
        ...prev,
        {
          id: `cus-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: form.name.trim(),
          trn: form.trn.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          notes: form.notes.trim() || undefined,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setForm(null);
  };

  const toggleActive = (c: Customer) =>
    setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)));
  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setCustomers((prev) => prev.filter((c) => c.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const deletingCustomer = customers.find((c) => c.id === confirmDeleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">العملاء</h2>
          <p className="text-xs text-slate-500">
            سجل بيانات تواصل العملاء لاستخدامها عند إصدار عروض الأسعار والفواتير —{" "}
            {customers.length} عميل مسجّل
          </p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> إضافة عميل
          </button>
        )}
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">العميل</th>
                <th className="px-4 py-2.5 font-semibold">الرقم الضريبي</th>
                <th className="px-4 py-2.5 font-semibold">التواصل</th>
                <th className="px-4 py-2.5 font-semibold">عدد الفواتير</th>
                <th className="px-4 py-2.5 font-semibold">إجمالي الفوترة</th>
                <th className="px-4 py-2.5 font-semibold">المتبقي</th>
                <th className="px-4 py-2.5 font-semibold">الحالة</th>
                {(canManage || canDelete) && <th className="px-4 py-2.5 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const stats = statsByName.get(c.name.trim().toLowerCase());
                const outstanding = stats ? stats.invoiced - stats.paid : 0;
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-50 last:border-0 ${!c.isActive ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-slate-800 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" /> {c.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{c.trn || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {[c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{stats?.count || 0}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-800">
                      {fmtMoney(stats?.invoiced || 0)}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-bold ${outstanding > 0 ? "text-[#C5A059]" : "text-slate-400"}`}
                    >
                      {fmtMoney(outstanding)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                      >
                        {c.isActive ? "فعّال" : "معطّل"}
                      </span>
                    </td>
                    {(canManage || canDelete) && (
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          {canManage && (
                            <>
                              <button
                                onClick={() => toggleActive(c)}
                                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                              >
                                {c.isActive ? "تعطيل" : "تفعيل"}
                              </button>
                              <button
                                onClick={() => openEdit(c)}
                                className="p-1.5 text-slate-500 hover:text-[#0D382B] rounded-lg hover:bg-[#0D382B]/[0.06]"
                              >
                                <Pencil size={14} />
                              </button>
                            </>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => requestDelete(c.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا يوجد عملاء مسجّلون بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setForm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {form.id ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
              </h3>
              <button onClick={() => setForm(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  اسم العميل
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  يجب كتابة الاسم بنفس الصيغة المستخدمة في الفواتير حتى تظهر إحصائيات الفوترة بشكل
                  صحيح
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  الرقم الضريبي (اختياري)
                </label>
                <input
                  value={form.trn}
                  onChange={(e) => setForm({ ...form, trn: e.target.value })}
                  className={inputCls + " font-mono"}
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">الهاتف</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputCls}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    البريد الإلكتروني
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputCls}
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  ملاحظات (اختياري)
                </label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setForm(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={saveForm}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#0D382B] hover:bg-[#124d40] transition-colors rounded-xl"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingCustomer && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900">تأكيد حذف العميل</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من حذف <span className="font-bold">{deletingCustomer.name}</span>؟
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
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
