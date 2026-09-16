// ============================================================
// اتصال قاعدة بيانات MySQL (Hostinger) — النظام المحاسبي المتكامل
// يقرأ بيانات الاتصال حصراً من متغيرات البيئة (Environment Variables) التي يجب
// ضبطها في إعدادات تطبيق Node.js على هوستنجر. لا تُكتب كلمة المرور هنا إطلاقاً.
//
// المتغيرات المطلوبة:
//   ACCOUNTING_DB_HOST      مثال: auth-db1020.hstgr.io
//   ACCOUNTING_DB_NAME      مثال: u514626210_accounting
//   ACCOUNTING_DB_USER      مثال: u514626210_accounting
//   ACCOUNTING_DB_PASSWORD  (يضبطها المستخدم مباشرة في لوحة هوستنجر فقط)
// ============================================================

import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function isAccountingDbConfigured(): boolean {
  return Boolean(
    process.env.ACCOUNTING_DB_HOST &&
    process.env.ACCOUNTING_DB_NAME &&
    process.env.ACCOUNTING_DB_USER &&
    process.env.ACCOUNTING_DB_PASSWORD,
  );
}

export function getPool(): mysql.Pool {
  if (!isAccountingDbConfigured()) {
    throw new Error(
      "قاعدة بيانات النظام المحاسبي غير مهيأة — يرجى ضبط متغيرات البيئة ACCOUNTING_DB_HOST / ACCOUNTING_DB_NAME / ACCOUNTING_DB_USER / ACCOUNTING_DB_PASSWORD.",
    );
  }
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.ACCOUNTING_DB_HOST,
      database: process.env.ACCOUNTING_DB_NAME,
      user: process.env.ACCOUNTING_DB_USER,
      password: process.env.ACCOUNTING_DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      dateStrings: true,
    });
  }
  return pool;
}
