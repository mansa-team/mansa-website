import { chromium } from '@playwright/test';
import sharp from 'sharp';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1200, height: 1000 },
  deviceScaleFactor: 1,
});
await page.goto('http://localhost:3000/?poster=1');
await page.locator('.hero .sculpture.ready').waitFor();
await page.evaluate(() => {
  const host = document.querySelector('.hero [data-sculpture]');
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: 'auto',
    bottom: 'auto',
    width: '900px',
    height: '1000px',
  });
});
await page.waitForTimeout(250);
await page.locator('.hero [data-motion-toggle]').click();
const data = await page.locator('.hero canvas').evaluate((canvas) => canvas.toDataURL('image/png'));
const input = Buffer.from(data.split(',')[1], 'base64');
await sharp(input).webp({ quality: 90, alphaQuality: 100 }).toFile('public/art/horizon.webp');
await sharp(input)
  .resize(480, 534)
  .webp({ quality: 68, alphaQuality: 75, effort: 6 })
  .toFile('public/art/horizon-mobile.webp');
await sharp(input).avif({ quality: 55, effort: 6 }).toFile('public/art/horizon.avif');
await sharp(input)
  .resize(480, 534)
  .avif({ quality: 52, effort: 6 })
  .toFile('public/art/horizon-mobile.avif');
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<!doctype html><html><head><style>
@font-face{font-family:Manrope;src:url('http://localhost:3000/fonts/manrope-latin-400-normal.woff2')}
@font-face{font-family:Newsreader;src:url('http://localhost:3000/fonts/newsreader-latin-400-italic.woff2');font-style:italic}
*{box-sizing:border-box}body{margin:0;background:#082b24;color:#f2f1e9;font-family:Manrope,sans-serif;width:1200px;height:630px;overflow:hidden;padding:55px 70px}.brand{display:flex;align-items:center;gap:12px;font-size:36px;letter-spacing:-2px}.brand img{width:45px;height:45px}.brand b{font-weight:400}.art{position:absolute;right:-10px;top:5px;width:620px;height:620px;object-fit:contain}h1{font-weight:400;font-size:74px;line-height:1.05;letter-spacing:-4px;margin:70px 0 0;position:relative}em{font-family:Newsreader,Georgia,serif;font-weight:400;color:#d9dfd1}p{position:absolute;left:70px;bottom:43px;font-size:11px;letter-spacing:2px;color:#b6c6b7}
</style></head><body><img class="art" src="http://localhost:3000/art/horizon.webp"/><div class="brand"><img src="http://localhost:3000/mansa-logo.png"/><b>mansa.</b></div><h1>Clareza para<br/>construir.<br/><em>No seu tempo.</em></h1><p>TECNOLOGIA · EDUCAÇÃO · LONGO PRAZO</p></body></html>`);
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'work/qa/social.png' });
await sharp('work/qa/social.png').jpeg({ quality: 90 }).toFile('public/art/social.jpg');
console.log('Static desktop/mobile sculpture and social image rendered from the live art.');
await browser.close();
