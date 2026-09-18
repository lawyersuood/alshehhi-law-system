import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import type { Client } from "../../domain/types";

export interface StrReportModalProps {
  clients: Client[];
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إبلاغ عن معاملات مشبوهة (AML / STR Report)" — الخطوة الرابعة عشرة من تفكيك App.tsx التدريجي.
 */
export default function StrReportModal({
  clients,
  onFieldChange,
  onSave,
  onClose,
}: StrReportModalProps) {
  return (
    <Modal title="إبلاغ عن معاملات مشبوهة (AML / STR Report)" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-900 font-semibold">
          🔒 هذا السجل سري للغاية ومخصص لمسؤول الامتثال فقط وفق متطلبات وحدة المعلومات المالية FIU
          بالدولة.
        </div>
        <Field label="الموكل المشتبه به">
          <select onChange={onFieldChange("clientId")} className={inputCls}>
            <option value="">اختر الموكل…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="المبلغ المشتبه به (د.إ)">
            <input
              type="number"
              onChange={onFieldChange("amountFlagged")}
              placeholder="0.00"
              className={inputCls}
            />
          </Field>
          <Field label="حالة البلاغ">
            <select onChange={onFieldChange("status")} className={inputCls}>
              <option>تحقيق داخلي</option>
              <option>مرفوع للـ FIU</option>
              <option>حفظ الملف</option>
            </select>
          </Field>
        </div>
        <Field label="أسباب الاشتباه ومؤشرات غسل الأموال">
          <textarea
            onChange={onFieldChange("suspicionReason")}
            rows={3}
            placeholder="مثال: حوالات نقداً من أطراف مجهولة بدون فواتير سابقة..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-red-700 py-3 font-bold text-white hover:bg-red-800"
        >
          حفظ وتوثيق بلاغ الاشتباه
        </button>
      </div>
    </Modal>
  );
}
