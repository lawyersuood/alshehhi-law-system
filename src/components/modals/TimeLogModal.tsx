import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";
import type { CaseItem, UserItem } from "../../domain/types";

export interface TimeLogModalProps {
  cases: CaseItem[];
  clientName: (id: number) => string;
  users: UserItem[];
  currentUserName: string;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "تسجيل ساعات عمل" — الخطوة السابعة من تفكيك App.tsx التدريجي.
 */
export default function TimeLogModal({
  cases,
  clientName,
  users,
  currentUserName,
  onFieldChange,
  onSave,
  onClose,
}: TimeLogModalProps) {
  return (
    <Modal title="تسجيل ساعات عمل (Time Log)" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="القضية">
          <select onChange={onFieldChange("caseId")} className={inputCls}>
            <option value="">اختر القضية…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number} - {clientName(c.clientId)}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="عدد الساعات">
            <input
              type="number"
              step="0.5"
              onChange={onFieldChange("hours")}
              placeholder="مثال: 2.5"
              className={inputCls}
            />
          </Field>
          <Field label="سعر الساعة (د.إ)">
            <input
              type="number"
              onChange={onFieldChange("hourlyRate")}
              defaultValue="750"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="المحامي / المستشار">
            <select
              onChange={onFieldChange("lawyerName")}
              defaultValue={currentUserName}
              className={inputCls}
            >
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="تاريخ العمل">
            <input
              type="date"
              onChange={onFieldChange("date")}
              defaultValue={todayISO()}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="تفاصيل وأنشطة ساعات العمل">
          <textarea
            onChange={onFieldChange("description")}
            rows={3}
            placeholder="دراسة الأوراق، إعداد المذكرة، حضور الاجتماع..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ ساعات العمل
        </button>
      </div>
    </Modal>
  );
}
