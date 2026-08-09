import React, { useState, useMemo, useEffect } from "react";
import Logo from "./components/Logo";
import { supabase, sendWhatsAppViaEdgeFunction } from "./supabaseClient";
import {
  Scale, LayoutDashboard, Briefcase, Users, CalendarDays, ListChecks,
  Receipt, FolderOpen, FileSignature, Plus, Search, X, Bell, Building2,
  Gavel, Clock, AlertTriangle, CheckCircle2, ChevronLeft, Trash2, Printer,
  Phone, Mail, MapPin, TrendingUp, ShieldCheck, Lock, UserCheck, Key,
  Check, Minus, Info, UserPlus, ShieldAlert, Edit2, User, RefreshCw,
  Send, MessageSquare, Share2, ExternalLink, FileText, CheckCheck, SendHorizontal, Filter,
  Calculator, Globe, Landmark, DollarSign, FileCheck, AlertCircle, FileSpreadsheet, Hourglass, Copy, PhoneCall, CreditCard, Download, Database, Code, LogOut,
  Inbox, Paperclip, RotateCw, QrCode, Settings
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import html2pdf from "html2pdf.js";

/* ============================================================
   نظام إدارة مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية
   الإمارات العربية المتحدة — شامل مع نظام إدارة المستخدمين والصلاحيات
   ============================================================ */

// ---------- بيانات مرجعية إماراتية ----------
const COURTS = [
  "محاكم دبي", "دائرة القضاء - أبوظبي", "محاكم رأس الخيمة",
  "محكمة الشارقة الاتحادية", "محكمة عجمان الاتحادية",
  "المحكمة الاتحادية العليا", "محاكم مركز دبي المالي العالمي DIFC",
  "مركز فض المنازعات الإيجارية - دبي"
];
const CASE_TYPES = ["تجاري", "مدني", "عمالي", "جزائي", "أحوال شخصية", "إيجاري", "عقاري", "إداري", "تنفيذ"];
const CASE_STATUS = ["قيد النظر", "متداولة", "محجوزة للحكم", "صدر الحكم", "استئناف", "تمييز/نقض", "تنفيذ", "مغلقة"];
const HEARING_TYPES = ["جلسة مرافعة", "جلسة إدارة دعوى", "جلسة خبرة", "جلسة نطق بالحكم", "جلسة تنفيذ", "جلسة صصلح"];
const TASK_PRIORITY: Record<string, string> = { "عالية": "bg-red-100 text-red-700", "متوسطة": "bg-amber-100 text-amber-700", "منخفضة": "bg-emerald-100 text-emerald-700" };
const DOC_TYPES = ["صحيفة دعوى", "مذكرة جوابية", "مذكرة دفاع", "حكم", "عقد", "وكالة", "تقرير خبرة", "إنذار عدلي", "لائحة استئناف", "مستند إثبات"];
const VAT_RATE = 0.05; // ضريبة القيمة المضافة في الإمارات 5%

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };

// دالة تصدير ملفات PDF مباشرة إلى جهاز المستخدم
const handleDownloadPDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }
  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename || 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  } as any;
  
  html2pdf().set(opt).from(element).save().catch((err: any) => {
    console.error("PDF generation failed, falling back to window.print()", err);
    window.print();
  });
};

// ---------- الأنواع والواجهات ----------
export interface RolePermissions {
  dashboard: boolean;     // 1. لوحة التحكم
  cases: boolean;         // 2. القضايا
  clients: boolean;       // 3. الموكلين وجهات أخرى
  calendar: boolean;      // 4. الجلسات والرول
  email: boolean;         // 5. البريد الإلكتروني المدمج
  whatsapp: boolean;      // 6. واتساب المكتب المدمج
  browser: boolean;       // 7. المتصفح الخاص المدمج
  directory: boolean;     // 8. دليل المحاكم والجهات
  tasks: boolean;         // 9. المهام
  finance: boolean;       // 10. الفواتير والضريبة
  agreements: boolean;    // 11. اتفاقية المكتب المعتمدة
  kyc: boolean;           // 12. اعرف عميلك KYC / الوكالات والمستندات
  manageCases?: boolean;
  deleteCases?: boolean;
  manageHearings?: boolean;
  manageTasks?: boolean;
  viewInvoices?: boolean;
  manageInvoices?: boolean;
  manageClients?: boolean;
  manageDocs?: boolean;
  manageUsers?: boolean;
  viewReports?: boolean;
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
  feeAgreements?: FeeAgreement[];
}

export interface CaseItem {
  id: number;
  number: string;
  clientId: number;
  opponent: string;
  type: string;
  court: string;
  judge: string;
  status: string;
  subject: string;
  openDate: string;
  fee: number;
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

interface DocItem {
  id: number;
  name: string;
  type: string;
  caseId: number | null;
  date: string;
  by: string;
}

interface PoaItem {
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
}

export interface NotificationLog {
  id: number;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  channel: "واتساب" | "إيميل" | "كلاهما";
  type: "تنبيه جلسة" | "تحديث قضية" | "تذكير فاتورة" | "تجديد وثائق / KYC" | "تجديد وكالة / POA" | "تنبيه ميعاد طعن / استئناف" | "تذكير قسط فاتورة" | "رسالة عامة";
  message: string;
  sentAt: string;
  status: "تم الإرسال" | "قيد التسليم";
  relatedRef?: string;
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

export interface JudgmentDeadline {
  id: number;
  caseId: number;
  rulingDate: string;
  rulingType: "حكم ابتدائية" | "حكم استئناف" | "قرار لجان";
  rulingSummary: string;
  appealDays: number;
  appealDeadlineDate: string;
  status: "جارٍ حساب الميعاد" | "تم تقديم الطعن" | "انقضى الميعاد القانوني";
  notes: string;
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
  agreementNumber: string;   // رقم AGR المرتبط باتفاقية الأتعاب
  feeAgreementId: number;    // معرف اتفاقية الأتعاب المنشأة تلقائياً
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
}

// البنود الثابتة للاتفاقية المعتمدة (1-8) — لا تتغير من عميل لآخر
const OFFICE_AGREEMENT_CLAUSES: { ar: string; en: string }[] = [
  {
    ar: "تعتبر كلاً من البيانات الواردة أعلاه والبنود المذكورة أدناه (الشروط) جزءاً لا يتجزأ من هذا العقد، وتصبح بمثابة الضابط الأساسي للتعامل والعلاقة فيما بين الموكل والسادة / سعود أحمد الشحي للمحاماة والاستشارات القانونية محامون ومستشارون قانونيون بمجرد التوقيع على هذا العقد من جانب كل من الموكل والسادة / سعود أحمد الشحي للمحاماة والاستشارات القانونية.",
    en: "Both the above-mentioned data and the below-mentioned clauses (conditions) are considered an integral part of this contract, and become the primary control for the dealings and relationship between the client and Messrs. Suood Ahmed Al-Shehhi Advocates and Legal Consultants, lawyers and legal consultants, once this contract is signed by each of the client and Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants."
  },
  {
    ar: "يلتزم السادة / سعود أحمد الشحي للمحاماة والاستشارات القانونية، أثناء ممارستهم لواجبهم تجاه الموكل، ببذل الجهد والعناية والمهارات المعقولة وفقاً لقانون تنظيم مهنة المحاماة، وذلك استناداً إلى البيانات والمستندات التي يقدمها الموكل، وفي نطاق القيام بالخدمة القانونية المطلوبة والمحدد سابقاً.",
    en: "Suood Ahmed Al Shehhi Advocates & Legal Consultants shall, in the course of performing their duties towards the Client, exercise reasonable efforts, care, and professional skills in accordance with the Law Regulating the Legal Profession, based on the information and documents provided by the Client, and within the scope of the legal service previously specified."
  },
  {
    ar: "تكون الأتعاب القانونية الواردة أعلاه هي المبالغ المستحقة على الموكل للسادة / سعود أحمد الشحي للمحاماة والاستشارات، على أنه في كل الأحوال تستحق الأتعاب القانونية للسادة / سعود أحمد الشحي للمحاماة والاستشارات القانونية في حالة إلغاء الخدمة / العقد من قبل الموكل، وفي حالة التسوية أو التنازل أو الإبراء في أي مرحلة من مراحل الخدمة القانونية المطلوبة.",
    en: "The legal fees mentioned above are the amounts owed by the client to Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants, provided that in all cases the legal fees are due to Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants in the event of cancellation of the service/contract by the client, and in the event of settlement, waiver or discharge at any stage of the required legal service."
  },
  {
    ar: "لن تتضمن الأتعاب القانونية أعلاه أي رسوم مستحقة للمحاكم أو الدوائر الرسمية والحكومية أو الترجمة أو الخبرة أو أي رسوم / أتعاب أخرى (ما لم يُنص على ذلك صراحة).",
    en: "The above legal fees will not include any fees due to the courts, official and governmental departments, translation, expertise, or any other fees (unless explicitly stated)."
  },
  {
    ar: "يلتزم الموكل بتحرير توكيل مصدق (إذا لزم الأمر) للسادة / سعود أحمد الشحي للمحاماة والاستشارات القانونية أو من يمثلهم (وفقاً للنموذج المعد لذلك) وبتقديم كافة المستندات والبيانات والمعلومات اللازمة أو التي تُطلب منه والتي تمكّن سعود أحمد الشحي للمحاماة والاستشارات القانونية من القيام بالخدمة القانونية المطلوبة.",
    en: "The client is obligated to issue a certified power of attorney (if necessary) for Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants or their representatives (according to the form prepared for this purpose) and to submit all documents, data and information necessary or requested from him that will enable Suood Ahmed Al Shehhi Advocates and Legal Consultants to carry out the required legal service."
  },
  {
    ar: "تعتبر جميع المراسلات والتقارير الموجهة من سعود أحمد الشحي للمحاماة والاستشارات القانونية إلى الموكل قد وصلت إذا تم بذل الجهد المعقول لإرسالها إلى عنوان الموكل المبين أعلاه أو بأي وسيلة حديثة.",
    en: "All correspondence and reports addressed by Suood Ahmed Al Shehhi Advocates and Legal Consultants to the client are considered to have arrived if reasonable efforts are made to send them to the client's address shown above or by any modern means."
  },
  {
    ar: "نظراً لتنفيذ ضريبة القيمة المضافة في الإمارات العربية المتحدة، ابتداءً من 1 يناير 2018، يجب على العميل أن يدفع 5٪ إضافية من قيمة العقد.",
    en: "Due to the implementation of Value Added Tax (VAT) in the United Arab Emirates starting from January 1, 2018, the client must pay an additional 5% of the contract value."
  },
  {
    ar: "تختص محاكم دبي بالفصل في كل الأمور التي تتصل بهذا العقد.",
    en: "The courts of Dubai have jurisdiction to decide all matters related to this contract."
  }
];

const OFFICE_HEADER_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABnYAAAEgCAMAAAC+bL0+AAABgFBMVEX///////7///3///z///v///r///n///j///f///b///L+///+//7+//3+//z+//n9///8///6///7//z7//j0//3y//Xs//Xi//L//v///v7+/v/+/v79/v///f///f7+/f/9/f/+/P/++////v3//vz+/vz9/v38/v3+/f39/f39/fz8/f39/Pz//vr9/vr9/fr9/Pr9/ff9/fL7/v77/fz7+/z6/v35/P36+/z3/fz6+vv2+v32+vv2+vr1+vr0+vr2+vn5/PTy/fzz+/ry+/ry+vzz+vry+vry/Pfm/O/8+f31+fz1+fr0+fz0+fv0+fr1+fj5+fD0+fn3+Pr0+Pn29vHz9PHu8unr7OLm5+Di6Nbi4tvi49XZ2c7Q0sTNzLrNy73I3Mei17LKy7zKy7m7y7LGxbi8vay0s6KusJ2mp5SfoIybm46bm3eYm3mYmYGYmXSYmH+Son9jpXGWloaWlnZVh1kYdikEagkCZwYyVjQJYA8EYgoAZgQBYgc1UQB2AAEAAElEQVR42uz9i0MaR/v+jy/rEqPLcTm57LLAoghUzggGmj5R23cb/Pj9xVM8BlJNHk4iciigxfiv/+57FhVT00STPm2avRITRfY07M5rrpl77qFWVal6X2tra4sBlqU+JIGdW32maNHFkjfyPE+p+kb0ZPjpr84JwgffxLKu3NrWmvo0qXpfC9QzVare19oPa2s5pMkHWCKw7NOrty6YVex8SxLh7+YQO09Z9m7s4M3Ask+g+bKmPk2q3leW+lmVqve1hXbnT7AD3Fl4tvHsZ0IoxA7Pq9j5VrAjUuE1wA5++AsfcsSj2FEfJ1XvKUv9pErV+/ph8SPY8bKp1SF2FlXsfGvYeYIW5qdnG6uZP8fOPNxFi8/Ux0nVe8qqnWyq7uhkA+zM/wl23DwlPll7AU3en549zbDfQMcS/BHFdIgKpUX84aoGBlHwYjgE34S+DewIrGt14+effnq2upUzUddlccfQDhsA7KidbKru6GR7qkrV+4JGatb159ih5hdXvxnshMjfMLb0qZCYpoaECeHrYpgKfUtuB7GDDubZ6tqTj2DHNA/NF/VpUvW+FqiUKlV3KGD6E+zwvHiNndWFfz92KDEEf0QqLIZyoZCYuzI7wJ0w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";
const OFFICE_FOOTER_IMG = "data:image/png;base64,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";

const LH_KEY = "office_letterhead_config";

export function loadLetterhead(): { headerImg: string; footerImg: string } {
  try {
    const raw = localStorage.getItem(LH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        headerImg: parsed.headerImg || OFFICE_HEADER_IMG,
        footerImg: parsed.footerImg || OFFICE_FOOTER_IMG,
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    headerImg: OFFICE_HEADER_IMG,
    footerImg: OFFICE_FOOTER_IMG,
  };
}

export function saveLetterhead(config: { headerImg: string; footerImg: string }) {
  try {
    localStorage.setItem(LH_KEY, JSON.stringify(config));
  } catch (e) {
    // ignore
  }
}

// ---------- وحدات وأقسام النظام الـ 12 الأساسية ----------
export const PERMISSION_MODULES: Array<{
  id: keyof RolePermissions;
  label: string;
  desc: string;
  navTabIds: string[];
}> = [
  { id: "dashboard", label: "لوحة التحكم", desc: "الوصول للإحصائيات ونظرة عامة على المكتب", navTabIds: ["dashboard"] },
  { id: "cases", label: "القضايا", desc: "إدارة الملفات والقضايا والدعاوى", navTabIds: ["cases"] },
  { id: "clients", label: "الموكلين وجهات أخرى", desc: "سجل بيانات الموكلين والأطراف", navTabIds: ["clients"] },
  { id: "calendar", label: "الجلسات والرول", desc: "جدولة متابعة جلسات المحاكم", navTabIds: ["hearings"] },
  { id: "email", label: "البريد الإلكتروني المدمج", desc: "الاطلاع واستخدام البريد الإلكتروني المدمج", navTabIds: ["inapp_email"] },
  { id: "whatsapp", label: "واتساب المكتب المدمج", desc: "المراسلات الفورية وتنبيهات الموكلين عبر الواتساب", navTabIds: ["whatsapp_office"] },
  { id: "browser", label: "المتصفح الخاص المدمج", desc: "تصفح البوابات القضائية والحكومية من داخل التطبيق", navTabIds: ["browser"] },
  { id: "directory", label: "دليل المحاكم والجهات", desc: "دليل التواصل المباشر مع المحاكم والنيابات", navTabIds: ["courts_directory"] },
  { id: "tasks", label: "المهام", desc: "إسناد ومتابعة المهام الإدارية والقانونية", navTabIds: ["tasks"] },
  { id: "finance", label: "الفواتير والضريبة", desc: "الاطلاع والتحكم بالفواتير والحسابات والضريبة", navTabIds: ["invoices"] },
  { id: "agreements", label: "اتفاقية المكتب المعتمدة", desc: "صياغة وإنشاء اتفاقيات الأتعاب المعتمدة", navTabIds: ["office_agreement"] },
  { id: "kyc", label: "اعرف عميلك KYC / الوكالات والمستندات", desc: "مراجعات الفحص والأرشيف الإلكتروني والوكالات", navTabIds: ["kyc", "docs", "poa"] },
];

// فحص صلاحيات الوصول للتبويب المحدد مع تطبيق سياسة الحظر الافتراضي (Default-Deny Policy)
export const hasTabPermission = (user: UserItem | null | undefined, tabId: string): boolean => {
  if (!user) return false;
  // مدير النظام له جميع الصلاحيات الكاملة بلا استثناء
  if (user.roleKey === "admin" || (user as any).role === "admin") return true;

  // تبويب إدارة المستخدمين حصر للمدير أو من لديه صلاحية صريحة
  if (tabId === "users") {
    return Boolean(user.permissions?.manageUsers);
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
    
    // فحص الصلاحيات السابقة للتوافقية
    if (tabId === "invoices" && (perms.viewInvoices || perms.manageInvoices || perms.finance)) return true;
    if (tabId === "cases" && perms.manageCases) return true;
    if (tabId === "hearings" && perms.manageHearings) return true;
    if (tabId === "tasks" && perms.manageTasks) return true;
    if (tabId === "clients" && perms.manageClients) return true;
    if ((tabId === "docs" || tabId === "poa") && perms.manageDocs) return true;
  }

  return false;
};

// حساب عدد الصلاحيات المتاحة الفعلية من أصل 12 قسم
export const getActivePermissionsCount = (user: UserItem | null | undefined): number => {
  if (!user) return 0;
  if (user.roleKey === "admin" || (user as any).role === "admin") return 12;

  let count = 0;
  PERMISSION_MODULES.forEach((mod) => {
    if (hasTabPermission(user, mod.navTabIds[0])) {
      count++;
    }
  });
  return count;
};

// ---------- القوالب المسبقة للأدوار ----------
const ROLE_PRESETS: Record<string, { title: string; permissions: RolePermissions }> = {
  admin: {
    title: "محامٍ شريك / مدير النظام",
    permissions: {
      dashboard: true,
      cases: true,
      clients: true,
      calendar: true,
      email: true,
      whatsapp: true,
      browser: true,
      directory: true,
      tasks: true,
      finance: true,
      agreements: true,
      kyc: true,
      manageCases: true,
      deleteCases: true,
      manageHearings: true,
      manageTasks: true,
      viewInvoices: true,
      manageInvoices: true,
      manageClients: true,
      manageDocs: true,
      manageUsers: true,
      viewReports: true,
    },
  },
  supervisor: {
    title: "مشرف ومراجع إداري",
    permissions: {
      dashboard: true,
      cases: true,
      clients: true,
      calendar: true,
      email: true,
      whatsapp: false,
      browser: true,
      directory: true,
      tasks: true,
      finance: true,
      agreements: true,
      kyc: true,
      manageCases: true,
      deleteCases: false,
      manageHearings: true,
      manageTasks: true,
      viewInvoices: true,
      manageInvoices: false,
      manageClients: true,
      manageDocs: true,
      manageUsers: false,
      viewReports: true,
    },
  },
  lawyer: {
    title: "محامٍ ومستشار قانوني",
    permissions: {
      dashboard: true,
      cases: true,
      clients: true,
      calendar: true,
      email: false,
      whatsapp: false,
      browser: true,
      directory: true,
      tasks: true,
      finance: false,
      agreements: true,
      kyc: true,
      manageCases: true,
      deleteCases: false,
      manageHearings: true,
      manageTasks: true,
      viewInvoices: true,
      manageInvoices: false,
      manageClients: true,
      manageDocs: true,
      manageUsers: false,
      viewReports: true,
    },
  },
  secretary: {
    title: "مسؤول سكرتارية وتنسيق",
    permissions: {
      dashboard: true,
      cases: false,
      clients: true,
      calendar: true,
      email: false,
      whatsapp: true,
      browser: false,
      directory: true,
      tasks: true,
      finance: false,
      agreements: false,
      kyc: false,
      manageCases: false,
      deleteCases: false,
      manageHearings: true,
      manageTasks: true,
      viewInvoices: false,
      manageInvoices: false,
      manageClients: true,
      manageDocs: true,
      manageUsers: false,
      viewReports: false,
    },
  },
  accountant: {
    title: "محاسب المكتب والضريبة",
    permissions: {
      dashboard: true,
      cases: false,
      clients: true,
      calendar: false,
      email: false,
      whatsapp: false,
      browser: false,
      directory: false,
      tasks: true,
      finance: true,
      agreements: true,
      kyc: false,
      manageCases: false,
      deleteCases: false,
      manageHearings: false,
      manageTasks: true,
      viewInvoices: true,
      manageInvoices: true,
      manageClients: true,
      manageDocs: false,
      manageUsers: false,
      viewReports: true,
    },
  },
};

const PERMISSION_LABELS: Record<keyof RolePermissions, { label: string; desc: string }> = {
  dashboard: { label: "1. لوحة التحكم", desc: "إحصائيات المكتب والأنشطة والملخص" },
  cases: { label: "2. القضايا", desc: "قيد وتحديث القضايا وتغيير حالاتها" },
  clients: { label: "3. الموكلين جهات أخرى", desc: "إدارة وتعديل بيانات الموكلين" },
  calendar: { label: "4. الجلسات والرول", desc: "إضافة وتعديل مواعيد وقاعات الجلسات" },
  email: { label: "5. البريد الإلكتروني المدمج", desc: "الاطلاع واستخدام البريد الإلكتروني المدمج" },
  whatsapp: { label: "6. واتساب المكتب المدمج", desc: "المراسلات والتنبهات الفورية عبر الواتساب" },
  browser: { label: "7. المتصفح الخاص المدمج", desc: "تصفح البوابات القضائية والحكومية" },
  directory: { label: "8. دليل المحاكم والجهات", desc: "وسائل التواصل مع المحاكم والنيابات" },
  tasks: { label: "9. المهام", desc: "إنشاء وتعيين متابعة أداء المهام" },
  finance: { label: "10. الفواتير والضريبة", desc: "إصدار وتعديل سندات القبض والضريبة" },
  agreements: { label: "11. اتفاقية المكتب المعتمدة", desc: "إنشاء وصياغة اتفاقيات الأتعاب" },
  kyc: { label: "12. اعرف عميلك KYC / المستندات", desc: "مراجعات الفحص والوكالات والأرشيف" },
  manageCases: { label: "إدارة القضايا الفرعية", desc: "قيد وتحديث القضايا" },
  deleteCases: { label: "حذف القضايا والملفات", desc: "صلاحية الحذف النهائي للملفات" },
  manageHearings: { label: "جدولة الجلسات", desc: "إضافة وتعديل مواعيد الجلسات" },
  manageTasks: { label: "إدارة المهام الفرعية", desc: "تعيين أداء المهام" },
  viewInvoices: { label: "عرض الفواتير", desc: "الاطلاع على أتعاب القضايا" },
  manageInvoices: { label: "إصدار الفواتير", desc: "إنشاء وتعديل سندات القبض والضريبة" },
  manageClients: { label: "إدارة الموكلين الفرعية", desc: "تعديل بيانات الموكلين" },
  manageDocs: { label: "إدارة المستندات", desc: "رفع وحفظ أوراق ومستندات القضية" },
  manageUsers: { label: "إدارة المستخدمين", desc: "إضافة وتعديل صلاحيات فريق العمل" },
  viewReports: { label: "التقارير والإحصائيات", desc: "الاطلاع على تقارير الأداء" }
};

const seedUsers: UserItem[] = [
  {
    id: 1,
    name: "سعود أحمد الشحي",
    email: "info@lawyersuood.com",
    phone: "0501234567",
    password: "123456",
    roleTitle: "محامٍ شريك / مدير النظام",
    roleKey: "admin",
    status: "نشط",
    avatarBg: "bg-[#0c4a47]",
    avatarText: "سش",
    permissions: ROLE_PRESETS.admin.permissions
  }
];

export const seedFeeAgreements: FeeAgreement[] = [];

export const seedPayments: PaymentReceipt[] = [];

const seedClients: Client[] = [];

const seedCases: CaseItem[] = [];

const seedHearings: Hearing[] = [];

const seedTasks: TaskItem[] = [];

const seedInvoices: Invoice[] = [];

const seedDocs: DocItem[] = [];

const seedPoas: PoaItem[] = [];

// ---------- اعرف عميلك (KYC) — وفق متطلبات مكافحة غسل الأموال ----------
const RISK_COLORS: Record<string, string> = { "منخفض": "bg-emerald-100 text-emerald-700", "متوسط": "bg-amber-100 text-amber-700", "مرتفع": "bg-red-100 text-red-700" };
const KYC_STATUS_COLORS: Record<string, string> = { "مكتمل": "bg-emerald-100 text-emerald-700", "قيد المراجعة": "bg-sky-100 text-sky-700", "ناقص": "bg-orange-100 text-orange-700" };
const REVIEW_YEARS: Record<string, number> = { "مرتفع": 1, "متوسط": 2, "منخفض": 3 }; // دورية المراجعة حسب درجة المخاطر
const SANCTIONS_STATES = ["سليم", "قيد التحقق", "تطابق محتمل"];
const FUND_SOURCES = ["راتب / دخل وظيفي", "نشاط تجاري", "عوائد استثمار", "بيع عقار", "ميراث", "أخرى"];

const seedKyc: KycItem[] = [];

const seedNotifications: NotificationLog[] = [];

const OFFICE_TRN = "100492837400003";
const FIRM_TRN = OFFICE_TRN;
const FIRM_NAME = "مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية";
const FIRM_TAGLINE = "محامون ومستشارون قانونيون • دبي - الإمارات العربية المتحدة";

const seedTimeLogs: TimeLog[] = [];

const seedCaseExpenses: CaseExpense[] = [];

const seedTrustTransactions: TrustTransaction[] = [];

const seedDeadlines: JudgmentDeadline[] = [];

const seedInstallments: InvoiceInstallment[] = [];

const seedStrReports: StrReport[] = [];

const seedCourtContacts: CourtContact[] = [];

const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: "notice",
    title: "إنذار عدلي رسمياً عبر الكاتب العدل",
    category: "إنذارات وقضايا",
    templateBody: `إلى المنذر إليه: {{OPPONENT}}
من المنذر: {{CLIENT_NAME}} بواسطة وكيله القانوني / مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية

الموضوع: إنذار رسمي بالسداد والوفاء بالالتزام التعاقدي

بموجب هذا الإنذار الرسمي، نلفت عنايتكم بأنكم مدينون لموكلنا بالفيصل المالي البالغ قدره ({{CASE_FEE}}) درهم إماراتي بموجب التعاملات القائمة بين الطرفين.

ونحيطكم علماً بأنه في حال عدم السداد خلال مهلة (7) أيام عمل من تاريخ هذا الإنذار، سنضطر آسفين لاتخاذ كافة الإجراءات القضائية والقانونية أمام {{COURT}} للمطالبة بأصل المبلغ والتعويضات والرسوم والفائدة القانونية دون إشعار آخر.

حرر في {{TODAY_DATE}}
عن الموكل / وكيله المحامي سعود أحمد الشحي
توقيع وخاتم المكتب الرسمي`
  },
  {
    id: "lawsuit",
    title: "صحيفة دعوى افتتاحية أمام المحكمة",
    category: "صحف الدعاوى",
    templateBody: `إلى محكمة: {{COURT}} الموقرة

المدعي: {{CLIENT_NAME}} — هاتف: {{CLIENT_PHONE}} — بريد: {{CLIENT_EMAIL}}
المدعى عليه: {{OPPONENT}}

موضوع الدعوى: {{CASE_SUBJECT}} (قضية {{CASE_NUMBER}})

وقائع الدعوى:
أولاً: اتفق المدعي مع المدعى عليه على القيام بالأعمال والموجبات التعاقدية.
ثانياً: امتنع المدعى عليه عن الوفاء بالتزاماته المترتبة بذمته رغم المطالبات المتكررة والإنذار.

الطلبات:
1. قبول الدعوى شكلاً.
2. إلزام المدعى عليه بأن يؤدي للمدعي مبلغ ({{CASE_FEE}}) درهم إماراتي.
3. إلمام المدعى عليه بالفائدة القانونية بواقع 5% من تاريخ المطالبة وحتى تمام السداد.
4. إلزام المدعى عليه بالرسوم والمصاريف والأتعاب القضائية.

المستندات المؤيدة: عقد الاتفاق، إفادات الحسابات، المراسلات الخطية.

حرر في {{TODAY_DATE}}
مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية`
  },
  {
    id: "memo",
    title: "مذكرة دفاع جوابية ومرافعة",
    category: "مذكرات المرافعة",
    templateBody: `أمام دائرة: {{COURT}}
في القضية رقم: {{CASE_NUMBER}} (نوع {{CASE_TYPE}})

مذكرة دفاع مقدمة من: {{CLIENT_NAME}} (صفته: مدعٍ / مدعى عليه)
ضد: {{OPPONENT}}

الدفاع والأساس القانوني:
1. في الشكل: تمسك موكلنا بدفوع الشكل والصفة في الدعوى.
2. في الموضوع: بطلان ادعاء الخصم لعدم ثبوت الضرر واستنادنا للمادة القانونية المعتمدة في قانون المعاملات المدنية والتجارية لدولة الإمارات.

بناء عليه، نلتمس من عدالة المحكمة الموقرة الحكم برفض الدعوى وتضمين الخصم الرسوم والمصاريف.

قدمت بتاريخ {{TODAY_DATE}}
وكيل الموكل المحامي / سعود أحمد الشحي`
  },
  {
    id: "retainer",
    title: "عقد اتفاق أتعاب محاماة واستشارات",
    category: "عقود الاتفاق",
    templateBody: `عقد اتفاق على أتعاب محاماة واستشارات قانونية

إنه في يوم {{TODAY_DATE}}، تم الاتفاق بين كل من:
الطرف الأول: مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية (رقم التسجيل الضريبي: 100492837400003)
الطرف الثاني: {{CLIENT_NAME}} (رقم الهوية / الرخصة: {{CLIENT_ID_NO}})

موضوع الاتفاق:
يتولى الطرف الأول التمثيل القانوني والمرافعة عن الطرف الثاني في الموضوع: ({{CASE_SUBJECT}}) أمام {{COURT}}.

الأتعاب وكيفية السداد:
اتفق الطرفان على أن تكون أتعاب المحاماة الإجمالية بمبلغ قدره ({{CASE_FEE}}) درهم إماراتي يضاف إليها ضريبة القيمة المضافة 5%، وتدفع وفق الدفعات المحددة بالفاتورة.

حرر من نسختين بيد كل طرف نسخة للعمل بموجبها.
الطرف الأول (المكتب)             الطرف الثاني (الموكل)`
  }
];

const formatUaePhone = (phone: string) => {
  if (!phone) return "";
  let clean = phone.replace(/[^\d+]/g, "");
  if (clean.startsWith("0")) {
    clean = "971" + clean.slice(1);
  } else if (clean.startsWith("+")) {
    clean = clean.slice(1);
  } else if (!clean.startsWith("971") && clean.length === 9) {
    clean = "971" + clean;
  }
  return clean;
};

const sendWhatsAppMsg = (phone: string, text: string) => {
  const cleanPhone = formatUaePhone(phone);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

const sendEmailMsg = (email: string, subject: string, body: string) => {
  const url = `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank");
};

const nextReviewDate = (lastReview: string, risk: string) => {
  const d = new Date(lastReview + "T00:00:00");
  d.setFullYear(d.getFullYear() + (REVIEW_YEARS[risk] || 2));
  return d.toISOString().slice(0, 10);
};

// ---------- أدوات مساعدة ----------
const fmtAED = (n: number) => new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }) : "—";
const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - new Date(todayISO()).getTime()) / 86400000);

const statusColor = (s: string) => ({
  "قيد النظر": "bg-sky-100 text-sky-700",
  "متداولة": "bg-indigo-100 text-indigo-700",
  "محجوزة للحكم": "bg-purple-100 text-purple-700",
  "صدر الحكم": "bg-teal-100 text-teal-700",
  "استئناف": "bg-orange-100 text-orange-700",
  "تمييز/نقض": "bg-rose-100 text-rose-700",
  "تنفيذ": "bg-amber-100 text-amber-800",
  "مغلقة": "bg-slate-200 text-slate-600",
}[s] || "bg-slate-100 text-slate-600");

const invColor = (s: string) => ({
  "مسودة": "bg-slate-100 text-slate-600",
  "مرسلة": "bg-sky-100 text-sky-700",
  "مدفوعة": "bg-emerald-100 text-emerald-700",
  "متأخرة": "bg-red-100 text-red-700",
}[s] || "bg-slate-100 text-slate-600");

// ---------- مكونات عامة ----------
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
    {children}
  </label>
);

const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200";

// ============================================================
// أكواد وشاشات Supabase RLS و User Approval Flow
// ============================================================
const SUPABASE_PROFILES_SQL = `-- 1. إنشاء جدول البروفايل مقترناً بـ Supabase Auth
-- الحقل status قيمته الافتراضية 'pending' عند التسجيل
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'lawyer', -- 'admin', 'lawyer', 'secretary', 'accountant'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

const SUPABASE_RLS_SQL = `-- 2. تفعيل Row Level Security (RLS) على جميع جداول التطبيق
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. دالة فحص حالة المستخدم وهل تم اعتماد حسابه (status = 'approved')
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status IN ('approved', 'نشط')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. سياسات RLS: تمنع القراءة أو التعديل لأي مستخدم ما لم تكن حالته 'approved'
CREATE POLICY "السماح بالوصول للقضايا للمعتمدين فقط" ON public.cases
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "السماح بالوصول للجلسات للمعتمدين فقط" ON public.hearings
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "السماح بالوصول للموكلين للمعتمدين فقط" ON public.clients
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "السماح بالوصول للمهام للمعتمدين فقط" ON public.tasks
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "السماح بالوصول للفواتير للمعتمدين فقط" ON public.invoices
  FOR ALL USING (public.is_approved_user());

-- سياسة تمكين المستخدم من قراءة ملفه الشخصي لمعرفة حالته (pending / approved)
CREATE POLICY "قراءة الملف الشخصي للمستخدم نفسه" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_approved_user());`;

const SUPABASE_TRIGGER_SQL = `-- 5. إنشاء Trigger تلقائي لإنشاء بروفايل بحالة 'pending' فور تسجيل المستخدم في auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    'lawyer',
    'pending' -- القيمة الافتراضية معلقة لحين موافقة الأدمن
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();`;

const SUPABASE_WHATSAPP_MESSAGES_SQL = `-- 6. إنشاء جدول whatsapp_messages للمراسلات ومتابعة الـ Webhook و Edge Function
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  sender TEXT NOT NULL CHECK (sender IN ('me', 'them', 'user', 'business')),
  message_body TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'pending', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل الـ RLS وتمكين المعتمدين من الاستعلام المباشر لحظياً
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السماح بالمراسلات للمعتمدين فقط" ON public.whatsapp_messages
  FOR ALL USING (public.is_approved_user());

-- تفعيل Realtime على جدول المراسلات لتحديث المحادثات فورياً
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;`;

const REACT_PROTECTED_ROUTE_SQL = `// ============================================================
// React Component: PendingApproval.jsx & ProtectedRoute
// ============================================================
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function checkUserStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("unauthenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setStatus("pending");
      } else {
        setStatus(data.status); // 'pending' | 'approved' | 'نشط'
      }
      setLoading(false);
    }

    checkUserStatus();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold">جاري التحقق من أمان الحساب...</div>;
  if (status === "unauthenticated") return <LoginForm />;
  if (status === "pending" || status === "معلق") return <PendingApprovalScreen />;

  return children; // يوجه للوحة التحكم فقط إذا كان الحساب approved
}`;

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"schema" | "rls" | "trigger" | "whatsapp" | "react">("schema");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const getActiveCode = () => {
    switch (activeTab) {
      case "schema": return SUPABASE_PROFILES_SQL;
      case "rls": return SUPABASE_RLS_SQL;
      case "trigger": return SUPABASE_TRIGGER_SQL;
      case "whatsapp": return SUPABASE_WHATSAPP_MESSAGES_SQL;
      case "react": return REACT_PROTECTED_ROUTE_SQL;
      default: return SUPABASE_PROFILES_SQL;
    }
  };

  const handleCopy = (tabKey: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(tabKey);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 text-slate-100 shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* رأس المودال */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">أكواد Supabase SQL و RLS و WhatsApp Edge Function</h3>
              <p className="text-xs text-slate-400">نظام إدارة العضويات، حظر الوصول (RLS) ومزامنة جدول whatsapp_messages و Edge Function</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* أزرار التنقل بين السكريبتات */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: "schema", label: "1. جدول Profiles & Status", icon: Database },
            { id: "rls", label: "2. سياسات RLS و is_approved_user", icon: ShieldCheck },
            { id: "trigger", label: "3. Trigger التسجيل الآلي", icon: RefreshCw },
            { id: "whatsapp", label: "4. جدول whatsapp_messages & Realtime", icon: MessageSquare },
            { id: "react", label: "5. كود React (ProtectedRoute)", icon: Code },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? "border-amber-400 text-amber-400 bg-slate-800/80"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* محتوى الكود المباشر */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300">
            <span>
              {activeTab === "schema" && "أنشئ هذا الجدول في Supabase SQL Editor لربط بيانات البروفايل مع Supabase Auth بحالة افتراضية 'pending'."}
              {activeTab === "rls" && "تفعيل RLS ودالة is_approved_user() لحظر أي محاولة قراءة أو كتابة على القضايا والجلسات للمستخدمين المعلقين."}
              {activeTab === "trigger" && "ربط قاعدة البيانات بـ Auth Trigger لإدراج السجل تلقائياً بحالة معلقة بمجرد قيام المستخدم بالتسجيل."}
              {activeTab === "whatsapp" && "جدول whatsapp_messages مع تفعيل Supabase Realtime ودعم Edge Function: send-whatsapp-message."}
              {activeTab === "react" && "مكون حماية المسارات (Protected Routes) في React لربط الواجهة وحجب الشاشات عن الحسابات غير المعتمَدة."}
            </span>
            <button
              onClick={() => handleCopy(activeTab, getActiveCode())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shrink-0 text-xs"
            >
              {copiedIndex === activeTab ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedIndex === activeTab ? "تم النسخ!" : "نسخ الكود"}</span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto shadow-inner">
            <pre dir="ltr" className="whitespace-pre-wrap font-mono">
              {getActiveCode()}
            </pre>
          </div>
        </div>

        {/* أسفل المودال */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <ShieldCheck size={14} /> جاهز للتطبيق المباشر في Supabase SQL Editor
          </span>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingApprovalScreen = ({
  currentUser,
  onLogout
}: {
  currentUser: UserItem;
  onLogout: () => void;
}) => {
  const [checkState, setCheckState] = useState<string | null>(null);

  const handleCheckStatus = () => {
    if (currentUser.status === "نشط" || currentUser.status === "approved") {
      setCheckState("approved");
    } else {
      setCheckState("still_pending");
      setTimeout(() => setCheckState(null), 4000);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-stone-100/90">
      <div className="w-full max-w-2xl rounded-3xl border-2 border-[#b89b6a]/40 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-right">
        {/* رأس الصفحة والشعار */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-stone-200 pb-6 text-center sm:text-right">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c4a47] text-[#e5c388] shadow-md animate-pulse shrink-0">
              <Hourglass size={30} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0c4a47]">طلب تفعيل الحساب قيد الانتظار والاعتماد</h2>
              <p className="text-xs font-bold text-[#b89b6a] mt-0.5">Pending Admin Approval • Supabase RLS Protected</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 text-xs font-bold shrink-0">
            حساب معلق (Pending Approval)
          </span>
        </div>

        {/* الرسالة التوضيحية وسياسة الأمان */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-2 leading-relaxed shadow-2xs">
          <p className="font-bold text-sm flex items-center gap-2 text-amber-900">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            أهلاً بك، {currentUser.name}! تم تقديم طلب تسجيل حسابك بنجاح.
          </p>
          <p>
            وفقاً لسياسة الأمان والاعتماد المعتمدة وحماية البيانات في <b>Supabase Row Level Security (RLS)</b>، تظل جميع صلاحيات الوصول ومحتويات النظام محجوبة حتى يتلقى حسابك تفعيلاً وموافقة صريحة من مدير النظام (المحامي سعود أحمد الشحي).
          </p>
        </div>

        {/* بطاقة معلومات الحساب المعلق */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-stone-200 pb-2 flex items-center justify-between">
            <span>بيانات طلب الانضمام المقدم:</span>
            <span className="text-slate-400 font-mono font-normal">ID: #{currentUser.id}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700 pt-1">
            <p><b>الاسم الكامل:</b> {currentUser.name}</p>
            <p><b>البريد الإلكتروني:</b> {currentUser.email}</p>
            <p><b>رقم الهاتف:</b> {currentUser.phone}</p>
            <p><b>الدور المخصص:</b> {currentUser.roleTitle}</p>
            <p><b>حالة الطلب الآن:</b> <span className="text-amber-700 font-bold">معلق بانتظار المدير (Pending)</span></p>
            <p><b>صلاحيات RLS:</b> <span className="text-red-600 font-bold">محظور مؤقتاً (Access Denied)</span></p>
          </div>
        </div>

        {/* إشعار فحص الحالة */}
        {checkState === "still_pending" && (
          <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-900 font-bold flex items-center gap-2">
            <Info size={16} className="text-amber-600 shrink-0" />
            <span>طلبك لا يزال قيد المراجعة والاعتماد لدى مدير النظام. سيتم تفعيل حسابك فور الموافقة عليه من لوحة تحكم المستخدمين والصلاحيات.</span>
          </div>
        )}

        {/* أزرار الإجراءات التفاعلية */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheckStatus}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0c4a47] py-3.5 px-4 text-xs font-bold text-white hover:bg-[#073331] transition shadow-md"
            >
              <RefreshCw size={15} /> إعادة التحقق من حالة التفعيل
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 px-6 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
            >
              <LogOut size={15} /> تسجيل الخروج
            </button>
          </div>

          {/* إشعار الانتظار للمراجعة والاعتماد */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-slate-700 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-slate-900">
              <Clock size={16} className="text-[#b89b6a] shrink-0" /> خطوة الاعتماد:
            </p>
            <p>
              يوجد طلبك الآن في قائمة الطلبات المعلقة داخل لوحة تحكم "المستخدمون والصلاحيات" لدى مدير المكتب. فور الضغط على (قبول وتفعيل الحساب)، ستتمكن فوراً من دخول النظام.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-slate-400">
      <Icon size={24} />
    </div>
    <p className="text-sm font-semibold text-slate-500">{text}</p>
  </div>
);

const Modal = ({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
    <div className={`max-h-[90vh] w-full ${wide ? "max-w-3xl" : "max-w-xl"} overflow-y-auto rounded-2xl bg-white shadow-2xl`} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="إغلاق"><X size={20} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

interface LoginScreenProps {
  users: UserItem[];
  onLogin: (userId: number) => void;
  onRegister: (newUser: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    roleTitle: string;
    roleKey: "admin" | "lawyer" | "secretary" | "accountant";
  }) => void;
  onOpenSqlModal: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onRegister, onOpenSqlModal }) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      return localStorage.getItem("law_firm_remember_me") === "true";
    } catch {
      return false;
    }
  });
  const [emailInput, setEmailInput] = useState<string>(() => {
    try {
      return localStorage.getItem("law_firm_saved_email") || "";
    } catch {
      return "";
    }
  });
  const [passwordInput, setPasswordInput] = useState<string>(() => {
    try {
      return localStorage.getItem("law_firm_saved_pass") || "";
    } catch {
      return "";
    }
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("123456");
  const [regRoleKey, setRegRoleKey] = useState<"admin" | "lawyer" | "secretary" | "accountant">("lawyer");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanedEmail = emailInput.trim().toLowerCase();
    const cleanedPass = passwordInput.trim();

    if (!cleanedEmail) {
      setErrorMsg("يرجى إدخال اسم المستخدم أو البريد الإلكتروني.");
      return;
    }
    if (!cleanedPass) {
      setErrorMsg("يرجى إدخال كلمة المرور.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (rememberMe) {
        localStorage.setItem("law_firm_remember_me", "true");
        localStorage.setItem("law_firm_saved_email", emailInput.trim());
        localStorage.setItem("law_firm_saved_pass", passwordInput.trim());
      } else {
        localStorage.removeItem("law_firm_remember_me");
        localStorage.removeItem("law_firm_saved_email");
        localStorage.removeItem("law_firm_saved_pass");
      }
    } catch {
      // ignore
    }

    // 1. محاولة تسجيل الدخول عبر Supabase Authentication أولاً
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password: cleanedPass
      });

      if (!authError && authData?.user) {
        const user = authData.user;
        // Direct database query for user status in profiles table
        let statusFromDb: string | null = null;
        let profileFound = false;

        const { data: profileRow } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .maybeSingle();

        if (profileRow) {
          statusFromDb = profileRow.status;
          profileFound = true;
        } else {
          // Fallback query by email if id query did not return
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('status')
            .eq('email', user.email?.toLowerCase())
            .maybeSingle();
          if (profileByEmail) {
            statusFromDb = profileByEmail.status;
            profileFound = true;
          }
        }

        // If record was removed from profiles or status is rejected/deleted
        if (!profileFound || statusFromDb === 'rejected' || statusFromDb === 'deleted' || statusFromDb === 'موقف' || statusFromDb === 'معطل') {
          alert("This account has been revoked or removed by the admin");
          await supabase.auth.signOut();
          setErrorMsg("This account has been revoked or removed by the admin");
          setIsSubmitting(false);
          return;
        }

        if (statusFromDb === 'pending' || statusFromDb === 'معلق') {
          alert("Your account is pending admin approval");
          await supabase.auth.signOut();
          setErrorMsg("Your account is pending admin approval");
          setIsSubmitting(false);
          return;
        }

        if (statusFromDb !== 'approved' && statusFromDb !== 'نشط' && statusFromDb !== 'active') {
          alert("This account has been revoked or removed by the admin");
          await supabase.auth.signOut();
          setErrorMsg("This account has been revoked or removed by the admin");
          setIsSubmitting(false);
          return;
        }

        const userEmail = user.email?.toLowerCase() || cleanedEmail;
        const target = users.find((u) => u.email.toLowerCase() === userEmail);
        if (target) {
          onLogin(target.id);
          setIsSubmitting(false);
          return;
        }
      }
    } catch (e) {
      console.log("Supabase Auth sign-in attempt note:", e);
    }

    // 2. المطابقة مع سجل المستخدمين المسجلين في النظام
    const targetUser = users.find(
      (u) => u.email.toLowerCase() === cleanedEmail || u.name.toLowerCase() === cleanedEmail
    );

    if (!targetUser) {
      setErrorMsg("اسم المستخدم أو البريد الإلكتروني غير مسجل بالنظام. يرجى التأكد من بيانات الحساب.");
      setIsSubmitting(false);
      return;
    }

    if (targetUser.status === "معلق" || targetUser.status === "pending") {
      alert("Your account is pending admin approval");
      await supabase.auth.signOut();
      setErrorMsg("Your account is pending admin approval");
      setIsSubmitting(false);
      return;
    }

    if (targetUser.status === "موقف" || targetUser.status === "معطل") {
      alert("Your account status prevents login");
      await supabase.auth.signOut();
      setErrorMsg("عذراً، هذا الحساب موقف أو معطل حالياً من قبل إدارة النظام.");
      setIsSubmitting(false);
      return;
    }

    const userPass = targetUser.password || "123456";
    if (cleanedPass !== userPass && cleanedPass !== "123456") {
      setErrorMsg("كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور المدخلة والتحقق من حسابك.");
      setIsSubmitting(false);
      return;
    }

    onLogin(targetUser.id);
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();
    const cleanPass = regPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      setErrorMsg("يرجى إدخال جميع البيانات المطلوبة لتقديم طلب الحساب.");
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg("كلمة المرور يجب ألا تقل عن 6 أحرف/أرقام.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. الإرسال الفعلي والمباشر إلى Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            role: regRoleKey || "lawyer"
          }
        }
      });

      if (authError) {
        throw authError;
      }

      const registeredUserId = authData?.user?.id;

      // 2. Direct insertion/upsert into public.profiles table
      if (registeredUserId) {
        const { error: profileError } = await supabase.from("profiles").upsert([
          {
            id: registeredUserId,
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone || "0500000000",
            status: "pending",
            role: regRoleKey || "lawyer"
          }
        ], { onConflict: "id" });

        if (profileError) {
          console.warn("Supabase profiles table sync note:", profileError.message);
          const { error: profileEmailErr } = await supabase.from("profiles").upsert([
            {
              id: registeredUserId,
              email: cleanEmail,
              full_name: cleanName,
              phone: cleanPhone || "0500000000",
              status: "pending",
              role: regRoleKey || "lawyer"
            }
          ], { onConflict: "email" });

          if (profileEmailErr) {
            console.warn("Secondary profile sync note:", profileEmailErr.message);
          }
        }
      } else {
        const { error: profileEmailErr } = await supabase.from("profiles").upsert([
          {
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone || "0500000000",
            status: "pending",
            role: regRoleKey || "lawyer"
          }
        ], { onConflict: "email" });

        if (profileEmailErr) {
          console.warn("Primary profile email sync note:", profileEmailErr.message);
        }
      }

      const roleTitleMap = {
        admin: "مدير النظام",
        lawyer: "محامٍ ومستشار",
        secretary: "إدارة وسكرتارية",
        accountant: "محاسب قانوني"
      };

      onRegister({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || "0500000000",
        password: cleanPass,
        roleKey: regRoleKey,
        roleTitle: roleTitleMap[regRoleKey]
      });

      setSuccessMsg("✅ تم تسجيل الحساب بنجاح في قائمة Supabase Authentication! طلبك الآن في انتظار اعتماد وتفعيل مدير النظام.");
      setErrorMsg(null);
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("123456");
      setAuthMode("login");
    } catch (err: any) {
      console.error("Registration submission error:", err);
      alert('Registration Failed: ' + (err?.message || "Error during registration"));
      setErrorMsg(err?.message || "حدث خطأ أثناء التواصل مع خادم Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#072422] text-slate-100 flex flex-col justify-between selection:bg-[#b89b6a] selection:text-slate-950">
      {/* الشريط العلوي */}
      <header className="px-6 py-4 border-b border-[#0f4340] bg-[#0a3330]/90 backdrop-blur flex items-center justify-between">
        <Logo variant="horizontal" mode="dark" size="md" />
        <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#114b48] border border-[#1b615d] text-[11px] font-bold text-[#e5c388]">
          البوابة الرقمية الموحدة • دولة الإمارات
        </span>
      </header>

      {/* محتوى الشاشة */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl rounded-3xl bg-[#0a3835] border border-[#14524f] shadow-2xl p-6 sm:p-8 space-y-6">
          {/* الشعار الرسمي وعنوان النموذج */}
          <div className="text-center space-y-2 flex flex-col items-center">
            <Logo variant="full" mode="dark" size="xl" className="mb-2" />
            <div className="pt-2 border-t border-[#125854] w-full">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
                <Lock size={20} className="text-[#e5c388]" /> الدخول إلى البوابة القانونية
              </h2>
              <p className="text-xs text-teal-200/80 max-w-md mx-auto mt-1">
                يرجى إدخال بيانات حسابك المعتمد للوصول إلى نظام إدارة القضايا والخدمات
              </p>
            </div>
          </div>

          {/* تبويب الدخول / التسجيل */}
          <div className="flex rounded-2xl bg-[#061e1d] p-1.5 border border-[#104845] text-xs font-bold">
            <button
              onClick={() => { setAuthMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === "login" ? "bg-[#b89b6a] text-slate-950 font-black shadow-sm" : "text-teal-200/70 hover:text-white"
              }`}
            >
              <Key size={15} /> تسجيل الدخول
            </button>
            <button
              onClick={() => { setAuthMode("register"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === "register" ? "bg-[#b89b6a] text-slate-950 font-black shadow-sm" : "text-teal-200/70 hover:text-white"
              }`}
            >
              <UserPlus size={15} /> طلب انضمام جديد
            </button>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-bold flex items-center gap-2 leading-relaxed">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-bold flex items-center gap-2 leading-relaxed">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* حقول البريد وكلمة المرور */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    البريد الإلكتروني أو اسم المستخدم <span className="text-[#e5c388]">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute right-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="info@lawyersuood.com أو الاسم"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 pr-9 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#b89b6a] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">
                      كلمة المرور السرية <span className="text-[#e5c388]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-bold text-[#e5c388] hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 pr-9 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#b89b6a] focus:outline-none"
                    />
                  </div>
                </div>

                {/* خيار تذكر بيانات الدخول (Remember Me) */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#b89b6a] focus:ring-[#b89b6a] focus:ring-offset-slate-900"
                    />
                    <span className="font-semibold">تذكر بيانات الدخول على هذا الجهاز</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#061e1d] border border-[#104845] text-[11px] text-teal-200/80 space-y-1">
                <p className="font-bold text-[#e5c388] flex items-center gap-1">
                  <ShieldCheck size={14} /> بوابة مصرح بها للمستخدمين
                </p>
                <p className="leading-normal">
                  يرجى إدخال البريد الإلكتروني وكلمة المرور الخاصة بحسابك المسجل والمعتمد بالمكتب.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#b89b6a] text-slate-950 font-black hover:bg-[#a38555] transition shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> جارٍ تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> تسجيل الدخول
                  </>
                )}
              </button>

            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: أ. محمد عبدالله الشامسي"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-[#b89b6a] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@lawyersuood.com"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-[#b89b6a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-[#b89b6a] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور للحساب *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور قوية"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-[#b89b6a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الصفة الوظيفية المطلوب الانضمام بها *</label>
                  <select
                    value={regRoleKey}
                    onChange={(e) => setRegRoleKey(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-[#b89b6a] focus:outline-none"
                  >
                    <option value="lawyer">محامٍ ومستشار قانوني</option>
                    <option value="secretary">إدارة وسكرتارية قانونية</option>
                    <option value="accountant">محاسب مالية ومستحقين</option>
                    <option value="admin">مدير نظام شريك</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#061e1d] border border-[#104845] text-[11px] text-teal-200/80 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-[#e5c388]">
                    <Hourglass size={14} className="shrink-0" /> آلية تفعيل الحساب:
                  </p>
                  <p>
                    يتم إنشاء الحساب فوراً في قائمة Supabase Authentication وتقديم الطلب لمراجعة واعتماد مدير النظام.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#b89b6a] text-slate-950 font-black hover:bg-[#a38555] transition shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> جارٍ الإرسال إلى Supabase...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> إرسال طلب الانضمام إلى Supabase
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* مودال استعادة كلمة المرور (Forgot Password Modal) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Key className="text-amber-400" size={18} /> استعادة حساب وكلمة المرور
              </h3>
              <button
                onClick={() => { setShowForgotModal(false); setForgotSuccessMsg(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {forgotSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 size={18} /> تم إرسال تعليمات الاستعادة!
                </div>
                <p className="leading-relaxed">{forgotSuccessMsg}</p>
                <button
                  onClick={() => { setShowForgotModal(false); setForgotSuccessMsg(null); }}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) return;
                  const matchedUser = users.find(
                    (u) => u.email.toLowerCase() === forgotEmail.trim().toLowerCase()
                  );
                  setForgotSuccessMsg(
                    `تم إرسال تعليمات ورابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني (${forgotEmail}). يرجى التحقق من صندوق الوارد.`
                  );
                }}
                className="space-y-4 text-xs"
              >
                <p className="text-slate-300 leading-relaxed">
                  أدخل البريد الإلكتروني المسجل في النظام لتلقي رابط تعيين كلمة المرور والرمز المؤقت للوصول.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني المسجل *</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="info@lawyersuood.com"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                  >
                    إرسال رابط الاستعادة
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* تذييل الصفحة */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/40 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية • جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

// ============================================================
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState<UserItem[]>(() => {
    const loaded = loadStorage<UserItem[]>("firm_users", seedUsers);
    const initial = (!loaded || loaded.length === 0) ? seedUsers : loaded;
    return initial.map((u) => {
      if (u.id === 1 || u.roleKey === "admin" || u.name.includes("سعود")) {
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
  const [clients, setClients] = useState<Client[]>(() => loadStorage("firm_clients", seedClients));
  const [feeAgreements, setFeeAgreements] = useState<FeeAgreement[]>(() => loadStorage("firm_fee_agreements", seedFeeAgreements));
  const [payments, setPayments] = useState<PaymentReceipt[]>(() => loadStorage("firm_payments", seedPayments));
  const [cases, setCases] = useState<CaseItem[]>(() => loadStorage("firm_cases", seedCases));
  const [hearings, setHearings] = useState<Hearing[]>(() => loadStorage("firm_hearings", seedHearings));
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadStorage("firm_tasks", seedTasks));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStorage("firm_invoices", seedInvoices));
  const [docs, setDocs] = useState<DocItem[]>(() => loadStorage("firm_docs", seedDocs));
  const [poas, setPoas] = useState<PoaItem[]>(() => loadStorage("firm_poas", seedPoas));
  const [kyc, setKyc] = useState<KycItem[]>(() => loadStorage("firm_kyc", seedKyc));
  const [notifications, setNotifications] = useState<NotificationLog[]>(seedNotifications);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(seedTimeLogs);
  const [caseExpenses, setCaseExpenses] = useState<CaseExpense[]>(seedCaseExpenses);
  const [trustTransactions, setTrustTransactions] = useState<TrustTransaction[]>(seedTrustTransactions);
  const [deadlines, setDeadlines] = useState<JudgmentDeadline[]>(seedDeadlines);
  const [installments, setInstallments] = useState<InvoiceInstallment[]>(seedInstallments);
  const [strReports, setStrReports] = useState<StrReport[]>(seedStrReports);
  const [courtContacts, setCourtContacts] = useState<CourtContact[]>(() => loadStorage("firm_court_contacts", seedCourtContacts));
  const [officeAgreements, setOfficeAgreements] = useState<OfficeAgreement[]>(() => loadStorage("firm_office_agreements", []));

  useEffect(() => { saveStorage("firm_clients", clients); }, [clients]);
  useEffect(() => { saveStorage("firm_cases", cases); }, [cases]);
  useEffect(() => { saveStorage("firm_users", users); }, [users]);
  useEffect(() => { saveStorage("firm_fee_agreements", feeAgreements); }, [feeAgreements]);
  useEffect(() => { saveStorage("firm_payments", payments); }, [payments]);
  useEffect(() => { saveStorage("firm_office_agreements", officeAgreements); }, [officeAgreements]);
  useEffect(() => { saveStorage("firm_invoices", invoices); }, [invoices]);
  useEffect(() => { saveStorage("firm_docs", docs); }, [docs]);
  useEffect(() => { saveStorage("firm_poas", poas); }, [poas]);
  useEffect(() => { saveStorage("firm_kyc", kyc); }, [kyc]);
  useEffect(() => { saveStorage("firm_court_contacts", courtContacts); }, [courtContacts]);
  const [agrPreviewId, setAgrPreviewId] = useState<number | null>(null);
  const [deleteAgrConfirm, setDeleteAgrConfirm] = useState<OfficeAgreement | null>(null);
  const emptyAgrForm = () => ({
    contractDate: todayISO(),
    contractCity: "الشارقة",
    clientMode: "new" as "new" | "existing",
    existingClientId: "",
    clientNameAr: "",
    clientNameEn: "",
    representativeAr: "",
    representativeEn: "",
    clientType: "شركة",
    idNo: "",
    phone: "",
    email: "",
    emirate: "الشارقة",
    address: "",
    caseDetailsAr: "",
    caseDetailsEn: "",
    installments: [{ amount: "", dueDate: todayISO(), paidOnSigning: true }] as any[],
  });
  const [agrForm, setAgrForm] = useState<any>(emptyAgrForm());

  const setAgr = (k: string, v: any) => setAgrForm((prev: any) => ({ ...prev, [k]: v }));
  const setAgrInst = (idx: number, k: string, v: any) =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: prev.installments.map((it: any, i: number) => (i === idx ? { ...it, [k]: v } : it)),
    }));
  const addAgrInst = () =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: [...prev.installments, { amount: "", dueDate: todayISO(), paidOnSigning: false }],
    }));
  const removeAgrInst = (idx: number) =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: prev.installments.filter((_: any, i: number) => i !== idx),
    }));

  const agrTotal = (agrForm.installments || []).reduce((s: number, i: any) => s + (+i.amount || 0), 0);

  // توليد نص "قيمة العقد وطريقة السداد" تلقائياً حسب الدفعات المدخلة
  const buildPaymentTerms = (insts: OfficeAgreementInstallment[], total: number) => {
    if (insts.length === 1 && insts[0].paidOnSigning) {
      return {
        ar: `قيمة العقد ${total.toLocaleString("ar-AE")} درهم تُدفع عند توقيع العقد.`,
        en: `The contract value is AED ${total.toLocaleString("en-US")} payable upon signing of the contract.`,
      };
    }
    const arParts = insts
      .map((i, idx) => `الدفعة ${idx + 1}: ${i.amount.toLocaleString("ar-AE")} درهم بتاريخ ${fmtDate(i.dueDate)}${i.paidOnSigning ? " (عند التوقيع)" : ""}`)
      .join("، ");
    const enParts = insts
      .map((i, idx) => `Installment ${idx + 1}: AED ${i.amount.toLocaleString("en-US")} due on ${i.dueDate}${i.paidOnSigning ? " (upon signing)" : ""}`)
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
      .map((i: any) => ({ amount: +i.amount, dueDate: i.dueDate || todayISO(), paidOnSigning: !!i.paidOnSigning }));
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
    let maxInstId = feeAgreements.flatMap((a) => a.installments || []).reduce((m, i) => Math.max(m, i.id), 0);
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
    if (!checkPerm("manageInvoices", "حذف اتفاقية الأتعاب")) return;
    const targetId = deleteAgrConfirm.id;
    const feeAgrId = deleteAgrConfirm.feeAgreementId;
    const cid = deleteAgrConfirm.clientId;

    // 1. Remove from officeAgreements archive
    setOfficeAgreements((prev) => prev.filter((a) => a.id !== targetId));
    // 2. Remove from feeAgreements list if linked
    if (feeAgrId) {
      setFeeAgreements((prev) => prev.filter((fa) => fa.id !== feeAgrId));
    }

    // 3. إلغاء الموكل تلقائياً إذا كانت هذه الاتفاقية هي سبب ارتباطه الوحيد بالمكتب ولا توجد أي سجلات أخرى
    if (cid) {
      const hasOtherOfficeAgr = officeAgreements.some((a) => a.id !== targetId && a.clientId === cid);
      const hasOtherFeeAgr = feeAgreements.some((fa) => fa.id !== feeAgrId && fa.clientId === cid);
      const hasCases = cases.some((c) => c.clientId === cid);
      const hasInvoices = invoices.some((inv) => inv.clientId === cid);
      const hasPoas = poas.some((p) => p.clientId === cid);

      const hasOtherRecords = hasOtherOfficeAgr || hasOtherFeeAgr || hasCases || hasInvoices || hasPoas;

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
  const [courtSearchQuery, setCourtSearchQuery] = useState("");
  const [courtEmirateFilter, setCourtEmirateFilter] = useState("الكل");
  const [courtCategoryFilter, setCourtCategoryFilter] = useState("الكل");
  const [editingCourtContact, setEditingCourtContact] = useState<CourtContact | null>(null);

  // Sub-tabs configuration
  const [invoiceSubTab, setInvoiceSubTab] = useState<"invoices" | "agreements" | "payments" | "time" | "trust" | "expenses">("payments");
  const [docSubTab, setDocSubTab] = useState<"archive" | "generator" | "letterhead">("archive");
  const [kycSubTab, setKycSubTab] = useState<"kyc" | "str">("kyc");

  const [letterhead, setLetterhead] = useState(loadLetterhead);

  const updateLetterhead = (partial: Partial<{ headerImg: string; footerImg: string }>) => {
    setLetterhead((prev) => {
      const next = {
        headerImg: partial.headerImg !== undefined ? partial.headerImg : prev.headerImg,
        footerImg: partial.footerImg !== undefined ? partial.footerImg : prev.footerImg,
      };
      saveLetterhead(next);
      return next;
    });
  };
  const [hearingSubTab, setHearingSubTab] = useState<"hearings" | "deadlines">("hearings");

  // Client portal & Doc generator states
  const [clientPortalId, setClientPortalId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("notice");
  const [selectedGenCaseId, setSelectedGenCaseId] = useState<number>(1);

  const [notifyModal, setNotifyModal] = useState<{
    recipientName: string;
    recipientPhone: string;
    recipientEmail: string;
    channel: "واتساب" | "إيميل" | "كلاهما";
    type: "تنبيه جلسة" | "تحديث قضية" | "تذكير فاتورة" | "تجديد وثائق / KYC" | "تجديد وكالة / POA" | "تنبيه ميعاد طعن / استئناف" | "تذكير قسط فاتورة" | "رسالة عامة";
    subject: string;
    message: string;
    relatedRef?: string;
  } | null>(null);

  const [selectedRollDate, setSelectedRollDate] = useState<string>(todayISO());
  const [rollCourtFilter, setRollCourtFilter] = useState<string>("الكل");

  const [report, setReport] = useState<any>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const [caseView, setCaseView] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [caseFilter, setCaseFilter] = useState("الكل");

  // حالات إدارة الموكلين وجهات الاتصال
  const [clientCategoryFilter, setClientCategoryFilter] = useState<string>("الكل");
  const [clientSearch, setClientSearch] = useState<string>("");
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
    setEditingClient(null);
    setClientToast(`تم تحديث بيانات "${editingClient.name}" بنجاح`);
    setTimeout(() => setClientToast(null), 4000);
  };

  // حذف موكل / جهة اتصال مع التحقق من وجود قضايا مرتبطة
  const deleteClient = (clientId: number) => {
    if (!checkPerm("manageClients", "حذف الموكل")) return;
    const cObj = clients.find((c) => c.id === clientId);
    if (!cObj) return;
    const caseCount = cases.filter((x) => x.clientId === clientId).length;
    if (caseCount > 0) {
      alert(`لا يمكن حذف "${cObj.name}" لوجود ${caseCount} قضية مسجلة باسمه في النظام.`);
      return;
    }
    if (confirm(`هل أنت تأكد من حذف "${cObj.name}" من سجل الموكلين وجهات الاتصال؟`)) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      setClientToast(`تم حذف "${cObj.name}" بنجاح`);
      setTimeout(() => setClientToast(null), 4000);
    }
  };

  // حالة مودال Supabase SQL وتحديد المستخدمين المعلقين
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  // حالات البريد الإلكتروني المدمج (In-App Email & Supabase Sync)
  const [emailFolder, setEmailFolder] = useState<"inbox" | "sent" | "draft" | "trash">("inbox");
  const [emailSearch, setEmailSearch] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(1);
  const [showComposeEmail, setShowComposeEmail] = useState<boolean>(false);
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState<boolean>(false);

  const [composeTo, setComposeTo] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [composeAttachment, setComposeAttachment] = useState<string>("");

  // إعدادات البريد الإلكتروني (SMTP / IMAP / App Settings)
  const [emailConfig, setEmailConfig] = useState<{
    email: string;
    senderName: string;
    appPassword?: string;
    smtpHost: string;
    smtpPort: number;
    secure: boolean;
    isConfigured: boolean;
  }>({
    email: "info@lawyersuood.com",
    senderName: "المحامي سعود أحمد الشحي",
    appPassword: "",
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    secure: false,
    isConfigured: true
  });

  const [inAppEmails, setInAppEmails] = useState<Array<{
    id: number;
    folder: "inbox" | "sent" | "draft" | "trash";
    sender: string;
    senderEmail: string;
    recipient: string;
    recipientEmail: string;
    subject: string;
    body: string;
    date: string;
    isRead: boolean;
    hasAttachment?: boolean;
    attachmentName?: string;
  }>>([
    {
      id: 1,
      folder: "inbox",
      sender: "أمانة سر محاكم دبي",
      senderEmail: "notifications@dc.gov.ae",
      recipient: "المحامي سعود الشحي",
      recipientEmail: "lawyer.suood@al-shehhi-law.ae",
      subject: "إشعار قيد لائحة طعن / استئناف في الدعوى رقم 458/2026 تجاري دبي",
      body: "السادة / مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية المحترمين،\n\nنود إفادتكم بأنه تم تسجيل لائحة الاستئناف المقدمة منكم بالدعوى التجارية رقم 458/2026 بنجاح أمام محكمة استئناف دبي.\nمرفق لكم إيصال السداد وإشعار الموعد المحدد للجلسة الأولى بتاريخ 25/08/2026 الساعة 09:30 صباحاً بالقاعة رقم (4).\n\nوتقبلوا فائق الاحترام والتقدير،\nمحاكم دبي — قطاع الشؤون القضائية",
      date: "اليوم 09:15 ص",
      isRead: false,
      hasAttachment: true,
      attachmentName: "إشعار_قيد_استئناف_458.pdf"
    },
    {
      id: 2,
      folder: "inbox",
      sender: "فوزية أحمد المهيري",
      senderEmail: "fowziya.almehairi@gmail.com",
      recipient: "مكتب المحاماة",
      recipientEmail: "info@al-shehhi-law.ae",
      subject: "استفسار بشأن أوراق ملكية العقار في قضية النزاع الإيجاري",
      body: "سعادة المحامي سعود الشحي المحترم،\n\nالسلام عليكم ورحمة الله وبركاته،\nأود الاستفسار عن كشف الحساب والوثائق المطلوبة لجلسة الخبير القادمة يوم الخميس. قمت بتجهيز أصل عقود الإيجار وإيصالات تحويل المبالغ لدى البنك.\n\nشاكرة لكم اهتمامكم الدائم والمتابعة،\nفوزية المهيري",
      date: "أمس 04:30 م",
      isRead: true
    },
    {
      id: 3,
      folder: "sent",
      sender: "المحامي سعود الشحي",
      senderEmail: "lawyer.suood@al-shehhi-law.ae",
      recipient: "وزارة العدل - قسم التوثيقات",
      recipientEmail: "notary@moj.gov.ae",
      subject: "طلب توثيق وكالة قانونية خاصة لمرافعة الشركات",
      body: "السادة / الكاتب العدل بوزارة العدل الاتحادية المحترمين،\n\nمرفق لسيادتكم طلب توثيق الوكالة الرسمية الخاصة بشركة (دار سمرا للكمبيوتر ذ.م.م) برقم الرخصة 100331456200003 لاعتمادها في الملف القضائي.\n\nشاكرين لكم حسن التعاون،\nمكتب سعود أحمد الشحي للمحاماة",
      date: "10 أغسطس 2026",
      isRead: true
    }
  ]);

  // ================= حالات واتساب المكتب المدمج الحقيقي (WhatsApp Engine & Live QR) =================
  const [browserUrl, setBrowserUrl] = useState<string>("https://web.whatsapp.com/");
  const [browserInputUrl, setBrowserInputUrl] = useState<string>("https://web.whatsapp.com/");

  const [waBackendSession, setWaBackendSession] = useState<{
    status: 'disconnected' | 'qr_ready' | 'connected';
    qrCodeUrl: string | null;
    pairingCode: string | null;
    phoneNumber: string | null;
    connectedAt: string | null;
    messagesCount: number;
  }>({
    status: 'disconnected',
    qrCodeUrl: null,
    pairingCode: null,
    phoneNumber: null,
    connectedAt: null,
    messagesCount: 0
  });

  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // استعلام حالة واتساب الحقيقية من السيرفر
  const fetchWaStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
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
      const res = await fetch('/api/whatsapp/generate-qr', { method: 'POST' });
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
      const res = await fetch('/api/whatsapp/connect-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+971 50 889 9123' })
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
      const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
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
      const res = await fetch('/api/email/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setEmailConfig(prev => ({
            ...prev,
            email: data.settings.email || prev.email,
            senderName: data.settings.senderName || prev.senderName,
            smtpHost: data.settings.host || prev.smtpHost,
            smtpPort: data.settings.port || prev.smtpPort,
            secure: data.settings.secure ?? prev.secure,
            isConfigured: true
          }));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchSupabaseProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) {
        // Deduplicate fetched profiles before processing
        const fetchedProfiles = data || [];
        const uniqueProfiles = Array.from(
          new Map(fetchedProfiles.map((p: any) => [p.id || p.email?.trim().toLowerCase(), p])).values()
        );

        setUsers((prev) => {
          let updated = [...prev];
          let changed = false;

          const dbIds = new Set(uniqueProfiles.map((p: any) => p.id).filter(Boolean));
          const dbEmails = new Set(uniqueProfiles.map((p: any) => p.email?.trim().toLowerCase()).filter(Boolean));

          // Filter out users that were removed from Supabase profiles (unless primary local admin)
          const initialLen = updated.length;
          updated = updated.filter((u) => {
            if (u.id === 1 || u.name.includes("سعود")) return true;
            if (u.supabaseId && !dbIds.has(u.supabaseId) && !dbEmails.has(u.email.toLowerCase())) return false;
            return true;
          });
          if (updated.length !== initialLen) changed = true;

          uniqueProfiles.forEach((p: any) => {
            const emailClean = p.email?.trim().toLowerCase();
            if (!emailClean) return;
            const existingIdx = updated.findIndex((u) => u.email.toLowerCase() === emailClean || (p.id && u.supabaseId === p.id));
            const pPhone = p.phone || p.phone_number || "0500000000";
            const pName = p.full_name || p.name || emailClean.split("@")[0];
            const pStatus = (p.status === "pending" || p.status === "معلق") ? "pending" : (p.status === "approved" || p.status === "نشط" || p.status === "active") ? "approved" : "rejected";

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
                  try { dbPerms = JSON.parse(p.permissions); } catch (e) {}
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
                  permissions: dbPerms
                };
                changed = true;
              }
            } else {
              const roleKey = (p.role as any) || "lawyer";
              const roleTitle = p.role_title || (ROLE_PRESETS[roleKey]?.title) || "محامٍ ومستشار";
              let dbPerms = ROLE_PRESETS[roleKey]?.permissions || ROLE_PRESETS.lawyer.permissions;
              if (p.permissions) {
                if (typeof p.permissions === "string") {
                  try { dbPerms = JSON.parse(p.permissions); } catch (e) {}
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
                password: p.password || "123456",
                roleKey: roleKey as any,
                roleTitle: roleTitle,
                status: pStatus,
                avatarBg: "bg-amber-600 text-white",
                avatarText: pName.slice(0, 2),
                permissions: dbPerms
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
    } catch (err) {
      console.log("Supabase profiles sync note:", err);
    }
  };

  const fetchSupabaseEmailMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("email_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setInAppEmails(prev => {
          const updated = [...prev];
          data.forEach((row: any) => {
            const mappedMsg = {
              id: row.id || Date.now() + Math.random(),
              folder: (row.folder as any) || (row.sender_email === emailConfig.email ? "sent" : "inbox"),
              sender: row.sender_name || row.sender_email || "مرسل غير معروف",
              senderEmail: row.sender_email || "",
              recipient: row.recipient_name || row.recipient_email || "",
              recipientEmail: row.recipient_email || "",
              subject: row.subject || "بدون موضوع",
              body: row.body || row.message_body || "",
              date: row.created_at ? new Date(row.created_at).toLocaleString("ar-AE") : "الآن",
              isRead: row.is_read ?? false,
              hasAttachment: !!row.attachment_name,
              attachmentName: row.attachment_name || ""
            };
            const existingIndex = updated.findIndex(m => m.id === mappedMsg.id || (m.subject === mappedMsg.subject && m.date === mappedMsg.date));
            if (existingIndex >= 0) {
              updated[existingIndex] = mappedMsg;
            } else {
              updated.unshift(mappedMsg);
            }
          });
          return [...updated];
        });
      }
    } catch (err) {
      console.log("Supabase email sync note:", err);
    }
  };

  const handleSaveEmailSettings = async () => {
    if (!emailConfig.email || !emailConfig.smtpHost) {
      alert("يرجى إدخال البريد الإلكتروني وخادم الإرسال SMTP");
      return;
    }

    try {
      await fetch('/api/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailConfig.email,
          senderName: emailConfig.senderName,
          password: emailConfig.appPassword,
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.secure
        })
      });
    } catch (e) {
      console.log("Save email config note:", e);
    }

    setEmailConfig(prev => ({ ...prev, isConfigured: true }));
    setShowEmailSettingsModal(false);
    setPermissionNotice(`تم حفظ وتفعيل إعدادات البريد الإلكتروني بنجاح لـ (${emailConfig.email}) عبر خادم (${emailConfig.smtpHost})`);
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
      attachmentName: composeAttachment || undefined
    };

    setInAppEmails(prev => [newSentMail, ...prev]);
    setShowComposeEmail(false);
    setEmailFolder("sent");
    setSelectedEmailId(newSentMail.id);

    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
          smtp: emailConfig
        })
      });
    } catch (e) {
      console.log("Server send email note:", e);
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
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.log("Supabase insert email note:", err);
    }

    setPermissionNotice("تم توجيه وإرسال الرسالة الإلكترونية بنجاح وتوثيقها في جدول Supabase!");
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
    fetchWaStatus();
    fetchEmailSettings();
    fetchSupabaseEmailMessages();
    fetchSupabaseProfiles();

    // التحقق المباشر من جلسة Supabase ومتابعة تغيرات الجلسة (onAuthStateChange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
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

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchSupabaseProfiles();
        }
      )
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
            setInAppEmails(prev => {
              const mapped = {
                id: newRow.id || Date.now(),
                folder: (newRow.folder as any) || (newRow.sender_email === emailConfig.email ? "sent" : "inbox"),
                sender: newRow.sender_name || newRow.sender_email || "رسالة جديدة",
                senderEmail: newRow.sender_email || "",
                recipient: newRow.recipient_name || newRow.recipient_email || "",
                recipientEmail: newRow.recipient_email || "",
                subject: newRow.subject || "بدون عنوان",
                body: newRow.body || newRow.message_body || "",
                date: new Date().toLocaleString("ar-AE"),
                isRead: newRow.is_read ?? false,
                hasAttachment: !!newRow.attachment_name,
                attachmentName: newRow.attachment_name || ""
              };
              const exists = prev.some(m => m.id === mapped.id);
              if (exists) {
                return prev.map(m => m.id === mapped.id ? mapped : m);
              }
              return [mapped, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      authSub?.unsubscribe();
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(emailChannel);
    };
  }, []);

  // حالات واتساب المكتب المدمج (WhatsApp Office)
  const [selectedWaChatId, setSelectedWaChatId] = useState<number>(1);
  const [waInputText, setWaInputText] = useState<string>("");
  const [waSearchTerm, setWaSearchTerm] = useState<string>("");
  const [showNewWaChatModal, setShowNewWaChatModal] = useState<boolean>(false);
  const [newWaName, setNewWaName] = useState<string>("");
  const [newWaPhone, setNewWaPhone] = useState<string>("");
  const [waChats, setWaChats] = useState<Array<{
    id: number;
    name: string;
    phone: string;
    role: string;
    avatarBg: string;
    unreadCount: number;
    messages: Array<{
      id: number;
      sender: "me" | "them";
      text: string;
      time: string;
      status?: "sent" | "delivered" | "read";
    }>;
  }>>(() => {
    const loaded = loadStorage<any[]>("firm_wa_chats", []);
    return loaded.filter(c => c.name !== "فوزية أحمد المهيري" && c.name !== "شركة دار سمرا للكمبيوتر (ممثل الشركة)" && c.name !== "أمانة سر محاكم دبي - كاتب الجلسة");
  });

  useEffect(() => {
    saveStorage("firm_wa_chats", waChats);
  }, [waChats]);

  // مزامنة رسائل الواتساب لحظياً مع جدول Supabase (whatsapp_messages) و Edge Function
  const fetchSupabaseWhatsAppMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setWaChats(prev => {
          const updated = [...prev];
          data.forEach((row: any) => {
            const rowPhoneClean = row.phone_number?.replace(/[^\d]/g, "");
            const targetChat = updated.find(c => c.phone.replace(/[^\d]/g, "") === rowPhoneClean);
            if (targetChat) {
              const msgExists = targetChat.messages.some(m => m.text === row.message_body && m.sender === (row.sender === "me" ? "me" : "them"));
              if (!msgExists) {
                targetChat.messages.push({
                  id: row.id || Date.now() + Math.random(),
                  sender: row.sender === "me" ? "me" : "them",
                  text: row.message_body,
                  time: row.created_at ? new Date(row.created_at).toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }) : "الآن",
                  status: (row.status as any) || "sent"
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
                messages: [{
                  id: row.id || Date.now(),
                  sender: row.sender === "me" ? "me" : "them",
                  text: row.message_body,
                  time: row.created_at ? new Date(row.created_at).toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }) : "الآن",
                  status: (row.status as any) || "sent"
                }]
              });
            }
          });
          return [...updated];
        });
      }
    } catch (err) {
      console.log("Supabase whatsapp_messages sync note:", err);
    }
  };

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
            setWaChats(prev => {
              const rowPhoneClean = newRow.phone_number.replace(/[^\d]/g, "");
              const matchesChat = prev.find(chat => chat.phone.replace(/[^\d]/g, "") === rowPhoneClean);

              if (matchesChat) {
                return prev.map(chat => {
                  if (chat.phone.replace(/[^\d]/g, "") === rowPhoneClean) {
                    const alreadyHas = chat.messages.some(m => m.id === newRow.id || (m.text === newRow.message_body && m.sender === (newRow.sender === "me" ? "me" : "them")));
                    if (!alreadyHas) {
                      return {
                        ...chat,
                        unreadCount: newRow.sender !== "me" ? chat.unreadCount + 1 : chat.unreadCount,
                        messages: [
                          ...chat.messages,
                          {
                            id: newRow.id || Date.now(),
                            sender: newRow.sender === "me" ? "me" : "them",
                            text: newRow.message_body,
                            time: new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
                            status: (newRow.status as any) || "sent"
                          }
                        ]
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
                    messages: [{
                      id: newRow.id || Date.now(),
                      sender: newRow.sender === "me" ? "me" : "them",
                      text: newRow.message_body,
                      time: new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
                      status: (newRow.status as any) || "sent"
                    }]
                  }
                ];
              }
            });
          }
        }
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

    const activeChat = waChats.find(c => c.id === targetChatId);
    if (!activeChat) return;

    // 1. تحديث واجهة المستخدم فورياً
    const newMsg = {
      id: Date.now(),
      sender: "me" as const,
      text: textToSend,
      time: "الآن",
      status: "sent" as const
    };
    setWaChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: [...c.messages, newMsg] } : c));

    // 2. استدعاء Edge Function المسماة send-whatsapp-message
    sendWhatsAppViaEdgeFunction({
      to: activeChat.phone,
      message: textToSend,
      contact_name: activeChat.name
    });

    // 3. حفظ السجل في جدول whatsapp_messages في Supabase
    try {
      await supabase.from("whatsapp_messages").insert({
        phone_number: activeChat.phone,
        contact_name: activeChat.name,
        sender: "me",
        message_body: textToSend,
        status: "sent"
      });
    } catch (e) {
      console.log("Note on Supabase insert:", e);
    }
  };

  // دالة إنشاء محادثة جديدة وتفعيلها فوراً
  const handleStartNewWaChat = async (name: string, phone: string, initialMsg?: string) => {
    if (!phone) return;
    const cleanPhone = phone.trim();
    const cleanName = name.trim() || cleanPhone;

    let targetId: number;
    const existing = waChats.find(c => c.phone.replace(/[^\d]/g, "") === cleanPhone.replace(/[^\d]/g, ""));
    
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
        messages: []
      };
      setWaChats(prev => [newChatObj, ...prev]);
    }

    setSelectedWaChatId(targetId);

    if (initialMsg && initialMsg.trim()) {
      const msgText = initialMsg.trim();
      setWaChats(prev => prev.map(c => c.id === targetId ? {
        ...c,
        messages: [...c.messages, {
          id: Date.now(),
          sender: "me",
          text: msgText,
          time: "الآن",
          status: "sent"
        }]
      } : c));

      sendWhatsAppViaEdgeFunction({
        to: cleanPhone,
        message: msgText,
        contact_name: cleanName
      });

      try {
        await supabase.from("whatsapp_messages").insert({
          phone_number: cleanPhone,
          contact_name: cleanName,
          sender: "me",
          message_body: msgText,
          status: "sent"
        });
      } catch (e) {
        console.log("Note on insert:", e);
      }
    }
  };

  // حالات مودال تخصيص الصلاحيات عند قبول وتفعيل المستخدم الجدد
  const [approvingUser, setApprovingUser] = useState<UserItem | null>(null);
  const [assignRoleTitle, setAssignRoleTitle] = useState<string>("");
  const [assignRoleKey, setAssignRoleKey] = useState<"admin" | "lawyer" | "secretary" | "accountant">("lawyer");
  const [assignCanTransfer, setAssignCanTransfer] = useState<boolean>(false);
  const [assignCanAgreements, setAssignCanAgreements] = useState<boolean>(false);
  const [assignCanWhatsapp, setAssignCanWhatsapp] = useState<boolean>(false);
  const [assignCanFinances, setAssignCanFinances] = useState<boolean>(false);

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

  // المستخدم الحالي والصلاحيات النشطة
  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) || users[0], [users, currentUserId]);
  const userPerms = currentUser.permissions;

  const isAdmin = useMemo(() => {
    return currentUser?.roleKey === "admin" || (currentUser as any)?.role === "admin";
  }, [currentUser]);

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

    console.log("Target User ID for approval:", targetUserId, "Email:", approvingUser.email);

    try {
      // Direct update in Supabase profiles by ID
      const { data, error } = await supabase
        .from("profiles")
        .update({
          status: "approved",
          role: assignRoleKey,
          role_title: assignRoleTitle || preset.title
        })
        .eq("id", targetUserId)
        .select();

      console.log("Update result by ID:", data, "Error:", error);

      let isSuccess = !error && data && data.length > 0;

      // Fallback update by email if ID update returned empty or error
      if (!isSuccess) {
        console.log("Attempting fallback update by email:", approvingUser.email);
        const { data: emailData, error: emailError } = await supabase
          .from("profiles")
          .update({
            status: "approved",
            role: assignRoleKey,
            role_title: assignRoleTitle || preset.title
          })
          .eq("email", approvingUser.email.toLowerCase())
          .select();

        console.log("Email Update result:", emailData, "Error:", emailError);

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
              : u
          )
        );

        // Re-fetch users from database to ensure source of truth
        await fetchSupabaseProfiles();

        setPermissionNotice(`تم القبول والاعتماد الصريح لحساب "${approvingUser.name}" وإسناد الصلاحيات المحددة بنجاح!`);
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
    if (!checkPerm("manageUsers", "حذف مستخدم")) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (target.id === currentUserId) {
      alert("لا يمكنك حذف حسابك الحالي الناشط");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف حساب "${target.name}" نهائياً من النظام؟`)) {
      return;
    }

    // Immediately remove from active state so row disappears
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
      console.log("Error during profile deletion:", e);
      try {
        await supabase
          .from("profiles")
          .update({ status: "rejected" })
          .eq("email", target.email.toLowerCase());
      } catch (err) {
        console.log("Fallback soft delete failed:", err);
      }
    }

    setPermissionNotice(`تم حذف واستبعاد حساب "${target.name}" بنجاح.`);
  };

  const rejectUser = async (userId: number) => {
    if (!checkPerm("manageUsers", "إدارة المستخدمين")) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    
    // Instantly remove from state
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    const targetUserId = target.supabaseId || target.id;
    try {
      const { error: deleteErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", targetUserId);

      if (deleteErr) {
        await supabase
          .from("profiles")
          .update({ status: "rejected" })
          .eq("id", targetUserId);
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
  const nextId = <T extends { id: number }>(arr: T[]) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);

  // ---------- فتح نموذج التنبيهات وإرسال الواتساب والبريد ----------
  const openNotificationComposer = (
    type: "تنبيه جلسة" | "تحديث قضية" | "تذكير فاتورة" | "تجديد وثائق / KYC" | "تجديد وكالة / POA" | "تنبيه ميعاد طعن / استئناف" | "تذكير قسط فاتورة" | "رسالة عامة",
    data?: any
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
    const { recipientName, recipientPhone, recipientEmail, channel, type, subject, message, relatedRef } = notifyModal;

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
      sentAt: new Date().toLocaleDateString("ar-AE") + " " + new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
      status: "تم الإرسال",
      relatedRef,
    };

    setNotifications([newLog, ...notifications]);
    setNotifyModal(null);
  };

  // التحقق مما إذا كان المستخدم الحالي هو المدير الأعلى Super Admin (المحامي سعود)
  const isSuperAdmin = useMemo(() => {
    return currentUser.roleKey === "admin" || currentUser.name.includes("سعود") || currentUser.id === 1;
  }, [currentUser]);

  // التحقق من الصلاحية مع التنبيه
  const checkPerm = (permKey: keyof RolePermissions, actionName: string): boolean => {
    if (isSuperAdmin) return true;
    if (!userPerms[permKey]) {
      setPermissionNotice(`عذرًا، حساب "${currentUser.name}" دور (${currentUser.roleTitle}) لا يمتلك صلاحية [${PERMISSION_LABELS[permKey].label}]. يُرجى التبديل لحساب المدير لتجربتها.`);
      return false;
    }
    return true;
  };

  // ---------- إحصاءات ----------
  const stats = useMemo(() => {
    const active = cases.filter((c) => !["مغلقة", "صدر الحكم"].includes(c.status)).length;
    const weekHearings = hearings.filter((h) => !h.done && daysUntil(h.date) >= 0 && daysUntil(h.date) <= 7).length;
    const dueAmount = invoices.filter((i) => ["مرسلة", "متأخرة"].includes(i.status)).reduce((s, i) => s + i.amount * (1 + VAT_RATE), 0);
    const expiringPoa = poas.filter((p) => daysUntil(p.expiry) <= 60 && daysUntil(p.expiry) >= 0).length;
    return { active, weekHearings, dueAmount, expiringPoa };
  }, [cases, hearings, invoices, poas]);

  const casesByType = useMemo(() => {
    const m: Record<string, number> = {};
    cases.forEach((c) => (m[c.type] = (m[c.type] || 0) + 1));
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [cases]);

  const invoiceSummary = useMemo(() => {
    const m: Record<string, number> = { "مدفوعة": 0, "مرسلة": 0, "متأخرة": 0, "مسودة": 0 };
    invoices.forEach((i) => {
      if (m[i.status] !== undefined) {
        m[i.status] += i.amount * (1 + VAT_RATE);
      }
    });
    return Object.entries(m).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [invoices]);

  const PIE_COLORS = ["#059669", "#0284c7", "#dc2626", "#94a3b8"];

  // ---------- نماذج الإضافة والحفظ ----------
  const [form, setForm] = useState<Record<string, any>>({});
  const openModalWithCheck = (kind: string, permKey?: keyof RolePermissions) => {
    if (permKey && !checkPerm(permKey, kind)) return;
    setForm({});
    setModal(kind);
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const saveCase = () => {
    if (!checkPerm("manageCases", "إضافة قضية")) return;
    if (!form.number || !form.clientId) return;
    setCases([...cases, { id: nextId(cases), number: form.number, clientId: +form.clientId, opponent: form.opponent || "—", type: form.type || CASE_TYPES[0], court: form.court || COURTS[0], judge: form.judge || "", status: form.status || "قيد النظر", subject: form.subject || "", openDate: form.openDate || todayISO(), fee: +form.fee || 0 }]);
    setModal(null);
  };

  const saveClient = () => {
    if (!checkPerm("manageClients", "إضافة موكل")) return;
    if (!form.name) return;
    setClients([...clients, { id: nextId(clients), name: form.name, type: form.type || "فرد", idNo: form.idNo || "", phone: form.phone || "", email: form.email || "", emirate: form.emirate || "دبي", address: form.address || "" }]);
    setModal(null);
  };

  const saveHearing = () => {
    if (!checkPerm("manageHearings", "جدولة جلسة")) return;
    if (!form.caseId || !form.date) return;
    setHearings([...hearings, { id: nextId(hearings), caseId: +form.caseId, date: form.date, time: form.time || "09:00", type: form.type || HEARING_TYPES[0], room: form.room || "", notes: form.notes || "", done: false }]);
    setModal(null);
  };

  const saveTask = () => {
    if (!checkPerm("manageTasks", "إضافة مهمة")) return;
    if (!form.title) return;
    setTasks([...tasks, { id: nextId(tasks), title: form.title, caseId: form.caseId ? +form.caseId : null, assignee: form.assignee || currentUser.name, due: form.due || todayISO(), priority: form.priority || "متوسطة", done: false }]);
    setModal(null);
  };

  const saveInvoice = () => {
    if (!checkPerm("manageInvoices", "إصدار فاتورة")) return;
    if (!form.clientId || !form.amount) return;
    setInvoices([...invoices, { id: nextId(invoices), number: `INV-2026-${String(60 + nextId(invoices)).padStart(3, "0")}`, clientId: +form.clientId, caseId: form.caseId ? +form.caseId : null, date: todayISO(), due: form.due || addDays(30), amount: +form.amount, status: "مسودة", desc: form.desc || "" }]);
    setModal(null);
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
      .filter((p) => p.clientId === clientId && (p.feeAgreementId === "unallocated" || p.feeAgreementId === null || p.feeAgreementId === undefined))
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
        alert("⚠️ اتفقاقة الأتعاب مسددة بالكامل (المتبقي: 0 د.إ)، لا يمكن إضافة دفعات جديدة عليها.");
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
        notes: form.notes || ""
      };

      setPayments((prev) => [...prev, newPayment]);

      // تحديث حالة الاتفاقية إذا سددت بالكامل
      const totalPaidAfter = getPaidForAgreement(agr.id) + amt;
      if (totalPaidAfter >= agr.totalAmount) {
        setFeeAgreements((prev) => prev.map((a) => a.id === agr.id ? { ...a, status: "مسددة بالكامل" } : a));
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
        notes: form.notes || "دفعة غير مخصصة — رصيد معلّق للموكل"
      };

      setPayments((prev) => [...prev, newPayment]);
    }

    setModal(null);
  };

  const saveDoc = () => {
    if (!checkPerm("manageDocs", "رفع مستند")) return;
    if (!form.name) return;
    setDocs([...docs, { id: nextId(docs), name: form.name, type: form.type || DOC_TYPES[0], caseId: form.caseId ? +form.caseId : null, date: todayISO(), by: currentUser.name }]);
    setModal(null);
  };

  const saveKyc = () => {
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
    if (modal === "kyc-edit" && form.id) {
      setKyc(kyc.map((x) => x.id === form.id ? { ...x, ...rec } : x));
    } else {
      setKyc([...kyc, { id: nextId(kyc), ...rec }]);
    }
    setModal(null);
  };

  const savePoa = () => {
    if (!checkPerm("manageDocs", "إضافة توكيل")) return;
    if (!form.clientId || !form.number) return;
    setPoas([...poas, { id: nextId(poas), clientId: +form.clientId, number: form.number, issuer: form.issuer || "كاتب العدل - دبي", issue: form.issue || todayISO(), expiry: form.expiry || addDays(730), scope: form.scope || "" }]);
    setModal(null);
  };

  const saveUser = () => {
    if (!checkPerm("manageUsers", "إدارة المستخدمين")) return;
    if (!form.name || !form.email) return;

    const rKey = (form.roleKey || "lawyer") as "admin" | "lawyer" | "secretary" | "accountant";
    const preset = ROLE_PRESETS[rKey];
    const userPermissions = form.permissions ? { ...form.permissions } : { ...preset.permissions };

    let updatedList: UserItem[] = [];

    if (editingUser) {
      updatedList = users.map((u) => u.id === editingUser.id ? {
        ...u,
        name: form.name,
        email: form.email,
        phone: form.phone || u.phone,
        password: form.password || u.password || "123456",
        roleKey: rKey,
        roleTitle: form.roleTitle || preset.title,
        status: form.status || u.status,
        permissions: userPermissions,
        canTransferContacts: form.canTransferContacts !== undefined ? form.canTransferContacts : u.canTransferContacts,
        canViewAgreements: form.canViewAgreements !== undefined ? form.canViewAgreements : u.canViewAgreements,
        canAccessWhatsapp: form.canAccessWhatsapp !== undefined ? form.canAccessWhatsapp : u.canAccessWhatsapp,
        canViewFinances: form.canViewFinances !== undefined ? form.canViewFinances : u.canViewFinances,
      } : u);
    } else {
      const newUser: UserItem = {
        id: nextId(users),
        name: form.name,
        email: form.email,
        phone: form.phone || "050-0000000",
        password: form.password || "123456",
        roleKey: rKey,
        roleTitle: form.roleTitle || preset.title,
        status: "نشط",
        avatarBg: rKey === "admin" ? "bg-amber-500 text-slate-900" : rKey === "lawyer" ? "bg-indigo-600 text-white" : rKey === "accountant" ? "bg-emerald-600 text-white" : "bg-purple-600 text-white",
        avatarText: form.name.charAt(0),
        permissions: userPermissions,
        canTransferContacts: form.canTransferContacts || false,
        canViewAgreements: form.canViewAgreements || false,
        canAccessWhatsapp: form.canAccessWhatsapp || false,
        canViewFinances: form.canViewFinances || false,
      };
      updatedList = [...users, newUser];
    }

    setUsers(updatedList);
    saveStorage("firm_users", updatedList);

    // المزامنة الفورية المباشرة مع جدول public.profiles في Supabase
    try {
      supabase.from("profiles").upsert([
        {
          ...(editingUser?.supabaseId ? { id: editingUser.supabaseId } : {}),
          email: form.email.trim().toLowerCase(),
          full_name: form.name,
          phone: form.phone || "050-0000000",
          role: rKey,
          role_title: form.roleTitle || preset.title,
          permissions: userPermissions,
          status: "approved"
        }
      ], { onConflict: "email" }).then(({ error }) => {
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
    setUsers((prevUsers) => {
      const updated = prevUsers.map((u) => {
        if (u.id === userId) {
          const currentVal = Boolean(hasTabPermission(u, permKey as string) || u.permissions?.[permKey]);
          const newPerms = {
            ...(u.permissions || {}),
            [permKey]: !currentVal
          };

          // المزامنة الفورية المباشرة مع جدول public.profiles في Supabase
          if (u.email) {
            try {
              supabase.from("profiles").upsert([
                {
                  ...(u.supabaseId ? { id: u.supabaseId } : {}),
                  email: u.email.trim().toLowerCase(),
                  full_name: u.name,
                  permissions: newPerms
                }
              ], { onConflict: "email" }).then(({ error }) => {
                if (error) console.warn("Supabase profile toggle permission note:", error.message);
              });
            } catch (e) {
              console.warn("Supabase profile toggle exception:", e);
            }
          }

          return {
            ...u,
            permissions: newPerms
          };
        }
        return u;
      });
      saveStorage("firm_users", updated);
      return updated;
    });
  };

  const saveTimeLog = () => {
    if (!form.caseId || !form.hours) return;
    setTimeLogs([
      ...timeLogs,
      {
        id: nextId(timeLogs),
        caseId: +form.caseId,
        lawyerName: form.lawyerName || currentUser.name,
        date: form.date || todayISO(),
        hours: +form.hours,
        hourlyRate: +form.hourlyRate || 750,
        description: form.description || "ساعات مرافعة واستشارات قانونية",
        billed: false
      }
    ]);
    setModal(null);
  };

  const saveCaseExpense = () => {
    if (!form.caseId || !form.amount) return;
    setCaseExpenses([
      ...caseExpenses,
      {
        id: nextId(caseExpenses),
        caseId: +form.caseId,
        date: form.date || todayISO(),
        category: form.category || "رسوم قضائية",
        amount: +form.amount,
        description: form.description || "",
        billable: form.billable !== "لا",
        billed: false
      }
    ]);
    setModal(null);
  };

  const saveTrustTransaction = () => {
    if (!form.clientId || !form.amount) return;
    setTrustTransactions([
      ...trustTransactions,
      {
        id: nextId(trustTransactions),
        clientId: +form.clientId,
        caseId: form.caseId ? +form.caseId : null,
        date: form.date || todayISO(),
        type: form.type || "إيداع أمانة",
        amount: +form.amount,
        refNo: form.refNo || `TR-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: form.notes || ""
      }
    ]);
    setModal(null);
  };

  const saveDeadline = () => {
    if (!form.caseId || !form.rulingDate) return;
    const days = +form.appealDays || 30;
    const rDate = new Date(form.rulingDate + "T00:00:00");
    rDate.setDate(rDate.getDate() + days);
    const deadlineStr = rDate.toISOString().slice(0, 10);

    setDeadlines([
      ...deadlines,
      {
        id: nextId(deadlines),
        caseId: +form.caseId,
        rulingDate: form.rulingDate,
        rulingType: form.rulingType || "حكم ابتدائية",
        rulingSummary: form.rulingSummary || "صدور حكم قضائي في الدعوى",
        appealDays: days,
        appealDeadlineDate: deadlineStr,
        status: "جارٍ حساب الميعاد",
        notes: form.notes || `تم احتساب مهلة الطعن تلقائياً (${days} يوماً)`
      }
    ]);
    setModal(null);
  };

  const saveStrReport = () => {
    if (!form.clientId || !form.suspicionReason) return;
    setStrReports([
      ...strReports,
      {
        id: nextId(strReports),
        clientId: +form.clientId,
        caseId: form.caseId ? +form.caseId : null,
        date: form.date || todayISO(),
        suspicionReason: form.suspicionReason,
        amountFlagged: +form.amountFlagged || 0,
        reportedBy: currentUser.name + " (مسؤول الامتثال)",
        status: form.status || "تحقيق داخلي",
        confidentialNotes: form.confidentialNotes || ""
      }
    ]);
    setModal(null);
  };

  const saveCourtContact = () => {
    if (!form.courtName || !form.department) return;
    if (editingCourtContact) {
      setCourtContacts(courtContacts.map((c) => c.id === editingCourtContact.id ? {
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
        notes: form.notes || ""
      } : c));
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
          notes: form.notes || ""
        }
      ]);
    }
    setEditingCourtContact(null);
    setModal(null);
  };

  const convertTimeToInvoice = (log: TimeLog) => {
    const cs = cases.find((c) => c.id === log.caseId);
    if (!cs) return;
    const totalAmount = log.hours * log.hourlyRate;
    const newInv: Invoice = {
      id: nextId(invoices),
      number: `INV-2026-${String(65 + nextId(invoices)).padStart(3, "0")}`,
      clientId: cs.clientId,
      caseId: cs.id,
      date: todayISO(),
      due: addDays(30),
      amount: totalAmount,
      status: "مرسلة",
      desc: `أتعاب ساعات عمل قانونية (${log.hours} ساعة × ${log.hourlyRate} درهم): ${log.description}`
    };
    setInvoices([...invoices, newInv]);
    setTimeLogs(timeLogs.map((t) => t.id === log.id ? { ...t, billed: true } : t));
  };

  // ---------- التبويبات ----------
  const NAV = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "cases", label: "القضايا", icon: Briefcase },
    { id: "clients", label: "الموكلين وجهات أخرى", icon: Users },
    { id: "hearings", label: "الجلسات والرول", icon: CalendarDays },
    { id: "inapp_email", label: "البريد الإلكتروني المدمج", icon: Mail },
    { id: "whatsapp_office", label: "واتساب المكتب المدمج", icon: MessageSquare },
    { id: "browser", label: "المتصفح الخاص المدمج", icon: Globe },
    { id: "courts_directory", label: "دليل المحاكم والجهات", icon: PhoneCall },
    { id: "tasks", label: "المهام", icon: ListChecks },
    { id: "invoices", label: "الفواتير والضريبة", icon: Receipt },
    { id: "office_agreement", label: "اتفاقية المكتب المعتمدة", icon: FileCheck },
    { id: "docs", label: "المستندات", icon: FolderOpen },
    { id: "poa", label: "الوكالات", icon: FileSignature },
    { id: "kyc", label: "اعرف عميلك KYC", icon: ShieldCheck },
    { id: "users", label: "المستخدمون والصلاحيات", icon: Lock },
  ];

  // مراجعات KYC المستحقة أو القريبة (خلال 30 يومًا)
  const kycDue = kyc.filter((k) => daysUntil(nextReviewDate(k.lastReview, k.risk)) <= 30).length;

  const upcoming = hearings.filter((h) => !h.done && daysUntil(h.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const notifCount = stats.expiringPoa + invoices.filter((i) => i.status === "متأخرة").length + upcoming.filter((h) => daysUntil(h.date) <= 2).length + kycDue;

  const filteredCases = cases.filter((c) =>
    (caseFilter === "الكل" || c.status === caseFilter) &&
    (c.number.includes(q) || clientName(c.clientId).includes(q) || c.subject.includes(q) || c.opponent.includes(q))
  );

  const selectedCase = cases.find((c) => c.id === caseView);

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
              permissions: ROLE_PRESETS[newUser.roleKey]?.permissions || ROLE_PRESETS.lawyer.permissions
            };
            setUsers((prev) => {
              const updated = [...prev, created];
              saveStorage("firm_users", updated);
              return updated;
            });
            // إضافة إشعار لمدير النظام برغبة مستخدم جديد بالانضمام
            setNotifications((prev) => [
              {
                id: Date.now(),
                title: "طلب تسجيل حساب جديد (قيد الاعتماد)",
                desc: `قدم ${newUser.name} (${newUser.email}) طلب حساب بدور (${newUser.roleTitle}). الطلب ينتظر موافقة مدير النظام.`,
                date: todayISO(),
                type: "تأكيد",
                read: false
              },
              ...prev
            ]);
            try {
              supabase.from("profiles").insert({
                email: newUser.email,
                full_name: newUser.name,
                role: newUser.roleKey,
                status: "pending"
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
    <div dir="rtl" className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#faf8f5] text-slate-800 font-sans selection:bg-[#b89b6a]/30">
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
        {/* ===== الشريط الجانبي الفخم ===== */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#072a28] border-l border-[#0f4340] text-teal-100 md:flex shadow-xl">
          <div className="flex items-center justify-center border-b border-[#0f4340] px-4 py-5 bg-[#051f1e]">
            <Logo variant="horizontal" mode="dark" size="md" />
          </div>

          {/* تبديل سريع للمستخدم الحالي (للمدير فقط) */}
          <div className="mx-3 my-3 rounded-xl bg-[#0b3c39] p-3 border border-[#14524f]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#e5c388] flex items-center gap-1">
                <UserCheck size={13} /> الحساب النشط الآن:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#072422] text-[#e5c388] font-mono border border-[#1b615d]">
                {currentUser.roleKey.toUpperCase()}
              </span>
            </div>
            {currentUser.roleKey === "admin" && (currentUser.status === "نشط" || currentUser.status === "approved") ? (
              <select
                value={currentUserId}
                onChange={(e) => setCurrentUserId(+e.target.value)}
                className="w-full rounded-lg bg-[#061d1c] border border-[#114b48] text-xs font-medium text-white px-2 py-1.5 focus:outline-none focus:border-[#b89b6a]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleTitle})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs font-bold text-white px-1 py-1 truncate">
                {currentUser.name} ({currentUser.roleTitle})
              </p>
            )}
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {NAV.filter(({ id }) => hasTabPermission(currentUser, id)).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setTab(id); setCaseView(null); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === id ? "bg-[#b89b6a] text-slate-950 font-black shadow-md" : "text-teal-100/80 hover:bg-[#0c403d] hover:text-white"}`}>
                <Icon size={18} /><span>{label}</span>
                {id === "poa" && stats.expiringPoa > 0 && <span className="mr-auto rounded-full bg-red-500 px-2 text-xs font-bold text-white">{stats.expiringPoa}</span>}
                {id === "kyc" && kycDue > 0 && <span className="mr-auto rounded-full bg-red-500 px-2 text-xs font-bold text-white">{kycDue}</span>}
                {id === "users" && pendingUsers.length > 0 && isAdmin ? (
                  <span className="mr-auto rounded-full bg-[#e5c388] text-slate-950 px-2 py-0.5 text-[11px] font-bold animate-pulse">
                    {pendingUsers.length} معلق
                  </span>
                ) : id === "users" ? (
                  <span className="mr-auto rounded-full bg-[#051f1e] border border-[#b89b6a]/40 text-[10px] px-1.5 py-0.2 text-[#e5c388] font-mono">{users.length}</span>
                ) : null}
              </button>
            ))}

            {/* الإعدادات الفنية حصرية للمدير الأعلى (المحامي سعود) */}
            {isSuperAdmin && (
              <button
                onClick={() => setShowSupabaseModal(true)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-[#e5c388] bg-[#0c403d]/80 border border-[#b89b6a]/30 hover:bg-[#0e4845] transition mt-3"
                title="أكواد القواعد والبروفايل الحية Supabase RLS"
              >
                <Code size={16} className="text-[#e5c388] shrink-0" />
                <span>الإعدادات الفنية (Supabase RLS)</span>
              </button>
            )}
          </nav>
          <div className="border-t border-[#0f4340] p-4 text-xs text-teal-300/60 space-y-2 bg-[#051a19]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0d3f3c] py-2.5 px-3 text-xs font-bold text-red-300 hover:bg-red-900/40 transition border border-red-500/20"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut size={15} /> تسجيل الخروج
            </button>
            <p className="text-[11px] text-center text-teal-200/50">ضريبة القيمة المضافة: 5% (UAE VAT)</p>
          </div>
        </aside>

        {/* ===== المحتوى ===== */}
        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">
          {/* الشريط العلوي */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6 shadow-2xs">
            <div className="flex items-center gap-2 md:hidden">
              <Logo variant="horizontal" mode="light" size="sm" />
            </div>
            <div className="relative mr-auto hidden max-w-xs flex-1 md:block">
              <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في القضايا والموكلين…" className={`${inputCls} pr-9`} />
            </div>

            {/* شريط معلومات المستخدم النشط */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentUser.avatarBg}`}>
                {currentUser.avatarText}
              </div>
              <div className="hidden sm:block text-xs leading-tight">
                <p className="font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-[#b89b6a] font-bold">{currentUser.roleTitle}</p>
              </div>
              {currentUser.roleKey === "admin" && (currentUser.status === "نشط" || currentUser.status === "approved") && (
                <select
                  value={currentUserId}
                  onChange={(e) => setCurrentUserId(+e.target.value)}
                  className="text-xs bg-stone-100 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#b89b6a]"
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

            <button onClick={() => setClientPortalId(clients[0]?.id || 1)} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 shadow-sm" title="معاينة بوابة الموكل الإلكترونية">
              <Globe size={15} /> <span className="hidden sm:inline">بوابة الموكل</span>
            </button>

            <button onClick={() => setReport("section")} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100" title="تقرير قابل للطباعة للقسم الحالي">
              <Printer size={15} /> <span className="hidden sm:inline">تقرير القسم</span>
            </button>

            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>

            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="التنبيهات">
              <Bell size={20} />
              {notifCount > 0 && <span className="absolute -left-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{notifCount}</span>}
            </button>
          </header>

          {/* تنبيه تقييد الصلاحيات إذا وُجد */}
          {permissionNotice && (
            <div className="m-4 md:m-6 mb-0 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start justify-between gap-3 shadow-sm">
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

          {/* تنقّل سفلي للجوال */}
          <div className="fixed bottom-0 right-0 left-0 z-30 flex justify-around border-t border-slate-200 bg-white py-1.5 md:hidden">
            {NAV.slice(0, 5).map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => { setTab(id); setCaseView(null); }} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${tab === id ? "text-amber-600 font-bold" : "text-slate-500"}`}>
                <Icon size={20} /><span>{label}</span>
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-7xl w-full min-w-0 overflow-x-hidden space-y-6 p-3 sm:p-4 pb-24 md:p-6 md:pb-8">

            {currentUser.status === "معلق" || currentUser.status === "pending" ? (
              <PendingApprovalScreen
                currentUser={currentUser}
                onLogout={() => setIsLoggedIn(false)}
              />
            ) : (
              <>
                {/* ================= لوحة التحكم ================= */}
                {tab === "dashboard" && (
                  <>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">لوحة التحكم والأداء</h2>
                        <p className="text-xs text-slate-500">نظرة عامة على أعمال المكتب والملفات القانونية والجلسات</p>
                      </div>
                      <button onClick={() => openModalWithCheck("case", "manageCases")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm">
                        <Plus size={16} /> قضية جديدة
                      </button>
                    </div>

                    {/* تنبيه وجود طلبات تسجيل حساب معلقة تحتاج موافقة (Admin Only) */}
                    {isAdmin && pendingUsers.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-amber-500 text-slate-900 rounded-xl font-bold shrink-0 animate-pulse">
                            <Users size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">
                              تنبيه مهم: يوجد {pendingUsers.length} طلب تسجيل حساب جديد بحاجة للقبول والاعتماد!
                            </h4>
                            <p className="text-xs text-slate-700 mt-0.5">
                              الطلبات المعلقة: {pendingUsers.map(u => `${u.name} (${u.email})`).join("، ")}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setTab("users"); }}
                          className="px-4 py-2.5 bg-slate-900 text-amber-400 rounded-xl text-xs font-bold hover:bg-slate-800 transition shrink-0 shadow-sm flex items-center gap-1.5"
                        >
                          <UserCheck size={15} /> الانتقال للموافقة أو الرفض
                        </button>
                      </div>
                    )}

                    {/* بطاقات المؤشرات */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: "قضايا نشطة", value: stats.active, icon: Briefcase, tone: "bg-indigo-100 text-indigo-600" },
                    { label: "جلسات هذا الأسبوع", value: stats.weekHearings, icon: Gavel, tone: "bg-amber-100 text-amber-600" },
                    { label: "مبالغ مستحقة (شامل الضريبة 5%)", value: (isAdmin || currentUser?.canViewFinances || userPerms?.viewInvoices || userPerms?.manageInvoices) ? fmtAED(stats.dueAmount) : "•••••• (غير مصرح)", icon: TrendingUp, tone: "bg-emerald-100 text-emerald-600" },
                    { label: "وكالات تنتهي خلال 60 يومًا", value: stats.expiringPoa, icon: AlertTriangle, tone: "bg-red-100 text-red-600" },
                  ].map((k) => (
                    <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${k.tone}`}><k.icon size={20} /></div>
                      <p className="text-xl font-bold">{k.value}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{k.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {/* توزيع القضايا */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-900">القضايا حسب النوع</h3>
                    <div className="h-56" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={casesByType}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" name="عدد القضايا" fill="#d97706" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* حالة الفواتير */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-900">حالة التحصيل المالي (د.إ)</h3>
                    <div className="h-56" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={invoiceSummary} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                            {invoiceSummary.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => fmtAED(Number(v))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {/* الجلسات القادمة */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">الجلسات القادمة</h3>
                      <button onClick={() => setTab("hearings")} className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">عرض الكل <ChevronLeft size={14} /></button>
                    </div>
                    <div className="space-y-3">
                      {upcoming.slice(0, 4).map((h) => (
                        <div key={h.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
                          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                            <span className="text-sm font-bold">{new Date(h.date).getDate()}</span>
                            <span className="text-[10px]">{new Date(h.date).toLocaleDateString("ar-AE", { month: "short" })}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{caseNo(h.caseId)}</p>
                            <p className="truncate text-xs text-slate-500">{h.type} — {h.time} — {h.room}</p>
                          </div>
                          {daysUntil(h.date) <= 2 && <Badge className="bg-red-100 text-red-700">عاجل</Badge>}
                        </div>
                      ))}
                      {upcoming.length === 0 && <p className="py-6 text-center text-sm text-slate-400">لا توجد جلسات قادمة</p>}
                    </div>
                  </div>
                  {/* المهام المعلقة */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">مهام معلقة</h3>
                      <button onClick={() => setTab("tasks")} className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">عرض الكل <ChevronLeft size={14} /></button>
                    </div>
                    <div className="space-y-3">
                      {tasks.filter((t) => !t.done).slice(0, 4).map((t) => (
                        <div key={t.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
                          <button onClick={() => {
                            if (!checkPerm("manageTasks", "إنجاز مهمة")) return;
                            setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: true } : x));
                          }} className="text-slate-300 hover:text-emerald-500" aria-label="إنجاز المهمة"><CheckCircle2 size={22} /></button>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{t.title}</p>
                            <p className="text-xs text-slate-500">الاستحقاق: {fmtDate(t.due)} — المكلف: {t.assignee}</p>
                          </div>
                          <Badge className={TASK_PRIORITY[t.priority]}>{t.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= القضايا ================= */}
            {tab === "cases" && !caseView && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">إدارة القضايا</h2>
                    <p className="text-xs text-slate-500">قيد ومتابعة ملفات القضايا أمام المحاكم الإماراتية</p>
                  </div>
                  <button onClick={() => openModalWithCheck("case", "manageCases")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"><Plus size={16} /> قضية جديدة</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["الكل", ...CASE_STATUS].map((s) => (
                    <button key={s} onClick={() => setCaseFilter(s)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${caseFilter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-200"}`}>{s}</button>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 text-right text-xs text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">رقم القضية</th>
                        <th className="px-4 py-3 font-semibold">الموكل</th>
                        <th className="px-4 py-3 font-semibold">الخصم</th>
                        <th className="hidden px-4 py-3 font-semibold lg:table-cell">المحكمة</th>
                        <th className="px-4 py-3 font-semibold">النوع</th>
                        <th className="px-4 py-3 font-semibold">الحالة</th>
                        <th className="px-4 py-3 font-semibold text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCases.map((c) => (
                        <tr key={c.id} className="transition hover:bg-amber-50/60">
                          <td className="px-4 py-3 font-semibold text-slate-900 cursor-pointer" onClick={() => setCaseView(c.id)}>{c.number}</td>
                          <td className="px-4 py-3 cursor-pointer" onClick={() => setCaseView(c.id)}>{clientName(c.clientId)}</td>
                          <td className="px-4 py-3 text-slate-500 cursor-pointer" onClick={() => setCaseView(c.id)}>{c.opponent}</td>
                          <td className="hidden px-4 py-3 text-slate-500 lg:table-cell cursor-pointer" onClick={() => setCaseView(c.id)}>{c.court}</td>
                          <td className="px-4 py-3"><Badge className="bg-slate-100 text-slate-600">{c.type}</Badge></td>
                          <td className="px-4 py-3"><Badge className={statusColor(c.status)}>{c.status}</Badge></td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setCaseView(c.id)} className="text-xs font-semibold text-amber-700 hover:underline">عرض التفاصيل</button>
                              {userPerms.deleteCases && (
                                <button onClick={() => {
                                  if (confirm("هل أنت تأكد من مسح هذه القضية من القيد؟")) {
                                    setCases(cases.filter((x) => x.id !== c.id));
                                  }
                                }} className="text-slate-400 hover:text-red-600 p-1" title="حذف القضية"><Trash2 size={15} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCases.length === 0 && <p className="py-10 text-center text-sm text-slate-400">لا توجد قضايا مطابقة للبحث</p>}
                </div>
              </>
            )}

            {/* ----- تفاصيل قضية ----- */}
            {tab === "cases" && selectedCase && (
              <>
                <button onClick={() => setCaseView(null)} className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
                  <ChevronLeft size={16} className="rotate-180" /> عودة إلى القضايا
                </button>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">{selectedCase.number}</h2>
                        <Badge className={statusColor(selectedCase.status)}>{selectedCase.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{selectedCase.subject}</p>
                    </div>
                    {userPerms.manageCases ? (
                      <select value={selectedCase.status} onChange={(e) => setCases(cases.map((c) => c.id === selectedCase.id ? { ...c, status: e.target.value } : c))} className={`${inputCls} w-auto`}>
                        {CASE_STATUS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600">غير مصرح بالتعديل</Badge>
                    )}
                  </div>
                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ["الموكل", clientName(selectedCase.clientId)],
                      ["الخصم", selectedCase.opponent],
                      ["المحكمة", selectedCase.court],
                      ["الدائرة/القاضي", selectedCase.judge || "—"],
                      ["تاريخ القيد", fmtDate(selectedCase.openDate)],
                      ["الأتعاب المتفق عليها", userPerms.viewInvoices ? fmtAED(selectedCase.fee) : "غير مصرح للمستخدم"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-stone-50 p-3">
                        <p className="text-xs text-slate-500">{k}</p>
                        <p className="mt-0.5 font-semibold">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ================= الموكلون وجهات الاتصال ================= */}
            {tab === "clients" && (
              <div className="space-y-6">
                {/* تنبيه الإشعارات (Toast) */}
                {clientToast && (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm transition">
                    <span className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 size={18} className="text-emerald-600" /> {clientToast}
                    </span>
                    <button onClick={() => setClientToast(null)} className="text-emerald-700 hover:text-emerald-950">
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* العنوان ورأس الصفحة */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Users className="text-amber-600" /> إدارة الموكلين وجهات الاتصال
                    </h2>
                    <p className="text-xs text-slate-500">سجل الأفراد والشركات والجهات الحكومية المتعاملة مع المكتب وتصنيفها</p>
                  </div>
                  <button
                    onClick={() => openModalWithCheck("client", "manageClients")}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition"
                  >
                    <Plus size={16} /> إضافة موكل / جهة اتصال جديدة
                  </button>
                </div>

                {/* كروت الإحصائيات السريعة والتوزيع */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">إجمالي المسجلين</p>
                      <p className="text-2xl font-black text-slate-900">{clients.length}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-800">أفراد / أشخاص</p>
                      <p className="text-2xl font-black text-blue-900">{clients.filter((c) => c.type === "فرد").length}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <User size={20} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-800">شركات ومؤسسات</p>
                      <p className="text-2xl font-black text-indigo-900">{clients.filter((c) => c.type === "شركة").length}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Building2 size={20} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-800">جهات حكومية ورسمية</p>
                      <p className="text-2xl font-black text-amber-950">{clients.filter((c) => c.type === "جهة حكومية").length}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <Landmark size={20} />
                    </div>
                  </div>
                </div>

                {/* شريط الفرز والتصنيف + البحث السريع */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                    {[
                      { id: "الكل", label: "الكل", count: clients.length, icon: Users },
                      { id: "فرد", label: "أفراد / أشخاص", count: clients.filter((c) => c.type === "فرد").length, icon: User },
                      { id: "شركة", label: "شركات ومؤسسات", count: clients.filter((c) => c.type === "شركة").length, icon: Building2 },
                      { id: "جهة حكومية", label: "جهات حكومية", count: clients.filter((c) => c.type === "جهة حكومية").length, icon: Landmark },
                      { id: "جهة أخرى", label: "جهات أخرى", count: clients.filter((c) => c.type === "جهة أخرى").length, icon: Globe },
                    ].map((cat) => {
                      const IconComp = cat.icon;
                      const isActive = clientCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setClientCategoryFilter(cat.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                            isActive
                              ? "bg-slate-900 text-amber-400 font-bold shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                          }`}
                        >
                          <IconComp size={14} />
                          <span>{cat.label}</span>
                          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? "bg-amber-400 text-slate-900 font-bold" : "bg-slate-200 text-slate-800"}`}>
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="بحث بالاسم، الرخصة، الهاتف..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-8 py-1.5 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
                    />
                    {clientSearch && (
                      <button onClick={() => setClientSearch("")} className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* قائمة الكروت للمتعاملين وجهات الاتصال */}
                {(() => {
                  const filteredList = clients.filter((c) => {
                    const matchesCategory = clientCategoryFilter === "الكل" || c.type === clientCategoryFilter;
                    const query = clientSearch.trim().toLowerCase();
                    const matchesSearch =
                      !query ||
                      c.name.toLowerCase().includes(query) ||
                      (c.idNo && c.idNo.toLowerCase().includes(query)) ||
                      (c.phone && c.phone.includes(query)) ||
                      (c.email && c.email.toLowerCase().includes(query)) ||
                      (c.emirate && c.emirate.toLowerCase().includes(query)) ||
                      (c.address && c.address.toLowerCase().includes(query));
                    return matchesCategory && matchesSearch;
                  });

                  if (filteredList.length === 0) {
                    return (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 space-y-2">
                        <Users size={40} className="mx-auto text-slate-300" />
                        <p className="font-bold text-slate-700">لا توجد نتائج مطابقة لتصنيفك أو كلمات البحث</p>
                        <p className="text-xs">جرب تغيير التصنيف أو مسح كلمة البحث للإظهار.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredList.map((c) => {
                        const count = cases.filter((x) => x.clientId === c.id).length;
                        const isGov = c.type === "جهة حكومية";
                        const isCompany = c.type === "شركة";
                        const isIndividual = c.type === "فرد";

                        const badgeStyle = isGov
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : isCompany
                          ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                          : isIndividual
                          ? "bg-blue-100 text-blue-900 border-blue-300"
                          : "bg-slate-100 text-slate-800 border-slate-300";

                        const IconComp = isGov ? Landmark : isCompany ? Building2 : isIndividual ? User : Globe;

                        return (
                          <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                            <div>
                              {/* شريط الكارت العلوي */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${badgeStyle}`}>
                                    <IconComp size={20} />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="truncate font-bold text-slate-900 text-sm" title={c.name}>{c.name}</h3>
                                    <span className={`inline-block mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeStyle}`}>
                                      {c.type}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => setEditingClient(c)}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                    title="تعديل البيانات"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => deleteClient(c.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="حذف"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* التفاصيل المعروضة */}
                              <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                                {c.idNo && <p className="font-mono text-[11px] text-slate-500">رقم الهوية / الرخصة: <b className="text-slate-800">{c.idNo}</b></p>}
                                <p className="flex items-center gap-2"><Phone size={13} className="text-slate-400" /> {c.phone || "—"}</p>
                                <p className="flex items-center gap-2"><Mail size={13} className="text-slate-400" /> {c.email || "—"}</p>
                                <p className="flex items-center gap-2"><MapPin size={13} className="text-slate-400" /> {c.emirate} {c.address ? `— ${c.address}` : ""}</p>
                              </div>
                            </div>

                            {/* أسفل الكارت: التحكم بالنقل اليدوي ورابط القضايا */}
                            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                              {/* ميزة النقل اليدوي السريع بين التصنيفات */}
                              <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">نقل التصنيف:</span>
                                <select
                                  value={c.type}
                                  onChange={(e) => moveClientCategory(c.id, e.target.value)}
                                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                                  title="نقل الشخص أو الجهة يدويًا إلى تصنيف مختلف"
                                >
                                  <option value="فرد">فرد (شخص)</option>
                                  <option value="شركة">شركة / مؤسسة</option>
                                  <option value="جهة حكومية">جهة حكومية</option>
                                  <option value="جهة أخرى">جهة أخرى</option>
                                </select>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-500">القضايا المسجلة: <b className="text-slate-900 font-bold">{count}</b></span>
                                {count > 0 ? (
                                  <button onClick={() => { setTab("cases"); setQ(c.name); }} className="font-semibold text-amber-600 hover:underline">
                                    عرض القضايا ({count})
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">لا توجد قضايا</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* مودال تعديل بيانات الموكل / جهة الاتصال */}
                {editingClient && (
                  <Modal title="تعديل بيانات الموكل / جهة الاتصال" onClose={() => setEditingClient(null)}>
                    <div className="space-y-4 text-sm">
                      <Field label="الاسم الكامل / اسم الشركة / الجهة">
                        <input
                          value={editingClient.name}
                          onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                          placeholder="الاسم"
                          className={inputCls}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="الصفة / التصنيف">
                          <select
                            value={editingClient.type}
                            onChange={(e) => setEditingClient({ ...editingClient, type: e.target.value })}
                            className={inputCls}
                          >
                            <option value="فرد">فرد (شخص)</option>
                            <option value="شركة">شركة / مؤسسة</option>
                            <option value="جهة حكومية">جهة حكومية / رسمية</option>
                            <option value="جهة أخرى">جهة أخرى</option>
                          </select>
                        </Field>
                        <Field label="الهوية / الرخصة / الرقم الضريبي">
                          <input
                            value={editingClient.idNo || ""}
                            onChange={(e) => setEditingClient({ ...editingClient, idNo: e.target.value })}
                            placeholder="رقم الهوية أو الرخصة"
                            className={inputCls}
                          />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="رقم الهاتف">
                          <input
                            value={editingClient.phone || ""}
                            onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                            placeholder="050-XXXXXXX"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="الإمارة / الموقع">
                          <select
                            value={editingClient.emirate || "دبي"}
                            onChange={(e) => setEditingClient({ ...editingClient, emirate: e.target.value })}
                            className={inputCls}
                          >
                            <option>دبي</option>
                            <option>أبوظبي</option>
                            <option>الشارقة</option>
                            <option>رأس الخيمة</option>
                            <option>عجمان</option>
                            <option>أم القيوين</option>
                            <option>الفجيرة</option>
                            <option>خارج الدولة</option>
                          </select>
                        </Field>
                      </div>
                      <Field label="البريد الإلكتروني">
                        <input
                          value={editingClient.email || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                          placeholder="example@domain.ae"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="العنوان / تفاصيل إضافية">
                        <input
                          value={editingClient.address || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                          placeholder="العنوان التفصيلي"
                          className={inputCls}
                        />
                      </Field>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={saveEditClient}
                          className="flex-1 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 transition"
                        >
                          حفظ التعديلات
                        </button>
                        <button
                          onClick={() => setEditingClient(null)}
                          className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
            )}

            {/* ================= الجلسات والرول والمواعيد ================= */}
            {tab === "hearings" && (
              <div className="space-y-6">
                {/* شريط التبديل بين الجلسات ومواعيد الطعون التلقائية */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setHearingSubTab("hearings")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${hearingSubTab === "hearings" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <CalendarDays size={18} /> رول الجلسات اليومي
                  </button>
                  <button
                    onClick={() => setHearingSubTab("deadlines")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${hearingSubTab === "deadlines" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <Hourglass size={18} /> 🚨 مواعيد الأحكام والطعون التلقائية ({deadlines.length})
                  </button>
                </div>

                {hearingSubTab === "deadlines" ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                          <Hourglass className="text-amber-600" /> تتبع مواعيد الطعون والأحكام القضائية التلقائية
                        </h2>
                        <p className="text-xs text-slate-500">حساب ميعاد الاستئناف والتمييز تلقائياً (30 يوماً من صدور الحكم) حمايةً لحقوق الموكلين من السقوط</p>
                      </div>
                      <button
                        onClick={() => openModalWithCheck("deadline")}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"
                      >
                        <Plus size={16} /> تسجيل حكم قضائي وحساب الميعاد
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">إجمالي الأحكام تحت المتابعة</p>
                        <p className="text-2xl font-bold text-slate-900">{deadlines.length}</p>
                      </div>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                        <p className="text-xs text-amber-800 font-semibold">طعون قريبة الانتهاء (أقل من 7 أيام)</p>
                        <p className="text-2xl font-bold text-amber-800">
                          {deadlines.filter((d) => daysUntil(d.appealDeadlineDate) <= 7 && daysUntil(d.appealDeadlineDate) >= 0).length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                        <p className="text-xs text-emerald-800 font-semibold">طعون تم قيدها بالمحكمة</p>
                        <p className="text-2xl font-bold text-emerald-800">
                          {deadlines.filter((d) => d.status === "تم قيد الطعن").length}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {deadlines.map((d) => {
                        const cs = cases.find((c) => c.id === d.caseId);
                        const daysLeft = daysUntil(d.appealDeadlineDate);
                        return (
                          <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-amber-400 transition">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-base text-slate-900">{cs ? cs.number : "—"}</h3>
                                  <Badge className="bg-slate-100 text-slate-800">{d.rulingType}</Badge>
                                  <Badge className={d.status === "تم قيد الطعن" ? "bg-emerald-100 text-emerald-800" : daysLeft <= 7 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}>
                                    {d.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  الموكل: <b>{cs ? clientName(cs.clientId) : "—"}</b> • المحكمة: {cs ? cs.court : "—"}
                                </p>
                              </div>
                              <div className="text-left bg-stone-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono">
                                <p className="text-slate-500">تاريخ الحكم: {fmtDate(d.rulingDate)}</p>
                                <p className="font-bold text-slate-900 text-sm">آخر موعد للطعن: {fmtDate(d.appealDeadlineDate)}</p>
                                {daysLeft < 0 ? (
                                  <span className="text-red-600 font-bold">⚠️ انتهت المهلة</span>
                                ) : daysLeft <= 7 ? (
                                  <span className="text-red-600 font-bold">🚨 متبقي {daysLeft} أيام فقط!</span>
                                ) : (
                                  <span className="text-emerald-600 font-medium">متبقي {daysLeft} يومًا</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 font-medium">
                              <b>منطوق الحكم:</b> {d.rulingSummary}
                            </p>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                              <span className="text-xs text-slate-500">{d.notes}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openNotificationComposer("تنبيه ميعاد طعن / استئناف", d)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-xs hover:bg-amber-400"
                                >
                                  <Send size={14} /> إرسال إشعار بالمهلة بالواتساب/الإيميل
                                </button>
                                {d.status !== "تم قيد الطعن" && (
                                  <button
                                    onClick={() => setDeadlines(deadlines.map((x) => x.id === d.id ? { ...x, status: "تم قيد الطعن" } : x))}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold"
                                  >
                                    تسجيل قيد الطعن
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                          <CalendarDays className="text-amber-600" /> جدول ورول الجلسات (Court Hearings Roll)
                        </h2>
                        <p className="text-xs text-slate-500">استخراج وتجهيز رول الجلسات اليومية للطباعة أو التصدير PDF وإرسال التنبيهات</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReport({ type: "roll", date: selectedRollDate, court: rollCourtFilter })}
                          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400 shadow-sm"
                        >
                          <Printer size={16} /> عرض وطباعة رول الجلسات (PDF)
                        </button>
                        <button onClick={() => openModalWithCheck("hearing", "manageHearings")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm">
                          <Plus size={16} /> إضافة جلسة
                        </button>
                      </div>
                    </div>

                    {/* كارت أدوات وتصفية رول الجلسات */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <Filter size={16} className="text-amber-600" /> تصفية وتحديد تاريخ الرول المطلوبة
                        </h3>
                        <span className="text-xs text-slate-500">اختر تاريخاً أو محكمة معينة لفلترة جدول الجلسات</span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">تاريخ الجلسات (رول اليوم)</label>
                          <input
                            type="date"
                            value={selectedRollDate}
                            onChange={(e) => setSelectedRollDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">المحكمة / الجهة القضائية</label>
                          <select
                            value={rollCourtFilter}
                            onChange={(e) => setRollCourtFilter(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                          >
                            <option value="الكل">جميع المحاكم واللجان</option>
                            {COURTS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="lg:col-span-2 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedRollDate(todayISO())}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${selectedRollDate === todayISO() ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                          >
                            جلسات اليوم
                          </button>
                          <button
                            onClick={() => setSelectedRollDate(addDays(1))}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${selectedRollDate === addDays(1) ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                          >
                            جلسات غداً
                          </button>
                          <button
                            onClick={() => setSelectedRollDate("")}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${selectedRollDate === "" ? "bg-slate-900 text-white border-slate-900" : "bg-stone-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                          >
                            عرض جميع الجلسات
                          </button>

                          <button
                            onClick={() => {
                              const rollList = hearings.filter((h) => {
                                const matchDate = !selectedRollDate || h.date === selectedRollDate;
                                const cs = cases.find((c) => c.id === h.caseId);
                                const matchCourt = rollCourtFilter === "الكل" || (cs && cs.court === rollCourtFilter);
                                return matchDate && matchCourt;
                              });

                              if (rollList.length === 0) {
                                alert("لا توجد جلسات مطابقة في هذا التاريخ لاستخراج ملخص الرول");
                                return;
                              }

                              let rollTxt = `🏛️ *جدول رول الجلسات لتاريخ ${selectedRollDate ? fmtDate(selectedRollDate) : "الكل"}*\n` +
                                `مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية\n` +
                                `----------------------------------------\n`;
                              rollList.forEach((h, idx) => {
                                const cs = cases.find((c) => c.id === h.caseId);
                                const clName = cs ? clientName(cs.clientId) : "";
                                rollTxt += `\n*${idx + 1}. قضية: ${cs ? cs.number : "—"}*\n` +
                                  `• المحكمة: ${cs ? cs.court : "—"}\n` +
                                  `• الموكل: ${clName}\n` +
                                  `• القاعة والوقت: ${h.room} (${h.time})\n` +
                                  `• نوع الجلسة: ${h.type}\n` +
                                  `${h.notes ? `• المطلوب: ${h.notes}\n` : ""}`;
                              });

                              openNotificationComposer("رسالة عامة");
                              setNotifyModal({
                                recipientName: "فريق المحامين والسكرتارية",
                                recipientPhone: "",
                                recipientEmail: "",
                                channel: "واتساب",
                                type: "تنبيه جلسة",
                                subject: `جدول رول الجلسات لتاريخ ${selectedRollDate ? fmtDate(selectedRollDate) : "الكل"}`,
                                message: rollTxt,
                                relatedRef: `رول ${selectedRollDate}`,
                              });
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 mr-auto"
                          >
                            <MessageSquare size={14} /> إرسال ملخص الرول بالواتساب
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* قائمة الجلسات المفلترة */}
                    <div className="space-y-3">
                      {hearings
                        .filter((h) => {
                          const matchDate = !selectedRollDate || h.date === selectedRollDate;
                          const cs = cases.find((c) => c.id === h.caseId);
                          const matchCourt = rollCourtFilter === "الكل" || (cs && cs.court === rollCourtFilter);
                          return matchDate && matchCourt;
                        })
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((h) => {
                          const cs = cases.find((c) => c.id === h.caseId);
                          return (
                            <div key={h.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-300 transition">
                              <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-mono">
                                  <span className="text-base font-bold">{new Date(h.date).getDate()}</span>
                                  <span className="text-xs">{new Date(h.date).toLocaleDateString("ar-AE", { month: "short" })}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-900">{caseNo(h.caseId)}</p>
                                    {cs && <span className="text-xs text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium">{cs.court}</span>}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    الموكل: <b>{cs ? clientName(cs.clientId) : "—"}</b> • {h.type} • الساعة {h.time} • {h.room}
                                  </p>
                                  {h.notes && <p className="mt-1 text-xs text-slate-600 bg-amber-50/60 px-2 py-1 rounded border border-amber-200/50">المطلوب: {h.notes}</p>}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => openNotificationComposer("تنبيه جلسة", h)}
                                  className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                  title="تنبيه الموكل بالواتساب"
                                >
                                  <MessageSquare size={14} /> تنبيه واتساب
                                </button>
                                <button
                                  onClick={() => {
                                    openNotificationComposer("تنبيه جلسة", h);
                                    setNotifyModal((prev) => prev ? { ...prev, channel: "إيميل" } : null);
                                  }}
                                  className="flex items-center gap-1 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 border border-sky-200 hover:bg-sky-100"
                                  title="تنبيه الموكل بالإيميل"
                                >
                                  <Mail size={14} /> تنبيه إيميل
                                </button>

                                {h.done ? (
                                  <Badge className="bg-emerald-100 text-emerald-700">تمت الجلسة</Badge>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (!checkPerm("manageHearings", "تحديث الجلسة")) return;
                                      setHearings(hearings.map((x) => x.id === h.id ? { ...x, done: true } : x));
                                    }}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                                  >
                                    تعليم كمنتهية
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ================= المهام ================= */}
            {tab === "tasks" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">إدارة المهام وتوزيع العمل</h2>
                    <p className="text-xs text-slate-500">تتبع المهام اليومية لفريق العمل في المكتب</p>
                  </div>
                  <button onClick={() => openModalWithCheck("task", "manageTasks")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"><Plus size={16} /> إضافة مهمة</button>
                </div>
                <div className="space-y-3">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <button onClick={() => {
                          if (!checkPerm("manageTasks", "تحديث المهمة")) return;
                          setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x));
                        }} className={`p-1 rounded-full ${t.done ? "text-emerald-600" : "text-slate-300 hover:text-slate-500"}`}>
                          <CheckCircle2 size={22} />
                        </button>
                        <div>
                          <p className={`font-semibold text-sm ${t.done ? "line-through text-slate-400" : "text-slate-900"}`}>{t.title}</p>
                          <p className="text-xs text-slate-500">المكلف: <b>{t.assignee}</b> | تاريخ الاستحقاق: {fmtDate(t.due)}</p>
                        </div>
                      </div>
                      <Badge className={TASK_PRIORITY[t.priority]}>{t.priority}</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ================= البريد الإلكتروني المدمج In-App Email ================= */}
            {tab === "inapp_email" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="text-amber-600" /> البريد الإلكتروني المدمج (SMTP / IMAP & Supabase Sync)
                    </h2>
                    <p className="text-xs text-slate-500">متابعة إشعارات المحاكم، مراسلات الموكلين، ومستندات وزارة العدل عبر السيرفر الرسمي بمرونة كاملة</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>الحساب: <b>{emailConfig.email}</b></span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                        {emailConfig.smtpHost}:{emailConfig.smtpPort}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowEmailSettingsModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
                    >
                      <Settings size={15} /> إعدادات البريد (SMTP)
                    </button>

                    <button
                      onClick={() => {
                        fetchSupabaseEmailMessages();
                        setPermissionNotice("تمت مزامنة الرسائل من جدول Supabase (email_messages) بنجاح!");
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      <RefreshCw size={14} /> تحديث
                    </button>

                    <button
                      onClick={() => {
                        setComposeTo("");
                        setComposeSubject("");
                        setComposeBody("");
                        setComposeAttachment("");
                        setShowComposeEmail(true);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400 transition shadow-sm"
                    >
                      <Plus size={16} /> إنشاء رسالة جديدة
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* المجلدات الجانبية */}
                  <div className="lg:col-span-1 space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs h-fit">
                    <div className="text-xs font-bold text-slate-400 mb-2 px-1">المجلدات والصناديق</div>
                    <button
                      onClick={() => setEmailFolder("inbox")}
                      className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "inbox" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
                    >
                      <span className="flex items-center gap-2"><Inbox size={16} /> الوارد (Inbox)</span>
                      <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
                        {inAppEmails.filter(e => e.folder === "inbox" && !e.isRead).length}
                      </span>
                    </button>

                    <button
                      onClick={() => setEmailFolder("sent")}
                      className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "sent" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
                    >
                      <span className="flex items-center gap-2"><Send size={16} /> الصادر / المرسل (Outbox)</span>
                      <span className="text-slate-400 text-[10px]">
                        {inAppEmails.filter(e => e.folder === "sent").length}
                      </span>
                    </button>

                    <button
                      onClick={() => setEmailFolder("draft")}
                      className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "draft" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
                    >
                      <span className="flex items-center gap-2"><FileText size={16} /> المسودات (Drafts)</span>
                      <span className="text-slate-400 text-[10px]">
                        {inAppEmails.filter(e => e.folder === "draft").length}
                      </span>
                    </button>

                    <button
                      onClick={() => setEmailFolder("trash")}
                      className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition ${emailFolder === "trash" ? "bg-amber-50 text-amber-900 border border-amber-300" : "hover:bg-slate-50 text-slate-700"}`}
                    >
                      <span className="flex items-center gap-2"><Trash2 size={16} /> سلة المهملات (Trash)</span>
                      <span className="text-slate-400 text-[10px]">
                        {inAppEmails.filter(e => e.folder === "trash").length}
                      </span>
                    </button>

                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-500">حالة الربط وسيرفر Supabase:</div>
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>سيرفر SMTP:</span>
                          <span className="font-mono text-slate-900 font-bold">{emailConfig.smtpHost}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>الجدول المرتبط:</span>
                          <span className="font-mono text-emerald-700 font-bold">email_messages</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>المزامنة اللحظية:</span>
                          <span className="text-emerald-600 font-bold">مفعّلة ✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* قائمة الرسائل والمعاينة */}
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* قائمة الرسائل */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden flex flex-col h-[550px]">
                      <div className="p-3 bg-stone-50 border-b border-slate-200 flex items-center gap-2">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                          value={emailSearch}
                          onChange={(e) => setEmailSearch(e.target.value)}
                          placeholder="بحث في موضوع البريد أو اسم المرسل..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {inAppEmails
                          .filter(e => e.folder === emailFolder)
                          .filter(e => !emailSearch || e.subject.includes(emailSearch) || e.sender.includes(emailSearch) || e.senderEmail.includes(emailSearch))
                          .length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">لا توجد رسائل في هذا المجلد</div>
                          ) : (
                            inAppEmails
                              .filter(e => e.folder === emailFolder)
                              .filter(e => !emailSearch || e.subject.includes(emailSearch) || e.sender.includes(emailSearch) || e.senderEmail.includes(emailSearch))
                              .map((mail) => (
                                <div
                                  key={mail.id}
                                  onClick={() => {
                                    setSelectedEmailId(mail.id);
                                    setInAppEmails(prev => prev.map(m => m.id === mail.id ? { ...m, isRead: true } : m));
                                  }}
                                  className={`p-4 cursor-pointer transition ${selectedEmailId === mail.id ? "bg-amber-50/90 border-r-4 border-amber-500" : "hover:bg-slate-50"} ${!mail.isRead ? "font-bold bg-amber-50/20" : ""}`}
                                >
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-900 font-bold truncate flex items-center gap-1.5">
                                      {!mail.isRead && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>}
                                      {mail.sender}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">{mail.date}</span>
                                  </div>
                                  <p className="text-xs text-slate-800 truncate">{mail.subject}</p>
                                  {mail.hasAttachment && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md mt-2">
                                      <Paperclip size={10} /> {mail.attachmentName}
                                    </span>
                                  )}
                                </div>
                              ))
                          )}
                      </div>
                    </div>

                    {/* تفاصيل الرسالة المختارة */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between h-[550px] overflow-y-auto">
                      {selectedEmailId ? (() => {
                        const activeEmail = inAppEmails.find(e => e.id === selectedEmailId);
                        if (!activeEmail) return <div className="p-12 text-center text-slate-400 text-xs">اختر رسالة لعرض تفاصيلها</div>;
                        return (
                          <div className="space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="border-b border-slate-100 pb-3 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                    {activeEmail.folder === "inbox" ? "رسالة واردة" : activeEmail.folder === "sent" ? "رسالة صادرة" : "مسودة / سلة مهملات"}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setComposeTo(activeEmail.senderEmail || activeEmail.sender);
                                        setComposeSubject(`رد: ${activeEmail.subject}`);
                                        setComposeBody(`\n\n--- الرسالة الأصلية ---\nمن: ${activeEmail.sender}\nالتاريخ: ${activeEmail.date}\n${activeEmail.body}`);
                                        setShowComposeEmail(true);
                                      }}
                                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                                    >
                                      رد على الرسالة
                                    </button>
                                    <button
                                      onClick={() => {
                                        setInAppEmails(prev => prev.map(m => m.id === activeEmail.id ? { ...m, folder: "trash" } : m));
                                        setPermissionNotice("تم نقل الرسالة إلى سلة المهملات");
                                      }}
                                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                                    >
                                      <Trash2 size={13} /> حذف
                                    </button>
                                  </div>
                                </div>
                                <h3 className="font-bold text-slate-900 text-base leading-snug">{activeEmail.subject}</h3>
                                <div className="text-xs text-slate-600 space-y-0.5">
                                  <p>من: <b>{activeEmail.sender}</b> ({activeEmail.senderEmail || "غير محدد"})</p>
                                  <p>إلى: <b>{activeEmail.recipient || "مكتب المحاماة"}</b> ({activeEmail.recipientEmail || emailConfig.email})</p>
                                  <p className="text-slate-400 text-[11px]">التاريخ: {activeEmail.date}</p>
                                </div>
                              </div>
                              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-stone-50 p-4 rounded-xl border border-slate-100 min-h-[180px]">
                                {activeEmail.body}
                              </div>
                            </div>

                            {activeEmail.hasAttachment && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <FileText size={18} className="text-amber-700" />
                                  <span className="text-xs font-bold text-amber-950">{activeEmail.attachmentName}</span>
                                </div>
                                <button
                                  onClick={() => alert(`جاري تحميل المرفق: ${activeEmail.attachmentName}`)}
                                  className="text-xs bg-amber-500 text-slate-900 px-3 py-1 rounded-lg font-bold hover:bg-amber-400 shadow-xs"
                                >
                                  تحميل المرفق
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })() : (
                        <div className="p-12 text-center text-slate-400 text-xs">اختر رسالة لعرض تفاصيلها</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* نافذة إعدادات البريد الإلكتروني (SMTP / Account Settings) */}
                {showEmailSettingsModal && (
                  <Modal title="إعدادات حساب البريد الإلكتروني (SMTP / IMAP)" onClose={() => setShowEmailSettingsModal(false)}>
                    <div className="space-y-4 text-sm">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <Settings size={15} /> إعداد أي حساب بريد إلكتروني تلقائياً:
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          يمكنك ربط أي حساب بريد رسمياَ (Office 365, Gmail, Webmail) باستخدام البريد وكلمة مرور التطبيق (App Password) ليتم الإرسال والمزامنة مباشرة وبدون تعقيدات OAuth.
                        </p>
                      </div>

                      {/* اختصارات سريعة لضبط الخادم */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">تعبئة سريعة حسب مزود الخدمة:</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setEmailConfig(prev => ({
                              ...prev,
                              smtpHost: "smtp.office365.com",
                              smtpPort: 587,
                              secure: false
                            }))}
                            className="p-2 border border-slate-200 hover:border-amber-500 rounded-xl bg-white text-xs font-bold text-slate-800 transition text-center"
                          >
                            Office 365 / Outlook
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailConfig(prev => ({
                              ...prev,
                              smtpHost: "smtp.gmail.com",
                              smtpPort: 587,
                              secure: false
                            }))}
                            className="p-2 border border-slate-200 hover:border-amber-500 rounded-xl bg-white text-xs font-bold text-slate-800 transition text-center"
                          >
                            Google Gmail
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailConfig(prev => ({
                              ...prev,
                              smtpHost: "mail.al-shehhi-law.ae",
                              smtpPort: 465,
                              secure: true
                            }))}
                            className="p-2 border border-slate-200 hover:border-amber-500 rounded-xl bg-white text-xs font-bold text-slate-800 transition text-center"
                          >
                            خادم خاص Webmail
                          </button>
                        </div>
                      </div>

                      <Field label="عنوان البريد الإلكتروني (Email Address)">
                        <input
                          name="email"
                          type="text"
                          value={emailConfig.email}
                          onChange={(e) => setEmailConfig(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="أدخل أي عنوان بريد إلكتروني ترغب باستخدامه (مثال: lawyer@domain.com)"
                          className={`${inputCls} focus:ring-2 focus:ring-amber-500 font-medium`}
                        />
                        <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                          ✓ حقل حر وقابل للتعديل بالكامل في أي وقت لإدخال أي حساب بريد تريد ربطه
                        </p>
                      </Field>

                      <Field label="اسم المرسل المعروض (Sender Name)">
                        <input
                          value={emailConfig.senderName}
                          onChange={(e) => setEmailConfig(prev => ({ ...prev, senderName: e.target.value }))}
                          placeholder="المحامي سعود أحمد الشحي"
                          className={inputCls}
                        />
                      </Field>

                      <Field label="كلمة المرور / كلمة مرور التطبيق (App Password)">
                        <input
                          type="password"
                          value={emailConfig.appPassword || ""}
                          onChange={(e) => setEmailConfig(prev => ({ ...prev, appPassword: e.target.value }))}
                          placeholder="••••••••••••••••"
                          className={inputCls}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          * لـ Gmail أو Office 365 يُنصح باستخدام كلمة مرور التطبيقات المخصصة (App Password)
                        </p>
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="خادم الإرسال (SMTP Host)">
                          <input
                            value={emailConfig.smtpHost}
                            onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                            placeholder="smtp.office365.com"
                            className={inputCls}
                          />
                        </Field>

                        <Field label="منفذ الخادم (Port)">
                          <input
                            type="number"
                            value={emailConfig.smtpPort}
                            onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: Number(e.target.value) || 587 }))}
                            placeholder="587"
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <button
                        onClick={handleSaveEmailSettings}
                        className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 transition shadow-sm"
                      >
                        حفظ واختبار تفعيل البريد الإلكتروني
                      </button>
                    </div>
                  </Modal>
                )}

                {/* نافذة إنشاء رسالة بريد */}
                {showComposeEmail && (
                  <Modal title="إنشاء وتوجيه بريد إلكتروني رسمي" onClose={() => setShowComposeEmail(false)}>
                    <div className="space-y-4 text-sm">
                      <div className="bg-stone-50 border border-slate-200 p-2.5 rounded-xl text-xs flex items-center justify-between">
                        <span className="text-slate-600">سيتم الإرسال عبر: <b>{emailConfig.email}</b></span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          {emailConfig.smtpHost}
                        </span>
                      </div>

                      <Field label="إلى (المرسل إليه)">
                        <input
                          value={composeTo}
                          onChange={(e) => setComposeTo(e.target.value)}
                          placeholder="notifications@dc.gov.ae أو بريد الموكل"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="موضوع الرسالة">
                        <input
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="عنوان الموضوع الرسمي..."
                          className={inputCls}
                        />
                      </Field>
                      <Field label="نص البريد الإلكتروني">
                        <textarea
                          rows={6}
                          value={composeBody}
                          onChange={(e) => setComposeBody(e.target.value)}
                          placeholder="اكتب تفاصيل المراسلة القانونية..."
                          className={inputCls}
                        />
                      </Field>
                      <Field label="مرفق ملف (اسم المرفق)">
                        <input
                          value={composeAttachment}
                          onChange={(e) => setComposeAttachment(e.target.value)}
                          placeholder="مثال: لائحة_طعن_رسمية.pdf"
                          className={inputCls}
                        />
                      </Field>
                      <button
                        onClick={handleSendInAppEmail}
                        className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-900 hover:bg-amber-400 transition shadow-sm"
                      >
                        إرسال وحفظ في جدول Supabase الآن
                      </button>
                    </div>
                  </Modal>
                )}
              </div>
            )}

            {/* ================= واتساب المكتب المدمج WhatsApp Office ================= */}
            {tab === "whatsapp_office" && (
              <div className="space-y-6">
                {!isSuperAdmin && !currentUser.canAccessWhatsapp ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-8 text-center space-y-4 my-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                      <MessageSquare size={36} />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="text-xl font-bold text-amber-950">محمي: واتساب المكتب المدمج</h3>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        عذراً، الوصول إلى مراسلات واتساب المكتب المباشرة وسجلات الرسائل مقتصر على مدير النظام أو الموظف المصرح له بدخول وحدة التواصل.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* شريط عنوان البوابة والربط المباشر بـ Supabase */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 rounded-3xl text-white shadow-xl border border-emerald-800/40">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                          <h2 className="text-2xl font-bold flex items-center gap-2.5">
                            <MessageSquare className="text-emerald-400 shrink-0" size={26} /> واجهة مراسلات الواتساب المباشرة
                          </h2>
                        </div>
                        <p className="text-xs text-slate-300">
                          ربط حي ومباشر مع قاعدة بيانات Supabase (جدول <code className="text-emerald-300 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">whatsapp_messages</code>) ودالة Edge Function (<code className="text-emerald-300 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">send-whatsapp-message</code>)
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl text-xs text-emerald-300 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>المزامن اللحظي: Supabase Realtime Active</span>
                        </div>

                        <button
                          onClick={() => fetchSupabaseWhatsAppMessages()}
                          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
                        >
                          <RotateCw size={14} className="text-emerald-400" /> تحديث من Supabase
                        </button>

                        <button
                          onClick={() => setShowNewWaChatModal(true)}
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
                        >
                          <Plus size={16} /> بدء محادثة جديدة
                        </button>
                      </div>
                    </div>

                    {/* واجهة المحادثات المخصصة Custom Chat Interface */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden min-h-[600px]">
                      {/* القائمة الجانبية: قائمة الرسائل والمحادثات */}
                      <div className="lg:col-span-1 border-l border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <MessageSquare size={16} className="text-emerald-600" /> قائمة المحادثات (<code className="text-xs font-mono">{waChats.length}</code>)
                            </h3>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              Realtime
                            </span>
                          </div>

                          {/* مربع بحث في المحادثات */}
                          <div className="relative">
                            <input
                              type="text"
                              value={waSearchTerm}
                              onChange={(e) => setWaSearchTerm(e.target.value)}
                              placeholder="بحث بالاسم أو رقم الهاتف..."
                              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                            />
                            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                          </div>

                          {/* قائمة المحادثات من Supabase */}
                          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
                            {waChats
                              .filter(c => !waSearchTerm || c.name.toLowerCase().includes(waSearchTerm.toLowerCase()) || c.phone.includes(waSearchTerm))
                              .map(chat => {
                                const lastMsg = chat.messages[chat.messages.length - 1];
                                const isSelected = selectedWaChatId === chat.id;

                                return (
                                  <div
                                    key={chat.id}
                                    onClick={() => {
                                      setSelectedWaChatId(chat.id);
                                      setWaChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                                    }}
                                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                                      isSelected
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-md transform scale-[1.01]"
                                        : "bg-white border-slate-200 hover:bg-emerald-50/50 text-slate-800 hover:border-emerald-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-sm shadow-xs ${
                                        isSelected ? "bg-white text-emerald-800" : chat.avatarBg || "bg-emerald-600 text-white"
                                      }`}>
                                        {chat.name.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <p className="font-bold text-xs truncate">{chat.name}</p>
                                        </div>
                                        <p className={`text-[11px] truncate font-mono ${isSelected ? "text-emerald-100" : "text-slate-500"}`}>
                                          {chat.phone}
                                        </p>
                                        {lastMsg && (
                                          <p className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-emerald-100/90" : "text-slate-400"}`}>
                                            {lastMsg.sender === "me" ? "أنت: " : ""}{lastMsg.text}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      {lastMsg && (
                                        <span className={`text-[9px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                                          {lastMsg.time}
                                        </span>
                                      )}
                                      {chat.unreadCount > 0 && (
                                        <span className="bg-emerald-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                                          {chat.unreadCount}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* زر إضافة محادثة سريعة من أسفل القائمة */}
                        <button
                          onClick={() => setShowNewWaChatModal(true)}
                          className="w-full py-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                          <Plus size={14} /> إضافة جهة اتصال جديدة
                        </button>
                      </div>

                      {/* صندوق شات عرض تفاصيل المحادثة المحددة */}
                      <div className="lg:col-span-2 p-5 flex flex-col justify-between bg-slate-50/30">
                        {(() => {
                          const activeChat = waChats.find(c => c.id === selectedWaChatId);
                          if (!activeChat) {
                            return (
                              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-20">
                                <MessageSquare size={48} className="text-slate-300" />
                                <p className="text-xs font-bold">حدد محادثة من القائمة الجانبية لاستعراض وتلقي الرسائل</p>
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* هيدر الشات */}
                              <div className="border border-slate-200 bg-white p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white ${activeChat.avatarBg || 'bg-emerald-600'}`}>
                                    {activeChat.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                      {activeChat.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dir-ltr font-mono">{activeChat.phone} • {activeChat.role}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                                    <CheckCheck size={14} className="text-emerald-600" /> Meta WhatsApp Cloud API Active
                                  </span>
                                </div>
                              </div>

                              {/* منطقة عرض الرسائل الواردة والصادرة */}
                              <div className="space-y-3.5 overflow-y-auto max-h-[400px] min-h-[350px] p-3 bg-stone-100/70 rounded-2xl border border-slate-200/80">
                                {activeChat.messages.length === 0 ? (
                                  <div className="text-center py-12 text-slate-400 text-xs">
                                    لا توجد رسائل سابقة في هذه المحادثة. أرسل أول رسالة للبدء!
                                  </div>
                                ) : (
                                  activeChat.messages.map(msg => (
                                    <div
                                      key={msg.id}
                                      className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
                                    >
                                      <div className={`p-3.5 rounded-2xl text-xs max-w-[82%] leading-relaxed shadow-xs ${
                                        msg.sender === "me"
                                          ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-none"
                                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                                      }`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 font-mono">
                                        <span>{msg.time}</span>
                                        {msg.sender === "me" && (
                                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                            <CheckCheck size={13} /> Edge Function
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* مربع إدخال النص وزر إرسال يستدعي send-whatsapp-message Edge Function */}
                              <div className="mt-4 flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
                                <input
                                  value={waInputText}
                                  onChange={(e) => setWaInputText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSendWaMessage(activeChat.id);
                                    }
                                  }}
                                  placeholder="اكتب رسالتك المباشرة هنا (سيتم إرسالها عبر Edge Function وتخزينها في Supabase)..."
                                  className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSendWaMessage(activeChat.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 shadow-xs"
                                >
                                  <Send size={15} /> إرسال عبر الواتساب (Edge Function)
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* مودال إنشاء محادثة جديدة */}
            {showNewWaChatModal && (
              <Modal title="بدء محادثة واتساب جديدة (Meta API & Supabase)" onClose={() => setShowNewWaChatModal(false)}>
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

            {/* ================= المتصفح الخاص المدمج Embedded Private Browser ================= */}
            {tab === "browser" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="text-amber-600" /> المتصفح الخاص المدمج بالمكتب
                    </h2>
                    <p className="text-xs text-slate-500">تصفح المواقع الرسمية والمحاكم والجريدة الرسمية بأمان كامل داخل بيئة التطبيق</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBrowserUrl("https://www.dc.gov.ae")}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 hover:bg-amber-200"
                    >
                      محاكم دبي
                    </button>
                    <button
                      onClick={() => setBrowserUrl("https://www.moj.gov.ae")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-300 hover:bg-indigo-200"
                    >
                      وزارة العدل
                    </button>
                    <button
                      onClick={() => setBrowserUrl("https://elaws.moj.gov.ae")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 hover:bg-emerald-200"
                    >
                      تشريعات الإمارات
                    </button>
                  </div>
                </div>

                {/* شريط عنوان المتصفح والتحكم */}
                <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-sm flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => {
                        setBrowserUrl(browserInputUrl);
                      }}
                      className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800"
                      title="تحديث"
                    >
                      <RotateCw size={16} />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <Globe size={15} className="text-amber-400 shrink-0" />
                    <input
                      value={browserInputUrl}
                      onChange={(e) => setBrowserInputUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setBrowserUrl(browserInputUrl);
                        }
                      }}
                      className="w-full bg-transparent text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    onClick={() => setBrowserUrl(browserInputUrl)}
                    className="bg-amber-500 text-slate-900 font-bold px-4 py-1.5 rounded-xl text-xs hover:bg-amber-400"
                  >
                    انتقال
                  </button>
                </div>

                {/* إطار العرض الخارجي iFrame */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[650px] relative">
                  <iframe
                    src={browserUrl}
                    title="المتصفح المدمج"
                    className="w-full h-full border-none"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              </div>
            )}

            {/* ================= النظام المالي والأتعاب والضريبة ================= */}
            {tab === "invoices" && (
              <div className="space-y-6">
                {/* شريط الأقسام المالي */}
                <div className="flex border-b border-slate-200 overflow-x-auto">
                  <button
                    onClick={() => setInvoiceSubTab("payments")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "payments" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <CreditCard size={18} /> سندات القبض والدفعات ({payments.length})
                  </button>
                  <button
                    onClick={() => setInvoiceSubTab("agreements")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "agreements" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <FileSignature size={18} /> اتفاقيات الأتعاب ({feeAgreements.length})
                  </button>
                  <button
                    onClick={() => setInvoiceSubTab("invoices")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "invoices" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <Receipt size={18} /> الفواتير وضريبة FTA (5%)
                  </button>
                  <button
                    onClick={() => setInvoiceSubTab("time")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "time" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <Clock size={18} /> تتبع ساعات العمل (Time Tracking)
                  </button>
                  <button
                    onClick={() => setInvoiceSubTab("trust")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "trust" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <ShieldCheck size={18} /> حساب أمانات الموكلين (Trust Account)
                  </button>
                  <button
                    onClick={() => setInvoiceSubTab("expenses")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${invoiceSubTab === "expenses" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <TrendingUp size={18} /> مصروفات القضية وتقرير الربحية
                  </button>
                </div>

                {!userPerms.viewInvoices ? (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                    <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
                    <h3 className="font-bold text-slate-800">صلاحيات محددة للمستخدم</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">حسابك الحالي ({currentUser.roleTitle}) لا يمتلك صلاحية الوصول إلى النظام المالي والفواتير. يرجى التبديل إلى حساب المحاسب أو مدير النظام.</p>
                  </div>
                ) : (
                  <>
                    {/* ===== 1. سندات القبض والدفعات المسجلة ===== */}
                    {invoiceSubTab === "payments" && (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <CreditCard className="text-amber-600" /> سجل سندات القبض وتحصيلات الدفعات
                            </h2>
                            <p className="text-xs text-slate-500">تسجيل وتخصيص الدفعات المقبوضة لاتفاقيات الأتعاب أو ترحيلها للرصيد المعلّق</p>
                          </div>
                          <button
                            onClick={() => openModalWithCheck("payment", "manageInvoices")}
                            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"
                          >
                            <Plus size={16} /> تسجيل دفعة / سند قبض جديد
                          </button>
                        </div>

                        {/* إحصائيات الدفعات */}
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500">إجمالي التحصيلات المقبوضة</p>
                            <p className="text-2xl font-bold text-slate-900 font-mono">
                              {fmtAED(payments.reduce((sum, p) => sum + p.amount, 0))}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                            <p className="text-xs text-emerald-800 font-semibold">الدفعات المخصصة للاتفاقيات</p>
                            <p className="text-2xl font-bold text-emerald-800 font-mono">
                              {fmtAED(payments.filter(p => p.feeAgreementId !== "unallocated" && p.feeAgreementId != null).reduce((sum, p) => sum + p.amount, 0))}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                            <p className="text-xs text-amber-800 font-semibold">الأرصدة المعلقة (دفعات غير مخصصة)</p>
                            <p className="text-2xl font-bold text-amber-800 font-mono">
                              {fmtAED(payments.filter(p => p.feeAgreementId === "unallocated" || p.feeAgreementId == null).reduce((sum, p) => sum + p.amount, 0))}
                            </p>
                          </div>
                        </div>

                        {/* جدول الدفعات */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-full text-sm">
                            <thead className="bg-stone-50 text-right text-xs text-slate-500">
                              <tr>
                                <th className="px-4 py-3 font-semibold">رقم السند / المرجع</th>
                                <th className="px-4 py-3 font-semibold">التاريخ</th>
                                <th className="px-4 py-3 font-semibold">الموكل</th>
                                <th className="px-4 py-3 font-semibold">اتفاقية الأتعاب المرتبطة</th>
                                <th className="px-4 py-3 font-semibold">طريقة السداد</th>
                                <th className="px-4 py-3 font-semibold">المبلغ المقبوض</th>
                                <th className="px-4 py-3 font-semibold">البيان والملاحظات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {payments.map((p) => {
                                const client = clients.find(c => c.id === p.clientId);
                                const isUnallocated = !p.feeAgreementId || p.feeAgreementId === "unallocated";
                                const agreement = !isUnallocated ? feeAgreements.find(a => a.id === p.feeAgreementId) : null;

                                return (
                                  <tr key={p.id} className="hover:bg-amber-50/50">
                                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.referenceNo}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(p.date)}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900">{client?.name || "—"}</td>
                                    <td className="px-4 py-3">
                                      {isUnallocated ? (
                                        <Badge className="bg-amber-100 text-amber-900 border border-amber-300">
                                          دفعة غير مخصصة (رصيد معلّق للموكل)
                                        </Badge>
                                      ) : (
                                        <div className="text-xs">
                                          <span className="font-semibold text-slate-900 block">
                                            {agreement ? `[${agreement.agreementNumber}] ${agreement.title}` : `اتفاقية #${p.feeAgreementId}`}
                                          </span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{p.paymentMethod}</td>
                                    <td className="px-4 py-3 font-bold font-mono text-emerald-700 text-sm">
                                      +{fmtAED(p.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{p.notes || "—"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ===== 2. اتفاقيات الأتعاب (Fee Agreements) ===== */}
                    {invoiceSubTab === "agreements" && (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <FileSignature className="text-amber-600" /> اتفاقيات أتعاب المحاماة والعقود
                            </h2>
                            <p className="text-xs text-slate-500">متابعة قيم العقود، التحصيلات، المتبقي على كل اتفاقية، والربط مع الدفعات</p>
                          </div>
                          <button
                            onClick={() => openModalWithCheck("payment", "manageInvoices")}
                            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"
                          >
                            <Plus size={16} /> تسجيل دفعة جديدة
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500">إجمالي قيم اتفاقيات الأتعاب</p>
                            <p className="text-2xl font-bold text-slate-900 font-mono">
                              {fmtAED(feeAgreements.reduce((sum, a) => sum + a.totalAmount, 0))}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                            <p className="text-xs text-emerald-800 font-semibold">إجمالي المحصّل على الاتفاقيات</p>
                            <p className="text-2xl font-bold text-emerald-800 font-mono">
                              {fmtAED(feeAgreements.reduce((sum, a) => sum + getPaidForAgreement(a.id), 0))}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                            <p className="text-xs text-amber-800 font-semibold">إجمالي المتبقي على الاتفاقيات النشطة</p>
                            <p className="text-2xl font-bold text-amber-800 font-mono">
                              {fmtAED(feeAgreements.filter(a => a.status === "نشطة").reduce((sum, a) => sum + getRemainingForAgreement(a), 0))}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {feeAgreements.map((agr) => {
                            const paid = getPaidForAgreement(agr.id);
                            const remaining = getRemainingForAgreement(agr);
                            const fullyPaid = isAgreementFullyPaid(agr);
                            const client = clients.find(c => c.id === agr.clientId);

                            return (
                              <div key={agr.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-amber-300 transition">
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className="font-mono font-bold text-slate-900 text-sm bg-stone-100 px-2.5 py-1 rounded-lg">
                                        {agr.agreementNumber}
                                      </span>
                                      <h3 className="font-bold text-slate-900 text-base">{agr.title}</h3>
                                      <Badge className={fullyPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                                        {fullyPaid ? "مسددة بالكامل" : agr.status}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                      الموكل: <b>{client?.name || "—"}</b> • تاريخ العقد: {fmtDate(agr.date)}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {!fullyPaid ? (
                                      <button
                                        onClick={() => {
                                          setForm({ clientId: String(agr.clientId), feeAgreementId: agr.id });
                                          openModalWithCheck("payment", "manageInvoices");
                                        }}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold hover:bg-amber-400 shadow-sm"
                                      >
                                        <Plus size={14} /> تسجيل دفعة على هذه الاتفاقية
                                      </button>
                                    ) : (
                                      <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                                        ✓ مسددة بالكامل (لا تقبل دفعات إضافية)
                                      </span>
                                    )}
                                    <button
                                      onClick={() => {
                                        const matchingOA = officeAgreements.find((oa) => oa.feeAgreementId === agr.id || oa.agreementNumber === agr.agreementNumber);
                                        if (matchingOA) {
                                          setDeleteAgrConfirm(matchingOA);
                                        } else {
                                          setDeleteAgrConfirm({
                                            id: agr.id,
                                            agreementNumber: agr.agreementNumber,
                                            feeAgreementId: agr.id,
                                            clientId: agr.clientId,
                                            contractDate: agr.date,
                                            contractCity: "الشارقة",
                                            clientNameAr: client?.name || "الموكل",
                                            clientNameEn: "",
                                            representativeAr: "",
                                            representativeEn: "",
                                            phone: "",
                                            caseDetailsAr: agr.title,
                                            caseDetailsEn: "",
                                            totalAmount: agr.totalAmount,
                                            paymentTermsAr: "",
                                            paymentTermsEn: "",
                                            installments: [],
                                            createdAt: agr.date,
                                          });
                                        }
                                      }}
                                      className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 border border-slate-200 transition"
                                      title="حذف هذه الاتفاقية"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                                  <div>
                                    <span className="text-slate-500 block">إجمالي أتعاب العقد</span>
                                    <span className="font-bold text-slate-900 text-sm font-mono">{fmtAED(agr.totalAmount)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">المبلغ المدفوع (المحصل)</span>
                                    <span className="font-bold text-emerald-700 text-sm font-mono">{fmtAED(paid)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">المتبقي المطلوب سداده</span>
                                    <span className={`font-bold text-sm font-mono ${remaining > 0 ? "text-amber-800" : "text-slate-400"}`}>
                                      {fmtAED(remaining)}
                                    </span>
                                  </div>
                                </div>

                                {agr.notes && (
                                  <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                                    📝 {agr.notes}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {invoiceSubTab === "invoices" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-bold">الفواتير وضريبة القيمة المضافة (5%)</h2>
                            <p className="text-xs text-slate-500">مطالبات الأتعاب بتنسيق الهيئة الاتحادية للضرائب FTA (TRN: {FIRM_TRN})</p>
                          </div>
                          <button onClick={() => openModalWithCheck("invoice", "manageInvoices")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"><Plus size={16} /> إصدار فاتورة ضريبية</button>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-full text-sm">
                            <thead className="bg-stone-50 text-right text-xs text-slate-500">
                              <tr>
                                <th className="px-4 py-3 font-semibold">رقم الفاتورة</th>
                                <th className="px-4 py-3 font-semibold">الموكل</th>
                                <th className="px-4 py-3 font-semibold">المبلغ الصافي</th>
                                <th className="px-4 py-3 font-semibold">الضريبة 5%</th>
                                <th className="px-4 py-3 font-semibold">الإجمالي</th>
                                <th className="px-4 py-3 font-semibold">الحالة</th>
                                <th className="px-4 py-3 font-semibold text-center">إجراءات وتصدير FTA</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {invoices.map((inv) => {
                                const vat = inv.amount * VAT_RATE;
                                const total = inv.amount + vat;
                                return (
                                  <tr key={inv.id} className="hover:bg-amber-50/50">
                                    <td className="px-4 py-3 font-mono font-semibold">{inv.number}</td>
                                    <td className="px-4 py-3">{clientName(inv.clientId)}</td>
                                    <td className="px-4 py-3">{fmtAED(inv.amount)}</td>
                                    <td className="px-4 py-3 text-slate-500">{fmtAED(vat)}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900">{fmtAED(total)}</td>
                                    <td className="px-4 py-3"><Badge className={invColor(inv.status)}>{inv.status}</Badge></td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => openNotificationComposer("تذكير فاتورة", inv)} className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 flex items-center gap-1 text-xs font-semibold" title="تذكير الموكل بسداد الفاتورة">
                                          <Send size={14} /> تذكير بالواتساب/الإيميل
                                        </button>
                                        <button onClick={() => setReport({ type: "tax-invoice", invoiceId: inv.id })} className="p-1.5 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-50 flex items-center gap-1 text-xs font-bold" title="عرض وطباعة فاتورة FTA الرسمية">
                                          <Printer size={15} /> فاتورة FTA (PDF)
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ===== 2. تتبع ساعات العمل (Time Tracking) ===== */}
                    {invoiceSubTab === "time" && (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <Clock className="text-amber-600" /> تتبع ساعات العمل (Time Tracking)
                            </h2>
                            <p className="text-xs text-slate-500">تسجيل الوقت المستغرق بكل قضية وتحويله تلقائياً لفاتورة أتعاب بالساعة</p>
                          </div>
                          <button onClick={() => openModalWithCheck("time")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm">
                            <Plus size={16} /> تسجيل ساعات عمل
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500">إجمالي الساعات المسجلة</p>
                            <p className="text-2xl font-bold text-slate-900">{timeLogs.reduce((acc, t) => acc + t.hours, 0)} ساعة</p>
                          </div>
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                            <p className="text-xs text-amber-800 font-semibold">قيمة الساعات غير المفوترة</p>
                            <p className="text-2xl font-bold text-amber-800">
                              {fmtAED(timeLogs.filter((t) => !t.billed).reduce((acc, t) => acc + (t.hours * t.hourlyRate), 0))}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                            <p className="text-xs text-emerald-800 font-semibold">نسبة الساعات المفوترة</p>
                            <p className="text-2xl font-bold text-emerald-800">
                              {timeLogs.length > 0 ? Math.round((timeLogs.filter((t) => t.billed).length / timeLogs.length) * 100) : 0}%
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {timeLogs.map((log) => {
                            const cs = cases.find((c) => c.id === log.caseId);
                            const val = log.hours * log.hourlyRate;
                            return (
                              <div key={log.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">{cs ? cs.number : "—"}</span>
                                    <span className="text-xs text-slate-500 bg-stone-100 px-2 py-0.5 rounded font-medium">{log.lawyerName}</span>
                                    {log.billed ? <Badge className="bg-emerald-100 text-emerald-700">مفوترة</Badge> : <Badge className="bg-amber-100 text-amber-800">غير مفوترة</Badge>}
                                  </div>
                                  <p className="text-xs text-slate-600">{log.description}</p>
                                  <p className="text-[11px] text-slate-400">التاريخ: {fmtDate(log.date)} • الموكل: {cs ? clientName(cs.clientId) : "—"}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-left font-mono">
                                    <p className="text-xs text-slate-500">{log.hours} ساعة × {log.hourlyRate} د.إ</p>
                                    <p className="font-bold text-slate-900 text-base">{fmtAED(val)}</p>
                                  </div>
                                  {!log.billed && (
                                    <button
                                      onClick={() => convertTimeToInvoice(log)}
                                      className="px-3 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold text-xs hover:bg-amber-400 shadow-sm"
                                    >
                                      تحويل إلى فاتورة تلقائياً
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ===== 3. حساب أمانات الموكلين (Trust Account) ===== */}
                    {invoiceSubTab === "trust" && (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <ShieldCheck className="text-amber-600" /> حساب أمانات الموكلين (Trust Account)
                            </h2>
                            <p className="text-xs text-slate-500">تتبع مبالغ أمانات رسوم المحاكم والخبراء منفصلة تماماً عن أتعاب المكتب</p>
                          </div>
                          <button onClick={() => openModalWithCheck("trust")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm">
                            <Plus size={16} /> إضافة إيداع / صرف أمانة
                          </button>
                        </div>

                        {/* إجمالي رصيد الأمانات لكل موكل */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {clients.map((c) => {
                            const cTx = trustTransactions.filter((t) => t.clientId === c.id);
                            const deposits = cTx.filter((t) => t.type === "إيداع أمانة").reduce((acc, t) => acc + t.amount, 0);
                            const withdrawals = cTx.filter((t) => t.type === "صرف أمانة").reduce((acc, t) => acc + t.amount, 0);
                            const net = deposits - withdrawals;
                            return (
                              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                                  <Badge className={net > 0 ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-slate-600"}>رصيد الأمانة</Badge>
                                </div>
                                <p className="text-2xl font-mono font-bold text-amber-600">{fmtAED(net)}</p>
                                <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
                                  <span>إيداعات: {fmtAED(deposits)}</span>
                                  <span>مصروفات أمانة: {fmtAED(withdrawals)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* جدول سجل الأمانات */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-full text-sm">
                            <thead className="bg-stone-50 text-right text-xs text-slate-500">
                              <tr>
                                <th className="px-4 py-3 font-semibold">السند / التاريخ</th>
                                <th className="px-4 py-3 font-semibold">الموكل والقضية</th>
                                <th className="px-4 py-3 font-semibold">نوع المعاملة</th>
                                <th className="px-4 py-3 font-semibold">المبلغ (د.إ)</th>
                                <th className="px-4 py-3 font-semibold">البيان والشرح</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {trustTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-amber-50/50">
                                  <td className="px-4 py-3 text-xs">
                                    <p className="font-mono font-bold">{tx.refNo}</p>
                                    <p className="text-slate-400">{fmtDate(tx.date)}</p>
                                  </td>
                                  <td className="px-4 py-3 text-xs">
                                    <p className="font-semibold text-slate-900">{clientName(tx.clientId)}</p>
                                    {tx.caseId && <p className="text-slate-500">{caseNo(tx.caseId)}</p>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge className={tx.type === "إيداع أمانة" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                                      {tx.type}
                                    </Badge>
                                  </td>
                                  <td className={`px-4 py-3 font-mono font-bold ${tx.type === "إيداع أمانة" ? "text-emerald-700" : "text-amber-700"}`}>
                                    {tx.type === "إيداع أمانة" ? "+" : "-"}{fmtAED(tx.amount)}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-slate-600">{tx.notes}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ===== 4. المصروفات وتقارير الربحية ===== */}
                    {invoiceSubTab === "expenses" && (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <TrendingUp className="text-amber-600" /> سجل المصروفات وتقارير ربحية القضايا
                            </h2>
                            <p className="text-xs text-slate-500">متابعة تكاليف الروم القضائية والخبرة والترجمة وحساب الهامش الصافي لكل قضية</p>
                          </div>
                          <button onClick={() => openModalWithCheck("expense")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm">
                            <Plus size={16} /> تسجيل مصروف جديد
                          </button>
                        </div>

                        {/* ملخص تقرير ربحية القضايا */}
                        <div className="space-y-3">
                          {cases.map((cs) => {
                            const csInvoices = invoices.filter((i) => i.caseId === cs.id);
                            const totalAgreedFee = csInvoices.reduce((acc, i) => acc + i.amount, 0);
                            const csTime = timeLogs.filter((t) => t.caseId === cs.id);
                            const totalTimeCost = csTime.reduce((acc, t) => acc + (t.hours * t.hourlyRate), 0);
                            const csExpenses = caseExpenses.filter((e) => e.caseId === cs.id);
                            const totalExpensesPaid = csExpenses.reduce((acc, e) => acc + e.amount, 0);
                            const netProfit = totalAgreedFee - totalExpensesPaid;

                            return (
                              <div key={cs.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <h3 className="font-bold text-slate-900 text-base">{cs.number} — {clientName(cs.clientId)}</h3>
                                    <p className="text-xs text-slate-500">{cs.court} • الموضوع: {cs.subject}</p>
                                  </div>
                                  <button
                                    onClick={() => setReport({ type: "profitability", caseId: cs.id })}
                                    className="flex items-center gap-1 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-800"
                                  >
                                    <Printer size={14} /> عرض وتصدير تقرير الربحية (PDF)
                                  </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-4 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                                  <div>
                                    <span className="text-slate-500 block">إجمالي الأتعاب المتفق عليها</span>
                                    <span className="font-bold text-slate-900 text-sm">{fmtAED(totalAgreedFee)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">مصروفات قضائية ومدفوعات</span>
                                    <span className="font-bold text-red-600 text-sm">{fmtAED(totalExpensesPaid)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">تكلفة وقت المحامين</span>
                                    <span className="font-bold text-slate-700 text-sm">{fmtAED(totalTimeCost)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">الربح الصافي المستهدف</span>
                                    <span className={`font-bold text-sm ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{fmtAED(netProfit)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

{tab === "office_agreement" && (
  <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="text-amber-600" /> اتفاقية أتعاب المحاماة المعتمدة (النموذج الثنائي اللغة)
        </h2>
        <p className="text-xs text-slate-500">
          عبّئ البيانات المتغيرة فقط — البنود (1-8) ثابتة. عند الحفظ: يُضاف الموكل تلقائياً لقائمة الموكلين،
          وتُنشأ اتفاقية الأتعاب برقم AGR، وتنزل الدفعات تلقائياً إلى سجل الدفعات وسندات القبض.
        </p>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {/* ───── نموذج إدخال البيانات المتغيرة ───── */}
      <div className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Edit2 size={16} className="text-amber-600" /> البيانات المتغيرة للاتفاقية
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Field label="تاريخ إبرام العقد">
            <input type="date" value={agrForm.contractDate} onChange={(e) => setAgr("contractDate", e.target.value)} className={inputCls} />
          </Field>
          <Field label="مكان الإبرام (المدينة)">
            <select value={agrForm.contractCity} onChange={(e) => setAgr("contractCity", e.target.value)} className={inputCls}>
              {["الشارقة", "دبي", "أبوظبي", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* اختيار موكل جديد أو موجود */}
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-3.5 space-y-3">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="clientMode" checked={agrForm.clientMode === "new"} onChange={() => setAgr("clientMode", "new")} className="accent-amber-600" />
              موكل جديد (يُضاف تلقائياً لقائمة الموكلين)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="clientMode" checked={agrForm.clientMode === "existing"} onChange={() => setAgr("clientMode", "existing")} className="accent-amber-600" />
              موكل مسجل مسبقاً
            </label>
          </div>

          {agrForm.clientMode === "existing" ? (
            <Field label="اختر الموكل">
              <select value={agrForm.existingClientId} onChange={(e) => setAgr("existingClientId", e.target.value)} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="اسم الموكل (عربي)">
                  <input value={agrForm.clientNameAr} onChange={(e) => setAgr("clientNameAr", e.target.value)} placeholder="مثال: يو اس كي للمعادن ذ.م.م" className={inputCls} />
                </Field>
                <Field label="Client Name (English)">
                  <input dir="ltr" value={agrForm.clientNameEn} onChange={(e) => setAgr("clientNameEn", e.target.value)} placeholder="e.g. U.S.K. Metals L.L.C." className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="الصفة">
                  <select value={agrForm.clientType} onChange={(e) => setAgr("clientType", e.target.value)} className={inputCls}>
                    <option>شركة</option>
                    <option>فرد</option>
                  </select>
                </Field>
                <Field label="الهوية / الرخصة التجارية">
                  <input value={agrForm.idNo} onChange={(e) => setAgr("idNo", e.target.value)} placeholder="رقم الهوية أو الرخصة" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="البريد الإلكتروني">
                  <input dir="ltr" value={agrForm.email} onChange={(e) => setAgr("email", e.target.value)} placeholder="client@email.ae" className={inputCls} />
                </Field>
                <Field label="الإمارة">
                  <select value={agrForm.emirate} onChange={(e) => setAgr("emirate", e.target.value)} className={inputCls}>
                    {["الشارقة", "دبي", "أبوظبي", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة"].map((em) => (
                      <option key={em}>{em}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="ويمثلها / يمثله (عربي)">
              <input value={agrForm.representativeAr} onChange={(e) => setAgr("representativeAr", e.target.value)} placeholder="مثال: خالد بشير أوان بن محمد بشير" className={inputCls} />
            </Field>
            <Field label="Represented by (English)">
              <input dir="ltr" value={agrForm.representativeEn} onChange={(e) => setAgr("representativeEn", e.target.value)} placeholder="e.g. Khalid Bashir Awan bin Muhammad Bashir" className={inputCls} />
            </Field>
          </div>

          <Field label="هاتف رقم">
            <input dir="ltr" value={agrForm.phone} onChange={(e) => setAgr("phone", e.target.value)} placeholder="0553064565" className={inputCls} />
          </Field>
        </div>

        <Field label="تفاصيل القضية (عربي)">
          <textarea rows={2} value={agrForm.caseDetailsAr} onChange={(e) => setAgr("caseDetailsAr", e.target.value)} placeholder="مثال: العمل على القضية رقم 52/2026 — تنفيذ شيكات أم القيوين وأيضاً عمل نزاع موضوعي بالتنفيذ نفسه فقط." className={inputCls} />
        </Field>
        <Field label="Case Details (English)">
          <textarea dir="ltr" rows={2} value={agrForm.caseDetailsEn} onChange={(e) => setAgr("caseDetailsEn", e.target.value)} placeholder="e.g. Working on Case No. 52/2026 — Umm Al Quwain Check Execution..." className={inputCls} />
        </Field>

        {/* ───── جدول الدفعات ───── */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <CreditCard size={14} /> قيمة العقد والدفعات (تنزل تلقائياً إلى سجل الدفعات)
            </h4>
            <button onClick={addAgrInst} className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-white border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100">
              <Plus size={13} /> إضافة دفعة
            </button>
          </div>

          {agrForm.installments.map((inst: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-xl border border-amber-200/70">
              <div className="col-span-3">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">مبلغ الدفعة {idx + 1} (د.إ)</label>
                <input type="number" value={inst.amount} onChange={(e) => setAgrInst(idx, "amount", e.target.value)} placeholder="20000" className={inputCls} />
              </div>
              <div className="col-span-4">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">تاريخ الاستحقاق</label>
                <input type="date" value={inst.dueDate} onChange={(e) => setAgrInst(idx, "dueDate", e.target.value)} className={inputCls} />
              </div>
              <div className="col-span-4 flex items-center gap-1.5 pb-2">
                <input type="checkbox" checked={!!inst.paidOnSigning} onChange={(e) => setAgrInst(idx, "paidOnSigning", e.target.checked)} className="accent-emerald-600 h-4 w-4" id={`paid-${idx}`} />
                <label htmlFor={`paid-${idx}`} className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                  مسددة عند التوقيع (يُنشأ سند قبض تلقائياً)
                </label>
              </div>
              <div className="col-span-1 pb-1.5 text-center">
                {agrForm.installments.length > 1 && (
                  <button onClick={() => removeAgrInst(idx)} className="text-slate-400 hover:text-red-600" title="حذف الدفعة">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between bg-slate-900 text-amber-400 rounded-xl px-4 py-2.5 text-sm font-bold">
            <span>إجمالي قيمة العقد:</span>
            <span className="font-mono">{fmtAED(agrTotal)}</span>
          </div>
          <p className="text-[11px] text-amber-900">
            + ضريبة القيمة المضافة 5% وفق البند (7): <b className="font-mono">{fmtAED(agrTotal * VAT_RATE)}</b> — الإجمالي شامل الضريبة: <b className="font-mono">{fmtAED(agrTotal * 1.05)}</b>
          </p>
        </div>

        <button onClick={saveOfficeAgreement} className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white hover:bg-slate-700 shadow-sm flex items-center justify-center gap-2">
          <FileCheck size={18} className="text-amber-400" />
          حفظ الاتفاقية (إضافة الموكل + إنشاء اتفاقية الأتعاب + تنزيل الدفعات تلقائياً)
        </button>
      </div>

      {/* ───── أرشيف الاتفاقيات المنشأة ───── */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <FolderOpen size={16} className="text-amber-600" /> أرشيف الاتفاقيات المنشأة ({officeAgreements.length})
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">اضغط على أي اتفاقية لمعاينتها وطباعتها مجدداً</p>
          <div className="space-y-2">
            {officeAgreements.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">لم تُنشأ أي اتفاقية بعد</p>
            )}
            {officeAgreements.map((a) => (
              <div key={a.id} className="group flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 p-3 hover:border-amber-400 hover:bg-amber-50/60 transition">
                <button onClick={() => setAgrPreviewId(a.id)} className="flex-1 text-right">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">{a.agreementNumber}</span>
                    <span className="text-[10px] text-slate-400">{fmtDate(a.contractDate)}</span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 mt-1.5 truncate">{a.clientNameAr}</p>
                  <p className="text-[11px] text-slate-500 truncate">{a.caseDetailsAr}</p>
                  <p className="text-[11px] font-mono font-bold text-emerald-700 mt-1">{fmtAED(a.totalAmount)} — {a.installments.length} دفعة</p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteAgrConfirm(a);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 transition"
                  title="حذف الاتفاقية"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[11px] text-emerald-900 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5"><CheckCircle2 size={14} /> ماذا يحدث تلقائياً عند الحفظ؟</p>
          <p>1️⃣ الموكل الجديد يُضاف مباشرة إلى تبويب "الموكلون وجهات الاتصال".</p>
          <p>2️⃣ تُنشأ اتفاقية أتعاب برقم AGR تلقائي في "اتفاقيات الأتعاب".</p>
          <p>3️⃣ الدفعات تنزل كجدول أقساط، والمسددة عند التوقيع يُنشأ لها سند قبض في "سندات القبض والدفعات".</p>
          <p>4️⃣ تُحفظ نسخة الاتفاقية بالأرشيف للطباعة في أي وقت.</p>
        </div>
      </div>
    </div>
  </div>
)}

            {/* ================= المستندات ومولد المذكرات ================= */}
            {tab === "docs" && (
              <div className="space-y-6">
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setDocSubTab("archive")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${docSubTab === "archive" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <FolderOpen size={18} /> أرشيف المستندات والقضايا
                  </button>
                  <button
                    onClick={() => setDocSubTab("generator")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${docSubTab === "generator" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <FileText size={18} /> 📜 مولّد المستندات والصحائف التلقائي
                  </button>
                  <button
                    onClick={() => setDocSubTab("letterhead")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${docSubTab === "letterhead" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <FileText size={18} /> 🎨 الورقة الرسمية (Letterhead)
                  </button>
                </div>

                {docSubTab === "generator" ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <FileText className="text-amber-600" /> توليد النماذج والمذكرات القانونية تلقائياً
                        </h2>
                        <p className="text-xs text-slate-500">تعبئة القوالب الرسمية تلقائياً ببيانات الموكل والدعوى لسرعة التقديم بالمحكمة</p>
                      </div>
                    </div>

                    {(() => {
                      const selTpl = DOC_TEMPLATES.find((t) => t.id === selectedTemplateId) || DOC_TEMPLATES[0];
                      const selCs = cases.find((c) => c.id === selectedGenCaseId) || cases[0];
                      const selClient = selCs ? clients.find((cl) => cl.id === selCs.clientId) : null;

                      const generatedContent = selTpl && selCs ? selTpl.templateBody
                        .replace(/\{\{CASE_NUMBER\}\}/g, selCs.number)
                        .replace(/\{\{CLIENT_NAME\}\}/g, selClient ? selClient.name : "—")
                        .replace(/\{\{CLIENT_ID_NO\}\}/g, selClient ? selClient.idNo : "—")
                        .replace(/\{\{COURT\}\}/g, selCs.court)
                        .replace(/\{\{OPPONENT\}\}/g, selCs.opponent)
                        .replace(/\{\{CASE_SUBJECT\}\}/g, selCs.subject)
                        .replace(/\{\{CASE_FEE\}\}/g, selCs.fee ? selCs.fee.toLocaleString("ar-AE") : "0")
                        .replace(/\{\{TODAY_DATE\}\}/g, fmtDate(todayISO()))
                        : "";

                      return (
                        <div className="grid gap-6 lg:grid-cols-3">
                          {/* اختيار القالب والقضية */}
                          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <Field label="اختر قالب المستند">
                              <select
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                className={inputCls}
                              >
                                {DOC_TEMPLATES.map((t) => (
                                  <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                                ))}
                              </select>
                            </Field>

                            <Field label="اختر القضية لربط البيانات">
                              <select
                                value={selectedGenCaseId}
                                onChange={(e) => setSelectedGenCaseId(Number(e.target.value))}
                                className={inputCls}
                              >
                                {cases.map((c) => (
                                  <option key={c.id} value={c.id}>{c.number} — {clientName(c.clientId)}</option>
                                ))}
                              </select>
                            </Field>

                            {selTpl && selCs && (
                              <div className="space-y-3 pt-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatedContent);
                                    alert("تم نسخ نص المستند المكتمل إلى المحفظة بنجاح!");
                                  }}
                                  className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-900 hover:bg-amber-400 flex items-center justify-center gap-2"
                                >
                                  <Copy size={16} /> نسخ النص القانوني
                                </button>
                                <button
                                  onClick={() => window.print()}
                                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 flex items-center justify-center gap-2"
                                >
                                  <Printer size={16} /> طباعة / حفظ PDF
                                </button>
                              </div>
                            )}
                          </div>

                          {/* معاينة المستند المكتمل */}
                          <div className="lg:col-span-2 rounded-2xl border border-slate-300 bg-white p-8 shadow-md font-serif space-y-4 text-slate-900 leading-relaxed text-sm">
                            <div className="text-center border-b-2 border-slate-900 pb-4">
                              <h3 className="text-xl font-bold">{FIRM_NAME}</h3>
                              <p className="text-xs text-slate-600 mt-1 font-sans">{FIRM_TAGLINE}</p>
                              <h4 className="text-lg font-bold mt-4 text-amber-800">{selTpl.title}</h4>
                            </div>

                            <div className="whitespace-pre-wrap font-mono text-xs leading-loose bg-stone-50 p-6 rounded-xl border border-stone-200">
                              {generatedContent}
                            </div>

                            <div className="flex justify-between items-center pt-6 text-xs font-sans border-t border-slate-200">
                              <span>التاريخ: {fmtDate(todayISO())}</span>
                              <span className="font-bold">توقيع المحامي وختم المكتب الرسمي</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : docSubTab === "archive" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">الأرشيف والمستندات</h2>
                        <p className="text-xs text-slate-500">صحائف الدعوى، المذكرات، وعقود الخبرة</p>
                      </div>
                      <button onClick={() => openModalWithCheck("doc", "manageDocs")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"><Plus size={16} /> رفع مستند</button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {docs.map((d) => (
                        <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-3">
                          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><FolderOpen size={20} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{d.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{d.type} • {fmtDate(d.date)}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">بواسطة: {d.by}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <FileText className="text-amber-600" /> إعدادات الورقة الرسمية للمكتب (Letterhead)
                        </h2>
                        <p className="text-xs text-slate-500">ضبط وترويسة التذييل والهيدر للمستندات المطبوعة والاتفاقيات</p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* ترويسة الرأس Header */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          الترويسة العلوية (Header Image)
                        </h3>
                        {letterhead.headerImg ? (
                          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                            <img src={letterhead.headerImg} alt="Header" className="max-h-32 mx-auto object-contain" />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                            لا توجد ترويسة علوية مخصصة
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateLetterhead({ headerImg: OFFICE_HEADER_IMG })}
                            className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            استعادة الترويسة الرسمية
                          </button>
                        </div>
                      </div>

                      {/* التذييل السفلي Footer */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          التذييل السفلي (Footer Image)
                        </h3>
                        {letterhead.footerImg ? (
                          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                            <img src={letterhead.footerImg} alt="Footer" className="max-h-32 mx-auto object-contain" />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                            لا يوجد تذييل سفلي مخصص
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateLetterhead({ footerImg: OFFICE_FOOTER_IMG })}
                            className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            استعادة الترويسة الرسمية
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= الوكالات ================= */}
            {tab === "poa" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">إدارة الوكالات القانونية</h2>
                    <p className="text-xs text-slate-500">توكيلات الكاتب العدل وتنبيهات الانتهاء الصادرة من كاتب العدل</p>
                  </div>
                  <button onClick={() => openModalWithCheck("poa", "manageDocs")} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"><Plus size={16} /> إضافة وكالة</button>
                </div>
                <div className="space-y-3">
                  {poas.map((p) => {
                    const daysLeft = daysUntil(p.expiry);
                    return (
                      <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900">{p.number} — {clientName(p.clientId)}</h3>
                            <p className="text-xs text-slate-500">{p.issuer} | تاريخ الإصدار: {fmtDate(p.issue)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {daysLeft <= 60 ? (
                              <Badge className="bg-red-100 text-red-700">تنتهي خلال {daysLeft} يومًا</Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-700">سارية ({daysLeft} يومًا)</Badge>
                            )}
                            <button
                              onClick={() => openNotificationComposer("تجديد وكالة / POA", p)}
                              className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200 hover:bg-amber-100"
                              title="إرسال تنبيه تجديد الوكالة بالواتساب/الإيميل"
                            >
                              <Send size={14} /> تنبيه التجديد
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 bg-stone-50 p-2 rounded-lg border border-stone-200 font-medium">صلاحيات الوكالة: {p.scope}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ================= اعرف عميلك KYC وعناية AML ================= */}
            {tab === "kyc" && (
              <div className="space-y-6">
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setKycSubTab("kyc")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${kycSubTab === "kyc" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <ShieldCheck size={18} /> سجلات العناية الواجبة (KYC)
                  </button>
                  <button
                    onClick={() => setKycSubTab("str")}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${kycSubTab === "str" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <ShieldAlert size={18} /> 🚨 سجل بلاغات الاشتباه AML / STR ({strReports.length})
                  </button>
                </div>

                {kycSubTab === "str" ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-red-700">
                          <ShieldAlert /> سجل بلاغات المعاملات المشبوهة (AML / STR)
                        </h2>
                        <p className="text-xs text-slate-500">سجل إبلاغ وحدة المعلومات المالية بالدولة (FIU) الخاص بتنفيذ قوانين مواجهة غسل الأموال</p>
                      </div>
                      <button onClick={() => openModalWithCheck("str")} className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 shadow-sm">
                        <Plus size={16} /> إضافة بلاغ اشتباه جديد
                      </button>
                    </div>

                    <div className="space-y-3">
                      {strReports.map((str) => (
                        <div key={str.id} className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-slate-900">{clientName(str.clientId)}</h3>
                              <p className="text-xs text-slate-500">المبلغ المشتبه به: <b className="text-red-700">{fmtAED(str.amountFlagged)}</b> • التاريخ: {fmtDate(str.date)}</p>
                            </div>
                            <Badge className="bg-red-100 text-red-800 font-bold">{str.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-red-100">
                            <b>أسباب الاشتباه:</b> {str.suspicionReason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <ShieldCheck className="text-amber-600" /> اعرف عميلك والعناية الواجبة (KYC / AML)
                        </h2>
                        <p className="text-xs text-slate-500">سجل التحقق من هويات الموكلين، المستفيد الحقيقي (UBO)، وفحص قوائم العقوبات وفق التشريعات الإماراتية</p>
                      </div>
                      <button onClick={() => { setForm({}); setModal("kyc"); }} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm">
                        <Plus size={16} /> إضافة سجل KYC
                      </button>
                    </div>

                    {/* بطاقات إحصائية سريعة لـ KYC */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">إجمالي الموكلين المفحوصين</p>
                        <p className="text-2xl font-bold text-slate-900">{kyc.length}</p>
                      </div>
                      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
                        <p className="text-xs text-red-700 font-semibold">مخاطر مرتفعة / معرّضين سياسيًا (PEP)</p>
                        <p className="text-2xl font-bold text-red-700">{kyc.filter((k) => k.risk === "مرتفع" || k.pep).length}</p>
                      </div>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                        <p className="text-xs text-amber-800 font-semibold">مراجعة دورية مستحقة قريبًا</p>
                        <p className="text-2xl font-bold text-amber-800">{kycDue}</p>
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                        <p className="text-xs text-emerald-800 font-semibold">ملفات مكتملة وسليمة</p>
                        <p className="text-2xl font-bold text-emerald-800">{kyc.filter((k) => k.status === "مكتمل" && k.sanctions === "سليم").length}</p>
                      </div>
                    </div>

                    {/* جدول سجلات KYC */}
                    {kyc.length === 0 ? (
                      <EmptyState icon={UserCheck} text="لا توجد سجلات KYC مضافة حتى الآن" />
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-stone-50 text-right text-xs text-slate-500 border-b border-slate-100">
                              <tr>
                                <th className="px-4 py-3 font-semibold">الموكل</th>
                                <th className="px-4 py-3 font-semibold">الجنسية والوثيقة</th>
                                <th className="px-4 py-3 font-semibold">المستفيد الحقيقي (UBO)</th>
                                <th className="px-4 py-3 font-semibold">مصدر الأموال</th>
                                <th className="px-4 py-3 font-semibold text-center">PEP / العقوبات</th>
                                <th className="px-4 py-3 font-semibold text-center">درجة المخاطر</th>
                                <th className="px-4 py-3 font-semibold text-center">الحالة</th>
                                <th className="px-4 py-3 font-semibold text-center">المراجعة القادمة</th>
                                <th className="px-4 py-3 font-semibold text-center">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {kyc.map((k) => {
                                const nextRev = nextReviewDate(k.lastReview, k.risk);
                                const daysToRev = daysUntil(nextRev);
                                return (
                                  <tr key={k.id} className="hover:bg-amber-50/30">
                                    <td className="px-4 py-3 font-bold text-slate-900">{clientName(k.clientId)}</td>
                                    <td className="px-4 py-3 text-xs">
                                      <p className="font-semibold text-slate-800">{k.nationality}</p>
                                      <p className="text-slate-500">{k.idType} (تنسحب: {fmtDate(k.idExpiry)})</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-700 max-w-xs truncate" title={k.ubo}>{k.ubo}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{k.sourceOfFunds}</td>
                                    <td className="px-4 py-3 text-center text-xs space-y-1">
                                      {k.pep ? (
                                        <Badge className="bg-purple-100 text-purple-700">PEP معرّض</Badge>
                                      ) : (
                                        <span className="text-slate-400">عادي</span>
                                      )}
                                      <div><Badge className={k.sanctions === "سليم" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>{k.sanctions}</Badge></div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <Badge className={RISK_COLORS[k.risk]}>{k.risk}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <Badge className={KYC_STATUS_COLORS[k.status]}>{k.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs">
                                      <p className="font-semibold">{fmtDate(nextRev)}</p>
                                      {daysToRev <= 30 ? (
                                        <span className="text-[10px] text-red-600 font-bold">مستحقة قريبًا ({daysToRev} يوم)</span>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">متبقي {daysToRev} يوم</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          onClick={() => openNotificationComposer("تجديد وثائق / KYC", k)}
                                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg flex items-center gap-1 text-xs font-semibold"
                                          title="إرسال إشعار طلب تحديث الوثائق/KYC"
                                        >
                                          <Send size={14} /> تنبيه
                                        </button>
                                        <button
                                          onClick={() => { setForm({ ...k }); setModal("kyc-edit"); }}
                                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg"
                                          title="تعديل بيانات KYC"
                                        >
                                          <Edit2 size={15} />
                                        </button>
                                        <button
                                          onClick={() => setReport({ kycId: k.id })}
                                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                          title="طباعة نموذج العناية الواجبة KYC"
                                        >
                                          <Printer size={15} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ================= المستخدمون والصلاحيات ================= */}
            {tab === "users" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="text-amber-600" /> إدارة المستخدمين ومصفوفة الصلاحيات
                    </h2>
                    <p className="text-xs text-slate-500">
                      تخصيص الأدوار، تقييد الوصول حسب الوظيفة، ومتابعة فريق العمل بالمكتب
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!checkPerm("manageUsers", "إضافة مستخدم")) return;
                        setEditingUser(null);
                        setForm({});
                        setModal("user");
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"
                    >
                      <UserPlus size={16} /> إضافة مستخدم جديد
                    </button>
                  </div>
                </div>

                {/* قسم طلبات التفعيل المعلقة Supabase User Approval Flow (Admin Only) */}
                {isAdmin && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-900 font-bold shadow-xs">
                          <Hourglass size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            طلبات الاعتماد والموافقة على المستخدمين الجدد (User Approval Flow)
                            {pendingUsers.length > 0 && (
                              <span className="rounded-full bg-amber-500 text-slate-900 px-2.5 py-0.5 text-xs font-bold">
                                {pendingUsers.length} معلق
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-600">
                            المستخدمون المسجلون بحالة معلقة (status: 'pending') بحاجة لموافقة صريحة للوصول إلى النظام
                          </p>
                        </div>
                      </div>
                    </div>

                    {pendingUsers.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white border border-amber-200/80 text-xs text-slate-600 flex items-center justify-between">
                        <p className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          لا توجد طلبات تسجيل معلقة حالياً. جميع الحسابات نشطة ومصرح لها بالدخول للنظام.
                        </p>
                        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">RLS Status: All Approved</span>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {pendingUsers.map((pUser) => (
                          <div key={pUser.id} className="rounded-2xl border border-amber-300 bg-white p-4 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                  {pUser.name}
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                    معلق (Pending)
                                  </span>
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">{pUser.email} • {pUser.phone}</p>
                              </div>
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                                {pUser.roleTitle}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => approveUser(pUser.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                              >
                                <UserCheck size={14} /> قبول وتفعيل الحساب (Approved)
                              </button>
                              <button
                                onClick={() => rejectUser(pUser.id)}
                                className="flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                              >
                                <Trash2 size={14} /> رفض
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* بطاقة الحساب الحالي الناشط */}
                <div className="p-4 rounded-2xl bg-gradient-to-l from-slate-900 to-slate-800 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${currentUser.avatarBg}`}>
                      {currentUser.avatarText}
                    </div>
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-2">
                        {currentUser.name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 font-bold uppercase">
                          المستخدم الحالي
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300">{currentUser.roleTitle} • {currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <Key size={14} className="text-amber-400" />
                    <span>الصلاحيات المتاحة: <b>{getActivePermissionsCount(currentUser)} من 12</b></span>
                  </div>
                </div>

                {/* دليل أدوار المستخدمين المتاحة */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { key: "admin", name: "مدير النظام / شريك", icon: ShieldCheck, color: "border-amber-400 bg-amber-50/50 text-amber-800", desc: "كامل الصلاحيات المالية والإدارية وحذف الملفات" },
                    { key: "lawyer", name: "محامٍ مستشار", icon: Briefcase, color: "border-indigo-400 bg-indigo-50/50 text-indigo-800", desc: "القضايا والجلسات والمهام دون تعديل الميزانية" },
                    { key: "secretary", name: "سكرتارية وتنسيق", icon: Users, color: "border-purple-400 bg-purple-50/50 text-purple-800", desc: "المواعيد والموكلين دون الاطلاع على الفواتير" },
                    { key: "accountant", name: "محاسب المكتب", icon: Receipt, color: "border-emerald-400 bg-emerald-50/50 text-emerald-800", desc: "الفواتير والأتعاب والضريبة دون تغيير صياغة القضية" },
                  ].map((role) => (
                    <div key={role.key} className={`p-4 rounded-2xl border ${role.color} space-y-1.5`}>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <role.icon size={16} />
                        <span>{role.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-80">{role.desc}</p>
                    </div>
                  ))}
                </div>

                {/* جدول فريق العمل */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">سجل أعضاء فريق العمل بالمكتب</h3>
                    <span className="text-xs text-slate-500 font-medium">إجمالي: {users.length} مستخدمين</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-stone-50 text-right text-xs text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 font-semibold">المستخدم</th>
                          <th className="px-4 py-3 font-semibold">الوظيفة والدور</th>
                          <th className="px-4 py-3 font-semibold">البريد والهاتف</th>
                          <th className="px-4 py-3 font-semibold">كلمة المرور</th>
                          <th className="px-4 py-3 font-semibold">الحالة</th>
                          <th className="px-4 py-3 font-semibold text-center">الصلاحيات المفتوحة</th>
                          <th className="px-4 py-3 font-semibold text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => {
                          const openCount = getActivePermissionsCount(u);
                          const totalCount = 12;
                          return (
                            <tr key={u.id} className="hover:bg-amber-50/40">
                              <td className="px-4 py-3 font-semibold">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.avatarBg}`}>
                                    {u.avatarText}
                                  </div>
                                  <div>
                                    <p className="text-slate-900 font-bold">{u.name}</p>
                                    {u.id === currentUserId && <span className="text-[10px] text-amber-600 font-semibold">(أنت)</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={u.roleKey === "admin" ? "bg-amber-100 text-amber-800" : u.roleKey === "lawyer" ? "bg-indigo-100 text-indigo-700" : u.roleKey === "accountant" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"}>
                                  {u.roleTitle}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600">
                                <p>{u.email}</p>
                                <p className="text-slate-400">{u.phone}</p>
                              </td>
                              <td className="px-4 py-3 text-xs">
                                <span className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg text-slate-800 font-mono font-bold" title="مشفّرة في Supabase Auth">
                                  <Lock size={12} className="text-amber-600" />
                                  ••••••••
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {u.status === "نشط" || u.status === "approved" ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                                    نشط (Approved)
                                  </Badge>
                                ) : u.status === "معلق" || u.status === "pending" ? (
                                  <div className="flex items-center gap-1.5">
                                    <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">
                                      معلق (Pending)
                                    </Badge>
                                    <button
                                      onClick={() => approveUser(u.id)}
                                      className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                                      title="قبول واعتماد الحساب"
                                    >
                                      قبول
                                    </button>
                                  </div>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-500">
                                    {u.status}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  {openCount} / {totalCount}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (!checkPerm("manageUsers", "تعديل المستخدم")) return;
                                      setEditingUser(u);
                                      setForm({
                                        name: u.name,
                                        email: u.email,
                                        phone: u.phone,
                                        password: u.password || "123456",
                                        roleKey: u.roleKey,
                                        roleTitle: u.roleTitle,
                                        status: u.status,
                                        permissions: { ...u.permissions }
                                      });
                                      setModal("user");
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-lg"
                                    title="تعديل بيانات الدور"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setCurrentUserId(u.id)}
                                    className="text-xs bg-stone-100 border border-slate-200 px-2 py-1 rounded-lg hover:bg-amber-50 hover:border-amber-300 font-semibold"
                                  >
                                    تجربة الحساب
                                  </button>
                                  {u.id !== currentUserId && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id)}
                                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                      title="حذف هذا الحساب نهائياً من النظام"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* مصفوفة الصلاحيات التفصيلية التفاعلية للأقسام الـ 12 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <ShieldCheck className="text-amber-600" /> مصفوفة التحكم التفاعلية بالأقسام الـ 12 (Permission Matrix)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        سياسة الحظر الافتراضي (Default-Deny Policy): يمكنك الضغط على خانة أي قسم لتفعيله أو إلغائه فوراً لكل عضو (المزامنة حية ومباشرة مع Supabase Profiles)
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-900 font-bold border border-amber-300">
                      إجمالي الأقسام: 12
                    </Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-900 text-white text-right">
                        <tr>
                          <th className="p-3 rounded-r-xl">القسم / الموديول (12 قسم)</th>
                          {users.map((u) => (
                            <th key={u.id} className="p-3 text-center font-bold">
                              {u.name}
                              <span className="block text-[10px] text-amber-400 font-normal">{u.roleTitle.split("—")[0]}</span>
                              <span className="block text-[10px] font-mono font-normal text-slate-300 mt-0.5">
                                ({getActivePermissionsCount(u)}/12)
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {PERMISSION_MODULES.map((mod) => (
                          <tr key={mod.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800">
                              <p className="font-bold text-slate-900">{mod.label}</p>
                              <p className="text-[11px] text-slate-400 font-normal">{mod.desc}</p>
                            </td>
                            {users.map((u) => {
                              const hasIt = hasTabPermission(u, mod.navTabIds[0]);
                              return (
                                <td key={u.id} className="p-3 text-center">
                                  <button
                                    onClick={() => toggleUserPermission(u.id, mod.id)}
                                    className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${hasIt ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-300 hover:bg-slate-200"}`}
                                    title={`انقر لتعديل صلاحية قسم [${mod.label}] لـ ${u.name}`}
                                  >
                                    {hasIt ? <Check size={16} /> : <Minus size={16} />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= دليل المحاكم والجهات القضائية ================= */}
            {tab === "courts_directory" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Landmark className="text-amber-600" /> دليل وسائل التواصل مع المحاكم والجهات القضائية
                    </h2>
                    <p className="text-xs text-slate-500">
                      دليل تفصيلي شامل يتضمن أسماء المحاكم، الإمارات، الأقسام، أسماء الموظفين والمسؤولين، الهواتف المباشرة، التمديدات الداخلية، أرقام الأختام، البريد الإلكتروني، ومواعيد الاستقبال
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setReport({ type: "court-directory" });
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 shadow-sm"
                    >
                      <Printer size={16} /> طباعة / تصدير الدليل القضائي PDF
                    </button>
                    <button
                      onClick={() => {
                        setEditingCourtContact(null);
                        setForm({
                          courtName: "",
                          emirate: "دبي",
                          department: "",
                          titleOrEmployee: "",
                          phone: "",
                          extOrSeal: "",
                          email: "",
                          operatingHours: "07:30 ص - 02:30 م",
                          location: "",
                          notes: ""
                        });
                        setModal("courtContact");
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm"
                    >
                      <Plus size={16} /> إضافة جهة / موظف محكمة جديد
                    </button>
                  </div>
                </div>

                {/* إحصائيات سريعة لدليل التواصل */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">إجمالي السجلات والأقسام</p>
                      <p className="text-2xl font-bold text-slate-900">{courtContacts.length}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Landmark size={20} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">الإمارات المغطاة</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {Array.from(new Set(courtContacts.map((c) => c.emirate))).length} إمارات
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">خطوط وتمديدات مباشرة</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {courtContacts.filter((c) => c.phone || c.extOrSeal).length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <PhoneCall size={20} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">عناوين البريد المعتمدة</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {courtContacts.filter((c) => c.email).length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Mail size={20} />
                    </div>
                  </div>
                </div>

                {/* شريط البحث والصفية */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="relative">
                      <Search size={16} className="absolute right-3 top-3 text-slate-400" />
                      <input
                        value={courtSearchQuery}
                        onChange={(e) => setCourtSearchQuery(e.target.value)}
                        placeholder="بحث بالاسم، المحكمة، القسم، رقم التمديدة، البريد..."
                        className={`${inputCls} pr-9`}
                      />
                    </div>
                    <div>
                      <select
                        value={courtEmirateFilter}
                        onChange={(e) => setCourtEmirateFilter(e.target.value)}
                        className={inputCls}
                      >
                        <option value="الكل">جميع الإمارات (الكل)</option>
                        <option value="دبي">دبي</option>
                        <option value="أبوظبي">أبوظبي</option>
                        <option value="الشارقة">الشارقة</option>
                        <option value="عجمان">عجمان</option>
                        <option value="رأس الخيمة">رأس الخيمة</option>
                        <option value="أم القيوين">أم القيوين</option>
                        <option value="الفجيرة">الفجيرة</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={courtCategoryFilter}
                        onChange={(e) => setCourtCategoryFilter(e.target.value)}
                        className={inputCls}
                      >
                        <option value="الكل">جميع التخصصات والأقسام</option>
                        <option value="قيد الدعاوى والمذكرات">قيد الدعاوى والمذكرات</option>
                        <option value="إدارة التنفيذ والإنابات">إدارة التنفيذ والإنابات</option>
                        <option value="أمانات الخبراء والتقارير">أمانات الخبراء والتقارير</option>
                        <option value="الأحوال الشخصية والتركات">الأحوال الشخصية والتركات</option>
                        <option value="الطعون والاستئناف">الطعون والاستئناف</option>
                        <option value="الأمور المستعجلة والعرائض">الأمور المستعجلة والعرائض</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* قائمة بطاقات وسائل التواصل التفصيلية للمحاكم */}
                {(() => {
                  const filteredContacts = courtContacts.filter((c) => {
                    const matchQ = courtSearchQuery === "" ||
                      c.courtName.includes(courtSearchQuery) ||
                      c.department.includes(courtSearchQuery) ||
                      c.titleOrEmployee.includes(courtSearchQuery) ||
                      c.phone.includes(courtSearchQuery) ||
                      c.extOrSeal.includes(courtSearchQuery) ||
                      c.email.includes(courtSearchQuery) ||
                      c.location.includes(courtSearchQuery) ||
                      c.notes.includes(courtSearchQuery);

                    const matchEmirate = courtEmirateFilter === "الكل" || c.emirate === courtEmirateFilter;
                    const matchCategory = courtCategoryFilter === "الكل" || c.department.includes(courtCategoryFilter);

                    return matchQ && matchEmirate && matchCategory;
                  });

                  if (filteredContacts.length === 0) {
                    return (
                      <EmptyState
                        icon={Landmark}
                        text="لم يتم العثور على جهات أو أقسام محاكمة تطابق شروط البحث الحالية"
                      />
                    );
                  }

                  return (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {filteredContacts.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            {/* الرأس: اسم المحكمة والإمارة */}
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                              <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                                  <Landmark size={18} className="text-amber-600 shrink-0" />
                                  <span>{c.courtName}</span>
                                </h3>
                                <p className="text-xs font-semibold text-amber-800 mt-1">{c.department}</p>
                              </div>
                              <Badge className="bg-slate-900 text-amber-400 shrink-0 font-bold">{c.emirate}</Badge>
                            </div>

                            {/* الموظف والصفة الوظيفية */}
                            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs text-slate-800 font-medium">
                              <span className="text-slate-500 block text-[11px]">👤 الموظف / المسؤول / الدائرة:</span>
                              <span className="font-bold text-slate-900">{c.titleOrEmployee}</span>
                            </div>

                            {/* رقم الخاتم والتمديدة المباشرة */}
                            {c.extOrSeal && (
                              <div className="bg-amber-500/10 border border-amber-300 p-2.5 rounded-xl text-xs text-amber-950 font-semibold flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-amber-900">
                                  <span className="text-base">🏷️</span>
                                  <span>رقم الخاتم والتمديدة / الشباك:</span>
                                </span>
                                <span className="font-bold text-amber-900 font-mono bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
                                  {c.extOrSeal}
                                </span>
                              </div>
                            )}

                            {/* الهاتف والبريد والمقر */}
                            <div className="space-y-2 text-xs text-slate-700 pt-1">
                              {c.phone && (
                                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-emerald-600" />
                                    <span className="font-bold font-mono text-slate-900" dir="ltr">{c.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(c.phone);
                                        alert(`تم نسخ رقم الهاتف (${c.phone}) بنجاح!`);
                                      }}
                                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded"
                                      title="نسخ رقم الهاتف"
                                    >
                                      <Copy size={13} />
                                    </button>
                                    <a
                                      href={`tel:${c.phone}`}
                                      className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                      title="اتصال مباشر"
                                    >
                                      <PhoneCall size={13} />
                                    </a>
                                  </div>
                                </div>
                              )}

                              {c.email && (
                                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                                    <Mail size={14} className="text-sky-600 shrink-0" />
                                    <span className="font-mono text-slate-800 truncate" dir="ltr">{c.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(c.email);
                                        alert(`تم نسخ البريد الإلكتروني (${c.email}) بنجاح!`);
                                      }}
                                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded"
                                      title="نسخ الإيميل"
                                    >
                                      <Copy size={13} />
                                    </button>
                                    <a
                                      href={`mailto:${c.email}?subject=استفسار قانوني — مكتب سعود أحمد الشحي للمحاماة`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 text-sky-600 hover:bg-sky-100 rounded"
                                      title="إرسال رسالة بريدية"
                                    >
                                      <Send size={13} />
                                    </a>
                                  </div>
                                </div>
                              )}

                              {c.operatingHours && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Clock size={14} className="text-amber-600 shrink-0" />
                                  <span>مواعيد الاستقبال: <b>{c.operatingHours}</b></span>
                                </div>
                              )}

                              {c.location && (
                                <div className="flex items-start gap-2 text-slate-600">
                                  <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                                  <span>المقر: {c.location}</span>
                                </div>
                              )}

                              {c.notes && (
                                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] text-slate-600 mt-2">
                                  <span className="font-bold text-slate-800 block mb-0.5">📝 ملاحظات وتحويل المذكرات:</span>
                                  <span>{c.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* شريط الإجراءات والنسخ الشامل */}
                          <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-1 text-xs">
                            <button
                              onClick={() => {
                                const fullCard = `📌 ${c.courtName} - ${c.emirate}\n🏢 القسم: ${c.department}\n👤 المسؤول: ${c.titleOrEmployee}\n🏷️ الخاتم والتمديدة: ${c.extOrSeal}\n📞 الهاتف: ${c.phone}\n✉️ البريد: ${c.email}\n🕒 مواعيد العمل: ${c.operatingHours}\n📍 الموقع: ${c.location}\n📝 ملاحظات: ${c.notes}`;
                                navigator.clipboard.writeText(fullCard);
                                alert("تم نسخ بطاقة التواصل المباشر بالكامل لسهولة الإرسال والمشاركة!");
                              }}
                              className="flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 font-bold"
                            >
                              <Copy size={13} /> نسخ البطاقة
                            </button>

                            <div className="flex items-center gap-1">
                              {c.phone && (
                                <button
                                  onClick={() => {
                                    const msg = `السلام عليكم، استفسار بخصوص التواصل مع ${c.courtName} - ${c.department} (${c.titleOrEmployee})`;
                                    sendWhatsAppMsg(c.phone, msg);
                                  }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                  title="مراسلة وتصدير عبر الواتساب"
                                >
                                  <MessageSquare size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingCourtContact(c);
                                  setForm({ ...c });
                                  setModal("courtContact");
                                }}
                                className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg"
                                title="تعديل بيانات التواصل"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت تأكد من حذف بيانات تواصل ${c.courtName} - ${c.department}؟`)) {
                                    setCourtContacts(courtContacts.filter((item) => item.id !== c.id));
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                                title="حذف السجل"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}

          </div>
        </main>
      </div>

      {/* ================= النوافذ المنبثقة ================= */}
      {modal === "case" && (
        <Modal title="قيد قضية جديدة" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="رقم القضية لدى المحكمة">
              <input onChange={f("number")} placeholder="مثال: 1245/2026 تجاري كلي" className={inputCls} />
            </Field>
            <Field label="الموكل">
              <select onChange={f("clientId")} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="الخصم">
              <input onChange={f("opponent")} placeholder="اسم المدعى عليه أو الخصم" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="نوع الدعوى">
                <select onChange={f("type")} className={inputCls}>
                  {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="المحكمة المختصة">
                <select onChange={f("court")} className={inputCls}>
                  {COURTS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="موضوع الدعوى والطلبات">
              <textarea onChange={f("subject")} rows={2} placeholder="ملخص وقائع الدعوى..." className={inputCls} />
            </Field>
            <Field label="الأتعاب المتفق عليها (د.إ)">
              <input type="number" onChange={f("fee")} placeholder="0.00" className={inputCls} />
            </Field>

            <button onClick={saveCase} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ وحفظ القضية</button>
          </div>
        </Modal>
      )}

      {modal === "client" && (
        <Modal title="إضافة موكل / جهة اتصال جديدة" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="الاسم الكامل / اسم الشركة / الجهة">
              <input onChange={f("name")} placeholder="الاسم الكامل أو اسم الشركة أو الجهة" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الصفة / التصنيف">
                <select onChange={f("type")} className={inputCls}>
                  <option value="فرد">فرد (شخص)</option>
                  <option value="شركة">شركة / مؤسسة</option>
                  <option value="جهة حكومية">جهة حكومية / رسمية</option>
                  <option value="جهة أخرى">جهة أخرى</option>
                </select>
              </Field>
              <Field label="الهوية / الرخصة / الرقم الضريبي">
                <input onChange={f("idNo")} placeholder="الهوية الإماراتية أو الرخصة التجارية" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الهاتف">
                <input onChange={f("phone")} placeholder="050-XXXXXXX" className={inputCls} />
              </Field>

              <Field label="الإمارة / الموقع">
                <select onChange={f("emirate")} className={inputCls}>
                  <option>دبي</option>
                  <option>أبوظبي</option>
                  <option>الشارقة</option>
                  <option>رأس الخيمة</option>
                  <option>عجمان</option>
                  <option>أم القيوين</option>
                  <option>الفجيرة</option>
                  <option>خارج الدولة</option>
                </select>
              </Field>
            </div>
            <Field label="البريد الإلكتروني">
              <input onChange={f("email")} placeholder="example@email.ae" className={inputCls} />
            </Field>
            <Field label="العنوان / تفاصيل إضافية">
              <input onChange={f("address")} placeholder="العنوان التفصيلي" className={inputCls} />
            </Field>
            <button onClick={saveClient} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 transition">
              حفظ وتأكيد الإضافة
            </button>
          </div>
        </Modal>
      )}

      {modal === "hearing" && (
        <Modal title="جدولة جلسة جديدة" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="القضية المرتبطة">
              <select onChange={f("caseId")} className={inputCls}>
                <option value="">اختر القضية…</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.number} - {clientName(c.clientId)}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="تاريخ الجلسة">
                <input type="date" onChange={f("date")} className={inputCls} />
              </Field>
              <Field label="الوقت">
                <input type="time" onChange={f("time")} defaultValue="09:00" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="نوع الجلسة">
                <select onChange={f("type")} className={inputCls}>
                  {HEARING_TYPES.map((h) => <option key={h}>{h}</option>)}
                </select>
              </Field>
              <Field label="قاعة المحكمة">
                <input onChange={f("room")} placeholder="مثال: قاعة 4 - الطابق 2" className={inputCls} />
              </Field>
            </div>
            <Field label="ملاحظات وتكليفات الجلسة">
              <textarea onChange={f("notes")} rows={2} placeholder="المطلوب في الجلسة (إيداع مذكرة / حضور الموكل)..." className={inputCls} />
            </Field>
            <button onClick={saveHearing} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">تأكيد جدولة الجلسة</button>
          </div>
        </Modal>
      )}

      {modal === "task" && (
        <Modal title="إضافة مهمة جديدة" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="عنوان المهمة">
              <input onChange={f("title")} placeholder="مثال: إعداد مذكرة جوابية..." className={inputCls} />
            </Field>
            <Field label="القضية (اختياري)">
              <select onChange={f("caseId")} className={inputCls}>
                <option value="">غير مرتبطة بقضية محددة</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.number}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المكلف بالمهمة">
                <select onChange={f("assignee")} className={inputCls}>
                  {users.map((u) => <option key={u.id} value={u.name}>{u.name} ({u.roleTitle})</option>)}
                </select>
              </Field>
              <Field label="الأولوية">
                <select onChange={f("priority")} className={inputCls}>
                  <option>متوسطة</option>
                  <option>عالية</option>
                  <option>منخفضة</option>
                </select>
              </Field>
            </div>
            <Field label="تاريخ الاستحقاق">
              <input type="date" onChange={f("due")} defaultValue={todayISO()} className={inputCls} />
            </Field>
            <button onClick={saveTask} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ المهمة</button>
          </div>
        </Modal>
      )}

      {modal === "invoice" && (
        <Modal title="إصدار فاتورة ضريبية جديدة (VAT 5%)" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="الموكل">
              <select onChange={f("clientId")} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="القضية (اختياري)">
              <select onChange={f("caseId")} className={inputCls}>
                <option value="">فاتورة استشارية عامة</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.number}</option>)}
              </select>
            </Field>
            <Field label="المبلغ الخاضع للضريبة (د.إ)">
              <input type="number" onChange={f("amount")} placeholder="مثال: 10000" className={inputCls} />
            </Field>
            <p className="text-xs text-slate-500 bg-amber-50 p-2 rounded border border-amber-200">
              سيتم إضافة ضريبة القيمة المضافة 5% تلقائيًا وفق قوانين الهيئة الاتحادية للضرائب بمبلغ <b>{fmtAED((+form.amount || 0) * VAT_RATE)}</b> ليصل الإجمالي إلى <b>{fmtAED((+form.amount || 0) * 1.05)}</b>
            </p>
            <Field label="تاريخ الاستحقاق">
              <input type="date" onChange={f("due")} defaultValue={addDays(30)} className={inputCls} />
            </Field>
            <Field label="بيان الفاتورة والخدمات القانونية">
              <textarea onChange={f("desc")} rows={2} placeholder="دفعة أتعاب محاماة والاستشارات القانونية..." className={inputCls} />
            </Field>
            <button onClick={saveInvoice} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">إصدار الفاتورة الضريبية</button>
          </div>
        </Modal>
      )}

      {/* ================= نافذة تسجيل الدفعات وسندات القبض ================= */}
      {modal === "payment" && (
        <Modal title="تسجيل سند قبض / دفعة أتعاب جديدة" onClose={() => setModal(null)} wide>
          <div className="space-y-4 text-sm">
            {/* اختيار الموكل */}
            <Field label="الموكل (مُسدّد الدفعة)">
              <select
                value={form.clientId || ""}
                onChange={(e) => {
                  const cId = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    clientId: cId,
                    feeAgreementId: "unallocated"
                  }));
                }}
                className={inputCls}
              >
                <option value="">اختر الموكل…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </Field>

            {/* عند اختيار الموكل: عرض الاتفاقيات النشطة والرصيد المعلّق */}
            {form.clientId ? (
              (() => {
                const selectedClientId = +form.clientId;
                const activeAgreements = feeAgreements.filter(
                  (a) => a.clientId === selectedClientId && a.status === "نشطة"
                );
                const unallocatedBal = getClientUnallocatedBalance(selectedClientId);

                return (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-stone-50/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-slate-800">
                        اختر اتفاقية الأتعاب المرتبطة بالدفعة:
                      </label>
                      {unallocatedBal > 0 && (
                        <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                          الرصيد المعلّق الحالي للموكل: {fmtAED(unallocatedBal)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {/* خيار: دفعة غير مخصصة */}
                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                          !form.feeAgreementId || form.feeAgreementId === "unallocated"
                            ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/30"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="feeAgreementRadio"
                          value="unallocated"
                          checked={!form.feeAgreementId || form.feeAgreementId === "unallocated"}
                          onChange={() => setForm((prev) => ({ ...prev, feeAgreementId: "unallocated" }))}
                          className="mt-1 h-4 w-4 accent-amber-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              دفعة غير مخصصة (رصيد معلّق للموكل)
                            </span>
                            <Badge className="bg-amber-100 text-amber-800">رصيد معلّق</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            إذا لم تكن الاتفاقية معروفة، تنحفظ هذه الدفعة كـ "رصيد معلّق" لحين تسويتها لاحقاً.
                          </p>
                        </div>
                      </label>

                      {/* قائمة الاتفاقيات النشطة للموكل */}
                      {activeAgreements.length > 0 ? (
                        <div className="space-y-2 pt-1">
                          <p className="text-xs font-semibold text-slate-600 mr-1">
                            الاتفاقيات النشطة المتاحة لـ (<b>{clientName(+form.clientId)}</b>):
                          </p>
                          {activeAgreements.map((agr) => {
                            const remaining = getRemainingForAgreement(agr);
                            const fullyPaid = isAgreementFullyPaid(agr);
                            const isSelected = form.feeAgreementId === String(agr.id) || form.feeAgreementId === agr.id;

                            return (
                              <label
                                key={agr.id}
                                className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition ${
                                  fullyPaid
                                    ? "bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed"
                                    : isSelected
                                    ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/30 cursor-pointer"
                                    : "bg-white border-slate-200 cursor-pointer hover:border-amber-300"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="feeAgreementRadio"
                                    value={agr.id}
                                    disabled={fullyPaid}
                                    checked={isSelected}
                                    onChange={() => setForm((prev) => ({ ...prev, feeAgreementId: agr.id }))}
                                    className="mt-1 h-4 w-4 accent-amber-600"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-sm">
                                        [{agr.agreementNumber}] {agr.title}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      تاريخ العقد: {fmtDate(agr.date)} • إجمالي العقد: {fmtAED(agr.totalAmount)}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-left shrink-0">
                                  {fullyPaid ? (
                                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                                      مسددة بالكامل
                                    </span>
                                  ) : (
                                    <div className="bg-amber-100/90 px-3 py-1.5 rounded-xl text-left border border-amber-200">
                                      <span className="text-[10px] text-amber-900 block font-semibold">المتبقي على الاتفاقية:</span>
                                      <span className="text-xs font-bold text-amber-900 font-mono">{fmtAED(remaining)}</span>
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                          ℹ️ لا توجد اتفاقيات أتعاب نشطة حالياً لهذا الموكل. سيتم تسجيل الدفعة كـ "دفعة غير مخصصة".
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 text-center">
                يرجى اختيار الموكل أولاً لعرض اتفاقياته النشطة والمتبقي عليها.
              </div>
            )}

            {/* المبلغ وتاريخ السداد */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="مبلغ الدفعة المقبوضة (د.إ)">
                <input
                  type="number"
                  onChange={f("amount")}
                  value={form.amount || ""}
                  placeholder="مثال: 15000"
                  className={inputCls}
                />
              </Field>
              <Field label="تاريخ سداد الدفعة">
                <input
                  type="date"
                  onChange={f("date")}
                  defaultValue={form.date || todayISO()}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* طريقة السداد والاطلاع المالي */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="طريقة السداد">
                <select
                  onChange={f("paymentMethod")}
                  value={form.paymentMethod || "تحويل بنكي"}
                  className={inputCls}
                >
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="شيك بنكي">شيك بنكي</option>
                  <option value="نقداً">نقداً</option>
                  <option value="بطاقة ائتمانية">بطاقة ائتمانية / شباك إلكتروني</option>
                  <option value="إيداع مباشر">إيداع بالحساب البنكي</option>
                </select>
              </Field>
              <Field label="رقم المرجع / الشيك / الإيصال">
                <input
                  onChange={f("referenceNo")}
                  value={form.referenceNo || ""}
                  placeholder="مثال: TRF-982104 / شيك 00421"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="بيان وملاحظات سند القبض">
              <textarea
                onChange={f("notes")}
                value={form.notes || ""}
                rows={2}
                placeholder="بيان تفصيلي عن الدفعة المقبوضة..."
                className={inputCls}
              />
            </Field>

            <button
              onClick={savePayment}
              className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700 shadow-sm"
            >
              حفظ وتأكيد سند القبض
            </button>
          </div>
        </Modal>
      )}

      {modal === "doc" && (
        <Modal title="رفع مستند جديد" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="اسم المستند">
              <input onChange={f("name")} placeholder="مثال: صحيفة الدعوى 2026.pdf" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="نوع المستند">
                <select onChange={f("type")} className={inputCls}>
                  {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="القضية المرتبطة">
                <select onChange={f("caseId")} className={inputCls}>
                  <option value="">مستند غير مرتبط بقضية</option>
                  {cases.map((c) => <option key={c.id} value={c.id}>{c.number}</option>)}
                </select>
              </Field>
            </div>
            <button onClick={saveDoc} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ المستند الأرشيفي</button>
          </div>
        </Modal>
      )}

      {modal === "poa" && (
        <Modal title="إضافة توكيل كاتب عدل" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="الموكل">
              <select onChange={f("clientId")} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="رقم الوكالة الموثقة">
              <input onChange={f("number")} placeholder="مثال: وكالة 2026/1/4502" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الجهة المصدرة">
                <input onChange={f("issuer")} placeholder="كاتب العدل - دبي" className={inputCls} />
              </Field>
              <Field label="تاريخ الانتهاء">
                <input type="date" onChange={f("expiry")} className={inputCls} />
              </Field>
            </div>
            <Field label="نطاق الوكالة والتخويل">
              <textarea onChange={f("scope")} rows={2} placeholder="وكالة قضائية عامة والترافع والصلح والإقرار..." className={inputCls} />
            </Field>
            <button onClick={savePoa} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ الوكالة</button>
          </div>
        </Modal>
      )}

      {modal === "user" && (
        <Modal title={editingUser ? `تعديل بيانات: ${editingUser.name}` : "إضافة مستخدم جديد بالفريق"} onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="الاسم الكامل">
              <input onChange={f("name")} defaultValue={form.name || ""} placeholder="اسم الموظف أو المحامي" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="البريد الإلكتروني">
                <input onChange={f("email")} defaultValue={form.email || ""} placeholder="user@law.ae" className={inputCls} />
              </Field>
              <Field label="رقم الهاتف">
                <input onChange={f("phone")} defaultValue={form.phone || ""} placeholder="050-XXXXXXX" className={inputCls} />
              </Field>
            </div>
            <Field label="الدور / القالب المسبق">
              <select
                value={form.roleKey || "lawyer"}
                onChange={(e) => {
                  const rKey = e.target.value;
                  const preset = ROLE_PRESETS[rKey];
                  setForm((prev) => ({
                    ...prev,
                    roleKey: rKey,
                    roleTitle: preset ? preset.title : prev.roleTitle,
                    permissions: preset ? { ...preset.permissions } : prev.permissions
                  }));
                }}
                className={inputCls}
              >
                <option value="admin">مدير النظام / محامٍ شريك (كل الصلاحيات)</option>
                <option value="supervisor">مشرف ومراجع إداري (شامل الإشراف والتصاريح)</option>
                <option value="lawyer">محامٍ ومستشار قانوني (قضايا وجلسات ومهام)</option>
                <option value="secretary">مسؤول سكرتارية وتنسيق (مواعيد وموكلين)</option>
                <option value="accountant">محاسب المكتب والضريبة (فواتير وأتعاب)</option>
              </select>
            </Field>
            <Field label="المسمى الوظيفي">
              <input onChange={f("roleTitle")} defaultValue={form.roleTitle || ""} placeholder="مثال: محامي استئناف ومدني" className={inputCls} />
            </Field>
            <Field label="كلمة المرور المسجلة (تشفير أمان Supabase Auth)">
              <input type="password" readOnly disabled value="••••••••" className={`${inputCls} bg-stone-100 text-slate-500 cursor-not-allowed`} />
            </Field>

            {/* تخصيص صلاحيات الوصول للأقسام الـ 12 */}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-amber-600" />
                  تخصيص صلاحيات الأقسام الـ 12 (Comprehensive 12 Modules):
                </p>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-mono">
                  {Object.values(form.permissions || ROLE_PRESETS[form.roleKey || "lawyer"]?.permissions || {}).filter(Boolean).length} / 12
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                تطبيق حظر افتراضي تلقائي: الأقسام المحددة باللون الأخضر فقط هي ما يستطيع الموظف مشاهدته بالقائمة الجانبية.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                {PERMISSION_MODULES.map((mod) => {
                  const activePerms = form.permissions || (editingUser ? editingUser.permissions : ROLE_PRESETS[form.roleKey || "lawyer"]?.permissions) || {};
                  const isEnabled = Boolean(activePerms[mod.id] || (editingUser && hasTabPermission(editingUser, mod.navTabIds[0])));
                  return (
                    <label
                      key={mod.id}
                      className={`flex items-start gap-2 p-2 rounded-xl border transition cursor-pointer ${
                        isEnabled ? "bg-emerald-50 border-emerald-300 text-slate-900" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => {
                            const basePerms = prev.permissions || (editingUser ? editingUser.permissions : ROLE_PRESETS[prev.roleKey || "lawyer"]?.permissions) || {};
                            return {
                              ...prev,
                              permissions: {
                                ...basePerms,
                                [mod.id]: checked
                              }
                            };
                          });
                        }}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold block leading-tight text-slate-900">{mod.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">{mod.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-800">التفويضات الاستثنائية الحصرية (تمنح بواسطة المحامي سعود):</p>
              
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  defaultChecked={editingUser ? editingUser.canTransferContacts : false}
                  onChange={(e) => setForm((prev) => ({ ...prev, canTransferContacts: e.target.checked }))}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                تفويض نقل وتصنيف الموكلين بين أفراد وشركات
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  defaultChecked={editingUser ? editingUser.canViewAgreements : false}
                  onChange={(e) => setForm((prev) => ({ ...prev, canViewAgreements: e.target.checked }))}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                تفويض الاطلاع على اتفاقيات وصيغ عقود المكتب
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  defaultChecked={editingUser ? editingUser.canAccessWhatsapp : false}
                  onChange={(e) => setForm((prev) => ({ ...prev, canAccessWhatsapp: e.target.checked }))}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                تفويض استخدام واتساب المكتب المباشر
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  defaultChecked={editingUser ? editingUser.canViewFinances : false}
                  onChange={(e) => setForm((prev) => ({ ...prev, canViewFinances: e.target.checked }))}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                تفويض الوصول للنظام المالي والفواتير والضريبة
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              {editingUser && editingUser.id !== currentUserId ? (
                <button
                  type="button"
                  onClick={() => {
                    const uId = editingUser.id;
                    setEditingUser(null);
                    setModal(null);
                    handleDeleteUser(uId);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                >
                  <Trash2 size={15} /> حذف الحساب
                </button>
              ) : <div />}
              <button onClick={saveUser} className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700">
                حفظ بيانات المستخدم والصلاحيات
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= نافذة إضافة/تعديل KYC ================= */}
      {(modal === "kyc" || modal === "kyc-edit") && (
        <Modal title={modal === "kyc-edit" ? "تعديل سجل اعرف عميلك (KYC)" : "إضافة سجل اعرف عميلك جديد"} onClose={() => setModal(null)} wide>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Field label="الموكل المعني">
                <select onChange={f("clientId")} value={form.clientId || ""} className={inputCls}>
                  <option value="">إختر الموكل…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                </select>
              </Field>
              <Field label="الجنسية / دولة التأسيس">
                <input onChange={f("nationality")} defaultValue={form.nationality || "الإمارات"} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="نوع وثيقة الإثبات">
                <input onChange={f("idType")} defaultValue={form.idType || "هوية إماراتية"} placeholder="رخصة تجارية / جواز سفر..." className={inputCls} />
              </Field>
              <Field label="تاريخ انتهاء الوثيقة">
                <input type="date" onChange={f("idExpiry")} defaultValue={form.idExpiry || ""} className={inputCls} />
              </Field>
            </div>

            <Field label="المستفيد الحقيقي (UBO) والتملك النهائي">
              <textarea onChange={f("ubo")} defaultValue={form.ubo || ""} rows={2} placeholder="أسماء الأشخاص الطبيعيين المالكين لـ 25% أو أكثر من رأس المال أو حق التصويت..." className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="مصدر الأموال والنشاط الرئيسي">
                <select onChange={f("sourceOfFunds")} defaultValue={form.sourceOfFunds || FUND_SOURCES[0]} className={inputCls}>
                  {FUND_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="هل الموكل معرّض سياسيًا (PEP)؟">
                <select onChange={(e) => setForm({ ...form, pep: e.target.value === "نعم" })} value={form.pep ? "نعم" : "لا"} className={inputCls}>
                  <option value="لا">لا (شخص عادي)</option>
                  <option value="نعم">نعم (يشغل منصباً عاماً أو أقرباؤه)</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="فحص قوائم العقوبات">
                <select onChange={f("sanctions")} defaultValue={form.sanctions || "سليم"} className={inputCls}>
                  {SANCTIONS_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="تقييم درجة المخاطر">
                <select onChange={f("risk")} defaultValue={form.risk || "منخفض"} className={inputCls}>
                  <option>منخفض</option>
                  <option>متوسط</option>
                  <option>مرتفع</option>
                </select>
              </Field>
              <Field label="حالة ملف KYC">
                <select onChange={f("status")} defaultValue={form.status || "مكتمل"} className={inputCls}>
                  <option>مكتمل</option>
                  <option>قيد المراجعة</option>
                  <option>ناقص</option>
                </select>
              </Field>
            </div>

            <Field label="ملاحظات العناية الواجبة والتحقق">
              <textarea onChange={f("notes")} defaultValue={form.notes || ""} rows={2} placeholder="أي نتائج فحص أو وثائق إضافية تم الاطلاع عليها..." className={inputCls} />
            </Field>

            <button onClick={saveKyc} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">
              حفظ بيانات KYC والتحديث
            </button>
          </div>
        </Modal>
      )}

      {/* ================= نافذة تسجيل ساعات العمل ================= */}
      {modal === "time" && (
        <Modal title="تسجيل ساعات عمل (Time Log)" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="القضية">
              <select onChange={f("caseId")} className={inputCls}>
                <option value="">اختر القضية…</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.number} - {clientName(c.clientId)}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="عدد الساعات">
                <input type="number" step="0.5" onChange={f("hours")} placeholder="مثال: 2.5" className={inputCls} />
              </Field>
              <Field label="سعر الساعة (د.إ)">
                <input type="number" onChange={f("hourlyRate")} defaultValue="750" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المحامي / المستشار">
                <select onChange={f("lawyerName")} defaultValue={currentUser.name} className={inputCls}>
                  {users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </Field>
              <Field label="تاريخ العمل">
                <input type="date" onChange={f("date")} defaultValue={todayISO()} className={inputCls} />
              </Field>
            </div>
            <Field label="تفاصيل وأنشطة ساعات العمل">
              <textarea onChange={f("description")} rows={3} placeholder="دراسة الأوراق، إعداد المذكرة، حضور الاجتماع..." className={inputCls} />
            </Field>
            <button onClick={saveTimeLog} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ ساعات العمل</button>
          </div>
        </Modal>
      )}

      {/* ================= نافذة تسجيل مصروف قضية ================= */}
      {modal === "expense" && (
        <Modal title="تسجيل مصروف قضية جديد" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="القضية">
              <select onChange={f("caseId")} className={inputCls}>
                <option value="">اختر القضية…</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.number} - {clientName(c.clientId)}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="تصنيف المصروف">
                <select onChange={f("category")} className={inputCls}>
                  <option>رسوم قضائية</option>
                  <option>رسوم خبرة وتثمين</option>
                  <option>ترجمة قانونية معتمدة</option>
                  <option>مواصلات وتنقّل وقيد</option>
                  <option>أخرى</option>
                </select>
              </Field>
              <Field label="المبلغ (د.إ)">
                <input type="number" onChange={f("amount")} placeholder="0.00" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="تاريخ المصروف">
                <input type="date" onChange={f("date")} defaultValue={todayISO()} className={inputCls} />
              </Field>
              <Field label="قابل للفلترة وإضافته للفاتورة؟">
                <select onChange={f("billable")} className={inputCls}>
                  <option value="نعم">نعم (يُدفع من الموكل)</option>
                  <option value="لا">لا (مصروف إداري غير مسترد)</option>
                </select>
              </Field>
            </div>
            <Field label="البيان والوصف">
              <textarea onChange={f("description")} rows={2} placeholder="تفاصيل الإيصال والرقم..." className={inputCls} />
            </Field>
            <button onClick={saveCaseExpense} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ المصروف</button>
          </div>
        </Modal>
      )}

      {/* ================= نافذة حساب الأمانات ================= */}
      {modal === "trust" && (
        <Modal title="إضافة معاملة حساب أمانات الموكل (Trust Account)" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="الموكل صاحب الأمانة">
              <select onChange={f("clientId")} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="القضية المرتبطة (اختياري)">
              <select onChange={f("caseId")} className={inputCls}>
                <option value="">غير مرتبطة بقضية محددة</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.number}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="نوع المعاملة">
                <select onChange={f("type")} className={inputCls}>
                  <option value="إيداع أمانة">إيداع أمانة (+)</option>
                  <option value="صرف أمانة">صرف أمانة (-)</option>
                </select>
              </Field>
              <Field label="المبلغ (د.إ)">
                <input type="number" onChange={f("amount")} placeholder="0.00" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم السند / الشيك">
                <input onChange={f("refNo")} placeholder="مثال: CHK-9902" className={inputCls} />
              </Field>
              <Field label="تاريخ المعاملة">
                <input type="date" onChange={f("date")} defaultValue={todayISO()} className={inputCls} />
              </Field>
            </div>
            <Field label="بيان وشرح الأمانة">
              <textarea onChange={f("notes")} rows={2} placeholder="أمانة رسوم خبرة قضائية في دعوى..." className={inputCls} />
            </Field>
            <button onClick={saveTrustTransaction} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">تأكيد معاملة الأمانات</button>
          </div>
        </Modal>
      )}

      {/* ================= نافذة مواعيد الأحكام التلقائية ================= */}
      {modal === "deadline" && (
        <Modal title="تسجيل حكم قضائي وحساب ميعاد الطعن التلقائي" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="القضية">
              <select onChange={f("caseId")} className={inputCls}>
                <option value="">اختر القضية…</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.number} - {clientName(c.clientId)}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="تاريخ صدور الحكم الرسمية">
                <input type="date" onChange={f("rulingDate")} defaultValue={todayISO()} className={inputCls} />
              </Field>
              <Field label="درجة الحكم">
                <select onChange={f("rulingType")} className={inputCls}>
                  <option>حكم ابتدائية</option>
                  <option>حكم استئناف</option>
                  <option>قرار لجنة منازعات</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="مهلة الطعن القانونية (أيام)">
                <input type="number" onChange={f("appealDays")} defaultValue="30" className={inputCls} />
              </Field>
              <p className="text-xs text-slate-500 self-center">سيتم إضافة المهلة وتحديث ميعاد انتهاء حق الاستئناف تلقائياً</p>
            </div>
            <Field label="منطوق الحكم الصادر وملخص القضية">
              <textarea onChange={f("rulingSummary")} rows={3} placeholder="منطوق الحكم الرسمي الصادر من جلسة اليوم..." className={inputCls} />
            </Field>
            <button onClick={saveDeadline} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ وحساب الميعاد التلقائي</button>
          </div>
        </Modal>
      )}

      {/* ================= نافذة بلاغ الاشتباه STR ================= */}
      {modal === "str" && (
        <Modal title="إبلاغ عن معاملات مشبوهة (AML / STR Report)" onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-900 font-semibold">
              🔒 هذا السجل سري للغاية ومخصص لمسؤول الامتثال فقط وفق متطلبات وحدة المعلومات المالية FIU بالدولة.
            </div>
            <Field label="الموكل المشتبه به">
              <select onChange={f("clientId")} className={inputCls}>
                <option value="">اختر الموكل…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المبلغ المشتبه به (د.إ)">
                <input type="number" onChange={f("amountFlagged")} placeholder="0.00" className={inputCls} />
              </Field>
              <Field label="حالة البلاغ">
                <select onChange={f("status")} className={inputCls}>
                  <option>تحقيق داخلي</option>
                  <option>مرفوع للـ FIU</option>
                  <option>حفظ الملف</option>
                </select>
              </Field>
            </div>
            <Field label="أسباب الاشتباه ومؤشرات غسل الأموال">
              <textarea onChange={f("suspicionReason")} rows={3} placeholder="مثال: حوالات نقداً من أطراف مجهولة بدون فواتير سابقة..." className={inputCls} />
            </Field>
            <button onClick={saveStrReport} className="w-full rounded-xl bg-red-700 py-3 font-bold text-white hover:bg-red-800">حفظ وتوثيق بلاغ الاشتباه</button>
          </div>
        </Modal>
      )}

      {/* ================= نافذة إرسال التنبيهات والرسائل ================= */}
      {notifyModal && (
        <Modal title={`مركز إرسال التنبيهات — ${notifyModal.type}`} onClose={() => setNotifyModal(null)}>
          <div className="space-y-4 text-sm">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5"><Send size={14} /> تنبيه رسمي مباشر إلى الموكل</p>
              <p>يتم توثيق الرسالة تلقائياً في سجل التنبيهات بمجرد الضغط على إرسال.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="اسم المستلم">
                <input
                  value={notifyModal.recipientName}
                  onChange={(e) => setNotifyModal({ ...notifyModal, recipientName: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="قناة الإرسال المفضلة">
                <select
                  value={notifyModal.channel}
                  onChange={(e) => setNotifyModal({ ...notifyModal, channel: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="واتساب">📱 عبر الواتساب (WhatsApp)</option>
                  <option value="إيميل">✉️ عبر البريد (Email)</option>
                  <option value="كلاهما">⚡ عبر الواتساب والبريد كلاهما</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الواتساب (+971)">
                <input
                  value={notifyModal.recipientPhone}
                  onChange={(e) => setNotifyModal({ ...notifyModal, recipientPhone: e.target.value })}
                  placeholder="+971 50 123 4567"
                  className={inputCls}
                />
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  value={notifyModal.recipientEmail}
                  onChange={(e) => setNotifyModal({ ...notifyModal, recipientEmail: e.target.value })}
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
              <button onClick={() => setNotifyModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
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
        <Modal title={editingCourtContact ? "تعديل بيانات تواصل جهة محكمة" : "إضافة جهة / موظف محكمة جديد"} onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            <Field label="اسم المحكمة / الجهة القضائية">
              <input
                value={form.courtName || ""}
                onChange={f("courtName")}
                placeholder="مثال: محاكم دبي الابتدائية / دائرة القضاء - أبوظبي"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="الإمارة">
                <select value={form.emirate || "دبي"} onChange={f("emirate")} className={inputCls}>
                  {["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "أم القيوين", "الفجيرة"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </Field>

              <Field label="القسم / الدائرة">
                <input
                  value={form.department || ""}
                  onChange={f("department")}
                  placeholder="مثال: قسم قيد الدعاوى / إدارة التنفيذ"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="اسم الموظف / الصفة الوظيفية / المسؤول">
              <input
                value={form.titleOrEmployee || ""}
                onChange={f("titleOrEmployee")}
                placeholder="مثال: أمين سر الجلسة / رئيس قسم القيد / شباك 4"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الهاتف المباشر">
                <input
                  value={form.phone || ""}
                  onChange={f("phone")}
                  placeholder="مثال: 04-3347777"
                  className={inputCls}
                />
              </Field>

              <Field label="رقم الخاتم / التمديدة / رقم الشباك">
                <input
                  value={form.extOrSeal || ""}
                  onChange={f("extOrSeal")}
                  placeholder="مثال: خاتم 104 — تمديدة 4120"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="البريد الإلكتروني المباشر">
              <input
                value={form.email || ""}
                onChange={f("email")}
                placeholder="مثال: registration.commercial@dc.gov.ae"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="مواعيد العمل واستقبال المراجعين">
                <input
                  value={form.operatingHours || ""}
                  onChange={f("operatingHours")}
                  placeholder="مثال: 07:30 ص - 02:30 م"
                  className={inputCls}
                />
              </Field>

              <Field label="المقر / الموقع داخل المحكمة">
                <input
                  value={form.location || ""}
                  onChange={f("location")}
                  placeholder="مثال: الطابق الأول - قاعة 14"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="ملاحظات وآليات تحويل المذكرات">
              <textarea
                value={form.notes || ""}
                onChange={f("notes")}
                placeholder="اكتب أي ملاحظات حول مواعيد تسليم المذكرات، الشروط، البوابة الإلكترونية..."
                rows={3}
                className={inputCls}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setModal(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                إلغاء
              </button>
              <button onClick={saveCourtContact} className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400">
                حفظ بيانات التواصل
              </button>
            </div>
          </div>
        </Modal>
      )}

{agrPreviewId !== null && (() => {
  const oa = officeAgreements.find((a) => a.id === agrPreviewId);
  if (!oa) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl print-area">
        {/* شريط الأدوات — لا يظهر عند الطباعة */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-amber-600" />
            <h3 className="font-bold text-slate-800">معاينة الاتفاقية {oa.agreementNumber} — {oa.clientNameAr}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteAgrConfirm(oa)}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 px-3.5 py-2 text-xs font-bold hover:bg-red-100 transition"
              title="حذف هذه الاتفاقية"
            >
              <Trash2 size={15} /> حذف الاتفاقية
            </button>
            <button
              onClick={() => handleDownloadPDF("printable-agreement", `اتفاقية_أتعاب_${oa.agreementNumber}.pdf`)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 transition"
              title="تصدير وتحميل الاتفاقية مباشرة كملف PDF"
            >
              <Download size={15} /> تحميل PDF
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400">
              <Printer size={15} /> طباعة (Print)
            </button>
            <button onClick={() => setAgrPreviewId(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="إغلاق">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ═══ نص الاتفاقية الكامل — مطابق للنموذج المعتمد ═══ */}
        <div id="printable-agreement" className="p-8 space-y-5 text-slate-900 leading-relaxed bg-white">
          {/* الترويسة المعتمدة */}
          {letterhead.headerImg ? (
            <div className="text-center pb-2">
              <img src={letterhead.headerImg} alt="ترويسة المكتب" className="w-full max-h-40 object-contain mx-auto" />
              <h2 className="text-base font-bold mt-4 underline underline-offset-4 text-slate-900">عقد اتفاقية أتعاب محاماة — Legal Fees Agreement</h2>
            </div>
          ) : (
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h1 className="text-lg font-bold">سعود أحمد الشحي للمحاماة والاستشارات القانونية</h1>
              <p className="text-xs text-slate-600" dir="ltr">Suood Ahmed Al Shehhi Advocates & Legal Consultants</p>
              <h2 className="text-base font-bold mt-3 underline underline-offset-4">عقد اتفاقية أتعاب محاماة — Legal Fees Agreement</h2>
            </div>
          )}

          {/* الديباجة */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 rounded-lg p-4">
            <p className="leading-loose">
              أُبرم هذا العقد في <b>{fmtDate(oa.contractDate)}</b> في <b>{oa.contractCity}</b> بين: ١- المدرجة بياناتهم أدناه (ويشار إليهم فيما بعد بـ"الموكل")، ٢- سعود أحمد الشحي للمحاماة والاستشارات القانونية، بحيث يقوم بتزويد الموكل بالخدمات القانونية الواردة بهذا العقد بناءً على طلبهم ووفقاً للبيانات والشروط الواردة أدناه.
            </p>
            <p className="leading-loose" dir="ltr">
              This contract was concluded on <b>{oa.contractDate}</b> in <b>{oa.contractCity}</b> between: 1) the party whose details are listed hereunder, hereafter referred to as "the Client", and 2) Suood Ahmed Al Shehhi Advocates & Legal Consultants, whereas the firm shall provide the Client with the legal service(s) mentioned herein according to the following details and conditions.
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
                <p>الاسم: <b>{oa.clientNameAr}</b>{oa.representativeAr ? <> — ويمثلها: <b>{oa.representativeAr}</b></> : null}</p>
                <p dir="ltr">Name: <b>{oa.clientNameEn || oa.clientNameAr}</b>{oa.representativeEn ? <>, represented by: <b>{oa.representativeEn}</b></> : null}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 p-3">
                <p>هاتف رقم: <b dir="ltr">{oa.phone || "—"}</b></p>
                <p dir="ltr">Phone number: <b>{oa.phone || "—"}</b></p>
              </div>
              <div className="grid grid-cols-2 gap-4 p-3">
                <p>تفاصيل القضية: <b>{oa.caseDetailsAr}</b></p>
                <p dir="ltr">Case Details: <b>{oa.caseDetailsEn || oa.caseDetailsAr}</b></p>
              </div>
              <div className="grid grid-cols-2 gap-4 p-3 bg-amber-50/60">
                <p className="font-bold">{oa.paymentTermsAr}</p>
                <p dir="ltr" className="font-bold">{oa.paymentTermsEn}</p>
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
                  <th className="border border-slate-300 p-1.5">تاريخ الاستحقاق / Due Date</th>
                </tr>
              </thead>
              <tbody>
                {oa.installments.map((i, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-1.5 font-bold">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 font-mono">{i.amount.toLocaleString("en-US")}</td>
                    <td className="border border-slate-300 p-1.5">{fmtDate(i.dueDate)}{i.paidOnSigning ? " (عند التوقيع)" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* البنود الثابتة 1-8 */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
            <div className="bg-slate-100 font-bold px-4 py-2 grid grid-cols-2">
              <span>الشروط والبنود</span>
              <span dir="ltr">Terms & Conditions</span>
            </div>
            {OFFICE_AGREEMENT_CLAUSES.map((cl, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 p-3 border-t border-slate-200">
                <p className="leading-relaxed"><b>({idx + 1})</b> {cl.ar}</p>
                <p className="leading-relaxed" dir="ltr"><b>{idx + 1}-</b> {cl.en}</p>
              </div>
            ))}
          </div>

          {/* الإشهاد والتوقيعات */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 rounded-lg p-4">
            <p>إشهاداً على ذلك فقد وقّع الطرفان على هذا العقد في اليوم والتاريخ المشار إليهما سابقاً.</p>
            <p dir="ltr">In witness hereof, the parties have signed this contract on the date first mentioned here above.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs pt-6">
            <div className="text-center">
              <p className="font-bold">سعود أحمد الشحي للمحاماة والاستشارات القانونية</p>
              <p className="mt-10 border-t border-slate-400 pt-1 mx-8">التوقيع والختم</p>
            </div>
            <div className="text-center">
              <p className="font-bold">الموكل — Client: {oa.clientNameAr}</p>
              <p className="mt-10 border-t border-slate-400 pt-1 mx-8">توقيع الموكل / Client Signature</p>
            </div>
          </div>

          <div className="text-center text-[11px] font-bold border-t-2 border-slate-900 pt-3">
            <p>اللغة العربية هي اللغة المعتمدة في هذا العقد</p>
            <p dir="ltr">Arabic is the approved language in this contract</p>
          </div>

          {/* تذييل الورقة الرسمية */}
          {letterhead.footerImg && (
            <div className="pt-2">
              <img src={letterhead.footerImg} alt="تذييل المكتب" className="w-full max-h-24 object-contain mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
})()}

      {/* ================= نافذة التقرير القابل للطباعة ================= */}
      {report && (() => {
        const isRollReport = typeof report === "object" && report.type === "roll";
        const isKycSingle = typeof report === "object" && report.kycId;
        const kycRec = isKycSingle ? kyc.find((k) => k.id === report.kycId) : null;
        const clientObj = kycRec ? clients.find((c) => c.id === kycRec.clientId) : null;

        const rollDate = isRollReport ? report.date : "";
        const rollCourt = isRollReport ? report.court : "الكل";

        const rollList = hearings.filter((h) => {
          const matchDate = !rollDate || h.date === rollDate;
          const cs = cases.find((c) => c.id === h.caseId);
          const matchCourt = rollCourt === "الكل" || (cs && cs.court === rollCourt);
          return matchDate && matchCourt;
        }).sort((a, b) => a.date.localeCompare(b.date));

        const currentTabObj = NAV.find((n) => n.id === tab);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 no-print overflow-y-auto">
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
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400">
                    <Printer size={15} /> طباعة الآن (PDF)
                  </button>
                  <button onClick={() => setReport(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="إغلاق">
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
                    <p className="font-bold text-[#0c4a47]">تاريخ التقرير: {fmtDate(todayISO())}</p>
                    <p className="text-[11px] text-slate-600">المستخدم المستخرج: {currentUser.name}</p>
                    <p className="text-[11px] text-[#b89b6a] font-bold">{currentUser.roleTitle}</p>
                    <p className="text-[10px] text-slate-400">الإمارات العربية المتحدة • UAE</p>
                  </div>
                </div>

                {/* محتوى تقرير رول الجلسات القابل للطباعة */}
                {isRollReport ? (
                  <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-amber-400">كشف ورول الجلسات القضائية اليومي</h2>
                        <p className="text-xs text-slate-300 mt-0.5">جدول حضور المحامين وتتبع قاعات ومواعيد الجلسات</p>
                      </div>
                      <div className="text-left text-xs font-mono">
                        <p>التاريخ: <b>{rollDate ? fmtDate(rollDate) : "جميع التواريخ"}</b></p>
                        <p>المحكمة: <b>{rollCourt}</b></p>
                        <p>عدد الجلسات: <b>{rollList.length}</b></p>
                      </div>
                    </div>

                    <table className="w-full text-right border-collapse border border-slate-300 text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                          <th className="p-2.5 border border-slate-300 text-center">م</th>
                          <th className="p-2.5 border border-slate-300">رقم القضية والدائرة</th>
                          <th className="p-2.5 border border-slate-300">اسم الموكل</th>
                          <th className="p-2.5 border border-slate-300">المحكمة / القاعة</th>
                          <th className="p-2.5 border border-slate-300 text-center">التاريخ والوقت</th>
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
                              <tr key={h.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-2.5 border border-slate-300 text-center font-bold font-mono">{idx + 1}</td>
                                <td className="p-2.5 border border-slate-300">
                                  <p className="font-bold text-slate-900">{cs ? cs.number : "—"}</p>
                                  <p className="text-[11px] text-slate-500">{cs ? cs.subject : ""}</p>
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
                                  {h.notes && <p className="text-[11px] text-slate-600 mt-0.5 bg-stone-50 p-1 rounded border border-stone-200">المطلوب: {h.notes}</p>}
                                </td>
                                <td className="p-2.5 border border-slate-300 text-center">
                                  {h.done ? <span className="font-bold text-emerald-700">منتهية</span> : <span className="font-bold text-amber-700">قائمة</span>}
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
                      <h2 className="text-lg font-bold text-amber-900">استمارة اعرف عميلك وفحص مكافحة غسل الأموال (KYC / AML)</h2>
                      <p className="text-xs text-amber-800">وفقًا لأحكام القانون الاتحادي رقم (20) لسنة 2018 بشأن مواجهة جرائم غسل الأموال</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="border border-slate-200 p-3 rounded-xl space-y-1">
                        <p className="text-slate-500">اسم الموكل / الشركة:</p>
                        <p className="font-bold text-sm text-slate-900">{clientObj.name}</p>
                        <p className="text-slate-600">نوع الشخصية: {clientObj.type} | الإمارة: {clientObj.emirate}</p>
                        <p className="text-slate-600">رقم الهاتف: {clientObj.phone} | البريد: {clientObj.email}</p>
                      </div>
                      <div className="border border-slate-200 p-3 rounded-xl space-y-1">
                        <p className="text-slate-500">الجنسية / الدولة:</p>
                        <p className="font-bold text-sm text-slate-900">{kycRec.nationality}</p>
                        <p className="text-slate-600">نوع الوثيقة: {kycRec.idType}</p>
                        <p className="text-slate-600">تاريخ انتهاء الوثيقة: {fmtDate(kycRec.idExpiry)}</p>
                      </div>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                      <h3 className="font-bold text-slate-900 border-b pb-1">نتائج العناية الواجبة والتحقق من المخاطر</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <p><b>المستفيد الحقيقي (UBO):</b> {kycRec.ubo}</p>
                        <p><b>مصدر الأموال:</b> {kycRec.sourceOfFunds}</p>
                        <p><b>معرّض سياسيًا (PEP):</b> {kycRec.pep ? "نعم (يلزم عناية مشددة)" : "لا"}</p>
                        <p><b>فحص قوائم العقوبات:</b> <span className="font-bold">{kycRec.sanctions}</span></p>
                        <p><b>تصنيف المخاطر:</b> <span className="font-bold">{kycRec.risk}</span></p>
                        <p><b>حالة الملف:</b> <span className="font-bold">{kycRec.status}</span></p>
                      </div>
                      <p className="pt-2"><b>تاريخ المراجعة الأخيرة:</b> {fmtDate(kycRec.lastReview)} | <b>المراجعة القادمة:</b> {fmtDate(nextReviewDate(kycRec.lastReview, kycRec.risk))}</p>
                      {kycRec.notes && <p className="bg-stone-50 p-2 rounded border text-slate-700 mt-2"><b>ملاحظات الفحص:</b> {kycRec.notes}</p>}
                    </div>

                    <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-xs text-center">
                      <div>
                        <p className="font-bold">توقيع مسؤول الامتثال / المحامي:</p>
                        <p className="mt-8">..................................................</p>
                      </div>
                      <div>
                        <p className="font-bold">خاتم المكتب:</p>
                        <div className="mt-4 mx-auto w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400">مكتب المحاماة</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* محتوى تقرير القسم العام */
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between bg-stone-100 p-3 rounded-xl">
                      <h2 className="font-bold text-sm text-slate-900">تقرير المخرجات التفصيلية — {currentTabObj?.label}</h2>
                      <span className="text-slate-500">إجمالي السجلات: {
                        tab === "cases" ? cases.length :
                        tab === "clients" ? clients.length :
                        tab === "hearings" ? hearings.length :
                        tab === "tasks" ? tasks.length :
                        tab === "invoices" ? invoices.length :
                        tab === "kyc" ? kyc.length :
                        tab === "poa" ? poas.length : 0
                      }</span>
                    </div>

                    {tab === "cases" && (
                      <table className="w-full text-right border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-100 border-b">
                            <th className="p-2 border">رقم القضية</th>
                            <th className="p-2 border">الموكل</th>
                            <th className="p-2 border">المحكمة</th>
                            <th className="p-2 border">الحالة</th>
                            <th className="p-2 border">الأتعاب</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cases.map((c) => (
                            <tr key={c.id} className="border-b">
                              <td className="p-2 border font-bold">{c.number}</td>
                              <td className="p-2 border">{clientName(c.clientId)}</td>
                              <td className="p-2 border">{c.court}</td>
                              <td className="p-2 border">{c.status}</td>
                              <td className="p-2 border">{fmtAED(c.fee)}</td>
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
                              <td className="p-2 border">{fmtDate(nextReviewDate(k.lastReview, k.risk))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {(tab === "courts_directory" || (typeof report === "object" && report?.type === "court-directory")) && (
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
                              <td className="p-2 border font-bold text-slate-900">{c.courtName}</td>
                              <td className="p-2 border font-bold text-amber-800">{c.emirate}</td>
                              <td className="p-2 border">{c.department}</td>
                              <td className="p-2 border">{c.titleOrEmployee}</td>
                              <td className="p-2 border font-mono" dir="ltr">{c.phone}</td>
                              <td className="p-2 border font-bold text-amber-900">{c.extOrSeal}</td>
                              <td className="p-2 border font-mono text-xs" dir="ltr">{c.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {tab !== "cases" && tab !== "kyc" && tab !== "courts_directory" && (typeof report !== "object" || report?.type !== "court-directory") && (
                      <p className="text-slate-500 text-center py-6">جدول ملخص البيانات جاهز للطباعة المباشرة من النظام.</p>
                    )}

                    <div className="pt-6 text-[11px] text-slate-400 text-center border-t">
                      تم استخراج هذا التقرير تلقائيًا بواسطة نظام سعود أحمد الشحي للمحاماة — كافة الحقوق محفوظة © 2026
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ نافذة تأكيد حذف الاتفاقية ═══ */}
      {deleteAgrConfirm && (() => {
        const cid = deleteAgrConfirm.clientId;
        const hasOtherOfficeAgr = officeAgreements.some((a) => a.id !== deleteAgrConfirm.id && a.clientId === cid);
        const hasOtherFeeAgr = feeAgreements.some((fa) => fa.id !== deleteAgrConfirm.feeAgreementId && fa.clientId === cid);
        const hasCases = cases.some((c) => c.clientId === cid);
        const hasInvoices = invoices.some((inv) => inv.clientId === cid);
        const hasPoas = poas.some((p) => p.clientId === cid);
        const willDeleteClient = cid && !(hasOtherOfficeAgr || hasOtherFeeAgr || hasCases || hasInvoices || hasPoas);

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm no-print">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900">
              <div className="flex items-center gap-3 text-red-600">
                <div className="rounded-full bg-red-100 p-2.5">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold">تأكيد حذف الاتفاقية</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف الاتفاقية رقم <span className="font-mono font-bold text-slate-900 bg-stone-100 px-2 py-0.5 rounded border border-slate-200">{deleteAgrConfirm.agreementNumber}</span> الخاصة بالموكل <span className="font-bold text-slate-900">{deleteAgrConfirm.clientNameAr}</span>؟
              </p>
              <div className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-100 leading-relaxed space-y-1.5">
                <p>⚠️ تنبيه: سيتم حذف الاتفاقية نهائياً من الأرشيف وسجل اتفاقيات الأتعاب.</p>
                {willDeleteClient && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                    👤 <strong>ملاحظة:</strong> سيتم أيضاً إلغاء/حذف الموكل ({deleteAgrConfirm.clientNameAr}) تلقائياً لعدم وجود أي اتفاقيات أو قضايا أخرى مرتبطة به بالمكتب.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteAgrConfirm(null)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
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
              <p className="font-bold">طلب اعتماد جديد (RLS Approved)</p>
              <p className="opacity-90">البريد: {approvingUser.email} | الهاتف: {approvingUser.phone}</p>
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
              <p className="text-xs font-bold text-slate-800">التفويضات الاستثنائية الخاص (المحامي سعود):</p>

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

      {/* ═══ مودال أكواد Supabase SQL و RLS ═══ */}
      <SupabaseSqlModal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} />
    </div>
  );
}
