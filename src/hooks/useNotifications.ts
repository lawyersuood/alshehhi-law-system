// حالة "سجل الإشعارات" — مستخرجة من App.tsx.
import { useState } from "react";
import type { NotificationLog } from "../domain/types";
import { seedNotifications } from "../domain/seedData";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationLog[]>(seedNotifications);
  return { notifications, setNotifications };
}
