import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

test('desktop reading index follows anchors and return scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const index = page.getByRole('navigation', { name: 'Princípios da Mansa' });
  for (const [name, id, heading] of [
    ['Perspectiva', 'perspectiva', 'Entender antes de decidir.'],
    ['Constância', 'constancia', 'Dar espaço ao longo prazo.'],
    ['Compreensão', 'compreensao', 'Aprender durante o caminho.'],
  ]) {
    const link = index.getByRole('link', { name });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#principio-${id}$`));
    await expect(link).toHaveAttribute('aria-current', 'location');
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeInViewport();
  }
  await page.locator('#principio-perspectiva').scrollIntoViewIfNeeded();
  await expect(index.getByRole('link', { name: 'Perspectiva' })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(index.locator('[aria-current]')).toHaveCount(1);
});

test('mobile principles retain their sequence, meaningful diagrams and direct anchors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [id, heading, diagram] of [
    ['perspectiva', 'Entender antes de decidir.', /empresa.*fundamentos.*contexto.*histórico/i],
    [
      'constancia',
      'Dar espaço ao longo prazo.',
      /continuidade dos aportes.*sem representar retornos/i,
    ],
    ['compreensao', 'Aprender durante o caminho.', /informações.*explicação/i],
  ] as const) {
    await page.goto(`/#principio-${id}`);
    const article = page.locator(`#principio-${id}`);
    await expect(page).toHaveURL(new RegExp(`#principio-${id}$`));
    await expect(article.getByRole('heading', { name: heading, exact: true })).toBeInViewport();
    await expect(article.getByRole('img', { name: diagram })).toBeVisible();
  }
  const articles = page.locator('[data-principle-panel]');
  await expect(articles).toHaveCount(3);
  const positions = await articles.evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      return { top: bounds.top, bottom: bounds.bottom };
    }),
  );
  expect(positions[0].bottom).toBeLessThanOrEqual(positions[1].top);
  expect(positions[1].bottom).toBeLessThanOrEqual(positions[2].top);
  await expect(page.locator('[data-principle-panel][hidden]')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('editorial entrances are interruptible, run once and keep useful HTML', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    (window as any).__entrances = [];
    Element.prototype.animate = function (frames, options) {
      if (this.hasAttribute('data-editorial-reveal')) {
        (window as any).__entrances.push(this.className);
        // Extend only the test animation so preference changes can interrupt it deterministically.
        options = { ...(options as KeyframeAnimationOptions), duration: 10000 };
      }
      return original.call(this, frames, options);
    };
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.locator('.intro-main').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as any).__entrances)).toContain('intro-main');
  await expect
    .poll(() => page.locator('.intro-main').evaluate((el) => el.getAnimations().length))
    .toBe(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => page.locator('.intro-main').evaluate((el) => el.getAnimations().length))
    .toBe(0);
  await expect(page.locator('.intro-main')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.hero').scrollIntoViewIfNeeded();
  await page.locator('.intro-main').scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => (window as any).__entrances.filter((name: string) => name === 'intro-main').length,
    ),
  ).toBe(1);
});

test('direct anchors, absent animation APIs and keyboard keep content available', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.animate = undefined as any;
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#pesquisa');
  await expect(page.locator('.research-heading')).toHaveCSS('opacity', '1');
  await page.getByRole('link', { name: 'Conhecer a base de pesquisa' }).focus();
  await expect(page.getByRole('link', { name: 'Conhecer a base de pesquisa' })).toBeFocused();
  await expect(page.locator('.research-notebook')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('home illustration stays available without a renderer or pointer interaction', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.mouse.move(200, 300);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Converse sobre o projeto' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('study responds to keyboard and retains its value when switching 2D and 3D', async ({
  page,
}, info) => {
  await page.goto('/estudo/camadas/');
  const slider = page.getByRole('slider', { name: 'Aproximar as camadas' });
  await expect(slider).toBeEnabled();
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.layer-field [data-sculpture]')).toHaveAttribute(
    'data-sculpture-form',
    'opening',
  );
  await page.keyboard.press('End');
  await expect(slider).toHaveValue('100');
  await expect(page.locator('.layer-field [data-sculpture]')).toHaveAttribute(
    'data-sculpture-form',
    'horizon',
  );
  await page.getByRole('radio', { name: 'Linhas 2D' }).check();
  await expect(page.locator('.layer-field canvas')).toHaveCount(0);
  await expect(page.locator('.layer-field > span')).toHaveCount(30);
  await page.getByRole('radio', { name: 'Volume 3D' }).check();
  await expect(slider).toHaveValue('100');
  await expect(page.locator('.layer-field [data-sculpture]')).toHaveAttribute(
    'data-sculpture-form',
    'horizon',
  );
  await page.locator('.form-catalog').scrollIntoViewIfNeeded();
  for (const image of await page.locator('.form-catalog img').all()) {
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
  if (info.project.name === 'chromium') {
    await mkdir('work/qa/motion', { recursive: true });
    await page.screenshot({ path: 'work/qa/motion/catalog-desktop.png' });
  }
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('lost WebGL context restores the matching static form without losing the control', async ({
  page,
}) => {
  await page.goto('/estudo/camadas/');
  const available = await page.evaluate(() =>
    Boolean(document.createElement('canvas').getContext('webgl2')),
  );
  test.skip(!available, 'WebGL2 unavailable; static alternatives tested separately.');
  await expect(page.locator('.layer-field .sculpture')).toHaveClass(/ready/, { timeout: 15000 });
  const slider = page.getByRole('slider', { name: 'Aproximar as camadas' });
  await slider.focus();
  await page.keyboard.press('Home');
  await page
    .locator('.layer-field canvas')
    .evaluate((el) => el.dispatchEvent(new Event('webglcontextlost')));
  await expect(page.locator('.layer-field canvas')).toHaveCount(0);
  await expect(page.locator('.layer-field .sculpture-poster')).toBeVisible();
  await expect(page.locator('.layer-field .sculpture-poster')).toHaveAttribute(
    'src',
    '/art/opening.webp',
  );
  await expect(slider).toHaveValue('0');
});

for (const mode of ['reduce', 'save-data'] as const) {
  test(`study has usable static forms under ${mode}`, async ({ page }) => {
    if (mode === 'reduce') await page.emulateMedia({ reducedMotion: 'reduce' });
    else
      await page.addInitScript(() =>
        Object.defineProperty(navigator, 'connection', { value: { saveData: true } }),
      );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/estudo/camadas/');
    const slider = page.getByRole('slider', { name: 'Aproximar as camadas' });
    await slider.focus();
    await page.keyboard.press('Home');
    const image = page.locator('.layer-field .sculpture-poster');
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
    await expect(image).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.keyboard.press('End');
    await expect(image).toHaveAttribute('src', '/art/horizon-chapter.webp');
    await expect(slider).toHaveValue('100');
  });
}

test('without JavaScript the study keeps its artwork and disables dependent controls', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/estudo/camadas/');
    await page.locator('.layer-field').scrollIntoViewIfNeeded();
    await expect(page.getByRole('slider', { name: 'Aproximar as camadas' })).toBeDisabled();
    await expect(page.getByRole('radio', { name: 'Volume 3D' })).toBeDisabled();
    await expect(page.getByRole('radio', { name: 'Linhas 2D' })).toBeDisabled();
    await expect(page.locator('.layer-field .sculpture-poster')).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('.layer-field .sculpture-poster')
          .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
      )
      .toBe(true);
    await expect(page.getByRole('link', { name: 'Voltar ao caderno de direção' })).toBeVisible();
  } finally {
    await context.close();
  }
});
