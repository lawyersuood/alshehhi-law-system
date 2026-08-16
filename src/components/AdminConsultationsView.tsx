import React, { useState } from "react";
import { BookingRecord, ConsultationSettings } from "./PublicConsultationPage";
import {
  Video, Bell, UserCheck, Calendar, Clock, Sparkles, Copy, ExternalLink,
  Search, Filter, CheckCircle2, AlertCircle, Settings, DollarSign, Plus, Trash2, Shield
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
  settings: ConsultationSettings;
  onUpdateSettings: (newSettings: ConsultationSettings) => void;
  onOpenPublicPage?: () => void;
}

export const AdminConsultationsView: React.FC<AdminConsultationsViewProps> = ({
  bookings,
  employees,
  onAssignLawyer,
  onUpdateStatus,
  settings,
  onUpdateSettings,
  onOpenPublicPage
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"bookings_list" | "pricing_settings">("bookings_list");

  // Local state for editing settings
  const [price30, setPrice30] = useState(settings.price30);
  const [price60, setPrice60] = useState(settings.price60);
  const [mbankIban, setMbankIban] = useState(settings.mbankIban || "AE25 0350 0000 1234 5678 901");
  const [mbankMerchantId, setMbankMerchantId] = useState(settings.mbankMerchantId || "MBANK-CORP-SUOODLAW-2026");
  const [newSlotInput, setNewSlotInput] = useState("");
  const [slotsList, setSlotsList] = useState<string[]>(settings.availableSlots);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [blockedDatesList, setBlockedDatesList] = useState<string[]>(settings.blockedDates);
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      price30,
      price60,
      availableSlots: slotsList,
      blockedDates: blockedDatesList,
      mbankIban,
      mbankMerchantId
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    if (slotsList.includes(newSlotInput.trim())) return;
    setSlotsList([...slotsList, newSlotInput.trim()]);
    setNewSlotInput("");
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    setSlotsList(slotsList.filter((s) => s !== slotToRemove));
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    if (blockedDatesList.includes(newBlockedDate)) return;
    setBlockedDatesList([...blockedDatesList, newBlockedDate]);
    setNewBlockedDate("");
  };

  const handleRemoveBlockedDate = (dateToRemove: string) => {
    setBlockedDatesList(blockedDatesList.filter((d) => d !== dateToRemove));
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* 1. Glowing Alert Banner for New Paid Bookings */}
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
                يتطلب إسناد وتوجيه الاستشارة ورابط Google Meet إلى أحد المحامين والمستشارين المتاحين فوراً.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab("bookings_list");
              setStatusFilter("pending");
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
          >
            عرض الطلبات بانتظار التعيين
          </button>
        </div>
      )}

      {/* Header & View Switcher */}
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
            إدارة طلبات الاستشارات المرئية والتحكم الإداري
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تابع الطلبات المدفوعة، قم بتعيين المحامي المختص، أو عدّل الأسعار والأوقات المتاحة للحجز أونلاين.
          </p>
        </div>

        {/* Tab Switcher & Preview Link */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenPublicPage && (
            <button
              onClick={onOpenPublicPage}
              className="px-3.5 py-2 rounded-xl bg-[#b89b6a] text-slate-950 font-black hover:bg-[#d4af37] text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink size={15} />
              <span>معاينة صفحة العوام للحجز</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("bookings_list")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "bookings_list"
                  ? "bg-[#0a3d3a] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Video size={15} />
              <span>طلبات الحجز ({bookings.length})</span>
              {unassignedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {unassignedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("pricing_settings")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "pricing_settings"
                  ? "bg-[#0a3d3a] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Settings size={15} />
              <span>التحكم بالأسعار والمواعيد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Bookings List */}
      {activeTab === "bookings_list" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <Search size={16} className="text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالاسم، رقم الواتساب، أو المرجع..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                الكل ({bookings.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                بانتظار التعيين ({unassignedCount})
              </button>
              <button
                onClick={() => setStatusFilter("assigned")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === "assigned" ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                تم التعيين ({bookings.filter((b) => b.status === "assigned").length})
              </button>
            </div>
          </div>

          {/* Bookings List Cards */}
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 space-y-2">
              <Video size={32} className="mx-auto text-slate-600" />
              <p className="text-xs font-bold">لا توجد طلبات حجز مطابقة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className={`bg-slate-900 rounded-2xl border p-5 space-y-4 transition ${
                    b.status === "pending_assignment"
                      ? "border-amber-500/40 shadow-lg bg-slate-900/90"
                      : "border-slate-800"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-slate-950 text-[#e5c388] font-mono text-xs font-bold border border-slate-800">
                        #{b.reference}
                      </span>
                      <span className="text-xs text-slate-400">
                        تاريخ الطلب: {new Date(b.createdAt).toLocaleString("ar-AE")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          b.status === "pending_assignment"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                            : b.status === "assigned"
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {b.status === "pending_assignment" && <AlertCircle size={14} />}
                        {b.status === "assigned" && <CheckCircle2 size={14} />}
                        <span>
                          {b.status === "pending_assignment"
                            ? "⚠️ بانتظار تعيين محامٍ"
                            : b.status === "assigned"
                            ? `تم التعيين: ${b.assignedLawyerName}`
                            : "مكتملة"}
                        </span>
                      </span>

                      <select
                        value={b.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            b.id,
                            e.target.value as "pending_assignment" | "assigned" | "completed"
                          )
                        }
                        className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 font-bold"
                      >
                        <option value="pending_assignment">بانتظار التعيين</option>
                        <option value="assigned">تم التعيين</option>
                        <option value="completed">مكتملة</option>
                      </select>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Client Box */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <span>بيانات الموكل</span>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-mono text-xs">
                          {b.amountPaid} درهم
                        </span>
                      </h4>
                      <div>
                        <span className="text-slate-400">الاسم:</span>{" "}
                        <span className="text-white font-bold">{b.clientName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">الواتساب:</span>{" "}
                        <span className="text-teal-400 font-mono font-bold" dir="ltr">{b.whatsapp}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">البريد:</span>{" "}
                        <span className="text-slate-300 font-mono">{b.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">الموعد المحجوز:</span>{" "}
                        <span className="text-amber-300 font-bold">{b.date} ({b.timeSlot})</span>
                      </div>
                      <div>
                        <span className="text-slate-400">المدة:</span>{" "}
                        <span className="text-white font-bold">{b.duration} دقيقة</span>
                      </div>
                      {b.attachmentName && (
                        <div className="pt-1 text-[11px] text-teal-300 font-bold">
                          📎 مرفق: {b.attachmentName}
                        </div>
                      )}
                    </div>

                    {/* Gemini AI Executive Summary Box */}
                    <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                          <Sparkles size={16} />
                          <span>التحليل والتكييف القانوني الذكي (Gemini AI Summary)</span>
                        </div>
                        <span className="text-[10px] text-slate-500">مُولّد آلياً للمستشار</span>
                      </div>

                      <div className="space-y-2 text-slate-300 text-xs">
                        <div>
                          <b className="text-amber-300">1. المجال والقانون المطبق:</b>{" "}
                          <span className="text-white font-semibold">{b.aiSummary.qualification}</span>
                        </div>

                        <div>
                          <b className="text-amber-300">2. ملخص الوقائع (3 نقاط رئيسية):</b>
                          <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-200">
                            {b.aiSummary.facts.map((fact, idx) => (
                              <li key={idx}>{fact}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <b className="text-amber-300">3. الجهة المختصة والأسئلة المفتاحية للجلسة:</b>
                          <p className="text-teal-300 font-bold my-0.5">{b.aiSummary.jurisdiction}</p>
                          <ul className="list-decimal list-inside space-y-0.5 text-slate-300">
                            {b.aiSummary.keyQuestions.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Meet & Lawyer Assignment Footer Bar */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">رابط Google Meet المولد:</span>
                      <a
                        href={b.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-300 font-mono font-bold underline text-xs flex items-center gap-1 hover:text-teal-200"
                      >
                        <span>{b.meetUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(b.meetUrl);
                          alert("تم نسخ رابط Google Meet بنجاح!");
                        }}
                        className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                        title="نسخ الرابط"
                      >
                        <Copy size={13} />
                      </button>
                    </div>

                    {/* Assignment Dropdown */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <UserCheck size={16} className="text-amber-400" />
                        <span>إسناد الاستشارة للمحامي:</span>
                      </span>
                      <select
                        value={b.assignedLawyerId || ""}
                        onChange={(e) => {
                          const empId = Number(e.target.value);
                          const found = employees.find((emp) => emp.id === empId);
                          if (found) {
                            onAssignLawyer(b.id, found.id, found.name);
                          }
                        }}
                        className="bg-slate-900 border border-amber-500/40 text-xs text-white rounded-xl px-3 py-2 font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="">-- اختر المحامي المسؤول --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.jobTitle})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pricing & Availability Settings */}
      {activeTab === "pricing_settings" && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={18} className="text-amber-400" />
                لوحة التحكم الإداري بأسعار ومواعيد الاستشارات أونلاين
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تعديل الأسعار والأوقات المتاحة للحجز من قبل العملاء وتحديد الأيام المغلقة.
              </p>
            </div>

            {savedSuccess && (
              <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 size={16} />
                <span>تم حفظ التعديلات بنجاح!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-8">
            
            {/* 1. Price Control */}
            <div>
              <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                <DollarSign size={16} />
                <span>1. أسعار الجلسات الاستشارية (بالدرهم الإماراتي AED):</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    سعر الجلسة 30 دقيقة:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={price30}
                      onChange={(e) => setPrice30(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-white font-bold p-2.5 rounded-xl text-sm w-full focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-xs font-bold text-slate-400">درهم</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    سعر الجلسة الموسعة 60 دقيقة:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={price60}
                      onChange={(e) => setPrice60(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-white font-bold p-2.5 rounded-xl text-sm w-full focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-400">درهم</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Available Slots Control */}
            <div>
              <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                <Clock size={16} />
                <span>2. الأوقات المتاحة للحجز اليومي:</span>
              </h4>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSlotInput}
                    onChange={(e) => setNewSlotInput(e.target.value)}
                    placeholder="مثال: 09:30 AM أو 04:00 PM"
                    className="bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-xl flex-1 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus size={16} />
                    <span>إضافة وقت</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {slotsList.map((slot) => (
                    <span
                      key={slot}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
                    >
                      <span>{slot}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slot)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Blocked Dates Control */}
            <div>
              <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                <Calendar size={16} />
                <span>3. الأيام الموصدة / التواريخ غير المتاحة للحجز (العطل الرسمية):</span>
              </h4>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-xl flex-1 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddBlockedDate}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus size={16} />
                    <span>حظر التاريخ</span>
                  </button>
                </div>

                {blockedDatesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {blockedDatesList.map((dateStr) => (
                      <span
                        key={dateStr}
                        className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs font-bold text-red-300 flex items-center gap-2"
                      >
                        <span>{dateStr}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedDate(dateStr)}
                          className="text-red-400 hover:text-red-200 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Al Maryah Bank Integration Setup */}
            <div>
              <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                <Shield size={16} />
                <span>4. إعدادات ربط حساب بنك المارية (Al Maryah Community Bank - Mbank UAE):</span>
              </h4>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between bg-teal-950/40 p-3 rounded-lg border border-teal-800/60 text-xs text-teal-200">
                  <span>🏦 حساب الأعمال الرسمي للمكتب المرتبط ببنك المارية لضمان إيداع إيرادات الاستشارات فوراً.</span>
                  <span className="font-mono bg-teal-900 px-2.5 py-1 rounded text-amber-300 font-bold">Mbank Corporate API Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      رقم الآيبان التجاري (Mbank IBAN):
                    </label>
                    <input
                      type="text"
                      value={mbankIban}
                      onChange={(e) => setMbankIban(e.target.value)}
                      placeholder="AE25 0350 0000 1234 5678 901"
                      dir="ltr"
                      className="bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-xl w-full font-mono font-bold focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      معرف تاجر بنك المارية (Merchant ID / API Key):
                    </label>
                    <input
                      type="text"
                      value={mbankMerchantId}
                      onChange={(e) => setMbankMerchantId(e.target.value)}
                      placeholder="MBANK-CORP-SUOODLAW-2026"
                      dir="ltr"
                      className="bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-xl w-full font-mono font-bold focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  * عند إتمام الموكل عملية السداد عبر الموقع الرسمي (lawyersuood.com)، يقوم النظام بإرسال إشعار لحظي (Webhook Callback) إلى بوابة بنك المارية لتحصيل المبلغ وإيداعه مباشرة في الحساب التجاري للمكتب، وتوليد الفاتورة الضريبية وإيصال القبض آلياً في النظام المحاسبي للمكتب.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#0a3d3a] hover:bg-[#08302e] text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="text-[#e5c388]" />
                <span>حفظ التعديلات والإعدادات الإدارية</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminConsultationsView;
