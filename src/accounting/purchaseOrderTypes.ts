// ============================================================
// أوامر الشراء (Purchase Orders) — قسم المشتريات
// طلب شراء أولي يُرسل للمورد قبل استلام الفاتورة الرسمية. عند تنفيذه (استلام البضاعة/
// الخدمة والفاتورة الفعلية) يتحول مباشرة لفاتورة مشتريات بنفس بنوده دون إعادة إدخالها.
// ============================================================

import { PurchaseLineItem } from "./purchaseTypes";

export type PurchaseOrderStatus = "draft" | "sent" | "fulfilled" | "cancelled" | "converted";

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: "مسودة",
  sent: "مرسل للمورد",
  fulfilled: "تم التوريد",
  cancelled: "ملغى",
  converted: "تم تحويله لفاتورة",
};

export interface PurchaseOrder {
  id: string;
  orderNumber: string; // PO-YYYY-XXXX
  date: string;
  expectedDate?: string;
  vendorId: string;
  lines: PurchaseLineItem[];
  notes?: string;
  status: PurchaseOrderStatus;
  convertedBillId?: string;
  createdAt: string;
  createdBy?: string;
}

export const PURCHASE_ORDER_LS_KEYS = {
  orders: "firm_accounting_purchase_orders_v1",
};
