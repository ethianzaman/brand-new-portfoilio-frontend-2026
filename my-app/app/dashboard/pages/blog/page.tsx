import { FileText } from "lucide-react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { BlogTable } from "./BlogTable";
import {
  dashboardGetBlogPosts,
  dashboardGetBlogStats,
  type BlogListQuery,
} from "@/lib/services/blog.services";
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants/pagination";

/**
 * The exact query the table starts on. It MUST match the table's initial
 * `listParams` — TanStack hashes the key, so any difference in keys or values
 * means the hydrated cache entry is never found.
 */
const INITIAL_PARAMS: BlogListQuery = {
  page: 1,
  pageSize: DASHBOARD_PAGE_SIZE,
  q: "",
  status: "all",
};

export default async function DashboardBlogPage() {
  // Fetch the first page + the stat cards on the server and hand them to the
  // client through React Query's hydration boundary. The table then renders
  // with data already in the cache — no loading flash, no duplicate request
  // for the page the user is looking at.
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["blogs", "list", INITIAL_PARAMS],
      queryFn: () => dashboardGetBlogPosts(INITIAL_PARAMS),
    }),
    queryClient.prefetchQuery({
      queryKey: ["blogs", "stats"],
      queryFn: dashboardGetBlogStats,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                        flex items-center justify-center"
        >
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Blog Page
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Write, publish and manage your articles
          </p>
        </div>
      </div>

      {/* Table — client component handles all state */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BlogTable />
      </HydrationBoundary>
    </div>
  );
}
