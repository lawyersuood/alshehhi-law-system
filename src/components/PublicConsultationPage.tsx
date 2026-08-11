import React, { useState, useMemo } from "react";
import {
  Video, Clock, CheckCircle2, Upload, AlertCircle, CreditCard,
  Copy, ExternalLink, ShieldCheck, Lock, ChevronLeft, ArrowRight, Check
} from "lucide-react";

export interface BookingRecord {
  id: string;
  reference: string;
  clientName: string;
  whatsapp: string;
  email: string;
  issueSummary: string;
  duration: 30 | 60;
  date: string;
  timeSlot: string;
  amountPaid: number;
  meetUrl: string;
  createdAt: string;
  status: "pending_assignment" | "assigned" | "completed";
  assignedLawyerId?: number;
  assignedLawyerName?: string;
  attachmentName?: string;
  aiSummary: {
    qualification: string;
    facts: string[];
    jurisdiction: string;
    keyQuestions: string[];
  };
}

interface PublicConsultationPageProps {
  onNewBooking?: (booking: BookingRecord) => void;
  onNavigateToAdmin?: () => void;
}

export const PublicConsultationPage: React.FC<PublicConsultationPageProps> = ({
  onNewBooking,
  onNavigateToAdmin
}) => {
  // Form state
  const [serviceDuration, setServiceDuration] = useState<30 | 60>(60);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [issueSummary, setIssueSummary] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);

  // Available slots
  const baseTimeSlots = [
    "09:00 AM",
    "10:30 AM",
    "12:00 PM",
    "02:00 PM",
    "03:30 PM",
    "05:00 PM",
    "06:30 PM",
    "08:00 PM"
  ];

  // Slot status check (must be at least 60 mins from now)
  const timeSlotStatuses = useMemo(() => {
    const now = new Date();
    const isToday = selectedDate === now.toISOString().split("T")[0];

    return baseTimeSlots.map((slot) => {
      if (!isToday) {
        return { slot, available: true, reason: "" };
      }

      const [timeStr, modifier] = slot.split(" ");
      let [hours, minutes] = timeStr.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const slotDate = new Date();
      slotDate.setHours(hours, minutes, 0, 0);

      const diffInMinutes = (slotDate.getTime() - now.getTime()) / (1000 * 60);

      if (diffInMinutes < 60) {
        return {
          slot,
          available: false,
          reason: diffInMinutes < 0 ? "وقت مضى" : "أقل من 60 دقيقة من الآن"
        };
      }

      return { slot, available: true, reason: "" };
    });
  }, [selectedDate]);

  // AI Summary Classifier
  const generateLegalSummary = (text: string) => {
    const lower = text.toLowerCase();
    let niche = "منازعة مدنية وتجارية عامة (القوانين الاتحادية لـ دبي وأبوظبي)";
    let court = "محاكم دبي / المحكمة الاتحادية الابتدائية (الدائرة التجارية/المدنية)";
    let q1 = "ما هي الوثائق الرسمية والعقود الموقعة بين الأطراف التي تثبت الالتزام المباشر؟";
    let q2 = "هل جرى توجيه إنذار عدلي أو إعذار رسمي عبر الكاتب العدل قبل البدء بالإجراءات؟";
    let q3 = "ما هي القيمة المالية الإجمالية للمطالبة وما هي الأضرار المباشرة المترتبة؟";

    if (lower.includes("عمل") || lower.includes("راتب") || lower.includes("فصل") || lower.includes("عمال")) {
      niche = "منازعة عمالية (قانون تنظيم علاقات العمل الاتحادي رقم 33 لسنة 2021)";
      court = "المحكمة العمالية / وزارة الموارد البشرية والتوطين (موهري)";
      q1 = "هل الشكوى مقيدة رسمياً لدى وزارة الموارد البشرية والتوطين (موهري) وهل أُحيلت للقضاء؟";
      q2 = "ما هو تاريخ أخر يوم عمل فعلي وهل تمت تصفية مستحقات نهاية الخدمة بعقد رسمي؟";
      q3 = "هل يوجد عقد عمل محدد أم غير محدد المدة وما قيمة الأجر الأساسي والإجمالي؟";
    } else if (lower.includes("عقار") || lower.includes("إيجار") || lower.includes("شقة") || lower.includes("مطور")) {
      niche = "نزاع عقاري وإيجاري (قوانين الإيجارات والتطوير العقاري بدولة الإمارات)";
      court = "مركز فض المنازعات الإيجارية / دائرة الأراضي والأملاك";
      q1 = "هل تم تسجيل العقد رسمياً في نظام إيجاري (Ejari) أو نظام موثق؟";
      q2 = "هل صَدر إشعار إخلاء أو تعديل إيجاري رسمي موجه وفق الشروط والأوقات القانونية؟";
      q3 = "هل توجد شيكات مرتجعة أو مطالبات بالصيانة الدورية والتعويض؟";
    } else if (lower.includes("شركة") || lower.includes("شريك") || lower.includes("عقد") || lower.includes("استثمار")) {
      niche = "منازعة شركات وتجارة (قانون الشركات التجارية الاتحادي)";
      court = "المحكمة التجارية الابتدائية (دائرة الاستثمار والدعوى التجارية)";
      q1 = "ما هي نسبة الحصص المسجلة في عقد تأسيس الشركة والرخصة التجارية الرسمية؟";
      q2 = "هل تم الاطلاع على الميزانيات والتقارير المالية المعتمدة للشركة من مدقق حسابات؟";
      q3 = "هل يوجد نزاع حول الإدارة والتوقيع أو انسحاب وتوزيع الأرباح؟";
    } else if (lower.includes("طلاق") || lower.includes("نفقة") || lower.includes("حضانة") || lower.includes("أسرة")) {
      niche = "أحوال شخصية وأسرة (قانون الأحوال الشخصية الإماراتي)";
      court = "محكمة الأحوال الشخصية (قسم التوجيه الأسري والمصالحة)";
      q1 = "هل تم قيد ملف التوجيه الأسري والمصالحة رسمياً لدى المحكمة؟";
      q2 = "ما هي الطلبات المحددة (حضانة، نفقة، مسكن، إثبات زواج/طلاق)؟";
      q3 = "هل يوجد أطفال قصر وما هي أرقام الهويات الوطنية والوثائق المتاحة؟";
    }

    const sentences = text.trim().split(/[\n.،]/).filter((s) => s.trim().length > 5);
    const fact1 = sentences[0] || "تُبيّن المعطيات وجود التزام أو نزاع قانوني يتطلب التكييف قبل قيد الدعوى.";
    const fact2 = sentences[1] || "خلاف جوهري بين الأطراف حول تنفيذ الاتفاقات أو الحقوق والالتزامات المالية.";
    const fact3 = sentences[2] || "رغبة الموكل في تحديد الموقف القضائي الدقيق وتقييم أدلة الإثبات المتاحة.";

    return {
      qualification: niche,
      facts: [fact1, fact2, fact3],
      jurisdiction: court,
      keyQuestions: [q1, q2, q3]
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("يرجى الموافقة على الشروط والتعهد الإجباري للبدء في إجراءات الحجز والدفع.");
      return;
    }
    if (!selectedTimeSlot) {
      alert("يرجى اختيار الوقت المناسب للجلسة المرئية من الأوقات المتاحة.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ref = `SHH-MEET-${Math.floor(100000 + Math.random() * 900000)}`;
      const meetCode = `suood-law-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      const meetUrl = `https://meet.google.com/${meetCode}`;
      const amount = serviceDuration === 30 ? 525 : 945;

      const ai = generateLegalSummary(
        issueSummary || "استفسار قانوني عام يرغب الموكل في مناقشته وتكييفه خلال الجلسة المرئية."
      );

      const newRecord: BookingRecord = {
        id: "b-" + Date.now(),
        reference: ref,
        clientName: fullName,
        whatsapp,
        email,
        issueSummary,
        duration: serviceDuration,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        amountPaid: amount,
        meetUrl,
        createdAt: new Date().toISOString(),
        status: "pending_assignment",
        attachmentName: attachedFile?.name,
        aiSummary: ai
      };

      setCreatedBooking(newRecord);
      setIsSubmitting(false);
      setBookingSuccess(true);

      if (onNewBooking) {
        onNewBooking(newRecord);
      }
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans dir-rtl pb-16">
      {/* Top Navbar */}
      <header className="bg-[#0a3d3a] text-white border-b border-[#115450] sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b89b6a] text-slate-950 flex items-center justify-center font-black text-xl shadow-sm">
              س
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-white leading-tight">
                مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية
              </h1>
              <p className="text-[11px] text-[#e5c388] font-mono">suoodlawhq.com • البوابة الرسمية للحجز</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#115450] text-teal-100 text-xs font-medium">
              حجز استشارة مرئية أونلاين
            </span>
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-xs font-bold text-[#e5c388] border border-[#e5c388]/30 transition flex items-center gap-1.5"
              >
                <span>دخول الكادر الطبي/المحامين</span>
                <ChevronLeft size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-8">
        {!bookingSuccess ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#0a3d3a] to-[#072a28] text-white p-6 md:p-8 border-b border-teal-800">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/30 border border-[#e5c388]/40 text-[#e5c388] text-xs font-bold rounded-full mb-2">
                    <Video size={14} />
                    <span>خدمة الجلسات المباشرة الصوتية والمرئية عبر Google Meet</span>
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                    حجز استشارة قانونية مرئية عن بُعد
                  </h2>
                  <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                    احصل على تكييف قانوني دقيق لقضيتك مباشرة من المحامين والمستشارين المعتمدين لدى محاكم دبي وأبوظبي والمحاكم الاتحادية.
                  </p>
                </div>
                <div className="hidden sm:block text-center bg-black/20 p-3 rounded-2xl border border-teal-700/50">
                  <span className="block text-[11px] text-[#e5c388] font-bold">دفع إلكتروني آمن 100%</span>
                  <span className="text-xs text-white">تأكيد فوري ورابط اجتماع آلي</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              
              {/* 1. Service Cards */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  اختر مدة الجلسة المرئية المطلوبة:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 30 mins */}
                  <div
                    onClick={() => setServiceDuration(30)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition relative ${
                      serviceDuration === 30
                        ? "border-[#0a3d3a] bg-teal-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-[#0a3d3a]" />
                        <span className="font-bold text-slate-900 text-base">استشارة مرئية 30 دقيقة</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0a3d3a] text-white">
                        525 درهم
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      تكييف قانوني سريع، تحديد القواعد والتشريعات النافذة، وإجابات حاسمة على الأركان الأساسية للمشكلة.
                    </p>
                  </div>

                  {/* Card 60 mins */}
                  <div
                    onClick={() => setServiceDuration(60)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition relative ${
                      serviceDuration === 60
                        ? "border-[#0a3d3a] bg-teal-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock size={18} className="text-amber-600" />
                          <span className="font-bold text-slate-900 text-base">استشارة موسعة 60 دقيقة</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold">★ الخيار الشامل للقضايا والنزاعات</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white">
                        945 درهم
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      دراسة كاملة للوقائع، رسم خارطة طريق التقاضي، تقييم أدلة الإثبات والمستندات المرفقة، وصياغة التوصيات.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Calendar & 60-min Rule */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  اختر موعد الجلسة (التاريخ والوقت):
                </h3>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2 mb-4">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <b>قيد النظام الآلي:</b> يُمنع حجز أي موعد يبدأ خلال أقل من 60 دقيقة من الوقت الحالي لضمان الجاهزية الفنية والقانونية للمستشار قبل بدء قاعة Google Meet.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اختر التاريخ *</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTimeSlot("");
                      }}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-[#0a3d3a] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">الأوقات المتاحة للاستشارة:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlotStatuses.map(({ slot, available, reason }) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={!available}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2.5 text-xs font-bold rounded-xl border transition flex flex-col items-center justify-center ${
                              !available
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-[#0a3d3a] text-white border-[#0a3d3a] shadow-sm"
                                : "bg-white text-slate-800 border-slate-300 hover:border-teal-700 hover:bg-teal-50/50"
                            }`}
                          >
                            <span>{slot}</span>
                            {!available && <span className="text-[9px] text-red-500 font-normal">({reason})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Input Data */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  بيانات الموكل وموضوع الاستشارة:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: سعود محمد المنصوري"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب للتنبيهات *</label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+971 50 000 0000"
                      dir="ltr"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      dir="ltr"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملخص وقائع المشكلة أو الاستفسار القانوني *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={issueSummary}
                    onChange={(e) => setIssueSummary(e.target.value)}
                    placeholder="اكتب خلاصة الموضوع والأسئلة المفتاحية التي تود طرحها خلال الجلسة المرئية..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    إرفاق مستندات (اختياري - بحد أقصى 3 صفحات PDF/صورة)
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                    <Upload size={18} className="text-slate-400" />
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0a3d3a] file:text-white"
                    />
                    {attachedFile && (
                      <span className="text-xs text-emerald-700 font-bold">
                        تم ارفاق: {attachedFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Disclaimer Checkbox */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0a3d3a] focus:ring-[#0a3d3a]"
                  />
                  <span className="text-xs text-slate-800 leading-relaxed">
                    <b>التعهد والإقرار الشامل وإخلاء المسؤولية:</b> أقر وأوافق على أن هذه الجلسة مخصصة لإعطاء الرأي القانوني المبدئي وتكييف الدعوى ورسم خطة التقاضي، ولا تشمل دراسة العقود والمستندات التفصيلية المطولة أو كتابة المذكرات أو الترافع أمام المحاكم. كما يمنع منعاً باتاً تسجيل الجلسة المرئية أو الصوتية بغير إذن كتابي مسبق من المكتب وفقاً للتشريعات النافذة في دولة الإمارات.
                  </span>
                </label>
              </div>

              {/* 5. Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0a3d3a] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#072a28] transition text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <CreditCard className="animate-spin" size={18} />
                    <span>جاري معالجة الدفع وتوليد رابط Google Meet...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} className="text-[#e5c388]" />
                    <span>تأكيد الحجز والدفع الفوري (إتاحة رابط Google Meet)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="bg-[#051f1e] rounded-3xl p-6 md:p-10 text-white border border-teal-800 shadow-2xl space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-3">
              <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto font-black text-2xl shadow-lg">
                ✓
              </div>
              <h3 className="text-2xl font-black text-[#e5c388]">
                تم تأكيد الدفع وتوليد رابط Google Meet بنجاح!
              </h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                شكراً لك عزيزي الموكل ({createdBooking?.clientName}). تم تسجيل حجزك ونقل بياناتك إلى لوحة المحامين المعتمدين في المكتب.
              </p>
            </div>

            <div className="bg-black/50 p-5 rounded-2xl border border-[#e5c388]/30 max-w-xl mx-auto space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                <span className="text-slate-400">رقم مرجع الحجز:</span>
                <span className="text-[#e5c388] font-mono font-bold text-sm">{createdBooking?.reference}</span>
              </div>
              <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                <span className="text-slate-400">موعد الاستشارة:</span>
                <span className="text-white font-bold">{createdBooking?.date} — الساعة {createdBooking?.timeSlot}</span>
              </div>
              <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                <span className="text-slate-400">مدة الجلسة والرسوم المدفوعة:</span>
                <span className="text-white font-bold">{createdBooking?.duration} دقيقة ({createdBooking?.amountPaid} درهم)</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-1">رابط قاعة Google Meet المباشر:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={createdBooking?.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 p-3 bg-teal-900 text-[#e5c388] font-mono rounded-xl text-center font-bold underline break-all hover:bg-teal-800 transition flex items-center justify-center gap-2"
                  >
                    <Video size={16} />
                    <span>{createdBooking?.meetUrl}</span>
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => {
                      if (createdBooking?.meetUrl) {
                        navigator.clipboard.writeText(createdBooking.meetUrl);
                        alert("تم نسخ رابط Google Meet بنجاح!");
                      }
                    }}
                    className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition"
                    title="نسخ الرابط"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setCreatedBooking(null);
                  setFullName("");
                  setWhatsapp("");
                  setEmail("");
                  setIssueSummary("");
                }}
                className="px-6 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-xs font-bold text-teal-100 transition"
              >
                حجز استشارة مرئية جديدة
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-xs text-slate-500 border-t border-slate-200 pt-6">
        <p>© {new Date().getFullYear()} مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية • suoodlawhq.com</p>
      </footer>
    </div>
  );
};

export default PublicConsultationPage;
