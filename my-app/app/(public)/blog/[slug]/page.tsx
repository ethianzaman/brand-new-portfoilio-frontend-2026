import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock3, CalendarDays, Tag } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/api/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post not found — Ethian Dev" };
  }

  return {
    title: `${post.title} — Ethian Dev`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  // Tagged `blog-<slug>` + `blog`, so the backend can invalidate this post
  // precisely or the whole blog at once.
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const paragraphs = (post.content ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium
                     text-zinc-500 dark:text-zinc-400
                     hover:text-indigo-600 dark:hover:text-indigo-400
                     transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-8 flex-wrap">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold
                       bg-indigo-50 dark:bg-indigo-950
                       text-indigo-600 dark:text-indigo-400"
          >
            {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <CalendarDays className="w-3.5 h-3.5" />
            {date ?? "—"}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <Clock3 className="w-3.5 h-3.5" />
            {post.readTime} min read
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold
                     text-zinc-900 dark:text-white mt-4 leading-tight"
        >
          {post.title}
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Cover */}
        {post.coverImage && (
          <div className="mt-8 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        )}

        {/* Body */}
        <div className="mt-10 flex flex-col gap-6">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-base md:text-lg leading-relaxed
                         text-zinc-700 dark:text-zinc-300"
            >
              {para}
            </p>
          ))}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              <Tag className="w-3.5 h-3.5" /> Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-zinc-100 dark:bg-zinc-800
                             text-zinc-600 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}