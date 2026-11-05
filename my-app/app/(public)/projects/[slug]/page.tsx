import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ImageIcon } from "lucide-react";

import { GithubIcon } from "@/app/components/icon/BrandIcons";
import Reveal from "@/app/components/motion/Reveal";
import { ProjectCard } from "@/app/components/projects/ProjectCard";
import { JsonLd } from "@/app/components/seo/JsonLd";
import { getProjectBySlug, getProjects } from "@/lib/api/projects";
import { getSiteSettings } from "@/lib/api/settings";
import { CATEGORIES } from "@/lib/constants/project";
import { resizedImageUrl } from "@/lib/images";
import { projectJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

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

  const [settings, sameCategory] = await Promise.all([
    getSiteSettings(),
    getProjects({
      category: project.category,
      page: 1,
      pageSize: RELATED_LIMIT + 1,
    }),
  ]);

  const related = sameCategory.projects
    .filter((p) => p.id !== project.id && !p.isPlaceholder)
    .slice(0, RELATED_LIMIT);

  const category = CATEGORIES.find((c) => c.value === project.category)?.label;

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

      <article className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <Reveal>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex flex-wrap items-center gap-3">
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
        </Reveal>

        <Reveal delay={200}>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-white">
            {project.title}
          </h1>
        </Reveal>

        <Reveal delay={300}>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 md:text-lg dark:text-zinc-400">
            {project.description}
          </p>
        </Reveal>

        <Reveal delay={350} className="mt-6 flex flex-wrap gap-3">
          {isWebLink(project.liveUrl) && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
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
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          )}
        </Reveal>

        <Reveal delay={400} className="mt-10">
          <div
            className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
            style={{ borderTop: `6px solid ${project.color}` }}
          >
            {project.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resizedImageUrl(project.thumbnail, 1200)}
                alt={project.title}
                decoding="async"
                className="aspect-video w-full object-cover"
              />
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

        {project.tags.length > 0 && (
          <Reveal className="mt-10">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Built with
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>
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
