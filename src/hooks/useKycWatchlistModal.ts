// حالة "مودال ومرشحات قائمة العقوبات KYC" — مستخرجة من App.tsx.
// checkAndAuditClientKyc بقيت داخل App.tsx (تعتمد على logAuditAction).
import { useState } from "react";
import type { KycWatchlistItem } from "../domain/types";

export function useKycWatchlistModal() {
  const [showKycWatchlistUploadModal, setShowKycWatchlistUploadModal] = useState(false);
  const [kycWatchlistSearch, setKycWatchlistSearch] = useState("");
  const [kycTypeFilter, setKycTypeFilter] = useState<string>("الكل");
  const [kycSanctionAlert, setKycSanctionAlert] = useState<{ clientName: string; idNo?: string; watchlistItem: KycWatchlistItem } | null>(null);
  const [kycSanctionAckReason, setKycSanctionAckReason] = useState<string>("");

  return {
    showKycWatchlistUploadModal, setShowKycWatchlistUploadModal,
    kycWatchlistSearch, setKycWatchlistSearch,
    kycTypeFilter, setKycTypeFilter,
    kycSanctionAlert, setKycSanctionAlert,
    kycSanctionAckReason, setKycSanctionAckReason,
  };
}
