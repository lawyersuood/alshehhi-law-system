// ============================================================
// النظام المحاسبي المتكامل — المرحلة الرابعة: المشتريات والمصروفات
// الجانب المقابل لنظام المبيعات (المرحلة 3): سجل موردين وفواتير مشتريات/مصروفات
// معزول بالكامل، ولا يظهر إلا بعد تفعيل ACCOUNTING_MODULE_ENABLED في App.tsx
// ============================================================

export const AP_ACCOUNT_CODE = "211"; // الموردون
export const VAT_INPUT_ACCOUNT_CODE = "2110"; // ضريبة القيمة المضافة — مدخلات (قابلة للاسترداد)

export interface Vendor {
  id: string;
  name: string;
  trn?: string; // الرقم الضريبي للمورد
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PurchaseLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // نسبة مئوية
  accountId: string; // حساب المصروف المرتبط بهذا البند من شجرة الحسابات
}

export type PurchaseInvoiceStatus = "draft" | "approved" | "cancelled";

export interface PurchaseInvoice {
  id: string;
  billNumber: string; // رقم داخلي تسلسلي: BILL-YYYY-XXXX
  vendorInvoiceNumber?: string; // رقم فاتورة المورد الفعلي (مرجع اختياري)
  vendorId: string;
  date: string;
  dueDate?: string;
  lines: PurchaseLineItem[];
  notes?: string;
  status: PurchaseInvoiceStatus;
  journalEntryId?: string; // القيد التلقائي المُنشأ عند الاعتماد
  createdAt: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  cancelledAt?: string;
}

export interface PurchasePayment {
  id: string;
  billId: string;
  date: string;
  amount: number;
  payingAccountId: string; // الحساب الذي دُفع منه (بنك أو صندوق)
  reference?: string;
  journalEntryId: string;
  createdAt: string;
  createdBy?: string;
}

export const PURCHASE_LS_KEYS = {
  vendors: "firm_accounting_vendors_v1",
  invoices: "firm_accounting_purchase_invoices_v1",
  payments: "firm_accounting_purchase_payments_v1",
};

export function lineNetAmount(line: Pick<PurchaseLineItem, "quantity" | "unitPrice">): number {
  return (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
}

export function lineVatAmount(
  line: Pick<PurchaseLineItem, "quantity" | "unitPrice" | "vatRate">,
): number {
  return (lineNetAmount(line) * (Number(line.vatRate) || 0)) / 100;
}

export interface PurchaseTotals {
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
}

export function purchaseTotals(bill: Pick<PurchaseInvoice, "lines">): PurchaseTotals {
  let subtotal = 0;
  let vatTotal = 0;
  for (const l of bill.lines) {
    subtotal += lineNetAmount(l);
    vatTotal += lineVatAmount(l);
  }
  return { subtotal, vatTotal, grandTotal: subtotal + vatTotal };
}

export function amountPaid(billId: string, payments: PurchasePayment[]): number {
  return payments.filter((p) => p.billId === billId).reduce((sum, p) => sum + p.amount, 0);
}

export function amountDue(
  bill: Pick<PurchaseInvoice, "lines" | "id">,
  payments: PurchasePayment[],
): number {
  return purchaseTotals(bill).grandTotal - amountPaid(bill.id, payments);
}
