export interface HomeSocial {
  _id?: string;
  label: string;
  href: string;
}

export interface HomeHero {
  name: string;
  title: string;
  titles: string[];
  bio: string;
  image: string | null;
  resumeUrl: string;
  socials: HomeSocial[];
}

export interface HomeStat {
  _id?: string;
  value: string;
  label: string;
}

export interface HomeData {
  hero: HomeHero;
  stats: HomeStat[];
}
