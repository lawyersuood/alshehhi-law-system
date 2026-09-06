// ============================================================
// المصروفات النقدية (Cash Expenses) — قسم المشتريات
// مصروف صغير متفرق بدون فاتورة مورد رسمية (رسوم كاتب عدل، مواقف، طباعة مستندات محكمة).
// يُنشئ قيداً محاسبياً فورياً عند الحفظ (مدين: حساب المصروف — دائن: حساب الدفع)
// بخلاف فواتير المشتريات التي تمر بدورة اعتماد منفصلة.
// ============================================================

export interface CashExpense {
  id: string;
  expenseNumber: string; // EXP-YYYY-XXXX
  date: string; // YYYY-MM-DD
  description: string;
  vendorName?: string;
  accountId: string; // حساب المصروف من شجرة الحسابات
  paidFromAccountId: string; // حساب الدفع (نقد/بنك) من شجرة الحسابات
  amount: number;
  caseRef?: string; // ربط نصي حر بالقضية أو المشروع المرتبط بهذا المصروف
  journalEntryId?: string;
  createdAt: string;
  createdBy?: string;
}

export const CASH_EXPENSE_LS_KEYS = {
  expenses: "firm_accounting_cash_expenses_v1",
};
