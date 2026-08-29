const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/select-none /g, "");

fs.writeFileSync('src/App.tsx', code);
