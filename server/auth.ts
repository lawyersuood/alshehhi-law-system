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

export interface AuthedRequest extends Request {
  authUser?: { id: string; email?: string | null };
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

    req.authUser = { id: data.user.id, email: data.user.email };
    next();
  } catch (err: any) {
    res.status(500).json({ error: "تعذر التحقق من هوية المستخدم." });
  }
}
