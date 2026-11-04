import { Wrench } from 'lucide-react'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { ServicesTable } from './ServicesTable'
import { PageHeader } from '@/app/components/dashboard/PageHeader'
import {
  dashboardGetServices,
  dashboardGetServiceStats,
  type ServiceListQuery,
} from '@/lib/services/service.services'
import { DASHBOARD_PAGE_SIZE } from '@/lib/constants/pagination'

/** Must match the table's initial `listParams` exactly. */
const INITIAL_PARAMS: ServiceListQuery = {
  page: 1,
  pageSize: DASHBOARD_PAGE_SIZE,
  q: '',
}

export default async function DashboardServicesPage() {
  // Prefetch on the server and hydrate the client cache — the table renders
  // with data instead of a skeleton, and never re-requests the first page.
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['services', 'list', INITIAL_PARAMS],
      queryFn: () => dashboardGetServices(INITIAL_PARAMS),
    }),
    queryClient.prefetchQuery({
      queryKey: ['services', 'stats'],
      queryFn: dashboardGetServiceStats,
    }),
  ])

  return (
    <div className="flex flex-col gap-6">

      <PageHeader
        icon={Wrench}
        title="Services Page"
        description="Manage your public services page content"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ServicesTable />
      </HydrationBoundary>

    </div>
  )
}
