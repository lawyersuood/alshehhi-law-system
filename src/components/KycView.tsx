import React from "react";
import {
  ShieldCheck,
  FileSpreadsheet,
  ShieldAlert,
  RefreshCw,
  Search,
  Trash2,
  Plus,
  UserCheck,
  Send,
  Edit2,
  Printer,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Badge, EmptyState } from "./AuthScreens";
import { KycItem, KycWatchlistItem, StrReport, RolePermissions } from "../domain/types";
import { RISK_COLORS, KYC_STATUS_COLORS } from "../domain/constants";
import { fmtAED, fmtDate, nextReviewDate, daysUntil } from "../domain/utils";

export interface KycViewProps {
  kycSubTab: "kyc" | "watchlist" | "str";
  setKycSubTab: (v: "kyc" | "watchlist" | "str") => void;
  kycWatchlist: (KycWatchlistItem & { source?: string })[];
  setKycWatchlist: (updater: (prev: KycWatchlistItem[]) => KycWatchlistItem[]) => void;
  strReports: StrReport[];
  requestDelete: (opts: {
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  }) => void;
  uaeTerroristList: (KycWatchlistItem & { source?: string })[];
  logAuditAction: (...args: any[]) => void;
  saveStorage: (key: string, value: any) => void;
  setShowKycWatchlistUploadModal: (v: boolean) => void;
  kycTypeOptions: { val: string; label: string }[];
  kycTypeFilter: string;
  setKycTypeFilter: (v: string) => void;
  kycWatchlistSearch: string;
  setKycWatchlistSearch: (v: string) => void;
  filteredKycWatchlist: (KycWatchlistItem & { source?: string })[];
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  clientName: (id: number) => string;
  kyc: KycItem[];
  kycDue: number;
  setForm: (v: Record<string, any>) => void;
  setModal: (v: string | null) => void;
  openNotificationComposer: (type: string, data?: any) => void;
  setReport: (v: any) => void;
  setKyc: (updater: (prev: KycItem[]) => KycItem[]) => void;
}

export default function KycView({
  kycSubTab,
  setKycSubTab,
  kycWatchlist,
  setKycWatchlist,
  strReports,
  requestDelete,
  uaeTerroristList,
  logAuditAction,
  saveStorage,
  setShowKycWatchlistUploadModal,
  kycTypeOptions,
  kycTypeFilter,
  setKycTypeFilter,
  kycWatchlistSearch,
  setKycWatchlistSearch,
  filteredKycWatchlist,
  openModalWithCheck,
  clientName,
  kyc,
  kycDue,
  setForm,
  setModal,
  openNotificationComposer,
  setReport,
  setKyc,
}: KycViewProps) {
  // الأرشفة هنا إجراء يدوي بحت (لا حذف) لملفات KYC الخاصة بعلاقات عملاء منتهية.
  // انظر ARCHIVE_FEATURE.md — السجل يبقى موجوداً بالكامل ويمكن إلغاء أرشفته في أي وقت.
  const [showArchivedKyc, setShowArchivedKyc] = React.useState(false);
  const activeKyc = React.useMemo(() => kyc.filter((k) => !k.archived), [kyc]);
  const archivedKyc = React.useMemo(() => kyc.filter((k) => k.archived), [kyc]);
  const visibleKyc = showArchivedKyc ? archivedKyc : activeKyc;

  const archiveKyc = (k: KycItem) => {
    logAuditAction(
      "STATUS_CHANGE",
      "KYC والامتثال",
      `ملف KYC: ${clientName(k.clientId)}`,
      `أرشفة ملف KYC للموكل ${clientName(k.clientId)} (إجراء يدوي غير مدمّر — لا حذف لأي بيانات)`,
      k.id,
    );
    setKyc((prev) =>
      prev.map((x) => (x.id === k.id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x)),
    );
  };

  const unarchiveKyc = (k: KycItem) => {
    logAuditAction(
      "STATUS_CHANGE",
      "KYC والامتثال",
      `ملف KYC: ${clientName(k.clientId)}`,
      `إلغاء أرشفة ملف KYC للموكل ${clientName(k.clientId)}`,
      k.id,
    );
    setKyc((prev) => prev.map((x) => (x.id === k.id ? { ...x, archived: false, archivedAt: null } : x)));
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setKycSubTab("kyc")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${kycSubTab === "kyc" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <ShieldCheck size={18} /> سجلات العناية الواجبة (KYC)
        </button>
        <button
          onClick={() => setKycSubTab("watchlist")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${kycSubTab === "watchlist" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <FileSpreadsheet size={18} /> 🚨 قائمة المحظورين والمنكشفين ({kycWatchlist.length})
        </button>
        <button
          onClick={() => setKycSubTab("str")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${kycSubTab === "str" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <ShieldAlert size={18} /> 🚨 سجل بلاغات الاشتباه AML / STR ({strReports.length})
        </button>
      </div>

      {kycSubTab === "watchlist" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-red-600" /> قائمة الإرهاب المحلية والأشخاص المحظورين
                (AML/Sanctions)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                قائمة التدقيق المعتمدة للإرهاب والمنكشفين في دولة الإمارات العربية المتحدة (
                {kycWatchlist.length} سجل مسجل). يتم التدقيق والربط الآلي مع جميع الموكلين.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  requestDelete({
                    section: "قوائم الامتثال والحظر KYC",
                    title: "إعادة تحميل وتحديث قائمة الإرهاب المحلية الإماراتية",
                    details: `سيتم استبدال القائمة الحالية وتحميل كافة السجلات الرسمية المعتمدة (${uaeTerroristList.length} شخص وكيان).`,
                    permKey: "deleteKyc",
                    actionName: "إعادة ضبط قائمة الحظر",
                    onConfirm: () => {
                      logAuditAction(
                        "DELETE",
                        "قوائم الامتثال والحظر KYC",
                        "إعادة ضبط وتحديث قائمة الإرهاب المحلية",
                        `تمت استعادة وتحميل قائمة الإرهاب والمنكشفين الرسمية بالكامل (${uaeTerroristList.length} شخص وكيان).`,
                        undefined,
                        "مؤكد",
                      );
                      setKycWatchlist(() => uaeTerroristList);
                      saveStorage("firm_kyc_watchlist", uaeTerroristList);
                    },
                  });
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-800 shadow-sm transition"
              >
                <RefreshCw size={15} /> إعادة ضبط القائمة الإماراتية ({uaeTerroristList.length} سجل)
              </button>
              <button
                onClick={() => setShowKycWatchlistUploadModal(true)}
                className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-800 shadow-sm transition"
              >
                <FileSpreadsheet size={15} /> استيراد Excel
              </button>
            </div>
          </div>

          {/* شريط البحث وفلاتر التصنيف */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 ml-2">تصنيف القائمة:</span>
              {kycTypeOptions.map((t) => (
                <button
                  key={t.val}
                  onClick={() => setKycTypeFilter(t.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${kycTypeFilter === t.val ? "bg-red-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-[#0D382B]/[0.08] transition-colors"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={kycWatchlistSearch}
                  onChange={(e) => setKycWatchlistSearch(e.target.value)}
                  placeholder="البحث بالاسم، رقم الوثيقة، الجنسية، أسباب الحظر..."
                  className="w-full rounded-xl border border-slate-200 py-2 pr-9 pl-4 text-xs font-medium focus:border-red-500 focus:outline-none"
                />
              </div>
              {kycWatchlistSearch && (
                <button
                  onClick={() => setKycWatchlistSearch("")}
                  className="px-3 py-2 text-xs text-slate-500 hover:bg-[#0D382B]/[0.06] transition-colors rounded-lg font-bold"
                >
                  مسح البحث
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto app-card">
            {(() => {
              const filteredWatchlist = filteredKycWatchlist;

              return (
                <>
                  <table className="w-full text-sm">
                    <thead className="bg-[#0D382B]/[0.035] text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/70">
                      <tr>
                        <th className="px-4 py-3 font-semibold">اسم الشخص / الجهة</th>
                        <th className="px-4 py-3 font-semibold">الهوية / الجواز</th>
                        <th className="px-4 py-3 font-semibold">تصنيف الحظر</th>
                        <th className="px-4 py-3 font-semibold">سبب الحظر والمنع</th>
                        <th className="px-4 py-3 font-semibold">الجنسية</th>
                        <th className="px-4 py-3 font-semibold">تاريخ الإدراج</th>
                        {/* عمود ثابت (sticky) حتى يبقى زر الحذف ظاهراً دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                        <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-center bg-[#faf9f6] shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                          إجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {filteredWatchlist.map((item) => (
                        <tr key={item.id} className="hover:bg-red-50/40 group">
                          <td className="px-4 py-3 font-bold text-slate-900">{item.fullName}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">
                            {item.idNo || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="bg-red-100 text-red-800 border border-red-200">
                              {item.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">
                            {item.reason}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {item.nationality || "أخرى"}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">
                            {item.addedDate}
                          </td>
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-red-50/40 px-4 py-3 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                            <button
                              onClick={() => {
                                requestDelete({
                                  section: "قوائم الامتثال والحظر KYC",
                                  title: `الاسم: ${item.fullName}`,
                                  details: `الجهة: ${item.source} | الجنسية: ${item.nationality || "—"} | سبب الإدراج: ${item.reason}`,
                                  permKey: "deleteKyc",
                                  actionName: "حذف من قائمة الحظر",
                                  onConfirm: () => {
                                    logAuditAction(
                                      "DELETE",
                                      "قوائم الامتثال والحظر KYC",
                                      `سجل الحظر: ${item.fullName}`,
                                      `حذف الشخص/الكيان "${item.fullName}" (${item.type}) من قائمة الامتثال والحظر المحلية. سبب الإدراج السابق: ${item.reason}`,
                                      item.id,
                                      "مؤكد",
                                    );
                                    setKycWatchlist((prev) => prev.filter((w) => w.id !== item.id));
                                  },
                                });
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition cursor-pointer"
                              title="حذف من القائمة"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredWatchlist.length === 0 && (
                    <p className="py-10 text-center text-sm text-slate-400">
                      لا توجد أسماء مسجلة تطابق شروط البحث الحالية
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {kycSubTab === "str" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-red-700">
                <ShieldAlert /> سجل بلاغات المعاملات المشبوهة (AML / STR)
              </h2>
              <p className="text-xs text-slate-500">
                سجل إبلاغ وحدة المعلومات المالية بالدولة (FIU) الخاص بتنفيذ قوانين مواجهة غسل
                الأموال
              </p>
            </div>
            <button
              onClick={() => openModalWithCheck("str")}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 shadow-sm"
            >
              <Plus size={16} /> إضافة بلاغ اشتباه جديد
            </button>
          </div>

          <div className="space-y-3">
            {strReports.map((str) => (
              <div
                key={str.id}
                className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{clientName(str.clientId)}</h3>
                    <p className="text-xs text-slate-500">
                      المبلغ المشتبه به: <b className="text-red-700">{fmtAED(str.amountFlagged)}</b>{" "}
                      • التاريخ: {fmtDate(str.date)}
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-800 font-bold">{str.status}</Badge>
                </div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-red-100">
                  <b>أسباب الاشتباه:</b> {str.suspicionReason}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-amber-600" /> اعرف عميلك والعناية الواجبة (KYC / AML)
              </h2>
              <p className="text-xs text-slate-500">
                سجل التحقق من هويات الموكلين، المستفيد الحقيقي (UBO)، وفحص قوائم العقوبات وفق
                التشريعات الإماراتية
              </p>
              <p className="mt-1 text-[11px] font-semibold text-amber-700">
                ⚠️ بيانات PEP وفحص العقوبات في هذا السجل هي إقرار ذاتي غير محقق (Self-Declared /
                Unverified) — ليست نتيجة فحص آلي مقابل قائمة عقوبات رسمية، ويجب التحقق منها يدوياً من
                قبل مسؤول الامتثال قبل الاعتماد عليها.
              </p>
            </div>
            <button
              onClick={() => {
                setForm({});
                setModal("kyc");
              }}
              className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
            >
              <Plus size={16} /> إضافة سجل KYC
            </button>
          </div>

          {/* بطاقات إحصائية سريعة لـ KYC */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="app-card p-4">
              <p className="text-xs text-slate-500">إجمالي الموكلين المفحوصين</p>
              <p className="text-2xl font-bold text-slate-900">{kyc.length}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
              <p className="text-xs text-red-700 font-semibold">
                مخاطر مرتفعة / معرّضين سياسيًا (PEP)
              </p>
              <p className="text-2xl font-bold text-red-700">
                {kyc.filter((k) => k.risk === "مرتفع" || k.pep).length}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
              <p className="text-xs text-amber-800 font-semibold">مراجعة دورية مستحقة قريبًا</p>
              <p className="text-2xl font-bold text-amber-800">{kycDue}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
              <p className="text-xs text-emerald-800 font-semibold">ملفات مكتملة وسليمة</p>
              <p className="text-2xl font-bold text-emerald-800">
                {kyc.filter((k) => k.status === "مكتمل" && k.sanctions === "سليم").length}
              </p>
            </div>
          </div>

          {/* تبويب النشطة / الأرشيف لسجلات KYC — الأرشفة يدوية وقابلة للتراجع دائماً، ولا تحذف أي سجل */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            <button
              onClick={() => setShowArchivedKyc(false)}
              className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px transition ${
                !showArchivedKyc
                  ? "border-[#0D382B] text-[#0D382B]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              سجلات نشطة ({activeKyc.length})
            </button>
            <button
              onClick={() => setShowArchivedKyc(true)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold border-b-2 -mb-px transition ${
                showArchivedKyc
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
              title="سجلات KYC المؤرشفة يدوياً (لعلاقات عملاء منتهية مثلاً) — لا تزال موجودة بالكامل"
            >
              <Archive size={14} /> الأرشيف ({archivedKyc.length})
            </button>
          </div>

          {/* جدول سجلات KYC */}
          {visibleKyc.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              text={showArchivedKyc ? "لا توجد سجلات KYC مؤرشفة حالياً" : "لا توجد سجلات KYC مضافة حتى الآن"}
            />
          ) : (
            <div className="app-card overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[750px] text-sm">
                  <thead className="bg-[#0D382B]/[0.035] text-right text-[11px] uppercase tracking-wide font-bold text-[#0D382B]/70 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">الموكل</th>
                      <th className="px-4 py-3 font-semibold">الجنسية والوثيقة</th>
                      <th className="px-4 py-3 font-semibold">المستفيد الحقيقي (UBO)</th>
                      <th className="px-4 py-3 font-semibold">مصدر الأموال</th>
                      <th
                        className="px-4 py-3 font-semibold text-center"
                        title="إقرار ذاتي غير محقق — ليس فحصاً آلياً رسمياً"
                      >
                        PEP / العقوبات (إقرار ذاتي غير محقق)
                      </th>
                      <th className="px-4 py-3 font-semibold text-center">درجة المخاطر</th>
                      <th className="px-4 py-3 font-semibold text-center">الحالة</th>
                      <th className="px-4 py-3 font-semibold text-center">المراجعة القادمة</th>
                      {/* عمود ثابت (sticky) حتى تبقى أزرار التعديل والطباعة والحذف ظاهرة دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                      <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-center bg-[#faf9f6] shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {visibleKyc.map((k) => {
                      const nextRev = nextReviewDate(k.lastReview, k.risk);
                      const daysToRev = daysUntil(nextRev);
                      return (
                        <tr key={k.id} className="hover:bg-amber-50/30 group">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {clientName(k.clientId)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <p className="font-semibold text-slate-800">{k.nationality}</p>
                            <p className="text-slate-500">
                              {k.idType} (تنسحب: {fmtDate(k.idExpiry)})
                            </p>
                          </td>
                          <td
                            className="px-4 py-3 text-xs text-slate-700 max-w-xs truncate"
                            title={k.ubo}
                          >
                            {k.ubo}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{k.sourceOfFunds}</td>
                          <td className="px-4 py-3 text-center text-xs space-y-1">
                            {k.pep ? (
                              <span title="إقرار ذاتي غير محقق">
                                <Badge className="bg-purple-100 text-purple-700">
                                  PEP معرّض (إقرار ذاتي غير محقق)
                                </Badge>
                              </span>
                            ) : (
                              <span className="text-slate-400" title="إقرار ذاتي غير محقق">
                                عادي (إقرار ذاتي)
                              </span>
                            )}
                            <div>
                              <span title="إقرار ذاتي غير محقق — يتطلب تحققاً يدوياً من مسؤول الامتثال">
                                <Badge
                                  className={
                                    k.sanctions === "سليم"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  }
                                >
                                  {k.sanctions} (إقرار ذاتي)
                                </Badge>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={RISK_COLORS[k.risk]}>{k.risk}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={KYC_STATUS_COLORS[k.status]}>{k.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            <p className="font-semibold">{fmtDate(nextRev)}</p>
                            {daysToRev <= 30 ? (
                              <span className="text-[10px] text-red-600 font-bold">
                                مستحقة قريبًا ({daysToRev} يوم)
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                متبقي {daysToRev} يوم
                              </span>
                            )}
                          </td>
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-amber-50/30 px-4 py-3 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openNotificationComposer("تجديد وثائق / KYC", k)}
                                className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg flex items-center gap-1 text-xs font-semibold"
                                title="إرسال إشعار طلب تحديث الوثائق/KYC"
                              >
                                <Send size={14} /> تنبيه
                              </button>
                              <button
                                onClick={() => {
                                  setForm({ ...k });
                                  setModal("kyc-edit");
                                }}
                                className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-[#0D382B]/[0.06] transition-colors rounded-lg"
                                title="تعديل بيانات KYC"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => setReport({ kycId: k.id })}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-[#0D382B]/[0.06] transition-colors rounded-lg"
                                title="طباعة نموذج العناية الواجبة KYC"
                              >
                                <Printer size={15} />
                              </button>
                              {k.archived ? (
                                <button
                                  onClick={() => unarchiveKyc(k)}
                                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors rounded-lg"
                                  title="إلغاء الأرشفة — إعادة السجل للعرض النشط (لم يُحذف قط)"
                                >
                                  <ArchiveRestore size={15} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => archiveKyc(k)}
                                  className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors rounded-lg"
                                  title="أرشفة ملف KYC — إخفاء من العرض الافتراضي فقط، لا حذف ويمكن التراجع دائماً"
                                >
                                  <Archive size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  requestDelete({
                                    section: "ملفات اعرف عميلك KYC والامتثال",
                                    title: `ملف العميل: ${clientName(k.clientId)}`,
                                    details: `الجنسية: ${k.nationality} | درجة المخاطر: ${k.risk} | حالة الامتثال: ${k.sanctions} | الحالة: ${k.status}`,
                                    permKey: "deleteKyc",
                                    actionName: "حذف ملف KYC",
                                    onConfirm: () => {
                                      logAuditAction(
                                        "DELETE",
                                        "KYC والامتثال",
                                        `ملف KYC: ${clientName(k.clientId)}`,
                                        `حذف ملف KYC للموكل ${clientName(k.clientId)}`,
                                        k.id,
                                      );
                                      setKyc((prev) => prev.filter((x) => x.id !== k.id));
                                    },
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="حذف ملف KYC"
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
        </>
      )}
    </div>
  );
}
