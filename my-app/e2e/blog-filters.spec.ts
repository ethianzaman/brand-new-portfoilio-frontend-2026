import { expect, test, type Page } from "@playwright/test";

const select = (page: Page) =>
  page.getByRole("combobox", { name: "Filter by category" });
const allButton = (page: Page) =>
  page.getByRole("button", { name: "All", exact: true });
const summary = (page: Page) => page.locator('p[aria-live="polite"]');

/** Picks the first category from the dropdown and returns its name. */
async function pickFirstCategory(page: Page) {
  await select(page).click();
  const option = page.getByRole("option").first();
  await expect(option).toBeVisible();
  const name = (await option.locator("span span").first().innerText()).trim();
  await option.click();
  return name;
}

test.describe("blog filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await expect(select(page)).toBeVisible();
  });

  test("post cards are part of the server HTML", async ({ request }) => {
    const html = await (await request.get("/blog")).text();
    expect(html).toContain("Read article");
  });

  test("All and a category switch, and the URL follows", async ({ page }) => {
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "true");

    const name = await pickFirstCategory(page);
    await expect
      .poll(() => new URL(page.url()).searchParams.get("category"))
      .toBe(name);
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "false");
    await expect(select(page)).toContainText(name);
    await expect(summary(page)).toContainText(`in ${name}`);

    await allButton(page).click();
    await expect(page).not.toHaveURL(/category=/);
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(select(page)).toContainText("Category");
  });

  test("only the selected category is listed, as an ordinary grid", async ({ page }) => {
    const name = await pickFirstCategory(page);
    await expect(page.getByText("Featured", { exact: true })).toHaveCount(0);

    const total = Number((await summary(page).innerText()).split(" ")[0]);
    const seeMore = page.getByRole("button", { name: "See More Articles" });
    while (await seeMore.isVisible()) await seeMore.click();

    const cards = page.locator('a[href^="/blog/"]');
    await expect(cards).toHaveCount(total);
    for (const badge of await cards.locator("span.absolute").allInnerTexts()) {
      expect(badge).toBe(name);
    }
  });

  test("back, reload and shared links keep the filter", async ({ page }) => {
    const name = await pickFirstCategory(page);

    await page.reload();
    await expect(select(page)).toContainText(name);

    await allButton(page).click();
    await page.goBack();
    await expect(select(page)).toContainText(name);
    await page.goBack();
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "true");
  });

  test("an unknown category in the link falls back to all", async ({ page }) => {
    await page.goto("/blog?category=does-not-exist");
    await expect(allButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("No articles found")).toHaveCount(0);
  });

  test("no result offers a way back", async ({ page }) => {
    await page.getByLabel("Search articles").fill("zzzz-no-such-article");
    await expect(page.getByText("No articles found")).toBeVisible();
    await expect(summary(page)).toContainText("0 articles");

    await page.getByRole("button", { name: "Clear filters" }).last().click();
    await expect(page.getByText("No articles found")).toHaveCount(0);
    await expect(page.getByLabel("Search articles")).toHaveValue("");
  });

  test("the filter bar fits a phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
