const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The upload buttons inside "أصول المكتب الموحدة" shouldn't be visible to those who don't have manageOfficialAssets
code = code.replace(/\{checkPerm\("signOfficialDocs", "توقيع المستندات الرسمية"\) && \(/g, 
  '{(currentUser.permissions?.manageOfficialAssets || currentUser.roleKey === "admin") && (');

fs.writeFileSync('src/App.tsx', code);
