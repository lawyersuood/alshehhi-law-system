import React from "react";
import { FileCheck, Sparkles, Edit2, CreditCard, Plus, Trash2, FolderOpen, CheckCircle2 } from "lucide-react";
import { Field } from "./AuthScreens";
import { Client, OfficeAgreement, RolePermissions } from "../domain/types";
import { VAT_RATE } from "../domain/constants";
import { fmtAED, fmtDate } from "../domain/utils";

const inputCls = "w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all";

export interface OfficeAgreementViewProps {
  setShowAgreementAiUploadModal: (v: boolean) => void;
  agrForm: any;
  setAgr: (k: string, v: any) => void;
  clients: Client[];
  addAgrInst: () => void;
  setAgrInst: (idx: number, k: string, v: any) => void;
  removeAgrInst: (idx: number) => void;
  agrTotal: number;
  saveOfficeAgreement: () => void;
  officeAgreements: OfficeAgreement[];
  setAgrPreviewId: (id: number | null) => void;
  checkPerm: (permKey: keyof RolePermissions, actionName: string, context?: any) => boolean;
  setDeleteAgrConfirm: (a: OfficeAgreement | null) => void;
}

export default function OfficeAgreementView({
  setShowAgreementAiUploadModal,
  agrForm,
  setAgr,
  clients,
  addAgrInst,
  setAgrInst,
  removeAgrInst,
  agrTotal,
  saveOfficeAgreement,
  officeAgreements,
  setAgrPreviewId,
  checkPerm,
  setDeleteAgrConfirm,
}: OfficeAgreementViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="text-amber-600" /> اتفاقية أتعاب المحاماة المعتمدة (النموذج الثنائي اللغة)
          </h2>
          <p className="text-xs text-slate-500">
            عبّئ البيانات المتغيرة فقط — البنود (1-8) ثابتة. عند الحفظ: يُضاف الموكل تلقائياً لقائمة الموكلين،
            وتُنشأ اتفاقية الأتعاب برقم AGR، وتنزل الدفعات تلقائياً إلى سجل الدفعات وسندات القبض.
          </p>
        </div>
        <button
          onClick={() => setShowAgreementAiUploadModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-800 to-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:opacity-95 shadow-sm transition cursor-pointer"
        >
          <Sparkles size={16} className="text-amber-400 animate-pulse" /> ارفاق اتفاقية قديمة PDF (سحب البيانات آلياً)
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ───── نموذج إدخال البيانات المتغيرة ───── */}
        <div className="lg:col-span-2 space-y-4 app-card p-5">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Edit2 size={16} className="text-amber-600" /> البيانات المتغيرة للاتفاقية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="تاريخ إبرام العقد">
              <input type="date" value={agrForm.contractDate} onChange={(e) => setAgr("contractDate", e.target.value)} className={inputCls} />
            </Field>
            <Field label="مكان الإبرام (المدينة)">
              <select value={agrForm.contractCity} onChange={(e) => setAgr("contractCity", e.target.value)} className={inputCls}>
                {["الشارقة", "دبي", "أبوظبي", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* اختيار موكل جديد أو موجود */}
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="clientMode" checked={agrForm.clientMode === "new"} onChange={() => setAgr("clientMode", "new")} className="accent-amber-600" />
                موكل جديد (يُضاف تلقائياً لقائمة الموكلين)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="clientMode" checked={agrForm.clientMode === "existing"} onChange={() => setAgr("clientMode", "existing")} className="accent-amber-600" />
                موكل مسجل مسبقاً
              </label>
            </div>

            {agrForm.clientMode === "existing" ? (
              <Field label="اختر الموكل">
                <select value={agrForm.existingClientId} onChange={(e) => setAgr("existingClientId", e.target.value)} className={inputCls}>
                  <option value="">اختر الموكل…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </Field>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="اسم الموكل (عربي)">
                    <input value={agrForm.clientNameAr} onChange={(e) => setAgr("clientNameAr", e.target.value)} placeholder="مثال: يو اس كي للمعادن ذ.م.م" className={inputCls} />
                  </Field>
                  <Field label="Client Name (English)">
                    <input dir="ltr" value={agrForm.clientNameEn} onChange={(e) => setAgr("clientNameEn", e.target.value)} placeholder="e.g. U.S.K. Metals L.L.C." className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="الصفة">
                    <select value={agrForm.clientType} onChange={(e) => setAgr("clientType", e.target.value)} className={inputCls}>
                      <option>شركة</option>
                      <option>فرد</option>
                    </select>
                  </Field>
                  <Field label="الهوية / الرخصة التجارية">
                    <input value={agrForm.idNo} onChange={(e) => setAgr("idNo", e.target.value)} placeholder="رقم الهوية أو الرخصة" className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="البريد الإلكتروني">
                    <input dir="ltr" value={agrForm.email} onChange={(e) => setAgr("email", e.target.value)} placeholder="client@email.ae" className={inputCls} />
                  </Field>
                  <Field label="الإمارة">
                    <select value={agrForm.emirate} onChange={(e) => setAgr("emirate", e.target.value)} className={inputCls}>
                      {["الشارقة", "دبي", "أبوظبي", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((em) => (
                        <option key={em}>{em}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="ويمثلها / يمثله (عربي)">
                <input value={agrForm.representativeAr} onChange={(e) => setAgr("representativeAr", e.target.value)} placeholder="مثال: خالد بشير أوان بن محمد بشير" className={inputCls} />
              </Field>
              <Field label="Represented by (English)">
                <input dir="ltr" value={agrForm.representativeEn} onChange={(e) => setAgr("representativeEn", e.target.value)} placeholder="e.g. Khalid Bashir Awan bin Muhammad Bashir" className={inputCls} />
              </Field>
            </div>

            <Field label="هاتف رقم">
              <input dir="ltr" value={agrForm.phone} onChange={(e) => setAgr("phone", e.target.value)} placeholder="0553064565" className={inputCls} />
            </Field>
          </div>

          <Field label="تفاصيل القضية (عربي)">
            <textarea rows={2} value={agrForm.caseDetailsAr} onChange={(e) => setAgr("caseDetailsAr", e.target.value)} placeholder="مثال: العمل على القضية رقم 52/2026 — تنفيذ شيكات أم القيوين وأيضاً عمل نزاع موضوعي بالتنفيذ نفسه فقط." className={inputCls} />
          </Field>
          <Field label="Case Details (English)">
            <textarea dir="ltr" rows={2} value={agrForm.caseDetailsEn} onChange={(e) => setAgr("caseDetailsEn", e.target.value)} placeholder="e.g. Working on Case No. 52/2026 — Umm Al Quwain Check Execution..." className={inputCls} />
          </Field>

          {/* ───── جدول الدفعات ───── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <CreditCard size={14} /> قيمة العقد والدفعات (تنزل تلقائياً إلى سجل الدفعات)
              </h4>
              <button onClick={addAgrInst} className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-white border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100">
                <Plus size={13} /> إضافة دفعة
              </button>
            </div>

            {agrForm.installments.map((inst: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-xl border border-amber-200/70">
                <div className="col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">مبلغ الدفعة {idx + 1} (د.إ)</label>
                  <input type="number" value={inst.amount} onChange={(e) => setAgrInst(idx, "amount", e.target.value)} placeholder="20000" className={inputCls} />
                </div>
                <div className="col-span-4">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">تاريخ الاستحقاق</label>
                  <input type="date" value={inst.dueDate} onChange={(e) => setAgrInst(idx, "dueDate", e.target.value)} className={inputCls} />
                </div>
                <div className="col-span-4 flex items-center gap-1.5 pb-2">
                  <input type="checkbox" checked={!!inst.paidOnSigning} onChange={(e) => setAgrInst(idx, "paidOnSigning", e.target.checked)} className="accent-emerald-600 h-4 w-4" id={`paid-${idx}`} />
                  <label htmlFor={`paid-${idx}`} className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                    مسددة عند التوقيع (يُنشأ سند قبض تلقائياً)
                  </label>
                </div>
                <div className="col-span-1 pb-1.5 text-center">
                  {agrForm.installments.length > 1 && (
                    <button onClick={() => removeAgrInst(idx)} className="text-slate-400 hover:text-red-600" title="حذف الدفعة">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between bg-slate-900 text-amber-400 rounded-xl px-4 py-2.5 text-sm font-bold">
              <span>إجمالي قيمة العقد:</span>
              <span className="font-mono">{fmtAED(agrTotal)}</span>
            </div>
            <p className="text-[11px] text-amber-900">
              + ضريبة القيمة المضافة 5% وفق البند (7): <b className="font-mono">{fmtAED(agrTotal * VAT_RATE)}</b> — الإجمالي شامل الضريبة: <b className="font-mono">{fmtAED(agrTotal * 1.05)}</b>
            </p>
          </div>

          <button onClick={saveOfficeAgreement} className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white hover:bg-slate-700 shadow-sm flex items-center justify-center gap-2">
            <FileCheck size={18} className="text-amber-400" />
            حفظ الاتفاقية (إضافة الموكل + إنشاء اتفاقية الأتعاب + تنزيل الدفعات تلقائياً)
          </button>
        </div>

        {/* ───── أرشيف الاتفاقيات المنشأة ───── */}
        <div className="space-y-3">
          <div className="app-card p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <FolderOpen size={16} className="text-amber-600" /> أرشيف الاتفاقيات المنشأة ({officeAgreements.length})
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">اضغط على أي اتفاقية لمعاينتها وطباعتها مجدداً</p>
            <div className="space-y-2">
              {officeAgreements.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">لم تُنشأ أي اتفاقية بعد</p>
              )}
              {officeAgreements.map((a) => (
                <div key={a.id} className="group flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 p-3 hover:border-amber-400 hover:bg-[#0D382B]/[0.025] transition">
                  <button onClick={() => setAgrPreviewId(a.id)} className="flex-1 text-right">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">{a.agreementNumber}</span>
                      <span className="text-[10px] text-slate-400">{fmtDate(a.contractDate)}</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-1.5 truncate">{a.clientNameAr}</p>
                    <p className="text-[11px] text-slate-500 truncate">{a.caseDetailsAr}</p>
                    <p className="text-[11px] font-mono font-bold text-emerald-700 mt-1">{fmtAED(a.totalAmount)} — {a.installments.length} دفعة</p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!checkPerm("deleteAgreements", "حذف اتفاقية الأتعاب")) return;
                      setDeleteAgrConfirm(a);
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 transition"
                    title="حذف الاتفاقية"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[11px] text-emerald-900 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5"><CheckCircle2 size={14} /> ماذا يحدث تلقائياً عند الحفظ؟</p>
            <p>1️⃣ الموكل الجديد يُضاف مباشرة إلى تبويب "الموكلين".</p>
            <p>2️⃣ تُنشأ اتفاقية أتعاب برقم AGR تلقائي في "اتفاقيات الأتعاب".</p>
            <p>3️⃣ الدفعات تنزل كجدول أقساط، والمسددة عند التوقيع يُنشأ لها سند قبض في "سندات القبض والدفعات".</p>
            <p>4️⃣ تُحفظ نسخة الاتفاقية بالأرشيف للطباعة في أي وقت.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
