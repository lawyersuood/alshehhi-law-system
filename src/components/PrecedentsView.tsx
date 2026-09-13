import React from "react";
import { BookOpen, Plus, Search, Landmark, Gavel, Scale, Copy, FileText, FileSpreadsheet, Trash2 } from "lucide-react";
import { Badge } from "./AuthScreens";
import { LegalPrecedent, RolePermissions } from "../domain/types";

export interface PrecedentsViewProps {
  setShowAddPrecedentModal: (v: boolean) => void;
  precedentSearch: string;
  setPrecedentSearch: (v: string) => void;
  precedentCourtFilter: string;
  setPrecedentCourtFilter: (v: string) => void;
  precedentCategoryFilter: string;
  setPrecedentCategoryFilter: (v: string) => void;
  precedentYearFilter: string;
  setPrecedentYearFilter: (v: string) => void;
  filteredPrecedents: LegalPrecedent[];
  setSelectedPrecedent: (p: LegalPrecedent | null) => void;
  userPerms: RolePermissions;
  deletePrecedent: (precId: string | number) => void;
}

export default function PrecedentsView({
  setShowAddPrecedentModal,
  precedentSearch,
  setPrecedentSearch,
  precedentCourtFilter,
  setPrecedentCourtFilter,
  precedentCategoryFilter,
  setPrecedentCategoryFilter,
  precedentYearFilter,
  setPrecedentYearFilter,
  filteredPrecedents,
  setSelectedPrecedent,
  userPerms,
  deletePrecedent,
}: PrecedentsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                مكتبة المبادئ والقواعد القضائية
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                أرشيف ومرجع المبادئ والسوابق القضائية الصادرة عن محاكم التمييز والنقض والمحكمة الاتحادية العليا
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPrecedentModal(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm"
          >
            <Plus size={16} /> إضافة مبدأ قضائي جديد
          </button>
        </div>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="app-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={precedentSearch}
                onChange={(e) => setPrecedentSearch(e.target.value)}
                placeholder="البحث بالكلمة المفتاحية، نص القاعدة، رقم الطعن..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-4 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* فلتر المحكمة */}
            <select
              value={precedentCourtFilter}
              onChange={(e) => setPrecedentCourtFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-stone-50"
            >
              <option value="الكل">جميع المحاكم</option>
              <option value="المحكمة الاتحادية العليا">المحكمة الاتحادية العليا</option>
              <option value="محكمة تمييز دبي">محكمة تمييز دبي</option>
              <option value="محكمة نقض أبوظبي">محكمة نقض أبوظبي</option>
              <option value="محكمة تمييز رأس الخيمة">محكمة تمييز رأس الخيمة</option>
              <option value="محاكم عجمان الاستئنافية">محاكم عجمان الاستئنافية</option>
            </select>

            {/* فلتر التصنيف */}
            <select
              value={precedentCategoryFilter}
              onChange={(e) => setPrecedentCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-stone-50"
            >
              <option value="الكل">جميع التصنيفات</option>
              <option value="تجاري">تجاري</option>
              <option value="مدني">مدني</option>
              <option value="عقاري">عقاري</option>
              <option value="عمالي">عمالي</option>
              <option value="جزائي">جزائي</option>
              <option value="أحوال شخصية">أحوال شخصية</option>
              <option value="إداري">إداري</option>
            </select>

            {/* فلتر السنة */}
            <select
              value={precedentYearFilter}
              onChange={(e) => setPrecedentYearFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-stone-50"
            >
              <option value="الكل">جميع السنوات</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>
      </div>

      {/* شبكة المبادئ القضائية */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPrecedents.map((prec) => (
          <div
            key={prec.id}
            className="app-card p-5 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                  <Landmark size={13} /> {prec.court_name}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                    {prec.category}
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-900 font-mono text-[11px]">
                    {prec.ruling_year}
                  </Badge>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                {prec.title}
              </h3>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-3 bg-stone-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Gavel size={14} className="text-amber-600" />
                <span>{prec.appeal_number}</span>
                {prec.circuit_name && (
                  <span className="mr-auto text-slate-400 font-sans">({prec.circuit_name})</span>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700 leading-relaxed mb-4 font-sans">
                <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Scale size={13} className="text-amber-700" /> نص القاعدة القانونية / المبدأ:
                </p>
                {prec.summary_text}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${prec.title}\nالمحكمة: ${prec.court_name}\nرقم الطعن: ${prec.appeal_number}\nالمبدأ: ${prec.summary_text}`);
                    alert("تم نسخ المبدأ والقاعدة القانونية للحافظة بنجاح!");
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 transition font-medium"
                  title="نسخ المبدأ لاستخدامه في المذكرات"
                >
                  <Copy size={13} /> نسخ
                </button>

                {prec.pdf_file_url && (
                  <a
                    href={prec.pdf_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-red-700 hover:bg-red-100 transition font-bold text-[11px]"
                  >
                    <FileText size={13} /> PDF
                  </a>
                )}

                {prec.word_file_url && (
                  <a
                    href={prec.word_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-blue-700 hover:bg-blue-100 transition font-bold text-[11px]"
                  >
                    <FileSpreadsheet size={13} /> Word
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedPrecedent(prec)}
                  className="text-amber-700 hover:underline font-bold text-xs"
                >
                  التفاصيل الكاملة
                </button>
                {userPerms.manageUsers && (
                  <button
                    onClick={() => deletePrecedent(prec.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                    title="حذف المبدأ"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrecedents.length === 0 && (
        <div className="app-card py-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold">لا توجد مبادئ قضائية مطابقة للبحث والتصفية</p>
        </div>
      )}
    </div>
  );
}
