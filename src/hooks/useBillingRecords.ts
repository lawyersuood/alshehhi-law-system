// حالة سجلات الوقت/المصروفات/الأمانة والبلاغات (Time Logs, Case Expenses, Trust Transactions,
// Invoice Installments, STR Reports) — مستخرجة من App.tsx بنفس نمط الهوكس السابقة.
//
// يستخدم الآن الهوك العام المشترك useSyncedTable (src/hooks/useSyncedTable.ts) بعد فصله عن هذا
// الملف ليُعاد استخدامه أيضاً بالحالات الأساسية (clients/cases/... إلخ) — بدون أي تغيير سلوكي هنا.
import type {
  TimeLog,
  CaseExpense,
  TrustTransaction,
  InvoiceInstallment,
  StrReport,
} from "../domain/types";
import {
  seedTimeLogs,
  seedCaseExpenses,
  seedTrustTransactions,
  seedInstallments,
  seedStrReports,
} from "../domain/seedData";
import { loadStorage } from "../domain/storageAndMessaging";
import { useSyncedTable } from "./useSyncedTable";

export function useBillingRecords() {
  const [timeLogs, setTimeLogs] = useSyncedTable<TimeLog>("firm_time_logs", "time_logs", () =>
    loadStorage("firm_time_logs", seedTimeLogs),
  );
  const [caseExpenses, setCaseExpenses] = useSyncedTable<CaseExpense>(
    "firm_case_expenses",
    "case_expenses",
    () => loadStorage("firm_case_expenses", seedCaseExpenses),
  );
  const [trustTransactions, setTrustTransactions] = useSyncedTable<TrustTransaction>(
    "firm_trust_transactions",
    "trust_transactions",
    () => loadStorage("firm_trust_transactions", seedTrustTransactions),
  );
  const [installments, setInstallments] = useSyncedTable<InvoiceInstallment>(
    "firm_installments",
    "invoice_installments",
    () => loadStorage("firm_installments", seedInstallments),
  );
  const [strReports, setStrReports] = useSyncedTable<StrReport>(
    "firm_str_reports",
    "str_reports",
    () => loadStorage("firm_str_reports", seedStrReports),
  );

  return {
    timeLogs,
    setTimeLogs,
    caseExpenses,
    setCaseExpenses,
    trustTransactions,
    setTrustTransactions,
    installments,
    setInstallments,
    strReports,
    setStrReports,
  };
}
