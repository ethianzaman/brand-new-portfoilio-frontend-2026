import { expect, test } from "@playwright/test";
import {
  legacySocial,
  resolveSocials,
  socialLogoUrl,
  uniqueByLabel,
} from "../lib/socials";

const github = legacySocial("GitHub", "https://github.com/me");
const linkedin = legacySocial("LinkedIn", "https://linkedin.com/in/me");
const youtube = legacySocial("YouTube", "https://youtube.com/@me");
const library = [github, linkedin, youtube];

test.describe("resolveSocials", () => {
  test("a section shows exactly its selected links, in the chosen order", () => {
    const settings = {
      socials: library,
      socialsConfigured: true,
      socialPlacements: { footer: [youtube.id, github.id] },
    };
    expect(resolveSocials(settings, "footer")).toEqual([youtube, github]);
  });

  test("a section with nothing selected shows nothing", () => {
    const settings = {
      socials: library,
      socialsConfigured: true,
      socialPlacements: { footer: [github.id], about: [] },
    };
    expect(resolveSocials(settings, "about")).toEqual([]);
    expect(resolveSocials(settings, "blog")).toEqual([]);
  });

  test("a link that no longer exists is skipped", () => {
    const settings = {
      socials: [github],
      socialsConfigured: true,
      socialPlacements: { navbar: ["deleted", github.id] },
    };
    expect(resolveSocials(settings, "navbar")).toEqual([github]);
  });

  test("before migration the shared sections keep the whole list", () => {
    const settings = { socials: library, socialsConfigured: false };
    expect(resolveSocials(settings, "navbar")).toEqual(library);
    expect(resolveSocials(settings, "mobileMenu")).toEqual(library);
    expect(resolveSocials(settings, "footer")).toEqual(library);
    expect(resolveSocials(settings, "about")).toEqual([]);
  });
});

test("uniqueByLabel keeps the first link for each name, ignoring case", () => {
  const second = legacySocial("github", "https://github.com/other");
  expect(uniqueByLabel([github, linkedin, second, youtube])).toEqual([
    github,
    linkedin,
    youtube,
  ]);
  expect(uniqueByLabel([linkedin, second])).toEqual([linkedin, second]);
});

test.describe("socialLogoUrl", () => {
  test("requests a small, optimised copy of a Cloudinary logo", () => {
    expect(
      socialLogoUrl(
        "https://res.cloudinary.com/demo/image/upload/v1/portfolio_socials/a.svg",
      ),
    ).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_96,h_96/v1/portfolio_socials/a.svg",
    );
  });

  test("leaves any other URL alone", () => {
    const url = "https://example.com/logo.png";
    expect(socialLogoUrl(url)).toBe(url);
  });
});

test("the public site still renders social links from the settings", async ({ page, request }) => {
  const response = await request.get("/api/backend/settings");
  expect(response.ok()).toBe(true);
  const { settings } = await response.json();
  test.skip(!settings.socials?.length, "no social links in this database");

  const expected = settings.socialsConfigured
    ? settings.socialPlacements.footer.length
    : settings.socials.length;

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  const footerLinks = page.locator("footer a[aria-label]");
  await expect(footerLinks).toHaveCount(expected);
});
