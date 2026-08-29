const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix AuditLogEntry interface
const oldInterfaceActionType = `actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS";`;
const newInterfaceActionType = `actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS" | "VIEW" | "SECURITY_ALERT" | "EXPORT";`;
if (code.includes(oldInterfaceActionType)) {
  code = code.replace(oldInterfaceActionType, newInterfaceActionType);
}

const jsPdfTarget = `jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }`;
const jsPdfReplace = `jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }`;
code = code.replace(jsPdfTarget, jsPdfReplace);

fs.writeFileSync('src/App.tsx', code);
