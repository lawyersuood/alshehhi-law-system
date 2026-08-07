import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, MessageSquare, CheckCircle, Wand2 } from 'lucide-react';
import { AppSpec, ChatMessage } from '../types';

interface AIRefineChatProps {
  spec: AppSpec;
  onRefineSpec: (updatedSpec: AppSpec) => void;
}

export const AIRefineChat: React.FC<AIRefineChatProps> = ({ spec, onRefineSpec }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'gemini',
      text: `Hello! I am Gemini, your AI App Architect. How would you like to update or refine "${spec.title}"?`,
      timestamp: Date.now()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const refinementSuggestions = [
    'Add dark mode color palette',
    'Add an export to CSV feature',
    'Add priority filters to main list',
    'Add user analytics & weekly progress tab'
  ];

  const handleSend = async (promptText: string) => {
    if (!promptText.trim() || isRefining) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsRefining(true);

    try {
      const response = await fetch('/api/refine-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSpec: spec,
          refinementPrompt: promptText
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to refine spec');

      onRefineSpec(data.updatedSpec);

      const geminiMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `I've updated the application spec and live interactive prototype!`,
        summaryOfChanges: data.summary,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, geminiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `Sorry, I encountered an issue updating the spec: ${err.message}`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[580px] text-slate-900">
      
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          <h3 className="font-bold text-slate-900 text-base">Gemini AI Refine Studio</h3>
        </div>
        <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Live Interactive Tuning
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'gemini' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            )}

            <div
              className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm space-y-1.5 font-medium ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p>{msg.text}</p>
              {msg.summaryOfChanges && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{msg.summaryOfChanges}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isRefining && (
          <div className="flex items-center gap-3 text-indigo-700 text-xs font-medium p-3 bg-white rounded-xl border border-slate-200 shadow-sm w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Gemini is updating data schemas, UI components, and live state...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestions Chips */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">Suggestions:</span>
        {refinementSuggestions.map((sugg, i) => (
          <button
            key={i}
            onClick={() => handleSend(sugg)}
            disabled={isRefining}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors font-medium text-xs"
          >
            + {sugg}
          </button>
        ))}
      </div>

      {/* Prompt Form Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputPrompt);
        }}
        className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask Gemini to modify design, add features, or update schema..."
          disabled={isRefining}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-indigo-600 font-medium placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isRefining}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-black text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
