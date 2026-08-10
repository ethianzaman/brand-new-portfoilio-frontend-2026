import { FileText } from "lucide-react";
import { BlogPostsGrid } from "../../components/blog/BlogPostsGrid";
import { dashboardGetBlogPosts } from "@/lib/services/blog.services";
import { EmptyState } from "@/app/components/EmptyState";

export const metadata = {
  title: "Blog — John Dev",
  description: "Articles on development, design and the craft of building for the web.",
};

export default async function BlogPage() {
  const all = await dashboardGetBlogPosts();
  const posts = all.filter((p) => p.status === "published");

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <EmptyState
            icon={FileText}
            title="No Articles Yet"
            description="The blog is brewing. Check back soon for new stories and tutorials!"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                            flex items-center justify-center"
            >
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400
                             uppercase tracking-wider"
            >
              Insights & tutorials
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold
                         text-zinc-900 dark:text-white mb-4"
          >
            Blog
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Stories, guides and hard-won lessons from building real products —
            written down so you don&apos;t have to make the same mistakes.
          </p>
        </div>

        {/* Posts grid — client handles search + category filters */}
        <BlogPostsGrid posts={posts} />
      </div>
    </div>
  );
}