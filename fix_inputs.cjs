const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace <input onChange={f("something")} 
// with <input value={form.something || ""} onChange={f("something")}
code = code.replace(/<input\s+onChange=\{f\("([^"]+)"\)\}/g, '<input value={form.$1 || ""} onChange={f("$1")}');
code = code.replace(/<input\s+type="number"\s+step="[^"]+"\s+onChange=\{f\("([^"]+)"\)\}/g, '<input type="number" value={form.$1 || ""} onChange={f("$1")}');
code = code.replace(/<input\s+type="number"\s+onChange=\{f\("([^"]+)"\)\}/g, '<input type="number" value={form.$1 || ""} onChange={f("$1")}');
code = code.replace(/<input\s+type="date"\s+onChange=\{f\("([^"]+)"\)\}/g, '<input type="date" value={form.$1 || ""} onChange={f("$1")}');
code = code.replace(/<textarea\s+onChange=\{f\("([^"]+)"\)\}/g, '<textarea value={form.$1 || ""} onChange={f("$1")}');
code = code.replace(/<select\s+onChange=\{f\("([^"]+)"\)\}/g, '<select value={form.$1 || ""} onChange={f("$1")}');

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced missing values.");
