const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tabPermCheck = `
  if (tabId === "official_assets") {
    return Boolean(user.permissions?.manageOfficialAssets || user.permissions?.signOfficialDocs);
  }
`;

code = code.replace(/  \/\/ تبويب إدارة المستخدمين حصر للمدير أو من لديه صلاحية صريحة/, tabPermCheck + '\n  // تبويب إدارة المستخدمين حصر للمدير أو من لديه صلاحية صريحة');

fs.writeFileSync('src/App.tsx', code);
