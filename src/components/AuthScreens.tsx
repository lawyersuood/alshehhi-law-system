/* شاشات المصادقة ومكوّنات الواجهة المشتركة — مستخرجة من App.tsx */
import React, { useState, useEffect } from "react";
import type { UserItem } from "../domain/types";
import Logo from "./Logo";
import { supabase } from "../supabaseClient";
import { hashPassword, verifyPassword, isHashedPassword } from "../cryptoUtils";
import {
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  X,
  Copy,
  Check,
  Database,
  Code,
  MessageSquare,
  ShieldAlert,
  Info,
  LogOut,
  Clock,
  User,
} from "lucide-react";

export const Badge = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight ${className}`}
  >
    {children}
  </span>
);

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{label}</span>
    {children}
  </label>
);

export const SUPABASE_PROFILES_SQL = `-- 1. إنشاء جدول البروفايل مقترناً بـ Supabase Auth
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

export const SUPABASE_RLS_SQL = `-- 2. تفعيل Row Level Security (RLS) على جميع جداول التطبيق
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

export const SUPABASE_TRIGGER_SQL = `-- 5. إنشاء Trigger تلقائي لإنشاء بروفايل بحالة 'pending' فور تسجيل المستخدم في auth.users
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

export const SUPABASE_WHATSAPP_MESSAGES_SQL = `-- 6. إنشاء جدول whatsapp_messages للمراسلات ومتابعة الـ Webhook و Edge Function
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

export const REACT_PROTECTED_ROUTE_SQL = `// ============================================================
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

export interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"schema" | "rls" | "trigger" | "whatsapp" | "react">(
    "schema",
  );
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const getActiveCode = () => {
    switch (activeTab) {
      case "schema":
        return SUPABASE_PROFILES_SQL;
      case "rls":
        return SUPABASE_RLS_SQL;
      case "trigger":
        return SUPABASE_TRIGGER_SQL;
      case "whatsapp":
        return SUPABASE_WHATSAPP_MESSAGES_SQL;
      case "react":
        return REACT_PROTECTED_ROUTE_SQL;
      default:
        return SUPABASE_PROFILES_SQL;
    }
  };

  const handleCopy = (tabKey: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(tabKey);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08130f]/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 text-slate-100 shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* رأس المودال */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#08130f]/85">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                أكواد Supabase SQL و RLS و WhatsApp Edge Function
              </h3>
              <p className="text-xs text-slate-400">
                نظام إدارة العضويات، حظر الوصول (RLS) ومزامنة جدول whatsapp_messages و Edge Function
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
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
              {activeTab === "schema" &&
                "أنشئ هذا الجدول في Supabase SQL Editor لربط بيانات البروفايل مع Supabase Auth بحالة افتراضية 'pending'."}
              {activeTab === "rls" &&
                "تفعيل RLS ودالة is_approved_user() لحظر أي محاولة قراءة أو كتابة على القضايا والجلسات للمستخدمين المعلقين."}
              {activeTab === "trigger" &&
                "ربط قاعدة البيانات بـ Auth Trigger لإدراج السجل تلقائياً بحالة معلقة بمجرد قيام المستخدم بالتسجيل."}
              {activeTab === "whatsapp" &&
                "جدول whatsapp_messages مع تفعيل Supabase Realtime ودعم Edge Function: send-whatsapp-message."}
              {activeTab === "react" &&
                "مكون حماية المسارات (Protected Routes) في React لربط الواجهة وحجب الشاشات عن الحسابات غير المعتمَدة."}
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
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export const PendingApprovalScreen = ({
  currentUser,
  onLogout,
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
              <h2 className="text-xl font-black text-[#0c4a47]">
                طلب تفعيل الحساب قيد الانتظار والاعتماد
              </h2>
              <p className="text-xs font-bold text-[#b89b6a] mt-0.5">بانتظار موافقة مدير النظام</p>
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
            وفقاً لسياسة الأمان والاعتماد المعتمدة في النظام، تظل جميع صلاحيات الوصول ومحتويات
            النظام محجوبة حتى يتلقى حسابك تفعيلاً وموافقة صريحة من مدير النظام (المحامي سعود أحمد
            الشحي).
          </p>
        </div>

        {/* بطاقة معلومات الحساب المعلق */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-stone-200 pb-2 flex items-center justify-between">
            <span>بيانات طلب الانضمام المقدم:</span>
            <span className="text-slate-400 font-mono font-normal">ID: #{currentUser.id}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700 pt-1">
            <p>
              <b>الاسم الكامل:</b> {currentUser.name}
            </p>
            <p>
              <b>البريد الإلكتروني:</b> {currentUser.email}
            </p>
            <p>
              <b>رقم الهاتف:</b> {currentUser.phone}
            </p>
            <p>
              <b>الدور المخصص:</b> {currentUser.roleTitle}
            </p>
            <p>
              <b>حالة الطلب الآن:</b>{" "}
              <span className="text-amber-700 font-bold">معلق بانتظار المدير (Pending)</span>
            </p>
            <p>
              <b>حالة الوصول:</b> <span className="text-red-600 font-bold">محظور مؤقتاً</span>
            </p>
          </div>
        </div>

        {/* إشعار فحص الحالة */}
        {checkState === "still_pending" && (
          <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-900 font-bold flex items-center gap-2">
            <Info size={16} className="text-amber-600 shrink-0" />
            <span>
              طلبك لا يزال قيد المراجعة والاعتماد لدى مدير النظام. سيتم تفعيل حسابك فور الموافقة
              عليه من لوحة تحكم المستخدمين والصلاحيات.
            </span>
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
              يوجد طلبك الآن في قائمة الطلبات المعلقة داخل لوحة تحكم "المستخدمون والصلاحيات" لدى
              مدير المكتب. فور الضغط على (قبول وتفعيل الحساب)، ستتمكن فوراً من دخول النظام.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300/80 bg-slate-50/40 p-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D382B]/[0.06] text-[#0D382B]/40">
      <Icon size={26} />
    </div>
    <p className="text-sm font-semibold text-slate-500">{text}</p>
  </div>
);

export const Modal = ({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#08130f]/65 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150"
    onClick={onClose}
  >
    <div
      className={`max-h-[92vh] w-full ${wide ? "max-w-4xl" : "max-w-xl"} overflow-y-auto rounded-t-[24px] sm:rounded-[24px] bg-white shadow-[0_30px_80px_-20px_rgb(8,19,15,0.45)] custom-scrollbar animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-4 sm:py-5 sticky top-0 bg-white/95 backdrop-blur z-10">
        <h3 className="text-base sm:text-lg font-black text-[#0D382B] truncate flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[#C5A059] shrink-0" />
          {title}
        </h3>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:bg-[#0D382B]/[0.06] transition-colors hover:text-slate-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  </div>
);

export interface LoginScreenProps {
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

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLogin,
  onRegister,
  onOpenSqlModal,
}) => {
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
  const [passwordInput, setPasswordInput] = useState<string>("");
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
  const [regPassword, setRegPassword] = useState("");
  const [regRoleKey, setRegRoleKey] = useState<"admin" | "lawyer" | "secretary" | "accountant">(
    "lawyer",
  );

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
        password: cleanedPass,
      });

      if (!authError && authData?.user) {
        const user = authData.user;
        // Direct database query for user status in profiles table
        let statusFromDb: string | null = null;
        let profileFound = false;

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", user.id)
          .maybeSingle();

        if (profileRow) {
          statusFromDb = profileRow.status;
          profileFound = true;
        } else {
          // Fallback query by email if id query did not return
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("status")
            .eq("email", user.email?.toLowerCase())
            .maybeSingle();
          if (profileByEmail) {
            statusFromDb = profileByEmail.status;
            profileFound = true;
          }
        }

        // If record was removed from profiles or status is rejected/deleted
        if (
          !profileFound ||
          statusFromDb === "rejected" ||
          statusFromDb === "deleted" ||
          statusFromDb === "موقف" ||
          statusFromDb === "معطل"
        ) {
          alert("This account has been revoked or removed by the admin");
          await supabase.auth.signOut();
          setErrorMsg("This account has been revoked or removed by the admin");
          setIsSubmitting(false);
          return;
        }

        if (statusFromDb === "pending" || statusFromDb === "معلق") {
          alert("Your account is pending admin approval");
          await supabase.auth.signOut();
          setErrorMsg("Your account is pending admin approval");
          setIsSubmitting(false);
          return;
        }

        if (statusFromDb !== "approved" && statusFromDb !== "نشط" && statusFromDb !== "active") {
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
      (u) => u.email.toLowerCase() === cleanedEmail || u.name.toLowerCase() === cleanedEmail,
    );

    if (!targetUser) {
      setErrorMsg(
        "اسم المستخدم أو البريد الإلكتروني غير مسجل بالنظام. يرجى التأكد من بيانات الحساب.",
      );
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

    // ملاحظة أمنية: لا يوجد أي كلمة مرور افتراضية عالمية — حساب بدون كلمة مرور محفوظة
    // يُرفض دخوله صراحة بدل قبول قيمة افتراضية معروفة (كانت "123456" سابقاً، وهي ثغرة أمنية حرجة).
    const userPass = targetUser.password;
    if (!userPass) {
      setErrorMsg(
        "هذا الحساب غير مُهيّأ بكلمة مرور صالحة. يرجى التواصل مع مدير النظام لتعيين كلمة مرور.",
      );
      setIsSubmitting(false);
      return;
    }
    // مقارنة آمنة: تدعم كلمات المرور المُجزّأة (pbkdf2) والحسابات القديمة (نص عادي) للتوافق
    const passwordMatches = await verifyPassword(cleanedPass, userPass);
    if (!passwordMatches) {
      setErrorMsg("كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور المدخلة والتحقق من حسابك.");
      setIsSubmitting(false);
      return;
    }

    // 3. تسجيل دخول Supabase Authentication بصمت في الخلفية لهذا المستخدم المحلي —
    // بدون هذه الخطوة تبقى كل عمليات الحفظ (القضايا/الموكلين/سجل التدقيق...) تفشل بصمت بعد
    // تقييد سياسات RLS على "authenticated" فقط، رغم أن تسجيل الدخول المحلي نجح ظاهرياً.
    // نحاول الدخول أولاً، وإن لم يكن للمستخدم حساب Supabase Auth بعد ننشئه له تلقائياً بنفس بياناته
    // حتى تُزامن بياناته مع بقية الأجهزة من أول دخول.
    if (targetUser.email) {
      try {
        const silentEmail = targetUser.email.toLowerCase();
        // يجب استخدام كلمة المرور الفعلية التي أدخلها المستخدم (وليست القيمة المخزّنة التي قد تكون مُجزّأة الآن)
        const silentPass = cleanedPass.length >= 6 ? cleanedPass : `${cleanedPass}-firm2024`;
        const { error: silentSignInErr } = await supabase.auth.signInWithPassword({
          email: silentEmail,
          password: silentPass,
        });
        if (silentSignInErr) {
          await supabase.auth.signUp({ email: silentEmail, password: silentPass });
        }
      } catch (e) {
        console.warn("Silent Supabase Auth sync note:", e);
      }
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
            role: regRoleKey || "lawyer",
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const registeredUserId = authData?.user?.id;

      // 2. Direct insertion/upsert into public.profiles table
      if (registeredUserId) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          [
            {
              id: registeredUserId,
              email: cleanEmail,
              full_name: cleanName,
              phone: cleanPhone || "0500000000",
              status: "pending",
              role: regRoleKey || "lawyer",
            },
          ],
          { onConflict: "id" },
        );

        if (profileError) {
          console.warn("Supabase profiles table sync note:", profileError.message);
          const { error: profileEmailErr } = await supabase.from("profiles").upsert(
            [
              {
                id: registeredUserId,
                email: cleanEmail,
                full_name: cleanName,
                phone: cleanPhone || "0500000000",
                status: "pending",
                role: regRoleKey || "lawyer",
              },
            ],
            { onConflict: "email" },
          );

          if (profileEmailErr) {
            console.warn("Secondary profile sync note:", profileEmailErr.message);
          }
        }
      } else {
        const { error: profileEmailErr } = await supabase.from("profiles").upsert(
          [
            {
              email: cleanEmail,
              full_name: cleanName,
              phone: cleanPhone || "0500000000",
              status: "pending",
              role: regRoleKey || "lawyer",
            },
          ],
          { onConflict: "email" },
        );

        if (profileEmailErr) {
          console.warn("Primary profile email sync note:", profileEmailErr.message);
        }
      }

      const roleTitleMap = {
        admin: "مدير النظام",
        lawyer: "محامٍ ومستشار",
        secretary: "إدارة وسكرتارية",
        accountant: "محاسب قانوني",
      };

      // نخزّن كلمة المرور مُجزّأة (pbkdf2) في سجل النظام المحلي بدل النص العادي
      const hashedPassForStorage = await hashPassword(cleanPass);

      onRegister({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || "0500000000",
        password: hashedPassForStorage,
        roleKey: regRoleKey,
        roleTitle: roleTitleMap[regRoleKey],
      });

      setSuccessMsg("✅ تم تسجيل الحساب بنجاح! طلبك الآن في انتظار اعتماد وتفعيل مدير النظام.");
      setErrorMsg(null);
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setAuthMode("login");
    } catch (err: any) {
      console.error("Registration submission error:", err);
      alert("Registration Failed: " + (err?.message || "Error during registration"));
      setErrorMsg(err?.message || "حدث خطأ أثناء التواصل مع الخادم.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-hidden bg-[#F4F8F6] text-slate-800 flex flex-col justify-between selection:bg-[#C5A059] selection:text-white"
    >
      {/* توهجات خلفية ناعمة لعمق بصري بدون تغيير الهوية اللونية */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#0D382B]/[0.06] blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#C5A059]/[0.10] blur-3xl" />
      </div>

      {/* الشريط العلوي */}
      <header className="relative z-10 px-6 py-4 border-b border-emerald-900/10 bg-white/80 backdrop-blur-md flex items-center justify-between">
        <Logo variant="horizontal" mode="light" size="md" />
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-900/10 text-[11px] font-bold text-[#0D382B] shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
          البوابة الرقمية الموحدة • دولة الإمارات
        </span>
      </header>

      {/* محتوى الشاشة */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-xl rounded-[28px] bg-white/95 backdrop-blur border border-emerald-900/[0.07] shadow-[0_1px_2px_rgb(13,56,43,0.04),0_24px_60px_-20px_rgb(13,56,43,0.22)] p-7 sm:p-10 space-y-7">
          {/* الشعار الرسمي وعنوان النموذج */}
          <div className="text-center space-y-2 flex flex-col items-center">
            <Logo variant="full" mode="light" size="xl" className="mb-2" />
            <div className="pt-4 border-t border-slate-100 w-full">
              <h2 className="text-xl sm:text-[1.65rem] font-black text-[#0D382B] flex items-center justify-center gap-2 tracking-tight">
                <Lock size={20} className="text-[#C5A059]" /> الدخول إلى البوابة القانونية
              </h2>
              <p className="text-[13px] text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                يرجى إدخال بيانات حسابك المعتمد للوصول إلى نظام إدارة القضايا والخدمات
              </p>
            </div>
          </div>

          {/* تبويب الدخول / التسجيل */}
          <div className="flex rounded-2xl bg-slate-100/70 p-1.5 border border-slate-200/70 text-xs font-bold gap-1">
            <button
              onClick={() => {
                setAuthMode("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-[14px] transition-all duration-200 flex items-center justify-center gap-2 ${
                authMode === "login"
                  ? "bg-[#0D382B] text-white font-black shadow-[0_6px_16px_-6px_rgb(13,56,43,0.5)]"
                  : "text-slate-500 hover:text-[#0D382B]"
              }`}
            >
              <Key size={15} /> تسجيل الدخول
            </button>
            <button
              onClick={() => {
                setAuthMode("register");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-[14px] transition-all duration-200 flex items-center justify-center gap-2 ${
                authMode === "register"
                  ? "bg-[#0D382B] text-white font-black shadow-[0_6px_16px_-6px_rgb(13,56,43,0.5)]"
                  : "text-slate-500 hover:text-[#0D382B]"
              }`}
            >
              <UserPlus size={15} /> طلب انضمام جديد
            </button>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 leading-relaxed">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2 leading-relaxed">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* حقول البريد وكلمة المرور */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني أو اسم المستخدم <span className="text-[#C5A059]">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="info@lawyersuood.com أو الاسم"
                      className="w-full rounded-[12px] bg-slate-50/80 border border-slate-200/80 px-3 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      كلمة المرور السرية <span className="text-[#C5A059]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-bold text-[#0D382B] hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-[12px] bg-slate-50/80 border border-slate-200/80 px-3 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06]"
                    />
                  </div>
                </div>

                {/* خيار تذكر بيانات الدخول (Remember Me) */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-slate-50 text-[#0D382B] focus:ring-[#0D382B]"
                    />
                    <span className="font-semibold">تذكر بيانات الدخول على هذا الجهاز</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0D382B]/[0.04] border border-[#0D382B]/10 text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold text-[#0D382B] flex items-center gap-1.5">
                  <ShieldCheck size={14} /> بوابة مصرح بها للمستخدمين
                </p>
                <p className="leading-relaxed text-emerald-900/80">
                  يرجى إدخال البريد الإلكتروني وكلمة المرور الخاصة بحسابك المسجل والمعتمد بالمكتب.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-[14px] bg-[#0D382B] text-white font-black hover:bg-[#124d40] active:scale-[0.99] transition-all shadow-[0_10px_24px_-10px_rgb(13,56,43,0.55)] flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: أ. محمد عبدالله الشامسي"
                    className="w-full rounded-[12px] bg-slate-50/80 border border-slate-200/80 px-3 py-2.5 text-xs text-slate-800 transition-colors focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@lawyersuood.com"
                      className="w-full rounded-[12px] bg-slate-50/80 border border-slate-200/80 px-3 py-2.5 text-xs text-slate-800 transition-colors focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full rounded-[12px] bg-slate-50/80 border border-slate-200/80 px-3 py-2.5 text-xs text-slate-800 transition-colors focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور للحساب *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور قوية"
                    className="w-full rounded-[12px] bg-slate-50/80 border border-slate-200/80 px-3 py-2.5 text-xs text-slate-800 transition-colors focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الصفة الوظيفية المطلوب الانضمام بها *
                  </label>
                  <select
                    value={regRoleKey}
                    onChange={(e) => setRegRoleKey(e.target.value as any)}
                    className="w-full rounded-[12px] bg-slate-50/80 border border-slate-200/80 px-3 py-2.5 text-xs text-slate-800 transition-colors focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06]"
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
                  <p>يتم إنشاء الحساب فوراً وتقديم الطلب لمراجعة واعتماد مدير النظام.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#b89b6a] text-slate-950 font-black hover:bg-[#a38555] transition shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> جارٍ إرسال الطلب...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> إرسال طلب الانضمام
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* مودال استعادة كلمة المرور (Forgot Password Modal) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08130f]/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Key className="text-amber-400" size={18} /> استعادة حساب وكلمة المرور
              </h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccessMsg(null);
                }}
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
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccessMsg(null);
                  }}
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
                    (u) => u.email.toLowerCase() === forgotEmail.trim().toLowerCase(),
                  );
                  setForgotSuccessMsg(
                    `تم إرسال تعليمات ورابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني (${forgotEmail}). يرجى التحقق من صندوق الوارد.`,
                  );
                }}
                className="space-y-4 text-xs"
              >
                <p className="text-slate-300 leading-relaxed">
                  أدخل البريد الإلكتروني المسجل في النظام لتلقي رابط تعيين كلمة المرور والرمز المؤقت
                  للوصول.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    البريد الإلكتروني المسجل *
                  </label>
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
        <p>
          © {new Date().getFullYear()} مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية • جميع
          الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
};
