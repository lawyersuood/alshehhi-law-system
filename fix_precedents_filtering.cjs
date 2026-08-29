const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const matchesYear = precedentYearFilter === "الكل" \|\| String\(p\.ruling_year\) === precedentYearFilter;/;
const replacement = `const matchesYear = precedentYearFilter === "الكل" || String(p.ruling_year) === precedentYearFilter;
      const courtStr = (p.court_name || "").toLowerCase();
      let pEmirate = "أخرى";
      if (courtStr.includes("دبي")) pEmirate = "دبي";
      else if (courtStr.includes("أبوظبي") || courtStr.includes("الاتحادية")) pEmirate = "أبوظبي";
      else if (courtStr.includes("الشارقة")) pEmirate = "الشارقة";
      else if (courtStr.includes("عجمان")) pEmirate = "عجمان";
      else if (courtStr.includes("الفجيرة")) pEmirate = "الفجيرة";
      else if (courtStr.includes("رأس الخيمة")) pEmirate = "رأس الخيمة";
      else if (courtStr.includes("أم القيوين")) pEmirate = "أم القيوين";
      const matchesEmirate = precedentEmirateFilter === "الكل" || pEmirate === precedentEmirateFilter;`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    code = code.replace(/return matchesCourt && matchesCategory && matchesYear && matchesQuery;/g, "return matchesCourt && matchesCategory && matchesYear && matchesEmirate && matchesQuery;");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed precedents filtering logic");
} else {
    console.log("Regex not matched for precedents logic");
}
