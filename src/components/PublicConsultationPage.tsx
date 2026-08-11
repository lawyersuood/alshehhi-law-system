import React, { useState, useMemo } from "react";
import {
  Video, Clock, Upload, AlertCircle, CreditCard,
  Copy, ExternalLink, Lock, CheckCircle2, Globe, FileText, X, ShieldAlert, ArrowLeft
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

export interface ConsultationSettings {
  price30: number;
  price60: number;
  availableSlots: string[];
  blockedDates: string[];
}

interface PublicConsultationPageProps {
  onNewBooking?: (booking: BookingRecord) => void;
  onNavigateToAdmin?: () => void;
  settings?: ConsultationSettings;
}

export const PublicConsultationPage: React.FC<PublicConsultationPageProps> = ({
  onNewBooking,
  onNavigateToAdmin,
  settings = {
    price30: 525,
    price60: 945,
    availableSlots: [
      "09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM",
      "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM"
    ],
    blockedDates: []
  }
}) => {
  // Language State
  const [lang, setLang] = useState<"ar" | "en">("ar");

  // Form State
  const [serviceDuration, setServiceDuration] = useState<30 | 60>(60);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [issueSummary, setIssueSummary] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
  // Checkbox and Legal Terms Modal State
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);

  // Is Date Blocked?
  const isDateBlocked = useMemo(() => {
    return settings.blockedDates.includes(selectedDate);
  }, [selectedDate, settings.blockedDates]);

  // Available Time Slots with 60-Minute Rule
  const timeSlotStatuses = useMemo(() => {
    const now = new Date();
    const isToday = selectedDate === now.toISOString().split("T")[0];

    return settings.availableSlots.map((slot) => {
      if (isDateBlocked) {
        return {
          slot,
          available: false,
          reason: lang === "ar" ? "تاريخ غير متاح" : "Date Unavailable"
        };
      }

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
          reason: diffInMinutes < 0 
            ? (lang === "ar" ? "وقت مضى" : "Past Time")
            : (lang === "ar" ? "أقل من 60 دقيقة" : "< 60 mins away")
        };
      }

      return { slot, available: true, reason: "" };
    });
  }, [selectedDate, settings.availableSlots, isDateBlocked, lang]);

  // AI Summary Classifier
  const generateLegalSummary = (text: string) => {
    const lower = text.toLowerCase();
    let niche = "منازعة مدنية وتجارية عامة (القوانين والأنظمة السارية)";
    let court = "المحكمة المختصة (الدائرة التجارية / المدنية)";
    let q1 = "ما هي الوثائق الرسمية والعقود الموقعة بين الأطراف التي تثبت الالتزام المباشر؟";
    let q2 = "هل جرى توجيه إنذار عدلي أو إعذار رسمي قبل البدء بالإجراءات؟";
    let q3 = "ما هي القيمة المالية الإجمالية للمطالبة وما هي الأضرار المباشرة المترتبة؟";

    if (lower.includes("عمل") || lower.includes("راتب") || lower.includes("فصل") || lower.includes("عمال") || lower.includes("labor") || lower.includes("salary")) {
      niche = "منازعة عمالية (قوانين تنظيم علاقات العمل)";
      court = "المحكمة العمالية / الجهات العمالية المختصة";
      q1 = "هل الشكوى مقيدة رسمياً لدى وزارة العمل / الجهة المختصة وهل أُحيلت للقضاء؟";
      q2 = "ما هو تاريخ أخر يوم عمل فعلي وهل تمت تصفية مستحقات نهاية الخدمة؟";
      q3 = "هل يوجد عقد عمل محدد أم غير محدد المدة وما قيمة الأجر الأساسي والإجمالي؟";
    } else if (lower.includes("عقار") || lower.includes("إيجار") || lower.includes("شقة") || lower.includes("مطور") || lower.includes("rent") || lower.includes("property")) {
      niche = "نزاع عقاري وإيجاري (تشريعات الإيجارات والتطوير العقاري)";
      court = "مركز المنازعات الإيجارية / اللجان العقارية المختصة";
      q1 = "هل تم تسجيل عقد الإيجار رسمياً بالجهات المعنية؟";
      q2 = "هل صَدر إشعار إخلاء أو تعديل إيجاري رسمي موجه وفق الأوقات القانونية؟";
      q3 = "هل توجد شيكات مرتجعة أو مطالبات بالصيانة والتعويض؟";
    } else if (lower.includes("شركة") || lower.includes("شريك") || lower.includes("عقد") || lower.includes("استثمار") || lower.includes("company") || lower.includes("partner")) {
      niche = "منازعة شركات وتجارة (قوانين الشركات التجارية)";
      court = "المحكمة التجارية الابتدائية (دائرة الاستثمار والدعاوى التجارية)";
      q1 = "ما هي نسبة الحصص المسجلة في عقد تأسيس الشركة والرخصة التجارية؟";
      q2 = "هل تم الاطلاع على الميزانيات والتقارير المالية المعتمدة للشركة؟";
      q3 = "هل يوجد نزاع حول الإدارة والتوقيع أو توزيع الأرباح؟";
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
      alert(
        lang === "ar"
          ? "يرجى القبول والموافقة على وثيقة الشروط والأحكام وإخلاء المسؤولية للبدء في إجراءات الحجز."
          : "Please agree to the Terms, Conditions & Legal Disclaimer before proceeding."
      );
      return;
    }
    if (!selectedTimeSlot) {
      alert(
        lang === "ar"
          ? "يرجى اختيار الموعد المناسب للجلسة المرئية من الأوقات المتاحة."
          : "Please select an available time slot for your consultation."
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ref = `SHH-MEET-${Math.floor(100000 + Math.random() * 900000)}`;
      const meetCode = `suood-law-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      const meetUrl = `https://meet.google.com/${meetCode}`;
      const amount = serviceDuration === 30 ? settings.price30 : settings.price60;

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
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 ${lang === "ar" ? "dir-rtl" : "dir-ltr"}`}>
      
      {/* Admin Preview Top Bar (Only visible when accessed from internal system) */}
      {onNavigateToAdmin && (
        <div className="bg-[#051f1e] text-[#e5c388] border-b border-[#e5c388]/30 px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>وضع معاينة صفحة العوام للجمهور (suoodlawhq.com/consultation)</span>
          </div>
          <button
            onClick={onNavigateToAdmin}
            className="px-3 py-1.5 rounded-xl bg-[#b89b6a] text-slate-950 font-black hover:bg-[#d4af37] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>العودة إلى لوحة تحكم المكتب</span>
            <ArrowLeft size={14} />
          </button>
        </div>
      )}

      {/* Public Header */}
      <header className="bg-[#0a3d3a] text-white border-b border-[#115450] sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b89b6a] text-slate-950 flex items-center justify-center font-black text-xl shadow-sm shrink-0">
              س
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-white leading-tight">
                {lang === "ar"
                  ? "مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية"
                  : "Suood Ahmed Al Shehhi Advocates & Legal Consultants"}
              </h1>
              <p className="text-[11px] text-[#e5c388] font-mono">
                suoodlawhq.com • {lang === "ar" ? "البوابة الرسمية لحجز الاستشارات" : "Official Consultation Portal"}
              </p>
            </div>
          </div>

          {/* Language Toggle Button */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 border border-[#e5c388]/40 text-xs font-bold text-[#e5c388] transition flex items-center gap-1.5"
          >
            <Globe size={15} />
            <span>{lang === "ar" ? "English" : "العربية"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-8">
        {!bookingSuccess ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Banner Section */}
            <div className="bg-gradient-to-r from-[#0a3d3a] to-[#072a28] text-white p-6 md:p-8 border-b border-teal-800">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/30 border border-[#e5c388]/40 text-[#e5c388] text-xs font-bold rounded-full mb-2">
                    <Video size={14} />
                    <span>
                      {lang === "ar"
                        ? "خدمة الجلسات المباشرة الصوتية والمرئية عبر Google Meet"
                        : "Live Video & Audio Consultations via Google Meet"}
                    </span>
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                    {lang === "ar" ? "حجز استشارة قانونية مرئية عن بُعد" : "Online Video Legal Consultation Booking"}
                  </h2>
                  <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                    {lang === "ar"
                      ? "احصل على استشارة قانونية ورأي مبدئي متكامل حول موضوعك مباشرة مع المختصين في المكتب."
                      : "Obtain a comprehensive legal consultation and preliminary legal advice directly with our law firm's legal team."}
                  </p>
                </div>

                <div className="hidden sm:block text-center bg-black/20 p-3 rounded-2xl border border-teal-700/50">
                  <span className="block text-[11px] text-[#e5c388] font-bold">
                    {lang === "ar" ? "دفع إلكتروني آمن 100%" : "100% Secure Payment"}
                  </span>
                  <span className="text-xs text-white">
                    {lang === "ar" ? "تأكيد فوري ورابط اجتماع آلي" : "Instant Confirmation & Meeting Link"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              
              {/* 1. Duration Selection */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  {lang === "ar" ? "اختر مدة الجلسة المرئية المطلوبة:" : "Select Consultation Duration:"}
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
                        <span className="font-bold text-slate-900 text-base">
                          {lang === "ar" ? "استشارة مرئية 30 دقيقة" : "30-Min Consultation"}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0a3d3a] text-white">
                        {settings.price30} {lang === "ar" ? "درهم" : "AED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === "ar"
                        ? "رأي قانوني وسريع، إرشادات أولية، وإجابات حاسمة حول المحاور الرئيسية للموضوع."
                        : "Quick preliminary legal assessment, initial guidelines, and focused answers."}
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
                          <span className="font-bold text-slate-900 text-base">
                            {lang === "ar" ? "استشارة موسعة 60 دقيقة" : "60-Min Comprehensive Session"}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold">
                          {lang === "ar" ? "★ الخيار الشامل للنزاعات والعقود" : "★ Recommended for Complex Matters"}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white">
                        {settings.price60} {lang === "ar" ? "درهم" : "AED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === "ar"
                        ? "دراسة كاملة للوقائع، مراجعة المستندات المرفقة، رسم خارطة طريق العمل، وتفنيد الخيارات."
                        : "Full factual discussion, review of attached documents, and strategic advice roadmap."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Date & Time Selection */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  {lang === "ar" ? "اختر موعد الجلسة (التاريخ والوقت):" : "Select Date & Time Slot:"}
                </h3>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2 mb-4">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <b>{lang === "ar" ? "ضابط الوقت الفني:" : "Time Window Rule:"}</b>{" "}
                    {lang === "ar"
                      ? "يتم حظر الحجوزات التي تبدأ خلال أقل من 60 دقيقة من الوقت الحالي لضمان الجاهزية الفنية للمستشار."
                      : "Slots starting within less than 60 minutes are disabled to ensure advisor readiness."}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "ar" ? "اختر التاريخ *" : "Select Date *"}
                    </label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "ar" ? "الأوقات المتاحة للاستشارة:" : "Available Time Slots:"}
                    </label>
                    
                    {isDateBlocked ? (
                      <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 text-center">
                        {lang === "ar" ? "عذراً، هذا اليوم غير متاح للحجوزات حالياً." : "Sorry, this date is not available for bookings."}
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Client Information */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  {lang === "ar" ? "بيانات الموكل وموضوع الاستشارة:" : "Client Information & Subject:"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "ar" ? "الاسم الكامل *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: سعود المنصوري" : "e.g. John Smith"}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "ar" ? "رقم الواتساب للتنبيهات *" : "WhatsApp Number *"}
                    </label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === "ar" ? "البريد الإلكتروني *" : "Email Address *"}
                    </label>
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
                    {lang === "ar" ? "ملخص وقائع الموضوع أو الاستفسار *" : "Summary of Subject / Issue *"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={issueSummary}
                    onChange={(e) => setIssueSummary(e.target.value)}
                    placeholder={
                      lang === "ar"
                        ? "اكتب خلاصة الموضوع والأسئلة المفتاحية التي تود طرحها خلال الجلسة المرئية..."
                        : "Briefly outline your situation and key questions to be discussed..."
                    }
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === "ar" ? "إرفاق مستندات (اختياري - حتى 3 صفحات PDF/صورة)" : "Attach Documents (Optional - up to 3 pages)"}
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                    <Upload size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0a3d3a] file:text-white"
                    />
                    {attachedFile && (
                      <span className="text-xs text-emerald-700 font-bold">
                        {lang === "ar" ? "تم إرفاق:" : "Attached:"} {attachedFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Terms, Conditions & Disclaimer Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0a3d3a] focus:ring-[#0a3d3a] shrink-0 cursor-pointer"
                  />
                  <label htmlFor="termsCheckbox" className="text-xs text-slate-800 leading-relaxed cursor-pointer font-medium">
                    {lang === "ar" ? (
                      <>
                        أقر وأؤكد بأني قرأت واستوعبت{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#0a3d3a] font-bold underline hover:text-teal-900 inline-flex items-center gap-1 mx-1"
                        >
                          <FileText size={14} />
                          <span>وثيقة الشروط والأحكام وإخلاء المسؤولية القانونية الكاملة</span>
                        </button>
                        وأوافق عليها تماماً دون أدنى تحفظ كشرط إجباري للحجز وسداد الرسوم.
                      </>
                    ) : (
                      <>
                        I confirm that I have read and agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#0a3d3a] font-bold underline hover:text-teal-900 inline-flex items-center gap-1 mx-1"
                        >
                          <FileText size={14} />
                          <span>Terms, Conditions & Legal Disclaimer Document</span>
                        </button>
                        as a mandatory condition for booking and payment.
                      </>
                    )}
                  </label>
                </div>

                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-200/60 hover:bg-amber-200 text-amber-900 text-xs font-bold transition inline-flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>
                      {lang === "ar" ? "قراءة وثيقة إخلاء المسؤولية والشروط الكاملة" : "Read Full Legal Disclaimer Document"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 5. Submission Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0a3d3a] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#072a28] transition text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <CreditCard className="animate-spin" size={18} />
                    <span>
                      {lang === "ar"
                        ? "جاري معالجة الدفع وتوليد رابط Google Meet..."
                        : "Processing payment & generating Google Meet link..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock size={18} className="text-[#e5c388]" />
                    <span>
                      {lang === "ar"
                        ? `تأكيد الحجز والدفع الفوري (${serviceDuration === 30 ? settings.price30 : settings.price60} درهم)`
                        : `Confirm Booking & Pay Now (${serviceDuration === 30 ? settings.price30 : settings.price60} AED)`}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success Screen */
          <div className="bg-[#051f1e] rounded-3xl p-6 md:p-10 text-white border border-teal-800 shadow-2xl space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-3">
              <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto font-black text-2xl shadow-lg">
                ✓
              </div>
              <h3 className="text-2xl font-black text-[#e5c388]">
                {lang === "ar" ? "تم تأكيد الدفع وتوليد رابط Google Meet بنجاح!" : "Payment Confirmed & Google Meet Link Created!"}
              </h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                {lang === "ar"
                  ? `شكراً لك عزيزي الموكل (${createdBooking?.clientName}). تم تسجيل حجزك ونقل بياناتك إلى لوحة المستشار المختص بلمكتب.`
                  : `Thank you (${createdBooking?.clientName}). Your booking is registered and dispatched to our legal team.`}
              </p>
            </div>

            <div className="bg-black/50 p-5 rounded-2xl border border-[#e5c388]/30 max-w-xl mx-auto space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                <span className="text-slate-400">{lang === "ar" ? "رقم مرجع الحجز:" : "Booking Ref:"}</span>
                <span className="text-[#e5c388] font-mono font-bold text-sm">{createdBooking?.reference}</span>
              </div>
              <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                <span className="text-slate-400">{lang === "ar" ? "موعد الجلسة:" : "Appointment Time:"}</span>
                <span className="text-white font-bold">{createdBooking?.date} — {createdBooking?.timeSlot}</span>
              </div>
              <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                <span className="text-slate-400">{lang === "ar" ? "الرسوم المدفوعة:" : "Paid Amount:"}</span>
                <span className="text-white font-bold">{createdBooking?.duration} {lang === "ar" ? "دقيقة" : "mins"} ({createdBooking?.amountPaid} {lang === "ar" ? "درهم" : "AED"})</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-1">{lang === "ar" ? "رابط قاعة Google Meet المباشر:" : "Direct Google Meet Room Link:"}</span>
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
                        alert(lang === "ar" ? "تم نسخ رابط Google Meet بنجاح!" : "Google Meet link copied!");
                      }
                    }}
                    className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition"
                    title={lang === "ar" ? "نسخ الرابط" : "Copy Link"}
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
                {lang === "ar" ? "حجز استشارة مرئية جديدة" : "Book Another Consultation"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Comprehensive Terms, Conditions & Disclaimer Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-[#0a3d3a]" size={24} />
                <h3 className="font-black text-lg text-slate-900">
                  {lang === "ar" ? "وثيقة الشروط والأحكام وإخلاء المسؤولية الكاملة" : "Terms, Conditions & Full Legal Disclaimer"}
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold">
                {lang === "ar"
                  ? "تعتبر هذه الوثيقة اتفاقاً قانونياً حاسماً بين الموكل ومكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية، وقبولك لها يعد شرطاً لتقديم الخدمة."
                  : "This document constitutes a binding agreement between the client and Suood Ahmed Al Shehhi Advocates & Legal Consultants."}
              </div>

              {/* Clause 1 */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {lang === "ar" ? "1. نطاق الجلسة الاستشارية المبدئية:" : "1. Scope of Preliminary Consultation:"}
                </h4>
                <p>
                  {lang === "ar"
                    ? "الجلسة المرئية مخصصة لإعطاء رأي قانوني استرشادي ومبدئي بناءً على الشرح الشفهي والبيانات الأولية المقدمة من الموكل، ولا تتضمن دراسة العقود والمستندات المطولة التفصيلية أو إعداد المذكرات والصحف القضائية."
                    : "The video session is limited to providing a preliminary legal opinion based on client input, excluding lengthy document auditing or formal court pleading draftings."}
                </p>
              </div>

              {/* Clause 2 */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {lang === "ar" ? "2. عدم نشوء علاقة توكيل قضائي:" : "2. No Attorney-Client Representation Created:"}
                </h4>
                <p>
                  {lang === "ar"
                    ? "حجز الجلسة وسداد رسومها لا يعد بأي حال من الأحوال عقد وكالة أو تكليفاً للمكتب للترافع أمام المحاكم أو اللجان القضائية، ولا ينشئ التزاماً بإدارة القضايا إلا بموجب عقد خدمات قانونية رسمي منفصل ووكالة رسمية موثقة."
                    : "Booking a consultation does not create a formal attorney-client representation in court unless a separate legal service agreement is signed."}
                </p>
              </div>

              {/* Clause 3 */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {lang === "ar" ? "3. التعهد القاطع بحظر التسجيل:" : "3. Strict Prohibition of Recording:"}
                </h4>
                <p>
                  {lang === "ar"
                    ? "يُمنع منعاً باتاً على الموكل تسجيل الصوت أو الفيديو خلال الجلسة المرئية عبر Google Meet أو اقتطاع أجزاء منها أو نشرها باي وسائل إلكترونية، ويتحمل الموكل المسؤولية الجزائية والمدنية المترتبة على مخالفة ذلك طبقاً للتشريعات النافذة."
                    : "Audio or video recording during the Google Meet session is strictly forbidden under privacy and cybercrime laws."}
                </p>
              </div>

              {/* Clause 4 */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {lang === "ar" ? "4. السرية وحماية المعلومات:" : "4. Confidentiality & Data Protection:"}
                </h4>
                <p>
                  {lang === "ar"
                    ? "يتعهد المكتب بالتعامل مع كافة البيانات والمستندات المقدمة من الموكل بأعلى درجات السرية والمهنية طبقاً لأخلاقيات مهنة المحاماة وحماية الأسرار."
                    : "The law firm maintains strict professional secrecy regarding all information disclosed by the client."}
                </p>
              </div>

              {/* Clause 5 */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {lang === "ar" ? "5. سياسة التأجيل والغياب والرسوم:" : "5. Rescheduling, Absence & Refund Policy:"}
                </h4>
                <p>
                  {lang === "ar"
                    ? "يمكن طلب إعادة جدولة الموعد قبل 4 ساعات على الأقل من موعد الجلسة. وفي حال غياب الموكل عن قاعة Google Meet دون إشعار مسبق، تعد الجلسة مستنفذة ولا يحق المطالبة باسترداد الرسوم."
                    : "Rescheduling requests must be sent at least 4 hours prior. Unannounced no-shows render the session consumed without refund."}
                </p>
              </div>

              {/* Clause 6 */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {lang === "ar" ? "6. إخلاء المسؤولية الكاملة:" : "6. Comprehensive Waiver of Liability:"}
                </h4>
                <p>
                  {lang === "ar"
                    ? "يُخلي المكتب ومحاموه ومستشاروه مسؤوليتهم الكاملة عن أي قرارات أو إجراءات يتخذها الموكل بمفرده بناءً على الرأي المبدئي دون توكيل المكتب رسمياً بمتابعة النزاع وإدارة الدعوى."
                    : "The firm waives all liability for independent decisions taken by the client without executing a formal legal engagement."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-6 py-3 rounded-2xl bg-[#0a3d3a] text-white font-bold text-xs hover:bg-[#072a28] transition flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>
                  {lang === "ar" ? "أوافق وأقر بجميع الشروط والأحكام أعلاه" : "I Agree & Accept All Terms Above"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 text-center text-xs text-slate-500 border-t border-slate-200 pt-6">
        <p>© {new Date().getFullYear()} مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية • suoodlawhq.com</p>
      </footer>
    </div>
  );
};

export default PublicConsultationPage;
