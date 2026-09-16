import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";
import type { CaseItem, UserItem } from "../../domain/types";

export interface TaskModalProps {
  cases: CaseItem[];
  users: UserItem[];
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة مهمة جديدة" — الخطوة الرابعة من تفكيك App.tsx التدريجي.
 */
export default function TaskModal({
  cases,
  users,
  onFieldChange,
  onSave,
  onClose,
}: TaskModalProps) {
  return (
    <Modal title="إضافة مهمة جديدة" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="عنوان المهمة">
          <input
            onChange={onFieldChange("title")}
            placeholder="مثال: إعداد مذكرة جوابية..."
            className={inputCls}
          />
        </Field>
        <Field label="القضية (اختياري)">
          <select onChange={onFieldChange("caseId")} className={inputCls}>
            <option value="">غير مرتبطة بقضية محددة</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="المكلف بالمهمة">
            <select onChange={onFieldChange("assignee")} className={inputCls}>
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.roleTitle})
                </option>
              ))}
            </select>
          </Field>
          <Field label="الأولوية">
            <select onChange={onFieldChange("priority")} className={inputCls}>
              <option>متوسطة</option>
              <option>عالية</option>
              <option>منخفضة</option>
            </select>
          </Field>
        </div>
        <Field label="تاريخ الاستحقاق">
          <input
            type="date"
            onChange={onFieldChange("due")}
            defaultValue={todayISO()}
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ المهمة
        </button>
      </div>
    </Modal>
  );
}
