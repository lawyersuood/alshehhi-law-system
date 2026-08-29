const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Force PNG only for image upload
code = code.replace(/accept="image\/\*,application\/pdf"/g, 'accept="image/png,application/pdf"');
code = code.replace(/accept="image\/\*"/g, 'accept="image/png"'); // for stamp or signature if it had image/*

// 2. Change canvas to PNG for PDF to image conversion
code = code.replace(/canvas\.toDataURL\('image\/jpeg', 0\.95\)/g, "canvas.toDataURL('image/png')");

// 3. Update html2pdf image type to png to avoid jpeg compression artifacts on text
code = code.replace(/image: { type: 'jpeg' as const, quality: 0\.98 }/g, "image: { type: 'png' as const }");

// 4. Implement top/bottom safe zones in the delegation document
const docContainerRegex = /<div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-10 px-8">/g;
code = code.replace(docContainerRegex, '<div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-[22%] pb-[15%] px-12">');

fs.writeFileSync('src/App.tsx', code);
