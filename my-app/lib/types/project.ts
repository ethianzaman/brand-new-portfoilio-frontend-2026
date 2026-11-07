// ─────────────────────────────────────────────
// Shared types — match these with your backend
// response shape exactly when API is ready
// ─────────────────────────────────────────────

export type Category =
  | 'all'
  | 'frontend'
  | 'fullstack'
  | 'backend'
  | 'mobile'
  | 'devops'    
  | 'ai'        

export type ProjectStatus = '' | 'live' | 'in-progress' | 'archived'

export const PROJECT_STATUS_LABELS: Record<Exclude<ProjectStatus, ''>, string> = {
  live: 'Live',
  'in-progress': 'In progress',
  archived: 'Archived',
}

export interface Project {
  id: string
  title: string
  /** Main image: first on the card and at the top of the project page. */
  thumbnail?: string
  /** More card images after the thumbnail, shown as a slideshow. */
  images?: string[]
  description: string
  category: Category
  tags: string[]
  liveUrl: string
  githubUrl: string
  color: string
  featured?: boolean
  isPlaceholder?: boolean   // true = "coming soon" card
  // Case study for the detail page. Older projects may not have these.
  goal?: string
  features?: string[]
  /** How it's built. */
  approach?: string
  challenges?: string
  outcome?: string
  role?: string
  year?: string
  status?: ProjectStatus
  /** Screenshots, in order. */
  gallery?: string[]
  /** URL slug (backend-generated; optional for legacy records). */
  slug?: string
  updatedAt?: string
  /** Per-project SEO overrides. */
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: string
    canonicalUrl?: string
    noindex?: boolean
    nofollow?: boolean
  }
}

// What the service always returns — demo or real API
export interface ProjectsResponse {
  projects: Project[]
  total: number
  hasMore: boolean
}

// What callers pass in to query
export interface ProjectsParams {
  category: Category
  page: number
  pageSize: number
}

