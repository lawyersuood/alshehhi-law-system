// ============================================================
// النظام المحاسبي المتكامل — المرحلة الأولى: شجرة الحسابات والقيود اليومية
// ملاحظة: هذا النظام معزول بالكامل في ملفاته الخاصة، ولا يظهر أو يعمل في الموقع
// إلا بعد تفعيل العلم الرئيسي ACCOUNTING_MODULE_ENABLED في App.tsx بعد اكتمال جميع مراحله.
// ============================================================

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: "أصول",
  liability: "التزامات",
  equity: "حقوق الملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

// الترتيب المعتمد لعرض أنواع الحسابات في شجرة الحسابات والتقارير
export const ACCOUNT_TYPE_ORDER: AccountType[] = ["asset", "liability", "equity", "revenue", "expense"];

export interface Account {
  id: string;
  code: string; // الرقم المحاسبي، مثال: 1010
  name: string; // اسم الحساب بالعربية
  type: AccountType;
  parentId?: string | null; // لدعم الحسابات الفرعية
  isActive: boolean;
  isSystem?: boolean; // حسابات أساسية من الشجرة الافتراضية، تمنع من الحذف (يمكن تعطيلها فقط)
  isGroup?: boolean; // حساب تصنيف/رأس (غير قابل للترحيل إليه مباشرة)، يُستثنى من قوائم الاختيار
  notes?: string;
  createdAt: string;
}

// يُستخدم في كل قوائم اختيار الحسابات (Dropdowns) لاستبعاد حسابات التصنيف غير القابلة للترحيل
export function isPostable(a: Pick<Account, "isGroup" | "isActive">): boolean {
  return a.isActive && !a.isGroup;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: number; // مدين
  credit: number; // دائن
  description?: string;
}

export type JournalEntryStatus = "draft" | "posted";

export interface JournalEntry {
  id: string;
  entryNumber: string; // مثال: JE-2026-0001
  date: string; // YYYY-MM-DD
  description: string;
  reference?: string; // مرجع خارجي اختياري (رقم فاتورة، رقم شيك، إلخ)
  lines: JournalLine[];
  status: JournalEntryStatus;
  createdAt: string;
  createdBy?: string;
  postedAt?: string;
  postedBy?: string;
}

export const LS_KEYS = {
  // تم ترقية هذا المفتاح إلى v2 عمداً: المتصفح كان قد خزّن شجرة الحسابات الافتراضية القديمة
  // في localStorage من أول استخدام تجريبي، فتغيير الشجرة في الكود لا يظهر للمستخدم إطلاقاً
  // لأن loadAccounts() يقرأ من التخزين المحلي أولاً ولا يعود للقيمة الافتراضية الجديدة إلا إذا
  // كان المفتاح غير موجود. ترقية المفتاح تجبر المتصفح على تحميل شجرة وافق الجديدة من الصفر.
  accounts: "firm_accounting_accounts_v2",
  journalEntries: "firm_accounting_journal_entries_v1",
  entryCounter: "firm_accounting_entry_counter_v1",
};

// إجمالي المدين وإجمالي الدائن لقيد معيّن
export function entryTotals(entry: Pick<JournalEntry, "lines">): { totalDebit: number; totalCredit: number } {
  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of entry.lines) {
    totalDebit += Number(line.debit) || 0;
    totalCredit += Number(line.credit) || 0;
  }
  return { totalDebit, totalCredit };
}

// هل القيد متوازن (مدين = دائن) وصالح للترحيل
export function isEntryBalanced(entry: Pick<JournalEntry, "lines">): boolean {
  const { totalDebit, totalCredit } = entryTotals(entry);
  if (entry.lines.length < 2) return false;
  if (totalDebit <= 0) return false;
  // نسمح بفارق ضئيل جداً ناتج عن التقريب العشري
  return Math.abs(totalDebit - totalCredit) < 0.005;
}
