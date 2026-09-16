import React from "react";
import {
  CheckCircle2,
  X,
  Users,
  Plus,
  User,
  Building2,
  Landmark,
  Globe,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
} from "lucide-react";
import { Field, Modal } from "./AuthScreens";
import { Client, RolePermissions } from "../domain/types";

const inputCls =
  "w-full rounded-[11px] border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-[#0D382B]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0D382B]/[0.06] transition-all";

export interface ClientsViewProps {
  clientToast: string | null;
  setClientToast: (v: string | null) => void;
  openModalWithCheck: (kind: string, permKey?: keyof RolePermissions) => void;
  clients: Client[];
  clientCategoryFilter: string;
  setClientCategoryFilter: (v: string) => void;
  clientSearch: string;
  setClientSearch: (v: string) => void;
  filteredClientsList: Client[];
  cases: { clientId: number }[];
  setEditingClient: (c: Client | null) => void;
  deleteClient: (clientId: number) => void;
  moveClientCategory: (clientId: number, newType: string) => void;
  setTab: (tab: string) => void;
  setQ: (q: string) => void;
  editingClient: Client | null;
  saveEditClient: () => void;
}

export default function ClientsView({
  clientToast,
  setClientToast,
  openModalWithCheck,
  clients,
  clientCategoryFilter,
  setClientCategoryFilter,
  clientSearch,
  setClientSearch,
  filteredClientsList,
  cases,
  setEditingClient,
  deleteClient,
  moveClientCategory,
  setTab,
  setQ,
  editingClient,
  saveEditClient,
}: ClientsViewProps) {
  return (
    <div className="space-y-6">
      {/* تنبيه الإشعارات (Toast) */}
      {clientToast && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm transition">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={18} className="text-emerald-600" /> {clientToast}
          </span>
          <button
            onClick={() => setClientToast(null)}
            className="text-emerald-700 hover:text-emerald-950"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* العنوان ورأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-amber-600" /> إدارة الموكلين
          </h2>
          <p className="text-xs text-slate-500">
            سجل الأفراد والشركات والجهات الحكومية المتعاملة مع المكتب وتصنيفها
          </p>
        </div>
        <button
          onClick={() => openModalWithCheck("client", "manageClients")}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition"
        >
          <Plus size={16} /> إضافة موكل / جهة اتصال جديدة
        </button>
      </div>

      {/* كروت الإحصائيات السريعة والتوزيع */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="app-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">إجمالي المسجلين</p>
            <p className="text-2xl font-black text-slate-900">{clients.length}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Users size={20} />
          </div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-800">أفراد / أشخاص</p>
            <p className="text-2xl font-black text-blue-900">
              {clients.filter((c) => c.type === "فرد").length}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <User size={20} />
          </div>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-800">شركات ومؤسسات</p>
            <p className="text-2xl font-black text-indigo-900">
              {clients.filter((c) => c.type === "شركة").length}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Building2 size={20} />
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800">جهات حكومية ورسمية</p>
            <p className="text-2xl font-black text-amber-950">
              {clients.filter((c) => c.type === "جهة حكومية").length}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Landmark size={20} />
          </div>
        </div>
      </div>

      {/* شريط الفرز والتصنيف + البحث السريع */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {[
            { id: "الكل", label: "الكل", count: clients.length, icon: Users },
            {
              id: "فرد",
              label: "أفراد / أشخاص",
              count: clients.filter((c) => c.type === "فرد").length,
              icon: User,
            },
            {
              id: "شركة",
              label: "شركات ومؤسسات",
              count: clients.filter((c) => c.type === "شركة").length,
              icon: Building2,
            },
            {
              id: "جهة حكومية",
              label: "جهات حكومية",
              count: clients.filter((c) => c.type === "جهة حكومية").length,
              icon: Landmark,
            },
            {
              id: "جهة أخرى",
              label: "جهات أخرى",
              count: clients.filter((c) => c.type === "جهة أخرى").length,
              icon: Globe,
            },
          ].map((cat) => {
            const IconComp = cat.icon;
            const isActive = clientCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setClientCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                  isActive
                    ? "bg-slate-900 text-amber-400 font-bold shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-[#0D382B]/[0.08] transition-colors hover:text-slate-900"
                }`}
              >
                <IconComp size={14} />
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? "bg-amber-400 text-slate-900 font-bold" : "bg-slate-200 text-slate-800"}`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="بحث بالاسم، الرخصة، الهاتف..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-8 py-1.5 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
          />
          {clientSearch && (
            <button
              onClick={() => setClientSearch("")}
              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* قائمة الكروت للمتعاملين */}
      {(() => {
        const filteredList = filteredClientsList;

        if (filteredList.length === 0) {
          return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 space-y-2">
              <Users size={40} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">
                لا توجد نتائج مطابقة لتصنيفك أو كلمات البحث
              </p>
              <p className="text-xs">جرب تغيير التصنيف أو مسح كلمة البحث للإظهار.</p>
            </div>
          );
        }

        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((c) => {
              const count = cases.filter((x) => x.clientId === c.id).length;
              const isGov = c.type === "جهة حكومية";
              const isCompany = c.type === "شركة";
              const isIndividual = c.type === "فرد";

              const badgeStyle = isGov
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : isCompany
                  ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                  : isIndividual
                    ? "bg-blue-100 text-blue-900 border-blue-300"
                    : "bg-slate-100 text-slate-800 border-slate-300";

              const IconComp = isGov
                ? Landmark
                : isCompany
                  ? Building2
                  : isIndividual
                    ? User
                    : Globe;

              return (
                <div
                  key={c.id}
                  className="app-card p-5 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    {/* شريط الكارت العلوي */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${badgeStyle}`}
                        >
                          <IconComp size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900 text-sm" title={c.name}>
                            {c.name}
                          </h3>
                          <span
                            className={`inline-block mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeStyle}`}
                          >
                            {c.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingClient(c)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="تعديل البيانات"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteClient(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* التفاصيل المعروضة */}
                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      {c.idNo && (
                        <p className="font-mono text-[11px] text-slate-500">
                          رقم الهوية / الرخصة: <b className="text-slate-800">{c.idNo}</b>
                        </p>
                      )}
                      {c.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400" /> {c.phone}
                        </p>
                      )}
                      {c.email && (
                        <p className="flex items-center gap-2">
                          <Mail size={13} className="text-slate-400" /> {c.email}
                        </p>
                      )}
                      {!c.phone && !c.email && (
                        <p className="text-[11px] text-slate-400 italic">
                          لا توجد بيانات تواصل مسجلة
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <MapPin size={13} className="text-slate-400" /> {c.emirate}{" "}
                        {c.address ? `— ${c.address}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* أسفل الكارت: التحكم بالنقل اليدوي ورابط القضايا */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    {/* ميزة النقل اليدوي السريع بين التصنيفات */}
                    <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                        نقل التصنيف:
                      </span>
                      <select
                        value={c.type}
                        onChange={(e) => moveClientCategory(c.id, e.target.value)}
                        className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                        title="نقل الشخص أو الجهة يدويًا إلى تصنيف مختلف"
                      >
                        <option value="فرد">فرد (شخص)</option>
                        <option value="شركة">شركة / مؤسسة</option>
                        <option value="جهة حكومية">جهة حكومية</option>
                        <option value="جهة أخرى">جهة أخرى</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">
                        القضايا المسجلة: <b className="text-slate-900 font-bold">{count}</b>
                      </span>
                      {count > 0 ? (
                        <button
                          onClick={() => {
                            setTab("cases");
                            setQ(c.name);
                          }}
                          className="font-semibold text-amber-600 hover:underline"
                        >
                          عرض القضايا ({count})
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">لا توجد قضايا</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* مودال تعديل بيانات الموكل / جهة الاتصال */}
      {editingClient && (
        <Modal title="تعديل بيانات الموكل / جهة الاتصال" onClose={() => setEditingClient(null)}>
          <div className="space-y-4 text-sm">
            <Field label="الاسم الكامل / اسم الشركة / الجهة">
              <input
                value={editingClient.name}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                placeholder="الاسم"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="الصفة / التصنيف">
                <select
                  value={editingClient.type}
                  onChange={(e) => setEditingClient({ ...editingClient, type: e.target.value })}
                  className={inputCls}
                >
                  <option value="فرد">فرد (شخص)</option>
                  <option value="شركة">شركة / مؤسسة</option>
                  <option value="جهة حكومية">جهة حكومية / رسمية</option>
                  <option value="جهة أخرى">جهة أخرى</option>
                </select>
              </Field>
              <Field label="الهوية / الرخصة / الرقم الضريبي">
                <input
                  value={editingClient.idNo || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, idNo: e.target.value })}
                  placeholder="رقم الهوية أو الرخصة"
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="رقم الهاتف">
                <input
                  value={editingClient.phone || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  placeholder="050-XXXXXXX"
                  className={inputCls}
                />
              </Field>
              <Field label="الإمارة / الموقع">
                <select
                  value={editingClient.emirate || "دبي"}
                  onChange={(e) => setEditingClient({ ...editingClient, emirate: e.target.value })}
                  className={inputCls}
                >
                  <option>دبي</option>
                  <option>أبوظبي</option>
                  <option>الشارقة</option>
                  <option>رأس الخيمة</option>
                  <option>عجمان</option>
                  <option>أم القيوين</option>
                  <option>الفجيرة</option>
                  <option>خارج الدولة</option>
                </select>
              </Field>
            </div>
            <Field label="البريد الإلكتروني">
              <input
                value={editingClient.email || ""}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                placeholder="example@domain.ae"
                className={inputCls}
              />
            </Field>
            <Field label="العنوان / تفاصيل إضافية">
              <input
                value={editingClient.address || ""}
                onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                placeholder="العنوان التفصيلي"
                className={inputCls}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={saveEditClient}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                حفظ التعديلات
              </button>
              <button
                onClick={() => deleteClient(editingClient.id)}
                className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                title="حذف هذا الموكل يدويًا من سجلات المكتب"
              >
                <Trash2 size={15} />
                <span>حذف الموكل</span>
              </button>
              <button
                onClick={() => setEditingClient(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-[#0D382B]/[0.06] transition-colors transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
