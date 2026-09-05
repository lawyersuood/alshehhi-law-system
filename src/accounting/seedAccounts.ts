import { Account } from "./types";

// شجرة حسابات افتراضية مناسبة لمكتب محاماة واستشارات قانونية في دولة الإمارات
// مرقّمة بالنظام المحاسبي المعتاد: 1xxx أصول، 2xxx التزامات، 3xxx حقوق ملكية، 4xxx إيرادات، 5xxx مصروفات
const seed: Array<Pick<Account, "code" | "name" | "type" | "notes">> = [
  // ---------- 1. الأصول ----------
  { code: "1010", name: "الصندوق (النقدية بالمكتب)", type: "asset" },
  { code: "1020", name: "البنك — الحساب الجاري الرئيسي", type: "asset" },
  { code: "1030", name: "حساب أمانات الموكلين (Trust Account)", type: "asset", notes: "أموال محتفظ بها لصالح الموكلين، منفصلة عن أموال المكتب" },
  { code: "1110", name: "ذمم العملاء المدينة (أتعاب مستحقة)", type: "asset" },
  { code: "1120", name: "ضريبة القيمة المضافة — مدخلات (قابلة للاسترداد)", type: "asset" },
  { code: "1130", name: "سلف وعهد الموظفين", type: "asset" },
  { code: "1140", name: "دفعات مقدمة لموردين وجهات حكومية", type: "asset" },
  { code: "1210", name: "أثاث وتجهيزات مكتبية", type: "asset" },
  { code: "1220", name: "أجهزة حاسب آلي ومعدات تقنية", type: "asset" },
  { code: "1290", name: "مجمع إهلاك الأصول الثابتة", type: "asset", notes: "حساب مقابل (Contra)، رصيده الطبيعي دائن" },

  // ---------- 2. الالتزامات ----------
  { code: "2010", name: "ذمم الموردين الدائنة", type: "liability" },
  { code: "2020", name: "ضريبة القيمة المضافة — مخرجات (مستحقة للهيئة)", type: "liability" },
  { code: "2030", name: "أمانات الموكلين المستحقة (Trust Liability)", type: "liability", notes: "مقابل حساب أمانات الموكلين في الأصول" },
  { code: "2110", name: "رواتب ومستحقات الموظفين", type: "liability" },
  { code: "2120", name: "مستحق أتعاب زملاء ومحامين متعاونين", type: "liability" },
  { code: "2130", name: "ذمم دائنة أخرى ومصروفات مستحقة", type: "liability" },
  { code: "2210", name: "قروض ومديونيات طويلة الأجل", type: "liability" },

  // ---------- 3. حقوق الملكية ----------
  { code: "3010", name: "رأس المال", type: "equity" },
  { code: "3020", name: "الأرباح المرحلة (أرباح محتجزة)", type: "equity" },
  { code: "3030", name: "مسحوبات الشريك / المالك", type: "equity", notes: "رصيده الطبيعي مدين، يخصم من حقوق الملكية" },

  // ---------- 4. الإيرادات ----------
  { code: "4010", name: "إيرادات أتعاب التقاضي والترافع", type: "revenue" },
  { code: "4020", name: "إيرادات الاستشارات القانونية", type: "revenue" },
  { code: "4030", name: "إيرادات صياغة العقود والاتفاقيات", type: "revenue" },
  { code: "4040", name: "إيرادات الاستشارات المرئية عن بُعد", type: "revenue" },
  { code: "4090", name: "إيرادات متنوعة أخرى", type: "revenue" },

  // ---------- 5. المصروفات ----------
  { code: "5010", name: "رواتب وأجور الموظفين", type: "expense" },
  { code: "5020", name: "إيجار المكتب", type: "expense" },
  { code: "5030", name: "رسوم حكومية ورسوم قيد المحاكم", type: "expense" },
  { code: "5040", name: "اتصالات وإنترنت", type: "expense" },
  { code: "5050", name: "تسويق وإعلان", type: "expense" },
  { code: "5060", name: "صيانة وتشغيل المكتب", type: "expense" },
  { code: "5070", name: "أتعاب زملاء ومحامين متعاونين (إنابات)", type: "expense" },
  { code: "5080", name: "مصروفات بنكية ورسوم تحويل", type: "expense" },
  { code: "5090", name: "استهلاك الأصول الثابتة", type: "expense" },
  { code: "5990", name: "مصروفات متنوعة أخرى", type: "expense" },
];

export const DEFAULT_CHART_OF_ACCOUNTS: Account[] = seed.map((a, idx) => ({
  id: `seed-${idx + 1}`,
  code: a.code,
  name: a.name,
  type: a.type,
  parentId: null,
  isActive: true,
  isSystem: true,
  notes: a.notes,
  createdAt: new Date().toISOString(),
}));
