import React, { useState } from 'react';
import {
  Play, Plus, Trash2, CheckCircle2, Circle, Sparkles, RefreshCw,
  Search, Filter, Smartphone, Monitor, Check, AlertCircle, X, ChevronRight, Zap
} from 'lucide-react';
import { AppSpec, InteractiveAction, InteractiveActionField } from '../types';
import LawFirmUAE from './LawFirmUAE';

interface LiveInteractiveAppProps {
  spec: AppSpec;
}

export const LiveInteractiveApp: React.FC<LiveInteractiveAppProps> = ({ spec }) => {
  if (spec.id === 'law-firm-uae' || spec.title.includes('المحاماة')) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 font-bold">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                نظام إدارة مكتب المحاماة — الإمارات
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold uppercase tracking-wider">
                  LIVE INTERACTIVE APP
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                نظام متكامل لتتبع القضايا، الجلسات، الفواتير مع ضريبة 5%، الوكالات، والموكلين.
              </p>
            </div>
          </div>
        </div>
        <LawFirmUAE />
      </div>
    );
  }

  const { visualDesign, interactiveApp, title, tagline } = spec;
  const [activeTabId, setActiveTabId] = useState(interactiveApp.tabs[0]?.id || 'main');
  const [viewDevice, setViewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Live State Manager initialized from spec
  const [appState, setAppState] = useState<Record<string, any>>(interactiveApp.initialState || {});
  
  // Modal / Form state for adding items
  const [activeModalAction, setActiveModalAction] = useState<InteractiveAction | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI Action loading & output state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);

  const primaryEntityKey = Object.keys(appState)[0] || 'items';
  const itemList: any[] = Array.isArray(appState[primaryEntityKey]) ? appState[primaryEntityKey] : [];

  // Handle toggling completion status on an item
  const handleToggleItem = (itemId: string) => {
    const updatedList = itemList.map((item) => {
      const match = item.id === itemId || item.symbol === itemId || item.title === itemId;
      if (match) {
        if ('completedToday' in item) return { ...item, completedToday: !item.completedToday };
        if ('done' in item) return { ...item, done: !item.done };
        if ('mastered' in item) return { ...item, mastered: !item.mastered };
        if ('bought' in item) return { ...item, bought: !item.bought };
        if ('status' in item) return { ...item, status: item.status === 'Done' ? 'In Progress' : 'Done' };
      }
      return item;
    });

    setAppState({ ...appState, [primaryEntityKey]: updatedList });
  };

  // Handle deleting an item
  const handleDeleteItem = (itemId: string) => {
    const updatedList = itemList.filter((item) => item.id !== itemId && item.symbol !== itemId);
    setAppState({ ...appState, [primaryEntityKey]: updatedList });
  };

  // Handle submitting new record form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalAction) return;

    const newItem = {
      id: 'item-' + Date.now(),
      ...formData,
      completedToday: false,
      done: false,
      mastered: false,
      bought: false
    };

    const targetKey = activeModalAction.targetEntity || primaryEntityKey;
    const existing = Array.isArray(appState[targetKey]) ? appState[targetKey] : [];
    
    setAppState({
      ...appState,
      [targetKey]: [newItem, ...existing]
    });

    setActiveModalAction(null);
    setFormData({});
  };

  // Handle triggering embedded Gemini AI inside prototype
  const handleTriggerAI = async () => {
    setAiLoading(true);
    setAiOutput(null);

    try {
      const res = await fetch('/api/simulated-ai-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appTitle: title,
          actionId: 'generate_insight',
          currentData: appState
        })
      });
      const data = await res.json();
      setAiOutput(data.result || 'Gemini generated a new insight based on your current live app data!');
    } catch (err) {
      setAiOutput('Gemini AI Coach: Keep going! Consistency in your app workflow is the key to progress!');
    } finally {
      setAiLoading(false);
    }
  };

  // Filter items by search
  const filteredItems = itemList.filter((item) => {
    if (!searchTerm) return true;
    const jsonString = JSON.stringify(item).toLowerCase();
    return jsonString.includes(searchTerm.toLowerCase());
  });

  const activeTabActions = interactiveApp.actions.filter(
    (action) => action.tabId === activeTabId || action.tabId === 'all'
  );

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-indigo-600">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Live App Sandbox
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-indigo-100 font-mono font-bold uppercase tracking-wider">
                STATEFUL & INTERACTIVE
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Test out the generated interface. You can add entries, toggle status, filter, and trigger Gemini AI.
            </p>
          </div>
        </div>

        {/* Frame Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setViewDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewDevice === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewDevice === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Frame</span>
          </button>
        </div>
      </div>

      {/* Simulated App Container */}
      <div className={`mx-auto transition-all duration-300 ${
        viewDevice === 'mobile' ? 'max-w-md' : 'w-full'
      }`}>
        <div
          className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all"
          style={{
            backgroundColor: visualDesign.theme === 'dark' ? '#0f172a' : visualDesign.bgColor,
            color: visualDesign.theme === 'dark' ? '#f8fafc' : visualDesign.textColor,
            fontFamily: visualDesign.fontFamily || 'sans-serif'
          }}
        >
          {/* Simulated App Top Bar */}
          <div
            className="px-6 py-4 flex items-center justify-between border-b shadow-sm"
            style={{
              backgroundColor: visualDesign.surfaceColor,
              borderColor: visualDesign.theme === 'dark' ? '#334155' : '#e2e8f0'
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: visualDesign.primaryColor }}
              />
              <div>
                <h2 className="font-bold text-base leading-tight" style={{ color: visualDesign.textColor }}>
                  {title}
                </h2>
                <p className="text-xs opacity-70 line-clamp-1">{tagline}</p>
              </div>
            </div>

            {/* AI Action button in App Header */}
            <button
              onClick={handleTriggerAI}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white shadow-md transition-all transform hover:scale-105"
              style={{ backgroundColor: visualDesign.primaryColor }}
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? 'Gemini AI Thinking...' : 'Gemini AI Assistant'}</span>
            </button>
          </div>

          {/* Embedded Gemini AI Insight Box */}
          {aiOutput && (
            <div className="mx-6 mt-4 p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3 relative">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1 pr-6">
                <span className="font-bold text-xs uppercase tracking-wider block text-amber-600 dark:text-amber-400">
                  Gemini AI Response
                </span>
                <p>{aiOutput}</p>
              </div>
              <button
                onClick={() => setAiOutput(null)}
                className="absolute top-3 right-3 text-amber-500 hover:text-amber-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stats Bar */}
          {interactiveApp.stats && interactiveApp.stats.length > 0 && (
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b" style={{ borderColor: visualDesign.theme === 'dark' ? '#334155' : '#e2e8f0' }}>
              {interactiveApp.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border shadow-sm space-y-1"
                  style={{
                    backgroundColor: visualDesign.surfaceColor,
                    borderColor: visualDesign.theme === 'dark' ? '#334155' : '#e2e8f0'
                  }}
                >
                  <span className="text-xs opacity-70 font-medium block">{stat.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold" style={{ color: visualDesign.primaryColor }}>
                      {stat.value}
                    </span>
                    {stat.trend && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        stat.trend === 'up' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {stat.trend === 'up' ? '↑' : '→'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* App Navigation Tabs */}
          <div className="px-6 pt-4 flex items-center justify-between border-b overflow-x-auto gap-2" style={{ borderColor: visualDesign.theme === 'dark' ? '#334155' : '#e2e8f0' }}>
            <div className="flex items-center gap-1">
              {interactiveApp.tabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-current bg-slate-500/10'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isActive ? visualDesign.primaryColor : 'transparent',
                      color: isActive ? visualDesign.primaryColor : visualDesign.textColor
                    }}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-48 shrink-0 pb-2 hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
              <input
                type="text"
                placeholder="Filter entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none bg-slate-500/10"
                style={{ borderColor: visualDesign.theme === 'dark' ? '#334155' : '#cbd5e1' }}
              />
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="p-6 space-y-4 min-h-[320px]">
            
            {/* Tab Actions Header */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold opacity-70 uppercase tracking-wider">
                {interactiveApp.tabs.find((t) => t.id === activeTabId)?.description || 'Active View Data'}
              </span>

              <div className="flex items-center gap-2">
                {activeTabActions.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      if (act.type === 'ai_generate') {
                        handleTriggerAI();
                      } else {
                        setActiveModalAction(act);
                        setFormData({});
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                    style={{ backgroundColor: visualDesign.primaryColor }}
                  >
                    {act.type === 'add' ? <Plus className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List / Cards Display */}
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center space-y-3 border-2 border-dashed rounded-2xl opacity-60" style={{ borderColor: visualDesign.theme === 'dark' ? '#334155' : '#cbd5e1' }}>
                <Circle className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-medium">No records found matching your view or search filter.</p>
                <p className="text-xs opacity-70">Click "{activeTabActions[0]?.label || 'Add Item'}" to create a live entry!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredItems.map((item, idx) => {
                  const isDone = item.completedToday || item.done || item.mastered || item.bought || item.status === 'Done';
                  const titleText = item.title || item.name || item.question || item.clientName || item.symbol || 'Record Item';
                  const subText = item.category || item.targetTime || item.prepTime || item.priority || item.status || item.quantity || item.amountUSD ? `$${item.amountUSD}` : item.answer;

                  return (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl border shadow-sm transition-all flex items-start justify-between gap-3 group"
                      style={{
                        backgroundColor: visualDesign.surfaceColor,
                        borderColor: visualDesign.theme === 'dark' ? '#334155' : '#e2e8f0',
                        opacity: isDone ? 0.75 : 1
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleItem(item.id || item.symbol)}
                          className="mt-0.5 shrink-0 transition-transform active:scale-90"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 opacity-40 hover:opacity-80" />
                          )}
                        </button>

                        <div>
                          <h4 className={`text-sm font-bold leading-tight ${isDone ? 'line-through opacity-70' : ''}`}>
                            {titleText}
                          </h4>
                          {subText && (
                            <p className="text-xs opacity-70 mt-1 line-clamp-2">
                              {subText}
                            </p>
                          )}

                          {item.streak && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 mt-2">
                              🔥 {item.streak} Day Streak
                            </span>
                          )}

                          {item.currentPriceUSD && (
                            <div className="text-xs font-mono font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                              Val: ${(item.amount * item.currentPriceUSD).toLocaleString()} USD
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.id || item.symbol)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity p-1"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {activeModalAction.label}
              </h3>
              <button onClick={() => setActiveModalAction(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {(activeModalAction.fields || []).map((field: InteractiveActionField) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider text-[10px]">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || field.options?.[0] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 font-medium"
                    >
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalAction(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
