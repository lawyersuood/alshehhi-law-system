import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";
import type { Employee } from "../../domain/types";

export interface LeaveRequestModalProps {
  employees: Employee[];
  form: Record<string, any>;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "تقديم طلب إجازة كادر" — الخطوة الثانية عشرة من تفكيك App.tsx التدريجي.
 */
export default function LeaveRequestModal({
  employees,
  form,
  onFieldChange,
  onSave,
  onClose,
}: LeaveRequestModalProps) {
  return (
    <Modal title="تقديم طلب إجازة كادر" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="الموظف صاحب الطلب">
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

        <Field label="نوع الإجازة">
          <select
            onChange={onFieldChange("leaveType")}
            defaultValue={form.leaveType || "ANNUAL"}
            className={inputCls}
          >
            <option value="ANNUAL">إجازة سنوية اعتيادية</option>
            <option value="SICK">إجازة مرضية</option>
            <option value="EMERGENCY">إجازة طارئة</option>
            <option value="UNPAID">إجازة بدون أجر</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="تاريخ البداية">
            <input
              type="date"
              onChange={onFieldChange("startDate")}
              defaultValue={form.startDate || todayISO()}
              className={inputCls}
            />
          </Field>
          <Field label="تاريخ النهاية">
            <input
              type="date"
              onChange={onFieldChange("endDate")}
              defaultValue={form.endDate || todayISO()}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="السبب / تفاصيل الإجازة">
          <textarea
            onChange={onFieldChange("reason")}
            rows={3}
            placeholder="اكتب سبب طلب الإجازة هنا..."
            className={inputCls}
          />
        </Field>

        <button
          onClick={onSave}
          className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-950 hover:bg-amber-400 transition"
        >
          ارسال طلب الإجازة
        </button>
      </div>
    </Modal>
  );
}
