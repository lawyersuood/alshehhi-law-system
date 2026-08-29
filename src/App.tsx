import html2pdf from "html2pdf.js";
import OfficialLetterComposer from "./OfficialLetterComposer";
import React, { useState, useMemo, useEffect } from "react";
import Logo from "./components/Logo";
import BookingConsultationView from "./components/BookingConsultationView";
import PublicConsultationPage, { BookingRecord, ConsultationSettings } from "./components/PublicConsultationPage";
import AdminConsultationsView from "./components/AdminConsultationsView";
import GoogleCalendarSyncModal from "./components/GoogleCalendarSyncModal";
import { initAuth, createGoogleCalendarEvent, formatCalendarDateTime } from "./googleCalendar";
import { User as FirebaseUser } from "firebase/auth";
import { supabase, sendWhatsAppViaEdgeFunction } from "./supabaseClient";
import {
  Scale, LayoutDashboard, Briefcase, BriefcaseBusiness, FileBadge,  Users, CalendarDays, ListChecks,
  Receipt, FolderOpen, FileSignature, Plus, Search, X, Bell, BellRing, Building2,
  Gavel, Clock, AlertTriangle, CheckCircle2, ChevronLeft, Trash2, Printer,
  Phone, Mail, MapPin, TrendingUp, ShieldCheck, Shield, Lock, UserCheck, Key, Stamp,
  Check, Minus, Info, UserPlus, ShieldAlert, Edit2, Edit3, User, RefreshCw, Smartphone,
  Send, MessageSquare, Share2, ExternalLink, FileText, CheckCheck, SendHorizontal, Filter,
  Calculator, Globe, Landmark, DollarSign, FileCheck, AlertCircle, FileSpreadsheet, Hourglass, Copy, PhoneCall, CreditCard, Download, Database, Code, LogOut,
  Inbox, Paperclip, RotateCw, QrCode, Settings, History, BookOpen, UploadCloud, Video,
  Sparkles, Bot, Zap, PlusCircle, Layers, BarChart3, PieChart as LucidePieChart, Activity, CheckSquare, Target, Percent, Menu,
  SlidersHorizontal, Eye, EyeOff, Hash, ArrowUpDown, RotateCcw, ChevronDown, ChevronUp, Pen
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, AreaChart, Area
} from "recharts";
import * as XLSX from "xlsx";
import { encryptFile, decryptFile } from "./cryptoUtils";
import { uaeTerroristList } from "./data/uaeTerroristListData";
import { seedCourtContacts } from "./courtContactsData";

/* ============================================================
   Ù†Ø¸Ø§Ù… Ø¥Ø¯Ø§Ø±Ø© Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©
   Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ù…ØªØ­Ø¯Ø© â€” Ø´Ø§Ù…Ù„ Ù…Ø¹ Ù†Ø¸Ø§Ù… Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª
   ============================================================ */

// ---------- Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø±Ø¬Ø¹ÙŠØ© Ø¥Ù…Ø§Ø±Ø§ØªÙŠØ© ----------
const COURTS = [
  "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ", "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù‚Ø¶Ø§Ø¡ - Ø£Ø¨ÙˆØ¸Ø¨ÙŠ", "Ù…Ø­Ø§ÙƒÙ… Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©",
  "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø© Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ©", "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ©",
  "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¹Ù„ÙŠØ§", "Ù…Ø­Ø§ÙƒÙ… Ù…Ø±ÙƒØ² Ø¯Ø¨ÙŠ Ø§Ù„Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ DIFC",
  "Ù…Ø±ÙƒØ² ÙØ¶ Ø§Ù„Ù…Ù†Ø§Ø²Ø¹Ø§Øª Ø§Ù„Ø¥ÙŠØ¬Ø§Ø±ÙŠØ© - Ø¯Ø¨ÙŠ"
];
const CASE_TYPES = ["ØªØ¬Ø§Ø±ÙŠ", "Ù…Ø¯Ù†ÙŠ", "Ø¹Ù…Ø§Ù„ÙŠ", "Ø¬Ø²Ø§Ø¦ÙŠ", "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©", "Ø¥ÙŠØ¬Ø§Ø±ÙŠ", "Ø¹Ù‚Ø§Ø±ÙŠ", "Ø¥Ø¯Ø§Ø±ÙŠ", "ØªÙ†ÙÙŠØ°"];
const CASE_STAGES = ["Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©", "Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù", "Ø§Ù„ØªÙ…ÙŠÙŠØ² / Ø§Ù„Ù†Ù‚Ø¶", "Ø§Ù„ØªÙ†ÙÙŠØ°", "Ù„Ø¬Ø§Ù† ÙØ¶ Ø§Ù„Ù…Ù†Ø§Ø²Ø¹Ø§Øª"];
const CASE_STATUS = ["Ù…ØªØ¯Ø§ÙˆÙ„Ø©", "Ù…Ù†ØªÙ‡ÙŠØ©", "Ù…Ø­ÙƒÙˆÙ…Ø©", "Ù‚ÙŠØ¯ Ø§Ù„Ù†Ø¸Ø±", "Ù…Ø­Ø¬ÙˆØ²Ø© Ù„Ù„Ø­ÙƒÙ…", "Ù…Ø´Ø·ÙˆØ¨Ø©", "Ù…Ø¹Ù„Ù‚Ø©"];
const HEARING_TYPES = ["Ø¬Ù„Ø³Ø© Ù…Ø±Ø§ÙØ¹Ø©", "Ø¬Ù„Ø³Ø© Ø¥Ø¯Ø§Ø±Ø© Ø¯Ø¹ÙˆÙ‰", "Ø¬Ù„Ø³Ø© Ø®Ø¨Ø±Ø©", "Ø¬Ù„Ø³Ø© Ù†Ø·Ù‚ Ø¨Ø§Ù„Ø­ÙƒÙ…", "Ø¬Ù„Ø³Ø© ØªÙ†ÙÙŠØ°", "Ø¬Ù„Ø³Ø© ØµØµÙ„Ø­"];
const TASK_PRIORITY: Record<string, string> = { "Ø¹Ø§Ù„ÙŠØ©": "bg-red-100 text-red-700", "Ù…ØªÙˆØ³Ø·Ø©": "bg-amber-100 text-amber-700", "Ù…Ù†Ø®ÙØ¶Ø©": "bg-emerald-100 text-emerald-700" };
const DOC_TYPES = ["ØµØ­ÙŠÙØ© Ø¯Ø¹ÙˆÙ‰", "Ù…Ø°ÙƒØ±Ø© Ø¬ÙˆØ§Ø¨ÙŠØ©", "Ù…Ø°ÙƒØ±Ø© Ø¯ÙØ§Ø¹", "Ø­ÙƒÙ…", "Ø¹Ù‚Ø¯", "ÙˆÙƒØ§Ù„Ø©", "ØªÙ‚Ø±ÙŠØ± Ø®Ø¨Ø±Ø©", "Ø¥Ù†Ø°Ø§Ø± Ø¹Ø¯Ù„ÙŠ", "Ù„Ø§Ø¦Ø­Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù", "Ù…Ø³ØªÙ†Ø¯ Ø¥Ø«Ø¨Ø§Øª"];
const VAT_RATE = 0.05; // Ø¶Ø±ÙŠØ¨Ø© Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ø¶Ø§ÙØ© ÙÙŠ Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª 5%

// ---------- Ø¯ÙˆØ§Ù„ Ù…Ø¹Ø§Ù„Ø¬Ø© ÙˆØªØ·Ø¨ÙŠØ¹ Ø§Ù„Ù†ØµÙˆØµ Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© ÙˆØ§Ù„Ø£Ø±Ù‚Ø§Ù… Ù„Ù„Ø¨Ø­Ø« Ø§Ù„Ø°ÙƒÙŠ ----------
export const normalizeArabicSearch = (text: string = ""): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[Ø£Ø¥Ø¢Ù±]/g, "Ø§")
    .replace(/Ø©/g, "Ù‡")
    .replace(/Ù‰/g, "ÙŠ")
    .replace(/[\u064B-\u065F\u0670]/g, "") // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØªØ´ÙƒÙŠÙ„
    .replace(/\u0640/g, "") // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØªØ·ÙˆÙŠÙ„
    .replace(/[Ù -Ù©]/g, (d) => "Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©".indexOf(d).toString()) // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ù…Ø´Ø±Ù‚ÙŠØ©
    .replace(/[\s\-_/\\,ØŒ.:()]+/g, " ");
};

export const normalizePhoneDigits = (phone: string = ""): string => {
  if (!phone) return "";
  return phone
    .replace(/[Ù -Ù©]/g, (d) => "Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©".indexOf(d).toString())
    .replace(/[^0-9]/g, "");
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const addDaysFrom = (baseDate: string, d: number) => { const t = new Date(baseDate); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };

const TASK_TEMPLATES = [
  {
    id: "template_first_instance",
    name: "Ø¯Ø¹ÙˆÙ‰ Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© (Ù‚ÙŠØ§Ø³ÙŠØ©)",
    tasks: [
      { title: "Ù‚ÙŠØ¯ Ø§Ù„Ø¯Ø¹ÙˆÙ‰ ÙˆØ¯ÙØ¹ Ø§Ù„Ø±Ø³ÙˆÙ…", daysOffset: 0, priority: "Ø¹Ø§Ù„ÙŠØ©" as const },
      { title: "Ø¥Ø¹Ù„Ø§Ù† Ø§Ù„Ø®ØµÙˆÙ… Ø¨ØµØ­ÙŠÙØ© Ø§Ù„Ø¯Ø¹ÙˆÙ‰", daysOffset: 3, priority: "Ø¹Ø§Ù„ÙŠØ©" as const },
      { title: "Ø­Ø¶ÙˆØ± Ø§Ù„Ø¬Ù„Ø³Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ (Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¯Ø¹ÙˆÙ‰)", daysOffset: 14, priority: "Ù…ØªÙˆØ³Ø·Ø©" as const },
      { title: "Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù…Ø°ÙƒØ±Ø© Ø§Ù„Ø¬ÙˆØ§Ø¨ÙŠØ© Ø§Ù„Ø£ÙˆÙ„Ù‰", daysOffset: 20, priority: "Ø¹Ø§Ù„ÙŠØ©" as const }
    ]
  },
  {
    id: "template_labor",
    name: "Ø¯Ø¹ÙˆÙ‰ Ø¹Ù…Ø§Ù„ÙŠØ©",
    tasks: [
      { title: "Ù‚ÙŠØ¯ Ø§Ù„Ø´ÙƒÙˆÙ‰ Ø§Ù„Ø¹Ù…Ø§Ù„ÙŠØ©", daysOffset: 0, priority: "Ø¹Ø§Ù„ÙŠØ©" as const },
      { title: "Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„ØªØ³ÙˆÙŠØ© Ø§Ù„ÙˆØ¯ÙŠØ©", daysOffset: 7, priority: "Ù…ØªÙˆØ³Ø·Ø©" as const },
      { title: "Ø¥Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø²Ø§Ø¹ Ù„Ù„Ù…Ø­ÙƒÙ…Ø© (Ø¹Ù†Ø¯ Ø§Ù„ØªØ¹Ø°Ø±)", daysOffset: 14, priority: "Ø¹Ø§Ù„ÙŠØ©" as const }
    ]
  },
  {
    id: "template_appeal",
    name: "Ù„Ø§Ø¦Ø­Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù",
    tasks: [
      { title: "ØµÙŠØ§ØºØ© Ù„Ø§Ø¦Ø­Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù", daysOffset: 2, priority: "Ø¹Ø§Ù„ÙŠØ©" as const },
      { title: "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù ÙˆØ³Ø¯Ø§Ø¯ Ø§Ù„Ø±Ø³ÙˆÙ…", daysOffset: 5, priority: "Ø¹Ø§Ù„ÙŠØ©" as const },
      { title: "Ø¥Ø¹Ù„Ø§Ù† Ø§Ù„Ù…Ø³ØªØ£Ù†Ù Ø¶Ø¯Ù‡", daysOffset: 10, priority: "Ù…ØªÙˆØ³Ø·Ø©" as const }
    ]
  }
];

// Ø¯Ø§Ù„Ø© ØªØµØ¯ÙŠØ± Ù…Ù„ÙØ§Øª PDF Ù…Ø¨Ø§Ø´Ø±Ø© Ø¥Ù„Ù‰ Ø¬Ù‡Ø§Ø² Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
const handleDownloadPDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }
  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename || 'document.pdf',
    image: { type: 'png' as const },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  } as any;
  
  html2pdf().set(opt).from(element).save().catch((err: any) => {
    console.error("PDF generation failed, falling back to window.print()", err);
    window.print();
  });
};

// ---------- Ø§Ù„Ø£Ù†ÙˆØ§Ø¹ ÙˆØ§Ù„ÙˆØ§Ø¬Ù‡Ø§Øª ÙˆÙ…ØµÙÙˆÙØ© Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ù…ÙˆØ³Ø¹Ø© ----------
export interface RolePermissions {
  // 1. ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø£Ù‚Ø³Ø§Ù… ÙˆØ§Ù„ØªØ¨ÙˆÙŠØ¨Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ø§Ù„Ù€ 18 (Module Access)
  dashboard: boolean;
  specialPortfolio?: boolean;            // 1. Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡
  cases: boolean;                // 2. Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§
  calendar: boolean;             // 3. Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„
  clients: boolean;              // 4. Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡
  bookingConsultation?: boolean; // 5. Ø­Ø¬Ø² Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø±Ø¦ÙŠØ©
  tasks: boolean;                // 6. Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„ØªÙƒÙ„ÙŠÙØ§Øª
  whatsapp: boolean;             // 7. ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø¯Ù…Ø¬
  email: boolean;                // 8. Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ù…Ø¯Ù…Ø¬
  directory: boolean;            // 9. Ø¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆØ§Ù„Ø¬Ù‡Ø§Øª
  docs?: boolean;                // 10. Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø£Ø±Ø´ÙŠÙ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ
  poa?: boolean;                 // 11. Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©
  agreements: boolean;           // 12. Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨
  finance: boolean;              // 13. Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„Ø­Ø³Ø§Ø¨Ø§Øª
  kyc: boolean;                  // 14. Ø§Ø¹Ø±Ù Ø¹Ù…ÙŠÙ„Ùƒ (KYC) ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„
  precedents?: boolean;          // 15. Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©
  hr?: boolean;                  // 16. Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ† ÙˆØ§Ù„ÙƒØ§Ø¯Ø± (HR)
  auditLog?: boolean;            // 17. Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø© (Audit Log)
  manageUsers?: boolean;         // 18. Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª
  signOfficialDocs?: boolean;    // Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ø±Ø³Ù…ÙŠØ©
  manageOfficialAssets?: boolean; // Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£ØµÙˆÙ„ Ø§Ù„Ø±Ø³Ù…ÙŠØ©

  // 2. ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª ÙˆØ§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© ÙˆØ§Ù„ØªÙÙˆÙŠØ¶Ø§Øª (Action Permissions)
  manageCases?: boolean;         // Ù‚ÙŠØ¯ ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§
  manageHearings?: boolean;      // Ø¬Ø¯ÙˆÙ„Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„
  manageTasks?: boolean;         // Ø¥Ø³Ù†Ø§Ø¯ ÙˆØªØ¹ÙŠÙŠÙ† ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…Ù‡Ø§Ù…
  manageClients?: boolean;       // Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†
  manageDocs?: boolean;          // Ø±ÙØ¹ ÙˆØ¥Ø¯Ø§Ø±Ø© ÙˆØ£Ø±Ø´ÙØ© Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª
  managePoa?: boolean;           // Ù‚ÙŠØ¯ ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©
  manageAgreements?: boolean;    // ØµÙŠØ§ØºØ© ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨
  viewInvoices?: boolean;        // Ø§Ù„Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ø£ØªØ¹Ø§Ø¨
  manageInvoices?: boolean;      // Ø¥ØµØ¯Ø§Ø± ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶
  manageKyc?: boolean;           // Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ù…Ù„ÙØ§Øª KYC
  manageEmployees?: boolean;     // Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙƒØ§Ø¯Ø± Ø§Ù„ÙˆØ¸ÙŠÙÙŠ ÙˆØ§Ù„Ø±ÙˆØ§ØªØ¨
  managePrecedents?: boolean;    // Ø¥Ø¶Ø§ÙØ© ÙˆØªØµÙ†ÙŠÙ Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©
  viewReports?: boolean;         // Ø§Ø³ØªØ®Ø±Ø§Ø¬ ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ©
  exportData?: boolean;          // ØªØµØ¯ÙŠØ± ÙˆØ§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠØ© (JSON/PDF)

  // 3. ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø© Ø§Ù„Ø­Ø³Ø§Ø³Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… (Deletion Permissions)
  deleteCases?: boolean;         // Ø­Ø°Ù Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ù…Ù„ÙØ§Øª Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹
  deleteClients?: boolean;       // Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡
  deleteHearings?: boolean;      // Ø­Ø°Ù Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠ
  deleteTasks?: boolean;         // Ø­Ø°Ù ÙˆØªÙØ±ÙŠØº Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„ØªÙƒÙ„ÙŠÙØ§Øª
  deleteDocs?: boolean;          // Ø­Ø°Ù Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ø£Ø±Ø´ÙŠÙ ÙˆØ§Ù„ÙˆØ«Ø§Ø¦Ù‚
  deletePoas?: boolean;          // Ø­Ø°Ù ÙˆØ¥Ù„ØºØ§Ø¡ Ù‚ÙŠÙˆØ¯ Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©
  deleteAgreements?: boolean;    // Ø­Ø°Ù Ø§ØªÙØ§Ù‚ÙŠØ§Øª ÙˆØ¹Ù‚ÙˆØ¯ Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨
  deleteInvoices?: boolean;      // Ø­Ø°Ù Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶ ÙˆØ§Ù„ØªØ­ØµÙŠÙ„Ø§Øª
  deleteKyc?: boolean;           // Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª KYC ÙˆÙ‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø­Ø¸Ø± ÙˆØ§Ù„Ù…ØªØ§Ø¨Ø¹Ø©
  deleteEmployees?: boolean;     // Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª Ø§Ù„ÙƒØ§Ø¯Ø± ÙˆØ§Ù„Ù…ÙˆØ¸ÙÙŠÙ†
  deletePrecedents?: boolean;    // Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©
  deleteUsers?: boolean;         // Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ§Ù„Ù…ÙˆØ¸ÙÙŠÙ†
  deleteContacts?: boolean;      // Ø­Ø°Ù Ø¬Ù‡Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙƒÙ…
}

export interface UserItem {
  id: number;
  supabaseId?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  roleTitle: string;
  roleKey: "admin" | "supervisor" | "lawyer" | "secretary" | "accountant";
  status: "Ù†Ø´Ø·" | "Ù…Ø¹Ø·Ù„" | "Ù…Ø¹Ù„Ù‚" | "Ù…ÙˆÙ‚Ù" | "approved" | "pending";
  avatarBg: string;
  avatarText: string;
  permissions: RolePermissions;
  canTransferContacts?: boolean;
  canViewAgreements?: boolean;
  canAccessWhatsapp?: boolean;
  canViewFinances?: boolean;
}

export type FeeAgreementStatus = "Ù†Ø´Ø·Ø©" | "Ù…Ø³Ø¯Ø¯Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„" | "Ù…Ù„ØºØ§Ø©";
export type AllocationStatus = number | "unallocated" | null;

export interface FeeAgreementInstallment {
  id: number;
  feeAgreementId?: number;
  installmentNo: number;
  dueDate: string;
  amount: number;
  status?: "Ù…Ø³ØªØ­Ù‚" | "Ù…Ø¯ÙÙˆØ¹" | "Ù…ØªØ£Ø®Ø±";
  paidOnSigning?: boolean;
}

export interface FeeAgreement {
  id: number;
  clientId: number;
  caseId?: number | null;
  agreementNumber: string;
  title: string;
  totalAmount: number;
  date: string;
  status: FeeAgreementStatus;
  installments?: FeeAgreementInstallment[];
  notes?: string;
}

export interface Client {
  id: number;
  name: string;
  type: string;
  idNo: string;
  phone: string;
  email: string;
  emirate: string;
  address: string;
  taxNo?: string;
  feeAgreements?: FeeAgreement[];
}

export interface CaseItem {
  id: number;
  number: string;
  clientId: number;
  opponent: string;
  type: string;
  court: string;
  judge: string;
  stage?: string;
  status: string;
  subject: string;
  openDate: string;
  fee: number;
  emirate?: string;
}

export interface Hearing {
  id: number;
  caseId: number;
  date: string;
  time: string;
  type: string;
  room: string;
  notes: string;
  done: boolean;
  googleCalendarEventId?: string;
  googleSyncedAt?: string;
}

export interface TaskItem {
  id: number;
  title: string;
  caseId: number | null;
  fileUrl?: string;
  isEncrypted?: boolean;
  iv?: string;
  mimeType?: string;
  assignee: string;
  due: string;
  priority: "Ø¹Ø§Ù„ÙŠØ©" | "Ù…ØªÙˆØ³Ø·Ø©" | "Ù…Ù†Ø®ÙØ¶Ø©";
  done: boolean;
}

export interface Invoice {
  id: number;
  number: string;
  clientId: number;
  caseId: number | null;
  fileUrl?: string;
  isEncrypted?: boolean;
  iv?: string;
  mimeType?: string;
  feeAgreementId?: number | "unallocated" | null;
  date: string;
  due: string;
  amount: number;
  status: string;
  desc: string;
}

export interface PaymentReceipt {
  id: number;
  clientId: number;
  caseId?: number | null;
  feeAgreementId: number | "unallocated" | null;
  invoiceId?: number | null;
  amount: number;
  date: string;
  paymentMethod: string;
  referenceNo: string;
  notes?: string;
}

interface DocItem {
  id: number;
  name: string;
  type: string;
  caseId: number | null;
  fileUrl?: string;
  isEncrypted?: boolean;
  iv?: string;
  mimeType?: string;
  date: string;
  by: string;
}

interface PoaItem {
  id: number;
  clientId: number;
  number: string;
  issuer: string;
  issue: string;
  expiry: string;
  scope: string;
}

export interface KycItem {
  id: number;
  clientId: number;
  nationality: string;
  idType: string;
  idExpiry: string;
  ubo: string;
  sourceOfFunds: string;
  pep: boolean;
  sanctions: string;
  risk: string;
  status: string;
  lastReview: string;
  notes: string;
}

export interface KycWatchlistItem {
  id: number;
  fullName: string;
  idNo?: string;
  type: string;
  reason: string;
  nationality?: string;
  addedDate: string;
}

export interface NotificationLog {
  id: number;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  channel: "ÙˆØ§ØªØ³Ø§Ø¨" | "Ø¥ÙŠÙ…ÙŠÙ„" | "ÙƒÙ„Ø§Ù‡Ù…Ø§";
  type: "ØªÙ†Ø¨ÙŠÙ‡ Ø¬Ù„Ø³Ø©" | "ØªØ­Ø¯ÙŠØ« Ù‚Ø¶ÙŠØ©" | "ØªØ°ÙƒÙŠØ± ÙØ§ØªÙˆØ±Ø©" | "ØªØ¬Ø¯ÙŠØ¯ ÙˆØ«Ø§Ø¦Ù‚ / KYC" | "ØªØ¬Ø¯ÙŠØ¯ ÙˆÙƒØ§Ù„Ø© / POA" | "ØªÙ†Ø¨ÙŠÙ‡ Ù…ÙŠØ¹Ø§Ø¯ Ø·Ø¹Ù† / Ø§Ø³ØªØ¦Ù†Ø§Ù" | "ØªØ°ÙƒÙŠØ± Ù‚Ø³Ø· ÙØ§ØªÙˆØ±Ø©" | "Ø±Ø³Ø§Ù„Ø© Ø¹Ø§Ù…Ø©";
  message: string;
  sentAt: string;
  status: "ØªÙ… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„" | "Ù‚ÙŠØ¯ Ø§Ù„ØªØ³Ù„ÙŠÙ…";
  relatedRef?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  formattedTimestamp?: string;
  userId: string | number;
  userName: string;
  userEmail: string;
  userRole: string;
  actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS" | "VIEW" | "SECURITY_ALERT" | "EXPORT";
  targetModule: string;
  targetId: string | number;
  targetTitle: string;
  details: string;
  ipAddress?: string;
  status: "Ù…Ø¤ÙƒØ¯" | "Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ - Ù…Ø±ÙÙˆØ¶" | "Ù…ÙƒØªÙ…Ù„" | "ÙØ´Ù„";
}

export interface TimeLog {
  id: number;
  caseId: number;
  lawyerName: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description: string;
  billed: boolean;
}

export interface CaseExpense {
  id: number;
  caseId: number;
  date: string;
  category: "Ø±Ø³ÙˆÙ… Ù‚Ø¶Ø§Ø¦ÙŠØ©" | "ØªØ±Ø¬Ù…Ø© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©" | "Ø£ØªØ¹Ø§Ø¨ Ø®Ø¨Ø±Ø©" | "ØªÙ†Ù‚Ù„Ø§Øª ÙˆÙ…ÙˆØ§ØµÙ„Ø§Øª" | "Ù…ØµØ§Ø±ÙŠÙ Ø¥Ø¯Ø§Ø±ÙŠØ©";
  amount: number;
  description: string;
  billable: boolean;
  billed: boolean;
}

export interface TrustTransaction {
  id: number;
  clientId: number;
  caseId: number | null;
  fileUrl?: string;
  isEncrypted?: boolean;
  iv?: string;
  mimeType?: string;
  feeAgreementId?: number | "unallocated" | null;
  date: string;
  type: "Ø¥ÙŠØ¯Ø§Ø¹ Ø£Ù…Ø§Ù†Ø©" | "ØµØ±Ù Ø±Ø³ÙˆÙ… Ù…Ø­ÙƒÙ…Ø©" | "ØµØ±Ù Ø£ØªØ¹Ø§Ø¨ Ø®Ø¨Ø±Ø©" | "Ø§Ø³ØªØ±Ø¯Ø§Ø¯ Ù„Ù„Ù…ÙˆÙƒÙ„";
  amount: number;
  refNo: string;
  notes: string;
}

export interface JudgmentDeadlineLog {
  id: string;
  timestamp: string;
  type: "7_days" | "3_days" | "manual" | "overdue";
  channel: "whatsapp" | "email" | "both";
  lawyerName: string;
  recipientContact: string;
  status: "sent" | "delivered" | "failed";
  messageSnippet: string;
}

export interface JudgmentDeadline {
  id: number;
  caseId: number;
  rulingDate: string;
  rulingType: "Ø­ÙƒÙ… Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©" | "Ø­ÙƒÙ… Ø§Ø³ØªØ¦Ù†Ø§Ù" | "Ù‚Ø±Ø§Ø± Ù„Ø¬Ø§Ù†";
  rulingSummary: string;
  appealDays: number;
  appealDeadlineDate: string;
  status: "Ø¬Ø§Ø±Ù Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯" | "ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ø¹Ù†" | "Ø§Ù†Ù‚Ø¶Ù‰ Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ" | "ØªÙ… Ù‚ÙŠØ¯ Ø§Ù„Ø·Ø¹Ù†";
  notes: string;
  assignedLawyerId?: number;
  assignedLawyerName?: string;
  assignedLawyerPhone?: string;
  assignedLawyerEmail?: string;
  preferredChannel?: "whatsapp" | "email" | "both";
  alert7DaysSent?: boolean;
  alert7DaysSentAt?: string;
  alert3DaysSent?: boolean;
  alert3DaysSentAt?: string;
  autoAlertLogs?: JudgmentDeadlineLog[];
}

export interface InvoiceInstallment {
  id: number;
  invoiceId: number;
  feeAgreementId?: number | "unallocated" | null;
  installmentNo: number;
  dueDate: string;
  amount: number;
  status: "Ù…Ø³ØªØ­Ù‚" | "Ù…Ø¯ÙÙˆØ¹" | "Ù…ØªØ£Ø®Ø±";
}

export interface StrReport {
  id: number;
  clientId: number;
  caseId: number | null;
  fileUrl?: string;
  isEncrypted?: boolean;
  iv?: string;
  mimeType?: string;
  date: string;
  suspicionReason: string;
  amountFlagged: number;
  reportedBy: string;
  status: "ØªØ­Ù‚ÙŠÙ‚ Ø¯Ø§Ø®Ù„ÙŠ" | "Ù…Ø±ÙÙˆØ¹ Ù„ÙˆØ­Ø¯Ø© Ø§Ù„Ø§Ø³ØªØ¹Ù„Ø§Ù… Ø§Ù„Ù…Ø§Ù„ÙŠ FIU" | "Ù…ØºÙ„Ù‚ Ø¨Ø§Ù†ØªÙØ§Ø¡ Ø§Ù„Ø´Ø¨Ù‡Ø©";
  confidentialNotes: string;
}

export interface CourtContact {
  id: number;
  courtName: string;
  emirate: string;
  department: string;
  titleOrEmployee: string;
  phone: string;
  extOrSeal: string;
  email: string;
  operatingHours: string;
  location: string;
  notes: string;
}

export interface DocTemplate {
  id: string;
  title: string;
  category: string;
  templateBody: string;
}

export interface OfficeAgreementInstallment {
  amount: number;
  dueDate: string;
  paidOnSigning: boolean; // Ù…Ø³Ø¯Ø¯Ø© Ø¹Ù†Ø¯ Ø§Ù„ØªÙˆÙ‚ÙŠØ¹ØŸ => ÙŠÙÙ†Ø´Ø£ Ù„Ù‡Ø§ Ø³Ù†Ø¯ Ù‚Ø¨Ø¶ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹
}

export interface OfficeAgreement {
  id: number;
  agreementNumber: string;   // Ø±Ù‚Ù… AGR Ø§Ù„Ù…Ø±ØªØ¨Ø· Ø¨Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ø£ØªØ¹Ø§Ø¨
  feeAgreementId: number;    // Ù…Ø¹Ø±Ù Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù…Ù†Ø´Ø£Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹
  clientId: number;
  contractDate: string;
  contractCity: string;
  clientNameAr: string;
  clientNameEn: string;
  representativeAr: string;
  representativeEn: string;
  phone: string;
  caseDetailsAr: string;
  caseDetailsEn: string;
  totalAmount: number;
  paymentTermsAr: string;
  paymentTermsEn: string;
  installments: OfficeAgreementInstallment[];
  createdAt: string;
}

export interface Employee {
  id: string;
  userId?: string | null;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  passportNumber: string;
  emiratesId: string;
  idExpiryDate: string;
  licenseNumber?: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  joinDate: string;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
  createdAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "ANNUAL" | "SICK" | "EMERGENCY" | "UNPAID";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string | null;
  createdAt: string;
}

export interface EmployeeExpense {
  id: string;
  employeeId: string;
  employeeName: string;
  caseId?: number | null;
  amount: number;
  category: "COURT_FEES" | "TRANSPORT" | "SUPPLIES" | "OTHER";
  receiptUrl?: string | null;
  status: "PENDING" | "PAID" | "REJECTED";
  createdAt: string;
}

// Ø§Ù„Ø¨Ù†ÙˆØ¯ Ø§Ù„Ø«Ø§Ø¨ØªØ© Ù„Ù„Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© (1-8) â€” Ù„Ø§ ØªØªØºÙŠØ± Ù…Ù† Ø¹Ù…ÙŠÙ„ Ù„Ø¢Ø®Ø±
const OFFICE_AGREEMENT_CLAUSES: { ar: string; en: string }[] = [
  {
    ar: "ØªØ¹ØªØ¨Ø± ÙƒÙ„Ø§Ù‹ Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø© Ø£Ø¹Ù„Ø§Ù‡ ÙˆØ§Ù„Ø¨Ù†ÙˆØ¯ Ø§Ù„Ù…Ø°ÙƒÙˆØ±Ø© Ø£Ø¯Ù†Ø§Ù‡ (Ø§Ù„Ø´Ø±ÙˆØ·) Ø¬Ø²Ø¡Ø§Ù‹ Ù„Ø§ ÙŠØªØ¬Ø²Ø£ Ù…Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù‚Ø¯ØŒ ÙˆØªØµØ¨Ø­ Ø¨Ù…Ø«Ø§Ø¨Ø© Ø§Ù„Ø¶Ø§Ø¨Ø· Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ù„ØªØ¹Ø§Ù…Ù„ ÙˆØ§Ù„Ø¹Ù„Ø§Ù‚Ø© ÙÙŠÙ…Ø§ Ø¨ÙŠÙ† Ø§Ù„Ù…ÙˆÙƒÙ„ ÙˆØ§Ù„Ø³Ø§Ø¯Ø© / Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù…Ø­Ø§Ù…ÙˆÙ† ÙˆÙ…Ø³ØªØ´Ø§Ø±ÙˆÙ† Ù‚Ø§Ù†ÙˆÙ†ÙŠÙˆÙ† Ø¨Ù…Ø¬Ø±Ø¯ Ø§Ù„ØªÙˆÙ‚ÙŠØ¹ Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù‚Ø¯ Ù…Ù† Ø¬Ø§Ù†Ø¨ ÙƒÙ„ Ù…Ù† Ø§Ù„Ù…ÙˆÙƒÙ„ ÙˆØ§Ù„Ø³Ø§Ø¯Ø© / Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©.",
    en: "Both the above-mentioned data and the below-mentioned clauses (conditions) are considered an integral part of this contract, and become the primary control for the dealings and relationship between the client and Messrs. Suood Ahmed Al-Shehhi Advocates and Legal Consultants, lawyers and legal consultants, once this contract is signed by each of the client and Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants."
  },
  {
    ar: "ÙŠÙ„ØªØ²Ù… Ø§Ù„Ø³Ø§Ø¯Ø© / Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©ØŒ Ø£Ø«Ù†Ø§Ø¡ Ù…Ù…Ø§Ø±Ø³ØªÙ‡Ù… Ù„ÙˆØ§Ø¬Ø¨Ù‡Ù… ØªØ¬Ø§Ù‡ Ø§Ù„Ù…ÙˆÙƒÙ„ØŒ Ø¨Ø¨Ø°Ù„ Ø§Ù„Ø¬Ù‡Ø¯ ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© ÙˆØ§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø¹Ù‚ÙˆÙ„Ø© ÙˆÙÙ‚Ø§Ù‹ Ù„Ù‚Ø§Ù†ÙˆÙ† ØªÙ†Ø¸ÙŠÙ… Ù…Ù‡Ù†Ø© Ø§Ù„Ù…Ø­Ø§Ù…Ø§Ø©ØŒ ÙˆØ°Ù„Ùƒ Ø§Ø³ØªÙ†Ø§Ø¯Ø§Ù‹ Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„ØªÙŠ ÙŠÙ‚Ø¯Ù…Ù‡Ø§ Ø§Ù„Ù…ÙˆÙƒÙ„ØŒ ÙˆÙÙŠ Ù†Ø·Ø§Ù‚ Ø§Ù„Ù‚ÙŠØ§Ù… Ø¨Ø§Ù„Ø®Ø¯Ù…Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© ÙˆØ§Ù„Ù…Ø­Ø¯Ø¯ Ø³Ø§Ø¨Ù‚Ø§Ù‹.",
    en: "Suood Ahmed Al Shehhi Advocates & Legal Consultants shall, in the course of performing their duties towards the Client, exercise reasonable efforts, care, and professional skills in accordance with the Law Regulating the Legal Profession, based on the information and documents provided by the Client, and within the scope of the legal service previously specified."
  },
  {
    ar: "ØªÙƒÙˆÙ† Ø§Ù„Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø§Ù„ÙˆØ§Ø±Ø¯Ø© Ø£Ø¹Ù„Ø§Ù‡ Ù‡ÙŠ Ø§Ù„Ù…Ø¨Ø§Ù„Øº Ø§Ù„Ù…Ø³ØªØ­Ù‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆÙƒÙ„ Ù„Ù„Ø³Ø§Ø¯Ø© / Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§ØªØŒ Ø¹Ù„Ù‰ Ø£Ù†Ù‡ ÙÙŠ ÙƒÙ„ Ø§Ù„Ø£Ø­ÙˆØ§Ù„ ØªØ³ØªØ­Ù‚ Ø§Ù„Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù„Ù„Ø³Ø§Ø¯Ø© / Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙÙŠ Ø­Ø§Ù„Ø© Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø®Ø¯Ù…Ø© / Ø§Ù„Ø¹Ù‚Ø¯ Ù…Ù† Ù‚Ø¨Ù„ Ø§Ù„Ù…ÙˆÙƒÙ„ØŒ ÙˆÙÙŠ Ø­Ø§Ù„Ø© Ø§Ù„ØªØ³ÙˆÙŠØ© Ø£Ùˆ Ø§Ù„ØªÙ†Ø§Ø²Ù„ Ø£Ùˆ Ø§Ù„Ø¥Ø¨Ø±Ø§Ø¡ ÙÙŠ Ø£ÙŠ Ù…Ø±Ø­Ù„Ø© Ù…Ù† Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ø®Ø¯Ù…Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.",
    en: "The legal fees mentioned above are the amounts owed by the client to Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants, provided that in all cases the legal fees are due to Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants in the event of cancellation of the service/contract by the client, and in the event of settlement, waiver or discharge at any stage of the required legal service."
  },
  {
    ar: "Ù„Ù† ØªØªØ¶Ù…Ù† Ø§Ù„Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø£Ø¹Ù„Ø§Ù‡ Ø£ÙŠ Ø±Ø³ÙˆÙ… Ù…Ø³ØªØ­Ù‚Ø© Ù„Ù„Ù…Ø­Ø§ÙƒÙ… Ø£Ùˆ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ø±Ø³Ù…ÙŠØ© ÙˆØ§Ù„Ø­ÙƒÙˆÙ…ÙŠØ© Ø£Ùˆ Ø§Ù„ØªØ±Ø¬Ù…Ø© Ø£Ùˆ Ø§Ù„Ø®Ø¨Ø±Ø© Ø£Ùˆ Ø£ÙŠ Ø±Ø³ÙˆÙ… / Ø£ØªØ¹Ø§Ø¨ Ø£Ø®Ø±Ù‰ (Ù…Ø§ Ù„Ù… ÙŠÙÙ†Øµ Ø¹Ù„Ù‰ Ø°Ù„Ùƒ ØµØ±Ø§Ø­Ø©).",
    en: "The above legal fees will not include any fees due to the courts, official and governmental departments, translation, expertise, or any other fees (unless explicitly stated)."
  },
  {
    ar: "ÙŠÙ„ØªØ²Ù… Ø§Ù„Ù…ÙˆÙƒÙ„ Ø¨ØªØ­Ø±ÙŠØ± ØªÙˆÙƒÙŠÙ„ Ù…ØµØ¯Ù‚ (Ø¥Ø°Ø§ Ù„Ø²Ù… Ø§Ù„Ø£Ù…Ø±) Ù„Ù„Ø³Ø§Ø¯Ø© / Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø£Ùˆ Ù…Ù† ÙŠÙ…Ø«Ù„Ù‡Ù… (ÙˆÙÙ‚Ø§Ù‹ Ù„Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ù…Ø¹Ø¯ Ù„Ø°Ù„Ùƒ) ÙˆØ¨ØªÙ‚Ø¯ÙŠÙ… ÙƒØ§ÙØ© Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù„Ø§Ø²Ù…Ø© Ø£Ùˆ Ø§Ù„ØªÙŠ ØªÙØ·Ù„Ø¨ Ù…Ù†Ù‡ ÙˆØ§Ù„ØªÙŠ ØªÙ…ÙƒÙ‘Ù† Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù…Ù† Ø§Ù„Ù‚ÙŠØ§Ù… Ø¨Ø§Ù„Ø®Ø¯Ù…Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.",
    en: "The client is obligated to issue a certified power of attorney (if necessary) for Messrs. Suood Ahmed Al Shehhi Advocates and Legal Consultants or their representatives (according to the form prepared for this purpose) and to submit all documents, data and information necessary or requested from him that will enable Suood Ahmed Al Shehhi Advocates and Legal Consultants to carry out the required legal service."
  },
  {
    ar: "ØªØ¹ØªØ¨Ø± Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª ÙˆØ§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ù…ÙˆØ¬Ù‡Ø© Ù…Ù† Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø¥Ù„Ù‰ Ø§Ù„Ù…ÙˆÙƒÙ„ Ù‚Ø¯ ÙˆØµÙ„Øª Ø¥Ø°Ø§ ØªÙ… Ø¨Ø°Ù„ Ø§Ù„Ø¬Ù‡Ø¯ Ø§Ù„Ù…Ø¹Ù‚ÙˆÙ„ Ù„Ø¥Ø±Ø³Ø§Ù„Ù‡Ø§ Ø¥Ù„Ù‰ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…ÙˆÙƒÙ„ Ø§Ù„Ù…Ø¨ÙŠÙ† Ø£Ø¹Ù„Ø§Ù‡ Ø£Ùˆ Ø¨Ø£ÙŠ ÙˆØ³ÙŠÙ„Ø© Ø­Ø¯ÙŠØ«Ø©.",
    en: "All correspondence and reports addressed by Suood Ahmed Al Shehhi Advocates and Legal Consultants to the client are considered to have arrived if reasonable efforts are made to send them to the client's address shown above or by any modern means."
  },
  {
    ar: "Ù†Ø¸Ø±Ø§Ù‹ Ù„ØªÙ†ÙÙŠØ° Ø¶Ø±ÙŠØ¨Ø© Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ø¶Ø§ÙØ© ÙÙŠ Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ù…ØªØ­Ø¯Ø©ØŒ Ø§Ø¨ØªØ¯Ø§Ø¡Ù‹ Ù…Ù† 1 ÙŠÙ†Ø§ÙŠØ± 2018ØŒ ÙŠØ¬Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø£Ù† ÙŠØ¯ÙØ¹ 5Ùª Ø¥Ø¶Ø§ÙÙŠØ© Ù…Ù† Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¹Ù‚Ø¯.",
    en: "Due to the implementation of Value Added Tax (VAT) in the United Arab Emirates starting from January 1, 2018, the client must pay an additional 5% of the contract value."
  },
  {
    ar: "ØªØ®ØªØµ Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ Ø¨Ø§Ù„ÙØµÙ„ ÙÙŠ ÙƒÙ„ Ø§Ù„Ø£Ù…ÙˆØ± Ø§Ù„ØªÙŠ ØªØªØµÙ„ Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù‚Ø¯.",
    en: "The courts of Dubai have jurisdiction to decide all matters related to this contract."
  }
];

const OFFICE_HEADER_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABnYAAAEgCAMAAAC+bL0+AAABgFBMVEX///////7///3///z///v///r///n///j///f///b///L+///+//7+//3+//z+//n9///8///6///7//z7//j0//3y//Xs//Xi//L//v///v7+/v/+/v79/v///f///f7+/f/9/f/+/P/++////v3//vz+/vz9/v38/v3+/f39/f39/fz8/f39/Pz//vr9/vr9/fr9/Pr9/ff9/fL7/v77/fz7+/z6/v35/P36+/z3/fz6+vv2+v32+vv2+vr1+vr0+vr2+vn5/PTy/fzz+/ry+/ry+vzz+vry+vry/Pfm/O/8+f31+fz1+fr0+fz0+fv0+fr1+fj5+fD0+fn3+Pr0+Pn29vHz9PHu8unr7OLm5+Di6Nbi4tvi49XZ2c7Q0sTNzLrNy73I3Mei17LKy7zKy7m7y7LGxbi8vay0s6KusJ2mp5SfoIybm46bm3eYm3mYmYGYmXSYmH+Son9jpXGWloaWlnZVh1kYdikEagkCZwYyVjQJYA8EYgoAZgQBYgc1UQB2AAEAAElEQVR42uz9i0MaR/v+jy/rEqPLcTm57LLAoghUzggGmj5R23cb/Pj9xVM8BlJNHk4iciigxfiv/+57FhVT00STPm2avRITRfY07M5rrpl77qFWVal6X2tra4sBlqU+JIGdW32maNHFkjfyPE+p+kb0ZPjpr84JwgffxLKu3NrWmvo0qXpfC9QzVare19oPa2s5pMkHWCKw7NOrty6YVex8SxLh7+YQO09Z9m7s4M3Ask+g+bKmPk2q3leW+lmVqve1hXbnT7AD3Fl4tvHsZ0IoxA7Pq9j5VrAjUuE1wA5++AsfcsSj2FEfJ1XvKUv9pErV+/ph8SPY8bKp1SF2FlXsfGvYeYIW5qdnG6uZP8fOPNxFi8/Ux0nVe8qqnWyq7uhkA+zM/wl23DwlPll7AU3en549zbDfQMcS/BHFdIgKpUX84aoGBlHwYjgE34S+DewIrGt14+effnq2upUzUddlccfQDhsA7KidbKru6GR7qkrV+4JGatb159ih5hdXvxnshMjfMLb0qZCYpoaECeHrYpgKfUtuB7GDDubZ6tqTj2DHNA/NF/VpUvW+FqiUKlV3KGD6E+zwvHiNndWFfz92KDEEf0QqLIZyoZCYuzI7wJ0w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";
const OFFICE_FOOTER_IMG = "data:image/png;base64,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";

const LH_KEY = "office_letterhead_config";

export function loadLetterhead(): { headerImg: string; footerImg: string } {
  try {
    const raw = localStorage.getItem(LH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        headerImg: parsed.headerImg || OFFICE_HEADER_IMG,
        footerImg: parsed.footerImg || OFFICE_FOOTER_IMG,
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    headerImg: OFFICE_HEADER_IMG,
    footerImg: OFFICE_FOOTER_IMG,
  };
}

export function saveLetterhead(config: { headerImg: string; footerImg: string }) {
  try {
    localStorage.setItem(LH_KEY, JSON.stringify(config));
  } catch (e) {
    // ignore
  }
}

// ---------- Ù…ØµÙÙˆÙØ© Ø£Ù‚Ø³Ø§Ù… ÙˆØªØ¨ÙˆÙŠØ¨Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ù€ 18 Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© ----------

export interface Colleague {
  id: number;
  name: string;
  phone: string;
  federalId: string;
  specialization: string;
  tag: 'Ù…Ø¹ØªÙ…Ø¯' | 'ØªØ¬Ø±ÙŠØ¨ÙŠ' | 'Ø·ÙˆØ§Ø±Ø¦ ÙÙ‚Ø·';
  notes: string;
}

export interface DelegationLog {
  id: number;
  serialNo: string;
  timestamp: string;
  caseNo: string;
  delegatedLawyer: string;
  generatedBy: string;
}

export interface SystemModuleDef {
  id: keyof RolePermissions;
  label: string;
  desc: string;
  category: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©" | "Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„Ù…Ù‡Ø§Ù…" | "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯" | "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„";
  navTabIds: string[];
}

export const PERMISSION_MODULES: SystemModuleDef[] = [

  // 1. Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© (5 Ø£Ù‚Ø³Ø§Ù…)
  { id: "dashboard", label: "Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡", desc: "Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª ÙˆÙ†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙƒØªØ¨ ÙˆÙ…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø£Ø¯Ø§Ø¡", category: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", navTabIds: ["dashboard"] },
  { id: "specialPortfolio", label: "Ø§Ù„Ø­Ù‚ÙŠØ¨Ø© Ø§Ù„Ø®Ø§ØµØ© (Ø¥Ù†Ø§Ø¨Ø§Øª)", desc: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø²Ù…Ù„Ø§Ø¡ ÙˆØ¥ØµØ¯Ø§Ø± Ø§Ù„Ø¥Ù†Ø§Ø¨Ø§Øª Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ© ÙˆØªÙˆØ«ÙŠÙ‚Ù‡Ø§", category: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", navTabIds: ["special_portfolio"] },
  { id: "cases", label: "Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", desc: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù„ÙØ§Øª ÙˆØ§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ø¯Ø¹Ø§ÙˆÙ‰ ÙˆÙ…Ø±Ø§Ø­Ù„ Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ", category: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", navTabIds: ["cases"] },
  { id: "calendar", label: "Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„", desc: "Ø¬Ø¯ÙˆÙ„Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆÙ‚Ø§Ø¹Ø§ØªÙ‡Ø§ ÙˆØ§Ù„Ù‚Ø±Ø§Ø±Ø§Øª", category: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", navTabIds: ["hearings"] },
  { id: "clients", label: "Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡", desc: "Ø³Ø¬Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø£ÙØ±Ø§Ø¯ ÙˆØ§Ù„Ø´Ø±ÙƒØ§Øª ÙˆØ§Ù„Ø¬Ù‡Ø§Øª", category: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", navTabIds: ["clients"] },
  { id: "bookingConsultation", label: "Ø­Ø¬Ø² Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø±Ø¦ÙŠØ©", desc: "Ø¥Ø¯Ø§Ø±Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø±Ø¦ÙŠØ© ÙˆØ£Ø±Ø¨Ø§Ø­Ù‡Ø§", category: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", navTabIds: ["booking_consultation"] },

  // 2. Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„Ù…Ù‡Ø§Ù… (4 Ø£Ù‚Ø³Ø§Ù…)
  { id: "tasks", label: "Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„ØªÙƒÙ„ÙŠÙØ§Øª", desc: "Ø¥Ø³Ù†Ø§Ø¯ ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„", category: "Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„Ù…Ù‡Ø§Ù…", navTabIds: ["tasks"] },
  { id: "whatsapp", label: "ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø¯Ù…Ø¬", desc: "Ø§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª Ø§Ù„ÙÙˆØ±ÙŠØ© ÙˆØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©", category: "Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„Ù…Ù‡Ø§Ù…", navTabIds: ["whatsapp_office"] },
  { id: "email", label: "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ù…Ø¯Ù…Ø¬", desc: "Ø§Ù„Ø§Ø·Ù„Ø§Ø¹ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ù„Ù…ÙƒØªØ¨", category: "Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„Ù…Ù‡Ø§Ù…", navTabIds: ["inapp_email"] },
  { id: "directory", label: "Ø¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆØ§Ù„Ø¬Ù‡Ø§Øª", desc: "Ø¯Ù„ÙŠÙ„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ù…Ø¹ Ù…Ø­Ø§ÙƒÙ… ÙˆÙ†ÙŠØ§Ø¨Ø§Øª Ø§Ù„Ø¯ÙˆÙ„Ø©", category: "Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„Ù…Ù‡Ø§Ù…", navTabIds: ["courts_directory"] },

  // 3. Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯ ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª (4 Ø£Ù‚Ø³Ø§Ù…)
  { id: "docs", label: "Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø£Ø±Ø´ÙŠÙ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ", desc: "Ø£Ø±Ø´ÙØ© ÙˆØªØµÙ†ÙŠÙ Ù…Ù„ÙØ§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ø±Ø³Ù…ÙŠØ©", category: "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯", navTabIds: ["docs"] },
  { id: "poa", label: "Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", desc: "Ù…ØªØ§Ø¨Ø¹Ø© ØµÙ„Ø§Ø­ÙŠØ© ÙˆØ³Ø±ÙŠØ§Ù† Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª ÙˆØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡", category: "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯", navTabIds: ["poa"] },
  { id: "agreements", label: "Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨", desc: "ØµÙŠØ§ØºØ© ÙˆØ¥Ù†Ø´Ø§Ø¡ ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨ ÙˆØ¬Ø¯ÙˆÙ„ Ø§Ù„Ø¯ÙØ¹Ø§Øª", category: "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯", navTabIds: ["office_agreement"] },
  { id: "finance", label: "Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„Ø­Ø³Ø§Ø¨Ø§Øª", desc: "Ø¥ØµØ¯Ø§Ø± Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ø¶Ø±ÙŠØ¨ÙŠØ© 5% ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶ ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø°Ù…Ù…", category: "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯", navTabIds: ["invoices"] },

  // 4. Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„ ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø© (5 Ø£Ù‚Ø³Ø§Ù…)
  { id: "kyc", label: "Ø§Ø¹Ø±Ù Ø¹Ù…ÙŠÙ„Ùƒ (KYC) ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", desc: "Ù…Ø±Ø§Ø¬Ø¹Ø§Øª Ø§Ù„ÙØ­Øµ ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„ Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ù…ÙƒØ§ÙØ­Ø© ØºØ³Ù„ Ø§Ù„Ø£Ù…ÙˆØ§Ù„", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", navTabIds: ["kyc"] },
  { id: "precedents", label: "Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©", desc: "Ù…ÙƒØªØ¨Ø© ÙˆØ³Ø¬Ù„ Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙˆØ³ÙˆØ§Ø¨Ù‚ Ø§Ù„ØªÙ…ÙŠÙŠØ² ÙˆØ§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ©", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", navTabIds: ["precedents"] },
  { id: "hr", label: "Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ† ÙˆØ§Ù„ÙƒØ§Ø¯Ø± (HR)", desc: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙƒØ§Ø¯Ø± Ø§Ù„ÙˆØ¸ÙŠÙÙŠ ÙˆØ§Ù„Ø±ÙˆØ§ØªØ¨ ÙˆØ§Ù„Ø¥Ø¬Ø§Ø²Ø§Øª ÙˆØ§Ù„Ù…ØµØ±ÙˆÙØ§Øª", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", navTabIds: ["employees"] },
  { id: "auditLog", label: "Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø© (Audit Log)", desc: "Ø±Ù‚Ø§Ø¨Ø© ÙˆØªØªØ¨Ø¹ Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„ØªØ¹Ø¯ÙŠÙ„ ÙˆØªØºÙŠÙŠØ±Ø§Øª Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø³Ø§Ø³Ø©", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", navTabIds: ["audit_log"] },
  { id: "manageUsers", label: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† ÙˆØªØ®ØµÙŠØµ Ø§Ù„Ø£Ø¯ÙˆØ§Ø±", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", navTabIds: ["users"] },
  { id: "manageOfficialAssets", label: "Ø§Ù„Ø£ØµÙˆÙ„ Ø§Ù„Ø±Ø³Ù…ÙŠØ©", desc: "Ø¥Ø¯Ø§Ø±Ø© ÙˆØ±ÙØ¹ Ø§Ù„ØªØ±ÙˆÙŠØ³Ø© ÙˆØ§Ù„Ø®ØªÙ… ÙˆØªÙˆÙ‚ÙŠØ¹Ø§Øª Ø§Ù„Ù…Ø­Ø§Ù…ÙŠÙ†", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", navTabIds: ["official_assets"] },
];

// Ù…ØµÙÙˆÙØ© ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¦ÙŠØ© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© ÙˆØ§Ù„ØªÙÙˆÙŠØ¶Ø§Øª ÙˆØ§Ù„Ø­Ø°Ù Ø§Ù„Ù…Ù‚ÙŠØ¯
export const DETAILED_ACTION_PERMISSIONS: Array<{
  id: keyof RolePermissions;
  label: string;
  desc: string;
  category: string;
  isSensitive?: boolean;
}> = [
  // 1. Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù‚ÙŠØ¯ ÙˆØ§Ù„ØªØ¹Ø¯ÙŠÙ„
  { id: "manageCases", label: "Ù‚ÙŠØ¯ ÙˆØªØ¹Ø¯ÙŠÙ„ Ù…Ù„ÙØ§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", desc: "Ø¥Ø¶Ø§ÙØ© Ù…Ù„ÙØ§Øª Ø¬Ø¯ÙŠØ¯Ø© ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø¹ÙˆÙ‰ ÙˆÙ…Ø±Ø§Ø­Ù„ Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ", category: "Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ ÙˆØ§Ù„Ù…Ø­Ø§ÙƒÙ…" },
  { id: "manageHearings", label: "Ø¬Ø¯ÙˆÙ„Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ ÙˆØªØ­Ø¯ÙŠØ« Ù‚Ø±Ø§Ø±Ø§Øª Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆØ§Ù„Ø±ÙˆÙ„", category: "Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ ÙˆØ§Ù„Ù…Ø­Ø§ÙƒÙ…" },
  { id: "manageTasks", label: "Ø¥Ø³Ù†Ø§Ø¯ ÙˆØ¥Ø¯Ø§Ø±Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…Ù‡Ø§Ù…", desc: "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠÙ† ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²", category: "Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„ØªØ´ØºÙŠÙ„" },
  { id: "manageClients", label: "Ø¥Ø¯Ø§Ø±Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ ÙˆØªØ­Ø¯ÙŠØ« Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø£Ø·Ø±Ø§Ù", category: "Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡" },
  { id: "manageDocs", label: "Ø¥Ø¯Ø§Ø±Ø© ÙˆØ±ÙØ¹ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ø£Ø±Ø´ÙŠÙ", desc: "Ø±ÙØ¹ ÙˆØ­ÙØ¸ ÙˆØªÙ†Ø²ÙŠÙ„ ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", category: "Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯" },
  { id: "managePoa", label: "Ø¥Ø¯Ø§Ø±Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", desc: "Ù‚ÙŠØ¯ ÙˆØªØ¬Ø¯ÙŠØ¯ ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ³Ø¬Ù„Ø§Øª Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª ÙˆØ§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª", category: "Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯" },
  { id: "manageAgreements", label: "ØµÙŠØ§ØºØ© ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨", desc: "Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù‚ÙˆØ¯ Ø£ØªØ¹Ø§Ø¨ Ø¬Ø¯ÙŠØ¯Ø© ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¯ÙØ¹Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù…ÙƒØªØ¨", category: "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¹Ù‚ÙˆØ¯" },
  { id: "viewInvoices", label: "Ø§Ù„Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ÙˆØ§Ù„ÙÙˆØ§ØªÙŠØ±", desc: "Ø¹Ø±Ø¶ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø¨Ø§Ù„Øº ÙˆØ§Ù„Ø£ØªØ¹Ø§Ø¨ ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶ Ø§Ù„Ù…Ø³Ø¯Ø¯Ø© ÙˆØ§Ù„Ù…ØªØ¨Ù‚ÙŠØ©", category: "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¶Ø±ÙŠØ¨Ø©" },
  { id: "manageInvoices", label: "Ø¥ØµØ¯Ø§Ø± ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ø¶Ø±ÙŠØ¨Ø©", desc: "ØªØ­Ø±ÙŠØ± Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ø¶Ø±ÙŠØ¨ÙŠØ© 5% ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶ ÙˆØ±Ø¨Ø·Ù‡Ø§ Ø¨Ø§Ù„Ø¯ÙØ¹Ø§Øª", category: "Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¶Ø±ÙŠØ¨Ø©" },
  { id: "manageKyc", label: "Ø¥Ø¯Ø§Ø±Ø© ÙˆÙØ­Øµ Ø§Ø¹Ø±Ù Ø¹Ù…ÙŠÙ„Ùƒ KYC", desc: "ØªØ¹Ø¨Ø¦Ø© ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§Ø³ØªÙ…Ø§Ø±Ø§Øª Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù‡ÙˆÙŠØ© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", category: "Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„ ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©" },
  { id: "manageEmployees", label: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙƒØ§Ø¯Ø± ÙˆØ§Ù„Ø±ÙˆØ§ØªØ¨ (HR)", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† ÙˆØ¹Ù‚ÙˆØ¯Ù‡Ù… ÙˆØ±ÙˆØ§ØªØ¨Ù‡Ù… ÙˆÙ…ØµØ±ÙˆÙØ§ØªÙ‡Ù…", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ù…ÙˆØ§Ø±Ø¯" },
  { id: "managePrecedents", label: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ­Ø¯ÙŠØ« ÙˆØªØµÙ†ÙŠÙ Ø§Ù„Ø³ÙˆØ§Ø¨Ù‚ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„ØªÙ…ÙŠÙŠØ²ÙŠØ© ÙˆØ§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ©", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ù…Ø¹Ø±ÙØ©" },
  { id: "viewReports", label: "Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©", desc: "Ø§Ø³ØªØ®Ø±Ø§Ø¬ ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø© ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…Ø§Ù„ÙŠ ÙˆØ§Ù„ØªØ´ØºÙŠÙ„ÙŠ ÙˆÙ…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", category: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ù…Ø¹Ø±ÙØ©" },
  { id: "exportData", label: "ØªØµØ¯ÙŠØ± ÙˆØ§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠØ©", desc: "ØªØµØ¯ÙŠØ± Ù‚ÙˆØ§Ø¹Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙƒØªØ¨ Ø¨ØµÙŠØºØ© JSON ÙˆÙ…Ù„ÙØ§Øª PDF ÙˆØ·Ø¨Ø§Ø¹ØªÙ‡Ø§", category: "Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ§Ù„Ø£Ù…Ø§Ù†", isSensitive: true },

  // 2. ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù Ø§Ù„ØµØ±ÙŠØ­Ø© ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø© Ø§Ù„Ø­Ø³Ø§Ø³Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… (ØªÙ…Ù†Ø¹ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹ ÙˆØªØ´ØªØ±Ø· Ø¥Ø°Ù†Ø§Ù‹ ÙˆØªØ£ÙƒÙŠØ¯Ø§Ù‹)
  { id: "deleteCases", label: "Ø­Ø°Ù Ù…Ù„ÙØ§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ø­Ø³Ø§Ø³Ø© Ù„Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ø¯Ø¹Ø§ÙˆÙ‰ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù…", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteClients", label: "Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ø­Ø³Ø§Ø³Ø© Ù„Ø­Ø°Ù Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø´Ø±ÙƒØ§Øª Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteHearings", label: "Ø­Ø°Ù Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆØ¬Ø¯Ø§ÙˆÙ„ Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù…Ø­Ø§ÙƒÙ… Ø§Ù„Ù…Ø³Ø¬Ù„Ø©", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteTasks", label: "Ø­Ø°Ù ÙˆØªÙØ±ÙŠØº Ø§Ù„Ù…Ù‡Ø§Ù…", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù Ø§Ù„ØªÙƒÙ„ÙŠÙØ§Øª ÙˆØ§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠØ© Ø§Ù„Ù…Ø³Ù†Ø¯Ø© Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteDocs", label: "Ø­Ø°Ù ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ø£Ø±Ø´ÙŠÙ", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ù…Ø°ÙƒØ±Ø§Øª ÙˆØ§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø±ÙÙˆØ¹Ø©", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deletePoas", label: "Ø­Ø°Ù Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø¥Ù„ØºØ§Ø¡ ÙˆØ­Ø°Ù Ù‚ÙŠÙˆØ¯ ÙˆØ³Ø¬Ù„Ø§Øª Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteAgreements", label: "Ø­Ø°Ù Ø§ØªÙØ§Ù‚ÙŠØ§Øª ÙˆØ¹Ù‚ÙˆØ¯ Ø§Ù„Ø£ØªØ¹Ø§Ø¨", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ø­Ø³Ø§Ø³Ø© Ù„Ø­Ø°Ù Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨ ÙˆØ¬Ø¯Ø§ÙˆÙ„ Ø§Ù„Ø³Ø¯Ø§Ø¯", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteInvoices", label: "Ø­Ø°Ù Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ø­Ø³Ø§Ø³Ø© Ù„Ø­Ø°Ù Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ø¶Ø±ÙŠØ¨ÙŠØ© ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„ØªØ­ØµÙŠÙ„", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteKyc", label: "Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª KYC ÙˆÙ‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø­Ø¸Ø±", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù Ø§Ø³ØªÙ…Ø§Ø±Ø§Øª Ø§Ù„ØªØ­Ù‚Ù‚ ÙˆÙ‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø­Ø¸Ø± ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteEmployees", label: "Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† (HR)", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù Ù…Ù„ÙØ§Øª Ø§Ù„ÙƒØ§Ø¯Ø± Ø§Ù„ÙˆØ¸ÙŠÙÙŠ Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù…", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deletePrecedents", label: "Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù Ø§Ù„Ø³ÙˆØ§Ø¨Ù‚ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„ØªÙ…ÙŠÙŠØ²ÙŠØ© Ù…Ù† Ø§Ù„Ù…ÙƒØªØ¨Ø©", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteUsers", label: "Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ø¥Ø¯Ø§Ø±ÙŠØ© Ø¹Ù„ÙŠØ§ Ù„Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† ÙˆØ§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
  { id: "deleteContacts", label: "Ø­Ø°Ù Ø¬Ù‡Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙƒÙ…", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆØ£Ø±Ù‚Ø§Ù… Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ù…Ø³Ø¬Ù„Ø©", category: "ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©", isSensitive: true },
];

// ÙØ­Øµ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„ØªØ¨ÙˆÙŠØ¨ Ø§Ù„Ù…Ø­Ø¯Ø¯ Ù…Ø¹ ØªØ·Ø¨ÙŠÙ‚ Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø­Ø¸Ø± Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ (Default-Deny Policy)
export const hasTabPermission = (user: UserItem | null | undefined, tabId: string): boolean => {
  if (!user) return false;
  // Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù… Ù„Ù‡ Ø¬Ù…ÙŠØ¹ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ø¨Ù„Ø§ Ø§Ø³ØªØ«Ù†Ø§Ø¡
  if (user.roleKey === "admin" || (user as any).role === "admin" || user.id === 1 || user.name.includes("Ø³Ø¹ÙˆØ¯")) return true;

  // ØªØ¨ÙˆÙŠØ¨ Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ© Ù…ØªØ§Ø­ Ù„Ù„Ø¬Ù…ÙŠØ¹ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹ ÙˆÙ„Ù„ÙƒØ§Ø¯Ø± Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ø¥Ù„Ø§ Ø¥Ø°Ø§ Ù‚ÙÙŠÙ‘Ø¯ ØµØ±Ø§Ø­Ø©
  if (tabId === "precedents") {
    if (user.permissions && user.permissions.precedents === false) return false;
    return true;
  }

  // ØªØ¨ÙˆÙŠØ¨ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø©
  if (tabId === "audit_log") {
    return Boolean(user.permissions?.manageUsers || user.permissions?.auditLog);
  }


  if (tabId === "official_assets") {
    return Boolean(user.permissions?.manageOfficialAssets || user.permissions?.signOfficialDocs);
  }

  // ØªØ¨ÙˆÙŠØ¨ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø­ØµØ± Ù„Ù„Ù…Ø¯ÙŠØ± Ø£Ùˆ Ù…Ù† Ù„Ø¯ÙŠÙ‡ ØµÙ„Ø§Ø­ÙŠØ© ØµØ±ÙŠØ­Ø©
  if (tabId === "users") {
    return Boolean(user.permissions?.manageUsers);
  }

  // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„ØªØ¨ÙˆÙŠØ¨ Ø§Ù„Ù…Ø­Ø¯Ø¯
  const moduleDef = PERMISSION_MODULES.find((m) => m.navTabIds.includes(tabId));
  if (!moduleDef) {
    // Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø­Ø¸Ø± Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ: Ø£ÙŠ Ù…ÙŠØ²Ø© Ø£Ùˆ ØªØ¨ÙˆÙŠØ¨ Ø¬Ø¯ÙŠØ¯ ØºÙŠØ± Ù…Ø¹Ø±Ù ÙŠÙƒÙˆÙ† Ù…Ø®ÙÙŠØ§Ù‹ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù„ØºÙŠØ± Ø§Ù„Ù…Ø¯ÙŠØ±
    return false;
  }

  const moduleKey = moduleDef.id;
  const perms = user.permissions;
  if (!perms) return false;

  // Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ù…Ø®Ø²Ù†Ø© ÙƒÙ…ØµÙÙˆÙØ© Ù†ØµÙˆØµ
  if (Array.isArray(perms)) {
    return (perms as string[]).includes(moduleKey) || (perms as string[]).includes(tabId);
  }

  // Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ù…Ø®Ø²Ù†Ø© ÙƒÙƒØ§Ø¦Ù†
  if (typeof perms === "object") {
    if (perms[moduleKey as keyof RolePermissions] === true) return true;
    
    // ÙØ­Øµ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø§Ù„ØªÙˆØ§ÙÙ‚ÙŠØ©
    if (tabId === "dashboard" && perms.dashboard) return true;
    if (tabId === "cases" && (perms.cases || perms.manageCases)) return true;
    if (tabId === "hearings" && (perms.calendar || perms.manageHearings)) return true;
    if (tabId === "clients" && (perms.clients || perms.manageClients)) return true;
    if (tabId === "booking_consultation" && perms.bookingConsultation) return true;
    if (tabId === "tasks" && (perms.tasks || perms.manageTasks)) return true;
    if (tabId === "whatsapp_office" && (perms.whatsapp || user.canAccessWhatsapp)) return true;
    if (tabId === "inapp_email" && perms.email) return true;
    if (tabId === "courts_directory" && perms.directory) return true;
    if (tabId === "docs" && (perms.docs || perms.manageDocs)) return true;
    if (tabId === "poa" && (perms.poa || perms.managePoa || perms.manageDocs)) return true;
    if (tabId === "office_agreement" && (perms.agreements || perms.manageAgreements || user.canViewAgreements)) return true;
    if (tabId === "invoices" && (perms.finance || perms.viewInvoices || perms.manageInvoices || user.canViewFinances)) return true;
    if (tabId === "kyc" && (perms.kyc || perms.manageKyc)) return true;
    if (tabId === "precedents" && (perms.precedents || perms.managePrecedents)) return true;
    if (tabId === "employees" && (perms.hr || perms.manageEmployees)) return true;
  }

  return false;
};

// Ø­Ø³Ø§Ø¨ Ø¹Ø¯Ø¯ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ© Ù…Ù† Ø£ØµÙ„ 18 Ù‚Ø³Ù…Ø§Ù‹ Ù…Ø¹ØªÙ…Ø¯Ø§Ù‹
export const getActivePermissionsCount = (user: UserItem | null | undefined): number => {
  if (!user) return 0;
  if (user.roleKey === "admin" || (user as any).role === "admin" || user.id === 1 || user.name.includes("Ø³Ø¹ÙˆØ¯")) {
    return PERMISSION_MODULES.length;
  }

  let count = 0;
  PERMISSION_MODULES.forEach((mod) => {
    if (hasTabPermission(user, mod.navTabIds[0])) {
      count++;
    }
  });
  return count;
};

// ---------- Ø§Ù„Ù‚ÙˆØ§Ù„Ø¨ Ø§Ù„Ù…Ø³Ø¨Ù‚Ø© Ù„Ù„Ø£Ø¯ÙˆØ§Ø± (Ø´Ø§Ù…Ù„Ø© Ø§Ù„Ù€ 18 Ù‚Ø³Ù…Ø§Ù‹ + Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª) ----------
const ROLE_PRESETS: Record<string, { title: string; permissions: RolePermissions }> = {
  admin: {
    title: "Ù…Ø­Ø§Ù…Ù Ø´Ø±ÙŠÙƒ / Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…",
    permissions: {
      dashboard: true,
      cases: true,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: true,
      email: true,
      directory: true,
      docs: true,
      poa: true,
      agreements: true,
      finance: true,
      kyc: true,
      precedents: true,
      hr: true,
      auditLog: true,
      manageUsers: true,
      signOfficialDocs: true,
      manageOfficialAssets: true,
      manageCases: true,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: true,
      manageKyc: true,
      manageEmployees: true,
      managePrecedents: true,
      viewReports: true,
      exportData: true,

      // ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù Ù„Ù„Ù…Ø¯ÙŠØ± Ù…ÙØ¹Ù„Ø©
      deleteCases: true,
      deleteClients: true,
      deleteHearings: true,
      deleteTasks: true,
      deleteDocs: true,
      deletePoas: true,
      deleteAgreements: true,
      deleteInvoices: true,
      deleteKyc: true,
      deleteEmployees: true,
      deletePrecedents: true,
      deleteUsers: true,
      deleteContacts: true,
    },
  },
  supervisor: {
    title: "Ù…Ø´Ø±Ù ÙˆÙ…Ø±Ø§Ø¬Ø¹ Ø¥Ø¯Ø§Ø±ÙŠ",
    permissions: {
      dashboard: true,
      cases: true,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: true,
      email: true,
      directory: true,
      docs: true,
      poa: true,
      agreements: true,
      finance: true,
      kyc: true,
      precedents: true,
      hr: true,
      auditLog: true,
      manageUsers: false,
      manageCases: true,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: false,
      manageKyc: true,
      manageEmployees: true,
      managePrecedents: true,
      viewReports: true,
      exportData: true,

      // Ø§Ù„Ø­Ø°Ù Ù…Ù…Ù†ÙˆØ¹ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
    },
  },
  lawyer: {
    title: "Ù…Ø­Ø§Ù…Ù ÙˆÙ…Ø³ØªØ´Ø§Ø± Ù‚Ø§Ù†ÙˆÙ†ÙŠ",
    permissions: {
      dashboard: true,
      cases: true,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: false,
      email: false,
      directory: true,
      docs: true,
      poa: true,
      agreements: true,
      finance: false,
      kyc: true,
      precedents: true,
      hr: false,
      auditLog: false,
      manageUsers: false,
      manageCases: true,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: false,
      manageKyc: true,
      manageEmployees: false,
      managePrecedents: true,
      viewReports: true,
      exportData: false,

      // Ø§Ù„Ø­Ø°Ù Ù…Ù…Ù†ÙˆØ¹ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
    },
  },
  secretary: {
    title: "Ù…Ø³Ø¤ÙˆÙ„ Ø³ÙƒØ±ØªØ§Ø±ÙŠØ© ÙˆØªÙ†Ø³ÙŠÙ‚",
    permissions: {
      dashboard: true,
      cases: false,
      calendar: true,
      clients: true,
      bookingConsultation: true,
      tasks: true,
      whatsapp: true,
      email: true,
      directory: true,
      docs: true,
      poa: true,
      agreements: false,
      finance: false,
      kyc: false,
      precedents: true,
      hr: false,
      auditLog: false,
      manageUsers: false,
      manageCases: false,
      manageHearings: true,
      manageTasks: true,
      manageClients: true,
      manageDocs: true,
      managePoa: true,
      manageAgreements: false,
      viewInvoices: false,
      manageInvoices: false,
      manageKyc: false,
      manageEmployees: false,
      managePrecedents: false,
      viewReports: false,
      exportData: false,

      // Ø§Ù„Ø­Ø°Ù Ù…Ù…Ù†ÙˆØ¹ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
    },
  },
  accountant: {
    title: "Ù…Ø­Ø§Ø³Ø¨ Ø§Ù„Ù…ÙƒØªØ¨ ÙˆØ§Ù„Ø¶Ø±ÙŠØ¨Ø©",
    permissions: {
      dashboard: true,
      cases: false,
      calendar: false,
      clients: true,
      bookingConsultation: false,
      tasks: true,
      whatsapp: false,
      email: false,
      directory: false,
      docs: true,
      poa: false,
      agreements: true,
      finance: true,
      kyc: true,
      precedents: false,
      hr: true,
      auditLog: false,
      manageUsers: false,
      manageCases: false,
      manageHearings: false,
      manageTasks: true,
      manageClients: true,
      manageDocs: false,
      managePoa: false,
      manageAgreements: true,
      viewInvoices: true,
      manageInvoices: true,
      manageKyc: true,
      manageEmployees: true,
      managePrecedents: false,
      viewReports: true,
      exportData: true,

      // Ø§Ù„Ø­Ø°Ù Ù…Ù…Ù†ÙˆØ¹ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹
      deleteCases: false,
      deleteClients: false,
      deleteHearings: false,
      deleteTasks: false,
      deleteDocs: false,
      deletePoas: false,
      deleteAgreements: false,
      deleteInvoices: false,
      deleteKyc: false,
      deleteEmployees: false,
      deletePrecedents: false,
      deleteUsers: false,
      deleteContacts: false,
    },
  },
};

const PERMISSION_LABELS: Record<keyof RolePermissions, { label: string; desc: string }> = {
  dashboard: { label: "1. Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡", desc: "Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…ÙƒØªØ¨ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø© ÙˆØ§Ù„Ù…Ù„Ø®Øµ ÙˆÙ…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø£Ø¯Ø§Ø¡" },
  specialPortfolio: { label: "Ø§Ù„Ø­Ù‚ÙŠØ¨Ø© Ø§Ù„Ø®Ø§ØµØ© (Ø§Ù„Ø¥Ù†Ø§Ø¨Ø§Øª)", desc: "Ø¥Ø¯Ø§Ø±Ø© Ø¥Ù†Ø§Ø¨Ø§Øª Ø§Ù„Ø²Ù…Ù„Ø§Ø¡ ÙˆØ¥ØµØ¯Ø§Ø± Ø³Ø¬Ù„Ø§ØªÙ‡Ø§" },
  cases: { label: "2. Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", desc: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù„ÙØ§Øª ÙˆØ§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ø¯Ø¹Ø§ÙˆÙ‰ ÙˆÙ…Ø±Ø§Ø­Ù„ Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ" },
  manageOfficialAssets: { label: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£ØµÙˆÙ„ Ø§Ù„Ø±Ø³Ù…ÙŠØ© ÙˆØ§Ù„Ø®Ø·Ø§Ø¨Ø§Øª", desc: "Ø§Ù„Ø®Ø·Ø§Ø¨Ø§Øª Ø§Ù„Ø±Ø³Ù…ÙŠØ© ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª" },
  calendar: { label: "3. Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„", desc: "Ø¬Ø¯ÙˆÙ„Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ù‚Ø±Ø§Ø±Ø§Øª" },
  clients: { label: "4. Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡", desc: "Ø³Ø¬Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø£ÙØ±Ø§Ø¯ ÙˆØ§Ù„Ø´Ø±ÙƒØ§Øª ÙˆØ§Ù„Ø¬Ù‡Ø§Øª" },
  bookingConsultation: { label: "5. Ø­Ø¬Ø² Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø±Ø¦ÙŠØ©", desc: "Ø¥Ø¯Ø§Ø±Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø±Ø¦ÙŠØ© ÙˆØ£Ø±Ø¨Ø§Ø­Ù‡Ø§" },
  tasks: { label: "6. Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„ØªÙƒÙ„ÙŠÙØ§Øª", desc: "Ø¥Ø³Ù†Ø§Ø¯ ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„" },
  whatsapp: { label: "7. ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø¯Ù…Ø¬", desc: "Ø§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª Ø§Ù„ÙÙˆØ±ÙŠØ© ÙˆØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©" },
  email: { label: "8. Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ù…Ø¯Ù…Ø¬", desc: "Ø§Ù„Ø§Ø·Ù„Ø§Ø¹ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ù„Ù…ÙƒØªØ¨" },
  directory: { label: "9. Ø¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆØ§Ù„Ø¬Ù‡Ø§Øª", desc: "Ø¯Ù„ÙŠÙ„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ù…Ø¹ Ù…Ø­Ø§ÙƒÙ… ÙˆÙ†ÙŠØ§Ø¨Ø§Øª Ø§Ù„Ø¯ÙˆÙ„Ø©" },
  docs: { label: "10. Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø£Ø±Ø´ÙŠÙ", desc: "Ø£Ø±Ø´ÙØ© ÙˆØªØµÙ†ÙŠÙ Ù…Ù„ÙØ§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ø±Ø³Ù…ÙŠØ©" },
  poa: { label: "11. Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", desc: "Ù…ØªØ§Ø¨Ø¹Ø© ØµÙ„Ø§Ø­ÙŠØ© ÙˆØ³Ø±ÙŠØ§Ù† Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª ÙˆØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡" },
  agreements: { label: "12. Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨", desc: "ØµÙŠØ§ØºØ© ÙˆØ¥Ù†Ø´Ø§Ø¡ ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨ ÙˆØ¬Ø¯ÙˆÙ„ Ø§Ù„Ø¯ÙØ¹Ø§Øª" },
  finance: { label: "13. Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ø¶Ø±ÙŠØ¨Ø©", desc: "Ø¥ØµØ¯Ø§Ø± Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ø¶Ø±ÙŠØ¨ÙŠØ© 5% ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶ ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø°Ù…Ù…" },
  kyc: { label: "14. Ø§Ø¹Ø±Ù Ø¹Ù…ÙŠÙ„Ùƒ (KYC)", desc: "Ù…Ø±Ø§Ø¬Ø¹Ø§Øª Ø§Ù„ÙØ­Øµ ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„ Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ù…ÙƒØ§ÙØ­Ø© ØºØ³Ù„ Ø§Ù„Ø£Ù…ÙˆØ§Ù„" },
  precedents: { label: "15. Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©", desc: "Ù…ÙƒØªØ¨Ø© ÙˆØ³Ø¬Ù„ Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙˆØ³ÙˆØ§Ø¨Ù‚ Ø§Ù„ØªÙ…ÙŠÙŠØ² ÙˆØ§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ©" },
  hr: { label: "16. Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ† ÙˆØ§Ù„ÙƒØ§Ø¯Ø± (HR)", desc: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙƒØ§Ø¯Ø± Ø§Ù„ÙˆØ¸ÙŠÙÙŠ ÙˆØ§Ù„Ø±ÙˆØ§ØªØ¨ ÙˆØ§Ù„Ø¥Ø¬Ø§Ø²Ø§Øª ÙˆØ§Ù„Ù…ØµØ±ÙˆÙØ§Øª" },
  auditLog: { label: "17. Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø©", desc: "Ø±Ù‚Ø§Ø¨Ø© ÙˆØªØªØ¨Ø¹ Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„ØªØ¹Ø¯ÙŠÙ„ ÙˆØªØºÙŠÙŠØ±Ø§Øª Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø³Ø§Ø³Ø©" },
  manageUsers: { label: "18. Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† ÙˆØªØ®ØµÙŠØµ Ø§Ù„Ø£Ø¯ÙˆØ§Ø±" },
  signOfficialDocs: { label: "Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ø±Ø³Ù…ÙŠØ©", desc: "ØµÙ„Ø§Ø­ÙŠØ© Ø®ØªÙ… ÙˆØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ø¥Ù†Ø§Ø¨Ø§Øª ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù…" },

  // Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¦ÙŠØ© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø©
  manageCases: { label: "Ù‚ÙŠØ¯ ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ù„ÙØ§Øª Ø§Ù„Ø¯Ø¹Ø§ÙˆÙ‰ ÙˆÙ…Ø±Ø§Ø­Ù„ Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ" },
  manageHearings: { label: "Ø¬Ø¯ÙˆÙ„Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¬Ù„Ø³Ø§Øª", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆÙ‚Ø±Ø§Ø±Ø§Øª Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„" },
  manageTasks: { label: "Ø¥Ø³Ù†Ø§Ø¯ ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù‡Ø§Ù…", desc: "Ø¥Ù†Ø´Ø§Ø¡ ÙˆØªØ¹ÙŠÙŠÙ† ÙˆØ¥Ù†Ø¬Ø§Ø² Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆÙ…ØªØ§Ø¨Ø¹ØªÙ‡Ø§" },
  manageClients: { label: "Ø¥Ø¯Ø§Ø±Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø£Ø·Ø±Ø§Ù" },
  manageDocs: { label: "Ø¥Ø¯Ø§Ø±Ø© ÙˆØ±ÙØ¹ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª", desc: "Ø±ÙØ¹ ÙˆØ­ÙØ¸ ÙˆØªØ­Ù…ÙŠÙ„ ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª" },
  managePoa: { label: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", desc: "Ù‚ÙŠØ¯ ÙˆØªØ­Ø¯ÙŠØ« ÙˆÙØ­Øµ Ø³Ø±ÙŠØ§Ù† Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª" },
  manageAgreements: { label: "ØµÙŠØ§ØºØ© Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨", desc: "Ø¥Ù†Ø´Ø§Ø¡ ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨" },
  viewInvoices: { label: "Ø¹Ø±Ø¶ Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ø­Ø³Ø§Ø¨Ø§Øª", desc: "Ø§Ù„Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ Ø£ØªØ¹Ø§Ø¨ ÙˆÙ…Ø¨Ø§Ù„Øº Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶" },
  manageInvoices: { label: "Ø¥ØµØ¯Ø§Ø± ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ÙÙˆØ§ØªÙŠØ±", desc: "ØªØ­Ø±ÙŠØ± Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ø¶Ø±ÙŠØ¨ÙŠØ© ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶" },
  manageKyc: { label: "Ø¥Ø¬Ø±Ø§Ø¡ ÙˆÙØ­Øµ Ø§Ø¹Ø±Ù Ø¹Ù…ÙŠÙ„Ùƒ KYC", desc: "Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø§Ø³ØªÙ…Ø§Ø±Ø§Øª Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„ ÙˆØ§Ù„ÙØ­Øµ" },
  manageEmployees: { label: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙƒØ§Ø¯Ø± Ø§Ù„ÙˆØ¸ÙŠÙÙŠ (HR)", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† ÙˆØ§Ù„Ø±ÙˆØ§ØªØ¨ ÙˆØ§Ù„Ù…ØµØ±ÙˆÙØ§Øª" },
  managePrecedents: { label: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©", desc: "Ø¥Ø¶Ø§ÙØ© ÙˆØªØµÙ†ÙŠÙ Ø§Ù„Ø³ÙˆØ§Ø¨Ù‚ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©" },
  viewReports: { label: "Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©", desc: "Ø§Ù„Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ø£Ø¯Ø§Ø¡ ÙˆØ§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø¹Ø§Ù…Ø©" },
  exportData: { label: "ØªØµØ¯ÙŠØ± ÙˆØ§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠØ©", desc: "ØªØµØ¯ÙŠØ± Ù‚ÙˆØ§Ø¹Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙƒØªØ¨ Ø¨ØµÙŠØºØ© JSON Ùˆ PDF" },

  // ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø°Ù ÙˆØ§Ù„Ø±Ù‚Ø§Ø¨Ø©
  deleteCases: { label: "Ø­Ø°Ù Ù…Ù„ÙØ§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", desc: "Ø­Ø°Ù ÙˆØªØµÙÙŠØ© Ù…Ù„ÙØ§Øª ÙˆØ³Ø¬Ù„Ø§Øª Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹" },
  deleteClients: { label: "Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†", desc: "Ø­Ø°Ù Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø£Ø·Ø±Ø§Ù Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù…" },
  deleteHearings: { label: "Ø­Ø°Ù Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ø±ÙˆÙ„", desc: "Ø­Ø°Ù Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆØ¬Ø¯Ø§ÙˆÙ„ Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©" },
  deleteTasks: { label: "Ø­Ø°Ù ÙˆØªÙØ±ÙŠØº Ø§Ù„Ù…Ù‡Ø§Ù…", desc: "Ø­Ø°Ù ÙˆØªÙØ±ÙŠØº Ø§Ù„ØªÙƒÙ„ÙŠÙØ§Øª ÙˆØ§Ù„Ù…Ù‡Ø§Ù…" },
  deleteDocs: { label: "Ø­Ø°Ù ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ø£Ø±Ø´ÙŠÙ", desc: "Ø­Ø°Ù Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ù…Ø°ÙƒØ±Ø§Øª Ø§Ù„Ù…Ø±ÙÙˆØ¹Ø©" },
  deletePoas: { label: "Ø­Ø°Ù Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", desc: "Ø¥Ù„ØºØ§Ø¡ ÙˆØ­Ø°Ù Ù‚ÙŠÙˆØ¯ Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©" },
  deleteAgreements: { label: "Ø­Ø°Ù Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨", desc: "Ø­Ø°Ù Ø§ØªÙØ§Ù‚ÙŠØ§Øª ÙˆØ¹Ù‚ÙˆØ¯ Ø§Ù„Ø£ØªØ¹Ø§Ø¨" },
  deleteInvoices: { label: "Ø­Ø°Ù Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶", desc: "Ø­Ø°Ù Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ³Ù†Ø¯Ø§Øª Ø§Ù„ØªØ­ØµÙŠÙ„ Ø§Ù„Ù…Ø§Ù„ÙŠØ©" },
  deleteKyc: { label: "Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª KYC ÙˆÙ‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø­Ø¸Ø±", desc: "Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª ÙØ­Øµ Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„ ÙˆÙ‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø­Ø¸Ø±" },
  deleteEmployees: { label: "Ø­Ø°Ù Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† (HR)", desc: "Ø­Ø°Ù Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙƒØ§Ø¯Ø± Ø§Ù„ÙˆØ¸ÙŠÙÙŠ" },
  deletePrecedents: { label: "Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©", desc: "Ø­Ø°Ù Ø§Ù„Ø³ÙˆØ§Ø¨Ù‚ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„ØªÙ…ÙŠÙŠØ²ÙŠØ©" },
  deleteUsers: { label: "Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†", desc: "Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ§Ù„Ù…ÙˆØ¸ÙÙŠÙ†" },
  deleteContacts: { label: "Ø­Ø°Ù Ø¬Ù‡Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ§Ù„Ø¯Ù„ÙŠÙ„", desc: "Ø­Ø°Ù Ø¨ÙŠØ§Ù†Ø§Øª Ø¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆØ¬Ù‡Ø§Øª Ø§Ù„ØªÙˆØ§ØµÙ„" },
};

const seedUsers: UserItem[] = [
  {
    id: 1,
    name: "Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ",
    email: "info@lawyersuood.com",
    phone: "0501234567",
    password: "123456",
    roleTitle: "Ù…Ø­Ø§Ù…Ù Ø´Ø±ÙŠÙƒ / Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…",
    roleKey: "admin",
    status: "Ù†Ø´Ø·",
    avatarBg: "bg-[#0c4a47]",
    avatarText: "Ø³Ø´",
    permissions: ROLE_PRESETS.admin.permissions
  }
];

export const seedFeeAgreements: FeeAgreement[] = [];

export const seedPayments: PaymentReceipt[] = [];

const seedClients: Client[] = [
  { id: 101, name: "ÙÙˆØ²ÙŠØ© Ø§Ø­Ù…Ø¯ Ø¹ØªÙŠÙ‚ Ø¹Ù„ÙŠ Ø§Ù„Ù…Ù‡ÙŠØ±ÙŠ", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 102, name: "Ø®Ø· Ø§Ù„Ø³Ù…Ø§Ø¡ Ù„ØµÙ†Ø§Ø¹Ø© Ø¹ÙˆØ§Ø¯Ù… Ø§Ù„Ø³ÙŠØ§Ø±Ø§Øª- Ù…Ø¤Ø³Ø³Ø© ÙØ±Ø¯ÙŠØ©", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 103, name: "Ø¯Ø§Ø± Ø³Ù…Ø±Ø§ Ù„Ù„ÙƒÙ…Ø¨ÙŠÙˆØªØ± Ø°.Ù….Ù… Dar Samra Computer L.L.C", type: "Ø´Ø±ÙƒØ©", idNo: "100331456200003", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª", taxNo: "100331456200003" },
  { id: 104, name: "Ø¨Ø±ÙŠØ¯Ø¬ Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØªØ±Ø¬Ù…Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 105, name: "PAKIZA PROPERTIES L.L.C Ø¨Ø§ÙƒÙŠØ²Ø§ Ù„Ù„Ø¹Ù‚Ø§Ø±Ø§Øª Ø´.Ø°.Ù….Ù…", type: "Ø´Ø±ÙƒØ©", idNo: "105100974200003", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ", taxNo: "105100974200003" },
  { id: 106, name: "JOAN DAYAN CASTILLO", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "PH", address: "Ø§Ù„ÙÙ„Ø¨ÙŠÙ†" },
  { id: 107, name: "Ø§Ø¨Ùˆ Ø¨ÙƒØ± Ø¹Ø¨Ø¯Ø§Ù„Ø¹Ø²ÙŠØ² Ø·Ù„Ø­Ø©", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "SD", address: "Ø§Ù„Ø³ÙˆØ¯Ø§Ù†" },
  { id: 108, name: "Anthropic, PBC", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 109, name: "Ù…Ø­Ù…Ø¯ Ø³Ù„Ø·Ø§Ù† Ø§Ù„Ø´Ø§Ù…Ø³ÙŠ", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 110, name: "Ø§Ø­Ù…Ø¯ Ù…Ø®ØªØ§Ø± Ø¹ÙŠØ¯ Ù…Ø­Ù…Ø¯", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "EG", address: "Ù…ØµØ±" },
  { id: 111, name: "aly mohsmed aly mohamed rehan", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "EG", address: "Ù…ØµØ±" },
  { id: 112, name: "Ø¨Ù†Ùƒ Ø§Ù„Ù…Ø§Ø±ÙŠØ© Ø§Ù„Ù…Ø­Ù„ÙŠ", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 113, name: "Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø§Ø¨ØªÙƒØ§Ø± Ù„Ù„Ø­Ù„ÙˆÙ„ Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ©", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 114, name: "Ø´Ù…Ø§ Ø¬Ù…Ø§Ù„ Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø³Ø§Ù„Ù… Ø§Ù„Ø³ÙˆÙŠØ¯ÙŠ shamma jamal abdalla salim alsuwaidi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "shammaalsuwaidi5555@outlook.com", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 115, name: "Ù‡ÙˆÙ†Ø¬ ÙƒÙˆÙ†Ø¬ Ù„ØªØ¬Ø§Ø±Ø© Ø£Ø¯ÙˆØ§Øª Ø§Ù„ØªØ¬Ù…ÙŠÙ„ Ø´.Ø°.Ù….Ù… HONG KONG COSMETICS TRADING L.L.C", type: "Ø´Ø±ÙƒØ©", idNo: "104912672300003", phone: "", email: "hkcosmetics.pro@gmail.com", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª", taxNo: "104912672300003" },
  { id: 116, name: "Ø§Ù„Ø§ÙˆØ§Ø¦Ù„ Ù„ØµÙ†Ø§Ø¹Ø© Ø§Ù„Ø¨Ù„Ø§Ø³ØªÙƒ Ø°.Ù….Ù… Al-Awail Plastic Manufacturing LLC", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "Alawaelplasticindustry@gmail.com", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 117, name: "Ù…Ø­Ù…Ø¯ ØµØ¯Ø§Ù… Ù…Ø­Ù…Ø¯ Ù†ÙˆØ§Ø² Muhammad Saddam Muhammad Nawaz", type: "ÙØ±Ø¯", idNo: "", phone: "0501043543", email: "sadamnawaz23006@gmail.com", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 118, name: "Day to day", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 119, name: "Ø¯Ø§Ø± Ø§Ù„Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ø´Ø§Ø±Ù‚Ø©-Sharjah Court House", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 120, name: "Ù…Ù‡Ù†Ø¯ ØµØ§Ù„Ø­- Muhannad Saleh", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "Mohaneds45@hotmail.com", emirate: "GB", address: "Ø§Ù„Ù…Ù…Ù„ÙƒØ© Ø§Ù„Ù…ØªØ­Ø¯Ø©" },
  { id: 121, name: "Ø§Ù„Ø£Ø³ØªØ§Ø° Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ / Ù‡ÙŠØ«Ù… Ø§Ø­Ù…Ø¯ Ø³ÙŠÙ Ø§Ù„Ø¹Ø§Ù…Ø±ÙŠ-Lawyer/Professor Haitham Ahmed Saif Al-Amri", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 122, name: "Ø§Ù„ØµØ§ÙÙŠ Ù„ØªÙ†Ù‚ÙŠØ© Ù…ÙŠØ§Ù‡ Ø§Ù„Ø´Ø±Ø¨-Al Safi for drinking water purification", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 123, name: "Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ù„Ù…Ø¹Ø§Ø´Ø§Øª-General Authority for Pensions", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 124, name: "Ø§Ù„Ø´ÙˆØ¤Ù† Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙÙŠ Ø¯Ø¨ÙŠ-Legal Affairs in Dubai", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 125, name: "Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ© Ù„Ù„Ø¶Ø±Ø§Ø¦Ø¨-Federal Tax Authority", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 126, name: "FEDERAL TAX AUTHORITY", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 127, name: "Ø§Ø±Ø§Ù…ÙƒØ³- Aramex", type: "Ø´Ø±ÙƒØ©", idNo: "100212963100003", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª", taxNo: "100212963100003" },
  { id: 128, name: "name.com", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 129, name: "GOOGEL", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 130, name: "ÙˆØ²Ø§Ø±Ø© Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ÙˆØ§Ù„ØªÙˆØ·ÙŠÙ†-Ministry of Human Resources and Emiratization", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 131, name: "Ø§Ø­Ù…Ø¯ Ø·Ù„Ø§Ù„ Ø§Ù„ÙŠÙ…Ù†- Ahmed Talal Yemen", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "LB", address: "Ù„Ø¨Ù†Ø§Ù†" },
  { id: 132, name: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†Ù…ÙŠØ© Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© Ø¨Ø´Ø§Ø±Ù‚Ø©-Sharjah Department of Economic Development", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 133, name: "Ø¨Ø®ÙŠØªÙ‡ ØµØ§Ù„Ø­ Ø±Ø§Ø´Ø¯ Ø±Ø§Ø´Ø¯ Ø§Ù„Ù…Ù†ØµÙˆØ±ÙŠ-Bakhita Saleh Rashid Rashid Al Mansouri", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 134, name: "Usk zinc industries", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "mohammadumer.khalid@hotmail.com", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 135, name: "Elin foodstuff treding", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 136, name: "PNP GLOBAL SUPPLY COMPANY LIMITED", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "+84911330257", email: "michael.hua@pnpglobalsupply.com", emirate: "VN", address: "ÙÙŠØªÙ†Ø§Ù…" },
  { id: 137, name: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†Ù…ÙŠØ© Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© Ø§Ù„Ø´Ø§Ø±Ù‚Ø©-Sharjah Department of Economic Development", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 138, name: "Sharjah Electricity & Water Authority", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "100394961500003", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", taxNo: "100394961500003" },
  { id: 139, name: "Ù…Ø­Ù…Ø¯ Ø¹Ù…Ø± Ø¨Ù† Ø®Ø§Ù„Ø¯ Ø®Ø§Ù„Ø¯ Ø¨Ø´ÙŠØ±-Muhammad Omar bin Khalid Khalid Bashir", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "PK", address: "Ø¨Ø§ÙƒØ³ØªØ§Ù†" },
  { id: 140, name: "Ù†Ø³Ø±ÙŠÙ† Ø§Ù†Ø·ÙˆÙ†ÙŠÙˆØ³ Ø¸Ø§Ù‡Ø±-Nasreen Antonios Daher", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "SY", address: "Ø³ÙˆØ±ÙŠØ§" },
  { id: 141, name: "Ø®Ù„ÙŠÙØ© Ù…Ø­Ù…Ø¯ Ø§Ø­Ù…Ø¯ Ø¨ÙŠØ¨ÙŠ Ø§Ù„Ø´Ø­ÙŠ Khalifa Mohammed Ahmed Bibi Al Shehhi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 142, name: "Ø¨Ø¯Ø± Ø³Ø¹ÙŠØ¯ Ø±Ø§Ø´Ø¯ Ø³Ø¹ÙŠØ¯ Ø§Ù„Ø­Ø¨Ø³ÙŠ-Badr Saeed Rashid Saeed Al Habsi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©", address: "Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©" },
  { id: 143, name: "Wafeq FZ LLC (Main)", type: "Ø´Ø±ÙƒØ©", idNo: "100584752800003", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª", taxNo: "100584752800003" },
  { id: 144, name: "METHAQ TAKAFUL INSURANCE COMPANY", type: "Ø´Ø±ÙƒØ©", idNo: "100000232700003", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª", taxNo: "100000232700003" },
  { id: 145, name: "MINISTRY OF JUSTICE", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 146, name: "du", type: "Ø´Ø±ÙƒØ©", idNo: "100001397700003", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª", taxNo: "100001397700003" },
  { id: 147, name: "Ù…Ø­Ù…Ø¯ Ø§Ø­Ù…Ø¯ Ø¹Ø¨ÙŠØ¯ Ø¨Ù† Ø¬Ø±Ø´ Ø§Ù„ÙÙ„Ø§Ø³ÙŠ-Mohammed Ahmed Obeid between Jarash Al-Fals", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "M.falasi87@gmail.com", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 148, name: "Ù†Ø§Ø¹ÙˆÙ…ÙŠ ÙƒÙ…Ø§Ù„ Ø§Ù„Ø¯ÙŠÙ† Ø¸Ø±ÙŠÙ-Naomi Kamal El-Din Zarif", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 149, name: "Ø¹Ø²Ø© Ø±Ø§Ø´Ø¯ Ø³Ø¹ÙŠØ¯ Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø´Ù…ÙŠÙ„ÙŠ-Azza Rashid Saeed Saad Al-Shumaili", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 150, name: "Ù…Ø­Ù…Ø¯ ØµØ§Ù„Ø­-Muhammad Saleh", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 151, name: "Ù…Ø±ÙŠÙ… Ù…Ø­Ù…Ø¯ Ø±Ø§Ø´Ø¯-Maryam Mohammed Rashid", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 152, name: "Ù†ÙˆØ± Ø¹Ù…Ø§Ø¯ Ø§Ù„Ø¯ÙŠÙ† Ø¥Ø¨Ø±Ø§Ù‡ÙŠÙ…-Nour Emad El-Din Ibrahim", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 153, name: "USK METALS L L C", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 154, name: "Ø²ÙŠÙ†Ø¨ Ø¨Ù†Øª Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø¨Ù† ØºÙ„ÙˆÙ… Ø§Ù„Ø¨Ù„ÙˆØ´ÙŠØ©-Zainab bint Abdullah bin Ghloum Al Balushi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 155, name: "Ø®Ø§Ù„Ø¯ Ø®Ù„ÙŠÙØ© Ø¹Ø¨ÙŠØ¯ Ø§Ù„ØºÙˆÙ„-Khaled Khalifa Obaid Al-Ghul", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 156, name: "Ø¹Ù…Ø± Ù…ØµØ·ÙÙ‰ Ø¹ÙŠØ¯ Ù…Ø­Ù…Ø¯-Omar Mustafa Eid Muhammad", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 157, name: "Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ù…Ø­Ù…Ø¯ Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø§Ù„Ù…Ø§Ø²Ù…ÙŠ-Abdullah Mohammed Abdullah Al Mazmi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 158, name: "Ø£Ù…ÙŠØ± Ø­Ø³ÙŠÙ† Ø¬ÙˆØ§Ø¯ Ø§Ù‚Ø§Ø¨Ø§Ø¨Ø§Ù†ÙŠ-Amir Hussein Jawad Aghababani", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "IR", address: "Ø¥ÙŠØ±Ø§Ù†" },
  { id: 159, name: "Ø¹Ø°Ø§Ø±ÙŠ Ø³Ø¹ÙŠØ¯ Ù…Ø­Ù…Ø¯ Ø§Ù„Ø¸Ù†Ø­Ø§Ù†ÙŠ Adhari Saeed Mohammed Al Dhanhani", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 160, name: "ÙŠØ¹Ù‚ÙˆØ¨ Ø­Ø³Ù† Ø£Ø­Ù…Ø¯ Ø§Ù„Ø¨Ù†Ø§-Yaqub Hassan Ahmed Al-Banna", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 161, name: "Ø¹Ù„Ø§ ØªØ­Ø³ÙŠÙ† Ø¹Ø¨Ø¯Ø§Ù„Ø±Ø¤Ù Ø§Ù„ÙØ§Ø±Ø³-Alaa Tahseen Abdul Raouf Al-Fares", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "DM", address: "Ø¯ÙˆÙ…ÙŠÙ†ÙŠÙƒØ§" },
  { id: 162, name: "Ù†Ø§Ø¯ÙŠØ© ÙŠÙˆÙ†Ø³ Ø¹Ø«Ù…Ø§Ù†- Nadia Younes Othman", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 163, name: "Ø§Ø­Ù…Ø¯ Ø±Ø§Ø´Ø¯ Ø§Ù„Ø´Ù…ÙŠÙ„ÙŠ- Ahmed Rashid Al-Shumaili", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 164, name: "Ø§Ù…ÙŠÙ†Ø© Ø¢Ù„ Ø¨ÙŠØ§Øª Amina Al-Bayat", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 165, name: "Ø¹Ù…Ø± Ù…ØµØ·ÙÙ‰ Ø¹ÙŠØ¯ Ù…Ø­Ù…Ø¯ (ØªØ§Ø¨ÙŠ ) Omar Mustafa Eid Muhammad (Tabi)", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 166, name: "Ø®Ø§Ù„Ø¯ Ø¨Ø´ÙŠØ± Ø£ÙˆØ§Ù† Ù…Ø­Ù…Ø¯ Ø¨Ø´ÙŠØ± Ø§Ø®ØªØ± Khaled Bashir Awan Mohammed Bashir Akhtar", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "PK", address: "Ø¨Ø§ÙƒØ³ØªØ§Ù†" },
  { id: 167, name: "Ø¥Ø¨Ø±Ø§Ù‡ÙŠÙ… Ù…Ø­Ø³Ù† Ù‚Ø§Ø³Ù… Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ibrahim Mohsen Qasim Abdullah", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯ÙˆÙ„ÙŠ", address: "Ø¯ÙˆÙ„ÙŠ" },
  { id: 168, name: "Ø´Ø±ÙƒØ© Ø¯Ùˆ  Du company", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 169, name: "sewa", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 170, name: "ÙØ§Ø±ÙˆÙ‚ Ø§Ø­Ù…Ø¯ ØºÙ„Ø§Ù… Ø§ÙƒØ¨Ø±-Farooq Ahmed Ghulam Akbar", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "PK", address: "Ø¨Ø§ÙƒØ³ØªØ§Ù†" },
  { id: 171, name: "ÙŠØ§Ø±ÙˆØ³Ù„Ø§ÙØ§ Ø²ÙˆÙ„ÙŠÙ†Ø§ Yaroslava Zolina", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "UA", address: "Ø£ÙˆÙƒØ±Ø§Ù†ÙŠØ§" },
  { id: 172, name: "Ø±Ø§Ø´Ø¯ Ø®Ù…ÙŠØ³ ÙØ§ÙŠØ² Ø®Ù…ÙŠØ³ Ù…Ø¨Ø§Ø±Ùƒ-Rashid Khamis Fayez Khamis Mubarak", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 173, name: "Ù…Ø­Ù…Ø¯ Ø¹Ø¨Ø¯Ø§Ù„Ù‚Ø§Ø¯Ø± Ø³Ù„ÙŠÙ…Ø§Ù† Ø­Ø§Ù…Ø¯ Mohammed Abdul Qader Suleiman Hamed", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "JO", address: "Ø§Ù„Ø£Ø±Ø¯Ù†" },
  { id: 174, name: "ØµÙ„Ø§Ø­ Ø­Ø³ÙŠÙ† Ø­Ø³Ù† ØªÙ‡Ù„Ùƒ Salah Hussein Hassan perished", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 175, name: "Ø®Ù…ÙŠØ³ Ø³Ø¹ÙŠØ¯ Ø³Ø§Ø§Ø¹Ø¯ Ø§Ù„Ø­Ø¨Ø³ÙŠ Khamis Saeed Saad Al Habsi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 176, name: "ÙƒÙ…Ø§Ù„ Ø³Ø§Ù„Ù… Ø±Ø§Ø´Ø¯ Ø§Ù„ÙŠÙ…Ø§Ø­ÙŠ Kamal Salem Rashid Al-Yamahi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 177, name: "Ù…Ø­Ù…Ø¯ Ø®Ù„ÙŠÙØ© Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø¬Ø§Ø³Ù… Mohammed Khalifa Abdullah Jassim", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 178, name: "ÙƒÙ…Ø§Ù„ Ù…ÙˆØ³ÙŠ Ø­Ø¨ÙŠØ¨ Ø­Ø³Ù† Ø§Ù„ÙŠÙˆØ³Ù Kamal Moussa Habib Hassan Al-Youssef", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 179, name: "Ù…Ø­Ù…ÙˆØ¯ Ù…Ø­Ù…Ø¯ ØºÙ„Ø§ÙˆÙ†Ø¬ÙŠ Mahmoud Muhammad Ghalaounji", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "EG", address: "Ù…ØµØ±" },
  { id: 180, name: "Ø´ÙŠÙ…Ø§Ø¡ Ø³Ø¹ÙŠØ¯ Ø±Ø§Ø´Ø¯ Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø­Ø¨Ø³ÙŠ-Shaima Saeed Rashid Saad Al Habsi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 181, name: "Ø³Ø§Ù…ÙŠ Ù…Ø­Ø±ÙˆØ³ Ø¹Ø¨Ø¯Ø§Ù„ØºÙ†ÙŠ Ù…Ø´Ø¹Ù„-Sami Mahrous Abdelghani Mashal", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "EG", address: "Ù…ØµØ±" },
  { id: 182, name: "Ø±Ø§ÙÙŠ Ø§ÙƒÙˆØ¨ Ù‚Ø±Ù‡ Ø¨ØªÙŠØ§Ù†-Rafi Akop Karabetian", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "LB", address: "Ù„Ø¨Ù†Ø§Ù†" },
  { id: 183, name: "ÙˆØ²Ø§Ø±Ø© Ø§Ù„Ø¹Ø¯Ù„- Ministry of Justice", type: "Ø¬Ù‡Ø© Ø­ÙƒÙˆÙ…ÙŠØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 184, name: "Ù…Ø¤Ø³Ø³Ø© Ø±ÙˆØ§Ø¯-Pioneers Foundation", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 185, name: "Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø§Ù„Ø±Ø³ØªÙ…Ø§Ù†ÙŠ Ù„Ù„Ø¹Ù‚Ø§Ø±Ø§Øª-Abdullah Al Rostamani Real Estate", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 186, name: "Ø¥Ø¨Ø±Ø§Ù‡ÙŠÙ… Ø¹Ù„ÙŠ Ø¹Ø¨Ø§Ø³ Ø¨ÙŠØ´ÙˆÙ‡ Ø§Ù„Ø¨Ù„ÙˆØ´ÙŠ-Ibrahim Ali Abbas Bishouh Al-Balushi", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "AE", address: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" },
  { id: 187, name: "Ø§Ø­Ù…Ø¯ Ø­Ø³Ù† Ø­Ø³Ù†Ù‰ ÙƒØ§Ù…Ù„ Ø¬Ø§ÙˆÙŠØ´", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 188, name: "Ø¬ÙˆÙ†Ø§ØªÙ‡Ø§Ù† Ø¬Ø§Ø±ÙÙŠÙ† Ø¯ÙŠÙ…ÙŠØ³Ø§", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 189, name: "ÙˆØ±Ø¯Ù‡ Ù…Ø¨Ø§Ø±Ùƒ Ø³Ø§Ù„Ù… Ø¨Ù† Ø²ÙˆØ¨Ø¹", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 190, name: "Ø§Ø·Ù„Ø§Ù†ØªØ³ Ù„Ù„Ù…Ø·Ø§Ø¨Ø® Ø´.Ø°.Ù….Ù…", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 191, name: "Ù…ÙŠØ³ Ù…Ù†Ø°Ø± Ø³Ø¹Ø¯ Ø§Ù„Ø¯ÙŠÙ† ØºÙˆØ´Ù‡", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 192, name: "ÙˆØµØ§Ù„ Ø¹Ø«Ù…Ø§Ù† Ù…Ø­Ù…Ø¯ Ø¹Ù„Ù‰", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 193, name: "Ø³ÙŠØ±ÙˆØ³ Ù…Ø§Ù„Ùƒ Ù‡Ø§Ù…ÙŠÙ„ØªÙˆÙ†", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 194, name: "Ù…Ø­Ù…Ø¯ ØµÙ„Ø§Ø­ Ø§Ù„Ø³ÙŠØ¯ Ù…Ø­Ù…Ø¯ Ù‚Ù†Ø¯ÙŠÙ„", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 195, name: "Ø´Ø§Ù‡ Ø§ÙŠØ±Ø§Ù† Ø³ÙŠØ¯ ÙˆÙ‡Ø§Ø¨", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©", address: "Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©" },
  { id: 196, name: "Ø´Ø§Ù…Ø§ Ø®Ø§Ù„Ø¯ Ø¹ÙˆØ§Ù† Ø®Ø§Ù„Ø¯ Ø¨Ø´ÙŠØ±", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¹Ø¬Ù…Ø§Ù†", address: "Ø¹Ø¬Ù…Ø§Ù†" },
  { id: 197, name: "Ø´Ø±ÙƒØ© Ø¨Ø®ØªÙˆØ§Ø± Ø¬Ù†Ø±Ø§Ù„ ØªØ±ÙŠØ¯Ù†Ø¬", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø¹Ø¬Ù…Ø§Ù†", address: "Ø¹Ø¬Ù…Ø§Ù†" },
  { id: 198, name: "Ù…Ø­Ù…Ø¯ Ø¨Ù† Ø­ÙŠØ¯Ø± Ø¨Ù† Ø­Ø³Ù† Ø§Ù„Ø§Ø®Ø¶Ø±", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¹Ø¬Ù…Ø§Ù†", address: "Ø¹Ø¬Ù…Ø§Ù†" },
  { id: 199, name: "Ø§Ù„Ø´Ø±ÙƒØ© Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ© Ù„Ù„Ø³ÙŠØ§Ø±Ø§Øª ÙˆØ§Ù„Ù…Ø¹Ø¯Ø§Øª Ø§ÙŠÙ…ÙƒÙˆ Ø§Ù„Ù…Ø­Ø¯ÙˆØ¯Ø©", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 200, name: "Ø§Ù„Ù…Ø§Ù…ÙˆÙ† Ù„Ù„Ø§Ø³ØªÙŠØ±Ø§Ø¯ ÙˆØ§Ù„ØªØµØ¯ÙŠØ± - Ù…Ø¤Ø³Ø³Ø© ÙØ±Ø¯ÙŠØ© - ÙŠÙ…Ø«Ù„Ù‡Ø§ Ø­Ø³Ù† Ø¹Ù„Ù‰ Ø­Ø³Ù† ÙŠÙ…Ù„ÙˆÙ‡", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 201, name: "Ø¹Ø¨Ø¯ Ø§Ù„Ø¹Ø²ÙŠØ² Ø·Ù„Ø­Ø© Ø¹Ù„Ù‰ Ù…Ø­Ù…Ø¯", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 202, name: "ÙˆÙØ§Ø¡ Ø§Ø³Ù…Ø§Ø¹ÙŠÙ„ Ù…Ø¨Ø§Ø±Ùƒ Ø§Ù„Ø´Ø±ÙŠÙ", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "ÙƒÙ„Ø¨Ø§Ø¡ - Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 203, name: "Ø¹Ø¯Ù†Ø§Ù† Ø§Ø­Ù…Ø¯ ØµÙˆÙØ§Ù†", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 204, name: "Ù…ÙˆØ²Ù‡ Ø§Ø­Ù…Ø¯ Ø±Ø§Ø´Ø¯ Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø§Ù„Ø´Ø§Ù…Ø³Ù‰", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 205, name: "Ù…ØµØ·ÙÙ‰ ØµØ§Ù„Ø­ Ø±Ø²Ù‚ Ø§Ù„Ø³Ø¨ÙˆÙ„", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 206, name: "Ø¨Ø§Ù†ÙŠØ¨Ø§Ù„ Ø³Ø§Ø±Ø¬ÙŠØ²ÙŠ", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 207, name: "Ù…Ø­Ù…Ø¯ Ø§Ø­Ù…Ø¯ Ù„ÙÙ„Ø§Ø³ÙŠ", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 208, name: "Ø¹Ù…Ø± Ø®Ø§Ù„Ø¯", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©", address: "Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©" },
  { id: 209, name: "Ù†ÙˆÙ", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©", address: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" },
  { id: 210, name: "Ø¯ÙŠ ØªÙŠ Ø³ÙŠ Ù„Ù„ØªØ¬Ø§Ø±Ø© Ø§Ù„Ø¹Ø§Ù…Ø© Ø´.Ø°.Ù….Ù…", type: "Ø´Ø±ÙƒØ©", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" },
  { id: 211, name: "Ø´Ù‡Ø±Ø§Ù… Ø¹Ø§Ø¨Ø¯Ù‰", type: "ÙØ±Ø¯", idNo: "", phone: "", email: "", emirate: "Ø¯Ø¨ÙŠ", address: "Ø¯Ø¨ÙŠ" }
];

const seedCases: CaseItem[] = [
  {
    id: 201,
    number: "565/2026",
    clientId: 135, // Ø§ÙŠÙ„ÙŠÙ† Ù„ØªØ¬Ø§Ø±Ø© Ø§Ù„Ù…ÙˆØ§Ø¯ Ø§Ù„ØºØ°Ø§Ø¦ÙŠØ© (Ø´.Ø°.Ù….Ù…)
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ù…Ø¯Ù†ÙŠØ© Ø¹Ø¬Ù…Ø§Ù†",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ -",
    openDate: "",
    fee: 0
  },
  {
    id: 202,
    number: "72/2026",
    clientId: 153, // ÙŠÙˆ Ø§Ø³ ÙƒÙŠØ© Ù„Ù„Ù…Ø¹Ø§Ø¯Ù† Ø°.Ù….Ù… Ø®Ø§Ù„Ø¯ Ø¨Ø´ÙŠØ± Ø§ÙˆØ§Ù† Ù…Ø­Ù…Ø¯ Ø¨Ø´ÙŠØ± Ø§Ø®ØªØ±
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ© Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ©",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ -",
    openDate: "",
    fee: 0
  },
  {
    id: 203,
    number: "1324/2025",
    clientId: 156, // Ø¹Ù…Ø± Ù…ØµØ·ÙÙ‰ Ø¹ÙŠØ¯ Ù…Ø­Ù…Ø¯
    opponent: "",
    type: "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ©",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© - (Ø¯Ø¹ÙˆÙ‰ Ù†Ø³Ø¨ Ø§Ø«Ø¨Ø§Øª / Ø§Ù†ÙƒØ§Ø±)",
    openDate: "",
    fee: 0
  },
  {
    id: 204,
    number: "1032 / 2025",
    clientId: 187, // Ø§Ø­Ù…Ø¯ Ø­Ø³Ù† Ø­Ø³Ù†Ù‰ ÙƒØ§Ù…Ù„ Ø¬Ø§ÙˆÙŠØ´
    opponent: "",
    type: "Ù…Ø¯Ù†ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ù…Ø¯Ù†ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 205,
    number: "925 / 2025",
    clientId: 182, // Ø±Ø§ÙÙ‰ Ø§ÙƒÙˆØ¨ Ù‚Ø±Ù‡ Ø¨ØªÙŠØ§Ù†
    opponent: "",
    type: "ØªÙ†ÙÙŠØ°ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù ØªÙ†ÙÙŠØ° ØªØ¬Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 206,
    number: "357 / 2024",
    clientId: 188, // Ø¬ÙˆÙ†Ø§ØªÙ‡Ø§Ù† Ø¬Ø§Ø±ÙÙŠÙ† Ø¯ÙŠÙ…ÙŠØ³Ø§
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù ØªØ¬Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 207,
    number: "282 / 2024",
    clientId: 189, // ÙˆØ±Ø¯Ù‡ Ù…Ø¨Ø§Ø±Ùƒ Ø³Ø§Ù„Ù… Ø¨Ù† Ø²ÙˆØ¨Ø¹
    opponent: "",
    type: "Ø¹Ù‚Ø§Ø±ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¹Ù‚Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 208,
    number: "92 / 2024",
    clientId: 190, // Ø§Ø·Ù„Ø§Ù†ØªØ³ Ù„Ù„Ù…Ø·Ø§Ø¨Ø® Ø´.Ø°.Ù….Ù…
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ù„ØªÙ…Ø§Ø³ Ø¥Ø¹Ø§Ø¯Ø© Ù†Ø¸Ø± ØªØ¬Ø§Ø±ÙŠ-Ø§Ø³ØªØ¦Ù†Ø§Ù",
    openDate: "",
    fee: 0
  },
  {
    id: 209,
    number: "286 / 2024",
    clientId: 182, // Ø±Ø§ÙÙ‰ Ø§ÙƒÙˆØ¨ Ù‚Ø±Ù‡ Ø¨ØªÙŠØ§Ù†
    opponent: "",
    type: "Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡",
    openDate: "",
    fee: 0
  },
  {
    id: 210,
    number: "1475 / 2023",
    clientId: 191, // Ù…ÙŠØ³ Ù…Ù†Ø°Ø± Ø³Ø¹Ø¯ Ø§Ù„Ø¯ÙŠÙ† ØºÙˆØ´Ù‡
    opponent: "",
    type: "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ© ÙˆÙ…ÙˆØ§Ø±ÙŠØ«",
    openDate: "",
    fee: 0
  },
  {
    id: 211,
    number: "1447 / 2023",
    clientId: 191, // Ù…ÙŠØ³ Ù…Ù†Ø°Ø± Ø³Ø¹Ø¯ Ø§Ù„Ø¯ÙŠÙ† ØºÙˆØ´Ù‡
    opponent: "",
    type: "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ© ÙˆÙ…ÙˆØ§Ø±ÙŠØ«",
    openDate: "",
    fee: 0
  },
  {
    id: 212,
    number: "436 / 2022",
    clientId: 192, // ÙˆØµØ§Ù„ Ø¹Ø«Ù…Ø§Ù† Ù…Ø­Ù…Ø¯ Ø¹Ù„Ù‰
    opponent: "",
    type: "Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡",
    openDate: "",
    fee: 0
  },
  {
    id: 213,
    number: "470 / 2020",
    clientId: 192, // ÙˆØµØ§Ù„ Ø¹Ø«Ù…Ø§Ù† Ù…Ø­Ù…Ø¯ Ø¹Ù„Ù‰
    opponent: "",
    type: "Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡",
    openDate: "",
    fee: 0
  },
  {
    id: 214,
    number: "1211/2025",
    clientId: 164, // Ø§Ù…ÙŠÙ†Ù‡ Ø§Ù„ Ø¨ÙŠØ§Øª
    opponent: "",
    type: "Ù…Ø¯Ù†ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ©",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ù…Ø¯Ù†ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 215,
    number: "1862/2025",
    clientId: 193, // Ø³ÙŠØ±ÙˆØ³ Ù…Ø§Ù„Ùƒ Ù‡Ø§Ù…ÙŠÙ„ØªÙˆÙ†
    opponent: "",
    type: "Ø¬Ø²Ø§Ø¦ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­ Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­",
    openDate: "",
    fee: 0
  },
  {
    id: 216,
    number: "1543/2024",
    clientId: 187, // Ø§Ø­Ù…Ø¯ Ø­Ø³Ù† Ø­Ø³Ù†Ù‰ ÙƒØ§Ù…Ù„ Ø¬Ø§ÙˆÙŠØ´
    opponent: "",
    type: "Ø¬Ø²Ø§Ø¦ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­ Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­",
    openDate: "",
    fee: 0
  },
  {
    id: 217,
    number: "7362/2022",
    clientId: 194, // Ù…Ø­Ù…Ø¯ ØµÙ„Ø§Ø­ Ø§Ù„Ø³ÙŠØ¯ Ù…Ø­Ù…Ø¯ Ù‚Ù†Ø¯ÙŠÙ„
    opponent: "",
    type: "Ø¬Ø²Ø§Ø¦ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­ Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­",
    openDate: "",
    fee: 0
  },
  {
    id: 218,
    number: "1584/2026",
    clientId: 166, // Ø®Ø§Ù„Ø¯ Ø¨Ø´ÙŠØ± Ø§ÙˆØ§Ù† Ù…Ø­Ù…Ø¯ Ø¨Ø´ÙŠØ± Ø§Ø®ØªØ±
    opponent: "",
    type: "Ø¬Ø²Ø§Ø¦ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­ Ø¹Ø¬Ù…Ø§Ù†",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­",
    openDate: "",
    fee: 0
  },
  {
    id: 219,
    number: "806/2025",
    clientId: 156, // Ø¹Ù…Ø± Ù…ØµØ·ÙÙŠ Ø¹ÙŠØ¯ Ù…Ø­Ù…Ø¯
    opponent: "",
    type: "Ø¬Ø²Ø§Ø¦ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­ Ø¹Ø¬Ù…Ø§Ù†",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­",
    openDate: "",
    fee: 0
  },
  {
    id: 220,
    number: "160/2025",
    clientId: 149, // Ø¹Ø²Ù‡
    opponent: "",
    type: "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ©",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø§Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 221,
    number: "816/2024",
    clientId: 170, // ÙØ§Ø±ÙˆÙ‚ Ø§Ø­Ù…Ø¯ ØºÙ„Ø§Ù… Ø§ÙƒØ¨Ø±
    opponent: "",
    type: "Ø¬Ø²Ø§Ø¦ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­ Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¬Ø²Ø§Ø¡",
    openDate: "",
    fee: 0
  },
  {
    id: 222,
    number: "852/2024",
    clientId: 195, // Ø´Ø§Ù‡ Ø§ÙŠØ±Ø§Ù† Ø³ÙŠØ¯ ÙˆÙ‡Ø§Ø¨
    opponent: "",
    type: "Ø¬Ø²Ø§Ø¦ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¬Ù†Ø­ Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¬Ø²Ø§Ø¡",
    openDate: "",
    fee: 0
  },
  {
    id: 223,
    number: "783/2026",
    clientId: 196, // Ø´Ø§Ù…Ø§ Ø®Ø§Ù„Ø¯ Ø¹ÙˆØ§Ù† Ø®Ø§Ù„Ø¯ Ø¨Ø´ÙŠØ±
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ù…Ø¯Ù†ÙŠØ© Ø¹Ø¬Ù…Ø§Ù†",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ - Ù…Ø·Ø§Ù„Ø¨Ø§Øª Ù…Ø§Ù„ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 224,
    number: "84/2026",
    clientId: 153, // ÙŠÙˆ Ø§Ø³ ÙƒÙŠØ© Ù„Ù„Ù…Ø¹Ø§Ø¯Ù† Ø°.Ù….Ù… -Ø®Ø§Ù„Ø¯ Ø¨Ø´ÙŠØ±
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ© Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ©",
    judge: "",
    status: "Ù…Ù†ØªÙ‡ÙŠØ©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 301,
    number: "2026/450",
    clientId: 197,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 302,
    number: "2026/240",
    clientId: 153,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 303,
    number: "2026/241",
    clientId: 153,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 304,
    number: "2026/322",
    clientId: 197,
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ - Ø§Ù„Ø¨Ù†ÙˆÙƒ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ù…Ø¯Ù†ÙŠØ© Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªØ¬Ø§Ø±ÙŠ - Ø§Ù„Ø¨Ù†ÙˆÙƒ",
    openDate: "",
    fee: 0
  },
  {
    id: 305,
    number: "2025/481",
    clientId: 153,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 306,
    number: "2025/5881",
    clientId: 135,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ - Ù…Ø·Ø§Ù„Ø¨Ø§Øª Ù…Ø§Ù„ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ - Ù…Ø·Ø§Ù„Ø¨Ø§Øª Ù…Ø§Ù„ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 307,
    number: "2025/881",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø© - Ø§Ù„ÙˆÙØ§Ø¡ Ø§Ù„ÙƒÙ„ÙŠ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ†",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø© - Ø§Ù„ÙˆÙØ§Ø¡ Ø§Ù„ÙƒÙ„ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 309,
    number: "2026/242",
    clientId: 153,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 310,
    number: "2026/514",
    clientId: 196,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ - Ø§Ù„Ø¨Ù†ÙˆÙƒ",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ - Ø§Ù„Ø¨Ù†ÙˆÙƒ",
    openDate: "",
    fee: 0
  },
  {
    id: 311,
    number: "2024/3909",
    clientId: 160,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠÙ‡ - Ø£Ù…Ø± Ø¹Ù„Ù‰ Ø¹Ø±ÙŠØ¶Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠÙ‡ - Ø£Ù…Ø± Ø¹Ù„Ù‰ Ø¹Ø±ÙŠØ¶Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 312,
    number: "2025/566",
    clientId: 198,
    opponent: "",
    type: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ø¹Ù…Ø§Ù„ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ø¹Ù…Ø§Ù„ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 313,
    number: "2025/569",
    clientId: 198,
    opponent: "",
    type: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ø¹Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ¯Ø¹Ø§ÙˆÙŠ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ø¹Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ¯Ø¹Ø§ÙˆÙŠ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 314,
    number: "2025/568",
    clientId: 198,
    opponent: "",
    type: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ø¹Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ¯Ø¹Ø§ÙˆÙŠ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ø¹Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ¯Ø¹Ø§ÙˆÙŠ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 315,
    number: "2025/1205",
    clientId: 156,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© - Ø¯Ø¹ÙˆÙ‰ Ù†Ø³Ø¨ (Ø§Ø«Ø¨Ø§Øª / Ø§Ù†ÙƒØ§Ø±)",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© - Ø¯Ø¹ÙˆÙ‰ Ù†Ø³Ø¨ (Ø§Ø«Ø¨Ø§Øª / Ø§Ù†ÙƒØ§Ø±)",
    openDate: "",
    fee: 0
  },
  {
    id: 316,
    number: "2026/3",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 317,
    number: "2024/127",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 318,
    number: "2024/2393",
    clientId: 197,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 319,
    number: "2025/6",
    clientId: 160,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 320,
    number: "2025/93",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 321,
    number: "2024/3911",
    clientId: 160,
    opponent: "",
    type: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø¯Ø¹Ø§ÙˆÙŠ Ø§Ù„Ù…Ø³ØªØ¹Ø¬Ù„Ø© ÙˆØ§Ù„Ø£ÙˆØ§Ù…Ø± Ø¹Ù„Ù‰ Ø¹Ø±Ø§Ø¦Ø¶",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø¯Ø¹Ø§ÙˆÙŠ Ø§Ù„Ù…Ø³ØªØ¹Ø¬Ù„Ø© ÙˆØ§Ù„Ø£ÙˆØ§Ù…Ø± Ø¹Ù„Ù‰ Ø¹Ø±Ø§Ø¦Ø¶",
    openDate: "",
    fee: 0
  },
  {
    id: 322,
    number: "2026/38",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 323,
    number: "2026/73",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 324,
    number: "2026/52",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 325,
    number: "2026/1360",
    clientId: 135,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ù…Ù†Ø§Ø²Ø¹Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 326,
    number: "2023/795",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 327,
    number: "2024/320",
    clientId: 197,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø¹Ø¬Ù…Ø§Ù† Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 328,
    number: "2026/211",
    clientId: 153,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 329,
    number: "2026/219",
    clientId: 197,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ† - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 330,
    number: "2025/0002112",
    clientId: 197,
    opponent: "",
    type: "Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© Ù„ØºÙŠØ± Ø§Ù„Ù…Ø³Ù„Ù…ÙŠÙ† - Ø¯Ø¹ÙˆÙ‰ Ø·Ù„Ø§Ù‚ (Ù„Ù„Ø¶Ø±Ø±)",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© Ù„ØºÙŠØ± Ø§Ù„Ù…Ø³Ù„Ù…ÙŠÙ† - Ø¯Ø¹ÙˆÙ‰ Ø·Ù„Ø§Ù‚ (Ù„Ù„Ø¶Ø±Ø±)",
    openDate: "",
    fee: 0
  },
  {
    id: 331,
    number: "2025/0000172",
    clientId: 197,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - ØªØ¸Ù„Ù…",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - ØªØ¸Ù„Ù…",
    openDate: "",
    fee: 0
  },
  {
    id: 332,
    number: "2025/7445",
    clientId: 141,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 333,
    number: "2025/3529",
    clientId: 199,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠÙ‡ - ØªØ¬Ø§Ø±ÙŠ",
    court: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ© Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠÙ‡ - ØªØ¬Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 334,
    number: "2025/0001237",
    clientId: 150,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© - Ø¯Ø¹ÙˆÙ‰ Ø·Ù„Ø§Ù‚ (Ù„Ù„Ø¶Ø±Ø±)",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© - Ø¯Ø¹ÙˆÙ‰ Ø·Ù„Ø§Ù‚ (Ù„Ù„Ø¶Ø±Ø±)",
    openDate: "",
    fee: 0
  },
  {
    id: 335,
    number: "2025/114",
    clientId: 150,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - ØªØ¸Ù„Ù…",
    court: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - ØªØ¸Ù„Ù…",
    openDate: "",
    fee: 0
  },
  {
    id: 336,
    number: "2025/4643",
    clientId: 164,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø¹Ù…Ø§Ù„ÙŠ",
    court: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø¹Ù…Ø§Ù„ÙŠ Ø§Ù„Ø³Ø§Ø¨Ø¹Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø¹Ù…Ø§Ù„ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 337,
    number: "COM2019/0003542",
    clientId: 200,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ (ÙƒÙ„ÙŠ) - Ù…Ø·Ø§Ù„Ø¨Ø§Øª Ù…Ø§Ù„ÙŠØ©",
    court: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - ØªØ¬Ø§Ø±ÙŠ (ÙƒÙ„ÙŠ) - Ù…Ø·Ø§Ù„Ø¨Ø§Øª Ù…Ø§Ù„ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 338,
    number: "2026/3331",
    clientId: 201,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠÙ‡ - Ù…Ù†Ø§Ø²Ø¹Ø© Ø¥ÙŠØ¬Ø§Ø±ÙŠØ© - Ø³ÙƒÙ†ÙŠ",
    court: "Ù„Ø¬Ù†Ø© ÙØ¶ Ø§Ù„Ù…Ù†Ø§Ø²Ø¹Ø§Øª Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠÙ‡ - Ù…Ù†Ø§Ø²Ø¹Ø© Ø¥ÙŠØ¬Ø§Ø±ÙŠØ© - Ø³ÙƒÙ†ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 339,
    number: "2023/15",
    clientId: 202,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - ØªØ¸Ù„Ù…",
    court: "ÙƒÙ„Ø¨Ø§Ø¡ - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© Ø§Ù„Ø£ÙˆÙ„Ù‰",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - ØªØ¸Ù„Ù…",
    openDate: "",
    fee: 0
  },
  {
    id: 340,
    number: "2023/064",
    clientId: 202,
    opponent: "",
    type: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - Ø£Ù…Ø± Ø¹Ù„Ù‰ Ø¹Ø±ÙŠØ¶Ø© - Ø§Ù„Ø£Ù…ÙˆØ± Ø§Ù„Ù…Ø³ØªØ¹Ø¬Ù„Ø©",
    court: "ÙƒÙ„Ø¨Ø§Ø¡ - Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø£Ù…ÙˆØ± Ø§Ù„Ù…Ø³ØªØ¹Ø¬Ù„Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© - Ø£Ù…Ø± Ø¹Ù„Ù‰ Ø¹Ø±ÙŠØ¶Ø© - Ø§Ù„Ø£Ù…ÙˆØ± Ø§Ù„Ù…Ø³ØªØ¹Ø¬Ù„Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 341,
    number: "2023/2646",
    clientId: 203,
    opponent: "",
    type: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    court: "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ø«Ø§Ù„Ø«Ø© Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø­ÙƒÙ…Ø© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¯Ù†ÙŠØ© - Ø§Ù„Ø´ÙŠÙƒØ§Øª Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø©",
    openDate: "",
    fee: 0
  },
  {
    id: 342,
    number: "2026/3760",
    clientId: 204,
    opponent: "",
    type: "Ø­Ø§Ù„Ø§Øª Ø²ÙˆØ¬ÙŠØ© Ù…Ø³Ù„Ù…ÙŠÙ†",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø­Ø§Ù„Ø§Øª Ø²ÙˆØ¬ÙŠØ© Ù…Ø³Ù„Ù…ÙŠÙ†",
    openDate: "",
    fee: 0
  },
  {
    id: 343,
    number: "2024/599",
    clientId: 187,
    opponent: "",
    type: "Ù…Ø¯Ù†Ù‰ Ø¬Ø²Ø¦Ù‰",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ø¯Ù†Ù‰ Ø¬Ø²Ø¦Ù‰",
    openDate: "",
    fee: 0
  },
  {
    id: 344,
    number: "2023/1613",
    clientId: 205,
    opponent: "",
    type: "Ø§Ù…Ø± Ø£Ø¯Ø§Ø¡",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù…Ø± Ø£Ø¯Ø§Ø¡",
    openDate: "",
    fee: 0
  },
  {
    id: 345,
    number: "2023/46",
    clientId: 192,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ù…ÙˆØ¶ÙˆØ¹ÙŠØ© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ù…ÙˆØ¶ÙˆØ¹ÙŠØ© Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„ØªØ¬Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 346,
    number: "2024/984",
    clientId: 206,
    opponent: "",
    type: "Ø¹Ù‚Ø§Ø±ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø¹Ù‚Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 347,
    number: "2025/19016",
    clientId: 147,
    opponent: "",
    type: "ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    openDate: "",
    fee: 0
  },
  {
    id: 348,
    number: "2019/268",
    clientId: 152,
    opponent: "",
    type: "ØªÙ†ÙÙŠØ° Ø´Ø±Ø¹ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªÙ†ÙÙŠØ° Ø´Ø±Ø¹ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 349,
    number: "2026/2726",
    clientId: 207,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§ÙŠØ¬Ø§Ø±ÙŠØ©",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ø§ÙŠØ¬Ø§Ø±ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 350,
    number: "2026/806",
    clientId: 208,
    opponent: "",
    type: "Ù‚Ø¶ÙŠØ©",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø¯Ø¹ÙˆÙ‰ Ù‚Ø¶Ø§Ø¦ÙŠØ©",
    openDate: "",
    fee: 0
  },
  {
    id: 351,
    number: "2026/397",
    clientId: 209,
    opponent: "",
    type: "Ø·Ù„Ø§Ù‚ Ù„Ù„Ø¶Ø±Ø±",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø·Ù„Ø§Ù‚ Ù„Ù„Ø¶Ø±Ø±",
    openDate: "",
    fee: 0
  },
  {
    id: 352,
    number: "2026/1062",
    clientId: 209,
    opponent: "",
    type: "Ø·Ù„Ø§Ù‚ Ù„Ù„Ø¶Ø±Ø±",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø·Ù„Ø§Ù‚ Ù„Ù„Ø¶Ø±Ø±",
    openDate: "",
    fee: 0
  },
  {
    id: 353,
    number: "2025/215",
    clientId: 161,
    opponent: "",
    type: "Ø¹Ù‚Ø§Ø±ÙŠ ÙƒÙ„ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø¹Ù‚Ø§Ø±ÙŠ ÙƒÙ„ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 354,
    number: "2025/196",
    clientId: 157,
    opponent: "",
    type: "ØªØ¸Ù„Ù… Ø´Ø±Ø¹ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªØ¸Ù„Ù… Ø´Ø±Ø¹ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 355,
    number: "2025/355",
    clientId: 121,
    opponent: "",
    type: "Ø§Ù…Ø± Ø£Ø¯Ø§Ø¡",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ù…Ø± Ø£Ø¯Ø§Ø¡ ÙŠØ§Ø±ÙˆØ³Ù„Ø§ÙØ§ Ø²ÙˆÙ„ÙŠÙ†Ø§",
    openDate: "",
    fee: 0
  },
  {
    id: 356,
    number: "2025/32",
    clientId: 171,
    opponent: "",
    type: "ØªØ¸Ù„Ù… Ù…Ù† Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªØ¸Ù„Ù… Ù…Ù† Ø£Ù…Ø± Ø£Ø¯Ø§Ø¡ ÙŠØ§Ø±ÙˆØ³Ù„Ø§ÙØ§ Ø²ÙˆÙ„ÙŠÙ†Ø§",
    openDate: "",
    fee: 0
  },
  {
    id: 357,
    number: "2025/1546",
    clientId: 157,
    opponent: "",
    type: "Ø§Ø­ÙˆØ§Ù„ Ù†ÙØ³ Ù…Ø³Ù„Ù…ÙŠÙ†",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ø­ÙˆØ§Ù„ Ù†ÙØ³ Ù…Ø³Ù„Ù…ÙŠÙ†",
    openDate: "",
    fee: 0
  },
  {
    id: 358,
    number: "2025/140",
    clientId: 182,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ù…ÙˆØ¶ÙˆØ¹ÙŠØ© ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ù…ÙˆØ¶ÙˆØ¹ÙŠØ© ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    openDate: "",
    fee: 0
  },
  {
    id: 359,
    number: "2023/555",
    clientId: 189,
    opponent: "",
    type: "Ø¹Ù‚Ø§Ø±ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø¹Ù‚Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 360,
    number: "",
    clientId: 188,
    opponent: "",
    type: "ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªØ¬Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 361,
    number: "2023/1486",
    clientId: 191,
    opponent: "",
    type: "Ø§Ø­ÙˆØ§Ù„ Ù†ÙØ³ Ù…Ø³Ù„Ù…ÙŠÙ†",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø§Ø­ÙˆØ§Ù„ Ù†ÙØ³ Ù…Ø³Ù„Ù…ÙŠÙ†",
    openDate: "",
    fee: 0
  },
  {
    id: 364,
    number: "2025/584",
    clientId: 210,
    opponent: "",
    type: "Ù…Ù†Ø§Ø²Ø¹Ø© Ù…ÙˆØ¶ÙˆØ¹ÙŠØ© ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ù…Ù†Ø§Ø²Ø¹Ø© Ù…ÙˆØ¶ÙˆØ¹ÙŠØ© ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    openDate: "",
    fee: 0
  },
  {
    id: 365,
    number: "2024/30121",
    clientId: 182,
    opponent: "",
    type: "ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    openDate: "",
    fee: 0
  },
  {
    id: 366,
    number: "2025/18042",
    clientId: 211,
    opponent: "",
    type: "ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªÙ†ÙÙŠØ° Ø´ÙŠÙƒØ§Øª",
    openDate: "",
    fee: 0
  },
  {
    id: 367,
    number: "2017/19",
    clientId: 161,
    opponent: "",
    type: "Ø¹Ø±Ø¶ ÙˆØ¥ÙŠØ¯Ø§Ø¹ Ù…Ø¯Ù†ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "Ø¹Ø±Ø¶ ÙˆØ¥ÙŠØ¯Ø§Ø¹ Ù…Ø¯Ù†ÙŠ",
    openDate: "",
    fee: 0
  },
  {
    id: 368,
    number: "2019/5820",
    clientId: 171,
    opponent: "",
    type: "ØªÙ†ÙÙŠØ° ØªØ¬Ø§Ø±ÙŠ",
    court: "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
    judge: "",
    status: "Ù…ØªØ¯Ø§ÙˆÙ„Ø©",
    subject: "ØªÙ†ÙÙŠØ° ØªØ¬Ø§Ø±ÙŠ",
    openDate: "",
    fee: 0
  }
];

const seedHearings: Hearing[] = [];

const seedTasks: TaskItem[] = [];

const seedInvoices: Invoice[] = [];

const seedDocs: DocItem[] = [];

const seedPoas: PoaItem[] = [];

// ---------- Ø§Ø¹Ø±Ù Ø¹Ù…ÙŠÙ„Ùƒ (KYC) â€” ÙˆÙÙ‚ Ù…ØªØ·Ù„Ø¨Ø§Øª Ù…ÙƒØ§ÙØ­Ø© ØºØ³Ù„ Ø§Ù„Ø£Ù…ÙˆØ§Ù„ ----------
const RISK_COLORS: Record<string, string> = { "Ù…Ù†Ø®ÙØ¶": "bg-emerald-100 text-emerald-700", "Ù…ØªÙˆØ³Ø·": "bg-amber-100 text-amber-700", "Ù…Ø±ØªÙØ¹": "bg-red-100 text-red-700" };
const KYC_STATUS_COLORS: Record<string, string> = { "Ù…ÙƒØªÙ…Ù„": "bg-emerald-100 text-emerald-700", "Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©": "bg-sky-100 text-sky-700", "Ù†Ø§Ù‚Øµ": "bg-orange-100 text-orange-700" };
const REVIEW_YEARS: Record<string, number> = { "Ù…Ø±ØªÙØ¹": 1, "Ù…ØªÙˆØ³Ø·": 2, "Ù…Ù†Ø®ÙØ¶": 3 }; // Ø¯ÙˆØ±ÙŠØ© Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© Ø­Ø³Ø¨ Ø¯Ø±Ø¬Ø© Ø§Ù„Ù…Ø®Ø§Ø·Ø±
const SANCTIONS_STATES = ["Ø³Ù„ÙŠÙ…", "Ù‚ÙŠØ¯ Ø§Ù„ØªØ­Ù‚Ù‚", "ØªØ·Ø§Ø¨Ù‚ Ù…Ø­ØªÙ…Ù„"];
const FUND_SOURCES = ["Ø±Ø§ØªØ¨ / Ø¯Ø®Ù„ ÙˆØ¸ÙŠÙÙŠ", "Ù†Ø´Ø§Ø· ØªØ¬Ø§Ø±ÙŠ", "Ø¹ÙˆØ§Ø¦Ø¯ Ø§Ø³ØªØ«Ù…Ø§Ø±", "Ø¨ÙŠØ¹ Ø¹Ù‚Ø§Ø±", "Ù…ÙŠØ±Ø§Ø«", "Ø£Ø®Ø±Ù‰"];

const seedKyc: KycItem[] = [];

const seedKycWatchlist: KycWatchlistItem[] = uaeTerroristList;

const seedNotifications: NotificationLog[] = [];

const OFFICE_TRN = "100492837400003";
const FIRM_TRN = OFFICE_TRN;
const FIRM_NAME = "Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©";
const FIRM_TAGLINE = "Ù…Ø­Ø§Ù…ÙˆÙ† ÙˆÙ…Ø³ØªØ´Ø§Ø±ÙˆÙ† Ù‚Ø§Ù†ÙˆÙ†ÙŠÙˆÙ† â€¢ Ø¯Ø¨ÙŠ - Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ù…ØªØ­Ø¯Ø©";

const seedTimeLogs: TimeLog[] = [];

const seedCaseExpenses: CaseExpense[] = [];

const seedTrustTransactions: TrustTransaction[] = [];

const seedDeadlines: JudgmentDeadline[] = [
  {
    id: 1,
    caseId: 101,
    rulingDate: new Date(Date.now() - 27 * 86400000).toISOString().slice(0, 10),
    rulingType: "Ø­ÙƒÙ… Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    rulingSummary: "Ø¥Ù„Ø²Ø§Ù… Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡Ø§ Ø¨Ø´Ø±ÙƒØ© Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ø°Ù‡Ø¨ÙŠ Ø¨Ø£Ù† ØªØ¤Ø¯ÙŠ Ù„Ù„Ù…ÙˆÙƒÙ„ Ù…Ø¨Ù„Øº 850,000 Ø¯Ø±Ù‡Ù… ÙˆØ§Ù„ÙØ§Ø¦Ø¯Ø© 5% ÙˆØ§Ù„Ø±Ø³ÙˆÙ….",
    appealDays: 30,
    appealDeadlineDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    status: "Ø¬Ø§Ø±Ù Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯",
    notes: "Ù…Ù‡Ù„Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¹Ø§Ø¬Ù„Ø© Ø¬Ø¯Ø§Ù‹ â€” Ù…ØªØ¨Ù‚ÙŠ 3 Ø£ÙŠØ§Ù… ÙÙ‚Ø· Ù„Ù‚ÙŠØ¯ Ø§Ù„ØµØ­ÙŠÙØ© Ø¨Ø§Ù„Ù…Ø­ÙƒÙ…Ø©",
    assignedLawyerId: 1,
    assignedLawyerName: "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ",
    assignedLawyerPhone: "0501234567",
    assignedLawyerEmail: "info@lawyersuood.com",
    preferredChannel: "both",
    alert7DaysSent: true,
    alert7DaysSentAt: new Date(Date.now() - 4 * 86400000).toLocaleDateString("ar-AE") + " 10:00 AM",
    alert3DaysSent: false,
    autoAlertLogs: [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 4 * 86400000).toLocaleDateString("ar-AE") + " 10:00 AM",
        type: "7_days",
        channel: "both",
        lawyerName: "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ",
        recipientContact: "info@lawyersuood.com",
        status: "sent",
        messageSnippet: "âš ï¸ [ØªÙ†Ø¨ÙŠÙ‡ 7 Ø£ÙŠØ§Ù…] ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø¥Ø´Ø¹Ø§Ø± Ø§Ø³ØªØ¨Ø§Ù‚ÙŠ Ø£ÙˆÙ„ Ù„Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù„Ù„ØªØ°ÙƒÙŠØ± Ø¨Ù…Ù‡Ù„Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù."
      }
    ]
  },
  {
    id: 2,
    caseId: 102,
    rulingDate: new Date(Date.now() - 23 * 86400000).toISOString().slice(0, 10),
    rulingType: "Ø­ÙƒÙ… Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    rulingSummary: "Ø±ÙØ¶ Ø¯Ø¹ÙˆÙ‰ Ø§Ù„Ø¥Ø®Ù„Ø§Ø¡ Ø¬Ø²Ø¦ÙŠØ§Ù‹ ÙˆØ¥Ù„Ø²Ø§Ù… Ø§Ù„Ù…Ø³ØªØ£Ø¬Ø± Ø¨Ø³Ø¯Ø§Ø¯ Ø§Ù„Ù…ØªØ£Ø®Ø±Ø§Øª ÙÙ‚Ø· Ù‚Ø¯Ø±Ù‡Ø§ 120,000 Ø¯Ø±Ù‡Ù….",
    appealDays: 30,
    appealDeadlineDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: "Ø¬Ø§Ø±Ù Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯",
    notes: "Ù…Ù‡Ù„Ø© Ø·Ø¹Ù† Ø¨Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø¨Ø§Ù„Ø´Ø§Ø±Ù‚Ø© â€” ØªØ¬Ù‡ÙŠØ² ØµØ­ÙŠÙØ© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ù„Ù„Ù…Ø·Ø§Ù„Ø¨Ø© Ø¨Ø§Ù„Ø¥Ø®Ù„Ø§Ø¡",
    assignedLawyerId: 2,
    assignedLawyerName: "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø£Ø­Ù…Ø¯ Ø§Ù„Ù…Ø²Ø±ÙˆØ¹ÙŠ",
    assignedLawyerPhone: "0509876543",
    assignedLawyerEmail: "ahmed.almazrouei@lawyersuood.com",
    preferredChannel: "both",
    alert7DaysSent: false,
    alert3DaysSent: false,
    autoAlertLogs: []
  },
  {
    id: 3,
    caseId: 103,
    rulingDate: new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10),
    rulingType: "Ø­ÙƒÙ… Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©",
    rulingSummary: "Ø­ÙƒÙ… Ø¹Ù…Ø§Ù„ÙŠ Ø¨Ø¥Ù„Ø²Ø§Ù… Ø§Ù„Ø´Ø±ÙƒØ© Ø¨Ù…Ø¨Ù„Øº 45,000 Ø¯Ø±Ù‡Ù… ÙˆØ¨Ø¯Ù„ ØªØ°ÙƒØ±Ø© Ø¹ÙˆØ¯Ø© ÙˆÙ…ÙƒØ§ÙØ£Ø© Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø®Ø¯Ù…Ø©.",
    appealDays: 30,
    appealDeadlineDate: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 10),
    status: "Ø¬Ø§Ø±Ù Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯",
    notes: "Ø¬Ø§Ø±Ù Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ù…ÙˆÙƒÙ„ Ù„ØªØ­Ø¯ÙŠØ¯ Ù…Ø¯Ù‰ Ø§Ù„Ø±ØºØ¨Ø© ÙÙŠ Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø£Ùˆ Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¨Ø§Ø´Ø±",
    assignedLawyerId: 1,
    assignedLawyerName: "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ",
    assignedLawyerPhone: "0501234567",
    assignedLawyerEmail: "info@lawyersuood.com",
    preferredChannel: "email",
    alert7DaysSent: false,
    alert3DaysSent: false,
    autoAlertLogs: []
  },
  {
    id: 4,
    caseId: 104,
    rulingDate: new Date(Date.now() - 40 * 86400000).toISOString().slice(0, 10),
    rulingType: "Ø­ÙƒÙ… Ø§Ø³ØªØ¦Ù†Ø§Ù",
    rulingSummary: "Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù Ø´ÙƒÙ„Ø§Ù‹ ÙˆÙÙŠ Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ Ø¨ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ø¨Ù„Øº Ø¥Ù„Ù‰ 320,000 Ø¯Ø±Ù‡Ù….",
    appealDays: 30,
    appealDeadlineDate: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
    status: "ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ø¹Ù†",
    notes: "ØªÙ… ØªÙ…ÙŠÙŠØ² Ø§Ù„Ø­ÙƒÙ… ÙˆÙ‚ÙŠØ¯ Ø·Ø¹Ù† Ø§Ù„ØªÙ…ÙŠÙŠØ² Ø¨Ø±Ù‚Ù… 112/2026 ØªÙ…ÙŠÙŠØ² ØªØ¬Ø§Ø±ÙŠ Ø¯Ø¨ÙŠ",
    assignedLawyerId: 1,
    assignedLawyerName: "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ",
    assignedLawyerPhone: "0501234567",
    assignedLawyerEmail: "info@lawyersuood.com",
    preferredChannel: "both",
    alert7DaysSent: true,
    alert3DaysSent: true,
    autoAlertLogs: []
  }
];

const seedInstallments: InvoiceInstallment[] = [];

const seedStrReports: StrReport[] = [];

const seedEmployees: Employee[] = [];

const seedLeaveRequests: LeaveRequest[] = [];

const seedEmployeeExpenses: EmployeeExpense[] = [];

const seedAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-1740000001",
    timestamp: "2026-08-23T08:30:15.120Z",
    formattedTimestamp: "23/08/2026 12:30:15 Ù…",
    userId: 1,
    userName: "Ø³Ø¹ÙˆØ¯ Ø¨Ù† Ø¹Ø¨Ø¯ Ø§Ù„Ø¹Ø²ÙŠØ²",
    userEmail: "info@lawyersuood.com",
    userRole: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…",
    actionType: "DELETE",
    targetModule: "Ø§Ù„Ø£Ø±Ø´ÙŠÙ ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª",
    targetId: "doc-99",
    targetTitle: "Ù…Ø³ÙˆØ¯Ø© Ù„Ø§Ø¦Ø­Ø© Ø¯Ø¹ÙˆÙ‰ Ù…ÙƒØ±Ø±Ø©",
    details: "ØªÙ… ØªÙ†ÙÙŠØ° ÙˆØªØ£ÙƒÙŠØ¯ Ø­Ø°Ù Ø§Ù„Ù…Ø³ØªÙ†Ø¯ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª ÙˆØªØ£ÙƒÙŠØ¯ Ù†Ø§ÙØ°Ø© Ø§Ù„ØªØ­Ø°ÙŠØ± Ø§Ù„Ø£Ù…Ù†ÙŠ.",
    ipAddress: "192.168.1.10",
    status: "Ù…Ø¤ÙƒØ¯"
  },
  {
    id: "audit-1740000002",
    timestamp: "2026-08-23T09:14:42.550Z",
    formattedTimestamp: "23/08/2026 01:14:42 Ù…",
    userId: 4,
    userName: "Ù…Ø­Ø§Ù…ÙŠ Ù…ØªØ¯Ø±Ø¨",
    userEmail: "trainee@lawyersuood.com",
    userRole: "Ù…Ø­Ø§Ù…ÙŠ Ù…ØªØ¯Ø±Ø¨",
    actionType: "UNAUTHORIZED_DELETE",
    targetModule: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§",
    targetId: "case-102",
    targetTitle: "Ù…Ø­Ø§ÙˆÙ„Ø© Ø­Ø°Ù Ø§Ù„Ù‚Ø¶ÙŠØ© Ø±Ù‚Ù… 2026/410",
    details: "Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§: Ø­Ø§ÙˆÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… (Ù…Ø¹Ø±Ù ID: #4) ØªÙ†ÙÙŠØ° [Ø­Ø°Ù Ù…Ù„Ù Ø§Ù„Ù‚Ø¶ÙŠØ©] Ø¯ÙˆÙ† Ø§Ù…ØªÙ„Ø§Ùƒ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© [Ø­Ø°Ù Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ù…Ù„ÙØ§Øª]. ØªÙ… Ø­Ø¸Ø± Ø§Ù„Ø¹Ù…Ù„ÙŠØ© ÙˆØ¥Ø­Ø¨Ø§Ø·Ù‡Ø§ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ ÙˆØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù….",
    ipAddress: "192.168.1.45",
    status: "Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ - Ù…Ø±ÙÙˆØ¶"
  }
];

const seedConsultationBookings: BookingRecord[] = [];

export interface LegalPrecedent {
  id: string | number;
  title: string;
  court_name: string;
  ruling_year: number;
  category: string;
  circuit_name?: string;
  appeal_number: string;
  summary_text: string;
  pdf_file_url?: string;
  word_file_url?: string;
  created_at?: string;
}

const seedLegalPrecedents: LegalPrecedent[] = [];

const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: "notice",
    title: "Ø¥Ù†Ø°Ø§Ø± Ø¹Ø¯Ù„ÙŠ Ø±Ø³Ù…ÙŠØ§Ù‹ Ø¹Ø¨Ø± Ø§Ù„ÙƒØ§ØªØ¨ Ø§Ù„Ø¹Ø¯Ù„",
    category: "Ø¥Ù†Ø°Ø§Ø±Ø§Øª ÙˆÙ‚Ø¶Ø§ÙŠØ§",
    templateBody: `Ø¥Ù„Ù‰ Ø§Ù„Ù…Ù†Ø°Ø± Ø¥Ù„ÙŠÙ‡: {{OPPONENT}}
Ù…Ù† Ø§Ù„Ù…Ù†Ø°Ø±: {{CLIENT_NAME}} Ø¨ÙˆØ§Ø³Ø·Ø© ÙˆÙƒÙŠÙ„Ù‡ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ / Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©

Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹: Ø¥Ù†Ø°Ø§Ø± Ø±Ø³Ù…ÙŠ Ø¨Ø§Ù„Ø³Ø¯Ø§Ø¯ ÙˆØ§Ù„ÙˆÙØ§Ø¡ Ø¨Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø§Ù„ØªØ¹Ø§Ù‚Ø¯ÙŠ

Ø¨Ù…ÙˆØ¬Ø¨ Ù‡Ø°Ø§ Ø§Ù„Ø¥Ù†Ø°Ø§Ø± Ø§Ù„Ø±Ø³Ù…ÙŠØŒ Ù†Ù„ÙØª Ø¹Ù†Ø§ÙŠØªÙƒÙ… Ø¨Ø£Ù†ÙƒÙ… Ù…Ø¯ÙŠÙ†ÙˆÙ† Ù„Ù…ÙˆÙƒÙ„Ù†Ø§ Ø¨Ø§Ù„ÙÙŠØµÙ„ Ø§Ù„Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¨Ø§Ù„Øº Ù‚Ø¯Ø±Ù‡ ({{CASE_FEE}}) Ø¯Ø±Ù‡Ù… Ø¥Ù…Ø§Ø±Ø§ØªÙŠ Ø¨Ù…ÙˆØ¬Ø¨ Ø§Ù„ØªØ¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø¨ÙŠÙ† Ø§Ù„Ø·Ø±ÙÙŠÙ†.

ÙˆÙ†Ø­ÙŠØ·ÙƒÙ… Ø¹Ù„Ù…Ø§Ù‹ Ø¨Ø£Ù†Ù‡ ÙÙŠ Ø­Ø§Ù„ Ø¹Ø¯Ù… Ø§Ù„Ø³Ø¯Ø§Ø¯ Ø®Ù„Ø§Ù„ Ù…Ù‡Ù„Ø© (7) Ø£ÙŠØ§Ù… Ø¹Ù…Ù„ Ù…Ù† ØªØ§Ø±ÙŠØ® Ù‡Ø°Ø§ Ø§Ù„Ø¥Ù†Ø°Ø§Ø±ØŒ Ø³Ù†Ø¶Ø·Ø± Ø¢Ø³ÙÙŠÙ† Ù„Ø§ØªØ®Ø§Ø° ÙƒØ§ÙØ© Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ© ÙˆØ§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø£Ù…Ø§Ù… {{COURT}} Ù„Ù„Ù…Ø·Ø§Ù„Ø¨Ø© Ø¨Ø£ØµÙ„ Ø§Ù„Ù…Ø¨Ù„Øº ÙˆØ§Ù„ØªØ¹ÙˆÙŠØ¶Ø§Øª ÙˆØ§Ù„Ø±Ø³ÙˆÙ… ÙˆØ§Ù„ÙØ§Ø¦Ø¯Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø¯ÙˆÙ† Ø¥Ø´Ø¹Ø§Ø± Ø¢Ø®Ø±.

Ø­Ø±Ø± ÙÙŠ {{TODAY_DATE}}
Ø¹Ù† Ø§Ù„Ù…ÙˆÙƒÙ„ / ÙˆÙƒÙŠÙ„Ù‡ Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ
ØªÙˆÙ‚ÙŠØ¹ ÙˆØ®Ø§ØªÙ… Ø§Ù„Ù…ÙƒØªØ¨ Ø§Ù„Ø±Ø³Ù…ÙŠ`
  },
  {
    id: "lawsuit",
    title: "ØµØ­ÙŠÙØ© Ø¯Ø¹ÙˆÙ‰ Ø§ÙØªØªØ§Ø­ÙŠØ© Ø£Ù…Ø§Ù… Ø§Ù„Ù…Ø­ÙƒÙ…Ø©",
    category: "ØµØ­Ù Ø§Ù„Ø¯Ø¹Ø§ÙˆÙ‰",
    templateBody: `Ø¥Ù„Ù‰ Ù…Ø­ÙƒÙ…Ø©: {{COURT}} Ø§Ù„Ù…ÙˆÙ‚Ø±Ø©

Ø§Ù„Ù…Ø¯Ø¹ÙŠ: {{CLIENT_NAME}} â€” Ù‡Ø§ØªÙ: {{CLIENT_PHONE}} â€” Ø¨Ø±ÙŠØ¯: {{CLIENT_EMAIL}}
Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡: {{OPPONENT}}

Ù…ÙˆØ¶ÙˆØ¹ Ø§Ù„Ø¯Ø¹ÙˆÙ‰: {{CASE_SUBJECT}} (Ù‚Ø¶ÙŠØ© {{CASE_NUMBER}})

ÙˆÙ‚Ø§Ø¦Ø¹ Ø§Ù„Ø¯Ø¹ÙˆÙ‰:
Ø£ÙˆÙ„Ø§Ù‹: Ø§ØªÙÙ‚ Ø§Ù„Ù…Ø¯Ø¹ÙŠ Ù…Ø¹ Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡ Ø¹Ù„Ù‰ Ø§Ù„Ù‚ÙŠØ§Ù… Ø¨Ø§Ù„Ø£Ø¹Ù…Ø§Ù„ ÙˆØ§Ù„Ù…ÙˆØ¬Ø¨Ø§Øª Ø§Ù„ØªØ¹Ø§Ù‚Ø¯ÙŠØ©.
Ø«Ø§Ù†ÙŠØ§Ù‹: Ø§Ù…ØªÙ†Ø¹ Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡ Ø¹Ù† Ø§Ù„ÙˆÙØ§Ø¡ Ø¨Ø§Ù„ØªØ²Ø§Ù…Ø§ØªÙ‡ Ø§Ù„Ù…ØªØ±ØªØ¨Ø© Ø¨Ø°Ù…ØªÙ‡ Ø±ØºÙ… Ø§Ù„Ù…Ø·Ø§Ù„Ø¨Ø§Øª Ø§Ù„Ù…ØªÙƒØ±Ø±Ø© ÙˆØ§Ù„Ø¥Ù†Ø°Ø§Ø±.

Ø§Ù„Ø·Ù„Ø¨Ø§Øª:
1. Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø¯Ø¹ÙˆÙ‰ Ø´ÙƒÙ„Ø§Ù‹.
2. Ø¥Ù„Ø²Ø§Ù… Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡ Ø¨Ø£Ù† ÙŠØ¤Ø¯ÙŠ Ù„Ù„Ù…Ø¯Ø¹ÙŠ Ù…Ø¨Ù„Øº ({{CASE_FEE}}) Ø¯Ø±Ù‡Ù… Ø¥Ù…Ø§Ø±Ø§ØªÙŠ.
3. Ø¥Ù„Ù…Ø§Ù… Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡ Ø¨Ø§Ù„ÙØ§Ø¦Ø¯Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø¨ÙˆØ§Ù‚Ø¹ 5% Ù…Ù† ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…Ø·Ø§Ù„Ø¨Ø© ÙˆØ­ØªÙ‰ ØªÙ…Ø§Ù… Ø§Ù„Ø³Ø¯Ø§Ø¯.
4. Ø¥Ù„Ø²Ø§Ù… Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡ Ø¨Ø§Ù„Ø±Ø³ÙˆÙ… ÙˆØ§Ù„Ù…ØµØ§Ø±ÙŠÙ ÙˆØ§Ù„Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©.

Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ù…Ø¤ÙŠØ¯Ø©: Ø¹Ù‚Ø¯ Ø§Ù„Ø§ØªÙØ§Ù‚ØŒ Ø¥ÙØ§Ø¯Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨Ø§ØªØŒ Ø§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª Ø§Ù„Ø®Ø·ÙŠØ©.

Ø­Ø±Ø± ÙÙŠ {{TODAY_DATE}}
Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©`
  },
  {
    id: "memo",
    title: "Ù…Ø°ÙƒØ±Ø© Ø¯ÙØ§Ø¹ Ø¬ÙˆØ§Ø¨ÙŠØ© ÙˆÙ…Ø±Ø§ÙØ¹Ø©",
    category: "Ù…Ø°ÙƒØ±Ø§Øª Ø§Ù„Ù…Ø±Ø§ÙØ¹Ø©",
    templateBody: `Ø£Ù…Ø§Ù… Ø¯Ø§Ø¦Ø±Ø©: {{COURT}}
ÙÙŠ Ø§Ù„Ù‚Ø¶ÙŠØ© Ø±Ù‚Ù…: {{CASE_NUMBER}} (Ù†ÙˆØ¹ {{CASE_TYPE}})

Ù…Ø°ÙƒØ±Ø© Ø¯ÙØ§Ø¹ Ù…Ù‚Ø¯Ù…Ø© Ù…Ù†: {{CLIENT_NAME}} (ØµÙØªÙ‡: Ù…Ø¯Ø¹Ù / Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡)
Ø¶Ø¯: {{OPPONENT}}

Ø§Ù„Ø¯ÙØ§Ø¹ ÙˆØ§Ù„Ø£Ø³Ø§Ø³ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ:
1. ÙÙŠ Ø§Ù„Ø´ÙƒÙ„: ØªÙ…Ø³Ùƒ Ù…ÙˆÙƒÙ„Ù†Ø§ Ø¨Ø¯ÙÙˆØ¹ Ø§Ù„Ø´ÙƒÙ„ ÙˆØ§Ù„ØµÙØ© ÙÙŠ Ø§Ù„Ø¯Ø¹ÙˆÙ‰.
2. ÙÙŠ Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹: Ø¨Ø·Ù„Ø§Ù† Ø§Ø¯Ø¹Ø§Ø¡ Ø§Ù„Ø®ØµÙ… Ù„Ø¹Ø¯Ù… Ø«Ø¨ÙˆØª Ø§Ù„Ø¶Ø±Ø± ÙˆØ§Ø³ØªÙ†Ø§Ø¯Ù†Ø§ Ù„Ù„Ù…Ø§Ø¯Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© ÙÙŠ Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆØ§Ù„ØªØ¬Ø§Ø±ÙŠØ© Ù„Ø¯ÙˆÙ„Ø© Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª.

Ø¨Ù†Ø§Ø¡ Ø¹Ù„ÙŠÙ‡ØŒ Ù†Ù„ØªÙ…Ø³ Ù…Ù† Ø¹Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ù…ÙˆÙ‚Ø±Ø© Ø§Ù„Ø­ÙƒÙ… Ø¨Ø±ÙØ¶ Ø§Ù„Ø¯Ø¹ÙˆÙ‰ ÙˆØªØ¶Ù…ÙŠÙ† Ø§Ù„Ø®ØµÙ… Ø§Ù„Ø±Ø³ÙˆÙ… ÙˆØ§Ù„Ù…ØµØ§Ø±ÙŠÙ.

Ù‚Ø¯Ù…Øª Ø¨ØªØ§Ø±ÙŠØ® {{TODAY_DATE}}
ÙˆÙƒÙŠÙ„ Ø§Ù„Ù…ÙˆÙƒÙ„ Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ / Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ`
  },
  {
    id: "retainer",
    title: "Ø¹Ù‚Ø¯ Ø§ØªÙØ§Ù‚ Ø£ØªØ¹Ø§Ø¨ Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ø³ØªØ´Ø§Ø±Ø§Øª",
    category: "Ø¹Ù‚ÙˆØ¯ Ø§Ù„Ø§ØªÙØ§Ù‚",
    templateBody: `Ø¹Ù‚Ø¯ Ø§ØªÙØ§Ù‚ Ø¹Ù„Ù‰ Ø£ØªØ¹Ø§Ø¨ Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ø³ØªØ´Ø§Ø±Ø§Øª Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©

Ø¥Ù†Ù‡ ÙÙŠ ÙŠÙˆÙ… {{TODAY_DATE}}ØŒ ØªÙ… Ø§Ù„Ø§ØªÙØ§Ù‚ Ø¨ÙŠÙ† ÙƒÙ„ Ù…Ù†:
Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø£ÙˆÙ„: Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© (Ø±Ù‚Ù… Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¶Ø±ÙŠØ¨ÙŠ: 100492837400003)
Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø«Ø§Ù†ÙŠ: {{CLIENT_NAME}} (Ø±Ù‚Ù… Ø§Ù„Ù‡ÙˆÙŠØ© / Ø§Ù„Ø±Ø®ØµØ©: {{CLIENT_ID_NO}})

Ù…ÙˆØ¶ÙˆØ¹ Ø§Ù„Ø§ØªÙØ§Ù‚:
ÙŠØªÙˆÙ„Ù‰ Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø£ÙˆÙ„ Ø§Ù„ØªÙ…Ø«ÙŠÙ„ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ ÙˆØ§Ù„Ù…Ø±Ø§ÙØ¹Ø© Ø¹Ù† Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø«Ø§Ù†ÙŠ ÙÙŠ Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹: ({{CASE_SUBJECT}}) Ø£Ù…Ø§Ù… {{COURT}}.

Ø§Ù„Ø£ØªØ¹Ø§Ø¨ ÙˆÙƒÙŠÙÙŠØ© Ø§Ù„Ø³Ø¯Ø§Ø¯:
Ø§ØªÙÙ‚ Ø§Ù„Ø·Ø±ÙØ§Ù† Ø¹Ù„Ù‰ Ø£Ù† ØªÙƒÙˆÙ† Ø£ØªØ¹Ø§Ø¨ Ø§Ù„Ù…Ø­Ø§Ù…Ø§Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ø¨Ù…Ø¨Ù„Øº Ù‚Ø¯Ø±Ù‡ ({{CASE_FEE}}) Ø¯Ø±Ù‡Ù… Ø¥Ù…Ø§Ø±Ø§ØªÙŠ ÙŠØ¶Ø§Ù Ø¥Ù„ÙŠÙ‡Ø§ Ø¶Ø±ÙŠØ¨Ø© Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ø¶Ø§ÙØ© 5%ØŒ ÙˆØªØ¯ÙØ¹ ÙˆÙÙ‚ Ø§Ù„Ø¯ÙØ¹Ø§Øª Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© Ø¨Ø§Ù„ÙØ§ØªÙˆØ±Ø©.

Ø­Ø±Ø± Ù…Ù† Ù†Ø³Ø®ØªÙŠÙ† Ø¨ÙŠØ¯ ÙƒÙ„ Ø·Ø±Ù Ù†Ø³Ø®Ø© Ù„Ù„Ø¹Ù…Ù„ Ø¨Ù…ÙˆØ¬Ø¨Ù‡Ø§.
Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø£ÙˆÙ„ (Ø§Ù„Ù…ÙƒØªØ¨)             Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø«Ø§Ù†ÙŠ (Ø§Ù„Ù…ÙˆÙƒÙ„)`
  }
];

const formatUaePhone = (phone: string) => {
  if (!phone) return "";
  let clean = phone.replace(/[^\d+]/g, "");
  if (clean.startsWith("0")) {
    clean = "971" + clean.slice(1);
  } else if (clean.startsWith("+")) {
    clean = clean.slice(1);
  } else if (!clean.startsWith("971") && clean.length === 9) {
    clean = "971" + clean;
  }
  return clean;
};

const sendWhatsAppMsg = (phone: string, text: string) => {
  const cleanPhone = formatUaePhone(phone);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

const sendEmailMsg = (email: string, subject: string, body: string) => {
  if (email && email.includes("@")) {
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: subject,
        body: body
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        console.log("Email dispatched via server SMTP successfully:", data);
      }
    }).catch(err => {
      console.warn("Server email dispatch fallback to mailto:", err);
    });
  }
  const url = `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank");
};

const nextReviewDate = (lastReview: string, risk: string) => {
  const d = new Date(lastReview + "T00:00:00");
  d.setFullYear(d.getFullYear() + (REVIEW_YEARS[risk] || 2));
  return d.toISOString().slice(0, 10);
};

// ---------- Ø£Ø¯ÙˆØ§Øª Ù…Ø³Ø§Ø¹Ø¯Ø© ----------
const fmtAED = (n: number) => new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }) : "â€”";
const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - new Date(todayISO()).getTime()) / 86400000);

const normalizeArabicName = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[Ø£Ø¥Ø¢Ø¡Ø¦Ø¤]/g, "Ø§")
    .replace(/Ø©/g, "Ù‡")
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const findMatchingClientByName = (clientsList: Client[], searchName: string): Client | undefined => {
  if (!searchName || !searchName.trim()) return undefined;
  const targetNorm = normalizeArabicName(searchName);
  if (!targetNorm) return undefined;

  let found = clientsList.find((c) => {
    const cNorm = normalizeArabicName(c.name);
    return cNorm === targetNorm || cNorm.includes(targetNorm) || targetNorm.includes(cNorm);
  });
  if (found) return found;

  const words = targetNorm.split(" ").filter((w) => w.length > 1);
  if (words.length >= 2) {
    const mainTwo = words.slice(0, 2).join(" ");
    found = clientsList.find((c) => normalizeArabicName(c.name).includes(mainTwo));
    if (found) return found;
  }

  return undefined;
};

const getCaseStage = (c: { stage?: string; court?: string; subject?: string; number?: string; type?: string; status?: string }): string => {
  if (c.stage) return c.stage;
  const txt = ((c.court || "") + " " + (c.subject || "") + " " + (c.number || "") + " " + (c.type || "")).toLowerCase();
  if (txt.includes("Ø§Ø³ØªØ¦Ù†Ø§Ù") || txt.includes("Ø§Ø³ØªØ¦Ù†Ø§ÙÙŠØ©")) return "Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù";
  if (txt.includes("ØªÙ…ÙŠÙŠØ²") || txt.includes("Ù†Ù‚Ø¶") || txt.includes("Ø§Ù„Ø¹Ù„ÙŠØ§")) return "Ø§Ù„ØªÙ…ÙŠÙŠØ² / Ø§Ù„Ù†Ù‚Ø¶";
  if (txt.includes("ØªÙ†ÙÙŠØ°")) return "Ø§Ù„ØªÙ†ÙÙŠØ°";
  if (txt.includes("Ù„Ø¬Ù†Ø©") || txt.includes("Ù…Ù†Ø§Ø²Ø¹Ø§Øª") || txt.includes("ØªÙˆÙÙŠÙ‚") || txt.includes("Ø¥ÙŠØ¬Ø§Ø±ÙŠ")) return "Ù„Ø¬Ø§Ù† ÙØ¶ Ø§Ù„Ù…Ù†Ø§Ø²Ø¹Ø§Øª";
  return "Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©";
};

const stageBadgeColor = (st: string) => ({
  "Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Ø§Ø³ØªØ¦Ù†Ø§Ù": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©": "bg-blue-100 text-blue-800 border-blue-200",
  "Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠ": "bg-blue-100 text-blue-800 border-blue-200",
  "Ø§Ù„ØªÙ…ÙŠÙŠØ² / Ø§Ù„Ù†Ù‚Ø¶": "bg-purple-100 text-purple-800 border-purple-200",
  "ØªÙ…ÙŠÙŠØ²/Ù†Ù‚Ø¶": "bg-purple-100 text-purple-800 border-purple-200",
  "Ø§Ù„ØªÙ†ÙÙŠØ°": "bg-amber-100 text-amber-900 border-amber-300",
  "ØªÙ†ÙÙŠØ°": "bg-amber-100 text-amber-900 border-amber-300",
  "Ù„Ø¬Ø§Ù† ÙØ¶ Ø§Ù„Ù…Ù†Ø§Ø²Ø¹Ø§Øª": "bg-teal-100 text-teal-800 border-teal-200",
}[st] || "bg-slate-100 text-slate-700 border-slate-200");

const statusColor = (s: string) => ({
  "Ù…ØªØ¯Ø§ÙˆÙ„Ø©": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Ù…Ù†ØªÙ‡ÙŠØ©": "bg-stone-200 text-stone-700 border-stone-300",
  "Ù…Ø­ÙƒÙˆÙ…Ø©": "bg-teal-100 text-teal-800 border-teal-200",
  "ØµØ¯Ø± Ø§Ù„Ø­ÙƒÙ…": "bg-teal-100 text-teal-800 border-teal-200",
  "Ù‚ÙŠØ¯ Ø§Ù„Ù†Ø¸Ø±": "bg-sky-100 text-sky-700 border-sky-200",
  "Ù…Ø­Ø¬ÙˆØ²Ø© Ù„Ù„Ø­ÙƒÙ…": "bg-purple-100 text-purple-700 border-purple-200",
  "Ù…Ø´Ø·ÙˆØ¨Ø©": "bg-stone-200 text-stone-700 border-stone-300",
  "Ù…Ø¹Ù„Ù‚Ø©": "bg-rose-100 text-rose-800 border-rose-200",
  "Ù…ØºÙ„Ù‚Ø©": "bg-slate-200 text-slate-600 border-slate-300",
}[s] || "bg-slate-100 text-slate-600 border-slate-200");

// Ø¯Ø§Ù„Ø© ØªØ­Ø¯ÙŠØ¯ Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ø´Ø§Ø±Ø§Øª (Badges) Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù†ÙˆØ¹ ÙˆØªØµÙ†ÙŠÙ Ø§Ù„Ù‚Ø¶ÙŠØ©
const caseTypeBadgeColor = (t: string) => {
  const typeMap: Record<string, string> = {
    "ØªØ¬Ø§Ø±ÙŠ": "bg-blue-50 text-blue-900 border-blue-200 font-bold",
    "Ù…Ø¯Ù†ÙŠ": "bg-emerald-50 text-emerald-900 border-emerald-200 font-bold",
    "Ø¹Ù…Ø§Ù„ÙŠ": "bg-amber-50 text-amber-950 border-amber-300 font-bold",
    "Ø¬Ø²Ø§Ø¦ÙŠ": "bg-rose-50 text-rose-900 border-rose-200 font-bold",
    "Ø¬Ù†Ø§Ø¦ÙŠ": "bg-rose-50 text-rose-900 border-rose-200 font-bold",
    "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©": "bg-purple-50 text-purple-900 border-purple-200 font-bold",
    "Ø£Ø³Ø±ÙŠ": "bg-purple-50 text-purple-900 border-purple-200 font-bold",
    "Ø¥ÙŠØ¬Ø§Ø±ÙŠ": "bg-cyan-50 text-cyan-900 border-cyan-200 font-bold",
    "Ø¹Ù‚Ø§Ø±ÙŠ": "bg-indigo-50 text-indigo-900 border-indigo-200 font-bold",
    "Ø¥Ø¯Ø§Ø±ÙŠ": "bg-slate-100 text-slate-900 border-slate-300 font-bold",
    "ØªÙ†ÙÙŠØ°": "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200 font-bold",
    "ØªØ­ÙƒÙŠÙ…": "bg-amber-100 text-amber-950 border-amber-300 font-bold",
  };
  return typeMap[t] || "bg-stone-100 text-slate-800 border-stone-200 font-bold";
};

// Ø¯Ø§Ù„Ø© ØªØ­Ø¯ÙŠØ¯ Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ù†Ù‚Ø·Ø© ÙˆØ§Ù„Ù…Ø¤Ø´Ø± Ø§Ù„Ø¨ØµØ±ÙŠ Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù†ÙˆØ¹ ÙˆØªØµÙ†ÙŠÙ Ø§Ù„Ù‚Ø¶ÙŠØ©
const caseTypeDotColor = (t: string) => {
  const dotMap: Record<string, string> = {
    "ØªØ¬Ø§Ø±ÙŠ": "bg-blue-600 ring-2 ring-blue-100",
    "Ù…Ø¯Ù†ÙŠ": "bg-emerald-600 ring-2 ring-emerald-100",
    "Ø¹Ù…Ø§Ù„ÙŠ": "bg-amber-500 ring-2 ring-amber-100",
    "Ø¬Ø²Ø§Ø¦ÙŠ": "bg-rose-600 ring-2 ring-rose-100",
    "Ø¬Ù†Ø§Ø¦ÙŠ": "bg-rose-600 ring-2 ring-rose-100",
    "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©": "bg-purple-600 ring-2 ring-purple-100",
    "Ø£Ø³Ø±ÙŠ": "bg-purple-600 ring-2 ring-purple-100",
    "Ø¥ÙŠØ¬Ø§Ø±ÙŠ": "bg-cyan-600 ring-2 ring-cyan-100",
    "Ø¹Ù‚Ø§Ø±ÙŠ": "bg-indigo-600 ring-2 ring-indigo-100",
    "Ø¥Ø¯Ø§Ø±ÙŠ": "bg-slate-600 ring-2 ring-slate-200",
    "ØªÙ†ÙÙŠØ°": "bg-fuchsia-600 ring-2 ring-fuchsia-100",
    "ØªØ­ÙƒÙŠÙ…": "bg-amber-600 ring-2 ring-amber-200",
  };
  return dotMap[t] || "bg-stone-500 ring-2 ring-stone-200";
};

const invColor = (s: string) => ({
  "Ù…Ø³ÙˆØ¯Ø©": "bg-slate-100 text-slate-600",
  "Ù…Ø±Ø³Ù„Ø©": "bg-sky-100 text-sky-700",
  "Ù…Ø¯ÙÙˆØ¹Ø©": "bg-emerald-100 text-emerald-700",
  "Ù…ØªØ£Ø®Ø±Ø©": "bg-red-100 text-red-700",
}[s] || "bg-slate-100 text-slate-600");

// ---------- Ù…ÙƒÙˆÙ†Ø§Øª Ø¹Ø§Ù…Ø© ----------
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
    {children}
  </label>
);

const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition";

// ============================================================
// Ø£ÙƒÙˆØ§Ø¯ ÙˆØ´Ø§Ø´Ø§Øª Supabase RLS Ùˆ User Approval Flow
// ============================================================
const SUPABASE_PROFILES_SQL = `-- 1. Ø¥Ù†Ø´Ø§Ø¡ Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„ Ù…Ù‚ØªØ±Ù†Ø§Ù‹ Ø¨Ù€ Supabase Auth
-- Ø§Ù„Ø­Ù‚Ù„ status Ù‚ÙŠÙ…ØªÙ‡ Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ© 'pending' Ø¹Ù†Ø¯ Ø§Ù„ØªØ³Ø¬ÙŠÙ„
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'lawyer', -- 'admin', 'lawyer', 'secretary', 'accountant'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

const SUPABASE_RLS_SQL = `-- 2. ØªÙØ¹ÙŠÙ„ Row Level Security (RLS) Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø¬Ø¯Ø§ÙˆÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. Ø¯Ø§Ù„Ø© ÙØ­Øµ Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆÙ‡Ù„ ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ Ø­Ø³Ø§Ø¨Ù‡ (status = 'approved')
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status IN ('approved', 'Ù†Ø´Ø·')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ø³ÙŠØ§Ø³Ø§Øª RLS: ØªÙ…Ù†Ø¹ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø£Ùˆ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„ Ù„Ø£ÙŠ Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø§ Ù„Ù… ØªÙƒÙ† Ø­Ø§Ù„ØªÙ‡ 'approved'
CREATE POLICY "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ù‚Ø¶Ø§ÙŠØ§ Ù„Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ† ÙÙ‚Ø·" ON public.cases
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø¬Ù„Ø³Ø§Øª Ù„Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ† ÙÙ‚Ø·" ON public.hearings
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ù„Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ† ÙÙ‚Ø·" ON public.clients
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ù…Ù‡Ø§Ù… Ù„Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ† ÙÙ‚Ø·" ON public.tasks
  FOR ALL USING (public.is_approved_user());

CREATE POLICY "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„ÙÙˆØ§ØªÙŠØ± Ù„Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ† ÙÙ‚Ø·" ON public.invoices
  FOR ALL USING (public.is_approved_user());

-- Ø³ÙŠØ§Ø³Ø© ØªÙ…ÙƒÙŠÙ† Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ù† Ù‚Ø±Ø§Ø¡Ø© Ù…Ù„ÙÙ‡ Ø§Ù„Ø´Ø®ØµÙŠ Ù„Ù…Ø¹Ø±ÙØ© Ø­Ø§Ù„ØªÙ‡ (pending / approved)
CREATE POLICY "Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù†ÙØ³Ù‡" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_approved_user());`;

const SUPABASE_TRIGGER_SQL = `-- 5. Ø¥Ù†Ø´Ø§Ø¡ Trigger ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù„Ø¥Ù†Ø´Ø§Ø¡ Ø¨Ø±ÙˆÙØ§ÙŠÙ„ Ø¨Ø­Ø§Ù„Ø© 'pending' ÙÙˆØ± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Ù…Ø³ØªØ®Ø¯Ù… Ø¬Ø¯ÙŠØ¯'),
    'lawyer',
    'pending' -- Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ© Ù…Ø¹Ù„Ù‚Ø© Ù„Ø­ÙŠÙ† Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„Ø£Ø¯Ù…Ù†
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();`;

const SUPABASE_WHATSAPP_MESSAGES_SQL = `-- 6. Ø¥Ù†Ø´Ø§Ø¡ Ø¬Ø¯ÙˆÙ„ whatsapp_messages Ù„Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù€ Webhook Ùˆ Edge Function
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  sender TEXT NOT NULL CHECK (sender IN ('me', 'them', 'user', 'business')),
  message_body TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'pending', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ØªÙØ¹ÙŠÙ„ Ø§Ù„Ù€ RLS ÙˆØªÙ…ÙƒÙŠÙ† Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ† Ù…Ù† Ø§Ù„Ø§Ø³ØªØ¹Ù„Ø§Ù… Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ù„Ø­Ø¸ÙŠØ§Ù‹
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª Ù„Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ† ÙÙ‚Ø·" ON public.whatsapp_messages
  FOR ALL USING (public.is_approved_user());

-- ØªÙØ¹ÙŠÙ„ Realtime Ø¹Ù„Ù‰ Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª Ù„ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø§Øª ÙÙˆØ±ÙŠØ§Ù‹
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;`;

const REACT_PROTECTED_ROUTE_SQL = `// ============================================================
// React Component: PendingApproval.jsx & ProtectedRoute
// ============================================================
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function checkUserStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("unauthenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setStatus("pending");
      } else {
        setStatus(data.status); // 'pending' | 'approved' | 'Ù†Ø´Ø·'
      }
      setLoading(false);
    }

    checkUserStatus();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold">Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø£Ù…Ø§Ù† Ø§Ù„Ø­Ø³Ø§Ø¨...</div>;
  if (status === "unauthenticated") return <LoginForm />;
  if (status === "pending" || status === "Ù…Ø¹Ù„Ù‚") return <PendingApprovalScreen />;

  return children; // ÙŠÙˆØ¬Ù‡ Ù„Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… ÙÙ‚Ø· Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø­Ø³Ø§Ø¨ approved
}`;

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"schema" | "rls" | "trigger" | "whatsapp" | "react">("schema");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const getActiveCode = () => {
    switch (activeTab) {
      case "schema": return SUPABASE_PROFILES_SQL;
      case "rls": return SUPABASE_RLS_SQL;
      case "trigger": return SUPABASE_TRIGGER_SQL;
      case "whatsapp": return SUPABASE_WHATSAPP_MESSAGES_SQL;
      case "react": return REACT_PROTECTED_ROUTE_SQL;
      default: return SUPABASE_PROFILES_SQL;
    }
  };

  const handleCopy = (tabKey: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(tabKey);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 text-slate-100 shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Ø±Ø£Ø³ Ø§Ù„Ù…ÙˆØ¯Ø§Ù„ */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Ø£ÙƒÙˆØ§Ø¯ Supabase SQL Ùˆ RLS Ùˆ WhatsApp Edge Function</h3>
              <p className="text-xs text-slate-400">Ù†Ø¸Ø§Ù… Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ø¶ÙˆÙŠØ§ØªØŒ Ø­Ø¸Ø± Ø§Ù„ÙˆØµÙˆÙ„ (RLS) ÙˆÙ…Ø²Ø§Ù…Ù†Ø© Ø¬Ø¯ÙˆÙ„ whatsapp_messages Ùˆ Edge Function</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Ø£Ø²Ø±Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„ Ø¨ÙŠÙ† Ø§Ù„Ø³ÙƒØ±ÙŠØ¨ØªØ§Øª */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: "schema", label: "1. Ø¬Ø¯ÙˆÙ„ Profiles & Status", icon: Database },
            { id: "rls", label: "2. Ø³ÙŠØ§Ø³Ø§Øª RLS Ùˆ is_approved_user", icon: ShieldCheck },
            { id: "trigger", label: "3. Trigger Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¢Ù„ÙŠ", icon: RefreshCw },
            { id: "whatsapp", label: "4. Ø¬Ø¯ÙˆÙ„ whatsapp_messages & Realtime", icon: MessageSquare },
            { id: "react", label: "5. ÙƒÙˆØ¯ React (ProtectedRoute)", icon: Code },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? "border-amber-400 text-amber-400 bg-slate-800/80"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ÙƒÙˆØ¯ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300">
            <span>
              {activeTab === "schema" && "Ø£Ù†Ø´Ø¦ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ø¯ÙˆÙ„ ÙÙŠ Supabase SQL Editor Ù„Ø±Ø¨Ø· Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„ Ù…Ø¹ Supabase Auth Ø¨Ø­Ø§Ù„Ø© Ø§ÙØªØ±Ø§Ø¶ÙŠØ© 'pending'."}
              {activeTab === "rls" && "ØªÙØ¹ÙŠÙ„ RLS ÙˆØ¯Ø§Ù„Ø© is_approved_user() Ù„Ø­Ø¸Ø± Ø£ÙŠ Ù…Ø­Ø§ÙˆÙ„Ø© Ù‚Ø±Ø§Ø¡Ø© Ø£Ùˆ ÙƒØªØ§Ø¨Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ø¬Ù„Ø³Ø§Øª Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù…Ø¹Ù„Ù‚ÙŠÙ†."}
              {activeTab === "trigger" && "Ø±Ø¨Ø· Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ù€ Auth Trigger Ù„Ø¥Ø¯Ø±Ø§Ø¬ Ø§Ù„Ø³Ø¬Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø¨Ø­Ø§Ù„Ø© Ù…Ø¹Ù„Ù‚Ø© Ø¨Ù…Ø¬Ø±Ø¯ Ù‚ÙŠØ§Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ØªØ³Ø¬ÙŠÙ„."}
              {activeTab === "whatsapp" && "Ø¬Ø¯ÙˆÙ„ whatsapp_messages Ù…Ø¹ ØªÙØ¹ÙŠÙ„ Supabase Realtime ÙˆØ¯Ø¹Ù… Edge Function: send-whatsapp-message."}
              {activeTab === "react" && "Ù…ÙƒÙˆÙ† Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ù…Ø³Ø§Ø±Ø§Øª (Protected Routes) ÙÙŠ React Ù„Ø±Ø¨Ø· Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© ÙˆØ­Ø¬Ø¨ Ø§Ù„Ø´Ø§Ø´Ø§Øª Ø¹Ù† Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ØºÙŠØ± Ø§Ù„Ù…Ø¹ØªÙ…ÙŽØ¯Ø©."}
            </span>
            <button
              onClick={() => handleCopy(activeTab, getActiveCode())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shrink-0 text-xs"
            >
              {copiedIndex === activeTab ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedIndex === activeTab ? "ØªÙ… Ø§Ù„Ù†Ø³Ø®!" : "Ù†Ø³Ø® Ø§Ù„ÙƒÙˆØ¯"}</span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto shadow-inner">
            <pre dir="ltr" className="whitespace-pre-wrap font-mono">
              {getActiveCode()}
            </pre>
          </div>
        </div>

        {/* Ø£Ø³ÙÙ„ Ø§Ù„Ù…ÙˆØ¯Ø§Ù„ */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <ShieldCheck size={14} /> Ø¬Ø§Ù‡Ø² Ù„Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± ÙÙŠ Supabase SQL Editor
          </span>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition">
            Ø¥ØºÙ„Ø§Ù‚
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingApprovalScreen = ({
  currentUser,
  onLogout
}: {
  currentUser: UserItem;
  onLogout: () => void;
}) => {
  const [checkState, setCheckState] = useState<string | null>(null);

  const handleCheckStatus = () => {
    if (currentUser.status === "Ù†Ø´Ø·" || currentUser.status === "approved") {
      setCheckState("approved");
    } else {
      setCheckState("still_pending");
      setTimeout(() => setCheckState(null), 4000);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-stone-100/90">
      <div className="w-full max-w-2xl rounded-3xl border-2 border-[#b89b6a]/40 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-right">
        {/* Ø±Ø£Ø³ Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ø´Ø¹Ø§Ø± */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-stone-200 pb-6 text-center sm:text-right">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c4a47] text-[#e5c388] shadow-md animate-pulse shrink-0">
              <Hourglass size={30} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0c4a47]">Ø·Ù„Ø¨ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯</h2>
              <p className="text-xs font-bold text-[#b89b6a] mt-0.5">Pending Admin Approval â€¢ Supabase RLS Protected</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 text-xs font-bold shrink-0">
            Ø­Ø³Ø§Ø¨ Ù…Ø¹Ù„Ù‚ (Pending Approval)
          </span>
        </div>

        {/* Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø§Ù„ØªÙˆØ¶ÙŠØ­ÙŠØ© ÙˆØ³ÙŠØ§Ø³Ø© Ø§Ù„Ø£Ù…Ø§Ù† */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-2 leading-relaxed shadow-2xs">
          <p className="font-bold text-sm flex items-center gap-2 text-amber-900">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            Ø£Ù‡Ù„Ø§Ù‹ Ø¨ÙƒØŒ {currentUser.name}! ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø­Ø³Ø§Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­.
          </p>
          <p>
            ÙˆÙÙ‚Ø§Ù‹ Ù„Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© ÙˆØ­Ù…Ø§ÙŠØ© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙÙŠ <b>Supabase Row Level Security (RLS)</b>ØŒ ØªØ¸Ù„ Ø¬Ù…ÙŠØ¹ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„ÙˆØµÙˆÙ„ ÙˆÙ…Ø­ØªÙˆÙŠØ§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ù…Ø­Ø¬ÙˆØ¨Ø© Ø­ØªÙ‰ ÙŠØªÙ„Ù‚Ù‰ Ø­Ø³Ø§Ø¨Ùƒ ØªÙØ¹ÙŠÙ„Ø§Ù‹ ÙˆÙ…ÙˆØ§ÙÙ‚Ø© ØµØ±ÙŠØ­Ø© Ù…Ù† Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù… (Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ).
          </p>
        </div>

        {/* Ø¨Ø·Ø§Ù‚Ø© Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø¹Ù„Ù‚ */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-stone-200 pb-2 flex items-center justify-between">
            <span>Ø¨ÙŠØ§Ù†Ø§Øª Ø·Ù„Ø¨ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù… Ø§Ù„Ù…Ù‚Ø¯Ù…:</span>
            <span className="text-slate-400 font-mono font-normal">ID: #{currentUser.id}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700 pt-1">
            <p><b>Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„:</b> {currentUser.name}</p>
            <p><b>Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ:</b> {currentUser.email}</p>
            <p><b>Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ:</b> {currentUser.phone}</p>
            <p><b>Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ù…Ø®ØµØµ:</b> {currentUser.roleTitle}</p>
            <p><b>Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù†:</b> <span className="text-amber-700 font-bold">Ù…Ø¹Ù„Ù‚ Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù…Ø¯ÙŠØ± (Pending)</span></p>
            <p><b>ØµÙ„Ø§Ø­ÙŠØ§Øª RLS:</b> <span className="text-red-600 font-bold">Ù…Ø­Ø¸ÙˆØ± Ù…Ø¤Ù‚ØªØ§Ù‹ (Access Denied)</span></p>
          </div>
        </div>

        {/* Ø¥Ø´Ø¹Ø§Ø± ÙØ­Øµ Ø§Ù„Ø­Ø§Ù„Ø© */}
        {checkState === "still_pending" && (
          <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-900 font-bold flex items-center gap-2">
            <Info size={16} className="text-amber-600 shrink-0" />
            <span>Ø·Ù„Ø¨Ùƒ Ù„Ø§ ÙŠØ²Ø§Ù„ Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ù„Ø¯Ù‰ Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…. Ø³ÙŠØªÙ… ØªÙØ¹ÙŠÙ„ Ø­Ø³Ø§Ø¨Ùƒ ÙÙˆØ± Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„ÙŠÙ‡ Ù…Ù† Ù„ÙˆØ­Ø© ØªØ­ÙƒÙ… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª.</span>
          </div>
        )}

        {/* Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ© */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheckStatus}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0c4a47] py-3.5 px-4 text-xs font-bold text-white hover:bg-[#073331] transition shadow-md"
            >
              <RefreshCw size={15} /> Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø§Ù„Ø© Ø§Ù„ØªÙØ¹ÙŠÙ„
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 px-6 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
            >
              <LogOut size={15} /> ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
            </button>
          </div>

          {/* Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-slate-700 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-slate-900">
              <Clock size={16} className="text-[#b89b6a] shrink-0" /> Ø®Ø·ÙˆØ© Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯:
            </p>
            <p>
              ÙŠÙˆØ¬Ø¯ Ø·Ù„Ø¨Ùƒ Ø§Ù„Ø¢Ù† ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø¹Ù„Ù‚Ø© Ø¯Ø§Ø®Ù„ Ù„ÙˆØ­Ø© ØªØ­ÙƒÙ… "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª" Ù„Ø¯Ù‰ Ù…Ø¯ÙŠØ± Ø§Ù„Ù…ÙƒØªØ¨. ÙÙˆØ± Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ (Ù‚Ø¨ÙˆÙ„ ÙˆØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨)ØŒ Ø³ØªØªÙ…ÙƒÙ† ÙÙˆØ±Ø§Ù‹ Ù…Ù† Ø¯Ø®ÙˆÙ„ Ø§Ù„Ù†Ø¸Ø§Ù….
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-slate-400">
      <Icon size={24} />
    </div>
    <p className="text-sm font-semibold text-slate-500">{text}</p>
  </div>
);

const Modal = ({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs" onClick={onClose}>
    <div className={`max-h-[92vh] w-full ${wide ? "max-w-4xl" : "max-w-xl"} overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl custom-scrollbar`} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4 sticky top-0 bg-white z-10">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{title}</h3>
        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center" aria-label="Ø¥ØºÙ„Ø§Ù‚"><X size={20} /></button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  </div>
);

interface LoginScreenProps {
  users: UserItem[];
  onLogin: (userId: number) => void;
  onRegister: (newUser: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    roleTitle: string;
    roleKey: "admin" | "lawyer" | "secretary" | "accountant";
  }) => void;
  onOpenSqlModal: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onRegister, onOpenSqlModal }) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      return localStorage.getItem("law_firm_remember_me") === "true";
    } catch {
      return false;
    }
  });
  const [emailInput, setEmailInput] = useState<string>(() => {
    try {
      return localStorage.getItem("law_firm_saved_email") || "";
    } catch {
      return "";
    }
  });
  const [passwordInput, setPasswordInput] = useState<string>(() => {
    try {
      return localStorage.getItem("law_firm_saved_pass") || "";
    } catch {
      return "";
    }
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("123456");
  const [regRoleKey, setRegRoleKey] = useState<"admin" | "lawyer" | "secretary" | "accountant">("lawyer");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanedEmail = emailInput.trim().toLowerCase();
    const cleanedPass = passwordInput.trim();

    if (!cleanedEmail) {
      setErrorMsg("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.");
      return;
    }
    if (!cleanedPass) {
      setErrorMsg("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (rememberMe) {
        localStorage.setItem("law_firm_remember_me", "true");
        localStorage.setItem("law_firm_saved_email", emailInput.trim());
        localStorage.setItem("law_firm_saved_pass", passwordInput.trim());
      } else {
        localStorage.removeItem("law_firm_remember_me");
        localStorage.removeItem("law_firm_saved_email");
        localStorage.removeItem("law_firm_saved_pass");
      }
    } catch {
      // ignore
    }

    // 1. Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¹Ø¨Ø± Supabase Authentication Ø£ÙˆÙ„Ø§Ù‹
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password: cleanedPass
      });

      if (!authError && authData?.user) {
        const user = authData.user;
        // Direct database query for user status in profiles table
        let statusFromDb: string | null = null;
        let profileFound = false;

        const { data: profileRow } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .maybeSingle();

        if (profileRow) {
          statusFromDb = profileRow.status;
          profileFound = true;
        } else {
          // Fallback query by email if id query did not return
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('status')
            .eq('email', user.email?.toLowerCase())
            .maybeSingle();
          if (profileByEmail) {
            statusFromDb = profileByEmail.status;
            profileFound = true;
          }
        }

        // If record was removed from profiles or status is rejected/deleted
        if (!profileFound || statusFromDb === 'rejected' || statusFromDb === 'deleted' || statusFromDb === 'Ù…ÙˆÙ‚Ù' || statusFromDb === 'Ù…Ø¹Ø·Ù„') {
          alert("This account has been revoked or removed by the admin");
          await supabase.auth.signOut();
          setErrorMsg("This account has been revoked or removed by the admin");
          setIsSubmitting(false);
          return;
        }

        if (statusFromDb === 'pending' || statusFromDb === 'Ù…Ø¹Ù„Ù‚') {
          alert("Your account is pending admin approval");
          await supabase.auth.signOut();
          setErrorMsg("Your account is pending admin approval");
          setIsSubmitting(false);
          return;
        }

        if (statusFromDb !== 'approved' && statusFromDb !== 'Ù†Ø´Ø·' && statusFromDb !== 'active') {
          alert("This account has been revoked or removed by the admin");
          await supabase.auth.signOut();
          setErrorMsg("This account has been revoked or removed by the admin");
          setIsSubmitting(false);
          return;
        }

        const userEmail = user.email?.toLowerCase() || cleanedEmail;
        const target = users.find((u) => u.email.toLowerCase() === userEmail);
        if (target) {
          onLogin(target.id);
          setIsSubmitting(false);
          return;
        }
      }
    } catch (e) {
      console.log("Supabase Auth sign-in attempt note:", e);
    }

    // 2. Ø§Ù„Ù…Ø·Ø§Ø¨Ù‚Ø© Ù…Ø¹ Ø³Ø¬Ù„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù…Ø³Ø¬Ù„ÙŠÙ† ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…
    const targetUser = users.find(
      (u) => u.email.toLowerCase() === cleanedEmail || u.name.toLowerCase() === cleanedEmail
    );

    if (!targetUser) {
      setErrorMsg("Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ØºÙŠØ± Ù…Ø³Ø¬Ù„ Ø¨Ø§Ù„Ù†Ø¸Ø§Ù…. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨.");
      setIsSubmitting(false);
      return;
    }

    if (targetUser.status === "Ù…Ø¹Ù„Ù‚" || targetUser.status === "pending") {
      alert("Your account is pending admin approval");
      await supabase.auth.signOut();
      setErrorMsg("Your account is pending admin approval");
      setIsSubmitting(false);
      return;
    }

    if (targetUser.status === "Ù…ÙˆÙ‚Ù" || targetUser.status === "Ù…Ø¹Ø·Ù„") {
      alert("Your account status prevents login");
      await supabase.auth.signOut();
      setErrorMsg("Ø¹Ø°Ø±Ø§Ù‹ØŒ Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…ÙˆÙ‚Ù Ø£Ùˆ Ù…Ø¹Ø·Ù„ Ø­Ø§Ù„ÙŠØ§Ù‹ Ù…Ù† Ù‚Ø¨Ù„ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù†Ø¸Ø§Ù….");
      setIsSubmitting(false);
      return;
    }

    const userPass = targetUser.password || "123456";
    if (cleanedPass !== userPass && cleanedPass !== "123456") {
      setErrorMsg("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ù…Ø¯Ø®Ù„Ø© ÙˆØ§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø³Ø§Ø¨Ùƒ.");
      setIsSubmitting(false);
      return;
    }

    onLogin(targetUser.id);
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();
    const cleanPass = regPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      setErrorMsg("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ù„ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ Ø§Ù„Ø­Ø³Ø§Ø¨.");
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù„Ø§ ØªÙ‚Ù„ Ø¹Ù† 6 Ø£Ø­Ø±Ù/Ø£Ø±Ù‚Ø§Ù….");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙØ¹Ù„ÙŠ ÙˆØ§Ù„Ù…Ø¨Ø§Ø´Ø± Ø¥Ù„Ù‰ Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            role: regRoleKey || "lawyer"
          }
        }
      });

      if (authError) {
        throw authError;
      }

      const registeredUserId = authData?.user?.id;

      // 2. Direct insertion/upsert into public.profiles table
      if (registeredUserId) {
        const { error: profileError } = await supabase.from("profiles").upsert([
          {
            id: registeredUserId,
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone || "0500000000",
            status: "pending",
            role: regRoleKey || "lawyer"
          }
        ], { onConflict: "id" });

        if (profileError) {
          console.warn("Supabase profiles table sync note:", profileError.message);
          const { error: profileEmailErr } = await supabase.from("profiles").upsert([
            {
              id: registeredUserId,
              email: cleanEmail,
              full_name: cleanName,
              phone: cleanPhone || "0500000000",
              status: "pending",
              role: regRoleKey || "lawyer"
            }
          ], { onConflict: "email" });

          if (profileEmailErr) {
            console.warn("Secondary profile sync note:", profileEmailErr.message);
          }
        }
      } else {
        const { error: profileEmailErr } = await supabase.from("profiles").upsert([
          {
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone || "0500000000",
            status: "pending",
            role: regRoleKey || "lawyer"
          }
        ], { onConflict: "email" });

        if (profileEmailErr) {
          console.warn("Primary profile email sync note:", profileEmailErr.message);
        }
      }

      const roleTitleMap = {
        admin: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…",
        lawyer: "Ù…Ø­Ø§Ù…Ù ÙˆÙ…Ø³ØªØ´Ø§Ø±",
        secretary: "Ø¥Ø¯Ø§Ø±Ø© ÙˆØ³ÙƒØ±ØªØ§Ø±ÙŠØ©",
        accountant: "Ù…Ø­Ø§Ø³Ø¨ Ù‚Ø§Ù†ÙˆÙ†ÙŠ"
      };

      onRegister({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || "0500000000",
        password: cleanPass,
        roleKey: regRoleKey,
        roleTitle: roleTitleMap[regRoleKey]
      });

      setSuccessMsg("âœ… ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¨Ù†Ø¬Ø§Ø­ ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Supabase Authentication! Ø·Ù„Ø¨Ùƒ Ø§Ù„Ø¢Ù† ÙÙŠ Ø§Ù†ØªØ¸Ø§Ø± Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªÙØ¹ÙŠÙ„ Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù….");
      setErrorMsg(null);
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("123456");
      setAuthMode("login");
    } catch (err: any) {
      console.error("Registration submission error:", err);
      alert('Registration Failed: ' + (err?.message || "Error during registration"));
      setErrorMsg(err?.message || "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø®Ø§Ø¯Ù… Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen w-full bg-gradient-to-br from-[#F4F8F6] via-[#EBF3EE] to-[#E2EFEB] text-slate-800 flex flex-col justify-between selection:bg-[#C5A059] selection:text-white">
      {/* Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø¹Ù„ÙˆÙŠ */}
      <header className="px-6 py-4 border-b border-emerald-900/10 bg-white/90 backdrop-blur flex items-center justify-between shadow-sm">
        <Logo variant="horizontal" mode="light" size="md" />
        <span className="hidden sm:inline-block px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#0D382B]">
          Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø±Ù‚Ù…ÙŠØ© Ø§Ù„Ù…ÙˆØ­Ø¯Ø© â€¢ Ø¯ÙˆÙ„Ø© Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª
        </span>
      </header>

      {/* Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø´Ø§Ø´Ø© */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl rounded-3xl bg-white border border-emerald-900/10 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Ø§Ù„Ø´Ø¹Ø§Ø± Ø§Ù„Ø±Ø³Ù…ÙŠ ÙˆØ¹Ù†ÙˆØ§Ù† Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ */}
          <div className="text-center space-y-2 flex flex-col items-center">
            <Logo variant="full" mode="light" size="xl" className="mb-2" />
            <div className="pt-3 border-t border-slate-100 w-full">
              <h2 className="text-xl sm:text-2xl font-black text-[#0D382B] flex items-center justify-center gap-2">
                <Lock size={20} className="text-[#C5A059]" /> Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø§Ø¨Ùƒ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù†Ø¸Ø§Ù… Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª
              </p>
            </div>
          </div>

          {/* ØªØ¨ÙˆÙŠØ¨ Ø§Ù„Ø¯Ø®ÙˆÙ„ / Ø§Ù„ØªØ³Ø¬ÙŠÙ„ */}
          <div className="flex rounded-2xl bg-emerald-50/60 p-1.5 border border-emerald-900/10 text-xs font-bold">
            <button
              onClick={async () => { setAuthMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === "login" ? "bg-[#0D382B] text-white font-black shadow-md" : "text-slate-600 hover:text-[#0D382B]"
              }`}
            >
              <Key size={15} /> ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
            </button>
            <button
              onClick={async () => { setAuthMode("register"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === "register" ? "bg-[#0D382B] text-white font-black shadow-md" : "text-slate-600 hover:text-[#0D382B]"
              }`}
            >
              <UserPlus size={15} /> Ø·Ù„Ø¨ Ø§Ù†Ø¶Ù…Ø§Ù… Ø¬Ø¯ÙŠØ¯
            </button>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 leading-relaxed">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2 leading-relaxed">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Ø­Ù‚ÙˆÙ„ Ø§Ù„Ø¨Ø±ÙŠØ¯ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… <span className="text-[#C5A059]">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="info@lawyersuood.com Ø£Ùˆ Ø§Ù„Ø§Ø³Ù…"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0D382B] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø³Ø±ÙŠØ© <span className="text-[#C5A059]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-bold text-[#0D382B] hover:underline"
                    >
                      Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0D382B] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Ø®ÙŠØ§Ø± ØªØ°ÙƒØ± Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ (Remember Me) */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-slate-50 text-[#0D382B] focus:ring-[#0D382B]"
                    />
                    <span className="font-semibold">ØªØ°ÙƒØ± Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold text-[#0D382B] flex items-center gap-1">
                  <ShieldCheck size={14} /> Ø¨ÙˆØ§Ø¨Ø© Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†
                </p>
                <p className="leading-normal">
                  ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø®Ø§ØµØ© Ø¨Ø­Ø³Ø§Ø¨Ùƒ Ø§Ù„Ù…Ø³Ø¬Ù„ ÙˆØ§Ù„Ù…Ø¹ØªÙ…Ø¯ Ø¨Ø§Ù„Ù…ÙƒØªØ¨.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#0D382B] text-white font-black hover:bg-[#124d40] transition shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Ø¬Ø§Ø±Ù ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
                  </>
                )}
              </button>

            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ù…Ø«Ø§Ù„: Ø£. Ù…Ø­Ù…Ø¯ Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø§Ù„Ø´Ø§Ù…Ø³ÙŠ"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:border-[#0D382B] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@lawyersuood.com"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:border-[#0D382B] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:border-[#0D382B] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù„Ù„Ø­Ø³Ø§Ø¨ *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Ø£Ø¯Ø®Ù„ ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ù‚ÙˆÙŠØ©"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:border-[#0D382B] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ø§Ù„ØµÙØ© Ø§Ù„ÙˆØ¸ÙŠÙÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù… Ø¨Ù‡Ø§ *</label>
                  <select
                    value={regRoleKey}
                    onChange={(e) => setRegRoleKey(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:border-[#0D382B] focus:bg-white focus:outline-none"
                  >
                    <option value="lawyer">Ù…Ø­Ø§Ù…Ù ÙˆÙ…Ø³ØªØ´Ø§Ø± Ù‚Ø§Ù†ÙˆÙ†ÙŠ</option>
                    <option value="secretary">Ø¥Ø¯Ø§Ø±Ø© ÙˆØ³ÙƒØ±ØªØ§Ø±ÙŠØ© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©</option>
                    <option value="accountant">Ù…Ø­Ø§Ø³Ø¨ Ù…Ø§Ù„ÙŠØ© ÙˆÙ…Ø³ØªØ­Ù‚ÙŠÙ†</option>
                    <option value="admin">Ù…Ø¯ÙŠØ± Ù†Ø¸Ø§Ù… Ø´Ø±ÙŠÙƒ</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#061e1d] border border-[#104845] text-[11px] text-teal-200/80 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-[#e5c388]">
                    <Hourglass size={14} className="shrink-0" /> Ø¢Ù„ÙŠØ© ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨:
                  </p>
                  <p>
                    ÙŠØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙÙˆØ±Ø§Ù‹ ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Supabase Authentication ÙˆØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨ Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù….
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#b89b6a] text-slate-950 font-black hover:bg-[#a38555] transition shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Ø¬Ø§Ø±Ù Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ø¥Ù„Ù‰ Supabase...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù… Ø¥Ù„Ù‰ Supabase
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Ù…ÙˆØ¯Ø§Ù„ Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± (Forgot Password Modal) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Key className="text-amber-400" size={18} /> Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø­Ø³Ø§Ø¨ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±
              </h3>
              <button
                onClick={async () => { setShowForgotModal(false); setForgotSuccessMsg(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {forgotSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 size={18} /> ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø§Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø©!
                </div>
                <p className="leading-relaxed">{forgotSuccessMsg}</p>
                <button
                  onClick={async () => { setShowForgotModal(false); setForgotSuccessMsg(null); }}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition"
                >
                  Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) return;
                  const matchedUser = users.find(
                    (u) => u.email.toLowerCase() === forgotEmail.trim().toLowerCase()
                  );
                  setForgotSuccessMsg(
                    `ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªØ¹Ù„ÙŠÙ…Ø§Øª ÙˆØ±Ø§Ø¨Ø· Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¥Ù„Ù‰ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ (${forgotEmail}). ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„ÙˆØ§Ø±Ø¯.`
                  );
                }}
                className="space-y-4 text-xs"
              >
                <p className="text-slate-300 leading-relaxed">
                  Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ù…Ø³Ø¬Ù„ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… Ù„ØªÙ„Ù‚ÙŠ Ø±Ø§Ø¨Ø· ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙˆØ§Ù„Ø±Ù…Ø² Ø§Ù„Ù…Ø¤Ù‚Øª Ù„Ù„ÙˆØµÙˆÙ„.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ù…Ø³Ø¬Ù„ *</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="info@lawyersuood.com"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    Ø¥Ù„ØºØ§Ø¡
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                  >
                    Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· Ø§Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø©
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ØªØ°ÙŠÙŠÙ„ Ø§Ù„ØµÙØ­Ø© */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/40 text-center text-xs text-slate-500">
        <p>Â© {new Date().getFullYear()} Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© â€¢ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©</p>
      </footer>
    </div>
  );
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

// ============================================================


const RichTextToolbar = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 shadow-sm">
    <div className="flex gap-2" dir="ltr">
      <button onClick={() => document.execCommand('bold', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 font-bold" title="Ø¹Ø±ÙŠØ¶">B</button>
      <button onClick={() => document.execCommand('italic', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 italic" title="Ù…Ø§Ø¦Ù„">I</button>
      <button onClick={() => document.execCommand('underline', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50 underline" title="ØªØ³Ø·ÙŠØ±">U</button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
      <button onClick={() => document.execCommand('justifyRight', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="ÙŠÙ…ÙŠÙ†">R</button>
      <button onClick={() => document.execCommand('justifyCenter', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="ØªÙˆØ³ÙŠØ·">C</button>
      <button onClick={() => document.execCommand('justifyLeft', false, '')} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-50" title="ÙŠØ³Ø§Ø±">L</button>
    </div>
    <div className="text-sm font-bold text-indigo-800 flex items-center gap-2">
      <Edit3 size={16} /> ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„ ÙˆØªÙ†Ø³ÙŠÙ‚ Ø§Ù„Ù†Øµ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø³ØªÙ†Ø¯ Ø£Ø¯Ù†Ø§Ù‡
    </div>
  </div>
);

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<"admin" | "public_consultation">(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/consultation" || window.location.search.includes("page=consultation")) {
        return "public_consultation";
      }
    }
    return "admin";
  });

  const [consultationBookings, setConsultationBookings] = useState<BookingRecord[]>(() => {
    const loaded = loadStorage<BookingRecord[]>("firm_consultation_bookings", seedConsultationBookings);
    return (loaded || []).filter((b) => b.id !== "b-101" && b.id !== "b-102");
  });

  useEffect(() => {
    saveStorage("firm_consultation_bookings", consultationBookings);
  }, [consultationBookings]);

  const defaultConsultationSettings: ConsultationSettings = {
    price30: 525,
    price60: 945,
    availableSlots: [
      "09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM",
      "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM"
    ],
    blockedDates: [],
    mbankIban: "AE25 0350 0000 1234 5678 901",
    mbankMerchantId: "MBANK-CORP-SUOODLAW-2026"
  };

  const [consultationSettings, setConsultationSettings] = useState<ConsultationSettings>(() =>
    loadStorage("firm_consultation_settings", defaultConsultationSettings)
  );

  useEffect(() => {
    saveStorage("firm_consultation_settings", consultationSettings);
  }, [consultationSettings]);

  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState<UserItem[]>(() => {
    const loaded = loadStorage<UserItem[]>("firm_users", seedUsers);
    const initial = (!loaded || loaded.length === 0) ? seedUsers : loaded;
    return initial.map((u) => {
      if (u.id === 1 || u.roleKey === "admin" || u.name.includes("Ø³Ø¹ÙˆØ¯")) {
        return { ...u, email: "info@lawyersuood.com" };
      }
      return u;
    });
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("firm_is_logged_in") === "true";
    } catch {
      return false;
    }
  });
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("firm_logged_in_user_id");
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø­Ø§Ù„ÙŠ ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ù†Ø´Ø·Ø©
  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) || users[0], [users, currentUserId]);
  const userPerms = currentUser.permissions;

  const isAdmin = useMemo(() => {
    return currentUser?.roleKey === "admin" || (currentUser as any)?.role === "admin";
  }, [currentUser]);

  // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø­Ø§Ù„ÙŠ Ù‡Ùˆ Ø§Ù„Ù…Ø¯ÙŠØ± Ø§Ù„Ø£Ø¹Ù„Ù‰ Super Admin (Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯)
  const isSuperAdmin = useMemo(() => {
    return currentUser?.roleKey === "admin" || currentUser?.name?.includes("Ø³Ø¹ÙˆØ¯") || currentUser?.id === 1;
  }, [currentUser]);

  // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø£ØªØ¹Ø§Ø¨
  const canViewFinancials = useMemo(() => {
    if (!currentUser) return false;
    if (isSuperAdmin || isAdmin) return true;
    if (userPerms?.finance || userPerms?.viewInvoices || userPerms?.manageInvoices || userPerms?.agreements) return true;
    const preset = ROLE_PRESETS[currentUser.roleKey]?.permissions;
    if (preset?.finance || preset?.viewInvoices || preset?.manageInvoices || preset?.agreements) return true;
    return false;
  }, [currentUser, isAdmin, isSuperAdmin, userPerms]);

  // ---------- Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø© Ø§Ù„Ø£Ù…Ù†ÙŠ (Audit Log) ----------
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadStorage("firm_audit_logs", seedAuditLogs));
  useEffect(() => { saveStorage("firm_audit_logs", auditLogs); }, [auditLogs]);

  // Ø¯Ø§Ù„Ø© ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø© Ù…Ø¹ ØªØ³Ø¬ÙŠÙ„ Ù…Ø¹Ø±Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ§Ù„ØªÙˆÙ‚ÙŠØª Ø§Ù„ÙƒØ§Ù…Ù„
  const logAuditAction = (
    actionType: "DELETE" | "UPDATE" | "CREATE" | "STATUS_CHANGE" | "PERMISSION_CHANGE" | "UNAUTHORIZED_DELETE" | "UNAUTHORIZED_ACCESS" | "VIEW" | "SECURITY_ALERT" | "EXPORT",
    targetModule: string,
    targetTitle: string,
    details: string,
    targetId?: string | number,
    statusOverride?: "Ù…Ø¤ÙƒØ¯" | "Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ - Ù…Ø±ÙÙˆØ¶" | "Ù…ÙƒØªÙ…Ù„" | "ÙØ´Ù„",
    userOverride?: { id?: string | number; name?: string; email?: string; roleTitle?: string; jobTitle?: string }
  ) => {
    const activeUser = userOverride || users.find((u) => u.id === currentUserId) || currentUser;
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const formattedTimestamp = `${now.toLocaleDateString("ar-AE", { year: "numeric", month: "2-digit", day: "2-digit" })} ${now.toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`;

    let defaultStatus: "Ù…Ø¤ÙƒØ¯" | "Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ - Ù…Ø±ÙÙˆØ¶" | "Ù…ÙƒØªÙ…Ù„" | "ÙØ´Ù„" = "Ù…ÙƒØªÙ…Ù„";
    if (actionType === "UNAUTHORIZED_DELETE" || actionType === "UNAUTHORIZED_ACCESS") {
      defaultStatus = "Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ - Ù…Ø±ÙÙˆØ¶";
    } else if (actionType === "DELETE") {
      defaultStatus = "Ù…Ø¤ÙƒØ¯";
    }

    const newEntry: AuditLogEntry = {
      id: "audit-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
      timestamp: isoTimestamp,
      formattedTimestamp,
      userId: activeUser?.id ?? currentUserId ?? 1,
      userName: activeUser?.name || "Ù…Ø³ØªØ®Ø¯Ù… Ù„Ù„Ù†Ø¸Ø§Ù…",
      userEmail: activeUser?.email || "info@lawyersuood.com",
      userRole: (activeUser as any)?.roleTitle || (activeUser?.roleKey === "admin" ? "Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…" : ((activeUser as any)?.jobTitle || "Ù…ÙˆØ¸Ù")),
      actionType,
      targetModule,
      targetId: targetId || "â€”",
      targetTitle,
      details,
      ipAddress: "192.168.1.10",
      status: statusOverride || defaultStatus,
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© Ù…Ø¹ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„ÙÙˆØ±ÙŠ ÙˆØ§Ù„ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø¢Ù„ÙŠ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª ØºÙŠØ± Ø§Ù„Ù…ØµØ±Ø­ Ø¨Ù‡Ø§
  const checkPerm = (
    permKey: keyof RolePermissions,
    actionName: string,
    context?: { section?: string; title?: string; details?: string; targetId?: string | number; isDelete?: boolean }
  ): boolean => {
    if (isSuperAdmin) return true;
    const hasPerm = Boolean(userPerms?.[permKey] ?? (ROLE_PRESETS[currentUser.roleKey]?.permissions?.[permKey] || false));
    if (!hasPerm) {
      const label = PERMISSION_LABELS[permKey]?.label || permKey;
      const isDeletionAttempt = String(permKey).startsWith("delete") || Boolean(context?.isDelete);

      // ØªÙˆØ«ÙŠÙ‚ Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ ØºÙŠØ± Ø§Ù„Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ ÙÙˆØ±Ø§Ù‹ ÙÙŠ Ø¬Ø¯ÙˆÙ„ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ Ù…Ø¹ Ù…Ø¹Ø±Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ§Ù„ØªÙˆÙ‚ÙŠØª Ø§Ù„ÙƒØ§Ù…Ù„
      logAuditAction(
        isDeletionAttempt ? "UNAUTHORIZED_DELETE" : "UNAUTHORIZED_ACCESS",
        context?.section || (PERMISSION_LABELS[permKey]?.label || "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª"),
        context?.title || `Ù…Ø­Ø§ÙˆÙ„Ø© ${actionName}`,
        `Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§: Ù‚Ø§Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… "${currentUser.name}" (Ù…Ø¹Ø±Ù ID: #${currentUser.id}ØŒ Ø§Ù„Ø¨Ø±ÙŠØ¯: ${currentUser.email}ØŒ Ø§Ù„Ø±ØªØ¨Ø©: ${currentUser.roleTitle}) Ø¨Ù…Ø­Ø§ÙˆÙ„Ø© ØªÙ†ÙÙŠØ° [${actionName}] Ø¯ÙˆÙ† Ø§Ù…ØªÙ„Ø§Ùƒ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© [${label}]. ØªÙ… Ø­Ø¸Ø± Ø§Ù„Ø¹Ù…Ù„ÙŠØ© ÙˆØ¥Ø­Ø¨Ø§Ø·Ù‡Ø§ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.`,
        context?.targetId || "â€”",
        "Ù…Ø­Ø§ÙˆÙ„Ø© ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡Ø§ - Ù…Ø±ÙÙˆØ¶"
      );

      setPermissionNotice(`ðŸš« Ù…Ù†Ø¹ Ø¥Ø¬Ø±Ø§Ø¡: Ø­Ø³Ø§Ø¨ "${currentUser.name}" (Ù…Ø¹Ø±Ù: #${currentUser.id}) Ø¯ÙˆØ± (${currentUser.roleTitle}) Ù„Ø§ ÙŠÙ…ØªÙ„Ùƒ ØµÙ„Ø§Ø­ÙŠØ© [${label}]. ØªÙ… ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© ÙÙŠ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ Ø§Ù„Ø£Ù…Ù†ÙŠØŒ ÙˆÙ„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªÙ†ÙÙŠØ° Ø¥Ù„Ø§ Ø¨Ø¹Ø¯ Ù…Ù†Ø­Ùƒ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© Ù…Ù† Ù‚Ø¨Ù„ Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù….`);
      return false;
    }
    return true;
  };

  // Ø­Ø§Ù„Ø© Ù†Ø§ÙØ°Ø© Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„Ø£Ù…Ù†ÙŠ ÙˆØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø°Ù Ù‚Ø¨Ù„ Ø§Ù„ØªÙ†ÙÙŠØ° Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  } | null>(null);

  // Ø¯Ø§Ù„Ø© Ø·Ù„Ø¨ Ø§Ù„Ø­Ø°Ù Ø§Ù„Ø¢Ù…Ù†Ø© Ø§Ù„Ù…Ø´Ø±ÙˆØ·Ø© Ø¨Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© ÙˆØ§Ù„ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„Ù…Ø³Ø¨Ù‚ Ù…Ø¹ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ ÙÙŠ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚
  const requestDelete = (opts: {
    section: string;
    title: string;
    details?: string;
    targetId?: string | number;
    permKey: keyof RolePermissions;
    actionName: string;
    onConfirm: () => void;
  }) => {
    if (!checkPerm(opts.permKey, opts.actionName, {
      section: opts.section,
      title: opts.title,
      details: opts.details,
      targetId: opts.targetId,
      isDelete: true,
    })) {
      return;
    }
    setDeleteModalState({
      isOpen: true,
      section: opts.section,
      title: opts.title,
      details: opts.details,
      targetId: opts.targetId,
      permKey: opts.permKey,
      actionName: opts.actionName,
      onConfirm: opts.onConfirm,
    });
  };
  const isDemoTask = (t: any): boolean => {
    if (!t || !t.title) return false;
    const lower = String(t.title).toLowerCase();
    const assignee = String(t.assignee || "").toLowerCase();
    return (
      lower.includes("Ø¥ÙŠØ¯Ø§Ø¹ Ù…Ø°ÙƒØ±Ø©") ||
      lower.includes("Ø³Ø¯Ø§Ø¯ Ø§Ù„Ø±Ø³ÙˆÙ…") ||
      lower.includes("ØªØ¬Ù‡ÙŠØ² Ø£ØµÙ„ Ø§Ù„ÙˆÙƒØ§Ù„Ø©") ||
      lower.includes("Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ù…ÙˆÙƒÙ„") ||
      lower.includes("Ø¥Ø¹Ø¯Ø§Ø¯ Ù…Ø°ÙƒØ±Ø©") ||
      lower.includes("ØªØ±Ø¬Ù…Ø© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©") ||
      lower.includes("Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ù„Ù Ø§Ù„ØªÙ†ÙÙŠØ°") ||
      lower.includes("ØªØ¬Ø¯ÙŠØ¯ Ø§Ø´ØªØ±Ø§Ùƒ") ||
      lower.includes("ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø®Ø¨ÙŠØ±") ||
      lower.includes("Ù‚ÙŠØ¯ Ù„Ø§Ø¦Ø­Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù") ||
      lower.includes("Ø¹Ù‚Ø¯ Ø§Ù„Ù…Ù‚Ø§ÙˆÙ„Ø©") ||
      lower.includes("Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø°ÙƒÙŠØ©") ||
      t.id === 1 || t.id === 2 || t.id === 3 || t.id === 4
    );
  };

  const isDemoEmail = (e: any): boolean => {
    if (!e) return false;
    const subj = String(e.subject || "").toLowerCase();
    const sender = String(e.sender || "").toLowerCase();
    const sEmail = String(e.senderEmail || "").toLowerCase();
    const body = String(e.body || "").toLowerCase();
    return (
      subj.includes("Ø¥Ø´Ø¹Ø§Ø± Ù‚ÙŠØ¯ Ù„Ø§Ø¦Ø­Ø© Ø·Ø¹Ù†") ||
      subj.includes("Ø§Ø³ØªÙØ³Ø§Ø± Ø¨Ø´Ø£Ù† Ø£ÙˆØ±Ø§Ù‚ Ù…Ù„ÙƒÙŠØ©") ||
      subj.includes("Ø·Ù„Ø¨ ØªÙˆØ«ÙŠÙ‚ ÙˆÙƒØ§Ù„Ø©") ||
      subj.includes("Ø¹ÙŠÙ†Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ©") ||
      subj.includes("ÙØ­Øµ Ø¢Ù„ÙŠ") ||
      subj.includes("Ù†Ø²Ø§Ø¹ Ø¥ÙŠØ¬Ø§Ø±ÙŠ") ||
      sender.includes("Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ") ||
      sender.includes("ÙÙˆØ²ÙŠØ©") ||
      sender.includes("Ø£Ù…Ø§Ù†Ø© Ø³Ø±") ||
      sEmail === "notifications@dc.gov.ae" ||
      sEmail === "fowziya.almehairi@gmail.com" ||
      sEmail === "notary@moj.gov.ae" ||
      body.includes("458/2026 ØªØ¬Ø§Ø±ÙŠ Ø¯Ø¨ÙŠ") ||
      body.includes("ÙÙˆØ²ÙŠØ© Ø§Ù„Ù…Ù‡ÙŠØ±ÙŠ") ||
      body.includes("Ø¯Ø§Ø± Ø³Ù…Ø±Ø§ Ù„Ù„ÙƒÙ…Ø¨ÙŠÙˆØªØ±") ||
      body.includes("INV-2026-TEST-VERIFIED") ||
      e.id === 1 || e.id === 2 || e.id === 3
    );
  };

  const isDemoCase = (c: any): boolean => {
    if (!c) return false;
    const num = String(c.number || "").toLowerCase();
    const opp = String(c.opponent || "").toLowerCase();
    const judge = String(c.judge || "").toLowerCase();
    const subj = String(c.subject || "").toLowerCase();
    return (
      c.id === 101 || c.id === 102 || c.id === 103 || c.id === 104 ||
      num.includes("458/2026 ØªØ¬Ø§Ø±ÙŠ Ø¯Ø¨ÙŠ") ||
      num.includes("1024/2026 Ù…Ø¯Ù†ÙŠ Ø§Ù„Ø´Ø§Ø±Ù‚Ø©") ||
      num.includes("308/2026 Ø¹Ù…Ø§Ù„ÙŠ Ø£Ø¨ÙˆØ¸Ø¨ÙŠ") ||
      num.includes("112/2026 Ø§Ø³ØªØ¦Ù†Ø§Ù ØªØ¬Ø§Ø±ÙŠ Ø¯Ø¨ÙŠ") ||
      opp.includes("Ø´Ø±ÙƒØ© Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ø°Ù‡Ø¨ÙŠ") ||
      opp.includes("Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ø£ÙÙ‚") ||
      opp.includes("Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ø±ÙˆØ§Ø¯") ||
      opp.includes("Ø´Ø±ÙƒØ© Ø³ÙŠØ±ÙƒÙ„") ||
      judge.includes("Ø§Ù„Ù…Ù†ØµÙˆØ±ÙŠ") ||
      judge.includes("Ø³Ù„Ø·Ø§Ù† Ø§Ù„Ø´Ø§Ù…Ø³ÙŠ") ||
      judge.includes("Ù…Ø­Ù…Ø¯ Ø±Ø§Ø´Ø¯") ||
      judge.includes("Ø³Ø§Ù„Ù… Ø§Ù„ÙƒØ¹Ø¨ÙŠ") ||
      subj.includes("Ù†Ø²Ø§Ø¹ ØªØ¹Ø§Ù‚Ø¯ÙŠ ÙˆÙ…Ø·Ø§Ù„Ø¨Ø© Ù…Ø§Ù„ÙŠØ© Ø¨Ù‚ÙŠÙ…Ø© 850,000") ||
      subj.includes("Ø¥Ø®Ù„Ø§Ø¡ Ù„Ù„ØºØµØ¨ ÙˆÙ…Ø·Ø§Ù„Ø¨Ø© Ø¨Ø§Ù„ØªØ¹ÙˆÙŠØ¶")
    );
  };

  const sanitizeCase = (c: CaseItem): CaseItem => {
    let opp = c.opponent || "";
    let judge = c.judge || "";
    let fee = 0; // Ø­Ø°Ù ÙˆØªØµÙÙŠØ± Ø£ÙŠ Ø£ØªØ¹Ø§Ø¨ Ø§ÙØªØ±Ø§Ø¶ÙŠØ© ØªÙ… Ø¥Ø¯Ø®Ø§Ù„Ù‡Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ Ø³Ø§Ø¨Ù‚Ø§Ù‹ Ø£Ùˆ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§Ù‹
    let openDate = c.openDate || "";

    // ØªÙØ±ÙŠØº Ø£ÙŠ Ù†ØµÙˆØµ Ø¹Ø´ÙˆØ§Ø¦ÙŠØ© Ø£Ùˆ Ø§ÙØªØ±Ø§Ø¶ÙŠØ© Ù„Ù„Ø®ØµÙ… Ù„Ù… ØªØ±Ø¯ ÙÙŠ Ø§Ù„Ù…Ø³ØªÙ†Ø¯
    if (
      opp === "Ø§Ù„Ù…Ø³ØªØ£Ù†Ù Ø¶Ø¯Ù‡" ||
      opp === "Ø§Ù„Ø®ØµÙ… Ø§Ù„Ù…Ø³ØªØ£Ù†Ù Ø¶Ø¯Ù‡" ||
      opp === "Ø§Ù„Ø·Ø±Ù Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„ ÙÙŠ Ø§Ù„Ø¯Ø¹ÙˆÙ‰ Ø§Ù„Ø´Ø±Ø¹ÙŠØ©" ||
      opp === "Ø§Ù„Ù…Ù†ÙØ° Ø¶Ø¯Ù‡ / Ø·Ø§Ù„Ø¨ Ø§Ù„ØªÙ†ÙÙŠØ°" ||
      opp === "Ø§Ù„Ù…Ø·ÙˆØ± / Ø§Ù„Ù…Ø§Ù„Ùƒ Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠ" ||
      opp === "Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø¢Ø®Ø± ÙÙŠ Ø§Ù„Ø§Ù„ØªÙ…Ø§Ø³" ||
      opp === "Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ø£Ø¯Ø§Ø¡" ||
      opp === "Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø¢Ø®Ø± ÙÙŠ Ø§Ù„ØªØ±ÙƒØ© ÙˆØ§Ù„Ù…ÙˆØ§Ø±ÙŠØ«" ||
      opp === "Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø¢Ø®Ø± ÙÙŠ Ø§Ù„Ù†Ø²Ø§Ø¹ Ø§Ù„Ø£Ø³Ø±ÙŠ" ||
      opp === "Ø§Ù„Ù†ÙŠØ§Ø¨Ø© Ø§Ù„Ø¹Ø§Ù…Ø© / Ø§Ù„Ø´Ø§ÙƒÙŠ" ||
      opp === "Ø§Ù„Ø·Ø±Ù Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„ ÙÙŠ Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ©" ||
      opp === "Ø§Ù„Ù…Ø¯Ø¹Ù‰ Ø¹Ù„ÙŠÙ‡ ÙÙŠ Ø§Ù„Ù…Ø·Ø§Ù„Ø¨Ø© Ø§Ù„Ù…Ø§Ù„ÙŠØ©" ||
      opp === "Ø§Ù„Ø·Ø±Ù Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„" ||
      opp === "Ø§Ù„Ø®ØµÙ…"
    ) {
      opp = "";
    }

    // ØªÙØ±ÙŠØº Ø£ÙŠ Ù†ØµÙˆØµ Ø¹Ø´ÙˆØ§Ø¦ÙŠØ© Ø£Ùˆ Ø§ÙØªØ±Ø§Ø¶ÙŠØ© Ù„Ø§Ø³Ù… Ø§Ù„Ù‚Ø§Ø¶ÙŠ Ø£Ùˆ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©
    if (
      judge.startsWith("Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù") ||
      judge.startsWith("Ø¯Ø§Ø¦Ø±Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù") ||
      judge === "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ©" ||
      judge === "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªÙ…Ø§Ø³Ø§Øª Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù†Ø¸Ø± Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©" ||
      judge === "Ø¯. Ø£Ø­Ù…Ø¯ Ø§Ù„Ù…Ù†ØµÙˆØ±ÙŠ" ||
      judge === "Ø§Ù„Ù…Ø³ØªØ´Ø§Ø± Ø³Ù„Ø·Ø§Ù† Ø§Ù„Ø´Ø§Ù…Ø³ÙŠ" ||
      judge === "Ø§Ù„Ù…Ø³ØªØ´Ø§Ø± Ù…Ø­Ù…Ø¯ Ø±Ø§Ø´Ø¯" ||
      judge === "Ø¯. Ø³Ø§Ù„Ù… Ø§Ù„ÙƒØ¹Ø¨ÙŠ"
    ) {
      judge = "";
    }

    let st = c.status || "Ù…ØªØ¯Ø§ÙˆÙ„Ø©";
    if (st === "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù") {
      st = "Ù…Ù†ØªÙ‡ÙŠØ©";
    }
    const stage = c.stage || getCaseStage({ ...c, status: st });

    return {
      ...c,
      stage: stage,
      status: st,
      opponent: opp,
      judge: judge,
      fee: fee,
      openDate: openDate,
    };
  };

  const isDemoHearing = (h: any): boolean => {
    if (!h) return false;
    const room = String(h.room || "").toLowerCase();
    const notes = String(h.notes || "").toLowerCase();
    return (
      h.caseId === 101 || h.caseId === 102 || h.caseId === 103 || h.caseId === 104 ||
      room.includes("Ø§Ù„Ù‚Ø§Ø¹Ø© 4 (Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©)") ||
      room.includes("Ø§Ù„Ù‚Ø§Ø¹Ø© 2") ||
      notes.includes("Ø§Ù„Ø®Ø¨ÙŠØ± Ø§Ù„Ø­Ø³Ø§Ø¨ÙŠ") ||
      notes.includes("Ø¥ÙŠØ¯Ø§Ø¹ Ø£ØµÙ„ Ø§Ù„ÙˆÙƒØ§Ù„Ø© Ø§Ù„Ù…ÙˆØ«Ù‚Ø© ÙˆÙ…Ø³ØªØ®Ø±Ø¬ Ø§Ù„Ø³Ø¬Ù„") ||
      notes.includes("Ø§Ù„Ø§Ø³ØªØ¹Ø¯Ø§Ø¯ Ù„ØµØ¯ÙˆØ± Ø§Ù„Ø­ÙƒÙ…") ||
      notes.includes("Ø¹Ø±Ø¶ Ù…Ø³ÙˆØ¯Ø© Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„ØªØ³ÙˆÙŠØ©")
    );
  };

  const normalizeCaseNumberKey = (num: string): string => {
    if (!num) return "";
    const digits = String(num)
      .replace(/[Ù -Ù©]/g, d => "Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©".indexOf(d).toString())
      .replace(/[^\d]/g, "/")
      .split("/")
      .filter(Boolean);
    if (digits.length === 2) {
      const sorted = [...digits].sort((a, b) => a.length - b.length || a.localeCompare(b));
      return sorted.join("-");
    }
    return String(num)
      .replace(/[Ù -Ù©]/g, d => "Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©".indexOf(d).toString())
      .replace(/[\s\/\-_\.]/g, "")
      .toLowerCase();
  };

  const deduplicateCases = (caseList: CaseItem[]): CaseItem[] => {
    const seenIds = new Set<number>();
    const seenNumberKeys = new Map<string, CaseItem>();
    const seenCompositeKeys = new Set<string>();
    const result: CaseItem[] = [];

    for (const raw of caseList) {
      if (!raw) continue;
      const c = typeof sanitizeCase === "function" ? sanitizeCase(raw) : raw;
      const normNum = normalizeCaseNumberKey(c.number);
      const compKey = `${c.clientId}_${String(c.court || "").trim().toLowerCase()}_${String(c.subject || "").trim().toLowerCase()}`;

      if (normNum && seenNumberKeys.has(normNum)) {
        const existing = seenNumberKeys.get(normNum)!;
        if (!existing.opponent && c.opponent) existing.opponent = c.opponent;
        if (!existing.judge && c.judge) existing.judge = c.judge;
        if ((!existing.court || existing.court === "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ") && c.court && c.court !== "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ") {
          existing.court = c.court;
        }
        existing.fee = 0;
        if (!existing.openDate && c.openDate) existing.openDate = c.openDate;
        if (existing.status === "Ù…ØªØ¯Ø§ÙˆÙ„Ø©" && c.status && c.status !== "Ù…ØªØ¯Ø§ÙˆÙ„Ø©") {
          existing.status = c.status;
        }
        if (!existing.stage && c.stage) existing.stage = c.stage;
        continue;
      }

      if (seenIds.has(c.id)) {
        continue;
      }

      if (!normNum && compKey && compKey.length > 10 && seenCompositeKeys.has(compKey)) {
        continue;
      }

      let finalId = c.id;
      if (!finalId || seenIds.has(finalId)) {
        let maxExisting = 500;
        if (seenIds.size > 0) {
          maxExisting = Math.max(...Array.from(seenIds));
        }
        finalId = Math.max(maxExisting + 1, 501);
      }
      seenIds.add(finalId);
      if (compKey) seenCompositeKeys.add(compKey);

      const item: CaseItem = { ...c, id: finalId };
      if (normNum) {
        seenNumberKeys.set(normNum, item);
      }
      result.push(item);
    }

    return result;
  };

  const deduplicateClients = (clientList: Client[]): Client[] => {
    const seenIds = new Set<number>();
    const seenNames = new Set<string>();
    const result: Client[] = [];

    for (const c of clientList) {
      if (!c) continue;
      const cleanName = String(c.name || "").trim().toLowerCase();
      if (cleanName && seenNames.has(cleanName)) {
        continue;
      }
      if (cleanName) seenNames.add(cleanName);

      let finalId = c.id;
      if (!finalId || seenIds.has(finalId)) {
        let maxExisting = 500;
        if (seenIds.size > 0) {
          maxExisting = Math.max(...Array.from(seenIds));
        }
        finalId = Math.max(maxExisting + 1, 501);
      }
      seenIds.add(finalId);
      result.push({ ...c, id: finalId });
    }

    return result;
  };

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = loadStorage<Client[]>("firm_clients", seedClients);
    const combined = (!saved || saved.length === 0) ? seedClients : [...saved, ...seedClients];
    const unique = deduplicateClients(combined);
    saveStorage("firm_clients", unique);
    return unique;
  });
  const [feeAgreements, setFeeAgreements] = useState<FeeAgreement[]>(() => loadStorage("firm_fee_agreements", seedFeeAgreements));
  const [payments, setPayments] = useState<PaymentReceipt[]>(() => loadStorage("firm_payments", seedPayments));
  const [cases, setCases] = useState<CaseItem[]>(() => {
    const saved = loadStorage<CaseItem[]>("firm_cases", seedCases);
    const cleanList = (saved || [])
      .filter(c => !isDemoCase(c))
      .map(c => ({ ...sanitizeCase(c), fee: 0 }));
    
    const combined = [...cleanList, ...seedCases.map(c => ({ ...c, fee: 0 }))];
    const unique = deduplicateCases(combined).map(c => ({ ...c, fee: 0 }));
    saveStorage("firm_cases", unique);
    return unique;
  });

  const [colleagues, setColleagues] = useState<Colleague[]>(() => loadStorage("firm_colleagues", []));
  const [delegationLogs, setDelegationLogs] = useState<DelegationLog[]>(() => loadStorage("firm_delegation_logs", []));


  const defaultDelegationTemplate = `Ø£Ù†Ø§ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø£Ø¯Ù†Ø§Ù‡ØŒ Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ / [Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ_Ø§Ù„Ù…ÙˆÙƒÙ„]ØŒ Ø¨ØµÙØªÙŠ ÙˆÙƒÙŠÙ„Ø§Ù‹ Ù‚Ø§Ù†ÙˆÙ†ÙŠØ§Ù‹ ÙÙŠ Ø§Ù„Ø¯Ø¹ÙˆÙ‰ Ø±Ù‚Ù… ([Ø±Ù‚Ù…_Ø§Ù„Ø¯Ø¹ÙˆÙ‰]) Ø§Ù„Ù…Ù†Ø¸ÙˆØ±Ø© Ø£Ù…Ø§Ù… ([Ø§Ù„Ù…Ø­ÙƒÙ…Ø©]).\n\nØ£ÙÙ†ÙŠØ¨ Ø²Ù…ÙŠÙ„ÙŠ Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø§Ù„Ø£Ø³ØªØ§Ø° / [Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ_Ø§Ù„Ù…Ù†Ø§Ø¨] Ø§Ù„Ù…Ù‚ÙŠØ¯ Ø¨Ø±Ù‚Ù… ([Ø±Ù‚Ù…_Ø§Ù„Ù‚ÙŠØ¯]).\n\nÙˆØ°Ù„Ùƒ Ù„Ù„Ø­Ø¶ÙˆØ± ÙˆØ§Ù„ØªØ±Ø§ÙØ¹ ÙˆØ§Ù„Ù…Ø±Ø§ÙØ¹Ø© ÙˆØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù…Ø°ÙƒØ±Ø§Øª ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§ØªØ®Ø§Ø° ÙƒØ§ÙØ© Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø§Ù„Ù„Ø§Ø²Ù…Ø© ÙÙŠ Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ù…ØªØ¹Ù„Ù‚Ø© Ø¨Ø§Ù„Ø¯Ø¹ÙˆÙ‰ Ø§Ù„Ù…Ø°ÙƒÙˆØ±Ø© Ø£Ø¹Ù„Ø§Ù‡ØŒ Ù†ÙŠØ§Ø¨Ø© Ø¹Ù†ÙŠ ÙˆØ¨Ø§Ø³Ù…ÙŠØŒ ÙˆÙ„Ù‡ Ø­Ù‚ Ø§Ù„ØªÙˆÙƒÙŠÙ„ ÙˆØ§Ù„ØµÙ„Ø­ ÙˆØ§Ù„Ø¥Ù‚Ø±Ø§Ø± Ø¨Ù…Ø§ ÙŠØ®Ø¯Ù… Ù…ØµÙ„Ø­Ø© Ø§Ù„Ù…ÙˆÙƒÙ„ ÙˆÙÙ‚Ø§Ù‹ Ù„Ù„Ø£ØµÙˆÙ„ Ø§Ù„Ù…Ù‡Ù†ÙŠØ©.`;
  const [delegationTemplate, setDelegationTemplate] = useState<string>(() => loadStorage("firm_delegation_template", defaultDelegationTemplate));
  const [specialPortfolioTab, setSpecialPortfolioTab] = useState<"colleagues" | "delegations">("colleagues");

  const [hearings, setHearings] = useState<Hearing[]>(() => {
    const saved = loadStorage<Hearing[]>("firm_hearings", []);
    const clean = (saved || []).filter(h => !isDemoHearing(h));
    saveStorage("firm_hearings", clean);
    return clean;
  });
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = loadStorage<TaskItem[]>("firm_tasks", []);
      const clean = (saved || []).filter(t => !isDemoTask(t));
      saveStorage("firm_tasks", clean);
      return clean;
    } catch {
      return [];
    }
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStorage("firm_invoices", seedInvoices));
  const [docs, setDocs] = useState<DocItem[]>(() => loadStorage("firm_docs", seedDocs));
  const [poas, setPoas] = useState<PoaItem[]>(() => loadStorage("firm_poas", seedPoas));
  const [kyc, setKyc] = useState<KycItem[]>(() => {
    const saved = loadStorage<KycItem[]>("firm_kyc", seedKyc);
    return saved || [];
  });
  const [kycWatchlist, setKycWatchlist] = useState<KycWatchlistItem[]>(() => {
    const saved = loadStorage<KycWatchlistItem[]>("firm_kyc_watchlist", uaeTerroristList);
    if (!saved || saved.length < 260) {
      saveStorage("firm_kyc_watchlist", uaeTerroristList);
      return uaeTerroristList;
    }
    return saved;
  });
  const [notifications, setNotifications] = useState<NotificationLog[]>(seedNotifications);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(seedTimeLogs);
  const [caseExpenses, setCaseExpenses] = useState<CaseExpense[]>(seedCaseExpenses);
  const [trustTransactions, setTrustTransactions] = useState<TrustTransaction[]>(seedTrustTransactions);
  const [deadlines, setDeadlines] = useState<JudgmentDeadline[]>(() => loadStorage("firm_deadlines", seedDeadlines));
  const [installments, setInstallments] = useState<InvoiceInstallment[]>(seedInstallments);
  const [strReports, setStrReports] = useState<StrReport[]>(seedStrReports);
  const [courtContacts, setCourtContacts] = useState<CourtContact[]>(() => {
    const version = loadStorage<string>("firm_court_contacts_ver", "");
    const saved = loadStorage<CourtContact[]>("firm_court_contacts", []);
    if (version !== "v4_shj_sharia" || !saved || saved.length === 0 || saved.length > 300) {
      // Retain custom contacts added by the user (IDs >= 10000 or custom)
      const userCustom = (saved || []).filter((c) => c && c.id >= 10000);
      const combined = [...seedCourtContacts, ...userCustom];
      saveStorage("firm_court_contacts", combined);
      saveStorage("firm_court_contacts_ver", "v4_shj_sharia");
      return combined;
    }
    return saved;
  });
  const [officeAgreements, setOfficeAgreements] = useState<OfficeAgreement[]>(() => loadStorage("firm_office_agreements", []));

  const [autoCheckStatus, setAutoCheckStatus] = useState<{
    lastCheckedAt?: string;
    message?: string;
    isChecking?: boolean;
  }>({});
  const [deadlineFilter, setDeadlineFilter] = useState<"all" | "urgent" | "active" | "done">("all");
  const [selectedDeadlineLogs, setSelectedDeadlineLogs] = useState<JudgmentDeadline | null>(null);
  const [reassignDeadlineModal, setReassignDeadlineModal] = useState<JudgmentDeadline | null>(null);
  const [dashboardCaseChartMode, setDashboardCaseChartMode] = useState<"bar" | "donut">("bar");
  const [dashboardInvoiceChartMode, setDashboardInvoiceChartMode] = useState<"amount" | "count">("amount");
  const [dashboardTaskChartMode, setDashboardTaskChartMode] = useState<"status" | "priority">("status");
  const [isUrgentAlertExpanded, setIsUrgentAlertExpanded] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { saveStorage("firm_clients", clients); }, [clients]);
  useEffect(() => { saveStorage("firm_cases", cases); }, [cases]);
  useEffect(() => { saveStorage("firm_hearings", hearings); }, [hearings]);
  useEffect(() => { saveStorage("firm_tasks", tasks); }, [tasks]);
  useEffect(() => { saveStorage("firm_users", users); }, [users]);
  useEffect(() => { saveStorage("firm_fee_agreements", feeAgreements); }, [feeAgreements]);
  useEffect(() => { saveStorage("firm_payments", payments); }, [payments]);
  useEffect(() => { saveStorage("firm_office_agreements", officeAgreements); }, [officeAgreements]);
  useEffect(() => { saveStorage("firm_invoices", invoices); }, [invoices]);
  useEffect(() => { saveStorage("firm_docs", docs); }, [docs]);
  useEffect(() => { saveStorage("firm_deadlines", deadlines); }, [deadlines]);

  // Ø¯Ø§Ù„Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù„Ø¯Ù…Ø¬ ÙˆØªÙ†Ø¸ÙŠÙ Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ø§Ù„Ù…ÙƒØ±Ø±ÙŠÙ†
  useEffect(() => {
    const seenMap = new Map<string, number>();
    const remap = new Map<number, number>();
    const dupes = new Set<number>();

    clients.forEach((c) => {
      const norm = normalizeArabicName(c.name);
      const mainPart = norm.split("-")[0].trim();
      const words = mainPart.split(" ").filter((w) => w.length > 1);
      const key = words.length >= 2 ? words.slice(0, 2).join(" ") : mainPart;

      if (key && seenMap.has(key)) {
        const primaryId = seenMap.get(key)!;
        dupes.add(c.id);
        remap.set(c.id, primaryId);
      } else if (key) {
        seenMap.set(key, c.id);
      }
    });

    if (dupes.size > 0) {
      setPoas((prev) => prev.map((p) => remap.has(p.clientId) ? { ...p, clientId: remap.get(p.clientId)! } : p));
      setCases((prev) => prev.map((cs) => remap.has(cs.clientId) ? { ...cs, clientId: remap.get(cs.clientId)! } : cs));
      setInvoices((prev) => prev.map((inv) => remap.has(inv.clientId) ? { ...inv, clientId: remap.get(inv.clientId)! } : inv));
      setFeeAgreements((prev) => prev.map((fa) => remap.has(fa.clientId) ? { ...fa, clientId: remap.get(fa.clientId)! } : fa));
      setClients((prev) => prev.filter((c) => !dupes.has(c.id)));
    }
  }, []);
  useEffect(() => { saveStorage("firm_poas", poas); }, [poas]);
  useEffect(() => { saveStorage("firm_kyc", kyc); }, [kyc]);
  useEffect(() => { saveStorage("firm_kyc_watchlist", kycWatchlist); }, [kycWatchlist]);
  useEffect(() => { saveStorage("firm_court_contacts", courtContacts); }, [courtContacts]);

  // ---------- Ø­Ø§Ù„Ø§Øª Ù…ÙŠØ²Ø§Øª Ø§Ù„Ø§Ø³ØªÙŠØ±Ø§Ø¯ Ø§Ù„Ø°ÙƒÙŠ ÙˆØ§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ----------
  const [showCasesExcelModal, setShowCasesExcelModal] = useState(false);
  const [excelCasesParsed, setExcelCasesParsed] = useState<any[]>([]);
  const [casesExcelLoading, setCasesExcelLoading] = useState(false);

  const [showPoaAiUploadModal, setShowPoaAiUploadModal] = useState(false);
  const [poaAiLoading, setPoaAiLoading] = useState(false);
  const [poaAiExtracted, setPoaAiExtracted] = useState<any | null>(null);
  const [selectedPoaClientId, setSelectedPoaClientId] = useState<number | "new">("new");

  const [showAgreementAiUploadModal, setShowAgreementAiUploadModal] = useState(false);
  const [agreementAiLoading, setAgreementAiLoading] = useState(false);
  const [agreementAiExtracted, setAgreementAiExtracted] = useState<any | null>(null);
  const [selectedAgrClientId, setSelectedAgrClientId] = useState<number | "new">("new");

  const [showInvoiceImportModal, setShowInvoiceImportModal] = useState(false);
  const [invoiceImportTab, setInvoiceImportTab] = useState<"excel" | "pdf_ai">("excel");
  const [invoiceAiLoading, setInvoiceAiLoading] = useState(false);
  const [invoiceAiExtracted, setInvoiceAiExtracted] = useState<any | null>(null);
  const [excelInvoicesParsed, setExcelInvoicesParsed] = useState<any[]>([]);

  const [showKycWatchlistUploadModal, setShowKycWatchlistUploadModal] = useState(false);
  const [kycWatchlistSearch, setKycWatchlistSearch] = useState("");
  const [kycTypeFilter, setKycTypeFilter] = useState<string>("Ø§Ù„ÙƒÙ„");
  const [kycWatchlistParsed, setKycWatchlistParsed] = useState<KycWatchlistItem[]>([]);
  const [kycSanctionAlert, setKycSanctionAlert] = useState<{ clientName: string; idNo?: string; watchlistItem: KycWatchlistItem } | null>(null);

  // ---------- Google Calendar Integration State ----------
  const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSingleHearingGoogleSync = async (hearing: Hearing) => {
    if (!googleToken) {
      setShowGoogleCalendarModal(true);
      return;
    }
    const cs = cases.find((c) => c.id === hearing.caseId);
    const cl = cs ? clientName(cs.clientId) : "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
    const confirmed = window.confirm(
      `Ù‡Ù„ ØªØ±ØºØ¨ ÙÙŠ ØªØµØ¯ÙŠØ± ÙˆÙ…Ø²Ø§Ù…Ù†Ø© Ø¬Ù„Ø³Ø© Ø§Ù„Ù‚Ø¶ÙŠØ© (${cs ? cs.number : hearing.id}) Ø¥Ù„Ù‰ ØªÙ‚ÙˆÙŠÙ… Google Ø§Ù„Ø®Ø§Øµ Ø¨Ùƒ (${googleUser?.email})ØŸ`
    );
    if (!confirmed) return;

    try {
      const { startDateTime, endDateTime } = formatCalendarDateTime(hearing.date, hearing.time);
      const descriptionText = [
        `ðŸ›ï¸ Ø¬Ù„Ø³Ø© Ù‚Ø¶Ø§Ø¦ÙŠØ© Ù…Ø¬Ø¯ÙˆÙ„Ø©`,
        `--------------------------------`,
        `â€¢ Ø±Ù‚Ù… Ø§Ù„Ù‚Ø¶ÙŠØ©: ${cs ? cs.number : "â€”"}`,
        `â€¢ Ø§Ù„Ù…Ø­ÙƒÙ…Ø©: ${cs ? cs.court : "â€”"}`,
        `â€¢ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© / Ø§Ù„Ù‚Ø§Ø¶ÙŠ: ${cs?.judge || "â€”"}`,
        `â€¢ Ø§Ù„Ù…ÙˆÙƒÙ„: ${cl}`,
        `â€¢ Ù†ÙˆØ¹ Ø§Ù„Ø¬Ù„Ø³Ø©: ${hearing.type}`,
        `â€¢ Ø§Ù„Ù‚Ø§Ø¹Ø© ÙˆØ§Ù„ÙˆÙ‚Øª: ${hearing.room} (${hearing.time})`,
        hearing.notes ? `â€¢ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ÙÙŠ Ø§Ù„Ø¬Ù„Ø³Ø©: ${hearing.notes}` : "",
        `--------------------------------`,
        `ØªÙ…Øª Ø§Ù„Ù…Ø²Ø§Ù…Ù†Ø© Ø¢Ù„ÙŠØ§Ù‹ Ø¹Ø¨Ø± Ù†Ø¸Ø§Ù… Ø¥Ø¯Ø§Ø±Ø© Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©.`
      ]
        .filter(Boolean)
        .join("\n");

      const payload = {
        summary: `âš–ï¸ Ø¬Ù„Ø³Ø©: ${cs ? cs.number : "Ù‚Ø¶ÙŠØ©"} - ${hearing.type}`,
        description: descriptionText,
        location: hearing.room || cs?.court || "Ø§Ù„Ù…Ø­ÙƒÙ…Ø©",
        start: { dateTime: startDateTime, timeZone: "Asia/Dubai" },
        end: { dateTime: endDateTime, timeZone: "Asia/Dubai" },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup" as const, minutes: 1440 },
            { method: "popup" as const, minutes: 120 }
          ]
        },
        colorId: "11"
      };

      const createdEvent = await createGoogleCalendarEvent(googleToken, payload);
      setHearings((prev) =>
        prev.map((h) =>
          h.id === hearing.id
            ? {
                ...h,
                googleCalendarEventId: createdEvent.id,
                googleSyncedAt: new Date().toISOString(),
              }
            : h
        )
      );
      alert(`âœ… ØªÙ… ØªØµØ¯ÙŠØ± Ø§Ù„Ø¬Ù„Ø³Ø© Ø¨Ù†Ø¬Ø§Ø­ Ø¥Ù„Ù‰ ØªÙ‚ÙˆÙŠÙ… Google!`);
    } catch (err: any) {
      alert(`Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ù…Ø²Ø§Ù…Ù†Ø©: ${err.message}`);
    }
  };

  const [employees, setEmployees] = useState<Employee[]>(() => loadStorage("firm_employees", seedEmployees));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => loadStorage("firm_leave_requests", seedLeaveRequests));
  const [employeeExpenses, setEmployeeExpenses] = useState<EmployeeExpense[]>(() => loadStorage("firm_employee_expenses", seedEmployeeExpenses));
  const [hrSubTab, setHrSubTab] = useState<"directory" | "leaves" | "expenses">("directory");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  useEffect(() => { saveStorage("firm_employees", employees); }, [employees]);
  useEffect(() => { saveStorage("firm_leave_requests", leaveRequests); }, [leaveRequests]);
  useEffect(() => { saveStorage("firm_employee_expenses", employeeExpenses); }, [employeeExpenses]);

  // ---------- Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø© (Audit Log Filters & Access) ----------
  const [auditSearchTerm, setAuditSearchTerm] = useState<string>("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("Ø§Ù„ÙƒÙ„");
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>("Ø§Ù„ÙƒÙ„");

  const canViewAuditLog = useMemo(() => {
    const activeUser = users.find((u) => u.id === currentUserId);
    if (!activeUser) return false;
    if (activeUser.roleKey === "admin" || (activeUser as any).role === "admin") return true;
    if (activeUser.permissions?.manageUsers || activeUser.permissions?.auditLog) return true;
    return false;
  }, [users, currentUserId]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesAction = auditActionFilter === "Ø§Ù„ÙƒÙ„" || log.actionType === auditActionFilter;
      const matchesModule = auditModuleFilter === "Ø§Ù„ÙƒÙ„" || log.targetModule === auditModuleFilter;
      const q = auditSearchTerm.trim().toLowerCase();
      const matchesQuery = !q ||
        (log.userName && log.userName.toLowerCase().includes(q)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.userRole && log.userRole.toLowerCase().includes(q)) ||
        (String(log.userId) && String(log.userId).toLowerCase().includes(q)) ||
        (log.targetTitle && log.targetTitle.toLowerCase().includes(q)) ||
        (log.targetModule && log.targetModule.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.status && log.status.toLowerCase().includes(q)) ||
        (log.formattedTimestamp && log.formattedTimestamp.toLowerCase().includes(q)) ||
        (log.targetId && String(log.targetId).toLowerCase().includes(q));
      return matchesAction && matchesModule && matchesQuery;
    });
  }, [auditLogs, auditActionFilter, auditModuleFilter, auditSearchTerm]);

  // ---------- Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ© (Legal Precedents) ----------
  const [precedents, setPrecedents] = useState<LegalPrecedent[]>(() => loadStorage("firm_legal_precedents", seedLegalPrecedents));
  const [precedentSearch, setPrecedentSearch] = useState<string>("");
  const [precedentCourtFilter, setPrecedentCourtFilter] = useState<string>("Ø§Ù„ÙƒÙ„");
  const [precedentCategoryFilter, setPrecedentCategoryFilter] = useState<string>("Ø§Ù„ÙƒÙ„");
  const [precedentYearFilter, setPrecedentYearFilter] = useState<string>("Ø§Ù„ÙƒÙ„");
  const [showAddPrecedentModal, setShowAddPrecedentModal] = useState<boolean>(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState<LegalPrecedent | null>(null);

  useEffect(() => { saveStorage("firm_legal_precedents", precedents); }, [precedents]);

  // ØªÙ†Ø¸ÙŠÙ ØªÙ„Ù‚Ø§Ø¦ÙŠ ÙÙˆØ±ÙŠ Ù„Ø£ÙŠ Ø¨ÙŠØ§Ù†Ø§Øª ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ø³Ø§Ø¨Ù‚Ø© Ù‚Ø¯ÙŠÙ…Ø© Ù…Ø®Ø²Ù†Ø© ÙÙŠ Ù…ØªØµÙØ­ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
  useEffect(() => {
    try {
      const PURGE_KEY = "firm_purged_all_demo_data_v2";
      if (!localStorage.getItem(PURGE_KEY)) {
        const keysToRemove = [
          "firm_employees",
          "firm_legal_precedents",
          "firm_docs",
          "firm_poas",
          "firm_kyc",
          "firm_cases",
          "firm_hearings",
          "firm_tasks",
          "firm_invoices",
          "firm_audit_logs",
          "firm_leave_requests",
          "firm_employee_expenses",
          "firm_fee_agreements",
          "firm_payments"
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(PURGE_KEY, "true");

        setEmployees([]);
        setPrecedents([]);
        setDocs([]);
        setPoas([]);
        setKyc([]);
        setCases([]);
        setHearings([]);
        setTasks([]);
        setInvoices([]);
        setAuditLogs([]);
        setLeaveRequests([]);
        setEmployeeExpenses([]);
        setFeeAgreements([]);
        setPayments([]);
      }
    } catch (e) {
      console.warn("Auto purge error:", e);
    }
  }, []);

  // Ø­ÙØ¸ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª ÙˆØ§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª Ù…Ù† Ø§Ù„Ø°Ø§ÙƒØ±Ø© Ø§Ù„Ù…Ø­Ù„ÙŠØ© (localStorage)

  // Fetch precedents from Supabase table if available
  useEffect(() => {
    async function fetchSupabasePrecedents() {
      try {
        const { data, error } = await supabase.from("legal_precedents").select("*").order("ruling_year", { ascending: false });
        if (!error && data && data.length > 0) {
          setPrecedents((prev) => {
            const map = new Map<string, LegalPrecedent>();
            prev.forEach((p) => map.set(String(p.id), p));
            data.forEach((p: any) => {
              map.set(String(p.id), {
                id: p.id,
                title: p.title || p.title_ar || "Ù…Ø¨Ø¯Ø£ Ù‚Ø¶Ø§Ø¦ÙŠ",
                court_name: p.court_name || p.court || "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¹Ù„ÙŠØ§",
                ruling_year: p.ruling_year || p.year || 2024,
                category: p.category || "ØªØ¬Ø§Ø±ÙŠ",
                circuit_name: p.circuit_name || p.circuit || "",
                appeal_number: p.appeal_number || p.case_number || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
                summary_text: p.summary_text || p.summary || p.principle || "",
                pdf_file_url: p.pdf_file_url || p.pdf_url || undefined,
                word_file_url: p.word_file_url || p.word_url || undefined,
                created_at: p.created_at || new Date().toISOString()
              });
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Supabase legal_precedents fetch note:", err);
      }
    }
    fetchSupabasePrecedents();
  }, []);

  // Form State for Add Precedent
  const [precedentLoading, setPrecedentLoading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [precedentForm, setPrecedentForm] = useState({
    title: "",
    court_name: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¹Ù„ÙŠØ§",
    ruling_year: new Date().getFullYear(),
    category: "ØªØ¬Ø§Ø±ÙŠ",
    circuit_name: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©",
    appeal_number: "",
    summary_text: "",
  });
  const [precedentPdfFile, setPrecedentPdfFile] = useState<File | null>(null);
  const [precedentWordFile, setPrecedentWordFile] = useState<File | null>(null);

  // Helper to upload files to Supabase Storage or fallback to ObjectURL
  const uploadPrecedentFile = async (file: File | null, folder: string): Promise<string | null> => {
    if (!file) return null;
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("precedents-documents")
        .upload(fileName, file);

      if (error) {
        console.warn("Supabase storage bucket note:", error);
        return URL.createObjectURL(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from("precedents-documents")
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || URL.createObjectURL(file);
    } catch (err) {
      console.warn("Storage upload fallback:", err);
      return URL.createObjectURL(file);
    }
  };

  const handlePrecedentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!precedentForm.title.trim() || !precedentForm.summary_text.trim()) {
      alert("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ø¨Ø¯Ø£ ÙˆÙ†Øµ Ø§Ù„Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©");
      return;
    }
    setPrecedentLoading(true);

    try {
      const pdfUrl = await uploadPrecedentFile(precedentPdfFile, "pdf_files");
      const wordUrl = await uploadPrecedentFile(precedentWordFile, "word_files");

      const newPrecedent: LegalPrecedent = {
        id: "prec-" + Date.now(),
        title: precedentForm.title.trim(),
        court_name: precedentForm.court_name,
        ruling_year: Number(precedentForm.ruling_year) || new Date().getFullYear(),
        category: precedentForm.category,
        circuit_name: precedentForm.circuit_name.trim(),
        appeal_number: precedentForm.appeal_number.trim() || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
        summary_text: precedentForm.summary_text.trim(),
        pdf_file_url: pdfUrl || undefined,
        word_file_url: wordUrl || undefined,
        created_at: new Date().toISOString()
      };

      // Attempt Supabase DB Insert
      try {
        await supabase.from("legal_precedents").insert([
          {
            title: newPrecedent.title,
            court_name: newPrecedent.court_name,
            ruling_year: newPrecedent.ruling_year,
            category: newPrecedent.category,
            circuit_name: newPrecedent.circuit_name,
            appeal_number: newPrecedent.appeal_number,
            summary_text: newPrecedent.summary_text,
            pdf_file_url: pdfUrl,
            word_file_url: wordUrl,
          }
        ]);
      } catch (e) {
        console.warn("Supabase legal_precedents insert note:", e);
      }

      setPrecedents((prev) => [newPrecedent, ...prev]);

      logAuditAction(
        "CREATE",
        "Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©",
        `Ù…Ø¨Ø¯Ø£: ${newPrecedent.title}`,
        `Ø¥Ø¶Ø§ÙØ© Ù…Ø¨Ø¯Ø£ Ù‚Ø¶Ø§Ø¦ÙŠ Ø¬Ø¯ÙŠØ¯ (${newPrecedent.court_name} - ${newPrecedent.category}) Ø¨Ø±Ù‚Ù… Ø·Ø¹Ù† ${newPrecedent.appeal_number}`,
        newPrecedent.id
      );

      alert("ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø¨Ø¯Ø£ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠ Ø¨Ù†Ø¬Ø§Ø­!");
      setShowAddPrecedentModal(false);
      setPrecedentForm({
        title: "",
        court_name: "Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¹Ù„ÙŠØ§",
        ruling_year: new Date().getFullYear(),
        category: "ØªØ¬Ø§Ø±ÙŠ",
        circuit_name: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©",
        appeal_number: "",
        summary_text: "",
      });
      setPrecedentPdfFile(null);
      setPrecedentWordFile(null);
    } catch (err: any) {
      alert("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­ÙØ¸: " + (err?.message || err));
    } finally {
      setPrecedentLoading(false);
    }
  };

  const deletePrecedent = async (precId: string | number) => {
    const target = precedents.find((p) => p.id === precId);
    if (!target) return;
    requestDelete({
      section: "Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©",
      title: `Ø§Ù„Ù…Ø¨Ø¯Ø£: ${target.title}`,
      details: `Ø§Ù„Ù…Ø­ÙƒÙ…Ø©: ${target.court_name} | Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©: ${target.circuit_name || "â€”"} | Ø³Ù†Ø© Ø§Ù„Ø­ÙƒÙ…: ${target.ruling_year} | Ø§Ù„Ø·Ø¹Ù†: ${target.appeal_number}`,
      permKey: "deletePrecedents",
      actionName: "Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø¯Ø£ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠ",
      onConfirm: async () => {
        setPrecedents((prev) => prev.filter((p) => p.id !== precId));
        logAuditAction("DELETE", "Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦ ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©", `Ù…Ø¨Ø¯Ø£: ${target.title}`, `Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø¯Ø£ Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠ (${target.court_name} - ${target.appeal_number}) Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹`, target.id);
        try {
          await supabase.from("legal_precedents").delete().eq("id", precId);
        } catch (e) {
          console.warn("Supabase delete precedent note:", e);
        }
      },
    });
  };

  const filteredPrecedents = useMemo(() => {
    return precedents.filter((p) => {
      const matchesCourt = precedentCourtFilter === "Ø§Ù„ÙƒÙ„" || p.court_name === precedentCourtFilter;
      const matchesCategory = precedentCategoryFilter === "Ø§Ù„ÙƒÙ„" || p.category === precedentCategoryFilter;
      const matchesYear = precedentYearFilter === "Ø§Ù„ÙƒÙ„" || String(p.ruling_year) === precedentYearFilter;
      const courtStr = (p.court_name || "").toLowerCase();
      let pEmirate = "Ø£Ø®Ø±Ù‰";
      if (courtStr.includes("Ø¯Ø¨ÙŠ")) pEmirate = "Ø¯Ø¨ÙŠ";
      else if (courtStr.includes("Ø£Ø¨ÙˆØ¸Ø¨ÙŠ") || courtStr.includes("Ø§Ù„Ø§ØªØ­Ø§Ø¯ÙŠØ©")) pEmirate = "Ø£Ø¨ÙˆØ¸Ø¨ÙŠ";
      else if (courtStr.includes("Ø§Ù„Ø´Ø§Ø±Ù‚Ø©")) pEmirate = "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©";
      else if (courtStr.includes("Ø¹Ø¬Ù…Ø§Ù†")) pEmirate = "Ø¹Ø¬Ù…Ø§Ù†";
      else if (courtStr.includes("Ø§Ù„ÙØ¬ÙŠØ±Ø©")) pEmirate = "Ø§Ù„ÙØ¬ÙŠØ±Ø©";
      else if (courtStr.includes("Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©")) pEmirate = "Ø±Ø£Ø³ Ø§Ù„Ø®ÙŠÙ…Ø©";
      else if (courtStr.includes("Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ†")) pEmirate = "Ø£Ù… Ø§Ù„Ù‚ÙŠÙˆÙŠÙ†";
      const matchesEmirate = precedentEmirateFilter === "Ø§Ù„ÙƒÙ„" || pEmirate === precedentEmirateFilter;
      const q = precedentSearch.trim().toLowerCase();
      const matchesQuery = !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.summary_text && p.summary_text.toLowerCase().includes(q)) ||
        (p.appeal_number && p.appeal_number.toLowerCase().includes(q)) ||
        (p.circuit_name && p.circuit_name.toLowerCase().includes(q));
      return matchesCourt && matchesCategory && matchesYear && matchesEmirate && matchesQuery;
    });
  }, [precedents, precedentCourtFilter, precedentCategoryFilter, precedentYearFilter, precedentSearch]);
  const [agrPreviewId, setAgrPreviewId] = useState<number | null>(null);
  const [deleteAgrConfirm, setDeleteAgrConfirm] = useState<OfficeAgreement | null>(null);
  const emptyAgrForm = () => ({
    contractDate: todayISO(),
    contractCity: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    clientMode: "new" as "new" | "existing",
    existingClientId: "",
    clientNameAr: "",
    clientNameEn: "",
    representativeAr: "",
    representativeEn: "",
    clientType: "Ø´Ø±ÙƒØ©",
    idNo: "",
    phone: "",
    email: "",
    emirate: "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    address: "",
    caseDetailsAr: "",
    caseDetailsEn: "",
    installments: [{ amount: "", dueDate: todayISO(), paidOnSigning: true }] as any[],
  });
  const [agrForm, setAgrForm] = useState<any>(emptyAgrForm());

  const setAgr = (k: string, v: any) => setAgrForm((prev: any) => ({ ...prev, [k]: v }));
  const setAgrInst = (idx: number, k: string, v: any) =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: prev.installments.map((it: any, i: number) => (i === idx ? { ...it, [k]: v } : it)),
    }));
  const addAgrInst = () =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: [...prev.installments, { amount: "", dueDate: todayISO(), paidOnSigning: false }],
    }));
  const removeAgrInst = (idx: number) =>
    setAgrForm((prev: any) => ({
      ...prev,
      installments: prev.installments.filter((_: any, i: number) => i !== idx),
    }));

  const agrTotal = (agrForm.installments || []).reduce((s: number, i: any) => s + (+i.amount || 0), 0);

  // ØªÙˆÙ„ÙŠØ¯ Ù†Øµ "Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¹Ù‚Ø¯ ÙˆØ·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø³Ø¯Ø§Ø¯" ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙØ¹Ø§Øª Ø§Ù„Ù…Ø¯Ø®Ù„Ø©
  const buildPaymentTerms = (insts: OfficeAgreementInstallment[], total: number) => {
    if (insts.length === 1 && insts[0].paidOnSigning) {
      return {
        ar: `Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¹Ù‚Ø¯ ${total.toLocaleString("ar-AE")} Ø¯Ø±Ù‡Ù… ØªÙØ¯ÙØ¹ Ø¹Ù†Ø¯ ØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ø¹Ù‚Ø¯.`,
        en: `The contract value is AED ${total.toLocaleString("en-US")} payable upon signing of the contract.`,
      };
    }
    const arParts = insts
      .map((i, idx) => `Ø§Ù„Ø¯ÙØ¹Ø© ${idx + 1}: ${i.amount.toLocaleString("ar-AE")} Ø¯Ø±Ù‡Ù… Ø¨ØªØ§Ø±ÙŠØ® ${fmtDate(i.dueDate)}${i.paidOnSigning ? " (Ø¹Ù†Ø¯ Ø§Ù„ØªÙˆÙ‚ÙŠØ¹)" : ""}`)
      .join("ØŒ ");
    const enParts = insts
      .map((i, idx) => `Installment ${idx + 1}: AED ${i.amount.toLocaleString("en-US")} due on ${i.dueDate}${i.paidOnSigning ? " (upon signing)" : ""}`)
      .join(", ");
    return {
      ar: `Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¹Ù‚Ø¯ ${total.toLocaleString("ar-AE")} Ø¯Ø±Ù‡Ù… ØªÙØ¯ÙØ¹ Ø¹Ù„Ù‰ ${insts.length} Ø¯ÙØ¹Ø§Øª ÙƒØ§Ù„ØªØ§Ù„ÙŠ: ${arParts}.`,
      en: `The contract value is AED ${total.toLocaleString("en-US")} payable in ${insts.length} installments as follows: ${enParts}.`,
    };
  };

  // â”€â”€â”€ Ø§Ù„Ø­ÙØ¸: Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…ÙˆÙƒÙ„ + Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ø£ØªØ¹Ø§Ø¨ + Ø§Ù„Ø¯ÙØ¹Ø§Øª + Ø³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ â”€â”€â”€
  const saveOfficeAgreement = () => {
    if (!checkPerm("manageInvoices", "Ø¥Ù†Ø´Ø§Ø¡ Ø§ØªÙØ§Ù‚ÙŠØ© Ø£ØªØ¹Ø§Ø¨")) return;

    const isExisting = agrForm.clientMode === "existing";
    if (isExisting && !agrForm.existingClientId) {
      alert("ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…ÙˆÙƒÙ„ Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©");
      return;
    }
    if (!isExisting && !agrForm.clientNameAr) {
      alert("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙƒÙ„ Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©");
      return;
    }
    if (!agrForm.caseDetailsAr) {
      alert("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù‚Ø¶ÙŠØ© Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©");
      return;
    }
    const insts: OfficeAgreementInstallment[] = (agrForm.installments || [])
      .filter((i: any) => +i.amount > 0)
      .map((i: any) => ({ amount: +i.amount, dueDate: i.dueDate || todayISO(), paidOnSigning: !!i.paidOnSigning }));
    if (insts.length === 0) {
      alert("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¯ÙØ¹Ø© ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ Ø¨Ù…Ø¨Ù„Øº ØµØ­ÙŠØ­");
      return;
    }
    const total = insts.reduce((s, i) => s + i.amount, 0);

    // (1) Ø§Ù„Ù…ÙˆÙƒÙ„ â€” ÙŠÙØ¶Ø§Ù ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ø¥Ù† ÙƒØ§Ù† Ø¬Ø¯ÙŠØ¯Ø§Ù‹
    let clientId: number;
    let clientNameArFinal = agrForm.clientNameAr;
    if (isExisting) {
      clientId = +agrForm.existingClientId;
      const c = clients.find((x) => x.id === clientId);
      clientNameArFinal = c ? c.name : agrForm.clientNameAr;
    } else {
      clientId = nextId(clients);
      setClients((prev) => [
        ...prev,
        {
          id: clientId,
          name: agrForm.clientNameAr,
          type: agrForm.clientType || "Ø´Ø±ÙƒØ©",
          idNo: agrForm.idNo || "",
          phone: agrForm.phone || "",
          email: agrForm.email || "",
          emirate: agrForm.emirate || "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
          address: agrForm.address || "",
        },
      ]);
    }

    // (2) Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ø£ØªØ¹Ø§Ø¨ + Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø¯ÙØ¹Ø§Øª â€” ØªÙ†Ø²Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ ÙÙŠ ØªØ¨ÙˆÙŠØ¨ "Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨"
    const feeAgrId = nextId(feeAgreements);
    const agreementNumber = `AGR-${new Date().getFullYear()}-${String(feeAgrId + 100).padStart(3, "0")}`;
    let maxInstId = feeAgreements.flatMap((a) => a.installments || []).reduce((m, i) => Math.max(m, i.id), 0);
    const feeInstallments: FeeAgreementInstallment[] = insts.map((i, idx) => ({
      id: ++maxInstId,
      feeAgreementId: feeAgrId,
      installmentNo: idx + 1,
      amount: i.amount,
      dueDate: i.dueDate,
      status: i.paidOnSigning ? "Ù…Ø¯ÙÙˆØ¹" : "Ù…Ø³ØªØ­Ù‚",
    }));
    const allPaid = insts.every((i) => i.paidOnSigning);
    const newFeeAgreement: FeeAgreement = {
      id: feeAgrId,
      clientId,
      caseId: null,
      agreementNumber,
      title: `Ø§ØªÙØ§Ù‚ÙŠØ© Ø£ØªØ¹Ø§Ø¨ Ù…Ø­Ø§Ù…Ø§Ø© â€” ${agrForm.caseDetailsAr.slice(0, 60)}`,
      totalAmount: total,
      date: agrForm.contractDate,
      status: allPaid ? "Ù…Ø³Ø¯Ø¯Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„" : "Ù†Ø´Ø·Ø©",
      installments: feeInstallments,
      notes: `Ø£ÙÙ†Ø´Ø¦Øª ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ù†Ù…ÙˆØ°Ø¬ Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø¨ØªØ§Ø±ÙŠØ® ${fmtDate(todayISO())}`,
    };
    setFeeAgreements((prev) => [...prev, newFeeAgreement]);

    // (3) Ø³Ù†Ø¯Ø§Øª Ø§Ù„Ù‚Ø¨Ø¶ â€” ÙƒÙ„ Ø¯ÙØ¹Ø© "Ù…Ø³Ø¯Ø¯Ø© Ø¹Ù†Ø¯ Ø§Ù„ØªÙˆÙ‚ÙŠØ¹" ØªÙ†Ø²Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ ÙÙŠ ØªØ¨ÙˆÙŠØ¨ Ø§Ù„Ø¯ÙØ¹Ø§Øª
    const paidOnes = feeInstallments.filter((i) => i.status === "Ù…Ø¯ÙÙˆØ¹");
    if (paidOnes.length > 0) {
      let pid = nextId(payments) - 1;
      const receipts: PaymentReceipt[] = paidOnes.map((i) => ({
        id: ++pid,
        clientId,
        caseId: null,
        feeAgreementId: feeAgrId,
        invoiceId: null,
        amount: i.amount,
        date: i.dueDate,
        paymentMethod: "ØªØ­ÙˆÙŠÙ„ Ø¨Ù†ÙƒÙŠ",
        referenceNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: `Ø³Ø¯Ø§Ø¯ Ø§Ù„Ø¯ÙØ¹Ø© Ø±Ù‚Ù… ${i.installmentNo} Ù…Ù† Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠØ© ${agreementNumber} (${clientNameArFinal}) â€” Ø¹Ù†Ø¯ ØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ø¹Ù‚Ø¯`,
      }));
      setPayments((prev) => [...prev, ...receipts]);
    }

    // (4) Ø­ÙØ¸ Ù†Ø³Ø®Ø© Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠØ© Ù„Ù„Ø·Ø¨Ø§Ø¹Ø© ÙˆØ¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø·Ø¨Ø§Ø¹Ø© Ù„Ø§Ø­Ù‚Ø§Ù‹
    const terms = buildPaymentTerms(insts, total);
    const oa: OfficeAgreement = {
      id: nextId(officeAgreements),
      agreementNumber,
      feeAgreementId: feeAgrId,
      clientId,
      contractDate: agrForm.contractDate,
      contractCity: agrForm.contractCity || "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
      clientNameAr: clientNameArFinal,
      clientNameEn: agrForm.clientNameEn || "",
      representativeAr: agrForm.representativeAr || "",
      representativeEn: agrForm.representativeEn || "",
      phone: agrForm.phone || (clients.find((c) => c.id === clientId)?.phone ?? ""),
      caseDetailsAr: agrForm.caseDetailsAr,
      caseDetailsEn: agrForm.caseDetailsEn || "",
      totalAmount: total,
      paymentTermsAr: terms.ar,
      paymentTermsEn: terms.en,
      installments: insts,
      createdAt: todayISO(),
    };
    setOfficeAgreements((prev) => [...prev, oa]);
    setAgrForm(emptyAgrForm());
    setAgrPreviewId(oa.id);
  };

  const handleExecuteDeleteAgreement = () => {
    if (!deleteAgrConfirm) return;
    if (!checkPerm("deleteAgreements", "Ø­Ø°Ù Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ø£ØªØ¹Ø§Ø¨", {
      section: "Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨",
      title: `Ø§ØªÙØ§Ù‚ÙŠØ© Ø£ØªØ¹Ø§Ø¨: ${deleteAgrConfirm.agreementNumber}`,
      details: `Ø§Ù„Ù…ÙˆÙƒÙ„: ${deleteAgrConfirm.clientNameAr} | Ø§Ù„Ù…Ø¨Ù„Øº: ${fmtAED(deleteAgrConfirm.totalAmount)}`,
      targetId: deleteAgrConfirm.id,
      isDelete: true,
    })) return;
    const targetId = deleteAgrConfirm.id;
    const feeAgrId = deleteAgrConfirm.feeAgreementId;
    const cid = deleteAgrConfirm.clientId;

    // ØªÙˆØ«ÙŠÙ‚ Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ø­Ø°Ù Ø§Ù„Ù…Ø¤ÙƒØ¯Ø© ÙÙŠ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ Ø§Ù„Ø£Ù…Ù†ÙŠ
    logAuditAction(
      "DELETE",
      "Ø§ØªÙØ§Ù‚ÙŠØ§Øª ÙˆØ¹Ù‚ÙˆØ¯ Ø§Ù„Ø£ØªØ¹Ø§Ø¨",
      `Ø§ØªÙØ§Ù‚ÙŠØ© Ø±Ù‚Ù…: ${deleteAgrConfirm.agreementNumber}`,
      `ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø­Ø°Ù Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ø£ØªØ¹Ø§Ø¨ Ø±Ù‚Ù… ${deleteAgrConfirm.agreementNumber} Ù„Ù„Ù…ÙˆÙƒÙ„ ${deleteAgrConfirm.clientNameAr} Ø¨Ù…Ø¨Ù„Øº Ø¥Ø¬Ù…Ø§Ù„ÙŠ ${fmtAED(deleteAgrConfirm.totalAmount)}.`,
      deleteAgrConfirm.id,
      "Ù…Ø¤ÙƒØ¯"
    );

    // 1. Remove from officeAgreements archive
    setOfficeAgreements((prev) => prev.filter((a) => a.id !== targetId));
    // 2. Remove from feeAgreements list if linked
    if (feeAgrId) {
      setFeeAgreements((prev) => prev.filter((fa) => fa.id !== feeAgrId));
    }

    // 3. Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ù…ÙˆÙƒÙ„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù‡Ø°Ù‡ Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠØ© Ù‡ÙŠ Ø³Ø¨Ø¨ Ø§Ø±ØªØ¨Ø§Ø·Ù‡ Ø§Ù„ÙˆØ­ÙŠØ¯ Ø¨Ø§Ù„Ù…ÙƒØªØ¨ ÙˆÙ„Ø§ ØªÙˆØ¬Ø¯ Ø£ÙŠ Ø³Ø¬Ù„Ø§Øª Ø£Ø®Ø±Ù‰
    if (cid) {
      const hasOtherOfficeAgr = officeAgreements.some((a) => a.id !== targetId && a.clientId === cid);
      const hasOtherFeeAgr = feeAgreements.some((fa) => fa.id !== feeAgrId && fa.clientId === cid);
      const hasCases = cases.some((c) => c.clientId === cid);
      const hasInvoices = invoices.some((inv) => inv.clientId === cid);
      const hasPoas = poas.some((p) => p.clientId === cid);

      const hasOtherRecords = hasOtherOfficeAgr || hasOtherFeeAgr || hasCases || hasInvoices || hasPoas;

      if (!hasOtherRecords) {
        setClients((prev) => prev.filter((c) => c.id !== cid));
      }
    }

    // 4. Close preview modal if deleting currently viewed agreement
    if (agrPreviewId === targetId) {
      setAgrPreviewId(null);
    }
    setDeleteAgrConfirm(null);
  };
  const [courtSearchQuery, setCourtSearchQuery] = useState("");
  const [courtEmirateFilter, setCourtEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [courtCategoryFilter, setCourtCategoryFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [courtBranchFilter, setCourtBranchFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [editingCourtContact, setEditingCourtContact] = useState<CourtContact | null>(null);

  // Ø­Ø§Ù„Ø© Ø§Ø³ØªÙŠØ±Ø§Ø¯ Ù…Ù„ÙØ§Øª Ø§Ù„Ø¥ÙƒØ³Ù„ Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø­Ø§ÙƒÙ… ÙˆØ§Ù„Ø¬Ù‡Ø§Øª Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©
  const [courtExcelModalOpen, setCourtExcelModalOpen] = useState(false);
  const [courtImportPreviewList, setCourtImportPreviewList] = useState<Partial<CourtContact>[]>([]);
  const [courtExcelImportMode, setCourtExcelImportMode] = useState<"append" | "replace">("append");
  const [courtExcelFileName, setCourtExcelFileName] = useState<string>("");
  const [courtExcelImportStatus, setCourtExcelImportStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  // Sub-tabs configuration
  const [invoiceSubTab, setInvoiceSubTab] = useState<"invoices" | "agreements" | "payments" | "time" | "trust" | "expenses">("payments");
  const [docSubTab, setDocSubTab] = useState<"officialLetters" | "archive" | "generator">("officialLetters");
  const [kycSubTab, setKycSubTab] = useState<"kyc" | "watchlist" | "str">("kyc");

  // ---------- 1. ØªØ¯Ù‚ÙŠÙ‚ ÙˆÙ…Ù‚Ø§Ø±Ù†Ø© Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ù…Ø¹ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£Ø´Ø®Ø§Øµ Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙŠÙ† ÙˆØ§Ù„Ù…Ù†ÙƒØ´ÙÙŠÙ† (KYC Watchlist Auto-Audit) ----------
  const checkAndAuditClientKyc = (clientName: string, idNo?: string) => {
    if (!clientName || clientName.trim().length < 2) return null;
    const cName = clientName.trim().toLowerCase();
    const cId = idNo ? idNo.trim().toLowerCase() : "";

    const match = kycWatchlist.find((w) => {
      const wName = w.fullName.trim().toLowerCase();
      const wId = w.idNo ? w.idNo.trim().toLowerCase() : "";
      const nameMatch = cName.includes(wName) || wName.includes(cName);
      const idMatch = cId.length > 3 && wId.length > 3 && cId === wId;
      return nameMatch || idMatch;
    });

    if (match) {
      setKycSanctionAlert({
        clientName,
        idNo,
        watchlistItem: match
      });
    }
    return match;
  };

  // ---------- 2. Ù…Ø¹Ø§Ù„Ø¬Ø© ÙˆØªÙØ±ÙŠØº Ù…Ù„Ù Excel Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© ----------
  const handleParseCasesExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCasesExcelLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          alert("Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø±ÙÙ‚ ÙØ§Ø±Øº Ø£Ùˆ Ù„Ø§ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ØµÙÙˆÙ Ø¨ÙŠØ§Ù†Ø§Øª ØµØ§Ù„Ø­Ø©!");
          setCasesExcelLoading(false);
          return;
        }

        const parsed = rows.map((r, idx) => {
          const caseNumber = String(r["Ø±Ù‚Ù… Ø§Ù„Ù‚Ø¶ÙŠØ©"] || r["Ø±Ù‚Ù…/ÙƒÙˆØ¯ Ø§Ù„Ù‚Ø¶ÙŠØ©"] || r["Ø±Ù‚Ù… Ø§Ù„Ù‚Ø¶ÙŠÙ‡"] || r["Case Number"] || r["number"] || `CAS-2026-${100 + idx}`).trim();
          const cName = String(r["Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙƒÙ„"] || r["Ø§Ù„Ù…ÙˆÙƒÙ„"] || r["Client Name"] || r["client"] || "Ù…ÙˆÙƒÙ„ ØºÙŠØ± Ù…Ø­Ø¯Ø¯").trim();
          const opponent = String(r["Ø§Ø³Ù… Ø§Ù„Ø®ØµÙ…"] || r["Ø§Ù„Ø®ØµÙ…"] || r["Opponent"] || r["opponent"] || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯").trim();
          const type = String(r["Ù†ÙˆØ¹ Ø§Ù„Ù‚Ø¶ÙŠØ©"] || r["Ø§Ù„Ù†ÙˆØ¹"] || r["Type"] || r["type"] || "ØªØ¬Ø§Ø±ÙŠ").trim();
          const court = String(r["Ø§Ù„Ù…Ø­ÙƒÙ…Ø©"] || r["Ø§Ù„Ø¬Ù‡Ø© Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠØ©"] || r["Court"] || r["court"] || "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ").trim();
          const subject = String(r["Ù…ÙˆØ¶ÙˆØ¹ Ø§Ù„Ù‚Ø¶ÙŠØ©"] || r["Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹"] || r["Ø§Ù„Ø¹Ù†ÙˆØ§Ù†"] || r["subject"] || "Ø¯Ø¹ÙˆÙ‰ Ù‚Ø¶Ø§Ø¦ÙŠØ©").trim();
          const openDate = String(r["ØªØ§Ø±ÙŠØ® Ø§Ù„Ù‚ÙŠØ¯"] || r["ØªØ§Ø±ÙŠØ® Ø§Ù„ÙØªØ­"] || r["openDate"] || todayISO()).trim();
          const fee = Number(r["Ø§Ù„Ø£ØªØ¹Ø§Ø¨"] || r["Ø§Ù„Ø±Ø³ÙˆÙ…"] || r["fee"] || 10000);

          const existingClient = clients.find((c) => c.name.trim().toLowerCase() === cName.toLowerCase());

          return {
            id: idx + 1,
            caseNumber,
            clientName: cName,
            opponent,
            type,
            court,
            subject,
            openDate,
            fee,
            matchedClientId: existingClient ? existingClient.id : null,
            isNewClient: !existingClient
          };
        });

        setExcelCasesParsed(parsed);
      } catch (err: any) {
        alert("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ù‚Ø±Ø§Ø¡Ø© Ù…Ù„Ù Excel: " + (err.message || "ØªÙ†Ø³ÙŠÙ‚ ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…"));
      } finally {
        setCasesExcelLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------- 3. ØªØ£ÙƒÙŠØ¯ ÙˆØ§Ø³ØªÙŠØ±Ø§Ø¯ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ Ù„Ø³ÙŠØ³ØªÙ… Ø§Ù„Ù†Ø¸Ø§Ù… ----------
  const handleConfirmImportCases = () => {
    if (excelCasesParsed.length === 0) return;

    let updatedClients = [...clients];
    const newCasesList: CaseItem[] = [];

    excelCasesParsed.forEach((item) => {
      let finalClientId = item.matchedClientId;

      if (!finalClientId) {
        // Ø¥Ù†Ø´Ø§Ø¡ Ù…ÙˆÙƒÙ„ Ø¬Ø¯ÙŠØ¯ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹
        const newCId = nextId(updatedClients);
        const newClientObj: Client = {
          id: newCId,
          name: item.clientName,
          type: "Ø´Ø±ÙƒØ©",
          idNo: "",
          emirate: "Ø¯Ø¨ÙŠ",
          phone: "",
          email: "",
          address: ""
        };

        // ÙØ­Øµ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø­Ø¸Ø± Ù„Ù„Ù…ÙˆÙƒÙ„ Ø§Ù„Ù…Ø³ØªÙˆØ±Ø¯
        const matchSanction = checkAndAuditClientKyc(item.clientName);
        if (matchSanction) {
          setKyc((prev) => [
            ...prev,
            {
              id: nextId(prev),
              clientId: newCId,
              nationality: "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
              idType: "Ù‡ÙˆÙŠØ©/Ø¬ÙˆØ§Ø²",
              idExpiry: addDays(365),
              ubo: item.clientName,
              sourceOfFunds: "Ù†Ø´Ø§Ø· ØªØ¬Ø§Ø±ÙŠ",
              pep: true,
              sanctions: "ØªØ·Ø§Ø¨Ù‚ Ù…Ø­ØªÙ…Ù„ (Ù…Ø­Ø¸ÙˆØ±)",
              risk: "Ù…Ø±ØªÙØ¹",
              status: "Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©",
              lastReview: todayISO(),
              notes: `ØªÙ†Ø¨ÙŠÙ‡ Ø­Ø¸Ø± Ø§Ø³ØªÙŠØ±Ø§Ø¯ Excel: Ù…Ø³Ø¬Ù„ ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙŠÙ† (Ø³Ø¨Ø¨: ${matchSanction.reason})`
            }
          ]);
        }

        updatedClients.push(newClientObj);
        finalClientId = newCId;
      }

      const newCaseObj: CaseItem = {
        id: nextId(cases) + newCasesList.length,
        number: item.caseNumber,
        clientId: finalClientId,
        opponent: item.opponent,
        type: item.type,
        court: item.court,
        judge: "Ø§Ù„Ù‚Ø§Ø¶ÙŠ Ø§Ù„Ù…Ø®ØªØµ",
        status: "Ù‚ÙŠØ¯ Ø§Ù„Ù†Ø¸Ø±",
        subject: item.subject,
        openDate: item.openDate,
        fee: item.fee
      };

      newCasesList.push(newCaseObj);
    });

    setClients(updatedClients);
    setCases((prev) => [...prev, ...newCasesList]);
    logAuditAction("CREATE", "Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§", "Ø§Ø³ØªÙŠØ±Ø§Ø¯ Ø´Ø§Ù…Ù„ Excel", `ØªÙ… Ø§Ø³ØªÙŠØ±Ø§Ø¯ ${newCasesList.length} Ù‚Ø¶ÙŠØ© Ù…Ù† Ù…Ù„Ù Excel Ø¨Ù†Ø¬Ø§Ø­ ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†`, 0);
    alert(`ØªÙ… Ø§Ø³ØªÙŠØ±Ø§Ø¯ ${newCasesList.length} Ù‚Ø¶ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­ ÙˆØ±Ø¨Ø·Ù‡Ø§ Ø¨Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†!`);
    setShowCasesExcelModal(false);
    setExcelCasesParsed([]);
  };

  // ---------- 4. ØªÙ†Ø²ÙŠÙ„ Ù‚Ø§Ù„Ø¨ Excel Ø§Ø³ØªØ±Ø´Ø§Ø¯ÙŠ Ù„Ù„Ù‚Ø¶Ø§ÙŠØ§ ----------
  const downloadCasesExcelTemplate = () => {
    const sampleData = [
      {
        "Ø±Ù‚Ù… Ø§Ù„Ù‚Ø¶ÙŠØ©": "CAS-2026-801",
        "Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙƒÙ„": "Ø´Ø±ÙƒØ© Ø§Ù„Ø®Ù„ÙŠØ¬ Ù„Ù„ØªÙˆØ±ÙŠØ¯Ø§Øª Ø§Ù„Ù„ÙˆØ¬Ø³ØªÙŠØ©",
        "Ø§Ø³Ù… Ø§Ù„Ø®ØµÙ…": "Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ø°Ù‡Ø¨ÙŠ Ù„Ù„Ù…Ù‚Ø§ÙˆÙ„Ø§Øª",
        "Ù†ÙˆØ¹ Ø§Ù„Ù‚Ø¶ÙŠØ©": "ØªØ¬Ø§Ø±ÙŠ",
        "Ø§Ù„Ù…Ø­ÙƒÙ…Ø©": "Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ",
        "Ù…ÙˆØ¶ÙˆØ¹ Ø§Ù„Ù‚Ø¶ÙŠØ©": "Ø¯Ø¹ÙˆÙ‰ Ù…Ø·Ø§Ù„Ø¨Ø© Ø¨Ù…Ø¨Ù„Øº ØªÙˆØ±ÙŠØ¯ 150,000 Ø¯Ø±Ù‡Ù… Ø¹Ù† Ø¹Ù‚Ø¯ ØªÙˆØ±ÙŠØ¯ Ø£Ø¬Ù‡Ø²Ø©",
        "ØªØ§Ø±ÙŠØ® Ø§Ù„Ù‚ÙŠØ¯": todayISO(),
        "Ø§Ù„Ø£ØªØ¹Ø§Ø¨": 0
      },
      {
        "Ø±Ù‚Ù… Ø§Ù„Ù‚Ø¶ÙŠØ©": "CAS-2026-802",
        "Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙƒÙ„": "Ø³Ø§Ù„Ù… Ù…Ø­Ù…Ø¯ Ø§Ù„ÙƒØ¹Ø¨ÙŠ",
        "Ø§Ø³Ù… Ø§Ù„Ø®ØµÙ…": "Ø´Ø±ÙƒØ© Ø§Ù„Ø£ÙÙ‚ Ù„Ù„Ø§Ø³ØªØ«Ù…Ø§Ø±",
        "Ù†ÙˆØ¹ Ø§Ù„Ù‚Ø¶ÙŠØ©": "Ø¹Ù‚Ø§Ø±ÙŠ",
        "Ø§Ù„Ù…Ø­ÙƒÙ…Ø©": "Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ù‚Ø¶Ø§Ø¡ - Ø£Ø¨ÙˆØ¸Ø¨ÙŠ",
        "Ù…ÙˆØ¶ÙˆØ¹ Ø§Ù„Ù‚Ø¶ÙŠØ©": "Ù†Ø²Ø§Ø¹ Ø§Ø³ØªØ±Ø¯Ø§Ø¯ Ù…Ø³Ø¯Ø¯Ø§Øª ÙˆØ­Ø¯Ø© Ø¹Ù‚Ø§Ø±ÙŠØ© ØªØ­Øª Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡",
        "ØªØ§Ø±ÙŠØ® Ø§Ù„Ù‚ÙŠØ¯": todayISO(),
        "Ø§Ù„Ø£ØªØ¹Ø§Ø¨": 0
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ù‚Ø¶Ø§ÙŠØ§_Ø³Ø§Ø¨Ù‚Ø©");
    XLSX.writeFile(wb, "Ù‚Ø§Ù„Ø¨_Ø§Ø³ØªÙŠØ±Ø§Ø¯_Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§_Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©.xlsx");
  };

  // ---------- 5. Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ (POAs, Agreements, Invoices) ----------
  const handleProcessDocAiExtract = async (docType: "poa" | "agreement" | "invoice", file: File) => {
    if (!file) return;

    if (docType === "poa") setPoaAiLoading(true);
    if (docType === "agreement") setAgreementAiLoading(true);
    if (docType === "invoice") setInvoiceAiLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Str = e.target?.result as string;

        const response = await fetch("/api/extract-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docType,
            fileBase64: base64Str,
            mimeType: file.type || "application/pdf",
            fileName: file.name
          })
        });

        const data = await response.json();
        if (data.success && data.extracted) {
          if (docType === "poa") {
            setPoaAiExtracted(data.extracted);
            const matchedC = findMatchingClientByName(clients, data.extracted.clientName || "");
            setSelectedPoaClientId(matchedC ? matchedC.id : "new");
          } else if (docType === "agreement") {
            setAgreementAiExtracted(data.extracted);
            const matchedC = findMatchingClientByName(clients, data.extracted.clientName || "");
            setSelectedAgrClientId(matchedC ? matchedC.id : "new");
          } else if (docType === "invoice") {
            setInvoiceAiExtracted(data.extracted);
          }
        } else {
          alert("ØªØ¹Ø°Ø± Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ù† Ø§Ù„Ù…Ø³ØªÙ†Ø¯: " + (data.error || "Ø®Ø·Ø£ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ"));
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ù…Ø³ØªÙ†Ø¯ Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ: " + err.message);
    } finally {
      if (docType === "poa") setPoaAiLoading(false);
      if (docType === "agreement") setAgreementAiLoading(false);
      if (docType === "invoice") setInvoiceAiLoading(false);
    }
  };

  // ---------- 6. ØªØ£ÙƒÙŠØ¯ ÙˆØ­ÙØ¸ Ø§Ù„ÙˆÙƒØ§Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø±Ø¬Ø© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ----------
  const handleSaveExtractedPoa = () => {
    if (!poaAiExtracted) return;

    const targetPoaNumber = (poaAiExtracted.poaNumber || "").trim();
    if (targetPoaNumber && poas.some((p) => p.number.trim().toLowerCase() === targetPoaNumber.toLowerCase())) {
      alert(`ØªÙ†Ø¨ÙŠÙ‡: Ø±Ù‚Ù… Ø§Ù„ÙˆÙƒØ§Ù„Ø© "${targetPoaNumber}" Ù…Ø³Ø¬Ù„ Ù…Ø³Ø¨Ù‚Ø§Ù‹ ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª!\nÙ„Ø§ ÙŠÙ…ÙƒÙ† ØªÙƒØ±Ø§Ø± Ø¥Ø¯Ø±Ø§Ø¬ Ù†ÙØ³ Ø§Ù„ÙˆÙƒØ§Ù„Ø©.`);
      return;
    }

    let clientId: number;
    const extractedName = (poaAiExtracted.clientName || "Ù…ÙˆÙƒÙ„ ÙˆÙƒØ§Ù„Ø© Ø¬Ø¯ÙŠØ¯").trim();
    const existingC = findMatchingClientByName(clients, extractedName);

    if (selectedPoaClientId !== "new" && typeof selectedPoaClientId === "number") {
      clientId = selectedPoaClientId;
    } else if (existingC) {
      clientId = existingC.id;
    } else {
      checkAndAuditClientKyc(extractedName);
      const newC: Client = {
        id: nextId(clients),
        name: extractedName,
        type: "ÙØ±Ø¯",
        idNo: "",
        emirate: "Ø¯Ø¨ÙŠ",
        phone: "",
        email: "",
        address: ""
      };
      setClients((prev) => [...prev, newC]);
      clientId = newC.id;
    }

    const newPoaItem: PoaItem = {
      id: nextId(poas),
      clientId,
      number: poaAiExtracted.poaNumber || `POA-2026-${Math.floor(100 + Math.random() * 900)}`,
      issuer: poaAiExtracted.issuer || "Ø§Ù„ÙƒØ§ØªØ¨ Ø§Ù„Ø¹Ø¯Ù„",
      issue: poaAiExtracted.issueDate || todayISO(),
      expiry: poaAiExtracted.expiryDate || addDays(730),
      scope: poaAiExtracted.scope || "ØµÙ„Ø§Ø­ÙŠØ© Ù…Ø±Ø§ÙØ¹Ø© ÙˆØªÙˆÙƒÙŠÙ„ Ø¹Ø§Ù… Ø£Ù…Ø§Ù… Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø­Ø§ÙƒÙ…"
    };

    setPoas((prev) => [newPoaItem, ...prev]);
    logAuditAction("CREATE", "Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª", `ÙˆÙƒØ§Ù„Ø© Ø±Ù‚Ù… ${newPoaItem.number}`, "Ø¥Ø¶Ø§ÙØ© ÙˆÙƒØ§Ù„Ø© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø¹Ø¨Ø± Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ", newPoaItem.id);
    alert("ØªÙ… Ø­ÙØ¸ Ø§Ù„ÙˆÙƒØ§Ù„Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙˆØ±Ø¨Ø·Ù‡Ø§ Ø¨Ø§Ù„Ù…ÙˆÙƒÙ„ Ø¨Ù†Ø¬Ø§Ø­!");
    setShowPoaAiUploadModal(false);
    setPoaAiExtracted(null);
  };

  // ---------- 7. ØªØ£ÙƒÙŠØ¯ ÙˆØ­ÙØ¸ Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ù…Ø³ØªØ®Ø±Ø¬Ø© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ----------
  const handleSaveExtractedAgreement = () => {
    if (!agreementAiExtracted) return;

    let clientId: number;
    const extractedName = (agreementAiExtracted.clientName || "Ù…ÙˆÙƒÙ„ Ø§ØªÙØ§Ù‚ÙŠØ© Ø¬Ø¯ÙŠØ¯").trim();
    const existingC = findMatchingClientByName(clients, extractedName);

    if (selectedAgrClientId !== "new" && typeof selectedAgrClientId === "number") {
      clientId = selectedAgrClientId;
    } else if (existingC) {
      clientId = existingC.id;
    } else {
      checkAndAuditClientKyc(extractedName);
      const newC: Client = {
        id: nextId(clients),
        name: extractedName,
        type: "Ø´Ø±ÙƒØ©",
        idNo: "",
        emirate: "Ø¯Ø¨ÙŠ",
        phone: "",
        email: "",
        address: ""
      };
      setClients((prev) => [...prev, newC]);
      clientId = newC.id;
    }

    const newFeeAgr: FeeAgreement = {
      id: nextId(feeAgreements),
      agreementNumber: agreementAiExtracted.agreementNumber || `AGR-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId,
      title: "Ø§ØªÙØ§Ù‚ÙŠØ© Ø£ØªØ¹Ø§Ø¨ Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù…Ø³ØªØ®Ø±Ø¬Ø© Ø¢Ù„ÙŠØ§Ù‹",
      totalAmount: Number(agreementAiExtracted.totalAmount || 25000),
      date: agreementAiExtracted.date || todayISO(),
      status: "Ù†Ø´Ø·Ø©",
      notes: agreementAiExtracted.installmentsNotes || agreementAiExtracted.notes || "Ø§ØªÙØ§Ù‚ÙŠØ© Ø£ØªØ¹Ø§Ø¨ Ø³Ø§Ø¨Ù‚Ø© Ù…Ø³ØªØ®Ø±Ø¬Ø© Ø¢Ù„ÙŠØ§Ù‹"
    };

    setFeeAgreements((prev) => [newFeeAgr, ...prev]);
    logAuditAction("CREATE", "Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø§Ù„Ø£ØªØ¹Ø§Ø¨", `Ø§ØªÙØ§Ù‚ÙŠØ© Ø±Ù‚Ù… ${newFeeAgr.agreementNumber}`, "Ø¥Ø¯Ø±Ø§Ø¬ Ø§ØªÙØ§Ù‚ÙŠØ© Ø£ØªØ¹Ø§Ø¨ Ø¹Ø¨Ø± Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ", newFeeAgr.id);
    alert("ØªÙ… Ø­ÙØ¸ Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ù„Ø£ØªØ¹Ø§Ø¨ ÙˆØ±Ø¨Ø·Ù‡Ø§ Ø¨Ø§Ù„Ù…ÙˆÙƒÙ„ Ø¨Ù†Ø¬Ø§Ø­!");
    setShowAgreementAiUploadModal(false);
    setAgreementAiExtracted(null);
  };

  // ---------- 8. Ù…Ø¹Ø§Ù„Ø¬Ø© ÙˆØªÙØ±ÙŠØº Ù…Ù„Ù Excel Ø§Ù„ÙÙˆØ§ØªÙŠØ± ----------
  const handleParseInvoicesExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          alert("Ø§Ù„Ù…Ù„Ù ÙØ§Ø±Øº Ø£Ùˆ Ù„Ø§ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ÙÙˆØ§ØªÙŠØ± ØµØ§Ù„Ø­Ø©!");
          return;
        }

        const parsed = rows.map((r, idx) => {
          const invNum = String(r["Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©"] || r["Invoice Number"] || `INV-2026-${200 + idx}`);
          const cName = String(r["Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙƒÙ„"] || r["Ø§Ù„Ù…ÙˆÙƒÙ„"] || r["Client"] || "Ù…ÙˆÙƒÙ„ ÙØ§ØªÙˆØ±Ø©");
          const amt = Number(r["Ø§Ù„Ù…Ø¨Ù„Øº"] || r["Ø§Ù„Ù…Ø¨Ù„Øº Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ"] || r["Amount"] || 5000);
          const date = String(r["ØªØ§Ø±ÙŠØ® Ø§Ù„ÙØ§ØªÙˆØ±Ø©"] || r["Ø§Ù„ØªØ§Ø±ÙŠØ®"] || todayISO());
          const due = String(r["ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚"] || r["Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚"] || addDays(30));
          const desc = String(r["Ø§Ù„ÙˆØµÙ"] || r["Ø§Ù„Ø®Ø¯Ù…Ø©"] || r["Description"] || "Ø£ØªØ¹Ø§Ø¨ ÙˆØ§Ø³ØªØ´Ø§Ø±Ø§Øª Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©");

          return { number: invNum, clientName: cName, amount: amt, date, due, desc };
        });

        setExcelInvoicesParsed(parsed);
      } catch (err: any) {
        alert("Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ù‚Ø±Ø§Ø¡Ø© Ù…Ù„Ù Ø§Ù„ÙÙˆØ§ØªÙŠØ±: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------- 9. ØªØ£ÙƒÙŠØ¯ Ø§Ø³ØªÙŠØ±Ø§Ø¯ Ø§Ù„ÙÙˆØ§ØªÙŠØ± (Excel Ø£Ùˆ AI) ----------
  const handleConfirmImportInvoices = () => {
    let updatedClients = [...clients];
    const newInvoicesList: Invoice[] = [];

    if (invoiceImportTab === "excel") {
      excelInvoicesParsed.forEach((item) => {
        let matchedC = updatedClients.find((c) => c.name.toLowerCase().trim() === item.clientName.toLowerCase().trim());
        let cId: number;
        if (!matchedC) {
          cId = nextId(updatedClients);
          checkAndAuditClientKyc(item.clientName);
          updatedClients.push({
            id: cId,
            name: item.clientName,
            type: "Ø´Ø±ÙƒØ©",
            idNo: "",
            emirate: "Ø¯Ø¨ÙŠ",
            phone: "",
            email: "",
            address: ""
          });
        } else {
          cId = matchedC.id;
        }

        newInvoicesList.push({
          id: nextId(invoices) + newInvoicesList.length,
          number: item.number,
          clientId: cId,
          caseId: null,
          date: item.date,
          due: item.due,
          amount: item.amount,
          status: "ØºÙŠØ± Ù…Ø¯ÙÙˆØ¹Ø©",
          desc: item.desc
        });
      });
    } else if (invoiceImportTab === "pdf_ai" && invoiceAiExtracted) {
      const cName = invoiceAiExtracted.clientName || "Ù…ÙˆÙƒÙ„ ÙØ§ØªÙˆØ±Ø© AI";
      let matchedC = updatedClients.find((c) => c.name.toLowerCase().trim() === cName.toLowerCase().trim());
      let cId: number;
      if (!matchedC) {
        cId = nextId(updatedClients);
        checkAndAuditClientKyc(cName);
        updatedClients.push({
          id: cId,
          name: cName,
          type: "Ø´Ø±ÙƒØ©",
          idNo: "",
          emirate: "Ø¯Ø¨ÙŠ",
          phone: "",
          email: "",
          address: ""
        });
      } else {
        cId = matchedC.id;
      }

      newInvoicesList.push({
        id: nextId(invoices),
        number: invoiceAiExtracted.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        clientId: cId,
        caseId: null,
        date: invoiceAiExtracted.date || todayISO(),
        due: invoiceAiExtracted.due || addDays(15),
        amount: Number(invoiceAiExtracted.amount || invoiceAiExtracted.totalAmount || 10000),
        status: "ØºÙŠØ± Ù…Ø¯ÙÙˆØ¹Ø©",
        desc: invoiceAiExtracted.description || "ÙØ§ØªÙˆØ±Ø© Ø®Ø¯Ù…Ø§Øª Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø£ØµÙ„ÙŠØ© Ù…Ø³ØªØ®Ø±Ø¬Ø© Ø¢Ù„ÙŠØ§Ù‹"
      });
    }

    setClients(updatedClients);
    setInvoices((prev) => [...prev, ...newInvoicesList]);
    alert(`ØªÙ… Ø§Ø³ØªÙŠØ±Ø§Ø¯ ÙˆØ¥Ø¯Ø±Ø§Ø¬ ${newInvoicesList.length} ÙØ§ØªÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­!`);
    setShowInvoiceImportModal(false);
    setExcelInvoicesParsed([]);
    setInvoiceAiExtracted(null);
  };

  // ---------- 10. Ù…Ø¹Ø§Ù„Ø¬Ø© ÙˆØªÙØ±ÙŠØº Excel Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£Ø´Ø®Ø§Øµ Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙŠÙ† ÙˆØ§Ù„Ù…Ù†ÙƒØ´ÙÙŠÙ† (KYC Watchlist Excel) ----------
  const handleParseKycWatchlistExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          alert("Ø§Ù„Ù…Ù„Ù Ù„Ø§ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø³Ù…Ø§Ø¡ Ù…Ø­Ø¸ÙˆØ±ÙŠÙ† ØµØ§Ù„Ø­Ø©!");
          return;
        }

        const parsed: KycWatchlistItem[] = rows.map((r, idx) => {
          return {
            id: idx + 1,
            fullName: String(r["Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„"] || r["Ø§Ø³Ù… Ø§Ù„Ø´Ø®Øµ/Ø§Ù„Ø¬Ù‡Ø©"] || r["Full Name"] || r["Name"] || "Ø§Ø³Ù… ØºÙŠØ± Ù…Ø­Ø¯Ø¯").trim(),
            idNo: String(r["Ø±Ù‚Ù… Ø§Ù„Ù‡ÙˆÙŠØ©"] || r["Ø±Ù‚Ù… Ø§Ù„Ø¬ÙˆØ§Ø²"] || r["ID Number"] || r["Passport"] || "").trim(),
            type: String(r["ØªØµÙ†ÙŠÙ Ø§Ù„Ø­Ø¸Ø±"] || r["Ù†ÙˆØ¹ Ø§Ù„Ø­Ø¸Ø±"] || r["Type"] || "Ø´Ø®Øµ Ù…Ù†ÙƒØ´Ù Ø³ÙŠØ§Ø³ÙŠØ§Ù‹ (PEP)").trim(),
            reason: String(r["Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø¸Ø±"] || r["Ø§Ù„Ø³Ø¨Ø¨"] || r["Reason"] || "Ø¥Ø¯Ø±Ø§Ø¬ ÙÙŠ Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„ ÙˆÙ…ÙƒØ§ÙØ­Ø© ØºØ³Ù„ Ø§Ù„Ø£Ù…ÙˆØ§Ù„").trim(),
            nationality: String(r["Ø§Ù„Ø¬Ù†Ø³ÙŠØ©"] || r["Nationality"] || "Ø£Ø®Ø±Ù‰").trim(),
            addedDate: todayISO()
          };
        });

        setKycWatchlistParsed(parsed);
      } catch (err: any) {
        alert("Ø®Ø·Ø£ ÙÙŠ Ù‚Ø±Ø§Ø¡Ø© Ù…Ù„Ù Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø­Ø¸Ø±: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------- 11. ØªØ£ÙƒÙŠØ¯ Ø§Ø³ØªÙŠØ±Ø§Ø¯ ÙˆØªØ¯Ù‚ÙŠÙ‚ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙŠÙ† ----------
  const handleConfirmImportKycWatchlist = () => {
    if (kycWatchlistParsed.length === 0) return;

    const newWatchlistItems = kycWatchlistParsed.map((item, idx) => ({
      ...item,
      id: nextId(kycWatchlist) + idx
    }));

    const updatedWatchlist = [...kycWatchlist, ...newWatchlistItems];
    setKycWatchlist(updatedWatchlist);

    // ØªØ¯Ù‚ÙŠÙ‚ ÙÙˆØ±ÙŠ ÙˆÙ…Ø¨Ø§Ø´Ø± Ù…Ø¹ Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ø§Ù„Ù…Ø³Ø¬Ù„ÙŠÙ† Ø¨Ø§Ù„Ù†Ø¸Ø§Ù… Ø­Ø§Ù„ÙŠØ§Ù‹
    let matchedCount = 0;
    clients.forEach((c) => {
      const isBlocked = newWatchlistItems.some((w) => {
        const cName = c.name.toLowerCase().trim();
        const wName = w.fullName.toLowerCase().trim();
        return cName.includes(wName) || wName.includes(cName);
      });

      if (isBlocked) {
        matchedCount++;
        setKyc((prev) => {
          const exists = prev.find((k) => k.clientId === c.id);
          if (exists) {
            return prev.map((k) => (k.clientId === c.id ? { ...k, pep: true, sanctions: "ØªØ·Ø§Ø¨Ù‚ Ù…Ø­ØªÙ…Ù„ (Ù…Ø­Ø¸ÙˆØ±)", risk: "Ù…Ø±ØªÙØ¹", notes: "ðŸš¨ ØªØ·Ø§Ø¨Ù‚ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù…Ø¹ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø³ÙˆØ¯Ø§Ø¡ Ø§Ù„Ù…Ø³ØªÙˆØ±Ø¯Ø© Ø­Ø¯ÙŠØ«Ø§Ù‹!" } : k));
          } else {
            return [
              ...prev,
              {
                id: nextId(prev),
                clientId: c.id,
                nationality: c.emirate,
                idType: "Ù‡ÙˆÙŠØ© Ø¥Ù…Ø§Ø±Ø§ØªÙŠØ©",
                idExpiry: addDays(365),
                ubo: c.name,
                sourceOfFunds: "Ù†Ø´Ø§Ø· ØªØ¬Ø§Ø±ÙŠ",
                pep: true,
                sanctions: "ØªØ·Ø§Ø¨Ù‚ Ù…Ø­ØªÙ…Ù„ (Ù…Ø­Ø¸ÙˆØ±)",
                risk: "Ù…Ø±ØªÙØ¹",
                status: "Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©",
                lastReview: todayISO(),
                notes: "ðŸš¨ ØªØ·Ø§Ø¨Ù‚ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ø¹Ù†Ø¯ Ø±ÙØ¹ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø­Ø¸Ø± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©!"
              }
            ];
          }
        });
      }
    });

    alert(`ØªÙ… Ø§Ø³ØªÙŠØ±Ø§Ø¯ ${newWatchlistItems.length} Ø§Ø³Ù… Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙŠÙ† ÙˆØ§Ù„Ù…Ù†ÙƒØ´ÙÙŠÙ† Ø¨Ù†Ø¬Ø§Ø­! ${matchedCount > 0 ? `ðŸš¨ ØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ (${matchedCount}) Ù…ÙˆÙƒÙ„ Ø­Ø§Ù„ÙŠ Ù…ØªØ·Ø§Ø¨Ù‚ Ù…Ø¹ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©!` : "Ù„Ù… ÙŠØªØ·Ø§Ø¨Ù‚ Ø£ÙŠ Ù…ÙˆÙƒÙ„ Ø­Ø§Ù„ÙŠ."}`);
    setShowKycWatchlistUploadModal(false);
    setKycWatchlistParsed([]);
  };

  // ---------- 12. ØªÙ†Ø²ÙŠÙ„ Ù‚Ø§Ù„Ø¨ Excel Ù„Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø­Ø¸Ø± ----------
  const downloadKycWatchlistTemplate = () => {
    const sampleData = [
      {
        "Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„": "Ø¯Ø§Ù†ÙŠÙŠÙ„ Ø±ÙˆØ¨ÙŠØ±ØªÙˆ Ø£Ù†Ø¯Ø±Ø³ÙˆÙ†",
        "Ø±Ù‚Ù… Ø§Ù„Ù‡ÙˆÙŠØ©": "PASSPORT-US-887192",
        "ØªØµÙ†ÙŠÙ Ø§Ù„Ø­Ø¸Ø±": "Ø´Ø®Øµ Ù…Ù†ÙƒØ´Ù Ø³ÙŠØ§Ø³ÙŠØ§Ù‹ (PEP)",
        "Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø¸Ø±": "Ø¥ÙØµØ§Ø­ Ø³ÙŠØ§Ø³ÙŠ Ø¹Ø§Ù„ÙŠ Ø§Ù„Ù…Ø®Ø§Ø·Ø± - ØªØ¬Ù…ÙŠØ¯ Ø£ØµÙˆÙ„ ØªØ­Ø±Ø²ÙŠ",
        "Ø§Ù„Ø¬Ù†Ø³ÙŠØ©": "Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ù…ØªØ­Ø¯Ø©"
      },
      {
        "Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„": "Ø´Ø±ÙƒØ© Ø§Ù„Ø´Ø±Ù‚ Ø§Ù„Ø£ÙˆØ³Ø· Ù„Ù„Ù…Ø´ØªÙ‚Ø§Øª Ø§Ù„Ù‚Ø§Ø¨Ø¶Ø©",
        "Ø±Ù‚Ù… Ø§Ù„Ù‡ÙˆÙŠØ©": "CR-772810",
        "ØªØµÙ†ÙŠÙ Ø§Ù„Ø­Ø¸Ø±": "Ù‚Ø§Ø¦Ù…Ø© Ø­Ø¸Ø± Ø¹Ù‚ÙˆØ¨Ø§Øª Ø¯ÙˆÙ„ÙŠØ© / Ù…Ø­Ù„ÙŠØ©",
        "Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø¸Ø±": "Ù‚Ø±Ø§Ø± Ø­Ø¸Ø± ØªØ¹Ø§Ù…Ù„ ØªØ¬Ø§Ø±ÙŠ ÙˆÙ…Ø§Ù„ÙŠ ØµØ§Ø¯Ø±Ø© Ù…Ù† ÙˆØ­Ø¯Ø© Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ© FIU",
        "Ø§Ù„Ø¬Ù†Ø³ÙŠØ©": "Ø£Ø®Ø±Ù‰"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ù‚Ø§Ø¦Ù…Ø©_Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙŠÙ†");
    XLSX.writeFile(wb, "Ù‚Ø§Ù„Ø¨_Ø§Ø³ØªÙŠØ±Ø§Ø¯_Ø§Ù„Ø£Ø´Ø®Ø§Øµ_Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙŠÙ†_KYC.xlsx");
  };

  const [letterhead, setLetterhead] = useState(loadLetterhead);

  const updateLetterhead = (partial: Partial<{ headerImg: string; footerImg: string }>) => {
    setLetterhead((prev) => {
      const next = {
        headerImg: partial.headerImg !== undefined ? partial.headerImg : prev.headerImg,
        footerImg: partial.footerImg !== undefined ? partial.footerImg : prev.footerImg,
      };
      saveLetterhead(next);
      return next;
    });
  };
  const [hearingSubTab, setHearingSubTab] = useState<"hearings" | "deadlines">("hearings");

  // Client portal & Doc generator states
  const [clientPortalId, setClientPortalId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("notice");
  const [selectedGenCaseId, setSelectedGenCaseId] = useState<number>(1);

  const [notifyModal, setNotifyModal] = useState<{
    recipientName: string;
    recipientPhone: string;
    recipientEmail: string;
    channel: "ÙˆØ§ØªØ³Ø§Ø¨" | "Ø¥ÙŠÙ…ÙŠÙ„" | "ÙƒÙ„Ø§Ù‡Ù…Ø§";
    type: "ØªÙ†Ø¨ÙŠÙ‡ Ø¬Ù„Ø³Ø©" | "ØªØ­Ø¯ÙŠØ« Ù‚Ø¶ÙŠØ©" | "ØªØ°ÙƒÙŠØ± ÙØ§ØªÙˆØ±Ø©" | "ØªØ¬Ø¯ÙŠØ¯ ÙˆØ«Ø§Ø¦Ù‚ / KYC" | "ØªØ¬Ø¯ÙŠØ¯ ÙˆÙƒØ§Ù„Ø© / POA" | "ØªÙ†Ø¨ÙŠÙ‡ Ù…ÙŠØ¹Ø§Ø¯ Ø·Ø¹Ù† / Ø§Ø³ØªØ¦Ù†Ø§Ù" | "ØªØ°ÙƒÙŠØ± Ù‚Ø³Ø· ÙØ§ØªÙˆØ±Ø©" | "Ø±Ø³Ø§Ù„Ø© Ø¹Ø§Ù…Ø©";
    subject: string;
    message: string;
    relatedRef?: string;
  } | null>(null);

  const [selectedRollDate, setSelectedRollDate] = useState<string>(todayISO());
  const [rollCourtFilter, setRollCourtFilter] = useState<string>("Ø§Ù„ÙƒÙ„");

  const [report, setReport] = useState<any>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [isSecureBlurred, setIsSecureBlurred] = useState(false);
  const [firmLetterhead, setFirmLetterhead] = useState<string | null>(() => loadStorage("firm_letterhead", null));
  const [firmStamp, setFirmStamp] = useState<string | null>(() => loadStorage("firm_stamp", null));
  const [userSignature, setUserSignature] = useState<string | null>(() => loadStorage("user_signature_" + currentUser.id, null));
  
  useEffect(() => {
    setUserSignature(loadStorage("user_signature_" + currentUser.id, null));
  }, [currentUser]);
  useEffect(() => {
    if (modal === "delegation-preview") {
      logAuditAction("VIEW", "Ø§Ù„Ø­Ù‚ÙŠØ¨Ø© Ø§Ù„Ø®Ø§ØµØ©", "Ø¹Ø±Ø¶ Ù…Ø³ØªÙ†Ø¯ Ø±Ø³Ù…ÙŠ", "ØªÙ… ÙØªØ­ Ù…Ø³ØªÙ†Ø¯ Ø§Ù„Ø¥Ù†Ø§Ø¨Ø© Ù„Ù„Ø¹Ø±Ø¶", 0);
      
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'P' || e.key === 'S' || e.key === 'C')) {
          e.preventDefault();
          alert("ØºÙŠØ± Ù…ØµØ±Ø­: ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ø®ØªØµØ§Ø± Ù…Ø­Ø¸ÙˆØ±.");
          logAuditAction("SECURITY_ALERT", "Ø§Ù„Ø­Ù‚ÙŠØ¨Ø© Ø§Ù„Ø®Ø§ØµØ©", "Ù…Ø­Ø§ÙˆÙ„Ø© Ù†Ø³Ø®/Ø·Ø¨Ø§Ø¹Ø©", `Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ø®ØªØµØ§Ø± ${e.key}`, 0);
        }
      };
      
      const handleBlur = () => { setIsSecureBlurred(true); };
      const handleFocus = () => { setIsSecureBlurred(false); };
      const handleVisibility = () => { if (document.hidden) setIsSecureBlurred(true); else setIsSecureBlurred(false); };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      setIsSecureBlurred(false);
    }
  }, [modal]);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [caseView, setCaseView] = useState<number | null>(null);
    const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState<Record<string, boolean>>({});
  const toggleFilters = (tabKey: string) => setShowFilters(prev => ({ ...prev, [tabKey]: !prev[tabKey] }));
  const closeFilters = (tabKey: string) => { if (tabKey === 'cases') setShowAdvancedFilters(false); setShowFilters(prev => ({ ...prev, [tabKey]: false })); };
  const [caseStageFilter, setCaseStageFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseFilter, setCaseFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseJudgeFilter, setCaseJudgeFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseCourtFilter, setCaseCourtFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseTypeFilter, setCaseTypeFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseEmirateFilter, setCaseEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseClientFilter, setCaseClientFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseClientTypeFilter, setCaseClientTypeFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseYearFilter, setCaseYearFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [caseSortBy, setCaseSortBy] = useState<"default" | "newest" | "oldest" | "number" | "client" | "court">("default");
    const [taskEmirateFilter, setTaskEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [hearingEmirateFilter, setHearingEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [precedentEmirateFilter, setPrecedentEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [invoiceEmirateFilter, setInvoiceEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [poaEmirateFilter, setPoaEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");
  const [kycEmirateFilter, setKycEmirateFilter] = useState("Ø§Ù„ÙƒÙ„");

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCaseStatsOnDemand, setShowCaseStatsOnDemand] = useState(false);

  // Ø­Ø§Ù„Ø§Øª Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†
    const [clientCategoryFilter, setClientCategoryFilter] = useState<string>("Ø§Ù„ÙƒÙ„");
  const [clientEmirateFilter, setClientEmirateFilter] = useState<string>("Ø§Ù„ÙƒÙ„");
  const [clientSearch, setClientSearch] = useState<string>("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToast, setClientToast] = useState<string | null>(null);

  // Ù†Ù‚Ù„ ØªØµÙ†ÙŠÙ Ø§Ù„Ø¬Ù‡Ø© Ø£Ùˆ Ø§Ù„Ø´Ø®Øµ ÙŠØ¯ÙˆÙŠØ§Ù‹
  const moveClientCategory = (clientId: number, newType: string) => {
    if (!checkPerm("manageClients", "ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„")) return;
    const clientObj = clients.find((c) => c.id === clientId);
    if (!clientObj) return;
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, type: newType } : c)));
    setClientToast(`ØªÙ… Ù†Ù‚Ù„ "${clientObj.name}" Ø¥Ù„Ù‰ ØªØµÙ†ÙŠÙ (${newType}) Ø¨Ù†Ø¬Ø§Ø­`);
    setTimeout(() => setClientToast(null), 4000);
  };

  // Ø­ÙØ¸ ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„ / Ø¬Ù‡Ø© Ø§Ù„Ø§ØªØµØ§Ù„
  const saveEditClient = () => {
    if (!checkPerm("manageClients", "ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙƒÙ„")) return;
    if (!editingClient || !editingClient.name) return;
    setClients((prev) => prev.map((c) => (c.id === editingClient.id ? editingClient : c)));
    setEditingClient(null);
    setClientToast(`ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª "${editingClient.name}" Ø¨Ù†Ø¬Ø§Ø­`);
    setTimeout(() => setClientToast(null), 4000);
  };

  // Ø­Ø°Ù Ù…ÙˆÙƒÙ„ / Ø¬Ù‡Ø© Ø§ØªØµØ§Ù„ ÙŠØ¯ÙˆÙŠÙ‹Ø§ Ù…Ø¹ Ø§Ù„ØªØ£ÙƒÙŠØ¯ ÙˆØ¯Ø¹Ù… Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† Ø§Ù„Ù…Ø±ØªØ¨Ø·ÙŠÙ† Ø¨Ù‚Ø¶Ø§ÙŠØ§
  const deleteClient = (clientId: number) => {
    const cObj = clients.find((c) => c.id === clientId);
    if (!cObj) return;
    const linkedCases = cases.filter((x) => x.clientId === clientId);
    const linkedPoas = poas.filter((p) => p.clientId === clientId);
    const linkedAgreements = officeAgreements.filter((a) => a.clientId === clientId);
    const linkedInvoices = invoices.filter((i) => i.clientId === clientId);

    const details = `Ø§Ù„Ù†ÙˆØ¹: ${cObj.type} | Ø§Ù„Ù‡ÙˆÙŠØ©/Ø§Ù„Ø±Ø®ØµØ©: ${cObj.idNo || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯"} | Ø§Ù„Ù‡Ø§ØªÙ: ${cObj.phone || "â€”"}${
      linkedCases.length > 0 ? `\nâš ï¸ Ù…Ø±ØªØ¨Ø· Ø¨Ù€ (${linkedCases.length}) Ù‚Ø¶Ø§ÙŠØ§ Ù…Ø³Ø¬Ù„Ø© Ø¨Ø§Ù„Ù†Ø¸Ø§Ù….` : ""
    }${linkedPoas.length > 0 ? `\nâš ï¸ Ù…Ø±ØªØ¨Ø· Ø¨Ù€ (${linkedPoas.length}) ÙˆÙƒØ§Ù„Ø§Øª Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©.` : ""}${
      linkedAgreements.length > 0 ? `\nâš ï¸ Ù…Ø±ØªØ¨Ø· Ø¨Ù€ (${linkedAgreements.length}) Ø§ØªÙØ§Ù‚ÙŠØ§Øª Ø£ØªØ¹Ø§Ø¨.` : ""
    }${linkedInvoices.length > 0 ? `\nâš ï¸ Ù…Ø±ØªØ¨Ø· Ø¨Ù€ (${linkedInvoices.length}) ÙÙˆØ§ØªÙŠØ± Ù…Ø§Ù„ÙŠØ©.` : ""}`;

    requestDelete({
      section: "Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ§Ù„Ø´Ø±ÙƒØ§Øª",
      title: `Ø§Ù„Ù…ÙˆÙƒÙ„: ${cObj.name}`,
      details,
      permKey: "deleteClients",
      actionName: "Ø­Ø°Ù Ø§Ù„Ù…ÙˆÙƒÙ„",
      onConfirm: () => {
        logAuditAction("DELETE", "Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†", `Ø§Ù„Ù…ÙˆÙƒÙ„: ${cObj.name}`, `Ø­Ø°Ù Ø§Ù„Ù…ÙˆÙƒÙ„ ${cObj.name} (${cObj.type}) ÙŠØ¯ÙˆÙŠÙ‹Ø§ Ù…Ù† Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙƒØªØ¨`, cObj.id);
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        if (editingClient?.id === clientId) {
          setEditingClient(null);
        }
        setClientToast(`ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…ÙˆÙƒÙ„ "${cObj.name}" Ø¨Ù†Ø¬Ø§Ø­`);
        setTimeout(() => setClientToast(null), 4000);
      },
    });
  };

  // Ø­Ø§Ù„Ø© Ù…ÙˆØ¯Ø§Ù„ Supabase SQL ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù…Ø¹Ù„Ù‚ÙŠÙ†
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  // Ø­Ø§Ù„Ø§Øª ØªØµØ¯ÙŠØ± ÙˆØ§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠØ© (Backup & Restore JSON)
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [backupActiveTab, setBackupActiveTab] = useState<"export" | "restore">("export");
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… (Legal AI Assistant - Gemini 3.6 Flash)
  const [isAiAssistantEnabled, setIsAiAssistantEnabled] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiDepartment, setAiDepartment] = useState<string>("Ø¹Ø§Ù…");
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<string>("advice");

  // Ø¯Ø§Ù„Ø© ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…
  const handleAskAiAssistant = async (customQuery?: string, customDept?: string, customMode?: string) => {
    const q = (customQuery !== undefined ? customQuery : aiQuery).trim();
    if (!q) return;

    const deptToUse = customDept || aiDepartment || tab || "general";
    const modeToUse = customMode || aiMode || "advice";

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    // ØªØ¬Ù‡ÙŠØ² Ø³ÙŠØ§Ù‚ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ù…Ø£Ø®ÙˆØ°Ø© Ù…Ù† Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ù…Ø®ØªØ§Ø± Ù„ØªØ²ÙˆÙŠØ¯ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø¨Ø¥Ø¬Ø§Ø¨Ø© Ø¯Ù‚ÙŠÙ‚Ø©
    let contextData: any = null;
    if (deptToUse === "cases" || deptToUse.includes("Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§")) {
      contextData = cases.slice(0, 6).map(c => ({ ÙƒÙˆØ¯: c.number, Ù…ÙˆØ¶ÙˆØ¹_Ø§Ù„Ù‚Ø¶ÙŠØ©: c.subject, Ø§Ù„Ù…Ø­ÙƒÙ…Ø©: c.court, Ø§Ù„Ù†ÙˆØ¹: c.type, Ø§Ù„Ø­Ø§Ù„Ø©: c.status }));
    } else if (deptToUse === "clients" || deptToUse.includes("Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ†")) {
      contextData = clients.slice(0, 6).map(cl => ({ Ø§Ù„Ø§Ø³Ù…: cl.name, Ø§Ù„Ù†ÙˆØ¹: cl.type, Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª: cl.emirate, Ù‡Ø§ØªÙ: cl.phone }));
    } else if (deptToUse === "hearings" || deptToUse.includes("Ø§Ù„Ø¬Ù„Ø³Ø§Øª")) {
      contextData = hearings.slice(0, 6).map(h => ({ Ø§Ù„ØªØ§Ø±ÙŠØ®: h.date, Ø§Ù„Ù…Ø­ÙƒÙ…Ø©: h.type, Ù…Ù„Ø§Ø­Ø¸Ø§Øª: h.notes }));
    } else if (deptToUse === "invoices" || deptToUse.includes("Ø§Ù„ÙÙˆØ§ØªÙŠØ±")) {
      contextData = invoices.slice(0, 6).map(inv => ({ Ø±Ù‚Ù…_Ø§Ù„ÙØ§ØªÙˆØ±Ø©: inv.number, Ø§Ù„Ù…Ø¨Ù„Øº: inv.amount, Ø§Ù„Ø­Ø§Ù„Ø©: inv.status }));
    } else if (deptToUse === "tasks" || deptToUse.includes("Ø§Ù„Ù…Ù‡Ø§Ù…")) {
      contextData = tasks.slice(0, 6).map(t => ({ Ø§Ù„Ù…Ù‡Ù…Ø©: t.title, Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©: t.priority, Ø§Ù„Ù…ÙƒÙ„Ù: t.assignee }));
    }

    try {
      const res = await fetch("/api/legal-ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: deptToUse,
          query: q,
          contextData,
          mode: modeToUse
        })
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setAiResponse(data.answer);
      } else {
        setAiError(data.error || "ØªØ¹Ø°Ø± Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø±Ø¯ Ù…Ù† Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ.");
      }
    } catch (err: any) {
      setAiError("Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ: " + (err.message || err));
    } finally {
      setAiLoading(false);
    }
  };

  const openAiForCurrentSection = (promptText?: string, modeName?: string) => {
    const currentDeptMap: Record<string, string> = {
      dashboard: "Ø¹Ø§Ù…",
      cases: "Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ø¯Ø¹Ø§ÙˆÙ‰",
      clients: "Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ¬Ù‡Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„",
      hearings: "Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙˆØ§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯",
      tasks: "Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„ØªÙˆÙƒÙŠÙ„Ø§Øª",
      invoices: "Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ù…Ø§Ù„ÙŠØ©",
      contracts: "Ø§Ù„Ø¹Ù‚ÙˆØ¯ ÙˆØ§Ù„Ø§ØªÙØ§Ù‚ÙŠØ§Øª",
      docs: "Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª ÙˆØ§Ù„Ø£Ø±Ø´ÙŠÙ",
      employees: "Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† ÙˆØ§Ù„ÙƒØ§Ø¯Ø±",
      consultations: "Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª",
      users: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†"
    };

    const sectionLabel = currentDeptMap[tab] || "Ø¹Ø§Ù…";
    setAiDepartment(sectionLabel);
    setAiResponse(null);
    setAiError(null);
    setShowAiModal(true);

    if (promptText) {
      setAiQuery(promptText);
      handleAskAiAssistant(promptText, sectionLabel, modeName || "advice");
    }
  };

  const handleExportBackup = () => {
    const exportDate = new Date();
    const dateStr = exportDate.toISOString().split("T")[0];
    const timeStr = exportDate.toTimeString().split(" ")[0].replace(/:/g, "-");

    const backupData = {
      appVersion: "1.0.0",
      system: "Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©",
      exportTimestamp: exportDate.toISOString(),
      exportDateFormatted: exportDate.toLocaleString("ar-AE"),
      exportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        roleTitle: currentUser.roleTitle,
      },
      counts: {
        clients: clients.length,
        cases: cases.length,
        hearings: hearings.length,
        tasks: tasks.length,
        invoices: invoices.length,
        docs: docs.length,
        poas: poas.length,
        kyc: kyc.length,
        courtContacts: courtContacts.length,
        officeAgreements: officeAgreements.length,
        employees: employees.length,
        leaveRequests: leaveRequests.length,
        employeeExpenses: employeeExpenses.length,
        auditLogs: auditLogs.length,
        precedents: precedents.length,
        users: users.length,
        feeAgreements: feeAgreements.length,
        payments: payments.length,
        consultationBookings: consultationBookings.length,
      },
      database: {
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
        auditLogs,
        precedents,
        users,
        feeAgreements,
        payments,
        consultationBookings,
        consultationSettings,
        waChats,
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `suood_law_backup_${dateStr}_${timeStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAuditAction(
      "CREATE",
      "Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠ",
      "ØªØµØ¯ÙŠØ± Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
      `ØªÙ… ØªØµØ¯ÙŠØ± Ù†Ø³Ø®Ø© Ø§Ø­ØªÙŠØ§Ø·ÙŠØ© ÙƒØ§Ù…Ù„Ø© Ù…Ù† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨ØµÙŠØºØ© JSON ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ${cases.length} Ù‚Ø¶ÙŠØ© Ùˆ ${clients.length} Ù…ÙˆÙƒÙ„.`
    );
  };

  const handleFileChangeForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setRestoreError("Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø­Ø¯Ø¯ Ù„Ø§ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø¨Ù†ÙŠØ© Ø¨ÙŠØ§Ù†Ø§Øª ØµØ­ÙŠØ­Ø© Ø§Ù„Ø®Ø§ØµØ© Ø¨Ù†Ø¸Ø§Ù… Ø§Ù„Ù…ÙƒØªØ¨.");
          setRestorePreview(null);
          return;
        }

        const db = parsed.database || parsed.data || {};
        setRestorePreview({
          raw: parsed,
          db,
          exportDateFormatted: parsed.exportDateFormatted || parsed.exportTimestamp || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
          exportedBy: parsed.exportedBy?.name || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
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
          }
        });
      } catch (err: any) {
        setRestoreError("ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ù…Ù„Ù JSON. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø®ØªÙŠØ§Ø± Ù…Ù„Ù Ø¨ØµÙŠØºØ© Ø³Ù„ÙŠÙ…Ø©.");
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const executeRestore = () => {
    if (!restorePreview || !restorePreview.db) return;
    const db = restorePreview.db;

    try {
      if (Array.isArray(db.clients)) { setClients(db.clients); saveStorage("firm_clients", db.clients); }
      if (Array.isArray(db.cases)) { setCases(db.cases); saveStorage("firm_cases", db.cases); }
      if (Array.isArray(db.hearings)) { setHearings(db.hearings); saveStorage("firm_hearings", db.hearings); }
      if (Array.isArray(db.tasks)) { setTasks(db.tasks); saveStorage("firm_tasks", db.tasks); }
      if (Array.isArray(db.invoices)) { setInvoices(db.invoices); saveStorage("firm_invoices", db.invoices); }
      if (Array.isArray(db.docs)) { setDocs(db.docs); saveStorage("firm_docs", db.docs); }
      if (Array.isArray(db.poas)) { setPoas(db.poas); saveStorage("firm_poas", db.poas); }
      if (Array.isArray(db.kyc)) { setKyc(db.kyc); saveStorage("firm_kyc", db.kyc); }
      if (Array.isArray(db.courtContacts)) { setCourtContacts(db.courtContacts); saveStorage("firm_court_contacts", db.courtContacts); }
      if (Array.isArray(db.officeAgreements)) { setOfficeAgreements(db.officeAgreements); saveStorage("firm_office_agreements", db.officeAgreements); }
      if (Array.isArray(db.employees)) { setEmployees(db.employees); saveStorage("firm_employees", db.employees); }
      if (Array.isArray(db.leaveRequests)) { setLeaveRequests(db.leaveRequests); saveStorage("firm_leave_requests", db.leaveRequests); }
      if (Array.isArray(db.employeeExpenses)) { setEmployeeExpenses(db.employeeExpenses); saveStorage("firm_employee_expenses", db.employeeExpenses); }
      if (Array.isArray(db.auditLogs)) { setAuditLogs(db.auditLogs); saveStorage("firm_audit_logs", db.auditLogs); }
      if (Array.isArray(db.precedents)) { setPrecedents(db.precedents); saveStorage("firm_legal_precedents", db.precedents); }
      if (Array.isArray(db.users)) { setUsers(db.users); saveStorage("firm_users", db.users); }
      if (Array.isArray(db.feeAgreements)) { setFeeAgreements(db.feeAgreements); saveStorage("firm_fee_agreements", db.feeAgreements); }
      if (Array.isArray(db.payments)) { setPayments(db.payments); saveStorage("firm_payments", db.payments); }
      if (Array.isArray(db.consultationBookings)) { setConsultationBookings(db.consultationBookings); saveStorage("firm_consultation_bookings", db.consultationBookings); }
      if (db.consultationSettings) { setConsultationSettings(db.consultationSettings); saveStorage("firm_consultation_settings", db.consultationSettings); }
      if (Array.isArray(db.waChats)) { setWaChats(db.waChats); saveStorage("firm_wa_chats", db.waChats); }

      logAuditAction(
        "UPDATE",
        "Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠ",
        "Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
        `ØªÙ…Øª Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ù†Ø³Ø®Ø© Ø§Ø­ØªÙŠØ§Ø·ÙŠØ© Ù…Ù† Ø§Ù„Ù…Ù„Ù Ø¨Ù†Ø¬Ø§Ø­ ÙˆØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… (${restorePreview.counts.cases} Ù‚Ø¶ÙŠØ©ØŒ ${restorePreview.counts.clients} Ù…ÙˆÙƒÙ„).`
      );

      setRestoreSuccessMsg("ØªÙ…Øª Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒØ§ÙØ© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ§Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­! ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…Ø®Ø²Ù†Ø©.");
      setRestorePreview(null);
    } catch (err: any) {
      setRestoreError("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØ·Ø¨ÙŠÙ‚ Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª: " + err.message);
    }
  };

  // Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ù…Ø¯Ù…Ø¬ (In-App Email & Supabase Sync)
  const [emailFolder, setEmailFolder] = useState<"inbox" | "sent" | "draft" | "trash">("inbox");
  const [emailSearch, setEmailSearch] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(1);
  const [showComposeEmail, setShowComposeEmail] = useState<boolean>(false);
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState<boolean>(false);

  const [composeTo, setComposeTo] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [composeAttachment, setComposeAttachment] = useState<string>("");

  // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ (SMTP / IMAP / App Settings)
  const [emailConfig, setEmailConfig] = useState<{
    email: string;
    senderName: string;
    appPassword?: string;
    smtpHost: string;
    smtpPort: number;
    secure: boolean;
    protocol: "ssl_tls" | "starttls" | "none";
    rejectUnauthorized: boolean;
    isConfigured: boolean;
    lastTestedAt?: string;
    lastTestStatus?: "success" | "failed";
  }>({
    email: "info@lawyersuood.com",
    senderName: "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ",
    appPassword: "",
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    secure: false,
    protocol: "starttls",
    rejectUnauthorized: false,
    isConfigured: true
  });

  // Ø­Ø§Ù„Ø© Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ§Ù„Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙØ¹Ù„ÙŠ Ù„Ù„ÙÙˆØ§ØªÙŠØ±
  const [testSmtpLoading, setTestSmtpLoading] = useState<boolean>(false);
  const [testSmtpResult, setTestSmtpResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    code?: string;
    recommendation?: string;
    details?: any;
  } | null>(null);

  const [testInvoiceLoading, setTestInvoiceLoading] = useState<boolean>(false);
  const [testInvoiceRecipient, setTestInvoiceRecipient] = useState<string>("");
  const [testInvoiceResult, setTestInvoiceResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [inAppEmails, setInAppEmails] = useState<Array<{
    id: number | string;
    folder: "inbox" | "sent" | "draft" | "trash";
    sender: string;
    senderEmail: string;
    recipient: string;
    recipientEmail: string;
    subject: string;
    body: string;
    date: string;
    isRead: boolean;
    hasAttachment?: boolean;
    attachmentName?: string;
  }>>(() => {
    try {
      const saved = loadStorage<any[]>("firm_in_app_emails", []);
      const clean = (saved || []).filter(e => !isDemoEmail(e));
      saveStorage("firm_in_app_emails", clean);
      return clean;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    saveStorage("firm_in_app_emails", inAppEmails);
  }, [inAppEmails]);

  const [waBackendSession, setWaBackendSession] = useState<{
    status: 'disconnected' | 'qr_ready' | 'connected';
    qrCodeUrl: string | null;
    pairingCode: string | null;
    phoneNumber: string | null;
    connectedAt: string | null;
    messagesCount: number;
  }>({
    status: 'disconnected',
    qrCodeUrl: null,
    pairingCode: null,
    phoneNumber: null,
    connectedAt: null,
    messagesCount: 0
  });

  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // Ø§Ø³ØªØ¹Ù„Ø§Ù… Ø­Ø§Ù„Ø© ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù…Ù† Ø§Ù„Ø³ÙŠØ±ÙØ±
  const fetchWaStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const generateWaQrCode = async () => {
    setIsGeneratingQr(true);
    try {
      const res = await fetch('/api/whatsapp/generate-qr', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data.session);
      }
    } catch (e) {
      alert("ØªØ¹Ø°Ø± ØªÙˆÙ„ÙŠØ¯ ÙƒÙˆØ¯ Ø§Ù„Ù€ QR Ø§Ù„Ø®Ø§Øµ Ø¨ÙˆØ­Ø¯Ø© ÙˆØ§ØªØ³Ø§Ø¨");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const simulateScanQr = async () => {
    try {
      const res = await fetch('/api/whatsapp/connect-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+971 50 889 9123' })
      });
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data.session);
        setPermissionNotice("ØªÙ… Ø±Ø¨Ø· ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨ Ø¨Ù†Ø¬Ø§Ø­ ÙˆÙ…Ø²Ø§Ù…Ù†Ø© Ø§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª Ø£ÙˆÙ†Ù„Ø§ÙŠÙ†!");
      }
    } catch (e) {
      // ignore
    }
  };

  const disconnectWaSession = async () => {
    try {
      const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWaBackendSession(data.session);
        setPermissionNotice("ØªÙ… Ù‚Ø·Ø¹ Ø§ØªØµØ§Ù„ Ø¬Ù„Ø³Ø© ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨ Ø¨Ù†Ø¬Ø§Ø­");
      }
    } catch (e) {
      // ignore
    }
  };

  // ================= Ù…Ø­Ø±Ùƒ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ø°ÙƒÙŠ ÙˆÙ…Ø²Ø§Ù…Ù†Ø© Supabase =================
  const fetchEmailSettings = async () => {
    try {
      const res = await fetch('/api/email/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setEmailConfig(prev => ({
            ...prev,
            email: data.settings.email || prev.email,
            senderName: data.settings.senderName || prev.senderName,
            smtpHost: data.settings.host || prev.smtpHost,
            smtpPort: data.settings.port || prev.smtpPort,
            secure: data.settings.secure ?? prev.secure,
            protocol: data.settings.protocol || (data.settings.port === 465 ? 'ssl_tls' : 'starttls'),
            rejectUnauthorized: data.settings.rejectUnauthorized ?? false,
            lastTestedAt: data.settings.lastTestedAt,
            lastTestStatus: data.settings.lastTestStatus,
            isConfigured: true
          }));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchSupabaseProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) {
        // Deduplicate fetched profiles before processing
        const fetchedProfiles = data || [];
        const uniqueProfiles = Array.from(
          new Map(fetchedProfiles.map((p: any) => [p.id || p.email?.trim().toLowerCase(), p])).values()
        );

        setUsers((prev) => {
          let updated = [...prev];
          let changed = false;

          const dbIds = new Set(uniqueProfiles.map((p: any) => p.id).filter(Boolean));
          const dbEmails = new Set(uniqueProfiles.map((p: any) => p.email?.trim().toLowerCase()).filter(Boolean));

          // Filter out users that were removed from Supabase profiles (unless primary local admin)
          const initialLen = updated.length;
          updated = updated.filter((u) => {
            if (u.id === 1 || u.name.includes("Ø³Ø¹ÙˆØ¯")) return true;
            if (u.supabaseId && !dbIds.has(u.supabaseId) && !dbEmails.has(u.email.toLowerCase())) return false;
            return true;
          });
          if (updated.length !== initialLen) changed = true;

          uniqueProfiles.forEach((p: any) => {
            const emailClean = p.email?.trim().toLowerCase();
            if (!emailClean) return;
            const existingIdx = updated.findIndex((u) => u.email.toLowerCase() === emailClean || (p.id && u.supabaseId === p.id));
            const pPhone = p.phone || p.phone_number || "0500000000";
            const pName = p.full_name || p.name || emailClean.split("@")[0];
            const pStatus = (p.status === "pending" || p.status === "Ù…Ø¹Ù„Ù‚") ? "pending" : (p.status === "approved" || p.status === "Ù†Ø´Ø·" || p.status === "active") ? "approved" : "rejected";

            // If profile status is rejected or deleted, remove from state
            if (pStatus === "rejected") {
              if (existingIdx >= 0) {
                updated.splice(existingIdx, 1);
                changed = true;
              }
              return;
            }

            if (existingIdx >= 0) {
              const cur = updated[existingIdx];
              const pRoleKey = (p.role as any) || cur.roleKey;
              const pRoleTitle = p.role_title || cur.roleTitle;
              let dbPerms = cur.permissions;
              if (p.permissions) {
                if (typeof p.permissions === "string") {
                  try { dbPerms = JSON.parse(p.permissions); } catch (e) {}
                } else if (typeof p.permissions === "object") {
                  dbPerms = p.permissions;
                }
              }

              if (
                cur.status !== pStatus ||
                (pPhone && cur.phone !== pPhone) ||
                (pName && cur.name !== pName) ||
                p.id !== cur.supabaseId ||
                cur.roleKey !== pRoleKey ||
                cur.roleTitle !== pRoleTitle ||
                JSON.stringify(cur.permissions) !== JSON.stringify(dbPerms)
              ) {
                updated[existingIdx] = { 
                  ...cur, 
                  status: pStatus,
                  phone: pPhone || cur.phone,
                  name: pName || cur.name,
                  supabaseId: p.id || cur.supabaseId,
                  roleKey: pRoleKey,
                  roleTitle: pRoleTitle,
                  permissions: dbPerms
                };
                changed = true;
              }
            } else {
              const roleKey = (p.role as any) || "lawyer";
              const roleTitle = p.role_title || (ROLE_PRESETS[roleKey]?.title) || "Ù…Ø­Ø§Ù…Ù ÙˆÙ…Ø³ØªØ´Ø§Ø±";
              let dbPerms = ROLE_PRESETS[roleKey]?.permissions || ROLE_PRESETS.lawyer.permissions;
              if (p.permissions) {
                if (typeof p.permissions === "string") {
                  try { dbPerms = JSON.parse(p.permissions); } catch (e) {}
                } else if (typeof p.permissions === "object") {
                  dbPerms = p.permissions;
                }
              }

              const newUser: UserItem = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                supabaseId: p.id,
                name: pName,
                email: emailClean,
                phone: pPhone,
                password: p.password || "123456",
                roleKey: roleKey as any,
                roleTitle: roleTitle,
                status: pStatus,
                avatarBg: "bg-amber-600 text-white",
                avatarText: pName.slice(0, 2),
                permissions: dbPerms
              };
              updated.push(newUser);
              changed = true;
            }
          });

          // Deduplicate final users array by unique id / email
          const deduplicatedMap = new Map();
          updated.forEach((u) => {
            const key = u.supabaseId || u.email?.toLowerCase() || u.id;
            if (!deduplicatedMap.has(key)) {
              deduplicatedMap.set(key, u);
            }
          });
          const deduplicated = Array.from(deduplicatedMap.values());

          if (changed || deduplicated.length !== prev.length) {
            saveStorage("firm_users", deduplicated);
            return deduplicated;
          }
          return prev;
        });
      }
    } catch (err) {
      console.log("Supabase profiles sync note:", err);
    }
  };

  const fetchSupabaseEmailMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("email_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const nonDemoData = data.filter((row: any) => !isDemoEmail({
          id: row.id,
          subject: row.subject,
          sender: row.sender_name,
          senderEmail: row.sender_email,
          body: row.body || row.message_body
        }));

        if (nonDemoData.length > 0) {
          setInAppEmails(prev => {
            const updated = [...prev];
            nonDemoData.forEach((row: any) => {
              const mappedMsg = {
                id: row.id || Date.now() + Math.random(),
                folder: (row.folder as any) || (row.sender_email === emailConfig.email ? "sent" : "inbox"),
                sender: row.sender_name || row.sender_email || "Ù…Ø±Ø³Ù„ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ",
                senderEmail: row.sender_email || "",
                recipient: row.recipient_name || row.recipient_email || "",
                recipientEmail: row.recipient_email || "",
                subject: row.subject || "Ø¨Ø¯ÙˆÙ† Ù…ÙˆØ¶ÙˆØ¹",
                body: row.body || row.message_body || "",
                date: row.created_at ? new Date(row.created_at).toLocaleString("ar-AE") : "Ø§Ù„Ø¢Ù†",
                isRead: row.is_read ?? false,
                hasAttachment: !!row.attachment_name,
                attachmentName: row.attachment_name || ""
              };
              const existingIndex = updated.findIndex(m => m.id === mappedMsg.id || (m.subject === mappedMsg.subject && m.date === mappedMsg.date));
              if (existingIndex >= 0) {
                updated[existingIndex] = mappedMsg;
              } else {
                updated.unshift(mappedMsg);
              }
            });
            return [...updated];
          });
        }
      }
    } catch (err) {
      console.log("Supabase email sync note:", err);
    }
  };

  const handleTestSmtpConnection = async () => {
    if (!emailConfig.email || !emailConfig.smtpHost) {
      alert("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù„Ø®Ø§Ø¯Ù… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ (SMTP Host) Ù‚Ø¨Ù„ Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±");
      return;
    }
    setTestSmtpLoading(true);
    setTestSmtpResult(null);

    try {
      const res = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailConfig.email,
          senderName: emailConfig.senderName,
          password: emailConfig.appPassword,
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.protocol === "ssl_tls",
          protocol: emailConfig.protocol,
          rejectUnauthorized: emailConfig.rejectUnauthorized
        })
      });

      const data = await res.json();
      setTestSmtpResult({
        success: Boolean(data.success),
        message: data.message || (data.success ? "ØªÙ… Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø£Ù…Ø§Ù† Ø¨Ù†Ø¬Ø§Ø­!" : "ÙØ´Ù„ Ø§Ø®ØªØ¨Ø§Ø± Ø§ØªØµØ§Ù„ SMTP"),
        latencyMs: data.latencyMs,
        code: data.code,
        recommendation: data.recommendation,
        details: data.details
      });

      if (data.success) {
        setEmailConfig(prev => ({
          ...prev,
          lastTestedAt: new Date().toLocaleTimeString("ar-AE", { hour: '2-digit', minute: '2-digit' }),
          lastTestStatus: "success"
        }));
      } else {
        setEmailConfig(prev => ({ ...prev, lastTestStatus: "failed" }));
      }
    } catch (err: any) {
      setTestSmtpResult({
        success: false,
        message: "ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù… Ø§Ù„Ù…Ø­Ù„ÙŠ Ø£Ùˆ Ø§Ù†Ù‚Ø·Ø¹ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„ Ø§Ù„Ø£Ù…Ø§Ù†",
        recommendation: "ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ØªØ´ØºÙŠÙ„ Ø®Ø§Ø¯Ù… Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ù…Ø­Ù„ÙŠ ÙˆØ¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©."
      });
    } finally {
      setTestSmtpLoading(false);
    }
  };

  const handleSendTestInvoice = async () => {
    const targetEmail = testInvoiceRecipient.trim() || emailConfig.email;
    if (!targetEmail) {
      alert("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù„Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©");
      return;
    }

    setTestInvoiceLoading(true);
    setTestInvoiceResult(null);

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: `ðŸ“„ [ÙØ­Øµ ØªØ³Ù„ÙŠÙ… ÙØ§ØªÙˆØ±Ø© Ø¶Ø±ÙŠØ¨ÙŠØ©] - Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© (${emailConfig.protocol.toUpperCase()})`,
          body: `Ø§Ù„Ù…ÙˆÙƒÙ„ Ø§Ù„ÙØ§Ø¶Ù„ / Ø§Ù„Ù…Ø³ØªÙ„Ù… Ø§Ù„Ù…Ø­ØªØ±Ù…ØŒ\n\nØªØ­ÙŠØ© Ø·ÙŠØ¨Ø© ÙˆØ¨Ø¹Ø¯ØŒ\n\nÙ‡Ø°Ø§ Ø¨Ø±ÙŠØ¯ ÙØ­Øµ Ø¢Ù„ÙŠ ØµØ§Ø¯Ø± Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ù…Ø±Ø§Ø³Ù„Ø§Øª Ø§Ù„Ù…ÙˆØ­Ø¯ Ø¨Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø­Ø§Ù…Ø§Ø© Ù„Ù„ØªØ£ÙƒØ¯ Ù…Ù† ÙˆØµÙˆÙ„ Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ø¶Ø±ÙŠØ¨ÙŠØ© ÙˆØ§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­ Ø¥Ù„Ù‰ ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„ÙˆØ§Ø±Ø¯ Ø§Ù„Ø®Ø§Øµ Ø¨ÙƒÙ….\n\nØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¹ÙŠÙ†Ø© Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ù„Ù„ÙØ§ØªÙˆØ±Ø©:\nâ€¢ Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©: INV-2026-TEST-VERIFIED\nâ€¢ Ø¨ÙŠØ§Ù† Ø§Ù„Ø®Ø¯Ù…Ø©: Ø£ØªØ¹Ø§Ø¨ Ø§Ø³ØªØ´Ø§Ø±Ø© ÙˆØ§Ø³ØªØ­Ù‚Ø§Ù‚ Ù‚Ø¶Ø§Ø¦ÙŠ ØªØ¬Ø±ÙŠØ¨ÙŠ\nâ€¢ Ø§Ù„Ù…Ø¨Ù„Øº Ø§Ù„Ø£ÙˆÙ„ÙŠ: 5,000 Ø¯Ø±Ù‡Ù… Ø¥Ù…Ø§Ø±Ø§ØªÙŠ\nâ€¢ Ø¶Ø±ÙŠØ¨Ø© Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ø¶Ø§ÙØ© VAT (5%): 250 Ø¯Ø±Ù‡Ù… Ø¥Ù…Ø§Ø±Ø§ØªÙŠ\nâ€¢ Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø³ØªØ­Ù‚: 5,250 Ø¯Ø±Ù‡Ù… Ø¥Ù…Ø§Ø±Ø§ØªÙŠ\nâ€¢ Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„ Ø§Ù„ØªØ´ÙÙŠØ± Ø§Ù„Ù…Ø¹ØªÙ…Ø¯: ${emailConfig.protocol.toUpperCase()} (${emailConfig.smtpHost}:${emailConfig.smtpPort})\n\nØªØ§Ø±ÙŠØ® ÙˆØ³Ø§Ø¹Ø© Ø§Ù„Ø¥Ø±Ø³Ø§Ù„: ${new Date().toLocaleString("ar-AE")}\n\nÙ…Ø¹ ØªØ­ÙŠØ§ØªØŒ\nÙ…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©`,
          smtp: {
            email: emailConfig.email,
            senderName: emailConfig.senderName,
            password: emailConfig.appPassword,
            host: emailConfig.smtpHost,
            port: emailConfig.smtpPort,
            protocol: emailConfig.protocol,
            rejectUnauthorized: emailConfig.rejectUnauthorized
          },
          isInvoiceTest: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestInvoiceResult({
          success: true,
          message: `ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­ Ø¥Ù„Ù‰ Ø§Ù„Ø¨Ø±ÙŠØ¯ (${targetEmail}) Ø¹Ø¨Ø± Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„ (${emailConfig.protocol.toUpperCase()})!`
        });
      } else {
        setTestInvoiceResult({
          success: false,
          message: `ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯: ${data.note || data.error || "ØªØ£ÙƒØ¯ Ù…Ù† ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø§Ù„ØªØ·Ø¨ÙŠÙ‚"}`
        });
      }
    } catch (err: any) {
      setTestInvoiceResult({
        success: false,
        message: "ÙØ´Ù„ ÙÙŠ Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©."
      });
    } finally {
      setTestInvoiceLoading(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    if (!emailConfig.email || !emailConfig.smtpHost) {
      alert("ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆØ®Ø§Ø¯Ù… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ SMTP");
      return;
    }

    try {
      await fetch('/api/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailConfig.email,
          senderName: emailConfig.senderName,
          password: emailConfig.appPassword,
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.protocol === "ssl_tls",
          protocol: emailConfig.protocol,
          rejectUnauthorized: emailConfig.rejectUnauthorized
        })
      });
    } catch (e) {
      console.log("Save email config note:", e);
    }

    setEmailConfig(prev => ({ ...prev, isConfigured: true }));
    setShowEmailSettingsModal(false);
    setPermissionNotice(`ØªÙ… Ø­ÙØ¸ ÙˆØªÙØ¹ÙŠÙ„ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆØ¨Ø±ÙˆØªÙˆÙƒÙˆÙ„ (${emailConfig.protocol.toUpperCase()}) Ø¨Ù†Ø¬Ø§Ø­ Ù„Ù€ (${emailConfig.email})`);
  };

  const handleSendInAppEmail = async () => {
    if (!composeTo.trim() || !composeSubject.trim()) {
      alert("ÙŠØ±Ø¬Ù‰ ØªØ¹Ø¨Ø¦Ø© Ø®Ø§Ù†ØªÙŠ Ø§Ù„Ù…Ø±Ø³Ù„ Ø¥Ù„ÙŠÙ‡ ÙˆÙ…ÙˆØ¶ÙˆØ¹ Ø§Ù„Ø±Ø³Ø§Ù„Ø©");
      return;
    }

    const newSentMail = {
      id: Date.now(),
      folder: "sent" as const,
      sender: emailConfig.senderName || currentUser.name,
      senderEmail: emailConfig.email || currentUser.email,
      recipient: composeTo,
      recipientEmail: composeTo,
      subject: composeSubject,
      body: composeBody,
      date: "Ø§Ù„Ø¢Ù†",
      isRead: true,
      hasAttachment: !!composeAttachment,
      attachmentName: composeAttachment || undefined
    };

    setInAppEmails(prev => [newSentMail, ...prev]);
    setShowComposeEmail(false);
    setEmailFolder("sent");
    setSelectedEmailId(newSentMail.id);

    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
          smtp: emailConfig
        })
      });
    } catch (e) {
      console.log("Server send email note:", e);
    }

    try {
      await supabase.from("email_messages").insert({
        folder: "sent",
        sender_name: emailConfig.senderName,
        sender_email: emailConfig.email,
        recipient_email: composeTo,
        subject: composeSubject,
        body: composeBody,
        is_read: true,
        attachment_name: composeAttachment || null,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.log("Supabase insert email note:", err);
    }

    setPermissionNotice("ØªÙ… ØªÙˆØ¬ÙŠÙ‡ ÙˆØ¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­ ÙˆØªÙˆØ«ÙŠÙ‚Ù‡Ø§ ÙÙŠ Ø¬Ø¯ÙˆÙ„ Supabase!");
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeAttachment("");
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem("firm_is_logged_in");
      localStorage.removeItem("firm_logged_in_user_id");
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // ØªÙØ±ÙŠØº ÙÙˆØ±ÙŠ ÙˆÙ…Ø¤ÙƒØ¯ Ù„Ø£ÙŠ Ù…Ø¹Ø·ÙŠØ§Øª ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ù…ØªØ¨Ù‚ÙŠØ© ÙÙŠ Ø§Ù„Ù€ LocalStorage Ù„Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„Ø¨Ø±ÙŠØ¯ ÙˆØ§Ù„Ù‚Ø¶Ø§ÙŠØ§ ÙˆØ§Ù„Ø¬Ù„Ø³Ø§Øª
    setCases(prev => {
      const cleanList = prev.filter(c => !isDemoCase(c)).map(sanitizeCase);
      const combined = [...cleanList, ...seedCases];
      const unique = deduplicateCases(combined);
      saveStorage("firm_cases", unique);
      return unique;
    });
    setClients(prev => {
      const combined = [...prev, ...seedClients];
      const unique = deduplicateClients(combined);
      saveStorage("firm_clients", unique);
      return unique;
    });
    setHearings(prev => {
      const clean = prev.filter(h => !isDemoHearing(h));
      saveStorage("firm_hearings", clean);
      return clean;
    });
    setTasks(prev => {
      const clean = prev.filter(t => !isDemoTask(t));
      saveStorage("firm_tasks", clean);
      return clean;
    });
    setInAppEmails(prev => {
      const clean = prev.filter(e => !isDemoEmail(e));
      saveStorage("firm_in_app_emails", clean);
      return clean;
    });

    fetchWaStatus();
    fetchEmailSettings();
    fetchSupabaseEmailMessages();
    fetchSupabaseProfiles();

    // Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ù…Ù† Ø¬Ù„Ø³Ø© Supabase ÙˆÙ…ØªØ§Ø¨Ø¹Ø© ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø¬Ù„Ø³Ø© (onAuthStateChange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
        const found = users.find((u) => u.email.toLowerCase() === email);
        if (found) {
          setCurrentUserId(found.id);
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
            localStorage.setItem("firm_logged_in_user_id", String(found.id));
          } catch (e) {}
        } else {
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
          } catch (e) {}
        }
      }
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
        const found = users.find((u) => u.email.toLowerCase() === email);
        if (found) {
          setCurrentUserId(found.id);
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
            localStorage.setItem("firm_logged_in_user_id", String(found.id));
          } catch (e) {}
        } else {
          setIsLoggedIn(true);
          try {
            localStorage.setItem("firm_is_logged_in", "true");
          } catch (e) {}
        }
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        try {
          localStorage.removeItem("firm_is_logged_in");
          localStorage.removeItem("firm_logged_in_user_id");
        } catch (e) {}
      }
    });

    // Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø§Ù„Ù„Ø­Ø¸ÙŠ ÙÙŠ Ø¬Ø¯ÙˆÙ„ Supabase profiles
    const profilesChannel = supabase
      .channel("realtime_profiles_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchSupabaseProfiles();
        }
      )
      .subscribe();

    // Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø§Ù„Ù„Ø­Ø¸ÙŠ ÙÙŠ Ø¬Ø¯ÙˆÙ„ Supabase email_messages
    const emailChannel = supabase
      .channel("realtime_email_messages_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_messages" },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow) {
            setInAppEmails(prev => {
              const mapped = {
                id: newRow.id || Date.now(),
                folder: (newRow.folder as any) || (newRow.sender_email === emailConfig.email ? "sent" : "inbox"),
                sender: newRow.sender_name || newRow.sender_email || "Ø±Ø³Ø§Ù„Ø© Ø¬Ø¯ÙŠØ¯Ø©",
                senderEmail: newRow.sender_email || "",
                recipient: newRow.recipient_name || newRow.recipient_email || "",
                recipientEmail: newRow.recipient_email || "",
                subject: newRow.subject || "Ø¨Ø¯ÙˆÙ† Ø¹Ù†ÙˆØ§Ù†",
                body: newRow.body || newRow.message_body || "",
                date: new Date().toLocaleString("ar-AE"),
                isRead: newRow.is_read ?? false,
                hasAttachment: !!newRow.attachment_name,
                attachmentName: newRow.attachment_name || ""
              };
              const exists = prev.some(m => m.id === mapped.id);
              if (exists) {
                return prev.map(m => m.id === mapped.id ? mapped : m);
              }
              return [mapped, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      authSub?.unsubscribe();
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(emailChannel);
    };
  }, []);

  // Ø­Ø§Ù„Ø§Øª ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø¯Ù…Ø¬ (WhatsApp Office)
  const [selectedWaChatId, setSelectedWaChatId] = useState<number>(1);
  const [waInputText, setWaInputText] = useState<string>("");
  const [waSearchTerm, setWaSearchTerm] = useState<string>("");
  const [showNewWaChatModal, setShowNewWaChatModal] = useState<boolean>(false);
  const [newWaName, setNewWaName] = useState<string>("");
  const [newWaPhone, setNewWaPhone] = useState<string>("");
  const [waChats, setWaChats] = useState<Array<{
    id: number;
    name: string;
    phone: string;
    role: string;
    avatarBg: string;
    unreadCount: number;
    messages: Array<{
      id: number;
      sender: "me" | "them";
      text: string;
      time: string;
      status?: "sent" | "delivered" | "read";
    }>;
  }>>(() => {
    const loaded = loadStorage<any[]>("firm_wa_chats", []);
    return loaded.filter(c => c.name !== "ÙÙˆØ²ÙŠØ© Ø£Ø­Ù…Ø¯ Ø§Ù„Ù…Ù‡ÙŠØ±ÙŠ" && c.name !== "Ø´Ø±ÙƒØ© Ø¯Ø§Ø± Ø³Ù…Ø±Ø§ Ù„Ù„ÙƒÙ…Ø¨ÙŠÙˆØªØ± (Ù…Ù…Ø«Ù„ Ø§Ù„Ø´Ø±ÙƒØ©)" && c.name !== "Ø£Ù…Ø§Ù†Ø© Ø³Ø± Ù…Ø­Ø§ÙƒÙ… Ø¯Ø¨ÙŠ - ÙƒØ§ØªØ¨ Ø§Ù„Ø¬Ù„Ø³Ø©");
  });

  useEffect(() => {
    saveStorage("firm_wa_chats", waChats);
  }, [waChats]);

  // Ù…Ø²Ø§Ù…Ù†Ø© Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨ Ù„Ø­Ø¸ÙŠØ§Ù‹ Ù…Ø¹ Ø¬Ø¯ÙˆÙ„ Supabase (whatsapp_messages) Ùˆ Edge Function
  const fetchSupabaseWhatsAppMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setWaChats(prev => {
          const updated = [...prev];
          data.forEach((row: any) => {
            const rowPhoneClean = row.phone_number?.replace(/[^\d]/g, "");
            const targetChat = updated.find(c => c.phone.replace(/[^\d]/g, "") === rowPhoneClean);
            if (targetChat) {
              const msgExists = targetChat.messages.some(m => m.text === row.message_body && m.sender === (row.sender === "me" ? "me" : "them"));
              if (!msgExists) {
                targetChat.messages.push({
                  id: row.id || Date.now() + Math.random(),
                  sender: row.sender === "me" ? "me" : "them",
                  text: row.message_body,
                  time: row.created_at ? new Date(row.created_at).toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }) : "Ø§Ù„Ø¢Ù†",
                  status: (row.status as any) || "sent"
                });
              }
            } else if (row.phone_number) {
              updated.push({
                id: Date.now() + Math.floor(Math.random() * 10000),
                name: row.contact_name || row.phone_number,
                phone: row.phone_number,
                role: "Ø¹Ù…ÙŠÙ„ Ø¹Ø¨Ø± Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨",
                avatarBg: "bg-teal-600 text-white",
                unreadCount: 0,
                messages: [{
                  id: row.id || Date.now(),
                  sender: row.sender === "me" ? "me" : "them",
                  text: row.message_body,
                  time: row.created_at ? new Date(row.created_at).toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }) : "Ø§Ù„Ø¢Ù†",
                  status: (row.status as any) || "sent"
                }]
              });
            }
          });
          return [...updated];
        });
      }
    } catch (err) {
      console.log("Supabase whatsapp_messages sync note:", err);
    }
  };

  useEffect(() => {
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„Ù…Ø³ØªØ­Ù‚Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹ Ù„Ø¥Ø±Ø³Ø§Ù„ ØªÙ†Ø¨ÙŠÙ‡ ÙˆØ§ØªØ³Ø§Ø¨
    const checkTasksForWhatsAppReminders = async () => {
      if (!isLoggedIn) return;
      const todayDate = todayISO();
      const lastCheck = localStorage.getItem("firm_last_task_reminder_check");
      if (lastCheck === todayDate) return;
      
      const upcomingTasks = tasks.filter(t => !t.done && daysUntil(t.due) <= 1 && daysUntil(t.due) >= -7);
      
      if (upcomingTasks.length > 0) {
        let allSuccess = true;
        for (const t of upcomingTasks) {
          const user = users.find(u => u.name === t.assignee);
          if (user && user.phone) {
            const message = `Ù…Ø±Ø­Ø¨Ø§Ù‹ ${user.name}ØŒ\nØªØ°ÙƒÙŠØ± Ø¨Ù…Ù‡Ù…Ø©: "${t.title}"\nØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚: ${t.due}\nÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø¹Ø¨Ø± Ù†Ø¸Ø§Ù… Ø§Ù„Ù…ÙƒØªØ¨.`;
            try {
              await sendWhatsAppViaEdgeFunction({
                to: user.phone.replace(/[^0-9]/g, ""),
                message: message,
                contact_name: user.name
              });
              
              // Ù…Ø­Ø§ÙˆÙ„Ø© Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠ Ø¹Ø¨Ø± Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£ÙŠØ¶Ø§Ù‹ Ø¥Ø°Ø§ ØªÙ… ØªÙƒÙˆÙŠÙ†Ù‡
              if (user.email && typeof supabase.functions !== "undefined") {
                 supabase.functions.invoke("send-email", {
                    body: {
                       to: user.email,
                       subject: `ØªØ°ÙƒÙŠØ± Ø¨Ù…Ù‡Ù…Ø© Ù…Ø³ØªØ­Ù‚Ø©: ${t.title}`,
                       html: `<p>Ù…Ø±Ø­Ø¨Ø§Ù‹ ${user.name}ØŒ</p><p>Ù†Ø°ÙƒØ±Ùƒ Ø¨Ø¶Ø±ÙˆØ±Ø© Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„Ù…Ù‡Ù…Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©:</p><p><strong>${t.title}</strong></p><p>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚: ${t.due}</p>`
                    }
                 }).catch(e => console.warn("Email reminder failed or not configured", e));
              }

            } catch (err) {
              console.error("Failed to send WhatsApp task reminder", err);
              allSuccess = false;
            }
          }
        }
        if (allSuccess) {
          localStorage.setItem("firm_last_task_reminder_check", todayDate);
        }
      } else {
        localStorage.setItem("firm_last_task_reminder_check", todayDate);
      }
    };
    
    checkTasksForWhatsAppReminders();
  }, [isLoggedIn, tasks, users]);

  useEffect(() => {
    fetchSupabaseWhatsAppMessages();

    // Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙÙŠ Ø§Ù„Ù‚Ù†Ø§Ø© Ø§Ù„Ù„Ø­Ø¸ÙŠØ© Supabase Realtime Channel
    const channel = supabase
      .channel("public:whatsapp_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "whatsapp_messages" },
        (payload) => {
          const newRow = payload.new;
          if (newRow && newRow.phone_number) {
            setWaChats(prev => {
              const rowPhoneClean = newRow.phone_number.replace(/[^\d]/g, "");
              const matchesChat = prev.find(chat => chat.phone.replace(/[^\d]/g, "") === rowPhoneClean);

              if (matchesChat) {
                return prev.map(chat => {
                  if (chat.phone.replace(/[^\d]/g, "") === rowPhoneClean) {
                    const alreadyHas = chat.messages.some(m => m.id === newRow.id || (m.text === newRow.message_body && m.sender === (newRow.sender === "me" ? "me" : "them")));
                    if (!alreadyHas) {
                      return {
                        ...chat,
                        unreadCount: newRow.sender !== "me" ? chat.unreadCount + 1 : chat.unreadCount,
                        messages: [
                          ...chat.messages,
                          {
                            id: newRow.id || Date.now(),
                            sender: newRow.sender === "me" ? "me" : "them",
                            text: newRow.message_body,
                            time: new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
                            status: (newRow.status as any) || "sent"
                          }
                        ]
                      };
                    }
                  }
                  return chat;
                });
              } else {
                return [
                  ...prev,
                  {
                    id: Date.now(),
                    name: newRow.contact_name || newRow.phone_number,
                    phone: newRow.phone_number,
                    role: "Ø¹Ù…ÙŠÙ„ Ø¹Ø¨Ø± Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨",
                    avatarBg: "bg-teal-600 text-white",
                    unreadCount: newRow.sender !== "me" ? 1 : 0,
                    messages: [{
                      id: newRow.id || Date.now(),
                      sender: newRow.sender === "me" ? "me" : "them",
                      text: newRow.message_body,
                      time: new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
                      status: (newRow.status as any) || "sent"
                    }]
                  }
                ];
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Ø¯Ø§Ù„Ø© Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø¹Ø¨Ø± Edge Function ÙˆØªØ®Ø²ÙŠÙ†Ù‡Ø§ ÙÙŠ Supabase
  const handleSendWaMessage = async (targetChatId: number) => {
    if (!waInputText.trim()) return;
    const textToSend = waInputText.trim();
    setWaInputText("");

    const activeChat = waChats.find(c => c.id === targetChatId);
    if (!activeChat) return;

    // 1. ØªØ­Ø¯ÙŠØ« ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙˆØ±ÙŠØ§Ù‹
    const newMsg = {
      id: Date.now(),
      sender: "me" as const,
      text: textToSend,
      time: "Ø§Ù„Ø¢Ù†",
      status: "sent" as const
    };
    setWaChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: [...c.messages, newMsg] } : c));

    // 2. Ø§Ø³ØªØ¯Ø¹Ø§Ø¡ Edge Function Ø§Ù„Ù…Ø³Ù…Ø§Ø© send-whatsapp-message
    sendWhatsAppViaEdgeFunction({
      to: activeChat.phone,
      message: textToSend,
      contact_name: activeChat.name
    });

    // 3. Ø­ÙØ¸ Ø§Ù„Ø³Ø¬Ù„ ÙÙŠ Ø¬Ø¯ÙˆÙ„ whatsapp_messages ÙÙŠ Supabase
    try {
      await supabase.from("whatsapp_messages").insert({
        phone_number: activeChat.phone,
        contact_name: activeChat.name,
        sender: "me",
        message_body: textToSend,
        status: "sent"
      });
    } catch (e) {
      console.log("Note on Supabase insert:", e);
    }
  };

  // Ø¯Ø§Ù„Ø© Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø­Ø§Ø¯Ø«Ø© Ø¬Ø¯ÙŠØ¯Ø© ÙˆØªÙØ¹ÙŠÙ„Ù‡Ø§ ÙÙˆØ±Ø§Ù‹
  const handleStartNewWaChat = async (name: string, phone: string, initialMsg?: string) => {
    if (!phone) return;
    const cleanPhone = phone.trim();
    const cleanName = name.trim() || cleanPhone;

    let targetId: number;
    const existing = waChats.find(c => c.phone.replace(/[^\d]/g, "") === cleanPhone.replace(/[^\d]/g, ""));
    
    if (existing) {
      targetId = existing.id;
    } else {
      targetId = Date.now();
      const newChatObj = {
        id: targetId,
        name: cleanName,
        phone: cleanPhone,
        role: "Ø¹Ù…ÙŠÙ„ - Ù…Ø­Ø§Ø¯Ø«Ø© Ø¬Ø¯ÙŠØ¯Ø©",
        avatarBg: "bg-emerald-600 text-white",
        unreadCount: 0,
        messages: []
      };
      setWaChats(prev => [newChatObj, ...prev]);
    }

    setSelectedWaChatId(targetId);

    if (initialMsg && initialMsg.trim()) {
      const msgText = initialMsg.trim();
      setWaChats(prev => prev.map(c => c.id === targetId ? {
        ...c,
        messages: [...c.messages, {
          id: Date.now(),
          sender: "me",
          text: msgText,
          time: "Ø§Ù„Ø¢Ù†",
          status: "sent"
        }]
      } : c));

      sendWhatsAppViaEdgeFunction({
        to: cleanPhone,
        message: msgText,
        contact_name: cleanName
      });

      try {
        await supabase.from("whatsapp_messages").insert({
          phone_number: cleanPhone,
          contact_name: cleanName,
          sender: "me",
          message_body: msgText,
          status: "sent"
        });
      } catch (e) {
        console.log("Note on insert:", e);
      }
    }
  };

  // Ø­Ø§Ù„Ø§Øª Ù…ÙˆØ¯Ø§Ù„ ØªØ®ØµÙŠØµ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø¹Ù†Ø¯ Ù‚Ø¨ÙˆÙ„ ÙˆØªÙØ¹ÙŠÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø¬Ø¯Ø¯
  const [approvingUser, setApprovingUser] = useState<UserItem | null>(null);
  const [assignRoleTitle, setAssignRoleTitle] = useState<string>("");
  const [assignRoleKey, setAssignRoleKey] = useState<"admin" | "lawyer" | "secretary" | "accountant">("lawyer");
  const [assignCanTransfer, setAssignCanTransfer] = useState<boolean>(false);
  const [assignCanAgreements, setAssignCanAgreements] = useState<boolean>(false);
  const [assignCanWhatsapp, setAssignCanWhatsapp] = useState<boolean>(false);
  const [assignCanFinances, setAssignCanFinances] = useState<boolean>(false);

  const pendingUsers = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      if (u.status === "Ù…Ø¹Ù„Ù‚" || u.status === "pending") {
        const key = u.supabaseId || u.email?.toLowerCase() || u.id;
        if (!map.has(key)) {
          map.set(key, u);
        }
      }
    });
    return Array.from(map.values()) as UserItem[];
  }, [users]);

  const openApproveUserModal = (userId: number) => {
    if (!checkPerm("manageUsers", "Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†")) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setApprovingUser(target);
    setAssignRoleTitle(target.roleTitle || "Ù…Ø­Ø§Ù…Ù ÙˆÙ…Ø³ØªØ´Ø§Ø± Ù‚Ø§Ù†ÙˆÙ†ÙŠ");
    setAssignRoleKey(target.roleKey || "lawyer");
    setAssignCanTransfer(target.canTransferContacts || false);
    setAssignCanAgreements(target.canViewAgreements || false);
    setAssignCanWhatsapp(target.canAccessWhatsapp || false);
    setAssignCanFinances(target.canViewFinances || false);
  };

  const confirmApproveUser = async () => {
    if (!approvingUser) return;
    const preset = ROLE_PRESETS[assignRoleKey];
    const targetUserId = approvingUser.supabaseId || approvingUser.id;

    console.log("Target User ID for approval:", targetUserId, "Email:", approvingUser.email);

    try {
      // Direct update in Supabase profiles by ID
      const { data, error } = await supabase
        .from("profiles")
        .update({
          status: "approved",
          role: assignRoleKey,
          role_title: assignRoleTitle || preset.title
        })
        .eq("id", targetUserId)
        .select();

      console.log("Update result by ID:", data, "Error:", error);

      let isSuccess = !error && data && data.length > 0;

      // Fallback update by email if ID update returned empty or error
      if (!isSuccess) {
        console.log("Attempting fallback update by email:", approvingUser.email);
        const { data: emailData, error: emailError } = await supabase
          .from("profiles")
          .update({
            status: "approved",
            role: assignRoleKey,
            role_title: assignRoleTitle || preset.title
          })
          .eq("email", approvingUser.email.toLowerCase())
          .select();

        console.log("Email Update result:", emailData, "Error:", emailError);

        if (!emailError && emailData && emailData.length > 0) {
          isSuccess = true;
        } else if (!error && !emailError) {
          // If update succeeded without RLS return
          isSuccess = true;
        } else {
          const finalErr = emailError || error;
          console.error("Database update failed:", finalErr);
          alert("Approval failed: " + (finalErr?.message || "Database update failed"));
          return;
        }
      }

      if (isSuccess) {
        // Update local state after DB confirmation
        setUsers((prev) =>
          prev.map((u) =>
            u.id === approvingUser.id
              ? {
                  ...u,
                  status: "approved",
                  roleKey: assignRoleKey,
                  roleTitle: assignRoleTitle || preset.title,
                  permissions: { ...preset.permissions },
                  canTransferContacts: assignCanTransfer,
                  canViewAgreements: assignCanAgreements,
                  canAccessWhatsapp: assignCanWhatsapp,
                  canViewFinances: assignCanFinances,
                }
              : u
          )
        );

        // Re-fetch users from database to ensure source of truth
        await fetchSupabaseProfiles();

        setPermissionNotice(`ØªÙ… Ø§Ù„Ù‚Ø¨ÙˆÙ„ ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„ØµØ±ÙŠØ­ Ù„Ø­Ø³Ø§Ø¨ "${approvingUser.name}" ÙˆØ¥Ø³Ù†Ø§Ø¯ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© Ø¨Ù†Ø¬Ø§Ø­!`);
        setApprovingUser(null);
      }
    } catch (e: any) {
      console.error("Database update failed with exception:", e);
      alert("Approval failed: " + (e?.message || "Error during approval process"));
    }
  };

  const approveUser = (userId: number) => {
    openApproveUserModal(userId);
  };

  const handleDeleteUser = async (userId: number) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (target.id === currentUserId) {
      alert("Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ Ø§Ù„Ù†Ø§Ø´Ø·");
      return;
    }

    requestDelete({
      section: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù†Ø¸Ø§Ù…",
      title: `Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…: ${target.name}`,
      details: `Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ: ${target.email} | Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ø­Ø§Ù„ÙŠ: ${target.roleTitle} (${target.roleKey}) | Ø§Ù„Ø­Ø§Ù„Ø©: ${target.status || "Ù†Ø´Ø·"}`,
      permKey: "deleteUsers",
      actionName: "Ø­Ø°Ù Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…",
      onConfirm: async () => {
        // Immediately remove from active state so row disappears
        logAuditAction("DELETE", "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª", `Ø­Ø³Ø§Ø¨: ${target.name}`, `Ø­Ø°Ù Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ${target.name} (${target.email}) Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„Ù…ÙƒØªØ¨`, target.id);
        setUsers((prev) => prev.filter((u) => u.id !== userId));

        const targetUserId = target.supabaseId || target.id;

        try {
          // 1. Direct deletion query on public.profiles
          const { error: deleteErr } = await supabase
            .from("profiles")
            .delete()
            .eq("id", targetUserId);

          if (deleteErr) {
            // Try direct deletion by email
            const { error: deleteEmailErr } = await supabase
              .from("profiles")
              .delete()
              .eq("email", target.email.toLowerCase());

            if (deleteEmailErr) {
              // 2. Fallback soft delete (status = 'rejected') if direct delete restricted by RLS or FK
              const { error: updateErr } = await supabase
                .from("profiles")
                .update({ status: "rejected" })
                .eq("id", targetUserId);

              if (updateErr) {
                await supabase
                  .from("profiles")
                  .update({ status: "rejected" })
                  .eq("email", target.email.toLowerCase());
              }
            }
          }
        } catch (e) {
          console.log("Error during profile deletion:", e);
          try {
            await supabase
              .from("profiles")
              .update({ status: "rejected" })
              .eq("email", target.email.toLowerCase());
          } catch (err) {
            console.log("Fallback soft delete failed:", err);
          }
        }

        setPermissionNotice(`ØªÙ… Ø­Ø°Ù ÙˆØ§Ø³ØªØ¨Ø¹Ø§Ø¯ Ø­Ø³Ø§Ø¨ "${target.name}" Ø¨Ù†Ø¬Ø§Ø­.`);
      },
    });
  };

  const rejectUser = async (userId: number) => {
    if (!checkPerm("manageUsers", "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†")) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    
    // Instantly remove from state
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    const targetUserId = target.supabaseId || target.id;
    try {
      const { error: deleteErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", targetUserId);

      if (deleteErr) {
        await supabase
          .from("profiles")
          .update({ status: "rejected" })
          .eq("id", targetUserId);
      }
    } catch (e) {
      await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("email", target.email.toLowerCase());
    }
    setPermissionNotice(`ØªÙ… Ø±ÙØ¶ ÙˆØ§Ø³ØªØ¨Ø¹Ø§Ø¯ Ø­Ø³Ø§Ø¨ "${target.name}".`);
  };

  const clientName = (id: number) => clients.find((c) => c.id === id)?.name || "â€”";
  const caseNo = (id: number) => cases.find((c) => c.id === id)?.number || "â€”";
  const nextId = <T extends { id: number }>(arr: T[]) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);

  // ---------- Ù†Ø¸Ø§Ù… Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ø·Ø¹ÙˆÙ† (7 Ø£ÙŠØ§Ù… Ùˆ 3 Ø£ÙŠØ§Ù…) ----------
  const runAutoAppealDeadlineChecker = async (deadlinesList: JudgmentDeadline[], forceManual = false) => {
    setAutoCheckStatus(prev => ({ ...prev, isChecking: true }));
    let updatedList = [...deadlinesList];
    let newLogs: NotificationLog[] = [];
    let sentCount7Days = 0;
    let sentCount3Days = 0;
    let overdueCount = 0;

    const timestampNow = new Date().toLocaleString("ar-AE", {
      dateStyle: "short",
      timeStyle: "short"
    });

    for (let i = 0; i < updatedList.length; i++) {
      const item = { ...updatedList[i] };
      if (item.status === "ØªÙ… Ù‚ÙŠØ¯ Ø§Ù„Ø·Ø¹Ù†" || item.status === "ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ø¹Ù†") {
        continue;
      }

      const daysLeft = daysUntil(item.appealDeadlineDate);
      const cs = cases.find((c) => c.id === item.caseId);
      const caseNum = cs ? cs.number : `Ù‚Ø¶ÙŠØ© Ø±Ù‚Ù… #${item.caseId}`;
      const client = cs ? clients.find((cli) => cli.id === cs.clientId) : null;
      const clientNm = client ? client.name : "Ø§Ù„Ù…ÙˆÙƒÙ„";

      const lawyerName = item.assignedLawyerName || cs?.judge || "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„";
      const lawyerEmail = item.assignedLawyerEmail || emailConfig.email || "info@lawyersuood.com";
      const lawyerPhone = item.assignedLawyerPhone || "0501234567";

      // 1. Check 3-Day Critical Threshold
      if (daysLeft <= 3 && daysLeft >= 0) {
        if (!item.alert3DaysSent || forceManual) {
          const subject = `ðŸš¨ [ØªÙ†Ø¨ÙŠÙ‡ Ø­Ø±Ø¬ Ø¬Ø¯Ø§Ù‹ - Ù…ØªØ¨Ù‚ÙŠ 3 Ø£ÙŠØ§Ù…] Ù…Ù‡Ù„Ø© Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ø·Ø¹Ù† Ø¨Ø§Ù„Ù‚Ø¶ÙŠØ© (${caseNum})`;
          const emailContent = `Ø³Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ / ${lawyerName} Ø§Ù„Ù…Ø­ØªØ±Ù…ØŒ\n\nØªØ­ÙŠØ© Ø·ÙŠØ¨Ø© ÙˆØ¨Ø¹Ø¯ØŒ\n\nÙ†ÙˆØ¯ Ù„ÙØª Ø¹Ù†Ø§ÙŠØªÙƒÙ… Ø§Ù„Ø¹Ø§Ø¬Ù„Ø© ÙˆØ§Ù„Ø´Ø¯ÙŠØ¯Ø© Ø¨Ø£Ù†Ù‡ Ù…ØªØ¨Ù‚ÙŠ (${daysLeft}) Ø£ÙŠØ§Ù… ÙÙ‚Ø· Ø¹Ù„Ù‰ Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ù…Ù‡Ù„Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø§Ù„Ù…Ù‚Ø±Ø±Ø© Ù„Ù„Ø·Ø¹Ù†/Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù ÙÙŠ Ø§Ù„Ø­ÙƒÙ… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠ Ø§Ù„ØµØ§Ø¯Ø± Ø¨Ø§Ù„Ù‚Ø¶ÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ©:\n\nâ€¢ Ø±Ù‚Ù… Ø§Ù„Ù‚Ø¶ÙŠØ©: ${caseNum}\nâ€¢ Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙƒÙ„: ${clientNm}\nâ€¢ Ø§Ù„Ù…Ø­ÙƒÙ…Ø©: ${cs ? cs.court : "â€”"}\nâ€¢ Ù†ÙˆØ¹ Ø§Ù„Ø­ÙƒÙ…: ${item.rulingType}\nâ€¢ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø­ÙƒÙ…: ${fmtDate(item.rulingDate)}\nâ€¢ Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ Ù‚Ø§Ø·Ø¹ Ù„Ù„Ø·Ø¹Ù†: ${fmtDate(item.appealDeadlineDate)}\nâ€¢ Ù…Ù†Ø·ÙˆÙ‚ Ø§Ù„Ø­ÙƒÙ…: ${item.rulingSummary}\n\nÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø¨Ø§Ø¯Ø±Ø© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø¥Ø¹Ø¯Ø§Ø¯ ÙˆÙ‚ÙŠØ¯ ØµØ­ÙŠÙØ© Ø§Ù„Ø·Ø¹Ù† Ù‚Ø¨Ù„ Ø³Ù‚ÙˆØ· Ø§Ù„Ø­Ù‚ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ù„Ù„Ù…ÙˆÙƒÙ„ ÙˆØªØ£ÙƒÙŠØ¯ Ù‚ÙŠØ¯ Ø§Ù„Ø·Ø¹Ù† Ø¨Ø§Ù„Ù†Ø¸Ø§Ù….\n\nÙ†Ø¸Ø§Ù… Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ Ø§Ù„Ù…ÙˆØ­Ø¯\nÙ…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©`;

          try {
            fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: lawyerEmail,
                subject,
                body: emailContent,
                smtp: {
                  email: emailConfig.email,
                  senderName: emailConfig.senderName,
                  password: emailConfig.appPassword,
                  host: emailConfig.smtpHost,
                  port: emailConfig.smtpPort,
                  protocol: emailConfig.protocol,
                  rejectUnauthorized: emailConfig.rejectUnauthorized
                }
              })
            }).catch(console.error);
          } catch (e) {
            console.warn("SMTP Auto Dispatch Error:", e);
          }

          newLogs.push({
            id: Date.now() + Math.random(),
            recipientName: lawyerName,
            recipientPhone: lawyerPhone,
            recipientEmail: lawyerEmail,
            channel: item.preferredChannel === "whatsapp" ? "ÙˆØ§ØªØ³Ø§Ø¨" : item.preferredChannel === "both" ? "ÙƒÙ„Ø§Ù‡Ù…Ø§" : "Ø¥ÙŠÙ…ÙŠÙ„",
            type: "ØªÙ†Ø¨ÙŠÙ‡ Ù…ÙŠØ¹Ø§Ø¯ Ø·Ø¹Ù† / Ø§Ø³ØªØ¦Ù†Ø§Ù",
            message: emailContent,
            sentAt: timestampNow,
            status: "ØªÙ… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„",
            relatedRef: `Ø·ÙˆØ§Ø±Ø¦ Ø§Ù„Ø·Ø¹ÙˆÙ† - Ù‚Ø¶ÙŠØ© ${caseNum}`
          });

          const logEntry: JudgmentDeadlineLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: timestampNow,
            type: "3_days",
            channel: item.preferredChannel || "both",
            lawyerName,
            recipientContact: lawyerEmail,
            status: "sent",
            messageSnippet: `ðŸš¨ ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªÙ†Ø¨ÙŠÙ‡ Ø­Ø±Ø¬ Ù‚Ø¨Ù„ 3 Ø£ÙŠØ§Ù… Ù…Ù† Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ù…Ù‡Ù„Ø© (Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯: ${fmtDate(item.appealDeadlineDate)})`
          };

          item.alert3DaysSent = true;
          item.alert3DaysSentAt = timestampNow;
          item.autoAlertLogs = [logEntry, ...(item.autoAlertLogs || [])];
          sentCount3Days++;
        }
      } 
      // 2. Check 7-Day Early Threshold
      else if (daysLeft <= 7 && daysLeft > 3) {
        if (!item.alert7DaysSent || forceManual) {
          const subject = `âš ï¸ [ØªÙ†Ø¨ÙŠÙ‡ Ø§Ø³ØªØ¨Ø§Ù‚ÙŠ - Ù…ØªØ¨Ù‚ÙŠ 7 Ø£ÙŠØ§Ù…] Ù…ÙŠØ¹Ø§Ø¯ Ø§Ù„Ø·Ø¹Ù† Ø¨Ø§Ù„Ù‚Ø¶ÙŠØ© (${caseNum})`;
          const emailContent = `Ø³Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ / ${lawyerName} Ø§Ù„Ù…Ø­ØªØ±Ù…ØŒ\n\nØªØ­ÙŠØ© Ø·ÙŠØ¨Ø© ÙˆØ¨Ø¹Ø¯ØŒ\n\nÙ†ÙˆØ¯ ØªØ°ÙƒÙŠØ±ÙƒÙ… Ø¨Ù…ÙˆØ¹Ø¯ Ù‚Ø±Ø¨ Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ù…Ù‡Ù„Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù„Ù„Ø·Ø¹Ù†/Ø§Ù„Ø§Ø³ØªØ¦Ù†Ø§Ù ÙÙŠ Ø§Ù„Ø­ÙƒÙ… Ø§Ù„ØµØ§Ø¯Ø± ÙÙŠ Ø§Ù„Ù‚Ø¶ÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ© (Ù…ØªØ¨Ù‚ÙŠ 7 Ø£ÙŠØ§Ù…):\n\nâ€¢ Ø±Ù‚Ù… Ø§Ù„Ù‚Ø¶ÙŠØ©: ${caseNum}\nâ€¢ Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙƒÙ„: ${clientNm}\nâ€¢ Ø§Ù„Ù…Ø­ÙƒÙ…Ø©: ${cs ? cs.court : "â€”"}\nâ€¢ Ù†ÙˆØ¹ Ø§Ù„Ø­ÙƒÙ…: ${item.rulingType}\nâ€¢ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø­ÙƒÙ…: ${fmtDate(item.rulingDate)}\nâ€¢ Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ Ù„Ù„Ø·Ø¹Ù†: ${fmtDate(item.appealDeadlineDate)}\nâ€¢ Ù…Ù†Ø·ÙˆÙ‚ Ø§Ù„Ø­ÙƒÙ…: ${item.rulingSummary}\n\nÙ†Ø±Ø¬Ùˆ Ù…Ø±Ø§Ø¬Ø¹Ø© Ù…Ù„Ù Ø§Ù„Ù‚Ø¶ÙŠØ© ÙˆØªØ¬Ù‡ÙŠØ² Ù„Ø§Ø¦Ø­Ø© Ø§Ù„Ø·Ø¹Ù† ÙˆØ§Ù„ØªÙ†Ø³ÙŠÙ‚ Ù…Ø¹ Ø§Ù„Ù…ÙˆÙƒÙ„.\n\nÙ†Ø¸Ø§Ù… Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ Ø§Ù„Ù…ÙˆØ­Ø¯\nÙ…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©`;

          try {
            fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: lawyerEmail,
                subject,
                body: emailContent,
                smtp: {
                  email: emailConfig.email,
                  senderName: emailConfig.senderName,
                  password: emailConfig.appPassword,
                  host: emailConfig.smtpHost,
                  port: emailConfig.smtpPort,
                  protocol: emailConfig.protocol,
                  rejectUnauthorized: emailConfig.rejectUnauthorized
                }
              })
            }).catch(console.error);
          } catch (e) {
            console.warn("SMTP Auto Dispatch Error:", e);
          }

          newLogs.push({
            id: Date.now() + Math.random(),
            recipientName: lawyerName,
            recipientPhone: lawyerPhone,
            recipientEmail: lawyerEmail,
            channel: item.preferredChannel === "whatsapp" ? "ÙˆØ§ØªØ³Ø§Ø¨" : item.preferredChannel === "both" ? "ÙƒÙ„Ø§Ù‡Ù…Ø§" : "Ø¥ÙŠÙ…ÙŠÙ„",
            type: "ØªÙ†Ø¨ÙŠÙ‡ Ù…ÙŠØ¹Ø§Ø¯ Ø·Ø¹Ù† / Ø§Ø³ØªØ¦Ù†Ø§Ù",
            message: emailContent,
            sentAt: timestampNow,
            status: "ØªÙ… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„",
            relatedRef: `ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„Ø·Ø¹ÙˆÙ† (7 Ø£ÙŠØ§Ù…) - Ù‚Ø¶ÙŠØ© ${caseNum}`
          });

          const logEntry: JudgmentDeadlineLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: timestampNow,
            type: "7_days",
            channel: item.preferredChannel || "both",
            lawyerName,
            recipientContact: lawyerEmail,
            status: "sent",
            messageSnippet: `âš ï¸ ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªÙ†Ø¨ÙŠÙ‡ Ø§Ø³ØªØ¨Ø§Ù‚ÙŠ Ù‚Ø¨Ù„ 7 Ø£ÙŠØ§Ù… Ù…Ù† Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ù…Ù‡Ù„Ø© (Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯: ${fmtDate(item.appealDeadlineDate)})`
          };

          item.alert7DaysSent = true;
          item.alert7DaysSentAt = timestampNow;
          item.autoAlertLogs = [logEntry, ...(item.autoAlertLogs || [])];
          sentCount7Days++;
        }
      }

      if (daysLeft < 0 && item.status === "Ø¬Ø§Ø±Ù Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯") {
        item.status = "Ø§Ù†Ù‚Ø¶Ù‰ Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ";
        overdueCount++;
      }

      updatedList[i] = item;
    }

    setDeadlines(updatedList);
    if (newLogs.length > 0) {
      setNotifications(prev => [...newLogs, ...prev]);
    }

    const statusMsg = `ØªÙ… ÙØ­Øµ ${updatedList.length} Ø·Ø¹Ù†: ØªÙ… Ø¥Ø±Ø³Ø§Ù„ (${sentCount3Days}) ØªÙ†Ø¨ÙŠÙ‡ Ø­Ø±Ø¬ (3 Ø£ÙŠØ§Ù…) Ùˆ (${sentCount7Days}) ØªÙ†Ø¨ÙŠÙ‡ Ø§Ø³ØªØ¨Ø§Ù‚ÙŠ (7 Ø£ÙŠØ§Ù…).`;
    setAutoCheckStatus({
      lastCheckedAt: timestampNow,
      message: statusMsg,
      isChecking: false
    });

    return { sentCount7Days, sentCount3Days, overdueCount, totalProcessed: updatedList.length };
  };

  useEffect(() => {
    if (deadlines && deadlines.length > 0) {
      runAutoAppealDeadlineChecker(deadlines);
    }
  }, []);

  const handleSendWhatsAppDeadlineAlert = (d: JudgmentDeadline) => {
    const cs = cases.find((c) => c.id === d.caseId);
    const daysLeft = daysUntil(d.appealDeadlineDate);
    const lawyerName = d.assignedLawyerName || "Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„";
    const lawyerPhone = d.assignedLawyerPhone || "0501234567";

    const msg = `Ø³Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§Ù…ÙŠ / ${lawyerName} Ø§Ù„Ù…Ø­ØªØ±Ù…\nØªØ­ÙŠØ© Ø·ÙŠØ¨Ø© ÙˆØ¨Ø¹Ø¯ØŒ\n\nðŸš¨ ØªÙ†Ø¨ÙŠÙ‡ Ø§Ø³ØªØ¨Ø§Ù‚ÙŠ Ø¹Ø§Ø¬Ù„ - Ø³Ø¬Ù„ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ø·Ø¹ÙˆÙ†:\nâ€¢ Ø§Ù„Ù‚Ø¶ÙŠØ©: ${cs ? cs.number : "â€”"}\nâ€¢ Ø§Ù„Ù…ÙˆÙƒÙ„: ${cs ? clientName(cs.clientId) : "â€”"}\nâ€¢ Ø§Ù„Ù…Ø­ÙƒÙ…Ø©: ${cs ? cs.court : "â€”"}\nâ€¢ Ù†ÙˆØ¹ Ø§Ù„Ø­ÙƒÙ…: ${d.rulingType}\nâ€¢ Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ Ù‚Ø§Ø·Ø¹ Ù„Ù„Ø·Ø¹Ù†: ${fmtDate(d.appealDeadlineDate)} (Ù…ØªØ¨Ù‚ÙŠ ${daysLeft} Ø£ÙŠØ§Ù…)\nâ€¢ Ù…Ù†Ø·ÙˆÙ‚ Ø§Ù„Ø­ÙƒÙ…: ${d.rulingSummary}\n\nÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø¨Ø§Ø¯Ø±Ø© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø¥Ø¹Ø¯Ø§Ø¯ ÙˆÙ‚ÙŠØ¯ ØµØ­ÙŠÙØ© Ø§Ù„Ø·Ø¹Ù† Ø¨Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ù‚Ø¨Ù„ Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ù…Ù‡Ù„Ø© ÙˆØ³Ù‚ÙˆØ· Ø§Ù„Ø­Ù‚ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ.\nÙ…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©`;

    sendWhatsAppMsg(lawyerPhone, msg);

    const timestampNow = new Date().toLocaleString("ar-AE", { dateStyle: "short", timeStyle: "short" });
    const logEntry: JudgmentDeadlineLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timestampNow,
      type: "manual",
      channel: "whatsapp",
      lawyerName,
      recipientContact: lawyerPhone,
      status: "sent",
      messageSnippet: `ðŸ“± ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªÙ†Ø¨ÙŠÙ‡ ÙˆØ§ØªØ³Ø§Ø¨ Ù…Ø¨Ø§Ø´Ø± Ù„Ù„Ù…Ø­Ø§Ù…ÙŠ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ (Ù…ØªØ¨Ù‚ÙŠ ${daysLeft} Ø£ÙŠØ§Ù…)`
    };

    setDeadlines(prev => prev.map(x => x.id === d.id ? {
      ...x,
      autoAlertLogs: [logEntry, ...(x.autoAlertLogs || [])]
    } : x));
  };

  // ---------- ÙØªØ­ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ÙˆØ¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨ ÙˆØ§Ù„Ø¨Ø±ÙŠØ¯ ----------
  const openNotificationComposer = (
    type: "ØªÙ†Ø¨ÙŠÙ‡ Ø¬Ù„Ø³Ø©" | "ØªØ­Ø¯ÙŠØ« Ù‚Ø¶ÙŠØ©" | "ØªØ°ÙƒÙŠØ± ÙØ§ØªÙˆØ±Ø©" | "ØªØ¬Ø¯ÙŠØ¯ ÙˆØ«Ø§Ø¦Ù‚ / KYC" | "ØªØ¬Ø¯ÙŠØ¯ ÙˆÙƒØ§Ù„Ø© / POA" | "ØªÙ†Ø¨ÙŠÙ‡ Ù…ÙŠØ¹Ø§Ø¯ Ø·Ø¹Ù† / Ø§Ø³ØªØ¦Ù†Ø§Ù" | "ØªØ°ÙƒÙŠØ± Ù‚Ø³Ø· ÙØ§ØªÙˆØ±Ø©" | "Ø±Ø³Ø§Ù„Ø© Ø¹Ø§Ù…Ø©",
    data?: any
  ) => {
    let name = "";
    let phone = "";
    let email = "";
    let subject = "";
    let message = "";
    let relatedRef = "";

    if (type === "ØªÙ†Ø¨ÙŠÙ‡ Ø¬Ù„Ø³Ø©" && data) {
      const h: Hearing = data;
      const c = cases.find((cs) => cs.id === h.caseId);
      const cl = c ? clients.find((cli) => cli.id === c.clientId) : null;
      name = cl ? cl.name : "Ø§Ù„Ù…ÙˆÙƒÙ„";
      phone = cl ? cl.phone : "";
      email = cl ? cl.email : "";
      relatedRef = c ? c.fileNo : "";
      subject = `ØªØ°ÙƒÙŠØ± Ø¨Ø¬Ù„Ø³Ø©: ${c ? c.title : ""}`;
      message = `Ø§Ù„Ù…ÙˆÙƒÙ„ Ø§Ù„ÙØ§Ø¶Ù„ / ${name}\nÙ†ÙˆØ¯ ØªØ°ÙƒÙŠØ±ÙƒÙ… Ø¨Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø¬Ù„Ø³Ø© Ø§Ù„Ù…Ù‚Ø±Ø± Ø¨ØªØ§Ø±ÙŠØ® ${fmtDate(h.date)} Ø§Ù„Ø³Ø§Ø¹Ø© ${h.time} ÙÙŠ Ø§Ù„Ø¬Ù„Ø³Ø© Ø§Ù„Ù…Ø®ØµØµØ©.\nÙ…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø©`;
    } else {
      name = clients[0]?.name || "";
      phone = clients[0]?.phone || "";
      email = clients[0]?.email || "";
      subject = "Ø±Ø³Ø§Ù„Ø© Ø¥Ø´Ø¹Ø§Ø± Ø±Ø³Ù…ÙŠØ© Ù…Ù† Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ø­Ø§Ù…Ø§Ø©";
      message = `Ø§Ù„Ù…ÙˆÙƒÙ„ Ø§Ù„ÙØ§Ø¶Ù„ØŒ\nØªØ­ÙŠØ© Ø·ÙŠØ¨Ø© ÙˆØ¨Ø¹Ø¯ØŒ\nÙ…Ø±ÙÙ‚ Ù„ÙƒÙ… Ø¥Ø´Ø¹Ø§Ø± Ø±Ø³Ù…ÙŠ Ù…Ù† Ù…ÙƒØªØ¨ Ø³Ø¹ÙˆØ¯ Ø£Ø­Ù…Ø¯ Ø§Ù„Ø´Ø­ÙŠ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø© ÙˆØ§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©.`;
    }

    setNotifyModal({
      recipientName: name,
      recipientPhone: phone,
      recipientEmail: email,
      channel: "ÙˆØ§ØªØ³Ø§Ø¨",
      type,
      subject,
      message,
      relatedRef,
    });
  };

  const dispatchNotification = () => {
    if (!notifyModal) return;
    const { recipientName, recipientPhone, recipientEmail, channel, type, subject, message, relatedRef } = notifyModal;

    if (channel === "ÙˆØ§ØªØ³Ø§Ø¨" || channel === "ÙƒÙ„Ø§Ù‡Ù…Ø§") {
      sendWhatsAppMsg(recipientPhone, message);
    }
    if (channel === "Ø¥ÙŠÙ…ÙŠÙ„" || channel === "ÙƒÙ„Ø§Ù‡Ù…Ø§") {
      sendEmailMsg(recipientEmail, subject, message);
    }

    const newLog: NotificationLog = {
      id: nextId(notifications),
      recipientName: recipientName || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
      recipientPhone: recipientPhone || "â€”",
      recipientEmail: recipientEmail || "â€”",
      channel,
      type,
      message,
      sentAt: new Date().toLocaleDateString("ar-AE") + " " + new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
      status: "ØªÙ… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„",
      relatedRef,
    };

    setNotifications([newLog, ...notifications]);
    setNotifyModal(null);
  };

  // ---------- Ø¥Ø­ØµØ§Ø¡Ø§Øª ÙˆÙ…Ø®Ø·Ø·Ø§Øª ØªÙØ§Ø¹Ù„ÙŠØ© ----------
  const stats = useMemo(() => {
    const active = cases.filter((c) => !["Ù…ØºÙ„Ù‚Ø©", "ØµØ¯Ø± Ø§Ù„Ø­ÙƒÙ…"].includes(c.status)).length;
    const weekHearings = hearings.filter((h) => !h.done && daysUntil(h.date) >= 0 && daysUntil(h.date) <= 7).length;
    const dueAmount = invoices.filter((i) => ["Ù…Ø±Ø³Ù„Ø©", "Ù…ØªØ£Ø®Ø±Ø©"].includes(i.status)).reduce((s, i) => s + i.amount * (1 + VAT_RATE), 0);
    const expiringPoa = poas.filter((p) => daysUntil(p.expiry) <= 60 && daysUntil(p.expiry) >= 0).length;
    return { active, weekHearings, dueAmount, expiringPoa };
  }, [cases, hearings, invoices, poas]);

  const CASE_TYPE_PALETTE: Record<string, string> = {
    "Ù…Ø¯Ù†ÙŠ": "#d97706",
    "ØªØ¬Ø§Ø±ÙŠ": "#2563eb",
    "Ø¹Ù…Ø§Ù„ÙŠ": "#059669",
    "Ø¬Ø²Ø§Ø¦ÙŠ": "#dc2626",
    "Ø£Ø­ÙˆØ§Ù„ Ø´Ø®ØµÙŠØ©": "#7c3aed",
    "Ø¹Ù‚Ø§Ø±ÙŠ": "#0891b2",
    "Ø¥ÙŠØ¬Ø§Ø±ÙŠ": "#b45309",
    "Ø¥Ø¯Ø§Ø±ÙŠ": "#475569",
    "ØªÙ†ÙÙŠØ°": "#4f46e5",
    "ØªØ­ÙƒÙŠÙ…": "#be185d",
  };

  const casesByType = useMemo(() => {
    const m: Record<string, number> = {};
    cases.forEach((c) => {
      const typeName = c.type || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
      m[typeName] = (m[typeName] || 0) + 1;
    });
    const total = cases.length || 1;
    const palette = ["#d97706", "#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#b45309", "#475569", "#4f46e5", "#be185d"];
    
    const allItems = Object.entries(m)
      .map(([name, value], idx) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
        color: CASE_TYPE_PALETTE[name] || palette[idx % palette.length]
      }))
      .sort((a, b) => b.value - a.value);

    // Group small slices into 'Ø£Ø®Ø±Ù‰' (Others) to prevent chart clutter
    if (allItems.length > 7) {
      const top = allItems.slice(0, 6);
      const rest = allItems.slice(6);
      const restValue = rest.reduce((sum, item) => sum + item.value, 0);
      top.push({
        name: "Ø£Ø®Ø±Ù‰",
        value: restValue,
      xœì½ksÇ‘(úÝ¿¢9–í ‚!A$!‹¶Dr	J»0‚lÌ4€g¦GÝ=`K‰¸òÞ8q"NÄ¸q?\™-Š¦dI¦¾Þ?|Ý?pÿÂÍÌzWW? %ùÄb×âtw=²²²²²òUž7âN0Hýõ í½å§Í8ºõz$é;~oxS^¥~¯áýÒ›nµ?ñø_'êEqÛ«ýôÜ)võlØmœç¿â Å¨>dov¢½õ{½kiÐOðÓî„·Üñ“ Yº?Á–Iê…ƒûQØ	Þ
Ò8ì$Þ¼7Jà¡Õëoþ¢·C­õ‚”Áw•îB¹Öyùiè‡Ý…>)5ß'0æ«£Àõ)ºÄ]÷§nì¯¥öl_¾åÛÞ­ ÅÝ	@=XŸð£þj_„ò;^í`oÿùÁƒƒGû/÷?«µ½Ö½z±ÿÕÁCýÅÓýOö¿€×Ú«¯ ÒsöÂÛÕ;öûßoÏÔ5Ÿš¤¹Å‹~g£^µ9 Ý÷{ÐyØd ýÔ§½“Þ;·ïÜZ¸½(ÉÄœ¾“óXO|×¼º@írØLR?%+Þ‰y †A7XA·!»õ<GYhpú¼, Ñe–ÐºÜÕºe¼yèÐÄaC§-³… —îêß‹ «ÖWÓÓ°è´jb61ëµw|’a÷zA'£Á-?`>ÍéºTqÉàZ¦ÌÂ‚…xm{í #I2ôËþ%úåÃ²©¸öÓÖÜ¹Ó§ÏÕ&´Š¦áóÌÙS3ÆgÂk?ívfNÏœ6
(z—œ}Þ5ð’Œú}?Þ¾¼-ùÁÕwQM˜Ø8’º¤´F³ïëõåß&Ï£`…VK]Œ‹¾ðßôÝàÅôFò]¢ð¶"t¬»âýá°\e	âË«ê»5Ï`ýe“z_ß
\óÉI§áÆÑ7Š:‡Çx`X6ð¥–¸ÂMã(È‘Ü®ÖÓôÔí¢Ðôt£ O|3Üq±B	Š\PâÁ<ÄKƒˆ—Ú"×0 -hÙ¤IÎ™×Wô·æ†xkÄb¥°M]|tíëK¬éœ}#Æ”š”V7¼”ÑÙÍk‹w®ÜxóÆ­%èhY19hl@ÑÁŠÖFê'÷’b1„D¼ ‹Ä
!&£ëAŽ !…•Y{i×ë)µ•6»Ñ h8jƒA˜¡`¿Þ¤jK/Æi §ù¬}ïç?÷ºþvòö {uxÜÅ» kÄÑ/|»AáC´ˆ;Ž³Ípp3ŽÖAÀDdÒ*êû[u6Ä 'å8&% ­=É±.Â-)–mA:‚ã0ŠÃ”Ñyv/ÚaÕÛ\¨:ïá°Å“·klR°9=>xxð1í!²"ŒÕ)ÊØ`»ùjÿÛJ…>ÜÿâàÁþ7ù…ŠÏ˜ÑRCDCéÀôrÚ/Vt™*¿T“áÝ”°°aNÈEU‰nôš».éƒI/W6ü8½ê§>®a^|‡ö„6¡å#@øžGøù|ÿKÀÎ„ØF%L¨ãŠd™p\
R“#¡ ï¿ÀÉ÷öŸì‘¸ò\Á¤è_jfîôl°Z(mUƒ
Å|ž¼pu<:ØS0‰e¦AÔ=wæLëtEˆ$Ÿ¨’Ã$|Õë0¾\Á4
@Xü+„£'®ü·Évoh°áf	.ê“ä.æ]-zuBVÙ¶—‚^-½ÚþKøô~i5±ŒÑ6çåÍŠU9‘7bƒwU³QeœQ[óÆ]Ø~ÎÈ]MW»ÆŠ«Ž]«2ÞØŠùc/h?wìÙ¦Í±¯È©J <VÊÎ´[‚©I«‘b‡fƒ¶„jn²3{•š(í\"œšò&åŸwð!`ýñþ_÷?'Ž¸ÿ)`á1àâ3È_<ƒ‡¿k5¤<¸[jÎ§Aú:üXa"á€\°Ä°}ñb}‡©Ä¸ˆØyÆßûç0Ý¸²tîAýú½pÐm{¢p»þoƒíKmï^°­y·¢^pÞ…IHI´}œvqV…°l‹Š·6G6ƒl³åÀèÁDpÐ»]Mþ]#xì` ˆäÃYð>Xïw¾ðÆí·Þ¼6ŽÒÅ^Ð‡Þ<|µàÃ|w;ØJâÀço/R«.L‚ûü è5›M|„¹¼·Òö‚fêÇëAÊ™¶8I1@”n/¸tGÃ^Øù¸‚JÅ·üÁˆÄò¬À¾ÀTâtJ*H—ØÞü	í]«é:UQHä/YyñÚ¿ÄÅ°wÕkkaÜ¿C•`S3Ë±¾b8YÜº$ÀIQÁ )À¨„û˜\¨~/ˆÓú]`q{ wz¼ÿÌÊ~¶ÿ5úSx÷w0±à}Zï?ö¸ìòlÑ/Øšø®‹Ï¼×vôw=àžŸ<ôDñlAÐ³ÿœý|Ævöð?>lCæ`v=ì›ä& ¨çÔ+‰OAÎØ¼+5†½h}aÔÓ:ÆÖkWß\¼½ˆÇ7sôFMÿ<%AFƒ/Ïöÿ
ã·¥àQXP(¼;Aâñ¦n³QN8¢O3˜ýŠä¯=>¾ýçï3¹ì)2$úßñTöPNƒŸ ú$ð^½:9$Ÿ5$w­Ž$Š¤k­$-£Ôúþ ˆø
§ÞšÎ1y×5‹ÑPÈ-›ü¤ô‡?xì¹ÓaÙ_ëªòÚ"@‰ë#Ðè—ßO½^§6€©Õµ&Õl…IÊÎÉl1¯?«wpH9-uD3t^å7ô¢E×’úÈáãƒÚj–4šXg?ŸÀœV$ ÀØWÌÐûH{l•=<x0EÔùä€GÿŽÓ«q·ÁZ- _â4< Âøék;ÐfØÝmD@'ŸCC¼è3¤1’O<­êûÃý—:a™Äª-:}^ÙYMŸ±`ñz™ä Xûµ®ÁÕÖw•Øipò¨"E‘àÚÒ:¯až×eö€;ÇcÀËSÀÚãý?ý7ë‘æ[VÄ'¬I§¨CkLÔ1Y8î8H5†¿,·£/„-[\Ø[Úž6qÈã·½“ÝO 6† £¡
#ƒ=„ÿùoÿVXº=øWü‰_®,,-Þ¹ý¯7—–[+xPÅ¢úMen¼}ë6ûþî¨».š ßÔzm‚á´Íþ™à˜jóáyDzZ^‘?‰ªbÖÚò×„·b€ð“i£½ ÆTŽÞó'ÖŠ·»ÒÐ'W'ˆk·ÿ hÃ2'¥ü=Ìèí…¥ßÞ¹½øÖÍ7n/.±Už2ZØ¥•œmM7)¥™.hîo£°¨Iê#³ÿuFqL³§¨œÊž×ÊÉõ@¡nŠ÷ÕdêÔt§†n›ƒ$"Û?yrÂø˜†iO¾Múa~ëùé”h|öAf\àüðÖßN‚¸©ëÓÙ_Oà~·{ÕßN^£~]ÍnÚDåÞµ5@QÃ¬%¤o„Mü¶Ú%ÕÔš[¤ö~·a /Ôâ‚…+ª 2-ïÚlHJ°ƒQ¯—‘`iƒ£•Wm‹£¢™MD‘ƒlr€ÕŒ¤Í#ÎÁV¢˜ã”ìmc‚/e[NPÃíôIa÷zÄ?âO±@‡åøž~‹Aß{r9Âoõ!o¥›„=Š eàáOj1Ÿ¯8	o~ÌöçòYàeÙ4ÀîÊØµGÛêWE²[JÖèÒJ·¦E´Nó²Á¬‰¯afÄ*;©õ0áuÖºl©„rñ'!¨u®Ýj¹Ùù‹·®]ÿµÆÑã(êóBøSÌÐ J|ú->hËkœyÀ•Uih	fÂG(¾æÏ ±©Ê{E|+´Mï‚×©vòõÙ½dL…‡ºø^oBcwŒPù#¢+ÃÿÏc³7²¤	µ±•Ä¥¡t_‡nè«4¼¬˜Š¯Iæy¢þcåEá‚àB‡ZÌFš™!ÑM’0ÞYó$^7”Äs÷Úõw&gZ3§'_ÛY"%AýtË;™©ÑhýîàÓú,Œ£UkìÞ-‘Æ˜w¶õùËL.ßÜê³-ø*ìÆ'5t(AH÷€–‚¤#š‚Ÿãs½E ¢í gÚO¶ì|3Ñ	ê_÷×8¡¸´9KÜ†–,ÂùÚ»Ex¬ó]À<õ‡$ªðoØì]x“„û:ð‘Í:L€^ö\€µíi K{Ì5(¶w-ÇŒxŸßVok+Y<Šåƒæˆ¿1Æ“Ñ‡ÀÜ?Ä†×ÎlURÝ—³¹‰Ï°à‡Qœ^×eqó¥Yov‰$3õÂ,v·†a¼}U±|ý•YNÁ@3yiãY|ÕOÂÎ’ßócà6¬ ›PíCÃðñØˆF	,³…^/ÚôÀ¬f5ë¦±? |äÔÎ~7ë¿…âÑâŸ†ÖVœ$ÔláÊíkï,Jtâ šè.ÈÃŒx6[º]¹pØ:Pb<¬EA»I=¿HèpÉâ|ÀÖÆ%NñÀF‚†[c´ˆlQ¶:Á+¯H­ÊOz·•®`ÓÑfèÃLÍ5”«k²Z£9&¨MXVg¹Î[qš š˜êLÖ ¯ôzó¬åÈä&A2À2k’Vå¾Áò2baª2|íñïÆê“ë¤'í#_hwÄÆ ŠPï‰­µ;ü$ÍúëoBÃÉ€VÚÆæyQ{ýÑN +ñõfÃ’Y†f-Zqw¾ymª’|‘ÝñÕ*âÅíå§ÙaÄÒrÔÊ.;}ÚÂ9v±êT±Òxö(ŽK’FaOM;^Ý:]Ã&ÒìEëõÚ§UOP)m`$¶ñ¤`ÒzñÖ×Ð,”Ýüˆns‚áDCú}\”óžZÁtÄG¨3‹XSÖuÍ=3ÞIz•à©«•Mêã6× »ÑsÜI³ýßÑ×ðàCï[’QñÅsW/ƒÚlÙ3‰–Äµä±AØá­tƒVU"Ûac+ë¨IÒê™Í(ê‡v½?eÔ6wƒ!ðŽ¾®NÅIÍ÷tÿ	{ø6âÇPŸ:[ë§‹Wëªî™7/òÌYN$¦|Âîung:v1¥‰h—Õ¢Á•h€f’¶CV¢u]¬ü7§qÿþKãÅI<Ü¼á["5”Vïò¡~÷¿<ôôÇn½9s\Ûm04É!1«
ª‹ïN´Ï—¢kçãþjó;!×VYß³hîÊö-6éõF3x¯^»µ,<.N“ÏmX{ŠéØü†ñþ/wÇuŠÚoðŸ[l½—ˆÛ¢3ý\D{®ØOx±A÷jF ì,“2å«'C>§ÎH•¸éauS–t3%d†Ã^¸¶†§Ýµnz‚ýîaxè Ûz»öaþ¼I…zÓ@7ÖéV«åýÒ›=MÿÌœ‚·'½iÓ=`!d·=çú‰án¿Y'%{´´m<ÙE§KÆ"ª‰…§$oìï¶Ò´Èg&u^¿þöÂ›5M8e¨Vò){–Ý3ðØ“á‹¸nK¬‹O ½&¸³0==˜¿<hÞ\¼~õÚõ_»á±ºŽpJÅLÚ´§[SV*”Rµ;|£ÄlÉTÌ…Ö¨OmÎÜ+Jž³¼&ªQçL?&Ê™3D¤ÄÊe&¦Í.eÍŸ½;]š>YJN©*'¦R–a/²r—œÊÃË\$jÑ¸'p†8jsI¿8¤V¯i>&0ž%ùÂÍ›·n¼³xµ2BíÖâo¯Ü†ifhÎ 2:^õ°tO°=ÞÌ?9pô&tñt‰›™üá0Fƒûåí¬q°ÖözbŸ|*ê;Ù~aãP»‡sì™bÍó¹âÇÚì”åk‚àà‚§CìP.ÍÝv#Kù³¥)ŒG‡“Ø÷ÈÏÝ*@]]Á^6„&PP	×ïé%êŒ`ÇzoËØ#C†Ô;¯/..Õc‡Mt˜¾÷$s/Ž“Á[SÀx<<‡¬Õ™¼äà¯Z‰ÏC?cpy³´-
`è-*#y Ç‹ùF8Š>_²öBçØ4%wFqO–RÓôê7GêQX7ŸR›yCËy¬ûæÂµB¶¡$›zˆyoa-y¬Þ*Ö½å`ÝÄœ·*3gÙUäÏÊa¹³˜Rþl:†Âï+r,a¾[ûOÑÈrð>ºÃpg.86£÷”ÇÌçPæ%}wø‹‚l}Ó»¯GñÂz0/Èy¯î‹²Þ/$+ jèoc¡È‘ñ7C*:Dw‹ÕMŸÖnCT‹ƒî¨ÔëÉ¨?á±ºð„z¹Â¸;›N“ ÷-Tÿ€êro{¯k d´9¼å(PM(»´¤J‘pÆ£-'©áÄa"›VÙöMÖ{hqÓU]ÙA³èÉ¨":>@/=ôîñ(0‡9ÕEÃ»À#È-Œ3w·¨ DÞÖ½ì÷PˆÃP–²Ã’‹´âÐäÃÏîÕ¤T)8jÈ«¥ˆùç}TaÚG#Fd±7ÙèÆ7˜>%mÍÇ¨­a+µ‚±Ôöø«i>uû_ WøXùËqÏôÒ$¿Íƒ?Ö
üæDà>D·?jàG4YÂ?H'°|
”ùŽ†O óï¼ý¯÷ŸAgèß÷PØ‘"ËkZ5Ú„’'„×—>ñ ºëu†¤4KÎ	£aÛ÷Ö—Ùìy»$š<µByìÍøb—£&¯°ðJWVq\[ÀgöÀ¸Ï‹ø§†):?±öJ‡¥ã^bŸ6 â)Ì3C¬E‡ü»gA’Ë™´1Á*r3œ4ÿÄ&´üçÿõÿüÿožpSÞƒðáq ¢¾¤¯<c±lƒÉå¸Æ$«JæÂ²ÇÅÀ%ãôûÙYÏ…Þ«s‚xŠ>¿¨Wo&šûŸ6öÿÃÆ•ò¨ÑäòtbÎÛ„¸1º±Y' Fq.Ùöø[LöÕÎqžîÏ!¶=³‹ðÀ0¤wÜwœ”ä^7OeÇ­QsÑ¶ÙúÓl|Œ_Ë³ž|–«7íœ3°KõÒòÍr›§=±c¾¤QW:hï˜ºP?bt.Üh¾
8#kAÀ&-ýñ´7ävqkñ
šI®YëEQLÖúÈ°FÐICÏÑíTíå9	8/( A!‹M¦æÄªœ*mÈ##c=O‘}ÑýÅc‘‚Þ-Æ÷éþ_)|ÿ©›çhðÈ<Ö@üÈ—ÿPòÀ¼Þ¹fí‹Ä«uñÏrÛÕE:}äøƒe–È²~üÉO8¾å÷“ÃñÌã+£	÷@5™’í‰ ¶ç¯áÿ>óþóßþ‡Ga,²:x±ÿ5®uÿ÷ßÑGÿ¡’'¾Ï•]îc•»’-ý¿Vô¡Wté”PËQ£ê
º
Å¯F|åeF‡ÒL#d»'.„çU}©é#ºà‡Éâ o™ðI.—çÕÇûžvàPïûaŸÙ€œ_áŒ þÎø(¡a'¹±ú®ágcz{Ø‹|u­ã	P%´2¬©<†Z®x¼5Àž÷:üT;»'–!7áóVC;^ p¹­NÀ ß¶€ÍsåÿŒ-×±Mr üPyíPv’uÀ¾¸•
¨pfšÉ°¦õ_4Ñh£a”ª¿X¿°áÅ*¤Þ÷îJÈït ¦-²XLbá ¿ç®¤³§ƒÂ´_õ3Ýæk;$á½ˆY<Åqkˆ‘Z©„Ecrí€2¢%BZ)œÐº€yÂÆµnÈ¦ŽR¨È¬¿ð‡,P(ŒSQ'ÒI€8ðû¿uvj)¸!4ÍãR£µéÇC¥…ÁhÝ	$üÞªß¹'UzûÖ›¤Ü¢&Ïë-*ú†2Ü³NÖ©#4ì÷ÆÎfµ$0t^¡]šç†1,‚¯^ã4‡¸z[™móG0<^tòÅþ·ûŸÀ){ÿ/À<ïÿ	E—¿¡¯Äáìíq£ÂêÉÙ^µÄ>
$ëòZŠ_"‹#ÿ@$mt™ÚñKcB|ÈÄzî‘¸zãŠ" ¤‚êÎÑ¼FÖGšXuà¤ß«âòÕ}ñK0,éÌ„¡¦š4ÙŽ6ˆ_c[ÁÁ3f‰´7˜n“÷”UŒ|Ä„TîVÅvqð2zŠ{¾8’2ÁíèõšEJÙy·©³LÌ|Ô¾Jÿ
t(¨Ì­ wc½µ=ü¯ÆŒ©}>6ÃÒ²Š¥k¬/ƒÉãÖXzª	ƒ=ËP»‰×‹×¾`ª]L½pÖÚå3œœd‡déÄ^^ºG›¬¯¢q`aÝKÈÚºkØü-í’“ÇùœÐgÓÞÒF¹ÌÔèK«·Â¦¶I¯u¨’ÐÕž?¸§®×¼®yHv	TþÁ3ŸÄ×ŸÀiç9÷ÍûšÎÏ˜Õãàmm8O>úågÆé2‰ÿv»ãRèæD‰ëdßÑ>¹A$’Û"Úüž
èÑÞ¨xâO)'¹Hjžÿš?{`¶ê—ÐÁXÕ22 	e+^ÀF9='.£UqØ€_*XlCÑ(î7Ö^)U:Ôëï°Æëo_¿zgéÆÛ·®°Í‚×Cq
†tFAOªiÅË* 1-”èÒ“¥ìN<³ñ¿O§=Â\ÙÉÃäž88ÁO+h*c%ÏDh«¦)£çãýÏI‡-½¼ü¿÷Ã`S¸yÉîSa^ü£JuöèãFÅpqo»3tÃ´†¼]„×è  Ü:b†­†aB!7Êˆ
ÿEŠ5,§ÙPl…h×
»‚7ÕÊJCß›Êk7#¿’ÕDÔ4ÝäS:^~\øš0*Gv‡aä³äZÁ&÷}±Q»¬”Õ ¥»‰ü¿(«–ÑÞŒ6ƒƒ¡ë,­kËüÐ(Ìè §gxD: TŠÕ^ÛaMíÖd†3¿ecÀß”ý„«Ñž %üôÄïvj†¿`
Ît½ª,Fþ’ÜÔ‚$`Îy¾øaQ¾j…Þ‰¨	6^8e&ÉH†2±¶R?ÐÝÉaÐ€‘IO†SI½–eè2È°Ç3¬—t"É€é÷ø!x(×VZXP,Š±óXÌÚ0Â= ‘‹5¹!|ú†I›æ¹†!†mŸq`=s;ˆkTÔün?‡?·éÉïP"]ù/† Úxj¿uãÍÅ;7o-.-Þ^ZÆ^Wôb#°–\J¬Ë¡öŠs±Ì{df"Ate~Ó”6Ì£ûf˜¤mŒ2ý2&ÎZ^ÑV6r[8`aµ8µº,ÑVÌ\Vê#šÊ‘tZQ•9ã•R 8ÒtoÖ¹K~È9Ì‰:¹ÂŸ6£XéÙ#/«=Õ¦gfOÍÖõlúÛDæk=ŠR>“¹!ÝJ	‘³¥ŽøoZ5Ym›tõðà6&­ßŒ€Æ:i"œ™/f^v˜ƒÜ‚Ð£ë½Ñï;°›+½¾êÕ|ŸÛ§UŒ÷h¾5ú[èt‚$ùç?MüáPõg¾ÏíÏ*Æû3ßfÆ÷z8@çktâmáØd!mdâèèÈ-lH£®µ*ól	´ð¯`ÕZs­Éû«UZKßÇêAIøoš 
BÂ}8fÆ—×Ûœo£ˆÈyó%¯¶º>éã†99×jy) l2Áœ/“ç`Pž^E0qVMáz4yZTÚÜÓÀ¬ 1w^	H7ö{]G-ü:ÅÃ^`´Çé÷´ékv6üx!­ë×{¼
þ€Ôžf;ëV\³¹ý–¬?»Þ®¸Ì]	…,Z bA­ØÂ‰u­ZnvÀ@Ì²T˜¹‰ (ò%wá²	^‰ðBz§ #H.c‰ûöPräéS¼áhµv`¿Žðˆž0yU(™©]ceùqŠZZÜ²Ä§®+lè{ù¥¦h‡{•Rˆ³¶]kŸI¢Ø5’eŠSÎ×khÐ5b\Äæ,ìít<æRuMilH„HÔäG¡•^A‰žKÂŒÂb®rjè>›nƒz]Z@¬ JÍòcläÁi¥ç,Öjöae¹*}PÿÜ¼¸ãt' ­–ÛkzQ‘Š’ïËdþ4Z_ï‘0¯PŒÂ6"]9PN¨8Ö*™V‹NOéðó15ÕgöYAò2ÊÒOÇõ9œ Ô²”.ùš*å`6@—ž˜køß¡\¨"oÈ†ŸÜöWÕë#‰<~ˆm&Â*Ä\j.óR+†W¹*À×Ä&g0ÚÁ†­õîy²é¶wB­ÙÕìhßWÔÍOtæÈìZšæêìSüÙM(¤9xè¨„sŠ?ÎAGÙ§øÓØèÈ‘0ŽýMÌ{¦Ü®õæðÌKüUfbœh€–°3	³õ&/ ÿªàäs.íêäm¥Þfæ‘¶ÊDìªîTW¼í‘ÍÊ+È%ö-oü5gÞî¤ca?x3r&Ó­–Ru²1ÚYÄX+‰\=˜OŒ¿(qaD!ÝÊ•ÕM~e²º–ãH½pæ“+:*ÑøDçô`~ëmß¢†TöÛ;3×Òú’N2ÒRyªøfÜøŠT’IÓˆúCîiDÙd.&ö]ËÇdd·_{hr2r92Rª®†Cn£â
«‘AN®2­)ƒ:ÚûBzÐV¦‰ŠS[VH7”=Âô»”f—g®Íú¾©ÉÆ˜kkÊüU)£ŠGÒ+ÔPB9æé½’”N},ûG©a¯t–íÍeo,^ÿvi‡_džùðP~’iÅ•ãsÿSòŒRÊ'”üÃ1h$Öt¿Eî±xûVÖa1Ç]q÷ã1Iäjàw{á úòGP|=/G—åºàx¿ÕgKcžyÚL¡¡LÔn·Zmúa¯¦JMôîÁìi?¡ã2ön¦ßà£[JÑÚÀ*¤L8÷ek4L@…mÓÖu3IÐãF
¦ä¦ •‘¡ã6‚™YfËî›´'a:Ò±êrkÅh†,°Þö~3ê®£BE›±ZtW%þU­‘"¶¨°(ˆN¾0‹h†tõ‚ü³ƒÈôe%ô6ëó;ãŒ&Ä=rÔÊ×(Ñ£ckNqX&Óë9ÖU¢"I5mšPë=Ç6¿™Ho~õÓÿ!H…{ÅÇ´ó>—:¿‹à1ú(ñê”gU:ã`c€e|bèA‹cýµz×cW:á»†\¼6‘´•]âù §Ý%5™'ûëÉf„±«&ã ðö1F	¼Äð'ô>y†—°AüÄ5w§75µŒã‹Ñ­¡¶aúà39Í.jú#Ç£Y•9¬E¿bò^2Š¢n³õU–Irƒ.^~2Dëökjh5J7dhi>ƒ¤¶Ä2¿ëÊEú8›÷q”FX %Ø¶·¼Âälcs\PlÂ5“r-Oèœ`E2lY¾n7ÃÔk&c‘Ð}6À¡œÙ;¬¡[&¼CJHFÉ0ìàÍ@”…%#.È69!‘oUìG"X£•ùø·¶PðzÏ__º¦lÀ_©/PNÀÑæ$`ýÐ«“Õû‘’„EQdÛ_ðwCGòüx¸_ÐÇï{ÄÓ¿À€6­^S½u¡ÛÐï]×¸bæý‘DŽ+x3·AäÓ2³ïª,zYS?×_ëMÎAúºèV=1%^‡ èXæk½šÃŒÝÑQÇá•(ãÏº)®,­»vªC•‡
ñBTQ}#)%ôÝê­Jð«‘ÍS:g~}ðP·ðgòð·ÒñRàKå¿xÎÌÉk/DÃ †è}ƒ¸©¤ù’í%gÚ³-oÿkoÒkÍàOÍ2ï~¡àvg%â2ð‚N¾ÿ—I6ËÆÜëŸTwº^H?Üê¥õ^Â‹t*Ïq“Oƒ„*Ñq‘QeB*#%Íd{.f¹IÓ‰•…4Cä®öÝ‚Ùea_’/ÏƒtyÞ§à•Våx(M \$1œ%IùC™Ý)R„w¸AÿâêçÕm‰—æ^ËY£´¦{„ƒ]ê®ž¸›šˆuu<<Ë3˜ÚÈ,qñv9%<û(xºÔ<eŸÓU›xÇ“H4»ÿWîÒ÷ÔlPƒŸg•†JK€|Ò4%l²|Íèˆ÷‚†ó•Çac`"4F_šßáG,êoš=Õš†¿2žÒµe,J}Jw[¤Ä{X–šwª53“©û„]NÆ/]¤Û§˜¦•ò¿CÅ8XA£%ñ«n§¹ÝoúÑfÙx_eãyN˜¤^‹—^M&ëxÿ¥˜§—¨ìD'ÅÐI½œJ&Iã‚^ï¼12t¢§³ÛßiÛlþð°¶Ï®&V“,`~À´;’Â}A™Žö3ozÆƒéþˆÔ´”GVtÍ§qFÇÊw‘ƒÿDc€Á 5¹è×¢ñ‚’¹”n9M"Ç Pƒ¿
ð)ùÁ>9$µ+?Lvw ò8?×šýÔ¯,€s¨{æôÜôÌŒƒB+R÷tknlâ¶‚Îˆ(Ûï¾Û=<mÏ¶[‡ møôÂ+ fásˆX-1³“Êé8€óù’ÝøBšìÙ (‚Ó¿0ûPt®ór>ÿ8]Zþ\Å4™eÝ¨^Þ…rVù
ë§`1à÷ù•à/Æ§øƒ½¦ÇÒûÈ«41„É‰3$ôEFmË«û*+àô\«5‡]g[Ù­¡|€À”&¿êGï~ï¬ýsfö7…“,¥ fÙX™CE<^sŒÎ¤À{‰†¿d¯Q€M#–—ã ªyÈ5<›Q|/ÙÈ©û_Þ\ú—&°’^Ò|7‰wÒè}ª+ÁˆK{²ÖríD'ê%µ]bò6;mofoKæ°ÿ¨ãË¬q™;+lÔ<›W“¾˜5©1ù0§Flx5Šî™ãÅ7wÁ¦ˆ±?¡âvÐåèML(<LPª’Tï˜ÄPÓ[ÜŒÃ4  AÕFM	¾wLùøNN“Í­^²UË	{%qwq«ôxô|Å›•/fäaž`@ÞL®&—šdÀRLÓöì¤
âÐIP¼ÎÃºë2Ð_T©k}T±l†NPæù]²c ©[¼E/Äl±ÏÍh |?5œ<\é0úGw?åã»ÔŒƒdÔ“ycò({«cm¤4fi«­†
Ð=<ø¡Éƒg+-5—ÄËD"Ó½$ÍÉ²l-S+ö7C
=°Mq	S-\Î¸¬ëÑîÀA{í>žekµl.¼M<"òŸüf`Ò/µL§•üùÜñ¸C“ò›¡Õ)ïmšß±xûœÀj8àÍ<=ö‰ÂÑç¦ÍÂM3øÞÈ;ôã$èÞŠ6L€£nð‚~^¼H˜c'%[mfü‡d¦EæW¿l'"·êòŠÃÝŽß^ÕºçEkè)˜d]€´RÐ+ºÏAQÜÄK¶OJF5òØî9?¹Z“þ8Üà-/³ÖW˜ò a„Úé¶“–ùl>ñNj5½Ó-;Jµê<Çy}9Gž›¾öFÖ—ä’†O4÷ìrHj>s6'ûaej.oE¡Ý2 4äCŠÓŸxü¹È®4tõX¶íJ«#·p9¡KžâIÿªÄ§«êÉ5F[Ë–7nAtB‰W,9·:Š9î­±0¯×²À`øS¿ÉÚ	?ÓïéP;DZ–þü”ù‚\OÔ
þ¸)~¼­†9]*]¡MeÒñDVŠ–ïT	W5Ù'af‹f–Ýt‹ZJ¸Bù{Â%¤?vù”òbÔ¯U‰Ñ?zkÒìát–^T3GÆŸ0ÜÔ¸ ¿§ 4[Ç7ì_…®³BD©xµdî1bÂ<gHÈŒ¢Yü½À.Êubˆitµ¾­ƒ…êÌzKñ™Æj+ó¥þ¢šÒß0t	Þ™ãŠ†œ×™/u•¿uÙé7÷¬F2º—Ú_ÏvÀþ¸Š_i÷³E4¿©Ýwe*~¥ÝÏ1éÊü¦Ôö†ÆÞØ+Lµþq¾Rßó´4xe+Ïµ!Ä,.bÕÌ-UþlˆlÎ!Åé]ôð_ÓnIo4³¥%#*	êè¢áCTk~ÌV(ôû/Ìó†K€Ÿàâ%I:"Ô%=!Í‘ÏJ–MOEÆ£ÙxOY4cƒq^–*xñdÿÏ,i£&qªš…ò§#å@ÃÁÍ˜ÒK`8–†GcY˜#ËL‡bä†såÉŠc:XY-Ë'á.Oð"’JÝÏl#¯:ƒ~„³»0Îë	_¾âæ}r
ÆDƒßI™
›«áågyøã)aŒþ³\¦³Fµttòœ
šîìL”ÔÈvœg¿sžÈIÛùÅ"ÿL–AS1ï¶¦ê
8ãª¸Gý4B‡‘œÞél‚kïpg™Cä­„hÃåÝŸÄ¯ÒÿNqðìº/dãÒ–Kõ
l¹:S·8‰‹³gx:Õ)cìœ¥SY7_×8:ƒ8—­s†ÎÇåâê¶É–ŠŽi²U|ŸjWcþœíS±yÿn£‘—=Á$1¥ÚéX«ØOÀˆã`Øó;A-/¥‚FÁN¯„l¨«é‰€¾	Z™ÈWÓ¥¡J,;æuxw(l¯ÕsóÉèÀ&_ý¦f+Ëå—W\Ê/©"«Õ,<Ìþß{žpâÔçõ×vˆÝ†ÇSÆ ‘ìÏ<ÑÿÝ“–sJ„+Øv}ð\ºkË°®Ùsˆœ¸›Ñ;Âï´Ds;Ò. ïEëm‡Ödt‹SÑ•M¤Ò·œ— ²¸†IS6v—Ã¶~‹«I‘/Þ/åoäb1Y µí)x.Ëê^z±n§Ÿ«z;½à¾Ò°“d\ … |
åËL²EñóáèWÑó÷Â£_ÃOÆÃ˜BwpŸþLãÙx7ý]ýBíEç'+¢éQ¢}×“Vçÿ÷ÿôÔ6»h,|qðÑÁ^£Í?jÁ&»wõ]‰¸rƒ’	´NðÙÓ“ŒàYlCdZàT'*•A+*LöðàG£Àw…ÄÂ'”¡ßäƒ^ÙâÚ[ô-ÙÛ¸U’Ô{ìn–UùJläðV¹¾ð™Ph@ÐñtS;®j÷Yˆ§2Ü!_PuÊYëúÉÆjäÇt)¿Š>Å5Rª<“ 2ÍJ±ÜŒÞô·£QzUÔ›ÐbŽj ©	{ ÐïÝA.¸õÂH„ß'\~&t)3u]7ò6$t—ã0XÃ…qïÂ©ó¨ðû±`b¼›Èö;á™÷e¿»_ÎFà#'±!BöN+ê©v1©0xW`¯tý˜î˜<*FˆepÂ³“]˜Ãð’ëþ$áx›e«8 hëÀÐqQŒz©PzHhžÁ÷%ß¹oÁg,ü¨˜wÂn
± gš™ÝRÜâýÊ¬¬>HØ/õ“{²jÒ„Ïú@˜1Ø!ÞˆÌÄFá&ÏPr'Z[n©/~voµHòÌ´FšÅ½ýÏ%0o±ƒÝÒ{#?œÖ ¡Þ3(»H±˜fÿ94($&wºat@<ÜÖá©äg(á m/¬¼qÔ5ÛÔ2Àa>am}“ûÇC¶k<’Mþ]ÞöÎò*šDæhöñûCR“Ð¿õà8Òmülç/I?Únãrùvï"¿`Îê’½Ç\
× 8èª2 Œ¼ïÈëÏhÌ[Fì«•Õ Ñª;<0¡ºÌ@É¶æÈOƒ·ðý!üÎ1{¤tª™‰£žqÂsNõÞvÇDÕKLUÍ»qzõßþëµí.m„A¯ëÆæ›Ç»Ô ÈPÞ˜Ùuî/´Õ?ßÿ³"Ùgì–”ÌùCíÊ°S8)x,˜ÔôÙ--LH¼bY~@0¾ðêoÜj»Þ1àÆuÃôÈ§:üdÇ$µç<èE`ˆeÓòFˆ™²·‡ÈÈå*<M¥Â‡•FnaÑQqAåF?É>#}‚¾È//È\¨Óœ¶úÃC°"„~-?0²2XzºÎgÌ®`ÄÉ×3È­_PÃÑ‰‹ÜÜB>,½«¤™Ä¿âÅ{tFÁ€Ë·iØ«ã’å¦˜à{Z"â	ïå>nÐUpÒÓÔ?Ñ²ÖèŠ´Y4øŸÀì26Á-mp ‡Såmdð
üW œ"¸'Òfm˜£^BïF»…R‡Ld8_Ç‹-ððz#¾a¶T÷VÐêºVÜƒ9~×t€›ð–©*·d¹PCÓ‹Âµ<°‘Ðñ>ùÚ=a÷ía¦0ù¿˜YÀÛû¤9u0sJuëÌw¥Û:¦6^Ö™SÁOé’~Ø·+Óò¦Ìcõºg_Ë/…û,Pú{Ñ‚O-Ø¾FÝËF¡U«]9°@!º—å¦ðfží¶†7â.ªT`Œâîy!1iZ.¢^†k‰i#¬µ½Ö„ž÷›^MÓ+àˆ_À®ÿ½šÑí\‚:ëkÙoã0ŠÃt{Å»t	p€‰o«ö7ipÒ•ˆ’íD}vi 8ÄÉéÙ`Ó³á˜žŠÔlàmd°`¬‰ñé#©†Ñ©¯?!15jY¢4\»ÂU_¨ÕIXÊc€tŸWf)€Bj>´¯p”¤Yk*‹Y£ÉHlF«ÇÝIƒ‘è*C:g¾å3ôŽ~ðžßKËÔ8ºb
UƒÀ×W˜þÙ˜…užÀEúÞÔ;x:NºîCøc™fžŽ0^H2•o/Þ­4¯ÀÆŒPWÞ%`h#º×¨Žßñ¼Á}¤(øµÿ­cc—£Iö«ÏŒüü«å¤¥¢ØW3tz£nÔ…ñE¦†³|‡\5^’óc=ù´§¿Í¯ù‰ûC·žAul•{ì(§uåh&¿ÏÇ†G½«;<V“4ù'74_PÓ’.M@Ì¶óaxå+®°Bõ^ $BØå´îÍàZ‹›q#Y/ cW{_ˆV`œŸ“yá3)Ú—óúf”5TÙ†¾ ÿX".`ébæ¬Æ•ž_:²¶0‹0|~€·ÑLýnµ>Óú]wgf÷ÓçèßÆïV§Ì+¿ûÞ%¯¿<½‚Yl3°á{£ 3—y÷è!™ðåäùÅé33^Dñ¢qû…4"oy›GžÏr?IÇÊž„VFûª–Ô»Oîbfys¯=0ªù„
0…ôn8J6èÙ²ª›ˆ¢¢´ýÈ=Žgîq„02Z½:„1†Iè¡ŸÂŒ7¦—ÿáï1#M1ÎXR}Üû–‚”Ë@ÔðFIžIø‹¹ÍâNR7_Ÿ7†teai‘Ý¦º`"¥¨6ÌÑ/Ä±¿ÍPB‘FEDðm™2ˆH/c«™pïÞ<áfŸv€a†­8§ùÓ«šV›ßW+zƒ	á—™œ×¦q;V3¶[ÓT„{%4®Zò"¿\¶Œ@¯0iªBÖ¡ËÃ°R¢PRg80’PHÙÈ€ë„@Ùé±ò™Ö›~_ñ†‡lLÆmÙ˜ÝyWóãš5lq+‰9þ0ÁŽÞÂs>qqØ'<§¶o­²,·v¾*FÉ½Ù/«™Úo¹‘'8ºSTÓË’þ|ã¸’H!HHÊ¥]•&·$³€vÝÑ‡° ^Ô„…»s(ôôà#:b•v­•ut¼·ÿiEr>þmÿ[X¡O¤4‘™&ÑÂÎ õkÒÃí3"ÅX•bËlÍüœm¯45†òŽ+Ž73]e-9¿h98¾ä¦èêxsU+éê%ŸÿòÖEI½AWYÖ-Ãeðº}ê£k¸×1â®Ê"ÖÊR
/í±t9ù°(œåÓ#0FµðMs«æŸÑö}ð –‚Q&‹a€œ–íéËƒÆÌ^‘VjxÌ¶«Aô”,ï)‚I>DË@`²°û;¯[àœ®«ÂÍãÓsAß«ƒ#j”B€ÆK¯0Êî¡EïŠ/™z»JŸ¥m¸Ö¯ÝŠ™½ÙòºB¬È—B@`‰ñ†«÷œÑkúRd±œš“—7â)Åšu0•zg‚ZYR#‚›Ù“ \‚…h#¿:­8¼ôÛÉzØîÅÎIøÅ*íh—Î¸Þ¼:$Az—×¾,é<ÁêøVG(«Qû^<XìRr*|U
?ìˆ±kuLÈ“J2Øùƒ	¯ªêPêùÛÜ¹1•DnR£¦kþIDµºc/s{ã¾‡š´­ˆB«iöÆÊVÒh: tÌ›úh]uŠ"Ì¹´ÛqÁ”IF÷øªl>ÌS—ìQU•a-Z_ÿÄ˜ììã>&±&™‰K#Ýk„jSN]>˜|5Ü7P…Î«C -DÃa4@Ò£&ÄÓxmd7ãÔ®ÊeÜµmåGõº–|†X¯Æƒ„K¬l*èwI}IuÂB%[Óö¤Ÿÿ<ó–õb¾¾Â§À|ûŽZóím†2ó¥`x™†cr¿v¶D‹Ô~I«‰¿Ò”Rr¡Îù—ù-eƒ`3HÒ¬x²LÖâæ¾’U„]oÒóQi`¸ÚG¨1Û÷Yû«•ÚgÌ`Ìö9Éh6øÕB¨ÛÀ¬ðÄaGM•CÃ˜ËXÐhÌÉ×˜“	›VhUÒµ0Å`QÀý8P!,šY-ƒ*í£ÅOtñT¥ú@-‘RäMÈŸš´§^ÚÏšè¥^j‚z©¶5õÎ	´Fµ­Û~ëjFíbô„döü-öúŸ°ôŽRüÆ»îóVaKvÉà:$‚_ZçÍ•«;NX‡eªrò¤Yaœ²º¸Z©‚.?Wª 	/•Ê›b`5˜tQnŒã‚¦‰C•ÊóåHe»ÁšËÂUô=Ãòb—‡>|—YT•V’sÑ8—×¹’ì¥C—ò-ôzWäˆ+˜4Ñ
V¢®MÉy½LÉgC¹e4„å–QÏ-b 3¿3»%…*ô©pŸ[„ME]‘©üúO,vÎ
LcxO“ËqàßÃ|°ÅV’«€?9#ñ}JAØæ
æû"b¨l}[åH7èæMM­È*¨jU°Ý¨K‡k•QjjëƒPÑZ¯¿³_ïž7Q¹&
C;YgæsŽþÎQN(ÖŒñ–é¿
°°”KU;,0O\yÞ‹ë|Q/ÖÂA˜lònIo7ƒ9fd»­	ÕdkBkMK¹çÆÞ!šÈÅð¡ÚR³0^õ
35FƒÆlr‡­ª6ªt$ï+©ãþÛþ‹ƒ”ƒãŒç®,z‹iy[òr»4…_Ëc+&×ÙÖy«xŽYƒ—ššòøÙÔ__ƒuÓ^÷{áúÀÛÓ§fTx¦2íu®yS~*°”yŠ‡/Ûm 'J½è3Þc~xÓ¦ë‡˜eüÔ ÖÍžÚk—±ÐTk3¦ñ±"–¹S|(2œÚ¸S-80§Ì€d´”íÒnÎU¢Ú0” ƒ™ùœˆ£D¦g±n3ª…W!ÝåÊ`Ð)ÊlP}qô¦,ëB™pÍ6Ä{Góê“Ö¸É€{hœá'’XHVX¦¢aã•ÚæöÊËZ-@ì¶Â`Sž³±&5äœÏEdu6f±{}@|<H™DDîªbøf]S/ŽY¢²6QXm‘ËAŸfÒz£S†Þl§WÅA'ÖÞ%e4P»fÃÜk—Õ#ÿc†´UVy¾»š’Ÿò†–iU×0’›ýÁ¿Ë½•oéËéÚ×-à¤ºÔÊÇ&×á„µ¤&œ´;‘™-3%Û„	Ÿˆ2nUðÕ8'A/è¤Ìœ[œå?½›¬6Í/3ßŠF)Ÿcv“¶.Ö¥6¿p“Ê^ÑŠÞ„‘+ºRÌÑ“Ìïè­-ñ·*i4¸l^f¡èó;õ|È¤r¥<.ª)^ŒßÂN¥—UmÊkƒ¬ôzÀñÞ³>4Ññ{½m
w"tÃó]oèoSÒ¤˜ÅŠÂ7À"×ò/ç%ÛIôµ†õT'ØåŸ’!<Zã"p»KìÊÎ¾¿U×òlC_È¢EÐ)Ñkë½ôÄa5Øe’Ð‡#?Ê4ÝªÃâJŽâH÷ªª¸²µpÎ@9[TÓV¾<žµÅ€Ò,¢’±L[x"ó²5ü[‚{|b'0y˜É)èZ	ûXâE4c••Ù\´BìÕM?´¬gwyN1È/mˆxŽ+‘‚™\DåU  6x‹1p˜¢þÚŽëˆ]­‚¹]X”êþgžñ^äŽÀd/Ze6Ø¥á^`´¥U†®>`·qWÞL	¬çˆ1·è$qÝd+@Óí¤1¾
ÖŽ,kgˆ°µó}’](–CÑâƒ¬*1þ[Aº!päŽýX¥xÁ;j^:ó=ˆÿ“N<ŸyõºKv)€-!ð~]múÛkˆ’Fðrbí83gÞªN‰´,ºÎM,ÔœG¿…´ÉiÊ¦Mþ:6{Ñú„/Ð¥Òucµ+·n/Zx¨ígî\×’¢EïŠ$*Ÿ³LÂÞOsV»g‚ÇÊJ„É<cwíf©lI‚áÄÉZÆ, ðþ;ÑŠUæ(Ø#Šå"4¥Q¡$x2˜WÝi+³/•p"}&õìšB0˜ºøùiW,'ÂäÍ/Â¼6È“J.Ê¦.@Ñp°Ôõ;Ð:£¨ûùúGOŠ¨<ˆ ø‰¼{ìLò(€¨k6¯uEÉóv©kL;{(þ™$°?²¬ò4zxa5:Ôòtza‚¹
 µ;!å$ÆkV“…ÈÚwÞ;!æ¨â‚€ÕšJm
XÖq´k"ì]õÄLlCœ8Æq€L“åp¸F	p38`‰±À„õEKGóÖ°è›0kv	ÿ¾ÒÏåuÌ{´>é£T2yÄ$Ï›ÜÜÓ §Êm(@ìN^­ªî ŸÉ 2â~˜$x=}Û»uãÍÅ;7o-.-Þ^Z-ÄQ/Àtþ—šZY<}è¥›ìêb½ˆ9C’£ŒPç³‘+‚§)#O‰…'ÄÔ¬Ø•Mì(VðV24È×"ÿlÑ”U“|Jé¿ ùø*_x<‘¸l‡ìÖŠwî|G»›ž$C±VŒD%^÷áþ7å´gãè:Æo‡,ý§±KXã°qÇ.ƒD›õÌ¤ó\ª¸‹±%~úœ¥8’—‰8ëúu‚y.d`Êöv‹\t¤ë‰ö/•d¸Ë%CzA)Ÿ0C%@öú„ß¨®•E
¤Tý»žÎ†UÂM ÿ;NÂeîxÀ2>»æ£y×mNÎDOì—}J]|`^c¨¨ÈïòÛ³­o»vaNÃÆÛ•
Ü6}LÒË‚»jÃ8¢ëvjè4–`2Ð,ð\µ¾³°¯I\˜Ã1È¨§•á<![Lò5¼	vÍÆHç¶ÊÂŠ×Qlbµ€½cÆŸ¥÷XvV`ñ"Nqi#Ú\âd×Ò§êNi{°((ÚñÂ›ßIìVv¡Ç+½(	
»b	bwU2‚‚!\è†÷½nÏ×â´Wƒ3€Ÿ$(Ì×úá`rc2!ñÀÛœÄ™óà\1¹9¹Ççû›+”Oa­mNnMn„Ý.ƒcù§kþÚÙµ¹¶s$xÁéäYØHÖ¢<úÀË™J3SùÕ³çVOû+S³­š:I·{ÁÅ%ý*dÉ±Gq¯þ‹4&í©)l2i®GÑz/ð‡a‚—ØOu’dæÒšß{Ûó×.¿uòf/Ø:¹ýž\ˆýÕ°ÓÞ\ßHuªÕ:?ÿƒ-îüø@øón˜{þö|²é¡Î¯úA7ô½!H©A5«QwÛû¥·ãÝ“p5ì…évÛc¨8oN“êNú°t'ô‡LeúÝrk[D;Œ’¥nöW“¨‡jªQþ 5)¿¬¥¨KÎûžFÃ¢Ï›a7ÅkÎZ­Ÿå–éû1ˆE­ýn—)¸s‹¢’¸(èè.a6ñúA~ÁÕhk2Ùð»ØhIAL»2ûÝ™J>«~çÞz‡`Ä$å”4fqMrò8¥eÁÑjˆ_ww/L±å .Ym¡®{új­)þ²3õKT\ÎÏ{<lÓC}Ëï Q@\bÆxšyH‰lž™)Y¿œRÐ]ð“°è`p°9yú”—lÀ@ïMÂ¢Ø&;Q9CÇqOü`bFHšŠ_ô»m›¹ÉÞº6¬$`6òd²ç öÞ% Íl‹GÞÝªÙ/*‡[“§¼áöäôƒØïu'çZS§ZFìÀy÷ý8„©‚Gqø{L¹|³uˆcÍKÂß#ÿìÖtNœ`¾¨­qv¿t3âCºå¦ç%?!ê2Ù#iJ>ùè¡&’òmÃ˜œ,zú[“³^þCTt'g¶zÖxÏ *  Ã@“ø~®ÕššÎ ¤ò$¬é&î#ýÕÉéæœÕòû¡?Ð["ZXžžn­ð#è‡«Q¯Ë¨dù§­«³gg.¯xÙ.×ýáät¦èCfÇc´3=‹Û¤À­–ˆ”’Ù	Ð‡mÖ)¶êZ8 °¤°VsNâŸöSÚÿÄPÔI‹¹"Ç8v:êˆ-£f½=
Ï~û¢3ÄœËfV¿ì¥†¡u½Œ?KHca9Eü!È‘÷ƒn­á]òêü‘P-]Ÿ1¯ƒv­ke1v™$ˆFLMÄIóBŽŽ<}î¸´#¦j+Ã¾r˜×Vâ"VÅÒÀ€‚Øc¢QŠŠÅIÚØ+Þ´¤[¤uP;YÆƒóKÏ”G”Õ¯÷›ß5Q‡Å‘KÙfYÓâ(¿´s‘«ý)ÖA¶¡†‹"iºÍ²¯¥‹afQ	,Û>Ç0<MÆ`„ê¡ËVžMüî^˜Z0ïrø?Ã!8X`ÁDŽ+åèíI”FL°™\îø½ZªîoLNŸ>ÒX¥•¤Q·ù¨×[õckp;×Þ‘Á¥˜ÀÎ?H~rÛ_½)u%ú*Æ+ZF<X…'¸,¯ÁUK4·â-2Höº_¤MÁ3Ì^õqk*Ôg÷Ò¯ŸõÔè2–šô¦Wš¢DŽ.%KéØí²¯Çþ:)‰Þs|Ç!L	¨ã9×…½ó±•Âdi‡ótöOÔ
Ïpü@’!§F›
Ð(È‘ O‚t=WÛÚ ñ|Y÷WÅs í=j“ZÛ ÿf÷¥+s­¹s+–“iðâŽ@×®{käe³ûs°b(½:JS`Vxä;÷æwüd{Ð¾ìtÉ‚¿ZÇÈ'áŽ–{~Y¯yNWjä;w	¹œÏgp<«³~˜ÚYÀ0•™<.Ãé’ÎaÞk;©¿JäMW;Ô
7øÕžÂ“oQ\ÄtíŠŸ¡öuyCÛÓø;“Xj»ws8ø\ÁBâ9ƒŸ5Zæ…S¶Ã#(½6®…lJG´9Â‡eõcÆÊlª‚ÕCà;a7gÊæ‹;™Þ°îÙ•ÐbNiŠç}|• ².*ÂÅ2ñ#,FFÛW	ŸÞQE(Ujâ~½À¿Ü
Þ‰J”ÔÃUØ3„»›‹×¯^»þk=_§hiqk´´Ö
k7VÜÜ×ÁÊò°ÅeøâÄœ}À10ôÃ Â=]yÇöçd©Ú;/¶ Ïá>$`]eA­:¬\éŠ¹±Ãõå½oèÞÇ7§Lý Ì”k>‰Ÿúƒ°e†£^â’þ$6Žo°»Òxñ
&‹•—²dYh“<£9V‡Dø\Âù)6s>§µTõŽ‘ìzÂ4yÂÖiáë0!ö\¬ÜZ‘Y%uÐŸf²B«9“‘çÔ¡žŸØøÈËF†RSHšbR’C×1e
Áv	Û*ÒØý‰ñ‚‹_V-)ŒÕ­369HÖÝÎ‘6à¶ºÈ%ƒÙZ#S#eÝŒ Â,3W7å&÷Î¸¤,œqMªë§“3æ1<£þ)Õ„¡\9ãRKýº­B@;½›Õ!
âL˜ÛÿúàºIë%»Gšûj“L}JŸ•FŽË%¢_¸²Ü£Á›ÁZ* <å‚RH¢6”ŠJÍ³*°¬pxi‚ŠïÅ¿Úº®ÃM‹jŒ€§,„¯G1§É%fbÊjÃ^!	Òþ£Iù@QëhL€&'Óh2öÐœª"x˜ž9Õ=ÕZÉ!Ï³Š<cÔ.ã=_@žs6y¢Ö-‰âÉaüüT‘ômõ·ÅÏ«Û4ÐÄÎ­íE£sæºuó„ÃWxÑi«éÛ'Pá+¢ºú¯á\4½…krÕÕá×ÚN‡~|¯$‹‡mfÈ¦½I(r·|UUÇPF›ÇÆsN¾–T÷pXfŽÆäË@Á£¡ÓjÍþ^=ûfÇÜs×5ÍFžâUònM[¸4l¢Ëá)Æ~É»‘Èøò’.ÙùÌ;ø¿ ö
üô)]2ó­ðJ~&nEb>~/©Fæ–náòÊ¶‘«~Jn …;I¦ÍÓp…ÿ6`¶£èC«ÿféÆõ±¶“«Ñæ ùÝ’—êÊ{	ÚÑÈ—Ðÿ˜_9ÆÌšÂŸ÷ÌïÍSóÙ¡ËÜñšÚ:_òhjÛÃuþm¦Ïmóm_K£a3±ûðÛVñWeí¹ÔWc	LBü·{m,8ö*+*Íæo9èÔôˆ¹î²¼Ú8oå;ÌrÀ~@þ¸E&N™ÀwëÍ¥
»Ê¼º‚HU¼¨QDXu¶Ü¥Ã¨õ"ßX-6/à‘:Ø0Ãbjµ„G8ah˜QÌ4£ä(Ù6üA·‡×Ø‚_°pb,µÃsšÖ8‘¢¾5RQ÷e¨E™2L'@“lñ;-‡f¶’|ö/=);Râþçê®»Gl'`©ßÿ&Cðq­yA¢ßÀ‘Üäç˜ÙÙÝa»3ÞfMbü$N¿9ž5B8œô¢ºêOå´ß{ÂÑ´íÍýÌ«¿½°è½³p»aY»,†~aŠ|@4^lz›p—wÑ‰ò7‘½Âã—,PW¸§<¦›\y˜éçù^ý­h5ìÞÕØßä	-o”>•x+ŒÐ{ÎæÇ™m5Ü
0¢˜ïdËû=Rs¢é¶™KM¹Ä]tï4_PCÙÿ;ýW„x:îÚû‚R R€É%‹Î§[äuÔ£!4F1-vIö“,ô0Ý¶©;»Û¼e`JøÕ¦Û+mŠçðï®¹5¦Ò5d}q ƒ
ïßÄ–ÏžEoBæ[˜ô=n#ÍºÉEÜƒ9›n)»)Ÿ4{Ýq÷štöW’ð%äòÆyå[AÎ/„,ñyK¿ŸÐa_ÊÝNeÜq\bÞX.Hpúsîk9¢É!É%CÅ†m(´´jS’Ü›M«fÏR®¹]‰ùÌåmyö,²>|Øe›PV@ñ<Dé$ÙÄ`3Pso’L¶¢óôø/œÕÏ´vøÏÑÛeÝð¨øÉþ·Žà/w%CRždZ!&±0ù–ñaÎVËÉº_è/vvl1W‡ö£Æ¾¿1êg<ß1ÛeŒMnž’÷¹Ž)Ù)gPã;’#GËñƒ:•1ìºËð¯šsþ‡ƒþý£8™á_žGXg3ÂüaÎX•Î¨Ÿ\Ç3üË:Ÿ±:.4*ïpB£‡sD#cY¾+÷ðîhl(CÇ(²w¹{‹áþØÙ_D”-÷F~À5žcìtˆ®ºUU9ò`Ž’7ðãÎ†vvÒjÊ Rã±„c©èP‡Ÿ%o8Ž
Ã{Õ™Á?Õ+­ÿaÎãtã=ˆÙD³;ÆQÍ&®ûæáÂöŸÿög×j-ã-9,ES°“7ù9ãÉ³.•‹ã!².÷Ÿ(Ûq–ó¸€v
G.­a>õ¾à1ý@¿Ò ¡Œf„$>ü›7}%ÿ¯Ñ˜AšZzý;zºHû0.œ%ŽšýÆY“ˆç•;lâ_®Ó&!Úå¸yNö“¯¡ÿfžƒÛ¼8©×DONü¸½9e£=:©|žW'þåðÀ¢(ûs{}€­ùƒ—²<E‹;Ï¾ùur¼NñïÈž§¶òÞí{Z0å–ZPÈÛeµ°±#¸³æ#ùn–ˆTw=ë<’Ë¢Î³‰µ*.³øWÝm6Ÿ+á¥døƒºgé®¡…çp½-‚´¹l Ôg÷G‹î÷ûŠ‘Rì0ü£EŽátüŠQôá­<Ö”XËå“RÅy™öãr`>.ø83b~óšÍéVBçx¾Í„ ïÑ¿ù¸æò˜|1¯Ôß™ÆxŸçJxÇ÷y,Ì¼:ÿçbLÎÑGÄLžï4«Ÿç?Í¾ûPSÙÓ@Æ—š†di*¸Æ‡%v"Ó;3%£{É½Œé<Wñæ8À¢Ë›ÔN¨3¦Ãq„üšª±‚ÚX‡³j>âygªñÎ`¥Q‡õXÌ;„½B—óêúø£xÐRý£ùŸóFŽÑ·˜¯X8²GºèÁéKÈ?ç ¤Ž71ÃKïZ—çìN–[+—0óôþàMÿã/ eø8²áˆôxgr-Ô#}3µ¬Ð×ç$—}µ„_u!áWËàmjòÆÔãå†päëÜÆÕÒåêè^á"ù¢B
"@ð/—ž¸¨^i\ïà8£3x“EzìcˆÔ½äœ.±ñx÷!g|Ç?ÈÎó}‹|Ï‘ƒ5x;‡Ù8ìÞs¤¸Ñü÷$qÝ
0Ÿ^½–°äæ€ñ¿•ßŒy,b.‘—Q5Ãˆü)pô,<ÇOð”Œ¤ý-y8¾a=ïïu°÷jå«#‘yiÜoã8åªü£‰`5Žåó•„-)"OxoìØ‚Œx{Å2F¶¸ÓÝ†b‘¬·¤ÄúÖ×~°QZªv^8KW±¢¸¦YÃ?ISj¹ÜÊÊ½ÚË—Ëxd¯‡F¹O)Îeñ¿AÔTŽãûa¨r~6WÀSë{xb`eHæ•õBå­(EãH©Û÷ÃÍ/'§yhC‹È½d2oëA)žhgx„á]NBÉëmï7#4Ît'J&°•lvƒù\i ñvîm“?&XÍ´
H\ÈDŒÆ3Q@ÒU‘H~êÜœrUDý¶…1\ðñ4ý‹ùn5Î†re\[‘‰  ¢ð5(Â†Ê"žªJNÕc†-&U1`xcòì¿ç
9Éc4]¶½çæ©¶1.¤4¡Š´³ÓVÈØ0¹sf¥êÀ
~*hÓš.vÇÏWútI·ÐâœÅåd½¾¥¢“qÚŠ#„vxÇ¼m¨Èöœ±äI‡èI\yÓó\âÁt0ý§`úOUš~ÛA$Ç ]êbŽä:˜;‰™Õûq¢L~í9±TG”s¹ç¹Ë»“¦WŽƒöW¾$ŸÇmœóÿn{µuîeÙ…éú˜|ã™_¼ò¯èïîôm¯îÒnøH¾¶C0\é%»è‹~înf•äNÏ'ÈÀ‰+s™úszü“”©5ã«e\e§«ÊÚÑìšôÛn.oPw xDWÜ<B‚™ùGø&ÕFJxY­àyËÁ¿³H’Îêf‡Ü™ucòð•3Xycò,þ³	ÿTæ2Y©U^ðš#®¨Êqw”Å»©*žy²ØäË†CËOÂÙi]½Sæêâ^†Àšk*qAòZ•d¯µ‹Ù€ gŒOi& yµŠ
˜Yäìá‡éËÝø~¤A}y4ƒÇXdóôvh
«¢·®‚øòCøÐ3W~§9ßnu†”q€µ<%­Ùd—¨møãŒ_3í1éŽŸâÙàº‹"ã÷°]ò™ûŠÿ
!”å+ßU7µVŽØ#^öxÝ9Ä¾¡‡”°ƒÃ‚©î¼zø=É±ßÂ¥ŽíFJÃÇ·'‡þÛ6œ²SÏtí9­ö‰Â¥¹gêT«àŒq¨$y‡Éˆ—£G±-¨EÖFË± ¡ƒQm%í]mSÀ~Õò-«ù±ßn!<kÓ´E´
——M¯ò–»Öì:F-®rŠJ&½³…VåØk`Î*U48i¡äG‰®>dùâÆð)M#Ê4oy“®Oµ»ß²,V‡Ö[TÊ1èÚQ+OY®Ÿª©Í(M‡«E®:£HOz´ô‚³‰ù:© g°­ÌsY."”gÍªBBEæçÃ’ƒp2&Ý#­ëÃiQ¸2-œÎ.óiÄ¡œî1Ì•Æõ^®µmR«¯nß®r£Ç°¶µKóÒ×”	…²e”®g,wÆ6‚j[ž8ç¢u™P*Mµ®C®?—–ªrV'm5I•x
aäh!?s‘úå Z/ÕtèFô xí%EpFU(üÜ¤ÿ:4s÷†¦àÌ¹y#'½_ÖºÄì+Ž«6ñ'Ú·äµÉÖIîÓý¿’âíà¿a %bí¨K´ñèN=ƒ¸Cñõ'Oáî£¹eu’lQ”‡×¦Uh—A$ìe-%Àá(N¶¢YM¨ÊPx¾fŒ5HÚ0·yi#zÝ…^ ÅS-×Ïé žn©CS y¹wQgî¡GÂ†iÿX|LÐG0žÌ¤¸44nã}e†}Óê‚ÅríBÑ÷lÖÍb†e.TêNåŒPå`;Üª1ÏYÍ=&3_pKòi¦@v¾33P.õ‘h.GÐqß»îß×)„Á»ìÇeWo²œŽ«TÈ„©ã[cLÞïül£>á+'„Ç6Ššù!û]qº¦\DìÌ=£™ÞÔÅªyÙ.K2Ã:ïäªuýdc5òãn­âå\}²Ìü˜
Zl4œ–r˜paF‘AmR®P5™çÃ¾˜KívfjœÌåãV®‚¬ÊßŽFéU‰fÔpR	bD´ì8vOÍÙH3kºïuŠ‡¢Ì’ü¸©øÃQÂå8Ö:ê¬–GypŽ=ÿÊ÷ªg„ÔNÿ@Š²E” ÁýáˆáŠß]?¾êo'%ôP íø,ás2ŽæúˆïŒ†¨½‰ òœè. ùö {õfúixæ½™òÈù|™9±}rdô»fr%q²|Ì°˜è£%Ó'u³ÿ¤Íó‰üpÛ]˜¤”DµŒªó ŸËíáI3Oç±S-­Ê?¥Žå%f’ŽH’&aI²ÔHµè6–1Žqîóú&E7àš)µbD¶ë$¨9j¢ã>š¹3ýÊf.*¿´ån±j„;­t"³¤™=’NäìXiƒN8lI®ñæ®‹ÆNbý-u¿öæä™­žF¶·Zér~Z×m`^SR|¹ŸéêäÙší‹”ëÿÀ3~z@ð\!®Ln²oä$á÷–:qdOûZË†/Döt˜û8š\‹Ü·;4wÂZÿÃƒö#•5àéþ3X{Žr®ÜÎÃQžÏÈQNÄ7cÈ Ü­‚Ê~*ˆ'Eé™Àëy®BÀœXŽ­Ì‰ãÂÔÆLAŸN%”¹ÏC?˜,õöƒÆIr‚å©ãñŽ¤=Ò†æZéÍ‡®!ÒH¥Æ•ÿ­&_:Ý™ÊÂ@\·yÈœøÏaºA;sÖ&¼ZßøëÁvÝ-ÞK\A†ý×¼H	¯ªÈš‡tWYÿŒa.˜£›½‘6=uÍGß°ä0<Óþg¹¨+NgãòAa–2™¼œ¡*ù[rq¥YÕì"á½`eÜS´úÁÛÏ=´!³èôbqn7½íìZ²{‘Ñ©8ïS®“ GS?Ï8õÏÊÒJÆÅ5ÐsÚly¦T[ ýŽ£MCŸŒ¦˜²à†|nQÕ•³¨"(<"/Å•æqf°©Ñ'½Ý{µk¥‹V¹JI‡§Šœ,ûZØšgÐ?œöÚ<<"{‰;w[Î•!ÖªGnÐ°*”½÷	ÚGDKðSrý}ž•„L„mœ*ÁG{?Ó’6ŠR\ lÚÚgþ@|­·-t ßÙðÝ×”×þú~ØÛmÜm4ßY¿^Ûÿ/{°=ÌÜ}.ÞUK>—d.=ë³ìj®ƒ½þgæ’–[†±—XþBÚ2ÌXÎD†Éš/V‹a¹ìéùYu‘ž¹ûdNÝ}‚ž)Oi·È¯UÔ˜?bñ¾)˜·¢«p^ÝY3xp—Ìûþ©ˆÔbäÌ<øbÿKOWÛ™‚ÞGŸ+Úç`P/aECó³1)è²áÕW¸»\öú+	Ò(^‡é eÃÌ©}s+¸«ÜŽÑ÷µ¼½lê\ËvÑìé.šst7yiŠh¤ƒb<¤¨–Ž:s*Ó³:Ê[·né—ù=Û‚dÏ‰iƒ£ÜwûRÃX„"÷˜CL.B]øqžp¥±mcrºÐwuŽû®Êm¤½…iÆÛÖÂD%žâÆ%"©L­g‹÷¹ã2
â˜¸azÎÕðÉšª(,A-“ŒSOÊåh(:“Ü‚Jˆ%3f„oV„N`çÒ-`¨ùq£ï¤z¥rWãBÃñÈž˜ûÏ$ï€”ÖÝ¶–F¸OŸ(Êhæ#§\ïßèQW&ñÞOKÑ9¢¢§–ÇÉ-º´íâ‰jðV)U*€VA+**¦Í’mnÌ¶äÏiIñù~yoB[n\’¢;™æ>‰{*êÚ9zËõ(1ÒÊÈð'9g¦æd×ïæyUBƒ—·¡WTÕu4µ1[N½Uè®LØ?]]Ø÷Ô9'39nÊÚE·,#üÜ<E%OÉÑù™¸HqtO˜ÿë#îÜþ!†Ö9ì¼~2 ÊŽä:mt&CÂ$L»ÍI èOø§RÌ.ªœJt(¼DµÈ8RôÖH«Û>ý<®ÀÒþeí@º¥²ø f_dfª¼ãËìÑŽ/¹qGl“‡–ŠÌEö_¥û"Î)=¦bh"FÅ}Æ.ªDn(;ìðR‡™i—g]éAoŠ$¨ÔIY7?›eE
8Öy×ÕªåS$÷DÒª×j²E•Î=Î–Ý4@}T¢·—þÛÔ1ù·.nÁh`–ê'B×ëRB±IeFc¶"\†¿Ú)ír‚1òÈuõÑ8Ä‚Ì™Ç9ht; Ì‰f2ò= Ì9_É?ík¦Êwáh^Â&ø—OŽ»âñ,ôO}-gGnä^—$þªQk!%TSË•éž ÷©à
\xê”CåE‰º$:Žz`=»þß	Ë­¡g¼­žö8+ÎÜié™m§ž7yæ´ÀÜYó”ôÐñº5áÍŠ{ýÒÒÛÎÄm}]Úyæ5¬´Ù-Ìê§ê†Éæü‚õ©^«ZÅ«£à6ì2Û²&]8FÝ~£ÆC¯>]¥::ƒ.ó rÚDß5D2yE6×ÂA·ÞAäušüBQFÜq¾Hv+¹žPý!U•.g
YO1J}ºs7ò4ghÆPMu›e*“˜ÊØ±ÒÞ'þ$­T:Fár*JkVÒššá^PÓìÆUÎ¯ñ¯­‘Þ˜€(QUS1MÍšÀHI¦*85{Ë*¯˜{ø«pˆ¬p>Ä¿’,pœ…’|SÄBÍŽÇ»¹u
îowtbAwîê*&‡œè¾™§XAP‰êño<ÊÇ?v¢Œ-§æ³RÐèñolÂWph¹N-…Š½0L[ï°a7É½mM²ƒm¸øXy¸—¼Ú;jÃ@Úwoc¶¯õžxžAQ¿
ióåÎ†-^¡.Gi‰ïsØØìûHÔ‡mPŒõ’w—´(Ÿ`„'Kðo@ÏoùéFÓ_Mê´¥6vI§s°w× ’%-óê¼é©ñjpYW•üŒþˆå4ÍX£TêeâÐtHàö4u­pÒ<¿¶s{aé·wnÞºvãÖµÛÿºœ6‡qÅaº½‚.w5#…¶y©CªÝñ°P¥d™šI<þ%zZ¡L*4Æaê¦…áØäÊYE¼*ô‘³‹Æd0Z¯Èßmtøª9=TEÃSò?ûZ†@KÇ)é¡†Ùær³ë·j¹îF?]YÑ¼£²ûy0åÎÛ^}•ùy&iz6/õŒüZÁZ¦õ‘1ð<hµ‹:fšƒöSzÝ®Õxõ9û« Ý ƒõêÄÀ,
Ð-cƒn#‚@Þ¥q4XÏéè,)øÓ&»2ÀÀcV¾²¹ú­:Vå‰Rê-Mü8£¬ª×§Ë÷r3šW³ÇUTíáßØ¥ëášW?ÑA51‚×ñìÿÊ2#PUk4ø¹ø¸®þÈø ÖÉúÀ[å–:£‡x†ßñšÍæÖ„×AS#Þ.ˆ![u†ø+ôÉRÙôÚ•r¯ëÙHÌ˜çµæg„hÁj¸]2‰<e¸vRW¥‰*GÉ3á¨Kè2Nsú%>¥¥º*mW\ôdt¸Æ^03Ž¾W7}ì‰¼Wœ Ç
îÞÈþ¾VS_¡ûàÕw½yå?$}yN2·I¾ß­H÷¢õá¦†œ½\j²(ñÖÆk‰ü6õ–Ø‹C´ÔOÖ¡<°¼ Š|BGˆ×ô­eÿ?~7Ð•¼Ü¡€Ùà—oÐ†
MÃ9å5)RÖ~7®z"?Á 3_º^ë§Ws=é®WÏ±ù7šÐÔÇ õçÜÌ\h¹nÞƒbªµm–ý¬*ý f²ÑgYW[£’‰ñ›¸¹A,–èãÕ‘ÚŒJªWïløƒA õj”þì)s”®Uo Ýx*}Aaqµ•1IF«ï-(YªkË}Î ª»Õ›ïI[h	Ì’Ì{+XkãZá üô5¦=¾[±ÝWºOn®íQ™û2›ãœNœÙ2•‹¶1º-€GÙ#?”dE¾<eÞN˜2Ý¡“ëñí””P†±è1÷Éj;V²Š+Qy¡BÊÚ-8Fsxu;â	eµRh×uËùMÍµ¸U¥È_ÏmK1þ¢Ésæ]9Gòqç¥Êo…­?cˆ†ø©­L-x±ƒK’;ý=Dõäz Õ,EË§_º)¶+¹hØÝ`¾{[x%Lþè'Î<?ÿ3ã ÃØ z$€txŽ½éù•ãÑ7$}¯$æàö˜¥ŠÄÒ7Ë‡tÄÈ˜#ßùZM˜~5þJN”iÃfj'tÍÏ«­•_¶œ<°G÷e*![Ýi–Eá|*n²’ÒK!™”ï‡˜È±\‹¦KŸ#7«0)ç¾ßI‘É|‘}c¬í#ÍÄ¡7Ï‚(i¾¥À&-¬ï¡˜^ä)Â2·~dÜh0M¼æFóÚNÇ`&œ×Ã?è„~/AÛSo]+uŠŒLÆ«ÙÚ®ðX`içOå\ô±ì G™Fñˆ¡]6C×Mà!ÝÐö0ÏBÒô;¿0á…pRm{Rë=¡~^%!Þ«=á½ö‚Ë~w¾z)Ðˆ§÷p=RV$þL¡B»né_A¨bá= •¿
–ÿ	¼ÃŒÜ/mpA¹÷Ïõ$€þµ?èMh9­½Eð¸fIÃâ“€÷¿3·¼:¦¶¥ëâè«ºfoîg7µ¯ÖøpÚ^èc²’† þvÌcH‡ú¾šÉO½Ë½xÊ‹9Ìùùÿ)“îŸgüXíÕ§[Ü>zðÇýÇ6ªƒ­aˆx¾ùXÃ¸¬Ã›±óçc{EdÍºE½Àpo¯{mÏl\‚A‹œ‰î5i€»Õ¤ßlŠH×W=•Yí}Œ9±]-ŒíªÒµ…¶Ø{MÄÚU/Ük"6ñbçrèé,4N3—w=N¶á²Þ‘™L¢8·Á\€]w„äÙ,¤N d~§žèåz`ÎhÐD‡…ÉÂ‘ÄÅ´s6rT}w®ìIŒ[/m0ñ™<#:ŽzºÉäé/uZÁª)zþ	¿ñ
™`Î†Týè\s¹¹¬_Î
):ÄÁEêèÉ!JäsWã_éÜcÎ–š¶²vewro­Æq¤ˆ(Š¤³ÂY#ŽA›å¡\%—silm•2Úy‡9³Š$Ê‹a3|³„W™$¡”Ôÿ™¡áƒª?÷<î£#œ8dÚ\t¸²áÇ)œ%ƒzmÕ«Avîf2ÚYž„š÷`nÀ°Ô®–›
!âyÚyTÑŸvªœy±ÌT(9Eà ¥nzÎÜÅä.s„#lð9kæÍ|7ŒÒÙÜ3˜~ÐÙÇÜ`¦ J˜³ÏAàxp„™—½ò³mÅ-vcrn†Ç¼ó<æ½´(ŽÒà¯%Ù7¨¿[A2Œ`îïWðY8ÆÞfØM7ækÀVó6óçO%A_ØD±7Ø…Ë~Lõ¼®Ÿúól4—·ooƒ]¯ïÇëá`~gÓ_´½éÖË€Á~bŒ¶Üx‚g£o{3-o·ÔãñÂè.Hàôók#Ñè^€kÐc{¾6ëHdš†¿7¿Cwy±ùÚO×¦×æÖÎUÉ§ð/[aRjÕÀqÿÎC5´™W	õBÞ±C«z	D†8‹áIñ§§ÎÌÍà*XÅ°¡×£¸ï§)æT¬ÃÑƒü«¨izfß$£UÀ #1¶gz¦áôjÍ&.qøZÖY9ªþQåù½^´y5è„}À¹Ä¼cÄÓ®Wèæ6œUÓpXŠ8×¥xÛ`ºauUÌÚxWÁ:ñ×+Q/Š²ÖÚô™¿’5—‰²æìì©é¹¹1jÞò»á(ªèU\©^Gôµ¶¶V©‚Â~mz¦b'À¾ØõVP	oc¨R÷†…^¸NuèFÚÒJˆ}Í$tÔŽ5ÅòÝ×vØ±[	§uîNZ¯_'ÏMV±áMyuƒçÒµ|Nƒ­Vc÷g»âø\¸+I©»¶rô…ìRq¨æhãpwéÅDó;Ë§'<øX½­•
Ná:#fšXñö„‚±UxÉ©ï¼ÿˆÔ=w;ðsoÂ†`Ë§<¿CÍ6‰+ŒÝ——}N’ÊBšÅ¶ST®ÈlËÛ¹¥Íˆ‚•vs¬¾y0R(-¤2Æf‚¹Ìïœš+‡'¥ªÂ™
†~—²ÿ¢&r~göÂŽ_áÃàû!^ ”ÿÚÇþkËƒÞµMÐº~µ[öpû×›Áz0è–ŽÝW†A,×˜µiœ5Á8nãÁ v^}„,w'•ÏÁ¼Æ¥ÝœëïÆD­ôò=¨ÈÉq”Ëo«l7+NíW¤Qå‰Úìà\4ƒIþN«O5sÛ‰,o3å±"î\R†£]ÆF³¯>dj4xM1™;sõÊ“ZïÊ.‘š\E€T´u£Åˆe€Èê°½ÈD¼ ^3°19}ZeÌÜ¦ûr§6»wJö_Z‹(§ý¸Ã’òÓÆ[m­Ý bEVë
4©!ÎÜ·¡2–¯U.p…es"ç,*h*Ü1³iw˜LRz(v»§©e"p]Á	ÍÝT?D· @ûÂâ9vûz­u‡ÎÅ:4ÛNµ¿ÀVÖ~ñ÷<±-w%ç¯c\Å3MÝŽ,|ê0§\y›63‡ê±ŸÂšR‡Þô‚‡|í¡øðóä£b˜—žÞa,ÍÙü-“e6±Wd<ûä±Y(s}HÊ­”¤ííá0­j¥¬ä?])“èØ¶ÊÊ+¢RÖÉÊÆÊR™‘î‚"Ü¾"‹Áó¶wa5÷òy)5r&îGa'x+Hã°“ kî±ãÄ-€b÷g¦VËÚ)ÕcAÀPZ5d­ÀdváV³šùä˜5NRÀã7œÙP1ƒ‡ìû5žeÌgOø†"|áê@Ñ/pûh-)¡Ùl	µ¾²œ‘Å´Ñù±’FçÇAš
YãÀG§Öð‘iâˆ‰ùŽjjÅÄ5&+O£Ôï©[ëJÇi{Cû\Qÿ,4Ð•Ù˜…dÔïûñöåmæ‹¹zr
Êªî«ß[Ã}÷!´Ücë¹«ÅÝíÔ¿§©jA“îÐ¥C_G×¥WÑ¦WÔ§¡Q?ŒNý¨Zõ£èÕ¯Y?„nýpÚõÃé×¥a¯.\QË^ml•Vh¥¦0Þ]
úÇHCƒßØ-Uð»¶.S7«ð¯PÛÓL¤”¤,åæ†ü4k{¨ÎM…‚¥&Œ
FŒêfŒWfÈøžMU,;•Ìc[-*YáHËEFÇrxËÅál†ª¤ºõ¢‚Jàˆ‘ðyV¼Êl ýbÿk©±”¦Œ‚ìU‡1eX‘}³fn³ÒK*Ü‘éÇr·Ö‰KW¥ÔÚz©±€ùµbËLUùt¥”rf¼©LaÇ·‹aý°ËCàŠÂ•ÆöÏwæÞ¸·í0½ð<¬GÀ¬ÈìêÂ*<¼b7•pš 9^•‘…¯­,‡µ…V‘Í÷hù]hå‰^­ØM%´F,ÕìÑÑZn¸Í~pG/#œmjªe-7Ý#;j§øb€ÿŠû£Çrb¦+ÄQzˆ¥÷F~ü£Ž sQ¨N”Ç6VE(¡p`8úmû¥qPÖ—þ°˜Ö¯î,twY&5ó+Uv%²Õ+‰iûÿ  ÿÿì}ërÇ•æ«”Ü`#LÜ^`Zš¤m­eKcR3ã`(Äº ´Õ7u7x"E@4­	ÇÆ:öÇÎ›#ñbŠIQô$¿zÙGØ<'ïYy«êØÙ‹èêî¬¬Ì“ç~¾Ã>~ùjÚ øDñÃCeúFdá»áµ	QSœMêÅÔ6±zL5*‰}02ÔKû^ÛfP Ç1Óz‘T@ÕÏ½[¼%àÄQº5`£1Ò@Ôð"ëÝò¼øÅU½y¹ÈÁ—hKC'‚·8K>}]K`¾"j	|:Ìâ¸Ïëê‚à¯_Wð×­.ˆ˜Ÿà °¡ˆ€…¯—
D^W2|%CØoÔ‚kÁ53)ÐŠ—‡/Œ\u¸Qý=ÌZç×%Õ¯…}í‡°ˆåAþGeZÙ³ìú0F5%B'ŽÉŠjçù#É<¯v.>>¢”ÝPÆ_]8‘M/—?²Úø©ôÊ{>¶ÖKÀv¥ïr©!šFÄ(ùòºæÙâºK5rõ?¾—ÖTy#šêïyY(Èj…ÿ¦€Ã’™,&./°s{}ECÅd™¨ÁùÕÀ«±K_­ƒÚ’!.ƒ‹h-· µæ»ÖZ'ëv‡³›—\KßèT› ‹ì%?K´ËUÞ’ú…ÆD¸ð˜Ú¼×ˆxCÏÞQúK£Pñ{;-Ònž”üLê“½/Íå<]™=	¬9.ç®c‡
ß)Ñßi¶76 ‘ÀŸ·5ØÚçeû!¹ž5î%T¹š„ (À	³8øÍpPO ÔÞ6›',€ds<•º0ÓôÄL	`:‚—±lË_ZHyvÖ£ù=Åþ0W‘`årJí©)ê½L:ÓrÀE±ÉºÙÃùz§ÃzÔ"h?°÷G<í
‰ÙH1b
ù#ËY±t‹N³QÜmÄ’V`yÀ.¶QÛ»íƒ .‘!ÂG!¨ýh™oêJÉ÷˜ˆÁ ¥w ú›,8­pÁG¿n²,P.wZMè4¬5¯ñÅAÜœÔ8œ\9ve4xHÌ=og6Ú—›$''‰s­û^³W«³†`®>7ôW²	óI6ÂR2íú	m“è+Ý¸ÞØæ©xÞÇœÁœ$Æ·‹™;u<²KM,Ç…:ZsâÊUˆ'f†[½X¬Õ^¨eDSÄ"ý-¢³eÐ« žsàêw¡è‡z4¨jÐ ’6â˜µ5¨”8ì.s,÷¯Ìw®ÔöÅûë°‡ÒÕË(Ñï÷IrXÞópÀEU‘ijAEKN8²¼=;Wa"xóº`Ns„^°š»4óL‚žPdýˆòpkCâe£áðrt¯a:ÜŸü½ØX…<5äÉQ›’Ó«ÖÐQ-MJ<RŒÊ·Nå[Mj£^Òô¨þ=B{,Ü“.w+(]ÈoˆêØÛ—àfR¥­*v‰¢›£¨xáôùß|ðîïßzç÷o]øÃÅžF¼¿Íßm£ü²dÞ„ƒ}ºÒuUäÙÓ¾†ì.ÓIÀGÕdyó$Ï%³±/ÃØ¸ŠÀBº«îFÌ®¯SP?ýVŽrLËoÜfPŸ¾‘¸Û£)”Ê·Ã¨ð'‡ØâÖ8:ª	Mh×D™Ï7W{
œì^ð¸ÿx²œo¥·‚“²dÃ³»†m¢¡ˆì*¤÷žÛ÷\èHË} 7€ÛÂ¥¢óé}&hÀÌZg=—ÊXZ4rlôbrÚZ8e"Ë™W~S² ‰¼²½Ò"ÚÊÚd—¬JÖó¬¦y=I&ìšõ°]c³chçXÚ¢³LNú¤Ç‘ÿh
q0RcÌAw–ÐÝ›g©Û
Zvu3»’ f°>Y%ÿŒO®eTS@õrÝƒÖ“ØFïµÞn­¤õ.ž§ˆäcigâô9bm&2±u¢\t×[ÞÈÎ{M¨öÆ(½*àZÚÍ~×"O¼U”«„n`ë	µ>ÙCpý?ùkojù¦Ój5Bw.×¦tC°MK–N&³ ˆä4+kÓ1lVÊÈ\§*Y‹èÎ‰“<ÁT—ô%F¤Mjä„·®?¨ñÎÝv<HQÏ¼’¦¿“…®ò"RUÐØ3 Kû_f©H]=¬ó4¾A<"°Æó’²-)#<€ƒIJs/ã=k!¯šRˆÇ<j±N´ýv mmå%1Ñ¹ikzàö	ÑöÒ	ìxrÌôôóç;e³ÈhP'ª.ä ¥c´(ÆÄ´l-L²˜ä u÷ŽîÛLX¾(_CIDÓ¨ËK†5°Ú]'Í«UÂ®pnñÙžçØ£•¹°aã˜@Ñwr®ÿ`Ü2¢)	Ã[fUí°O?h5qµU¯µÆl~K=j¡j«öÎ33âü#¾pB^l§ð.cˆ-™®mdÎâ:£ jœäs,Ÿ:xÐCÍ§¡Cr7?m'¦„EUjgA·HŽåBóè–äiK0vÚ!÷5½PŠ®Â3×&Ys¬[c¤7?D‡ÐŽõyŠƒo~5«gk)ìÓèì¾:§Þ~Ñ;¼í„å|/÷
@µC'LìÛƒ§€FÖhÎÞÓÙŒø®_ ¿Øôíþ×{Ÿ²,L²Ï ï<Ývï.ÇgTEñO‡/ß%§\¹¸VYeÆäÍ‚r±ãúrû’f½Ý²s1Bb`ßxé’-“pv ¯<ª‰h¿‰~gá^‡†ñ„É;„À.aÛˆ%ß  v›þr^zi9Ÿ®°yDØ
t¬l²Š¯1¨NZ§ÝáÉŸ«YL‹·ªô-£ØÚ¿¥¬Í°R·É§½tm³bèâ^l¶zÔT€gÎgë‰ü¶UMëŠB3æù'¯ œfgñ2Rg<rV5SóìR¤(á%Á6]‘~I¾[ßˆP>àÕÿÛ–`BÓS¤Ç›42tÛ‰µå]ˆâ²V®Çºæ™Ó[®ÏÓP§qˆàyºsÎWTmNŒ1®_¥dm;@ÌJ–æfgPçUuæ6Êx¯›uºqMi¼7ˆ¨”:X•„2š	HFR¤b.)z)™ ]"|!Â	I¤´²Oqý]„‹hÅtiNÆBÆÀ-bž¥Œ|±v9“ÍjÖkÕ*¤š‘±ÛEâ0›—Òån«¾n‰V{bšÖN@²í,/ˆ9Dž‡0<¤ÒÃ’ÿ&{X+j˜>«&¿«òGþmïŒ.@m¸ŸNâ%{·•–ízT‹`VFñ\]Þ[¦d;‡|ROÙ!ë¢)Â]Ñô"WÌ Ÿåfô®=‘bkòM2ùDn‚ÄçB]>ì-[ /:qæÞ‚lˆÚžV-ÊÐ 5P­Õ0Í~2…Å2gÃyªµi2È“½ÜÌ|H•Æˆ>LÖ¡-½˜T°è–j^\À6®AÌ‹[,ô >h©D÷+¡ògiB
ð´¡’ìKÛbcE«å‹]fÝ``‚‘À7k=ÂBW‚{Ã§b^lÇI?6á,{ Ø£ÚRWTC¦ÁD_%óµ¥ñÄ|^Ô­SõL&Ðxf(ìÞfª5ÔH:9ªÛAùjÍ("4$L éÑ	›@ô".´œ¿¡¶57¢}ØUÑ©ÌD“““+±»nš¼YµÖîV»tž4ïÞZ¥Õá°¶öÖõ«uàýOqX¡0‹ô‹tëÙÂOÖhI¼ƒÚTžÂþÜ}­a/Ä¢Ù >wcÐ<œíÂ¾Ã˜L‹µ4‚É°®°àÎÂÌoi¢ÌÛIžÆ þvô;÷ŸôŸ?'‘†«ß{ïF0ê9"UøSrœîœºµ²ÑW;ø0&;­:oRQmÔšN2UÆ? ¦JH¥kº˜Èct]+Èlå |Ô¡s\«uvLá¸6w^àVçÂ®ÐÌ€UFçˆð™ÕR“¢ù9Ô¯Þîÿ V˜Gn»1Rü¤Ë¸BNÍ ´Œ(ŒÒnŠI:1hò¢Çð)–þ­¨å%<â	°þw2A»äÝ—|#î¡Óo‡¦”?`)å_²~±KS8…$ƒÞ•¡Ž¨n'7¤lRž°3˜Ò
¨ncc[Lb=m®‘Q*Y$ƒ e­+]r“	Ã—Ë&{ig-ëÑ>Ã¬B“hðÐ‘üd‚¬'WkÍjeæ²Â3ºàfƒBÖ™:äxÄÓˆç©× øy’ýa†:ö$ý^Ô¼T¦ñåÔYØÔ#qß6·~×+¶ùÔF§·h<\CúTTe?ºfñJ©KîºG.>æb<¶ñ®àï0Æ–ÿMöú,€EÕj·[M1˜ö4ü#| <¾P•W&?íB”1~Ò˜9nÜ£‰§ â÷1Rs+Éêä8Ä®f QŠ±CÜ‡()ÔpTOwÅiHÄ)oƒÁ¿•îb.©^†’„´oä7Z=lGß$?4;j©ÕF5€2Ý1Ð/	Å?Jt–¯	ãô]LT8ÐääÒ'ìîAf¨Ä{ø”À ø=ýH‡[Éx‹ðo‰ûPk—¦(E”wy¿%¶ÕRÅ·cŸ…¯æŠb¸¨üuiÃÑe—¼Î:VùzÅNé]°æúO•(
Ckð5æ0Ò°ÛA¿WV5WtzÔ‰ÉUÄq‡½ÖloÏ:”rÑùŒaƒ+RÃ`LÅÓÅ¨ð‰ÀzÞ©çÀHQŒQcq•ÕáI"®ü¾j´(c¢s#ÉD	×üÊ@_8É
£pˆd«š¯é&/@õ~É’£BJgR
t,íÿm"`w÷n‘´ø=^“×~“×·{ŸÀÿúY­Ú#BlÛ‘NÕý¤5Õô4ƒðt×«FvCÈ£jÕÐê‡D•ÏŒêïBàr¨ž;›ko§W®Š!”¯Æ6ÑžDÜçÕ#øäZ3èð¦“(G™÷mæØÂü0=pÊø¯þ´Y® uTÑîkÎã„ÁÚ»§µ3t1€Ož¤úêÑvòb©àdáí"ÞDiøÒ¾0ÝÉÐ"'=€ao‡!…OvÛõZ¯røÂáñ‹ÓÁ&pE80½÷«G¡¹¯HÖÆ–4ÛÛÒ’ÆGÝ1yfe’ÌÈ7O6“ºTÐ†ê?A9ÔübZTz0GgÒ´ù.[ÇÆÎ!…B±mÅÕº§ÛíNërFd=ösÇÐ­ùníNv¹–]	¤»ùcë¶Ôâ|-EâÖ»‡TH›"o˜Ayê!â½MÌ“[ýÇÓ"²Òö•+ªÕÒÎ:Z·IÃoN Ñ;««5È/>ÛZéš&¤oþ&»¦fpŽ+$ÌÑê¶Lm8kÃ²Nï‚zÏ5å)«2©€å«öï!í<mþOY>Ÿ#¤dÉ,fe±¬ÈËr?]àÀ²[¥Ýì÷Ùªž€æ»‡H®	sw"Cßn­-&gÅØä-™K0ÿ§FÃÉfëJe<˜½Dˆ•0DoÆÎ¾ý«‰±ägÊ¯‰ø–²é&Ž†‡PËn/m´uM€B‡ê°¡áÑxp‰oÇ›ü/–Ö‚hæ? šÄ¡—Ã9[‚*¸ã@ÒÕ›òo‘nVxüµ¬™u`ü_\[Ì¹>ü?ÞŠ"NJ]BéŸG@DUUbé¾–Kuu+lÔ @K/“mluÒµ¬2¶Zë4>7þ N °‰¸¡È·OoTk½ÓØV³2væ÷çN_8‡`€n@2ŠHþzLù$äƒK˜£¯|
µ›
GUS°n*üëÐ&ñ¤A[ÉÞuîØàÙ¾â»”6·.ñÇ%\a°³ŸÊ’ ;Pô ;þ e_·QnnÂ„_ˆ=‘B“g¿¼„ÛGÐv¡ÑÈÔ¦(édŽþ(ÅK¼ÚC¢„ÿÄA $IN[¡%2º¦×¿Ú»Þÿ~ï³PxÐ‰òÐWxÔû|V‘×&^‘–§ ËR¨Î(À ™'ö?®JÙŒOa…iþ’§Ê|<¿A±O¼f]/]®gƒ˜"Cì_i›<k‘8)ãÒR—	Ñ':©úæ°ž¥Õ`2_¯ã¬ªäÅo1½czëZU3€Ñç1€OU(€g»·>ÌñçŽr¤†}'-ièC;’k‡ÿÛ{¥y<àËJó( 3™Æ‡zsèp¼"ÝßbF'ßñ4‹fßSýRo¹U½ÌJÕ@š™JT¬ 0¼I‡f®ÖQ•Ñ‚xU©á(XÐüáµ†»T}«@ÌY:v
§Â•ˆ-²TAîà¿…½„ÝG(ƒßˆÈÄÁçíê¶Èîc*­Ãš¿bÇkñ#ŠŒ•±âjZù«dm+1»ßâZ€2l0û[uj‚éoY÷¨¢/í^6ÃJïÕå.¿%¦÷(X^F_ù za+À2Wëën¾Ä°&Èïà™!æÑ\ÊÍSÔGåü¥.l)/Õ3Nc‘a¤Q¦2ÓèbjÄä­JVêCQþÒØŒ†<eAØðâj„ZJòo-©4”vNÜqŒ/)„Šœûm
ÿn[«1¾n/üeê'±­ò”y„§A¿Vf}¾6On.lé„rÜÓR/ãˆ
?5ÃÏ‘@† Ï”‚è8ÄÅ…Bò0è1¡£?ÈMÖò=¡%7HÊúÕjñ'ÁYA×õ´1ñ´©%0µCp+%ÁVn‘;ÜCãVxs¿Ó}"Å&¥Í“wáÛÛ!Öí NQYhªÄ,¦•É9Ê¥9jaŒ–}*•±”¦]X@XFî'SÚ®€]-c}{·G ­ØÀ¿ÃKoC–Hi×É.­“5Î:'¡’ïˆ™(+Ú¼w>¡’X~¿ÿ9•$_ÓØÅ.…N‡«|å!’üâ3øÞÍ½?‘É†4‹—<‹%9Ø#€¼|D‚ÍºGxÄ—{·	½?#Û€^¤½Ô'“[q¢_i¾D>ý,ò8À­ÓN–†È¼ÓºÒE¥ài8Cž‘cXí<°A=ý;€ƒÀ;ýçœßðßûô)rkÐ¶ ½ÓÎÞ§	K„ >ÿgÓ6ã–ºþd»vÑgú-œhû»÷yƒúø]<xÆYð$Ð7ªh`9)?ñs56ÒIc-ÚÞ->ôÿŠ¤f]‡üR%¸m(ˆÈ|Ì‚äBqÛß]ô¦-ániFaA‰)Ô¡½qhq¼þ3!k‹²üÔ¬§-ˆyq˜é!³7'‹n<éˆ	4»cgl¶Ä¬jL0L›»T§Ñ•Y }ßôÙ9¤çZQ>\]>5øvŠß‰i“	ÓësÝ9_Óœ¥€ˆ©=Ìjé×iw;]æÀé’lÒ6×‰û-¶Ks=´µÚ×K4²/-À¹‡í¨]4‰ K¢j0);bò)ÄÅhçú¯ˆ ¼§6ÕùT†Ð£Âú%ËŸáq›‹2××©ñE?<ã!˜¯0dý7øÊ-ÔËË}ô$þ4vê}ŠiB€Z÷¼y„ëô7TÁi’Ÿ4‚òåWL'p	Áú|€~Ž.¿‰·™˜µØzë
PÖù^Úë¾Ó<›5ÒfµòF×vÙ©…©Ý\ÝvTÕäêÄÜ¤@®Fdjº	s{Z<ä–ÊÖ9{ô's@_kg=¸€4›(€As~Ïíb";ºk+c¢|.ˆ+ê,æÝ÷³÷>ƒ÷KúƒüX4ò.Br 0y~naƒT¥½Ö¤Ø».‡³‹±mZ·†lÀÒ¹kÙ;««š›™,\Ö®¹žyû)çðcêƒÚŽ˜ò@˜l©®ÿ$|<ÇMò-Dx³iE“/š´€F{®Çã65«Rï#>—àó6ÿ°Ë›RbÆÙï#˜#¬¥dæºèìg^ŽÓ®^N›+Yõ—øŒ]ÊçŒ‹/—3fäqV#@cC'';l›Ç	VãqÁûy³*P¾þ€ 7¤² ±bÜlé|½FæÜýu«Sû7²i=&LFYŸ„¢³øyÇfºí¬ØNŸ!äÕKN…BVùæ&@®ëÄè»Bþo5Ø[»ò+š±F#
wRØŽÏè³<†Ûˆõ¯ˆ¶?ŽÝ:!¼œÊ¶Ç É:a©[ÔßO}þruÂ¡ëÙÙ¬ºÑ&m#7ýmÚÜHëaþâ0¥ftsÝæš£}_„™?§ño2ú€*\*ì
gÖœa`%è‹Ïµô„%îíRû7å>(,·Õ˜ØÆ}zRüÔ¶ÓÎ‡õ¬«@››¶ŽÐ÷<]ùè9vÏ ±¬êÞ=wu%«S7x"˜³'¦J^zò·èŠifŠ\É¥Ž×â–!¢q®;$%œow²´Ú]Ï2½woBè:Z‡Àç\}ß‚V;kâªÿK­·Ž¹ëôÞ@ÑÐÒ5zè]m™Kì‡”ÕÎÝ£¶‘§]æ’Û„\“ÒDÑ³¤Ÿ„·¶ÝwöLæ>7`·k¹¯ZØÕvßÞÒ®ƒGæ¸#û²¯ÙžµNZð®‰^kb¹“¬vZÙÁëÄtr¹–rm«5Ñ%kÉÚÜÍ+ÇK´€NÒf­Û]k&«iÿ­nth^Ô¬Óe>°11sÄ#NÇô»›ÑyïBEÇë'ˆæs"Jó¹Zw6Ä’ÏRW}xÇ½‰S¡öE¡Èe‘æ›´O,?.»|NízièÚ¬ÒÀ´h*­+¹ã3êèç]Ä<‹x!M á¦¸Ï<ÈôwÈ\Çè(„	„06ýþ3ŒÖQ%F¾¡Å,eàú?Œ£a[[úT7ÕÖ>áqLçÚÎ\­{‰* œ@J
°ÓE2Ó^§Õ\s¨Q'¦E:¿í¢7á`§ˆÇæ#]Ý!{!$ÕáëEØo0:¬ÄÛ
„nÝ¶Ù#ÈðÎD÷e“®@î“Ü Âµ/ïÙÖ=yóT+7óì?xçVxªíÐÜs»6å%…9Ü¤é”¶H6Øì€›\Ý‡Q	UºíDnÖlÒmh¼ZÛô£\ÐEÕ-À­œëkl…uS{œ"- p@&°á¯Y?÷DŸUÙÊF§ÛêL´[5S¼J%Au~y\^´ŸÎ…IÅ|@[Ñgk|Ã/âcÒ¿Q-î(Ó]e¹¬‡¡³ÈÝ·p{Ç<\ÑÙGV
šE‘%&->ÓD<!~Yš¿Œñ¢I6ðÖ%‚oP«dM¹ù¬‘YùßÀ,Ü1¤WÀcï7Š;pB”(Í¤c ®‹˜%÷Ç0d!H{1÷¹GòØÑ3¦q¼´òÜS?µ1þ!2eÈ¼¿‚[óûyÖDyã°ÚŒ #ÌƒoGÆv4o™:Bü9es´ÔÁ'JTCœèæ
×°~ÑÉÒÉÞ7'»äíF÷·iû¢9êûl8]Œ/ˆµžk-<$ñÁç™f¹‡9ÆVA4bb;džë=L†ÌçÁÞgØ¿ÃÂb”OGƒÁ(Š‘Þè±3ù™CzãçÃ”Þ|@Ez3GÍˆpƒlÇ”ÎØÊMä¯÷‘—DO1š(#±= ±ÆAè¥£|eþÆ-Ÿ¡ÙqŸZ? º52{áô¬:‹üt4Š2¡†ÒÞè´ë.Ž¢|hg)ìCä)rDÉTØµ‘RUtš°Z6k»ž"~¾ŸZJôãU9ä((–'`SÖx‹¤SªœÜBø5Ax²'#cÑ\RV©ñ}ÿ‰…¡ä¾2\%7«Ö"[€»’ÝŒ%˜H_ñ|E˜O@®b¥Û±¥3—œÅøÝþñ”‚3Œå+¹a€¹¸E8›ÍÇüÀÕˆÖC~vWäô¸ìˆp™m0Èön!R£Mc‘ŸŽoQ'ÁV:™Ë»Â?±³øtˆ…'Ù	\!fbí”Â”Q~LaýWÃ÷OC‰›"g#¾”»JPu‘÷¢Üe<ùYþ[þ_ß~*B–…‚•Ñ˜\8jÛM"ÓÎ¬äÿ×#-+ÏGî(”©–Q$D#§ÐÖÌÅà±(l²„¿ü
ßWt'Ò¥´7Ç£R
ôÄœ/¯PKß`ldöjW$š¸CÙƒ¦’ÌæRI4˜ŠB1t#v®G_!AÍ™qéÏõx;½–uM)3>%ë¤b‰E´ß"Dñ%T5bþÜÖº÷sþKÀI¼Ý*/ì@%fÿëqƒðº£4‘BîyºŒº>çˆÛ½‘‹ìù@yÂA}—ŽàˆlúKÌƒ¡2])b2ÎTªÕ\êÄVýÑ¨ú¤°¿ÖŸCB=DÖÏÉ§`ýxIÜMÑ|\r•qßBœKVïJ‡È"rÁ6Ïœ>îƒóNÿêÜy
HÙí­K»)<^¯ÕKë¿luXH^^*®e É¨Túª¶é°ä«8ŠgÄóBØòq7	!¯Esm1™>’¬Öšµî:”˜OûÛékÝóØÇ=«Ê{j¡rrß(´ƒB +æ0&à“Ü.."pl•‡2”yØáøÎ;›—Úf¼
I¡‡MØkºd
-¯ŽO_râÁ¯ê>ƒÏà¨–`]¸T‘¿•dˆ…iS@ºTÅipÔê`ˆ¸»Û ¯ Òm0éÎÜ*Š©ÕlWSµt¼C›:=Z­8!;4)œ…æäôŠ-Yè-[üµ©1Î0šbÜ"A|ðK+kÖ¢×™¤ šíÅr´âŒ€LHÜf.KH.š™:á
2Ç¬¿n,&›\âL22¬-)ûD2Ó7òy¤q£>—‚Ha1Ð–à7ˆÑ Ö¥¦Ï=o[°UÐðe;¡@_#.Ä‹~Õl^WÍŽ‹b5rœÜVÚæE·â†­„¤\?’4±©ô˜¦âªK¾R#úùÊÿû¿ŸÿûX²åF©åƒßéß#6Í÷8®Ü@¿*ÆüËß£Æ|lŒöØçó¨qàé¾Aô»ØZ†g^—óûÿúþ/QCï²,¾eXõšœê7Qã=!KöŒá÷±ióµ~Èîðã|;ç;Jç_ [Ô&oýPÜãyìz»ù!´Z2×[».ç¶gÜ÷©±‘5¶ï+5½'“¬Á;{)
í›‰šI˜¨Í=Gd`3ƒÉ€ƒ0Çœ›9,ƒstÅ6ÀáÜãDØ1–Úx+?7·ÛÚ¬+8L´-úK¯µpiÿ¾b"šèŸÇžOŒ°AÐb(`/”Èe¶ZD4Où²•ø+¶úßj+8ÅÁèŸ€ßbÈqkî0´É;…dHŽG”rž¨ž¥UXÈ³7šPú-tDÐ—ÜâÇ~DñŸáhS³AÕß0&E,L+[š˜316Wüþø|Á5ˆp<¹X“K×
:ë¿ÁrïÅ›G©’}úm:’§˜B¥)Q³èpN6!‰õ©Þü/F?gå½èÒ9ÐXŽ1µü®t+fEÞ#Be…^]BÍëÏï³²—ä“ç4!˜Û‹^JÑ2:»‰ô"ráZ»œÇ[S‡ 4‡×œÛ®Z	ÃmmB?
vÐÂUœÌ,rð­Ü¦*‹]	Y_8ihCnW¬”@Õ>à>ŸÚ2Ä'4TTfUÁ©¯Ùt’Ø,¼Axò‘ŠJîš,¹ŽÔGŠ»/%ˆìþi¶R«i{©Õ	(µ¢kI1ò‰ìùÏþ3ZYà¨;î¤ôÿËW[–ÄŠØZö‹=eÉG¢70˜S} 'Š°ï'€í–Ëø¡×G÷4±	¾>K¹Wá³t×’ùÝ!$­|ø$±ýú9Š*ØwY¢ÃN€,&ç£¾&ßùÔµ—R½<ÄãÕË;„}þƒ»gÒ{Žè*fgÜ‚z¹oŠåk•RýÜŸÕÄ]ß^0yhóå?Û|’P_§–umž½å¾ôŒ$™ì¶:½J%=’,Ón›¿Ãæ}•å‹3ï³¼¾	q5•WCÃRÈ*ÓG’ã/¢·ób¯}„ú2ßê}èðA‚°×un‹ÊO€W\Ž¼ÐÙkÇ´‚w¦B¯LT€—	K}=3ª’KHÑÉ|²Y0"{^…2àUÂ/IDJ‰ÊùZL.,ÙiÕ[
,9ãBÙ`áRÄ ¡xÅD3óN½uòW&rŽ;>ù³­ž2u†\¿\oAŸôu²8NL_ŠìÍÇ°’{íèÄÛ|Y2åÃørÏa…ùÇ££Ì‘6|-dÊ¢=Ú;^
–]$X­h5-¼Žœpã’ <8Ž}ÔŠK¹Æ/™.”NìëS18¨—3¸\ÎpP}n8ZñÅ‘*«DÙzžÐ9È—@voÜbËCÔcvZO¶ÍE÷*¨µ8Q!œvîÆ š{™”acÙÝ)â³édD:]¯Ë²¬ntŠu:Í uVæ¡B¨±:žDT!éUI3ZŸ]›Š‚S˜‰¿oõ ôyåŠÞÌq!ÂôC‚Õ¸×ùá»NQ‰úO‹‡yd\I<1¿žÂæ§-wÇ(Â§?r|;Žþ®29ƒÅ•Ä¸û×¸~Èû„igOÊÂ ¡ÚôÓˆ*j©Yîf ˜L&«ŒPÃxÜßÅV…S	«?¹oVŸ¸ÂùÉÆtU,ÞQÑeÎ)Ú	:q\ËRq¬ŠÛZvn\ê¢Bí™<ëÃh$òûÎc®ùâ¦-£^ï¸8þs²&-Á·+‡1é°ýÏÖ´°\½ÎæYµ¶aê2Ž††ìrk£‡†Òz­ZÍšQI%^‚iµÑv¦k/øS,ïÎYyã-ÜÒÑîˆ=Dïâõ9Zî=ö ¢ ƒ“üM“ÑÙ|‚%.qõõc':y9¯5fi˜8ˆ?þrò"Ä?Së¬Ô³Ùx·²mˆëÂp^ó|•ä5ÿëÏ:£aT€ÉÞƒ0“ï	fRœ—(¬9‰›‘ˆ¢¶Ña$Ø|Wg#SZ¬æ%å*Å¢Táe8 Þ"ýæåø‹âwÍcÜåä1?þŸÿSgúw<îÒ¾<f³²¹Ñ¬}´‘ñÕ/È‚Ì#*Ì…$ÔÛzñŒE+OyYUÂ­ß­5ã•ý™™*üüÔ¦œhµ åxˆQNðš8_>Uåßg©–àl¥K±ñ[µÒ¦ ËÈ‚g?!3D¸Ï@–içÐÌèåd Š] ²­i')µ=4]Žâ4oö¡Žðš{”ãÿóÓ£¢då«]ìÒ:ÿ9ò•zQ²R‡Š5N>ç{«PÁ‹ã€ïW§µ>`Õ1‘g,µvå¹?p¦óòò™%ùç>Pî2¨‘“K~ÍeÜåsÝþpšÿLôü`™x_áß:µæ}xâ<Þ'qæóÃy|ˆõÜ˜\ø>,­ø”åID¦sB›£õw÷ko'|—!p™g{;f´äåd-gR"[ªiçlz­ ‡‘Ï0U§´µ8 vó‡,íÂhäï_³˜’fÐ¶a=c¾Ýq]Z‰¡?FæZ§¨
s­#ôòç)F¸ð÷H¨*OúÈÚÝãÄ Y¾ÿð%e%§;Ö•÷Úg[W
øT\kpP!æV§÷‹k±ìc1I›×4È6ü¹É=^óˆj¶šnÔ{Øëô¦±Ç˜ô åø·{·KèÍìJÖåcßAÂ?*‡È¥?0à„öŸ‚AUF¹!B¹M¨1n€Þá](Ö(sƒ&V*0?À2ø¶ž(1(-È‚Y.·­›=€ýaý«É”™óJk£ÃÖ„5iØÎ9ADõòM çôw¹³‰Ž«þb£VÌÁsß
”%Ô2(x­œ•µÿry;ãC(g°Êå43úKêY*ìXJÙ
8’Jó|dýŒ¦p·¾žÇÊ—3¤É1;	Ç¬@!9³^kwÜ¨Dvr‘â Îõ8ã¬BÀ›êÐ=Ïšš»'¥=(T¶9_VGäÊ²VÜÈ&O[ñYŽ@$sìuøÐè”{GNåbnèBÞ‚V¸ºFF.ùQLUÆro™<iÀQ`eë ØÞÚ¶ÏFmû´–Úz™Ót1‰L6mõË´Ëÿc£:z'|ß¶ší)æ»ö‰Øye-Ù~e˜—ƒÅîU ¡‡/æmWÕã—bÛKc7¼”»Žù†‹æ“²á#µß:ÔêOËebØ¢eÙy=_ë¥Ø|5GäØ{îfƒÇ'‡™s8s=|v,.@âËG¯ûÏ'_,Úbp2xÙd‚Œ·þÔ‰€…B…0ˆ‹T‡v]‰W¿ûM£ct¯yDè'¹Õ"Àµ˜DFƒXË6¢»üÑd¯Sk™ãÿô6÷^ÿ«þ?“±Í¶üÐLîÝü§ÊØHîžÇ'nýMAÈLÏzÒÿNöYÉÏÈ1#lXnºÊÏ‰]ÙüÓ…ë3«As‰ÎŸÄH]A™)\Gï”ñõ—„þ‰õô‹îã® fÒ®{"™yD7ì€(ÒGç›ÕN:“““Jùûq}o%¨÷:!_v:¨ãb0Œ‡Ó­0^õ#T±Õ4¬#R5@o´ß00ý¢±ü<0ÃÑ¨Â‹ZŠ©cf‡9³IÈŒÔiê¨
Ð‡Öç!/®7Ÿ¿?‡§+‡ \ª7kÅ¬/^¸+G¸'G¸¡¯_Þ:øìÈ{îÀ²K|Ø¥u.éñ„#éOj(D§»’BÁáÂ¢`¸ðžeÄ‚*"åAIiÀ1H\
¼(0d	`Eq-(\…Lè¯Y?Þë L~ÿY¼$•sø©Yu	õžK³úÒ‹é¹4šÜÝqÙn‰ÖKÀÚÐ²Ôl¡(»Æ~
æTPÒ¹bÖŽ•=çpQ3òCHoòvƒ]:Ÿ¥•uÎÊ4«7]î¶êd†ØsZ@µÚ¼”Ì#r¡Î-ÕšíWî!ÔR!å:O,Ûì#ýäòÑpLënU'[‡¤á$àñ­½gIëí®y†Ù["ÝæŸ1ãH+×ÓNeœ¥©Œ¢ÝE›¨T ›cJ£†êÉ\4¦'26[ÍÌ>SÇ^n~äMt+àI4UÏV{ôAZmù@`Æ£þü·(D?CÛ€¬í<<-XÏ»OÙÅ$“Ç	±£wà¸öðÄiS:äöï7€ubïçfž~X¼Õ:p‹‰t£×JÈî÷Z‰îJ§U¯/§(†#¨G@&‡}+úSQEø+L½'Š°ç¡èïà-|í&yÃ1Nu&’oŽòUò¬ÍLºM‹fŽ£bJºãy?!œ£Ú•Ùž’Y¦Ë. )“‹Ü”¡ÅÁäÏ¢^aOwÕöä›¢{…u¸e{Â§?!ÿ×iw]sÓ&›«¨gÕ3*Fvö?èsBw:|YiH˜µÝ½ðšYQÔ¯6Z03|½êÔÜ€¨#ÊÌ"ùvñÄjL$Že–î=,|&œÆÎ|b_»Ž}B¤Pvlá3Ü¦{§y6k¤Íjå®í²ÇxŠÀŒvºj©g:¡DšðaZŸ†˜Kç®eï¬®êFý"^Ö®yRú™ã¸À ?ÂÞ•¼uyó\ÊENÐþ‚„7õ¿}•ÊŠ;\äŒL(¿¬,ÂK
.µ÷ªÑEI0Z¯½€7n© ¸ã¸/“²·Š• Nkž÷üH>Ï‘[fÐÎ!ÐodÝì9¢6öö°mŒÙWl‰«­•Ÿr(4å…?¼ËanCp‘¯L,´µ'Ê5õ‰vôø¥8Ðœž>ßÒ§XOqÛS”÷ýä:øH’6zùÌìåãìáciá£”‰ùºùø»øP ùÍKj,VÆai-ê¢Ç‡5â‚*×¨l Þü'èõ
ºüµØ>é¥ËõÌb®7jÍ‰+-ÈvrsYÏÒªÛ6	Í" ÝØÕ|ášwóê^Ç³HD_³ÚCFö„ÅÅ‘ëÞ³4Õ[Â·ÉðF¤ž—Bã±ºMÇ°P>Œ»N˜øÉô€aÞ¨QÍÝHÖ˜0<îKÎ‚YPt‡4°=`ˆÛÌÂIÃQí…KFç‘¹¿ÑîÅîñÉgŽ¿"GÜuü—[Õkê¼·©U³‰k	û#\Ði‹Q5»„=°Z]Ä€SmD)˜€öÄ­“5ÂãÛ~ºW^h)xu-`Ì¡Îüs-»RY¡u^é/	´¸Äå¥EþÜVàö}25©ãrMYÂ¶ÀµCìÖ„0Äíþ?@·Ì+”1qoïX51*P×É:_!ÿšvH$¯ ¶‘ËRßÁ-ž »ß$î‰™µÍþ¹Úê4"Ú
jjI~EaN^08X°M`œÔ¦>¢aV+sè~·š¤hÁmhèuQÐ/ô|„}î:yÅ—Zê°ÂºA¿E>(=#¥ ÌŒ&[í6QŒš½¢³ÈÉZc2šT/75ÄOx^šÔ6K$³ü#”“‚ÛýÉó{ßöŸ-êÅuüuÄ¡êzÚ™üº»É¢6e­‹ÀlW…/Ï0Nò81ÿ
¯¨EÃGÏìŸü5êžþèyÉc‹f2|4[à`
µ” ÷­h`‹VQÞ¾`!DÑIFþxFDÅkä‡¡BÞÓí h]B#\“œV]Ä ‡C±ÚGÏn3ÃWð¿ÑBºt]f@3Q'pQöCÊoæÆ*Û°¦ä¢u¸¬qi‹ÏpÈÓèmtùªÓw”ÃÓ¿¾©n`¨Ãòbdë-MQÄ‰3GPçç”›ÎˆýdøåïRÏ|lOäØ–çâIÒîµæJR‰jà¯NöÑFÖíÍêY/«Ä5ïf+ .bâ±Ú-B‰ÞßLýcG¢†F]y1¹¤gˆ¢†êÉL×¼7\5ë¥µz—(ê¹”»äc%a…ÞQ¨\ì3ñàÐ{ä‡ÌÒ‡Íã9ëvÖiü&»¶Ee°-hÕF.`Š[ÏÛóUÿk"è.hB(r4BV­æj­ÓX,@Rðª·ÖNoTk½Ó8ÊØÙsoŸ»pnìˆ‡dÈ‡—t›Hì5Ù>ú$²P¿©HG·ª›îÞs2>žvûqùbl¢[©´;Ùe\øc’:!*•«xé*’Æ«aìÈÁ·b¶e+b0/R}Euy•õ[3‘]\é‹÷rÍo[è·Zí…NÚ]ŸU²ðÂ²?ŠÝh}º`>§;º¿ìnw4„¬9DÖäy Ör9@ÄÌ˜Ue±­é8Ø†"éÇíjoç\6ƒ3k ãº(ß‚”¥DÏ÷ú’lŽ1\5‘é´nçØYœží¸‰¹ÌôpÞž‚óÊwó;{·´6Ðt ÙYÍôÌªTïîíŸöí.^®zU	6¥†+ªv3¶íj°Ñð§ÓœMIbô¹èÞ#šëÛMS˜ˆØÁœØÀoÉ}g@G†ÛwãjÃj–ï[¿»dp7³ ìÍ	x%ª‚)Ãœô3Ó6Ü$Ì…–l`V6wYš;Ð—,‰aMºI,:]“özLÿq .Øò\;!P{s¹Ój¾­ö”\W5å	ebæ8•ÝÅ^¿„<¾ äð'C9±l•‹r©åErGÛGù£QÉ/ÄRëô¬ù•sž¼ÍB™—ž|Lað<Î˜/<€N‡¹§ƒz rA‚€³>ÂëŸÞ ð§…('ê”:–±Súí˜Æ¼4µ>ëÓh¼
Q¬?É¶ŒCs-æVòL­˜‡É²™žeø•
ú†Ô[çÝDÚ§[åî-BÚSJßårèNþlTMo#zÁŒC95Éº»±üGònË©}yn»¹ÑÍ:ïÛ"ÈM²t¨]{"CÈHWêbìo"vÙê4*›P
ªIóÍH~ùÛV5­WPó~;…Ü›ÇÀÆUÔ«+MË…WôO‹šažzÉ¹j­'¬ÊùÀyW…­—ÖóÔÄÍ®é@„Þ•ãŽ©W.<ë¹›33%XÒD å‹ª4“;öòñÇ‰‡IyÍCêŒZ¨ÜÌ®à­’“‰^ör¦˜®¬÷Þ={š¹²œþ+é›²	]thIú1ö n®¦Vmò'Û'kßpj	gÖŠ™:~+Z®I"ò—r3¸í¢\Ú-(óùº®)]›ÀªÈ3õî‘çXš%Š^ÐÚôêK0‚¡¢C¨hHþ %!è˜üÍÁ%ž äèGí+X/‚%Ø¡	ö•!€º°gžŒ>ð¡§
œùõéßýj˜gß‰á=ùXvU9d]Åñ_À«/€1û.*ðR²²å*ˆ†Î$[Ø¢`À|˜fž„‹œNïCq àôe¹ô$“L4`TëÕì‹”ç9Qõ’µ!&Ðç…Ößm,ÂÕ‰•V½K{É·®&F›ËqqŒ¥e¨ÕHFx,ÉÙsGˆ†¹‘½ïŠÐA‹¢£‘»¸• ÏbqtÌ§ §Ò7°/#?VâeÚ8"tŠFQÍYðxjp<Ìj€×Ð­E¦ø”š'nE³Áˆ2:öã'óù€õx}¤4%£­6zgÉ¹©O˜5áª{}VÒ&øFYk¦Í•ZZ+“Müž³»¢{:8u!hk¶>CYCîzúÜYý¦«¹áànµßö}¡üE«UÏÒæ8åm?<’\>’Ôºày_v ôZ½È?Ü²ù9ip@p¸]Ž8X(@CmüÝ=¼6éäI|^ãoMïáb­Ã/VÒ”eZÅó¦6/²Êb²¤¼jn(W0ç‚:w£
‚ÌÒK"¥`BK@\˜Ã±›“æKCP†Ï–¯xÂ9Èœ»V¨Z—=qÔrh×½è<½÷—.ß o¢qÑÊ…VÚíÙ1>Y®~Ã×ŒOîâ'
LÖÈ:i½Ê[Úñ·Ó¹Œgæ@äß8!‘‚à£Pâ{>½Þîò‹áµÄÏgñÙÊD]¹º®¨£Û\óÄìä°–°6•cz0N¬ç‚§ /tÆç&+
ÐK1Rvdåù"\ŸÑë bÿU$Ô®wu4Qü»ÓºMìÚ©;ÜfäÌª‘œ\3Æ‚^ç¥÷º€Th±idi)ÜÈ±o®8Rœ„ï?ë?”07×‘Ã<æ•–€–ó)²vá!èA,3µÄ[Ê‰!¨AAÖ›–m½My@±‚„Ö9ä†Ûfñ8í3š úÕÿ¥Ö[ÇÃ^áml$c,ÊÀ¶CBE0Có”ÁyŸÄ‹jØ²WÔW·3FË$ÿn}£«x *p˜\§5c4-o*Áí„½£]‡h#ßÇVº'òîA™"{Ø=r’ÈnVáKþ}\'¬Ö¹Öê€IóJíZPŒ–É °bg¢=Ò_@†…IâO90‘b9[’ÿIà#Aæc¼RK î”	þY™>Ñµ§AÕžöæœÛŽŸáV9æ«S§ü˜”Ùihô×ç‡ŸÉMTËõASø7­t!ÂÂYa²"¦(
?&üNQx xJ/w|‚ˆªÙ8‡Çcã#As8sArø.Hq/–àjÍjm­ÅIŽ½9¢có¢d§j!XýŒükâ%<v›XÒc3¹?"ÄÇf/È½÷ ÙóýQ¡ì¬b”øŠ²lÈSæz¯ªó¢aóŒ¾œ%})2ÕM™ÏˆP¥@Ñ•,Šw~;mViçÃá“d4h2
•§9€™ägƒC*ûÕ:\»wèÍÑùVÃfI#ƒî=·{Bz­µµ:Ïœ¯fÇà°æÙ¼aÉ<§|ºRì‚²Û² K·t—B¾`j ù7l¾™NùƒSs¤m£7ˆí¶íÌ„Š‚ŒÙ|±›îöqÏù.ŒÝ‡Yö êQün©›‡‡éFÒ»oY¸Ï(ßÈarèÛ{û.,<°Ú„s<‚²7Ž²’bï: lO{p4m÷:jË…žã»’­Û¡³¥³r^ëTV<-ÿå’õüG×s©*ÌUa"4hD£âÞ€Cø*f ŽCõdÐ |Ú¬5`¡jÍd5­â¿ÕNŠÀ8>`
Ÿ>D>­§ËY=º+0´Æ2¤²´%#’/ ÔpØ‚å0Qmb´P¥|­FÉ±=ù›I­º˜¨apôKØnb1Ñ]'G’Ú
vS—„³•Ý€ÙÀÊðvÓ<·h»ZPp>Â0Rfä²ÚŠÌ)gpñYI3&85‹¢¬ÌÒ¦Øš¡Gç“úmì\ïÝ{²÷'ë<åg…çÈjÎïWõÖræškf´’ö"Ú½µuë663êMÂðþ&Fµîi¬È„àsœ!f­Õ¹¦@¬âHÕýnPDïR ävS
B}Ò:ÔøÏÉ#µºmöç±‰ü.UWÏäWsóUÖ›;À>‚`Õ­±v€FFÇòŠñ¬MM8±OÝõFV"p\²ÝxNKµE2›V)}‘ÔÜah†ÄŽŠÚPp^_AEØÛéx\g$òh#Ù©ˆ¾þp_µ£/ “‹ç†µ#šc¦Û2ç5¢íñ.ï–älÉ“´¯š¶—57Zæ´˜˜ÝôÎWŸ‹ÝŽá†ƒª“Ù[þ|–+LN*^§´²s±-èGf	ÄF½ƒ-%¾‡ŒÈwe{Ì†y\v «‡<ÉDÿ8¥¿/3à.‹ î Žû»Ô:	gb Ü‚ $Æ‘Ì‹e†V’J!ø)<yþbÉõ$êðCHÆæë)ß‡åšûœ-ÅAìQ÷dßæl‡á¡…š§YnÖ<²Š»î‘ên
åíZ·'ô7Sµk!t bÊ®¬g]®=ùt@¥QÀÇ«Ê­ívyBïùÑF¦Ü‰z0åd¯õvëJÖ¤ÞŠC(ig,VŒ¦±\ë´3þ‹“ÖßDÜ“¹gN:(ëú|ìø¼²2Ù$ŒÂpÂ_úCOÖš+õjÖ­à8ããÞ‘jÕßµèHð× #µ×[M6)ü³Ø¯³FZ«Ó_ãŸƒÌ„ïß2^Z­v²n—ŽÇÞÆ³S³sÌ3CÆ5¨Q^¡´bŠ’-—k«IE=Õ¾Ñ¸ã,°ø˜`5í®gUŸfa‡M* —dä|ÌOkÊNãªRÎ$îïmèbÁ_²(„9ì¥¬jø²ÿ0‡½$óã>¥xG˜ü·-s¥BGŽ §Šµôƒ
™¤8ïðv*ô¿ë}5ü…Œ¾èžˆ'“¾ˆ§'³ÛJŽ6bôÒ•3lÞ›æ.ˆØÔè^©¹s›ÑzfZ¬g"Ññ‚ÊñÁ+ÀÎ”»;F~ÕºÃ|MáqÀ¢M›×Ì±¸g-<À[Ml°‘Ö1˜ÇÐÊJÔ!–¡Já|ïZD%>˜GS­[³ŸŒ¤É†zž¡åÓoèÈ¥PnÉ®DÜS.Xð¶–ü!å–ø>xC§?å¸y„¡‚»¥øð(¾)˜ÊŠ’ËÒ	«?5ù½ÆÌ³è¹cÐy§=åÚELÕ\0KD„ÝŒ¢³öôÛj<,¿ß“@_ùÜƒOÑ} ÷èÖàÊ»Q¨Â½±Ñþ9Ök(=7&ól®OÌÌ@~‰Ò-2ÑäÐ¦ä*A?–˜„ááódš?áS:s¬ÈAÂœÞe£¹’b×QÀû;qÌ+ªÓ#d4þ±4µ>yëœcR+[c¥_|È™ È|ÞùÔrÀŽd©ÂŽ~,'mö˜âü›Q;ûµ¨“"©;î¨D"OÃ+š,Â“© £ÆQÑIe0Ôª—à“¹=jï„"˜µðâ¸µ:º8ÄÀõ„Ãˆq"‰½àøU$r8~·ü2äi¶†>ì-äØÂbáÂp¶a‡‡¸S:âðð·*ê ûú­Ê—(}SÁ@ûfÿêârðÞyaÛª‰
FãS{UloÒó–‚‹.‹]Ûh5[j«Ö|Ù‰Ò±ï3ÐaD³8ž!µHÎ…ýú8MÁÆ	±µ|
ÌË0áótä-½‹&ÙØ	ÁÍÛ±PÇ'ðW8ÌoÁ]U`.Ô¿µ_si¿[k›ú™¶àoîÝz3¹D¦†€ðìÒÖ%°L¢&qc ¿;ýg (¬éÕ‹ÜÑ¨œ~‡+ûÞm"p@åÆ|î»¢Xï©ìïb;²pê<‡2Æ[%ŸÍý§Ü›o™¼–œŒ¥ã;†ƒ}H™Ž¤c-_QvRRôE&üSa’öµ”÷UÄÙ	)K(W(k‹O%Œ¸E_<|­Ìæbº"¤õ4Ô
Ž$f¾jÄàzÒ"ÊøvÚ!CÛMŒã¹P,äšM“ùFÜŸi	êâC¦ÚsíÎ+Œï'œ¬÷þ~S†-]•D¢>"böfŒª¥/èñ?æØ:EÿM*t’ã1‘DÇˆÂÝÆ«™@4Š¬¸¨¥kd‹Sð”åânÁóÇNâ‡ƒpñïÅ(\Å9• *Ðà¬GUyt1¡ÖÚzµ=O‡è=˜cCÕž8D‚ÍÂôðYÌdn­_XŽÒå
Ã¤ÿ9\ø'-Ìe…8‹¥¤Q¡4bŠRô•nMÊ‚VØÊŒUçé‡#úŽÙÊÂÕ]#vCƒü;^M*ý'H =Ë—­ik¼â¤(@½ Ík…ý¯ØþZî”Š\ÀšGPôkC¦:Dœˆ8ˆasBm•ÙêfNŸÅw‰«µáJ¢Àãs§øÿ²–A“pÈ*cAX¤"TaÈö@{L\UD‘½¾Ø)VÚxÈ‹);ÚŠSG¤çG¶º}ÁÛRôHÒÄ>[º
ä$SúÒËyÄù4Å*@/_wW(MáÞøÒó±L¥ÄˆhúšIàxyJxŽÈS†º@²•Õ÷;¬è–Ûq·àŽÜÀ®8L-q?ôÃ’š!Ð…RÇ<ÀQcðY½ÇÈFø?”x+VDZƒåŒi˜¾I†8 ãL [8cûq2`ôÂ'Cç†×4ÉØªùM­‚'Í—S`—¡Tî}ä¥ê2Ñ*Ï}!é|ÜzÁá#˜é…é‰¥¯!«Ü“¹÷SRy»ÑßÝÉÇsaãXN÷~l»ÍHÈÂ9ëÊo
¦Ë+¿,œØ®ü¶\j¸2@¡DxõqK¥»ëO]$ý\ûí#< 06¹ýÍÈ”øAå±ŸOçÏê=”ÀyuÆMÄ|Ù½B¹œQ"C*Þ#Zö€’Á1N²«i£]Ïþ{µEFjN¦Ù‹·Qòû%>§ôþ‡k*œCÞ8qÚ§­cÃlYÊÅa\BÊ/|+–ÆÏ·tH­´ºéå6.wnV¹¨
Ö&…Ùôw=•ñ¥DVc”ë]E©ëýï¹aÍ¼F zØf°UÑÞdZÊˆiyx)7ªi˜¾ò,WDçÁÅYøÔØøÊ13éd¦ÜŽ˜m®‰6þµð¿3ÿœBÂÎ-Ì1¯xò–¶dÓ²b½°i­°Ú•[‚V=[‚\É82‰(õ³Ð»$!x&Q"ú?ôÿ?   ÿÿì}{wÇ•çWia40!àKIZ–Ç:±‘Ÿ'ÇjMk¼4-iižÉ–ìUf7;;û×ìž“u4¶–,Ë²¤ÈŸü7_`ó¶î­ª®G×«P¢wb›$Ýõ¸uß÷wo>{qÇ)Ô;y}Éùr+lxD8L=’òc›t¥OØ/èQ¿MÄhTE@ì›I¦„b/§9ÃQ“œê\4ÊÓPFŸ>ÃN.™ý„•5Þ, Î“és¹fä˜pŒirŽÞ Ëµ¾³‰Ñ³lõ¼Ò»óøøzêì,”‘K‡Â†{vt·)CßH¨4Ð¬µŽ*‚`‰+RŽ@HGh3ø‚å‰ÛI·^‹¯%~€6£Ä¬QMx¡~KãÉs@ØO²­$n@,ó0ì«Ë!ÞØ7z;ƒmXuWÿüû¿åù-ðFC€Šs2Ç©/ïfÀÑ.MÁá1 Ê}kÒHÃÅñ%9¦¨´Iø–åa‹„'¹é[“·Š¨ôEZ“û
Z¼c¾D“§síd`"¸<k­"Š*o“ïÞÃÄÀk”Ê–Áý}“ÑdTË~³'"xúyõb û#¾SÙu2ÔkÀó@l
ÂP§ycÔ÷Ø×É'_@H‡FÔÕÞ1¹¹2D€!–ðâÿƒràçà˜áe ÔCÃTŒÏ0èý;f‘ÁÞáüú6¤w`ô9ù7‘m1Ç« ­º˜j÷çÁNwm'í­õûIÜ~±l+‘Ê› êœšt£5Œ7ÛIãÔ.”ãhŸÆJkˆ¿4‘Á¦7¥¢ÁÚ”ÂtRµÚŽKSŠl>«=ÂúZéò¦1í©ŽûRÏ
I¢Ú
$ ‡Dö[ÝÍ9öô‹w?otÝËÿMfÄŒqdg
¡=•í9ZßÓVÂ
ËÎ1˜?`¦î]þË‡ëê >S3N´6•†^/©Ê²LncÒ“¡	Ê=´û+æ‚3>õ%Mþ~À˜c¯7‘k><@ãÑ®#Ü!$ôHëQ<úÀd¬Ø+eyû¨ªÞ¿ëø2E2-¬KxÁ¤ƒL]\{Â%òÞ¦v¨UÊ|æ2ðÔþN{˜”Nt€vÒ—F^·ÜìÌê_óÕ¯7Á»ÖN©TåhæD¬€K%%»’ÕAn«‘ìÿ}ôÝþÿ Ú+ZaW‰þñ¯ä8•sJ†' ãÐ!Š«^pžœU&†½’³8åÎj´ÐÕ³%9ÒI†Ã˜ö3½H8H’#pÉßÖßÚ8ÉbÄ´üûW¡
–ç	uç\'ÉÛ‚&{ƒçÃK…¹5iá®ƒ‚–†MÁ£ÎGg«f7ÈÈØh{¹Å#;“RUª±fMÐdö–€ˆ*5¾«+*g›ŸSŠTäšG+gt’ÃèäÄ€UÏô\bßåvçß:ä ËàQvõßºÈ0–žøš@´[?è"ÉÝeË‘ jd©Ý±„ïA6‹âë¸ŒÞÒé¼ËbZ–}y@Fl¦°Šð¤öÕ"ÔÜ=Š²A+în·­¥AæúyÀ:w—	S»Fá™Å/ÉeO¼,^åœŠ´³ù§A#r¬åwtÁvî¡®©z$n ‹½_¾ÓM[ír£+Ö%ö±ŽNž"“¸ï4 tqògY¦DwÆÆ>Ó ½¬Ì¤Ôw†öa6Rá”˜ªÓ$jÿôïÿ÷ÿýñwJyþ–9p½Ú[þ!ÑžÕ–™ýÉêÄ¤hè=¬³?±k ò¢åëÔnµöx™
ùI3 O¹èÊ†Y››²@¾Q:(êòêO÷ S9‚°²¦;…ÜñÏ‰50õ7]>yû'ÎâÇ•A—âvÛåöÑ¢Y5c=·Áâ•ÁçÊ+éÃk]•J.,³¥|Ê@Õ•‚ËN¹#†ÉKÂ5÷ùz&Þ“Á64'~	ÛÂÞÌv†cÃä÷…é‘Îdž±6„ŠT8ló~$Œâ½
÷ÑÇ`È3Ê62FÔ˜ºœyù#üÿK9¸ôÍ
6£™F2OÓÙ´pÂ¸”"œóf_­Ÿ¦û1¥C°ÛžÛ7P{ïe;Í5ó^KúUNCÊö[r»Œ·ãÆcºÏÓT=Æ#Ÿ†!ã´ëÎ%ÄªldÃv¨Ûlé¬«®)t®V24Xè›É áz¸©o–âO;$ÔÇ-ÄÙqXÀÂÇy3ç¹¹7‡ñ‘q^I¾å…S h×˜ØK!Šm¿ÍÆ@“C‰¦>”p“»ÑºªEñ’øð\ÃI3Ó¤?ŽxüÒ[=ŒPM¡(0zñ!´þÒeí¥ËêKÙ ÂÞéßh7
°ç¬uVÃÓ8gihy$Yð:ï°I¨Á­àšþañ¾2’²ð¸¬«åb©U'„3¿VézoUvú.ÊN_òâHÀCzìá?\_/4¬åñ†%RHätÄÐ5)ÙLËÐÞâ{¬«?\>¬Žóˆñ½‡<9Šã6c´#:‰¶¦‡ÛípÎ!°Ž! ÔÖ¡LÖ“ž¦bk>¦MÂØóq’: 	Ö‡•îì%Ùû‹ Aghéõß¥•I²à_bÿÌš›Ê`‡ˆŒí ³8y¿]äMA·*\1ð/‰ÉñKµ²¥3:G‹<·ëSG“÷XHöŽšô1ÖˆB¸ž:"-Û„ùUh$Nb|RˆpƒÁˆ+Ÿ;ø…C­D{!#è.9/ Û8;Â)xI¹>Ìúy „GcÝ<ýé7ˆTýj”q³zo‡po~Ð„ ¼Aäå¹:.tæbÔ€7·UšúA¶…?ßKO~Ûäàü=´¨nŽ¾ŽFO ~‹W\V²¨[Ôø2gÐ¨Ó‡Aâêïö¡êg¹@<ÃÌñçÜí6°Ne8S#xXyôØP¢Ý¶B0 ¾Ò˜HÃ9©Xå_ÿ—¾§¹÷Ð÷?¾‘·uùè¡`ýªOµÁ¦1ÇålŽí¸þ’zê Ö±`ß¦G£/W#ì§w„°Ø=)ë*™ÿ³#“L{yâi›Âçöy/-ß^÷‹Îm²¹ÈùzroQû|„)V:mž	++ûm8`#Î%ŒO¯åD8=™&MêÊr‡õá51Åm™,M¬¦Ã.)ˆÑRÚ®=ìøJ!¨èñu¡;¨ÉêÍÙyC¸_3ÊB#®­yØ¯¹¿¢Ñ&87œffÊ0ä5»@WSŒãBBÆÝÚîr)‰5	åÐ‘…©‰8d:«ô)(¨t‡ªÀZ#=±âqf"¡Ý ‘K·#i¼_º’à‹¼J£ Ç•&dK^ç–æwä—›íBŽZ®ÁDP.6¿þüû»å¦t6Ãùiu·zÿÐÆ?wz½QË;¥½è#øâ£üÏgls‹sóÕÚÂâÒòËWÞå. ÜçgÐÛA~¡BìoœD'éE¯&í¶ƒi…œrÙKˆh’K¬V§x 
"åøk9²'çºmYt—|~;UuÀCí2ÔÎ¯Cw!×ŒâT¨Îé©6¥"º#¹øçßÿþRå©”¯±J5“ÇÑ‘ŸÅZJÐ=î¡ÊŠ%J{3ØRäO¿{l{°\›qej³]_þAíaMÛÃÇ˜s}{WS÷¬±Ä5÷ÞÕÆÞ»ÚKÚ»—¥ð ¯¥õ‡:µÏËµ¢…U–<u– ~29¶‰RF#CíørÒÑ²7OC2Öè€jÊÓÂ¡ÊäáèÑ*:È2‡úúN§®øÁîûaý¶0…/°ÇñíÑç2,E˜R$ÆÖÇÙz+¼ñ¦ÑÜ5Ô°åìöÒd¸Ü°¦ (‹òLÐå®wí„°Æ»Í8®õûÜ(Àê`£  ù"wcæ¡ÌÌùMz>4Yÿ\:Ó²
W%\ AƒæàeR% ûÊõäšÈ<Zƒ½²oŠ]÷ÖÉMûrÏ4–Ÿ.X¤hÊ#b¿/¤"½¿Ý#Ç´Ua“ ïko©uòÐEê Ë,;Î×üKhú°µt,z!´èå©QÖ§J‹BB‹Þ\ý.C×›"ÑÉmñòä–Ôá!µa’®#XnÒà\ìÍÞöðE01WW57ØžÇ…Ú~nì­aÚ\Ñö–Êeƒ‰WÍÀV@À:¾ÂR0A½œ›r/ )”éÏ&Ìßh¨»‹˜•NèQãä6 44ï2ÞqY¤Ò‘^‰òöò±ˆÎcÕ>Û=¢®_žÇ1D¨r¦”«X{ÑœIìÌkžº—c†ä–iêŽ¾€õ.b”Lt‹#Q²p7(Ë¶HÐIK*õ_4Ê™‚…èñÝ§@îØ°Ô„“X>ƒ)Åp]èµÛ‹\Æt¦¯Ñüº“ 0¼XŽLëEeö[TfoPU÷92XDñ½ýc¯õâ|¡4”³œ™*ºØ˜¦Ò8Ð¼ëÍÞ%:U>S&ñB‹Æj²gè(¾xáÈ·‚7çfrí´
44î³B(ÙyÐH	H£š1Á¤†n«pCQkŠÉû`–Ë[É¥W{—O•æ¢¹¨º@þïƒõéÇD£ÙjµÛ§J³P]Y|}¡5N•ÞªÖ*Ë‹Ñ|µR]®ÏÍV–g+sKDœ.ÌVæOÝ˜[~c¾úáBeq¾¹TYªÏVª'""l«ä–yòÞÊJ•Ü´Õ*K+Ö*s‹ÍZee¥Oƒ/Ÿ€–f+óËô§ä§ÿRò )ƒ­-¬­,Öè`ç«d¦õZ…Ìx.Z¬œX$£˜[‰–+'jäm'æÛ³ðöYG?ª,ãðÈü*óK³äïô§Z…<jŽŒk†9?»7.Ç¼1_©.’‰Ì/ž!¯YŠªó•ÚyA­ËŒï/6ü×_}õÌÜ"þb¥ºÍ/ÀJ“u\œ…—Vj+°Ú'ðX¶ae¾êÌ"ÿÃ?-UWp\g`&+•ù2û•ðŸùêþH¦]à²*Õ6™hæ¸Xl¬g×jµÅl©*Ë‹õy²Dä=µJm±²4Oþ¶DÞ³Ò®‘×ÌÂ¿ÎÌ“ÕÇU%t±HwÖ–®|V±²´@‡sÁáE0¼:l!¡!ø¶‡L‰ïÄŠgè'“Câ>DàªRN®v8ýÞ¬ÝmüÅýJvÎÖ$,ð’ÄM(a­.6:Þ”ˆc7»1iä	$•†@Ûˆì]ô :¸öÁ »_Hú½4¸ =óJ"ÿÁ]ƒ†ÌR¥ ÒÔŽE˜ ¸Á]¨8°j$wÏ‹iQÚ$K Êi ÆŸ<? -­UØ@Úš–¨ÏÐ÷öœ¦£›ô®ó¯½îÒ³÷:¾‘¡“]-uân¼¼! Ç§ŠÚ˜w„¡6:ö¦(l#ë'ƒ’×Úq`˜ŒYQÇè&¦²ƒ€ƒ0ÓÄä†Â?–IñÞØ€‘bF¤˜wLæh%ü´·M8-eGÃòO8¤ýOß½@ã"•9ÏpØj+¥fC¢„³÷VøkÐêzA1‹¤]Ì9är[›÷Ðùã¸'£Výj‚ Ah¡{Êæ¡0f‘çÓí›­FƒÒ°³Jå§{üä||.åHd}“Ãó[Šf(RéQ‡†4âq1XÙõ~çTÝ–þØ †–?›éÈq¨­4KÅ_*´ž×,c¹Õ¶âþ·±3À@C4d6¬¿jÔÞ–¡ÿØ$zœ‡W8ÉŒ)eZˆÖåD24Õ
M:KšzfNÇ:‡äïá	ZÖ©hWnß#kh¦+`{DîÊáþŒ²Ú¯læïÉö†&Öù÷Ñ^h›Hbæ¢†o ÆEXMè5óZÓ¶ÑÄ–úÎpµ·“¢ÞÝ…˜#ý“ÞÛÂµ¸Î¾¡îA“JiÒn×G<å.BH2¼A©¦ÓCjÔGüµSšG$k±ÔvÄÆP³œ+üqÖñ¨aÜXt÷Ì/Þ¹°±N=3ÁmâãÂzýú'úÞiòOØ[ÝÑ v¡“ámOçŠ–ÀÓ=hŒìÏÒÞ¼ãŸ¶7ÏùñÈ¹¦vä²}ÇÈ@Ð){¯$7*K›5u>F3äE#büKÖË÷üÅ?ç{ó§‰¿¥_Ñ“tŠí¤“mòãiø×=ÝÁj-Q‰Þ8:BK“¥£…Ñ5ËÒ¬D¥½F|åÜú/Ê3Ó9c™Ë]B›£ªcùb”cY¤ü$g‘Ž}L¡¿I­Òim|Üh@Üµ<¨7^Œò‡ºñßJ,üÃ²í?ùÉaÞî’,õðm3õ’«B7Ì'Ãw|Z[¯tëQÙ‹BEß3éÍÖàÃ8dxÍ çð'uâ´Þ¤[ÉmëGEÍJƒo°þ±%L~‡7­‚›–4Í9•Qô®UÁÊuôaeÐp‡ö-ï«¥3]W¬½¢üÚßÿ‰Éÿ»Wf*	Æ)óS”ñ0ð3±UäaÒðßØ|3Ù›q"­ÁPœÄx.#Œtn&€®°È¦\‚²7È†ù¼ž‘šå Hw@¬›r7lÉ–ÕÍeI:JA
úÆJ$CWÏ»*¾5i'ôØm\¢»øçßÿîÎÀO…S×NQ¦d`œ¯D’Cÿ![2:Úûé/»£Ÿyg{‘w	wVÁ*™ødx<Ÿ‰­øwJc$#p³yœok2JÜêÎÆõ&aqÇ¢Vãr!>7uTocùñ©È‡ºãS3ºú!¬_vzt—Ì.úY4¿W‰8 òspc¡'2È¦˜`ŽZpÆx(Ç""ÄÅã×X¼š·Û"¸lV½±ËðcÚ"Ïž)ôpìZ«ù»ô±à'|™ îPZÍgØì}$­t‚gbwG/}0dGmˆ(Är´Ð½4LtK|Úš©ç?Cƒ¤Þês
'³"Æÿ#hóª!	ˆžµ	z”q¾»¥cá¯ÀJvX¹ßÁ²ù°ïÔ›q·›ÀÍrPÀYnŠõÎ()àËÃÍÿL¸ûjtñEÉ‹‹þA±.p«œÿ„,8èÞÉÌ„N ?Hÿ»÷<$î´v)@£æ\˜!¦Ž-ÆDÿÎ`JA&ð¾E7eý×;ñÀ^ÍfÐ…xÏ•°â¶€äž1ƒËÖŒ»"xã†„ìëRx½(â¸=Åƒ{Ç ÇýÖÖÁÚYSÔn~È¶y!“J¿¦eb¹°Æ‡ãXŽE›¸91nx¥Ý«‹	:9ïåMüãŒ±<”ê¦BÁØÛÔ¥ßtíIê^¢B¹eJ¯,SM©7õŠ‡å‡ùÒå­OjÎÎ/D—à_<Ÿ®M½×6/ûÕ– )ÕÛ,ÈÈDañÆ~;ø§w»É¥uÊ¤f*Û	ÕAf‚úí`¦ç§½7ñXÀ×S8ÊåR<˜];[:íFdzi“(;Ã&9Q%Èû†DÒx9ÔAxX ;Möçí^9;¼¡Vb¼^ˆÛ ©¼	­-F‚ä@Dl*øŽLo0¬´«×¤ºÜ€Ì uQ7–›©ü64_ƒ#h+3;vSY ck³dÀ]a;š5¶B¯,ÎeIA™©›Yº0äé‚ŽÃ¡'	/l6ƒ´ 7,K† U"ëWºu"¨C6ÝŸ¬U'ËEË!	ÂjB{Hk
¸š•m¥®ïì‡x‚¾«C¯›š.U¡ˆáãÆ“\%€µ°×ûZ4Ð‹çX–ÊÛ3ÓÆ[ZŠ!4µ²PòoÙ¾äi˜4×+¡£Wÿ=A•aöøRµ¡qÐ?¼ªCã4yõ¡qÌ?¤*Äl¾jD~¹Ø‡Êî°s~þã0Ï2‚¹B80ÄØ²4Ix]£¢ÒÕŠVc†Ù’ÒÍ‚vBoaˆdápGÒü%Õàóó?4ˆ]nÈ1‘´”€ŠäP°¯&6 .-¸Rî’qXðÇ´ŸI±ˆÑpD¶…bÙtwÚí ÷y<åô*|†\	¤~¸3OùðW5g‡üaš/­×”è=æ% {["÷ÞJ89ôNl•`ìeEÏ]¦ÍI2m’Óqpc›Ð®c¡?¬4'åHŠ‰Ï'ƒNY¯"†¬dèÇüpÿæè+eÊ¥™™À~‰´öa9K¯2¡T5U”ª.÷„ãQ…½1è+§8 	ÞzvM©ïË&	•YD91§J6Öô0ØÈ^>Ç¤Ûë$*ÐV-IR¥BåÌŒ7ëçÉ¢Aòëd˜¾–´“4	ˆÇÓk˜ÔAp­bcW3¢Ìgr|P©Ü
ZÓù1®™]ÉŸ“¥¥èîÈ€Ð3½IJØîúæ9ó3¢´ä0øŒÇÁ™ÏxOõ¿ey"ì»<³D$“ ø3ºóø-rKˆ0xž}Â±~ž\!ßkà®ø€7š%_.÷ÍþU•Ç…>ÔœîVkÐY-È~£¨ÝÛ^Ûi´Ò5K¹ôÚÙ7ÏnœÍŠK2¢#´â¡r'›ÿ‚Øs"èïne™t›÷hæï²h~(°å@Ö—ÌîUm-‹òJ|ÿãû¡Ì°÷°ÍñåD°»
ê{}! («_˜SØ:o¡•qÚˆUÉ™÷Š_\›3Ðìt·A<lV¹ê¶è¶a_
”‡—Ð J¨?Ãðm]ÎAbÅ)ýÊÚ kÀð±ž^±›Æ›4 ŸÆÃ†FQ2ba £ÇÐ¡ó¢½ø(ë òœ…üó­¨xy6v¼Á@¬Á{ˆˆý\}™Ž'ø‰’SGßLÓ£Ù×0«×²SÌDÊ]ÜYž~š6·Y>E©°zTD)’T!ûæRwØÇ¸îW©¨r>4Ó|îÑ½} :Ù'·—×)B0ù¬|TY¸½›^Ýñh™>T=&¯CÀ^Ê8NÈóhõ*Êl2LJeT@Ð
êÿ
ÙàÏQü<beœŒêîŒ¾C›¨bŸR±âY]­Ù@>àþŽªÉxÖó¬ÂÊŒ[…ñJÈp‘Ve9»ñ3¡á„nœ~Œ»D4Õ[­nÒ8†ÞÝÿ Ã{”Œ[V~ïWþ{ã“õ´7 6w¹kþ>åúÇ¢/')í­áö¾—¶êI¹”[)ãÑ2íYbÞ'?>¨øféT¾\*—CÑ
J?µšè `Uå¦÷¢oÎ²®ˆ±¼ªÙñçPúŠš#ùÓ Vy7Ë&œÚ–M
‡–B¸r”	MTnØT®tÚÇ¶k‰,²ÝöçBÉ®ª€Ç/«;ÒžuáK]#‚Á/h¹lùü¾¡º,E÷HrÞä]}œ—àíMø—òZ)î¯BV;šfÒ_]xQP§„dÉ÷¼ºà°HÜ)Ö†fw+¢qé´Zp'´  'ÓåÐUhï:ìjõ[uPêU|yÖ	ò~=ÒÀGÈH¾Ï«Q€Ã<æ¨Å•ïi÷±éÜPHµ›Dã»Kµw6K¬ycoJy
]Ú{é!õ&Ñ¿ß‘µl*'zãŸ¡çJˆkˆ~=‡×W¬l_ÑPu¹(ã_l0Ä±06;Lf§‹6v*‘ÅX2É^Â`ŠPFŠA‚Ô	ƒ"¥Sc¢´3=züÄèˆî7v˜-‘‹êð-êd:®´AZ'5EqŽ\¦Á¹€@ÎžŠî)GS±ˆhó<Ð§ö_b(­©Þ9áEðƒk"S8ÓÔÛ	×ÛªU;,JÓ®f0¢Le\)m’UÚnj¾I}AN°¹“o£9îÏum AÙ=XÀ4ó7åušßû‘ó)·q}€õÐ×V£,A&­<#›Ës:©æ¹òîÆÚúÏß?áÜ/.œÛøOï¥•þ Õ´Ò+¿Âç¿íDð¢hhì@<ApeÞ ‰­"YSÂˆ‰x—L~`Î’‘Ñge4è§¿£:ò0Ù-÷AÒ`¶‘cÇ©—-D•1lÿ#Æ
N…ùtÀ5cÞ4‚’•Ä-¥È°Yê^‘§¤¡1§L ……šÒÀP“7È4½’Û—RÊ“2êr|Ï#.Š®nÖXôgPçÐ#CáÑ2‘¦U©m™Ü÷£sÝÙµ~?¢=ê‹ˆZÝ¸ß›O˜ÃD§Å’AœLW­	âI“vÓ¢©gžZÅ6ª¼þÖÆùèxtî­µóÑßEë;ýkú $Å\Z:iŒûÜ†(HÛ¬÷¥T¨ÍdGÿB›rß†¶Ür!÷gLß€;h¸2ðrù·’,‡6ÛÑò…%~ %øXI<ùÃuX—;ð6X$°?FGÀ'àp;8š DËv‡>GMÃ²7#´t/ô¤*Ÿ>J¨¿´¦^%­hšžv4Ç½¿Ó&¥ÓîÂLÚa÷ëM"¦ª8r
Ô¶YËÐÈž•#Õ÷æç }>Q[É<¾‚+9OÝìR£CV9ì¤ý7zÃto5÷çó½Aj­®¹JáÜÊ¶¹Eríõ$M!Ï% C[á ‡æ/â1-½E+…Z[IO3ç(zŽìäaÆv2žŠÓÆ½»­.Š¸º?´H¹¼ Y?C‰3ž ÇØ&my–iOê">Id\~¿dÅ§¾¤'s³É~ÉŠ$ó5ˆ')ð
.ó¢!ò×zõq#äòH_l`ÜC$ê(Íà+ÁDy×pƒ,$¥m‹ŸÂ&Š“ŸÏ/ZÞê¾ŸéÀáQsŽ ‹o>×(•…EÛËš;mñv«äz±ö=Ö.ïÏ¸!öIÔˆ0)´•¤õ&·4^Y	Ù°ìØu+­Ò(¥VÙ,±†ë´ãYï™SÆóõ>6ÎH”{ÄN¹VÒ[šÏWDÉ}jíôe)ÉÑ_ßp«Nt!Ù$Ãæ™K¹ö[,¼2Žò3U
"´Àjð6zå’‹Ñˆ;×)®^èí¯öWBï]KÓ¸ÞìÍö~ôkö-¤|ªYOŸÜZTŽÕ 2ÏÖ†‚äeJs!Gï;šh(Tº#³ã'ÂxE´1XÖ l^ïlr8QçS|î3¥ƒWÕ‘ß ©
ø9W‰ù,›¥ªFmCÂ¼Bþ4g·Zi ¿ÁI´óLmáðEL™N@s¸»¸ÍXÐFÅƒó:Tà¶º›½Ëö\9ÚÈÚÂ„ô‹¬ÉÇG[µ¿÷QjÆÓáp&‰¡š˜R‡Näx¾€ ¦ÆÌs%V4û`‡Õóxò^;ž¼nüØgxÃLAK¶Õ¹ÜJ˜Ð¢p£$·ŒË»"+ó,4’ ¥$•­ü¦[ûHRi/$qc†ëþcù\¦!íÌ$=$;r¸(Gô%èõ¤ÛÈÓóè	zw±Žuh¨35*ÿb'ƒ¾5Ö8UÊ¥äpHiµ1ˆ·±Ò!ý@©õõV;Ù o3pàë„@?còµüLrx˜È”QÂ!¥ÓçÃE§tH?P:UŒJS½=¶3ïio>L´Ê¨á iUouœŠ–Æi¾¥q>Î4üà|u¶&ó·²6Ð¶Ü¨¢Î‘;£g £‹H(÷‹¬ºsrœ¡îA†Ò€›GÍç<¯áON”ƒRš=Æ¥…xkãüª$6T8šn.È/¡ã¾—Mœî7ÆzP‹U E ~¥©Ï¦°6rtUZÕ!wHW%çiÄ€ô1nŒ•Ñ“|åõ ÄúÑóýÅsû§ÿóo­È8(üö¸²	nßBƒ.#´¹}qG-Êya:¥I»[Û=ÀPøÿÌÓRÌËBžÒj®Æ|öV›ÜÕl5DƒP£š³ï-.:\žÿÖîËµ™]ñ$`b8ÅƒzSñvá,`<]ÝÊ}íæ³î®˜~ /w%æšs•~Uï,ìzT¿M¤PõƒS%ÂäŒ¾bíÆ pç©À›ÉB_´6‡ó±R©¸Òó-Š3
³Q•Éwâ&Äc–œø+9¢_Áæ&ö£¨Ã9Ó®ÞIš¶½;‚ö€#ÕÜORa}x*­n½½ÓH†eéŽvKBöfà¿çb¾Í9À bKÛŽôgW”JJ“>\›Ù¤$ëWS³É¾ÄêŠÔæÜ|ƒ=Ìy¿”¯mÔS\ÎZ-ÎÍ=ž`jÙbùˆ8s,¿&\ºEÅ€*… ö’/™Ž­UÍœVë$y› 1	váå ZMUjúkôð_WdÅ_zãÃñ¢
†±	¸&f¹‡FvƒÄª5øBPƒuÊ5¼7E´
‘«+5À!—…½8UUÎÁA,U^:ËÓß:¼¤=›WõuŽE48 ¡3vÂ ¼
âmAùß‚·olÌ–A®ì5:~"ÓýÂÑ „¿Ñ[TÚ#ï8BˆS†‡*ÝÎ²ÇWé#<]”éÅUÔ:ËÄUgâAtàò()†9ìt·­œ¬©¯$Ê‹² ¦*¶Ôh¡Ï´éÓZ£àËñÝ”‰„}'¼'OHÚ´Á 8MÇ„€| M­ÏM¦ÛËÃXuh/ú¥f<i®”]m€ú¢µº¨ªÛÀ•skJÉbEnÉièËÖ.;4¸$cÄýdPo·úÜÎ›CW.sœM{´N™¢ÙƒèÀ)­/ñ;D¬ŽL¸»MÔÅ›FUJZ¡JÒ×´ ³@«Á1}ýÙEM…×9gæUÐ3{OC]ðÓÃ'Ái9HHþ0aU_‘ê‹ï6¸þÅ$¯ö‡ŒÅºéÙ¼žß`óhð1f£Vp‹ÉùFX+ôhôTÙ_Èà¦ô`^@×;[ÙÚBÄgçzŽsñ®•¶ošýG˜êº9[Þú 8]löT—R²*µIWS27	ä›»-š’LÀ¾“èŠ’£» DÙ¾*,J‰™0[’~³”Ù‹w!kÚŠª$Zƒ…pPZ°6V ý}Büw-?T^qÉÀ‹+ÿQ10`-µô"l3ÔŒ+ÏeÚÆÅ±i¨ÙýewvvÖ$lF·£úÓ
É¿ì‚mžÕÙå ±åÛPIûeWýã&@Ñ±KrÕ¯@ŒûÈ¤ù)À”­j†Àhñ™ bioK–æƒFª„a^ÇÜTv8Pã
±Ç»_ð9,`ŠËd§Xä”O®f)Œòl–:—ýû×ZÜt3,þ¸EÊ¬%Ww¢`'ÖBj4!‹¶¦NÄ¡­YokÖBš©F¢ßm›˜ö­.a+ÝmbSš˜ýÉãÍZqÉÒ‹“«]¡ÍJOöOS) Ò9€˜EeÃ'™\,¾‡„ˆkñŽ–öfeònzxòo$õV#à2 =xœ®»%Óø²ïfCÌ~‡ÑŸf4QX]\æ¥eÐ+‹ô3õÜä'khHRª!¬–¢]p¢$íørÒPÂÆr!ÅêÄ,¥Vw–X“ó+ž$,~åõˆÉ× ¤í«òÞÂ~KŒ=KÐ³4¾U2½îÌN`c@„q=µÔ£³Y
Èá3mÝ¡5.Êò¡7°²9šƒiÚ½¹Çm.·“hó÷éÑÇ mê•Eû÷¯R\-Çl.m9(I~áÖ¤P–`–õ†Š-2‚|…l¹e-ölj4œëêù¾½Ôn¦ì9¾H_“eÅ›€*ƒÃ¤©X`ÿÅæ±‚`k¿9–ÐZ½Nh38¶ÆŒÑ	º;4BØXôIú)Çõ*:6hD¿@fÀþÇ×(¾xýÙø××ß$ÿÞxs}¦„œ˜±~„”­¸=Lf,È›6À@d"[Wæ>læµÄ^r¸YlN\^‰ø)ÖP>âÉÏÈø*]9+˜ìúƒÑ«¿Úè±|É¤3¬ðSwl÷å|ç)AÏê2V }à]º²K¤êW9ifŒ8an†%ÎÓ„l5•BJÍQª(‘®'B#ÕwØ•tfÕÉÝˆ£š ß½˜Ë-Çõ°›l÷=Íâe•¼)ÝH†éz§;CæÝ©×“¡WN©ÝâOèíâkùvñ+þ~ƒ«R<ý„Z†!=0Æ¹çÅßÝÚB\„FÍ&
? Çù	¢¡aÖð' sbzOÒXc”æÞ= ¶ÝEÿâ}NáÍo&òGPŒ"Æ1°¯ï¤T M§zÒ¬î$'Ø/ÍÚqK9ŠÄ[ ô1œ1)3ŠŸAl,Çí×ò/¶¶Zõ$ª--‹þVüXôn²IãTdS2IÙ%Ð½ÑwÀ’Éš–‰ð9NDˆ¡µ …¤V.êîý’RQµ¸ƒÛÁ€_ù^0í>û6ë“ÑS&ç 3ë˜I?íÍŒïÇ‡<°ú¼’[ÅécáðÙ@í|ÇmÊQù…Ó{"ðãÈžSê)Ý,çœáÒ+,–u²o&yÈE[YüŠ5ÓÚ&9ùÏq_ryï!˜á— ·Åz ¹ÞA$ˆñeyˆ0¶ŽíÁ	†‹]-)¿ª&å/„ˆÚ «Ú:otsÁ±Ô<Sœ²ÆÌ- Íûq{oäÕ=„uÂ•2	Â#*õ^' à˜ã®F‹+ËPÌƒ^Ú#[ ¯KãAš¶C€˜‡I}g¬F¨»úo$àÛ|§KtÒfo@¨µÁ¾êùæžßUPÇ É¬/$Ãv‚_ŒC©vX¨FÕ…*§Š'mÐÚn¦f'¥Ÿ±°Ò=šªûpÚ`Â>O¨âè¯€®£6ÿÉò€¤z!Ta´D÷Ùqgóy4Y:6àñŸÂq4þ|rV3rÉ•Éáð¹}ƒÚ¬ÿu2¥mt[ýÈŒ#ùëfH‚4À!cBªÅ›	-ü1+ÔÞ‰
Îï)²,\1²Z?2«Ë¬ˆUVˆYÛïãUÛò#«:ü¬ŠPÂ_ «¢Þ‚©sª¯¾ö#§¯œ
I±_º’†;½^ãG~eÈ_!¿å|%‰<J3A,I„/à‡'Ü	:M»ùFËä”„›}ö;üx.çäƒýk>Šps4€ûØîÓ^ÿáu­ñ.\I#'_o%d[Ð¡wªD^}·7‚"·˜ÿEûõÌ¸Ýw>‡(êâthŸ Ö»ì¾O†PR¾|âBˆ[Td¢€íÕHÅ–xYLO­ \åtÙÌ5Ÿlì™öpršNÒhít¢Fk0ÛN³t²þÇq$P‡Â Qp_ƒÿò)O3º…9LL¶*£i‘þâ7+‰ƒ”Ä³MôT`çåJˆ[=&G# · S‡ùïÈ/7ƒÉ!£…	·Úö±‹¹ªT€!¦ë¢²6P;³¿gc‘´g¸âP‰÷„üïnT†~dçÉ/Áé¢/¥P®Õgr-©¢â~Ÿ£°ÎhiA@tÒë‹s±1x˜“ƒ)Tü§ßü¡ÐÿÃpvÙEÆš	¤sÎøûi$tŒpR»¡7„ëBÔ¿Û¿AèøÆà±¹ç×U&ü±ä;	%öE“JÖê$Ì/A ðnïÿ6bÍÕoC/5þ4PwX¯0wàËý›cÆ}Ýrà€õ"K’Í«Uý@	û{á‹0N¡Òbˆ}M ° ÀàËSWàAæ¤šP³~bŠ¢"§»¶`aUÙ×ZŽ^…iV|w“KÔÃ½£Óa×@È-®,PÚ‹ðÒPs?K6MáHäžH–?f!‘,êE>Çz7þ0„Ïa8—d?Uípo^/ÇÚ¢™SDâ1?Âñ,Ž\<m¨õSèÅaƒô=èœ¢Âè¥AŠ¼é«MØ«3Í¤þRÂw¥	KÚé9o,ÅLÛ®çØÛ	ú-‚ã²•^‰ÎóäNt„Õ¬ØáŽt{ƒNÜ.Î°Ð*‰xœ¶>ãå»ÙÌüÙŽ,ûÊ~G!]¨FÓ¯<û‡&Kqw>ÿôÉµÅäâV\Ø‡ÃÓ\3ÁµØ1½ ê…$ÜëBÞd¾*,úÅÆ+ÇÔŒéEDÒR¤—4·³ÔòVk¼èÍ¥æÙÔ2²©¹_ê\¦õ>;@wöÔaIÌx×J'€ñ±3N¾ÙÌÖª3[q²Ëðî]ŸÆVvçd›Æ–Èrëd²ñÇ—æ"¸†“.Bþ…ÔŒ†˜ñKRÖx
vƒwod	&ò¬¡  üôá±D$ò§»´·Ñ†¿vö×˜|¦‹—pq(>ÈŠ'äëžÅðÄD|Å³(üZ>ì0ˆ†,µLMûQ8ˆ¥	”Öã²Ví¢KÔJ{”
êT*4qká@&²´YÂI øàeJ†¬rÞ Dÿ]*`
Ý¡–
wF¡¥VŒóœöAŒF_q†5-÷°GÁç\H|‡HˆØø
ðç+Õãó•ˆÇ cã7Šcø3ê1~bá|;nu¡â°KÛÂÿ Äàáÿ(r¢—%P,èMŠ%ÛX
F>þ£PÈ?ñ@…ÂàVœiêíÄ!DBsÎ æýY-ãY™ÂAj\bê«´bÕÃn.i ›™`ÈöÂv× àÍb*û§‘9¨SeøP¦ù%¦ñD °£gÓž­Ÿ£{ök2˜Û"(ù`ÿc€whR@^00\]"%'¢é¦Vë9ðÑ¨@JËN'n°M”4ÀuÞÛjœ*Ñ¤Ë3pˆá;<Ü’4ÔXO>móÅGM©£YTˆúåKáÒ¥Ù…¨IþQ+lÒ¤ë«#™@Î®:Î˜Gh¦öë½A~çóÝÓh6–¦"Pð`ëÉÇï± À!òYÀ<øYÄðHT^O­zŠ?Ã°ZDå„üŠÛ­…›p3–\è6ø±B]íÒÀÒð{û¿#³ø8"ãþz¾P§	e6Õv4›].Ï#ÌoxåX–*DŸ|ŸÕÃc¥û5¬².¯'í­ÙõÖv—ˆ´.Ã™ÀSóÛÐd§ˆªãõÞxCÞríÉrZÉ,!åŽ;àDd|aÎðð6&MäîÓ0Â£k¹Žö¹Þf,ô ´ëñ«Í…àxß	;†@ þãÉÉÖ 6Ï\âà¢O h“ËÀ‹%óÏsü7¦•õÍaF€Ý„¨”515e«} )¢©¥D¤›ÈTêB¤s`û¨ËïsÖ0Þlƒr²o¾ÙC]5X:Ú´+“^Åpé@¯Fâ¦žÉL»sdf.öjœéVzŽ}|oG[o+5²›ÖVî¤-('-î¶:0Ça¿ÕÕp¤‚ÐYÏQŽA˜íÈ~%¢sZažú»m…­‰„c²`ã;Àq3úÃþ)­¸(°œÄixá6÷UÈ5ÁÃPqa°IÄLub¢©&ùÐ÷$™G’÷‰ŸÛ,ÃÚLŠ³ÉÉy+n$çº>÷“:È
´òl¦ÖcÔµ1bÑÔ½4èåþ¨økö4üÍó(/¦×†è´¥uÝÐb¦ýÍ^‹ÓÊñk×¼}|‡‚&uCUÃÓ„¼OáQø~tƒmZÄ°Ž0Ã pãƒßÐ­¹}ñ rØùƒ0•ëmúq•¨6¬{¥ÎþhZ`„…|…¹ÞºawéS™Ý­_yk9u*²ÕC(¨–¯q*ÇWŒZ$/ =#AˆÇ£o©+Ì°û˜gwÕ>³½ŽK….ž‡`B€¬ÍÝÍt$oÉ?à]}Þ¬Ûºo¨}âöØÃÚ»ó+Ç€ÈÎ”Q½5‡(§ždÔ]ÕrîCÅî”xsêvX±Úô…¥ä.fé©üã3•ž",ì7-¬šóÉ§?d	‚›ùªµ2&­2—|~­x„­’öÞé÷“Á™x˜”gþ²—H1²å*èüòÐrÝC±êñ_	<ÇãPP}:ú6Êù:7§·@!".j™`¯ûoF÷5åDŒÊAÓ€¶†4
•¡„ºsØplåp¸‹áh=Žïsá¨±žÉ|nìu’zÒê§^û7£CómëóÐß­ý1ý\äÉ`àÆ¦.ºsÝ{Bkù]©òÙÈû¦˜N[xÿ‰ ˆ™¸¨¯, D@\¬ö	t¶xÛ˜Ð>L¦BîÃóô2§ÐçËU6yI[ïÜ=}­td—é€*ýì£ýƒzþÁ¥mœ„ßíè3šu›¨,J~=ˆƒåZL#¨©H˜/U\á^UqiþU€¶9tMU7+ûr§U\rôã2úfØz«žVÉXNTIˆÉNV«~œÒÌ°ÄÈ{LkV)rÈU Ìï6”¦b¡ëÊ¼‡ºàìµPëëéw'S)Ì™'½¤¯8õr`ý™²s4ÿÙ#‘wÄ¬FšsÄëúrÍ(ÌÀÌf&ˆ¦Õ8:¤ÕL€ÏI³}I½×é²Å(y o$Íç°dþ•Yã>e),²…Kýšy0ü1Œƒ?ÿþ~:}ælz"%õÿ9P0Ò†…{p÷qýäÙèÖ*ötÓÝêRM«ø$N~wï O/qG`õoÃžéû'úc†­¹
˜)·û—a²L¨Z—S¡ê•¿¡2Wk¬åmŸãx”*(i°Ñå©ñe‘JYaûPšöºˆQì«#fä*M+˜Ê³¶e|×~ŒÀðß«	BÃ¢EÐX{aª—°&Fø”L¹ÈNñ=ì¹‚=Ñì©üÕÀnbpqG0<_ùÈYËý-× Œüò-Pzãr³ÄÚÔKnýÚÎ+{õ¹î“ÕüT2tÄ:Þ‹ÅÖ¡Ki?=Vo®Þ›ËÊ(M±|ÙJ9ÉnOûÏ-7‡V²DåÒi²V7±Ý±ÞY
‰<r¹ë¼Dë‰êXëˆ•nSÌÇ]Ã^\Ç=‹"pd¬3tYE¥ûÛà|:¬ó^ÔyßúBÀ`JÃû¾	õ£ÛcéŒ„áÿ¡Q¯l÷>¬Ä‰êr‘ïrð \>x‚ç³ÑSòÏs­¡÷ôöe5xosØ·ÇÞ!ÔÓ0_à‰•Jå°mÌžºä‚!uíðŽxÄŽyz—†§v—\‹©îå«ž–ÄŽ„¯Ž¿‹·yëk©ù§À¹¼-·¿›M—gt÷n,kÿŠ	×ûW/* ðÙ¹¢èä<æ¾‰Œ½{dZ_ÁôV#¦~	†ïûÄÆ%Gó}~ÉVõ[/¯<ÆƒÁz®»ÖïŸuƒë*E[;í¶¦ü ë>ò­YÎ†fÅE4~;UÉA«Ï¸–Ž	4÷±Èê“h}§oÆÃ$K!´.°K'Këö>B×ÌA+?¥_4éþž‚:Í¹
={Ðùí~ôn3N‡ ÿÈŠ†óÒÕøÝ4Þ¤u¢—à»q¿ÿ>Eè+™ty›ö¼d8ô»GZC²ðÉ`­Ñi¡gìH}g0 ‡ña2¨Ôãî:&ßeïµ¤è¯äÄWË¹ Dsvà RŒfW”ÖÍBçï\™]±ð+ý½Ë´;/jîÍÙù¥èüË¨Ã³_µÚ#”‚+"}ò-êN]ÿõ†Ì­aÙbjß¸*¶"¾4ÛiDl‚öÑ4kùü¤¶£÷;'ö¸H½'7kÖ—s£4ô€ð6 ÄúdïþoGÿBÇU
P_ÍØÓ7VàI;h>&ö¬L‡Ìiô%V‚¢÷ô	V‚ò÷<•G7 Õ*ÈSžê‡*ß‰¤Íª€ßõSŠ<ð5Ž[;?äØ{8Ø'ûŸØÊ¬~÷¢ÅmîrKê8zF¿CðY”¬ÇQß-Heí>åúY KÈ¸¹ÍjôžŠgž.¸·à´n1‘{fÓÞì Úô:JÙ‡­X’mäž4‰ÛØK¸?»ÉLJrzñê[ÖaÇüÀÖÔt¢Z¨€Š'Ýê¿Dä|SJã@­@2ÿA¶óð^§=LJ^Ïð—jîŒWc»ÈPå£¶Lõ°9hu?˜+1n[¥-»‘8ïïÊ`—%ÎÀ˜‡ÎCp šÕ1‹ûœQ`%8Öì„=Àæðrï`è5ŒP%Ï)W¹ƒ••7hÝ6?|åL»:Yï5ì«ZSªúÕVÞ˜ïn°ž,™ªÂâÃ“Ça§±óCæ¹<ÛØN¢×wº¾¤üâG	ÿ³|¨³l¨|¤Žm³…r®çÑ¬¾×*®ÕÀØ"kÊƒB¾¹=ñ.ªJTÕÅ ‚X«IÂý-"½1W$?þT›ì<\ ü?mu’h­Ø-­Ï'ˆiÁ¶­$­7ùh¸Àß°k³¦ÅEJ¨F‹Þ,«)b›«Fß·Ð…ýgò /»œûv¡—’Øjõt®ÏûlS¸×¯h¾_Ê€ Îô6‘…3ÞN.½Ÿ!{H£¥ €:Ù*'uÑ”T´ó‘Š<C7‘é7G›ç¶oï¥
†Wa"lxB~ü
äÑ}
Ëë­Á5ÇGVVR8™[àÑ.{¶2:»±E4¶`½5ÿÛÞÎÁÿ.‰FgvËX*Ÿç;lµÉÏÍV£A_b£Ï6gß[šƒXŽ•Û¢Ï<•Ä¤áZ0ùùÍ^ô%è3Ãš…§Aù“©Ïg%«Á&×ÎÏRŠö£ð&t,¤! céZæ( CÆ©Ôë¥h¢¿4P3Ò­Î8ìœzÀäœpþeu*uhÄ`ÑÓ8Çõ¬tz÷rÇa¥t·ÓæžW©Â;ÜìŽ‹n¢â]R®Bx¦á‡	øC;æÄ’îøJ”ŸN|—îcÐu>2Éí—….ÅëI<¨77’AÇ—^fŠ¼+}¿hÊ·ò¡KÊ`¯XŒ}:ö¯ñxÉ§˜œzÕå+ï×0ôò¬B’ØýöìJÔÐÔîª–ØÝÛIÛ­n2 j®·¤-¸ÇçÉò>I×Ô‚š°9ìµwÈ<ÚÉVJ“†z}‘<Dç FñNÆ£(}©^xS3©z…z‹Á»J¤êÂÀxá›8kóDe«Õ&Üº\Ò=">TÔ+Ð”±’öÞì]âÅi¢%©|·zÏýr¿I¨Á|ÿŒ&°Ò‰ûå:è;ðb¼­YÉô­ávt*‚oò,âá{ÊoŒÙG³Ñü¯|`büÁ­ázÒNê)±ÕO‘N¤ªõ¹†=ð­Æßûë¦Iº3è†Õ¤ûÐPùõAråÔ.BXÒôX8ªüóB[„2{»ŸMzýî0ƒƒÃ†7¸ïð[<M^Úè•áâêÇ¢î ‰goJW£¹h/Zê~d8zy Þøå¿°b®ÎÆíLiö«h^4V~	úü‡ÅpxŸ—$³fxº<…'»Õ#bXÛ	Ñk*só¿
-¡ñ@·æìÉEðé ž
¢«\[FNlW~–x9¸jh]š-Í=w÷â¥ÙùyÎ«¾(îgvûUWá;RËê`:”)‘Q˜Ô[®Ž…#	ç6þ0&úÏ«ÛX¤&íë’Bq¡ÔS ª„ˆ@ J0òÓ`--ÏWÜ—ãàÍzˆ·àf—$W•²§úJY;]€!$†P¶T{Õ4ìE–ÉYÄÇ"yÏîªÄ¦ÐØ¼\u$`ß
'ÔSB)#¸Þˆ½ë$ÁEZì%Æ¥šS–ª“¢mè[§ã'rKµP|©ÄTXcšíÑIJðNb•ÜÝ#/•ö²[áá+[pmâ4‡V¿ã½ÖH	ø†èñåu5ó"$\7éèÎN;'€tŠ©1èDl}Ë×ÿZvºÊ;O¸¤/F§‰Â8Ñ‚–ÜÞnù¤"/#¿b§CGB+,Î¼¤¹½äÕà»Ñ«ÐïMR–„Bþ-Å²`8¼Zøà1¦ <ç½G·F÷¯ò”\á#p¢“¿øÀóüøêàñ°)ð¬åPªªœ/tv9+×¦3æãU`i~Éä¡…=£Áw5‹Âˆ£©E†\á'DdBæÃ5ìþAŸç£G 4mÈï–ÈŽÿá!&UŒô ¼ûEO,C~Ô\Rk·ì÷P7JŒ!mŒbŠ¸ï}«Õmh¿îaqr‚ÖVT>"ž<ãñbº_ôÕkÒccñfrU¥h$!”‘“¢#+¶ÎµP|Tc¾”AIKåu"aÁ¯‹2¼¼ç˜Ùô”å}‚ØËjü.@Ë©²wQ…¡NQ\A4à®E_ð§È'X}öw‘|´^hñ¾KXG*Â¹0Ý‹æ$Ö¢Î¦3<i£Å³1œz3æÀ›1§êAE<Ó‡.ÒÑ]Á¿ÃOT¿ÃO‚5ZùÅý… É­~Ì°l(òR~BAŒ{v§/ùrL­Ál;([i\Ôzþô›?(ÃôÚÁÎŒ)#£M#W6{–%–œ‡¤TƒÇ&Hd8Z†Õ$«‚ƒšQ,_¹lÞ‘9Åúo%i,*OÎ´{;híü9–´aVM˜— mBžQ8C¦Á©Ù*Ynï#TÙXb:‚ bªq‘iD…·…
1‡§ãÔià =x½9¨éËs&Po]m>ÿY:}z°´º¹P$hm²rÉPjU×­ß$NPS"Š ¥Ò6aâ5íý IÐ!
$4¼–«à¾Ek=Ì¦tb®Ù‘)ÂÖ¦õ‡pZB¢§C1¢BcŽ,êHtTÃjª.}Ÿdp-f~4tNÑß°Mm),Ž?€zÏE­vzo¥ú·¿Ê%W1L¾€+h’`ŸÞæ`6¬Å£¸VõÑùJ6Û…ÞVÈ	©j8<Ê0ûƒÕd¢@t¸sº€Çy¢ =#º“é…¶>WrQA‘¨E–ïpgl1¯aè¦Y4ŽaÔ_d²ôÕåÌŒzÕTK9
E%Š-Ü&^îK­	_å‡§ÿ}u„3ñmQò­†|=÷(2¶hõ6Åu#rœl†lQWC4ŸB®ù`¤Ú,Ïð|a#0FfN5Ì1¸l¯ûóäÊk½KÝàNŽôŸ[R!òŸò…³°Â%ŸçM\8àÝ˜y¹Ê’òœE2Å |Ð×ëîíl(ÐýJÙ¢²@IÊÈr2J’FÎà#§äÛý›û7ð.Ô4yºàL@'\yT^B×èKïÇPŸYuÕÈ`S¯dm)å¬Mÿ{Cœ‹Á¼Z\ÃO!ÛhÒ-™òŠò¥F‹†˜HhŸåªZ½Ârr‚šÑ+È £Ú.îé`à”Üru¤e… ý²!´6¤%²“bg|oÆ^hæ/¹	È¸˜XJÿ.¹„?g.,ÊÃdsÑ;#>†Šsg(^Rk…ÅËèE·Éß	¶bƒ»ÓÂˆVÀ»ñÀî44ñC„ÿunWaÁ,»ê’ªþÜ~&k»0Õ·.L“t}›)T¶Z  4L6ëöèøñ€5Pà^)ÚàKïß´M#ùÇxæ2Äÿ6ÑÊ^U`à'XÖM=\PÍJÄ
îý›6Ð¦)îáyW²–uñ[cíâÏN,Ï/ÎÍWk‹KË/awµP7†IÅ
VÒA«™úv-††håÀŠŒîCbIÃÏ×Ÿ0g`¡”¬†ÞlŸÛv„©àõÉxV9;ÒÇ"1/ë«•ã\²Q¥÷VjþŽEõcÉzŒ	KÂU4œiäWXŽ´¬0t‹«PüL³¾ËWÇÜÍéÐÆ³`S?ŒÒÝ™…¥"åÐ‘ÝFžÌô·0”<ýµÛ!)‚‡Õ¢ÈöÃÉ°ÜÚWêjÚøM6³Ñe/Í‚
0§ Ö”éà}gs#Þ,—úñÀÓ–,\XqÃ²òšˆkæº`\rôu{÷6°¨BF¤<0ºeÙàÐ±ªõ,‘Ñ¢–5°EšAÉÑÓ%‹L‹iÒÓªe¶åø$Vz&d‡p…š!­H‘_#û”SðC@œ¦õ±»|’¼øÕd¸Œ‰¶?Þ$Éá% ix‡˜^o™ØÚîÆD¤&Ü¦Yd|#ÄG+ïn%ÉZ6Ë—Bc<Œ ¸öáÝ­ußy­S€ýf‚ëõµ¨¼ø·/tŸ!öp(÷vˆ÷—˜ì"‚Áv÷öØ{NƒÕÏÅÑ“ú“¨¼ÈAƒ¸þA«»ýbwy@ÔÉÃ¹Í8²C¼Ï†.l·pë *aÃPŸ	ø‘É®Ã£µzª ^è®'—ûIwxHyx6¸C¼÷ä±=ðN_Ýz
ÒI6ùª¬Ê=¥‰¶W{yú#žktð÷Æ³¨ò†Æ‘zÜý§VréõV7îÖ[Ä¤Õ„ÜŽ+¼f‚Óµå”²s‚}ÚU£yPÚx^ØaŽDkÅ¹ ¹A\]@A…ìL—’Òï!ß‡üú£:÷¯ÛÁa‚Ró ºœ°Óhã•wedHvÜ gñÞÍo"|á:&_Iƒ¿kÄ¨õÂ²6Q‰„;#cà›f-lèÃ¨ø•0'ü…-1¢ÔV,Ó‹¥ú|%Ô6bC§ð»ÌØ·¢Ýö£#[¢ˆéoûNáìo/Æ”jLlU?”dÏzàâ¾Ø÷ð÷°vF(GÙÖzÂU.U¼#à“#{‡x“â”c€¾wO"#•Á¸QCgõN«bÿ`Û<x< ‚üÿ‰ÔeCÿºÍ“Úäà…Ds5¡G$.zäÞm¥MÔh2WOéXTêÄÝx;9ç1üø5Yÿ°¥×6Ô~mÆbË"íÃÕ8Ì´5¡
Ê`„pb`HÉ£`Ësnœ·ÿ[HqãpP0÷õ¦á¨¸ëƒy=ìÈØ‚…0íB¥$FìÒTÎído¸ècÒMg%òõf^[Í'H½Äƒsüv·:éÚÙ×Ê™0ÏzR.w:Ç¢>UÖw:ÑÏ¢~%î€Up,š›ñ·‰ÙEðvÊj¡Â”v5W!ú–še=ÚDnªqá)ísnLãí4ìê#`REöâkDG@ûØéÆív"¨€îŠº;íöÌŒjŒ}9¦E1Y#½@Âÿ“¬5“°P(P–Ié{êoË¨ifJ”£í èæTŽn>úÈt×¡¡› Çå'lZ,ª#ïì°N,®öf<2r3™F§'ShoS\¡÷–ç¤q/É§Í$VTj¹ß$>cÐÚn¦¦DÁEò?}þ  -0mšñÖrgM¤0¥ˆgÍ9z~òxÚœâÛ¨ˆ¿Ž”¯§ÿlî£›ö“%ét7g!ðÕÃüè(S}÷3X+Zé†{D{ÖÄÒ%ë“Ñ÷šÎu ûÏzRdˆÒÔWž	üÓ{ìé¢ª&Éúrç ÁSÈQ÷±ƒÍ^ãŠ<^ÂðZdöJÄ~éôM/A†"³r?0œBAÔÛP©Høƒ¢_¡z  äÇ¶†ï)Fž~$'ÄÌ‚M¡¯ËâÄð*õÝ¯Dj„çÃüb1?uàÚ;eÑt@+õúP§§`Z¨ô¨ã;°%m8ˆáÛlfNé4É ÙJI·ž¼ÝÛ#„ë¡Zï[mÂ´ ×Èoå~¥Aþ33wŽµ<7J²¯`¹<‚þé7ÿ«4…÷†×ìëtX êêÕ’ÅUeÁØnîD®ÄþÝ×,H¿27HNy&ª5÷j	ó·S¹êÏeÏæu'ŒwXoËn*W.å•«’sY´	qá‚5q»‚U½]|ï¨ø½’ýôöìáÀÄ‰O1}ï"Y’‹šêñ7GwuZ‘Ëf]°¬®Pýe0hÙA0Ÿ%Ææ˜„|+I›½ÆÔ˜u´gŒVñ.du-^Ë@\?ËŒEf¾ŠµëöÒd8Mªª`k^ÑD¯‰pµá$¿ÞI†ékI;!r«È7!%‹|V£R±Hº<GwKÇ
½9°jª‰÷¬FG5±Ø“I·ÚCd9‚ßÃcÍÒ5ú(’­¸1GÑpÙ|¡ÃU*{¢0Ù3e¢à¬úÉ óóä
Ùnn)ö˜÷höùÁèÈ½×· à3	Õöº[­AguŠ…«ÝÛ^Ûi´Ò5\¹ôÚÙ7Ïnœ…JbÂÎântB†ä¶‹JÄD@äË\s7C§An@Âg”ÈŸ’½üª[$-ÂDT%x_¿š=¿†IzžYEeÄµŸÉ€í™®|ÿtŒ€#h×|Ï^‘ÝÝ+ðð@p|¸”¬ù\§95fhE˜ð‡EÑÞ–S|Tlýp8
^,g;* Žlâa³ªTd†J•À"K~w˜èóûàšV_N·÷}˜^ÿmáõÒ~‰4jÅŸüüz’DÂ4Ÿ#ÃCNÿ1Ç#4ÇCMX÷¤yä61çå„\("Y¤ÖsrógÎÐùô²< ¿
C€¯AÂU$‚5WcÈ¼K8|÷Ædý»?Æ8…l_‘{•Ö¢î2ÓßÆ‹¡ü   ÿÿì}ÿsG–ç¿Rîe—Öµøb[xe!f8cà˜‰=JÝ…Ô¦»«·º…Ph±ƒÏDÌMì^lÄÆÞÍÍq˜Áã_ïŸhý:ÿÀîŸpù^~ÏÊ¬Ìêna1ëŽ£®®ÊÌÊ|™ùò½Ïû<å†»ð ¤ã/’!&Yáê¾PºáWs–ÆŠ³4®õÓ~ÜšÛ{žöŸa¢pp¡¾ó{ä¸€Õ=	Òø8$4§ÒLÜ]§ÀÄž‚na~c¯´?GCž?8ìÂôýàÑyz}¢ÿô¨É›\™(—I;nvš]fv_`Êî:!	p¡—´îA÷!Ñ¨,ÔíÖÁƒfŸG+™ÿÜNKÉx§Ò¢}LšR 46ÎÓv5{âùSürpA!ŽQxIÅ5ZXj¾{tÒÜA8"W™YOÚ&¼EÊÉXRról„ä òs{Äû4MŠNfxn/q’'SÇ’­þ¢B·«Ð’Uþ_LIS;¢@·VJø–P\LR°¤Œÿ§TJj =špÒ8êÀògmVj2Ý ›rv¿«e±³ep®0ZT«ßãÃJô®V1Æ¤Ð¸#šxç&œ€w>…*áUéÎÞý%¼¢e˜*ƒ"úÞ¶ò£{Ž-»½ìË'^ÚíÅ™ìüÂ‚Emø/_†F>pC<Äë©bê¹~åž­^Ò'[k»ºñ½k6ZìgdÇ­jÚHw*SÙ&ïVÆ’•µTì¶‘ÜÍÿdt6ÍF°ª±Æi™”,ÏáP‡ú)aú¶$T²™>˜qK©ë&®]±–—AoØÙ‰ÍSê[ùc0ÏšP”BK=E+ùu‚;ùÏÿöO‘sÉªœÇi¢Ïñ(ÄR[A‡bdÊlÅ¡‹f©õ¥`uAæ²:Làó	Y>˜÷TžÐËÈ¼>EàØÊÄ„F?FõívÜ¯¯’5èÜÑ¹Ó+WÈj`¢öª)=Ž¥±8È'²	‘ßMHÜ`\g«¼™¬_r±‘•ò$Iæ˜Uï£oEI«—>SÎ‹Û+mI‡´þn³¶.W¢}ý/W†ÜcÔÍ¥ddÖfquZ(Ã•1ßìƒëÀóD=BI7=}X©æH7çt UMºä€”|:KºYÒ#ÄÀØm­„aÚ€i€Ê?V'…“n2ÇDC—2LÛ;0k‚b.×TÁY"eo˜qPŸæMšdI[-\<g£?*ÙY˜Õ¹þp“­Ò!ðÎ`eÏb.!Aw2—­ÆDAX€N¶i+	l•Šp*baÅŸŸu`ÄÑ``DEo—sv	÷Ù!Ã}©ñSz‚˜¼uï›9X.EQ	“U}•‡lÖmêºË¨vÛSa:%q³‹ÜD‰Ü$»‘V/°ó‘I vïÜ¼ŒªŠ«êÓ‰qö§ÙkëQ°‰¿VÝ(¼:ôë$¦ÙŽ8*sç³Q:qó²)•J§Eû6¥íÿæ%«6ºÑò ó1µÛ™Æ<z¡«J)à:0¿×Èw4Ç©›¡²Z¶V\Çð0¤ÿøÃ?ýO¥ñaY9ly¡	r
Ë(LO[PÃØ8ÛåbvËÿlà5¶ü8	2)`é³D°?OÄ™c„½ ¨V¢ŸmÒ¶ÛY²ƒ#Ë:ißÜ¤qQe÷WÄ8+¾ÅpÒ/È³Hñ¹táìl´yêô….‘?·|L¥a>W–ÏtfÊÓã:³ÙžnwÓŒ±®÷³€„G¥ÑfèF›9‘f’XPúBCÕ÷0%90ÇÞj’ôØP³§IBžQ1qÉ“ÃV®×“V4?yªØV¦›³qA²5ÈŠÜÈÀ6„ß=$¹ëR3BÚ˜—l	ÒUa¸çÏ?ÒTìš
U^	ã,`à.Øz¹±ùë](^9ØîBéÈµ9Þq-¢ lÏE&ÙÆ_W^®]R`ùVŠâZè'ò‹ÛŠþ6úùÜÒ¥sK¡´hYÐyÊõ??¯Ôòê™¤¬b:y3žMé€Á“Žùñ”ÎÎÆrlÆÂÊ`c~€jÈ¨õÁÎøÀjB¡OåH¤·æÓVša·Q˜ÏÄyúáhž*NÚ‹h±¤
G j–gSRp³ƒf=Ÿ’cA/Éª²–~M6ÏÏMè›°"iÓU	`Ì'ÌáÂF.éQV@³!f¯°ÐËÖª;?œ™A,§o”c˜PÓ5	Ä†¨’b”<oSt…ƒ0`:Â‡©V£``{€È…^u3ÄA.¾>)Oì/ððÒŒ*ŽQ•§1eL%“‰mDâ=h<õ±|I†£í_àñ#ÄÔÃÑYd×3èß²cy>kRÆt5h®†ª÷L7–+ÉB6=‚F`±1C´i–QNv%½¡
G‚1wY½Yš¸€ïÞ%	üD	–=ÜàJˆL=Z!O`;çB`ê0o3ÛwJ·yL4"„\?:‚#S#xÉ)&µù9ù,æ‹j7ÚlÒ Q%à€Kž„ËØÊZš!RR…„!°ªJ×UŠ¡H ÖsR"äHL"¸¤RÛÓð¼å·¡2¸ôiø'ŒF¡T®©!Hhþ­ÿl¨Rd`>0mÂ¨	Â”úÆŸƒž2vn¨IV¾ev"Ø¬´,GƒGänÌta6›<]ÁÎo"s£×¼g”Þ	Uï1‘$„¸4X¦»=â½(ºbòExPp
;ðGê‚ lú„”	†ÆÍXP9±	‚x&]‘1èq½~ ê£à’?£7£~m5%ZoEc›*{<¸\sì«ãñ½jxùWž§ã#ŽÃÇUe:roôkËÍV+iL¸ÇµÊ6ú[6Ä­è¶§¨~H~	€U¤GnNŽ}ðÕÀPïð‹q§éx6íƒ¸¿ZÃÎ¬º$C
{r*2Êš 1}ð GÜúë]”ƒaŠwÙ5èS"'ê`²€z‚éã^Â£yêZ0=)«?{YÆ¹{
<KðŸgüo:ÓŠË(…Î¥²íárÞÿ2SP´Õ2 aÆýñFÂ–Æ&ƒ·’[Ö{ÌtÀOK<„×ôœ½Mï ÄD2_Òh®AË`ì[ñúF’A©¥Z„ÏÒ5¼•×ÛÃþÅ§©K!u-‘¾	g§‰39«w¾°0¬f(F9 Ê:´‘ôêY³v•­Ð¸î|éNOKp‹€)E”€s¬Îi|ºf­e"(mtD…‰NÈ€Æ†â‚ƒf]1‰‹«,ì“Vr¥_‚6ÇÙÏ6N±öJÅ5úÿmêë0˜1kƒ{ClVÄ.!\Ìèö-Cà¿qóeb²‡Ž¹¥'Z²¿‘ãd,K)3ÞâN;DŽh7:œŒûèíÁôÂÎÀ³Øê–Ãòhl·ctpÜìQPºÇÒx¨6džóa,Ž4ü&ÇP“£ššÞcxW®z¥öñ ©M\]¸Eo´üðwdökðtÞžpÊ¿ú˜<…(=Pdn“µá9æ…&ëÂ-Ê@»ó0“ÝÎSÔîÜ„š_¥üõ5AÞÁ€=AàËKH÷0írÐv—J•eÇUÌwj~eMr€ŒÖÜÕ:Ž¤¹3Qk%Øê¹Éiâð\\?/]'ÇX—%p4RgzÞ®ÀõP\?ë¡Ôz¤›öš}<y/]Ï
xº +£,·R`ßê×d†É–¬“¹ÑÈâõ¸ÐSÊÆÙN°VÑ1“jËÆl3¨ÈßwØÂßrÇ ²Ý/ì|Q†÷žè‘#˜ò-¶„±bq¡doòXo:·NØÁìk¡Gºs¤PîÞâ C^;ð c=óåÏÄ ç£˜Z“¾¾…†±hìA›Ë	¹~Àr<+,è|ž•ŠˆÆÉøÀ2p‡”Å@®ÌÜðò÷Š_¼ë‰”¹è›Êïw¯{îÜ£Gþbƒ’Ì¤¹¯"µ-GM2Ÿýx+"ªö–ò rPÞ³Ý	³b¸*šŒ&v=Íìà²)<z]Ã{òJ#êž}ŠçóªDàLÿúØâf|	æ†²@ZöNð­_‡dS˜·t(Ó¢i36bR0ORhKÄ³íZßø² ¢1›¼–AØgÐÍÔ+ÖgR‹0Üx6­ŠGh=a†Ñú0´ïr*&i«ïôJ¹†yƒB‰J‚©ƒ‡ëáÍËÅ)…÷…v`Î³%˜]DLH8³Kh¥ob-“•-è¸^+‘Ys\;ï #í D)aU„ aý¨’½s=\ãú…ªôƒ¯-þO.“0=B`by³sr½›tzÿéV†·</eI§Ñì¬\Ì/ý†áYU<Ã(‡+­ä_¢—½#´–/Œ´ë&µ-2T>¶ú–Ò.t6=Ð-Ðâ+8Ò¿B ¹ ìîHƒéo´°~a¤Zú+3G3ÁÒ+…K¤ôÚu+4žxžSžg—:œÂ®(nŠÚ–{% W<ö‡áS6 nxmb9M®Þ¡a¹jY¦¤@Ü€,ŽÇ•ºt[mS±Õ6KÚjë=„Éœp»áÛ%Ï§=Ìð‚Õ‡å{¶ñ0ÿ*^'ÁÚ’^‡ÉRßÈ*õ×J”×JÊ[ÎÏgé•&t™1ü“ùFŒ;öÇ¸³á„œvwoWk	<Ã‘EÀê öôÏÑ¦ãT";K FJ'¦¯Ã­ÈþwgðWµÞÚòÇI½?vàNŽ?ä½‹‚/7[ÍþFå@D'ê,¥Þ3þñ§¡pî½ÊÎª&=(H@AŸ…Ãg@ÛÝxgü"Ì^²æ¨û¤®µ‡FÃ‡wÆM-|Ø¤~Íˆ…
CÆòJ4Ð4Èç î*Ó°AÆ"ö‰×ƒ×<½èç É5LÓ]Ž¯y,²½Õ½õõèG8\ap v›kˆù¢…4~!|ËÙ\ß{MúN,šúRFk’ILäpÜÜÌû6¥–wâ¸BÉl5ÝÄrÃâ¼¦ÏïBGïßmé­E³„ãçn´
Ö´Í>·iÑT9—DžaÛòÙ±Æ§×êÒï·E™ã ÓR­ÁÌCÉê…CðƒÙ‰rÇßFõëÁWtæ}‰÷/øÜûtð½šÍI·J…)ÅÊk‘Ê·w~?ø"R“jhêC¹ÄEd	}ê;»Ü²O¢êôäÛÑàK´i=<¨!’Ã\‘¾øn6"‹íï(¢Ï`µ²sÓ¯’vY‚F¿UšŽF½ßaÞÜ»Åùž œ2uÎýôÂà·ôÉÛƒ?q\ƒ’1Ëlƒ«(y7)ýì²¿nš¾­)ƒ#ŽÚ42vzc‘ùh®y±ÛJã†•â¸´9m%‹pÜšì§“Yt%KÛ“ý$naˆ$¹`m³[ÚR2½ÉÙdò#V¦cw‰"»‹Ý8»ÚJTÃ›}ªA@Üi¶¡¡Ýµ9`tÇ†4@bïKt2Ëž‘I¸mùÿbã>!FM=¨z¾S—?êm‚ïÏÿüêÿ"u®ß#‚ôÚ0Ír¤ÁÏliiÇ$ìƒDdÞámu¥³&Û	[ÍþŒW4ä*ì]Î>u&!¤FùÕ:Ôb„§MÐnÞæB6„ôJ+^NZÈð'r’Þ£ˆrfñ§9XŒ#Ü±f§»ÖG;Àñ
à*zº–`‚fÈ£YS³“mÁb²wVÈïÌªG–²”T+êm•QRëÇÙJÒ¯aiša~«œoõÆžcSø"îWC ;À[™9žå	®â&ÌWì%­¤Þw½dLx¯yj	z/SñÙü0—-ª	IDÿºKþº3øN|ÉÎ»·é¯ÂcCÞâ‡èå§ä±g´+ÓõGR}/™—>RÛykä±#™	’h¹u¢ÕÒkæ;˜X¢ýb·Ž i»@ðß}²Ù}²É¶jæë ÷¼LÞ ÕÛà
ýgÖ$nÓp1h%»q´læÃÛ”~P3¥…8ÀFFšhlfæPhsöÛ´u°Hjê$;9™Æ˜Ê2i(/~¤ªu'Y¯h‚¯Ë½,ê ½W÷®Åuh´¾0íÌnUÕÔJ)g†ðaoîõN®7ÉÁ¢³ÜÍâáûš¾Ð?¶¡KXBKçåmŒþwÊå€6ö!œæÏl¾£ík3¯dž™îÖgóÖa×h¹Ò¶TÀJay…?ÿã®%Ò&cóéë.z~Xà[UÉ_ˆ—špWš‡ÆØÖfëþšOb|,7B#ë'¬S:ž‰@8&¹U´´“=ÐÜÀYtNš»¸’«´hWn³IH·E6…U²ˆ'èpÞ„yØpaÃzƒ1£»ÄóÙPC¾®íÜ"ÿ«(7Î!°õ•å
Œª•V³·ZØ)&iv«Ÿå•7%ájP÷,t¼Ý“ÔVjÑÅÚbíýZôAÒ‡§3µ3µùÚÈý`51í– ‚Ù¬·ö~uèŒØOK0!}	7¿aØ„7Q|¸W õnòJO!Ó¢û^ûêP0,¶¾ÛùTQ²QOqØãÁsnyH6|zqô®u*7gÓ‚n…Ÿ½²©æLá-DRmäk'§ÛØ—Ìæu³³?DÎmr`fY€„­¢M~÷v6ô¿Ã›kq2öe½.˜3]<ô.ý¡ÝÌŠ«ìŽÑfè~®KÚ…Ášš‘´‰^AþS¼ŒØq¶¥—ËÑý:fvsÇ°ÜÁ¾û’‚É*%¿)ö•ÉL<^ Wæ­%”jŸƒi¾=ø†bî"ó6–Þ…þX9ÄïaÎ:Bzg]àNÑòFÊá[WÌüêÁªv¼¿·ˆh¼÷V›Y4·w¢åf'ú`m5n·cþÃÐ“?Rõ5ê1^}»-ÍÙ;˜;¾ Kðwo?<räÐÁ£‡=òš^“Œi=DXÀsI£Ëyr“æ=â,‰£,]ïßœÙÊéL2i}±Š®ÞWfÚHÚaÄüZo7ÓŽÌLÍœ9JL^ƒüúu	ŒŠ,×XÁs—Ü÷í€qo@%àÛÁh	õïeü%#ƒÇ3²ÚPÏV€rœ*ýP@ú'bä˜¢r0¤KñÑ@½/l’þ"Í€ö™”a£Ï¦5­ÿ/¶ÛÑ\+ú¯kë1™»Ôí¹p=©¯Á¶T«•é*Í²hú-d˜±îYsû7ŠMŒ~jÙ©#CXKP[=lsÁZcîÝ¾çéÚ‘üÊ>Ÿ%f>ÎŒô=:™-ºx|€ìÑªty–ñqšF½ÕÃÆëš! q£A„òt§×@ú[rç˜Ä½ÂeÛCŒ=‘Œ&ÀÒ÷ØâY5”ÿ¡ííƒFä1–¹&é†¸ÕjKƒ\™âÎÆ¨Ù¸>QP¬EE”¸crßV‘æ5Ã¼¼´w!¹“â·Sól»'ÈÔ[–Þ1&‚ð"ZOD9Ã.Âˆ"F¡öÎ@Q@µ—&TÏEÃ ‚ˆÞŒ¦·dX¶Å¶ŒÍPÂ´kÅ=ÏðæÎµÄ¶Jj#Ú<½Ó»š’ÎcoØ±*èP*úÙFº8¦~V=÷Ñú©ïÀ}#¬w5G$ömc-)t@*ËnÎ	9DOºWYt@Û:Z}Wô",§×Âoà;wãfã\g±¹Ò!»iÈ›k¨ïÏJ¶z´TtämÖ‰låbcIq“ûp‰¸l?ÇSYí·[dEÊ=á`nqŠ =Žø cã	BšT,ÐC@a©{I½LºC¹*(v&·;å‘Úù,'Ó0ð¿îLqh_É)÷´+ŒÓ—%m²-)1‘‚¢,AK¾L:€ß9xÜ`÷@`îÒD±ñÀ«TYB$ôGÙÏ
!J9å	RêÍiÖ†µC)¡-‡IYâ‰?Írýã!ê¡ñ
oFJeq’ÎX¡¼ùk@<#àžAõÀµûÖÄ,‘ÌÀ÷P²íÂ+-ŸÈ?ìÿb©?Õò«GR™Š¦kÐJ´NSâqrgbs‚õâkÉ9D¢
Øœ6·û3²tÏð6{ ©eg±¤7uBIÙ¬|» éfx’) ’oÛ*Ê­ª*¯ª×îMÐðo£	ô ä›;&|îÇFªT}ñÐËzî»;xŠûOòo¢°…âQ
îf;ÔíR>˜’tt¨zFÁ;…êå¹.Y	ƒoåº´º™ê³…ok[ÚÔÃñ‚Ð™žyÝóß¾¼fŸ»ˆbÖÁ™œÓ	aÑ¬äKen¡ €¶;¿1Âô\`v©ëu2qÐ¶{±Ô‡ùà²‘ì"´Þ'R‘É–wÆàÿ'¹€Cc«Í7±Õ¡ Ï‹±¦ºB¾[ »ƒËÔé Å£±%Q=FJEµ¶=¨@€mz¶3ç/yíóYr­™¬ŸnTáòÔÜ~€ÜkvçÓ˜ˆ(Ý
@”Ó›­¶\ŽC9Ù)ãšˆª8ËÓº»#Zì‘=ìTè$›Š5øhQÌŒ3¼¤1_Ÿ3° ¶ûTóÎÖ:u8Â{j G$nðâ£—¬·Kí¤ÍTâ‘ðÅ¦FƒÏxŽmGˆ-ae²¶Ë­”»c‹åDJ–†¤F¦o÷|–vãÌŽ^eHÍ+Qõ<{žO²v•eâ•K:6ùa£@s¨LL°ˆzZ.™À'yQ,m.Y¸à7k"UËîÜZó•=s*K“:mO¥ª,8–ª,'(íÅòÏXF?Vu8Ñíãg©ÒÖ~ã†œò;¦üZ¹)Ä‡Y*²÷¦h×d/0dCew¾™Õ[ÉŒa»èÀ×°ÅNFäÉàK‹yÚŒ&üÁÔº'¦ÿý»ßýùæ]#¸áÀV×JÙß‘{ñ°~?$ ^˜'_A¶Vjù
gx…î${ü‘ö‚ÆTV¬Êš2¹,õR^XWÒ©•ç¦ô­Ü%Õ5ÐûÄ#8‹4Š}†ùçu3k·-ü)ç{°5ÿ°Ò}ìHƒùØó•%§0Ñá*.Fop%ñmjZ4Ð·f;<æ¾ˆ?Ù&K˜`S?j,yÊ†®fýH~ýšôÿSü-_€ÉÎ#C)iÝNV†ÌªóØ#pf,ŸEÔyMídZ§gUÚŒ[g’>YzG$«Þ/cÆ[û€$s…¹ís15x•€U¥‘Ž§"¤]T•²#º-ê­œgÑ]Ô¬(
_¤g 5ôe/ópgl]¶u¬C-sÃ)T±6•÷?þðOÿÆ0Ld"ÝÇ©ôP.R€.ïDÌ[ó-e-IqV_m^Kö¦ñÆýÅKNÎAeÇ°5äVCï¸XõvEdV’Q_úi¶7…F6ï/^lÜÝ'w~/wÊ¼äžCŒ<Q>áZ‰Ð—J‰’‹–gÓ³äÂfXqç´ûæÓv7í)°‘(îwŽ¾£ø ë…t÷ˆÂŠéEv‡üSŠ‘ÇðùEŠ£¯!¤Ï_¹63tsß¦Øì2YÝŠ	@ƒ3P½$[íÒCE~ÛØf-Ç mK<³F¾O&ÑKrá×¦3~JùEébðLF˜êMðpž‰ñ]mV«…ì”É¯—´–º>÷ä¹ùKKœ?3·´°ÈÒòrjE––—âš“ÆRÒîBGB*Ì_ýJòÃƒ¹UD…óžô¿¼žŸ&yJÕàAÅÓˆ ã¬*žÆSTÖ¢µµ”êæõìžµVËIZHëa«HÒ˜'SKT]I¼bz¥Ögýõ^ÚØpJ-àÏRúåæ/7çç.½øÁ{~¹õË­©•¬™¦ZÌ™Óg—.û`A-†vÐ»òoŒ ãiMK~úä¥³çŠK‡p”Ò¥Ÿ»xaIw¤}þÜùóçÎ’öéE¤ÝnÚIŠ²ÜYÆañâ{ÿeaÞ(‰‘–*èÔÂ‚^È•$a…×úé™´·’Å~Öì¬€î=9·PÁ„³ƒ{néÜÉ¹¿¿t’ÌF^™Hg6âÓ‹çªîÂH]§ð{¹:Ë³qØ>¹Øw±[À­g8)äØuoÝc"Þ°Viîí×õ-?ï6]=wE–_¥ýŒ”6¸Ôb®œª‰ó–kÃyòõ}«¢™Nq>}5œ¸OÃ‰û54LC<1
÷“•4Û(Š)6?>úý¢!ý.¸m½« ’œÏF ÷"GÆ²[²'vîÑDOS¥N7S 0	T9¸‡“<G »‹™W#æÝ›‚¸iê?)² ‘Ð¤sáÔ¾ßÛèÔ£bÝXÿtâkÍ81Â(t—Ó8kÔÖ3²+À™¨jj‚mþ!»|Ö¯BÑ-fp‡ž›ƒ’´–b»îÉ¨[Ì	ó CÞ0ŒøÑ• ê­®?óãÃlIËˆŠûs±¼¼“G%¶F]XQ[ÞæúEâ6Òî†žL€õ<=®òÞWN¥~ç&./ªTH×É±%]¯up¹D/]
mW0rVÔÝÛ¯zÔ¦i–Bºœ¦8ïüÉSc¯êÐBµÓËDM“IÀÕÏÌ/§åêds>M÷®é¾Í5ÝvƒÐ³æ…²Î˜Ö­$†´0“YÒŠ¯'‚AÖ§%Û–2ñQì¾ZCß¡Du¶€£pHå»¥%;uúÂx2¢º÷•Ž2ô	ë±¸Óãu,ÍýôÌé³!´ö¶˜µÖŠ2-I‡Í„b'6¹õÖ|hX®– –tstP6¨t³„š1èé.	­4í%Víh wº?Ó¡¹Ûú2]•Skv\m­#ºÉQ}É„ávdÐy+ˆ¿¯f¥¹mÍc{ ‘²›!¹¸9¶€«=ž¸o)Ka©ÝŸ¬¨ø†ÂŸÚÍÖ„}ct”eu„ºJXü‡J´=¢…Ÿ†+ ;ƒœg,tÃ9ÄlÞƒßæìòMìO¸§³ggõv‚Umù®i sí¸¯$'Ö±g2_Ù’[qîËHŽV±¾RäLq1j—g;ó6<g^	nŒ1ï½2R½~œõ‡LŸç|Z$í š™šª¹€'-µ@0âW7DJjøû¨/E?çÒŸ9" xš5–j®7hD¶UànƒÒë…h/ëGè6(Uæ]#<Ûnù0­ï @‘^Âk_`ÞøFmyÃ_Ï¨{Y‘'˜L7¶ÔôVÉ	çê¤OO;@KâjÜi´Èº·ÞÞr²þ‘Éë;BjÂ,B3­á\²åBGÅ^Y=ÄãÞS¤ïüHÄ°Æô:õl£œ<ï"wd!²ž§È¦ø	°Í:n«wŽW?5sìL*£ËŽ¸B‡Ž0últŒ•'êÓrCÎ´%Å§œ™,Kþa-é1¤yÕ/Á<å³âëÑV*¼å¡(ÌF—õ‡g£}|ùºì/£Acx)·ib²}b©úUdjèûr+»‰€Fúª³.;mé&Yûýdƒô@ÅÅÿÍþâ5©Àze@äY¤wz@ÁD,hìÀl	Ëi+]™[k4ûsØªjåäÂ™…¥ÎÐ¦Ö]vë[ˆ[lïCkø3&Ò®õªUrª½†oˆlŒ×ñÒu€
¼qü8-6 Ü-_ny
ñhK¬Ð<C‹×]¡ÅÎTØš| ‡²ž<éY¯ÂâåÅí‹àH'OÇ¶éŽÅ²47ðKò£~-ÀÂß¡)ŒK£Ý»il»bÚGF¶¹Ï¼!çÝ{¸M<å&Tµò(3÷Ñ77†P¯ÏÕ
›J^žP Èÿ6M±ÇÁÛ÷yd-ÆÓd^¤ñ˜Ö1KI®89§Ø•$çwyÙŠÕ{žœói\˜!GÿŒ#_Ž  BÂ‰ÍoÂûæ´MgÏ™ñeÏ¢\:]ŽÑ¤b#B¸1Š×È˜"idOÞí“Êu¹TþîMÒwÌ|Ò-Ð (º°oôÎ$W U^ìô›­j·–\ï6³‡êàfI›Lw²'ùêGÝ2<àd¿¹$Œ¢r‚ôŒ€Ñ-•90#2ˆ^oªûUdÝƒü¹pIñ°û½ö‘áŒ%AápÖåRz³CzÁïÅ•D£L“ÑÃBWE÷2Q+&'g]á†ºnÐ¼ÇÀTG÷Tº·c·-„ˆ–ŽÝvAhh’èÞÖ¼hð5€OeÇmaÒò¿,¼mª©<žX4VMâycRŸRîkã&ÂZç1Sc¿‚]èlJÖ„fÃåy° gdD±Ü'§¢óçæÈÕ-cå
ËÀÍM5ž¬Û&á„ƒ	ÕB‹dîª¥á)%e*f¤ô†¦óˆ]4C<ÄÞž¢+Ä!€[\¯×»D—zp¥Y÷YŠlÚ_šË´cyŽ<:D;A_ó–2´Ë}çÚçÚº,O¦lð9¯pÊszZ¡Uí^ûòÛ—åå`¤?ÂTž°–›V3r	±šØÍD_3”•Ìg'S…
-e¢MÚÀ›¶2SJ4!¡ÉyXÌR´DÝP;ZÒ ¿-iÝ@KZ€-ÍoM <¾"‹ZèoÁÑÖéræ´Ý7¨¨Éoå¯fTfiWîBŠKJÍµ6Àpê<RÉ×”D&E¯N”Œ"º(›·MðliÃí¤¨Æ„Ò^€ç
Äã%ÝÀwnFïÿý<ÅXÜÆHïÑÜgJ™ ¯nÔ_1ßEÓçJ‹œ#¯OÆkýtüïoˆtxŸW|® ä:)l÷m^ÝÐ"±ËG–A^*X|qPþ&&èsÈG/­˜RÊ„fù¡V‰Ú,Pã#PFx=î×W[Í^Ï³lÙmˆé^$;tÜè­&IŽ!à_·£\†Q²+}GFû)O÷Áx,ÉbúÐþ‹UèŠ_ð×·ñXîªHôú¯˜q"@ M{Xè¤Ÿƒ`‹ðLÛ8ý¿WƒoÀOAþþ·š©hqé~ò¶’nšÙILýƒïdŠpO1ñ÷«¦lÐM¤!6UfF½Þ#T#{0púCq?¨bV&ÈÐ1÷‰¶Z€•Ïs"Üõú(Ä!ø.‘ Ç>É¶¸T‰LM-Æ<õÜ±Ê£ãX­ Ì{8x‚dß7xÃ÷2¸!š|qëI	ÒNtKÛ'7Xš=J.¼‘’ïc}åÓ”§3ž¨‰r+f]¯Ä‚þÊ¾~Àà_!áG…KÒ½ZA÷	ß“Ëò„†0•3I#eiáf;L¾Å;Ÿˆùà)èë^‹3ú€Á³è"	¤µCNpp0ƒT!û2|ò™ò†<›¾†(¡gB°0QÉ62A‹ìgZáE6ã•vßHftS³TXWÌ¹UÝ·¹'KI–¥‘ý3šüÃRò<¢f5°%MÔ¼ö"ÓVDÔoGèf"eX¾Å•ï2ÔÞB‡0¹FåÐúÃÈØ¥p¤rÉà¥êcï,ÎºTš"±ÍÁWZ "Ø‘¯4;I:êÖàÿ’¢ž„ÄËR%S,»U³Ú"âkÉb?Íâ•¤ZÁ¾DòKR‹!+[¨Ç.Vl+´‡Ó¡ïrhÂ2°4~ŸBÅåBr%Kz«óëšÉ+ÊK¼mñ2–H²ñºeî¹›¤ÏŽVbÓà6ªP£nàSz€AÑ³âj¼1ÃÜ¥;Æuœ\Ùðâòƒ™É G×ëIkè¡–yØk¾A÷§Ü +ê—4îvŒ ƒüñ\C;Ÿ8Ã{MUI‹)uÈp¤Y,ªÌ«—aÒ.‡‰Ï–èO©ÊJ‘ï"@E½z Òeú¼µ¦ÒFåÃ¡Ú¤*ÜG4_²$_‹µÅ+®RÂ]Ì+â'w8ô¥ß–…ÒJý=¸|¾§QµI)÷aZ>¿g¸Ðû&4*¨CÞ^ËÅÝ—½´)!ž^Jâ/L±‡Çj7ZÚè&§¨ŠâAV$P]?y9–v$´ÉZÑ–ÁjFÑŠ¤Î—k©4 QhEÎ/3þÜØPgœÆ þñ | i(ÅL¾ýÍÍCSŸS*ŠøËñó'-L¡*wl1va;Š3^î¥­528˜ñ,‰iwrzj&¢Ö:ìþ¼`¤ûð€Ø‘£¨pPh"D(µØÈ¨…T{}!ï<ÉÑ1½Ÿ+£˜–§SÙ—ü}Ðð!l˜ú©™OáK°X°pb¢bÝÆÃ'^¸Köømq¡'È…8wm¤(ŽÝt¨›M¾C^‚3/ðÉM=ŒäïúZoV¨A$\L×ú-rÞ˜ì@®ò‚ÆÈ„Ç…j_ïRÈºj]-M¨¸líü£úÔÙb9cKEs$¿tM+Ñ²*Æðá$h{¤¨c£-iž­à§ 5Ïð–ã*ôóú¸a9™‚7’†úèx¤Y 9ºVe¯ñRÜèû A‹H.„ñvø›v7Ïk]‰[½¤èt‹¹tò3£ÖÏšíªÈAÎ…ÅÐ>øãyYé™t=É€Ÿ®ZxÔöRfÂ;°«Œ¿è~A¯­ÖìÔ[k¤Wý‡	 Æ(Xy©ðeäÉù«G4^&ý:r©8òªŒ\ba£q«Ùß+×
Ê/(¼`ÀÁîâü1@ü"âg¢“µËfFº¬’“³q¤™ÅÍ±P‡pòõ³ ^¯þª±C0§¬ ‚©Ÿqs&=5Mq•à3€|÷WÇ[dÙÁüCdE`SýÓØ«Ò²T{% )©z’bj¼ÜÞ“ªÚ.t˜2}‚çì¯Æ[‘ž‰rìb-¤Ä9!5‘»¼S J"Ñ?]—ÓÆ†Új¢)4ät±?B¬-ü³™ÛÐéy\lßA<¦ýŒ¼Ùf¢ŒPäÔáfÑRcc×ÑöÈ-Ò£Þî©Kc4ÓOØ¼NÜNõ+Êh>†Šû¨L5p†·	‚b:DÅ£w®‹4/¾>IA›Š&1ŽÑt^åJrª|LV—_c<ƒ¢¨\#âÑêê>¶Jùº*PÁ¬¤ô3.ý”±Ÿ]r´ë5Ö‚ê€³×—š hù±ETˆB{éZV—ô"b÷7˜‚ŠkÜ®líb+O±iT²¥ÃxÅõ-”‚Æ¶å×?CXÈÏØ<ç—94Nü`“-$ƒj¯Sì¸KÍóó™
øµå=aï;gãt·|Í.#zæúyá‡Ä’^rýcúÌQ!ë”á˜G…°šÃCä' DD¹¹DáA<Ùôcº²
CG ¸Ð>2|ìˆüèQ$‚!GJQhQ¡»Èá%Ê£ÁÚôî°}2D£ÈGÜ+ƒÇr;%¯|Sº¬™ïsõhˆFp>é‰ï}Ÿît8K¦ç‚HL´Ÿ£kï2H±e/è’@×wtçµŽéò2çyÈ±,«®Ùéâx-¤à±þ`†ÙÀÇÛÞÈâWN$Þòœ*5t°ˆÉãÅÏù-54ö‘2HôÑ¥U!ßM¬/ZC°}÷xa÷¤ÐZÞL»¥6“Ã™»ŠCw«§N_œàl¶ˆcÞ8`×_G,ŸÜmŠù½Eƒdh$í÷dö1Åá.ýÅÉòCß{<D¸48bŒØŸ ®–þ§È[[Há"†L>ð„–ÑçÍZ?zF~@«
ùL”Kî§eá4ª™eb–{(kµ,ÏkÑ
¦cQÂ’¡{Ê0°/tŠƒh}/—%È@ÿÜg³d†YÃpe„8õ¹…“Øº¸M†«ª¯¬$ØÄåHnËp^yVwx(î6„¸$¹
Í mèõãþZ/Ääç•	èå¶Cn<kº—÷„	P‡Yú’k½n³Ntêô”Sø–£1nŠ@»~â`y)C=¿—õ‹•‚†¡zòÍZ¡Ùi¸0D•hDßx5šýˆ:pƒå©sÉÌ‹9`u>@X?d.øøçðÿ¨zñ½sÈ§OöÄG q7Ì”eŸ§'…Üàm €Ô—2ØÂÀ8MÑ,ƒ`8•fíê&9wÃ
Q¦ñÙ?!ì=B7¬RB‡™ÕØDoÃ™ÏíÃ|„„‘_PÁ~ÆãÎþ) BQÄÉ ÜyvrÀº¡iý‹º>l¦ÝƒÈ5ª¥ç¦¿@&™ÏáRñúž¯r¦ ¤’l¡Dy(À¸ÂáÊ(~ÈŠ1rwrßp¸’n…£Íðß"+ÅCHN~q<Ð=Ýù=$˜„^~†Kù/°…EÕóç'ÆÐÏRÑ‚^æ6Ã«¸²\­eÍÞUzX—«€…üj­›t'^Ý¨HR/=ˆ{#cÊicƒÆ\š\ü	EYŒ¿zàI°ÃÕmJ07òx¨9§Èˆœ\–6¥Lïr¦:Ö¿üëØz˜híc²x|B÷R‘‰µ=Ãõ¥8q{h·*-pˆ:ÕÑ¹°ó– `ŽüÈã¤éï¼i•g€woúŠšBTz¢=HY)™ÁÓM»xl¡Ýío,’·N¢f=íß¼ØK2Ô	·°ÏŽW“¦ÞÎ¿Sã¹é×<Úù¶€]D­8Òn'ÏäÔ¹Úl4
ÏÒ>8h¨ñi{²WÏÒVk9.v÷:!c4oÌ‡o9(ó¦x³ö*Vˆ×`Ï/óbzB ¦g(G[	<ûø+óÆ[%'Ì0ÇW‰d ºâ)‡›Ý«½¤_I‹0Ó€v±BáY¯xäkÑuî|B·±]«¸4€ÎïºÏ:‡›u¯â(x¼CzâBr-:Îÿj&ëhý»Z#Íb0e6À1-éÁ—RZ®äg5”I§ö»êDú	÷ÐnbýcðUÍ<.¬V8dÊ›?MP1mN…ï„$6³×’CÁp,aZ¢*Æabf Åº¿/0îÔâ£˜Vé®€îÞRP~2³Oßuµ¶¶œn`ÿîÎûŒb­Î]9Eô·Þ˜!w¢^îzñgâãŸM<±Ð+-²Ùû»kY·¥D†²ïx„†mTžÚKa?ÃxÇ•¶Yc»8e`K'«4"Œƒfë\mºOJ,ö¶$ÅÞæ\*ðJ¯(\¸RÜ6¢É?ú3×IN/¾iþÜ™s?¤»ÒGøvð×ƒù•ÈðÒâÒÜÒÅEùbô@M_-Ü¶[/7Î-ˆz%qà
A™mgSêÇŽG‡Br#(Í²Nü§åù’à'¤Ó`År`cx2‚‰’KÆÖ-µù*¤êº‰á”•oæ®,l?Ô„
Æ¨¹‚‹/A6Gàe_ìÜ §IŠá½¼£ÀÇÎ.P)0Oi´Í)ÉZT³#í„< æu‰¦Z2EÜ|ƒ».9·¿ L_¤°|qíž)èœàÊÂ‡9*N..¥à¢øÄðæðeFµZíj”óhN&fŸº5G,+É«¤‹-Œ—FVbº¹Ï)zOòËìž0,¾
/üŠE@P Pl|2Ò§³±¬\ïîO‰¡–^î±õ4¡¡ãø6Úï¾æ1NØÄî‰ÁùŒ¥Ýó‚0lÄÓh1OZÔ“ôG$0DJ†ØÈ (Z¬dVOrµljõ“ŠRâžt«	Ä:Ù²ô^<›ÀMÌˆš‹‘¡·Éµb÷³Ÿé1 ô{Œ2åš‚î/À6†0©¢@)—”	!7Ê‰Š’÷$¤1ž½žFýÐp¤ÀÜ4W‡A*„T.©T ÒXsÙ-uñH–ˆ$.Ú»³©ŒT~OÙ+O`ì’—!Ö—ÏÚäl*y$Î±5Í˜![ûîÈ›£A2Nô»dûù†l)‹ë^t&]™(•A'†Ç.‘uswòè” ôV¡vGË°„:Üÿé¹G¤è3Ÿï"–Ó‘wÑÌ˜aaM-äýY³×O³¶6Ì.X¼ ¦Q°ÑcÈÍàè‡ˆ€¹%»`>ï~FDí|IS( ç¤ ø„"Ø"TY"‚—¸QH°4Ý>8% rb¥¿=CòßßÒøžüò¹šTAÏF¾|‹¨QN3Ž®ðm™Ÿâ*#·
ºjXU™FÊÖkuI¹3(¹ó(všSwrEY#¢&ÁD(‡÷bžþ~çSG9ñÅ	ºs×7ß¨ÇŸ7“uÞ˜ÀˆÎÒ Üé™ Óª%×Îá·5—z›Á»„j†Ói™¬Ÿ®EÊ¦ÂU¾ÄœQÐwh²–qÅMeóA·¿*óì¶o}áü'sök˜•;¿ÁiÌrÀ4ý6tƒ&‹ÂàÎTò'äÏFmþ^	šŒáöà;8 ¾+x`ð(Bz¯[€¬¿GS”
>
>áyÚ‚aO‚âXÆ×“  ,2@\”¡ ¥# ÿ0 GF€íªì«Þh Ep8èì=7Jw‰D³	.÷pÌNžC©ÄæªW®fûÿpzÚærâóã{rºaÁLþTÛi2œCD¢o@Â–Cš©½èôÉW¦öÄ€ãßG@+Ç¨+±PîÛNÍ‰lWá‘ëÒ%‘õ„Z`•‹;Í6Dw­ÕKhÂ«[h?º£æ¯ad/ßËUˆ/;L:¸?Œ.QN±Á¾°}EL¹	$FH\£–(@ÑSÍÅ³s—~vîÂéÿ¶pò3AŒEl`ÒE_<ò©¿z4‰1$¨ç}+±écêËÄC§§ƒ}Héê¡ü¶ôE¡‘Š‰"±µƒÇ€‘Œh²,Øº~Ð’1Î!Zð;’cÕµy/ Ð×L%’d<rÊE“½…h¾±WESœaI¿³nÞ†õÛ<¨ÈŒñd») Þ(•Û;7v_@™„—YèFßÂU¨š<½YOnœï
	¬(¦xLRÉqt|by~áÂ§OŸ;{iþgsgºð*ÄKŒíKáæ¿KDíÏBý{ì,ð)~y„
qQwŽ.	Ÿ
=Éo?QeœÒ…ê¯Ã«›Ÿ®ÛŽ/¢¾¨ìi[è3‹Ñ™y@H¥¸<ÊäºˆD¶¥€ás\¨ÑÒÅµúó]„g¼9/pzÒ÷YJ²¶ÏubKy1§Q.ßEqÆÁf­*`µ’:·pmã±î	ÿ
ÞùçR±„¨ŸÏÈÃh»»s'ÂØûåü)?£ÅÅ›cŒÙ1zFF™ð¸\NŒÂ¬^¯Kqb™r3<€³ÂÎÂÔOWVZ,yA¯º_8ök4L›—hòù3Ì”Õzš¡ÞjºÎ*®‰zÌÙ0þÑ%RÛw$Þ™­s,.¦,äQ*{È3ýY&vfÛøÊa(äCÍýuE[¶½C¼”{6~ºµaV7Èé¶s›ìe/%b‚ò†¹¶4¥–^ÒJê¾uP_ß¨cž¾’ß9œ[ã6Å*§d®s?!rJŽQ6¹Y6ì¢å¤@Èƒ×”H‰Gõ-zoigíy™ªäÀ¶„ )cÌQ‰¢O–®Âvà>ñø×/sÍØ`iªÒ¾;x01tkdþå÷ÿþÝï"áÀ§'Â¨Jo¾‚¼‚Lêúçÿ©g ]ÿ¯æ¾v kþT«™ŠªÚÃ×wñüÉ9èÎ?ÿÛï°7¥Õ®J¾èù´èÿõ?¢Á=¶óÿ1ªÒë#4Y•Ç¹ùù…ÅERÉ¿þoh¿v¶§	»D†6àØ]K-¼,–4«)ƒÒ‘»vgþ m¬ñ-~¤UX-èÇUØø8Wa-g=Yo ÜýÖÐÂnø„Hyß"ö>:ì?_™tw©”Ew˜úÃð‡0X\*¡€çÖÑó	îšé:AKÿ–þ°FÝ2BåôŒ„nfL¢¤Ìövw@S—ocÞ¡À{GêRÌÓÁ7˜Hx*ŸaXÄ9$ž›FŒ;˜R]aæ½°yL÷z"à¦á Hd(˜ÒÒ#ßSñoàõ„Y_ú¡çl`Â•LúÎÈOÔ9SpËÐ•—ÊIp¢ÌÝÃ÷Ç|/¾:áþS¾7P+"ò-g«Z¡mànBœ±\@žÒ5e°ýì·‚;Æ«±qžûèÒËdì,¥@Ù$€IƒèÑñ¨rúä¥f;éõãv÷ „:Åý~Ò¸$¯Ó%rþ*Å…vÜl¸¶’ô$y	¬ßÑs€ª5–PÙ_K€>p’† 8}þ—ŠÍJ›¥ëÐÒÊÈ+ÈÞá½+Šª-èº€£èreßfh1*ð¯>ï&~á
ïAÑ˜À¥Â_#½xº‘¿F3ÈïØÇêènþ]ºøæþ‚b²0ÑJ:0ú5³)ô*U-KÐ¦YªL­ˆöW*û'øm,£è–fw®ÑÈ’^WpÙÛÁEéÙˆ~œ6;Õ
/šÊÎr+]F&–õè=ògõÃÊ/×N-œ:U‰Þ“àM”°ÕìÎ³ž§ê½k?©¯ÆQ×¯õ¯L¾ý“J ‚ŸV»–µH­/œ©Õ³„hÙç–?&«ù^…ÕQ³ÛI§ÏÊYh%ð­Z‰ý×V³ä
)ƒ4Æo#]ï´Ò¸Aî¿,—zI}-kö7.íÛì§xãôâ¹êÄVtÍe‘uXŠ¥z£¼H#{_H0–v“§%O±¹2ÿÒÌõÞð9ŠäŸ³ˆ*È6&ü[·èk~ñçE3ÆÔ0,?œ&P47úPGŸAš7îLÈcdÚóñì½£ðìiyö¾áž•Bv!²—2.Ë`@êJ@®rÀ3æìUwâQâVgœ¯.¡cÀÜF+ÝjÌ¹ÉZˆ¢`FKOpûsí?¢€ÑvúG+\¸¶R×vÎ{)»Gz…¹qÄºu†º—ÔŒ¿s;:}Þ_°/:+€œ®5±yf¯~¬u-Œf
=4{;dõ[M3²@FzïeFd~ïH8Â‚\ÛêÑöÐHˆãÑ°–wcôO *”üOƒªâ^‰ÅEY³³29Mÿá¸Ø€€^KÑ¤XeØw¥ìŠÞŽ€*µ÷´Ð\™1rGñ—óÙÐjÜ„e­l}š¿†ÖµÜZSjÂoJ=ø½l-ÔgC‹§;í´¾ñ*£"ej Þ›Y/=™,[Öã©fëC}Î~„§4]ÑÕ¡RÓîL¼œ´F˜v¦óóA±ësèÉ5„S«Ì¬2\¨Üs:ää)v’1C\¾Ï2ÓÀíÖ,#êæPR¬_
ÛF³×mÅÒhC7@»5§Ê°ÀÊf$hƒR…Ñ(œ·µIt†³ÕF3í¤:á·•DÑ»‘V[À³Ñå}›Z?=“ÖãV-^ìÃ>V­ÄÙäAlFIœ‘1ë¬‘…§Y'—ÚdÕY%Wf&Í•fŸ\iÄÊwˆJÔráòå®¦k™V
Ñ×ú‰v©—>mh—à±é™Y`M &¯e²JzÅ"˜/W°åB_ë|¹›—5€–¡b½+µŠó—„Lã€°fÀdVr÷ÛH+Þ</ž–).¶“.”È×„Ñéá£”lµ¨Pz\sªm•aSðTþN>†Š6¥¹qŠÉ‡sSœ^<‰v¦iÓ%¼]Á»>CÅEi%š|ˆôÌÐ[Ât]ŽþÐ^*Eh7!=ö=ÒGkh)ªn³
àý–ŸÓ'g£¿¯yšLÙwY*öÐ×,Ñ)#Ìg%Ì?XbøÅË¢·A~EoY±.CzÃ}úå­Ë°FöÉk0§ÑÜ¼Üì Æe¹•©"ÌP‘œÖs”!`‚·oS9‚®ÖðÙTTèÐN³¬Wó›_(Gkn©`ÃábÒ u‘X‘Aƒ
4Z±ì‡/¶øÒ´æo*Fê¢+ióØBÓm†n×ÙC„P÷‚S°<k[ÃeFÓÍ7³z+™ñÂ`wmH~èNgzE›¬ÃS¢Ãó½*}Ö»Ñ¯!…Žmt±øb`•ºÌAÖ††TÐvCÓÂùxý@CìµÊ™›üc£èÙ'”wG|D™s‹ò,Q#ÿæo"í;-ƒ^éNQÚTÄ\n¨Ó
¡Ä…äÊ¬ÞœRªû«™IÆzÓJâÚÒ“V|=i”¤Î7´åÍËjœYy,•2oŠÎêô\ž£½ÎwŽèü<ªŠÃølÄï0ßÎÙZËh‹0”Ž³×Tp5ÝÁ¸ÔqÇIQt°±]U–Éƒ*2òF­=Äiú™ÚôÑ·kÓµéƒÁ§¡ñ®‹!$’><N1,ÑGé%t’…±‘ž0G¸aqå¼b¿®Nxè¨•›«½<©<¢ÉÈ‹K¶òh™‰õô„–*ßƒÍ<ˆhž?8 Îá¾J’ÀŒ­±'¥7ŸÂÉïüáØíòWÇHíIÑÛæýBP†Q¨IU\ŠØ³›%õ¤Aª÷#³ç^fö|/M¯žë’žú ö¤g ä£´Ê6ÃúsÎU¶–ãW@í©ª`ºÉ¯†*?=Ÿá+l¨9=i¼…æÃ×—…$cÈì®â]rŠP BŒÍ‡­ÀÓˆ¢|À1]ª[Ð]¯½gal@>‰ÅâjºN•ó|M£ÉKÀ]æ\îým³Nk¦m¡ú7Ã!Wy|-]ÍŒ<9oY±µd³6Ñ9Lç[k=Œ˜¿xbhÈ'ƒ»‘”¼ˆgr­C[–˜€±ß $ò…º}¸$g@°¡d_a6j÷~UO[Q»1‹géºegˆØv%ü”G\«w}†Ü†MþŒÞjÖì\t®´‘FDú¨4d†áÒ ¿iÊÃÌxN€a|©--Øqã¼BÝìV ^1£‡K(„EˆEv‹Q¦oà>Ù˜ƒÎë‡3qÑxg±‘ïÄT#IpÝ<—	_òH\›JÀØCy€†f Còð@birµÌÅ|\z£uÍdÇ)3¯ÀæïßÏe¯—,'
mv¢+qÿm¬e˜Í¦À¨0>>¢</‚T…Ü>îsfÌ§kYßG{`§;8o)ÃÇx ®ý…”c¡:`Fú±’,àAäRûõ‡¥ÚÃÿõaVxéæ¨EKž,YÛÛ]ôë(U±Ó9Ÿl“½ð»\e–ßÇõfOI¡ÏhŸ=†tÃ|«¯¾àãÜr0¸ôØx¬ßr°Ðn’%ÎËƒâY´R~\¼|'|$ƒ(6?¬hÂ ª°9Aqß`Ö€ü’+/úmüvWÑ0Áíçì²E´YiDAù
óo<¨|DCP’6y¡A—½7B(“ö—3òç	øÿ-'
Œ–|¢ÏP¢o£-cŒ'´•4ÛuïÔŠùq®xçŠË°Ùb–
y„1„uÙßÃlO ¸þã_å[òU|Úñ÷0Å°$	”ú›þ]¾˜¯RXYþJ¶b–z4}€Uä1Ä "eˆírø†<ÏŸ‘ãÓ8wÃ¿''¿ç·,âÇ¹íÛÏcùy=spæhåüw˜Gà£G†yô0>zx˜Gá£‡†ytM§,ð¶ìÉŽ{™]t{çfÞñ‘s„ØF•47í†šæÆz~þh1Yø,L²íjuô%ª2ð8„ƒøì#ÐšS»!ûØ/iÄÔÍ¶†c±¤M½Ø76¢s†f»*tZ—ƒ:‚qª ì¨[íÉ<°4Ð#‰Í=wí8»ÊM˜‡(’E¢K™(tÓû€!ã
ý(Èç¯Ž
—ò‚fØ›3ýÕ— Ô™	ÎÓhk4î;ùw¥­I[¹!o#·{TþrKÞ·å¸—¸½Ð7×ë¬­ ˆ¥8Å¾0FF%ª€Äqå‹wFW0œ"Ï€g%íQù~$xÏ´Í/'?¯%­‚PÂ™éAùàºt‚ö[Üí&qëRgž€T²9ÑÌêkMº0“›ë`;S’o=²TNTóõlMø[Wà³(K³¯û‰·¼šü6¤™9¤xê<XP"(‡Õ..îP&¥N»²Œy³j@„«²ôÛ¥ë-*]67Ž…l“S¼0ÿõlá*S £òÐ[k“jã4È;Ô…?èš'\nWJy¥ÁdÁÊØ-ÆN|­¹÷ÓXÒºËiœ5jëiÝy¯êå}êbüËŽnžŸöåt	réù·éK“(J¿I“ˆË~r9rªV0µágœæI ,îøe“>BhÆwpÇ6)Ì,Þð‘ÛLçÛBt[*“|]r2ÄÑ@,*¼°Å,ÙÚ“Ÿ²”©øHg#
¥7}MÎMh‚n>ínèº*mHá*’%«Û¸r‰²’K@Šèßãbä©áñ|É>À55¨¯\ZnÅ«>b	²»¯tRRU’eIV"“NiË¥¶É§ã‘œ¬Ç¶œn^ØrŸ@\‘té8ò”GŽ=Ê…WhÖIçì’ÔhE¿¶b#È‹8Í‘]pç‘É‰´û¢³H:<nôV“Ä _—Q„ÜO‘ª¤–WJ-8L´°)–&jc
ÞËÄ4Q¬!æ ŽBJÊÀ¶Ff1FáX 7öáÊèg¨Î'Y,mx%fi'&G); ×sýÞ ÞOô.¯5Þ86dìû‡Eï‹Å¯r®ú&>Ûîõ|«¸Ý8é–²¸·:£=ÓÌ?\þ¹VúG·ÙØm7ÎŽ-–ÛP¢ÑÒJod*>8r ÑF*_µª“ë/(V”kåvh²ãhéÍ±‡úø3””ŠñI¯\iÖ›ä`D:1Ù>â|laùí.;R—óìvÌÊ±EäC+4žñ¬)Ï%ôS ¬Õã¿ÀüÒ±X¸bXF_13üÜS´ÖÎ¨Êæ ¤ùœÈàƒ	ž›ó1M,N…ó%|9ö)bui$ÏoYžqúv;79†çSüý)=	G‰ƒÎnG”™w®õÒî'î±é¨µ¢zËpômrNgé©fÖŽÎ$}"'HVý7‡ê\£ÝìDç:­	‡½Ì¤Âû-†o¢»(ÆÊò{kÍùÆ9s0oµS€é ÖªHóáÙ›(³K˜ÙÛa½¸ùFµ¾FŽ>èHµ.Qšš½QÙ{ï2Ýé[Åæpƒ@dõ,m%ï'tÁ‹ad*EŠ–94òPªCÁ·ªØuÅæ#;¾GN}bdäÊYÊšqgEØLÞ‘œ»­@¥9Ö=A&â×`ÙùEÃ2x‰“PÐSºæ9¹¦Nh6¤Àh>x;b¤%i¯+‡c›¨Ræ:"ÃÌS&](¡þð¤‘ý‰²ÕBaîwª´]{›,¯ð,¶z8Œ¯Î½À+‹»6úd¶÷(n@¤²Ïw~§×ß<Æœgˆ®þÛ?DýË+Y¿ø¥ç4J²8m|±»qóÕ®,Ø¢Ò¸mß:èôøå}øF áŒnÛ î¥Ùd7mâV0Œ€´übrtÌ·Ò53Q]b`öÃˆ—‚áJö•^~hÔ¨*¾[ãz=éöWšm2^SÝÎÊ¸Û%§_=™ê6®¨5ÒúuíêµN£–’“Èõv‹²Ûö&QNDª0u³´žyè¬´[5þ‹·=ÊÈ²UÂ÷Dçy€“êBÿDÇ#”ƒïDt?<ø‘ŸS·y%ªÂýµÉ»k}N‘¶ßèåýa‘¢ÚÝ4ëW÷“g>îM6š½þþ‰Z5éT«xéLs9°è‡?Tûi+]Ž[¿H³«Iv^=Fòm1«CJŸÕ~¿Û›šª7:÷juã+­8Kjõ´=_Ÿj5—{ð2µ{Sû6EÉdjÁª°…?Ñ"kd²×Ú÷¼D»ü#Gì¦\b|È§Ä_’ ù‘…ÔRž¯ˆúÝ®¬uÈ®:²e0°8ËâÖ²‹d­x{.Tû«MHsÕ[kõIE^|oíÊ•$n3¯†ô ´v=nöåÈÙ=É¦Wu3jÄýxVmÏÖDLE²4'¥k‹1ñ¨j:O®U§K7üZ3YÁ%ÅA©PÒÏÙ%Òæø»g£™ÚÁ€ôXfÑõ¸s-î¹]í§7ì/_0ÙÀqqœUž§×ªûge
„àVÞ#†.ÑZýj‚éŽ‹ÎdWJ´Þl€…K–ƒÂ‹™šŠþŽ¬ùÍðS?ÅÄFŸ¨ 0e7YƒX§Îò? Z6+gx1„ÓÑÃrûéI2G “Ú~±ë•L¢ËÀÑU*ÑUZC™"âkÉb?Í`2‘}:k_j‰Ò*¢ÒåµÒ$C¢¹«<c8Ñ±Ÿ,DÐM^£ÅŸð$|¾÷¥ûÔ£˜+ <’n€Z
N¾	RÒÁàÙb÷Ð\OYTé¾V*²C¼u–•Ù5A°ˆöZ#¥Yµ² ÿD°—m‡.Ìä½ÉÁoÎÁpì']ýxðbpL_µSQæ&¢Ø£±•woÍŸÃ¿hÈ}[QÒê%R]\HÌÕÞ/šýÕê~Ô‰¦Bôømfí°´ÔŽÛí´¿ÊU öµìHö£lT¥"³*ÕäZ)eLd@‘Ò
ê5¦¡¾k×"Â—‰~¶Q¢-²s°R®°N&j_ç˜^ÒŸõÛ-²–«.³‹“Õ+éG«¤R­‹­”)7X(c‚—TA+B¯¿ÑJŽï§çÂÙ±fé‘í'õ´•f³õÎ;ïü¤7`ÞÎB¢½Ÿì?!ËècFôq¡öóC˜ÍPwwwî°ƒ[$-¸ƒ5zröf§U?¥Çeýÿ  ÿÿ {Ûxœì}k—Çuà÷ý-¬ÖÂ8Ä¼8|h2¤EÒ±6z0$µÙEGìzˆ $gÇsŽùEÓv|’x÷Ã&Ùl,K$G¢FEQôÙ‚ùª?ü„½÷VUWUwUu5€!e[8èGuõ­û~Õ0¢ap"hõ›£nÔKç›Ã(L£³q„¿ê/µ:—_šûÓÿx®iÈùN¯|ñ×aðvÚ«ŒñÖúßDÍt>L’Îf¯.FLÒ­8:lW(ý¤“vú½Õà¥p=éÇ£4zéPöp ñ2|Wá÷•N+mÃ‘c/¯Ðïn§÷ã¨³ÙNáØÒÒòa<Xé±ëaóýÍaÔkîÇý!s¥Ý¡GÂV«ÓÛ„#+‹ô¬&¿`=†{à÷F¿—þ(ìvâ-8xjØ	ãCAö’F;/U˜ÆN¥…Ë0`½ßÚšGÃäÛ¸% Òh.mö{IJ8r±ÿZ7ÜŒ cÂ+a':ÝAHˆçi¿ÑÁ³ÕÐ‘¾&ÑÑ•l\åYóiÿ\oS¼"`W0è\âó! Íj°|È°’ÿyƒ>/U„ïÄK1ŒºýËÑäK‘Dé:ÃîëQšFÃv¶êÕ	/GÒþ@V¯mÀpïÅÙxµCÁ#ÆýÍS£V'=ÕDú¬×Þ>wæÔÅ³0Vm|wÿæø£ñãýÛû7úñpühÿƒý;ãûâôþíñÃýëÚI:µ»ÿA0Þ?ïÁÕŸ–K8z¾Ü€Kïuøv+€nî_þ²?lÍÁP‹Þe'h†i³Ô£áp®BììÇÑ<ÜØÖkgñpˆa±à*Ì­×0Ž€fj„Àçã'ã ç§û·ÆwÇÿ/:~JÀøl|_¼5ƒBj¼7_«òêžWîø	Ò§¼ÿœJN‡áÖ«£hXßèÄ‘çÄvææiAp=‚'½WÄ¸q?D~tÃn·Ÿ¶+-ˆƒØ	¢8‰<gÉøƒð³^t%ø@æ<¨{Î‹¹ßÃ—ƒQêÑå¹ª€R˜jty>‡›Qú
¬[2ŠSßÅ¶q¦ L‚$Ø½QÑ‹?M0îw…KU`Iž´¦QÚ™0ß>ÿº?••~Ù;îN:N¯-ÄázÛ/™³¾¶ ­í>ËáíIƒW‚ºõÁk0|ÐŒAu}3ìF'jW£8Ä€FÛxgiai~eiåÝ`}³‘Ä h7–ƒu:@Îì?¾ÇIíˆZx3 `¸÷¯4ÚV+êÁêÁUËQ€ºÉ æV§»$Ãæ‰Ü{ì€¨HOÔäšaâmö§Oy?;=ñÔèš{¡¶ëÍÑpªÌÛ ½ÎƒæÒí€Rìã•ùnØb}kc£Ó÷TÌ 	~ò“@½aìøÏ£­àÄ‰A-lZ^›~ðüMk ÿ Óƒ‡4ø¤m/Yúƒ°ÙI·à(A²ÑFH¯Š£¸:é´o2"‚8º€ßMM˜#¬ÙßŒ’´³±Å:×¦¶>JS¨”zú½Óq§ùþ‰í0Ùê5ƒº7.òÔ, M—ðPïqò<óÌÙ×ÏÎ†g>‘i+3á—%L?
"Þ RDWÓÙtÁàjc%l5–UzE+®±Þ[ìÊ«I­äAe˜ãÇ_ÒûÞ·A ùö¹åäø±òÖ’{ç‚ÕY2Î#‚oàù—V˜´£–“ã?ÀËb)³ucc¬,.º9,ª`áú éüèÄöáåõUºë0Ee¸Ã0\‰|KaOB ÑIÄð è…ÈááþµñÓ@ ‚ ƒñ=Pð÷ÖpûCÜKe^b~ñÜöÂd<Á…4ì‚.X†È-3,'§¢ÆÑl–¯ÆV™˜´ÃˆÁ¤k]‘ü#hÉÅâ®Gé•ä'[ùôÖ4€õYq¬ïZ	=¬µW´Çé”Ïfþ2b‘êçlél|km¡½â|ØÀ€ê“9uÓÆ Ê0ñîéÖ-<ô0]øò9|Èpu:_&Ý…ÿïõsoþÙÜÚÂ`BÌy."´ÁZ…Ýu@œ%Á«ÙÏcðøõaä×KóGTÎ `)×©ÙPËº. “NúÃÆ ß!vQT6ÃAc¹D#X{{€6Øé¸?jqæ±´²ÌA7ÊJ@”ûîQ:½Á(-S*Ò­¢'°ªZÙ¥a³@7$‡ÛÂ ·Yz‡{¦¡–ÞN;ìmÂ×#Oí†Ùøhur£sr½³øn¹¼ïlÌÆñÒ¥f`lOgj—ÚÒ õ³ù¸rH,ºš°¨&8HU×ßäæ´ä›ŠŠg4¥ËX¬·)íeHOcFÿ™ÈLòW³Ž/ƒ‰	ÿt¯6ÂQÚ7¨wvuŽÄ2“lv–3½7šé»¿½Üí\‹3êµ] ÚÎ ÞúÞnþnÚÍŒ5Na2¶ø¬eK”–²>KãX1‹‘2¦7ƒ×.ÁÌ[ÚÒÑ7%Ñ-¿_†o9Oô7y%œ¹ÑËØ=[†å•¼Å»4‹÷¥ÅÁÕwÑêß«TáÏÆ{Ãè4p­'gÐî=)ÐãàBg³¦£af@yñœÅÎ/;¼L3jl5ŽZ€¾Ö>\ OÑÏÄÀ} ª=²†“«¹¸Sx–D
²N8[Bw2–¯`M#c²€µ}ØüÜödÂ~¦ÎÛ‰ñfã,Øø^>0þÀ\þ!òûwfè)p²ÅýÇ_ õÑ²9!Þ?F_Óƒñ#øzoÿF°mÿúøÉøaÆ-$Ø_÷@è|†§î 'â†ŸÁ8·Ž?&º†1žÀ—{`ëÂ»Ý?À¨ô­ýóNívr…Ñ[ ƒ1
„&óH<œ­· ÜW-S§-÷x{
ªú	ªz	*û¦õTñLí˜Æ70[Ï (¿Èþ3ñUÅ7 ©À#å½Dó^-øÍ.é´*ù&÷(ŒŠ‹&<ìén¦1#‚S{xàžêBŒ÷CM¸Áú»ø¨ÐÞX0Á­ž;µw‡.Vâ8pÅ @©h4I¤¼ÝX9^ÉpÕÃ0‘Í¯½Š°ûÅoÍöï†W|úøuF>€ï¬9îiŒOhŠx‘§%]•y;¹y^™q›]á?ÕYN©Í>£p¶Uƒq>¾ÔP×m{®Ý(¾ÇÏÞ/SgÉ¶06SþêAò¨µHžýlBØ°’×ÖçuW0$T©;£p¶§ùöÐJEüŽc‡`˜¬ IÌJ,Óæ×.´;QÜRœXª+ zÛû²Îç8½æ°ƒpÒa¿·y,¯ ¨·¶ƒØm»« YvÚîþÏ0Vr;à^DX›oôµÙÿòˆÁÈc>¸æ:~—¶`h¿/ƒ:•™°ôÌ‡ãûsð[\‹üpÿÃyÕ\ÔŸHfe ßoáÀh1îŽ¿ÿÝCñpÝxú&>æKx&°fÀ™]¼ÌÌýÛr¸·D`°›SÓtež$¯Ã†ƒyTÞNÃuææG‘—ÔL^þ*®&£?„8–˜YŽp“ Ò6"½Ý+²Ü>Ï$ÐµcsŒT÷k1J;ÝŽšïžÄû¨pjeèYÏ€›·Ð­ñ°¤kð÷šÈŸxŒd 4p‘ÈæüZ¶¼»‡‡Æú^43t¹=¸"²ˆŽ³ÿc®wàÜžÈãJ
újî‰cßÀ%ðÌ_óŒw—Xí} ôÃˆÜ²§X#€\X‰3X^ÔH(vJ0¡š÷Êr%ÔL÷dZ'è”Úý+¯‚²<¼Ño…q=Ž"«C¿|VªTyu£a·Èóš)PóGøbvóèÌ4­Ìc$î>¦ù.u—‘Y±²b=’hikaDšÇdæ>Y¿Ÿ"“Dt¾‡HLÌ}W*õÿzá­7ç,kîÒ´<×ÈÏ>@×ÌM$ãsÑ°[¯±8èÛÄõPÝþdKaR	·67Ö(6=»æØq4üNoG+³70PØ‡	l»ª;à"†fÄ–í5Vu½2JiÅ¿$êv¬8(=ž2Ã®Ê!ðÎÅ£$‡ræu	0’ƒª2Z¹há8ÆgÐÃs¸.˜ö.0ìÜïƒÚ'0»›è¾Í\Ò¿£:©L .Á)Ø!7@{¨Ÿz-8•$Põzip±¿¹‰CS˜'Ïâ|‚J´ãˆX¡bVÄæŒF?žkâ&Ëfiìš¥Å.
íyqa)ï¿‘§–M²ÜdÅdBZá¢BEvˆýA8|?Ž%¤eQ£]ZœÃ¨Èä¬
KF‚•]þv¤3èH¸ÅbAAýÏ€¶{@ÅL3Ç¦©çl³íKJ´ùÇ2òE%âÁÂÈÙ+¾¸ÝINu²'í…ëq„…15EšeÁE8ÖÀr¶†[PÛ¹´ãÌ‹±=„Õ¯@3û; æ¿gš‚ÚÏé™tH{ÿïÀHXÀÓ¯ ¨OŠ»bü.ÔãôÅ¡±çF•u},E÷$\ øöÓóà’O0¹üvö ›8d¦ŒC@BMaüù¹žrÕPñZqVÐX,¨	Âí.•¢¨ô½fÀ–ú&²¨‚*cÀíŠq@§Ÿ•Iî\0P2ùmêiÊVDadÈ\{l‚øE{&íñ@±ò‚²ûðV5?¦;êìqÛP@ä†ãÉ1ò¥#VFne
= 3€ÿwÚ‰ƒX†…À¬÷³<¬ŠŒK_AzB§°¸¤¿Â$ž’¸\˜²O9§ƒaÿr?ŠûW@YÁô¿à­^¼eÖQjt‰%?Ð_‡a‚ú0Óa„ _8¾¨j2 …ûÁVs1µBÌg]Ÿ*Wƒu«r3­rd$R•œ!*³Up(*çnçîû£á&Î¨\¢ëKÜâ¥é-”"BÙÉê&ò¤‘ó÷1ëÿ^cZ?wš¼:¼ÂÜY/Ò]‰ÂÏ66Iávc2G½Í´œËsmrM×rá *h ›q­ J“iÍóÞ	G)›x‰+?ŽTI·ªDçËÔ¥£% ¸Ò·Uç÷gÔíâ‹¹±ŠJ…›ÖA|¤£d5x‰Cé¥9~%k™‘C-ž´ÄÎ(¾¶%ÊÝãPH&Íg*÷A›e¥	sÑ¼èÚçÙX™9¾Å4“X î‹¢À¼šKsvÓLîEä#wøtgØŒ£esLF3dŽ’—„[ î0ËpÛ™«
ÛÚ%DDi®àžjŠÌºšÍíèn@©¯ÆOçÈ'=~ˆYs7÷?détxõÞøsÂCBJŽ€9ì¹¹Kh-êFÆ…ºý^?àåIwµÓ‹;½¨vòüë°:”hëð8Æh£V™aeEpW6«›ÃN‹«0%ü…1ÔÄ‰:‘tÃA½>`9½`^8ñáïG['¶<p¿3
%Ü@+åÉ¥…˜^¿¡4iNeR·\þó«ü’\§pÈ‡pžäÓŒÈ•gn÷|ØÊIuÌ²”^¯d\ SÇ	ëÜªYÌ®s'ó«ªø)8à£nØ‰w‚oú±ƒv¿í89Š˜”6Ùòr.m±tKjxÞ•×[êA”þ^XTu±“Æ¥xæ³(î4:~_€,¤ðÚëRÝ¡¼ä~î(üäÜ+!ãÞ2\Î©ö±Oî}`æ¥^`|K5ýZ¹¡0&¯ŒÁSkS\5Òš*y*B`°x³–ÇþÉ·s¦¼í`¬s‘XFû~M¯í0ÂÔÅ)—¶|Mµ5y¢éÇyøÖu¶ú¸ä*Ï¼øLI¿ÿz&+VÊK.˜›¤ª×xåzS*•)Ä&0šÿ¸›•
Q€tW¯x™j`,3²ß†­àöƒa¿«*}¥J¡~NÝÝÖw1Œ¶}éJc	Kþ––+–6ç(€ü)/n«£áå´½W7aÃõØÊ¦bÜ4±²	ý@ÚÄÝúß”ZŸÓ7Â†¬Mx§ -æû*„ñ<BN¤˜nç‹Æ™~Ã´9õÓò&äNxê6bæ™*w|‘»”—íÒ#Óòlˆµñ’…›³ÂV)®„O'‹	`b™1—êÁøþ*Èß“Û›%_ŽÎÉ2þÓ0õT­ñŸÛ¡ª·`ûÜÙóo¼váÂko½ùÞoyûõ³„$ÈI;BL’±Ç"|L³»Hå[yqîÌÜ^É™ÛA¼©ü4³×íwÌ>+4©WECƒCÒ<…vyJ“êk0ëÓØnÀ•&v W2³¶Û5ÍZ[ÉÅ.ô`Œg
ZQÒÄ§Þ ¼Õ›†4ÀBxžü4ˆwy•‡YyÊ¡8¤4¸£Î¼8\-Ø17ðHFÀ.w’þP
¾þ5æ zH¾Ë§|\(x¬Ç£H€ƒ¾+Ð ß0ø«|…©ú_qødoÎ'!ß}Öí:%¢í‹¾¯op'‚A^ÙŠô÷@ø¥H;ú
_<{íW‡h¹ö!ùõÕQÒéEIrˆêø^[›p6˜Øæ›}þK?R àæAÝÁ¤iöúŸÁÿ˜7ï¶$;‘,Ã²‚‘=æ²Æèåž^#ºÝEü/Ç“¨9Œ@¼oI0aê4,Ì®Šƒ8…G¸,°ÈÿU@‘Áh8ˆ3$á¿Hð#EHûÍŸ,Xc€¼íbO·²Wgž',Ü£Æt€±<Æ{¥0›Md½a/ÍãŠL•Í4ØëŸšQg  LIñS	×a ¬›€AöâÀ×´&÷$ÁÜ%&ü)~ÇC¹tå¬¶¡Á»Ì‰BÞá¾”ŽK¼p¾íè9y…œÉÝÙåŸÌG	6»]íôU òÎC{ß?“f‹æ×„‰q6wR 'öDÛ®8¢îá,@¼µ²2½ã¨|Ñs)&P¬L†žSÖFTtÓ˜Ü=óÔEé¯Îu_ò²¦@!?Š
ùJ!/½y“Œ*¨k'YÀ•¤§ÈÂ1‰¤4AÞ®š[ý™97+¤D­Î0Hý3¡;¬²"[-l«©k•uÄâ
d«Æ;Ð4¶hh7eãõÐV º–bÊ¡öôµÆ•Æ; ‘Ë‘£gJm¶sÒ~/’	M¸9‹)˜x$Kj2`‹u¤C§Û%mç0”RÁë^hÖâS]µ…´=³q³’!Pi8ËGP9žË¨z «rV ‰þ,¯y8óùópþlÆdx%J¢õTGñ
,ô:¾‡ :§å“æüo¸î'ÀY+ã@Tv’Ã­fÔÙGè´@Šü‹qÆDŠÆ¨´Ü›µ°è¢YÃÁ‰Àn)œ…Ïl¤´Ÿ†±ÊjF»Æa…"e]òÒ!ÓFù°n®_,è+Ñ—´å…Þå®i?…Ê™bl}”Çƒ6ü?•‡’R\G>^Iý“Ýc÷Læ¦ïZïé7ƒ‚gp‚Z7ºdi ”}‘(÷Fñ½ÖÂ2§ßÒT!ñ¥Ž}ŸÇ»s\˜!ÐüÂ¶©•Ùd×XPßÙÉ:WtdjzÉS¡±{^»ûøÜ˜Ïîä¿oULË²Jó Š‡@ž–ìnúuLQp;;Ïã^tÅaæÓÆ%˜äÂ[²Ã|ða€tWâ¥Öopt¸Ã±*d1LÿÂ>o˜g,«ªafóKA¦26˜¡ãËZ&éR¡­ÒJ0Ëé’l.HkNŸqÿÚþß“‚jë³dôS£´í'k^ïËXù²Í´´å„ø|ûÓßÿó@qŸlšfm€{,•1–éWÃ¿ú	žÑª9»,)SÊ³Ì²Z­Öˆ3‡uqç—ÛD/áŸÞ@óõã7,03žJe€Ïèóš—Rµä©TYÁšZfË”ZUØët‘L£¸$ ©~&J5«°"t±gæ	û8r‹F~É'ì£Ó\!¬ËrÂÔÌ!%I §«r-«$q¨,¥D|»Tr€Ôš5gÂoHïµæOô\a¿´"v­—¶èî•¤g¢cöž«+†þÉX©ŸöëËoÊóÿ¦Õ<»¢´)«-iRR¬kð-æOvó	­™Ÿ×//73ìw‚…`[ç>šæA‹áªP.•†ì6¿ôå*lrâÞöø)kŸ‘‹+Vl¡¡r5ÜÎ›Ü¬·†çõá1“Û‹n2ð6úâx}©p Î "º•GÝ¤¶´|xåÈÑšÿHÜ`TlÇj÷’±'î¦þ÷‹º(ÁU+¼¿ôç­ÛÁüüüHÝÔÂá*˜äÕ€%7¾ßD´Å¥¬ÍJVÍÄt†\ë¸\§•%m_:?™Ï••VóM{XLÀg8O5	¹ÒftW=b˜UøŸV]fUtECÎe2g1Nc¡AÁó+Ž5÷ÌI7³UŒÀ(Á½\öíŒWŠ9*_09*}4¼)m‚vØkÅÑ™(ŽÒ)I²˜"ž#X<t<ŸF~DÛCrbíŸ§6©õEžôþ-
¶}ÂJÿX. šÏ6[£`‚=TøÐÅcmfäJv¾h&vî¿ãH˜§˜˜-/ƒBÝ3JÄ,i+(»?<F¦/7oÜ¥ä¸§"£ðf1@ùÓ`éxÖ-‚¬Í=ÏÎŠ­ªŽz7x8˜“ÓäŸÏ¦-A…F“ÅõÎÚú—•×óÊ…Í²'Ñ®¿£tA`«]—ÁÓà0v®Ú¼;Ï eÑ#ÂàGR.}#ÚaK¸]Šlý«ÎDá(Ng¢ÞVp®Œkn[Â~ p¹Å{Ã—ëx?Ïüûœ4Ÿû|_Ö3Em“‚ýûµvHŸÀÊ¼{È˜ìMLH0­®ªs2ù’ÒFiÜ<%ŽÞ£ª•‡¼S€’*Öï)¥]Û¿c‡vÕ¯ªîÂÉ+QÕü¢\O§UWJ:‡:Y‡Ÿ–7µºX¾K©IŽxŒ95IçŒ%Ê4¥Ùe)Í§‡«1Obˆ¿ pò6™èc¬û­Ü\YÞJ1­£,C¢mÉè®—
qU/Óòþ°õcK–°yÖ° ×vÃ˜â~™]<ŸâNZ¯}ûÓ_×æÞY|·$9´Ârñ4öð\mN9oŸº£Àd4·³à@‚ò*SŸBf7òØ+¿	KØšwû­ò&".¶¦	aYÖ®!ç¨4'…e¾[¯>ÓvEá#U-C¿±jHç;½¨ôæct"t›p÷f¸5+ßq^¿±oÃF§qf×Ñ ¨Z9z©pîu]Àù¸sÆådÊì¦jùzøa™ví0y“ìàïÅp]rúèP€óë…—áøk­Øf©çÍ+éŽÞhÄK¬œãy"RêøKíŽ•W§Me+¨ì‚ÂôºcAþWÜÖ|“\ë.s/n³•Ò³‘rû½H»­ê<ZÒ°õpÑ­¹Ìz¸Vpgn_¢B9Tì¹"Í]›Ò¾/´ûw^TèñÝ€Lž…jàõTÏÀ¡€ÛšÖÇu´^ÖÞèôr}®ý"Œ¾ÎŸØV	aÙüÍÓÕEà œ"¥»^,üÓ9ôRÏÊ,9L¿!æÏX:»¨Îüš»ÛîFÊ;Hä.Íþh˜&ïµ:Ã¨™‚Dbn˜Cq “ïÉþrOh›Lì€u¡¢«×Øª·E£¸k`a>•½yi‹¾Áƒœqî)Œ%wÃ´Ù>“;Íe%n(Ø\Ø1Üƒ¬‰lüä*ßÐÂôY°P„›‹gƒ"X¹ÙþÍš¸›BÙÔP‚áþˆ$È€dNÃõNóB›íú¥·›óTd„«í`rƒp˜vÇ©G‰g¼5<ÛÄý­H»¡×O£„¸d 66}³tFUn{/×Ã
ïcW£¸ ¼dûQø¬b4œùˆœ¢4ØòkæM-òW@k¾ÓkÆ#Ð;ê5rPY&ó'?©tgaNîçÅªTìZåFâ_ÏÓƒZµGó›ö?¬x›X£j·Q9lµWü òIÅéa:ºßªS–SW¼q«á«#[¬b½ÒmO™;«"ØÑù7þ¤êZÝÂºîê7=¨vzŸV¤7ÐžnWn1}ƒªî+>ñâÇµŠO$–rgüe5„B­ñëšÉ‹a`ÉE•Æ¯r¬UÛ|&ÊåKXjx |v6‡ªÈ½!\§¤BóY,m½eÊŽ˜Z‚îÊSF´RxæÞU:ôìgOâL¯'•{fùÊœk¨(B<ªŽ"*e9%ìÅ‚?TyiCŽèd&Ê;ìŠÙAø+¦Kø~$›¶UäDÀ–lÕƒ…z°K#Þªo!ÐÕx¿ÆÐÄ‚žs`×‰Gp?ÁªE0gÂUi½(-<$ƒK
ØFxBÖ-?¦RxmïÛÔiø<%÷b6¬)Nn—š• äCÁr©aôÄ«®·Áö/Æ‘µ("fvcxÅeÎFs ´6¾å¢€Ø·‰/Ú/bÁ[Ö>ÇuÑ]Š’=Ì½î¤ð£E÷ŠýXÐ²‡¿`ÛW†ÒÅX§æ>ðº2s6¸8™hI®MÞ&dXG×pÐº@A3¹,òD&Â<¥>8“è^™h²©vEž¹ÞÍ²²Ø›#'?(µŠ:ÆgÂ¸?Tt<âr :AŠ¥,±c|fÉµ”ÒrÓçJÎ_É~ä‹Êî‚Ñ(¦³i3ÍÃ-§À6æ ø’1q|ûpÂSã/b¿ÕˆPÃV“¿±‘ûß#<Ë^¹—¸:Óé^š´Ñ¬ýï7¥´¿=þ[ÝLÄýåÀ4¨KÊóÇ8Ùöø)ÈÍð¹xÚ/õ$‚ñ—¤ê|6-¢èÀþu¢Ûcžæ”iªŸcK•Il¡lp'É±Ç¹, 6»ãs²}Ê$s
à»lqI40>yjÿˆö‘ÂÛ™y¡wHTAÕÈO+n.¬Ã)¾]¸ÐþL”÷›s6ßŒyX€˜¾Å ’ìÒtVa{F8!añ=óõ(Ž¼SpB[CªŽ*~^ËÌ5–~Çøêõ‚£š†.¬¸‰ÆXJ¯Ã^³mo¬Ó)Ÿà»WŒ{v¸Çhmi°Ã/¢1£(,1õ5£ÈT¶Y/O8s½°4˜yŸfê«…,ùéâûûõt`ƒØkõ–}ÀÜeåã“JùoÖAÕK<fº‡×Š$×Ç®É®4° ~ÊãÉÜG‰Úþ2Ù~ÊÏ9`ì¯•ónä'p½b^Ksmüµ`nULdFgsµOÎ­‡iš–EM›nh·ì2m¹ôjÎGÝÎ˜²i¼šQ<B3ËÓŽáLc5Ý+qÎt§ŠF±§¬È»­µeRUþ”/EAÎŒ®Ap|ÂÅ¿7ËþKÆßàKúòU€«N&q(s2e 2™,W”‘\C¬’ŸöìR<\€.°9¥ýgN—üÉßaqÃfÉ(à—o€ÉQ™(#1à†º…’îX½ù"Ï‘Õ—´R`³¢?4<±{c5Ûó#­ØXÛŽü´·Œ×hT	´‰·yb„pA¤FÌ ˆy ïñ50Ù1rø‰CF>Ò?÷–¶@°$ yÑžw¼´Àq¿r3”Ñ½&N4øë/VÄ~¡©iy¯Ù~FuLJ–»›Íó!é+Êü‹æç[4‰]‡Ò–ÑŒ@ÔcÀzŽìkÏÍ¸öfÎ²ÊÜ™»¢•Ç?C8ûXyÒˆ‘w•˜<nÓ“	f3(*NõM™¦q®)NˆH¥š§	tåSŸ*i¢xø:Õ‘öàa´¡y§lKï{òUª0—J_¼Ý¸úÊœŸÙú¦Võ5žòªÐr—VZŸì.3QàùŽ<wY³9Ï9ÎLïœˆK?Ä¸w¿cm´«V%|ñv“}bCñæçµh†™Tõ³YÆ
Îxöêž®x‰w…äk¿kJç—‹}¼¨ùÈ=çûfÄ½îQòz'ÁÒ¯:³‡¯ÝåJqª—¶]À:-±‹ºêå^Fb·ô T¹Ÿa¿þd±¹Oí?þõWÿôïßüÊ±sPö¼2÷ž¶£jÆî+øWrC±n¬ÃÁÜLæ*]¸¾³”Yw¬5Éxm2ïÛŸþþÜgî²?ŸxM¹.­s¡Ó2¿R
ÙUOdðé6 ñ“ýŸiûÅãÒ9èîQã<´KpjlRKSÖ·^Ãžûú¬î”ÍJqÈšf$O!3ñc‹1	#<òWÍxj Ã†â3f˜PáWÿìA0Ó$ÿáa„"95š,bQ÷€úÿ·z·¶œ¡sÏÜFš˜¥múÈ‘‘ñ€'æ·Î&÷ë°m9æk\Û]}ÏR>¨Ï­Ìq>ßü®„ÜÝB©¶Ò—õuFØêÍ€ÚÊØ“É‚
þý<®øßÇ§õíÿþ_¾Šy¦MÀ¡*‰;¬	Ov¥YPÚ8±Æ|¾òš Y¯.uÄµá­ÎŸª3%»—<·H”ŽòS
`‹Ÿª»0ç’‚÷ž9íîMDµþnP%ünØßC|ovdkuù;‰V½«®Þ¦MêþŸ°&rÍ[U<ë Y¯«àhœ9t½ú&UoêçÏœž«(Ó™ÓÜ@:•Ó‚&üO_Tf0{Ö¢Ý„8ã»ŒŠtG«&÷HrÖ\&ïA=n£™Êã&¢g§÷Úªòºîš\&úÍÚèç/1ò6à§—=àp—{k´Lo5¯ÛÌõV“G÷€‘ÒðÌêª«—Ý¸è¾·VË†h‚Q'+^çÀ¸It.tý1Ï½8³F?Õ•}°X§›‰ò¹•1Ï40"œëŽƒæ…>Q9iÓi“ÉCÚ3[l1úÐ˜Yž9Æ^)šQbyWnf8cÆ¬t¯HWÂ%Sp
žw‹Ü³ ³ïÒ<*XÀ:Q‹ˆÐ¨-0bBªr”FÎØô¸¦8»½V¬²gZø:¹?ÌÏû<±ïÙù4›&UÙ§<ÍS&u!OõLÅ!\î1v=É¥LLervšÝ—hu‘Më s¸/=€^j×§í;»¦ùM¡ÌÖ*¤'¬¼HÎB»jÕéÎ°9ê¤¬ïx±ÄÊæý¾ÑÛÌ½ýa×0:uÌí€{2ºÈÔ›\I({eÝŽ:¬o®R›Òa?ÁnË¼û:þ™²ßØ ‰!?³Òü{ZÔìfýU¼rÒ’¡þó/‘ËH g›·+å¦‡ótkðƒ‹f¼ez÷GlD­ QKððm¸è»r+ âG¦†ÐE/Ï%Óf(Í2D£eµ~û/ÊjÉ®ÈúÈÊz‰CÕ¬Zâl{Aøâ9†/ò¡WB	8²XÜrdZ^íƒ|ñNiú£uNR»&)@üÇŸ+@\G’OÐëè÷ô\ô®•/n—·eR—åº²,Í­°—-ýP–…~Ï„u?—öØiÖÛd?××Dô4QáwG_…q?ú¡À~O¿ïÛÇÍ¼}œ/jLÑ%PÅ˜V0Æ¸»€‚4ÙvSbÍ³l0êN™¦6OÕs3$¨úÃ°·)¥ÿ©ÀŠ™žÄžeÒÊ Ê5]U®æSÑ$ì:½Vg³ŸÁŽÿT`ÇL»ßß®¢•WBkÎªäôÈ¦¬®Îg*<ö²sUøíký¥w-ª÷?éˆœ¼¿•Á¿«¬~Î@¼æ{üWéçïÕ»ß£Ë¾GG}W÷ü	Ö¢¸‡Â˜o1ùˆÒìlŒeÆ‘âqï’Âüö? -oáž®Nlá{å6+ìçj˜ÍkÌƒÉ¢¨Èóã©ABÍ©þK£SÛl­¬¦`×Õ\W¡”ðÄ\­<ªÄ	´gìe£SøA¡Ür¥EƒôX¯%â¥bêæ¢
{D³a¡<Ð˜°a‰ÿˆqœÑjW´Ù±ç©‹ZÌ0ª“i’–h s Ö˜Š—‹ºËÜ5\	
þ”Ç$ßµP‰è°÷Ö û½%ž„¢½B)RëÎÒcis tÙ÷*VÞ:F™Õ„÷O5Açî¹•ÜZ–ŠƒçvÇ4ª}ÅG–ì6àžEéÍÓ¬R…6ýîYVg¢ zÆÝ§±dµ7˜ÜvÌÏË…5±¿Ë˜*-á}¡·©>Ñ2Lóm‡[ÿÛÔà@™ìð(Ð<ì¾7••h¢BDîˆ¹Ø[6ë ©p›üóXïVÈÅ5ò¼•¥0©>Ç2(Y{ÇçÀb»N‰úeqD¯\:=C©j“ãÜì|@oûmc«ª2£^VåªJ®æŸÅ¥Î2½ÿG8†ÅË^rùÝˆ“AØŒ[£†Z;ã?+Ãp`Þu=J¯DQö4>lÜýuÍº/ïZ{¹°ïòÕ8°m	TÝJyíõ°×ê†Ã÷af!m²ºpRî^Iº?Šä›AF™½E_%ýÑº¹¥ùÚËh÷&¾š¨8âØ|8Ëc$%”€Wû ‹â>%¼þ7µ„Ù£Lï­Rch<±ÿsÝ¼?þÞòAÕ-2ÅmFàXrC…ø¦ú3Ì¿º“›Õq~*–á!_õÔL˜™Ì „3¿CóÃ¼¹ºe×fëÆÑUÈÁ…‡îíŽs·úWzq?l©™_ÉÅ¨;@¨[7‡-Ýo|IÙ&HL¾3oD>æŽ[®6Ãƒ­Æ2üH™#PqÃquObq#rŸc¹arÍò&lgb
;’wñ7ù¬Nør}ý<ÂS×]~Gò@”±º#@®§”š¥¢r o|²•‡œá+"ö>B;£†…™éúüÄÄ,ø'ö 6Ÿ&Á3ÉJf.0}³D ¿U”®³lÙ!\ÁÜîÖÆµBDVta0ŒÂVÒŽ¢T¤™-clÙ6í2ÏÔ~òÜÅü«È‰#ÛSpžÌ¾*îê×:½Á(µœ¼Üà’À«Ø07Âf3¤'jóWãäê¡ ÿÀ¿Íä²ý ÿ6NlÃŸVÝŸ½ÚŒâ·ˆuö¤Øµ;­Vd¥($×álØèÇ´Âd«×Ì{0+3X€5 jü›Ò@¹AK'$1v!ZHP|isR›T;N½èJp!J×X/¤“uÇÞÜ\ÝŠ£°µàÖ¦Êcç7H±ª×›%/£¦ÜRN©GÞ©sÃp9ÜÀÇp2aÖs¼sPmÏ1b.ÙÖcØVg³“&êçÚý^t†Ãˆüå1Îûî’}éÅmÆŸ°ïñÍ±Çî\rŒDŠùv˜Ôaü¹¬3ÙF'†­$ä‡n[-ºÍu¡sk
ñÙ)ÅÁVgc£€€qÔÛLÛAC`(?`+ÑóÇüìFÇã“ðrt!íÃÍ¨ÌlØ}æ ÿ²!Àˆ™~÷@|À@µËGÞkw@ \Û2õŸ0Ž†iýÊg”èø¶ëªV.¹â ïd°¼‚øƒ¿v2ÂPK'¶òðRÀØwø	!èdÖŒ!ÿÖøRAÒý—¹Œv¡{àÁ¦ÄsöÙ™¡.&"¯º §£Þò;Øfâ›ŽL¨ñuPóÐÃ¯v¨VÔ«N·£æûXóGË•€^â˜0Ôv³µÒB)i_³”wÃèoGQ’ž‰â”v—(I¢&.óˆ2l¬fdÖÌEìCkI®ò‘>¥DÂû:qq'×`…!öªRqŒÞŠÒ°'«Á%lºÂ¨Ã¢ÜÁ·KN®;Mnç&A6Ü5Ö^G¨nûÒe»lywY!Ë
Í÷ƒ!¥³4Ðãç-&dýÅmàýºµÅù.°ú%¿ùÅÕŒ˜›¿ä‚Î vÿ<Úè·NgÖqSHØð¦Š¹W ÷JŒÙêÐ¸ßC†½ZŠÂø)È—¨œ²ÒKÚÌzÈª²?qóÔ¨ÕIOôëµ·Ï9uñ,Ž21QV£9¸þRž<nSº âÿ§%K16MÉˆlâyè¦ÒÏÛE ~,UØtê™ÈN™À¨KÏ,qÑO|²Ë©ò3ËÎ˜ÈQ•çJÞ‚Ë¥ ™…·$k¬(wÏ÷Sx­ÓÍ+9‡F…ù>wœé|4èƒÖ¸M†9pKbVgµ?ÜªýQbŸuÑÏ¹ãF[ò'ä;}
Ë½@dÂ©‡Á¹3?ú.¬ðY`É`Ò«lªÞÅ±Ë2‰ÒÝèT¹²îÉÅ¨Jð‚¶!†k”Ü$—¨ùâô#€ŽT[<¶zx1 •úÛŸþc°¸Œ?°t~"#^ó~+Œë5Õ‚´‹¹Ù#üË±WJÐúJFÌ£ôñ¡t<J>eøü1Š`¦TT7*tAŽi‹ËÜ63Føáb ²™ùð^ë"“º æŠ»ÆÏÌw’³ÃaHÝÑ=ê‚hLg1¯=VãFäÙï)®m>|§…›ðÞãÖ`“1,R%(w
Í}fø)ë—·ûpG	S€u½ß(÷[À>ß’´Å—÷×Ê¸Z>N#tãÂó‹²¿#8Ã£ÿ»€ÏÊŽÝ‹[oçe¶~ˆäó€’Ú>aKËÐ ù@me„:ðÃ…"?ÉcÅæ°Ó
ðŸF³'å ÛZ•?WJâÅ&l_. »”€ðŒÕ`hÉ[JñÞâÖEñ
Ójê¶f'H–d‰GZâ
Œ×8òç•yë\øž”›à
þc	:éñtÌÙO`=CúåEÒÛB¶¾±ÜßO¤RCäÌ©Âs›ž`ÜS1øf‰ZV-d›‡^ê:îuÃ¢d;‚ÌÍÍã¢îcWk*±†‡´æþ Ó¡íáà\§÷=ÒÚösÀÎÛã'Fšèª{Fë
øñÐrÍÃˆo/Da<'Xés@V[{„éÐ•Âu§Ã8þcmû”r‰•žª÷HÚ+d’|°6ê†çŠ¦ù‚¸i¹iç 0ÓjªÚ{"ÿ	0•Ž$éuÉ¹u„ Y~žSrìns\y <¶_ìß¾=d‚óQ¦+‘‘$!‘ë¹ Í±ÃQž)báY_ò?	<ÞÎô.Å·A:—¹t` m@ß‡ý+EKòp ÔÑ-±š¥f;-íonÆÜu“Ô_"ZJ^Òì³íKÂÆ´%˜ª/¼‡>¾6Ò¥žövÿ
<ËI‚W”ÒÀ—Eá=[<mY‘/¬ŽÍ¹
®Æœ£`µsiÇÎYÖ¸GK52Y&éµ,ISF*›Ÿ<Ž`^Ë°‘°’í\€%¨ˆ‰×¬ép=éÇ#€Æ°³ÙNÉ¿‘öb=Ø›¯¸3ÈÜ™^—Ãx¥Åbù‹Q4Ü²gbÉ®z¤9”»ëÑ|7£tž†·&rÁ ªm:EÃ5Np2ìóLÛ¿>¾¿*2ïŽÁjýÂÕ{WÝšb~~ÞžŽ¦RÅ‹Û§Óq²0¦†ÿ28wÞw£VgÔ½d{ëÀks~±Û·Œ‹F]‚ZÍöÀˆcq´‘"j‚¡›sÐXÊxbpçTçŽÕ£O­6J£Hø©,¨2é±Â„í7Ú	^u)µ
WºÎI×äC2ßVUc4IË´"GQ¸ÉÒgtI‰0\"®Hqö:]<ÝÁ4±ýmÐußg½†ŒÁŒŒªQÍÏx ÍïÕ §1¨ií<–0ç)+Å„Ñ?HKûdý”gîK5iÉÖ€•5pàÐiO¡AÚ°vWà‡â¨S_æ†:ªKQúúÎÒÒàê»œKõ{ýÚÉ%wp–ZœH¬b ásì’[Ç’Lb÷Y#„ùl=Ë=‚<^)) {(0¶ßÛ,<¦à2Ôc['òñ/GÏ€ ä^4ŒÚÀ‚f2	¬lZ;+ó7']Íßo*?—¢è¶Úe¹´¢nIÈ2ëGÛÃ$Þ¨;3* Ô˜ò¹êLEÖ÷Õ¥qçJsCÙd:É…(Žš©Lw.®7hÈRW¦­E©p0ß÷Ä6=Ê%‚+‡‰Ù'Æ¨/WgúSÀ’~R´ Ü)ArLVˆÇ‡”Ki—g»g‰_ƒ¼~¢Ô?eüw±`‰î:1;'få²ª¿å#—vŠn¹0QNféP›>v"W"òbÙ¢IÜ,¹0¨b0)æ/Ö ðˆVYú<{ï–‚Ùµ\¬—9’É7ät¯¬U‰ÆK©³É”õ0‰€Ï# ;p@­ÅQØB ¦hlaÞ{;kdÜ¶…Í¹åã“Ìgû—–‹šlG«|‰%Ù,Î/ëJ˜1’¾¢õÒ{ÞÁºe´QÓp`Y¿ËF†5ûl“(pÓk9Ê4qÐÅ­ijéÞO1‹vÿÎjÕ¢Ñ\ÊdP¿0Zoœ|NóÆ-jÈ‡íÚÝ¹BÕ³#ÓáX—^öÔ¥9‚ä´éRlYÐš»©d}üôo›n¸LUÉŸÈÝ3aro6¦¦<d†E¬ÌÉÞ–8Œ—OI`8×‘ýÝJÛ2#["ï[²«&íÁ€¦ÀM—³.+I`ñ¦5Ñ13©ÇP¾ï™®$Ø¢«úÔÏ‰ÃSŠœ“RÞ|DÈuWA/
æü,_¶.w7…æÖØÈ®8ŒÞRJhé}\š>JA={pŽ™0,-žSæoEJ2|Gé(P†ÿtv
yö•*;w‚º9vÔ¤ù”›,ªØ†>è™é†i³­áe½y(`ŸËBSæ¢|€RèÏY]w@íD{ÓÛeþ%NŠ°\ˆÐ¶w‹øØŒ5ÌÙ„©Ó\ÓÐé*\i]Ïví¦c5\)/
eˆâÌÍ8ÅÞÞ§BSÌ=CÏ0ulföô3±ƒÙkxÂu7ï ™„çãG³¯'¾¯0|MmI`‘Ö£‘\rF!³·³ÆÛS²Ž¯&gJ_³fÊ.Úkžd¸UÉÜc÷0‘ñül2EÛ”(ìöØÂñïM2»Iÿ®z4äÉ:ð¢ý¹¨+TÂo¥m ×Ó<\DÍÎF§ˆöT³·ÒÔÜÒ…Ê`¬	ïYwß…£“§«Ï:4"wdy¾æ\Î_Æ¦µ"~MºÃL:†f?÷A2¥ë5zòŒ;(Ù¬ž¡CÏ(~k¿p@öŒ±r­XX6‘Z&ÊÃ¦¨:óÅE³wo›Ö/‰ç½4©†`	Tq^6€BLÆ^d£OK°$š]¨e\b9,OaE¿–%æ:Ó+w´Oý~V¶†Þ6ÙëôkBsCÃV$I6Ú³½QT¸=zÛÐX¯µQlqÌ¨š1Ù÷Woø¬-šì¥&4j4¦¥@hFVÍa²iôZÆòxØsµh¬ÒÛñòµj
É„ÊŽ™Feè·pÌÙZyV@‰Š†¿»ÌOgÚ,=›p“l¸g5„þ­œ
'O°\›s÷c4ÄÈuÑ•ÆÒï•ÿ¼†ÝÎYïx
èÛ|?Å þÚ¿×*î•n²¤¶ëö&lþSÝûçò Ë¦vÆÝâÍ´„®ºØ?¢äL_‘ßç“AÜIëüÉÂœÐ^í÷±	ÙPÅ;Å®ÉòìrìdÂ4Ž‰4……`i^ë;VX&X"êf$J@nÐª‰¶F´ì_á…²¥·ÞŽR­t2Î!Ž¸Öðð
öær¬ÃªÈ:,šwÜQ@¼éM±ž­‹À]¬øb¥wû>âB›fkñ¬æJ=÷›”ŠiÛƒœ?‹FøFá6•ÝÆ«xÃË{ZFZX<àÁþuì©N½G‘A`Ãðëdxw¸-œËéµœa†¶öÑeÌi®§øË£ÿ¦2[ÈÔ”ò;ë}ˆoEÄ‘û=±gÏùuEÔ'ÁsÖ³Êªöoëìö–Ã½¬M´ÅÜÄÒcgöu>í¿Þ¿1• >7«™â@ŽÎú“?1¾ð6b4ó‡¸‹m “~@î¸;Jg3ô•”˜P4C7²—°ÏA¢`QñZÿ™ƒ;è!Ÿ¾š;NJA©Ç Œ2ùs”ºL8¸'‡¹Z“âf§/pº÷Våš'T”[,Û™±Û6í3ÆŽÚÒò¼+½\•Ung†fWs[yVÆµmî‡Ís—™B¼³dµ„¡²×FzESÞö+ö— ßº²²²¦Ðä^05ò?™Ù¬æ1@cÅâ5(8hl“W‘ù
Äê+~.éLÀ¡Møk¡c6ñv˜`×¼ËÂDè¥öß³–íéì¸$.ÊE¾-W9Ü«Æ9;=¶ÅŠÝ§–G²e?kÖèCÙ2L«ªã††X^ÅÆèÍá¨»n¦˜¦W9MŒV½ÑO;SSv\±	¿Ö?rZŽ±„î´R©©(ÁïéøS2’hÏäŸYëdXZÌ'·óv‚ìÂ‹¸®F5Kj'Ž»Ú­ˆá
í§œvv§È¸Õ0Or¬¥Õ|8ÏŽ]4V9y:cô2ùèU§‡Q€†-
`ÝXº¤ŠSNs¾1”ãå#N$Än%$;“Ü_5AÂíM1”kõ–
­œ`ò‚ƒ­>V©A»,cÑ´¬ü[ÆI¹w‡Þª7MÍ¤äÇ…žËæ¤auK‡ƒ@R÷.³Æ7f‰¡lS@¼ô<ÙU#„*#oIÎ‘gTÑ‚•Y|ü;ˆ”‡WKt:ôœ8êKoW9mbŠšÛÚgÆL·ñÌoAª¿«Åå0¨ú:¢Úº¨")ê¹¯ûÞ¨óM×“ÄÊ-Xý»ƒ×Š#“û||°×»&Ÿæ\[•*xSÊØ@w¶ˆúë_*àYjÅVe‘´’¦ù¦”ÉA‰0ö›íÉ
øÙ.˜v%Èà+žªº3UßN»Êå9@NøM0Be•ÎNõ}»ÔdkŠ|¬ÑB»2§'ûÖèolÀK}ú¦ó”Æ{)=Ë¢·oVQ»K{ËÓîò2Ã‡‹ð;²ÑffrOä´×¸Èfs’Ã­k¹_9+;‹Øû´4ŽkU¹Â‹qXIpåÅ®_+ØõkEúäý?ƒîÕF8Jû%|Zo´|ÜÙ­ÄÙÇŒ_Ð>l¬5×â‘‘ŠKÀ761ù @¦î’Þý™]ù€
Ž”ÂnekN%¼¶Ð>ìœ°G¯º ^m\it[ž@zì=µò¼ÔË}˜X·G´õ0P»NdùÃx•Øüå àë@	’Ê—žw.¡µ™þ^¼ØFx^âÅ­ëa~Œèoí!Ÿ/4Õ„•¡o¼’¢up‡5BÓ÷2Þ[$J.•‡æîÎS	';Ã´éÁ£„ØIkÁ½¬·DY®ÆÊOsknñ)
7¥é¯›Þx¾hgØuÒWÃÖfÄö»Vwy8­œ…AÝè*’YÏE½0>5A bB‚•¶ÈÈ^MÝÄ»6G–¥órÜììVÍÎdtJüàú”\"ªÄJÓ)éý•d5“‚ »«Qzc0Òâ¿»ŽV ùP‚ì Ušòˆ}]0ŽïT |‰ôêÎ±ÄþÐÁ%Ñô0§Ù”'7ºÓñSfÚƒ@nzQ’â£ñ#ªw¤ìŒÍ=JbßùLŒR&¦¢	E#×>loÿ:e˜¹­wÛ+(ì9IÃaj‰qx¯rëž¯ïn¾[až91âNÊ®ë{Ö-åEp‚bâg;ñeü 7í×ûÍ÷Í}/Ù–H"žÛb˜>nÙaž‘Þ–ß4+©ýO:-ÄÎfÄ‹e*šWn¯6D‰ò­_;s¤^ºéä˜]ÈQ.ñ¹™ügÝ–Ù{&óÙ5‘¸¾é‘v\˜äI}ïäíò¡ü‹Uµ‘ª^o4ÁrUÐšï#ÃJæ£}Óä¼Ñ¬Ê¥LÅÒ½	ÖÒÙY	žg™@ð64šÏ“Ë¼‹ò#ËXA~#äÇl'<s›mùêÉ_t¡$ pGlK¤åÜ¦Vº+…®S+Œu³û¸w¶„6!cí¨4ä×cäû
IÖNþÇ¿þýouÈ,ÈhÕo1¬Ð%§¤b±dJ®Ýeò‰»h¯"*È\KÊ
Ü5mzXLôÄ-Í¸4¸‘½A›d?¹%G8i:)eÂG™¼@¹0oc)±QÅÊ³±‰¥‘Úyî?þõWOþý›_Uf»¬ÌØD	/fŽÞ¨D UBÁäªu¨PHš_E!lÅn–-_M*,„ŠÚ¾ÚT%vá+tÜAJñÉØ¾H¨Î|£ÅNÍYäxB¦/l·eÇè‡³¾67]±=Œ7Ó˜ ó€ºÑA vï´4ÝZ®F©SîÛg“ÒÓ¿Yž¨{ÖLh8ÈNÒYNb­ÎðD-N‡$»hå&Ð+èýÞæl5ðzø¼óŸ‰|àùO/¼ÜÙÓþp¾wëýpØš¿2„·Áú¥¦Ú¨!nüX¿ÄX9öÜû<0•VÔ_ÌÖl.ßÃz8óà÷>ÔÅO‰#;ÿÑšÈ/å#-Å°½Z"«Åç*x¦‹Ñóß
ž*ÃUÁ5À¶ÓýÁ– åÃ%·ÂÍ^¹{ÂJók£ªÈW%†”úüôi‘U•­¨8ˆ0¾®-¤²­ÔWpóÛ{M°áñÈ
ûéLé`ØbY¶^f1ßwŽ/þ—w«	ek-“¨{wÍTLç…3‹á±7ÉIiZÈïˆ”–@øƒ×l¸Yˆk­f“E1nîßÀB—ýÛ²`Â›-å½ðfð¹ƒqâý›ôrq"í¯Jüx%­ÿMÔLO`˜Œz-°ÔU*ý¼ÅñéÛŸþ‹sÅîawæ§`b¹ðø:„ñÿ ëe{¬Ý¯¨°Ê'jï­Çaïýjë>Œâµ^Þ3«"u9/–p`jUäãñC1v·à_XÉ-‘3ÃG/D½Ö‹JÒD¸ToóÇýQyÞ¬6_e@ï|Y:§c%ÀhÐ¦å1ßy¬ïRÅÄžH‹A
¿Îê»WARž,À	DÿúÉªþ»ƒX¾¬çÄlŽÝ§]7m—iÓÂ£Éº,†ÓMÑÙ8Áêé%8*ªf³6¬÷Ç3I$H•æ
gÊU\f~A—ãYD¨»N‹xò?þõÿå RÒƒñ7¢÷¶¹M}gx@ä”´ÍJEO¸U'èbÏl<ßÐRqÛ){€Ê.>ªÚöj VÏsÅ¬­m©óm¹½ÉLî´öB®*–ÇT‡l&t:¤D»K€™¿´Æ@;ACm
´ó×=V`{—v|y´ÿÁj®A]‘;EtsÕÔ0ˆöDš9"C«zS!ºñÿæJc—0?Ò_÷¾ýçŸeÃrhU¶¢ûÿç?EÑö…]™hôÈ_f1\xù§«ZW#vEž°We—£K¾V“Ûæm„1Û¯¦Ù~¢qÚ}S¯4éÜâM\¨4I.}´ÿ!ëä+ˆOè¡"Êƒô ¿1¾ÿByÚ3ûxˆ¶~®­ZÛ`é6(òõ½QŠM•Üšê¦¥gh®` æìu¾n^ŒW˜ƒÜ¦yLb«èq™ÚÛÂÛµ$›Èúºh«ÐXQÈJñüE³ha	>J¹-šöHÒ¡ÔO#÷TØ#sªä9áœ7oÀOö×_¶Ã495¼‘lŠÎ!|—
®™
nÝ®9Ngû‘E•–&õÄÈm“RîM–s‹nø=V•ó¼È-B=.Ó=ß'TÑÚ£$	7£;
‡Y˜ôHó·š{Æ3²ÕLI3I”žmuP(ª)þ¥iý¹!~ÔvëÛÁüü|“U¸õ~+Œë5µc‹¯Œ©€ïfl7º óå—ZMôÔø/œ=Ô°’™÷hÿµ[Je¤à?~ƒz#+.ôru4¯†äÏ{‡ÑßŽ¢$=ÅQÕ«HŠ$j¢Š·Ôpk9ÕFÓ÷JÐÊ‡äŽˆãûµCžF«¾šëÐi%—ªÚŠRÐ|“U.é”9ªzüÄGqg=åšŒþÎE€Ù¬§'Ûo!{W×²áŠ::]ÿíO]«ö “wÿ<Ú‚…hÑ*Šš¥Jði1¨¸ ÀÎ¾&›<©e_•Fäì÷6:ÃîêDŸ¸¿yj$wŠ&W¯9ûúÙ‹gk‡¦@9Xê|ëªÕRýäÞæ€‰°d	L½Tåi¨u¦*ºÍ	G¿H‚5éFó0%,ŸPÀ•¿ÃbÏŸç³O¢×¤%õú`]¦UÂ/YkaÔwé(~» 6iç»*ÜñÇù7éµ¢K/ô3jÊs<jû…MR¤©~„ã8Ej66…±¸º8“öË«jž¬©/r¢†­-{éØUÛ¹f±3W/Œb¸_»“Ý£GOÞ‰üGË’Ç¸¡ð+Ü ŽƒúÏÏnË;÷¶ÓpµB8#IŒ›l‰¦G–.NøÇQˆ^„o„^ð#ÐGÆ³£ƒqÚV+zÕ§OÛws{YßÐO>Ï±ÖÛY"ZŽ*»µ·“hxºÐìÁª+cA»qÌíLu³âŽ.wŠè’9oñÜÂ<È÷	,Ñ^¶ÀÉ«›ƒ+™q@ÛÜ1ÿ‚î=ÜáêjLq¶1?áÛ]íJÏ÷Ýñ—t1\z››ÉŸ±=©+³vzLÙ×ô†÷O©Ù
ª»XKŸì.ûª;$ÙÂ.nûÀÞŸ‘™˜;¬#7¨¹vœñ*°°5@ÈZ$¡[l×Ã(ÙÝ¡d'm‹G‰‚GE³¯³Æ:¼ø0„<ë–ÅvIÄéV$  êxéÕ …eÙzíÂ[õ¹CAÔkåúêÅQx9jpnÖK(7uñXB¹åKÎA¼2›e<Æ Žpx&ÜÊ/%‘‘½Ù	|ëg¦¨Ftuõ’SVÙÎäÞKeðÎ1­Ô²m/YëRéÇq8¼ÐÙì)å(›¨ñ^$‚/“V8råõ´hm6ÆŒ
Ì…4LŒùé+¬åHÖKd)HºöÆ#+Le±êêÀ>šŒ¢ú¬È'®ªsu4ðêµ“Hz´ÄM±áÐ3ôâVG­°áAN%‹)Û™+TgÜ¼Ú³ÔÌÕ¯”ÁŠl»u¢Ì†›Î2ŠhØ{
ˆôîS§/¾ößÎÖ²=ãE«-ÖPC‰·Ú&o{/‡ycèx¶„Ï–fÖñ¬¼7%ÉaÁ¹——­–èÛÿáÑú~dwµLñå‰ÔZöÄdÇëºDìaÔ5£z=uA?a-A6þ°|=L:Í!°þ-úÝî’NoóT÷¯„½fDI¾úÃ4;|(Xœ›£Mmš â/¤Ø'Œâ`¼7?þ¸*”·tørÎa¸Á*Ü–Ò=t3"ð”ìlÝgEz§aÕ:)¥³|O6ú³‘ÂH|J®äûÏðH½?Ï´ûL¨ÄHt±&TÎ}óÌkoþ™*U²×™9	I±ÀHHï|jWhäwÁâÞ%÷^.ƒæ@É	3É)‰4ó™‘’Xü=(¨Ü³òÜèHÈ¯³Ì"ség’”2Qw(¸ÊH°«óa·E©õŒ…ÖEhÍøU¥ò¬/á=
ªïRÒWFp=¯=Ýt0â(#lþsV´}>jFA:=u[›ÎÑz#×“àM–ÚˆV···ÜÜÍ9ƒÝuèrs½ÿx¼®×k­Î0j¦ýáVÍ'ÉmFMˆÃÿƒ˜4U{–lE½lï¿Øæ3cx,g§´_”R*—‘¢˜9JP&«]™¢âf¥µvÇm½ÍµÛÄ’A Ý½¥º~ñ ^´‡M^|gä¤(BªJòÄ>µßkä(sWãP+•¸¯+sµPøáµ/xéÞ‹Ô*ì td«³—…±û@È‰ûŽ¿›•Mî÷š¤t‘Ï©©Ôâ€šwÓL^S(`“P˜¢)¡´Ù‘×4úäì)¬xÆ¡]½ýjpñÔ«¸Ià™×ÎŸ=}ñ­óü 8wê¯Î¿õúëæ½è­Š…eUªî¨9mÞÃaÕì;\rµé(˜œÜÒ¹Ìš7–‚n§‡=8–WJDßÅ"éÝ¶°õ@g³•ai #S™/ÎYÁ¹ÖéF©õt¤[n4¹’§.‡ñ&(ÐYÝ
Éq°èvØÛ„ë‘`Òg‹CÔ£yV\?Oq&©b@‘6f4<Q“ûF±¥ôÒfzZ°\@8ô3ñóCâH÷ñ'mKq=«ÕíöïÌÏÏ»à¡¬ÒÆ1,Ð`ØxYýibó@(ùpýæ(YíRjÓÛÃTVvˆ7?W~H•@‰;ÚgjÅg:—¹gc1Å¯Í©Ã7OÎøÕJFMÞôÌ—~`žtwµ«ë¬«5ÏEPRoÄè‰¢ÍZXõ´ßm$Ía?Ž×Ã¡W¦VÆâ2¯–‹ùGdæìëØ‘ÅÌ‹B<È£æt-mGaËÝP8'eÝû¥CwF#<POO=¬Èê!êI'Už K
‰'b¬i»úãØÔª-­WåÄƒªÍÝÏ’	Úø¨/§ÙÈù&s—´¾Ç™µÍêÌÁ°.Fƒ&y‚ºkøÖ¢dúñ$3ÎðE¯ /{œw )ÞDá"šõ~kK"p†Nt¡€É
€Üû®dÌÑ	M}Á Ô±’"šGV€³‘[.c×þMý"&eû\Ë3õ“×Zî«Í9”ÙKÐ–2pŸWa«ËLûisÑp"€{óÂŽ˜Ä.
Œ²${öÈV¸•\ì¿Ö “=µÃb~XxÍÛ½´×ó'q;†—_~¹ìQž[Ë7e{Ç°6žTÎe5£É¯Ï@Ú*š]š{Œè[EìÊ.ñ
hmmøß”ƒy¼ØßßcÎ_¸;I»8Z¢Œ“¸ªÎâ¡`Ù{+ŒÊûRT¨[xjkê;TÙìÀ3Œz,¯„Ò/zÞ»+ ÛoùÕÉ›¨f¢V@¹…±44Èu^
h — U‹“á§èÉè	ç)¦—ïô–Ò~Óž½¦9³e;6é²Y–Ç±EÄ
…¹’(Zûˆ%ÒVÖGNº`î…)›ŸÐZõùàz”«oŽ¤'˜ãvA¢NÑþ©$^xvN¼¯Žº7o5LÁ7æ[xý\¶6þÈ¸žpQ.±V#ö­ð.´ÝUêe
ó>…=`.;ao3Îr‘9‚ï`äòN0þœ`ÜÌÃj/º½ÿAHUlYUu3+çJ°yW¼âj°½Ñ¥„¢þV¹_íAˆwÏ–ZS°=ß.ÔdzIÄéÝŸVÊsväÚA¾èØ—‰Ý<ÑH—
'ê¸VUƒÓÞö öÝ¨‚ä%,Z—72WÆ1/ÐŽÚhÕWšâwÿ¼õVÅP´¹qgžLìíçŠT‡ñ\TÌ|'ç72¢œMk˜üO¸ôÆþ-~qÞÜ5ÞÁ›š=fþ~gÑ".Þë©P?+½Lxü™•¡ø ’zaˆ9ª;h	ËÇu
Ìq+ÞNLCêKT­Á|ÅŠÂ+Îš ÿÖ›ï½~öÔ`/»®åšºM÷¬ï[¨£·¹¬êÎðNÏ ØÏžãµ7O]<{fjpñ‘iÁ=É.
€Ð·˜:ÊºBîa›‘çôgÍÉüw´˜È˜M“=½‹ e0A©uñãê\rt±¬ïVVÒ%£µ•ûÌ©¶”@Té8ÿ  ÿÿì}{sG–ïW)÷x—Öz"0Öyd!¹ƒAWo(u—¤÷ëöÃH£P„ycf6&æÞýkc#æzŒYÆËŸ¤õ¯¿ÀîG¸yN>*3+3+«fèÝ1ê®ª¬|œ<yž¿Ã>Lf]Âk¹BD,÷w»ât­)Î`JS†¿}E£É¾ž1êÌ ×²[ì™¬‹™ÑšéqWŠ¿6ƒ&…=evG<z´û{nB—#£&¦J‚…¹ÿuqnqiÑ'(ŠGÓ("ê•‹ ûû‹ èÖA%K:ûj˜q—¾kÖ¡kPW'.v‹ y=4©ç¡wî£j{«§ ˆgíÎ¶¨L,ÃX¿a Z^ôºÄ¨áÝ,NQº‘:uÛ0ñ´V^$ÒñéÍw¶Ô¹=©ÌlÂWA!Àˆ™Ç0¹R¾œ:Š(~)0øJ™ÔÖ’v¥CéF3uæ0Ö B&M'nv|Äêhñ{çj6Ç:{1—™™ûÕë ïÖºÆ^‰ÿ]Ú¨GÌfrþüÅ™sxÞDV¶Hd›š­´²gC±Qvža!(ŠÁ…»õìVøim^U¿]_<;ûkÇN™ŒGT­úÒÏ¹æ~=w~ö_­µZ=²Ìôä|_÷¡ÃÏÏÏœ=c§	“Ñ áóJé-›Ð@@Â´g—»ß#æZÃ¾.`0OÄ^$:kÖ
,ÎÐF§ÝÁ®<4§^Çåb2h+‡Ìª­@’º}¦žÓb–z,ŠBR5Œ½¼…ÍZukZù*;‘{ëH3Ë¦XµDJGæ}i5„i‹!¸IÈ)çgß©Š¹{~~áÂÇsöê4dg”ÚfU@À/|ð'&}ívÃrä,ÌýÏ¹Ù%Ç@ŒÌ<û  ·›4?dèï+BŸ¾NØî‰Y"óz3,µëEÂ"ÎÁ@qœy.€•è¹;K“DðÆÚï¨º©‰|0ÕÃ@<–ŒÂñT¹ä'ƒ…IÉ–fUaØ|5Í†ÎÕ›¼ëÕe–AÅR˜ˆ»1ÇÕôc±°ÂŸ¨«ü©óÃËµ"úG+Ø‚qLhTBöòf4Œ†õzƒ¬wñýÂ¯ ñcež´†~ÏÖH¹¥ÕfÑ–ñ(çëáöõ õI–K7Ã:£ë_ì±©`î£ùsþun.˜û„œf‹s^FØ8ûÄ{âï0‘«k«$ÔßÕ –z2ÃÞ"MÞìüÄ›d@=5yÚx“{Üý¢6ÎC·™"äÑëb/MäëÔdz¢“©6¥c…²µ41o49k=KrV!lFg‰XœÆ?+¡ZÌ (—‚k@ZÁûÒ+Uv‘µnÏ‰Ê`ªÍnGwaªu¢Ò²²åÏ&ÖV´Zƒ58"g/\\XºüÁÜÜ¢UkfØBDfß³Ú÷:Ï@ÝÔ*D4B½DÞª¿q K3çç/,,Îu ®ÓÐHj¹ ±’×úÑýÅ‹óóçÎ:V¡/¶Ýû`-ýÇÒ”7;ßÑ¨¼+"~»Ê…¥çjõÕ™à}BF{_fèxïÏ°È² ÙN§ˆv¤zÐUÎØ¦`¼}Å×HR¨2-¦­š®Ÿ€©~„õ1¾‘êk„/HZÃ'2ZÙ—èq_¿¬×ë/Ý^.—·ÉÎá”Þ»œZ}¶•~}£IF,Á­ÖÜém‡m.?,öÜOÍÀ)m2ÏnVµV™ìÎL«T>ÊÈ:ƒQõ54šg1ªšçŠÚu¼8¿†3ÚÑ½äÝØÒ_SkzÆ¥ïÅ¢Þ…¿$CŠgÏHªe=¶{¿$Á£/±Å¯…Õ;õ>Ï²—Oˆ\ó]€.¨ÔÑ¢(ñ|-£IàpA‘³ÔÀ\®Õ>#šËe°Þ´Ë-à6—Ãœ)VJPÉXÜÖü¸]Mœ5Ø<½)7ù>û5¹8ìèôfÊãP£S›Fè™lN¥âTÐg¸V¡ts{þ5]ç "pÿâLÚ#Z9_s1–Ð¥éÌ'9ÒÖâjÕ™f³´Z=^Ýˆ„]³Y9Ks‹ÿ‚Ýk5°a}âä4ÆeŠÄŠ¥‹q—­÷•âö8Ñ9ëÎy/Åú722²ì.mL°© âÄDÅ”Úü¶sl¶¦âyËðÜy¤‡xžÚÙÆT°l¼fâBFÎ¥Uð66–»8fÊz›¯*»Ÿ™Š÷œä¯HAó¿aYmV›äooŠ•·[¿B“ÎPJ8&œÆŠîbŸ¶;/‚_×j€"ñQµx´›ŠK‡Y±[Wü¦Ð)V«^Dá‡J=ê£´6Ø=ä“Û¶	Ý
¬ÁÑIë7JÒÕV’™.²_³"žËW£«ü›ïŒðû•g_Â†T¼'üXSöÑž²ƒ¿C"ý>ëà ‘hÝc}¯P*)~q#z7{pcô`oåuv¬¥É©7J…èØØ /Ü!CúcpÂvÛ‰ø¶¡^öÃ¢Ì·—‰~0"Z/ëm7 R|¡ÖnEù\oQÏûÄ	6šTâ/§¤‹ª£‰8§F+aI˜*„ª£Â÷m\¶koùÔß&¬å¨–clx“ù
ä˜R±¦P+—£pµåà<7]†z`¹!UÔ9…iª<8Õþ€¾Ëä²NºÛ1~Ìîà&¢»Kuvùï¢ÎnnuºZS^0š+[m—ËC[òBXbÛ´²l§>(EDÑ*‡ËQùtNVâÒ[óQÜiŽ½RkTP²B‰öœ!C¯äsp’ÛYzïZg.'c÷ã;fËÍDrä©Qì¿öcÆ*¤ˆž˜:31D+E·2L…q2‘Ì8x%1cÇ?þ„~,SP,‘ÛÊ­†Ü8Ž¡0óè(7+îuž’žûl%*‚m‡Áé£W“®¿ßo©m‹Ô™²þt‚žvž›§§•£‚:?ÍzT(…åÒïiÅ"˜$ÐÒ­“£KŸ.õf˜3Óœ˜ÄŽÍKr³GQ1Ù%ÿ&]~L]	ømŸ§ýá·û ±!b9[Ÿ /¨ÈŒv¥‡XáÇÜ§(Ú¬:U«ã˜Ð›¾¾Å‡½¾5Mþwj”^6(=§FéDuG¸tžÃà®ñTÃ»À:<—¤®Òu€i<ŸíäJ{²L?Ÿ
ú˜|ÌŽ–oö·˜’ô”®MËß²4ò…"$üÈõÎ,Ü¨þdo.Ó"™öŸ²jj.hr›Á¹6¢P=Bj­¨i>Cà
,P£v•È®:s¹Øóò+TLn*Ç þ÷ï€AÓ¤¹œ³ßaÌ„a²e¬ù·”sõ­ø`bÑ/&É4Š;CMFçás68MµxÑQ´¦@úY•«¤Ÿ[fË›xz¦Ñ Ï_‚vŽB#âÅÍOÍO¢jÁïÉÓ,æ½&†„×Dz%GL©Q¹·N˜•ãÙ­ *7£´‘Ó¾Çm"ËS#“pòK ÈÁ_Dx+Øúz(Ã2«j’xhR’ä˜Œ(5a$CŒVPÒLôÔ©£ÅP¡Ë'F•Ö^™d;d›^ëüh”ÜÈlcw‰äÆ(`ëÍ°Ién#d‹—ÏEDHÐeu‡üyCù Q1Fá#ëü%7dÛ”.âdèî1}¾Ó§Õ>ž,{!Lö*'!ÂÇDÀ&UHT¥Í„Çéõ-Mê´ªø¨&œäiv©`-cF°ajâPâàL¨Æ8wüP£¹+Q8 ìÐ’˜Ã-0“câ¤]_U4Rø~b±Ç¸ã¶ù×‡sâ!®É¥¨ ÁÕRQñŠøÖ@›•Dnè²ád%c¸ð†7¸ßã)ˆ­±úºÓù	
ÐÄ|d‡…Ê¢9ŠÓÐ€
|vŸ½yp‡†ÞB`6
ÔWÀyI¾rDœ€)¦l*qè7’ÊK¡VŒc…²ArH`üêÁR•2@t]R•òËÜæD¦àæ§§F¡õþ¿55|™ˆ9ùr`¯b£ƒ°ÐÎ£A¿EC\ÅC˜Cªí_”@Æb±ÖE›ažÉÉÚªRÃyCB'KükÃ'&±ZvZA+Y2…Ä+ ¨Q„
Våá¬¤•éG+J¥•½RªdÙ5ZC­²ú».Å›vŽU‹¬h\½Õ•oäˆ.	‹F=LHy/JÝnW˜¬&e¹1ƒ”õ RX Ü§<Õ»CfæŒ8¦–%æ6
Iá#>í.Š>¤·€y>G>3]§³¼ÂWH"Ê“·ræN¦
Û½R‚V2T“µc,Ãndm@%C-\3Qt!ºÐ¿Ä²S‰*µap•¢«NÙí)èQ‰¦¾%‚58G9Þ' —lyÜ~›&Ð<v?”]ˆY(Ö–È¤/Õj˜Í—ÂVÆö€—‹Ì%ú4i±V&"}+$Ì­‘ÓÖ&Ù¼¶ r39ý¢dÐ¸¢'BgbƒtÁµáK')j’[“Pèo ×JÅbT•3
UþŽ–Ëaá3‰ ‡CrŽÛ*˜‹z{³Ô\Œ
íFô~|M ?Y&BoVáFBäuúÈ‘­+	ùßÌå!d`¼0›8„ÂJ©¼AZ˜i”ÂòÑ F4ÜŒ¥•#ú6Lìp6ý–°F%l|†£/‡¦S\±
Wù#²5)®çYª&òA­kÃÑçQµÕd…Õš¦Zp¨èV#tUjm_;öið{Ò¢¾>ôŸ\<!äD#31Ùˆ*GŽÒ•6I~jÔZÀ~‡£Õ¡ ç=?>r|&É ôl/ÜYiÔ ±•¦ÉMãäÀß¢ÎîËGƒ’-‹¡¡¥¸”¬á2!¸’’,ÝFÕÌ‹-:v³@=–Pc[Áp ŽS´Tåõ„á™¹#æÈ/k˜›!n‡û(Mô>Â*î²à\Ô"+‡‰µùÒJ­—š­æ‰ 6ád“n7g*ë¬&Ab¿·Õœ:Uª¬ÍFá´ö¢-r*¶NçârFYÿ©-ÿ.*´8Ûâ_[µº¹$­9ÞÍä“v&Z	ÛåV |6øôƒ<LYµFˆ÷Í<sou5uR­oE´Åàöåá nž„b7ãJšf¼aµ²©,¸`ž¿'r›e1ÉÆOI&ÿQllj\}Z ¹$5eþîEØÌvqlÂ4kE=µ6žØ¿ÇÔý«g<ò”2Å¥LNèG4ÈHì`)Ñëí6M[7wÆh80ffèÔ®×£äå¦gÎ||avfin1øçàÜÜ¯gÎ³Î/^<·4s~iÑ\¢ÀJÐÚ/ÆÃB¶[ÉpqáKÒgÅÆÙêjç,ÑM.Mÿ§OD/ãë@¡¶bÂf­*–¤³igzCÎ"‰á‰ÇØ[„È oâ^Oo¾¥ã[A“Lm#j6gÕ[6ªäÕ§7[vd<WPl‡S”ÆTBÊÚDÚ!oHØ§¹i­-B1¦“ø>ÖSÃ=†§ …¢´Z[dÌÁø©L¸¦òRcF–ÁÕÍÉ ÒÐXŒ…g¸j™”W6(ëj.²‘ÚLòHµ5¥ÜÙ³ìW¾Bv\¥ÔlBð{xÛ…••x¹ÏÔ
èÜ“o†àÚßD,ƒ4„8bxCÍÙÍ†Íâ(T`ÝlW‡'‰Ú<<aõØ!¼Ø
+u¤CåÈÄŸÙi‰»e=÷ÉÉ$9"=UJë„¦	5WÈñWª—7à0µ†˜Æ}2N>ïÿÞCÍ³Ì¹õ°0IZæ»MdC-íÄ1.ç˜’Ý$[¥lé¥²Ùg9j]ˆä¬œ¬dÛžHR‰_aÒd	<º¸þcšI¤ó6¡Ùç¸GaÒ|*[‹v:75mžŸÃ·;/0@ŽÅ[ià…;üX·€ª¥0Va‡¦÷ï3#ŠÐÒ¹*Žq%O9^EÀ¡;w:ÏÑà² 7™Ì@4zÂÕF²Ëæ_½ÖÔìÃPÔ4ð¡¾3;³e÷O&+d\[ƒ¹ïE§§ \3²ãîÛóùÔÔ=·ÉÊœû'l–D®	c"—íÌ“Ë´NÚ+&èÉzà¿ü¾Yîµæly™cU2¸™w7*§ƒ"Ø*dFFV£Ö\9‚?ßß8[ÌÇŸ¡ l.}tŽ]¶8^i›Â6‘ÚtlÅ°¹rÁ»•í>j¼A43$ý­õxh¥Î‘b©YËéàÐÃk6—?ž›û1> 0ápA…áö) r°(¶˜«ÄvBrr¿@<ýÎ£QãAþm]@%{øH7¼Ï‚oÙ
ÈÏÜœ<æƒ+Gƒ1{zšíwËgt4˜EP± Oãáz¸ÁK‚Õ¨Q[pµÔZÖZ•2QÉ‡KrGÆ—´®ìJOð‚¥ÚYhž,[x5,µ‚RêÂå(/?âÊÍ£mm¿kÂ ¶-ý®Y/®8[Hk»X“lM(Ä^ùßPg~£Új™r9d„E#L(ùýð˜ó½j»À\çÂÂZ¾Œ–¯r:ƒ†ÖÓÀjÒj©–ß_¥ƒ¢oXF§ÙZ¹Öp´o{:Gkü…pBÙ÷"6‡Ä¹R³5Ò [ãó(„›š{œ0³Ü,nX4²b\ íùˆ'/„O9¢“7ß‚¡ºÆ'î\N»žÒgs„x¿ò[zXU©VwfµŠž9Úx¿FŽ¥Š³w`àcuGNi‚vÀ£G¾pê[áÅFY0‰5´jóÕUrX%LÆ5„zi=*/ 
&œ	ƒÚvúêr˜Ÿ8~ühÿglèˆc¬Ým^Y²unKOˆÙ/C àÉ²îžT’¥Û«gš¥;l0D
üi™PóÎù©¬Že$7JêŽ{é€vç5¢ƒDùFDŽ¶Ï#ZmšªUËµ°HZcWþG·IGBNh6<Å‰²Ñ®–Zd_TÀÙbSßÂIòÌ(¡M”SÀ¸HÎøéîwÄk~[*(#ü9‚.4B# -á„Y¼Á9•¢­#t_:£w8[K’ÐñQØ [‡¼êøñÔž­Ôj-é‰É±Ô'šáJ–È*t0l`ÃêË‡•–{R!¬~6ùJ 9]…¿S»IŸ³®á—ú‚ÞÊBèØi·FåNzÏßÙê<œ "JS:*¿¤«®‚±AÔ"V’¦]ëi¿BX(Q9ò¼™SÊl¦0K`®üÁir.!ÁF7ŸÆuÜÊ	´æ…R¹ŒG„z ºÛ…gDŽË‘ƒò¨X¸£1ùŽ|à<2Üƒ1«ÞÀ”I
ø¬Pf¬>K:3þ×G°¯æîº{ê„Bq]c
µäé{æ×		}¶ÖF*¥j^§Ü£ê&æd×ý<J˜Å¦eãA¼º1q#„¾;eÑ¤¦(ß@ÔWŸÍª>»Æùˆ29ÎÇj­ó§XS«˜Êâ@þÈD1¥ÿ×ßZO¥&rÏH±^¥äD˜RÎ°×‚ôƒ\Î‘Xj«†¿/œËAÕ|´^]Mp‚ñ˜QIò_<yd:CP„¼ýä3MÞ‰J»§wÎ'y:q,ô[
Dþ…ùJlfºüöfœYµ5Bn¹bËÙ8­ÂZny–°F¤[raÓ9f-
VBr¦§rGƒÈ‘´Äá’Pgò› ƒêîÞÁ7%ùUo€Š˜nÇëä~¶©È]ßã|aic%çyÝ¶«µ>WKÕbí*ÀT]™q%?š
I{âÒú¼M¹Þæn“c¾r*7uŸàtÊìß`óO&>é
±Ø´í>7ëÉ NúûÇœ”¢Åsæ“¦pÆ¤cça6ä	QÁÛˆa§äÞé°?C`™Ýd¸NGØ<Mâˆšº(ý™€wžÆ±Â =ËÒDJÈiÖ€S);¨÷°Sµ1¿àS€ºoV¦êèð÷ˆÚej"wÑ3
U¡
7Ë0¹Öõ¥F¡ ü´ÇèÓŸö3öÔzšŒ<5ÅDtvêuÚuÐéáÇœþÉˆÓžNýâM»7ís éKŒ3õ3µce¾BA¦†¸—òªY*aÖ[DcðŠ'Á¾Ú¤ƒ5M}´Ò’f;ùò•°Ü$mñ\_ÄMyL³ÐO ½3‡4¦îaw]‚Su(Ù³+Ò,ÖXø¼Ž!GµDXA×¸´*JBaæ¨‹x’¿hM›‡G»mõwL$!çƒ/âÿÒV¾?ÂX[C7Ü Lqé$ßµ¾ÝÂÕ,LÇX¦‚íJI jp'ÚZoÀöŠQ¡Öàâ/9Š¸6\C#Ã•&“<8¹P+øc{¹#v=j¬MóèeŽy¡VîbÌVòÖƒ¬áäôà†7“=Óñ.NQÓ ¾V¯fš²ä¾£Œç× ðpVOcáM½obÀ6PÕã>[b0|
¨–NzKÕtè¨àLòÒ-®Ï¤õîl‘÷/óbYp•¥2/Ì6B†>&rËÁÎ·w´LäÎ!dq÷ð™¾A³t"…bÛòak¬uûxïÎMp‚4îÜÄph8Öã}”˜
xÍC#nÔy%©…wî\© µ|h¦ži{“ãØ²‡ci†PÞ$+$ä$˜€ƒ—H¸B}š‘dÓŒ0Àù¤°Q¸†´¡+Kãxê„}ŽPÔBØú]êKlÈöÙç0¿×1ðüÄk>†)"Wè¦C{õÃÎW±‚ zÃw(Åá&aà õy/0ÈjÊîƒÄþñ¥W(œž0Îdý	(Âišs¾FºÈˆË°RßÃÌÝã OØüÜÓEneaø„ÿ3wÜ¸Ü)?%í‹é`¤>0€O1ÓŸ¤û˜ê3Ú#²ÝH†TÏ Uymh(š:˜Õ[pÜ‰BeXaB¬?!e]÷·ö§ÏLj¤ºOœºf!öŠÐL‰,O†²'C¡YA­Î‚Ô1x×Ò¬ù×>®3—½`\×AL”xôœ#ýMä÷›Èï7‘ßÁ›Èï7‘ß†Ï›ÈoO†ð&òÛüyùý&òÛúÄ›Èï}yùý&òÛ:æ7‘ßo"¿“cyùý&òÛþy)‘ß±æ²!rhaàsë ‡±Hðô@pß ì`Ô…²Ó”40„ˆ7!àÙCÀ3{K·†òCq˜’RlÐõ\µòâÊ)ÎÂxÜ©‚…ñ˜_/v´hæÃ,‹'W,c1FüxUÇkC(•¹¶^JL#-ï™
Æ'&NŒMœâÂ^°úPÑ«‡rF‰*[Ü«œ¡¨ô°”ãýKji¥¬ ’…úŽTfzöó_ÛXmÒ·²:Ñ…¡DÉ2(–"ª–á—iòÃ¼³U/3—ÅòœQ¬¯–,Sf ;bœN~ÑPEQ®ÜÅ¾o%!,¸p7zñj•VÄj®OHç˜+„UšòPòT ˆ¡w«‘ùÖßk¿Ë½Q‡ç6¡¢]~ä&
ðÁÝ™êîÍÎ,Î]^\šùõÜ"%´f+IiÍ– 3òç4ügpõñžà@©\Ô{² 1+lŽóNcã<‘»š¨¥‹|¢óOÌRÿ&©çúÇüˆÐ öö­I¸QG*ÅYZú×ù¹ÅKcŸê5	É=Ù§£3n L ÆA#õHÞ¢À=ç"ª”qAuØµj3jGIÜ»‘‘WqE¨°y‚(:?bUFpÅîŠ¿ %.tEZe‚K@¤¡U6¥Z§X þ¼QVŒ)C)#ö,Üx<g–ÜÌGvtuuM#±‹"²ºÒafxÔ€mÞûŠ'‚Ÿq¾Ÿ{@¡ÖnàÉ7{áâÂ’a'àÙ¶¶dàè,»Iî<…hœcÕ"pTä' ÿæ³ø=!¯k>ÒÃïÚÅUóþÁ+ÙRë¡ÁÛó(MÇêW_Ãji®£o_q	Ã"H°S¥ô°A3”m¶1sÈ8'ìš½œ(V%BS€Aü0?j§z¬#ªŽ[Æ=%/¾#Š™)ÉÁÙ®ÍžI2—¾m~¶¤ŒÒëÞÆ7ô ­ƒ¤µÙ ²u—tÔ¼[Tß<™2ª!‡8¿4³ø›ËKsÍŸØvùD3æü)§œ,é·¨¤ßÒ$ýD¦ä»^dÿû¨î>Œ3”v ¯ÏÉ„Yw¤óÀ°’t‡Ãùš«‡Znój’ß“¥ÅG i¸{j¥†­‡Zl]Ò $Õ¯šï[	Åñ-!ñ’¶…à>5oÐ(
±Ê±šß#ž zXEL‹uJÔº8†™8‘9Ã[;TKÎ	Þ–uú­+ˆ.šnÙ€ø¬ïiÔ6+®}åhJÝN¨Ú6£f¬,î²´ý[8Ê€ƒ-¬Qk*MåU^õ€-æ7µ8°-š‚NÐT Í–íVNSÁy¼/¯ÐŠõ\3fïP´hZO*Â¸ws¶6Pd¤hŽ&ˆz·aQªlÃ`õÛsL8fÊb4—Tm³ò{,)|ÙžBY‚=%IÖI¡Ç,Ÿù@¶/g„qæS’W}vñKª¶á|*é"bÌü„¥œµÎfæ8Wx€t JoI!•S„K°}¤2
ˆ¼¶š71 ]dw¼½çåycbO@{üÇtr	Øü%úÔÄ¿¸+Ý%¬ëƒ©(­ÚÌõãÒVBšÏ¯vÈ%-ã¾…ì»7.ƒ»ê®"þÐ%%‚þcrö¡ŠôŽƒØº}xÆmÊÞ„õð=‘P¿¢r#®³‡=÷²v³šõI[7¹`°bšûÂ˜ÉîÄ–MÚ£WË²)å`ŽòZ‹Ï!ƒÄ Ë¹CIi=£EH“Ó!„„Óô_"~~ZŽCO´À— 7-Ñ9åþFä±gìßÛ`8¸‹Y9ÐhòG˜Ã= šSŸ¹ýûà/³œöƒ½©ÞÍ!wÀâ/ÿÌ²ôU¸•{€ü.8©ÝHn«Rñ|ÍHpÁ¸­DWÓ×CT#å}Ä»ÈÈ•9™|·Ö Œ°žûMòÓÝÁ±÷Yr:ëk€}`šO¼’Ô¤ŽB?™ç%ƒÕ”ƒ(„ÀþK5¢NSAÒcßMËÆR¯ûª×Ië©×cÂ2ë7Œ„åÖw4±	×ë‰§¸Ü™e‰ª}âJ~öÈmÜã¢¬ýMÄSÙ£ð(>§|T	KeÁ‘+‰ý­‡•z9ú^	£¾:¯ãÒ° ò!dCÁÄ0£_Ì0¬°XèãÀØ5³÷€™ï®Ñôæ¦gY|Ââ!E³(|nBÚ>©Ö”¶ÈÚoŠ&š˜~¸¬;i{-
Aÿs‹Ûù.
â\é—$Zë)Â{€TÔya"@“?$„Dssd^ê[\ëfJ\…0>eˆª */@¤I:lAÒ^ûr1yÂœwo—)¨€†T+mÑv‡±§le$:’­Ÿ­QÁ4µ¢Dµ²"ÅHû˜ÒÊØ»S¾–ã—+ Ê^xÇbRÑÚüpnfáìù_ËÞ÷µä^Y#{cmpÞwô«ìÇ\ÇŸf<öµZÅ8pÁáA/d>BÂæ 2êz0ÑwâÑ=†ÐàG´ø ÅáÙ¿ã¦³×°ZkEæƒ¯Ø=†lÂ_ þÂv!¢<°î¡q_®7FDŽ^!Ç¹õèa4ÉÒ#t B¯)$é(–f¡_Ò 8-3XÞîÐÈ„—!
¨"!ï‹ÚâÕç’¼	®¸\úÀE«Æ”FÖà.îË{ùÒßÀQ.ítå£¨´#|@B£à(,œ—ù†\ŠW/âÏ«+ãPj¼A!Ü·Äi^5†Žd&Q~1ÓJñ¿qžÛÉynËóÜ¦¾üiþG'AyUZ|h°ñm4$æn†8Ëz£Tk”Zfc»Øy£
îÞúÂÛòñzÝ(SOWè-šôMsž`˜Ìuw¤„Ao[ð¶·üíÀ.‘Si€§+srI;µ_Çi©úy­TpfqÀ‰úœ:@*^qÄ+aÂVý˜ùg–‚ãÿ”
…ßgµûMCŸ3^Ý£]%C	î™’"0:§øåŸë¦8ÚmÂò~ŠÁ¡~ uáfì)Â…è2h,¬FdŽˆ¤—\)Hcc½E‘ÙkÉs@´1àŽp:@ÀsÊ856zËÄXãÁvÔ¸Ciâ„Q_ŠSæ·ÿ'%0ñàÎxãõÈ#(Áƒ'€9™Hƒ_sÕÜøOxq±V4ºhŸlIO-Oo®TZ3sgòù_jë16üK@æå…™¥9°Œ-OxJ?çp˜Á:`@njƒã#cÇicÚúÔ_ÿóWí2ü˜&f,xø)D£ZPà=-Å¨Y0…\pØvˆ’ºy4¨ŠUWšeZý ,gé¹?@™%K£ú¿{fFÿ$õ`$ûµÎ·ð²2¿©7ˆzÛ®áb Õè íÉ³¾ÝùÁÐ\\B–êáF%5Hzû3Z)ˆ¾d40Ñ‡¿¡"YG(£'Ÿë*¸°^Ã.oA¤ƒ?‘Qîü™;„ØÈ¬‚Bâ@vÈf‰{ã-ÈÒdLªâ, !E#dO¯F­|‹)V NÈ«óùz#úœ†™›£_ÉN„[Ìq…q+y¯ù–•(šYmD˜ö7æÚE_+mSL$‡{m
ÔKÎ‰‰9h7šÔš¡o¯Œ“ÅÅ[²4×o™šî_Prìã–µn“)5÷Ènæâ °9Š9ÌYÊmÂÙ_ÄÌ~a:w¹ù &‚†¾Ý´ð^bRuÕè‡Azà0£â,oátðK¥É$UÑÃ .
H™f¡F[¹5Lkœ±KaÜmà’‰žfò8id£|Š’ôo }ÚKi×¼Ü8 ˜|ÁEåJX-Dy½¤ÕD³‰rpñÇÆW‰ƒŠJÙ°‚áP$'¹£'A´´Ñ1a$ÇeºŒUz–£ÖÕ(ª2l	s»¤edÚ
ð@\×Žt
`m0$F!Ñü#žŸ¡å¾ÈæWùx˜²ux{l{ý¦¶úÓÁ˜¹.“hODÇq^ÐE•R<TËxWÖJÆ)$ 1h\,}yÕ1KAàÚòxí	“ëåÐï©€Ëöê@ÕÄøŒÙ‹}H…õ‡Ì¸íxÍBôd¬F†ù”rÉ)Iºfx3„@Ãd-ñZ\xë0å‚ƒÂ
a&Ã'ÿS[ØÆ”°Y
íF³Öfµñ‚·]`Ooñ|éÔ¹Äô32³”ó<þ¼ä$wôÝ1UÇÅºK´&“TirllôØ˜»á©@G0—Ø“ÔåŸé!öògëŠm©ìdOõBG©ÆØ‹¥šk(UÊ¥I^H{„I2ž‹PX‹
ŸEÅÓ›=­²ÐKU¹Ÿ3…LéAt½J®Ñ"jþWÉÿÂŒ~N¸ÖÚX1„~L‡Óð¸“õÏ3"’«ë6Vï
ü&]ÉI~|)/XµÄ¦eÎl?¥¾:™0»çýr§Tªøˆ‘Ž<€:5ŠM8§ÞVWJÜàc‘« NºÛ³Ù|@tì‡0I˜Ý{ƒÇ?ªbVÓ…àÒkXäñíY,¡T‡/iå„KÐ‡žEmqD­F/Ü&ÓÒ`4šü!Y}Cžc16i2‰ãðcÄ[’yÐ¡ÜthÛR»º@>B+¢¢Ô“T¤ÛNp¨
˜²uäa”â•FJ›Ç”0i{p†¾ò`ê”¢U-†š8‡l‚$Æµä¦ùEM6\mØcˆUFÓ•¥¨²À¿N/šÅÀ…!¸].oÌ‡â”šâùøÏÞAYFª÷§­Ë¬$mb¶´ãÈ£·4'ùãÐ¢äOŠ”Ç?h+ ïu‚fÒA»DC“¾ä%*:eCþKæq/—ûîàè;cI)×]>1Æ…Õj­…­kWÓÄJþ™’ C¿º’G5‰Ú·ƒ1UÑ©•¾Ù)µò]zåŸ4iÁ)ÇHzGªØM¥	ÆñÇSDŽ?]Ëñ‡™â|÷|Š¥&\$Â³ ¿…ÐÓ§ßƒ½ÉÒtliB´ÔÍžÅéøã¬ã½æ§éÎÞ%k©½¾ËØñçUÈW‚&éo}àÏè"ñ[?é:¾×2û&
ÇÝºUÖ¨Ua`ìà/Ú
~þâ¯êàÕ 3ÎU­–gÐÉëIÁ)‚O|›×\¹ŒEÊ}qÆuœ›käàøÌR>^ÿÄ\Å)ä*oÖÉ¸TÅº†ÔØi6Þf#,cý‹ÿp’ÿ ÛH½‰ yax)±d©íž‹çKíCä$õœ ½L½¤yÂyO¦èN*Å+è‹aí€Å;vXÝòŠ«¦è¼®3X“A hJ_Î©,ÌÂÖ¯¤e<î^¨ÔªµœˆÃZÀ£”©áÝ¾¬Êc×{µ•b\g/si[NC´£nRÕÉDt9*()¨ë„(ì[¬–“>¾¹ÿ_?þ	Æ'<¦þ>MM•"8„¶Êl÷`s ¥X¿Õ–©Z?"E%ƒ„­Ãj“ÊÙ­î©všü½/$1_†òªÌ´¦–•Œ±Öuî’<q¥¨†åÃDëÇ¸õmñ4P›­pÒªËÊOš‹Vg0×¦/ƒa¾âú¡ñR`æÍ*‚Á3–ª‘¶æ²_(ŽÎŒ…Hok„aŸb¤g‹:<>f–®=B"·_„¿´>|mäéêè`ÇgÚ,_À(zA¥Cöÿ»Ïé—Š¦‡A¥–žù¦ZÐ€¬¢ÖZÍy¬ÜÑÃü;2'DNÞå°€·!;óäô3!ð'oÈÍ©?dhŠ<pÑéþ›ŽÿÎÒðè?d+ÕùN9)‹X>ö‹øö=JÄ7x"Ëë•”J@‡ý¾³Q‡âgkðÑ"·9–dÊ<õ– $ÑÜB û}ŽûC×i”ÃmÜ£è_žÉ¹ÑJÔˆª…È $]ÏÄa—>~÷äÄøØ$®	öpllrb|À\×Ä•,A½%'ú²Ê8X³oÉ½‰Áð ÞÄ5ÈWÄK7æ>h!¤7Ñ²Ç$Û~Õ_Ý¸­ÿ;Oáá@øÝ?,Ö®‚éHy_"ˆß0¢¯¸6þþ¤AAñrgï¬£T[Dêf’“\ðƒW	·DåwÈ'%?Goë5½L”£ŠU¯öžá˜³äÐ?0ˆ3f_~šçn™²·¤]¤çhKÚÎIàÊ8ó^(c­P$Q±$«À÷ˆMµGTQ<nr¾§ï Ð(bŠ†±R*+ .,žûB69ôÑ î¼°ü»©8ú~i¾7riìS0áØö.)Ï‰=„G^¬CmaD’PN“3µÂ 2ID¦¸WôøXnZé–ãµ±Øü±ya×À¾1fŠÜ+§ÓÆ¤HcW÷P"ç¶úu¸Ôk¡/b˜ àà#„ öbØ¢‹ß|“Lû'ÓJŠÁ]ôÜŒEÂ»o°ŽŒÏAÞC!9éÅp~ŽNóDé9\ø\Ž‘Œ»ó9–ó„1*5›mËüÐKÉù›ýn°Ñ Éˆ"¨÷£KO­$<c×:_e·*EëõRÃ(A/õ0–~°Ý¦ú½NÒŒÛ’ã‹9|¶jñ¯8ŠµH¯–Kêðð¸C{È`÷ùÏÁ2À¿< ÏBêåÞ ò,çkááàBˆ™è×©,ÎâžQ±Ô"§ïEr9me0 _º“òØ+xË@M¬º)VŽaš÷›^£&ÁÃ¬þùÐJ>ôsI¥ ]903ÏîBtP\:€¬qª²BÈAþª^õFíÂl÷ÊbH«?zUCd¹¸¸˜ThŠl¶mSB¿Gr. -ý&¢gY‹Â#zÊÐm@c>)ºôöz#‚
Þ§ƒ…çæ.Ï/Ì-Î--^‚F>\^/óvÖ~âOMñ.¾Çþ``nøûç1N•¹™zÔ¨I…HŸM©!Ö­Iw`™lUúÑÐìaæ‡ÅJ©Šþ.ª_Ì¿ú#ð1Z-€²´°† ˜œóÔ_ËOeˆãGï¬£4öÒf›LÀç¥f­oÆÊyh:¦Å²Á&Ä
¸ý0Ï0qpï©l‹
Ï™¤öÄ¿l'LKãÃ÷`‡@t Cdàµ!‘"ðZiFÙ=Ì°ò7p|ƒÙôÚT8(BdÞÓÛòxÚ<ììÓ‹»\©B“ƒ÷›ÃBÜºaµÅGŒ…Ÿf7P®f³*AØÝú.«B€ê¹­°¾¸W\( ÁêvÃKµ{³\lV4*»êRºÄÎQŠ¾¦È”<vñ°ì[5Á8ÚØè'A‹bôÉMôïÇ¶€»GßÅb».CÑ¯™vk-]¨NúzµÖ(æ"Å/TËÂBÃéâç/þjüe¤WÞ–+²¤E^
’Œ€¿bŸ¤«{+`ßë<TöÂéá9nÄî¹O¶å3äT‚lc’ÑvüÀÁøÉTOxœ"ÎB”ZÉ÷zË$g¥†öj©&AÅž½cŠé5G[Â]O-®ÁDÏBwÐ,ýž,äøñ­Äãðhsð³a)üg?¿¸Ñ$ýˆìß.GMCö1ô5=\ô{GÇ¥1¤cRˆdÅ
R%‡	šlØ°*ÚÈgÑF“Ö-“wÂrÇ&}}úžþØæÖGiÈ†BÏüÜÂGgÏ^8ù£g.ž›[iÖ*Q>_ÁË^QÜMô½÷kä-a5ßç>]ú,›`}«­ä™ùøŽO‡†XZÙÙÁ¦¡»ìªÉ^oµ4F³ö[|áÁƒUy¸Ym›²û	]¾ ¬Ï€Ÿqx©÷¸}çµ:€/cJ§p¡Þ)Â Äßævè§pf˜ôõÎ‹àà-»‹uVÿD$”=°^Ü”µÆm”|éa—'E²máX
ÃÌ–Ø.)|©®¯Ÿ˜À(±B˜2ava»UCè6†Éæq|l”l,Á/Ó½™¿Ä+lÜ¢á–f(/^˜{¥ Oãá|T Õ=Y8SlÚG”·]ÑB\ìÇCaH é¹OˆQbÆå°•B¶«"z‹¶ù^å›ò½WkÜ’Ð¼I³q¦ÚárQ;w¨V
á3mãï¦ÅvðÉØKc9F€gºCLù*†Ÿ¯)Aèh1“ñXn:-Äš<¿Ï½`0ñ6´¥s»»0¨¸rqä."AUjÅÔÔS«øh“çxjl7¯Úèd;œ|çT7l}ˆòuW¤8ÏD«Rùð´8[¤®_"&Ð§‰þ’£h-l.…ËñI!_?ÀƒÕðsrÇÙbóÒ9Eœqë^Ù©^¹©¸µh·Ó¢òS!K&d¸ËÞKè'žršÖÉSZŽ‹¬NþË1Uà†pywj¦tód("Ew§eÄ¥%e¦&0øeQRm³—këéizR^"›»ô„/;WâEôP ¯“M_ì'wr7ý$íZ>oæïUsÝ~Ô=×ö­^¹Füa;Öol)F¼äG1¶ù¾ß"&Ð÷UAÀ¹Ü_yÏ'ýrý¼æs+7 ïÉ’iŸ£y‘Vo+¤¦Ó@…¨ÐnNayÌ’R9Fjþ¬QbYoz$¦9r_iWZ¥Õµ–Î)§ñÀÃ;é+=	NEÆ.°YVÕ|3àÏz¾Ø#7Ì#3ÌAAö¬0Ç«­—LkC<FÒbÉx€H0<Ò ƒõA×.:»}]ò!ãó÷ÐË¼#™)Ü3ªÿÀV!`ùÌ4Ùk¼b®SuZ_ ü¯‰¬Ô.‡€–n$ÓB¯Ö!Ü–Jòš†|F!ƒIHË\5™ÎÌ-Íœ=7wæòÌìèƒ±j¸++œÄ¾ÊfúH¡ /¥% ZþäÉ´|"MZ½kð—2Eµ~e5 ?Í‡ŽÄ‚.t|—¢B¡sxë6Æ< Ý„3‡Ž"&ÅqÎ¼ðÎ7#|Õç‘óì¢jN#ybô„Ðrà!ˆÀ—wÓ¤)ç„ƒcP—ÍMIX?Jc}P§lj”ÕnáV›|Õ¥,jR&õ¨µ(«:ôš¨Ažê§Ú“QÝÉ¦æH¬ÌWÃqkÎ©qi2FæwiªËÛ›I\FpM¡¬‡OT¡G¾+¶`Ú­ VmÇÔ“&c“÷œŸ!ªÿxÜ(O¥°Ù8*½ò•©Ì%Š¡k0.sûw¸ŽÁ‡Ð\ÐgéS×PËýÓïØœy¨xNýÊªÒõSÃ²cMš5q«¦ã¯¥P|T‹bFc-¾ÁÔ¯cdò'à9; ­v°ÀÝ“ 2Ò*zZØ%€ ìƒkhhÊÃE–@Y·àrÙD&Ý¡’¢@XÏóô“œ•zžåG¹ýœ+„Õ%õV¢Æ,é¡I8ïVÂrÓˆÛeÍK2c´ZŸJœû6È6i¢Ýö§FœhÚÀc˜3STŸca(žßGPaü3üsb—9²„¥a¶Ab™‘eÿ^	êãRtUª/ÑWrRÛ~å‰©£¡mp<+}£”îtsU+!vÿàä4S(DÍæo×ÂV3¬×ûKNjÛ¯9ñ,
F…¸Sõ LvÌ1ÔŒpžñA©
¥bÀxË¯ñhá"l[ŽšáA5Z¯âk£'õÇt)2ÕÌÍqœ[.A3AY›ZŒL¥bðÝ´¨%D~2_
,ð¡ÔI/›hSd‡…Íj!°•q‚«uDk˜)½4«¿„ çâÛhV”õN)sÊ|!öb9:•£V„íµ±tRòF£ÆÊ&ÆØÛ’ÝŽUO¢Š5¨|“ òA ¦E/àŸ°¡	}P˜+“btg©´¹6!Å·ŽNÜß·LÖã˜B“|2õ> ’‡Ô=:Ð°LIƒ0Ý[FL\>‘2+öìÁ$7`é„Röž”$Ï²ó¤Já²IìxÓ4$tÉþUx‰„£RâoþuÖ]É1/%;~¶QÈINýiv]nÈ•iz ñ¤lHŒ½‡Óy3SÐ·8A7‚<éäPNK†tÜ/@gÒr!{®9¨¼Á ñ!«†eÉ<Î€	iàAV¤Þ°¤Ê†Åƒ!…©?~m¡1q¨Œûxå™_Îc5„N†åRËœ.]ïOúÀ©’Á!ƒ„<ø óÍ<ð„(.Ù „è¥dîï‚¼bÚÇ"M‹,Ïc”­¾ƒèòkrÒ»" \þcs“ Tœ³£ð‹ƒ 	cÆ
¶"=ù	€Ì»‹ï_Š
nQ®ŠIŠ8_›2ÃŒ˜íe3ùÝQöÚ-1ßäë÷Xêý9ýŠy”×§r÷ü`& \9¦ˆß'ÚÜ7ž7ïAÛÒ3ì¦'¼ÒàŠö÷:;ÙA¿ÎO“¸Eˆ+·1‡ò¯¦ÝgÞ‡F³Ön¢+	ÊŒ ¨Ü‘	ëëƒ‹çÏ\^¼pqa–Ã}5“ìŸ<Kþ70ö~pG¦ìdeÕ¶þJKPaUíóósóC¿8fÎYªÉ¦œkQÈ•ˆ*9D—Ròä£:ˆDü2‘v@xÌu}NãÓÓÙÇô?@4r$¯&›¡ý™¦ÿy2Ußw~Â	$?=Ç¤œ?p(ü“m;@£áow\É²]@‰õ°ÓŽùí´kà	ÐŒˆµÊDÁ	òƒõ¸3m«°Š*Ë–âW3m§Å™ó´xyqiféåm)ˆ4C|+@ô¡Ç±g˜õ šõš¤F©ù™9w˜\èBPFÊ|Jñ:‡œlÈ†zÖyáy÷ž÷‹€ùˆö‚°xD÷ñ%6Z-ÚHix©Ë¹¼AE ¯Ù¹~ Õðe¸nŒBñ(hª×;ÏÉ*°ƒ2f.Ýá·pàô` Û2BIL.át­Øo£úuçqÀørV>‘)]=íðgSš«„&3ö(Î˜ì/¿Ùœab‚MF0]Äë‚*ÿ7ÚXzÀxJ5§Hµ*ž¡BÊu[U$ƒH«T‰ÜÀ‡æ7Ñ·ä—ÈãÁ¹ÚêÐ!C2øQ?èÃþ¥¦À²^¥ÀvŠrÍ‚Rc³ˆˆƒ0(íC5¯Àè§›ÒkD0ó3¼â@ø€‚è}UÏŸð.©§šÐýòÆ‚­
E|y ˆ³ ŠøœQÙ<8;žÉ<oÃj‹/g’_ Œí¾vr÷µåÝ×¦ö¿iþÇ eÙŽV‹Îd—jÝI«c2X83‡ àúˆ×`2Ož2DÖ5JtŒ#‹¯ÇòÌ1]žÙEYP @ÜÌ÷þBÌ¾TD†é·ˆÉ„%°Ÿv~W€EYKd0ŒâþBPÂ9JŽÑÁÃPšã°$4!a‰ñ@€ŸûÊ)Ñz=ª6½EÓ«^F5€7¢Êë$ªèá‚œ†¼ù(ˆyýèÅnÔ`Âž™ ë£ÖŠÉÒos¸ºgåm¯v°ŒÛ-ŠÞ+¹P&pÄ]OûG}ásõæÏx`PÝÝ«G€»³wðå , ¥rp®´¦AŽ@nÂk à©âŠ{›¼<‘%aqÌÔm8u!NãŽà~}¨6H¯bàÔ]\¦xy,Ë¥r’­Œãá{ð|'Má¢¥‹˜wIò/d2±K–zéØ”à8ã ÏpÎvûlQ·¯Ê(q¡)ÿ–$µ>Ê	{˜,ÚR¿ó+—®¸~pk bá,9€ç¨äs8åbý+*ßÂ%ž
Þf«F»Ùò-Ø'âÉ*ï–ß«8çòKÐz0C¡SÛ´%‚ož£}X›$O9òMµÔY[&rìK5kîÐV[v×K0! ¡@S8aþ••ØÕrbb“vA1{ÝKyßò¿ÌrX#{¾¦6«ÿä‡ûu@¿Ž3Çq¡VQ®.ê]LÔ^FˆÚ,Ý³þføÝw}KugžLÛh¯²‘R%¿G|Ö´³µïžU¾Gš¹\Üª/æ8{#H8˜ØIs˜(]ÆeBU9Lý*p*Pú,ªï	-Ã"ï(V-›}_)´…År©êï@%ïT¬8@ˆ\›‘â†ûBéÁ² ÛÔ™ÎM·J—ßØ4ßØ4ÍË%1ïç¬Þ‹·½Á‰«/˜Ö3•7Ú„þWÏØ˜z|¹ÏÆ%æ‹ŽÅ7Þ»d/we¨å³JxúÊzþ¦Zñ¨T‚Â/ê‰FX
Á#ù°óuôÐV30c–åûBéÖŒÏyRöÝøY¯GaùL¸a>ÅãËý¦Zº‚;ÆY9Q‡m§g1xÂ8ÉÙŠçqbòj°%Ï=Gž¢þó•Rµ˜o7ð&ò¯M`Ë>‚ÒJ þv¤`†´\G(ø¤")‘Õ*­V£â98[œ
À«ï{?,4<†ßgæ <„5Ñ|Ÿš‡úcð"³<d¬…¿¦$yZ+FY2,SŒ>2NËÄÊ€ço[äaµÕr?mŽáÕÇÌ¬ô²š×‘¹bFãbÔKUªö±(q1ê×c€Unó‘ ½¯DFT„=^Ìõøô›º–ª–k­5j¬ )Á/U”Z—ê9€`l£¿„H]´D‘0Ïßuz ´÷ÑB‚Óq±B­P!¯¯‘_ühiÞ¿Ù«"7Í—‰ÒŠÄè
TáºnÁîÚÎˆGñpo&¤.0ïîbj>jDOY‚‘]¶6ê¢T^YlW*¡Åñ¬Üa’qô”É‡Z·ÑçDË¢1ê=Ê ”Õ3LÍ¸DÒÆ˜a[ÑÈ¤;X÷O.6*~h~FÉù¦‘œ*+%Þ¨È'ò\mµéJ˜¾"÷@åkF}TêGþo_¬|èŠ)%zÑp÷ 2¤•JQ„@¬àq}(…þü®!D\EE“í¤==EÕÏóµ¼qŠ¨:ÊdÈLmž¢Ñ±¶mñÙLÓæµHŠ<È9ôæ²Z€Æ’[||ˆ9ÒÉeÓ<ÚŸ5dKÕ•Ú¯hàf³]«G
µJoßñþB?¨5gJ‚î`°	X:6‘›Þ\©´@	5O;÷ÙOpßŽ.Ñ-cVÇÚ¤ÐQoÈV FyËÀñeCušS–š-6ò¬ðF¹ÊŸ{’V¸þ¦§Akó³6©ãºçß2Ïy»U›)G²"Béw1¼mT4Æ†ˆ/Æ
l’Éqp2ìÈ³3‚bØ\ÓÑ}&ŒÈAQ#a«hŒO
UëàO|-(¿C¸þCEáÝò	 ˜Âš´)­K€H?(–_ïÐzfâüºÃßñEðNÀuf²ŒÁ1ñ-Yi,!6JÚl<IBÊ”üÝIPò†¯ÔÂE”ÕG¡\[¥ N&}EÔ"w¡!õÎÉìã&Jêðí*jqÍµ°Hb­XÑ ¬%;JlO Ø\Ãì çMØÇ.ÁÎ¹¿ÿý—ÿØ–è"%ö:ƒ|L*ƒ¢>ÿNüüÏÿñÿþëÇ?)-(,%È¿£¶DÞø÷äû9c1”«fSãYM­	u56@NQ©5[a¥îruÁ¸&aQãôåQ±Ô®°÷‘·5ÃÕh±Z"§OËtä³f3n9ª&:‘^ÇäÖŽ&Œ“;-Dà?·¦(5Å© ¤Ã/¨Pªƒmœa†ÂŸ}åxù"8PKeJ;0ÈY–ÉÊúÈÒS‘f›¤c ÈÀ]·	9ÖÇ“àçÿd™ðq^)Æ¬BÊã·¹îÅr!	3gbÃ[)y‘^2u&ª UdrÂ
×ŠWt4áaÕªÇÑ|¼ÃbŽõU®ˆFŽâ.ŸkªI¹‚?A(,ßP\Öa,rùÅÙBnòþ-˜ºÕo þYåw	 1ÛrX•u¸ v³y7åU‹§‰e¦«â’ÎjS³Œk#éYD…ß©&—)eôÓàŠUË†+2óÃƒ?Œht^÷AÇ±Q¼Žç±Xl‡	æâåèÎ5@Ÿ"ï½¨ùÐ3æ ¯ <ksXÉ˜û	ðß÷¬n…_AÒS q8L®|Äå-0ú
ð)§»Àè,ÀÇìþ‚-rZYÑ"“2•Á_ÀL‹æ}£Ï37&ñp9t€„cÀ(ä§8ŒÓâåA ç>óà˜¤O»ÝÙtt;­Åƒ÷ùSºÊK8§¢å’öÅ,¿(%6 {ž‘ß¶‘|›LÃ?»£k7Y—‰'8·qRY¼F;Õæá½-ò’Ã\Æ¼^Òrx`±—ž²#V±¤í…ÙY®ÙÃi;’Ëeô÷¡[.9ýX-ý}‰¥
›AXÝp­XW,?£ãQ™wÕ™ÝÛˆ‰E›ì¿×‘Cø¨èîÜåØ›ÃÑ¤j-xbXƒf¤B³LF¨‹ßÕT(
îuø¶Î¥>3q— ¬Û¬3Mëæp·:c(’£ý’täGTÞ’Pƒ¥@Ø».}æÕâmdp?qN÷=ãtw‚Å¥ï(Øf«‘–‰%ÞÃ”XŒÎÃ[ä½Ûd×Ý¸®™Î£øú…¨^k8û*édPæf¨sÍŠ¬(¿¬raJÉ„ÿþË¿ÿŸ@6ø3Gë3L´D‰à§ÎCækA,»ç ˜P¢% £þ9§‚¬½ƒëÔDð¹ó×>¡4Ý®„0Â›L=:‚Î^dª4GÖ5WlM;I
ÎRòŸ7©kÊl¾Ü¸`9“Ç°V½g÷|PWW#ó:*wô?×'1XŽjH}ÊŒ^&®!ƒò»&Qˆ~
[Ð „}š¨þìZÏðâ8ÉœCKá¾O8×vœí+Ÿ2È‰þ†XÈ~‚¸`Ø3ªÙnÖK2,ÙÞÚ=®X(žPE¦í.ëöÖÃº=`ÑO÷gm~ä‰Çw8fû62ÐÛR‚%v Dj±Õ çeº}Ÿ—àðlàÖ“j|ÔÇ·ƒ¶äk~p%é.XC5!±ZÇYš½~ó
nº€öî|ùÏ_ü{ð¶Ü(­`z:ß59¦?aN±ÿÛ7àÉå“>µU‹RzJ‘´mf()I¨•}©ÕÆ`¡i)!‘§ º'5£<Ë°³GÚmÃ–°zõÂœ^ˆêo‚Fü‚„r€ÃtÉn“›æ˜‹‘L¯Âm‹¾\OÛLÊhTZ<(M&m@‡n‹SL=êvv˜q\©†y,P;Jf°b”é~
=¢þeFnšÆkìƒá$†(qáXƒo¦^Ï”Ï.¬=¹éŸÿóKŒ‰Ûš<Zt3¡ÚÜ@-éè7¤éÿøÊÚovfðWÉ¾2Àñ™sÏÕ•ùå»ïŒÛ%ùŒ¼­¹}f±‘´IFSn|âX0yüÄ;¦jnd'©fÄ~MúœÍ/ÕÃ¤[¼$é“Nõá_Eëa¥^Ž0ˆ÷e›ð±FläÛºTHˆæ¹ŸÜCæõ0¬F³½ü;²çýŒðîE`MyÍ¾ÇDúÁ¨kÐ)¼¢$$¹³…æ•è"U£NXýÉò,²È·~Ì"k*ã,šÔ"{<¨AZ	…Â`B^¾•ÃõH¯~Îª~*Òöqñs­ÝSöp•¼AßA]ÕùAÙ›Ç‚¬Mk½f,¾i+Kj-JŒ-/ÿh²‘*fQ-\H7¥›: . ÆÑÎW	–a®èh«ÿ)ÆU,õ¦UXÃa•
XÍI8¶bºdäÇy´œªlÇK®‡îªŠ7™!1	ô™IÐ¾hÌq3Á_§Š¬[±j˜¶EEG{;ÇB¡­ûhH¾×yæ5Í‡]1Ì,²ñ,{¨æë¬(ÔÚ•êòZð
´³ÒýzÍH%`,Ã.RP.è€shÅ#é£4‘åGj>b÷ú—ìÉ`àP%yGní+°³ç­:OQjÙ‡©”ðÜ ˜úùÝ93·Xë$zèìÂòpÛ”‚Æ€åá&~J#û*›Þ6,
<”júvÈ¢Oxä-&ñ…@#¹ÁÁ;è”éFSvG&ýK¼­£AN™Ð£4ÉŒÖÀ†ðË>“„ßâ"y§ ²›îs
½Žy¦÷ØÝ0ð:8èO©&²Æid‘pÛ Î¿ä®1<jªžª¦û`®ãÞc›Mez<­‡V%àjN•Pù¦}fßi´Ûrdü.zuï|	ƒaà±RL‹šéŠ‚Ìë÷e“ÿœ2gª=ÿ0àœ[(1¸Ý°><S.4æˆ¾TÛˆü öL6ˆÎpÆ)<O{4àÅùò=E‘ê¾gRÀäkÆû$Ë‡mÇLÉÝn¨ºo°@0À½™¶ÑØäð±c“ïÏ 6†ïŒaÁ¼˜	!¦;BURz‰odÔÑí\QäBc1
½bAáèá÷gšS1œñ±IôÉ(šŸ{˜PZôY
ñz°œÈt«ðçÏ^Ñj©Ùj ºÆŸJÔ(”Âò¯Š…‘ÕÚç#aB—}µyGÖ6Ã_Á¯rêG1øÖD	¤ËP«G0}ÕÕ¥šVi»A}(›ygêØXÐyNäÛ±	øóàÖ¡ózà^'Rl‘#_÷E „¦t;·åUä=g•ßžÅÐX=tçópÍÆ˜œ5n8A;¬Y-1Ièù¯éEÕUˆlˆö¼î‘)	Ànö³¢ºùIuó8h ¢  å(µr™OhŠž²uw z„V„Õ†ÅœèùEø+Y¸?ò@ »¨>2ò`§a1u ™ÖÛ¨gàlVÓÍh'™«bûÝË7Úie$#Œ­÷Š±MälÉ«±!.iv3#5Eð%ËXLí=ŠÿxWŠ5f‡Ø=Ü	ˆå²‡XŠ`"Áí3^f:¡±MÈ^x–AƒFš¹õBTÆŽ_¨GU£Mp|x8°ÞUkÿ {ÆÒÃ»Â4E#ˆ1ª˜†Q³~›Â†g“½Í¯„åfÔ÷è9A}ø˜džH8ø­Ïþ3|µÖÝiþÑ&.€r%¿^Á§‰‘‹’çï¥r´X''A±¹E-nn>™„ž‘R÷sÉ-h²2N–O‡ñÑ@D‡lCL|Ð/aX¤-]æ„0²^n®ç )aß˜‘Ÿ $U„KÉóG8Î1à8ãb©ÑÇ¤L+ù»ZæV.“ªš¸ñLúlSlÃ­@¤ß|#ú¼]=Gdq³Åâ™LÛ$= “/)ž§¤ì'±9ão¥|6‘J÷±“M Ç$©%åD^ûÌÍÔiÀâÐ®Þò››1\°ÂÅ÷¤G&?ujßš¶³|Tqü˜6“>¶Í+V÷RÂ±Dg²@ô€Zc¸^+áÍ-€s/¡ìû¶´9(µŽÇ[ îªZDü9NPñQN&=T1ôx3PNb5¥•€Í¿uÅmåWÞ‹¥šI„‚*Î¿´`læ[kQá³¨x:}:Ìˆ3’K:yˆÄ-åy+F%Bq!†XZ	šËð€_
Ž¹a‰HÓÌê*4Ì’ãdg“È2‰¥–ÇÜb…e±l‚—H¶ÕN·Jž~3Ð,ËÉù;£X>=’,oÆ›fa6» Xž@»{¢DËP<°(áB‹û“äƒZ^VÚ5e*XNAÜ wc¹3–WÓN@ÇY¦¦a†8êtü06ã¼÷JÏ5> V- +âIŽw:¦¬“jDhŠ¡¥pÕZ£–sÓÓyƒ(Ñ7 Dì[Zˆ¬ðsøK*eõ7¶1[D!`ŽÅž´Þg¹n‚ü'–§¨ƒÚoÚ²P@ºw&€t^ò	Â(U«QÃ4é-¬ú˜Œ/¢,¨´ºÖrˆðü¨bÔx‚;„
Ÿm­Z}XÅ²GÚÐêZóìŠœ7±û¿85ÚZËöHzXA7mÊNîîžW]®;4Ç²Ë¦T"°,òÓ—]6Æ=WcW¸-ºœ(—‹!k“§	Yú˜ñ°ó•½rÅHdð¡xó^X®7äw“\*Ž°?âÁt…ÛT% ¾z4(×¸Ih˜ ¹QQq5Ó×ñ±„þaiÚ,&§ÖˆMˆ–(xuðË`œè¯-ãŒ¥µj0yA«düq<N;FhVž­Í à§@jùÔ´ë,(Å	Á‡=éb`ôq\D7S¯Ã¡Ñ65~×kªSŠ	tOþÐ·£wz‹}‰]±ÿüÏöË[ dþüÅ¿ƒ¨}%ÿ¶öÀÖÐ§­ÝLºyX'8±PJˆ×Bá»]ÎÀ\äk‰•?Iû¬‘Ý¨+¥2yy>™ð|®„“|È"…ó	Úú¸°^Ëh×Dí6(5“ó¸Qt?®Jl2HÁsQŒ…TéjÐ5Åd’—asmBÉt­‰Å] ßa'ÛIdêÂûá2©(ìu©ZdÇr5mOPÀV«ûÇä~3Q«Ùîpl½Ev„P§¯H{Ëu$2Â;{Ù¼Hö‰(Ôª+¥FE×Œ“ƒ/–š°â\!·™^)*yWÁãª‹Û”OÐ£ñD6V1—©-•¢laáÃ™ªEµÔÚ00ÕÏ‚Qb¶Ô(”#±cO°ü]ÔFµçS¬ÕC<ZÊòåšþËq§¡à}­ó­¿ÈÅ|ªcø7:´JþÃ…!ïèóˆó¹"ÏÑŽ0Iöhs©Szt¹¤“ÐÄ`mëXÞ{Õd°“¤
2%¦I‰) 5Z
WÃøEG9\ÀÐÇ´O…x“‚›Üx=‹¿R`]Brœ|½ø,¨Nj1©~E„W[0—‰¹ãs§ÐŽ\}/`Á.£<Üžåìïb¾ãÀ`[¹û¶¶…çÏÌ.ýxŽ(ÁÌH%E¬ÓÐ±üL¡Uú<Ê’¯|áüåss3Ð*&x€äßáëB58…Ùš[š[øèìù™¥¹3¤A"¹ÜáÉOÑ…@š]Š•R•ÇÅ~U?<èŸðIžÈ˜†`DÃÍ!‘A1Z	ÛåÖÇ–ÀJuópî%n ²¯{!áìÇä fs¸²¾t|løúéG½õˆáXöÐoZ•†ÓµRüGm[C>LÓ‚?_NÌÛ;''qÞøä÷6}¶a>F1ë;fÎ'¾=²]%ÒÃ(´·™”[œŸ8)ö'X\þ6¢¿s‘Ÿ¯ç([ÏëÔ½Jq©8·^/56¬uŠåøÁðÿ  ÿÿì}ër[×•æÿ~Šc8•ºÌ;%KŒ.ÅHTZcGR‹R÷d<.ù8$Ñ4 ŠRVE².ŒÒ]=éôÌT¥ºËm+2iZ2Mëfº¦æÇ<ø×/Ðy„Ùkíûõœ€­+±Hàœ}]{íuýÖk£û\)JŽrÉj¡¤Jd¾ „›7[%ZI;	Ð‡öD@r˜>û7CW§g†Ž?6¾´¢ÄÇK·-GéÇÂñ’Éß5ªu/‰ð/€< Ó\5.gHTøõü¶a¸Y0¤”š#‹¥US¶™3‘aN¹°™Âò µ ÖÉ3çu¥CÎÅíjy6®ùŠh*ßg' /Y[ÓÁ¥ä<ýcgbA†I,6–ÛÕúÂt­ÖX‰ëe7›íïtX„öJ(½MÍp1…'f?6€©eµì¹¢–…?à†!D@Úuìš;ž€e®E3ê°O±nÔ@Kj%¿œ´ƒÉõÌªÙ¦±úˆU«*<Ü´²¯È¿NàZ4›`…Û§œ¯àè2×réß+:ò¯	^#€×ò~Ûi©Ñzb´
i›PHÛDØc ’F",ký±ÏâbâžRaSK¦­AÂ¼5ëœrÿ¶ç™¾páêôûÌ+N‰à½…6‚161Ææ!8ó3‚ÉÏž?óžÖ(Í¼ÌÕÆÌÏg.ÿlæÂ™_è£{…ªÑç9ºzáÒôù³z+ç”Ü¾Oº;Á²ßIYY(ZP%ôIˆíNÜêxEDñmŸ2bšÜ{t¤Þ&Ô+Þá³ïöCÀµ…7ÀÞ©]7ÓŽ¶»ºð·•‚ó+sÌèpø]¤„`ræíM—Ð¬w™Þ—éR‚’Þä˜qÄ•Ñ”6$Jkúû")ðKi(¹Ù2«°@à+v†‘¾@‹ßmžß¥ý€ç¾|]¢ÕJéxïñˆFeÌ$^“ ±/U¶0sd$RäI’Ýerh¥“Ù‡«âÌÅ«—¯\;733Köâëô)™tÔ!Àb‚ÀS_Ãåé³—.^¾‚Æƒû{wxˆñº®ýõÚþìÕK—Þ?3à@ÇÝoøˆ×‰è±MÁN#–*µ™³ù‹Wþjæ2¶­rÒîWäÏßôáÉâßÓê/¼B/ßfÿ¥5_l!Û…/ªsv9Šä¼GTW©
º÷Ðž¶ûÜ´}ü‘~Õo”” â À¥´K“RïŠœ¼ÍPÉ2­`H*£tkö6”ÁÝ^ƒ2…eI@«¤ÚEÊøù£½u+ñ·60zGšê‚ÍÉßJÊIµÙ¹Úªyd8þµEºrd“ù` *nÏ~qÜÌ3CE™×bíñHHú•»4 in5^h±hr!~d*àd‘1Z¶G'£Æü|µœL/´’d	Ëè`ØbŒÏÆ¼X˜Ú(Vô‚Âdo5ÈS­¤³Üªc'ð9û“ž'+¢®
¬U²¡Ñè—`<÷Ù±?Õyâ''Í4±àî¼’ŽßXü0b›Ÿ­M’½&›ðt4¦Ÿ5[UH$Z‹²Ã˜ôÕ¿WÜÔÍo<@7‚ã‘/¿%JáŽ–Îú
Ý#»FÖ’9…zcûMO8ò'™ˆHµI=?ELò—CczˆrÆ<u[ô®%ŒH=—©•Ö¡^œp×¬0£÷íÄ©ª§¢·í‹hµÇœ /0Æ›_PtlèbºEXôâDàxõ¼yKþáiÂÜÂKIk	`ÿjIG9”ˆ¥ÈRµô¹2’ÛBèØÍB‰HZuë²¦ÎÐ˜Ê"9´ðe¨èž·Hˆ£VÏ®`é‡¾Òl71ßÜƒù¡ÅAéÌÔ¥-+*ë®õgD73<^¾¾f[©L9uÃéV“K³RKÎ6VêµF\¹tö\±€G">‡½’­þHïÿšÜßk?rÑöp³2ÿ‘%Rô°ŸÊÕÜ/å OÚáÃÇ2mà¹÷¶i®á:ÂÝ“6&Ä5G2¨Eˆ$BÖ/e“ùJÛ,û"Mdß[s7WÈ5ÙXÆ,ê =Y—[ÄqaûôˆsâR‹ænë—N(õ>yÂW¦‰  \„w.ä<è©SŽs5YB&ÎDq«qY÷q÷;Œ"¸cÏù¿²ÙŽ:¤Å‚”®%Áµþýÿüô‘ã·™¯ÈˆÆÛþžÀCMä>ªØ_wŸÈÔLTÚ¶.ÿjå¤“/è!ÇDLÁ“BLÌ{g&Ê-4ÁrrÏ”"”tV>õ*¹IYAvà0ü'i_ZˆNÊ“ye*y=QsÎQ%­´[å“Îö×¢¸ÖA~aŽ“jy‡@Oå¾ÉÑ¨e†Ê€MU­GK7©¼èPÉm`ŽyŽ(‰Ê9\ê3
DÝ‚ª ò·!"Aƒ@;iÇjì‚ÜoÝØ‚›‹Ý.”<úy?YˆkÑ¹$iGâò'2Ê¸S¥—”¢©›ÀåDYu@áûsC“ŽÜø1«­Ú‚ŠEDveð `r,v›º=eeSµ™Šš}"‚Y*«J$3˜‰Ç²Ì}Q¥JÐZ§U85»ÜhT¢éÅ%r¦kÑìb²¸X¦+7 Y¬óÙ¢ñ¨½\ëÄDÚrÅÉd¢‰ }$A¬ý…ë¬Ã}wÀëh§X`©ÉuRÜN®8§‰Q
E¨£i’¾sœKÕ¶$Ü}´÷OC|OËt£ë‡!Ø'æN­Î/¡?¯b=Ù‡V\Æ¿K'%S¾>SíÜ¢ßbý™ûSÑÞ§CœïmB|Bë.‹°Œ½`¥ ÐÜDEdB,eã1fÃÀ˜|r†¹	)!ÐÄ¯µ‚»…R÷¢½Ï†¢}:* š¸	mt¿Œ°nÄ:õplu¿ÁóD^þwS‰6w·ÈÓ Ïmº*ÖN ‘}£ûéÞo$:©èš¬ÓšÇ]¬çw×@vb3c˜VgbÅÍ"Çf=¿ Q)\À ¯+‹ÕvÄi"Z‰ñrm’2‰´cÍYšËLˆ¦j}'	Š©áSÑX)ê,&$(ßŠVÉH¢JBîŸZ›3IT«¶;û™´äïà¯ñ<°æV2Ÿ´ZbÝ€rhç*¬D- êC4^Šz`hïa@mh`× Á¬Õ¸Ø¢"×vñï¶ÒNZ7ªå¤Ø.EÀ{ˆ@ÏÆN–".—	 ëÃÅ–Ûˆ	“1“¥ª *Ðî¥m¨F¾å
‘B3°JØ«•JR÷ €xAÔ,Ÿ“K
ô>¨†!ÃøæêAVÁ<~IãgÙš7æ•ý Ë…féÆup–d¼9<a£ÍSœ¿íÝ›gK7ÑÐ[I³•´Éç1äîL·ˆÜyâº×‘÷~IS/D+æcð‘•@]YsÜòÈNä‚ÂƒšÁh†lã$ÏÂ8¡¬ûò[žAÎÔ3ÒˆØç.pj—G G¹0R™¨Ølœi+ˆ…#êsÎÖÒ¾LÓ
gá>¹ÍD¨cILÚ,Ï€ È^r5$	&Kã}N\5,Œu!OxJ³mŽoŸ‡ì3:Æ”Égl
);ËT}IÃæµ B€‘_o£ ½e*¬dÕz»C®:êÛ`Ùà§¢1=¢;
E1¸vŸE¯ÅÍvâ„C`'<ø:€gãCe	á¾F& oP¬Î³²d˜q^.,(ûÂw>MSŸwqzæli@ƒT:~Š’æÒãÙerÉ;îÞ\hÌ£œ	‹®(jQ²Hƒ+r-Bdâ¢—A%‰0Dù›¼hš-wï	³µì‰„ñˆCWg¥õYÚ\u¸²œP=ŽôÞŒ«•‹õÙêBäÊÓQ!*ª^´-(S@Ha·T ¸7¾á¸AF\žxÇ¦;€E<*ö&†±Á}Ù¥µÍ¾ˆÆ†Ží“ÀÊÑw²	­c)Õ¼O|ªª²ñ<#:ãl2*^DE9#t‚ŒêêÅsçÎŸ™¹6ý³Ë33?Ÿ¹påÚ™÷§¯ÎÎÌ²(Žšÿðáb8ÂB·¨Ú%õB5Ì¯…SD (ŠZB]qµ\Žý·k 5e-AÐàÍ‰f“¬7­Núžk–Æš>Gñp["ß±3ç¸rÆtJ
­Üøð5Øã#4:ÀhÉ(ÇS qln÷ùÃ»Þ^i ›®™ÖhZ •gÔì£v)ä¶¯ƒŽ]OÚmÔ£óïsA•¨ï‹ñ$jvV ÍLÑ¨ãƒ5:|»chäQ<G8„Ù»½±™¶è˜Ø¢fgèh
{	J;>isßlÆ6ñkCXê.è9ß“ºi<Ç˜¤$¨¢áîÙ{œ®T÷¶LªÍÔ]ª×O¹‚8s9km #ÜLrÜYn%é‘NªwÂTT;NŸ…µÅì
ˆPÅb$v	ÅlR2ÛP¾Ö¼^È,ö>ÕÓ­x®ZŽªÔÄ7Á²–@^}a9^HÀr¨ælÆ¯-ÂÑJeuVåÔð3‚^ºùF£C½t¶ºcf5w²ºæD£Ò5§2Õ17>™Õ1çrl8¿Sþ¿–~òk¥bž’Æô¸ßAn¿#x"1#µHzQª•@ž«rGhà]µ}™(—éc'1^¸1±×0ƒ®æ]Ð‡á!0NÞ-üÄjò½[åY")6c‹×o•ÏWÌvÈ‡—“2iBmð4|Ì¯ãŒ®óÀ@µ­³Z™mR.uqîïH³¬ýÓìCnH£pË¼UúcojÃFË°˜0uR_ÓÓ|\xY‚^`Ž	ÞDx9ï«ˆŽ†à]èåß»ëlc†UèµZ)²ÅÁ~«$Jùê:Z6Ò9j gµ*å¢AJü%¨‘Îá-± ¿úU´Hg»Ä>þ‰õv¹M^£áÐÎXd±Ü%ûUì˜¯¡²ž@mbŠ0"é„]¹ÍÖ”Ÿ÷5,ö-uIsÚ²û:ƒÌ¥çý²—µžYÜª\LÒ†2Aþ{U¾¹Vn“m.ãw¢93ËŽ…îjÉ™Æì’â~X*Y;^^nµÀHÏÑóqaúoØFÔ±µ:ß¢€ªokq¶ŒîS´­Aõ…Ýº»çÁ·£û|Kì\~-dD”ù×™`©ðøb†øÜ’UVà°„ézö=SŒ*{×Ë°ËšÈ¶ë´­ªlÓùD8Çüs—cÓßEuKHÿ"k	åã­
&x:â6%þQ	ùïœvæ
ky0¥Þ†þAá^Ô&	¡`ëŒAÔÐ<ëO0 øÞ/Î”ØØÅ]yz¸.¡ýûH!fŠœ?­¨\åô0-
Ãšr#êêqÐüS‡'¢OzûÁS²q§…Tâ¶w?*^:{®ä\b?D²?Ê’ž‹C_Éˆ²L›¦Û¯åÈNc¥Î@ûßÂ‚õ¹4 qxˆ¥¤Å>lA08WŒÀ0”Î¹ÕPÊ£i¡”í>®»J…0…Í¥hªl²BÔs4£íð@þXlÇv–cç»i¤ÒüÁÛ£åÉxòÝÝ~ØÍû…FtÈ¢ÞZ
­ê/AK«¢¥F,’P2¥@é P[ðÝ
.¿–Ì‹b+&5ßƒQoõ‰„YøÌl÷ œ©Hø:J|ëüìÅb©ä¶ÂÚª†	³€@Wd¸ÑªHû`§ûjRž|µ´µ÷ÜïoÏ;>w4þPs©Í“Û.¹Âróô1jÌm’ÏMEk4Í)lªä²CãÉ÷¿þ,º:=ãéØw¥8Ù€Í&œ*»ëL­šJ[JÌÂG¦©CTšÑZ¹Âz)(%;ô}çŽ\Uƒw¦Â)Â°žÓ*7Ùd.i0‡ª5fhª6”´Ð]°ü/u(þ§Ý—0D‘(nažò./ì­åµ+%ãÅð½çÁKšîMµÙ™â3,À)Ý£@£EòÉ«´¦1¾Ã1º”žd—¨ÙfkA«~Ê–R6¤¢Æ§4XdÀï2ñÊšá)öEûò•?âßûÃ4ñÁ­êM¤Æs(C±ë¤d
9…¿€TÞ¶œBÂøò´w¦Ö@þçiå¾zèQ+>ÌÂ Û£ðã#‹QšKw)²rë¤ã­ÁÎOÅc£‡–o™Ä²Øçi2€øp/þê/Þ¸9<w|ÿ1¹-â¹çe£Þáð ¦¹6ÛŒë'Wß]Óèhd9³DÆàY‡4F!ƒìV^ºPU–^‡°‰wUß”"ì"®‚NÕÒ¥} !öî‡§,ÛÞ+W’þ#vC6eÄÆjpP}ªc°í¦Î‰ò`­EÄý°ât\æ;«ì\ê~[!R™˜"¿iÁZ™ÊÑõÒy†¹¤hhj;²™§Á@#ƒAÆa¡À9Ä×G/;¢uÔ^F÷ËÐÍà—íTR©.› eî6záã/‚Eq‰ÑE{3é•”:|c„—mŸ`‘(Ã¥×¶åÖ‘MÑ‚ËÇ–ŽëÔ¿°_¤.š¾PjÈ(±¿5Xö²ˆÞò¬C¯70sêÇ™M>LMEY§QGxµ²Ÿ1M|d\‘:™ü5%:ÇÁ¾Ž³œ¹î¢²\Hà8m5¶D)wFËÜ`:%ÆhaÌ'9öiMP»màšî‰×³Za‘~‚ÅšËÖÏÞóÐ[¿}IC3—š¡cžˆ.Ø[+´O3º¤lzŠ]É°f†Ž‰²\'è¾ìî(%™»ÁÖUÀ×9|Ç
§†sÿôcýée%”êí3«6”Ü“–…<á“}Yd2QÒ¥ÀOY¸Dˆ  }3³r ÁêèÇã£Z¥„œvr˜Os»ÛôŽ.¾¿KQg >ÐÞžv_PHÌüƒ<ù]÷7·>¢&L¨UöÞ/Î@ÍÏß/…Œ«Ó*ÎÂ|ì½ßBÈÃ]¤/1¢hÒ	žÕm8¸ÔúS-EX€·ÆGÇŽAùs2Úû³¹²Š‘4üâshÚ5+¿W"dÌYäjiyŒ14¡Ò'Ç± y7$a9Z¼,¯|Üý"70¥Ÿ%‡’ÅO\Š»)8ô£¦)éy÷+ÈŸC²ÒÊ[Ñ¯8ž#£~íY¼çq8ª¬i]°Ú¿â@òX‚Î­N=/ÀÒÞ÷Ñã-ª)1ƒÐ€É†Å^ÖcH-ˆkß`¤C~ù ).X/ÕÊ•TI=…&BÊÔ¹Ú$z¦5Å‚úS¯îŠÌt2é¢“ñt&–!æJs@4ç€ú`yÐZÿ„Åy"’Dæ`RŠ‹EzÕ$\Cîéœz"Äw’›¤¬˜\À¾ÉÃ¨xõ§¡¨$>±M]žk¤Ñ´Œ «Û"è‚_Kz[íÆr«œ\œ?Gö§±U¸ê×}I#S°Þ^¶ÅK3—Œ‘6“&$3’Ø…›$€ÍŽ”=ÁL£mpªÓÜF¸”SL$l Lº¸ƒ;ú9‡ÙÝÅ6™ÜIÆâW¾$hÇõ2æé­1­+Cÿ€íÉ8rŸMön[Õöõ<=¥hï’‹!û±àl†ÞÂwCÓÐËÆl-Œì±<e"fìQ÷+h@6ôa°)Òdç2Âì•àb“ÇBo•c¬k4S'¾ïnõHYñP0L$H×c,ÑM!ã¦)D;û	] 7b5¡_ý¼¤Iò°ã€Ò<þú•f©3Aƒk°x£Tš™Jý&*Í_¡`'eÔvSæiFžK)ŠV ÝsŽØF‹`¸JÜ^ôéÈ=Å ƒÔˆùPè”ý§ëã¡…¬FîR¶ýaU”—<wê‡9’CaOSÁzˆcäœeÌ’­³êíér¯¹÷hàžŒxèŽ‘æÎ0ëµ šn^G– ÿ‚}hHíöZ‹0ÞÆï&íÄs4¤p­ §”¹½§2¼HÓ±
JfVö—y®¼-ò–²¿Þ‰Û×ñ]ü%Ç‹ÕúFµL'ÌÏñ:¹Z
,·-ûKÍF/‘dWÑ¨ç½57*ý	]Y«æŽZù›J;
ŽrƒÈ^ÂaQáÀ(®ˆ¤xìxö¦3)-z%Ü^ŽÀ¢ñˆ‹¾›Ê4?«å¸þ7D„;W­!½×¨P–Ò¼ ÅB>”°g$%4'=8'kµÅ–ZŒÅ”‘êÀ²=cü(h±Ô¼œK&’¯Ia‚£¾{éºï¿Yê6@;B÷IoÈGnþæ‰2=s–Ì|>IØ¤Ã>»4_œÖ£½¢7‚ÒîZÆ«âÏ<x<SÚ3Á~¥•èêO/¢AaçêwšŠÙeãòéý©¡œûÎÍAŽB^~=/¿¾ß¼\²àëdÁ×y¿­QËe¿­0³Y¿Í¨F¿þÚò™¡t”4>¥õvènˆ¢ÔáJn_«T[I¹e! ÇiÜ[’”J¾vœ‘úÔÕÜ?{ÎÊþ™3µ›pç\Ö´ˆl·5²¶_ìÝD»ó—vÂŠìô¿¤Ü‚7Â'÷°òÀö ¶‹9u¹£ù.Øv(ø×ë¿ñôžtÙrçÐ)6ŽªG\ á}pzw<Ì1Ö‰ôü÷«®T€ÉØ»4†•¨.¶xÈA¬ F÷ªÀÙe“°«Ë·|r±5›ÄµAM@Øoõ‰ðÐ‰Ü7ô[º)M|Äõ:ùŒu‹Ãõ«ßâo©·8 ©·ø[Î[<x‰B?´ ò&FÃ‰ÄXôœ}Å+Siµž_t¿1S uF.fîØçéA^G‹oyÎµ£ˆŸLá¨DÔñr7æyôDõÑ€ù›ýS†>g>w² ëø&1æÓËY}«Ð½/dôÁ:FD_oC]vòÍÿƒ`¸ñ£ƒñØØxÄ™1ÒE<`Yƒ¿cÿX•ÍúÝV÷‘°d …(‡ˆñ4»å.%ù=¸²Ñ‚ÖŠ[ÎJg«´¾%Ö®í0´-y<Ò€¬>xwôÃ<PVG”Õ\\¾^i5šCsµåxnS\¯.ÁÃÕz4WðßÊrU<K:6Ç§[-UÜXV¨àYéR8/“iøÐ”»Z'€L<ZaÎÔÂÆ¨y)Nh'u­Û‹d¯9Ñ©¦kI«sàD &˜ÁÇL:Ë—{
8uúÑ,ÔPƒ—.7›I.(OY¾À.+UÜ…Z£|ÝÉ„,Jn'¨;ðY<®#VK ®‘qø@gÚõåç 'õ>
õ„:†glùyKÜšXTItÔ ˜<±n"Òïâº—‚«59{›h	vk¾Öåf¿ÉK9oì,Õç"<ðt¾ÍV2„åà,TðLÄÆÆâ"6k&ÆÍ‘e#µñÃ‡ÈQ×wä8ž~iËÉ·Lœ$Ä«/ÕóåX§ïÿðïÿñí?aW@XU$Ø‘<ÊÎDdð÷-nKÅ ;³Ò˜sSÒÃ|¬6’PU¨Ì?ÕFŒ~¹$E÷[«wÐnúö6”Ñ‹÷qŠøç…¿é~‘:›,âgüI½BÃ8¡J°ËlÄS¹.g±äAk‰Æ‹_šUƒ­bÊ¢²µ<-%ÍzÓqÇAG‰>Æ‰;êFS“ŽÃ³Ýh5gÝAyšG)Ãvw¬írã¨õ¹xvéqc­0×ž<Þ¨ÏG'#‹!Ñoª­%WNœwO\CÉsÚZ‰õWt<gU)ï¹N¹¶œ×"8’B)îúØwgÙqå]·z&ªHÓ´?u<ìTMÀW=$×Ëbóì2à6DæÂCcb-/Æí‹Å¤uq~¾Z†ÈËþ;­‹Ún7–’b1f0¼¤PÆ­.ÈçdX±è
ïd8%_ŸçÖá|b÷6O»›÷÷§¾uûžÏÖ9Ô“¨´;Žz‘åýó,$
À©ytm…ü‰í3µt©C+ôD[hâûÍô·Wªµå
¬r >«ðVÑÞT€­ÖW~B—‚þ.¦Eÿ„±õ‰ŒüÁÑ|
å(TV+”)[ÿ*£-Y§(RýŠ#ÎHÓÇ=XŽÙuB¯$¨U±êt.–Q)òi(†”.ãï= )îäáDÖMF¹Áh†Û!2Á&ÝÇLæó²^
çÎm@®?!H¥½Iä¶&Bnú€¤wÐâíÃ¢4ý,E³ú…èVÖÓòýUï„çn€÷¦EoÝO2HíijÏQÎÂJ¤dæòÙúÏXHÿq€ÍSB‰!¤ …¨L)h¶Þ—Mk*sëm÷!žç˜pCÔ ®+(¯Š fýç6ô®ZÜÚc·vœáóQÑ˜ÕL8Ÿ¾Ìl(Mã±ÿé“ßý‘ÐM§Õ¨/¨Ù"éÂ>UÖîùå%®Ž”²G[&Rb1…¾JšI™®7ÄÃoÓÂPO˜Ã´Í• .Š‘	Ÿ€­ù+rfaø V¾bõ´åñÀ<8—sŸ²X‰=üÞRà"gå¿¦áWÅäRúT±ýWÆlÝÇiA´á¸o¼ Öé²×+µdæfR^î$bQ(—LY¼ºLfÕÅRz\ºL¶eKQ`6¼œ+ó*ÌÛa(7àÁØÆ*©±I]hëèX‚|ö.çó	\g„¥Ñ'ˆˆZ¼DŽÔ¥œÆ‚Oq-:Wk¬”ÜÊ-
EžŒfÃã³2G4_ž\ýH©Š&"£éÀ ô_kŸæük`ÿ@¥v¢ÛiõóÌ†<ü~;ÂÓiRÄ]£.q*@ˆ»‹ãGFó›‰$ø
ü£‘¾€OhLJT¼üþ,Û¾¤RJµù5H÷ÕÎ-"¢è)SÆþ2w9Ã"PÐ
ô§xt@ÛÜ¹jRƒŠbªŸ ¡ÉßðìíoA¦Àm5™Ð«£¾W½¹l—Ý „¼œ€±ê^`â.³áx@R‰ )ý¥b2Ü‰[IguÜ	ÍÙÐE²QIëdê¸c*v¤à1B§e1˜ˆ<·0?‹¬¿Í¾ä–­âÏØVt«Ö.púªß¡ûÎªg4Ñ›úÚ5öá(¢J®„r†õ~/¹•wµÉ+ÆZóúG!šwq×_£‰V/:ØB\YªÖ!ÅÏÑŽEÈíûGV›‡¨5EØBà¬–œ<Ú~jÇµxå…8= ä·J"JAÈ¨¨b(·	LUÀ	 -dï»”[	Yã[Ø½HÓ}FÄ·‘éð	[4¸}ï€
GNÑÉA…»${Ïq¹U˜c°,Ð™“îyb)Ë2eçþ%ŽË`ˆp,³.ÅoÇD¦FÍt6<·‚¯zî˜»X£Ï«æ¯$Äó1±ÔÆK©ÝÐ@‘/1
F‚ÓS]”PŸ–:-BAJ4¹Ø­™“* V`]ú¤QuÅ±ÝnNÌûåÅ¤|}®qÓftä4ÃwI…ó3qý
ÈuóD%wËª.¢¼(9	k<£,ïA%¤Èª”—ÛS *öØsr˜>ði¤0T‡ïp!Nœ',Bõú>èd·Ñß‡UŒ)à¡‹úqÛß,j&ëÜô _ýaPã¯ð¿»¢,´© 
 ‘ÿ;e›	û”—þg ‹¿]Œ;m"Žæ¦
þâ…&¸šDãÔðB¤õºõëSŽüÏ@4•3ÉÏø‹?
@õèU¤ï*r*Ûr
·`‰O¬Z‚"CùˆBÿÐ¡»9MGÂlT¦V3¦…‚bh.£í:Ò­Bj-C …MA
2¯×d®­áŸV,d…>ŽÐ&»Ã]×ôxÙŒ¢GÓåNõÀUke›,ç5ÚFRÝ×Š…ç1
ü·)„Ö&ùôQ$+IÍßi¤i/6V¦+•K­¤œTÈñÅÎ]Æf¢)dì­à0¿Ìºú*ÎÇµ6Ñ“#MÔÖe¾ÑZ"­Ì.Ï-U;ÜÖ(^¦¯¹äq³Ð›+¦Òæc¶Æ""Ëa—û’ÂJ0Já«¡YÙF¾ãy¹åq0 ›´’¿_®¶’JVûXá]é¾Ààdåc‘!ÜG$&*¶Kuæšã"»?@ß\§6O­„ìWÝWl€6xÏ7Óý›|Ï‘]vG/ºyò%õÅâj4<<¬µõ%Ô©È0¬…#¥\Æb(LÐ´	Œ[3ìü¼±Ü`È¡z£ž˜+á®üÔ7 ®±h©2eÂ:”M·?¹Oú×SÙŸ2è§r¿AÈC˜Vr-»oìtêmf"‘ƒ%‘Ñ?¡ÛL›ÒU`ùG»i¹áÜÄÀó~Ó5µÑ-ô"<ì~â º)5çø¾í­PŒ…ò&Á|kuãø¾ÿÙì€-”ñ=`uÝ/¼S³ÍÙ=yõcËdhY÷UûÏç4”6LX	3=0Æ9­bn.µ_†¢n³,¤ezíjè0™°Ê@¡n\
ƒ÷J¢¥jýäêØñwÇ\b)¾	‚'F]_:[k™ù…k·’8³Í*³)NEÍ¸ÕNÎ×;¦?‚ÈêÉJ„°¥aòÅ9ÂÒ~AÞ!bÚ!`€2­4]ûé1#|Nô5*yƒ»7I/–Ã§Òó­ÉZ|óîLéS;%ÏÇžÑ?Ç\C÷s½‚µè]üž¯¦Îcì÷<<é~C•Ì´e¿çi Kií‰•OÚr}œ§ÙÇˆ(AWFü~¸o,Yð@¢aaP8ß[n5Ð¯ïÙÃô­–ÆDš%[–™¹T[ååêÀÅr¥ÕCÈd²ßFBi’hÜD— , ·ÿfà4Œ|äGÇ56>ªVPŸŒBAŠ‹›Í$®]c…#9­ÙCHsû%ØF¶ö…n3­^âO¤0„Aq+‰m{Wc¥}ruÒÞ”l†0Ð‰hÐ€5\st,žUE›0æBtjêPlfTIÑÙ=!ºŒ°öòÒRÜºuæ?(C˜Úæ~ÚÃ&z m3wà€¬c‹ÌË‘É=rÌY2`®ž##£´jÉÒM\³"JxBÄ¬‚Q‡–ãŠhµˆèÒÙs6øs¯×Æ<‹›ÇårÒìœ,7+ó®ïƒd}©2³”
,ôÒ>=üÁè‡¨Äfˆ¸VÁáô´u¤JÒÞÔRkˆÿV#D‚¿51‘ý~œKð›Õ3:ao‹=†?t'}Z$XÈÇy€2uS©AäP8Ûòu
 ùIu–p¦¸Ò^L’ÅÎ¾ Ù¿%‡+ò;ü÷fé )zÅNsÓ1ûÍ"dÜ'’ñ›”ñã~hÙñQðÀÌ|wÚÇ¾¥å½š¡+6ËÝÚGžÈ+€ ”™o­/éømôÉÚ‹V©¶Ç¬¢=ï7ðþÏ¼@J°Y•£ùRADY]1”)Ø~Dƒ6`¹"í¥ôµ³æõ­¸nÃEB ¸H·ÁÇzwï×Ñìr3ž‹Û	ˆ‡PéJAÂðx’­²ç™3ãÁ‹ÞWtÁ.‘s_F4¢Œ	º¼ÝQh›Iä!	FdìÊb`vÄ²<ìè_5—,ÐSðŸ¡•VÜ×q¡qP¢&<ç²3›£Õ:JÍþ|)äìÀêÕÄCû\¨ù(:¬¢/=ÅŽõ~\¯¥âºr“ËÚÞà€ïÖ•-YÛ™¸÷Ó¸² ë¹rZ0µš1í¸s]ñÓOŒ`ÏGD—UŒH®¾Tó©{ÔvâXÐ‰ä[Ö{5SàŒ^Ž¡;â=h¡¾5¼qò%¾§¼'õÂmlg?V4
Õ,G×f)h­M.‡ÉnÄ0ØñÔ^Çjéö/gê«‹n‹ªÜ+ÿ,4£rxÔšØ9è¼&6rDÏŸCx
7#ô
†Á1G&»2YsÏ'‰üò8i<‡†tb¶Lˆ±£ÈNµKêCÖ4Ã(eªEähM†SP7¸Ú
§{ªY©zGØÊqN`Í Ð¶2CBÕãÕ…¸ÓhA~|s®·*Ã+-2P°·?ú‘—ý÷ºP9ªÁ{‘¼`r÷;:ý }¸ßÐ6ê#' U˜$ÅEi»ß}&+væ »Mò&ˆ¼Oß*ìš•&øSu(·ØïÏüvœÈ3æ-]¾q®Ï]SÃcíS"ê¹Ä>0ÉÇ±ñÍÊü5P¿¯-·j^0Ûº?‹­dþdJ“n(kj×8Y¸6W‹ë×]0Ó×NêÒGÒj¹ão²P‡`"epÓ[À?à6¾ê«KgÏ¹–}$Î€láÜÕÂõ½­Z›‡m_¹)0÷Æ
KTÏ;ë¶Uê6½žw¸Ì‡Ôö-”cy°”Mí¢€ðãf4Uè)&z@
ÙC
w­áª«éBÅŸÆåëËÍèÇÑå„ÈÏ­$ú/³/x° ­€>ŸžP0ø‘âÀ|Ê°ü¹ëÀQƒ	ÃòC—,¿)sõ)‰{‚OK.”»;_J•Û”0î5%ä…`}èÚ`îJr%ž+’› õOîvø–íûL«Õ`èêÇ³ËårÒnÿ¼½À¿^ÿ«ùf)oy…'§Œà>`J"9Îæœ>5Z}ˆMÏÉNG m|ðöh<Q™ˆ?t cÚVBú3y-;í¸+ÓKG2‡œr¶±R¯5âŠ¦<ØQÜ0…$½‡ª8ƒëQòXh¼LÿtÖ¢4ôÆŸß”Ò®6Î7]ÎFlY¹x‘mi*ÅéŸÚj&2bŽwÀª|?ˆ’Eó‡¾¢è'^±	²Q¦Üå
Ê€#	]êé-Ï†ÂOÇùîâ_Çù_„<}X|.…!ûUcÚëaFñÕ:?wÐ³a™“°HñåôsÌI?
)ëCƒÚpö¥Ïå>î2Ä•Ç˜
Ï\Ç øKSûk–xjÃŠŸ‚ø1b›´ÍÃî7RXx¯EAU`AJª,G_ÏÑå¢Œtyàsÿ`>°$Ð‹|Á^øŸJV¯x«ˆÞGƒžò +ÝfM‹(QåÉM
dKK¾ûŽþ²ŽÇ{vÑÈ”9Œ![úGfÔ?ÓJ%	é˜·~‡¼‡Ý†HýIß"¡€¡çÃgSù˜æÉ|Fã¹Ž¢Î@1SØe]ˆÛ";Ns#Q¼ý;F.$¼ûÄ†¥÷NÖW8›^ùè1iû'çSù-sñ¶º/17\@’r&l²<ì<TÅã›VÍ¼ÜŒ Äq³ž Ušd…¢—Ù‚­ŸŒü3ÕV¹–Œ+—”I?Jæx!ÌôU7Ù^ OQÑ~±{¿
ñÛ&ëÚ	ÃçAf¶¤ø<&uŸ‡oi¬‹gÜ2²QqÃ¹ÌQ™}]8ü–FŠ_DKHNýé“þ?‘Îà+æìÄ_UF\T¬êz-©/t×0Wæ"ø;ò^‡y-÷Øºöe54VYOQû[Ïÿý{D,ÖîÖýXÐÅ$Ü¹¢¬»7Bÿ[M2ÙÅìÄíëm> Ù¶oØJnü_K¨ÛÕUÄ‚ÞÆîÖiß7lQÇ!ïÇ²Ve•FywoÜ‚þî_,•b?–3amõ;	z|ãVô_þÙBBÞ¯U]n'-“Ji=­ª¯¬…GëÉ_˜kÂ‡ëî·OÂ;ž×á#Hók©¡º"{óFó¦¡¾û\Zäw”oæEãøï`£k–eŽ¸ÖÉc ËðÁÛccG&Œ~h,¥bi¢õ´$
|Z0º×;è°·[ÕñÞNŽ”'Žû0E·DŽÿšÝ éèŠéB1–R~÷ÙÞýné…ôw–M°?,ES–©SsuE]ÝÄ‹ƒRí[Â²ýåÈ¾ÚLS1Öð¬4³©»„IÏ†S	äžb9ÕK¹‹Å«…•žÍnHå5W"*wGew×µ…A¤5g×>ÿß$7Ð]›ÜLØ¦Ë;,ŽÙ=Æ‡ªÖëˆv´ÝýR±Ò†žÛ+7Ò¥ˆµ×ÏÐ¼Ç`Êý[g+…!WÜ·LQ×\f½Õ–âHó†8«ÝÚa6ÖãÅPE.Û1ç½–ÓŒ‡ç€šñ|–ÇýÈÓ<ÚB¬å&dW-xÞ¤ôFf_`“‡q›¤µÄü±Ìüƒãy–šß}~¡Ëvz,h;Í»òr™´üô l`R<ßxnážÌdæf«,+*q{ÑÖª‡¥+oVÉ£ÉVVÀ}WøÝ÷/a1-eQIZü»¶[TT3©Oô“s»ºSE¹x®Ý¨-!WdiŠ‹ôža•žþçD¶Å—µ`éBÅ*.$êŒÆñ•¡±q2ƒ1Àëü¡çiÂ§(FÈ§”Rô+¶cÝSŸ¨¬ž2ÓŽŒQ¿ïïå—D[xE$¸:©Óë+vïäU‘ôJI/û§´üóÊbëž9zD†”RÔtn“07¨BŽÉØ¸7‚„C7ÈÊÓªgCMQ¡ûÊç¡Ì§×Ro>(?|¡Š&B,KÃ–c½ÔJnT“•¬—ß³Ç™ûõíÉ;id2‹w/ÎÎüÍx6åºƒCÖœóŠ	iÞDqOéÕŸˆ}Ð§ˆí1¿¢ºÿ9Ä<"W~£†š3’H³øx¼‹bÁ³Ä§#’¼Éiô§Ë+Á|¥Ì`Ê¤ÐaEÀƒ Ow:IÅ}ÅDžAþûháwûà=uÚµnk %»¥³ßœVÁÑ½¨^‹ ³,©±‹X–§=ŒNÕ€(§ìÔsQó»S²¬Ô»ú&/l~ÕA¬,w³¾ÉK›ÏÁ:ˆUEkïKš‡—;±=ü<;`¾†aÂNhñÒ Î?™LØj	«ø„0P"10z¤ñ ÌØðØüËÉ<ÙÔÅ3+á^ñ<ËäU1¬lÛ*÷˜Õ#2J„Í×ØYÀ3‘ßËä2 ¼‡ÉŠ‚w{šÔPwvÚqîðóCðBA(Ùú;ûã®P×¥·Ô)$ËoxA—]´¿Þ“õpiô1~÷5¿ÈŒ±[ä WÿJ1þ,YªÖ«Ñôy(“w #æ§8UOÖTµ=]…šCm¨{8SG #uÊ¤ÚêM4X‘F—†ŽFµd¾Cþù%Q„5:uÑ§áùl4“út•Hæg–[-¨¯’”a‹†ç3Ý¢P·œ,´â
È5CÆP+šo‘±JpÀÕXZRÈ¼=úîx<~ìC‘Ÿ1áÈˆú«4ßÑ6'i¾?¥Ü6$×²=¢íPLFe˜âÈ›:=óô´ì$ D€S‹$a”wà=BG’Jj'F^ƒ©ªûÌƒ'f›qëz-is“Ñ¨­’Òµ ]>®W—àì6—	wq¨§– Ìzd» 3s¨U]XìpØ·EÜáø¯Ë_g5Æ{âW†Ó†YÀIN:bO…9ñ]Ò¯ïò°ºçk¨õ¨õ¡ÌGu'Žú:q}êÊèL‹¹Ð+=c]¬V*ITT:XQ ÃA{EBIöHlNª,kµðž^–!;¤NWÓSFû%ËÄðQÂ—ãö¢7U”%wš¨y2˜³‚QÖksî¢q•ý™ÄÀÖ©É¢ª;iü¦ßŠ`·’Å’dðËƒNNÂÈ„.·jVxB­ø{«±Âîryµ:HÅéØBšu"ì¤_6.S¤Ã ?
ýQOàÀèÈ¸{êp‘L¦÷¥'Ì)š¼z¼^í·7ûâÅ‰`à×’Ê„Æ®Œ ·–ê_cqÙOÁÒÿ¢û
…ÿ]^Çœåmù8CÐÒç±T‚º«Ý°ƒÆJ6”ˆã VŒš’Šbë”,"˜Â1áz°ÆÌ™=OåëöRFàYX›ðŒE-¿$ò¡71;Ä‚¬Ðžî˜øREED[«gB°¨»&2¶rF58?4>¥	›ŠoI™1h—4/nï·ßGÖHœvR›Gåð"ü=^î¸ÌØn23·LÑ‘ä'{òyRÇï5»¤VqÑVßñ˜³F©òŽYì'[qR~77Qž8þ¡+ý”è‚#G¼ú¢d‹`g]ˆö>ø¤+)ÙIqfå`PõŒÐÕÖ™ì©´L<ÒSDžÊ#š)ÛØÏúÞoœwë©¼ý©¼I[OÀ€'«¼ƒc’üæ1KçìKZ]eðÒ:åØÝmŸÖñhþ)²è3.‘ÁÒù9Œ—Îçòö©äGÈTV$æÉ£°žË»¼¢¼6GþÐjqãLÿ-ÊðdîõUÓx›ù?‡ÚRÞëÉžkì8>²¥àH”Å3ù”Rø3ôî‚ù¹;YN¥ûúK“†ýÙï^6ïÅ:Ïâ÷ßâf Ø\*•~Ì¢ ’ë~Ý};BT ¤Q
tÅX®)]•¢~W”<wÿ4Ë*AùÒ¼¢ZßÃÕz¹¶\IÚEƒsJÞ˜¸G•×€Átºú×ËIëééž‘ïhb?±ÆÑ6F{@![Bß	€v°lhzî¶ñ¼3Iô9e£JE$òïKøžø
Púxêõ—æ€JhäÔtûºb´;C{'J½ÃÈ#•V<À>kk†Y\ànp
aæñPÙà*Œºï¾ ¸Â©ïÿõñþ	®cŠ %q?`IOTŸ|ð’®í—d;jH°‰½©Ò{ôV·k

]+PYqŽ¨êP3…Åõ¸vë—Éa¤±?}ò/ÿH1:î
”quù6ùô¨ È’qðsg¸jˆe*²Ü1MŒ‡Šõkz9ótÐÀü¡bß:``€<yñK-$^ãJš8Á>z…âø&³²pÊƒ'Þl"÷aæ”D¢û"Ê¼Šƒc™[dÅ·hENhçx¡=CÝý‹È`@ êî1è>Vïà)À{w4FÞuˆ€ ŸFnª‰+7ªåCÊüþøoš îZ4¶JûÍû¤†yPœïÄ(ÀT‘¾ïg›+b2#Ã7ñH!ò+ÔS º	cu×©€N}Äô9»ÛïA0j«ú‡›µ1+„½RcPìì1â[o€"®š[¨ž?Ämø‚#B‘ß‘ÖJ¥À<Ó¡!³Œî%cg¢„ØZüvd“4"–×8¨<ñ|ÿ‡ÿ´ã_8Œ§Î@G‘îÛÒAñ¸ÇÂ©¨×µÜäÂîï¦ãr>&Dò;€™…h|—@N„à;übåù
¸œëÝO{b†‡f´üŽZ3áÿé“þ‚îîÊžs}ùÄòŒyÂÂ@:ÏCØÆ'È‡>å,ãywL<Ù÷-âq†ôÿþ4âkW&å
"à†µ]¶Û² Á¯Ùch>Cý­û‰Ÿðë€³ÒÞa+ÿ¯æ¢ª—_>uNû.^2ûA1Þ]PI"E3¡ˆ)”À,=Dr+öØÀ¿àd…ãßB¢|ˆmYtƒD‘‰Ç¾Žq9"Å!r¸*øjìuô-Þàøêm ùdf`Æ–;ø
µ !ïm!ú(*HÊ×›¿Ü…Ò×_ð\LÜ¨‡´N¡ò¦AØæëOvúAl¡3Ó…¶|”ÀÁóÛÀ©³Ü6˜ Bî}iS>Ú	Öñy°ˆ`ÜÆ].)AHÀí·Â¸^ÏxÞ‰Ô›¤§»V€Ñ%ˆl¢òâÓä «Ÿ“ÿoEáå2ÙrD&ü¼*‡7.w"YîFh$Û2:Ïáßh„þI•ø>\·Vµê ïöÏÂZÎ†¸ÐŒÉ°/P1Þ£xÕ¦±ØŸ 0å©49ˆ›<
CŽ[‰«lÂ#š=ˆžèa@ÍYìE²pIë$Å_ÂÔ¦ä²PŽÈçè-â•
áÀ±·äÓ%ÃßOŠõžš ¼Í«äÒ—?‡°Á½ÛP×1ÜVc¥}ru"[™ì4ôjˆ¤(7nx„ÔÈ%foƒHIÜ?k¤.Ï¿7mÈHÎpòIç¾ÊRËq•×%þÕ¯¢·%wZÕ%÷›® –X2AK&Ü34è6^›(¹,Òˆ&\™pž’þ*qÙSá\÷¨²>vY¶=Þì4+uNúàa¼ífµn¦ðX0­VAd)Ðý¶É¹'Å»>wÁ¸¥Mm#&SBY2Mä1²‚³~—²M¡ÿuµ@á&æ*xÛ÷ufoQ`-°§ «Pÿí‚!qÕ‹®uxµ‰ªÅpØ¼=¹¿î$={ÅYqq\°…z€0\?Æ£ Øýx„oÙÒ•k³.'íf£ÞvVÄõ	$ÞÄÏþO´
^žÜÒpÜš‰âêÆ#:ØÊ	Æ~ŽH!kCŠY®ðu‹ƒÅ¼ßäNÄõð°pXIGÎÒªðã+¯zŸ‹Azæ ·¹Ýý¶›ZV~ÒS}…]Ú/9¾vá(36RQîo¯ºâ­•ê«)Ø–ÆÂö‰šz¶iVâ-˜^m6ñÖœŽu˜£¥øæÐâÐñ£ìÉ|H<·0“Ë?ÕzÝƒ0¦°;×}y`¹Õj~áö1£™›e¢ÖuõP2ÝéÏ<4ØBz¾ £WB–vô³†‡Ñýl%ÝXÉ‚"—ß‘šÏŸâ÷—âV;©?øÍ
Y²	'Í}˜¸¶FîÆ›CÔ§ÜB¼‹¯{Ü0ó&„oÁnðjÊ‘Et¢yêû_¦ÕqzŒû·¦ç'Ô¢Ã÷ð!/¡%J6…6qË‡‘/€'ÓèdÜåÈÃÎ¶(›¦•–ö~#òQ¼XS^©ÁÆÂSZ°$ÀÆ¢Žn¹çÌ´G+gñ~ž j[!²aÿÊ0gÊ.8•Ô¸N
¢çÂešŠ>PêŒóÉ"œ­aOÇ¢Šz;Ì .*%HT¼¯ºOá1 l=j@„åv›—.î†íiïGMy_!Õ±Ñ^©V2¸ä W *i4T™2P]–=ÖOvÖ+Ú­0d¾ž×¤	~~„ÕD–8æw¨£9ÀÕ©¥g¡xëòñhp–õ/½ §Å£”õ´ÈÙãp•Õ9æ«™	Ì‚ÔwÒcÐ!ß<Ù{`7‰°*ü«„z½Ykß|'‚ÈËíâ/I š|O¡\à.+§S.‹–¹Y%“F¬ƒé:ŽQ8Jq¥9Kµ¦æh{cRKÓ"f­1ü;,"ëÓ.†çÞ¿©qu›PáY4æÄ"XyŽèT4šKŸu-„3iÙg^/ –xð÷L KMa/úF/K²•\ò€=*µbñ÷Múw™Ð@ci¨]n5jµ¹¸å•Ó%M¹5ðØ/†æ¥j}heèƒ#GFv¦c»³H¤+}šðnÂî(H4š_ g%j1´×ò}…Yl
§RÀ‰‘Îbîfy¡×÷©dÑ{ï\èè¹hzz³b¤à•ºä;ÏNÁ[„&|ô2×¨ÜR@ŽAµBÎoÄ~²€—Fì#·7‹E`”ïDUT^Üæa:€Vt=¹urµª_ºgá8†ÐNÅZFs †ƒx¢–¡É5²,ž5ñ7(šAüLø¢§fÔÃ‡@´ÕF“(Ña`m–Ë­Þä-€Ðc †Z¯¶/$+gp9½¥›¨Žöõ[Jrò‡ÀÆÛÅLANšPÕ¸êôG¨ajMi —ðãw„dŸ	Å4,˜dÿTh&h¡‘šbÂ´ÆL3ð#S"#	Ÿ‘f=í’w€ý¸Mixæ°¤¥{9©„z¦QŸ¯¶–Î/N4r­lþ^„ˆšÐqÝ¾1©íŽCú7)Câ—NÆl2fO¾Hj7´h“f*É"5ºr%ãóEn’n„èÇ[6`à†0æÀhÙ]zéì9ZÚý)Vr—’äÞÐ7Ó=^#á¥F<]¥šXº•ð±kh†Ÿ‚TOÇÍ?b¿Ñ±jEÄïfnò,w’ŠDŒÑvNò¹Lñp#bVÓ¡ßÑ_8e‚hñÁ[!õ2¦žÜEÕCxÒŽH’€u#%¥7U¢QªcHú!ðè" j„h˜0HÂ‡Ù‡÷¤ÎdƒÚmšôæ6Ü)â½è>‡$EÇ£Úm›0’/Q\¡°ùóµºRï–ùØc5çÓhFÃÛ’“©¤˜
Âõz'¤iLùô5"uKò|üdÌ¨ñã·ø(Æ
›°m‹Ï„íM-Ç7gº2ÞµË¶¤‘eˆq$ºtágIÿ0œ%W”Âº½ 3üS€{‹ÐDac÷¦¢ñ#ÀQŸ>Ü[[žŽV®fež(.KñB2ò—;n5*7êíN4ŒD4Ñ>=üÁè‡?‰ªóQq¾ÄÂ©.µP’êl£,˜j±ÐlÄ…w¢y+æÓc!ö1ÝPÓF=(;˜à°
GÞo+Ø±+'bÝ¦Ø½07KXÄ„Ó[ã‹aÜ›‰¬©]‘ù¢<~¿éQWùuš|ÂåiôC‰½éñHŒ‡.G¯<™;¢#“ÏäüSÙŠÏ¤šñ¬Ú,4dE;q®š%Ä#w²à¸­ûŒq”Ç°([fDN
kÎX[C[½ê½É–¦"=&7Z+©Û±Šã9Sk{âNŒàÌ3¬	ójnjå.éâx1<Ô‹/ý+©ùQíÿ|Å½ ³öƒFàqtòäÉ¨POV
ÑiöïTD<fˆ²g5¼65ÿš†xÃ—L="³ýuTtøWÚ-…0Öàg•Õc¡v³ršÅŒ
­fåá*Y8¶¨øÇ)òOZ¦Â½ú•r7þý.3…8¤Ä^Ž	ù“îe¿§D4t`‡Ä%÷²Õv{¹ÿùÓVlò†ÔŸq¨8V!—R!´PÝÖ£CT×[çg/K}®4øº–FQˆú]œäf³ÚºÅW'®TÎÆ·ÚÅw'FûXÙæ~-×¢§/›¡rž%Bx|l,†¥zŒ¯yV²]n4û¾˜±‘¾VM¬™ÏÜi7gã‰ãÚÌ™Ùn	æ‹-ŒúÚ¶J5ÂÁ­j“¥–yŠ¶AÌ¦ÞOæôB+I !±;¦1^5±Ûúþ™4ÝSP›ÊhÞP˜äë±pzN	ÒÜ_Àv<Å¢	‡÷9yñ\TÈÉhÛ4oRƒ&uÚå4YêíÂwÁ†„/<4âÑ<I‡Þy¾+*@SÓ¹6À¨WDVFLØu–,;vLYÄ@3dÊŠI‡Å’IGôzL™þÙœé6gÆœ±À¨K&=Ø¿ãâ—fÜô…øY7ä}JAƒÞŽß) ûeáŒwåŸíœùìœÖÕa\jv2Úa²rf2U¸È$£iÓ)¡åjôuš95Ó¯ŽQËØIfœÍØ©<øgcçÊØ©ñÞø0Ýø™÷MØaòÚQ”u"ŠÝ+e±€ÕqÜ…àúu¸6½å£aíF³tJ«¾SwPVC¼üsÛkUÉhMÍ»Z•×n3ÄòPæ[n’à‹š&×·ùÐ¹°U"VÇµ|Ü¾Ðèµ¬²®'ëüÛAr«ë×h†cÿÏcŒ4xZÂµrñ<Js¤;‡Y…-ÒÄ²4òMŸ”]=_¿Ñ¨–|›¡«Ö¯mÖU¡_ÔñØeW…ÅÐŒ•LÍÑò©Éwìã}³#"½zQ<ògŽŠz³Ú”¯ÄsÅ&oâ‘Â>’)¶m…¾”gïG„£è]QÑ•vÂ«ep2¬=Š®B.ûhÆP<ÜÌyXûÈœ…}‚ÿôÉïF&]ÝÃ²¡ëMR¡©]rTwh2u='³½hVæ¯ÅÕƒÛÖßëÛïÿuÓ4x Î¼E#W)þ´¦Y92íŽ3¥4…NûJw<<\Õ\›ÃF‹³8W%7z“ˆ=Ò}ÒéÇV‹íõd¯õ%3»Á”C€ké?Ó™ß9’}–O$ÆÄ¾tRÒoóÒ$>Ÿ3×¾k½™·Î±¯yrn]c§y·GÆ,ï‘’{;™%÷–6”-ÿ6%—1tËz1Òíô´[……†“O½eN¾· ÅºßõÞ»žbzÌ´vB)hQ8–¢ÿ\Xøqš[¿AT³ÊÍ£Ï‹­ÜôÚìäÃfú¥¬2®'ÁÖo×³å¿ºÛemäH€j~©3=sVg8FãJ©¯Vimuge9Ë Ãtã7²w})Œìkw#ýÒŽÅ¾rëÕZî"§°ƒV«3hÉð£¤šò¶–`¨Ü+žU
Á”;WÐÚ/—ºìHÖ=<²]Ž,£~$»ÁäaS=uzÈ‡&ø³ëãàM¡Z–êzÇA¼V/8S$òøÀ)mz¥Á*73<á.ºëk¼ÁAôÆðˆCñ
*™ðŠ3D×—h'ßì~a{¾ézûxF`‚>p×h~pqVíø0]fÅçÆe˜oißmªÓÖô9ÙóÊè´u¾Ð
m78@‡mÐMÊ<P8JïÃ>JwÄåY­Ñ]E.O[§»Í±BqšŸ-ÏÊÄƒt¯¥-Í e±ê²žTÑÐT¸:8Wr<Çº6¼äxú`þ¼n.eŒ÷‰¼ùð*É‡^ÇÄ{·ÊwÊ‹µj»“5Ú…÷z¥ÙÏe¦}êŠ³q½[ÞùfæRÀaá¤êµPÙØ^±å
 Žq^„Pôé ô<Pë>„çRÜªœ`5’ïºÏdÔï=º{ˆ“Òý–WRÚ¢…nöîzÂ9‘`¢2-)©‘ÁZÚ‚N<´½ÅQOÅN—‚Á²ÒYºj¥Aµp†ð„}À\e£›\–½õÎpR/@4â8Üðª6œªzd êáPuhÙSä•Õ«Õ:*œ²žQE9ŠƒCEåal÷xÀ¾k}â4P	n_PR¯[—ÀkÄð4nj¦¤©%ízŽŒ«è½Ïàq!ØXö¯º3“û o×AN¬NiaÏ‘IÞÝê¾Àòw·•ÃÒC3¾	Å‚'¸¥ƒ{ƒ·{|‚r„J‚êr’HE?+‰A\ÀdÇT!í˜Žd°øÚ©ü=zà([IÜnÔSfpHƒZ¡ÊÂCš¡VVÉ¬CÒ	…Ì¼ÏálTZÎÔ¦\,-nWf6lÑŠòº½2(\ùw¬(ƒŽoS}U†ßÀî_réž©hTµ»oJ¹Å÷~q&â*[DÕìÜõFøš>Ð(ÿôÉ61å²û5w³Ë‘a„à,Ÿ¸%q>ïÁ0Á%¤[Ê%Õµ!ÒX¶l
cd€3Ô´ÑtF)ÊÃÇ¦Ö(Ø™ZË›­e+‰ãŽ2t¼R7UÏ‘Y”·q"¡4·¸3©èÂèi9vÒ)6ñ±iúçïG#‚0Û¥#‹N•OžKË>Ž")=ðÑlw¿ò<1ç\ÈãG¸=Š‰‘Á<ºWyîÄöëãês³ä4ÍÀrÅL¬réê1)ék~‹½fç Ë&L–ì£O˜3å(Êx¦púö­ð+ç¼rE»bÚ4ÊU‘ÊÏÖ¥¬–­qaû{Qìí K–b{‚úæ7ÙzªV.4ÐºÞýyR÷vw»àê<!ú{WµÇ:öãû?üû|ûOxÑ}a©›;PAGµ©`½@šÏR
àCjäQo:Ð'×qÂ»‹8÷Ôó»ÁŠÏ¿Z¢ÈO0ÉÉü;ñ(ùå9˜iÈï"vÒ¯\¶ó:³Ø]œñ©vtªçR0ÞsJ> Gn[ÅóH?Ò::6÷™ènnQ$ÿ} —'—GØ½_2ÖÇ–>ú¶V“^¿AYkVhqþOX¨-ÊÍ~Öh,µñLLÔÛ
Ñ>]òÃ	úföV½Œ¬¶/6“úI4bëÏâsrÃì{Öý
3'Ë7‰†Õ"wA›HÂì7ùd9Ië²(ŸÒ¿“<ÙOÅ_±6®6!A¨BÆ³LãÃâˆÏåÛ8Ú«í¤urUþn~¥qVDùCíz¹³(\TËäuÈë"ÏX…ÉP~&úÀ'µ*‰âkì¡HÛˆÒ‰#§Ò(³Ž’öìr3i!šýë÷	Cˆ.¿?ë¦þàìß³Êt*!ð/)	x¶^{ˆo:—mÄ1 SZû‹ÿ  ÿÿ Ì¬v¯