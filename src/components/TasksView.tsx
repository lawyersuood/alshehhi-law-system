import React from "react";
import { ListChecks, Plus, CheckCircle2, Trash2 } from "lucide-react";
import { Badge } from "./AuthScreens";
import { TaskItem, RolePermissions } from "../domain/types";
import { TASK_PRIORITY } from "../domain/constants";
import { fmtDate } from "../domain/utils";

export interface TasksViewProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  checkPerm: (
    permKey: keyof RolePermissions,
    actionName: string,
    context?: {
      section?: string;
      title?: string;
      details?: string;
      targetId?: string | number;
      isDelete?: boolean;
    },
  ) => boolean;
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  requestDelete: (opts: {
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  }) => void;
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
    targetId?: string | number,
    statusOverride?: "مؤكد" | "محاولة غير مصرح بها - مرفوض" | "مكتمل" | "فشل",
    userOverride?: {
      id?: string | number;
      name?: string;
      email?: string;
      roleTitle?: string;
      jobTitle?: string;
    },
  ) => void;
  setPermissionNotice: (msg: string | null) => void;
  saveStorage: <T>(key: string, value: T) => void;
}

export default function TasksView({
  tasks,
  setTasks,
  checkPerm,
  openModalWithCheck,
  requestDelete,
  logAuditAction,
  setPermissionNotice,
  saveStorage,
}: TasksViewProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المهام وتوزيع العمل</h2>
          <p className="text-xs text-slate-500">تتبع المهام اليومية لفريق العمل في المكتب</p>
        </div>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <button
              onClick={() => {
                requestDelete({
                  section: "إدارة المهام والتكليفات",
                  title: `تفريغ كافة المهام المسجلة (${tasks.length} مهمة)`,
                  details:
                    "سيتم حذف ومسح جميع التكليفات والمهام الموزعة على أعضاء الفريق بشكل نهائي.",
                  permKey: "deleteTasks",
                  actionName: "تفريغ كافة المهام",
                  onConfirm: () => {
                    logAuditAction(
                      "DELETE",
                      "المهام والتكليفات",
                      "تفريغ كافة المهام",
                      `تم تفريغ وحذف جميع التكليفات والمهام (${tasks.length} مهمة) بشكل نهائي.`,
                      undefined,
                      "مؤكد",
                    );
                    setTasks([]);
                    saveStorage("firm_tasks", []);
                    setPermissionNotice("تم تفريغ كافة المهام والتكليفات بنجاح.");
                  },
                });
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-3.5 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Trash2 size={15} /> تفريغ كافة المهام
            </button>
          )}
          <button
            onClick={() => openModalWithCheck("task", "manageTasks")}
            className="flex items-center gap-2 rounded-xl bg-[#0D382B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124d40] transition-colors shadow-[0_8px_20px_-8px_rgb(13,56,43,0.5)]"
          >
            <Plus size={16} /> إضافة مهمة
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ListChecks size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">لا توجد مهام أو تكليفات مسجلة حالياً</p>
            <p className="text-xs text-slate-500 max-w-sm">
              تم إفراغ المهام التجريبية. يمكنك إضافة مهمة جديدة وتكليف أحد المحامين أو الإداريين
              بالمكتب وربطها بالقضايا والمواعيد.
            </p>
            <button
              onClick={() => openModalWithCheck("task", "manageTasks")}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <Plus size={15} /> إضافة مهمة جديدة
            </button>
          </div>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between app-card p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!checkPerm("manageTasks", "تحديث المهمة")) return;
                    setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
                  }}
                  className={`p-1 rounded-full ${t.done ? "text-emerald-600" : "text-slate-300 hover:text-slate-500"}`}
                >
                  <CheckCircle2 size={22} />
                </button>
                <div>
                  <p
                    className={`font-semibold text-sm ${t.done ? "line-through text-slate-400" : "text-slate-900"}`}
                  >
                    {t.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    المكلف: <b>{t.assignee}</b> | تاريخ الاستحقاق: {fmtDate(t.due)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={TASK_PRIORITY[t.priority]}>{t.priority}</Badge>
                <button
                  onClick={() => {
                    requestDelete({
                      section: "إدارة المهام والتكليفات",
                      title: `المهمة: ${t.title}`,
                      details: `المكلف بها: ${t.assignee} | تاريخ الاستحقاق: ${fmtDate(t.due)} | الأولوية: ${t.priority}`,
                      permKey: "deleteTasks",
                      actionName: "حذف المهمة",
                      onConfirm: () => {
                        logAuditAction(
                          "DELETE",
                          "المهام",
                          `مهمة: ${t.title}`,
                          `حذف المهمة "${t.title}" المكلف بها ${t.assignee}`,
                          t.id,
                        );
                        setTasks((prev) => prev.filter((x) => x.id !== t.id));
                      },
                    });
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="حذف المهمة"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
