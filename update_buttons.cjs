const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldBtns = `                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              requestDelete({`;

const newBtns = `                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => handleDownloadDoc(d)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition cursor-pointer flex items-center justify-center"
                              title={d.isEncrypted ? "عرض المستند المشفر" : "عرض المستند"}
                            >
                              {d.isEncrypted ? <Lock size={15} className="text-amber-500" /> : <Download size={15} />}
                            </button>
                            <button
                              onClick={async () => {
                                requestDelete({`;

const oldBtnClose = `                            title="حذف المستند"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>`;

const newBtnClose = `                            title="حذف المستند"
                          >
                            <Trash2 size={15} />
                          </button>
                          </div>
                        </div>
                      ))}
                    </div>`;

if (content.includes(oldBtns) && content.includes(oldBtnClose)) {
    content = content.replace(oldBtns, newBtns);
    content = content.replace(oldBtnClose, newBtnClose);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Buttons updated successfully.");
} else {
    console.log("Old button text not found!");
}
