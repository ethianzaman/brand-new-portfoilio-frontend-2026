import { dashboardApiUrl } from "@/lib/api/config";
import type {
  CreateUserInput,
  CreateUserResponse,
  ManagedUser,
} from "@/lib/types/user";

// ─────────────────────────────────────────────────────────────────
//  USER MANAGEMENT SERVICE (admin-only endpoints)
//
//  In the browser these go through the same-origin /api/backend proxy
//  (which attaches the httpOnly JWT); on the server they hit the
//  backend directly. Every endpoint requires the admin role on the
//  backend, so a non-admin session always receives 403.
//
//  Endpoints (see Backend/src/routes/user.routes.ts):
//    GET    /users              → { success, users, total }
//    POST   /users              → { success, user, temporaryPassword? }
//    PATCH  /users/:id/role     → { success, user }
//    PATCH  /users/:id/status   → { success, user }
//    DELETE /users/:id          → { success, id }
// ─────────────────────────────────────────────────────────────────

interface ApiErrorBody {
  message?: string;
}

async function fail(res: Response, fallback: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  if (res.status === 401 || res.status === 403) {
    return new Error(body?.message ?? "You are not allowed to do that.");
  }
  return new Error(body?.message ?? fallback);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${dashboardApiUrl()}/users${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (!res.ok) throw await fail(res, "Request failed.");
  return (await res.json()) as T;
}

// ── GET /users ────────────────────────────────────────────────────
export async function dashboardGetUsers(): Promise<ManagedUser[]> {
  const json = await request<{ users?: ManagedUser[] }>("");
  return json.users ?? [];
}

// ── POST /users ───────────────────────────────────────────────────
export async function dashboardCreateUser(
  input: CreateUserInput,
): Promise<CreateUserResponse> {
  return request<CreateUserResponse>("", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ── PATCH /users/:id/role ─────────────────────────────────────────
export async function dashboardUpdateUserRole(
  id: string,
  role: string,
): Promise<ManagedUser> {
  const json = await request<{ user: ManagedUser }>(`/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return json.user;
}

// ── PATCH /users/:id/status ───────────────────────────────────────
export async function dashboardUpdateUserStatus(
  id: string,
  isActive: boolean,
): Promise<ManagedUser> {
  const json = await request<{ user: ManagedUser }>(`/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  return json.user;
}

// ── DELETE /users/:id ─────────────────────────────────────────────
export async function dashboardDeleteUser(id: string): Promise<void> {
  await request<{ id?: string }>(`/${id}`, { method: "DELETE" });
}
