import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import type { Client } from "../../domain/types";

export interface PoaModalProps {
  clients: Client[];
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة توكيل كاتب عدل" — الخطوة الثانية من تفكيك App.tsx التدريجي (بعد DocModal).
 */
export default function PoaModal({ clients, onFieldChange, onSave, onClose }: PoaModalProps) {
  return (
    <Modal title="إضافة توكيل كاتب عدل" onClose={onClose}>
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
        <Field label="رقم الوكالة الموثقة">
          <input
            onChange={onFieldChange("number")}
            placeholder="مثال: وكالة 2026/1/4502"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الجهة المصدرة">
            <input
              onChange={onFieldChange("issuer")}
              placeholder="كاتب العدل - دبي"
              className={inputCls}
            />
          </Field>
          <Field label="تاريخ الانتهاء">
            <input type="date" onChange={onFieldChange("expiry")} className={inputCls} />
          </Field>
        </div>
        <Field label="نطاق الوكالة والتخويل">
          <textarea
            onChange={onFieldChange("scope")}
            rows={2}
            placeholder="وكالة قضائية عامة والترافع والصلح والإقرار..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ الوكالة
        </button>
      </div>
    </Modal>
  );
}
