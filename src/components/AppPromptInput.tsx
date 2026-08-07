import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Lightbulb, Flame, RefreshCw } from 'lucide-react';
import { STARTER_APPS } from '../data/starterApps';
import { AppSpec } from '../types';

interface AppPromptInputProps {
  onGenerate: (prompt: string) => void;
  onSelectStarter: (spec: AppSpec) => void;
  isGenerating: boolean;
  currentSpecId?: string;
}

export const AppPromptInput: React.FC<AppPromptInputProps> = ({
  onGenerate,
  onSelectStarter,
  isGenerating,
  currentSpecId
}) => {
  const [prompt, setPrompt] = useState('');

  const samplePrompts = [
    'A minimalist workout log app with rest timer, set tracking, and PR history',
    'An AI podcast script writer with speaker voice assignments and outline builder',
    'A real estate property comparison matrix with mortgage ROI calculators',
    'A freelance invoice generator with PDF preview and client status tracker',
    'A daily gratitude & habit log with streak protections and weekly score'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Describe an app and let Gemini do the rest</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
            What app would you like Gemini to architect?
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Gemini creates the full application architecture: visual design tokens, interactive React prototype, data schema, Express API routes, and code files.
          </p>
        </div>

        {/* Prompt Form Input */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center rounded-xl border-2 border-indigo-100 bg-white text-sm leading-relaxed font-medium shadow-sm ring-4 ring-indigo-50/50 focus-within:border-indigo-500 transition-all">
            <div className="pl-4 text-indigo-600">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A micro-habit tracker with streaks, dark mode, and AI coaching..."
              disabled={isGenerating}
              className="w-full py-4 pl-3 pr-36 bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none disabled:opacity-50 font-medium"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Architecting...</span>
                </>
              ) : (
                <>
                  <span>Architect App</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Quick Ideas:
          </span>
          {samplePrompts.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(sample);
                onGenerate(sample);
              }}
              disabled={isGenerating}
              className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors text-left truncate max-w-[280px] font-medium text-xs"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Starter Apps Showcase */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Explore Featured App Architectures
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Instant interactive prototypes ready</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STARTER_APPS.map((starter) => {
              const isSelected = currentSpecId === starter.id;
              return (
                <button
                  key={starter.id}
                  onClick={() => onSelectStarter(starter)}
                  disabled={isGenerating}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-200"
                        style={{ backgroundColor: starter.visualDesign.primaryColor }}
                      />
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {starter.archetype.split(' ')[0]}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                      {starter.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                      {starter.tagline}
                    </p>
                  </div>
                  <div className="text-[10px] text-indigo-600 font-bold flex items-center justify-between pt-1 border-t border-slate-100 mt-2">
                    <span>{starter.features.length} Features</span>
                    <span>Try →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
