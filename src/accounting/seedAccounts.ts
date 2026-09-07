import { Account, AccountType } from "./types";

// شجرة حسابات مطابقة بالكامل لحساب "وافق" (Wafeq) الفعلي للمكتب — تم استخراجها بالكامل
// عبر تصفح حساب المكتب الحقيقي على app.wafeq.com (شجرة الحسابات كاملة، حسابًا حسابًا).
// استُثنيت فقط 3 حسابات فارغة غير مُهيّأة تظهر في وافق باسم "[حساب جديد]" (1221, 2151, 2163)،
// وأُعيد ترقيم تعارض الأكواد 531-535 (فرع "53 المصروفات الغير التشغيلية" الافتراضي في وافق
// أُعيد ترقيم أبنائه إلى 5310-5350، بينما احتُفظ بأكواد فرع "52 المصروفات التشغيلية" المخصصة
// للمكتب 531-538 كما هي تمامًا).

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
  { key: "1111", parentKey: "111", code: "1111", name: "الخزينة", type: "asset" },
  { key: "1112", parentKey: "111", code: "1112", name: "المصروفات النثرية", type: "asset" },
  { key: "1113", parentKey: "111", code: "1113", name: "الحساب البنكي", type: "asset" },
  { key: "1114", parentKey: "111", code: "1114", name: "نقدا", type: "asset" },
  { key: "112", parentKey: "11", code: "112", name: "العملاء", type: "asset" },
  { key: "113", parentKey: "11", code: "113", name: "سلف الموظفين", type: "asset" },
  { key: "114", parentKey: "11", code: "114", name: "مصروفات مدفوعة مقدما", type: "asset" },
  { key: "115", parentKey: "11", code: "115", name: "إدارة المخزون", type: "asset", isGroup: true },
  { key: "1151", parentKey: "115", code: "1151", name: "المستودع الرئيسي", type: "asset" },
  { key: "116", parentKey: "11", code: "116", name: "Customer Advance", type: "asset" },

  { key: "12", parentKey: "1", code: "12", name: "الأصول الثابتة", type: "asset", isGroup: true },
  { key: "121", parentKey: "12", code: "121", name: "أثاث و معدات", type: "asset" },
  { key: "122", parentKey: "12", code: "122", name: "مجمع الإهلاك التراكمي", type: "asset", isGroup: true, notes: "حساب مقابل (Contra)، رصيده الطبيعي دائن" },

  { key: "14", parentKey: "1", code: "14", name: "الأصول الغير متداولة", type: "asset", isGroup: true },

  // ================= 2. الالتزامات =================
  { key: "2", parentKey: null, code: "2", name: "الإلتزامات", type: "liability", isGroup: true },

  { key: "21", parentKey: "2", code: "21", name: "الإلتزامات المتداولة", type: "liability", isGroup: true },
  { key: "211", parentKey: "21", code: "211", name: "الموردين", type: "liability", isGroup: true },
  { key: "2110", parentKey: "211", code: "2110", name: "ضريبة القيمة المضافة على الحسابات الدائنة", type: "liability" },
  { key: "212", parentKey: "21", code: "212", name: "إيراد غير مكتسب", type: "liability" },
  { key: "213", parentKey: "21", code: "213", name: "رواتب مستحقة غير مدفوعة", type: "liability" },
  { key: "214", parentKey: "21", code: "214", name: "مكافآت نهاية الخدمة", type: "liability" },
  { key: "215", parentKey: "21", code: "215", name: "قرض من المالك", type: "liability", isGroup: true },
  { key: "216", parentKey: "21", code: "216", name: "تعويضات الموظفين", type: "liability", isGroup: true },
  { key: "2161", parentKey: "216", code: "2161", name: "تعويضات Suood Alshehhi", type: "liability" },
  { key: "2162", parentKey: "216", code: "2162", name: "تعويضات عبدالكريم", type: "liability" },
  { key: "217", parentKey: "21", code: "217", name: "Customer expense payable", type: "liability" },
  { key: "218", parentKey: "21", code: "218", name: "القيمة المضافة", type: "liability", notes: "ضريبة القيمة المضافة — مخرجات (مستحقة للهيئة)" },
  { key: "219", parentKey: "21", code: "219", name: "ضريبة السلع الانتقائية المستحقة", type: "liability" },

  { key: "22", parentKey: "2", code: "22", name: "الإلتزامات غير المتداولة", type: "liability", isGroup: true },

  // ================= 3. حقوق الملكية =================
  { key: "3", parentKey: null, code: "3", name: "حقوق الملكية", type: "equity", isGroup: true },
  { key: "31", parentKey: "3", code: "31", name: "حقوق ملكية من رصيد إفتتاحي", type: "equity", isGroup: true },
  { key: "311", parentKey: "31", code: "311", name: "إزاحة الرصيد الافتتاحي", type: "equity" },
  { key: "32", parentKey: "3", code: "32", name: "حقوق ملكية المالك", type: "equity", isGroup: true },
  { key: "321", parentKey: "32", code: "321", name: "رأس المال", type: "equity" },
  { key: "322", parentKey: "32", code: "322", name: "المسحوبات", type: "equity", notes: "رصيده الطبيعي مدين، يخصم من حقوق الملكية" },
  { key: "33", parentKey: "3", code: "33", name: "الأرباح المحتجزة", type: "equity", isGroup: true },
  { key: "331", parentKey: "33", code: "331", name: "الأرباح المحتجزة", type: "equity" },
  { key: "34", parentKey: "3", code: "34", name: "الدخل الشامل الآخر المتراكم", type: "equity", isGroup: true },
  { key: "341", parentKey: "34", code: "341", name: "أرباح و خسائر غير محققة", type: "equity" },
  { key: "35", parentKey: "3", code: "35", name: "رأس المال", type: "equity" },

  // ================= 4. الإيرادات =================
  { key: "4", parentKey: null, code: "4", name: "الإيراد", type: "revenue", isGroup: true },
  { key: "41", parentKey: "4", code: "41", name: "دخل", type: "revenue", isGroup: true },
  { key: "411", parentKey: "41", code: "411", name: "مبيعات أخرى", type: "revenue" },
  { key: "412", parentKey: "41", code: "412", name: "خصم", type: "revenue" },
  { key: "413", parentKey: "41", code: "413", name: "رسوم إستشارات قانونية", type: "revenue" },
  { key: "414", parentKey: "41", code: "414", name: "دخل الرسوم المتأخرة", type: "revenue" },
  { key: "418", parentKey: "41", code: "418", name: "اتعاب محاماة", type: "revenue" },
  { key: "42", parentKey: "4", code: "42", name: "مصادر الدخل الأخرى", type: "revenue" },

  // ================= 5. المصروفات =================
  { key: "5", parentKey: null, code: "5", name: "المصروفات", type: "expense", isGroup: true },

  { key: "51", parentKey: "5", code: "51", name: "تكاليف المبيعات", type: "expense", isGroup: true },
  { key: "511", parentKey: "51", code: "511", name: "تكلفة البضائع المباعة", type: "expense" },

  { key: "52", parentKey: "5", code: "52", name: "المصروفات التشغيلية", type: "expense", isGroup: true },
  { key: "521", parentKey: "52", code: "521", name: "اللوازم المكتبية", type: "expense", isGroup: true },
  { key: "5210", parentKey: "521", code: "5210", name: "دين معدوم", type: "expense" },
  { key: "5211", parentKey: "521", code: "5211", name: "رواتب وأجور الموظفين", type: "expense" },
  { key: "5212", parentKey: "521", code: "5212", name: "الوجبات والترفيه", type: "expense" },
  { key: "5213", parentKey: "521", code: "5213", name: "الإصلاحات والصيانة", type: "expense" },
  { key: "5214", parentKey: "521", code: "5214", name: "مصاريف تأمين", type: "expense" },
  { key: "522", parentKey: "52", code: "522", name: "الإعلان والتسويق", type: "expense" },
  { key: "523", parentKey: "52", code: "523", name: "الرسوم الإضافية البنكية والمصاريف", type: "expense" },
  { key: "524", parentKey: "52", code: "524", name: "رسوم بطاقات الائتمان", type: "expense" },
  { key: "525", parentKey: "52", code: "525", name: "تكاليف السفر", type: "expense" },
  { key: "526", parentKey: "52", code: "526", name: "مصروفات الهاتف", type: "expense" },
  { key: "527", parentKey: "52", code: "527", name: "البرامج والأدوات", type: "expense" },
  { key: "528", parentKey: "52", code: "528", name: "مصروف الإيجار", type: "expense" },
  { key: "529", parentKey: "52", code: "529", name: "مصروفات الماء والكهرباء", type: "expense" },
  { key: "530", parentKey: "52", code: "530", name: "عضوية مؤسسة رواد", type: "expense" },
  { key: "531", parentKey: "52", code: "531", name: "وزارة العدل", type: "expense" },
  { key: "532", parentKey: "52", code: "532", name: "التنمية الاقتصادية الشارقة", type: "expense" },
  { key: "533", parentKey: "52", code: "533", name: "بلدية الشارقة", type: "expense" },
  { key: "534", parentKey: "52", code: "534", name: "خدمات الاتصالات", type: "expense" },
  { key: "535", parentKey: "52", code: "535", name: "مصاريف استقدام العمال", type: "expense" },
  { key: "536", parentKey: "52", code: "536", name: "التراخيص", type: "expense" },
  { key: "537", parentKey: "52", code: "537", name: "مصاريف القضايا", type: "expense" },
  { key: "538", parentKey: "52", code: "538", name: "مصروفات تشغيلية خاصة بالمهنة", type: "expense" },

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
