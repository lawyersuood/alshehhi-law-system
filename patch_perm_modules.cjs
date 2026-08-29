const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newModule = `  { id: "manageOfficialAssets", label: "الأصول الرسمية", desc: "إدارة ورفع الترويسة والختم وتوقيعات المحامين", category: "الإدارة والامتثال", navTabIds: ["official_assets"] },`;
if (!code.includes('navTabIds: ["official_assets"]')) {
  code = code.replace(/navTabIds: \["users"\] \},/g, match => match + '\n' + newModule);
}

fs.writeFileSync('src/App.tsx', code);
