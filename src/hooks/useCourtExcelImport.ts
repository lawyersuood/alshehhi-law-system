// حالة "استيراد جهات اتصال المحكمة من Excel" — مستخرجة من App.tsx.
import { useState } from "react";
import type { CourtContact } from "../domain/types";

export function useCourtExcelImport() {
  const [courtExcelModalOpen, setCourtExcelModalOpen] = useState(false);
  const [courtImportPreviewList, setCourtImportPreviewList] = useState<Partial<CourtContact>[]>([]);
  const [courtExcelImportMode, setCourtExcelImportMode] = useState<"append" | "replace">("append");
  const [courtExcelFileName, setCourtExcelFileName] = useState<string>("");
  const [courtExcelImportStatus, setCourtExcelImportStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  return {
    courtExcelModalOpen, setCourtExcelModalOpen,
    courtImportPreviewList, setCourtImportPreviewList,
    courtExcelImportMode, setCourtExcelImportMode,
    courtExcelFileName, setCourtExcelFileName,
    courtExcelImportStatus, setCourtExcelImportStatus,
  };
}
