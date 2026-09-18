// دوال مساعدة على مستوى الوحدة (module-level) بدون أي React state أو hooks:
// إرسال واتساب/إيميل، تخزين محلي (localStorage) مع تأخير الحفظ (debounce)، ومزامنة Supabase.
// نُقلت من App.tsx كخطوة أولى آمنة من إعادة الهيكلة (بدون أي تغيير بالسلوك).
import { supabase, sendEmailViaServer } from "../supabaseClient";
import { formatUaePhone, normalizeArabicName } from "./utils";
import type { Client } from "./types";

export const sendWhatsAppMsg = (phone: string, text: string) => {
  const cleanPhone = formatUaePhone(phone);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

export const sendEmailMsg = (email: string, subject: string, body: string) => {
  if (email && email.includes("@")) {
    sendEmailViaServer({
      to: email,
      subject: subject,
      html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.7">${body}</div>`,
    })
      .then(({ success, error }) => {
        if (success) {
        } else {
          console.warn("send-email local route returned an error:", error);
        }
      })
      .catch((err) => {
        console.warn("Server email dispatch fallback to mailto:", err);
      });
  }
  const url = `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank");
};

// ---------- أدوات مساعدة ----------

// ميعاد الطعن يُعتبر "مغلقاً" (لا يحتاج تنبيهاً عاجلاً) إذا تم قيده أو تقديمه فعلياً بالمحكمة —
// نفس التعريف المعتمد في محرك التنبيهات التلقائي، موحّد هنا لتفادي تكرار الشرط في أكثر من مكان

// ملاحظة أمنية (المرحلة 1 / البند 4): كانت هذه الدالة تحتوي على مرحلة مطابقة إضافية ضعيفة
// جداً (أول كلمتين من الاسم فقط، تُطابق أي عميل يحتوي اسمه على نفس الكلمتين بأي مكان) —
// كانت تسبب دمج/ربط بيانات موكلين مختلفين تماماً بالخطأ لمجرد تشابه أول اسمين (مثال:
// "أحمد محمد" تطابق أي عميل اسمه يحتوي "أحمد" و"محمد" ولو كانا شخصين مختلفين كلياً). تم
// إزالة هذه المرحلة؛ الآن لا مطابقة إلا عند تطابق الاسم الكامل (بعد التطبيع) أو احتواء
// حقيقي لأحد الاسمين الآخر بالكامل — بدون أي دمج صامت لموكلين مختلفين.
export const findMatchingClientByName = (
  clientsList: Client[],
  searchName: string,
): Client | undefined => {
  if (!searchName || !searchName.trim()) return undefined;
  const targetNorm = normalizeArabicName(searchName);
  if (!targetNorm) return undefined;

  return clientsList.find((c) => {
    const cNorm = normalizeArabicName(c.name);
    return cNorm === targetNorm || cNorm.includes(targetNorm) || targetNorm.includes(cNorm);
  });
};

// نص عرض قائمة الخصوم بصيغة عربية مقروءة: خصم واحد كما هو، اثنان بـ"و"، وثلاثة فأكثر بفواصل مع "و" قبل الأخير

// دالة تحديد ألوان الشارات (Badges) بناءً على نوع وتصنيف القضية

// دالة تحديد ألوان النقطة والمؤشر البصري بناءً على نوع وتصنيف القضية

// حالة الفاتورة الفعلية للعرض: تحسب "متأخرة" تلقائياً لأي فاتورة "مرسلة" تجاوزت تاريخ استحقاقها ولم تُسدَّد بعد،
// بدل الاعتماد على حقل status المخزّن مباشرة الذي لا يوجد أي مسار بالنظام يضبطه على "متأخرة" فعلياً

// ---------- مكونات عامة ----------

export const inputCls =
  "w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all";

// ============================================================
// أكواد وشاشات Supabase RLS و User Approval Flow
// ============================================================

export function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

const saveStorageTimers = new Map<string, ReturnType<typeof setTimeout>>();
const saveStoragePending = new Map<string, unknown>();
export function flushSaveStorage(key: string): void {
  const timer = saveStorageTimers.get(key);
  if (timer) clearTimeout(timer);
  saveStorageTimers.delete(key);
  if (saveStoragePending.has(key)) {
    try {
      localStorage.setItem(key, JSON.stringify(saveStoragePending.get(key)));
    } catch (e) {
      console.error("Storage save error:", e);
    }
    saveStoragePending.delete(key);
  }
}
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    Array.from(saveStorageTimers.keys()).forEach((key) => flushSaveStorage(key));
  });
}
export function saveStorage<T>(key: string, value: T): void {
  try {
    const existing = saveStorageTimers.get(key);
    if (existing) clearTimeout(existing);
    saveStoragePending.set(key, value);
    const t = setTimeout(() => flushSaveStorage(key), 400);
    saveStorageTimers.set(key, t);
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

// (تصحيح Phase-1: توحيد ترقيم الفواتير)
// كان توليد رقم الفاتورة الرئيسية (Invoice.number بصيغة INV-YYYY-XXX) يتم في 3 أماكن مختلفة داخل
// App.tsx بأسس عد مختلفة (60+، 65+، 100+) اعتماداً على nextId(invoices) — وهذا يعني احتمال تكرار
// نفس الرقم لفاتورتين مختلفتين (تعارض/عدم تسلسل). المصدر الوحيد الآن لتوليد رقم الفاتورة الرئيسية
// هو الدالة التالية: تعتمد على أكبر رقم فاتورة موجود فعلياً +1، بصرف النظر عن كيف أُنشئت الفواتير
// السابقة، فتضمن عدم تكرار الرقم مهما كان عدد نقاط الإنشاء التي تستدعيها.
export function nextMainInvoiceNumber(
  existing: Array<{ number?: string }>,
  year: number = new Date().getFullYear(),
): string {
  const prefix = `INV-${year}-`;
  let max = 0;
  for (const inv of existing) {
    const num = inv.number;
    if (!num || !num.startsWith("INV-")) continue;
    const parts = num.split("-");
    const n = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

// ================= مزامنة قاعدة بيانات Supabase (للبيانات الحساسة: قضايا/موكلين/ماليات) =================
// كل صف مخزّن كـ {id, data} حيث data تحتوي كامل الكائن كـ JSON — لتفادي مشاكل توافق الأعمدة
// مع تطور شكل البيانات بمرور الوقت.
export async function fetchSupabaseTable<T>(
  table: string,
  options?: { limit?: number },
): Promise<T[] | null> {
  try {
    let query = supabase.from(table).select("id, data");
    if (options?.limit) {
      query = query.order("id", { ascending: false }).limit(options.limit);
    }
    const { data, error } = await query;
    if (error) {
      console.warn(`Supabase fetch error (${table}):`, error);
      return null;
    }
    const rows = (data || []).map((r: any) => r.data as T);
    return options?.limit ? rows.reverse() : rows;
  } catch (e) {
    console.warn(`Supabase fetch exception (${table}):`, e);
    return null;
  }
}
export async function pushSupabaseTable<T extends { id: number | string }>(
  table: string,
  rows: T[],
  explicitDeleteIds?: Array<number | string>,
): Promise<void> {
  try {
    // (تصحيح Phase-1: مشكلة التسابق عند التزامن المتعدد)
    // كنا سابقاً — حتى بعد التخلص من "المرآة الكاملة" بالحذف الشامل — نحذف من Supabase أي صف موجود في
    // القاعدة وغير موجود بالقائمة المحلية الحالية (diff مقابل كل صفوف القاعدة). هذا كان لا يزال خطراً:
    // لو أضاف مستخدم آخر (على جهاز مختلف) صفاً جديداً، ثم قام هذا الجهاز برفع نسخته المحلية القديمة
    // (التي لا تحتوي على الصف الجديد بعد)، كان الصف الجديد يُعتبر "غير موجود محلياً" فيُحذف من القاعدة
    // فوراً رغم أنه لم يُحذف فعلياً من قبل أي مستخدم — فقدان بيانات حقيقي.
    // الحل: لا نعود نحذف بالاعتماد على "غير موجود بالقائمة المحلية". بدلاً من ذلك، الحذف يتم فقط
    // لمعرّفات (IDs) تم تمريرها صراحةً في explicitDeleteIds — أي التي طلب المستخدم الحالي حذفها فعلاً
    // (انظر useSyncedTable: يتتبع "pendingDeletes" كفرق بين القيمة السابقة والحالية محلياً فقط،
    // لا كفرق مقابل كامل محتوى القاعدة). الرفع (upsert) يبقى كما هو: يحفظ فقط الصفوف الموجودة محلياً
    // دون التأثير على صفوف أضافها/عدّلها مستخدمون آخرون بعد آخر مزامنة لهذا الجهاز.
    const CHUNK_SIZE = 500;
    if (rows && rows.length > 0) {
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE).map((r) => ({ id: r.id, data: r }));
        const { error: upsertErr } = await supabase.from(table).upsert(chunk, { onConflict: "id" });
        if (upsertErr) {
          console.warn(`Supabase upsert error (${table}):`, upsertErr);
          return;
        }
      }
    }

    if (explicitDeleteIds && explicitDeleteIds.length > 0) {
      for (let i = 0; i < explicitDeleteIds.length; i += CHUNK_SIZE) {
        const idsChunk = explicitDeleteIds.slice(i, i + CHUNK_SIZE);
        const { error: delErr } = await supabase.from(table).delete().in("id", idsChunk);
        if (delErr) console.warn(`Supabase delete error (${table}):`, delErr);
      }
    }
  } catch (e) {
    console.warn(`Supabase push exception (${table}):`, e);
  }
}
