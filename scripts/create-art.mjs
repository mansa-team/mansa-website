import { writeFile, mkdir, copyFile } from 'node:fs/promises';

await mkdir('public/art', { recursive: true });
await mkdir('public/fonts', { recursive: true });
const gradients = `<defs><linearGradient id="sheet" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#82946a"/><stop offset=".32" stop-color="#e0e2b7"/><stop offset=".53" stop-color="#5a7656"/><stop offset=".72" stop-color="#d4ddb0"/><stop offset="1" stop-color="#668457"/></linearGradient><linearGradient id="edge"><stop stop-color="#adc096"/><stop offset=".45" stop-color="#e8e9c8"/><stop offset="1" stop-color="#67905d"/></linearGradient><radialGradient id="shade"><stop stop-color="#062217" stop-opacity=".4"/><stop offset="1" stop-color="#082b24" stop-opacity="0"/></radialGradient></defs>`;
let blades = '';
for (let i = 0; i < 80; i++) {
  const d = i * 2.5;
  const path = `M ${215 + d * 0.22} ${802 - d * 0.34} C ${180 + d * 0.14} ${660 - d * 0.7}, ${184 + d * 0.22} ${530 - d * 0.85}, ${304 + d * 0.31} ${415 - d * 0.8} C ${397 + d * 0.38} ${325 - d * 0.71}, ${489 + d * 0.49} ${310 - d * 0.67}, ${506 + d * 0.42} ${170 - d * 0.3} C ${577 + d * 0.33} ${286 - d * 0.25}, ${584 + d * 0.31} ${434 - d * 0.17}, ${519 + d * 0.25} ${552 - d * 0.2} C ${435 + d * 0.22} ${715 - d * 0.29}, ${372 + d * 0.26} ${758 - d * 0.34}, ${215 + d * 0.22} ${802 - d * 0.34}`;
  blades += `<path d="${path}" fill="url(#sheet)" fill-opacity=".96" stroke="url(#edge)" stroke-width="1.05"/>`;
}
const horizon = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1000" viewBox="0 0 900 1000">${gradients}<ellipse cx="485" cy="850" rx="330" ry="70" fill="url(#shade)"/><g transform="rotate(13 460 470)">${blades}</g></svg>`;
await writeFile('public/art/horizon.svg', horizon);
let rings = '';
for (let i = 0; i < 48; i++) {
  const s = i * 4.1;
  rings += `<path d="M ${95 + s * 0.12} ${404 - s * 0.43} C ${81 + s * 0.35} ${244 - s * 0.64} ${370 + s * 0.05} ${119 + s * 0.7} ${426 - s * 0.12} ${228 + s * 0.34} C ${524 - s * 0.44} ${398 + s * 0.13} ${252 + s * 0.35} ${527 - s * 0.6} ${95 + s * 0.12} ${404 - s * 0.43}" fill="none" stroke="url(#edge)" stroke-width="1.2" opacity="${0.45 + i / 100}"/>`;
}
await writeFile(
  'public/art/continuity.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">${gradients}<g transform="rotate(-18 300 300)">${rings}</g></svg>`,
);
for (const [family, files] of Object.entries({
  manrope: ['400-normal', '500-normal', '600-normal'],
  newsreader: ['400-italic'],
})) {
  for (const style of files)
    await copyFile(
      `node_modules/@fontsource/${family}/files/${family}-latin-${style}.woff2`,
      `public/fonts/${family}-latin-${style}.woff2`,
    );
  await copyFile(
    `node_modules/@fontsource/${family}/LICENSE`,
    `public/fonts/${family}-LICENSE.txt`,
  );
}
console.log('Original vector studies and licensed local fonts generated.');
