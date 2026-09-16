// ============================================================
// النظام المحاسبي المتكامل — المرحلة الثانية: الحسابات البنكية
// معزول بالكامل، ولا يظهر إلا بعد تفعيل ACCOUNTING_MODULE_ENABLED في App.tsx
// ============================================================

export interface BankAccount {
  id: string;
  bankName: string; // اسم البنك، مثال: بنك الإمارات دبي الوطني
  accountLabel: string; // وصف الحساب، مثال: الحساب الجاري الرئيسي
  iban?: string;
  accountNumber?: string;
  currency: string; // افتراضياً AED
  openingBalance: number;
  openingDate: string; // YYYY-MM-DD
  linkedAccountId: string; // ربط بحساب من شجرة الحسابات (من نوع أصول، يمثل هذا البنك في دفتر الأستاذ)
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export type BankTransactionType = "deposit" | "withdrawal";

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string; // YYYY-MM-DD
  type: BankTransactionType;
  amount: number;
  description: string;
  contraAccountId: string; // الحساب المقابل في شجرة الحسابات (الطرف الآخر لقيد اليومية)
  reference?: string;
  journalEntryId: string; // القيد اليومي المُنشأ تلقائياً مع هذه الحركة
  createdAt: string;
  createdBy?: string;
}

export const BANK_LS_KEYS = {
  bankAccounts: "firm_accounting_bank_accounts_v1",
  bankTransactions: "firm_accounting_bank_transactions_v1",
};

export const CURRENCIES = ["AED", "USD", "EUR", "GBP", "SAR"];

// الرصيد الحالي لحساب بنكي = الرصيد الافتتاحي + الإيداعات - السحوبات
export function computeBankBalance(
  account: Pick<BankAccount, "id" | "openingBalance">,
  transactions: BankTransaction[],
): number {
  let balance = account.openingBalance;
  for (const t of transactions) {
    if (t.bankAccountId !== account.id) continue;
    balance += t.type === "deposit" ? t.amount : -t.amount;
  }
  return balance;
}
