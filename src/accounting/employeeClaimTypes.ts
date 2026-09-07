// ============================================================
// مطالبات الموظفين (Employee Claims / Reimbursements) — قسم الأصول والرواتب
// مبلغ دفعه الموظف من جيبه الخاص لصالح المكتب (مواصلات، ضيافة عميل، رسوم عاجلة)
// ويطلب استرداده. يمر بمسار: معلّقة → معتمدة (يُنشأ قيد استحقاق: مدين مصروف /
// دائن ذمم مستحقة للموظفين) → مسدّدة (قيد سداد: مدين الذمم المستحقة / دائن
// حساب الدفع) — أو تُرفض دون أي أثر محاسبي.
// ============================================================

import { Account } from "./types";

export const EMPLOYEE_CLAIMS_PAYABLE_ACCOUNT_CODE = "2130"; // ذمم دائنة أخرى ومصروفات مستحقة

export type EmployeeClaimStatus = "pending" | "approved" | "paid" | "rejected";

export const EMPLOYEE_CLAIM_STATUS_LABELS: Record<EmployeeClaimStatus, string> = {
  pending: "معلّقة",
  approved: "معتمدة (بانتظار السداد)",
  paid: "مسدّدة",
  rejected: "مرفوضة",
};

export interface EmployeeClaim {
  id: string;
  claimNumber: string; // CLM-YYYY-XXXX
  date: string;
  employeeName: string;
  description: string;
  accountId: string; // حساب المصروف المرتبط بالمطالبة
  amount: number;
  status: EmployeeClaimStatus;
  journalEntryId?: string; // قيد الاستحقاق عند الاعتماد
  paymentJournalEntryId?: string; // قيد السداد
  payingAccountId?: string; // الحساب الذي سُدد منه (نقد أو بنك)
  createdAt: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  rejectedAt?: string;
}

export const EMPLOYEE_CLAIM_LS_KEYS = {
  claims: "firm_accounting_employee_claims_v1",
};
