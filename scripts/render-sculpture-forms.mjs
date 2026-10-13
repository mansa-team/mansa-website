import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Render actual study geometry, rather than inventing a separate fallback illustration.
const origin = process.env.MANSA_PREVIEW_URL || 'http://127.0.0.1:3001';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${origin}/estudo/camadas/?poster=1`);
  const control = page.getByRole('slider', { name: 'Aproximar as camadas' });
  await expect(control).toBeEnabled();
  await page.locator('.layer-field .sculpture.ready').waitFor({ timeout: 15000 });
  await page.locator('.layer-field').evaluate((el) =>
    Object.assign(el.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '900px',
      height: '1000px',
      zIndex: '100',
    }),
  );
  await mkdir('work/qa/motion', { recursive: true });
  for (const [form, key] of [
    ['opening', 'Home'],
    ['cadence', 'Home'],
    ['horizon-chapter', 'End'],
  ]) {
    await control.focus();
    await page.keyboard.press(key);
    if (form === 'cadence') for (let i = 0; i < 50; i++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    const data = await page
      .locator('.layer-field canvas')
      .evaluate((canvas) => canvas.toDataURL('image/png'));
    const input = Buffer.from(data.split(',')[1], 'base64');
    await sharp(input).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/art/${form}.webp`);
    await sharp(input).avif({ quality: 55, effort: 6 }).toFile(`public/art/${form}.avif`);
    await sharp(input)
      .resize(480, 534)
      .webp({ quality: 68, alphaQuality: 75, effort: 6 })
      .toFile(`public/art/${form}-mobile.webp`);
    await sharp(input)
      .resize(480, 534)
      .avif({ quality: 52, effort: 6 })
      .toFile(`public/art/${form}-mobile.avif`);
    await sharp(input).resize(450, 500).png().toFile(`work/qa/motion/${form}.png`);
  }
  console.log('Three configurations captured from the shared procedural geometry.');
} finally {
  await browser.close();
}
