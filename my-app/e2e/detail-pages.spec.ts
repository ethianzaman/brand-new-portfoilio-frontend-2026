import { expect, test, type APIRequestContext } from "@playwright/test";

/** Detail links in a listing, read from the page so any data set works. */
async function detailLinks(request: APIRequestContext, listing: string) {
  const html = await (await request.get(listing)).text();
  const found = html.matchAll(new RegExp(`href="(${listing}/[a-z0-9-]+)"`, "g"));
  return [...new Set([...found].map((match) => match[1]))];
}

for (const listing of ["/projects", "/services"]) {
  test.describe(`${listing} detail pages`, () => {
    test("a card opens a page with one h1", async ({ request, page }) => {
      const [first] = await detailLinks(request, listing);
      test.skip(!first, "this data set has no detail pages");

      const res = await page.goto(first);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).not.toBeEmpty();
    });

    test("an unknown address is a real 404", async ({ request }) => {
      const res = await request.get(`${listing}/no-such-page-exists`);
      expect(res.status()).toBe(404);
    });
  });
}
