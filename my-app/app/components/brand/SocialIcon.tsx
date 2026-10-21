import {
  AtSign,
  Camera,
  Globe,
  Link2,
  Mail,
  MessageCircle,
  Music,
  Phone,
  Play,
  Rss,
  Send,
  Share2,
  Video,
} from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
} from "@/app/components/icon/brandIcons";

/**
 * The full set of selectable social icon keys — custom brand marks for the
 * networks we ship, plus generic lucide glyphs so admins can add ANY link.
 * Kept in one place so the admin picker and the renderer never drift apart.
 */
export const SOCIAL_ICONS = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  globe: Globe,
  mail: Mail,
  link: Link2,
  send: Send,
  at: AtSign,
  chat: MessageCircle,
  share: Share2,
  rss: Rss,
  play: Play,
  video: Video,
  camera: Camera,
  music: Music,
  phone: Phone,
} as const;

export type SocialIconKey = keyof typeof SOCIAL_ICONS;

/**
 * Renders a shared social icon by key. Shared by the Navbar, the mobile menu
 * and the Footer, with a neutral `globe` fallback for unknown keys.
 */
export function SocialIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = SOCIAL_ICONS[(icon ?? "") as SocialIconKey] ?? Globe;
  return <Icon className={className} aria-hidden />;
}
