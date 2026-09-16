// حالة الموكلين (clients) مع مزامنة Supabase — جزء من "النواة" المشتركة الأصلية بـ App.tsx
// (كانت مدمجة داخل useEffect ضخم واحد "remainingSyncTables" يزامن 8 جداول دفعة واحدة).
// استُخرجت هنا بنفس منطق التهيئة الأصلي حرفياً (دمج + إزالة التكرار عبر deduplicateClients من
// ./domain/utils)، وباستخدام نفس هوك المزامنة العام useSyncedTable المستخدم في useBillingRecords.
import type { Client } from "../domain/types";
import { seedClients } from "../domain/seedData";
import { loadStorage } from "../domain/storageAndMessaging";
import { deduplicateClients } from "../domain/utils";
import { useSyncedTable } from "./useSyncedTable";

function initClients(): Client[] {
  const saved = loadStorage<Client[]>("firm_clients", seedClients);
  const combined = (!saved || saved.length === 0) ? seedClients : [...saved, ...seedClients];
  return deduplicateClients(combined);
}

export function useClientsData() {
  const [clients, setClients] = useSyncedTable<Client>("firm_clients", "clients", initClients);
  return { clients, setClients };
}
