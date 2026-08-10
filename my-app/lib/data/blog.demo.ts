import { BlogPost } from "@/lib/types/blog";

// ─────────────────────────────────────────────────
// DEMO DATA — used only as a fallback when the
// backend is not running. Removable once API is live.
// ─────────────────────────────────────────────────

export const DEMO_BLOG_POSTS: BlogPost[] = [
  {
    id: "demo-1",
    title: "Building a Modern Portfolio with Next.js",
    slug: "building-a-modern-portfolio-with-next-js",
    excerpt:
      "How I architected a fast, SEO-friendly portfolio using the App Router, RSC and Tailwind CSS v4.",
    content:
      "When I started rebuilding my portfolio I wanted an architecture that would scale with my content. I settled on Next.js App Router with server components for most of the UI and a small set of client islands for interactive parts.\n\nThe result is a site that feels instant on every page, ranks well in search, and is pleasant to maintain.\n\nIn this post I walk through the folder structure, data fetching strategy and the design system I used.",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    category: "Tutorial",
    tags: ["Next.js", "React", "Tailwind CSS"],
    readTime: 7,
    status: "published",
    featured: true,
    createdAt: "2026-07-12T10:00:00.000Z",
  },
  {
    id: "demo-2",
    title: "Designing a Dashboard that Users Love",
    slug: "designing-a-dashboard-that-users-love",
    excerpt:
      "Good dashboards are a craft. Here are the principles I follow when designing admin and analytics UIs.",
    content:
      "A dashboard is a love letter to the data it shows. When I start one, I ask three questions: what decision does the user need to make, what is the very first number they look for, and what can be safely hidden behind one click.\n\nThe first screen should answer the largest decisions with the smallest effort. Everything else is progressive disclosure.\n\nEmpty states, not charts, get most of my attention — because that is where users decide whether the product is broken or brilliant.",
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=jpg&q=60&w=900&auto=format&fit=crop",
    category: "Design",
    tags: ["UI/UX", "Dashboards", "Design Systems"],
    readTime: 5,
    status: "published",
    featured: true,
    createdAt: "2026-06-28T10:00:00.000Z",
  },
  {
    id: "demo-3",
    title: "Authentication Patterns You Should Know",
    slug: "authentication-patterns-you-should-know",
    excerpt:
      "Session vs JWT, cookies vs headers, and when middleware is the right place to guard your routes.",
    content:
      "The classic debate is sessions versus tokens, but the real question is who owns the state. Server-side sessions keep revocation trivial and are a great default for small teams. Tokens win when you have many clients or want zero server state.\n\nWhatever you pick, cookies with the httpOnly flag beat localStorage for anything tied to identity. It keeps XSS from silently stealing credentials.\n\nAnd remember: middleware is only the optimistic guard. The server must re-verify on every protected write.",
    coverImage:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?fm=jpg&q=60&w=900&auto=format&fit=crop",
    category: "Backend",
    tags: ["Auth", "Security", "Node.js"],
    readTime: 9,
    status: "published",
    featured: false,
    createdAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: "demo-4",
    title: "REST APIs: Lessons from Real Projects",
    slug: "rest-apis-lessons-from-real-projects",
    excerpt:
      "Naming, status codes, error shapes and versioning — the boring decisions that make APIs pleasant to use.",
    content:
      "Most API pain is self-inflicted by inconsistent naming. Decide once: resources are nouns, endpoints are plural, parameters are kebab-case. Write it down, and review it in code review.\n\nError responses should be one stable shape, and 4xx should never be used as control flow. A missing resource is 404, a bad payload is 422.\n\nLastly, versioning is cheaper than you think. Putting a version in the URL saves you from breaking the people who depend on you.",
    coverImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?fm=jpg&q=60&w=900&auto=format&fit=crop",
    category: "Backend",
    tags: ["API", "REST", "Node.js"],
    readTime: 6,
    status: "published",
    featured: false,
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "demo-5",
    title: "The Power of TypeScript in Frontend Codebases",
    slug: "the-power-of-typescript-in-frontend-codebases",
    excerpt:
      "Small type-first habits that prevent entire categories of bugs, and keep large components maintainable.",
    content:
      "The return on investment for TypeScript is not the compiler — it is the conversations it forces in code review. Types are documentation that cannot rot.\n\nStart with strict mode on day one. Let the compiler be strict on module boundaries even if the props inside stay loose.\n\nAnd never type everything perfectly on the first pass. Clear beats clever. A slightly verbose type you can read in six months is worth more than a clever one-liner.",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?fm=jpg&q=60&w=900&auto=format&fit=crop",
    category: "Tutorial",
    tags: ["TypeScript", "React", "Best Practices"],
    readTime: 4,
    status: "draft",
    featured: false,
    createdAt: "2026-03-15T10:00:00.000Z",
  },
];