import React from "react";
import {
  UserCheck,
  UserPlus,
  CalendarDays,
  DollarSign,
  ShieldAlert,
  Users,
  CreditCard,
  Clock,
  Receipt,
  Search,
  Mail,
  Phone,
  AlertTriangle,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  Employee,
  LeaveRequest,
  EmployeeExpense,
  EmployeeDisciplinaryAction,
  CaseItem,
} from "../domain/types";
import { fmtDate, daysUntil, todayISO, normalizeArabicSearch } from "../domain/utils";

export interface EmployeesViewProps {
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setModal: (v: string | null) => void;
  isSuperAdmin: boolean;
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  employeeExpenses: EmployeeExpense[];
  hrSubTab: "directory" | "leaves" | "expenses" | "disciplinary";
  setHrSubTab: (tab: "directory" | "leaves" | "expenses" | "disciplinary") => void;
  disciplinaryActions: EmployeeDisciplinaryAction[];
  employeeSearchQuery: string;
  setEmployeeSearchQuery: (v: string) => void;
  deleteEmployee: (empId: string) => void;
  updateLeaveStatus: (id: string, status: "APPROVED" | "REJECTED") => void;
  updateExpenseStatus: (id: string, status: "PAID" | "REJECTED") => void;
  deleteDisciplinaryAction: (actionId: number) => void;
  cases: CaseItem[];
}

export default function EmployeesView({
  setForm,
  setModal,
  isSuperAdmin,
  employees,
  leaveRequests,
  employeeExpenses,
  hrSubTab,
  setHrSubTab,
  disciplinaryActions,
  employeeSearchQuery,
  setEmployeeSearchQuery,
  deleteEmployee,
  updateLeaveStatus,
  updateExpenseStatus,
  deleteDisciplinaryAction,
  cases,
}: EmployeesViewProps) {
  return (
    <div className="space-y-6">
      {/* Header & Main Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <UserCheck className="text-amber-600 w-7 h-7" />
            إدارة الموظفين والكادر والتنمية البشرية (HR)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل الموظفين والرواتب، متابعة طلبات الإجازات، ومراجعة مطالبات المصروفات والتعويضات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setForm({}); setModal("employee"); }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
          >
            <UserPlus size={16} /> إضافة موظف جديد
          </button>
          <button
            onClick={() => { setForm({ startDate: todayISO(), endDate: todayISO() }); setModal("leave-request"); }}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-sm"
          >
            <CalendarDays size={16} /> طلب إجازة
          </button>
          <button
            onClick={() => { setForm({}); setModal("employee-expense"); }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <DollarSign size={16} className="text-emerald-600" /> مطالبة مصروفات
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => { setForm({ actionDate: todayISO(), type: "تحقيق داخلي" }); setModal("employee-disciplinary"); }}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
            >
              <ShieldAlert size={16} /> تسجيل إجراء تأديبي
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">إجمالي الكادر الوظيفي</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{employees.length} موظف</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {employees.filter(e => e.status === "ACTIVE").length} على رأس العمل
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
        </div>

        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">إجمالي مسير الرواتب الشهري</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {(employees.reduce((sum, e) => sum + e.basicSalary + e.housingAllowance + e.transportAllowance, 0)).toLocaleString()} د.إ
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">شامل الأجور والبدلات</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CreditCard size={22} />
          </div>
        </div>

        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">طلبات الإجازات المعلقة</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {leaveRequests.filter(l => l.status === "PENDING").length} طلبات
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5 font-medium">تتطلب اعتماد المباشر</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">مطالبات المصروفات المعلقة</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {employeeExpenses.filter(e => e.status === "PENDING").reduce((s, x) => s + x.amount, 0).toLocaleString()} د.إ
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {employeeExpenses.filter(e => e.status === "PENDING").length} مطالبات بانتظار الصرف
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Receipt size={22} />
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setHrSubTab("directory")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            hrSubTab === "directory" ? "border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck size={16} /> دليل الموظفين والرواتب ({employees.length})
        </button>

        <button
          onClick={() => setHrSubTab("leaves")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            hrSubTab === "leaves" ? "border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarDays size={16} /> طلبات الإجازات
          {leaveRequests.filter(l => l.status === "PENDING").length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {leaveRequests.filter(l => l.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setHrSubTab("expenses")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            hrSubTab === "expenses" ? "border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt size={16} /> مصروفات وتعويضات الكادر
          {employeeExpenses.filter(e => e.status === "PENDING").length > 0 && (
            <span className="bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
              {employeeExpenses.filter(e => e.status === "PENDING").length}
            </span>
          )}
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setHrSubTab("disciplinary")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              hrSubTab === "disciplinary" ? "border-red-600 text-red-700 bg-red-50/50 rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert size={16} /> الإجراءات التأديبية (سري)
            {disciplinaryActions.length > 0 && (
              <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                {disciplinaryActions.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* SUB TAB 1: DIRECTORY & PAYROLL */}
      {hrSubTab === "directory" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                placeholder="البحث باسم الموظف، المسمى، الهوية، أو قيد المحامي..."
                className="w-full pl-3 pr-9 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              إجمالي مسير الشهر: <span className="font-bold text-slate-900">{(employees.reduce((s, e) => s + e.basicSalary + e.housingAllowance + e.transportAllowance, 0)).toLocaleString()} د.إ</span>
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar app-card">
            <table className="w-full min-w-[750px] text-right text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3.5 rounded-r-xl">الموظف والمسمى الوظيفي</th>
                  <th className="p-3.5">التواصل والبريد</th>
                  <th className="p-3.5">رقم الهوية والجواز</th>
                  <th className="p-3.5">رقم قيد المحامي</th>
                  <th className="p-3.5">تفاصيل الراتب والبدلات</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  <th className="p-3.5 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {employees
                  .filter(e => {
                    if (!employeeSearchQuery) return true;
                    const q = normalizeArabicSearch(employeeSearchQuery);
                    return (
                      normalizeArabicSearch(e.fullName).includes(q) ||
                      normalizeArabicSearch(e.jobTitle).includes(q) ||
                      normalizeArabicSearch(e.emiratesId).includes(q)
                    );
                  })
                  .map((emp) => {
                    const totalSalary = emp.basicSalary + emp.housingAllowance + emp.transportAllowance;
                    const daysToIdExpiry = emp.idExpiryDate ? daysUntil(emp.idExpiryDate) : 999;
                    return (
                      <tr key={emp.id} className="hover:bg-amber-50/20 transition">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                              {emp.fullName.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{emp.fullName}</p>
                              <p className="text-[11px] text-amber-700 font-medium">{emp.jobTitle}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-600">
                          <p className="flex items-center gap-1 font-mono text-[11px]"><Mail size={12} className="text-slate-400" /> {emp.email}</p>
                          <p className="flex items-center gap-1 font-mono text-[11px] mt-0.5"><Phone size={12} className="text-slate-400" /> {emp.phone}</p>
                        </td>

                        <td className="p-3.5 text-slate-700">
                          <p className="font-mono text-[11px]"><span className="text-slate-400">هوية:</span> {emp.emiratesId || "—"}</p>
                          <p className="font-mono text-[11px] mt-0.5"><span className="text-slate-400">جواز:</span> {emp.passportNumber || "—"}</p>
                          {emp.idExpiryDate && (
                            <div className="mt-1">
                              {daysToIdExpiry <= 60 ? (
                                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200 inline-flex items-center gap-1">
                                  <AlertTriangle size={10} /> ينتهي خلال {daysToIdExpiry} يوم
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">تنتهي: {fmtDate(emp.idExpiryDate)}</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5">
                          {emp.licenseNumber ? (
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-800 font-bold px-2 py-1 rounded-md border border-slate-200 inline-block">
                              {emp.licenseNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">كادر إداري / كاتب</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{totalSalary.toLocaleString()} د.إ / شهرياً</p>
                          <p className="text-[10px] text-slate-400">
                            أساسي: {emp.basicSalary.toLocaleString()} | سكن: {emp.housingAllowance.toLocaleString()} | مواصلات: {emp.transportAllowance.toLocaleString()}
                          </p>
                        </td>

                        <td className="p-3.5 text-center">
                          {emp.status === "ACTIVE" && (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                              على رأس العمل
                            </span>
                          )}
                          {emp.status === "ON_LEAVE" && (
                            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                              في إجازة
                            </span>
                          )}
                          {emp.status === "TERMINATED" && (
                            <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                              منهي الخدمة
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setForm({ ...emp }); setModal("employee"); }}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                              title="تعديل الموظف"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => deleteEmployee(emp.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="حذف الموظف"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 2: LEAVE REQUESTS */}
      {hrSubTab === "leaves" && (
        <div className="space-y-4">
          <div className="overflow-x-auto custom-scrollbar app-card">
            <table className="w-full min-w-[700px] text-right text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3.5 rounded-r-xl">الموظف</th>
                  <th className="p-3.5">نوع الإجازة</th>
                  <th className="p-3.5">الفترة المحددة</th>
                  <th className="p-3.5">إجمالي الأيام</th>
                  <th className="p-3.5">السبب / الملاحظات</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  {/* عمود ثابت (sticky) حتى يبقى زرا القبول والرفض ظاهرين دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                  <th className="sticky left-0 z-10 p-3.5 text-center bg-slate-900 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.3)]">اعتماد الإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">لا توجد طلبات إجازات مسجلة حالياً</td>
                  </tr>
                ) : (
                  leaveRequests.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50 group">
                      <td className="p-3.5 font-bold text-slate-900">{leave.employeeName}</td>
                      <td className="p-3.5">
                        {leave.leaveType === "ANNUAL" && <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded text-[11px]">سنوية اعتيادية</span>}
                        {leave.leaveType === "SICK" && <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[11px]">مرضية</span>}
                        {leave.leaveType === "EMERGENCY" && <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">طارئة</span>}
                        {leave.leaveType === "UNPAID" && <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">بدون أجر</span>}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        من {fmtDate(leave.startDate)} إلى {fmtDate(leave.endDate)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{leave.totalDays} أيام</td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate" title={leave.reason}>{leave.reason || "—"}</td>
                      <td className="p-3.5 text-center">
                        {leave.status === "PENDING" && <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold text-[11px]">قيد الانتظار</span>}
                        {leave.status === "APPROVED" && <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[11px]">مقبولة ومُعتمدة</span>}
                        {leave.status === "REJECTED" && <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-bold text-[11px]">مرفوضة</span>}
                      </td>
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-3.5 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                        {leave.status === "PENDING" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => updateLeaveStatus(leave.id, "APPROVED")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            >
                              <Check size={13} /> قبول
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(leave.id, "REJECTED")}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1"
                            >
                              <X size={13} /> رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {leave.approvedBy ? `بواسطة: ${leave.approvedBy}` : "مكتملة"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: EMPLOYEE EXPENSES */}
      {hrSubTab === "expenses" && (
        <div className="space-y-4">
          <div className="overflow-x-auto custom-scrollbar app-card">
            <table className="w-full min-w-[650px] text-right text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3.5 rounded-r-xl">الموظف</th>
                  <th className="p-3.5">بند المصروف</th>
                  <th className="p-3.5">المبلغ المطالب</th>
                  <th className="p-3.5">القضية المرتبطة</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  {/* عمود ثابت (sticky) حتى يبقى زرا الاعتماد والرفض ظاهرين دائماً دون الحاجة للتمرير الأفقي عند اتساع الجدول */}
                  <th className="sticky left-0 z-10 p-3.5 text-center bg-slate-900 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.3)]">اعتماد الصرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {employeeExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">لا توجد مطالبات مصروفات حالياً</td>
                  </tr>
                ) : (
                  employeeExpenses.map((exp) => {
                    const caseItem = cases.find(c => c.id === exp.caseId);
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50 group">
                        <td className="p-3.5 font-bold text-slate-900">{exp.employeeName}</td>
                        <td className="p-3.5 font-medium">
                          {exp.category === "COURT_FEES" && <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[11px]">رسوم محاكم وخدمات</span>}
                          {exp.category === "TRANSPORT" && <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded text-[11px]">تنقلات ومواصفات</span>}
                          {exp.category === "SUPPLIES" && <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">أدوات ومستلزمات مكتب</span>}
                          {exp.category === "OTHER" && <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">مصروفات أخرى</span>}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 text-sm">{exp.amount.toLocaleString()} د.إ</td>
                        <td className="p-3.5 text-slate-600">
                          {caseItem ? (
                            <span className="font-mono text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                              قضية #{caseItem.number}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">مصروف إداري عام</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {exp.status === "PENDING" && <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold text-[11px]">قيد المراجعة</span>}
                          {exp.status === "PAID" && <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[11px]">مدفوع / تم التعويض</span>}
                          {exp.status === "REJECTED" && <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-bold text-[11px]">مرفوض</span>}
                        </td>
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-3.5 text-center shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                          {exp.status === "PENDING" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => updateExpenseStatus(exp.id, "PAID")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                              >
                                <Check size={13} /> اعتماد وصرف
                              </button>
                              <button
                                onClick={() => updateExpenseStatus(exp.id, "REJECTED")}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1"
                              >
                                <X size={13} /> رفض
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">مكتمل</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 4: CONFIDENTIAL DISCIPLINARY ACTIONS (SUPER ADMIN ONLY) */}
      {hrSubTab === "disciplinary" && isSuperAdmin && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-800">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p>هذا السجل سري ومقتصر على الحساب الرئيسي فقط، ولا يظهر لبقية الكادر أو في أي قسم عام آخر بالنظام.</p>
          </div>

          {disciplinaryActions.length === 0 ? (
            <div className="text-center py-14 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <ShieldAlert size={40} className="mx-auto mb-2 text-slate-300" />
              لا توجد أي إجراءات تأديبية مسجّلة حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {[...disciplinaryActions]
                .sort((a, b) => (b.actionDate || "").localeCompare(a.actionDate || ""))
                .map((act) => (
                  <div key={act.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-[11px] border border-red-200">
                          {act.type}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{act.employeeName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">تاريخ الإجراء: {fmtDate(act.actionDate)}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm mt-2">{act.subject}</p>
                    {act.details && (
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{act.details}</p>
                    )}
                    {act.attachmentRef && (
                      <p className="text-[11px] text-slate-500 mt-1.5">📎 {act.attachmentRef}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">بواسطة: {act.createdBy || "—"} | {fmtDate(act.createdAt)}</span>
                      <button
                        onClick={() => deleteDisciplinaryAction(act.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg"
                      >
                        <Trash2 size={13} /> حذف
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
