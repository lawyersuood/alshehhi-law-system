// حالة "السوابق القضائية" (Legal Precedents) — مستخرجة من App.tsx بنفس نمط usePolicies.
// ملاحظة: filteredPrecedents وuploadPrecedentFile/deletePrecedent بقيت داخل App.tsx عمداً
// (تعتمد على دوال عامة أخرى مثل requestDelete/logAuditAction) — هذا الهوك يغطي فقط الحالة
// المعزولة 100٪ (state + حفظها بالتخزين المحلي)، بدون أي تغيير بالسلوك.
import { useState, useEffect } from "react";
import type { LegalPrecedent } from "../domain/types";
import { seedLegalPrecedents } from "../domain/seedData";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export function usePrecedents() {
  const [precedents, setPrecedents] = useState<LegalPrecedent[]>(() =>
    loadStorage("firm_legal_precedents", seedLegalPrecedents)
  );
  const [precedentSearch, setPrecedentSearch] = useState<string>("");
  const [precedentCourtFilter, setPrecedentCourtFilter] = useState<string>("الكل");
  const [precedentCategoryFilter, setPrecedentCategoryFilter] = useState<string>("الكل");
  const [precedentYearFilter, setPrecedentYearFilter] = useState<string>("الكل");
  const [showAddPrecedentModal, setShowAddPrecedentModal] = useState<boolean>(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState<LegalPrecedent | null>(null);

  useEffect(() => {
    saveStorage("firm_legal_precedents", precedents);
  }, [precedents]);

  return {
    precedents, setPrecedents,
    precedentSearch, setPrecedentSearch,
    precedentCourtFilter, setPrecedentCourtFilter,
    precedentCategoryFilter, setPrecedentCategoryFilter,
    precedentYearFilter, setPrecedentYearFilter,
    showAddPrecedentModal, setShowAddPrecedentModal,
    selectedPrecedent, setSelectedPrecedent,
  };
}
