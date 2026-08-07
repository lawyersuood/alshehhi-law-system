import React, { useState } from 'react';
import { Code2, FileCode, Copy, Check, Download, FileText, Folder, Eye } from 'lucide-react';
import { GeneratedCodeFile } from '../types';

interface CodeInspectorProps {
  files: GeneratedCodeFile[];
  appName: string;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ files, appName }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = files[activeFileIndex] || files[0];

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">Generated Source Files</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">({files.length} Files Generated)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-xs font-semibold text-white transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[480px]">
        
        {/* Left File Tree Panel */}
        <div className="bg-slate-50/60 p-3 border-r border-slate-200 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            Project Structure
          </div>

          {files.map((file, idx) => {
            const isActive = idx === activeFileIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveFileIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-mono transition-colors ${
                  isActive
                    ? 'bg-white text-indigo-700 font-bold border border-slate-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Code View Area */}
        <div className="md:col-span-3 bg-slate-900 flex flex-col justify-between">
          
          {/* Active File Header info */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2 text-slate-200">
              <span className="text-indigo-400 font-bold">{activeFile?.path}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                {activeFile?.language}
              </span>
            </span>
            <span>{activeFile?.description}</span>
          </div>

          {/* Code Content */}
          <div className="p-4 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed max-h-[500px]">
            <pre className="whitespace-pre">
              {activeFile?.content || '// No code available'}
            </pre>
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Clean, standard TypeScript & React</span>
            <span>AI Studio Cloud Run Compatible</span>
          </div>
        </div>

      </div>
    </div>
  );
};
