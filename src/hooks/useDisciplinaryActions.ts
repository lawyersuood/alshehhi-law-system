// حالة "الإجراءات التأديبية للموظفين" — مستخرجة من App.tsx بنفس نمط usePolicies/usePrecedents.
// saveDisciplinaryAction/deleteDisciplinaryAction بقيت داخل App.tsx (تعتمد على checkPerm/logAuditAction).
import { useState, useEffect } from "react";
import type { EmployeeDisciplinaryAction } from "../domain/types";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export function useDisciplinaryActions() {
  const [disciplinaryActions, setDisciplinaryActions] = useState<EmployeeDisciplinaryAction[]>(() =>
    loadStorage("firm_employee_disciplinary_actions", [])
  );

  useEffect(() => {
    saveStorage("firm_employee_disciplinary_actions", disciplinaryActions);
  }, [disciplinaryActions]);

  return { disciplinaryActions, setDisciplinaryActions };
}
