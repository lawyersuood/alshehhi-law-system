// حالة "مودالات الاستخراج الذكي للمستندات" (وكالات، اتفاقيات أتعاب، فواتير) — مستخرجة من App.tsx.
// handleProcessDocAiExtract/handleSaveExtractedPoa/handleSaveExtractedAgreement/handleParseInvoicesExcel/
// handleConfirmImportInvoices بقيت داخل App.tsx (تعتمد على clients/poas/feeAgreements/إلخ مباشرة).
import { useState } from "react";

export function useAiDocExtraction() {
  const [showPoaAiUploadModal, setShowPoaAiUploadModal] = useState(false);
  const [poaAiLoading, setPoaAiLoading] = useState(false);
  const [poaAiExtracted, setPoaAiExtracted] = useState<any | null>(null);
  const [selectedPoaClientId, setSelectedPoaClientId] = useState<number | "new">("new");

  const [showAgreementAiUploadModal, setShowAgreementAiUploadModal] = useState(false);
  const [agreementAiLoading, setAgreementAiLoading] = useState(false);
  const [agreementAiExtracted, setAgreementAiExtracted] = useState<any | null>(null);
  const [selectedAgrClientId, setSelectedAgrClientId] = useState<number | "new">("new");

  const [showInvoiceImportModal, setShowInvoiceImportModal] = useState(false);
  const [invoiceImportTab, setInvoiceImportTab] = useState<"excel" | "pdf_ai">("excel");
  const [invoiceAiLoading, setInvoiceAiLoading] = useState(false);
  const [invoiceAiExtracted, setInvoiceAiExtracted] = useState<any | null>(null);
  const [excelInvoicesParsed, setExcelInvoicesParsed] = useState<any[]>([]);

  return {
    showPoaAiUploadModal,
    setShowPoaAiUploadModal,
    poaAiLoading,
    setPoaAiLoading,
    poaAiExtracted,
    setPoaAiExtracted,
    selectedPoaClientId,
    setSelectedPoaClientId,
    showAgreementAiUploadModal,
    setShowAgreementAiUploadModal,
    agreementAiLoading,
    setAgreementAiLoading,
    agreementAiExtracted,
    setAgreementAiExtracted,
    selectedAgrClientId,
    setSelectedAgrClientId,
    showInvoiceImportModal,
    setShowInvoiceImportModal,
    invoiceImportTab,
    setInvoiceImportTab,
    invoiceAiLoading,
    setInvoiceAiLoading,
    invoiceAiExtracted,
    setInvoiceAiExtracted,
    excelInvoicesParsed,
    setExcelInvoicesParsed,
  };
}
