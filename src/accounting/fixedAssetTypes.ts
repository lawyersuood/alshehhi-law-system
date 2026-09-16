// ============================================================
// النظام المحاسبي المتكامل — المرحلة السادسة: الأصول الثابتة
// معزول بالكامل، ولا يظهر إلا بعد تفعيل ACCOUNTING_MODULE_ENABLED في App.tsx
// ============================================================

export const ACCUMULATED_DEPRECIATION_ACCOUNT_CODE = "122"; // مجمع إهلاك الأصول الثابتة (حساب مقابل)
export const DEPRECIATION_EXPENSE_ACCOUNT_CODE = "5330"; // مصاريف الإهلاك (استهلاك الأصول الثابتة)

export const ASSET_CATEGORIES = [
  "أثاث وتجهيزات مكتبية",
  "أجهزة حاسب آلي ومعدات تقنية",
  "سيارات",
  "أخرى",
];

export type DepreciationMethod = "straight_line";

export type FixedAssetStatus = "active" | "disposed";

export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  assetAccountId: string; // الحساب في شجرة الحسابات الذي يمثل تكلفة هذا الأصل (من نوع أصول)
  accumulatedDepreciationAccountId: string; // حساب مجمع الإهلاك المقابل (من نوع أصول)
  depreciationExpenseAccountId: string; // حساب مصروف الإهلاك (من نوع مصروفات)
  cost: number; // تكلفة الشراء
  purchaseDate: string; // YYYY-MM-DD
  usefulLifeYears: number; // العمر الإنتاجي بالسنوات
  salvageValue: number; // القيمة التخريدية المتبقية بعد نهاية العمر الإنتاجي
  depreciationMethod: DepreciationMethod;
  status: FixedAssetStatus;
  notes?: string;
  createdAt: string;
  createdBy?: string;
  disposedAt?: string;
}

// سجل كل عملية توليد قيد إهلاك دوري لأصل معيّن، لمنع احتساب إهلاك مزدوج لنفس الفترة
export interface DepreciationRun {
  id: string;
  assetId: string;
  periodLabel: string; // بصيغة YYYY-MM
  date: string; // YYYY-MM-DD
  amount: number;
  journalEntryId: string;
  createdAt: string;
  createdBy?: string;
}

export const FIXED_ASSET_LS_KEYS = {
  assets: "firm_accounting_fixed_assets_v1",
  depreciationRuns: "firm_accounting_depreciation_runs_v1",
};

// إهلاك شهري بطريقة القسط الثابت = (التكلفة - القيمة التخريدية) ÷ (العمر الإنتاجي بالسنوات × 12)
export function monthlyDepreciation(
  asset: Pick<FixedAsset, "cost" | "salvageValue" | "usefulLifeYears">,
): number {
  const months = (Number(asset.usefulLifeYears) || 0) * 12;
  if (months <= 0) return 0;
  const depreciable = Math.max((Number(asset.cost) || 0) - (Number(asset.salvageValue) || 0), 0);
  return depreciable / months;
}

// إجمالي الإهلاك المتراكم المسجّل فعلياً لأصل معيّن حتى الآن
export function accumulatedDepreciationSoFar(assetId: string, runs: DepreciationRun[]): number {
  return runs.filter((r) => r.assetId === assetId).reduce((sum, r) => sum + r.amount, 0);
}

// صافي القيمة الدفترية = التكلفة - الإهلاك المتراكم، بحد أدنى القيمة التخريدية
export function netBookValue(
  asset: Pick<FixedAsset, "cost" | "salvageValue" | "id">,
  runs: DepreciationRun[],
): number {
  const accumulated = accumulatedDepreciationSoFar(asset.id, runs);
  return Math.max(asset.cost - accumulated, asset.salvageValue);
}

export function hasRunForPeriod(
  assetId: string,
  periodLabel: string,
  runs: DepreciationRun[],
): boolean {
  return runs.some((r) => r.assetId === assetId && r.periodLabel === periodLabel);
}

// الفترة الحالية بصيغة YYYY-MM
export function currentPeriodLabel(): string {
  return new Date().toISOString().slice(0, 7);
}
