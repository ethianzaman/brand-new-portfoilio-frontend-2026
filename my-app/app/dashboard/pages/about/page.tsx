import { User } from 'lucide-react'
import { AboutCMS } from './AboutCMS'
import { PageHeader } from '@/app/components/dashboard/PageHeader'
import { dashboardGetAbout } from '@/lib/services/about.services'


export default async function DashboardAboutPage() {
  const about = await dashboardGetAbout().catch(() => null)


  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={User}
        title="About Page"
        description="Manage your public about page content"
      />

      <AboutCMS initial={about} />
    </div>
  )
}