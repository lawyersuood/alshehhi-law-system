const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We will add the memo tab UI and the logic.
const memoUI = `
                {specialPortfolioTab === "memos" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">مذكرات وخطابات</h3>
                        <p className="text-xs text-slate-500 mt-1">إنشاء مستندات حرة وتصديرها على الورق الرسمي</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">عنوان / موضوع المذكرة</label>
                          <input 
                            type="text" 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:bg-white focus:border-amber-500 focus:outline-none"
                            placeholder="مثال: مذكرة دفاع، خطاب إنذار..."
                            value={form.memoTitle || ""}
                            onChange={e => setForm({...form, memoTitle: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">رقم القضية (اختياري)</label>
                          <input 
                            type="text" 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:bg-white focus:border-amber-500 focus:outline-none"
                            placeholder="لربط المذكرة بملف قضية..."
                            value={form.memoCaseNo || ""}
                            onChange={e => setForm({...form, memoCaseNo: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">محتوى المستند</label>
                        <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-50 min-h-[400px]">
                          {firmLetterhead && (
                            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                              <img src={firmLetterhead} alt="Letterhead Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <textarea 
                            className="w-full h-full min-h-[400px] p-8 pt-[22%] pb-[15%] bg-transparent relative z-10 text-lg leading-loose text-justify focus:outline-none resize-y"
                            placeholder="اكتب نص المذكرة هنا..."
                            value={form.memoContent || ""}
                            onChange={e => setForm({...form, memoContent: e.target.value})}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 text-center mt-2">
                          تلميح: يتم محاذاة النص تلقائياً داخل منطقة الأمان للورق الرسمي. في حال التصدير، سيتكرر الورق الرسمي على جميع الصفحات.
                        </p>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={() => {
                            if (!form.memoContent) return alert("الرجاء كتابة محتوى المذكرة.");
                            setModal("memo-preview");
                          }}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-sm"
                        >
                          معاينة واعتماد المستند
                        </button>
                      </div>
                    </div>
                  </div>
                )}
`;

if (!code.includes('specialPortfolioTab === "memos"')) {
  code = code.replace(/\{specialPortfolioTab === "delegations" && \(/, match => memoUI + '\n                ' + match);
}

// Add the memo-preview modal
const memoPreviewModal = `
        {modal === "memo-preview" && (
        <Modal title="معاينة المذكرة / الخطاب (مستند محمي)" onClose={() => setModal(null)} wide>
          <div className="space-y-4 text-sm relative" id="memo-doc-container" onContextMenu={(e) => { e.preventDefault(); alert("النسخ غير مسموح."); }}>
            
            <div 
              id="memo-doc" 
              className={\`bg-white shadow-sm rounded-xl min-h-[800px] font-sans relative overflow-hidden text-right leading-loose text-black select-none transition-all duration-200 \${isSecureBlurred ? 'blur-xl grayscale' : ''}\`} 
              dir="rtl"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
               {/* Watermark overlay */}
               <div id="memo-watermark" className="absolute inset-0 pointer-events-none flex flex-wrap justify-center items-center opacity-[0.03] z-0 overflow-hidden hidden" style={{ gap: '4rem', transform: 'rotate(-30deg) scale(1.5)' }}>
                 {Array.from({ length: 150 }).map((_, i) => (
                   <span key={i} className="text-2xl font-black whitespace-nowrap">
                     {currentUser.name} - {new Date().toLocaleString('ar-AE')}
                   </span>
                 ))}
               </div>

               {/* Default Text Header (if no letterhead) */}
               {!firmLetterhead && (
                 <div className="border-b-2 border-slate-800 pb-6 mb-8 mt-12 text-center flex flex-col items-center gap-2 relative z-10">
                   <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mb-2">
                     <Scale size={32} />
                   </div>
                   <h1 className="text-3xl font-black text-slate-900">مكتب المحاماة للاستشارات القانونية</h1>
                   <p className="text-sm font-bold text-slate-600 uppercase">ADVOCATES & LEGAL CONSULTANTS</p>
                 </div>
               )}
               
               <div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-[22%] pb-[15%] px-12" style={{ whiteSpace: 'pre-wrap' }}>
                 {form.memoTitle && <h2 className="text-2xl font-black text-center mb-8">{form.memoTitle}</h2>}
                 {form.memoContent}
                 
                 {/* Signature Area */}
                 <div className="mt-20 flex flex-col items-end gap-4 mr-12 text-center">
                   <p className="font-bold text-lg">المحامي</p>
                   <p className="font-bold text-lg">{currentUser.name}</p>
                   {currentUser.signature && hasTabPermission(currentUser, "official_assets") && isSigned && (
                     <div className="relative w-40 h-24">
                       {firmStamp && <img src={firmStamp} alt="Stamp" className="absolute inset-0 w-full h-full object-contain opacity-50 mix-blend-multiply" />}
                       <img src={currentUser.signature} alt="Signature" className="absolute inset-0 w-full h-full object-contain mix-blend-multiply" />
                     </div>
                   )}
                 </div>
               </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex justify-between items-center mt-6">
               <div className="flex items-center gap-3">
                 <ShieldCheck className="text-amber-600" size={24} />
                 <div>
                   <p className="font-bold text-amber-900">منطقة الاعتماد الآمن</p>
                   <p className="text-xs text-amber-700">تتم معالجة المستند داخلياً دون تصدير القالب الخام.</p>
                 </div>
               </div>
               
               <div className="flex gap-2">
                 {!isSigned && hasTabPermission(currentUser, "official_assets") && (
                   <button 
                     onClick={() => setIsSigned(true)}
                     className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2"
                   >
                     <PenTool size={18} />
                     اعتماد وتوقيع
                   </button>
                 )}
                 <button 
                   onClick={async () => {
                     const el = document.getElementById("memo-doc");
                     const watermark = document.getElementById("memo-watermark");
                     if (el) {
                       if (watermark) (watermark as HTMLElement).style.display = 'flex';
                       logAuditAction("EXPORT", "الحقيبة الخاصة", "تصدير مذكرة", \`تم طباعة/تصدير مذكرة (\${form.memoTitle || 'بدون عنوان'}) بصيغة PDF\`, 0);
                       
                       // Custom multi-page PDF generation with background
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
                       }

                       if (watermark) (watermark as HTMLElement).style.display = 'none';
                     }
                   }}
                   className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2"
                 >
                   <Download size={18} />
                   تصدير PDF مسطّح
                 </button>
               </div>
            </div>
          </div>
        </Modal>
      )}
`;

if (!code.includes('modal === "memo-preview"')) {
  code = code.replace(/\{modal === "delegation-preview" && \(/, match => memoPreviewModal + '\n        ' + match);
}

fs.writeFileSync('src/App.tsx', code);
