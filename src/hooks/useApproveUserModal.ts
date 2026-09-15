// حالة "مودال تخصيص الصلاحيات عند قبول وتفعيل مستخدم جديد" — مستخرجة من App.tsx.
// openApproveUserModal/confirmApproveUser بقيتا داخل App.tsx (تعتمد على logAuditAction/setUsers).
import { useState } from "react";
import type { UserItem } from "../domain/types";

export function useApproveUserModal() {
  const [approvingUser, setApprovingUser] = useState<UserItem | null>(null);
  const [assignRoleTitle, setAssignRoleTitle] = useState<string>("");
  const [assignRoleKey, setAssignRoleKey] = useState<"admin" | "lawyer" | "secretary" | "accountant">("lawyer");
  const [assignCanTransfer, setAssignCanTransfer] = useState<boolean>(false);
  const [assignCanAgreements, setAssignCanAgreements] = useState<boolean>(false);
  const [assignCanWhatsapp, setAssignCanWhatsapp] = useState<boolean>(false);
  const [assignCanFinances, setAssignCanFinances] = useState<boolean>(false);

  return {
    approvingUser, setApprovingUser,
    assignRoleTitle, setAssignRoleTitle,
    assignRoleKey, setAssignRoleKey,
    assignCanTransfer, setAssignCanTransfer,
    assignCanAgreements, setAssignCanAgreements,
    assignCanWhatsapp, setAssignCanWhatsapp,
    assignCanFinances, setAssignCanFinances,
  };
}
