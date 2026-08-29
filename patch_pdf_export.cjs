const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const watermarkTarget = `<div className="absolute inset-0 pointer-events-none flex flex-wrap justify-center items-center opacity-[0.03] z-0 overflow-hidden" style={{ gap: '4rem', transform: 'rotate(-30deg) scale(1.5)' }}>`;
const watermarkReplace = `<div id="watermark-layer" className="absolute inset-0 pointer-events-none flex flex-wrap justify-center items-center opacity-[0.03] z-0 overflow-hidden" style={{ gap: '4rem', transform: 'rotate(-30deg) scale(1.5)' }}>`;

code = code.replace(watermarkTarget, watermarkReplace);

const pdfTarget = `                     const opt = {
                       margin: 0,
                       filename: \`إنابة_قضائية_\${Date.now()}.pdf\`,
                       image: { type: 'jpeg', quality: 0.98 },
                       html2canvas: { scale: 2, useCORS: true },
                       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                     };
                     logAuditAction("EXPORT", "الحقيبة الخاصة", "تصدير مستند", "تم طباعة/تصدير الإنابة بصيغة PDF", 0);
                     html2pdf().set(opt).from(el).save();`;

const pdfReplace = `                     const watermark = el.querySelector('#watermark-layer');
                     if (watermark) (watermark as HTMLElement).style.display = 'none';
                     
                     const opt = {
                       margin: 0,
                       filename: \`إنابة_قضائية_\${Date.now()}.pdf\`,
                       image: { type: 'jpeg', quality: 0.98 },
                       html2canvas: { scale: 2, useCORS: true },
                       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                     };
                     logAuditAction("EXPORT", "الحقيبة الخاصة", "تصدير مستند", "تم طباعة/تصدير الإنابة بصيغة PDF", 0);
                     html2pdf().set(opt).from(el).save().then(() => {
                       if (watermark) (watermark as HTMLElement).style.display = 'flex';
                     });`;

code = code.replace(pdfTarget, pdfReplace);

fs.writeFileSync('src/App.tsx', code);
