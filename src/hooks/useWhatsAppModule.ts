// حالة "وحدة واتساب الأعمال" الكاملة (الاتصال بالسيرفر + المحادثات) — مستخرجة من App.tsx.
// الدوال الفعلية (fetchWaStatus, generateWaQrCode, handleSendWaMessage, إلخ) بقيت داخل App.tsx.
import { useState, useEffect } from "react";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export interface WaChatMessage {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}
export interface WaChat {
  id: number;
  name: string;
  phone: string;
  role: string;
  avatarBg: string;
  unreadCount: number;
  messages: WaChatMessage[];
}

export function useWhatsAppModule() {
  const [waBackendSession, setWaBackendSession] = useState<{
    status: "disconnected" | "qr_ready" | "connected";
    qrCodeUrl: string | null;
    pairingCode: string | null;
    phoneNumber: string | null;
    connectedAt: string | null;
    messagesCount: number;
  }>({
    status: "disconnected",
    qrCodeUrl: null,
    pairingCode: null,
    phoneNumber: null,
    connectedAt: null,
    messagesCount: 0,
  });
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  const [selectedWaChatId, setSelectedWaChatId] = useState<number>(1);
  const [waInputText, setWaInputText] = useState<string>("");
  const [waSearchTerm, setWaSearchTerm] = useState<string>("");
  const [showNewWaChatModal, setShowNewWaChatModal] = useState<boolean>(false);
  const [newWaName, setNewWaName] = useState<string>("");
  const [newWaPhone, setNewWaPhone] = useState<string>("");
  const [waChats, setWaChats] = useState<WaChat[]>(() => {
    const loaded = loadStorage<WaChat[]>("firm_wa_chats", []);
    return loaded.filter(
      (c) =>
        c.name !== "فوزية أحمد المهيري" &&
        c.name !== "شركة دار سمرا للكمبيوتر (ممثل الشركة)" &&
        c.name !== "أمانة سر محاكم دبي - كاتب الجلسة",
    );
  });

  useEffect(() => {
    saveStorage("firm_wa_chats", waChats);
  }, [waChats]);

  return {
    waBackendSession,
    setWaBackendSession,
    isGeneratingQr,
    setIsGeneratingQr,
    selectedWaChatId,
    setSelectedWaChatId,
    waInputText,
    setWaInputText,
    waSearchTerm,
    setWaSearchTerm,
    showNewWaChatModal,
    setShowNewWaChatModal,
    newWaName,
    setNewWaName,
    newWaPhone,
    setNewWaPhone,
    waChats,
    setWaChats,
  };
}
