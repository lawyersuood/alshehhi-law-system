const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="flex flex-col md:flex-row gap-3">[\s\S]*?{auditSearchTerm && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*<\/div>\s*<div className="flex flex-wrap items-center gap-2">[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;

const replacement = `<div className="flex flex-col gap-3">
                        <div className="flex flex-col md:flex-row gap-3">
                          <button onClick={() => toggleFilters('audit_log')} className={\`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border transition \${showFilters.audit_log ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}\`}>
                              <Filter size={14} /> تصفية السجل
                          </button>
                          <div className="relative w-full">
                            <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
                            <input
                              type="text"
                              value={auditSearchTerm}
                              onChange={(e) => setAuditSearchTerm(e.target.value)}
                              placeholder="البحث باسم المستخدم، معرف ID، البريد، العنصر المستهدف، أو تفاصيل النشاط..."
                              className="w-full rounded-xl border border-slate-200 py-2 pr-9 pl-4 text-sm focus:border-amber-500 focus:outline-none"
                            />
                            {auditSearchTerm && (
                              <button
                                onClick={() => setAuditSearchTerm("")}
                                className="absolute left-3 top-2 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {showFilters.audit_log && (
                          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in">
                            {/* فلتر نوع العملية */}
                            <select
                              value={auditActionFilter}
                              onChange={(e) => { setAuditActionFilter(e.target.value); closeFilters('audit_log'); }}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none bg-white"
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
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-amber-500 focus:outline-none bg-white"
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
                            </select>
                          </div>
                        )}
                      </div>`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed audit_log filters");
} else {
    console.log("Regex not matched!");
}
