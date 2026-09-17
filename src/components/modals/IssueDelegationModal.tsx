import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import type { CaseItem, Colleague } from "../../domain/types";

export interface IssueDelegationModalProps {
  colleagues: Colleague[];
  cases: CaseItem[];
  form: Record<string, any>;
  setForm: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إصدار إنابة حضور" — الخطوة الحادية عشرة من تفكيك App.tsx التدريجي.
 */
export default function IssueDelegationModal({
  colleagues,
  cases,
  form,
  setForm,
  onFieldChange,
  onSave,
  onClose,
}: IssueDelegationModalProps) {
  return (
    <Modal title="إصدار إنابة حضور" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <Field label="الزميل المُنَاب">
          <select
            onChange={(e) => {
              const cid = e.target.value;
              const sel = colleagues.find((cc) => String(cc.id) === cid);
              setForm((prev) => ({
                ...prev,
                colleagueId: cid,
                colleagueLicenseNumber: sel?.licenseNumber || "",
              }));
            }}
            defaultValue={form.colleagueId || ""}
            className={inputCls}
          >
            <option value="">اختر الزميل…</option>
            {colleagues.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="القضية (اختياري) — تُستخدم لسحب اسم الموكل وصفته والخصم تلقائياً">
          <select
            onChange={onFieldChange("caseId")}
            defaultValue={form.caseId || ""}
            className={inputCls}
          >
            <option value="">بدون ربط بقضية مسجلة…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number} — {c.subject}
              </option>
            ))}
          </select>
        </Field>
        <Field label="وصف القضية/الجلسة (إن لم تُربط بقضية مسجلة)">
          <input
            onChange={onFieldChange("caseTitleSnapshot")}
            defaultValue={form.caseTitleSnapshot || ""}
            placeholder="مثال: جلسة محكمة الشارقة الابتدائية - دائرة مدنية"
            className={inputCls}
          />
        </Field>
        <Field label="تاريخ الجلسة المناب لها الزميل">
          <input
            type="date"
            onChange={onFieldChange("sessionDate")}
            defaultValue={form.sessionDate || ""}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="رقم قيد المحامي المُنيب (يُسحب تلقائياً، قابل للتعديل)">
            <input
              onChange={onFieldChange("issuerLicenseNumber")}
              defaultValue={form.issuerLicenseNumber || ""}
              placeholder="مثال: 1754"
              className={inputCls}
            />
          </Field>
          <Field label="رقم قيد الزميل المُناب (يُسحب تلقائياً، قابل للتعديل)">
            <input
              key={form.colleagueId || "none"}
              onChange={onFieldChange("colleagueLicenseNumber")}
              defaultValue={form.colleagueLicenseNumber || ""}
              placeholder="مثال: 2210"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="الغرض من الإنابة">
          <textarea
            onChange={onFieldChange("purpose")}
            defaultValue={form.purpose || ""}
            rows={3}
            placeholder="حضور الجلسة المحددة نيابة عن المكتب وتقديم المذكرات والمرافعة..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          إصدار الإنابة
        </button>
      </div>
    </Modal>
  );
}
