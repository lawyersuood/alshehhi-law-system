const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `        </Modal>\n        );\n      })()}`;
const replacement = `        </Modal>\n        );\n      })())}`;

code = code.replace(search, replacement);

fs.writeFileSync('src/App.tsx', code);
