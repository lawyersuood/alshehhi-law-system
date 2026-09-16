import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";

export interface ClientModalProps {
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة موكل / جهة اتصال جديدة" — الخطوة الخامسة من تفكيك App.tsx التدريجي.
 */
export default function ClientModal({ onFieldChange, onSave, onClose }: ClientModalProps) {
  return (
    <Modal title="إضافة موكل / جهة اتصال جديدة" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="الاسم الكامل / اسم الشركة / الجهة">
          <input
            onChange={onFieldChange("name")}
            placeholder="الاسم الكامل أو اسم الشركة أو الجهة"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الصفة / التصنيف">
            <select onChange={onFieldChange("type")} className={inputCls}>
              <option value="فرد">فرد (شخص)</option>
              <option value="شركة">شركة / مؤسسة</option>
              <option value="جهة حكومية">جهة حكومية / رسمية</option>
              <option value="جهة أخرى">جهة أخرى</option>
            </select>
          </Field>
          <Field label="الهوية / الرخصة / الرقم الضريبي">
            <input
              onChange={onFieldChange("idNo")}
              placeholder="الهوية الإماراتية أو الرخصة التجارية"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="رقم الهاتف">
            <input
              onChange={onFieldChange("phone")}
              placeholder="050-XXXXXXX"
              className={inputCls}
            />
          </Field>

          <Field label="الإمارة / الموقع">
            <select onChange={onFieldChange("emirate")} className={inputCls}>
              <option>دبي</option>
              <option>أبوظبي</option>
              <option>الشارقة</option>
              <option>رأس الخيمة</option>
              <option>عجمان</option>
              <option>أم القيوين</option>
              <option>الفجيرة</option>
              <option>خارج الدولة</option>
            </select>
          </Field>
        </div>
        <Field label="البريد الإلكتروني">
          <input
            onChange={onFieldChange("email")}
            placeholder="example@email.ae"
            className={inputCls}
          />
        </Field>
        <Field label="العنوان / تفاصيل إضافية">
          <input
            onChange={onFieldChange("address")}
            placeholder="العنوان التفصيلي"
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ وتأكيد الإضافة
        </button>
      </div>
    </Modal>
  );
}
