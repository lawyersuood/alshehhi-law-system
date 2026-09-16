import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";

export interface ColleagueModalProps {
  editingColleagueId: string | number | null;
  form: Record<string, any>;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة/تعديل زميل متعاون" — الخطوة السادسة من تفكيك App.tsx التدريجي.
 */
export default function ColleagueModal({
  editingColleagueId,
  form,
  onFieldChange,
  onSave,
  onClose,
}: ColleagueModalProps) {
  return (
    <Modal
      title={editingColleagueId ? "تعديل بيانات الزميل" : "إضافة زميل متعاون"}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <Field label="الاسم الكامل">
          <input
            onChange={onFieldChange("name")}
            defaultValue={form.name || ""}
            placeholder="اسم المحامي الزميل"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="رقم الهاتف">
            <input
              onChange={onFieldChange("phone")}
              defaultValue={form.phone || ""}
              placeholder="050-XXXXXXX"
              className={inputCls}
            />
          </Field>
          <Field label="البريد الإلكتروني (اختياري)">
            <input
              onChange={onFieldChange("email")}
              defaultValue={form.email || ""}
              placeholder="lawyer@example.com"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="التخصص">
            <input
              onChange={onFieldChange("specialization")}
              defaultValue={form.specialization || ""}
              placeholder="مثال: جزائي، عمالي، عقاري..."
              className={inputCls}
            />
          </Field>
          <Field label="الإمارة / المحكمة التي يغطيها">
            <input
              onChange={onFieldChange("coverageArea")}
              defaultValue={form.coverageArea || ""}
              placeholder="مثال: محاكم دبي"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="رقم قيد المحامي (نقابة المحامين)">
          <input
            onChange={onFieldChange("licenseNumber")}
            defaultValue={form.licenseNumber || ""}
            placeholder="مثال: 2210"
            className={inputCls}
          />
        </Field>
        <Field label="الحالة">
          <select
            onChange={onFieldChange("status")}
            defaultValue={form.status || "متاح"}
            className={inputCls}
          >
            <option value="متاح">متاح</option>
            <option value="غير متاح">غير متاح</option>
          </select>
        </Field>
        <Field label="ملاحظات">
          <textarea
            onChange={onFieldChange("notes")}
            defaultValue={form.notes || ""}
            rows={2}
            placeholder="ملاحظات حول الموثوقية والتجارب السابقة..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ بيانات الزميل
        </button>
      </div>
    </Modal>
  );
}
