// حالة سجلات الوقت/المصروفات/الأمانة والبلاغات (Time Logs, Case Expenses, Trust Transactions,
// Invoice Installments, STR Reports) — مستخرجة من App.tsx بنفس نمط الهوكس السابقة.
//
// إصلاح كامل (بناءً على طلب المستخدم "حفظ حقيقي"): هذه الحالات لم يكن لها أي حفظ فعلي بالكود
// الأصلي — فقط بيانات ابتدائية بالذاكرة تُفقد عند أي تحديث للصفحة. الحل هنا يطابق تماماً نفس نمط
// المزامنة المستخدم لباقي أقسام النظام (نفس أسلوب remainingSyncTables في App.tsx): عند أول تحميل،
// نجلب النسخة من Supabase — إن وُجدت نستخدمها ونحفظها محلياً، وإلا (لا يوجد اتصال أو الجدول فارغ على
// الخادم) نرفع أي بيانات محلية موجودة. بعد أول تحميل، أي تغيير لاحق يُحفظ محلياً فوراً ويُرفع
// لـ Supabase بعد تأخير بسيط (1.5 ثانية) لتفادي رفع كل حرف يُكتب. هذا يعني البيانات الآن تُحفظ
// دائماً ولا تُفقد، وتُشارك بين كل الموظفين وكل الأجهزة، بنفس ضمانات الأقسام الأخرى (القضايا،
// الفواتير، إلخ).
//
// ملاحظة تقنية: جداول Supabase الجديدة المطلوبة هنا (time_logs, case_expenses, trust_transactions,
// invoice_installments, str_reports) يجب أن تكون بنفس شكل الجداول الموجودة أصلاً بالنظام —
// عمودين فقط: id (رقم، مفتاح أساسي) وdata (jsonb، يحتوي الكائن الكامل). إن لم تكن هذه الجداول
// موجودة بعد بقاعدة بياناتك، أرسل لي تأكيداً وسأجهز لك سكربت SQL لإنشائها مع سياسات RLS المناسبة —
// بدون هذه الجداول ستستمر البيانات بالحفظ محلياً فقط (بدون كسر أي شيء، فقط بدون مزامنة بين الأجهزة).
import { useState, useEffect, useRef } from "react";
import type { TimeLog, CaseExpense, TrustTransaction, InvoiceInstallment, StrReport } from "../domain/types";
import {
  seedTimeLogs, seedCaseExpenses, seedTrustTransactions, seedInstallments, seedStrReports,
} from "../domain/seedData";
import { loadStorage, saveStorage, fetchSupabaseTable, pushSupabaseTable } from "../domain/storageAndMessaging";

function useSyncedRecord<T extends { id: number }>(storageKey: string, supabaseTable: string, seed: T[]) {
  const [value, setValue] = useState<T[]>(() => loadStorage(storageKey, seed));
  const hydratedRef = useRef(false);

  // المزامنة الأولية من Supabase عند أول تحميل فقط
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchSupabaseTable<T>(supabaseTable);
      if (cancelled) return;
      if (remote && remote.length > 0) {
        setValue(remote);
        saveStorage(storageKey, remote);
      } else if (remote !== null && value.length > 0) {
        pushSupabaseTable(supabaseTable, value);
      }
      hydratedRef.current = true;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // الحفظ المحلي الفوري + الرفع المؤجل لـ Supabase بعد أي تغيير لاحق
  useEffect(() => {
    saveStorage(storageKey, value);
    if (hydratedRef.current) {
      const t = setTimeout(() => pushSupabaseTable(supabaseTable, value), 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue] as const;
}

export function useBillingRecords() {
  const [timeLogs, setTimeLogs] = useSyncedRecord<TimeLog>("firm_time_logs", "time_logs", seedTimeLogs);
  const [caseExpenses, setCaseExpenses] = useSyncedRecord<CaseExpense>("firm_case_expenses", "case_expenses", seedCaseExpenses);
  const [trustTransactions, setTrustTransactions] = useSyncedRecord<TrustTransaction>("firm_trust_transactions", "trust_transactions", seedTrustTransactions);
  const [installments, setInstallments] = useSyncedRecord<InvoiceInstallment>("firm_installments", "invoice_installments", seedInstallments);
  const [strReports, setStrReports] = useSyncedRecord<StrReport>("firm_str_reports", "str_reports", seedStrReports);

  return {
    timeLogs, setTimeLogs,
    caseExpenses, setCaseExpenses,
    trustTransactions, setTrustTransactions,
    installments, setInstallments,
    strReports, setStrReports,
  };
}
