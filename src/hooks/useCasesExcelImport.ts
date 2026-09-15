// حالة "استيراد القضايا من ملف Excel" — مستخرجة من App.tsx.
import { useState } from "react";

export function useCasesExcelImport() {
  const [showCasesExcelModal, setShowCasesExcelModal] = useState(false);
  const [excelCasesParsed, setExcelCasesParsed] = useState<any[]>([]);
  const [casesExcelLoading, setCasesExcelLoading] = useState(false);
  return { showCasesExcelModal, setShowCasesExcelModal, excelCasesParsed, setExcelCasesParsed, casesExcelLoading, setCasesExcelLoading };
}
