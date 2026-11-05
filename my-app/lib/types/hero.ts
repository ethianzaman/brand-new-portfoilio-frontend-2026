export interface HeroSocial {
  _id?: string;
  label: string;
  href: string;
}

export interface HeroContent {
  name: string;
  title: string;
  titles: string[];
  bio: string;
  image: string | null;
  resumeUrl: string;
  socials: HeroSocial[];
}

export interface HeroStat {
  _id?: string;
  value: string;
  label: string;
}

export interface HeroData {
  hero: HeroContent;
  stats: HeroStat[];
}
