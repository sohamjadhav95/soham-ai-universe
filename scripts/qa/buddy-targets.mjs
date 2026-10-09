// Buddy sync check. Two parts:
// 1. buddyProblems() from src/data/buddy.ts: stops and buttons that go to a
//    route that doesn't exist, and NOTES for projects that don't exist
//    (usually a renamed slug). The site hides these from visitors, so this is
//    the only place they show up.
// 2. Every tour stop and "show me" tip points at a CSS selector on some page.
//    When content or class names change, a stop can point at nothing. This
//    opens each page and checks that every target exists.
//
// 1. npm run build && npm run preview -- --host 127.0.0.1 --port 4173
// 2. npm run qa:buddy        (or: node scripts/qa/buddy-targets.mjs [baseUrl])
//
// Set CHROMIUM_PATH if Playwright's Chromium lives somewhere unusual.
// Exit code 1 when a target is missing.
import { build } from 'esbuild';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const root = new URL('../..', import.meta.url).pathname;

// Bundle the buddy data (TypeScript) so Node can read it.
const out = await build({
  stdin: {
    contents: "export { SITE_TOUR, guideFor, buddyProblems } from './src/data/buddy.ts'; export { PROJECTS } from './src/data/projects.ts';",
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  write: false,
  logLevel: 'silent',
});
const { SITE_TOUR, guideFor, buddyProblems, PROJECTS } = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);

const problems = buddyProblems();
for (const p of problems) console.log(`OUT OF SYNC ${p}`);

const routes = ['/', '/work', '/about', '/contact', ...PROJECTS.map(p => `/work/${p.slug}`)];
const stops = new Map(); // key -> { to, target, nth, from }
const add = (to, target, nth, from) => {
  const key = `${to}|${target}|${nth ?? 0}`;
  if (!stops.has(key)) stops.set(key, { to, target, nth: nth ?? 0, from });
};
SITE_TOUR.forEach((s, i) => add(s.to, s.target, s.nth, `1-minute tour, stop ${i + 1}`));
for (const route of routes) {
  const guide = guideFor(route);
  guide.tour.forEach((s, i) => add(s.to, s.target, s.nth, `tour of ${route}, stop ${i + 1}`));
  for (const tip of guide.tips)
    for (const a of tip.actions ?? []) if (a.kind === 'go' && a.target) add(a.to, a.target, a.nth, `tip on ${route}: "${tip.text.slice(0, 40)}…"`);
}

const byPage = new Map();
for (const s of stops.values()) byPage.set(s.to, [...(byPage.get(s.to) ?? []), s]);

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const missing = [];
for (const [to, list] of byPage) {
  await page.goto(BASE + to);
  await page.waitForTimeout(4800); // preloader
  const found = await page.evaluate(items => items.map(s => !!document.querySelectorAll(s.target)[s.nth]), list);
  list.forEach((s, i) => {
    console.log(`${found[i] ? 'ok     ' : 'MISSING'} ${to.padEnd(36)} ${s.target}${s.nth ? ` [${s.nth}]` : ''}`);
    if (!found[i]) missing.push(`${to} ${s.target}${s.nth ? ` [${s.nth}]` : ''} (${s.from})`);
  });
}
await browser.close();

console.log(
  missing.length
    ? `\n${missing.length} buddy target(s) point at nothing. Update src/data/buddy.ts:\n${missing.join('\n')}`
    : `\nAll ${stops.size} buddy targets found.`,
);
if (problems.length) console.log(`\n${problems.length} out-of-sync item(s) in src/data/buddy.ts (listed at the top).`);
process.exit(missing.length || problems.length ? 1 : 0);
