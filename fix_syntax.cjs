const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onClick=\{\(\) => setSelectedRollDate\(addDays\(1\)\); (closeFilters\('[a-z]+'\);)\}/g, "onClick={() => { setSelectedRollDate(addDays(1)); $1 }}");
code = code.replace(/onClick=\{\(\) => setSelectedRollDate\(''\); (closeFilters\('[a-z]+'\);)\}/g, "onClick={() => { setSelectedRollDate(''); $1 }}");
// also check e.target.value missing braces
code = code.replace(/onChange=\{\(e\) => setSelectedRollDate\(e.target.value\); (closeFilters\('[a-z]+'\);)\}/g, "onChange={(e) => { setSelectedRollDate(e.target.value); $1 }}");
code = code.replace(/onChange=\{\(e\) => setRollCourtFilter\(e.target.value\); (closeFilters\('[a-z]+'\);)\}/g, "onChange={(e) => { setRollCourtFilter(e.target.value); $1 }}");
code = code.replace(/onChange=\{\(e\) => setPrecedentCourtFilter\(e.target.value\); (closeFilters\('[a-z]+'\);)\}/g, "onChange={(e) => { setPrecedentCourtFilter(e.target.value); $1 }}");
code = code.replace(/onChange=\{\(e\) => setPrecedentCategoryFilter\(e.target.value\); (closeFilters\('[a-z]+'\);)\}/g, "onChange={(e) => { setPrecedentCategoryFilter(e.target.value); $1 }}");
code = code.replace(/onChange=\{\(e\) => setPrecedentYearFilter\(e.target.value\); (closeFilters\('[a-z]+'\);)\}/g, "onChange={(e) => { setPrecedentYearFilter(e.target.value); $1 }}");


fs.writeFileSync('src/App.tsx', code);
console.log("Syntax fixed");
