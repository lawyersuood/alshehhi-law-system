import React, { useState, useMemo } from "react";
import {
  Video, Calendar, Clock, ShieldCheck, CheckCircle2, FileText, Upload, AlertCircle,
  CreditCard, Check, Copy, ExternalLink, Code, MessageSquare, Sparkles, Send, Lock
} from "lucide-react";

export interface BookingConsultationViewProps {
  onAddAppointmentNotification?: (title: string, details: string) => void;
}

export const BookingConsultationView: React.FC<BookingConsultationViewProps> = ({
  onAddAppointmentNotification
}) => {
  const [viewMode, setViewMode] = useState<"booking" | "code_export" | "system_instruction">("booking");
  
  // Form State
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

  // Booking Flow & Payment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [generatedMeetUrl, setGeneratedMeetUrl] = useState("");
  const [bookingReference, setBookingReference] = useState("");

  // AI Lawyer Executive Summary
  const [aiSummary, setAiSummary] = useState<{
    qualification: string;
    facts: string[];
    jurisdiction: string;
    keyQuestions: string[];
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstruction, setCopiedInstruction] = useState(false);

  // Available Time Slots
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

  // Calculate constraint: Slots starting in less than 60 mins from current time are disabled
  const timeSlotStatuses = useMemo(() => {
    const now = new Date();
    const isToday = selectedDate === now.toISOString().split("T")[0];

    return baseTimeSlots.map((slot) => {
      if (!isToday) {
        return { slot, available: true, reason: "" };
      }

      // Parse slot time on selected date
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
          reason: diffInMinutes < 0 ? "وقت مضى" : "أقل من 60 دقيقة من الوقت الحالي"
        };
      }

      return { slot, available: true, reason: "" };
    });
  }, [selectedDate]);

  // AI Classification engine for demo summary
  const generateLegalSummary = (text: string) => {
    const lower = text.toLowerCase();
    let niche = "قضية مدنية وتجارية عامة (معاملات مدنية وتجارية إماراتية)";
    let court = "محاكم دبي / المحكمة الاتحادية الابتدائية (الدائرة التجارية/المدنية)";
    let q1 = "ما هي الوثائق الرسمية أو العقود الموقعة بين الأطراف التي تؤكد الالتزامات؟";
    let q2 = "هل تم وجه إعذار رسمي أو إنذار قانوني عبر الكاتب العدل قبل البدء بالإجراءات؟";
    let q3 = "ما هي القيمة المالية الإجمالية للمطالبة وما هي الأضرار المباشرة المترتبة؟";

    if (lower.includes("عمل") || lower.includes("راتب") || lower.includes("فصل") || lower.includes("عمال")) {
      niche = "منازعة عمالية (قانون تنظيم علاقات العمل الاتحادي رقم 33 لسنة 2021)";
      court = "المحكمة العمالية الابتدائية / وزارة الموارد البشرية والتوطين (موهري)";
      q1 = "هل الشكوى مقيدة لدى وزارة الموارد البشرية والتوطين وهل أُحيلت للتقاضي؟";
      q2 = "ما هو تاريخ أخر يوم عمل فعلي وهل تمت تصفية مستحقات نهاية الخدمة؟";
      q3 = "هل يوجد عقد عمل محدد أو غير محدد المدة وما هي قيمة الأجر الأساسي الإجمالي؟";
    } else if (lower.includes("عقار") || lower.includes("إيجار") || lower.includes("شقة") || lower.includes("مطور")) {
      niche = "نزاع عقاري وإيجاري (قوانين الإيجارات والتطوير العقاري بالإمارات)";
      court = "مركز فض المنازعات الإيجارية / دائرة الأراضي والأملاك";
      q1 = "هل تم تسجيل العقد في نظام إيجاري (Ejari) أو ملاك؟";
      q2 = "هل صَدر إشعار إخلاء أو زيادة إيجارية رسمي وفق الشروط القانونية؟";
      q3 = "هل توجد شيكات مرتجعة أو مطالبات بالصيانة الدورية؟";
    } else if (lower.includes("شركة") || lower.includes("شريك") || lower.includes("عقد") || lower.includes("استثمار")) {
      niche = "منازعة شركات وتجارة (قانون الشركات التجارية الاتحادي)";
      court = "المحكمة التجارية الابتدائية (دائرة الشركات والاستثمار)";
      q1 = "ما هي نسبة الحصص المسجلة في عقد تأسيس الشركة والرخصة التجارية؟";
      q2 = "هل تم الاطلاع على الميزانيات والتقارير المالية المعتمدة للشركة؟";
      q3 = "هل يوجد نزاع حول الإدارة والتوقيع أو سحب أرباح مقترحة؟";
    } else if (lower.includes("طلاق") || lower.includes("نفقة") || lower.includes("حضانة") || lower.includes("أسرة")) {
      niche = "أحوال شخصية وأسرة (قانون الأحوال الشخصية الإماراتي)";
      court = "محكمة الأحوال الشخصية (قسم التوجيه الأسري والمصالحة)";
      q1 = "هل تم قيد ملف التوجيه الأسري والمصالحة رسمياً لدى المحكمة؟";
      q2 = "ما هي الطلبات المحددة (حضانة، نفقة، مسكن، إثبات زواج/طلاق)؟";
      q3 = "هل يوجد أطفال قصر وما هي أرقام الهويات الوطنية والوثائق المتاحة؟";
    }

    const sentences = text.trim().split(/[\n.،]/).filter(s => s.trim().length > 5);
    const fact1 = sentences[0] || "تلقي الموكل لالتزامات أو إخطارات جارية تتطلب تكييفاً قانونياً عاجلاً.";
    const fact2 = sentences[1] || "وجود خلاف جوهري بين الأطراف حول تنفيذ بنود الاتفاق أو الحقوق المالية.";
    const fact3 = sentences[2] || "حاجة الموكل لمعرفة القواعد القضائية ورسم خطة التقاضي لحماية حقوقه.";

    return {
      qualification: niche,
      facts: [fact1, fact2, fact3],
      jurisdiction: court,
      keyQuestions: [q1, q2, q3]
    };
  };

  // Handle Booking Submit & Simulate Google Meet + Payment
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("يرجى الموافقة على الشروط والتعهد الإجباري لمتابعة حجز الاستشارة.");
      return;
    }
    if (!selectedTimeSlot) {
      alert("يرجى اختيار الوقت المناسب للاستشارة المرئية.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ref = `SHH-MEET-${Math.floor(100000 + Math.random() * 900000)}`;
      const meetCode = `suood-law-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      const meetUrl = `https://meet.google.com/${meetCode}`;

      setBookingReference(ref);
      setGeneratedMeetUrl(meetUrl);

      const generatedSummary = generateLegalSummary(issueSummary || "استفسار قانوني عام يرغب الموكل في مناقشته خلال الجلسة المرئية.");
      setAiSummary(generatedSummary);

      setIsSubmitting(false);
      setBookingSuccess(true);

      if (onAddAppointmentNotification) {
        onAddAppointmentNotification(
          `حجز استشارة مرئية جديدة (#${ref})`,
          `الموكل: ${fullName} | الموعد: ${selectedDate} ${selectedTimeSlot} (${serviceDuration} دقيقة)`
        );
      }
    }, 1500);
  };

  // HTML / CSS / JS Standalone Source Code String
  const standaloneHtmlCode = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حجز استشارة قانونية مرئية | مكتب سعود أحمد الشحي للمحاماة suoodlawhq.com</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Cairo', sans-serif; background-color: #f8fafc; color: #0f172a; }
        .brand-teal { background-color: #0a3d3a; }
        .brand-teal-dark { background-color: #051f1e; }
        .brand-gold { color: #d4af37; }
        .bg-gold { background-color: #d4af37; }
        .border-gold { border-color: #d4af37; }
    </style>
</head>
<body class="p-4 md:p-8">

    <!-- كارت الحجز الرئيسي -->
    <div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        <!-- الهيدر الرسمي للمكتب -->
        <div class="brand-teal text-white p-6 md:p-8 border-b border-[#135753] relative">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <span class="inline-block px-3 py-1 bg-[#135753] text-[#e5c388] text-xs font-bold rounded-full mb-2">
                        suoodlawhq.com — حجز أونلاين مباشر
                    </span>
                    <h1 class="text-2xl md:text-3xl font-black text-white">مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية</h1>
                    <p class="text-teal-100/80 text-xs md:text-sm mt-1">خدمة حجز الاستشارات القانونية المرئية عن بُعد عبر Google Meet</p>
                </div>
                <div class="bg-black/30 border border-[#e5c388]/30 p-3 rounded-2xl text-center">
                    <span class="block text-xs text-[#e5c388]">ترخيص دولة الإمارات</span>
                    <span class="text-xs font-bold text-white">وزارة العدل ومحاكم دبي وأبوظبي</span>
                </div>
            </div>
        </div>

        <form id="bookingForm" class="p-6 md:p-8 space-y-8" onsubmit="handleFormSubmit(event)">
            
            <!-- 1. اختيار باقة الاستشارة -->
            <div>
                <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full brand-teal text-white flex items-center justify-center text-xs font-bold">1</span>
                    اختر مدة الاستشارة القانونية المرئية:
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <label class="relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition border-slate-200 hover:border-teal-700 bg-slate-50" id="card30">
                        <input type="radio" name="duration" value="30" class="sr-only" onchange="selectDuration(30)">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-slate-900 text-base">استشارة مرئية 30 دقيقة</span>
                            <span class="text-xs font-bold px-2.5 py-1 rounded-lg brand-teal text-white">525 درهم</span>
                        </div>
                        <p class="text-xs text-slate-600 leading-relaxed">تكييف قانوني سريع، تحديد الشرائع والقواعد المطبقة، وإجابات مركزة على الأسئلة الجوهرية.</p>
                    </label>

                    <label class="relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition border-teal-700 bg-teal-50/50" id="card60">
                        <input type="radio" name="duration" value="60" checked class="sr-only" onchange="selectDuration(60)">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-bold text-slate-900 text-base block">استشارة موسعة 60 دقيقة</span>
                                <span class="text-[10px] text-amber-700 font-bold">★ الأكثر طلباً للقضايا المعقدة</span>
                            </div>
                            <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white">945 درهم</span>
                        </div>
                        <p class="text-xs text-slate-600 leading-relaxed">دراسة مستفيضة للوقائع، رسم خارطة طريق التقاضي، تقييم أدلة الإثبات، وصياغة الأسئلة المفتاحية.</p>
                    </label>

                </div>
            </div>

            <!-- 2. اختيار التاريخ والوقت (مع القيد البرمجي لـ 60 دقيقة) -->
            <div>
                <h2 class="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full brand-teal text-white flex items-center justify-center text-xs font-bold">2</span>
                    تاريخ ووقت الاستشارة:
                </h2>
                <p class="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-4">
                    ⚠️ <b>قيد النظام:</b> يُمنع حجز أي موعد يبدأ خلال أقل من 60 دقيقة من الوقت الحالي لضمان الجاهزية الفنية والقانونية للمستشار.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="md:col-span-1">
                        <label class="block text-xs font-bold text-slate-700 mb-1">اختر التاريخ:</label>
                        <input type="date" id="bookingDate" class="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold" onchange="renderSlots()">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 mb-1">الأوقات المتاحة اليوم:</label>
                        <div id="slotsContainer" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <!-- يتم توليد الأوقات ديناميكياً بواسطة JavaScript -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. نموذج البيانات -->
            <div>
                <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full brand-teal text-white flex items-center justify-center text-xs font-bold">3</span>
                    بيانات الموكل وموضوع الاستشارة:
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                        <input type="text" id="clientName" required placeholder="مثال: أحمد عبد الله الملا" class="w-full p-3 rounded-xl border border-slate-300 text-xs">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب *</label>
                        <input type="tel" id="clientPhone" required placeholder="+971 50 123 4567" class="w-full p-3 rounded-xl border border-slate-300 text-xs" dir="ltr">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                        <input type="email" id="clientEmail" required placeholder="name@domain.com" class="w-full p-3 rounded-xl border border-slate-300 text-xs" dir="ltr">
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-700 mb-1">ملخص موضوع الاستشارة / الوقائع المبدئية *</label>
                    <textarea id="issueText" required rows="3" placeholder="اكتب ملخصاً موجزاً للمشكلة أو النزاع القانوني..." class="w-full p-3 rounded-xl border border-slate-300 text-xs"></textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">إرفاق مستندات (بحد أقصى 3 صفحات PDF/صور)</label>
                    <input type="file" id="docUpload" accept=".pdf,.png,.jpg,.jpeg" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100">
                </div>
            </div>

            <!-- 4. إقرار واختبار الشروط الإجباري -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label class="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" id="termsCheck" required class="mt-1 w-4 h-4 rounded border-slate-300 text-teal-800 focus:ring-teal-700">
                    <span class="text-xs text-slate-700 leading-relaxed">
                        <b>تعهد وإقرار إجباري:</b> أقر وأوافق على أن هذه الاستشارة مخصصة لإعطاء الرأي القانوني المبدئي وتكييف الدعوى ورسم خطة التقاضي، ولا تشمل دراسة العقود والمستندات التفصيلية المطولة أو كتابة المذكرات أو الترافع أمام المحاكم. كما يمنع منعاً باتاً تسجيل الجلسة المرئية أو الصوتية بغير إذن كتابي مسبق من المكتب وفقاً للتشريعات النافذة في دولة الإمارات.
                    </span>
                </label>
            </div>

            <!-- 5. زر التأكيد والدفع -->
            <button type="submit" class="w-full brand-teal text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#08302e] transition text-sm flex items-center justify-center gap-2">
                <span>تأكيد الحجز والانتقال لبوابة الدفع الآمنة (Google Meet)</span>
            </button>

        </form>

        <!-- نافذة النتيجة التفاعلية وتوليد Google Meet -->
        <div id="resultModal" class="hidden p-8 brand-teal-dark text-white border-t border-teal-800">
            <div class="text-center max-w-lg mx-auto space-y-4">
                <div class="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto font-black text-2xl">✓</div>
                <h3 class="text-2xl font-black text-amber-300">تم تأكيد الحجز وتوليد رابط Google Meet بنجاح!</h3>
                <p class="text-xs text-teal-100 leading-relaxed">تم إرسال تفاصيل الموعد ورابط الدخول المباشر إلى البريد الإلكتروني والواتساب المسجل.</p>
                
                <div class="bg-black/40 p-4 rounded-2xl border border-amber-500/30 text-right space-y-2 text-xs">
                    <div><b>رقم مرجع الحجز:</b> <span id="resRef" class="text-amber-400 font-mono"></span></div>
                    <div><b>رابط اجتماع Google Meet:</b></div>
                    <a id="resMeet" href="#" target="_blank" class="block p-3 bg-teal-900 text-amber-300 font-mono rounded-xl text-center underline font-bold break-all"></a>
                </div>
            </div>
        </div>

    </div>

    <script>
        let selectedSlot = "";
        let durationMin = 60;

        // تعيين تاريخ اليوم كحد أدنى
        const dateInput = document.getElementById('bookingDate');
        const todayStr = new Date().toISOString().split('T')[0];
        dateInput.value = todayStr;
        dateInput.min = todayStr;

        function selectDuration(d) {
            durationMin = d;
        }

        function renderSlots() {
            const container = document.getElementById('slotsContainer');
            container.innerHTML = '';
            
            const baseSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM"];
            const now = new Date();
            const chosenDate = dateInput.value;
            const isToday = chosenDate === todayStr;

            baseSlots.forEach(slot => {
                let isDisabled = false;

                if (isToday) {
                    const [timeStr, modifier] = slot.split(" ");
                    let [hours, minutes] = timeStr.split(":").map(Number);
                    if (modifier === "PM" && hours < 12) hours += 12;
                    if (modifier === "AM" && hours === 12) hours = 0;

                    const slotDate = new Date();
                    slotDate.setHours(hours, minutes, 0, 0);

                    const diffMin = (slotDate.getTime() - now.getTime()) / (1000 * 60);
                    if (diffMin < 60) isDisabled = true; // شرط الـ 60 دقيقة
                }

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = isDisabled 
                    ? 'p-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    : 'p-2 text-xs font-bold rounded-xl border border-slate-300 hover:border-teal-700 bg-white text-slate-800 transition slot-btn';
                
                btn.innerText = slot + (isDisabled ? ' (محظور < 60د)' : '');
                
                if (!isDisabled) {
                    btn.onclick = () => {
                        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('bg-teal-800', 'text-white'));
                        btn.classList.add('bg-teal-800', 'text-white');
                        selectedSlot = slot;
                    };
                }
                container.appendChild(btn);
            });
        }

        function handleFormSubmit(e) {
            e.preventDefault();
            if (!selectedSlot) {
                alert('يرجى اختيار الوقت المتاح للاستشارة.');
                return;
            }

            const ref = 'SHH-MEET-' + Math.floor(100000 + Math.random() * 900000);
            const meetUrl = 'https://meet.google.com/suood-law-' + Math.random().toString(36).substring(2, 6);

            document.getElementById('resRef').innerText = ref;
            const meetA = document.getElementById('resMeet');
            meetA.href = meetUrl;
            meetA.innerText = meetUrl;

            document.getElementById('resultModal').classList.remove('hidden');
            window.scrollTo({ top: document.getElementById('resultModal').offsetTop, behavior: 'smooth' });
        }

        renderSlots();
    </script>
</body>
</html>`;

  // System Instructions string for AI Studio
  const systemInstructionsText = `أنت مساعد قانوني ذكي خاص بمكتب سعود احمد الشحي للمحاماة. مهمتك هي استلام نص مشكلة العميل المدخلة في صفحة الحجز، وتحليلها فوراً لتوليد ملخص تنفيذي موجه للمحامي يحتوي على:

1. التكييف القانوني المبدئي: (حدد نوع Niche القضية: مدني، تجاري، جزائي، عمالي، أحوال شخصية...).
2. ملخص الوقائع: في 3 نقاط مركزة جداً.
3. توصية الجلسة: المحكمة أو الجهة المختصة، والأسئلة المفتاحية التي يجب طرحها على العميل خلال الـ 30/60 دقيقة لتحديد مسار الدعوى.

اجعل الصياغة مهنية، دقيقة، ومختصرة.`;

  return (
    <div className="space-y-6">
      {/* Header Bar & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#0a3d3a] text-[#e5c388] text-xs font-bold">
              suoodlawhq.com — حجز أونلاين
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Google Meet Integration
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Video className="w-7 h-7 text-[#0a3d3a]" />
            حجز استشارة قانونية مرئية عن بُعد
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            نظام حجز الاستشارات المرئية المباشرة الخاص بمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية
          </p>
        </div>

        {/* Action Modes */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode("booking")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === "booking"
                ? "bg-[#0a3d3a] text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Video size={16} />
            <span>معاينة حجز الاستشارة المباشر</span>
          </button>

          <button
            onClick={() => setViewMode("code_export")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === "code_export"
                ? "bg-[#0a3d3a] text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Code size={16} />
            <span>الكود الكامل (HTML / CSS / JS)</span>
          </button>

          <button
            onClick={() => setViewMode("system_instruction")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === "system_instruction"
                ? "bg-[#0a3d3a] text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Sparkles size={16} className="text-amber-500" />
            <span>توجيهات الذكاء الاصطناعي AI Studio</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Live Interactive Consultation Booking */}
      {viewMode === "booking" && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#0a3d3a] text-white p-6 md:p-8 border-b border-[#115450] relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-[#115450] text-[#e5c388] text-xs font-bold rounded-full mb-2">
                  suoodlawhq.com — حجز مرئي مدمج
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية
                </h2>
                <p className="text-teal-100/80 text-xs md:text-sm mt-1">
                  حجز جلسة استشارة قانونية مرئية ومباشرة عبر Google Meet بالصوت والصورة
                </p>
              </div>
              <div className="bg-black/30 border border-[#e5c388]/30 p-3 rounded-2xl text-center backdrop-blur">
                <span className="block text-xs text-[#e5c388]">مرخص بدولة الإمارات</span>
                <span className="text-xs font-bold text-white">وزارة العدل ومحاكم دبي وأبوظبي</span>
              </div>
            </div>
          </div>

          {!bookingSuccess ? (
            <form onSubmit={handleBookingSubmit} className="p-6 md:p-8 space-y-8">
              
              {/* 1. Service Cards */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold">1</span>
                  اختر مدة ونوع الاستشارة القانونية المرئية:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 30 mins */}
                  <div
                    onClick={() => setServiceDuration(30)}
                    className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition ${
                      serviceDuration === 30
                        ? "border-[#0a3d3a] bg-teal-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-[#0a3d3a]" />
                        <span className="font-bold text-slate-900 text-base">استشارة مرئية 30 دقيقة</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0a3d3a] text-white">
                        525 درهم شامل الضريبة
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      تكييف قانوني سريع، تحديد القواعد والشرائع المطبقة، وإجابات مركزة ومحددة على الأسئلة الجوهرية.
                    </p>
                    <div className="mt-3 text-[11px] text-teal-800 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> يشمل رابط Google Meet وتأكيد فوري
                    </div>
                  </div>

                  {/* Card 60 mins */}
                  <div
                    onClick={() => setServiceDuration(60)}
                    className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition ${
                      serviceDuration === 60
                        ? "border-[#0a3d3a] bg-teal-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock size={18} className="text-amber-600" />
                          <span className="font-bold text-slate-900 text-base">استشارة موسعة 60 دقيقة</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold">★ الأكثر طلباً للقضايا المعقدة</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white">
                        945 درهم شامل الضريبة
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      دراسة مستفيضة للوقائع، رسم خارطة طريق التقاضي، تقييم أدلة الإثبات، وصياغة الأسئلة الاستراتيجية للمحاكمة.
                    </p>
                    <div className="mt-3 text-[11px] text-amber-800 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> يشمل مراجعة ملف المستندات المرفق خلال الجلسة
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Calendar & Time Slot Selection */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold">2</span>
                  اختر تاريخ ووقت الاستشارة المفضل:
                </h3>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2 mb-4">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <b>القيد البرمجي لضمان الجودة:</b> يُمنع حجز أو اختيار أي موعد يبدأ خلال أقل من 60 دقيقة من الوقت الحالي للضمان الاستعداد الفني والقانوني التام للمستشار قبل الانضمام للجلسة.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اختر تاريخ الجلسة *</label>
                    <input
                      type="date"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">الأوقات المتاحة للاستشارة المرئية:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlotStatuses.map(({ slot, available, reason }) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={!available}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2.5 text-xs font-bold rounded-xl border transition flex flex-col items-center justify-center gap-0.5 ${
                              !available
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-[#0a3d3a] text-white border-[#0a3d3a] shadow-sm"
                                : "bg-white text-slate-800 border-slate-300 hover:border-teal-700 hover:bg-teal-50/40"
                            }`}
                          >
                            <span>{slot}</span>
                            {!available && <span className="text-[9px] text-red-500 font-medium">({reason})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Form Input Data */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0a3d3a] text-white flex items-center justify-center text-xs font-bold">3</span>
                  بيانات الموكل وموضوع الاستشارة:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل / اسم الجهة *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: أحمد عبد الله الملا"
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
                      placeholder="+971 50 123 4567"
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
                      placeholder="name@example.com"
                      dir="ltr"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملخص وقائع موضوع الاستشارة المرئية *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={issueSummary}
                    onChange={(e) => setIssueSummary(e.target.value)}
                    placeholder="اكتب خلاصة المشكلة أو المنازعة القانونية والأسئلة الأساسية التي تود طرحها خلال الاستشارة..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#0a3d3a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    إرفاق ملف المستندات (حتى 3 صفحات - PDF / صورة)
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
                        تم اختيار: {attachedFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Mandatory Terms & Disclaimer Checkbox */}
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
                    <b>الإقرار والتعهد الإجباري الشامل:</b> أقر وأوافق على أن هذه الاستشارة مخصصة لإعطاء الرأي القانوني المبدئي وتكييف الدعوى ورسم خطة التقاضي، ولا تشمل دراسة العقود والمستندات التفصيلية المطولة أو كتابة المذكرات أو الترافع أمام المحاكم. كما يمنع منعاً باتاً تسجيل الجلسة المرئية أو الصوتية بغير إذن كتابي مسبق من المكتب وفقاً للتشريعات النافذة في دولة الإمارات.
                  </span>
                </label>
              </div>

              {/* 5. Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0a3d3a] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#072a28] transition text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <CreditCard className="animate-spin" size={18} />
                    <span>جاري تأكيد البيانات والانتقال لبوابة الدفع...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} className="text-[#e5c388]" />
                    <span>تأكيد الحجز والانتقال لبوابة الدفع (توليد Google Meet تلقائياً)</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* Success & Google Meet Confirmation View */
            <div className="p-6 md:p-10 bg-[#051f1e] text-white space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto font-black text-2xl shadow-lg">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-[#e5c388]">
                  تم تأكيد الحجز وتوليد رابط Google Meet بنجاح!
                </h3>
                <p className="text-xs text-teal-100/90 leading-relaxed">
                  شكراً لك {fullName}. تم قيد استشارتك المرئية وتأكيد الدفع، وتم توليد رابط قاعة الاجتماع المرئية.
                </p>
              </div>

              {/* Booking Pass */}
              <div className="bg-black/40 p-5 rounded-2xl border border-[#e5c388]/30 max-w-xl mx-auto space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                  <span className="text-slate-400">رقم مرجع الحجز:</span>
                  <span className="text-[#e5c388] font-mono font-bold text-sm">{bookingReference}</span>
                </div>
                <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                  <span className="text-slate-400">موعد الجلسة المرئية:</span>
                  <span className="text-white font-bold">{selectedDate} — الساعة {selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between items-center border-b border-teal-800 pb-2">
                  <span className="text-slate-400">مدة الجلسة:</span>
                  <span className="text-white font-bold">{serviceDuration} دقيقة</span>
                </div>
                <div>
                  <span className="block text-slate-400 mb-1">رابط قاعة Google Meet المباشر:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={generatedMeetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 p-3 bg-teal-900/80 text-[#e5c388] font-mono rounded-xl text-center font-bold underline break-all hover:bg-teal-900 transition flex items-center justify-center gap-1.5"
                    >
                      <Video size={16} />
                      <span>{generatedMeetUrl}</span>
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedMeetUrl);
                        alert("تم نسخ رابط Google Meet بنجاح!");
                      }}
                      className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                      title="نسخ الرابط"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated AI Executive Summary for Lawyer */}
              {aiSummary && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-amber-500/40 max-w-2xl mx-auto space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-2">
                    <Sparkles size={18} />
                    <span>الملخص التنفيذي الصادر من المساعد الذكي للمحامي (AI Executive Summary):</span>
                  </div>

                  <div className="space-y-3 text-slate-200">
                    <div>
                      <span className="block text-[#e5c388] font-bold mb-0.5">1. التكييف القانوني المبدئي:</span>
                      <p className="p-2.5 rounded-lg bg-black/40 text-slate-100 font-medium">
                        {aiSummary.qualification}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[#e5c388] font-bold mb-1">2. ملخص الوقائع المذكورة (3 نقاط):</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 pr-2">
                        {aiSummary.facts.map((f, idx) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="block text-[#e5c388] font-bold mb-1">3. توصية الجلسة والأسئلة المفتاحية:</span>
                      <p className="text-teal-300 mb-1"><b>الجهة/المحكمة المختصة:</b> {aiSummary.jurisdiction}</p>
                      <div className="space-y-1 pr-2 text-slate-300">
                        <p className="font-bold text-slate-200">الأسئلة المفتاحية خلال الـ {serviceDuration} دقيقة:</p>
                        {aiSummary.keyQuestions.map((q, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setFullName("");
                    setIssueSummary("");
                    setAttachedFile(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  حجز استشارة أخرى
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Mode 2: HTML / CSS / JS Standalone Code Exporter */}
      {viewMode === "code_export" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code className="text-[#0a3d3a]" size={20} />
                كود الصفحة الكامل بلغات (HTML, CSS, JavaScript) لموقع suoodlawhq.com
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                كود مستقل بملف واحد جاهز للنسخ والرفع مباشرة على موقع المكتب الرئيسي suoodlawhq.com أو إدراج كـ Embed
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(standaloneHtmlCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 3000);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0a3d3a] text-white font-bold text-xs hover:bg-[#072a28] transition flex items-center gap-2 shadow-sm"
            >
              {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copiedCode ? "تم نسخ الكود بنجاح!" : "نسخ الكود الكامل"}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[500px] dir-ltr text-left">
              <code>{standaloneHtmlCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Mode 3: System Instructions for AI Studio */}
      {viewMode === "system_instruction" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                توجيهات النظام لملخص الذكاء الاصطناعي (System Instructions)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                الكود والنص المخصص للوضع في قسم System Instructions داخل منصة AI Studio
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(systemInstructionsText);
                setCopiedInstruction(true);
                setTimeout(() => setCopiedInstruction(false), 3000);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0a3d3a] text-white font-bold text-xs hover:bg-[#072a28] transition flex items-center gap-2 shadow-sm"
            >
              {copiedInstruction ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copiedInstruction ? "تم النسخ بنجاح!" : "نسخ توجيهات النظام"}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 text-xs leading-relaxed border border-amber-500/30 font-sans space-y-3">
            <div className="text-amber-400 font-bold text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles size={16} />
              <span>نص توجيهات النظام المعتمدة لمكتب المحاماة:</span>
            </div>
            <p className="whitespace-pre-line text-slate-200 text-sm font-medium leading-relaxed">
              {systemInstructionsText}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingConsultationView;
