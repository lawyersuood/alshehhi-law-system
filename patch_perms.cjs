const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const permAdd = `  manageOfficialAssets?: boolean; // إدارة الأصول الرسمية`;
if (!code.includes('manageOfficialAssets?: boolean;')) {
  code = code.replace(/signOfficialDocs\?: boolean;[^\n]*/, match => match + '\n' + permAdd);
}

const adminAdd = `      manageOfficialAssets: true,`;
if (!code.includes('manageOfficialAssets: true')) {
  code = code.replace(/signOfficialDocs: true,[^\n]*/, match => match + '\n' + adminAdd);
}

const labelAdd = `  manageOfficialAssets: { label: "إدارة الأصول الرسمية", desc: "صلاحية إدارة ورفع الترويسة والختم والتوقيعات" },`;
if (!code.includes('إدارة الأصول الرسمية')) {
  code = code.replace(/signOfficialDocs: \{[^\n]*/, match => match + '\n' + labelAdd);
}

const moduleAdd = `        "manageOfficialAssets",`;
if (!code.includes('"manageOfficialAssets"')) {
  code = code.replace(/"signOfficialDocs",[^\n]*/, match => match + '\n' + moduleAdd);
}

fs.writeFileSync('src/App.tsx', code);
