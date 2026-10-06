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

await browser.close();
