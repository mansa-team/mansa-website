import { expect, test } from '@playwright/test';

test('the opening animates the atlas while reading and contact stay available', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    (window as unknown as { heroAnimations: number }).heroAnimations = 0;
    Element.prototype.animate = function (...args) {
      if (this.closest('.hero-art'))
        (window as unknown as { heroAnimations: number }).heroAnimations++;
      return animate.apply(this, args);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Converse sobre o projeto' })).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { heroAnimations: number }).heroAnimations),
    )
    .toBeGreaterThan(0);
  await expect(page.locator('.hero-art')).toHaveAttribute('data-motion-state', 'settled');
  expect(
    await page.locator('.hero-art').evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
});

test('pointer response settles and reduced motion removes the offset immediately', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const art = page.locator('.hero-art');
  const lens = page.locator('[data-hero-lens]');
  await expect(art).toHaveAttribute('data-motion-state', 'settled');
  const box = await art.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.8, box!.y + 70);
  await expect.poll(() => lens.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(lens).toHaveCSS('transform', 'none');
  expect(await art.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test('scroll interrupts the opening and no animation is required for a direct anchor', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.closest('.hero-art'))
        options = { ...(options as KeyframeAnimationOptions), duration: 10000 };
      return animate.call(this, frames, options);
    };
  });
  await page.goto('/');
  await expect(page.locator('.hero-art')).toHaveAttribute('data-motion-state', 'opening');
  await page.keyboard.press('PageDown');
  await expect(page.locator('.hero-art')).toHaveAttribute('data-motion-state', 'settled');
  await page.goto('/contato/');
  await page.goto('/#pesquisa');
  await expect(page.locator('.hero-art')).toHaveAttribute('data-motion-state', 'static');
  await expect(page.locator('#research-title')).toBeVisible();
});

test('data-saving mode keeps illustrations and editorial content static throughout reading', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, addEventListener() {}, removeEventListener() {} },
    });
    (window as unknown as { decorativeAnimations: number }).decorativeAnimations = 0;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.closest('.hero-art,[data-editorial-reveal]'))
        (window as unknown as { decorativeAnimations: number }).decorativeAnimations++;
      return animate.apply(this, args);
    };
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.locator('#pesquisa').scrollIntoViewIfNeeded();
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await expect(
    page.getByRole('heading', { name: 'Uma ideia com trabalho por trás.' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as unknown as { decorativeAnimations: number }).decorativeAnimations,
    ),
  ).toBe(0);
});

test('an editorial entrance stops as soon as its section leaves the viewport', async ({ page }) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.hasAttribute('data-editorial-reveal'))
        options = { ...(options as KeyframeAnimationOptions), duration: 10000 };
      return animate.call(this, frames, options);
    };
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const intro = page.locator('.intro-main');
  await intro.scrollIntoViewIfNeeded();
  await expect.poll(() => intro.evaluate((el) => el.getAnimations().length)).toBe(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => intro.evaluate((el) => el.getAnimations().length)).toBe(0);
  await expect(intro).toHaveCSS('opacity', '1');
});
