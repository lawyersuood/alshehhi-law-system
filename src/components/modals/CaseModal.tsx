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
import type { CaseItem, Client, KycItem } from "../../domain/types";
import { normalizeArabicNameForMatch, extractCandidateNamesFromText } from "../../domain/utils";

export interface CaseModalProps {
  editingCase: CaseItem | null;
  clients: Client[];
  cases?: CaseItem[];
  kyc?: KycItem[];
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
  cases = [],
  kyc = [],
  form,
  setForm,
  onFieldChange,
  onSave,
  onClose,
}: CaseModalProps) {
  const opponents: string[] = form.opponents && form.opponents.length > 0 ? form.opponents : [""];

  // (Phase-3) فحص أولي لتعارض المصالح: مطابقة نصية مع تطبيع الأسماء العربية (تجاهل اختلاف
  // الهمزات إأآا، التاء المربوطة/الهاء، الألف المقصورة/الياء، التشكيل، والمسافات الزائدة)
  // لأسماء الخصوم المُدخلة مقابل أسماء الموكلين الحاليين وأسماء الخصوم في القضايا الأخرى.
  // هذا فحص إرشادي غير حاسم (non-blocking) يُنبّه المحامي فقط، ولا يمنع الحفظ.
  const normalize = (s: string) => normalizeArabicNameForMatch(s);
  const conflictMatches: string[] = [];
  const seen = new Set<string>();
  for (const rawOpp of opponents) {
    const opp = normalize(rawOpp);
    if (opp.length < 3) continue;
    for (const c of clients) {
      const name = normalize(c.name || "");
      if (name && (name.includes(opp) || opp.includes(name))) {
        const label = `الموكل "${c.name}" يطابق اسم الخصم المُدخل "${rawOpp}"`;
        if (!seen.has(label)) {
          seen.add(label);
          conflictMatches.push(label);
        }
      }
    }
    for (const cs of cases) {
      if (editingCase && cs.id === editingCase.id) continue;
      const csOpponents: string[] = (cs as any).opponents || [];
      for (const o of csOpponents) {
        const name = normalize(o || "");
        if (name && (name.includes(opp) || opp.includes(name))) {
          const label = `الخصم "${o}" مطابق في القضية رقم ${cs.number || cs.id} (يُحتمل تعارض مصالح)`;
          if (!seen.has(label)) {
            seen.add(label);
            conflictMatches.push(label);
          }
        }
      }
    }
  }
  // (تحسين "الدرجة الثانية") فحص تعارض مبني على المستفيد الحقيقي (UBO) المُصرَّح به في ملفات
  // KYC — تعارض المصالح الحقيقي في الممارسة الإماراتية غالباً لا يظهر من مطابقة اسم الموكل/الخصم
  // مباشرة، بل عبر هيكل الملكية: قد يكون الخصم نفسه هو المالك المستفيد لموكل قائم، أو قد يشترك
  // موكلان في نفس المالك المستفيد (شركات تابعة لنفس المجموعة). بما أن حقل UBO نص حر، هذا الفحص
  // إرشادي (heuristic) قائم على استخراج أسماء مرشّحة من النص — غير حاسم ولا يمنع الحفظ.
  const latestKycByClient = new Map<string, KycItem>();
  for (const k of kyc) {
    if (k.archived) continue;
    const key = String(k.clientId);
    const existing = latestKycByClient.get(key);
    if (!existing || String(k.lastReview || "") > String(existing.lastReview || "")) {
      latestKycByClient.set(key, k);
    }
  }
  for (const rawOpp of opponents) {
    const opp = normalize(rawOpp);
    if (opp.length < 3) continue;
    for (const c of clients) {
      const record = latestKycByClient.get(String(c.id));
      if (!record?.ubo) continue;
      const uboNames = extractCandidateNamesFromText(record.ubo);
      for (const uboName of uboNames) {
        if (uboName.includes(opp) || opp.includes(uboName)) {
          const label = `⚠️ (فحص UBO) الخصم "${rawOpp}" يطابق اسماً مذكوراً في المستفيد الحقيقي (UBO) لملف KYC الخاص بالموكل "${c.name}" — يُحتمل أن يكون الخصم مالكاً مستفيداً أو طرفاً ذا صلة بموكل قائم`;
          if (!seen.has(label)) {
            seen.add(label);
            conflictMatches.push(label);
          }
        }
      }
    }
  }
  // اشتراك موكلَين في نفس المالك المستفيد (نفس المجموعة الاقتصادية) — تنبيه توعوي فقط لأنه ليس
  // تعارضاً بالضرورة، لكن يستحق مراجعة يدوية قبل قبول التوكيل الجديد إذا كان أحدهما خصماً في الآخر.
  if (form.clientId) {
    const selectedRecord = latestKycByClient.get(String(form.clientId));
    if (selectedRecord?.ubo) {
      const selectedUboNames = extractCandidateNamesFromText(selectedRecord.ubo);
      for (const c of clients) {
        if (String(c.id) === String(form.clientId)) continue;
        const otherRecord = latestKycByClient.get(String(c.id));
        if (!otherRecord?.ubo) continue;
        const otherUboNames = extractCandidateNamesFromText(otherRecord.ubo);
        const sharedOwner = selectedUboNames.find((n1) =>
          otherUboNames.some((n2) => n1.includes(n2) || n2.includes(n1)),
        );
        if (sharedOwner) {
          const isOpponentElsewhere = cases.some((cs) => {
            if (editingCase && cs.id === editingCase.id) return false;
            const csOpponents: string[] = (cs as any).opponents || [];
            return csOpponents.some((o) => {
              const n = normalize(o || "");
              return n && (n.includes(normalize(c.name)) || normalize(c.name).includes(n));
            });
          });
          if (isOpponentElsewhere) {
            const label = `⚠️ (فحص UBO) الموكل المختار يشترك في نفس المستفيد الحقيقي (UBO) مع الموكل "${c.name}"، والأخير طرف خصومة في قضية أخرى — يُنصح بمراجعة تعارض المصالح على مستوى المجموعة الاقتصادية`;
            if (!seen.has(label)) {
              seen.add(label);
              conflictMatches.push(label);
            }
          }
        }
      }
    }
  }
  // كذلك: هل اسم الموكل الجديد نفسه يطابق خصماً موجوداً في قضية أخرى؟
  const selectedClientName = normalize(
    clients.find((c) => String(c.id) === String(form.clientId))?.name || "",
  );
  if (selectedClientName.length >= 3) {
    for (const cs of cases) {
      if (editingCase && cs.id === editingCase.id) continue;
      const csOpponents: string[] = (cs as any).opponents || [];
      for (const o of csOpponents) {
        const name = normalize(o || "");
        if (name && (name.includes(selectedClientName) || selectedClientName.includes(name))) {
          const label = `الموكل المختار يطابق اسم الخصم "${o}" في القضية رقم ${cs.number || cs.id}`;
          if (!seen.has(label)) {
            seen.add(label);
            conflictMatches.push(label);
          }
        }
      }
    }
  }

  return (
    <Modal
      title={editingCase ? `تعديل بيانات القضية رقم ${editingCase.number}` : "قيد قضية جديدة"}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        {conflictMatches.length > 0 && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800 space-y-1">
            <p className="font-bold">
              ⚠️ قد يوجد تعارض محتمل في المصالح — الاسم يطابق موكلاً أو خصماً في قضية أخرى:
            </p>
            <ul className="list-disc pr-4 space-y-0.5">
              {conflictMatches.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <p className="text-[11px] text-red-700">
              هذا تنبيه إرشادي مبني على مطابقة نصية بسيطة ولا يمنع الحفظ — يُرجى مراجعته يدوياً قبل
              قبول التوكيل.
            </p>
          </div>
        )}
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
