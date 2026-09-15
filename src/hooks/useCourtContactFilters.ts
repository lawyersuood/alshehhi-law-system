// حالة فلاتر شاشة "جهات اتصال المحكمة" — مستخرجة من App.tsx. بدون حفظ محلي بالأصل (فلاتر جلسة فقط).
import { useState } from "react";

export function useCourtContactFilters() {
  const [courtSearchQuery, setCourtSearchQuery] = useState("");
  const [courtEmirateFilter, setCourtEmirateFilter] = useState("الكل");
  const [courtCategoryFilter, setCourtCategoryFilter] = useState("الكل");
  const [courtBranchFilter, setCourtBranchFilter] = useState("الكل");
  const [courtFiltersExpanded, setCourtFiltersExpanded] = useState(false);

  return {
    courtSearchQuery, setCourtSearchQuery,
    courtEmirateFilter, setCourtEmirateFilter,
    courtCategoryFilter, setCourtCategoryFilter,
    courtBranchFilter, setCourtBranchFilter,
    courtFiltersExpanded, setCourtFiltersExpanded,
  };
}
