const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/pt-\[22%\]/g, 'pt-[35%]');

fs.writeFileSync('src/App.tsx', code);
