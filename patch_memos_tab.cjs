const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const memosTabCode = `
                {specialPortfolioTab === "memos" && (
                  <div className="space-y-6">
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                       <div className="border-b border-slate-100 pb-4">
                          <h2 className="text-xl font-bold text-slate-900">محرر المذكرات والخطابات</h2>
                          <p className="text-xs text-slate-500 mt-1">إنشاء وطباعة الخطابات الرسمية والمذكرات القانونية مع الترويسة المعتمدة للمكتب</p>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">عنوان المذكرة / الخطاب (اختياري)</label>
                            <input 
                              type="text" 
                              value={form.memoTitle || ""}
                              onChange={(e) => setForm({ ...form, memoTitle: e.target.value })}
                              placeholder="مثال: مذكرة دفاع جوابية، إنذار عدلي، خطاب موجه إلى..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">محتوى مبدئي (سيتم نقله للمحرر لتنسيقه)</label>
                            <textarea 
                              rows={5}
                              value={form.memoContent || ""}
                              onChange={(e) => setForm({ ...form, memoContent: e.target.value })}
                              placeholder="أدخل النص المبدئي هنا... يمكنك لاحقاً تعديله وتنسيقه (عريض، توسيط، مسافات) في شاشة المعاينة"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-amber-500" 
                            />
                          </div>
                       </div>
                       
                       <div className="flex gap-3 pt-4 border-t border-slate-100">
                         <button 
                           onClick={() => {
                             setForm({ ...form, isApproved: true });
                             setModal("memo-preview");
                           }}
                           className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition"
                         >
                           فتح في المحرر المتقدم للطباعة
                         </button>
                       </div>
                     </div>
                  </div>
                )}
`;

if (!code.includes('specialPortfolioTab === "memos" && (')) {
  code = code.replace(
    /\{\/\* ================= القضايا ================= \*\/\}/,
    memosTabCode + '\n            {/* ================= القضايا ================= */}'
  );
}

fs.writeFileSync('src/App.tsx', code);
console.log("Added memos tab");
