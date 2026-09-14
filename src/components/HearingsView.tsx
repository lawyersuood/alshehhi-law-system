import React from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  CalendarDays, Hourglass, BellOff, Zap, Plus, ShieldAlert, AlertTriangle, Clock, CheckCircle2,
  UserCheck, Bell, Smartphone, Mail, History, Trash2, Filter, MessageSquare, Printer,
} from "lucide-react";
import { Badge } from "./AuthScreens";
import { CaseItem, Hearing, JudgmentDeadline, RolePermissions } from "../domain/types";
import { COURTS } from "../domain/constants";
import { fmtDate, daysUntil, isDeadlineOpen, todayISO, addDays } from "../domain/utils";
import { NotifyModalState } from "./DashboardView";

export interface HearingsViewProps {
  hearingSubTab: "hearings" | "deadlines";
  setHearingSubTab: (v: "hearings" | "deadlines") => void;
  deadlines: JudgmentDeadline[];
  setDeadlines: React.Dispatch<React.SetStateAction<JudgmentDeadline[]>>;
  setPermissionNotice: (msg: string | null) => void;
  runAutoAppealDeadlineChecker: (deadlinesList: JudgmentDeadline[], forceManual?: boolean) => void;
  autoCheckStatus: { lastCheckedAt?: string; message?: string; isChecking?: boolean };
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  deadlineFilter: "all" | "urgent" | "active" | "done" | "notneeded";
  setDeadlineFilter: (v: "all" | "urgent" | "active" | "done" | "notneeded") => void;
  cases: CaseItem[];
  clientName: (id: number) => string;
  setReassignDeadlineModal: (d: JudgmentDeadline | null) => void;
  handleSendWhatsAppDeadlineAlert: (d: JudgmentDeadline) => void;
  openNotificationComposer: (
    type: "تنبيه جلسة" | "تحديث قضية" | "تذكير فاتورة" | "تجديد وثائق / KYC" | "تجديد وكالة / POA" | "تنبيه ميعاد طعن / استئناف" | "تذكير قسط فاتورة" | "رسالة عامة",
    data?: any
  ) => void;
  setSelectedDeadlineLogs: (d: JudgmentDeadline | null) => void;
  setShowGoogleCalendarModal: (v: boolean) => void;
  googleUser: FirebaseUser | null;
  setReport: (v: any) => void;
  selectedRollDate: string;
  rollCourtFilter: string;
  setSelectedRollDate: (v: string) => void;
  setRollCourtFilter: (v: string) => void;
  hearings: Hearing[];
  setHearings: React.Dispatch<React.SetStateAction<Hearing[]>>;
  caseNo: (id: number) => string;
  setNotifyModal: (v: NotifyModalState | null | ((prev: NotifyModalState | null) => NotifyModalState | null)) => void;
  handleSingleHearingGoogleSync: (hearing: Hearing) => void;
  checkPerm: (
    permKey: keyof RolePermissions,
    actionName: string,
    context?: { section?: string; title?: string; details?: string; targetId?: string | number; isDelete?: boolean }
  ) => boolean;
  requestDelete: (opts: {
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  }) => void;
  logAuditAction: (
    actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS",
    targetModule: string,
    targetTitle: string,
    details: string,
    targetId?: string | number,
    statusOverride?: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل",
    userOverride?: { id?: string | number; name?: string; email?: string; roleTitle?: string; jobTitle?: string }
  ) => void;
}

export default function HearingsView({
  hearingSubTab,
  setHearingSubTab,
  deadlines,
  setDeadlines,
  setPermissionNotice,
  runAutoAppealDeadlineChecker,
  autoCheckStatus,
  openModalWithCheck,
  deadlineFilter,
  setDeadlineFilter,
  cases,
  clientName,
  setReassignDeadlineModal,
  handleSendWhatsAppDeadlineAlert,
  openNotificationComposer,
  setSelectedDeadlineLogs,
  setShowGoogleCalendarModal,
  googleUser,
  setReport,
  selectedRollDate,
  rollCourtFilter,
  setSelectedRollDate,
  setRollCourtFilter,
  hearings,
  setHearings,
  caseNo,
  setNotifyModal,
  handleSingleHearingGoogleSync,
  checkPerm,
  requestDelete,
  logAuditAction,
}: HearingsViewProps) {
  return (
    <div className="space-y-6">
      {/* شريط التبديل بين الجلسات ومواعيد الطعون التلقائية */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setHearingSubTab("hearings")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${hearingSubTab === "hearings" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <CalendarDays size={18} /> رول الجلسات اليومي
        </button>
        <button
          onClick={() => setHearingSubTab("deadlines")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${hearingSubTab === "deadlines" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Hourglass size={18} /> 🚨 مواعيد الأحكام والطعون التلقائية ({deadlines.length})
        </button>
      </div>

      {hearingSubTab === "deadlines" ? (
        <div className="space-y-6">
          {/* شريط العنوان وزر الفحص التلقائي */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Hourglass className="text-amber-600" /> سجل مواعيد الطعون والتنبيهات الاستباقية (7 أيام و 3 أيام)
              </h2>
              <p className="text-xs text-slate-500">نظام تلقائي يقوم بفحص المواعيد بانتظام وإرسال إشعارات استباقية للمحامي المسؤول عبر البريد والواتساب قبل الانقضاء بـ 7 أيام و 3 أيام</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const openCount = deadlines.filter((d) => isDeadlineOpen(d.status)).length;
                  if (openCount === 0) {
                    window.alert("لا توجد تنبيهات مفعّلة حالياً لإيقافها.");
                    return;
                  }
                  if (window.confirm(`سيتم إيقاف كل التنبيهات الآلية الحالية (واتساب/إيميل) لجميع القضايا المفتوحة حالياً وعددها (${openCount})، عن طريق تعليمها كـ"لا حاجة لطعن". يمكنك لاحقاً إعادة أي قضية بعينها إلى المتابعة من قائمة "لا حاجة لطعن". هل تريد المتابعة؟`)) {
                    setDeadlines(deadlines.map((x) => isDeadlineOpen(x.status) ? { ...x, status: "لا حاجة لطعن" } : x));
                    setPermissionNotice(`تم إيقاف كل التنبيهات الحالية (${openCount}) بنجاح.`);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 shadow-sm transition"
                title="إيقاف كل التنبيهات المفعّلة حالياً دفعة واحدة"
              >
                <BellOff size={16} />
                إلغاء كل التنبيهات الحالية
              </button>
              <button
                onClick={() => runAutoAppealDeadlineChecker(deadlines, true)}
                disabled={autoCheckStatus.isChecking}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400 shadow-sm transition disabled:opacity-50"
              >
                <Zap size={16} className={autoCheckStatus.isChecking ? "animate-spin" : ""} />
                {autoCheckStatus.isChecking ? "جارٍ الفحص والإرسال..." : "تشغيل فحص التنبيهات الآلية الآن"}
              </button>
              <button
                onClick={() => openModalWithCheck("deadline")}
                className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
              >
                <Plus size={16} /> تسجيل حكم قضائي وحساب الميعاد
              </button>
            </div>
          </div>

          {/* بنر حالة المحرك الآلي */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-emerald-700" />
                  محرك التنبيهات التلقائي الآلي: نَشِط ومفعّل (إشعارات البريد الإلكتروني والواتساب قبل 7 أيام و 3 أيام)
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {autoCheckStatus.message || `تم تجهيز خادم SMTP لإرسال التنبيهات فور وصول مهلة الطعن إلى 7 أيام أو 3 أيام مباشرة للمحامي الموكل`}
                </p>
              </div>
            </div>
            {autoCheckStatus.lastCheckedAt && (
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                آخر فحص: {autoCheckStatus.lastCheckedAt}
              </span>
            )}
          </div>

          {/* بطاقات الإحصائيات الأربع */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="app-card p-4">
              <p className="text-xs text-slate-500">إجمالي أحكام الطعون</p>
              <p className="text-2xl font-bold text-slate-900">{deadlines.length}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-xs text-red-800 font-bold flex items-center gap-1">
                <AlertTriangle size={14} /> طعون حرجة (أقل من 3 أيام 🚨)
              </p>
              <p className="text-2xl font-bold text-red-700">
                {deadlines.filter((d) => isDeadlineOpen(d.status) && daysUntil(d.appealDeadlineDate) <= 3 && daysUntil(d.appealDeadlineDate) >= 0).length}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs text-amber-800 font-bold flex items-center gap-1">
                <Clock size={14} /> طعون قريبة (أقل من 7 أيام ⚠️)
              </p>
              <p className="text-2xl font-bold text-amber-800">
                {deadlines.filter((d) => isDeadlineOpen(d.status) && daysUntil(d.appealDeadlineDate) <= 7 && daysUntil(d.appealDeadlineDate) >= 0).length}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> طعون تم قيدها بالمحكمة
              </p>
              <p className="text-2xl font-bold text-emerald-800">
                {deadlines.filter((d) => d.status === "تم قيد الطعن" || d.status === "تم تقديم الطعن").length}
              </p>
            </div>
          </div>

          {/* تبويبات التصفية */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setDeadlineFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${deadlineFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-[#0D382B]/[0.08] transition-colors"}`}
            >
              الكل ({deadlines.length})
            </button>
            <button
              onClick={() => setDeadlineFilter("urgent")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${deadlineFilter === "urgent" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
            >
              ⚠️ تحتاج تنبيه عاجل (أقل من 7 أيام) ({deadlines.filter(d => isDeadlineOpen(d.status) && daysUntil(d.appealDeadlineDate) <= 7 && daysUntil(d.appealDeadlineDate) >= 0).length})
            </button>
            <button
              onClick={() => setDeadlineFilter("active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${deadlineFilter === "active" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"}`}
            >
              جارٍ حساب الميعاد ({deadlines.filter(d => d.status === "جارٍ حساب الميعاد").length})
            </button>
            <button
              onClick={() => setDeadlineFilter("done")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${deadlineFilter === "done" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
            >
              تم قيد الطعن ({deadlines.filter(d => d.status === "تم قيد الطعن" || d.status === "تم تقديم الطعن").length})
            </button>
            <button
              onClick={() => setDeadlineFilter("notneeded")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${deadlineFilter === "notneeded" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-[#0D382B]/[0.08] transition-colors"}`}
            >
              لا حاجة لطعن ({deadlines.filter(d => d.status === "لا حاجة لطعن").length})
            </button>
          </div>

          {/* قائمة بطاقات المواعيد */}
          <div className="space-y-4">
            {deadlines
              .filter((d) => {
                const daysLeft = daysUntil(d.appealDeadlineDate);
                if (deadlineFilter === "urgent") return isDeadlineOpen(d.status) && daysLeft <= 7 && daysLeft >= 0;
                if (deadlineFilter === "active") return d.status === "جارٍ حساب الميعاد";
                if (deadlineFilter === "done") return d.status === "تم قيد الطعن" || d.status === "تم تقديم الطعن";
                if (deadlineFilter === "notneeded") return d.status === "لا حاجة لطعن";
                return true;
              })
              .map((d) => {
                const cs = cases.find((c) => c.id === d.caseId);
                const daysLeft = daysUntil(d.appealDeadlineDate);
                const isUrgent3 = daysLeft <= 3 && daysLeft >= 0 && isDeadlineOpen(d.status);
                const isUrgent7 = daysLeft <= 7 && daysLeft > 3 && isDeadlineOpen(d.status);

                return (
                  <div
                    key={d.id}
                    className={`rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                      d.status === "تم قيد الطعن" || d.status === "تم تقديم الطعن" || d.status === "لا حاجة لطعن"
                        ? "border-emerald-300 bg-emerald-50/20"
                        : isUrgent3
                        ? "border-2 border-red-500 bg-red-50/20 shadow-md ring-2 ring-red-100"
                        : isUrgent7
                        ? "border-2 border-amber-400 bg-amber-50/20"
                        : "border-slate-200 bg-white hover:border-amber-400"
                    }`}
                  >
                    {/* الهيدر العلوي للكارت */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{cs ? cs.number : `قضية رقم #${d.caseId}`}</h3>
                          <Badge className="bg-slate-100 text-slate-800">{d.rulingType}</Badge>
                          {d.caseNature && (
                            <Badge className={d.caseNature === "جزائي" ? "bg-rose-100 text-rose-800" : "bg-sky-100 text-sky-800"}>
                              {d.caseNature === "جزائي" ? "جزائي (15 يوماً)" : "مدني/تجاري (30 يوماً)"}
                            </Badge>
                          )}
                          <Badge
                            className={
                              d.status === "تم قيد الطعن" || d.status === "تم تقديم الطعن" || d.status === "لا حاجة لطعن"
                                ? "bg-emerald-100 text-emerald-800 font-bold"
                                : isUrgent3
                                ? "bg-red-600 text-white font-bold animate-pulse"
                                : isUrgent7
                                ? "bg-amber-500 text-slate-900 font-bold"
                                : "bg-slate-100 text-slate-800"
                            }
                          >
                            {d.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          الموكل: <b>{cs ? clientName(cs.clientId) : "—"}</b> • المحكمة: {cs ? cs.court : "—"}
                        </p>
                      </div>

                      <div className="text-left bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono shadow-xs">
                        <p className="text-slate-500">تاريخ صدور الحكم: {fmtDate(d.rulingDate)}</p>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">آخر موعد قاطع: {fmtDate(d.appealDeadlineDate)}</p>
                        <div className="mt-1">
                          {d.status === "لا حاجة لطعن" ? (
                            <span className="text-emerald-700 font-bold px-2 py-0.5 rounded-md bg-emerald-50">✔️ لا حاجة لطعن — تم إيقاف التنبيهات</span>
                          ) : !isDeadlineOpen(d.status) ? (
                            <span className="text-emerald-700 font-bold px-2 py-0.5 rounded-md bg-emerald-50">✔️ تم تقديم/قيد الطعن — لا حاجة لتنبيه</span>
                          ) : daysLeft < 0 ? (
                            <span className="text-red-600 font-bold px-2 py-0.5 rounded-md bg-red-100">⚠️ انتهت المهلة القانونية</span>
                          ) : daysLeft <= 3 ? (
                            <span className="text-red-700 font-black px-2 py-0.5 rounded-md bg-red-100 animate-pulse">🚨 طارئ: متبقي {daysLeft} أيام فقط!</span>
                          ) : daysLeft <= 7 ? (
                            <span className="text-amber-800 font-bold px-2 py-0.5 rounded-md bg-amber-100">⚠️ متبقي {daysLeft} أيام</span>
                          ) : (
                            <span className="text-emerald-700 font-medium px-2 py-0.5 rounded-md bg-emerald-50">متبقي {daysLeft} يومًا</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* مربع المحامي المسؤول والتنبيهات الاستباقية */}
                    <div className="grid gap-3 sm:grid-cols-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <p className="text-slate-500 font-semibold mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1"><UserCheck size={14} className="text-slate-700" /> المحامي المسؤول عن الطعن:</span>
                          <button
                            onClick={() => setReassignDeadlineModal(d)}
                            className="text-amber-700 hover:underline text-[11px] font-bold"
                          >
                            تغيير المحامي
                          </button>
                        </p>
                        <p className="font-bold text-slate-900 text-sm">{d.assignedLawyerName || "المحامي سعود أحمد الشحي"}</p>
                        <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                          📧 {d.assignedLawyerEmail || "info@lawyersuood.com"} | 📱 {d.assignedLawyerPhone || "0501234567"}
                        </p>
                      </div>

                      <div className="space-y-1.5 border-r border-slate-200 pr-3">
                        <p className="text-slate-500 font-semibold flex items-center gap-1">
                          <Bell size={14} className="text-amber-600" /> حالة التنبيهات الاستباقية الآلية:
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${d.alert7DaysSent ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-200 text-slate-600"}`}>
                            {d.alert7DaysSent ? `🟢 إشعار 7 أيام: مرسل (${d.alert7DaysSentAt || "تم الإرسال"})` : "⏳ إشعار 7 أيام: بانتظار الموعد"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${d.alert3DaysSent ? "bg-red-100 text-red-800 font-bold" : "bg-slate-200 text-slate-600"}`}>
                            {d.alert3DaysSent ? `🚨 إشعار 3 أيام: مرسل (${d.alert3DaysSentAt || "تم الإرسال"})` : "⏳ إشعار 3 أيام: بانتظار الموعد"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ملخص الحكم */}
                    <p className="text-xs text-slate-800 bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 font-medium leading-relaxed">
                      <b>منطوق الحكم الصادر:</b> {d.rulingSummary}
                    </p>

                    {/* شريط الإجراءات والسجل */}
                    <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2">
                      <span className="text-xs text-slate-500">{d.notes}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleSendWhatsAppDeadlineAlert(d)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-xs"
                          title="إرسال رسالة واتساب استباقية مباشرة للمحامي"
                        >
                          <Smartphone size={14} /> إرسال تنبيه واتساب
                        </button>
                        <button
                          onClick={() => openNotificationComposer("تنبيه ميعاد طعن / استئناف", d)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-xs hover:bg-amber-400 transition shadow-xs"
                          title="إرسال إشعار بريد إلكتروني يدوي"
                        >
                          <Mail size={14} /> إرسال إشعار بريد
                        </button>
                        <button
                          onClick={() => setSelectedDeadlineLogs(d)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors text-xs font-semibold transition"
                        >
                          <History size={14} /> سجل التنبيهات ({d.autoAlertLogs?.length || 0})
                        </button>
                        {d.status !== "تم قيد الطعن" && d.status !== "تم تقديم الطعن" && d.status !== "لا حاجة لطعن" && (
                          <button
                            onClick={() => setDeadlines(deadlines.map((x) => x.id === d.id ? { ...x, status: "تم قيد الطعن" } : x))}
                            className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold transition"
                          >
                            تسجيل قيد الطعن
                          </button>
                        )}
                        {d.status !== "تم قيد الطعن" && d.status !== "تم تقديم الطعن" && d.status !== "لا حاجة لطعن" && (
                          <button
                            onClick={() => {
                              if (window.confirm("هل أنت متأكد أن هذه القضية لا تحتاج لتقديم طعن؟ سيتم إيقاف كل التنبيهات الآلية (واتساب/إيميل) الخاصة بهذا الموعد نهائياً.")) {
                                setDeadlines(deadlines.map((x) => x.id === d.id ? { ...x, status: "لا حاجة لطعن" } : x));
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 bg-slate-50 hover:bg-slate-100 text-xs font-bold transition"
                            title="إيقاف التنبيهات الآلية عن هذه القضية لأنها لا تحتاج لطعن"
                          >
                            لا حاجة لطعن — إيقاف التنبيه
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm("هل أنت متأكد من حذف هذا الموعد نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
                              setDeadlines(deadlines.filter((x) => x.id !== d.id));
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-bold transition"
                          title="حذف سجل هذا الموعد نهائياً من النظام"
                        >
                          <Trash2 size={14} /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="text-amber-600" /> جدول ورول الجلسات (Court Hearings Roll)
              </h2>
              <p className="text-xs text-slate-500">استخراج وتجهيز رول الجلسات اليومية والمزامنة مع تقويم Google Calendar وإرسال التنبيهات</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowGoogleCalendarModal(true)}
                className="flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-amber-50 hover:border-amber-400 shadow-2xs transition cursor-pointer"
                title="مزامنة جدول الجلسات مع Google Calendar"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>مزامنة Google Calendar</span>
                {googleUser && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" title={`متصل: ${googleUser.email}`} />
                )}
              </button>
              <button
                onClick={() => setReport({ type: "roll", date: selectedRollDate, court: rollCourtFilter })}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-amber-400 shadow-sm transition cursor-pointer"
              >
                <Printer size={16} /> عرض وطباعة رول الجلسات (PDF)
              </button>
              <button onClick={() => openModalWithCheck("hearing", "manageHearings")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 shadow-sm transition cursor-pointer">
                <Plus size={16} /> إضافة جلسة
              </button>
            </div>
          </div>

          {/* كارت أدوات وتصفية رول الجلسات */}
          <div className="app-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Filter size={16} className="text-amber-600" /> تصفية وتحديد تاريخ الرول المطلوبة
              </h3>
              <span className="text-xs text-slate-500">اختر تاريخاً أو محكمة معينة لفلترة جدول الجلسات</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">تاريخ الجلسات (رول اليوم)</label>
                <input
                  type="date"
                  value={selectedRollDate}
                  onChange={(e) => setSelectedRollDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">المحكمة / الجهة القضائية</label>
                <select
                  value={rollCourtFilter}
                  onChange={(e) => setRollCourtFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="الكل">جميع المحاكم واللجان</option>
                  {COURTS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedRollDate(todayISO())}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${selectedRollDate === todayISO() ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-[#0D382B]/[0.06] transition-colors"}`}
                >
                  جلسات اليوم
                </button>
                <button
                  onClick={() => setSelectedRollDate(addDays(1))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${selectedRollDate === addDays(1) ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-[#0D382B]/[0.06] transition-colors"}`}
                >
                  جلسات غداً
                </button>
                <button
                  onClick={() => setSelectedRollDate("")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${selectedRollDate === "" ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-[#0D382B]/[0.06] transition-colors"}`}
                >
                  عرض جميع الجلسات
                </button>

                <button
                  onClick={() => {
                    const rollList = hearings.filter((h) => {
                      const matchDate = !selectedRollDate || h.date === selectedRollDate;
                      const cs = cases.find((c) => c.id === h.caseId);
                      const matchCourt = rollCourtFilter === "الكل" || (cs && cs.court === rollCourtFilter);
                      return matchDate && matchCourt;
                    });

                    if (rollList.length === 0) {
                      alert("لا توجد جلسات مطابقة في هذا التاريخ لاستخراج ملخص الرول");
                      return;
                    }

                    let rollTxt = `🏛️ *جدول رول الجلسات لتاريخ ${selectedRollDate ? fmtDate(selectedRollDate) : "الكل"}*\n` +
                      `مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية\n` +
                      `----------------------------------------\n`;
                    rollList.forEach((h, idx) => {
                      const cs = cases.find((c) => c.id === h.caseId);
                      const clName = cs ? clientName(cs.clientId) : "";
                      rollTxt += `\n*${idx + 1}. قضية: ${cs ? cs.number : "—"}*\n` +
                        `• المحكمة: ${cs ? cs.court : "—"}\n` +
                        `• الموكل: ${clName}\n` +
                        `• القاعة والوقت: ${h.room} (${h.time})\n` +
                        `• نوع الجلسة: ${h.type}\n` +
                        `${h.notes ? `• المطلوب: ${h.notes}\n` : ""}`;
                    });

                    openNotificationComposer("رسالة عامة");
                    setNotifyModal({
                      recipientName: "فريق المحامين والسكرتارية",
                      recipientPhone: "",
                      recipientEmail: "",
                      channel: "واتساب",
                      type: "تنبيه جلسة",
                      subject: `جدول رول الجلسات لتاريخ ${selectedRollDate ? fmtDate(selectedRollDate) : "الكل"}`,
                      message: rollTxt,
                      relatedRef: `رول ${selectedRollDate}`,
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 mr-auto"
                >
                  <MessageSquare size={14} /> إرسال ملخص الرول بالواتساب
                </button>
              </div>
            </div>
          </div>

          {/* قائمة الجلسات المفلترة */}
          <div className="space-y-3">
            {hearings
              .filter((h) => {
                const matchDate = !selectedRollDate || h.date === selectedRollDate;
                const cs = cases.find((c) => c.id === h.caseId);
                const matchCourt = rollCourtFilter === "الكل" || (cs && cs.court === rollCourtFilter);
                return matchDate && matchCourt;
              })
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((h) => {
                const cs = cases.find((c) => c.id === h.caseId);
                return (
                  <div key={h.id} className="flex flex-wrap items-center justify-between gap-4 app-card p-4 hover:border-amber-300 transition">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-mono">
                        <span className="text-base font-bold">{new Date(h.date).getDate()}</span>
                        <span className="text-xs">{new Date(h.date).toLocaleDateString("ar-AE", { month: "short" })}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{caseNo(h.caseId)}</p>
                          {cs && <span className="text-xs text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium">{cs.court}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          الموكل: <b>{cs ? clientName(cs.clientId) : "—"}</b> • {h.type} • الساعة {h.time} • {h.room}
                        </p>
                        {h.notes && <p className="mt-1 text-xs text-slate-600 bg-amber-50/60 px-2 py-1 rounded border border-amber-200/50">المطلوب: {h.notes}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSingleHearingGoogleSync(h)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition cursor-pointer ${
                          h.googleCalendarEventId
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                        }`}
                        title={h.googleCalendarEventId ? "تمت المزامنة مع تقويم Google" : "مزامنة الجلسة مع تقويم Google"}
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        {h.googleCalendarEventId ? "مزامنة بالتقويم 🟢" : "مزامنة Google"}
                      </button>
                      <button
                        onClick={() => openNotificationComposer("تنبيه جلسة", h)}
                        className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        title="تنبيه الموكل بالواتساب"
                      >
                        <MessageSquare size={14} /> تنبيه واتساب
                      </button>
                      <button
                        onClick={() => {
                          openNotificationComposer("تنبيه جلسة", h);
                          setNotifyModal((prev) => prev ? { ...prev, channel: "إيميل" } : null);
                        }}
                        className="flex items-center gap-1 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 border border-sky-200 hover:bg-sky-100"
                        title="تنبيه الموكل بالإيميل"
                      >
                        <Mail size={14} /> تنبيه إيميل
                      </button>

                      {h.done ? (
                        <Badge className="bg-emerald-100 text-emerald-700">تمت الجلسة</Badge>
                      ) : (
                        <button
                          onClick={() => {
                            if (!checkPerm("manageHearings", "تحديث الجلسة")) return;
                            setHearings(hearings.map((x) => x.id === h.id ? { ...x, done: true } : x));
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                        >
                          تعليم كمنتهية
                        </button>
                      )}

                      <button
                        onClick={() => {
                          requestDelete({
                            section: "جدول الجلسات والرول القضائي",
                            title: `جلسة القضية: ${caseNo(h.caseId)}`,
                            details: `نوع الجلسة: ${h.type} | التاريخ: ${fmtDate(h.date)} الساعة ${h.time} | القاعة: ${h.room || "—"} | الموكل: ${cs ? clientName(cs.clientId) : "—"}`,
                            permKey: "deleteHearings",
                            actionName: "حذف الجلسة",
                            onConfirm: () => {
                              logAuditAction("DELETE", "الجلسات", `جلسة قضية: ${caseNo(h.caseId)}`, `حذف جلسة ${h.type} بتأريخ ${h.date} للقضية ${caseNo(h.caseId)}`, h.id);
                              setHearings((prev) => prev.filter((x) => x.id !== h.id));
                            },
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="حذف الجلسة"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
