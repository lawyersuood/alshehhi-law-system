import React, { useState } from "react";
import { Database, Server, Table, Code, Globe, Key, FileJson } from "lucide-react";
import { EntitySchema, ApiEndpoint } from "../types";

interface DatabaseAndApiViewerProps {
  dataSchema: EntitySchema[];
  apiEndpoints: ApiEndpoint[];
}

export const DatabaseAndApiViewer: React.FC<DatabaseAndApiViewerProps> = ({
  dataSchema,
  apiEndpoints,
}) => {
  const [activeTab, setActiveTab] = useState<"schema" | "api">("schema");
  const [activeEntityIndex, setActiveEntityIndex] = useState(0);

  const activeEntity = dataSchema[activeEntityIndex] || dataSchema[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-0 text-slate-900">
      {/* Top Selector Tabs */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("schema")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "schema"
                ? "bg-white text-indigo-700 border border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Database Data Models ({dataSchema.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "api"
                ? "bg-white text-indigo-700 border border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Server className="w-4 h-4 text-indigo-600" />
            <span>Express REST API Routes ({apiEndpoints.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline font-medium">
          Server Architecture Specification
        </span>
      </div>

      {activeTab === "schema" ? (
        <div className="p-6 space-y-6">
          {/* Entity Selector Pills */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-2">
              Entities:
            </span>
            {dataSchema.map((schema, idx) => (
              <button
                key={idx}
                onClick={() => setActiveEntityIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  idx === activeEntityIndex
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {schema.entity}
              </button>
            ))}
          </div>

          {activeEntity && (
            <div className="space-y-6">
              {/* Entity Overview */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Table className="w-5 h-5 text-indigo-600" />
                  <span>{activeEntity.entity} Model</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeEntity.description}</p>
              </div>

              {/* Fields Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3">Field Name</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {activeEntity.fields.map((field, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-indigo-700">{field.name}</td>
                        <td className="p-3 text-purple-600 font-bold">{field.type}</td>
                        <td className="p-3 text-slate-600 font-sans text-xs">
                          {field.description}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              field.required
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {field.required ? "Required" : "Optional"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sample Records JSON Box */}
              {activeEntity.sampleRecords && activeEntity.sampleRecords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-emerald-600" />
                    Sample Seed Data Records (JSON)
                  </h4>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto shadow-sm">
                    <pre className="whitespace-pre">
                      {JSON.stringify(activeEntity.sampleRecords, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Backend Express REST Endpoints</h3>
            <span className="text-xs text-slate-400">All routes mapped to Gemini server proxy</span>
          </div>

          <div className="space-y-3">
            {apiEndpoints.map((ep, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      ep.method === "GET"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : ep.method === "POST"
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          : ep.method === "PUT"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-800">{ep.path}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-1 font-medium">
                  {ep.description}
                </p>

                {ep.requestBody && (
                  <div className="pl-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">
                      Sample Request Payload:
                    </span>
                    <code className="text-[11px] font-mono text-indigo-700 bg-white px-2 py-1 rounded border border-slate-200 block mt-0.5">
                      {ep.requestBody}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
