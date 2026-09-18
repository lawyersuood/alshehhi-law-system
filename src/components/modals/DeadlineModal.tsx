import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { todayISO } from "../../domain/utils";
import type { CaseItem, UserItem } from "../../domain/types";

export interface DeadlineModalProps {
  cases: CaseItem[];
  users: UserItem[];
  form: Record<string, any>;
  setForm: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  clientName: (id: number) => string;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "تسجيل حكم قضائي وحساب ميعاد الطعن" — الخطوة التاسعة عشرة من تفكيك App.tsx التدريجي.
 */
export default function DeadlineModal({
  cases,
  users,
  form,
  setForm,
  clientName,
  onFieldChange,
  onSave,
  onClose,
}: DeadlineModalProps) {
  return (
    <Modal title="تسجيل حكم قضائي وحساب ميعاد الطعن والتنبيهات التلقائية" onClose={onClose}>
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
          <Field label="تاريخ صدور الحكم الرسمية">
            <input
              type="date"
              onChange={onFieldChange("rulingDate")}
              defaultValue={todayISO()}
              className={inputCls}
            />
          </Field>
          <Field label="درجة الحكم">
            <select onChange={onFieldChange("rulingType")} className={inputCls}>
              <option>حكم ابتدائية</option>
              <option>حكم استئناف</option>
              <option>قرار لجنة منازعات</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="نوع الدعوى (تحدد مهلة الطعن القانونية)">
            <select
              onChange={(e) => {
                const nature = e.target.value as "مدني" | "جزائي";
                setForm((prev) => ({
                  ...prev,
                  caseNature: nature,
                  appealDays: nature === "جزائي" ? 15 : 30,
                }));
              }}
              defaultValue="مدني"
              className={inputCls}
            >
              <option value="مدني">مدني/تجاري — مهلة الاستئناف 30 يوماً</option>
              <option value="جزائي">جزائي — مهلة الطعن 15 يوماً</option>
            </select>
          </Field>
          <Field label="مهلة الطعن القانونية (أيام)">
            <input
              type="number"
              key={form.caseNature || "مدني"}
              onChange={onFieldChange("appealDays")}
              defaultValue={form.caseNature === "جزائي" ? 15 : 30}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="المحامي المسؤول عن الطعن">
            <select
              onChange={(e) => {
                const uId = Number(e.target.value);
                const u = users.find((usr) => usr.id === uId);
                if (u) {
                  setForm((prev) => ({
                    ...prev,
                    assignedLawyerId: u.id,
                    assignedLawyerName: u.name,
                    assignedLawyerEmail: u.email,
                    assignedLawyerPhone: u.phone,
                  }));
                }
              }}
              className={inputCls}
            >
              <option value="">اختر المحامي المسؤول…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.roleTitle || u.roleKey})
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="قناة إرسال الإشعارات الاستباقية التلقائية">
          <select
            onChange={onFieldChange("preferredChannel")}
            defaultValue="both"
            className={inputCls}
          >
            <option value="both">إيميل + واتساب (موصى به لضمان الوصول)</option>
            <option value="email">بريد إلكتروني فقط (SMTP)</option>
            <option value="whatsapp">رسالة واتساب مباشرة فقط</option>
          </select>
        </Field>
        <Field label="منطوق الحكم الصادر وملخص القضية">
          <textarea
            onChange={onFieldChange("rulingSummary")}
            rows={3}
            placeholder="منطوق الحكم الرسمي الصادر من جلسة اليوم..."
            className={inputCls}
          />
        </Field>
        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ وحساب الميعاد التلقائي
        </button>
      </div>
    </Modal>
  );
}
