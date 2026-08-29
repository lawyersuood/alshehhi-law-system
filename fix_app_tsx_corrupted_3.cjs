const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `phone = cl ? x`;
const startIndex = code.indexOf(searchStr);

if (startIndex !== -1) {
    console.log("Found corrupted string start:", startIndex);
    
    // Find the next `    } else if (type === `
    let blockEnd = code.indexOf('    } else if (type === ', startIndex);
    if (blockEnd === -1) {
        blockEnd = code.indexOf('    } else {', startIndex);
    }
    
    let blockStart = code.lastIndexOf('    } else if (type === "تذكير قسط فاتورة" && data) {', startIndex);
    
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
`;
        code = code.substring(0, blockStart) + replacement + code.substring(blockEnd);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Fixed corrupted block in App.tsx!");
    } else {
        console.log("Could not find block boundaries!");
        console.log("blockStart:", blockStart, "blockEnd:", blockEnd);
    }
} else {
    console.log("Corrupted string start not found. Let's try finding `name = cl ? cl.name : \"الموكل\";` inside the invoice block.");
}
