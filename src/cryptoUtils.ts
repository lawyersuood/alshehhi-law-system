export const ENCRYPTION_KEY = "saoud-al-shehhi-law-firm-secret-256";

export async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
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
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(file: File): Promise<{ encryptedBlob: Blob, ivHex: string }> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buffer = await file.arrayBuffer();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    buffer
  );
  
  return {
    encryptedBlob: new Blob([encrypted], { type: "application/octet-stream" }),
    ivHex: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

export async function decryptFile(encryptedBlob: Blob, ivHex: string, type: string): Promise<Blob> {
  const key = await getEncryptionKey();
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const buffer = await encryptedBlob.arrayBuffer();
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    buffer
  );
  
  return new Blob([decrypted], { type });
}
