import { ExternalLink, Inbox } from "lucide-react";
import {
  dashboardGetProjectsAll,
  dashboardGetProjectStats,
} from "@/lib/services/project.services";
import { dashboardGetSkills } from "@/lib/services/skill.services";
import {
  dashboardGetServiceStats,
} from "@/lib/services/service.services";
import { dashboardGetAbout } from "@/lib/services/about.services";
import { dashboardGetContact } from "@/lib/services/contact.services";
import {
  dashboardGetBlogStats,
} from "@/lib/services/blog.services";
import { dashboardGetMessages } from "@/lib/services/message.services";
import { fetchCurrentUser } from "@/lib/services/current-user.service";
import { ROLE_LABELS } from "@/lib/types/user";
import { OverviewStats } from "./home/OverviewStats";
import { ProjectsChart } from "./home/ProjectsChart";
import { SkillsDonut } from "./home/SkillsDonut";
import { RecentProjects } from "./home/RecentProjects";
import { PortfolioHealth } from "./home/PortfolioHealth";
import { BlogAnalytics } from "./home/BlogAnalytics";
import { InboxOverview } from "./home/InboxOverview";

/** How many recent entries the "Recent Projects" card shows. */
const RECENT_LIMIT = 5;

export default async function DashBoardHome() {
  // The counters come from dedicated aggregation endpoints (one pass over the
  // collection on the server) instead of downloading every document to count
  // it in the browser. Only the "recent" cards fetch actual rows.
  const [
    projectStats,
    recentProjects,
    skillCategories,
    serviceStats,
    about,
    contact,
    blogStats,
    inbox,
    currentUser,
  ] = await Promise.all([
    dashboardGetProjectStats(),
    dashboardGetProjectsAll({
      page: 1,
      pageSize: RECENT_LIMIT,
      sort: "createdAt",
      dir: "desc",
    }),
    dashboardGetSkills(),
    dashboardGetServiceStats(),
    dashboardGetAbout().catch(() => null),
    dashboardGetContact().catch(() => null),
    dashboardGetBlogStats(),
    dashboardGetMessages({ limit: 5 }).catch(() => ({
      messages: [],
      total: 0,
      unread: 0,
    })),
    fetchCurrentUser(),
  ]);

  const skills = skillCategories.reduce((sum, c) => sum + c.skills.length, 0);
  const categoryCounts = projectStats.byCategory;

  const experiences = about?.experiences.length ?? 0;
  const educations = about?.educations.length ?? 0;
  const values = about?.values.length ?? 0;
  const faqs = contact?.faqs.length ?? 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  // The greeting follows whoever is signed in — Admin, Manager or Editor.
  const roleLabel = currentUser ? ROLE_LABELS[currentUser.role] : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {greeting}
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            {roleLabel ? `Welcome back, ${roleLabel}` : "Welcome back"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {date} · Here&apos;s your portfolio at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/dashboard/pages/messages"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <Inbox className="w-4 h-4" />
            <span className="hidden sm:inline">Open Inbox</span>
            {inbox.unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums">
                {inbox.unread}
              </span>
            )}
          </a>
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">View Live Site</span>
            <span className="sm:hidden">Live</span>
          </a>
        </div>
      </div>

      {/* Application KPIs — content, engagement & reach */}
      <OverviewStats
        projects={projectStats.total}
        featured={projectStats.featured}
        skills={skills}
        skillGroups={skillCategories.length}
        services={serviceStats.total}
        experiences={experiences}
        educations={educations}
        faqs={faqs}
        posts={blogStats.total}
        publishedPosts={blogStats.published}
        messages={inbox.total}
        unread={inbox.unread}
      />

      {/* Health & content analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PortfolioHealth
          hasHero={Boolean(about?.hero)}
          projects={projectStats.total}
          skills={skills}
          services={serviceStats.total}
          experiences={experiences}
          educations={educations}
          values={values}
          faqs={faqs}
          posts={blogStats.total}
        />
        <ProjectsChart
          counts={categoryCounts}
          total={projectStats.total}
        />
        <SkillsDonut categories={skillCategories} />
      </div>

      {/* Engagement & activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <InboxOverview
          messages={inbox.messages}
          total={inbox.total}
          unread={inbox.unread}
        />
        <BlogAnalytics stats={blogStats} />
        <RecentProjects projects={recentProjects.projects} />
      </div>
    </div>
  );
}
