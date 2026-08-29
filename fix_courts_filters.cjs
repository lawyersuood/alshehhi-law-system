const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{/* ================= صندوق التصنيف الهرمي الثلاثي والبحث الذكي المطور ================= */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  
                  {/* شريط البحث الذكي المطور */}
                  <div className="relative">
                    <Search size={18} className="absolute right-3.5 top-3 text-slate-400" />
                    <input
                      value={courtSearchQuery}
                      onChange={(e) => setCourtSearchQuery(e.target.value)}
                      placeholder="بحث فوري فائق الدقة: بالاسم، الإمارة، المحكمة (مثلاً الذيد، خورفكان، الفلج)، القسم، الموظف، التمديدة، رقم الهاتف، الإيميل..."
                      className={\`\${inputCls} pr-10 pl-10 text-sm font-medium\`}
                    />
                    {courtSearchQuery && (
                      <button
                        onClick={() => setCourtSearchQuery("")}
                        className="absolute left-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="مسح نص البحث"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>`;
                  
const replacement = `{/* ================= صندوق التصنيف الهرمي الثلاثي والبحث الذكي المطور ================= */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm space-y-0 overflow-hidden">
                  
                  {/* شريط البحث الذكي المطور */}
                  <div className="p-4 flex flex-col md:flex-row items-center gap-3 bg-slate-50/50">
                    <button onClick={() => toggleFilters('courts')} className={\`shrink-0 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold border transition \${showFilters.courts ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}\`}>
                        <Filter size={14} /> تصفية المحاكم
                    </button>
                    <div className="relative w-full">
                      <Search size={18} className="absolute right-3.5 top-3 text-slate-400" />
                      <input
                        value={courtSearchQuery}
                        onChange={(e) => setCourtSearchQuery(e.target.value)}
                        placeholder="بحث فوري فائق الدقة: بالاسم، الإمارة، المحكمة..."
                        className={\`\${inputCls} pr-10 pl-10 text-sm font-medium\`}
                      />
                      {courtSearchQuery && (
                        <button
                          onClick={() => setCourtSearchQuery("")}
                          className="absolute left-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="مسح نص البحث"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {showFilters.courts && (
                    <div className="p-5 border-t border-slate-100 space-y-4 bg-white animate-in fade-in duration-200">`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    
    const endTarget = `                  {/* حالة عدم وجود نتائج (Empty State) */}`;
    const endReplacement = `                  </div>
                  )}
                  {/* حالة عدم وجود نتائج (Empty State) */}`;
                  
    code = code.replace(endTarget, endReplacement);
    
    // Close on changing filters
    // Emirate
    code = code.replace(/setCourtEmirateFilter\(em\.id\);/g, "setCourtEmirateFilter(em.id); closeFilters('courts');");
    
    // Category
    code = code.replace(/setCourtCategoryFilter\(opt\.id\);/g, "setCourtCategoryFilter(opt.id); closeFilters('courts');");
    
    // Branch
    code = code.replace(/setCourtBranchFilter\(branch\);/g, "setCourtBranchFilter(branch); closeFilters('courts');");
    code = code.replace(/setCourtBranchFilter\("الكل"\);/g, "setCourtBranchFilter(\"الكل\"); closeFilters('courts');");
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Courts filters updated!");
} else {
    console.log("Courts target not found!");
}
