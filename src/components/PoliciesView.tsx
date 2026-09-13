import React from "react";
import { ScrollText, Plus, Search, ChevronUp, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { Badge } from "./AuthScreens";
import { InternalPolicy } from "../domain/types";
import { POLICY_CATEGORIES } from "../domain/constants";

export interface PoliciesViewProps {
  isSuperAdmin: boolean;
  openAddPolicy: () => void;
  policySearch: string;
  setPolicySearch: (v: string) => void;
  policyCategoryFilter: string;
  setPolicyCategoryFilter: (v: string) => void;
  filteredPolicies: InternalPolicy[];
  policies: InternalPolicy[];
  selectedPolicy: InternalPolicy | null;
  setSelectedPolicy: (p: InternalPolicy | null) => void;
  openEditPolicy: (policy: InternalPolicy) => void;
  handleDeletePolicy: (policy: InternalPolicy) => void;
}

export default function PoliciesView({
  isSuperAdmin,
  openAddPolicy,
  policySearch,
  setPolicySearch,
  policyCategoryFilter,
  setPolicyCategoryFilter,
  filteredPolicies,
  policies,
  selectedPolicy,
  setSelectedPolicy,
  openEditPolicy,
  handleDeletePolicy,
}: PoliciesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
            <ScrollText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">السياسات الداخلية للمكتب</h2>
            <p className="text-xs text-slate-500 mt-1">
              لائحة السياسات والإجراءات الإدارية المعتمدة، متاحة لجميع الكادر للاطلاع عليها
            </p>
          </div>
        </div>
        {isSuperAdmin && (
          <button
            onClick={openAddPolicy}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm"
          >
            <Plus size={16} /> إضافة سياسة جديدة
          </button>
        )}
      </div>

      <div className="app-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
                placeholder="البحث في عنوان أو نص السياسة..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-4 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          <select
            value={policyCategoryFilter}
            onChange={(e) => setPolicyCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-stone-50"
          >
            <option value="الكل">جميع التصنيفات</option>
            {POLICY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPolicies.map((policy) => {
          const isOpen = selectedPolicy?.id === policy.id;
          return (
            <div key={policy.id} className="app-card overflow-hidden">
              <button
                onClick={() => setSelectedPolicy(isOpen ? null : policy)}
                className="w-full flex items-center justify-between gap-3 p-5 text-right hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge className="bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-bold">
                      {policy.category}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      آخر تحديث: {policy.updatedAt}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{policy.title}</h3>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 p-5 bg-stone-50/60">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{policy.content}</p>
                  {policy.effectiveDate && (
                    <p className="text-[11px] text-slate-400 mt-3">تاريخ السريان: {policy.effectiveDate}</p>
                  )}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => openEditPolicy(policy)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors"
                      >
                        <Edit2 size={13} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(policy)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={13} /> حذف
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="app-card py-12 text-center text-slate-400">
          <ScrollText size={40} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold">
            {policies.length === 0 ? "لم تُضَف أي سياسة داخلية بعد" : "لا توجد سياسات مطابقة للبحث والتصفية"}
          </p>
        </div>
      )}
    </div>
  );
}
