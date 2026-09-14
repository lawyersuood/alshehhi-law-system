import React from "react";
import { ChevronLeft, Edit2 } from "lucide-react";
import { Badge } from "./AuthScreens";
import { CaseItem, RolePermissions } from "../domain/types";
import { CASE_STAGES, CASE_STATUS } from "../domain/constants";
import { statusColor, stageBadgeColor, getCaseStage, caseOpponentsLabel, caseTypeBadgeColor, caseTypeDotColor, fmtAED, fmtDate } from "../domain/utils";

const inputCls = "w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all";

export interface CaseDetailViewProps {
  selectedCase: CaseItem;
  setCaseView: (id: number | null) => void;
  userPerms: RolePermissions;
  setEditingCase: (c: CaseItem | null) => void;
  setForm: (v: Record<string, any>) => void;
  setModal: (v: string | null) => void;
  logAuditAction: (
    actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS",
    targetModule: string,
    targetTitle: string,
    details: string,
    targetId?: string | number,
    statusOverride?: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل",
    userOverride?: { id?: string | number; name?: string; email?: string; roleTitle?: string; jobTitle?: string }
  ) => void;
  cases: CaseItem[];
  setCases: React.Dispatch<React.SetStateAction<CaseItem[]>>;
  clientName: (id: number) => string;
  canViewFinancials: boolean;
}

export default function CaseDetailView({
  selectedCase,
  setCaseView,
  userPerms,
  setEditingCase,
  setForm,
  setModal,
  logAuditAction,
  cases,
  setCases,
  clientName,
  canViewFinancials,
}: CaseDetailViewProps) {
  return (
    <>
      <button onClick={() => setCaseView(null)} className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ChevronLeft size={16} className="rotate-180" /> عودة إلى القضايا
      </button>
      <div className="app-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full ${caseTypeDotColor(selectedCase.type)} shadow-xs`}
                  title={`تصنيف القضية: ${selectedCase.type}`}
                />
                <h2 className="text-xl font-bold">{selectedCase.number}</h2>
              </div>
              <Badge className={`${caseTypeBadgeColor(selectedCase.type)} inline-flex items-center gap-1.5 shadow-2xs`}>
                <span className={`h-1.5 w-1.5 rounded-full ${caseTypeDotColor(selectedCase.type)} inline-block shrink-0`} />
                {selectedCase.type}
              </Badge>
              <Badge className={stageBadgeColor(getCaseStage(selectedCase))}>{getCaseStage(selectedCase)}</Badge>
              <Badge className={statusColor(selectedCase.status)}>{selectedCase.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{selectedCase.subject}</p>
          </div>
          {userPerms.manageCases ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingCase(selectedCase);
                  setForm({
                    number: selectedCase.number,
                    clientId: selectedCase.clientId,
                    opponents: selectedCase.opponents && selectedCase.opponents.length > 0 ? [...selectedCase.opponents] : [""],
                    type: selectedCase.type,
                    court: selectedCase.court,
                    judge: selectedCase.judge,
                    stage: selectedCase.stage,
                    status: selectedCase.status,
                    subject: selectedCase.subject,
                    openDate: selectedCase.openDate,
                    fee: selectedCase.fee,
                    emirate: selectedCase.emirate,
                  });
                  setModal("case");
                }}
                className="self-end flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                title="تعديل بيانات القضية"
              >
                <Edit2 size={13} /> تعديل بيانات القضية
              </button>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block">مرحلة الدعوى:</span>
                <select
                  value={selectedCase.stage || getCaseStage(selectedCase)}
                  onChange={(e) => {
                    const newStage = e.target.value;
                    logAuditAction("UPDATE", "القضايا", `قضية رقم ${selectedCase.number}`, `تعديل مرحلة القضية رقم ${selectedCase.number} إلى (${newStage})`, selectedCase.id);
                    setCases(cases.map((c) => c.id === selectedCase.id ? { ...c, stage: newStage } : c));
                  }}
                  className={`${inputCls} w-auto text-xs py-1.5`}
                >
                  {CASE_STAGES.map((stg) => <option key={stg} value={stg}>{stg}</option>)}
                </select>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block">حالة القضية:</span>
                <select
                  value={selectedCase.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    logAuditAction("STATUS_CHANGE", "القضايا", `قضية رقم ${selectedCase.number}`, `تعديل حالة القضية رقم ${selectedCase.number} من (${selectedCase.status}) إلى (${newStatus})`, selectedCase.id);
                    setCases(cases.map((c) => c.id === selectedCase.id ? { ...c, status: newStatus } : c));
                  }}
                  className={`${inputCls} w-auto text-xs py-1.5`}
                >
                  {CASE_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <Badge className="bg-slate-100 text-slate-600">غير مصرح بالتعديل</Badge>
          )}
        </div>
        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["نوع وتصنيف القضية", selectedCase.type, true],
            ["مرحلة الدعوى (درجة التقاضي)", getCaseStage(selectedCase)],
            ["حالة القضية الإجرائية", selectedCase.status],
            ["الموكل", clientName(selectedCase.clientId)],
            ["الخصم", caseOpponentsLabel(selectedCase)],
            ["المحكمة", selectedCase.court],
            ["الدائرة/القاضي", selectedCase.judge || "—"],
            ["تاريخ القيد", fmtDate(selectedCase.openDate)],
            canViewFinancials ? ["الأتعاب المتفق عليها", fmtAED(selectedCase.fee)] : null,
          ].filter(Boolean).map(([k, v, isType]: any) => (
            <div key={k} className="rounded-xl bg-stone-50 p-3">
              <p className="text-xs text-slate-500">{k}</p>
              {isType ? (
                <div className="mt-1">
                  <Badge className={`${caseTypeBadgeColor(String(v))} inline-flex items-center gap-1.5 shadow-2xs`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${caseTypeDotColor(String(v))} inline-block shrink-0`} />
                    {v}
                  </Badge>
                </div>
              ) : (
                <p className="mt-0.5 font-semibold">{v}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
