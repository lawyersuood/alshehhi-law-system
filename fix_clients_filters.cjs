const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{/* شريط الفرز والتصنيف + البحث السريع */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">`;

const replacement = `{/* شريط الفرز والتصنيف + البحث السريع */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={() => toggleFilters('clients')} className={\`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition \${showFilters.clients ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}\`}>
                        <Filter size={14} /> تصفية متقدمة
                      </button>
                    </div>
                    <div className="relative w-full sm:w-80">
                      <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
                      <input type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="بحث بالاسم، الرخصة، الهاتف..." className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-8 py-2 text-xs focus:border-amber-500 focus:bg-white focus:outline-none" />
                      {clientSearch && (<button onClick={() => setClientSearch("")} className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>)}
                    </div>
                  </div>
                  
                  {showFilters.clients && (
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">تصنيف الموكل</label>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    // Replace the end part of the clients filter block
    const endTarget = `                  <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="بحث بالاسم، الرخصة، الهاتف..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-8 py-1.5 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
                    />
                    {clientSearch && (
                      <button onClick={() => setClientSearch("")} className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>`;
                
    const endReplacement = `                  </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">إمارة الموكل</label>
                        <select value={clientEmirateFilter} onChange={(e) => { setClientEmirateFilter(e.target.value); closeFilters('clients'); }} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs">
                          <option value="الكل">جميع الإمارات</option>
                          <option value="أبوظبي">أبوظبي</option>
                          <option value="دبي">دبي</option>
                          <option value="الشارقة">الشارقة</option>
                          <option value="عجمان">عجمان</option>
                          <option value="أم القيوين">أم القيوين</option>
                          <option value="رأس الخيمة">رأس الخيمة</option>
                          <option value="الفجيرة">الفجيرة</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>`;
                
    code = code.replace(endTarget, endReplacement);
    
    // Auto-close on category change
    code = code.replace(/onClick=\{\(\) => setClientCategoryFilter\(cat\.id\)\}/g, "onClick={() => { setClientCategoryFilter(cat.id); closeFilters('clients'); }}");
    
    // Add filtering logic for emirate
    const filterLogicTarget = `const matchesSearch =`;
    const filterLogicReplacement = `const matchesEmirate = clientEmirateFilter === "الكل" || c.emirate === clientEmirateFilter;
                    const matchesSearch =`;
    code = code.replace(filterLogicTarget, filterLogicReplacement);
    
    const returnTarget = `return matchesCategory && matchesSearch;`;
    const returnReplacement = `return matchesCategory && matchesEmirate && matchesSearch;`;
    code = code.replace(returnTarget, returnReplacement);

    fs.writeFileSync('src/App.tsx', code);
    console.log("Clients filters updated successfully!");
} else {
    console.log("Clients filters block not found!");
}
