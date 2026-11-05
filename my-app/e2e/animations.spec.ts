import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ROUTES = ["/", "/services", "/projects", "/about", "/blog", "/contact", "/skills"];

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      // Observers only report after a rendered frame, so wait for two.
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
}

const count = (page: Page, phase: string) =>
  page.locator(`.reveal[data-reveal="${phase}"]`).count();

// Remote images hold back the load event and have nothing to do with animation.
const blockImages = (context: BrowserContext) =>
  context.route("**/*", (route) =>
    route.request().resourceType() === "image" ? route.abort() : route.continue(),
  );

test.beforeEach(({ context }) => blockImages(context));

for (const route of ROUTES) {
  test.describe(`section animations on ${route}`, () => {
    test("every section is visible once scrolled through and leaves no transform", async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("h1").first()).toBeVisible();
      await scrollThrough(page);

      await expect.poll(() => count(page, "hidden")).toBe(0);
      await expect
        .poll(() =>
          page.locator(".reveal").evaluateAll((els) =>
            els.filter((el) => {
              const style = getComputedStyle(el);
              return style.opacity !== "1" || style.transform !== "none";
            }).length,
          ),
          { timeout: 5_000 },
        )
        .toBe(0);
    });

    test("nothing is hidden or animated with reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      await expect(page.locator("h1").first()).toBeVisible();

      const states = await page.locator(".reveal").evaluateAll((els) =>
        els.map((el) => {
          const style = getComputedStyle(el);
          return `${style.opacity}|${style.animationName}`;
        }),
      );
      expect(states.length).toBeGreaterThan(0);
      expect(new Set(states)).toEqual(new Set(["1|none"]));
    });

    test("nothing stays hidden in print", async ({ page }) => {
      await page.goto(route);
      await page.emulateMedia({ media: "print" });

      const hidden = await page.locator(".reveal").evaluateAll((els) =>
        els.filter((el) => getComputedStyle(el).opacity !== "1").length,
      );
      expect(hidden).toBe(0);
    });
  });
}

test("rendered content finishes visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await blockImages(context);
  const page = await context.newPage();
  await page.goto("/");
  // Content behind the route's loading.tsx stays in Next's [hidden] streaming
  // wrapper without JS, so only what the browser actually renders counts.
  const rendered = page.locator(".reveal:not([hidden] .reveal)");
  await expect.poll(() => rendered.count()).toBeGreaterThan(0);
  await expect
    .poll(() =>
      rendered.evaluateAll((els) =>
        els.filter((el) => getComputedStyle(el).opacity !== "1").length,
      ),
    )
    .toBe(0);
  await context.close();
});

test("jumping past sections never leaves content hidden on screen", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => count(page, "hidden")).toBeGreaterThan(0);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const hiddenInView = () =>
    page.locator('.reveal[data-reveal="hidden"]').evaluateAll((els) =>
      els.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      }).length,
    );
  await expect.poll(hiddenInView).toBe(0);

  await page.evaluate(async () => {
    for (let y = window.scrollY; y > 0; y -= window.innerHeight * 0.5) {
      window.scrollTo(0, y);
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    }
    window.scrollTo(0, 0);
  });
  await expect.poll(() => count(page, "hidden")).toBe(0);
});

test("home sections wait for scroll instead of animating off screen", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => count(page, "hidden")).toBeGreaterThan(0);

  const heading = page.getByRole("heading", { level: 2, name: "Services", exact: true });
  const reveal = heading.locator("xpath=ancestor::*[contains(@class,'reveal')][1]");
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");

  await heading.scrollIntoViewIfNeeded();
  await expect(reveal).toHaveAttribute("data-reveal", /shown|done/);
  await expect(reveal).toHaveCSS("opacity", "1");
});

test("keyboard focus reveals hidden content", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("footer").getByRole("link", { name: "Get in touch" });
  const reveal = link.locator("xpath=ancestor::*[contains(@class,'reveal')][1]");
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");

  await link.focus();
  await expect(reveal).toHaveAttribute("data-reveal", /shown|done/);
});

test("contact dropdown opens above the sections after it", async ({ page }) => {
  await page.goto("/contact");
  await scrollThrough(page);
  await page.locator("#subject").scrollIntoViewIfNeeded();
  await page.locator("#subject").click();

  const list = page.locator("#subject").locator("xpath=following-sibling::div[1]");
  await expect(list).toHaveCSS("opacity", "1");

  const onTop = await list.evaluate((el) => {
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.bottom - 4);
    return Boolean(top && el.contains(top));
  });
  expect(onTop).toBe(true);
});

test("back to top stays pinned to the viewport", async ({ page }) => {
  await page.goto("/");
  await scrollThrough(page);

  const button = page.locator("button.fixed").first();
  await expect(button).toBeVisible();
  const viewport = page.viewportSize();
  const box = await button.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  expect(box!.y).toBeGreaterThan(viewport!.height / 2);
});
