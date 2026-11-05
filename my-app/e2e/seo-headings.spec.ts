import { expect, test } from "@playwright/test";

const PAGES = ["/", "/about", "/services", "/projects", "/skills", "/blog", "/contact"];

test.describe("page headings", () => {
  for (const path of PAGES) {
    test(`${path} has exactly one h1`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    });
  }

  test("the landing page keeps its sections as h2", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html.match(/<h2[\s>]/g)?.length).toBeGreaterThanOrEqual(5);
  });
});
