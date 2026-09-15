// حالة "قائمة العقوبات/الإرهاب" (KYC Watchlist) — مستخرجة من App.tsx بنفس نمط الهوكس السابقة.
// نفس منطق تهيئة الحالة الأصلي حرفياً (بما فيه إصلاح المعرّفات المكررة عند التحميل الأول) —
// بدون أي تغيير بالسلوك.
import { useState, useEffect } from "react";
import type { KycWatchlistItem } from "../domain/types";
import { uaeTerroristList } from "../data/uaeTerroristListData";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export function useKycWatchlist() {
  const [kycWatchlist, setKycWatchlist] = useState<KycWatchlistItem[]>(() => {
    const saved = loadStorage<KycWatchlistItem[]>("firm_kyc_watchlist", uaeTerroristList);
    let list = (!saved || saved.length < 260) ? uaeTerroristList : saved;
    const seenIds = new Set<number>();
    let hadDuplicates = false;
    let maxId = 0;
    list.forEach((item) => { if (item.id > maxId) maxId = item.id; });
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
  });

  const [kycWatchlistParsed, setKycWatchlistParsed] = useState<KycWatchlistItem[]>([]);

  useEffect(() => {
    saveStorage("firm_kyc_watchlist", kycWatchlist);
  }, [kycWatchlist]);

  return { kycWatchlist, setKycWatchlist, kycWatchlistParsed, setKycWatchlistParsed };
}
