/**
 * Shore Eats Mobile — Web Smoke Tests
 *
 * Runs against a static `expo export --platform web` build (see playwright.config.ts).
 * The point isn't to validate live restaurant data — it's to catch the class of bug
 * that shipped on 2026-07-04: a newly-installed package left Metro's bundler cache
 * stale, so the app threw "Unable to resolve module ./FontLoader" the moment it
 * tried to run, well after `tsc --noEmit` had already passed clean. `expo export`
 * fails loudly on that; this test proves the exported bundle actually boots.
 */
import { test, expect } from "@playwright/test";

test.describe("App boot", () => {
  test("renders the home screen without a white page or JS crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");

    await expect(page.getByText("North Jersey Eats", { exact: true })).toBeVisible();
    await expect(page.getByText("The best local restaurants in one place.", { exact: false })).toBeVisible();

    // The restaurant list resolves to *something* — real cards if a backend is
    // reachable, or the visible error message if not. Either is fine here; a
    // stuck spinner or blank screen is not.
    await expect(page.getByText("Couldn't load restaurants").or(page.locator("text=/⭐/"))).toBeVisible({
      timeout: 15_000,
    });

    const html = await page.content();
    expect(html.length).toBeGreaterThan(500);

    // Module-resolution / bundling errors are exactly what today's bug looked like —
    // fail on those specifically rather than on any network noise from a missing backend.
    const fatal = errors.filter(
      (e) => /unable to resolve module|is not a function|is not defined|cannot read propert/i.test(e)
    );
    expect(fatal).toEqual([]);
  });
});
