import { ContactForm } from './ContactForm'
import { SectionHeader } from "@/app/components/SectionHeader";
import Reveal from "@/app/components/motion/Reveal";
import { ContactInfo } from './ContactInfo'
import { ContactFAQ } from './ContactFAQ'
import { MessageCircle } from 'lucide-react'
import { getContact } from '@/lib/api/contact'
import { getSiteSettings } from '@/lib/api/settings'
import { getPageSeo } from '@/lib/api/seo'
import { buildMetadata } from '@/lib/seo/metadata'
import { legacySocial, resolveSocials } from '@/lib/socials'

const LEGACY_CONTACT_LINKS = [
  { key: 'github', label: 'GitHub', description: 'Check my open source work' },
  { key: 'linkedin', label: 'LinkedIn', description: 'Connect professionally' },
  { key: 'twitter', label: 'Twitter', description: 'Follow for dev updates' },
] as const

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
  const settings = await getSiteSettings()
  const socials = settings.socialsConfigured
    ? resolveSocials(settings, 'contact')
    : LEGACY_CONTACT_LINKS.flatMap(({ key, label, description }) =>
        info.socials[key] ? [legacySocial(label, info.socials[key], description)] : [],
      )
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">

        {/* ── Header — same pattern as all other pages ── */}
        <SectionHeader
          className="mb-10 sm:mb-14 max-w-2xl"
          titleClassName="text-3xl sm:text-4xl md:text-5xl"
          descriptionClassName="text-base sm:text-lg"
          icon={MessageCircle}
          eyebrow="Get in touch"
          title="Let's work together"
          description="Have a project in mind, a question, or just want to say hello? I'm always open to new opportunities. Fill the form or reach me directly — I'll get back to you within 24 hours."
        />

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <Reveal className="lg:col-span-3">
            <ContactForm />
          </Reveal>
          <Reveal delay={90} className="lg:col-span-2">
            <ContactInfo info={info} socials={socials}/>
          </Reveal>
        </div>

        {/* ── FAQ ── */}
        <ContactFAQ faqs={faqs} />

      </div>
    </div>
  )
}