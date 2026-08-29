const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const toolbarHintCode = `
const RichTextToolbar = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 shadow-sm">
    <div className="flex gap-2" dir="ltr">
      <button onClick={() => document.execCommand('bold', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 font-bold" title="عريض">B</button>
      <button onClick={() => document.execCommand('italic', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 italic" title="مائل">I</button>
      <button onClick={() => document.execCommand('underline', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 underline" title="تسطير">U</button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
      <button onClick={() => document.execCommand('justifyRight', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="يمين">R</button>
      <button onClick={() => document.execCommand('justifyCenter', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="توسيط">C</button>
      <button onClick={() => document.execCommand('justifyLeft', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="يسار">L</button>
    </div>
    <div className="text-sm font-bold text-indigo-800 flex items-center gap-2">
      <Edit3 size={16} /> يمكنك التعديل وتنسيق النص مباشرة داخل المستند أدناه
    </div>
  </div>
);
`;

code = code.replace(/const RichTextToolbar = \(\) => \([\s\S]*?<\/div>\n\);\n/, toolbarHintCode);

fs.writeFileSync('src/App.tsx', code);
