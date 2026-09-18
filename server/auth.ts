// ============================================================
// طبقة التحقق من الهوية لواجهة برمجة النظام المحاسبي
// يستخدم نفس مشروع Supabase الذي يعتمد عليه تسجيل الدخول الحالي في الموقع
// (نفس الـ URL والمفتاح العام "anon key" المستخدمين في src/supabaseClient.ts —
// هذا مفتاح عام مخصص للاستخدام من المتصفح وليس سراً، لا علاقة له بكلمات مرور المستخدمين).
//
// آلية العمل: يرسل الواجهة الأمامية رمز الدخول (access token) الذي يوفره Supabase
// بعد تسجيل الدخول، ضمن ترويسة: Authorization: Bearer <token>
// يقوم هذا الملف بالتحقق من صحة الرمز عبر Supabase مباشرة (وليس فك تشفير محلي)،
// ويرفض أي طلب لا يحمل رمزاً صالحاً لمستخدم حقيقي مسجّل دخوله فعلياً.
//
// ملاحظة صريحة (نطاق هذه المرحلة): هذا يضمن أن المستخدم "مسجّل دخول فعلاً" فقط.
// التحقق الدقيق من صلاحيات كل عملية (مثال: هل يحق لهذا المستخدم حذف فاتورة؟) لا يزال
// من مسؤولية النظام الحالي للصلاحيات (RolePermissions) وسيحتاج طبقة إضافية لاحقاً
// لنقله للخادم بدلاً من الاعتماد فقط على واجهة المستخدم كما هو الحال الآن في كل النظام.
// ============================================================

import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ywfddjrrgqwxbomjxsgq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rBfdJsk33ImjcyHHhjnu7w_VaBaDi22";

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// (Phase-4) عميل Supabase إضافي بمفتاح "service role" — يُستخدم فقط من هذا الملف على الخادم
// لقراءة دور المستخدم من جدول public.profiles (جدول الأدوار المركزي)، متجاوزاً RLS عمداً لأن
// هذه قراءة موثوقة من الخادم نفسه وليست من المتصفح. **تحذير أمني صريح**: SUPABASE_SERVICE_ROLE_KEY
// يمنح صلاحية كاملة على كل جداول قاعدة البيانات متجاوزاً كل سياسات RLS — يجب ألا يُضبط إلا كمتغيّر
// بيئة (environment variable) على الخادم فقط، وألا يُدرج أبداً في كود الواجهة الأمامية (src/) أو
// يُرسل للمتصفح بأي شكل. إن لم يُضبط هذا المتغير، يتم الرجوع تلقائياً (fallback) لقراءة الدور القديمة
// من app_metadata.role مع تحذير في السجل (console.warn)، حتى لا ينكسر تسجيل الدخول لأي حساب.
// ============================================================
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseServiceRole = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// (Phase-4) يقرأ دور المستخدم من جدول public.profiles (المصدر المركزي الفعلي لأدوار المستخدمين —
// انظر RLS_CHECKLIST.md و PHASE4_ROLES_MIGRATION.md لتفاصيل هذا التحديث). يُرجع null عند أي فشل
// (لا يوجد service-role key مضبوط، خطأ اتصال، أو المستخدم غير موجود في الجدول بعد) بدلاً من رمي
// استثناء، حتى تتم معالجة الحالة بلطف (fallback) في requireServerRole أدناه دون تعطيل الخادم.
async function fetchRoleFromProfilesTable(authUserId: string): Promise<string | null> {
  if (!supabaseServiceRole) return null;
  try {
    const { data, error } = await supabaseServiceRole
      .from("profiles")
      .select("role, status")
      .eq("id", authUserId)
      .maybeSingle();
    if (error || !data) return null;
    // حساب لم يُعتمد بعد (status != approved) لا يُعامل كصاحب دور فعلي حتى لو كان مضبوطاً في العمود
    if (data.status && data.status !== "approved" && data.status !== "نشط") return null;
    return (data.role as string) || null;
  } catch {
    return null;
  }
}

export interface AuthedRequest extends Request {
  authUser?: { id: string; email?: string | null; role?: string };
}

export async function requireSupabaseAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: "يجب تسجيل الدخول للوصول إلى بيانات النظام المحاسبي." });
      return;
    }

    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: "جلسة الدخول غير صالحة أو منتهية، يرجى تسجيل الدخول مجدداً." });
      return;
    }

    req.authUser = {
      id: data.user.id,
      email: data.user.email,
      // (Phase-1) نقرأ الدور من app_metadata فقط — وهو حقل لا يستطيع المستخدم أو المتصفح
      // تعديله بنفسه (يتطلب صلاحية service-role من لوحة تحكم Supabase)، بعكس user_metadata
      // أو أي ترويسة/حقل يرسله العميل، والذي يمكن لأي مستخدم تزويره بسهولة. هذا يجعل هذا
      // الحقل مصدراً موثوقاً فعلياً للدور، ولو أنه محدود حالياً لأن حسابات المستخدمين وأدوارهم
      // (RolePermissions) ما زالت مُدارة محلياً في متصفح كل مستخدم (localStorage) وليس في
      // جدول مستخدمين مركزي على الخادم — انظر RLS_CHECKLIST.md لملاحظة النطاق الكاملة.
      role: (data.user.app_metadata as any)?.role as string | undefined,
    };
    next();
  } catch (err: any) {
    res.status(500).json({ error: "تعذر التحقق من هوية المستخدم." });
  }
}

// (Phase-1) طبقة تحقق إضافية من الدور على مستوى الخادم للعمليات الأكثر حساسية (حذف، اطلاع على
// الماليات، الحسابات البنكية/الائتمانية). تُقرأ الأدوار المسموحة من app_metadata.role الموثّق أعلاه
// فقط — وليس من أي شيء يرسله العميل ضمن الطلب (body/header) — حتى لا يمكن لمستخدم غير مخوّل تجاوز
// الفحص بمجرد تعديل الطلب من المتصفح.
// (Phase-4) تم تحديث هذه الدالة لتقرأ الدور من جدول public.profiles المركزي أولاً (يُضبط الآن من
// داخل التطبيق نفسه عبر شاشة المستخدمين، وليس يدوياً من لوحة تحكم Supabase كما كان سابقاً) — وهذا هو
// الهدف الأساسي من هذا التحديث: جعل إسناد الأدوار إجراءً عادياً داخل النظام بدل تعديل يدوي لكل حساب.
// إن تعذّرت القراءة من الجدول لأي سبب (لا يوجد SUPABASE_SERVICE_ROLE_KEY، خطأ اتصال، أو المستخدم غير
// موجود في الجدول بعد لأنه حساب قديم قبل هذا التحديث)، يتم الرجوع تلقائياً (fallback) لقراءة
// app_metadata.role كما كانت الآلية القديمة، مع تحذير واضح في سجل الخادم، حتى لا ينكسر تسجيل الدخول
// أو تُرفض طلبات مستخدمين حاليين بسبب هذا التحديث نفسه.
export function requireServerRole(...allowedRoles: string[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const userId = req.authUser?.id;
    let role: string | undefined | null = null;

    if (userId) {
      role = await fetchRoleFromProfilesTable(userId);
    }

    if (!role) {
      if (userId) {
        console.warn(
          `[requireServerRole] تعذّرت قراءة الدور من جدول profiles للمستخدم ${userId} — ` +
            `الرجوع مؤقتاً لقراءة app_metadata.role (الآلية القديمة). إن كان هذا حساباً حالياً، ` +
            `يجب على المدير الدخول لشاشة المستخدمين وإعادة إسناد دوره ليظهر في جدول profiles.`,
        );
      }
      role = req.authUser?.role;
    }

    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({
        error: "ليست لديك صلاحية كافية لتنفيذ هذه العملية الحساسة (تحقق من دور الحساب).",
      });
      return;
    }
    next();
  };
}
