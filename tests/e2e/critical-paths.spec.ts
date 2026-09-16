import { test, expect, type Page } from "@playwright/test";

/**
 * اختبارات دخان (Smoke Tests) للمسارات الحرجة في نظام إدارة المكتب.
 * ------------------------------------------------------------------
 * الهدف: شبكة أمان آلية تكتشف فوراً إذا كسر أي تعديل مستقبلي بالكود أحد المسارات
 * الأساسية التي يعتمد عليها المكتب يومياً — بدل الاعتماد الكلي على فحص يدوي بعد كل تحديث.
 *
 * هذه الاختبارات "غير مدمّرة" عمداً (Non-destructive): تتحقق من ظهور الشاشات والعناصر
 * الأساسية بشكل صحيح، ولا تُنشئ أو تُعدّل أو تحذف أي سجل فعلي (قضية/فاتورة/مستخدم) حتى لا
 * تلوّث بيانات حقيقية أو بيانات تجريبية يعتمد عليها فريق العمل.
 *
 * بيانات الدخول أدناه هي حساب تجريبي من seedData (بيانات أولية للتطوير)، وليست بيانات إنتاج حقيقية.
 */

const ADMIN_EMAIL = "info@lawyersuood.com";
const ADMIN_PASSWORD = "123456";

/**
 * يتحقق أن الشاشة لم تسقط في حاجز الأخطاء (ErrorBoundary) — أي أن المحتوى الفعلي ظهر
 * فعلاً وليس فقط تسمية التبويب بالقائمة الجانبية (التي تبقى ظاهرة حتى لو تعطلت الشاشة نفسها).
 */
async function expectScreenRenderedSuccessfully(page: Page) {
  await expect(page.getByText("حدث خطأ غير متوقع", { exact: false })).toHaveCount(0);
}

async function login(page: Page) {
  await page.goto("/");
  const identifierInput = page.locator('input[type="email"], input[type="text"]').first();
  await identifierInput.waitFor({ timeout: 10_000 });
  await identifierInput.fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await expect(page.locator('input[type="password"]')).toHaveCount(0, { timeout: 10_000 });
}

test.describe("المسارات الحرجة", () => {
  test("تحميل الصفحة وظهور شاشة تسجيل الدخول", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("تسجيل الدخول ينجح ويوصل للوحة التحكم", async ({ page }) => {
    await login(page);
    await expect(page.getByText("لوحة التحكم", { exact: false }).first()).toBeVisible();
  });

  test("فتح شاشة القضايا يعرض القائمة دون أخطاء", async ({ page }) => {
    await login(page);
    await page.getByText("القضايا", { exact: false }).first().click();
    await expect(page.getByText("القضايا", { exact: false }).first()).toBeVisible();
    await expectScreenRenderedSuccessfully(page);
  });

  test("فتح شاشة الموكلين يعرض القائمة دون أخطاء", async ({ page }) => {
    await login(page);
    await page.getByText("الموكل", { exact: false }).first().click();
    await expect(page.getByText("الموكل", { exact: false }).first()).toBeVisible();
    await expectScreenRenderedSuccessfully(page);
  });

  test("فتح شاشة الفواتير يعرض القائمة دون أخطاء", async ({ page }) => {
    await login(page);
    await page.getByText("الفواتير", { exact: false }).first().click();
    await expect(page.getByText("الفواتير", { exact: false }).first()).toBeVisible();
    await expectScreenRenderedSuccessfully(page);
  });

  test("فتح شاشة اعرف عميلك (KYC) دون أخطاء", async ({ page }) => {
    await login(page);
    await page.getByText("KYC", { exact: false }).first().click();
    await expect(page.getByText("KYC", { exact: false }).first()).toBeVisible();
    await expectScreenRenderedSuccessfully(page);
  });

  test("فتح شاشة الجلسات دون أخطاء", async ({ page }) => {
    await login(page);
    await page.getByText("الجلسات", { exact: false }).first().click();
    await expect(page.getByText("الجلسات", { exact: false }).first()).toBeVisible();
    await expectScreenRenderedSuccessfully(page);
  });

  test("لا تظهر أي رسالة خطأ غير متوقعة أثناء التنقل بين الشاشات الرئيسية", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      // تجاهل أخطاء الشبكة المتوقعة في بيئة الفحص المعزولة (لا اتصال حقيقي بـ Supabase/الخوادم الخارجية)
      if (
        /supabase|Failed to fetch|NetworkError|CORS|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|Failed to load resource|404 \(Not Found\)|net::/i.test(
          text,
        )
      ) {
        return;
      }
      consoleErrors.push(text);
    });

    await login(page);
    for (const label of ["القضايا", "الموكل", "الفواتير", "المستخدم", "KYC", "الجلسات"]) {
      const el = page.getByText(label, { exact: false }).first();
      if (await el.count()) {
        await el.click({ timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(500);
      }
    }

    expect(consoleErrors, `أخطاء غير متوقعة في الطرفية: ${consoleErrors.join(" | ")}`).toHaveLength(
      0,
    );
  });
});
