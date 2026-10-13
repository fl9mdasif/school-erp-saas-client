import {
  Award,
  Banknote,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Globe,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Megaphone,
  Receipt,
  ScrollText,
  Settings,
  Trophy,
  UserCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { USER_ROLE, type TRole } from "@/contains/role";
import { hasFeature, type TFeature } from "@/contains/features";
import type { TKey } from "@/lib/i18n";

/** A sub-page of a sidebar group. */
export type TNavChild = { key: string; labelKey: TKey; href: string; feature?: TFeature };

export type TNavItem = {
  key: string;
  labelKey: TKey;
  href: string;
  icon: LucideIcon;
  /** Hidden (and the URL redirected) when this feature flag is off. */
  feature?: TFeature;
  /** Sub-pages. When present the item is a group header. */
  children?: TNavChild[];
};
type TItem = TNavItem;

const D = "/dashboard";

// One list per role. Sidebar items are built and finished one at a time in this order (see CLIENT-PLAN.md).
const ADMIN: TItem[] = [
  { key: "home", labelKey: "nav.home", href: D, icon: LayoutDashboard },
  { key: "academic", labelKey: "nav.academic", href: `${D}/academic`, icon: BookOpen, children: [
    { key: "sessions", labelKey: "nav.academic.sessions", href: `${D}/academic/sessions` },
    { key: "classes", labelKey: "nav.academic.classes", href: `${D}/academic/classes` },
    { key: "subjects", labelKey: "nav.academic.subjects", href: `${D}/academic/subjects` },
    { key: "classSubjects", labelKey: "nav.academic.classSubjects", href: `${D}/academic/class-subjects` },
  ] },
  { key: "staff", labelKey: "nav.staff", href: `${D}/staff`, icon: UserCog },
  { key: "students", labelKey: "nav.students", href: `${D}/students`, icon: GraduationCap },
  { key: "attendance", labelKey: "nav.attendance", href: `${D}/attendance`, icon: CalendarCheck, children: [
    { key: "take", labelKey: "nav.attendance.take", href: `${D}/attendance/take` },
    { key: "reports", labelKey: "nav.attendance.reports", href: `${D}/attendance/reports` },
  ] },
  { key: "notices", labelKey: "nav.notices", href: `${D}/notices`, icon: Megaphone },
  { key: "fees", labelKey: "nav.fees", href: `${D}/fees`, icon: Wallet, children: [
    { key: "heads", labelKey: "nav.fees.heads", href: `${D}/fees/heads` },
    { key: "structures", labelKey: "nav.fees.structures", href: `${D}/fees/structures` },
    { key: "adjustments", labelKey: "nav.fees.adjustments", href: `${D}/fees/adjustments` },
    { key: "invoices", labelKey: "nav.fees.invoices", href: `${D}/fees/invoices` },
    { key: "collect", labelKey: "nav.fees.collect", href: `${D}/fees/collect` },
    { key: "payments", labelKey: "nav.fees.payments", href: `${D}/fees/payments` },
    { key: "dues", labelKey: "nav.fees.dues", href: `${D}/fees/dues` },
    { key: "reports", labelKey: "nav.fees.reports", href: `${D}/fees/reports` },
  ] },
  { key: "exams", labelKey: "nav.exams", href: `${D}/exams`, icon: ClipboardList, children: [
    { key: "list", labelKey: "nav.exams.list", href: `${D}/exams` },
    { key: "gradingScales", labelKey: "nav.exams.gradingScales", href: `${D}/exams/grading-scales` },
  ] },
  { key: "website", labelKey: "nav.website", href: `${D}/website`, icon: Globe, children: [
    { key: "content", labelKey: "nav.website.content", href: `${D}/website` },
    { key: "staffProfiles", labelKey: "nav.website.staffProfiles", href: `${D}/website/staff-profiles` },
    { key: "gallery", labelKey: "nav.website.gallery", href: `${D}/website/gallery` },
    { key: "inquiries", labelKey: "nav.website.inquiries", href: `${D}/website/inquiries` },
  ] },
  { key: "settings", labelKey: "nav.settings", href: `${D}/settings`, icon: Settings },
  { key: "audit", labelKey: "nav.audit", href: `${D}/audit`, icon: ScrollText, feature: "audit" },
];

const TEACHER: TItem[] = [
  { key: "home", labelKey: "nav.home", href: D, icon: LayoutDashboard },
  { key: "students", labelKey: "nav.students", href: `${D}/students`, icon: GraduationCap },
  { key: "attendance", labelKey: "nav.attendance", href: `${D}/attendance`, icon: CalendarCheck, children: [
    { key: "take", labelKey: "nav.attendance.take", href: `${D}/attendance/take` },
    { key: "reports", labelKey: "nav.attendance.reports", href: `${D}/attendance/reports` },
  ] },
  { key: "marks", labelKey: "nav.marks", href: `${D}/exams`, icon: ClipboardList },
  { key: "notices", labelKey: "nav.notices", href: `${D}/notices`, icon: Megaphone },
  { key: "academic", labelKey: "nav.academic", href: `${D}/academic/classes`, icon: BookOpen },
];

const ACCOUNTANT: TItem[] = [
  { key: "collect", labelKey: "nav.fees.collect", href: `${D}/fees/collect`, icon: HandCoins },
  { key: "dues", labelKey: "nav.fees.dues", href: `${D}/fees/dues`, icon: Banknote },
  { key: "payments", labelKey: "nav.fees.payments", href: `${D}/fees/payments`, icon: Receipt },
  { key: "fees", labelKey: "nav.fees", href: `${D}/fees`, icon: Wallet, children: [
    { key: "heads", labelKey: "nav.fees.heads", href: `${D}/fees/heads` },
    { key: "structures", labelKey: "nav.fees.structures", href: `${D}/fees/structures` },
    { key: "invoices", labelKey: "nav.fees.invoices", href: `${D}/fees/invoices` },
    { key: "reports", labelKey: "nav.fees.reports", href: `${D}/fees/reports` },
  ] },
  { key: "students", labelKey: "nav.students", href: `${D}/students`, icon: GraduationCap },
  { key: "academic", labelKey: "nav.academic", href: `${D}/academic/classes`, icon: BookOpen },
];

// Student and guardian share the same portal pages; the portal flag can hide them.
const PORTAL: TItem[] = [
  { key: "home", labelKey: "nav.home", href: `${D}/portal`, icon: LayoutDashboard, feature: "portal" },
  { key: "attendance", labelKey: "nav.portal.attendance", href: `${D}/portal/attendance`, icon: CalendarCheck, feature: "portal" },
  { key: "fees", labelKey: "nav.portal.fees", href: `${D}/portal/fees`, icon: CreditCard, feature: "portal" },
  { key: "results", labelKey: "nav.portal.results", href: `${D}/portal/results`, icon: Trophy, feature: "portal" },
  { key: "notices", labelKey: "nav.portal.notices", href: `${D}/portal/notices`, icon: Megaphone, feature: "portal" },
];

const PLATFORM: TItem[] = [
  { key: "overview", labelKey: "nav.platform.overview", href: "/platform", icon: BarChart3 },
  { key: "tenants", labelKey: "nav.platform.tenants", href: "/platform/tenants", icon: Building2 },
  { key: "plans", labelKey: "nav.platform.plans", href: "/platform/plans", icon: Award },
];

const BY_ROLE: Record<TRole, TItem[]> = {
  [USER_ROLE.SUPER_ADMIN]: PLATFORM,
  [USER_ROLE.ADMIN]: ADMIN,
  [USER_ROLE.TEACHER]: TEACHER,
  [USER_ROLE.ACCOUNTANT]: ACCOUNTANT,
  [USER_ROLE.STUDENT]: PORTAL,
  [USER_ROLE.GUARDIAN]: PORTAL,
};

const visible = (f?: TFeature) => !f || hasFeature(f);

/** Sidebar and drawer items for a role, with hidden features removed. */
export const sidebarItems = (role: TRole): TItem[] =>
  BY_ROLE[role]
    .filter((i) => visible(i.feature))
    .map((i) => ({ ...i, children: i.children?.filter((c) => visible(c.feature)) }));

// The four most used destinations on a phone (PRD 7.1). Everything else is in the "More" drawer.
const BOTTOM: Record<TRole, string[]> = {
  [USER_ROLE.SUPER_ADMIN]: ["overview", "tenants", "plans"],
  [USER_ROLE.ADMIN]: ["home", "students", "fees", "attendance"],
  [USER_ROLE.TEACHER]: ["home", "attendance", "marks", "notices"],
  [USER_ROLE.ACCOUNTANT]: ["collect", "dues", "payments", "fees"],
  [USER_ROLE.STUDENT]: ["home", "attendance", "fees", "results"],
  [USER_ROLE.GUARDIAN]: ["home", "attendance", "fees", "results"],
};

export const bottomNavItems = (role: TRole): TItem[] => {
  const all = sidebarItems(role);
  return BOTTOM[role].map((k) => all.find((i) => i.key === k)).filter((i): i is TItem => !!i);
};

/** Map of every path a role may open, used to decide if a URL is allowed for the role. */
export const allowedPaths = (role: TRole): string[] =>
  sidebarItems(role).flatMap((i) => [i.href, ...(i.children?.map((c) => c.href) ?? [])]);
