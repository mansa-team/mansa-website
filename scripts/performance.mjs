import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';

const port = 4330;
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)],
  { env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' },
);
let output = '';
server.stdout.on('data', (d) => (output += d));
server.stderr.on('data', (d) => (output += d));
let browser;
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(output);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (attempt === 59) throw new Error(`Server not ready: ${output}`);
  }
  await mkdir('work/qa', { recursive: true });
  browser = await chromium.launch({ headless: true });
  const results = [];
  for (const mode of ['normal', 'reduced']) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
    });
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 1600000 / 8,
      uploadThroughput: 750000 / 8,
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__mansaMetrics = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__mansaMetrics.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.__mansaMetrics.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    results.push(
      await page.evaluate(
        (mode) => ({
          mode,
          ...window.__mansaMetrics,
          fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          resources: performance.getEntriesByType('resource').map((e) => ({
            name: new URL(e.name).pathname,
            bytes: e.encodedBodySize,
            duration: e.duration,
          })),
        }),
        mode,
      ),
    );
    await page.screenshot({ path: `work/qa/next-performance-${mode}.png` });
    await page.close();
  }
  const report = {
    conditions:
      'Local Next.js production build; mobile 390×844; 150ms RTT; 1.6Mbps download; 4× CPU slowdown. Lab measurements, not field Core Web Vitals.',
    results,
  };
  await writeFile('work/qa/next-performance.json', JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        conditions: report.conditions,
        results: results.map(({ mode, lcp, cls, fcp, resources }) => ({
          mode,
          lcp,
          cls,
          fcp,
          jsBytes: resources.filter((r) => r.name.endsWith('.js')).reduce((n, r) => n + r.bytes, 0),
        })),
      },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  server.kill();
}
