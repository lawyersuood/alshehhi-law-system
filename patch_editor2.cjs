const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Revert outer div
code = code.replace(
  /id="memo-doc" \n              className=\{`bg-white shadow-sm rounded-xl min-h-\[800px\] font-sans relative overflow-hidden text-right leading-loose text-black transition-all duration-200 outline-none focus:ring-2 focus:ring-amber-500 \$\{isSecureBlurred \? 'blur-xl grayscale' : ''\}`\}\n              contentEditable=\{!isSecureBlurred\}\n              suppressContentEditableWarning=\{true\}/g,
  `id="memo-doc" \n              className={\`bg-white shadow-sm rounded-xl min-h-[800px] font-sans relative overflow-hidden text-right leading-loose text-black select-none transition-all duration-200 \${isSecureBlurred ? 'blur-xl grayscale' : ''}\`}`
);

code = code.replace(
  /id="delegation-doc" \n              className=\{`bg-white p-8 sm:p-12 shadow-sm rounded-xl min-h-\[800px\] font-sans relative overflow-hidden text-right leading-loose text-black transition-all duration-200 outline-none focus:ring-2 focus:ring-amber-500 \$\{isSecureBlurred \? 'blur-xl grayscale' : ''\}`\}\n              contentEditable=\{!isSecureBlurred\}\n              suppressContentEditableWarning=\{true\}/g,
  `id="delegation-doc" \n              className={\`bg-white p-8 sm:p-12 shadow-sm rounded-xl min-h-[800px] font-sans relative overflow-hidden text-right leading-loose text-black select-none transition-all duration-200 \${isSecureBlurred ? 'blur-xl grayscale' : ''}\`}`
);

// Apply to inner div for memo
code = code.replace(
  /<div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-\[35%\] pb-\[15%\] px-12" style=\{\{ whiteSpace: 'pre-wrap' \}\}>/g,
  `<div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-[35%] pb-[15%] px-12 outline-none focus:ring-2 focus:ring-amber-500 rounded-xl" style={{ whiteSpace: 'pre-wrap' }} contentEditable={!isSecureBlurred} suppressContentEditableWarning={true}>`
);

// Apply to inner div for delegation
code = code.replace(
  /<div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-\[35%\] pb-\[15%\] px-12">/g,
  `<div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-[35%] pb-[15%] px-12 outline-none focus:ring-2 focus:ring-amber-500 rounded-xl" contentEditable={!isSecureBlurred} suppressContentEditableWarning={true}>`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched inner editor");
