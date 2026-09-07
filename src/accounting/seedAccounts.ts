import { Account, AccountType } from "./types";

// شجرة حسابات مطابقة لهيكلة "وافق" (Wafeq) الفعلية، مأخوذة من حساب المكتب الحقيقي
// وتم استبعاد الحسابات الفارغة [حساب جديد]، وإعادة ترقيم تعارض الأكواد 531-535
// (فرع "52 المصروفات التشغيلية" احتفظ بأكواده المخصصة 531-538، وفرع "53 المصروفات الغير
// التشغيلية" الافتراضي في وافق أُعيد ترقيم أبنائه إلى 5310-5350 لتفادي التكرار).

interface SeedNode {
  key: string; // معرف داخلي مستقر لبناء parentId
  parentKey: string | null;
  code: string;
  name: string;
  type: AccountType;
  isGroup?: boolean;
  notes?: string;
}

const seed: SeedNode[] = [
  // ================= 1. الأصول =================
  { key: "1", parentKey: null, code: "1", name: "الأصول", type: "asset", isGroup: true },

  { key: "11", parentKey: "1", code: "11", name: "الأصول المتداولة", type: "asset", isGroup: true },
  { key: "111", parentKey: "11", code: "111", name: "النقد وما يعادله", type: "asset", isGroup: true },
  { key: "1111", parentKey: "111", code: "1111", name: "الصندوق (النقدية بالمكتب)", type: "asset" },
  { key: "1112", parentKey: "111", code: "1112", name: "البنك — الحساب الجاري الرئيسي", type: "asset" },
  { key: "112", parentKey: "11", code: "112", name: "العملاء", type: "asset", notes: "ذمم العملاء المدينة (أتعاب مستحقة)" },
  { key: "1151", parentKey: "11", code: "1151", name: "حساب أمانات الموكلين (Trust Account)", type: "asset", notes: "أموال محتفظ بها لصالح الموكلين، منفصلة عن أموال المكتب" },
  { key: "1130", parentKey: "11", code: "1130", name: "سلف وعهد الموظفين", type: "asset" },
  { key: "1140", parentKey: "11", code: "1140", name: "دفعات مقدمة لموردين وجهات حكومية", type: "asset" },
  { key: "2110", parentKey: "11", code: "2110", name: "ضريبة القيمة المضافة — مدخلات (قابلة للاسترداد)", type: "asset" },

  { key: "12", parentKey: "1", code: "12", name: "الأصول غير المتداولة", type: "asset", isGroup: true },
  { key: "1221", parentKey: "12", code: "1221", name: "أثاث وتجهيزات مكتبية", type: "asset" },
  { key: "1222", parentKey: "12", code: "1222", name: "أجهزة حاسب آلي ومعدات تقنية", type: "asset" },
  { key: "122", parentKey: "12", code: "122", name: "مجمع إهلاك الأصول الثابتة", type: "asset", notes: "حساب مقابل (Contra)، رصيده الطبيعي دائن" },

  { key: "14", parentKey: "1", code: "14", name: "أصول أخرى", type: "asset", isGroup: true },
  { key: "1410", parentKey: "14", code: "1410", name: "أصول أخرى متنوعة", type: "asset" },

  // ================= 2. الالتزامات =================
  { key: "2", parentKey: null, code: "2", name: "الالتزامات", type: "liability", isGroup: true },

  { key: "21", parentKey: "2", code: "21", name: "الالتزامات المتداولة", type: "liability", isGroup: true },
  { key: "211", parentKey: "21", code: "211", name: "الموردون", type: "liability", notes: "ذمم الموردين الدائنة" },
  { key: "213", parentKey: "21", code: "213", name: "رواتب ومستحقات الموظفين", type: "liability" },
  { key: "2151", parentKey: "21", code: "2151", name: "أمانات الموكلين المستحقة (Trust Liability)", type: "liability", notes: "مقابل حساب أمانات الموكلين في الأصول" },
  { key: "2161", parentKey: "21", code: "2161", name: "مستحق أتعاب زملاء ومحامين متعاونين", type: "liability" },
  { key: "216", parentKey: "21", code: "216", name: "ذمم دائنة أخرى ومصروفات مستحقة", type: "liability" },
  { key: "218", parentKey: "21", code: "218", name: "ضريبة القيمة المضافة — مخرجات (مستحقة للهيئة)", type: "liability" },

  { key: "22", parentKey: "2", code: "22", name: "الالتزامات غير المتداولة", type: "liability", isGroup: true },
  { key: "2210", parentKey: "22", code: "2210", name: "قروض ومديونيات طويلة الأجل", type: "liability" },

  // ================= 3. حقوق الملكية =================
  { key: "3", parentKey: null, code: "3", name: "حقوق الملكية", type: "equity", isGroup: true },
  { key: "31", parentKey: "3", code: "31", name: "رأس المال", type: "equity" },
  { key: "32", parentKey: "3", code: "32", name: "الأرباح المرحلة (أرباح محتجزة)", type: "equity" },
  { key: "33", parentKey: "3", code: "33", name: "مسحوبات الشريك / المالك", type: "equity", notes: "رصيده الطبيعي مدين، يخصم من حقوق الملكية" },
  { key: "34", parentKey: "3", code: "34", name: "أرباح/خسائر العام الحالي", type: "equity" },
  { key: "35", parentKey: "3", code: "35", name: "احتياطيات أخرى", type: "equity" },

  // ================= 4. الإيرادات =================
  { key: "4", parentKey: null, code: "4", name: "الإيرادات", type: "revenue", isGroup: true },
  { key: "41", parentKey: "4", code: "41", name: "إيرادات التشغيل", type: "revenue", isGroup: true },
  { key: "411", parentKey: "41", code: "411", name: "إيرادات أتعاب التقاضي والترافع", type: "revenue" },
  { key: "412", parentKey: "41", code: "412", name: "إيرادات الاستشارات القانونية", type: "revenue" },
  { key: "413", parentKey: "41", code: "413", name: "إيرادات صياغة العقود والاتفاقيات", type: "revenue" },
  { key: "414", parentKey: "41", code: "414", name: "إيرادات الاستشارات المرئية عن بُعد", type: "revenue" },
  { key: "42", parentKey: "4", code: "42", name: "إيرادات أخرى", type: "revenue", isGroup: true },
  { key: "421", parentKey: "42", code: "421", name: "إيرادات متنوعة أخرى", type: "revenue" },

  // ================= 5. المصروفات =================
  { key: "5", parentKey: null, code: "5", name: "المصروفات", type: "expense", isGroup: true },

  { key: "51", parentKey: "5", code: "51", name: "تكلفة الخدمات", type: "expense", isGroup: true },
  { key: "5110", parentKey: "51", code: "5110", name: "أتعاب زملاء ومحامين متعاونين (إنابات)", type: "expense" },
  { key: "5120", parentKey: "51", code: "5120", name: "رسوم حكومية ورسوم قيد المحاكم", type: "expense" },

  { key: "52", parentKey: "5", code: "52", name: "المصروفات التشغيلية", type: "expense", isGroup: true },
  { key: "5210", parentKey: "52", code: "5210", name: "المصروفات العامة والإدارية", type: "expense", isGroup: true },
  { key: "5211", parentKey: "5210", code: "5211", name: "رواتب وأجور الموظفين", type: "expense" },
  { key: "5212", parentKey: "5210", code: "5212", name: "إيجار المكتب", type: "expense" },
  { key: "5213", parentKey: "5210", code: "5213", name: "صيانة وتشغيل المكتب", type: "expense" },
  { key: "5214", parentKey: "5210", code: "5214", name: "تسويق وإعلان", type: "expense" },
  { key: "531", parentKey: "52", code: "531", name: "وزارة العدل", type: "expense" },
  { key: "532", parentKey: "52", code: "532", name: "التنمية الاقتصادية الشارقة", type: "expense" },
  { key: "533", parentKey: "52", code: "533", name: "بلدية الشارقة", type: "expense" },
  { key: "534", parentKey: "52", code: "534", name: "خدمات الاتصالات", type: "expense" },
  { key: "535", parentKey: "52", code: "535", name: "مصاريف استقدام العمال", type: "expense" },
  { key: "536", parentKey: "52", code: "536", name: "مصروفات بنكية ورسوم تحويل", type: "expense" },
  { key: "537", parentKey: "52", code: "537", name: "اتصالات وإنترنت", type: "expense" },
  { key: "538", parentKey: "52", code: "538", name: "مصروفات متنوعة أخرى", type: "expense" },

  {
    key: "53",
    parentKey: "5",
    code: "53",
    name: "المصروفات الغير التشغيلية",
    type: "expense",
    isGroup: true,
    notes: "أُعيد ترقيم الحسابات الفرعية إلى 5310-5350 لتفادي تعارض الأكواد مع فرع 52 المصروفات التشغيلية",
  },
  { key: "5310", parentKey: "53", code: "5310", name: "خسارة أو ربح في صرف العملات", type: "expense" },
  { key: "5320", parentKey: "53", code: "5320", name: "غير مصنف", type: "expense" },
  { key: "5330", parentKey: "53", code: "5330", name: "مصاريف الإهلاك", type: "expense", notes: "استهلاك الأصول الثابتة" },
  { key: "5340", parentKey: "53", code: "5340", name: "المصاريف الآخرى", type: "expense" },
  { key: "5350", parentKey: "53", code: "5350", name: "أرباح وخسائر غير محققة", type: "expense" },
];

const keyToId = new Map(seed.map((n) => [n.key, `seed-${n.key}`]));

export const DEFAULT_CHART_OF_ACCOUNTS: Account[] = seed.map((n) => ({
  id: keyToId.get(n.key)!,
  code: n.code,
  name: n.name,
  type: n.type,
  parentId: n.parentKey ? keyToId.get(n.parentKey)! : null,
  isActive: true,
  isSystem: true,
  isGroup: n.isGroup || false,
  notes: n.notes,
  createdAt: new Date().toISOString(),
}));
