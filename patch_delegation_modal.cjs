const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add the state and effect inside App
const stateMarker = `  const [delegationLogs, setDelegationLogs] = useState<DelegationLog[]>(() => loadStorage("firm_delegation_logs", []));`;
const stateAdd = `
  const [isSecureBlurred, setIsSecureBlurred] = useState(false);
  useEffect(() => {
    if (modal === "delegation-preview") {
      logAuditAction("VIEW", "الحقيبة الخاصة", "عرض مستند رسمي", "تم فتح مستند الإنابة للعرض", 0);
      
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'P' || e.key === 'S' || e.key === 'C')) {
          e.preventDefault();
          alert("غير مصرح: تم تسجيل محاولة استخدام اختصار محظور.");
          logAuditAction("SECURITY_ALERT", "الحقيبة الخاصة", "محاولة نسخ/طباعة", \`محاولة اختصار \${e.key}\`, 0);
        }
      };
      
      const handleBlur = () => { setIsSecureBlurred(true); };
      const handleFocus = () => { setIsSecureBlurred(false); };
      const handleVisibility = () => { if (document.hidden) setIsSecureBlurred(true); else setIsSecureBlurred(false); };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      setIsSecureBlurred(false);
    }
  }, [modal]);
`;

if (!code.includes('isSecureBlurred')) {
  code = code.replace(stateMarker, stateMarker + '\n' + stateAdd);
}

const oldModalStart = `      {modal === "delegation-preview" && (`;
const oldModalEnd = `        </Modal>\n      )}`;

// We need to find the specific block starting from oldModalStart and ending at the next `      {modal === "case" && (`
const blockStartIndex = code.indexOf(oldModalStart);
const nextModalIndex = code.indexOf(`      {modal === "case" && (`);

if (blockStartIndex !== -1 && nextModalIndex !== -1) {
  const oldModalFull = code.substring(blockStartIndex, nextModalIndex);

  const newModal = `      {modal === "delegation-preview" && (() => {
        const delegatingLawyer = form.delegatingLawyer || currentUser.name || "..........";
        const delegatingLawyerId = form.delegatingLawyerId || "..........";
        
        const colRef = colleagues.find(c => c.id === form.delegatedColleagueId);
        const colName = colRef?.name || "..........";
        const colId = colRef?.federalId || "..........";
        
        return (
        <Modal title="معاينة إنابة قضائية (مستند محمي)" onClose={() => setModal(null)} wide>
          <div className="space-y-4 text-sm relative" id="delegation-doc-container" onContextMenu={(e) => { e.preventDefault(); alert("النسخ غير مسموح."); }}>
            
            <div 
              id="delegation-doc" 
              className={\`bg-white p-8 sm:p-12 shadow-sm rounded-xl min-h-[800px] font-sans relative overflow-hidden text-right leading-loose text-black select-none transition-all duration-200 \${isSecureBlurred ? 'blur-xl grayscale' : ''}\`} 
              dir="rtl"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
               {/* Watermark overlay */}
               <div className="absolute inset-0 pointer-events-none flex flex-wrap justify-center items-center opacity-[0.03] z-0 overflow-hidden" style={{ gap: '4rem', transform: 'rotate(-30deg) scale(1.5)' }}>
                 {Array.from({ length: 150 }).map((_, i) => (
                   <span key={i} className="text-2xl font-black whitespace-nowrap">
                     {currentUser.name} - {new Date().toLocaleString('ar-AE')}
                   </span>
                 ))}
               </div>

               {/* Letterhead Header */}
               <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center flex flex-col items-center gap-2 relative z-10">
                 <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mb-2">
                   <Scale size={32} />
                 </div>
                 <h1 className="text-3xl font-black text-slate-900">مكتب المحاماة للاستشارات القانونية</h1>
                 <p className="text-sm font-bold text-slate-600 uppercase">ADVOCATES & LEGAL CONSULTANTS</p>
               </div>
               
               <div className="relative z-10 space-y-6 text-lg text-justify leading-relaxed">
                 <p className="mb-8">التاريخ :- <strong>{form.delegationDate || new Date().toISOString().split('T')[0]}</strong></p>
                 
                 <p>لدى <strong>{form.court || "المحكمة"}</strong> الموقرة ,,,</p>
                 <p>في القضية رقم<br/>
                 <strong>{form.caseNo || "...................."}</strong></p>
                 
                 <h2 className="text-2xl font-black text-center my-10 underline underline-offset-8">إنـــــــــابـــــــــة</h2>
                 
                 <p>الموكل :- <strong>{form.clientName || "...................."}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; الصفة :- <strong>{form.clientCapacity || "...................."}</strong></p>
                 <p className="mb-8">ضـــد :- <strong>{form.opponentName || "...................."}</strong></p>
                 
                 <p>أنـــا المحامي :- <strong>{delegatingLawyer}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; قيد رقم :- <strong>{delegatingLawyerId}</strong></p>
                 
                 <p className="mt-8">بموجب هذه الإنابة، وبصفتي وكيلاً عن الموكل المذكور أعلاه،<br/>
                 أنيب زميلي الأستاذ المحامي :- <strong>{colName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; قيد رقم :- <strong>{colId}</strong></p>
                 
                 <p className="mt-8 font-bold text-xl">تاريخ الجلسة المناب لها الزميل :- {form.hearingDate || "...................."}</p>
                 
                 <p className="mt-8">للحضور والترافع والقيام بجميع الإجراءات اللازمة نيابة عني في القضية المذكورة أعلاه.</p>
                 <p className="mt-8">وتفضلوا بقبول وافر الاحترام والتقدير ،،،</p>

                 <div className="mt-16 flex flex-col items-start pt-8">
                   <p className="font-bold mb-8">المحامي الموكل<br/>الاسم :- {delegatingLawyer}</p>
                   <p className="mb-4">التوقيع والختم</p>
                   <div>
                     {form.isApproved ? (
                       <div className="w-32 h-32 rounded-full border-4 border-double border-red-700 flex items-center justify-center rotate-[-15deg] opacity-90 relative">
                         <div className="absolute inset-2 border-2 border-red-700 rounded-full"></div>
                         <div className="text-red-700 font-black text-lg leading-tight text-center bg-white/80 p-2 rounded-full">
                           معتمد وموثق<br/>
                           <span className="text-sm">{form.approvedBy || currentUser.name}</span><br/>
                           <span className="text-[10px] font-mono">{form.serialNo}</span>
                         </div>
                       </div>
                     ) : (
                       <div className="w-32 h-32 rounded-full border-4 border-dashed border-red-500/20 flex items-center justify-center rotate-[-15deg] opacity-60">
                         <span className="text-red-500/40 font-bold text-sm text-center">مسودة غير معتمدة<br/>(بدون ختم)</span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            </div>
            
            {isSecureBlurred && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40">
                 <div className="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold shadow-2xl flex items-center gap-3">
                    <ShieldAlert size={24} className="text-red-500" />
                    الشاشة محمية. يرجى النقر للعودة.
                 </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
               <button 
                 onClick={() => {
                   const el = document.getElementById("delegation-doc");
                   if (el) {
                     const opt = {
                       margin: 0,
                       filename: \`إنابة_قضائية_\${Date.now()}.pdf\`,
                       image: { type: 'jpeg', quality: 0.98 },
                       html2canvas: { scale: 2, useCORS: true },
                       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                     };
                     logAuditAction("EXPORT", "الحقيبة الخاصة", "تصدير مستند", "تم طباعة/تصدير الإنابة بصيغة PDF", 0);
                     html2pdf().set(opt).from(el).save();
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
  
  code = code.replace(oldModalFull, newModal);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Modal patched successfully.");
} else {
  console.log("Could not find the block to replace.");
}

