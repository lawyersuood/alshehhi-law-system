import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { HEARING_TYPES } from "../../domain/constants";
import type { CaseItem } from "../../domain/types";

export interface HearingModalProps {
  cases: CaseItem[];
  clientName: (id: number) => string;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "جدولة جلسة جديدة" — الخطوة الثالثة من تفكيك App.tsx التدريجي.
 */
export default function HearingModal({
  cases,
  clientName,
  onFieldChange,
  onSave,
  onClose,
}: HearingModalProps) {
  return (
    <Modal title="جدولة جلسة جديدة" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="القضية المرتبطة">
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
          <Field label="تاريخ الجلسة">
            <input type="date" onChange={onFieldChange("date")} className={inputCls} />
          </Field>
          <Field label="الوقت">
            <input
              type="time"
              onChange={onFieldChange("time")}
              defaultValue="09:00"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="نوع الجلسة">
            <select onChange={onFieldChange("type")} className={inputCls}>
              {HEARING_TYPES.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </Field>
          <Field label="قاعة المحكمة">
            <input
              onChange={onFieldChange("room")}
              placeholder="مثال: قاعة 4 - الطابق 2"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="ملاحظات وتكليفات الجلسة">
          <textarea
            onChange={onFieldChange("notes")}
            rows={2}
            placeholder="المطلوب في الجلسة (إيداع مذكرة / حضور الموكل)..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          تأكيد جدولة الجلسة
        </button>
      </div>
    </Modal>
  );
}
