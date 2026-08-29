const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const filterUIRegex = /\{\/\* فلتر المحكمة \*\/\}\s*<select[\s\S]*?<\/select>/;
const filterUIReplacement = `{/* فلتر المحكمة */}
                      <select
                        value={precedentCourtFilter}
                        onChange={(e) => { setPrecedentCourtFilter(e.target.value); closeFilters('precedents'); }}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-stone-50"
                      >
                        <option value="الكل">جميع المحاكم</option>
                        <option value="المحكمة الاتحادية العليا">المحكمة الاتحادية العليا</option>
                        <option value="محكمة تمييز دبي">محكمة تمييز دبي</option>
                        <option value="محكمة نقض أبوظبي">محكمة نقض أبوظبي</option>
                        <option value="محكمة تمييز رأس الخيمة">محكمة تمييز رأس الخيمة</option>
                      </select>
                      {/* فلتر الإمارة */}
                      <select
                        value={precedentEmirateFilter}
                        onChange={(e) => { setPrecedentEmirateFilter(e.target.value); closeFilters('precedents'); }}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-stone-50"
                      >
                        <option value="الكل">جميع الإمارات</option>
                        {["أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((em) => (
                          <option key={em} value={em}>{em}</option>
                        ))}
                      </select>`;

if (code.match(filterUIRegex)) {
    code = code.replace(filterUIRegex, filterUIReplacement);
    
    // Add logic to precedent filter. Wait, what is the precedent Emirate filter logic?
    // Let's see how precedents are filtered now.
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed precedents emirate filter UI");
} else {
    console.log("Precedents Regex not matched");
}
