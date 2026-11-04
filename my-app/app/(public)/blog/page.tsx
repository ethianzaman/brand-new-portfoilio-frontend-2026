import { FileText } from "lucide-react";
import { SectionHeader } from "@/app/components/SectionHeader";
import { BlogPostsGrid } from "../../components/blog/BlogPostsGrid";
import { getPublishedBlogPosts } from "@/lib/api/blog";
import { EmptyState } from "@/app/components/EmptyState";
import { getSiteSettings } from "@/lib/api/settings";
import { getPageSeo } from "@/lib/api/seo";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSeo("blog"),
  ]);

  return buildMetadata({
    path: "/blog",
    title: "Blog",
    description:
      "Articles on development, design and the craft of building for the web.",
    seo,
    siteSeo: settings.seo,
  });
}

export default async function BlogPage() {
  // The `status === "published"` filter lives inside `getPublishedBlogPosts()`
  // so drafts can never reach this page. See lib/api/blog.ts.
  const posts = await getPublishedBlogPosts();

  if (posts.length === 0) {
    return (
      <div className="min-h-screen">
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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <SectionHeader
          className="mb-14 max-w-2xl"
          icon={FileText}
          socialPlacement="blog"
          eyebrow="Insights & tutorials"
          title="Blog"
          description="Stories, guides and hard-won lessons from building real products — written down so you don't have to make the same mistakes."
        />

        {/* Posts grid — client handles search + category filters */}
        <BlogPostsGrid posts={posts} />
      </div>
    </div>
  );
}