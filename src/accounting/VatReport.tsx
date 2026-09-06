import React, { useMemo, useState } from "react";
import { Percent, AlertTriangle } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { VAT_OUTPUT_ACCOUNT_CODE } from "./salesTypes";
import { VAT_INPUT_ACCOUNT_CODE } from "./purchaseTypes";
import { accountMovementInRange, defaultPeriod, fmtMoney } from "./reportHelpers";

export default function VatReport({ accounts, entries }: { accounts: Account[]; entries: JournalEntry[] }) {
  const initialPeriod = useMemo(() => defaultPeriod(), []);
  const [from, setFrom] = useState(initialPeriod.from);
  const [to, setTo] = useState(initialPeriod.to);

  const vatOutputAccount = useMemo(() => accounts.find((a) => a.code === VAT_OUTPUT_ACCOUNT_CODE), [accounts]);
  const vatInputAccount = useMemo(() => accounts.find((a) => a.code === VAT_INPUT_ACCOUNT_CODE), [accounts]);

  const { outputVat, inputVat } = useMemo(() => {
    // ضريبة المخرجات (على المبيعات) = صافي الحركة الدائنة على حساب ضريبة المخرجات خلال الفترة
    const outputVat = vatOutputAccount
      ? (() => {
          const mv = accountMovementInRange(vatOutputAccount.id, entries, from, to);
          return mv.credit - mv.debit;
        })()
      : 0;
    // ضريبة المدخلات القابلة للاسترداد (على المشتريات) = صافي الحركة المدينة على حساب ضريبة المدخلات خلال الفترة
    const inputVat = vatInputAccount
      ? (() => {
          const mv = accountMovementInRange(vatInputAccount.id, entries, from, to);
          return mv.debit - mv.credit;
        })()
      : 0;
    return { outputVat, inputVat };
  }, [vatOutputAccount, vatInputAccount, entries, from, to]);

  const netVat = outputVat - inputVat; // موجب = مستحق للهيئة، سالب = قابل للاسترداد منها

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">تقرير ضريبة القيمة المضافة</h2>
        <p className="text-xs text-slate-500">مرجع تمهيدي (ضريبة المخرجات − ضريبة المدخلات) لا يغني عن مراجعة الإقرار الضريبي الفعلي قبل تقديمه للهيئة الاتحادية للضرائب</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">من تاريخ</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">إلى تاريخ</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {(!vatOutputAccount || !vatInputAccount) && (
        <div className="flex items-center gap-2 rounded-xl bg-[#0D382B]/[0.05] border border-[#0D382B]/15 px-4 py-3 text-xs text-[#0D382B]">
          <AlertTriangle size={15} />
          تنبيه: لم يتم العثور على حساب ضريبة المخرجات ({VAT_OUTPUT_ACCOUNT_CODE}) أو ضريبة المدخلات ({VAT_INPUT_ACCOUNT_CODE}) في شجرة الحسابات — القيم
          المعروضة قد تكون غير مكتملة.
        </div>
      )}

      <div className="app-card overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-50">
              <td className="px-4 py-3 text-slate-800">ضريبة المخرجات (على المبيعات المعتمدة)</td>
              <td className="px-4 py-3 font-mono text-left">{fmtMoney(outputVat)}</td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="px-4 py-3 text-slate-800">ضريبة المدخلات القابلة للاسترداد (على المشتريات المعتمدة)</td>
              <td className="px-4 py-3 font-mono text-left">({fmtMoney(inputVat)})</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 font-bold text-slate-900">
              <td className="px-4 py-3">صافي الضريبة {netVat >= 0 ? "المستحقة للهيئة" : "القابلة للاسترداد منها"}</td>
              <td className="px-4 py-3 font-mono text-left">{fmtMoney(Math.abs(netVat))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-2xl px-5 py-4 flex items-center gap-2 bg-slate-50 text-slate-600 text-xs">
        <Percent size={15} />
        هذا التقرير يُحتسب آلياً من قيود الاعتماد على فواتير المبيعات والمشتريات ضمن هذا النظام المحاسبي المعزول فقط، ولا يشمل أي بيانات ضريبية من خارجه.
      </div>
    </div>
  );
}
