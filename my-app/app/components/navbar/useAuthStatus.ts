"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────
//  useAuthStatus — is there a valid session?
//
//  The public navbar is part of the ISR/static shell, so the session state
//  CANNOT be baked into the server-rendered HTML: it would be cached and
//  served to every visitor. It is therefore resolved in the browser.
//
//  The check is authoritative, not optimistic: it calls GET /api/auth/me,
//  which proxies the httpOnly session token to the backend, where the JWT is
//  verified and the account is re-read from the database. Nothing here reads
//  localStorage and nothing trusts the mere presence of a cookie.
//
//  The link starts out hidden and is only revealed once the session is
//  confirmed, so a logged-out visitor never sees a Dashboard link and the
//  state never flickers between "shown" and "hidden".
// ─────────────────────────────────────────────────────────────────────────

export function useAuthStatus(): boolean {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (active) setIsAuthenticated(res.ok);
      } catch {
        if (active) setIsAuthenticated(false);
      }
    }

    void check();

    // Re-check when the tab comes back into focus, so a session that was
    // closed or expired in another tab does not leave a stale link behind.
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return isAuthenticated;
}
