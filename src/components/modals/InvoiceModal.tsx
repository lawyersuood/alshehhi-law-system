import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { addDays, fmtAED } from "../../domain/utils";
import { VAT_RATE } from "../../domain/constants";
import type { CaseItem, Client } from "../../domain/types";

export interface InvoiceModalProps {
  clients: Client[];
  cases: CaseItem[];
  amount: string | number;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إصدار فاتورة ضريبية جديدة (VAT 5%)" — الخطوة التاسعة من تفكيك App.tsx التدريجي.
 */
export default function InvoiceModal({
  clients,
  cases,
  amount,
  onFieldChange,
  onSave,
  onClose,
}: InvoiceModalProps) {
  return (
    <Modal title="إصدار فاتورة ضريبية جديدة (VAT 5%)" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="الموكل">
          <select onChange={onFieldChange("clientId")} className={inputCls}>
            <option value="">اختر الموكل…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="القضية (اختياري)">
          <select onChange={onFieldChange("caseId")} className={inputCls}>
            <option value="">فاتورة استشارية عامة</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number}
              </option>
            ))}
          </select>
        </Field>
        <Field label="المبلغ الخاضع للضريبة (د.إ)">
          <input
            type="number"
            onChange={onFieldChange("amount")}
            placeholder="مثال: 10000"
            className={inputCls}
          />
        </Field>
        <p className="text-xs text-slate-500 bg-amber-50 p-2 rounded border border-amber-200">
          سيتم إضافة ضريبة القيمة المضافة 5% تلقائيًا وفق قوانين الهيئة الاتحادية للضرائب بمبلغ{" "}
          <b>{fmtAED((+amount || 0) * VAT_RATE)}</b> ليصل الإجمالي إلى{" "}
          <b>{fmtAED((+amount || 0) * 1.05)}</b>
        </p>
        <Field label="تاريخ الاستحقاق">
          <input
            type="date"
            onChange={onFieldChange("due")}
            defaultValue={addDays(30)}
            className={inputCls}
          />
        </Field>
        <Field label="بيان الفاتورة والخدمات القانونية">
          <textarea
            onChange={onFieldChange("desc")}
            rows={2}
            placeholder="دفعة أتعاب محاماة والاستشارات القانونية..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          إصدار الفاتورة الضريبية
        </button>
      </div>
    </Modal>
  );
}
