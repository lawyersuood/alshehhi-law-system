const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{/* شريط البحث والتصفية */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
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
                      <select`;
                      
const replacement = `{/* شريط البحث والتصفية */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center gap-3 p-4 bg-slate-50/50">
                    <button onClick={() => toggleFilters('precedents')} className={\`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition \${showFilters.precedents ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}\`}>
                        <Filter size={14} /> تصفية السوابق
                    </button>
                    <div className="relative w-full">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={precedentSearch}
                        onChange={(e) => setPrecedentSearch(e.target.value)}
                        placeholder="البحث بالكلمة المفتاحية، نص القاعدة، رقم الطعن..."
                        className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-4 text-sm focus:border-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                  {showFilters.precedents && (
                  <div className="p-4 border-t border-slate-100 bg-white animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* فلتر المحكمة */}
                      <select`;

if (code.includes(target.replace(/\s+/g, ' '))) {
    // using regex for whitespaces
    console.log("Matched with replaced whitespaces... doing regex replace");
}

const blockRegex = /\{\/\* شريط البحث والتصفية \*\/\}\s*<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">\s*<div className="flex flex-wrap items-center justify-between gap-3">\s*<div className="flex flex-1 items-center gap-2 min-w-\[280px\]">\s*<div className="relative flex-1">\s*<Search className="absolute right-3 top-1\/2 -translate-y-1\/2 text-slate-400" size=\{16\} \/>\s*<input\s*type="text"\s*value=\{precedentSearch\}\s*onChange=\{\(e\) => setPrecedentSearch\(e\.target\.value\)\}\s*placeholder="البحث بالكلمة المفتاحية، نص القاعدة، رقم الطعن\.\.\."\s*className="w-full rounded-xl border border-slate-200 py-2\.5 pr-9 pl-4 text-sm focus:border-amber-500 focus:outline-none"\s*\/>\s*<\/div>\s*<\/div>\s*<div className="flex flex-wrap items-center gap-2">\s*\{\/\* فلتر المحكمة \*\/\}\s*<select/;

if (code.match(blockRegex)) {
    code = code.replace(blockRegex, replacement);
    
    // Auto-close on change
    code = code.replace(/setPrecedentCourtFilter\(e\.target\.value\)/g, "setPrecedentCourtFilter(e.target.value); closeFilters('precedents');");
    code = code.replace(/setPrecedentCategoryFilter\(e\.target\.value\)/g, "setPrecedentCategoryFilter(e.target.value); closeFilters('precedents');");
    code = code.replace(/setPrecedentYearFilter\(e\.target\.value\)/g, "setPrecedentYearFilter(e.target.value); closeFilters('precedents');");
    
    const endBlockRegex = /<\/select>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* مكتبة العرض \*\/\}/;
    const endReplacement = `</select>
                    </div>
                  </div>
                  )}
                </div>
                {/* مكتبة العرض */}`;
                
    code = code.replace(endBlockRegex, endReplacement);
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Precedents updated");
} else {
    console.log("Precedents target not found");
}

