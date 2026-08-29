const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const states = `  const [taskEmirateFilter, setTaskEmirateFilter] = useState("الكل");
  const [hearingEmirateFilter, setHearingEmirateFilter] = useState("الكل");
  const [precedentEmirateFilter, setPrecedentEmirateFilter] = useState("الكل");
  const [invoiceEmirateFilter, setInvoiceEmirateFilter] = useState("الكل");
  const [poaEmirateFilter, setPoaEmirateFilter] = useState("الكل");
  const [kycEmirateFilter, setKycEmirateFilter] = useState("الكل");
`;

code = code.replace(/const \[showAdvancedFilters, setShowAdvancedFilters\] = useState\(false\);/, states + '\n  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);');

fs.writeFileSync('src/App.tsx', code);
