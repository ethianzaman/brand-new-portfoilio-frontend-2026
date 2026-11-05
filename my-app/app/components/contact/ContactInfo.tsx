'use client'

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react'

import { SocialIcon } from '@/app/components/brand/SocialIcon'
import SpotlightCard from "@/app/components/motion/SpotlightCard";
import { ContactInfo as ContactInfoType } from '@/lib/types/contact'
import type { SiteSocial } from '@/lib/types/settings'

interface ContactInfoProps {
  info: ContactInfoType
  socials: SiteSocial[]
}

export function ContactInfo({ info, socials }: ContactInfoProps) {
  const contactDetails = [
    {
      icon: Mail,
      label: 'Email',
      value: info.email,
      href: `mailto:${info.email}`,
      color: '#6366f1',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: info.phone,
      href: `tel:${info.phone}`,
      color: '#10b981',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: info.location,
      href: null,
      color: '#f59e0b',
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: info.responseTime,
      href: null,
      color: '#06b6d4',
    },
  ]

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Contact details */}
      <SpotlightCard className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 flex-1">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
          Contact Details
        </h3>

        <div className="space-y-4">
          {contactDetails.map(({ icon: Icon, label, value, href, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {label}
                </p>

                {href ? (
                  <a
                    href={href}
                    className="text-sm sm:text-base font-medium break-all
                               text-zinc-800 dark:text-zinc-200
                               hover:text-indigo-600 dark:hover:text-indigo-400
                               transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm sm:text-base font-medium break-all text-zinc-800 dark:text-zinc-200">
                    {value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* Availability */}
      <SpotlightCard className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-4 sm:p-5">
        <p className="font-semibold text-green-700 dark:text-green-400">
          {info.available
            ? 'Available for new projects'
            : 'Currently unavailable'}
        </p>

        <p className="text-sm text-green-600 dark:text-green-500">
          {info.availableText}
        </p>
      </SpotlightCard>

      {/* Social links */}
      {socials.length > 0 && (
      <SpotlightCard className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">
          Find me on
        </h3>

        <div className="space-y-2">
          {socials.map(({ id, label, href, icon, imageUrl, description }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl p-3
                         min-h-13px
                         hover:bg-zinc-50 dark:hover:bg-zinc-800
                         transition-colors group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center
                              rounded-xl bg-zinc-100 dark:bg-zinc-800
                              group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950
                              transition-colors">
                <SocialIcon
                  icon={icon}
                  imageUrl={imageUrl}
                  className="h-4 w-4 text-zinc-600 dark:text-zinc-400
                             group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                             transition-colors"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {label}
                </p>
                {description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {description}
                  </p>
                )}
              </div>

              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600
                           group-hover:text-indigo-500
                           transition-colors"
              />
            </a>
          ))}
        </div>
      </SpotlightCard>
      )}
    </div>
  )
}