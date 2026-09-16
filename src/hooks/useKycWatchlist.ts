// حالة "قائمة العقوبات/الإرهاب" (KYC Watchlist) — مستخرجة من App.tsx بنفس نمط الهوكس السابقة.
// نفس منطق تهيئة الحالة الأصلي حرفياً (بما فيه إصلاح المعرّفات المكررة عند التحميل الأول).
//
// تحديث لاحق (ضمن دمج "النواة" المشتركة): أُضيفت مزامنة Supabase (جدول kyc_watchlist_items) عبر
// هوك useSyncedTable العام، لأن هذه المزامنة كانت أصلاً جزءاً من useEffect الضخم "remainingSyncTables"
// بـ App.tsx — لم تكن بهذا الهوك سابقاً (كان محلياً فقط). السلوك النهائي مطابق تماماً لما كان بـ App.tsx.
import { useState } from "react";
import type { KycWatchlistItem } from "../domain/types";
import { uaeTerroristList } from "../data/uaeTerroristListData";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";
import { useSyncedTable } from "./useSyncedTable";

export function useKycWatchlist() {
  const [kycWatchlist, setKycWatchlist] = useSyncedTable<KycWatchlistItem>(
    "firm_kyc_watchlist",
    "kyc_watchlist_items",
    () => {
      const saved = loadStorage<KycWatchlistItem[]>("firm_kyc_watchlist", uaeTerroristList);
      const list = !saved || saved.length < 260 ? uaeTerroristList : saved;
      const seenIds = new Set<number>();
      let hadDuplicates = false;
      let maxId = 0;
      list.forEach((item) => {
        if (item.id > maxId) maxId = item.id;
      });
      const deduped = list.map((item) => {
        if (seenIds.has(item.id)) {
          hadDuplicates = true;
          maxId += 1;
          seenIds.add(maxId);
          return { ...item, id: maxId };
        }
        seenIds.add(item.id);
        return item;
      });
      if (hadDuplicates) {
        saveStorage("firm_kyc_watchlist", deduped);
        return deduped;
      }
      if (!saved || saved.length < 260) {
        saveStorage("firm_kyc_watchlist", list);
      }
      return list;
    },
  );

  const [kycWatchlistParsed, setKycWatchlistParsed] = useState<KycWatchlistItem[]>([]);

  // ملاحظة: الحفظ المحلي بعد أي تغيير أصبح يتم تلقائياً داخل useSyncedTable أعلاه (بالإضافة
  // للرفع المؤجل لـ Supabase) — لا حاجة لـ useEffect منفصل هنا بعد الآن.

  return { kycWatchlist, setKycWatchlist, kycWatchlistParsed, setKycWatchlistParsed };
}
