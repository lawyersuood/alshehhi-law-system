// حالة "وحدة البريد الإلكتروني" الكاملة (صندوق الوارد، الإنشاء، إعدادات SMTP، اختبارات الاتصال) —
// مستخرجة من App.tsx. الدوال الفعلية (fetchEmailSettings, handleSendInAppEmail, handleTestSmtpConnection,
// إلخ) بقيت داخل App.tsx لأنها تعتمد على دوال عامة أخرى (logAuditAction, setPermissionNotice, fetch API).
// isDemoEmail بقيت مستوردة من مكانها الأصلي داخل App.tsx وتُمرَّر هنا كوسيط لتفادي أي اعتماد دائري.
import { useState, useEffect } from "react";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export interface InAppEmail {
  id: number | string;
  folder: "inbox" | "sent" | "draft" | "trash";
  sender: string;
  senderEmail: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export function useEmailModule(isDemoEmail: (e: InAppEmail) => boolean) {
  const [emailFolder, setEmailFolder] = useState<"inbox" | "sent" | "draft" | "trash">("inbox");
  const [emailSearch, setEmailSearch] = useState<string>("");
  // النوع يشمل string لأن معرّف الرسالة (InAppEmail.id) قد يكون نصياً (مثلاً معرّف من خادم بريد
  // حقيقي) وليس رقمياً فقط دائماً — كان القيد على number فقط هنا فجوة نوع خفية قد تمنع تحديد
  // الرسالة بشكل صحيح عند استخدام معرّفات نصية.
  const [selectedEmailId, setSelectedEmailId] = useState<number | string | null>(1);
  const [showComposeEmail, setShowComposeEmail] = useState<boolean>(false);
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState<boolean>(false);

  const [composeTo, setComposeTo] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [composeAttachment, setComposeAttachment] = useState<string>("");

  const [emailConfig, setEmailConfig] = useState<{
    email: string;
    senderName: string;
    appPassword?: string;
    smtpHost: string;
    smtpPort: number;
    secure: boolean;
    protocol: "ssl_tls" | "starttls" | "none";
    rejectUnauthorized: boolean;
    isConfigured: boolean;
    lastTestedAt?: string;
    lastTestStatus?: "success" | "failed";
  }>({
    email: "info@lawyersuood.com",
    senderName: "المحامي سعود أحمد الشحي",
    appPassword: "",
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    secure: false,
    protocol: "starttls",
    rejectUnauthorized: false,
    isConfigured: true,
  });

  const [testSmtpLoading, setTestSmtpLoading] = useState<boolean>(false);
  const [testSmtpResult, setTestSmtpResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    code?: string;
    recommendation?: string;
    details?: any;
  } | null>(null);

  const [testInvoiceLoading, setTestInvoiceLoading] = useState<boolean>(false);
  const [testInvoiceRecipient, setTestInvoiceRecipient] = useState<string>("");
  const [testInvoiceResult, setTestInvoiceResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [inAppEmails, setInAppEmails] = useState<InAppEmail[]>(() => {
    try {
      const saved = loadStorage<InAppEmail[]>("firm_in_app_emails", []);
      const clean = (saved || []).filter((e) => !isDemoEmail(e));
      saveStorage("firm_in_app_emails", clean);
      return clean;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    saveStorage("firm_in_app_emails", inAppEmails);
  }, [inAppEmails]);

  return {
    emailFolder,
    setEmailFolder,
    emailSearch,
    setEmailSearch,
    selectedEmailId,
    setSelectedEmailId,
    showComposeEmail,
    setShowComposeEmail,
    showEmailSettingsModal,
    setShowEmailSettingsModal,
    composeTo,
    setComposeTo,
    composeSubject,
    setComposeSubject,
    composeBody,
    setComposeBody,
    composeAttachment,
    setComposeAttachment,
    emailConfig,
    setEmailConfig,
    testSmtpLoading,
    setTestSmtpLoading,
    testSmtpResult,
    setTestSmtpResult,
    testInvoiceLoading,
    setTestInvoiceLoading,
    testInvoiceRecipient,
    setTestInvoiceRecipient,
    testInvoiceResult,
    setTestInvoiceResult,
    inAppEmails,
    setInAppEmails,
  };
}
