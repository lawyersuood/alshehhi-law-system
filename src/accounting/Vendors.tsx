import React, { useState } from "react";
import { Plus, Pencil, Trash2, X, Truck } from "lucide-react";
import { Vendor } from "./purchaseTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition";

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

export default function Vendors({
  vendors,
  setVendors,
  canManage,
  canDelete = canManage,
}: {
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  canManage: boolean;
  canDelete?: boolean;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setError("");
    setForm(emptyForm());
  };

  const openEdit = (v: Vendor) => {
    setError("");
    setForm({ id: v.id, name: v.name, trn: v.trn || "", phone: v.phone || "", email: v.email || "", notes: v.notes || "" });
  };

  const saveForm = () => {
    if (!form) return;
    if (!form.name.trim()) {
      setError("يرجى إدخال اسم المورد");
      return;
    }
    if (form.id) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === form.id
            ? { ...v, name: form.name.trim(), trn: form.trn.trim() || undefined, phone: form.phone.trim() || undefined, email: form.email.trim() || undefined, notes: form.notes.trim() || undefined }
            : v
        )
      );
    } else {
      setVendors((prev) => [
        ...prev,
        {
          id: `vnd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

  const toggleActive = (v: Vendor) => setVendors((prev) => prev.map((x) => (x.id === v.id ? { ...x, isActive: !x.isActive } : x)));
  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setVendors((prev) => prev.filter((v) => v.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const deletingVendor = vendors.find((v) => v.id === confirmDeleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">الموردون</h2>
          <p className="text-xs text-slate-500">سجل موردي وجهات مصروفات المكتب — {vendors.length} مورد مسجّل</p>
        </div>
        {canManage && (
          <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm">
            <Plus size={16} /> إضافة مورد
          </button>
        )}
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">المورد</th>
                <th className="px-4 py-2.5 font-semibold">الرقم الضريبي</th>
                <th className="px-4 py-2.5 font-semibold">التواصل</th>
                <th className="px-4 py-2.5 font-semibold">الحالة</th>
                {(canManage || canDelete) && <th className="px-4 py-2.5 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className={`border-b border-slate-50 last:border-0 ${!v.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-2.5 text-slate-800 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Truck size={13} className="text-slate-400" /> {v.name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{v.trn || "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{[v.phone, v.email].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${v.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {v.isActive ? "فعّال" : "معطّل"}
                    </span>
                  </td>
                  {(canManage || canDelete) && (
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        {canManage && (
                          <>
                            <button onClick={() => toggleActive(v)} className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1">
                              {v.isActive ? "تعطيل" : "تفعيل"}
                            </button>
                            <button onClick={() => openEdit(v)} className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50">
                              <Pencil size={14} />
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button onClick={() => requestDelete(v.id)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا يوجد موردون مسجّلون بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{form.id ? "تعديل بيانات المورد" : "إضافة مورد جديد"}</h3>
              <button onClick={() => setForm(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم المورد</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">الرقم الضريبي (اختياري)</label>
                <input value={form.trn} onChange={(e) => setForm({ ...form, trn: e.target.value })} className={inputCls + " font-mono"} dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">الهاتف</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">البريد الإلكتروني</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} dir="ltr" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">ملاحظات (اختياري)</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
              <button onClick={saveForm} className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد حذف المورد</h3>
            <p className="text-sm text-slate-600">هل أنت متأكد من حذف <span className="font-bold">{deletingVendor.name}</span>؟</p>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">حذف نهائياً</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
