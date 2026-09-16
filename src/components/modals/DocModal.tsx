import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { DOC_TYPES } from "../../domain/constants";
import type { CaseItem } from "../../domain/types";

export interface DocModalProps {
  cases: CaseItem[];
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "رفع مستند جديد" — استُخرجت من App.tsx كأول خطوة فعلية ضمن خطة تفكيك الملف الكبير
 * (راجع تقرير المراجعة، القسم الخامس). الأسلوب: استخراج نافذة واحدة صغيرة كل مرة مع تحقق كامل
 * بعدها، وليس إعادة هيكلة الملف دفعة واحدة.
 */
export default function DocModal({ cases, onFieldChange, onSave, onClose }: DocModalProps) {
  return (
    <Modal title="رفع مستند جديد" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="اسم المستند">
          <input
            onChange={onFieldChange("name")}
            placeholder="مثال: صحيفة الدعوى 2026.pdf"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="نوع المستند">
            <select onChange={onFieldChange("type")} className={inputCls}>
              {DOC_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="القضية المرتبطة">
            <select onChange={onFieldChange("caseId")} className={inputCls}>
              <option value="">مستند غير مرتبط بقضية</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.number}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ المستند الأرشيفي
        </button>
      </div>
    </Modal>
  );
}
