import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ListOrdered,
  ScrollText,
  Scale,
  Landmark,
  ReceiptText,
  Truck,
  ShoppingCart,
  FileBarChart,
  Boxes,
  UserRound,
  Wallet2,
  Users,
  FileText,
  Repeat,
  FileMinus2,
  Banknote,
  ClipboardList,
  FilePlus2,
  HandCoins,
  Layers,
  LayoutDashboard,
} from "lucide-react";
import ComingSoon from "./ComingSoon";
import AccountingDashboard from "./AccountingDashboard";
import QuoteProposals from "./QuoteProposals";
import CashExpenses from "./CashExpenses";
import CreditNotes from "./CreditNotes";
import DebitNotes from "./DebitNotes";
import { SalesQuote } from "./quoteTypes";
import { CashExpense } from "./cashExpenseTypes";
import { CreditNote } from "./creditNoteTypes";
import { DebitNote } from "./debitNoteTypes";
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
  loadSalesQuotes,
  loadCashExpenses,
  loadCreditNotes,
  loadDebitNotes,
  saveAccountingStorage,
} from "./storage";
import { QUOTE_LS_KEYS } from "./quoteTypes";
import { CASH_EXPENSE_LS_KEYS } from "./cashExpenseTypes";
import { CREDIT_NOTE_LS_KEYS } from "./creditNoteTypes";
import { DEBIT_NOTE_LS_KEYS } from "./debitNoteTypes";
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
  | "dashboard"
  | "accounts"
  | "bank"
  // المبيعات (قسم مستقل بالكامل عن المشتريات)
  | "customers"
  | "sales_quotes"
  | "sales"
  | "sales_recurring"
  | "sales_credit_notes"
  | "sales_cash_invoices"
  // المشتريات (قسم مستقل بالكامل عن المبيعات)
  | "vendors"
  | "purchase_orders"
  | "purchases"
  | "purchase_debit_notes"
  | "purchase_cash_expenses"
  // الأصول والرواتب
  | "assets"
  | "payroll_employees"
  | "payroll_runs"
  | "employee_claims"
  // القيود والدفاتر
  | "journal"
  | "ledger"
  | "trial_balance"
  | "bulk_reclass"
  | "reports";

// تُجمّع أقسام النظام المحاسبي في قائمة جانبية عمودية مصنّفة (بنفس منطق القائمة الجانبية
// الرئيسية للنظام وأسلوب أنظمة المحاسبة الاحترافية)، بدل شريط تبويبات أفقي طويل يمتد للأسفل.
const SUB_TAB_GROUPS: Array<{
  category: string;
  items: Array<{ id: SubTab; label: string; icon: React.ComponentType<{ size?: number }> }>;
}> = [
  {
    category: "لوحة التحكم",
    items: [{ id: "dashboard", label: "نظرة عامة", icon: LayoutDashboard }],
  },
  {
    category: "القيود والدفاتر",
    items: [
      { id: "accounts", label: "شجرة الحسابات", icon: BookOpen },
      { id: "journal", label: "القيود اليومية", icon: ListOrdered },
      { id: "ledger", label: "دفتر الأستاذ", icon: ScrollText },
      { id: "trial_balance", label: "ميزان المراجعة", icon: Scale },
      { id: "bulk_reclass", label: "إعادة التصنيف الجماعي", icon: Layers },
    ],
  },
  {
    category: "البنوك",
    items: [{ id: "bank", label: "الحسابات البنكية", icon: Landmark }],
  },
  // المبيعات — قسم مستقل تماماً عن المشتريات (بنفس ترتيب أقسام Wafeq الفرعية)
  {
    category: "المبيعات",
    items: [
      { id: "customers", label: "العملاء", icon: Users },
      { id: "sales_quotes", label: "عروض الأسعار والأتعاب", icon: FileText },
      { id: "sales", label: "فواتير البيع", icon: ReceiptText },
      { id: "sales_recurring", label: "فواتير مجدولة", icon: Repeat },
      { id: "sales_credit_notes", label: "إشعارات دائنة", icon: FileMinus2 },
      { id: "sales_cash_invoices", label: "فواتير نقدية", icon: Banknote },
    ],
  },
  // المشتريات — قسم مستقل تماماً عن المبيعات
  {
    category: "المشتريات",
    items: [
      { id: "vendors", label: "الموردون", icon: Truck },
      { id: "purchase_orders", label: "أوامر الشراء", icon: ClipboardList },
      { id: "purchases", label: "فواتير المشتريات", icon: ShoppingCart },
      { id: "purchase_debit_notes", label: "إشعارات مدينة", icon: FilePlus2 },
      { id: "purchase_cash_expenses", label: "مصروفات نقدية", icon: HandCoins },
    ],
  },
  {
    category: "الأصول والرواتب",
    items: [
      { id: "assets", label: "الأصول الثابتة", icon: Boxes },
      { id: "payroll_employees", label: "سجل موظفي الرواتب", icon: UserRound },
      { id: "payroll_runs", label: "تشغيل الرواتب", icon: Wallet2 },
      { id: "employee_claims", label: "مطالبات الموظفين", icon: HandCoins },
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
  const [subTab, setSubTab] = useState<SubTab>("dashboard");
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
  const [salesQuotes, setSalesQuotes] = useState<SalesQuote[]>(() => loadSalesQuotes());
  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>(() => loadCashExpenses());
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(() => loadCreditNotes());
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>(() => loadDebitNotes());

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
  useEffect(() => saveAccountingStorage(QUOTE_LS_KEYS.quotes, salesQuotes), [salesQuotes]);
  useEffect(() => saveAccountingStorage(CASH_EXPENSE_LS_KEYS.expenses, cashExpenses), [cashExpenses]);
  useEffect(() => saveAccountingStorage(CREDIT_NOTE_LS_KEYS.creditNotes, creditNotes), [creditNotes]);
  useEffect(() => saveAccountingStorage(DEBIT_NOTE_LS_KEYS.debitNotes, debitNotes), [debitNotes]);

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
        <nav className="relative z-30 lg:sticky lg:top-4 app-card p-2 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible">
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

        {/* منطقة المحتوى: شاشة القسم الفرعي المختار حالياً (كل شاشة فرعية تعرض عنوانها الخاص أصلاً) */}
        <div className="min-w-0 space-y-4">

      {subTab === "dashboard" && (
        <AccountingDashboard
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

      {subTab === "customers" && (
        <ComingSoon
          title="العملاء"
          description="سجل عملاء مستقل عن الفواتير (بيانات التواصل، الرصيد، وسجل التعاملات السابقة لكل عميل) — قيد البناء ضمن مرحلة توسعة المبيعات."
        />
      )}

      {subTab === "sales_quotes" && (
        <QuoteProposals
          accounts={accounts}
          quotes={salesQuotes}
          setQuotes={setSalesQuotes}
          invoices={salesInvoices}
          setInvoices={setSalesInvoices}
          canManage={canManageSalesInvoices}
          currentUserName={currentUserName}
        />
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

      {subTab === "sales_recurring" && (
        <ComingSoon
          title="فواتير مجدولة"
          description="فاتورة تتكرر تلقائياً بجدول دوري (مثلاً أتعاب شهرية ثابتة لعميل) بدون إعادة إدخالها كل مرة."
        />
      )}

      {subTab === "sales_credit_notes" && (
        <CreditNotes
          accounts={accounts}
          creditNotes={creditNotes}
          setCreditNotes={setCreditNotes}
          invoices={salesInvoices}
          entries={entries}
          setEntries={setEntries}
          canManage={canManageSalesInvoices}
          canApprove={canApproveSalesInvoices}
          currentUserName={currentUserName}
        />
      )}

      {subTab === "sales_cash_invoices" && (
        <ComingSoon
          title="فواتير نقدية"
          description="فاتورة تُسدَّد فوراً نقداً وقت إصدارها، بدون دورة استحقاق أو متابعة تحصيل لاحقة."
        />
      )}

      {subTab === "vendors" && <Vendors vendors={vendors} setVendors={setVendors} canManage={canManageVendors} canDelete={canDeleteVendors} />}

      {subTab === "purchase_orders" && (
        <ComingSoon
          title="أوامر الشراء"
          description="طلب شراء أولي للمورد قبل استلام الفاتورة الرسمية، يتحول لاحقاً لفاتورة مشتريات عند التنفيذ."
        />
      )}

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

      {subTab === "purchase_debit_notes" && (
        <DebitNotes
          accounts={accounts}
          debitNotes={debitNotes}
          setDebitNotes={setDebitNotes}
          vendors={vendors}
          bills={purchaseInvoices}
          entries={entries}
          setEntries={setEntries}
          canManage={canManagePurchaseInvoices}
          canApprove={canApprovePurchaseInvoices}
          currentUserName={currentUserName}
        />
      )}

      {subTab === "purchase_cash_expenses" && (
        <CashExpenses
          accounts={accounts}
          expenses={cashExpenses}
          setExpenses={setCashExpenses}
          entries={entries}
          setEntries={setEntries}
          canManage={canManagePurchaseInvoices}
          canDelete={canDeletePurchaseInvoices}
          currentUserName={currentUserName}
        />
      )}

      {subTab === "employee_claims" && (
        <ComingSoon
          title="مطالبات الموظفين"
          description="طلب استرداد مصروف دفعه الموظف من جيبه الخاص لصالح المكتب (بدل مواصلات، رسوم عاجلة)، مع مسار اعتماد قبل الصرف."
        />
      )}

      {subTab === "bulk_reclass" && (
        <ComingSoon
          title="إعادة التصنيف الجماعي"
          description="تصحيح تصنيف عدة قيود أو معاملات دفعة واحدة (نقلها لحساب آخر) بدل تعديل كل قيد على حدة."
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
