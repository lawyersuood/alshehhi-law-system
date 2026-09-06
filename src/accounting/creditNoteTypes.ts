// ============================================================
// إشعارات دائنة (Credit Notes) — قسم المبيعات
// لتصحيح أو تخفيض قيمة فاتورة بيع صادرة سابقاً (خصم على أتعاب، تراجع عن بند) دون حذف
// الفاتورة الأصلية. عند الاعتماد يُنشئ قيداً محاسبياً عكسياً يخفّض ذمم العملاء المدينة.
// ============================================================

import { InvoiceLineItem } from "./salesTypes";

export type CreditNoteStatus = "draft" | "approved" | "cancelled";

export interface CreditNote {
  id: string;
  creditNoteNumber: string; // CN-YYYY-XXXX
  date: string;
  clientName: string;
  relatedInvoiceId?: string; // الفاتورة الأصلية المرتبطة (اختياري)
  lines: InvoiceLineItem[];
  notes?: string;
  status: CreditNoteStatus;
  journalEntryId?: string;
  createdAt: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export const CREDIT_NOTE_LS_KEYS = {
  creditNotes: "firm_accounting_credit_notes_v1",
};
