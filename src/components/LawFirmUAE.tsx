import React, { useState, useMemo } from "react";
import {
  Scale, LayoutDashboard, Briefcase, Users, CalendarDays, ListChecks,
  Receipt, FolderOpen, FileSignature, Plus, Search, X, Bell, Building2,
  Gavel, Clock, AlertTriangle, CheckCircle2, ChevronLeft, Trash2, Printer,
  Phone, Mail, MapPin, TrendingUp, ShieldCheck, Lock, UserCheck, Key,
  Check, Minus, Info, UserPlus, ShieldAlert, Edit2, User
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";

/* ============================================================
   نظام إدارة مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية
   الإمارات العربية المتحدة — المكون التفاعلي الرئيسي مع إدارة المستخدمين
   ============================================================ */

const COURTS = [
  "محاكم دبي", "دائرة القضاء - أبوظبي", "محاكم رأس الخيمة",
  "محكمة الشارقة الاتحادية", "محكمة عجمان الاتحادية",
  "المحكمة الاتحادية العليا", "محاكم مركز دبي المالي العالمي DIFC",
  "مركز فض المنازعات الإيجارية - دبي"
];
const CASE_TYPES = ["تجاري", "مدني", "عمالي", "جزائي", "أحوال شخصية", "إيجاري", "عقاري", "إداري", "تنفيذ"];
const CASE_STATUS = ["قيد النظر", "متداولة", "محجوزة للحكم", "صدر الحكم", "استئناف", "تمييز/نقض", "تنفيذ", "مغلقة"];
const HEARING_TYPES = ["جلسة مرافعة", "جلسة إدارة دعوى", "جلسة خبرة", "جلسة نطق بالحكم", "جلسة تنفيذ", "جلسة صلح"];
const TASK_PRIORITY: Record<string, string> = { "عالية": "bg-red-100 text-red-700", "متوسطة": "bg-amber-100 text-amber-700", "منخفضة": "bg-emerald-100 text-emerald-700" };
const DOC_TYPES = ["صحيفة دعوى", "مذكرة جوابية", "مذكرة دفاع", "حكم", "عقد", "وكالة", "تقرير خبرة", "إنذار عدلي", "لائحة استئناف", "مستند إثبات"];
const VAT_RATE = 0.05;

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };

export interface RolePermissions {
  manageCases: boolean;
  deleteCases: boolean;
  manageHearings: boolean;
  manageTasks: boolean;
  viewInvoices: boolean;
  manageInvoices: boolean;
  manageClients: boolean;
  manageDocs: boolean;
  manageUsers: boolean;
  viewReports: boolean;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
  roleKey: "admin" | "lawyer" | "secretary" | "accountant";
  status: "نشط" | "معطل";
  avatarBg: string;
  avatarText: string;
  permissions: RolePermissions;
}

interface Client {
  id: number;
  name: string;
  type: string;
  idNo: string;
  phone: string;
  email: string;
  emirate: string;
  address: string;
}

interface CaseItem {
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

interface Hearing {
  id: number;
  caseId: number;
  date: string;
  time: string;
  type: string;
  room: string;
  notes: string;
  done: boolean;
}

interface TaskItem {
  id: number;
  title: string;
  caseId: number | null;
  assignee: string;
  due: string;
  priority: "عالية" | "متوسطة" | "منخفضة";
  done: boolean;
}

interface Invoice {
  id: number;
  number: string;
  clientId: number;
  caseId: number | null;
  date: string;
  due: string;
  amount: number;
  status: string;
  desc: string;
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

const ROLE_PRESETS: Record<string, { title: string; permissions: RolePermissions }> = {
  admin: {
    title: "محامٍ شريك / مدير النظام",
    permissions: {
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
  lawyer: {
    title: "محامٍ ومستشار قانوني",
    permissions: {
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
  manageCases: { label: "إدارة القضايا", desc: "قيد وتحديث القضايا وتغيير حالاتها" },
  deleteCases: { label: "حذف القضايا والملفات", desc: "صلاحية الحذف النهائي للملفات" },
  manageHearings: { label: "جدولة الجلسات", desc: "إضافة وتعديل مواعيد وقاعات الجلسات" },
  manageTasks: { label: "إدارة المهام", desc: "إنشاء وتعيين متابعة أداء المهام" },
  viewInvoices: { label: "عرض الفواتير", desc: "الاطلاع على أتعاب القضايا والتحصيلات" },
  manageInvoices: { label: "إصدار الفواتير", desc: "إنشاء وتعديل سندات القبض والضريبة" },
  manageClients: { label: "إدارة الموكلين", desc: "إضافة وتعديل بيانات الموكلين" },
  manageDocs: { label: "المستندات والوكالات", desc: "رفع الوثائق وحفظ توكيلات الكاتب العدل" },
  manageUsers: { label: "إدارة المستخدمين والصلاحيات", desc: "إضافة فريق العمل والتحكم بالأدوار" },
  viewReports: { label: "التقارير والتحليلات", desc: "الاطلاع على المخططات والإحصائيات" },
};

const seedUsers: UserItem[] = [
  {
    id: 1,
    name: "سعود أحمد الشحي",
    email: "suood.albooshi@law.ae",
    phone: "050-7788990",
    roleTitle: "محامٍ شريك — مدير النظام",
    roleKey: "admin",
    status: "نشط",
    avatarBg: "bg-amber-500 text-slate-900",
    avatarText: "س",
    permissions: { ...ROLE_PRESETS.admin.permissions },
  },
  {
    id: 2,
    name: "نورة العلي",
    email: "noura.alali@law.ae",
    phone: "055-1122334",
    roleTitle: "محامية ومستشارة قانونية",
    roleKey: "lawyer",
    status: "نشط",
    avatarBg: "bg-indigo-600 text-white",
    avatarText: "ن",
    permissions: { ...ROLE_PRESETS.lawyer.permissions },
  },
  {
    id: 3,
    name: "عمر الحوسني",
    email: "omar.alhosani@law.ae",
    phone: "052-4455667",
    roleTitle: "محاسب المكتب والضريبة",
    roleKey: "accountant",
    status: "نشط",
    avatarBg: "bg-emerald-600 text-white",
    avatarText: "ع",
    permissions: { ...ROLE_PRESETS.accountant.permissions },
  },
  {
    id: 4,
    name: "مريم الكعبي",
    email: "maryam.alkaabi@law.ae",
    phone: "056-9988776",
    roleTitle: "إدارة السكرتارية والتنسيق",
    roleKey: "secretary",
    status: "نشط",
    avatarBg: "bg-purple-600 text-white",
    avatarText: "م",
    permissions: { ...ROLE_PRESETS.secretary.permissions },
  },
];

const seedClients: Client[] = [
  { id: 1, name: "شركة الخليج للمقاولات ذ.م.م", type: "شركة", idNo: "رخصة تجارية 784512", phone: "04-3345678", email: "info@gulfcon.ae", emirate: "دبي", address: "الخليج التجاري، برج المنارة" },
  { id: 2, name: "أحمد عبدالله المنصوري", type: "فرد", idNo: "784-1985-1234567-1", phone: "050-1234567", email: "ahmed.m@email.ae", emirate: "أبوظبي", address: "شارع الكورنيش" },
  { id: 3, name: "مؤسسة النخيل العقارية", type: "شركة", idNo: "رخصة تجارية 552314", phone: "06-5567890", email: "legal@nakheel-re.ae", emirate: "الشارقة", address: "المجاز 3" },
  { id: 4, name: "فاطمة سالم الشامسي", type: "فرد", idNo: "784-1990-7654321-2", phone: "055-9876543", email: "fatima.s@email.ae", emirate: "دبي", address: "جميرا 1" },
];

const seedCases: CaseItem[] = [
  { id: 1, number: "1245/2026 تجاري كلي", clientId: 1, opponent: "شركة الاتحاد للتطوير", type: "تجاري", court: "محاكم دبي", judge: "الدائرة التجارية الثالثة", status: "متداولة", subject: "مطالبة بمستحقات مقاولة بقيمة 2,400,000 د.إ", openDate: "2026-01-14", fee: 0 },
  { id: 2, number: "3387/2026 عمالي جزئي", clientId: 2, opponent: "شركة المستقبل للتقنية", type: "عمالي", court: "محاكم دبي", judge: "الدائرة العمالية الأولى", status: "قيد النظر", subject: "مطالبة بمستحقات نهاية الخدمة وبدل إنذار", openDate: "2026-03-02", fee: 0 },
  { id: 3, number: "778/2026 إيجاري", clientId: 3, opponent: "مستأجر - محل تجاري", type: "إيجاري", court: "مركز فض المنازعات الإيجارية - دبي", judge: "اللجنة القضائية الثانية", status: "محجوزة للحكم", subject: "إخلاء لعدم سداد الأجرة وإلزام بالمتأخرات", openDate: "2026-02-10", fee: 0 },
  { id: 4, number: "512/2026 أحوال شخصية", clientId: 4, opponent: "—", type: "أحوال شخصية", court: "دائرة القضاء - أبوظبي", judge: "دائرة الأحوال الشخصية", status: "متداولة", subject: "دعوى نفقة وحضانة", openDate: "2026-04-20", fee: 0 },
  { id: 5, number: "204/2025 تنفيذ تجاري", clientId: 1, opponent: "شركة البناء الحديث", type: "تنفيذ", court: "محاكم دبي", judge: "قاضي التنفيذ", status: "تنفيذ", subject: "تنفيذ حكم بمبلغ 850,000 د.إ", openDate: "2025-11-05", fee: 0 },
];

const seedHearings: Hearing[] = [
  { id: 1, caseId: 1, date: addDays(2), time: "09:30", type: "جلسة مرافعة", room: "قاعة 7 - الطابق 3", notes: "تقديم مذكرة الرد على تقرير الخبير", done: false },
  { id: 2, caseId: 2, date: addDays(5), time: "10:00", type: "جلسة إدارة دعوى", room: "قاعة إدارة الدعوى 2", notes: "جلسة أولى — إعلان المدعى عليه", done: false },
  { id: 3, caseId: 3, date: addDays(9), time: "11:15", type: "جلسة نطق بالحكم", room: "اللجنة الثانية", notes: "النطق بالحكم", done: false },
  { id: 4, caseId: 4, date: addDays(-3), time: "09:00", type: "جلسة صلح", room: "لجنة التوجيه الأسري", notes: "تعذر الصلح وإحالة الدعوى للمحكمة", done: true },
];

const seedTasks: TaskItem[] = [];

const seedInvoices: Invoice[] = [
  { id: 1, number: "INV-2026-041", clientId: 1, caseId: 1, date: "2026-06-01", due: "2026-06-30", amount: 60000, status: "مدفوعة", desc: "دفعة أولى من أتعاب المحاماة" },
  { id: 2, number: "INV-2026-052", clientId: 3, caseId: 3, date: "2026-07-01", due: "2026-07-15", amount: 25000, status: "متأخرة", desc: "أتعاب دعوى الإخلاء كاملة" },
  { id: 3, number: "INV-2026-058", clientId: 2, caseId: 2, date: "2026-07-20", due: addDays(10), amount: 7500, status: "مرسلة", desc: "دفعة أولى — دعوى عمالية" },
  { id: 4, number: "INV-2026-061", clientId: 4, caseId: 4, date: todayISO(), due: addDays(30), amount: 10000, status: "مسودة", desc: "دفعة ثانية — أحوال شخصية" },
];

const seedDocs: DocItem[] = [
  { id: 1, name: "صحيفة الدعوى التجارية 1245-2026.pdf", type: "صحيفة دعوى", caseId: 1, date: "2026-01-14", by: "سعود أحمد الشحي" },
  { id: 2, name: "تقرير الخبير الهندسي.pdf", type: "تقرير خبرة", caseId: 1, date: "2026-05-22", by: "قلم الخبراء" },
  { id: 3, name: "عقد الإيجار الموثق - إيجاري.pdf", type: "عقد", caseId: 3, date: "2026-02-10", by: "نورة العلي" },
  { id: 4, name: "إنذار عدلي بالسداد أو الإخلاء.pdf", type: "إنذار عدلي", caseId: 3, date: "2026-01-25", by: "الكاتب العدل" },
];

const seedPoas: PoaItem[] = [
  { id: 1, clientId: 1, number: "وكالة 2025/1/88412", issuer: "كاتب العدل - دبي", issue: "2025-09-10", expiry: addDays(45), scope: "وكالة قضائية عامة — الترافع أمام جميع المحاكم" },
  { id: 2, clientId: 2, number: "وكالة 2026/2/1174", issuer: "كاتب العدل - أبوظبي", issue: "2026-02-15", expiry: "2028-02-15", scope: "وكالة خاصة — الدعوى العمالية رقم 3387/2026" },
  { id: 3, clientId: 4, number: "وكالة 2026/1/3390", issuer: "كاتب العدل - دبي", issue: "2026-04-01", expiry: addDays(20), scope: "وكالة خاصة — أحوال شخصية مع حق الصلح والإقرار" },
];

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

export default function LawFirmUAE() {
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState<UserItem[]>(seedUsers);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [cases, setCases] = useState<CaseItem[]>(seedCases);
  const [hearings, setHearings] = useState<Hearing[]>(seedHearings);
  const [tasks, setTasks] = useState<TaskItem[]>(seedTasks);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [docs, setDocs] = useState<DocItem[]>(seedDocs);
  const [poas, setPoas] = useState<PoaItem[]>(seedPoas);
  const [modal, setModal] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const [caseView, setCaseView] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [caseFilter, setCaseFilter] = useState("الكل");

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) || users[0], [users, currentUserId]);
  const userPerms = currentUser.permissions;

  const clientName = (id: number) => clients.find((c) => c.id === id)?.name || "—";
  const caseNo = (id: number) => cases.find((c) => c.id === id)?.number || "—";
  const nextId = <T extends { id: number }>(arr: T[]) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);

  const checkPerm = (permKey: keyof RolePermissions, actionName: string): boolean => {
    if (!userPerms[permKey]) {
      setPermissionNotice(`عذرًا، حساب "${currentUser.name}" دور (${currentUser.roleTitle}) لا يمتلك صلاحية [${PERMISSION_LABELS[permKey].label}]. يُرجى التبديل لحساب المدير لتجربتها.`);
      return false;
    }
    return true;
  };

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

  const saveDoc = () => {
    if (!checkPerm("manageDocs", "رفع مستند")) return;
    if (!form.name) return;
    setDocs([...docs, { id: nextId(docs), name: form.name, type: form.type || DOC_TYPES[0], caseId: form.caseId ? +form.caseId : null, date: todayISO(), by: currentUser.name }]);
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

    if (editingUser) {
      setUsers(users.map((u) => u.id === editingUser.id ? {
        ...u,
        name: form.name,
        email: form.email,
        phone: form.phone || u.phone,
        roleKey: rKey,
        roleTitle: form.roleTitle || preset.title,
        status: form.status || u.status,
        permissions: { ...preset.permissions }
      } : u));
    } else {
      const newUser: UserItem = {
        id: nextId(users),
        name: form.name,
        email: form.email,
        phone: form.phone || "050-0000000",
        roleKey: rKey,
        roleTitle: form.roleTitle || preset.title,
        status: "نشط",
        avatarBg: rKey === "admin" ? "bg-amber-500 text-slate-900" : rKey === "lawyer" ? "bg-indigo-600 text-white" : rKey === "accountant" ? "bg-emerald-600 text-white" : "bg-purple-600 text-white",
        avatarText: form.name.charAt(0),
        permissions: { ...preset.permissions }
      };
      setUsers([...users, newUser]);
    }
    setEditingUser(null);
    setModal(null);
  };

  const toggleUserPermission = (userId: number, permKey: keyof RolePermissions) => {
    if (!checkPerm("manageUsers", "تعديل الصلاحيات")) return;
    setUsers(users.map((u) => u.id === userId ? {
      ...u,
      permissions: {
        ...u.permissions,
        [permKey]: !u.permissions[permKey]
      }
    } : u));
  };

  const NAV = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "cases", label: "القضايا", icon: Briefcase },
    { id: "clients", label: "الموكلون", icon: Users },
    { id: "hearings", label: "الجلسات", icon: CalendarDays },
    { id: "tasks", label: "المهام", icon: ListChecks },
    { id: "invoices", label: "الفواتير والضريبة", icon: Receipt },
    { id: "docs", label: "المستندات", icon: FolderOpen },
    { id: "poa", label: "الوكالات", icon: FileSignature },
    { id: "users", label: "المستخدمون والصلاحيات", icon: ShieldCheck },
  ];

  const upcoming = hearings.filter((h) => !h.done && daysUntil(h.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const notifCount = stats.expiringPoa + invoices.filter((i) => i.status === "متأخرة").length + upcoming.filter((h) => daysUntil(h.date) <= 2).length;

  const filteredCases = cases.filter((c) =>
    (caseFilter === "الكل" || c.status === caseFilter) &&
    (c.number.includes(q) || clientName(c.clientId).includes(q) || c.subject.includes(q) || c.opponent.includes(q))
  );

  const selectedCase = cases.find((c) => c.id === caseView);

  return (
    <div dir="rtl" className="min-h-screen bg-stone-100 text-slate-800 font-sans selection:bg-amber-200 rounded-2xl overflow-hidden border border-slate-200">
      <div className="flex min-h-[600px]">
        {/* ===== الشريط الجانبي ===== */}
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex">
          <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-900"><Scale size={24} /></div>
            <div>
              <h1 className="text-sm font-bold text-white">سعود أحمد الشحي</h1>
              <p className="text-[11px] text-slate-400">للمحاماة والاستشارات القانونية</p>
            </div>
          </div>

          <div className="mx-3 my-3 rounded-xl bg-slate-800/80 p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                <UserCheck size={13} /> الحساب النشط الآن:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                {currentUser.roleKey.toUpperCase()}
              </span>
            </div>
            <select
              value={currentUserId}
              onChange={(e) => setCurrentUserId(+e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-white px-2 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.roleTitle})
                </option>
              ))}
            </select>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setTab(id); setCaseView(null); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === id ? "bg-amber-500 text-slate-900 font-bold" : "hover:bg-slate-800 hover:text-white"}`}>
                <Icon size={18} /><span>{label}</span>
                {id === "poa" && stats.expiringPoa > 0 && <span className="mr-auto rounded-full bg-red-500 px-2 text-xs font-bold text-white">{stats.expiringPoa}</span>}
                {id === "users" && <span className="mr-auto rounded-full bg-slate-800 border border-amber-500/40 text-[10px] px-1.5 py-0.2 text-amber-300 font-mono">{users.length}</span>}
              </button>
            ))}
          </nav>
          <div className="border-t border-slate-800 p-4 text-xs text-slate-500 space-y-1">
            <p>ضريبة القيمة المضافة: 5% (UAE VAT)</p>
            <p className="text-slate-400">النظام الذكي — الإمارات</p>
          </div>
        </aside>

        {/* ===== المحتوى ===== */}
        <main className="flex-1">
          {/* الشريط العلوي */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-900"><Scale size={18} /></div>
              <span className="font-bold text-xs">سعود أحمد الشحي للمحاماة</span>
            </div>
            <div className="relative mr-auto hidden max-w-xs flex-1 md:block">
              <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في القضايا والموكلين…" className={`${inputCls} pr-9`} />
            </div>

            <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentUser.avatarBg}`}>
                {currentUser.avatarText}
              </div>
              <div className="hidden sm:block text-xs leading-tight">
                <p className="font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-amber-700 font-medium">{currentUser.roleTitle}</p>
              </div>
              <select
                value={currentUserId}
                onChange={(e) => setCurrentUserId(+e.target.value)}
                className="text-xs bg-stone-100 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    تبديل إلى: {u.name} ({u.roleKey})
                  </option>
                ))}
              </select>
            </div>

            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="التنبيهات">
              <Bell size={20} />
              {notifCount > 0 && <span className="absolute -left-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{notifCount}</span>}
            </button>
          </header>

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

          <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">

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

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: "قضايا نشطة", value: stats.active, icon: Briefcase, tone: "bg-indigo-100 text-indigo-600" },
                    { label: "جلسات هذا الأسبوع", value: stats.weekHearings, icon: Gavel, tone: "bg-amber-100 text-amber-600" },
                    { label: "مبالغ مستحقة (شامل الضريبة 5%)", value: fmtAED(stats.dueAmount), icon: TrendingUp, tone: "bg-emerald-100 text-emerald-600" },
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
              </>
            )}

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
                                }} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

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
                    <span>الصلاحيات المتاحة: <b>{Object.values(currentUser.permissions).filter(Boolean).length} من {Object.keys(currentUser.permissions).length}</b></span>
                  </div>
                </div>

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
                          <th className="px-4 py-3 font-semibold">الحالة</th>
                          <th className="px-4 py-3 font-semibold text-center">الصلاحيات المفتوحة</th>
                          <th className="px-4 py-3 font-semibold text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => {
                          const openCount = Object.values(u.permissions).filter(Boolean).length;
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
                              <td className="px-4 py-3">
                                <Badge className={u.status === "نشط" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                                  {u.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  {openCount} / {Object.keys(u.permissions).length}
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
                                        roleKey: u.roleKey,
                                        roleTitle: u.roleTitle,
                                        status: u.status,
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
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">مصفوفة التحكم التفاعلية بالصلاحيات (Permission Matrix)</h3>
                    <p className="text-xs text-slate-500">يمكنك الضغط على خانة أي صلاحية لتفعيلها أو إلغائها فورًا لكل عضو</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-900 text-white text-right">
                        <tr>
                          <th className="p-3 rounded-r-xl">نوع الصلاحية</th>
                          {users.map((u) => (
                            <th key={u.id} className="p-3 text-center font-bold">
                              {u.name}
                              <span className="block text-[10px] text-amber-400 font-normal">{u.roleTitle.split("—")[0]}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(Object.keys(PERMISSION_LABELS) as Array<keyof RolePermissions>).map((pKey) => (
                          <tr key={pKey} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800">
                              <p className="font-bold text-slate-900">{PERMISSION_LABELS[pKey].label}</p>
                              <p className="text-[11px] text-slate-400 font-normal">{PERMISSION_LABELS[pKey].desc}</p>
                            </td>
                            {users.map((u) => {
                              const hasIt = u.permissions[pKey];
                              return (
                                <td key={u.id} className="p-3 text-center">
                                  <button
                                    onClick={() => toggleUserPermission(u.id, pKey)}
                                    className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${hasIt ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-300 hover:bg-slate-200"}`}
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

          </div>
        </main>
      </div>

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
              <select onChange={f("roleKey")} defaultValue={form.roleKey || "lawyer"} className={inputCls}>
                <option value="admin">مدير النظام / محامٍ شريك (كل الصلاحيات)</option>
                <option value="lawyer">محامٍ ومستشار قانوني (قضايا وجلسات ومهام)</option>
                <option value="secretary">مسؤول سكرتارية وتنسيق (مواعيد وموكلين)</option>
                <option value="accountant">محاسب المكتب والضريبة (فواتير وأتعاب)</option>
              </select>
            </Field>
            <Field label="المسمى الوظيفي">
              <input onChange={f("roleTitle")} defaultValue={form.roleTitle || ""} placeholder="مثال: محامي استئناف ومدني" className={inputCls} />
            </Field>
            <button onClick={saveUser} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700">حفظ بيانات المستخدم والصلاحيات</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
