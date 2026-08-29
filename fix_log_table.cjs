const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldTable = `                                <th className="p-2 border font-semibold">المُعتمد (الختم والتوقيع)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {delegationLogs.map((log) => (
                                <tr key={log.id} className="border-b hover:bg-slate-50 transition">
                                  <td className="p-2 border font-mono text-xs">{log.serialNo}</td>
                                  <td className="p-2 border text-xs text-slate-600">{log.timestamp}</td>
                                  <td className="p-2 border">{log.caseNo}</td>
                                  <td className="p-2 border font-bold text-amber-700">{log.delegatedLawyer}</td>
                                  <td className="p-2 border">{log.generatedBy}</td>
                                </tr>`;

const newTable = `                                <th className="p-2 border font-semibold">المُعتمد (الختم والتوقيع)</th>
                                <th className="p-2 border font-semibold w-16">إجراء</th>
                              </tr>
                            </thead>
                            <tbody>
                              {delegationLogs.map((log) => (
                                <tr key={log.id} className="border-b hover:bg-slate-50 transition">
                                  <td className="p-2 border font-mono text-xs">{log.serialNo}</td>
                                  <td className="p-2 border text-xs text-slate-600">{log.timestamp}</td>
                                  <td className="p-2 border">{log.caseNo}</td>
                                  <td className="p-2 border font-bold text-amber-700">{log.delegatedLawyer}</td>
                                  <td className="p-2 border">{log.generatedBy}</td>
                                  <td className="p-2 border text-center">
                                    <button 
                                      onClick={() => {
                                        const c = colleagues.find(col => col.name === log.delegatedLawyer);
                                        const caseRef = cases.find(cs => cs.number === log.caseNo);
                                        setForm({ 
                                          delegatingLawyer: currentUser.name,
                                          delegationDate: log.timestamp.split(',')[0],
                                          delegatedColleagueId: c ? c.id : null,
                                          delegationCaseId: caseRef ? caseRef.id : null,
                                          isApproved: true,
                                          approvedBy: log.generatedBy,
                                          serialNo: log.serialNo
                                        });
                                        setModal("delegation-preview");
                                      }}
                                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                      title="عرض المستند"
                                    >
                                      <FileBadge size={16} />
                                    </button>
                                  </td>
                                </tr>`;

code = code.replace(oldTable, newTable);
fs.writeFileSync('src/App.tsx', code);
console.log("Log table updated with view button.");
