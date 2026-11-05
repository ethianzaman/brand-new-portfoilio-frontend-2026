import { HeroData } from "@/lib/types/hero";

// ─────────────────────────────────────────────────────────────
// DEMO DATA — fallback when the backend API is down
// API should return the same HeroData shape
// ─────────────────────────────────────────────────────────────

export const DEMO_HERO: HeroData = {
  hero: {
    name: "Ethian Dev",
    title: "Full Stack Engineer",
    titles: [
      "Django & Next.js Specialist",
      "Schema & DB Architect",
      "System Design Enthusiast",
      "Full Stack Web Engineer",
    ],
    bio: "I build fast, scalable, and beautiful web applications from frontend to backend. Passionate about clean code, great user experience, and solving real problems.",
    image: "https://i.ibb.co/jZwLHrfT/IMG-20260318-213819.png",
    resumeUrl: "/resume.pdf",
    socials: [
      { label: "github", href: "https://github.com" },
      { label: "linkedin", href: "https://linkedin.com" },
      { label: "twitter", href: "https://twitter.com" },
    ],
  },
  stats: [
    { value: "3+", label: "Years Experience" },
    { value: "20+", label: "Projects Built" },
    { value: "10+", label: "Happy Clients" },
    { value: "5+", label: "Open Source" },
  ],
};
