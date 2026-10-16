import {
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  LayoutDashboard,
  Lock,
  Medal,
  MessageSquareText,
  Palette,
  Receipt,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Trophy,
  UserCog,
  Users,
  Wallet,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import type { TAccent } from "./accents";

type L = { en: string; bn: string };
export type TFeature = { icon: LucideIcon; title: L; body: L; featured?: boolean };
export type TFeatureGroup = { id: string; accent: TAccent; title: L; blurb: L; features: TFeature[] };

export const FEATURE_GROUPS: TFeatureGroup[] = [
  {
    id: "start",
    accent: "teal",
    title: { en: "Get started fast", bn: "দ্রুত শুরু করুন" },
    blurb: { en: "From signup to your first attendance in minutes.", bn: "সাইন-আপ থেকে প্রথম হাজিরা, কয়েক মিনিটেই।" },
    features: [
      { icon: BadgeCheck, featured: true, title: { en: "Three-step signup", bn: "তিন ধাপে সাইন-আপ" }, body: { en: "Pick your address, check it live, and sign in automatically. No card needed.", bn: "ঠিকানা বেছে নিন, সাথে সাথে যাচাই হবে, নিজে থেকেই সাইন ইন। কার্ড লাগবে না।" } },
      { icon: ClipboardList, title: { en: "Guided setup checklist", bn: "ধাপে ধাপে সেটআপ" }, body: { en: "A checklist that follows your real progress: session, classes, subjects, students.", bn: "আপনার আসল অগ্রগতি অনুযায়ী চেকলিস্ট: সেশন, শ্রেণি, বিষয়, শিক্ষার্থী।" } },
      { icon: Languages, title: { en: "Bangla and English", bn: "বাংলা ও ইংরেজি" }, body: { en: "Bangla by default, one tap to English, optional Bangla digits.", bn: "ডিফল্ট বাংলা, এক ট্যাপে ইংরেজি, চাইলে বাংলা সংখ্যা।" } },
      { icon: Settings2, title: { en: "Your own words", bn: "নিজের শব্দ" }, body: { en: "Rename class, section or roll for madrasas and coaching centres.", bn: "মাদ্রাসা বা কোচিংয়ের জন্য শ্রেণি, শাখা, রোল নিজের মতো করে বদলান।" } },
    ],
  },
  {
    id: "academic",
    accent: "blue",
    title: { en: "Academic setup", bn: "একাডেমিক সেটআপ" },
    blurb: { en: "Model your institution the way it really runs.", bn: "আপনার প্রতিষ্ঠান যেভাবে চলে, ঠিক সেভাবেই সাজান।" },
    features: [
      { icon: BookOpen, featured: true, title: { en: "Sessions, classes, sections", bn: "সেশন, শ্রেণি, শাখা" }, body: { en: "Current-session switch, reorder, and a quick wizard for Class 1 to 10.", bn: "চলতি সেশন বদল, ক্রম সাজানো, আর ১ম থেকে ১০ম শ্রেণির দ্রুত উইজার্ড।" } },
      { icon: ScrollText, title: { en: "Subjects with parts", bn: "অংশসহ বিষয়" }, body: { en: "Written, practical and more, with a live total and pass marks.", bn: "লিখিত, ব্যবহারিকসহ নানা অংশ, লাইভ মোট ও পাস নম্বরসহ।" } },
      { icon: LayoutDashboard, title: { en: "Class-subject matrix", bn: "শ্রেণি-বিষয় ম্যাট্রিক্স" }, body: { en: "Compulsory, optional or fourth subject, full marks, and the teacher.", bn: "আবশ্যিক, ঐচ্ছিক বা চতুর্থ বিষয়, পূর্ণমান এবং শিক্ষক।" } },
      { icon: UserCog, title: { en: "Staff management", bn: "স্টাফ ব্যবস্থাপনা" }, body: { en: "Temporary passwords shown once, role changes, and a last-admin guard.", bn: "অস্থায়ী পাসওয়ার্ড একবারই দেখায়, ভূমিকা বদল, শেষ অ্যাডমিন সুরক্ষা।" } },
    ],
  },
  {
    id: "students",
    accent: "indigo",
    title: { en: "Students and guardians", bn: "শিক্ষার্থী ও অভিভাবক" },
    blurb: { en: "Admission to promotion, all in one profile.", bn: "ভর্তি থেকে উত্তরণ, সবই এক প্রোফাইলে।" },
    features: [
      { icon: GraduationCap, featured: true, title: { en: "Student profiles", bn: "শিক্ষার্থীর প্রোফাইল" }, body: { en: "Photo, guardians, enrolment history, attendance, fees and results in tabs.", bn: "ছবি, অভিভাবক, ভর্তির ইতিহাস, উপস্থিতি, ফি ও ফলাফল ট্যাবে।" } },
      { icon: FileSpreadsheet, title: { en: "CSV import and export", bn: "CSV ইমপোর্ট ও এক্সপোর্ট" }, body: { en: "Template, dry-run with row errors, then commit. Export any filtered list.", bn: "টেমপ্লেট, ভুলসহ ড্রাই-রান, তারপর নিশ্চিত। যেকোনো ফিল্টার করা তালিকা এক্সপোর্ট।" } },
      { icon: Users, title: { en: "Year-end promotion", bn: "বছর শেষে উত্তরণ" }, body: { en: "Preview, mark repeaters, confirm. Plan limits shown before you commit.", bn: "প্রিভিউ, অকৃতকার্য চিহ্নিত করা, নিশ্চিত। নিশ্চিত করার আগেই প্ল্যান সীমা দেখায়।" } },
      { icon: Lock, title: { en: "Student and guardian logins", bn: "শিক্ষার্থী ও অভিভাবকের লগইন" }, body: { en: "Create accounts in one click; a guardian sees all their children.", bn: "এক ক্লিকে অ্যাকাউন্ট; অভিভাবক নিজের সব সন্তানকে দেখেন।" } },
    ],
  },
  {
    id: "attendance",
    accent: "violet",
    title: { en: "Attendance and notices", bn: "উপস্থিতি ও নোটিশ" },
    blurb: { en: "The daily routine, made quick and reliable.", bn: "প্রতিদিনের কাজ, দ্রুত ও নির্ভরযোগ্য।" },
    features: [
      { icon: CalendarCheck, featured: true, title: { en: "Take attendance in seconds", bn: "সেকেন্ডে হাজিরা" }, body: { en: "One tap per student, live counters, sticky submit, weekend guard.", bn: "প্রতি শিক্ষার্থীর জন্য এক ট্যাপ, লাইভ গণনা, স্থির সাবমিট, সাপ্তাহিক ছুটির সুরক্ষা।" } },
      { icon: WifiOff, title: { en: "Safe on weak networks", bn: "দুর্বল নেটওয়ার্কেও নিরাপদ" }, body: { en: "A local draft is kept if the connection drops, with automatic retry.", bn: "সংযোগ গেলে স্থানীয় খসড়া থাকে, নিজে থেকেই আবার চেষ্টা।" } },
      { icon: BarChart3, title: { en: "Attendance reports", bn: "উপস্থিতি রিপোর্ট" }, body: { en: "Day-by-day section matrix with percentages, and per-student summaries.", bn: "দিনভিত্তিক শাখার ম্যাট্রিক্স শতাংশসহ, আর শিক্ষার্থীভিত্তিক সারাংশ।" } },
      { icon: Bell, title: { en: "Targeted notices", bn: "নির্দিষ্ট দর্শকের নোটিশ" }, body: { en: "Rich text, PDF attachments, schedule and expiry, to a class, section or everyone.", bn: "রিচ টেক্সট, PDF সংযুক্তি, সময়সূচি ও মেয়াদ, শ্রেণি, শাখা বা সবার জন্য।" } },
    ],
  },
  {
    id: "fees",
    accent: "emerald",
    title: { en: "Fees and accounts", bn: "ফি ও হিসাব" },
    blurb: { en: "Every taka tracked, every receipt printable.", bn: "প্রতিটি টাকার হিসাব, প্রতিটি রসিদ ছাপানো যায়।" },
    features: [
      { icon: Wallet, featured: true, title: { en: "Fee heads and structures", bn: "ফি খাত ও কাঠামো" }, body: { en: "Monthly, term, yearly or one-time fees per class, with a live monthly total.", bn: "শ্রেণিভিত্তিক মাসিক, সেমিস্টার, বার্ষিক বা এককালীন ফি, লাইভ মাসিক মোটসহ।" } },
      { icon: BadgeCheck, title: { en: "Waivers and scholarships", bn: "মওকুফ ও বৃত্তি" }, body: { en: "Percent or fixed, with a reason and dates. Ended, never deleted.", bn: "শতাংশ বা নির্দিষ্ট অঙ্ক, কারণ ও তারিখসহ। শেষ করা যায়, মোছা যায় না।" } },
      { icon: FileText, title: { en: "Safe invoice generation", bn: "নিরাপদ চালান তৈরি" }, body: { en: "Preview first, then confirm. Retries never create duplicates.", bn: "আগে প্রিভিউ, তারপর নিশ্চিত। আবার চাপলেও ডুপ্লিকেট হয় না।" } },
      { icon: CreditCard, title: { en: "Collect fee fast", bn: "দ্রুত ফি সংগ্রহ" }, body: { en: "Search by name, ID, roll or guardian phone. Cash, bank, cheque, bKash, Nagad, Rocket.", bn: "নাম, আইডি, রোল বা অভিভাবকের ফোনে খুঁজুন। নগদ, ব্যাংক, চেক, বিকাশ, নগদ, রকেট।" } },
      { icon: Receipt, title: { en: "PDF receipts", bn: "পিডিএফ রসিদ" }, body: { en: "Print or download. Reversals need a reason and stay visible.", bn: "প্রিন্ট বা ডাউনলোড। বাতিলের কারণ লাগে এবং তালিকায় থাকে।" } },
      { icon: Banknote, title: { en: "Dues and collection reports", bn: "বাকি ও সংগ্রহ রিপোর্ট" }, body: { en: "Filter dues, chart collections by day, method, class or head, export CSV.", bn: "বাকি ফিল্টার, দিন, মাধ্যম, শ্রেণি বা খাত অনুযায়ী চার্ট, CSV এক্সপোর্ট।" } },
    ],
  },
  {
    id: "exams",
    accent: "cyan",
    title: { en: "Exams and results", bn: "পরীক্ষা ও ফলাফল" },
    blurb: { en: "From marks entry to a published marksheet.", bn: "নম্বর এন্ট্রি থেকে প্রকাশিত মার্কশিট।" },
    features: [
      { icon: Trophy, featured: true, title: { en: "Grading scales", bn: "গ্রেডিং স্কেল" }, body: { en: "GPA 5.00, percentage or division presets, with pass and merit rules.", bn: "জিপিএ ৫.০০, শতাংশ বা বিভাগ প্রিসেট, পাস ও মেধা নিয়মসহ।" } },
      { icon: ClipboardList, title: { en: "Keyboard-fast marks grid", bn: "কিবোর্ডে দ্রুত নম্বর গ্রিড" }, body: { en: "Tab and Enter, autosave per row, absent flag, submit and unlock.", bn: "Tab ও Enter, প্রতি সারিতে অটোসেভ, অনুপস্থিত চিহ্ন, জমা ও আনলক।" } },
      { icon: BarChart3, title: { en: "Progress and results", bn: "অগ্রগতি ও ফলাফল" }, body: { en: "See who still owes marks, then calculate pass rate and positions.", bn: "কার নম্বর বাকি দেখুন, তারপর পাসের হার ও মেধাক্রম হিসাব করুন।" } },
      { icon: ShieldCheck, title: { en: "Publish with confidence", bn: "নিশ্চিন্তে প্রকাশ" }, body: { en: "Checklist and typed confirmation, then the exam is locked.", bn: "চেকলিস্ট ও নাম লিখে নিশ্চিতকরণ, এরপর পরীক্ষা লক।" } },
      { icon: Medal, title: { en: "Result corrections", bn: "ফলাফল সংশোধন" }, body: { en: "Mandatory reason and a version badge, so every change is explained.", bn: "কারণ বাধ্যতামূলক ও ভার্সন ব্যাজ, প্রতিটি পরিবর্তনের ব্যাখ্যা থাকে।" } },
      { icon: FileText, title: { en: "Marksheet and merit list", bn: "মার্কশিট ও মেধা তালিকা" }, body: { en: "Marksheet PDF preview and merit list CSV.", bn: "মার্কশিট পিডিএফ প্রিভিউ ও মেধা তালিকা CSV।" } },
    ],
  },
  {
    id: "website",
    accent: "rose",
    title: { en: "Public website", bn: "পাবলিক ওয়েবসাইট" },
    blurb: { en: "A professional site for every school, no designer needed.", bn: "প্রতিটি স্কুলের জন্য পেশাদার সাইট, ডিজাইনার ছাড়াই।" },
    features: [
      { icon: Globe, featured: true, title: { en: "Your own school site", bn: "নিজস্ব স্কুল সাইট" }, body: { en: "Home, notices, teachers, gallery and admission, live at your address.", bn: "হোম, নোটিশ, শিক্ষক, গ্যালারি ও ভর্তি, আপনার ঠিকানায় লাইভ।" } },
      { icon: Palette, title: { en: "Theme with contrast check", bn: "কনট্রাস্ট যাচাইসহ থিম" }, body: { en: "Pick your colour; we warn you if white text would be hard to read.", bn: "রং বাছুন; সাদা লেখা পড়া কঠিন হলে আমরা সতর্ক করি।" } },
      { icon: MessageSquareText, title: { en: "Admission inquiries", bn: "ভর্তির অনুসন্ধান" }, body: { en: "Spam-protected form and an inbox with a new-message badge.", bn: "স্প্যাম সুরক্ষিত ফর্ম ও নতুন বার্তার ব্যাজসহ ইনবক্স।" } },
      { icon: Search, title: { en: "Result lookup for parents", bn: "অভিভাবকের ফলাফল খোঁজা" }, body: { en: "Roll and date of birth, no login. Download the marksheet.", bn: "রোল ও জন্ম তারিখ দিয়ে, লগইন ছাড়াই। মার্কশিট ডাউনলোড।" } },
      { icon: ImageIcon, title: { en: "Gallery and teacher profiles", bn: "গ্যালারি ও শিক্ষক প্রোফাইল" }, body: { en: "Upload, caption and reorder photos. Choose who shows publicly.", bn: "ছবি আপলোড, ক্যাপশন ও ক্রম। কে প্রকাশ্যে দেখাবে তা আপনি ঠিক করুন।" } },
      { icon: Globe, title: { en: "Search-engine ready", bn: "সার্চ ইঞ্জিন-বান্ধব" }, body: { en: "Titles, Open Graph, structured data, and 404 for unpublished sites.", bn: "টাইটেল, ওপেন গ্রাফ, স্ট্রাকচার্ড ডেটা, আর অপ্রকাশিত সাইটে ৪০৪।" } },
    ],
  },
  {
    id: "portal",
    accent: "sky",
    title: { en: "Parents and students", bn: "অভিভাবক ও শিক্ষার্থী" },
    blurb: { en: "Everything a parent asks about, in their pocket.", bn: "অভিভাবক যা জানতে চান, সবই পকেটে।" },
    features: [
      { icon: Smartphone, featured: true, title: { en: "Phone-first portal", bn: "ফোন-ফার্স্ট পোর্টাল" }, body: { en: "Notices, attendance, fees and results on any phone.", bn: "যেকোনো ফোনে নোটিশ, উপস্থিতি, ফি ও ফলাফল।" } },
      { icon: CalendarCheck, title: { en: "Month attendance calendar", bn: "মাসিক উপস্থিতি ক্যালেন্ডার" }, body: { en: "Colour-coded days and a clear percentage.", bn: "রঙ করা দিন ও স্পষ্ট শতাংশ।" } },
      { icon: Receipt, title: { en: "Dues and receipts", bn: "বাকি ও রসিদ" }, body: { en: "See what is due and download every receipt as PDF.", bn: "কত বাকি দেখুন এবং প্রতিটি রসিদ পিডিএফ-এ নামান।" } },
      { icon: Users, title: { en: "Switch between children", bn: "সন্তান বদল করুন" }, body: { en: "A guardian's child switcher is saved in the link.", bn: "অভিভাবকের সন্তান বদলানোর অবস্থা লিংকে সংরক্ষিত থাকে।" } },
    ],
  },
  {
    id: "trust",
    accent: "slate",
    title: { en: "Control, safety and scale", bn: "নিয়ন্ত্রণ, নিরাপত্তা ও বিস্তার" },
    blurb: { en: "Built so owners can trust it and grow with it.", bn: "মালিকরা যেন ভরসা করতে পারেন এবং বড় হতে পারেন।" },
    features: [
      { icon: ShieldCheck, featured: true, title: { en: "Role-based access", bn: "ভূমিকাভিত্তিক প্রবেশাধিকার" }, body: { en: "Admin, teacher, accountant, student and guardian each see only their part.", bn: "অ্যাডমিন, শিক্ষক, হিসাবরক্ষক, শিক্ষার্থী ও অভিভাবক শুধু নিজের অংশ দেখেন।" } },
      { icon: ScrollText, title: { en: "Audit log", bn: "অডিট লগ" }, body: { en: "Every sensitive change with who, when, and a before-and-after view.", bn: "প্রতিটি গুরুত্বপূর্ণ পরিবর্তন: কে, কখন, আগে ও পরে।" } },
      { icon: BarChart3, title: { en: "Plans and usage", bn: "প্ল্যান ও ব্যবহার" }, body: { en: "See your plan, student cap and trial, with clear warnings near the limit.", bn: "প্ল্যান, শিক্ষার্থী সীমা ও ট্রায়াল দেখুন, সীমার কাছে গেলে স্পষ্ট সতর্কতা।" } },
      { icon: Settings2, title: { en: "Owner console", bn: "মালিকের কনসোল" }, body: { en: "Tenants, plans, subscriptions, suspend and reactivate, from one place.", bn: "টেন্যান্ট, প্ল্যান, সাবস্ক্রিপশন, স্থগিত ও চালু, এক জায়গা থেকে।" } },
    ],
  },
];

export const FEATURE_COUNT = FEATURE_GROUPS.reduce((n, g) => n + g.features.length, 0);
