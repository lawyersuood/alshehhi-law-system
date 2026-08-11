import React, { useState } from "react";
import { BookingRecord } from "./PublicConsultationPage";
import {
  Video, Bell, UserCheck, Calendar, Clock, Sparkles, Copy, ExternalLink,
  Search, Filter, CheckCircle2, AlertCircle, Send, User, ChevronDown, Code, FileText
} from "lucide-react";

export interface EmployeeOption {
  id: number;
  name: string;
  jobTitle: string;
}

interface AdminConsultationsViewProps {
  bookings: BookingRecord[];
  employees: EmployeeOption[];
  onAssignLawyer: (bookingId: string, lawyerId: number, lawyerName: string) => void;
  onUpdateStatus: (bookingId: string, status: "pending_assignment" | "assigned" | "completed") => void;
}

export const AdminConsultationsView: React.FC<AdminConsultationsViewProps> = ({
  bookings,
  employees,
  onAssignLawyer,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"bookings_list" | "code_export" | "ai_prompt">("bookings_list");

  const unassignedCount = bookings.filter((b) => b.status === "pending_assignment").length;

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.whatsapp.includes(searchTerm) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "pending") return matchesSearch && b.status === "pending_assignment";
    if (statusFilter === "assigned") return matchesSearch && b.status === "assigned";
    if (statusFilter === "completed") return matchesSearch && b.status === "completed";

    return matchesSearch;
  });

  const standaloneHtmlCode = `<!-- كود صفحة الحجز الكامل لموقع suoodlawhq.com -->
<!-- تم استخراجه تلقائياً من نظام مكتب سعود أحمد الشحي للمحاماة -->`;

  const systemInstructionsText = `أنت مساعد قانوني ذكي خاص بمكتب سعود احمد الشحي للمحاماة. مهمتك هي استلام نص مشكلة العميل المدخلة في صفحة الحجز، وتحليلها فوراً لتوليد ملخص تنفيذي موجه للمحامي يحتوي على:

1. التكييف القانوني المبدئي: (حدد نوع Niche القضية: مدني، تجاري، جزائي، عمالي، أحوال شخصية...).
2. ملخص الوقائع: في 3 نقاط مركزة جداً.
3. توصية الجلسة: المحكمة أو الجهة المختصة، والأسئلة المفتاحية التي يجب طرحها على العميل خلال الـ 30/60 دقيقة لتحديد مسار الدعوى.

اجعل الصياغة مهنية، دقيقة، ومختصرة.`;

  return (
    <div className="space-y-6">
      {/* Real-time Alert Banner for New Paid Bookings */}
      {unassignedCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-200 flex items-center justify-between gap-4 animate-pulse shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-amber-300 text-sm flex items-center gap-2">
                تنبيه فوري: يوجد {unassignedCount} طلب حجز استشارة مرئية مدفوع جديد!
              </h3>
              <p className="text-xs text-amber-100/80">
                يتطلب إسناد وتحويل الاستشارة ورابط Google Meet إلى أحد المحامين أو المستشارين المتاحين فوراً.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("pending")}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
          >
            عرض الطلبات بانتظار التعيين
          </button>
        </div>
      )}

      {/* Header & View Modes */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              نظام الاستشارات والمرئيات المدمج
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold">
              Google Meet & AI Gemini Integration
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2">
            <Video className="text-[#e5c388]" size={22} />
            إدارة وتعليمات حجز الاستشارات المرئية (لوحة التحكم الداخلي)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة طلبات الموكلين المدفوعة أونلاين، الاطلاع على تحليل الذكاء الاصطناعي، وتعيين المحامي المسؤول
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("bookings_list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "bookings_list"
                ? "bg-amber-500 text-slate-950 font-black shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <UserCheck size={16} />
            <span>طلبات الحجز والتعيين ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_prompt")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "ai_prompt"
                ? "bg-amber-500 text-slate-950 font-black shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>تعليمات AI Studio</span>
          </button>
        </div>
      </div>

      {activeTab === "bookings_list" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute right-3 top-2.5 text-slate-500" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الموكل، المرجع، الواتساب..."
                className="w-full bg-slate-950 border border-slate-800 pr-9 pl-3 py-2 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === "all" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                الكل ({bookings.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  statusFilter === "pending" ? "bg-amber-500 text-slate-950" : "text-amber-400 hover:text-white"
                }`}
              >
                <span>بانتظار التعيين</span>
                {unassignedCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {unassignedCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter("assigned")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === "assigned" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                تم التعيين
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === "completed" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                مكتملة
              </button>
            </div>
          </div>

          {/* Bookings List Cards */}
          {filteredBookings.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <Video className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">لا توجد طلبات استشارات مرئية مطابقة للبحث حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className={`bg-slate-900 rounded-2xl border p-5 space-y-4 transition ${
                    b.status === "pending_assignment"
                      ? "border-amber-500/60 shadow-lg shadow-amber-500/5 bg-slate-900/90"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-slate-950 border border-amber-500/30 text-[#e5c388] font-mono text-xs font-bold">
                        #{b.reference}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        تاريخ الحجز: {new Date(b.createdAt).toLocaleDateString("ar-AE")}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {b.status === "pending_assignment" && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black animate-pulse">
                          ⚠️ بانتظار تعيين محامٍ
                        </span>
                      )}
                      {b.status === "assigned" && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>تم التعيين: {b.assignedLawyerName}</span>
                        </span>
                      )}
                      {b.status === "completed" && (
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold">
                          ✓ استشارة مكتملة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Client Info */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <span>بيانات الموكل</span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          مدفوع: {b.amountPaid} درهم
                        </span>
                      </h4>
                      <div>
                        <span className="text-slate-400">الاسم:</span>{" "}
                        <span className="text-white font-bold">{b.clientName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">الواتساب:</span>{" "}
                        <a href={`https://wa.me/${b.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="text-teal-400 font-mono underline dir-ltr inline-block">
                          {b.whatsapp}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400">البريد:</span>{" "}
                        <span className="text-slate-300 font-mono">{b.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">الموعد المحدد:</span>{" "}
                        <span className="text-amber-300 font-bold">{b.date} ({b.timeSlot}) — {b.duration} دقيقة</span>
                      </div>
                      {b.attachmentName && (
                        <div className="text-[11px] text-emerald-400 font-bold pt-1">
                          📎 مرفق ملف: {b.attachmentName}
                        </div>
                      )}
                    </div>

                    {/* Gemini AI Executive Summary */}
                    <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                          <Sparkles size={16} />
                          <span>التحليل والتكييف الصادر من الذكاء الاصطناعي (Gemini AI Executive Summary)</span>
                        </div>
                        <span className="text-[10px] text-slate-400">موجه للمحامي المسؤول</span>
                      </div>

                      <div className="space-y-2 text-slate-300">
                        <div>
                          <span className="text-amber-300 font-bold">1. التكييف والمجال القانوني المبدئي:</span>
                          <p className="text-white font-medium bg-slate-900 p-2 rounded-lg mt-0.5 border border-slate-800">
                            {b.aiSummary.qualification}
                          </p>
                        </div>

                        <div>
                          <span className="text-amber-300 font-bold">2. ملخص الوقائع الأساسية (3 نقاط):</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-300 pr-2 mt-0.5">
                            {b.aiSummary.facts.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-amber-300 font-bold">3. الاختصاص القضائي والأسئلة المفتاحية للجلسة:</span>
                          <p className="text-xs text-teal-300 mb-1">المحكمة المختصة: {b.aiSummary.jurisdiction}</p>
                          <ul className="list-decimal list-inside space-y-1 text-slate-300 pr-2">
                            {b.aiSummary.keyQuestions.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Lawyer Assignment Dropdown */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    {/* Google Meet URL */}
                    <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                      <span className="text-slate-400 text-xs shrink-0">رابط Google Meet:</span>
                      <a
                        href={b.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-teal-950 border border-teal-700/50 text-teal-300 font-mono rounded-lg text-xs font-bold underline truncate hover:text-white transition flex items-center gap-1.5"
                      >
                        <Video size={14} />
                        <span>{b.meetUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(b.meetUrl);
                          alert("تم نسخ رابط Google Meet للمستشار!");
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        title="نسخ الرابط"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    {/* Lawyer Assignment Dropdown */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 shrink-0 flex items-center gap-1">
                        <UserCheck size={16} className="text-amber-400" />
                        <span>تعيين المحامي المسؤول:</span>
                      </span>

                      <select
                        value={b.assignedLawyerId || ""}
                        onChange={(e) => {
                          const empId = Number(e.target.value);
                          if (!empId) return;
                          const found = employees.find((emp) => emp.id === empId);
                          if (found) {
                            onAssignLawyer(b.id, found.id, found.name);
                          }
                        }}
                        className="bg-slate-900 border border-amber-500/40 text-xs text-white rounded-xl px-3 py-2 focus:border-amber-400 focus:outline-none font-bold"
                      >
                        <option value="">-- اختر المحامي / المستشار --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.jobTitle})
                          </option>
                        ))}
                      </select>

                      {b.status !== "completed" && (
                        <button
                          onClick={() => onUpdateStatus(b.id, "completed")}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                        >
                          إنهاء الجلسة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: System Instructions tab */}
      {activeTab === "ai_prompt" && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span>تعليمات النظام الموجهة لـ AI Studio (System Instructions)</span>
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(systemInstructionsText);
                alert("تم نسخ تعليمات الذكاء الاصطناعي بنجاح!");
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5"
            >
              <Copy size={14} />
              <span>نسخ التعليمات</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ضع هذا النص في خانة <b>System Instructions</b> بمنصة AI Studio لتقوم النماذج بتحليل مشكلة العميل وتوليد الملخص التنفيذي تلقائياً للمحامي:
          </p>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-mono whitespace-pre-wrap leading-relaxed dir-rtl">
            {systemInstructionsText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminConsultationsView;
