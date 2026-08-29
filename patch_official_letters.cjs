const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
const importStr = `import OfficialLetterComposer from "./OfficialLetterComposer";\n`;
if (!code.includes('import OfficialLetterComposer')) {
    code = importStr + code;
}

// Find docSubTab and add the new tab
// Look for where docSubTab is declared or used
// Wait, `const [docSubTab, setDocSubTab] = useState<"archive" | "generator" | "letterhead">("archive");`
const stateDecl = `const [docSubTab, setDocSubTab] = useState<"archive" | "generator" | "letterhead">("archive");`;
const newStateDecl = `const [docSubTab, setDocSubTab] = useState<"archive" | "generator" | "letterhead" | "officialLetters">("archive");`;
code = code.replace(stateDecl, newStateDecl);

// Also look for the actual string literal type if it's there
code = code.replace(/useState<\s*"archive"\s*\|\s*"generator"\s*\|\s*"letterhead"\s*>\s*\(/g, 'useState<"archive" | "generator" | "letterhead" | "officialLetters">(');

// Add the tab button
const tabButtons = `<button
                    onClick={() => setDocSubTab("archive")}
                    className={\`pb-3 px-1 text-sm font-bold border-b-2 transition \${
                      docSubTab === "archive"
                        ? "border-[#0c4a47] text-[#0c4a47]"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }\`}
                  >
                    أرشيف المستندات
                  </button>`;

const newTabButton = `<button
                    onClick={() => setDocSubTab("archive")}
                    className={\`pb-3 px-1 text-sm font-bold border-b-2 transition \${
                      docSubTab === "archive"
                        ? "border-[#0c4a47] text-[#0c4a47]"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }\`}
                  >
                    أرشيف المستندات
                  </button>
                  <button
                    onClick={() => setDocSubTab("officialLetters")}
                    className={\`pb-3 px-1 text-sm font-bold border-b-2 transition \${
                      docSubTab === "officialLetters"
                        ? "border-[#0c4a47] text-[#0c4a47]"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }\`}
                  >
                    الخطابات الرسمية
                  </button>`;

code = code.replace(tabButtons, newTabButton);

// Or if the button is slightly different:
if (!code.includes('setDocSubTab("officialLetters")')) {
    // Let's do a regex replacement for the tab bar
    const tabRegex = /(<button[^>]+onClick={\(\)\s*=>\s*setDocSubTab\("archive"\)}[^>]*>[\s\S]*?<\/button>)/;
    code = code.replace(tabRegex, `$1\n                  <button
                    onClick={() => setDocSubTab("officialLetters")}
                    className={\`pb-3 px-1 text-sm font-bold border-b-2 transition \${
                      docSubTab === "officialLetters"
                        ? "border-[#0c4a47] text-[#0c4a47]"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }\`}
                  >
                    الخطابات الرسمية
                  </button>`);
}


// Add the component rendering
const renderRegex = /(docSubTab === "generator" && \([\s\S]*?}\)\s*})/;
// It might be easier to find `docSubTab === "letterhead" && (` or just find the end of the `docSubTab` renderings.
// Let's look for `docSubTab === "letterhead" ? (` or `docSubTab === "letterhead" && (`

if (!code.includes('<OfficialLetterComposer')) {
    const generatorMatch = code.match(/\{docSubTab === "generator" && \([\s\S]*?\}\s*\)\}/);
    if (generatorMatch) {
       // Append it after generator or letterhead. Let's find letterhead.
       const lhMatch = code.match(/\{docSubTab === "letterhead" && \([\s\S]*?\}\s*\)\}/);
       if (lhMatch) {
           code = code.replace(lhMatch[0], `${lhMatch[0]}\n              {docSubTab === "officialLetters" && (
                <OfficialLetterComposer defaultSignName={currentUser.name} defaultSignTitle={currentUser.roleTitle} />
              )}`);
       } else {
           code = code.replace(generatorMatch[0], `${generatorMatch[0]}\n              {docSubTab === "officialLetters" && (
                <OfficialLetterComposer defaultSignName={currentUser.name} defaultSignTitle={currentUser.roleTitle} />
              )}`);
       }
    } else {
        // Fallback replacement strategy
        const renderArchive = code.indexOf('{docSubTab === "archive" && (');
        if (renderArchive !== -1) {
            // Find the parent div
            code = code.replace('{docSubTab === "archive" && (', `{docSubTab === "officialLetters" && (
                <OfficialLetterComposer defaultSignName={currentUser?.name} defaultSignTitle={currentUser?.roleTitle} />
              )}\n              {docSubTab === "archive" && (`);
        }
    }
}

fs.writeFileSync('src/App.tsx', code);
