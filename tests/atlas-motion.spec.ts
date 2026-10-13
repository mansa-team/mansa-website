import { test, expect, type Page } from '@playwright/test';

async function positionChapter(page: Page, id: string, fraction: number) {
  await page.locator(`#principio-${id}`).evaluate((element, fraction) => {
    const box = element.getBoundingClientRect();
    window.scrollTo({
      top: scrollY + box.top - innerHeight * 0.4 + box.height * fraction,
      behavior: 'instant',
    });
  }, fraction);
}

test('desktop contributions advance in order and reverse with the reading position', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.atlas-stage')).toHaveAttribute('data-enhanced', 'true');
  const periods = page.locator('.atlas-sticky .atlas-period');
  await positionChapter(page, 'constancia', 0.1);
  await expect
    .poll(async () => Number(await periods.last().evaluate((el) => getComputedStyle(el).opacity)))
    .toBeLessThan(0.5);
  await expect
    .poll(async () => Number(await periods.first().evaluate((el) => getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.9);
  await positionChapter(page, 'constancia', 0.6);
  await expect(periods.last()).toHaveCSS('opacity', '1');
  await positionChapter(page, 'constancia', 0.1);
  await expect
    .poll(async () => Number(await periods.last().evaluate((el) => getComputedStyle(el).opacity)))
    .toBeLessThan(0.5);
  await expect(page.locator('.atlas-index [aria-current]')).toHaveText('Constância');
});

test('perspective connects after the company; comprehension connects before its explanation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.atlas-stage')).toHaveAttribute('data-enhanced', 'true');
  await positionChapter(page, 'perspectiva', 0.16);
  const company = page.locator('.atlas-sticky .atlas-diagram--0 [data-atlas-kind="lift"]');
  const relationships = page.locator('.atlas-sticky .atlas-diagram--0 [data-atlas-kind="draw"]');
  await expect(company).toHaveCSS('opacity', '1');
  await expect
    .poll(async () =>
      parseFloat(await relationships.evaluate((el) => getComputedStyle(el).strokeDashoffset)),
    )
    .toBeGreaterThan(0.5);
  await positionChapter(page, 'compreensao', 0.25);
  const highlight = page.locator('.atlas-sticky .atlas-diagram--2 > .atlas-highlight');
  const explanation = page.locator('.atlas-sticky .atlas-diagram--2 [data-atlas-kind="lift"]');
  await expect(highlight).toHaveCSS('opacity', '1');
  await expect
    .poll(async () => Number(await explanation.evaluate((el) => getComputedStyle(el).opacity)))
    .toBeLessThan(0.5);
  await positionChapter(page, 'compreensao', 0.6);
  await expect(explanation).toHaveCSS('opacity', '1');
  await expect(page.locator('.atlas-sticky .atlas-diagram--2 .atlas-connector')).toHaveCSS(
    'stroke-dashoffset',
    '0px',
  );
});

test('mobile entrance finishes once, leaves labels readable and does no idle writes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.atlas-stage')).toHaveAttribute('data-enhanced', 'true');
  const art = page.locator('#principio-constancia .atlas-inline-art');
  await art
    .locator('.atlas-period')
    .last()
    .evaluate((element) => {
      (window as any).__atlasEntranceMinimum = 1;
      // Record the short entrance in the browser; a slow protocol round trip can miss it entirely.
      new MutationObserver(() => {
        (window as any).__atlasEntranceMinimum = Math.min(
          (window as any).__atlasEntranceMinimum,
          Number(getComputedStyle(element).opacity),
        );
      }).observe(element, { attributes: true, attributeFilter: ['style'] });
    });
  await art.scrollIntoViewIfNeeded();
  await expect
    .poll(() => page.evaluate(() => (window as any).__atlasEntranceMinimum))
    .toBeLessThan(1);
  await expect(art.locator('.atlas-period').last()).toHaveCSS('opacity', '1');
  await expect(art.locator('text').filter({ hasText: 'Aportes periódicos' })).toHaveCSS(
    'opacity',
    '1',
  );
  await art.evaluate((element) => {
    (window as any).__atlasWrites = 0;
    new MutationObserver((records) => {
      (window as any).__atlasWrites += records.length;
    }).observe(element, { attributes: true, subtree: true });
  });
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => (window as any).__atlasWrites)).toBe(0);
  await page.locator('.hero').scrollIntoViewIfNeeded();
  await art.scrollIntoViewIfNeeded();
  await expect(art.locator('.atlas-period').last()).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => (window as any).__atlasWrites)).toBe(0);
});

for (const mode of ['reduce', 'save-data', 'no-js'] as const) {
  test(`all diagram geometry is complete under ${mode}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: mode !== 'no-js',
      reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference',
    });
    if (mode === 'save-data')
      await context.addInitScript(() =>
        Object.defineProperty(navigator, 'connection', { value: { saveData: true } }),
      );
    const page = await context.newPage();
    try {
      await page.goto('/#principio-constancia');
      const art = page.locator('#principio-constancia .atlas-inline-art');
      await expect(art.locator('.atlas-period')).toHaveCount(7);
      for (const period of await art.locator('.atlas-period').all())
        await expect(period).toHaveCSS('opacity', '1');
      await expect(page.locator('#principio-compreensao .atlas-connector')).toHaveCSS(
        'stroke-dashoffset',
        '0px',
      );
      await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
    } finally {
      await context.close();
    }
  });
}

test('switching reduced motion on settles an unfinished diagram immediately', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.atlas-stage')).toHaveAttribute('data-enhanced', 'true');
  await positionChapter(page, 'constancia', 0.1);
  const last = page.locator('.atlas-sticky .atlas-period').last();
  await expect
    .poll(async () => Number(await last.evaluate((el) => getComputedStyle(el).opacity)))
    .toBeLessThan(0.5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(last).toHaveCSS('opacity', '1');
});

test('hidden documents stop Atlas writes and recover the current reading position', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.atlas-stage')).toHaveAttribute('data-enhanced', 'true');
  await positionChapter(page, 'constancia', 0.1);
  const last = page.locator('.atlas-sticky .atlas-period').last();
  await expect
    .poll(async () => Number(await last.evaluate((el) => getComputedStyle(el).opacity)))
    .toBeLessThan(0.5);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(last).toHaveCSS('opacity', '1');
  await page.locator('.atlas-sticky').evaluate((element) => {
    (window as any).__hiddenAtlasWrites = 0;
    new MutationObserver((records) => {
      (window as any).__hiddenAtlasWrites += records.filter((record) =>
        (record.target as Element).hasAttribute('data-atlas-step'),
      ).length;
    }).observe(element, { attributes: true, subtree: true });
  });
  await positionChapter(page, 'constancia', 0.15);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => (window as any).__hiddenAtlasWrites)).toBe(0);
  await page.evaluate(() => {
    delete (document as any).hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect
    .poll(async () => Number(await last.evaluate((el) => getComputedStyle(el).opacity)))
    .toBeLessThan(0.5);
});
