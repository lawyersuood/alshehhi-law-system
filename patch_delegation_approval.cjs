const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `                             logAuditAction("CREATE", "الحقيبة الخاصة", "إصدار إنابة", \`تم إصدار واعتماد إنابة للزميل \${newLog.delegatedLawyer} في القضية \${newLog.caseNo}\`, newLog.id);
                             alert("تم اعتماد المستند وحفظه في السجل بنجاح!");`;

const newLogic = `                             logAuditAction("CREATE", "الحقيبة الخاصة", "إصدار إنابة", \`تم إصدار واعتماد إنابة للزميل \${newLog.delegatedLawyer} في القضية \${newLog.caseNo}\`, newLog.id);
                             
                             setForm({ 
                               ...form,
                               isApproved: true,
                               approvedBy: currentUser.name,
                               serialNo: newLog.serialNo,
                               delegationDate: newLog.timestamp.split(',')[0]
                             });
                             setModal("delegation-preview");`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', code);
