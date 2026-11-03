import { permanentRedirect } from "next/navigation";

/**
 * `/home` is a historical duplicate of the composite landing page at `/`.
 * Nothing links here any more (the navbar "Home" points at `/`), so it 308s to
 * the canonical route to avoid two URLs serving the same content.
 */
export default function HomeRoute() {
  permanentRedirect("/");
}
