// دوال المساعد الذكي (handleAskAiAssistant/openAiForCurrentSection) — مستخرجة من App.tsx حرفياً
// بدون أي تغيير بالمنطق. كانت جزءاً من "النواة" المشتركة لأنها تقرأ بيانات واسعة من التطبيق
// (قضايا/موكلين/جلسات/فواتير/مهام) لتزويد النموذج بسياق دقيق — نفس نمط useBackupExportRestore:
// تستقبل كل ما تحتاجه كمعاملات صريحة بدل الاعتماد الضمني على متغيرات App().
import type { CaseItem, Client, Hearing, Invoice, TaskItem } from "../domain/types";
import { authedFetch } from "../supabaseClient";

export interface AiAssistantDeps {
  tab: string;
  cases: CaseItem[];
  clients: Client[];
  hearings: Hearing[];
  invoices: Invoice[];
  tasks: TaskItem[];
  aiQuery: string;
  setAiQuery: (v: string) => void;
  aiDepartment: string;
  setAiDepartment: (v: string) => void;
  aiMode: string;
  aiResponse: string | null;
  setAiResponse: (v: string | null) => void;
  aiLoading: boolean;
  setAiLoading: (v: boolean) => void;
  aiError: string | null;
  setAiError: (v: string | null) => void;
  setShowAiModal: (v: boolean) => void;
}

export function useAiAssistant(deps: AiAssistantDeps) {
  const handleAskAiAssistant = async (
    customQuery?: string,
    customDept?: string,
    customMode?: string,
  ) => {
    const {
      aiQuery,
      aiDepartment,
      aiMode,
      tab,
      cases,
      clients,
      hearings,
      invoices,
      tasks,
      setAiLoading,
      setAiError,
      setAiResponse,
    } = deps;

    const q = (customQuery !== undefined ? customQuery : aiQuery).trim();
    if (!q) return;

    const deptToUse = customDept || aiDepartment || tab || "general";
    const modeToUse = customMode || aiMode || "advice";

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    // تجهيز سياق بيانات النظام المأخوذة من القسم المختار لتزويد النموذج بإجابة دقيقة
    let contextData: any = null;
    if (deptToUse === "cases" || deptToUse.includes("القضايا")) {
      contextData = cases.slice(0, 6).map((c) => ({
        كود: c.number,
        موضوع_القضية: c.subject,
        المحكمة: c.court,
        النوع: c.type,
        الحالة: c.status,
      }));
    } else if (deptToUse === "clients" || deptToUse.includes("الموكلين")) {
      contextData = clients
        .slice(0, 6)
        .map((cl) => ({ الاسم: cl.name, النوع: cl.type, الإمارات: cl.emirate, هاتف: cl.phone }));
    } else if (deptToUse === "hearings" || deptToUse.includes("الجلسات")) {
      contextData = hearings
        .slice(0, 6)
        .map((h) => ({ التاريخ: h.date, المحكمة: h.type, ملاحظات: h.notes }));
    } else if (deptToUse === "invoices" || deptToUse.includes("الفواتير")) {
      contextData = invoices
        .slice(0, 6)
        .map((inv) => ({ رقم_الفاتورة: inv.number, المبلغ: inv.amount, الحالة: inv.status }));
    } else if (deptToUse === "tasks" || deptToUse.includes("المهام")) {
      contextData = tasks
        .slice(0, 6)
        .map((t) => ({ المهمة: t.title, الأولوية: t.priority, المكلف: t.assignee }));
    }

    try {
      const res = await authedFetch("/api/legal-ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: deptToUse,
          query: q,
          contextData,
          mode: modeToUse,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setAiResponse(data.answer);
      } else {
        setAiError(data.error || "تعذر الحصول على رد من المساعد الذكي.");
      }
    } catch (err: any) {
      setAiError("حدث خطأ في الاتصال بالذكاء الاصطناعي: " + (err.message || err));
    } finally {
      setAiLoading(false);
    }
  };

  const openAiForCurrentSection = (promptText?: string, modeName?: string) => {
    const { tab, setAiDepartment, setAiResponse, setAiError, setShowAiModal, setAiQuery } = deps;

    const currentDeptMap: Record<string, string> = {
      dashboard: "عام",
      cases: "القضايا والدعاوى",
      clients: "الموكلين وجهات الاتصال",
      hearings: "الجلسات والمواعيد",
      tasks: "المهام والتوكيلات",
      invoices: "الفواتير والمالية",
      contracts: "العقود والاتفاقيات",
      docs: "المستندات والأرشيف",
      employees: "الموظفين والكادر",
      consultations: "حجوزات الاستشارات",
      users: "إدارة المستخدمين",
    };

    const sectionLabel = currentDeptMap[tab] || "عام";
    setAiDepartment(sectionLabel);
    setAiResponse(null);
    setAiError(null);
    setShowAiModal(true);

    if (promptText) {
      setAiQuery(promptText);
      handleAskAiAssistant(promptText, sectionLabel, modeName || "advice");
    }
  };

  return { handleAskAiAssistant, openAiForCurrentSection };
}
