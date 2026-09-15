// حالة "المحامون الزملاء والإنابات" — مستخرجة من App.tsx بنفس نمط الهوكس السابقة.
// saveColleague/issueDelegation/deleteDelegationHandler بقيت داخل App.tsx (تعتمد على checkPerm/logAuditAction).
import { useState, useEffect } from "react";
import type { Colleague, ColleagueDelegation } from "../domain/types";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export function useColleagues() {
  const [colleagues, setColleagues] = useState<Colleague[]>(() =>
    loadStorage<Colleague[]>("firm_colleagues", [])
  );
  useEffect(() => {
    saveStorage("firm_colleagues", colleagues);
  }, [colleagues]);

  const [colleagueDelegations, setColleagueDelegations] = useState<ColleagueDelegation[]>(() =>
    loadStorage<ColleagueDelegation[]>("firm_colleague_delegations", [])
  );
  useEffect(() => {
    saveStorage("firm_colleague_delegations", colleagueDelegations);
  }, [colleagueDelegations]);

  const [colleagueSubTab, setColleagueSubTab] = useState<"directory" | "delegations">("directory");
  const [editingColleagueId, setEditingColleagueId] = useState<number | null>(null);

  return {
    colleagues, setColleagues,
    colleagueDelegations, setColleagueDelegations,
    colleagueSubTab, setColleagueSubTab,
    editingColleagueId, setEditingColleagueId,
  };
}
