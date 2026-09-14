import React from "react";
import {
  Mail,
  Settings,
  Trash2,
  RefreshCw,
  Plus,
  Inbox,
  Send,
  FileText,
  Search,
  Paperclip,
  Zap,
  ShieldCheck,
  Lock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Check,
  Receipt,
} from "lucide-react";
import { normalizeArabicSearch } from "../domain/utils";
import { Modal, Field } from "./AuthScreens";

const inputCls = "w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all";

export interface InAppEmailMessage {
  id: number | string;
  folder: "inbox" | "sent" | "draft" | "trash";
  sender: string;
  senderEmail: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface EmailConfig {
  email: string;
  senderName: string;
  appPassword?: string;
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  protocol: "ssl_tls" | "starttls" | "none";
  rejectUnauthorized: boolean;
  isConfigured: boolean;
  lastTestedAt?: string;
  lastTestStatus?: "success" | "failed";
}

export interface TestSmtpResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  code?: string;
  recommendation?: string;
  details?: any;
}

export interface TestInvoiceResult {
  success: boolean;
  message: string;
}

export interface InAppEmailViewProps {
  emailConfig: EmailConfig;
  setEmailConfig: React.Dispatch<React.SetStateAction<EmailConfig>>;
  inAppEmails: InAppEmailMessage[];
  setInAppEmails: React.Dispatch<React.SetStateAction<InAppEmailMessage[]>>;
  selectedEmailId: number | string | null;
  setSelectedEmailId: (id: number | string | null) => void;
  emailFolder: "inbox" | "sent" | "draft" | "trash";
  setEmailFolder: (folder: "inbox" | "sent" | "draft" | "trash") => void;
  emailSearch: string;
  setEmailSearch: (v: string) => void;
  showEmailSettingsModal: boolean;
  setShowEmailSettingsModal: (v: boolean) => void;
  showComposeEmail: boolean;
  setShowComposeEmail: (v: boolean) => void;
  composeTo: string;
  setComposeTo: (v: string) => void;
  composeSubject: string;
  setComposeSubject: (v: string) => void;
  composeBody: string;
  setComposeBody: (v: string) => void;
  composeAttachment: string;
  setComposeAttachment: (v: string) => void;
  testSmtpLoading: boolean;
  testSmtpResult: TestSmtpResult | null;
  setTestSmtpResult: React.Dispatch<React.SetStateAction<TestSmtpResult | null>>;
  testInvoiceLoading: boolean;
  testInvoiceRecipient: string;
  setTestInvoiceRecipient: (v: string) => void;
  testInvoiceResult: TestInvoiceResult | null;
  handleTestSmtpConnection: () => void;
  handleSendTestInvoice: () => void;
  handleSaveEmailSettings: () => void;
  handleSendInAppEmail: () => void;
  fetchSupabaseEmailMessages: () => Promise<void>;
  requestDelete: (opts: any) => void;
  logAuditAction: (...args: any[]) => void;
  saveStorage: (key: string, value: any) => void;
  setPermissionNotice: (msg: string) => void;
}

const matchesEmailSearch = (mail: { subject: string; sender: string; senderEmail: string }, search: string): boolean => {
  if (!search) return true;
  const q = normalizeArabicSearch(search);
  return (
    normalizeArabicSearch(mail.subject).includes(q) ||
    normalizeArabicSearch(mail.sender).includes(q) ||
    normalizeArabicSearch(mail.senderEmail).includes(q)
  );
};

export default function InAppEmailView({
  emailConfig,
  setEmailConfig,
  inAppEmails,
  setInAppEmails,
  selectedEmailId,
  setSelectedEmailId,
  emailFolder,
  setEmailFolder,
  emailSearch,
  setEmailSearch,
  showEmailSettingsModal,
  setShowEmailSettingsModal,
  showComposeEmail,
  setShowComposeEmail,
  composeTo,
  setComposeTo,
  composeSubject,
  setComposeSubject,
  composeBody,
  setComposeBody,
  composeAttachment,
  setComposeAttachment,
  testSmtpLoading,
  testSmtpResult,
  setTestSmtpResult,
  testInvoiceLoading,
  testInvoiceRecipient,
  setTestInvoiceRecipient,
  testInvoiceResult,
  handleTestSmtpConnection,
  handleSendTestInvoice,
  handleSaveEmailSettings,
  handleSendInAppEmail,
  fetchSupabaseEmailMessages,
  requestDelete,
  logAuditAction,
  saveStorage,
  setPermissionNotice,
}: InAppEmailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="text-amber-600" /> البريد الإلكتروني المدمج
          </h2>
          <p className="text-xs text-slate-500">متابعة إشعارات المحاكم، مراسلات الموكلين، ومستندات وزارة العدل عبر السيرفر الرسمي بمرونة كاملة</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>الحساب: <b>{emailConfig.email}</b></span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
              {emailConfig.smtpHost}:{emailConfig.smtpPort}
            </span>
          </div>

          <button
            onClick={() => setShowEmailSettingsModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
          >
            <Settings size={15} /> إعدادات البريد (SMTP)
          </button>

          {inAppEmails.length > 0 && (
            <button
              onClick={() => {
                requestDelete({
                  section: "البريد والمراسلات",
                  title: `تفريغ صندوق البريد (${inAppEmails.length} رسالة)`,
                  details: "سيتم حذف وتفريغ جميع الرسائل والمراسلات في البريد الإلكتروني الداخلي نهائياً.",
                  permKey: "deleteDocs",
                  actionName: "تفريغ البريد",
                  onConfirm: () => {
                    logAuditAction("DELETE", "البريد والمراسلات", "تفريغ صندوق البريد", `تم تفريغ وحذف كافة الرسائل في صندوق البريد الداخلي (${inAppEmails.length} رسالة).`, undefined, "مؤكد");
                    setInAppEmails([]);
                    saveStorage("firm_in_app_emails", []);
                    setSelectedEmailId(null);
                    setPermissionNotice("تم تفريغ صندوق البريد الإلكتروني بنجاح.");
                  },
                });
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Trash2 size={14} /> تفريغ البريد
            </button>
          )}

          <button
            onClick={async () => {
              // نجلب أولاً أي رسائل واردة حقيقية جديدة من صندوق البريد الفعلي (Titan Mail عبر IMAP)
              // ثم نُزامن جدول الرسائل من Supabase لعرضها في الواجهة.
              try {
                const res = await fetch("https://api.suoodlawhq.com/api/notifications/fetch-inbox", { method: "POST" });
                const data = await res.json().catch(() => null);
                await fetchSupabaseEmailMessages();
                if (data?.success && data.imported > 0) {
                  setPermissionNotice(`تم جلب ${data.imported} رسالة واردة جديدة ومزامنة البريد بنجاح!`);
                } else {
                  setPermissionNotice("تمت مزامنة الرسائل بنجاح!");
                }
              } catch (err) {
                await fetchSupabaseEmailMessages();
                setPermissionNotice("تمت مزامنة الرسائل بنجاح!");
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.08] transition-colors transition"
          >
            <RefreshCw size={14} /> تحديث
          </button>

          <button
            onClick={() => {
              setComposeTo("");
              setComposeSubject("");
              setComposeBody("");
              setComposeAttachment("");
              setShowComposeEmail(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400 transition shadow-sm"
          >
            <Plus size={16} /> إنشاء رسالة جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* المجلدات الجانبية */}
        <div className="lg:col-span-1 space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="text-xs font-bold text-slate-400 mb-2 px-1">المجلدات والصناديق</div>
          <button
            onClick={() => setEmailFolder("inbox")}
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "inbox" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
          >
            <span className="flex items-center gap-2"><Inbox size={16} /> الوارد (Inbox)</span>
            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
              {inAppEmails.filter(e => e.folder === "inbox" && !e.isRead).length}
            </span>
          </button>

          <button
            onClick={() => setEmailFolder("sent")}
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "sent" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
          >
            <span className="flex items-center gap-2"><Send size={16} /> الصادر / المرسل (Outbox)</span>
            <span className="text-slate-400 text-[10px]">
              {inAppEmails.filter(e => e.folder === "sent").length}
            </span>
          </button>

          <button
            onClick={() => setEmailFolder("draft")}
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "draft" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
          >
            <span className="flex items-center gap-2"><FileText size={16} /> المسودات (Drafts)</span>
            <span className="text-slate-400 text-[10px]">
              {inAppEmails.filter(e => e.folder === "draft").length}
            </span>
          </button>

          <button
            onClick={() => setEmailFolder("trash")}
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "trash" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
          >
            <span className="flex items-center gap-2"><Trash2 size={16} /> سلة المهملات (Trash)</span>
            <span className="text-slate-400 text-[10px]">
              {inAppEmails.filter(e => e.folder === "trash").length}
            </span>
          </button>

          <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
            <div className="text-[11px] font-semibold text-slate-500">حالة الربط بالخادم:</div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <div className="flex items-center justify-between">
                <span>سيرفر SMTP:</span>
                <span className="font-mono text-slate-900 font-bold">{emailConfig.smtpHost}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>الجدول المرتبط:</span>
                <span className="font-mono text-emerald-700 font-bold">email_messages</span>
              </div>
              <div className="flex items-center justify-between">
                <span>المزامنة اللحظية:</span>
                <span className="text-emerald-600 font-bold">مفعّلة ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* قائمة الرسائل والمعاينة */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* قائمة الرسائل */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100/80 overflow-hidden flex flex-col h-[550px]">
            <div className="p-3 bg-stone-50 border-b border-slate-200 flex items-center gap-2">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="بحث في موضوع البريد أو اسم المرسل..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
              {inAppEmails
                .filter(e => e.folder === emailFolder)
                .filter(e => matchesEmailSearch(e, emailSearch))
                .length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full space-y-2">
                    <Inbox size={28} className="text-slate-300" />
                    <p className="font-bold text-slate-600">لا توجد رسائل في {emailFolder === "inbox" ? "صندوق الوارد" : emailFolder === "sent" ? "البريد الصادر" : emailFolder === "draft" ? "المسودات" : "سلة المهملات"}</p>
                    <p className="text-[11px] text-slate-400">يمكنك إرسال بريد جديد أو تحديث المزامنة مع خادم البريد.</p>
                  </div>
                ) : (
                  inAppEmails
                    .filter(e => e.folder === emailFolder)
                    .filter(e => matchesEmailSearch(e, emailSearch))
                    .map((mail) => (
                      <div
                        key={mail.id}
                        onClick={() => {
                          setSelectedEmailId(mail.id);
                          setInAppEmails(prev => prev.map(m => m.id === mail.id ? { ...m, isRead: true } : m));
                        }}
                        className={`p-4 cursor-pointer transition ${selectedEmailId === mail.id ? "bg-amber-50/90 border-r-4 border-amber-500" : "hover:bg-slate-50"} ${!mail.isRead ? "font-bold bg-amber-50/20" : ""}`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-900 font-bold truncate flex items-center gap-1.5">
                            {!mail.isRead && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>}
                            {mail.sender}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{mail.date}</span>
                        </div>
                        <p className="text-xs text-slate-800 truncate">{mail.subject}</p>
                        {mail.hasAttachment && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md mt-2">
                            <Paperclip size={10} /> {mail.attachmentName}
                          </span>
                        )}
                      </div>
                    ))
                )}
            </div>
          </div>

          {/* تفاصيل الرسالة المختارة */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between h-[550px] overflow-y-auto">
            {selectedEmailId ? (() => {
              const activeEmail = inAppEmails.find(e => e.id === selectedEmailId);
              if (!activeEmail) return <div className="p-12 text-center text-slate-400 text-xs">اختر رسالة لعرض تفاصيلها</div>;
              return (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                          {activeEmail.folder === "inbox" ? "رسالة واردة" : activeEmail.folder === "sent" ? "رسالة صادرة" : "مسودة / سلة مهملات"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setComposeTo(activeEmail.senderEmail || activeEmail.sender);
                              setComposeSubject(`رد: ${activeEmail.subject}`);
                              setComposeBody(`\n\n--- الرسالة الأصلية ---\nمن: ${activeEmail.sender}\nالتاريخ: ${activeEmail.date}\n${activeEmail.body}`);
                              setShowComposeEmail(true);
                            }}
                            className="text-xs bg-slate-100 hover:bg-[#0D382B]/[0.08] transition-colors text-slate-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                          >
                            رد على الرسالة
                          </button>
                          <button
                            onClick={() => {
                              setInAppEmails(prev => prev.map(m => m.id === activeEmail.id ? { ...m, folder: "trash" } : m));
                              setPermissionNotice("تم نقل الرسالة إلى سلة المهملات");
                            }}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Trash2 size={13} /> حذف
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{activeEmail.subject}</h3>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p>من: <b>{activeEmail.sender}</b> ({activeEmail.senderEmail || "غير محدد"})</p>
                        <p>إلى: <b>{activeEmail.recipient || "مكتب المحاماة"}</b> ({activeEmail.recipientEmail || emailConfig.email})</p>
                        <p className="text-slate-400 text-[11px]">التاريخ: {activeEmail.date}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-stone-50 p-4 rounded-xl border border-slate-100 min-h-[180px]">
                      {activeEmail.body}
                    </div>
                  </div>

                  {activeEmail.hasAttachment && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-amber-700" />
                        <span className="text-xs font-bold text-amber-950">{activeEmail.attachmentName}</span>
                      </div>
                      <button
                        onClick={() => alert(`جاري تحميل المرفق: ${activeEmail.attachmentName}`)}
                        className="text-xs bg-amber-500 text-slate-900 px-3 py-1 rounded-lg font-bold hover:bg-amber-400 shadow-xs"
                      >
                        تحميل المرفق
                      </button>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="p-12 text-center text-slate-400 text-xs">اختر رسالة لعرض تفاصيلها</div>
            )}
          </div>
        </div>
      </div>

      {/* نافذة إعدادات البريد الإلكتروني (SMTP / Account Settings) */}
      {showEmailSettingsModal && (
        <Modal title="إعدادات البريد الإلكتروني وبروتوكولات الأمان (SMTP / SSL / TLS)" onClose={() => setShowEmailSettingsModal(false)}>
          <div className="space-y-5 text-sm max-h-[80vh] overflow-y-auto pr-1">

            {/* الهيدر التعريفي وحالة الفحص */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <Settings size={16} /> ربط خادم الإرسال الرسمي (SMTP Server Configuration):
                </p>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                  emailConfig.lastTestStatus === "success"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : "bg-amber-950 text-amber-300 border-amber-800"
                }`}>
                  {emailConfig.lastTestStatus === "success"
                    ? `🟢 مفحوص ومفعل (${emailConfig.lastTestedAt || "ناجح"})`
                    : "🟡 بانتظار فحص اتصال SMTP"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                يمكنك ربط أي حساب بريد رسمي للمكتب (Office 365, Gmail, Webmail) وإعداد بروتوكولات التشفير (SSL/TLS / STARTTLS) بشكل مستقل مع اختبار الاتصال المباشر لضمان تسليم الفواتير الضريبية والإشعارات للموكلين.
              </p>
            </div>

            {/* اختصارات سريعة لضبط الخادم */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Zap size={13} className="text-amber-600" /> تعبئة سريعة حسب مزود الخدمة:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailConfig(prev => ({
                      ...prev,
                      smtpHost: "smtp.office365.com",
                      smtpPort: 587,
                      protocol: "starttls",
                      secure: false,
                      rejectUnauthorized: false
                    }));
                    setTestSmtpResult(null);
                  }}
                  className={`p-2.5 border rounded-xl bg-white text-xs text-right transition shadow-xs hover:border-amber-500 ${
                    emailConfig.smtpHost === "smtp.office365.com" ? "border-amber-500 ring-2 ring-amber-100 font-bold" : "border-slate-200"
                  }`}
                >
                  <p className="font-bold text-slate-900">Office 365</p>
                  <p className="text-[10px] text-slate-500">STARTTLS (587)</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailConfig(prev => ({
                      ...prev,
                      smtpHost: "smtp.gmail.com",
                      smtpPort: 587,
                      protocol: "starttls",
                      secure: false,
                      rejectUnauthorized: false
                    }));
                    setTestSmtpResult(null);
                  }}
                  className={`p-2.5 border rounded-xl bg-white text-xs text-right transition shadow-xs hover:border-amber-500 ${
                    emailConfig.smtpHost === "smtp.gmail.com" && emailConfig.smtpPort === 587 ? "border-amber-500 ring-2 ring-amber-100 font-bold" : "border-slate-200"
                  }`}
                >
                  <p className="font-bold text-slate-900">Gmail (STARTTLS)</p>
                  <p className="text-[10px] text-slate-500">Port 587</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailConfig(prev => ({
                      ...prev,
                      smtpHost: "smtp.gmail.com",
                      smtpPort: 465,
                      protocol: "ssl_tls",
                      secure: true,
                      rejectUnauthorized: false
                    }));
                    setTestSmtpResult(null);
                  }}
                  className={`p-2.5 border rounded-xl bg-white text-xs text-right transition shadow-xs hover:border-amber-500 ${
                    emailConfig.smtpHost === "smtp.gmail.com" && emailConfig.smtpPort === 465 ? "border-amber-500 ring-2 ring-amber-100 font-bold" : "border-slate-200"
                  }`}
                >
                  <p className="font-bold text-slate-900">Gmail (SSL/TLS)</p>
                  <p className="text-[10px] text-slate-500">Port 465</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailConfig(prev => ({
                      ...prev,
                      smtpHost: "mail.lawyersuood.com",
                      smtpPort: 465,
                      protocol: "ssl_tls",
                      secure: true,
                      rejectUnauthorized: false
                    }));
                    setTestSmtpResult(null);
                  }}
                  className={`p-2.5 border rounded-xl bg-white text-xs text-right transition shadow-xs hover:border-amber-500 ${
                    emailConfig.smtpHost.includes("lawyersuood") ? "border-amber-500 ring-2 ring-amber-100 font-bold" : "border-slate-200"
                  }`}
                >
                  <p className="font-bold text-slate-900">خادم خاص Webmail</p>
                  <p className="text-[10px] text-slate-500">SSL/TLS (465)</p>
                </button>
              </div>
            </div>

            {/* حقول الحساب المرجعية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="عنوان البريد الإلكتروني (Sender Email)">
                <input
                  name="email"
                  type="text"
                  value={emailConfig.email}
                  onChange={(e) => {
                    setEmailConfig(prev => ({ ...prev, email: e.target.value }));
                    setTestSmtpResult(null);
                  }}
                  placeholder="lawyer@lawyersuood.com"
                  className={`${inputCls} font-medium dir-ltr text-right`}
                />
              </Field>

              <Field label="اسم المرسل المعروض (Sender Name)">
                <input
                  value={emailConfig.senderName}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="المحامي سعود أحمد الشحي"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="كلمة المرور / كلمة مرور التطبيق المخصصة (App Password)">
              <input
                type="password"
                value={emailConfig.appPassword || ""}
                onChange={(e) => {
                  setEmailConfig(prev => ({ ...prev, appPassword: e.target.value }));
                  setTestSmtpResult(null);
                }}
                placeholder="••••••••••••••••"
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                * لحسابات Gmail أو Office 365 يُنصح باستخدام "كلمة مرور التطبيق" (App Password) المكونة من 16 حرفاً لتجاوز التحقق الثنائي.
              </p>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="خادم الإرسال (SMTP Host)">
                <input
                  value={emailConfig.smtpHost}
                  onChange={(e) => {
                    setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }));
                    setTestSmtpResult(null);
                  }}
                  placeholder="smtp.office365.com"
                  className={`${inputCls} font-mono dir-ltr text-right`}
                />
              </Field>

              <Field label="منفذ الخادم (Port)">
                <input
                  type="number"
                  value={emailConfig.smtpPort}
                  onChange={(e) => {
                    const newPort = Number(e.target.value) || 587;
                    setEmailConfig(prev => ({
                      ...prev,
                      smtpPort: newPort,
                      protocol: newPort === 465 ? "ssl_tls" : (newPort === 587 ? "starttls" : prev.protocol)
                    }));
                    setTestSmtpResult(null);
                  }}
                  placeholder="587"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* بروتوكولات الأمان المستقلة SSL/TLS/STARTTLS */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-700" /> بروتوكول التشفير والأمان المعتمد (Security Protocol):
                </span>
                <span className="text-[10px] text-slate-500 font-normal">تحديد مستقل لمستوى التشفير</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {/* SSL / TLS */}
                <div
                  onClick={() => {
                    setEmailConfig(prev => ({ ...prev, protocol: "ssl_tls", secure: true }));
                    setTestSmtpResult(null);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition relative space-y-1 ${
                    emailConfig.protocol === "ssl_tls"
                      ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-100 text-emerald-950"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1">
                      <Lock size={13} className="text-emerald-700" /> SSL / TLS (ضمني)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 font-mono text-emerald-900 font-bold">Port 465</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    تشفير مباشر شامل قبل المصادقة. مناسب لخوادم Webmail والخوادم الخاصة.
                  </p>
                </div>

                {/* STARTTLS */}
                <div
                  onClick={() => {
                    setEmailConfig(prev => ({ ...prev, protocol: "starttls", secure: false }));
                    setTestSmtpResult(null);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition relative space-y-1 ${
                    emailConfig.protocol === "starttls"
                      ? "bg-amber-50/70 border-amber-600 ring-2 ring-amber-100 text-amber-950"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1">
                      <ShieldCheck size={13} className="text-amber-700" /> STARTTLS (صريح)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/60 font-mono text-amber-900 font-bold">Port 587</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    بدء الاتصال عادي ثم الارتقاء المشفر بـ TLS v1.2/1.3. مخصص لـ Office 365 و Gmail.
                  </p>
                </div>

                {/* Plain Connection */}
                <div
                  onClick={() => {
                    if (!window.confirm("تحذير: الاتصال بدون تشفير (Plain) يعرض بيانات اعتماد البريد الإلكتروني ومحتوى الرسائل للاعتراض على الشبكة. هذا الخيار مخصص فقط لبيئة تجريبية محلية معزولة ولا يُنصح باستخدامه أبداً في الإنتاج. هل تريد المتابعة فعلاً؟")) return; setEmailConfig(prev => ({ ...prev, protocol: "none", secure: false }));
                    setTestSmtpResult(null);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition relative space-y-1 ${
                    emailConfig.protocol === "none"
                      ? "bg-slate-100 border-slate-500 ring-2 ring-slate-200 text-slate-950"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1">
                      <AlertCircle size={13} className="text-slate-500" /> بدون تشفير (Plain)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono text-slate-800 font-bold">Port 25</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    اتصال مباشر عادي بدون طبقة أمان. مخصص للتجربة البيئية المحلية فقط.
                  </p>
                </div>
              </div>

              {/* خيار التحكم بالشهادات SSL */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <input
                  type="checkbox"
                  id="rejectCertCheck"
                  checked={emailConfig.rejectUnauthorized}
                  onChange={(e) => {
                    setEmailConfig(prev => ({ ...prev, rejectUnauthorized: e.target.checked }));
                    setTestSmtpResult(null);
                  }}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="rejectCertCheck" className="font-medium cursor-pointer flex-1">
                  التحقق الصارم من صحة شهادة SSL (Strict SSL Certificate Validation)
                  <span className="block text-[10px] text-slate-500 font-normal">
                    * اتُرك هذا الخيار ملغياً لمنع رفض الشهادات المخصصة أو غير الموقعة (Self-Signed Certificates) على خوادم الاستضافة.
                  </span>
                </label>
              </div>
            </div>

            {/* قسم فحص واختبار اتصال خادم SMTP واختبار الفواتير */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <RefreshCw size={15} className="text-amber-600" /> اختبار اتصال خادم SMTP (Test Connection)
                  </h4>
                  <p className="text-[10px] text-slate-500">فحص حقيقي للربط والتشفير والمصادقة لضمان وصول الفواتير</p>
                </div>

                <button
                  type="button"
                  onClick={handleTestSmtpConnection}
                  disabled={testSmtpLoading}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 shadow-xs"
                >
                  {testSmtpLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-amber-400" />
                      <span>جاري فحص الاتصال...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="text-amber-400" />
                      <span>اختبار الاتصال الآن</span>
                    </>
                  )}
                </button>
              </div>

              {/* نتيجة الفحص والتشخيص */}
              {testSmtpResult && (
                <div className={`p-3.5 rounded-2xl border text-xs space-y-2.5 transition animate-fadeIn ${
                  testSmtpResult.success
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                }`}>
                  <div className="flex items-center justify-between font-bold border-b border-emerald-200/60 pb-2">
                    <span className="flex items-center gap-1.5">
                      {testSmtpResult.success ? (
                        <CheckCircle2 size={16} className="text-emerald-700" />
                      ) : (
                        <AlertTriangle size={16} className="text-rose-700" />
                      )}
                      <span>{testSmtpResult.success ? "نجاح اختبار اتصال خادم SMTP!" : "فشل في الاتصال أو التوثيق"}</span>
                    </span>
                    {testSmtpResult.latencyMs !== undefined && (
                      <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded font-mono border">
                        زمن الاستجابة: {testSmtpResult.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed font-medium">
                    {testSmtpResult.message}
                  </p>

                  {testSmtpResult.success ? (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900 bg-white/70 p-2.5 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-1 font-semibold">
                          <Check size={13} className="text-emerald-600" /> الاتصال بالمضيف: <b>{emailConfig.smtpHost}:{emailConfig.smtpPort}</b>
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                          <Check size={13} className="text-emerald-600" /> بروتوكول الأمان: <b>{emailConfig.protocol.toUpperCase()}</b>
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                          <Check size={13} className="text-emerald-600" /> مصادقة الحساب: <b>{emailConfig.email}</b>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-emerald-800">
                          <Check size={13} className="text-emerald-600" /> جاهز لإرسال الفواتير الضريبية
                        </div>
                      </div>

                      {/* نموذج اختبار إرسال فاتورة تجريبية */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
                        <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Receipt size={14} className="text-amber-600" /> إرسال بريد فاتورة تجريبي للتأكد من المخرجات (Test Invoice Email):
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={testInvoiceRecipient}
                            onChange={(e) => setTestInvoiceRecipient(e.target.value)}
                            placeholder={emailConfig.email || "أدخل بريد تجريبي أو بريدك"}
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={handleSendTestInvoice}
                            disabled={testInvoiceLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1"
                          >
                            {testInvoiceLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                            <span>إرسال الفاتورة</span>
                          </button>
                        </div>
                        {testInvoiceResult && (
                          <p className={`text-[11px] font-semibold ${testInvoiceResult.success ? "text-emerald-700" : "text-rose-700"}`}>
                            {testInvoiceResult.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    testSmtpResult.recommendation && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-rose-200 text-[11px] text-rose-900 leading-relaxed font-semibold">
                        💡 <b>التوصية المقترحة لمعالجة الخطأ:</b> {testSmtpResult.recommendation}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEmailSettingsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveEmailSettings}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
              >
                <ShieldCheck size={15} className="text-amber-400" />
                <span>حفظ وتفعيل إعدادات البريد</span>
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* نافذة إنشاء رسالة بريد */}
      {showComposeEmail && (
        <Modal title="إنشاء وتوجيه بريد إلكتروني رسمي" onClose={() => setShowComposeEmail(false)}>
          <div className="space-y-4 text-sm">
            <div className="bg-stone-50 border border-slate-200 p-2.5 rounded-xl text-xs flex items-center justify-between">
              <span className="text-slate-600">سيتم الإرسال عبر: <b>{emailConfig.email}</b></span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                {emailConfig.smtpHost}
              </span>
            </div>

            <Field label="إلى (المرسل إليه)">
              <input
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="notifications@dc.gov.ae أو بريد الموكل"
                className={inputCls}
              />
            </Field>
            <Field label="موضوع الرسالة">
              <input
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="عنوان الموضوع الرسمي..."
                className={inputCls}
              />
            </Field>
            <Field label="نص البريد الإلكتروني">
              <textarea
                rows={6}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="اكتب تفاصيل المراسلة القانونية..."
                className={inputCls}
              />
            </Field>
            <Field label="مرفق ملف (اسم المرفق)">
              <input
                value={composeAttachment}
                onChange={(e) => setComposeAttachment(e.target.value)}
                placeholder="مثال: لائحة_طعن_رسمية.pdf"
                className={inputCls}
              />
            </Field>
            <button
              onClick={handleSendInAppEmail}
              className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-900 hover:bg-amber-400 transition shadow-sm"
            >
              إرسال وحفظ الآن
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
