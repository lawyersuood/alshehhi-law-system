// حالات "الاتفاقيات المالية/المدفوعات/الفواتير" مع مزامنة Supabase — جزء من النواة المشتركة
// الأصلية بـ App.tsx (كانت الثلاثة ضمن نفس useEffect الضخم "remainingSyncTables"). لا يوجد أي
// منطق تهيئة خاص لهذه الثلاثة بالكود الأصلي (تحميل مباشر من التخزين المحلي فقط)، لذا استُخدم
// نفس هوك المزامنة العام useSyncedTable مباشرة.
import type { FeeAgreement, PaymentReceipt, Invoice } from "../domain/types";
import { seedFeeAgreements, seedPayments, seedInvoices } from "../domain/seedData";
import { loadStorage } from "../domain/storageAndMessaging";
import { useSyncedTable } from "./useSyncedTable";

export function useFinancialCoreData() {
  const [feeAgreements, setFeeAgreements] = useSyncedTable<FeeAgreement>(
    "firm_fee_agreements",
    "fee_agreements",
    () => loadStorage("firm_fee_agreements", seedFeeAgreements),
  );
  const [payments, setPayments] = useSyncedTable<PaymentReceipt>("firm_payments", "payments", () =>
    loadStorage("firm_payments", seedPayments),
  );
  const [invoices, setInvoices] = useSyncedTable<Invoice>("firm_invoices", "invoices", () =>
    loadStorage("firm_invoices", seedInvoices),
  );

  return {
    feeAgreements,
    setFeeAgreements,
    payments,
    setPayments,
    invoices,
    setInvoices,
  };
}
