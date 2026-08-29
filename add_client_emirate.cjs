const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = 'const [clientCategoryFilter, setClientCategoryFilter] = useState<string>("الكل");';
const insertion = `  const [clientCategoryFilter, setClientCategoryFilter] = useState<string>("الكل");
  const [clientEmirateFilter, setClientEmirateFilter] = useState<string>("الكل");`;

if (code.includes(anchor) && !code.includes('clientEmirateFilter')) {
    code = code.replace(anchor, insertion);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Added clientEmirateFilter state.");
}
