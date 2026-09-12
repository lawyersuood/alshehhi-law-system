import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  Briefcase,
  MapPin,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
  Bell
} from "lucide-react";
import {
  googleSignIn,
  googleLogout,
  createGoogleCalendarEvent,
  formatCalendarDateTime,
  GoogleCalendarEventPayload
} from "../googleCalendar";
import type { Hearing, CaseItem } from "../domain/types";

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  hearings: Hearing[];
  cases: CaseItem[];
  clients: any[];
  onHearingsUpdated: (updatedHearings: Hearing[]) => void;
  googleUser: User | null;
  googleToken: string | null;
  onAuthChange: (user: User | null, token: string | null) => void;
}

export default function GoogleCalendarSyncModal({
  isOpen,
  onClose,
  hearings,
  cases,
  clients,
  onHearingsUpdated,
  googleUser,
  googleToken,
  onAuthChange,
}: GoogleCalendarSyncModalProps) {
  const [selectedHearingIds, setSelectedHearingIds] = useState<number[]>(() =>
    hearings.filter((h) => !h.done).map((h) => h.id)
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [syncResults, setSyncResults] = useState<{
    success: number;
    failed: number;
    messages: string[];
  } | null>(null);

  const [reminderSettings, setReminderSettings] = useState({
    dayBefore: true,
    twoHoursBefore: true,
    emailDayBefore: true,
  });

  if (!isOpen) return null;

  const clientName = (id: number) => clients.find((c) => c.id === id)?.name || "—";
  const caseItem = (id: number) => cases.find((c) => c.id === id);

  const handleGoogleConnect = async () => {
    setIsSigningIn(true);
    setSyncResults(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user, res.accessToken);
      }
    } catch (err: any) {
      console.error("Google Auth failed:", err);
      alert(err.message || "حدث خطأ أثناء الاتصال بحساب Google. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await googleLogout();
      onAuthChange(null, null);
      setSyncResults(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const toggleHearingSelection = (id: number) => {
    setSelectedHearingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedHearingIds(hearings.filter((h) => !h.done).map((h) => h.id));
  };

  const deselectAll = () => {
    setSelectedHearingIds([]);
  };

  const handleSyncToGoogle = async () => {
    if (!googleToken) {
      alert("يرجى تسجيل الدخول بحساب Google أولاً للمتابعة.");
      return;
    }

    const toSync = hearings.filter((h) => selectedHearingIds.includes(h.id));
    if (toSync.length === 0) {
      alert("يرجى اختيار جلسة واحدة على الأقل للمزامنة.");
      return;
    }

    const confirmed = window.confirm(
      `هل ترغب في مزامنة وتصدير ${toSync.length} جلسة قضائية إلى تقويم Google الخاص بك (${googleUser?.email})؟`
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setSyncProgress({ current: 0, total: toSync.length });
    setSyncResults(null);

    let successCount = 0;
    let failedCount = 0;
    const messages: string[] = [];
    const updated = [...hearings];

    // Build reminders array
    const overrides: Array<{ method: "email" | "popup"; minutes: number }> = [];
    if (reminderSettings.dayBefore) overrides.push({ method: "popup", minutes: 1440 });
    if (reminderSettings.twoHoursBefore) overrides.push({ method: "popup", minutes: 120 });
    if (reminderSettings.emailDayBefore) overrides.push({ method: "email", minutes: 1440 });

    for (let i = 0; i < toSync.length; i++) {
      const h = toSync[i];
      const cs = caseItem(h.caseId);
      const cl = cs ? clientName(cs.clientId) : "غير محدد";
      const { startDateTime, endDateTime } = formatCalendarDateTime(h.date, h.time);

      const descriptionText = [
        `🏛️ جلسة قضائية مجدولة`,
        `--------------------------------`,
        `• رقم القضية: ${cs ? cs.number : "—"}`,
        `• المحكمة: ${cs ? cs.court : "—"}`,
        `• الدائرة / القاضي: ${cs?.judge || "—"}`,
        `• الموكل: ${cl}`,
        `• نوع الجلسة: ${h.type}`,
        `• القاعة والوقت: ${h.room} (${h.time})`,
        h.notes ? `• المطلوب في الجلسة: ${h.notes}` : "",
        `--------------------------------`,
        `تمت المزامنة آلياً عبر نظام إدارة مكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية.`
      ]
        .filter(Boolean)
        .join("\n");

      const payload: GoogleCalendarEventPayload = {
        summary: `⚖️ جلسة قضائية: ${cs ? cs.number : "قضية"} - ${h.type}`,
        description: descriptionText,
        location: h.room || cs?.court || "المحكمة",
        start: {
          dateTime: startDateTime,
          timeZone: "Asia/Dubai",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "Asia/Dubai",
        },
        reminders: {
          useDefault: overrides.length === 0,
          overrides: overrides.length > 0 ? overrides : undefined,
        },
        colorId: "11", // Red/bold highlight in Google Calendar
      };

      try {
        const createdEvent = await createGoogleCalendarEvent(googleToken, payload);
        successCount++;
        messages.push(`✅ تمت مزامنة: ${cs ? cs.number : `جلسة #${h.id}`} بنجاح.`);

        // Update hearing record with sync metadata
        const idx = updated.findIndex((item) => item.id === h.id);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            googleCalendarEventId: createdEvent.id,
            googleSyncedAt: new Date().toISOString(),
          };
        }
      } catch (err: any) {
        failedCount++;
        messages.push(`❌ فشلت مزامنة: ${cs ? cs.number : `جلسة #${h.id}`} (${err.message})`);
      }

      setSyncProgress({ current: i + 1, total: toSync.length });
    }

    onHearingsUpdated(updated);
    setIsSyncing(false);
    setSyncResults({
      success: successCount,
      failed: failedCount,
      messages,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-l from-amber-500/10 via-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-xs">
              <CalendarDays size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>مزامنة جدول الجلسات مع Google Calendar</span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Google API
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                تصدير ومزامنة مواعيد الجلسات القضائية إلى تقويم Google لتلقي التنبيهات على هواتفك وأجهزتك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* حالة الاتصال بحساب Google */}
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {googleUser ? (
                  <div className="relative">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt="Avatar"
                        className="h-11 w-11 rounded-full border-2 border-emerald-500 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                        {googleUser.email?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    {googleUser ? (
                      <>
                        <span>{googleUser.displayName || "مستخدم Google"}</span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          متصل بـ Google Calendar
                        </span>
                      </>
                    ) : (
                      <span>الاتصال بحساب Google Calendar</span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {googleUser?.email || "سجّل الدخول لمنح الصلاحية لمزامنة الجلسات مباشرة في تقويمك"}
                  </p>
                </div>
              </div>

              <div>
                {googleUser ? (
                  <button
                    onClick={handleGoogleDisconnect}
                    className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <LogOut size={14} /> تسجيل الخروج
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleConnect}
                    disabled={isSigningIn}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSigningIn ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>جارٍ الاتصال...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>تسجيل الدخول بـ Google</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* خيارات التنبيهات والإشعارات في التقويم */}
          <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Bell size={15} className="text-amber-600" />
              <span>إعدادات الإشعارات والتذكير التلقائي في Google Calendar:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-stone-50 cursor-pointer hover:bg-stone-100 transition">
                <input
                  type="checkbox"
                  checked={reminderSettings.dayBefore}
                  onChange={(e) =>
                    setReminderSettings({ ...reminderSettings, dayBefore: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>تنبيه هاتف قبل 24 ساعة (يوم)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-stone-50 cursor-pointer hover:bg-stone-100 transition">
                <input
                  type="checkbox"
                  checked={reminderSettings.twoHoursBefore}
                  onChange={(e) =>
                    setReminderSettings({ ...reminderSettings, twoHoursBefore: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>تنبيه هاتف قبل ساعتين</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-stone-50 cursor-pointer hover:bg-stone-100 transition">
                <input
                  type="checkbox"
                  checked={reminderSettings.emailDayBefore}
                  onChange={(e) =>
                    setReminderSettings({ ...reminderSettings, emailDayBefore: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>إشعار بريد إلكتروني قبل يوم</span>
              </label>
            </div>
          </div>

          {/* قائمة الجلسات المتاحة للمزامنة */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  الجلسات المجدولة ({hearings.filter((h) => !h.done).length} جلسة قادمة)
                </h4>
                <p className="text-xs text-slate-500">
                  تم تحديد <span className="font-bold text-slate-900">{selectedHearingIds.length}</span> جلسة للمزامنة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition cursor-pointer"
                >
                  تحديد الكل
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
              {hearings
                .filter((h) => !h.done)
                .map((h) => {
                  const cs = caseItem(h.caseId);
                  const isSelected = selectedHearingIds.includes(h.id);
                  const isSynced = Boolean((h as any).googleCalendarEventId);

                  return (
                    <div
                      key={h.id}
                      onClick={() => toggleHearingSelection(h.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-amber-400 shadow-2xs"
                          : "bg-white/60 border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            isSelected
                              ? "bg-amber-500 border-amber-500 text-slate-950"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {cs ? cs.number : `قضية #${h.caseId}`}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 bg-stone-100 px-2 py-0.5 rounded">
                              {h.type}
                            </span>
                            {isSynced && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 size={11} /> تمت المزامنة سابقاً
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>📅 {h.date}</span>
                            <span>⏰ {h.time}</span>
                            <span>🏛️ {h.room}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-left text-xs font-semibold text-slate-500">
                        {cs ? cs.court : "—"}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* شريط التقدم أثناء المزامنة */}
          {isSyncing && syncProgress && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-2">
                  <RefreshCw size={15} className="animate-spin" />
                  جارٍ مزامنة الجلسات مع تقويم Google...
                </span>
                <span>
                  {syncProgress.current} من {syncProgress.total}
                </span>
              </div>
              <div className="h-2 w-full bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-300"
                  style={{
                    width: `${Math.round((syncProgress.current / syncProgress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* تقرير نتائج المزامنة */}
          {syncResults && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
              <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>اكتملت المزامنة: نجحت ({syncResults.success}) | فشلت ({syncResults.failed})</span>
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1 text-xs font-mono text-slate-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                {syncResults.messages.map((m, idx) => (
                  <p key={idx}>{m}</p>
                ))}
              </div>
              <div className="pt-1">
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
                >
                  <ExternalLink size={13} /> فتح تقويم Google في نافذة جديدة للاطلاع على المواعيد
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-stone-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            إغلاق
          </button>

          <div className="flex items-center gap-3">
            {googleUser ? (
              <button
                type="button"
                onClick={handleSyncToGoogle}
                disabled={isSyncing || selectedHearingIds.length === 0}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>جارٍ المزامنة...</span>
                  </>
                ) : (
                  <>
                    <CalendarDays size={15} />
                    <span>مزامنة الجلسات المحددة ({selectedHearingIds.length})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleConnect}
                disabled={isSigningIn}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>الاتصال بـ Google للمزامنة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
