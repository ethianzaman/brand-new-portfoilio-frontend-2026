import { ExternalLink, FileText, FolderKanban, Layers } from "lucide-react";

import { CATEGORIES } from "@/lib/constants/project";
import { fetchCurrentUser } from "@/lib/services/current-user.service";
import { loadDashboardHome } from "@/lib/services/dashboard-home.service";
import { ROLE_LABELS } from "@/lib/types/user";
import { BreakdownCard, type BreakdownRow } from "./_overview/Breakdown";
import { PROJECT_CATEGORY_COLORS } from "./_overview/chart-colors";
import { buildAttention, buildHealth } from "./_overview/health";
import { InboxOverview } from "./_overview/InboxOverview";
import { InboxTrend } from "./_overview/InboxTrend";
import { KpiTiles } from "./_overview/KpiTiles";
import { LeadBudgets } from "./_overview/LeadBudgets";
import { NeedsAttention } from "./_overview/NeedsAttention";
import { OpenInboxLink } from "./_overview/OpenInboxLink";
import { PortfolioHealth } from "./_overview/PortfolioHealth";
import { RecentProjects } from "./_overview/RecentProjects";

function fromCounts(
  counts: Record<string, number> | undefined,
  label: (key: string) => string = (key) => key,
  color?: (key: string) => string | undefined,
): BreakdownRow[] {
  return Object.entries(counts ?? {})
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ label: label(key), count, color: color?.(key) }));
}

const projectLabel = (key: string) =>
  CATEGORIES.find((c) => c.value === key)?.label ?? key;

export default async function DashBoardHome() {
  const currentUser = await fetchCurrentUser();
  const data = await loadDashboardHome(currentUser?.permissions ?? []);

  const health = buildHealth(data);
  const attention = buildAttention(data, health);

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

  // The greeting follows whoever is signed in.
  const roleLabel = currentUser ? ROLE_LABELS[currentUser.role] : undefined;

  const canSeeInbox = data.inbox !== undefined;
  const hasAnything =
    canSeeInbox ||
    health.items.length > 0 ||
    data.projectStats !== undefined ||
    data.blogStats !== undefined;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Welcome header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {greeting}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {roleLabel ? `Welcome back, ${roleLabel}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          {canSeeInbox && <OpenInboxLink inbox={data.inbox} />}
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">View Live Site</span>
            <span className="sm:hidden">Live</span>
          </a>
        </div>
      </div>

      {!hasAnything ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Your role has no overview data. Use the menu to open your sections.
        </p>
      ) : (
        <>
          <KpiTiles
            inbox={data.inbox}
            posts={data.blogStats}
            projects={data.projectStats}
            health={{
              score: health.score,
              done: health.done,
              total: health.items.length,
              incomplete: health.incomplete,
            }}
          />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
            {canSeeInbox && (
              <div className="xl:col-span-2">
                <InboxTrend inbox={data.inbox} />
              </div>
            )}
            <NeedsAttention items={attention} inbox={data.inbox} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
            {health.items.length > 0 && <PortfolioHealth health={health} />}
            {canSeeInbox && (
              <InboxOverview inbox={data.inbox} messages={data.recentMessages} />
            )}
            {data.recentProjects !== undefined && (
              <RecentProjects projects={data.recentProjects} />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 2xl:grid-cols-4">
            {data.projectStats !== undefined && (
              <BreakdownCard
                icon={FolderKanban}
                title="Projects by category"
                subtitle="Everything in your portfolio"
                rows={
                  data.projectStats &&
                  fromCounts(
                    data.projectStats.byCategory,
                    projectLabel,
                    (key) => PROJECT_CATEGORY_COLORS[key],
                  )
                }
                empty="No projects yet"
              />
            )}
            {data.blogStats !== undefined && (
              <BreakdownCard
                icon={FileText}
                title="Blog posts by category"
                subtitle="Published and drafts"
                rows={data.blogStats && fromCounts(data.blogStats.byCategory)}
                empty="No blog posts yet"
              />
            )}
            {data.skills !== undefined && (
              <BreakdownCard
                icon={Layers}
                title="Skills by category"
                subtitle="Skills in each group"
                rows={
                  data.skills &&
                  data.skills
                    .filter((c) => c.skills.length > 0)
                    .map((c) => ({ label: c.label, count: c.skills.length }))
                }
                empty="No skills yet"
              />
            )}
            {canSeeInbox && <LeadBudgets inbox={data.inbox} />}
          </div>
        </>
      )}
    </div>
  );
}
