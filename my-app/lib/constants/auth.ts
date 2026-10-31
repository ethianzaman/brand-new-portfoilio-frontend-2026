import { authApiUrl } from "@/lib/api/config";

export const API_AUTH_URL = authApiUrl();

export const SESSION_COOKIE = "auth_token";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)

/**
 * Request header used by proxy.ts to hand the originally requested path over
 * to the server component, so the login page can send the user back to it.
 */
export const PATHNAME_HEADER = "x-portfolio-pathname";
