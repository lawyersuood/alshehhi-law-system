const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStart = `               {/* Letterhead Header */}`;
const targetEnd = `               </div>
            </div>
            
            {isSecureBlurred && (`;

const replaceCode = `               {/* Background Letterhead (if exists) */}
               {firmLetterhead && (
                 <div className="absolute inset-0 z-0">
                   <img src={firmLetterhead} alt="Letterhead" className="w-full h-full object-cover" />
                 </div>
               )}

               {/* Default Text Header (if no letterhead) */}
               {!firmLetterhead && (
                 <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center flex flex-col items-center gap-2 relative z-10">
                   <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mb-2">
                     <Scale size={32} />
                   </div>
                   <h1 className="text-3xl font-black text-slate-900">مكتب المحاماة للاستشارات القانونية</h1>
                   <p className="text-sm font-bold text-slate-600 uppercase">ADVOCATES & LEGAL CONSULTANTS</p>
                 </div>
               )}
               
               <div className="relative z-10 space-y-6 text-xl text-justify leading-loose pt-10 px-8">
                 <p className="mb-8">التاريخ :- <strong>{form.delegationDate || new Date().toISOString().split('T')[0]}</strong></p>
                 
                 <p>لدى <strong>{form.court || "المحكمة"}</strong> الموقرة ,,,</p>
                 <p>في القضية رقم<br/>
                 <strong>{form.caseNo || "__________________________"}</strong></p>
                 
                 <h2 className="text-3xl font-black text-center my-12">إنـــــــــابـــــــــة</h2>
                 
                 <p>الموكل :- <strong>{form.clientName || "__________"}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; الصفة :- <strong>{form.clientCapacity || "__________"}</strong></p>
                 <p className="mb-8">ضـــد :- <strong>{form.opponentName || "__________"}</strong></p>
                 
                 <p>أنـــا المحامي :- <strong>{delegatingLawyer}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; قيد رقم :- <strong>{delegatingLawyerId}</strong></p>
                 
                 <p className="mt-8">بموجب هذه الإنابة، وبصفتي وكيلاً عن الموكل المذكور أعلاه،<br/>
                 أنيب زميلي الأستاذ المحامي :- <strong>{colName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; قيد رقم :- <strong>{colId}</strong></p>
                 
                 <p className="mt-8 font-bold text-xl">تاريخ الجلسة المناب لها الزميل :- <strong>{form.hearingDate || "__________"}</strong></p>
                 
                 <p className="mt-8">للحضور والترافع والقيام بجميع الإجراءات اللازمة نيابة عني في القضية المذكورة أعلاه.</p>
                 <p className="mt-12">وتفضلوا بقبول وافر الاحترام والتقدير ،،،</p>

                 <div className="mt-20 flex flex-col items-start pt-8">
                   <p className="font-bold mb-8">المحامي الموكل<br/>الاسم :- {delegatingLawyer}</p>
                   <p className="mb-4">التوقيع والختم</p>
                   <div className="relative w-64 h-48 flex items-center justify-center">
                     {form.isApproved ? (
                       <>
                         {userSignature && (
                           <img src={userSignature} alt="Signature" className="absolute -top-10 -right-10 w-48 object-contain mix-blend-multiply opacity-90 z-20" />
                         )}
                         {firmStamp && (
                           <img src={firmStamp} alt="Stamp" className="absolute top-0 right-10 w-40 h-40 object-contain mix-blend-multiply opacity-80 z-10" />
                         )}
                         {!firmStamp && !userSignature && (
                           <div className="w-32 h-32 rounded-full border-4 border-double border-red-700 flex items-center justify-center rotate-[-15deg] opacity-90 relative z-10">
                             <div className="absolute inset-2 border-2 border-red-700 rounded-full"></div>
                             <div className="text-red-700 font-black text-lg leading-tight text-center bg-white/80 p-2 rounded-full">
                               معتمد وموثق<br/>
                               <span className="text-sm">{form.approvedBy || currentUser.name}</span><br/>
                               <span className="text-[10px] font-mono">{form.serialNo}</span>
                             </div>
                           </div>
                         )}
                       </>
                     ) : (
                       <div className="w-32 h-32 rounded-full border-4 border-dashed border-red-500/20 flex items-center justify-center rotate-[-15deg] opacity-60">
                         <span className="text-red-500/40 font-bold text-sm text-center">مسودة غير معتمدة<br/>(بدون ختم)</span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            </div>
            
            {isSecureBlurred && (`;

const blockStartIndex = code.indexOf(targetStart);
const blockEndIndex = code.indexOf(targetEnd);

if (blockStartIndex !== -1 && blockEndIndex !== -1) {
  const fullTarget = code.substring(blockStartIndex, blockEndIndex + targetEnd.length);
  code = code.replace(fullTarget, replaceCode);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Delegation preview updated successfully.");
} else {
  console.log("Targets not found.");
}
