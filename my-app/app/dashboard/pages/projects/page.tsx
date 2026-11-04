import { Briefcase } from 'lucide-react'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { ProjectsTable } from './ProjectsTable'
import { PageHeader } from '@/app/components/dashboard/PageHeader'
import {
  dashboardGetProjectsAll,
  dashboardGetProjectStats,
  type ProjectListQuery,
} from '@/lib/services/project.services'
import { DASHBOARD_PAGE_SIZE } from '@/lib/constants/pagination'

/** Must match the table's initial `listParams` exactly. */
const INITIAL_PARAMS: ProjectListQuery = {
  page: 1,
  pageSize: DASHBOARD_PAGE_SIZE,
  q: '',
  category: 'all',
  sort: 'title',
  dir: 'asc',
}

export default async function DashboardProjectsPage() {
  // Prefetch on the server and hydrate the client cache — the table renders
  // with data instead of a skeleton, and never re-requests the first page.
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['projects', 'list', INITIAL_PARAMS],
      queryFn: () => dashboardGetProjectsAll(INITIAL_PARAMS),
    }),
    queryClient.prefetchQuery({
      queryKey: ['projects', 'stats'],
      queryFn: dashboardGetProjectStats,
    }),
  ])

  return (
    <div className="flex flex-col gap-6">

      <PageHeader
        icon={Briefcase}
        title="Projects Page"
        description="Manage your portfolio projects"
      />

      {/* Table — client component handles all state */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectsTable />
      </HydrationBoundary>

    </div>
  )
}
