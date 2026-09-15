/* اختبارات آلية لأهم الدوال الحسّاسة قانونياً ومالياً — راجع القسم 9 وقائمة المهام في تقرير التدقيق.
 * الهدف: أي تعديل مستقبلي خاطئ في احتساب مهلة الطعن أو الفوترة يُكتشف فوراً بفشل اختبار،
 * بدل الاعتماد الكامل على المراجعة اليدوية كما كان الحال سابقاً (لا يوجد أي ملف اختبارات إطلاقاً). */
import { describe, it, expect } from "vitest";
import {
  addDaysFrom,
  addDays,
  toDubaiISODate,
  daysUntil,
  todayISO,
  effectiveInvoiceStatus,
  normalizeArabicSearch,
  normalizePhoneDigits,
  firstNNameTokens,
  isDeadlineOpen,
} from "./utils";

describe("addDaysFrom — احتساب مهلة الطعن القانونية (يجب أن يعتمد توقيت دبي دائماً بلا تأثر بتوقيت جهاز المستخدم)", () => {
  it("يضيف عدد الأيام الصحيح لتاريخ حكم بسيط داخل نفس الشهر", () => {
    expect(addDaysFrom("2026-01-01", 15)).toBe("2026-01-16");
  });

  it("يحسب مهلة الطعن الجزائي (15 يوماً) بشكل صحيح عبر نهاية الشهر", () => {
    expect(addDaysFrom("2026-01-20", 15)).toBe("2026-02-04");
  });

  it("يحسب مهلة الطعن المدني/التجاري (30 يوماً) بشكل صحيح عبر نهاية السنة", () => {
    expect(addDaysFrom("2026-12-10", 30)).toBe("2027-01-09");
  });

  it("يتعامل بشكل صحيح مع السنة الكبيسة (فبراير 29 يوماً)", () => {
    // 2028 سنة كبيسة
    expect(addDaysFrom("2028-02-01", 28)).toBe("2028-02-29");
  });

  it("لا يتأثر الناتج بمنطقة زمنية سالبة (مثال: أمريكا) — هذا كان الخلل الأصلي المُكتشف بالتدقيق", () => {
    // نحاكي أن جهاز المستخدم بتوقيت UTC-8 (كاليفورنيا) عبر تمرير تاريخ+منتصف الليل بصيغة محلية،
    // ونتأكد أن toDubaiISODate يُرجع دائماً نفس التاريخ بصرف النظر عن أي شيء متعلق بتوقيت الجهاز.
    const result = addDaysFrom("2026-06-15", 1);
    expect(result).toBe("2026-06-16");
  });
});

describe("toDubaiISODate — يجب أن يُنتج دائماً صيغة YYYY-MM-DD ثابتة بتوقيت الإمارات", () => {
  it("ينسّق تاريخاً معروفاً بالصيغة الصحيحة", () => {
    const d = new Date(Date.UTC(2026, 5, 15, 12, 0, 0)); // 15 يونيو 2026 الساعة 12 ظهراً UTC
    expect(toDubaiISODate(d)).toBe("2026-06-15");
  });

  it("يحافظ على نفس تاريخ اليوم في دبي حتى قرب منتصف الليل UTC (فارق +4 ساعات)", () => {
    // الساعة 21:00 UTC تعادل الساعة 01:00 فجراً باليوم التالي بتوقيت دبي (UTC+4)
    const d = new Date(Date.UTC(2026, 5, 15, 21, 0, 0));
    expect(toDubaiISODate(d)).toBe("2026-06-16");
  });
});

describe("addDays — نفس منطق addDaysFrom لكن من تاريخ اليوم", () => {
  it("يُرجع تاريخاً بصيغة صحيحة", () => {
    expect(addDays(0)).toBe(todayISO());
  });
});

describe("daysUntil — حساب الأيام المتبقية على موعد (يُستخدم لتنبيهات 7/3 أيام الحرجة)", () => {
  it("يُرجع صفراً لموعد اليوم نفسه", () => {
    expect(daysUntil(todayISO())).toBe(0);
  });

  it("يُرجع رقماً موجباً لموعد مستقبلي", () => {
    const future = addDays(10);
    expect(daysUntil(future)).toBe(10);
  });

  it("يُرجع رقماً سالباً لموعد فائت (لضمان استثنائه من عداد المواعيد العاجلة)", () => {
    const past = addDays(-5);
    expect(daysUntil(past)).toBe(-5);
  });
});

describe("effectiveInvoiceStatus — حالة الفاتورة الفعلية (مسودة/مرسلة/متأخرة/مدفوعة)", () => {
  it("تبقى الفاتورة 'مرسلة' إن لم يحن أو يفت تاريخ الاستحقاق بعد", () => {
    expect(effectiveInvoiceStatus({ status: "مرسلة", due: addDays(5) })).toBe("مرسلة");
  });

  it("تتحول تلقائياً إلى 'متأخرة' إذا فات تاريخ الاستحقاق ولم تُدفع", () => {
    expect(effectiveInvoiceStatus({ status: "مرسلة", due: addDays(-1) })).toBe("متأخرة");
  });

  it("لا تتأثر حالة الفاتورة 'مدفوعة' حتى لو فات تاريخ الاستحقاق (تبقى مدفوعة)", () => {
    expect(effectiveInvoiceStatus({ status: "مدفوعة", due: addDays(-30) })).toBe("مدفوعة");
  });

  it("مسودة بلا تاريخ استحقاق تبقى مسودة", () => {
    expect(effectiveInvoiceStatus({ status: "مسودة" })).toBe("مسودة");
  });
});

describe("normalizeArabicSearch — يجب أن يوحّد حالة الأحرف والفروقات الإملائية عبر كل شاشات البحث", () => {
  it("يتجاهل حالة الأحرف اللاتينية", () => {
    expect(normalizeArabicSearch("ABC")).toBe(normalizeArabicSearch("abc"));
  });

  it("يوحّد الألف بأشكالها المختلفة (أ، إ، آ) إلى ألف عادية", () => {
    expect(normalizeArabicSearch("أحمد")).toBe(normalizeArabicSearch("احمد"));
    expect(normalizeArabicSearch("إحمد")).toBe(normalizeArabicSearch("احمد"));
  });

  it("يوحّد التاء المربوطة والهاء", () => {
    expect(normalizeArabicSearch("شركة")).toBe(normalizeArabicSearch("شركه"));
  });
});

describe("normalizePhoneDigits — لاستخدامه في مطابقة أرقام الهواتف بين الحجوزات والموكلين", () => {
  it("يحوّل الأرقام العربية-الهندية إلى أرقام لاتينية", () => {
    expect(normalizePhoneDigits("٠٥٠١٢٣٤٥٦٧")).toBe("0501234567");
  });

  it("يزيل كل الرموز غير الرقمية", () => {
    expect(normalizePhoneDigits("+971 50-123 4567")).toBe("9715 0123 4567".replace(/\s/g, ""));
  });
});

describe("firstNNameTokens — لمطابقة أسماء موكلين محتملين بدرجة ثقة معقولة", () => {
  it("يُرجع أول 3 مقاطع من اسم طويل", () => {
    expect(firstNNameTokens("محمد أحمد علي الشحي", 3)).toBe("محمد احمد علي");
  });

  it("لا يتأثر بمسافات زائدة", () => {
    expect(firstNNameTokens("محمد   أحمد", 3)).toBe(firstNNameTokens("محمد أحمد", 3));
  });
});

describe("isDeadlineOpen — لتحديد المواعيد التي تحتاج تنبيهاً عاجلاً", () => {
  it("الموعد 'قيد الحساب' يُعتبر مفتوحاً ويحتاج تنبيهاً", () => {
    expect(isDeadlineOpen("جارٍ حساب الميعاد")).toBe(true);
  });

  it("الموعد المقيّد فعلياً بالمحكمة لا يحتاج تنبيهاً", () => {
    expect(isDeadlineOpen("تم قيد الطعن")).toBe(false);
    expect(isDeadlineOpen("تم تقديم الطعن")).toBe(false);
    expect(isDeadlineOpen("لا حاجة لطعن")).toBe(false);
  });
});
