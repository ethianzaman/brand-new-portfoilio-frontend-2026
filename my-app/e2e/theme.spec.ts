import { expect, test, type Page } from "@playwright/test";

const saveTheme = (page: Page, theme: string) =>
  page.addInitScript((value) => localStorage.setItem("theme", value), theme);

test("the server HTML keeps an executable theme script", async ({ request }) => {
  const html = await (await request.get("/contact")).text();
  const scripts = html.match(/<script\b[^>]*>[^<]*localStorage[^<]*<\/script>/g) ?? [];
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts[0]).not.toMatch(/type="application\/json"/);
});

for (const theme of ["dark", "light"]) {
  test(`saved ${theme} theme applies before hydration, so there is no flash`, async ({ page }) => {
    await saveTheme(page, theme);
    // With app bundles blocked React never hydrates: only the inline script can set this.
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`));
  });

  test(`saved ${theme} theme survives hydration and reload`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await saveTheme(page, theme);
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await page.reload();
    await expect(page.locator("html")).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`));
    expect(errors).toEqual([]);
  });
}
