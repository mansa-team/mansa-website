import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

for (const saveData of [false, true]) {
  test(`pending contact navigation preserves controls and clears after response (saveData ${saveData})`, async ({
    page,
  }) => {
    if (saveData)
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'connection', {
          configurable: true,
          value: Object.assign(new EventTarget(), { saveData: true }),
        });
      });
    let releaseResponse!: () => void;
    let intercepted = false;
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    await page.route(/\/contato\/?\?.*_rsc=/, async (route) => {
      intercepted = true;
      await responseGate;
      await route.continue();
    });
    try {
      await page.goto('/');
      await page.locator('.header-contact').click();
      await expect.poll(() => intercepted).toBe(true);
      await expect(page.locator('.header-contact .header-route-hint')).toHaveAttribute(
        'data-pending',
        'true',
      );
      await expect(page.locator('.header-contact .header-route-marks')).toHaveCSS('opacity', '1');
      await expect(page.locator('.route-pending-panel').getByRole('status')).toContainText(
        'Carregando página',
      );
      if (saveData)
        expect(
          await page
            .locator('.route-pending-panel')
            .evaluate((element) => element.getAnimations({ subtree: true }).length),
        ).toBe(0);
      await page.getByRole('combobox', { name: 'Aparência do site' }).selectOption('dark');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      releaseResponse();
      await expect(page).toHaveURL(/\/contato\/?$/);
      await expect(page.locator('.contact-form')).toBeVisible();
      await expect(page.locator('.header-contact .header-route-hint')).not.toHaveAttribute(
        'data-pending',
      );
      await expect(page.locator('.route-pending-panel')).toHaveCount(0);
    } finally {
      releaseResponse();
    }
  });
}

test('loading status stays legible and static with reduced motion', async ({ page, baseURL }) => {
  const require = createRequire(`${process.cwd()}/package.json`);
  const compiled = ts.transpileModule(
    readFileSync('src/components/motion/LoadingMark.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const component = { exports: {} as { default: React.ComponentType } };
  new Function('require', 'module', 'exports', compiled)(
    (path: string) => (path.endsWith('.css') ? {} : require(path)),
    component,
    component.exports,
  );
  const markup = renderToStaticMarkup(React.createElement(component.exports.default));
  const styles =
    readFileSync('src/styles/global.css', 'utf8') +
    readFileSync('src/components/motion/loading-mark.css', 'utf8');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setContent(
    `<html data-theme="light"><head><base href="${baseURL}/"><style>${styles}</style></head><body><main class="route-loading">${markup}</main></body></html>`,
  );
  await expect(page.getByRole('status')).toContainText('Carregando página');
  expect(
    (await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()).violations,
  ).toEqual([]);
  expect(
    await page
      .locator('.loading-atlas')
      .evaluate((element) => element.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await page.locator('html').evaluate((element) => {
    element.dataset.theme = 'dark';
  });
  await expect(page.getByRole('status')).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()).violations,
  ).toEqual([]);
});

test('press feedback does not move the button hit area', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.hero-action .button');
  await button.scrollIntoViewIfNeeded();
  const before = await button.boundingBox();
  if (!before) throw new Error('Project contact button is not visible');
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  const pressed = await button.boundingBox();
  await page.mouse.move(0, 0);
  await page.mouse.up();
  expect(pressed).toEqual(before);
});

test.describe('mobile menu motion', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const direction of ['opening', 'closing'] as const) {
    test(`changing reduced motion during ${direction} settles the intended menu state`, async ({
      page,
    }) => {
      await page.goto('/');
      await expect(page.locator('[data-entry-intro]')).toBeHidden();
      await page.evaluate(() => {
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (keyframes, options) {
          if (this.matches('.mobile-menu nav') && typeof options === 'object') {
            return animate.call(this, keyframes, { ...options, duration: 60000 });
          }
          return animate.call(this, keyframes, options);
        };
      });
      const menu = page.locator('.mobile-menu');
      const summary = menu.locator('summary');
      if (direction === 'closing') {
        await summary.focus();
        await page.keyboard.press('Enter');
      }
      await summary.evaluate((element) =>
        element.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }),
        ),
      );
      expect(await menu.locator('nav').evaluate((element) => element.getAnimations().length)).toBe(
        1,
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect
        .poll(() => menu.locator('nav').evaluate((element) => element.getAnimations().length))
        .toBe(0);
      expect(await menu.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
        direction === 'opening',
      );
      expect(await menu.locator('nav').evaluate((element) => (element as HTMLElement).inert)).toBe(
        direction === 'closing',
      );
    });
  }

  test('saveData keeps the menu decoration static', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: Object.assign(new EventTarget(), { saveData: true }),
      });
    });
    await page.goto('/');
    await expect(page.locator('[data-entry-intro]')).toBeHidden();
    await page.locator('.mobile-menu summary').click();
    expect(
      await page
        .locator('.mobile-menu')
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBe(0);
    await expect(page.getByRole('navigation', { name: 'Navegação móvel' })).toBeVisible();
  });

  test('pointer closing keeps the surface present and can reverse without losing links', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('[data-entry-intro]')).toBeHidden();
    const menu = page.locator('.mobile-menu');
    const summary = menu.locator('summary');
    await summary.click();
    await expect(menu.getByRole('link', { name: 'Nossa proposta' })).toBeVisible();
    await page.waitForTimeout(260);
    const closing = await summary.evaluate((element) => {
      element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }),
      );
      const details = element.parentElement as HTMLDetailsElement;
      return { open: details.open, inert: details.querySelector('nav')?.inert };
    });
    expect(closing).toEqual({ open: true, inert: true });
    await summary.evaluate((element) =>
      element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }),
      ),
    );
    await page.waitForTimeout(280);
    await expect(menu).toHaveAttribute('open', '');
    await expect(menu.getByRole('link', { name: 'Nossa proposta' })).toBeVisible();
    expect(await menu.locator('nav').evaluate((element) => (element as HTMLElement).inert)).toBe(
      false,
    );
    await summary.click();
    await expect(menu).not.toHaveAttribute('open');
  });

  test('keyboard opening and Escape are immediate and restore the summary focus', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('[data-entry-intro]')).toBeHidden();
    const menu = page.locator('.mobile-menu');
    const summary = menu.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    expect(await menu.locator('nav').evaluate((element) => element.getAnimations().length)).toBe(0);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open');
    await expect(summary).toBeFocused();
  });

  test('reduced motion opens the menu without a moving surface', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-entry-intro]')).toBeHidden();
    await page.locator('.mobile-menu summary').click();
    expect(
      await page.locator('.mobile-menu nav').evaluate((element) => element.getAnimations().length),
    ).toBe(0);
  });

  test('native menu remains usable without JavaScript', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-entry-intro]')).toBeHidden();
    await expect(page.locator('#hero-title')).toBeVisible();
    await page.locator('.mobile-menu summary').click();
    await expect(
      page
        .getByRole('navigation', { name: 'Navegação móvel' })
        .getByRole('link', { name: 'Nossa proposta' }),
    ).toBeVisible();
    await context.close();
  });
});
