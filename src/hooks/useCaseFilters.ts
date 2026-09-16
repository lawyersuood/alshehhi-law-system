// حالة فلاتر شاشة "القضايا" — مستخرجة من App.tsx. ملاحظة: `q` (مربع البحث العام) بقي داخل
// App.tsx عمداً لأنه مشترك بين عدة شاشات (القضايا، السوابق القضائية، سجل التدقيق) — نقله هنا كان
// يكسر تلك الشاشات الأخرى. هذه الحالات بدون أي حفظ محلي بالكود الأصلي (فلاتر مؤقتة بالجلسة فقط).
import { useState } from "react";

export function useCaseFilters() {
  const [caseStageFilter, setCaseStageFilter] = useState("الكل");
  const [caseFilter, setCaseFilter] = useState("الكل");
  const [caseJudgeFilter, setCaseJudgeFilter] = useState("الكل");
  const [caseCourtFilter, setCaseCourtFilter] = useState("الكل");
  const [caseTypeFilter, setCaseTypeFilter] = useState("الكل");
  const [caseEmirateFilter, setCaseEmirateFilter] = useState("الكل");
  const [caseClientFilter, setCaseClientFilter] = useState("الكل");
  const [caseClientTypeFilter, setCaseClientTypeFilter] = useState("الكل");
  const [caseYearFilter, setCaseYearFilter] = useState("الكل");
  const [caseSortBy, setCaseSortBy] = useState<
    "default" | "newest" | "oldest" | "number" | "client" | "court"
  >("default");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCaseStatsOnDemand, setShowCaseStatsOnDemand] = useState(false);

  return {
    caseStageFilter,
    setCaseStageFilter,
    caseFilter,
    setCaseFilter,
    caseJudgeFilter,
    setCaseJudgeFilter,
    caseCourtFilter,
    setCaseCourtFilter,
    caseTypeFilter,
    setCaseTypeFilter,
    caseEmirateFilter,
    setCaseEmirateFilter,
    caseClientFilter,
    setCaseClientFilter,
    caseClientTypeFilter,
    setCaseClientTypeFilter,
    caseYearFilter,
    setCaseYearFilter,
    caseSortBy,
    setCaseSortBy,
    showAdvancedFilters,
    setShowAdvancedFilters,
    showCaseStatsOnDemand,
    setShowCaseStatsOnDemand,
  };
}
