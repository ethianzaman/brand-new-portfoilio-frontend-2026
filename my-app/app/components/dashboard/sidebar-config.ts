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
  Search,
  Settings,
  Share2,
  UserCog,
  Users,
} from "lucide-react";

export type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only rendered with this permission (see SidebarNav). */
  permission?: string;
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
      { href: "/dashboard/pages/messages", label: "Messages", icon: Inbox, permission: "messages.view" },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/dashboard/pages/hero", label: "Hero", icon: Home, permission: "hero.view" },
      { href: "/dashboard/pages/about", label: "About", icon: Users, permission: "about.view" },
      { href: "/dashboard/pages/projects", label: "Projects", icon: Image, permission: "projects.view" },
      { href: "/dashboard/pages/skills", label: "Skills", icon: Code2, permission: "skills.view" },
      { href: "/dashboard/pages/services", label: "Services", icon: Briefcase, permission: "services.view" },
      { href: "/dashboard/pages/blog", label: "Blogs", icon: FileText, permission: "blog.view" },
      { href: "/dashboard/pages/contact", label: "Contact", icon: Mail, permission: "contact.view" }
    ],
  },
  {
    label: "Social",
    links: [
      { href: "/dashboard/pages/social-links", label: "Social Links", icon: Share2, permission: "socialLinks.view" },
    ],
  },
  {
    label: "SEO",
    links: [
      { href: "/dashboard/pages/seo", label: "SEO", icon: Search, permission: "seo.view" },
    ],
  },
  {
    label: "System",
    links: [
      {
        href: "/dashboard/pages/settings",
        label: "Site Settings",
        icon: Settings,
        permission: "settings.view",
      },
      {
        href: "/dashboard/pages/users",
        label: "Users",
        icon: UserCog,
        permission: "users.view",
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
