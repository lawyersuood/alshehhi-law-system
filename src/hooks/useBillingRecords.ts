// حالة سجلات الوقت/المصروفات/الأمانة والبلاغات (Time Logs, Case Expenses, Trust Transactions,
// Invoice Installments, STR Reports) — مستخرجة من App.tsx بنفس نمط الهوكس السابقة.
// ملاحظة مهمة: هذه الحالات لا تملك أي حفظ محلي (localStorage) أو مزامنة Supabase حالياً بالكود
// الأصلي — فقط seed مبدئي بالذاكرة. أبقينا هذا السلوك كما هو تماماً (صفر تغيير سلوكي)، هذا مجرد
// نقل مكاني للحالة نفسها.
import { useState } from "react";
import type { TimeLog, CaseExpense, TrustTransaction, InvoiceInstallment, StrReport } from "../domain/types";
import {
  seedTimeLogs, seedCaseExpenses, seedTrustTransactions, seedInstallments, seedStrReports,
} from "../domain/seedData";

export function useBillingRecords() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(seedTimeLogs);
  const [caseExpenses, setCaseExpenses] = useState<CaseExpense[]>(seedCaseExpenses);
  const [trustTransactions, setTrustTransactions] = useState<TrustTransaction[]>(seedTrustTransactions);
  const [installments, setInstallments] = useState<InvoiceInstallment[]>(seedInstallments);
  const [strReports, setStrReports] = useState<StrReport[]>(seedStrReports);

  return {
    timeLogs, setTimeLogs,
    caseExpenses, setCaseExpenses,
    trustTransactions, setTrustTransactions,
    installments, setInstallments,
    strReports, setStrReports,
  };
}
