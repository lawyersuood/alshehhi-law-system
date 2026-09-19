/* نظام الصلاحيات — مستخرج من App.tsx */
import type { SystemModuleDef, RolePermissions, UserItem } from "./types";

export const PERMISSION_MODULES: SystemModuleDef[] = [
  // 1. العمليات القانونية (5 أقسام)
  {
    id: "dashboard",
    label: "لوحة التحكم والأداء",
    desc: "الوصول للإحصائيات ونظرة عامة على المكتب ومؤشرات الأداء",
    category: "العمليات القانونية",
    navTabIds: ["dashboard"],
  },
  {
    id: "cases",
    label: "القضايا",
    desc: "إدارة الملفات والقضايا والدعاوى ومراحل التقاضي",
    category: "العمليات القانونية",
    navTabIds: ["cases"],
  },
  {
    id: "calendar",
    label: "الجلسات والرول",
    desc: "جدولة ومتابعة جلسات المحاكم وقاعاتها والقرارات",
    category: "العمليات القانونية",
    navTabIds: ["hearings"],
  },
  {
    id: "clients",
    label: "الموكلين والعملاء",
    desc: "سجل بيانات الموكلين والأفراد والشركات والجهات",
    category: "العمليات القانونية",
    navTabIds: ["clients"],
  },
  {
    id: "bookingConsultation",
    label: "حجز الاستشارات المرئية",
    desc: "إدارة ومتابعة طلبات الاستشارات المرئية وأرباحها",
    category: "العمليات القانونية",
    navTabIds: ["booking_consultation"],
  },

  // 2. التواصل والمهام (4 أقسام)
  {
    id: "tasks",
    label: "المهام والتكليفات",
    desc: "إسناد ومتابعة المهام الإدارية والقانونية لفريق العمل",
    category: "التواصل والمهام",
    navTabIds: ["tasks"],
  },
  {
    id: "whatsapp",
    label: "واتساب المكتب المدمج",
    desc: "المراسلات الفورية وتنبيهات الموكلين المباشرة",
    category: "التواصل والمهام",
    navTabIds: ["whatsapp_office"],
  },
  {
    id: "email",
    label: "البريد الإلكتروني المدمج",
    desc: "الاطلاع واستخدام البريد الإلكتروني الرسمي للمكتب",
    category: "التواصل والمهام",
    navTabIds: ["inapp_email"],
  },
  {
    id: "directory",
    label: "دليل المحاكم والجهات",
    desc: "دليل التواصل المباشر مع محاكم ونيابات الدولة",
    category: "التواصل والمهام",
    navTabIds: ["courts_directory"],
  },
  {
    id: "colleagues",
    label: "الزملاء والإنابات",
    desc: "دليل المحامين المتعاونين وإصدار إنابات الحضور بالجلسات",
    category: "التواصل والمهام",
    navTabIds: ["colleagues"],
  },

  // 3. المالية والعقود والمستندات (4 أقسام)
  {
    id: "docs",
    label: "المستندات والأرشيف الإلكتروني",
    desc: "أرشفة وتصنيف ملفات القضايا والوثائق الرسمية",
    category: "المالية والعقود",
    navTabIds: ["docs"],
  },
  {
    id: "poa",
    label: "الوكالات القانونية",
    desc: "متابعة صلاحية وسريان الوكالات وتنبيهات الانتهاء",
    category: "المالية والعقود",
    navTabIds: ["poa"],
  },
  {
    id: "agreements",
    label: "اتفاقيات أتعاب المكتب",
    desc: "صياغة وإنشاء واعتماد اتفاقيات الأتعاب وجدول الدفعات",
    category: "المالية والعقود",
    navTabIds: ["office_agreement"],
  },
  {
    id: "finance",
    label: "الفواتير والضريبة والحسابات",
    desc: "إصدار الفواتير الضريبية 5% وسندات القبض ومتابعة الذمم",
    category: "المالية والعقود",
    navTabIds: ["invoices"],
  },

  // 4. الإدارة والامتثال والرقابة (5 أقسام)
  {
    id: "kyc",
    label: "اعرف عميلك (KYC) والامتثال",
    desc: "مراجعات الفحص والامتثال لمعايير مكافحة غسل الأموال",
    category: "الإدارة والامتثال",
    navTabIds: ["kyc"],
  },
  {
    id: "precedents",
    label: "المبادئ والأحكام القضائية",
    desc: "مكتبة وسجل المبادئ القانونية وسوابق التمييز والاتحادية",
    category: "الإدارة والامتثال",
    navTabIds: ["precedents"],
  },
  {
    id: "hr",
    label: "الموظفون والكادر (HR)",
    desc: "إدارة الكادر الوظيفي والرواتب والإجازات والمصروفات",
    category: "الإدارة والامتثال",
    navTabIds: ["employees"],
  },
  {
    id: "auditLog",
    label: "سجل التدقيق والأنشطة (Audit Log)",
    desc: "رقابة وتتبع عمليات الحذف والتعديل وتغييرات الصلاحيات الحساسة",
    category: "الإدارة والامتثال",
    navTabIds: ["audit_log"],
  },
  {
    id: "manageUsers",
    label: "المستخدمون وإدارة الصلاحيات",
    desc: "إضافة وتعديل واعتماد حسابات الموظفين وتخصيص الأدوار",
    category: "الإدارة والامتثال",
    navTabIds: ["users"],
  },
  {
    id: "policies",
    label: "السياسات الداخلية للمكتب",
    desc: "لائحة السياسات والإجراءات الإدارية الداخلية المعتمدة من المكتب",
    category: "الإدارة والامتثال",
    navTabIds: ["policies"],
  },
];

export const DETAILED_ACTION_PERMISSIONS: Array<{
  id: keyof RolePermissions;
  label: string;
  desc: string;
  category: string;
  isSensitive?: boolean;
}> = [
  // 1. عمليات القيد والتعديل
  {
    id: "manageCases",
    label: "قيد وتعديل ملفات القضايا",
    desc: "إضافة ملفات جديدة وتعديل بيانات الدعوى ومراحل التقاضي",
    category: "التقاضي والمحاكم",
  },
  {
    id: "manageHearings",
    label: "جدولة وتحديث الجلسات والرول",
    desc: "إضافة وتعديل وتحديث قرارات جلسات المحاكم والرول",
    category: "التقاضي والمحاكم",
  },
  {
    id: "manageTasks",
    label: "إسناد وإدارة ومتابعة المهام",
    desc: "إنشاء المهام وتعيين المسؤولين ومتابعة مؤشرات الإنجاز",
    category: "المهام والتشغيل",
  },
  {
    id: "manageClients",
    label: "إدارة بيانات الموكلين",
    desc: "إضافة وتعديل وتحديث سجلات الموكلين والأطراف",
    category: "الموكلين والعملاء",
  },
  {
    id: "manageDocs",
    label: "إدارة ورفع مستندات الأرشيف",
    desc: "رفع وحفظ وتنزيل وثائق القضايا والمرفقات القانونية",
    category: "المستندات والعقود",
  },
  {
    id: "managePoa",
    label: "إدارة وتحديث الوكالات القانونية",
    desc: "قيد وتجديد وتعديل بيانات وسجلات الوكالات والتنبيهات",
    category: "المستندات والعقود",
  },
  {
    id: "manageAgreements",
    label: "صياغة واعتماد اتفاقيات الأتعاب",
    desc: "إنشاء عقود أتعاب جديدة وتحديد الدفعات المالية للمكتب",
    category: "المالية والعقود",
  },
  {
    id: "viewInvoices",
    label: "الاطلاع على الحسابات والفواتير",
    desc: "عرض تفاصيل المبالغ والأتعاب وسندات القبض المسددة والمتبقية",
    category: "المالية والضريبة",
  },
  {
    id: "manageInvoices",
    label: "إصدار وتعديل الفواتير والضريبة",
    desc: "تحرير الفواتير الضريبية 5% وسندات القبض وربطها بالدفعات",
    category: "المالية والضريبة",
  },
  {
    id: "manageKyc",
    label: "إدارة وفحص اعرف عميلك KYC",
    desc: "تعبئة واعتماد استمارات التدقيق والتحقق من الهوية والامتثال",
    category: "الامتثال والرقابة",
  },
  {
    id: "manageEmployees",
    label: "إدارة الكادر والرواتب (HR)",
    desc: "إضافة وتعديل بيانات الموظفين وعقودهم ورواتبهم ومصروفاتهم",
    category: "الإدارة والموارد",
  },
  {
    id: "managePrecedents",
    label: "إدارة المبادئ القضائية",
    desc: "إضافة وتحديث وتصنيف السوابق والأحكام التمييزية والاتحادية",
    category: "الإدارة والمعرفة",
  },
  {
    id: "viewReports",
    label: "التقارير التحليلية المتقدمة",
    desc: "استخراج ومراجعة تقارير الأداء المالي والتشغيلي ومؤشرات القضايا",
    category: "الإدارة والمعرفة",
  },
  {
    id: "exportData",
    label: "تصدير واستعادة النسخ الاحتياطية",
    desc: "تصدير قواعد بيانات المكتب بصيغة JSON وملفات PDF وطباعتها",
    category: "النظام والأمان",
    isSensitive: true,
  },
  {
    id: "manageColleagues",
    label: "إدارة الزملاء وإصدار الإنابات",
    desc: "إضافة وتعديل بيانات المحامين المتعاونين وإصدار إنابات الحضور",
    category: "الزملاء والإنابات",
  },
  {
    id: "manageLetterheadAssets",
    label: "إدارة الهوية الرسمية (الورق والتوقيع والختم)",
    desc: "صلاحية حساسة لرفع أو تغيير صور الورق الرسمي والتوقيع والختم المعتمدة، من قسم الهوية الرسمية المحمي",
    category: "النظام والأمان",
    isSensitive: true,
  },
  {
    id: "useSignatureStamp",
    label: "إدراج التوقيع والختم في المستندات الصادرة",
    desc: "السماح للمستخدم بإدراج صورة التوقيع والختم الرسمية المعتمدة عند إصدار الخطابات والإنابات والاتفاقيات، دون منحه صلاحية تعديل أو استبدال هذه الصور",
    category: "النظام والأمان",
  },
  {
    id: "manageStrReports",
    label: "الاطلاع وتسجيل بلاغات الاشتباه AML/STR",
    desc: "صلاحية حساسة للاطلاع على سجل بلاغات الاشتباه (STR) وتسجيل بلاغات جديدة لوحدة الاستعلام المالي FIU، حصر على مسؤول الامتثال ومدير النظام",
    category: "النظام والأمان",
    isSensitive: true,
  },

  // 2. صلاحيات الحذف الصريحة والرقابة الحساسة لجميع الأقسام (تمنع افتراضياً وتشترط إذناً وتأكيداً)
  {
    id: "deleteCases",
    label: "حذف ملفات القضايا",
    desc: "صلاحية حساسة لحذف سجلات القضايا والدعاوى نهائياً من النظام",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteClients",
    label: "حذف سجلات الموكلين",
    desc: "صلاحية حساسة لحذف الموكلين والشركات من قاعدة البيانات",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteHearings",
    label: "حذف الجلسات والرول",
    desc: "صلاحية لحذف مواعيد وجداول جلسات المحاكم المسجلة",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteTasks",
    label: "حذف وتفريغ المهام",
    desc: "صلاحية لحذف التكليفات والمهام اليومية المسندة لفريق العمل",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteDocs",
    label: "حذف وثائق الأرشيف",
    desc: "صلاحية لحذف المستندات والمذكرات والملفات المرفوعة",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deletePoas",
    label: "حذف الوكالات القانونية",
    desc: "صلاحية لإلغاء وحذف قيود وسجلات الوكالات",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteAgreements",
    label: "حذف اتفاقيات وعقود الأتعاب",
    desc: "صلاحية حساسة لحذف اتفاقيات الأتعاب وجداول السداد",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteInvoices",
    label: "حذف الفواتير وسندات القبض",
    desc: "صلاحية حساسة لحذف الفواتير الضريبية وسندات التحصيل",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteKyc",
    label: "حذف سجلات KYC وقوائم الحظر",
    desc: "صلاحية لحذف استمارات التحقق وقوائم الحظر والامتثال",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteEmployees",
    label: "حذف سجلات الموظفين (HR)",
    desc: "صلاحية لحذف ملفات الكادر الوظيفي من النظام",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deletePrecedents",
    label: "حذف المبادئ القضائية",
    desc: "صلاحية لحذف السوابق والأحكام التمييزية من المكتبة",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteUsers",
    label: "حذف حسابات المستخدمين",
    desc: "صلاحية إدارية عليا لحذف حسابات الموظفين والمستخدمين",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteContacts",
    label: "حذف جهات الاتصال ودليل المحاكم",
    desc: "صلاحية لحذف بيانات المحاكم وأرقام التواصل المسجلة",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
  {
    id: "deleteColleagues",
    label: "حذف بيانات الزملاء والإنابات",
    desc: "صلاحية لحذف سجلات الزملاء المتعاونين والإنابات الصادرة",
    category: "صلاحيات الحذف والرقابة",
    isSensitive: true,
  },
];

export const hasTabPermission = (user: UserItem | null | undefined, tabId: string): boolean => {
  if (!user) return false;
  // مدير النظام له جميع الصلاحيات الكاملة بلا استثناء (اعتماداً على الدور الوظيفي المخصص فقط)
  if (user.roleKey === "admin" || (user as any).role === "admin") return true;

  // تبويب المبادئ والأحكام القضائية متاح للجميع افتراضياً وللكادر القانوني إلا إذا قُيّد صراحة
  if (tabId === "precedents") {
    if (user.permissions && user.permissions.precedents === false) return false;
    return true;
  }

  // تبويب السياسات الداخلية للمكتب متاح للجميع افتراضياً (الهدف إطلاع كل الكادر عليها) إلا إذا قُيّد صراحة
  if (tabId === "policies") {
    if (user.permissions && user.permissions.policies === false) return false;
    return true;
  }

  // تبويب سجل التدقيق والأنشطة
  if (tabId === "audit_log") {
    return Boolean(user.permissions?.manageUsers || user.permissions?.auditLog);
  }

  // تبويب إدارة المستخدمين حصر للمدير أو من لديه صلاحية صريحة
  if (tabId === "users") {
    return Boolean(user.permissions?.manageUsers);
  }

  // تبويب إدارة الهوية الرسمية (الورق الرسمي، التوقيع، الختم) — قسم خاص حصر لمدير النظام أو من يملك صلاحية "إدارة الهوية الرسمية" صراحة
  if (tabId === "official_identity") {
    return Boolean(user.permissions?.manageLetterheadAssets);
  }

  // البحث عن القسم المناسب للتبويب المحدد
  const moduleDef = PERMISSION_MODULES.find((m) => m.navTabIds.includes(tabId));
  if (!moduleDef) {
    // سياسة الحظر الافتراضي: أي ميزة أو تبويب جديد غير معرف يكون مخفياً تلقائياً لغير المدير
    return false;
  }

  const moduleKey = moduleDef.id;
  const perms = user.permissions;
  if (!perms) return false;

  // إذا كانت الصلاحيات مخزنة كمصفوفة نصوص
  if (Array.isArray(perms)) {
    return (perms as string[]).includes(moduleKey) || (perms as string[]).includes(tabId);
  }

  // إذا كانت الصلاحيات مخزنة ككائن
  if (typeof perms === "object") {
    if (perms[moduleKey as keyof RolePermissions] === true) return true;

    // فحص الصلاحيات المرتبطة بالتوافقية
    if (tabId === "dashboard" && perms.dashboard) return true;
    if (tabId === "cases" && (perms.cases || perms.manageCases)) return true;
    if (tabId === "hearings" && (perms.calendar || perms.manageHearings)) return true;
    if (tabId === "clients" && (perms.clients || perms.manageClients)) return true;
    if (tabId === "booking_consultation" && perms.bookingConsultation) return true;
    if (tabId === "tasks" && (perms.tasks || perms.manageTasks)) return true;
    if (tabId === "whatsapp_office" && (perms.whatsapp || user.canAccessWhatsapp)) return true;
    if (tabId === "inapp_email" && perms.email) return true;
    if (tabId === "courts_directory" && perms.directory) return true;
    if (tabId === "docs" && (perms.docs || perms.manageDocs)) return true;
    if (tabId === "poa" && (perms.poa || perms.managePoa || perms.manageDocs)) return true;
    if (
      tabId === "office_agreement" &&
      (perms.agreements || perms.manageAgreements || user.canViewAgreements)
    )
      return true;
    if (
      tabId === "invoices" &&
      (perms.finance || perms.viewInvoices || perms.manageInvoices || user.canViewFinances)
    )
      return true;
    if (tabId === "kyc" && (perms.kyc || perms.manageKyc)) return true;
    if (tabId === "precedents" && (perms.precedents || perms.managePrecedents)) return true;
    if (tabId === "employees" && (perms.hr || perms.manageEmployees)) return true;
  }

  return false;
};

export const getActivePermissionsCount = (user: UserItem | null | undefined): number => {
  if (!user) return 0;
  if (user.roleKey === "admin" || (user as any).role === "admin") {
    return PERMISSION_MODULES.length;
  }

  let count = 0;
  PERMISSION_MODULES.forEach((mod) => {
    if (hasTabPermission(user, mod.navTabIds[0])) {
      count++;
    }
  });
  return count;
};

export const ROLE_PRESETS: Record<string, { title: string; permissions: RolePermissions }> = {
  admin: {
    title: "محامٍ شريك / مدير النظام",
    permissions: {
      dashboard: true,
      cases: true,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: true,
      email: true,
      directory: true,
      docs: true,
      poa: true,
      agreements: true,
      finance: true,
      kyc: true,
      precedents: true,
      hr: true,
      auditLog: true,
      manageUsers: true,
      colleagues: true,
      manageCases: true,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: true,
      manageKyc: true,
      manageEmployees: true,
      managePrecedents: true,
      viewReports: true,
      exportData: true,
      manageColleagues: true,
      manageLetterheadAssets: true,
      useSignatureStamp: true,
      manageStrReports: true,

      // صلاحيات الحذف للمدير مفعلة
      deleteCases: true,
      deleteClients: true,
      deleteHearings: true,
      deleteTasks: true,
      deleteDocs: true,
      deletePoas: true,
      deleteAgreements: true,
      deleteInvoices: true,
      deleteKyc: true,
      deleteEmployees: true,
      deletePrecedents: true,
      deleteUsers: true,
      deleteContacts: true,
      deleteColleagues: true,
    },
  },
  supervisor: {
    title: "مشرف ومراجع إداري",
    permissions: {
      dashboard: true,
      cases: true,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: true,
      email: true,
      directory: true,
      docs: true,
      poa: true,
      agreements: true,
      finance: true,
      kyc: true,
      precedents: true,
      hr: true,
      auditLog: true,
      manageUsers: false,
      colleagues: true,
      manageCases: true,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: false,
      manageKyc: true,
      manageEmployees: true,
      managePrecedents: true,
      viewReports: true,
      exportData: true,
      manageColleagues: true,
      manageLetterheadAssets: false,
      useSignatureStamp: true,
      manageStrReports: true,

      // الحذف ممنوع افتراضياً
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
      deleteColleagues: false,
    },
  },
  lawyer: {
    title: "محامٍ ومستشار قانوني",
    permissions: {
      dashboard: true,
      cases: true,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: false,
      email: false,
      directory: true,
      docs: true,
      poa: true,
      agreements: true,
      finance: false,
      kyc: true,
      precedents: true,
      hr: false,
      auditLog: false,
      manageUsers: false,
      colleagues: true,
      manageCases: true,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: false,
      manageKyc: true,
      manageEmployees: false,
      managePrecedents: true,
      viewReports: true,
      exportData: false,
      manageColleagues: true,
      manageLetterheadAssets: false,
      useSignatureStamp: true,
      manageStrReports: false,

      // الحذف ممنوع افتراضياً
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
      deleteColleagues: false,
    },
  },
  secretary: {
    title: "مسؤول سكرتارية وتنسيق",
    permissions: {
      dashboard: true,
      cases: false,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: true,
      email: true,
      directory: true,
      docs: true,
      poa: true,
      agreements: false,
      finance: false,
      kyc: false,
      precedents: true,
      hr: false,
      auditLog: false,
      manageUsers: false,
      colleagues: true,
      manageCases: false,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: false,
      viewInvoices: false,
      manageInvoices: false,
      manageKyc: false,
      manageEmployees: false,
      managePrecedents: false,
      viewReports: false,
      exportData: false,
      manageColleagues: true,
      manageLetterheadAssets: false,
      useSignatureStamp: false,
      manageStrReports: false,

      // الحذف ممنوع افتراضياً
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
      deleteColleagues: false,
    },
  },
  accountant: {
    title: "محاسب المكتب والضريبة",
    permissions: {
      dashboard: true,
      cases: false,
      calendar: false,
      clients: true,
      bookingConsultation: false,
      tasks: true,
      whatsapp: false,
      email: false,
      directory: false,
      docs: true,
      poa: false,
      agreements: true,
      finance: true,
      kyc: true,
      precedents: false,
      hr: true,
      auditLog: false,
      manageUsers: false,
      manageCases: false,
      manageHearings: false,
      manageTasks: true,
      manageClients: true,
      manageDocs: false,
      managePoa: false,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: true,
      manageKyc: true,
      manageEmployees: true,
      managePrecedents: false,
      viewReports: true,
      exportData: true,
      useSignatureStamp: false,
      manageStrReports: false,

      // الحذف ممنوع افتراضياً
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
    },
  },
};

export const PERMISSION_LABELS: Record<keyof RolePermissions, { label: string; desc: string }> = {
  dashboard: {
    label: "1. لوحة التحكم والأداء",
    desc: "إحصائيات المكتب والأنشطة والملخص ومؤشرات الأداء",
  },
  cases: { label: "2. القضايا", desc: "إدارة الملفات والقضايا والدعاوى ومراحل التقاضي" },
  calendar: { label: "3. الجلسات والرول", desc: "جدولة ومتابعة مواعيد وقاعات الجلسات والقرارات" },
  clients: { label: "4. الموكلين والعملاء", desc: "سجل بيانات الموكلين والأفراد والشركات والجهات" },
  bookingConsultation: {
    label: "5. حجز الاستشارات المرئية",
    desc: "إدارة ومتابعة طلبات الاستشارات المرئية وأرباحها",
  },
  tasks: {
    label: "6. المهام والتكليفات",
    desc: "إسناد ومتابعة المهام الإدارية والقانونية لفريق العمل",
  },
  whatsapp: {
    label: "7. واتساب المكتب المدمج",
    desc: "المراسلات الفورية وتنبيهات الموكلين المباشرة",
  },
  email: {
    label: "8. البريد الإلكتروني المدمج",
    desc: "الاطلاع واستخدام البريد الإلكتروني الرسمي للمكتب",
  },
  directory: {
    label: "9. دليل المحاكم والجهات",
    desc: "دليل التواصل المباشر مع محاكم ونيابات الدولة",
  },
  docs: { label: "10. المستندات والأرشيف", desc: "أرشفة وتصنيف ملفات القضايا والوثائق الرسمية" },
  poa: { label: "11. الوكالات القانونية", desc: "متابعة صلاحية وسريان الوكالات وتنبيهات الانتهاء" },
  agreements: {
    label: "12. اتفاقيات أتعاب المكتب",
    desc: "صياغة وإنشاء واعتماد اتفاقيات الأتعاب وجدول الدفعات",
  },
  finance: {
    label: "13. الفواتير والضريبة",
    desc: "إصدار الفواتير الضريبية 5% وسندات القبض ومتابعة الذمم",
  },
  kyc: {
    label: "14. اعرف عميلك (KYC)",
    desc: "مراجعات الفحص والامتثال لمعايير مكافحة غسل الأموال",
  },
  precedents: {
    label: "15. المبادئ والأحكام القضائية",
    desc: "مكتبة وسجل المبادئ القانونية وسوابق التمييز والاتحادية",
  },
  policies: {
    label: "20. السياسات الداخلية للمكتب",
    desc: "لائحة السياسات والإجراءات الإدارية الداخلية المعتمدة من المكتب",
  },
  hr: {
    label: "16. الموظفون والكادر (HR)",
    desc: "إدارة الكادر الوظيفي والرواتب والإجازات والمصروفات",
  },
  auditLog: {
    label: "17. سجل التدقيق والأنشطة",
    desc: "رقابة وتتبع عمليات الحذف والتعديل وتغييرات الصلاحيات الحساسة",
  },
  manageUsers: {
    label: "18. المستخدمون والصلاحيات",
    desc: "إضافة وتعديل واعتماد حسابات الموظفين وتخصيص الأدوار",
  },
  colleagues: {
    label: "19. الزملاء والإنابات",
    desc: "دليل المحامين المتعاونين وإصدار إنابات الحضور بالجلسات",
  },

  // الصلاحيات الإجرائية الدقيقة
  manageCases: {
    label: "قيد وتعديل القضايا",
    desc: "إضافة وتعديل بيانات ملفات الدعاوى ومراحل التقاضي",
  },
  manageHearings: {
    label: "جدولة وتحديث الجلسات",
    desc: "إضافة وتعديل مواعيد وقرارات الجلسات والرول",
  },
  manageTasks: { label: "إسناد وإدارة المهام", desc: "إنشاء وتعيين وإنجاز المهام ومتابعتها" },
  manageClients: { label: "إدارة بيانات الموكلين", desc: "إضافة وتعديل بيانات الموكلين والأطراف" },
  manageDocs: { label: "إدارة ورفع المستندات", desc: "رفع وحفظ وتحميل وثائق القضايا والمرفقات" },
  managePoa: { label: "إدارة الوكالات القانونية", desc: "قيد وتحديث وفحص سريان الوكالات" },
  manageAgreements: { label: "صياغة اتفاقيات الأتعاب", desc: "إنشاء وتعديل اتفاقيات أتعاب المكتب" },
  viewInvoices: {
    label: "عرض الفواتير والحسابات",
    desc: "الاطلاع على أتعاب ومبالغ القضايا وسندات القبض",
  },
  manageInvoices: { label: "إصدار وتعديل الفواتير", desc: "تحرير الفواتير الضريبية وسندات القبض" },
  manageKyc: { label: "إجراء وفحص اعرف عميلك KYC", desc: "مراجعة وتحديث استمارات الامتثال والفحص" },
  manageEmployees: {
    label: "إدارة الكادر الوظيفي (HR)",
    desc: "إضافة وتعديل بيانات الموظفين والرواتب والمصروفات",
  },
  managePrecedents: {
    label: "إدارة المبادئ القضائية",
    desc: "إضافة وتصنيف السوابق والأحكام القضائية",
  },
  viewReports: {
    label: "التقارير التحليلية المتقدمة",
    desc: "الاطلاع على تقارير الأداء والمؤشرات العامة",
  },
  exportData: {
    label: "تصدير واستعادة النسخ الاحتياطية",
    desc: "تصدير قواعد بيانات المكتب بصيغة JSON و PDF",
  },
  manageColleagues: {
    label: "إدارة الزملاء وإصدار الإنابات",
    desc: "إضافة وتعديل بيانات المحامين المتعاونين وإصدار إنابات الحضور",
  },
  manageLetterheadAssets: {
    label: "إدارة الهوية الرسمية (الورق والتوقيع والختم)",
    desc: "صلاحية حساسة لرفع أو تغيير صور الورق الرسمي والتوقيع والختم المعتمدة",
  },
  useSignatureStamp: {
    label: "إدراج التوقيع والختم في المستندات الصادرة",
    desc: "السماح بإدراج التوقيع والختم المعتمدين عند إصدار المستندات",
  },
  manageStrReports: {
    label: "بلاغات الاشتباه AML/STR",
    desc: "صلاحية حساسة للاطلاع على سجل بلاغات الاشتباه وتسجيل بلاغات جديدة لوحدة الاستعلام المالي FIU",
  },

  // صلاحيات الحذف والرقابة
  deleteCases: { label: "حذف ملفات القضايا", desc: "حذف وتصفية ملفات وسجلات القضايا نهائياً" },
  deleteClients: { label: "حذف سجلات الموكلين", desc: "حذف بيانات الموكلين والأطراف من النظام" },
  deleteHearings: { label: "حذف الجلسات والرول", desc: "حذف مواعيد وجداول الجلسات القضائية" },
  deleteTasks: { label: "حذف وتفريغ المهام", desc: "حذف وتفريغ التكليفات والمهام" },
  deleteDocs: { label: "حذف وثائق الأرشيف", desc: "حذف المستندات والمذكرات المرفوعة" },
  deletePoas: { label: "حذف الوكالات القانونية", desc: "إلغاء وحذف قيود الوكالات القانونية" },
  deleteAgreements: { label: "حذف اتفاقيات الأتعاب", desc: "حذف اتفاقيات وعقود الأتعاب" },
  deleteInvoices: {
    label: "حذف الفواتير وسندات القبض",
    desc: "حذف الفواتير وسندات التحصيل المالية",
  },
  deleteKyc: { label: "حذف سجلات KYC وقوائم الحظر", desc: "حذف سجلات فحص الامتثال وقوائم الحظر" },
  deleteEmployees: { label: "حذف سجلات الموظفين (HR)", desc: "حذف بيانات الكادر الوظيفي" },
  deletePrecedents: { label: "حذف المبادئ القضائية", desc: "حذف السوابق والأحكام التمييزية" },
  deleteUsers: { label: "حذف حسابات المستخدمين", desc: "حذف حسابات المستخدمين والموظفين" },
  deleteContacts: {
    label: "حذف جهات الاتصال والدليل",
    desc: "حذف بيانات دليل المحاكم وجهات التواصل",
  },
  deleteColleagues: {
    label: "حذف بيانات الزملاء والإنابات",
    desc: "حذف بيانات الزملاء والإنابات الصادرة",
  },

  // النظام المحاسبي المتكامل (قيد الإنشاء — غير مفعّل بعد، انظر ACCOUNTING_MODULE_ENABLED)
  accounting: { label: "المحاسبة", desc: "الوصول لقسم النظام المحاسبي المتكامل" },
  manageChartOfAccounts: {
    label: "إدارة شجرة الحسابات",
    desc: "إضافة وتعديل وتعطيل حسابات الدليل المحاسبي",
  },
  postJournalEntries: {
    label: "ترحيل القيود اليومية",
    desc: "اعتماد وترحيل قيود اليومية المحاسبية",
  },
  deleteJournalEntries: { label: "حذف القيود اليومية", desc: "حذف قيود اليومية المسجّلة" },
  manageBankAccounts: {
    label: "إدارة الحسابات البنكية",
    desc: "إضافة وتعديل سجل حسابات المكتب البنكية",
  },
  recordBankTransactions: {
    label: "تسجيل حركات بنكية",
    desc: "تسجيل إيداعات وسحوبات الحسابات البنكية وترحيل قيودها",
  },
  deleteBankTransactions: {
    label: "حذف حركات بنكية",
    desc: "حذف حركات بنكية مسجّلة وقيودها المرتبطة",
  },
  manageSalesInvoices: {
    label: "إنشاء الفواتير الضريبية (النظام الجديد)",
    desc: "إنشاء وتعديل مسودات الفواتير الضريبية متعددة البنود",
  },
  approveSalesInvoices: {
    label: "اعتماد الفواتير الضريبية",
    desc: "اعتماد الفواتير الضريبية وترحيل قيودها المحاسبية تلقائياً",
  },
  recordSalesPayments: {
    label: "تحصيل دفعات الفواتير الضريبية",
    desc: "تسجيل تحصيل الدفعات على الفواتير الضريبية المعتمدة",
  },
  deleteSalesInvoices: {
    label: "حذف مسودات الفواتير الضريبية",
    desc: "حذف مسودات فواتير ضريبية لم تُعتمد بعد",
  },
  manageVendors: { label: "إدارة الموردين", desc: "إضافة وتعديل سجل موردي المكتب" },
  deleteVendors: { label: "حذف الموردين", desc: "حذف موردين من السجل" },
  managePurchaseInvoices: {
    label: "إنشاء فواتير المشتريات",
    desc: "إنشاء وتعديل مسودات فواتير المشتريات والمصروفات",
  },
  approvePurchaseInvoices: {
    label: "اعتماد فواتير المشتريات",
    desc: "اعتماد فواتير المشتريات وترحيل قيودها المحاسبية تلقائياً",
  },
  recordPurchasePayments: {
    label: "تسجيل سداد فواتير المشتريات",
    desc: "تسجيل دفعات السداد على فواتير المشتريات المعتمدة",
  },
  deletePurchaseInvoices: {
    label: "حذف مسودات فواتير المشتريات",
    desc: "حذف مسودات فواتير مشتريات لم تُعتمد بعد",
  },
  manageFixedAssets: {
    label: "إدارة الأصول الثابتة",
    desc: "إضافة وتعديل واستبعاد سجل أصول المكتب الثابتة",
  },
  runDepreciation: {
    label: "توليد قيود الإهلاك",
    desc: "توليد قيد الإهلاك الدوري للأصول الثابتة وترحيله تلقائياً",
  },
  deleteFixedAssets: {
    label: "حذف الأصول الثابتة",
    desc: "حذف أصل ثابت لم يُحتسب له أي إهلاك بعد",
  },
  managePayrollEmployees: {
    label: "إدارة سجل موظفي الرواتب",
    desc: "إضافة وتعديل سجل الموظفين الخاص بدورة الرواتب",
  },
  deletePayrollEmployees: {
    label: "حذف موظفي الرواتب",
    desc: "حذف موظف من سجل الرواتب لم يُصرف له راتب بعد",
  },
  runPayroll: {
    label: "تشغيل الرواتب",
    desc: "تشغيل الرواتب الشهري وترحيل قيد الاستحقاق تلقائياً",
  },
  recordPayrollPayments: {
    label: "تسجيل سداد الرواتب",
    desc: "تسجيل سداد الرواتب المستحقة وترحيل قيد السداد",
  },
};
