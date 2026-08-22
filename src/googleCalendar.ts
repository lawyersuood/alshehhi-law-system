import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Calendar events scope for syncing court hearings
provider.addScope("https://www.googleapis.com/auth/calendar.events");
provider.setCustomParameters({ prompt: "select_account" });

// In-memory token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("لم يتم الحصول على تصريح الوصول (OAuth Access Token) من Google Calendar.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Sign-In error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface GoogleCalendarEventPayload {
  id?: string;
  summary: string;
  description: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  colorId?: string;
}

/**
 * Creates a single event in the user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEventPayload
): Promise<any> {
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `فشل إضافة الجلسة إلى Google Calendar (كود: ${res.status})`);
  }

  return await res.json();
}

/**
 * Lists upcoming events from Google Calendar
 */
export async function listGoogleCalendarEvents(
  accessToken: string,
  maxResults = 20
): Promise<any[]> {
  const timeMin = new Date().toISOString();
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `فشل جلب مواعيد Google Calendar`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Deletes an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 404) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `فشل حذف الموعد من Google Calendar`);
  }

  return true;
}

/**
 * Helper to build Google Calendar ISO timestamps
 */
export function formatCalendarDateTime(dateStr: string, timeStr: string, durationMinutes = 60) {
  // Assume date format YYYY-MM-DD and time HH:mm
  const [hours, mins] = (timeStr || "09:00").split(":").map(Number);
  const startDate = new Date(dateStr);
  startDate.setHours(hours || 9, mins || 0, 0, 0);

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  // UAE Time Offset is UTC+4
  const formatWithOffset = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${year}-${month}-${day}T${hh}:${mm}:${ss}+04:00`;
  };

  return {
    startDateTime: formatWithOffset(startDate),
    endDateTime: formatWithOffset(endDate)
  };
}
