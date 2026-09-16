// هوك عام مشترك للحالات المتزامنة مع Supabase (نفس نمط "remainingSyncTables" الأصلي في App.tsx):
// عند أول تحميل، يجلب النسخة من Supabase — إن وُجدت يستخدمها ويحفظها محلياً، وإلا يرفع أي بيانات
// محلية موجودة. بعد أول تحميل، أي تغيير لاحق يُحفظ محلياً فوراً ويُرفع لـ Supabase بعد تأخير 1.5 ثانية.
// استُخرج من useBillingRecords.ts (حيث بُني أول مرة) ليُستخدم أيضاً بالحالات الأساسية
// (clients/cases/feeAgreements/payments/invoices/auditLogs/kyc/kycWatchlist).
import { useState, useEffect, useRef } from "react";
import {
  loadStorage,
  saveStorage,
  fetchSupabaseTable,
  pushSupabaseTable,
} from "../domain/storageAndMessaging";

export function useSyncedTable<T extends { id: number | string }>(
  storageKey: string,
  supabaseTable: string,
  initFn: () => T[],
  fetchOptions?: { limit?: number },
) {
  const [value, setValue] = useState<T[]>(initFn);
  const hydratedRef = useRef(false);

  // المزامنة الأولية من Supabase عند أول تحميل فقط
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchSupabaseTable<T>(supabaseTable, fetchOptions);
      if (cancelled) return;
      if (remote && remote.length > 0) {
        setValue(remote);
        saveStorage(storageKey, remote);
      } else if (remote !== null && value.length > 0) {
        pushSupabaseTable(supabaseTable, value);
      }
      hydratedRef.current = true;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // الحفظ المحلي الفوري + الرفع المؤجل لـ Supabase بعد أي تغيير لاحق
  useEffect(() => {
    saveStorage(storageKey, value);
    if (hydratedRef.current) {
      const t = setTimeout(() => pushSupabaseTable(supabaseTable, value), 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue] as const;
}
