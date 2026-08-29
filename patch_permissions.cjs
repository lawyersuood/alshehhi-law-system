const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const rolePermsTarget = `  manageUsers?: boolean;         // 18. إدارة المستخدمين والصلاحيات`;
const rolePermsAdd = `  signOfficialDocs?: boolean;    // اعتماد وتوقيع المستندات الرسمية`;

if (code.includes(rolePermsTarget) && !code.includes('signOfficialDocs?: boolean')) {
  code = code.replace(rolePermsTarget, rolePermsTarget + '\n' + rolePermsAdd);
}

const defaultAdminPermsTarget = `      manageUsers: true,`;
const defaultAdminPermsAdd = `      signOfficialDocs: true,`;

// We have multiple roles, we want to add signOfficialDocs to admin
if (code.includes(defaultAdminPermsTarget) && !code.includes('signOfficialDocs: true,')) {
  code = code.replace(defaultAdminPermsTarget, defaultAdminPermsTarget + '\n' + defaultAdminPermsAdd);
}

const permLabelsTarget = `  manageUsers: { label: "18. المستخدمون والصلاحيات", desc: "إضافة وتعديل واعتماد حسابات الموظفين وتخصيص الأدوار" },`;
const permLabelsAdd = `  signOfficialDocs: { label: "اعتماد وتوقيع المستندات الرسمية", desc: "صلاحية ختم وتوقيع الإنابات والمستندات الرسمية من النظام" },`;

if (code.includes(permLabelsTarget) && !code.includes('اعتماد وتوقيع المستندات الرسمية')) {
  code = code.replace(permLabelsTarget, permLabelsTarget + '\n' + permLabelsAdd);
}

const permModulesTarget = `        "exportData",`;
const permModulesAdd = `        "signOfficialDocs",`;

if (code.includes(permModulesTarget) && !code.includes('"signOfficialDocs"')) {
  code = code.replace(permModulesTarget, permModulesTarget + '\n' + permModulesAdd);
}

fs.writeFileSync('src/App.tsx', code);
