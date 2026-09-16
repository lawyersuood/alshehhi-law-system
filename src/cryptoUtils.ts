// تحذير أمني: هذا المفتاح ثابت بالكود المصدري، وبالتالي مرئي لأي شخص يفتح أدوات المطوّر
// بالمتصفح أو يفحص ملفات JavaScript المبنية للموقع — أي تشفير يعتمد عليه (getEncryptionKey/
// encryptFile/decryptFile أدناه) لا يوفر أي سرية حقيقية ضد مهاجم عازم، فقط حماية شكلية.
// ملاحظة: تم التأكد أن هذه الدوال (encryptFile/decryptFile) غير مستخدمة حالياً بأي مكان
// بالتطبيق (لا يوجد استدعاء لها). إن رغبتم مستقبلاً باستخدام تشفير حقيقي للملفات الحساسة،
// يجب أن يتم توليد/تخزين المفتاح من جهة الخادم فقط (سرّ لا يصل للمتصفح إطلاقاً)، وليس هنا.
export const ENCRYPTION_KEY = "saoud-al-shehhi-law-firm-secret-256";

// ============================================================================
// تجزئة كلمات المرور (Password Hashing) — PBKDF2/SHA-256 مع ملح عشوائي لكل كلمة مرور
// ============================================================================
// السجل السابق كان يخزّن كلمات المرور كنص عادي (plaintext) في قاعدة البيانات.
// الدوال هنا تُنتج قيمة مجزأة بالصيغة: "pbkdf2:<iterations>:<saltHex>:<hashHex>"
// وتتحقق من كلمة مرور مدخلة مقابل هذه القيمة. القيم القديمة (نص عادي، بدون هذا
// البادئة) يتم التعرف عليها تلقائياً في isHashedPassword() حتى يبقى الدخول
// يعمل للحسابات القديمة إلى أن يُعاد حفظها (عندها تُجزّأ تلقائياً).
const PBKDF2_ITERATIONS = 150000;

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/** يُنتج قيمة كلمة مرور مجزأة جاهزة للتخزين بدل النص العادي. */
export async function hashPassword(plainPassword: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(plainPassword),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bufToHex(salt.buffer)}:${bufToHex(derivedBits)}`;
}

/** يتحقق ما إذا كانت القيمة المخزّنة مجزأة أصلاً (وليست نصاً عادياً قديماً). */
export function isHashedPassword(storedValue: string | undefined | null): boolean {
  return !!storedValue && storedValue.startsWith("pbkdf2:");
}

/** يقارن كلمة مرور مُدخلة مقابل قيمة مخزّنة (مجزأة أو نص عادي قديم لأغراض التوافق). */
export async function verifyPassword(
  plainPassword: string,
  storedValue: string | undefined | null,
): Promise<boolean> {
  if (!storedValue) return false;
  if (!isHashedPassword(storedValue)) {
    // توافق مع الحسابات القديمة التي لم تُجزّأ كلمة مرورها بعد
    return plainPassword === storedValue;
  }
  const parts = storedValue.split(":");
  if (parts.length !== 4) return false;
  const [, iterationsStr, saltHex, hashHex] = parts;
  const iterations = parseInt(iterationsStr, 10);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(plainPassword),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBuf(saltHex), iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return bufToHex(derivedBits) === hashHex;
}

export async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_KEY.padEnd(32, "0").substring(0, 32)),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("firm-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptFile(file: File): Promise<{ encryptedBlob: Blob; ivHex: string }> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buffer = await file.arrayBuffer();

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buffer);

  return {
    encryptedBlob: new Blob([encrypted], { type: "application/octet-stream" }),
    ivHex: Array.from(iv)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
  };
}

export async function decryptFile(encryptedBlob: Blob, ivHex: string, type: string): Promise<Blob> {
  const key = await getEncryptionKey();
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const buffer = await encryptedBlob.arrayBuffer();

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, buffer);

  return new Blob([decrypted], { type });
}
