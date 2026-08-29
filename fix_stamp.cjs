const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update the "Approve & Stamp" button to set isApproved to true and open modal
const oldBtn = `                           onClick={() => {
                             if (!checkPerm("specialPortfolio", "اعتماد الإنابات")) return;
                             if (!form.delegatedColleagueId) { alert("الرجاء اختيار الزميل المناب أولاً."); return; }
                             
                             const colleague = colleagues.find((c) => c.id === form.delegatedColleagueId);
                             const caseRef = cases.find((c) => c.id === form.delegationCaseId);
                             
                             const newLog: DelegationLog = {
                               id: Date.now(),
                               serialNo: "DLG-" + Date.now().toString().slice(-6),
                               timestamp: new Date().toLocaleString("ar-AE"),
                               caseNo: caseRef ? caseRef.number : "غير محدد",
                               delegatedLawyer: colleague ? colleague.name : "غير محدد",
                               generatedBy: currentUser.name
                             };
                             const newLogs = [newLog, ...delegationLogs];
                             setDelegationLogs(newLogs);
                             saveStorage("firm_delegation_logs", newLogs);
                             logAuditAction("CREATE", "الحقيبة الخاصة", "إصدار إنابة", \\\`تم إصدار واعتماد إنابة للزميل \\\${newLog.delegatedLawyer} في القضية \\\${newLog.caseNo}\\\`, newLog.id);
                             alert("تم اعتماد المستند وحفظه في السجل بنجاح!");
                           }}`;

const newBtn = `                           onClick={() => {
                             if (!checkPerm("specialPortfolio", "اعتماد الإنابات")) return;
                             if (!form.delegatedColleagueId) { alert("الرجاء اختيار الزميل المناب أولاً."); return; }
                             
                             const colleague = colleagues.find((c) => c.id === form.delegatedColleagueId);
                             const caseRef = cases.find((c) => c.id === form.delegationCaseId);
                             
                             const newLog: DelegationLog = {
                               id: Date.now(),
                               serialNo: "DLG-" + Date.now().toString().slice(-6),
                               timestamp: new Date().toLocaleString("ar-AE"),
                               caseNo: caseRef ? caseRef.number : "غير محدد",
                               delegatedLawyer: colleague ? colleague.name : "غير محدد",
                               generatedBy: currentUser.name
                             };
                             const newLogs = [newLog, ...delegationLogs];
                             setDelegationLogs(newLogs);
                             saveStorage("firm_delegation_logs", newLogs);
                             logAuditAction("CREATE", "الحقيبة الخاصة", "إصدار إنابة", \\\`تم إصدار واعتماد إنابة للزميل \\\${newLog.delegatedLawyer} في القضية \\\${newLog.caseNo}\\\`, newLog.id);
                             setForm({ ...form, isApproved: true, approvedBy: currentUser.name, serialNo: newLog.serialNo });
                             setModal("delegation-preview");
                           }}`;

code = code.replace(oldBtn, newBtn);

// Update the preview button to reset isApproved
const oldPreviewBtn = `                           onClick={() => {
                             if (!form.delegatedColleagueId) { alert("الرجاء اختيار الزميل المناب أولاً."); return; }
                             setModal("delegation-preview");
                           }}`;

const newPreviewBtn = `                           onClick={() => {
                             if (!form.delegatedColleagueId) { alert("الرجاء اختيار الزميل المناب أولاً."); return; }
                             setForm({ ...form, isApproved: false });
                             setModal("delegation-preview");
                           }}`;

code = code.replace(oldPreviewBtn, newPreviewBtn);

// Update the stamp in modal
const oldStamp = `                   <div className="text-center opacity-60">
                     {/* Placeholder for stamp */}
                     <div className="w-32 h-32 rounded-full border-4 border-dashed border-red-500/40 mx-auto flex items-center justify-center rotate-[-15deg]">
                       <span className="text-red-500/60 font-black text-lg">الختم الرسمي<br/>للمكتب</span>
                     </div>
                   </div>`;

const newStamp = `                   <div className="text-center">
                     {form.isApproved ? (
                       <div className="w-32 h-32 rounded-full border-4 border-double border-red-700 mx-auto flex items-center justify-center rotate-[-15deg] opacity-90 relative">
                         <div className="absolute inset-2 border-2 border-red-700 rounded-full"></div>
                         <div className="text-red-700 font-black text-lg leading-tight">
                           معتمد وموثق<br/>
                           <span className="text-sm">{form.approvedBy || currentUser.name}</span><br/>
                           <span className="text-[10px] font-mono">{form.serialNo}</span>
                         </div>
                       </div>
                     ) : (
                       <div className="w-32 h-32 rounded-full border-4 border-dashed border-red-500/20 mx-auto flex items-center justify-center rotate-[-15deg] opacity-60">
                         <span className="text-red-500/40 font-bold text-sm">مسودة غير معتمدة<br/>(بدون ختم)</span>
                       </div>
                     )}
                   </div>`;

code = code.replace(oldStamp, newStamp);

fs.writeFileSync('src/App.tsx', code);
console.log("Stamp logic updated.");
