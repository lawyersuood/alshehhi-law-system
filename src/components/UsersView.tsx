import React from "react";
import {
  ShieldCheck,
  Database,
  UserPlus,
  Sparkles,
  Hourglass,
  CheckCircle2,
  UserCheck,
  Trash2,
  Key,
  Shield,
  Briefcase,
  Users,
  Receipt,
  Lock,
  Edit2,
  Check,
  Minus,
} from "lucide-react";
import { Badge } from "./AuthScreens";
import { UserItem, RolePermissions } from "../domain/types";
import { PERMISSION_MODULES } from "../domain/permissions";
import { getActivePermissionsCount, hasTabPermission } from "../domain/permissions";

export interface UsersViewProps {
  setShowBackupModal: (v: boolean) => void;
  checkPerm: (...args: any[]) => boolean;
  setEditingUser: (u: UserItem | null) => void;
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setModal: (v: string | null) => void;
  isAiAssistantEnabled: boolean;
  setIsAiAssistantEnabled: (v: boolean) => void;
  isAdmin: boolean;
  pendingUsers: UserItem[];
  approveUser: (userId: number) => void;
  rejectUser: (userId: number) => void;
  currentUser: UserItem;
  currentUserId: number;
  users: UserItem[];
  setCurrentUserId: (id: number) => void;
  logAuditAction: (...args: any[]) => void;
  isSuperAdmin: boolean;
  handleDeleteUser: (userId: number) => void;
  toggleUserPermission: (userId: number, permKey: keyof RolePermissions) => void;
}

export default function UsersView({
  setShowBackupModal,
  checkPerm,
  setEditingUser,
  setForm,
  setModal,
  isAiAssistantEnabled,
  setIsAiAssistantEnabled,
  isAdmin,
  pendingUsers,
  approveUser,
  rejectUser,
  currentUser,
  currentUserId,
  users,
  setCurrentUserId,
  logAuditAction,
  isSuperAdmin,
  handleDeleteUser,
  toggleUserPermission,
}: UsersViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-amber-600" /> إدارة المستخدمين ومصفوفة الصلاحيات
          </h2>
          <p className="text-xs text-slate-500">
            تخصيص الأدوار، تقييد الوصول حسب الوظيفة، ومتابعة فريق العمل بالمكتب
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBackupModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
          >
            <Database size={16} /> تصدير واستعادة بيانات المكتب (JSON)
          </button>
          <button
            onClick={() => {
              if (!checkPerm("manageUsers", "إضافة مستخدم")) return;
              setEditingUser(null);
              setForm({});
              setModal("user");
            }}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <UserPlus size={16} /> إضافة مستخدم جديد
          </button>
        </div>
      </div>

      {/* بطاقة التحكم بتفعيل أو إلغاء المساعد الذكي (AI Assistant Toggle) */}
      <div className="app-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              المساعد الذكي القانوني (Gemini AI Assistant)
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isAiAssistantEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
              >
                {isAiAssistantEnabled ? "مُفَعّل حالياً" : "مُلغَى / مُعطّل حالياً"}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              التحكم بإعادة تفعيل أو إلغاء المساعد الذكي والزر العائم والتحليلات الآلية بجميع
              الأقسام
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiAssistantEnabled(!isAiAssistantEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
            isAiAssistantEnabled
              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              : "bg-emerald-700 text-white hover:bg-emerald-800"
          }`}
        >
          <Sparkles size={15} />
          {isAiAssistantEnabled ? "إلغاء وتعطيل المساعد الذكي" : "إعادة تفعيل المساعد الذكي"}
        </button>
      </div>

      {/* قسم طلبات التفعيل المعلقة Supabase User Approval Flow (Admin Only) */}
      {isAdmin && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-900 font-bold shadow-xs">
                <Hourglass size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  طلبات الاعتماد والموافقة على المستخدمين الجدد (User Approval Flow)
                  {pendingUsers.length > 0 && (
                    <span className="rounded-full bg-amber-500 text-slate-900 px-2.5 py-0.5 text-xs font-bold">
                      {pendingUsers.length} معلق
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-600">
                  المستخدمون المسجلون الذين ينتظرون الموافقة بحاجة لتفعيل صريح للوصول إلى النظام
                </p>
              </div>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border border-amber-200/80 text-xs text-slate-600 flex items-center justify-between">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                لا توجد طلبات تسجيل معلقة حالياً. جميع الحسابات نشطة ومصرح لها بالدخول للنظام.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingUsers.map((pUser) => (
                <div
                  key={pUser.id}
                  className="rounded-2xl border border-amber-300 bg-white p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {pUser.name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                          معلق (Pending)
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pUser.email} • {pUser.phone}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                      {pUser.roleTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => approveUser(pUser.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      <UserCheck size={14} /> قبول وتفعيل الحساب (Approved)
                    </button>
                    <button
                      onClick={() => rejectUser(pUser.id)}
                      className="flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} /> رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* بطاقة الحساب الحالي الناشط */}
      <div className="p-4 rounded-2xl bg-gradient-to-l from-slate-900 to-slate-800 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${currentUser.avatarBg}`}
          >
            {currentUser.avatarText}
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              {currentUser.name}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 font-bold uppercase">
                المستخدم الحالي
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              {currentUser.roleTitle} • {currentUser.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-800/80 p-2 rounded-xl border border-slate-700">
          <Key size={14} className="text-amber-400" />
          <span>
            الصلاحيات المتاحة:{" "}
            <b>
              {getActivePermissionsCount(currentUser)} من {PERMISSION_MODULES.length}
            </b>
          </span>
        </div>
      </div>

      {/* دليل أدوار المستخدمين المتاحة */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            key: "admin",
            name: "مدير النظام / شريك",
            icon: ShieldCheck,
            color: "border-amber-400 bg-amber-50/50 text-amber-800",
            desc: "كامل الصلاحيات القانونية والمالية والإدارية وحذف الملفات",
          },
          {
            key: "supervisor",
            name: "مشرف ومراجع إداري",
            icon: Shield,
            color: "border-blue-400 bg-blue-50/50 text-blue-800",
            desc: "الإشراف الشامل والمراجعة والتدقيق مع حظر حذف الملفات",
          },
          {
            key: "lawyer",
            name: "محامٍ مستشار",
            icon: Briefcase,
            color: "border-indigo-400 bg-indigo-50/50 text-indigo-800",
            desc: "القضايا والجلسات والمستندات والمهام دون تعديل الفواتير",
          },
          {
            key: "secretary",
            name: "سكرتارية وتنسيق",
            icon: Users,
            color: "border-purple-400 bg-purple-50/50 text-purple-800",
            desc: "المواعيد والجلسات والموكلين دون الاطلاع على الأتعاب",
          },
          {
            key: "accountant",
            name: "محاسب المكتب",
            icon: Receipt,
            color: "border-emerald-400 bg-emerald-50/50 text-emerald-800",
            desc: "الفواتير والأتعاب والضريبة والامتثال وإدارة الكادر",
          },
        ].map((role) => (
          <div key={role.key} className={`p-4 rounded-2xl border ${role.color} space-y-1.5`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              <role.icon size={16} />
              <span>{role.name}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-80">{role.desc}</p>
          </div>
        ))}
      </div>

      {/* جدول فريق العمل */}
      <div className="app-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">سجل أعضاء فريق العمل بالمكتب</h3>
          <span className="text-xs text-slate-500 font-medium">
            إجمالي: {users.length} مستخدمين
          </span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-[#0D382B]/[0.035] text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/70 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold">المستخدم</th>
                <th className="px-4 py-3 font-semibold">الوظيفة والدور</th>
                <th className="px-4 py-3 font-semibold">البريد والهاتف</th>
                <th className="px-4 py-3 font-semibold">كلمة المرور</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold text-center">الأقسام المصرح بها</th>
                {/* عمود ثابت (sticky) حتى تبقى أزرار التعديل والحذف ظاهرة دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-center bg-[#faf9f6] shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {users.map((u) => {
                const openCount = getActivePermissionsCount(u);
                const totalCount = PERMISSION_MODULES.length;
                return (
                  <tr key={u.id} className="hover:bg-amber-50/40 group">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.avatarBg}`}
                        >
                          {u.avatarText}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">{u.name}</p>
                          {u.id === currentUserId && (
                            <span className="text-[10px] text-amber-600 font-semibold">(أنت)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          u.roleKey === "admin"
                            ? "bg-amber-100 text-amber-800"
                            : u.roleKey === "lawyer"
                              ? "bg-indigo-100 text-indigo-700"
                              : u.roleKey === "accountant"
                                ? "bg-emerald-100 text-emerald-700"
                                : u.roleKey === "supervisor"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                        }
                      >
                        {u.roleTitle}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p>{u.email}</p>
                      <p className="text-slate-400">{u.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg text-slate-800 font-mono font-bold"
                        title="مشفّرة وآمنة"
                      >
                        <Lock size={12} className="text-amber-600" />
                        ••••••••
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.status === "نشط" || u.status === "approved" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                          نشط (Approved)
                        </Badge>
                      ) : u.status === "معلق" || u.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">
                            معلق (Pending)
                          </Badge>
                          <button
                            onClick={() => approveUser(u.id)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                            title="قبول واعتماد الحساب"
                          >
                            قبول
                          </button>
                        </div>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-500">{u.status}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {openCount} / {totalCount}
                      </span>
                    </td>
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-amber-50/40 px-4 py-3 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (!checkPerm("manageUsers", "تعديل المستخدم")) return;
                            setEditingUser(u);
                            setForm({
                              name: u.name,
                              email: u.email,
                              phone: u.phone,
                              password: "", // نترك الحقل فارغاً دائماً عند التعديل — القيمة المخزّنة قد تكون مُجزّأة (hash)، وتركه فارغاً يعني "الإبقاء على كلمة المرور الحالية كما هي" (راجع saveUser)
                              roleKey: u.roleKey,
                              roleTitle: u.roleTitle,
                              status: u.status,
                              permissions: { ...u.permissions },
                              licenseNumber: u.licenseNumber || "",
                            });
                            setModal("user");
                          }}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-[#0D382B]/[0.06] transition-colors rounded-lg"
                          title="تعديل بيانات الدور"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (!isSuperAdmin) {
                              alert("هذا الإجراء (تجربة الحساب) متاح فقط لمدير النظام.");
                              return;
                            }
                            if (
                              !window.confirm(
                                `تأكيد: سيتم الآن الدخول باسم المستخدم "${u.name}" (${u.email}). سيُسجَّل هذا الإجراء في سجل التدقيق. هل تريد المتابعة؟`,
                              )
                            )
                              return;
                            logAuditAction(
                              "UPDATE",
                              "المستخدمون",
                              u.name,
                              `دخول مدير النظام كمستخدم آخر (تجربة الحساب) للمستخدم: ${u.name} (${u.email})`,
                              u.id,
                            );
                            setCurrentUserId(u.id);
                          }}
                          className="text-xs bg-stone-100 border border-slate-200 px-2 py-1 rounded-lg hover:bg-amber-50 hover:border-amber-300 font-semibold"
                        >
                          تجربة الحساب
                        </button>
                        {u.id !== currentUserId && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                            title="حذف هذا الحساب نهائياً من النظام"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* مصفوفة الصلاحيات التفصيلية التفاعلية للأقسام الـ 18 المعتمدة */}
      <div className="app-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="text-amber-600" /> مصفوفة التحكم التفاعلية بالأقسام والتبويبات
              الـ {PERMISSION_MODULES.length} (Permission Matrix)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              سياسة الحظر الافتراضي (Default-Deny Policy): يمكنك النقر على خانة أي قسم لتفعيله أو
              إلغائه فوراً لكل عضو (المزامنة حية ومباشرة مع الملف التعريفي)
            </p>
          </div>
          <Badge className="bg-amber-100 text-amber-900 font-bold border border-amber-300">
            إجمالي الأقسام: {PERMISSION_MODULES.length} قسماً معتمداً
          </Badge>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="bg-slate-900 text-white text-right">
              <tr>
                <th className="p-3 rounded-r-xl">
                  القسم / الموديول ({PERMISSION_MODULES.length} قسماً)
                </th>
                {users.map((u) => (
                  <th key={u.id} className="p-3 text-center font-bold">
                    {u.name}
                    <span className="block text-[10px] text-amber-400 font-normal">
                      {u.roleTitle.split("—")[0]}
                    </span>
                    <span className="block text-[10px] font-mono font-normal text-slate-300 mt-0.5">
                      ({getActivePermissionsCount(u)}/{PERMISSION_MODULES.length})
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {PERMISSION_MODULES.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-slate-600 font-normal">
                        {mod.category}
                      </span>
                      <p className="font-bold text-slate-900">{mod.label}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">{mod.desc}</p>
                  </td>
                  {users.map((u) => {
                    const hasIt = hasTabPermission(u, mod.navTabIds[0]);
                    return (
                      <td key={u.id} className="p-3 text-center">
                        <button
                          onClick={() => toggleUserPermission(u.id, mod.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${hasIt ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600" : "bg-slate-100 text-slate-300 hover:bg-[#0D382B]/[0.08] transition-colors"}`}
                          title={`انقر لتعديل صلاحية قسم [${mod.label}] لـ ${u.name}`}
                        >
                          {hasIt ? <Check size={16} /> : <Minus size={16} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
