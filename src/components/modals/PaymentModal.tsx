import { Modal, Field, Badge } from "../AuthScreens";
import { inputCls } from "../../domain/storageAndMessaging";
import { fmtAED, fmtDate, todayISO } from "../../domain/utils";
import type { Client, FeeAgreement } from "../../domain/types";

export interface PaymentModalProps {
  clients: Client[];
  feeAgreements: FeeAgreement[];
  form: Record<string, any>;
  setForm: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  clientName: (id: number) => string;
  getClientUnallocatedBalance: (clientId: number) => number;
  getRemainingForAgreement: (agreement: FeeAgreement) => number;
  isAgreementFullyPaid: (agreement: FeeAgreement) => boolean;
  onFieldChange: (
    key: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * نافذة "تسجيل سند قبض / دفعة أتعاب جديدة" — الخطوة الثامنة عشرة من تفكيك App.tsx التدريجي.
 */
export default function PaymentModal({
  clients,
  feeAgreements,
  form,
  setForm,
  clientName,
  getClientUnallocatedBalance,
  getRemainingForAgreement,
  isAgreementFullyPaid,
  onFieldChange,
  onSave,
  onClose,
}: PaymentModalProps) {
  return (
    <Modal title="تسجيل سند قبض / دفعة أتعاب جديدة" onClose={onClose} wide>
      <div className="space-y-4 text-sm">
        {/* اختيار الموكل */}
        <Field label="الموكل (مُسدّد الدفعة)">
          <select
            value={form.clientId || ""}
            onChange={(e) => {
              const cId = e.target.value;
              setForm((prev) => ({
                ...prev,
                clientId: cId,
                feeAgreementId: "unallocated",
              }));
            }}
            className={inputCls}
          >
            <option value="">اختر الموكل…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </Field>

        {/* عند اختيار الموكل: عرض الاتفاقيات النشطة والرصيد المعلّق */}
        {form.clientId ? (
          (() => {
            const selectedClientId = +form.clientId;
            const activeAgreements = feeAgreements.filter(
              (a) => a.clientId === selectedClientId && a.status === "نشطة",
            );
            const unallocatedBal = getClientUnallocatedBalance(selectedClientId);

            return (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-stone-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800">
                    اختر اتفاقية الأتعاب المرتبطة بالدفعة:
                  </label>
                  {unallocatedBal > 0 && (
                    <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                      الرصيد المعلّق الحالي للموكل: {fmtAED(unallocatedBal)}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* خيار: دفعة غير مخصصة */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                      !form.feeAgreementId || form.feeAgreementId === "unallocated"
                        ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/30"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feeAgreementRadio"
                      value="unallocated"
                      checked={!form.feeAgreementId || form.feeAgreementId === "unallocated"}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, feeAgreementId: "unallocated" }))
                      }
                      className="mt-1 h-4 w-4 accent-amber-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          دفعة غير مخصصة (رصيد معلّق للموكل)
                        </span>
                        <Badge className="bg-amber-100 text-amber-800">رصيد معلّق</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        إذا لم تكن الاتفاقية معروفة، تنحفظ هذه الدفعة كـ "رصيد معلّق" لحين تسويتها
                        لاحقاً.
                      </p>
                    </div>
                  </label>

                  {/* قائمة الاتفاقيات النشطة للموكل */}
                  {activeAgreements.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-semibold text-slate-600 mr-1">
                        الاتفاقيات النشطة المتاحة لـ (<b>{clientName(+form.clientId)}</b>):
                      </p>
                      {activeAgreements.map((agr) => {
                        const remaining = getRemainingForAgreement(agr);
                        const fullyPaid = isAgreementFullyPaid(agr);
                        const isSelected =
                          form.feeAgreementId === String(agr.id) || form.feeAgreementId === agr.id;

                        return (
                          <label
                            key={agr.id}
                            className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition ${
                              fullyPaid
                                ? "bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed"
                                : isSelected
                                  ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/30 cursor-pointer"
                                  : "bg-white border-slate-200 cursor-pointer hover:border-amber-300"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="feeAgreementRadio"
                                value={agr.id}
                                disabled={fullyPaid}
                                checked={isSelected}
                                onChange={() =>
                                  setForm((prev) => ({ ...prev, feeAgreementId: agr.id }))
                                }
                                className="mt-1 h-4 w-4 accent-amber-600"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">
                                    [{agr.agreementNumber}] {agr.title}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  تاريخ العقد: {fmtDate(agr.date)} • إجمالي العقد:{" "}
                                  {fmtAED(agr.totalAmount)}
                                </p>
                              </div>
                            </div>

                            <div className="text-left shrink-0">
                              {fullyPaid ? (
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                                  مسددة بالكامل
                                </span>
                              ) : (
                                <div className="bg-amber-100/90 px-3 py-1.5 rounded-xl text-left border border-amber-200">
                                  <span className="text-[10px] text-amber-900 block font-semibold">
                                    المتبقي على الاتفاقية:
                                  </span>
                                  <span className="text-xs font-bold text-amber-900 font-mono">
                                    {fmtAED(remaining)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      ℹ️ لا توجد اتفاقيات أتعاب نشطة حالياً لهذا الموكل. سيتم تسجيل الدفعة كـ "دفعة
                      غير مخصصة".
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 text-center">
            يرجى اختيار الموكل أولاً لعرض اتفاقياته النشطة والمتبقي عليها.
          </div>
        )}

        {/* المبلغ وتاريخ السداد */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="مبلغ الدفعة المقبوضة (د.إ)">
            <input
              type="number"
              onChange={onFieldChange("amount")}
              value={form.amount || ""}
              placeholder="مثال: 15000"
              className={inputCls}
            />
          </Field>
          <Field label="تاريخ سداد الدفعة">
            <input
              type="date"
              onChange={onFieldChange("date")}
              defaultValue={form.date || todayISO()}
              className={inputCls}
            />
          </Field>
        </div>

        {/* طريقة السداد والاطلاع المالي */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="طريقة السداد">
            <select
              onChange={onFieldChange("paymentMethod")}
              value={form.paymentMethod || "تحويل بنكي"}
              className={inputCls}
            >
              <option value="تحويل بنكي">تحويل بنكي</option>
              <option value="شيك بنكي">شيك بنكي</option>
              <option value="نقداً">نقداً</option>
              <option value="بطاقة ائتمانية">بطاقة ائتمانية / شباك إلكتروني</option>
              <option value="إيداع مباشر">إيداع بالحساب البنكي</option>
            </select>
          </Field>
          <Field label="رقم المرجع / الشيك / الإيصال">
            <input
              onChange={onFieldChange("referenceNo")}
              value={form.referenceNo || ""}
              placeholder="مثال: TRF-982104 / شيك 00421"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="بيان وملاحظات سند القبض">
          <textarea
            onChange={onFieldChange("notes")}
            value={form.notes || ""}
            rows={2}
            placeholder="بيان تفصيلي عن الدفعة المقبوضة..."
            className={inputCls}
          />
        </Field>

        <button
          onClick={onSave}
          className="w-full rounded-xl bg-[#0D382B] py-3 font-bold text-white hover:bg-[#124d40] transition-colors shadow-sm"
        >
          حفظ وتأكيد سند القبض
        </button>
      </div>
    </Modal>
  );
}
