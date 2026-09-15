// حالة "مودال المساعد الذكي" — مستخرجة من App.tsx. handleAskAiAssistant/openAiForCurrentSection
// بقيتا داخل App.tsx (تحتاجان قراءة بيانات واسعة من التطبيق: قضايا، موكلين، فواتير...).
import { useState } from "react";

export function useAiAssistantModal() {
  const [isAiAssistantEnabled, setIsAiAssistantEnabled] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiDepartment, setAiDepartment] = useState<string>("عام");
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<string>("advice");

  return {
    isAiAssistantEnabled, setIsAiAssistantEnabled,
    showAiModal, setShowAiModal,
    aiDepartment, setAiDepartment,
    aiQuery, setAiQuery,
    aiResponse, setAiResponse,
    aiLoading, setAiLoading,
    aiError, setAiError,
    aiMode, setAiMode,
  };
}
