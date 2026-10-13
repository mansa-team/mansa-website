import { test, expect, type Page } from '@playwright/test';

async function pauseEntryClock(page: Page) {
  const time = new Date('2026-10-13T12:00:00');
  // Install before the pause target: the clock advances between these two protocol calls.
  await page.clock.install({ time: new Date(time.getTime() - 60000) });
  await page.clock.pauseAt(time);
}

async function expectReading(page: Page) {
  await expect(page.locator('html')).not.toHaveAttribute('data-entry', /loading|revealing/);
  await expect(page.locator('[data-entry-intro]')).toBeHidden();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const invitation = page.getByRole('link', { name: 'Converse sobre o projeto', exact: true });
  await expect(invitation).toBeVisible();
  await expect(invitation).toHaveAttribute('href', '/contato/');
}

test('first frame shows a fullscreen introduction and loading bar while the page remains in server HTML', async ({
  page,
}) => {
  await pauseEntryClock(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const intro = page.locator('[data-entry-intro]');
  const progress = page.locator('[data-entry-progress]');
  await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
  await expect(intro).toBeVisible();
  await expect(progress).toHaveAttribute('role', 'progressbar');
  await expect(progress).toHaveAttribute('aria-valuemin', '0');
  await expect(progress).toHaveAttribute('aria-valuemax', '100');
  const value = Number(await progress.getAttribute('aria-valuenow'));
  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThanOrEqual(100);
  await expect(page.getByRole('heading', { level: 1, includeHidden: true })).toBeAttached();
  const viewport = page.viewportSize();
  const bounds = await intro.boundingBox();
  expect(bounds).toMatchObject({ x: 0, y: 0, width: viewport!.width, height: viewport!.height });
});

test('completed readiness fills the bar and reveals the page through the normal opening', async ({
  page,
}) => {
  await pauseEntryClock(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-entry-progress]')).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
  await page.clock.runFor(1400);
  await expect(page.locator('html')).toHaveAttribute('data-entry', 'revealing');
  await page.clock.runFor(641);
  await expectReading(page);
});

for (const method of ['button', 'Escape', 'Tab'] as const) {
  test(`${method} dismisses the introduction without waiting for the opening clock`, async ({
    page,
    browserName,
  }) => {
    await pauseEntryClock(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
    if (method === 'button') await page.locator('[data-entry-skip]').click();
    else
      await page.keyboard.press(
        method === 'Tab' && browserName === 'webkit' && process.platform === 'darwin'
          ? 'Alt+Tab'
          : method,
      );
    await expectReading(page);
    expect(
      await page.evaluate(() => Boolean(document.activeElement?.closest('[data-entry-intro]'))),
    ).toBe(false);
    if (method === 'Tab') {
      const skip = page.getByRole('link', { name: 'Ir para o conteúdo' });
      await expect(skip).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#conteudo$/);
    }
  });
}

test('reload repeats the introduction but an internal return from contact does not', async ({
  page,
}) => {
  await pauseEntryClock(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
  await page.keyboard.press('Escape');
  await expectReading(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
  await page.keyboard.press('Escape');
  await expectReading(page);
  await page.getByRole('link', { name: 'Converse sobre o projeto', exact: true }).click();
  await expect(page).toHaveURL('/contato/');
  await page.getByRole('link', { name: 'Mansa — início', exact: true }).first().click();
  await expect(page).toHaveURL('/');
  await expectReading(page);
});

test('deep links and secondary pages open directly with the opening clock paused', async ({
  page,
}) => {
  await pauseEntryClock(page);
  for (const path of ['/#pesquisa', '/contato/', '/privacidade/', '/estudo/']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-entry-intro]')).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-entry', /loading|revealing/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

for (const preference of ['reduce', 'save-data'] as const) {
  test(`${preference} bypasses the introduction and opens the complete home immediately`, async ({
    page,
  }) => {
    await pauseEntryClock(page);
    if (preference === 'reduce') await page.emulateMedia({ reducedMotion: 'reduce' });
    else {
      await page.addInitScript(() =>
        Object.defineProperty(navigator, 'connection', {
          value: { saveData: true },
          configurable: true,
        }),
      );
    }
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expectReading(page);
    await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
    await expect(page.locator('canvas')).toHaveCount(0);
  });
}

test('the safety deadline releases reading despite blocked assets and unavailable storage', async ({
  page,
}) => {
  await pauseEntryClock(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new Error('Unavailable');
      },
    });
    HTMLImageElement.prototype.decode = () => new Promise(() => {});
  });
  let releaseAssets!: () => void;
  const assetGate = new Promise<void>((resolve) => {
    releaseAssets = resolve;
  });
  await page.route(/\/fonts\/|\/mansa-logo\.png/, async (route) => {
    await assetGate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
    await page.clock.runFor(2100);
    await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
    expect(
      Number(await page.locator('[data-entry-progress]').getAttribute('aria-valuenow')),
    ).toBeLessThan(100);
    await page.clock.runFor(2401);
    await expectReading(page);
  } finally {
    releaseAssets();
  }
});

test('missing React chunks cannot trap the visitor behind the introduction', async ({ page }) => {
  await pauseEntryClock(page);
  await page.route('**/_next/**/*.js*', (route) => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-entry', 'loading');
  await page.clock.runFor(4501);
  await expectReading(page);
  await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
  await page.getByRole('link', { name: 'Converse sobre o projeto', exact: true }).click();
  await expect(page.locator('form')).toHaveAttribute('action', 'mailto:mansafin.team@gmail.com');
});

test('without JavaScript the introduction stays hidden and server-rendered contact is usable', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expectReading(page);
    await page.getByRole('link', { name: 'Converse sobre o projeto', exact: true }).click();
    await expect(page).toHaveURL('/contato/');
    await expect(page.locator('form')).toHaveAttribute('action', 'mailto:mansafin.team@gmail.com');
  } finally {
    await context.close();
  }
});
