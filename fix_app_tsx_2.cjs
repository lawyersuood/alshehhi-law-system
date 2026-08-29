const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `                       try {\n                         const htmlToImage = await import('html-to-image');`;

const parts = code.split(searchStr);

const endStr = `<Printer size={16} /> استخراج كملف PDF\n               </button>\n            </div>\n          </div>\n        </Modal>\n        );\n      })()}`;

// Wait, the end string might be slightly different. Let's find the index of "استخراج كملف PDF".
const buttonIndex = code.indexOf('استخراج كملف PDF');
const afterButton = code.substring(buttonIndex);
// find `})()}`
const endOfModal = afterButton.indexOf('})()}');

const beforeMessedUp = code.substring(0, code.indexOf('try {\n                         const htmlToImage'));
const afterMessedUp = code.substring(buttonIndex + endOfModal + 5);

// Let's create the replacement string!
const newMemoLogic = `try {
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
                       }
                   }
                 }}
                 className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2"
               >
                 <Printer size={16} /> استخراج كملف PDF
               </button>
            </div>
          </div>
        </Modal>
        );
      })()}
      
      {modal === "delegation" && (
        (() => {
          const form = delegationForm;
          const currentUser = users.find(u => u.id === form.assignedLawyerId) || { name: 'المحامي الموكل' };
          
          return (
        <Modal title="معاينة إنابة قضائية (مستند محمي)" onClose={() => setModal(null)} wide>
          <RichTextToolbar />
          <div className="space-y-4 text-sm relative" id="delegation-doc-container" >
            
            <div 
              id="delegation-doc" 
              className={\`bg-white p-8 sm:p-12 shadow-sm rounded-xl min-h-[800px] font-sans relative overflow-hidden text-right leading-loose text-black transition-all duration-200 \${isSecureBlurred ? 'blur-xl grayscale' : ''}\`} 
              dir="rtl"
             style={{ fontFamily: 'Arial, sans-serif' }}
           >
              {/* Watermark overlay */}
              <div id="watermark-layer" className="absolute inset-0 pointer-events-none flex flex-wrap justify-center items-center opacity-[0.03] z-0 overflow-hidden" style={{ gap: '4rem', transform: 'rotate(-30deg) scale(1.5)' }}>
                {Array.from({ length: 150 }).map((_, i) => (
                  <span key={i} className="text-2xl font-black whitespace-nowrap">
                    {currentUser.name} - {new Date().toLocaleString('ar-AE')}
                  </span>
                ))}
              </div>

              {/* Background Letterhead (if exists) */}
              {firmLetterhead && (
                <div className="absolute inset-0 z-0">
                  <img src={firmLetterhead} alt="Letterhead" className="w-full h-full object-contain object-top" />
                </div>
              )}

              {/* Default Text Header (if no letterhead) */}
              {!firmLetterhead && (
                <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center flex flex-col items-center gap-2 relative z-10">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mb-2">
                    <Scale size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900">مكتب المحاماة للاستشارات القانونية</h1>
                  <p className="text-lg text-slate-600 font-bold">إنابة قضائية</p>
                </div>
              )}

              <div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-[45%] pb-[15%] px-12 outline-none focus:ring-2 focus:ring-amber-500 rounded-xl" contentEditable={!isSecureBlurred} suppressContentEditableWarning={true}>
                <p className="text-left font-bold" contentEditable={false}>التاريخ :- {form.date}</p>
                
                <div className="font-bold">
                  <p>لدى المحكمة الموقرة ,,,</p>
                  <p>في القضية رقم</p>
                </div>

                <h2 className="text-3xl font-black text-center my-12" contentEditable={false}>إنــــــابــــــة</h2>

                <div className="grid grid-cols-2 gap-8 mb-8" contentEditable={false}>
                  <div>
                    <span className="font-bold">الموكل :- </span>
                    <span className="underline decoration-dotted underline-offset-4 font-bold px-4">{form.clientName}</span>
                  </div>
                  <div>
                    <span className="font-bold">الصفة :- </span>
                    <span className="underline decoration-dotted underline-offset-4 font-bold px-4">{form.clientRole}</span>
                  </div>
                </div>

                <div className="mb-8 font-bold" contentEditable={false}>
                  ضـــــد :- <span className="underline decoration-dotted underline-offset-4 px-4">{form.opponentName}</span>
                </div>

                <div className="font-bold leading-loose text-justify mb-8">
                  أنــــا المحامي :- <span className="underline decoration-dotted underline-offset-4 px-4 font-black">{form.assigningLawyer}</span>
                  <span className="mx-4">قيد رقم :- <span className="underline decoration-dotted underline-offset-4 px-4">{form.assigningLawyerId}</span></span>
                </div>

                <p className="font-bold leading-loose">
                  بموجب هذه الإنابة، وبصفتي وكيلاً عن الموكل المذكور أعلاه،<br/>
                  أنيب زميلي الأستاذ المحامي :- <span className="underline decoration-dotted underline-offset-4 px-4 font-black">{form.assignedLawyer}</span>
                  <span className="mx-4">قيد رقم :- <span className="underline decoration-dotted underline-offset-4 px-4">{form.assignedLawyerLicenseId}</span></span>
                </p>

                <div className="font-bold my-8">
                  تاريخ الجلسة المناب لها الزميل :- <span className="underline decoration-dotted underline-offset-4 px-8">{form.sessionDate}</span>
                </div>

                <p className="font-bold leading-loose border-y-2 border-slate-100 py-6 my-8">
                  للحضور والترافع والقيام بجميع الإجراءات اللازمة نيابة عني في القضية المذكورة أعلاه.
                </p>

                <p className="font-bold text-center mt-16 text-2xl">
                  وتفضلوا بقبول وافر الاحترام والتقدير ،،،
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4 print:hidden relative z-50">
               <button 
                 onClick={() => setModal(null)} 
                 className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition"
               >
                 إغلاق
               </button>
               <button 
                 onClick={async () => {
                   const el = document.getElementById("delegation-doc");
                   if (el) {
                     const watermark = el.querySelector('#watermark-layer');
                     if (watermark) (watermark).style.display = 'none';
                     
                     logAuditAction("EXPORT", "الحقيبة الخاصة", "تصدير مستند", "تم طباعة/تصدير الإنابة بصيغة PDF", 0);
                     try {
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
                         
                         pdf.save(\`إنابة_قضائية_\${Date.now()}.pdf\`);
                       } catch (err) {
                         console.error("PDF Export failed", err);
                         window.print();
                       } finally {
                         if (watermark) (watermark).style.display = 'flex';
                       }
                   }
                 }}
                 className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2"
               >
                 <Printer size={16} /> استخراج كملف PDF
               </button>
            </div>
          </div>
        </Modal>
        );
      })()}
`;

fs.writeFileSync('src/App.tsx', beforeMessedUp + newMemoLogic + afterMessedUp);
