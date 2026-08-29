const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = 'const [q, setQ] = useState("");';
const insertion = `  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState<Record<string, boolean>>({});
  const toggleFilters = (tabKey: string) => setShowFilters(prev => ({ ...prev, [tabKey]: !prev[tabKey] }));
  const closeFilters = (tabKey: string) => setShowFilters(prev => ({ ...prev, [tabKey]: false }));`;

if (code.includes(anchor) && !code.includes('const [showFilters, setShowFilters]')) {
    code = code.replace(anchor, insertion);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Added showFilters state.");
} else {
    console.log("showFilters already exists or anchor not found.");
}
