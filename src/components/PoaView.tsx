import React from "react";
import { Sparkles, Plus, ScrollText, Send, Trash2 } from "lucide-react";
import { Badge } from "./AuthScreens";
import { PoaItem, RolePermissions } from "../domain/types";
import { fmtDate, daysUntil } from "../domain/utils";

export interface PoaViewProps {
  poas: PoaItem[];
  setPoas: React.Dispatch<React.SetStateAction<PoaItem[]>>;
  clientName: (id: number) => string;
  setShowPoaAiUploadModal: (show: boolean) => void;
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  openNotificationComposer: (
    type: "تنبيه جلسة" | "تحديث قضية" | "تذكير فاتورة" | "تجديد وثائق / KYC" | "تجديد وكالة / POA" | "تنبيه ميعاد طعن / استئناف" | "تذكير قسط فاتورة" | "رسالة عامة",
    data?: any
  ) => void;
  requestDelete: (opts: {
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  }) => void;
  logAuditAction: (
    actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS",
    targetModule: string,
    targetTitle: string,
    details: string,
    targetId?: string | number,
    statusOverride?: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل",
    userOverride?: { id?: string | number; name?: string; email?: string; roleTitle?: string; jobTitle?: string }
  ) => void;
}

export default function PoaView({
  poas,
  setPoas,
  clientName,
  setShowPoaAiUploadModal,
  openModalWithCheck,
  openNotificationComposer,
  requestDelete,
  logAuditAction,
}: PoaViewProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">إدارة الوكالات القانونية</h2>
          <p className="text-xs text-slate-500">توكيلات الكاتب العدل وتنبيهات الانتهاء الصادرة من كاتب العدل</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPoaAiUploadModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-sm font-bold text-white hover:opacity-95 shadow-sm transition"
          >
            <Sparkles size={16} className="text-amber-200 animate-pulse" /> ارفاق وكالة PDF (سحب البيانات آلياً)
          </button>
          <button onClick={() => openModalWithCheck("poa", "manageDocs")} className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"><Plus size={16} /> إضافة وكالة</button>
        </div>
      </div>
      {poas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ScrollText size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800">لا توجد وكالات قانونية مسجلة حالياً</p>
          <p className="text-xs text-slate-500 max-w-sm">
            يمكنك إضافة وكالة كاتب عدل جديدة يدوياً، أو رفع ملف PDF للوكالة وسحب بياناتها آلياً.
          </p>
        </div>
      ) : (
      <div className="space-y-3">
        {poas.map((p) => {
          const daysLeft = daysUntil(p.expiry);
          return (
            <div key={p.id} className="app-card p-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900">{p.number} — {clientName(p.clientId)}</h3>
                  <p className="text-xs text-slate-500">{p.issuer} | تاريخ الإصدار: {fmtDate(p.issue)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {daysLeft < 0 ? (
                    <Badge className="bg-red-100 text-red-800 font-black border border-red-200 px-3 py-1">منتهية</Badge>
                  ) : daysLeft <= 60 ? (
                    <Badge className="bg-amber-100 text-amber-800 font-bold">تنتهي خلال {daysLeft} يومًا</Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700">سارية ({daysLeft} يومًا)</Badge>
                  )}
                  <button
                    onClick={() => openNotificationComposer("تجديد وكالة / POA", p)}
                    className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200 hover:bg-amber-100"
                    title="إرسال تنبيه تجديد الوكالة بالواتساب/الإيميل"
                  >
                    <Send size={14} /> تنبيه التجديد
                  </button>
                  <button
                    onClick={() => {
                      requestDelete({
                        section: "الوكالات القانونية والتوكيلات",
                        title: `الوكالة رقم: ${p.number} — ${clientName(p.clientId)}`,
                        details: `الجهة المصدرة: ${p.issuer} | تاريخ الإصدار: ${fmtDate(p.issue)} | تاريخ الانتهاء: ${fmtDate(p.expiry)}`,
                        permKey: "deletePoas",
                        actionName: "حذف الوكالة",
                        onConfirm: () => {
                          logAuditAction("DELETE", "الوكالات", `وكالة: ${p.number}`, `حذف الوكالة رقم ${p.number} للموكل ${clientName(p.clientId)}`, p.id);
                          setPoas((prev) => prev.filter((x) => x.id !== p.id));
                        },
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="حذف الوكالة"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-700 bg-stone-50 p-2 rounded-lg border border-stone-200 font-medium">صلاحيات الوكالة: {p.scope}</p>
            </div>
          );
        })}
      </div>
      )}
    </>
  );
}
