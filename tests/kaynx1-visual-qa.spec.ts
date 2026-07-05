import { expect, test } from "@playwright/test";

test.describe("Kaynx1 motion fidelity smoke QA", () => {
  test.setTimeout(60_000);

  test("desktop home loader, hero auto slider, nav open and hover", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3800);
    await expect(page.locator(".site-root")).not.toHaveClass(/is-loading/);
    await expect(page.locator(".hero-slideshow")).toHaveAttribute("data-intro", "true");
    await page.screenshot({ path: "/tmp/kaynx1-home-after-loader.png", fullPage: false });

    const activeControl = page.locator(".hero-slideshow__control ._item.is-active ._title");
    const firstHero = await activeControl.innerText();
    await page.waitForTimeout(5600);
    const nextHero = await activeControl.innerText();
    expect(nextHero).not.toBe(firstHero);

    await page.locator(".hero-slideshow").hover({ position: { x: 320, y: 360 }, force: true });
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(1300);
    const wheelHero = await activeControl.innerText();
    expect(wheelHero).not.toBe(nextHero);

    await page.locator(".auto-header__menu").click();
    await page.waitForTimeout(1150);
    await expect(page.locator(".site-root")).toHaveClass(/is-nav-open/);
    await expect(page.locator(".nav-overlay")).toHaveClass(/is-open/);
    await page.screenshot({ path: "/tmp/kaynx1-nav-open.png", fullPage: false });
  });

  test("mobile nav keeps close toggle and door switch visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3800);
    await page.locator(".auto-header__menu").click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".site-root")).toHaveClass(/is-nav-open/);
    await expect(page.locator(".nav-overlay__close")).toBeVisible();
    await page.screenshot({ path: "/tmp/kaynx1-mobile-nav-open.png", fullPage: false });

    await page.locator(".nav-overlay__door-btn").click();
    await page.waitForTimeout(900);
    await expect(page.locator(".nav-overlay")).toHaveClass(/is-door-open/);
    await page.screenshot({ path: "/tmp/kaynx1-mobile-door-open.png", fullPage: false });
  });

  test("figures rail wheel inertia, hover color, index and idle clock work", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/figures", { waitUntil: "networkidle" });
    await page.waitForTimeout(4200);
    await page.screenshot({ path: "/tmp/kaynx1-figures-grid.png", fullPage: false });

    await page.locator(".figures-index__grid-item.is-active .figures-index__image").first().hover({ force: true });
    await page.waitForTimeout(600);
    const figureBg = await page
      .locator(".figures-index")
      .evaluate((node) => getComputedStyle(node).getPropertyValue("--figure-character").trim());
    expect(figureBg).not.toBe("#ffffff");
    await page.screenshot({ path: "/tmp/kaynx1-figures-hover-color.png", fullPage: false });

    const firstTransform = await page.locator(".figures-index__grid-item").first().evaluate((node) => getComputedStyle(node).transform);
    await page.mouse.wheel(0, 460);
    await page.waitForTimeout(1000);
    const secondTransform = await page.locator(".figures-index__grid-item").first().evaluate((node) => getComputedStyle(node).transform);
    expect(secondTransform).not.toBe(firstTransform);

    await page.getByRole("button", { name: "Index" }).click();
    await page.waitForTimeout(700);
    await expect(page.locator(".figures-index")).toHaveAttribute("data-nav", "index");
    await page.screenshot({ path: "/tmp/kaynx1-figures-index.png", fullPage: false });

    await page.getByRole("button", { name: "Grid" }).click();
    await page.waitForTimeout(900);
    await page.mouse.move(20, 20);
    await page.waitForTimeout(11_200);
    await expect(page.locator(".live-clock")).toHaveClass(/is-shown/);
    await page.screenshot({ path: "/tmp/kaynx1-figures-idle-clock.png", fullPage: false });
  });
});
