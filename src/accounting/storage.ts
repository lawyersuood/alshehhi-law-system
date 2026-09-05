import { Account, JournalEntry, LS_KEYS } from "./types";
import { DEFAULT_CHART_OF_ACCOUNTS } from "./seedAccounts";
import { BankAccount, BankTransaction, BANK_LS_KEYS } from "./bankTypes";
import { SalesInvoice, SalesPayment, SALES_LS_KEYS } from "./salesTypes";
import { Vendor, PurchaseInvoice, PurchasePayment, PURCHASE_LS_KEYS } from "./purchaseTypes";

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
