const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const toolbarCode = `
const RichTextToolbar = () => (
  <div className="flex gap-2 p-2 bg-slate-100 border border-slate-200 rounded-xl mb-4 shadow-sm" dir="ltr">
    <button onClick={() => document.execCommand('bold', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 font-bold" title="عريض">B</button>
    <button onClick={() => document.execCommand('italic', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 italic" title="مائل">I</button>
    <button onClick={() => document.execCommand('underline', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 underline" title="تسطير">U</button>
    <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
    <button onClick={() => document.execCommand('justifyRight', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="يمين">R</button>
    <button onClick={() => document.execCommand('justifyCenter', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="توسيط">C</button>
    <button onClick={() => document.execCommand('justifyLeft', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="يسار">L</button>
  </div>
);
`;

if (!code.includes('RichTextToolbar')) {
  code = code.replace(/export default function App\(\) \{/, toolbarCode + '\nexport default function App() {');
}

// Modify delegation-doc
code = code.replace(
  /id="delegation-doc" \n              className=\{`bg-white p-8 sm:p-12 shadow-sm rounded-xl min-h-\[800px\] font-sans relative overflow-hidden text-right leading-loose text-black select-none transition-all duration-200 \$\{isSecureBlurred \? 'blur-xl grayscale' : ''\}`\}/g,
  `id="delegation-doc" \n              className={\`bg-white p-8 sm:p-12 shadow-sm rounded-xl min-h-[800px] font-sans relative overflow-hidden text-right leading-loose text-black transition-all duration-200 outline-none focus:ring-2 focus:ring-amber-500 \${isSecureBlurred ? 'blur-xl grayscale' : ''}\`}\n              contentEditable={!isSecureBlurred}\n              suppressContentEditableWarning={true}`
);

// Inject Toolbar into delegation-preview
code = code.replace(
  /<div className="space-y-4 text-sm relative" id="delegation-doc-container"/g,
  `<RichTextToolbar />\n          <div className="space-y-4 text-sm relative" id="delegation-doc-container"`
);

// Modify memo-doc
code = code.replace(
  /id="memo-doc" \n              className=\{`bg-white shadow-sm rounded-xl min-h-\[800px\] font-sans relative overflow-hidden text-right leading-loose text-black select-none transition-all duration-200 \$\{isSecureBlurred \? 'blur-xl grayscale' : ''\}`\}/g,
  `id="memo-doc" \n              className={\`bg-white shadow-sm rounded-xl min-h-[800px] font-sans relative overflow-hidden text-right leading-loose text-black transition-all duration-200 outline-none focus:ring-2 focus:ring-amber-500 \${isSecureBlurred ? 'blur-xl grayscale' : ''}\`}\n              contentEditable={!isSecureBlurred}\n              suppressContentEditableWarning={true}`
);

// Inject Toolbar into memo-preview
code = code.replace(
  /<div className="space-y-4 text-sm relative" id="memo-doc-container"/g,
  `<RichTextToolbar />\n            <div className="space-y-4 text-sm relative" id="memo-doc-container"`
);

// Fix the select-none alert on right click - we want to allow editing, but maybe they still want protection?
// Actually if they can edit, they need right-click context menu (copy/paste).
// Let's remove onContextMenu={(e) => { e.preventDefault(); alert("النسخ غير مسموح."); }}
code = code.replace(/onContextMenu=\{\(e\) => \{ e\.preventDefault\(\); alert\("النسخ غير مسموح\."\); \}\}/g, "");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched editors");
