import { permanentRedirect } from "next/navigation";

/**
 * `/hero` was a duplicate of `/home`. It now 308s to `/` alongside `/home`,
 * so only one URL (`/`) is indexed for the landing content.
 */
export default function HeroRoute() {
  permanentRedirect("/");
}
