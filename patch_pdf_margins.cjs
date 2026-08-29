const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const exportLogicMemo = `                       try {
                         const htmlToImage = await import('html-to-image');
                         const { jsPDF } = await import('jspdf');
                         
                         const domLetterheads = el.querySelectorAll('.absolute.inset-0.z-0');
                         domLetterheads.forEach(l => l.style.display = 'none');
                         
                         const originalBg = el.style.backgroundColor;
                         el.style.backgroundColor = 'transparent';
                         el.classList.remove('bg-white');
                         
                         const textContainer = el.querySelector('.relative.z-10');
                         let origPt = '';
                         let origPb = '';
                         if (textContainer) {
                           origPt = textContainer.style.paddingTop;
                           origPb = textContainer.style.paddingBottom;
                           textContainer.style.paddingTop = '0px';
                           textContainer.style.paddingBottom = '0px';
                         }
                         
                         const dataUrl = await htmlToImage.toPng(el, { 
                           pixelRatio: 2,
                           backgroundColor: 'rgba(255, 255, 255, 0)'
                         });
                         
                         domLetterheads.forEach(l => l.style.display = 'block');
                         el.style.backgroundColor = originalBg;
                         el.classList.add('bg-white');
                         if (textContainer) {
                           textContainer.style.paddingTop = origPt;
                           textContainer.style.paddingBottom = origPb;
                         }
                         
                         const img = new Image();
                         img.src = dataUrl;
                         await new Promise(resolve => { img.onload = resolve; });
                         
                         const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
                         const pdfWidth = pdf.internal.pageSize.getWidth();
                         const pdfHeight = pdf.internal.pageSize.getHeight();
                         
                         const headerMargin = 55;
                         const footerMargin = 40;
                         const safeAreaMm = pdfHeight - headerMargin - footerMargin;
                         
                         const canvasWidth = img.width;
                         const canvasHeight = img.height;
                         
                         const scaleFactor = pdfWidth / canvasWidth;
                         const safeAreaInPixels = safeAreaMm / scaleFactor;
                         
                         let yOffset = 0;
                         
                         while (yOffset < canvasHeight) {
                           if (yOffset > 0) pdf.addPage();
                           
                           pdf.setFillColor(255, 255, 255);
                           pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
                           
                           if (firmLetterhead) {
                             pdf.addImage(firmLetterhead, 'PNG', 0, 0, pdfWidth, pdfHeight);
                           }
                           
                           const sliceHeightPx = Math.min(safeAreaInPixels, canvasHeight - yOffset);
                           
                           const sliceCanvas = document.createElement('canvas');
                           sliceCanvas.width = canvasWidth;
                           sliceCanvas.height = sliceHeightPx;
                           const ctx = sliceCanvas.getContext('2d');
                           if (ctx) {
                             ctx.drawImage(img, 0, -yOffset);
                           }
                           
                           const sliceDataUrl = sliceCanvas.toDataURL('image/png');
                           const sliceHeightMm = sliceHeightPx * scaleFactor;
                           
                           pdf.addImage(sliceDataUrl, 'PNG', 0, headerMargin, pdfWidth, sliceHeightMm);
                           
                           yOffset += safeAreaInPixels;
                         }
                         
                         pdf.save(\`مذكرة_\${Date.now()}.pdf\`);
                       } catch (err) {
                         console.error("PDF gen failed:", err);
                         alert("حدث خطأ أثناء استخراج ملف الـ PDF. جرب الطباعة العادية.");
                         window.print();
                       }`;
                       
const exportLogicDelegation = exportLogicMemo.replace('pdf.save(`مذكرة_${Date.now()}.pdf`);', 'pdf.save(`إنابة_قضائية_${Date.now()}.pdf`);');

// Replace in memo
const oldMemoRegex = /try \{\s*const htmlToImage = await import\('html-to-image'\);[\s\S]*?pdf\.save\(\`مذكرة_\$\{Date\.now\(\)\}\.pdf\`\);\s*\} catch \(err\) \{\s*console\.error\("PDF gen failed:", err\);\s*alert\("حدث خطأ أثناء استخراج ملف الـ PDF\. جرب الطباعة العادية\."\);\s*window\.print\(\);\s*\}/;

code = code.replace(oldMemoRegex, exportLogicMemo);

// Replace in delegation
const oldDelegationRegex = /try \{\s*const htmlToImage = await import\('html-to-image'\);[\s\S]*?pdf\.save\(\`إنابة_قضائية_\$\{Date\.now\(\)\}\.pdf\`\);\s*\} catch \(err\) \{\s*console\.error\("PDF Export failed", err\);\s*window\.print\(\);\s*\} finally \{\s*if \(watermark\) \(watermark\)\.style\.display = 'flex';\s*\}/;

code = code.replace(oldDelegationRegex, exportLogicDelegation + ` finally { if (watermark) (watermark).style.display = 'flex'; }`);

fs.writeFileSync('src/App.tsx', code);
