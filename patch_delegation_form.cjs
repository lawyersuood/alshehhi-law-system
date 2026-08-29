const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFormStart = `                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">القضية المرتبطة (اختياري)</label>
                            <select 
                              value={form.delegationCaseId || ""} 
                              onChange={(e) => {
                                const csId = Number(e.target.value);
                                setForm({ ...form, delegationCaseId: csId });
                              }}`;

const targetFormEnd = `                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">تاريخ الإنابة</label>
                            <input 
                              type="date" 
                              value={form.delegationDate || new Date().toISOString().split('T')[0]}
                              onChange={(e) => setForm({ ...form, delegationDate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                       </div>`;

const newForm = `                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">القضية المرتبطة (لتعبئة البيانات تلقائياً)</label>
                            <select 
                              value={form.delegationCaseId || ""} 
                              onChange={(e) => {
                                const csId = Number(e.target.value);
                                const selectedCase = cases.find(c => c.id === csId);
                                if (selectedCase) {
                                  const client = clients.find(c => c.id === selectedCase.clientId);
                                  setForm({ 
                                    ...form, 
                                    delegationCaseId: csId,
                                    court: selectedCase.court || "محكمة دبي التجارية الابتدائية",
                                    clientName: client ? client.name : "",
                                    opponentName: selectedCase.opponent || "النيابة العامة",
                                    caseNo: selectedCase.number
                                  });
                                } else {
                                  setForm({ ...form, delegationCaseId: csId });
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                            >
                              <option value="">إدخال بيانات الإنابة يدوياً...</option>
                              {cases.map((c) => <option key={c.id} value={c.id}>{c.number} - {c.court}</option>)}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">الزميل المناب</label>
                            <select 
                              value={form.delegatedColleagueId || ""}
                              onChange={(e) => setForm({ ...form, delegatedColleagueId: Number(e.target.value) })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                            >
                              <option value="">اختر الزميل...</option>
                              {colleagues.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">المحكمة الموقرة</label>
                            <input 
                              type="text" 
                              value={form.court || "محكمة دبي التجارية الابتدائية"}
                              onChange={(e) => setForm({ ...form, court: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">رقم القضية</label>
                            <input 
                              type="text" 
                              value={form.caseNo || ""}
                              onChange={(e) => setForm({ ...form, caseNo: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">الموكل</label>
                            <input 
                              type="text" 
                              value={form.clientName || ""}
                              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">الصفة</label>
                            <input 
                              type="text" 
                              value={form.clientCapacity || "المدعي"}
                              onChange={(e) => setForm({ ...form, clientCapacity: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">ضـــد (الخصم)</label>
                            <input 
                              type="text" 
                              value={form.opponentName || "النيابة العامة"}
                              onChange={(e) => setForm({ ...form, opponentName: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">المحامي الموكل (الاسم)</label>
                            <input 
                              type="text" 
                              value={form.delegatingLawyer || currentUser.name}
                              onChange={(e) => setForm({ ...form, delegatingLawyer: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">رقم القيد للمحامي الموكل</label>
                            <input 
                              type="text" 
                              value={form.delegatingLawyerId || "1754"}
                              onChange={(e) => setForm({ ...form, delegatingLawyerId: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">تاريخ الجلسة المناب لها</label>
                            <input 
                              type="date" 
                              value={form.hearingDate || ""}
                              onChange={(e) => setForm({ ...form, hearingDate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">تاريخ التحرير (تاريخ الإنابة)</label>
                            <input 
                              type="date" 
                              value={form.delegationDate || new Date().toISOString().split('T')[0]}
                              onChange={(e) => setForm({ ...form, delegationDate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                       </div>`;

const fullTarget = code.substring(code.indexOf(targetFormStart), code.indexOf(targetFormEnd) + targetFormEnd.length);

if (code.includes(targetFormStart)) {
  code = code.replace(fullTarget, newForm);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Form updated!");
} else {
  console.log("Could not find target block.");
}
