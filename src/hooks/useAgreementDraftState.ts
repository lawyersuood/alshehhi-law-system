// حالة "معاينة/تعديل اتفاقيات الأتعاب والإنابات" — مستخرجة من App.tsx.
// setAgr/setAgrInst ودوال الحفظ الفعلية (saveOfficeAgreement, handleExecuteDeleteAgreement, إلخ)
// بقيت داخل App.tsx وتستخدم setAgrForm العائد من هذا الهوك مباشرة.
import { useState, useRef } from "react";
import type { OfficeAgreement } from "../domain/types";
import { todayISO } from "../domain/utils";

function emptyAgrForm() {
  return {
    contractDate: todayISO(),
    contractCity: "الشارقة",
    clientMode: "new" as "new" | "existing",
    existingClientId: "",
    clientNameAr: "",
    clientNameEn: "",
    representativeAr: "",
    representativeEn: "",
    clientType: "شركة",
    idNo: "",
    phone: "",
    email: "",
    emirate: "الشارقة",
    address: "",
    caseDetailsAr: "",
    caseDetailsEn: "",
    installments: [{ amount: "", dueDate: todayISO(), paidOnSigning: true }] as any[],
  };
}

export function useAgreementDraftState() {
  const [agrPreviewId, setAgrPreviewId] = useState<number | null>(null);
  const [delegationPreviewId, setDelegationPreviewId] = useState<number | null>(null);
  const [deleteAgrConfirm, setDeleteAgrConfirm] = useState<OfficeAgreement | null>(null);

  const [editingDelegationWording, setEditingDelegationWording] = useState(false);
  const [delegationDraftHtml, setDelegationDraftHtml] = useState("");
  const delegationBodyRef = useRef<HTMLDivElement>(null);

  const [editingAgreementClauses, setEditingAgreementClauses] = useState(false);
  const [agreementClausesDraft, setAgreementClausesDraft] = useState<{ ar: string; en: string }[]>(
    [],
  );

  const [agrForm, setAgrForm] = useState<any>(emptyAgrForm());

  return {
    agrPreviewId,
    setAgrPreviewId,
    delegationPreviewId,
    setDelegationPreviewId,
    deleteAgrConfirm,
    setDeleteAgrConfirm,
    editingDelegationWording,
    setEditingDelegationWording,
    delegationDraftHtml,
    setDelegationDraftHtml,
    delegationBodyRef,
    editingAgreementClauses,
    setEditingAgreementClauses,
    agreementClausesDraft,
    setAgreementClausesDraft,
    agrForm,
    setAgrForm,
    emptyAgrForm,
  };
}
