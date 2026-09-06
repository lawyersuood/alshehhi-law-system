// ============================================================
// الفواتير المجدولة (Recurring Invoices) — قسم المبيعات
// قالب فوترة متكرر (اشتراك شهري/ربعي/سنوي مثلاً) يُنشئ فاتورة بيع جديدة كل دورة
// بنفس البنود دون إعادة إدخالها يدوياً، مع تتبع كل الفواتير التي تم توليدها منه.
// ============================================================

import { InvoiceLineItem } from "./salesTypes";

export type RecurringFrequency = "monthly" | "quarterly" | "yearly";

export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  monthly: "شهرياً",
  quarterly: "كل 3 أشهر",
  yearly: "سنوياً",
};

export type RecurringInvoiceStatus = "active" | "paused" | "cancelled";

export const RECURRING_STATUS_LABELS: Record<RecurringInvoiceStatus, string> = {
  active: "نشط",
  paused: "متوقف مؤقتاً",
  cancelled: "ملغى",
};

export interface RecurringInvoiceTemplate {
  id: string;
  templateNumber: string; // REC-YYYY-XXXX
  clientName: string;
  placeOfSupply: string;
  lines: InvoiceLineItem[];
  notes?: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextRunDate: string;
  status: RecurringInvoiceStatus;
  generatedInvoiceIds: string[];
  lastGeneratedAt?: string;
  createdAt: string;
  createdBy?: string;
}

export const RECURRING_LS_KEYS = {
  templates: "firm_accounting_recurring_invoices_v1",
};

export function addFrequency(dateStr: string, frequency: RecurringFrequency): string {
  const d = new Date(dateStr + "T00:00:00");
  if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "quarterly") d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
