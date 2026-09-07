// ============================================================
// النظام المحاسبي المتكامل — المرحلة الثالثة: المبيعات وإعادة بناء الفوترة الضريبية
// نظام فوترة ضريبية جديد ومنفصل تماماً عن قسم "الفواتير والضريبة" الحالي المستخدم فعلياً
// في الموقع — لا يقرأ ولا يكتب في بيانات ذلك القسم إطلاقاً. معزول بالكامل، ولا يظهر
// إلا بعد تفعيل ACCOUNTING_MODULE_ENABLED في App.tsx.
// ============================================================

export const UAE_EMIRATES = ["أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"];

export const AR_ACCOUNT_CODE = "112"; // العملاء
export const VAT_OUTPUT_ACCOUNT_CODE = "218"; // ضريبة القيمة المضافة — مخرجات

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // نسبة مئوية، مثال: 5 أو 0
  accountId: string; // حساب الإيراد المرتبط بهذا البند من شجرة الحسابات
}

export type SalesInvoiceStatus = "draft" | "approved" | "cancelled";

export interface SalesInvoice {
  id: string;
  invoiceNumber: string; // تسلسلي: INV-YYYY-XXXX
  date: string; // YYYY-MM-DD
  dueDate?: string;
  clientName: string;
  clientTRN?: string; // الرقم الضريبي للعميل (اختياري)
  placeOfSupply: string; // الإمارة — حقل إلزامي حسب متطلبات الهيئة الاتحادية للضرائب
  lines: InvoiceLineItem[];
  notes?: string;
  status: SalesInvoiceStatus;
  journalEntryId?: string; // القيد التلقائي المُنشأ عند الاعتماد
  createdAt: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  cancelledAt?: string;
}

export interface SalesPayment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  receivingAccountId: string; // الحساب المقابل عند القبض (بنك أو صندوق من شجرة الحسابات)
  reference?: string;
  journalEntryId: string;
  createdAt: string;
  createdBy?: string;
}

export const SALES_LS_KEYS = {
  invoices: "firm_accounting_sales_invoices_v1",
  payments: "firm_accounting_sales_payments_v1",
};

export function lineNetAmount(line: Pick<InvoiceLineItem, "quantity" | "unitPrice">): number {
  return (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
}

export function lineVatAmount(line: Pick<InvoiceLineItem, "quantity" | "unitPrice" | "vatRate">): number {
  return (lineNetAmount(line) * (Number(line.vatRate) || 0)) / 100;
}

export interface InvoiceTotals {
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
}

export function invoiceTotals(invoice: Pick<SalesInvoice, "lines">): InvoiceTotals {
  let subtotal = 0;
  let vatTotal = 0;
  for (const l of invoice.lines) {
    subtotal += lineNetAmount(l);
    vatTotal += lineVatAmount(l);
  }
  return { subtotal, vatTotal, grandTotal: subtotal + vatTotal };
}

export function amountPaid(invoiceId: string, payments: SalesPayment[]): number {
  return payments.filter((p) => p.invoiceId === invoiceId).reduce((sum, p) => sum + p.amount, 0);
}

export function amountDue(invoice: Pick<SalesInvoice, "lines" | "id">, payments: SalesPayment[]): number {
  return invoiceTotals(invoice).grandTotal - amountPaid(invoice.id, payments);
}
