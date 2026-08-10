import { ExternalLink } from "lucide-react";
import { dashboardGetProjectsAll } from "@/lib/services/project.services";
import { dashboardGetSkills } from "@/lib/services/skill.services";
import { dashboardGetServices } from "@/lib/services/service.services";
import { dashboardGetAbout } from "@/lib/services/about.services";
import { dashboardGetContact } from "@/lib/services/contact.services";
import { dashboardGetBlogPosts } from "@/lib/services/blog.services";
import { OverviewStats } from "./home/OverviewStats";
import { ProjectsChart } from "./home/ProjectsChart";
import { SkillsDonut } from "./home/SkillsDonut";
import { RecentProjects } from "./home/RecentProjects";
import { ContentHealth } from "./home/ContentHealth";

export default async function DashBoardHome() {
  const [projects, skillCategories, services, about, contact, blogPosts] =
    await Promise.all([
      dashboardGetProjectsAll(),
      dashboardGetSkills(),
      dashboardGetServices(),
      dashboardGetAbout().catch(() => null),
      dashboardGetContact().catch(() => null),
      dashboardGetBlogPosts(),
    ]);

  const skills = skillCategories.reduce((sum, c) => sum + c.skills.length, 0);
  const featured = projects.filter((p) => p.featured).length;

  const categoryCounts: Record<string, number> = {};
  for (const p of projects) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }

  const experiences = about?.experiences.length ?? 0;
  const educations = about?.educations.length ?? 0;
  const values = about?.values.length ?? 0;
  const faqs = contact?.faqs.length ?? 0;

  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{date}</p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            Welcome back, Admin
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
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

      {/* Total portfolio overview */}
      <OverviewStats
        projects={projects.length}
        featured={featured}
        skills={skills}
        services={services.length}
        experiences={experiences}
        educations={educations}
        faqs={faqs}
        posts={blogPosts.length}
      />

      {/* Analytics — side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProjectsChart counts={categoryCounts} total={projects.length} />
        <SkillsDonut categories={skillCategories} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentProjects projects={projects} />
        </div>
        <ContentHealth
          hasHero={Boolean(about?.hero)}
          experiences={experiences}
          educations={educations}
          values={values}
          faqs={faqs}
          posts={blogPosts.length}
        />
      </div>
    </div>
  );
}