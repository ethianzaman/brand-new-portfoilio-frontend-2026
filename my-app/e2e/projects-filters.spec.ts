import { expect, test, type Page } from "@playwright/test";

const select = (page: Page) =>
  page.getByRole("combobox", { name: "Filter by category" });
const allButton = (page: Page) =>
  page.getByRole("button", { name: "All", exact: true });
const summary = (page: Page) => page.locator('p[aria-live="polite"]');

async function pick(page: Page, label: string) {
  await select(page).click();
  await page.getByRole("option", { name: label }).click();
}

test.describe("projects filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
    await expect(select(page)).toBeVisible();
  });

  test("first page is part of the server HTML", async ({ request }) => {
    const html = await (await request.get("/projects")).text();
    expect(html).toContain('href="/projects');
  });

  test("offers every category but not a second All", async ({ page }) => {
    await select(page).click();
    await expect(page.getByRole("option")).toHaveCount(6);
    await expect(page.getByRole("option", { name: "All Projects" })).toHaveCount(0);
  });

  test("a category loads its projects and the URL follows", async ({ page, request }) => {
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "true");

    await pick(page, "Mobile App");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("category"))
      .toBe("mobile");
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "false");
    await expect(select(page)).toContainText("Mobile App");

    const api = await request.get("/api/backend/projects?category=mobile&page=1&pageSize=3");
    const { total, projects } = await api.json();
    await expect(summary(page)).toHaveText(
      `${total} project${total === 1 ? "" : "s"} in Mobile App`,
    );
    for (const project of projects) {
      await expect(page.getByText(project.title, { exact: true }).first()).toBeVisible();
    }

    await allButton(page).click();
    await expect(page).not.toHaveURL(/category=/);
    await expect(select(page)).toContainText("Category");
    await expect(summary(page)).not.toContainText(" in ");
  });

  test("see more stays inside the category", async ({ page, request }) => {
    await pick(page, "Mobile App");
    const api = await request.get("/api/backend/projects?category=mobile&page=1&pageSize=100");
    const { total } = await api.json();
    await expect(summary(page)).toContainText(`${total} project`);

    const seeMore = page.getByRole("button", { name: "See More Projects" });
    while (await seeMore.isVisible()) {
      await seeMore.click();
      await expect(summary(page)).not.toContainText("Loading");
    }
    await expect(summary(page)).toContainText(`${total} project`);
  });

  test("reload, back and shared links keep the filter", async ({ page }) => {
    await pick(page, "Mobile App");
    await expect(summary(page)).toContainText("in Mobile App");

    await page.reload();
    await expect(select(page)).toContainText("Mobile App");
    await expect(summary(page)).toContainText("in Mobile App");

    await allButton(page).click();
    await expect(summary(page)).not.toContainText(" in ");
    await page.goBack();
    await expect(summary(page)).toContainText("in Mobile App");
    await page.goBack();
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(summary(page)).not.toContainText(" in ");

    await page.goto("/projects?category=ai");
    await expect(select(page)).toContainText("AI / ML");
    await expect(summary(page)).toContainText("in AI / ML");
  });

  test("quick switching ends on the last choice", async ({ page }) => {
    await pick(page, "Mobile App");
    await pick(page, "AI / ML");
    await expect(summary(page)).toContainText("in AI / ML");
    await page.waitForTimeout(1000);
    await expect(summary(page)).toContainText("in AI / ML");
  });

  test("an unknown category in the link falls back to all", async ({ page }) => {
    await page.goto("/projects?category=does-not-exist");
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(summary(page)).toContainText("project");
    await expect(summary(page)).not.toContainText(" in ");
  });

  test("the filter fits a phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
