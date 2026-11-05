import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  Mail,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialIcon } from "@/app/components/brand/SocialIcon";
import type { HeroContent, HeroStat } from "@/lib/types/hero";
import type { SiteSocial } from "@/lib/types/settings";
import HeroTypewriter from "./HeroTypewriter";

const enter = (ms: number) => ({ animationDelay: `${ms}ms` });

export default function HeroIntro({
  hero,
  topStat,
  socials,
}: {
  hero: HeroContent;
  topStat?: HeroStat;
  socials: SiteSocial[];
}) {
  return (
    // The grid + aurora come from the shared SiteBackground in the public
    // layout, so every page/section gets the same look for free.
    <section className="relative isolate">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="flex flex-col-reverse items-center justify-between gap-12 md:flex-row md:gap-8">
          {/* Left: content */}
          <div className="flex max-w-2xl flex-1 flex-col items-start gap-6">
            <span
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-sm font-medium text-indigo-600 backdrop-blur dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
              style={enter(0)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Available for work
            </span>

            <div className="flex flex-col gap-3">
              <h1
                className="animate-fade-up text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white"
                style={enter(100)}
              >
                Hi, I&apos;m {" "}
                <span className="animate-gradient-pan bg-linear-to-r from-indigo-600 via-sky-500 to-indigo-600 bg-size-[200%_auto] bg-clip-text text-transparent">
                  {hero.name}
                </span>
              </h1>

              <div
                className="animate-fade-up flex flex-wrap items-center gap-x-2 text-xl font-semibold text-zinc-500 sm:text-2xl dark:text-zinc-400"
                style={enter(200)}
              >
                <span>{hero.title}</span>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <HeroTypewriter titles={hero.titles ?? []} />
              </div>
            </div>

            <p
              className="animate-fade-up text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400"
              style={enter(300)}
            >
              {hero.bio}
            </p>

            <div
              className="animate-fade-up flex flex-wrap gap-3"
              style={enter(400)}
            >
              <Button
                asChild
                size="lg"
                className="btn-shine gap-2 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30"
              >
                <Link href="/projects">
                  View Projects
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 bg-white/60 backdrop-blur transition-all hover:-translate-y-0.5 dark:bg-zinc-900/60"
              >
                <Link href="/contact">
                  <Mail className="h-4 w-4" /> Hire Me
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="gap-2 text-zinc-600 dark:text-zinc-400"
              >
                <a href={hero.resumeUrl} download>
                  <Download className="h-4 w-4" /> Resume
                </a>
              </Button>
            </div>

            {socials.length > 0 && (
            <div
              className="animate-fade-up flex items-center gap-3"
              style={enter(500)}
            >
              <span className="text-sm text-zinc-400">Find me on</span>
              {socials.map(({ id, href, label, icon, imageUrl }) => {
                return (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="rounded-xl border border-transparent p-2 text-zinc-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-400 dark:hover:border-indigo-900 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                  >
                    <SocialIcon icon={icon} imageUrl={imageUrl} className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            )}
          </div>

          {/* Right: portrait */}
          {/* Right: Visual Section */}
          <div className="shrink-0 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
            <div className="relative w-full h-full">
              {/* Decorative spinning ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-800 animate-[spin_10s_linear_infinite] motion-reduce:animate-none" />

              {/* Inner Circle Border */}
              <div className="absolute inset-3 rounded-full border-2 border-indigo-100 dark:border-indigo-900" />

              {/* Profile Image Container */}
              <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-white dark:border-zinc-700 shadow-xl shadow-indigo-100 dark:shadow-indigo-950 bg-indigo-50 dark:bg-indigo-950">
                {hero.image ? (
                  <Image
                    src={hero.image}
                    alt={hero.name}
                    fill
                    sizes="(min-width: 1024px) 320px, 288px"
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

              {topStat && (
                <div className="absolute bottom-4 -left-2 px-3 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    {topStat.value}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {topStat.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
