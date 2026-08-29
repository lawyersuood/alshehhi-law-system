const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /accept="image\/png,application\/pdf,\.docx,application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document"/, 
  'accept="image/png,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"'
);

// We need to change the label text "رفع صورة" to something that includes word if needed, or just leave it.
// Wait, the label has text `رفع صورة` and maybe we should update it.
// `                           <UploadCloud size={14} /> رفع صورة`
code = code.replace(
  /<UploadCloud size={14} \/> رفع صورة/,
  '<UploadCloud size={14} /> رفع صورة / PDF / Word'
);

fs.writeFileSync('src/App.tsx', code);
