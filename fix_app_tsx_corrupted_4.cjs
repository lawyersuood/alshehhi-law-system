const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `phone = cl ? x`;
const startIndex = code.indexOf(searchStr);

if (startIndex !== -1) {
    let blockStart = code.lastIndexOf('    } else if (type === "تذكير قسط فاتورة" && data) {', startIndex);
    
    // If we can't find `    } else if (type === ` or `    } else {`, maybe it's the last block of the if/else chain? Let's find the closing brace of the main function or block.
    // Looking at the code structure, this is probably inside a function like `prepareNotification(type, data)` or similar.
    // Let's just find `return { name, phone, email, relatedRef, subject, message };` or similar.
    let blockEnd = code.indexOf('    return {', startIndex);
    if (blockEnd === -1) {
        blockEnd = code.indexOf('    //', startIndex); // maybe there are comments?
    }
    if (blockEnd === -1) {
        // Just find the end of this block which should be `    }` followed by another `  }` or similar.
        // Actually, let's just find the next known good code after the corrupted chunk.
        // What is after this block?
        // Wait, looking at the previous grep of the corrupted block:
        // `  return { name, phone, email, relatedRef, subject, message };` ?
        blockEnd = code.indexOf('return {', startIndex);
    }
    
    if (blockEnd === -1) {
        // Let's search for `  };` or `}`. 
        // We will just find the first ASCII character sequence that looks like valid code after the corrupted block.
        // Let's use regex to find the first occurrence of `    if (` or `    return` after startIndex + 5000 (corrupted string is long).
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
        // ensure we replace properly
        code = code.substring(0, blockStart) + replacement + code.substring(blockEnd);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Fixed corrupted block!");
    } else {
        console.log("Still couldn't find block boundaries. blockStart:", blockStart, "blockEnd:", blockEnd);
    }
}
