# Architecture

How the site is put together: the app shell, how a page appears, motion, scroll, the cursor,
styling and layers. Read this before changing anything that runs on every page.

## Stack

- **Vite 5** + **React 18** + **TypeScript** (`strict: false`), with `@/` aliased to `src/`.
- **react-router-dom 6** (`BrowserRouter`): a single-page app with a fallback to `index.html`.
- **GSAP 3** (`ScrollTrigger`, `CustomEase`, `quickTo`) for all motion.
- **Lenis** for smooth scroll, driven by GSAP's ticker.
- **d3-geo** for the rotating globe, with bundled land data.
- **hls.js** (light build, lazy) for video streaming. See [videos.md](videos.md).
- **Geist Variable** font from `@fontsource-variable/geist`.
- No CSS framework: plain CSS files per area in `src/styles/`.

## Folder map

```
src/
  main.tsx              font + global.css + <App/>
  App.tsx               router, curtain provider, routes, Menu, Buddy, Preloader
  pages/                Home, Work, About, Contact, ProjectPage, NotFound, BuddyLab (lazy)
  components/           shared UI (Button, Header, Footer, Menu, Preloader, VideoPlayer, Monitor, …)
  components/buddy/     the site buddy and its characters (see buddy.md)
  data/                 all content: site.ts, about.ts, projects.ts, buddy.ts, globe-land.json
  lib/                  transitions, scroll, motion, pointer, reveal, hooks, buddy bus
  styles/               one CSS file per area + global.css (tokens, utilities)
public/                 images, certificates (PDF), videos (+ HLS folders), cursor, icons, robots, _redirects
scripts/                make-hls.sh (video streams), qa/ (route sweep, buddy sync check, no-range server)
docs/                   these docs
portfolio-video-story/  separate project: the 50 s story film (HyperFrames). Not part of the site build.
photos/                 source photo (not used by the site)
```

## The app shell (`src/App.tsx`)

```
<BrowserRouter>
  <TransitionProvider>          ← owns the page-transition curtain and the "shown" location
    <main><PageRoutes/></main>  ← <Routes location={useShownLocation()}>
    <Menu/>                     ← round menu button + side panel (fixed)
    <Buddy/>                    ← site buddy (fixed), lives across pages
    <Preloader/>                ← greeting loader on full page loads
  </TransitionProvider>
</BrowserRouter>
```

**Routes:**
- `/` Home
- `/work` Work
- `/work/:slug` ProjectPage, which renders `NotFound` for an unknown slug
- `/about` About
- `/contact` Contact
- `/lab/buddy` BuddyLab (lazy, noindex)
- `*` NotFound

`initScroll()` (Lenis) runs once in App's effect.

## How a page appears

Two things decide when a page is visible: **the curtain** and **the reveal signal**.

### First load: the Preloader
1. `Preloader` covers the screen and flashes greetings (`GREETINGS` in `site.ts`), about 2.6 s.
2. It calls `emitReveal()` (`src/lib/reveal.ts`) and lifts away with a curved edge.
3. Every page that registered with `onReveal()` plays its entrance now.

### Navigating: the curtain (`src/lib/transition.tsx`)
- **Internal links use `TLink`** (or `useSite().go(to)`), never a plain `<a>` and never `navigate()` directly.
  `Button` with `to` uses `TLink` for you.
- **`go(to)` runs `play(label, onCovered)`:**
  1. Lock scroll (`lockScroll(true)`).
  2. The panel slides up and covers the screen, with the destination's name (`labelFor`).
  3. **While covered:** `markCovered()`, then `navigate(to)`. `show(location)` swaps the page on screen
     (`setShown`) and `resetScroll()` jumps to the top.
  4. Unlock scroll, `emitReveal()`, and the panel lifts.
- **Pages render `useShownLocation()`, not `useLocation()`.** The URL changes first, but the old page
  stays on screen until the curtain covers it. Anything that renders per page (Header active link,
  Menu, Buddy) must read `useShownLocation()`.
- **Back and forward play the same curtain.** A `useLayoutEffect` notices a URL change that we didn't
  start and calls `syncRef.current()`, which plays the curtain to the new URL. If back is pressed
  mid-transition, it catches up when the current curtain finishes (`busy` guard).
- **Scroll restoration** is set to `manual`; we reset the scroll ourselves under the curtain.
- **Reduced motion:** no curtain. Navigation swaps instantly.
- **Same page:** `go('/about')` while on About scrolls smoothly to the top instead of playing the curtain.

### Entrances
- **`useEntrance(rootRef)`** (in every page) sets every `.once-in` element to `y: 18vh, opacity: 0`
  on mount, then raises them (`expo.out`, staggered) on reveal. It also refreshes ScrollTrigger.
  `.once-in` has no CSS; it is only a hook for this.
- **`SplitWords`** splits text into masked words that slide up, either on reveal
  (`trigger="reveal"`, page titles) or on scroll (`trigger="scroll"`).
- **`useGsap(cb, scopeRef, deps)`** runs GSAP code in a `gsap.context` scoped to the page and reverts
  everything on unmount. Use it for any page animation, so nothing leaks between pages.

## Scroll (`src/lib/scroll.ts`)

- One Lenis instance (`lerp 0.1`), ticked by `gsap.ticker`, and it updates ScrollTrigger on every scroll.
  It is not created when reduced motion is on.
- **Scroll programmatically with `getLenis()?.scrollTo(...)`,** falling back to `window.scrollTo` only
  when Lenis is off. Calling `window.scrollTo` while Lenis runs fights it.
- `lockScroll(true|false)` stops or starts Lenis and toggles `body.is-locked`. It is used by the
  preloader, the curtain and the menu.
- `scrollDirection()` returns the last direction (1 down, −1 up). The Home name marquee uses it.

## Motion conventions (`src/lib/motion.ts`)

- **Register plugins only here.** Import `gsap` and `ScrollTrigger` from `@/lib/motion`, not from `gsap` directly.
- **Easings:**
  - `EASE` (`'site-ease'`, 0.7,0,0.3,1) for in-out moves, `EASE_OUT` (`'site-ease-out'`) for soft settles.
  - The CSS twins live in `global.css`: `--ease`, `--ease-out`, `--ease-pop`.
- **`prefersReducedMotion()`:** every effect should check it. Global CSS cuts animation and transition
  times to 0.01 ms under reduced motion.
- **`isTouch()`** (`hover: none` or `pointer: coarse`) turns off magnetism and cursor followers.
  It is checked once, not live.

## The cursor and things that follow it

- **Custom cursor:** `/cursor.svg`, applied in CSS only for `(hover: hover) and (pointer: fine)`.
  Touch screens keep native behaviour.
- **`src/lib/pointer.ts`** keeps the last pointer position for the whole site. Followers read it, so they start
  in the right place even before the mouse moves.
- **Followers move with GSAP `quickTo`, never CSS offsets:**
  - `HoverPreview` (project and certificate preview card, round cursor, label)
  - `FollowBall` (the "Next case" ball on project pages)
  - the buddy's follow and eyes
- **`useMagnetic(target, inner?, strength)`** pulls buttons and links toward the cursor with elastic `quickTo`.
  `Button` and the header links use it.
- **Button fills use CSS `:hover` / `:focus-visible`,** so a GSAP transform can never leave a fill stuck half-way.

## Responsive

- **`useIsMobile()`** matches `(max-width: 800px), (hover: none)`. It turns off hover previews,
  forces the Work grid view and gives the buddy its small docked mode.
- **The main CSS breakpoint is `max-width: 800px`.** A few files also use 700 px (`device.css`) or 900 px (`lab.css`).
- **At 800 px or less,** `global.css` shrinks `--container-padding` and `--section-padding`, and the header
  swaps its links for a "Menu" text button.

## Styling

- **Tokens** live in `src/styles/global.css` `:root`:
  - Colours: `--color-dark #1c1d20`, `--color-blue #455ce9`, light, grey and border variants.
  - Easing: `--ease`, `--ease-out`, `--ease-pop`.
  - Durations: `--fast` 0.3 s through `--slow` 0.9 s.
  - Spacing: `--container-padding`, `--section-padding`, `--gap-padding`.
  - Font: `--font`.
- **Utilities:**
  - `.container` side padding; `.container.medium` double side padding.
  - `.page`, `.stripe` (1 px rule), `.row`, `.page-header`, `.visually-hidden`.
  - `.theme-dark` for a dark page or section.
- **One CSS file per area,** imported by the component or page that owns it
  (`button.css`, `header.css`, `video.css`, `buddy.css`, …). There are no CSS modules: class names are global,
  so keep them specific (`case-…`, `about-…`, `buddy-…`).
- **Some classes are a contract.** Buddy tours, the buddy's reactions and `Contact.tsx` target them,
  for example `.case-highlights`, `.paper-list`, `.about-film`, `.contact-form`, `.video-frame` and `.footer-bottom`.
  If you rename one, search `src/data/buddy.ts` and `Buddy.tsx`.

## Layers (z-index)

| z-index | What |
|---|---|
| 950 | Buddy while riding the curtain (`.buddy.is-riding`) |
| 900 | Page-transition curtain and preloader (`.curtain`) |
| 820 | Menu button |
| 810 | Side menu panel |
| 806 | Buddy dust canvas |
| 805 | Buddy, and its "bring back" dot |
| 790 | Buddy tour spotlight |
| 700 | Hover preview card, cursor and label, and the next-case follow ball |
| 50 | Header |
| 10–11 | Video seek strip and video buttons (inside the video frame) |

## Content and data

All content lives in `src/data/` (no CMS). Pages import it directly. Field-by-field reference:
[content-model.md](content-model.md). `SITE` is the single source of truth for personal links:
footer, menu and contact all render from it.

## Other building blocks

- **Globe** (`RotatingGlobe` via `Icons.Globe`):
  - d3-geo orthographic projection of the bundled GeoJSON `src/data/globe-land.json`, so it needs no network.
  - Each instance spins on its own rAF loop, writing the path's `d` attribute.
  - Variants: `solid` (Home badge) and `dark` (About).
- **Project art:** `ProjectVisual` shows `project.cover`, or else a drawn SVG from `ProjectArt` (keyed by slug).
- **Monitor:** `Monitor` draws a studio display in CSS. Every size is a share of its own width (`cqw`,
  `container-type: inline-size`):
  - 85.5% tall in total
  - a 16:10 screen with a 0.6% black bezel
  - a 25.3% neck, base plate and floor shadow

  `DeviceIframe` puts `project.iframe` on it: a live PDF (viewer toolbar hidden) on computers, and a paper
  cover on phones. ProjectPage places it in `section.case-monitor`, a full-width `#e6e8eb` band, inside
  `.container.medium`, so it's as wide as the page minus four container paddings. These proportions copy the
  reference site's device block; the drawing is ours.
- **Contact form:** posts JSON to Web3Forms (`SITE.web3formsKey`, public by design), with a
  `botcheck` honeypot and client-side validation. On success it calls `buddy.say` and `buddy.feel`.

## Known issues and leftovers

Small things found while documenting. None break the site.

- **The preloader's scroll lock is undone early.** On first load `Menu`'s `[menuOpen]` effect runs
  `lockScroll(false)` after the Preloader locked. Lenis is also created after the Preloader starts.
  As a result, the page can scroll under the loader.
- **The Home name marquee moves a fixed step per tick,** so its speed depends on frame rate.
- **ProjectPage's hero button gets two `y` tweens.** `.case-hero .btn-wrapper` is both `.once-in` and has a scrub tween.
- **List view on wide touch screens.** `useIsMobile` also matches `(hover: none)`, so the Work grid is forced there, but
  the list/grid toggles are only hidden at ≤ 800 px. "List view" does nothing on those screens.
- **`multimodal-agentic-system` has no cover and no `ProjectArt` entry,** so it shows an empty illustration.
- **Unused cover images:** `public/images/projects/predict-studio/cover.jpg` and
  `public/images/projects/subpixel-cac-segmentation/cover.jpg` are AI images that the data no longer points to
  (the projects use their `cover.png`).
- **Unused:**
  - `MonitorShell.tsx` and `monitor-shell.css`
  - `VideoPlayer`'s `crop` (no `.crop-bars` CSS)
  - `Footer`'s `curve` prop
  - the `topojson-client` dependency (the globe data is already GeoJSON)
  - `public/images/projects/predict-studio/pipeline.webp`
- **`public/predict-studio-reel.html`** is a standalone 15 s canvas reel. Nothing links to it; it is
  reachable at `/predict-studio-reel.html`.
