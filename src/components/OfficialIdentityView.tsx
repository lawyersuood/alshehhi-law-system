import React from "react";
import { Stamp, Lock, UserCog, UploadCloud, Trash2, History } from "lucide-react";
import { AuditLogEntry, LetterheadConfig } from "../domain/types";
import { OFFICE_HEADER_IMG, OFFICE_FOOTER_IMG } from "../domain/constants";

export interface OfficialIdentityViewProps {
  canManageLetterhead: boolean;
  letterhead: LetterheadConfig;
  updateLetterhead: (partial: Partial<LetterheadConfig>) => void;
  deriveHeaderFooterFromFullPage: (fullPageDataUrl: string) => Promise<{ headerImg: string; footerImg: string }>;
  logAuditAction: (...args: any[]) => void;
  currentUser: { name: string };
  auditLogs: AuditLogEntry[];
}

export default function OfficialIdentityView({
  canManageLetterhead,
  letterhead,
  updateLetterhead,
  deriveHeaderFooterFromFullPage,
  logAuditAction,
  currentUser,
  auditLogs,
}: OfficialIdentityViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Stamp className="text-amber-600" /> إدارة الهوية الرسمية والأختام
        </h2>
        <p className="text-xs text-slate-500">القسم المحمي الوحيد لإدارة صور الورق الرسمي والتوقيع والختم المعتمدة، واستخدامها في جميع مستندات المكتب</p>
      </div>

      {!canManageLetterhead && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
          <Lock size={14} /> هذا القسم محمي بالكامل — تعديل الورق الرسمي والتوقيع والختم متاح فقط لمدير النظام أو من يملك صلاحية "إدارة الهوية الرسمية" الحساسة.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 flex items-start gap-2">
        <UserCog size={14} className="mt-0.5 shrink-0" />
        <span>بعد اعتماد الصور هنا، يمكن لمدير النظام منح المستخدمين الموثوقين صلاحية "إدراج التوقيع والختم في المستندات الصادرة" من تبويب المستخدمين والصلاحيات — لتمكينهم من إدراج التوقيع والختم عند إصدار الخطابات والإنابات واتفاقيات الأتعاب، دون منحهم صلاحية تعديل هذه الصور.</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* الورق الرسمي الكامل — صورة واحدة لكامل صفحة A4 (تُشتق منها الترويسة والتذييل تلقائياً) */}
        <div className="app-card p-6 space-y-4 md:col-span-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            الورق الرسمي الكامل (صفحة A4 واحدة)
          </h3>
          <p className="text-[11px] text-slate-500 -mt-2">
            ارفعي صورة واحدة عالية الدقة لكامل صفحة الورق الرسمي الفارغة (بدون نص، بمقاس A4 كامل). يستخرج النظام منها تلقائياً شريطي الترويسة العلوية والتذييل السفلي المستخدمَين في جميع الخطابات والاتفاقيات، دون الحاجة لرفع صورتين منفصلتين.
          </p>
          {letterhead.fullPageImg ? (
            <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
              <img src={letterhead.fullPageImg} alt="الورق الرسمي الكامل" className="max-h-[420px] mx-auto object-contain" style={{ aspectRatio: "210 / 297" }} />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs space-y-1">
              <p>لم يتم رفع صورة الورق الرسمي الكاملة بعد.</p>
              <p>النظام يستخدم حالياً الترويسة والتذييل السابقين (المنفصلين) إلى حين رفعها.</p>
            </div>
          )}
          {canManageLetterhead && (
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-[#0c4a47] py-2 text-xs font-bold text-white hover:bg-[#073331] transition">
                <UploadCloud size={14} /> رفع صورة الورق الرسمي الكاملة
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      const dataUrl = ev.target?.result as string;
                      try {
                        const { headerImg, footerImg } = await deriveHeaderFooterFromFullPage(dataUrl);
                        updateLetterhead({ fullPageImg: dataUrl, headerImg, footerImg });
                        logAuditAction("UPDATE", "الورق الرسمي", "الورق الرسمي الكامل (A4)", `قام المستخدم "${currentUser.name}" برفع صورة واحدة كاملة للورق الرسمي، واستُخرجت منها الترويسة والتذييل تلقائياً`);
                      } catch (err) {
                        alert("تعذّر معالجة الصورة المرفوعة. يرجى التأكد من أنها ملف صورة صالح (JPEG أو PNG) والمحاولة مجدداً.");
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {letterhead.fullPageImg && (
                <button
                  onClick={() => {
                    updateLetterhead({ fullPageImg: "", headerImg: OFFICE_HEADER_IMG, footerImg: OFFICE_FOOTER_IMG });
                    logAuditAction("UPDATE", "الورق الرسمي", "الورق الرسمي الكامل (A4)", `قام المستخدم "${currentUser.name}" باستعادة الورق الرسمي الافتراضي`);
                  }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#0D382B]/[0.08] transition-colors"
                  title="استعادة الورق الرسمي الافتراضي"
                >
                  استعادة
                </button>
              )}
            </div>
          )}
        </div>

        {/* التوقيع Signature */}
        <div className="app-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            صورة التوقيع (Signature)
          </h3>
          {letterhead.signatureImg ? (
            <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
              <img src={letterhead.signatureImg} alt="Signature" className="max-h-28 mx-auto object-contain" />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
              لم يتم رفع صورة توقيع بعد
            </div>
          )}
          {canManageLetterhead && (
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-[#0c4a47] py-2 text-xs font-bold text-white hover:bg-[#073331] transition">
                <UploadCloud size={14} /> رفع/استبدال صورة التوقيع
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      updateLetterhead({ signatureImg: dataUrl });
                      logAuditAction("UPDATE", "الورق الرسمي", "صورة التوقيع (Signature)", `قام المستخدم "${currentUser.name}" برفع/تغيير صورة التوقيع المعتمدة`);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {letterhead.signatureImg && (
                <button
                  onClick={() => {
                    updateLetterhead({ signatureImg: "" });
                    logAuditAction("UPDATE", "الورق الرسمي", "صورة التوقيع (Signature)", `قام المستخدم "${currentUser.name}" بحذف صورة التوقيع المعتمدة`);
                  }}
                  className="rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-2 text-xs font-semibold hover:bg-red-100"
                  title="حذف صورة التوقيع"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* الختم Stamp */}
        <div className="app-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            صورة الختم الرسمي (Stamp)
          </h3>
          {letterhead.stampImg ? (
            <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
              <img src={letterhead.stampImg} alt="Stamp" className="max-h-28 mx-auto object-contain" />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
              لم يتم رفع صورة ختم بعد
            </div>
          )}
          {canManageLetterhead && (
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-[#0c4a47] py-2 text-xs font-bold text-white hover:bg-[#073331] transition">
                <UploadCloud size={14} /> رفع/استبدال صورة الختم
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      updateLetterhead({ stampImg: dataUrl });
                      logAuditAction("UPDATE", "الورق الرسمي", "صورة الختم (Stamp)", `قام المستخدم "${currentUser.name}" برفع/تغيير صورة الختم المعتمدة`);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {letterhead.stampImg && (
                <button
                  onClick={() => {
                    updateLetterhead({ stampImg: "" });
                    logAuditAction("UPDATE", "الورق الرسمي", "صورة الختم (Stamp)", `قام المستخدم "${currentUser.name}" بحذف صورة الختم المعتمدة`);
                  }}
                  className="rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-2 text-xs font-semibold hover:bg-red-100"
                  title="حذف صورة الختم"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* سجل تتبع استخدام الهوية الرسمية */}
      <div className="app-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
          <History size={16} className="text-amber-600" />
          <h3 className="font-bold text-slate-800 text-sm">سجل تتبع الاستخدام — من ومتى استخدم الهوية الرسمية</h3>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/80">
          {auditLogs.filter((l) => l.targetModule === "الورق الرسمي").length === 0 ? (
            <p className="p-5 text-center text-xs text-slate-400">لا يوجد أي نشاط مسجل بعد على الهوية الرسمية</p>
          ) : (
            auditLogs.filter((l) => l.targetModule === "الورق الرسمي").slice(0, 60).map((l) => (
              <div key={l.id} className="px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-700 truncate">{l.userName} <span className="font-normal text-slate-400">— {l.details}</span></p>
                </div>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">{l.formattedTimestamp || l.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
