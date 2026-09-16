import { defineConfig, devices } from "@playwright/test";

/**
 * إعداد اختبارات Playwright الآلية (End-to-End).
 *
 * تشغيل الاختبارات محلياً:
 *   npm run build
 *   npm run test:e2e
 *
 * ملاحظة: webServer أدناه يشغّل vite preview تلقائياً على المنفذ 4173 قبل بدء الاختبارات
 * ويوقفه بعد انتهائها — لا حاجة لتشغيله يدوياً.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.SMOKE_BASE_URL || "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // مسار متصفح Chromium مُحدَّد صراحة عند توفره كمتغير بيئة (مفيد في بيئات CI/sandbox لا تسمح
    // بتحميل متصفح جديد تلقائياً). إن لم يكن معرّفاً، يستخدم Playwright متصفحه المثبّت افتراضياً.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, args: ["--no-sandbox"] }
      : {},
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx vite preview --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
