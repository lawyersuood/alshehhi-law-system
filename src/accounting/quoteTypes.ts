// ============================================================
// عروض الأسعار والأتعاب (Sales Quotes / Fee Proposals)
// عرض أتعاب أو نطاق خدمة قانونية يُرسل للعميل قبل فتح القضية أو إصدار فاتورة رسمية.
// عند موافقة العميل يتحول العرض مباشرة لفاتورة بيع (SalesInvoice) بنفس بنوده دون
// إعادة إدخالها. لا يُنشئ عرض السعر أي قيد محاسبي بحد ذاته — فقط الفاتورة الناتجة عنه.
// ============================================================

import { InvoiceLineItem } from "./salesTypes";

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "converted";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "مسودة",
  sent: "مرسل للعميل",
  accepted: "موافق عليه",
  declined: "مرفوض",
  converted: "تم تحويله لفاتورة",
};

export interface SalesQuote {
  id: string;
  quoteNumber: string; // QUO-YYYY-XXXX
  date: string; // YYYY-MM-DD
  expiryDate?: string; // تاريخ انتهاء صلاحية العرض
  clientName: string;
  caseSubject?: string; // موضوع القضية / الخدمة القانونية المطلوبة
  lines: InvoiceLineItem[];
  notes?: string;
  status: QuoteStatus;
  convertedInvoiceId?: string;
  createdAt: string;
  createdBy?: string;
}

export const QUOTE_LS_KEYS = {
  quotes: "firm_accounting_sales_quotes_v1",
};
