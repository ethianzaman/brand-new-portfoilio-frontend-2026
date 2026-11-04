import { expect, test } from "@playwright/test";

const staleSession = [
  { name: "auth_token", value: "expired-or-invalid", url: "http://localhost:3100" },
  {
    name: "auth_token_user",
    value: JSON.stringify({ id: "1", email: "nobody@example.invalid" }),
    url: "http://localhost:3100",
  },
];

test.describe("auth routes", () => {
  test("session check answers with JSON, not a 404 page", async ({ request }) => {
    const response = await request.get("/api/auth/me");
    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
  });

  test("login and logout routes exist", async ({ request }) => {
    const login = await request.post("/api/auth/login", { data: {} });
    expect(login.status()).toBe(400);
    const logout = await request.post("/api/auth/logout");
    expect(logout.status()).toBe(200);
  });
});

test.describe("login page", () => {
  test("shows the form when logged out and stays out of search results", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Login to dashboard" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("an expired session keeps the form without a redirect loop", async ({ page, context }) => {
    await context.addCookies(staleSession);
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Login to dashboard" })).toBeVisible();
  });

  test("an expired session on the dashboard lands on the form and keeps the destination", async ({ page, context }) => {
    await context.addCookies(staleSession);
    await page.goto("/dashboard/pages/projects", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fdashboard%2Fpages%2Fprojects$/);
    await expect(page.getByRole("button", { name: "Login to dashboard" })).toBeVisible();
  });

  test("the public navbar has no login link and no dashboard link when logged out", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: /login/i })).toHaveCount(0);
    await expect(header.getByRole("link", { name: "Dashboard" })).toHaveCount(0);
  });
});
