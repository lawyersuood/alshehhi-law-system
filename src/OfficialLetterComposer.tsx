
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Printer,
  FileText,
  RotateCcw,
  Eye,
  PenLine,
  UploadCloud,
  ImageIcon,
  Trash2,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const LETTERHEAD_LAYOUT = {
  headerMm: 46,
  footerMm: 20,
  sideMm: 18,
  pageWidthMm: 210,
  pageHeightMm: 297,
};

const LETTERHEAD_STORAGE_KEY = "official_letterhead_a4_full";

const LETTER_FONT_STACK =
  "'Amiri', 'Traditional Arabic', 'Sakkal Majalla', 'Times New Roman', serif";
const AMIRI_FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap";

const todayArabic = () =>
  new Date().toLocaleDateString("ar-AE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const autoRefNo = () => {
  const year = new Date().getFullYear();
  const rnd = Math.floor(100 + Math.random() * 900);
  return "REF-" + year + "-" + rnd;
};

function loadLetterheadImage(): string | null {
  try {
    return localStorage.getItem(LETTERHEAD_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function saveLetterheadImage(dataUrl: string) {
  try {
    localStorage.setItem(LETTERHEAD_STORAGE_KEY, dataUrl);
  } catch (e) {
    console.error("Letterhead save error:", e);
  }
}

export interface OfficialLetterData {
  refNo: string;
  date: string;
  recipient: string;
  subject: string;
  bodyHtml: string;
  signName: string;
  signTitle: string;
}

function cropImageDataUrl(
  dataUrl: string,
  cropTopMm: number,
  cropBottomMm: number,
  pageHeightMm: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.naturalHeight / pageHeightMm; // بكسل لكل مليمتر
      const cropTopPx = Math.round(cropTopMm * scale);
      const cropHeightPx = Math.round((cropBottomMm - cropTopMm) * scale);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = cropHeightPx;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("no ctx")); return; }
      ctx.drawImage(
        img,
        0, cropTopPx, img.naturalWidth, cropHeightPx,
        0, 0, img.naturalWidth, cropHeightPx
      );
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = dataUrl;
  });
}

function buildPrintDocument(
  data: OfficialLetterData,
  headerStripImg: string,
  footerStripImg: string,
  signatureImg?: string | null,
  stampImg?: string | null
): string {
  const { headerMm, footerMm, sideMm, pageWidthMm } = LETTERHEAD_LAYOUT;
  const sigStampHtml = (signatureImg || stampImg)
    ? "<div class=\"sig-stamp-wrap\">" +
      (stampImg ? "<img class=\"stamp-img\" src=\"" + stampImg + "\" />" : "") +
      (signatureImg ? "<img class=\"signature-img\" src=\"" + signatureImg + "\" />" : "") +
      "</div>"
    : "";
  return "<!DOCTYPE html>\n" +
    "<html dir=\"rtl\" lang=\"ar\">\n" +
    "<head>\n" +
    "<meta charset=\"utf-8\">\n" +
    "<title>" + (data.subject || "خطاب رسمي") + " — " + data.refNo + "</title>\n" +
    "<link rel=\"stylesheet\" href=\"" + AMIRI_FONT_LINK + "\">\n" +
    "<style>\n" +
    "  @page { size: A4; margin: 0; }\n" +
    "  * { margin: 0; padding: 0; box-sizing: border-box; }\n" +
    "  html, body { width: " + pageWidthMm + "mm; }\n" +
    "  body {\n" +
    "    font-family: " + LETTER_FONT_STACK + ";\n" +
    "    font-size: 13pt;\n" +
    "    line-height: 2;\n" +
    "    color: #1a1a1a;\n" +
    "  }\n" +
    "  table.page-frame { width: 100%; border-collapse: collapse; }\n" +
    "  thead td, tfoot td { padding: 0; }\n" +
    "  .header-strip-img { display: block; width: " + pageWidthMm + "mm; height: " + headerMm + "mm; }\n" +
    "  .footer-strip-img { display: block; width: " + pageWidthMm + "mm; height: " + footerMm + "mm; }\n" +
    "  .letter-content { padding: 0 " + sideMm + "mm; text-align: justify; }\n" +
    "  .letter-content p { margin-bottom: 4mm; }\n" +
    "  .meta-row {\n" +
    "    display: flex; justify-content: space-between;\n" +
    "    margin-bottom: 6mm; font-size: 12pt; font-weight: 700;\n" +
    "  }\n" +
    "  .recipient-line { font-weight: 700; margin-bottom: 4mm; }\n" +
    "  .subject-line {\n" +
    "    font-weight: 700; text-decoration: underline;\n" +
    "    text-underline-offset: 3pt; margin-bottom: 5mm;\n" +
    "  }\n" +
    "  .signature {\n" +
    "    margin-top: 12mm; text-align: left;\n" +
    "    padding-left: 8mm; page-break-inside: avoid;\n" +
    "  }\n" +
    "  .signature .sig-name { font-weight: 700; font-size: 13.5pt; }\n" +
    "  .sig-stamp-wrap { position: relative; height: 26mm; width: 55mm; margin-bottom: 2mm; }\n" +
    "  .stamp-img { position: absolute; top: 0; right: 6mm; height: 26mm; width: 26mm; object-fit: contain; opacity: 0.9; transform: rotate(-6deg); }\n" +
    "  .signature-img { position: absolute; bottom: 1mm; left: 0; height: 16mm; object-fit: contain; }\n" +
    "  .ql-align-center { text-align: center; }\n" +
    "  .ql-align-right { text-align: right; }\n" +
    "  .ql-align-justify { text-align: justify; }\n" +
    "  .ql-align-left { text-align: left; }\n" +
    "  .ql-direction-rtl { direction: rtl; }\n" +
    "  .letter-body p { margin-bottom: 4mm; }\n" +
    "  .letter-body strong { font-weight: bold; }\n" +
    "  .letter-body u { text-decoration: underline; }\n" +
    "</style>\n" +
    "</head>\n" +
    "<body>\n" +
    "  <table class=\"page-frame\">\n" +
    "    <thead><tr><td><img class=\"header-strip-img\" src=\"" + headerStripImg + "\" /></td></tr></thead>\n" +
    "    <tbody><tr><td>\n" +
    "      <div class=\"letter-content\">\n" +
    "        <div class=\"meta-row\">\n" +
    "          <span>الرقم المرجعي: " + data.refNo + "</span>\n" +
    "          <span>التاريخ: " + data.date + "</span>\n" +
    "        </div>\n" +
    "        " + (data.recipient ? "<p class=\"recipient-line\">" + data.recipient + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;المحترمون</p>" : "") + "\n" +
    "        " + (data.subject ? "<p class=\"subject-line\">الموضوع: " + data.subject + "</p>" : "") + "\n" +
    "        <div class=\"letter-body\">" + data.bodyHtml + "</div>\n" +
    "        <div class=\"signature\">\n" +
    "          " + sigStampHtml + "\n" +
    "          <p class=\"sig-name\">" + data.signName + "</p>\n" +
    "          <p>" + data.signTitle + "</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </td></tr></tbody>\n" +
    "    <tfoot><tr><td><img class=\"footer-strip-img\" src=\"" + footerStripImg + "\" /></td></tr></tfoot>\n" +
    "  </table>\n" +
    "</body>\n" +
    "</html>";
}

export async function printOfficialLetter(
  data: OfficialLetterData,
  signatureImg?: string | null,
  stampImg?: string | null
) {
  const letterheadImg = loadLetterheadImage();
  if (!letterheadImg) {
    alert("يرجى أولاً رفع صورة الورق الرسمي من شاشة الخطابات الرسمية.");
    return;
  }

  const { headerMm, footerMm, pageHeightMm } = LETTERHEAD_LAYOUT;
  let headerStripImg: string;
  let footerStripImg: string;
  try {
    headerStripImg = await cropImageDataUrl(letterheadImg, 0, headerMm, pageHeightMm);
    footerStripImg = await cropImageDataUrl(letterheadImg, pageHeightMm - footerMm, pageHeightMm, pageHeightMm);
  } catch (e) {
    console.error("Letterhead crop error:", e);
    alert("تعذّر تجهيز صورة الورق الرسمي للطباعة. حاول رفعها من جديد.");
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(buildPrintDocument(data, headerStripImg, footerStripImg, signatureImg, stampImg));
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => iframe.remove(), 60000);
    }
  }, 700);
}

const COURT_MEMO_TEMPLATE = `
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
`;

const DEFAULT_BODY_HTML = "<p>تحية طيبة وبعد،</p>\n<p>بالإشارة إلى الموضوع أعلاه، نود إحاطتكم علماً بأن ...</p>\n<p>وتفضلوا بقبول فائق الاحترام والتقدير،</p>";

interface Props {
  defaultSignName?: string;
  defaultSignTitle?: string;
  /** هل يملك المستخدم الحالي صلاحية تعديل الورق الرسمي (رفع/حذف الصورة)؟ افتراضياً true للتوافق مع الاستخدام المستقل لهذا المكوّن. */
  canManageAssets?: boolean;
  /** هل يملك المستخدم الحالي صلاحية إدراج التوقيع والختم المعتمدين عند تصدير الخطاب؟ */
  canUseSignatureStamp?: boolean;
  /** صورة التوقيع المعتمدة من قسم الهوية الرسمية المحمي (اختيارية). */
  signatureImg?: string | null;
  /** صورة الختم المعتمدة من قسم الهوية الرسمية المحمي (اختيارية). */
  stampImg?: string | null;
  /** استدعاء اختياري لتسجيل عمليات تغيير الورق الرسمي أو طباعة/تصدير خطاب في سجل التدقيق. */
  onUsageLog?: (action: string, details: string) => void;
}

export default function OfficialLetterComposer({
  defaultSignName = "مكتب سعود أحمد الشحي",
  defaultSignTitle = "للمحاماة والاستشارات القانونية",
  canManageAssets = true,
  canUseSignatureStamp = false,
  signatureImg = null,
  stampImg = null,
  onUsageLog,
}: Props) {
  const [letterheadImg, setLetterheadImg] = useState<string | null>(
    loadLetterheadImage
  );
  const [refNo, setRefNo] = useState(autoRefNo);
  const [date, setDate] = useState(todayArabic());
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [signName, setSignName] = useState(defaultSignName);
  const [signTitle, setSignTitle] = useState(defaultSignTitle);

  const [bodyHtml, setBodyHtml] = useState(DEFAULT_BODY_HTML);

  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.6);
  const A4_PX_WIDTH = 794;

  const recalcScale = useCallback(() => {
    const w = previewWrapRef.current?.clientWidth || 700;
    setPreviewScale(Math.min(1, (w - 16) / A4_PX_WIDTH));
  }, []);

  useEffect(() => {
    recalcScale();
    window.addEventListener("resize", recalcScale);
    return () => window.removeEventListener("resize", recalcScale);
  }, [recalcScale]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = AMIRI_FONT_LINK;
    document.head.appendChild(link);
  }, []);

  const handleUploadLetterhead = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canManageAssets) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      saveLetterheadImage(dataUrl);
      setLetterheadImg(dataUrl);
      onUsageLog?.("رفع/تغيير صورة الورق الرسمي (A4)", "برفع أو تغيير صورة الورق الرسمي الكاملة (A4) في محرر الخطابات");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLetterhead = () => {
    if (!canManageAssets) return;
    try {
      localStorage.removeItem(LETTERHEAD_STORAGE_KEY);
    } catch (e) {}
    setLetterheadImg(null);
    onUsageLog?.("حذف صورة الورق الرسمي (A4)", "بحذف صورة الورق الرسمي الكاملة (A4) من محرر الخطابات");
  };

  const includeSigStamp = canUseSignatureStamp && Boolean(signatureImg || stampImg);

  const handleExport = () => {
    onUsageLog?.(
      `طباعة/تصدير خطاب رقم ${refNo}`,
      `باستخدام الورق الرسمي${includeSigStamp ? " والتوقيع والختم المعتمدين" : ""} لطباعة أو تصدير الخطاب رقم ${refNo}${subject ? ` (الموضوع: ${subject})` : ""}`
    );
    printOfficialLetter(
      {
        refNo,
        date,
        recipient,
        subject,
        bodyHtml: bodyHtml,
        signName,
        signTitle,
      },
      includeSigStamp ? signatureImg : null,
      includeSigStamp ? stampImg : null
    );
  };

  const handleReset = () => {
    setRefNo(autoRefNo());
    setDate(todayArabic());
    setRecipient("");
    setSubject("");
    setBodyHtml(DEFAULT_BODY_HTML);
  };

  const { headerMm, footerMm, sideMm } = LETTERHEAD_LAYOUT;
  const mmToPx = (mm: number) => (mm / 210) * A4_PX_WIDTH;

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition";

  return (
    <div dir="rtl" className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                letterheadImg
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <ImageIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                صورة الورق الرسمي (صفحة A4 كاملة)
              </p>
              <p className="text-xs text-slate-500">
                {letterheadImg
                  ? "✅ الورق الرسمي مرفوع ومحفوظ — جاهز للاستخدام"
                  : "ارفع ملف الورق الرسمي بصيغة JPG أو PNG (مرة واحدة فقط)"}
              </p>
            </div>
          </div>
          {canManageAssets ? (
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0c4a47] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#073331] transition">
                <UploadCloud size={15} />
                {letterheadImg ? "استبدال الصورة" : "رفع الورق الرسمي"}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleUploadLetterhead}
                />
              </label>
              {letterheadImg && (
                <button
                  onClick={handleRemoveLetterhead}
                  className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={14} /> حذف
                </button>
              )}
            </div>
          ) : (
            <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-500">
              🔒 محمي — للمدير أو المصرح له فقط
            </span>
          )}
        </div>
        <p className="mt-3 text-[11px] font-semibold flex items-center gap-1.5">
          {includeSigStamp ? (
            <span className="text-emerald-700">✅ سيتم إدراج التوقيع والختم الرسمي المعتمد تلقائياً عند التصدير</span>
          ) : canUseSignatureStamp ? (
            <span className="text-slate-400">لم يتم اعتماد صورة توقيع أو ختم بعد — راجع قسم "الهوية الرسمية والأختام"</span>
          ) : (
            <span className="text-slate-400">لا تملك صلاحية إدراج التوقيع والختم — راجع مدير النظام إذا لزم الأمر</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <PenLine size={18} className="text-amber-600" />
              إنشاء خطاب على الورق الرسمي
            </h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              <RotateCcw size={13} /> تفريغ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">
                الرقم المرجعي
              </span>
              <input
                className={inputCls}
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">
                التاريخ
              </span>
              <input
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">
              المرسل إليه
            </span>
            <input
              className={inputCls}
              placeholder="مثال: السادة / شركة الخليج للتجارة العامة ذ.م.م"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">
              موضوع الخطاب
            </span>
            <input
              className={inputCls}
              placeholder="مثال: إنذار قانوني بالسداد"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">
                اسم الموقّع
              </span>
              <input
                className={inputCls}
                value={signName}
                onChange={(e) => setSignName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">
                الصفة
              </span>
              <input
                className={inputCls}
                value={signTitle}
                onChange={(e) => setSignTitle(e.target.value)}
              />
            </label>
          </div>

          <button
            onClick={handleExport}
            disabled={!letterheadImg}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c4a47] py-3.5 text-sm font-black text-white shadow-md transition hover:bg-[#073331] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={17} />
            تصدير / طباعة PDF بجودة عالية
          </button>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <FileText size={13} />
            في نافذة الطباعة اختر «حفظ بتنسيق PDF» — النص يبقى نصاً حقيقياً
            قابلاً للنسخ، والورق الرسمي بجودته الأصلية الكاملة.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-stone-100 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Eye size={16} className="text-amber-600" /> معاينة حية (مطابقة
            للناتج النهائي)
          </h3>
          <div ref={previewWrapRef} className="overflow-hidden">
            <div
              style={{
                width: A4_PX_WIDTH,
                height: A4_PX_WIDTH * (297 / 210),
                transform: "scale(" + previewScale + ")",
                transformOrigin: "top right",
              }}
              className="relative bg-white shadow-lg"
            >
              {letterheadImg ? (
                <img
                  src={letterheadImg}
                  alt=""
                  className="absolute inset-0 h-full w-full"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
                  <ImageIcon size={60} />
                  <p className="text-lg font-bold">
                    ارفع صورة الورق الرسمي أولاً
                  </p>
                </div>
              )}
              <div
                dir="rtl"
                className="absolute overflow-hidden text-justify"
                style={{
                  top: mmToPx(headerMm),
                  bottom: mmToPx(footerMm),
                  right: mmToPx(sideMm),
                  left: mmToPx(sideMm),
                  fontFamily: LETTER_FONT_STACK,
                  fontSize: 15.5,
                  lineHeight: 2,
                  color: "#1a1a1a",
                }}
              >
                <div className="mb-4 flex justify-between text-[14px] font-bold">
                  <span>الرقم المرجعي: {refNo}</span>
                  <span>التاريخ: {date}</span>
                </div>
                {recipient && (
                  <p className="mb-3 font-bold">
                    {recipient}
                    <span className="inline-block w-10" />
                    المحترمون
                  </p>
                )}
                {subject && (
                  <p className="mb-4 font-bold underline underline-offset-4">
                    الموضوع: {subject}
                  </p>
                )}
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                <div className="mt-8 pl-6 text-left">
                  {includeSigStamp && (
                    <div className="relative inline-block h-16 w-36 mb-1">
                      {stampImg && (
                        <img src={stampImg} alt="ختم" className="absolute top-0 right-2 h-16 w-16 object-contain opacity-90 -rotate-6" />
                      )}
                      {signatureImg && (
                        <img src={signatureImg} alt="توقيع" className="absolute bottom-0 left-0 h-10 object-contain" />
                      )}
                    </div>
                  )}
                  <p className="font-bold">{signName}</p>
                  <p>{signTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
