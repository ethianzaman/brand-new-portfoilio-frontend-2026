import { Code2 } from 'lucide-react'
import { SkillsTable } from './SkillsTable'    
import { PageHeader } from '@/app/components/dashboard/PageHeader'
import { dashboardGetSkills } from '@/lib/services/skill.services'

export default async function DashboardSkillsPage() {
  const skills = await dashboardGetSkills()

  return (
    <div className="flex flex-col gap-6">

      <PageHeader
        icon={Code2}
        title="Skills Page"
        description="Manage your skills and categories"
      />

      <SkillsTable initial={skills} />

    </div>
  )
}