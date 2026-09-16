// حالة وشاشة "السياسات الداخلية للمكتب" — مستخرجة من App.tsx كخطوة أولى من تقسيم الـ hooks.
// ملاحظة: أبقينا handleSavePolicy/handleDeletePolicy/openAddPolicy/openEditPolicy داخل App.tsx عمداً
// (بدون نقلهم هنا) لأنها تعتمد على دوال عامة أخرى (logAuditAction, requestDelete, isSuperAdmin,
// currentUser) لا يزال بناؤها داخل App() — فصلها كان يحتاج تمرير عدد كبير من الاعتماديات كمعاملات،
// وهذا يزيد خطورة النقل دون فائدة حقيقية بهذه المرحلة. هذا الهوك يغطي فقط ما هو معزول 100%:
// الحالة (state) نفسها + حفظها بالتخزين المحلي + الفلترة/البحث المشتقّة منها.
import { useState, useEffect, useMemo } from "react";
import type { InternalPolicy } from "../domain/types";
import { seedInternalPolicies } from "../domain/seedData";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";
import { POLICY_CATEGORIES } from "../domain/constants";
import { todayISO } from "../domain/utils";

export function usePolicies() {
  const [policies, setPolicies] = useState<InternalPolicy[]>(() =>
    loadStorage("firm_internal_policies", seedInternalPolicies),
  );
  const [policySearch, setPolicySearch] = useState<string>("");
  const [policyCategoryFilter, setPolicyCategoryFilter] = useState<string>("الكل");
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [editingPolicy, setEditingPolicy] = useState<InternalPolicy | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<InternalPolicy | null>(null);
  const [policyForm, setPolicyForm] = useState<{
    title: string;
    category: string;
    content: string;
    effectiveDate: string;
  }>({
    title: "",
    category: POLICY_CATEGORIES[0],
    content: "",
    effectiveDate: todayISO(),
  });

  useEffect(() => {
    saveStorage("firm_internal_policies", policies);
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return policies
      .filter((p) => policyCategoryFilter === "الكل" || p.category === policyCategoryFilter)
      .filter((p) => {
        const q = policySearch.trim().toLowerCase();
        if (!q) return true;
        return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
      })
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [policies, policySearch, policyCategoryFilter]);

  return {
    policies,
    setPolicies,
    policySearch,
    setPolicySearch,
    policyCategoryFilter,
    setPolicyCategoryFilter,
    showPolicyModal,
    setShowPolicyModal,
    editingPolicy,
    setEditingPolicy,
    selectedPolicy,
    setSelectedPolicy,
    filteredPolicies,
    policyForm,
    setPolicyForm,
  };
}
