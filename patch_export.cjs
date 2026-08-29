const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace exportPDF function at line 118
const oldExportPDF = `export const exportPDF = (elementId: string, filename?: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }
  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename || 'document.pdf',
    image: { type: 'png' as const },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  } as any;
  
  html2pdf().set(opt).from(element).save().catch((err: any) => {
    console.error("PDF generation failed, falling back to window.print()", err);
    window.print();
  });
};`;

const newExportPDF = `export const exportPDF = async (elementId: string, filename?: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }
  try {
    const htmlToImage = await import('html-to-image');
    const { jsPDF } = await import('jspdf');
    const dataUrl = await htmlToImage.toPng(element, { pixelRatio: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename || 'document.pdf');
  } catch (err) {
    console.error("PDF generation failed, falling back to window.print()", err);
    window.print();
  }
};`;

// Also remove `import html2pdf from "html2pdf.js";`
code = code.replace(`import html2pdf from "html2pdf.js";\n`, ``);
code = code.replace(oldExportPDF, newExportPDF);

// Patch mammoth usage
const oldMammothCanvas = `const html2canvas = (await import('html2canvas')).default;
                                          const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true });
                                          const base64 = canvas.toDataURL('image/png');`;
const newMammothCanvas = `const htmlToImage = await import('html-to-image');
                                          const base64 = await htmlToImage.toPng(wrapper, { pixelRatio: 2, backgroundColor: '#ffffff' });`;
code = code.replace(oldMammothCanvas, newMammothCanvas);

// Patch memo export
const oldMemoExport = `                      // Custom multi-page PDF generation with background
                       try {
                         const html2canvas = (await import('html2canvas')).default;
                         const { jsPDF } = await import('jspdf');
                         
                         const canvas = await html2canvas(el, { scale: 2, backgroundColor: null, useCORS: true });
                         const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
                         
                         const pdfWidth = pdf.internal.pageSize.getWidth();
                         const pdfHeight = pdf.internal.pageSize.getHeight();
                         const canvasWidth = canvas.width;
                         const canvasHeight = canvas.height;
                         
                         const pageHeightInPixels = (canvasWidth / pdfWidth) * pdfHeight;
                         let yOffset = 0;
                         
                         while (yOffset < canvasHeight) {
                           if (yOffset > 0) pdf.addPage();
                           if (firmLetterhead) {
                             pdf.addImage(firmLetterhead, 'PNG', 0, 0, pdfWidth, pdfHeight);
                           }
                           
                           // To draw a slice, we draw the whole canvas with a negative y offset
                           const sliceYOffset = -(yOffset * pdfHeight / pageHeightInPixels);
                           const scaledHeight = (canvasHeight * pdfWidth) / canvasWidth;
                           pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, sliceYOffset, pdfWidth, scaledHeight);
                           
                           yOffset += pageHeightInPixels;
                         }
                         
                         pdf.save(\`مذكرة_\${Date.now()}.pdf\`);
                       } catch (err) {
                         console.error("Manual PDF gen failed:", err);
                         // Fallback to html2pdf
                         const opt = {
                           margin: 0,
                           filename: \`مذكرة_\${Date.now()}.pdf\`,
                           image: { type: 'png' as const },
                           html2canvas: { scale: 2, useCORS: true, backgroundColor: null },
                           jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                         };
                         const html2pdf = (await import('html2pdf.js')).default;
                         await html2pdf().set(opt).from(el).save();
                       }`;

const newMemoExport = `                      // Custom multi-page PDF generation with html-to-image
                       try {
                         const htmlToImage = await import('html-to-image');
                         const { jsPDF } = await import('jspdf');
                         
                         const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2 });
                         
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
                         
                         pdf.save(\`مذكرة_\${Date.now()}.pdf\`);
                       } catch (err) {
                         console.error("PDF gen failed:", err);
                         alert("حدث خطأ أثناء استخراج ملف الـ PDF. جرب الطباعة العادية.");
                         window.print();
                       }`;
                       
code = code.replace(oldMemoExport, newMemoExport);

// Patch delegation export
const oldDelegationExport = `                     const opt = {
                       margin: 0,
                       filename: \`إنابة_قضائية_\${Date.now()}.pdf\`,
                       image: { type: 'png' as const },
                       html2canvas: { scale: 2, useCORS: true },
                       jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                     };
                     logAuditAction("EXPORT", "الحقيبة الخاصة", "تصدير مستند", "تم طباعة/تصدير الإنابة بصيغة PDF", 0);
                     html2pdf().set(opt).from(el).save().then(() => {
                       if (watermark) (watermark as HTMLElement).style.display = 'flex';
                     });`;
                     
const newDelegationExport = `                     logAuditAction("EXPORT", "الحقيبة الخاصة", "تصدير مستند", "تم طباعة/تصدير الإنابة بصيغة PDF", 0);
                     import('html-to-image').then(async (htmlToImage) => {
                       const { jsPDF } = await import('jspdf');
                       const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff' });
                       const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
                       const pdfWidth = pdf.internal.pageSize.getWidth();
                       const pdfHeight = (el.offsetHeight * pdfWidth) / el.offsetWidth;
                       pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                       pdf.save(\`إنابة_قضائية_\${Date.now()}.pdf\`);
                       if (watermark) (watermark as HTMLElement).style.display = 'flex';
                     }).catch(err => {
                       console.error("PDF Export failed", err);
                       if (watermark) (watermark as HTMLElement).style.display = 'flex';
                       window.print();
                     });`;
                     
code = code.replace(oldDelegationExport, newDelegationExport);

fs.writeFileSync('src/App.tsx', code);
