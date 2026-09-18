import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";
import { ShieldAlert } from "lucide-react";
import type { Employee } from "../../domain/types";

export interface DisciplinaryActionModalProps {
  employees: Employee[];
  form: Record<string, any>;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "تسجيل إجراء تأديبي سري" — الخطوة الحادية والعشرون من تفكيك App.tsx التدريجي.
 */
export default function DisciplinaryActionModal({
  employees,
  form,
  onFieldChange,
  onSave,
  onClose,
}: DisciplinaryActionModalProps) {
  return (
    <Modal title="تسجيل إجراء تأديبي سري" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5 text-[11px] text-red-800">
          <ShieldAlert size={15} className="shrink-0 mt-0.5" />
          <p>
            هذا السجل سري ويظهر فقط للحساب الرئيسي ضمن ملف الموظف المعني، ولا يطّلع عليه بقية
            الكادر.
          </p>
        </div>

        <Field label="الموظف المعني">
          <select
            onChange={onFieldChange("employeeId")}
            defaultValue={form.employeeId || ""}
            className={inputCls}
          >
            <option value="">اختر الموظف...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} ({e.jobTitle})
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="نوع الإجراء">
            <select
              onChange={onFieldChange("type")}
              defaultValue={form.type || "تحقيق داخلي"}
              className={inputCls}
            >
              <option value="تحقيق داخلي">تحقيق داخلي</option>
              <option value="إنذار شفهي">إنذار شفهي</option>
              <option value="إنذار كتابي">إنذار كتابي</option>
              <option value="قرار تأديبي">قرار تأديبي</option>
              <option value="قرار إداري">قرار إداري</option>
              <option value="أخرى">أخرى</option>
            </select>
          </Field>
          <Field label="تاريخ الإجراء">
            <input
              type="date"
              onChange={onFieldChange("actionDate")}
              defaultValue={form.actionDate || todayISO()}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="موضوع الإجراء">
          <input
            onChange={onFieldChange("subject")}
            placeholder="مثال: إنذار كتابي للتأخر المتكرر عن الدوام"
            className={inputCls}
          />
        </Field>

        <Field label="التفاصيل الكاملة">
          <textarea
            onChange={onFieldChange("details")}
            rows={5}
            placeholder="اكتبي تفاصيل التحقيق أو الإنذار أو القرار هنا بالتفصيل..."
            className={inputCls}
          />
        </Field>

        <Field label="رابط أو رقم المستند المرفق (اختياري)">
          <input
            onChange={onFieldChange("attachmentRef")}
            placeholder="رابط نسخة ضوئية من الإنذار/القرار، أو رقم مرجعي..."
            className={inputCls}
          />
        </Field>

        <button
          onClick={onSave}
          className="w-full rounded-xl bg-red-700 py-3 font-bold text-white hover:bg-red-800 transition"
        >
          حفظ الإجراء التأديبي
        </button>
      </div>
    </Modal>
  );
}
