// حالة فلاتر شاشة "الموكلين" — مستخرجة من App.tsx. بدون حفظ محلي (فلاتر جلسة فقط).
import { useState } from "react";

export function useClientFilters() {
  const [clientCategoryFilter, setClientCategoryFilter] = useState<string>("الكل");
  const [clientSearch, setClientSearch] = useState<string>("");
  return { clientCategoryFilter, setClientCategoryFilter, clientSearch, setClientSearch };
}
