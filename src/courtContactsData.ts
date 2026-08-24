import fs from "fs";

export interface CourtContact {
  id: number;
  courtName: string;
  emirate: string;
  department: string;
  titleOrEmployee: string;
  phone: string;
  extOrSeal: string;
  email: string;
  operatingHours: string;
  location: string;
  notes: string;
}

const clean: CourtContact[] = [];
let nextId = 1;

function add(contact: Omit<CourtContact, "id">) {
  clean.push({
    id: nextId++,
    courtName: contact.courtName.trim(),
    emirate: contact.emirate.trim(),
    department: (contact.department || "").trim(),
    titleOrEmployee: (contact.titleOrEmployee || "").trim(),
    phone: (contact.phone || "").trim(),
    extOrSeal: (contact.extOrSeal || "").trim(),
    email: (contact.email || "").trim(),
    operatingHours: (contact.operatingHours || "").trim(),
    location: (contact.location || "").trim(),
    notes: (contact.notes || "").trim(),
  });
}

// 1. DUBAI COURTS (محاكم دبي)
add({
  courtName: "محاكم دبي - المركز الرئيسي",
  emirate: "دبي",
  department: "مركز الاتصال الموحد وخدمة العملاء",
  titleOrEmployee: "مركز إسعاد المتعاملين الموحد",
  phone: "800333333 / 043347777",
  extOrSeal: "800-DC",
  email: "info@dc.gov.ae",
  operatingHours: "الاثنين - الخميس: 07:30 ص - 03:30 م | الجمعة: 07:30 ص - 12:00 م",
  location: "دبي - بر دبي - طريق الرياض / شارع عود ميثاء",
  notes: "الرقم الموحد لكافة محاكم دبي واستفسارات القضايا والطلبات الذكية"
});
add({
  courtName: "محاكم دبي - المحكمة الابتدائية",
  emirate: "دبي",
  department: "إدارة الدعاوى المدنية والتجارية والعمالية",
  titleOrEmployee: "مكتب إدارة الدعوى - المحكمة الابتدائية",
  phone: "043347777",
  extOrSeal: "شباك 1-8",
  email: "info@dc.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "مبنى محاكم دبي الرئيسي",
  notes: "قيد ومتابعة الدعاوى الابتدائية الكلية والجزئية"
});
add({
  courtName: "محاكم دبي - محكمة الاستئناف",
  emirate: "دبي",
  department: "أمانة سر محكمة الاستئناف",
  titleOrEmployee: "أمناء سر دوائر الاستئناف (حقوقي / جزائي / عمالي)",
  phone: "043347777",
  extOrSeal: "طابق 2",
  email: "info@dc.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "مبنى محاكم دبي الرئيسي",
  notes: "استئناف الأحكام الابتدائية وتحديد جلسات الطعن"
});
add({
  courtName: "محاكم دبي - محكمة التمييز",
  emirate: "دبي",
  department: "أمانة سر محكمة التمييز والمكتب الفني",
  titleOrEmployee: "أمين سر محكمة التمييز",
  phone: "043347777",
  extOrSeal: "طابق 3",
  email: "cassation@dc.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "مبنى محاكم دبي الرئيسي",
  notes: "أعلى هيئة قضائية في إمارة دبي - طعون التمييز"
});
add({
  courtName: "محاكم دبي - محكمة التنفيذ",
  emirate: "دبي",
  department: "إدارة التنفيذ والإنابات القضائية",
  titleOrEmployee: "قضاة ومأمورو التنفيذ والأختام",
  phone: "043347777 / 043030333",
  extOrSeal: "مكتب التنفيذ",
  email: "execution@dc.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "مبنى محاكم دبي - الطابق الأرضي والأول",
  notes: "تنفيذ السندات التنفيذية والأحكام والقرارات والأوامر على العرائض وحجز الممتلكات"
});
add({
  courtName: "محاكم دبي - محكمة الأحوال الشخصية والتركات",
  emirate: "دبي",
  department: "محكمة الأحوال الشخصية والتوجيه الأسري والتركات",
  titleOrEmployee: "قسم التوجيه الأسري والتركات وإشهادات التوثيق",
  phone: "043347777 / 043030111",
  extOrSeal: "فرع القرهود",
  email: "familycourt@dc.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "دبي - القرهود - قرب محطة مترو جي جي كو",
  notes: "دعاوى الأسرة، التوجيه الأسري، قضايا التركات والوصايا وتوثيق عقود الزواج والإشهادات"
});
add({
  courtName: "محاكم دبي - المحكمة العمالية",
  emirate: "دبي",
  department: "محكمة العمال الجزئية والكلية",
  titleOrEmployee: "إدارة القضايا العمالية والتنفيذ العمالي",
  phone: "043347777 / 043030444",
  extOrSeal: "فرع العوير",
  email: "laborcourt@dc.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "دبي - العوير - مجمع محاكم دبي العمالية",
  notes: "المنازعات العمالية الفردية والجماعية وتنفيذ الأحكام العمالية"
});
add({
  courtName: "مركز فض المنازعات الإيجارية - دبي (RDC)",
  emirate: "دبي",
  department: "الأمانة العامة ولجان فض المنازعات الإيجارية والتنفيذ",
  titleOrEmployee: "مركز الاتصال ولجان التوفيق والتنفيذ الإيجاري",
  phone: "8004488 / 042030555",
  extOrSeal: "RDC Call Center",
  email: "rdc@dubailand.gov.ae",
  operatingHours: "الاثنين - الخميس: 07:30 ص - 03:30 م | الجمعة: 07:30 ص - 12:00 م",
  location: "دبي - ديرة - دائرة الأراضي والأملاك - شارع بني ياس",
  notes: "الجهة القضائية المختصة بفض جميع المنازعات الإيجارية في دبي وتنفيذ القرارات الإخلاء والمطالبات"
});
add({
  courtName: "النيابة العامة بدبي",
  emirate: "دبي",
  department: "مركز الاتصال الموحد وخدمة المتعاملين بالنيابة العامة",
  titleOrEmployee: "النيابة العامة - التحقيق والادعاء العام",
  phone: "043346666 / 80037",
  extOrSeal: "DP General",
  email: "info@dxbpp.gov.ae",
  operatingHours: "07:30 ص - 03:30 م (وطوارئ النيابة 24/7)",
  location: "دبي - بر دبي - قرب حديقة الخور",
  notes: "التحقيق في القضايا الجزائية ونيابة أمن الدولة ونيابة الأسرة والأحداث والأموال العامة"
});
add({
  courtName: "الكاتب العدل الخاص والعام - محاكم دبي",
  emirate: "دبي",
  department: "إدارة الكاتب العدل والتوثيقات العامة",
  titleOrEmployee: "الكاتب العدل - فروع: المبنى الرئيسي / البرشاء / الطوار / وافي",
  phone: "043347777 / 043030222",
  extOrSeal: "Notary Public",
  email: "notary@dc.gov.ae",
  operatingHours: "07:30 ص - 08:00 م (نظام فترتين)",
  location: "فروع: المبنى الرئيسي، البرشاء مول، مركز الطوار، وافي مول",
  notes: "توثيق وتصديق الوكالات، العقود، الإقرارات، الإخطارات العدلية، والوصايا"
});
add({
  courtName: "محكمة حتا الجزئية",
  emirate: "دبي",
  department: "مكتب المحكمة والخدمات القضائية والتوثيق",
  titleOrEmployee: "أمين سر ومسؤول المحكمة",
  phone: "048521232 / 048521025",
  extOrSeal: "حتا",
  email: "info@dc.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "دبي - منطقة حتا",
  notes: "محكمة جزئية لخدمة أهالي منطقة حتا والتوثيقات"
});

// 2. ABU DHABI JUDICIAL DEPARTMENT & FEDERAL SUPREME COURT (دائرة القضاء - أبوظبي والمحكمة الاتحادية العليا)
add({
  courtName: "المحكمة الاتحادية العليا",
  emirate: "أبوظبي",
  department: "المكتب الفني وأمانة السر العامة",
  titleOrEmployee: "منير (مدير) / عبدالباسط / ليلى",
  phone: "026921435 / 026921424 / 026921420",
  extOrSeal: "أمانة سر العليا",
  email: "scgs@moj.gov.ae",
  operatingHours: "07:30 ص - 02:30 م",
  location: "أبوظبي - شارع المطار - مجمع المحاكم الاتحادية",
  notes: "المحكمة الاتحادية العليا - أعلى سلطة قضائية اتحادية في دولة الإمارات"
});
add({
  courtName: "دائرة القضاء أبوظبي - المركز الرئيسي",
  emirate: "أبوظبي",
  department: "مركز الاتصال الموحد وتقديم الطلبات والاستفسارات",
  titleOrEmployee: "مركز إسعاد المتعاملين الموحد",
  phone: "600599799",
  extOrSeal: "600-ADJD",
  email: "info@adjd.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "أبوظبي - شارع الخليج العربي - مجمع دائرة القضاء الرئيسي",
  notes: "الرقم المجاني الموحد لجميع محاكم ونيابات وخدمات دائرة القضاء أبوظبي"
});
add({
  courtName: "دائرة القضاء أبوظبي - النيابة العامة",
  emirate: "أبوظبي",
  department: "نيابة استئناف أبوظبي والنيابة الكلية",
  titleOrEmployee: "أمانة سر نيابة الاستئناف والتحقيق",
  phone: "026512222",
  extOrSeal: "نيابة أبوظبي",
  email: "appal-prosecution@adjd.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "أبوظبي - مجمع دائرة القضاء",
  notes: "استقبال طلبات ومتابعة قضايا نيابة استئناف أبوظبي"
});
add({
  courtName: "دائرة القضاء أبوظبي - نيابة استئناف العين",
  emirate: "أبوظبي",
  department: "نيابة استئناف العين والنيابة الكلية بالعين",
  titleOrEmployee: "أمانة سر نيابة العين",
  phone: "037152000",
  extOrSeal: "نيابة العين",
  email: "ainappro@adjd.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "العين - مجمع محاكم العين",
  notes: "طلبات وقضايا نيابة استئناف العين"
});
add({
  courtName: "دائرة القضاء أبوظبي - نيابة أمن الدولة والتعاون الدولي",
  emirate: "أبوظبي",
  department: "نيابة أمن الدولة والنيابة الاتحادية للتعاون الدولي",
  titleOrEmployee: "المستشار علي الزيودي (رئيس نيابة) / إبراهيم المرزوقي / ناصر الجنيبي",
  phone: "026921401 / 026921488 / 0506499667",
  extOrSeal: "أمن الدولة",
  email: "SS@PP.gov.ae / SSCS@pp.gov.ae / ibrahim@pp.gov.ae",
  operatingHours: "07:30 ص - 02:30 م",
  location: "أبوظبي - مكتب النائب العام الاتحادي",
  notes: "نيابة أمن الدولة وإدارة التعاون القضائي الدولي وتسليم المجرمين"
});
add({
  courtName: "دائرة القضاء أبوظبي - شؤون المحامين والمناديب",
  emirate: "أبوظبي",
  department: "إدارة شؤون المحامين والخبراء وشؤون المناديب",
  titleOrEmployee: "أ. عوض / أ. طاهر / أ. علي / أ. رائدة",
  phone: "026512927 / 026512557 / 026512278 / 026513460 / 0507053223",
  extOrSeal: "مكتب شؤون المحامين",
  email: "info@adjd.gov.ae",
  operatingHours: "07:30 ص - 03:30 م",
  location: "أبوظبي - مبنى دائرة القضاء - طابق 1",
  notes: "قيد وتجديد المحامين والمناديب وتراخيص مكاتب المحاماة والبطاقات"
});

// Abu Dhabi Judicial Department - Additional Branches (Al Ain & Al Dhafra)
const adBranchCourts = [
  // Al Ain Courts (محاكم العين)
  { court: "محاكم العين الابتدائية والاستئنافية", dept: "مركز خدمة المتعاملين والاستعلامات الرئيسي", name: "إسعاد المتعاملين بمحاكم العين", tel: "037152000 / 037152222", email: "aincourts@adjd.gov.ae", loc: "العين - مجمع محاكم العين" },
  { court: "محاكم العين الابتدائية والاستئنافية", dept: "قيد وإدارة الدعاوى المدنية والتجارية والعمالية", name: "مكتب إدارة الدعوى بالعين", tel: "037152100", email: "aincourts@adjd.gov.ae", loc: "العين - مجمع محاكم العين" },
  { court: "محاكم العين الابتدائية والاستئنافية", dept: "إدارة التنفيذ والإنابات القضائية بالعين", name: "مأمورو التنفيذ والأختام", tel: "037152300", email: "ain.execution@adjd.gov.ae", loc: "العين - مجمع محاكم العين" },
  { court: "محاكم العين الابتدائية والاستئنافية", dept: "الكاتب العدل والتوثيقات العامة بالعين", name: "الكاتب العدل بالعين", tel: "037152400", email: "ain.notary@adjd.gov.ae", loc: "العين - مجمع محاكم العين" },
  { court: "محاكم العين الابتدائية والاستئنافية", dept: "التوجيه الأسري وإصلاح ذات البين بالعين", name: "قسم الموجهين الأسريين", tel: "037152500", email: "ain.family@adjd.gov.ae", loc: "العين - مجمع محاكم العين" },
  { court: "محاكم العين الابتدائية والاستئنافية", dept: "المحكمة العمالية بالعين", name: "أمانة سر القضايا العمالية بالعين", tel: "037152600", email: "ain.labor@adjd.gov.ae", loc: "العين - مجمع محاكم العين" },

  // Al Dhafra Courts (محاكم منطقة الظفرة - مدينة زايد)
  { court: "محكمة الظفرة الابتدائية", dept: "أمانة السر ومركز خدمة المتعاملين الرئيسي", name: "أمانة سر محكمة الظفرة", tel: "028988888 / 026512000", email: "dhafra.court@adjd.gov.ae", loc: "الظفرة - مدينة زايد - مجمع المحاكم" },
  { court: "محكمة الظفرة الابتدائية", dept: "إدارة التنفيذ والإنابات القضائية بالظفرة", name: "مأمور التنفيذ بالظفرة", tel: "028988850", email: "dhafra.execution@adjd.gov.ae", loc: "الظفرة - مدينة زايد" },
  { court: "محكمة الظفرة الابتدائية", dept: "الكاتب العدل والتوثيقات بالظفرة", name: "الكاتب العدل بمدينة زايد", tel: "028988820", email: "dhafra.notary@adjd.gov.ae", loc: "الظفرة - مدينة زايد" },
  { court: "محكمة الظفرة الابتدائية", dept: "نيابة الظفرة الكلية", name: "أمانة سر نيابة الظفرة", tel: "028988800", email: "dhafra.prosecution@adjd.gov.ae", loc: "الظفرة - مدينة زايد" },
];
adBranchCourts.forEach(b => {
  add({
    courtName: b.court,
    emirate: "أبوظبي",
    department: b.dept,
    titleOrEmployee: b.name,
    phone: b.tel,
    extOrSeal: "فرع محكمة",
    email: b.email,
    operatingHours: "07:30 ص - 03:30 م",
    location: b.loc,
    notes: "الخدمات القضائية والدوائر الجزئية والكلية في منطقة " + (b.court.includes("العين") ? "العين" : "الظفرة")
  });
});
const adBailiffs = [
  { dept: "محضر الدائرة الأولى (أرقام 1)", name: "سعيد العميمي", tel: "026512843" },
  { dept: "محضر الدائرة الثانية (أرقام 2)", name: "عبدالله العميمي", tel: "026513572" },
  { dept: "محضر الدائرة الثالثة والسادسة (أرقام 3 و6)", name: "حمد الكعبي", tel: "026513539" },
  { dept: "محضر الدائرة الرابعة (أرقام 4)", name: "فاطمة المريخي", tel: "026513416" },
  { dept: "محضر الدائرة الخامسة (أرقام 5)", name: "محمد العامري", tel: "026513592" },
  { dept: "محضر الدائرة السابعة والثامنة (أرقام 7 و8)", name: "هشام يعقوبي", tel: "026513598" },
  { dept: "محضر الدائرة التاسعة (أرقام 9)", name: "رمضان الزحمان", tel: "026513782" },
  { dept: "محضر الدائرة العاشرة (أرقام 0)", name: "علي العرباني", tel: "026512251" },
  { dept: "محضر الدعاوى الكلية - الدائرة الأولى (1-2-5-6-7)", name: "زليخة فدعق", tel: "026513546", email: "z.fadaaq@adjd.gov.ae" },
  { dept: "محضر الدعاوى الكلية - الدائرة الثانية (3-4-8-9-0)", name: "حمدان الأحبابي", tel: "026513328", email: "hh.alahbi@adjd.gov.ae" },
];
adBailiffs.forEach(b => {
  add({
    courtName: "دائرة القضاء أبوظبي - قسم الإعلانات والمحضرين",
    emirate: "أبوظبي",
    department: b.dept,
    titleOrEmployee: b.name,
    phone: b.tel,
    extOrSeal: "إعلانات قضائية",
    email: b.email || "",
    operatingHours: "07:30 ص - 03:30 م",
    location: "أبوظبي - مجمع المحاكم",
    notes: "إعلان صحف الدعاوى والمذكرات والإنذارات القضائية"
  });
});

// Abu Dhabi Appeal Preparation (تحضير الاستئناف)
const adAppealPrep = [
  { dept: "تحضير استئناف أحوال شخصية (0-1-2-3)", name: "أحمد العطاس", tel: "026512619", email: "a.alattas@adjd.gov.ae" },
  { dept: "تحضير استئناف أحوال شخصية (4-5) وإيجارات (0-9)", name: "الحبيب ناصر", tel: "026512061", email: "a.alhayeed@adjd.gov.ae" },
  { dept: "تحضير استئناف أحوال شخصية (6-7-8-9)", name: "إسماعيل العامري", tel: "026512052", email: "i.fadel@adjd.gov.ae" },
  { dept: "تحضير استئناف مدني", name: "حامد العيدروس", tel: "026513300", email: "h.alaidarous@adjd.gov.ae" },
  { dept: "تحضير استئناف مدني وإداري", name: "عبدالله البلوشي", tel: "026513762", email: "Ah.alblooshi@adjd.gov.ae" },
  { dept: "تحضير استئناف تجاري (0-9)", name: "شيخة الشحي", tel: "026512851 / 026512852", email: "Sh.alshehhi@adjd.gov.ae" },
  { dept: "تحضير استئناف تجاري (1-3)", name: "رمضان خلف", tel: "026513782", email: "r.alzahman@adjd.gov.ae" },
  { dept: "تحضير استئناف تجاري (2-4)", name: "طارق الحامد", tel: "026513753", email: "ta.alhamed@adjd.gov.ae" },
  { dept: "تحضير استئناف تجاري (5-7)", name: "سلطان التميمي", tel: "026512036", email: "Su.altamimi@adjd.gov.ae" },
  { dept: "تحضير استئناف تجاري (6-8)", name: "فهد المهري", tel: "026512689", email: "f.almahri@adjd.gov.ae" },
];
adAppealPrep.forEach(p => {
  add({
    courtName: "دائرة القضاء أبوظبي - محكمة الاستئناف",
    emirate: "أبوظبي",
    department: p.dept,
    titleOrEmployee: p.name,
    phone: p.tel,
    extOrSeal: "تحضير استئناف",
    email: p.email,
    operatingHours: "07:30 ص - 03:30 م",
    location: "أبوظبي - مجمع المحاكم",
    notes: "مكتب إدارة الدعوى وتحضير ملفات الاستئناف"
  });
});

// Abu Dhabi Labor Court Prep
const adLaborPrep = [
  { dept: "تحضير عمالي 0 وكلي", name: "أحمد الجعفري", tel: "0506691916", email: "Ah.alawi@adjd.gov.ae" },
  { dept: "تحضير عمالي 1-3", name: "إبراهيم الحمادي", tel: "026513145", email: "" },
  { dept: "تحضير عمالي 2-4", name: "سعيد الظاهري", tel: "0508601003", email: "ss.aldhaheri@adjd.gov.ae" },
  { dept: "تحضير عمالي 5-7", name: "محمد العامري", tel: "0566666352", email: "md.alameri@adjd.gov.ae" },
  { dept: "تحضير عمالي 6-8", name: "خميس الحوسني", tel: "026513601", email: "k.alhosany@adjd.gov.ae" },
  { dept: "تحضير عمالي 9", name: "نسرين الرجيبي", tel: "026512939", email: "n.alregaibi@adjd.gov.ae" },
];
adLaborPrep.forEach(p => {
  add({
    courtName: "دائرة القضاء أبوظبي - المحكمة العمالية الابتدائية",
    emirate: "أبوظبي",
    department: p.dept,
    titleOrEmployee: p.name,
    phone: p.tel,
    extOrSeal: "عمالي",
    email: p.email,
    operatingHours: "07:30 ص - 03:30 م",
    location: "أبوظبي - المحكمة العمالية",
    notes: "تحضير الدعاوى العمالية الابتدائية"
  });
});

// Abu Dhabi Conciliation Center (التوفيق والمصالحة)
const adConciliation = [
  { name: "أحمد المنهالي", tel: "026512399" },
  { name: "حمد الكعبي", tel: "026512711" },
  { name: "حميدة الحمادي", tel: "026513076" },
  { name: "خالد المريخي", tel: "026512864" },
  { name: "راشد القبيسي", tel: "026512403" },
  { name: "سعيد النعيمي", tel: "026513725" },
  { name: "سلمى المنصوري", tel: "026512803" },
  { name: "صالح المريخي", tel: "026513364" },
  { name: "عبدالله المنهالي", tel: "026512399" },
  { name: "علي المزروعي", tel: "026512702" },
  { name: "فاطمة المرزوقي", tel: "026512860" },
  { name: "محمد الحوسني", tel: "026512638" },
  { name: "نادية المرزوقي", tel: "026513470" },
];
adConciliation.forEach(c => {
  add({
    courtName: "دائرة القضاء أبوظبي - مركز التوفيق والمصالحة",
    emirate: "أبوظبي",
    department: "المصلحون والوساطة والتسوية الودية",
    titleOrEmployee: `المصلح القضائي: ${c.name}`,
    phone: c.tel,
    extOrSeal: "توفيق ومصالحة",
    email: "info@adjd.gov.ae",
    operatingHours: "07:30 ص - 03:30 م",
    location: "أبوظبي - دائرة القضاء",
    notes: "تسوية النزاعات المدنية والتجارية صلحاً قبل الإحالة للمحكمة"
  });
});

// Abu Dhabi Cassation Court (محكمة النقض)
const adCassation = [
  { dept: "أمناء السر - الدائرة المدنية والتجارية بنقض أبوظبي", name: "أمين سر الدائرة المدنية والتجارية", tel: "026512000" },
  { dept: "أمناء السر - الدائرة الجزائية بنقض أبوظبي", name: "أمين سر الدائرة الجزائية", tel: "026512000" },
  { dept: "أمناء السر - دائرة الأحوال الشخصية بنقض أبوظبي", name: "أمين سر دائرة الأحوال الشخصية", tel: "026512000" },
  { dept: "أمناء السر - الدائرة الإدارية بنقض أبوظبي", name: "أمين سر الدائرة الإدارية", tel: "026512000" },
  { dept: "المكتب الفني لمحكمة النقض بأبوظبي", name: "رئيس المكتب الفني والباحثون", tel: "026512100" },
];
adCassation.forEach(c => {
  add({
    courtName: "دائرة القضاء أبوظبي - محكمة النقض",
    emirate: "أبوظبي",
    department: c.dept,
    titleOrEmployee: c.name,
    phone: c.tel,
    extOrSeal: "نقض أبوظبي",
    email: "info@adjd.gov.ae",
    operatingHours: "07:30 ص - 03:30 م",
    location: "أبوظبي - مجمع المحاكم",
    notes: "أعلى هيئة قضائية في إمارة أبوظبي - طعون النقض"
  });
});

// 3. SHARJAH COURTS & MUNICIPALITY DISPUTES (محاكم الشارقة وبلدية الشارقة)
// Sharjah Municipality Rental Disputes (فض المنازعات الإيجارية وتنظيم العقود)
const shjMun = [
  { dept: "رئيس قسم تصديق العقود الإيجارية", name: "حامد القائد", tel: "065931588", email: "Hamid.alqayed@shjmun.gov.ae" },
  { dept: "رئيس قسم تنظيم العقود الإيجارية", name: "وفاء المالكي", tel: "065931540", email: "Wafa.essa@shjmun.gov.ae" },
  { dept: "رئيس قسم تنفيذ المنازعات الإيجارية", name: "ندى العليلي", tel: "065931510", email: "Nada.alili@shjmun.gov.ae" },
  { dept: "رئيس قسم فض المنازعات الإيجارية", name: "طارق الزرعوني", tel: "065931514", email: "Tariq.zarouni@shjmun.gov.ae" },
  { dept: "تنفيذ المنازعات الإيجارية", name: "موزة خلفان / محمد الأغبري", tel: "065931628 / 065931623", email: "execution@shjmun.gov.ae" },
  { dept: "تنظيم العقود الإيجارية", name: "لبنى الشامسي", tel: "065931548", email: "lubna.obaid@shjmun.gov.ae" },
  { dept: "تنظيم العقود الإيجارية", name: "حصة يوسف", tel: "065931530", email: "hessa.yousif@shjmun.gov.ae" },
  { dept: "تصديق عقود الإيجار", name: "وليد هاشمي", tel: "065931611", email: "Waleed.mohamed@shjmun.gov.ae" },
  { dept: "تصديق عقود الإيجار", name: "منى المطوع", tel: "065931500", email: "Mona.almutawa@shjmun.gov.ae" },
  { dept: "تصديق عقود الإيجار", name: "سيف سالم", tel: "065931500", email: "saifw@shjmun.gov.ae" },
  { dept: "قسم فض المنازعات الإيجارية", name: "إبراهيم العبيدلي", tel: "065931512", email: "Ibrahim.obaidly@shjmun.gov.ae" },
  { dept: "فض المنازعات الإيجارية", name: "بنا الحوساني", tel: "065931515", email: "banna.hosany@shjmun.gov.ae" },
  { dept: "قسم تنفيذ المنازعات الإيجارية", name: "علي خلف", tel: "065931620", email: "Ali.khalaf@shjmun.gov.ae" },
];
shjMun.forEach(m => {
  add({
    courtName: "بلدية الشارقة - لجان فض المنازعات الإيجارية",
    emirate: "الشارقة",
    department: m.dept,
    titleOrEmployee: m.name,
    phone: m.tel,
    extOrSeal: "إيجارات الشارقة",
    email: m.email,
    operatingHours: "07:30 ص - 02:30 م",
    location: "الشارقة - إدارة التنظيم الإيجاري - المنطقة الصناعية 5",
    notes: "منازعات الإيجارات، تصديق وتنظيم العقود، وتنفيذ الأحكام الإيجارية بالإمارة"
  });
});

// Sharjah Federal Primary Court Clerks (محكمة الشارقة الاتحادية الابتدائية)
const shjPrimaryClerks = [
  { name: "إسماعيل البلوشي", tel: "065024220", email: "ialblooshi@moj.gov.ae" },
  { name: "أحمد بن خادم", tel: "065024217", email: "aalkhadem@moj.gov.ae" },
  { name: "أحمد صبري", tel: "065024266", email: "asabri@moj.gov.ae" },
  { name: "جمال المازمي", tel: "065024344", email: "galmazmi@moj.gov.ae" },
  { name: "حسين الشحي", tel: "065024225", email: "hshahi@moj.gov.ae" },
  { name: "حميد المازمي", tel: "065024268", email: "hmazmi@moj.gov.ae" },
  { name: "راشد النقبي", tel: "065024249", email: "ralnaqbi@moj.gov.ae" },
  { name: "زايد الشامسي", tel: "065024223", email: "zalshamsi@moj.gov.ae" },
  { name: "سالم المرزوقي", tel: "065024211", email: "salmarzooqi@moj.gov.ae" },
  { name: "سلطان آل علي", tel: "065024229", email: "salali@moj.gov.ae" },
  { name: "سيف آل علي", tel: "065024228", email: "salali@moj.gov.ae" },
  { name: "طارق عبدالحميد", tel: "065024231", email: "tabdelhamid@moj.gov.ae" },
  { name: "عبدالله الأميري", tel: "065024218", email: "aalamiri@moj.gov.ae" },
  { name: "عبدالله الرميثي", tel: "065024219", email: "aalromaithi@moj.gov.ae" },
  { name: "عمر شعبان", tel: "065024227", email: "oshaban@moj.gov.ae" },
  { name: "عيسى المازمي", tel: "065024221", email: "ealmazmi@moj.gov.ae" },
  { name: "فايز الحمادي", tel: "065024226", email: "falhammadi@moj.gov.ae" },
  { name: "محمد الكتبي", tel: "065024230", email: "malketbi@moj.gov.ae" },
  { name: "محمد سيف الشامسي", tel: "065024224", email: "malshamsi@moj.gov.ae" },
  { name: "مصبح الكعبي", tel: "065024222", email: "mmalkaabi@moj.gov.ae" },
  { name: "ياسر الهوتي", tel: "065024233", email: "yalhooti@moj.gov.ae" },
  { name: "يعقوب المازمي", tel: "065024234", email: "yalmazmi@moj.gov.ae" },
];
shjPrimaryClerks.forEach(c => {
  add({
    courtName: "محكمة الشارقة الاتحادية الابتدائية",
    emirate: "الشارقة",
    department: "أمناء السر - الدوائر المدنية والتجارية والعمالية والجزائية",
    titleOrEmployee: `أمين السر: ${c.name}`,
    phone: c.tel,
    extOrSeal: "أمانة سر الابتدائية",
    email: c.email,
    operatingHours: "07:30 ص - 02:30 م",
    location: "الشارقة - مبنى محكمة الشارقة الاتحادية - الخان / المجاز",
    notes: "أمناء سر الجلسات وإدارة الدعوى بالمحكمة الابتدائية"
  });
});

// Sharjah Sharia Court (محكمة الشارقة الشرعية)
// 1. Case Management & Registration (إدارة الدعوى وقيد الدعاوى)
add({
  courtName: "محكمة الشارقة الشرعية",
  emirate: "الشارقة",
  department: "قسم قيد الدعاوى والطعون والعرائض الشرعية",
  titleOrEmployee: "موظف القيد",
  phone: "065024569",
  extOrSeal: "قيد شرعي",
  email: "info@moj.gov.ae",
  operatingHours: "07:30 ص - 02:30 م",
  location: "الشارقة - مجمع المحاكم الشرعية - منطقة الفلج",
  notes: "قيد وتسجيل الدعاوى والطعون والطلبات القضائية بمحكمة الشارقة الشرعية"
});

add({
  courtName: "محكمة الشارقة الشرعية",
  emirate: "الشارقة",
  department: "مكتب إدارة الدعوى الشرعية",
  titleOrEmployee: "إدارة الدعوى: خالد عبدالله الشحي",
  phone: "065024625",
  extOrSeal: "إدارة دعوى",
  email: "info@moj.gov.ae",
  operatingHours: "07:30 ص - 02:30 م",
  location: "الشارقة - مجمع المحاكم الشرعية - منطقة الفلج",
  notes: "متابعة وإدارة الدعاوى الشرعية وإعداد وتجهيز ملفات القضايا"
});

add({
  courtName: "محكمة الشارقة الشرعية",
  emirate: "الشارقة",
  department: "مكتب إدارة الدعوى الشرعية",
  titleOrEmployee: "إدارة الدعوى: حمد عادل عبدالله ال علي",
  phone: "065024382",
  extOrSeal: "إدارة دعوى",
  email: "info@moj.gov.ae",
  operatingHours: "07:30 ص - 02:30 م",
  location: "الشارقة - مجمع المحاكم الشرعية - منطقة الفلج",
  notes: "متابعة وإدارة الدعاوى الشرعية وإعداد الجلسات"
});

// 2. Court Clerks (أمناء سر الدوائر الشرعية)
const shjShariaClerks = [
  { name: "إبراهيم", tel: "065024469" },
  { name: "أحمد المازمي", tel: "065024419" },
  { name: "أحمد بن عسكر", tel: "065024434" },
  { name: "أحمد سعيد آل علي", tel: "065024431" },
  { name: "أحمد عادل", tel: "065024470" },
  { name: "بدر المرزوقي", tel: "065024422" },
  { name: "جمال المازمي", tel: "065024445" },
  { name: "حسن المازمي", tel: "065024437" },
  { name: "حسين الشحي", tel: "065024425" },
  { name: "حمدان الكعبي", tel: "065024411" },
  { name: "حميد المازمي", tel: "065024468" },
  { name: "خالد المازمي", tel: "065024439" },
  { name: "خليفة المازمي", tel: "065024424" },
  { name: "خميس الحوسني", tel: "065024429" },
  { name: "راشد المسماري", tel: "065024448" },
  { name: "سالم المازمي", tel: "065024450" },
  { name: "سالم المرزوقي", tel: "065024410" },
];
shjShariaClerks.forEach(c => {
  add({
    courtName: "محكمة الشارقة الشرعية",
    emirate: "الشارقة",
    department: "أمناء السر - الأحوال الشخصية والتوجيه الأسري والتركات",
    titleOrEmployee: `أمين السر الشرعي: ${c.name}`,
    phone: c.tel,
    extOrSeal: "شرعي / أسري",
    email: "info@moj.gov.ae",
    operatingHours: "07:30 ص - 02:30 م",
    location: "الشارقة - مجمع المحاكم الشرعية - منطقة الفلج",
    notes: "قضايا الأحوال الشخصية، التوجيه الأسري، التركات، وتوثيق عقود الزواج والإشهادات"
  });
});

// Sharjah Branch Courts (محاكم الشارقة الفرعية: الذيد، خورفكان، كلباء، دبا الحصن، المدام)
const shjBranchCourts = [
  // 1. Al Dhaid Court (محكمة الذيد الجزئية - المنطقة الوسطى)
  { court: "محكمة الذيد الجزئية", dept: "قيد وتسجيل الدعاوى والطلبات القضائية بالذيد", name: "موظف القيد: سيف الطنيجي", tel: "068032740", email: "smalteneiji@moj.gov.ae", loc: "الذيد - مجمع المحاكم بالمنطقة الوسطى" },
  { court: "محكمة الذيد الجزئية", dept: "أمناء السر - الجلسات والدوائر الجزائية والمدنية", name: "أمين السر: حمد الطنيجي", tel: "068032729", email: "Hmalteneiji@moj.gov.ae", loc: "الذيد - مجمع المحاكم" },
  { court: "محكمة الذيد الجزئية", dept: "أمناء السر - الأحوال الشخصية والتوثيقات الشرعية", name: "أمين السر: سالم المرزوقي", tel: "068032711", email: "salmarzooqi@moj.gov.ae", loc: "الذيد - مجمع المحاكم" },
  { court: "محكمة الذيد الجزئية", dept: "إدارة التنفيذ والإنابات القضائية بالذيد", name: "مأمور التنفيذ بالذيد", tel: "068032750", email: "dhaid.execution@moj.gov.ae", loc: "الذيد - مجمع المحاكم" },
  { court: "محكمة الذيد الجزئية", dept: "الكاتب العدل والتوثيقات العامة بالذيد", name: "الكاتب العدل بالذيد", tel: "068032730", email: "dhaid.notary@moj.gov.ae", loc: "الذيد - مجمع المحاكم" },
  { court: "محكمة الذيد الجزئية", dept: "نيابة الذيد الجزئية", name: "أمانة سر نيابة الذيد", tel: "068822200 / 068822222", email: "dhaid.prosecution@pp.gov.ae", loc: "الذيد - مجمع النيابات" },

  // 2. Khorfakkan Court (محكمة خورفكان الكلية والاستئنافية - المنطقة الشرقية)
  { court: "محكمة خورفكان الاتحادية الابتدائية والاستئنافية", dept: "مركز خدمة المتعاملين والاستعلامات الرئيسي", name: "أمانة سر محكمة خورفكان", tel: "092386111 / 092387777", email: "khorfakkan.court@moj.gov.ae", loc: "خورفكان - مجمع المحاكم الاتحادية" },
  { court: "محكمة خورفكان الاتحادية الابتدائية والاستئنافية", dept: "قيد وإدارة الدعاوى المدنية والتجارية", name: "مكتب إدارة الدعوى بخورفكان", tel: "092386120", email: "khorfakkan.court@moj.gov.ae", loc: "خورفكان - مجمع المحاكم" },
  { court: "محكمة خورفكان الاتحادية الابتدائية والاستئنافية", dept: "أمناء السر - الدوائر الجزائية والجنائية والجنح", name: "أمين سر الجنايات والجنح", tel: "092386135", email: "khorfakkan.court@moj.gov.ae", loc: "خورفكان - مجمع المحاكم" },
  { court: "محكمة خورفكان الاتحادية الابتدائية والاستئنافية", dept: "إدارة التنفيذ والإنابات بخورفكان", name: "مأمورو التنفيذ والأختام", tel: "092386130", email: "khorfakkan.execution@moj.gov.ae", loc: "خورفكان - مجمع المحاكم" },
  { court: "محكمة خورفكان الاتحادية الابتدائية والاستئنافية", dept: "الكاتب العدل والتوثيقات بخورفكان", name: "الكاتب العدل بخورفكان", tel: "092386150", email: "khorfakkan.notary@moj.gov.ae", loc: "خورفكان - مجمع المحاكم" },
  { court: "محكمة خورفكان الاتحادية الابتدائية والاستئنافية", dept: "نيابة خورفكان الكلية", name: "أمانة سر نيابة خورفكان", tel: "092386200", email: "khorfakkan.prosecution@pp.gov.ae", loc: "خورفكان - مجمع النيابات" },

  // 3. Kalba Court (محكمة كلباء الجزئية - المنطقة الشرقية)
  { court: "محكمة كلباء الجزئية", dept: "أمانة سر المحكمة والخدمات القضائية", name: "أمين السر: أحمد المازمي", tel: "092778114 / 092778100", email: "kalba.court@moj.gov.ae", loc: "كلباء - مجمع المحاكم" },
  { court: "محكمة كلباء الجزئية", dept: "قيد وإدارة الدعاوى والتوثيقات بكلباء", name: "موظف القيد وإدارة الدعوى", tel: "092778120", email: "kalba.court@moj.gov.ae", loc: "كلباء - مجمع المحاكم" },
  { court: "محكمة كلباء الجزئية", dept: "الكاتب العدل والتوثيقات بكلباء", name: "الكاتب العدل بكلباء", tel: "092778130", email: "kalba.notary@moj.gov.ae", loc: "كلباء - مجمع المحاكم" },
  { court: "محكمة كلباء الجزئية", dept: "نيابة كلباء الجزئية", name: "أمانة سر نيابة كلباء", tel: "092778200", email: "kalba.prosecution@pp.gov.ae", loc: "كلباء - مجمع النيابات" },

  // 4. Dibba Al Hisn Court (محكمة دبا الحصن الجزئية - المنطقة الشرقية)
  { court: "محكمة دبا الحصن الجزئية", dept: "أمانة السر وقيد الدعاوى والخدمات القضائية", name: "أمانة سر محكمة دبا الحصن", tel: "092053600 / 092053629", email: "dibbahisn.court@moj.gov.ae", loc: "دبا الحصن - مجمع الدوائر الحكومية" },
  { court: "محكمة دبا الحصن الجزئية", dept: "الكاتب العدل والتوثيق والعرائض بدبا الحصن", name: "الكاتب العدل بدبا الحصن", tel: "092053610", email: "dibbahisn.notary@moj.gov.ae", loc: "دبا الحصن - مجمع الدوائر الحكومية" },
  { court: "محكمة دبا الحصن الجزئية", dept: "نيابة دبا الحصن الجزئية", name: "أمانة سر نيابة دبا الحصن", tel: "092053650", email: "dibbahisn.prosecution@pp.gov.ae", loc: "دبا الحصن - مجمع النيابات" },

  // 5. Al Madam Court (محكمة المدام الجزئية - المنطقة الوسطى)
  { court: "محكمة المدام الجزئية", dept: "مكتب المحكمة والخدمات القضائية وقيد الدعاوى", name: "مسؤول محكمة المدام", tel: "068828000", email: "almadam.court@moj.gov.ae", loc: "المدام - المنطقة الوسطى" },
  { court: "محكمة المدام الجزئية", dept: "الكاتب العدل والتوثيقات العامة بالمدام", name: "الكاتب العدل بالمدام", tel: "068828010", email: "almadam.notary@moj.gov.ae", loc: "المدام - المنطقة الوسطى" },
  { court: "محكمة المدام الجزئية", dept: "نيابة المدام الجزئية", name: "أمانة سر نيابة المدام", tel: "068828020", email: "almadam.prosecution@pp.gov.ae", loc: "المدام - المنطقة الوسطى" },
];
shjBranchCourts.forEach(b => {
  add({
    courtName: b.court,
    emirate: "الشارقة",
    department: b.dept,
    titleOrEmployee: b.name,
    phone: b.tel,
    extOrSeal: "فرع محكمة بالشارقة",
    email: b.email,
    operatingHours: "07:30 ص - 02:30 م",
    location: b.loc || b.court.replace("محكمة ", ""),
    notes: "الخدمات القضائية والدوائر والمحاكم في " + b.court
  });
});

// 4. AJMAN COURTS (محاكم عجمان الاتحادية)
const ajmanCourts = [
  { dept: "أمين سر - الدوائر المدنية والتجارية", name: "عبدالله المازمي", tel: "067035624", email: "aalmazmi@moj.gov.ae" },
  { dept: "أمين سر - الدوائر العمالية", name: "أحمد صبري", tel: "067035625", email: "asabri@moj.gov.ae" },
  { dept: "أمين سر - دوائر الجنايات والجنح", name: "حسين الشحي", tel: "067035626", email: "hshahi@moj.gov.ae" },
  { dept: "أمين سر - الأحوال الشخصية والتوجيه الأسري", name: "حميد المازمي", tel: "067035627", email: "hmazmi@moj.gov.ae" },
  { dept: "إدارة التنفيذ والإنابات القضائية بعجمان", name: "مأمورو التنفيذ والأختام", tel: "067035600", email: "execution.ajm@moj.gov.ae" },
  { dept: "الكاتب العدل والتوثيقات بعجمان", name: "الكاتب العدل العام", tel: "067035650", email: "notary.ajm@moj.gov.ae" },
  { dept: "نيابة عجمان الكلية والاستئنافية", name: "أمانة سر النيابة الكلية", tel: "067035700", email: "ajman.prosecution@pp.gov.ae" },
];
ajmanCourts.forEach(a => {
  add({
    courtName: "محكمة عجمان الاتحادية الابتدائية والاستئنافية",
    emirate: "عجمان",
    department: a.dept,
    titleOrEmployee: a.name,
    phone: a.tel,
    extOrSeal: "محاكم عجمان",
    email: a.email,
    operatingHours: "07:30 ص - 02:30 م",
    location: "عجمان - منطقة الجرف - شارع الشيخ عمار بن حميد",
    notes: "مجمع محاكم ونيابات عجمان الاتحادية"
  });
});

// 5. RAS AL KHAIMAH COURTS (محاكم رأس الخيمة)
const rakClerks = [
  { dept: "أمين سر الاستئناف الإداري", name: "أحمد علي القاسمي", tel: "072070513" },
  { dept: "أمين سر الاستئناف الجزائي - الدائرة الأولى", name: "حميد أحمد غياث", tel: "072070522" },
  { dept: "أمين سر الاستئناف الجزائي - الدائرة الثانية", name: "سعيد راشد الوالي", tel: "072070512" },
  { dept: "أمين سر الاستئناف العمالي الكلي - الدائرة الأولى", name: "حمد محمد الزعابي", tel: "072070518" },
  { dept: "أمين سر الاستئناف العمالي الكلي - الدائرة الثانية", name: "جمال محمد الطنيجي", tel: "072070515" },
  { dept: "أمين سر الاستئناف المدني والتجاري - الدائرة الأولى", name: "عبدالله حسن الحبسي", tel: "072070525" },
  { dept: "أمين سر الاستئناف المدني والتجاري - الدائرة الثانية", name: "سلطان حسن بني شميلي", tel: "072070524" },
  { dept: "أمين سر الاستئناف المدني والتجاري - الدائرة الثالثة", name: "محمد راشد الشحي", tel: "072070528" },
  { dept: "أمين سر استئناف الأحوال الشخصية", name: "أحمد سيف", tel: "072070471" },
  { dept: "أمين سر محكمة التمييز المدنية والتجارية", name: "أمين سر دائرة التمييز", tel: "072070500" },
  { dept: "أمين سر محكمة التمييز الجزائية", name: "أمين سر دائرة التمييز الجزائي", tel: "072070501" },
  { dept: "أمين سر محكمة الجنايات الابتدائية", name: "مساعد محمد الشحي", tel: "072070520" },
  { dept: "أمين سر محكمة الجنح الابتدائية", name: "علي سعيد الشحي", tel: "072070521" },
  { dept: "أمين سر الدائرة المدنية الكلية", name: "عمر أحمد الخاطري", tel: "072070530" },
  { dept: "أمين سر الدائرة التجارية الكلية", name: "راشد سالم النعيمي", tel: "072070531" },
  { dept: "أمين سر الدائرة العمالية الجزئية", name: "سالم محمد الشامسي", tel: "072070532" },
  { dept: "أمين سر قضايا التنفيذ والإنابات", name: "أحمد حسن المنصوري", tel: "072070540" },
  { dept: "إدارة الكاتب العدل والتوثيقات برأس الخيمة", name: "الكاتب العدل العام", tel: "072070400" },
  { dept: "إدارة التوجيه والإصلاح الأسري برأس الخيمة", name: "قسم الموجهين الأسريين", tel: "072070450" },
  { dept: "مركز الاتصال وخدمة المتعاملين بمحاكم رأس الخيمة", name: "إسعاد المتعاملين", tel: "072070000 / 072070111", email: "info@rakcourts.rak.ae" },
];
rakClerks.forEach(r => {
  add({
    courtName: "محاكم رأس الخيمة",
    emirate: "رأس الخيمة",
    department: r.dept,
    titleOrEmployee: r.name,
    phone: r.tel,
    extOrSeal: "محاكم رأس الخيمة",
    email: r.email || "info@rakcourts.rak.ae",
    operatingHours: "07:30 ص - 03:00 م",
    location: "رأس الخيمة - منطقة الظيت الجنوبي - مجمع المحاكم",
    notes: "محاكم رأس الخيمة الابتدائية والاستئناف والتمييز والتنفيذ"
  });
});

// 6. UMM AL QUWAIN COURTS (محاكم أم القيوين الاتحادية)
const uaqCourts = [
  { dept: "استعلامات ومركز خدمة المتعاملين", name: "مركز خدمة المتعاملين", tel: "067656666", email: "uaq.court@moj.gov.ae" },
  { dept: "أمناء السر - المدني والتجاري والعمالي", name: "أمين سر المحكمة", tel: "067656601", email: "uaq.court@moj.gov.ae" },
  { dept: "أمناء السر - الجزائي والجنايات والجنح", name: "أمين سر الجزائي", tel: "067656602", email: "uaq.court@moj.gov.ae" },
  { dept: "أمناء السر - الأحوال الشخصية والتوجيه الأسري", name: "أمين سر الأحوال الشخصية", tel: "067656603", email: "uaq.court@moj.gov.ae" },
  { dept: "إدارة التنفيذ والإنابات القضائية", name: "مأمورو التنفيذ", tel: "067656620", email: "execution.uaq@moj.gov.ae" },
  { dept: "الكاتب العدل والتوثيقات بأم القيوين", name: "الكاتب العدل العام", tel: "067656630", email: "notary.uaq@moj.gov.ae" },
  { dept: "محكمة فلج المعلا الجزئية", name: "مكتب المحكمة والخدمات القضائية", tel: "067681444", email: "falaj.court@moj.gov.ae" },
  { dept: "نيابة أم القيوين الكلية", name: "أمانة سر النيابة", tel: "067656700", email: "uaq.prosecution@pp.gov.ae" },
];
uaqCourts.forEach(u => {
  add({
    courtName: u.dept.includes("فلج") ? "محكمة فلج المعلا الجزئية" : "محكمة أم القيوين الاتحادية الابتدائية والاستئنافية",
    emirate: "أم القيوين",
    department: u.dept,
    titleOrEmployee: u.name,
    phone: u.tel,
    extOrSeal: "محكمة أم القيوين",
    email: u.email,
    operatingHours: "07:30 ص - 02:30 م",
    location: "أم القيوين - منطقة الروضة - مجمع المحاكم الاتحادية",
    notes: "الخدمات القضائية والتوثيق وإدارة الدعوى بأم القيوين"
  });
});

// 7. FUJAIRAH COURTS (محاكم الفجيرة الاتحادية)
const fujCourts = [
  { dept: "رئيس محكمة الفجيرة الابتدائية وسكرتاريته", name: "سعادة رئيس المحكمة / أحمد المسماري", tel: "092015202 / 092015203", email: "president.fuj@moj.gov.ae" },
  { dept: "إدارة الخدمات المساندة والاستعلامات والشكاوى", name: "مريم اليماحي / استعلامات المحكمة", tel: "092015206 / 092015200 / 092015205", email: "complaints@moj.gov.ae" },
  { dept: "أمناء السر - مدني وتجاري وعمالي", name: "أحمد راشد", tel: "092015214", email: "amohamed@moj.gov.ae" },
  { dept: "أمناء السر - مدني وتجاري وعمالي", name: "حمد الطنيجي", tel: "092015229", email: "Hmalteneiji@moj.gov.ae" },
  { dept: "أمناء السر - مدني وتجاري وعمالي", name: "سالم المرزوقي", tel: "092015211", email: "salmarzooqi@moj.gov.ae" },
  { dept: "أمين سر دائرة الجنايات المستأنفة", name: "أحمد اليماحي", tel: "092015263", email: "aalyamahi@moj.gov.ae" },
  { dept: "أمين سر دائرة الأحوال الشخصية المستأنفة", name: "حمدان الكعبي", tel: "092015264", email: "halkaabi@moj.gov.ae" },
  { dept: "أمين سر الدائرة العمالية المستأنفة", name: "سلطان الظنحاني", tel: "092015265", email: "sdhanhani@moj.gov.ae" },
  { dept: "أمين سر الدائرة التجارية المستأنفة", name: "فيصل الحمودي", tel: "092015266", email: "falhamoudi@moj.gov.ae" },
  { dept: "أمين سر التوجيه الأسري", name: "راشد عبيد / محمد الحفيتي / مريم المسماري", tel: "092015292 / 092015293 / 092015294", email: "ralobaid@moj.gov.ae" },
  { dept: "مصلح أسري", name: "موزة اليماحي", tel: "092015295", email: "malyamahi@moj.gov.ae" },
  { dept: "أمين سر التوثيقات وعقود الزواج", name: "حصة الكعبي", tel: "092015277", email: "halkaabi@moj.gov.ae" },
  { dept: "رئيس قسم التنفيذ وأمناء سر التنفيذ", name: "علي اليماحي / أحمد الحفيتي / خالد الزيودي / سعيد الصريدي", tel: "092015236 / 092015226 / 092015227 / 092015228", email: "aalyamahi@moj.gov.ae" },
  { dept: "الإيداعات والتحويلات البنكية والمحاسبة", name: "فاطمة الحمودي / سالم الظنحاني", tel: "092015233 / 092015234", email: "falhamoudi@moj.gov.ae" },
  { dept: "استعلامات مركز التوفيق والمصالحة", name: "موظف المركز", tel: "092015280", email: "info@moj.gov.ae" },
  { dept: "محكمة دبا الفجيرة الاتحادية الابتدائية", name: "أمانة سر محكمة دبا الفجيرة", tel: "092045500 / 092045529", email: "dibba.court@moj.gov.ae" },
];
fujCourts.forEach(f => {
  add({
    courtName: f.dept.includes("دبا") ? "محكمة دبا الفجيرة الاتحادية الابتدائية" : "محكمة الفجيرة الاتحادية الابتدائية والاستئنافية",
    emirate: "الفجيرة",
    department: f.dept,
    titleOrEmployee: f.name,
    phone: f.tel,
    extOrSeal: "محاكم الفجيرة",
    email: f.email,
    operatingHours: "07:30 ص - 02:30 م",
    location: "الفجيرة - شارع الفصيل - مجمع المحاكم الاتحادية",
    notes: "محاكم الفجيرة الابتدائية والاستئناف والتنفيذ والتوثيقات"
  });
});

// 8. CORRECTIONAL & PUNITIVE ESTABLISHMENTS & PRISONS (المؤسسات العقابية والإصلاحية والسجون والتوقيف)
const penalEstabs = [
  {
    court: "إدارة المؤسسة العقابية والإصلاحية الاتحادية - أبوظبي",
    emirate: "أبوظبي",
    dept: "الإدارة العامة والتواصل والمكتب",
    name: "إدارة المنشآت العقابية والإصلاحية",
    tel: "024020666 / 024020619 / 0508444958 (واتساب)",
    email: "analhebsi@moi.gov.ae",
    hours: "الأحد-الخميس: 08:00 ص - 02:00 ظ | الجمعة: 08:00 ص - 11:00 ص",
    loc: "أبوظبي - القيادة العامة لشرطة أبوظبي / وزارة الداخلية",
    notes: "التواصل الرسمي للاستفسارات، تصاريح الزيارة، والكاتب العدل بالسجون"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - الوثبة (أبوظبي)",
    emirate: "أبوظبي",
    dept: "إدارة سجن الوثبة المركزي والكاتب العدل بالمنشأة",
    name: "مكتب الكاتب العدل وإدارة شؤون النزلاء بالوثبة",
    tel: "025047228 / 025047000",
    email: "notarywathba@adpolice.gov.ae",
    hours: "07:30 ص - 02:30 م (ما عدا العطل الرسمية)",
    loc: "أبوظبي - منطقة الوثبة",
    notes: "سجن الوثبة المركزي - توثيق الوكالات للنزلاء وتصاريح الزيارات والتواصل القضائي"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - العين",
    emirate: "أبوظبي",
    dept: "إدارة سجن العين المركزي والكاتب العدل بالمنشأة",
    name: "مكتب الكاتب العدل وإدارة النزلاء بالعين",
    tel: "037152880 / 037152000",
    email: "YousifK.Alnaqbi@adpolice.gov.ae / yalnaqbi@adpolice.gov.ae",
    hours: "07:30 ص - 02:30 م",
    loc: "العين - مجمع المنشآت العقابية بالعين",
    notes: "سجن العين المركزي - خدمات النزلاء، تصاريح المحامين، والتوثيق العدلي"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - دبي (العوير)",
    emirate: "دبي",
    dept: "الإدارة العامة للمؤسسات العقابية والإصلاحية بدبي",
    name: "إدارة سجن العوير المركزي وشؤون النزلاء والمحامين",
    tel: "042138888 / 042138777 / 901",
    email: "mail@dubaipolice.gov.ae",
    hours: "07:30 ص - 03:30 م",
    loc: "دبي - العوير",
    notes: "سجن العوير المركزي بدبي - تصاريح زيارة النزلاء، الكاتب العدل، والتوكيلات"
  },
  {
    court: "قسم شرطة بر دبي - قسم التوقيف والسجن",
    emirate: "دبي",
    dept: "فرع التوقيف والنزلاء - مركز شرطة بر دبي",
    name: "مسؤول قسم التوقيف",
    tel: "043981111 / 046095555",
    email: "bd.jail@dubaipolice.gov.ae / AAA.HAMMADI@dubaipolice.gov.ae",
    hours: "خدمة متواصلة على مدار الساعة",
    loc: "دبي - بر دبي",
    notes: "متابعة الموقوفين في قسم شرطة بر دبي والتحقيقات"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - الشارقة",
    emirate: "الشارقة",
    dept: "السجن المركزي بالشارقة (رجال ونساء) وشؤون النزلاء",
    name: "إدارة المؤسسة العقابية وشؤون النزلاء بالشارقة",
    tel: "065063555 / 065063444",
    email: "SERVICES.CPOD@SHJPOLICE.GOV.AE / Inmateaffair.cpod@shjpolice.gov.ae / Central.jail4@gmail.com",
    hours: "07:30 ص - 02:30 م",
    loc: "الشارقة - منطقة الفشت / المنطقة الصناعية",
    notes: "سجن الشارقة المركزي (رجال ونساء) - تصاريح الزيارة وشؤون النزلاء والتوثيقات"
  },
  {
    court: "إدارة التحريات والمباحث الجنائية وفرع التوقيف - الشارقة",
    emirate: "الشارقة",
    dept: "فرع التوقيف والموقوفين بالتحريات ومراكز الشرطة",
    name: "مسؤول فرع التوقيف",
    tel: "065631111 / 065943222",
    email: "cid.detention@shjpolice.gov.ae",
    hours: "على مدار الساعة",
    loc: "الشارقة - إدارة التحريات",
    notes: "الاستعلام عن الموقوفين وقضايا التحريات بالشارقة"
  },
  {
    court: "مراكز شرطة الشارقة (البحيرة / الصناعية / الغرب / واسط / خورفكان)",
    emirate: "الشارقة",
    dept: "أقسام التوقيف والحراسات بمراكز الشرطة الشاملة",
    name: "مسؤولو أقسام التوقيف بمراكز شرطة الشارقة",
    tel: "065658888 (البحيرة) / 065646666 (الغرب) / 065481111 (واسط) / 092370000 (خورفكان)",
    email: "albuhairaps@shjpolice.gov.ae / Wasit.cpod@shjpolice.gov.ae / Khor.police@shjpolice.gov.ae",
    hours: "24/7",
    loc: "الشارقة ومراكز المناطق",
    notes: "متابعة الموقوفين في مراكز الشرطة الشاملة بإمارة الشارقة"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - عجمان",
    emirate: "عجمان",
    dept: "إدارة سجن عجمان المركزي ومركز المدينة الشامل",
    name: "مسؤول شؤون النزلاء وإدارة المؤسسة",
    tel: "067034000 / 067034444",
    email: "Naser.a@ajmanpolice.gov.ae / nalajmani@moi.gov.ae / Madinah@Ajmanpolice.gov.ae",
    hours: "07:30 ص - 02:30 م",
    loc: "عجمان - منطقة الجرف",
    notes: "سجن عجمان المركزي ومركز المدينة - استعلامات النزلاء وتصاريح المحامين"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - رأس الخيمة",
    emirate: "رأس الخيمة",
    dept: "إدارة السجن المركزي برأس الخيمة وشؤون النزلاء",
    name: "إدارة المؤسسة العقابية برأس الخيمة",
    tel: "072053333 / 072053000",
    email: "punitive@rakpolice.gov.ae",
    hours: "07:30 ص - 02:30 م",
    loc: "رأس الخيمة - منطقة الفلية",
    notes: "سجن رأس الخيمة المركزي - خدمات وتصاريح النزلاء والتوكيلات"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - أم القيوين",
    emirate: "أم القيوين",
    dept: "إدارة سجن أم القيوين المركزي وشؤون النزلاء",
    name: "مسؤول إدارة السجن المركزي",
    tel: "067062000 / 067062222",
    email: "Jail@uaqpolice.gov.ae / jail@uaqpolice.gov.ae",
    hours: "07:30 ص - 02:30 م",
    loc: "أم القيوين - القيادة العامة لشرطة أم القيوين",
    notes: "سجن أم القيوين المركزي - خدمات وتصاريح النزلاء والوكالات"
  },
  {
    court: "المؤسسة العقابية والإصلاحية - الفجيرة",
    emirate: "الفجيرة",
    dept: "إدارة المؤسسة العقابية والإصلاحية بالفجيرة",
    name: "مسؤول شؤون النزلاء وإدارة السجن",
    tel: "092051100 / 092051222",
    email: "rpefuj@gmail.com / punitive.fuj@fujpolice.gov.ae",
    hours: "07:30 ص - 02:30 م",
    loc: "الفجيرة - الحيل",
    notes: "سجن الفجيرة المركزي - خدمات المحامين والنزلاء والتوثيقات"
  },
];
penalEstabs.forEach(p => {
  add({
    courtName: p.court,
    emirate: p.emirate,
    department: p.dept,
    titleOrEmployee: p.name,
    phone: p.tel,
    extOrSeal: "مؤسسة عقابية / سجن",
    email: p.email,
    operatingHours: p.hours,
    location: p.loc,
    notes: p.notes
  });
});

export const seedCourtContacts: CourtContact[] = clean;
