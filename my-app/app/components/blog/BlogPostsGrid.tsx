"use client";
import { useState, useMemo } from "react";
import {
  Search,
  X,
  ChevronDown,
  ArrowRight,
  Clock3,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/lib/types/blog";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 3;

function PostCard({ post }: { post: BlogPost }) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl
                 border border-zinc-200 dark:border-zinc-800
                 bg-white dark:bg-zinc-900
                 transition-all duration-200
                 hover:border-indigo-300 dark:hover:border-indigo-700
                 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      {/* Cover */}
      <div className="aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm font-semibold text-zinc-400">
              {post.category}
            </span>
          </div>
        )}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full
                     bg-white/90 dark:bg-zinc-900/90 backdrop-blur
                     text-xs font-semibold text-indigo-600 dark:text-indigo-400"
        >
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-2">
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span className="flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> {post.readTime} min read
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h3>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium
                         bg-zinc-100 dark:bg-zinc-800
                         text-zinc-500 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Read article
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
}

function FeaturedHero({ post }: { post: BlogPost }) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl
                 border border-zinc-200 dark:border-zinc-800
                 bg-white dark:bg-zinc-900
                 transition-all duration-200
                 hover:border-indigo-300 dark:hover:border-indigo-700"
    >
      <div className="aspect-16/10 lg:aspect-auto overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center p-6 md:p-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold
                       bg-indigo-50 dark:bg-indigo-950
                       text-indigo-600 dark:text-indigo-400"
          >
            Featured
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold
                       bg-zinc-100 dark:bg-zinc-800
                       text-zinc-600 dark:text-zinc-400"
          >
            {post.category}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h2>

        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 mt-4">
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span className="flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> {post.readTime} min read
          </span>
        </div>

        <span
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold
                     text-indigo-600 dark:text-indigo-400"
        >
          Read article
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
}

export function BlogPostsGrid({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts],
  );

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory = category === "All" || p.category === category;
      const matchQuery =
        !query.trim() ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchCategory && matchQuery;
    });
  }, [posts, query, category]);

  const featured = posts.find((p) => p.featured);
  const rest = filtered.filter((p) => p !== featured);
  const shown = rest.slice(0, visible);
  const hasMore = visible < rest.length;

  function handleSeeMore() {
    setVisible((v) => v + PAGE_SIZE);
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Featured */}
      {featured && filtered.includes(featured) && (
        <FeaturedHero post={featured} />
      )}

      {/* ── Filter section ── */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="w-full h-11 pl-10 pr-10 rounded-xl text-sm
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       text-zinc-900 dark:text-white placeholder:text-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2
                         w-6 h-6 rounded-md flex items-center justify-center
                         text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
                         hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Native select — mobile only */}
        <div className="relative sm:hidden">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="w-full appearance-none
                       h-11 pl-4 pr-10 rounded-xl
                       text-sm font-medium
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       text-zinc-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2
                       w-4 h-4 text-zinc-400 pointer-events-none"
          />
        </div>

        {/* Pill tabs — desktop only, always visible */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
              setCategory(c);
              setVisible(PAGE_SIZE);
            }}
              className={cn(
                "h-10 px-5 rounded-full text-sm font-medium",
                "border transition-all duration-150",
                category === c
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400",
              )}
            >
              {c}
            </button>
          ))}

          {/* Count */}
          <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Mobile count */}
        <p className="sm:hidden text-sm text-zinc-400 dark:text-zinc-500">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-20
                        text-zinc-400 rounded-2xl border border-dashed
                        border-zinc-300 dark:border-zinc-700"
        >
          <Search className="w-10 h-10 opacity-20" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No articles found
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Try a different search or category
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {shown.map((post, i) => (
            <div
              key={post.id}
              className="animate-fade-in"
              style={{ animationDelay: `${(i % PAGE_SIZE) * 80}ms` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* ── See More ── */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSeeMore}
            className="gap-2 rounded-full px-8
                       border-zinc-200 dark:border-zinc-700
                       hover:border-indigo-400 dark:hover:border-indigo-500
                       hover:text-indigo-600 dark:hover:text-indigo-400
                       transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            See More Articles
          </Button>
        </div>
      )}

      {!hasMore && filtered.length > PAGE_SIZE && (
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
          All {filtered.length} articles shown
        </p>
      )}
    </div>
  );
}