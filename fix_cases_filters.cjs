const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the specific grid block
const blockRegex = /\{\/\* شريط البحث والفلترة السريعة \*\/\}\s*<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-amber-50\/50 p-4 rounded-2xl border border-amber-200\/80 shadow-xs">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const replacement = `{/* شريط البحث السريع */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="relative w-full">
                    <Search size={15} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="ابحث برقم القضية، الموكل، الخصم، القاضي..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-8 py-2.5 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
                    />
                    {q && (
                      <button onClick={() => setQ("")} className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>`;

if (code.match(blockRegex)) {
    code = code.replace(blockRegex, replacement);
    
    // Inject Judge and Court into the showFilters.cases block
    const advancedTarget = `{showFilters.cases && (
                  <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm space-y-3.5 animate-in fade-in duration-200">`;
                  
    const advancedReplacement = `{showFilters.cases && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs space-y-3.5 animate-in fade-in duration-200">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Scale size={14} className="text-amber-600" /> الدائرة القضائية / القاضي
                        </label>
                        <select
                          value={caseJudgeFilter}
                          onChange={(e) => { setCaseJudgeFilter(e.target.value); closeFilters('cases'); }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
                        >
                          <option value="الكل">🏛️ جميع الدوائر والقضاة ({uniqueJudges.length})</option>
                          {uniqueJudges.map((j) => (
                            <option key={j} value={j}>{j}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Building2 size={14} className="text-amber-600" /> المحكمة المختصة
                        </label>
                        <select
                          value={caseCourtFilter}
                          onChange={(e) => { setCaseCourtFilter(e.target.value); closeFilters('cases'); }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
                        >
                          <option value="الكل">🏢 جميع المحاكم ({uniqueCourts.length})</option>
                          {uniqueCourts.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>`;
                    
    code = code.replace(advancedTarget, advancedReplacement);
    
    // Auto-close on change for other dropdowns
    code = code.replace(/setCaseStageFilter\(e\.target\.value\)/g, "setCaseStageFilter(e.target.value); closeFilters('cases');");
    code = code.replace(/setCaseTypeFilter\(e\.target\.value\)/g, "setCaseTypeFilter(e.target.value); closeFilters('cases');");
    code = code.replace(/setCaseEmirateFilter\(e\.target\.value\)/g, "setCaseEmirateFilter(e.target.value); closeFilters('cases');");
    code = code.replace(/setCaseClientFilter\(e\.target\.value\)/g, "setCaseClientFilter(e.target.value); closeFilters('cases');");
    code = code.replace(/setCaseClientTypeFilter\(e\.target\.value\)/g, "setCaseClientTypeFilter(e.target.value); closeFilters('cases');");
    code = code.replace(/setCaseYearFilter\(e\.target\.value\)/g, "setCaseYearFilter(e.target.value); closeFilters('cases');");
    code = code.replace(/setCaseSortBy\(e\.target\.value as any\)/g, "setCaseSortBy(e.target.value as any); closeFilters('cases');");
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Cases filters updated successfully!");
} else {
    console.log("Cases filters block not found!");
}
