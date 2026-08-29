const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find the corrupted line block.
// We can see from the error log: `phone = cl ? xksǑ(ݿ`
// Let's find `phone = cl ? ` and the next valid code block which seems to be `email = cl ? cl.email : "";`

const startStr = 'phone = cl ? ';
const endStr = 'email = cl ? cl.email : "";';

const startIndex = code.indexOf('phone = cl ? x');
if (startIndex !== -1) {
    console.log("Found corrupted string start");
    const endIndex = code.indexOf('      email = cl ? cl.email : "";', startIndex);
    if (endIndex !== -1) {
        console.log("Found end of corrupted string");
        
        // Wait, looking at the code, it's inside `} else if (type === "تذكير قسط فاتورة" && data) {`
        // Let's reconstruct this block safely using regex to strip non-ascii or just replace the whole thing.
        
        // Actually, we can just find:
        // `name = cl ? cl.name : "الموكل";`
        // `      phone = cl ? cl.phone : "";`
        // `      email = cl ? cl.email : "";`
        
        // Since we can't type the corrupted text, we can use regex to remove it.
        const beforeCorrupted = code.substring(0, startIndex);
        
        // The corrupted text seems to replace `phone = cl ? cl.phone : "";` and parts of `email = cl ? cl.email : "";` 
        // Wait, the error log shows `phone = cl ? x...`
        
        // Let's replace the whole `} else if (type === "تذكير قسط فاتورة" && data) {` block up to `}`.
        const blockStart = code.lastIndexOf('} else if (type === "تذكير قسط فاتورة" && data) {', startIndex);
        if (blockStart !== -1) {
             const blockEnd = code.indexOf('    } else if (', startIndex);
             if (blockEnd !== -1) {
                 const replacement = `} else if (type === "تذكير قسط فاتورة" && data) {
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
                 console.log("Fixed corrupted block");
             }
        }
    }
}
