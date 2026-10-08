// Route sweep: opens every page at desktop and phone size and reports console
// errors, sideways scroll, broken images, the video each page picked, and
// whether browser back/forward still plays the curtain.
//
// 1. npm run build && npm run preview -- --host 127.0.0.1 --port 4173
// 2. npm run qa            (or: node scripts/qa/sweep.mjs [baseUrl])
//
// Needs Playwright's Chromium. If it lives somewhere unusual, set
// CHROMIUM_PATH=/path/to/chrome. Exit code 1 when anything looks wrong.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const slugs = [...readFileSync(new URL('../../src/data/projects.ts', import.meta.url), 'utf8').matchAll(/^\s{4}slug: '([^']+)'/gm)].map(m => m[1]);
const routes = ['/', '/work', '/about', '/contact', ...slugs.map(s => `/work/${s}`), '/no-such-page'];
const sizes = [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const problems = [];

for (const [name, options] of sizes) {
  const ctx = await browser.newContext(options);
  const page = await ctx.newPage();
  page.on('pageerror', e => problems.push(`${name} ${page.url()} page error: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') problems.push(`${name} ${page.url()} console: ${m.text().slice(0, 200)}`);
  });
  for (const route of routes) {
    await page.goto(BASE + route);
    await page.waitForTimeout(4800); // preloader / curtain
    const info = await page.evaluate(() => ({
      sideways: document.documentElement.scrollWidth > window.innerWidth,
      broken: [...document.images].filter(i => i.complete && i.src && i.naturalWidth === 0).map(i => i.src),
      title: document.title,
    }));
    // Scroll through so lazy content and scroll-triggered code runs.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 800) {
      await page.evaluate(top => window.scrollTo(0, top), y);
      await page.waitForTimeout(100);
    }
    const videos = await page.$$eval('video', vs => vs.map(v => `${(v.currentSrc || '-').replace(/^.*\/videos\//, '')} ready=${v.readyState}`));
    console.log(`${name.padEnd(7)} ${route.padEnd(36)} ${info.title}${videos.length ? `  videos: ${videos.join(', ')}` : ''}`);
    if (info.sideways) problems.push(`${name} ${route}: page scrolls sideways`);
    if (info.broken.length) problems.push(`${name} ${route}: broken images ${info.broken.join(', ')}`);
  }
  if (name === 'desktop') {
    await page.goto(BASE + '/');
    await page.waitForTimeout(4800);
    await page.locator('a[href="/work"]').first().click();
    await page.waitForTimeout(2600);
    await page.goBack();
    await page.waitForTimeout(400);
    const curtain = await page.evaluate(() => document.querySelector('.curtain')?.classList.contains('is-active'));
    await page.waitForTimeout(2400);
    const home = await page.$('.home-hero');
    console.log(`back button: curtain played=${curtain}, home shown=${!!home}`);
    if (!curtain || !home) problems.push('browser back did not play the curtain or show Home');
  }
  await ctx.close();
}
await browser.close();

console.log(problems.length ? `\n${problems.length} problem(s):\n${[...new Set(problems)].join('\n')}` : '\nAll clear.');
process.exit(problems.length ? 1 : 0);
