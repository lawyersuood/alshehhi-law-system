import React from "react";
import {
  CreditCard,
  FileSignature,
  Receipt,
  Clock,
  ShieldCheck,
  TrendingUp,
  ShieldAlert,
  Plus,
  Trash2,
  FileSpreadsheet,
  SendHorizontal,
  CheckCircle2,
  Send,
  Printer,
} from "lucide-react";
import { Badge } from "./AuthScreens";
import {
  UserItem,
  PaymentReceipt,
  FeeAgreement,
  Client,
  Invoice,
  OfficeAgreement,
  TimeLog,
  CaseItem,
  TrustTransaction,
  CaseExpense,
} from "../domain/types";
import { fmtAED, fmtDate, effectiveInvoiceStatus, invColor } from "../domain/utils";
import { VAT_RATE, FIRM_TRN } from "../domain/constants";

export interface InvoicesViewProps {
  canViewFinancials: boolean;
  currentUser: UserItem;
  invoiceSubTab: "invoices" | "agreements" | "payments" | "time" | "trust" | "expenses";
  setInvoiceSubTab: (tab: "invoices" | "agreements" | "payments" | "time" | "trust" | "expenses") => void;
  payments: PaymentReceipt[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentReceipt[]>>;
  feeAgreements: FeeAgreement[];
  clients: Client[];
  openModalWithCheck: (kind: string, permKey?: any) => void;
  requestDelete: (opts: any) => void;
  logAuditAction: (...args: any[]) => void;
  getPaidForAgreement: (agreementId: number) => number;
  getRemainingForAgreement: (agreement: FeeAgreement) => number;
  isAgreementFullyPaid: (agreement: FeeAgreement) => boolean;
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  checkPerm: (...args: any[]) => boolean;
  officeAgreements: OfficeAgreement[];
  setDeleteAgrConfirm: (v: OfficeAgreement | null) => void;
  setShowInvoiceImportModal: (v: boolean) => void;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  clientName: (id: number) => string;
  setInvoiceStatus: (invId: number, newStatus: string) => void;
  openNotificationComposer: (...args: any[]) => void;
  setReport: (v: any) => void;
  timeLogs: TimeLog[];
  cases: CaseItem[];
  convertTimeToInvoice: (log: TimeLog) => void;
  trustTransactions: Array<Omit<TrustTransaction, "type"> & { type: string }>;
  caseNo: (id: number) => string;
  caseExpenses: CaseExpense[];
}

export default function InvoicesView({
  canViewFinancials,
  currentUser,
  invoiceSubTab,
  setInvoiceSubTab,
  payments,
  setPayments,
  feeAgreements,
  clients,
  openModalWithCheck,
  requestDelete,
  logAuditAction,
  getPaidForAgreement,
  getRemainingForAgreement,
  isAgreementFullyPaid,
  setForm,
  checkPerm,
  officeAgreements,
  setDeleteAgrConfirm,
  setShowInvoiceImportModal,
  invoices,
  setInvoices,
  clientName,
  setInvoiceStatus,
  openNotificationComposer,
  setReport,
  timeLogs,
  cases,
  convertTimeToInvoice,
  trustTransactions,
  caseNo,
  caseExpenses,
}: InvoicesViewProps) {
  return (
    <div className="space-y-6">
      {/* شريط الأقسام المالي */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setInvoiceSubTab("payments")}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "payments" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <CreditCard size={18} /> سندات القبض والدفعات ({payments.length})
        </button>
        <button
          onClick={() => setInvoiceSubTab("agreements")}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "agreements" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <FileSignature size={18} /> اتفاقيات الأتعاب ({feeAgreements.length})
        </button>
        <button
          onClick={() => setInvoiceSubTab("invoices")}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "invoices" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Receipt size={18} /> الفواتير وضريبة FTA (5%)
        </button>
        <button
          onClick={() => setInvoiceSubTab("time")}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "time" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Clock size={18} /> تتبع ساعات العمل (Time Tracking)
        </button>
        <button
          onClick={() => setInvoiceSubTab("trust")}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "trust" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <ShieldCheck size={18} /> حساب أمانات الموكلين (Trust Account)
        </button>
        <button
          onClick={() => setInvoiceSubTab("expenses")}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "expenses" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <TrendingUp size={18} /> مصروفات القضية وتقرير الربحية
        </button>
      </div>

      {!canViewFinancials ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800">صلاحيات محددة للمستخدم</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">حسابك الحالي ({currentUser.roleTitle}) لا يمتلك صلاحية الوصول إلى النظام المالي والفواتير. يرجى التبديل إلى حساب المحاسب أو مدير النظام.</p>
        </div>
      ) : (
        <>
          {/* ===== 1. سندات القبض والدفعات المسجلة ===== */}
          {invoiceSubTab === "payments" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="text-amber-600" /> سجل سندات القبض وتحصيلات الدفعات
                  </h2>
                  <p className="text-xs text-slate-500">تسجيل وتخصيص الدفعات المقبوضة لاتفاقيات الأتعاب أو ترحيلها للرصيد المعلّق</p>
                </div>
                <button
                  onClick={() => openModalWithCheck("payment", "manageInvoices")}
                  className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
                >
                  <Plus size={16} /> تسجيل دفعة / سند قبض جديد
                </button>
              </div>

              {/* إحصائيات الدفعات */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="app-card p-4">
                  <p className="text-xs text-slate-500">إجمالي التحصيلات المقبوضة</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {fmtAED(payments.reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <p className="text-xs text-emerald-800 font-semibold">الدفعات المخصصة للاتفاقيات</p>
                  <p className="text-2xl font-bold text-emerald-800 font-mono">
                    {fmtAED(payments.filter(p => p.feeAgreementId !== "unallocated" && p.feeAgreementId != null).reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <p className="text-xs text-amber-800 font-semibold">الأرصدة المعلقة (دفعات غير مخصصة)</p>
                  <p className="text-2xl font-bold text-amber-800 font-mono">
                    {fmtAED(payments.filter(p => p.feeAgreementId === "unallocated" || p.feeAgreementId == null).reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
              </div>

              {/* جدول الدفعات */}
              <div className="overflow-x-auto custom-scrollbar app-card">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-[#0D382B]/[0.035] text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/70">
                    <tr>
                      <th className="px-4 py-3 font-semibold">رقم السند / المرجع</th>
                      <th className="px-4 py-3 font-semibold">التاريخ</th>
                      <th className="px-4 py-3 font-semibold">الموكل</th>
                      <th className="px-4 py-3 font-semibold">اتفاقية الأتعاب المرتبطة</th>
                      <th className="px-4 py-3 font-semibold">طريقة السداد</th>
                      <th className="px-4 py-3 font-semibold">المبلغ المقبوض</th>
                      <th className="px-4 py-3 font-semibold">البيان والملاحظات</th>
                      {/* عمود ثابت (sticky) حتى يبقى زر الحذف ظاهراً دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                      <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-center bg-[#faf9f6] shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {payments.map((p) => {
                      const client = clients.find(c => c.id === p.clientId);
                      const isUnallocated = !p.feeAgreementId || p.feeAgreementId === "unallocated";
                      const agreement = !isUnallocated ? feeAgreements.find(a => a.id === p.feeAgreementId) : null;

                      return (
                        <tr key={p.id} className="hover:bg-amber-50/50 group">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.referenceNo}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(p.date)}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{client?.name || "—"}</td>
                          <td className="px-4 py-3">
                            {isUnallocated ? (
                              <Badge className="bg-amber-100 text-amber-900 border border-amber-300">
                                دفعة غير مخصصة (رصيد معلّق للموكل)
                              </Badge>
                            ) : (
                              <div className="text-xs">
                                <span className="font-semibold text-slate-900 block">
                                  {agreement ? `[${agreement.agreementNumber}] ${agreement.title}` : `اتفاقية #${p.feeAgreementId}`}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{p.paymentMethod}</td>
                          <td className="px-4 py-3 font-bold font-mono text-emerald-700 text-sm">
                            +{fmtAED(p.amount)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{p.notes || "—"}</td>
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-amber-50/50 px-4 py-3 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                            <button
                              onClick={() => {
                                requestDelete({
                                  section: "سندات القبض والدفعات المالية",
                                  title: `سند القبض: ${p.referenceNo}`,
                                  details: `الموكل: ${client?.name || "—"} | المبلغ: ${fmtAED(p.amount)} | طريقة السداد: ${p.paymentMethod} | التاريخ: ${fmtDate(p.date)}`,
                                  permKey: "deleteInvoices",
                                  actionName: "حذف سند القبض",
                                  onConfirm: () => {
                                    logAuditAction("DELETE", "المالية والمقبوضات", `سند قبض: ${p.referenceNo}`, `حذف سند القبض ${p.referenceNo} بمبلغ ${p.amount} درهم للموكل ${client?.name || ""}`, p.id);
                                    setPayments((prev) => prev.filter((x) => x.id !== p.id));
                                  },
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="حذف سند القبض"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== 2. اتفاقيات الأتعاب (Fee Agreements) ===== */}
          {invoiceSubTab === "agreements" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileSignature className="text-amber-600" /> اتفاقيات أتعاب المحاماة والعقود
                  </h2>
                  <p className="text-xs text-slate-500">متابعة قيم العقود، التحصيلات، المتبقي على كل اتفاقية، والربط مع الدفعات</p>
                </div>
                <button
                  onClick={() => openModalWithCheck("payment", "manageInvoices")}
                  className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
                >
                  <Plus size={16} /> تسجيل دفعة جديدة
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="app-card p-4">
                  <p className="text-xs text-slate-500">إجمالي قيم اتفاقيات الأتعاب</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {fmtAED(feeAgreements.reduce((sum, a) => sum + a.totalAmount, 0))}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <p className="text-xs text-emerald-800 font-semibold">إجمالي المحصّل على الاتفاقيات</p>
                  <p className="text-2xl font-bold text-emerald-800 font-mono">
                    {fmtAED(feeAgreements.reduce((sum, a) => sum + getPaidForAgreement(a.id), 0))}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <p className="text-xs text-amber-800 font-semibold">إجمالي المتبقي على الاتفاقيات النشطة</p>
                  <p className="text-2xl font-bold text-amber-800 font-mono">
                    {fmtAED(feeAgreements.filter(a => a.status === "نشطة").reduce((sum, a) => sum + getRemainingForAgreement(a), 0))}
                  </p>
                </div>
              </div>

              {feeAgreements.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileSignature size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">لا توجد اتفاقيات أتعاب مسجلة حالياً</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    يمكنك تسجيل اتفاقية أتعاب جديدة لأحد الموكلين لمتابعة قيمتها والمحصّل والمتبقي منها.
                  </p>
                </div>
              ) : (
              <div className="space-y-4">
                {feeAgreements.map((agr) => {
                  const paid = getPaidForAgreement(agr.id);
                  const remaining = getRemainingForAgreement(agr);
                  const fullyPaid = isAgreementFullyPaid(agr);
                  const client = clients.find(c => c.id === agr.clientId);

                  return (
                    <div key={agr.id} className="app-card p-5 space-y-4 hover:border-amber-300 transition">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 text-sm bg-stone-100 px-2.5 py-1 rounded-lg">
                              {agr.agreementNumber}
                            </span>
                            <h3 className="font-bold text-slate-900 text-base">{agr.title}</h3>
                            <Badge className={fullyPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                              {fullyPaid ? "مسددة بالكامل" : agr.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            الموكل: <b>{client?.name || "—"}</b> • تاريخ العقد: {fmtDate(agr.date)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!fullyPaid ? (
                            <button
                              onClick={() => {
                                setForm({ clientId: String(agr.clientId), feeAgreementId: agr.id });
                                openModalWithCheck("payment", "manageInvoices");
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold hover:bg-amber-400 shadow-sm"
                            >
                              <Plus size={14} /> تسجيل دفعة على هذه الاتفاقية
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                              ✓ مسددة بالكامل (لا تقبل دفعات إضافية)
                            </span>
                          )}
                          <button
                            onClick={() => {
    if (!checkPerm("deleteAgreements", "حذف اتفاقية الأتعاب")) return;
    const matchingOA = officeAgreements.find((oa) => oa.feeAgreementId === agr.id || oa.agreementNumber === agr.agreementNumber);
    if (matchingOA) {
      setDeleteAgrConfirm(matchingOA);
    } else {
      setDeleteAgrConfirm({
                                  id: agr.id,
                                  agreementNumber: agr.agreementNumber,
                                  feeAgreementId: agr.id,
                                  clientId: agr.clientId,
                                  contractDate: agr.date,
                                  contractCity: "الشارقة",
                                  clientNameAr: client?.name || "الموكل",
                                  clientNameEn: "",
                                  representativeAr: "",
                                  representativeEn: "",
                                  phone: "",
                                  caseDetailsAr: agr.title,
                                  caseDetailsEn: "",
                                  totalAmount: agr.totalAmount,
                                  paymentTermsAr: "",
                                  paymentTermsEn: "",
                                  installments: [],
                                  createdAt: agr.date,
                                } as any);
                              }
                            }}
                            className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 border border-slate-200 transition"
                            title="حذف هذه الاتفاقية"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                        <div>
                          <span className="text-slate-500 block">إجمالي أتعاب العقد</span>
                          <span className="font-bold text-slate-900 text-sm font-mono">{fmtAED(agr.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">المبلغ المدفوع (المحصل)</span>
                          <span className="font-bold text-emerald-700 text-sm font-mono">{fmtAED(paid)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">المتبقي المطلوب سداده</span>
                          <span className={`font-bold text-sm font-mono ${remaining > 0 ? "text-amber-800" : "text-slate-400"}`}>
                            {fmtAED(remaining)}
                          </span>
                        </div>
                      </div>

                      {agr.notes && (
                        <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                          📝 {agr.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          )}
          {invoiceSubTab === "invoices" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">الفواتير وضريبة القيمة المضافة (5%)</h2>
                  <p className="text-xs text-slate-500">مطالبات الأتعاب بتنسيق الهيئة الاتحادية للضرائب FTA (TRN: {FIRM_TRN})</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowInvoiceImportModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 shadow-sm transition"
                  >
                    <FileSpreadsheet size={16} /> ارفاق واستيراد الفواتير (Excel / PDF)
                  </button>
                  <button onClick={() => openModalWithCheck("invoice", "manageInvoices")} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"><Plus size={16} /> إصدار فاتورة ضريبية</button>
                </div>
              </div>
              <div className="overflow-x-auto custom-scrollbar app-card">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-[#0D382B]/[0.035] text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/70">
                    <tr>
                      <th className="px-4 py-3 font-semibold">رقم الفاتورة</th>
                      <th className="px-4 py-3 font-semibold">الموكل</th>
                      <th className="px-4 py-3 font-semibold">المبلغ الصافي</th>
                      <th className="px-4 py-3 font-semibold">الضريبة 5%</th>
                      <th className="px-4 py-3 font-semibold">الإجمالي</th>
                      <th className="px-4 py-3 font-semibold">الحالة</th>
                      {/* عمود ثابت (sticky) حتى تبقى أزرار الفاتورة (تحديد كمسددة، تذكير، طباعة، حذف) ظاهرة دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                      <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-center bg-[#faf9f6] shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">إجراءات وتصدير FTA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {invoices.map((inv) => {
                      const vat = inv.amount * VAT_RATE;
                      const total = inv.amount + vat;
                      const evs = effectiveInvoiceStatus(inv);
                      return (
                        <tr key={inv.id} className="hover:bg-amber-50/50 group">
                          <td className="px-4 py-3 font-mono font-semibold">{inv.number}</td>
                          <td className="px-4 py-3">{clientName(inv.clientId)}</td>
                          <td className="px-4 py-3">{fmtAED(inv.amount)}</td>
                          <td className="px-4 py-3 text-slate-500">{fmtAED(vat)}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{fmtAED(total)}</td>
                          <td className="px-4 py-3"><Badge className={invColor(evs)}>{evs}</Badge></td>
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-amber-50/50 px-4 py-3 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center justify-center gap-1">
                              {inv.status === "مسودة" && (
                                <button onClick={() => setInvoiceStatus(inv.id, "مرسلة")} className="p-1.5 text-sky-600 hover:text-sky-800 rounded-lg hover:bg-sky-50 flex items-center gap-1 text-xs font-semibold" title="تحديد الفاتورة كمُرسلة للموكل">
                                  <SendHorizontal size={14} /> تحديد كمُرسلة
                                </button>
                              )}
                              {(inv.status === "مرسلة" || evs === "متأخرة") && (
                                <button onClick={() => setInvoiceStatus(inv.id, "مدفوعة")} className="p-1.5 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-50 flex items-center gap-1 text-xs font-bold" title="تحديد الفاتورة كمُسدَّدة بالكامل">
                                  <CheckCircle2 size={14} /> تحديد كمسددة
                                </button>
                              )}
                              <button onClick={() => openNotificationComposer("تذكير فاتورة", inv)} className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 flex items-center gap-1 text-xs font-semibold" title="تذكير الموكل بسداد الفاتورة">
                                <Send size={14} /> تذكير بالواتساب/الإيميل
                              </button>
                              <button onClick={() => setReport({ type: "tax-invoice", invoiceId: inv.id })} className="p-1.5 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-50 flex items-center gap-1 text-xs font-bold" title="عرض وطباعة فاتورة FTA الرسمية">
                                <Printer size={15} /> فاتورة FTA (PDF)
                              </button>
                              <button
                                onClick={() => {
                                  requestDelete({
                                    section: "الفواتير والمطالبات الضريبية",
                                    title: `الفاتورة رقم: ${inv.number}`,
                                    details: `الموكل: ${clientName(inv.clientId)} | المبلغ الإجمالي: ${fmtAED(total)} | الحالة: ${evs}`,
                                    permKey: "deleteInvoices",
                                    actionName: "حذف الفاتورة الضريبية",
                                    onConfirm: () => {
                                      logAuditAction("DELETE", "الفواتير", `فاتورة: ${inv.number}`, `حذف الفاتورة ${inv.number} للموكل ${clientName(inv.clientId)} بمبلغ ${total} درهم`, inv.id);
                                      setInvoices((prev) => prev.filter((x) => x.id !== inv.id));
                                    },
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="حذف الفاتورة"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== 2. تتبع ساعات العمل (Time Tracking) ===== */}
          {invoiceSubTab === "time" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="text-amber-600" /> تتبع ساعات العمل (Time Tracking)
                  </h2>
                  <p className="text-xs text-slate-500">تسجيل الوقت المستغرق بكل قضية وتحويله تلقائياً لفاتورة أتعاب بالساعة</p>
                </div>
                <button onClick={() => openModalWithCheck("time")} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]">
                  <Plus size={16} /> تسجيل ساعات عمل
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="app-card p-4">
                  <p className="text-xs text-slate-500">إجمالي الساعات المسجلة</p>
                  <p className="text-2xl font-bold text-slate-900">{timeLogs.reduce((acc, t) => acc + t.hours, 0)} ساعة</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <p className="text-xs text-amber-800 font-semibold">قيمة الساعات غير المفوترة</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {fmtAED(timeLogs.filter((t) => !t.billed).reduce((acc, t) => acc + (t.hours * t.hourlyRate), 0))}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <p className="text-xs text-emerald-800 font-semibold">نسبة الساعات المفوترة</p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {timeLogs.length > 0 ? Math.round((timeLogs.filter((t) => t.billed).length / timeLogs.length) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {timeLogs.map((log) => {
                  const cs = cases.find((c) => c.id === log.caseId);
                  const val = log.hours * log.hourlyRate;
                  return (
                    <div key={log.id} className="flex flex-wrap items-center justify-between gap-4 app-card p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{cs ? cs.number : "—"}</span>
                          <span className="text-xs text-slate-500 bg-stone-100 px-2 py-0.5 rounded font-medium">{log.lawyerName}</span>
                          {log.billed ? <Badge className="bg-emerald-100 text-emerald-700">مفوترة</Badge> : <Badge className="bg-amber-100 text-amber-800">غير مفوترة</Badge>}
                        </div>
                        <p className="text-xs text-slate-600">{log.description}</p>
                        <p className="text-[11px] text-slate-400">التاريخ: {fmtDate(log.date)} • الموكل: {cs ? clientName(cs.clientId) : "—"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left font-mono">
                          <p className="text-xs text-slate-500">{log.hours} ساعة × {log.hourlyRate} د.إ</p>
                          <p className="font-bold text-slate-900 text-base">{fmtAED(val)}</p>
                        </div>
                        {!log.billed && (
                          <button
                            onClick={() => convertTimeToInvoice(log)}
                            className="px-3 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold text-xs hover:bg-amber-400 shadow-sm"
                          >
                            تحويل إلى فاتورة تلقائياً
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== 3. حساب أمانات الموكلين (Trust Account) ===== */}
          {invoiceSubTab === "trust" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="text-amber-600" /> حساب أمانات الموكلين (Trust Account)
                  </h2>
                  <p className="text-xs text-slate-500">تتبع مبالغ أمانات رسوم المحاكم والخبراء منفصلة تماماً عن أتعاب المكتب</p>
                </div>
                <button onClick={() => openModalWithCheck("trust")} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]">
                  <Plus size={16} /> إضافة إيداع / صرف أمانة
                </button>
              </div>

              {/* إجمالي رصيد الأمانات لكل موكل — تُعرض فقط للموكلين الذين لديهم حركة أمانة فعلية،
                  بدل عرض بطاقة لكل موكل مسجل بالمكتب (111 موكلاً) حتى لو لم تُسجَّل له أي معاملة أمانة إطلاقاً */}
              {(() => {
                const clientsWithTrust = clients.filter((c) => trustTransactions.some((t) => t.clientId === c.id));
                return clientsWithTrust.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ShieldCheck size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">لا توجد معاملات أمانة مسجلة حالياً</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      عند تسجيل أول إيداع أو صرف أمانة لأحد الموكلين، سيظهر رصيده هنا للمتابعة.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clientsWithTrust.map((c) => {
                      const cTx = trustTransactions.filter((t) => t.clientId === c.id);
                      const deposits = cTx.filter((t) => t.type === "إيداع أمانة").reduce((acc, t) => acc + t.amount, 0);
                      const withdrawals = cTx.filter((t) => t.type === "صرف أمانة").reduce((acc, t) => acc + t.amount, 0);
                      const net = deposits - withdrawals;
                      return (
                        <div key={c.id} className="app-card p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                            <Badge className={net > 0 ? "bg-emerald-100 text-emerald-800" : net < 0 ? "bg-red-100 text-red-800 border border-red-200" : "bg-stone-100 text-slate-600"}>
                              {net < 0 ? "عجز في الأمانة!" : "رصيد الأمانة"}
                            </Badge>
                          </div>
                          <p className="text-2xl font-mono font-bold text-amber-600">{fmtAED(net)}</p>
                          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
                            <span>إيداعات: {fmtAED(deposits)}</span>
                            <span>مصروفات أمانة: {fmtAED(withdrawals)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* جدول سجل الأمانات */}
              {trustTransactions.length > 0 && (
              <div className="overflow-x-auto custom-scrollbar app-card">
                <table className="w-full min-w-[650px] text-sm">
                  <thead className="bg-[#0D382B]/[0.035] text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/70">
                    <tr>
                      <th className="px-4 py-3 font-semibold">السند / التاريخ</th>
                      <th className="px-4 py-3 font-semibold">الموكل والقضية</th>
                      <th className="px-4 py-3 font-semibold">نوع المعاملة</th>
                      <th className="px-4 py-3 font-semibold">المبلغ (د.إ)</th>
                      <th className="px-4 py-3 font-semibold">البيان والشرح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {trustTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-amber-50/50">
                        <td className="px-4 py-3 text-xs">
                          <p className="font-mono font-bold">{tx.refNo}</p>
                          <p className="text-slate-400">{fmtDate(tx.date)}</p>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p className="font-semibold text-slate-900">{clientName(tx.clientId)}</p>
                          {tx.caseId && <p className="text-slate-500">{caseNo(tx.caseId)}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={tx.type === "إيداع أمانة" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className={`px-4 py-3 font-mono font-bold ${tx.type === "إيداع أمانة" ? "text-emerald-700" : "text-amber-700"}`}>
                          {tx.type === "إيداع أمانة" ? "+" : "-"}{fmtAED(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{tx.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {/* ===== 4. المصروفات وتقارير الربحية ===== */}
          {invoiceSubTab === "expenses" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-amber-600" /> سجل المصروفات وتقارير ربحية القضايا
                  </h2>
                  <p className="text-xs text-slate-500">متابعة تكاليف الروم القضائية والخبرة والترجمة وحساب الهامش الصافي لكل قضية</p>
                </div>
                <button onClick={() => openModalWithCheck("expense")} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]">
                  <Plus size={16} /> تسجيل مصروف جديد
                </button>
              </div>

              {/* ملخص تقرير ربحية القضايا — تُعرض فقط القضايا التي لديها فعلياً فواتير أو ساعات عمل أو مصروفات مسجلة،
                  بدل عرض بطاقة تقرير لكل قضية نشطة (89 قضية) حتى لو لم تُسجَّل عليها أي بيانات مالية إطلاقاً */}
              {(() => {
                const casesWithActivity = cases.filter((cs) =>
                  invoices.some((i) => i.caseId === cs.id) ||
                  timeLogs.some((t) => t.caseId === cs.id) ||
                  caseExpenses.some((e) => e.caseId === cs.id)
                );
                return casesWithActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <TrendingUp size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">لا توجد بيانات مالية على القضايا حتى الآن</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      بمجرد تسجيل فاتورة أو ساعات عمل أو مصروف على إحدى القضايا، سيظهر هنا تقرير ربحيتها.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {casesWithActivity.map((cs) => {
                      const csInvoices = invoices.filter((i) => i.caseId === cs.id);
                      const totalAgreedFee = csInvoices.reduce((acc, i) => acc + i.amount, 0);
                      const csTime = timeLogs.filter((t) => t.caseId === cs.id);
                      const totalTimeCost = csTime.reduce((acc, t) => acc + (t.hours * t.hourlyRate), 0);
                      const csExpenses = caseExpenses.filter((e) => e.caseId === cs.id);
                      const totalExpensesPaid = csExpenses.reduce((acc, e) => acc + e.amount, 0);
                      const netProfit = totalAgreedFee - totalExpensesPaid;

                      return (
                        <div key={cs.id} className="app-card p-5 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-slate-900 text-base">{cs.number} — {clientName(cs.clientId)}</h3>
                              <p className="text-xs text-slate-500">{cs.court} • الموضوع: {cs.subject}</p>
                            </div>
                            <button
                              onClick={() => setReport({ type: "profitability", caseId: cs.id })}
                              className="flex items-center gap-1 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-800"
                            >
                              <Printer size={14} /> عرض وتصدير تقرير الربحية (PDF)
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-4 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                            <div>
                              <span className="text-slate-500 block">إجمالي الأتعاب المتفق عليها</span>
                              <span className="font-bold text-slate-900 text-sm">{fmtAED(totalAgreedFee)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">مصروفات قضائية ومدفوعات</span>
                              <span className="font-bold text-red-600 text-sm">{fmtAED(totalExpensesPaid)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">تكلفة وقت المحامين</span>
                              <span className="font-bold text-slate-700 text-sm">{fmtAED(totalTimeCost)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">الربح الصافي المستهدف</span>
                              <span className={`font-bold text-sm ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{fmtAED(netProfit)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
