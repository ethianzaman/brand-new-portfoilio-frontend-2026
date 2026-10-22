export type UserRole = "admin" | "manager" | "editor";

export const USER_ROLES: UserRole[] = ["admin", "manager", "editor"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  editor: "Editor",
};

/**
 * The account behind the current session — returned by GET /auth/me.
 * Never contains a password hash.
 */
export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

/** Safe user shape returned by the backend — never contains a password hash. */
export interface ManagedUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  email: string;
  password?: string;
  role: UserRole;
}

/** POST /api/users response — `temporaryPassword` only when auto-generated. */
export interface CreateUserResponse {
  user: ManagedUser;
  temporaryPassword?: string;
}

export interface UserListResponse {
  users: ManagedUser[];
  total: number;
}
