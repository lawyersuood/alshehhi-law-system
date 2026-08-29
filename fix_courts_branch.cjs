const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onClick=\{\(\) => setCourtBranchFilter\("الكل"\)\}/g, "onClick={() => { setCourtBranchFilter('الكل'); closeFilters('courts'); }}");
code = code.replace(/onClick=\{\(\) => setCourtBranchFilter\(branch\.id\)\}/g, "onClick={() => { setCourtBranchFilter(branch.id); closeFilters('courts'); }}");

fs.writeFileSync('src/App.tsx', code);
