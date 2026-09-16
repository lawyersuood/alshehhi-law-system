import React from "react";
import { History, ShieldAlert, Search, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "./AuthScreens";
import { AuditLogEntry } from "../domain/types";
import { todayISO } from "../domain/utils";

export interface AuditLogViewProps {
  filteredAuditLogs: AuditLogEntry[];
  canViewAuditLog: boolean;
  auditLogs: AuditLogEntry[];
  auditSearchTerm: string;
  setAuditSearchTerm: (v: string) => void;
  auditActionFilter: string;
  setAuditActionFilter: (v: string) => void;
  auditModuleFilter: string;
  setAuditModuleFilter: (v: string) => void;
  auditModuleOptions: string[];
}

export default function AuditLogView({
  filteredAuditLogs,
  canViewAuditLog,
  auditLogs,
  auditSearchTerm,
  setAuditSearchTerm,
  auditActionFilter,
  setAuditActionFilter,
  auditModuleFilter,
  setAuditModuleFilter,
  auditModuleOptions,
}: AuditLogViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                سجل التدقيق وتتبع الأنشطة (Audit Log)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                توثيق رقمي فوري لجميع عمليات الحذف، التعديل الحساس، وتغييرات الصلاحيات لضمان الرقابة
                والحوكمة
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-900 text-amber-400 font-mono text-xs px-3 py-1.5 rounded-xl">
            {filteredAuditLogs.length} نشاط مسجّل
          </Badge>
        </div>
      </div>

      {!canViewAuditLog ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-12 text-center">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">وصول محظور</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
            عذراً، استعراض سجل التدقيق والأنشطة مقتصر فقط على مدير النظام والمصرح لهم بإدارة الحوكمة
            والصلاحيات.
          </p>
        </div>
      ) : (
        <>
          {/* بطاقات الإحصائيات السريعة */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="app-card p-5">
              <p className="text-xs font-medium text-slate-500">إجمالي الأنشطة الموثقة</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{auditLogs.length}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                سجل غير قابل للتعديل مع التوقيت ومعرف ID
              </p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm">
              <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-rose-600 animate-pulse" /> محاولات الحذف غير
                المصرح بها
              </p>
              <p className="mt-2 text-2xl font-black text-rose-700">
                {
                  auditLogs.filter(
                    (a) =>
                      a.actionType === "UNAUTHORIZED_DELETE" ||
                      a.status === "محاولة غير مصرح بها - مرفوض",
                  ).length
                }
              </p>
              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                تم إحباطها وتوثيق معرف المستخدم آلياً
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
              <p className="text-xs font-bold text-amber-900">عمليات الحذف المؤكدة</p>
              <p className="mt-2 text-2xl font-black text-amber-800">
                {
                  auditLogs.filter(
                    (a) => a.actionType === "DELETE" && a.status !== "محاولة غير مصرح بها - مرفوض",
                  ).length
                }
              </p>
              <p className="mt-1 text-[11px] text-amber-700">حذف بعد الصلاحية والتأكيد المسبق</p>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 shadow-sm">
              <p className="text-xs font-medium text-purple-700">تغيير الصلاحيات والحسابات</p>
              <p className="mt-2 text-2xl font-black text-purple-600">
                {auditLogs.filter((a) => a.actionType === "PERMISSION_CHANGE").length}
              </p>
              <p className="mt-1 text-[11px] text-purple-500">تحديث أذونات الوصول للوحدات</p>
            </div>
          </div>

          {/* أشرطة التصفية والبحث */}
          <div className="app-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 min-w-[280px]">
                <div className="relative flex-1">
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    placeholder="البحث باسم المستخدم، معرف ID، البريد، العنصر المستهدف، أو تفاصيل النشاط..."
                    className="w-full rounded-xl border border-slate-200 py-2 pr-9 pl-4 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* فلتر نوع العملية */}
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none bg-stone-50"
                >
                  <option value="الكل">كل أنواع العمليات</option>
                  <option value="UNAUTHORIZED_DELETE">🚫 محاولات حذف غير مصرح بها (محظورة)</option>
                  <option value="DELETE">🗑️ حذف مؤكد (DELETE)</option>
                  <option value="PERMISSION_CHANGE">🔐 تغيير صلاحيات (PERMISSION_CHANGE)</option>
                  <option value="STATUS_CHANGE">🔄 تغيير حالة (STATUS_CHANGE)</option>
                  <option value="UPDATE">✏️ تعديل (UPDATE)</option>
                  <option value="CREATE">➕ إنشاء (CREATE)</option>
                  <option value="UNAUTHORIZED_ACCESS">⚠️ محاولة وصول غير مصرح بها</option>
                </select>

                {/* فلتر القسم / وحدة النظام */}
                <select
                  value={auditModuleFilter}
                  onChange={(e) => setAuditModuleFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none bg-stone-50"
                >
                  <option value="الكل">جميع الأقسام</option>
                  {auditModuleOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const headers =
                      "ID,Timestamp,Formatted_Timestamp,User_ID,User_Name,Email,Role,Action_Type,Status,Module,Target_ID,Target_Title,Details,IP\n";
                    const rows = filteredAuditLogs
                      .map(
                        (l) =>
                          `"${l.id}","${l.timestamp}","${l.formattedTimestamp || ""}","${l.userId || ""}","${l.userName}","${l.userEmail}","${l.userRole}","${l.actionType}","${l.status || "مكتمل"}","${l.targetModule}","${l.targetId || ""}","${l.targetTitle.replace(/"/g, '""')}","${l.details.replace(/"/g, '""')}","${l.ipAddress || ""}"`,
                      )
                      .join("\n");
                    const blob = new Blob(["﻿" + headers + rows], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `audit_log_security_${todayISO()}.csv`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors transition shadow-2xs"
                >
                  <Download size={14} /> تصدير السجل الأمني (CSV)
                </button>
              </div>
            </div>
          </div>

          {/* جدول السجلات */}
          <div className="overflow-hidden app-card">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[950px] text-right text-xs">
                <thead className="border-b border-slate-200 bg-slate-900 text-amber-400 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">التوقيت والتاريخ الكامل</th>
                    <th className="px-4 py-3.5">المستخدم ومعرف ID</th>
                    <th className="px-4 py-3.5">نوع العملية</th>
                    <th className="px-4 py-3.5">حالة الإجراء</th>
                    <th className="px-4 py-3.5">القسم / الوحدة</th>
                    <th className="px-4 py-3.5">العنصر المستهدف</th>
                    <th className="px-4 py-3.5 min-w-[260px]">تفاصيل الإجراء والمحاولة</th>
                    <th className="px-4 py-3.5 text-center">عنوان IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-slate-700">
                  {filteredAuditLogs.map((log) => {
                    const isUnauthorized =
                      log.actionType === "UNAUTHORIZED_DELETE" ||
                      log.actionType === "UNAUTHORIZED_ACCESS" ||
                      log.status === "محاولة غير مصرح بها - مرفوض";

                    const actionBadge =
                      (
                        {
                          UNAUTHORIZED_DELETE:
                            "bg-rose-100 text-rose-800 border-rose-300 font-black ring-1 ring-rose-200",
                          UNAUTHORIZED_ACCESS:
                            "bg-orange-100 text-orange-800 border-orange-300 font-black",
                          DELETE: "bg-red-100 text-red-700 border-red-200 font-bold",
                          PERMISSION_CHANGE:
                            "bg-purple-100 text-purple-700 border-purple-200 font-bold",
                          STATUS_CHANGE: "bg-blue-100 text-blue-700 border-blue-200 font-bold",
                          UPDATE: "bg-amber-100 text-amber-800 border-amber-200 font-bold",
                          CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200 font-bold",
                        } as Record<string, string>
                      )[log.actionType] || "bg-slate-100 text-slate-700";

                    const actionLabel =
                      (
                        {
                          UNAUTHORIZED_DELETE: "🚫 محاولة حذف غير مصرح بها",
                          UNAUTHORIZED_ACCESS: "⚠️ محاولة وصول غير مصرح بها",
                          DELETE: "🗑️ حذف (DELETE)",
                          PERMISSION_CHANGE: "🔐 تغيير صلاحيات",
                          STATUS_CHANGE: "🔄 تغيير حالة",
                          UPDATE: "✏️ تعديل (UPDATE)",
                          CREATE: "➕ إنشاء (CREATE)",
                        } as Record<string, string>
                      )[log.actionType] || log.actionType;

                    const displayTimestamp =
                      log.formattedTimestamp ||
                      (() => {
                        const d = new Date(log.timestamp);
                        return isNaN(d.getTime())
                          ? log.timestamp
                          : `${d.toLocaleDateString("ar-AE", { year: "numeric", month: "2-digit", day: "2-digit" })} ${d.toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`;
                      })();

                    return (
                      <tr
                        key={log.id}
                        className={`transition ${isUnauthorized ? "bg-rose-50/50 hover:bg-rose-100/60" : "hover:bg-slate-50/80"}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono text-[11px] font-bold text-slate-800">
                            {displayTimestamp}
                          </div>
                          <div
                            className="font-mono text-[9px] text-slate-400 font-normal mt-0.5"
                            title="ISO Timestamp"
                          >
                            {log.timestamp}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{log.userName}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-black border border-slate-300">
                              ID: #{log.userId ?? "—"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {log.userRole} {log.userEmail ? `• ${log.userEmail}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] border ${actionBadge}`}
                          >
                            {actionLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isUnauthorized ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-600 text-white shadow-2xs">
                              <ShieldAlert size={12} />{" "}
                              {log.status || "محاولة غير مصرح بها - مرفوض"}
                            </span>
                          ) : log.actionType === "DELETE" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={12} /> {log.status || "مؤكد"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {log.status || "مكتمل"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                          <span className="bg-slate-100 px-2 py-1 rounded-md text-[11px] border border-slate-200/60 font-semibold">
                            {log.targetModule}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                          <div>{log.targetTitle}</div>
                          {log.targetId && log.targetId !== "—" && (
                            <span className="text-[10px] font-mono text-slate-400">
                              Ref: {log.targetId}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700 leading-relaxed text-xs">
                          <div
                            className={`p-2 rounded-lg border text-[11px] ${isUnauthorized ? "bg-rose-100/60 border-rose-200 text-rose-950 font-medium" : "bg-stone-50 border-stone-200/80 text-slate-700"}`}
                          >
                            {log.details}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="font-mono text-[10px] bg-stone-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {log.ipAddress || "192.168.1.10"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAuditLogs.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <History size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">
                    لا توجد أنشطة مسجلة تفي بمعايير البحث الحالية
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
