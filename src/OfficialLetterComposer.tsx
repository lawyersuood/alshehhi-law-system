
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Printer,
  FileText,
  RotateCcw,
  Eye,
  PenLine,
  ImageIcon,
} from "lucide-react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// معالج لصق إضافي يلتقط التنسيق (عريض/مائل/تسطير/شطب/محاذاة) من محتوى HTML
// الملصق من Word أو Google Docs عندما يكون هذا التنسيق معتمداً على style مضمّن
// في span/p/div (نمط شائع جداً عند اللصق من Google Docs) بدلاً من وسوم دلالية
// مثل b/i/u التي يتعرف عليها المحرر تلقائياً فقط. يعمل هذا كطبقة احتياطية إضافية
// إلى جانب معالجة Quill الداخلية، ولا يُغيّر أي سلوك عند غياب أنماط مضمّنة.
function matchPastedInlineStyle(node: unknown, delta: any) {
  try {
    const el = node as HTMLElement;
    const style = (el?.getAttribute && el.getAttribute("style")) || "";
    if (!style) return delta;
    const DeltaCtor = (Quill as any).import("delta");
    if (!DeltaCtor) return delta;
    const formats: Record<string, unknown> = {};
    if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) formats.bold = true;
    if (/font-style\s*:\s*italic/i.test(style)) formats.italic = true;
    if (/text-decoration[a-z-]*\s*:\s*[^;]*underline/i.test(style)) formats.underline = true;
    if (/text-decoration[a-z-]*\s*:\s*[^;]*line-through/i.test(style)) formats.strike = true;
    const alignMatch = style.match(/text-align\s*:\s*(right|left|center|justify)/i);
    if (alignMatch) formats.align = alignMatch[1].toLowerCase();
    if (Object.keys(formats).length === 0) return delta;
    return delta.compose(new DeltaCtor().retain(delta.length(), formats));
  } catch {
    // في حال أي خطأ غير متوقع، لا نُفسد اللصق — نُعيد المحتوى كما وصل افتراضياً
    return delta;
  }
}

const LETTERHEAD_LAYOUT = {
  headerMm: 46,
  footerMm: 20,
  sideMm: 18,
  pageWidthMm: 210,
  pageHeightMm: 297,
};

const LETTER_FONT_STACK =
  "'Amiri', 'Traditional Arabic', 'Sakkal Majalla', 'Times New Roman', serif";
const AMIRI_FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap";

// أصناف Quill (ql-align-*, ql-size-*, ql-indent-*) لا تُنسّق تلقائياً إلا داخل
// محرر Quill نفسه، لأن ورقة أنماط المحرر (quill.snow.css) تشترط وجود صنف الأب
// ql-editor في كل قواعدها (مثال: ".ql-editor .ql-align-center"). هذا يعني أن نفس
// النص المنسَّق (توسيط/محاذاة/حجم خط/مسافة بادئة) كان يظهر بشكل صحيح داخل مربع
// التحرير نفسه، لكنه يفقد تنسيقه في "المعاينة الحية" لأنها تُعرض خارج محرر Quill.
// نعيد تعريف هذه الأصناف هنا صراحةً (مطابقةً لما هو مُعرَّف بالفعل في مستند
// الطباعة) ليتطابق ما يظهر في المعاينة مع ما يظهر عند التصدير فعلياً.
const RICH_TEXT_DISPLAY_CSS = `
.ollc-rich-body p { margin-bottom: 15.12px; }
.ollc-rich-body strong, .ollc-rich-body b { font-weight: bold; }
.ollc-rich-body em, .ollc-rich-body i { font-style: italic; }
.ollc-rich-body u { text-decoration: underline; }
.ollc-rich-body s, .ollc-rich-body strike { text-decoration: line-through; }
.ollc-rich-body .ql-align-center { text-align: center; }
.ollc-rich-body .ql-align-right { text-align: right; }
.ollc-rich-body .ql-align-left { text-align: left; }
.ollc-rich-body .ql-align-justify { text-align: justify; }
.ollc-rich-body .ql-direction-rtl { direction: rtl; text-align: inherit; }
.ollc-rich-body .ql-size-small { font-size: 0.75em; }
.ollc-rich-body .ql-size-large { font-size: 1.5em; }
.ollc-rich-body .ql-size-huge { font-size: 2.5em; }
.ollc-rich-body .ql-indent-1 { padding-inline-start: 3em; }
.ollc-rich-body .ql-indent-2 { padding-inline-start: 6em; }
.ollc-rich-body .ql-indent-3 { padding-inline-start: 9em; }
.ollc-rich-body .ql-indent-4 { padding-inline-start: 12em; }
.ollc-rich-body .ql-indent-5 { padding-inline-start: 15em; }
.ollc-rich-body .ql-indent-6 { padding-inline-start: 18em; }
.ollc-rich-body .ql-indent-7 { padding-inline-start: 21em; }
.ollc-rich-body .ql-indent-8 { padding-inline-start: 24em; }
`;

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

export interface OfficialLetterData {
  refNo: string;
  date: string;
  recipient: string;
  subject: string;
  bodyHtml: string;
  signName: string;
  signTitle: string;
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
    "  .ql-direction-rtl { direction: rtl; text-align: inherit; }\n" +
    // ملاحظة: أصناف Quill هذه (ql-size-*, ql-indent-*) لا تُنسّق تلقائياً إلا داخل
    // محرر Quill نفسه (تتطلب أصلاً بصنف ql-editor)، لذا نُعيد تعريفها هنا صراحةً
    // ليعمل حجم الخط والمسافة البادئة (indent) بشكل صحيح في الملف المطبوع أيضاً.
    "  .ql-size-small { font-size: 0.75em; }\n" +
    "  .ql-size-large { font-size: 1.5em; }\n" +
    "  .ql-size-huge { font-size: 2.5em; }\n" +
    "  .ql-indent-1 { padding-inline-start: 3em; }\n" +
    "  .ql-indent-2 { padding-inline-start: 6em; }\n" +
    "  .ql-indent-3 { padding-inline-start: 9em; }\n" +
    "  .ql-indent-4 { padding-inline-start: 12em; }\n" +
    "  .ql-indent-5 { padding-inline-start: 15em; }\n" +
    "  .ql-indent-6 { padding-inline-start: 18em; }\n" +
    "  .ql-indent-7 { padding-inline-start: 21em; }\n" +
    "  .ql-indent-8 { padding-inline-start: 24em; }\n" +
    "  .letter-body p { margin-bottom: 4mm; }\n" +
    "  .letter-body strong { font-weight: bold; }\n" +
    "  .letter-body u { text-decoration: underline; }\n" +
    "  .letter-body em { font-style: italic; }\n" +
    "  .letter-body s { text-decoration: line-through; }\n" +
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
  headerImg?: string | null,
  footerImg?: string | null,
  signatureImg?: string | null,
  stampImg?: string | null
) {
  if (!headerImg || !footerImg) {
    alert(
      "يرجى أولاً اعتماد صورتي ترويسة وتذييل الورق الرسمي من قسم \"الهوية الرسمية والأختام\" المحمي في القائمة الجانبية."
    );
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(buildPrintDocument(data, headerImg, footerImg, signatureImg, stampImg));
  doc.close();

  // ننتظر اكتمال تحميل صور الترويسة/التذييل/التوقيع والختم فعلياً (بدل مهلة
  // ثابتة قد تسبق اكتمال التحميل) حتى لا تُطبع الصفحة قبل استقرار تخطيطها —
  // هذا هو سبب ظهور صورة الترويسة "عائمة" في منتصف الصفحة الأولى سابقاً.
  const waitForImages = () => {
    const imgs = Array.from(doc.images || []);
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
      )
    );
  };

  // ننتظر أيضاً اكتمال تحميل خط "Amiri" الخارجي حتى لا يتغيّر ارتفاع/التفاف
  // النص بعد حساب المتصفح لتقسيم الصفحات في نافذة الطباعة.
  const waitForFonts = async () => {
    try {
      const fontsApi = (doc as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
      if (fontsApi?.ready) {
        await fontsApi.ready;
      }
    } catch {
      // تجاهل — بعض المتصفحات القديمة لا تدعم واجهة document.fonts
    }
  };

  const waitForLayoutSettle = () =>
    new Promise<void>((resolve) => {
      const win = iframe.contentWindow;
      if (win?.requestAnimationFrame) {
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
      } else {
        setTimeout(resolve, 60);
      }
    });

  await Promise.race([
    Promise.all([waitForImages(), waitForFonts()]),
    // سقف أمان أقصى: لا ننتظر إلى ما لا نهاية إن تعذّر تحميل عنصر ما
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);
  await waitForLayoutSettle();
  // مهلة صغيرة إضافية لضمان استقرار التخطيط النهائي قبل استدعاء الطباعة
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  } finally {
    setTimeout(() => iframe.remove(), 60000);
  }
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

/** تمثّل صفحة واحدة ضمن معاينة الخطاب متعددة الصفحات: هل تظهر بها ترويسة
 * المعلومات (الرقم المرجعي/المرسل إليه/الموضوع) — تظهر فقط في الصفحة الأولى،
 * جزء من نص الخطاب المخصّص لهذه الصفحة تحديداً، وهل تظهر بها كتلة التوقيع —
 * تظهر فقط في آخر صفحة يتّسع لها التوقيع. */
interface LetterPage {
  showHeading: boolean;
  bodyHtml: string;
  showSignature: boolean;
}

interface Props {
  defaultSignName?: string;
  defaultSignTitle?: string;
  /** هل يملك المستخدم الحالي صلاحية إدارة الورق الرسمي (تُستخدم فقط لتخصيص رسالة الإرشاد هنا؛ الرفع والحذف الفعلي يتمّان حصراً من قسم "الهوية الرسمية والأختام" المحمي). */
  canManageAssets?: boolean;
  /** هل يملك المستخدم الحالي صلاحية إدراج التوقيع والختم المعتمدين عند تصدير الخطاب؟ */
  canUseSignatureStamp?: boolean;
  /** صورة ترويسة الورق الرسمي المعتمدة من قسم الهوية الرسمية المحمي (مصدر موحّد لكل النظام). */
  headerImg?: string | null;
  /** صورة تذييل الورق الرسمي المعتمدة من قسم الهوية الرسمية المحمي (مصدر موحّد لكل النظام). */
  footerImg?: string | null;
  /** صورة التوقيع المعتمدة من قسم الهوية الرسمية المحمي (اختيارية). */
  signatureImg?: string | null;
  /** صورة الختم المعتمدة من قسم الهوية الرسمية المحمي (اختيارية). */
  stampImg?: string | null;
  /** استدعاء اختياري لتسجيل عمليات طباعة/تصدير خطاب في سجل التدقيق. */
  onUsageLog?: (action: string, details: string) => void;
}

export default function OfficialLetterComposer({
  defaultSignName = "مكتب سعود أحمد الشحي",
  defaultSignTitle = "للمحاماة والاستشارات القانونية",
  canManageAssets = true,
  canUseSignatureStamp = false,
  headerImg = null,
  footerImg = null,
  signatureImg = null,
  stampImg = null,
  onUsageLog,
}: Props) {
  const hasLetterhead = Boolean(headerImg && footerImg);
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
      headerImg,
      footerImg,
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

  // ---------- معاينة متعددة الصفحات ----------
  // المعاينة السابقة كانت تعرض صفحة واحدة بارتفاع ثابت مع overflow-hidden،
  // ما كان "يقصّ" أي محتوى يتجاوز صفحة واحدة دون أي إشارة للمستخدم. الحل هنا:
  // نقيس محتوى الخطاب الفعلي في حاوية مخفية بنفس عرض/خط/تباعد المعاينة، ثم
  // نوزّعه على صفحات وفق المساحة المتاحة الحقيقية بين الترويسة والتذييل،
  // ونعرض صفحة واحدة في كل مرة مع أزرار تنقّل بين الصفحات.
  const contentWidthPx = A4_PX_WIDTH - 2 * mmToPx(sideMm);
  const availableContentHeightPx =
    A4_PX_WIDTH * (297 / 210) - mmToPx(headerMm) - mmToPx(footerMm);

  const headingMeasureRef = useRef<HTMLDivElement>(null);
  const bodyMeasureRef = useRef<HTMLDivElement>(null);
  const signatureMeasureRef = useRef<HTMLDivElement>(null);

  const [letterPages, setLetterPages] = useState<LetterPage[]>([
    { showHeading: true, bodyHtml, showSignature: true },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const paginate = async () => {
      try {
        const fontsApi = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
        if (fontsApi?.ready) {
          await fontsApi.ready;
        }
      } catch {
        // تجاهل — بعض المتصفحات القديمة لا تدعم واجهة document.fonts
      }
      // إطار إضافي لضمان اكتمال التخطيط بعد أي تغيّر بالخط أو المحتوى
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      if (cancelled) return;

      const headingEl = headingMeasureRef.current;
      const bodyEl = bodyMeasureRef.current;
      const signatureEl = signatureMeasureRef.current;
      if (!headingEl || !bodyEl || !signatureEl) return;

      const headingHeight = headingEl.getBoundingClientRect().height;
      const signatureHeight = signatureEl.getBoundingClientRect().height;
      const available = availableContentHeightPx;

      const children = Array.from(bodyEl.children) as HTMLElement[];

      const heightOf = (el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        const marginBottom = parseFloat(style.marginBottom || "0") || 0;
        return el.getBoundingClientRect().height + marginBottom;
      };

      if (children.length === 0) {
        if (!cancelled) {
          setLetterPages([{ showHeading: true, bodyHtml: "", showSignature: true }]);
        }
        return;
      }

      const chunks: string[][] = [];
      let current: string[] = [];
      let usedHeight = headingHeight;

      children.forEach((child) => {
        const childHeight = heightOf(child);
        if (current.length > 0 && usedHeight + childHeight > available) {
          chunks.push(current);
          current = [];
          usedHeight = 0;
        }
        current.push(child.outerHTML);
        usedHeight += childHeight;
      });
      if (current.length > 0 || chunks.length === 0) chunks.push(current);

      // نتحقق إن كانت آخر صفحة تتّسع أيضاً لكتلة التوقيع، وإلا نضيف صفحة أخيرة له
      const lastChunkCount = chunks[chunks.length - 1].length;
      const lastPageChildEls = children.slice(children.length - lastChunkCount);
      let lastUsed = lastPageChildEls.reduce((sum, el) => sum + heightOf(el), 0);
      if (chunks.length === 1) lastUsed += headingHeight;
      const fitsSignatureOnLastPage = available - lastUsed >= signatureHeight;

      const pages: LetterPage[] = chunks.map((chunkHtmls, idx) => ({
        showHeading: idx === 0,
        bodyHtml: chunkHtmls.join(""),
        showSignature: false,
      }));

      if (fitsSignatureOnLastPage) {
        pages[pages.length - 1].showSignature = true;
      } else {
        pages.push({ showHeading: false, bodyHtml: "", showSignature: true });
      }

      if (!cancelled) setLetterPages(pages);
    };

    paginate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyHtml, refNo, date, recipient, subject, includeSigStamp, signatureImg, stampImg, signName, signTitle]);

  useEffect(() => {
    setCurrentPageIndex((idx) => Math.min(idx, Math.max(0, letterPages.length - 1)));
  }, [letterPages.length]);

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition";

  return (
    <div dir="rtl" className="space-y-5">
      <style>{RICH_TEXT_DISPLAY_CSS}</style>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                hasLetterhead
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <ImageIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                ترويسة وتذييل الورق الرسمي
              </p>
              <p className="text-xs text-slate-500">
                {hasLetterhead
                  ? "✅ الورق الرسمي المعتمد جاهز للاستخدام في هذا الخطاب"
                  : "لم يتم اعتماد صورتي الترويسة والتذييل بعد"}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-500">
            🔒 {canManageAssets
              ? "تُدار صور الورق الرسمي حصراً من قسم \"الهوية الرسمية والأختام\""
              : "محمي — راجع قسم \"الهوية الرسمية والأختام\" أو مدير النظام"}
          </span>
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
                  clipboard: {
                    matchVisual: true,
                    matchers: [
                      ['span', matchPastedInlineStyle],
                      ['p', matchPastedInlineStyle],
                      ['div', matchPastedInlineStyle],
                      ['li', matchPastedInlineStyle],
                    ],
                  },
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
            disabled={!hasLetterhead}
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <Eye size={16} className="text-amber-600" /> معاينة حية (مطابقة
              للناتج النهائي)
            </h3>
            {letterPages.length > 1 && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex((i) => Math.max(0, i - 1))}
                  disabled={currentPageIndex === 0}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ‹ السابقة
                </button>
                <span className="tabular-nums">
                  صفحة {currentPageIndex + 1} من {letterPages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPageIndex((i) => Math.min(letterPages.length - 1, i + 1))
                  }
                  disabled={currentPageIndex === letterPages.length - 1}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  التالية ›
                </button>
              </div>
            )}
          </div>
          {letterPages.length > 1 && (
            <p className="mb-2 text-[11px] font-semibold text-amber-700">
              ⚠️ يتكوّن هذا الخطاب من {letterPages.length} صفحات — يرجى تصفّح
              جميع الصفحات قبل التصدير أو الاعتماد النهائي.
            </p>
          )}
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
              {hasLetterhead ? (
                <>
                  <img
                    src={headerImg!}
                    alt="ترويسة"
                    className="absolute inset-x-0 top-0 w-full object-contain"
                    style={{ height: mmToPx(headerMm) }}
                    draggable={false}
                  />
                  <img
                    src={footerImg!}
                    alt="تذييل"
                    className="absolute inset-x-0 bottom-0 w-full object-contain"
                    style={{ height: mmToPx(footerMm) }}
                    draggable={false}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300 text-center px-6">
                  <ImageIcon size={60} />
                  <p className="text-lg font-bold">
                    لم يتم اعتماد صورتي الترويسة والتذييل بعد
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    راجع قسم "الهوية الرسمية والأختام" المحمي في القائمة الجانبية
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
                {letterPages[currentPageIndex]?.showHeading && (
                  <>
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
                  </>
                )}
                <div
                  className="ollc-rich-body"
                  dangerouslySetInnerHTML={{
                    __html: letterPages[currentPageIndex]?.bodyHtml || "",
                  }}
                />
                {letterPages[currentPageIndex]?.showSignature && (
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
                )}
              </div>
            </div>
          </div>

          {/* حاوية قياس مخفية تُستخدم فقط لحساب توزيع الصفحات (لا تظهر للمستخدم) */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              top: 0,
              left: -99999,
              width: contentWidthPx,
              fontFamily: LETTER_FONT_STACK,
              fontSize: 15.5,
              lineHeight: 2,
              color: "#1a1a1a",
            }}
          >
            <div ref={headingMeasureRef} className="text-justify">
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
            </div>
            <div
              ref={bodyMeasureRef}
              className="text-justify ollc-rich-body"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
            <div ref={signatureMeasureRef} className="mt-8 pl-6 text-left">
              {includeSigStamp && (
                <div className="relative inline-block h-16 w-36 mb-1">
                  {stampImg && (
                    <img src={stampImg} alt="" className="absolute top-0 right-2 h-16 w-16 object-contain opacity-90 -rotate-6" />
                  )}
                  {signatureImg && (
                    <img src={signatureImg} alt="" className="absolute bottom-0 left-0 h-10 object-contain" />
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
  );
}
