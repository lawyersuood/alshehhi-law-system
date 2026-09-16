// حالة "نموذج إضافة سابقة قضائية" — مستخرجة من App.tsx.
import { useState } from "react";

export function usePrecedentForm() {
  const [precedentLoading, setPrecedentLoading] = useState(false);
  const [precedentForm, setPrecedentForm] = useState({
    title: "",
    court_name: "المحكمة الاتحادية العليا",
    ruling_year: new Date().getFullYear(),
    category: "تجاري",
    circuit_name: "الدائرة التجارية",
    appeal_number: "",
    summary_text: "",
  });
  const [precedentPdfFile, setPrecedentPdfFile] = useState<File | null>(null);
  const [precedentWordFile, setPrecedentWordFile] = useState<File | null>(null);

  return {
    precedentLoading,
    setPrecedentLoading,
    precedentForm,
    setPrecedentForm,
    precedentPdfFile,
    setPrecedentPdfFile,
    precedentWordFile,
    setPrecedentWordFile,
  };
}
