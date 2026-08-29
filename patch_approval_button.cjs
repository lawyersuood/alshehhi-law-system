const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetOldBtn = `                         <button 
                           onClick={() => {
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
                             
                             setForm({ ...form, isApproved: true, approvedBy: currentUser.name, serialNo: newLog.serialNo });
                             setModal("delegation-preview");
                           }}
                           className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-700 transition"
                         >
                           اعتماد الإنابة وإصدار السجل
                         </button>`;

const newBtn = `                         {checkPerm("signOfficialDocs") ? (
                           <button 
                             onClick={() => {
                               if (!form.delegatedColleagueId) { alert("الرجاء اختيار الزميل المناب أولاً."); return; }
                               
                               const colleague = colleagues.find((c) => c.id === form.delegatedColleagueId);
                               const caseNo = form.caseNo || "غير محدد";
                               
                               const newLog: DelegationLog = {
                                 id: Date.now(),
                                 serialNo: "DLG-" + Date.now().toString().slice(-6),
                                 timestamp: new Date().toLocaleString("ar-AE"),
                                 caseNo: caseNo,
                                 delegatedLawyer: colleague ? colleague.name : form.delegatedColleagueId,
                                 generatedBy: currentUser.name
                               };
                               const newLogs = [newLog, ...delegationLogs];
                               setDelegationLogs(newLogs);
                               saveStorage("firm_delegation_logs", newLogs);
                               logAuditAction("CREATE", "الحقيبة الخاصة", "اعتماد مستند إنابة", \`تم اعتماد إنابة للزميل \${newLog.delegatedLawyer} في القضية \${caseNo}\`, newLog.id);
                               
                               setForm({ ...form, isApproved: true, approvedBy: currentUser.name, serialNo: newLog.serialNo });
                               setModal("delegation-preview");
                             }}
                             className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-700 transition flex items-center gap-2"
                           >
                             <FileSignature size={16} /> اعتماد وتوقيع الإنابة
                           </button>
                         ) : (
                           <button 
                             onClick={() => alert("عذراً، صلاحية (اعتماد وتوقيع المستندات الرسمية) مطلوبة لختم وتوقيع الإنابة. يمكنك فقط تجهيز المسودة ومعاينتها.")}
                             className="bg-slate-300 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed flex items-center gap-2"
                           >
                             <Lock size={16} /> اعتماد وتوقيع الإنابة
                           </button>
                         )}`;

if (code.includes('if (!checkPerm("specialPortfolio", "اعتماد الإنابات")) return;')) {
  code = code.replace(targetOldBtn, newBtn);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Button patched.");
}
