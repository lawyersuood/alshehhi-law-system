const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetNav = `    { id: "users", label: "المستخدمون والصلاحيات", icon: Lock, category: "الإدارة والامتثال" },`;
const addNav = `    { id: "official_assets", label: "الأصول الرسمية", icon: Stamp, category: "الإدارة والامتثال" },`;

if (code.includes(targetNav) && !code.includes('official_assets')) {
  code = code.replace(targetNav, targetNav + '\n' + addNav);
}

fs.writeFileSync('src/App.tsx', code);
