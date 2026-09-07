// ============================================================
// الفواتير النقدية (Cash Sales Invoices) — قسم المبيعات
// فاتورة تُسدَّد فوراً نقداً أو عبر البنك وقت إصدارها (مثال: أتعاب استشارة فورية،
// رسوم توثيق تُدفع في نفس المجلس) — بدون دورة استحقاق أو متابعة تحصيل لاحقة.
// عند الحفظ يُنشأ القيد المحاسبي فوراً (مدين: حساب القبض النقدي/البنكي، دائن:
// حسابات الإيراد + ضريبة القيمة المضافة المخرجات إن وجدت) دون خطوة اعتماد منفصلة.
// ============================================================

import { InvoiceLineItem } from "./salesTypes";

export interface CashSalesInvoice {
  id: string;
  invoiceNumber: string; // CSI-YYYY-XXXX
  date: string;
  clientName: string;
  placeOfSupply: string;
  lines: InvoiceLineItem[];
  receivedInAccountId: string; // حساب القبض (نقد أو بنك) من شجرة الحسابات
  notes?: string;
  journalEntryId: string;
  createdAt: string;
  createdBy?: string;
}

export const CASH_SALES_INVOICE_LS_KEYS = {
  invoices: "firm_accounting_cash_sales_invoices_v1",
};
