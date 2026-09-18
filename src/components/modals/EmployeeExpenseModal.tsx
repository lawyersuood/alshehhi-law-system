import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import type { CaseItem, Employee } from "../../domain/types";

export interface EmployeeExpenseModalProps {
  employees: Employee[];
  cases: CaseItem[];
  form: Record<string, any>;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "تقديم مطالبة مصروفات وتعويض" — الخطوة الثالثة عشرة من تفكيك App.tsx التدريجي.
 */
export default function EmployeeExpenseModal({
  employees,
  cases,
  form,
  onFieldChange,
  onSave,
  onClose,
}: EmployeeExpenseModalProps) {
  return (
    <Modal title="تقديم مطالبة مصروفات وتعويض" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="الموظف المتقدم بالمطالبة">
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
          <Field label="بند / نوع المصروف">
            <select
              onChange={onFieldChange("category")}
              defaultValue={form.category || "COURT_FEES"}
              className={inputCls}
            >
              <option value="COURT_FEES">رسوم محاكم وخدمات قضائية</option>
              <option value="TRANSPORT">تنقلات ومواصلات قضائية</option>
              <option value="SUPPLIES">مستلزمات وأدوات مكتبية</option>
              <option value="OTHER">مصروفات أخرى</option>
            </select>
          </Field>

          <Field label="المبلغ المطلوب (د.إ)">
            <input
              type="number"
              onChange={onFieldChange("amount")}
              placeholder="0.00"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="القضية المرتبطة (اختياري)">
          <select
            onChange={onFieldChange("caseId")}
            defaultValue={form.caseId || ""}
            className={inputCls}
          >
            <option value="">مصروف إداري عام للمكتب</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                قضية #{c.number} - {c.subject}
              </option>
            ))}
          </select>
        </Field>

        <Field label="رابط أو ملاحظات الفاتورة/الإيصال">
          <input
            onChange={onFieldChange("receiptUrl")}
            placeholder="رابط المستند أو رقم الإيصال..."
            className={inputCls}
          />
        </Field>

        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          تقديم مطالبة المصروفات
        </button>
      </div>
    </Modal>
  );
}
