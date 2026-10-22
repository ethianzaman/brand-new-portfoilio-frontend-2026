import { Briefcase } from 'lucide-react'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { ProjectsTable } from './ProjectsTable'
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

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                        flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Projects Page
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your portfolio projects
          </p>
        </div>
      </div>

      {/* Table — client component handles all state */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectsTable />
      </HydrationBoundary>

    </div>
  )
}
