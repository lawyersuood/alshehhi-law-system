const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{userPerms.manageCases ? (
                      <div className="flex items-center gap-2">
                        <div className="space-y-0.5">`;

const replacement = `{userPerms.manageCases ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setForm({ ...selectedCase });
                            setModal("case");
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition"
                        >
                          <Edit2 size={14} />
                          تعديل القضية
                        </button>
                        <div className="space-y-0.5">`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Edit button added to Case view.");
} else {
    console.log("Target not found!");
}
