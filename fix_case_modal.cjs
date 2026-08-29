const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCaseModal = `{modal === "case" && (
        <Modal title="قيد قضية جديدة" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="رقم القضية لدى المحكمة">
              <input onChange={f("number")} placeholder="مثال: 1245/2026 تجاري كلي" className={inputCls} />
            </Field>
            <Field label="الموكل">
              <select onChange={f("clientId")} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="الخصم">
              <input onChange={f("opponent")} placeholder="اسم المدعى عليه أو الخصم" className={inputCls} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="مرحلة الدعوى (درجة التقاضي)">
                <select onChange={f("stage")} defaultValue="الابتدائية" className={inputCls}>
                  {CASE_STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </Field>
              <Field label="حالة القضية">
                <select onChange={f("status")} defaultValue="متداولة" className={inputCls}>
                  {CASE_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="نوع الدعوى">
                <select onChange={f("type")} className={inputCls}>
                  {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="الإمارة">
                <select onChange={f("emirate")} className={inputCls} defaultValue="">
                  <option value="">اختر الإمارة...</option>
                  {["أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </Field>
              <Field label="المحكمة المختصة">
                <select onChange={f("court")} className={inputCls}>
                  {COURTS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="الدائرة القضائية / القاضي المشرف">
              <input onChange={f("judge")} placeholder="مثال: دائرة الجنايات الأولى - القاضي محمد" className={inputCls} />
            </Field>
            <Field label="موضوع الدعوى والطلبات">
              <textarea onChange={f("subject")} rows={2} placeholder="ملخص وقائع الدعوى..." className={inputCls} />
            </Field>
            <Field label="قالب المهام التلقائية (اختياري)">
              <select onChange={f("taskTemplate")} className={inputCls}>
                <option value="">لا يوجد (عدم إضافة مهام تلقائية)</option>
                {TASK_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="الأتعاب المتفق عليها (د.إ)">
              <input type="number" onChange={f("fee")} placeholder="0.00" className={inputCls} />
            </Field>
            <button
              onClick={() => {
                if (!form.number || !form.clientId || !form.type) return alert("أكمل البيانات الأساسية");
                if (form.id) {
                    logAuditAction("UPDATE", "القضايا", \`قضية رقم \${form.number}\`, \`تعديل بيانات القضية بشكل شامل\`, form.id);
                    setCases(cases.map(c => c.id === form.id ? { ...c, ...form } : c));
                } else {
                    const newCase = {
                      id: Date.now(),
                      number: form.number,
                      clientId: Number(form.clientId),
                      opponent: form.opponent || "غير محدد",
                      stage: form.stage || "الابتدائية",
                      status: form.status || "متداولة",
                      type: form.type || CASE_TYPES[0],
                      emirate: form.emirate || "دبي",
                      court: form.court || COURTS[0],
                      judge: form.judge || "",
                      subject: form.subject || "",
                      openDate: new Date().toISOString(),
                      fee: Number(form.fee) || 0,
                    };
                    logAuditAction("CREATE", "إدارة القضايا", \`قضية جديدة: \${newCase.number}\`, \`تم قيد قضية جديدة للموكل \${clientName(newCase.clientId)}\`, newCase.id);
                    setCases([...cases, newCase]);
                }
                setModal(null);
              }}
              className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700"
            >
              حفظ بيانات القضية
            </button>
          </div>
        </Modal>
      )}`;

const newCaseModal = `{modal === "case" && (
        <Modal title={form.id ? "تعديل بيانات القضية" : "قيد قضية جديدة"} onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="رقم القضية لدى المحكمة">
              <input value={form.number || ""} onChange={f("number")} placeholder="مثال: 1245/2026 تجاري كلي" className={inputCls} />
            </Field>
            <Field label="الموكل">
              <select value={form.clientId || ""} onChange={f("clientId")} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="الخصم">
              <input value={form.opponent || ""} onChange={f("opponent")} placeholder="اسم المدعى عليه أو الخصم" className={inputCls} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="مرحلة الدعوى (درجة التقاضي)">
                <select value={form.stage || "الابتدائية"} onChange={f("stage")} className={inputCls}>
                  {CASE_STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </Field>
              <Field label="حالة القضية">
                <select value={form.status || "متداولة"} onChange={f("status")} className={inputCls}>
                  {CASE_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="نوع الدعوى">
                <select value={form.type || CASE_TYPES[0]} onChange={f("type")} className={inputCls}>
                  {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="الإمارة">
                <select value={form.emirate || ""} onChange={f("emirate")} className={inputCls}>
                  <option value="">اختر الإمارة...</option>
                  {["أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </Field>
              <Field label="المحكمة المختصة">
                <select value={form.court || COURTS[0]} onChange={f("court")} className={inputCls}>
                  {COURTS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="الدائرة القضائية / القاضي المشرف">
              <input value={form.judge || ""} onChange={f("judge")} placeholder="مثال: دائرة الجنايات الأولى - القاضي محمد" className={inputCls} />
            </Field>
            <Field label="موضوع الدعوى والطلبات">
              <textarea value={form.subject || ""} onChange={f("subject")} rows={2} placeholder="ملخص وقائع الدعوى..." className={inputCls} />
            </Field>
            <Field label="قالب المهام التلقائية (اختياري)">
              <select value={form.taskTemplate || ""} onChange={f("taskTemplate")} className={inputCls}>
                <option value="">لا يوجد (عدم إضافة مهام تلقائية)</option>
                {TASK_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="الأتعاب المتفق عليها (د.إ)">
              <input type="number" value={form.fee || ""} onChange={f("fee")} placeholder="0.00" className={inputCls} />
            </Field>
            <button
              onClick={() => {
                if (!form.number || !form.clientId || !form.type) return alert("أكمل البيانات الأساسية");
                if (form.id) {
                    logAuditAction("UPDATE", "القضايا", \`قضية رقم \${form.number}\`, \`تعديل بيانات القضية بشكل شامل\`, form.id);
                    setCases(cases.map(c => c.id === form.id ? { ...c, ...form } : c));
                } else {
                    const newCase = {
                      id: Date.now(),
                      number: form.number,
                      clientId: Number(form.clientId),
                      opponent: form.opponent || "غير محدد",
                      stage: form.stage || "الابتدائية",
                      status: form.status || "متداولة",
                      type: form.type || CASE_TYPES[0],
                      emirate: form.emirate || "دبي",
                      court: form.court || COURTS[0],
                      judge: form.judge || "",
                      subject: form.subject || "",
                      openDate: new Date().toISOString(),
                      fee: Number(form.fee) || 0,
                    };
                    logAuditAction("CREATE", "إدارة القضايا", \`قضية جديدة: \${newCase.number}\`, \`تم قيد قضية جديدة للموكل \${clientName(newCase.clientId)}\`, newCase.id);
                    setCases([...cases, newCase]);
                }
                setModal(null);
              }}
              className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700"
            >
              حفظ بيانات القضية
            </button>
          </div>
        </Modal>
      )}`;

if (code.includes('onChange={f("opponent")} placeholder="اسم المدعى عليه أو الخصم"') && !code.includes('value={form.opponent || ""}')) {
    let startIdx = code.indexOf('{modal === "case" && (');
    if (startIdx > -1) {
        let endIdx = code.indexOf('</Modal>', startIdx) + 8;
        endIdx = code.indexOf(')}', endIdx) + 2;
        let original = code.substring(startIdx, endIdx);
        code = code.replace(original, newCaseModal);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Updated case modal successfully!");
    }
} else {
    console.log("Case modal already updated or not found exactly.");
}
