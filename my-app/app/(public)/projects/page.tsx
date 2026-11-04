import { Suspense } from "react";
import { SectionHeader } from "@/app/components/SectionHeader";
import { Briefcase } from "lucide-react";
import { getProjects } from "@/lib/api/projects";
import { PAGE_SIZE } from "@/lib/constants/project";
import { ProjectsGrid } from "@/app/components/projects/ProjectsGrid";
import { ProjectsSkeleton } from "@/app/components/projects/ProjectsSkeleton";
import { getSiteSettings } from "@/lib/api/settings";
import { getPageSeo } from "@/lib/api/seo";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSeo("projects"),
  ]);

  return buildMetadata({
    path: "/projects",
    title: "Projects",
    description:
      "Showcase of frontend, fullstack, backend and mobile projects.",
    seo,
    siteSeo: settings.seo,
  });
}

export default async function ProjectsPage() {
  // Cached 60s under tag "projects"; last-good-on-failure; demo data on build.
  const initialData = await getProjects({
    category: "all",
    page: 1,
    pageSize: PAGE_SIZE,
  });


  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <SectionHeader
          className="mb-10"
          descriptionClassName="mb-8 max-w-2xl"
          icon={Briefcase}
          socialPlacement="projects"
          eyebrow="My Work"
          title="Projects"
          description="A collection of things I've built — from quick experiments to full production apps. Filter by category to explore."
        />

        <Suspense fallback={<ProjectsSkeleton />}>
          <ProjectsGrid initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}
