const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="flex flex-wrap items-center gap-2">\s*\{\/\* فلتر نوع العملية \*\/\}\s*<select[\s\S]*?<\/select>\s*<button/;

const replacement = `<div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => toggleFilters('audit_log')} className={\`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition \${showFilters.audit_log ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}\`}>
                            <Filter size={14} /> تصفية السجل
                          </button>

                          {showFilters.audit_log && (
                            <>
                              {/* فلتر نوع العملية */}
                              <select
                                value={auditActionFilter}
                                onChange={(e) => { setAuditActionFilter(e.target.value); closeFilters('audit_log'); }}
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
                                onChange={(e) => { setAuditModuleFilter(e.target.value); closeFilters('audit_log'); }}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none bg-stone-50"
                              >
                                <option value="الكل">جميع الأقسام</option>
                                <option value="إدارة القضايا">إدارة القضايا</option>
                                <option value="سجل الموكلين">سجل الموكلين</option>
                                <option value="المستخدمون والصلاحيات">المستخدمون والصلاحيات</option>
                                <option value="الفواتير والضريبة">الفواتير والضريبة</option>
                                <option value="اتفاقيات وعقود الأتعاب">اتفاقيات وعقود الأتعاب</option>
                                <option value="الأرشيف والمستندات">الأرشيف والمستندات</option>
                                <option value="الوكالات القانونية">الوكالات القانونية</option>
                                <option value="جدول الجلسات والرول القضائي">جدول الجلسات والرول القضائي</option>
                                <option value="المهام والتكليفات">المهام والتكليفات</option>
                                <option value="قوائم الامتثال والحظر KYC">قوائم الامتثال والحظر KYC</option>
                                <option value="دليل المحاكم والجهات القضائية">دليل المحاكم والجهات القضائية</option>
                                <option value="الكادر والرواتب HR">الكادر والرواتب HR</option>
                              </select>
                            </>
                          )}
                          <button`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed audit_log filters");
} else {
    console.log("Regex not matched!");
}
