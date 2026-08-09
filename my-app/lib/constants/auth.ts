export const API_AUTH_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth`
  : "http://localhost:5000/api/auth";

export const SESSION_COOKIE = "auth_token";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)