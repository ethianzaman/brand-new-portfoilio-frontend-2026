import { MessageCircle } from 'lucide-react'
import { ContactCMS } from './ContactCMS'
import { PageHeader } from '@/app/components/dashboard/PageHeader'
import { dashboardGetContact } from '@/lib/services/contact.service'


export default async function DashboardContactPage() {
  const contact = await dashboardGetContact()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={MessageCircle}
        title="Contact Page"
        description="Manage contact info, form options and FAQs"
      />

      <ContactCMS initial={contact} />
    </div>
  )
}