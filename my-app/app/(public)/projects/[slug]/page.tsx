import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, ImageIcon } from "lucide-react";

import { GithubIcon } from "@/app/components/icon/BrandIcons";
import Reveal from "@/app/components/motion/Reveal";
import { ProjectCard } from "@/app/components/projects/ProjectCard";
import { ImageCarousel } from "@/app/components/media/ImageCarousel";
import { JsonLd } from "@/app/components/seo/JsonLd";
import { getProjectBySlug, getProjects } from "@/lib/api/projects";
import { getSiteSettings } from "@/lib/api/settings";
import { getSkills } from "@/lib/api/skills";
import { CATEGORIES } from "@/lib/constants/project";
import { resizedImageUrl } from "@/lib/images";
import { projectJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { PROJECT_STATUS_LABELS } from "@/lib/types/project";

type Props = {
  params: Promise<{ slug: string }>;
};

const RELATED_LIMIT = 3;

const isWebLink = (url?: string) => Boolean(url && /^https?:\/\//i.test(url));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings(),
  ]);

  if (!project || project.isPlaceholder) return { title: "Project not found" };

  return buildMetadata({
    path: `/projects/${project.slug}`,
    title: project.title,
    description: project.description,
    seo: project.seo,
    siteSeo: settings.seo,
    fallbackImage: project.thumbnail,
    type: "article",
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // A "coming soon" card has nothing to show on a page of its own.
  if (!project || project.isPlaceholder) notFound();

  const [settings, sameCategory, skillCategories] = await Promise.all([
    getSiteSettings(),
    getProjects({
      category: project.category,
      page: 1,
      pageSize: RELATED_LIMIT + 1,
    }),
    getSkills(),
  ]);

  const related = sameCategory.projects
    .filter((p) => p.id !== project.id && !p.isPlaceholder)
    .slice(0, RELATED_LIMIT);

  const category = CATEGORIES.find((c) => c.value === project.category)?.label;
  const status = project.status ? PROJECT_STATUS_LABELS[project.status] : null;

  // A tag named like a skill borrows that skill's icon.
  const skillIcons = new Map(
    skillCategories.flatMap((c) => c.skills).map((s) => [s.name.trim().toLowerCase(), s.icon]),
  );

  const cardImages = [project.thumbnail, ...(project.images ?? [])].filter((src): src is string => Boolean(src));
  const features = project.features?.filter(Boolean) ?? [];
  const gallery = project.gallery?.filter(Boolean) ?? [];
  const sections = [
    { id: "goal", title: "The goal", text: project.goal },
    { id: "approach", title: "How it's built", text: project.approach },
    { id: "challenges", title: "Challenges & solutions", text: project.challenges },
    { id: "outcome", title: "Outcome", text: project.outcome },
  ].filter((s) => s.text?.trim());
  const facts = [
    { label: "Category", value: category },
    { label: "My role", value: project.role },
    { label: "Year", value: project.year },
    { label: "Status", value: status },
  ].filter((f) => f.value);
  const hasStory = sections.length > 0 || features.length > 0 || gallery.length > 0;

  const links = (
    <>
      {isWebLink(project.liveUrl) && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          <ExternalLink className="h-4 w-4" />
          Live Demo
        </a>
      )}
      {isWebLink(project.githubUrl) && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
        >
          <GithubIcon className="h-4 w-4" />
          GitHub
        </a>
      )}
    </>
  );

  const techStack = project.tags.length > 0 && (
    <SidebarCard title="Tech stack">
            <ul className="flex flex-wrap gap-2">
              {project.tags.map((tag) => {
                const icon = skillIcons.get(tag.trim().toLowerCase());
                return (
                  <li
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={icon} alt="" className="h-4 w-4 object-contain" />
                    )}
                    {tag}
                  </li>
                );
              })}
            </ul>
    </SidebarCard>
  );
  const projectInfo = facts.length > 0 && (
    <SidebarCard title="Project info">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs text-zinc-400 dark:text-zinc-500">{f.label}</dt>
                  <dd className="mt-0.5 font-medium text-zinc-800 dark:text-zinc-200">{f.value}</dd>
                </div>
              ))}
            </dl>
    </SidebarCard>
  );

  return (
    <div className="min-h-screen">
      <JsonLd
        data={projectJsonLd({
          title: project.title,
          description: project.description,
          path: `/projects/${project.slug}`,
          image: project.thumbnail,
          keywords: project.tags,
          siteSeo: settings.seo,
        })}
      />

      <article className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* ── Header: tech stack sits beside it when there is no case study ── */}
        <div
          className={
            hasStory
              ? "max-w-3xl"
              : "grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14"
          }
        >
          <div>
            <Reveal>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              >
                <ArrowLeft className="h-4 w-4" />
                All projects
              </Link>
            </Reveal>
  
            <Reveal delay={100} className="mt-8 flex flex-wrap items-center gap-2">
              {category && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {category}
                </span>
              )}
              {project.featured && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Featured
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {project.status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
                  {status}
                </span>
              )}
            </Reveal>
  
            <Reveal delay={200}>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-white">
                {project.title}
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-zinc-600 md:text-lg dark:text-zinc-400">
                {project.description}
              </p>
            </Reveal>

            <Reveal delay={350} className="mt-7 flex flex-wrap gap-3">
              {links}
            </Reveal>
          </div>

          {!hasStory && (techStack || projectInfo) && (
            <Reveal delay={300} className="flex flex-col gap-6">
              {techStack}
              {projectInfo}
            </Reveal>
          )}
        </div>

        {/* ── Main image ── */}
        <Reveal delay={400} className="mt-12">
          <div
            className="overflow-hidden rounded-2xl border border-zinc-200 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:shadow-none"
            style={{ borderTop: `6px solid ${project.color}` }}
          >
            {cardImages.length > 0 ? (
              <div className="aspect-video w-full">
                <ImageCarousel images={cardImages} alt={project.title} width={1600} interval={4500} priority />
              </div>
            ) : (
              <div
                className="flex aspect-video w-full items-center justify-center"
                style={{ backgroundColor: `${project.color}15` }}
              >
                <ImageIcon className="h-10 w-10" style={{ color: `${project.color}80` }} />
              </div>
            )}
          </div>
        </Reveal>

        {/* ── Case study and sidebar ── */}
        {hasStory && (
          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <aside className="order-first lg:order-last">
              <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                {techStack}
                {projectInfo}
                {(isWebLink(project.liveUrl) || isWebLink(project.githubUrl)) && (
                  <div className="hidden flex-col gap-2 lg:flex">{links}</div>
                )}
              </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-12">
              {sections.slice(0, 1).map((s) => (
                <StorySection key={s.id} title={s.title}>
                  <Prose text={s.text!} />
                </StorySection>
              ))}

              {features.length > 0 && (
                <StorySection title="Key features">
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: project.color }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </StorySection>
              )}

              {sections.slice(1).map((s) => (
                <StorySection key={s.id} title={s.title}>
                  <Prose text={s.text!} />
                </StorySection>
              ))}

              {gallery.length > 0 && (
                <StorySection title="Screenshots">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {gallery.map((url, i) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open screenshot ${i + 1} full size`}
                        className="group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resizedImageUrl(url, 960)}
                          alt={`${project.title} screenshot ${i + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                </StorySection>
              )}
            </div>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
          <Reveal>
            <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
              {category ? `More ${category} projects` : "More projects"}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 90}>
                <ProjectCard project={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StorySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal>
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 md:text-2xl dark:text-white">
          {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

/** Text from the dashboard: a blank line starts a new paragraph. */
function Prose({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      {children}
    </div>
  );
}
