const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{/* كارت أدوات وتصفية رول الجلسات */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <Filter size={16} className="text-amber-600" /> تصفية وتحديد تاريخ الرول المطلوبة
                        </h3>
                        <span className="text-xs text-slate-500">اختر تاريخاً أو محكمة معينة لفلترة جدول الجلسات</span>
                      </div>`;
                      
const replacement = `{/* كارت أدوات وتصفية رول الجلسات */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleFilters('hearings')} className={\`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition \${showFilters.hearings ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}\`}>
                            <Filter size={14} /> تصفية متقدمة
                          </button>
                          <div className="text-xs text-slate-500 hidden sm:block">
                            اختر تاريخاً أو محكمة معينة لفلترة جدول الجلسات
                          </div>
                        </div>
                      </div>
                      
                      {showFilters.hearings && (
                        <div className="p-4 bg-amber-50/50 space-y-4 border-b border-slate-100 animate-in fade-in duration-200">`;
                        
if (code.includes(target)) {
    code = code.replace(target, replacement);
    
    // Add closeFilters on change
    code = code.replace(/setRollCourtFilter\(e\.target\.value\)/g, "setRollCourtFilter(e.target.value); closeFilters('hearings');");
    code = code.replace(/setSelectedRollDate\(e\.target\.value\)/g, "setSelectedRollDate(e.target.value); closeFilters('hearings');");
    
    // End the block properly
    const endTarget = `                            جلسات اليوم
                          </button>
                          <button
                            onClick={() => setSelectedRollDate(addDays(1))}
                            className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition \${selectedRollDate === addDays(1) ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100"}\`}
                          >
                            جلسات غداً
                          </button>
                          <button
                            onClick={() => setSelectedRollDate(addDays(2))}
                            className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition \${selectedRollDate === addDays(2) ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100"}\`}
                          >
                            بعد غد
                          </button>
                        </div>
                      </div>
                    </div>`;
                    
    const endReplacement = `                            جلسات اليوم
                          </button>
                          <button
                            onClick={() => { setSelectedRollDate(addDays(1)); closeFilters('hearings'); }}
                            className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition \${selectedRollDate === addDays(1) ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100"}\`}
                          >
                            جلسات غداً
                          </button>
                          <button
                            onClick={() => { setSelectedRollDate(addDays(2)); closeFilters('hearings'); }}
                            className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition \${selectedRollDate === addDays(2) ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100"}\`}
                          >
                            بعد غد
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>`;
                  
    code = code.replace(endTarget, endReplacement);
    code = code.replace(/setSelectedRollDate\(todayISO\(\)\)/g, "setSelectedRollDate(todayISO()); closeFilters('hearings');");
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Hearings filters updated!");
} else {
    console.log("Hearings filters target not found!");
}
