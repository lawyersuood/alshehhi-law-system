import React, { useEffect, useState } from "react";
import { BookOpen, ListOrdered, ScrollText, Scale, Landmark, ReceiptText, Truck, ShoppingCart, FileBarChart } from "lucide-react";
import { Account, JournalEntry, LS_KEYS } from "./types";
import {
  loadAccounts,
  loadJournalEntries,
  loadBankAccounts,
  loadBankTransactions,
  loadSalesInvoices,
  loadSalesPayments,
  loadVendors,
  loadPurchaseInvoices,
  loadPurchasePayments,
  saveAccountingStorage,
} from "./storage";
import { BankAccount, BankTransaction, BANK_LS_KEYS } from "./bankTypes";
import { SalesInvoice, SalesPayment, SALES_LS_KEYS } from "./salesTypes";
import { Vendor, PurchaseInvoice, PurchasePayment, PURCHASE_LS_KEYS } from "./purchaseTypes";
import ChartOfAccounts from "./ChartOfAccounts";
import JournalEntries from "./JournalEntries";
import Ledger from "./Ledger";
import TrialBalance from "./TrialBalance";
import BankAccounts from "./BankAccounts";
import BankAccountLedger from "./BankAccountLedger";
import SalesInvoices from "./SalesInvoices";
import Vendors from "./Vendors";
import PurchaseInvoices from "./PurchaseInvoices";
import FinancialReports from "./FinancialReports";

type SubTab = "accounts" | "bank" | "sales" | "vendors" | "purchases" | "journal" | "ledger" | "trial_balance" | "reports";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "accounts", label: "شجرة الحسابات", icon: BookOpen },
  { id: "bank", label: "الحسابات البنكية", icon: Landmark },
  { id: "sales", label: "المبيعات والفواتير", icon: ReceiptText },
  { id: "vendors", label: "الموردون", icon: Truck },
  { id: "purchases", label: "المشتريات والمصروفات", icon: ShoppingCart },
  { id: "journal", label: "القيود اليومية", icon: ListOrdered },
  { id: "ledger", label: "دفتر الأستاذ", icon: ScrollText },
  { id: "trial_balance", label: "ميزان المراجعة", icon: Scale },
  { id: "reports", label: "التقارير المالية", icon: FileBarChart },
];

export default function AccountingModule({
  canManageAccounts = true,
  canPostEntries = true,
  canDeleteEntries = true,
  canManageBankAccounts = true,
  canRecordBankTransactions = true,
  canDeleteBankTransactions = true,
  canManageSalesInvoices = true,
  canApproveSalesInvoices = true,
  canRecordSalesPayments = true,
  canDeleteSalesInvoices = true,
  canManageVendors = true,
  canDeleteVendors = true,
  canManagePurchaseInvoices = true,
  canApprovePurchaseInvoices = true,
  canRecordPurchasePayments = true,
  canDeletePurchaseInvoices = true,
  currentUserName,
  letterheadHeaderImg,
  letterheadFooterImg,
}: {
  canManageAccounts?: boolean;
  canPostEntries?: boolean;
  canDeleteEntries?: boolean;
  canManageBankAccounts?: boolean;
  canRecordBankTransactions?: boolean;
  canDeleteBankTransactions?: boolean;
  canManageSalesInvoices?: boolean;
  canApproveSalesInvoices?: boolean;
  canRecordSalesPayments?: boolean;
  canDeleteSalesInvoices?: boolean;
  canManageVendors?: boolean;
  canDeleteVendors?: boolean;
  canManagePurchaseInvoices?: boolean;
  canApprovePurchaseInvoices?: boolean;
  canRecordPurchasePayments?: boolean;
  canDeletePurchaseInvoices?: boolean;
  currentUserName?: string;
  letterheadHeaderImg?: string | null;
  letterheadFooterImg?: string | null;
}) {
  const [subTab, setSubTab] = useState<SubTab>("accounts");
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJournalEntries());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadBankAccounts());
  const [transactions, setTransactions] = useState<BankTransaction[]>(() => loadBankTransactions());
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(() => loadSalesInvoices());
  const [salesPayments, setSalesPayments] = useState<SalesPayment[]>(() => loadSalesPayments());
  const [vendors, setVendors] = useState<Vendor[]>(() => loadVendors());
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => loadPurchaseInvoices());
  const [purchasePayments, setPurchasePayments] = useState<PurchasePayment[]>(() => loadPurchasePayments());

  useEffect(() => saveAccountingStorage(LS_KEYS.accounts, accounts), [accounts]);
  useEffect(() => saveAccountingStorage(LS_KEYS.journalEntries, entries), [entries]);
  useEffect(() => saveAccountingStorage(BANK_LS_KEYS.bankAccounts, bankAccounts), [bankAccounts]);
  useEffect(() => saveAccountingStorage(BANK_LS_KEYS.bankTransactions, transactions), [transactions]);
  useEffect(() => saveAccountingStorage(SALES_LS_KEYS.invoices, salesInvoices), [salesInvoices]);
  useEffect(() => saveAccountingStorage(SALES_LS_KEYS.payments, salesPayments), [salesPayments]);
  useEffect(() => saveAccountingStorage(PURCHASE_LS_KEYS.vendors, vendors), [vendors]);
  useEffect(() => saveAccountingStorage(PURCHASE_LS_KEYS.invoices, purchaseInvoices), [purchaseInvoices]);
  useEffect(() => saveAccountingStorage(PURCHASE_LS_KEYS.payments, purchasePayments), [purchasePayments]);

  useEffect(() => {
    if (selectedBankId && !bankAccounts.some((b) => b.id === selectedBankId)) setSelectedBankId(null);
    if (!selectedBankId && bankAccounts.length > 0) setSelectedBankId(bankAccounts[0].id);
  }, [bankAccounts, selectedBankId]);

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId) || null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-amber-800">
        النظام المحاسبي قيد الإنشاء التدريجي (المرحلة 5 من 7: التقارير المالية، بعد اكتمال شجرة الحسابات والقيود اليومية والحسابات البنكية والمبيعات
        والمشتريات) — تقارير محسوبة آلياً من بيانات المراحل السابقة (قائمة الدخل، الميزانية العمومية، التدفق النقدي، ضريبة القيمة المضافة، وأعمار الذمم)،
        ولا تخزّن أي بيانات جديدة بذاتها.
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

      {subTab === "sales" && (
        <SalesInvoices
          accounts={accounts}
          invoices={salesInvoices}
          setInvoices={setSalesInvoices}
          payments={salesPayments}
          setPayments={setSalesPayments}
          entries={entries}
          setEntries={setEntries}
          canManage={canManageSalesInvoices}
          canApprove={canApproveSalesInvoices}
          canRecordPayment={canRecordSalesPayments}
          canDelete={canDeleteSalesInvoices}
          currentUserName={currentUserName}
          letterheadHeaderImg={letterheadHeaderImg}
          letterheadFooterImg={letterheadFooterImg}
        />
      )}

      {subTab === "vendors" && <Vendors vendors={vendors} setVendors={setVendors} canManage={canManageVendors} canDelete={canDeleteVendors} />}

      {subTab === "purchases" && (
        <PurchaseInvoices
          accounts={accounts}
          vendors={vendors}
          invoices={purchaseInvoices}
          setInvoices={setPurchaseInvoices}
          payments={purchasePayments}
          setPayments={setPurchasePayments}
          entries={entries}
          setEntries={setEntries}
          canManage={canManagePurchaseInvoices}
          canApprove={canApprovePurchaseInvoices}
          canRecordPayment={canRecordPurchasePayments}
          canDelete={canDeletePurchaseInvoices}
          currentUserName={currentUserName}
        />
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

      {subTab === "reports" && (
        <FinancialReports
          accounts={accounts}
          entries={entries}
          bankAccounts={bankAccounts}
          transactions={transactions}
          salesInvoices={salesInvoices}
          salesPayments={salesPayments}
          vendors={vendors}
          purchaseInvoices={purchaseInvoices}
          purchasePayments={purchasePayments}
        />
      )}
    </div>
  );
}
