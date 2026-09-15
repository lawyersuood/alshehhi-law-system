// حالة "بوابة الموكل ومولّد المستندات + جدول تدوير المواعيد" — مستخرجة من App.tsx.
import { useState } from "react";
import { todayISO } from "../domain/utils";

export function useDocGenState() {
  const [clientPortalId, setClientPortalId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("notice");
  const [selectedGenCaseId, setSelectedGenCaseId] = useState<number>(1);

  const [notifyModal, setNotifyModal] = useState<{
    recipientName: string;
    recipientPhone: string;
    recipientEmail: string;
    channel: "واتساب" | "إيميل" | "كلاهما";
    type: "تنبيه جلسة" | "تحديث قضية" | "تذكير فاتورة" | "تجديد وثائق / KYC" | "تجديد وكالة / POA" | "تنبيه ميعاد طعن / استئناف" | "تذكير قسط فاتورة" | "رسالة عامة";
    subject: string;
    message: string;
    relatedRef?: string;
  } | null>(null);

  const [selectedRollDate, setSelectedRollDate] = useState<string>(todayISO());
  const [rollCourtFilter, setRollCourtFilter] = useState<string>("الكل");

  return {
    clientPortalId, setClientPortalId,
    selectedTemplateId, setSelectedTemplateId,
    selectedGenCaseId, setSelectedGenCaseId,
    notifyModal, setNotifyModal,
    selectedRollDate, setSelectedRollDate,
    rollCourtFilter, setRollCourtFilter,
  };
}
