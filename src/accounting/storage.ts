import { Account, JournalEntry, LS_KEYS } from "./types";
import { DEFAULT_CHART_OF_ACCOUNTS } from "./seedAccounts";
import { BankAccount, BankTransaction, BANK_LS_KEYS } from "./bankTypes";
import { SalesInvoice, SalesPayment, SALES_LS_KEYS } from "./salesTypes";
import { Vendor, PurchaseInvoice, PurchasePayment, PURCHASE_LS_KEYS } from "./purchaseTypes";
import { FixedAsset, DepreciationRun, FIXED_ASSET_LS_KEYS } from "./fixedAssetTypes";
import { PayrollEmployee, PayrollRun, Payslip, PAYROLL_LS_KEYS } from "./payrollTypes";
import { SalesQuote, QUOTE_LS_KEYS } from "./quoteTypes";
import { CashExpense, CASH_EXPENSE_LS_KEYS } from "./cashExpenseTypes";
import { CreditNote, CREDIT_NOTE_LS_KEYS } from "./creditNoteTypes";
import { DebitNote, DEBIT_NOTE_LS_KEYS } from "./debitNoteTypes";
import { PurchaseOrder, PURCHASE_ORDER_LS_KEYS } from "./purchaseOrderTypes";
import { RecurringInvoiceTemplate, RECURRING_LS_KEYS } from "./recurringInvoiceTypes";

export function loadAccountingStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveAccountingStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Accounting storage save error:", e);
  }
}

export function loadAccounts(): Account[] {
  return loadAccountingStorage<Account[]>(LS_KEYS.accounts, DEFAULT_CHART_OF_ACCOUNTS);
}

export function loadJournalEntries(): JournalEntry[] {
  return loadAccountingStorage<JournalEntry[]>(LS_KEYS.journalEntries, []);
}

export function loadBankAccounts(): BankAccount[] {
  return loadAccountingStorage<BankAccount[]>(BANK_LS_KEYS.bankAccounts, []);
}

export function loadBankTransactions(): BankTransaction[] {
  return loadAccountingStorage<BankTransaction[]>(BANK_LS_KEYS.bankTransactions, []);
}

export function loadSalesInvoices(): SalesInvoice[] {
  return loadAccountingStorage<SalesInvoice[]>(SALES_LS_KEYS.invoices, []);
}

export function loadSalesPayments(): SalesPayment[] {
  return loadAccountingStorage<SalesPayment[]>(SALES_LS_KEYS.payments, []);
}

export function loadVendors(): Vendor[] {
  return loadAccountingStorage<Vendor[]>(PURCHASE_LS_KEYS.vendors, []);
}

export function loadPurchaseInvoices(): PurchaseInvoice[] {
  return loadAccountingStorage<PurchaseInvoice[]>(PURCHASE_LS_KEYS.invoices, []);
}

export function loadPurchasePayments(): PurchasePayment[] {
  return loadAccountingStorage<PurchasePayment[]>(PURCHASE_LS_KEYS.payments, []);
}

export function loadFixedAssets(): FixedAsset[] {
  return loadAccountingStorage<FixedAsset[]>(FIXED_ASSET_LS_KEYS.assets, []);
}

export function loadDepreciationRuns(): DepreciationRun[] {
  return loadAccountingStorage<DepreciationRun[]>(FIXED_ASSET_LS_KEYS.depreciationRuns, []);
}

export function loadPayrollEmployees(): PayrollEmployee[] {
  return loadAccountingStorage<PayrollEmployee[]>(PAYROLL_LS_KEYS.employees, []);
}

export function loadPayrollRuns(): PayrollRun[] {
  return loadAccountingStorage<PayrollRun[]>(PAYROLL_LS_KEYS.runs, []);
}

export function loadPayslips(): Payslip[] {
  return loadAccountingStorage<Payslip[]>(PAYROLL_LS_KEYS.payslips, []);
}

export function loadSalesQuotes(): SalesQuote[] {
  return loadAccountingStorage<SalesQuote[]>(QUOTE_LS_KEYS.quotes, []);
}

export function loadCashExpenses(): CashExpense[] {
  return loadAccountingStorage<CashExpense[]>(CASH_EXPENSE_LS_KEYS.expenses, []);
}

export function loadCreditNotes(): CreditNote[] {
  return loadAccountingStorage<CreditNote[]>(CREDIT_NOTE_LS_KEYS.creditNotes, []);
}

export function loadDebitNotes(): DebitNote[] {
  return loadAccountingStorage<DebitNote[]>(DEBIT_NOTE_LS_KEYS.debitNotes, []);
}

export function loadPurchaseOrders(): PurchaseOrder[] {
  return loadAccountingStorage<PurchaseOrder[]>(PURCHASE_ORDER_LS_KEYS.orders, []);
}

export function loadRecurringInvoiceTemplates(): RecurringInvoiceTemplate[] {
  return loadAccountingStorage<RecurringInvoiceTemplate[]>(RECURRING_LS_KEYS.templates, []);
}

// توليد رقم قيد تسلسلي بصيغة JE-YYYY-XXXX بحسب السنة الحالية
export function nextEntryNumber(existing: JournalEntry[]): string {
  const year = new Date().getFullYear();
  const prefix = `JE-${year}-`;
  let max = 0;
  for (const e of existing) {
    if (e.entryNumber?.startsWith(prefix)) {
      const n = parseInt(e.entryNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

// توليد رقم فاتورة تسلسلي بصيغة INV-YYYY-XXXX بحسب السنة الحالية
export function nextInvoiceNumber(existing: SalesInvoice[]): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  let max = 0;
  for (const inv of existing) {
    if (inv.invoiceNumber?.startsWith(prefix)) {
      const n = parseInt(inv.invoiceNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

// توليد رقم فاتورة مشتريات داخلي تسلسلي بصيغة BILL-YYYY-XXXX بحسب السنة الحالية
export function nextBillNumber(existing: PurchaseInvoice[]): string {
  const year = new Date().getFullYear();
  const prefix = `BILL-${year}-`;
  let max = 0;
  for (const b of existing) {
    if (b.billNumber?.startsWith(prefix)) {
      const n = parseInt(b.billNumber.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
