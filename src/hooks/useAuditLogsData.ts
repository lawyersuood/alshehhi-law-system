// سجل التدقيق (auditLogs) مع مزامنة Supabase — جزء من النواة المشتركة الأصلية بـ App.tsx.
// نفس تفصيلة الجلب الأصلية (limit: 500) محفوظة هنا حرفياً عبر معامل fetchOptions بهوك المزامنة العام.
import type { AuditLogEntry } from "../domain/types";
import { seedAuditLogs } from "../domain/seedData";
import { loadStorage } from "../domain/storageAndMessaging";
import { useSyncedTable } from "./useSyncedTable";

export function useAuditLogsData() {
  const [auditLogs, setAuditLogs] = useSyncedTable<AuditLogEntry>(
    "firm_audit_logs",
    "audit_logs",
    () => loadStorage("firm_audit_logs", seedAuditLogs),
    { limit: 500 }
  );
  return { auditLogs, setAuditLogs };
}
