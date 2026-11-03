import { User } from "lucide-react";
import { AboutHero } from "@/app/components/about/AboutHero";
import { AboutExperience } from "@/app/components/about/AboutExperience";
import { AboutEducation } from "@/app/components/about/AboutEducation";
import { AboutValues } from "@/app/components/about/AboutValues";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAbout } from "@/lib/api/about";
import { getSiteSettings } from "@/lib/api/settings";
import { getPageSeo } from "@/lib/api/seo";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSeo("about"),
  ]);

  return buildMetadata({
    path: "/about",
    title: "About",
    description:
      "Full Stack Developer with 3+ years experience building scalable web applications.",
    seo,
    siteSeo: settings.seo,
  });
}

export default async function AboutPage() {
  // Cached 60s under tag "about"; last-good-on-failure; demo data on build.
  const about = await getAbout();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Page label */}
        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-10 h-10 rounded-xl
                          bg-indigo-50 dark:bg-indigo-950
                          flex items-center justify-center"
          >
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span
            className="text-sm font-medium uppercase tracking-wider
                           text-indigo-600 dark:text-indigo-400"
          >
            About Me
          </span>
        </div>

        {/* Hero */}
        <AboutHero data={about.hero} />

        {/* Experience */}
        <AboutExperience experiences={about.experiences} />

        {/* Education */}
        <AboutEducation educations={about.educations} />

        {/* Values */}
        <AboutValues values={about.values} />

        {/* CTA */}
        <div
          className="rounded-2xl bg-zinc-900 dark:bg-zinc-800
                        p-8 sm:p-10 md:p-14
                        flex flex-col md:flex-row
                        items-center justify-between gap-6"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Want to work together?
            </h2>
            <p className="text-zinc-400 max-w-md leading-relaxed">
              I&apos;m always open to interesting projects and new challenges.
              Let&apos;s have a conversation.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-indigo-600 hover:bg-indigo-500
                       text-white font-medium text-sm
                       transition-all duration-150 hover:scale-105 shrink-0"
          >
            Get in touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
