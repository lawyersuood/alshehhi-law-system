import React from "react";
import {
  Handshake,
  Plus,
  FileSignature,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Printer,
} from "lucide-react";
import { Badge } from "./AuthScreens";
import { Colleague, ColleagueDelegation, CaseItem } from "../domain/types";
import { fmtDate } from "../domain/utils";

export interface ColleaguesViewProps {
  colleagues: Colleague[];
  colleagueDelegations: ColleagueDelegation[];
  colleagueSubTab: "directory" | "delegations";
  setColleagueSubTab: (tab: "directory" | "delegations") => void;
  cases: CaseItem[];
  openColleagueModal: (c?: Colleague) => void;
  openIssueDelegationModal: (c: Colleague) => void;
  deleteColleagueHandler: (c: Colleague) => void;
  deleteDelegationHandler: (d: ColleagueDelegation) => void;
  setDelegationPreviewId: (id: number | null) => void;
}

export default function ColleaguesView({
  colleagues,
  colleagueDelegations,
  colleagueSubTab,
  setColleagueSubTab,
  cases,
  openColleagueModal,
  openIssueDelegationModal,
  deleteColleagueHandler,
  deleteDelegationHandler,
  setDelegationPreviewId,
}: ColleaguesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Handshake className="text-amber-600" /> الزملاء والإنابات
          </h2>
          <p className="text-xs text-slate-500">
            دليل المحامين المتعاونين للاستعانة بهم في الجلسات، وإصدار إنابات الحضور الرسمية
          </p>
        </div>
        {colleagueSubTab === "directory" ? (
          <button
            onClick={() => openColleagueModal()}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> إضافة زميل
          </button>
        ) : null}
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setColleagueSubTab("directory")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${colleagueSubTab === "directory" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Handshake size={18} /> دليل الزملاء ({colleagues.length})
        </button>
        <button
          onClick={() => setColleagueSubTab("delegations")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${colleagueSubTab === "delegations" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <FileSignature size={18} /> الإنابات الصادرة ({colleagueDelegations.length})
        </button>
      </div>

      {colleagueSubTab === "directory" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleagues.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-400 py-10 rounded-2xl border border-dashed border-slate-200">
              لا يوجد زملاء مسجلون بعد. اضغط "إضافة زميل" لبدء بناء دليل التعاون.
            </p>
          )}
          {colleagues.map((c) => (
            <div key={c.id} className="app-card p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  {c.specialization && (
                    <p className="text-[11px] text-slate-500">{c.specialization}</p>
                  )}
                </div>
                <Badge
                  className={
                    c.status === "متاح"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }
                >
                  {c.status}
                </Badge>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center gap-1.5 hover:text-amber-700"
                >
                  <Phone size={13} /> {c.phone}
                </a>
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-1.5 hover:text-amber-700"
                  >
                    <Mail size={13} /> {c.email}
                  </a>
                )}
                {c.coverageArea && (
                  <p className="flex items-center gap-1.5">
                    <MapPin size={13} /> {c.coverageArea}
                  </p>
                )}
              </div>
              {c.notes && (
                <p className="text-[11px] text-slate-500 bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {c.notes}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                <button
                  onClick={() => openIssueDelegationModal(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                >
                  <FileSignature size={14} /> إصدار إنابة
                </button>
                <button
                  onClick={() => openColleagueModal(c)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors rounded-xl transition"
                  title="تعديل"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => deleteColleagueHandler(c)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="حذف"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {colleagueDelegations.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-10 rounded-2xl border border-dashed border-slate-200">
              لم تُصدر أي إنابة بعد.
            </p>
          )}
          {colleagueDelegations.map((d) => {
            const colleague = colleagues.find((c) => c.id === d.colleagueId);
            const linkedCase = d.caseId ? cases.find((c) => c.id === d.caseId) : undefined;
            return (
              <div
                key={d.id}
                className="app-card p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {d.refNo}
                    </span>
                    <Badge
                      className={
                        d.status === "صادرة"
                          ? "bg-emerald-100 text-emerald-700"
                          : d.status === "مستخدمة"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                      }
                    >
                      {d.status}
                    </Badge>
                  </div>
                  <p className="font-bold text-sm text-slate-900 mt-1">
                    {colleague?.name || "زميل محذوف"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {linkedCase ? `القضية: ${linkedCase.number}` : d.caseTitleSnapshot || "—"} •{" "}
                    {fmtDate(d.issuedAt.slice(0, 10))}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{d.purpose}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDelegationPreviewId(d.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 transition"
                  >
                    <Printer size={14} /> طباعة
                  </button>
                  <button
                    onClick={() => deleteDelegationHandler(d)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="حذف"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
