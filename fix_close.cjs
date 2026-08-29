const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const closeFilters = \(tabKey: string\) => setShowFilters\(prev => \(\{ \.\.\.prev, \[tabKey\]: false \}\)\);/g, "const closeFilters = (tabKey: string) => { if (tabKey === 'cases') setShowAdvancedFilters(false); setShowFilters(prev => ({ ...prev, [tabKey]: false })); };");

code = code.replace(/onChange=\{\(e\) => setCaseFilter\(e.target.value\)\}/g, "onChange={(e) => { setCaseFilter(e.target.value); closeFilters('cases'); }}");
code = code.replace(/onChange=\{\(e\) => setCaseCourtFilter\(e.target.value\)\}/g, "onChange={(e) => { setCaseCourtFilter(e.target.value); closeFilters('cases'); }}");

fs.writeFileSync('src/App.tsx', code);
