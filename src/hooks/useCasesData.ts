// حالة القضايا (cases) مع مزامنة Supabase — جزء من "النواة" المشتركة الأصلية بـ App.tsx.
// نفس منطق التهيئة الأصلي حرفياً (استبعاد القضايا التجريبية عبر isDemoCase، تنظيف عبر sanitizeCase،
// إزالة تكرار عبر deduplicateCases — الثلاثة الآن في ./domain/utils)، بنفس هوك المزامنة العام.
import type { CaseItem } from "../domain/types";
import { seedCases } from "../domain/seedData";
import { loadStorage } from "../domain/storageAndMessaging";
import { isDemoCase, sanitizeCase, deduplicateCases } from "../domain/utils";
import { useSyncedTable } from "./useSyncedTable";

function initCases(): CaseItem[] {
  const saved = loadStorage<CaseItem[]>("firm_cases", seedCases);
  const cleanList = (saved || [])
    .filter(c => !isDemoCase(c))
    .map(c => sanitizeCase(c));

  // لا نصفّر أتعاب القضايا بعد الآن — الأتعاب الفعلية المُدخلة تبقى كما هي عبر إعادة التحميل والدمج
  const combined = [...cleanList, ...seedCases];
  return deduplicateCases(combined);
}

export function useCasesData() {
  const [cases, setCases] = useSyncedTable<CaseItem>("firm_cases", "cases", initCases);
  return { cases, setCases };
}
