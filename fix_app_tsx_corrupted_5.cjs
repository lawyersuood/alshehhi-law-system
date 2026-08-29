const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `phone = cl ? x`;
const startIndex = code.indexOf(searchStr);

if (startIndex !== -1) {
    let blockStart = code.lastIndexOf('    } else if (type === "تذكير قسط فاتورة" && data) {', startIndex);
    
    // Find the next known good code after the corrupted block.
    // Let's use regex to find the first sequence of standard ASCII code, e.g. `    return { name,` or `  return ` or `    if (` or something like `  };`.
    let blockEnd = code.indexOf('    return { name, phone, email, relatedRef, subject, message };', startIndex);
    
    if (blockEnd === -1) {
        // Find next valid function or block
        // E.g., `  const sendNotification = `
        const match = code.substring(startIndex).match(/\n\s*return\s*\{\s*name,\s*phone/);
        if (match) {
            blockEnd = startIndex + match.index;
        } else {
             const match2 = code.substring(startIndex).match(/\n\s*const\s+[a-zA-Z0-9_]+\s*=\s*\(/);
             if (match2) {
                 blockEnd = startIndex + match2.index;
             } else {
                 const match3 = code.substring(startIndex).match(/\n\s*return\s*/);
                 if (match3) {
                     blockEnd = startIndex + match3.index;
                 }
             }
        }
    }

    if (blockStart !== -1 && blockEnd !== -1) {
        console.log("Replacing block from", blockStart, "to", blockEnd);
        const replacement = `    } else if (type === "تذكير قسط فاتورة" && data) {
      const inst = data;
      const inv = invoices.find((i) => i.id === inst.invoiceId);
      const cl = inv ? clients.find((cli) => cli.id === inv.clientId) : null;
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = inv ? \`فاتورة \${inv.invoiceNumber}\` : \`المالية\`;
      subject = \`تذكير ودي: استحاق قسط أتعاب محاماة\`;
      message = \`الموكل الفاضل / \${name}\\nتحية طيبة وبعد،\\nنود تذكيركم بلطف باستحقاق القسط رقم (\${inst.title}) البالغ قيمته (\${inst.amount} درهم) وذلك بتاريخ (\${fmtDate(inst.dueDate)}).\\nيرجى التفضل بإجراء التحويل البنكي وتزويدنا بإيصال السداد لتحديث السجلات.\\nشاكرين لكم حسن تعاونكم الدائم،\\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية\`;
    }
`;
        code = code.substring(0, blockStart) + replacement + code.substring(blockEnd);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Fixed corrupted block!");
    } else {
        console.log("Still couldn't find block boundaries. blockStart:", blockStart, "blockEnd:", blockEnd);
    }
}
