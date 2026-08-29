const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const target = `  manageUsers: { label: "18. المستخدمون والصلاحيات", desc: "إضافة وتعديل واعتماد حسابات الموظفين وتخصيص الأدوار" },`;
const add = `  signOfficialDocs: { label: "اعتماد وتوقيع المستندات الرسمية", desc: "صلاحية ختم وتوقيع الإنابات والمستندات الرسمية من النظام" },`;
code = code.replace(target, target + '\n' + add);
fs.writeFileSync('src/App.tsx', code);
