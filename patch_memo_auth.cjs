const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/currentUser\.signature && hasTabPermission\(currentUser, "official_assets"\) && isSigned/g, 
  'currentUser.signature && (currentUser.permissions?.signOfficialDocs || currentUser.roleKey === "admin") && isSigned');

code = code.replace(/\{!isSigned && hasTabPermission\(currentUser, "official_assets"\) && \(/g, 
  '{!isSigned && (currentUser.permissions?.signOfficialDocs || currentUser.roleKey === "admin") && (');

fs.writeFileSync('src/App.tsx', code);
