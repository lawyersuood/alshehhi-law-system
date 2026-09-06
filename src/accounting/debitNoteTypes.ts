// ============================================================
// إشعارات مدينة (Debit Notes) — قسم المشتريات
// عكس الإشعار الدائن — لتصحيح أو تخفيض قيمة فاتورة مشتريات مستلمة من مورد دون حذفها.
// عند الاعتماد يُنشئ قيداً محاسبياً عكسياً يخفّض ذمم الموردين الدائنة.
// ============================================================

import { PurchaseLineItem } from "./purchaseTypes";

export type DebitNoteStatus = "draft" | "approved" | "cancelled";

export interface DebitNote {
  id: string;
  debitNoteNumber: string; // DN-YYYY-XXXX
  date: string;
  vendorId: string;
  relatedBillId?: string; // فاتورة المشتريات الأصلية المرتبطة (اختياري)
  lines: PurchaseLineItem[];
  notes?: string;
  status: DebitNoteStatus;
  journalEntryId?: string;
  createdAt: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export const DEBIT_NOTE_LS_KEYS = {
  debitNotes: "firm_accounting_debit_notes_v1",
};
