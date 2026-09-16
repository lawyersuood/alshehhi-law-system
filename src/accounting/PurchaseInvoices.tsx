import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, AlertTriangle, CheckCircle2, Eye, Ban, CreditCard } from "lucide-react";
import { Account, JournalEntry } from "./types";
import { nextEntryNumber, nextBillNumber } from "./storage";
import {
  Vendor,
  PurchaseInvoice,
  PurchasePayment,
  PurchaseLineItem,
  AP_ACCOUNT_CODE,
  VAT_INPUT_ACCOUNT_CODE,
  purchaseTotals,
  amountPaid,
  amountDue,
  lineNetAmount,
} from "./purchaseTypes";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/[0.12] transition";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const fmtDateLabel = (d: string) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

function emptyLine(): PurchaseLineItem {
  return {
    id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
    vatRate: 5,
    accountId: "",
  };
}

interface DraftForm {
  id?: string;
  date: string;
  dueDate: string;
  vendorId: string;
  vendorInvoiceNumber: string;
  notes: string;
  lines: PurchaseLineItem[];
}

function newDraft(): DraftForm {
  return {
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    vendorId: "",
    vendorInvoiceNumber: "",
    notes: "",
    lines: [emptyLine()],
  };
}

export default function PurchaseInvoices({
  accounts,
  vendors,
  invoices,
  setInvoices,
  payments,
  setPayments,
  entries,
  setEntries,
  canManage,
  canApprove,
  canRecordPayment,
  canDelete,
  currentUserName,
}: {
  accounts: Account[];
  vendors: Vendor[];
  invoices: PurchaseInvoice[];
  setInvoices: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
  payments: PurchasePayment[];
  setPayments: React.Dispatch<React.SetStateAction<PurchasePayment[]>>;
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  canManage: boolean;
  canApprove: boolean;
  canRecordPayment: boolean;
  canDelete: boolean;
  currentUserName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftForm>(newDraft());
  const [error, setError] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const expenseAccounts = useMemo(
    () =>
      accounts
        .filter((a) => a.isActive && !a.isGroup && a.type === "expense")
        .sort((a, b) => a.code.localeCompare(b.code)),
    [accounts],
  );
  const assetAccounts = useMemo(
    () =>
      accounts
        .filter((a) => a.isActive && !a.isGroup && a.type === "asset")
        .sort((a, b) => a.code.localeCompare(b.code)),
    [accounts],
  );
  const activeVendors = useMemo(
    () => vendors.filter((v) => v.isActive).sort((a, b) => a.name.localeCompare(b.name)),
    [vendors],
  );
  const apAccount = useMemo(() => accounts.find((a) => a.code === AP_ACCOUNT_CODE), [accounts]);
  const vatInputAccount = useMemo(
    () => accounts.find((a) => a.code === VAT_INPUT_ACCOUNT_CODE),
    [accounts],
  );

  const sortedInvoices = useMemo(
    () =>
      [...invoices].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.billNumber.localeCompare(a.billNumber),
      ),
    [invoices],
  );

  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name || "—";
  const accountLabel = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.code} — ${a.name}` : "—";
  };

  const openNew = () => {
    setError("");
    setDraft(newDraft());
    setShowForm(true);
  };

  const openEdit = (bill: PurchaseInvoice) => {
    setError("");
    setDraft({
      id: bill.id,
      date: bill.date,
      dueDate: bill.dueDate || "",
      vendorId: bill.vendorId,
      vendorInvoiceNumber: bill.vendorInvoiceNumber || "",
      notes: bill.notes || "",
      lines: bill.lines.map((l) => ({ ...l })),
    });
    setShowForm(true);
  };

  const updateLine = (id: string, patch: Partial<PurchaseLineItem>) =>
    setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const addLine = () => setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] }));
  const removeLine = (id: string) =>
    setDraft((d) => (d.lines.length > 1 ? { ...d, lines: d.lines.filter((l) => l.id !== id) } : d));

  const draftTotals = purchaseTotals(draft);

  const saveDraft = () => {
    if (!draft.vendorId) {
      setError("يرجى اختيار المورد");
      return;
    }
    const validLines = draft.lines.filter(
      (l) => l.description.trim() && l.quantity > 0 && l.accountId,
    );
    if (validLines.length === 0) {
      setError("يجب إدخال بند واحد على الأقل ببيان وكمية وحساب مصروف مرتبط");
      return;
    }
    if (draft.id) {
      setInvoices((prev) =>
        prev.map((b) =>
          b.id === draft.id
            ? {
                ...b,
                date: draft.date,
                dueDate: draft.dueDate || undefined,
                vendorId: draft.vendorId,
                vendorInvoiceNumber: draft.vendorInvoiceNumber.trim() || undefined,
                notes: draft.notes.trim() || undefined,
                lines: validLines,
              }
            : b,
        ),
      );
    } else {
      setInvoices((prev) => [
        ...prev,
        {
          id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          billNumber: nextBillNumber(invoices),
          vendorInvoiceNumber: draft.vendorInvoiceNumber.trim() || undefined,
          vendorId: draft.vendorId,
          date: draft.date,
          dueDate: draft.dueDate || undefined,
          lines: validLines,
          notes: draft.notes.trim() || undefined,
          status: "draft",
          createdAt: new Date().toISOString(),
          createdBy: currentUserName,
        },
      ]);
    }
    setShowForm(false);
  };

  const approveInvoice = (bill: PurchaseInvoice) => {
    if (!apAccount) {
      alert("تعذر العثور على حساب ذمم الموردين الدائنة (2010) في شجرة الحسابات");
      return;
    }
    const { vatTotal, grandTotal } = purchaseTotals(bill);
    if (grandTotal <= 0) return;
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const expenseByAccount = new Map<string, number>();
    for (const l of bill.lines) {
      expenseByAccount.set(
        l.accountId,
        (expenseByAccount.get(l.accountId) || 0) + lineNetAmount(l),
      );
    }
    const lines = [
      ...Array.from(expenseByAccount.entries()).map(([accountId, amount], idx) => ({
        id: `l-${journalEntryId}-exp-${idx}`,
        accountId,
        debit: amount,
        credit: 0,
      })),
      { id: `l-${journalEntryId}-ap`, accountId: apAccount.id, debit: 0, credit: grandTotal },
    ];
    if (vatTotal > 0 && vatInputAccount) {
      lines.splice(lines.length - 1, 0, {
        id: `l-${journalEntryId}-vat`,
        accountId: vatInputAccount.id,
        debit: vatTotal,
        credit: 0,
      });
    }
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: bill.date,
      description: `اعتماد فاتورة مشتريات رقم ${bill.billNumber} — ${vendorName(bill.vendorId)}`,
      reference: bill.billNumber,
      lines,
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    setEntries((prev) => [...prev, newEntry]);
    setInvoices((prev) =>
      prev.map((x) =>
        x.id === bill.id
          ? {
              ...x,
              status: "approved",
              journalEntryId,
              approvedAt: now,
              approvedBy: currentUserName,
            }
          : x,
      ),
    );
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setInvoices((prev) => prev.filter((i) => i.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const requestCancel = (id: string) => setConfirmCancelId(id);
  const confirmCancel = () => {
    if (!confirmCancelId) return;
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === confirmCancelId
          ? { ...i, status: "cancelled", cancelledAt: new Date().toISOString() }
          : i,
      ),
    );
    setConfirmCancelId(null);
  };

  const openPaymentForm = (bill: PurchaseInvoice) => {
    setPaymentError("");
    setPaymentAmount(String(amountDue(bill, payments).toFixed(2)));
    setPaymentAccountId("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentRef("");
    setShowPaymentForm(true);
  };

  const savePayment = (bill: PurchaseInvoice) => {
    const amount = Number(paymentAmount);
    const due = amountDue(bill, payments);
    if (!amount || amount <= 0) {
      setPaymentError("يرجى إدخال مبلغ صحيح أكبر من صفر");
      return;
    }
    if (amount > due + 0.005) {
      setPaymentError(`المبلغ المدخل أكبر من المتبقي على الفاتورة (${fmtMoney(due)})`);
      return;
    }
    if (!paymentAccountId || !apAccount) {
      setPaymentError("يرجى اختيار الحساب الذي دُفع منه المبلغ");
      return;
    }
    const now = new Date().toISOString();
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newEntry: JournalEntry = {
      id: journalEntryId,
      entryNumber: nextEntryNumber(entries),
      date: paymentDate,
      description: `سداد دفعة على فاتورة المشتريات رقم ${bill.billNumber} — ${vendorName(bill.vendorId)}`,
      reference: bill.billNumber,
      lines: [
        { id: `l-${journalEntryId}-1`, accountId: apAccount.id, debit: amount, credit: 0 },
        { id: `l-${journalEntryId}-2`, accountId: paymentAccountId, debit: 0, credit: amount },
      ],
      status: "posted",
      createdAt: now,
      createdBy: currentUserName,
      postedAt: now,
      postedBy: currentUserName,
    };
    const newPayment: PurchasePayment = {
      id: `pp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      billId: bill.id,
      date: paymentDate,
      amount,
      payingAccountId: paymentAccountId,
      reference: paymentRef.trim() || undefined,
      journalEntryId,
      createdAt: now,
      createdBy: currentUserName,
    };
    setEntries((prev) => [...prev, newEntry]);
    setPayments((prev) => [...prev, newPayment]);
    setShowPaymentForm(false);
  };

  const viewingInvoice = invoices.find((i) => i.id === viewingId) || null;
  const deletingInvoice = invoices.find((i) => i.id === confirmDeleteId);
  const cancellingInvoice = invoices.find((i) => i.id === confirmCancelId);

  const statusBadge = (status: PurchaseInvoice["status"]) => {
    if (status === "approved")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} /> معتمدة
        </span>
      );
    if (status === "cancelled")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          ملغاة
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        مسودة
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">المشتريات والمصروفات</h2>
          <p className="text-xs text-slate-500">
            فواتير مشتريات ومصروفات مصنّفة على حسابات المصروفات — {invoices.length} فاتورة
          </p>
        </div>
        {canManage && (
          <button
            onClick={openNew}
            disabled={activeVendors.length === 0}
            title={activeVendors.length === 0 ? "أضف مورداً واحداً على الأقل أولاً" : undefined}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)] disabled:opacity-40"
          >
            <Plus size={16} /> فاتورة مشتريات جديدة
          </button>
        )}
      </div>

      {(!apAccount || !vatInputAccount) && (
        <div className="flex items-center gap-2 rounded-xl bg-[#0D382B]/[0.05] border border-[#0D382B]/15 px-4 py-3 text-xs text-[#0D382B]">
          <AlertTriangle size={15} />
          تنبيه: لم يتم العثور على حساب "ذمم الموردين الدائنة" ({AP_ACCOUNT_CODE}) أو حساب "ضريبة
          القيمة المضافة — مدخلات" ({VAT_INPUT_ACCOUNT_CODE}) في شجرة الحسابات — لن يمكن اعتماد
          الفواتير دون هذين الحسابين.
        </div>
      )}

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-500 border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-2.5 font-semibold">رقم الفاتورة</th>
                <th className="px-4 py-2.5 font-semibold">التاريخ</th>
                <th className="px-4 py-2.5 font-semibold">المورد</th>
                <th className="px-4 py-2.5 font-semibold">الإجمالي</th>
                <th className="px-4 py-2.5 font-semibold">المتبقي</th>
                <th className="px-4 py-2.5 font-semibold">الحالة</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map((bill) => {
                const { grandTotal } = purchaseTotals(bill);
                const due = amountDue(bill, payments);
                return (
                  <tr
                    key={bill.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-2.5 font-mono text-slate-700">{bill.billNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                      {fmtDateLabel(bill.date)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">{vendorName(bill.vendorId)}</td>
                    <td className="px-4 py-2.5 font-mono">{fmtMoney(grandTotal)}</td>
                    <td className="px-4 py-2.5 font-mono">
                      {bill.status === "approved" ? fmtMoney(due) : "—"}
                    </td>
                    <td className="px-4 py-2.5">{statusBadge(bill.status)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setViewingId(bill.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        >
                          <Eye size={14} />
                        </button>
                        {bill.status === "draft" && canManage && (
                          <button
                            onClick={() => openEdit(bill)}
                            className="text-xs font-semibold text-[#0D382B] hover:bg-[#0D382B]/[0.06] px-2 py-1 rounded-lg"
                          >
                            تعديل
                          </button>
                        )}
                        {bill.status === "draft" && canApprove && (
                          <button
                            onClick={() => approveInvoice(bill)}
                            className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg"
                          >
                            اعتماد
                          </button>
                        )}
                        {bill.status === "draft" && canDelete && (
                          <button
                            onClick={() => requestDelete(bill.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد فواتير مشتريات مسجّلة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {draft.id ? "تعديل فاتورة المشتريات" : "فاتورة مشتريات جديدة"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">المورد</label>
                <select
                  value={draft.vendorId}
                  onChange={(e) => setDraft({ ...draft, vendorId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">اختر المورد…</option>
                  {activeVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  رقم فاتورة المورد (اختياري)
                </label>
                <input
                  value={draft.vendorInvoiceNumber}
                  onChange={(e) => setDraft({ ...draft, vendorInvoiceNumber: e.target.value })}
                  className={inputCls + " font-mono"}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  تاريخ الفاتورة
                </label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  تاريخ الاستحقاق (اختياري)
                </label>
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-1">
                <div className="col-span-4">الوصف</div>
                <div className="col-span-2">الكمية</div>
                <div className="col-span-2">سعر الوحدة</div>
                <div className="col-span-1">ض.ق.م %</div>
                <div className="col-span-2">حساب المصروف</div>
                <div className="col-span-1"></div>
              </div>
              {draft.lines.map((l) => (
                <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={l.description}
                    onChange={(e) => updateLine(l.id, { description: e.target.value })}
                    placeholder="وصف المصروف"
                    className={inputCls + " col-span-4"}
                  />
                  <input
                    type="number"
                    min={0}
                    value={l.quantity}
                    onChange={(e) => updateLine(l.id, { quantity: Number(e.target.value) || 0 })}
                    className={inputCls + " col-span-2 font-mono"}
                  />
                  <input
                    type="number"
                    min={0}
                    value={l.unitPrice}
                    onChange={(e) => updateLine(l.id, { unitPrice: Number(e.target.value) || 0 })}
                    className={inputCls + " col-span-2 font-mono"}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={l.vatRate}
                    onChange={(e) => updateLine(l.id, { vatRate: Number(e.target.value) || 0 })}
                    className={inputCls + " col-span-1 font-mono"}
                  />
                  <select
                    value={l.accountId}
                    onChange={(e) => updateLine(l.id, { accountId: e.target.value })}
                    className={inputCls + " col-span-2"}
                  >
                    <option value="">اختر…</option>
                    {expenseAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeLine(l.id)}
                    disabled={draft.lines.length <= 1}
                    className="col-span-1 p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addLine}
                className="text-xs font-semibold text-[#0D382B] hover:bg-[#0D382B]/[0.06] px-2 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Plus size={13} /> إضافة بند
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                ملاحظات (اختياري)
              </label>
              <input
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">المجموع قبل الضريبة</span>
                <span className="font-mono">{fmtMoney(draftTotals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ضريبة القيمة المضافة (قابلة للاسترداد)</span>
                <span className="font-mono">{fmtMoney(draftTotals.vatTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>الإجمالي</span>
                <span className="font-mono">{fmtMoney(draftTotals.grandTotal)}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={saveDraft}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#0D382B] hover:bg-[#124d40] transition-colors rounded-xl"
              >
                حفظ كمسودة
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingInvoice && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                فاتورة مشتريات {viewingInvoice.billNumber}
              </h3>
              <button
                onClick={() => setViewingId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(viewingInvoice.status)}
              <span className="text-xs text-slate-500">{fmtDateLabel(viewingInvoice.date)}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <p>
                <span className="text-slate-500">المورد: </span>
                {vendorName(viewingInvoice.vendorId)}
              </p>
              {viewingInvoice.vendorInvoiceNumber && (
                <p>
                  <span className="text-slate-500">رقم فاتورة المورد: </span>
                  {viewingInvoice.vendorInvoiceNumber}
                </p>
              )}
            </div>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 bg-slate-50/70">
                    <th className="px-3 py-2 text-right font-semibold">الوصف</th>
                    <th className="px-3 py-2 text-right font-semibold">الكمية</th>
                    <th className="px-3 py-2 text-right font-semibold">السعر</th>
                    <th className="px-3 py-2 text-right font-semibold">ض.ق.م</th>
                    <th className="px-3 py-2 text-right font-semibold">الحساب</th>
                    <th className="px-3 py-2 text-right font-semibold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.lines.map((l) => (
                    <tr key={l.id} className="border-t border-slate-50">
                      <td className="px-3 py-2">{l.description}</td>
                      <td className="px-3 py-2 font-mono">{l.quantity}</td>
                      <td className="px-3 py-2 font-mono">{l.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono">{l.vatRate}%</td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {accountLabel(l.accountId)}
                      </td>
                      <td className="px-3 py-2 font-mono">{lineNetAmount(l).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(() => {
              const t = purchaseTotals(viewingInvoice);
              const due = amountDue(viewingInvoice, payments);
              const paid = amountPaid(viewingInvoice.id, payments);
              return (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">المجموع قبل الضريبة</span>
                    <span className="font-mono">{fmtMoney(t.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ضريبة القيمة المضافة</span>
                    <span className="font-mono">{fmtMoney(t.vatTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>الإجمالي</span>
                    <span className="font-mono">{fmtMoney(t.grandTotal)}</span>
                  </div>
                  {viewingInvoice.status === "approved" && (
                    <>
                      <div className="flex justify-between text-emerald-700">
                        <span>المسدّد</span>
                        <span className="font-mono">{fmtMoney(paid)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#0D382B]">
                        <span>المتبقي</span>
                        <span className="font-mono">{fmtMoney(due)}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {viewingInvoice.status === "approved" &&
              payments.some((p) => p.billId === viewingInvoice.id) && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">الدفعات المسجّلة</p>
                  <div className="space-y-1.5">
                    {payments
                      .filter((p) => p.billId === viewingInvoice.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-xs bg-emerald-50/60 border border-emerald-100 rounded-lg px-3 py-2"
                        >
                          <span>
                            {fmtDateLabel(p.date)} — {accountLabel(p.payingAccountId)}
                          </span>
                          <span className="font-mono font-semibold text-emerald-700">
                            {fmtMoney(p.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            <div className="flex gap-2 justify-end pt-2 flex-wrap">
              {viewingInvoice.status === "draft" && canApprove && (
                <button
                  onClick={() => approveInvoice(viewingInvoice)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  اعتماد الفاتورة وترحيل القيد
                </button>
              )}
              {viewingInvoice.status === "draft" && canManage && (
                <button
                  onClick={() => requestCancel(viewingInvoice.id)}
                  className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1.5"
                >
                  <Ban size={14} /> إلغاء الفاتورة
                </button>
              )}
              {viewingInvoice.status === "approved" &&
                amountDue(viewingInvoice, payments) > 0.005 &&
                canRecordPayment && (
                  <button
                    onClick={() => openPaymentForm(viewingInvoice)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#0D382B] hover:bg-[#124d40] transition-colors rounded-xl flex items-center gap-1.5"
                  >
                    <CreditCard size={14} /> تسجيل دفعة سداد
                  </button>
                )}
            </div>

            {showPaymentForm && viewingInvoice.status === "approved" && (
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/60">
                <p className="text-sm font-bold text-slate-800">تسجيل دفعة سداد جديدة</p>
                {paymentError && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {paymentError}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      المبلغ
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className={inputCls + " font-mono"}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      تاريخ السداد
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    دُفع من حساب
                  </label>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">اختر الحساب…</option>
                    {assetAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    مرجع (اختياري)
                  </label>
                  <input
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => savePayment(viewingInvoice)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    حفظ وترحيل
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDeleteId && deletingInvoice && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900">تأكيد حذف الفاتورة</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من حذف مسودة الفاتورة{" "}
              <span className="font-bold">{deletingInvoice.billNumber}</span>؟
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCancelId && cancellingInvoice && (
        <div
          className="fixed inset-0 bg-[#08130f]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmCancelId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900">تأكيد إلغاء الفاتورة</h3>
            <p className="text-sm text-slate-600">
              هل أنت متأكد من إلغاء الفاتورة{" "}
              <span className="font-bold">{cancellingInvoice.billNumber}</span>؟
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                تراجع
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
