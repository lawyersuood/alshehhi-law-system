import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";
import type { CaseItem, Client } from "../../domain/types";

export interface TrustTransactionModalProps {
  clients: Client[];
  cases: CaseItem[];
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة معاملة حساب أمانات الموكل (Trust Account)" — الخطوة العاشرة من تفكيك App.tsx التدريجي.
 */
export default function TrustTransactionModal({
  clients,
  cases,
  onFieldChange,
  onSave,
  onClose,
}: TrustTransactionModalProps) {
  return (
    <Modal title="إضافة معاملة حساب أمانات الموكل (Trust Account)" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="الموكل صاحب الأمانة">
          <select onChange={onFieldChange("clientId")} className={inputCls}>
            <option value="">اختر الموكل…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="القضية المرتبطة (اختياري)">
          <select onChange={onFieldChange("caseId")} className={inputCls}>
            <option value="">غير مرتبطة بقضية محددة</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="نوع المعاملة">
            <select onChange={onFieldChange("type")} className={inputCls}>
              <option value="إيداع أمانة">إيداع أمانة (+)</option>
              <option value="صرف أمانة">صرف أمانة (-)</option>
            </select>
          </Field>
          <Field label="المبلغ (د.إ)">
            <input
              type="number"
              onChange={onFieldChange("amount")}
              placeholder="0.00"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="رقم السند / الشيك">
            <input
              onChange={onFieldChange("refNo")}
              placeholder="مثال: CHK-9902"
              className={inputCls}
            />
          </Field>
          <Field label="تاريخ المعاملة">
            <input
              type="date"
              onChange={onFieldChange("date")}
              defaultValue={todayISO()}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="بيان وشرح الأمانة">
          <textarea
            onChange={onFieldChange("notes")}
            rows={2}
            placeholder="أمانة رسوم خبرة قضائية في دعوى..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          تأكيد معاملة الأمانات
        </button>
      </div>
    </Modal>
  );
}
