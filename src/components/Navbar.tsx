import React from 'react';
import { Sparkles, Play, Code2, Database, MessageSquare, Download, Cpu, Layers } from 'lucide-react';

export type ViewMode = 'spec' | 'interactive' | 'code' | 'schema' | 'refine';

interface NavbarProps {
  currentMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
  appTitle?: string;
  onOpenExport: () => void;
  hasAppSpec: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  appTitle,
  onOpenExport,
  hasAppSpec
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-lg text-slate-900">
                GenStudio AI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-indigo-100 font-bold">
                gemini-3.6-flash
              </span>
            </div>
            {appTitle && (
              <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs font-medium">
                Active: <span className="text-slate-800 font-semibold">{appTitle}</span>
              </p>
            )}
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        {hasAppSpec && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectMode('spec')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'spec'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>App Spec</span>
            </button>

            <button
              onClick={() => onSelectMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'interactive'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Live App Prototype</span>
            </button>

            <button
              onClick={() => onSelectMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'code'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Files</span>
            </button>

            <button
              onClick={() => onSelectMode('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'schema'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data & API</span>
            </button>

            <button
              onClick={() => onSelectMode('refine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'refine'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Refine Studio</span>
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {hasAppSpec && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Spec</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav bar */}
      {hasAppSpec && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-1">
          <button
            onClick={() => onSelectMode('spec')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${currentMode === 'spec' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Spec</span>
          </button>
          <button
            onClick={() => onSelectMode('interactive')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${currentMode === 'interactive' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="text-[10px] mt-0.5">Live App</span>
          </button>
          <button
            onClick={() => onSelectMode('code')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${currentMode === 'code' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Code2 className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Code</span>
          </button>
          <button
            onClick={() => onSelectMode('schema')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${currentMode === 'schema' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Database className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Data</span>
          </button>
          <button
            onClick={() => onSelectMode('refine')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${currentMode === 'refine' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Refine</span>
          </button>
        </div>
      )}
    </header>
  );
};
