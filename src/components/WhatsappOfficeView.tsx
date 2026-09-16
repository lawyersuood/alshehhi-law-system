import React from "react";
import { MessageSquare, RotateCw, Plus, Search, CheckCheck, Send } from "lucide-react";
import { UserItem } from "../domain/types";

export interface WaChatMessage {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

export interface WaChat {
  id: number;
  name: string;
  phone: string;
  role: string;
  avatarBg: string;
  unreadCount: number;
  messages: WaChatMessage[];
}

export interface WhatsappOfficeViewProps {
  isSuperAdmin: boolean;
  currentUser: UserItem;
  fetchSupabaseWhatsAppMessages: () => void;
  setShowNewWaChatModal: (v: boolean) => void;
  waChats: WaChat[];
  setWaChats: React.Dispatch<React.SetStateAction<WaChat[]>>;
  waSearchTerm: string;
  setWaSearchTerm: (v: string) => void;
  selectedWaChatId: number;
  setSelectedWaChatId: (id: number) => void;
  waInputText: string;
  setWaInputText: (v: string) => void;
  handleSendWaMessage: (targetChatId: number) => void;
}

export default function WhatsappOfficeView({
  isSuperAdmin,
  currentUser,
  fetchSupabaseWhatsAppMessages,
  setShowNewWaChatModal,
  waChats,
  setWaChats,
  waSearchTerm,
  setWaSearchTerm,
  selectedWaChatId,
  setSelectedWaChatId,
  waInputText,
  setWaInputText,
  handleSendWaMessage,
}: WhatsappOfficeViewProps) {
  return (
    <div className="space-y-6">
      {!isSuperAdmin && !currentUser.canAccessWhatsapp && !currentUser.permissions?.whatsapp ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-8 text-center space-y-4 my-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <MessageSquare size={36} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-amber-950">محمي: واتساب المكتب المدمج</h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              عذراً، الوصول إلى مراسلات واتساب المكتب المباشرة وسجلات الرسائل مقتصر على مدير النظام
              أو الموظف المصرح له بدخول وحدة التواصل.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* شريط عنوان البوابة والربط المباشر بـ Supabase */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 rounded-3xl text-white shadow-xl border border-emerald-800/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <h2 className="text-2xl font-bold flex items-center gap-2.5">
                  <MessageSquare className="text-emerald-400 shrink-0" size={26} /> واجهة مراسلات
                  الواتساب المباشرة
                </h2>
              </div>
              <p className="text-xs text-slate-300">
                مزامنة فورية ومباشرة مع سجل محادثات الواتساب الخاص بالمكتب
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl text-xs text-emerald-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>التحديث اللحظي: نشط</span>
              </div>

              <button
                onClick={() => fetchSupabaseWhatsAppMessages()}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
              >
                <RotateCw size={14} className="text-emerald-400" /> تحديث المحادثات
              </button>

              <button
                onClick={() => setShowNewWaChatModal(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
              >
                <Plus size={16} /> بدء محادثة جديدة
              </button>
            </div>
          </div>

          {/* واجهة المحادثات المخصصة Custom Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden min-h-[600px]">
            {/* القائمة الجانبية: قائمة الرسائل والمحادثات */}
            <div className="lg:col-span-1 border-l border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-emerald-600" /> قائمة المحادثات (
                    <code className="text-xs font-mono">{waChats.length}</code>)
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    مباشر
                  </span>
                </div>

                {/* مربع بحث في المحادثات */}
                <div className="relative">
                  <input
                    type="text"
                    value={waSearchTerm}
                    onChange={(e) => setWaSearchTerm(e.target.value)}
                    placeholder="بحث بالاسم أو رقم الهاتف..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>

                {/* قائمة المحادثات من Supabase */}
                <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
                  {waChats
                    .filter(
                      (c) =>
                        !waSearchTerm ||
                        c.name.toLowerCase().includes(waSearchTerm.toLowerCase()) ||
                        c.phone.includes(waSearchTerm),
                    )
                    .map((chat) => {
                      const lastMsg = chat.messages[chat.messages.length - 1];
                      const isSelected = selectedWaChatId === chat.id;

                      return (
                        <div
                          key={chat.id}
                          onClick={() => {
                            setSelectedWaChatId(chat.id);
                            setWaChats((prev) =>
                              prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)),
                            );
                          }}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                            isSelected
                              ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-md transform scale-[1.01]"
                              : "bg-white border-slate-200 hover:bg-emerald-50/50 text-slate-800 hover:border-emerald-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-sm shadow-xs ${
                                isSelected
                                  ? "bg-white text-emerald-800"
                                  : chat.avatarBg || "bg-emerald-600 text-white"
                              }`}
                            >
                              {chat.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-xs truncate">{chat.name}</p>
                              </div>
                              <p
                                className={`text-[11px] truncate font-mono ${isSelected ? "text-emerald-100" : "text-slate-500"}`}
                              >
                                {chat.phone}
                              </p>
                              {lastMsg && (
                                <p
                                  className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-emerald-100/90" : "text-slate-400"}`}
                                >
                                  {lastMsg.sender === "me" ? "أنت: " : ""}
                                  {lastMsg.text}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {lastMsg && (
                              <span
                                className={`text-[9px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}
                              >
                                {lastMsg.time}
                              </span>
                            )}
                            {chat.unreadCount > 0 && (
                              <span className="bg-emerald-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* زر إضافة محادثة سريعة من أسفل القائمة */}
              <button
                onClick={() => setShowNewWaChatModal(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Plus size={14} /> إضافة جهة اتصال جديدة
              </button>
            </div>

            {/* صندوق شات عرض تفاصيل المحادثة المحددة */}
            <div className="lg:col-span-2 p-5 flex flex-col justify-between bg-slate-50/30">
              {(() => {
                const activeChat = waChats.find((c) => c.id === selectedWaChatId);
                if (!activeChat) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-20">
                      <MessageSquare size={48} className="text-slate-300" />
                      <p className="text-xs font-bold">
                        حدد محادثة من القائمة الجانبية لاستعراض وتلقي الرسائل
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* هيدر الشات */}
                    <div className="app-card p-4 flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white ${activeChat.avatarBg || "bg-emerald-600"}`}
                        >
                          {activeChat.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {activeChat.name}
                          </h4>
                          <p className="text-xs text-slate-500 dir-ltr font-mono">
                            {activeChat.phone} • {activeChat.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                          <CheckCheck size={14} className="text-emerald-600" /> متصل ويعمل الآن
                        </span>
                      </div>
                    </div>

                    {/* منطقة عرض الرسائل الواردة والصادرة */}
                    <div className="space-y-3.5 overflow-y-auto max-h-[400px] min-h-[350px] p-3 bg-stone-100/70 rounded-2xl border border-slate-200/80">
                      {activeChat.messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">
                          لا توجد رسائل سابقة في هذه المحادثة. أرسل أول رسالة للبدء!
                        </div>
                      ) : (
                        activeChat.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`p-3.5 rounded-2xl text-xs max-w-[82%] leading-relaxed shadow-xs ${
                                msg.sender === "me"
                                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-none"
                                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 font-mono">
                              <span>{msg.time}</span>
                              {msg.sender === "me" && (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <CheckCheck size={13} /> تم الإرسال
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* مربع إدخال النص وزر إرسال يستدعي send-whatsapp-message Edge Function */}
                    <div className="mt-4 flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
                      <input
                        value={waInputText}
                        onChange={(e) => setWaInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendWaMessage(activeChat.id);
                          }
                        }}
                        placeholder="اكتب رسالتك المباشرة هنا..."
                        className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendWaMessage(activeChat.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 shadow-xs"
                      >
                        <Send size={15} /> إرسال عبر الواتساب
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
