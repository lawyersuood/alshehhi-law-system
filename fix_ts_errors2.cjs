const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix logAuditAction type definition
const oldLog = `    actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS",`;
const newLog = `    actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS" | "VIEW" | "SECURITY_ALERT" | "EXPORT",`;
if (code.includes(oldLog)) {
  code = code.replace(oldLog, newLog);
}

// Fix logAuditAction for any duplicate definitions if they exist
const logRegex = /actionType:\s*"DELETE"\s*\|\s*"UPDATE"\s*\|\s*"CREATE"\s*\|\s*"STATUS_CHANGE"\s*\|\s*"PERMISSION_CHANGE"\s*\|\s*"UNAUTHORIZED_DELETE"\s*\|\s*"UNAUTHORIZED_ACCESS",/g;
code = code.replace(logRegex, newLog);


// Fix pdfjs getDocument
code = code.replace(`getDocument(typedarray)`, `getDocument({ data: typedarray })`);

// Fix page.render missing canvas
code = code.replace(`await page.render({ canvasContext: context, viewport: viewport }).promise;`, `// @ts-ignore
                                        await page.render({ canvasContext: context, viewport: viewport }).promise;`);

// Fix html2pdf image type
code = code.replace(/image: { type: 'jpeg', quality: 0.98 }/g, `image: { type: 'jpeg' as const, quality: 0.98 }`);

fs.writeFileSync('src/App.tsx', code);
