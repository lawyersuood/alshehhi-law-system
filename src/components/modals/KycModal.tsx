import { Modal, Field } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { FUND_SOURCES, SANCTIONS_STATES } from "../../domain/constants";
import type { Client } from "../../domain/types";

export interface KycModalProps {
  modal: "kyc" | "kyc-edit";
  clients: Client[];
  form: Record<string, any>;
  setForm: (updater: Record<string, any>) => void;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "إضافة/تعديل سجل اعرف عميلك (KYC)" — الخطوة السادسة عشرة من تفكيك App.tsx التدريجي.
 */
export default function KycModal({
  modal,
  clients,
  form,
  setForm,
  onFieldChange,
  onSave,
  onClose,
}: KycModalProps) {
  return (
    <Modal
      title={modal === "kyc-edit" ? "تعديل سجل اعرف عميلك (KYC)" : "إضافة سجل اعرف عميلك جديد"}
      onClose={onClose}
      wide
    >
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الموكل المعني">
            <select
              onChange={onFieldChange("clientId")}
              value={form.clientId || ""}
              className={inputCls}
            >
              <option value="">إختر الموكل…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </Field>
          <Field label="الجنسية / دولة التأسيس">
            <input
              onChange={onFieldChange("nationality")}
              defaultValue={form.nationality || "الإمارات"}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="نوع وثيقة الإثبات">
            <input
              onChange={onFieldChange("idType")}
              defaultValue={form.idType || "هوية إماراتية"}
              placeholder="رخصة تجارية / جواز سفر..."
              className={inputCls}
            />
          </Field>
          <Field label="تاريخ انتهاء الوثيقة">
            <input
              type="date"
              onChange={onFieldChange("idExpiry")}
              defaultValue={form.idExpiry || ""}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="المستفيد الحقيقي (UBO) والتملك النهائي">
          <textarea
            onChange={onFieldChange("ubo")}
            defaultValue={form.ubo || ""}
            rows={2}
            placeholder="أسماء الأشخاص الطبيعيين المالكين لـ 25% أو أكثر من رأس المال أو حق التصويت..."
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="مصدر الأموال والنشاط الرئيسي">
            <select
              onChange={onFieldChange("sourceOfFunds")}
              defaultValue={form.sourceOfFunds || FUND_SOURCES[0]}
              className={inputCls}
            >
              {FUND_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="هل الموكل معرّض سياسيًا (PEP)؟">
            <select
              onChange={(e) => setForm({ ...form, pep: e.target.value === "نعم" })}
              value={form.pep ? "نعم" : "لا"}
              className={inputCls}
            >
              <option value="لا">لا (شخص عادي)</option>
              <option value="نعم">نعم (يشغل منصباً عاماً أو أقرباؤه)</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="فحص قوائم العقوبات">
            <select
              onChange={onFieldChange("sanctions")}
              defaultValue={form.sanctions || "سليم"}
              className={inputCls}
            >
              {SANCTIONS_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="تقييم درجة المخاطر">
            <select
              onChange={onFieldChange("risk")}
              defaultValue={form.risk || "منخفض"}
              className={inputCls}
            >
              <option>منخفض</option>
              <option>متوسط</option>
              <option>مرتفع</option>
            </select>
          </Field>
          <Field label="حالة ملف KYC">
            <select
              onChange={onFieldChange("status")}
              defaultValue={form.status || "مكتمل"}
              className={inputCls}
            >
              <option>مكتمل</option>
              <option>قيد المراجعة</option>
              <option>ناقص</option>
            </select>
          </Field>
        </div>

        <Field label="ملاحظات العناية الواجبة والتحقق">
          <textarea
            onChange={onFieldChange("notes")}
            defaultValue={form.notes || ""}
            rows={2}
            placeholder="أي نتائج فحص أو وثائق إضافية تم الاطلاع عليها..."
            className={inputCls}
          />
        </Field>

        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
        >
          حفظ بيانات KYC والتحديث
        </button>
      </div>
    </Modal>
  );
}
