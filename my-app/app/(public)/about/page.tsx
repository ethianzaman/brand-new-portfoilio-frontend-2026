import { AboutHero } from "@/app/components/about/AboutHero";
import { AboutExperience } from "@/app/components/about/AboutExperience";
import { AboutEducation } from "@/app/components/about/AboutEducation";
import { AboutValues } from "@/app/components/about/AboutValues";
import Reveal from "@/app/components/motion/Reveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAbout } from "@/lib/api/about";
import { getHeroData } from "@/lib/api/hero";
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
  const [about, home] = await Promise.all([
    getAbout(),
    // The cards are optional, so the page still renders without them.
    getHeroData().catch(() => null),
  ]);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Hero (the "About Me" label now lives inside it) */}
        <AboutHero data={about.hero} stats={home?.stats ?? []} />

        {/* Experience */}
        <AboutExperience experiences={about.experiences} />

        {/* Education */}
        <AboutEducation educations={about.educations} />

        {/* Values */}
        <AboutValues values={about.values} />

        {/* CTA */}
        <Reveal>
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
              className="btn-shine group flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-indigo-600 hover:bg-indigo-500
                         text-white font-medium text-sm
                         transition-all duration-150 hover:scale-105 shrink-0"
            >
              Get in touch
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
