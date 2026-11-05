import Link from 'next/link'
import SpotlightCard from "@/app/components/motion/SpotlightCard";
import { ServiceIcon } from "@/app/components/services/ServiceIcon";
import { cn } from '@/lib/utils'
import { Service } from '@/lib/types/services'
import { Check, Sparkles, ArrowRight } from "lucide-react";

export function ServiceCard({ service }: { service: Service }) {
  const detailHref = service.slug ? `/services/${service.slug}` : null

  return (
    <div className="relative h-full">
      {/* Popular badge (+ float animation) */}
      {service.popular && (
        <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
          <span className="animate-float flex items-center gap-1.5 px-4 py-1 rounded-full
                           bg-indigo-600 text-white text-xs font-semibold
                           shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <SpotlightCard
        className={cn(
          'h-full rounded-2xl p-6',
          'bg-white dark:bg-zinc-900',
          'border-2',
          'hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-100 dark:hover:shadow-zinc-900',
          service.popular
            ? 'border-indigo-500 dark:border-indigo-400'
            : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700',
        )}
        contentClassName="flex h-full flex-col gap-5"
      >

      {/* Icon (+ hover rotate/scale) */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                   transition-transform duration-300
                   group-hover:-rotate-6 group-hover:scale-110"
        style={{ backgroundColor: `${service.color}18` }}
      >
        <ServiceIcon
          icon={service.icon}
          color={service.color}
          className="w-6 h-6"
        />
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {detailHref ? (
            <Link
              href={detailHref}
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {service.title}
            </Link>
          ) : (
            service.title
          )}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2 flex-1">
        {service.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 w-4 h-4 rounded-full flex items-center
                         justify-center shrink-0
                         transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: `${service.color}20`,
                transitionDelay: `${i * 40}ms`,
              }}
            >
              <Check
                className="w-2.5 h-2.5"
                style={{ color: service.color }}
                strokeWidth={3}
              />
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-2
                      border-t border-zinc-100 dark:border-zinc-800">
        {service.tags.map(tag => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-lg text-xs font-medium
                       bg-zinc-50 dark:bg-zinc-800
                       text-zinc-500 dark:text-zinc-400
                       transition-colors duration-200
                       hover:bg-indigo-50 hover:text-indigo-600
                       dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {detailHref && (
        <Link
          href={detailHref}
          aria-label={`Learn more about ${service.title}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium
                     text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Learn more
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      </SpotlightCard>
    </div>
  )
}
