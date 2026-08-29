const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const base64 = ev.target?.result as string;
                                    setFirmLetterhead(base64);
                                    saveStorage("firm_letterhead", base64);
                                    logAuditAction("UPDATE", "الأصول الرسمية", "الورق الرسمي", "تم تحديث الورق الرسمي للمكتب", 0);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />`;

const replaceStr = `                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.type === 'application/pdf') {
                                    import('pdfjs-dist').then((pdfjsLib) => {
                                      pdfjsLib.GlobalWorkerOptions.workerSrc = \`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.mjs\`;
                                      const fileReader = new FileReader();
                                      fileReader.onload = async function() {
                                        const typedarray = new Uint8Array(this.result as ArrayBuffer);
                                        const pdf = await pdfjsLib.getDocument(typedarray).promise;
                                        const page = await pdf.getPage(1);
                                        const viewport = page.getViewport({ scale: 2.0 });
                                        const canvas = document.createElement('canvas');
                                        const context = canvas.getContext('2d');
                                        if (!context) return;
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                                        const base64 = canvas.toDataURL('image/jpeg', 0.95);
                                        setFirmLetterhead(base64);
                                        saveStorage("firm_letterhead", base64);
                                        logAuditAction("UPDATE", "الأصول الرسمية", "الورق الرسمي", "تم تحديث الورق الرسمي للمكتب (من ملف PDF)", 0);
                                      };
                                      fileReader.readAsArrayBuffer(file);
                                    }).catch(err => {
                                      console.error("Error loading pdfjs", err);
                                      alert("حدث خطأ أثناء معالجة ملف PDF.");
                                    });
                                  } else {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const base64 = ev.target?.result as string;
                                      setFirmLetterhead(base64);
                                      saveStorage("firm_letterhead", base64);
                                      logAuditAction("UPDATE", "الأصول الرسمية", "الورق الرسمي", "تم تحديث الورق الرسمي للمكتب", 0);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }
                              }}
                            />`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("PDF upload support patched.");
} else {
  console.log("Target not found.");
}
