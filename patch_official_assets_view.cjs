const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetView = `            {tab === "users" && (`;
const viewStr = `            {tab === "official_assets" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Stamp className="text-amber-600" /> الأصول الرسمية والتواقيع
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      إدارة الورق الرسمي (الترويسة)، الختم المعتمد للمكتب، وتوقيعك الإلكتروني الشخصي
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Firm Letterhead & Stamp (Admin Only) */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Building2 size={20} className="text-slate-400" /> أصول المكتب الموحدة
                    </h3>
                    
                    {!checkPerm("signOfficialDocs") && (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <p>عذراً، رفع وتعديل الورق الرسمي وختم المكتب يتطلب صلاحية (اعتماد وتوقيع المستندات الرسمية).</p>
                      </div>
                    )}

                    {/* Letterhead */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900">الورق الرسمي (ترويسة المكتب)</h4>
                          <p className="text-xs text-slate-500 mt-1">سيُستخدم كخلفية ثابتة لجميع المستندات المصدرة</p>
                        </div>
                        {checkPerm("signOfficialDocs") && (
                          <label className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition cursor-pointer flex items-center gap-2">
                            <UploadCloud size={14} /> رفع صورة
                            <input 
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
                            />
                          </label>
                        )}
                      </div>
                      
                      {firmLetterhead ? (
                        <div className="w-full aspect-[1/1.414] bg-slate-100 border border-slate-200 rounded-lg overflow-hidden relative group">
                          <img src={firmLetterhead} alt="Letterhead" className="w-full h-full object-cover" />
                          {checkPerm("signOfficialDocs") && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button 
                                onClick={() => {
                                  setFirmLetterhead(null);
                                  saveStorage("firm_letterhead", null);
                                  logAuditAction("DELETE", "الأصول الرسمية", "الورق الرسمي", "تم حذف الورق الرسمي للمكتب", 0);
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs"
                              >
                                إزالة الورق الرسمي
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full aspect-[1/1.414] bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                          <FileText size={32} className="mb-2 text-slate-300" />
                          <span className="text-xs">لم يتم رفع ورق رسمي بعد</span>
                        </div>
                      )}
                    </div>

                    {/* Firm Stamp */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900">الختم الرسمي للمكتب</h4>
                          <p className="text-xs text-slate-500 mt-1">يجب أن تكون خلفية الختم شفافة (PNG)</p>
                        </div>
                        {checkPerm("signOfficialDocs") && (
                          <label className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition cursor-pointer flex items-center gap-2">
                            <UploadCloud size={14} /> رفع صورة
                            <input 
                              type="file" 
                              accept="image/png, image/jpeg" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const base64 = ev.target?.result as string;
                                    setFirmStamp(base64);
                                    saveStorage("firm_stamp", base64);
                                    logAuditAction("UPDATE", "الأصول الرسمية", "ختم المكتب", "تم تحديث الختم الرسمي للمكتب", 0);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                      
                      {firmStamp ? (
                        <div className="w-32 h-32 mx-auto bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center overflow-hidden relative group">
                          <img src={firmStamp} alt="Stamp" className="w-full h-full object-contain mix-blend-multiply" />
                          {checkPerm("signOfficialDocs") && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button 
                                onClick={() => {
                                  setFirmStamp(null);
                                  saveStorage("firm_stamp", null);
                                  logAuditAction("DELETE", "الأصول الرسمية", "ختم المكتب", "تم حذف الختم الرسمي", 0);
                                }}
                                className="bg-red-500 text-white p-2 rounded-full"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-32 h-32 mx-auto bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center text-slate-400">
                          <Stamp size={24} className="mb-1 text-slate-300" />
                          <span className="text-[10px]">لا يوجد ختم</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Signature (Per User) */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User size={20} className="text-slate-400" /> أصولي الشخصية
                    </h3>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-bold text-slate-900">توقيعي الإلكتروني</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            هذا التوقيع خاص بحسابك فقط، ولن يُدرج في أي مستند إلا بطلب صريح منك.
                          </p>
                        </div>
                        <label className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition cursor-pointer flex items-center gap-2">
                          <UploadCloud size={14} /> رفع توقيع
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const base64 = ev.target?.result as string;
                                  setUserSignature(base64);
                                  saveStorage("user_signature_" + currentUser.id, base64);
                                  logAuditAction("UPDATE", "الأصول الرسمية", "توقيع شخصي", "قام المستخدم بتحديث توقيعه الشخصي", currentUser.id);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {userSignature ? (
                        <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center relative group">
                          <img src={userSignature} alt="Signature" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button 
                              onClick={() => {
                                setUserSignature(null);
                                saveStorage("user_signature_" + currentUser.id, null);
                                logAuditAction("DELETE", "الأصول الرسمية", "توقيع شخصي", "قام المستخدم بحذف توقيعه", currentUser.id);
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"
                            >
                              <Trash2 size={14} /> حذف التوقيع
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                          <FileSignature size={32} className="mb-2 text-slate-300" />
                          <span className="text-xs">لم تقم برفع توقيعك الشخصي بعد</span>
                        </div>
                      )}

                      <div className="mt-4 bg-amber-50 text-amber-700 p-3 rounded-lg text-xs flex items-start gap-2">
                        <Shield size={16} className="shrink-0 mt-0.5" />
                        <p>
                          <strong>أمان المستندات:</strong> حتى لو تم حفظ توقيعك هنا، لا يحق لأي مستخدم آخر (حتى الإدارة) استخدامه. يُدرج توقيعك فقط عندما تضغط بنفسك على زر "اعتماد وتوقيع" في المستندات.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
`;

if (code.includes(targetView) && !code.includes('tab === "official_assets"')) {
  code = code.replace(targetView, viewStr + '\n' + targetView);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Official Assets view added.");
} else {
  console.log("View already added or target not found.");
}
