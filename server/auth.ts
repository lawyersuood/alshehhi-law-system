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
// انظر RLS_CHECKLIST.md و PHASE4_ROLES_MIGRATION.md لتفاصيل هذا التحديث).
//
// (تصحيح لاحق مهم) يُميّز هذا الآن بوضوح بين حالتين مختلفتين تماماً كانتا تُعاملان سابقاً بنفس
// الطريقة الخاطئة (كلتاهما ترجعان null فتُفعّلان الرجوع لـ app_metadata.role القديم):
//   (أ) "لم نُهاجَر بعد" — لا يوجد service-role key، خطأ اتصال، أو لا يوجد صف للمستخدم في الجدول
//       إطلاقاً بعد. هذه حالة يُقبل فيها الرجوع للآلية القديمة كحل مؤقت (fallback) — راجع
//       PROFILE_LOOKUP_NOT_MIGRATED أدناه.
//   (ب) "تمت مراجعته صراحةً وخُفِّضت صلاحياته" — الصف موجود فعلاً في profiles لكن status ليست
//       approved (مثال: أعاده المدير إلى no_access/pending). هذه الحالة يجب أن تُرفض العملية
//       فوراً وبشكل قاطع (PROFILE_LOOKUP_DENIED)، ولا يجوز أبداً الرجوع لأي دور قديم متبقٍ في
//       app_metadata، وإلا فإن سحب صلاحية موظف من شاشة "المستخدمون" لن يُطبَّق فعلياً على الخادم —
//       وهو بالضبط الهدف الذي بُني من أجله هذا الترحيل.
type ProfileRoleLookup =
  | { kind: "found"; role: string }
  | { kind: "denied" } // الصف موجود لكن غير معتمد (status != approved) — رفض قاطع، بلا fallback
  | { kind: "not_migrated" }; // لا يوجد صف / لا يوجد service key / خطأ اتصال — fallback مسموح

async function fetchRoleFromProfilesTable(authUserId: string): Promise<ProfileRoleLookup> {
  if (!supabaseServiceRole) return { kind: "not_migrated" };
  try {
    const { data, error } = await supabaseServiceRole
      .from("profiles")
      .select("role, status")
      .eq("id", authUserId)
      .maybeSingle();
    if (error || !data) return { kind: "not_migrated" };
    // حساب موجود في الجدول لكن غير معتمد (سواء لم يُراجَع بعد، أو رُوجِع وخُفِّضت صلاحياته عمداً):
    // رفض قاطع، وليس "غير مهاجَر" — لا رجوع لأي دور قديم.
    if (data.status && data.status !== "approved" && data.status !== "نشط") {
      return { kind: "denied" };
    }
    if (!data.role) return { kind: "denied" };
    return { kind: "found", role: data.role as string };
  } catch {
    return { kind: "not_migrated" };
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
      const lookup = await fetchRoleFromProfilesTable(userId);
      if (lookup.kind === "found") {
        role = lookup.role;
      } else if (lookup.kind === "denied") {
        // رفض قاطع: الحساب مُراجَع فعلياً في profiles وغير معتمد (أو خُفِّضت صلاحياته) —
        // لا رجوع لـ app_metadata.role القديم مهما كانت قيمته، حتى لا يُبطَل هدف الترحيل.
        console.warn(
          `[requireServerRole] رفض صريح للمستخدم ${userId}: حسابه موجود في profiles لكنه غير ` +
            `معتمد حالياً (status != approved) أو بلا دور مضبوط — تم تجاهل أي دور قديم في app_metadata عمداً.`,
        );
        res.status(403).json({
          error: "حسابك قيد المراجعة أو تم تقييد صلاحياتك من قبل المدير. تواصل مع إدارة المكتب.",
        });
        return;
      } else {
        // not_migrated: لا يوجد صف بعد لهذا المستخدم (أو لا service-role key) — fallback مقبول
        // مؤقتاً للحسابات التي لم تُهاجَر بعد، وليس لأي حساب رُوجِع صراحة.
        console.warn(
          `[requireServerRole] لا يوجد صف في profiles بعد للمستخدم ${userId} — ` +
            `الرجوع مؤقتاً لقراءة app_metadata.role (الآلية القديمة) لأن هذا الحساب لم يُهاجَر بعد. ` +
            `يجب على المدير الدخول لشاشة المستخدمين وحفظ دوره ليُنشأ له صف في profiles.`,
        );
        role = req.authUser?.role;
      }
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
