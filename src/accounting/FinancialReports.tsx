import React, { useState } from "react";
import { TrendingUp, PieChart, Wallet, Percent, Clock } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { BankAccount, BankTransaction } from "./bankTypes";
import { SalesInvoice, SalesPayment } from "./salesTypes";
import { Vendor, PurchaseInvoice, PurchasePayment } from "./purchaseTypes";
import IncomeStatement from "./IncomeStatement";
import BalanceSheet from "./BalanceSheet";
import CashFlowSummary from "./CashFlowSummary";
import VatReport from "./VatReport";
import AgedReceivablesPayables from "./AgedReceivablesPayables";

type ReportId = "income_statement" | "balance_sheet" | "cash_flow" | "vat" | "aging";

const REPORTS: Array<{ id: ReportId; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "income_statement", label: "قائمة الدخل", icon: TrendingUp },
  { id: "balance_sheet", label: "الميزانية العمومية", icon: PieChart },
  { id: "cash_flow", label: "التدفق النقدي", icon: Wallet },
  { id: "vat", label: "تقرير ضريبة القيمة المضافة", icon: Percent },
  { id: "aging", label: "أعمار الذمم", icon: Clock },
];

export default function FinancialReports({
  accounts,
  entries,
  bankAccounts,
  transactions,
  salesInvoices,
  salesPayments,
  vendors,
  purchaseInvoices,
  purchasePayments,
}: {
  accounts: Account[];
  entries: JournalEntry[];
  bankAccounts: BankAccount[];
  transactions: BankTransaction[];
  salesInvoices: SalesInvoice[];
  salesPayments: SalesPayment[];
  vendors: Vendor[];
  purchaseInvoices: PurchaseInvoice[];
  purchasePayments: PurchasePayment[];
}) {
  const [report, setReport] = useState<ReportId>("income_statement");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {REPORTS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setReport(id)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition ${
              report === id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {report === "income_statement" && <IncomeStatement accounts={accounts} entries={entries} />}
      {report === "balance_sheet" && <BalanceSheet accounts={accounts} entries={entries} />}
      {report === "cash_flow" && <CashFlowSummary bankAccounts={bankAccounts} transactions={transactions} />}
      {report === "vat" && <VatReport accounts={accounts} entries={entries} />}
      {report === "aging" && (
        <AgedReceivablesPayables
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
