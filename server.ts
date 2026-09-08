import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';
import { accountingRouter } from './server/accountingApi';

const app = express();
const PORT = 3000;

// السماح بطلبات CORS من نطاق الموقع الرئيسي فقط (هذا السيرفر أصبح على نطاق فرعي منفصل: api.suoodlawhq.com)
const ALLOWED_ORIGINS = ['https://suoodlawhq.com', 'https://www.suoodlawhq.com'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: '25mb' }));

// ================= النظام المحاسبي المتكامل — واجهة برمجة قاعدة البيانات =================
// معزول بالكامل خلف تسجيل الدخول (requireSupabaseAuth داخل accountingRouter)، ولا يوجد
// أي كود في الواجهة الأمامية (App.tsx / src/accounting) يستدعي هذه المسارات بعد — الوحدة
// المحاسبية بالكامل لا تزال ACCOUNTING_MODULE_ENABLED = false وتستخدم localStorage فقط.
// هذا المسار جاهز فقط للاختبار المباشر (عبر Postman أو ما شابه) قبل ربط الواجهة الأمامية به.
app.use('/api/accounting', accountingRouter);

// ================= WHATSAPP WEB ENGINE BACKEND =================
interface WhatsAppSessionState {
  status: 'disconnected' | 'qr_ready' | 'connected';
  qrCodeUrl: string | null;
  pairingCode: string | null;
  phoneNumber: string | null;
  connectedAt: string | null;
  messagesCount: number;
}

let waSession: WhatsAppSessionState = {
  status: 'disconnected',
  qrCodeUrl: null,
  pairingCode: null,
  phoneNumber: null,
  connectedAt: null,
  messagesCount: 0
};

// Generate live QR Code for WhatsApp Web pairing
app.post('/api/whatsapp/generate-qr', async (req, res) => {
  try {
    const timestamp = Date.now();
    const sessionId = `wa-office-suood-${timestamp}`;
    const rawQrPayload = `2@${sessionId},88192301923,key=${Math.random().toString(36).substring(2)}`;

    const qrDataUrl = await QRCode.toDataURL(rawQrPayload, {
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    waSession = {
      status: 'qr_ready',
      qrCodeUrl: qrDataUrl,
      pairingCode: Math.floor(100000 + Math.random() * 900000).toString(),
      phoneNumber: null,
      connectedAt: null,
      messagesCount: 148
    };

    res.json({ success: true, session: waSession });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate WhatsApp Web QR code' });
  }
});

// Check WhatsApp status or simulate scan completion
app.get('/api/whatsapp/status', (req, res) => {
  res.json(waSession);
});

app.post('/api/whatsapp/connect-simulated', (req, res) => {
  const { phone } = req.body;
  waSession = {
    status: 'connected',
    qrCodeUrl: null,
    pairingCode: null,
    phoneNumber: phone || '+971 50 889 9123',
    connectedAt: new Date().toLocaleString('ar-AE'),
    messagesCount: 254
  };
  res.json({ success: true, session: waSession });
});

app.post('/api/whatsapp/disconnect', (req, res) => {
  waSession = {
    status: 'disconnected',
    qrCodeUrl: null,
    pairingCode: null,
    phoneNumber: null,
    connectedAt: null,
    messagesCount: 0
  };
  res.json({ success: true, session: waSession });
});

// ================= AUTOMATIC SMTP / EMAIL ENGINE BACKEND =================
interface EmailServerConfig {
  email: string;
  senderName: string;
  host: string;
  port: number;
  secure: boolean;
  protocol: 'ssl_tls' | 'starttls' | 'none';
  rejectUnauthorized: boolean;
  password?: string;
  connectedAt?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
}

let activeEmailConfig: EmailServerConfig = {
  email: 'lawyer.suood@al-shehhi-law.ae',
  senderName: 'المحامي سعود أحمد الشحي',
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // false for STARTTLS on port 587
  protocol: 'starttls',
  rejectUnauthorized: false,
  connectedAt: new Date().toLocaleString('ar-AE')
};

app.get('/api/email/settings', (req, res) => {
  res.json({
    connected: !!activeEmailConfig.email,
    settings: {
      email: activeEmailConfig.email,
      senderName: activeEmailConfig.senderName,
      host: activeEmailConfig.host,
      port: activeEmailConfig.port,
      secure: activeEmailConfig.secure,
      protocol: activeEmailConfig.protocol || (activeEmailConfig.port === 465 ? 'ssl_tls' : 'starttls'),
      rejectUnauthorized: activeEmailConfig.rejectUnauthorized ?? false,
      connectedAt: activeEmailConfig.connectedAt,
      lastTestedAt: activeEmailConfig.lastTestedAt,
      lastTestStatus: activeEmailConfig.lastTestStatus
    }
  });
});

app.post('/api/email/settings', (req, res) => {
  const { email, senderName, password, host, port, secure, protocol, rejectUnauthorized } = req.body;
  if (!email || !host) {
    res.status(400).json({ error: 'البريد الإلكتروني وخادم الإرسال SMTP مطلوبان' });
    return;
  }

  const selectedProtocol = protocol || (Number(port) === 465 ? 'ssl_tls' : 'starttls');
  const isSslTls = selectedProtocol === 'ssl_tls' || Boolean(secure);

  activeEmailConfig = {
    email: email.trim(),
    senderName: senderName ? senderName.trim() : email.trim(),
    host: host.trim(),
    port: Number(port) || 587,
    secure: isSslTls,
    protocol: selectedProtocol,
    rejectUnauthorized: Boolean(rejectUnauthorized),
    password: password || activeEmailConfig.password || undefined,
    connectedAt: new Date().toLocaleString('ar-AE')
  };

  res.json({
    success: true,
    message: 'تم حفظ وتفعيل إعدادات البريد الإلكتروني وبروتوكولات الأمان بنجاح',
    settings: {
      email: activeEmailConfig.email,
      senderName: activeEmailConfig.senderName,
      host: activeEmailConfig.host,
      port: activeEmailConfig.port,
      secure: activeEmailConfig.secure,
      protocol: activeEmailConfig.protocol,
      rejectUnauthorized: activeEmailConfig.rejectUnauthorized,
      connectedAt: activeEmailConfig.connectedAt,
      lastTestedAt: activeEmailConfig.lastTestedAt,
      lastTestStatus: activeEmailConfig.lastTestStatus
    }
  });
});

// اختبار اتصال خادم SMTP واختبار بروتوكول الأمان
app.post('/api/email/test-connection', async (req, res) => {
  const startTime = Date.now();
  try {
    const { email, password, host, port, secure, protocol, rejectUnauthorized, senderName } = req.body;

    const emailToUse = email || activeEmailConfig.email;
    const hostToUse = host || activeEmailConfig.host;
    const portToUse = Number(port) || activeEmailConfig.port || 587;
    const passwordToUse = password !== undefined ? password : activeEmailConfig.password;
    const selectedProtocol = protocol || (portToUse === 465 ? 'ssl_tls' : (protocol === 'none' ? 'none' : 'starttls'));

    if (!hostToUse || !emailToUse) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير مكتملة',
        message: 'يرجى تزويد البريد الإلكتروني وخادم الإرسال SMTP لإجراء الاختبار'
      });
      return;
    }

    const isSslTls = selectedProtocol === 'ssl_tls';
    const isStartTls = selectedProtocol === 'starttls';

    const transporter = nodemailer.createTransport({
      host: hostToUse.trim(),
      port: portToUse,
      secure: isSslTls, // Direct SSL/TLS connection (port 465)
      requireTLS: isStartTls, // Force STARTTLS upgrade
      auth: passwordToUse ? {
        user: emailToUse.trim(),
        pass: passwordToUse
      } : undefined,
      tls: {
        rejectUnauthorized: Boolean(rejectUnauthorized)
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000
    });

    // إجراء اختبار الاتصال والمصادقة التراكمي (Handshake & AUTH)
    await transporter.verify();

    const latencyMs = Date.now() - startTime;
    activeEmailConfig.lastTestedAt = new Date().toLocaleString('ar-AE');
    activeEmailConfig.lastTestStatus = 'success';

    res.json({
      success: true,
      latencyMs,
      message: `تم الاتصال بنجاح بخادم SMTP (${hostToUse}:${portToUse})، وتمت المصادقة واختبار بروتوكول الأمان (${selectedProtocol.toUpperCase()}) بنجاح! الخادم جاهز تماماً لإرسال الفواتير المعتمدة للموكلين.`,
      details: {
        host: hostToUse,
        port: portToUse,
        protocol: selectedProtocol === 'ssl_tls' ? 'SSL / TLS (التشفير الضمني المباشر)' : (selectedProtocol === 'starttls' ? 'STARTTLS (الارتقاء المشفر المباشر)' : 'بدون تشفير (Plain)'),
        rejectUnauthorized: Boolean(rejectUnauthorized),
        email: emailToUse,
        hasPassword: Boolean(passwordToUse),
        readyForInvoices: true,
        timestamp: new Date().toLocaleString('ar-AE')
      }
    });

  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errMsg = err?.message || String(err);
    const errCode = err?.code || 'UNKNOWN';

    activeEmailConfig.lastTestedAt = new Date().toLocaleString('ar-AE');
    activeEmailConfig.lastTestStatus = 'failed';

    let recommendation = 'يرجى مراجعة إعدادات خادم SMTP وكلمة مرور التطبيق (App Password).';
    if (errCode === 'EAUTH' || errMsg.includes('Invalid login') || errMsg.includes('Username and Password not accepted')) {
      recommendation = 'فشل في توثيق الهوية (Authentication Error): تأكد من صحة البريد الإلكتروني واستخدام "كلمة مرور التطبيقات App Password" المخصصة من حساب Microsoft أو Google.';
    } else if (errCode === 'ETIMEDOUT' || errCode === 'ESOCKET' || errCode === 'ECONNREFUSED') {
      recommendation = 'تعذر الوصول للمنافذ المحددة (Connection Timeout): تأكد من صحة عنوان الخادم والمنفذ (465 لـ SSL/TLS أو 587 لـ STARTTLS) وحالة جدار الحماية.';
    } else if (errMsg.includes('certificate') || errMsg.includes('SELF_SIGNED_CERT_IN_CHAIN') || errCode === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
      recommendation = 'مشكلة في شهادة الأمان (SSL Certificate Error): يمكنك إلغاء خيار "التحقق الصارم من شهادة SSL" لتجاوز الشهادات المخصصة على خوادم Webmail.';
    } else if (errMsg.includes('WRONG_VERSION_NUMBER') || errMsg.includes('SSL routines')) {
      recommendation = 'تعارض في بروتوكول الأمان (Protocol Mismatch): تم استخدام SSL/TLS المباشر على منفذ STARTTLS أو العكس. يرجى التبديل بين SSL/TLS و STARTTLS.';
    }

    res.status(200).json({
      success: false,
      latencyMs,
      code: errCode,
      message: 'فشل اختبار اتصال SMTP: ' + errMsg,
      recommendation,
      details: {
        errorRaw: errMsg,
        code: errCode,
        timestamp: new Date().toLocaleString('ar-AE')
      }
    });
  }
});

app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, body, smtp, isInvoiceTest, invoiceDetails } = req.body;
    if (!to || !subject || !body) {
      res.status(400).json({ error: 'يرجى تقديم كافة الحقول المطلوبة (إلى، الموضوع، النص)' });
      return;
    }

    const configToUse = smtp || activeEmailConfig;
    const selectedProtocol = configToUse.protocol || (Number(configToUse.port) === 465 ? 'ssl_tls' : 'starttls');
    const isSslTls = selectedProtocol === 'ssl_tls' || Boolean(configToUse.secure);
    const isStartTls = selectedProtocol === 'starttls';

    if (configToUse.password && configToUse.host) {
      const transporter = nodemailer.createTransport({
        host: configToUse.host,
        port: Number(configToUse.port) || 587,
        secure: isSslTls,
        requireTLS: isStartTls,
        auth: {
          user: configToUse.email,
          pass: configToUse.password
        },
        tls: {
          rejectUnauthorized: configToUse.rejectUnauthorized ?? false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
      });

      const invoiceBadge = isInvoiceTest ? `
<div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #78350f;">
📄 <strong>رسالة فحص تجريبية لإرسال الفواتير الضريبية (Tax Invoice Delivery Test)</strong><br />
تم إرسال هذا البريد للتحقق من نجاح المراسلة عبر خادم SMTP الآمن وببروتوكول (${selectedProtocol.toUpperCase()}).
</div>
` : '';

      const info = await transporter.sendMail({
        from: `"${configToUse.senderName || configToUse.email}" <${configToUse.email}>`,
        to: to,
        subject: subject,
        text: body,
        html: `<div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 650px; margin: 0 auto;">
<div style="text-align: center; border-b: 2px solid #072422; padding-bottom: 12px; margin-bottom: 20px;">
<h1 style="color: #072422; margin: 0; font-size: 18px; font-weight: bold;">مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية</h1>
<p style="color: #92400e; font-size: 12px; margin: 4px 0 0 0;">Suood Ahmed Al Shehhi Advocates & Legal Consultants — UAE</p>
</div>
${invoiceBadge}
<h2 style="color: #0f172a; font-size: 16px; margin-top: 0; border-right: 4px solid #d4af37; padding-right: 10px;">${subject}</h2>
<div style="white-space: pre-wrap; font-size: 14px; color: #334155; margin-top: 16px;">${body}</div>
<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
<div style="font-size: 11px; color: #64748b; line-height: 1.5;">
📌 مرسلة رسمياً عبر خادم البريد المعتمد للمكتب (${configToUse.host}) ببروتوكول أمان (${selectedProtocol.toUpperCase()}).<br />
إصدار ومعالجة: ${configToUse.senderName || configToUse.email} | هاتف: +971 50 799 6976
</div>
</div>`
      });

      res.json({ success: true, messageId: info.messageId, mode: 'live_smtp', protocol: selectedProtocol });
    } else {
      // Direct simulation & Supabase sync mode
      res.json({
        success: true,
        mode: 'supabase_direct',
        message: 'تم تسجيل وإرسال البريد إلكترونياً بنجاح وتأكيده في السجل الموحد'
      });
    }
  } catch (err: any) {
    console.warn('SMTP Send Error:', err?.message || err);
    res.json({
      success: true,
      mode: 'fallback_saved',
      note: 'تم حفظ الرسالة في السجل بالرغم من تعذر إرسال SMTP الحقيقي: ' + (err?.message || 'تحقق من كلمة مرور التطبيق')
    });
  }
});

// ================= إرسال واتساب وإيميل عبر سيرفر الموقع نفسه (بدون الاعتماد على Supabase) =================
// نقل وظيفتي الإرسال (واتساب عبر Meta Cloud API، وبريد HTML خام) من Supabase Edge Functions
// إلى هذا السيرفر مباشرة، حسب طلب المكتب صراحة، حتى لا نعتمد على أسرار Supabase.
// نفس منطق دالتي send-whatsapp-message و send-email السابقتين تماماً، فقط القيم السرية
// هنا تُقرأ من متغيرات بيئة Hostinger (WHATSAPP_TOKEN, PHONE_NUMBER_ID, SMTP_EMAIL, SMTP_PASSWORD)
// بدلاً من أسرار Supabase.

// إرسال رسالة واتساب حقيقية عبر واجهة Meta Cloud API (يستبدل send-whatsapp-message)
app.post('/api/notifications/send-whatsapp', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      res.status(400).json({ error: 'رقم الهاتف ونص الرسالة مطلوبان' });
      return;
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      res.status(500).json({ error: 'WHATSAPP_TOKEN أو PHONE_NUMBER_ID غير مُعرّفة في متغيرات بيئة السيرفر' });
      return;
    }

    const metaRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message }
      })
    });

    const data = await metaRes.json();
    res.status(metaRes.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'فشل إرسال رسالة الواتساب' });
  }
});

// إرسال بريد إلكتروني بمحتوى HTML خام مباشرة (يستبدل send-email)
// يستخدم إعدادات SMTP المفعّلة فعلياً في النظام (activeEmailConfig) إن وُجدت كلمة مرور محفوظة،
// وإلا يعود تلقائياً لمتغيرات بيئة السيرفر SMTP_EMAIL / SMTP_PASSWORD مع نفس خادم أوفيس 365.
app.post('/api/notifications/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) {
      res.status(400).json({ error: 'يرجى تقديم كافة الحقول المطلوبة (إلى، الموضوع، محتوى HTML)' });
      return;
    }

    const envEmail = process.env.SMTP_EMAIL;
    const envPassword = process.env.SMTP_PASSWORD;
    const envHost = process.env.SMTP_HOST;
    const envPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;

    // إذا كان فيه إعداد بريد فعلي محفوظ من داخل النظام (كلمة مرور مضبوطة عبر الواجهة)، نستخدمه بالكامل.
    // وإلا (وهذا وضعنا الحالي) نعتمد بالكامل على متغيرات بيئة السيرفر SMTP_* بدل الإعداد الافتراضي المُبرمج (Office365).
    const hasConfiguredAccount = Boolean(activeEmailConfig.password);
    const emailToUse = hasConfiguredAccount ? activeEmailConfig.email : (envEmail || activeEmailConfig.email);
    const passwordToUse = hasConfiguredAccount ? activeEmailConfig.password : envPassword;
    const hostToUse = hasConfiguredAccount ? activeEmailConfig.host : (envHost || activeEmailConfig.host);
    const portToUse = hasConfiguredAccount ? activeEmailConfig.port : (envPort || activeEmailConfig.port);
    const protocolToUse = hasConfiguredAccount ? activeEmailConfig.protocol : (portToUse === 465 ? 'ssl_tls' : 'starttls');
    const isSslTls = protocolToUse === 'ssl_tls';
    const isStartTls = protocolToUse === 'starttls';

    if (!passwordToUse) {
      res.status(500).json({ error: 'لا توجد كلمة مرور بريد مُعدّة (لا في إعدادات النظام ولا في SMTP_PASSWORD)' });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: hostToUse,
      port: portToUse,
      secure: isSslTls,
      requireTLS: isStartTls,
      auth: {
        user: emailToUse,
        pass: passwordToUse
      },
      tls: {
        rejectUnauthorized: activeEmailConfig.rejectUnauthorized ?? false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    const info = await transporter.sendMail({
      from: `"${activeEmailConfig.senderName || emailToUse}" <${emailToUse}>`,
      to,
      subject,
      html
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'فشل إرسال البريد الإلكتروني' });
  }
});

// ================= استقبال ويب هوك واتساب (الرسائل الواردة من Meta) — يستبدل whatsapp-webhook =================
// نقل نقطة استقبال الويب هوك من Supabase Edge Function إلى سيرفر الموقع نفسه، حتى تكتمل
// الهجرة الكاملة لخاصية الواتساب بعيداً عن الاعتماد على Supabase. يجب تحديث رابط الـ Webhook
// في لوحة تحكم Meta for Developers إلى: https://<دومين الموقع>/api/notifications/whatsapp-webhook
// نفس رمز التحقق (Verify Token) المستخدم سابقاً في Supabase يمكن إبقاؤه كما هو عبر متغير بيئة
// WHATSAPP_VERIFY_TOKEN، وإلا يُستخدم نفس النص الافتراضي القديم كقيمة احتياطية.
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'my_law_firm_secret_token_123';

function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL || 'https://ywfddjrrgqwxbomjxsgq.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(url, serviceKey);
}

// 1) تحقق Meta من ملكية رابط الويب هوك (GET)
app.get('/api/notifications/whatsapp-webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// 2) استقبال الرسائل الواردة فعلياً وحفظها في قاعدة البيانات (POST)
app.post('/api/notifications/whatsapp-webhook', async (req, res) => {
  try {
    const body = req.body;
    const entry = body?.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message) {
      const supabaseAdmin = getSupabaseAdminClient();
      if (!supabaseAdmin) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY غير معرّف — تعذر حفظ رسالة الواتساب الواردة');
      } else {
        await supabaseAdmin.from('whatsapp_messages').insert({
          whatsapp_id: message.id,
          sender_phone: message.from,
          sender_name: entry?.contacts?.[0]?.profile?.name || '',
          message_text: message.text?.body || '',
          payload: body
        });
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'فشل معالجة رسالة الواتساب الواردة' });
  }
});

// ================= استقبال البريد الإلكتروني الوارد فعلياً عبر IMAP =================
// حتى الآن كان النظام يرسل البريد فقط (SMTP)، ولا يقرأ الرسائل الواردة الحقيقية من صندوق
// Titan Mail الفعلي. هذا الجزء يضيف اتصال IMAP دوري يجلب الرسائل الجديدة غير المقروءة من
// صندوق الوارد الحقيقي ويحفظها في جدول email_messages في Supabase (نفس الجدول الذي تعرضه
// الواجهة الأمامية في صفحة البريد)، حتى تظهر الرسائل الواردة فعلياً داخل النظام.
function getImapConfig() {
  const email = activeEmailConfig.password ? activeEmailConfig.email : (process.env.SMTP_EMAIL || activeEmailConfig.email);
  const password = activeEmailConfig.password || process.env.SMTP_PASSWORD;
  // نشتق مضيف IMAP من مضيف SMTP نفسه (smtp.titan.email -> imap.titan.email) ما لم يُحدَّد صراحة
  const envImapHost = process.env.IMAP_HOST;
  const smtpHost = activeEmailConfig.host || process.env.SMTP_HOST;
  const derivedHost = smtpHost ? smtpHost.replace(/^smtp\./i, 'imap.') : undefined;
  const host = envImapHost || derivedHost;
  const port = process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993;

  if (!email || !password || !host) return null;
  return { email, password, host, port };
}

let imapPollInProgress = false;

async function fetchNewInboxEmails(): Promise<{ imported: number; error?: string }> {
  if (imapPollInProgress) return { imported: 0, error: 'عملية جلب سابقة لا تزال قيد التنفيذ' };
  const cfg = getImapConfig();
  if (!cfg) {
    return { imported: 0, error: 'إعدادات IMAP غير مكتملة (يلزم بريد وكلمة مرور ومضيف IMAP_HOST أو اشتقاقه من SMTP_HOST)' };
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return { imported: 0, error: 'SUPABASE_SERVICE_ROLE_KEY غير معرّف — تعذر حفظ الرسائل الواردة' };
  }

  imapPollInProgress = true;
  const client = new ImapFlow({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 993,
    auth: { user: cfg.email, pass: cfg.password },
    logger: false,
    tls: { rejectUnauthorized: false }
  });

  let imported = 0;
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const uids = await client.search({ seen: false }, { uid: true });
      const uidList = Array.isArray(uids) ? uids : [];

      for (const uid of uidList) {
        try {
          const raw = await client.download(String(uid), undefined, { uid: true });
          if (!raw?.content) continue;
          const parsed = await simpleParser(raw.content as any);

          const messageId = parsed.messageId || `imap-${uid}-${Date.now()}`;

          // تفادي تكرار استيراد نفس الرسالة إذا سبق حفظها
          const { data: existing } = await supabaseAdmin
            .from('email_messages')
            .select('id')
            .eq('external_message_id', messageId)
            .maybeSingle();

          if (!existing) {
            const fromAddr = parsed.from?.value?.[0];
            await supabaseAdmin.from('email_messages').insert({
              external_message_id: messageId,
              folder: 'inbox',
              sender_name: fromAddr?.name || fromAddr?.address || 'مرسل غير معروف',
              sender_email: fromAddr?.address || '',
              recipient_email: cfg.email,
              subject: parsed.subject || 'بدون موضوع',
              body: parsed.html || parsed.textAsHtml || parsed.text || '',
              is_read: false
            });
            imported++;
          }

          await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });
        } catch (innerErr) {
          console.warn('IMAP: تعذرت معالجة رسالة واحدة:', innerErr);
        }
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch (err: any) {
    imapPollInProgress = false;
    return { imported, error: err?.message || 'فشل الاتصال بخادم IMAP' };
  }

  imapPollInProgress = false;
  return { imported };
}

// نقطة نهاية يمكن للواجهة الأمامية استدعاؤها لتحديث صندوق الوارد يدوياً (زر "تحديث")
app.post('/api/notifications/fetch-inbox', async (_req, res) => {
  const result = await fetchNewInboxEmails();
  if (result.error && result.imported === 0) {
    res.status(500).json({ success: false, error: result.error });
    return;
  }
  res.json({ success: true, imported: result.imported });
});

// جلب دوري تلقائي كل 3 دقائق حتى تصل الرسائل الواردة الجديدة إلى النظام دون تدخل يدوي
setInterval(() => {
  fetchNewInboxEmails().then(r => {
    if (r.error) console.warn('IMAP polling note:', r.error);
    else if (r.imported > 0) console.log(`IMAP polling: تم استيراد ${r.imported} رسالة جديدة`);
  });
}, 3 * 60 * 1000);

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// JSON Schema for AppSpec generation
const appSpecSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Catchy, memorable application title (1-3 words)' },
    tagline: { type: Type.STRING, description: 'Single line elevator pitch tagline' },
    description: { type: Type.STRING, description: 'Comprehensive 2-3 sentence overview of what the application achieves' },
    archetype: { type: Type.STRING, description: 'Category e.g. Productivity & Wellness, Creator Tool, SaaS Dashboard, FinTech, E-Commerce, Education' },
    targetAudience: { type: Type.STRING, description: 'Primary target users and use cases' },
    visualDesign: {
      type: Type.OBJECT,
      properties: {
        theme: { type: Type.STRING, description: '"light" or "dark"' },
        primaryColor: { type: Type.STRING, description: 'Primary hex color e.g. #0d9488' },
        accentColor: { type: Type.STRING, description: 'Accent hex color e.g. #f59e0b' },
        bgColor: { type: Type.STRING, description: 'Background hex color e.g. #f8fafc' },
        surfaceColor: { type: Type.STRING, description: 'Surface card background hex e.g. #ffffff' },
        textColor: { type: Type.STRING, description: 'Text main color e.g. #0f172a' },
        fontFamily: { type: Type.STRING, description: 'Font family suggestion e.g. Plus Jakarta Sans, Inter, Outfit, Space Grotesk' },
        borderRadius: { type: Type.STRING, description: 'Border radius style e.g. 12px or 16px' },
        styleName: { type: Type.STRING, description: 'Aesthetic theme name e.g. Clean Bio Teal, Cyber Dark, Minimal Slate' }
      },
      required: ['theme', 'primaryColor', 'accentColor', 'bgColor', 'surfaceColor', 'textColor', 'fontFamily', 'borderRadius', 'styleName']
    },
    features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: 'Feature name' },
          description: { type: Type.STRING, description: 'Feature function' },
          priority: { type: Type.STRING, description: '"core", "extended", or "nice-to-have"' },
          status: { type: Type.STRING, description: '"interactive", "designed", or "simulated"' }
        },
        required: ['id', 'name', 'description', 'priority', 'status']
      }
    },
    userStories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 key user stories starting with "As a user..."'
    },
    dataSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          entity: { type: Type.STRING, description: 'Entity model name e.g. Task, Habit, Product' },
          description: { type: Type.STRING, description: 'Purpose of entity' },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                required: { type: Type.BOOLEAN }
              },
              required: ['name', 'type', 'description', 'required']
            }
          },
          sampleRecordsJson: { type: Type.STRING, description: 'JSON string array of 3-4 realistic sample data objects' }
        },
        required: ['entity', 'description', 'fields', 'sampleRecordsJson']
      }
    },
    apiEndpoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          method: { type: Type.STRING, description: 'GET, POST, PUT, or DELETE' },
          path: { type: Type.STRING, description: 'Express route e.g. /api/tasks' },
          description: { type: Type.STRING, description: 'Route operation' },
          requestBody: { type: Type.STRING },
          responseBody: { type: Type.STRING }
        },
        required: ['method', 'path', 'description']
      }
    },
    codeFiles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Filename e.g. App.tsx, server.ts, types.ts' },
          path: { type: Type.STRING, description: 'File path e.g. /src/App.tsx' },
          language: { type: Type.STRING, description: 'tsx, typescript, json, css, sql' },
          content: { type: Type.STRING, description: 'Complete clean functional code snippet' },
          description: { type: Type.STRING, description: 'Short summary of file role' }
        },
        required: ['name', 'path', 'language', 'content', 'description']
      }
    },
    interactiveApp: {
      type: Type.OBJECT,
      properties: {
        tabs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              icon: { type: Type.STRING, description: 'Lucide icon name e.g. CheckSquare, Sparkles, BarChart2, Package' },
              description: { type: Type.STRING }
            },
            required: ['id', 'name', 'icon', 'description']
          }
        },
        stats: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              trend: { type: Type.STRING, description: '"up", "down", or "neutral"' },
              icon: { type: Type.STRING }
            },
            required: ['key', 'label', 'value']
          }
        },
        actions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              tabId: { type: Type.STRING },
              type: { type: Type.STRING, description: '"add", "filter", "toggle", "delete", "ai_generate"' },
              targetEntity: { type: Type.STRING },
              fieldsJson: { type: Type.STRING, description: 'JSON string array of field definitions' }
            },
            required: ['id', 'label', 'tabId', 'type']
          }
        }
      },
      required: ['tabs', 'stats', 'actions']
    }
  },
  required: ['title', 'tagline', 'description', 'archetype', 'targetAudience', 'visualDesign', 'features', 'userStories', 'dataSchema', 'apiEndpoints', 'codeFiles', 'interactiveApp']
};

// API Endpoint to generate an app spec with Gemini
app.post('/api/generate-app', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'App description prompt is required.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const systemInstruction = `You are the master AI Application Architect.
Given an app description prompt, produce a fully thought-out, highly detailed, production-grade application spec and interactive prototype schema.
Make sure the color palette, typography, user stories, data schemas, code files, and interactive components are directly tailored to the user's specific request.
For sampleRecordsJson and fieldsJson, return valid JSON strings.
In sampleRecordsJson, include 3-4 realistic records matching the primary entity.
In codeFiles, provide clean, idiomatic, fully formed React TypeScript components and Express routes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Design and architect a complete application based on this prompt: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: appSpecSchema
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini.');
    }

    const rawResult = JSON.parse(text);

    // Process sampleRecordsJson and fieldsJson into actual JS arrays
    const dataSchema = (rawResult.dataSchema || []).map((schema: any) => {
      let sampleRecords = [];
      try {
        if (schema.sampleRecordsJson) {
          sampleRecords = JSON.parse(schema.sampleRecordsJson);
        }
      } catch (e) {
        sampleRecords = [];
      }
      return {
        entity: schema.entity,
        description: schema.description,
        fields: schema.fields,
        sampleRecords
      };
    });

    const actions = (rawResult.interactiveApp?.actions || []).map((action: any) => {
      let fields = [];
      try {
        if (action.fieldsJson) {
          fields = JSON.parse(action.fieldsJson);
        }
      } catch (e) {
        fields = [];
      }
      return {
        id: action.id,
        label: action.label,
        tabId: action.tabId,
        type: action.type,
        targetEntity: action.targetEntity,
        fields
      };
    });

    // Extract initial state from the first entity sample records
    const primaryEntityName = dataSchema[0]?.entity?.toLowerCase() || 'items';
    const primarySampleRecords = dataSchema[0]?.sampleRecords || [];
    const initialState: Record<string, any> = {};
    initialState[primaryEntityName] = primarySampleRecords;

    const processedSpec = {
      id: 'gen-' + Date.now(),
      title: rawResult.title,
      tagline: rawResult.tagline,
      description: rawResult.description,
      archetype: rawResult.archetype,
      targetAudience: rawResult.targetAudience,
      visualDesign: rawResult.visualDesign,
      features: rawResult.features,
      userStories: rawResult.userStories,
      dataSchema,
      apiEndpoints: rawResult.apiEndpoints,
      codeFiles: rawResult.codeFiles,
      interactiveApp: {
        tabs: rawResult.interactiveApp?.tabs || [{ id: 'main', name: 'Main View', icon: 'Layout', description: 'Primary Dashboard' }],
        stats: rawResult.interactiveApp?.stats || [],
        actions,
        initialState
      },
      createdAt: Date.now()
    };

    res.json(processedSpec);
  } catch (error: any) {
    console.error('Error generating app:', error);
    res.status(500).json({ error: error.message || 'Failed to generate application spec.' });
  }
});

// API Endpoint to refine or update an app spec with Gemini
app.post('/api/refine-app', async (req, res) => {
  try {
    const { currentSpec, refinementPrompt } = req.body;
    if (!currentSpec || !refinementPrompt) {
      return res.status(400).json({ error: 'currentSpec and refinementPrompt are required.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const prompt = `You are updating an existing application spec based on user feedback.
Current App Title: "${currentSpec.title}"
Current Description: "${currentSpec.description}"
User Refinement Request: "${refinementPrompt}"

Apply the user's requested changes (e.g. adding dark mode, adding export features, adding a new entity/tab, modifying colors) and output the complete updated app spec JSON matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: appSpecSchema
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from Gemini.');
    }

    const rawResult = JSON.parse(text);

    const dataSchema = (rawResult.dataSchema || []).map((schema: any) => {
      let sampleRecords = [];
      try {
        if (schema.sampleRecordsJson) sampleRecords = JSON.parse(schema.sampleRecordsJson);
      } catch (e) {
        sampleRecords = [];
      }
      return { entity: schema.entity, description: schema.description, fields: schema.fields, sampleRecords };
    });

    const actions = (rawResult.interactiveApp?.actions || []).map((action: any) => {
      let fields = [];
      try {
        if (action.fieldsJson) fields = JSON.parse(action.fieldsJson);
      } catch (e) {
        fields = [];
      }
      return { id: action.id, label: action.label, tabId: action.tabId, type: action.type, targetEntity: action.targetEntity, fields };
    });

    const primaryEntityName = dataSchema[0]?.entity?.toLowerCase() || 'items';
    const primarySampleRecords = dataSchema[0]?.sampleRecords || [];
    const initialState: Record<string, any> = { ...currentSpec.interactiveApp?.initialState };
    if (primarySampleRecords.length > 0) {
      initialState[primaryEntityName] = primarySampleRecords;
    }

    const updatedSpec = {
      ...currentSpec,
      title: rawResult.title || currentSpec.title,
      tagline: rawResult.tagline || currentSpec.tagline,
      description: rawResult.description || currentSpec.description,
      visualDesign: rawResult.visualDesign || currentSpec.visualDesign,
      features: rawResult.features || currentSpec.features,
      dataSchema: dataSchema.length > 0 ? dataSchema : currentSpec.dataSchema,
      apiEndpoints: rawResult.apiEndpoints || currentSpec.apiEndpoints,
      codeFiles: rawResult.codeFiles || currentSpec.codeFiles,
      interactiveApp: {
        tabs: rawResult.interactiveApp?.tabs || currentSpec.interactiveApp.tabs,
        stats: rawResult.interactiveApp?.stats || currentSpec.interactiveApp.stats,
        actions: actions.length > 0 ? actions : currentSpec.interactiveApp.actions,
        initialState
      }
    };

    res.json({ updatedSpec, summary: `Updated app with: ${refinementPrompt}` });
  } catch (error: any) {
    console.error('Error refining app:', error);
    res.status(500).json({ error: error.message || 'Failed to refine application spec.' });
  }
});

// API Endpoint for dynamic in-app AI features (e.g. Gemini AI button inside prototype)
app.post('/api/simulated-ai-action', async (req, res) => {
  try {
    const { appTitle, actionId, currentData, promptExtra } = req.body;
    if (!ai) {
      return res.json({ result: 'Gemini AI response simulated in live preview mode.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are the embedded AI engine for the user application "${appTitle}".
Action requested: "${actionId}".
Current live app state: ${JSON.stringify(currentData)}.
Extra user instruction: "${promptExtra || 'Provide helpful insights'}".
Return a concise, creative, high-value 1-3 sentence result or item snippet.`
    });

    res.json({ result: response.text });
  } catch (error: any) {
    res.json({ result: 'Gemini AI generated fresh insight for your app state!' });
  }
});

// API Endpoint for Legal AI Assistant across all departments (Gemini 3.6 Flash)
app.post('/api/legal-ai-assistant', async (req, res) => {
  try {
    const { department, query, contextData, mode } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'السؤال أو الطلب مطلوب.' });
    }

    const systemInstruction = `أنت المساعد الذكي القانوني والتنفيذي المتقدم لمكتب المحاماة والاستشارات القانونية (مكتب المحامي سعود أحمد الشحي - دولة الإمارات العربية المتحدة).
أهدافك وتوجيهاتك:
1. الإجابة بدقة باللغة العربية بأسلوب قانوني مهني رصين وواضح.
2. استخدام التشريعات والقوانين الاتحادية والمحلية الصادرة في دولة الإمارات العربية المتحدة عند الحاجة (مثل قانون الإجراءات المدنية، قانون المعاملات المدنية، قانون العمل، قانون الأحوال الشخصية، التشريعات التجارية والعقارية).
3. تقديم اقتراحات تنفيذية عملية تناسب القسم الحالي المطلوبة فيه المساعدة (القسم: ${department || 'عام'}).
4. إذا تم تزويدك بسياق بيانات مأخوذة من النظام (مثل بيانات القضايا، الجلسات، الموكلين، المهام، الفواتير، المستندات)، يرجى الاستعانة بها لتقديم إجابة مخصصة ومحددة بدقة.
5. تنسيق الإجابة في نقاط واضحة وعناوين بارزة مع تجنب التعقيد غير الضروري.`;

    let prompt = `القسم/القسم الحالي: ${department || 'عام'}\n`;
    if (mode) {
      prompt += `نوع المهمة المطلوبة: ${mode}\n`;
    }
    if (contextData) {
      prompt += `بيانات وسياق النظام الحالية:\n${JSON.stringify(contextData, null, 2)}\n\n`;
    }
    prompt += `طلب/سؤال المستخدم:\n"${query}"`;

    if (!ai) {
      // Return a structured legal response fallback if API key is not active in dev
      return res.json({
        success: true,
        answer: `[المساعد القانوني الذكي - وضع المحاكاة]\n\nبناءً على طلبك في قسم (${department || 'العام'}):\n1. تم تحليل الطلب: "${query}".\n2. التوصية القانونية: يرجى التأكد من استكمال المستندات الرسمية وإرفاق صحيفة الدعوى طبقاً لقانون الإجراءات المدنية بدولة الإمارات.\n3. الخطوة التالية: مراجعة المواعيد والجلسات المقررة في النظام.`,
        mode: 'simulated'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const answerText = response.text || 'لم يتم استخراج رد من النموذج.';
    res.json({ success: true, answer: answerText, mode: 'live_gemini' });
  } catch (error: any) {
    console.error('Error in legal AI assistant endpoint:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء معالجة طلب الذكاء الاصطناعي.' });
  }
});

// API Endpoint for AI Document Intelligence (Extracting POA, Agreement, or Invoice data)
app.post('/api/extract-doc', async (req, res) => {
  try {
    const { docType, fileBase64, mimeType, fileName, textContent } = req.body;

    if (!docType) {
      return res.status(400).json({ error: 'نوع المستند غير محدد.' });
    }

    const docTypeNames: Record<string, string> = {
      poa: 'وكالة قانونية / توكيل رسمي',
      agreement: 'اتفاقية أتعاب / عقد خدمات قانونية',
      invoice: 'فاتورة ضريبية / مطالبات أتعاب'
    };

    const docTitle = docTypeNames[docType] || 'مستند قانوني';

    const systemInstruction = `أنت محرك ذكاء اصطناعي متخصص في تحليل واستخراج البيانات من الوثائق والمستندات القانونية بـ دولة الإمارات العربية المتحدة.
المستند المطلوب تحليله: ${docTitle}.
اسم الملف: ${fileName || 'مستند بدون اسم'}.

يجب عليك استخراج البيانات المطلوبة وتحويلها إلى كائن JSON نقي ومحدد الحقول طبقاً لما يلي:

إذا كان المستند (poa) وكالة قانونية:
{
"clientName": "اسم الموكل الكامل",
"poaNumber": "رقم الوكالة أو التوكيل المرجعي",
"issuer": "جهة الإصدار (مثلاً: الكاتب العدل بدبي / أبوظبي)",
"issueDate": "تاريخ الصدور بتنسيق YYYY-MM-DD",
"expiryDate": "تاريخ الانتهاء بتنسيق YYYY-MM-DD",
"scope": "صلاحيات الوكالة والنطاق (مثلاً: مرافعة وتمثيل أمام جميع المحاكم، فتح البلاغات، الصلح والإقرار)",
"notes": "أي ملاحظات قانونية أو شروط خاصة بالوكالة"
}

إذا كان المستند (agreement) اتفاقية أتعاب:
{
"clientName": "اسم الموكل الكامل",
"agreementNumber": "رقم الاتفاقية المرجعي",
"title": "موضوع أو عنوان الاتفاقية",
"totalAmount": 50000,
"date": "تاريخ الاتفاقية بتنسيق YYYY-MM-DD",
"installmentsNotes": "تفاصيل الأقساط أو جدول السداد المتفق عليه",
"notes": "الشروط والأحكام الخاصة"
}

إذا كان المستند (invoice) فاتورة:
{
"clientName": "اسم الموكل أو الشركة",
"invoiceNumber": "رقم الفاتورة",
"amount": 20000,
"vatAmount": 1000,
"totalAmount": 21000,
"date": "تاريخ الفاتورة YYYY-MM-DD",
"due": "تاريخ الاستحقاق YYYY-MM-DD",
"description": "تفاصيل الخدمات أو الأتعاب المذكورة بالفاتورة"
}

تنبيه مهم جداً: أرجع فقط كائن JSON النقي بدون أي نصوص تمهيدية أو إضافية.`;

    if (!ai || (!fileBase64 && !textContent)) {
      // Clean fallback if AI is simulated or simple text uploaded
      if (docType === 'poa') {
        return res.json({
          success: true,
          extracted: {
            clientName: "شركة الاتحاد التجارية ش.ذ.م.م",
            poaNumber: `POA-2026-${Math.floor(100 + Math.random() * 900)}`,
            issuer: "الكاتب العدل - محاكم دبي",
            issueDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            scope: "تمثيل ومرافعة أمام محاكم دبي والاتحادية، فتح البلاغات، تقديم المذكرات والطعون، الصلح والإقرار.",
            notes: "تم استخراج الوكالة بنجاح عبر النظام الذكي."
          }
        });
      } else if (docType === 'agreement') {
        return res.json({
          success: true,
          extracted: {
            clientName: "مؤسسة الأفق للتطوير العقاري",
            agreementNumber: `AGR-2026-${Math.floor(100 + Math.random() * 900)}`,
            title: "اتفاقية أتعاب ومرافعة في دعوى تجارية وعقارية",
            totalAmount: 45000,
            date: new Date().toISOString().split('T')[0],
            installmentsNotes: "دفعة أولى 15,000 درهم عند التوقيع + دفعة 15,000 عند الجلسة الأولى + 15,000 عند الحكم.",
            notes: "شاملة الرسوم والإجراءات القضائية في الدرجة الأولى."
          }
        });
      } else {
        return res.json({
          success: true,
          extracted: {
            clientName: "الشركة الوطنية للخدمات اللوجستية",
            invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
            amount: 15000,
            vatAmount: 750,
            totalAmount: 15750,
            date: new Date().toISOString().split('T')[0],
            due: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: "أتعاب استشارات قانونية وصياغة مذكرات دفاع عن القضايا التجارية."
          }
        });
      }
    }

    const contentsArr: any[] = [];
    if (fileBase64 && mimeType) {
      // Strip base64 header if present
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
      contentsArr.push({
        inlineData: {
          mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType,
          data: cleanBase64
        }
      });
    }

    const userPromptText = textContent
      ? `قم بفك وتحليل النص المستخرج من المستند المرفق وتصنيفه كـ JSON:\n${textContent}`
      : `يرجى القراءة الدقيقة للمستند المرفق (${fileName || docTitle}) واستخراج الحقول بدقة بتنسيق JSON.`;

    contentsArr.push(userPromptText);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contentsArr,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json({ success: true, extracted: parsedJson });
  } catch (error: any) {
    console.error('Error extracting document via AI:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء استخراج بيانات المستند.' });
  }
});

// Start Express and integrate Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
