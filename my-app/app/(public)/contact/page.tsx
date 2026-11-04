import { ContactForm } from './ContactForm'
import { ContactInfo } from './ContactInfo'
import { ContactFAQ } from './ContactFAQ'
import { MessageCircle } from 'lucide-react'
import { getContact } from '@/lib/api/contact'
import { getSiteSettings } from '@/lib/api/settings'
import { getPageSeo } from '@/lib/api/seo'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSeo('contact'),
  ])

  return buildMetadata({
    path: '/contact',
    title: 'Contact',
    description:
      'Get in touch for project inquiries, collaborations or just a chat.',
    seo,
    siteSeo: settings.seo,
  })
}

export default async function  ContactPage() {
  // Cached 60s under tag "contact"; last-good-on-failure; demo data on build.
  const contactData = await getContact()
  const {info, faqs} = contactData
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">

        {/* ── Header — same pattern as all other pages ── */}
        <div className="mb-10 sm:mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                            flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400
                             uppercase tracking-wider">
              Get in touch
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold
                         text-zinc-900 dark:text-white mb-4">
            Let&apos;s work together
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Have a project in mind, a question, or just want to say hello?
            I&apos;m always open to new opportunities. Fill the form or reach me
            directly — I&apos;ll get back to you within 24 hours.
          </p>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
          <div className="lg:col-span-2">
            <ContactInfo info={info}/>
          </div>
        </div>

        {/* ── FAQ ── */}
        <ContactFAQ faqs={faqs} />

      </div>
    </div>
  )
}