import React, { useState, useMemo } from "react";
import {
  Video, Clock, Upload, AlertCircle, CreditCard,
  Copy, ExternalLink, Lock, CheckCircle2, Globe, FileText, X, ShieldAlert, ArrowLeft,
  HelpCircle, MapPin, Phone, Star, Scale, ShieldCheck, Award, ChevronDown, ChevronUp,
  Sparkles, Building2, UserCheck, Receipt, Smartphone
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
  videoUrl?: string;
  mbankIban?: string;
  mbankMerchantId?: string;
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

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  // Payment Gateway State
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "credit_card" | "bank_transfer">("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bankRef, setBankRef] = useState("");

  // Terms Modal & Checkbox
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

  // ---------- تنسيق حقول بطاقة الدفع أثناء الكتابة (مظهر أكثر احترافية وسلامة الإدخال) ----------
  const detectCardBrand = (digits: string): "visa" | "mastercard" | "unknown" => {
    if (digits.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "mastercard";
    return "unknown";
  };

  const cardBrand = useMemo(() => detectCardBrand(cardNumber.replace(/\s/g, "")), [cardNumber]);

  const handleCardNumberChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    const grouped = digits.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(grouped);
  };

  const handleCardExpiryChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      setCardExpiry(digits);
    } else {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    }
  };

  const handleCardCvvChange = (raw: string) => {
    setCardCvv(raw.replace(/\D/g, "").slice(0, 4));
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

    if (paymentMethod === "credit_card" && (!cardNumber || !cardExpiry || !cardCvv)) {
      alert(
        lang === "ar"
          ? "يرجى إدخال بيانات بطاقة الائتمان بشكل صحيح لإتمام عملية السداد."
          : "Please enter valid credit card details to complete payment."
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
    }, 1200);
  };

  const faqs = [
    {
      qAr: "كيف يتم إجراء الجلسة المرئية بعد إتمام الحجز؟",
      qEn: "How is the video consultation conducted after booking?",
      aAr: "فور استكمال نموذج الحجز والدفع الإلكتروني، سيظهر لك رابط Google Meet المباشر فوراً على الشاشة كما سيصلك بريد إلكتروني ورسالة واتساب تأكيدية تحتوي على رابط قاعة الاجتماع الخاصة بك.",
      aEn: "Upon completing the booking and payment, your direct Google Meet link will appear immediately on screen, and an email & WhatsApp confirmation will be sent."
    },
    {
      qAr: "هل يمكنني إرفاق عقود أو مستندات ليقوم المحامي بمرجعتها؟",
      qEn: "Can I attach contracts or documents for review?",
      aAr: "نعم، يتيح لك نموذج الحجز رفع ملف المستندات أو العقود (PDF أو صورة). ستقوم المنظومة الذكية بالمكتب بإعداد ملخص تحليلي أولي يُعرض على المستشار قبل بدء الجلسة لضمان الاستفادة الكاملة من الوقت.",
      aEn: "Yes, you can upload contracts or document files. Our system generates a preliminary summary for the lawyer to review before your session."
    },
    {
      qAr: "هل الجلسة والاستشارات المقدمة مضمونة السرية؟",
      qEn: "Are consultations strictly confidential?",
      aAr: "بالتأكيد. تخضع جميع الجلسات والاستشارات المباشرة للسرية المهنية المطلقة المضمونة بقانون مهنة المحاماة في دولة الإمارات العربية المتحدة وأخلاقيات المهنة.",
      aEn: "Absolutely. All consultations are strictly confidential under UAE Advocacy Laws and professional code of ethics."
    },
    {
      qAr: "ماذا لو رغبت في تعديل الموعد أو إعادة الجدول؟",
      qEn: "What if I need to reschedule my consultation?",
      aAr: "يمكنك طلب تعديل الموعد أو التواصل مع فريق المكتب عبر الواتساب المباشر قبل 4 ساعات على الأقل من موعد الجلسة ليتم اختيار موعد بديل مناسب.",
      aEn: "You can request a schedule change by contacting our team via WhatsApp at least 4 hours before the appointment."
    }
  ];

  return (
    <div className={`min-h-screen bg-[#f8faf9] text-slate-800 font-sans pb-24 ${lang === "ar" ? "dir-rtl" : "dir-ltr"}`}>
      {/* Themed native date input: recolor the browser's calendar icon + consistent focus ring */}
      <style>{`
        input[type="date"].themed-date-input {
          color-scheme: light;
        }
        input[type="date"].themed-date-input::-webkit-calendar-picker-indicator {
          filter: invert(13%) sepia(22%) saturate(1800%) hue-rotate(140deg) brightness(90%);
          cursor: pointer;
          opacity: 0.85;
          transition: opacity 0.15s ease;
        }
        input[type="date"].themed-date-input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>

      {/* Top Bar for Admin System return */}
      {onNavigateToAdmin && (
        <div className="bg-[#072422] text-[#e5c388] border-b border-[#124d49] px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>معاينة صفحة الجمهور الرسمية (lawyersuood.com)</span>
          </div>
          <button
            onClick={onNavigateToAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black hover:from-amber-400 hover:to-amber-500 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>العودة للوحة التحكم</span>
            <ArrowLeft size={14} />
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c59b27] via-[#d4af37] to-[#8c6b12] text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0 border border-amber-300/50">
              س
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-[#072422] leading-tight flex items-center gap-2">
                <span>{lang === "ar" ? "مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية" : "Suood Ahmed Al Shehhi Advocates & Legal Consultants"}</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-amber-900 font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                  {lang === "ar" ? "محاماة واستشارات قانونية" : "Advocates & Legal Consultants"}
                </span>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  lawyersuood.com
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-[#072422] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Globe size={15} />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Container */}
      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-[#072422] via-[#0b3835] to-[#041716] p-6 md:p-10 rounded-3xl border border-[#124d49] shadow-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Left Content */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles size={14} className="text-amber-400" />
              <span>{lang === "ar" ? "بوابة الاستشارات القانونية المرئية الرسمية" : "Official Digital Legal Consultation Portal"}</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
              {lang === "ar" ? (
                <>
                  استشارة قانونية حاسمة{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500">
                    مباشرة عن بُعد
                  </span>
                </>
              ) : (
                <>
                  Decisive Legal Advice{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500">
                    Directly Online
                  </span>
                </>
              )}
            </h2>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-xl">
              {lang === "ar"
                ? "احجز موعدك المباشر عبر Google Meet مع مستشارينا القانونيين المرخصين. دراسة دقيقة للوقائع والعقود، إجابات حاسمة، وتأكيد فوري لرابط الاجتماع عند الحجز."
                : "Book a live 1-on-1 video consultation with licensed UAE advocates. Instant Google Meet room link generation with full confidentiality."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#booking-form"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 transition shadow-lg flex items-center gap-2 border border-amber-300/40"
              >
                <Clock size={16} />
                <span>{lang === "ar" ? "احجز موعدك الآن" : "Book Your Session Now"}</span>
              </a>
            </div>

            {/* Quick Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-teal-800/50 text-center">
              <div>
                <span className="block text-sm md:text-base font-black text-amber-300">100%</span>
                <span className="text-[10px] text-slate-300">{lang === "ar" ? "سرية وحماية بيانات" : "Confidential"}</span>
              </div>
              <div>
                <span className="block text-sm md:text-base font-black text-amber-300">فوري</span>
                <span className="text-[10px] text-slate-300">{lang === "ar" ? "رابط Google Meet" : "Instant Meet Link"}</span>
              </div>
              <div>
                <span className="block text-sm md:text-base font-black text-amber-300">رسمي</span>
                <span className="text-[10px] text-slate-300">{lang === "ar" ? "استشارة موثوقة" : "Licensed Advice"}</span>
              </div>
            </div>
          </div>

          {/* Right side: Key Credentials & Guarantees (No Video) */}
          <div className="lg:col-span-5">
            <div className="bg-[#051c1a]/90 border border-teal-800/70 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-teal-900/60 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === "ar" ? "ترخيص ومعايير قانونية معتمدة" : "Licensed Legal Practice"}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {lang === "ar" ? "مكتب محاماة واستشارات قانونية مرخص" : "Licensed Advocates & Legal Consultants"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-2xl bg-[#031413]/80 border border-teal-900/50 flex items-start gap-3">
                  <Award size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">
                      {lang === "ar" ? "تخصصات وخبرات قانونية متنوعة" : "Comprehensive Legal Practice"}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                      {lang === "ar" ? "مستشارون متخصصون في دراسة وقضايا المنازعات المدنية والعقارية والعمالية والتجارية." : "Specialized Advocates in Civil, Real Estate, Labor & Commercial litigation."}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#031413]/80 border border-teal-900/50 flex items-start gap-3">
                  <Video size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">
                      {lang === "ar" ? "ربط فوري عبر Google Meet" : "Instant Google Meet Room"}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                      {lang === "ar" ? "تأكيد فوري لرابط الجلسة عبر الشاشة والواتساب والبريد مباشرة فور إتمام الحجز." : "Receive your private meeting room link directly on screen and via WhatsApp & Email."}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#031413]/80 border border-teal-900/50 flex items-start gap-3">
                  <Lock size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">
                      {lang === "ar" ? "سرية تامة ومحمية قانونياً" : "100% Legal Secrecy"}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                      {lang === "ar" ? "تخضع جميع الجلسات لسرية مهنة المحاماة وحماية البيانات المضمونة تشريعياً." : "Protected under UAE Advocacy law confidentiality regulations."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#072422] text-[#e5c388] font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">1</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{lang === "ar" ? "اختر مدة الجلسة" : "Select Duration"}</h4>
              <p className="text-[11px] text-slate-500">30 أو 60 دقيقة</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#072422] text-[#e5c388] font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">2</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{lang === "ar" ? "حدد تاريخ ووقت" : "Select Date & Time"}</h4>
              <p className="text-[11px] text-slate-500">أوقات المواعيد المتاحة</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#072422] text-[#e5c388] font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">3</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{lang === "ar" ? "اكتب وقائع الاستفسار" : "Provide Case Details"}</h4>
              <p className="text-[11px] text-slate-500">مع إمكانية إرفاق عقود</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#072422] text-[#e5c388] font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">4</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{lang === "ar" ? "سدد واستلم الرابط" : "Pay & Get Meet Link"}</h4>
              <p className="text-[11px] text-slate-500">رابط Google Meet مباشر</p>
            </div>
          </div>
        </div>

        {/* Main Booking Container */}
        <div id="booking-form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-slate-900 overflow-hidden">
            {!bookingSuccess ? (
              <div>
                <div className="bg-[#092322] text-white p-6 border-b border-teal-900 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-amber-300">
                      {lang === "ar" ? "نموذج حجز الاستشارة والمرئيات" : "Consultation Booking Form"}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {lang === "ar" ? "حجز آلي مشفر ومعتمد مع استلام رابط القاعة فور السداد" : "Secure booking with direct Google Meet URL generation"}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <Lock size={14} className="text-[#0D382B]" />
                    <span className="text-xs text-[#0D382B] font-bold">256-bit SSL</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                  {/* Step 1: Duration */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#092322] text-white flex items-center justify-center text-xs font-bold">1</span>
                      {lang === "ar" ? "اختر مدة الجلسة الاستشارية المرئية:" : "Choose Consultation Duration:"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 30 Mins */}
                      <div
                        onClick={() => setServiceDuration(30)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition relative ${
                          serviceDuration === 30
                            ? "border-[#092322] bg-teal-50/60 shadow-md"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Clock size={18} className="text-[#092322]" />
                            <span className="font-bold text-slate-900 text-sm">
                              {lang === "ar" ? "استشارة 30 دقيقة" : "30-Min Session"}
                            </span>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#092322] text-white">
                            {settings.price30} {lang === "ar" ? "درهم" : "AED"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {lang === "ar"
                            ? "مناسبة للرأي القانوني السريع والتوجيهات المباشرة حول سؤال أو استفسار محدد."
                            : "Ideal for quick legal assessment and focused direction on a specific query."}
                        </p>
                      </div>

                      {/* 60 Mins */}
                      <div
                        onClick={() => setServiceDuration(60)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition relative ${
                          serviceDuration === 60
                            ? "border-[#092322] bg-teal-50/60 shadow-md"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock size={18} className="text-amber-600" />
                              <span className="font-bold text-slate-900 text-sm">
                                {lang === "ar" ? "استشارة موسعة 60 دقيقة" : "60-Min Full Session"}
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                              {lang === "ar" ? "★ الخيار الموصى به للعقود والنزاعات" : "★ Recommended for Complex Matters"}
                            </span>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white">
                            {settings.price60} {lang === "ar" ? "درهم" : "AED"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {lang === "ar"
                            ? "دراسة شاملة للمستندات والوقائع مع رسم خطة العمل والتكييف القضائي الدقيق."
                            : "Comprehensive factual analysis, document review, and strategic guidance."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Date & Time */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#092322] text-white flex items-center justify-center text-xs font-bold">2</span>
                      {lang === "ar" ? "اختر موعد الجلسة:" : "Select Appointment Time:"}
                    </h3>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2 mb-4">
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <b>{lang === "ar" ? "ضابط الوقت الفني:" : "System Rule:"}</b>{" "}
                        {lang === "ar"
                          ? "تُحجب المواعيد التي تبدأ خلال أقل من 60 دقيقة من الوقت الحالي لضمان استعداد المستشار."
                          : "Time slots starting within less than 60 minutes from now are disabled."}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {lang === "ar" ? "تاريخ الجلسة *" : "Session Date *"}
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
                          className="themed-date-input w-full p-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {lang === "ar" ? "الأوقات المتاحة:" : "Available Slots:"}
                        </label>
                        {isDateBlocked ? (
                          <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 text-center">
                            {lang === "ar" ? "عذراً، هذا اليوم غير متاح للحجوزات حالياً." : "Selected date is not available."}
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
                                      ? "bg-[#092322] text-white border-[#092322] shadow-md"
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

                  {/* Step 3: Information & Issue */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#092322] text-white flex items-center justify-center text-xs font-bold">3</span>
                      {lang === "ar" ? "بيانات الموكل وموجز الموضوع:" : "Client Contact & Details:"}
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
                          placeholder={lang === "ar" ? "اسم الموكل الكريـم" : "Client full name"}
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {lang === "ar" ? "رقم الواتساب للتأكيد *" : "WhatsApp Number *"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+971 50 000 0000"
                          dir="ltr"
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
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
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === "ar" ? "ملخص وقائع الاستفسار والقضايا *" : "Summary of Legal Issue *"}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={issueSummary}
                        onChange={(e) => setIssueSummary(e.target.value)}
                        placeholder={
                          lang === "ar"
                            ? "اكتب تفاصيل الموضوع أو الأسئلة التي تود مناقشتها خلال الجلسة..."
                            : "Describe your situation and questions to be addressed during the session..."
                        }
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === "ar" ? "إرفاق المستندات والعقود (اختياري - حتى 3 صفحات PDF/صورة)" : "Attach Documents / Contracts (Optional)"}
                      </label>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                        <Upload size={18} className="text-slate-400 shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                          className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#092322] file:text-white"
                        />
                        {attachedFile && (
                          <span className="text-xs text-emerald-700 font-bold truncate">
                            {attachedFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Secure Payment Gateway Integration */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#092322] text-white flex items-center justify-center text-xs font-bold">4</span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {lang === "ar" ? "اختر طريقة الدفع الآمنة (بوابة الدفع الإلكترونية):" : "Select Secure Payment Method:"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                        <ShieldCheck size={14} />
                        <span>{lang === "ar" ? "اتصال مشفر 256-bit" : "256-bit SSL Secure"}</span>
                      </div>
                    </div>

                    {/* Payment Method Selector Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setPaymentMethod("credit_card")}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-2 ${
                          paymentMethod === "credit_card"
                            ? "border-[#092322] bg-teal-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <CreditCard size={16} className="text-[#092322]" />
                            <span>{lang === "ar" ? "بطاقة ائتمان / مدى" : "Credit / Debit Card"}</span>
                          </span>
                          <span className="text-[10px] bg-[#092322] text-white px-2 py-0.5 rounded font-mono">Visa/MC</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === "ar" ? "الدفع الفوري الآمن بالبطاقة البنكية" : "Secure instant card payment"}
                        </p>
                      </div>

                      <div
                        onClick={() => setPaymentMethod("apple_pay")}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-2 ${
                          paymentMethod === "apple_pay"
                            ? "border-[#092322] bg-teal-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Smartphone size={16} className="text-[#092322]" />
                            <span>Apple Pay / Google Pay</span>
                          </span>
                          <span className="text-[10px] bg-[#0D382B] text-white px-2 py-0.5 rounded font-bold">1-Click</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === "ar" ? "الدفع السريع بالبصمة أو الوجه" : "Fast biometric checkout"}
                        </p>
                      </div>

                      <div
                        onClick={() => setPaymentMethod("bank_transfer")}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-2 ${
                          paymentMethod === "bank_transfer"
                            ? "border-[#092322] bg-teal-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Building2 size={16} className="text-[#092322]" />
                            <span>{lang === "ar" ? "تحويل بنكي (IBAN)" : "Direct Bank Transfer"}</span>
                          </span>
                          <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-bold">IBAN</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === "ar" ? "التحويل لحساب بنك الإمارات دبي الوطني" : "Transfer to Emirates NBD"}
                        </p>
                      </div>
                    </div>

                    {/* Conditional Payment Inputs */}
                    {paymentMethod === "credit_card" && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>{lang === "ar" ? "بيانات البطاقة الآمنة" : "Secure Card Details"}</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Lock size={12} /> SSL Encrypted
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            {lang === "ar" ? "رقم البطاقة" : "Card Number"}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              value={cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              placeholder="0000 0000 0000 0000"
                              dir="ltr"
                              className="w-full p-2.5 pl-16 rounded-xl border border-slate-300 text-xs font-mono font-bold transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
                            />
                            {cardBrand !== "unknown" && (
                              <span
                                className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black px-1.5 py-1 rounded-md ${
                                  cardBrand === "visa" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                                }`}
                              >
                                {cardBrand === "visa" ? "VISA" : "MASTERCARD"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              {lang === "ar" ? "تاريخ الانتهاء" : "Expiry (MM/YY)"}
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              value={cardExpiry}
                              onChange={(e) => handleCardExpiryChange(e.target.value)}
                              placeholder="MM/YY"
                              dir="ltr"
                              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              رمز التحقق (CVV)
                            </label>
                            <input
                              type="password"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => handleCardCvvChange(e.target.value)}
                              placeholder="•••"
                              dir="ltr"
                              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold transition focus:ring-2 focus:ring-[#092322]/30 focus:border-[#092322] focus:outline-none hover:border-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "apple_pay" && (
                      <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-slate-800 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0D382B] text-white rounded-xl flex items-center justify-center shrink-0">
                            <Smartphone size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0D382B]">Apple Pay / Google Pay Ready</p>
                            <p className="text-[10px] text-slate-500">سيتم تفعيل الدفع بلمسة واحدة عند النقر على زر التأكيد</p>
                          </div>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg font-bold border border-emerald-300">جاهز</span>
                      </div>
                    )}

                    {paymentMethod === "bank_transfer" && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center font-bold text-amber-900">
                          <span>{lang === "ar" ? "حساب التحويل الرسمي للمكتب:" : "Official Firm Bank Account:"}</span>
                          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Emirates NBD</span>
                        </div>
                        <p className="text-slate-700 font-mono text-[11px]">
                          <b>IBAN:</b> {settings.mbankIban || "AE25 0350 0000 1234 5678 901"}
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          يرجى إدخال رقم مرجع الحوالة البنكية أو إرفاق إيصال التحويل أدناه:
                        </p>
                        <input
                          type="text"
                          value={bankRef}
                          onChange={(e) => setBankRef(e.target.value)}
                          placeholder="رقم مرجع الحوالة (مثال: TRF-992140)"
                          className="w-full p-2.5 rounded-xl border border-amber-300 text-xs bg-white font-mono transition focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Invoice Tax Breakdown */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>{lang === "ar" ? `رسوم الاستشارة (${serviceDuration} دقيقة):` : `Consultation Fee (${serviceDuration} mins):`}</span>
                        <span>{Math.round((serviceDuration === 30 ? settings.price30 : settings.price60) / 1.05)} درهم</span>
                      </div>
                      <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                        <span>{lang === "ar" ? "ضريبة القيمة المضافة (5% UAE VAT):" : "UAE VAT (5%):"}</span>
                        <span>{Math.round((serviceDuration === 30 ? settings.price30 : settings.price60) - Math.round((serviceDuration === 30 ? settings.price30 : settings.price60) / 1.05))} درهم</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 text-sm pt-1">
                        <span>{lang === "ar" ? "المبلغ الإجمالي المستحق:" : "Total Payable Amount:"}</span>
                        <span className="text-amber-700">{serviceDuration === 30 ? settings.price30 : settings.price60} درهم إماراتي</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Disclaimer Checkbox */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="termsCheckbox"
                        required
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-[#092322] focus:ring-[#092322] shrink-0 cursor-pointer"
                      />
                      <label htmlFor="termsCheckbox" className="text-xs text-slate-800 leading-relaxed cursor-pointer font-medium">
                        {lang === "ar" ? (
                          <>
                            أقر وأوافق على{" "}
                            <button
                              type="button"
                              onClick={() => setShowTermsModal(true)}
                              className="text-[#092322] font-bold underline hover:text-teal-900 inline-flex items-center gap-1 mx-1"
                            >
                              <FileText size={14} />
                              <span>وثيقة الشروط والأحكام وإخلاء المسؤولية القانونية</span>
                            </button>
                            قبل إتمام الحجز والسداد.
                          </>
                        ) : (
                          <>
                            I agree to the{" "}
                            <button
                              type="button"
                              onClick={() => setShowTermsModal(true)}
                              className="text-[#092322] font-bold underline hover:text-teal-900 inline-flex items-center gap-1 mx-1"
                            >
                              <FileText size={14} />
                              <span>Terms, Conditions & Disclaimer</span>
                            </button>
                            prior to booking.
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submission */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#092322] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#061817] transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <CreditCard className="animate-spin" size={18} />
                        <span>
                          {lang === "ar"
                            ? "جاري معالجة الدفع وتوليد رابط Google Meet..."
                            : "Processing payment & creating Meet link..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock size={18} className="text-amber-400" />
                        <span>
                          {lang === "ar"
                            ? `تأكيد الحجز والدفع (${serviceDuration === 30 ? settings.price30 : settings.price60} درهم)`
                            : `Confirm & Pay Now (${serviceDuration === 30 ? settings.price30 : settings.price60} AED)`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Success Screen */
              <div className="bg-white border border-emerald-200 shadow-xl rounded-3xl p-8 md:p-10 space-y-6 text-slate-800">
                <div className="text-center max-w-lg mx-auto space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto font-black text-2xl shadow-sm border border-emerald-300">
                    ✓
                  </div>
                  <h3 className="text-2xl font-black text-[#0D382B]">
                    {lang === "ar" ? "تم تأكيد الحجز وإنشاء رابط الاجتماع بنجاح!" : "Booking Confirmed & Meet Link Created!"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === "ar"
                      ? `عزيزي الموكل (${createdBooking?.clientName})، تم استلام حجزك وتوليد رابط الجلسة المرئية عبر Google Meet فوراً. تم إرسال نسخة التأكيد إلى بريدك الإلكتروني ورقم الواتساب.`
                      : `Dear Client (${createdBooking?.clientName}), your booking has been processed and your direct Google Meet link is ready below.`}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 max-w-xl mx-auto">
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-emerald-200">
                    <span className="text-slate-500 font-medium">{lang === "ar" ? "رقم المرجع:" : "Reference:"}</span>
                    <span className="font-mono text-[#0D382B] font-bold">{createdBooking?.reference}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">{lang === "ar" ? "التاريخ والوقت:" : "Date & Time:"}</span>
                      <span className="text-slate-800 font-bold block mt-0.5">{createdBooking?.date} | {createdBooking?.timeSlot}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{lang === "ar" ? "مدّة الجلسة:" : "Duration:"}</span>
                      <span className="text-[#C5A059] font-bold block mt-0.5">{createdBooking?.duration} {lang === "ar" ? "دقيقة" : "Mins"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 shadow-sm">
                    <span className="text-[11px] font-bold text-[#0D382B] uppercase block tracking-wider">
                      {lang === "ar" ? "رابط الجلسة المرئية المباشرة (Google Meet):" : "Direct Google Meet URL:"}
                    </span>
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-xs">
                      <span className="text-emerald-700 truncate dir-ltr">{createdBooking?.meetUrl}</span>
                      <button
                        onClick={() => {
                          if (createdBooking?.meetUrl) {
                            navigator.clipboard.writeText(createdBooking.meetUrl);
                            alert(lang === "ar" ? "تم نسخ الرابط بنجاح" : "Link copied");
                          }
                        }}
                        className="px-3 py-1 bg-[#0D382B] text-white font-bold rounded-md text-[10px] hover:bg-[#124d40] shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Copy size={12} />
                        <span>{lang === "ar" ? "نسخ" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <a
                    href={createdBooking?.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 rounded-xl bg-[#0D382B] text-white font-black text-xs text-center block hover:bg-[#124d40] transition shadow-md"
                  >
                    {lang === "ar" ? "الانضمام المباشر للقاعة الآن 🚀" : "Join Google Meet Room Now 🚀"}
                  </a>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      setCreatedBooking(null);
                      setIssueSummary("");
                      setFullName("");
                    }}
                    className="text-xs text-slate-500 underline hover:text-[#0D382B] cursor-pointer font-semibold"
                  >
                    {lang === "ar" ? "إجراء حجز جديد" : "Make another booking"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Summary Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-5 sticky top-20 shadow-lg">
              <h3 className="text-sm font-bold text-[#072422] border-b border-slate-200 pb-3 flex items-center gap-2">
                <Receipt size={16} className="text-amber-600" />
                <span>{lang === "ar" ? "ملخص بيانات الجلسة:" : "Session Summary:"}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>{lang === "ar" ? "نوع الجلسة:" : "Session Type:"}</span>
                  <span className="font-bold text-slate-900">
                    {serviceDuration === 30
                      ? (lang === "ar" ? "جلسة 30 دقيقة" : "30-Min Session")
                      : (lang === "ar" ? "جلسة 60 دقيقة" : "60-Min Session")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>{lang === "ar" ? "التاريخ المحدد:" : "Selected Date:"}</span>
                  <span className="font-bold text-[#072422]">{selectedDate || "—"}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>{lang === "ar" ? "الوقت المحدد:" : "Selected Time:"}</span>
                  <span className="font-bold text-[#072422]">{selectedTimeSlot || "—"}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-800">{lang === "ar" ? "الإجمالي المستحق:" : "Total Amount:"}</span>
                  <span className="text-amber-700 font-mono text-lg">
                    {serviceDuration === 30 ? settings.price30 : settings.price60} {lang === "ar" ? "درهم" : "AED"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#072422] text-white text-[11px] space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <CheckCircle2 size={14} />
                  <span>{lang === "ar" ? "مميزات الحجز الإلكتروني:" : "Included Benefits:"}</span>
                </div>
                <ul className="space-y-1 text-slate-200 list-disc list-inside">
                  <li>{lang === "ar" ? "رابط Google Meet مباشر ومحمي." : "Instant secure Google Meet URL."}</li>
                  <li>{lang === "ar" ? "مراجعة مبدئية ذكية للعقود والمستندات." : "Smart initial document triage."}</li>
                  <li>{lang === "ar" ? "تأكيد فوري عبر الواتساب والبريد." : "Instant WhatsApp & email confirm."}</li>
                </ul>
              </div>
            </div>

            {/* Office Location & Contact Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-[#072422] flex items-center gap-2">
                <Building2 size={16} className="text-amber-600" />
                <span>{lang === "ar" ? "المقر الرئيسي للمكتب:" : "Headquarters:"}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "ar"
                  ? "شارع الشيخ زايد - دبي، دولة الإمارات العربية المتحدة"
                  : "Sheikh Zayed Road - Dubai, United Arab Emirates"}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-amber-600" />
                  <span>+971 4 000 0000</span>
                </span>
                <span className="text-emerald-700 font-bold">{lang === "ar" ? "دعم 24/7" : "24/7 Support"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === "ar" ? "الأسئلة الشائعة حول الاستشارات المرئية" : "Frequently Asked Questions"}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === "ar" ? "كل ما تحتاج معرفته عن آلية الحجز والسرية والجلسة المباشرة" : "Everything about session security, Google Meet links, and scheduling"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-xs font-bold text-slate-800 hover:text-[#072422] flex items-center justify-between cursor-pointer text-right"
                  >
                    <span>{lang === "ar" ? faq.qAr : faq.qEn}</span>
                    {isOpen ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-3 bg-white">
                      {lang === "ar" ? faq.aAr : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0D382B] font-bold text-sm">
                <FileText size={18} />
                <span>{lang === "ar" ? "وثيقة الشروط والأحكام وإخلاء المسؤولية" : "Terms, Conditions & Legal Disclaimer"}</span>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                <b>1. طبيعة الخدمة:</b> تعد الجلسة الاستشارية المرئية رأياً قانونياً توجيهياً مبنياً على المعطيات والوقائع المقدمة من قبل الموكل وقت الجلسة.
              </p>
              <p>
                <b>2. السرية وحماية البيانات:</b> يلتزم المكتب بالسرية التامة وفق أحكام قوانين تنظيم مهنة المحاماة والأنظمة المعمول بها في دولة الإمارات العربية المتحدة.
              </p>
              <p>
                <b>3. سياسة تعديل المواعيد:</b> يمكن للموكل طلب إعادة جدولة الموعد قبل 4 ساعات على الأقل من بداية الجلسة.
              </p>
              <p>
                <b>4. الدفع والرسوم:</b> تُسدد رسوم الجلسة المحددة إلكترونياً قبل توثيق الحجز، ويُولد رابط القاعة تلقائياً وبشكل فوري.
              </p>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 cursor-pointer"
              >
                {lang === "ar" ? "موافق وقبول الشروط" : "Accept & Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicConsultationPage;
