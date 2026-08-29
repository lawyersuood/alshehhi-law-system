const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onChange=\{\(e\) => setCourtCategoryFilter\(e\.target\.value\)\}/g, "onChange={(e) => { setCourtCategoryFilter(e.target.value); closeFilters('courts'); }}");
code = code.replace(/onClick=\{\(\) => setCourtCategoryFilter\(cat\.id\)\}/g, "onClick={() => { setCourtCategoryFilter(cat.id); closeFilters('courts'); }}");
code = code.replace(/onClick=\{\(\) => setCourtCategoryFilter\("الكل"\)\}/g, "onClick={() => { setCourtCategoryFilter('الكل'); closeFilters('courts'); }}");

fs.writeFileSync('src/App.tsx', code);
