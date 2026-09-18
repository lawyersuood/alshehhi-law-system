import { test, expect, type Page } from "@playwright/test";

/**
 * اختبارات المسارات المالية الأساسية (Financial Flows).
 * ------------------------------------------------------------------
 * على عكس اختبارات "critical-paths.spec.ts" (غير المدمّرة)، هذه الاختبارات تُنشئ فعلياً
 * سجلات جديدة (فاتورة / سند قبض / معاملة أمانة) للتحقق من أن العمليات المالية الأساسية
 * تعمل من البداية للنهاية (ملء النموذج → الحفظ → ظهور السجل في القائمة)، لأن هذه العمليات
 * كانت مذكورة في تقرير التدقيق كمسارات مالية غير مغطاة باختبارات آلية.
 *
 * تُستخدم بيانات تجريبية من seedData (بيانات تطوير وليست بيانات إنتاج)، والسجلات الناتجة
 * تبقى محلية داخل بيئة الاختبار فقط.
 */

const ADMIN_EMAIL = "info@lawyersuood.com";
const ADMIN_PASSWORD = "123456";

async function login(page: Page) {
  await page.goto("/");
  const identifierInput = page.locator('input[type="email"], input[type="text"]').first();
  await identifierInput.waitFor({ timeout: 10_000 });
  await identifierInput.fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await expect(page.locator('input[type="password"]')).toHaveCount(0, { timeout: 10_000 });
}

async function openFinanceTab(page: Page, tabLabel: string | RegExp) {
  await page.getByRole("button", { name: "الفواتير والضريبة" }).click();
  await page.getByText(tabLabel, { exact: false }).first().click();
}

test.describe("المسارات المالية الحرجة", () => {
  test("إصدار فاتورة ضريبية جديدة ينجح وتظهر في السجل", async ({ page }) => {
    await login(page);
    await openFinanceTab(page, "الفواتير وضريبة FTA");

    await page.getByRole("button", { name: /إصدار فاتورة ضريبية/ }).click();

    const modalTitle = page.getByText("إصدار فاتورة ضريبية جديدة", { exact: false });
    await expect(modalTitle).toBeVisible();

    // اختيار أول موكل متاح في القائمة
    await page.getByRole("combobox", { name: "الموكل" }).selectOption({ index: 1 });

    const uniqueDesc = `اختبار آلي - فاتورة تجريبية ${Date.now()}`;
    await page.locator('input[type="number"]').first().fill("12345");
    await page.locator("textarea").first().fill(uniqueDesc);

    await page.getByRole("button", { name: "إصدار الفاتورة الضريبية" }).click();

    // بعد الحفظ يُغلق المودال، وتظهر الفاتورة الجديدة أعلى الجدول (مبلغ ١٢,٣٤٥ + ضريبة ٥٪)
    await expect(modalTitle).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByText("12,345", { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("تسجيل دفعة / سند قبض جديد ينجح ويظهر في سجل التحصيلات", async ({ page }) => {
    await login(page);
    await openFinanceTab(page, "سندات القبض");

    await page.getByRole("button", { name: /تسجيل دفعة \/ سند قبض جديد/ }).click();

    const modalTitle = page.getByText("تسجيل سند قبض / دفعة أتعاب جديدة", { exact: false });
    await expect(modalTitle).toBeVisible();

    // اختيار أول موكل متاح
    await page.getByRole("combobox", { name: "الموكل" }).selectOption({ index: 1 });

    const uniqueRef = `TEST-REF-${Date.now()}`;
    await page.getByPlaceholder("مثال: 15000").fill("5432");
    await page.getByPlaceholder(/TRF-982104/).fill(uniqueRef);

    await page.getByRole("button", { name: "حفظ وتأكيد سند القبض" }).click();

    // بعد الحفظ يُغلق المودال، وتظهر الدفعة الجديدة في سجل التحصيلات برقم مرجعها الفريد
    await expect(modalTitle).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByText(uniqueRef, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("إضافة معاملة إيداع أمانة (Trust Account) تنجح وتظهر في السجل", async ({ page }) => {
    await login(page);
    await openFinanceTab(page, "حساب أمانات الموكلين");

    await page.getByRole("button", { name: /إضافة إيداع \/ صرف أمانة/ }).click();

    const modalTitle = page.getByText("إضافة معاملة حساب أمانات الموكل", { exact: false });
    await expect(modalTitle).toBeVisible();

    // اختيار أول موكل متاح
    await page.getByRole("combobox", { name: "الموكل" }).selectOption({ index: 1 });

    const uniqueRef = `TEST-CHK-${Date.now()}`;
    await page.locator('input[type="number"]').first().fill("7777");
    await page.getByPlaceholder(/CHK-9902/).fill(uniqueRef);

    await page.getByRole("button", { name: "تأكيد معاملة الأمانات" }).click();

    // بعد الحفظ يُغلق المودال، وتظهر معاملة الأمانة الجديدة في سجل الأمانات برقم سندها الفريد
    await expect(modalTitle).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByText(uniqueRef, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
