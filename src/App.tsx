import React, { useState, useMemo, useEffect, Suspense, lazy } from "react";
import OfficialLetterComposer, {
  LETTERHEAD_LAYOUT as LETTERHEAD_PAGE_LAYOUT,
  printHtmlDocumentInHiddenIframe,
  LETTER_FONT_STACK,
  AMIRI_FONT_LINK,
} from "./OfficialLetterComposer";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Logo from "./components/Logo";
import { ErrorBoundary } from "./components/ErrorBoundary";
// النوافذ المنبثقة (Modals) تُحمَّل عند الطلب فقط (React.lazy) لتقليل حجم الحزمة
// الرئيسية الأولية — هذه النوافذ لا تُستخدم إلا عند فتح المستخدم لها فعلياً.
const DocModal = lazy(() => import("./components/modals/DocModal"));
const PoaModal = lazy(() => import("./components/modals/PoaModal"));
const HearingModal = lazy(() => import("./components/modals/HearingModal"));
const TaskModal = lazy(() => import("./components/modals/TaskModal"));
const ClientModal = lazy(() => import("./components/modals/ClientModal"));
const ColleagueModal = lazy(() => import("./components/modals/ColleagueModal"));
const TimeLogModal = lazy(() => import("./components/modals/TimeLogModal"));
const CaseExpenseModal = lazy(() => import("./components/modals/CaseExpenseModal"));
const InvoiceModal = lazy(() => import("./components/modals/InvoiceModal"));
const TrustTransactionModal = lazy(() => import("./components/modals/TrustTransactionModal"));
const IssueDelegationModal = lazy(() => import("./components/modals/IssueDelegationModal"));
const LeaveRequestModal = lazy(() => import("./components/modals/LeaveRequestModal"));
const EmployeeExpenseModal = lazy(() => import("./components/modals/EmployeeExpenseModal"));
const StrReportModal = lazy(() => import("./components/modals/StrReportModal"));
const EmployeeModal = lazy(() => import("./components/modals/EmployeeModal"));
const KycModal = lazy(() => import("./components/modals/KycModal"));
const CaseModal = lazy(() => import("./components/modals/CaseModal"));
const PaymentModal = lazy(() => import("./components/modals/PaymentModal"));
const UserModal = lazy(() => import("./components/modals/UserModal"));
const DeadlineModal = lazy(() => import("./components/modals/DeadlineModal"));
const CourtContactModal = lazy(() => import("./components/modals/CourtContactModal"));
const DisciplinaryActionModal = lazy(() => import("./components/modals/DisciplinaryActionModal"));
import DashboardView from "./components/DashboardView";
import CasesListView from "./components/CasesListView";
import CaseDetailView from "./components/CaseDetailView";
import HearingsView from "./components/HearingsView";
import PublicConsultationPage, {
  BookingRecord,
  ConsultationSettings,
} from "./components/PublicConsultationPage";
import AdminConsultationsView from "./components/AdminConsultationsView";
import GoogleCalendarSyncModal from "./components/GoogleCalendarSyncModal";
import { initAuth, createGoogleCalendarEvent, formatCalendarDateTime } from "./googleCalendar";
import { User as FirebaseUser } from "firebase/auth";
import {
  supabase,
  sendWhatsAppViaEdgeFunction,
  sendEmailViaServer,
  authedFetch,
} from "./supabaseClient";
import { hashPassword, isHashedPassword } from "./cryptoUtils";
import {
  sendWhatsAppMsg,
  sendEmailMsg,
  findMatchingClientByName,
  inputCls,
  loadStorage,
  saveStorage,
  flushSaveStorage,
  fetchSupabaseTable,
  pushSupabaseTable,
  nextMainInvoiceNumber,
} from "./domain/storageAndMessaging";
import { usePolicies } from "./hooks/usePolicies";
import { usePrecedents } from "./hooks/usePrecedents";
import { useDisciplinaryActions } from "./hooks/useDisciplinaryActions";
import { useColleagues } from "./hooks/useColleagues";
import { useKycWatchlist } from "./hooks/useKycWatchlist";
import { useClientsData } from "./hooks/useClientsData";
import { useCasesData } from "./hooks/useCasesData";
import { useFinancialCoreData } from "./hooks/useFinancialCoreData";
import { useAuditLogsData } from "./hooks/useAuditLogsData";
import { useKycData } from "./hooks/useKycData";
import { useDeadlines } from "./hooks/useDeadlines";
import { useBillingRecords } from "./hooks/useBillingRecords";
import { useCaseFilters } from "./hooks/useCaseFilters";
import { useCourtContactFilters } from "./hooks/useCourtContactFilters";
import { useApproveUserModal } from "./hooks/useApproveUserModal";
import { useClientFilters } from "./hooks/useClientFilters";
import { useAiAssistantModal } from "./hooks/useAiAssistantModal";
import { useAiAssistant } from "./hooks/useAiAssistant";
import { useEmailModule } from "./hooks/useEmailModule";
import { useWhatsAppModule } from "./hooks/useWhatsAppModule";
import { useAiDocExtraction } from "./hooks/useAiDocExtraction";
import { useCasesExcelImport } from "./hooks/useCasesExcelImport";
import { useGoogleCalendarModal } from "./hooks/useGoogleCalendarModal";
import { useAuditFilters } from "./hooks/useAuditFilters";
import { useCourtExcelImport } from "./hooks/useCourtExcelImport";
import { usePrecedentForm } from "./hooks/usePrecedentForm";
import { useBackupRestoreModal } from "./hooks/useBackupRestoreModal";
import { useBackupExportRestore } from "./hooks/useBackupExportRestore";
import { useHrRecords } from "./hooks/useHrRecords";
import { useDeadlineUiState } from "./hooks/useDeadlineUiState";
import { useKycWatchlistModal } from "./hooks/useKycWatchlistModal";
import { useSubTabs } from "./hooks/useSubTabs";
import { useDocGenState } from "./hooks/useDocGenState";
import { useAgreementDraftState } from "./hooks/useAgreementDraftState";
import { useLetterhead } from "./hooks/useLetterhead";
import { useNotifications } from "./hooks/useNotifications";
import {
  Scale,
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarDays,
  ListChecks,
  Receipt,
  FolderOpen,
  FileSignature,
  Plus,
  Search,
  X,
  Bell,
  BellRing,
  BellOff,
  Building2,
  Gavel,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Trash2,
  Printer,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Shield,
  Lock,
  UserCheck,
  Key,
  Check,
  Minus,
  Info,
  UserPlus,
  ShieldAlert,
  Edit2,
  User,
  RefreshCw,
  Smartphone,
  Send,
  MessageSquare,
  Share2,
  ExternalLink,
  FileText,
  CheckCheck,
  SendHorizontal,
  Filter,
  Calculator,
  Globe,
  Landmark,
  DollarSign,
  FileCheck,
  AlertCircle,
  FileSpreadsheet,
  Hourglass,
  Copy,
  PhoneCall,
  CreditCard,
  Download,
  Database,
  Code,
  LogOut,
  Inbox,
  Paperclip,
  RotateCw,
  QrCode,
  Settings,
  History,
  BookOpen,
  UploadCloud,
  Video,
  Sparkles,
  Bot,
  Zap,
  PlusCircle,
  Layers,
  BarChart3,
  PieChart as LucidePieChart,
  Activity,
  CheckSquare,
  Target,
  Percent,
  Menu,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Hash,
  ArrowUpDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Handshake,
  UserCog,
  Stamp,
  ScrollText,
  Save,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from "recharts";
import * as XLSX from "xlsx";
import { uaeTerroristList } from "./data/uaeTerroristListData";
import { seedCourtContacts } from "./courtContactsData";
import AccountingModule from "./accounting/AccountingModule";
import type {
  AllocationStatus,
  AuditLogEntry,
  CaseExpense,
  CaseItem,
  Client,
  Colleague,
  ColleagueDelegation,
  CourtContact,
  DelegationPrintData,
  DocItem,
  DocTemplate,
  Employee,
  EmployeeDisciplinaryAction,
  EmployeeExpense,
  FeeAgreement,
  FeeAgreementInstallment,
  FeeAgreementStatus,
  Hearing,
  InternalPolicy,
  Invoice,
  InvoiceInstallment,
  JudgmentDeadline,
  JudgmentDeadlineLog,
  KycItem,
  KycWatchlistItem,
  LeaveRequest,
  LegalPrecedent,
  LetterheadConfig,
  NotificationLog,
  OfficeAgreement,
  OfficeAgreementInstallment,
  PaymentReceipt,
  PoaItem,
  RolePermissions,
  StrReport,
  SystemModuleDef,
  TaskItem,
  TimeLog,
  TrustTransaction,
  UserItem,
} from "./domain/types";
import {
  UAE_TIME_ZONE,
  addDays,
  addDaysFrom,
  caseOpponentsLabel,
  caseTypeBadgeColor,
  caseTypeDotColor,
  daysUntil,
  effectiveInvoiceStatus,
  escapeHtmlText,
  firstNNameTokens,
  fmtAED,
  fmtDate,
  formatUaePhone,
  getCaseStage,
  invColor,
  isDeadlineOpen,
  nextReviewDate,
  normalizeArabicName,
  normalizeArabicNameForMatch,
  normalizeArabicSearch,
  normalizePhoneDigits,
  stageBadgeColor,
  statusColor,
  toDubaiISODate,
  todayISO,
  loadLetterhead,
  saveLetterhead,
  sanitizeHtml,
  isDemoCase,
  sanitizeCase,
  isDemoHearing,
  normalizeCaseNumberKey,
  deduplicateCases,
  deduplicateClients,
} from "./domain/utils";
import {
  ACCOUNTING_MODULE_ENABLED,
  ACCOUNTING_TRIAL_USER_EMAILS,
  CASE_STAGES,
  CASE_STATUS,
  CASE_TYPES,
  COURTS,
  DOC_TEMPLATES,
  DOC_TYPES,
  FIRM_NAME,
  FIRM_TAGLINE,
  FIRM_TRN,
  FUND_SOURCES,
  HEARING_TYPES,
  KYC_STATUS_COLORS,
  LH_KEY,
  OFFICE_AGREEMENT_CLAUSES,
  OFFICE_FOOTER_IMG,
  OFFICE_HEADER_IMG,
  OFFICE_SIGNATURE_IMG,
  OFFICE_STAMP_IMG,
  OFFICE_TRN,
  POLICY_CATEGORIES,
  REVIEW_YEARS,
  RISK_COLORS,
  SANCTIONS_STATES,
  TASK_PRIORITY,
  TASK_TEMPLATES,
  VAT_RATE,
} from "./domain/constants";
import {
  DETAILED_ACTION_PERMISSIONS,
  PERMISSION_LABELS,
  PERMISSION_MODULES,
  ROLE_PRESETS,
  getActivePermissionsCount,
  hasTabPermission,
} from "./domain/permissions";
import {
  seedCaseExpenses,
  seedCases,
  seedClients,
  seedConsultationBookings,
  seedDeadlines,
  seedDeadlinesOld_unused,
  seedDocs,
  seedEmployeeExpenses,
  seedEmployees,
  seedHearings,
  seedInstallments,
  seedInternalPolicies,
  seedKycWatchlist,
  seedLeaveRequests,
  seedLegalPrecedents,
  seedNotifications,
  seedPoas,
  seedStrReports,
  seedTasks,
  seedTimeLogs,
  seedTrustTransactions,
  seedUsers,
} from "./domain/seedData";
import {
  Badge,
  EmptyState,
  Field,
  LoginScreen,
  LoginScreenProps,
  Modal,
  PendingApprovalScreen,
  REACT_PROTECTED_ROUTE_SQL,
  SUPABASE_PROFILES_SQL,
  SUPABASE_RLS_SQL,
  SUPABASE_TRIGGER_SQL,
  SUPABASE_WHATSAPP_MESSAGES_SQL,
  SupabaseSqlModal,
  SupabaseSqlModalProps,
} from "./components/AuthScreens";
import TasksView from "./components/TasksView";
import PoaView from "./components/PoaView";
import ColleaguesView from "./components/ColleaguesView";
import InAppEmailView from "./components/InAppEmailView";
import WhatsappOfficeView from "./components/WhatsappOfficeView";
import InvoicesView from "./components/InvoicesView";
import UsersView from "./components/UsersView";
import CourtsDirectoryView from "./components/CourtsDirectoryView";
import EmployeesView from "./components/EmployeesView";
import PoliciesView from "./components/PoliciesView";
import ClientsView from "./components/ClientsView";
import OfficeAgreementView from "./components/OfficeAgreementView";
import DocsView from "./components/DocsView";
import OfficialIdentityView from "./components/OfficialIdentityView";
import KycView from "./components/KycView";
import AuditLogView from "./components/AuditLogView";
import PrecedentsView from "./components/PrecedentsView";

/* ============================================================
   نظام إدارة مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية
   الإمارات العربية المتحدة — شامل مع نظام إدارة المستخدمين والصلاحيات
   ============================================================ */

// ---------- بيانات مرجعية إماراتية ----------

// ---------- دوال معالجة وتطبيع النصوص العربية والأرقام للبحث الذكي ----------

// تطبيع الأسماء العربية لأغراض مطابقة KYC/قوائم الحظر: توحيد الألف بجميع أشكال الهمزة (أ/إ/آ) إلى ألف عادية،
// وتوحيد التاء المربوطة (ة) مع الهاء (ه)، والألف المقصورة (ى) مع الياء (ي)، وحذف التشكيل والمسافات الزائدة،
// حتى لا يفشل التطابق بسبب اختلافات إملائية شائعة (مثل "فاطمه"/"فاطمة" أو "امنه"/"آمنة") وهي نفس الاسم فعلياً.
// استخراج أول (n) كلمات من الاسم بعد التطبيع — تُستخدم لمطابقة الاسم الثلاثي (أول ثلاث مقاطع من الاسم)
// بدل الاسم الكامل، لأن قوائم الحظر أو الموكلين قد تحتوي اسم رباعي/خماسي بينما المستخدم يدخل ثلاثة مقاطع فقط.

// ---------- العلم الرئيسي للنظام المحاسبي المتكامل (المرحلة قيد الإنشاء) ----------
// هذا الثابت هو المفتاح الوحيد لتفعيل النظام المحاسبي الجديد بكامله في الموقع لجميع المستخدمين.
// طالما قيمته false: لا يظهر أي تبويب أو رابط للنظام المحاسبي في القائمة الجانبية لعموم
// المستخدمين، ولا تُعرض واجهته إطلاقاً — بشكل مستقل تماماً عن نظام الصلاحيات المعتاد
// (RolePermissions). لا يتم تفعيله (تحويله إلى true) إلا بتعليمات صريحة من مالك المكتب
// بعد اكتمال جميع مراحل النظام المحاسبي السبع واختباره بالكامل على قاعدة البيانات الخلفية.

// تفعيل تجريبي محدود: يسمح بظهور النظام المحاسبي فقط لحساب بريده الإلكتروني ضمن هذه القائمة
// (طلب صريح من مالك المكتب لتجربة النظام على حسابه الشخصي فقط، قبل اكتمال نقل البيانات
// لقاعدة البيانات الخلفية). لا يُضاف أي بريد لهذه القائمة إلا بتعليمات صريحة من مالك المكتب.
// هذا التفعيل التجريبي لا يغيّر قيمة ACCOUNTING_MODULE_ENABLED أعلاه ولا يؤثر على أي مستخدم آخر.

// تحويل النص العادي إلى HTML آمن (لمنع كسر بنية مستند الطباعة أو حقن وسوم
// غير مقصودة عند وجود رموز مثل < أو & أو " ضمن بيانات الموكلين/القضايا).

// بيانات الإنابة الجاهزة لبناء مستند طباعتها — كل الحقول هنا نصوص/قيم مُحسّبة
// مسبقاً (وليست دوال أو كائنات حالة) حتى تبقى دالة البناء نقية بلا اعتماد على
// حالة أو خطافات React، تماماً كما هو معمول به في buildPrintDocument الخاصة
// بالمذكرات في OfficialLetterComposer.tsx.

// تبني مستند HTML كامل مستقل لطباعة الإنابة، بنفس أسلوب buildPrintDocument
// المعتمد في قسم "المذكرات" (OfficialLetterComposer): صور ترويسة/تذييل بحجمها
// الفعلي الكامل (210mm عرضاً) بدل تصغيرها ضمن الصفحة الحية، ونص متجه حقيقي
// بلا أي تحويل إلى صورة. يُطبع هذا المستند لاحقاً عبر إطار iframe مخفي منفصل
// تماماً عن صفحة النظام الحية (وليس عبر window.print() على الصفحة نفسها)،
// وهو ما يمنع أيضاً إضافة المتصفح التلقائية لعنوان الصفحة ورابط الموقع أعلى/
// أسفل كل صفحة مطبوعة (وهي إضافة تلقائية من نافذة طباعة المتصفح خاصة بالصفحة
// الحية ذات العنوان والرابط الحقيقيين، ولا تظهر عند طباعة مستند iframe منفصل
// بلا عنوان/رابط حقيقيين).
function buildDelegationPrintHtml(d: DelegationPrintData): string {
  const sigStampHtml = d.showSignatureStamp
    ? '<div class="sig-stamp-wrap">' +
      (d.stampImg ? '<img class="stamp-img" src="' + d.stampImg + '" />' : "") +
      (d.signatureImg ? '<img class="signature-img" src="' + d.signatureImg + '" />' : "") +
      "</div>"
    : "";

  const defaultBodyHtml =
    '<div class="row-between">' +
    "<span>الموكل :- <b>" +
    escapeHtmlText(d.clientName) +
    "</b></span>" +
    "<span>الصفة :- <b>" +
    escapeHtmlText(d.clientCapacity) +
    "</b></span>" +
    "</div>" +
    "<p>ضـــد :- <b>" +
    escapeHtmlText(d.opponents) +
    "</b></p>" +
    '<div class="row-between dashed-top">' +
    "<span>أنـــا المحامي :- <b>" +
    escapeHtmlText(d.issuedByName) +
    "</b></span>" +
    "<span>قيد رقم :- <b>" +
    escapeHtmlText(d.issuerLicenseNumber) +
    "</b></span>" +
    "</div>" +
    '<p class="body-para">بموجب هذه الإنابة، وبصفتي وكيلاً عن الموكل المذكور أعلاه أنيب زميلي الأستاذ المحامي :- <b>' +
    escapeHtmlText(d.colleagueName) +
    "</b>&nbsp;&nbsp;قيد رقم :- <b>" +
    escapeHtmlText(d.colleagueLicenseNumber) +
    "</b></p>" +
    '<p class="body-para">للحضور والترافع والقيام بجميع الإجراءات اللازمة نيابة عني في القضية المذكورة أعلاه' +
    (d.sessionDateLabel
      ? " وذلك بجلسة يوم <b>" + escapeHtmlText(d.sessionDateLabel) + "</b>"
      : "") +
    (d.caseTitleSnapshot ? " (" + escapeHtmlText(d.caseTitleSnapshot) + ")" : "") +
    ".</p>" +
    '<div class="purpose-box">' +
    '<p class="title">الغرض من الإنابة:</p>' +
    "<p>" +
    escapeHtmlText(d.purpose).replace(/\n/g, "<br>") +
    "</p>" +
    "</div>";

  const bodyHtml = d.customBodyHtml ? d.customBodyHtml : defaultBodyHtml;

  return (
    "<!DOCTYPE html>\n" +
    '<html dir="rtl" lang="ar">\n' +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    "<title>إنابة — " +
    escapeHtmlText(d.refNo) +
    "</title>\n" +
    '<link rel="stylesheet" href="' +
    AMIRI_FONT_LINK +
    '">\n' +
    "<style>\n" +
    "  @page { size: A4; margin: 0; }\n" +
    "  * { margin: 0; padding: 0; box-sizing: border-box; }\n" +
    "  html, body { width: 210mm; }\n" +
    "  body { font-family: " +
    LETTER_FONT_STACK +
    "; font-size: 12.5pt; line-height: 1.9; color: #1a1a1a; }\n" +
    "  .print-page { width: 210mm; min-height: 297mm; display: flex; flex-direction: column; }\n" +
    "  .header-strip-img { display: block; width: 210mm; height: 46mm; flex: none; }\n" +
    "  .footer-strip-img { display: block; width: 210mm; height: 20mm; flex: none; }\n" +
    "  .doc-content { flex: 1; display: flex; flex-direction: column; padding: 6mm 18mm; max-width: 100%; overflow-wrap: break-word; word-break: break-word; }\n" +
    "  .doc-topbar { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 0.3mm solid #e2e2e2; padding-bottom: 3mm; margin-bottom: 6mm; }\n" +
    "  .doc-date { font-size: 9.5pt; color: #555; }\n" +
    "  .doc-refno { font-size: 7.5pt; color: #b3b8bd; font-family: 'Courier New', monospace; text-align: right; }\n" +
    "  .court-line, .case-line { margin-bottom: 2mm; }\n" +
    "  .delegation-title { text-align: center; font-size: 15pt; font-weight: 700; letter-spacing: 4pt; margin: 6mm 0; }\n" +
    "  .row-between { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4mm; margin-bottom: 2mm; }\n" +
    "  .dashed-top { border-top: 0.3mm dashed #c7c7c7; padding-top: 3mm; margin-top: 2mm; }\n" +
    "  .body-para { margin-bottom: 4mm; }\n" +
    "  .purpose-box { border: 0.3mm solid #ddd; border-radius: 2mm; background: #fafaf8; padding: 4mm; margin: 4mm 0; }\n" +
    "  .purpose-box .title { font-weight: 700; margin-bottom: 1.5mm; }\n" +
    "  .closing-line { margin: 4mm 0; }\n" +
    "  .signature { margin-top: auto; text-align: left; padding-top: 6mm; }\n" +
    "  .signature .sig-name-title { font-weight: 700; }\n" +
    "  .sig-stamp-wrap { position: relative; height: 26mm; width: 55mm; margin: 2mm 0; }\n" +
    "  .stamp-img { position: absolute; top: 0; right: 6mm; height: 26mm; width: 26mm; object-fit: contain; opacity: 0.9; transform: rotate(-6deg); }\n" +
    "  .signature-img { position: absolute; bottom: 1mm; left: 0; height: 16mm; object-fit: contain; }\n" +
    "  .sign-line { border-top: 0.3mm solid #999; padding-top: 1mm; display: inline-block; margin-top: 6mm; }\n" +
    "  .ql-align-center { text-align: center; }\n" +
    "  .ql-align-right { text-align: right; }\n" +
    "  .ql-align-justify { text-align: justify; }\n" +
    "  .ql-align-left { text-align: left; }\n" +
    "  .doc-content p { margin-bottom: 3mm; }\n" +
    "  .doc-content b, .doc-content strong { font-weight: bold; }\n" +
    "</style>\n" +
    "</head>\n" +
    "<body>\n" +
    '  <div class="print-page">\n' +
    (d.headerImg ? '    <img class="header-strip-img" src="' + d.headerImg + '" />\n' : "") +
    '    <div class="doc-content">\n' +
    '      <div class="doc-topbar">\n' +
    '        <span class="doc-date">التاريخ: ' +
    escapeHtmlText(d.dateLabel) +
    "</span>\n" +
    '        <span class="doc-refno">الرقم المرجعي: ' +
    escapeHtmlText(d.refNo) +
    "</span>\n" +
    "      </div>\n" +
    '      <p class="court-line">لدى ' +
    escapeHtmlText(d.courtName) +
    " الموقرة ,,,</p>\n" +
    '      <p class="case-line">في القضية رقم :- <b>' +
    escapeHtmlText(d.caseNumber) +
    "</b></p>\n" +
    '      <h1 class="delegation-title">إنـابـة</h1>\n' +
    "      " +
    bodyHtml +
    "\n" +
    '      <p class="closing-line">وتفضلوا بقبول وافر الاحترام والتقدير.</p>\n' +
    '      <div class="signature">\n' +
    '        <p class="sig-name-title">المحامي الموكل</p>\n' +
    "        <p>الاسم :- " +
    escapeHtmlText(d.issuedByName) +
    "</p>\n" +
    sigStampHtml +
    "\n" +
    '        <p class="sign-line">التوقيع والختم</p>\n' +
    "      </div>\n" +
    "    </div>\n" +
    (d.footerImg ? '    <img class="footer-strip-img" src="' + d.footerImg + '" />\n' : "") +
    "  </div>\n" +
    "</body>\n" +
    "</html>"
  );
}

// ---------- الأنواع والواجهات ومصفوفة الصلاحيات الموسعة ----------

// ---------- الزملاء المتعاونون وإنابات الحضور ----------

// سجل سري بالإجراءات التأديبية الخاصة بموظف معين (تحقيق داخلي / إنذار / قرار) — مقتصر على الحساب الرئيسي فقط

// البنود الثابتة للاتفاقية المعتمدة (1-8) — لا تتغير من عميل لآخر

// loadLetterhead/saveLetterhead: انتقلت إلى ./domain/utils
// ---------- مصفوفة أقسام وتبويبات النظام الـ 18 المعتمدة ----------

// مصفوفة صلاحيات العمليات الإجرائية الدقيقة والتفويضات والحذف المقيد

// فحص صلاحيات الوصول للتبويب المحدد مع تطبيق سياسة الحظر الافتراضي (Default-Deny Policy)

// حساب عدد الصلاحيات المتاحة الفعلية من أصل الأقسام المعتمدة في PERMISSION_MODULES

// ---------- القوالب المسبقة للأدوار (شاملة الـ 18 قسماً + العمليات) ----------

// ---------- اعرف عميلك (KYC) — وفق متطلبات مكافحة غسل الأموال ----------

// ---------- السياسات الداخلية للمكتب ----------

// دوال إرسال واتساب/إيميل، تخزين محلي، ومزامنة Supabase — انتقلت إلى ./domain/storageAndMessaging

// ============================================================
export default function App() {
  const [currentRoute, setCurrentRoute] = useState<"admin" | "public_consultation">(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.pathname === "/consultation" ||
        window.location.search.includes("page=consultation")
      ) {
        return "public_consultation";
      }
    }
    return "admin";
  });

  const [consultationBookings, setConsultationBookings] = useState<BookingRecord[]>(() => {
    const loaded = loadStorage<BookingRecord[]>(
      "firm_consultation_bookings",
      seedConsultationBookings,
    );
    return (loaded || []).filter((b) => b.id !== "b-101" && b.id !== "b-102");
  });

  useEffect(() => {
    saveStorage("firm_consultation_bookings", consultationBookings);
  }, [consultationBookings]);

  const defaultConsultationSettings: ConsultationSettings = {
    price30: 525,
    price60: 945,
    availableSlots: [
      "09:00 AM",
      "10:30 AM",
      "12:00 PM",
      "02:00 PM",
      "03:30 PM",
      "05:00 PM",
      "06:30 PM",
      "08:00 PM",
    ],
    blockedDates: [],
    // بيانات الحساب البنكي الرسمي المعتمد للمكتب — تُعرض للعملاء في صفحة الحجز العامة.
    // أي تعديل هنا يجب أن يطابق بيانات الحساب الفعلية لدى البنك، فهذه الأرقام تُستخدم لتحويل أموال حقيقية.
    mbankIban: "AE260973002451030000001",
    mbankBankName: "بنك المارية المحلي ذ.م.م.",
    mbankAccountName: "SUOOD AHMED ALSHEHHI ADVOCATES & LEGAL CONSULTANTS",
  };

  const [consultationSettings, setConsultationSettings] = useState<ConsultationSettings>(() =>
    loadStorage("firm_consultation_settings", defaultConsultationSettings),
  );

  useEffect(() => {
    saveStorage("firm_consultation_settings", consultationSettings);
  }, [consultationSettings]);

  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState<UserItem[]>(() => {
    const loaded = loadStorage<UserItem[]>("firm_users", seedUsers);
    const initial = !loaded || loaded.length === 0 ? seedUsers : loaded;
    return initial.map((u) => {
      // تصحيح البريد الإلكتروني لحساب المالك الأساسي المزروع (id=1) فقط دون سواه
      if (u.id === 1) {
        return { ...u, email: "info@lawyersuood.com" };
      }
      return u;
    });
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("firm_is_logged_in") === "true";
    } catch {
      return false;
    }
  });
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("firm_logged_in_user_id");
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // المستخدم الحالي والصلاحيات النشطة
  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || users[0],
    [users, currentUserId],
  );
  const userPerms = currentUser.permissions;

  const isAdmin = useMemo(() => {
    return currentUser?.roleKey === "admin" || (currentUser as any)?.role === "admin";
  }, [currentUser]);

  // التحقق مما إذا كان المستخدم الحالي هو مدير النظام (بالاعتماد على الدور الوظيفي المخصص فقط، وليس الاسم أو رقم الحساب)
  const isSuperAdmin = useMemo(() => {
    return currentUser?.roleKey === "admin" || (currentUser as any)?.role === "admin";
  }, [currentUser]);

  // التحقق من صلاحية الاطلاع على البيانات والتقارير المالية والأتعاب
  const canViewFinancials = useMemo(() => {
    if (!currentUser) return false;
    if (isSuperAdmin || isAdmin) return true;
    // يجب مطابقة نفس شرط hasTabPermission لتبويب "invoices" (بما في ذلك علم canViewFinances
    // المستقل على المستخدم)، وإلا يظهر التبويب بالتنقل لمستخدم ثم تُحجب عنه محتوياته فعلياً
    if (currentUser.canViewFinances) return true;
    if (
      userPerms?.finance ||
      userPerms?.viewInvoices ||
      userPerms?.manageInvoices ||
      userPerms?.agreements
    )
      return true;
    const preset = ROLE_PRESETS[currentUser.roleKey]?.permissions;
    if (preset?.finance || preset?.viewInvoices || preset?.manageInvoices || preset?.agreements)
      return true;
    return false;
  }, [currentUser, isAdmin, isSuperAdmin, userPerms]);

  // التحقق من صلاحية تعديل الورق الرسمي والتوقيع والختم (صلاحية حساسة ومحمية) — قسم الهوية الرسمية
  const canManageLetterhead = useMemo(() => {
    if (!currentUser) return false;
    if (isSuperAdmin || isAdmin) return true;
    return Boolean(userPerms?.manageLetterheadAssets);
  }, [currentUser, isAdmin, isSuperAdmin, userPerms]);

  // التحقق من صلاحية إدراج (استخدام) التوقيع والختم المعتمدين عند إصدار المستندات — دون صلاحية تعديلهما
  const canUseSignatureStamp = useMemo(() => {
    if (!currentUser) return false;
    if (isSuperAdmin || isAdmin) return true;
    return Boolean(userPerms?.manageLetterheadAssets || userPerms?.useSignatureStamp);
  }, [currentUser, isAdmin, isSuperAdmin, userPerms]);

  // التحقق من صلاحية الاطلاع على بلاغات الاشتباه AML/STR (صلاحية حساسة ومحمية) — حصر على مسؤول الامتثال/المدير
  const canManageStrReports = useMemo(() => {
    if (!currentUser) return false;
    if (isSuperAdmin || isAdmin) return true;
    return Boolean(userPerms?.manageStrReports);
  }, [currentUser, isAdmin, isSuperAdmin, userPerms]);

  // ---------- سجل التدقيق والأنشطة الأمني (Audit Log) ----------
  // auditLogs: انتقلت لهوك useAuditLogsData (مع مزامنة Supabase — كانت هذه المزامنة سابقاً جزءاً
  // من useEffect الضخم "remainingSyncTables" بالأسفل، والحفظ المحلي وحده كان هنا فقط).
  const { auditLogs, setAuditLogs } = useAuditLogsData();

  // دالة توثيق العمليات والأنشطة مع تسجيل معرف المستخدم والتوقيت الكامل
  const logAuditAction = (
    actionType:
      | "DELETE"
      | "UPDATE"
      | "CREATE"
      | "STATUS_CHANGE"
      | "PERMISSION_CHANGE"
      | "UNAUTHORIZED_DELETE"
      | "UNAUTHORIZED_ACCESS",
    targetModule: string,
    targetTitle: string,
    details: string,
    targetId?: string | number,
    statusOverride?: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل",
    userOverride?: {
      id?: string | number;
      name?: string;
      email?: string;
      roleTitle?: string;
      jobTitle?: string;
    },
  ) => {
    const activeUser = userOverride || users.find((u) => u.id === currentUserId) || currentUser;
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const formattedTimestamp = `${now.toLocaleDateString("ar-AE", { year: "numeric", month: "2-digit", day: "2-digit" })} ${now.toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`;

    let defaultStatus: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل" = "مكتمل";
    if (actionType === "UNAUTHORIZED_DELETE" || actionType === "UNAUTHORIZED_ACCESS") {
      defaultStatus = "محاولة غير مصرح بها - مرفوض";
    } else if (actionType === "DELETE") {
      defaultStatus = "مؤكد";
    }

    const newEntry: AuditLogEntry = {
      id: "audit-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
      timestamp: isoTimestamp,
      formattedTimestamp,
      userId: activeUser?.id ?? currentUserId ?? 1,
      userName: activeUser?.name || "مستخدم للنظام",
      userEmail: activeUser?.email || "info@lawyersuood.com",
      userRole:
        (activeUser as any)?.roleTitle ||
        ((activeUser as any)?.roleKey === "admin"
          ? "مدير النظام"
          : (activeUser as any)?.jobTitle || "موظف"),
      actionType,
      targetModule,
      targetId: targetId || "—",
      targetTitle,
      details,
      // ملاحظة: عنوان IP الحقيقي للجهاز لا يمكن معرفته من كود يعمل في متصفح المستخدم مباشرة (يحتاج استدعاء خادم خلفي)؛
      // كانت القيمة هنا ثابتة ووهمية (192.168.1.10) لكل السجلات بلا استثناء، ما يوحي بخلاف الواقع بأن العنوان مرصود فعلياً.
      // نتركها فارغة الآن بصراحة بدل قيمة مضلّلة، لحين ربطها بخدمة خلفية فعلية ترصد عنوان الطلب الحقيقي.
      ipAddress: "غير متاح (يتطلب تسجيلاً من الخادم)",
      status: statusOverride || defaultStatus,
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // التحقق من الصلاحية مع التنبيه الفوري والتوثيق الآلي لجميع المحاولات غير المصرح بها
  const checkPerm = (
    permKey: keyof RolePermissions,
    actionName: string,
    context?: {
      section?: string;
      title?: string;
      details?: string;
      targetId?: string | number;
      isDelete?: boolean;
    },
  ): boolean => {
    if (isSuperAdmin) return true;
    const hasPerm = Boolean(
      userPerms?.[permKey] ?? (ROLE_PRESETS[currentUser.roleKey]?.permissions?.[permKey] || false),
    );
    if (!hasPerm) {
      const label = PERMISSION_LABELS[permKey]?.label || permKey;
      const isDeletionAttempt = String(permKey).startsWith("delete") || Boolean(context?.isDelete);

      // توثيق محاولة الإجراء غير المصرح بها فوراً في جدول سجل التدقيق مع معرف المستخدم والتوقيت الكامل
      logAuditAction(
        isDeletionAttempt ? "UNAUTHORIZED_DELETE" : "UNAUTHORIZED_ACCESS",
        context?.section || PERMISSION_LABELS[permKey]?.label || "إدارة الصلاحيات",
        context?.title || `محاولة ${actionName}`,
        `محاولة غير مصرح بها: قام المستخدم "${currentUser.name}" (معرف ID: #${currentUser.id}، البريد: ${currentUser.email}، الرتبة: ${currentUser.roleTitle}) بمحاولة تنفيذ [${actionName}] دون امتلاك الصلاحية المطلوبة [${label}]. تم حظر العملية وإحباطها تلقائياً.`,
        context?.targetId || "—",
        "محاولة غير مصرح بها - مرفوض",
      );

      setPermissionNotice(
        `🚫 منع إجراء: حساب "${currentUser.name}" (معرف: #${currentUser.id}) دور (${currentUser.roleTitle}) لا يمتلك صلاحية [${label}]. تم توثيق المحاولة في سجل التدقيق الأمني، ولا يمكن التنفيذ إلا بعد منحك الصلاحية من قبل مدير النظام.`,
      );
      return false;
    }
    return true;
  };

  // ---------- دالة مركزية موحّدة: تحقق الصلاحية + تنفيذ الإجراء + تسجيل تدقيقي، باستدعاء واحد ----------
  // (توصية القسم 9 من تقرير التدقيق: بدل تكرار "if (!checkPerm(...)) return; ... logAuditAction(...)"
  // يدوياً في عشرات الأماكن — وهو تحديداً سبب نسيان بعض الدوال للتسجيل التدقيقي كما وثّق القسم 3.1 —
  // أي ميزة جديدة تستدعي هذه الدالة فقط، فيستحيل عليها "تنسى" التحقق أو التسجيل لأنهما داخل نفس الاستدعاء.
  // الدوال القديمة تبقى كما هي بنمطها الحالي (checkPerm + logAuditAction منفصلين) حتى لا نغيّر سلوكها
  // بدون داعٍ — هذه الدالة للاستخدام التدريجي في أي تطوير أو تعديل مستقبلي بدل تكرار النمط القديم يدوياً.
  const guardedAction = (
    permKey: keyof RolePermissions,
    actionName: string,
    audit: {
      actionType?: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
      section: string;
      title: string;
      details: string;
      targetId?: string | number;
    },
    action: () => void,
  ): boolean => {
    if (
      !checkPerm(permKey, actionName, {
        section: audit.section,
        title: audit.title,
        details: audit.details,
        targetId: audit.targetId,
      })
    ) {
      return false;
    }
    action();
    logAuditAction(
      audit.actionType || "CREATE",
      audit.section,
      audit.title,
      audit.details,
      audit.targetId ?? "—",
    );
    return true;
  };

  // حالة نافذة التحقق الأمني وتأكيد الحذف قبل التنفيذ لجميع الأقسام
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  } | null>(null);

  // دالة طلب الحذف الآمنة المشروطة بالصلاحية والتنبيه المسبق مع التوثيق في سجل التدقيق
  const requestDelete = (opts: {
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  }) => {
    if (
      !checkPerm(opts.permKey, opts.actionName, {
        section: opts.section,
        title: opts.title,
        details: opts.details,
        targetId: opts.targetId,
        isDelete: true,
      })
    ) {
      return;
    }
    setDeleteModalState({
      isOpen: true,
      section: opts.section,
      title: opts.title,
      details: opts.details,
      targetId: opts.targetId,
      permKey: opts.permKey,
      actionName: opts.actionName,
      onConfirm: opts.onConfirm,
    });
  };
  const isDemoTask = (t: any): boolean => {
    if (!t || !t.title) return false;
    const lower = String(t.title).toLowerCase();
    const assignee = String(t.assignee || "").toLowerCase();
    return (
      lower.includes("إيداع مذكرة") ||
      lower.includes("سداد الرسوم") ||
      lower.includes("تجهيز أصل الوكالة") ||
      lower.includes("التواصل مع الموكل") ||
      lower.includes("إعداد مذكرة") ||
      lower.includes("ترجمة قانونية") ||
      lower.includes("متابعة ملف التنفيذ") ||
      lower.includes("تجديد اشتراك") ||
      lower.includes("تقرير الخبير") ||
      lower.includes("قيد لائحة الاستئناف") ||
      lower.includes("عقد المقاولة") ||
      lower.includes("البوابة الذكية") ||
      t.id === 1 ||
      t.id === 2 ||
      t.id === 3 ||
      t.id === 4
    );
  };

  const isDemoEmail = (e: any): boolean => {
    if (!e) return false;
    const subj = String(e.subject || "").toLowerCase();
    const sender = String(e.sender || "").toLowerCase();
    const sEmail = String(e.senderEmail || "").toLowerCase();
    const body = String(e.body || "").toLowerCase();
    return (
      subj.includes("إشعار قيد لائحة طعن") ||
      subj.includes("استفسار بشأن أوراق ملكية") ||
      subj.includes("طلب توثيق وكالة") ||
      subj.includes("عينة تجريبية") ||
      subj.includes("فحص آلي") ||
      subj.includes("نزاع إيجاري") ||
      sender.includes("محاكم دبي") ||
      sender.includes("فوزية") ||
      sender.includes("أمانة سر") ||
      sEmail === "notifications@dc.gov.ae" ||
      sEmail === "fowziya.almehairi@gmail.com" ||
      sEmail === "notary@moj.gov.ae" ||
      body.includes("458/2026 تجاري دبي") ||
      body.includes("فوزية المهيري") ||
      body.includes("دار سمرا للكمبيوتر") ||
      body.includes("INV-2026-TEST-VERIFIED") ||
      e.id === 1 ||
      e.id === 2 ||
      e.id === 3
    );
  };

  // isDemoCase/sanitizeCase/isDemoHearing/normalizeCaseNumberKey/deduplicateCases/deduplicateClients: انتقلت إلى ./domain/utils
  // clients/cases/feeAgreements/payments/invoices: انتقلت لهوكس مستقلة (useClientsData/useCasesData/
  // useFinancialCoreData) — كل واحدة الآن تُزامن مباشرة مع Supabase (كانت هذه المزامنة سابقاً جزءاً
  // من useEffect الضخم "remainingSyncTables" بالأسفل)، بنفس منطق التهيئة الأصلي حرفياً.
  const { clients, setClients } = useClientsData();
  const { cases, setCases } = useCasesData();
  const { feeAgreements, setFeeAgreements, payments, setPayments, invoices, setInvoices } =
    useFinancialCoreData();
  const [hearings, setHearings] = useState<Hearing[]>(() => {
    const saved = loadStorage<Hearing[]>("firm_hearings", []);
    const clean = (saved || []).filter((h) => !isDemoHearing(h));
    saveStorage("firm_hearings", clean);
    return clean;
  });
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = loadStorage<TaskItem[]>("firm_tasks", []);
      const clean = (saved || []).filter((t) => !isDemoTask(t));
      saveStorage("firm_tasks", clean);
      return clean;
    } catch {
      return [];
    }
  });
  const [docs, setDocs] = useState<DocItem[]>(() => loadStorage("firm_docs", seedDocs));
  const [poas, setPoas] = useState<PoaItem[]>(() => loadStorage("firm_poas", seedPoas));
  const {
    colleagues,
    setColleagues,
    colleagueDelegations,
    setColleagueDelegations,
    colleagueSubTab,
    setColleagueSubTab,
    editingColleagueId,
    setEditingColleagueId,
  } = useColleagues();
  // kyc: انتقلت لهوك useKycData (مزامنة Supabase — نفس الملاحظة أعلاه)
  const { kyc, setKyc } = useKycData();
  const { kycWatchlist, setKycWatchlist, kycWatchlistParsed, setKycWatchlistParsed } =
    useKycWatchlist();
  const { notifications, setNotifications } = useNotifications();
  const {
    timeLogs,
    setTimeLogs,
    caseExpenses,
    setCaseExpenses,
    trustTransactions,
    setTrustTransactions,
    trustReconciliations,
    setTrustReconciliations,
    installments,
    setInstallments,
    strReports,
    setStrReports,
  } = useBillingRecords();
  const { deadlines, setDeadlines } = useDeadlines();
  const [courtContacts, setCourtContacts] = useState<CourtContact[]>(() => {
    const version = loadStorage<string>("firm_court_contacts_ver", "");
    const saved = loadStorage<CourtContact[]>("firm_court_contacts", []);
    if (version !== "v4_shj_sharia" || !saved || saved.length === 0 || saved.length > 300) {
      // Retain custom contacts added by the user (IDs >= 10000 or custom)
      const userCustom = (saved || []).filter((c) => c && c.id >= 10000);
      const combined = [...seedCourtContacts, ...userCustom];
      saveStorage("firm_court_contacts", combined);
      saveStorage("firm_court_contacts_ver", "v4_shj_sharia");
      return combined;
    }
    return saved;
  });
  const [officeAgreements, setOfficeAgreements] = useState<OfficeAgreement[]>(() =>
    loadStorage("firm_office_agreements", []),
  );

  const {
    autoCheckStatus,
    setAutoCheckStatus,
    deadlineFilter,
    setDeadlineFilter,
    selectedDeadlineLogs,
    setSelectedDeadlineLogs,
    reassignDeadlineModal,
    setReassignDeadlineModal,
  } = useDeadlineUiState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ملاحظة: الحفظ المحلي + المزامنة مع Supabase لـ clients/cases/feeAgreements/payments/invoices
  // أصبحت الآن تتم تلقائياً داخل هوكسها الخاصة (useClientsData/useCasesData/useFinancialCoreData) —
  // لا حاجة لـ useEffect منفصل هنا بعد الآن.
  useEffect(() => {
    saveStorage("firm_hearings", hearings);
  }, [hearings]);
  useEffect(() => {
    saveStorage("firm_tasks", tasks);
  }, [tasks]);
  useEffect(() => {
    saveStorage("firm_users", users);
  }, [users]);
  useEffect(() => {
    saveStorage("firm_office_agreements", officeAgreements);
  }, [officeAgreements]);
  useEffect(() => {
    saveStorage("firm_docs", docs);
  }, [docs]);

  // جلسات الدخول المحفوظة مسبقاً (قبل هذا التحديث) لا تملك جلسة Supabase Authentication فعلية
  // لأنها أُنشئت عبر تسجيل الدخول المحلي القديم فقط — نصلح هذا تلقائياً عند فتح النظام
  // حتى لا تفشل عمليات الحفظ بصمت بعد تقييد سياسات RLS على "authenticated" فقط.
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.email) return;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) return; // لديه جلسة فعلية بالفعل
        const email = currentUser.email.toLowerCase();
        const rawPass = (currentUser as any).password;
        if (!rawPass) return; // لا يوجد كلمة مرور محفوظة — لا نُنشئ/نستخدم قيمة افتراضية عالمية (ثغرة أمنية سابقة)
        if (isHashedPassword(rawPass)) return; // القيمة مُجزّأة (pbkdf2) ولا يمكن استخدامها كنص عادي هنا؛ المزامنة تتم فعلياً عند تسجيل الدخول نفسه
        const pass = rawPass.length >= 6 ? rawPass : `${rawPass}-firm2024`;
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (signInErr) {
          await supabase.auth.signUp({ email, password: pass });
        }
      } catch (e) {
        console.warn("Startup silent Supabase Auth sync note:", e);
      }
    })();
    // مرة واحدة فقط عند تسجيل الدخول/فتح النظام لهذا المستخدم
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, currentUser?.id]);

  // ================= مزامنة البيانات الحساسة مع Supabase =================
  // كانت هذه الكتلة تجمع مزامنة 8 جداول (clients/cases/feeAgreements/payments/invoices/
  // auditLogs/kyc/kycWatchlist) في useEffect ضخم واحد مشترك (remainingSyncTables). كل جدول من
  // هذه الثمانية أصبح الآن يزامن نفسه مباشرة داخل هوكه الخاص (useClientsData/useCasesData/
  // useFinancialCoreData/useAuditLogsData/useKycData/useKycWatchlist) بنفس منطق الجلب/الرفع
  // المؤجل (1.5 ثانية) حرفياً — بدون أي تغيير بالسلوك النهائي.
  // دالة تلقائية لدمج وتنظيف الموكلين المكررين
  useEffect(() => {
    const seenMap = new Map<string, number>();
    const remap = new Map<number, number>();
    const dupes = new Set<number>();

    clients.forEach((c) => {
      const norm = normalizeArabicName(c.name);
      const mainPart = norm.split("-")[0].trim();
      const words = mainPart.split(" ").filter((w) => w.length > 1);
      const key = words.length >= 2 ? words.slice(0, 2).join(" ") : mainPart;

      if (key && seenMap.has(key)) {
        const primaryId = seenMap.get(key)!;
        dupes.add(c.id);
        remap.set(c.id, primaryId);
      } else if (key) {
        seenMap.set(key, c.id);
      }
    });

    if (
      // eslint-disable-next-line no-constant-binary-expression -- تعطيل مقصود ومؤقت، انظر التعليق أدناه
      false /* تم تعطيل الدمج التلقائي الصامت للموكلين بعد المراجعة الامنية - اي دمج يتطلب الان تاكيدا صريحا من المستخدم */ &&
      dupes.size > 0
    ) {
      setPoas((prev) =>
        prev.map((p) => (remap.has(p.clientId) ? { ...p, clientId: remap.get(p.clientId)! } : p)),
      );
      setCases((prev) =>
        prev.map((cs) =>
          remap.has(cs.clientId) ? { ...cs, clientId: remap.get(cs.clientId)! } : cs,
        ),
      );
      setInvoices((prev) =>
        prev.map((inv) =>
          remap.has(inv.clientId) ? { ...inv, clientId: remap.get(inv.clientId)! } : inv,
        ),
      );
      setFeeAgreements((prev) =>
        prev.map((fa) =>
          remap.has(fa.clientId) ? { ...fa, clientId: remap.get(fa.clientId)! } : fa,
        ),
      );
      setClients((prev) => prev.filter((c) => !dupes.has(c.id)));
    }
  }, []);
  useEffect(() => {
    saveStorage("firm_poas", poas);
  }, [poas]);
  // kyc: الحفظ + المزامنة أصبحت داخل useKycData
  useEffect(() => {
    saveStorage("firm_court_contacts", courtContacts);
  }, [courtContacts]);

  // ---------- حالات ميزات الاستيراد الذكي واستخراج البيانات ----------
  const {
    showCasesExcelModal,
    setShowCasesExcelModal,
    excelCasesParsed,
    setExcelCasesParsed,
    casesExcelLoading,
    setCasesExcelLoading,
  } = useCasesExcelImport();

  const {
    showPoaAiUploadModal,
    setShowPoaAiUploadModal,
    poaAiLoading,
    setPoaAiLoading,
    poaAiExtracted,
    setPoaAiExtracted,
    selectedPoaClientId,
    setSelectedPoaClientId,
    showAgreementAiUploadModal,
    setShowAgreementAiUploadModal,
    agreementAiLoading,
    setAgreementAiLoading,
    agreementAiExtracted,
    setAgreementAiExtracted,
    selectedAgrClientId,
    setSelectedAgrClientId,
    showInvoiceImportModal,
    setShowInvoiceImportModal,
    invoiceImportTab,
    setInvoiceImportTab,
    invoiceAiLoading,
    setInvoiceAiLoading,
    invoiceAiExtracted,
    setInvoiceAiExtracted,
    excelInvoicesParsed,
    setExcelInvoicesParsed,
  } = useAiDocExtraction();

  const {
    showKycWatchlistUploadModal,
    setShowKycWatchlistUploadModal,
    kycWatchlistSearch,
    setKycWatchlistSearch,
    kycTypeFilter,
    setKycTypeFilter,
    kycSanctionAlert,
    setKycSanctionAlert,
    kycSanctionAckReason,
    setKycSanctionAckReason,
  } = useKycWatchlistModal();

  const filteredKycWatchlist = useMemo(() => {
    return kycWatchlist.filter((item) => {
      if (kycTypeFilter !== "الكل" && item.type !== kycTypeFilter) return false;
      if (!kycWatchlistSearch.trim()) return true;
      const q = kycWatchlistSearch.toLowerCase();
      return (
        (item.fullName && item.fullName.toLowerCase().includes(q)) ||
        (item.idNo && item.idNo.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.nationality && item.nationality.toLowerCase().includes(q))
      );
    });
  }, [kycWatchlist, kycTypeFilter, kycWatchlistSearch]);

  // ---------- Google Calendar Integration State ----------
  const {
    showGoogleCalendarModal,
    setShowGoogleCalendarModal,
    googleUser,
    setGoogleUser,
    googleToken,
    setGoogleToken,
  } = useGoogleCalendarModal();

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      },
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSingleHearingGoogleSync = async (hearing: Hearing) => {
    if (!googleToken) {
      setShowGoogleCalendarModal(true);
      return;
    }
    const cs = cases.find((c) => c.id === hearing.caseId);
    const cl = cs ? clientName(cs.clientId) : "غير محدد";
    const confirmed = window.confirm(
      `هل ترغب في تصدير ومزامنة جلسة القضية (${cs ? cs.number : hearing.id}) إلى تقويم Google الخاص بك (${googleUser?.email})؟`,
    );
    if (!confirmed) return;

    try {
      const { startDateTime, endDateTime } = formatCalendarDateTime(hearing.date, hearing.time);
      const descriptionText = [
        `🏛️ جلسة قضائية مجدولة`,
        `--------------------------------`,
        `• رقم القضية: ${cs ? cs.number : "—"}`,
        `• المحكمة: ${cs ? cs.court : "—"}`,
        `• الدائرة / القاضي: ${cs?.judge || "—"}`,
        `• الموكل: ${cl}`,
        `• نوع الجلسة: ${hearing.type}`,
        `• القاعة والوقت: ${hearing.room} (${hearing.time})`,
        hearing.notes ? `• المطلوب في الجلسة: ${hearing.notes}` : "",
        `--------------------------------`,
        `تمت المزامنة آلياً عبر نظام إدارة مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية.`,
      ]
        .filter(Boolean)
        .join("\n");

      const payload = {
        summary: `⚖️ جلسة: ${cs ? cs.number : "قضية"} - ${hearing.type}`,
        description: descriptionText,
        location: hearing.room || cs?.court || "المحكمة",
        start: { dateTime: startDateTime, timeZone: "Asia/Dubai" },
        end: { dateTime: endDateTime, timeZone: "Asia/Dubai" },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup" as const, minutes: 1440 },
            { method: "popup" as const, minutes: 120 },
          ],
        },
        colorId: "11",
      };

      const createdEvent = await createGoogleCalendarEvent(googleToken, payload);
      setHearings((prev) =>
        prev.map((h) =>
          h.id === hearing.id
            ? {
                ...h,
                googleCalendarEventId: createdEvent.id,
                googleSyncedAt: new Date().toISOString(),
              }
            : h,
        ),
      );
      alert(`✅ تم تصدير الجلسة بنجاح إلى تقويم Google!`);
    } catch (err: any) {
      alert(`حدث خطأ أثناء المزامنة: ${err.message}`);
    }
  };

  const {
    employees,
    setEmployees,
    leaveRequests,
    setLeaveRequests,
    employeeExpenses,
    setEmployeeExpenses,
    hrSubTab,
    setHrSubTab,
    employeeSearchQuery,
    setEmployeeSearchQuery,
  } = useHrRecords();
  const { disciplinaryActions, setDisciplinaryActions } = useDisciplinaryActions();

  // ---------- سجل التدقيق والأنشطة (Audit Log Filters & Access) ----------
  const {
    auditSearchTerm,
    setAuditSearchTerm,
    auditActionFilter,
    setAuditActionFilter,
    auditModuleFilter,
    setAuditModuleFilter,
  } = useAuditFilters();

  const canViewAuditLog = useMemo(() => {
    const activeUser = users.find((u) => u.id === currentUserId);
    if (!activeUser) return false;
    if (activeUser.roleKey === "admin" || (activeUser as any).role === "admin") return true;
    if (activeUser.permissions?.manageUsers || activeUser.permissions?.auditLog) return true;
    return false;
  }, [users, currentUserId]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesAction = auditActionFilter === "الكل" || log.actionType === auditActionFilter;
      const matchesModule = auditModuleFilter === "الكل" || log.targetModule === auditModuleFilter;
      const q = auditSearchTerm.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (log.userName && log.userName.toLowerCase().includes(q)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.userRole && log.userRole.toLowerCase().includes(q)) ||
        (String(log.userId) && String(log.userId).toLowerCase().includes(q)) ||
        (log.targetTitle && log.targetTitle.toLowerCase().includes(q)) ||
        (log.targetModule && log.targetModule.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.status && log.status.toLowerCase().includes(q)) ||
        (log.formattedTimestamp && log.formattedTimestamp.toLowerCase().includes(q)) ||
        (log.targetId && String(log.targetId).toLowerCase().includes(q));
      return matchesAction && matchesModule && matchesQuery;
    });
  }, [auditLogs, auditActionFilter, auditModuleFilter, auditSearchTerm]);

  // قائمة "الأقسام" لفلتر سجل التدقيق تُبنى ديناميكياً من قيم targetModule الفعلية المسجّلة بالسجل،
  // بدل قائمة ثابتة يدوية كانت لا تطابق نصياً القيم الحقيقية التي تُسجَّل بها الأنشطة (مثال: "سجل الموكلين" في القائمة
  // مقابل "الموكلين" في السجل الفعلي) — ما كان يجعل اختيار أغلب الأقسام من الفلتر يُظهر نتائج فارغة رغم وجود أنشطة فعلية
  const auditModuleOptions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((a) => a.targetModule)))
      .filter((m): m is string => Boolean(m))
      .sort((a, b) => a.localeCompare(b, "ar"));
  }, [auditLogs]);

  // تبويبات تصنيف قوائم حظر KYC تُبنى ديناميكياً من القيم الفعلية الموجودة بالقائمة، بدل ثلاث قيم ثابتة
  // فقط كانت لا تغطي القيمة الافتراضية عند استيراد إكسل بدون عمود تصنيف مطابق ("شخص منكشف سياسياً (PEP)")
  // ما كان يجعل هذه السجلات غير قابلة للوصول عبر أي تبويب تصنيف عدا "الكل"
  const KYC_TYPE_LABELS: Record<string, string> = {
    "شخص إرهابي": "أفراد إرهابيون",
    "كيان إرهابي": "كيانات إرهابية",
    "تنظيم إرهابي": "تنظيمات إرهابية",
  };
  const kycTypeOptions = useMemo(() => {
    const distinctTypes = Array.from(new Set(kycWatchlist.map((i) => i.type)))
      .filter((t): t is string => Boolean(t))
      .sort((a, b) => a.localeCompare(b, "ar"));
    return [
      { label: "الكل", val: "الكل" },
      ...distinctTypes.map((t) => ({ label: KYC_TYPE_LABELS[t] || t, val: t })),
    ];
  }, [kycWatchlist]);

  // ---------- المبادئ والأحكام القضائية (Legal Precedents) ----------
  const {
    precedents,
    setPrecedents,
    precedentSearch,
    setPrecedentSearch,
    precedentCourtFilter,
    setPrecedentCourtFilter,
    precedentCategoryFilter,
    setPrecedentCategoryFilter,
    precedentYearFilter,
    setPrecedentYearFilter,
    showAddPrecedentModal,
    setShowAddPrecedentModal,
    selectedPrecedent,
    setSelectedPrecedent,
  } = usePrecedents();

  // ---------- السياسات الداخلية للمكتب ----------
  const {
    policies,
    setPolicies,
    policySearch,
    setPolicySearch,
    policyCategoryFilter,
    setPolicyCategoryFilter,
    showPolicyModal,
    setShowPolicyModal,
    editingPolicy,
    setEditingPolicy,
    selectedPolicy,
    setSelectedPolicy,
    filteredPolicies,
    policyForm,
    setPolicyForm,
  } = usePolicies();

  // ================= مزامنة باقي الأقسام (مستندات/وكالات/زملاء/جلسات/مهام/جهات اتصال المحكمة/
  // اتفاقيات المكتب/السياسات/الإجراءات التأديبية/مواعيد الأحكام/الاستشارات) مع Supabase =================
  // كانت هذه الأقسام محفوظة محلياً فقط في متصفح كل موظف — لا تنتقل بين الأجهزة ولا تظهر لبقية
  // الموظفين. نفس نمط المزامنة المستخدم للقضايا/الموكلين أعلاه، مطبّق هنا بشكل عام لتقليل التكرار.
  // ملاحظة: هذا الكتلة موضوعة عمداً بعد كل الـ useState المستخدمة بداخلها (docs, poas, colleagues,
  // hearings, tasks, courtContacts, officeAgreements, disciplinaryActions, policies, deadlines,
  // consultationBookings) تفادياً لخطأ "Cannot access before initialization".
  const remainingSyncTables: Array<{ table: string; get: () => any[]; set: (v: any[]) => void }> = [
    { table: "docs", get: () => docs, set: (v) => setDocs(v as DocItem[]) },
    { table: "poas", get: () => poas, set: (v) => setPoas(v as PoaItem[]) },
    { table: "colleagues", get: () => colleagues, set: (v) => setColleagues(v as Colleague[]) },
    {
      table: "colleague_delegations",
      get: () => colleagueDelegations,
      set: (v) => setColleagueDelegations(v as ColleagueDelegation[]),
    },
    {
      table: "office_agreements",
      get: () => officeAgreements,
      set: (v) => setOfficeAgreements(v as OfficeAgreement[]),
    },
    { table: "hearings", get: () => hearings, set: (v) => setHearings(v as Hearing[]) },
    { table: "tasks", get: () => tasks, set: (v) => setTasks(v as TaskItem[]) },
    {
      table: "court_contacts",
      get: () => courtContacts,
      set: (v) => setCourtContacts(v as CourtContact[]),
    },
    {
      table: "internal_policies",
      get: () => policies,
      set: (v) => setPolicies(v as InternalPolicy[]),
    },
    {
      table: "disciplinary_actions",
      get: () => disciplinaryActions,
      set: (v) => setDisciplinaryActions(v as EmployeeDisciplinaryAction[]),
    },
    {
      table: "judgment_deadlines",
      get: () => deadlines,
      set: (v) => setDeadlines(v as JudgmentDeadline[]),
    },
    {
      table: "consultation_bookings",
      get: () => consultationBookings,
      set: (v) => setConsultationBookings(v as BookingRecord[]),
    },
  ];
  const remainingSyncHydratedRef = React.useRef(false);
  // تتبّع معرّفات كل جدول لاستنتاج الحذف الصريح فقط (نفس أسلوب useSyncedTable — تصحيح Phase-1
  // لمشكلة تسابق المزامنة: لا نحذف بناءً على "غير موجود بالقائمة المحلية" بل فقط ما اختفى فعلاً
  // من القيمة المحلية بين تحديث وآخر).
  const remainingPrevIdsRef = React.useRef<Map<string, Set<string | number>>>(new Map());
  const pushRemainingTable = React.useCallback(
    (table: string, rows: Array<{ id: string | number }>) => {
      const currentIds = new Set(rows.map((r) => r.id));
      const prevIds = remainingPrevIdsRef.current.get(table);
      const explicitDeleteIds = prevIds
        ? Array.from(prevIds).filter((id) => !currentIds.has(id))
        : [];
      remainingPrevIdsRef.current.set(table, currentIds);
      pushSupabaseTable(table, rows, explicitDeleteIds);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const entry of remainingSyncTables) {
        const remote = await fetchSupabaseTable<any>(entry.table);
        if (cancelled) return;
        if (remote && remote.length > 0) {
          entry.set(remote);
          remainingPrevIdsRef.current.set(entry.table, new Set(remote.map((r: any) => r.id)));
        } else if (remote !== null && entry.get().length > 0) {
          pushSupabaseTable(entry.table, entry.get());
          remainingPrevIdsRef.current.set(entry.table, new Set(entry.get().map((r: any) => r.id)));
        }
      }
      // إعدادات الاستشارات صف واحد فقط (ليست مصفوفة) — نتعامل معها بشكل منفصل
      const remoteSettings = await fetchSupabaseTable<{ id: string; value: ConsultationSettings }>(
        "consultation_settings",
      );
      if (!cancelled) {
        if (remoteSettings && remoteSettings.length > 0 && (remoteSettings[0] as any).value) {
          setConsultationSettings((remoteSettings[0] as any).value);
        } else if (remoteSettings !== null) {
          supabase
            .from("consultation_settings")
            .upsert([{ id: "settings", data: { id: "settings", value: consultationSettings } }], {
              onConflict: "id",
            });
        }
      }
      remainingSyncHydratedRef.current = true;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("docs", docs), 1500);
      return () => clearTimeout(t);
    }
  }, [docs]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("poas", poas), 1500);
      return () => clearTimeout(t);
    }
  }, [poas]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("colleagues", colleagues), 1500);
      return () => clearTimeout(t);
    }
  }, [colleagues]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(
        () => pushRemainingTable("colleague_delegations", colleagueDelegations),
        1500,
      );
      return () => clearTimeout(t);
    }
  }, [colleagueDelegations]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("office_agreements", officeAgreements), 1500);
      return () => clearTimeout(t);
    }
  }, [officeAgreements]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("hearings", hearings), 1500);
      return () => clearTimeout(t);
    }
  }, [hearings]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("tasks", tasks), 1500);
      return () => clearTimeout(t);
    }
  }, [tasks]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("court_contacts", courtContacts), 1500);
      return () => clearTimeout(t);
    }
  }, [courtContacts]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("internal_policies", policies), 1500);
      return () => clearTimeout(t);
    }
  }, [policies]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(
        () => pushRemainingTable("disciplinary_actions", disciplinaryActions),
        1500,
      );
      return () => clearTimeout(t);
    }
  }, [disciplinaryActions]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(() => pushRemainingTable("judgment_deadlines", deadlines), 1500);
      return () => clearTimeout(t);
    }
  }, [deadlines]);
  useEffect(() => {
    if (remainingSyncHydratedRef.current) {
      const t = setTimeout(
        () => pushRemainingTable("consultation_bookings", consultationBookings),
        1500,
      );
      return () => clearTimeout(t);
    }
  }, [consultationBookings]);
  useEffect(() => {
    if (!remainingSyncHydratedRef.current) return;
    const t = setTimeout(() => {
      supabase
        .from("consultation_settings")
        .upsert([{ id: "settings", data: { id: "settings", value: consultationSettings } }], {
          onConflict: "id",
        });
    }, 1500);
    return () => clearTimeout(t);
  }, [consultationSettings]);

  const handleSavePolicy = (data: {
    title: string;
    category: string;
    content: string;
    effectiveDate?: string;
  }) => {
    if (!isSuperAdmin) return;
    const now = todayISO();
    if (editingPolicy) {
      const updated: InternalPolicy = {
        ...editingPolicy,
        ...data,
        updatedAt: now,
        updatedBy: currentUser?.name,
      };
      setPolicies((prev) => prev.map((p) => (p.id === editingPolicy.id ? updated : p)));
      logAuditAction(
        "UPDATE",
        "السياسات الداخلية",
        data.title,
        "تعديل نص أو بيانات سياسة داخلية معتمدة",
        editingPolicy.id,
      );
    } else {
      const newPolicy: InternalPolicy = {
        id: nextId(policies),
        ...data,
        updatedAt: now,
        updatedBy: currentUser?.name,
      };
      setPolicies((prev) => [newPolicy, ...prev]);
      logAuditAction(
        "CREATE",
        "السياسات الداخلية",
        data.title,
        "إضافة سياسة داخلية جديدة معتمدة من المكتب",
        newPolicy.id,
      );
    }
    setShowPolicyModal(false);
    setEditingPolicy(null);
  };

  const handleDeletePolicy = (policy: InternalPolicy) => {
    if (!isSuperAdmin) return;
    requestDelete({
      section: "السياسات الداخلية",
      title: `سياسة: ${policy.title}`,
      details: `التصنيف: ${policy.category}`,
      targetId: policy.id,
      permKey: "policies",
      actionName: "حذف سياسة داخلية",
      onConfirm: () => {
        setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
        logAuditAction(
          "DELETE",
          "السياسات الداخلية",
          policy.title,
          "حذف سياسة داخلية نهائياً من الأرشيف",
          policy.id,
          "مؤكد",
        );
        if (selectedPolicy?.id === policy.id) setSelectedPolicy(null);
      },
    });
  };

  const openAddPolicy = () => {
    if (!isSuperAdmin) return;
    setEditingPolicy(null);
    setPolicyForm({
      title: "",
      category: POLICY_CATEGORIES[0],
      content: "",
      effectiveDate: todayISO(),
    });
    setShowPolicyModal(true);
  };

  const openEditPolicy = (policy: InternalPolicy) => {
    if (!isSuperAdmin) return;
    setEditingPolicy(policy);
    setPolicyForm({
      title: policy.title,
      category: policy.category,
      content: policy.content,
      effectiveDate: policy.effectiveDate || todayISO(),
    });
    setShowPolicyModal(true);
  };

  const handlePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSavePolicy(policyForm);
  };

  // تنظيف تلقائي فوري لأي بيانات تجريبية سابقة قديمة مخزنة في متصفح المستخدم
  useEffect(() => {
    try {
      const PURGE_KEY = "firm_purged_all_demo_data_v2";
      if (!localStorage.getItem(PURGE_KEY)) {
        const keysToRemove = [
          "firm_employees",
          "firm_legal_precedents",
          "firm_docs",
          "firm_poas",
          "firm_kyc",
          "firm_cases",
          "firm_hearings",
          "firm_tasks",
          "firm_invoices",
          "firm_audit_logs",
          "firm_leave_requests",
          "firm_employee_expenses",
          "firm_fee_agreements",
          "firm_payments",
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(PURGE_KEY, "true");

        setEmployees([]);
        setPrecedents([]);
        setDocs([]);
        setPoas([]);
        setKyc([]);
        setCases([]);
        setHearings([]);
        setTasks([]);
        setInvoices([]);
        setAuditLogs([]);
        setLeaveRequests([]);
        setEmployeeExpenses([]);
        setFeeAgreements([]);
        setPayments([]);
      }
    } catch (e) {
      console.warn("Auto purge error:", e);
    }
  }, []);

  // حفظ قائمة الموكلين وإدارة التعديلات والتحديثات من الذاكرة المحلية (localStorage)

  // Fetch precedents from Supabase table if available
  useEffect(() => {
    async function fetchSupabasePrecedents() {
      try {
        const { data, error } = await supabase
          .from("legal_precedents")
          .select("*")
          .order("ruling_year", { ascending: false });
        if (!error && data && data.length > 0) {
          setPrecedents((prev) => {
            const map = new Map<string, LegalPrecedent>();
            prev.forEach((p) => map.set(String(p.id), p));
            data.forEach((p: any) => {
              map.set(String(p.id), {
                id: p.id,
                title: p.title || p.title_ar || "مبدأ قضائي",
                court_name: p.court_name || p.court || "المحكمة الاتحادية العليا",
                ruling_year: p.ruling_year || p.year || 2024,
                category: p.category || "تجاري",
                circuit_name: p.circuit_name || p.circuit || "",
                appeal_number: p.appeal_number || p.case_number || "غير محدد",
                summary_text: p.summary_text || p.summary || p.principle || "",
                pdf_file_url: p.pdf_file_url || p.pdf_url || undefined,
                word_file_url: p.word_file_url || p.word_url || undefined,
                created_at: p.created_at || new Date().toISOString(),
              });
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Supabase legal_precedents fetch note:", err);
      }
    }
    fetchSupabasePrecedents();
  }, []);

  // Form State for Add Precedent
  const {
    precedentLoading,
    setPrecedentLoading,
    precedentForm,
    setPrecedentForm,
    precedentPdfFile,
    setPrecedentPdfFile,
    precedentWordFile,
    setPrecedentWordFile,
  } = usePrecedentForm();

  // Helper to upload files to Supabase Storage or fallback to ObjectURL
  const uploadPrecedentFile = async (file: File | null, folder: string): Promise<string | null> => {
    if (!file) return null;
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("precedents-documents")
        .upload(fileName, file);

      if (error) {
        console.warn("Supabase storage bucket note:", error);
        return URL.createObjectURL(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from("precedents-documents")
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || URL.createObjectURL(file);
    } catch (err) {
      console.warn("Storage upload fallback:", err);
      return URL.createObjectURL(file);
    }
  };

  const handlePrecedentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPerm("managePrecedents", "إضافة مبدأ قضائي")) return;
    if (!precedentForm.title.trim() || !precedentForm.summary_text.trim()) {
      alert("يرجى إدخال عنوان المبدأ ونص القاعدة القانونية");
      return;
    }
    setPrecedentLoading(true);

    try {
      const pdfUrl = await uploadPrecedentFile(precedentPdfFile, "pdf_files");
      const wordUrl = await uploadPrecedentFile(precedentWordFile, "word_files");

      const newPrecedent: LegalPrecedent = {
        id: "prec-" + Date.now(),
        title: precedentForm.title.trim(),
        court_name: precedentForm.court_name,
        ruling_year: Number(precedentForm.ruling_year) || new Date().getFullYear(),
        category: precedentForm.category,
        circuit_name: precedentForm.circuit_name.trim(),
        appeal_number: precedentForm.appeal_number.trim() || "غير محدد",
        summary_text: precedentForm.summary_text.trim(),
        pdf_file_url: pdfUrl || undefined,
        word_file_url: wordUrl || undefined,
        created_at: new Date().toISOString(),
      };

      // Attempt Supabase DB Insert
      try {
        await supabase.from("legal_precedents").insert([
          {
            title: newPrecedent.title,
            court_name: newPrecedent.court_name,
            ruling_year: newPrecedent.ruling_year,
            category: newPrecedent.category,
            circuit_name: newPrecedent.circuit_name,
            appeal_number: newPrecedent.appeal_number,
            summary_text: newPrecedent.summary_text,
            pdf_file_url: pdfUrl,
            word_file_url: wordUrl,
          },
        ]);
      } catch (e) {
        console.warn("Supabase legal_precedents insert note:", e);
      }

      setPrecedents((prev) => [newPrecedent, ...prev]);

      logAuditAction(
        "CREATE",
        "المبادئ والأحكام القضائية",
        `مبدأ: ${newPrecedent.title}`,
        `إضافة مبدأ قضائي جديد (${newPrecedent.court_name} - ${newPrecedent.category}) برقم طعن ${newPrecedent.appeal_number}`,
        newPrecedent.id,
      );

      alert("تم حفظ المبدأ القضائي بنجاح!");
      setShowAddPrecedentModal(false);
      setPrecedentForm({
        title: "",
        court_name: "المحكمة الاتحادية العليا",
        ruling_year: new Date().getFullYear(),
        category: "تجاري",
        circuit_name: "الدائرة التجارية",
        appeal_number: "",
        summary_text: "",
      });
      setPrecedentPdfFile(null);
      setPrecedentWordFile(null);
    } catch (err: any) {
      alert("حدث خطأ أثناء الحفظ: " + (err?.message || err));
    } finally {
      setPrecedentLoading(false);
    }
  };

  const deletePrecedent = async (precId: string | number) => {
    const target = precedents.find((p) => p.id === precId);
    if (!target) return;
    requestDelete({
      section: "المبادئ والأحكام القضائية",
      title: `المبدأ: ${target.title}`,
      details: `المحكمة: ${target.court_name} | الدائرة: ${target.circuit_name || "—"} | سنة الحكم: ${target.ruling_year} | الطعن: ${target.appeal_number}`,
      permKey: "deletePrecedents",
      actionName: "حذف المبدأ القضائي",
      onConfirm: async () => {
        setPrecedents((prev) => prev.filter((p) => p.id !== precId));
        logAuditAction(
          "DELETE",
          "المبادئ والأحكام القضائية",
          `مبدأ: ${target.title}`,
          `حذف المبدأ القضائي (${target.court_name} - ${target.appeal_number}) نهائياً`,
          target.id,
        );
        try {
          await supabase.from("legal_precedents").delete().eq("id", precId);
        } catch (e) {
          console.warn("Supabase delete precedent note:", e);
        }
      },
    });
  };

  const filteredPrecedents = useMemo(() => {
    return precedents.filter((p) => {
      const matchesCourt = precedentCourtFilter === "الكل" || p.court_name === precedentCourtFilter;
      const matchesCategory =
        precedentCategoryFilter === "الكل" || p.category === precedentCategoryFilter;
      const matchesYear =
        precedentYearFilter === "الكل" || String(p.ruling_year) === precedentYearFilter;
      const q = precedentSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.summary_text && p.summary_text.toLowerCase().includes(q)) ||
        (p.appeal_number && p.appeal_number.toLowerCase().includes(q)) ||
        (p.circuit_name && p.circuit_name.toLowerCase().includes(q));
      return matchesCourt && matchesCategory && matchesYear && matchesQuery;
    });
  }, [
    precedents,
    precedentCourtFilter,
    precedentCategoryFilter,
    precedentYearFilter,
    precedentSearch,
  ]);
  const {
    agrPreviewId,
    setAgrPreviewId,
    delegationPreviewId,
    setDelegationPreviewId,
    deleteAgrConfirm,
    setDeleteAgrConfirm,
    editingDelegationWording,
    setEditingDelegationWording,
    delegationDraftHtml,
    setDelegationDraftHtml,
    delegationBodyRef,
    editingAgreementClauses,
    setEditingAgreementClauses,
    agreementClausesDraft,
    setAgreementClausesDraft,
    agrForm,
    setAgrForm,
    emptyAgrForm,
  } = useAgreementDraftState();

  const setAgr = (k: string, v: any) => setAgrForm((prev: any) => ({ ...prev, [k]: v }));
  const setAgrInst = (idx: number, k: string, v: any) =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: prev.installments.map((it: any, i: number) =>
        i === idx ? { ...it, [k]: v } : it,
      ),
    }));
  const addAgrInst = () =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: [
        ...prev.installments,
        { amount: "", dueDate: todayISO(), paidOnSigning: false },
      ],
    }));
  const removeAgrInst = (idx: number) =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: prev.installments.filter((_: any, i: number) => i !== idx),
    }));

  const agrTotal = (agrForm.installments || []).reduce(
    (s: number, i: any) => s + (+i.amount || 0),
    0,
  );

  // توليد نص "قيمة العقد وطريقة السداد" تلقائياً حسب الدفعات المدخلة
  const buildPaymentTerms = (insts: OfficeAgreementInstallment[], total: number) => {
    if (insts.length === 1 && insts[0].paidOnSigning) {
      return {
        ar: `قيمة العقد ${total.toLocaleString("ar-AE")} درهم تُدفع عند توقيع العقد.`,
        en: `The contract value is AED ${total.toLocaleString("en-US")} payable upon signing of the contract.`,
      };
    }
    const arParts = insts
      .map(
        (i, idx) =>
          `الدفعة ${idx + 1}: ${i.amount.toLocaleString("ar-AE")} درهم بتاريخ ${fmtDate(i.dueDate)}${i.paidOnSigning ? " (عند التوقيع)" : ""}`,
      )
      .join("، ");
    const enParts = insts
      .map(
        (i, idx) =>
          `Installment ${idx + 1}: AED ${i.amount.toLocaleString("en-US")} due on ${i.dueDate}${i.paidOnSigning ? " (upon signing)" : ""}`,
      )
      .join(", ");
    return {
      ar: `قيمة العقد ${total.toLocaleString("ar-AE")} درهم تُدفع على ${insts.length} دفعات كالتالي: ${arParts}.`,
      en: `The contract value is AED ${total.toLocaleString("en-US")} payable in ${insts.length} installments as follows: ${enParts}.`,
    };
  };

  // ─── الحفظ: إنشاء الموكل + اتفاقية الأتعاب + الدفعات + سندات القبض تلقائياً ───
  const saveOfficeAgreement = () => {
    if (!checkPerm("manageInvoices", "إنشاء اتفاقية أتعاب")) return;

    const isExisting = agrForm.clientMode === "existing";
    if (isExisting && !agrForm.existingClientId) {
      alert("يرجى اختيار الموكل من القائمة");
      return;
    }
    if (!isExisting && !agrForm.clientNameAr) {
      alert("يرجى إدخال اسم الموكل بالعربية");
      return;
    }
    if (!agrForm.caseDetailsAr) {
      alert("يرجى إدخال تفاصيل القضية بالعربية");
      return;
    }
    const insts: OfficeAgreementInstallment[] = (agrForm.installments || [])
      .filter((i: any) => +i.amount > 0)
      .map((i: any) => ({
        amount: +i.amount,
        dueDate: i.dueDate || todayISO(),
        paidOnSigning: !!i.paidOnSigning,
      }));
    if (insts.length === 0) {
      alert("يرجى إدخال دفعة واحدة على الأقل بمبلغ صحيح");
      return;
    }
    const total = insts.reduce((s, i) => s + i.amount, 0);

    // (1) الموكل — يُضاف تلقائياً لقائمة الموكلين إن كان جديداً
    let clientId: number;
    let clientNameArFinal = agrForm.clientNameAr;
    if (isExisting) {
      clientId = +agrForm.existingClientId;
      const c = clients.find((x) => x.id === clientId);
      clientNameArFinal = c ? c.name : agrForm.clientNameAr;
    } else {
      clientId = nextId(clients);
      auditNewClientKyc(agrForm.clientNameAr, agrForm.idNo, clientId);
      setClients((prev) => [
        ...prev,
        {
          id: clientId,
          name: agrForm.clientNameAr,
          type: agrForm.clientType || "شركة",
          idNo: agrForm.idNo || "",
          phone: agrForm.phone || "",
          email: agrForm.email || "",
          emirate: agrForm.emirate || "الشارقة",
          address: agrForm.address || "",
        },
      ]);
    }

    // (2) اتفاقية الأتعاب + جدول الدفعات — تنزل تلقائياً في تبويب "اتفاقيات الأتعاب"
    const feeAgrId = nextId(feeAgreements);
    const agreementNumber = `AGR-${new Date().getFullYear()}-${String(feeAgrId + 100).padStart(3, "0")}`;
    let maxInstId = feeAgreements
      .flatMap((a) => a.installments || [])
      .reduce((m, i) => Math.max(m, i.id), 0);
    const feeInstallments: FeeAgreementInstallment[] = insts.map((i, idx) => ({
      id: ++maxInstId,
      feeAgreementId: feeAgrId,
      installmentNo: idx + 1,
      amount: i.amount,
      dueDate: i.dueDate,
      status: i.paidOnSigning ? "مدفوع" : "مستحق",
    }));
    const allPaid = insts.every((i) => i.paidOnSigning);
    const newFeeAgreement: FeeAgreement = {
      id: feeAgrId,
      clientId,
      caseId: null,
      agreementNumber,
      title: `اتفاقية أتعاب محاماة — ${agrForm.caseDetailsAr.slice(0, 60)}`,
      totalAmount: total,
      date: agrForm.contractDate,
      status: allPaid ? "مسددة بالكامل" : "نشطة",
      installments: feeInstallments,
      notes: `أُنشئت تلقائياً من نموذج اتفاقية المكتب المعتمدة بتاريخ ${fmtDate(todayISO())}`,
    };
    setFeeAgreements((prev) => [...prev, newFeeAgreement]);
    logAuditAction(
      "CREATE",
      "اتفاقيات الأتعاب",
      `اتفاقية: ${agreementNumber}`,
      `إنشاء اتفاقية أتعاب جديدة ${agreementNumber} للموكل ${clientNameArFinal} بإجمالي ${total}`,
      feeAgrId,
    );

    // (3) سندات القبض — كل دفعة "مسددة عند التوقيع" تنزل تلقائياً في تبويب الدفعات
    const paidOnes = feeInstallments.filter((i) => i.status === "مدفوع");
    if (paidOnes.length > 0) {
      let pid = nextId(payments) - 1;
      const receipts: PaymentReceipt[] = paidOnes.map((i) => ({
        id: ++pid,
        clientId,
        caseId: null,
        feeAgreementId: feeAgrId,
        invoiceId: null,
        amount: i.amount,
        date: i.dueDate,
        paymentMethod: "تحويل بنكي",
        referenceNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: `سداد الدفعة رقم ${i.installmentNo} من الاتفاقية ${agreementNumber} (${clientNameArFinal}) — عند توقيع العقد`,
      }));
      setPayments((prev) => [...prev, ...receipts]);
    }

    // (4) حفظ نسخة الاتفاقية للطباعة وإعادة الطباعة لاحقاً
    const terms = buildPaymentTerms(insts, total);
    const oa: OfficeAgreement = {
      id: nextId(officeAgreements),
      agreementNumber,
      feeAgreementId: feeAgrId,
      clientId,
      contractDate: agrForm.contractDate,
      contractCity: agrForm.contractCity || "الشارقة",
      clientNameAr: clientNameArFinal,
      clientNameEn: agrForm.clientNameEn || "",
      representativeAr: agrForm.representativeAr || "",
      representativeEn: agrForm.representativeEn || "",
      phone: agrForm.phone || (clients.find((c) => c.id === clientId)?.phone ?? ""),
      caseDetailsAr: agrForm.caseDetailsAr,
      caseDetailsEn: agrForm.caseDetailsEn || "",
      totalAmount: total,
      paymentTermsAr: terms.ar,
      paymentTermsEn: terms.en,
      installments: insts,
      createdAt: todayISO(),
    };
    setOfficeAgreements((prev) => [...prev, oa]);
    setAgrForm(emptyAgrForm());
    setAgrPreviewId(oa.id);
  };

  const handleExecuteDeleteAgreement = () => {
    if (!deleteAgrConfirm) return;
    if (
      !checkPerm("deleteAgreements", "حذف اتفاقية الأتعاب", {
        section: "اتفاقيات الأتعاب",
        title: `اتفاقية أتعاب: ${deleteAgrConfirm.agreementNumber}`,
        details: `الموكل: ${deleteAgrConfirm.clientNameAr} | المبلغ: ${fmtAED(deleteAgrConfirm.totalAmount)}`,
        targetId: deleteAgrConfirm.id,
        isDelete: true,
      })
    )
      return;
    const targetId = deleteAgrConfirm.id;
    const feeAgrId = deleteAgrConfirm.feeAgreementId;
    const cid = deleteAgrConfirm.clientId;

    // توثيق عملية الحذف المؤكدة في سجل التدقيق الأمني
    logAuditAction(
      "DELETE",
      "اتفاقيات وعقود الأتعاب",
      `اتفاقية رقم: ${deleteAgrConfirm.agreementNumber}`,
      `تم تأكيد حذف اتفاقية الأتعاب رقم ${deleteAgrConfirm.agreementNumber} للموكل ${deleteAgrConfirm.clientNameAr} بمبلغ إجمالي ${fmtAED(deleteAgrConfirm.totalAmount)}.`,
      deleteAgrConfirm.id,
      "مؤكد",
    );

    // 1. Remove from officeAgreements archive
    setOfficeAgreements((prev) => prev.filter((a) => a.id !== targetId));
    // 2. Remove from feeAgreements list if linked
    if (feeAgrId) {
      setFeeAgreements((prev) => prev.filter((fa) => fa.id !== feeAgrId));
    }

    // 3. إلغاء الموكل تلقائياً إذا كانت هذه الاتفاقية هي سبب ارتباطه الوحيد بالمكتب ولا توجد أي سجلات أخرى
    if (cid) {
      const hasOtherOfficeAgr = officeAgreements.some(
        (a) => a.id !== targetId && a.clientId === cid,
      );
      const hasOtherFeeAgr = feeAgreements.some((fa) => fa.id !== feeAgrId && fa.clientId === cid);
      const hasCases = cases.some((c) => c.clientId === cid);
      const hasInvoices = invoices.some((inv) => inv.clientId === cid);
      const hasPoas = poas.some((p) => p.clientId === cid);

      const hasOtherRecords =
        hasOtherOfficeAgr || hasOtherFeeAgr || hasCases || hasInvoices || hasPoas;

      if (!hasOtherRecords) {
        setClients((prev) => prev.filter((c) => c.id !== cid));
      }
    }

    // 4. Close preview modal if deleting currently viewed agreement
    if (agrPreviewId === targetId) {
      setAgrPreviewId(null);
    }
    setDeleteAgrConfirm(null);
  };
  const {
    courtSearchQuery,
    setCourtSearchQuery,
    courtEmirateFilter,
    setCourtEmirateFilter,
    courtCategoryFilter,
    setCourtCategoryFilter,
    courtBranchFilter,
    setCourtBranchFilter,
    courtFiltersExpanded,
    setCourtFiltersExpanded,
    editingCourtContact,
    setEditingCourtContact,
  } = useCourtContactFilters();
  const courtContactsFilterCache = React.useRef<{
    contacts: typeof courtContacts;
    query: string;
    emirate: string;
    category: string;
    branch: string;
    result: typeof courtContacts;
  } | null>(null);

  // حالة استيراد ملفات الإكسل لدليل المحاكم والجهات القضائية
  const {
    courtExcelModalOpen,
    setCourtExcelModalOpen,
    courtImportPreviewList,
    setCourtImportPreviewList,
    courtExcelImportMode,
    setCourtExcelImportMode,
    courtExcelFileName,
    setCourtExcelFileName,
    courtExcelImportStatus,
    setCourtExcelImportStatus,
  } = useCourtExcelImport();

  // Sub-tabs configuration
  const {
    invoiceSubTab,
    setInvoiceSubTab,
    docSubTab,
    setDocSubTab,
    kycSubTab,
    setKycSubTab,
    hearingSubTab,
    setHearingSubTab,
  } = useSubTabs();

  // ---------- 1. تدقيق ومقارنة أسماء الموكلين مع قائمة الأشخاص المحظورين والمنكشفين (KYC Watchlist Auto-Audit) ----------
  const checkAndAuditClientKyc = (clientName: string, idNo?: string) => {
    if (!clientName || clientName.trim().length < 2) return null;
    const cName = clientName.trim().toLowerCase();
    const cId = idNo ? idNo.trim().toLowerCase() : "";
    // مطابقة الاسم الثلاثي: تقارن أول ثلاث مقاطع من الاسم بعد تطبيع الفروقات الإملائية الشائعة
    // (الهمزة على الألف، التاء المربوطة/الهاء، الألف المقصورة/الياء) بدل مطابقة الاسم كنص كامل حرفياً
    const cNameKey = firstNNameTokens(clientName, 3);

    const match = kycWatchlist.find((w) => {
      const wName = w.fullName.trim().toLowerCase();
      const wId = w.idNo ? w.idNo.trim().toLowerCase() : "";
      const wNameKey = firstNNameTokens(w.fullName, 3);
      const nameMatch =
        cName.includes(wName) ||
        wName.includes(cName) ||
        (cNameKey.length > 0 &&
          wNameKey.length > 0 &&
          (cNameKey === wNameKey || cNameKey.includes(wNameKey) || wNameKey.includes(cNameKey)));
      const idMatch = cId.length > 3 && wId.length > 3 && cId === wId;
      return nameMatch || idMatch;
    });

    if (match) {
      setKycSanctionAlert({
        clientName,
        idNo,
        watchlistItem: match,
      });
      // إلزامي: تسجيل كل تطابق مع قوائم العقوبات في سجل التدقيق فوراً وبغض النظر عن نقطة الدخول
      // (استيراد، اتفاقية أتعاب، إضافة موكل...) — سابقاً كان يكفي ضغط "فهمت" لإغلاق التنبيه دون أي أثر موثّق
      // يُثبت أن التطابق حدث ورُصد، وهو إخفاق امتثال AML مباشر بحسب تقرير التدقيق.
      logAuditAction(
        "CREATE",
        "الامتثال KYC",
        `تطابق مع قائمة العقوبات: ${clientName}`,
        `رُصد تطابق محتمل بين الاسم المُدخل "${clientName}"${idNo ? ` (هوية/جواز: ${idNo})` : ""} وقائمة الأشخاص المحظورين — التصنيف: ${match.type}، السبب: ${match.reason}`,
        0,
      );
    }
    return match;
  };

  // ---------- 1ب. فحص موكل جديد يُضاف يدوياً (خارج مسارات الاستيراد الآلي) وتسجيله تلقائياً في KYC عند وجود تطابق ----------
  const auditNewClientKyc = (clientName: string, idNo: string | undefined, clientId: number) => {
    const matchSanction = checkAndAuditClientKyc(clientName, idNo);
    if (matchSanction) {
      setKyc((prev) => [
        ...prev,
        {
          id: nextId(prev),
          clientId,
          nationality: "غير محدد",
          idType: "هوية/جواز",
          idExpiry: addDays(365),
          ubo: clientName,
          sourceOfFunds: "غير محدد",
          pep: true,
          sanctions: "تطابق محتمل",
          risk: "مرتفع",
          status: "قيد المراجعة",
          lastReview: todayISO(),
          notes: `🚫 محظور تلقائياً — تطابق محتمل عند إضافة موكل جديد يدوياً (سبب: ${matchSanction.reason})`,
        },
      ]);
    }
    return matchSanction;
  };

  // ---------- 2. معالجة وتفريغ ملف Excel القضايا السابقة ----------
  const handleParseCasesExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCasesExcelLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          alert("الملف المرفق فارغ أو لا يحتوي على صفوف بيانات صالحة!");
          setCasesExcelLoading(false);
          return;
        }

        const parsed = rows.map((r, idx) => {
          const caseNumber = String(
            r["رقم القضية"] ||
              r["رقم/كود القضية"] ||
              r["رقم القضيه"] ||
              r["Case Number"] ||
              r["number"] ||
              `CAS-2026-${100 + idx}`,
          ).trim();
          const cName = String(
            r["اسم الموكل"] || r["الموكل"] || r["Client Name"] || r["client"] || "موكل غير محدد",
          ).trim();
          // يدعم عمود "اسم الخصم" ذكر أكثر من خصم مفصولين بفاصلة أو "،" أو "و" فيقسّمهم إلى قائمة خصوم منفصلة
          const opponentRaw = String(
            r["اسم الخصم"] || r["الخصم"] || r["Opponent"] || r["opponent"] || "",
          ).trim();
          const opponents = opponentRaw
            ? opponentRaw
                .split(/[,،]| و /)
                .map((o) => o.trim())
                .filter(Boolean)
            : [];
          const type = String(
            r["نوع القضية"] || r["النوع"] || r["Type"] || r["type"] || "تجاري",
          ).trim();
          const court = String(
            r["المحكمة"] || r["الجهة القضائية"] || r["Court"] || r["court"] || "محاكم دبي",
          ).trim();
          const subject = String(
            r["موضوع القضية"] || r["الموضوع"] || r["العنوان"] || r["subject"] || "دعوى قضائية",
          ).trim();
          const openDate = String(
            r["تاريخ القيد"] || r["تاريخ الفتح"] || r["openDate"] || todayISO(),
          ).trim();
          const fee = Number(r["الأتعاب"] || r["الرسوم"] || r["fee"] || 10000);

          const existingClient = clients.find(
            (c) => c.name.trim().toLowerCase() === cName.toLowerCase(),
          );

          return {
            id: idx + 1,
            caseNumber,
            clientName: cName,
            opponents,
            type,
            court,
            subject,
            openDate,
            fee,
            matchedClientId: existingClient ? existingClient.id : null,
            isNewClient: !existingClient,
          };
        });

        setExcelCasesParsed(parsed);
      } catch (err: any) {
        alert("حدث خطأ أثناء قراءة ملف Excel: " + (err.message || "تنسيق غير مدعوم"));
      } finally {
        setCasesExcelLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------- 3. تأكيد واستيراد القضايا لسيستم النظام ----------
  const handleConfirmImportCases = () => {
    if (excelCasesParsed.length === 0) return;
    if (!checkPerm("manageCases", "استيراد قضايا من ملف Excel")) return;

    const updatedClients = [...clients];
    const newCasesList: CaseItem[] = [];

    excelCasesParsed.forEach((item) => {
      let finalClientId = item.matchedClientId;

      if (!finalClientId) {
        // إنشاء موكل جديد تلقائياً
        const newCId = nextId(updatedClients);
        const newClientObj: Client = {
          id: newCId,
          name: item.clientName,
          type: "شركة",
          idNo: "",
          emirate: "دبي",
          phone: "",
          email: "",
          address: "",
        };

        // فحص قائمة الحظر للموكل المستورد
        const matchSanction = checkAndAuditClientKyc(item.clientName);
        if (matchSanction) {
          setKyc((prev) => [
            ...prev,
            {
              id: nextId(prev),
              clientId: newCId,
              nationality: "غير محدد",
              idType: "هوية/جواز",
              idExpiry: addDays(365),
              ubo: item.clientName,
              sourceOfFunds: "نشاط تجاري",
              pep: true,
              sanctions: "تطابق محتمل",
              risk: "مرتفع",
              status: "قيد المراجعة",
              lastReview: todayISO(),
              notes: `🚫 محظور تلقائياً — تنبيه حظر استيراد Excel: مسجل في قائمة المحظورين (سبب: ${matchSanction.reason})`,
            },
          ]);
        }

        updatedClients.push(newClientObj);
        finalClientId = newCId;
      }

      const newCaseObj: CaseItem = {
        id: nextId(cases) + newCasesList.length,
        number: item.caseNumber,
        clientId: finalClientId,
        opponents: item.opponents,
        type: item.type,
        court: item.court,
        judge: "القاضي المختص",
        status: "قيد النظر",
        subject: item.subject,
        openDate: item.openDate,
        fee: item.fee,
      };

      newCasesList.push(newCaseObj);
    });

    setClients(updatedClients);
    setCases((prev) => [...prev, ...newCasesList]);
    logAuditAction(
      "CREATE",
      "القضايا",
      "استيراد شامل Excel",
      `تم استيراد ${newCasesList.length} قضية من ملف Excel بنجاح وتحديث الموكلين`,
      0,
    );
    alert(`تم استيراد ${newCasesList.length} قضية بنجاح وربطها بالموكلين!`);
    setShowCasesExcelModal(false);
    setExcelCasesParsed([]);
  };

  // ---------- 4. تنزيل قالب Excel استرشادي للقضايا ----------
  const downloadCasesExcelTemplate = () => {
    const sampleData = [
      {
        "رقم القضية": "CAS-2026-801",
        "اسم الموكل": "شركة الخليج للتوريدات اللوجستية",
        "اسم الخصم": "مؤسسة النجم الذهبي للمقاولات",
        "نوع القضية": "تجاري",
        المحكمة: "محاكم دبي",
        "موضوع القضية": "دعوى مطالبة بمبلغ توريد 150,000 درهم عن عقد توريد أجهزة",
        "تاريخ القيد": todayISO(),
        الأتعاب: 0,
      },
      {
        "رقم القضية": "CAS-2026-802",
        "اسم الموكل": "سالم محمد الكعبي",
        "اسم الخصم": "شركة الأفق للاستثمار و سالم راشد المهيري",
        "نوع القضية": "عقاري",
        المحكمة: "دائرة القضاء - أبوظبي",
        "موضوع القضية": "نزاع استرداد مسددات وحدة عقارية تحت الإنشاء",
        "تاريخ القيد": todayISO(),
        الأتعاب: 0,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "قضايا_سابقة");
    XLSX.writeFile(wb, "قالب_استيراد_القضايا_السابقة.xlsx");
  };

  // ---------- 5. استخراج المستندات القانونية بالذكاء الاصطناعي (POAs, Agreements, Invoices) ----------
  const handleProcessDocAiExtract = async (
    docType: "poa" | "agreement" | "invoice",
    file: File,
  ) => {
    if (!file) return;

    if (docType === "poa") setPoaAiLoading(true);
    if (docType === "agreement") setAgreementAiLoading(true);
    if (docType === "invoice") setInvoiceAiLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Str = e.target?.result as string;

        const response = await authedFetch("/api/extract-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docType,
            fileBase64: base64Str,
            mimeType: file.type || "application/pdf",
            fileName: file.name,
          }),
        });

        const data = await response.json();
        if (data.success && data.extracted) {
          if (docType === "poa") {
            setPoaAiExtracted(data.extracted);
            const matchedC = findMatchingClientByName(clients, data.extracted.clientName || "");
            setSelectedPoaClientId(matchedC ? matchedC.id : "new");
          } else if (docType === "agreement") {
            setAgreementAiExtracted(data.extracted);
            const matchedC = findMatchingClientByName(clients, data.extracted.clientName || "");
            setSelectedAgrClientId(matchedC ? matchedC.id : "new");
          } else if (docType === "invoice") {
            setInvoiceAiExtracted(data.extracted);
          }
        } else {
          alert("تعذر استخراج البيانات من المستند: " + (data.error || "خطأ غير معروف"));
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert("حدث خطأ أثناء معالجة المستند بالذكاء الاصطناعي: " + err.message);
    } finally {
      if (docType === "poa") setPoaAiLoading(false);
      if (docType === "agreement") setAgreementAiLoading(false);
      if (docType === "invoice") setInvoiceAiLoading(false);
    }
  };

  // ---------- 6. تأكيد وحفظ الوكالة المستخرجة بالذكاء الاصطناعي ----------
  const handleSaveExtractedPoa = () => {
    if (!poaAiExtracted) return;
    if (!checkPerm("manageDocs", "إضافة توكيل")) return;

    const targetPoaNumber = (poaAiExtracted.poaNumber || "").trim();
    if (
      targetPoaNumber &&
      poas.some((p) => p.number.trim().toLowerCase() === targetPoaNumber.toLowerCase())
    ) {
      alert(
        `تنبيه: رقم الوكالة "${targetPoaNumber}" مسجل مسبقاً في قاعدة البيانات!\nلا يمكن تكرار إدراج نفس الوكالة.`,
      );
      return;
    }

    let clientId: number;
    const extractedName = (poaAiExtracted.clientName || "موكل وكالة جديد").trim();
    const existingC = findMatchingClientByName(clients, extractedName);

    if (selectedPoaClientId !== "new" && typeof selectedPoaClientId === "number") {
      clientId = selectedPoaClientId;
    } else if (existingC) {
      clientId = existingC.id;
    } else {
      checkAndAuditClientKyc(extractedName);
      const newC: Client = {
        id: nextId(clients),
        name: extractedName,
        type: "فرد",
        idNo: "",
        emirate: "دبي",
        phone: "",
        email: "",
        address: "",
      };
      setClients((prev) => [...prev, newC]);
      clientId = newC.id;
    }

    const newPoaItem: PoaItem = {
      id: nextId(poas),
      clientId,
      number: poaAiExtracted.poaNumber || `POA-2026-${Math.floor(100 + Math.random() * 900)}`,
      issuer: poaAiExtracted.issuer || "الكاتب العدل",
      issue: poaAiExtracted.issueDate || todayISO(),
      expiry: poaAiExtracted.expiryDate || addDays(730),
      scope: poaAiExtracted.scope || "صلاحية مرافعة وتوكيل عام أمام جميع المحاكم",
    };

    setPoas((prev) => [newPoaItem, ...prev]);
    logAuditAction(
      "CREATE",
      "الوكالات",
      `وكالة رقم ${newPoaItem.number}`,
      "إضافة وكالة قانونية عبر الذكاء الاصطناعي",
      newPoaItem.id,
    );
    alert("تم حفظ الوكالة القانونية وربطها بالموكل بنجاح!");
    setShowPoaAiUploadModal(false);
    setPoaAiExtracted(null);
  };

  // ---------- 7. تأكيد وحفظ الاتفاقية المستخرجة بالذكاء الاصطناعي ----------
  // ملاحظة: هذا المسار الآن يُنشئ نفس مخرجات نموذج "اتفاقية أتعاب المكتب" الرسمي بالكامل
  // (عقد رسمي + اتفاقية أتعاب مالية + جدول أقساط) حتى تتطابق النتيجة بين الطريقتين ولا تبقى سجلات ناقصة.
  const handleSaveExtractedAgreement = () => {
    if (!agreementAiExtracted) return;
    if (!checkPerm("manageInvoices", "إنشاء اتفاقية أتعاب")) return;

    let clientId: number;
    const extractedName = (agreementAiExtracted.clientName || "موكل اتفاقية جديد").trim();
    const existingC = findMatchingClientByName(clients, extractedName);

    if (selectedAgrClientId !== "new" && typeof selectedAgrClientId === "number") {
      clientId = selectedAgrClientId;
    } else if (existingC) {
      clientId = existingC.id;
    } else {
      checkAndAuditClientKyc(extractedName);
      const newC: Client = {
        id: nextId(clients),
        name: extractedName,
        type: "شركة",
        idNo: "",
        emirate: "دبي",
        phone: "",
        email: "",
        address: "",
      };
      setClients((prev) => [...prev, newC]);
      clientId = newC.id;
    }

    const clientNameArFinal = clients.find((c) => c.id === clientId)?.name || extractedName;
    const clientPhoneFinal = clients.find((c) => c.id === clientId)?.phone || "";

    // (1) اتفاقية الأتعاب المالية + قسط إجمالي واحد (الاستخراج الآلي لا يوفر تفصيلاً بالأقساط)
    const feeAgrId = nextId(feeAgreements);
    const agreementNumber =
      agreementAiExtracted.agreementNumber || `AGR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const totalAmount = Number(agreementAiExtracted.totalAmount || 25000);
    const contractDate = agreementAiExtracted.date || todayISO();
    const insts: OfficeAgreementInstallment[] = [
      { amount: totalAmount, dueDate: contractDate, paidOnSigning: false },
    ];
    let maxInstId = feeAgreements
      .flatMap((a) => a.installments || [])
      .reduce((m, i) => Math.max(m, i.id), 0);
    const feeInstallments: FeeAgreementInstallment[] = insts.map((i, idx) => ({
      id: ++maxInstId,
      feeAgreementId: feeAgrId,
      installmentNo: idx + 1,
      amount: i.amount,
      dueDate: i.dueDate,
      status: "مستحق",
    }));
    const newFeeAgr: FeeAgreement = {
      id: feeAgrId,
      clientId,
      caseId: null,
      agreementNumber,
      title: "اتفاقية أتعاب قانونية مستخرجة آلياً",
      totalAmount,
      date: contractDate,
      status: "نشطة",
      installments: feeInstallments,
      notes:
        agreementAiExtracted.installmentsNotes ||
        agreementAiExtracted.notes ||
        "اتفاقية أتعاب سابقة مستخرجة آلياً",
    };
    setFeeAgreements((prev) => [newFeeAgr, ...prev]);

    // (2) العقد الرسمي المقابل — بنفس منطق تبويب "اتفاقية أتعاب المكتب" حتى تظهر الاتفاقية بشكل كامل ومتطابق في الأرشيفين
    const terms = buildPaymentTerms(insts, totalAmount);
    const oa: OfficeAgreement = {
      id: nextId(officeAgreements),
      agreementNumber,
      feeAgreementId: feeAgrId,
      clientId,
      contractDate,
      contractCity: "الشارقة",
      clientNameAr: clientNameArFinal,
      clientNameEn: "",
      representativeAr: "",
      representativeEn: "",
      phone: clientPhoneFinal,
      caseDetailsAr:
        agreementAiExtracted.installmentsNotes ||
        agreementAiExtracted.notes ||
        "اتفاقية أتعاب سابقة مستخرجة آلياً من مستند مرفق (PDF)، تم إدراجها عبر الذكاء الاصطناعي.",
      caseDetailsEn: "",
      totalAmount,
      paymentTermsAr: terms.ar,
      paymentTermsEn: terms.en,
      installments: insts,
      createdAt: todayISO(),
    };
    setOfficeAgreements((prev) => [...prev, oa]);

    logAuditAction(
      "CREATE",
      "اتفاقيات الأتعاب",
      `اتفاقية رقم ${agreementNumber}`,
      "إدراج اتفاقية أتعاب عبر الذكاء الاصطناعي (مع إنشاء العقد الرسمي المقابل تلقائياً)",
      feeAgrId,
    );
    alert(
      "تم حفظ اتفاقية الأتعاب وربطها بالموكل بنجاح، وأُنشئ لها تلقائياً العقد الرسمي المقابل في أرشيف اتفاقية أتعاب المكتب.",
    );
    setShowAgreementAiUploadModal(false);
    setAgreementAiExtracted(null);
  };

  // ---------- 8. معالجة وتفريغ ملف Excel الفواتير ----------
  const handleParseInvoicesExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          alert("الملف فارغ أو لا يحتوي على فواتير صالحة!");
          return;
        }

        const parsed = rows.map((r, idx) => {
          const invNum = String(
            r["رقم الفاتورة"] || r["Invoice Number"] || `INV-2026-${200 + idx}`,
          );
          const cName = String(r["اسم الموكل"] || r["الموكل"] || r["Client"] || "موكل فاتورة");
          const amt = Number(r["المبلغ"] || r["المبلغ الأساسي"] || r["Amount"] || 5000);
          const date = String(r["تاريخ الفاتورة"] || r["التاريخ"] || todayISO());
          const due = String(r["تاريخ الاستحقاق"] || r["الاستحقاق"] || addDays(30));
          const desc = String(
            r["الوصف"] || r["الخدمة"] || r["Description"] || "أتعاب واستشارات قانونية",
          );

          return { number: invNum, clientName: cName, amount: amt, date, due, desc };
        });

        setExcelInvoicesParsed(parsed);
      } catch (err: any) {
        alert("حدث خطأ في قراءة ملف الفواتير: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------- 9. تأكيد استيراد الفواتير (Excel أو AI) ----------
  const handleConfirmImportInvoices = () => {
    if (!checkPerm("manageInvoices", "استيراد فواتير")) return;
    const updatedClients = [...clients];
    const newInvoicesList: Invoice[] = [];

    if (invoiceImportTab === "excel") {
      const clientNameToId = new Map<string, number>();
      updatedClients.forEach((c) => clientNameToId.set(c.name.toLowerCase().trim(), c.id));
      excelInvoicesParsed.forEach((item) => {
        const key = item.clientName.toLowerCase().trim();
        let cId: number | undefined = clientNameToId.get(key);
        if (cId === undefined) {
          cId = nextId(updatedClients);
          checkAndAuditClientKyc(item.clientName);
          updatedClients.push({
            id: cId,
            name: item.clientName,
            type: "شركة",
            idNo: "",
            emirate: "دبي",
            phone: "",
            email: "",
            address: "",
          });
          clientNameToId.set(key, cId);
        }

        newInvoicesList.push({
          id: nextId(invoices) + newInvoicesList.length,
          number: item.number,
          clientId: cId,
          caseId: null,
          date: item.date,
          due: item.due,
          amount: item.amount,
          status: "غير مدفوعة",
          desc: item.desc,
        });
      });
    } else if (invoiceImportTab === "pdf_ai" && invoiceAiExtracted) {
      const cName = invoiceAiExtracted.clientName || "موكل فاتورة AI";
      const matchedC = updatedClients.find(
        (c) => c.name.toLowerCase().trim() === cName.toLowerCase().trim(),
      );
      let cId: number;
      if (!matchedC) {
        cId = nextId(updatedClients);
        checkAndAuditClientKyc(cName);
        updatedClients.push({
          id: cId,
          name: cName,
          type: "شركة",
          idNo: "",
          emirate: "دبي",
          phone: "",
          email: "",
          address: "",
        });
      } else {
        cId = matchedC.id;
      }

      newInvoicesList.push({
        id: nextId(invoices),
        number:
          invoiceAiExtracted.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        clientId: cId,
        caseId: null,
        date: invoiceAiExtracted.date || todayISO(),
        due: invoiceAiExtracted.due || addDays(15),
        amount: Number(invoiceAiExtracted.amount || invoiceAiExtracted.totalAmount || 10000),
        status: "غير مدفوعة",
        desc: invoiceAiExtracted.description || "فاتورة خدمات قانونية أصلية مستخرجة آلياً",
      });
    }

    setClients(updatedClients);
    setInvoices((prev) => [...prev, ...newInvoicesList]);
    logAuditAction(
      "CREATE",
      "الفواتير",
      "استيراد فواتير",
      `تم استيراد ${newInvoicesList.length} فاتورة وتحديث الموكلين`,
      0,
    );
    alert(`تم استيراد وإدراج ${newInvoicesList.length} فاتورة بنجاح!`);
    setShowInvoiceImportModal(false);
    setExcelInvoicesParsed([]);
    setInvoiceAiExtracted(null);
  };

  // ---------- 10. معالجة وتفريغ Excel قائمة الأشخاص المحظورين والمنكشفين (KYC Watchlist Excel) ----------
  const handleParseKycWatchlistExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          alert("الملف لا يحتوي على أسماء محظورين صالحة!");
          return;
        }

        const parsed: KycWatchlistItem[] = rows.map((r, idx) => {
          return {
            id: idx + 1,
            fullName: String(
              r["الاسم الكامل"] ||
                r["اسم الشخص/الجهة"] ||
                r["Full Name"] ||
                r["Name"] ||
                "اسم غير محدد",
            ).trim(),
            idNo: String(
              r["رقم الهوية"] || r["رقم الجواز"] || r["ID Number"] || r["Passport"] || "",
            ).trim(),
            type: String(
              r["تصنيف الحظر"] || r["نوع الحظر"] || r["Type"] || "شخص منكشف سياسياً (PEP)",
            ).trim(),
            reason: String(
              r["سبب الحظر"] ||
                r["السبب"] ||
                r["Reason"] ||
                "إدراج في قوائم الامتثال ومكافحة غسل الأموال",
            ).trim(),
            nationality: String(r["الجنسية"] || r["Nationality"] || "أخرى").trim(),
            addedDate: todayISO(),
          };
        });

        setKycWatchlistParsed(parsed);
      } catch (err: any) {
        alert("خطأ في قراءة ملف قوائم الحظر: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------- 11. تأكيد استيراد وتدقيق قائمة المحظورين ----------
  const handleConfirmImportKycWatchlist = () => {
    if (kycWatchlistParsed.length === 0) return;
    if (!checkPerm("manageKyc", "استيراد قائمة محظورين")) return;

    const newWatchlistItems = kycWatchlistParsed.map((item, idx) => ({
      ...item,
      id: nextId(kycWatchlist) + idx,
    }));

    const updatedWatchlist = [...kycWatchlist, ...newWatchlistItems];
    setKycWatchlist(updatedWatchlist);

    // تدقيق فوري ومباشر مع أسماء الموكلين المسجلين بالنظام حالياً (نسخة محسّنة الأداء: مسح واحد بدل O(n×m) وتحديث دفعة واحدة لحالة KYC)
    const normalizedWatchlistNames = newWatchlistItems.map((w) => w.fullName.toLowerCase().trim());
    let matchedCount = 0;
    const matchedClientIds = new Set<number>();
    clients.forEach((c) => {
      const cName = c.name.toLowerCase().trim();
      const isBlocked = normalizedWatchlistNames.some(
        (wName) => cName.includes(wName) || wName.includes(cName),
      );
      if (isBlocked) {
        matchedCount++;
        matchedClientIds.add(c.id);
      }
    });

    if (matchedClientIds.size > 0) {
      setKyc((prev) => {
        const existingClientIds = new Set(prev.map((k) => k.clientId));
        const updated = prev.map((k) =>
          matchedClientIds.has(k.clientId)
            ? {
                ...k,
                pep: true,
                sanctions: "تطابق محتمل",
                risk: "مرتفع",
                notes: "🚫 محظور تلقائياً — تطابق تلقائي مع القائمة السوداء المستوردة حديثاً!",
              }
            : k,
        );
        const clientsNeedingNewRecord = clients.filter(
          (c) => matchedClientIds.has(c.id) && !existingClientIds.has(c.id),
        );
        const baseId = nextId(prev);
        const additions = clientsNeedingNewRecord.map((c, idx) => ({
          id: baseId + idx,
          clientId: c.id,
          nationality: c.emirate,
          idType: "هوية إماراتية",
          idExpiry: addDays(365),
          ubo: c.name,
          sourceOfFunds: "نشاط تجاري",
          pep: true,
          sanctions: "تطابق محتمل",
          risk: "مرتفع",
          status: "قيد المراجعة",
          lastReview: todayISO(),
          notes: "🚫 محظور تلقائياً — تطابق تلقائي عند رفع قائمة الحظر الجديدة!",
        }));
        return [...updated, ...additions];
      });
    }

    logAuditAction(
      "CREATE",
      "الامتثال KYC/AML",
      "استيراد قائمة محظورين",
      `تم استيراد ${newWatchlistItems.length} اسم لقائمة المحظورين`,
      0,
    );
    alert(
      `تم استيراد ${newWatchlistItems.length} اسم لقائمة المحظورين والمنكشفين بنجاح! ${matchedCount > 0 ? `🚨 تم العثور على (${matchedCount}) موكل حالي متطابق مع القائمة!` : "لم يتطابق أي موكل حالي."}`,
    );
    setShowKycWatchlistUploadModal(false);
    setKycWatchlistParsed([]);
  };

  // ---------- 12. تنزيل قالب Excel لقوائم الحظر ----------
  const downloadKycWatchlistTemplate = () => {
    const sampleData = [
      {
        "الاسم الكامل": "دانييل روبيرتو أندرسون",
        "رقم الهوية": "PASSPORT-US-887192",
        "تصنيف الحظر": "شخص منكشف سياسياً (PEP)",
        "سبب الحظر": "إفصاح سياسي عالي المخاطر - تجميد أصول تحرزي",
        الجنسية: "الولايات المتحدة",
      },
      {
        "الاسم الكامل": "شركة الشرق الأوسط للمشتقات القابضة",
        "رقم الهوية": "CR-772810",
        "تصنيف الحظر": "قائمة حظر عقوبات دولية / محلية",
        "سبب الحظر": "قرار حظر تعامل تجاري ومالي صادرة من وحدة المعلومات المالية FIU",
        الجنسية: "أخرى",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "قائمة_المحظورين");
    XLSX.writeFile(wb, "قالب_استيراد_الأشخاص_المحظورين_KYC.xlsx");
  };

  const { letterhead, setLetterhead } = useLetterhead();

  const updateLetterhead = (partial: Partial<LetterheadConfig>) => {
    setLetterhead((prev) => {
      const next = {
        headerImg: partial.headerImg !== undefined ? partial.headerImg : prev.headerImg,
        footerImg: partial.footerImg !== undefined ? partial.footerImg : prev.footerImg,
        signatureImg: partial.signatureImg !== undefined ? partial.signatureImg : prev.signatureImg,
        stampImg: partial.stampImg !== undefined ? partial.stampImg : prev.stampImg,
        fullPageImg: partial.fullPageImg !== undefined ? partial.fullPageImg : prev.fullPageImg,
      };
      saveLetterhead(next);
      return next;
    });
  };

  // اقتصاص صورة الورق الرسمي الكاملة (A4 بأكملها) إلى شريطي الترويسة
  // والتذييل تلقائياً عبر canvas، حتى تستمر جميع أماكن استخدام الورق الرسمي
  // في النظام (محرر الخطابات، معاينة اتفاقية أتعاب المكتب، ...) بالعمل دون أي
  // تعديل إضافي — فهي تستهلك headerImg/footerImg كما هي تماماً كالسابق.
  const deriveHeaderFooterFromFullPage = (
    fullPageDataUrl: string,
  ): Promise<{ headerImg: string; footerImg: string }> => {
    return new Promise((resolve, reject) => {
      const img = new (window as any).Image();
      img.onload = () => {
        try {
          const naturalW = img.naturalWidth || img.width;
          const naturalH = img.naturalHeight || img.height;
          const headerFrac = LETTERHEAD_PAGE_LAYOUT.headerMm / LETTERHEAD_PAGE_LAYOUT.pageHeightMm;
          const footerFrac = LETTERHEAD_PAGE_LAYOUT.footerMm / LETTERHEAD_PAGE_LAYOUT.pageHeightMm;
          const headerPx = Math.max(1, Math.round(naturalH * headerFrac));
          const footerPx = Math.max(1, Math.round(naturalH * footerFrac));

          const cropToDataUrl = (sy: number, sh: number) => {
            const canvas = document.createElement("canvas");
            canvas.width = naturalW;
            canvas.height = sh;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("canvas context unavailable");
            ctx.drawImage(img, 0, sy, naturalW, sh, 0, 0, naturalW, sh);
            return canvas.toDataURL("image/png");
          };

          const headerImg = cropToDataUrl(0, headerPx);
          const footerImg = cropToDataUrl(naturalH - footerPx, footerPx);
          resolve({ headerImg, footerImg });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("تعذّر تحميل الصورة"));
      img.src = fullPageDataUrl;
    });
  };

  // Client portal & Doc generator states
  const {
    clientPortalId,
    setClientPortalId,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedGenCaseId,
    setSelectedGenCaseId,
    notifyModal,
    setNotifyModal,
    selectedRollDate,
    setSelectedRollDate,
    rollCourtFilter,
    setRollCourtFilter,
  } = useDocGenState();

  const [report, setReport] = useState<any>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [caseView, setCaseView] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const {
    caseStageFilter,
    setCaseStageFilter,
    caseFilter,
    setCaseFilter,
    caseJudgeFilter,
    setCaseJudgeFilter,
    caseCourtFilter,
    setCaseCourtFilter,
    caseTypeFilter,
    setCaseTypeFilter,
    caseEmirateFilter,
    setCaseEmirateFilter,
    caseClientFilter,
    setCaseClientFilter,
    caseClientTypeFilter,
    setCaseClientTypeFilter,
    caseYearFilter,
    setCaseYearFilter,
    caseSortBy,
    setCaseSortBy,
    showAdvancedFilters,
    setShowAdvancedFilters,
    showCaseStatsOnDemand,
    setShowCaseStatsOnDemand,
  } = useCaseFilters();

  // حالة تعديل قضية موجودة (عند عدم التعيين، نافذة القضية تُنشئ قضية جديدة بدلاً من تعديل قضية قائمة)
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);

  // حالات إدارة الموكلين
  const { clientCategoryFilter, setClientCategoryFilter, clientSearch, setClientSearch } =
    useClientFilters();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToast, setClientToast] = useState<string | null>(null);

  // نقل تصنيف الجهة أو الشخص يدوياً
  const moveClientCategory = (clientId: number, newType: string) => {
    if (!checkPerm("manageClients", "تعديل بيانات الموكل")) return;
    const clientObj = clients.find((c) => c.id === clientId);
    if (!clientObj) return;
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, type: newType } : c)));
    setClientToast(`تم نقل "${clientObj.name}" إلى تصنيف (${newType}) بنجاح`);
    setTimeout(() => setClientToast(null), 4000);
  };

  // حفظ تعديل بيانات الموكل / جهة الاتصال
  const saveEditClient = () => {
    if (!checkPerm("manageClients", "تعديل بيانات الموكل")) return;
    if (!editingClient || !editingClient.name) return;
    setClients((prev) => prev.map((c) => (c.id === editingClient.id ? editingClient : c)));
    logAuditAction(
      "UPDATE",
      "الموكلين والشركات",
      `الموكل: ${editingClient.name}`,
      `تعديل بيانات الموكل ${editingClient.name} من نافذة التعديل السريع`,
      editingClient.id,
    );
    setEditingClient(null);
    setClientToast(`تم تحديث بيانات "${editingClient.name}" بنجاح`);
    setTimeout(() => setClientToast(null), 4000);
  };

  // حذف موكل / جهة اتصال يدويًا مع التأكيد ودعم الموكلين المرتبطين بقضايا
  const deleteClient = (clientId: number) => {
    const cObj = clients.find((c) => c.id === clientId);
    if (!cObj) return;
    const linkedCases = cases.filter((x) => x.clientId === clientId);
    const linkedPoas = poas.filter((p) => p.clientId === clientId);
    const linkedAgreements = officeAgreements.filter((a) => a.clientId === clientId);
    const linkedInvoices = invoices.filter((i) => i.clientId === clientId);

    const details = `النوع: ${cObj.type} | الهوية/الرخصة: ${cObj.idNo || "غير محدد"} | الهاتف: ${cObj.phone || "—"}${
      linkedCases.length > 0 ? `\n⚠️ مرتبط بـ (${linkedCases.length}) قضايا مسجلة بالنظام.` : ""
    }${linkedPoas.length > 0 ? `\n⚠️ مرتبط بـ (${linkedPoas.length}) وكالات قانونية.` : ""}${
      linkedAgreements.length > 0
        ? `\n⚠️ مرتبط بـ (${linkedAgreements.length}) اتفاقيات أتعاب.`
        : ""
    }${linkedInvoices.length > 0 ? `\n⚠️ مرتبط بـ (${linkedInvoices.length}) فواتير مالية.` : ""}`;

    requestDelete({
      section: "الموكلين والشركات",
      title: `الموكل: ${cObj.name}`,
      details,
      permKey: "deleteClients",
      actionName: "حذف الموكل",
      onConfirm: () => {
        logAuditAction(
          "DELETE",
          "الموكلين",
          `الموكل: ${cObj.name}`,
          `حذف الموكل ${cObj.name} (${cObj.type}) يدويًا من سجلات المكتب`,
          cObj.id,
        );
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        if (editingClient?.id === clientId) {
          setEditingClient(null);
        }
        setClientToast(`تم حذف الموكل "${cObj.name}" بنجاح`);
        setTimeout(() => setClientToast(null), 4000);
      },
    });
  };

  // حالة مودال Supabase SQL وتحديد المستخدمين المعلقين
  const {
    showSupabaseModal,
    setShowSupabaseModal,
    showBackupModal,
    setShowBackupModal,
    backupActiveTab,
    setBackupActiveTab,
    restorePreview,
    setRestorePreview,
    restoreError,
    setRestoreError,
    restoreSuccessMsg,
    setRestoreSuccessMsg,
  } = useBackupRestoreModal();

  // حالات المساعد الذكي القانوني لجميع الأقسام (Legal AI Assistant - Gemini 3.6 Flash)
  const {
    isAiAssistantEnabled,
    setIsAiAssistantEnabled,
    showAiModal,
    setShowAiModal,
    aiDepartment,
    setAiDepartment,
    aiQuery,
    setAiQuery,
    aiResponse,
    setAiResponse,
    aiLoading,
    setAiLoading,
    aiError,
    setAiError,
    aiMode,
    setAiMode,
  } = useAiAssistantModal();

  const { handleAskAiAssistant, openAiForCurrentSection } = useAiAssistant({
    tab,
    cases,
    clients,
    hearings,
    invoices,
    tasks,
    aiQuery,
    setAiQuery,
    aiDepartment,
    setAiDepartment,
    aiMode,
    aiResponse,
    setAiResponse,
    aiLoading,
    setAiLoading,
    aiError,
    setAiError,
    setShowAiModal,
  });

  // handleExportBackup/handleFileChangeForRestore/executeRestore: انتقلت لهوك useBackupExportRestore
  // (استدعاؤه أدناه بعد تعريف useWhatsAppModule لأن الدوال تحتاج waChats/setWaChats)

  // حالات البريد الإلكتروني المدمج (In-App Email & Supabase Sync)
  const {
    emailFolder,
    setEmailFolder,
    emailSearch,
    setEmailSearch,
    selectedEmailId,
    setSelectedEmailId,
    showComposeEmail,
    setShowComposeEmail,
    showEmailSettingsModal,
    setShowEmailSettingsModal,
    composeTo,
    setComposeTo,
    composeSubject,
    setComposeSubject,
    composeBody,
    setComposeBody,
    composeAttachment,
    setComposeAttachment,
    emailConfig,
    setEmailConfig,
    testSmtpLoading,
    setTestSmtpLoading,
    testSmtpResult,
    setTestSmtpResult,
    testInvoiceLoading,
    setTestInvoiceLoading,
    testInvoiceRecipient,
    setTestInvoiceRecipient,
    testInvoiceResult,
    setTestInvoiceResult,
    inAppEmails,
    setInAppEmails,
  } = useEmailModule(isDemoEmail);

  const {
    waBackendSession,
    setWaBackendSession,
    isGeneratingQr,
    setIsGeneratingQr,
    selectedWaChatId,
    setSelectedWaChatId,
    waInputText,
    setWaInputText,
    waSearchTerm,
    setWaSearchTerm,
    showNewWaChatModal,
    setShowNewWaChatModal,
    newWaName,
    setNewWaName,
    newWaPhone,
    setNewWaPhone,
    waChats,
    setWaChats,
  } = useWhatsAppModule();

  const { handleExportBackup, handleFileChangeForRestore, executeRestore } = useBackupExportRestore(
    {
      currentUser,
      clients,
      setClients,
      cases,
      setCases,
      hearings,
      setHearings,
      tasks,
      setTasks,
      invoices,
      setInvoices,
      docs,
      setDocs,
      poas,
      setPoas,
      kyc,
      setKyc,
      courtContacts,
      setCourtContacts,
      officeAgreements,
      setOfficeAgreements,
      employees,
      setEmployees,
      leaveRequests,
      setLeaveRequests,
      employeeExpenses,
      setEmployeeExpenses,
      disciplinaryActions,
      setDisciplinaryActions,
      auditLogs,
      setAuditLogs,
      precedents,
      setPrecedents,
      policies,
      setPolicies,
      users,
      setUsers,
      feeAgreements,
      setFeeAgreements,
      payments,
      setPayments,
      consultationBookings,
      setConsultationBookings,
      consultationSettings,
      setConsultationSettings,
      waChats,
      setWaChats,
      restorePreview,
      setRestorePreview,
      setRestoreError,
      setRestoreSuccessMsg,
      logAuditAction,
    },
  );

  // استعلام حالة واتساب الحقيقية من السيرفر
  const fetchWaStatus = async () => {
    try {
      const res = await authedFetch("/api/whatsapp/status");
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const generateWaQrCode = async () => {
    setIsGeneratingQr(true);
    try {
      const res = await authedFetch("/api/whatsapp/generate-qr", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data.session);
      }
    } catch (e) {
      alert("تعذر توليد كود الـ QR الخاص بوحدة واتساب");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const simulateScanQr = async () => {
    try {
      const res = await authedFetch("/api/whatsapp/connect-simulated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+971 50 889 9123" }),
      });
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data.session);
        setPermissionNotice("تم ربط واتساب المكتب بنجاح ومزامنة المراسلات أونلاين!");
      }
    } catch (e) {
      // ignore
    }
  };

  const disconnectWaSession = async () => {
    try {
      const res = await authedFetch("/api/whatsapp/disconnect", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data.session);
        setPermissionNotice("تم قطع اتصال جلسة واتساب المكتب بنجاح");
      }
    } catch (e) {
      // ignore
    }
  };

  // ================= محرك البريد الإلكتروني الذكي ومزامنة Supabase =================
  const fetchEmailSettings = async () => {
    try {
      const res = await authedFetch("/api/email/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setEmailConfig((prev) => ({
            ...prev,
            email: data.settings.email || prev.email,
            senderName: data.settings.senderName || prev.senderName,
            smtpHost: data.settings.host || prev.smtpHost,
            smtpPort: data.settings.port || prev.smtpPort,
            secure: data.settings.secure ?? prev.secure,
            protocol:
              data.settings.protocol || (data.settings.port === 465 ? "ssl_tls" : "starttls"),
            rejectUnauthorized: data.settings.rejectUnauthorized ?? false,
            lastTestedAt: data.settings.lastTestedAt,
            lastTestStatus: data.settings.lastTestStatus,
            isConfigured: true,
          }));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // (Phase-4) يضمن وجود صف لهذا المستخدم في جدول public.profiles (جدول الأدوار المركزي الجديد)
  // عند أول دخول له بعد نشر هذا التحديث. لا نمنح دوراً افتراضياً بناءً على أي شيء محلي — الصف
  // الجديد يُنشأ دائماً بأدنى صلاحية ممكنة ("no_access" / بانتظار المراجعة)، وسياسة قاعدة البيانات
  // (الـ Trigger في supabase_roles_migration.sql) تفرض هذا فعلياً بصرف النظر عمّا نرسله هنا، كطبقة
  // حماية مضاعفة. يجب على مدير المكتب الدخول لشاشة "المستخدمون" وإسناد الدور الصحيح يدوياً —
  // لا توجد وسيلة آلية آمنة لتخمين الدور المقصود لحساب موجود مسبقاً محلياً فقط.
  const bootstrapAppUserProfileIfMissing = async (authUserId: string, email: string) => {
    try {
      const normalizedEmail = email.toLowerCase();
      const { data: existing, error: selectErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authUserId)
        .maybeSingle();
      if (selectErr) {
        console.warn("Phase-4 profiles bootstrap: تعذّر التحقق من الصف الحالي:", selectErr.message);
        return;
      }
      if (existing) return; // الصف موجود مسبقاً بنفس معرّف Supabase Auth — لا شيء يُفعل

      // (تصحيح لاحق مهم) قبل افتراض عدم وجود أي صف، نتحقق أولاً هل يوجد صف "يتيم" بنفس البريد
      // الإلكتروني لكن بمعرّف مختلف — هذا يحدث تحديداً حين يُنشئ المدير حساب موظف جديد من شاشة
      // "المستخدمون" (saveUser في هذا الملف) *قبل* أن يسجّل ذلك الموظف دخوله فعلياً لأول مرة عبر
      // Supabase Auth: يُنشأ حينها صف بمعرّف عشوائي لا يطابق auth.users.id الحقيقي. إن لم نتحقق
      // من هذا هنا، سيفشل الإدراج أدناه بصمت بسبب قيد unique(email)، ويبقى الدور الذي عيّنه المدير
      // غير مرئي أبداً لـ requireServerRole على الخادم رغم أنه صحيح ومحفوظ في الجدول تحت معرّف آخر.
      const { data: orphanByEmail, error: emailLookupErr } = await supabase
        .from("profiles")
        .select("id, role, role_title, permissions, status")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!emailLookupErr && orphanByEmail && orphanByEmail.id !== authUserId) {
        // نُطابق الصف "اليتيم" مع معرّف Supabase Auth الحقيقي بتحديث id بدل إدراج صف جديد،
        // محافظين على الدور والصلاحيات التي عيّنها المدير مسبقاً من شاشة المستخدمين.
        const { error: relinkErr } = await supabase
          .from("profiles")
          .update({ id: authUserId })
          .eq("email", normalizedEmail);
        if (relinkErr) {
          console.warn(
            "Phase-4 profiles bootstrap: تعذّر ربط الصف اليتيم بمعرّف Supabase Auth الحقيقي:",
            relinkErr.message,
          );
        } else {
          console.warn(
            `Phase-4: تم ربط صف الدور الموجود مسبقاً بالبريد ${normalizedEmail} بمعرّف تسجيل ` +
              `الدخول الحقيقي — الدور المعيّن مسبقاً (${orphanByEmail.role}) أصبح فعالاً الآن على الخادم.`,
          );
        }
        return;
      }

      const { error: insertErr } = await supabase.from("profiles").insert({
        id: authUserId,
        email: normalizedEmail,
        role: "no_access",
        role_title: "بدون صلاحيات خاصة (بانتظار مراجعة المدير)",
        status: "pending",
        permissions: {},
      });
      if (insertErr) {
        console.warn("Phase-4 profiles bootstrap: تعذّر إنشاء صف افتراضي آمن:", insertErr.message);
      } else {
        console.warn(
          `Phase-4: تم إنشاء حساب دور جديد بأدنى صلاحية للمستخدم ${email} — يجب على المدير ` +
            `إسناد الدور الصحيح له يدوياً من شاشة "المستخدمون".`,
        );
      }
    } catch (e) {
      console.warn("Phase-4 profiles bootstrap exception:", e);
    }
  };

  const fetchSupabaseProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) {
        // Deduplicate fetched profiles before processing
        const fetchedProfiles = data || [];
        const uniqueProfiles = Array.from(
          new Map(
            fetchedProfiles.map((p: any) => [p.id || p.email?.trim().toLowerCase(), p]),
          ).values(),
        );

        setUsers((prev) => {
          let updated = [...prev];
          let changed = false;

          const dbIds = new Set(uniqueProfiles.map((p: any) => p.id).filter(Boolean));
          const dbEmails = new Set(
            uniqueProfiles.map((p: any) => p.email?.trim().toLowerCase()).filter(Boolean),
          );

          // Filter out users that were removed from Supabase profiles (unless primary local admin, id=1)
          const initialLen = updated.length;
          updated = updated.filter((u) => {
            if (u.id === 1) return true;
            if (u.supabaseId && !dbIds.has(u.supabaseId) && !dbEmails.has(u.email.toLowerCase()))
              return false;
            return true;
          });
          if (updated.length !== initialLen) changed = true;

          uniqueProfiles.forEach((p: any) => {
            const emailClean = p.email?.trim().toLowerCase();
            if (!emailClean) return;
            const existingIdx = updated.findIndex(
              (u) => u.email.toLowerCase() === emailClean || (p.id && u.supabaseId === p.id),
            );
            const pPhone = p.phone || p.phone_number || "0500000000";
            const pName = p.full_name || p.name || emailClean.split("@")[0];
            const pStatus =
              p.status === "pending" || p.status === "معلق"
                ? "pending"
                : p.status === "approved" || p.status === "نشط" || p.status === "active"
                  ? "approved"
                  : "rejected";

            // If profile status is rejected or deleted, remove from state
            if (pStatus === "rejected") {
              if (existingIdx >= 0) {
                updated.splice(existingIdx, 1);
                changed = true;
              }
              return;
            }

            if (existingIdx >= 0) {
              const cur = updated[existingIdx];
              const pRoleKey = (p.role as any) || cur.roleKey;
              const pRoleTitle = p.role_title || cur.roleTitle;
              let dbPerms = cur.permissions;
              if (p.permissions) {
                if (typeof p.permissions === "string") {
                  try {
                    dbPerms = JSON.parse(p.permissions);
                  } catch (e) {}
                } else if (typeof p.permissions === "object") {
                  dbPerms = p.permissions;
                }
              }

              if (
                cur.status !== pStatus ||
                (pPhone && cur.phone !== pPhone) ||
                (pName && cur.name !== pName) ||
                p.id !== cur.supabaseId ||
                cur.roleKey !== pRoleKey ||
                cur.roleTitle !== pRoleTitle ||
                JSON.stringify(cur.permissions) !== JSON.stringify(dbPerms)
              ) {
                updated[existingIdx] = {
                  ...cur,
                  status: pStatus,
                  phone: pPhone || cur.phone,
                  name: pName || cur.name,
                  supabaseId: p.id || cur.supabaseId,
                  roleKey: pRoleKey,
                  roleTitle: pRoleTitle,
                  permissions: dbPerms,
                };
                changed = true;
              }
            } else {
              const roleKey = (p.role as any) || "lawyer";
              const roleTitle = p.role_title || ROLE_PRESETS[roleKey]?.title || "محامٍ ومستشار";
              let dbPerms = ROLE_PRESETS[roleKey]?.permissions || ROLE_PRESETS.lawyer.permissions;
              if (p.permissions) {
                if (typeof p.permissions === "string") {
                  try {
                    dbPerms = JSON.parse(p.permissions);
                  } catch (e) {}
                } else if (typeof p.permissions === "object") {
                  dbPerms = p.permissions;
                }
              }

              const newUser: UserItem = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                supabaseId: p.id,
                name: pName,
                email: emailClean,
                phone: pPhone,
                password: p.password || "", // لا نمنح كلمة مرور افتراضية معروفة — الحساب يبقى بلا كلمة مرور صالحة حتى يعيّنها مدير النظام
                roleKey: roleKey as any,
                roleTitle: roleTitle,
                status: pStatus,
                avatarBg: "bg-amber-600 text-white",
                avatarText: pName.slice(0, 2),
                permissions: dbPerms,
              };
              updated.push(newUser);
              changed = true;
            }
          });

          // Deduplicate final users array by unique id / email
          const deduplicatedMap = new Map();
          updated.forEach((u) => {
            const key = u.supabaseId || u.email?.toLowerCase() || u.id;
            if (!deduplicatedMap.has(key)) {
              deduplicatedMap.set(key, u);
            }
          });
          const deduplicated = Array.from(deduplicatedMap.values());

          if (changed || deduplicated.length !== prev.length) {
            saveStorage("firm_users", deduplicated);
            return deduplicated;
          }
          return prev;
        });
      }
    } catch (err) {}
  };

  const fetchSupabaseEmailMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("email_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const nonDemoData = data.filter(
          (row: any) =>
            !isDemoEmail({
              id: row.id,
              subject: row.subject,
              sender: row.sender_name,
              senderEmail: row.sender_email,
              body: row.body || row.message_body,
            }),
        );

        if (nonDemoData.length > 0) {
          setInAppEmails((prev) => {
            const updated = [...prev];
            nonDemoData.forEach((row: any) => {
              const mappedMsg = {
                id: row.id || Date.now() + Math.random(),
                folder:
                  (row.folder as any) ||
                  (row.sender_email === emailConfig.email ? "sent" : "inbox"),
                sender: row.sender_name || row.sender_email || "مرسل غير معروف",
                senderEmail: row.sender_email || "",
                recipient: row.recipient_name || row.recipient_email || "",
                recipientEmail: row.recipient_email || "",
                subject: row.subject || "بدون موضوع",
                body: row.body || row.message_body || "",
                date: row.created_at ? new Date(row.created_at).toLocaleString("ar-AE") : "الآن",
                isRead: row.is_read ?? false,
                hasAttachment: !!row.attachment_name,
                attachmentName: row.attachment_name || "",
              };
              const existingIndex = updated.findIndex(
                (m) =>
                  m.id === mappedMsg.id ||
                  (m.subject === mappedMsg.subject && m.date === mappedMsg.date),
              );
              if (existingIndex >= 0) {
                updated[existingIndex] = mappedMsg;
              } else {
                updated.unshift(mappedMsg);
              }
            });
            return [...updated];
          });
        }
      }
    } catch (err) {}
  };

  const handleTestSmtpConnection = async () => {
    if (!emailConfig.email || !emailConfig.smtpHost) {
      alert("يرجى إدخال عنوان البريد لخادم الإرسال (SMTP Host) قبل إجراء الاختبار");
      return;
    }
    setTestSmtpLoading(true);
    setTestSmtpResult(null);

    try {
      const res = await authedFetch("/api/email/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailConfig.email,
          senderName: emailConfig.senderName,
          password: emailConfig.appPassword,
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.protocol === "ssl_tls",
          protocol: emailConfig.protocol,
          rejectUnauthorized: emailConfig.rejectUnauthorized,
        }),
      });

      const data = await res.json();
      setTestSmtpResult({
        success: Boolean(data.success),
        message:
          data.message ||
          (data.success ? "تم الاتصال واختبار الأمان بنجاح!" : "فشل اختبار اتصال SMTP"),
        latencyMs: data.latencyMs,
        code: data.code,
        recommendation: data.recommendation,
        details: data.details,
      });

      if (data.success) {
        setEmailConfig((prev) => ({
          ...prev,
          lastTestedAt: new Date().toLocaleTimeString("ar-AE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          lastTestStatus: "success",
        }));
      } else {
        setEmailConfig((prev) => ({ ...prev, lastTestStatus: "failed" }));
      }
    } catch (err: any) {
      setTestSmtpResult({
        success: false,
        message: "تعذر الاتصال بالخادم المحلي أو انقطع الاتصال ببروتوكول الأمان",
        recommendation: "يرجى التأكد من تشغيل خادم التطبيق المحلي وإعادة المحاولة.",
      });
    } finally {
      setTestSmtpLoading(false);
    }
  };

  const handleSendTestInvoice = async () => {
    const targetEmail = testInvoiceRecipient.trim() || emailConfig.email;
    if (!targetEmail) {
      alert("يرجى إدخال بريد إلكتروني لإرسال الفاتورة التجريبية");
      return;
    }

    setTestInvoiceLoading(true);
    setTestInvoiceResult(null);

    try {
      const { success, error } = await sendEmailViaServer({
        to: targetEmail,
        subject: `📄 [فحص تسليم فاتورة ضريبية] - مكتب سعود أحمد الشحي للمحاماة (${emailConfig.protocol.toUpperCase()})`,
        html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.7">الموكل الفاضل / المستلم المحترم،\n\nتحية طيبة وبعد،\n\nهذا بريد فحص آلي صادر من نظام الفواتير والمراسلات الموحد بمكتب المحاماة للتأكد من وصول الفواتير الضريبية والإشعارات القانونية بنجاح إلى صندوق البريد الوارد الخاص بكم.\n\nتفاصيل العينة التجريبية للفاتورة:\n• رقم الفاتورة: INV-2026-TEST-VERIFIED\n• بيان الخدمة: أتعاب استشارة واستحقاق قضائي تجريبي\n• المبلغ الأولي: 5,000 درهم إماراتي\n• ضريبة القيمة المضافة VAT (5%): 250 درهم إماراتي\n• الإجمالي المستحق: 5,250 درهم إماراتي\n\nتاريخ وساعة الإرسال: ${new Date().toLocaleString("ar-AE")}\n\nمع تحيات،\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية</div>`,
      });

      if (!error) {
        setTestInvoiceResult({
          success: true,
          message: `تم إرسال الفاتورة التجريبية بنجاح إلى البريد (${targetEmail})!`,
        });
      } else {
        setTestInvoiceResult({
          success: false,
          message: `تعذر إرسال البريد: ${error.message || "تعذر الاتصال بخادم البريد — راجع إعدادات الخادم"}`,
        });
      }
    } catch (err: any) {
      setTestInvoiceResult({
        success: false,
        message: `فشل في إرسال طلب الفاتورة التجريبية: ${err?.message || ""}`,
      });
    } finally {
      setTestInvoiceLoading(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    if (!emailConfig.email || !emailConfig.smtpHost) {
      alert("يرجى إدخال البريد الإلكتروني وخادم الإرسال SMTP");
      return;
    }

    try {
      await authedFetch("/api/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailConfig.email,
          senderName: emailConfig.senderName,
          password: emailConfig.appPassword,
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.protocol === "ssl_tls",
          protocol: emailConfig.protocol,
          rejectUnauthorized: emailConfig.rejectUnauthorized,
        }),
      });
    } catch (e) {}

    setEmailConfig((prev) => ({ ...prev, isConfigured: true }));
    setShowEmailSettingsModal(false);
    setPermissionNotice(
      `تم حفظ وتفعيل إعدادات البريد الإلكتروني وبروتوكول (${emailConfig.protocol.toUpperCase()}) بنجاح لـ (${emailConfig.email})`,
    );
  };

  const handleSendInAppEmail = async () => {
    if (!composeTo.trim() || !composeSubject.trim()) {
      alert("يرجى تعبئة خانتي المرسل إليه وموضوع الرسالة");
      return;
    }

    const newSentMail = {
      id: Date.now(),
      folder: "sent" as const,
      sender: emailConfig.senderName || currentUser.name,
      senderEmail: emailConfig.email || currentUser.email,
      recipient: composeTo,
      recipientEmail: composeTo,
      subject: composeSubject,
      body: composeBody,
      date: "الآن",
      isRead: true,
      hasAttachment: !!composeAttachment,
      attachmentName: composeAttachment || undefined,
    };

    setInAppEmails((prev) => [newSentMail, ...prev]);
    setShowComposeEmail(false);
    setEmailFolder("sent");
    setSelectedEmailId(newSentMail.id);

    // الإرسال الفعلي عبر Edge Function المسماة send-email (وليس عبر مسار محلي غير موجود)
    let sendSucceeded = false;
    let sendErrorMessage = "";
    try {
      const { success, error } = await sendEmailViaServer({
        to: composeTo,
        subject: composeSubject,
        html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.7">${composeBody}</div>`,
      });
      if (!success) throw new Error(error || "فشل إرسال البريد");
      sendSucceeded = true;
    } catch (e: any) {
      sendErrorMessage = e?.message || "تعذر الاتصال بخادم إرسال البريد";
    }

    try {
      await supabase.from("email_messages").insert({
        folder: "sent",
        sender_name: emailConfig.senderName,
        sender_email: emailConfig.email,
        recipient_email: composeTo,
        subject: composeSubject,
        body: composeBody,
        is_read: true,
        attachment_name: composeAttachment || null,
        created_at: new Date().toISOString(),
      });
    } catch (err) {}

    if (sendSucceeded) {
      setPermissionNotice("تم إرسال الرسالة الإلكترونية بنجاح وحفظها في السجل!");
    } else {
      setPermissionNotice(
        `تنبيه: تعذر إرسال الرسالة فعلياً عبر الخادم (${sendErrorMessage}) — تم حفظ نسخة منها في السجل فقط دون إرسالها. يرجى مراجعة إعدادات خادم البريد أو التواصل مع الدعم الفني.`,
      );
    }
    logAuditAction(
      "CREATE",
      "المراسلات والبريد",
      `بريد إلى: ${composeTo}`,
      `إرسال رسالة بريد إلكتروني رسمية بموضوع "${composeSubject}" إلى ${composeTo}${sendSucceeded ? "" : " (تنبيه: فشل الإرسال الفعلي عبر الخادم)"}`,
      newSentMail.id,
    );
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeAttachment("");
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem("firm_is_logged_in");
      localStorage.removeItem("firm_logged_in_user_id");
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // تفريغ فوري ومؤكد لأي معطيات تجريبية متبقية في الـ LocalStorage للمهام والبريد والقضايا والجلسات
    setCases((prev) => {
      const cleanList = prev.filter((c) => !isDemoCase(c)).map(sanitizeCase);
      const combined = [...cleanList, ...seedCases];
      const unique = deduplicateCases(combined);
      saveStorage("firm_cases", unique);
      return unique;
    });
    setClients((prev) => {
      const combined = [...prev, ...seedClients];
      const unique = deduplicateClients(combined);
      saveStorage("firm_clients", unique);
      return unique;
    });
    setHearings((prev) => {
      const clean = prev.filter((h) => !isDemoHearing(h));
      saveStorage("firm_hearings", clean);
      return clean;
    });
    setTasks((prev) => {
      const clean = prev.filter((t) => !isDemoTask(t));
      saveStorage("firm_tasks", clean);
      return clean;
    });
    setInAppEmails((prev) => {
      const clean = prev.filter((e) => !isDemoEmail(e));
      saveStorage("firm_in_app_emails", clean);
      return clean;
    });

    fetchWaStatus();
    fetchEmailSettings();
    fetchSupabaseEmailMessages();
    fetchSupabaseProfiles();

    // التحقق المباشر من جلسة Supabase ومتابعة تغيرات الجلسة (onAuthStateChange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
        if (session.user.id) void bootstrapAppUserProfileIfMissing(session.user.id, email);
        const found = users.find((u) => u.email.toLowerCase() === email);
        if (found) {
          setCurrentUserId(found.id);
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
            localStorage.setItem("firm_logged_in_user_id", String(found.id));
          } catch (e) {}
        } else {
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
          } catch (e) {}
        }
      }
    });

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
        if (session.user.id) void bootstrapAppUserProfileIfMissing(session.user.id, email);
        const found = users.find((u) => u.email.toLowerCase() === email);
        if (found) {
          setCurrentUserId(found.id);
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
            localStorage.setItem("firm_logged_in_user_id", String(found.id));
          } catch (e) {}
        } else {
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
          } catch (e) {}
        }
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        try {
          localStorage.removeItem("firm_is_logged_in");
          localStorage.removeItem("firm_logged_in_user_id");
        } catch (e) {}
      }
    });

    // الاشتراك اللحظي في جدول Supabase profiles
    const profilesChannel = supabase
      .channel("realtime_profiles_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchSupabaseProfiles();
      })
      .subscribe();

    // الاشتراك اللحظي في جدول Supabase email_messages
    const emailChannel = supabase
      .channel("realtime_email_messages_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_messages" },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow) {
            setInAppEmails((prev) => {
              const mapped = {
                id: newRow.id || Date.now(),
                folder:
                  (newRow.folder as any) ||
                  (newRow.sender_email === emailConfig.email ? "sent" : "inbox"),
                sender: newRow.sender_name || newRow.sender_email || "رسالة جديدة",
                senderEmail: newRow.sender_email || "",
                recipient: newRow.recipient_name || newRow.recipient_email || "",
                recipientEmail: newRow.recipient_email || "",
                subject: newRow.subject || "بدون عنوان",
                body: newRow.body || newRow.message_body || "",
                date: new Date().toLocaleString("ar-AE"),
                isRead: newRow.is_read ?? false,
                hasAttachment: !!newRow.attachment_name,
                attachmentName: newRow.attachment_name || "",
              };
              const exists = prev.some((m) => m.id === mapped.id);
              if (exists) {
                return prev.map((m) => (m.id === mapped.id ? mapped : m));
              }
              return [mapped, ...prev];
            });
          }
        },
      )
      .subscribe();

    return () => {
      authSub?.unsubscribe();
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(emailChannel);
    };
  }, []);

  // مزامنة رسائل الواتساب لحظياً مع جدول Supabase (whatsapp_messages) و Edge Function
  const fetchSupabaseWhatsAppMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setWaChats((prev) => {
          const updated = [...prev];
          data.forEach((row: any) => {
            const rowPhoneClean = row.phone_number?.replace(/[^\d]/g, "");
            const targetChat = updated.find((c) => c.phone.replace(/[^\d]/g, "") === rowPhoneClean);
            if (targetChat) {
              const msgExists = targetChat.messages.some(
                (m) =>
                  m.text === row.message_body && m.sender === (row.sender === "me" ? "me" : "them"),
              );
              if (!msgExists) {
                targetChat.messages.push({
                  id: row.id || Date.now() + Math.random(),
                  sender: row.sender === "me" ? "me" : "them",
                  text: row.message_body,
                  time: row.created_at
                    ? new Date(row.created_at).toLocaleTimeString("ar-AE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "الآن",
                  status: (row.status as any) || "sent",
                });
              }
            } else if (row.phone_number) {
              updated.push({
                id: Date.now() + Math.floor(Math.random() * 10000),
                name: row.contact_name || row.phone_number,
                phone: row.phone_number,
                role: "عميل عبر الواتساب",
                avatarBg: "bg-teal-600 text-white",
                unreadCount: 0,
                messages: [
                  {
                    id: row.id || Date.now(),
                    sender: row.sender === "me" ? "me" : "them",
                    text: row.message_body,
                    time: row.created_at
                      ? new Date(row.created_at).toLocaleTimeString("ar-AE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "الآن",
                    status: (row.status as any) || "sent",
                  },
                ],
              });
            }
          });
          return [...updated];
        });
      }
    } catch (err) {}
  };

  useEffect(() => {
    // التحقق من المهام المستحقة يومياً لإرسال تنبيه واتساب
    const checkTasksForWhatsAppReminders = async () => {
      if (!isLoggedIn) return;
      const todayDate = todayISO();
      const lastCheck = localStorage.getItem("firm_last_task_reminder_check");
      if (lastCheck === todayDate) return;

      const upcomingTasks = tasks.filter(
        (t) => !t.done && daysUntil(t.due) <= 1 && daysUntil(t.due) >= -7,
      );

      if (upcomingTasks.length > 0) {
        let allSuccess = true;
        for (const t of upcomingTasks) {
          const user = users.find((u) => u.name === t.assignee);
          if (user && user.phone) {
            const message = `مرحباً ${user.name}،\nتذكير بمهمة: "${t.title}"\nتاريخ الاستحقاق: ${t.due}\nيرجى المتابعة عبر نظام المكتب.`;
            try {
              await sendWhatsAppViaEdgeFunction({
                to: user.phone.replace(/[^0-9]/g, ""),
                message: message,
                contact_name: user.name,
              });

              // محاولة إرسال التنبيه التلقائي عبر البريد الإلكتروني أيضاً إذا تم تكوينه
              if (user.email && typeof supabase.functions !== "undefined") {
                sendEmailViaServer({
                  to: user.email,
                  subject: `تذكير بمهمة مستحقة: ${t.title}`,
                  html: `<p>مرحباً ${user.name}،</p><p>نذكرك بضرورة إنجاز المهمة التالية:</p><p><strong>${t.title}</strong></p><p>تاريخ الاستحقاق: ${t.due}</p>`,
                }).catch((e) => console.warn("Email reminder failed or not configured", e));
              }
            } catch (err) {
              console.error("Failed to send WhatsApp task reminder", err);
              allSuccess = false;
            }
          }
        }
        if (allSuccess) {
          localStorage.setItem("firm_last_task_reminder_check", todayDate);
        }
      } else {
        localStorage.setItem("firm_last_task_reminder_check", todayDate);
      }
    };

    checkTasksForWhatsAppReminders();
  }, [isLoggedIn, tasks, users]);

  useEffect(() => {
    fetchSupabaseWhatsAppMessages();

    // الاشتراك في القناة اللحظية Supabase Realtime Channel
    const channel = supabase
      .channel("public:whatsapp_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "whatsapp_messages" },
        (payload) => {
          const newRow = payload.new;
          if (newRow && newRow.phone_number) {
            setWaChats((prev) => {
              const rowPhoneClean = newRow.phone_number.replace(/[^\d]/g, "");
              const matchesChat = prev.find(
                (chat) => chat.phone.replace(/[^\d]/g, "") === rowPhoneClean,
              );

              if (matchesChat) {
                return prev.map((chat) => {
                  if (chat.phone.replace(/[^\d]/g, "") === rowPhoneClean) {
                    const alreadyHas = chat.messages.some(
                      (m) =>
                        m.id === newRow.id ||
                        (m.text === newRow.message_body &&
                          m.sender === (newRow.sender === "me" ? "me" : "them")),
                    );
                    if (!alreadyHas) {
                      return {
                        ...chat,
                        unreadCount:
                          newRow.sender !== "me" ? chat.unreadCount + 1 : chat.unreadCount,
                        messages: [
                          ...chat.messages,
                          {
                            id: newRow.id || Date.now(),
                            sender: newRow.sender === "me" ? "me" : "them",
                            text: newRow.message_body,
                            time: new Date().toLocaleTimeString("ar-AE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                            status: (newRow.status as any) || "sent",
                          },
                        ],
                      };
                    }
                  }
                  return chat;
                });
              } else {
                return [
                  ...prev,
                  {
                    id: Date.now(),
                    name: newRow.contact_name || newRow.phone_number,
                    phone: newRow.phone_number,
                    role: "عميل عبر الواتساب",
                    avatarBg: "bg-teal-600 text-white",
                    unreadCount: newRow.sender !== "me" ? 1 : 0,
                    messages: [
                      {
                        id: newRow.id || Date.now(),
                        sender: newRow.sender === "me" ? "me" : "them",
                        text: newRow.message_body,
                        time: new Date().toLocaleTimeString("ar-AE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        status: (newRow.status as any) || "sent",
                      },
                    ],
                  },
                ];
              }
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // دالة إرسال الردود عبر Edge Function وتخزينها في Supabase
  const handleSendWaMessage = async (targetChatId: number) => {
    if (!waInputText.trim()) return;
    const textToSend = waInputText.trim();
    setWaInputText("");

    const activeChat = waChats.find((c) => c.id === targetChatId);
    if (!activeChat) return;

    // 1. تحديث واجهة المستخدم فورياً
    const newMsg = {
      id: Date.now(),
      sender: "me" as const,
      text: textToSend,
      time: "الآن",
      status: "sent" as const,
    };
    setWaChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, messages: [...c.messages, newMsg] } : c)),
    );

    // 2. استدعاء Edge Function المسماة send-whatsapp-message
    sendWhatsAppViaEdgeFunction({
      to: activeChat.phone,
      message: textToSend,
      contact_name: activeChat.name,
    });

    // 3. حفظ السجل في جدول whatsapp_messages في Supabase
    try {
      await supabase.from("whatsapp_messages").insert({
        phone_number: activeChat.phone,
        contact_name: activeChat.name,
        sender: "me",
        message_body: textToSend,
        status: "sent",
      });
    } catch (e) {}
    logAuditAction(
      "CREATE",
      "واتساب الأعمال",
      `محادثة: ${activeChat.name}`,
      `إرسال رسالة واتساب إلى ${activeChat.name} (${activeChat.phone})`,
      activeChat.id,
    );
  };

  // دالة إنشاء محادثة جديدة وتفعيلها فوراً
  const handleStartNewWaChat = async (name: string, phone: string, initialMsg?: string) => {
    if (!phone) return;
    const cleanPhone = phone.trim();
    const cleanName = name.trim() || cleanPhone;

    let targetId: number;
    const existing = waChats.find(
      (c) => c.phone.replace(/[^\d]/g, "") === cleanPhone.replace(/[^\d]/g, ""),
    );

    if (existing) {
      targetId = existing.id;
    } else {
      targetId = Date.now();
      const newChatObj = {
        id: targetId,
        name: cleanName,
        phone: cleanPhone,
        role: "عميل - محادثة جديدة",
        avatarBg: "bg-emerald-600 text-white",
        unreadCount: 0,
        messages: [],
      };
      setWaChats((prev) => [newChatObj, ...prev]);
    }

    setSelectedWaChatId(targetId);

    if (initialMsg && initialMsg.trim()) {
      const msgText = initialMsg.trim();
      setWaChats((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: Date.now(),
                    sender: "me",
                    text: msgText,
                    time: "الآن",
                    status: "sent",
                  },
                ],
              }
            : c,
        ),
      );

      sendWhatsAppViaEdgeFunction({
        to: cleanPhone,
        message: msgText,
        contact_name: cleanName,
      });

      try {
        await supabase.from("whatsapp_messages").insert({
          phone_number: cleanPhone,
          contact_name: cleanName,
          sender: "me",
          message_body: msgText,
          status: "sent",
        });
      } catch (e) {}
      logAuditAction(
        "CREATE",
        "واتساب الأعمال",
        `محادثة جديدة: ${cleanName}`,
        `بدء محادثة واتساب جديدة مع ${cleanName} (${cleanPhone}) وإرسال رسالة أولى`,
        targetId,
      );
    }
  };

  // حالات مودال تخصيص الصلاحيات عند قبول وتفعيل المستخدم الجدد
  const {
    approvingUser,
    setApprovingUser,
    assignRoleTitle,
    setAssignRoleTitle,
    assignRoleKey,
    setAssignRoleKey,
    assignCanTransfer,
    setAssignCanTransfer,
    assignCanAgreements,
    setAssignCanAgreements,
    assignCanWhatsapp,
    setAssignCanWhatsapp,
    assignCanFinances,
    setAssignCanFinances,
  } = useApproveUserModal();

  const pendingUsers = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      if (u.status === "معلق" || u.status === "pending") {
        const key = u.supabaseId || u.email?.toLowerCase() || u.id;
        if (!map.has(key)) {
          map.set(key, u);
        }
      }
    });
    return Array.from(map.values()) as UserItem[];
  }, [users]);

  const openApproveUserModal = (userId: number) => {
    if (!checkPerm("manageUsers", "الموافقة على المستخدمين")) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setApprovingUser(target);
    setAssignRoleTitle(target.roleTitle || "محامٍ ومستشار قانوني");
    setAssignRoleKey(target.roleKey || "lawyer");
    setAssignCanTransfer(target.canTransferContacts || false);
    setAssignCanAgreements(target.canViewAgreements || false);
    setAssignCanWhatsapp(target.canAccessWhatsapp || false);
    setAssignCanFinances(target.canViewFinances || false);
  };

  const confirmApproveUser = async () => {
    if (!approvingUser) return;
    const preset = ROLE_PRESETS[assignRoleKey];
    const targetUserId = approvingUser.supabaseId || approvingUser.id;

    try {
      // Direct update in Supabase profiles by ID
      const { data, error } = await supabase
        .from("profiles")
        .update({
          status: "approved",
          role: assignRoleKey,
          role_title: assignRoleTitle || preset.title,
        })
        .eq("id", targetUserId)
        .select();

      let isSuccess = !error && data && data.length > 0;

      // Fallback update by email if ID update returned empty or error
      if (!isSuccess) {
        const { data: emailData, error: emailError } = await supabase
          .from("profiles")
          .update({
            status: "approved",
            role: assignRoleKey,
            role_title: assignRoleTitle || preset.title,
          })
          .eq("email", approvingUser.email.toLowerCase())
          .select();

        if (!emailError && emailData && emailData.length > 0) {
          isSuccess = true;
        } else if (!error && !emailError) {
          // If update succeeded without RLS return
          isSuccess = true;
        } else {
          const finalErr = emailError || error;
          console.error("Database update failed:", finalErr);
          alert("Approval failed: " + (finalErr?.message || "Database update failed"));
          return;
        }
      }

      if (isSuccess) {
        // Update local state after DB confirmation
        setUsers((prev) =>
          prev.map((u) =>
            u.id === approvingUser.id
              ? {
                  ...u,
                  status: "approved",
                  roleKey: assignRoleKey,
                  roleTitle: assignRoleTitle || preset.title,
                  permissions: { ...preset.permissions },
                  canTransferContacts: assignCanTransfer,
                  canViewAgreements: assignCanAgreements,
                  canAccessWhatsapp: assignCanWhatsapp,
                  canViewFinances: assignCanFinances,
                }
              : u,
          ),
        );

        // Re-fetch users from database to ensure source of truth
        await fetchSupabaseProfiles();

        setPermissionNotice(
          `تم القبول والاعتماد الصريح لحساب "${approvingUser.name}" وإسناد الصلاحيات المحددة بنجاح!`,
        );
        setApprovingUser(null);
      }
    } catch (e: any) {
      console.error("Database update failed with exception:", e);
      alert("Approval failed: " + (e?.message || "Error during approval process"));
    }
  };

  const approveUser = (userId: number) => {
    openApproveUserModal(userId);
  };

  const handleDeleteUser = async (userId: number) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (target.id === currentUserId) {
      alert("لا يمكنك حذف حسابك الحالي الناشط");
      return;
    }

    requestDelete({
      section: "المستخدمون وإدارة النظام",
      title: `المستخدم: ${target.name}`,
      details: `البريد الإلكتروني: ${target.email} | الدور الحالي: ${target.roleTitle} (${target.roleKey}) | الحالة: ${target.status || "نشط"}`,
      permKey: "deleteUsers",
      actionName: "حذف حساب المستخدم",
      onConfirm: async () => {
        // Immediately remove from active state so row disappears
        logAuditAction(
          "DELETE",
          "المستخدمون والصلاحيات",
          `حساب: ${target.name}`,
          `حذف حساب المستخدم ${target.name} (${target.email}) نهائياً من نظام المكتب`,
          target.id,
        );
        setUsers((prev) => prev.filter((u) => u.id !== userId));

        const targetUserId = target.supabaseId || target.id;

        try {
          // 1. Direct deletion query on public.profiles
          const { error: deleteErr } = await supabase
            .from("profiles")
            .delete()
            .eq("id", targetUserId);

          if (deleteErr) {
            // Try direct deletion by email
            const { error: deleteEmailErr } = await supabase
              .from("profiles")
              .delete()
              .eq("email", target.email.toLowerCase());

            if (deleteEmailErr) {
              // 2. Fallback soft delete (status = 'rejected') if direct delete restricted by RLS or FK
              const { error: updateErr } = await supabase
                .from("profiles")
                .update({ status: "rejected" })
                .eq("id", targetUserId);

              if (updateErr) {
                await supabase
                  .from("profiles")
                  .update({ status: "rejected" })
                  .eq("email", target.email.toLowerCase());
              }
            }
          }
        } catch (e) {
          try {
            await supabase
              .from("profiles")
              .update({ status: "rejected" })
              .eq("email", target.email.toLowerCase());
          } catch (err) {}
        }

        setPermissionNotice(`تم حذف واستبعاد حساب "${target.name}" بنجاح.`);
      },
    });
  };

  const rejectUser = async (userId: number) => {
    if (!checkPerm("manageUsers", "إدارة المستخدمين")) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // Instantly remove from state
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    const targetUserId = target.supabaseId || target.id;
    try {
      const { error: deleteErr } = await supabase.from("profiles").delete().eq("id", targetUserId);

      if (deleteErr) {
        await supabase.from("profiles").update({ status: "rejected" }).eq("id", targetUserId);
      }
    } catch (e) {
      await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("email", target.email.toLowerCase());
    }
    setPermissionNotice(`تم رفض واستبعاد حساب "${target.name}".`);
  };

  const clientName = (id: number) => clients.find((c) => c.id === id)?.name || "—";
  const caseNo = (id: number) => cases.find((c) => c.id === id)?.number || "—";
  const nextId = <T extends { id: number }>(arr: T[]) =>
    arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;

  // ---------- نظام التنبيهات التلقائي لمواعيد الطعون (7 أيام و 3 أيام) ----------
  const runAutoAppealDeadlineChecker = async (
    deadlinesList: JudgmentDeadline[],
    forceManual = false,
  ) => {
    setAutoCheckStatus((prev) => ({ ...prev, isChecking: true }));
    const updatedList = [...deadlinesList];
    const newLogs: NotificationLog[] = [];
    let sentCount7Days = 0;
    let sentCount3Days = 0;
    let overdueCount = 0;

    const timestampNow = new Date().toLocaleString("ar-AE", {
      dateStyle: "short",
      timeStyle: "short",
    });

    for (let i = 0; i < updatedList.length; i++) {
      const item = { ...updatedList[i] };
      if (
        item.status === "تم قيد الطعن" ||
        item.status === "تم تقديم الطعن" ||
        item.status === "لا حاجة لطعن"
      ) {
        continue;
      }

      const daysLeft = daysUntil(item.appealDeadlineDate);
      const cs = cases.find((c) => c.id === item.caseId);
      const caseNum = cs ? cs.number : `قضية رقم #${item.caseId}`;
      const client = cs ? clients.find((cli) => cli.id === cs.clientId) : null;
      const clientNm = client ? client.name : "الموكل";

      const lawyerName = item.assignedLawyerName || cs?.judge || "المحامي المسؤول";
      const lawyerEmail = item.assignedLawyerEmail || emailConfig.email || "info@lawyersuood.com";
      const lawyerPhone = item.assignedLawyerPhone || "0501234567";

      // 1. Check 3-Day Critical Threshold
      if (daysLeft <= 3 && daysLeft >= 0) {
        if (!item.alert3DaysSent || forceManual) {
          const subject = `🚨 [تنبيه حرج جداً - متبقي 3 أيام] مهلة انقضاء الطعن بالقضية (${caseNum})`;
          const emailContent = `سعادة المحامي / ${lawyerName} المحترم،\n\nتحية طيبة وبعد،\n\nنود لفت عنايتكم العاجلة والشديدة بأنه متبقي (${daysLeft}) أيام فقط على انقضاء المهلة القانونية المقررة للطعن/الاستئناف في الحكم القضائي الصادر بالقضية التالية:\n\n• رقم القضية: ${caseNum}\n• اسم الموكل: ${clientNm}\n• المحكمة: ${cs ? cs.court : "—"}\n• نوع الحكم: ${item.rulingType}\n• تاريخ الحكم: ${fmtDate(item.rulingDate)}\n• آخر موعد قاطع للطعن: ${fmtDate(item.appealDeadlineDate)}\n• منطوق الحكم: ${item.rulingSummary}\n\nيرجى المبادرة المباشرة بإعداد وقيد صحيفة الطعن قبل سقوط الحق القانوني للموكل وتأكيد قيد الطعن بالنظام.\n\nنظام الإشعارات الآلي الموحد\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;

          try {
            sendEmailViaServer({
              to: lawyerEmail,
              subject,
              html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.7">${emailContent}</div>`,
            })
              .then(({ success, error }) => {
                if (!success) console.warn("SMTP Auto Dispatch Error (3-day alert):", error);
              })
              .catch((e) => console.warn("SMTP Auto Dispatch Error (3-day alert):", e));
          } catch (e) {
            console.warn("SMTP Auto Dispatch Error:", e);
          }

          newLogs.push({
            id: Date.now() + Math.random(),
            recipientName: lawyerName,
            recipientPhone: lawyerPhone,
            recipientEmail: lawyerEmail,
            channel:
              item.preferredChannel === "whatsapp"
                ? "واتساب"
                : item.preferredChannel === "both"
                  ? "كلاهما"
                  : "إيميل",
            type: "تنبيه ميعاد طعن / استئناف",
            message: emailContent,
            sentAt: timestampNow,
            status: "تم الإرسال",
            relatedRef: `طوارئ الطعون - قضية ${caseNum}`,
          });

          const logEntry: JudgmentDeadlineLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: timestampNow,
            type: "3_days",
            channel: item.preferredChannel || "both",
            lawyerName,
            recipientContact: lawyerEmail,
            status: "sent",
            messageSnippet: `🚨 تم إرسال تنبيه حرج قبل 3 أيام من انقضاء المهلة (آخر موعد: ${fmtDate(item.appealDeadlineDate)})`,
          };

          item.alert3DaysSent = true;
          item.alert3DaysSentAt = timestampNow;
          item.autoAlertLogs = [logEntry, ...(item.autoAlertLogs || [])];
          sentCount3Days++;
        }
      }
      // 2. Check 7-Day Early Threshold
      else if (daysLeft <= 7 && daysLeft > 3) {
        if (!item.alert7DaysSent || forceManual) {
          const subject = `⚠️ [تنبيه استباقي - متبقي 7 أيام] ميعاد الطعن بالقضية (${caseNum})`;
          const emailContent = `سعادة المحامي / ${lawyerName} المحترم،\n\nتحية طيبة وبعد،\n\nنود تذكيركم بموعد قرب انقضاء المهلة القانونية للطعن/الاستئناف في الحكم الصادر في القضية التالية (متبقي 7 أيام):\n\n• رقم القضية: ${caseNum}\n• اسم الموكل: ${clientNm}\n• المحكمة: ${cs ? cs.court : "—"}\n• نوع الحكم: ${item.rulingType}\n• تاريخ الحكم: ${fmtDate(item.rulingDate)}\n• آخر موعد للطعن: ${fmtDate(item.appealDeadlineDate)}\n• منطوق الحكم: ${item.rulingSummary}\n\nنرجو مراجعة ملف القضية وتجهيز لائحة الطعن والتنسيق مع الموكل.\n\nنظام الإشعارات الآلي الموحد\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;

          try {
            sendEmailViaServer({
              to: lawyerEmail,
              subject,
              html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.7">${emailContent}</div>`,
            })
              .then(({ success, error }) => {
                if (!success) console.warn("SMTP Auto Dispatch Error (7-day alert):", error);
              })
              .catch((e) => console.warn("SMTP Auto Dispatch Error (7-day alert):", e));
          } catch (e) {
            console.warn("SMTP Auto Dispatch Error:", e);
          }

          newLogs.push({
            id: Date.now() + Math.random(),
            recipientName: lawyerName,
            recipientPhone: lawyerPhone,
            recipientEmail: lawyerEmail,
            channel:
              item.preferredChannel === "whatsapp"
                ? "واتساب"
                : item.preferredChannel === "both"
                  ? "كلاهما"
                  : "إيميل",
            type: "تنبيه ميعاد طعن / استئناف",
            message: emailContent,
            sentAt: timestampNow,
            status: "تم الإرسال",
            relatedRef: `تنبيه الطعون (7 أيام) - قضية ${caseNum}`,
          });

          const logEntry: JudgmentDeadlineLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: timestampNow,
            type: "7_days",
            channel: item.preferredChannel || "both",
            lawyerName,
            recipientContact: lawyerEmail,
            status: "sent",
            messageSnippet: `⚠️ تم إرسال تنبيه استباقي قبل 7 أيام من انقضاء المهلة (آخر موعد: ${fmtDate(item.appealDeadlineDate)})`,
          };

          item.alert7DaysSent = true;
          item.alert7DaysSentAt = timestampNow;
          item.autoAlertLogs = [logEntry, ...(item.autoAlertLogs || [])];
          sentCount7Days++;
        }
      }

      if (daysLeft < 0 && item.status === "جارٍ حساب الميعاد") {
        item.status = "انقضى الميعاد القانوني";
        overdueCount++;
      }

      updatedList[i] = item;
    }

    setDeadlines(updatedList);
    if (newLogs.length > 0) {
      setNotifications((prev) => [...newLogs, ...prev]);
    }

    const statusMsg = `تم فحص ${updatedList.length} طعن: تم إرسال (${sentCount3Days}) تنبيه حرج (3 أيام) و (${sentCount7Days}) تنبيه استباقي (7 أيام).`;
    setAutoCheckStatus({
      lastCheckedAt: timestampNow,
      message: statusMsg,
      isChecking: false,
    });

    return { sentCount7Days, sentCount3Days, overdueCount, totalProcessed: updatedList.length };
  };

  useEffect(() => {
    if (deadlines && deadlines.length > 0) {
      runAutoAppealDeadlineChecker(deadlines);
    }
  }, []);

  const handleSendWhatsAppDeadlineAlert = (d: JudgmentDeadline) => {
    const cs = cases.find((c) => c.id === d.caseId);
    const daysLeft = daysUntil(d.appealDeadlineDate);
    const lawyerName = d.assignedLawyerName || "المحامي المسؤول";
    const lawyerPhone = d.assignedLawyerPhone || "0501234567";

    const msg = `سعادة المحامي / ${lawyerName} المحترم\nتحية طيبة وبعد،\n\n🚨 تنبيه استباقي عاجل - سجل مواعيد الطعون:\n• القضية: ${cs ? cs.number : "—"}\n• الموكل: ${cs ? clientName(cs.clientId) : "—"}\n• المحكمة: ${cs ? cs.court : "—"}\n• نوع الحكم: ${d.rulingType}\n• آخر موعد قاطع للطعن: ${fmtDate(d.appealDeadlineDate)} (متبقي ${daysLeft} أيام)\n• منطوق الحكم: ${d.rulingSummary}\n\nيرجى المبادرة المباشرة بإعداد وقيد صحيفة الطعن بالمحكمة قبل انقضاء المهلة وسقوط الحق القانوني.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;

    sendWhatsAppMsg(lawyerPhone, msg);

    const timestampNow = new Date().toLocaleString("ar-AE", {
      dateStyle: "short",
      timeStyle: "short",
    });
    const logEntry: JudgmentDeadlineLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timestampNow,
      type: "manual",
      channel: "whatsapp",
      lawyerName,
      recipientContact: lawyerPhone,
      status: "sent",
      messageSnippet: `📱 تم إرسال تنبيه واتساب مباشر للمحامي المسؤول (متبقي ${daysLeft} أيام)`,
    };

    setDeadlines((prev) =>
      prev.map((x) =>
        x.id === d.id
          ? {
              ...x,
              autoAlertLogs: [logEntry, ...(x.autoAlertLogs || [])],
            }
          : x,
      ),
    );
  };

  // ---------- فتح نموذج التنبيهات وإرسال الواتساب والبريد ----------
  const openNotificationComposer = (
    type:
      | "تنبيه جلسة"
      | "تحديث قضية"
      | "تذكير فاتورة"
      | "تجديد وثائق / KYC"
      | "تجديد وكالة / POA"
      | "تنبيه ميعاد طعن / استئناف"
      | "تذكير قسط فاتورة"
      | "رسالة عامة",
    data?: any,
  ) => {
    let name = "";
    let phone = "";
    let email = "";
    let subject = "";
    let message = "";
    let relatedRef = "";

    if (type === "تنبيه جلسة" && data) {
      const h: Hearing = data;
      const c = cases.find((cs) => cs.id === h.caseId);
      const cl = c ? clients.find((cli) => cli.id === c.clientId) : null;
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = c ? `قضية ${c.number}` : `جلسة ${h.date}`;
      subject = `تنبيه بموعد جلسة محكمة — ${c ? c.number : ""}`;
      message = `الموكل الفاضل / ${name}\nتحية طيبة وبعد،\nنود إحاطتكم بجدول الجلسة القادمة الخاصة بقضيتكم رقم (${c ? c.number : ""}) المنظورة أمام (${c ? c.court : "المحكمة"}):\n📅 التاريخ: ${fmtDate(h.date)}\n⏰ الوقت: ${h.time}\n🏛️ القاعة: ${h.room}\n📌 نوع الجلسة: ${h.type}\n${h.notes ? `📝 المطلوب / الملاحظات: ${h.notes}\n` : ""}شاكرين لكم حسن التعاون.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;
    } else if (type === "تذكير فاتورة" && data) {
      const inv: Invoice = data;
      const cl = clients.find((cli) => cli.id === inv.clientId);
      const vat = inv.amount * VAT_RATE;
      const total = inv.amount + vat;
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = `فاتورة ${inv.number}`;
      subject = `تذكير بسداد فاتورة أتعاب قانونية رقم ${inv.number}`;
      message = `الموكل الفاضل / ${name}\nتحية طيبة وبعد،\nنود إحاطتكم بإصدار/تذكير السداد للفاتورة الضريبية رقم (${inv.number}).\n💰 المبلغ الأساسي: ${fmtAED(inv.amount)}\n📊 ضريبة القيمة المضافة 5%: ${fmtAED(vat)}\n💵 الإجمالي المستحق: ${fmtAED(total)}\n📅 تاريخ الاستحقاق: ${fmtDate(inv.due)}\nشاكرين لكم حسن التعاون والسداد.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;
    } else if (type === "تحديث قضية" && data) {
      const c: CaseItem = data;
      const cl = clients.find((cli) => cli.id === c.clientId);
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = `قضية ${c.number}`;
      subject = `تحديث ومتابعة مستجدات القضية رقم ${c.number}`;
      message = `الموكل الفاضل / ${name}\nتحية طيبة وبعد،\nنود إفادتكم بآخر مستجدات قضيتكم رقم (${c.number}) المقيدة أمام (${c.court}):\n⚖️ موضوع الدعوى: ${c.subject}\n📌 الحالة الحالية: ${c.status}\n🏛️ الدائرة والقاضي: ${c.judge}\nنحن بانتظار استكمال الإجراءات وسنوافيكم فور صدور القرارات.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;
    } else if (type === "تجديد وثائق / KYC" && data) {
      const k: KycItem = data;
      const cl = clients.find((cli) => cli.id === k.clientId);
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = `ملف KYC موكل ${name}`;
      subject = `تنبيه تحديث بيانات العناية الواجبة والهوية (KYC / AML)`;
      message = `الموكل الفاضل / ${name}\nتحية طيبة وبعد،\nوفقاً لمتطلبات الامتثال ومكافحة غسل الأموال ومراجعة هويات الموكلين الدوري، يرجى التكرم بتزويدنا بصورة الهوية الإماراتية / الرخصة التجارية المحدثة ونموذج المستفيد الحقيقي (UBO).\nشاكرين لكم سرعة التجاوب لتفادي تجميد الإجراءات القضائية.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;
    } else if (type === "تجديد وكالة / POA" && data) {
      const p: PoaItem = data;
      const cl = clients.find((cli) => cli.id === p.clientId);
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = `وكالة رقم ${p.number}`;
      subject = `تنبيه قرب انتهاء / تجديد الوكالة القانونية رقم ${p.number}`;
      message = `الموكل الفاضل / ${name}\nتحية طيبة وبعد،\nنود إحاطتكم بعلم أن الوكالة القانونية رقم (${p.number}) الصادرة من (${p.issuer}) تقترب من تاريخ الانتهاء المعتمد (${fmtDate(p.expiry)}).\nيرجى التنسيق معنا لإعادة التجديد لدى الكاتب العدل لضمان استمرار المرافعة ومتابعة المعاملات القضائية دون انقطاع.\nشاكرين لكم حسن التعاون.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;
    } else if (type === "تنبيه ميعاد طعن / استئناف" && data) {
      const d: JudgmentDeadline = data;
      const cs = cases.find((c) => c.id === d.caseId);
      const cl = cs ? clients.find((cli) => cli.id === cs.clientId) : null;
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = cs ? `قضية ${cs.number}` : `حكم قضائي`;
      subject = `🚨 تنبيه هام جداً: قرب انقضاء ميعاد الطعن / الاستئناف للقضية ${cs ? cs.number : ""}`;
      message = `الموكل الفاضل / ${name}\nتحية طيبة وبعد،\nنسترعي عنايتكم الشديدة بأنه بناء على منطوق الحكم الصادر في القضية رقم (${cs ? cs.number : ""}) بتاريخ (${fmtDate(d.rulingDate)})، فإن آخر يوم قاطّ للميعاد القانوني للطعن بالاستئناف/التمييز هو يوم (${fmtDate(d.appealDeadlineDate)}).\nيرجى التواصل الفوري معنا لتأكيد الرغبة في الطعن وقيد الصحيفة قبل سقوط الحق القانوني.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;
    } else if (type === "تذكير قسط فاتورة" && data) {
      const inst: InvoiceInstallment = data;
      const inv = invoices.find((i) => i.id === inst.invoiceId);
      const cl = inv ? clients.find((cli) => cli.id === inv.clientId) : null;
      name = cl ? cl.name : "الموكل";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = inv ? `فاتورة ${inv.number} - قسط ${inst.installmentNo}` : `قسط مستحق`;
      subject = `تذكير بسداد القسط رقم (${inst.installmentNo}) للفاتورة رقم ${inv ? inv.number : ""}`;
      message = `الموكل الفاضل / ${name}\nتحية طيبة وبعد،\nنود تذكيركم بحلول موعد سداد القسط رقم (${inst.installmentNo}) البالغ قدره (${fmtAED(inst.amount)}) درهم إماراتي والمستحق بتاريخ (${fmtDate(inst.dueDate)}).\nشاكرين لكم حسن التعاون والسداد.\nمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`;
    } else {
      name = clients[0]?.name || "";
      phone = clients[0]?.phone || "";
      email = clients[0]?.email || "";
      subject = "رسالة إشعار رسمية من مكتب المحاماة";
      message = `الموكل الفاضل،\nتحية طيبة وبعد،\nمرفق لكم إشعار رسمي من مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية.`;
    }

    setNotifyModal({
      recipientName: name,
      recipientPhone: phone,
      recipientEmail: email,
      channel: "واتساب",
      type,
      subject,
      message,
      relatedRef,
    });
  };

  const dispatchNotification = () => {
    if (!notifyModal) return;
    const {
      recipientName,
      recipientPhone,
      recipientEmail,
      channel,
      type,
      subject,
      message,
      relatedRef,
    } = notifyModal;

    if (channel === "واتساب" || channel === "كلاهما") {
      sendWhatsAppMsg(recipientPhone, message);
    }
    if (channel === "إيميل" || channel === "كلاهما") {
      sendEmailMsg(recipientEmail, subject, message);
    }

    const newLog: NotificationLog = {
      id: nextId(notifications),
      recipientName: recipientName || "غير محدد",
      recipientPhone: recipientPhone || "—",
      recipientEmail: recipientEmail || "—",
      channel,
      type,
      message,
      sentAt:
        new Date().toLocaleDateString("ar-AE") +
        " " +
        new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
      status: "تم الإرسال",
      relatedRef,
    };

    setNotifications([newLog, ...notifications]);
    setNotifyModal(null);
  };

  // ---------- إحصاءات ومخططات تفاعلية ----------
  const stats = useMemo(() => {
    // القضايا "النشطة" هي فقط القضايا الجارية فعلياً (متداولة / قيد النظر / محجوزة للحكم)،
    // بنفس التعريف المعتمد في caseStatsBreakdown.stageStatusMap — القيم القديمة "مغلقة"/"صدر الحكم"
    // لم تعد ضمن CASE_STATUS الفعلية، ما كان يجعل هذا العداد يساوي دائماً إجمالي عدد القضايا
    const active = cases.filter(
      (c) => c.status === "متداولة" || c.status === "قيد النظر" || c.status === "محجوزة للحكم",
    ).length;
    const weekHearings = hearings.filter(
      (h) => !h.done && daysUntil(h.date) >= 0 && daysUntil(h.date) <= 7,
    ).length;
    const dueAmount = invoices
      .filter((i) => ["مرسلة", "متأخرة"].includes(effectiveInvoiceStatus(i)))
      .reduce((s, i) => s + i.amount * (1 + VAT_RATE), 0);
    const expiringPoa = poas.filter(
      (p) => daysUntil(p.expiry) <= 60 && daysUntil(p.expiry) >= 0,
    ).length;
    return { active, weekHearings, dueAmount, expiringPoa };
  }, [cases, hearings, invoices, poas]);

  const CASE_TYPE_PALETTE: Record<string, string> = {
    مدني: "#d97706",
    تجاري: "#2563eb",
    عمالي: "#059669",
    جزائي: "#dc2626",
    "أحوال شخصية": "#7c3aed",
    عقاري: "#0891b2",
    إيجاري: "#b45309",
    إداري: "#475569",
    تنفيذ: "#4f46e5",
    تحكيم: "#be185d",
  };

  const casesByType = useMemo(() => {
    const m: Record<string, number> = {};
    cases.forEach((c) => {
      const typeName = c.type || "غير محدد";
      m[typeName] = (m[typeName] || 0) + 1;
    });
    const total = cases.length || 1;
    const palette = [
      "#d97706",
      "#2563eb",
      "#059669",
      "#7c3aed",
      "#dc2626",
      "#0891b2",
      "#b45309",
      "#475569",
      "#4f46e5",
      "#be185d",
    ];

    const allItems = Object.entries(m)
      .map(([name, value], idx) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
        color: CASE_TYPE_PALETTE[name] || palette[idx % palette.length],
      }))
      .sort((a, b) => b.value - a.value);

    // Group small slices into 'أخرى' (Others) to prevent chart clutter
    if (allItems.length > 7) {
      const top = allItems.slice(0, 6);
      const rest = allItems.slice(6);
      const restValue = rest.reduce((sum, item) => sum + item.value, 0);
      top.push({
        name: "أخرى",
        value: restValue,
        percentage: Math.round((restValue / total) * 100),
        color: "#94a3b8",
      });
      return top;
    }
    return allItems;
  }, [cases]);

  const invoiceMetrics = useMemo(() => {
    let totalInvoiced = 0;
    let paidAmount = 0;
    let sentDueAmount = 0;
    let overdueAmount = 0;
    let draftAmount = 0;
    const countMap: Record<string, number> = { مدفوعة: 0, مرسلة: 0, متأخرة: 0, مسودة: 0 };
    const amountMap: Record<string, number> = { مدفوعة: 0, مرسلة: 0, متأخرة: 0, مسودة: 0 };

    invoices.forEach((i) => {
      const val = i.amount * (1 + VAT_RATE);
      const st = effectiveInvoiceStatus(i);
      totalInvoiced += val;
      if (countMap[st] !== undefined) {
        countMap[st] += 1;
        amountMap[st] += val;
      }
      if (st === "مدفوعة") paidAmount += val;
      else if (st === "مرسلة") sentDueAmount += val;
      else if (st === "متأخرة") overdueAmount += val;
      else if (st === "مسودة") draftAmount += val;
    });

    const collectionRate = totalInvoiced > 0 ? Math.round((paidAmount / totalInvoiced) * 100) : 0;
    const colors: Record<string, string> = {
      مدفوعة: "#059669",
      مرسلة: "#0284c7",
      متأخرة: "#dc2626",
      مسودة: "#94a3b8",
    };

    const summaryByAmount = Object.entries(amountMap).map(([name, value]) => ({
      name,
      value: Math.round(value),
      count: countMap[name] || 0,
      color: colors[name] || "#94a3b8",
      percentage: totalInvoiced > 0 ? Math.round((value / totalInvoiced) * 100) : 0,
    }));

    const summaryByCount = Object.entries(countMap).map(([name, value]) => ({
      name,
      value,
      amount: Math.round(amountMap[name] || 0),
      color: colors[name] || "#94a3b8",
      percentage: invoices.length > 0 ? Math.round((value / (invoices.length || 1)) * 100) : 0,
    }));

    return {
      totalInvoiced,
      paidAmount,
      sentDueAmount,
      overdueAmount,
      draftAmount,
      collectionRate,
      summaryByAmount,
      summaryByCount,
      totalCount: invoices.length,
    };
  }, [invoices]);

  const invoiceSummary = useMemo(() => {
    return invoiceMetrics.summaryByAmount;
  }, [invoiceMetrics]);

  const PIE_COLORS = ["#059669", "#0284c7", "#dc2626", "#94a3b8"];

  const tasksMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.done).length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => !t.done && daysUntil(t.due) < 0).length;
    const dueToday = tasks.filter((t) => !t.done && daysUntil(t.due) === 0).length;
    const inProgress = Math.max(0, pending - overdue - dueToday);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityCounts: Record<string, { total: number; done: number }> = {
      عالية: { total: 0, done: 0 },
      متوسطة: { total: 0, done: 0 },
      منخفضة: { total: 0, done: 0 },
    };

    tasks.forEach((t) => {
      if (priorityCounts[t.priority]) {
        priorityCounts[t.priority].total += 1;
        if (t.done) priorityCounts[t.priority].done += 1;
      }
    });

    const statusChartData = [
      {
        name: "مهام منجزة",
        value: completed,
        color: "#059669",
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      {
        name: "جارية بالموعد",
        value: inProgress,
        color: "#2563eb",
        percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      },
      {
        name: "مستحقة اليوم",
        value: dueToday,
        color: "#d97706",
        percentage: total > 0 ? Math.round((dueToday / total) * 100) : 0,
      },
      {
        name: "متأخرة",
        value: overdue,
        color: "#dc2626",
        percentage: total > 0 ? Math.round((overdue / total) * 100) : 0,
      },
    ].filter((item) => item.value > 0);

    const priorityChartData = [
      {
        name: "عالية",
        منجزة: priorityCounts["عالية"].done,
        معلقة: priorityCounts["عالية"].total - priorityCounts["عالية"].done,
        total: priorityCounts["عالية"].total,
      },
      {
        name: "متوسطة",
        منجزة: priorityCounts["متوسطة"].done,
        معلقة: priorityCounts["متوسطة"].total - priorityCounts["متوسطة"].done,
        total: priorityCounts["متوسطة"].total,
      },
      {
        name: "منخفضة",
        منجزة: priorityCounts["منخفضة"].done,
        معلقة: priorityCounts["منخفضة"].total - priorityCounts["منخفضة"].done,
        total: priorityCounts["منخفضة"].total,
      },
    ];

    return {
      total,
      completed,
      pending,
      overdue,
      dueToday,
      inProgress,
      completionRate,
      statusChartData,
      priorityChartData,
    };
  }, [tasks]);

  // ---------- نماذج الإضافة والحفظ ----------
  const [form, setForm] = useState<Record<string, any>>({});
  const openModalWithCheck = (kind: string, permKey?: keyof RolePermissions) => {
    if (permKey && !checkPerm(permKey, kind)) return;
    if (kind === "case") setEditingCase(null); // التأكد من فتح نافذة "قضية جديدة" وليس تعديل قضية سابقة عالقة بالحالة
    setForm({});
    setModal(kind);
  };

  const f =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleDeduplicateCasesManual = () => {
    if (!checkPerm("manageCases", "دمج/حذف القضايا المكررة")) return;
    const beforeCount = cases.length;
    const cleaned = deduplicateCases(cases);
    setCases(cleaned);
    saveStorage("firm_cases", cleaned);
    const removedCount = beforeCount - cleaned.length;
    if (removedCount > 0) {
      alert(
        `تم بنجاح فحص وتنظيف القضايا المكررة وإزالة ${removedCount} سجل مكرر! العدد الحالي الآن: ${cleaned.length} قضية فريدة وموثقة.`,
      );
      logAuditAction(
        "DELETE",
        "القضايا",
        "إزالة التكرار",
        `تم حذف ${removedCount} قضية مكررة بنجاح`,
        0,
      );
    } else {
      alert(
        `سجلات القضايا سليمة ومدققة تماماً ولا يوجد أي تكرار (${cleaned.length} قضية فريدة ومسجلة).`,
      );
    }
  };

  const saveCase = () => {
    if (!checkPerm("manageCases", editingCase ? "تعديل قضية" : "إضافة قضية")) return;
    if (!form.number || !form.clientId) return;

    const normNum = normalizeCaseNumberKey(form.number);
    // عند التعديل، نستثني القضية نفسها من فحص تكرار رقم الملف حتى يمكن حفظها بدون تغيير رقمها
    const existing = cases.find(
      (c) => normalizeCaseNumberKey(c.number) === normNum && c.id !== editingCase?.id,
    );
    if (existing) {
      alert(
        `تنبيه: يوجد قضية مسجلة مسبقاً بنفس رقم الملف/الدعوى (${form.number}) بالرقم التعريفي #${existing.id}. يرجى التحقق من الرقم لمنع تكرار القضايا.`,
      );
      return;
    }

    const openDate = form.openDate || todayISO();
    const stage = form.stage || "الابتدائية";
    const status = form.status || "متداولة";
    const opponents: string[] = (form.opponents || [])
      .map((o: string) => (o || "").trim())
      .filter(Boolean);
    if (!editingCase) {
      const newClientNameForConflict = clientName(+form.clientId);
      const conflictReasons: string[] = [];
      cases.forEach((c) => {
        if (
          (c.opponents || []).some(
            (o) => o.trim().toLowerCase() === newClientNameForConflict.trim().toLowerCase(),
          )
        ) {
          conflictReasons.push(
            `الموكل الجديد "${newClientNameForConflict}" كان خصماً سابقاً في القضية رقم ${c.number}`,
          );
        }
      });
      opponents.forEach((opp) => {
        const oppAsClient = clients.find(
          (cl) => cl.name.trim().toLowerCase() === opp.trim().toLowerCase(),
        );
        if (oppAsClient) {
          conflictReasons.push(`الخصم "${opp}" مسجل كموكل حالي للمكتب (${oppAsClient.name})`);
        }
      });
      if (conflictReasons.length > 0) {
        const proceedDespiteConflict = window.confirm(
          `⚠️ تنبيه تضارب مصالح محتمل: ${conflictReasons.join(" — ")} — هذا قد يشكل تضارب مصالح يستوجب مراجعة قانونية/أخلاقية قبل قبول الوكالة. هل تريد المتابعة رغم ذلك على مسؤوليتك؟`,
        );
        if (!proceedDespiteConflict) {
          return;
        }
        logAuditAction(
          "CREATE",
          "تضارب المصالح",
          `تنبيه عند فتح قضية جديدة رقم ${form.number}`,
          `تم المتابعة بفتح قضية رقم ${form.number} رغم تنبيه تضارب مصالح محتمل: ${conflictReasons.join(" | ")}`,
          0,
        );
      }
    }

    if (editingCase) {
      setCases((prev) =>
        prev.map((c) =>
          c.id === editingCase.id
            ? {
                ...c,
                number: form.number,
                clientId: +form.clientId,
                opponents,
                type: form.type || c.type,
                court: form.court || c.court,
                judge: form.judge ?? c.judge,
                stage: stage,
                status: status,
                subject: form.subject ?? c.subject,
                // في وضع التعديل: نحافظ على تاريخ القيد كما هو محفوظ (أو كما عدّله المستخدم صراحة عبر الحقل)، ولا نستبدله بتاريخ اليوم تلقائياً
                openDate: form.openDate ?? c.openDate,
                fee: form.fee !== undefined && form.fee !== "" ? +form.fee : c.fee,
                emirate: form.emirate ?? c.emirate,
                clientCapacity: form.clientCapacity ?? c.clientCapacity,
              }
            : c,
        ),
      );
      logAuditAction(
        "UPDATE",
        "القضايا",
        `قضية رقم ${form.number}`,
        `تعديل بيانات القضية رقم ${form.number} (الخصوم، الأطراف، أو التفاصيل الأساسية)`,
        editingCase.id,
      );
      setEditingCase(null);
      setModal(null);
      return;
    }

    const newCaseId = nextId(cases);

    setCases((prev) =>
      deduplicateCases([
        ...prev,
        {
          id: newCaseId,
          number: form.number,
          clientId: +form.clientId,
          opponents,
          type: form.type || CASE_TYPES[0],
          court: form.court || COURTS[0],
          judge: form.judge || "",
          stage: stage,
          status: status,
          subject: form.subject || "",
          openDate: openDate,
          fee: +form.fee || 0,
          emirate: form.emirate || "",
          clientCapacity: form.clientCapacity || "",
        },
      ]),
    );

    if (form.taskTemplate) {
      const template = TASK_TEMPLATES.find((t) => t.id === form.taskTemplate);
      if (template) {
        setTasks((prev) => {
          let currentId = nextId(prev);
          const newTasks = template.tasks.map((t) => ({
            id: currentId++,
            title: t.title,
            caseId: newCaseId,
            assignee: currentUser.name,
            due: addDaysFrom(openDate, t.daysOffset),
            priority: t.priority,
            done: false,
          }));
          return [...prev, ...newTasks];
        });
      }
    }

    setModal(null);
  };

  const saveClient = () => {
    if (!checkPerm("manageClients", "إضافة موكل")) return;
    if (!form.name) return;
    const newClientId = nextId(clients);
    auditNewClientKyc(form.name, form.idNo, newClientId);
    setClients([
      ...clients,
      {
        id: newClientId,
        name: form.name,
        type: form.type || "فرد",
        idNo: form.idNo || "",
        phone: form.phone || "",
        email: form.email || "",
        emirate: form.emirate || "دبي",
        address: form.address || "",
      },
    ]);
    logAuditAction(
      "CREATE",
      "الموكلين والشركات",
      `الموكل: ${form.name}`,
      `إضافة موكل جديد ${form.name} (${form.type || "فرد"})`,
      newClientId,
    );
    setModal(null);
  };

  const saveHearing = () => {
    if (!checkPerm("manageHearings", "جدولة جلسة")) return;
    if (!form.caseId || !form.date) return;
    const newHearingId = nextId(hearings);
    setHearings([
      ...hearings,
      {
        id: newHearingId,
        caseId: +form.caseId,
        date: form.date,
        time: form.time || "09:00",
        type: form.type || HEARING_TYPES[0],
        room: form.room || "",
        notes: form.notes || "",
        done: false,
      },
    ]);
    logAuditAction(
      "CREATE",
      "الجلسات",
      `جلسة بتاريخ ${form.date}`,
      `جدولة جلسة جديدة بتاريخ ${form.date} (${form.type || HEARING_TYPES[0]})`,
      newHearingId,
    );
    setModal(null);
  };

  const saveTask = () => {
    if (!checkPerm("manageTasks", "إضافة مهمة")) return;
    if (!form.title) return;
    const newTaskId = nextId(tasks);
    setTasks([
      ...tasks,
      {
        id: newTaskId,
        title: form.title,
        caseId: form.caseId ? +form.caseId : null,
        assignee: form.assignee || currentUser.name,
        due: form.due || todayISO(),
        priority: form.priority || "متوسطة",
        done: false,
      },
    ]);
    logAuditAction(
      "CREATE",
      "المهام",
      `مهمة: ${form.title}`,
      `إضافة مهمة جديدة: ${form.title}`,
      newTaskId,
    );
    setModal(null);
  };

  const saveInvoice = () => {
    if (!checkPerm("manageInvoices", "إصدار فاتورة")) return;
    if (!form.clientId || !form.amount) return;
    const newInvNumber = nextMainInvoiceNumber(invoices);
    setInvoices([
      ...invoices,
      {
        id: nextId(invoices),
        number: newInvNumber,
        clientId: +form.clientId,
        caseId: form.caseId ? +form.caseId : null,
        date: todayISO(),
        due: form.due || addDays(30),
        amount: +form.amount,
        status: "مسودة",
        desc: form.desc || "",
      },
    ]);
    logAuditAction(
      "CREATE",
      "الفواتير",
      `فاتورة: ${newInvNumber}`,
      `إصدار فاتورة جديدة ${newInvNumber} للموكل ${clientName(+form.clientId)} بمبلغ ${+form.amount}`,
      +form.clientId,
    );
    setModal(null);
  };

  // تحديث حالة الفاتورة يدوياً (مسودة → مرسلة → مدفوعة) - بدون هذا كانت كل فاتورة تُنشأ تبقى "مسودة" للأبد
  // لأن ما كان فيه أي آلية بالنظام لتغيير حالتها، مما يعطّل كل إحصائيات وتنبيهات "الفواتير المتأخرة"
  const setInvoiceStatus = (invId: number, newStatus: string) => {
    if (!checkPerm("manageInvoices", "تحديث حالة الفاتورة")) return;
    const inv = invoices.find((i) => i.id === invId);
    if (!inv) return;
    setInvoices((prev) => prev.map((i) => (i.id === invId ? { ...i, status: newStatus } : i)));
    logAuditAction(
      "STATUS_CHANGE",
      "الفواتير",
      `فاتورة: ${inv.number}`,
      `تحديث حالة الفاتورة ${inv.number} للموكل ${clientName(inv.clientId)} من "${inv.status}" إلى "${newStatus}"`,
      inv.id,
    );
  };

  const saveEmployee = async () => {
    if (!checkPerm("manageEmployees", "حفظ بيانات الموظف")) return;
    if (!form.fullName || !form.email) return;
    const isEdit = Boolean(form.id);
    const empId = form.id || `emp-${Date.now()}`;
    const newEmp: Employee = {
      id: empId,
      fullName: form.fullName,
      jobTitle: form.jobTitle || "مستشار قانوني",
      email: form.email,
      phone: form.phone || "",
      passportNumber: form.passportNumber || "",
      emiratesId: form.emiratesId || "",
      idExpiryDate: form.idExpiryDate || "",
      licenseNumber: form.licenseNumber || "",
      basicSalary: Number(form.basicSalary) || 0,
      housingAllowance: Number(form.housingAllowance) || 0,
      transportAllowance: Number(form.transportAllowance) || 0,
      joinDate: form.joinDate || todayISO(),
      status: form.status || "ACTIVE",
      createdAt: form.createdAt || todayISO(),
    };

    if (isEdit) {
      setEmployees(employees.map((e) => (e.id === empId ? newEmp : e)));
    } else {
      setEmployees([...employees, newEmp]);
    }
    logAuditAction(
      isEdit ? "UPDATE" : "CREATE",
      "الكادر والرواتب HR",
      `الموظف: ${newEmp.fullName}`,
      isEdit
        ? `تحديث بيانات الموظف ${newEmp.fullName} (الراتب الأساسي: ${newEmp.basicSalary})`
        : `إضافة موظف جديد ${newEmp.fullName} (${newEmp.jobTitle})`,
      empId,
    );

    try {
      await supabase.from("employees").upsert([
        {
          id: empId.startsWith("emp-") ? undefined : empId,
          full_name: newEmp.fullName,
          job_title: newEmp.jobTitle,
          email: newEmp.email,
          phone: newEmp.phone,
          passport_number: newEmp.passportNumber,
          emirates_id: newEmp.emiratesId,
          id_expiry_date: newEmp.idExpiryDate || null,
          license_number: newEmp.licenseNumber || null,
          basic_salary: newEmp.basicSalary,
          housing_allowance: newEmp.housingAllowance,
          transport_allowance: newEmp.transportAllowance,
          join_date: newEmp.joinDate,
          status: newEmp.status,
        },
      ]);
    } catch (e) {}

    setModal(null);
  };

  const deleteEmployee = async (empId: string) => {
    const targetEmp = employees.find((e) => e.id === empId);
    if (!targetEmp) return;
    requestDelete({
      section: "الكادر والموظفون HR",
      title: `الموظف: ${targetEmp.fullName}`,
      details: `المسمى الوظيفي: ${targetEmp.jobTitle || "—"} | الراتب الأساسي: ${fmtAED(targetEmp.basicSalary || 0)}`,
      permKey: "deleteEmployees",
      actionName: "حذف موظف من الكادر",
      onConfirm: async () => {
        logAuditAction(
          "DELETE",
          "الكادر والرواتب HR",
          `الموظف: ${targetEmp.fullName || empId}`,
          `حذف سجّل الموظف ${targetEmp.fullName || empId} (${targetEmp.jobTitle || ""}) من كادر العمل`,
          empId,
        );
        setEmployees(employees.filter((e) => e.id !== empId));
        try {
          await supabase.from("employees").delete().eq("id", empId);
        } catch (e) {}
      },
    });
  };

  // ---------- سجل الإجراءات التأديبية السري (تحقيق / إنذار / قرار) — إضافة وحذف مقتصرة على الحساب الرئيسي فقط ----------
  const saveDisciplinaryAction = () => {
    if (!isSuperAdmin) return;
    if (!form.employeeId || !form.subject) return;
    const emp = employees.find((e) => e.id === form.employeeId);
    const newAction: EmployeeDisciplinaryAction = {
      id: nextId(disciplinaryActions),
      employeeId: form.employeeId,
      employeeName: emp?.fullName || "موظف",
      type: form.type || "تحقيق داخلي",
      actionDate: form.actionDate || todayISO(),
      subject: form.subject,
      details: form.details || "",
      attachmentRef: form.attachmentRef || "",
      createdAt: todayISO(),
      createdBy: currentUser?.name,
    };
    setDisciplinaryActions((prev) => [newAction, ...prev]);
    logAuditAction(
      "CREATE",
      "الإجراءات التأديبية السرية",
      `${newAction.type}: ${newAction.employeeName}`,
      `تسجيل إجراء (${newAction.type}) بحق الموظف ${newAction.employeeName} — الموضوع: ${newAction.subject}`,
      newAction.id,
      "مؤكد",
    );
    setModal(null);
  };

  const deleteDisciplinaryAction = (actionId: number) => {
    if (!isSuperAdmin) return;
    const target = disciplinaryActions.find((a) => a.id === actionId);
    if (!target) return;
    requestDelete({
      section: "الإجراءات التأديبية السرية",
      title: `${target.type}: ${target.employeeName}`,
      details: `الموضوع: ${target.subject}`,
      targetId: target.id,
      permKey: "deleteEmployees",
      actionName: "حذف إجراء تأديبي سري",
      onConfirm: () => {
        logAuditAction(
          "DELETE",
          "الإجراءات التأديبية السرية",
          `${target.type}: ${target.employeeName}`,
          `حذف سجل إجراء (${target.type}) الخاص بالموظف ${target.employeeName} — الموضوع: ${target.subject}`,
          target.id,
          "مؤكد",
        );
        setDisciplinaryActions((prev) => prev.filter((a) => a.id !== actionId));
      },
    });
  };

  const saveLeaveRequest = async () => {
    if (!form.employeeId || !form.startDate || !form.endDate) return;
    const emp = employees.find((e) => e.id === form.employeeId);
    // السماح بتقديم طلب إجازة عن النفس دائماً، أو عن موظف آخر فقط لمن يملك صلاحية إدارة الموظفين —
    // بدون هذا الشرط كان أي مستخدم مسجّل دخول يقدر يختار أي موظف آخر ويقدّم طلبات نيابة عنه.
    const isOwnRecord =
      !!emp?.email &&
      !!currentUser?.email &&
      emp.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
    if (!isOwnRecord && !checkPerm("manageEmployees", "تقديم طلب إجازة نيابة عن موظف آخر")) return;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1,
    );

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: form.employeeId,
      employeeName: emp?.fullName || "موظف",
      leaveType: form.leaveType || "ANNUAL",
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays: diffDays,
      reason: form.reason || "",
      status: "PENDING",
      createdAt: todayISO(),
    };

    setLeaveRequests([newLeave, ...leaveRequests]);

    try {
      await supabase.from("leave_requests").insert([
        {
          employee_id: newLeave.employeeId.startsWith("emp-") ? null : newLeave.employeeId,
          leave_type: newLeave.leaveType,
          start_date: newLeave.startDate,
          end_date: newLeave.endDate,
          total_days: newLeave.totalDays,
          reason: newLeave.reason,
          status: "PENDING",
        },
      ]);
    } catch (e) {}

    logAuditAction(
      "CREATE",
      "الكادر والرواتب HR",
      `طلب إجازة: ${newLeave.employeeName}`,
      `تقديم طلب إجازة جديد (${newLeave.leaveType}) لمدة ${newLeave.totalDays} يوم`,
      newLeave.id,
    );
    setModal(null);
  };

  const updateLeaveStatus = async (leaveId: string, newStatus: "APPROVED" | "REJECTED") => {
    if (!checkPerm("manageEmployees", "اعتماد/رفض طلب إجازة")) return;
    const targetLeave = leaveRequests.find((l) => l.id === leaveId);
    setLeaveRequests(
      leaveRequests.map((l) =>
        l.id === leaveId ? { ...l, status: newStatus, approvedBy: currentUser.name } : l,
      ),
    );
    logAuditAction(
      "STATUS_CHANGE",
      "الكادر والرواتب HR",
      `طلب إجازة: ${targetLeave?.employeeName || leaveId}`,
      `${newStatus === "APPROVED" ? "اعتماد" : "رفض"} طلب إجازة الموظف ${targetLeave?.employeeName || ""} (${targetLeave?.leaveType || ""}, ${targetLeave?.totalDays || 0} يوم)`,
      leaveId,
    );
    try {
      await supabase.from("leave_requests").update({ status: newStatus }).eq("id", leaveId);
    } catch (e) {}
  };

  const saveEmployeeExpense = async () => {
    if (!form.employeeId || !form.amount) return;
    const emp = employees.find((e) => e.id === form.employeeId);
    // نفس مبدأ طلب الإجازة: تقديم مصروف عن النفس مسموح دائماً، وعن موظف آخر يتطلب صلاحية إدارة الموظفين
    const isOwnExpenseRecord =
      !!emp?.email &&
      !!currentUser?.email &&
      emp.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
    if (!isOwnExpenseRecord && !checkPerm("manageEmployees", "تقديم طلب مصروف نيابة عن موظف آخر"))
      return;

    const newExp: EmployeeExpense = {
      id: `exp-${Date.now()}`,
      employeeId: form.employeeId,
      employeeName: emp?.fullName || "موظف",
      caseId: form.caseId ? Number(form.caseId) : null,
      amount: Number(form.amount) || 0,
      category: form.category || "COURT_FEES",
      receiptUrl: form.receiptUrl || "",
      status: "PENDING",
      createdAt: todayISO(),
    };

    setEmployeeExpenses([newExp, ...employeeExpenses]);

    try {
      await supabase.from("employee_expenses").insert([
        {
          employee_id: newExp.employeeId.startsWith("emp-") ? null : newExp.employeeId,
          case_id: newExp.caseId || null,
          amount: newExp.amount,
          category: newExp.category,
          receipt_url: newExp.receiptUrl,
          status: "PENDING",
        },
      ]);
    } catch (e) {}

    logAuditAction(
      "CREATE",
      "الكادر والرواتب HR",
      `مصروف: ${newExp.employeeName}`,
      `تقديم طلب مصروف جديد بمبلغ ${newExp.amount} (${newExp.category})`,
      newExp.id,
    );
    setModal(null);
  };

  const updateExpenseStatus = async (expId: string, newStatus: "PAID" | "REJECTED") => {
    if (!checkPerm("manageEmployees", "اعتماد/رفض مصروف موظف")) return;
    const targetExp = employeeExpenses.find((x) => x.id === expId);
    setEmployeeExpenses(
      employeeExpenses.map((x) => (x.id === expId ? { ...x, status: newStatus } : x)),
    );
    logAuditAction(
      "STATUS_CHANGE",
      "الكادر والرواتب HR",
      `مصروف: ${targetExp?.employeeName || expId}`,
      `${newStatus === "PAID" ? "اعتماد صرف" : "رفض"} مصروف الموظف ${targetExp?.employeeName || ""} بمبلغ ${targetExp?.amount || 0} (${targetExp?.category || ""})`,
      expId,
    );
    try {
      await supabase.from("employee_expenses").update({ status: newStatus }).eq("id", expId);
    } catch (e) {}
  };

  // ---------- حسابات اتفاقيات الأتعاب والدفعات ----------
  const getPaidForAgreement = (agreementId: number) => {
    return payments
      .filter((p) => p.feeAgreementId === agreementId)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getRemainingForAgreement = (agreement: FeeAgreement) => {
    const paid = getPaidForAgreement(agreement.id);
    return Math.max(0, agreement.totalAmount - paid);
  };

  const isAgreementFullyPaid = (agreement: FeeAgreement) => {
    if (agreement.status === "مسددة بالكامل") return true;
    return getRemainingForAgreement(agreement) <= 0;
  };

  const getClientUnallocatedBalance = (clientId: number) => {
    return payments
      .filter(
        (p) =>
          p.clientId === clientId &&
          (p.feeAgreementId === "unallocated" ||
            p.feeAgreementId === null ||
            p.feeAgreementId === undefined),
      )
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const savePayment = () => {
    if (!checkPerm("manageInvoices", "تسجيل دفعة")) return;
    if (!form.clientId) {
      alert("يرجى اختيار الموكل أولاً");
      return;
    }
    const amt = +form.amount;
    if (!amt || amt <= 0) {
      alert("يرجى إدخال مبلغ صحيح للدفعة");
      return;
    }

    const clientId = +form.clientId;
    const isUnallocated = !form.feeAgreementId || form.feeAgreementId === "unallocated";

    if (!isUnallocated) {
      const agrId = +form.feeAgreementId;
      const agr = feeAgreements.find((a) => a.id === agrId);
      if (!agr) {
        alert("اتفاقية الأتعاب المحددة غير موجودة");
        return;
      }

      // امنع تسجيل دفعة على اتفاقية مسددة بالكامل
      if (agr.status === "مسددة بالكامل" || isAgreementFullyPaid(agr)) {
        alert("⚠️ لا يمكن تسجيل دفعة على اتفاقية مسددة بالكامل!");
        return;
      }

      const remaining = getRemainingForAgreement(agr);
      if (remaining <= 0) {
        alert(
          "⚠️ اتفقاقة الأتعاب مسددة بالكامل (المتبقي: 0 د.إ)، لا يمكن إضافة دفعات جديدة عليها.",
        );
        return;
      }

      const newPayment: PaymentReceipt = {
        id: nextId(payments),
        clientId,
        caseId: agr.caseId || (form.caseId ? +form.caseId : null),
        feeAgreementId: agrId,
        invoiceId: form.invoiceId ? +form.invoiceId : null,
        amount: amt,
        date: form.date || todayISO(),
        paymentMethod: form.paymentMethod || "تحويل بنكي",
        referenceNo: form.referenceNo || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: form.notes || "",
      };

      setPayments((prev) => [...prev, newPayment]);
      logAuditAction(
        "CREATE",
        "المدفوعات",
        `دفعة: ${newPayment.referenceNo}`,
        `تسجيل دفعة بمبلغ ${amt} من الموكل ${clientName(clientId)} (المرجع: ${newPayment.referenceNo})`,
        newPayment.id,
      );

      // تحديث حالة الاتفاقية إذا سددت بالكامل
      const totalPaidAfter = getPaidForAgreement(agr.id) + amt;
      if (totalPaidAfter >= agr.totalAmount) {
        setFeeAgreements((prev) =>
          prev.map((a) => (a.id === agr.id ? { ...a, status: "مسددة بالكامل" } : a)),
        );
      }
    } else {
      // دفعة غير مخصصة — تنحفظ برصيد معلّق للموكل
      const newPayment: PaymentReceipt = {
        id: nextId(payments),
        clientId,
        caseId: form.caseId ? +form.caseId : null,
        feeAgreementId: "unallocated",
        invoiceId: form.invoiceId ? +form.invoiceId : null,
        amount: amt,
        date: form.date || todayISO(),
        paymentMethod: form.paymentMethod || "تحويل بنكي",
        referenceNo: form.referenceNo || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: form.notes || "دفعة غير مخصصة — رصيد معلّق للموكل",
      };

      setPayments((prev) => [...prev, newPayment]);
      logAuditAction(
        "CREATE",
        "المدفوعات",
        `دفعة: ${newPayment.referenceNo}`,
        `تسجيل دفعة بمبلغ ${amt} من الموكل ${clientName(clientId)} (المرجع: ${newPayment.referenceNo})`,
        newPayment.id,
      );
    }

    setModal(null);
  };

  const saveDoc = () => {
    if (!checkPerm("manageDocs", "رفع مستند")) return;
    if (!form.name) return;
    const newDocId = nextId(docs);
    setDocs([
      ...docs,
      {
        id: newDocId,
        name: form.name,
        type: form.type || DOC_TYPES[0],
        caseId: form.caseId ? +form.caseId : null,
        date: todayISO(),
        by: currentUser.name,
      },
    ]);
    logAuditAction(
      "CREATE",
      "المستندات",
      `مستند: ${form.name}`,
      `رفع مستند جديد: ${form.name} (${form.type || DOC_TYPES[0]})`,
      newDocId,
    );
    setModal(null);
  };

  const saveKyc = () => {
    if (!checkPerm("manageKyc", "حفظ استمارة اعرف عميلك KYC")) return;
    if (!form.clientId) return;
    const rec = {
      clientId: +form.clientId,
      nationality: form.nationality || "الإمارات",
      idType: form.idType || "هوية إماراتية",
      idExpiry: form.idExpiry || addDays(365),
      ubo: form.ubo || "—",
      sourceOfFunds: form.sourceOfFunds || FUND_SOURCES[0],
      pep: form.pep === true || form.pep === "نعم",
      sanctions: form.sanctions || "قيد التحقق",
      risk: form.risk || "متوسط",
      status: form.status || "قيد المراجعة",
      lastReview: form.lastReview || todayISO(),
      notes: form.notes || "",
    };
    const isKycEdit = modal === "kyc-edit" && form.id;
    if (isKycEdit) {
      setKyc(kyc.map((x) => (x.id === form.id ? { ...x, ...rec } : x)));
    } else {
      setKyc([...kyc, { id: nextId(kyc), ...rec }]);
    }
    logAuditAction(
      isKycEdit ? "UPDATE" : "CREATE",
      "الامتثال KYC",
      `ملف KYC للموكل: ${clientName(rec.clientId)}`,
      isKycEdit
        ? `تحديث استمارة KYC للموكل ${clientName(rec.clientId)} (الفحص: ${rec.sanctions}, المخاطر: ${rec.risk})`
        : `إنشاء استمارة KYC جديدة للموكل ${clientName(rec.clientId)} (الفحص: ${rec.sanctions}, المخاطر: ${rec.risk})`,
      rec.clientId,
    );
    setModal(null);
  };

  const savePoa = () => {
    if (!checkPerm("manageDocs", "إضافة توكيل")) return;
    if (!form.clientId || !form.number) return;

    const poaNum = form.number.trim();
    if (!poaNum) return;

    if (poas.some((p) => p.number.trim().toLowerCase() === poaNum.toLowerCase())) {
      alert(
        `تنبيه: رقم الوكالة "${poaNum}" مسجل مسبقاً في قاعدة البيانات!\nيرجى التثبت من رقم الوكالة لمنع التكرار.`,
      );
      return;
    }

    const newPoaId = nextId(poas);
    setPoas([
      ...poas,
      {
        id: newPoaId,
        clientId: +form.clientId,
        number: poaNum,
        issuer: form.issuer || "كاتب العدل - دبي",
        issue: form.issue || todayISO(),
        expiry: form.expiry || addDays(730),
        scope: form.scope || "",
      },
    ]);
    logAuditAction(
      "CREATE",
      "التوكيلات",
      `توكيل رقم: ${poaNum}`,
      `إضافة توكيل جديد رقم ${poaNum} للموكل ${clientName(+form.clientId)}`,
      newPoaId,
    );
    setModal(null);
  };

  // ---------- الزملاء المتعاونون وإنابات الحضور ----------
  const openColleagueModal = (c?: Colleague) => {
    if (!checkPerm("manageColleagues", c ? "تعديل بيانات زميل" : "إضافة زميل")) return;
    if (c) {
      setEditingColleagueId(c.id);
      setForm({ ...c });
    } else {
      setEditingColleagueId(null);
      setForm({ status: "متاح" });
    }
    setModal("colleague");
  };

  const saveColleague = () => {
    if (!checkPerm("manageColleagues", "حفظ بيانات الزميل")) return;
    if (!form.name || !form.phone) return;

    if (editingColleagueId) {
      setColleagues((prev) =>
        prev.map((c) =>
          c.id === editingColleagueId
            ? {
                ...c,
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email?.trim() || undefined,
                specialization: form.specialization?.trim() || undefined,
                coverageArea: form.coverageArea?.trim() || undefined,
                notes: form.notes?.trim() || undefined,
                status: form.status === "غير متاح" ? "غير متاح" : "متاح",
                licenseNumber: form.licenseNumber?.trim() || undefined,
              }
            : c,
        ),
      );
      logAuditAction(
        "UPDATE",
        "الزملاء والإنابات",
        `الزميل: ${form.name}`,
        `تعديل بيانات الزميل المتعاون ${form.name}`,
      );
    } else {
      const newColleague: Colleague = {
        id: nextId(colleagues),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || undefined,
        specialization: form.specialization?.trim() || undefined,
        coverageArea: form.coverageArea?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        status: form.status === "غير متاح" ? "غير متاح" : "متاح",
        licenseNumber: form.licenseNumber?.trim() || undefined,
        addedBy: currentUser?.name,
        createdAt: new Date().toISOString(),
      };
      setColleagues((prev) => [...prev, newColleague]);
      logAuditAction(
        "CREATE",
        "الزملاء والإنابات",
        `الزميل: ${newColleague.name}`,
        `إضافة زميل متعاون جديد: ${newColleague.name} (${newColleague.phone})`,
      );
    }
    setModal(null);
    setEditingColleagueId(null);
  };

  const deleteColleagueHandler = (c: Colleague) => {
    requestDelete({
      section: "الزملاء والإنابات",
      title: `الزميل: ${c.name}`,
      details: `الهاتف: ${c.phone}${c.specialization ? " | التخصص: " + c.specialization : ""}`,
      permKey: "deleteColleagues",
      actionName: "حذف بيانات الزميل",
      onConfirm: () => {
        logAuditAction(
          "DELETE",
          "الزملاء والإنابات",
          `الزميل: ${c.name}`,
          `حذف بيانات الزميل المتعاون ${c.name}`,
          c.id,
        );
        setColleagues((prev) => prev.filter((x) => x.id !== c.id));
      },
    });
  };

  const openIssueDelegationModal = (c: Colleague) => {
    if (!checkPerm("manageColleagues", "إصدار إنابة حضور")) return;
    setForm({
      colleagueId: c.id,
      colleagueLicenseNumber: c.licenseNumber || "",
      issuerLicenseNumber: currentUser?.licenseNumber || "",
    });
    setModal("issueDelegation");
  };

  const issueDelegation = () => {
    if (!checkPerm("manageColleagues", "إصدار إنابة حضور")) return;
    if (!form.colleagueId || !form.purpose) return;

    const year = new Date().getFullYear();
    const colleague = colleagues.find((c) => c.id === +form.colleagueId);

    // نحسب الرقم المرجعي ونضيف السجل داخل نفس دالة تحديث الحالة (setState functional updater)
    // معتمدين على "prev" الفعلية لحظة التنفيذ بدل قيمة colleagueDelegations من الإغلاق (closure) —
    // هذا يمنع تكرار نفس الرقم المرجعي لو صدرت إنابتان بسرعة قبل اكتمال إعادة الرسم (race condition).
    let issuedDelegation: ColleagueDelegation | null = null;
    setColleagueDelegations((prev) => {
      const seq =
        prev
          .filter((d) => d.refNo.startsWith(`INB-${year}-`))
          .map((d) => parseInt(d.refNo.slice(`INB-${year}-`.length), 10))
          .filter((n) => !isNaN(n))
          .reduce((m, n) => Math.max(m, n), 0) + 1;
      const refNo = `INB-${year}-${String(seq).padStart(3, "0")}`;
      const newDelegation: ColleagueDelegation = {
        id: nextId(prev),
        refNo,
        colleagueId: +form.colleagueId,
        caseId: form.caseId ? +form.caseId : undefined,
        hearingId: form.hearingId ? +form.hearingId : undefined,
        caseTitleSnapshot: form.caseTitleSnapshot?.trim() || undefined,
        purpose: form.purpose.trim(),
        issuedByName: currentUser?.name || "مكتب سعود أحمد الشحي",
        issuedAt: new Date().toISOString(),
        status: "صادرة",
        sessionDate: form.sessionDate?.trim() || undefined,
        issuerLicenseNumber: form.issuerLicenseNumber?.trim() || undefined,
        colleagueLicenseNumber: form.colleagueLicenseNumber?.trim() || undefined,
      };
      issuedDelegation = newDelegation;
      return [newDelegation, ...prev];
    });

    if (issuedDelegation) {
      const d = issuedDelegation as ColleagueDelegation;
      logAuditAction(
        "CREATE",
        "الزملاء والإنابات",
        `إنابة رقم: ${d.refNo}`,
        `إصدار إنابة حضور رقم ${d.refNo} للزميل ${colleague?.name || "—"}`,
        d.id,
      );
      setModal(null);
      setDelegationPreviewId(d.id);
    }
  };

  const deleteDelegationHandler = (d: ColleagueDelegation) => {
    const colleague = colleagues.find((c) => c.id === d.colleagueId);
    requestDelete({
      section: "الزملاء والإنابات",
      title: `الإنابة رقم: ${d.refNo}`,
      details: `الزميل: ${colleague?.name || "—"} | الغرض: ${d.purpose}`,
      permKey: "deleteColleagues",
      actionName: "حذف الإنابة الصادرة",
      onConfirm: () => {
        logAuditAction(
          "DELETE",
          "الزملاء والإنابات",
          `إنابة رقم: ${d.refNo}`,
          `حذف الإنابة الصادرة رقم ${d.refNo}`,
          d.id,
        );
        setColleagueDelegations((prev) => prev.filter((x) => x.id !== d.id));
      },
    });
  };

  const saveUser = async () => {
    if (!checkPerm("manageUsers", "إدارة المستخدمين")) return;
    if (!form.name || !form.email) return;
    if (!editingUser && (!form.password || form.password.length < 6)) {
      alert("يجب تعيين كلمة مرور لا تقل عن 6 أحرف عند إنشاء مستخدم جديد.");
      return;
    }

    // نجزّئ (hash) كلمة المرور الجديدة/المُغيّرة قبل تخزينها — لا نخزّن أي كلمة مرور كنص عادي بعد الآن
    const hashedFormPassword = form.password ? await hashPassword(form.password) : "";

    const rKey = (form.roleKey || "lawyer") as
      "admin" | "supervisor" | "lawyer" | "secretary" | "accountant";
    const preset = ROLE_PRESETS[rKey];
    const userPermissions = form.permissions ? { ...form.permissions } : { ...preset.permissions };

    let updatedList: UserItem[] = [];

    if (editingUser) {
      updatedList = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: form.name,
              email: form.email,
              phone: form.phone || u.phone,
              password: hashedFormPassword || u.password, // إن تُرك حقل كلمة المرور فارغاً تبقى كلمة المرور الحالية كما هي — لا قيمة افتراضية معروفة
              roleKey: rKey,
              roleTitle: form.roleTitle || preset.title,
              status: form.status || u.status,
              permissions: userPermissions,
              canTransferContacts:
                form.canTransferContacts !== undefined
                  ? form.canTransferContacts
                  : u.canTransferContacts,
              canViewAgreements:
                form.canViewAgreements !== undefined ? form.canViewAgreements : u.canViewAgreements,
              canAccessWhatsapp:
                form.canAccessWhatsapp !== undefined ? form.canAccessWhatsapp : u.canAccessWhatsapp,
              canViewFinances:
                form.canViewFinances !== undefined ? form.canViewFinances : u.canViewFinances,
              licenseNumber:
                form.licenseNumber !== undefined ? form.licenseNumber : u.licenseNumber,
            }
          : u,
      );
    } else {
      const newUser: UserItem = {
        id: nextId(users),
        name: form.name,
        email: form.email,
        phone: form.phone || "050-0000000",
        password: hashedFormPassword, // مطلوب صراحة عند إنشاء مستخدم جديد — تم التحقق أعلاه أنها غير فارغة، ومُخزّنة مُجزّأة (pbkdf2)
        roleKey: rKey,
        roleTitle: form.roleTitle || preset.title,
        status: "نشط",
        avatarBg:
          rKey === "admin"
            ? "bg-amber-500 text-slate-900"
            : rKey === "lawyer"
              ? "bg-indigo-600 text-white"
              : rKey === "accountant"
                ? "bg-emerald-600 text-white"
                : "bg-purple-600 text-white",
        avatarText: form.name.charAt(0),
        permissions: userPermissions,
        canTransferContacts: form.canTransferContacts || false,
        canViewAgreements: form.canViewAgreements || false,
        canAccessWhatsapp: form.canAccessWhatsapp || false,
        canViewFinances: form.canViewFinances || false,
        licenseNumber: form.licenseNumber || "",
      };
      updatedList = [...users, newUser];
    }

    setUsers(updatedList);
    saveStorage("firm_users", updatedList);
    logAuditAction(
      editingUser ? "UPDATE" : "CREATE",
      "المستخدمون والصلاحيات",
      `المستخدم: ${form.name}`,
      editingUser
        ? `تحديث بيانات/صلاحيات المستخدم ${form.name} (${form.email}) - الدور: ${rKey}`
        : `إنشاء حساب مستخدم جديد ${form.name} (${form.email}) - الدور: ${rKey}`,
      editingUser?.id || 0,
    );

    // المزامنة الفورية المباشرة مع جدول public.profiles في Supabase
    try {
      supabase
        .from("profiles")
        .upsert(
          [
            {
              ...(editingUser?.supabaseId ? { id: editingUser.supabaseId } : {}),
              email: form.email.trim().toLowerCase(),
              full_name: form.name,
              phone: form.phone || "050-0000000",
              role: rKey,
              role_title: form.roleTitle || preset.title,
              permissions: userPermissions,
              status: "approved",
            },
          ],
          { onConflict: "email" },
        )
        .then(({ error }) => {
          if (error) console.warn("Supabase profiles update note:", error.message);
        });
    } catch (e) {
      console.warn("Supabase profiles save exception:", e);
    }

    setEditingUser(null);
    setModal(null);
  };

  const toggleUserPermission = (userId: number, permKey: keyof RolePermissions) => {
    if (!checkPerm("manageUsers", "تعديل الصلاحيات")) return;
    const targetUserForAudit = users.find((u) => u.id === userId);
    setUsers((prevUsers) => {
      const updated = prevUsers.map((u) => {
        if (u.id === userId) {
          const currentVal = Boolean(
            hasTabPermission(u, permKey as string) || u.permissions?.[permKey],
          );
          const newPerms: RolePermissions = {
            ...(u.permissions || {}),
            [permKey]: !currentVal,
          } as RolePermissions;

          // المزامنة الفورية المباشرة مع جدول public.profiles في Supabase
          if (u.email) {
            try {
              supabase
                .from("profiles")
                .upsert(
                  [
                    {
                      ...(u.supabaseId ? { id: u.supabaseId } : {}),
                      email: u.email.trim().toLowerCase(),
                      full_name: u.name,
                      permissions: newPerms,
                    },
                  ],
                  { onConflict: "email" },
                )
                .then(({ error }) => {
                  if (error)
                    console.warn("Supabase profile toggle permission note:", error.message);
                });
            } catch (e) {
              console.warn("Supabase profile toggle exception:", e);
            }
          }

          return {
            ...u,
            permissions: newPerms,
          };
        }
        return u;
      });
      saveStorage("firm_users", updated);
      return updated;
    });
    logAuditAction(
      "UPDATE",
      "المستخدمون والصلاحيات",
      `تعديل صلاحية: ${targetUserForAudit?.name || userId}`,
      `تبديل صلاحية "${String(permKey)}" للمستخدم ${targetUserForAudit?.name || userId}`,
      userId,
    );
  };

  const saveTimeLog = () => {
    if (!checkPerm("manageCases", "تسجيل ساعات عمل")) return;
    if (!form.caseId || !form.hours) return;
    const newTimeLogId = nextId(timeLogs);
    setTimeLogs([
      ...timeLogs,
      {
        id: newTimeLogId,
        caseId: +form.caseId,
        lawyerName: form.lawyerName || currentUser.name,
        date: form.date || todayISO(),
        hours: +form.hours,
        hourlyRate: +form.hourlyRate || 750,
        description: form.description || "ساعات مرافعة واستشارات قانونية",
        billed: false,
      },
    ]);
    logAuditAction(
      "CREATE",
      "ساعات العمل",
      `ساعات عمل: ${form.hours} ساعة`,
      `تسجيل ${form.hours} ساعة عمل على القضية`,
      newTimeLogId,
    );
    setModal(null);
  };

  const saveCaseExpense = () => {
    if (!checkPerm("manageCases", "تسجيل مصروف قضية")) return;
    if (!form.caseId || !form.amount) return;
    const newCaseExpenseId = nextId(caseExpenses);
    setCaseExpenses([
      ...caseExpenses,
      {
        id: newCaseExpenseId,
        caseId: +form.caseId,
        date: form.date || todayISO(),
        category: form.category || "رسوم قضائية",
        amount: +form.amount,
        description: form.description || "",
        billable: form.billable !== "لا",
        billed: false,
      },
    ]);
    logAuditAction(
      "CREATE",
      "مصاريف القضايا",
      `مصروف: ${form.amount}`,
      `تسجيل مصروف قضية بمبلغ ${form.amount} (${form.category || "رسوم قضائية"})`,
      newCaseExpenseId,
    );
    setModal(null);
  };

  const saveTrustTransaction = () => {
    if (!checkPerm("manageInvoices", "معاملة حساب أمانة")) return;
    if (!form.clientId || !form.amount) return;
    // (تحسين تسوية الأمانة) تنبيه فوري قبل الحفظ لو أن هذه المعاملة (عادةً صرف) ستجعل رصيد
    // أمانة هذا الموكل سالباً — أي صرف مبلغ يفوق ما هو مودَع فعلياً في أمانته. هذا مؤشر خطير
    // على مستوى الممارسة المهنية (مشابه لمخالفة IOLTA) ويستحق مراجعة يدوية قبل المتابعة، دون
    // منع الحفظ نهائياً لأن قد تكون هناك حالات استثنائية مبررة (تسوية لاحقة، تصحيح قيد سابق...).
    const txType = form.type || "إيداع أمانة";
    const txAmount = +form.amount;
    if (txType !== "إيداع أمانة") {
      const existingForClient = trustTransactions.filter(
        (t) => String(t.clientId) === String(form.clientId),
      );
      const currentBalance = existingForClient.reduce(
        (sum, t) => sum + (t.type === "إيداع أمانة" ? t.amount : -t.amount),
        0,
      );
      const balanceAfter = currentBalance - txAmount;
      if (balanceAfter < -0.01) {
        const clientNameForWarning =
          clients.find((c) => String(c.id) === String(form.clientId))?.name || "";
        const proceed = window.confirm(
          `تنبيه: رصيد أمانة الموكل "${clientNameForWarning}" الحالي هو ${fmtAED(currentBalance)}.\n` +
            `هذه المعاملة (صرف ${fmtAED(txAmount)}) ستجعل الرصيد سالباً (${fmtAED(balanceAfter)})، ` +
            `أي صرف مبلغ يفوق ما هو مودَع فعلياً في أمانة هذا الموكل — وهذا يُعتبر مخالفة جوهرية في إدارة حسابات الأمانة.\n` +
            `هل تريد المتابعة رغم ذلك؟`,
        );
        if (!proceed) return;
        logAuditAction(
          "UPDATE",
          "حساب الأمانات",
          `موكل: ${clientNameForWarning}`,
          `تنبيه: تسجيل معاملة صرف أمانة بمبلغ ${fmtAED(txAmount)} رغم أنها تجعل رصيد الموكل سالباً (${fmtAED(balanceAfter)}) — تمت المتابعة بتأكيد صريح من المستخدم.`,
        );
      }
    }
    const newTrustTxId = nextId(trustTransactions);
    const trustRefNo = form.refNo || `TR-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrustTransactions([
      ...trustTransactions,
      {
        id: newTrustTxId,
        clientId: +form.clientId,
        caseId: form.caseId ? +form.caseId : null,
        date: form.date || todayISO(),
        type: form.type || "إيداع أمانة",
        amount: +form.amount,
        refNo: trustRefNo,
        notes: form.notes || "",
      },
    ]);
    logAuditAction(
      "CREATE",
      "حساب الأمانة",
      `معاملة أمانة: ${trustRefNo}`,
      `تسجيل معاملة حساب أمانة (${form.type || "إيداع أمانة"}) بمبلغ ${form.amount} للموكل ${clientName(+form.clientId)}`,
      newTrustTxId,
    );
    setModal(null);
  };

  // (تحسين تسوية الأمانة) تسجيل تسوية دورية بين رصيد دفاتر المكتب (مجموع كل معاملات الأمانة)
  // وبين رصيد كشف الحساب البنكي الفعلي لحساب الأمانات — ممارسة "three-way reconciliation" لا
  // تُحذف أو تُعدَّل أي تسوية سابقة، بل تُضاف كسجل جديد للحفاظ على أثر تدقيقي كامل.
  const saveTrustReconciliation = (bankStatementBalance: number, notes: string) => {
    if (!checkPerm("manageInvoices", "تسوية حساب الأمانات")) return;
    const bookBalance = trustTransactions.reduce(
      (sum, t) => sum + (t.type === "إيداع أمانة" ? t.amount : -t.amount),
      0,
    );
    const balancesByClient = new Map<string, number>();
    for (const t of trustTransactions) {
      const key = String(t.clientId);
      const prev = balancesByClient.get(key) || 0;
      balancesByClient.set(key, prev + (t.type === "إيداع أمانة" ? t.amount : -t.amount));
    }
    const hadNegativeClientBalances = Array.from(balancesByClient.values()).some(
      (b) => b < -0.01,
    );
    const variance = bankStatementBalance - bookBalance;
    const newId = nextId(trustReconciliations);
    setTrustReconciliations([
      ...trustReconciliations,
      {
        id: newId,
        date: todayISO(),
        bookBalance,
        bankStatementBalance,
        variance,
        reconciledBy: currentUser?.name || currentUser?.email || "غير معروف",
        notes: notes || "",
        hadNegativeClientBalances,
      },
    ]);
    logAuditAction(
      "CREATE",
      "تسوية حساب الأمانات",
      `تسوية بتاريخ ${todayISO()}`,
      `تسوية حساب الأمانات: رصيد الدفاتر ${fmtAED(bookBalance)}، رصيد كشف البنك ${fmtAED(bankStatementBalance)}، الفارق ${fmtAED(variance)}` +
        (Math.abs(variance) >= 0.01 ? " — يوجد فارق يستوجب المراجعة." : " — مطابقة تامة.") +
        (hadNegativeClientBalances ? " تنبيه: يوجد رصيد أمانة سالب لدى موكل واحد أو أكثر." : ""),
      newId,
    );
  };

  const saveDeadline = () => {
    if (!checkPerm("manageCases", "تسجيل موعد حكم/طعن")) return;
    if (!form.caseId || !form.rulingDate) return;
    const days = +form.appealDays || 30;
    const deadlineStr = addDaysFrom(form.rulingDate, days);

    const selUser = users.find((u) => u.id === Number(form.assignedLawyerId)) || users[0];

    const newDeadline: JudgmentDeadline = {
      id: nextId(deadlines),
      caseId: +form.caseId,
      rulingDate: form.rulingDate,
      rulingType: form.rulingType || "حكم ابتدائية",
      caseNature: form.caseNature || "مدني",
      rulingSummary: form.rulingSummary || "صدور حكم قضائي في الدعوى",
      appealDays: days,
      appealDeadlineDate: deadlineStr,
      status: "جارٍ حساب الميعاد",
      notes:
        form.notes ||
        `تم احتساب مهلة الطعن تلقائياً (${days} يوماً) — ${form.caseNature === "جزائي" ? "دعوى جزائية" : "دعوى مدنية/تجارية"}`,
      assignedLawyerId: selUser?.id || 1,
      assignedLawyerName: form.assignedLawyerName || selUser?.name || "المحامي سعود أحمد الشحي",
      assignedLawyerPhone: form.assignedLawyerPhone || selUser?.phone || "0501234567",
      assignedLawyerEmail: form.assignedLawyerEmail || selUser?.email || "info@lawyersuood.com",
      preferredChannel: form.preferredChannel || "both",
      alert7DaysSent: false,
      alert3DaysSent: false,
      autoAlertLogs: [],
    };

    const updatedDeadlines = [...deadlines, newDeadline];
    setDeadlines(updatedDeadlines);
    logAuditAction(
      "CREATE",
      "مواعيد الأحكام والطعون",
      `موعد طعن للقضية #${form.caseId}`,
      `تسجيل حكم بتاريخ ${form.rulingDate} واحتساب مهلة طعن ${days} يوماً (آخر موعد: ${deadlineStr})`,
      newDeadline.id,
    );
    setModal(null);

    runAutoAppealDeadlineChecker(updatedDeadlines);
  };

  const saveStrReport = () => {
    if (!checkPerm("manageStrReports", "تسجيل بلاغ اشتباه STR")) return;
    if (!form.clientId || !form.suspicionReason) return;
    const newStrId = nextId(strReports);
    setStrReports([
      ...strReports,
      {
        id: newStrId,
        clientId: +form.clientId,
        caseId: form.caseId ? +form.caseId : null,
        date: form.date || todayISO(),
        suspicionReason: form.suspicionReason,
        amountFlagged: +form.amountFlagged || 0,
        reportedBy: currentUser.name + " (مسؤول الامتثال)",
        status: form.status || "تحقيق داخلي",
        confidentialNotes: form.confidentialNotes || "",
      },
    ]);
    logAuditAction(
      "CREATE",
      "بلاغات الاشتباه AML/STR",
      `بلاغ اشتباه: ${clientName(+form.clientId)}`,
      `تسجيل بلاغ اشتباه (STR) جديد بخصوص الموكل ${clientName(+form.clientId)} - سبب الاشتباه: ${form.suspicionReason} - المبلغ: ${+form.amountFlagged || 0}`,
      newStrId,
    );
    setModal(null);
  };

  const saveCourtContact = () => {
    if (!form.courtName || !form.department) return;
    if (editingCourtContact) {
      setCourtContacts(
        courtContacts.map((c) =>
          c.id === editingCourtContact.id
            ? {
                ...c,
                courtName: form.courtName,
                emirate: form.emirate || "دبي",
                department: form.department,
                titleOrEmployee: form.titleOrEmployee || "مسؤول التواصل",
                phone: form.phone || "",
                extOrSeal: form.extOrSeal || "",
                email: form.email || "",
                operatingHours: form.operatingHours || "07:30 ص - 02:30 م",
                location: form.location || "",
                notes: form.notes || "",
              }
            : c,
        ),
      );
    } else {
      setCourtContacts([
        ...courtContacts,
        {
          id: nextId(courtContacts),
          courtName: form.courtName,
          emirate: form.emirate || "دبي",
          department: form.department,
          titleOrEmployee: form.titleOrEmployee || "مسؤول التواصل",
          phone: form.phone || "",
          extOrSeal: form.extOrSeal || "",
          email: form.email || "",
          operatingHours: form.operatingHours || "07:30 ص - 02:30 م",
          location: form.location || "",
          notes: form.notes || "",
        },
      ]);
    }
    setEditingCourtContact(null);
    setModal(null);
  };

  // ---------- استيراد وتنزيل نموذج إكسل لدليل المحاكم والجهات ----------
  const downloadCourtContactsTemplate = () => {
    const sampleData = [
      {
        "اسم المحكمة": "محكمة دبي الابتدائية",
        الإمارة: "دبي",
        "القسم / التخصص": "قيد الدعاوى والمذكرات",
        "اسم الموظف / المسمى": "أ. أحمد المنصوري - رئيس قسم القيد",
        "رقم الهاتف": "043401111",
        "التمديدة / رقم الختم": "ext 4022",
        "البريد الإلكتروني": "registration@dc.gov.ae",
        "أوقات الدوام": "07:30 ص - 02:30 م",
        "الموقع / العنوان": "مبنى محاكم دبي - أم هرير 2",
        ملاحظات: "استلام مذكرات الدفاع حتى الساعة 12 ظهراً",
      },
      {
        "اسم المحكمة": "دائرة القضاء - أبوظبي",
        الإمارة: "أبوظبي",
        "القسم / التخصص": "إدارة التنفيذ والإنابات",
        "اسم الموظف / المسمى": "المستشار سلطان الشامسي",
        "رقم الهاتف": "026512222",
        "التمديدة / رقم الختم": "ext 105",
        "البريد الإلكتروني": "execution@adjd.gov.ae",
        "أوقات الدوام": "07:30 ص - 03:00 م",
        "الموقع / العنوان": "مقر دائرة القضاء - شارع المطار",
        ملاحظات: "متابعة قرارات الإنابات والتنفيذ التجاري",
      },
      {
        "اسم المحكمة": "محكمة الشارقة الاتحادية",
        الإمارة: "الشارقة",
        "القسم / التخصص": "أمانات الخبراء والتقارير",
        "اسم الموظف / المسمى": "م. خالد الحوسني - أمين سر الخبراء",
        "رقم الهاتف": "065003333",
        "التمديدة / رقم الختم": "ext 801",
        "البريد الإلكتروني": "experts@moj.gov.ae",
        "أوقات الدوام": "07:30 ص - 02:30 م",
        "الموقع / العنوان": "مجمع المحاكم الاتحادية - الخزامية",
        ملاحظات: "تقديم اعتراضات وتقارير الخبراء المعتمدين",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 25 },
      { wch: 18 },
      { wch: 30 },
      { wch: 35 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "دليل_المحاكم");
    XLSX.writeFile(workbook, "نموذج_استيراد_دليل_المحاكم.xlsx");
  };

  const handleCourtExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCourtExcelFileName(file.name);
    setCourtExcelImportStatus(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          setCourtExcelImportStatus({
            message: "ملف الإكسل فارغ أو لا يحتوي على صفوف بيانات",
            isError: true,
          });
          return;
        }

        const parsedRows: Partial<CourtContact>[] = rawJson
          .map((row) => {
            const getVal = (keys: string[]) => {
              for (const k of keys) {
                for (const rowKey of Object.keys(row)) {
                  if (rowKey.trim().toLowerCase() === k.trim().toLowerCase()) {
                    return String(row[rowKey] || "").trim();
                  }
                }
              }
              return "";
            };

            const courtName = getVal([
              "اسم المحكمة",
              "المحكمة",
              "courtName",
              "court_name",
              "Court",
              "جهة المحكمة",
              "اسم الجهة",
            ]);
            const emirate = getVal(["الإمارة", "إمارة", "emirate", "Emirate"]) || "دبي";
            const department = getVal([
              "القسم / التخصص",
              "القسم",
              "التخصص",
              "department",
              "Department",
            ]);
            const titleOrEmployee = getVal([
              "اسم الموظف / المسمى",
              "الموظف",
              "المسمى الوظيفي",
              "اسم الموظف",
              "titleOrEmployee",
              "Employee",
              "Title",
            ]);
            const phone = getVal(["رقم الهاتف", "الهاتف", "تلفون", "phone", "Phone", "Mobile"]);
            const extOrSeal = getVal([
              "التمديدة / رقم الختم",
              "التمديدة",
              "الختم",
              "رقم الختم",
              "extOrSeal",
              "Ext",
              "Seal",
            ]);
            const email = getVal([
              "البريد الإلكتروني",
              "البريد الاكتروني",
              "الإيميل",
              "البريد",
              "email",
              "Email",
            ]);
            const operatingHours =
              getVal(["أوقات الدوام", "ساعات العمل", "الدوام", "operatingHours", "Hours"]) ||
              "07:30 ص - 02:30 م";
            const location = getVal([
              "الموقع / العنوان",
              "الموقع",
              "العنوان",
              "location",
              "Address",
            ]);
            const notes = getVal(["ملاحظات", "الملاحظات", "notes", "Notes"]);

            return {
              courtName: courtName || "جهة قضائية",
              emirate,
              department: department || "عام",
              titleOrEmployee: titleOrEmployee || "—",
              phone: phone || "—",
              extOrSeal: extOrSeal || "—",
              email: email || "—",
              operatingHours,
              location: location || "الإمارات",
              notes: notes || "مستورد من ملف إكسل",
            };
          })
          .filter((item) => item.courtName || item.department);

        if (parsedRows.length === 0) {
          setCourtExcelImportStatus({
            message:
              "لم يتم العثور على أعمدة متطابقة في ملف الإكسل. يرجى تحميل النموذج المعتمد والتعبئة ببيانات الجهات.",
            isError: true,
          });
        } else {
          setCourtImportPreviewList(parsedRows);
          setCourtExcelModalOpen(true);
        }
      } catch (err: any) {
        setCourtExcelImportStatus({
          message: `خطأ في قراءة ملف الإكسل: ${err.message || "تأكد من سلامة وصيغة الملف"}`,
          isError: true,
        });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const confirmCourtExcelImport = () => {
    if (!courtImportPreviewList || courtImportPreviewList.length === 0) return;

    const baseId = nextId(courtContacts);
    const newContacts: CourtContact[] = courtImportPreviewList.map((item, idx) => ({
      id: baseId + idx,
      courtName: item.courtName || "جهة قضائية",
      emirate: item.emirate || "دبي",
      department: item.department || "عام",
      titleOrEmployee: item.titleOrEmployee || "—",
      phone: item.phone || "—",
      extOrSeal: item.extOrSeal || "—",
      email: item.email || "—",
      operatingHours: item.operatingHours || "07:30 ص - 02:30 م",
      location: item.location || "الإمارات",
      notes: item.notes || "مستورد من ملف إكسل",
    }));

    let updatedList: CourtContact[];
    if (courtExcelImportMode === "replace") {
      updatedList = newContacts;
    } else {
      updatedList = [...courtContacts, ...newContacts];
    }

    setCourtContacts(updatedList);
    saveStorage("firm_court_contacts", updatedList);

    setCourtExcelModalOpen(false);
    const count = newContacts.length;
    setCourtImportPreviewList([]);
    setCourtExcelFileName("");

    alert(`✅ تم استيراد (${count}) سجل بنجاح إلى دليل وسائل التواصل مع المحاكم والجهات القضائية!`);
  };

  const convertTimeToInvoice = (log: TimeLog) => {
    const cs = cases.find((c) => c.id === log.caseId);
    if (!cs) return;
    const totalAmount = log.hours * log.hourlyRate;
    const newInv: Invoice = {
      id: nextId(invoices),
      number: nextMainInvoiceNumber(invoices),
      clientId: cs.clientId,
      caseId: cs.id,
      date: todayISO(),
      due: addDays(30),
      amount: totalAmount,
      status: "مرسلة",
      desc: `أتعاب ساعات عمل قانونية (${log.hours} ساعة × ${log.hourlyRate} درهم): ${log.description}`,
    };
    setInvoices([...invoices, newInv]);
    setTimeLogs(timeLogs.map((t) => (t.id === log.id ? { ...t, billed: true } : t)));
  };

  // ---------- التبويبات حسب الأولوية التنظيمية للمكتب ----------
  const NAV = [
    // 1. العمليات القانونية الرئيسية
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: LayoutDashboard,
      category: "العمليات القانونية",
    },
    { id: "cases", label: "القضايا", icon: Briefcase, category: "العمليات القانونية" },
    { id: "hearings", label: "الجلسات والرول", icon: CalendarDays, category: "العمليات القانونية" },
    { id: "clients", label: "الموكلين والعملاء", icon: Users, category: "العمليات القانونية" },
    {
      id: "booking_consultation",
      label: "حجز استشارة مرئية",
      icon: Video,
      category: "العمليات القانونية",
    },

    // 2. التواصل والمهام اليومية
    { id: "tasks", label: "المهام والتكليفات", icon: ListChecks, category: "التواصل والمهام" },
    {
      id: "whatsapp_office",
      label: "واتساب المكتب المدمج",
      icon: MessageSquare,
      category: "التواصل والمهام",
    },
    {
      id: "inapp_email",
      label: "البريد الإلكتروني المدمج",
      icon: Mail,
      category: "التواصل والمهام",
    },
    {
      id: "courts_directory",
      label: "دليل المحاكم والجهات",
      icon: PhoneCall,
      category: "التواصل والمهام",
    },
    { id: "colleagues", label: "الزملاء والإنابات", icon: Handshake, category: "التواصل والمهام" },

    // 3. المستندات والعقود والتوثيق
    { id: "docs", label: "المستندات والأرشيف", icon: FolderOpen, category: "المستندات والعقود" },
    { id: "poa", label: "الوكالات القانونية", icon: FileSignature, category: "المستندات والعقود" },
    {
      id: "office_agreement",
      label: "اتفاقية أتعاب المكتب",
      icon: FileCheck,
      category: "المستندات والعقود",
    },

    // 3.5 الفواتير والضريبة (تصنيف مستقل)
    { id: "invoices", label: "الفواتير والضريبة", icon: Receipt, category: "الفواتير والضريبة" },

    // 3.6 النظام المحاسبي المتكامل — يظهر فقط إذا تم تفعيل العلم ACCOUNTING_MODULE_ENABLED للجميع،
    // أو لحساب ضمن قائمة التفعيل التجريبي المحدود ACCOUNTING_TRIAL_USER_EMAILS
    ...(ACCOUNTING_MODULE_ENABLED || ACCOUNTING_TRIAL_USER_EMAILS.includes(currentUser?.email || "")
      ? [
          {
            id: "accounting",
            label: "المحاسبة (تجريبي)",
            icon: Calculator,
            category: "الفواتير والضريبة",
          },
        ]
      : []),

    // 4. الامتثال والإدارة
    { id: "kyc", label: "اعرف عميلك (KYC)", icon: ShieldCheck, category: "الإدارة والامتثال" },
    {
      id: "precedents",
      label: "المبادئ والأحكام القضائية",
      icon: BookOpen,
      category: "الإدارة والامتثال",
    },
    {
      id: "policies",
      label: "السياسات الداخلية للمكتب",
      icon: ScrollText,
      category: "الإدارة والامتثال",
    },
    {
      id: "employees",
      label: "الموظفون والكادر (HR)",
      icon: UserCheck,
      category: "الإدارة والامتثال",
    },
    {
      id: "audit_log",
      label: "سجل التدقيق والأنشطة",
      icon: History,
      category: "الإدارة والامتثال",
    },
    { id: "users", label: "المستخدمون والصلاحيات", icon: Lock, category: "الإدارة والامتثال" },
    {
      id: "official_identity",
      label: "الهوية الرسمية والأختام",
      icon: Stamp,
      category: "الإدارة والامتثال",
    },
  ];

  // مراجعات KYC المستحقة أو القريبة (خلال 30 يومًا)
  const kycDue = kyc.filter((k) => daysUntil(nextReviewDate(k.lastReview, k.risk)) <= 30).length;

  // المهام المستحقة اليوم أو المتأخرة
  const overdueTasks = tasks.filter((t) => !t.done && daysUntil(t.due) <= 0).length;
  const urgentTodayOrOverdueTasks = useMemo(() => {
    return tasks.filter((t) => !t.done && daysUntil(t.due) <= 0);
  }, [tasks]);

  // المهام العاجلة التي اقترب موعدها خلال أقل من 24 ساعة (أو مستحقة اليوم أو متأخرة)
  const urgentTasks24h = useMemo(() => {
    return tasks
      .filter((t) => !t.done && daysUntil(t.due) <= 1)
      .sort((a, b) => {
        const dA = daysUntil(a.due);
        const dB = daysUntil(b.due);
        if (dA !== dB) return dA - dB;
        const pOrder: Record<string, number> = { عالية: 0, متوسطة: 1, منخفضة: 2 };
        return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
      });
  }, [tasks]);

  const upcoming = hearings
    .filter((h) => !h.done && daysUntil(h.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const notifCount =
    stats.expiringPoa +
    invoices.filter((i) => effectiveInvoiceStatus(i) === "متأخرة").length +
    upcoming.filter((h) => daysUntil(h.date) <= 2).length +
    kycDue +
    overdueTasks;

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  const getCaseEmirate = (c: CaseItem): string => {
    if (c.emirate) return c.emirate;
    const cObj = clientMap.get(c.clientId);
    const text = (
      (c.court || "") +
      " " +
      (cObj?.emirate || "") +
      " " +
      (cObj?.address || "")
    ).toLowerCase();
    if (text.includes("دبي")) return "دبي";
    if (text.includes("عجمان")) return "عجمان";
    if (text.includes("أم القيوين") || text.includes("ام القيوين")) return "أم القيوين";
    if (text.includes("الشارقة") || text.includes("كلباء") || text.includes("خورفكان"))
      return "الشارقة";
    if (text.includes("رأس الخيمة") || text.includes("راس الخيمة")) return "رأس الخيمة";
    if (text.includes("أبوظبي") || text.includes("ابوظبي")) return "أبوظبي";
    if (text.includes("الفجيرة")) return "الفجيرة";
    return "الإمارات";
  };

  const getCaseYear = (num: string): string => {
    if (!num) return "";
    const m = num.match(/\b(20\d{2}|19\d{2})\b/);
    return m ? m[1] : "";
  };

  const uniqueJudges = useMemo(() => {
    const list: string[] = [];
    cases.forEach((c) => {
      if (c.judge && c.judge.trim() && c.judge.trim() !== "—") {
        const val = c.judge.trim();
        if (!list.includes(val)) list.push(val);
      }
    });
    return list.sort();
  }, [cases]);

  const uniqueCourts = useMemo(() => {
    const list: string[] = [];
    cases.forEach((c) => {
      if (c.court && c.court.trim() && c.court.trim() !== "—") {
        const val = c.court.trim();
        if (!list.includes(val)) list.push(val);
      }
    });
    return list.sort();
  }, [cases]);

  const uniqueCaseTypes = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      if (c.type && c.type.trim()) set.add(c.type.trim());
    });
    CASE_TYPES.forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [cases]);

  const uniqueEmirates = [
    "دبي",
    "عجمان",
    "أم القيوين",
    "الشارقة",
    "رأس الخيمة",
    "أبوظبي",
    "الفجيرة",
  ];

  const uniqueCaseYears = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      const yr = getCaseYear(c.number);
      if (yr) set.add(yr);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [cases]);

  const uniqueCaseClients = useMemo(() => {
    const clientIdsWithCases = new Set(cases.map((c) => c.clientId));
    return clients
      .filter((cl) => clientIdsWithCases.has(cl.id))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [cases, clients]);

  const isCaseMatchingStatus = (c: CaseItem, filter: string): boolean => {
    if (!filter || filter === "الكل") return true;
    if (filter === "متداولة") {
      return c.status === "متداولة" || c.status === "قيد النظر";
    }
    if (filter === "منتهية") {
      return c.status === "منتهية" || c.status === "مغلقة" || c.status === "مشطوبة";
    }
    if (filter === "محكومة" || filter === "صدر الحكم") {
      return c.status === "محكومة" || c.status === "صدر الحكم";
    }
    if (filter === "مشطوبة") {
      return c.status === "مشطوبة";
    }
    if (filter === "قيد النظر") {
      return c.status === "قيد النظر";
    }
    if (filter === "محجوزة للحكم") {
      return c.status === "محجوزة للحكم";
    }
    if (filter === "معلقة") {
      return c.status === "معلقة";
    }
    return c.status === filter;
  };

  const isCaseMatchingStage = (c: CaseItem, stageFilter: string): boolean => {
    if (!stageFilter || stageFilter === "الكل") return true;
    const currentStage = getCaseStage(c);
    if (stageFilter === "الاستئناف" || stageFilter === "استئناف") {
      return currentStage === "الاستئناف";
    }
    if (stageFilter === "الابتدائية" || stageFilter === "ابتدائي") {
      return currentStage === "الابتدائية";
    }
    if (stageFilter === "التمييز / النقض" || stageFilter === "تمييز" || stageFilter === "نقض") {
      return currentStage === "التمييز / النقض";
    }
    if (stageFilter === "التنفيذ" || stageFilter === "تنفيذ") {
      return currentStage === "التنفيذ";
    }
    if (stageFilter === "لجان فض المنازعات") {
      return currentStage === "لجان فض المنازعات";
    }
    return currentStage === stageFilter;
  };

  const filteredCases = useMemo(() => {
    const query = normalizeArabicSearch(q);
    const result = cases.filter((c) => {
      const matchStage = isCaseMatchingStage(c, caseStageFilter);
      const matchStatus = isCaseMatchingStatus(c, caseFilter);
      const matchCourt = caseCourtFilter === "الكل" || c.court === caseCourtFilter;
      const matchJudge =
        caseJudgeFilter === "الكل" ||
        (c.judge && c.judge.toLowerCase().includes(caseJudgeFilter.toLowerCase()));
      const matchType =
        caseTypeFilter === "الكل" ||
        c.type === caseTypeFilter ||
        (c.subject && c.subject.includes(caseTypeFilter));
      const matchEmirate = caseEmirateFilter === "الكل" || getCaseEmirate(c) === caseEmirateFilter;
      const matchClient = caseClientFilter === "الكل" || String(c.clientId) === caseClientFilter;
      const clientObj = clientMap.get(c.clientId);
      const matchClientType =
        caseClientTypeFilter === "الكل" || (clientObj && clientObj.type === caseClientTypeFilter);
      const matchYear = caseYearFilter === "الكل" || getCaseYear(c.number) === caseYearFilter;

      const matchQuery =
        !query ||
        (c.number && normalizeArabicSearch(c.number).includes(query)) ||
        normalizeArabicSearch(clientName(c.clientId)).includes(query) ||
        (c.subject && normalizeArabicSearch(c.subject).includes(query)) ||
        (c.opponents && c.opponents.some((o) => normalizeArabicSearch(o).includes(query))) ||
        (c.court && normalizeArabicSearch(c.court).includes(query)) ||
        (c.judge && normalizeArabicSearch(c.judge).includes(query)) ||
        (c.type && normalizeArabicSearch(c.type).includes(query)) ||
        (getCaseStage(c) && normalizeArabicSearch(getCaseStage(c)).includes(query)) ||
        (c.status && normalizeArabicSearch(c.status).includes(query));

      return (
        matchStage &&
        matchStatus &&
        matchCourt &&
        matchJudge &&
        matchType &&
        matchEmirate &&
        matchClient &&
        matchClientType &&
        matchYear &&
        matchQuery
      );
    });

    if (caseSortBy === "newest") {
      return [...result].sort((a, b) => b.id - a.id);
    } else if (caseSortBy === "oldest") {
      return [...result].sort((a, b) => a.id - b.id);
    } else if (caseSortBy === "number") {
      return [...result].sort((a, b) => a.number.localeCompare(b.number, "ar", { numeric: true }));
    } else if (caseSortBy === "client") {
      return [...result].sort((a, b) =>
        clientName(a.clientId).localeCompare(clientName(b.clientId), "ar"),
      );
    } else if (caseSortBy === "court") {
      return [...result].sort((a, b) => (a.court || "").localeCompare(b.court || "", "ar"));
    }

    return result;
  }, [
    cases,
    caseStageFilter,
    caseFilter,
    caseCourtFilter,
    caseJudgeFilter,
    caseTypeFilter,
    caseEmirateFilter,
    caseClientFilter,
    caseClientTypeFilter,
    caseYearFilter,
    caseSortBy,
    q,
    clientMap,
  ]);

  const filteredClientsList = useMemo(() => {
    const query = normalizeArabicSearch(clientSearch);
    return clients.filter((c) => {
      const matchesCategory = clientCategoryFilter === "الكل" || c.type === clientCategoryFilter;
      const matchesSearch =
        !query ||
        (c.name && normalizeArabicSearch(c.name).includes(query)) ||
        (c.idNo && normalizeArabicSearch(c.idNo).includes(query)) ||
        (c.phone && c.phone.includes(clientSearch.trim())) ||
        (c.email && c.email.toLowerCase().includes(clientSearch.trim().toLowerCase())) ||
        (c.emirate && normalizeArabicSearch(c.emirate).includes(query)) ||
        (c.address && normalizeArabicSearch(c.address).includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [clients, clientCategoryFilter, clientSearch]);
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (caseStageFilter !== "الكل") count++;
    if (caseFilter !== "الكل") count++;
    if (caseJudgeFilter !== "الكل") count++;
    if (caseCourtFilter !== "الكل") count++;
    if (caseTypeFilter !== "الكل") count++;
    if (caseEmirateFilter !== "الكل") count++;
    if (caseClientFilter !== "الكل") count++;
    if (caseClientTypeFilter !== "الكل") count++;
    if (caseYearFilter !== "الكل") count++;
    if (caseSortBy !== "default") count++;
    if (q.trim() !== "") count++;
    return count;
  }, [
    caseStageFilter,
    caseFilter,
    caseJudgeFilter,
    caseCourtFilter,
    caseTypeFilter,
    caseEmirateFilter,
    caseClientFilter,
    caseClientTypeFilter,
    caseYearFilter,
    caseSortBy,
    q,
  ]);

  const resetAllCaseFilters = () => {
    setCaseStageFilter("الكل");
    setCaseFilter("الكل");
    setCaseJudgeFilter("الكل");
    setCaseCourtFilter("الكل");
    setCaseTypeFilter("الكل");
    setCaseEmirateFilter("الكل");
    setCaseClientFilter("الكل");
    setCaseClientTypeFilter("الكل");
    setCaseYearFilter("الكل");
    setCaseSortBy("default");
    setQ("");
  };

  const caseStatsBreakdown = useMemo(() => {
    const statusMap: Record<string, number> = {
      الكل: cases.length,
      متداولة: 0,
      منتهية: 0,
      محكومة: 0,
      "صدر الحكم": 0,
      "قيد النظر": 0,
      "محجوزة للحكم": 0,
      مشطوبة: 0,
      معلقة: 0,
      مغلقة: 0,
    };
    const stageMap: Record<string, number> = {
      الكل: cases.length,
      الابتدائية: 0,
      الاستئناف: 0,
      "التمييز / النقض": 0,
      التنفيذ: 0,
      "لجان فض المنازعات": 0,
    };
    const stageStatusMap: Record<string, { total: number; ongoing: number; finished: number }> = {
      الابتدائية: { total: 0, ongoing: 0, finished: 0 },
      الاستئناف: { total: 0, ongoing: 0, finished: 0 },
      "التمييز / النقض": { total: 0, ongoing: 0, finished: 0 },
      التنفيذ: { total: 0, ongoing: 0, finished: 0 },
      "لجان فض المنازعات": { total: 0, ongoing: 0, finished: 0 },
    };
    const emirateMap: Record<string, number> = {};
    const clientTypeMap: Record<string, number> = { شركة: 0, فرد: 0 };
    const typeMap: Record<string, number> = {};

    cases.forEach((c) => {
      const st = c.status || "متداولة";
      const stage = getCaseStage(c);

      // Status aggregation (align with isCaseMatchingStatus)
      if (st === "متداولة" || st === "قيد النظر") {
        statusMap["متداولة"] = (statusMap["متداولة"] || 0) + 1;
      }
      if (st === "منتهية" || st === "مغلقة" || st === "مشطوبة") {
        statusMap["منتهية"] = (statusMap["منتهية"] || 0) + 1;
      }
      if (st === "محكومة" || st === "صدر الحكم") {
        statusMap["محكومة"] = (statusMap["محكومة"] || 0) + 1;
        statusMap["صدر الحكم"] = (statusMap["صدر الحكم"] || 0) + 1;
      }
      if (st === "قيد النظر") statusMap["قيد النظر"] = (statusMap["قيد النظر"] || 0) + 1;
      if (st === "محجوزة للحكم") statusMap["محجوزة للحكم"] = (statusMap["محجوزة للحكم"] || 0) + 1;
      if (st === "مشطوبة") statusMap["مشطوبة"] = (statusMap["مشطوبة"] || 0) + 1;
      if (st === "معلقة") statusMap["معلقة"] = (statusMap["معلقة"] || 0) + 1;

      // Stage aggregation
      stageMap[stage] = (stageMap[stage] || 0) + 1;
      if (!stageStatusMap[stage]) {
        stageStatusMap[stage] = { total: 0, ongoing: 0, finished: 0 };
      }
      stageStatusMap[stage].total += 1;
      if (st === "متداولة" || st === "قيد النظر" || st === "محجوزة للحكم") {
        stageStatusMap[stage].ongoing += 1;
      } else {
        stageStatusMap[stage].finished += 1;
      }

      const em = getCaseEmirate(c);
      emirateMap[em] = (emirateMap[em] || 0) + 1;

      const cl = clientMap.get(c.clientId);
      if (cl?.type === "شركة") clientTypeMap["شركة"] = (clientTypeMap["شركة"] || 0) + 1;
      else clientTypeMap["فرد"] = (clientTypeMap["فرد"] || 0) + 1;

      const tp = c.type || "أخرى";
      typeMap[tp] = (typeMap[tp] || 0) + 1;
    });

    return {
      statusMap,
      stageMap,
      stageStatusMap,
      emirateMap,
      clientTypeMap,
      typeMap,
    };
  }, [cases, clientMap]);

  const selectedCase = cases.find((c) => c.id === caseView);

  if (currentRoute === "public_consultation") {
    return (
      <PublicConsultationPage
        settings={consultationSettings}
        existingBookings={consultationBookings}
        onNewBooking={(newBooking) => {
          setConsultationBookings((prev) => [newBooking, ...prev]);

          // Automatically record invoice and payment receipt in office financial system
          const normPhone = (p: string) => (p || "").replace(/\D/g, "").slice(-9);
          let matchedBookingClient = clients.find(
            (c) => normPhone(c.phone) && normPhone(c.phone) === normPhone(newBooking.whatsapp),
          );
          if (!matchedBookingClient && newBooking.email) {
            matchedBookingClient = clients.find(
              (c) =>
                c.email && c.email.trim().toLowerCase() === newBooking.email.trim().toLowerCase(),
            );
          }
          if (!matchedBookingClient) {
            matchedBookingClient = findMatchingClientByName(clients, newBooking.clientName);
          }
          // لم يوجد موكل مطابق (لا هاتف ولا بريد ولا اسم) — ننشئ سجل موكل حقيقي جديد بدل استخدام
          // معرّف ثابت وهمي (0)، حتى ترتبط الفاتورة والدفعة بموكل فعلي موجود في سجلات المكتب.
          let bookingClientId: number;
          if (matchedBookingClient) {
            bookingClientId = matchedBookingClient.id;
          } else {
            const newClientId = clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1;
            const autoClient: Client = {
              id: newClientId,
              name: newBooking.clientName || `عميل استشارة مرئية #${newBooking.reference}`,
              type: "فرد",
              idNo: "",
              phone: newBooking.whatsapp || "",
              email: newBooking.email || "",
              emirate: "",
              address: "",
            };
            setClients((prev) => [autoClient, ...prev]);
            logAuditAction(
              "CREATE",
              "الموكلون",
              `إنشاء موكل تلقائي من حجز استشارة مرئية: ${autoClient.name}`,
              `أُنشئ هذا السجل تلقائياً لعدم وجود موكل مطابق (بالهاتف/البريد/الاسم) عند حجز الاستشارة رقم ${newBooking.reference}`,
              newClientId,
            );
            bookingClientId = newClientId;
          }
          const newInvoiceId = invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) + 1 : 1;
          const invoiceNumber = nextMainInvoiceNumber(invoices);

          const newInvoice: Invoice = {
            id: newInvoiceId,
            number: invoiceNumber,
            clientId: bookingClientId,
            caseId: null,
            feeAgreementId: "unallocated",
            date: newBooking.date,
            due: newBooking.date,
            amount: newBooking.amountPaid,
            status: "مدفوع",
            desc: `استشارة قانونية مرئية أونلاين (${newBooking.duration} دقيقة) - الموكل: ${newBooking.clientName} (مرجع: ${newBooking.reference})`,
          };

          setInvoices((prev) => [newInvoice, ...prev]);

          const newPayment: PaymentReceipt = {
            id: payments.length > 0 ? Math.max(...payments.map((p) => p.id)) + 1 : 1,
            clientId: bookingClientId,
            caseId: null,
            feeAgreementId: "unallocated",
            invoiceId: newInvoiceId,
            amount: newBooking.amountPaid,
            date: newBooking.date,
            paymentMethod: "بوابة الدفع الإلكترونية الآمنة (Online Secure Gateway)",
            referenceNo: newBooking.reference,
            notes: `سداد أونلاين استشارة مرئية - ${newBooking.clientName}`,
          };

          setPayments((prev) => [newPayment, ...prev]);

          logAuditAction(
            "CREATE",
            "استشارات مرئية",
            `حجز جديد #${newBooking.reference} وتم السداد بنجاح`,
            `تم حجز استشارة مرئية أونلاين وسداد مبلغ ${newBooking.amountPaid} درهم وتوليد الفاتورة التلقائية للموكل: ${newBooking.clientName}`,
          );
        }}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          users={users}
          onLogin={(userId) => {
            setCurrentUserId(userId);
            setIsLoggedIn(true);
            try {
              localStorage.setItem("firm_is_logged_in", "true");
              localStorage.setItem("firm_logged_in_user_id", String(userId));
            } catch (e) {}
          }}
          onRegister={(newUser) => {
            const created: UserItem = {
              ...newUser,
              id: nextId(users),
              status: "معلق",
              avatarBg: "bg-amber-600 text-white",
              avatarText: newUser.name.slice(0, 2),
              permissions:
                ROLE_PRESETS[newUser.roleKey]?.permissions || ROLE_PRESETS.lawyer.permissions,
            };
            setUsers((prev) => {
              const updated = [...prev, created];
              saveStorage("firm_users", updated);
              return updated;
            });
            // إضافة إشعار لمدير النظام برغبة مستخدم جديد بالانضمام
            // ملاحظة: هذا إشعار نظام داخلي (بلا مستلم/قناة إرسال فعلية) وليس سجل إرسال فعلي مثل
            // NotificationLog القياسي — لذا لا يطابق شكله بالكامل. يُحتفظ بالسلوك كما هو مع تصريح
            // صريح بالنوع بدل تجاهل الفحص بالكامل؛ إعادة هيكلة نوع الإشعارات بند منفصل لاحق.
            setNotifications((prev) => [
              {
                id: Date.now(),
                title: "طلب تسجيل حساب جديد (قيد الاعتماد)",
                desc: `قدم ${newUser.name} (${newUser.email}) طلب حساب بدور (${newUser.roleTitle}). الطلب ينتظر موافقة مدير النظام.`,
                date: todayISO(),
                type: "تأكيد",
                read: false,
              } as unknown as (typeof prev)[number],
              ...prev,
            ]);
            try {
              supabase.from("profiles").insert({
                email: newUser.email,
                full_name: newUser.name,
                role: newUser.roleKey,
                status: "pending",
              });
            } catch (e) {
              // ignore
            }
          }}
          onOpenSqlModal={() => setShowSupabaseModal(true)}
        />
        <SupabaseSqlModal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} />
      </>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#faf8f5] text-slate-800 font-sans selection:bg-[#b89b6a]/30"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&display=swap');
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            max-height: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="flex min-h-screen">
        {/* ===== الشريط الجانبي الفخم لسطح المكتب ===== */}
        <aside className="hidden w-64 shrink-0 flex-col bg-white border-l border-slate-200/80 text-slate-800 md:flex shadow-[1px_0_0_rgb(15,23,42,0.02),4px_0_24px_-8px_rgb(15,23,42,0.06)]">
          <div className="flex items-center justify-center border-b border-slate-100 px-4 py-5">
            <Logo variant="horizontal" mode="light" size="md" />
          </div>

          {/* تبديل سريع للمستخدم الحالي (للمدير فقط) */}
          <div className="mx-3 mt-4 mb-2 rounded-2xl bg-[#0D382B]/[0.045] p-3.5 border border-[#0D382B]/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#0D382B] flex items-center gap-1">
                <UserCheck size={13} /> الحساب النشط الآن:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D382B] text-white font-mono tracking-wide">
                {currentUser.roleKey.toUpperCase()}
              </span>
            </div>
            {currentUser.roleKey === "admin" &&
            (currentUser.status === "نشط" || currentUser.status === "approved") ? (
              <select
                value={currentUserId}
                onChange={(e) => setCurrentUserId(+e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 px-2 py-1.5 focus:outline-none focus:border-[#0D382B]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleTitle})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs font-bold text-slate-900 px-1 py-1 truncate">
                {currentUser.name} ({currentUser.roleTitle})
              </p>
            )}
          </div>

          <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {NAV.filter(({ id }) => hasTabPermission(currentUser, id)).map(
              ({ id, label, icon: Icon, category }, idx, filteredNav) => {
                const showCategoryHeader = idx === 0 || category !== filteredNav[idx - 1].category;
                return (
                  <React.Fragment key={id}>
                    {showCategoryHeader && category && (
                      <div className="px-2.5 pt-4 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                        <span>{category}</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setTab(id);
                        setCaseView(null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[11px] px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${tab === id ? "bg-[#0D382B] text-white font-black shadow-[0_6px_14px_-6px_rgb(13,56,43,0.5)]" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <Icon size={17} />
                      <span>{label}</span>
                      {id === "poa" && stats.expiringPoa > 0 && (
                        <span className="mr-auto rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                          {stats.expiringPoa}
                        </span>
                      )}
                      {id === "kyc" && kycDue > 0 && (
                        <span className="mr-auto rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                          {kycDue}
                        </span>
                      )}
                      {id === "tasks" && overdueTasks > 0 && (
                        <span className="mr-auto rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                          {overdueTasks}
                        </span>
                      )}
                      {id === "employees" &&
                        leaveRequests.filter((l) => l.status === "PENDING").length +
                          employeeExpenses.filter((e) => e.status === "PENDING").length >
                          0 && (
                          <span className="mr-auto rounded-full bg-amber-500 px-2 text-xs font-bold text-slate-950">
                            {leaveRequests.filter((l) => l.status === "PENDING").length +
                              employeeExpenses.filter((e) => e.status === "PENDING").length}
                          </span>
                        )}
                      {id === "booking_consultation" &&
                        consultationBookings.filter((b) => b.status === "pending_assignment")
                          .length > 0 && (
                          <span className="mr-auto rounded-full bg-amber-400 text-slate-950 px-2 text-xs font-black animate-pulse">
                            {
                              consultationBookings.filter((b) => b.status === "pending_assignment")
                                .length
                            }{" "}
                            جديد
                          </span>
                        )}
                      {id === "users" && pendingUsers.length > 0 && isAdmin ? (
                        <span className="mr-auto rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[11px] font-bold animate-pulse">
                          {pendingUsers.length} معلق
                        </span>
                      ) : id === "users" ? (
                        <span className="mr-auto rounded-full bg-emerald-100 border border-emerald-300 text-[10px] px-1.5 py-0.2 text-[#0D382B] font-mono">
                          {users.length}
                        </span>
                      ) : null}
                    </button>
                  </React.Fragment>
                );
              },
            )}

            <button
              onClick={() => setCurrentRoute("public_consultation")}
              className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D382B] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition mt-2"
            >
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#C5A059]" />
                <span>صفحة العوام للحجز (/consultation)</span>
              </div>
              <ChevronLeft size={14} className="text-[#0D382B]" />
            </button>

            {isAiAssistantEnabled && (
              <button
                onClick={() => openAiForCurrentSection()}
                className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-black text-white bg-gradient-to-r from-[#0D382B] to-[#124d40] border border-emerald-800 hover:brightness-105 transition mt-2 cursor-pointer shadow-sm"
                title="المساعد الذكي القانوني والتنفيذي لجميع الأقسام (Gemini AI)"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />
                  <span>المساعد الذكي القانوني (AI)</span>
                </div>
                <ChevronLeft size={14} className="text-amber-300" />
              </button>
            )}

            <button
              onClick={() => setShowBackupModal(true)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-[#0D382B]/[0.08] transition-colors transition mt-2 cursor-pointer"
              title="تصدير واستعادة نسخة احتياطية محلية لقاعدة بيانات النظام"
            >
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#0D382B]" />
                <span>النسخ الاحتياطي للبيانات (JSON)</span>
              </div>
              <Download size={14} className="text-slate-600" />
            </button>
          </nav>
          <div className="border-t border-slate-100 p-4 text-xs text-slate-500 space-y-2 bg-slate-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 px-3 text-xs font-bold text-red-600 hover:bg-red-50 transition border border-red-200 shadow-2xs"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut size={15} /> تسجيل الخروج
            </button>
            <p className="text-[11px] text-center text-slate-400">
              ضريبة القيمة المضافة: 5% (UAE VAT)
            </p>
          </div>
        </aside>

        {/* ===== القائمة الجانبية المنزلقة الشاملة للجوال (Mobile Drawer) ===== */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" dir="rtl">
            {/* الخلفية المظلمة الشفافة */}
            <div
              className="fixed inset-0 bg-[#08130f]/65 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* محتوى القائمة المنزلقة */}
            <div className="relative flex w-[88vw] max-w-sm flex-1 flex-col bg-white shadow-2xl z-10 overflow-hidden">
              {/* ترويسة القائمة مع الشعار وزر الإغلاق */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 bg-emerald-50/70">
                <Logo variant="horizontal" mode="light" size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-800 transition border border-slate-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
                  aria-label="إغلاق القائمة"
                >
                  <X size={20} />
                </button>
              </div>

              {/* بطاقة الحساب النشط وتبديل الحسابات على الجوال */}
              <div className="m-3 rounded-2xl bg-emerald-50/80 p-3 border border-emerald-900/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#0D382B] flex items-center gap-1">
                    <UserCheck size={13} /> الحساب النشط:
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D382B] text-white font-mono font-bold">
                    {currentUser.roleKey.toUpperCase()}
                  </span>
                </div>
                {currentUser.roleKey === "admin" &&
                (currentUser.status === "نشط" || currentUser.status === "approved") ? (
                  <select
                    value={currentUserId}
                    onChange={(e) => setCurrentUserId(+e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 px-2 py-1.5 focus:outline-none focus:border-[#0D382B]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roleTitle})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-bold text-slate-900 px-1 py-0.5 truncate">
                    {currentUser.name} ({currentUser.roleTitle})
                  </p>
                )}
              </div>

              {/* شريط البحث السريع في الجوال */}
              <div className="px-3 pb-2">
                <div className="relative">
                  <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="بحث سريع في القضايا والموكلين…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* روابط جميع أقسام النظام الـ 18 مصنفة بالكامل */}
              <nav className="flex-1 space-y-1 p-3 overflow-y-auto custom-scrollbar">
                {NAV.filter(({ id }) => hasTabPermission(currentUser, id)).map(
                  ({ id, label, icon: Icon, category }, idx, filteredNav) => {
                    const showCategoryHeader =
                      idx === 0 || category !== filteredNav[idx - 1].category;
                    return (
                      <React.Fragment key={`mob-${id}`}>
                        {showCategoryHeader && category && (
                          <div className="px-2 pt-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0D382B] flex items-center gap-1.5 border-b border-slate-100 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                            <span>{category}</span>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setTab(id);
                            setCaseView(null);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                            tab === id
                              ? "bg-[#0D382B] text-white font-black shadow-md"
                              : "text-slate-600 hover:bg-emerald-50 hover:text-[#0D382B]"
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-right">{label}</span>
                          {id === "poa" && stats.expiringPoa > 0 && (
                            <span className="mr-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                              {stats.expiringPoa}
                            </span>
                          )}
                          {id === "kyc" && kycDue > 0 && (
                            <span className="mr-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                              {kycDue}
                            </span>
                          )}
                          {id === "tasks" && overdueTasks > 0 && (
                            <span className="mr-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                              {overdueTasks}
                            </span>
                          )}
                          {id === "employees" &&
                            leaveRequests.filter((l) => l.status === "PENDING").length +
                              employeeExpenses.filter((e) => e.status === "PENDING").length >
                              0 && (
                              <span className="mr-auto rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-slate-950">
                                {leaveRequests.filter((l) => l.status === "PENDING").length +
                                  employeeExpenses.filter((e) => e.status === "PENDING").length}
                              </span>
                            )}
                          {id === "booking_consultation" &&
                            consultationBookings.filter((b) => b.status === "pending_assignment")
                              .length > 0 && (
                              <span className="mr-auto rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black animate-pulse">
                                {
                                  consultationBookings.filter(
                                    (b) => b.status === "pending_assignment",
                                  ).length
                                }{" "}
                                جديد
                              </span>
                            )}
                          {id === "users" && pendingUsers.length > 0 && isAdmin ? (
                            <span className="mr-auto rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[11px] font-bold animate-pulse">
                              {pendingUsers.length} معلق
                            </span>
                          ) : id === "users" ? (
                            <span className="mr-auto rounded-full bg-emerald-100 border border-emerald-300 text-[10px] px-1.5 py-0.2 text-[#0D382B] font-mono">
                              {users.length}
                            </span>
                          ) : null}
                        </button>
                      </React.Fragment>
                    );
                  },
                )}

                {/* روابط سريعة إضافية داخل قائمة الجوال */}
                <div className="pt-2 space-y-1.5 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => {
                      setCurrentRoute("public_consultation");
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0D382B] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-[#C5A059]" />
                      <span>صفحة العوام للحجز (/consultation)</span>
                    </div>
                    <ChevronLeft size={14} className="text-[#0D382B]" />
                  </button>

                  <button
                    onClick={() => {
                      setClientPortalId(clients[0]?.id || 1);
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-amber-700" />
                      <span>بوابة الموكل الإلكترونية</span>
                    </div>
                    <ChevronLeft size={14} className="text-amber-700" />
                  </button>

                  {isAiAssistantEnabled && (
                    <button
                      onClick={() => {
                        openAiForCurrentSection();
                        setMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-[#0D382B] to-[#124d40] border border-emerald-800 hover:brightness-105 transition shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />
                        <span>المساعد الذكي القانوني (AI)</span>
                      </div>
                      <ChevronLeft size={14} className="text-amber-300" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowBackupModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-[#0D382B]/[0.08] transition-colors transition"
                  >
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-[#0D382B]" />
                      <span>النسخ الاحتياطي للبيانات</span>
                    </div>
                    <Download size={14} className="text-slate-600" />
                  </button>

                  <button
                    onClick={() => {
                      setReport("section");
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-[#0D382B]/[0.08] transition-colors transition"
                  >
                    <div className="flex items-center gap-2">
                      <Printer size={16} className="text-slate-600" />
                      <span>تقرير قابل للطباعة للقسم</span>
                    </div>
                    <ChevronLeft size={14} className="text-slate-600" />
                  </button>
                </div>
              </nav>

              {/* أسفل القائمة: تسجيل الخروج */}
              <div className="border-t border-slate-100 p-3 bg-slate-50 space-y-1.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 px-3 text-xs font-bold text-red-600 hover:bg-red-50 transition border border-red-200 shadow-2xs"
                >
                  <LogOut size={15} /> تسجيل الخروج
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  ضريبة القيمة المضافة: 5% (UAE VAT)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== المحتوى ===== */}
        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">
          {/* الشريط العلوي متوافق بالكامل مع الجوال وسطح المكتب */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-stone-200 bg-white/95 px-3 py-2.5 backdrop-blur md:px-6 md:py-3 shadow-2xs">
            {/* في الجوال: زر القائمة الجانبية والشعار */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0D382B] border border-emerald-200/80 hover:bg-emerald-100 transition md:hidden cursor-pointer relative shrink-0"
                aria-label="فتح القائمة الرئيسية والأقسام"
                title={`القائمة الرئيسية وجميع الأقسام الـ ${PERMISSION_MODULES.length}`}
              >
                <Menu size={20} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
              <Logo variant="horizontal" mode="light" size="sm" className="md:hidden" />
            </div>

            {/* شريط البحث لسطح المكتب */}
            <div className="relative mr-auto hidden max-w-xs flex-1 md:block">
              <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث في القضايا والموكلين…"
                className={`${inputCls} pr-9`}
              />
            </div>

            {/* أزرار الإجراءات السريعة للجوال وسطح المكتب */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* شريط معلومات المستخدم النشط */}
              <div className="flex items-center gap-1.5 sm:gap-2 border-r border-slate-200 pr-2 sm:pr-3 mr-1">
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 ${currentUser.avatarBg}`}
                >
                  {currentUser.avatarText}
                </div>
                <div className="hidden sm:block text-xs leading-tight">
                  <p className="font-bold text-slate-900 truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[#b89b6a] font-bold">{currentUser.roleTitle}</p>
                </div>
                {currentUser.roleKey === "admin" &&
                  (currentUser.status === "نشط" || currentUser.status === "approved") && (
                    <select
                      value={currentUserId}
                      onChange={(e) => setCurrentUserId(+e.target.value)}
                      className="hidden sm:block text-xs bg-stone-100 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#b89b6a]"
                      title="اختبار أداء الصلاحيات بأدوار مختلفة (للمدير فقط)"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.roleTitle})
                        </option>
                      ))}
                    </select>
                  )}
              </div>

              {isAiAssistantEnabled && (
                <button
                  onClick={() => openAiForCurrentSection()}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-teal-800 to-teal-950 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black text-white hover:opacity-95 transition shadow-sm cursor-pointer border border-amber-400/40 shrink-0"
                  title="المساعد الذكي القانوني لجميع الأقسام (Gemini AI)"
                >
                  <Sparkles size={14} className="text-amber-300 animate-pulse" />
                  <span className="hidden xs:inline sm:inline">المساعد الذكي</span>
                </button>
              )}

              {/* أزرار سطح المكتب */}
              <button
                onClick={() => setClientPortalId(clients[0]?.id || 1)}
                className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 shadow-sm"
                title="معاينة بوابة الموكل الإلكترونية"
              >
                <Globe size={15} /> <span className="hidden sm:inline">بوابة الموكل</span>
              </button>

              <button
                onClick={() => setShowBackupModal(true)}
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                title="تصدير واستعادة نسخة احتياطية لبيانات المكتب"
              >
                <Database size={15} className="text-emerald-600" />
                <span className="hidden sm:inline">النسخ الاحتياطي</span>
              </button>

              <button
                onClick={() => setReport("section")}
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors"
                title="تقرير قابل للطباعة للقسم الحالي"
              >
                <Printer size={15} /> <span className="hidden sm:inline">تقرير القسم</span>
              </button>

              <button
                onClick={() => setIsLoggedIn(false)}
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
                title="تسجيل الخروج والعودة لشاشة الدخول"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>

              <button
                className="relative rounded-full p-2 text-slate-500 hover:bg-[#0D382B]/[0.06] transition-colors"
                aria-label="التنبيهات"
              >
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className="absolute -left-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* تنبيه تقييد الصلاحيات إذا وُجد */}
          {permissionNotice && (
            <div className="m-3 sm:m-4 md:m-6 mb-0 p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium">{permissionNotice}</p>
              </div>
              <button
                onClick={() => setPermissionNotice(null)}
                className="text-xs font-bold text-amber-800 hover:bg-amber-200/60 px-2 py-1 rounded"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* شريط التنقل السفلي الذكي للجوال (Smart Bottom Navigation Bar) */}
          <div
            className="fixed bottom-0 right-0 left-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md py-1.5 px-1 sm:px-2 md:hidden shadow-lg"
            dir="rtl"
          >
            <button
              onClick={() => {
                setTab("dashboard");
                setCaseView(null);
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold transition ${
                tab === "dashboard"
                  ? "text-[#0D382B] font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard
                size={20}
                className={tab === "dashboard" ? "text-[#0D382B]" : "text-slate-400"}
              />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => {
                setTab("cases");
                setCaseView(null);
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold transition ${
                tab === "cases"
                  ? "text-[#0D382B] font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase
                size={20}
                className={tab === "cases" ? "text-[#0D382B]" : "text-slate-400"}
              />
              <span>القضايا</span>
            </button>

            <button
              onClick={() => {
                setTab("hearings");
                setCaseView(null);
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold transition relative ${
                tab === "hearings"
                  ? "text-[#0D382B] font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CalendarDays
                size={20}
                className={tab === "hearings" ? "text-[#0D382B]" : "text-slate-400"}
              />
              <span>الجلسات</span>
              {upcoming.filter((h) => daysUntil(h.date) <= 2).length > 0 && (
                <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={() => {
                setTab("tasks");
                setCaseView(null);
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold transition relative ${
                tab === "tasks"
                  ? "text-[#0D382B] font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListChecks
                size={20}
                className={tab === "tasks" ? "text-[#0D382B]" : "text-slate-400"}
              />
              <span>المهام</span>
              {overdueTasks > 0 && (
                <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-[#0D382B] relative transition cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200">
                <Menu size={16} className="text-[#0D382B]" />
              </div>
              <span className="text-[#0D382B]">كل الأقسام</span>
              {notifCount > 0 && (
                <span className="absolute top-0 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  !
                </span>
              )}
            </button>
          </div>

          <div className="mx-auto max-w-7xl w-full min-w-0 overflow-x-hidden space-y-6 p-3 sm:p-4 pb-24 md:p-6 md:pb-8">
            {currentUser.status === "معلق" || currentUser.status === "pending" ? (
              <PendingApprovalScreen
                currentUser={currentUser}
                onLogout={() => setIsLoggedIn(false)}
              />
            ) : (
              <ErrorBoundary variant="inline" context="هذه الشاشة" resetKey={tab}>
                {/* ================= لوحة التحكم ================= */}
                {tab === "dashboard" && (
                  <DashboardView
                    isAdmin={isAdmin}
                    pendingUsers={pendingUsers}
                    setTab={setTab}
                    openModalWithCheck={openModalWithCheck}
                    urgentTasks24h={urgentTasks24h}
                    cases={cases}
                    checkPerm={checkPerm}
                    tasks={tasks}
                    setTasks={setTasks}
                    users={users}
                    setNotifyModal={setNotifyModal}
                    canViewFinancials={canViewFinancials}
                    stats={stats}
                    casesByType={casesByType}
                    invoiceMetrics={invoiceMetrics}
                    tasksMetrics={tasksMetrics}
                    urgentTodayOrOverdueTasks={urgentTodayOrOverdueTasks}
                    upcoming={upcoming}
                    caseNo={caseNo}
                  />
                )}

                {/* ================= القضايا ================= */}
                {tab === "cases" && !caseView && (
                  <CasesListView
                    filteredCases={filteredCases}
                    cases={cases}
                    showCaseStatsOnDemand={showCaseStatsOnDemand}
                    setShowCaseStatsOnDemand={setShowCaseStatsOnDemand}
                    showAdvancedFilters={showAdvancedFilters}
                    setShowAdvancedFilters={setShowAdvancedFilters}
                    activeFiltersCount={activeFiltersCount}
                    handleDeduplicateCasesManual={handleDeduplicateCasesManual}
                    setShowCasesExcelModal={setShowCasesExcelModal}
                    openModalWithCheck={openModalWithCheck}
                    caseFilter={caseFilter}
                    setCaseFilter={setCaseFilter}
                    caseStageFilter={caseStageFilter}
                    setCaseStageFilter={setCaseStageFilter}
                    caseStatsBreakdown={caseStatsBreakdown}
                    caseClientTypeFilter={caseClientTypeFilter}
                    setCaseClientTypeFilter={setCaseClientTypeFilter}
                    caseTypeFilter={caseTypeFilter}
                    setCaseTypeFilter={setCaseTypeFilter}
                    resetAllCaseFilters={resetAllCaseFilters}
                    uniqueCaseTypes={uniqueCaseTypes}
                    uniqueEmirates={uniqueEmirates}
                    caseEmirateFilter={caseEmirateFilter}
                    setCaseEmirateFilter={setCaseEmirateFilter}
                    caseClientFilter={caseClientFilter}
                    setCaseClientFilter={setCaseClientFilter}
                    uniqueCaseClients={uniqueCaseClients}
                    caseYearFilter={caseYearFilter}
                    setCaseYearFilter={setCaseYearFilter}
                    uniqueCaseYears={uniqueCaseYears}
                    caseSortBy={caseSortBy}
                    setCaseSortBy={setCaseSortBy}
                    caseCourtFilter={caseCourtFilter}
                    setCaseCourtFilter={setCaseCourtFilter}
                    uniqueCourts={uniqueCourts}
                    q={q}
                    setQ={setQ}
                    caseJudgeFilter={caseJudgeFilter}
                    setCaseJudgeFilter={setCaseJudgeFilter}
                    uniqueJudges={uniqueJudges}
                    clientName={clientName}
                    setCaseView={setCaseView}
                    setEditingCase={setEditingCase}
                    setForm={setForm}
                    setModal={setModal}
                    requestDelete={requestDelete}
                    logAuditAction={logAuditAction}
                    setCases={setCases}
                    trustTransactions={trustTransactions}
                  />
                )}

                {/* ----- تفاصيل قضية ----- */}
                {tab === "cases" && selectedCase && (
                  <CaseDetailView
                    selectedCase={selectedCase}
                    setCaseView={setCaseView}
                    userPerms={userPerms}
                    setEditingCase={setEditingCase}
                    setForm={setForm}
                    setModal={setModal}
                    logAuditAction={logAuditAction}
                    cases={cases}
                    setCases={setCases}
                    clientName={clientName}
                    canViewFinancials={canViewFinancials}
                  />
                )}

                {/* ================= الموكلين ================= */}
                {tab === "clients" && (
                  <ClientsView
                    clientToast={clientToast}
                    setClientToast={setClientToast}
                    openModalWithCheck={openModalWithCheck}
                    clients={clients}
                    clientCategoryFilter={clientCategoryFilter}
                    setClientCategoryFilter={setClientCategoryFilter}
                    clientSearch={clientSearch}
                    setClientSearch={setClientSearch}
                    filteredClientsList={filteredClientsList}
                    cases={cases}
                    setEditingClient={setEditingClient}
                    deleteClient={deleteClient}
                    moveClientCategory={moveClientCategory}
                    setTab={setTab}
                    setQ={setQ}
                    editingClient={editingClient}
                    saveEditClient={saveEditClient}
                  />
                )}

                {/* ================= الجلسات والرول والمواعيد ================= */}
                {tab === "hearings" && (
                  <HearingsView
                    hearingSubTab={hearingSubTab}
                    setHearingSubTab={setHearingSubTab}
                    deadlines={deadlines}
                    setDeadlines={setDeadlines}
                    setPermissionNotice={setPermissionNotice}
                    runAutoAppealDeadlineChecker={runAutoAppealDeadlineChecker}
                    autoCheckStatus={autoCheckStatus}
                    openModalWithCheck={openModalWithCheck}
                    deadlineFilter={deadlineFilter}
                    setDeadlineFilter={setDeadlineFilter}
                    cases={cases}
                    clientName={clientName}
                    setReassignDeadlineModal={setReassignDeadlineModal}
                    handleSendWhatsAppDeadlineAlert={handleSendWhatsAppDeadlineAlert}
                    openNotificationComposer={openNotificationComposer}
                    setSelectedDeadlineLogs={setSelectedDeadlineLogs}
                    setShowGoogleCalendarModal={setShowGoogleCalendarModal}
                    googleUser={googleUser}
                    setReport={setReport}
                    selectedRollDate={selectedRollDate}
                    rollCourtFilter={rollCourtFilter}
                    setSelectedRollDate={setSelectedRollDate}
                    setRollCourtFilter={setRollCourtFilter}
                    hearings={hearings}
                    setHearings={setHearings}
                    caseNo={caseNo}
                    setNotifyModal={setNotifyModal}
                    handleSingleHearingGoogleSync={handleSingleHearingGoogleSync}
                    checkPerm={checkPerm}
                    requestDelete={requestDelete}
                    logAuditAction={logAuditAction}
                  />
                )}

                {/* ================= المهام ================= */}
                {tab === "tasks" && (
                  <TasksView
                    tasks={tasks}
                    setTasks={setTasks}
                    checkPerm={checkPerm}
                    openModalWithCheck={openModalWithCheck}
                    requestDelete={requestDelete}
                    logAuditAction={logAuditAction}
                    setPermissionNotice={setPermissionNotice}
                    saveStorage={saveStorage}
                  />
                )}

                {/* ================= البريد الإلكتروني المدمج In-App Email ================= */}
                {tab === "inapp_email" && (
                  <InAppEmailView
                    emailConfig={emailConfig}
                    setEmailConfig={setEmailConfig}
                    inAppEmails={inAppEmails}
                    setInAppEmails={setInAppEmails}
                    selectedEmailId={selectedEmailId}
                    setSelectedEmailId={setSelectedEmailId}
                    emailFolder={emailFolder}
                    setEmailFolder={setEmailFolder}
                    emailSearch={emailSearch}
                    setEmailSearch={setEmailSearch}
                    showEmailSettingsModal={showEmailSettingsModal}
                    setShowEmailSettingsModal={setShowEmailSettingsModal}
                    showComposeEmail={showComposeEmail}
                    setShowComposeEmail={setShowComposeEmail}
                    composeTo={composeTo}
                    setComposeTo={setComposeTo}
                    composeSubject={composeSubject}
                    setComposeSubject={setComposeSubject}
                    composeBody={composeBody}
                    setComposeBody={setComposeBody}
                    composeAttachment={composeAttachment}
                    setComposeAttachment={setComposeAttachment}
                    testSmtpLoading={testSmtpLoading}
                    testSmtpResult={testSmtpResult}
                    setTestSmtpResult={setTestSmtpResult}
                    testInvoiceLoading={testInvoiceLoading}
                    testInvoiceRecipient={testInvoiceRecipient}
                    setTestInvoiceRecipient={setTestInvoiceRecipient}
                    testInvoiceResult={testInvoiceResult}
                    handleTestSmtpConnection={handleTestSmtpConnection}
                    handleSendTestInvoice={handleSendTestInvoice}
                    handleSaveEmailSettings={handleSaveEmailSettings}
                    handleSendInAppEmail={handleSendInAppEmail}
                    fetchSupabaseEmailMessages={fetchSupabaseEmailMessages}
                    requestDelete={requestDelete}
                    logAuditAction={logAuditAction}
                    saveStorage={saveStorage}
                    setPermissionNotice={setPermissionNotice}
                  />
                )}

                {/* ================= واتساب المكتب المدمج WhatsApp Office ================= */}
                {tab === "whatsapp_office" && (
                  <WhatsappOfficeView
                    isSuperAdmin={isSuperAdmin}
                    currentUser={currentUser}
                    fetchSupabaseWhatsAppMessages={fetchSupabaseWhatsAppMessages}
                    setShowNewWaChatModal={setShowNewWaChatModal}
                    waChats={waChats}
                    setWaChats={setWaChats}
                    waSearchTerm={waSearchTerm}
                    setWaSearchTerm={setWaSearchTerm}
                    selectedWaChatId={selectedWaChatId}
                    setSelectedWaChatId={setSelectedWaChatId}
                    waInputText={waInputText}
                    setWaInputText={setWaInputText}
                    handleSendWaMessage={handleSendWaMessage}
                  />
                )}

                {/* مودال إنشاء محادثة جديدة */}
                {showNewWaChatModal && (
                  <Modal
                    title="بدء محادثة واتساب جديدة"
                    onClose={() => setShowNewWaChatModal(false)}
                  >
                    <div className="space-y-4 text-sm">
                      <Field label="اسم العميل / الموكل">
                        <input
                          type="text"
                          value={newWaName}
                          onChange={(e) => setNewWaName(e.target.value)}
                          placeholder="مثال: أستاذ أحمد علي المنصوري"
                          className={inputCls}
                        />
                      </Field>

                      <Field label="رقم هاتف الواتساب (مع الرمز الدولي)">
                        <input
                          type="text"
                          value={newWaPhone}
                          onChange={(e) => setNewWaPhone(e.target.value)}
                          placeholder="+971501234567"
                          className={inputCls}
                        />
                      </Field>

                      <button
                        onClick={() => {
                          if (!newWaPhone.trim()) {
                            alert("يرجى إدخال رقم الهاتف أولاً");
                            return;
                          }
                          handleStartNewWaChat(newWaName, newWaPhone);
                          setNewWaName("");
                          setNewWaPhone("");
                          setShowNewWaChatModal(false);
                        }}
                        className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                      >
                        <Send size={16} /> فتح شاشة المحادثة المباشرة
                      </button>
                    </div>
                  </Modal>
                )}

                {/* ================= النظام المالي والأتعاب والضريبة ================= */}
                {tab === "invoices" && (
                  <InvoicesView
                    canViewFinancials={canViewFinancials}
                    currentUser={currentUser}
                    invoiceSubTab={invoiceSubTab}
                    setInvoiceSubTab={setInvoiceSubTab}
                    payments={payments}
                    setPayments={setPayments}
                    feeAgreements={feeAgreements}
                    clients={clients}
                    openModalWithCheck={openModalWithCheck}
                    requestDelete={requestDelete}
                    logAuditAction={logAuditAction}
                    getPaidForAgreement={getPaidForAgreement}
                    getRemainingForAgreement={getRemainingForAgreement}
                    isAgreementFullyPaid={isAgreementFullyPaid}
                    setForm={setForm}
                    checkPerm={checkPerm}
                    officeAgreements={officeAgreements}
                    setDeleteAgrConfirm={setDeleteAgrConfirm}
                    setShowInvoiceImportModal={setShowInvoiceImportModal}
                    invoices={invoices}
                    setInvoices={setInvoices}
                    clientName={clientName}
                    setInvoiceStatus={setInvoiceStatus}
                    openNotificationComposer={openNotificationComposer}
                    setReport={setReport}
                    timeLogs={timeLogs}
                    cases={cases}
                    convertTimeToInvoice={convertTimeToInvoice}
                    trustTransactions={trustTransactions}
                    caseNo={caseNo}
                    caseExpenses={caseExpenses}
                    trustReconciliations={trustReconciliations}
                    onSaveTrustReconciliation={saveTrustReconciliation}
                  />
                )}

                {tab === "office_agreement" && (
                  <OfficeAgreementView
                    setShowAgreementAiUploadModal={setShowAgreementAiUploadModal}
                    agrForm={agrForm}
                    setAgr={setAgr}
                    clients={clients}
                    addAgrInst={addAgrInst}
                    setAgrInst={setAgrInst}
                    removeAgrInst={removeAgrInst}
                    agrTotal={agrTotal}
                    saveOfficeAgreement={saveOfficeAgreement}
                    officeAgreements={officeAgreements}
                    setAgrPreviewId={setAgrPreviewId}
                    checkPerm={checkPerm}
                    setDeleteAgrConfirm={setDeleteAgrConfirm}
                  />
                )}

                {/* ================= المستندات ومولد المذكرات ================= */}
                {tab === "docs" && (
                  <DocsView
                    docSubTab={docSubTab}
                    setDocSubTab={setDocSubTab}
                    canManageLetterhead={canManageLetterhead}
                    canUseSignatureStamp={canUseSignatureStamp}
                    letterhead={letterhead}
                    logAuditAction={logAuditAction}
                    currentUser={currentUser}
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                    cases={cases}
                    selectedGenCaseId={selectedGenCaseId}
                    setSelectedGenCaseId={setSelectedGenCaseId}
                    clients={clients}
                    clientName={clientName}
                    docs={docs}
                    openModalWithCheck={openModalWithCheck}
                    requestDelete={requestDelete}
                    setDocs={setDocs}
                  />
                )}

                {/* ================= الهوية الرسمية والأختام (قسم محمي) ================= */}
                {tab === "official_identity" && (
                  <OfficialIdentityView
                    canManageLetterhead={canManageLetterhead}
                    letterhead={letterhead}
                    updateLetterhead={updateLetterhead}
                    deriveHeaderFooterFromFullPage={deriveHeaderFooterFromFullPage}
                    logAuditAction={logAuditAction}
                    currentUser={currentUser}
                    auditLogs={auditLogs}
                  />
                )}

                {/* ================= الوكالات ================= */}
                {tab === "poa" && (
                  <PoaView
                    poas={poas}
                    setPoas={setPoas}
                    clientName={clientName}
                    setShowPoaAiUploadModal={setShowPoaAiUploadModal}
                    openModalWithCheck={openModalWithCheck}
                    openNotificationComposer={openNotificationComposer}
                    requestDelete={requestDelete}
                    logAuditAction={logAuditAction}
                  />
                )}

                {/* ================= الزملاء المتعاونون وإنابات الحضور ================= */}
                {tab === "colleagues" && (
                  <ColleaguesView
                    colleagues={colleagues}
                    colleagueDelegations={colleagueDelegations}
                    colleagueSubTab={colleagueSubTab}
                    setColleagueSubTab={setColleagueSubTab}
                    cases={cases}
                    openColleagueModal={openColleagueModal}
                    openIssueDelegationModal={openIssueDelegationModal}
                    deleteColleagueHandler={deleteColleagueHandler}
                    deleteDelegationHandler={deleteDelegationHandler}
                    setDelegationPreviewId={setDelegationPreviewId}
                  />
                )}

                {/* ================= اعرف عميلك KYC وعناية AML ================= */}
                {tab === "kyc" && (
                  <KycView
                    kycSubTab={kycSubTab}
                    setKycSubTab={setKycSubTab}
                    kycWatchlist={kycWatchlist}
                    setKycWatchlist={setKycWatchlist}
                    strReports={strReports}
                    canManageStrReports={canManageStrReports}
                    requestDelete={requestDelete}
                    uaeTerroristList={uaeTerroristList}
                    logAuditAction={logAuditAction}
                    saveStorage={saveStorage}
                    setShowKycWatchlistUploadModal={setShowKycWatchlistUploadModal}
                    kycTypeOptions={kycTypeOptions}
                    kycTypeFilter={kycTypeFilter}
                    setKycTypeFilter={setKycTypeFilter}
                    kycWatchlistSearch={kycWatchlistSearch}
                    setKycWatchlistSearch={setKycWatchlistSearch}
                    filteredKycWatchlist={filteredKycWatchlist}
                    openModalWithCheck={openModalWithCheck}
                    clientName={clientName}
                    kyc={kyc}
                    kycDue={kycDue}
                    setForm={setForm}
                    setModal={setModal}
                    openNotificationComposer={openNotificationComposer}
                    setReport={setReport}
                    setKyc={setKyc}
                  />
                )}

                {/* ================= سجل التدقيق والأنشطة (Audit Log) ================= */}
                {tab === "audit_log" && (
                  <AuditLogView
                    filteredAuditLogs={filteredAuditLogs}
                    canViewAuditLog={canViewAuditLog}
                    auditLogs={auditLogs}
                    auditSearchTerm={auditSearchTerm}
                    setAuditSearchTerm={setAuditSearchTerm}
                    auditActionFilter={auditActionFilter}
                    setAuditActionFilter={setAuditActionFilter}
                    auditModuleFilter={auditModuleFilter}
                    setAuditModuleFilter={setAuditModuleFilter}
                    auditModuleOptions={auditModuleOptions}
                  />
                )}

                {/* ================= المبادئ والأحكام القضائية ================= */}
                {tab === "precedents" && (
                  <PrecedentsView
                    setShowAddPrecedentModal={setShowAddPrecedentModal}
                    precedentSearch={precedentSearch}
                    setPrecedentSearch={setPrecedentSearch}
                    precedentCourtFilter={precedentCourtFilter}
                    setPrecedentCourtFilter={setPrecedentCourtFilter}
                    precedentCategoryFilter={precedentCategoryFilter}
                    setPrecedentCategoryFilter={setPrecedentCategoryFilter}
                    precedentYearFilter={precedentYearFilter}
                    setPrecedentYearFilter={setPrecedentYearFilter}
                    filteredPrecedents={filteredPrecedents}
                    setSelectedPrecedent={setSelectedPrecedent}
                    userPerms={userPerms}
                    deletePrecedent={deletePrecedent}
                  />
                )}

                {/* ================= السياسات الداخلية للمكتب ================= */}
                {tab === "policies" && (
                  <PoliciesView
                    isSuperAdmin={isSuperAdmin}
                    openAddPolicy={openAddPolicy}
                    policySearch={policySearch}
                    setPolicySearch={setPolicySearch}
                    policyCategoryFilter={policyCategoryFilter}
                    setPolicyCategoryFilter={setPolicyCategoryFilter}
                    filteredPolicies={filteredPolicies}
                    policies={policies}
                    selectedPolicy={selectedPolicy}
                    setSelectedPolicy={setSelectedPolicy}
                    openEditPolicy={openEditPolicy}
                    handleDeletePolicy={handleDeletePolicy}
                  />
                )}

                {/* ================= المستخدمون والصلاحيات ================= */}
                {tab === "users" && (
                  <UsersView
                    setShowBackupModal={setShowBackupModal}
                    checkPerm={checkPerm}
                    setEditingUser={setEditingUser}
                    setForm={setForm}
                    setModal={setModal}
                    isAiAssistantEnabled={isAiAssistantEnabled}
                    setIsAiAssistantEnabled={setIsAiAssistantEnabled}
                    isAdmin={isAdmin}
                    pendingUsers={pendingUsers}
                    approveUser={approveUser}
                    rejectUser={rejectUser}
                    currentUser={currentUser}
                    currentUserId={currentUserId}
                    users={users}
                    setCurrentUserId={setCurrentUserId}
                    logAuditAction={logAuditAction}
                    isSuperAdmin={isSuperAdmin}
                    handleDeleteUser={handleDeleteUser}
                    toggleUserPermission={toggleUserPermission}
                  />
                )}

                {/* ================= دليل المحاكم والجهات القضائية ================= */}
                {tab === "courts_directory" && (
                  <CourtsDirectoryView
                    courtContacts={courtContacts}
                    setCourtContacts={setCourtContacts}
                    courtSearchQuery={courtSearchQuery}
                    setCourtSearchQuery={setCourtSearchQuery}
                    courtEmirateFilter={courtEmirateFilter}
                    setCourtEmirateFilter={setCourtEmirateFilter}
                    courtCategoryFilter={courtCategoryFilter}
                    setCourtCategoryFilter={setCourtCategoryFilter}
                    courtBranchFilter={courtBranchFilter}
                    setCourtBranchFilter={setCourtBranchFilter}
                    courtContactsFilterCache={courtContactsFilterCache}
                    courtFiltersExpanded={courtFiltersExpanded}
                    setCourtFiltersExpanded={setCourtFiltersExpanded}
                    courtExcelImportStatus={courtExcelImportStatus}
                    setCourtExcelImportStatus={setCourtExcelImportStatus}
                    downloadCourtContactsTemplate={downloadCourtContactsTemplate}
                    handleCourtExcelUpload={handleCourtExcelUpload}
                    requestDelete={requestDelete}
                    logAuditAction={logAuditAction}
                    setReport={setReport}
                    setEditingCourtContact={setEditingCourtContact}
                    setForm={setForm}
                    setModal={setModal}
                    sendWhatsAppMsg={sendWhatsAppMsg}
                    saveStorage={saveStorage}
                    seedCourtContacts={seedCourtContacts}
                  />
                )}

                {/* ================= الموظفون والكادر (HR) ================= */}
                {tab === "employees" && (
                  <EmployeesView
                    setForm={setForm}
                    setModal={setModal}
                    isSuperAdmin={isSuperAdmin}
                    employees={employees}
                    leaveRequests={leaveRequests}
                    employeeExpenses={employeeExpenses}
                    hrSubTab={hrSubTab}
                    setHrSubTab={setHrSubTab}
                    disciplinaryActions={disciplinaryActions}
                    employeeSearchQuery={employeeSearchQuery}
                    setEmployeeSearchQuery={setEmployeeSearchQuery}
                    deleteEmployee={deleteEmployee}
                    updateLeaveStatus={updateLeaveStatus}
                    updateExpenseStatus={updateExpenseStatus}
                    deleteDisciplinaryAction={deleteDisciplinaryAction}
                    cases={cases}
                  />
                )}

                {/* ================= حجز استشارة مرئية والتعيين ================= */}
                {tab === "booking_consultation" && (
                  <AdminConsultationsView
                    bookings={consultationBookings}
                    employees={users.map((u) => ({
                      id: u.id,
                      name: u.name,
                      jobTitle: u.roleTitle || "محامي ومستشار",
                    }))}
                    onAssignLawyer={(bookingId, lawyerId, lawyerName) => {
                      setConsultationBookings((prev) =>
                        prev.map((b) =>
                          b.id === bookingId
                            ? {
                                ...b,
                                status: "assigned",
                                assignedLawyerId: lawyerId,
                                assignedLawyerName: lawyerName,
                              }
                            : b,
                        ),
                      );
                      logAuditAction(
                        "UPDATE",
                        "استشارات مرئية",
                        `تعيين محامٍ للطلب #${bookingId}`,
                        `تم تحويل الاستشارة ورابط Google Meet إلى المحامي: ${lawyerName}`,
                      );
                    }}
                    onUpdateStatus={(bookingId, status) => {
                      setConsultationBookings((prev) =>
                        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
                      );
                    }}
                    settings={consultationSettings}
                    onUpdateSettings={(newSettings) => {
                      setConsultationSettings(newSettings);
                      logAuditAction(
                        "UPDATE",
                        "استشارات مرئية",
                        "تحديث إعدادات الأسعار والمواعيد",
                        `تم تعديل أسعار المواعيد أونلاين (30د: ${newSettings.price30}درهم، 60د: ${newSettings.price60}درهم)`,
                      );
                    }}
                    onOpenPublicPage={() => setCurrentRoute("public_consultation")}
                  />
                )}

                {(ACCOUNTING_MODULE_ENABLED ||
                  ACCOUNTING_TRIAL_USER_EMAILS.includes(currentUser?.email || "")) &&
                  tab === "accounting" && (
                    <AccountingModule
                      canManageAccounts={
                        isSuperAdmin || Boolean(currentUser.permissions?.manageChartOfAccounts)
                      }
                      canPostEntries={
                        isSuperAdmin || Boolean(currentUser.permissions?.postJournalEntries)
                      }
                      canDeleteEntries={
                        isSuperAdmin || Boolean(currentUser.permissions?.deleteJournalEntries)
                      }
                      canManageBankAccounts={
                        isSuperAdmin || Boolean(currentUser.permissions?.manageBankAccounts)
                      }
                      canRecordBankTransactions={
                        isSuperAdmin || Boolean(currentUser.permissions?.recordBankTransactions)
                      }
                      canDeleteBankTransactions={
                        isSuperAdmin || Boolean(currentUser.permissions?.deleteBankTransactions)
                      }
                      canManageSalesInvoices={
                        isSuperAdmin || Boolean(currentUser.permissions?.manageSalesInvoices)
                      }
                      canApproveSalesInvoices={
                        isSuperAdmin || Boolean(currentUser.permissions?.approveSalesInvoices)
                      }
                      canRecordSalesPayments={
                        isSuperAdmin || Boolean(currentUser.permissions?.recordSalesPayments)
                      }
                      canDeleteSalesInvoices={
                        isSuperAdmin || Boolean(currentUser.permissions?.deleteSalesInvoices)
                      }
                      canManageVendors={
                        isSuperAdmin || Boolean(currentUser.permissions?.manageVendors)
                      }
                      canDeleteVendors={
                        isSuperAdmin || Boolean(currentUser.permissions?.deleteVendors)
                      }
                      canManagePurchaseInvoices={
                        isSuperAdmin || Boolean(currentUser.permissions?.managePurchaseInvoices)
                      }
                      canApprovePurchaseInvoices={
                        isSuperAdmin || Boolean(currentUser.permissions?.approvePurchaseInvoices)
                      }
                      canRecordPurchasePayments={
                        isSuperAdmin || Boolean(currentUser.permissions?.recordPurchasePayments)
                      }
                      canDeletePurchaseInvoices={
                        isSuperAdmin || Boolean(currentUser.permissions?.deletePurchaseInvoices)
                      }
                      canManageFixedAssets={
                        isSuperAdmin || Boolean(currentUser.permissions?.manageFixedAssets)
                      }
                      canRunDepreciation={
                        isSuperAdmin || Boolean(currentUser.permissions?.runDepreciation)
                      }
                      canDeleteFixedAssets={
                        isSuperAdmin || Boolean(currentUser.permissions?.deleteFixedAssets)
                      }
                      canManagePayrollEmployees={
                        isSuperAdmin || Boolean(currentUser.permissions?.managePayrollEmployees)
                      }
                      canDeletePayrollEmployees={
                        isSuperAdmin || Boolean(currentUser.permissions?.deletePayrollEmployees)
                      }
                      canRunPayroll={isSuperAdmin || Boolean(currentUser.permissions?.runPayroll)}
                      canRecordPayrollPayments={
                        isSuperAdmin || Boolean(currentUser.permissions?.recordPayrollPayments)
                      }
                      currentUserName={currentUser.name}
                      letterheadHeaderImg={letterhead.headerImg}
                      letterheadFooterImg={letterhead.footerImg}
                    />
                  )}
              </ErrorBoundary>
            )}
          </div>
        </main>
      </div>

      {/* ================= النوافذ المنبثقة ================= */}
      <Suspense fallback={null}>
        {modal === "case" && (
          <CaseModal
            editingCase={editingCase}
            clients={clients}
            cases={cases}
            kyc={kyc}
            form={form}
            setForm={setForm}
            onFieldChange={f}
            onSave={saveCase}
            onClose={() => {
              setModal(null);
              setEditingCase(null);
            }}
          />
        )}

        {modal === "client" && (
          <ClientModal onFieldChange={f} onSave={saveClient} onClose={() => setModal(null)} />
        )}

        {modal === "hearing" && (
          <HearingModal
            cases={cases}
            clientName={clientName}
            onFieldChange={f}
            onSave={saveHearing}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "task" && (
          <TaskModal
            cases={cases}
            users={users}
            onFieldChange={f}
            onSave={saveTask}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "invoice" && (
          <InvoiceModal
            clients={clients}
            cases={cases}
            amount={form.amount}
            onFieldChange={f}
            onSave={saveInvoice}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة تسجيل الدفعات وسندات القبض ================= */}
        {modal === "payment" && (
          <PaymentModal
            clients={clients}
            feeAgreements={feeAgreements}
            form={form}
            setForm={setForm}
            clientName={clientName}
            getClientUnallocatedBalance={getClientUnallocatedBalance}
            getRemainingForAgreement={getRemainingForAgreement}
            isAgreementFullyPaid={isAgreementFullyPaid}
            onFieldChange={f}
            onSave={savePayment}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "doc" && (
          <DocModal
            cases={cases}
            onFieldChange={f}
            onSave={saveDoc}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "poa" && (
          <PoaModal
            clients={clients}
            onFieldChange={f}
            onSave={savePoa}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "colleague" && (
          <ColleagueModal
            editingColleagueId={editingColleagueId}
            form={form}
            onFieldChange={f}
            onSave={saveColleague}
            onClose={() => {
              setModal(null);
              setEditingColleagueId(null);
            }}
          />
        )}

        {modal === "issueDelegation" && (
          <IssueDelegationModal
            colleagues={colleagues}
            cases={cases}
            form={form}
            setForm={setForm}
            onFieldChange={f}
            onSave={issueDelegation}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "user" && (
          <UserModal
            editingUser={editingUser}
            currentUserId={currentUserId}
            form={form}
            setForm={setForm}
            onFieldChange={f}
            onSave={saveUser}
            onClose={() => setModal(null)}
            onDeleteUser={handleDeleteUser}
            setEditingUser={setEditingUser}
          />
        )}

        {/* ================= نافذة إضافة/تعديل KYC ================= */}
        {(modal === "kyc" || modal === "kyc-edit") && (
          <KycModal
            modal={modal}
            clients={clients}
            form={form}
            setForm={setForm}
            onFieldChange={f}
            onSave={saveKyc}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة تسجيل ساعات العمل ================= */}
        {modal === "time" && (
          <TimeLogModal
            cases={cases}
            clientName={clientName}
            users={users}
            currentUserName={currentUser.name}
            onFieldChange={f}
            onSave={saveTimeLog}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة تسجيل مصروف قضية ================= */}
        {modal === "expense" && (
          <CaseExpenseModal
            cases={cases}
            clientName={clientName}
            onFieldChange={f}
            onSave={saveCaseExpense}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة حساب الأمانات ================= */}
        {modal === "trust" && (
          <TrustTransactionModal
            clients={clients}
            cases={cases}
            onFieldChange={f}
            onSave={saveTrustTransaction}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة مواعيد الأحكام التلقائية ================= */}
        {modal === "deadline" && (
          <DeadlineModal
            cases={cases}
            users={users}
            form={form}
            setForm={setForm}
            clientName={clientName}
            onFieldChange={f}
            onSave={saveDeadline}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة سجل التنبيهات المرسلة للطعن ================= */}
        {selectedDeadlineLogs && (
          <Modal
            title={`سجل الإشعارات والتنبيهات للطعن (#${selectedDeadlineLogs.id})`}
            onClose={() => setSelectedDeadlineLogs(null)}
            wide
          >
            <div className="space-y-4 text-sm">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-bold">القضية: {caseNo(selectedDeadlineLogs.caseId)}</p>
                <p className="mt-0.5">
                  المحامي المسؤول:{" "}
                  <b>{selectedDeadlineLogs.assignedLawyerName || "المحامي سعود أحمد الشحي"}</b> (
                  {selectedDeadlineLogs.assignedLawyerEmail || "info@lawyersuood.com"})
                </p>
                <p className="mt-0.5">
                  آخر موعد للطعن:{" "}
                  <b className="text-red-700">{fmtDate(selectedDeadlineLogs.appealDeadlineDate)}</b>
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <History size={15} className="text-amber-600" /> سجّل الإشعارات الاستباقية التلقائية
                واليدوية:
              </h4>

              {!selectedDeadlineLogs.autoAlertLogs ||
              selectedDeadlineLogs.autoAlertLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-stone-50 rounded-xl border border-dashed border-slate-200">
                  لا توجد تنبيهات سابقة مُسجّلة لهذا الطعن بعد. يتم الإرسال التلقائي فور اقتراب
                  المهلة لـ 7 أيام و 3 أيام.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {selectedDeadlineLogs.autoAlertLogs.map((log) => (
                    <div key={log.id} className="app-card p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {log.type === "3_days"
                            ? "🚨 تنبيه حرج (3 أيام)"
                            : log.type === "7_days"
                              ? "⚠️ تنبيه استباقي (7 أيام)"
                              : "📱 تنبيه يدوي"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{log.messageSnippet}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1 mt-1">
                        <span>
                          المستلم: {log.lawyerName} ({log.recipientContact})
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          الحالة: {log.status === "sent" ? "تم الإرسال بنجاح ✅" : "قيد التنفيذ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setSelectedDeadlineLogs(null)}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-700"
              >
                إغلاق النافذة
              </button>
            </div>
          </Modal>
        )}

        {/* ================= نافذة إعادة تعيين المحامي المسؤول للطعن ================= */}
        {reassignDeadlineModal && (
          <Modal
            title="تغيير وإسناد المحامي المسؤول عن متابعة الطعن"
            onClose={() => setReassignDeadlineModal(null)}
          >
            <div className="space-y-4 text-sm">
              <p className="text-xs text-slate-600">
                قم باختيار المحامي المستهدف لإعادة إسناد ملف الطعن بالقضية{" "}
                <b>{caseNo(reassignDeadlineModal.caseId)}</b> وحفظ بيانات التواصل لتلقي تنبيهات
                الاستئناف تلقائياً.
              </p>

              <Field label="المحامي المسؤول الجديد">
                <select
                  onChange={(e) => {
                    const uId = Number(e.target.value);
                    const selU = users.find((u) => u.id === uId);
                    if (selU) {
                      setReassignDeadlineModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              assignedLawyerId: selU.id,
                              assignedLawyerName: selU.name,
                              assignedLawyerEmail: selU.email,
                              assignedLawyerPhone: selU.phone,
                            }
                          : null,
                      );
                    }
                  }}
                  value={reassignDeadlineModal.assignedLawyerId || ""}
                  className={inputCls}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleTitle || u.roleKey}) - {u.email}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="بريد المحامي لاستلام التنبيهات">
                  <input
                    value={reassignDeadlineModal.assignedLawyerEmail || ""}
                    onChange={(e) =>
                      setReassignDeadlineModal((prev) =>
                        prev ? { ...prev, assignedLawyerEmail: e.target.value } : null,
                      )
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="هاتف المحامي للإشعارات الفورية">
                  <input
                    value={reassignDeadlineModal.assignedLawyerPhone || ""}
                    onChange={(e) =>
                      setReassignDeadlineModal((prev) =>
                        prev ? { ...prev, assignedLawyerPhone: e.target.value } : null,
                      )
                    }
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="قناة التنبيه الاستباقي التلقائي المفضلة">
                <select
                  value={reassignDeadlineModal.preferredChannel || "both"}
                  onChange={(e) =>
                    setReassignDeadlineModal((prev) =>
                      prev ? { ...prev, preferredChannel: e.target.value as any } : null,
                    )
                  }
                  className={inputCls}
                >
                  <option value="both">إيميل + واتساب تلقائي (موصى به)</option>
                  <option value="email">البريد الإلكتروني فقط (SMTP)</option>
                  <option value="whatsapp">الواتساب المباشر فقط</option>
                </select>
              </Field>

              <button
                onClick={() => {
                  if (reassignDeadlineModal) {
                    setDeadlines((prev) =>
                      prev.map((x) =>
                        x.id === reassignDeadlineModal.id ? reassignDeadlineModal : x,
                      ),
                    );
                    setReassignDeadlineModal(null);
                  }
                }}
                className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors"
              >
                تأكيد وإسناد ملف الطعن
              </button>
            </div>
          </Modal>
        )}

        {/* ================= نافذة بلاغ الاشتباه STR ================= */}
        {modal === "str" && canManageStrReports && (
          <StrReportModal
            clients={clients}
            onFieldChange={f}
            onSave={saveStrReport}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة إرسال التنبيهات والرسائل ================= */}
        {notifyModal && (
          <Modal
            title={`مركز إرسال التنبيهات — ${notifyModal.type}`}
            onClose={() => setNotifyModal(null)}
          >
            <div className="space-y-4 text-sm">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Send size={14} /> تنبيه رسمي مباشر إلى الموكل
                </p>
                <p>يتم توثيق الرسالة تلقائياً في سجل التنبيهات بمجرد الضغط على إرسال.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="اسم المستلم">
                  <input
                    value={notifyModal.recipientName}
                    onChange={(e) =>
                      setNotifyModal({ ...notifyModal, recipientName: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="قناة الإرسال المفضلة">
                  <select
                    value={notifyModal.channel}
                    onChange={(e) =>
                      setNotifyModal({ ...notifyModal, channel: e.target.value as any })
                    }
                    className={inputCls}
                  >
                    <option value="واتساب">📱 عبر الواتساب (WhatsApp)</option>
                    <option value="إيميل">✉️ عبر البريد (Email)</option>
                    <option value="كلاهما">⚡ عبر الواتساب والبريد كلاهما</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="رقم الواتساب (+971)">
                  <input
                    value={notifyModal.recipientPhone}
                    onChange={(e) =>
                      setNotifyModal({ ...notifyModal, recipientPhone: e.target.value })
                    }
                    placeholder="+971 50 123 4567"
                    className={inputCls}
                  />
                </Field>
                <Field label="البريد الإلكتروني">
                  <input
                    value={notifyModal.recipientEmail}
                    onChange={(e) =>
                      setNotifyModal({ ...notifyModal, recipientEmail: e.target.value })
                    }
                    placeholder="client@example.com"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="عنوان التنبيه / الموضوع">
                <input
                  value={notifyModal.subject}
                  onChange={(e) => setNotifyModal({ ...notifyModal, subject: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field label="نص الرسالة الرسمية">
                <textarea
                  rows={6}
                  value={notifyModal.message}
                  onChange={(e) => setNotifyModal({ ...notifyModal, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 p-3 text-xs font-mono leading-relaxed text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </Field>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setNotifyModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={dispatchNotification}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-xs hover:bg-amber-400 shadow-sm"
                >
                  <Send size={15} /> إرسال الإشعار وتوثيقه بالباك أوفيس
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ================= نافذة إضافة/تعديل جهات المحاكم ================= */}
        {modal === "courtContact" && (
          <CourtContactModal
            editingCourtContact={editingCourtContact}
            form={form}
            onFieldChange={f}
            onSave={saveCourtContact}
            onClose={() => setModal(null)}
          />
        )}

        {/* ================= نافذة معاينة وتأكيد استيراد أرقام دليل المحاكم من إكسل ================= */}
        {courtExcelModalOpen && (
          <Modal
            wide
            title="معاينة واستيراد أرقام ودليل المحاكم والجهات من ملف إكسل"
            onClose={() => setCourtExcelModalOpen(false)}
          >
            <div className="space-y-4 text-sm">
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                  <FileSpreadsheet size={18} className="text-emerald-700" />
                  <span>
                    اسم الملف:{" "}
                    <b className="font-mono text-emerald-950">
                      {courtExcelFileName || "ملف_إكسل.xlsx"}
                    </b>
                  </span>
                </div>
                <span className="bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-xs font-extrabold">
                  عدد الجهات المكتشفة: {courtImportPreviewList.length} سجل
                </span>
              </div>

              {/* وضعية الاستيراد */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  طريقة معالجة البيانات عند الحفظ:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${courtExcelImportMode === "append" ? "bg-amber-50 border-amber-400 font-bold text-amber-900" : "bg-white border-slate-200 text-slate-700"}`}
                  >
                    <input
                      type="radio"
                      name="courtImportMode"
                      checked={courtExcelImportMode === "append"}
                      onChange={() => setCourtExcelImportMode("append")}
                      className="accent-amber-600"
                    />
                    <span>دمج مع الدليل الحالي (إضافة السجلات الجديدة)</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${courtExcelImportMode === "replace" ? "bg-red-50 border-red-400 font-bold text-red-900" : "bg-white border-slate-200 text-slate-700"}`}
                  >
                    <input
                      type="radio"
                      name="courtImportMode"
                      checked={courtExcelImportMode === "replace"}
                      onChange={() => setCourtExcelImportMode("replace")}
                      className="accent-red-600"
                    />
                    <span>استبدال الدليل الحالي بالكامل (مسح الدليل القديم)</span>
                  </label>
                </div>
              </div>

              {/* جدول المعاينة */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>جدول معاينة السجلات قبل اعتمادها:</span>
                  <span className="text-slate-500 font-normal">
                    يمكنك حذف أي صف غير مرغوب فيه بالنقر على علامة (X)
                  </span>
                </h4>
                <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 shadow-inner">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">اسم المحكمة / الجهة</th>
                        <th className="p-2.5">الإمارة</th>
                        <th className="p-2.5">القسم / التخصص</th>
                        <th className="p-2.5">الموظف / المسمى</th>
                        <th className="p-2.5">الهاتف والتمديدة</th>
                        <th className="p-2.5">البريد الإلكتروني</th>
                        {/* عمود ثابت (sticky) حتى يبقى زر الحذف ظاهراً دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                        <th className="sticky left-0 z-10 p-2.5 text-center bg-slate-100 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                          إجراء
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 bg-white">
                      {courtImportPreviewList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 text-slate-800 group">
                          <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{item.courtName}</td>
                          <td className="p-2.5">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {item.emirate}
                            </span>
                          </td>
                          <td className="p-2.5">{item.department}</td>
                          <td className="p-2.5 text-slate-600">{item.titleOrEmployee}</td>
                          <td className="p-2.5 font-mono text-slate-700">
                            {item.phone}{" "}
                            {item.extOrSeal && item.extOrSeal !== "—" ? `(${item.extOrSeal})` : ""}
                          </td>
                          <td className="p-2.5 font-mono text-slate-600 text-[11px]">
                            {item.email}
                          </td>
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-2.5 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                            <button
                              onClick={() =>
                                setCourtImportPreviewList((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="حذف هذا الصف من المعاينة"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <button
                  onClick={() => setCourtExcelModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors"
                >
                  إلغاء الأمر
                </button>
                <button
                  onClick={confirmCourtExcelImport}
                  disabled={courtImportPreviewList.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                >
                  <CheckCircle2 size={16} /> تأكيد واستيراد ({courtImportPreviewList.length}) جهة
                  إلى الدليل
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ================= نوافذ إدارة الموظفين والكادر (HR) ================= */}
        {modal === "employee" && (
          <EmployeeModal
            form={form}
            onFieldChange={f}
            onSave={saveEmployee}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "leave-request" && (
          <LeaveRequestModal
            employees={employees}
            form={form}
            onFieldChange={f}
            onSave={saveLeaveRequest}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "employee-expense" && (
          <EmployeeExpenseModal
            employees={employees}
            cases={cases}
            form={form}
            onFieldChange={f}
            onSave={saveEmployeeExpense}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "employee-disciplinary" && isSuperAdmin && (
          <DisciplinaryActionModal
            employees={employees}
            form={form}
            onFieldChange={f}
            onSave={saveDisciplinaryAction}
            onClose={() => setModal(null)}
          />
        )}
      </Suspense>

      {agrPreviewId !== null &&
        (() => {
          const oa = officeAgreements.find((a) => a.id === agrPreviewId);
          if (!oa) return null;
          const includesSigStampAgr =
            canUseSignatureStamp && Boolean(letterhead.signatureImg || letterhead.stampImg);
          const logAgreementUsage = () => {
            logAuditAction(
              "UPDATE",
              "الورق الرسمي",
              `طباعة اتفاقية أتعاب رقم: ${oa.agreementNumber}`,
              `استخدم المستخدم "${currentUser.name}" الورق الرسمي${includesSigStampAgr ? " والتوقيع والختم المعتمدين" : ""} لطباعة/تصدير اتفاقية الأتعاب رقم ${oa.agreementNumber}`,
              oa.id,
            );
          };
          const activeClauses =
            oa.customClauses && oa.customClauses.length > 0
              ? oa.customClauses
              : OFFICE_AGREEMENT_CLAUSES;
          const startEditAgreementClauses = () => {
            if (!checkPerm("manageAgreements", "تعديل بنود اتفاقية الأتعاب")) return;
            setAgreementClausesDraft(activeClauses.map((c) => ({ ...c })));
            setEditingAgreementClauses(true);
          };
          const saveAgreementClauses = () => {
            const cleaned = agreementClausesDraft.filter((c) => c.ar.trim() || c.en.trim());
            setOfficeAgreements((prev) =>
              prev.map((x) => (x.id === oa.id ? { ...x, customClauses: cleaned } : x)),
            );
            logAuditAction(
              "UPDATE",
              "اتفاقيات الأتعاب",
              `تعديل بنود اتفاقية رقم: ${oa.agreementNumber}`,
              `قام المستخدم "${currentUser.name}" بتعديل الشروط والبنود يدوياً لاتفاقية الأتعاب رقم ${oa.agreementNumber}`,
              oa.id,
            );
            setEditingAgreementClauses(false);
          };
          const cancelEditAgreementClauses = () => setEditingAgreementClauses(false);
          const resetAgreementClauses = () => {
            if (!checkPerm("manageAgreements", "استعادة البنود الافتراضية لاتفاقية الأتعاب"))
              return;
            setOfficeAgreements((prev) =>
              prev.map((x) => (x.id === oa.id ? { ...x, customClauses: undefined } : x)),
            );
            logAuditAction(
              "UPDATE",
              "اتفاقيات الأتعاب",
              `استعادة البنود الافتراضية لاتفاقية رقم: ${oa.agreementNumber}`,
              `قام المستخدم "${currentUser.name}" باستعادة الشروط والبنود الافتراضية لاتفاقية الأتعاب رقم ${oa.agreementNumber}`,
              oa.id,
            );
          };
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08130f]/75 p-4 overflow-y-auto">
              <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl print-area">
                {/* شريط الأدوات — لا يظهر عند الطباعة */}
                <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <FileCheck size={18} className="text-amber-600" />
                    <h3 className="font-bold text-slate-800">
                      معاينة الاتفاقية {oa.agreementNumber} — {oa.clientNameAr}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!checkPerm("deleteAgreements", "حذف اتفاقية الأتعاب")) return;
                        setDeleteAgrConfirm(oa);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 px-3.5 py-2 text-xs font-bold hover:bg-red-100 transition"
                      title="حذف هذه الاتفاقية"
                    >
                      <Trash2 size={15} /> حذف الاتفاقية
                    </button>
                    {!editingAgreementClauses && (
                      <button
                        onClick={startEditAgreementClauses}
                        className="flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition"
                        title="تعديل الشروط والبنود يدوياً لهذه الاتفاقية"
                      >
                        <Edit2 size={15} /> تعديل البنود
                      </button>
                    )}
                    {!editingAgreementClauses && oa.customClauses && (
                      <button
                        onClick={resetAgreementClauses}
                        className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                        title="استعادة البنود الافتراضية"
                      >
                        <RotateCcw size={15} /> استعادة الافتراضي
                      </button>
                    )}
                    {editingAgreementClauses ? (
                      <>
                        <button
                          onClick={saveAgreementClauses}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <Save size={15} /> حفظ البنود
                        </button>
                        <button
                          onClick={cancelEditAgreementClauses}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-[#0D382B]/[0.08] transition-colors transition"
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            logAgreementUsage();
                            window.print();
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 transition"
                          title="فتح نافذة الطباعة لحفظ الاتفاقية كملف PDF بجودة عالية (اختر 'حفظ كـ PDF' من الوجهة)"
                        >
                          <Download size={15} /> تحميل PDF
                        </button>
                        <button
                          onClick={() => {
                            logAgreementUsage();
                            window.print();
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400"
                        >
                          <Printer size={15} /> طباعة (Print)
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setAgrPreviewId(null);
                        setEditingAgreementClauses(false);
                      }}
                      className="rounded-full p-1 text-slate-400 hover:bg-[#0D382B]/[0.06] transition-colors hover:text-slate-700"
                      aria-label="إغلاق"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* ═══ نص الاتفاقية الكامل — مطابق للنموذج المعتمد ═══ */}
                <div
                  id="printable-agreement"
                  className="p-8 space-y-5 text-slate-900 leading-relaxed bg-white"
                >
                  {/* الترويسة المعتمدة */}
                  {letterhead.headerImg ? (
                    <div className="text-center pb-2">
                      <img
                        src={letterhead.headerImg}
                        alt="ترويسة المكتب"
                        className="w-full max-h-40 object-contain mx-auto"
                      />
                      <h2 className="text-base font-bold mt-4 underline underline-offset-4 text-slate-900">
                        عقد اتفاقية أتعاب محاماة — Legal Fees Agreement
                      </h2>
                    </div>
                  ) : (
                    <div className="text-center border-b-2 border-slate-900 pb-4">
                      <h1 className="text-lg font-bold">
                        سعود أحمد الشحي للمحاماة والاستشارات القانونية
                      </h1>
                      <p className="text-xs text-slate-600" dir="ltr">
                        Suood Ahmed Al Shehhi Advocates & Legal Consultants
                      </p>
                      <h2 className="text-base font-bold mt-3 underline underline-offset-4">
                        عقد اتفاقية أتعاب محاماة — Legal Fees Agreement
                      </h2>
                    </div>
                  )}

                  {/* الديباجة */}
                  <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 rounded-lg p-4">
                    <p className="leading-loose">
                      أُبرم هذا العقد في <b>{fmtDate(oa.contractDate)}</b> في{" "}
                      <b>{oa.contractCity}</b> بين: ١- المدرجة بياناتهم أدناه (ويشار إليهم فيما بعد
                      بـ"الموكل")، ٢- سعود أحمد الشحي للمحاماة والاستشارات القانونية، بحيث يقوم
                      بتزويد الموكل بالخدمات القانونية الواردة بهذا العقد بناءً على طلبهم ووفقاً
                      للبيانات والشروط الواردة أدناه.
                    </p>
                    <p className="leading-loose" dir="ltr">
                      This contract was concluded on <b>{oa.contractDate}</b> in{" "}
                      <b>{oa.contractCity}</b> between: 1) the party whose details are listed
                      hereunder, hereafter referred to as "the Client", and 2) Suood Ahmed Al Shehhi
                      Advocates & Legal Consultants, whereas the firm shall provide the Client with
                      the legal service(s) mentioned herein according to the following details and
                      conditions.
                    </p>
                  </div>

                  {/* بيانات الموكل */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                    <div className="bg-slate-900 text-amber-400 font-bold px-4 py-2 flex justify-between">
                      <span>بيانات الموكل</span>
                      <span dir="ltr">Details of the Client</span>
                    </div>
                    <div className="divide-y divide-slate-200">
                      <div className="grid grid-cols-2 gap-4 p-3">
                        <p>
                          الاسم: <b>{oa.clientNameAr}</b>
                          {oa.representativeAr ? (
                            <>
                              {" "}
                              — ويمثلها: <b>{oa.representativeAr}</b>
                            </>
                          ) : null}
                        </p>
                        <p dir="ltr">
                          Name: <b>{oa.clientNameEn || oa.clientNameAr}</b>
                          {oa.representativeEn ? (
                            <>
                              , represented by: <b>{oa.representativeEn}</b>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-3">
                        <p>
                          هاتف رقم: <b dir="ltr">{oa.phone || "—"}</b>
                        </p>
                        <p dir="ltr">
                          Phone number: <b>{oa.phone || "—"}</b>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-3">
                        <p>
                          تفاصيل القضية: <b>{oa.caseDetailsAr}</b>
                        </p>
                        <p dir="ltr">
                          Case Details: <b>{oa.caseDetailsEn || oa.caseDetailsAr}</b>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-3 bg-amber-50/60">
                        <p className="font-bold">{oa.paymentTermsAr}</p>
                        <p dir="ltr" className="font-bold">
                          {oa.paymentTermsEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* جدول الدفعات */}
                  {oa.installments.length > 1 && (
                    <table className="w-full text-[11px] border-collapse border border-slate-300 text-center">
                      <thead>
                        <tr className="bg-slate-100 font-bold">
                          <th className="border border-slate-300 p-1.5">الدفعة / Installment</th>
                          <th className="border border-slate-300 p-1.5">المبلغ / Amount (AED)</th>
                          <th className="border border-slate-300 p-1.5">
                            تاريخ الاستحقاق / Due Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {oa.installments.map((i, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-1.5 font-bold">{idx + 1}</td>
                            <td className="border border-slate-300 p-1.5 font-mono">
                              {i.amount.toLocaleString("en-US")}
                            </td>
                            <td className="border border-slate-300 p-1.5">
                              {fmtDate(i.dueDate)}
                              {i.paidOnSigning ? " (عند التوقيع)" : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* البنود الثابتة — قابلة للتعديل يدوياً لكل اتفاقية على حدة */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
                    <div className="bg-slate-100 font-bold px-4 py-2 grid grid-cols-2">
                      <span>الشروط والبنود</span>
                      <span dir="ltr">Terms & Conditions</span>
                    </div>
                    {editingAgreementClauses ? (
                      <div className="p-3 space-y-3 no-print">
                        {agreementClausesDraft.map((cl, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-2 gap-3 border border-slate-200 rounded-lg p-2 bg-slate-50"
                          >
                            <textarea
                              value={cl.ar}
                              onChange={(e) =>
                                setAgreementClausesDraft((prev) =>
                                  prev.map((c, i) =>
                                    i === idx ? { ...c, ar: e.target.value } : c,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs leading-relaxed min-h-[70px]"
                              placeholder={`البند (${idx + 1}) بالعربي`}
                            />
                            <div className="relative">
                              <textarea
                                dir="ltr"
                                value={cl.en}
                                onChange={(e) =>
                                  setAgreementClausesDraft((prev) =>
                                    prev.map((c, i) =>
                                      i === idx ? { ...c, en: e.target.value } : c,
                                    ),
                                  )
                                }
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs leading-relaxed min-h-[70px]"
                                placeholder={`Clause (${idx + 1}) in English`}
                              />
                              <button
                                onClick={() =>
                                  setAgreementClausesDraft((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  )
                                }
                                className="absolute -top-2 -left-2 rounded-full bg-red-100 text-red-600 p-1 hover:bg-red-200 transition"
                                title="حذف هذا البند"
                                type="button"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            setAgreementClausesDraft((prev) => [...prev, { ar: "", en: "" }])
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-white border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                          type="button"
                        >
                          <Plus size={14} /> إضافة بند جديد
                        </button>
                      </div>
                    ) : (
                      activeClauses.map((cl, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-4 p-3 border-t border-slate-200"
                        >
                          <p className="leading-relaxed whitespace-pre-line">
                            <b>({idx + 1})</b> {cl.ar}
                          </p>
                          <p className="leading-relaxed whitespace-pre-line" dir="ltr">
                            <b>{idx + 1}-</b> {cl.en}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* الإشهاد والتوقيعات */}
                  <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 rounded-lg p-4">
                    <p>
                      إشهاداً على ذلك فقد وقّع الطرفان على هذا العقد في اليوم والتاريخ المشار إليهما
                      سابقاً.
                    </p>
                    <p dir="ltr">
                      In witness hereof, the parties have signed this contract on the date first
                      mentioned here above.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-xs pt-6">
                    <div className="text-center">
                      <p className="font-bold">سعود أحمد الشحي للمحاماة والاستشارات القانونية</p>
                      {includesSigStampAgr ? (
                        <div className="relative inline-block h-16 w-40 mt-4">
                          {letterhead.stampImg && (
                            <img
                              src={letterhead.stampImg}
                              alt="ختم"
                              className="absolute top-0 right-2 h-16 w-16 object-contain opacity-90 -rotate-6"
                            />
                          )}
                          {letterhead.signatureImg && (
                            <img
                              src={letterhead.signatureImg}
                              alt="توقيع"
                              className="absolute bottom-0 left-0 h-10 object-contain"
                            />
                          )}
                        </div>
                      ) : null}
                      <p className="mt-10 border-t border-slate-400 pt-1 mx-8">التوقيع والختم</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">الموكل — Client: {oa.clientNameAr}</p>
                      <p className="mt-10 border-t border-slate-400 pt-1 mx-8">
                        توقيع الموكل / Client Signature
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-[11px] font-bold border-t-2 border-slate-900 pt-3">
                    <p>اللغة العربية هي اللغة المعتمدة في هذا العقد</p>
                    <p dir="ltr">Arabic is the approved language in this contract</p>
                  </div>

                  {/* تذييل الورقة الرسمية */}
                  {letterhead.footerImg && (
                    <div className="pt-2">
                      <img
                        src={letterhead.footerImg}
                        alt="تذييل المكتب"
                        className="w-full max-h-24 object-contain mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {delegationPreviewId !== null &&
        (() => {
          const d = colleagueDelegations.find((x) => x.id === delegationPreviewId);
          if (!d) return null;
          const colleague = colleagues.find((c) => c.id === d.colleagueId);
          const linkedCase = d.caseId ? cases.find((c) => c.id === d.caseId) : undefined;
          const logDelegationUsage = () => {
            const includesSigStamp =
              canUseSignatureStamp && Boolean(letterhead.signatureImg || letterhead.stampImg);
            logAuditAction(
              "UPDATE",
              "الورق الرسمي",
              `طباعة إنابة رقم: ${d.refNo}`,
              `استخدم المستخدم "${currentUser.name}" الورق الرسمي${includesSigStamp ? " والتوقيع والختم المعتمدين" : ""} لطباعة/تصدير الإنابة رقم ${d.refNo} الخاصة بالزميل ${colleague?.name || "—"}`,
              d.id,
            );
          };
          const startEditDelegationWording = () => {
            if (!checkPerm("manageColleagues", "تعديل صياغة الإنابة")) return;
            setDelegationDraftHtml(d.customBodyHtml || delegationBodyRef.current?.innerHTML || "");
            setEditingDelegationWording(true);
          };
          const saveDelegationWording = () => {
            setColleagueDelegations((prev) =>
              prev.map((x) => (x.id === d.id ? { ...x, customBodyHtml: delegationDraftHtml } : x)),
            );
            logAuditAction(
              "UPDATE",
              "الزملاء والإنابات",
              `تعديل صياغة إنابة رقم: ${d.refNo}`,
              `قام المستخدم "${currentUser.name}" بتعديل صياغة نص الإنابة رقم ${d.refNo} يدوياً`,
              d.id,
            );
            setEditingDelegationWording(false);
          };
          const cancelEditDelegationWording = () => setEditingDelegationWording(false);
          const resetDelegationWording = () => {
            if (!checkPerm("manageColleagues", "استعادة الصياغة الافتراضية للإنابة")) return;
            setColleagueDelegations((prev) =>
              prev.map((x) => (x.id === d.id ? { ...x, customBodyHtml: undefined } : x)),
            );
            logAuditAction(
              "UPDATE",
              "الزملاء والإنابات",
              `استعادة الصياغة الافتراضية لإنابة رقم: ${d.refNo}`,
              `قام المستخدم "${currentUser.name}" باستعادة الصياغة التلقائية الافتراضية لنص الإنابة رقم ${d.refNo}`,
              d.id,
            );
          };
          // طباعة/تصدير الإنابة عبر نفس أسلوب الطباعة الأصلي المعتمد في قسم "المذكرات"
          // (مستند HTML مستقل بصور ترويسة/تذييل بحجمها الكامل داخل إطار iframe مخفي)
          // بدل window.print() على الصفحة الحية — يحل هذا مشكلتي تصغير الورق الرسمي
          // وإضافة المتصفح التلقائية لعنوان الصفحة ورابط الموقع أعلى/أسفل كل ورقة.
          const handleDelegationPrint = () => {
            logDelegationUsage();
            const includesSigStamp =
              canUseSignatureStamp && Boolean(letterhead.signatureImg || letterhead.stampImg);
            const html = buildDelegationPrintHtml({
              refNo: d.refNo,
              dateLabel: fmtDate(d.issuedAt.slice(0, 10)),
              courtName: linkedCase?.court || "المحكمة المختصة",
              caseNumber: linkedCase?.number || d.caseTitleSnapshot || "—",
              clientName: linkedCase ? clientName(linkedCase.clientId) : "—",
              clientCapacity: linkedCase?.clientCapacity || "—",
              opponents: linkedCase ? caseOpponentsLabel(linkedCase) || "—" : "—",
              issuedByName: d.issuedByName,
              issuerLicenseNumber: d.issuerLicenseNumber || "—",
              colleagueName: colleague?.name || "—",
              colleagueLicenseNumber: d.colleagueLicenseNumber || "—",
              sessionDateLabel: d.sessionDate ? fmtDate(d.sessionDate) : undefined,
              caseTitleSnapshot:
                !linkedCase && d.caseTitleSnapshot ? d.caseTitleSnapshot : undefined,
              purpose: d.purpose,
              customBodyHtml: d.customBodyHtml,
              headerImg: letterhead.headerImg,
              footerImg: letterhead.footerImg,
              signatureImg: letterhead.signatureImg,
              stampImg: letterhead.stampImg,
              showSignatureStamp: includesSigStamp,
            });
            printHtmlDocumentInHiddenIframe(html);
          };
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08130f]/75 p-4 overflow-y-auto">
              <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl print-area">
                <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <FileSignature size={18} className="text-amber-600" />
                    <h3 className="font-bold text-slate-800">معاينة الإنابة {d.refNo}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingDelegationWording ? (
                      <>
                        <button
                          onClick={saveDelegationWording}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <Save size={15} /> حفظ الصياغة
                        </button>
                        <button
                          onClick={cancelEditDelegationWording}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-[#0D382B]/[0.08] transition-colors transition"
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={startEditDelegationWording}
                          className="flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition"
                          title="تعديل صياغة نص الإنابة يدوياً"
                        >
                          <Edit2 size={15} /> تعديل الصياغة
                        </button>
                        {d.customBodyHtml && (
                          <button
                            onClick={resetDelegationWording}
                            className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                            title="استعادة الصياغة التلقائية الافتراضية"
                          >
                            <RotateCcw size={15} /> استعادة الافتراضي
                          </button>
                        )}
                        <button
                          onClick={handleDelegationPrint}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 transition"
                          title="فتح نافذة الطباعة لحفظ الإنابة كملف PDF بجودة عالية (اختر 'حفظ كـ PDF' من الوجهة)"
                        >
                          <Download size={15} /> تحميل PDF
                        </button>
                        <button
                          onClick={handleDelegationPrint}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400"
                        >
                          <Printer size={15} /> طباعة
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setDelegationPreviewId(null);
                        setEditingDelegationWording(false);
                      }}
                      className="rounded-full p-1 text-slate-400 hover:bg-[#0D382B]/[0.06] transition-colors hover:text-slate-700"
                      aria-label="إغلاق"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div
                  id="printable-delegation"
                  className="p-8 space-y-5 text-slate-900 leading-relaxed bg-white"
                >
                  {letterhead.headerImg && (
                    <div className="mb-4 -mx-8 -mt-8">
                      <img
                        src={letterhead.headerImg}
                        alt="ترويسة المكتب"
                        className="w-full block"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-[10px] text-slate-300 font-mono text-right">
                      الرقم المرجعي: {d.refNo}
                    </span>
                    <span className="text-xs text-slate-600">
                      التاريخ: {fmtDate(d.issuedAt.slice(0, 10))}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>لدى {linkedCase?.court || "المحكمة المختصة"} الموقرة ,,,</p>
                    <p>
                      في القضية رقم :- <b>{linkedCase?.number || d.caseTitleSnapshot || "—"}</b>
                    </p>
                  </div>
                  <div ref={delegationBodyRef} className="space-y-5">
                    {editingDelegationWording ? (
                      <div className="delegation-quill-editor">
                        <ReactQuill
                          theme="snow"
                          value={delegationDraftHtml}
                          onChange={setDelegationDraftHtml}
                        />
                      </div>
                    ) : d.customBodyHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(d.customBodyHtml) }} />
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-center tracking-[0.3em]">إنـابـة</h2>
                        <div className="text-sm space-y-2.5">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <span>
                              الموكل :- <b>{linkedCase ? clientName(linkedCase.clientId) : "—"}</b>
                            </span>
                            <span>
                              الصفة :- <b>{linkedCase?.clientCapacity || "—"}</b>
                            </span>
                          </div>
                          <p>
                            ضـــد :-{" "}
                            <b>{linkedCase ? caseOpponentsLabel(linkedCase) || "—" : "—"}</b>
                          </p>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-2 border-t border-dashed border-slate-300">
                            <span>
                              أنـــا المحامي :- <b>{d.issuedByName}</b>
                            </span>
                            <span>
                              قيد رقم :- <b>{d.issuerLicenseNumber || "—"}</b>
                            </span>
                          </div>
                          <p className="leading-loose">
                            بموجب هذه الإنابة، وبصفتي وكيلاً عن الموكل المذكور أعلاه أنيب زميلي
                            الأستاذ المحامي :- <b>{colleague?.name || "—"}</b>
                            {"  "}قيد رقم :- <b>{d.colleagueLicenseNumber || "—"}</b>
                          </p>
                          <p className="leading-loose">
                            للحضور والترافع والقيام بجميع الإجراءات اللازمة نيابة عني في القضية
                            المذكورة أعلاه
                            {d.sessionDate ? (
                              <>
                                {" "}
                                وذلك بجلسة يوم <b>{fmtDate(d.sessionDate)}</b>
                              </>
                            ) : (
                              ""
                            )}
                            {!linkedCase && d.caseTitleSnapshot ? ` (${d.caseTitleSnapshot})` : ""}.
                          </p>
                        </div>
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm">
                          <p className="font-bold mb-1">الغرض من الإنابة:</p>
                          <p className="whitespace-pre-line">{d.purpose}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-sm">وتفضلوا بقبول وافر الاحترام والتقدير.</p>
                  <div className="pt-8 text-sm">
                    <p className="font-bold">المحامي الموكل</p>
                    <p className="mt-1">الاسم :- {d.issuedByName}</p>
                    {canUseSignatureStamp && (letterhead.signatureImg || letterhead.stampImg) ? (
                      <div className="relative inline-block h-20 w-44 mt-2 mb-1">
                        {letterhead.stampImg && (
                          <img
                            src={letterhead.stampImg}
                            alt="ختم"
                            className="absolute top-0 right-4 h-20 w-20 object-contain opacity-90 -rotate-6"
                          />
                        )}
                        {letterhead.signatureImg && (
                          <img
                            src={letterhead.signatureImg}
                            alt="توقيع"
                            className="absolute bottom-1 left-0 h-11 object-contain"
                          />
                        )}
                      </div>
                    ) : null}
                    <p className="border-t border-slate-400 pt-1 mt-8 inline-block">
                      التوقيع والختم
                    </p>
                  </div>
                  {letterhead.footerImg && (
                    <div className="pt-6 -mx-8 -mb-8">
                      <img src={letterhead.footerImg} alt="تذييل المكتب" className="w-full block" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* ================= نافذة التقرير القابل للطباعة ================= */}
      {report &&
        (() => {
          const isRollReport = typeof report === "object" && report.type === "roll";
          const isKycSingle = typeof report === "object" && report.kycId;
          const kycRec = isKycSingle ? kyc.find((k) => k.id === report.kycId) : null;
          const clientObj = kycRec ? clients.find((c) => c.id === kycRec.clientId) : null;

          const rollDate = isRollReport ? report.date : "";
          const rollCourt = isRollReport ? report.court : "الكل";

          const rollList = hearings
            .filter((h) => {
              const matchDate = !rollDate || h.date === rollDate;
              const cs = cases.find((c) => c.id === h.caseId);
              const matchCourt = rollCourt === "الكل" || (cs && cs.court === rollCourt);
              return matchDate && matchCourt;
            })
            .sort((a, b) => a.date.localeCompare(b.date));

          const currentTabObj = NAV.find((n) => n.id === tab);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08130f]/75 p-4 no-print overflow-y-auto">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl print-area">
                {/* شريط الإجراءات العلوي للتقرير (لا يظهر عند الطباعة) */}
                <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <Printer size={18} className="text-amber-600" />
                    <h3 className="font-bold text-slate-800">
                      {isRollReport
                        ? `رول الجلسات القضائية — ${rollDate ? fmtDate(rollDate) : "جميع الجلسات"}`
                        : isKycSingle
                          ? `نموذج التحقق والعناية الواجبة (KYC) — ${clientObj?.name || ""}`
                          : `تقرير قسم: ${currentTabObj?.label || ""}`}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400"
                    >
                      <Printer size={15} /> طباعة الآن (PDF)
                    </button>
                    <button
                      onClick={() => setReport(null)}
                      className="rounded-full p-1 text-slate-400 hover:bg-[#0D382B]/[0.06] transition-colors hover:text-slate-700"
                      aria-label="إغلاق"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* محتوى التقرير الذي سيتم طباعته رسمياً */}
                <div className="p-8 space-y-6 text-slate-900 leading-relaxed font-sans">
                  {/* ترويسة المكتب الرسمية مع الشعار الأصلي */}
                  <div className="flex items-center justify-between border-b-2 border-[#0c4a47] pb-4">
                    <Logo variant="horizontal" mode="light" size="lg" />
                    <div className="text-left text-xs text-slate-600 space-y-0.5">
                      <p className="font-bold text-[#0c4a47]">
                        تاريخ التقرير: {fmtDate(todayISO())}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        المستخدم المستخرج: {currentUser.name}
                      </p>
                      <p className="text-[11px] text-[#b89b6a] font-bold">
                        {currentUser.roleTitle}
                      </p>
                      <p className="text-[10px] text-slate-400">الإمارات العربية المتحدة • UAE</p>
                    </div>
                  </div>

                  {/* محتوى تقرير رول الجلسات القابل للطباعة */}
                  {isRollReport ? (
                    <div className="space-y-6">
                      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-amber-400">
                            كشف ورول الجلسات القضائية اليومي
                          </h2>
                          <p className="text-xs text-slate-300 mt-0.5">
                            جدول حضور المحامين وتتبع قاعات ومواعيد الجلسات
                          </p>
                        </div>
                        <div className="text-left text-xs font-mono">
                          <p>
                            التاريخ: <b>{rollDate ? fmtDate(rollDate) : "جميع التواريخ"}</b>
                          </p>
                          <p>
                            المحكمة: <b>{rollCourt}</b>
                          </p>
                          <p>
                            عدد الجلسات: <b>{rollList.length}</b>
                          </p>
                        </div>
                      </div>

                      <table className="w-full text-right border-collapse border border-slate-300 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                            <th className="p-2.5 border border-slate-300 text-center">م</th>
                            <th className="p-2.5 border border-slate-300">رقم القضية والدائرة</th>
                            <th className="p-2.5 border border-slate-300">اسم الموكل</th>
                            <th className="p-2.5 border border-slate-300">المحكمة / القاعة</th>
                            <th className="p-2.5 border border-slate-300 text-center">
                              التاريخ والوقت
                            </th>
                            <th className="p-2.5 border border-slate-300">نوع الجلسة والمطلوب</th>
                            <th className="p-2.5 border border-slate-300 text-center">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rollList.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-slate-500">
                                لا توجد جلسات مجدولة لهذا التاريخ أو المحكمة في النظام.
                              </td>
                            </tr>
                          ) : (
                            rollList.map((h, idx) => {
                              const cs = cases.find((c) => c.id === h.caseId);
                              return (
                                <tr
                                  key={h.id}
                                  className="border-b border-slate-200 hover:bg-slate-50"
                                >
                                  <td className="p-2.5 border border-slate-300 text-center font-bold font-mono">
                                    {idx + 1}
                                  </td>
                                  <td className="p-2.5 border border-slate-300">
                                    <p className="font-bold text-slate-900">
                                      {cs ? cs.number : "—"}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {cs ? cs.subject : ""}
                                    </p>
                                  </td>
                                  <td className="p-2.5 border border-slate-300 font-medium">
                                    {cs ? clientName(cs.clientId) : "—"}
                                  </td>
                                  <td className="p-2.5 border border-slate-300">
                                    <p className="font-semibold">{cs ? cs.court : "—"}</p>
                                    <p className="text-[11px] text-slate-500">{h.room}</p>
                                  </td>
                                  <td className="p-2.5 border border-slate-300 text-center font-mono">
                                    <p className="font-bold">{fmtDate(h.date)}</p>
                                    <p className="text-slate-500">{h.time}</p>
                                  </td>
                                  <td className="p-2.5 border border-slate-300">
                                    <p className="font-bold text-slate-900">{h.type}</p>
                                    {h.notes && (
                                      <p className="text-[11px] text-slate-600 mt-0.5 bg-stone-50 p-1 rounded border border-stone-200">
                                        المطلوب: {h.notes}
                                      </p>
                                    )}
                                  </td>
                                  <td className="p-2.5 border border-slate-300 text-center">
                                    {h.done ? (
                                      <span className="font-bold text-emerald-700">منتهية</span>
                                    ) : (
                                      <span className="font-bold text-amber-700">قائمة</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>

                      <div className="pt-8 border-t border-slate-300 grid grid-cols-2 text-xs text-center">
                        <div>
                          <p className="font-bold">توقيع المحامي الحاضر / المسؤول:</p>
                          <p className="mt-8">..................................................</p>
                        </div>
                        <div>
                          <p className="font-bold">اعتماد كشف الجلسات:</p>
                          <p className="mt-8">مكتب سعود أحمد الشحي للمحاماة</p>
                        </div>
                      </div>
                    </div>
                  ) : isKycSingle && kycRec && clientObj ? (
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <h2 className="text-lg font-bold text-amber-900">
                          استمارة اعرف عميلك وفحص مكافحة غسل الأموال (KYC / AML)
                        </h2>
                        <p className="text-xs text-amber-800">
                          وفقًا لأحكام القانون الاتحادي رقم (20) لسنة 2018 بشأن مواجهة جرائم غسل
                          الأموال
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="border border-slate-200 p-3 rounded-xl space-y-1">
                          <p className="text-slate-500">اسم الموكل / الشركة:</p>
                          <p className="font-bold text-sm text-slate-900">{clientObj.name}</p>
                          <p className="text-slate-600">
                            نوع الشخصية: {clientObj.type} | الإمارة: {clientObj.emirate}
                          </p>
                          <p className="text-slate-600">
                            رقم الهاتف: {clientObj.phone} | البريد: {clientObj.email}
                          </p>
                        </div>
                        <div className="border border-slate-200 p-3 rounded-xl space-y-1">
                          <p className="text-slate-500">الجنسية / الدولة:</p>
                          <p className="font-bold text-sm text-slate-900">{kycRec.nationality}</p>
                          <p className="text-slate-600">نوع الوثيقة: {kycRec.idType}</p>
                          <p className="text-slate-600">
                            تاريخ انتهاء الوثيقة: {fmtDate(kycRec.idExpiry)}
                          </p>
                        </div>
                      </div>

                      <div className="border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                        <h3 className="font-bold text-slate-900 border-b pb-1">
                          نتائج العناية الواجبة والتحقق من المخاطر
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          <p>
                            <b>المستفيد الحقيقي (UBO):</b> {kycRec.ubo}
                          </p>
                          <p>
                            <b>مصدر الأموال:</b> {kycRec.sourceOfFunds}
                          </p>
                          <p>
                            <b>معرّض سياسيًا (PEP):</b>{" "}
                            {kycRec.pep ? "نعم (يلزم عناية مشددة)" : "لا"}
                          </p>
                          <p>
                            <b>فحص قوائم العقوبات:</b>{" "}
                            <span className="font-bold">{kycRec.sanctions}</span>
                          </p>
                          <p>
                            <b>تصنيف المخاطر:</b> <span className="font-bold">{kycRec.risk}</span>
                          </p>
                          <p>
                            <b>حالة الملف:</b> <span className="font-bold">{kycRec.status}</span>
                          </p>
                        </div>
                        <p className="pt-2">
                          <b>تاريخ المراجعة الأخيرة:</b> {fmtDate(kycRec.lastReview)} |{" "}
                          <b>المراجعة القادمة:</b>{" "}
                          {fmtDate(nextReviewDate(kycRec.lastReview, kycRec.risk))}
                        </p>
                        {kycRec.notes && (
                          <p className="bg-stone-50 p-2 rounded border text-slate-700 mt-2">
                            <b>ملاحظات الفحص:</b> {kycRec.notes}
                          </p>
                        )}
                      </div>

                      <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-xs text-center">
                        <div>
                          <p className="font-bold">توقيع مسؤول الامتثال / المحامي:</p>
                          <p className="mt-8">..................................................</p>
                        </div>
                        <div>
                          <p className="font-bold">خاتم المكتب:</p>
                          <div className="mt-4 mx-auto w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400">
                            مكتب المحاماة
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* محتوى تقرير القسم العام */
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between bg-stone-100 p-3 rounded-xl">
                        <h2 className="font-bold text-sm text-slate-900">
                          تقرير المخرجات التفصيلية — {currentTabObj?.label}
                        </h2>
                        <span className="text-slate-500">
                          إجمالي السجلات:{" "}
                          {tab === "cases"
                            ? cases.length
                            : tab === "clients"
                              ? clients.length
                              : tab === "hearings"
                                ? hearings.length
                                : tab === "tasks"
                                  ? tasks.length
                                  : tab === "invoices"
                                    ? invoices.length
                                    : tab === "kyc"
                                      ? kyc.length
                                      : tab === "poa"
                                        ? poas.length
                                        : 0}
                        </span>
                      </div>

                      {tab === "cases" && (
                        <table className="w-full text-right border-collapse border border-slate-200">
                          <thead>
                            <tr className="bg-slate-100 border-b">
                              <th className="p-2 border">رقم القضية</th>
                              <th className="p-2 border">الموكل</th>
                              <th className="p-2 border">المحكمة</th>
                              <th className="p-2 border">الحالة</th>
                              {canViewFinancials && <th className="p-2 border">الأتعاب</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {cases.map((c) => (
                              <tr key={c.id} className="border-b">
                                <td className="p-2 border font-bold">{c.number}</td>
                                <td className="p-2 border">{clientName(c.clientId)}</td>
                                <td className="p-2 border">{c.court}</td>
                                <td className="p-2 border">{c.status}</td>
                                {canViewFinancials && (
                                  <td className="p-2 border">{fmtAED(c.fee)}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {tab === "kyc" && (
                        <table className="w-full text-right border-collapse border border-slate-200">
                          <thead>
                            <tr className="bg-slate-100 border-b">
                              <th className="p-2 border">الموكل</th>
                              <th className="p-2 border">الجنسية</th>
                              <th className="p-2 border">المستفيد UBO</th>
                              <th className="p-2 border">المخاطر</th>
                              <th className="p-2 border">العقوبات</th>
                              <th className="p-2 border">المراجعة القادمة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kyc.map((k) => (
                              <tr key={k.id} className="border-b">
                                <td className="p-2 border font-bold">{clientName(k.clientId)}</td>
                                <td className="p-2 border">{k.nationality}</td>
                                <td className="p-2 border">{k.ubo}</td>
                                <td className="p-2 border">{k.risk}</td>
                                <td className="p-2 border">{k.sanctions}</td>
                                <td className="p-2 border">
                                  {fmtDate(nextReviewDate(k.lastReview, k.risk))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {(tab === "courts_directory" ||
                        (typeof report === "object" && report?.type === "court-directory")) && (
                        <table className="w-full text-right border-collapse border border-slate-200">
                          <thead>
                            <tr className="bg-slate-100 border-b">
                              <th className="p-2 border">المحكمة / الجهة</th>
                              <th className="p-2 border">الإمارة</th>
                              <th className="p-2 border">القسم / الدائرة</th>
                              <th className="p-2 border">المسؤول / الصفة</th>
                              <th className="p-2 border">الهاتف المباشر</th>
                              <th className="p-2 border">الخاتم / التمديدة</th>
                              <th className="p-2 border">البريد الإلكتروني</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courtContacts.map((c) => (
                              <tr key={c.id} className="border-b">
                                <td className="p-2 border font-bold text-slate-900">
                                  {c.courtName}
                                </td>
                                <td className="p-2 border font-bold text-amber-800">{c.emirate}</td>
                                <td className="p-2 border">{c.department}</td>
                                <td className="p-2 border">{c.titleOrEmployee}</td>
                                <td className="p-2 border font-mono" dir="ltr">
                                  {c.phone}
                                </td>
                                <td className="p-2 border font-bold text-amber-900">
                                  {c.extOrSeal}
                                </td>
                                <td className="p-2 border font-mono text-xs" dir="ltr">
                                  {c.email}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {tab !== "cases" &&
                        tab !== "kyc" &&
                        tab !== "courts_directory" &&
                        (typeof report !== "object" || report?.type !== "court-directory") && (
                          <p className="text-slate-500 text-center py-6">
                            جدول ملخص البيانات جاهز للطباعة المباشرة من النظام.
                          </p>
                        )}

                      <div className="pt-6 text-[11px] text-slate-400 text-center border-t">
                        تم استخراج هذا التقرير تلقائيًا بواسطة نظام سعود أحمد الشحي للمحاماة — كافة
                        الحقوق محفوظة © 2026
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* ═══ نافذة تأكيد الحذف الموحدة لجميع الأقسام مع الصلاحيات ═══ */}
      {deleteModalState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#08130f]/80 p-4 backdrop-blur-sm no-print animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-red-200 space-y-4 text-slate-900">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-2xl bg-red-100 p-3 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {deleteModalState.section}
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  تأكيد الحذف النهائي
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <p className="text-sm font-bold text-slate-900">{deleteModalState.title}</p>
              {deleteModalState.details && (
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {deleteModalState.details}
                </p>
              )}
            </div>

            <div className="text-xs text-red-700 bg-red-50/90 p-3.5 rounded-xl border border-red-200 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1">
                ⚠️ تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه.
              </p>
              <p className="text-[11px] text-red-600">
                سيتم مسح هذا السجل وحفظ العملية في سجل التدقيق الأمني والرقابة.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalState(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors transition cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={() => {
                  const onConf = deleteModalState.onConfirm;
                  setDeleteModalState(null);
                  if (onConf) onConf();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
              >
                <Trash2 size={15} /> نعم، تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ نافذة تأكيد حذف الاتفاقية ═══ */}
      {deleteAgrConfirm &&
        (() => {
          const cid = deleteAgrConfirm.clientId;
          const hasOtherOfficeAgr = officeAgreements.some(
            (a) => a.id !== deleteAgrConfirm.id && a.clientId === cid,
          );
          const hasOtherFeeAgr = feeAgreements.some(
            (fa) => fa.id !== deleteAgrConfirm.feeAgreementId && fa.clientId === cid,
          );
          const hasCases = cases.some((c) => c.clientId === cid);
          const hasInvoices = invoices.some((inv) => inv.clientId === cid);
          const hasPoas = poas.some((p) => p.clientId === cid);
          const willDeleteClient =
            cid && !(hasOtherOfficeAgr || hasOtherFeeAgr || hasCases || hasInvoices || hasPoas);

          return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#08130f]/65 p-4 backdrop-blur-sm no-print">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="rounded-full bg-red-100 p-2.5">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold">تأكيد حذف الاتفاقية</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف الاتفاقية رقم{" "}
                  <span className="font-mono font-bold text-slate-900 bg-stone-100 px-2 py-0.5 rounded border border-slate-200">
                    {deleteAgrConfirm.agreementNumber}
                  </span>{" "}
                  الخاصة بالموكل{" "}
                  <span className="font-bold text-slate-900">{deleteAgrConfirm.clientNameAr}</span>؟
                </p>
                <div className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-100 leading-relaxed space-y-1.5">
                  <p>⚠️ تنبيه: سيتم حذف الاتفاقية نهائياً من الأرشيف وسجل اتفاقيات الأتعاب.</p>
                  {willDeleteClient && (
                    <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                      👤 <strong>ملاحظة:</strong> سيتم أيضاً إلغاء/حذف الموكل (
                      {deleteAgrConfirm.clientNameAr}) تلقائياً لعدم وجود أي اتفاقيات أو قضايا أخرى
                      مرتبطة به بالمكتب.
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDeleteAgrConfirm(null)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleExecuteDeleteAgreement}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md transition"
                  >
                    <Trash2 size={15} /> نعم، احذف الاتفاقية
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ═══ مودال القبول وتخصيص الصلاحيات للمستخدمين الجدد (Pending Approval Flow) ═══ */}
      {approvingUser && (
        <Modal
          title={`قبول واعتماد المستخدم: ${approvingUser.name}`}
          onClose={() => setApprovingUser(null)}
        >
          <div className="space-y-5 text-sm">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
              <p className="font-bold">طلب اعتماد جديد</p>
              <p className="opacity-90">
                البريد: {approvingUser.email} | الهاتف: {approvingUser.phone}
              </p>
            </div>

            <Field label="المسمى الوظيفي والدور المحدد">
              <input
                value={assignRoleTitle}
                onChange={(e) => setAssignRoleTitle(e.target.value)}
                placeholder="مثال: محامي مستشار مدني وتجاري"
                className={inputCls}
              />
            </Field>

            <Field label="القالب الأساسي للصلاحيات">
              <select
                value={assignRoleKey}
                onChange={(e) => setAssignRoleKey(e.target.value as any)}
                className={inputCls}
              >
                <option value="admin">مدير النظام / محامٍ شريك (شامل الصلاحيات)</option>
                <option value="lawyer">محامٍ ومستشار قانوني (قضايا وجلسات ومهام)</option>
                <option value="secretary">مسؤول سكرتارية وتنسيق (مواعيد وموكلين)</option>
                <option value="accountant">محاسب المكتب والضريبة (فواتير وأتعاب)</option>
              </select>
            </Field>

            <div className="space-y-3 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-800">
                التفويضات الاستثنائية الخاص (المحامي سعود):
              </p>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={assignCanTransfer}
                  onChange={(e) => setAssignCanTransfer(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                منح صلاحية نقل وتصنيف الموكلين بين أفراد وشركات
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={assignCanAgreements}
                  onChange={(e) => setAssignCanAgreements(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                منح صلاحية الاطلاع على اتفاقيات وصيغ العقود للمكتب
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={assignCanWhatsapp}
                  onChange={(e) => setAssignCanWhatsapp(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                منح صلاحية استخدام واتساب المكتب المباشر
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={assignCanFinances}
                  onChange={(e) => setAssignCanFinances(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                منح صلاحية الوصول للنظام المالي والضريبة والفواتير
              </label>
            </div>

            <button
              onClick={confirmApproveUser}
              className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition"
            >
              تأكيد القبول وفك حظر الحساب (Approve & Activate)
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ مودال إضافة مبدأ قضائي جديد ═══ */}
      {showAddPrecedentModal && (
        <Modal title="إضافة مبدأ قضائي جديد" onClose={() => setShowAddPrecedentModal(false)} wide>
          <form onSubmit={handlePrecedentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عنوان المبدأ القضائي / القاعدة:
              </label>
              <input
                type="text"
                required
                placeholder="مثال: بطلان الشرط المانع من التعويض في عقود المقاولات عند الخطأ الجسيم"
                value={precedentForm.title}
                onChange={(e) => setPrecedentForm({ ...precedentForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المحكمة المصدرة:
                </label>
                <select
                  value={precedentForm.court_name}
                  onChange={(e) =>
                    setPrecedentForm({ ...precedentForm, court_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none bg-white"
                >
                  <option value="المحكمة الاتحادية العليا">المحكمة الاتحادية العليا</option>
                  <option value="محكمة تمييز دبي">محكمة تمييز دبي</option>
                  <option value="محكمة نقض أبوظبي">محكمة نقض أبوظبي</option>
                  <option value="محكمة تمييز رأس الخيمة">محكمة تمييز رأس الخيمة</option>
                  <option value="محاكم عجمان الاستئنافية">محاكم عجمان الاستئنافية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سنة الحكم / الصدور:
                </label>
                <input
                  type="number"
                  required
                  min={1971}
                  max={2030}
                  value={precedentForm.ruling_year}
                  onChange={(e) =>
                    setPrecedentForm({
                      ...precedentForm,
                      ruling_year: parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف:</label>
                <select
                  value={precedentForm.category}
                  onChange={(e) => setPrecedentForm({ ...precedentForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none bg-white"
                >
                  <option value="تجاري">تجاري</option>
                  <option value="مدني">مدني</option>
                  <option value="عقاري">عقاري</option>
                  <option value="عمالي">عمالي</option>
                  <option value="جزائي">جزائي</option>
                  <option value="أحوال شخصية">أحوال شخصية</option>
                  <option value="إداري">إداري</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الدائرة القضائية:
                </label>
                <input
                  type="text"
                  placeholder="مثال: الدائرة التجارية والمدنية"
                  value={precedentForm.circuit_name}
                  onChange={(e) =>
                    setPrecedentForm({ ...precedentForm, circuit_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الطعن / الدعوى:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طعن 120 لسنة 2024 تجاري"
                  value={precedentForm.appeal_number}
                  onChange={(e) =>
                    setPrecedentForm({ ...precedentForm, appeal_number: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نص المبدأ / القاعدة القانونية:
              </label>
              <textarea
                rows={4}
                required
                placeholder="اكتب نص المبدأ القانوني أو ملخص القاعدة الصادرة من الحكم القضائي..."
                value={precedentForm.summary_text}
                onChange={(e) =>
                  setPrecedentForm({ ...precedentForm, summary_text: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText size={14} className="text-red-600" /> تحميل ملف PDF:
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPrecedentPdfFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-0 file:ml-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FileSpreadsheet size={14} className="text-blue-600" /> تحميل ملف Word (.doc,
                  .docx):
                </label>
                <input
                  type="file"
                  accept=".doc,.docx"
                  onChange={(e) => setPrecedentWordFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-0 file:ml-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPrecedentModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={precedentLoading}
                className="rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition shadow-sm"
              >
                {precedentLoading ? "جاري الحفظ والرفع..." : "حفظ المبدأ القضائي"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ مودال عرض تفاصيل المبدأ القضائي ═══ */}
      {selectedPrecedent && (
        <Modal title="تفاصيل المبدأ القضائي" onClose={() => setSelectedPrecedent(null)} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <Landmark size={14} /> {selectedPrecedent.court_name}
              </span>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-800 font-bold">
                  {selectedPrecedent.category}
                </Badge>
                <Badge className="bg-amber-100 text-amber-900 font-mono">
                  سنة {selectedPrecedent.ruling_year}
                </Badge>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedPrecedent.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-600 bg-stone-50 p-3 rounded-xl border border-slate-200">
              <div>
                <strong className="text-slate-800 font-sans">رقم الطعن/الدعوى:</strong>{" "}
                {selectedPrecedent.appeal_number}
              </div>
              {selectedPrecedent.circuit_name && (
                <div>
                  <strong className="text-slate-800 font-sans">الدائرة:</strong>{" "}
                  {selectedPrecedent.circuit_name}
                </div>
              )}
            </div>

            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 text-sm text-slate-800 leading-relaxed font-sans">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-1">
                <Scale size={16} /> المبدأ والقاعدة القانونية الصادرة:
              </h4>
              <p className="whitespace-pre-wrap">{selectedPrecedent.summary_text}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectedPrecedent.title}\nالمحكمة: ${selectedPrecedent.court_name}\nرقم الطعن: ${selectedPrecedent.appeal_number}\nالمبدأ: ${selectedPrecedent.summary_text}`,
                  );
                  alert("تم نسخ المبدأ والقاعدة القانونية بنجاح!");
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
              >
                <Copy size={14} /> نسخ المبدأ للاستخدام المباشر
              </button>

              <div className="flex items-center gap-2">
                {selectedPrecedent.pdf_file_url && (
                  <a
                    href={selectedPrecedent.pdf_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                  >
                    <FileText size={14} /> تحميل PDF
                  </a>
                )}
                {selectedPrecedent.word_file_url && (
                  <a
                    href={selectedPrecedent.word_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    <FileSpreadsheet size={14} /> تحميل Word
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ مودال إضافة / تعديل سياسة داخلية ═══ */}
      {showPolicyModal && (
        <Modal
          title={editingPolicy ? "تعديل السياسة الداخلية" : "إضافة سياسة داخلية جديدة"}
          onClose={() => {
            setShowPolicyModal(false);
            setEditingPolicy(null);
          }}
          wide
        >
          <form onSubmit={handlePolicySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان السياسة:</label>
              <input
                type="text"
                required
                placeholder="مثال: سياسة سرية بيانات الموكلين"
                value={policyForm.title}
                onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف:</label>
                <select
                  value={policyForm.category}
                  onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none bg-white"
                >
                  {POLICY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ السريان:
                </label>
                <input
                  type="date"
                  value={policyForm.effectiveDate}
                  onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نص السياسة:</label>
              <textarea
                required
                rows={10}
                placeholder="اكتبي نص السياسة أو الإجراء الداخلي بالتفصيل هنا..."
                value={policyForm.content}
                onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPolicyModal(false);
                  setEditingPolicy(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition"
              >
                {editingPolicy ? "حفظ التعديلات" : "حفظ السياسة"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ مودال تصدير واستعادة نسخة احتياطية لبيانات المكتب (Backup & Restore JSON) ═══ */}
      {showBackupModal && (
        <Modal
          title="تصدير واستعادة نسخة احتياطية لبيانات المكتب (JSON)"
          onClose={() => setShowBackupModal(false)}
          wide
        >
          <div className="space-y-6">
            {/* تبويبات التصدير والاستعادة */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => {
                  setBackupActiveTab("export");
                  setRestoreError(null);
                  setRestoreSuccessMsg(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  backupActiveTab === "export"
                    ? "bg-[#0a3d3a] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-[#0D382B]/[0.08] transition-colors"
                }`}
              >
                <Download size={16} />
                <span>تصدير نسخة احتياطية (Export)</span>
              </button>

              <button
                onClick={() => {
                  setBackupActiveTab("restore");
                  setRestoreError(null);
                  setRestoreSuccessMsg(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  backupActiveTab === "restore"
                    ? "bg-[#0a3d3a] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-[#0D382B]/[0.08] transition-colors"
                }`}
              >
                <UploadCloud size={16} />
                <span>استعادة نسخة احتياطية (Restore)</span>
              </button>
            </div>

            {/* المحتوى حسب التبويب المختار */}
            {backupActiveTab === "export" ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold text-teal-950 text-sm">
                    <Database className="text-teal-700" size={18} />
                    <span>تصدير قواعد وسجلات المكتب بالكامل إلى ملف JSON</span>
                  </div>
                  <p>
                    تتيح لك هذه الميزة تحميل كافة بيانات ومحتويات نظام المكتب (القضايا، الموكلين،
                    الجلسات، المهام، الفواتير، المستندات، الموظفين، والمستندات) في ملف مغلف واحد
                    بصيغة <strong>JSON</strong>.
                  </p>
                  <p className="text-teal-800">
                    يمكنك الاحتفاظ بهذا الملف في مكان آمن على حاسوبك لاستعادته في أي وقت عند الحاجة.
                  </p>
                </div>

                {/* ملخص الإحصائيات الحالية المتضمنة بالنسخة */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>ملخص السجلات المتاحة للتصدير حالياً:</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">💼 القضايا:</span>
                      <span className="font-black text-slate-900 text-sm">{cases.length} قضية</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">👥 الموكلين:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {clients.length} موكل
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">🗓️ الجلسات:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {hearings.length} جلسة
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">📋 المهام:</span>
                      <span className="font-black text-slate-900 text-sm">{tasks.length} مهمة</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">🧾 الفواتير:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {invoices.length} فاتورة
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">📂 المستندات:</span>
                      <span className="font-black text-slate-900 text-sm">{docs.length} مستند</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">👔 الموظفين:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {employees.length} موظف
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_8px_20px_-10px_rgb(15,23,42,0.08)]">
                      <span className="text-slate-500 block text-[11px]">🔒 المستخدمين:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {users.length} مستخدم
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowBackupModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleExportBackup}
                    className="px-5 py-2.5 rounded-xl bg-[#0a3d3a] text-white hover:bg-[#115450] text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Download size={16} className="text-[#e5c388]" />
                    <span>تنزيل ملف النسخة الاحتياطية (JSON) الآن</span>
                  </button>
                </div>
              </div>
            ) : (
              /* تبويب استعادة البيانات (Restore) */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                    <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                    <span>تنبيه هام قبل استعادة النسخة الاحتياطية</span>
                  </div>
                  <p>
                    استعادة النسخة الاحتياطية ستستبدل البيانات الحالية ببيانات الملف المرفق وتحدث
                    كافة سجلات القضايا، الموكلين، والمهام.
                  </p>
                </div>

                {/* رسائل التنبيه والنجاح والخطأ */}
                {restoreError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{restoreError}</span>
                  </div>
                )}

                {restoreSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>{restoreSuccessMsg}</span>
                  </div>
                )}

                {/* رافع الملفات JSON */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChangeForRestore}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
                    <div className="w-12 h-12 rounded-full bg-teal-100/80 text-teal-800 flex items-center justify-center">
                      <UploadCloud size={24} />
                    </div>
                    <p className="font-bold text-xs text-slate-800">
                      اضغط هنا لاختيار ملف النسخة الاحتياطية (.json) أو اسحبه إلى هنا
                    </p>
                    <p className="text-[11px] text-slate-400">
                      يقبل ملفات JSON الناتجة من عملية تصدير النظام فقط
                    </p>
                  </div>
                </div>

                {/* معاينة الملف قبل الاستعادة */}
                {restorePreview && (
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                      <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>معاينة بيانات الملف الجاهز للاستعادة:</span>
                      </h4>
                      <span className="text-[11px] text-emerald-800 font-mono">
                        تاريخ الملف: {restorePreview.exportDateFormatted}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-white border border-emerald-200 text-slate-800">
                        <span className="text-slate-500 block text-[10px]">💼 القضايا:</span>
                        <span className="font-bold text-slate-900">
                          {restorePreview.counts.cases}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-emerald-200 text-slate-800">
                        <span className="text-slate-500 block text-[10px]">👥 الموكلين:</span>
                        <span className="font-bold text-slate-900">
                          {restorePreview.counts.clients}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-emerald-200 text-slate-800">
                        <span className="text-slate-500 block text-[10px]">🗓️ الجلسات:</span>
                        <span className="font-bold text-slate-900">
                          {restorePreview.counts.hearings}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-emerald-200 text-slate-800">
                        <span className="text-slate-500 block text-[10px]">📋 المهام:</span>
                        <span className="font-bold text-slate-900">
                          {restorePreview.counts.tasks}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={executeRestore}
                        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <RefreshCw size={16} />
                        <span>تأكيد واستعادة البيانات إلى النظام الآن</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowBackupModal(false);
                      setRestorePreview(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-[#0D382B]/[0.06] transition-colors transition"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ الزر العائم للمساعد الذكي القانوني والتنفيذي (Gemini AI Floating Button) ═══ */}
      {isAiAssistantEnabled && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => openAiForCurrentSection()}
            className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 via-teal-800 to-[#072a28] px-4 py-3 text-white shadow-2xl border-2 border-amber-400/60 hover:scale-105 transition-all cursor-pointer group"
            title="المساعد الذكي القانوني لجميع الأقسام (Gemini AI)"
          >
            <div className="relative">
              <Sparkles size={20} className="text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>
            <span className="font-black text-xs text-amber-100 hidden sm:inline">
              المساعد الذكي (AI)
            </span>
          </button>
        </div>
      )}

      {/* ═══ مودال المساعد الذكي القانوني والتنفيذي لجميع الأقسام (Gemini AI Modal) ═══ */}
      {showAiModal && (
        <Modal
          title="المساعد الذكي القانوني والتنفيذي (Gemini 3.6 Flash)"
          onClose={() => setShowAiModal(false)}
          wide
        >
          <div className="space-y-5">
            {/* رأس المودال وشعار القسم المحدد */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950 via-[#072a28] to-slate-900 border border-amber-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Sparkles size={22} className="text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-200 flex items-center gap-2">
                    <span>ذكاء اصطناعي مساعد لجميع الأقسام</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-mono">
                      Gemini 3.6
                    </span>
                  </h3>
                  <p className="text-xs text-teal-200/80 mt-0.5">
                    القسم المختار حالياً:{" "}
                    <strong className="text-white bg-teal-800/80 px-2 py-0.5 rounded-md font-bold">
                      {aiDepartment}
                    </strong>
                  </p>
                </div>
              </div>

              {/* اختيار القسم يدوياً */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-teal-200 font-bold shrink-0">تغيير القسم:</span>
                <select
                  value={aiDepartment}
                  onChange={(e) => setAiDepartment(e.target.value)}
                  className="rounded-xl bg-[#0b3c39] border border-teal-600/50 text-xs font-bold text-amber-200 px-3 py-1.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="عام">عام / لوائح واستشارات</option>
                  <option value="القضايا والدعاوى">💼 القضايا والدعاوى</option>
                  <option value="الموكلين وجهات الاتصال">👥 الموكلين</option>
                  <option value="الجلسات والمواعيد">🗓️ الجلسات والمواعيد</option>
                  <option value="المهام والتوكيلات">📋 المهام والتوكيلات</option>
                  <option value="الفواتير والمالية">🧾 الفواتير والمالية</option>
                  <option value="العقود والاتفاقيات">📝 العقود والاتفاقيات</option>
                  <option value="المستندات والأرشيف">📂 المستندات والأرشيف</option>
                </select>
              </div>
            </div>

            {/* اقتراحات سريعة جاهزة للقسم المختار */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Zap size={14} className="text-amber-500" />
                <span>نماذج وأسئلة مقترحة لقسم ({aiDepartment}):</span>
              </span>

              <div className="flex flex-wrap gap-2 text-xs">
                {aiDepartment.includes("القضايا") && (
                  <>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "صياغة مذكرة دفاع متكاملة تتضمن الدفوع الشكلية والموضوعية وطرق الإثبات",
                        );
                        handleAskAiAssistant(
                          "صياغة مذكرة دفاع متكاملة تتضمن الدفوع الشكلية والموضوعية وطرق الإثبات",
                          "القضايا والدعاوى",
                          "draft",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      ✍️ صياغة مذكرة دفاع
                    </button>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "استخراج واستعراض الثغرات القانونية المقترحة من واقع القضايا الحالية بالنظام",
                        );
                        handleAskAiAssistant(
                          "استخراج واستعراض الثغرات القانونية المقترحة من واقع القضايا الحالية بالنظام",
                          "القضايا والدعاوى",
                          "analyze",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      🔍 تحليل الثغرات بالقضية
                    </button>
                  </>
                )}

                {aiDepartment.includes("الموكلين") && (
                  <>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "صياغة خطاب رسمي للموكل بخصوص تحديثات القضية والمستندات المطلوبة",
                        );
                        handleAskAiAssistant(
                          "صياغة خطاب رسمي للموكل بخصوص تحديثات القضية والمستندات المطلوبة",
                          "الموكلين وجهات الاتصال",
                          "draft",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      📩 صياغة خطاب رسمي للموكل
                    </button>
                    <button
                      onClick={() => {
                        setAiQuery("تقديم مقترح خطة تسوية قانونية ودية لحفظ حقوق الموكل والمكتب");
                        handleAskAiAssistant(
                          "تقديم مقترح خطة تسوية قانونية ودية لحفظ حقوق الموكل والمكتب",
                          "الموكلين وجهات الاتصال",
                          "advice",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      🤝 اقتراح خطة تسوية ودية
                    </button>
                  </>
                )}

                {aiDepartment.includes("الجلسات") && (
                  <>
                    <button
                      onClick={() => {
                        setAiQuery("صياغة طلب تأجيل الجلسة مع بيان أسباب قاطعة ومقبولة للمحكمة");
                        handleAskAiAssistant(
                          "صياغة طلب تأجيل الجلسة مع بيان أسباب قاطعة ومقبولة للمحكمة",
                          "الجلسات والمواعيد",
                          "draft",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      🗓️ طلب تأجيل جلسة
                    </button>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "إعداد مذكرة تعقيبية على قرار المحكمة والأمر الصادر بالجلسة السابقة",
                        );
                        handleAskAiAssistant(
                          "إعداد مذكرة تعقيبية على قرار المحكمة والأمر الصادر بالجلسة السابقة",
                          "الجلسات والمواعيد",
                          "draft",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      ⚖️ مذكرة تعقيبية للجلسة
                    </button>
                  </>
                )}

                {aiDepartment.includes("الفواتير") && (
                  <>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "صياغة إشعار قانوني بالمطالبة المالية وتسوية الأتعاب المتبقية قبل اللجوء للمحكمة",
                        );
                        handleAskAiAssistant(
                          "صياغة إشعار قانوني بالمطالبة المالية وتسوية الأتعاب المتبقية قبل اللجوء للمحكمة",
                          "الفواتير والمالية",
                          "draft",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      💰 إنذار بمطالبة أتعاب
                    </button>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "ما هي إجراءات وشروط استصدار أمر أداء مالي وفق قانون الإجراءات المدنية بـ الإمارات؟",
                        );
                        handleAskAiAssistant(
                          "ما هي إجراءات وشروط استصدار أمر أداء مالي وفق قانون الإجراءات المدنية بـ الإمارات؟",
                          "الفواتير والمالية",
                          "advice",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      📜 إجراءات أمر الأداء المالي
                    </button>
                  </>
                )}

                {aiDepartment.includes("العقود") && (
                  <>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "صياغة عقد تقديم خدمات قانونية وأتعاب محاماة وفق التشريعات الإماراتية",
                        );
                        handleAskAiAssistant(
                          "صياغة عقد تقديم خدمات قانونية وأتعاب محاماة وفق التشريعات الإماراتية",
                          "العقود والاتفاقيات",
                          "draft",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      📝 صياغة عقد خدمات قانونية
                    </button>
                    <button
                      onClick={() => {
                        setAiQuery(
                          "فحص الشروط والمخاطر المتوقعة في عقود الشراكة أو الإيجار أو العمل",
                        );
                        handleAskAiAssistant(
                          "فحص الشروط والمخاطر المتوقعة في عقود الشراكة أو الإيجار أو العمل",
                          "العقود والاتفاقيات",
                          "analyze",
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold transition cursor-pointer"
                    >
                      🔍 تحليل وتقييم مخاطر العقد
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setAiQuery("استشارة قانونية في نصوص تشريعات ودوانين دولة الإمارات الاتحادية");
                    handleAskAiAssistant(
                      "استشارة قانونية في نصوص تشريعات ودوانين دولة الإمارات الاتحادية",
                      aiDepartment,
                      "advice",
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold transition cursor-pointer"
                >
                  🇦🇪 استشارة قانونية إماراتية عامة
                </button>
              </div>
            </div>

            {/* مربع كتابة السؤال / الطلب */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                اكتب سؤالك أو اكتب الصيغة المطلوبة للمساعد الذكي:
              </label>
              <div className="relative">
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="مثال: اكتب لي لائحة دعوى تجارية / أو استشارة قانونية بخصوص المهل في الاستئناف..."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700 leading-relaxed shadow-2xs"
                />
                <button
                  onClick={() => handleAskAiAssistant()}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="absolute bottom-3 left-3 px-4 py-2 rounded-xl bg-[#0a3d3a] hover:bg-[#115450] disabled:bg-slate-300 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-amber-300" />
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} className="text-amber-300" />
                      <span>إرسال للذكاء الاصطناعي</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* رسائل الخطأ إن وجدت */}
            {aiError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* عرض النتيجة والإجابة المستخرجة من الذكاء الاصطناعي */}
            {aiResponse && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>النتيجة / الصياغة القانونية المستخرجة:</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResponse);
                      alert("تم نسخ النص القانوني للحافظة بنجاح!");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0D382B]/[0.08] transition-colors text-slate-700 text-[11px] font-bold transition cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>نسخ النص</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto shadow-inner">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ مودال رفع ملف Excel القضايا السابقة ═══ */}
      {showCasesExcelModal && (
        <Modal
          title="رفع ملف Excel واستيراد القضايا السابقة آلياً"
          onClose={() => {
            setShowCasesExcelModal(false);
            setExcelCasesParsed([]);
          }}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold">💡 التعليمات وآلية الربط:</p>
              <p>
                • يمكنك إرفاق جدول Excel يحتوي على القضايا السابقة. وسيتم ربط القضية بالموكل
                تلقائياً إذا كان الاسم مسجلاً بالنظام، أو إنشاء ملف موكل جديد آلياً.
              </p>
              <p>
                • الأعمدة المقبولة في ملف Excel: [رقم القضية، اسم الموكل، اسم الخصم، نوع القضية،
                المحكمة، موضوع القضية، تاريخ القيد، الأتعاب].
              </p>
              <p>
                • عمود "اسم الخصم" يدعم أكثر من خصم لنفس القضية — افصل بين الأسماء بفاصلة "،" أو
                بكلمة "و" (مثال: أحمد محمد و شركة الأفق للاستثمار).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <button
                onClick={downloadCasesExcelTemplate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#0D382B]/[0.08] transition-colors text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                <Download size={15} /> تنزيل قالب Excel القضايا الاسترشادي
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition cursor-pointer shadow-sm">
                <UploadCloud size={16} /> اختيار ملف Excel وإدراجه
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleParseCasesExcel}
                  className="hidden"
                />
              </label>
            </div>

            {casesExcelLoading && (
              <div className="p-6 text-center text-xs text-amber-800 bg-amber-50 rounded-xl font-bold flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-amber-600" /> جارٍ تحليل وقراءة
                صفوف جدول Excel...
              </div>
            )}

            {excelCasesParsed.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-800">
                  معاينة البيانات المستخرجة ({excelCasesParsed.length} قضية):
                </p>
                <div className="max-h-60 overflow-y-auto overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                  <table className="w-full min-w-[550px] text-xs">
                    <thead className="bg-stone-50 text-right text-slate-600">
                      <tr>
                        <th className="p-2.5">رقم القضية</th>
                        <th className="p-2.5">الموكل</th>
                        <th className="p-2.5">الخصم</th>
                        <th className="p-2.5">المحكمة</th>
                        <th className="p-2.5">النوع</th>
                        <th className="p-2.5">حالة الموكل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {excelCasesParsed.map((item, i) => (
                        <tr key={i} className="hover:bg-amber-50/40">
                          <td className="p-2.5 font-bold">{item.caseNumber}</td>
                          <td className="p-2.5">{item.clientName}</td>
                          <td className="p-2.5 text-slate-500">{caseOpponentsLabel(item)}</td>
                          <td className="p-2.5 text-slate-500">{item.court}</td>
                          <td className="p-2.5">{item.type}</td>
                          <td className="p-2.5">
                            {item.isNewClient ? (
                              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">
                                سيتم إنشاؤه موكل جديد
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                مطابق لموكل مسجل
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleConfirmImportCases}
                  className="w-full py-3 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={16} /> تأكيد وحفظ كافة القضايا والموكلين بالنظام
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ مودال ارفاق وكالة PDF وسحب بياناتها بالذكاء الاصطناعي ═══ */}
      {showPoaAiUploadModal && (
        <Modal
          title="إرفاق وكالة قانونية PDF واستخراج بياناتها بالذكاء الاصطناعي"
          onClose={() => {
            setShowPoaAiUploadModal(false);
            setPoaAiExtracted(null);
          }}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs leading-relaxed">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-600" /> معالجة التوكيلات بالذكاء الاصطناعي
                Gemini AI:
              </p>
              <p>
                قم بإرفاق ملف الوكالة بصيغة PDF أو صورة. سيقوم المساعد الذكي باستخراج اسم الموكل،
                رقم الوكالة، جهة الإصدار، تاريخ الانتهاء، ونطاق الصلاحيات تلقائياً.
              </p>
            </div>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-stone-50 hover:bg-stone-100 rounded-2xl transition cursor-pointer text-center">
              <UploadCloud size={32} className="text-teal-700 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                اضغط هنا لإرفاق ملف الوكالة (PDF / PNG)
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">أقصى حجم مدعوم: 25 ميجابايت</span>
              <input
                type="file"
                accept=".pdf, image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleProcessDocAiExtract("poa", f);
                }}
                className="hidden"
              />
            </label>

            {poaAiLoading && (
              <div className="p-6 text-center text-xs text-teal-900 bg-teal-50 rounded-xl font-bold flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-teal-700" /> جارٍ قراءة وتحليل نص
                الوكالة بالذكاء الاصطناعي...
              </div>
            )}

            {poaAiExtracted && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_6px_16px_-8px_rgb(15,23,42,0.08)]">
                <h4 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" /> البيانات المستخرجة
                  تلقائياً:
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Field label="اسم الموكل المستخرج">
                    <input
                      value={poaAiExtracted.clientName || ""}
                      onChange={(e) =>
                        setPoaAiExtracted({ ...poaAiExtracted, clientName: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="ربط بملف الموكل">
                    <select
                      value={selectedPoaClientId}
                      onChange={(e) =>
                        setSelectedPoaClientId(
                          e.target.value === "new" ? "new" : Number(e.target.value),
                        )
                      }
                      className={inputCls}
                    >
                      <option value="new">إضافة كـ (موكل جديد تلقائياً)</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="رقم الوكالة">
                    <input
                      value={poaAiExtracted.poaNumber || ""}
                      onChange={(e) =>
                        setPoaAiExtracted({ ...poaAiExtracted, poaNumber: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="جهة الإصدار">
                    <input
                      value={poaAiExtracted.issuer || ""}
                      onChange={(e) =>
                        setPoaAiExtracted({ ...poaAiExtracted, issuer: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="تاريخ الإصدار">
                    <input
                      type="date"
                      value={poaAiExtracted.issueDate || todayISO()}
                      onChange={(e) =>
                        setPoaAiExtracted({ ...poaAiExtracted, issueDate: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="تاريخ الانتهاء">
                    <input
                      type="date"
                      value={poaAiExtracted.expiryDate || addDays(730)}
                      onChange={(e) =>
                        setPoaAiExtracted({ ...poaAiExtracted, expiryDate: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="صلاحيات الوكالة المستخرجة">
                  <textarea
                    rows={2}
                    value={poaAiExtracted.scope || ""}
                    onChange={(e) =>
                      setPoaAiExtracted({ ...poaAiExtracted, scope: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>

                <button
                  onClick={handleSaveExtractedPoa}
                  className="w-full py-3 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={16} /> اعتماد البيانات وإدراج الوكالة بالنظام
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ مودال ارفاق اتفاقية قديمة PDF وسحب بياناتها بالذكاء الاصطناعي ═══ */}
      {showAgreementAiUploadModal && (
        <Modal
          title="إرفاق اتفاقية أتعاب قديمة PDF واستخراج بياناتها بالذكاء الاصطناعي"
          onClose={() => {
            setShowAgreementAiUploadModal(false);
            setAgreementAiExtracted(null);
          }}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-600" /> تحليل وقراءة الاتفاقيات القديمة:
              </p>
              <p>
                قم بتمشيط أو إرفاق الاتفاقية بصيغة PDF. سيتم استخراج اسم الموكل، رقم الاتفاقية،
                إجمالي الأتعاب، وتفاصيل الأقساط وإضافتها آلياً لقاعدة البيانات.
              </p>
            </div>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-stone-50 hover:bg-stone-100 rounded-2xl transition cursor-pointer text-center">
              <UploadCloud size={32} className="text-amber-700 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                اضغط هنا لإرفاق ملف الاتفاقية (PDF / PNG)
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">أقصى حجم مدعوم: 25 ميجابايت</span>
              <input
                type="file"
                accept=".pdf, image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleProcessDocAiExtract("agreement", f);
                }}
                className="hidden"
              />
            </label>

            {agreementAiLoading && (
              <div className="p-6 text-center text-xs text-amber-900 bg-amber-50 rounded-xl font-bold flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-amber-600" /> جارٍ استخراج بنود
                ومبالغ العقد بالذكاء الاصطناعي...
              </div>
            )}

            {agreementAiExtracted && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04),0_6px_16px_-8px_rgb(15,23,42,0.08)]">
                <h4 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" /> تفاصيل الاتفاقية
                  المستخرجة:
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Field label="اسم الموكل">
                    <input
                      value={agreementAiExtracted.clientName || ""}
                      onChange={(e) =>
                        setAgreementAiExtracted({
                          ...agreementAiExtracted,
                          clientName: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="ربط الموكل بالنظام">
                    <select
                      value={selectedAgrClientId}
                      onChange={(e) =>
                        setSelectedAgrClientId(
                          e.target.value === "new" ? "new" : Number(e.target.value),
                        )
                      }
                      className={inputCls}
                    >
                      <option value="new">إضافة كـ (موكل جديد تلقائياً)</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="رقم الاتفاقية">
                    <input
                      value={agreementAiExtracted.agreementNumber || ""}
                      onChange={(e) =>
                        setAgreementAiExtracted({
                          ...agreementAiExtracted,
                          agreementNumber: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="إجمالي الأتعاب (درهم)">
                    <input
                      type="number"
                      value={agreementAiExtracted.totalAmount || 0}
                      onChange={(e) =>
                        setAgreementAiExtracted({
                          ...agreementAiExtracted,
                          totalAmount: Number(e.target.value),
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="تاريخ العقد">
                    <input
                      type="date"
                      value={agreementAiExtracted.date || todayISO()}
                      onChange={(e) =>
                        setAgreementAiExtracted({ ...agreementAiExtracted, date: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="ملاحظات وشروط الأقساط المستخرجة">
                  <textarea
                    rows={2}
                    value={
                      agreementAiExtracted.installmentsNotes || agreementAiExtracted.notes || ""
                    }
                    onChange={(e) =>
                      setAgreementAiExtracted({
                        ...agreementAiExtracted,
                        installmentsNotes: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>

                <button
                  onClick={handleSaveExtractedAgreement}
                  className="w-full py-3 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={16} /> اعتماد الاتفاقية وإدراجها بجدول الأتعاب
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ مودال ارفاق واستيراد الفواتير (Excel / PDF AI) ═══ */}
      {showInvoiceImportModal && (
        <Modal
          title="استيراد وإدراج الفواتير آلياً (Excel / PDF)"
          onClose={() => {
            setShowInvoiceImportModal(false);
            setExcelInvoicesParsed([]);
            setInvoiceAiExtracted(null);
          }}
        >
          <div className="space-y-4">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setInvoiceImportTab("excel")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition ${invoiceImportTab === "excel" ? "border-amber-500 text-amber-700 bg-amber-50" : "border-transparent text-slate-500"}`}
              >
                📊 استيراد مجموعة فواتير عبر Excel
              </button>
              <button
                onClick={() => setInvoiceImportTab("pdf_ai")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition ${invoiceImportTab === "pdf_ai" ? "border-amber-500 text-amber-700 bg-amber-50" : "border-transparent text-slate-500"}`}
              >
                ✨ استخراج فاتورة من PDF بالذكاء الاصطناعي
              </button>
            </div>

            {invoiceImportTab === "excel" ? (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-stone-50 rounded-2xl cursor-pointer text-center">
                  <FileSpreadsheet size={32} className="text-amber-700 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    اختيار ملف Excel يحتوي على الفواتير
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleParseInvoicesExcel}
                    className="hidden"
                  />
                </label>

                {excelInvoicesParsed.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-800">
                      الفواتير المستخرجة ({excelInvoicesParsed.length}):
                    </p>
                    <div className="max-h-52 overflow-y-auto overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                      <table className="w-full min-w-[450px] text-xs">
                        <thead className="bg-stone-50 text-right">
                          <tr>
                            <th className="p-2">رقم الفاتورة</th>
                            <th className="p-2">الموكل</th>
                            <th className="p-2">المبلغ</th>
                            <th className="p-2">الاستحقاق</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                          {excelInvoicesParsed.map((inv, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-mono font-bold">{inv.number}</td>
                              <td className="p-2">{inv.clientName}</td>
                              <td className="p-2 font-bold">{fmtAED(inv.amount)}</td>
                              <td className="p-2 font-mono">{inv.due}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={handleConfirmImportInvoices}
                      className="w-full py-3 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
                    >
                      تأكيد استيراد كافة الفواتير
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-stone-50 rounded-2xl cursor-pointer text-center">
                  <UploadCloud size={32} className="text-teal-700 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    إرفاق الفاتورة المطبوعة (PDF / PNG)
                  </span>
                  <input
                    type="file"
                    accept=".pdf, image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleProcessDocAiExtract("invoice", f);
                    }}
                    className="hidden"
                  />
                </label>

                {invoiceAiLoading && (
                  <div className="p-4 text-center text-xs text-amber-800 bg-amber-50 rounded-xl font-bold flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-amber-600" /> جارٍ استخراج
                    أرصدة المبالغ والضريبة...
                  </div>
                )}

                {invoiceAiExtracted && (
                  <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                    <Field label="الموكل">
                      <input
                        value={invoiceAiExtracted.clientName || ""}
                        onChange={(e) =>
                          setInvoiceAiExtracted({
                            ...invoiceAiExtracted,
                            clientName: e.target.value,
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="رقم الفاتورة">
                      <input
                        value={invoiceAiExtracted.invoiceNumber || ""}
                        onChange={(e) =>
                          setInvoiceAiExtracted({
                            ...invoiceAiExtracted,
                            invoiceNumber: e.target.value,
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="المبلغ">
                      <input
                        type="number"
                        value={invoiceAiExtracted.amount || 0}
                        onChange={(e) =>
                          setInvoiceAiExtracted({
                            ...invoiceAiExtracted,
                            amount: Number(e.target.value),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <button
                      onClick={handleConfirmImportInvoices}
                      className="w-full py-3 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
                    >
                      حفظ الفاتورة المستخرجة
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ مودال رفع ملف Excel الأشخاص المحظورين والمنكشفين ═══ */}
      {showKycWatchlistUploadModal && (
        <Modal
          title="رفع ملف Excel قوائم المحظورين والمنكشفين (Sanctions / PEP)"
          onClose={() => {
            setShowKycWatchlistUploadModal(false);
            setKycWatchlistParsed([]);
          }}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-red-600" /> تنبيه مكافحة غسل الأموال وحظر
                التعامل:
              </p>
              <p>
                رفع وتحديث قاعدة بيانات قوائم الحظر. سيقوم النظام فوراً بفحص كافة الموكلين المسجلين
                في مكتب المحاماة وتنبيهك فوراً برفض التعامل معهم.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <button
                onClick={downloadKycWatchlistTemplate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#0D382B]/[0.08] transition-colors text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                <Download size={15} /> تنزيل قالب قوائم الحظر
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-bold hover:bg-red-800 transition cursor-pointer shadow-sm">
                <UploadCloud size={16} /> اختيار ملف Excel لقائمة الحظر
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleParseKycWatchlistExcel}
                  className="hidden"
                />
              </label>
            </div>

            {kycWatchlistParsed.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-800">
                  الأشخاص والجهات المكتشفة ({kycWatchlistParsed.length}):
                </p>
                <div className="max-h-56 overflow-y-auto overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                  <table className="w-full min-w-[450px] text-xs">
                    <thead className="bg-stone-50 text-right">
                      <tr>
                        <th className="p-2">الاسم</th>
                        <th className="p-2">تصنيف الحظر</th>
                        <th className="p-2">السبب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {kycWatchlistParsed.map((item, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold">{item.fullName}</td>
                          <td className="p-2">
                            <Badge className="bg-red-100 text-red-800">{item.type}</Badge>
                          </td>
                          <td className="p-2 text-slate-500">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleConfirmImportKycWatchlist}
                  className="w-full py-3 bg-red-800 text-white font-bold rounded-xl text-xs hover:bg-red-900 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={16} /> اعتماد القائمة وتفعيل التدقيق التلقائي الفوري
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ تنبيه حظر الامتثال والمنع من التعامل (KYC Sanction Alert Modal) ═══ */}
      {kycSanctionAlert && (
        <Modal
          title="🚨 تحذير امتثال عاجل: تطابق مع قائمة الأشخاص المحظورين"
          onClose={() => {
            // لا يُسمح بإغلاق هذا التنبيه (لا بزر X ولا بالضغط خارج النافذة) دون كتابة سبب — نفس شرط زر التأكيد بالأسفل
            const reason = kycSanctionAckReason.trim();
            if (!reason) {
              alert(
                "يجب كتابة سبب المتابعة أو القرار المتخذ قبل إغلاق هذا التنبيه — هذا سجل امتثال إلزامي.",
              );
              return;
            }
            logAuditAction(
              "UPDATE",
              "الامتثال KYC",
              `إقرار بمتابعة تطابق عقوبات: ${kycSanctionAlert.clientName}`,
              `تم إقفال تنبيه تطابق العقوبات للاسم "${kycSanctionAlert.clientName}" بالسبب/القرار التالي: ${reason}`,
              0,
            );
            setKycSanctionAckReason("");
            setKycSanctionAlert(null);
          }}
        >
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={24} className="text-red-600 animate-bounce" />
                <h3 className="font-bold text-base">
                  تم اكتشاف تطابق مع قائمة الأشخاص والجهات المحظورة (AML / Sanctions)
                </h3>
              </div>
              <p className="text-xs leading-relaxed">
                الاسم المدخل:{" "}
                <b className="text-red-950 font-black">{kycSanctionAlert.clientName}</b> يتطابق مع
                الاسم المدرج بالنظام تحت تصنيف:
              </p>
              <div className="bg-white p-3 rounded-xl border border-red-200 text-xs space-y-1 text-slate-800">
                <p>
                  <b>تصنيف المنع:</b> {kycSanctionAlert.watchlistItem.type}
                </p>
                <p>
                  <b>سبب المنع والحظر:</b> {kycSanctionAlert.watchlistItem.reason}
                </p>
                <p>
                  <b>رقم الهوية / الجواز:</b> {kycSanctionAlert.watchlistItem.idNo || "غير محدد"}
                </p>
              </div>
              <p className="text-xs text-red-700 font-bold">
                ⚠️ ينصح بوقف كافة الإجراءات والرفع الفوري لوحدة المعلومات المالية (FIU) وسجل بلاغات
                الاشتباه AML / STR.
              </p>
            </div>

            {/* إلزامي: لا يمكن إغلاق هذا التنبيه إلا بكتابة سبب صريح يُحفظ في سجل التدقيق — منع تكرار
                "ضغطة فهمت" بدون أي أثر موثّق يثبت أن المكتب راجع التطابق واتخذ قراراً بشأنه. */}
            <Field label="سبب المتابعة / القرار المتخذ بشأن هذا التطابق (إلزامي قبل الإغلاق)">
              <textarea
                value={kycSanctionAckReason}
                onChange={(e) => setKycSanctionAckReason(e.target.value)}
                rows={3}
                placeholder="مثال: تم التحقق يدوياً وتبيّن أنه تشابه أسماء فقط وليس نفس الشخص، أو: تم رفع بلاغ اشتباه STR رقم..."
                className="w-full rounded-xl border border-red-300 p-2.5 text-xs focus:ring-2 focus:ring-red-200 focus:border-red-500"
              />
            </Field>

            <button
              onClick={() => {
                const reason = kycSanctionAckReason.trim();
                if (!reason) {
                  alert(
                    "يجب كتابة سبب المتابعة أو القرار المتخذ قبل إغلاق هذا التنبيه — هذا سجل امتثال إلزامي.",
                  );
                  return;
                }
                logAuditAction(
                  "UPDATE",
                  "الامتثال KYC",
                  `إقرار بمتابعة تطابق عقوبات: ${kycSanctionAlert.clientName}`,
                  `تم إقفال تنبيه تطابق العقوبات للاسم "${kycSanctionAlert.clientName}" بالسبب/القرار التالي: ${reason}`,
                  0,
                );
                setKycSanctionAckReason("");
                setKycSanctionAlert(null);
              }}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
            >
              تأكيد الإقرار وإغلاق التنبيه
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ مودال مزامنة جدول الجلسات مع Google Calendar ═══ */}
      <GoogleCalendarSyncModal
        isOpen={showGoogleCalendarModal}
        onClose={() => setShowGoogleCalendarModal(false)}
        hearings={hearings}
        cases={cases}
        clients={clients}
        onHearingsUpdated={(updated) => setHearings(updated)}
        googleUser={googleUser}
        googleToken={googleToken}
        onAuthChange={(user, token) => {
          setGoogleUser(user);
          setGoogleToken(token);
        }}
      />

      {/* ═══ مودال أكواد Supabase SQL و RLS ═══ */}
      <SupabaseSqlModal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} />
    </div>
  );
}
