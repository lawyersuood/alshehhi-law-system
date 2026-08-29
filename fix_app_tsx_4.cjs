const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const wrongEnding = `               </button>\n            </div>\n          </div>\n        </Modal>\n        );\n      })()}`;

const correctEnding = `               </button>\n               </div>\n            </div>\n          </div>\n        </Modal>\n        );\n      })()}`;

code = code.replace(wrongEnding, correctEnding);

fs.writeFileSync('src/App.tsx', code);
