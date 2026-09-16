// حالة فلاتر شاشة "سجل التدقيق والأنشطة" — مستخرجة من App.tsx.
import { useState } from "react";

export function useAuditFilters() {
  const [auditSearchTerm, setAuditSearchTerm] = useState<string>("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("الكل");
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>("الكل");
  return {
    auditSearchTerm,
    setAuditSearchTerm,
    auditActionFilter,
    setAuditActionFilter,
    auditModuleFilter,
    setAuditModuleFilter,
  };
}
