import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Code2,
  FileText,
  Home,
  Image,
  Inbox,
  LayoutDashboard,
  Mail,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

export type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only rendered for admins (see SidebarNav). */
  adminOnly?: boolean;
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
      { href: "/dashboard/pages/home", label: "Hero", icon: Home },
      { href: "/dashboard/pages/about", label: "About", icon: Users },
      { href: "/dashboard/pages/projects", label: "Projects", icon: Image },
      { href: "/dashboard/pages/skills", label: "Skills", icon: Code2 },
      { href: "/dashboard/pages/services", label: "Services", icon: Briefcase },
      { href: "/dashboard/pages/blog", label: "Blogs", icon: FileText },
      { href: "/dashboard/pages/contact", label: "Contact", icon: Mail }
    ],
  },
  {
    label: "System",
    links: [
      {
        href: "/dashboard/pages/settings",
        label: "Site Settings",
        icon: Settings,
      },
      {
        href: "/dashboard/pages/users",
        label: "Users",
        icon: UserCog,
        adminOnly: true,
      },
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

export const adminProfile = {
  name: "Ethian",
  role: "Full Stack Engineer",
  email: "admin@ethian.dev",
  initials: "ET",
};
