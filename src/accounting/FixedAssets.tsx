import React, { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, AlertTriangle, Archive, PlayCircle, Boxes } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { nextEntryNumber } from "./storage";
import {
  FixedAsset,
  DepreciationRun,
  ASSET_CATEGORIES,
  ACCUMULATED_DEPRECIATION_ACCOUNT_CODE,
  DEPRECIATION_EXPENSE_ACCOUNT_CODE,
  monthlyDepreciation,
  accumulatedDepreciationSoFar,
  netBookValue,
  hasRunForPeriod,
  currentPeriodLabel,
} from "./fixedAssetTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const fmtDateLabel = (d: string) => (d ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }) : "—");

const fmtPeriodLabel = (p: string) => {
  if (!p) return "—";
  const [y, m] = p.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("ar-AE", { year: "numeric", month: "long" });
};

interface FormState {
  id?: string;
  name: string;
  category: string;
  assetAccountId: string;
  accumulatedDepreciationAccountId: string;
  depreciationExpenseAccountId: string;
  cost: string;
  purchaseDate: string;
  usefulLifeYears: string;
  salvageValue: string;
  notes: string;
}

function emptyForm(defaults: { accDepId: string; expId: string }): FormState {
  return {
    name: "",
    category: ASSET_CATEGORIES[0],
    assetAccountId: "",
    accumulatedDepreciationAccountId: defaults.accDepId,
    depreciationExpenseAccountId: defaults.expId,
    cost: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    usefulLifeYears: "5",
    salvageValue: "0",
    notes: "",
  };
}

export default function FixedAssets({
  accounts,
  assets,
  setAssets,
  depreciationRuns,
  setDepreciationRuns,
  entries,
  setEntries,
  canManage,
  canRunDepreciation,
  canDelete,
  currentUserName,
}: {
  accounts: Account[];
  assets: FixedAsset[];
  setAssets: React.Dispatch<React.SetStateAction<FixedAsset[]>>;
  depreciationRuns: DepreciationRun[];
  setDepreciationRuns: React.Dispatch<React.SetStateAction<DepreciationRun[]>>;
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canManage: boolean;
  canRunDepreciation: boolean;
  canDelete: boolean;
  currentUserName?: string;
}) {
  const assetTypeAccounts = useMemo(() => accounts.filter((a) => a.isActive && a.type === "asset").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const expenseTypeAccounts = useMemo(() => accounts.filter((a) => a.isActive && a.type === "expense").sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
  const defaultAccDepAccount = useMemo(() => accounts.find((a) => a.code === ACCUMULATED_DEPRECIATION_ACCOUNT_CODE), [accounts]);
  const defaultExpAccount = useMemo(() => accounts.find((a) => a.code === DEPRECIATION_EXPENSE_ACCOUNT_CODE), [accounts]);

  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDisposeId, setConfirmDisposeId] = useState<string | null>(null);
  const [period, setPeriod] = useState(currentPeriodLabel());
  const [runError, setRunError] = useState("");

  const openNew = () => {
    setError("");
    setForm(emptyForm({ accDepId: defaultAccDepAccount?.id || "", expId: defaultExpAccount?.id || "" }));
  };

  const openEdit = (a: FixedAsset) => {
    setError("");
    setForm({
      id: a.id,
      name: a.name,
      category: a.category,
      assetAccountId: a.assetAccountId,
      accumulatedDepreciationAccountId: a.accumulatedDepreciationAccountId,
      depreciationExpenseAccountId: a.depreciationExpenseAccountId,
      cost: String(a.cost),
      purchaseDate: a.purchaseDate,
      usefulLifeYears: String(a.usefulLifeYears),
      salvageValue: String(a.salvageValue),
      notes: a.notes || "",
    });
  };

  const saveForm = () => {
    if (!form) return;
    if (!form.name.trim()) {
      setError("يرجى إدخال اسم الأصل");
      return;
    }
    if (!form.assetAccountId || !form.accumulatedDepreciationAccountId || !form.depreciationExpenseAccountId) {
      setError("يرجى اختيار حساب الأصل وحساب مجمع الإهلاك وحساب مصروف الإهلاك");
      return;
    }
    const cost = Number(form.cost);
    const usefulLifeYears = Number(form.usefulLifeYears);
    const salvageValue = Number(form.salvageValue) || 0;
    if (!cost || cost <= 0) {
      setError("يرجى إدخال تكلفة صحيحة أكبر من صفر");
      return;
    }
    if (!usefulLifeYears || usefulLifeYears <= 0) {
      setError("يرجى إدخال عمر إنتاجي صحيح بالسنوات");
      return;
    }
    if (salvageValue >= cost) {
      setError("يجب أن تكون القيمة التخريدية أقل من تكلفة الأصل");
      return;
    }
    if (form.id) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === form.id
            ? {
                ...a,
                name: form.name.trim(),
                category: form.category,
                assetAccountId: form.assetAccountId,
                accumulatedDepreciationAccountId: form.accumulatedDepreciationAccountId,
                depreciationExpenseAccountId: form.depreciationExpenseAccountId,
                cost,
                purchaseDate: form.purchaseDate,
                usefulLifeYears,
                salvageValue,
                notes: form.notes.trim() || undefined,
              }
            : a
        )
      );
    } else {
      setAssets((prev) => [
        ...prev,
        {
          id: `fa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: form.name.trim(),
          category: form.category,
          assetAccountId: form.assetAccountId,
          accumulatedDepreciationAccountId: form.accumulatedDepreciationAccountId,
          depreciationExpenseAccountId: form.depreciationExpenseAccountId,
          cost,
          purchaseDate: form.purchaseDate,
          usefulLifeYears,
          salvageValue,
          depreciationMethod: "straight_line",
          status: "active",
          notes: form.notes.trim() || undefined,
          createdAt: new Date().toISOString(),
          createdBy: currentUserName,
        },
      ]);
    }
    setForm(null);
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDeleteAsset = () => {
    if (!confirmDeleteId) return;
    setAssets((prev) => prev.filter((a) => a.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const requestDispose = (id: string) => setConfirmDisposeId(id);
  const confirmDispose = () => {
    if (!confirmDisposeId) return;
    setAssets((prev) => prev.map((a) => (a.id === confirmDisposeId ? { ...a, status: "disposed", disposedAt: new Date().toISOString() } : a)));
    setConfirmDisposeId(null);
  };

  const deletingAsset = assets.find((a) => a.id === confirmDeleteId);
  const disposingAsset = assets.find((a) => a.id === confirmDisposeId);
  const canDeleteAsset = (a: FixedAsset) => accumulatedDepreciationSoFar(a.id, depreciationRuns) === 0;

  // الأصول المؤهلة للإهلاك في الفترة المختارة: أصول فعّالة، لم يُنفَّذ لها إهلاك في هذه الفترة، ولم تصل بعد لقيمتها التخريدية
  const eligibleForRun = useMemo(
    () =>
      assets
        .filter((a) => a.status === "active")
        .filter((a) => !hasRunForPeriod(a.id, period, depreciationRuns))
        .map((a) => ({ asset: a, amount: monthlyDepreciation(a), nbv: netBookValue(a, depreciationRuns) }))
        .filter((r) => r.nbv > r.asset.salvageValue + 0.005 && r.amount > 0.005),
    [assets, depreciationRuns, period]
  );

  const runDepreciation = () => {
    setRunError("");
    if (eligibleForRun.length === 0) {
      setRunError("لا توجد أصول مؤهلة لتوليد قيد إهلاك عن هذه الفترة");
      return;
    }
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const expenseByAccount = new Map<string, number>();
    const accDepByAccount = new Map<string, number>();
    for (const { asset, amount } of eligibleForRun) {
      expenseByAccount.set(asset.depreciationExpenseAccountId, (expenseByAccount.get(asset.depreciationExpenseAccountId) || 0) + amount);
      accDepByAccount.set(
        asset.accumulatedDepreciationAccountId,
        (accDepByAccount.get(asset.accumulatedDepreciationAccountId) || 0) + amount
      );
    }
    const lines = [
      ...Array.from(expenseByAccount.entries()).map(([accountId, amount], idx) => ({
        id: `l-${journalEntryId}-exp-${idx}`,
        accountId,
        debit: amount,
        credit: 0,
      })),
      ...Array.from(accDepByAccount.entries()).map(([accountId, amount], idx) => ({
        id: `l-${journalEntryId}-accdep-${idx}`,
        accountId,
        debit: 0,
        credit: amount,
      })),
    ];
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: new Date().toISOString().slice(0, 10),
      description: `قيد إهلاك دوري عن فترة ${fmtPeriodLabel(period)} — ${eligibleForRun.length} أصل`,
      reference: period,
      lines,
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    const newRuns: DepreciationRun[] = eligibleForRun.map(({ asset, amount }) => ({
      id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${asset.id}`,
      assetId: asset.id,
      periodLabel: period,
      date: newEntry.date,
      amount,
      journalEntryId,
      createdAt: now,
      createdBy: currentUserName,
    }));
    setEntries((prev) => [...prev, newEntry]);
    setDepreciationRuns((prev) => [...prev, ...newRuns]);
  };

  const pastRunsByPeriod = useMemo(() => {
    const byPeriod = new Map<string, { count: number; total: number; journalEntryId: string }>();
    for (const r of depreciationRuns) {
      const cur = byPeriod.get(r.periodLabel) || { count: 0, total: 0, journalEntryId: r.journalEntryId };
      cur.count += 1;
      cur.total += r.amount;
      byPeriod.set(r.periodLabel, cur);
    }
    return Array.from(byPeriod.entries())
      .map(([periodLabel, v]) => ({ periodLabel, ...v }))
      .sort((a, b) => (a.periodLabel < b.periodLabel ? 1 : -1));
  }, [depreciationRuns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">الأصول الثابتة</h2>
          <p className="text-xs text-slate-500">سجل أصول المكتب (أثاث، أجهزة، سيارات) وإهلاكها الدوري — {assets.length} أصل مسجّل</p>
        </div>
        {canManage && (
          <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]">
            <Plus size={16} /> إضافة أصل جديد
          </button>
        )}
      </div>

      {(!defaultAccDepAccount || !defaultExpAccount) && (
        <div className="flex items-center gap-2 rounded-xl bg-[#0D382B]/[0.05] border border-[#0D382B]/15 px-4 py-3 text-xs text-[#0D382B]">
          <AlertTriangle size={15} />
          تنبيه: لم يتم العثور على حساب "مجمع إهلاك الأصول الثابتة" ({ACCUMULATED_DEPRECIATION_ACCOUNT_CODE}) أو حساب "استهلاك الأصول الثابتة" (
          {DEPRECIATION_EXPENSE_ACCOUNT_CODE}) في شجرة الحسابات — يمكن اختيار حسابات بديلة يدوياً عند إضافة كل أصل.
        </div>
      )}

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">الأصل</th>
                <th className="px-4 py-2.5 font-semibold">الفئة</th>
                <th className="px-4 py-2.5 font-semibold">تاريخ الشراء</th>
                <th className="px-4 py-2.5 font-semibold">التكلفة</th>
                <th className="px-4 py-2.5 font-semibold">الإهلاك الشهري</th>
                <th className="px-4 py-2.5 font-semibold">الإهلاك المتراكم</th>
                <th className="px-4 py-2.5 font-semibold">صافي القيمة الدفترية</th>
                <th className="px-4 py-2.5 font-semibold">الحالة</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => {
                const accumulated = accumulatedDepreciationSoFar(a.id, depreciationRuns);
                const nbv = netBookValue(a, depreciationRuns);
                return (
                  <tr key={a.id} className={`border-b border-slate-50 last:border-0 ${a.status === "disposed" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-2.5 text-slate-800 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Boxes size={13} className="text-slate-400" /> {a.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{a.category}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{fmtDateLabel(a.purchaseDate)}</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(a.cost)}</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(monthlyDepreciation(a))}</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(accumulated)}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold">{fmtMoney(nbv)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          a.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {a.status === "active" ? "فعّال" : "مستبعد"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        {canManage && a.status === "active" && (
                          <button onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-[#0D382B] rounded-lg hover:bg-[#0D382B]/[0.06]">
                            <Pencil size={14} />
                          </button>
                        )}
                        {canManage && a.status === "active" && (
                          <button onClick={() => requestDispose(a.id)} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100" title="استبعاد الأصل">
                            <Archive size={14} />
                          </button>
                        )}
                        {canDelete && canDeleteAsset(a) && (
                          <button onClick={() => requestDelete(a.id)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد أصول ثابتة مسجّلة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="app-card p-5 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">توليد قيد الإهلاك الدوري</h3>
            <p className="text-xs text-slate-500">يُنشئ قيداً واحداً مرحّلاً تلقائياً يجمّع إهلاك كل الأصول المؤهلة عن الفترة المختارة</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">الفترة (شهر)</label>
            <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls} />
          </div>
        </div>

        {runError && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            <AlertTriangle size={14} /> {runError}
          </div>
        )}

        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 bg-slate-50/70">
                <th className="px-3 py-2 text-right font-semibold">الأصل</th>
                <th className="px-3 py-2 text-right font-semibold">مبلغ إهلاك هذه الفترة</th>
              </tr>
            </thead>
            <tbody>
              {eligibleForRun.map(({ asset, amount }) => (
                <tr key={asset.id} className="border-t border-slate-50">
                  <td className="px-3 py-2">{asset.name}</td>
                  <td className="px-3 py-2 font-mono">{fmtMoney(amount)}</td>
                </tr>
              ))}
              {eligibleForRun.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-4 text-center text-xs text-slate-500">
                    لا توجد أصول مؤهلة لتوليد إهلاك عن هذه الفترة (إمّا تم تنفيذها مسبقاً أو انتهى عمرها الإنتاجي)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {canRunDepreciation && (
          <button
            onClick={runDepreciation}
            disabled={eligibleForRun.length === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm disabled:opacity-40"
          >
            <PlayCircle size={16} /> توليد قيد الإهلاك وترحيله ({eligibleForRun.length} أصل)
          </button>
        )}
      </div>

      {pastRunsByPeriod.length > 0 && (
        <div className="app-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <p className="text-xs font-semibold text-slate-500">سجل قيود الإهلاك المنفّذة سابقاً</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-xs text-slate-500 border-b border-slate-100">
                  <th className="px-4 py-2.5 font-semibold">الفترة</th>
                  <th className="px-4 py-2.5 font-semibold">عدد الأصول</th>
                  <th className="px-4 py-2.5 font-semibold">إجمالي مبلغ الإهلاك</th>
                </tr>
              </thead>
              <tbody>
                {pastRunsByPeriod.map((r) => (
                  <tr key={r.periodLabel} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 text-slate-800">{fmtPeriodLabel(r.periodLabel)}</td>
                    <td className="px-4 py-2.5 font-mono">{r.count}</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{form.id ? "تعديل بيانات الأصل" : "إضافة أصل جديد"}</h3>
              <button onClick={() => setForm(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم الأصل</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">الفئة</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {ASSET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">تاريخ الشراء</label>
                <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">التكلفة</label>
                <input type="number" min={0} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className={inputCls + " font-mono"} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">العمر الإنتاجي (سنوات)</label>
                <input
                  type="number"
                  min={1}
                  value={form.usefulLifeYears}
                  onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })}
                  className={inputCls + " font-mono"}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">القيمة التخريدية</label>
                <input type="number" min={0} value={form.salvageValue} onChange={(e) => setForm({ ...form, salvageValue: e.target.value })} className={inputCls + " font-mono"} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">حساب الأصل (شجرة الحسابات)</label>
              <select value={form.assetAccountId} onChange={(e) => setForm({ ...form, assetAccountId: e.target.value })} className={inputCls}>
                <option value="">اختر…</option>
                {assetTypeAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">حساب مجمع الإهلاك</label>
                <select
                  value={form.accumulatedDepreciationAccountId}
                  onChange={(e) => setForm({ ...form, accumulatedDepreciationAccountId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">اختر…</option>
                  {assetTypeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">حساب مصروف الإهلاك</label>
                <select
                  value={form.depreciationExpenseAccountId}
                  onChange={(e) => setForm({ ...form, depreciationExpenseAccountId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">اختر…</option>
                  {expenseTypeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">ملاحظات (اختياري)</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                إلغاء
              </button>
              <button onClick={saveForm} className="px-4 py-2 text-sm font-semibold text-white bg-[#0D382B] hover:bg-[#124d40] transition-colors rounded-xl">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && deletingAsset && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد حذف الأصل</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من حذف الأصل <span className="font-bold">{deletingAsset.name}</span>؟
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                إلغاء
              </button>
              <button onClick={confirmDeleteAsset} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDisposeId && disposingAsset && (
        <div className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDisposeId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">تأكيد استبعاد الأصل</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من استبعاد الأصل <span className="font-bold">{disposingAsset.name}</span>؟ سيتوقف احتساب الإهلاك الدوري له بعد ذلك، وسيبقى في
              السجل للرجوع إليه فقط.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setConfirmDisposeId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                تراجع
              </button>
              <button onClick={confirmDispose} className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl">
                تأكيد الاستبعاد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
