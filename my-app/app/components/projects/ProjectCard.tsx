import Link from "next/link";
import type { ReactNode } from "react";
import { Clock, ExternalLink, Eye, ImageIcon } from "lucide-react";
import { ImageCarousel } from "@/app/components/media/ImageCarousel";
import SpotlightCard from "@/app/components/motion/SpotlightCard";
import { GithubIcon } from "../icon/BrandIcons";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants/project";
import { Project } from "@/lib/types/project";

const isWebLink = (url?: string) => Boolean(url && /^https?:\/\//i.test(url));

export function ProjectCard({ project }: { project: Project }) {
  const isPlaceholder = project.isPlaceholder;
  const detailHref =
    project.slug && !isPlaceholder ? `/projects/${project.slug}` : null;
  const category = CATEGORIES.find((c) => c.value === project.category)?.label;
  const hasLive = isWebLink(project.liveUrl);
  const hasGithub = isWebLink(project.githubUrl);
  const images = [project.thumbnail, ...(project.images ?? [])].filter((src): src is string => Boolean(src));

  return (
    <SpotlightCard
      className={cn(
        "h-full rounded-2xl",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "transition-all duration-300",
        !isPlaceholder &&
          "hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/60 dark:hover:shadow-zinc-900/60",
        isPlaceholder && "opacity-60",
      )}
      contentClassName="flex h-full flex-col"
    >
      {/* Color top bar */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{ backgroundColor: project.color }}
      />

      {/* ── Image area ── */}
      <div className="relative w-full aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {images.length > 0 ? (
          <ImageCarousel
            images={images}
            alt={project.title}
            width={640}
            hoverScope=".spotlight-card"
            imageClassName="group-hover:scale-105 [transition:opacity_700ms_ease-in-out,transform_500ms]"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: `${project.color}15` }}
          >
            <ImageIcon
              className="w-8 h-8"
              style={{ color: `${project.color}60` }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: `${project.color}80` }}
            >
              Image coming soon
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div
              className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug">
              {detailHref ? (
                // Stretched over the whole card, so a click anywhere opens the
                // details. The action buttons sit above it.
                <Link
                  href={detailHref}
                  className="transition-colors after:absolute after:inset-0 after:z-10 group-hover:text-indigo-600 focus-visible:outline-none dark:group-hover:text-indigo-400"
                >
                  {project.title}
                </Link>
              ) : (
                project.title
              )}
            </h3>
          </div>

          {isPlaceholder && (
            <span
              className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full
                               bg-zinc-100 dark:bg-zinc-800
                               text-zinc-400 dark:text-zinc-500 text-xs font-medium"
            >
              <Clock className="w-3 h-3" />
              Soon
            </span>
          )}
        </div>

        {/* Long descriptions end in "…"; the project page shows all of it. */}
        <p
          className="flex-1 line-clamp-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium rounded-lg
                         bg-zinc-100 dark:bg-zinc-800
                         text-zinc-600 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {!isPlaceholder && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {[category, project.year].filter(Boolean).join(" · ")}
            </span>

            <div className="flex items-center gap-2">
              {detailHref && (
                <IconAction href={detailHref} label="View details">
                  <Eye className="h-4 w-4" />
                </IconAction>
              )}
              {hasGithub && (
                <IconAction href={project.githubUrl} label="GitHub" external>
                  <GithubIcon className="h-4 w-4" />
                </IconAction>
              )}
              {hasLive && (
                <IconAction href={project.liveUrl} label="Live Demo" external>
                  <ExternalLink className="h-4 w-4" />
                </IconAction>
              )}
            </div>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}

/** An icon button whose name shows above it on hover or keyboard focus. */
function IconAction({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: ReactNode;
}) {
  const className = cn(
    "group/action relative z-20 grid h-9 w-9 place-items-center rounded-xl border transition-all duration-200",
    "border-zinc-200 bg-white text-zinc-500 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600",
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-indigo-400",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
  );
  const tooltip = (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap",
        "rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-150",
        "group-hover/action:translate-y-0 group-hover/action:opacity-100 group-focus-visible/action:translate-y-0 group-focus-visible/action:opacity-100",
        "dark:bg-white dark:text-zinc-900",
      )}
    >
      {label}
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
        {children}
        {tooltip}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
      {tooltip}
    </Link>
  );
}
