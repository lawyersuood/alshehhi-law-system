import React from "react";
import { FolderOpen, FileText, Stamp, Copy, Printer, Plus, Trash2 } from "lucide-react";
import { Field } from "./AuthScreens";
import OfficialLetterComposer from "../OfficialLetterComposer";
import { CaseItem, Client, DocItem, RolePermissions } from "../domain/types";
import { DOC_TEMPLATES, FIRM_NAME, FIRM_TAGLINE } from "../domain/constants";
import { fmtDate, todayISO, caseOpponentsLabel } from "../domain/utils";

const inputCls = "w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all";

export interface DocsViewProps {
  docSubTab: "archive" | "generator" | "officialLetters";
  setDocSubTab: (v: "archive" | "generator" | "officialLetters") => void;
  canManageLetterhead: boolean;
  canUseSignatureStamp: boolean;
  letterhead: { headerImg?: string; footerImg?: string; signatureImg?: string; stampImg?: string };
  logAuditAction: (...args: any[]) => void;
  currentUser: { name: string };
  selectedTemplateId: string;
  setSelectedTemplateId: (v: string) => void;
  cases: CaseItem[];
  selectedGenCaseId: number;
  setSelectedGenCaseId: (v: number) => void;
  clients: Client[];
  clientName: (id: number) => string;
  docs: DocItem[];
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  requestDelete: (opts: {
    section: string;
    title: string;
    details: string;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  }) => void;
  setDocs: (updater: (prev: DocItem[]) => DocItem[]) => void;
}

export default function DocsView({
  docSubTab,
  setDocSubTab,
  canManageLetterhead,
  canUseSignatureStamp,
  letterhead,
  logAuditAction,
  currentUser,
  selectedTemplateId,
  setSelectedTemplateId,
  cases,
  selectedGenCaseId,
  setSelectedGenCaseId,
  clients,
  clientName,
  docs,
  openModalWithCheck,
  requestDelete,
  setDocs,
}: DocsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setDocSubTab("archive")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${docSubTab === "archive" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <FolderOpen size={18} /> أرشيف المستندات والقضايا
        </button>
        <button
          onClick={() => setDocSubTab("generator")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${docSubTab === "generator" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <FileText size={18} /> 📜 مولّد المستندات والصحائف التلقائي
        </button>
        <button
          onClick={() => setDocSubTab("officialLetters")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${docSubTab === "officialLetters" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <FileText size={18} /> 📜 الخطابات والمذكرات الرسمية
        </button>
      </div>

      {!canManageLetterhead && !canUseSignatureStamp && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800 flex items-center gap-2">
          <Stamp size={14} /> إدارة صور الورق الرسمي والتوقيع والختم انتقلت إلى قسم "الهوية الرسمية والأختام" المحمي في القائمة الجانبية.
        </div>
      )}

      {docSubTab === "officialLetters" ? (
        <OfficialLetterComposer
          canManageAssets={canManageLetterhead}
          canUseSignatureStamp={canUseSignatureStamp}
          headerImg={letterhead.headerImg}
          footerImg={letterhead.footerImg}
          signatureImg={letterhead.signatureImg}
          stampImg={letterhead.stampImg}
          onUsageLog={(action: string, details: string) => logAuditAction("UPDATE", "الورق الرسمي", action, `قام المستخدم "${currentUser.name}" ${details}`)}
        />
      ) : docSubTab === "generator" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="text-amber-600" /> توليد النماذج والمذكرات القانونية تلقائياً
              </h2>
              <p className="text-xs text-slate-500">تعبئة القوالب الرسمية تلقائياً ببيانات الموكل والدعوى لسرعة التقديم بالمحكمة</p>
            </div>
          </div>

          {(() => {
            const selTpl = DOC_TEMPLATES.find((t) => t.id === selectedTemplateId) || DOC_TEMPLATES[0];
            const selCs = cases.find((c) => c.id === selectedGenCaseId) || cases[0];
            const selClient = selCs ? clients.find((cl) => cl.id === selCs.clientId) : null;

            const generatedContent = selTpl && selCs ? selTpl.templateBody
              .replace(/\{\{CASE_NUMBER\}\}/g, selCs.number)
              .replace(/\{\{CLIENT_NAME\}\}/g, selClient ? selClient.name : "—")
              .replace(/\{\{CLIENT_ID_NO\}\}/g, selClient ? selClient.idNo : "—")
              .replace(/\{\{COURT\}\}/g, selCs.court)
              .replace(/\{\{OPPONENT\}\}/g, caseOpponentsLabel(selCs))
              .replace(/\{\{CASE_SUBJECT\}\}/g, selCs.subject)
              .replace(/\{\{CASE_FEE\}\}/g, selCs.fee ? selCs.fee.toLocaleString("ar-AE") : "0")
              .replace(/\{\{TODAY_DATE\}\}/g, fmtDate(todayISO()))
              : "";

            return (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* اختيار القالب والقضية */}
                <div className="space-y-4 app-card p-5">
                  <Field label="اختر قالب المستند">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className={inputCls}
                    >
                      {DOC_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="اختر القضية لربط البيانات">
                    <select
                      value={selectedGenCaseId}
                      onChange={(e) => setSelectedGenCaseId(Number(e.target.value))}
                      className={inputCls}
                    >
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>{c.number} — {clientName(c.clientId)}</option>
                      ))}
                    </select>
                  </Field>

                  {selTpl && selCs && (
                    <div className="space-y-3 pt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedContent);
                          alert("تم نسخ نص المستند المكتمل إلى المحفظة بنجاح!");
                        }}
                        className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-900 hover:bg-amber-400 flex items-center justify-center gap-2"
                      >
                        <Copy size={16} /> نسخ النص القانوني
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 flex items-center justify-center gap-2"
                      >
                        <Printer size={16} /> طباعة / حفظ PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* معاينة المستند المكتمل */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-300 bg-white p-8 shadow-md font-serif space-y-4 text-slate-900 leading-relaxed text-sm">
                  <div className="text-center border-b-2 border-slate-900 pb-4">
                    <h3 className="text-xl font-bold">{FIRM_NAME}</h3>
                    <p className="text-xs text-slate-600 mt-1 font-sans">{FIRM_TAGLINE}</p>
                    <h4 className="text-lg font-bold mt-4 text-amber-800">{selTpl.title}</h4>
                  </div>

                  <div className="whitespace-pre-wrap font-mono text-xs leading-loose bg-stone-50 p-6 rounded-xl border border-stone-200">
                    {generatedContent}
                  </div>

                  <div className="flex justify-between items-center pt-6 text-xs font-sans border-t border-slate-200">
                    <span>التاريخ: {fmtDate(todayISO())}</span>
                    <span className="flex items-center gap-2">
                      {canUseSignatureStamp && (letterhead.signatureImg || letterhead.stampImg) ? (
                        <span className="relative inline-block h-12 w-24">
                          {letterhead.stampImg && (
                            <img src={letterhead.stampImg} alt="ختم" className="absolute top-0 right-0 h-12 w-12 object-contain opacity-90 -rotate-6" />
                          )}
                          {letterhead.signatureImg && (
                            <img src={letterhead.signatureImg} alt="توقيع" className="absolute bottom-0 left-0 h-8 object-contain" />
                          )}
                        </span>
                      ) : null}
                      <span className="font-bold">توقيع المحامي وختم المكتب الرسمي</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : docSubTab === "archive" ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">الأرشيف والمستندات</h2>
              <p className="text-xs text-slate-500">صحائف الدعوى، المذكرات، وعقود الخبرة</p>
            </div>
            <button onClick={() => openModalWithCheck("doc", "manageDocs")} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"><Plus size={16} /> رفع مستند</button>
          </div>
          {docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <FolderOpen size={24} />
              </div>
              <p className="text-sm font-bold text-slate-800">لا توجد مستندات مرفوعة بالأرشيف حالياً</p>
              <p className="text-xs text-slate-500 max-w-sm">
                يمكنك رفع صحائف الدعوى، المذكرات، وعقود الخبرة هنا لأرشفتها وربطها بالقضايا.
              </p>
              <button
                onClick={() => openModalWithCheck("doc", "manageDocs")}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <Plus size={15} /> رفع مستند جديد
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((d) => (
                <div key={d.id} className="app-card p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><FolderOpen size={20} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{d.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{d.type} • {fmtDate(d.date)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">بواسطة: {d.by}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      requestDelete({
                        section: "الأرشيف والمستندات",
                        title: `المستند: ${d.name}`,
                        details: `النوع: ${d.type} | التاريخ: ${fmtDate(d.date)} | المضاف بواسطة: ${d.by}`,
                        permKey: "deleteDocs",
                        actionName: "حذف المستند من الأرشيف",
                        onConfirm: () => {
                          logAuditAction("DELETE", "الأرشيف", `مستند: ${d.name}`, `حذف المستند ${d.name} من الأرشيف`, d.id);
                          setDocs((prev) => prev.filter((x) => x.id !== d.id));
                        },
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
                    title="حذف المستند"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
