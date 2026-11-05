"use client";

import {
  ArrowUpRight,
  FileText,
  FolderKanban,
  Inbox,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import type { Section } from "@/lib/services/dashboard-home.service";
import type { InboxStats } from "@/lib/types/message";
import { useInboxStats } from "./useInboxStats";

const UNKNOWN = { value: "—", context: "Could not load" };

function Tile({
  label,
  value,
  context,
  icon: Icon,
  tint,
  to,
}: {
  label: string;
  value: string | number;
  context: string;
  icon: LucideIcon;
  tint: string;
  to: string;
}) {
  return (
    <a
      href={to}
      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
    >
      <span className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tint}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{label}</span>
        <ArrowUpRight className="ml-auto hidden h-3.5 w-3.5 shrink-0 sm:block text-zinc-300 transition-colors group-hover:text-indigo-500 dark:text-zinc-600" />
      </span>
      <span className="text-3xl font-bold leading-none tabular-nums text-zinc-900 dark:text-white">
        {value}
      </span>
      <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
        {context}
      </span>
    </a>
  );
}

export function KpiTiles({
  inbox,
  posts,
  projects,
  health,
}: {
  inbox: Section<InboxStats>;
  posts: Section<{ published: number; total: number }>;
  projects: Section<{ total: number; featured: number }>;
  health: { score: number; done: number; total: number; incomplete: boolean };
}) {
  const { stats } = useInboxStats(inbox);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {inbox !== undefined && (
        <Tile
          label="Unread messages"
          icon={Inbox}
          tint="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
          to="/dashboard/pages/messages"
          {...(stats
            ? {
                value: stats.unread,
                context: `${stats.awaitingReply} awaiting reply · ${stats.total} total`,
              }
            : UNKNOWN)}
        />
      )}
      {posts !== undefined && (
        <Tile
          label="Published posts"
          icon={FileText}
          tint="bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400"
          to="/dashboard/pages/blog"
          {...(posts
            ? {
                value: posts.published,
                context: `${posts.total - posts.published} ${posts.total - posts.published === 1 ? "draft" : "drafts"}`,
              }
            : UNKNOWN)}
        />
      )}
      {projects !== undefined && (
        <Tile
          label="Projects"
          icon={FolderKanban}
          tint="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          to="/dashboard/pages/projects"
          {...(projects
            ? { value: projects.total, context: `${projects.featured} featured` }
            : UNKNOWN)}
        />
      )}
      {health.total > 0 && (
        <Tile
          label="Portfolio health"
          icon={ShieldCheck}
          tint="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
          to="#portfolio-health"
          value={`${health.score}%`}
          context={
            health.incomplete
              ? `${health.done} of ${health.total} ready · some not loaded`
              : `${health.done} of ${health.total} ready`
          }
        />
      )}
    </div>
  );
}
