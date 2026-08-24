const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix the broken task section
const brokenTaskSection = `                                  {/* تفاصيل القضية والمكلف */}
                                                 {/* فلتر الإمارات (تصميم دليل المحاكم) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-2">
                      {[
                        { id: "الكل", name: "جميع الإمارات", icon: "🌍" },
                        { id: "أبوظبي", name: "أبوظبي", icon: "🏢" },
                        { id: "دبي", name: "دبي", icon: "🌆" },
                        { id: "الشارقة", name: "الشارقة", icon: "🏛️" },
                        { id: "عجمان", name: "عجمان", icon: "🌴" },
                        { id: "رأس الخيمة", name: "رأس الخيمة", icon: "⛰️" },
                        { id: "أم القيوين", name: "أم القيوين", icon: "⛵" },
                        { id: "الفجيرة", name: "الفجيرة", icon: "🌊" },
                      ].map((em) => {
                        const count = em.id === "الكل" ? cases.length : (caseStatsBreakdown.emirateMap[em.id] || 0);
                        const isSelected = caseEmirateFilter === em.id;
                        return (
                          <button
                            key={em.id}
                            onClick={() => setCaseEmirateFilter(em.id)}
                            className={\`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border text-center cursor-pointer \${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-amber-500/50"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300 shadow-2xs"
                            }\`}
                          >
                            <span className="text-base">{em.icon}</span>
                            <span className="leading-tight truncate w-full">{em.name}</span>
                            <span className={\`text-[10px] font-mono px-1.5 py-0.2 rounded-full \${isSelected ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-100 text-slate-600"}\`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* شريط توزيع الموكلين والتخصصات القضائية */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                        <span className="font-bold text-slate-800 mb-2 flex items-center justify-between">               setNotifyModal({`;

const correctTaskSection = `                                  {/* تفاصيل القضية والمكلف */}
                                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                                    {relatedCase && (
                                      <div className="flex items-center gap-1.5 text-slate-500">
                                        <Briefcase size={13} className="text-amber-600 shrink-0" />
                                        <span className="truncate">{relatedCase.number}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                      <User size={13} className="text-slate-400 shrink-0" />
                                      <span>المكلف: <strong className="text-slate-800">{t.assignee}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                {/* الإجراءات السريعة للمهمة */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                  <button
                                    onClick={() => {
                                      if (!checkPerm("manageTasks", "إنجاز مهمة")) return;
                                      setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: true } : x));
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                                    title="تحديد المهمة كمنجزة فوراً"
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>تم الإنجاز</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const userObj = users.find(u => u.name === t.assignee);
                                      const phone = userObj?.phone || "";
                                      const email = userObj?.email || "";
                                      const msg = \`مرحباً \${t.assignee}،\\nتنبيه عاجل من نظام المكتب:\\nالمهمة: "\${t.title}"\\nموعد الاستحقاق: \${fmtDate(t.due)} (أقل من 24 ساعة).\\nيرجى المتابعة والإنجاز.\`;
                                      setNotifyModal({`;

if (code.includes(brokenTaskSection)) {
  code = code.replace(brokenTaskSection, correctTaskSection);
  console.log("Restored task section successfully!");
} else {
  console.log("Broken task section not found. Maybe it's already restored?");
}

// 2. Now properly replace the cases emirates filter section!
const oldEmiratesSection = `                    {/* شريط توزيع الإمارات والمحاكم وتصنيف الموكلين */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                        <span className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Building2 size={13} className="text-amber-600" /> توزيع القضايا حسب الإمارات:
                          </span>
                          {caseEmirateFilter !== "الكل" && (
                            <button onClick={() => setCaseEmirateFilter("الكل")} className="text-[10px] text-amber-700 font-bold hover:underline">
                              إلغاء التحديد
                            </button>
                          )}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {uniqueEmirates.map((em) => {
                            const count = caseStatsBreakdown.emirateMap[em] || 0;
                            if (count === 0) return null;
                            const isSelected = caseEmirateFilter === em;
                            return (
                              <button
                                key={em}
                                onClick={() => setCaseEmirateFilter(isSelected ? "الكل" : em)}
                                className={\`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 \${
                                  isSelected
                                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                                }\`}
                              >
                                <span>{em}</span>
                                <span className={\`px-1.5 py-0.2 rounded-full text-[10px] font-bold \${isSelected ? "bg-white text-amber-900" : "bg-amber-100 text-amber-900"}\`}>
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>`;

const newEmiratesSection = `                    {/* فلتر الإمارات (تصميم دليل المحاكم) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-2">
                      {[
                        { id: "الكل", name: "جميع الإمارات", icon: "🌍" },
                        { id: "أبوظبي", name: "أبوظبي", icon: "🏢" },
                        { id: "دبي", name: "دبي", icon: "🌆" },
                        { id: "الشارقة", name: "الشارقة", icon: "🏛️" },
                        { id: "عجمان", name: "عجمان", icon: "🌴" },
                        { id: "رأس الخيمة", name: "رأس الخيمة", icon: "⛰️" },
                        { id: "أم القيوين", name: "أم القيوين", icon: "⛵" },
                        { id: "الفجيرة", name: "الفجيرة", icon: "🌊" },
                      ].map((em) => {
                        const count = em.id === "الكل" ? cases.length : (caseStatsBreakdown.emirateMap[em.id] || 0);
                        const isSelected = caseEmirateFilter === em.id;
                        return (
                          <button
                            key={em.id}
                            onClick={() => setCaseEmirateFilter(em.id)}
                            className={\`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border text-center cursor-pointer \${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-amber-500/50"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300 shadow-2xs"
                            }\`}
                          >
                            <span className="text-base">{em.icon}</span>
                            <span className="leading-tight truncate w-full">{em.name}</span>
                            <span className={\`text-[10px] font-mono px-1.5 py-0.2 rounded-full \${isSelected ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-100 text-slate-600"}\`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* شريط توزيع المحاكم وتصنيف الموكلين */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-3 text-xs">`;

if (code.includes(oldEmiratesSection)) {
  code = code.replace(oldEmiratesSection, newEmiratesSection);
  console.log("Replaced emirates filter successfully!");
} else {
  console.log("Could not find the old emirates section!");
}

fs.writeFileSync('src/App.tsx', code);
