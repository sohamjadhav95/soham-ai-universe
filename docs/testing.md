# Testing and checking changes

There is no unit-test suite. Changes are checked with the type checker, lint, a production build
and a real browser. Run these before every push.

## Fast checks

```sh
npx tsc -p tsconfig.app.json --noEmit   # types
npm run lint                             # 0 errors expected; 5 known warnings (react-refresh/only-export-components)
npm run build                            # must finish without errors; a >500 kB chunk warning is expected
```

## Look at it in a browser

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Use `127.0.0.1`, not `localhost`: in some sandboxes IPv6 binding fails. The dev server (`npm run dev`)
listens on port 8080 (Lovable's setting in `vite.config.ts`).

## Route sweep (`npm run qa`)

`scripts/qa/sweep.mjs` opens every route at desktop (1440×900) and phone (390×844) size. Project
slugs are read from `projects.ts`. It scrolls each page and reports:

- console errors and page errors
- sideways scroll
- broken images
- which video file or stream each page picked
- whether browser **back** still plays the curtain and shows the right page

```sh
npm run qa                                    # against http://127.0.0.1:4173
CHROMIUM_PATH=/path/to/chrome npm run qa      # if Playwright's browser lives elsewhere
```

It exits with code 1 when anything looks wrong. In the Claude Code cloud sandbox, Chromium is at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Don't run `playwright install` there.

## Buddy sync check (`npm run qa:buddy`)

`scripts/qa/buddy-targets.mjs` reads the buddy's tours from `src/data/buddy.ts` (bundled with esbuild,
which ships with Vite). It opens each page and checks that every tour stop and "show me" tip target
exists. Run it after any content or class-name change. It exits 1 if a stop points at nothing.

```sh
npm run qa:buddy        # against http://127.0.0.1:4173
```

## Things the sweep can't see

Check these by hand, or with a short Playwright script, when you touch the related code:

| Area | What to check |
|---|---|
| Page transitions | Click links, then browser back/forward: the curtain covers before the page changes; no flash of the next page. |
| Videos | Seek on a **no-range** server: `python3 scripts/qa/no-range-server.py`. Full screen turns the sound on. See [videos.md](videos.md). |
| Buddy | Greeting, a hover tip, the 1-minute tour start to finish, scrolling pauses a tour, leaving a page ends it, the dim fades. See [buddy.md](buddy.md). |
| Contact form | Mock `https://api.web3forms.com/submit` (Playwright `page.route`) and check the sent and error states. |
| Phones | Tap targets, nothing hidden under the menu button, no sideways scroll. |
| Reduced motion | Emulate `prefers-reduced-motion: reduce`: pages and navigation still work without animation. |

## Notes on the test browser

- **Playwright's Chromium cannot play H.264.** Locally, videos fall back to WebM; the About film
  (no WebM) shows only its poster. That's the test browser, not a bug.
- **Clean state for the buddy:** start each script with a fresh context, or run
  `localStorage.clear(); sessionStorage.clear()`. `?buddyfast` shortens its idle timers.
- **Elements that move fail Playwright's "stable" check** (the breathing buddy dot, the gliding buddy). Use
  `click({ force: true })` or click coordinates.
- **Take screenshots and look at them.** Most bugs here are visual: overlap, clipping, invisible
  elements on light backgrounds.

## Before you push

- [ ] Types, lint and build pass.
- [ ] `npm run qa` says "All clear." and `npm run qa:buddy` finds every target.
- [ ] Anything you changed by hand is checked at desktop and phone size.
- [ ] Docs updated if you changed how something works (see [README.md](README.md)).
