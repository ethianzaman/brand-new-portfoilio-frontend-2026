import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Download,
  Mail,
  Code2,
  Database,
  Globe,
  ImageIcon,
  Terminal,
  Cpu,
  Smartphone,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
} from "@/app/components/icon/brandIcons";
import { getHeroData } from "@/lib/api/home";
import { getSkills } from "@/lib/api/skills";
import HeroTypewriter from "@/app/components/HeroTypeWritter";
import type { SkillCategory } from "@/lib/types/skill";

// Dynamic Icon Mapping Category Name basis-e
const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  frontend: Globe,
  backend: Code2,
  database: Database,
  devops: Terminal,
  mobile: Smartphone,
  "big data": Cpu,
};

const socialIcons: Record<string, ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
};

export default async function HomePage() {
  // ── TWO lines per public page from now on ─────────────────────────────
  // 60s ISR + tag "home", 5s timeout, last-good-on-failure, demo data on build.
  const data = await getHeroData();
  const hero = data.hero;

  const skillsData: SkillCategory[] = await getSkills();

  // const resumeHref = /^https?:\/\//i.test(hero.resumeUrl)
  //   ? `/api/download?url=${encodeURIComponent(hero.resumeUrl)}`
  //   : hero.resumeUrl;

  const resumeHref = hero.resumeUrl;

  // Filter categories that actually have skills inside them
  const activeSkillCategories = skillsData.filter(
    (cat) => cat.skills && cat.skills.length > 0,
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* ── Hero Section ── */}
      <section className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-14 md:pb-20">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-8">
          {/* Left: Content */}
          <div className="flex flex-col items-start gap-6 flex-1 max-w-2xl">
            {/* Availability Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Available for work
            </span>

            {/* Headline with Typewriter */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
                Hi, I&apos;m{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {hero.name}
                </span>
              </h1>

              {/* Fixed Prefix + Dynamic Typing Text */}
              <div className="flex flex-wrap items-center gap-x-2 text-xl sm:text-2xl font-semibold text-zinc-500 dark:text-zinc-400">
                <span>{hero.title}</span>
                <span className="text-zinc-400">|</span>
                <HeroTypewriter titles={hero.titles ?? []} />
              </div>
            </div>

            {/* Bio */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {hero.bio}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <Link href="/projects">
                  View Projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/contact">
                  <Mail className="w-4 h-4" /> Hire Me
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="gap-2 text-zinc-600 dark:text-zinc-400"
              >
                <a href={resumeHref} download>
                  <Download className="w-4 h-4" /> Resume
                </a>
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Find me on</span>
              {hero.socials.map(({ href, label }) => {
                const Icon = socialIcons[label?.toLowerCase()] ?? Globe;
                return (
                  <a
                    key={href || label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150 hover:scale-110"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right: Visual Section */}
          <div className="shrink-0 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
            <div className="relative w-full h-full">
              {/* Decorative spinning ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-800 animate-[spin_10s_linear_infinite]" />

              {/* Inner Circle Border */}
              <div className="absolute inset-3 rounded-full border-2 border-indigo-100 dark:border-indigo-900" />

              {/* Profile Image Container */}
              <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-white dark:border-zinc-700 shadow-xl shadow-indigo-100 dark:shadow-indigo-950 bg-indigo-50 dark:bg-indigo-950">
                {hero.image ? (
                  <Image
                    src={hero.image}
                    alt={hero.name}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-10 h-10 text-indigo-300 dark:text-indigo-700" />
                    <span className="text-xs font-medium text-indigo-300 dark:text-indigo-700">
                      Photo
                    </span>
                  </div>
                )}
              </div>

              {/* Floating Badges */}
              <div className="absolute top-2 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Open to work
                </span>
              </div>

              {data.stats[0] && (
                <div className="absolute bottom-4 -left-2 px-3 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    {data.stats[0].value}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {data.stats[0].label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics Section ── */}
      <section className="border-y border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-1"
              >
                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {value}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dynamic Skills Section ── */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">
            What I work with
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Technologies and tools I use to bring ideas to life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {activeSkillCategories.map((category) => {
            const Icon = categoryIcons[category.label.toLowerCase()] ?? Layers;

            return (
              <div
                key={category.id || category.label}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    {category.label}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skillItem, idx) => (
                    <span
                      key={`${category.id}-${skillItem.name}-${idx}`}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {skillItem.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Contact CTA Section ── */}
      <section className="max-w-6xl mx-auto px-4 pb-14 md:pb-20">
        <div className="rounded-2xl p-8 sm:p-10 md:p-14 bg-indigo-600 dark:bg-indigo-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Have a project in mind?
            </h2>
            <p className="text-indigo-200">
              Let&apos;s work together and build something great.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold gap-2"
          >
            <Link href="/contact">
              Get in touch <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
