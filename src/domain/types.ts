/* أنواع النطاق المشتركة — مستخرجة من App.tsx */

export interface DelegationPrintData {
  refNo: string;
  dateLabel: string;
  courtName: string;
  caseNumber: string;
  clientName: string;
  clientCapacity: string;
  opponents: string;
  issuedByName: string;
  issuerLicenseNumber: string;
  colleagueName: string;
  colleagueLicenseNumber: string;
  sessionDateLabel?: string;
  caseTitleSnapshot?: string;
  purpose: string;
  customBodyHtml?: string;
  headerImg?: string | null;
  footerImg?: string | null;
  signatureImg?: string | null;
  stampImg?: string | null;
  showSignatureStamp: boolean;
}

export interface RolePermissions {
  // 1. صلاحيات الوصول للأقسام والتبويبات الرئيسية الـ 18 (Module Access)
  dashboard: boolean; // 1. لوحة التحكم والأداء
  cases: boolean; // 2. القضايا
  calendar: boolean; // 3. الجلسات والرول
  clients: boolean; // 4. الموكلين والعملاء
  bookingConsultation?: boolean; // 5. حجز الاستشارات المرئية
  tasks: boolean; // 6. المهام والتكليفات
  whatsapp: boolean; // 7. واتساب المكتب المدمج
  email: boolean; // 8. البريد الإلكتروني المدمج
  directory: boolean; // 9. دليل المحاكم والجهات
  docs?: boolean; // 10. المستندات والأرشيف الإلكتروني
  poa?: boolean; // 11. الوكالات القانونية
  agreements: boolean; // 12. اتفاقيات أتعاب المكتب
  finance: boolean; // 13. الفواتير والضريبة والحسابات
  kyc: boolean; // 14. اعرف عميلك (KYC) والامتثال
  precedents?: boolean; // 15. المبادئ والأحكام القضائية
  hr?: boolean; // 16. الموظفون والكادر (HR)
  auditLog?: boolean; // 17. سجل التدقيق والأنشطة (Audit Log)
  manageUsers?: boolean; // 18. إدارة المستخدمين والصلاحيات
  colleagues?: boolean; // 19. الزملاء والإنابات
  policies?: boolean; // 20. السياسات الداخلية للمكتب

  // 2. صلاحيات العمليات والإجراءات الدقيقة والتفويضات (Action Permissions)
  manageCases?: boolean; // قيد وتعديل القضايا
  manageHearings?: boolean; // جدولة وتحديث الجلسات والرول
  manageTasks?: boolean; // إسناد وتعيين ومتابعة المهام
  manageClients?: boolean; // إضافة وتعديل بيانات الموكلين
  manageDocs?: boolean; // رفع وإدارة وأرشفة المستندات
  managePoa?: boolean; // قيد وتحديث الوكالات القانونية
  manageAgreements?: boolean; // صياغة واعتماد اتفاقيات الأتعاب
  viewInvoices?: boolean; // الاطلاع على الفواتير والأتعاب
  manageInvoices?: boolean; // إصدار وتعديل الفواتير وسندات القبض
  manageKyc?: boolean; // مراجعة واعتماد ملفات KYC
  manageEmployees?: boolean; // إدارة الكادر الوظيفي والرواتب
  managePrecedents?: boolean; // إضافة وتصنيف المبادئ القضائية
  viewReports?: boolean; // استخراج ومراجعة التقارير التحليلية
  exportData?: boolean; // تصدير واستعادة النسخ الاحتياطية (JSON/PDF)
  manageColleagues?: boolean; // إضافة وتعديل بيانات الزملاء وإصدار الإنابات
  manageLetterheadAssets?: boolean; // إدارة قسم الهوية الرسمية: تعديل الورق الرسمي والتوقيع والختم (صلاحية حساسة)
  useSignatureStamp?: boolean; // إدراج التوقيع والختم المعتمدين عند إصدار المستندات (دون صلاحية تعديلهما)
  manageStrReports?: boolean; // الاطلاع وتسجيل بلاغات الاشتباه AML/STR (صلاحية حساسة — مسؤول امتثال/مدير فقط)

  // 3. صلاحيات الحذف والرقابة الحساسة لجميع الأقسام (Deletion Permissions)
  deleteCases?: boolean; // حذف القضايا والملفات نهائياً
  deleteClients?: boolean; // حذف سجلات الموكلين والعملاء
  deleteHearings?: boolean; // حذف الجلسات والرول القضائي
  deleteTasks?: boolean; // حذف وتفريغ المهام والتكليفات
  deleteDocs?: boolean; // حذف مستندات الأرشيف والوثائق
  deletePoas?: boolean; // حذف وإلغاء قيود الوكالات القانونية
  deleteAgreements?: boolean; // حذف اتفاقيات وعقود أتعاب المكتب
  deleteInvoices?: boolean; // حذف الفواتير وسندات القبض والتحصيلات
  deleteKyc?: boolean; // حذف سجلات KYC وقوائم الحظر والمتابعة
  deleteEmployees?: boolean; // حذف سجلات الكادر والموظفين
  deletePrecedents?: boolean; // حذف المبادئ والأحكام القضائية
  deleteUsers?: boolean; // حذف حسابات المستخدمين والموظفين
  deleteContacts?: boolean; // حذف جهات الاتصال ودليل المحاكم
  deleteColleagues?: boolean; // حذف بيانات الزملاء والإنابات الصادرة

  // 4. صلاحيات النظام المحاسبي المتكامل (قيد الإنشاء — غير مفعّلة بعد، انظر ACCOUNTING_MODULE_ENABLED)
  accounting?: boolean; // الوصول لقسم المحاسبة
  manageChartOfAccounts?: boolean; // إدارة شجرة الحسابات
  postJournalEntries?: boolean; // ترحيل القيود اليومية
  deleteJournalEntries?: boolean; // حذف القيود اليومية
  manageBankAccounts?: boolean; // إدارة سجل الحسابات البنكية
  recordBankTransactions?: boolean; // تسجيل حركات بنكية (إيداع/سحب)
  deleteBankTransactions?: boolean; // حذف حركات بنكية وقيودها المرتبطة
  manageSalesInvoices?: boolean; // إنشاء وتعديل مسودات الفواتير الضريبية الجديدة
  approveSalesInvoices?: boolean; // اعتماد الفواتير الضريبية وترحيل قيودها
  recordSalesPayments?: boolean; // تسجيل تحصيل دفعات الفواتير الضريبية الجديدة
  deleteSalesInvoices?: boolean; // حذف مسودات الفواتير الضريبية الجديدة
  manageVendors?: boolean; // إدارة سجل الموردين
  deleteVendors?: boolean; // حذف الموردين
  managePurchaseInvoices?: boolean; // إنشاء وتعديل مسودات فواتير المشتريات
  approvePurchaseInvoices?: boolean; // اعتماد فواتير المشتريات وترحيل قيودها
  recordPurchasePayments?: boolean; // تسجيل دفعات سداد فواتير المشتريات
  deletePurchaseInvoices?: boolean; // حذف مسودات فواتير المشتريات
  manageFixedAssets?: boolean; // إدارة سجل الأصول الثابتة
  runDepreciation?: boolean; // توليد قيود الإهلاك الدوري وترحيلها
  deleteFixedAssets?: boolean; // حذف أصول ثابتة لم يُحتسب لها إهلاك بعد
  managePayrollEmployees?: boolean; // إدارة سجل موظفي الرواتب (مستقل عن سجل الموظفون والكادر)
  deletePayrollEmployees?: boolean; // حذف موظف من سجل الرواتب لم يُصرف له راتب بعد
  runPayroll?: boolean; // تشغيل الرواتب الشهري وترحيل قيد الاستحقاق
  recordPayrollPayments?: boolean; // تسجيل سداد الرواتب وترحيل قيد السداد
}

export interface UserItem {
  id: number;
  supabaseId?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  roleTitle: string;
  roleKey: "admin" | "supervisor" | "lawyer" | "secretary" | "accountant";
  status: "نشط" | "معطل" | "معلق" | "موقف" | "approved" | "pending";
  avatarBg: string;
  avatarText: string;
  permissions: RolePermissions;
  canTransferContacts?: boolean;
  canViewAgreements?: boolean;
  canAccessWhatsapp?: boolean;
  canViewFinances?: boolean;
  licenseNumber?: string; // رقم قيد المحامي (نقابة المحامين) — يُستخدم في مستندات الإنابة
}

export type FeeAgreementStatus = "نشطة" | "مسددة بالكامل" | "ملغاة";

export type AllocationStatus = number | "unallocated" | null;

export interface FeeAgreementInstallment {
  id: number;
  feeAgreementId?: number;
  installmentNo: number;
  dueDate: string;
  amount: number;
  status?: "مستحق" | "مدفوع" | "متأخر";
  paidOnSigning?: boolean;
}

export interface FeeAgreement {
  id: number;
  clientId: number;
  caseId?: number | null;
  agreementNumber: string;
  title: string;
  totalAmount: number;
  date: string;
  status: FeeAgreementStatus;
  installments?: FeeAgreementInstallment[];
  notes?: string;
}

export interface Client {
  id: number;
  name: string;
  type: string;
  idNo: string;
  phone: string;
  email: string;
  emirate: string;
  address: string;
  taxNo?: string;
  feeAgreements?: FeeAgreement[];
}

export interface CaseItem {
  id: number;
  number: string;
  clientId: number;
  /** قائمة الخصوم (يمكن أن تضم أكثر من خصم واحد) — الحقل القديم "opponent" (نص واحد) لم يعد مستخدماً،
   * ويُهاجَر تلقائياً إلى هذه القائمة عبر sanitizeCase() عند تحميل بيانات قديمة مخزّنة محلياً */
  opponents: string[];
  type: string;
  court: string;
  judge: string;
  stage?: string;
  status: string;
  subject: string;
  openDate: string;
  fee: number;
  emirate?: string;
  /** صفة الموكل في القضية (مدعي / مدعى عليه / مستأنف ...) — تُستخدم في توليد مستندات الإنابة وغيرها */
  clientCapacity?: string;
  /** أرشفة يدوية (غير آلية) — لا تحذف أي بيانات، فقط تُخفي القضية من العرض الافتراضي.
   * تُضبط فقط بإجراء يدوي صريح من المستخدم عبر زر "أرشفة" ويمكن التراجع عنها بزر "إلغاء الأرشفة" في أي وقت. */
  archived?: boolean;
  /** تاريخ ووقت الأرشفة (ISO) — يُضبط عند الأرشفة ويُعاد إلى null عند إلغاء الأرشفة. لا علاقة له بأي حذف. */
  archivedAt?: string | null;
}

export interface Hearing {
  id: number;
  caseId: number;
  date: string;
  time: string;
  type: string;
  room: string;
  notes: string;
  done: boolean;
  googleCalendarEventId?: string;
  googleSyncedAt?: string;
}

export interface Colleague {
  id: number;
  name: string;
  phone: string;
  email?: string;
  specialization?: string; // التخصص القانوني
  coverageArea?: string; // الإمارة / المحكمة التي يغطيها
  notes?: string;
  status: "متاح" | "غير متاح";
  addedBy?: string;
  createdAt: string; // ISO
  licenseNumber?: string; // رقم قيد المحامي (نقابة المحامين)
}

export interface ColleagueDelegation {
  id: number;
  refNo: string;
  colleagueId: number;
  caseId?: number;
  hearingId?: number;
  caseTitleSnapshot?: string; // نص حر عند عدم ربطها بقضية مسجلة
  purpose: string; // الغرض من الإنابة (حضور جلسة / متابعة إجراء...)
  issuedByName: string;
  issuedAt: string; // ISO
  status: "صادرة" | "مستخدمة" | "ملغاة";
  sessionDate?: string; // تاريخ الجلسة المناب لها الزميل
  issuerLicenseNumber?: string; // رقم قيد المحامي الموكِّل (يُسحب تلقائياً، قابل للتعديل)
  colleagueLicenseNumber?: string; // رقم قيد الزميل المُناب (يُسحب تلقائياً، قابل للتعديل)
  customBodyHtml?: string; // صياغة نص الإنابة بعد تعديلها يدوياً من المستخدم (تحل محل النص التلقائي عند وجودها)
}

export interface TaskItem {
  id: number;
  title: string;
  caseId: number | null;
  assignee: string;
  due: string;
  priority: "عالية" | "متوسطة" | "منخفضة";
  done: boolean;
}

export interface Invoice {
  id: number;
  number: string;
  clientId: number;
  caseId: number | null;
  feeAgreementId?: number | "unallocated" | null;
  date: string;
  due: string;
  amount: number;
  status: string;
  desc: string;
}

export interface PaymentReceipt {
  id: number;
  clientId: number;
  caseId?: number | null;
  feeAgreementId: number | "unallocated" | null;
  invoiceId?: number | null;
  amount: number;
  date: string;
  paymentMethod: string;
  referenceNo: string;
  notes?: string;
}

export interface DocItem {
  id: number;
  name: string;
  type: string;
  caseId: number | null;
  date: string;
  by: string;
}

export interface PoaItem {
  id: number;
  clientId: number;
  number: string;
  issuer: string;
  issue: string;
  expiry: string;
  scope: string;
}

export interface KycItem {
  id: number;
  clientId: number;
  nationality: string;
  idType: string;
  idExpiry: string;
  ubo: string;
  sourceOfFunds: string;
  pep: boolean;
  sanctions: string;
  risk: string;
  status: string;
  lastReview: string;
  notes: string;
  /** أرشفة يدوية (غير آلية) لملفات KYC الخاصة بعلاقات عملاء منتهية — لا تحذف أي بيانات.
   * تُضبط فقط بإجراء يدوي صريح من المستخدم ويمكن التراجع عنها في أي وقت. */
  archived?: boolean;
  /** تاريخ ووقت الأرشفة (ISO) — يُضبط عند الأرشفة ويُعاد إلى null عند إلغاء الأرشفة. */
  archivedAt?: string | null;
}

export interface KycWatchlistItem {
  id: number;
  fullName: string;
  idNo?: string;
  type: string;
  reason: string;
  nationality?: string;
  addedDate: string;
}

export interface NotificationLog {
  id: number;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  channel: "واتساب" | "إيميل" | "كلاهما";
  type:
    | "تنبيه جلسة"
    | "تحديث قضية"
    | "تذكير فاتورة"
    | "تجديد وثائق / KYC"
    | "تجديد وكالة / POA"
    | "تنبيه ميعاد طعن / استئناف"
    | "تذكير قسط فاتورة"
    | "رسالة عامة";
  message: string;
  sentAt: string;
  status: "تم الإرسال" | "قيد التسليم";
  relatedRef?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  formattedTimestamp?: string;
  userId: string | number;
  userName: string;
  userEmail: string;
  userRole: string;
  actionType:
    | "DELETE"
    | "UPDATE"
    | "CREATE"
    | "STATUS_CHANGE"
    | "PERMISSION_CHANGE"
    | "UNAUTHORIZED_DELETE"
    | "UNAUTHORIZED_ACCESS";
  targetModule: string;
  targetId: string | number;
  targetTitle: string;
  details: string;
  ipAddress?: string;
  status: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل";
}

export interface TimeLog {
  id: number;
  caseId: number;
  lawyerName: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description: string;
  billed: boolean;
}

export interface CaseExpense {
  id: number;
  caseId: number;
  date: string;
  category: "رسوم قضائية" | "ترجمة قانونية" | "أتعاب خبرة" | "تنقلات ومواصلات" | "مصاريف إدارية";
  amount: number;
  description: string;
  billable: boolean;
  billed: boolean;
}

export interface TrustTransaction {
  id: number;
  clientId: number;
  caseId: number | null;
  feeAgreementId?: number | "unallocated" | null;
  date: string;
  type: "إيداع أمانة" | "صرف رسوم محكمة" | "صرف أتعاب خبرة" | "استرداد للموكل";
  amount: number;
  refNo: string;
  notes: string;
}

/**
 * سجل تسوية حساب الأمانات (Trust Reconciliation) — مقارنة دورية بين إجمالي رصيد دفاتر المكتب
 * (مجموع كل معاملات الأمانة لكل الموكلين) وبين رصيد كشف الحساب البنكي الفعلي لحساب الأمانات،
 * بما يماثل ممارسة "three-way reconciliation" (دفاتر/بنك/دفتر كل موكل) المعتمدة في الأنظمة
 * المهنية الرصينة لحسابات الأمانة (IOLTA وما شابهها). كل سجل يوثّق لحظة تسوية واحدة ولا يُعدَّل
 * لاحقاً — أي تسوية جديدة تُضاف كسجل جديد، حفاظاً على أثر تدقيقي كامل.
 */
export interface TrustReconciliation {
  id: number;
  date: string;
  bookBalance: number;
  bankStatementBalance: number;
  variance: number;
  reconciledBy: string;
  notes: string;
  hadNegativeClientBalances: boolean;
}

export interface JudgmentDeadlineLog {
  id: string;
  timestamp: string;
  type: "7_days" | "3_days" | "manual" | "overdue";
  channel: "whatsapp" | "email" | "both";
  lawyerName: string;
  recipientContact: string;
  status: "sent" | "delivered" | "failed";
  messageSnippet: string;
}

export interface JudgmentDeadline {
  id: number;
  caseId: number;
  rulingDate: string;
  rulingType: "حكم ابتدائية" | "حكم استئناف" | "قرار لجان";
  caseNature?: "مدني" | "جزائي";
  rulingSummary: string;
  appealDays: number;
  appealDeadlineDate: string;
  status:
    | "جارٍ حساب الميعاد"
    | "تم تقديم الطعن"
    | "انقضى الميعاد القانوني"
    | "تم قيد الطعن"
    | "لا حاجة لطعن";
  notes: string;
  assignedLawyerId?: number;
  assignedLawyerName?: string;
  assignedLawyerPhone?: string;
  assignedLawyerEmail?: string;
  preferredChannel?: "whatsapp" | "email" | "both";
  alert7DaysSent?: boolean;
  alert7DaysSentAt?: string;
  alert3DaysSent?: boolean;
  alert3DaysSentAt?: string;
  autoAlertLogs?: JudgmentDeadlineLog[];
}

export interface InvoiceInstallment {
  id: number;
  invoiceId: number;
  feeAgreementId?: number | "unallocated" | null;
  installmentNo: number;
  dueDate: string;
  amount: number;
  status: "مستحق" | "مدفوع" | "متأخر";
}

export interface StrReport {
  id: number;
  clientId: number;
  caseId: number | null;
  date: string;
  suspicionReason: string;
  amountFlagged: number;
  reportedBy: string;
  status: "تحقيق داخلي" | "مرفوع لوحدة الاستعلام المالي FIU" | "مغلق بانتفاء الشبهة";
  confidentialNotes: string;
}

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

export interface DocTemplate {
  id: string;
  title: string;
  category: string;
  templateBody: string;
}

export interface OfficeAgreementInstallment {
  amount: number;
  dueDate: string;
  paidOnSigning: boolean; // مسددة عند التوقيع؟ => يُنشأ لها سند قبض تلقائياً
}

export interface OfficeAgreement {
  id: number;
  agreementNumber: string; // رقم AGR المرتبط باتفاقية الأتعاب
  feeAgreementId: number; // معرف اتفاقية الأتعاب المنشأة تلقائياً
  clientId: number;
  contractDate: string;
  contractCity: string;
  clientNameAr: string;
  clientNameEn: string;
  representativeAr: string;
  representativeEn: string;
  phone: string;
  caseDetailsAr: string;
  caseDetailsEn: string;
  totalAmount: number;
  paymentTermsAr: string;
  paymentTermsEn: string;
  installments: OfficeAgreementInstallment[];
  createdAt: string;
  customClauses?: { ar: string; en: string }[]; // بنود وشروط معدّلة يدوياً لهذه الاتفاقية تحديداً (تحل محل القائمة الافتراضية عند وجودها)
}

export interface Employee {
  id: string;
  userId?: string | null;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  passportNumber: string;
  emiratesId: string;
  idExpiryDate: string;
  licenseNumber?: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  joinDate: string;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
  createdAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "ANNUAL" | "SICK" | "EMERGENCY" | "UNPAID";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string | null;
  createdAt: string;
}

export interface EmployeeExpense {
  id: string;
  employeeId: string;
  employeeName: string;
  caseId?: number | null;
  amount: number;
  category: "COURT_FEES" | "TRANSPORT" | "SUPPLIES" | "OTHER";
  receiptUrl?: string | null;
  status: "PENDING" | "PAID" | "REJECTED";
  createdAt: string;
}

export interface EmployeeDisciplinaryAction {
  id: number;
  employeeId: string;
  employeeName: string;
  type: "تحقيق داخلي" | "إنذار شفهي" | "إنذار كتابي" | "قرار تأديبي" | "قرار إداري" | "أخرى";
  actionDate: string;
  subject: string;
  details: string;
  attachmentRef?: string;
  createdAt: string;
  createdBy?: string;
}

export interface LetterheadConfig {
  headerImg: string;
  footerImg: string;
  signatureImg: string;
  stampImg: string;
  /** صورة واحدة كاملة لكامل صفحة A4 (بدون نص) — المصدر الأساسي الحديث للورق
   * الرسمي. عند رفعها من قسم "الهوية الرسمية والأختام"، يتم اشتقاق headerImg
   * وfooterImg تلقائياً منها (اقتصاص الجزء العلوي والسفلي) حتى تستمر جميع
   * أماكن استخدام الورق الرسمي في النظام بالعمل دون أي تعديل إضافي. تبقى
   * فارغة للحسابات القديمة التي لم تُحدَّث بعد إلى الصورة الكاملة الواحدة. */
  fullPageImg: string;
}

export interface SystemModuleDef {
  id: keyof RolePermissions;
  label: string;
  desc: string;
  category: "العمليات القانونية" | "التواصل والمهام" | "المالية والعقود" | "الإدارة والامتثال";
  navTabIds: string[];
}

export interface LegalPrecedent {
  id: string | number;
  title: string;
  court_name: string;
  ruling_year: number;
  category: string;
  circuit_name?: string;
  appeal_number: string;
  summary_text: string;
  pdf_file_url?: string;
  word_file_url?: string;
  created_at?: string;
}

export interface InternalPolicy {
  id: number;
  title: string;
  category: string;
  content: string;
  effectiveDate?: string;
  updatedAt: string;
  updatedBy?: string;
}
