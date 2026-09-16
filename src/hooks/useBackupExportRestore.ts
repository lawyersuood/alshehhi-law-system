// النسخ الاحتياطي الكامل للنظام (تصدير/استعادة) — handleExportBackup/handleFileChangeForRestore/
// executeRestore، مستخرجة من App.tsx حرفياً بدون أي تغيير بالمنطق.
//
// هذه من أكثر دوال النظام تشابكاً: تقرأ تقريباً كل حالة بيانات موجودة (23 مصفوفة/كائن) عند التصدير،
// وتكتب لكل واحدة منها عند الاستعادة. بدل إبقائها داخل App.tsx (وهذا كان السبب الرئيسي لتعذر أي
// تقسيم إضافي للنواة المشتركة سابقاً — كل هذه الحالات كانت "متشابكة" فقط بسبب هذه الدالة)، نقلناها هنا
// بحيث تستقبل كل ما تحتاجه كمعاملات صريحة (بدل الاعتماد على متغيرات App() المغلقة عليها ضمنياً) — هذا
// يجعل الاعتمادية الحقيقية واضحة ومرئية بدل مخفية، وهو ما يفتح المجال مستقبلاً لتقسيم بقية النواة بأمان.
import type {
  Client,
  CaseItem,
  Hearing,
  TaskItem,
  Invoice,
  DocItem,
  PoaItem,
  KycItem,
  CourtContact,
  OfficeAgreement,
  Employee,
  LeaveRequest,
  EmployeeExpense,
  EmployeeDisciplinaryAction,
  AuditLogEntry,
  LegalPrecedent,
  InternalPolicy,
  UserItem,
  FeeAgreement,
  PaymentReceipt,
} from "../domain/types";
import type { BookingRecord, ConsultationSettings } from "../components/PublicConsultationPage";
import type { WaChat } from "./useWhatsAppModule";
import type { ChangeEvent } from "react";
import { saveStorage, fetchSupabaseTable } from "../domain/storageAndMessaging";

export interface BackupExportRestoreDeps {
  currentUser: UserItem;
  clients: Client[];
  setClients: (v: Client[]) => void;
  cases: CaseItem[];
  setCases: (v: CaseItem[]) => void;
  hearings: Hearing[];
  setHearings: (v: Hearing[]) => void;
  tasks: TaskItem[];
  setTasks: (v: TaskItem[]) => void;
  invoices: Invoice[];
  setInvoices: (v: Invoice[]) => void;
  docs: DocItem[];
  setDocs: (v: DocItem[]) => void;
  poas: PoaItem[];
  setPoas: (v: PoaItem[]) => void;
  kyc: KycItem[];
  setKyc: (v: KycItem[]) => void;
  courtContacts: CourtContact[];
  setCourtContacts: (v: CourtContact[]) => void;
  officeAgreements: OfficeAgreement[];
  setOfficeAgreements: (v: OfficeAgreement[]) => void;
  employees: Employee[];
  setEmployees: (v: Employee[]) => void;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: (v: LeaveRequest[]) => void;
  employeeExpenses: EmployeeExpense[];
  setEmployeeExpenses: (v: EmployeeExpense[]) => void;
  disciplinaryActions: EmployeeDisciplinaryAction[];
  setDisciplinaryActions: (v: EmployeeDisciplinaryAction[]) => void;
  auditLogs: AuditLogEntry[];
  setAuditLogs: (v: AuditLogEntry[]) => void;
  precedents: LegalPrecedent[];
  setPrecedents: (v: LegalPrecedent[]) => void;
  policies: InternalPolicy[];
  setPolicies: (v: InternalPolicy[]) => void;
  users: UserItem[];
  setUsers: (v: UserItem[]) => void;
  feeAgreements: FeeAgreement[];
  setFeeAgreements: (v: FeeAgreement[]) => void;
  payments: PaymentReceipt[];
  setPayments: (v: PaymentReceipt[]) => void;
  consultationBookings: BookingRecord[];
  setConsultationBookings: (v: BookingRecord[]) => void;
  consultationSettings: ConsultationSettings;
  setConsultationSettings: (v: ConsultationSettings) => void;
  waChats: WaChat[];
  setWaChats: (v: WaChat[]) => void;
  restorePreview: any | null;
  setRestorePreview: (v: any | null) => void;
  setRestoreError: (v: string | null) => void;
  setRestoreSuccessMsg: (v: string | null) => void;
  logAuditAction: (
    actionType:
      | "DELETE"
      | "UPDATE"
      | "CREATE"
      | "STATUS_CHANGE"
      | "PERMISSION_CHANGE"
      | "UNAUTHORIZED_DELETE"
      | "UNAUTHORIZED_ACCESS",
    targetModule: string,
    targetTitle: string,
    details: string,
  ) => void;
}

export function useBackupExportRestore(deps: BackupExportRestoreDeps) {
  const handleExportBackup = async () => {
    const {
      currentUser,
      clients,
      cases,
      hearings,
      tasks,
      invoices,
      docs,
      poas,
      kyc,
      courtContacts,
      officeAgreements,
      employees,
      leaveRequests,
      employeeExpenses,
      disciplinaryActions,
      auditLogs,
      precedents,
      policies,
      users,
      feeAgreements,
      payments,
      consultationBookings,
      consultationSettings,
      waChats,
      logAuditAction,
    } = deps;

    const exportDate = new Date();
    const dateStr = exportDate.toISOString().split("T")[0];
    const timeStr = exportDate.toTimeString().split(" ")[0].replace(/:/g, "-");

    // نسحب أحدث نسخة من البيانات "الحساسة" مباشرة من قاعدة بيانات Supabase المركزية وقت التصدير
    // (بدل الاعتماد على النسخة المحلية بالمتصفح فقط) لضمان أن النسخة الاحتياطية تعكس آخر تحديث
    // حتى لو تم من جهاز آخر. لو تعذر الاتصال، نستخدم النسخة المحلية كخطة بديلة بدل إيقاف التصدير.
    const [freshClients, freshCases, freshFeeAgreements, freshPayments, freshInvoices] =
      await Promise.all([
        fetchSupabaseTable<Client>("clients"),
        fetchSupabaseTable<CaseItem>("cases"),
        fetchSupabaseTable<FeeAgreement>("fee_agreements"),
        fetchSupabaseTable<PaymentReceipt>("payments"),
        fetchSupabaseTable<Invoice>("invoices"),
      ]);
    const exportClients = freshClients && freshClients.length > 0 ? freshClients : clients;
    const exportCases = freshCases && freshCases.length > 0 ? freshCases : cases;
    const exportFeeAgreements =
      freshFeeAgreements && freshFeeAgreements.length > 0 ? freshFeeAgreements : feeAgreements;
    const exportPayments = freshPayments && freshPayments.length > 0 ? freshPayments : payments;
    const exportInvoices = freshInvoices && freshInvoices.length > 0 ? freshInvoices : invoices;

    const backupData = {
      appVersion: "1.0.0",
      system: "مكتب المحامي سعود أحمد الشحي للمحاماة والاستشارات القانونية",
      exportTimestamp: exportDate.toISOString(),
      exportDateFormatted: exportDate.toLocaleString("ar-AE"),
      exportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        roleTitle: currentUser.roleTitle,
      },
      counts: {
        clients: exportClients.length,
        cases: exportCases.length,
        hearings: hearings.length,
        tasks: tasks.length,
        invoices: exportInvoices.length,
        docs: docs.length,
        poas: poas.length,
        kyc: kyc.length,
        courtContacts: courtContacts.length,
        officeAgreements: officeAgreements.length,
        employees: employees.length,
        leaveRequests: leaveRequests.length,
        employeeExpenses: employeeExpenses.length,
        disciplinaryActions: disciplinaryActions.length,
        auditLogs: auditLogs.length,
        precedents: precedents.length,
        policies: policies.length,
        users: users.length,
        feeAgreements: exportFeeAgreements.length,
        payments: exportPayments.length,
        consultationBookings: consultationBookings.length,
      },
      database: {
        clients: exportClients,
        cases: exportCases,
        hearings,
        tasks,
        invoices: exportInvoices,
        docs,
        poas,
        kyc,
        courtContacts,
        officeAgreements,
        employees,
        leaveRequests,
        employeeExpenses,
        disciplinaryActions,
        auditLogs,
        precedents,
        policies,
        users,
        feeAgreements: exportFeeAgreements,
        payments: exportPayments,
        consultationBookings,
        consultationSettings,
        waChats,
      },
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2),
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `suood_law_backup_${dateStr}_${timeStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAuditAction(
      "CREATE",
      "النسخ الاحتياطي",
      "تصدير قاعدة البيانات",
      `تم تصدير نسخة احتياطية كاملة من بيانات النظام بصيغة JSON تحتوي على ${exportCases.length} قضية و ${exportClients.length} موكل (مسحوبة مباشرة من قاعدة البيانات المركزية).`,
    );
  };

  const handleFileChangeForRestore = (e: ChangeEvent<HTMLInputElement>) => {
    const { setRestoreError, setRestoreSuccessMsg, setRestorePreview } = deps;
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    setRestoreSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || (!parsed.database && !parsed.data)) {
          setRestoreError("الملف المحدد لا يحتوي على بنية بيانات صحيحة الخاصة بنظام المكتب.");
          setRestorePreview(null);
          return;
        }

        const db = parsed.database || parsed.data || {};
        setRestorePreview({
          raw: parsed,
          db,
          exportDateFormatted: parsed.exportDateFormatted || parsed.exportTimestamp || "غير محدد",
          exportedBy: parsed.exportedBy?.name || "غير محدد",
          counts: {
            clients: Array.isArray(db.clients) ? db.clients.length : 0,
            cases: Array.isArray(db.cases) ? db.cases.length : 0,
            hearings: Array.isArray(db.hearings) ? db.hearings.length : 0,
            tasks: Array.isArray(db.tasks) ? db.tasks.length : 0,
            invoices: Array.isArray(db.invoices) ? db.invoices.length : 0,
            docs: Array.isArray(db.docs) ? db.docs.length : 0,
            poas: Array.isArray(db.poas) ? db.poas.length : 0,
            kyc: Array.isArray(db.kyc) ? db.kyc.length : 0,
            employees: Array.isArray(db.employees) ? db.employees.length : 0,
            users: Array.isArray(db.users) ? db.users.length : 0,
          },
        });
      } catch (err: any) {
        setRestoreError("تعذر قراءة ملف JSON. يرجى التأكد من اختيار ملف بصيغة سليمة.");
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const executeRestore = () => {
    const {
      restorePreview,
      setClients,
      setCases,
      setHearings,
      setTasks,
      setInvoices,
      setDocs,
      setPoas,
      setKyc,
      setCourtContacts,
      setOfficeAgreements,
      setEmployees,
      setLeaveRequests,
      setEmployeeExpenses,
      setDisciplinaryActions,
      setAuditLogs,
      setPrecedents,
      setPolicies,
      setUsers,
      setFeeAgreements,
      setPayments,
      setConsultationBookings,
      setConsultationSettings,
      setWaChats,
      logAuditAction,
      setRestoreSuccessMsg,
      setRestorePreview,
      setRestoreError,
    } = deps;
    if (!restorePreview || !restorePreview.db) return;
    const db = restorePreview.db;

    try {
      if (Array.isArray(db.clients)) {
        setClients(db.clients);
        saveStorage("firm_clients", db.clients);
      }
      if (Array.isArray(db.cases)) {
        setCases(db.cases);
        saveStorage("firm_cases", db.cases);
      }
      if (Array.isArray(db.hearings)) {
        setHearings(db.hearings);
        saveStorage("firm_hearings", db.hearings);
      }
      if (Array.isArray(db.tasks)) {
        setTasks(db.tasks);
        saveStorage("firm_tasks", db.tasks);
      }
      if (Array.isArray(db.invoices)) {
        setInvoices(db.invoices);
        saveStorage("firm_invoices", db.invoices);
      }
      if (Array.isArray(db.docs)) {
        setDocs(db.docs);
        saveStorage("firm_docs", db.docs);
      }
      if (Array.isArray(db.poas)) {
        setPoas(db.poas);
        saveStorage("firm_poas", db.poas);
      }
      if (Array.isArray(db.kyc)) {
        setKyc(db.kyc);
        saveStorage("firm_kyc", db.kyc);
      }
      if (Array.isArray(db.courtContacts)) {
        setCourtContacts(db.courtContacts);
        saveStorage("firm_court_contacts", db.courtContacts);
      }
      if (Array.isArray(db.officeAgreements)) {
        setOfficeAgreements(db.officeAgreements);
        saveStorage("firm_office_agreements", db.officeAgreements);
      }
      if (Array.isArray(db.employees)) {
        setEmployees(db.employees);
        saveStorage("firm_employees", db.employees);
      }
      if (Array.isArray(db.leaveRequests)) {
        setLeaveRequests(db.leaveRequests);
        saveStorage("firm_leave_requests", db.leaveRequests);
      }
      if (Array.isArray(db.employeeExpenses)) {
        setEmployeeExpenses(db.employeeExpenses);
        saveStorage("firm_employee_expenses", db.employeeExpenses);
      }
      if (Array.isArray(db.disciplinaryActions)) {
        setDisciplinaryActions(db.disciplinaryActions);
        saveStorage("firm_employee_disciplinary_actions", db.disciplinaryActions);
      }
      if (Array.isArray(db.auditLogs)) {
        setAuditLogs(db.auditLogs);
        saveStorage("firm_audit_logs", db.auditLogs);
      }
      if (Array.isArray(db.precedents)) {
        setPrecedents(db.precedents);
        saveStorage("firm_legal_precedents", db.precedents);
      }
      if (Array.isArray(db.policies)) {
        setPolicies(db.policies);
        saveStorage("firm_internal_policies", db.policies);
      }
      if (Array.isArray(db.users)) {
        setUsers(db.users);
        saveStorage("firm_users", db.users);
      }
      if (Array.isArray(db.feeAgreements)) {
        setFeeAgreements(db.feeAgreements);
        saveStorage("firm_fee_agreements", db.feeAgreements);
      }
      if (Array.isArray(db.payments)) {
        setPayments(db.payments);
        saveStorage("firm_payments", db.payments);
      }
      if (Array.isArray(db.consultationBookings)) {
        setConsultationBookings(db.consultationBookings);
        saveStorage("firm_consultation_bookings", db.consultationBookings);
      }
      if (db.consultationSettings) {
        setConsultationSettings(db.consultationSettings);
        saveStorage("firm_consultation_settings", db.consultationSettings);
      }
      if (Array.isArray(db.waChats)) {
        setWaChats(db.waChats);
        saveStorage("firm_wa_chats", db.waChats);
      }

      logAuditAction(
        "UPDATE",
        "النسخ الاحتياطي",
        "استعادة قاعدة البيانات",
        `تمت استعادة نسخة احتياطية من الملف بنجاح وتحديث بيانات النظام (${restorePreview.counts.cases} قضية، ${restorePreview.counts.clients} موكل).`,
      );

      setRestoreSuccessMsg(
        "تمت استعادة كافة بيانات النظام والنسخة الاحتياطية بنجاح! تم تحديث السجلات المخزنة.",
      );
      setRestorePreview(null);
    } catch (err: any) {
      setRestoreError("حدث خطأ أثناء تطبيق استعادة البيانات: " + err.message);
    }
  };

  return { handleExportBackup, handleFileChangeForRestore, executeRestore };
}
