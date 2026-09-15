// حالة "مودالات Supabase SQL والنسخ الاحتياطي/الاستعادة" — مستخرجة من App.tsx.
// handleExportBackup/executeRestore/handleFileChangeForRestore بقيت داخل App.tsx (تقرأ/تكتب كل بيانات النظام).
import { useState } from "react";

export function useBackupRestoreModal() {
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [backupActiveTab, setBackupActiveTab] = useState<"export" | "restore">("export");
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  return {
    showSupabaseModal, setShowSupabaseModal,
    showBackupModal, setShowBackupModal,
    backupActiveTab, setBackupActiveTab,
    restorePreview, setRestorePreview,
    restoreError, setRestoreError,
    restoreSuccessMsg, setRestoreSuccessMsg,
  };
}
