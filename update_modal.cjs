const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldModal = `              <Field label="القضية المرتبطة">
                <select onChange={f("caseId")} className={inputCls}>
                  <option value="">مستند غير مرتبط بقضية</option>
                  {cases.map((c) => <option key={c.id} value={c.id}>{c.number}</option>)}
                </select>
              </Field>
            </div>
            <button onClick={saveDoc} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ المستند الأرشيفي</button>
          </div>
        </Modal>
      )}
      {modal === "poa" && (`;

const newModal = `              <Field label="القضية المرتبطة">
                <select onChange={f("caseId")} className={inputCls}>
                  <option value="">مستند غير مرتبط بقضية</option>
                  {cases.map((c) => <option key={c.id} value={c.id}>{c.number}</option>)}
                </select>
              </Field>
            </div>
            <Field label="ملف المستند (سيتم تشفيره قبل التخزين)">
              <input type="file" onChange={(e) => setForm({ ...form, fileObj: e.target.files?.[0] })} className={inputCls} />
            </Field>
            <button disabled={docUploading} onClick={saveDoc} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700 disabled:opacity-50">
              {docUploading ? "جاري التشفير والرفع..." : "حفظ المستند الأرشيفي"}
            </button>
          </div>
        </Modal>
      )}
      {modal === "poa" && (`;

if (content.includes(oldModal)) {
    content = content.replace(oldModal, newModal);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Modal updated successfully.");
} else {
    console.log("Old modal text not found!");
}
