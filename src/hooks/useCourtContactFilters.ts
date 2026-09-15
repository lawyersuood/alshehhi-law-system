// حالة فلاتر شاشة "جهات اتصال المحكمة" — مستخرجة من App.tsx. بدون حفظ محلي بالأصل (فلاتر جلسة فقط).
import { useState } from "react";
import type { CourtContact } from "../domain/types";

export function useCourtContactFilters() {
  const [courtSearchQuery, setCourtSearchQuery] = useState("");
  const [courtEmirateFilter, setCourtEmirateFilter] = useState("الكل");
  const [courtCategoryFilter, setCourtCategoryFilter] = useState("الكل");
  const [courtBranchFilter, setCourtBranchFilter] = useState("الكل");
  const [courtFiltersExpanded, setCourtFiltersExpanded] = useState(false);
  const [editingCourtContact, setEditingCourtContact] = useState<CourtContact | null>(null);

  return {
    courtSearchQuery, setCourtSearchQuery,
    courtEmirateFilter, setCourtEmirateFilter,
    courtCategoryFilter, setCourtCategoryFilter,
    courtBranchFilter, setCourtBranchFilter,
    courtFiltersExpanded, setCourtFiltersExpanded,
    editingCourtContact, setEditingCourtContact,
  };
}
