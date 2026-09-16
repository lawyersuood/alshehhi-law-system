import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";
import type { CaseItem } from "../../domain/types";

export interface CaseExpenseModalProps {
  cases: CaseItem[];
  clientName: (id: number) => string;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "تسجيل مصروف قضية جديد" — الخطوة الثامنة من تفكيك App.tsx التدريجي.
 */
export default function CaseExpenseModal({
  cases,
  clientName,
  onFieldChange,
  onSave,
  onClose,
}: CaseExpenseModalProps) {
  return (
    <Modal title="تسجيل مصروف قضية جديد" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="القضية">
          <select onChange={onFieldChange("caseId")} className={inputCls}>
            <option value="">اختر القضية…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number} - {clientName(c.clientId)}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="تصنيف المصروف">
            <select onChange={onFieldChange("category")} className={inputCls}>
              <option>رسوم قضائية</option>
              <option>رسوم خبرة وتثمين</option>
              <option>ترجمة قانونية معتمدة</option>
              <option>مواصلات وتنقّل وقيد</option>
              <option>أخرى</option>
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
          <Field label="تاريخ المصروف">
            <input
              type="date"
              onChange={onFieldChange("date")}
              defaultValue={todayISO()}
              className={inputCls}
            />
          </Field>
          <Field label="قابل للفلترة وإضافته للفاتورة؟">
            <select onChange={onFieldChange("billable")} className={inputCls}>
              <option value="نعم">نعم (يُدفع من الموكل)</option>
              <option value="لا">لا (مصروف إداري غير مسترد)</option>
            </select>
          </Field>
        </div>
        <Field label="البيان والوصف">
          <textarea
            onChange={onFieldChange("description")}
            rows={2}
            placeholder="تفاصيل الإيصال والرقم..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ المصروف
        </button>
      </div>
    </Modal>
  );
}
