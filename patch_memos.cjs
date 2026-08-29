const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add setSpecialPortfolioTab("memos") button
const newTabButton = `
                  <button
                    onClick={() => setSpecialPortfolioTab("memos")}
                    className={\`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 \${specialPortfolioTab === "memos" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}\`}
                  >
                    <FileText size={16} />
                    مذكرات وخطابات
                  </button>
`;
if (!code.includes('setSpecialPortfolioTab("memos")')) {
  code = code.replace(/نظام الإنابات والتفويض\s*<\/button>/, match => match + newTabButton);
}

// Ensure FileText icon is imported
if (!code.includes('FileText')) {
  code = code.replace(/import \{/, 'import { FileText,');
}

fs.writeFileSync('src/App.tsx', code);
