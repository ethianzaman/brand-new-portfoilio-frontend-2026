import {
  BadgeCheck,
  Briefcase,
  BriefcaseBusiness,
  FileDown,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  HeartHandshake,
  MessageCircleQuestion,
  Search,
  Share2,
  User,
  type LucideIcon,
} from "lucide-react";

import { resolvePersonName } from "@/lib/seo/jsonld";
import { resolveSiteOrigin } from "@/lib/seo/metadata";
import type { DashboardHomeData } from "@/lib/services/dashboard-home.service";
import { isProfileLink } from "@/lib/socials";

export interface HealthItem {
  label: string;
  ok: boolean;
  detail: string;
  icon: LucideIcon;
  to: string;
}

export interface Health {
  items: HealthItem[];
  done: number;
  score: number;
  /** Some sections could not be read, so the score leaves them out. */
  incomplete: boolean;
}

export interface AttentionItem {
  key: string;
  label: string;
  detail: string;
  to: string;
}

// What a brand-new About document is created with. This is not real content.
const PLACEHOLDER_RESUME = "/resume.pdf";

const countItem = (
  label: string,
  count: number,
  noun: string,
  icon: LucideIcon,
  to: string,
): HealthItem => ({
  label,
  ok: count > 0,
  detail: count > 0 ? `${count} ${noun}` : "None yet",
  icon,
  to,
});

export function buildHealth(data: DashboardHomeData): Health {
  const items: HealthItem[] = [];
  const P = "/dashboard/pages";

  if (data.about) {
    const { hero } = data.about;
    const hasProfile = Boolean(resolvePersonName(hero?.name));
    const hasResume = Boolean(hero?.resumeUrl?.trim()) && hero.resumeUrl !== PLACEHOLDER_RESUME;
    items.push(
      {
        label: "About profile",
        ok: hasProfile,
        detail: hasProfile ? "Set" : "Not set",
        icon: User,
        to: `${P}/about`,
      },
      {
        label: "Resume link",
        ok: hasResume,
        detail: hasResume ? "Set" : "Not set",
        icon: FileDown,
        to: `${P}/about`,
      },
      countItem("Experiences", data.about.experiences?.length ?? 0, "entries", Briefcase, `${P}/about`),
      countItem("Educations", data.about.educations?.length ?? 0, "entries", GraduationCap, `${P}/about`),
      countItem("Values", data.about.values?.length ?? 0, "listed", HeartHandshake, `${P}/about`),
    );
  }
  if (data.projectStats) {
    items.push(countItem("Projects", data.projectStats.total, "added", FolderKanban, `${P}/projects`));
  }
  if (data.skills) {
    const count = data.skills.reduce((sum, c) => sum + c.skills.length, 0);
    items.push(countItem("Skills", count, "added", BadgeCheck, `${P}/skills`));
  }
  if (data.serviceStats) {
    items.push(
      countItem("Services", data.serviceStats.total, "offered", BriefcaseBusiness, `${P}/services`),
    );
  }
  if (data.blogStats) {
    items.push(countItem("Published posts", data.blogStats.published, "live", FileText, `${P}/blog`));
  }
  if (data.faqs !== null && data.faqs !== undefined) {
    items.push(countItem("FAQs", data.faqs, "answered", MessageCircleQuestion, `${P}/contact`));
  }
  if (data.settings) {
    const profiles = data.settings.socials?.filter((s) => isProfileLink(s.href)).length ?? 0;
    items.push(countItem("Social profiles", profiles, "linked", Share2, `${P}/social-links`));

    const hasOrigin = Boolean(resolveSiteOrigin(data.settings.seo?.siteUrl));
    const hasDescription = Boolean(data.settings.seo?.defaultMetaDescription?.trim());
    items.push(
      {
        label: "Site URL",
        ok: hasOrigin,
        detail: hasOrigin ? "Set" : "Not set",
        icon: Globe,
        to: `${P}/seo`,
      },
      {
        label: "SEO description",
        ok: hasDescription,
        detail: hasDescription ? "Set" : "Not set",
        icon: Search,
        to: `${P}/seo`,
      },
    );
  }

  const done = items.filter((item) => item.ok).length;
  const sections = [
    data.about,
    data.projectStats,
    data.skills,
    data.serviceStats,
    data.blogStats,
    data.faqs,
    data.settings,
  ];

  return {
    items,
    done,
    score: items.length ? Math.round((done / items.length) * 100) : 0,
    incomplete: sections.some((section) => section === null),
  };
}

/** Things worth doing now. Inbox items are added live on the client. */
export function buildAttention(data: DashboardHomeData, health: Health): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (data.blogStats) {
    const drafts = data.blogStats.total - data.blogStats.published;
    if (drafts > 0) {
      items.push({
        key: "drafts",
        label: `${drafts} draft ${drafts === 1 ? "post" : "posts"} not published`,
        detail: "Finish or remove",
        to: "/dashboard/pages/blog",
      });
    }
  }

  const fake = data.settings?.socials?.filter((s) => !isProfileLink(s.href)).length ?? 0;
  if (fake > 0) {
    items.push({
      key: "fake-socials",
      label: `${fake} social ${fake === 1 ? "link goes" : "links go"} to a home page`,
      detail: "Use your profile link",
      to: "/dashboard/pages/social-links",
    });
  }

  for (const item of health.items) {
    if (!item.ok) {
      items.push({
        key: item.label,
        label: `${item.label}: ${item.detail.toLowerCase()}`,
        detail: "Add it",
        to: item.to,
      });
    }
  }

  return items;
}
