import React from 'react';
import { Layers, Palette, CheckCircle2, UserCheck, Code, Sparkles, Server, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { AppSpec } from '../types';

interface SpecViewerProps {
  spec: AppSpec;
  onLaunchInteractive: () => void;
}

export const SpecViewer: React.FC<SpecViewerProps> = ({ spec, onLaunchInteractive }) => {
  const { visualDesign, features, userStories, dataSchema, apiEndpoints, codeFiles } = spec;

  return (
    <div className="space-y-8 text-slate-900">
      
      {/* App Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider">
                {spec.archetype}
              </span>
              <span className="text-xs text-slate-400 font-medium">Target: {spec.targetAudience}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
              {spec.title}
            </h2>
            <p className="text-indigo-600 font-medium text-sm sm:text-base italic font-serif">
              "{spec.tagline}"
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              {spec.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
            <button
              onClick={onLaunchInteractive}
              className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4 fill-current text-indigo-400" />
              <span>Launch Live Prototype</span>
            </button>
            <div className="text-center text-xs text-slate-400 font-mono">
              {features.length} features active in live state
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Design System Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Visual Design System</h3>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Theme Palette Name</span>
              <span className="font-semibold text-sm text-indigo-700">{visualDesign.styleName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Primary Color</span>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: visualDesign.primaryColor }} />
                  <span className="font-mono text-xs font-semibold text-slate-800">{visualDesign.primaryColor}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Accent Color</span>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: visualDesign.accentColor }} />
                  <span className="font-mono text-xs font-semibold text-slate-800">{visualDesign.accentColor}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Theme Mode:</span>
                <span className="font-semibold text-slate-800 capitalize">{visualDesign.theme} Mode</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Typography:</span>
                <span className="font-mono text-xs text-slate-800 font-semibold">{visualDesign.fontFamily}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Border Radius:</span>
                <span className="font-mono text-xs text-slate-800 font-semibold">{visualDesign.borderRadius}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Stories Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 lg:col-span-2 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">User Stories & Core Requirements</h3>
          </div>

          <div className="space-y-2.5">
            {userStories.map((story, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {story}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100">
            <span className="flex items-center gap-1 font-medium">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              Express Backend Server
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Gemini AI Integration
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Code className="w-3.5 h-3.5 text-indigo-600" />
              TypeScript & React
            </span>
          </div>
        </div>
      </div>

      {/* Feature Matrix Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Feature Scope & Priority Matrix</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{features.length} Features Defined</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => (
            <div key={feat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-slate-900">{feat.name}</h4>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    feat.priority === 'core'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : feat.priority === 'extended'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {feat.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-400 font-medium">
                <span>Status:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Interactive Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
