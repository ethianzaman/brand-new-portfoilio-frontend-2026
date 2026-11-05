'use client'
import { useState } from 'react'
import SpotlightCard from "@/app/components/motion/SpotlightCard";
import Reveal from "@/app/components/motion/Reveal";
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQ } from '@/lib/types/contact'

interface ContactFAQProps {
  faqs: FAQ[]
}

export function ContactFAQ({ faqs }: ContactFAQProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mt-4">

      {/* Header */}
      <Reveal className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Frequently asked questions
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Quick answers to common questions. Still have one?{' '}
          <a href="mailto:john@example.com"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            Just ask.
          </a>
        </p>
      </Reveal>

      {/* FAQ items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {faqs.map((faq, i) => (
          <Reveal
            key={i}
            delay={(i % 2) * 90}
          >
            <SpotlightCard
              className={cn(
                'rounded-2xl border',
                open === i
                  ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
              )}
            >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 sm:gap-4
                         px-4 sm:px-5 py-4 text-left min-h-13"
            >
              <span className={cn(
                'text-sm font-semibold leading-snug',
                open === i
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-zinc-900 dark:text-white'
              )}>
                {faq.question}
              </span>
              <ChevronDown className={cn(
                'w-4 h-4 shrink-0 transition-transform duration-200',
                open === i
                  ? 'rotate-180 text-indigo-500'
                  : 'text-zinc-400'
              )} />
            </button>

            {open === i && (
              <div className="px-4 sm:px-5 pb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                   {faq.answer}
                </p>
              </div>
            )}
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

    </div>
  )
}
