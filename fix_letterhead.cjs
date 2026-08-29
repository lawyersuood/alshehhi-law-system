const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const doubleLetterheadRegex = /\{\/\* Background Letterhead \(if exists\) \*\/\}\s*\{firmLetterhead && \(\s*<div className="absolute inset-0 z-0">\s*<img src=\{firmLetterhead\} alt="Letterhead" className="w-full h-full object-cover" \/>\s*<\/div>\s*\)\}\s*\{\/\* Background Letterhead \(if exists\) \*\/\}\s*\{firmLetterhead && \(\s*<div className="absolute inset-0 z-0">\s*<img src=\{firmLetterhead\} alt="Letterhead" className="w-full h-full object-cover" \/>\s*<\/div>\s*\)\}/g;

code = code.replace(doubleLetterheadRegex, `               {/* Background Letterhead (if exists) */}
               {firmLetterhead && (
                 <div className="absolute inset-0 z-0">
                   <img src={firmLetterhead} alt="Letterhead" className="w-full h-full object-contain object-top" />
                 </div>
               )}`);

// Also change the single ones to use object-contain object-top so it doesn't crop or stretch weirdly.
code = code.replace(/className="w-full h-full object-cover"/g, 'className="w-full h-full object-contain object-top"');

// And increase the padding to pt-[45%]
code = code.replace(/pt-\[35\%\]/g, 'pt-[45%]');

fs.writeFileSync('src/App.tsx', code);
