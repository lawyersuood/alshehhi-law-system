const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const letterheadBlock = `
               {/* Background Letterhead (if exists) */}
               {firmLetterhead && (
                 <div className="absolute inset-0 z-0">
                   <img src={firmLetterhead} alt="Letterhead" className="w-full h-full object-cover" />
                 </div>
               )}
`;

code = code.replace(
  /               \{\/\* Default Text Header \(if no letterhead\) \*\/\}\n               \{!firmLetterhead && \(/g,
  letterheadBlock + '\n               {/* Default Text Header (if no letterhead) */}\n               {!firmLetterhead && ('
);

fs.writeFileSync('src/App.tsx', code);
