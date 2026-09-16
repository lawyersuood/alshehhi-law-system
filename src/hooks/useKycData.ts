// حالة سجلات "اعرف عميلك" (kyc) مع مزامنة Supabase — جزء من النواة المشتركة الأصلية بـ App.tsx.
import type { KycItem } from "../domain/types";
import { seedKyc } from "../domain/seedData";
import { loadStorage } from "../domain/storageAndMessaging";
import { useSyncedTable } from "./useSyncedTable";

export function useKycData() {
  const [kyc, setKyc] = useSyncedTable<KycItem>("firm_kyc", "kyc_items", () => {
    const saved = loadStorage<KycItem[]>("firm_kyc", seedKyc);
    return saved || [];
  });
  return { kyc, setKyc };
}
