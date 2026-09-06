import React, { useEffect, useState } from "react";
import { BookOpen, ListOrdered, ScrollText, Scale, Landmark, ReceiptText, Truck, ShoppingCart, FileBarChart, Boxes, UserRound, Wallet2 } from "lucide-react";
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
  loadFixedAssets,
  loadDepreciationRuns,
  loadPayrollEmployees,
  loadPayrollRuns,
  loadPayslips,
  saveAccountingStorage,
} from "./storage";
import { BankAccount, BankTransaction, BANK_LS_KEYS } from "./bankTypes";
import { SalesInvoice, SalesPayment, SALES_LS_KEYS } from "./salesTypes";
import { Vendor, PurchaseInvoice, PurchasePayment, PURCHASE_LS_KEYS } from "./purchaseTypes";
import { FixedAsset, DepreciationRun, FIXED_ASSET_LS_KEYS } from "./fixedAssetTypes";
import { PayrollEmployee, PayrollRun, Payslip, PAYROLL_LS_KEYS } from "./payrollTypes";
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
import FixedAssets from "./FixedAssets";
import PayrollEmployees from "./PayrollEmployees";
import PayrollRuns from "./PayrollRuns";

type SubTab =
  | "accounts"
  | "bank"
  | "sales"
  | "vendors"
  | "purchases"
  | "assets"
  | "payroll_employees"
  | "payroll_runs"
  | "journal"
  | "ledger"
  | "trial_balance"
  | "reports";

// تُجمّع أقسام النظام المحاسبي في قائمة جانبية عمودية مصنّفة (بنفس منطق القائمة الجانبية
// الرئيسية للنظام وأسلوب أنظمة المحاسبة الاحترافية)، بدل شريط تبويبات أفقي طويل يمتد للأسفل.
const SUB_TAB_GROUPS: Array<{
  category: string;
  items: Array<{ id: SubTab; label: string; icon: React.ComponentType<{ size?: number }> }>;
}> = [
  {
    category: "القيود والدفاتر",
    items: [
      { id: "accounts", label: "شجرة الحسابات", icon: BookOpen },
      { id: "journal", label: "القيود اليومية", icon: ListOrdered },
      { id: "ledger", label: "دفتر الأستاذ", icon: ScrollText },
      { id: "trial_balance", label: "ميزان المراجعة", icon: Scale },
    ],
  },
  {
    category: "البنوك",
    items: [{ id: "bank", label: "الحسابات البنكية", icon: Landmark }],
  },
  {
    category: "المبيعات والمشتريات",
    items: [
      { id: "sales", label: "المبيعات والفواتير", icon: ReceiptText },
      { id: "vendors", label: "الموردون", icon: Truck },
      { id: "purchases", label: "المشتريات والمصروفات", icon: ShoppingCart },
    ],
  },
  {
    category: "الأصول والرواتب",
    items: [
      { id: "assets", label: "الأصول الثابتة", icon: Boxes },
      { id: "payroll_employees", label: "سجل موظفي الرواتب", icon: UserRound },
      { id: "payroll_runs", label: "تشغيل الرواتب", icon: Wallet2 },
    ],
  },
  {
    category: "التقارير",
    items: [{ id: "reports", label: "التقارير المالية", icon: FileBarChart }],
  },
];

const SUB_TAB_LABELS: Record<SubTab, string> = SUB_TAB_GROUPS.reduce((acc, g) => {
  g.items.forEach((it) => { acc[it.id] = it.label; });
  return acc;
}, {} as Record<SubTab, string>);

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
  canManageFixedAssets = true,
  canRunDepreciation = true,
  canDeleteFixedAssets = true,
  canManagePayrollEmployees = true,
  canDeletePayrollEmployees = true,
  canRunPayroll = true,
  canRecordPayrollPayments = true,
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
  canManageFixedAssets?: boolean;
  canRunDepreciation?: boolean;
  canDeleteFixedAssets?: boolean;
  canManagePayrollEmployees?: boolean;
  canDeletePayrollEmployees?: boolean;
  canRunPayroll?: boolean;
  canRecordPayrollPayments?: boolean;
  currentUserName?: string;
  letterheadHeaderImg?: string | null;
  letterheadFooterImg?: string | null;
}) {
  const [subTab, setSubTab] = useState<SubTab>("accounts");
  const [activeCategory, setActiveCategory] = useState<string>(SUB_TAB_GROUPS[0].category);
  // اسم التصنيف المفتوحة قائمته المنسدلة العائمة حالياً (null = كل القوائم مغلقة)
  const [openFlyout, setOpenFlyout] = useState<string | null>(null);
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
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(() => loadFixedAssets());
  const [depreciationRuns, setDepreciationRuns] = useState<DepreciationRun[]>(() => loadDepreciationRuns());
  const [payrollEmployees, setPayrollEmployees] = useState<PayrollEmployee[]>(() => loadPayrollEmployees());
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(() => loadPayrollRuns());
  const [payslips, setPayslips] = useState<Payslip[]>(() => loadPayslips());

  useEffect(() => saveAccountingStorage(LS_KEYS.accounts, accounts), [accounts]);
  useEffect(() => saveAccountingStorage(LS_KEYS.journalEntries, entries), [entries]);
  useEffect(() => saveAccountingStorage(BANK_LS_KEYS.bankAccounts, bankAccounts), [bankAccounts]);
  useEffect(() => saveAccountingStorage(BANK_LS_KEYS.bankTransactions, transactions), [transactions]);
  useEffect(() => saveAccountingStorage(SALES_LS_KEYS.invoices, salesInvoices), [salesInvoices]);
  useEffect(() => saveAccountingStorage(SALES_LS_KEYS.payments, salesPayments), [salesPayments]);
  useEffect(() => saveAccountingStorage(PURCHASE_LS_KEYS.vendors, vendors), [vendors]);
  useEffect(() => saveAccountingStorage(PURCHASE_LS_KEYS.invoices, purchaseInvoices), [purchaseInvoices]);
  useEffect(() => saveAccountingStorage(PURCHASE_LS_KEYS.payments, purchasePayments), [purchasePayments]);
  useEffect(() => saveAccountingStorage(FIXED_ASSET_LS_KEYS.assets, fixedAssets), [fixedAssets]);
  useEffect(() => saveAccountingStorage(FIXED_ASSET_LS_KEYS.depreciationRuns, depreciationRuns), [depreciationRuns]);
  useEffect(() => saveAccountingStorage(PAYROLL_LS_KEYS.employees, payrollEmployees), [payrollEmployees]);
  useEffect(() => saveAccountingStorage(PAYROLL_LS_KEYS.runs, payrollRuns), [payrollRuns]);
  useEffect(() => saveAccountingStorage(PAYROLL_LS_KEYS.payslips, payslips), [payslips]);

  useEffect(() => {
    if (selectedBankId && !bankAccounts.some((b) => b.id === selectedBankId)) setSelectedBankId(null);
    if (!selectedBankId && bankAccounts.length > 0) setSelectedBankId(bankAccounts[0].id);
  }, [bankAccounts, selectedBankId]);

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId) || null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#0D382B]/15 bg-[#0D382B]/[0.04] px-4 py-3 text-xs text-[#0D382B] flex items-center gap-2">
        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#C5A059] text-[#0D382B] text-[10px] font-black shrink-0">تجريبي</span>
        <span>
          هذه نسخة تجريبية من النظام المحاسبي لغرض التقييم فقط، وتعتمد حالياً على تخزين المتصفح المحلي دون ربط بقاعدة بيانات خلفية دائمة —
          لا تُدخل أي بيانات مالية حقيقية للمكتب حتى اكتمال الربط والاختبار الكامل.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[92px_1fr] gap-4 items-start">
        {/* شريط رفيع لتصنيفات النظام المحاسبي الرئيسية، وكل تصنيف يفتح بجانبه قائمة منسدلة
            عائمة (Flyout) بأقسامه الفرعية — بنفس أسلوب وافِق تماماً، بدل شريط تبويبات ثابت
            أو قائمة جانبية مفتوحة بالكامل تاخذ مساحة طولية كبيرة. */}
        <nav className="lg:sticky lg:top-4 app-card p-2 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible">
          {SUB_TAB_GROUPS.map((group) => {
            const FirstIcon = group.items[0].icon;
            const isActiveGroup = activeCategory === group.category;
            const isFlyoutOpen = openFlyout === group.category;
            return (
              <div key={group.category} className="relative shrink-0">
                <button
                  onClick={() => setOpenFlyout(isFlyoutOpen ? null : group.category)}
                  className={`shrink-0 flex lg:flex-col items-center justify-center gap-1 px-2.5 py-2.5 rounded-xl text-center transition-colors cursor-pointer w-full ${
                    isActiveGroup || isFlyoutOpen
                      ? "bg-[#0D382B] text-white shadow-[0_6px_14px_-6px_rgb(13,56,43,0.5)]"
                      : "text-slate-500 hover:bg-[#0D382B]/[0.06] hover:text-[#0D382B]"
                  }`}
                >
                  <FirstIcon size={19} />
                  <span className="text-[10px] font-bold leading-tight whitespace-nowrap lg:whitespace-normal">{group.category}</span>
                </button>

                {isFlyoutOpen && (
                  <>
                    {/* طبقة شفافة لإغلاق القائمة عند الضغط خارجها */}
                    <div className="fixed inset-0 z-10" onClick={() => setOpenFlyout(null)} />
                    <div className="absolute z-20 top-0 right-full mr-2 w-56 app-card p-1.5 space-y-0.5">
                      {group.items.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => {
                            setSubTab(id);
                            setActiveCategory(group.category);
                            setOpenFlyout(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors cursor-pointer text-right ${
                            subTab === id
                              ? "bg-[#0D382B]/[0.08] text-[#0D382B]"
                              : "text-slate-600 hover:bg-[#0D382B]/[0.05] hover:text-[#0D382B]"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* منطقة المحتوى: شاشة القسم الفرعي المختار حالياً */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="h-4 w-1 rounded-full bg-[#C5A059] shrink-0" />
            <h2 className="text-base font-black text-[#0D382B]">{SUB_TAB_LABELS[subTab]}</h2>
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

      {subTab === "assets" && (
        <FixedAssets
          accounts={accounts}
          assets={fixedAssets}
          setAssets={setFixedAssets}
          depreciationRuns={depreciationRuns}
          setDepreciationRuns={setDepreciationRuns}
          entries={entries}
          setEntries={setEntries}
          canManage={canManageFixedAssets}
          canRunDepreciation={canRunDepreciation}
          canDelete={canDeleteFixedAssets}
          currentUserName={currentUserName}
        />
      )}

      {subTab === "payroll_employees" && (
        <PayrollEmployees
          accounts={accounts}
          employees={payrollEmployees}
          setEmployees={setPayrollEmployees}
          payslips={payslips}
          canManage={canManagePayrollEmployees}
          canDelete={canDeletePayrollEmployees}
          currentUserName={currentUserName}
        />
      )}

      {subTab === "payroll_runs" && (
        <PayrollRuns
          accounts={accounts}
          employees={payrollEmployees}
          runs={payrollRuns}
          setRuns={setPayrollRuns}
          payslips={payslips}
          setPayslips={setPayslips}
          entries={entries}
          setEntries={setEntries}
          canRun={canRunPayroll}
          canRecordPayment={canRecordPayrollPayments}
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
      </div>
    </div>
  );
}
