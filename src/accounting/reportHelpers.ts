// ============================================================
// النظام المحاسبي المتكامل — المرحلة الخامسة: التقارير المالية
// جميع هذه التقارير قراءات محسوبة من بيانات المراحل السابقة (القيود اليومية المرحّلة،
// الحسابات البنكية، فواتير المبيعات والمشتريات) — لا تخزّن أي بيانات خاصة بها في localStorage.
// معزول بالكامل، ولا يظهر إلا بعد تفعيل ACCOUNTING_MODULE_ENABLED في App.tsx.
// ============================================================

import { Account, AccountType, JournalEntry } from "./types";

export const isDebitNature = (type: AccountType) => type === "asset" || type === "expense";

export interface AccountMovement {
  debit: number;
  credit: number;
}

// إجمالي حركة المدين/الدائن على حساب معيّن ضمن القيود المرحّلة فقط، منذ البداية وحتى تاريخ معيّن (تراكمي)
export function accountBalanceAsOf(
  accountId: string,
  entries: JournalEntry[],
  asOfDate: string,
): AccountMovement {
  let debit = 0;
  let credit = 0;
  for (const e of entries) {
    if (e.status !== "posted") continue;
    if (e.date > asOfDate) continue;
    for (const l of e.lines) {
      if (l.accountId !== accountId) continue;
      debit += l.debit || 0;
      credit += l.credit || 0;
    }
  }
  return { debit, credit };
}

// إجمالي حركة المدين/الدائن على حساب معيّن ضمن القيود المرحّلة فقط، خلال فترة محددة (من - إلى)
export function accountMovementInRange(
  accountId: string,
  entries: JournalEntry[],
  fromDate: string,
  toDate: string,
): AccountMovement {
  let debit = 0;
  let credit = 0;
  for (const e of entries) {
    if (e.status !== "posted") continue;
    if (e.date < fromDate || e.date > toDate) continue;
    for (const l of e.lines) {
      if (l.accountId !== accountId) continue;
      debit += l.debit || 0;
      credit += l.credit || 0;
    }
  }
  return { debit, credit };
}

// صافي رصيد الحساب بحسب طبيعته المحاسبية (مدين أو دائن) من حركة معينة
export function netBalance(type: AccountType, mv: AccountMovement): number {
  return isDebitNature(type) ? mv.debit - mv.credit : mv.credit - mv.debit;
}

// فترة افتراضية: من بداية السنة الحالية حتى اليوم
export function defaultPeriod(): { from: string; to: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-01-01`;
  const to = now.toISOString().slice(0, 10);
  return { from, to };
}

// تصنيف عمر الذمم إلى شرائح زمنية بحسب عدد أيام التأخير عن تاريخ الاستحقاق
export type AgingBucket = "current" | "d1_30" | "d31_60" | "d61_90" | "d90_plus";

export const AGING_BUCKET_LABELS: Record<AgingBucket, string> = {
  current: "غير مستحقة بعد",
  d1_30: "1 - 30 يوم",
  d31_60: "31 - 60 يوم",
  d61_90: "61 - 90 يوم",
  d90_plus: "أكثر من 90 يوم",
};

export function agingBucketFor(dueDateOrDate: string, asOf: string): AgingBucket {
  const due = new Date(dueDateOrDate + "T00:00:00").getTime();
  const ref = new Date(asOf + "T00:00:00").getTime();
  const daysOverdue = Math.floor((ref - due) / (1000 * 60 * 60 * 24));
  if (daysOverdue <= 0) return "current";
  if (daysOverdue <= 30) return "d1_30";
  if (daysOverdue <= 60) return "d31_60";
  if (daysOverdue <= 90) return "d61_90";
  return "d90_plus";
}

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export function fmtDateLabel(d: string): string {
  return d
    ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
}
