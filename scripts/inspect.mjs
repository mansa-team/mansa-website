import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('work/qa', { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [name, width, height, mode] of [
  ['desktop', 1440, 1000, 'light'],
  ['mobile', 390, 844, 'light'],
  ['night', 1440, 1000, 'dark'],
]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript((theme) => localStorage.setItem('mansa-theme', theme), mode);
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `work/qa/${name}-hero.png` });
  await page.screenshot({ path: `work/qa/${name}-full.png`, fullPage: true });
  for (const section of ['proposta', 'pesquisa', 'origem']) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded();
    await page
      .locator(`#${section}`)
      .screenshot({ path: `work/qa/${name}-${section}.png`, animations: 'disabled' });
  }
  console.log(
    JSON.stringify({
      name,
      title: await page.title(),
      atlas: await page.locator('.horizon-atlas').count(),
      overflow: await page.evaluate(() => ({
        body: document.body.scrollWidth,
        viewport: innerWidth,
      })),
      errors,
    }),
  );
  await page.goto('http://localhost:3000/contato/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `work/qa/${name}-contact.png`, fullPage: true });
  await page.close();
}
await browser.close();
