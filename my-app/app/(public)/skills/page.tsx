import { Code2 } from 'lucide-react'
import { SectionHeader } from "@/app/components/SectionHeader";
import { SkillsGrid } from '@/app/components/skills/SkillsGrid'
import { getSkills } from '@/lib/api/skills'
import { getSiteSettings } from '@/lib/api/settings'
import { getPageSeo } from '@/lib/api/seo'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSeo('skills'),
  ])

  return buildMetadata({
    path: '/skills',
    title: 'Skills',
    description: 'Technologies, languages and tools I work with.',
    seo,
    siteSeo: settings.seo,
  })
}

export default async function SkillsPage() {
  // Cached 60s under tag "skills"; last-good-on-failure; demo data on build.
  const skills = await getSkills()

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">

        {/* Header */}
        <SectionHeader
          className="mb-14"
          descriptionClassName="max-w-2xl"
          icon={Code2}
          socialPlacement="skills"
          eyebrow="Tech Stack"
          title="Skills"
          description="Languages, frameworks, databases and tools I use to build full-stack applications from idea to production."
        />

        {/* Skills */}
        <SkillsGrid categories={skills} />

      </div>
    </div>
  )
}