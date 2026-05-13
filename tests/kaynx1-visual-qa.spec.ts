import { expect, test } from "@playwright/test";

test.describe("Kaynx1 motion fidelity smoke QA", () => {
  test.setTimeout(60_000);

  test("desktop home loader, hero auto slider, nav open and hover", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3800);
    await expect(page.locator(".site-root")).not.toHaveClass(/is-loading/);
    await page.screenshot({ path: "/tmp/kaynx1-home-after-loader.png", fullPage: false });

    const firstHero = await page.locator(".hero__control.is-active strong").innerText();
    await page.waitForTimeout(5600);
    const nextHero = await page.locator(".hero__control.is-active strong").innerText();
    expect(nextHero).not.toBe(firstHero);

    await page.locator(".hero").hover({ position: { x: 320, y: 360 }, force: true });
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(900);
    const wheelHero = await page.locator(".hero__control.is-active strong").innerText();
    expect(wheelHero).not.toBe(nextHero);

    await page.locator(".site-header__toggle").click();
    await page.waitForTimeout(1150);
    await expect(page.locator(".site-root")).toHaveClass(/is-nav/);
    await expect(page.locator(".site-header__toggle")).toBeVisible();
    await page.screenshot({ path: "/tmp/kaynx1-nav-open.png", fullPage: false });

    await page.locator(".site-header__toggle").hover();
    await page.waitForTimeout(350);
    await page.screenshot({ path: "/tmp/kaynx1-nav-open-hover.png", fullPage: false });
  });

  test("mobile nav keeps close toggle and door switch visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3800);
    await page.locator(".site-header__toggle").click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".site-root")).toHaveClass(/is-nav/);
    await expect(page.locator(".site-header__toggle")).toBeVisible();
    await expect(page.locator(".nav-overlay__mobile-door-toggle")).toBeVisible();
    await page.screenshot({ path: "/tmp/kaynx1-mobile-nav-open.png", fullPage: false });

    await page.locator(".nav-overlay__mobile-door-toggle").click();
    await page.waitForTimeout(900);
    await expect(page.locator(".site-root")).toHaveClass(/is-door/);
    await page.screenshot({ path: "/tmp/kaynx1-mobile-door-open.png", fullPage: false });
  });

  test("figures rail wheel inertia, hover color, index and idle clock work", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/figures", { waitUntil: "networkidle" });
    await page.waitForTimeout(4200);
    await page.screenshot({ path: "/tmp/kaynx1-figures-grid.png", fullPage: false });

    await page.locator(".figures-index__grid-item.is-active .figures-index__link").first().hover({ force: true });
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
    await expect(page.locator(".site-root")).toHaveClass(/is-clock/);
    await page.screenshot({ path: "/tmp/kaynx1-figures-idle-clock.png", fullPage: false });
  });
});
