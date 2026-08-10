import { FileText } from "lucide-react";
import { BlogTable } from "./BlogTable";
import { dashboardGetBlogPosts } from "@/lib/services/blog.services";

export default async function DashboardBlogPage() {
  const posts = await dashboardGetBlogPosts();

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
            Blog Posts
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Write, publish and manage your articles
          </p>
        </div>
      </div>

      {/* Table — client component handles all state */}
      <BlogTable initial={posts} />
    </div>
  );
}