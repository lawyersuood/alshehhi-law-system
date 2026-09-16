import React from "react";
import {
  Hash,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Sparkles,
  FileSpreadsheet,
  Plus,
  Layers,
  MapPin,
  User,
  Users,
  CalendarDays,
  ArrowUpDown,
  Building2,
  Search,
  RotateCcw,
  X,
  CheckCircle2,
  Scale,
  Edit2,
  Trash2,
} from "lucide-react";
import { Badge } from "./AuthScreens";
import { CaseItem, Client, RolePermissions } from "../domain/types";
import { CASE_STAGES, CASE_STATUS, CASE_TYPES } from "../domain/constants";
import {
  statusColor,
  stageBadgeColor,
  getCaseStage,
  caseOpponentsLabel,
  caseTypeBadgeColor,
  caseTypeDotColor,
} from "../domain/utils";

export interface CaseStatsBreakdown {
  statusMap: Record<string, number>;
  stageMap: Record<string, number>;
  stageStatusMap: Record<string, { total: number; ongoing: number; finished: number }>;
  emirateMap: Record<string, number>;
  clientTypeMap: Record<string, number>;
  typeMap: Record<string, number>;
}

export interface CasesListViewProps {
  filteredCases: CaseItem[];
  cases: CaseItem[];
  showCaseStatsOnDemand: boolean;
  setShowCaseStatsOnDemand: (v: boolean | ((prev: boolean) => boolean)) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (v: boolean | ((prev: boolean) => boolean)) => void;
  activeFiltersCount: number;
  handleDeduplicateCasesManual: () => void;
  setShowCasesExcelModal: (v: boolean) => void;
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  caseFilter: string;
  setCaseFilter: (v: string) => void;
  caseStageFilter: string;
  setCaseStageFilter: (v: string) => void;
  caseStatsBreakdown: CaseStatsBreakdown;
  caseClientTypeFilter: string;
  setCaseClientTypeFilter: (v: string) => void;
  caseTypeFilter: string;
  setCaseTypeFilter: (v: string) => void;
  resetAllCaseFilters: () => void;
  uniqueCaseTypes: string[];
  uniqueEmirates: string[];
  caseEmirateFilter: string;
  setCaseEmirateFilter: (v: string) => void;
  caseClientFilter: string;
  setCaseClientFilter: (v: string) => void;
  uniqueCaseClients: Client[];
  caseYearFilter: string;
  setCaseYearFilter: (v: string) => void;
  uniqueCaseYears: string[];
  caseSortBy: "default" | "newest" | "oldest" | "number" | "client" | "court";
  setCaseSortBy: (v: "default" | "newest" | "oldest" | "number" | "client" | "court") => void;
  caseCourtFilter: string;
  setCaseCourtFilter: (v: string) => void;
  uniqueCourts: string[];
  q: string;
  setQ: (v: string) => void;
  caseJudgeFilter: string;
  setCaseJudgeFilter: (v: string) => void;
  uniqueJudges: string[];
  clientName: (id: number) => string;
  setCaseView: (id: number | null) => void;
  setEditingCase: (c: CaseItem | null) => void;
  setForm: (v: Record<string, any>) => void;
  setModal: (v: string | null) => void;
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
    actionType:
      | "DELETE"
      | "UPDATE"
      | "CREATE"
      | "STATUS_CHANGE"
      | "PERMISSION_CHANGE"
      | "UNAUTHORIZED_DELETE"
      | "UNAUTHORIZED_ACCESS",
    targetModule: string,
    targetTitle: string,
    details: string,
    targetId?: string | number,
    statusOverride?: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل",
    userOverride?: {
      id?: string | number;
      name?: string;
      email?: string;
      roleTitle?: string;
      jobTitle?: string;
    },
  ) => void;
  setCases: React.Dispatch<React.SetStateAction<CaseItem[]>>;
}

export default function CasesListView({
  filteredCases,
  cases,
  showCaseStatsOnDemand,
  setShowCaseStatsOnDemand,
  showAdvancedFilters,
  setShowAdvancedFilters,
  activeFiltersCount,
  handleDeduplicateCasesManual,
  setShowCasesExcelModal,
  openModalWithCheck,
  caseFilter,
  setCaseFilter,
  caseStageFilter,
  setCaseStageFilter,
  caseStatsBreakdown,
  caseClientTypeFilter,
  setCaseClientTypeFilter,
  caseTypeFilter,
  setCaseTypeFilter,
  resetAllCaseFilters,
  uniqueCaseTypes,
  uniqueEmirates,
  caseEmirateFilter,
  setCaseEmirateFilter,
  caseClientFilter,
  setCaseClientFilter,
  uniqueCaseClients,
  caseYearFilter,
  setCaseYearFilter,
  uniqueCaseYears,
  caseSortBy,
  setCaseSortBy,
  caseCourtFilter,
  setCaseCourtFilter,
  uniqueCourts,
  q,
  setQ,
  caseJudgeFilter,
  setCaseJudgeFilter,
  uniqueJudges,
  clientName,
  setCaseView,
  setEditingCase,
  setForm,
  setModal,
  requestDelete,
  logAuditAction,
  setCases,
}: CasesListViewProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold">إدارة القضايا والرول</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-xs font-black">
              <Hash size={13} /> {filteredCases.length} قضية
            </span>
          </div>
          <p className="text-xs text-slate-500">
            قيد ومتابعة ملفات القضايا وتوزيعها حسب المحاكم والدوائر والقضاة مع محرك فلترة متقدم
            وإحصاء فوري
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* زر إظهار / إخفاء عدد وإحصائيات القضايا عند الطلب */}
          <button
            onClick={() => setShowCaseStatsOnDemand(!showCaseStatsOnDemand)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold border transition shadow-xs ${
              showCaseStatsOnDemand
                ? "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300"
                : "bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:border-amber-400"
            }`}
            title="إظهار أو إخفاء بطاقات الإحصاء وتحليل الأعداد"
          >
            {showCaseStatsOnDemand ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>
              {showCaseStatsOnDemand ? "إخفاء إحصائيات الأعداد" : "إظهار أعداد وإحصائيات القضايا"}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${showCaseStatsOnDemand ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"}`}
            >
              {filteredCases.length}
            </span>
          </button>

          {/* زر الفلترة المتقدمة */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold border transition shadow-xs ${
              showAdvancedFilters
                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
            }`}
            title="فتح / إغلاق محرك الفلترة المتقدمة"
          >
            <SlidersHorizontal size={16} />
            <span>فلتر متقدم</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* زر فحص وتدقيق التكرارات */}
          <button
            onClick={handleDeduplicateCasesManual}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition"
            title="فحص شامل وتدقيق فوري لمنع وإزالة أي قضايا مكررة"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>تدقيق التكرار</span>
          </button>

          <button
            onClick={() => setShowCasesExcelModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 shadow-sm transition"
          >
            <FileSpreadsheet size={16} /> رفع ملف Excel
          </button>

          <button
            onClick={() => openModalWithCheck("case", "manageCases")}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> قضية جديدة
          </button>
        </div>
      </div>

      {/* ===== لوحة إظهار عدد وإحصائيات القضايا عند الطلب ===== */}
      {showCaseStatsOnDemand && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/90 via-white to-stone-50 p-4 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                <Hash size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  لوحة تفصيل أعداد القضايا والإحصاء الفوري (عند الطلب)
                </h3>
                <p className="text-xs text-slate-500">
                  انقر على أي بطاقة أو تصنيف لتطبيق الفلترة السريعة مباشرة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-amber-100/90 border border-amber-300 px-3 py-1.5 rounded-xl">
                إجمالي السجلات:{" "}
                <strong className="text-amber-950 text-sm font-black">
                  {filteredCases.length}
                </strong>{" "}
                / {cases.length} قضية
              </span>
              <button
                onClick={() => setShowCaseStatsOnDemand(false)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-amber-100 transition"
                title="إخفاء لوحة الأعداد"
              >
                <EyeOff size={14} /> إخفاء
              </button>
            </div>
          </div>

          {/* بطاقات الإحصاءات السريعة لحالة القضايا ومراحل التقاضي */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
            <div
              onClick={() => {
                setCaseFilter("الكل");
                setCaseStageFilter("الكل");
              }}
              className={`cursor-pointer rounded-xl p-3 border transition ${
                caseFilter === "الكل" && caseStageFilter === "الكل"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400"
                  : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <p className="text-[11px] font-bold opacity-80">إجمالي القضايا</p>
              <p className="text-2xl font-black mt-0.5">{cases.length}</p>
              <span className="text-[10px] opacity-70">100% من السجلات</span>
            </div>

            <div
              onClick={() => setCaseFilter(caseFilter === "متداولة" ? "الكل" : "متداولة")}
              className={`cursor-pointer rounded-xl p-3 border transition ${
                caseFilter === "متداولة"
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400"
                  : "bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40"
              }`}
            >
              <p
                className={`text-[11px] font-bold ${caseFilter === "متداولة" ? "text-white" : "text-emerald-800"}`}
              >
                قضايا متداولة
              </p>
              <p
                className={`text-2xl font-black mt-0.5 ${caseFilter === "متداولة" ? "text-white" : "text-emerald-950"}`}
              >
                {caseStatsBreakdown.statusMap["متداولة"] || 0}
              </p>
              <span
                className={`text-[10px] font-semibold ${caseFilter === "متداولة" ? "text-emerald-100" : "text-emerald-700"}`}
              >
                جلسات نشطة
              </span>
            </div>

            <div
              onClick={() => setCaseFilter(caseFilter === "منتهية" ? "الكل" : "منتهية")}
              className={`cursor-pointer rounded-xl p-3 border transition ${
                caseFilter === "منتهية"
                  ? "bg-stone-700 text-white border-stone-700 shadow-md ring-2 ring-stone-400"
                  : "bg-white border-slate-200 hover:border-stone-400 hover:bg-stone-50"
              }`}
            >
              <p
                className={`text-[11px] font-bold ${caseFilter === "منتهية" ? "text-white" : "text-stone-800"}`}
              >
                قضايا منتهية
              </p>
              <p
                className={`text-2xl font-black mt-0.5 ${caseFilter === "منتهية" ? "text-white" : "text-stone-950"}`}
              >
                {caseStatsBreakdown.statusMap["منتهية"] || 0}
              </p>
              <span
                className={`text-[10px] font-semibold ${caseFilter === "منتهية" ? "text-stone-100" : "text-stone-600"}`}
              >
                ملفات محسومة ومغلقة
              </span>
            </div>

            <div
              onClick={() => setCaseFilter(caseFilter === "محكومة" ? "الكل" : "محكومة")}
              className={`cursor-pointer rounded-xl p-3 border transition ${
                caseFilter === "محكومة"
                  ? "bg-purple-700 text-white border-purple-700 shadow-md ring-2 ring-purple-400"
                  : "bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50/40"
              }`}
            >
              <p
                className={`text-[11px] font-bold ${caseFilter === "محكومة" ? "text-white" : "text-purple-800"}`}
              >
                قضايا محكومة
              </p>
              <p
                className={`text-2xl font-black mt-0.5 ${caseFilter === "محكومة" ? "text-white" : "text-purple-950"}`}
              >
                {caseStatsBreakdown.statusMap["محكومة"] || 0}
              </p>
              <span
                className={`text-[10px] font-semibold ${caseFilter === "محكومة" ? "text-purple-100" : "text-purple-700"}`}
              >
                أحكام صدرت
              </span>
            </div>

            <div
              onClick={() => setCaseFilter(caseFilter === "قيد النظر" ? "الكل" : "قيد النظر")}
              className={`cursor-pointer rounded-xl p-3 border transition ${
                caseFilter === "قيد النظر"
                  ? "bg-amber-700 text-white border-amber-700 shadow-md ring-2 ring-amber-400"
                  : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/40"
              }`}
            >
              <p
                className={`text-[11px] font-bold ${caseFilter === "قيد النظر" ? "text-white" : "text-amber-800"}`}
              >
                قيد النظر
              </p>
              <p
                className={`text-2xl font-black mt-0.5 ${caseFilter === "قيد النظر" ? "text-white" : "text-amber-950"}`}
              >
                {caseStatsBreakdown.statusMap["قيد النظر"] || 0}
              </p>
              <span
                className={`text-[10px] font-semibold ${caseFilter === "قيد النظر" ? "text-amber-100" : "text-amber-700"}`}
              >
                بانتظار الفصل
              </span>
            </div>

            <div
              onClick={() => setCaseFilter(caseFilter === "مشطوبة" ? "الكل" : "مشطوبة")}
              className={`cursor-pointer rounded-xl p-3 border transition ${
                caseFilter === "مشطوبة"
                  ? "bg-red-700 text-white border-red-700 shadow-md ring-2 ring-red-400"
                  : "bg-white border-slate-200 hover:border-red-400 hover:bg-red-50/40"
              }`}
            >
              <p
                className={`text-[11px] font-bold ${caseFilter === "مشطوبة" ? "text-white" : "text-red-800"}`}
              >
                مشطوبة / معلقة
              </p>
              <p
                className={`text-2xl font-black mt-0.5 ${caseFilter === "مشطوبة" ? "text-white" : "text-red-950"}`}
              >
                {(caseStatsBreakdown.statusMap["مشطوبة"] || 0) +
                  (caseStatsBreakdown.statusMap["معلقة"] || 0)}
              </p>
              <span
                className={`text-[10px] font-semibold ${caseFilter === "مشطوبة" ? "text-red-100" : "text-red-600"}`}
              >
                مشطوبة أو موقوفة
              </span>
            </div>
          </div>

          {/* تصنيف مراحل ودرجات التقاضي مع حالة كل مرحلة (متداولة / منتهية) */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Layers size={14} className="text-amber-600" />
                <span>
                  توزيع مراحل ودرجات التقاضي (الاستئناف، الابتدائي، التمييز، التنفيذ) مع حالة
                  التداول والإنجاز:
                </span>
              </span>
              {caseStageFilter !== "الكل" && (
                <button
                  onClick={() => setCaseStageFilter("الكل")}
                  className="text-[11px] font-bold text-amber-700 hover:underline bg-amber-50 px-2 py-0.5 rounded-md"
                >
                  عرض جميع المراحل (إلغاء فلتر المرحلة)
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {CASE_STAGES.map((stg) => {
                const totalForStage = caseStatsBreakdown.stageMap[stg] || 0;
                const stgStats = caseStatsBreakdown.stageStatusMap[stg] || {
                  ongoing: 0,
                  finished: 0,
                };
                const isSelected = caseStageFilter === stg;
                return (
                  <button
                    key={stg}
                    onClick={() => setCaseStageFilter(isSelected ? "الكل" : stg)}
                    className={`p-2.5 rounded-xl border text-right transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-[#0D382B]/[0.025] hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}
                      >
                        {stg}
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${isSelected ? "bg-white text-amber-900" : "bg-amber-100 text-amber-950"}`}
                      >
                        {totalForStage}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60 font-semibold w-full">
                      <span className={isSelected ? "text-white/90" : "text-emerald-700"}>
                        متداولة: {stgStats.ongoing}
                      </span>
                      <span className={isSelected ? "text-white/90" : "text-slate-500"}>
                        منتهية: {stgStats.finished}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* فلتر الإمارات (تصميم دليل المحاكم) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-2">
            {[
              { id: "الكل", name: "جميع الإمارات", icon: "" },
              { id: "أبوظبي", name: "أبوظبي", icon: "" },
              { id: "دبي", name: "دبي", icon: "" },
              { id: "الشارقة", name: "الشارقة", icon: "" },
              { id: "عجمان", name: "عجمان", icon: "" },
              { id: "رأس الخيمة", name: "رأس الخيمة", icon: "" },
              { id: "أم القيوين", name: "أم القيوين", icon: "" },
              { id: "الفجيرة", name: "الفجيرة", icon: "" },
            ].map((em) => {
              const count =
                em.id === "الكل" ? cases.length : caseStatsBreakdown.emirateMap[em.id] || 0;
              const isSelected = caseEmirateFilter === em.id;
              return (
                <button
                  key={em.id}
                  onClick={() => setCaseEmirateFilter(em.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1 border text-center cursor-pointer ${
                    isSelected
                      ? "bg-[#0D382B] text-white border-[#0D382B] shadow-[0_6px_14px_-6px_rgb(13,56,43,0.5)]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-[#0D382B]/[0.06] hover:border-[#0D382B]/20 shadow-2xs"
                  }`}
                >
                  <span className="leading-tight truncate w-full">{em.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? "bg-[#C5A059] text-[#0D382B] font-bold" : "bg-slate-100 text-slate-600"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* شريط توزيع المحاكم وتصنيف الموكلين */}
          <div className="grid sm:grid-cols-2 gap-3 pt-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <span className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Users size={13} className="text-amber-600" /> توزيع الموكلين وصفاتهم:
                </span>
                {caseClientTypeFilter !== "الكل" && (
                  <button
                    onClick={() => setCaseClientTypeFilter("الكل")}
                    className="text-[10px] text-amber-700 font-bold hover:underline"
                  >
                    إلغاء التحديد
                  </button>
                )}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    setCaseClientTypeFilter(caseClientTypeFilter === "شركة" ? "الكل" : "شركة")
                  }
                  className={`flex-1 p-2 rounded-lg border text-center transition ${
                    caseClientTypeFilter === "شركة"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-[#0D382B]/[0.06] transition-colors"
                  }`}
                >
                  <p className="text-[10px] font-bold opacity-90">شركات ومؤسسات</p>
                  <p className="text-base font-black mt-0.5">
                    {caseStatsBreakdown.clientTypeMap["شركة"] || 0} قضية
                  </p>
                </button>
                <button
                  onClick={() =>
                    setCaseClientTypeFilter(caseClientTypeFilter === "فرد" ? "الكل" : "فرد")
                  }
                  className={`flex-1 p-2 rounded-lg border text-center transition ${
                    caseClientTypeFilter === "فرد"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-[#0D382B]/[0.06] transition-colors"
                  }`}
                >
                  <p className="text-[10px] font-bold opacity-90">أفراد وأشخاص</p>
                  <p className="text-base font-black mt-0.5">
                    {caseStatsBreakdown.clientTypeMap["فرد"] || 0} قضية
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs sm:col-span-2 lg:col-span-1">
              <span className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Scale size={13} className="text-amber-600" /> أكثر التخصصات القضائية:
                </span>
                {caseTypeFilter !== "الكل" && (
                  <button
                    onClick={() => setCaseTypeFilter("الكل")}
                    className="text-[10px] text-amber-700 font-bold hover:underline"
                  >
                    إلغاء التحديد
                  </button>
                )}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {Object.entries(caseStatsBreakdown.typeMap)
                  .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
                  .slice(0, 8)
                  .map(([tp, count]) => {
                    const isSelected = caseTypeFilter === tp;
                    return (
                      <button
                        key={tp}
                        onClick={() => setCaseTypeFilter(isSelected ? "الكل" : tp)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-amber-400"
                            : `${caseTypeBadgeColor(tp)} hover:opacity-85`
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${caseTypeDotColor(tp)} inline-block shrink-0`}
                        />
                        <span>{tp}</span>
                        <span
                          className={`font-bold ${isSelected ? "text-amber-300" : "text-slate-600"}`}
                        >
                          ({count})
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== محرك الفلترة المتقدمة والتصنيف (Advanced Filters) ===== */}
      {showAdvancedFilters && (
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm space-y-3.5 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-amber-600" />
              <span className="font-bold text-sm text-slate-900">
                محرك الفلترة المتقدمة وتخصيص رول القضايا
              </span>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 text-xs font-bold">
                  {activeFiltersCount} فلتر مطبق
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllCaseFilters}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                >
                  <RotateCcw size={13} /> تفريغ كافة الفلاتر
                </button>
              )}
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-[#0D382B]/[0.06] transition-colors transition"
                title="إغلاق الفلتر المتقدم"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* مرحلة الدعوى / درجة التقاضي */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Layers size={13} className="text-amber-600" /> مرحلة الدعوى (درجة التقاضي)
              </label>
              <select
                value={caseStageFilter}
                onChange={(e) => setCaseStageFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">🏛️ جميع المراحل ودرجات التقاضي ({cases.length})</option>
                {CASE_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg} ({caseStatsBreakdown.stageMap[stg] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* حالة القضية */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-amber-600" /> حالة القضية
              </label>
              <select
                value={caseFilter}
                onChange={(e) => setCaseFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">📋 جميع الحالات ({cases.length})</option>
                {CASE_STATUS.map((st) => (
                  <option key={st} value={st}>
                    {st} ({caseStatsBreakdown.statusMap[st] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* نوع القضية / التخصص */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Scale size={13} className="text-amber-600" /> نوع القضية / التخصص
              </label>
              <select
                value={caseTypeFilter}
                onChange={(e) => setCaseTypeFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">⚖️ جميع الأنواع والتخصصات ({uniqueCaseTypes.length})</option>
                {uniqueCaseTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* الإمارة */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={13} className="text-amber-600" /> الإمارة المختصة
              </label>
              <select
                value={caseEmirateFilter}
                onChange={(e) => setCaseEmirateFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">📍 جميع الإمارات ({uniqueEmirates.length})</option>
                {uniqueEmirates.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>

            {/* الموكل المحدد */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User size={13} className="text-amber-600" /> تصفية حسب الموكل
              </label>
              <select
                value={caseClientFilter}
                onChange={(e) => setCaseClientFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">👥 جميع الموكلين ({uniqueCaseClients.length})</option>
                {uniqueCaseClients.map((cl) => (
                  <option key={cl.id} value={String(cl.id)}>
                    {cl.name} ({cl.type})
                  </option>
                ))}
              </select>
            </div>

            {/* تصنيف صفة الموكل */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Users size={13} className="text-amber-600" /> صفة الموكل
              </label>
              <select
                value={caseClientTypeFilter}
                onChange={(e) => setCaseClientTypeFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">🏢👤 أفراد وشركات (الكل)</option>
                <option value="شركة">🏢 شركات ومؤسسات تجارية</option>
                <option value="فرد">👤 أفراد وأشخاص طبيعيين</option>
              </select>
            </div>

            {/* سنة الدعوى */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <CalendarDays size={13} className="text-amber-600" /> سنة القيد / الدعوى
              </label>
              <select
                value={caseYearFilter}
                onChange={(e) => setCaseYearFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">📅 جميع السنوات ({uniqueCaseYears.length})</option>
                {uniqueCaseYears.map((yr) => (
                  <option key={yr} value={yr}>
                    سنة {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* ترتيب النتائج */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ArrowUpDown size={13} className="text-amber-600" /> ترتيب النتائج
              </label>
              <select
                value={caseSortBy}
                onChange={(e: any) => setCaseSortBy(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="newest">الأحدث قيداً (تنازلي)</option>
                <option value="oldest">الأقدم قيداً (تصاعدي)</option>
                <option value="number">حسب رقم القضية</option>
                <option value="client">اسم الموكل (أبجدياً)</option>
                <option value="court">المحكمة المختصة</option>
              </select>
            </div>

            {/* المحكمة المختصة */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-4">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 size={13} className="text-amber-600" /> المحكمة المختصة
              </label>
              <select
                value={caseCourtFilter}
                onChange={(e) => setCaseCourtFilter(e.target.value)}
                className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
              >
                <option value="الكل">🏢 جميع المحاكم ({uniqueCourts.length})</option>
                {uniqueCourts.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* شارات الفلاتر المطبقة Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400">الفلاتر المطبقة:</span>
              {caseStageFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-xs text-amber-950 font-bold">
                  درجة التقاضي: {caseStageFilter}
                  <button
                    onClick={() => setCaseStageFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  الحالة: {caseFilter}
                  <button
                    onClick={() => setCaseFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseJudgeFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  القاضي/الدائرة: {caseJudgeFilter}
                  <button
                    onClick={() => setCaseJudgeFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseCourtFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  المحكمة: {caseCourtFilter}
                  <button
                    onClick={() => setCaseCourtFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseTypeFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  النوع: {caseTypeFilter}
                  <button
                    onClick={() => setCaseTypeFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseEmirateFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  الإمارة: {caseEmirateFilter}
                  <button
                    onClick={() => setCaseEmirateFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseClientFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  الموكل: {clientName(Number(caseClientFilter))}
                  <button
                    onClick={() => setCaseClientFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseClientTypeFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  صفة الموكل: {caseClientTypeFilter}
                  <button
                    onClick={() => setCaseClientTypeFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseYearFilter !== "الكل" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  السنة: {caseYearFilter}
                  <button
                    onClick={() => setCaseYearFilter("الكل")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {caseSortBy !== "default" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  الترتيب: {caseSortBy}
                  <button
                    onClick={() => setCaseSortBy("default")}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {q.trim() !== "" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-900 font-semibold">
                  بحث: "{q}"
                  <button onClick={() => setQ("")} className="hover:text-red-600 p-0.5">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* أشرطة التصفية السريعة لمرحلة الدعوى وحالة القضية */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        {/* شريط فلترة مرحلة الدعوى (درجة التقاضي) */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold text-amber-800 flex items-center gap-1 pl-1">
            <Layers size={13} /> مرحلة الدعوى:
          </span>
          {["الكل", ...CASE_STAGES].map((stg) => {
            const isSelected = caseStageFilter === stg;
            const count = stg === "الكل" ? cases.length : caseStatsBreakdown.stageMap[stg] || 0;
            return (
              <button
                key={stg}
                onClick={() => setCaseStageFilter(stg)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50/70 text-amber-950 hover:bg-amber-100 border border-amber-200/60"
                }`}
              >
                <span>{stg}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isSelected ? "bg-white text-amber-900" : "bg-amber-200/80 text-amber-950"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* شريط فلترة حالة القضية الإجرائية */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 pl-1">
            <CheckCircle2 size={13} /> حالة القضية:
          </span>
          {["الكل", ...CASE_STATUS].map((s) => {
            const isSelected = caseFilter === s;
            const count = s === "الكل" ? cases.length : caseStatsBreakdown.statusMap[s] || 0;
            return (
              <button
                key={s}
                onClick={() => setCaseFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition flex items-center gap-1 border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : s === "الكل"
                      ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-[#0D382B]/[0.08] transition-colors"
                      : `${statusColor(s)} hover:brightness-95`
                }`}
              >
                <span>{s}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* شريط البحث والفلترة السريعة */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Scale size={14} className="text-amber-600" /> الدائرة القضائية / القاضي
          </label>
          <select
            value={caseJudgeFilter}
            onChange={(e) => setCaseJudgeFilter(e.target.value)}
            className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
          >
            <option value="الكل">🏛️ جميع الدوائر والقضاة ({uniqueJudges.length})</option>
            {uniqueJudges.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Building2 size={14} className="text-amber-600" /> المحكمة المختصة
          </label>
          <select
            value={caseCourtFilter}
            onChange={(e) => setCaseCourtFilter(e.target.value)}
            className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
          >
            <option value="الكل">🏢 جميع المحاكم ({uniqueCourts.length})</option>
            {uniqueCourts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 sm:col-span-2 lg:col-span-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Search size={14} className="text-amber-600" /> البحث الشامل في السجل ورول القضايا
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث برقم القضية، الموكل، الخصم، القاضي، أو موضوع الدعوى..."
              className="w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 focus:border-[#0D382B]/40 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all"
            />
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllCaseFilters}
                className="shrink-0 rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition flex items-center gap-1"
              >
                <RotateCcw size={12} /> إعادة ضبط
              </button>
            )}
          </div>
        </div>
      </div>

      {/* جدول القضايا مع شريط العداد عند الطلب ودليل الألوان */}
      <div className="overflow-x-auto custom-scrollbar app-card">
        {/* شريط العداد الإحصائي ودليل الألوان العلوي للجدول */}
        <div className="px-4 py-3 bg-stone-50 border-b border-slate-200 text-xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">القضايا المعروضة حالياً:</span>
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
                <Hash size={12} /> {filteredCases.length} من أصل {cases.length} قضية
              </span>
              {filteredCases.length !== cases.length && (
                <span className="text-[11px] text-slate-400">
                  (تم استبعاد {cases.length - filteredCases.length} قضية بواسطة الفلاتر المطبقة)
                </span>
              )}
            </div>
            <button
              onClick={() => setShowCaseStatsOnDemand(!showCaseStatsOnDemand)}
              className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 hover:underline transition"
            >
              {showCaseStatsOnDemand ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>
                {showCaseStatsOnDemand ? "إخفاء التفصيل الإحصائي" : "عرض التفصيل الإحصائي للأعداد"}
              </span>
            </button>
          </div>

          {/* دليل ألوان وتصنيفات القضايا السريع */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70 text-[11px]">
            <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0 ml-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              دليل ألوان تصنيف القضايا:
            </span>
            {CASE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setCaseTypeFilter(caseTypeFilter === t ? "الكل" : t)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  caseTypeFilter === t
                    ? "bg-slate-900 text-white border-slate-900 font-bold shadow-xs ring-1 ring-amber-400"
                    : `${caseTypeBadgeColor(t)} hover:opacity-85 shadow-2xs`
                }`}
                title={`تصفية سريعة حسب: قضية ${t}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${caseTypeDotColor(t)} inline-block shrink-0`}
                />
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>

        <table className="w-full min-w-[750px] text-sm">
          <thead className="bg-[#0D382B]/[0.035] text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/70">
            <tr>
              <th className="px-4 py-3 font-semibold">رقم القضية والتصنيف</th>
              <th className="px-4 py-3 font-semibold">الموكل</th>
              <th className="px-4 py-3 font-semibold">الخصم</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">المحكمة</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">الدائرة / القاضي</th>
              <th className="px-4 py-3 font-semibold">نوع القضية</th>
              <th className="px-4 py-3 font-semibold">مرحلة الدعوى</th>
              <th className="px-4 py-3 font-semibold">الحالة</th>
              {/* عمود ثابت (sticky) حتى تبقى أزرار عرض/تعديل/حذف القضية ظاهرة دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
              <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-center bg-[#faf9f6] shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {filteredCases.map((c) => (
              <tr key={c.id} className="transition hover:bg-[#0D382B]/[0.025] group">
                <td
                  className="px-4 py-3 font-semibold text-slate-900 cursor-pointer"
                  onClick={() => setCaseView(c.id)}
                >
                  <div className="flex items-center gap-2.5">
                    {/* مؤشر بصري (نقطة ملونة) يمثل تصنيف القضية */}
                    <span
                      className={`inline-block h-3 w-3 shrink-0 rounded-full ${caseTypeDotColor(c.type)} shadow-xs group-hover:scale-110 transition-transform`}
                      title={`تصنيف القضية: ${c.type}`}
                    />
                    <span className="font-bold text-slate-900 group-hover:text-amber-800 transition">
                      {c.number}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => setCaseView(c.id)}>
                  {clientName(c.clientId)}
                </td>
                <td
                  className="px-4 py-3 text-slate-500 cursor-pointer"
                  onClick={() => setCaseView(c.id)}
                >
                  {caseOpponentsLabel(c)}
                </td>
                <td
                  className="hidden px-4 py-3 text-slate-500 lg:table-cell cursor-pointer"
                  onClick={() => setCaseView(c.id)}
                >
                  {c.court}
                </td>
                <td
                  className="hidden px-4 py-3 md:table-cell cursor-pointer"
                  onClick={() => setCaseView(c.id)}
                >
                  {c.judge && c.judge.trim() ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                      <Scale size={12} className="text-amber-600" /> {c.judge}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {/* شارة نوع القضية مع النقطة الملونة وتنسيق الألوان الخاص بالتصنيف */}
                  <Badge
                    className={`${caseTypeBadgeColor(c.type)} inline-flex items-center gap-1.5 shadow-2xs`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${caseTypeDotColor(c.type)} inline-block shrink-0`}
                    />
                    <span>{c.type}</span>
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={stageBadgeColor(getCaseStage(c))}>{getCaseStage(c)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusColor(c.status)}>{c.status}</Badge>
                </td>
                {/* عمود ثابت (sticky) حتى تبقى أزرار عرض/تعديل/حذف القضية ظاهرة دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                <td className="sticky left-0 z-10 bg-white group-hover:bg-[#0D382B]/[0.025] px-4 py-3 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCaseView(c.id)}
                      className="text-xs font-semibold text-amber-700 hover:underline"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      onClick={() => {
                        setEditingCase(c);
                        setForm({
                          number: c.number,
                          clientId: c.clientId,
                          opponents:
                            c.opponents && c.opponents.length > 0 ? [...c.opponents] : [""],
                          type: c.type,
                          court: c.court,
                          judge: c.judge,
                          stage: c.stage,
                          status: c.status,
                          subject: c.subject,
                          openDate: c.openDate,
                          fee: c.fee,
                          emirate: c.emirate,
                        });
                        setModal("case");
                      }}
                      className="text-slate-400 hover:text-amber-700 p-1 transition"
                      title="تعديل بيانات القضية"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        requestDelete({
                          section: "إدارة القضايا والملفات",
                          title: `القضية رقم: ${c.number}`,
                          details: `الموكل: ${clientName(c.clientId)} | الخصم: ${caseOpponentsLabel(c)} | المحكمة: ${c.court} | المرحلة: ${getCaseStage(c)}`,
                          permKey: "deleteCases",
                          actionName: "حذف ملف القضية",
                          onConfirm: () => {
                            logAuditAction(
                              "DELETE",
                              "إدارة القضايا",
                              `قضية: ${c.number}`,
                              `حذف القضية رقم ${c.number} الخاصة بالموكل ${clientName(c.clientId)}`,
                              c.id,
                            );
                            setCases((prev) => prev.filter((x) => x.id !== c.id));
                          },
                        });
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 transition"
                      title="حذف القضية"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCases.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500 space-y-2">
            <p className="font-semibold text-slate-600">
              لا توجد قضايا مطابقة لخيارات الفلترة المحددة
            </p>
            <p className="text-xs text-slate-400">جرب تعديل خيارات الفلترة أو تفريغ معايير البحث</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllCaseFilters}
                className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition mt-2 shadow-xs"
              >
                <RotateCcw size={12} /> إعادة ضبط جميع الفلاتر
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
