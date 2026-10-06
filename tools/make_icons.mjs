/**
 * Renders the home-screen icons into public/.
 *
 * Uses the already-installed Chrome to rasterise an inline HTML icon, which
 * avoids adding an image-processing dependency for four static files.
 *
 * Usage: node tools/make_icons.mjs
 */

import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const OUT_DIR = 'public';
const ANDROID_DIR = 'android/res/mipmap-xxxhdpi';

/** glyphRatio is the glyph size as a fraction of the canvas. Maskable icons
 *  need a smaller glyph so it survives the platform's circular crop. */
const ICONS = [
  { file: 'icon-192.png', size: 192, glyphRatio: 0.62 },
  { file: 'icon-512.png', size: 512, glyphRatio: 0.62 },
  { file: 'icon-maskable-512.png', size: 512, glyphRatio: 0.42 },
  { file: 'apple-touch-icon.png', size: 180, glyphRatio: 0.62 },
];

function iconHtml(size, glyphRatio) {
  const fontSize = Math.round(size * glyphRatio);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden}
    .icon{width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(140deg,#2f7ff0 0%,#123a80 55%,#0d1014 100%);
      color:#ffffff;font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif;
      font-size:${fontSize}px;font-weight:700;line-height:1}
  </style></head><body><div class="icon">译</div></body></html>`;
}

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });

for (const icon of ICONS) {
  await page.setViewportSize({ width: icon.size, height: icon.size });
  await page.setContent(iconHtml(icon.size, icon.glyphRatio));
  await page.screenshot({ path: `${OUT_DIR}/${icon.file}`, omitBackground: false });
  console.log(`wrote ${OUT_DIR}/${icon.file} (${icon.size}x${icon.size})`);
}

// Android launcher icons. The adaptive foreground must be transparent and keep
// the glyph inside the inner 66dp of the 108dp canvas, or the platform's mask
// crops it.
function androidForegroundHtml(size, glyphRatio) {
  const fontSize = Math.round(size * glyphRatio);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;width:${size}px;height:${size}px;background:transparent;overflow:hidden}
    .glyph{width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;
      color:#ffffff;font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif;
      font-size:${fontSize}px;font-weight:700;line-height:1}
  </style></head><body><div class="glyph">译</div></body></html>`;
}

mkdirSync(ANDROID_DIR, { recursive: true });

await page.setViewportSize({ width: 192, height: 192 });
await page.setContent(iconHtml(192, 0.62));
await page.screenshot({ path: `${ANDROID_DIR}/ic_launcher.png`, omitBackground: false });
console.log(`wrote ${ANDROID_DIR}/ic_launcher.png (192x192)`);

await page.setViewportSize({ width: 432, height: 432 });
await page.setContent(androidForegroundHtml(432, 0.5));
await page.screenshot({ path: `${ANDROID_DIR}/ic_launcher_foreground.png`, omitBackground: true });
console.log(`wrote ${ANDROID_DIR}/ic_launcher_foreground.png (432x432, transparent)`);

await browser.close();
