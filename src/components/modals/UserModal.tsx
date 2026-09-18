import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import {
  ROLE_PRESETS,
  PERMISSION_MODULES,
  DETAILED_ACTION_PERMISSIONS,
  hasTabPermission,
} from "../../domain/permissions";
import { ShieldCheck, Key, Trash2 } from "lucide-react";
import type { UserItem, RolePermissions } from "../../domain/types";

export interface UserModalProps {
  editingUser: UserItem | null;
  currentUserId: number;
  form: Record<string, any>;
  setForm: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
  onDeleteUser: (userId: number) => void;
  setEditingUser: (u: UserItem | null) => void;
}

/**
 * نافذة "إضافة/تعديل مستخدم وصلاحياته" — الخطوة الثانية والعشرون من تفكيك App.tsx التدريجي.
 * (نافذة حساسة أمنياً — منطق الصلاحيات مطابق تماماً للأصل دون أي تعديل).
 */
export default function UserModal({
  editingUser,
  currentUserId,
  form,
  setForm,
  onFieldChange,
  onSave,
  onClose,
  onDeleteUser,
  setEditingUser,
}: UserModalProps) {
  return (
    <Modal
      title={editingUser ? `تعديل بيانات: ${editingUser.name}` : "إضافة مستخدم جديد بالفريق"}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <Field label="الاسم الكامل">
          <input
            onChange={onFieldChange("name")}
            defaultValue={form.name || ""}
            placeholder="اسم الموظف أو المحامي"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="البريد الإلكتروني">
            <input
              onChange={onFieldChange("email")}
              defaultValue={form.email || ""}
              placeholder="user@law.ae"
              className={inputCls}
            />
          </Field>
          <Field label="رقم الهاتف">
            <input
              onChange={onFieldChange("phone")}
              defaultValue={form.phone || ""}
              placeholder="050-XXXXXXX"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="الدور / القالب المسبق">
          <select
            value={form.roleKey || "lawyer"}
            onChange={(e) => {
              const rKey = e.target.value;
              const preset = ROLE_PRESETS[rKey];
              setForm((prev) => ({
                ...prev,
                roleKey: rKey,
                roleTitle: preset ? preset.title : prev.roleTitle,
                permissions: preset ? { ...preset.permissions } : prev.permissions,
              }));
            }}
            className={inputCls}
          >
            <option value="admin">مدير النظام / محامٍ شريك (كل الصلاحيات)</option>
            <option value="supervisor">مشرف ومراجع إداري (شامل الإشراف والتصاريح)</option>
            <option value="lawyer">محامٍ ومستشار قانوني (قضايا وجلسات ومهام)</option>
            <option value="secretary">مسؤول سكرتارية وتنسيق (مواعيد وموكلين)</option>
            <option value="accountant">محاسب المكتب والضريبة (فواتير وأتعاب)</option>
          </select>
        </Field>
        <Field label="المسمى الوظيفي">
          <input
            onChange={onFieldChange("roleTitle")}
            defaultValue={form.roleTitle || ""}
            placeholder="مثال: محامي استئناف ومدني"
            className={inputCls}
          />
        </Field>
        <Field label="رقم قيد المحامي (نقابة المحامين) — يُستخدم في مستندات الإنابة">
          <input
            onChange={onFieldChange("licenseNumber")}
            defaultValue={form.licenseNumber || ""}
            placeholder="مثال: 1754"
            className={inputCls}
          />
        </Field>
        <Field label="كلمة المرور المسجلة (مشفّرة وآمنة)">
          <input
            type="password"
            readOnly
            disabled
            value="••••••••"
            className={`${inputCls} bg-stone-100 text-slate-500 cursor-not-allowed`}
          />
        </Field>

        {/* تخصيص صلاحيات الوصول للأقسام والتبويبات الـ 18 */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-amber-600" />
              صلاحيات الأقسام والتبويبات الـ {PERMISSION_MODULES.length} (System Modules):
            </p>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 font-mono">
              {
                Object.keys(
                  form.permissions || ROLE_PRESETS[form.roleKey || "lawyer"]?.permissions || {},
                ).filter(
                  (k) =>
                    PERMISSION_MODULES.some((m) => m.id === k) &&
                    Boolean(
                      (form.permissions ||
                        ROLE_PRESETS[form.roleKey || "lawyer"]?.permissions ||
                        {})[k as keyof RolePermissions],
                    ),
                ).length
              }{" "}
              / {PERMISSION_MODULES.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            تطبيق سياسة الحظر الافتراضي: الأقسام المحددة باللون الأخضر فقط هي ما يُصرح للموظف
            بمشاهدتها والتنقل إليها.
          </p>

          <div className="max-h-64 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
            {(
              [
                "العمليات القانونية",
                "التواصل والمهام",
                "المالية والعقود",
                "الإدارة والامتثال",
              ] as const
            ).map((cat) => {
              const catModules = PERMISSION_MODULES.filter((m) => m.category === cat);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {cat} ({catModules.length} أقسام)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catModules.map((mod) => {
                      const activePerms =
                        form.permissions ||
                        (editingUser
                          ? editingUser.permissions
                          : ROLE_PRESETS[form.roleKey || "lawyer"]?.permissions) ||
                        {};
                      const isEnabled = Boolean(
                        activePerms[mod.id] ||
                        (editingUser && hasTabPermission(editingUser, mod.navTabIds[0])),
                      );
                      return (
                        <label
                          key={mod.id}
                          className={`flex items-start gap-2 p-2 rounded-xl border transition cursor-pointer ${
                            isEnabled
                              ? "bg-emerald-50 border-emerald-300 text-slate-900"
                              : "bg-white border-slate-200 text-slate-400 hover:bg-[#0D382B]/[0.06] transition-colors"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setForm((prev) => {
                                const basePerms =
                                  prev.permissions ||
                                  (editingUser
                                    ? editingUser.permissions
                                    : ROLE_PRESETS[prev.roleKey || "lawyer"]?.permissions) ||
                                  {};
                                return {
                                  ...prev,
                                  permissions: {
                                    ...basePerms,
                                    [mod.id]: checked,
                                  },
                                };
                              });
                            }}
                            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="text-xs">
                            <span className="font-bold block leading-tight text-slate-900">
                              {mod.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                              {mod.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* مصفوفة صلاحيات العمليات الدقيقة والتفويضات الإجرائية */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Key size={14} className="text-amber-600" />
              صلاحيات العمليات والتقاضي الدقيقة (Granular Action Permissions):
            </p>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
              {DETAILED_ACTION_PERMISSIONS.length} إجراء
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white">
            {DETAILED_ACTION_PERMISSIONS.map((action) => {
              const activePerms =
                form.permissions ||
                (editingUser
                  ? editingUser.permissions
                  : ROLE_PRESETS[form.roleKey || "lawyer"]?.permissions) ||
                {};
              const isEnabled = Boolean(activePerms[action.id]);
              return (
                <label
                  key={action.id}
                  className={`flex items-start gap-2 p-2 rounded-xl border transition cursor-pointer text-xs ${
                    isEnabled
                      ? action.isSensitive
                        ? "bg-red-50/60 border-red-300 text-red-900"
                        : "bg-amber-50/60 border-amber-300 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-[#0D382B]/[0.06] transition-colors"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((prev) => {
                        const basePerms =
                          prev.permissions ||
                          (editingUser
                            ? editingUser.permissions
                            : ROLE_PRESETS[prev.roleKey || "lawyer"]?.permissions) ||
                          {};
                        return {
                          ...prev,
                          permissions: {
                            ...basePerms,
                            [action.id]: checked,
                          },
                        };
                      });
                    }}
                    className={`mt-0.5 rounded border-slate-300 ${action.isSensitive ? "text-red-600 focus:ring-red-500" : "text-amber-600 focus:ring-amber-500"}`}
                  />
                  <div>
                    <span className="font-bold block leading-tight text-slate-900 flex items-center gap-1">
                      {action.label}
                      {action.isSensitive && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                          حساس
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                      {action.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-xs font-bold text-slate-800">
            التفويضات الاستثنائية الحصرية (تمنح بواسطة المحامي سعود):
          </p>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
            <input
              type="checkbox"
              defaultChecked={editingUser ? editingUser.canTransferContacts : false}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, canTransferContacts: e.target.checked }))
              }
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            تفويض نقل وتصنيف الموكلين بين أفراد وشركات
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
            <input
              type="checkbox"
              defaultChecked={editingUser ? editingUser.canViewAgreements : false}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, canViewAgreements: e.target.checked }))
              }
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            تفويض الاطلاع على اتفاقيات وصيغ عقود المكتب
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
            <input
              type="checkbox"
              defaultChecked={editingUser ? editingUser.canAccessWhatsapp : false}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, canAccessWhatsapp: e.target.checked }))
              }
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            تفويض استخدام واتساب المكتب المباشر
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
            <input
              type="checkbox"
              defaultChecked={editingUser ? editingUser.canViewFinances : false}
              onChange={(e) => setForm((prev) => ({ ...prev, canViewFinances: e.target.checked }))}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            تفويض الوصول للنظام المالي والفواتير والضريبة
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {editingUser && editingUser.id !== currentUserId ? (
            <button
              type="button"
              onClick={() => {
                const uId = editingUser.id;
                setEditingUser(null);
                onClose();
                onDeleteUser(uId);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
            >
              <Trash2 size={15} /> حذف الحساب
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onSave}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700"
          >
            حفظ بيانات المستخدم والصلاحيات
          </button>
        </div>
      </div>
    </Modal>
  );
}
