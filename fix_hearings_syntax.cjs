const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<button
                            onClick={async () => {
                              const rollList = hearings.filter((h) => {
                                const matchDate = !selectedRollDate || h.date === selectedRollDate;
                                const cs = cases.find((c) => c.id === h.caseId);
                                const matchCourt = rollCourtFilter === "الكل" || (cs && cs.court === rollCourtFilter);
                                return matchDate && matchCourt;
                              });`;

if (code.includes(target)) {
    console.log("Target found");
    const endTarget = `                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 mr-auto"
                          >
                            <MessageSquare size={14} /> إرسال ملخص الرول بالواتساب
                          </button>
                        </div>
                      </div>
                    </div>`;
    const endReplacement = `                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 mr-auto"
                          >
                            <MessageSquare size={14} /> إرسال ملخص الرول بالواتساب
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>`;
    code = code.replace(endTarget, endReplacement);
    
    // Also add closeFilters to addDays(1) and set selectedRollDate("") 
    code = code.replace(/setSelectedRollDate\(addDays\(1\)\)/g, "setSelectedRollDate(addDays(1)); closeFilters('hearings');");
    code = code.replace(/setSelectedRollDate\(""\)/g, "setSelectedRollDate(''); closeFilters('hearings');");
    
    fs.writeFileSync('src/App.tsx', code);
} else {
    console.log("Target not found");
}

