const fs = require('fs');
let code = fs.readFileSync('src/OfficialLetterComposer.tsx', 'utf8');

if (!code.includes('import ReactQuill')) {
    code = code.replace(
        'import {',
        `import ReactQuill from "react-quill";\nimport "react-quill/dist/quill.snow.css";\nimport {`
    );
}

// Add the template HTML
const templateStr = `
const COURT_MEMO_TEMPLATE = \`
<p class="ql-align-right"><strong>لدي مقام محكمة عجمان الابتدائية الموقرة</strong></p>
<p class="ql-align-right"><strong>الدعوى رقم:</strong> 514/2026 تجاري</p>
<p class="ql-align-right"><strong>التقرير النهائي للخبير ومذكرة ختامية</strong></p>
<p><br></p>
<p class="ql-align-left"><strong>في التعقيب على</strong></p>
<p><br></p>
<p class="ql-align-right"><strong>مقدمة من :</strong> المدعى عليها / شاما خالد عوان خالد بشير - (باكستانية الجنسية)</p>
<p class="ql-align-right"><strong>هوية رقم :</strong> [رقم الهوية]</p>
<p class="ql-align-right"><strong>بوكالة المحامي/</strong> سعود احمد الشحي</p>
<p><br></p>
<p class="ql-align-right"><strong>ضـــــــــــــــــــــــد</strong></p>
<p class="ql-align-right"><strong>المدعي :</strong> بنك أبوظبي الأول (ش. م .ع)</p>
<p><br></p>
<p class="ql-align-center"><strong><u>الموضــــــــــــــــــــــــــــــوع</u></strong></p>
<p class="ql-align-center"><strong>مذكرة تعقيبيه وختامية على تقرير الخبرة المودع بتاريخ 4/6/2026</strong></p>
<p><br></p>
<p class="ql-align-right"><strong><u>التعقيــــــــــــب</u></strong></p>
<p class="ql-align-justify">نستهل تعقيبنا علي التقرير النهائي وذلك في ضوء ما تضمنه من نتائج وما انتهي اليه من اراء مع تبني بما ورد به من عناصر اصابت صحيح الواقع واعتراضنا علي ما شابه من قصور في استجلاء الحقيقة الكاملة للنزاع.</p>
<p><br></p>
<p class="ql-align-right"><strong>أولا : نقاط التبني والتأييد التي جاءت بالتقرير :</strong></p>
<p class="ql-align-justify">1- في بيان التعاملات بين الطرفين ولبيان المبالغ الممنوحة للمدعى عليه وبيان نوعها ومستنداتها وبيان نوع وقيمة التسهيلات...</p>
\`;
`;

if (!code.includes('COURT_MEMO_TEMPLATE')) {
    code = code.replace('const DEFAULT_BODY_HTML =', templateStr + '\nconst DEFAULT_BODY_HTML =');
}

// Inject Quill CSS into the print iframe
const printCss = `
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .ql-align-center { text-align: center; }
  .ql-align-right { text-align: right; }
  .ql-align-justify { text-align: justify; }
  .ql-align-left { text-align: left; }
  .ql-direction-rtl { direction: rtl; }
  .letter-body p { margin-bottom: 4mm; }
  .letter-body strong { font-weight: bold; }
  .letter-body u { text-decoration: underline; }
`;

code = code.replace(
    /print-color-adjust: exact;\n\s*\}/g,
    printCss
);


// Replace the contentEditable div with ReactQuill
const quillComponent = `
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-600 block">
                نص الخطاب (قابل للتنسيق والنسخ من الوورد)
              </span>
              <button
                onClick={() => setBodyHtml(COURT_MEMO_TEMPLATE)}
                className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition font-bold"
              >
                إدراج نموذج مذكرة محكمة
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden" style={{ fontFamily: LETTER_FONT_STACK }}>
              <ReactQuill
                theme="snow"
                value={bodyHtml}
                onChange={setBodyHtml}
                modules={{
                  toolbar: [
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'align': [] }],
                    [{ 'direction': 'rtl' }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                  ],
                }}
                formats={[
                  'size',
                  'bold', 'italic', 'underline', 'strike',
                  'align', 'direction',
                  'list', 'bullet', 'indent',
                  'color', 'background'
                ]}
                style={{ height: '350px', direction: 'rtl', textAlign: 'right' }}
              />
            </div>
`;

// Find the contentEditable block to replace
const editableRegex = /<span className="mb-1 block text-xs font-bold text-slate-600">\s*نص الخطاب \(قابل للتنسيق\)\s*<\/span>[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(editableRegex, quillComponent);

// Also remove the old bodyRef usage
code = code.replace(/bodyHtml:\s*bodyRef\.current\?\.innerHTML\s*\|\|\s*bodyHtml/g, 'bodyHtml');
code = code.replace(/if\s*\(bodyRef\.current\)\s*bodyRef\.current\.innerHTML\s*=\s*DEFAULT_BODY_HTML;/g, '');

fs.writeFileSync('src/OfficialLetterComposer.tsx', code);
console.log('Quill applied');
