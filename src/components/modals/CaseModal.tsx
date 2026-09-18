import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import {
  CASE_STAGES,
  CASE_STATUS,
  CASE_TYPES,
  COURTS,
  TASK_TEMPLATES,
} from "../../domain/constants";
import { Plus, Trash2 } from "lucide-react";
import type { CaseItem, Client } from "../../domain/types";

export interface CaseModalProps {
  editingCase: CaseItem | null;
  clients: Client[];
  form: Record<string, any>;
  setForm: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

const EMIRATES = ["أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"];

/**
 * نافذة "قيد قضية جديدة / تعديل بيانات القضية" — الخطوة السابعة عشرة من تفكيك App.tsx التدريجي.
 */
export default function CaseModal({
  editingCase,
  clients,
  form,
  setForm,
  onFieldChange,
  onSave,
  onClose,
}: CaseModalProps) {
  const opponents: string[] = form.opponents && form.opponents.length > 0 ? form.opponents : [""];

  return (
    <Modal
      title={editingCase ? `تعديل بيانات القضية رقم ${editingCase.number}` : "قيد قضية جديدة"}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <Field label="رقم القضية لدى المحكمة">
          <input
            value={form.number || ""}
            onChange={onFieldChange("number")}
            placeholder="مثال: 1245/2026 تجاري كلي"
            className={inputCls}
          />
        </Field>
        <Field label="الموكل">
          <select
            value={form.clientId || ""}
            onChange={onFieldChange("clientId")}
            className={inputCls}
          >
            <option value="">اختر الموكل…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="صفة الموكل في القضية (تُستخدم في مستندات الإنابة وغيرها)">
          <input
            value={form.clientCapacity || ""}
            onChange={onFieldChange("clientCapacity")}
            placeholder="مثال: مدعي / مدعى عليه / مستأنف / طالب التنفيذ"
            className={inputCls}
          />
        </Field>

        {/* قائمة الخصوم — تدعم إضافة أكثر من خصم واحد لنفس القضية */}
        <Field label="الخصوم (يمكن إضافة أكثر من خصم)">
          <div className="space-y-2">
            {opponents.map((opp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={opp}
                  onChange={(e) => {
                    const list = [...opponents];
                    list[idx] = e.target.value;
                    setForm((prev) => ({ ...prev, opponents: list }));
                  }}
                  placeholder="اسم المدعى عليه أو الخصم"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => {
                    const list = [...opponents];
                    list.splice(idx, 1);
                    setForm((prev) => ({
                      ...prev,
                      opponents: list.length > 0 ? list : [""],
                    }));
                  }}
                  className="shrink-0 p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={opponents.length <= 1}
                  title="حذف هذا الخصم"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const list = [...opponents];
                list.push("");
                setForm((prev) => ({ ...prev, opponents: list }));
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900"
            >
              <Plus size={14} /> إضافة خصم آخر
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="مرحلة الدعوى (درجة التقاضي)">
            <select
              value={form.stage || "الابتدائية"}
              onChange={onFieldChange("stage")}
              className={inputCls}
            >
              {CASE_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </Field>
          <Field label="حالة القضية">
            <select
              value={form.status || "متداولة"}
              onChange={onFieldChange("status")}
              className={inputCls}
            >
              {CASE_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="نوع الدعوى">
            <select
              value={form.type || CASE_TYPES[0]}
              onChange={onFieldChange("type")}
              className={inputCls}
            >
              {CASE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="الإمارة">
            <select
              value={form.emirate || ""}
              onChange={onFieldChange("emirate")}
              className={inputCls}
            >
              <option value="">اختر الإمارة...</option>
              {EMIRATES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </Field>
          <Field label="المحكمة المختصة">
            <select
              value={form.court || COURTS[0]}
              onChange={onFieldChange("court")}
              className={inputCls}
            >
              {COURTS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="الدائرة القضائية / القاضي المشرف">
          <input
            value={form.judge || ""}
            onChange={onFieldChange("judge")}
            placeholder="مثال: دائرة الجنايات الأولى - القاضي محمد"
            className={inputCls}
          />
        </Field>
        <Field label="موضوع الدعوى والطلبات">
          <textarea
            value={form.subject || ""}
            onChange={onFieldChange("subject")}
            rows={2}
            placeholder="ملخص وقائع الدعوى..."
            className={inputCls}
          />
        </Field>
        <Field label="تاريخ القيد (اختياري)">
          <input
            type="date"
            value={form.openDate || ""}
            onChange={onFieldChange("openDate")}
            className={inputCls}
          />
        </Field>
        {!editingCase && (
          <Field label="قالب المهام التلقائية (اختياري)">
            <select onChange={onFieldChange("taskTemplate")} className={inputCls}>
              <option value="">لا يوجد (عدم إضافة مهام تلقائية)</option>
              {TASK_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="الأتعاب المتفق عليها (د.إ)">
          <input
            type="number"
            value={form.fee ?? ""}
            onChange={onFieldChange("fee")}
            placeholder="0.00"
            className={inputCls}
          />
        </Field>

        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          {editingCase ? "حفظ التعديلات" : "حفظ وحفظ القضية"}
        </button>
      </div>
    </Modal>
  );
}
