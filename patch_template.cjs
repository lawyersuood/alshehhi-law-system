const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add State
const stateTarget = `  const [delegationLogs, setDelegationLogs] = useState<DelegationLog[]>(() => loadStorage("firm_delegation_logs", []));`;
const stateAdd = `  const defaultDelegationTemplate = \`أنا الموقع أدناه، المحامي / [المحامي_الموكل]، بصفتي وكيلاً قانونياً في الدعوى رقم ([رقم_الدعوى]) المنظورة أمام ([المحكمة]).\\n\\nأُنيب زميلي المحامي الأستاذ / [المحامي_المناب] المقيد برقم ([رقم_القيد]).\\n\\nوذلك للحضور والترافع والمرافعة وتقديم المذكرات والمستندات واتخاذ كافة الإجراءات القانونية اللازمة في الجلسات المتعلقة بالدعوى المذكورة أعلاه، نيابة عني وباسمي، وله حق التوكيل والصلح والإقرار بما يخدم مصلحة الموكل وفقاً للأصول المهنية.\`;
  const [delegationTemplate, setDelegationTemplate] = useState<string>(() => loadStorage("firm_delegation_template", defaultDelegationTemplate));`;
if (!code.includes('defaultDelegationTemplate')) {
  code = code.replace(stateTarget, stateTarget + '\n' + stateAdd);
}

// 2. Add Button to header
const headerTarget = `                       <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">توليد إنابة قضائية</h2>
                            <p className="text-xs text-slate-500 mt-1">إنشاء مستند إنابة رسمي معتمد مع ختم وتوقيع المكتب</p>
                          </div>
                       </div>`;
const headerAdd = `                       <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">توليد إنابة قضائية</h2>
                            <p className="text-xs text-slate-500 mt-1">إنشاء مستند إنابة رسمي معتمد مع ختم وتوقيع المكتب</p>
                          </div>
                          {currentUser.role === "admin" && (
                            <button 
                              onClick={() => {
                                setForm({ template: delegationTemplate });
                                setModal("delegation-template");
                              }}
                              className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              تعديل صيغة الإنابة
                            </button>
                          )}
                       </div>`;
if (!code.includes('تعديل صيغة الإنابة')) {
  code = code.replace(headerTarget, headerAdd);
}

// 3. Add modal and update preview text
const modalTarget = `               <div className="space-y-6 text-lg text-justify leading-relaxed">
                 <p>
                   أنا الموقع أدناه، المحامي / <strong>{form.delegatingLawyer || currentUser.name}</strong>، بصفتي وكيلاً قانونياً في الدعوى رقم (<strong>{cases.find(c => c.id === form.delegationCaseId)?.number || ".........."}</strong>) 
                   المنظورة أمام (<strong>{cases.find(c => c.id === form.delegationCaseId)?.court || "المحكمة الموقرة"}</strong>).
                 </p>
                 <p>
                   أُنيب زميلي المحامي الأستاذ / <strong>{colleagues.find(c => c.id === form.delegatedColleagueId)?.name || ".........."}</strong> 
                   المقيد برقم (<strong>{colleagues.find(c => c.id === form.delegatedColleagueId)?.federalId || ".........."}</strong>).
                 </p>
                 <p>
                   وذلك للحضور والترافع والمرافعة وتقديم المذكرات والمستندات واتخاذ كافة الإجراءات القانونية اللازمة في الجلسات المتعلقة بالدعوى المذكورة أعلاه، 
                   نيابة عني وباسمي، وله حق التوكيل والصلح والإقرار بما يخدم مصلحة الموكل وفقاً للأصول المهنية.
                 </p>
                 <p className="mt-8 text-left">
                   <strong>تاريخ الإصدار:</strong> {form.delegationDate || new Date().toISOString().split('T')[0]}
                 </p>`;

const modalReplace = `               <div className="space-y-6 text-lg text-justify leading-relaxed">
                 {(() => {
                   let text = delegationTemplate;
                   const delegatingLawyer = form.delegatingLawyer || currentUser.name || "..........";
                   const cRef = cases.find(c => c.id === form.delegationCaseId);
                   const caseNumber = cRef?.number || "..........";
                   const courtName = cRef?.court || "المحكمة الموقرة";
                   const colRef = colleagues.find(c => c.id === form.delegatedColleagueId);
                   const colName = colRef?.name || "..........";
                   const colId = colRef?.federalId || "..........";

                   text = text.replace(/\\[المحامي_الموكل\\]/g, \`<strong>\${delegatingLawyer}</strong>\`);
                   text = text.replace(/\\[رقم_الدعوى\\]/g, \`<strong>\${caseNumber}</strong>\`);
                   text = text.replace(/\\[المحكمة\\]/g, \`<strong>\${courtName}</strong>\`);
                   text = text.replace(/\\[المحامي_المناب\\]/g, \`<strong>\${colName}</strong>\`);
                   text = text.replace(/\\[رقم_القيد\\]/g, \`<strong>\${colId}</strong>\`);

                   return text.split('\\n').map((line, i) => (
                     <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
                   ));
                 })()}
                 <p className="mt-8 text-left">
                   <strong>تاريخ الإصدار:</strong> {form.delegationDate || new Date().toISOString().split('T')[0]}
                 </p>`;

if (code.includes('أنا الموقع أدناه')) {
  code = code.replace(modalTarget, modalReplace);
}

const templateModalStr = `
      {modal === "delegation-template" && (
        <Modal title="تعديل صيغة الإنابة الافتراضية" onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-2">
              يمكنك استخدام المتغيرات التالية وسيتم استبدالها تلقائياً عند توليد الإنابة:
              <br/>
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded ml-1">[المحامي_الموكل]</code>
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded ml-1">[رقم_الدعوى]</code>
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded ml-1">[المحكمة]</code>
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded ml-1">[المحامي_المناب]</code>
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded ml-1">[رقم_القيد]</code>
            </p>
            <textarea
              value={form.template || ""}
              onChange={f("template")}
              className="w-full h-64 p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm leading-loose focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
              dir="rtl"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setModal(null)}
                className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  setDelegationTemplate(form.template);
                  saveStorage("firm_delegation_template", form.template);
                  alert("تم حفظ صيغة الإنابة الجديدة بنجاح!");
                  setModal(null);
                }}
                className="px-5 py-2.5 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-700 transition"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </Modal>
      )}
`;

const modAppStr = `      {modal === "delegation-preview" && (`;
if (!code.includes('modal === "delegation-template"')) {
  code = code.replace(modAppStr, templateModalStr + '\n' + modAppStr);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Template logic added successfully.");
