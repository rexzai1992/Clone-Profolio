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

  test("hero image opens the active slide destination", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3800);

    await page.locator(".hero-slideshow__slide.is-active .hero-slideshow__media").click({ position: { x: 720, y: 420 } });

    await expect(page).toHaveURL(/\/dev\/?$/);
  });

  test("mobile nav keeps close toggle and door switch visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3800);
    await page.locator(".auto-header__menu").click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".site-root")).toHaveClass(/is-nav-open/);
    await expect(page.getByRole("button", { name: "Close navigation" })).toBeVisible();
    await page.screenshot({ path: "/tmp/kaynx1-mobile-nav-open.png", fullPage: false });

    await page.locator(".nav-overlay__door-btn").click();
    await page.waitForTimeout(900);
    await expect(page.locator(".nav-overlay")).toHaveClass(/is-door-open/);
    await page.screenshot({ path: "/tmp/kaynx1-mobile-door-open.png", fullPage: false });
  });

  test("resume matches the technical editorial layout on desktop and mobile", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/about", { waitUntil: "networkidle" });
    await page.waitForTimeout(3800);
    await expect(page.locator(".resume-sheet__header h1")).toContainText("IZZUL");
    await expect(page.locator(".resume-block")).toHaveCount(6);
    await expect(page.locator(".resume-projects article")).toHaveCount(5);
    await page.screenshot({ path: "/tmp/kaynx1-resume-desktop.png", fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".resume-sheet__grid")).toBeVisible();
    await expect(page.locator(".resume-job__heading").first()).toBeVisible();
    await page.screenshot({ path: "/tmp/kaynx1-resume-mobile.png", fullPage: true });
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

  test("work and games reuse the figure carousel interactions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const collection of [
      { path: "/games", heading: "Work & Games", count: 31 },
      { path: "/dev", heading: "Work & Games", count: 31 }
    ]) {
      await page.goto(collection.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(4200);

      const carousel = page.locator(".figures-index");
      await expect(carousel).toHaveAttribute("data-nav", "grid");
      await expect(page.locator(".figures-index__heading h1")).toHaveText(collection.heading);
      await expect(page.locator(".figures-index__grid-item")).toHaveCount(collection.count);
      await expect(page.locator(".figures-index__main > span")).toHaveCount(0);
      const carouselColors = await page.locator(".figures-index__link").evaluateAll((links) =>
        links.map((link) => getComputedStyle(link).getPropertyValue("--figure-card-color").trim())
      );
      expect(new Set(carouselColors).size).toBe(Math.min(collection.count, 16));
      await page.locator(".figures-index__grid-item.is-active .figures-index__image").first().hover({ force: true });
      await page.waitForTimeout(250);
      const engagedColor = await carousel.evaluate((node) => getComputedStyle(node).getPropertyValue("--figure-character").trim());
      expect(carouselColors).toContain(engagedColor);
      await page.mouse.move(20, 20);

      const firstTransform = await page.locator(".figures-index__grid-item").first().evaluate((node) => getComputedStyle(node).transform);
      await page.mouse.wheel(0, 420);
      await page.waitForTimeout(900);
      const secondTransform = await page.locator(".figures-index__grid-item").first().evaluate((node) => getComputedStyle(node).transform);
      expect(secondTransform).not.toBe(firstTransform);

      await page.getByRole("button", { name: "Index" }).click();
      await expect(page.locator(".figures-index__index-link")).toHaveCount(collection.count);
      // PixelMend (a dev project) also uses a -cover-v2.webp file; only the game covers count here.
      const generatedGameCovers = page.locator('.figures-index__index-visual img[src*="-cover-v2.webp"]:not([src*="pixelmend"])');
      await expect(generatedGameCovers).toHaveCount(10);
      await generatedGameCovers.first().scrollIntoViewIfNeeded();
      await expect.poll(() => generatedGameCovers.first().evaluate((image) =>
        image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
      )).toBe(true);
      await expect(page.locator(".figures-index__index-copy strong").filter({ hasText: "CardBiz ECR Terminal" })).toBeVisible();
      await expect(page.locator(".figures-index__index-heading h2")).toHaveText([
        "Business Platforms",
        "Infrastructure & Automation",
        "AI & Computer Vision",
        "Hardware Integrations",
        "Security & Developer Tools",
        "Creative Technology",
        "Interactive Games"
      ]);
      await expect(page.getByText("Private case study")).toHaveCount(7);
      await page.screenshot({ path: `/tmp/kaynx1-${collection.path.slice(1)}-index-redesign.png`, fullPage: true });

      await page.getByRole("button", { name: "Index" }).click();
      await page.waitForTimeout(500);
      await expect(carousel).toHaveAttribute("data-nav", "index");
    }
  });

  test("mobile work carousel keeps one complete project card inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dev", { waitUntil: "networkidle" });
    await page.waitForTimeout(4200);

    const centeredCard = page.locator(".figures-index__grid-item.is-centered .figures-index__link");
    await expect(centeredCard).toHaveCount(1);
    const cardBox = await centeredCard.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.x).toBeGreaterThanOrEqual(0);
    expect(cardBox!.x + cardBox!.width).toBeLessThanOrEqual(390);

    const initialTransform = await page.locator(".figures-index__grid-item").first().evaluate((node) => getComputedStyle(node).transform);
    await page.waitForTimeout(1800);
    const settledTransform = await page.locator(".figures-index__grid-item").first().evaluate((node) => getComputedStyle(node).transform);
    expect(settledTransform).toBe(initialTransform);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.screenshot({ path: "/tmp/kaynx1-mobile-dev-responsive.png", fullPage: false });
  });

  test("slow project images reveal a styled first card without a blank page", async ({ page }) => {
    await page.route("**/images/projects/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dev", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(650);

    await expect(page.locator(".figures-index__image-skeleton").first()).toBeVisible();
    const rootOpacity = await page.locator(".site-root").evaluate((node) => Number.parseFloat(getComputedStyle(node).opacity));
    expect(rootOpacity).toBeGreaterThan(0.25);
    await expect(page.locator('.figures-index__image img[loading="eager"]')).toHaveCount(1);
    await page.screenshot({ path: "/tmp/kaynx1-mobile-slow-image-placeholder.png", fullPage: false });
  });
});
