const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `                            <input 
                              type="file" 
                              accept="image/png,application/pdf" 
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
                                        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                                        const page = await pdf.getPage(1);
                                        const viewport = page.getViewport({ scale: 2.0 });
                                        const canvas = document.createElement('canvas');
                                        const context = canvas.getContext('2d');
                                        if (!context) return;
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                                        // @ts-ignore
                                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                                        const base64 = canvas.toDataURL('image/png');
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

const newCode = `                            <input 
                              type="file" 
                              accept="image/png,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
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
                                        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                                        const page = await pdf.getPage(1);
                                        const viewport = page.getViewport({ scale: 2.0 });
                                        const canvas = document.createElement('canvas');
                                        const context = canvas.getContext('2d');
                                        if (!context) return;
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                                        // @ts-ignore
                                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                                        const base64 = canvas.toDataURL('image/png');
                                        setFirmLetterhead(base64);
                                        saveStorage("firm_letterhead", base64);
                                        logAuditAction("UPDATE", "الأصول الرسمية", "الورق الرسمي", "تم تحديث الورق الرسمي للمكتب (من ملف PDF)", 0);
                                      };
                                      fileReader.readAsArrayBuffer(file);
                                    }).catch(err => {
                                      console.error("Error loading pdfjs", err);
                                      alert("حدث خطأ أثناء معالجة ملف PDF.");
                                    });
                                  } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                                    import('mammoth').then(mammoth => {
                                      const reader = new FileReader();
                                      reader.onload = async (ev) => {
                                        const arrayBuffer = ev.target?.result;
                                        try {
                                          const result = await mammoth.convertToHtml({ arrayBuffer });
                                          let html = result.value;
                                          if (!html) html = "<div style='text-align:center;color:#999;padding:50px;'>مستند Word لا يحتوي على نص أو صور معتمدة.</div>";
                                          
                                          const wrapper = document.createElement('div');
                                          wrapper.innerHTML = html;
                                          Object.assign(wrapper.style, {
                                            position: 'absolute', top: '-9999px', width: '794px', minHeight: '1123px',
                                            backgroundColor: 'white', padding: '40px', color: 'black', fontFamily: 'Arial, sans-serif'
                                          });
                                          document.body.appendChild(wrapper);
                                          
                                          const html2canvas = (await import('html2canvas')).default;
                                          const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true });
                                          const base64 = canvas.toDataURL('image/png');
                                          
                                          document.body.removeChild(wrapper);
                                          setFirmLetterhead(base64);
                                          saveStorage("firm_letterhead", base64);
                                          logAuditAction("UPDATE", "الأصول الرسمية", "الورق الرسمي", "تم تحديث الورق الرسمي للمكتب (من ملف Word)", 0);
                                        } catch (err) {
                                          console.error("Error parsing docx", err);
                                          alert("حدث خطأ أثناء معالجة ملف الوورد.");
                                        }
                                      };
                                      reader.readAsArrayBuffer(file);
                                    }).catch(err => {
                                      console.error("Error loading mammoth", err);
                                    });
                                  } else {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const base64 = ev.target?.result;
                                      setFirmLetterhead(base64 as string);
                                      saveStorage("firm_letterhead", base64 as string);
                                      logAuditAction("UPDATE", "الأصول الرسمية", "الورق الرسمي", "تم تحديث الورق الرسمي للمكتب", 0);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }
                              }}
                            />`;

if (code.includes('accept="image/png,application/pdf"')) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched successfully.");
} else {
  console.log("Could not find the target string.");
}
