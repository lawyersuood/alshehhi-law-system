import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";

export interface EmployeeModalProps {
  form: Record<string, any>;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة/تعديل موظف / مستشار" — الخطوة الخامسة عشرة من تفكيك App.tsx التدريجي.
 */
export default function EmployeeModal({
  form,
  onFieldChange,
  onSave,
  onClose,
}: EmployeeModalProps) {
  return (
    <Modal
      title={form.id ? "تعديل بيانات الموظف" : "إضافة موظف / مستشار جديد"}
      onClose={onClose}
      wide
    >
      <div className="space-y-4 text-sm">
        <Field label="الاسم الكامل">
          <input
            onChange={onFieldChange("fullName")}
            defaultValue={form.fullName || ""}
            placeholder="مثال: د. عبد الله بن حمد آل علي"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="المسمى الوظيفي">
            <input
              onChange={onFieldChange("jobTitle")}
              defaultValue={form.jobTitle || ""}
              placeholder="مثال: مستشار قانوني أول / محامي مدني"
              className={inputCls}
            />
          </Field>
          <Field label="حالة الموظف">
            <select
              onChange={onFieldChange("status")}
              defaultValue={form.status || "ACTIVE"}
              className={inputCls}
            >
              <option value="ACTIVE">على رأس العمل (Active)</option>
              <option value="ON_LEAVE">في إجازة (On Leave)</option>
              <option value="TERMINATED">منهي الخدمة (Terminated)</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="البريد الإلكتروني الرسمي">
            <input
              type="email"
              onChange={onFieldChange("email")}
              defaultValue={form.email || ""}
              placeholder="employee@law.ae"
              className={inputCls}
            />
          </Field>
          <Field label="رقم الهاتف">
            <input
              onChange={onFieldChange("phone")}
              defaultValue={form.phone || ""}
              placeholder="050-XXXXXXX"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="رقم الهوية الإماراتية">
            <input
              onChange={onFieldChange("emiratesId")}
              defaultValue={form.emiratesId || ""}
              placeholder="784-XXXX-XXXXXXX-X"
              className={inputCls}
            />
          </Field>
          <Field label="رقم جواز السفر">
            <input
              onChange={onFieldChange("passportNumber")}
              defaultValue={form.passportNumber || ""}
              placeholder="A12345678"
              className={inputCls}
            />
          </Field>
          <Field label="تاريخ انتهاء الهوية/الإقامة">
            <input
              type="date"
              onChange={onFieldChange("idExpiryDate")}
              defaultValue={form.idExpiryDate || ""}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="رقم قيد المحامي (إن وجد)">
            <input
              onChange={onFieldChange("licenseNumber")}
              defaultValue={form.licenseNumber || ""}
              placeholder="مثال: ADV-UAE-9982"
              className={inputCls}
            />
          </Field>
          <Field label="تاريخ المباشرة / الانضمام">
            <input
              type="date"
              onChange={onFieldChange("joinDate")}
              defaultValue={form.joinDate || todayISO()}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-900">تفاصيل هيكل الراتب والبدلات (د.إ):</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="الراتب الأساسي">
              <input
                type="number"
                onChange={onFieldChange("basicSalary")}
                defaultValue={form.basicSalary || 0}
                className={inputCls}
              />
            </Field>
            <Field label="بدل السكن">
              <input
                type="number"
                onChange={onFieldChange("housingAllowance")}
                defaultValue={form.housingAllowance || 0}
                className={inputCls}
              />
            </Field>
            <Field label="بدل المواصلات">
              <input
                type="number"
                onChange={onFieldChange("transportAllowance")}
                defaultValue={form.transportAllowance || 0}
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ بيانات الموظف
        </button>
      </div>
    </Modal>
  );
}
