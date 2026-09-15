// حالة "مزامنة جوجل كالندر" — مستخرجة من App.tsx.
import { useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";

export function useGoogleCalendarModal() {
  const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  return { showGoogleCalendarModal, setShowGoogleCalendarModal, googleUser, setGoogleUser, googleToken, setGoogleToken };
}
