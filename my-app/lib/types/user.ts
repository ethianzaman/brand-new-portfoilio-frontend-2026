export type UserRole = "super_admin" | "admin" | "manager" | "editor";
export type ConfigurableRole = Exclude<UserRole, "super_admin">;

export const USER_ROLES: UserRole[] = ["super_admin", "admin", "manager", "editor"];
export const CONFIGURABLE_ROLES: ConfigurableRole[] = ["admin", "manager", "editor"];

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export interface PermissionSection {
  key: string;
  label: string;
  actions: PermissionAction[];
}

/** GET /api/roles/permissions */
export interface RolePermissionConfig {
  sections: PermissionSection[];
  roles: Record<UserRole, string[]>;
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Full access to everything. Cannot be limited.",
  admin: "Access is set under Roles & Permissions.",
  manager: "Access is set under Roles & Permissions.",
  editor: "Access is set under Roles & Permissions.",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
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
  /** Keys such as "blog.delete". Always read fresh from the backend. */
  permissions: string[];
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
