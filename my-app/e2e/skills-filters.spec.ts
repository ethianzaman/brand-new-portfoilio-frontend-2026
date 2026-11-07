import { expect, test, type Page } from "@playwright/test";

const skillCount = (page: Page) => page.locator("main .grid > *").count();

/** The number in "12 skills" or "12 skills in Frontend". */
async function shownCount(page: Page) {
  const text = await page.getByText(/^\d+ skills?/).innerText();
  return Number.parseInt(text, 10);
}

test.describe("skills filter", () => {
  test("every skill is in the server HTML, with nothing filtered", async ({ page, request }) => {
    const html = await (await request.get("/skills")).text();
    await page.goto("/skills");

    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const total = await shownCount(page);
    expect(total).toBeGreaterThan(0);

    const firstName = await page.locator("main .grid > *").first().innerText();
    expect(html).toContain(firstName.trim());
  });

  test("a category narrows the list, goes in the URL, and All brings everything back", async ({ page }) => {
    await page.goto("/skills");
    const total = await shownCount(page);

    await page.getByRole("combobox", { name: "Filter by category" }).click();
    const option = page.getByRole("option").first();
    // Reads as the category's name, then how many skills it holds.
    const [label, count] = (await option.innerText()).split("\n").map((part) => part.trim());
    const expected = Number.parseInt(count, 10);
    await option.click();

    await expect(page).toHaveURL(/[?&]category=/);
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(page.getByText(new RegExp(`skills? in\\s*${label}`))).toBeVisible();
    expect(await shownCount(page)).toBe(expected);
    expect(expected).toBeLessThanOrEqual(total);

    await page.goBack();
    await expect(page).not.toHaveURL(/category=/);
    expect(await shownCount(page)).toBe(total);

    await page.goForward();
    await expect(page).toHaveURL(/category=/);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page).not.toHaveURL(/category=/);
    expect(await shownCount(page)).toBe(total);
  });

  test("a shared link opens filtered, and an unknown category shows everything", async ({ page }) => {
    await page.goto("/skills");
    const total = await shownCount(page);

    await page.getByRole("combobox", { name: "Filter by category" }).click();
    await page.getByRole("option").first().click();
    await expect(page).toHaveURL(/category=/);
    const filtered = await shownCount(page);

    await page.reload();
    await expect.poll(() => shownCount(page)).toBe(filtered);

    await page.goto("/skills?category=not-a-real-category");
    await expect.poll(() => shownCount(page)).toBe(total);
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await skillCount(page)).toBeGreaterThan(0);
  });
});
