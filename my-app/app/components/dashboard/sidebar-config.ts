import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Code2,
  Database,
  FileText,
  Home,
  Image,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react";

export type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type SidebarSection = {
  label: string;
  links: SidebarLink[];
};

export const sidebarSections: SidebarSection[] = [
  {
    label: "Overview",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Inbox",
    links: [
      { href: "/dashboard/pages/messages", label: "Messages", icon: Inbox },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/dashboard/pages/home", label: "Home Page", icon: Home },
      { href: "/dashboard/pages/about", label: "About", icon: Users },
      { href: "/dashboard/pages/projects", label: "Projects", icon: Image },
      { href: "/dashboard/pages/skills", label: "Skills", icon: Code2 },
      { href: "/dashboard/pages/services", label: "Services", icon: Briefcase },
      { href: "/dashboard/pages/contact", label: "Contact", icon: Mail },
      { href: "/dashboard/pages/blog", label: "Blog Posts", icon: FileText },
    ],
  },
];

export type NotificationTone = "indigo" | "amber" | "emerald";

export type AppNotification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: LucideIcon;
  tone: NotificationTone;
  href: string;
  unread?: boolean;
};

/** Literal class strings — Tailwind cannot generate dynamic `bg-${tone}-*` names */
export const toneClasses: Record<NotificationTone, string> = {
  indigo: "bg-indigo-500/15 text-indigo-400",
  amber: "bg-amber-500/15 text-amber-400",
  emerald: "bg-emerald-500/15 text-emerald-400",
};

export const notificationSeed: AppNotification[] = [
  {
    id: "n1",
    title: "New project inquiry",
    desc: "Someone reached out through your contact form",
    time: "2m ago",
    icon: Mail,
    tone: "indigo",
    href: "/dashboard/pages/contact",
  },
  {
    id: "n2",
    title: "Blog draft awaiting review",
    desc: "Your latest post is ready to be published",
    time: "1h ago",
    icon: FileText,
    tone: "amber",
    href: "/dashboard/pages/blog",
  },
  {
    id: "n3",
    title: "New visitor message",
    desc: "A fresh message landed in your inbox",
    time: "4h ago",
    icon: MessageSquare,
    tone: "emerald",
    href: "/dashboard/pages/contact",
  },
  {
    id: "n4",
    title: "Backup completed",
    desc: "Portfolio data was backed up successfully",
    time: "Yesterday",
    icon: Database,
    tone: "indigo",
    href: "/dashboard",
  },
];

export const adminProfile = {
  name: "Ethian",
  role: "Full Stack Engineer",
  email: "admin@ethian.dev",
  initials: "ET",
};
