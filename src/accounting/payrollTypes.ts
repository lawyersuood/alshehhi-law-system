// ============================================================
// النظام المحاسبي المتكامل — المرحلة السابعة (الأخيرة): الرواتب والموظفين
// سجل موظفين مستقل تماماً عن سجل "الموظفون والكادر" الحالي في النظام — يمكن ربطهما
// لاحقاً كخطوة منفصلة إذا رغب المكتب بذلك. لا يشمل توليد ملف حماية الأجور (WPS).
// معزول بالكامل، ولا يظهر إلا بعد تفعيل ACCOUNTING_MODULE_ENABLED في App.tsx
// ============================================================

export const SALARY_EXPENSE_ACCOUNT_CODE = "5010"; // رواتب وأجور الموظفين
export const SALARY_PAYABLE_ACCOUNT_CODE = "2110"; // رواتب ومستحقات الموظفين

export interface AllowanceItem {
  id: string;
  label: string; // مثال: بدل سكن، بدل مواصلات
  amount: number;
}

export interface PayrollEmployee {
  id: string;
  name: string;
  jobTitle?: string;
  basicSalary: number;
  allowances: AllowanceItem[];
  salaryExpenseAccountId: string; // حساب مصروف الرواتب (من نوع مصروفات)
  salaryPayableAccountId: string; // حساب مستحقات الرواتب (من نوع التزامات)
  isActive: boolean;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface PayrollRun {
  id: string;
  periodLabel: string; // بصيغة YYYY-MM، تشغيل واحد فقط لكل فترة
  runDate: string; // YYYY-MM-DD
  totalGross: number;
  journalEntryId: string; // قيد الاستحقاق التلقائي
  // لقطة من توزيع مبلغ الاستحقاق على حسابات مستحقات الرواتب وقت التشغيل، تُستخدم عند تسجيل الدفع لاحقاً
  // حتى لو تغيّرت بيانات حسابات الموظفين بعد ذلك
  payableBreakdown: Array<{ accountId: string; amount: number }>;
  paid: boolean;
  paidAt?: string;
  paymentJournalEntryId?: string;
  payingAccountId?: string;
  createdAt: string;
  createdBy?: string;
}

// قسيمة راتب لموظف واحد ضمن تشغيل رواتب معيّن — لقطة من بيانات الموظف وقت التشغيل
export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  periodLabel: string;
  basicSalary: number;
  allowances: AllowanceItem[];
  grossSalary: number;
  createdAt: string;
}

export const PAYROLL_LS_KEYS = {
  employees: "firm_accounting_payroll_employees_v1",
  runs: "firm_accounting_payroll_runs_v1",
  payslips: "firm_accounting_payslips_v1",
};

export function allowancesTotal(allowances: AllowanceItem[]): number {
  return allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
}

export function grossSalary(emp: Pick<PayrollEmployee, "basicSalary" | "allowances">): number {
  return (Number(emp.basicSalary) || 0) + allowancesTotal(emp.allowances);
}

export function hasRunForPeriod(periodLabel: string, runs: PayrollRun[]): boolean {
  return runs.some((r) => r.periodLabel === periodLabel);
}

export function currentPayrollPeriodLabel(): string {
  return new Date().toISOString().slice(0, 7);
}

export function fmtPeriodLabel(p: string): string {
  if (!p) return "—";
  const [y, m] = p.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("ar-AE", { year: "numeric", month: "long" });
}
