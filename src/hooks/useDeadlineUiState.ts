// حالة واجهة شاشة "مواعيد الأحكام والطعون" (فلاتر، مودالات) — مستخرجة من App.tsx.
import { useState } from "react";
import type { JudgmentDeadline } from "../domain/types";

export function useDeadlineUiState() {
  const [autoCheckStatus, setAutoCheckStatus] = useState<{
    lastCheckedAt?: string;
    message?: string;
    isChecking?: boolean;
  }>({});
  const [deadlineFilter, setDeadlineFilter] = useState<
    "all" | "urgent" | "active" | "done" | "notneeded"
  >("all");
  const [selectedDeadlineLogs, setSelectedDeadlineLogs] = useState<JudgmentDeadline | null>(null);
  const [reassignDeadlineModal, setReassignDeadlineModal] = useState<JudgmentDeadline | null>(null);

  return {
    autoCheckStatus,
    setAutoCheckStatus,
    deadlineFilter,
    setDeadlineFilter,
    selectedDeadlineLogs,
    setSelectedDeadlineLogs,
    reassignDeadlineModal,
    setReassignDeadlineModal,
  };
}
