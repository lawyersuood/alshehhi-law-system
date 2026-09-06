import React from "react";
import { Construction } from "lucide-react";

// شاشة مؤقتة لأقسام النظام المحاسبي الجديدة التي تمت إضافتها لهيكل القائمة الجانبية
// (بعد دراسة تفصيلية لنظام Wafeq) لكن شاشتها الكاملة لم تُبنى بعد — تُستبدل تباعاً
// بشاشة عمل كاملة (نموذج + جدول + منطق محاسبي) قسم بقسم حسب خطة التطوير المتفق عليها.
export default function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="app-card p-10 flex flex-col items-center justify-center text-center gap-3 min-h-[280px]">
      <div className="h-12 w-12 rounded-2xl bg-[#C5A059]/[0.12] text-[#C5A059] flex items-center justify-center">
        <Construction size={22} />
      </div>
      <h2 className="text-lg font-black text-[#0D382B]">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md">
        {description || "هذا القسم ضمن خطة تطوير النظام المحاسبي الجديد وسيتم بناؤه بالكامل في مرحلة قادمة قريبة."}
      </p>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0D382B]/[0.06] text-[#0D382B] text-[11px] font-bold px-3 py-1">
        قيد التطوير
      </span>
    </div>
  );
}
