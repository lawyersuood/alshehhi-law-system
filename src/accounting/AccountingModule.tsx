import React, { useEffect, useState } from "react";
import { BookOpen, ListOrdered, ScrollText, Scale } from "lucide-react";
import { Account, JournalEntry, LS_KEYS } from "./types";
import { loadAccounts, loadJournalEntries, saveAccountingStorage } from "./storage";
import ChartOfAccounts from "./ChartOfAccounts";
import JournalEntries from "./JournalEntries";
import Ledger from "./Ledger";
import TrialBalance from "./TrialBalance";

type SubTab = "accounts" | "journal" | "ledger" | "trial_balance";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "accounts", label: "شجرة الحسابات", icon: BookOpen },
  { id: "journal", label: "القيود اليومية", icon: ListOrdered },
  { id: "ledger", label: "دفتر الأستاذ", icon: ScrollText },
  { id: "trial_balance", label: "ميزان المراجعة", icon: Scale },
];

export default function AccountingModule({
  canManageAccounts = true,
  canPostEntries = true,
  canDeleteEntries = true,
  currentUserName,
}: {
  canManageAccounts?: boolean;
  canPostEntries?: boolean;
  canDeleteEntries?: boolean;
  currentUserName?: string;
}) {
  const [subTab, setSubTab] = useState<SubTab>("accounts");
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJournalEntries());

  useEffect(() => saveAccountingStorage(LS_KEYS.accounts, accounts), [accounts]);
  useEffect(() => saveAccountingStorage(LS_KEYS.journalEntries, entries), [entries]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-amber-800">
        النظام المحاسبي قيد الإنشاء التدريجي (المرحلة 1 من 7: شجرة الحسابات والقيود اليومية) — بيانات هذه المرحلة محفوظة محلياً ومستقلة تماماً عن بقية بيانات
        المكتب.
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto">
        {SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              subTab === id ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {subTab === "accounts" && <ChartOfAccounts accounts={accounts} setAccounts={setAccounts} canManage={canManageAccounts} />}
      {subTab === "journal" && (
        <JournalEntries
          accounts={accounts}
          entries={entries}
          setEntries={setEntries}
          canPost={canPostEntries}
          canDelete={canDeleteEntries}
          currentUserName={currentUserName}
        />
      )}
      {subTab === "ledger" && <Ledger accounts={accounts} entries={entries} />}
      {subTab === "trial_balance" && <TrialBalance accounts={accounts} entries={entries} />}
    </div>
  );
}
