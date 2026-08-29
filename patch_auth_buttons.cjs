const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix memo signing button
code = code.replace(/\{!isSigned && hasTabPermission\(currentUser, "official_assets"\) && \(/g, 
  '{!isSigned && (currentUser.permissions?.signOfficialDocs || currentUser.roleKey === "admin") && (');

// 2. Fix delegation signing button
code = code.replace(/\{!isSigned && hasTabPermission\(currentUser, "official_assets"\) && \(/g, 
  '{!isSigned && (currentUser.permissions?.signOfficialDocs || currentUser.roleKey === "admin") && (');

// Wait, I need to check where the delegation signing button is. Is there an "اعتماد وتوقيع" button in delegation?
// Let's check if the delegation has one.
