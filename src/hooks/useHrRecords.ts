// حالة "الموارد البشرية" (الموظفون، طلبات الإجازة، مصروفات الموظفين) — مستخرجة من App.tsx.
// saveEmployee/deleteEmployee/saveLeaveRequest/saveEmployeeExpense بقيت داخل App.tsx.
import { useState, useEffect } from "react";
import type { Employee, LeaveRequest, EmployeeExpense } from "../domain/types";
import { seedEmployees, seedLeaveRequests, seedEmployeeExpenses } from "../domain/seedData";
import { loadStorage, saveStorage } from "../domain/storageAndMessaging";

export function useHrRecords() {
  const [employees, setEmployees] = useState<Employee[]>(() => loadStorage("firm_employees", seedEmployees));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => loadStorage("firm_leave_requests", seedLeaveRequests));
  const [employeeExpenses, setEmployeeExpenses] = useState<EmployeeExpense[]>(() => loadStorage("firm_employee_expenses", seedEmployeeExpenses));
  const [hrSubTab, setHrSubTab] = useState<"directory" | "leaves" | "expenses" | "disciplinary">("directory");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  useEffect(() => { saveStorage("firm_employees", employees); }, [employees]);
  useEffect(() => { saveStorage("firm_leave_requests", leaveRequests); }, [leaveRequests]);
  useEffect(() => { saveStorage("firm_employee_expenses", employeeExpenses); }, [employeeExpenses]);

  return {
    employees, setEmployees,
    leaveRequests, setLeaveRequests,
    employeeExpenses, setEmployeeExpenses,
    hrSubTab, setHrSubTab,
    employeeSearchQuery, setEmployeeSearchQuery,
  };
}
