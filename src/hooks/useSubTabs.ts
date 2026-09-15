// حالة تبويبات فرعية بسيطة لعدة شاشات (فواتير، مستندات، KYC، جلسات) — مستخرجة من App.tsx.
import { useState } from "react";

export function useSubTabs() {
  const [invoiceSubTab, setInvoiceSubTab] = useState<"invoices" | "agreements" | "payments" | "time" | "trust" | "expenses">("payments");
  const [docSubTab, setDocSubTab] = useState<"archive" | "generator" | "officialLetters">("archive");
  const [kycSubTab, setKycSubTab] = useState<"kyc" | "watchlist" | "str">("kyc");
  const [hearingSubTab, setHearingSubTab] = useState<"hearings" | "deadlines">("hearings");

  return {
    invoiceSubTab, setInvoiceSubTab,
    docSubTab, setDocSubTab,
    kycSubTab, setKycSubTab,
    hearingSubTab, setHearingSubTab,
  };
}
