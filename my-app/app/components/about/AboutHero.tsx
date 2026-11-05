import Image from 'next/image'
import Reveal from "@/app/components/motion/Reveal";
import { PageHeading } from "@/app/components/PageHeading";
import { SocialLinks } from "@/app/components/brand/SocialLinks";
import Link from 'next/link'
import {
  Download, Mail, MapPin,
  ImageIcon, ArrowRight,
} from 'lucide-react'
import { AboutHero as AboutHeroType } from '@/lib/types/about'
import type { HeroStat } from '@/lib/types/hero'

const CARD_CLASS = `bg-white dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-700
                    rounded-2xl px-4 py-3
                    shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950`

function StatCard({ stat, className }: { stat: HeroStat; className: string }) {
  return (
    <div className={`${className} ${CARD_CLASS}`}>
      <p className="text-xs text-zinc-400 mb-0.5">{stat.label}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
        {stat.value}
      </p>
    </div>
  )
}

export function AboutHero({
  data,
  stats,
}: {
  data: AboutHeroType
  /** The stats edited on the dashboard's Hero page. */
  stats: HeroStat[]
}) {
  const projects = stats.find((s) => /project/i.test(s.label));
  const clients = stats.find((s) => /client/i.test(s.label));
  const hasResume = Boolean(data.resumeUrl);
  const resumeHref = /^https?:\/\//i.test(data.resumeUrl)
    ? `/api/download?url=${encodeURIComponent(data.resumeUrl)}`
    : data.resumeUrl;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16
                        items-center mb-20">

      {/* ── Left: text ── */}
      <div className="flex flex-col gap-6 order-2 lg:order-1">

        {/* Badge */}
        <Reveal className="flex flex-wrap items-center gap-2 w-fit">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-indigo-50 dark:bg-indigo-950
                          border border-indigo-100 dark:border-indigo-900">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold
                             text-indigo-600 dark:text-indigo-400">
              {data.experience} Experience
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          bg-zinc-100 dark:bg-zinc-800
                          border border-zinc-200 dark:border-zinc-700">
            <MapPin className="w-3 h-3 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {data.location}
            </span>
          </div>
        </Reveal>

        {/* Title */}
        <Reveal delay={100}>
          <PageHeading className="text-4xl sm:text-5xl font-bold
                         text-zinc-900 dark:text-white mb-3 leading-tight">
            {data.name}
          </PageHeading>
          <p className="text-xl font-semibold
                        text-indigo-600 dark:text-indigo-400">
            {data.subtitle}
          </p>
        </Reveal>

        {/* Bio paragraphs */}
        <Reveal delay={200} className="flex flex-col gap-4">
          {data.bio.map((para, i) => (
            <p key={i}
              className="text-base text-zinc-600 dark:text-zinc-400
                         leading-relaxed">
              {para}
            </p>
          ))}
        </Reveal>

        {/* CTA row */}
        <Reveal delay={300} className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/contact"
            className="btn-shine flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-indigo-600 hover:bg-indigo-700
                       text-white text-sm font-medium
                       transition-all duration-150 hover:scale-105"
          >
            <Mail className="w-4 h-4" />
            Hire Me
          </Link>

          {hasResume && (
            <a
              href={resumeHref}
              download
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                         bg-white dark:bg-zinc-900
                         border border-zinc-200 dark:border-zinc-700
                         text-zinc-700 dark:text-zinc-300 text-sm font-medium
                         hover:border-indigo-300 dark:hover:border-indigo-700
                         hover:-translate-y-0.5
                         transition-all duration-150"
            >
              <Download className="w-4 h-4" />
              Download CV
            </a>
          )}

          <Link
            href="/projects"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                       text-zinc-500 dark:text-zinc-400 text-sm font-medium
                       hover:text-indigo-600 dark:hover:text-indigo-400
                       transition-colors group"
          >
            View Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1
                                   transition-transform" />
          </Link>
        </Reveal>

        <Reveal delay={350}>
          <SocialLinks placement="about" className="-ml-2" />
        </Reveal>

      </div>

      {/* ── Right: image ── */}
      <Reveal delay={250} className="flex justify-center lg:justify-end order-1 lg:order-2">
        <div className="relative">

          {/* Main image box */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80
                          rounded-3xl overflow-hidden
                          border-2 border-zinc-200 dark:border-zinc-700
                          shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50">
            {data.image ? (
              <Image
                src={data.image}
                alt={data.name}
                fill
                sizes="(min-width: 1024px) 320px, 288px"
                className="object-cover object-center
                           transition-transform duration-700 hover:scale-105"
                priority
              />
            ) : (
              <div className="w-full h-full
                              bg-linear-to-br
                              from-indigo-50 to-zinc-100
                              dark:from-indigo-950 dark:to-zinc-900
                              flex flex-col items-center justify-center gap-3">
                <ImageIcon className="w-12 h-12
                                      text-indigo-200 dark:text-indigo-800" />
                <span className="text-xs font-medium
                                 text-indigo-300 dark:text-indigo-700">
                  Photo coming soon
                </span>
              </div>
            )}
          </div>

          {/* Floating cards */}
          {projects && (
            <StatCard
              stat={projects}
              className="animate-float absolute -top-4 -left-4"
            />
          )}
          {clients && (
            <StatCard
              stat={clients}
              className="animate-float-slow absolute -bottom-4 -right-4"
            />
          )}

          {/* Decorative dot grid */}
          <div className="absolute -z-10 -bottom-6 -left-6
                          w-32 h-32 opacity-30 dark:opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />

        </div>
      </Reveal>

    </section>
  )
}
