/* دوال مساعدة نقية — مستخرجة من App.tsx */
import { REVIEW_YEARS, LH_KEY, OFFICE_HEADER_IMG, OFFICE_FOOTER_IMG, OFFICE_SIGNATURE_IMG, OFFICE_STAMP_IMG } from "./constants";
import type { LetterheadConfig, CaseItem, Client } from "./types";

export const normalizeArabicSearch = (text: string = ""): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "") // إزالة التشكيل
    .replace(/\u0640/g, "") // إزالة التطويل
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString()) // تحويل الأرقام المشرقية
    .replace(/[\s\-_/\\,،.:()]+/g, " ");
};

export const normalizePhoneDigits = (phone: string = ""): string => {
  if (!phone) return "";
  return phone
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/[^0-9]/g, "");
};

export const normalizeArabicNameForMatch = (s: string): string => {
  return (s || "")
    .replace(/[ً-ٰٟ]/g, "") // إزالة التشكيل
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

export const firstNNameTokens = (s: string, n: number = 3): string => {
  return normalizeArabicNameForMatch(s).split(" ").filter(Boolean).slice(0, n).join(" ");
};

export const UAE_TIME_ZONE = "Asia/Dubai";

export const toDubaiISODate = (date: Date): string => new Intl.DateTimeFormat("en-CA", { timeZone: UAE_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

export const todayISO = () => toDubaiISODate(new Date());

export const addDays = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return toDubaiISODate(t); };

export const addDaysFrom = (baseDate: string, d: number) => { const t = new Date(baseDate); t.setDate(t.getDate() + d); return toDubaiISODate(t); };

export function escapeHtmlText(value: string | null | undefined): string {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const formatUaePhone = (phone: string) => {
  if (!phone) return "";
  let clean = phone.replace(/[^\d+]/g, "");
  if (clean.startsWith("0")) {
    clean = "971" + clean.slice(1);
  } else if (clean.startsWith("+")) {
    clean = clean.slice(1);
  } else if (!clean.startsWith("971") && clean.length === 9) {
    clean = "971" + clean;
  }
  return clean;
};

export const nextReviewDate = (lastReview: string, risk: string) => {
  const d = new Date(lastReview + "T00:00:00");
  d.setFullYear(d.getFullYear() + (REVIEW_YEARS[risk] || 2));
  return d.toISOString().slice(0, 10);
};

export const fmtAED = (n: number) => new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n);

export const fmtDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }) : "—";

export const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - new Date(todayISO()).getTime()) / 86400000);

export const isDeadlineOpen = (status: string) => status !== "تم قيد الطعن" && status !== "تم تقديم الطعن" && status !== "لا حاجة لطعن";

export const normalizeArabicName = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[أإآءئؤ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const getCaseStage = (c: { stage?: string; court?: string; subject?: string; number?: string; type?: string; status?: string }): string => {
  if (c.stage) return c.stage;
  const txt = ((c.court || "") + " " + (c.subject || "") + " " + (c.number || "") + " " + (c.type || "")).toLowerCase();
  if (txt.includes("استئناف") || txt.includes("استئنافية")) return "الاستئناف";
  if (txt.includes("تمييز") || txt.includes("نقض") || txt.includes("العليا")) return "التمييز / النقض";
  if (txt.includes("تنفيذ")) return "التنفيذ";
  if (txt.includes("لجنة") || txt.includes("منازعات") || txt.includes("توفيق") || txt.includes("إيجاري")) return "لجان فض المنازعات";
  return "الابتدائية";
};

export const caseOpponentsLabel = (c: { opponents?: string[] }): string => {
  const list = (c.opponents || []).map((o) => (o || "").trim()).filter(Boolean);
  if (list.length === 0) return "—";
  if (list.length === 1) return list[0];
  return list.slice(0, -1).join("، ") + " و" + list[list.length - 1];
};

export const stageBadgeColor = (st: string) => ({
  "الاستئناف": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "استئناف": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "الابتدائية": "bg-blue-100 text-blue-800 border-blue-200",
  "ابتدائي": "bg-blue-100 text-blue-800 border-blue-200",
  "التمييز / النقض": "bg-purple-100 text-purple-800 border-purple-200",
  "تمييز/نقض": "bg-purple-100 text-purple-800 border-purple-200",
  "التنفيذ": "bg-amber-100 text-amber-900 border-amber-300",
  "تنفيذ": "bg-amber-100 text-amber-900 border-amber-300",
  "لجان فض المنازعات": "bg-teal-100 text-teal-800 border-teal-200",
}[st] || "bg-slate-100 text-slate-700 border-slate-200");

export const statusColor = (s: string) => ({
  "متداولة": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "منتهية": "bg-stone-200 text-stone-700 border-stone-300",
  "محكومة": "bg-teal-100 text-teal-800 border-teal-200",
  "صدر الحكم": "bg-teal-100 text-teal-800 border-teal-200",
  "قيد النظر": "bg-sky-100 text-sky-700 border-sky-200",
  "محجوزة للحكم": "bg-purple-100 text-purple-700 border-purple-200",
  // "مشطوبة" حالة سلبية مختلفة عن الإنهاء الطبيعي للقضية، لذا تُميَّز بلون تحذيري مستقل بدل تكرار لون "منتهية"
  "مشطوبة": "bg-red-100 text-red-800 border-red-300",
  "معلقة": "bg-rose-100 text-rose-800 border-rose-200",
  "مغلقة": "bg-slate-200 text-slate-600 border-slate-300",
}[s] || "bg-slate-100 text-slate-600 border-slate-200");

export const caseTypeBadgeColor = (t: string) => {
  const typeMap: Record<string, string> = {
    "تجاري": "bg-blue-50 text-blue-900 border-blue-200 font-bold",
    "مدني": "bg-emerald-50 text-emerald-900 border-emerald-200 font-bold",
    "عمالي": "bg-amber-50 text-amber-950 border-amber-300 font-bold",
    "جزائي": "bg-rose-50 text-rose-900 border-rose-200 font-bold",
    "جنائي": "bg-rose-50 text-rose-900 border-rose-200 font-bold",
    "أحوال شخصية": "bg-purple-50 text-purple-900 border-purple-200 font-bold",
    "أسري": "bg-purple-50 text-purple-900 border-purple-200 font-bold",
    "إيجاري": "bg-cyan-50 text-cyan-900 border-cyan-200 font-bold",
    "عقاري": "bg-indigo-50 text-indigo-900 border-indigo-200 font-bold",
    "إداري": "bg-slate-100 text-slate-900 border-slate-300 font-bold",
    "تنفيذ": "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200 font-bold",
    "تحكيم": "bg-amber-100 text-amber-950 border-amber-300 font-bold",
  };
  return typeMap[t] || "bg-stone-100 text-slate-800 border-stone-200 font-bold";
};

export const caseTypeDotColor = (t: string) => {
  const dotMap: Record<string, string> = {
    "تجاري": "bg-blue-600 ring-2 ring-blue-100",
    "مدني": "bg-emerald-600 ring-2 ring-emerald-100",
    "عمالي": "bg-amber-500 ring-2 ring-amber-100",
    "جزائي": "bg-rose-600 ring-2 ring-rose-100",
    "جنائي": "bg-rose-600 ring-2 ring-rose-100",
    "أحوال شخصية": "bg-purple-600 ring-2 ring-purple-100",
    "أسري": "bg-purple-600 ring-2 ring-purple-100",
    "إيجاري": "bg-cyan-600 ring-2 ring-cyan-100",
    "عقاري": "bg-indigo-600 ring-2 ring-indigo-100",
    "إداري": "bg-slate-600 ring-2 ring-slate-200",
    "تنفيذ": "bg-fuchsia-600 ring-2 ring-fuchsia-100",
    "تحكيم": "bg-amber-600 ring-2 ring-amber-200",
  };
  return dotMap[t] || "bg-stone-500 ring-2 ring-stone-200";
};

export const invColor = (s: string) => ({
  "مسودة": "bg-slate-100 text-slate-600",
  "مرسلة": "bg-sky-100 text-sky-700",
  "مدفوعة": "bg-emerald-100 text-emerald-700",
  "متأخرة": "bg-red-100 text-red-700",
}[s] || "bg-slate-100 text-slate-600");

export const effectiveInvoiceStatus = (inv: { status: string; due?: string }): string => {
  if (inv.status === "مرسلة" && inv.due && inv.due < todayISO()) return "متأخرة";
  return inv.status;
};

export function loadLetterhead(): LetterheadConfig {
  try {
    const raw = localStorage.getItem(LH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        headerImg: parsed.headerImg || OFFICE_HEADER_IMG,
        footerImg: parsed.footerImg || OFFICE_FOOTER_IMG,
        signatureImg: parsed.signatureImg || OFFICE_SIGNATURE_IMG,
        stampImg: parsed.stampImg || OFFICE_STAMP_IMG,
        fullPageImg: parsed.fullPageImg || "",
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    headerImg: OFFICE_HEADER_IMG,
    footerImg: OFFICE_FOOTER_IMG,
    signatureImg: OFFICE_SIGNATURE_IMG,
    stampImg: OFFICE_STAMP_IMG,
    fullPageImg: "",
  };
}

export function saveLetterhead(config: LetterheadConfig) {
  try {
    localStorage.setItem(LH_KEY, JSON.stringify(config));
  } catch (e) {
    // ignore
  }
}

// ===== دوال بيانات القضايا/الموكلين (تنظيف/كشف بيانات تجريبية/دمج مكررات) =====
// انتقلت من App.tsx بنفس المنطق حرفياً — دوال نقية بدون أي استخدام لـ React state،
// تُستخدم الآن من App.tsx نفسه ومن الهوكس الجديدة (useClientsData/useCasesData) معاً.

export function isDemoCase(c: any): boolean {
  if (!c) return false;
  const num = String(c.number || "").toLowerCase();
  // يدعم الشكل القديم (opponent: نص واحد) والشكل الحالي (opponents: مصفوفة) قبل تطبيع البيانات
  const opp = String(Array.isArray(c.opponents) ? c.opponents.join(" ") : (c.opponent || "")).toLowerCase();
  const judge = String(c.judge || "").toLowerCase();
  const subj = String(c.subject || "").toLowerCase();
  return (
    c.id === 101 || c.id === 102 || c.id === 103 || c.id === 104 ||
    num.includes("458/2026 تجاري دبي") ||
    num.includes("1024/2026 مدني الشارقة") ||
    num.includes("308/2026 عمالي أبوظبي") ||
    num.includes("112/2026 استئناف تجاري دبي") ||
    opp.includes("شركة النجم الذهبي") ||
    opp.includes("مؤسسة الأفق") ||
    opp.includes("مؤسسة الرواد") ||
    opp.includes("شركة سيركل") ||
    judge.includes("المنصوري") ||
    judge.includes("سلطان الشامسي") ||
    judge.includes("محمد راشد") ||
    judge.includes("سالم الكعبي") ||
    subj.includes("نزاع تعاقدي ومطالبة مالية بقيمة 850,000") ||
    subj.includes("إخلاء للغصب ومطالبة بالتعويض")
  );
}

export function sanitizeCase(c: CaseItem): CaseItem {
  // هجرة الشكل القديم (opponent: نص واحد) إلى الشكل الحالي (opponents: مصفوفة) للبيانات المخزّنة محلياً من إصدار سابق
  const legacyOpponent = (c as any).opponent;
  const rawOpponents: string[] = Array.isArray(c.opponents)
    ? c.opponents
    : (legacyOpponent ? [legacyOpponent] : []);

  const PLACEHOLDER_OPPONENTS = new Set([
    "المستأنف ضده",
    "الخصم المستأنف ضده",
    "الطرف المقابل في الدعوى الشرعية",
    "المنفذ ضده / طالب التنفيذ",
    "المطور / المالك العقاري",
    "الطرف الآخر في الالتماس",
    "المدعى عليه في أمر الأداء",
    "الطرف الآخر في التركة والمواريث",
    "الطرف الآخر في النزاع الأسري",
    "النيابة العامة / الشاكي",
    "الطرف المقابل في الأحوال الشخصية",
    "المدعى عليه في المطالبة المالية",
    "الطرف المقابل",
    "الخصم",
    "—",
  ]);
  // تفريغ أي نصوص عشوائية أو افتراضية للخصم لم ترد في المستند
  const opponents = rawOpponents.map((o) => (o || "").trim()).filter((o) => o && !PLACEHOLDER_OPPONENTS.has(o));

  let judge = c.judge || "";
  let fee = typeof c.fee === "number" && !isNaN(c.fee) ? c.fee : 0; // الإبقاء على الأتعاب الفعلية المدخلة؛ صفر فقط إن لم تكن مُدخلة أصلاً
  let openDate = c.openDate || "";

  // تفريغ أي نصوص عشوائية أو افتراضية لاسم القاضي أو الدائرة
  if (
    judge.startsWith("دائرة الاستئناف") ||
    judge.startsWith("دائرة استئناف") ||
    judge === "دائرة الأحوال الشخصية الشرعية" ||
    judge === "دائرة التماسات إعادة النظر التجارية" ||
    judge === "د. أحمد المنصوري" ||
    judge === "المستشار سلطان الشامسي" ||
    judge === "المستشار محمد راشد" ||
    judge === "د. سالم الكعبي"
  ) {
    judge = "";
  }

  let st = c.status || "متداولة";
  if (st === "قيد الاستئناف") {
    st = "منتهية";
  }
  const stage = c.stage || getCaseStage({ ...c, status: st });
  const { opponent: _legacyOpponentField, ...rest } = c as any;

  return {
    ...rest,
    stage: stage,
    status: st,
    opponents: opponents,
    judge: judge,
    fee: fee,
    openDate: openDate,
  };
}

export function isDemoHearing(h: any): boolean {
  if (!h) return false;
  const room = String(h.room || "").toLowerCase();
  const notes = String(h.notes || "").toLowerCase();
  return (
    h.caseId === 101 || h.caseId === 102 || h.caseId === 103 || h.caseId === 104 ||
    room.includes("القاعة 4 (الابتدائية)") ||
    room.includes("القاعة 2") ||
    notes.includes("الخبير الحسابي") ||
    notes.includes("إيداع أصل الوكالة الموثقة ومستخرج السجل") ||
    notes.includes("الاستعداد لصدور الحكم") ||
    notes.includes("عرض مسودة اتفاقية التسوية")
  );
}

export function normalizeCaseNumberKey(num: string): string {
  if (!num) return "";
  const digits = String(num)
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/[^\d]/g, "/")
    .split("/")
    .filter(Boolean);
  if (digits.length === 2) {
    const sorted = [...digits].sort((a, b) => a.length - b.length || a.localeCompare(b));
    return sorted.join("-");
  }
  return String(num)
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/[\s\/\-_\.]/g, "")
    .toLowerCase();
}

export function deduplicateCases(caseList: CaseItem[]): CaseItem[] {
  const seenIds = new Set<number>();
  const seenNumberKeys = new Map<string, CaseItem>();
  const seenCompositeKeys = new Set<string>();
  const result: CaseItem[] = [];

  for (const raw of caseList) {
    if (!raw) continue;
    const c = typeof sanitizeCase === "function" ? sanitizeCase(raw) : raw;
    const normNum = normalizeCaseNumberKey(c.number);
    const compKey = `${c.clientId}_${String(c.court || "").trim().toLowerCase()}_${String(c.subject || "").trim().toLowerCase()}`;

    if (normNum && seenNumberKeys.has(normNum) && seenNumberKeys.get(normNum)!.clientId === c.clientId) {
      const existing = seenNumberKeys.get(normNum)!;
      if ((!existing.opponents || existing.opponents.length === 0) && c.opponents && c.opponents.length > 0) existing.opponents = c.opponents;
      if (!existing.judge && c.judge) existing.judge = c.judge;
      if ((!existing.court || existing.court === "محاكم دبي") && c.court && c.court !== "محاكم دبي") {
        existing.court = c.court;
      }
      if (!existing.openDate && c.openDate) existing.openDate = c.openDate;
      if (existing.status === "متداولة" && c.status && c.status !== "متداولة") {
        existing.status = c.status;
      }
      if (!existing.stage && c.stage) existing.stage = c.stage;
      continue;
    }

    if (seenIds.has(c.id)) {
      continue;
    }

    if (!normNum && compKey && compKey.length > 10 && seenCompositeKeys.has(compKey)) {
      continue;
    }

    let finalId = c.id;
    if (!finalId || seenIds.has(finalId)) {
      let maxExisting = 500;
      if (seenIds.size > 0) {
        maxExisting = Math.max(...Array.from(seenIds));
      }
      finalId = Math.max(maxExisting + 1, 501);
    }
    seenIds.add(finalId);
    if (compKey) seenCompositeKeys.add(compKey);

    const item: CaseItem = { ...c, id: finalId };
    if (normNum) {
      seenNumberKeys.set(normNum, item);
    }
    result.push(item);
  }

  return result;
}

export function deduplicateClients(clientList: Client[]): Client[] {
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const result: Client[] = [];

  for (const c of clientList) {
    if (!c) continue;
    const cleanName = String(c.name || "").trim().toLowerCase();
    if (cleanName && seenNames.has(cleanName)) {
      continue;
    }
    if (cleanName) seenNames.add(cleanName);

    let finalId = c.id;
    if (!finalId || seenIds.has(finalId)) {
      let maxExisting = 500;
      if (seenIds.size > 0) {
        maxExisting = Math.max(...Array.from(seenIds));
      }
      finalId = Math.max(maxExisting + 1, 501);
    }
    seenIds.add(finalId);
    result.push({ ...c, id: finalId });
  }

  return result;
}
