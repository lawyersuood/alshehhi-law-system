import React, { useState } from "react";
import {
  Plus, Users, UserCheck, BellRing, ChevronLeft, AlertTriangle, Clock, Hourglass,
  CheckCircle2, User, Briefcase, Smartphone, TrendingUp, Gavel, Receipt, CheckSquare, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Badge } from "./AuthScreens";
import { CaseItem, Hearing, TaskItem, RolePermissions } from "../domain/types";
import { TASK_PRIORITY } from "../domain/constants";
import { fmtAED, fmtDate, daysUntil } from "../domain/utils";

export interface NotifyModalState {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  channel: "واتساب" | "إيميل" | "كلاهما";
  type: "تنبيه جلسة" | "تحديث قضية" | "تذكير فاتورة" | "تجديد وثائق / KYC" | "تجديد وكالة / POA" | "تنبيه ميعاد طعن / استئناف" | "تذكير قسط فاتورة" | "رسالة عامة";
  subject: string;
  message: string;
  relatedRef?: string;
}

export interface DashboardViewProps {
  isAdmin: boolean;
  pendingUsers: { name: string; email: string }[];
  setTab: (tab: string) => void;
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  urgentTasks24h: TaskItem[];
  cases: CaseItem[];
  checkPerm: (
    permKey: keyof RolePermissions,
    actionName: string,
    context?: { section?: string; title?: string; details?: string; targetId?: string | number; isDelete?: boolean }
  ) => boolean;
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  users: { name: string; phone?: string; email?: string }[];
  setNotifyModal: (v: NotifyModalState | null) => void;
  canViewFinancials: boolean;
  stats: { active: number; weekHearings: number; dueAmount: number; expiringPoa: number };
  casesByType: { name: string; value: number; percentage: number; color: string }[];
  invoiceMetrics: {
    totalInvoiced: number;
    paidAmount: number;
    sentDueAmount: number;
    overdueAmount: number;
    draftAmount: number;
    collectionRate: number;
    summaryByAmount: { name: string; value: number; count: number; color: string; percentage: number }[];
    summaryByCount: { name: string; value: number; amount: number; color: string; percentage: number }[];
    totalCount: number;
  };
  tasksMetrics: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    dueToday: number;
    inProgress: number;
    completionRate: number;
    statusChartData: { name: string; value: number; color: string; percentage: number }[];
    priorityChartData: any[];
  };
  urgentTodayOrOverdueTasks: TaskItem[];
  upcoming: Hearing[];
  caseNo: (id: number) => string;
}

export default function DashboardView({
  isAdmin,
  pendingUsers,
  setTab,
  openModalWithCheck,
  urgentTasks24h,
  cases,
  checkPerm,
  tasks,
  setTasks,
  users,
  setNotifyModal,
  canViewFinancials,
  stats,
  casesByType,
  invoiceMetrics,
  tasksMetrics,
  urgentTodayOrOverdueTasks,
  upcoming,
  caseNo,
}: DashboardViewProps) {
  const [dashboardCaseChartMode, setDashboardCaseChartMode] = useState<"bar" | "donut">("bar");
  const [dashboardInvoiceChartMode, setDashboardInvoiceChartMode] = useState<"amount" | "count">("amount");
  const [dashboardTaskChartMode, setDashboardTaskChartMode] = useState<"status" | "priority">("status");
  const [isUrgentAlertExpanded, setIsUrgentAlertExpanded] = useState<boolean>(true);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">لوحة التحكم والأداء</h2>
          <p className="text-xs text-slate-500">نظرة عامة على أعمال المكتب والملفات القانونية والجلسات</p>
        </div>
        <button onClick={() => openModalWithCheck("case", "manageCases")} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]">
          <Plus size={16} /> قضية جديدة
        </button>
      </div>

      {/* تنبيه وجود طلبات تسجيل حساب معلقة تحتاج موافقة (Admin Only) */}
      {isAdmin && pendingUsers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-900 rounded-xl font-bold shrink-0 animate-pulse">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                تنبيه مهم: يوجد {pendingUsers.length} طلب تسجيل حساب جديد بحاجة للقبول والاعتماد!
              </h4>
              <p className="text-xs text-slate-700 mt-0.5">
                الطلبات المعلقة: {pendingUsers.map(u => `${u.name} (${u.email})`).join("، ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setTab("users"); }}
            className="px-4 py-2.5 bg-slate-900 text-amber-400 rounded-xl text-xs font-bold hover:bg-slate-800 transition shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <UserCheck size={15} /> الانتقال للموافقة أو الرفض
          </button>
        </div>
      )}

      {/* نظام إشعارات ذكي يبرز المهام التي اقترب موعدها خلال أقل من 24 ساعة */}
      {urgentTasks24h.length > 0 ? (
        <div className="rounded-2xl border-2 border-amber-400/90 bg-gradient-to-l from-amber-500/10 via-amber-50/60 to-white p-4 sm:p-5 shadow-md relative overflow-hidden transition-all">
          {/* شريط الإضاءة العلوي الجمالي */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-red-500 to-amber-600" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-sm">
                <BellRing size={22} className="animate-bounce text-slate-950" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 text-[9px] text-white font-bold items-center justify-center">!</span>
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <span>نظام التنبيه الذكي للمهام العاجلة</span>
                    <span className="text-xs font-semibold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300">
                      أقل من 24 ساعة
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  يوجد <span className="font-bold text-red-700">{urgentTasks24h.length}</span> مهام تستحق المتابعة والإنجاز الفوري أو قاربت مهلتها على الانتهاء
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setTab("tasks")}
                className="px-3.5 py-2 bg-slate-900 text-amber-300 rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>جدول المهام الكامل</span>
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => openModalWithCheck("task", "manageTasks")}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>مهمة جديدة</span>
              </button>
              {urgentTasks24h.length > 3 && (
                <button
                  onClick={() => setIsUrgentAlertExpanded(!isUrgentAlertExpanded)}
                  className="px-2.5 py-2 bg-white hover:bg-stone-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title={isUrgentAlertExpanded ? "طي القائمة" : "توسيع القائمة"}
                >
                  {isUrgentAlertExpanded ? "عرض أقل" : `عرض الكل (${urgentTasks24h.length})`}
                </button>
              )}
            </div>
          </div>

          {/* شبكة كروت التنبيه السريع للمهام */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-3.5">
            {(isUrgentAlertExpanded ? urgentTasks24h : urgentTasks24h.slice(0, 3)).map((t) => {
              const dLeft = daysUntil(t.due);
              const isOverdue = dLeft < 0;
              const isDueToday = dLeft === 0;
              const isDueTomorrow = dLeft === 1;
              const relatedCase = t.caseId ? cases.find(c => c.id === t.caseId) : null;

              return (
                <div
                  key={t.id}
                  className={`rounded-xl border p-3.5 bg-white transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm ${
                    isOverdue
                      ? "border-red-300 bg-red-50/20 ring-1 ring-red-200"
                      : isDueToday
                      ? "border-amber-300 bg-amber-50/30 ring-1 ring-amber-200"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    {/* الشريط العلوي للمهمة */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        isOverdue
                          ? "bg-red-100 text-red-800 border-red-200"
                          : isDueToday
                          ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                          : "bg-sky-100 text-sky-800 border-sky-200"
                      }`}>
                        {isOverdue && <AlertTriangle size={12} />}
                        {isDueToday && <Clock size={12} />}
                        {isDueTomorrow && <Hourglass size={12} />}
                        {isOverdue ? `متأخرة بـ ${Math.abs(dLeft)} يوم` : isDueToday ? "تستحق اليوم (< 12 ساعة)" : "تستحق غداً (< 24 ساعة)"}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TASK_PRIORITY[t.priority] || "bg-slate-100 text-slate-700"}`}>
                        {t.priority}
                      </span>
                    </div>

                    {/* عنوان المهمة */}
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {t.title}
                    </h4>

                    {/* تفاصيل القضية والمكلف */}
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      {relatedCase && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Briefcase size={13} className="text-amber-600 shrink-0" />
                          <span className="truncate">{relatedCase.number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span>المكلف: <strong className="text-slate-800">{t.assignee}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* الإجراءات السريعة للمهمة */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (!checkPerm("manageTasks", "إنجاز مهمة")) return;
                        setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: true } : x));
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                      title="تحديد المهمة كمنجزة فوراً"
                    >
                      <CheckCircle2 size={14} />
                      <span>تم الإنجاز</span>
                    </button>

                    <button
                      onClick={() => {
                        const userObj = users.find(u => u.name === t.assignee);
                        const phone = userObj?.phone || "";
                        const email = userObj?.email || "";
                        const msg = `مرحباً ${t.assignee}،\nتنبيه عاجل من نظام المكتب:\nالمهمة: "${t.title}"\nموعد الاستحقاق: ${fmtDate(t.due)} (أقل من 24 ساعة).\nيرجى المتابعة والإنجاز.`;
                        setNotifyModal({
                          recipientName: t.assignee,
                          recipientPhone: phone,
                          recipientEmail: email,
                          channel: "واتساب",
                          type: "رسالة عامة",
                          subject: `تنبيه عاجل: مهمة "${t.title}"`,
                          message: msg,
                          relatedRef: `مهمة #${t.id}`
                        });
                      }}
                      className="flex items-center justify-center p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition text-xs font-semibold cursor-pointer"
                      title="إرسال تنبيه وتذكير بالواتساب"
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500 text-white rounded-lg font-bold">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="font-bold">نظام الإشعارات الذكي:</span>
              <span className="mr-1 text-slate-700">لا توجد مهام مستحقة خلال الـ 24 ساعة القادمة. جميع المهام ضمن جدولها الطبيعي.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModalWithCheck("task", "manageTasks")}
              className="px-2.5 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> إضافة مهمة
            </button>
            <button
              onClick={() => setTab("tasks")}
              className="px-2.5 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition flex items-center gap-1 cursor-pointer"
            >
              استعراض المهام
            </button>
          </div>
        </div>
      )}

      {/* بطاقات المؤشرات */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canViewFinancials ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3 sm:gap-4`}>
    {[
      { label: "قضايا نشطة", value: stats.active, icon: Briefcase, tone: "bg-indigo-100 text-indigo-600" },
      { label: "جلسات هذا الأسبوع", value: stats.weekHearings, icon: Gavel, tone: "bg-amber-100 text-amber-600" },
      canViewFinancials ? { label: "مبالغ مستحقة (شامل الضريبة 5%)", value: fmtAED(stats.dueAmount), icon: TrendingUp, tone: "bg-emerald-100 text-emerald-600" } : null,
      { label: "وكالات تنتهي خلال 60 يومًا", value: stats.expiringPoa, icon: AlertTriangle, tone: "bg-red-100 text-red-600" },
    ].filter(Boolean).map((k: any) => (
      <div key={k.label} className="app-card p-5">
        <div className={`mb-3.5 flex h-11 w-11 items-center justify-center rounded-2xl ${k.tone}`}><k.icon size={20} /></div>
        <p className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{k.value}</p>
        <p className="mt-1 text-xs text-slate-500 font-medium">{k.label}</p>
      </div>
    ))}
  </div>

  {/* الرسوم البيانية التفاعلية للوحة التحكم */}
  <div className={`grid gap-4.5 ${canViewFinancials ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}>
    {/* 1. توزيع القضايا حسب النوع */}
    <div className="app-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">توزيع القضايا حسب النوع</h3>
              <p className="text-[11px] text-slate-500">إجمالي {cases.length} قضية مقيدة</p>
            </div>
          </div>
          <div className="flex items-center bg-slate-100/70 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setDashboardCaseChartMode("bar")}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${dashboardCaseChartMode === "bar" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="عرض أعمدة بيانية"
            >
              أعمدة
            </button>
            <button
              onClick={() => setDashboardCaseChartMode("donut")}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${dashboardCaseChartMode === "donut" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="عرض دائري مجوف"
            >
              دائري
            </button>
          </div>
        </div>

        <div className="h-52 w-full" dir="ltr">
          {cases.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {dashboardCaseChartMode === "bar" ? (
              <BarChart data={casesByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + ".." : val}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px",
                    direction: "rtl",
                    textAlign: "right"
                  }}
                  formatter={(value: any) => [`${value} قضية (${Math.round((Number(value) / (cases.length || 1)) * 100)}%)`, "عدد القضايا"]}
                />
                <Bar dataKey="value" name="عدد القضايا" radius={[6, 6, 0, 0]}>
                  {casesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={casesByType}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {casesByType.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px",
                    direction: "rtl",
                    textAlign: "right"
                  }}
                  formatter={(value: any, name: any) => [`${value} قضية (${Math.round((Number(value) / (cases.length || 1)) * 100)}%)`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }}
                  formatter={(val) => <span className="text-slate-700 font-medium">{val}</span>}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 pb-4">
              <Briefcase size={32} className="opacity-20" />
              <p className="text-xs font-semibold">لا توجد قضايا لعرضها</p>
            </div>
          )}
        </div>
      </div>

      {/* تصنيفات سريعة */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
        {casesByType.map((c) => (
          <span
            key={c.name}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] bg-slate-50 border border-slate-200 text-slate-700"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
            <span className="font-semibold">{c.name}:</span>
            <span className="font-mono font-bold text-slate-900">{c.value}</span>
            <span className="text-[10px] text-slate-400">({c.percentage}%)</span>
          </span>
        ))}
      </div>
    </div>

    {/* 2. حالة الفواتير والتحصيل المالي (تظهر للمصرح لهم مالياً) */}
    {canViewFinancials && (
      <div className="app-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">حالة الفواتير والتحصيل</h3>
                <p className="text-[11px] text-slate-500">
                  نسبة السداد: <b className="text-emerald-700 font-bold">{invoiceMetrics.collectionRate}%</b>
                </p>
              </div>
            </div>
            <div className="flex items-center bg-slate-100/70 p-1 rounded-xl border border-slate-200/70">
              <button
                onClick={() => setDashboardInvoiceChartMode("amount")}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${dashboardInvoiceChartMode === "amount" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                title="عرض بالمبالغ (درهم)"
              >
                المبالغ
              </button>
              <button
                onClick={() => setDashboardInvoiceChartMode("count")}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${dashboardInvoiceChartMode === "count" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                title="عرض بعدد الفواتير"
              >
                العدد
              </button>
            </div>
          </div>

          <div className="h-52 w-full" dir="ltr">
            {invoiceMetrics.totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardInvoiceChartMode === "amount" ? invoiceMetrics.summaryByAmount : invoiceMetrics.summaryByCount}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(dashboardInvoiceChartMode === "amount" ? invoiceMetrics.summaryByAmount : invoiceMetrics.summaryByCount).map((entry, index) => (
                      <Cell key={`cell-inv-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "12px",
                      direction: "rtl",
                      textAlign: "right"
                    }}
                    formatter={(value: any, name: any) => [
                      dashboardInvoiceChartMode === "amount"
                        ? `${fmtAED(Number(value))} (${Math.round((Number(value) / (invoiceMetrics.totalInvoiced || 1)) * 100)}%)`
                        : `${value} فاتورة (${Math.round((Number(value) / (invoiceMetrics.totalCount || 1)) * 100)}%)`,
                      name
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }}
                    formatter={(val) => <span className="text-slate-700 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 pb-4">
                <Receipt size={32} className="opacity-20" />
                <p className="text-xs font-semibold">لا توجد فواتير لعرضها</p>
              </div>
            )}
          </div>
        </div>

        {/* ملخص مالي سريع */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-[10px] text-emerald-800 font-medium">المحصل</p>
            <p className="text-xs font-bold text-emerald-900 truncate">{fmtAED(invoiceMetrics.paidAmount)}</p>
          </div>
          <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200">
            <p className="text-[10px] text-sky-800 font-medium">المستحق</p>
            <p className="text-xs font-bold text-sky-900 truncate">{fmtAED(invoiceMetrics.sentDueAmount)}</p>
          </div>
          <div className="p-1.5 rounded-lg bg-red-50 border border-red-200">
            <p className="text-[10px] text-red-800 font-medium">المتأخر</p>
            <p className="text-xs font-bold text-red-900 truncate">{fmtAED(invoiceMetrics.overdueAmount)}</p>
          </div>
        </div>
      </div>
    )}

    {/* 3. نسبة إنجاز وتوزيع المهام */}
    <div className="app-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
              <CheckSquare size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">نسبة إنجاز المهام</h3>
              <p className="text-[11px] text-slate-500">
                الإنجاز: <b className="text-indigo-700 font-bold">{tasksMetrics.completionRate}%</b> ({tasksMetrics.completed} من {tasksMetrics.total})
              </p>
            </div>
          </div>
          <div className="flex items-center bg-slate-100/70 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setDashboardTaskChartMode("status")}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${dashboardTaskChartMode === "status" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="حسب حالة الإنجاز"
            >
              الحالة
            </button>
            <button
              onClick={() => setDashboardTaskChartMode("priority")}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${dashboardTaskChartMode === "priority" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="حسب مستوى الأولوية"
            >
              الأولوية
            </button>
          </div>
        </div>

        <div className="h-52 w-full" dir="ltr">
          {tasksMetrics.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {dashboardTaskChartMode === "status" ? (
              <PieChart>
                <Pie
                  data={tasksMetrics.statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {tasksMetrics.statusChartData.map((entry, index) => (
                    <Cell key={`cell-task-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px",
                    direction: "rtl",
                    textAlign: "right"
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} مهمة (${Math.round((Number(value) / (tasksMetrics.total || 1)) * 100)}%)`,
                    name
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }}
                  formatter={(val) => <span className="text-slate-700 font-medium">{val}</span>}
                />
              </PieChart>
            ) : (
              <BarChart data={tasksMetrics.priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px",
                    direction: "rtl",
                    textAlign: "right"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="منجزة" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="معلقة" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 pb-4">
              <CheckSquare size={32} className="opacity-20" />
              <p className="text-xs font-semibold">لا توجد مهام لعرضها</p>
            </div>
          )}
        </div>
      </div>

      {/* شريط مؤشرات المهام */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <CheckCircle2 size={13} /> منجزة: {tasksMetrics.completed}
        </span>
        <span className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
          <Clock size={13} /> جارية: {tasksMetrics.inProgress}
        </span>
        <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${tasksMetrics.overdue + tasksMetrics.dueToday > 0 ? "text-red-700 bg-red-50 border-red-200 animate-pulse" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
          <AlertCircle size={13} /> متأخرة: {tasksMetrics.overdue + tasksMetrics.dueToday}
        </span>
      </div>
    </div>
  </div>

  {/* لوحة المهام العاجلة التي تنتهي صلاحيتها اليوم أو تجاوزت موعدها */}
  <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
          <AlertCircle size={22} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">المهام المستحقة اليوم أو المتأخرة ({urgentTodayOrOverdueTasks.length})</h3>
          <p className="text-xs text-slate-600">المهام التي تنتهي صلاحيتها اليوم أو التي تجاوزت موعد الاستحقاق مع إمكانية الإنجاز الفوري</p>
        </div>
      </div>
      <button onClick={() => setTab("tasks")} className="flex items-center gap-1 text-sm font-bold text-amber-700 hover:underline">عرض كافة المهام <ChevronLeft size={14} /></button>
    </div>
    <div className="space-y-3">
      {urgentTodayOrOverdueTasks.map((t) => {
        const dLeft = daysUntil(t.due);
        const isOverdue = dLeft < 0;
        return (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <button
                onClick={() => {
                  if (!checkPerm("manageTasks", "تحديد المهمة كمنجزة")) return;
                  setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: true } : x));
                }}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                title="تحديد كمنجزة"
              >
                <CheckCircle2 size={16} /> تحديد كـ 'منجزة'
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{t.title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                  <span>المكلف: <b>{t.assignee}</b></span>
                  <span>•</span>
                  <span>التاريخ: <b className={isOverdue ? "text-red-600 font-bold" : "text-amber-700 font-bold"}>{fmtDate(t.due)} ({isOverdue ? `متأخرة بـ ${Math.abs(dLeft)} أيام` : "اليوم"})</b></span>
                </p>
              </div>
            </div>
            <Badge className={TASK_PRIORITY[t.priority]}>{t.priority}</Badge>
          </div>
        );
      })}
      {urgentTodayOrOverdueTasks.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-center text-slate-500 border border-slate-200">
          <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-1" />
          <p className="font-bold text-slate-700 text-sm">ممتاز! لا توجد مهام متأخرة أو مستحقة اليوم</p>
          <p className="text-xs text-slate-400">جميع المهام جارية وفق جدولها الزمني المحدد.</p>
        </div>
      )}
    </div>
  </div>

  <div className="grid gap-4 lg:grid-cols-2">
    {/* الجلسات القادمة */}
    <div className="app-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">الجلسات القادمة</h3>
        <button onClick={() => setTab("hearings")} className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">عرض الكل <ChevronLeft size={14} /></button>
      </div>
      <div className="space-y-3">
        {upcoming.slice(0, 4).map((h) => (
          <div key={h.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 text-amber-400">
              <span className="text-sm font-bold">{new Date(h.date).getDate()}</span>
              <span className="text-[10px]">{new Date(h.date).toLocaleDateString("ar-AE", { month: "short" })}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{caseNo(h.caseId)}</p>
              <p className="truncate text-xs text-slate-500">{h.type} — {h.time} — {h.room}</p>
            </div>
            {daysUntil(h.date) <= 2 && <Badge className="bg-red-100 text-red-700">عاجل</Badge>}
          </div>
        ))}
        {upcoming.length === 0 && <p className="py-6 text-center text-sm text-slate-400">لا توجد جلسات قادمة</p>}
      </div>
    </div>
    {/* المهام المعلقة */}
    <div className="app-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">مهام معلقة</h3>
        <button onClick={() => setTab("tasks")} className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">عرض الكل <ChevronLeft size={14} /></button>
      </div>
      <div className="space-y-3">
        {tasks.filter((t) => !t.done).slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
            <button onClick={() => {
              if (!checkPerm("manageTasks", "إنجاز مهمة")) return;
              setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: true } : x));
            }} className="text-slate-300 hover:text-emerald-500" aria-label="إنجاز المهمة"><CheckCircle2 size={22} /></button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{t.title}</p>
              <p className="text-xs text-slate-500">الاستحقاق: {fmtDate(t.due)} — المكلف: {t.assignee}</p>
            </div>
            <Badge className={TASK_PRIORITY[t.priority]}>{t.priority}</Badge>
          </div>
        ))}
      </div>
    </div>
  </div>
    </>
  );
}
