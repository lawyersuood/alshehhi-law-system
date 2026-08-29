const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const filterUIRegex = /<select\s*value=\{rollCourtFilter\}[\s\S]*?<\/select>\s*<\/div>/;
const filterUIReplacement = `<select
                            value={rollCourtFilter}
                            onChange={(e) => { setRollCourtFilter(e.target.value); closeFilters('hearings'); }}
                            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                          >
                            <option value="الكل">جميع المحاكم واللجان</option>
                            {COURTS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">الإمارة</label>
                          <select
                            value={hearingEmirateFilter}
                            onChange={(e) => { setHearingEmirateFilter(e.target.value); closeFilters('hearings'); }}
                            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                          >
                            <option value="الكل">جميع الإمارات</option>
                            {["أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((em) => (
                              <option key={em} value={em}>{em}</option>
                            ))}
                          </select>
                        </div>`;

if (code.match(filterUIRegex)) {
    code = code.replace(filterUIRegex, filterUIReplacement);
    
    // Add logic to hearing filter
    code = code.replace(/const matchCourt = rollCourtFilter === "الكل" \|\| \(cs && cs\.court === rollCourtFilter\);/g, 
      'const matchCourt = rollCourtFilter === "الكل" || (cs && cs.court === rollCourtFilter);\n                              const matchEmirate = hearingEmirateFilter === "الكل" || (cs && cs.emirate === hearingEmirateFilter);');
      
    code = code.replace(/return matchDate && matchCourt;/g, "return matchDate && matchCourt && matchEmirate;");
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed hearings emirate filter");
} else {
    console.log("Hearings Regex not matched");
}
