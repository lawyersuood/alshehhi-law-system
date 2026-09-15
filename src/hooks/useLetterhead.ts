// حالة "الترويسة الرسمية" (شعار المكتب، التوقيع، الختم) — مستخرجة من App.tsx.
// updateLetterhead بقيت داخل App.tsx (تستخدم setLetterhead العائد من هذا الهوك).
import { useState } from "react";
import { loadLetterhead } from "../domain/utils";

export function useLetterhead() {
  const [letterhead, setLetterhead] = useState(loadLetterhead);
  return { letterhead, setLetterhead };
}
