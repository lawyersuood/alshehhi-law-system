const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const exportLogic = `                       // Custom multi-page PDF generation with html-to-image
                       try {
                         const htmlToImage = await import('html-to-image');
                         const { jsPDF } = await import('jspdf');
                         
                         // 1. Hide DOM letterheads so they don't get baked into the image
                         const domLetterheads = el.querySelectorAll('.absolute.inset-0.z-0');
                         domLetterheads.forEach(l => l.style.display = 'none');
                         
                         // 2. Make DOM transparent
                         const originalBg = el.style.backgroundColor;
                         el.style.backgroundColor = 'transparent';
                         el.classList.remove('bg-white');
                         
                         // 3. Capture transparent image
                         const dataUrl = await htmlToImage.toPng(el, { 
                           pixelRatio: 2,
                           backgroundColor: 'rgba(255, 255, 255, 0)' // transparent
                         });
                         
                         // 4. Restore DOM
                         domLetterheads.forEach(l => l.style.display = 'block');
                         el.style.backgroundColor = originalBg;
                         el.classList.add('bg-white');
                         
                         // Create a temporary image to get dimensions
                         const img = new Image();
                         img.src = dataUrl;
                         await new Promise(resolve => { img.onload = resolve; });
                         
                         const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
                         
                         const pdfWidth = pdf.internal.pageSize.getWidth();
                         const pdfHeight = pdf.internal.pageSize.getHeight();
                         const canvasWidth = img.width;
                         const canvasHeight = img.height;
                         
                         const pageHeightInPixels = (canvasWidth / pdfWidth) * pdfHeight;
                         let yOffset = 0;
                         
                         while (yOffset < canvasHeight) {
                           if (yOffset > 0) pdf.addPage();
                           
                           // Draw white background first
                           pdf.setFillColor(255, 255, 255);
                           pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
                           
                           if (firmLetterhead) {
                             pdf.addImage(firmLetterhead, 'PNG', 0, 0, pdfWidth, pdfHeight);
                           }
                           
                           // Create a canvas slice for the current page
                           const sliceCanvas = document.createElement('canvas');
                           sliceCanvas.width = canvasWidth;
                           sliceCanvas.height = Math.min(pageHeightInPixels, canvasHeight - yOffset);
                           const ctx = sliceCanvas.getContext('2d');
                           if (ctx) {
                             ctx.drawImage(img, 0, -yOffset);
                           }
                           const sliceDataUrl = sliceCanvas.toDataURL('image/png');
                           
                           const scaledHeight = (sliceCanvas.height * pdfWidth) / canvasWidth;
                           pdf.addImage(sliceDataUrl, 'PNG', 0, 0, pdfWidth, scaledHeight);
                           
                           yOffset += pageHeightInPixels;
                         }
                         
                         pdf.save(\`مستند_\${Date.now()}.pdf\`);
                       } catch (err) {
                         console.error("PDF gen failed:", err);
                         alert("حدث خطأ أثناء استخراج ملف الـ PDF. جرب الطباعة العادية.");
                         window.print();
                       }`;

const oldMemoExportRegex = /\/\/ Custom multi-page PDF generation with html-to-image[\s\S]*?window\.print\(\);\n\s*\}/g;

code = code.replace(oldMemoExportRegex, exportLogic);

// Wait, that regex matches ALL occurrences! Both memo and delegation will be replaced?
// Wait, the delegation export didn't have "// Custom multi-page PDF generation with html-to-image". Let's check delegation export.
fs.writeFileSync('src/App.tsx', code);
