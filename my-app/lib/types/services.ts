export interface ServiceFeature {
  text: string
}

export interface Service {
  id: string
  icon: string           // lucide icon name
  title: string
  description: string
  features: ServiceFeature[]
  tags: string[]
  color: string
  popular?: boolean
  /** URL slug (backend-generated; optional for legacy records). */
  slug?: string
  /** Per-service SEO overrides. */
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: string
    canonicalUrl?: string
    noindex?: boolean
    nofollow?: boolean
  }
}