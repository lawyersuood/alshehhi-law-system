// حالة "مواعيد الأحكام/الطعون" (Judgment Deadlines) — مستخرجة من App.tsx بنفس نمط الهوكس السابقة.
// نفس منطق التنظيف التلقائي الأصلي حرفياً (إزالة بيانات الطعون التجريبية القديمة) — بدون تغيير بالسلوك.
import { useState, useEffect } from "react";
import type { JudgmentDeadline } from "../domain/types";
import { seedDeadlines } from "../domain/seedData";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export function useDeadlines() {
  const [deadlines, setDeadlines] = useState<JudgmentDeadline[]>(() => {
    const stored = loadStorage("firm_deadlines", seedDeadlines);
    const FAKE_DEMO_DEADLINE_IDS = new Set([1, 2, 3]);
    const FAKE_DEMO_CASE_IDS = new Set([101, 102, 103]);
    const cleaned = stored.filter(
      (d) => !(FAKE_DEMO_DEADLINE_IDS.has(d.id) && FAKE_DEMO_CASE_IDS.has(d.caseId)),
    );
    if (cleaned.length !== stored.length) {
      saveStorage("firm_deadlines", cleaned);
      return cleaned;
    }
    return stored;
  });

  useEffect(() => {
    saveStorage("firm_deadlines", deadlines);
  }, [deadlines]);

  return { deadlines, setDeadlines };
}
