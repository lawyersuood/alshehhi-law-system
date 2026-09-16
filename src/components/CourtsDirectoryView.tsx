import React from "react";
import {
  Landmark,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Printer,
  Plus,
  AlertCircle,
  X,
  Search,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  PhoneCall,
  Mail,
  Phone,
  Copy,
  Send,
  MessageSquare,
  Edit2,
  Trash2,
  Lock,
  Clock,
} from "lucide-react";
import { Badge } from "./AuthScreens";
import { CourtContact } from "../domain/types";
import { normalizeArabicSearch, normalizePhoneDigits } from "../domain/utils";

const inputCls =
  "w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all";

export interface CourtsDirectoryViewProps {
  courtContacts: CourtContact[];
  setCourtContacts: React.Dispatch<React.SetStateAction<CourtContact[]>>;
  courtSearchQuery: string;
  setCourtSearchQuery: (v: string) => void;
  courtEmirateFilter: string;
  setCourtEmirateFilter: (v: string) => void;
  courtCategoryFilter: string;
  setCourtCategoryFilter: (v: string) => void;
  courtBranchFilter: string;
  setCourtBranchFilter: (v: string) => void;
  courtContactsFilterCache: React.MutableRefObject<{
    contacts: CourtContact[];
    query: string;
    emirate: string;
    category: string;
    branch: string;
    result: CourtContact[];
  } | null>;
  courtFiltersExpanded: boolean;
  setCourtFiltersExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  courtExcelImportStatus: { message: string; isError?: boolean } | null;
  setCourtExcelImportStatus: (v: { message: string; isError?: boolean } | null) => void;
  downloadCourtContactsTemplate: () => void;
  handleCourtExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  requestDelete: (opts: any) => void;
  logAuditAction: (...args: any[]) => void;
  setReport: (v: any) => void;
  setEditingCourtContact: (c: CourtContact | null) => void;
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setModal: (v: string | null) => void;
  sendWhatsAppMsg: (phone: string, text: string) => void;
  saveStorage: (key: string, value: any) => void;
  seedCourtContacts: CourtContact[];
}

export default function CourtsDirectoryView({
  courtContacts,
  setCourtContacts,
  courtSearchQuery,
  setCourtSearchQuery,
  courtEmirateFilter,
  setCourtEmirateFilter,
  courtCategoryFilter,
  setCourtCategoryFilter,
  courtBranchFilter,
  setCourtBranchFilter,
  courtContactsFilterCache,
  courtFiltersExpanded,
  setCourtFiltersExpanded,
  courtExcelImportStatus,
  setCourtExcelImportStatus,
  downloadCourtContactsTemplate,
  handleCourtExcelUpload,
  requestDelete,
  logAuditAction,
  setReport,
  setEditingCourtContact,
  setForm,
  setModal,
  sendWhatsAppMsg,
  saveStorage,
  seedCourtContacts,
}: CourtsDirectoryViewProps) {
  // دالة مطابقة نوع الدعوى الفرعي والتخصص القضائي
  const matchCourtCategory = (c: CourtContact, category: string) => {
    if (!category || category === "الكل") return true;
    const norm = normalizeArabicSearch(
      `${c.courtName || ""} ${c.department || ""} ${c.titleOrEmployee || ""} ${c.notes || ""}`,
    );
    const deptNorm = normalizeArabicSearch(`${c.department || ""} ${c.titleOrEmployee || ""}`);
    const courtNorm = normalizeArabicSearch(c.courtName || "");

    if (category === "الدوائر القضائية وأمناء السر") {
      return (
        deptNorm.includes("امين سر") ||
        deptNorm.includes("امناء السر") ||
        deptNorm.includes("سكرتير") ||
        deptNorm.includes("محضر الدائر") ||
        deptNorm.includes("دائره") ||
        deptNorm.includes("دوائر") ||
        deptNorm.includes("جلس") ||
        deptNorm.includes("هيئه") ||
        deptNorm.includes("قاضي") ||
        deptNorm.includes("مستشار") ||
        deptNorm.includes("مدني") ||
        deptNorm.includes("تجاري") ||
        deptNorm.includes("عمال") ||
        deptNorm.includes("جزائ") ||
        deptNorm.includes("جناي") ||
        deptNorm.includes("جنح") ||
        deptNorm.includes("شرع") ||
        deptNorm.includes("احوال") ||
        deptNorm.includes("تركات") ||
        deptNorm.includes("استئناف") ||
        deptNorm.includes("تمييز") ||
        deptNorm.includes("نقض")
      );
    }
    if (category === "الدوائر المدنية والتجارية") {
      return (
        (deptNorm.includes("مدني") ||
          deptNorm.includes("تجاري") ||
          deptNorm.includes("محضر الدائر")) &&
        !norm.includes("عقاب") &&
        !norm.includes("سجن")
      );
    }
    if (category === "الدوائر العمالية") {
      return (
        deptNorm.includes("عمال") ||
        courtNorm.includes("محكمه عماليه") ||
        deptNorm.includes("استئناف عمالي")
      );
    }
    if (category === "الدوائر الجزائية والجنائية") {
      return (
        (deptNorm.includes("جزائ") ||
          deptNorm.includes("جناي") ||
          deptNorm.includes("جنح") ||
          deptNorm.includes("مرور")) &&
        !norm.includes("سجن") &&
        !norm.includes("عقاب") &&
        !deptNorm.includes("نياب")
      );
    }
    if (category === "الدوائر الشرعية والأحوال الشخصية") {
      return (
        (deptNorm.includes("شرع") ||
          deptNorm.includes("احوال") ||
          deptNorm.includes("تركات") ||
          courtNorm.includes("الشرعيه") ||
          courtNorm.includes("شرعي") ||
          deptNorm.includes("اسري")) &&
        !norm.includes("سجن")
      );
    }
    if (category === "دوائر الاستئناف والتمييز والنقض") {
      return (
        deptNorm.includes("استئناف") ||
        deptNorm.includes("تمييز") ||
        deptNorm.includes("نقض") ||
        deptNorm.includes("طعون") ||
        courtNorm.includes("محكمه الاستئناف") ||
        courtNorm.includes("محكمه النقض") ||
        courtNorm.includes("محكمه التمييز") ||
        courtNorm.includes("المحكمه الاتحاديه العليا")
      );
    }
    if (category === "إدارة التنفيذ والإنابات") {
      return (
        deptNorm.includes("تنفيذ") ||
        deptNorm.includes("انابات") ||
        deptNorm.includes("حجوزات") ||
        deptNorm.includes("مزادات") ||
        deptNorm.includes("مامور التنفيذ")
      );
    }
    if (category === "قيد وإدارة الدعاوى") {
      return (
        deptNorm.includes("قيد") ||
        deptNorm.includes("اداره دعو") ||
        deptNorm.includes("اداره الدعو") ||
        deptNorm.includes("تسجيل دعاوى") ||
        deptNorm.includes("جدول") ||
        deptNorm.includes("تحضير")
      );
    }
    if (category === "النيابات العامة") {
      return (
        (deptNorm.includes("نياب") || courtNorm.includes("نياب") || norm.includes("امن الدوله")) &&
        !norm.includes("سجن")
      );
    }
    if (category === "التوجيه والإصلاح الأسري") {
      return (
        deptNorm.includes("توجيه اسري") ||
        deptNorm.includes("اصلاح اسري") ||
        deptNorm.includes("مصلح اسري") ||
        deptNorm.includes("استشارات اسريه") ||
        (deptNorm.includes("توجيه") && deptNorm.includes("اسري"))
      );
    }
    if (category === "المنازعات الإيجارية") {
      return (
        norm.includes("ايجار") ||
        norm.includes("rdc") ||
        (courtNorm.includes("بلديه") && norm.includes("منازعات"))
      );
    }
    if (category === "الكاتب العدل والتوثيقات") {
      return (
        deptNorm.includes("كاتب عدل") ||
        deptNorm.includes("توثيق") ||
        deptNorm.includes("ماذون") ||
        deptNorm.includes("اشهار") ||
        deptNorm.includes("عقود زواج")
      );
    }
    if (category === "التوفيق والمصالحة والخبرة") {
      return (
        deptNorm.includes("توفيق") ||
        deptNorm.includes("مصالحه") ||
        deptNorm.includes("خبراء") ||
        deptNorm.includes("تسويات") ||
        deptNorm.includes("امانات الخبره")
      );
    }
    if (category === "المؤسسات العقابية والإصلاحية") {
      return (
        norm.includes("عقاب") ||
        norm.includes("سجن") ||
        norm.includes("توقيف") ||
        norm.includes("منشات عقابيه") ||
        (norm.includes("اصلاح") && !norm.includes("اسري") && !norm.includes("توجيه"))
      );
    }

    return norm.includes(normalizeArabicSearch(category));
  };

  // دالة مطابقة المحكمة الفرعية أو المقر القضائي داخل الإمارة
  const matchCourtBranch = (c: CourtContact, branch: string) => {
    if (!branch || branch === "الكل") return true;
    const norm = normalizeArabicSearch(
      `${c.courtName || ""} ${c.location || ""} ${c.department || ""} ${c.notes || ""}`,
    );
    const courtNorm = normalizeArabicSearch(c.courtName || "");

    // فروع إمارة الشارقة
    if (branch === "الذيد") return norm.includes("ذيد");
    if (branch === "خورفكان") return norm.includes("خورفكان");
    if (branch === "كلباء") return norm.includes("كلباء");
    if (branch === "دبا الحصن") return norm.includes("دبا الحصن") || norm.includes("حصن");
    if (branch === "المدام") return norm.includes("مدام");
    if (branch === "الشارقة الشرعية") return norm.includes("شرعيه") || norm.includes("فلج");
    if (branch === "فض المنازعات الإيجارية بالشارقة")
      return norm.includes("ايجار") || norm.includes("بلديه") || norm.includes("rdc");
    if (branch === "الشارقة الابتدائية") {
      return (
        c.emirate === "الشارقة" &&
        !norm.includes("ذيد") &&
        !norm.includes("خورفكان") &&
        !norm.includes("كلباء") &&
        !norm.includes("حصن") &&
        !norm.includes("مدام") &&
        !norm.includes("شرعيه") &&
        !norm.includes("ايجار") &&
        !norm.includes("عقاب") &&
        !norm.includes("سجن")
      );
    }
    if (branch === "عقابية الشارقة")
      return (
        c.emirate === "الشارقة" &&
        (norm.includes("عقاب") ||
          norm.includes("سجن") ||
          norm.includes("توقيف") ||
          norm.includes("شرطه"))
      );

    // فروع إمارة أبوظبي
    if (branch === "المحكمة الاتحادية العليا") return courtNorm.includes("عليا");
    if (branch === "العين") return norm.includes("عين");
    if (branch === "الظفرة")
      return norm.includes("ظفره") || norm.includes("زايد") || norm.includes("غربيه");
    if (branch === "أبوظبي المركزية") {
      return (
        c.emirate === "أبوظبي" &&
        !courtNorm.includes("عليا") &&
        !norm.includes("عين") &&
        !norm.includes("ظفره") &&
        !norm.includes("عقاب") &&
        !norm.includes("سجن")
      );
    }
    if (branch === "عقابية أبوظبي")
      return (
        c.emirate === "أبوظبي" &&
        (norm.includes("عقاب") || norm.includes("سجن") || norm.includes("وثبه"))
      );

    // فروع إمارة دبي
    if (branch === "حتا") return norm.includes("حتا");
    if (branch === "المحكمة العمالية العوير")
      return (
        (norm.includes("عماليه") && c.emirate === "دبي") ||
        (norm.includes("عوير") && !norm.includes("سجن") && !norm.includes("عقاب"))
      );
    if (branch === "محكمة الأحوال الشخصية القرهود")
      return (norm.includes("احوال") && c.emirate === "دبي") || norm.includes("قرهود");
    if (branch === "مركز فض المنازعات الإيجارية")
      return norm.includes("rdc") || (norm.includes("ايجار") && c.emirate === "دبي");
    if (branch === "مجمع محاكم دبي الرئيسي") {
      return (
        c.emirate === "دبي" &&
        !norm.includes("حتا") &&
        !norm.includes("قرهود") &&
        !norm.includes("عوير") &&
        !norm.includes("rdc") &&
        !norm.includes("عقاب") &&
        !norm.includes("سجن")
      );
    }
    if (branch === "عقابية دبي")
      return (
        c.emirate === "دبي" &&
        (norm.includes("عقاب") ||
          norm.includes("سجن") ||
          norm.includes("توقيف") ||
          norm.includes("نياب"))
      );

    // فروع إمارة الفجيرة
    if (branch === "دبا الفجيرة") return norm.includes("دبا") && !norm.includes("حصن");
    if (branch === "الفجيرة الاتحادية")
      return (
        c.emirate === "الفجيرة" &&
        !norm.includes("دبا") &&
        !norm.includes("عقاب") &&
        !norm.includes("سجن")
      );
    if (branch === "عقابية الفجيرة")
      return c.emirate === "الفجيرة" && (norm.includes("عقاب") || norm.includes("سجن"));

    // فروع إمارة أم القيوين
    if (branch === "فلج المعلا") return norm.includes("معلا");
    if (branch === "أم القيوين الاتحادية")
      return (
        c.emirate === "أم القيوين" &&
        !norm.includes("معلا") &&
        !norm.includes("عقاب") &&
        !norm.includes("سجن")
      );
    if (branch === "عقابية أم القيوين")
      return c.emirate === "أم القيوين" && (norm.includes("عقاب") || norm.includes("سجن"));

    // فروع إمارة عجمان
    if (branch === "عجمان الاتحادية")
      return c.emirate === "عجمان" && !norm.includes("عقاب") && !norm.includes("سجن");
    if (branch === "عقابية ونيابة عجمان")
      return (
        c.emirate === "عجمان" &&
        (norm.includes("عقاب") || norm.includes("سجن") || norm.includes("نياب"))
      );

    // فروع إمارة رأس الخيمة
    if (branch === "محاكم رأس الخيمة المركزية")
      return c.emirate === "رأس الخيمة" && !norm.includes("عقاب") && !norm.includes("سجن");
    if (branch === "عقابية ونيابة رأس الخيمة")
      return (
        c.emirate === "رأس الخيمة" &&
        (norm.includes("عقاب") || norm.includes("سجن") || norm.includes("نياب"))
      );

    return norm.includes(normalizeArabicSearch(branch));
  };

  // فروع المحاكم والمقار القضائية المتاحة حسب الإمارة
  const getBranchesList = (emirate: string) => {
    if (emirate === "الشارقة") {
      return [
        { id: "الكل", name: "جميع مقار ومحاكم الشارقة", icon: "" },
        { id: "الشارقة الابتدائية", name: "محكمة الشارقة الاتحادية الابتدائية (الخان)", icon: "" },
        { id: "الشارقة الشرعية", name: "محكمة الشارقة الشرعية (الفلج)", icon: "" },
        { id: "الذيد", name: "محكمة الذيد الجزئية (المنطقة الوسطى)", icon: "" },
        { id: "خورفكان", name: "محكمة خورفكان الكلية والاستئنافية (الشرقية)", icon: "" },
        { id: "كلباء", name: "محكمة كلباء الجزئية (الشرقية)", icon: "" },
        { id: "دبا الحصن", name: "محكمة دبا الحصن الجزئية (الشرقية)", icon: "" },
        { id: "المدام", name: "محكمة المدام الجزئية (الوسطى)", icon: "" },
        {
          id: "فض المنازعات الإيجارية بالشارقة",
          name: "بلدية الشارقة - لجان فض المنازعات الإيجارية",
          icon: "",
        },
        { id: "عقابية الشارقة", name: "المؤسسة العقابية ومراكز الشرطة بالشارقة", icon: "" },
      ];
    }
    if (emirate === "أبوظبي") {
      return [
        { id: "الكل", name: "جميع مقار ومحاكم أبوظبي", icon: "" },
        { id: "أبوظبي المركزية", name: "محاكم دائرة القضاء المركزية (أبوظبي)", icon: "" },
        { id: "المحكمة الاتحادية العليا", name: "المحكمة الاتحادية العليا", icon: "" },
        { id: "العين", name: "محاكم مدينة العين الابتدائية والاستئنافية", icon: "" },
        { id: "الظفرة", name: "محكمة منطقة الظفرة الابتدائية (مدينة زايد)", icon: "" },
        { id: "عقابية أبوظبي", name: "المنشآت العقابية (الوثبة والعين)", icon: "" },
      ];
    }
    if (emirate === "دبي") {
      return [
        { id: "الكل", name: "جميع مقار ومحاكم دبي", icon: "" },
        { id: "مجمع محاكم دبي الرئيسي", name: "مجمع محاكم دبي الرئيسي (بر دبي)", icon: "" },
        { id: "المحكمة العمالية العوير", name: "المحكمة العمالية (العوير)", icon: "" },
        {
          id: "محكمة الأحوال الشخصية القرهود",
          name: "محكمة الأحوال الشخصية والتركات (القرهود)",
          icon: "",
        },
        { id: "مركز فض المنازعات الإيجارية", name: "مركز فض المنازعات الإيجارية (RDC)", icon: "" },
        { id: "حتا", name: "محكمة حتا الجزئية", icon: "" },
        { id: "عقابية دبي", name: "النيابة العامة والمؤسسة العقابية بدبي", icon: "" },
      ];
    }
    if (emirate === "الفجيرة") {
      return [
        { id: "الكل", name: "جميع محاكم الفجيرة", icon: "" },
        {
          id: "الفجيرة الاتحادية",
          name: "محكمة الفجيرة الاتحادية الابتدائية والاستئنافية",
          icon: "",
        },
        { id: "دبا الفجيرة", name: "محكمة دبا الفجيرة الجزئية", icon: "" },
        { id: "عقابية الفجيرة", name: "المؤسسة العقابية بالفجيرة", icon: "" },
      ];
    }
    if (emirate === "أم القيوين") {
      return [
        { id: "الكل", name: "جميع محاكم أم القيوين", icon: "" },
        { id: "أم القيوين الاتحادية", name: "محكمة أم القيوين الاتحادية", icon: "" },
        { id: "فلج المعلا", name: "محكمة فلج المعلا الجزئية", icon: "" },
        { id: "عقابية أم القيوين", name: "المؤسسة العقابية بأم القيوين", icon: "" },
      ];
    }
    if (emirate === "عجمان") {
      return [
        { id: "الكل", name: "جميع محاكم ومراكز عجمان", icon: "" },
        { id: "عجمان الاتحادية", name: "محكمة عجمان الاتحادية الابتدائية والاستئنافية", icon: "" },
        { id: "عقابية ونيابة عجمان", name: "نيابة عجمان الكلية والمؤسسة العقابية", icon: "" },
      ];
    }
    if (emirate === "رأس الخيمة") {
      return [
        { id: "الكل", name: "جميع محاكم رأس الخيمة", icon: "" },
        {
          id: "محاكم رأس الخيمة المركزية",
          name: "محاكم دائرة محاكم رأس الخيمة المركزية",
          icon: "",
        },
        {
          id: "عقابية ونيابة رأس الخيمة",
          name: "النيابة العامة والمؤسسة العقابية برأس الخيمة",
          icon: "",
        },
      ];
    }

    // عند اختيار "الكل" للإمارات
    return [
      { id: "الكل", name: "جميع المحاكم والمقار الفرعية", icon: "" },
      { id: "الذيد", name: "محكمة الذيد (الشارقة)", icon: "" },
      { id: "خورفكان", name: "محكمة خورفكان (الشارقة)", icon: "" },
      { id: "كلباء", name: "محكمة كلباء (الشارقة)", icon: "" },
      { id: "دبا الحصن", name: "محكمة دبا الحصن (الشارقة)", icon: "" },
      { id: "المدام", name: "محكمة المدام (الشارقة)", icon: "" },
      { id: "الشارقة الشرعية", name: "محكمة الشارقة الشرعية", icon: "" },
      { id: "العين", name: "محاكم مدينة العين (أبوظبي)", icon: "" },
      { id: "الظفرة", name: "محكمة منطقة الظفرة (أبوظبي)", icon: "" },
      { id: "حتا", name: "محكمة حتا (دبي)", icon: "" },
      { id: "دبا الفجيرة", name: "محكمة دبا الفجيرة", icon: "" },
      { id: "فلج المعلا", name: "محكمة فلج المعلا (أم القيوين)", icon: "" },
    ];
  };

  const getCourtContactCircuitBadge = (c: CourtContact) => {
    const norm = normalizeArabicSearch(
      `${c.courtName || ""} ${c.department || ""} ${c.titleOrEmployee || ""} ${c.notes || ""}`,
    );
    const deptNorm = normalizeArabicSearch(`${c.department || ""} ${c.titleOrEmployee || ""}`);
    const courtNorm = normalizeArabicSearch(c.courtName || "");

    if (
      norm.includes("عقاب") ||
      norm.includes("سجن") ||
      norm.includes("توقيف") ||
      norm.includes("منشات عقابيه") ||
      (norm.includes("اصلاح") && !norm.includes("اسري") && !norm.includes("توجيه"))
    ) {
      return {
        label: "مؤسسة عقابية وسجن",
        icon: "",
        bg: "bg-amber-50/80 text-amber-900 border-amber-200",
      };
    }
    if (
      deptNorm.includes("كاتب عدل") ||
      deptNorm.includes("توثيق") ||
      deptNorm.includes("ماذون") ||
      deptNorm.includes("اشهار") ||
      deptNorm.includes("عقود زواج")
    ) {
      return {
        label: "كاتب عدل وتوثيق",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (deptNorm.includes("نياب") || courtNorm.includes("نياب") || norm.includes("امن الدوله")) {
      return {
        label: "نيابة عامة وأمن دولة",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("توجيه اسري") ||
      deptNorm.includes("اصلاح اسري") ||
      deptNorm.includes("مصلح اسري") ||
      deptNorm.includes("استشارات اسريه") ||
      (deptNorm.includes("توجيه") && deptNorm.includes("اسري"))
    ) {
      return {
        label: "توجيه وإصلاح أسري",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      norm.includes("ايجار") ||
      norm.includes("rdc") ||
      (courtNorm.includes("بلديه") && norm.includes("منازعات"))
    ) {
      return {
        label: "فض منازعات إيجارية",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("تنفيذ") ||
      deptNorm.includes("انابات") ||
      deptNorm.includes("حجوزات") ||
      deptNorm.includes("مزادات")
    ) {
      return {
        label: "إدارة تنفيذ وإنابات",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("قيد") ||
      deptNorm.includes("اداره دعو") ||
      deptNorm.includes("اداره الدعو") ||
      deptNorm.includes("تسجيل دعاوى") ||
      deptNorm.includes("جدول") ||
      deptNorm.includes("تحضير")
    ) {
      return {
        label: "قيد وإدارة الدعاوى",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("توفيق") ||
      deptNorm.includes("مصالحه") ||
      deptNorm.includes("خبراء") ||
      deptNorm.includes("تسويات")
    ) {
      return {
        label: "توفيق ومصالحة وخبرة",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("استئناف") ||
      deptNorm.includes("تمييز") ||
      deptNorm.includes("نقض") ||
      deptNorm.includes("طعون") ||
      courtNorm.includes("محكمه الاستئناف") ||
      courtNorm.includes("محكمه النقض") ||
      courtNorm.includes("محكمه التمييز") ||
      courtNorm.includes("المحكمه الاتحاديه العليا")
    ) {
      return {
        label: "دوائر الاستئناف والتمييز والنقض",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("عمال") ||
      courtNorm.includes("محكمه عماليه") ||
      deptNorm.includes("استئناف عمالي")
    ) {
      return {
        label: "دائرة عمالية",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("جزائ") ||
      deptNorm.includes("جناي") ||
      deptNorm.includes("جنح") ||
      deptNorm.includes("مرور")
    ) {
      return {
        label: "دائرة جزائية وجنائية",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("شرع") ||
      deptNorm.includes("احوال") ||
      deptNorm.includes("تركات") ||
      courtNorm.includes("الشرعيه") ||
      courtNorm.includes("شرعي") ||
      deptNorm.includes("اسري")
    ) {
      return {
        label: "دائرة شرعية وأحوال شخصية",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("مدني") ||
      deptNorm.includes("تجاري") ||
      deptNorm.includes("محضر الدائر")
    ) {
      return {
        label: "دائرة مدنية وتجارية",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    if (
      deptNorm.includes("امين سر") ||
      deptNorm.includes("امناء السر") ||
      deptNorm.includes("سكرتير") ||
      deptNorm.includes("دائره") ||
      deptNorm.includes("دوائر") ||
      deptNorm.includes("جلس")
    ) {
      return {
        label: "دائرة قضائية وأمانة سر",
        icon: "",
        bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
      };
    }
    return {
      label: "جهة قضائية ومساندة",
      icon: "",
      bg: "bg-[#0D382B]/[0.05] text-[#0D382B] border-[#0D382B]/15",
    };
  };

  const emiratesList = [
    { id: "الكل", name: "جميع الإمارات", icon: "" },
    { id: "أبوظبي", name: "أبوظبي (والعين والظفرة)", icon: "" },
    { id: "دبي", name: "دبي (وحتا)", icon: "" },
    { id: "الشارقة", name: "الشارقة (والوسطى والشرقية)", icon: "" },
    { id: "عجمان", name: "عجمان", icon: "" },
    { id: "رأس الخيمة", name: "رأس الخيمة", icon: "" },
    { id: "أم القيوين", name: "أم القيوين (وفلج المعلا)", icon: "" },
    { id: "الفجيرة", name: "الفجيرة (ودبا)", icon: "" },
  ];

  const categoryOptions = [
    { id: "الكل", label: "جميع الدوائر والتخصصات", icon: "" },
    { id: "الدوائر القضائية وأمناء السر", label: "الدوائر القضائية وأمناء السر", icon: "" },
    { id: "الدوائر المدنية والتجارية", label: "الدوائر المدنية والتجارية", icon: "" },
    { id: "الدوائر العمالية", label: "الدوائر العمالية", icon: "" },
    { id: "الدوائر الجزائية والجنائية", label: "الدوائر الجزائية والجنائية", icon: "" },
    { id: "الدوائر الشرعية والأحوال الشخصية", label: "الدوائر الشرعية والأحوال الشخصية", icon: "" },
    { id: "دوائر الاستئناف والتمييز والنقض", label: "الاستئناف والتمييز والنقض", icon: "" },
    { id: "قيد وإدارة الدعاوى", label: "قيد وإدارة الدعاوى", icon: "" },
    { id: "إدارة التنفيذ والإنابات", label: "إدارة التنفيذ والإنابات", icon: "" },
    { id: "التوجيه والإصلاح الأسري", label: "التوجيه والإصلاح الأسري", icon: "" },
    { id: "المنازعات الإيجارية", label: "فض المنازعات الإيجارية", icon: "" },
    { id: "الكاتب العدل والتوثيقات", label: "الكاتب العدل والتوثيقات", icon: "" },
    { id: "التوفيق والمصالحة والخبرة", label: "التوفيق والمصالحة والخبراء", icon: "" },
    { id: "النيابات العامة", label: "النيابات العامة وأمن الدولة", icon: "" },
    { id: "المؤسسات العقابية والإصلاحية", label: "المؤسسات العقابية والسجون", icon: "" },
  ];

  const currentBranches = getBranchesList(courtEmirateFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="text-amber-600" /> دليل وسائل التواصل مع المحاكم والجهات القضائية
          </h2>
          <p className="text-xs text-slate-500">
            تصنيف هرمي ثلاثي معتمد: أولاً الإمارة، ثم نوع الدعوى الفرعي والتخصص، ثم المحاكم والمقار
            الفرعية الأخرى في الإمارة (مثل الذيد وخورفكان وكلباء وغيرها)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadCourtContactsTemplate()}
            className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors shadow-sm"
            title="تحميل نموذج ملف إكسل فارغ ومنسق بالأعمدة المعتمدة"
          >
            <Download size={15} /> تنزيل نموذج إكسل
          </button>

          <label className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors cursor-pointer shadow-sm">
            <FileSpreadsheet size={15} className="text-slate-500" />
            <span>استيراد أرقام الجهات من إكسل</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleCourtExcelUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              // إزالة التكرار الفوري والفرز
              const seen = new Set<string>();
              const cleaned = courtContacts.filter((c) => {
                const normName = normalizeArabicSearch(c.courtName);
                const normDept = normalizeArabicSearch(c.department);
                const normPerson = normalizeArabicSearch(c.titleOrEmployee);
                const digits = normalizePhoneDigits(c.phone);
                const key = `${normName}|${normDept}|${normPerson}|${digits}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
              const diff = courtContacts.length - cleaned.length;
              setCourtContacts(cleaned);
              saveStorage("firm_court_contacts", cleaned);
              saveStorage("firm_court_contacts_ver", "v5_hierarchy");
              alert(
                `تم فحص الدليل وإزالة ${diff > 0 ? `${diff} سجل مكرر` : "أي سجلات مكررة (الدليل نظيف 100%)"} بنجاح!`,
              );
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors shadow-sm"
            title="فحص فوري وحذف أي سجلات مكررة"
          >
            <CheckCircle2 size={15} className="text-slate-500" /> تنظيف وإزالة التكرار
          </button>

          <button
            onClick={() => {
              requestDelete({
                section: "دليل المحاكم والجهات القضائية",
                title: "استعادة الدليل النموذجي الشامل",
                details: `سيتم مسح التعديلات واستعادة كافة أرقام هواتف وتمديدات محاكم الدولة والشارقة الشرعية والذيد وخورفكان (${seedCourtContacts.length} جهة اتصال معتمدة).`,
                permKey: "deleteContacts",
                actionName: "استعادة الدليل الأصلي المحدث",
                onConfirm: () => {
                  setCourtContacts(seedCourtContacts);
                  saveStorage("firm_court_contacts", seedCourtContacts);
                  saveStorage("firm_court_contacts_ver", "v5_hierarchy");
                  logAuditAction(
                    "UPDATE",
                    "دليل المحاكم والجهات القضائية",
                    "استعادة الدليل النموذجي",
                    `استعادة وتحديث الدليل النموذجي لجميع محاكم الدولة بإجمالي ${seedCourtContacts.length} جهة اتصال.`,
                  );
                },
              });
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.08] transition-colors shadow-sm transition"
            title="استعادة الدليل النموذجي المعتمد بجميع الأرقام والتمديدات"
          >
            <RotateCcw size={15} /> استعادة الدليل النموذجي
          </button>

          <button
            onClick={() => {
              setReport({ type: "court-directory" });
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.08] transition-colors shadow-sm transition"
          >
            <Printer size={15} /> طباعة / تصدير PDF
          </button>

          <button
            onClick={() => {
              setEditingCourtContact(null);
              setForm({
                emirate: courtEmirateFilter !== "الكل" ? courtEmirateFilter : "دبي",
                operatingHours: "07:30 ص – 02:30 م",
              });
              setModal("courtContact");
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#0D382B] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> إضافة جهة اتصال جديدة
          </button>
        </div>
      </div>

      {courtExcelImportStatus && courtExcelImportStatus.isError && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{courtExcelImportStatus.message}</span>
          </div>
          <button
            onClick={() => setCourtExcelImportStatus(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* إحصائيات سريعة للدليل */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">إجمالي جهات الاتصال</p>
            <p className="text-2xl font-bold text-slate-900">{courtContacts.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Landmark size={20} />
          </div>
        </div>
        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">الإمارات ومناطق الدولة</p>
            <p className="text-2xl font-bold text-slate-900">
              {new Set(courtContacts.map((c) => c.emirate)).size} إمارات
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <MapPin size={20} />
          </div>
        </div>
        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">خطوط وتمديدات مباشرة</p>
            <p className="text-2xl font-bold text-slate-900">
              {courtContacts.filter((c) => c.phone || c.extOrSeal).length}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PhoneCall size={20} />
          </div>
        </div>
        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">عناوين البريد المعتمدة</p>
            <p className="text-2xl font-bold text-slate-900">
              {courtContacts.filter((c) => c.email).length}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Mail size={20} />
          </div>
        </div>
      </div>

      {/* ================= صندوق التصنيف الهرمي الثلاثي والبحث الذكي المطور ================= */}
      <div className="app-card p-5 space-y-4">
        {/* شريط البحث الذكي المطور */}
        <div className="relative">
          <Search size={18} className="absolute right-3.5 top-3 text-slate-400" />
          <input
            value={courtSearchQuery}
            onChange={(e) => setCourtSearchQuery(e.target.value)}
            placeholder="بحث فوري فائق الدقة: بالاسم، الإمارة، المحكمة (مثلاً الذيد، خورفكان، الفلج)، القسم، الموظف، التمديدة، رقم الهاتف، الإيميل..."
            className={`${inputCls} pr-10 pl-10 text-sm font-medium`}
          />
          {courtSearchQuery && (
            <button
              onClick={() => setCourtSearchQuery("")}
              className="absolute left-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors transition"
              title="مسح نص البحث"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* زر إظهار/إخفاء الفلاتر الهرمية المتقدمة - مغلقة افتراضياً لواجهة أنظف، وتُفتح عند الحاجة فقط */}
        <button
          type="button"
          onClick={() => setCourtFiltersExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#0D382B]/[0.05] transition-colors cursor-pointer"
        >
          <span className="text-xs font-bold text-[#0D382B] flex items-center gap-1.5">
            <SlidersHorizontal size={14} />
            فلاتر متقدمة (الإمارة، نوع الدعوى، المحكمة الفرعية)
            {(courtEmirateFilter !== "الكل" ||
              courtCategoryFilter !== "الكل" ||
              courtBranchFilter !== "الكل") && (
              <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[#0D382B] text-white text-[10px] font-mono">
                {
                  [
                    courtEmirateFilter !== "الكل",
                    courtCategoryFilter !== "الكل",
                    courtBranchFilter !== "الكل",
                  ].filter(Boolean).length
                }
              </span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform ${courtFiltersExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {courtFiltersExpanded && (
          <>
            {/* المستوى الأول: تصنيف الإمارة (Emirate) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[11px] font-mono">
                    1
                  </span>
                  <span>أولاً: اختر الإمارة</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  الإمارة المحددة:{" "}
                  <strong className="text-slate-900">
                    {courtEmirateFilter === "الكل"
                      ? "جميع الإمارات"
                      : `إمارة ${courtEmirateFilter}`}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
                {emiratesList.map((em) => {
                  const count =
                    em.id === "الكل"
                      ? courtContacts.length
                      : courtContacts.filter((c) => c.emirate === em.id).length;
                  const isSelected = courtEmirateFilter === em.id;
                  return (
                    <button
                      key={em.id}
                      onClick={() => {
                        setCourtEmirateFilter(em.id);
                        setCourtBranchFilter("الكل"); // إعادة ضبط الفرع عند تغيير الإمارة
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1 border text-center cursor-pointer ${
                        isSelected
                          ? "bg-[#0D382B] text-white border-[#0D382B] shadow-[0_6px_14px_-6px_rgb(13,56,43,0.5)]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-[#0D382B]/[0.06] hover:border-[#0D382B]/20"
                      }`}
                    >
                      <span className="leading-tight truncate w-full">
                        {em.id === "الكل" ? "جميع الإمارات" : em.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? "bg-[#C5A059] text-[#0D382B] font-bold" : "bg-slate-200 text-slate-600"}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* المستوى الثاني: نوع الدعوى الفرعي والتخصص القضائي (Sub-Case Category) */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[11px] font-mono">
                    2
                  </span>
                  <span>ثانياً: اختر نوع الدعوى الفرعي / الدائرة والتخصص</span>
                </span>

                {/* قائمة منسدلة سريعة للتصنيفات */}
                <select
                  value={courtCategoryFilter}
                  onChange={(e) => setCourtCategoryFilter(e.target.value)}
                  className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 cursor-pointer"
                >
                  <option value="الكل">جميع أنواع الدعاوى والتخصصات (الكل)</option>
                  {categoryOptions
                    .filter((o) => o.id !== "الكل")
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.icon} {opt.label} (
                        {
                          courtContacts.filter(
                            (c) =>
                              (courtEmirateFilter === "الكل" || c.emirate === courtEmirateFilter) &&
                              matchCourtCategory(c, opt.id),
                          ).length
                        }
                        )
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {categoryOptions.map((cat) => {
                  const isSelected = courtCategoryFilter === cat.id;
                  const count = courtContacts.filter((c) => {
                    const matchEm =
                      courtEmirateFilter === "الكل" || c.emirate === courtEmirateFilter;
                    const matchCat = matchCourtCategory(c, cat.id);
                    return matchEm && matchCat;
                  }).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCourtCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? "bg-[#0D382B] text-white border-[#0D382B] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-[#0D382B]/[0.06] hover:border-slate-300"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white font-bold" : "bg-slate-200/80 text-slate-600"}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* المستوى الثالث: المحاكم والمقار الأخرى داخل الإمارة (Other Courts & Specific Branches) */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 bg-[#0D382B]/[0.035] p-3 rounded-xl border border-[#0D382B]/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0D382B] flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D382B] text-[#C5A059] text-[11px] font-mono">
                    3
                  </span>
                  <span>
                    ثالثاً: المحاكم والمقار الفرعية في{" "}
                    {courtEmirateFilter === "الكل" ? "الدولة" : `إمارة ${courtEmirateFilter}`} (مثل
                    الذيد، خورفكان، كلباء، الشرعية وغيرها):
                  </span>
                </span>
                {courtBranchFilter !== "الكل" && (
                  <button
                    onClick={() => setCourtBranchFilter("الكل")}
                    className="text-[11px] font-bold text-[#0D382B]/80 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} /> عرض كافة مقار الإمارة
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {currentBranches.map((branch) => {
                  const isSelected = courtBranchFilter === branch.id;
                  const count = courtContacts.filter((c) => {
                    const matchEm =
                      courtEmirateFilter === "الكل" || c.emirate === courtEmirateFilter;
                    const matchCat = matchCourtCategory(c, courtCategoryFilter);
                    const matchBr = matchCourtBranch(c, branch.id);
                    return matchEm && matchCat && matchBr;
                  }).length;

                  return (
                    <button
                      key={branch.id}
                      onClick={() => setCourtBranchFilter(branch.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? "bg-[#0D382B] text-white border-[#0D382B] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-[#0D382B]/[0.06] hover:border-[#0D382B]/20"
                      }`}
                    >
                      <span>{branch.name}</span>
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white font-bold" : "bg-slate-200/80 text-slate-600 font-bold"}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* قائمة بطاقات وسائل التواصل التفصيلية للمحاكم مع تطبيق التصنيف الهرمي والبحث الذكي المطور */}
      {(() => {
        const cache = courtContactsFilterCache.current;
        const cacheHit = !!(
          cache &&
          cache.contacts === courtContacts &&
          cache.query === courtSearchQuery &&
          cache.emirate === courtEmirateFilter &&
          cache.category === courtCategoryFilter &&
          cache.branch === courtBranchFilter
        );
        const queryNorm = normalizeArabicSearch(courtSearchQuery);
        const queryDigits = normalizePhoneDigits(courtSearchQuery);
        const searchTokens = queryNorm ? queryNorm.split(/\s+/).filter(Boolean) : [];

        const filteredContacts = cacheHit
          ? cache!.result
          : courtContacts.filter((c) => {
              // 1. فحص البحث الذكي متعدد الكلمات والتشكيل والأرقام المباشرة
              let matchQ = true;
              if (searchTokens.length > 0) {
                const fullNormalizedText = normalizeArabicSearch(
                  `${c.courtName || ""} ${c.emirate || ""} ${c.department || ""} ${c.titleOrEmployee || ""} ${c.extOrSeal || ""} ${c.location || ""} ${c.notes || ""} ${c.email || ""}`,
                );
                const phoneDigits = normalizePhoneDigits(c.phone);

                // التحقق من تطابق كل كلمة في نص البحث
                matchQ = searchTokens.every((token) => {
                  // تطابق نصي مباشر
                  if (fullNormalizedText.includes(token)) return true;
                  // تطابق بالبريد أو الإنجليزية
                  if (c.email && c.email.toLowerCase().includes(token)) return true;
                  // تطابق برقم الهاتف إذا كان الرمز يحتوي أرقاماً
                  const tokenDigits = normalizePhoneDigits(token);
                  if (tokenDigits && phoneDigits && phoneDigits.includes(tokenDigits)) return true;
                  return false;
                });

                // مطابقة خاصة بالأرقام الهاتفية المباشرة
                if (!matchQ && queryDigits && phoneDigits && phoneDigits.includes(queryDigits)) {
                  matchQ = true;
                }
              }

              // 2. المستوى الأول: فحص الإمارة
              const matchEmirate =
                courtEmirateFilter === "الكل" || c.emirate === courtEmirateFilter;

              // 3. المستوى الثاني: فحص نوع الدعوى الفرعي والتخصص
              const matchCategory = matchCourtCategory(c, courtCategoryFilter);

              // 4. المستوى الثالث: فحص المحكمة الفرعية أو المقر
              const matchBranch = matchCourtBranch(c, courtBranchFilter);

              return matchQ && matchEmirate && matchCategory && matchBranch;
            });
        if (!cacheHit) {
          courtContactsFilterCache.current = {
            contacts: courtContacts,
            query: courtSearchQuery,
            emirate: courtEmirateFilter,
            category: courtCategoryFilter,
            branch: courtBranchFilter,
            result: filteredContacts,
          };
        }

        const hasActiveFilters =
          courtSearchQuery !== "" ||
          courtEmirateFilter !== "الكل" ||
          courtCategoryFilter !== "الكل" ||
          courtBranchFilter !== "الكل";

        return (
          <div className="space-y-4">
            {/* شريط مسار الفلاتر والتصفية الهرمية (Breadcrumbs) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  تم العثور على{" "}
                  <strong className="text-[#0D382B] font-bold">{filteredContacts.length}</strong> من
                  أصل <strong className="text-slate-800">{courtContacts.length}</strong> جهة اتصال
                </span>

                {/* مسار المستوى 1: الإمارة */}
                {courtEmirateFilter !== "الكل" && (
                  <span className="inline-flex items-center gap-1 bg-[#0D382B]/[0.06] text-[#0D382B] border border-[#0D382B]/15 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    إمارة: {courtEmirateFilter}
                    <button
                      onClick={() => {
                        setCourtEmirateFilter("الكل");
                        setCourtBranchFilter("الكل");
                      }}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* مسار المستوى 2: نوع الدعوى */}
                {courtCategoryFilter !== "الكل" && (
                  <span className="inline-flex items-center gap-1 bg-[#0D382B]/[0.06] text-[#0D382B] border border-[#0D382B]/15 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    نوع الدعوى/الدائرة: {courtCategoryFilter}
                    <button
                      onClick={() => setCourtCategoryFilter("الكل")}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* مسار المستوى 3: المحكمة الفرعية */}
                {courtBranchFilter !== "الكل" && (
                  <span className="inline-flex items-center gap-1 bg-[#0D382B]/[0.06] text-[#0D382B] border border-[#0D382B]/15 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    المحكمة/المقر:{" "}
                    {currentBranches.find((b) => b.id === courtBranchFilter)?.name ||
                      courtBranchFilter}
                    <button
                      onClick={() => setCourtBranchFilter("الكل")}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* مسار البحث النصي */}
                {courtSearchQuery && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    البحث: "{courtSearchQuery}"
                    <button
                      onClick={() => setCourtSearchQuery("")}
                      className="hover:text-slate-950"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setCourtSearchQuery("");
                    setCourtEmirateFilter("الكل");
                    setCourtCategoryFilter("الكل");
                    setCourtBranchFilter("الكل");
                  }}
                  className="text-xs font-bold text-[#0D382B] hover:opacity-70 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                >
                  <RotateCcw size={12} /> إعادة تعيين كافة مستويات التصفية
                </button>
              )}
            </div>

            {filteredContacts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-sm">
                <div className="h-14 w-14 rounded-2xl bg-[#0D382B]/[0.06] text-[#0D382B] flex items-center justify-center mx-auto">
                  <Search size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  لم يتم العثور على نتائج تطابق معايير التصنيف والبحث
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  جرب تغيير نوع الدعوى الفرعي أو اختيار إمارة أخرى أو مسح بعض كلمات البحث.
                </p>
                <button
                  onClick={() => {
                    setCourtSearchQuery("");
                    setCourtEmirateFilter("الكل");
                    setCourtCategoryFilter("الكل");
                    setCourtBranchFilter("الكل");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  <RotateCcw size={14} /> مسح التصفية وعرض جميع جهات الاتصال
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredContacts.map((c) => {
                  const circuitBadge = getCourtContactCircuitBadge(c);
                  const isPenalRecord =
                    circuitBadge.label.includes("عقابية") || circuitBadge.label.includes("سجن");

                  return (
                    <div
                      key={c.id}
                      className={`rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 ${
                        isPenalRecord ? "border-rose-200 ring-1 ring-rose-100" : "border-slate-200"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* الرأس: اسم المحكمة والإمارة مع وسم التصنيف الدقيق */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                                {isPenalRecord ? (
                                  <Lock size={18} className="text-rose-600 shrink-0" />
                                ) : (
                                  <Landmark size={18} className="text-[#0D382B]/70 shrink-0" />
                                )}
                                <span>{c.courtName}</span>
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${circuitBadge.bg}`}
                              >
                                <span>{circuitBadge.label}</span>
                              </span>
                              <p className="text-xs font-semibold text-slate-600">{c.department}</p>
                            </div>
                          </div>
                          <Badge className="bg-[#0D382B] text-white shrink-0 font-bold">
                            {c.emirate}
                          </Badge>
                        </div>

                        {/* الموظف والصفة الوظيفية */}
                        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs text-slate-800 font-medium">
                          <span className="text-slate-500 block text-[11px]">
                            👤 الموظف / المسؤول / الدائرة:
                          </span>
                          <span className="font-bold text-slate-900">{c.titleOrEmployee}</span>
                        </div>

                        {/* رقم الخاتم والتمديدة المباشرة */}
                        {c.extOrSeal && (
                          <div className="bg-amber-500/10 border border-amber-300 p-2.5 rounded-xl text-xs text-amber-950 font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-amber-900">
                              <span className="text-base">🏷️</span>
                              <span>رقم الخاتم والتمديدة / الشباك:</span>
                            </span>
                            <span className="font-bold text-amber-900 font-mono bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
                              {c.extOrSeal}
                            </span>
                          </div>
                        )}

                        {/* الهاتف والبريد والمقر */}
                        <div className="space-y-2 text-xs text-slate-700 pt-1">
                          {c.phone && (
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-emerald-600 shrink-0" />
                                <span className="font-bold font-mono text-slate-900" dir="ltr">
                                  {c.phone}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(c.phone);
                                    alert(`تم نسخ رقم الهاتف (${c.phone}) بنجاح!`);
                                  }}
                                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded cursor-pointer"
                                  title="نسخ رقم الهاتف"
                                >
                                  <Copy size={13} />
                                </button>
                                <a
                                  href={`tel:${c.phone}`}
                                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                  title="اتصال مباشر"
                                >
                                  <PhoneCall size={13} />
                                </a>
                              </div>
                            </div>
                          )}

                          {c.email && (
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-2 truncate max-w-[80%]">
                                <Mail size={14} className="text-sky-600 shrink-0" />
                                <span className="font-mono text-slate-800 truncate" dir="ltr">
                                  {c.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(c.email);
                                    alert(`تم نسخ البريد الإلكتروني (${c.email}) بنجاح!`);
                                  }}
                                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded cursor-pointer"
                                  title="نسخ الإيميل"
                                >
                                  <Copy size={13} />
                                </button>
                                <a
                                  href={`mailto:${c.email}?subject=استفسار قانوني — مكتب سعود أحمد الشحي للمحاماة`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-sky-600 hover:bg-sky-100 rounded"
                                  title="إرسال رسالة بريدية"
                                >
                                  <Send size={13} />
                                </a>
                              </div>
                            </div>
                          )}

                          {c.operatingHours && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock size={14} className="text-amber-600 shrink-0" />
                              <span>
                                مواعيد الاستقبال: <b>{c.operatingHours}</b>
                              </span>
                            </div>
                          )}

                          {c.location && (
                            <div className="flex items-start gap-2 text-slate-600">
                              <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                              <span>المقر: {c.location}</span>
                            </div>
                          )}

                          {c.notes && (
                            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] text-slate-600 mt-2">
                              <span className="font-bold text-slate-800 block mb-0.5">
                                📝 ملاحظات وتحويل المذكرات:
                              </span>
                              <span>{c.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* شريط الإجراءات والنسخ الشامل */}
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-1 text-xs">
                        <button
                          onClick={() => {
                            const fullCard = `📌 ${c.courtName} - ${c.emirate}\n🏢 القسم: ${c.department}\n👤 المسؤول: ${c.titleOrEmployee}\n🏷️ الخاتم والتمديدة: ${c.extOrSeal}\n📞 الهاتف: ${c.phone}\n✉️ البريد: ${c.email}\n🕒 مواعيد العمل: ${c.operatingHours}\n📍 الموقع: ${c.location}\n📝 ملاحظات: ${c.notes}`;
                            navigator.clipboard.writeText(fullCard);
                            alert("تم نسخ بطاقة التواصل المباشر بالكامل لسهولة الإرسال والمشاركة!");
                          }}
                          className="flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 font-bold cursor-pointer"
                        >
                          <Copy size={13} /> نسخ البطاقة
                        </button>

                        <div className="flex items-center gap-1">
                          {c.phone && (
                            <button
                              onClick={() => {
                                const msg = `السلام عليكم، استفسار بخصوص التواصل مع ${c.courtName} - ${c.department} (${c.titleOrEmployee})`;
                                sendWhatsAppMsg(c.phone, msg);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="مراسلة وتصدير عبر الواتساب"
                            >
                              <MessageSquare size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingCourtContact(c);
                              setForm({ ...c });
                              setModal("courtContact");
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-[#0D382B]/[0.06] transition-colors rounded-lg cursor-pointer"
                            title="تعديل بيانات التواصل"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              requestDelete({
                                section: "دليل المحاكم والجهات القضائية",
                                title: `${c.courtName} - ${c.department}`,
                                details: `الإمارة: ${c.emirate} | المسؤول: ${c.titleOrEmployee || "غير محدد"} | الهاتف: ${c.phone || "—"}`,
                                permKey: "deleteContacts",
                                actionName: "حذف جهة الاتصال",
                                onConfirm: () => {
                                  logAuditAction(
                                    "DELETE",
                                    "دليل المحاكم والجهات القضائية",
                                    `جهة اتصال: ${c.courtName} - ${c.department}`,
                                    `حذف جهة الاتصال بالمحكمة (${c.courtName} - ${c.department} - إمارة ${c.emirate}) للمسؤول ${c.titleOrEmployee}.`,
                                    c.id,
                                    "مؤكد",
                                  );
                                  setCourtContacts((prev) =>
                                    prev.filter((item) => item.id !== c.id),
                                  );
                                },
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="حذف السجل"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
