import React, { useState } from 'react';
import { Download, Copy, Check, X, FileText, FileJson } from 'lucide-react';
import { AppSpec } from '../types';

interface ExportModalProps {
  spec: AppSpec;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ spec, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const generateMarkdownDoc = (): string => {
    return `# ${spec.title}
> ${spec.tagline}

## Overview
${spec.description}

- **Archetype**: ${spec.archetype}
- **Target Audience**: ${spec.targetAudience}

## Visual Design System
- **Theme**: ${spec.visualDesign.theme}
- **Primary Color**: \`${spec.visualDesign.primaryColor}\`
- **Accent Color**: \`${spec.visualDesign.accentColor}\`
- **Font Family**: ${spec.visualDesign.fontFamily}
- **Style Name**: ${spec.visualDesign.styleName}

## Core Features
${spec.features.map(f => `- **${f.name}** (${f.priority}): ${f.description}`).join('\n')}

## User Stories
${spec.userStories.map(s => `- ${s}`).join('\n')}

## Database Schema
${spec.dataSchema.map(d => `### Entity: ${d.entity}
${d.description}
Fields:
${d.fields.map(field => `- \`${field.name}\` (${field.type}${field.required ? ', required' : ''}): ${field.description}`).join('\n')}
`).join('\n')}

## REST API Endpoints
${spec.apiEndpoints.map(e => `- \`${e.method} ${e.path}\`: ${e.description}`).join('\n')}
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownDoc());
    setCopiedType('md');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadZipSimulated = () => {
    const blob = new Blob([generateMarkdownDoc()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spec.title.toLowerCase().replace(/\s+/g, '-')}-spec.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Export App Architecture</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Export the full specification created by Gemini as Markdown documentation or raw JSON.
        </p>

        <div className="space-y-3">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Markdown Specification (.md)</h4>
                <p className="text-[11px] text-slate-500">Complete app architecture document</p>
              </div>
            </div>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm"
            >
              {copiedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedType === 'md' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Full JSON Spec (.json)</h4>
                <p className="text-[11px] text-slate-500">Raw JSON containing all schemas and code</p>
              </div>
            </div>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm"
            >
              {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedType === 'json' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
          <button
            onClick={handleDownloadZipSimulated}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Spec Doc</span>
          </button>
        </div>

      </div>
    </div>
  );
};
