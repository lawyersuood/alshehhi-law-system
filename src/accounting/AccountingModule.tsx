import React, { useEffect, useState } from "react";
import { BookOpen, ListOrdered, ScrollText, Scale, Landmark } from "lucide-react";
import { Account, JournalEntry, LS_KEYS } from "./types";
import { loadAccounts, loadJournalEntries, loadBankAccounts, loadBankTransactions, saveAccountingStorage } from "./storage";
import { BankAccount, BankTransaction, BANK_LS_KEYS } from "./bankTypes";
import ChartOfAccounts from "./ChartOfAccounts";
import JournalEntries from "./JournalEntries";
import Ledger from "./Ledger";
import TrialBalance from "./TrialBalance";
import BankAccounts from "./BankAccounts";
import BankAccountLedger from "./BankAccountLedger";

type SubTab = "accounts" | "bank" | "journal" | "ledger" | "trial_balance";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "accounts", label: "شجرة الحسابات", icon: BookOpen },
  { id: "bank", label: "الحسابات البنكية", icon: Landmark },
  { id: "journal", label: "القيود اليومية", icon: ListOrdered },
  { id: "ledger", label: "دفتر الأستاذ", icon: ScrollText },
  { id: "trial_balance", label: "ميزان المراجعة", icon: Scale },
];

export default function AccountingModule({
  canManageAccounts = true,
  canPostEntries = true,
  canDeleteEntries = true,
  canManageBankAccounts = true,
  canRecordBankTransactions = true,
  canDeleteBankTransactions = true,
  currentUserName,
}: {
  canManageAccounts?: boolean;
  canPostEntries?: boolean;
  canDeleteEntries?: boolean;
  canManageBankAccounts?: boolean;
  canRecordBankTransactions?: boolean;
  canDeleteBankTransactions?: boolean;
  currentUserName?: string;
}) {
  const [subTab, setSubTab] = useState<SubTab>("accounts");
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJournalEntries());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadBankAccounts());
  const [transactions, setTransactions] = useState<BankTransaction[]>(() => loadBankTransactions());
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  useEffect(() => saveAccountingStorage(LS_KEYS.accounts, accounts), [accounts]);
  useEffect(() => saveAccountingStorage(LS_KEYS.journalEntries, entries), [entries]);
  useEffect(() => saveAccountingStorage(BANK_LS_KEYS.bankAccounts, bankAccounts), [bankAccounts]);
  useEffect(() => saveAccountingStorage(BANK_LS_KEYS.bankTransactions, transactions), [transactions]);

  useEffect(() => {
    if (selectedBankId && !bankAccounts.some((b) => b.id === selectedBankId)) setSelectedBankId(null);
    if (!selectedBankId && bankAccounts.length > 0) setSelectedBankId(bankAccounts[0].id);
  }, [bankAccounts, selectedBankId]);

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId) || null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-amber-800">
        النظام المحاسبي قيد الإنشاء التدريجي (المرحلة 2 من 7: الحسابات البنكية، بعد اكتمال شجرة الحسابات والقيود اليومية) — بيانات هذه المرحلة محفوظة
        محلياً ومستقلة تماماً عن بقية بيانات المكتب.
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

      {subTab === "bank" && (
        <div className="space-y-6">
          <BankAccounts
            accounts={accounts}
            bankAccounts={bankAccounts}
            setBankAccounts={setBankAccounts}
            transactions={transactions}
            canManage={canManageBankAccounts}
            selectedId={selectedBankId}
            onSelect={setSelectedBankId}
          />
          {selectedBank && (
            <BankAccountLedger
              bankAccount={selectedBank}
              accounts={accounts}
              transactions={transactions}
              setTransactions={setTransactions}
              entries={entries}
              setEntries={setEntries}
              canRecord={canRecordBankTransactions}
              canDelete={canDeleteBankTransactions}
              currentUserName={currentUserName}
            />
          )}
        </div>
      )}

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
