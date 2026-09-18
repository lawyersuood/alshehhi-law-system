import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import type { CourtContact } from "../../domain/types";

const EMIRATES = ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "أم القيوين", "الفجيرة"];

export interface CourtContactModalProps {
  editingCourtContact: CourtContact | null;
  form: Record<string, any>;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة/تعديل جهة تواصل محكمة" — الخطوة العشرون من تفكيك App.tsx التدريجي.
 */
export default function CourtContactModal({
  editingCourtContact,
  form,
  onFieldChange,
  onSave,
  onClose,
}: CourtContactModalProps) {
  return (
    <Modal
      title={editingCourtContact ? "تعديل بيانات تواصل جهة محكمة" : "إضافة جهة / موظف محكمة جديد"}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <Field label="اسم المحكمة / الجهة القضائية">
          <input
            value={form.courtName || ""}
            onChange={onFieldChange("courtName")}
            placeholder="مثال: محاكم دبي الابتدائية / دائرة القضاء - أبوظبي"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الإمارة">
            <select
              value={form.emirate || "دبي"}
              onChange={onFieldChange("emirate")}
              className={inputCls}
            >
              {EMIRATES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </Field>

          <Field label="القسم / الدائرة">
            <input
              value={form.department || ""}
              onChange={onFieldChange("department")}
              placeholder="مثال: قسم قيد الدعاوى / إدارة التنفيذ"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="اسم الموظف / الصفة الوظيفية / المسؤول">
          <input
            value={form.titleOrEmployee || ""}
            onChange={onFieldChange("titleOrEmployee")}
            placeholder="مثال: أمين سر الجلسة / رئيس قسم القيد / شباك 4"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="رقم الهاتف المباشر">
            <input
              value={form.phone || ""}
              onChange={onFieldChange("phone")}
              placeholder="مثال: 04-3347777"
              className={inputCls}
            />
          </Field>

          <Field label="رقم الخاتم / التمديدة / رقم الشباك">
            <input
              value={form.extOrSeal || ""}
              onChange={onFieldChange("extOrSeal")}
              placeholder="مثال: خاتم 104 — تمديدة 4120"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="البريد الإلكتروني المباشر">
          <input
            value={form.email || ""}
            onChange={onFieldChange("email")}
            placeholder="مثال: registration.commercial@dc.gov.ae"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="مواعيد العمل واستقبال المراجعين">
            <input
              value={form.operatingHours || ""}
              onChange={onFieldChange("operatingHours")}
              placeholder="مثال: 07:30 ص - 02:30 م"
              className={inputCls}
            />
          </Field>

          <Field label="المقر / الموقع داخل المحكمة">
            <input
              value={form.location || ""}
              onChange={onFieldChange("location")}
              placeholder="مثال: الطابق الأول - قاعة 14"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="ملاحظات وآليات تحويل المذكرات">
          <textarea
            value={form.notes || ""}
            onChange={onFieldChange("notes")}
            placeholder="اكتب أي ملاحظات حول مواعيد تسليم المذكرات، الشروط، البوابة الإلكترونية..."
            rows={3}
            className={inputCls}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400"
          >
            حفظ بيانات التواصل
          </button>
        </div>
      </div>
    </Modal>
  );
}
