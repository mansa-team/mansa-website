import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await expect(page.locator('[data-entry-intro]')).toBeHidden();
}

test.describe('desktop scroll enhancement', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });

  test('scroll clock rests completely before and after wheel input', async ({ page }) => {
    await ready(page);
    await page.evaluate(() => {
      const root = document.documentElement;
      root.dataset.testScrollEnds = '0';
      window.addEventListener('scrollend', (event) => {
        if (event instanceof CustomEvent && event.detail?.lenisScrollEnd) {
          root.dataset.testScrollEnds = String(Number(root.dataset.testScrollEnds) + 1);
        }
      });
    });
    await expect(page.locator('.hero-art')).toHaveAttribute('data-motion-state', 'settled');
    const idleFrames = () =>
      page.evaluate(async () => {
        // Drain callbacks queued by the final scroll event before measuring rest.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        const original = window.requestAnimationFrame;
        let callbacks = 0;
        window.requestAnimationFrame = (callback) =>
          original((time) => {
            callbacks++;
            callback(time);
          });
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.requestAnimationFrame = original;
        return callbacks;
      });
    expect(await idleFrames()).toBe(0);
    await page.mouse.move(1000, 650);
    await page.mouse.wheel(0, 640);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(638);
    await expect(page.locator('html')).toHaveAttribute('data-test-scroll-ends', '1');
    await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
    expect(await idleFrames()).toBe(0);
    // A later gesture must restart with a fresh clock, not consume the idle time as one frame.
    await page.mouse.wheel(0, 320);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(958);
    await expect(page.locator('html')).toHaveAttribute('data-test-scroll-ends', '2');
    await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
    expect(await idleFrames()).toBe(0);
  });

  test('wheel smoothing settles promptly, and keyboard can interrupt it', async ({ page }) => {
    await ready(page);
    await page.mouse.move(1000, 650);
    await page.mouse.wheel(0, 640);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(600);
    await page.mouse.wheel(0, 1500);
    await page.keyboard.press('Home');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
    await page.waitForTimeout(450);
    expect(await page.evaluate(() => scrollY)).toBeLessThan(2);
    await page.keyboard.press('PageDown');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  });

  test('native anchors, history and focused links retain their destination', async ({ page }) => {
    await ready(page);
    const index = page.getByRole('navigation', { name: 'Princípios da Mansa' });
    const link = index.getByRole('link', { name: 'Constância' });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#principio-constancia$/);
    await expect(link).toHaveAttribute('aria-current', 'location');
    await expect(
      page.getByRole('heading', { name: 'Dar espaço ao longo prazo.' }),
    ).toBeInViewport();
    await index.getByRole('link', { name: 'Compreensão' }).click();
    await expect(page).toHaveURL(/#principio-compreensao$/);
    await page.goBack();
    await expect(page).toHaveURL(/#principio-constancia$/);
    await expect(
      page.getByRole('heading', { name: 'Dar espaço ao longo prazo.' }),
    ).toBeInViewport();
  });

  test('preference changes destroy smoothing without locking native scrolling', async ({
    page,
  }) => {
    await ready(page);
    await page.mouse.move(1000, 650);
    await page.mouse.wheel(0, 900);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.keyboard.press('End');
    await expect(page.locator('footer')).toBeInViewport();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).toHaveClass(/lenis/);
    await page.setViewportSize({ width: 800, height: 900 });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.keyboard.press('Home');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  });

  test('reduced motion keeps Lenis removed after the native scroll timer finishes', async ({
    page,
  }) => {
    await ready(page);
    const time = new Date('2026-10-13T12:00:00');
    await page.clock.install({ time });
    await page.clock.pauseAt(new Date(time.getTime() + 60000));
    await page.evaluate(() => window.scrollTo(0, 640));
    await expect(page.locator('html')).toHaveClass(/lenis-scrolling/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.clock.runFor(401);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    expect(await page.evaluate(() => scrollY)).toBe(640);
  });

  test('repeated route navigation leaves wheel travel and contact available', async ({ page }) => {
    await ready(page);
    for (let i = 0; i < 2; i++) {
      await page.getByRole('link', { name: 'Converse sobre o projeto', exact: true }).click();
      await expect(page).toHaveURL('/contato/');
      await page.getByRole('link', { name: 'Mansa — início', exact: true }).first().click();
      await expect(page).toHaveURL('/');
    }
    await page.mouse.move(1000, 650);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(480);
    expect(await page.evaluate(() => scrollY)).toBeLessThan(520);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });
});

for (const mode of ['reduce', 'saveData', 'touch', 'small'] as const) {
  test(`${mode} keeps native scrolling`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: mode === 'small' ? 1079 : 1440, height: 900 },
      hasTouch: mode === 'touch',
      isMobile: mode === 'touch',
      reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference',
    });
    if (mode === 'saveData')
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'connection', {
          configurable: true,
          value: { saveData: true },
        });
      });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(400);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.locator('#pesquisa').scrollIntoViewIfNeeded();
    await expect(page.locator('#pesquisa')).toBeInViewport();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await context.close();
  });
}
