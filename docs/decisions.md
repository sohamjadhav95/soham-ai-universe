# Decisions

Why things are the way they are. Newest last. Before reversing one, read why it was made.

| Date | Decision | Why |
|---|---|---|
| 2026-10-06 | **Rebuild the site from scratch** in the style of dennissnellenberg.com: layout, interactions and feel only. | Soham's brief. Never copy that site's code, assets, copy or font. All code is original; content is Soham's. |
| 2026-10-06 | **Geist Variable** (free) as the font. | Close in feel to the reference, free to use, self-hosted via `@fontsource-variable/geist`. |
| 2026-10-06 | **Vite + React + plain CSS + GSAP + Lenis**, no CSS framework. | Fine-grained control over motion; one smooth-scroll instance driven by GSAP's ticker so ScrollTrigger and scrolling never disagree. |
| 2026-10-06 | **All content in `src/data/`** (no CMS); `SITE` is the single source for personal links. | Easy for Soham and Lovable to edit, and one place to fix a link. |
| 2026-10-06 | **Page-transition curtain on every route change**, including browser back/forward; pages render `useShownLocation()`. | Matches the reference feel; the old page never flashes before the curtain covers it. |
| 2026-10-06 | **Custom cursor only on fine pointers;** button fills use CSS hover, not GSAP. | Keeps touch and text editing native; a GSAP transform can't leave a fill stuck. |
| 2026-10-06 | **Cursor followers read `src/lib/pointer.ts` and move with `quickTo`.** | They start in the right place and never jump; CSS offsets lagged and stuck. |
| 2026-10-06 | **Rotating globe = d3-geo + bundled GeoJSON.** | Real continents with no network request at runtime. |
| 2026-10-06 | **Clean `VideoPlayer`:** edge-to-edge frame, tap to play/pause, sound toggle, hairline seek bar; no other controls. | Soham's request after trying a laptop mock-up; the reference shows video this cleanly. |
| 2026-10-08 | **Full-screen button only on long tutorials;** entering full screen turns the sound on. | Soham's request: tutorials need sound and size; short loops don't. |
| 2026-10-08 | **Videos stream as HLS pieces** (`scripts/make-hls.sh`, hls.js lazy, Safari native). | Cloudflare Pages has no HTTP range support, so seeking a plain MP4 restarts it. Pieces work on any host. See [videos.md](videos.md). |
| 2026-10-08 | **Site buddy with three original characters;** Nimbus (cloud) on the site, switchable in one word. | Soham's idea: a cute guide that shows people around. Characters are our own designs; references were inspiration only. |
| 2026-10-08 | **Closing the buddy blows it away as dust;** a small dot brings it back. | Soham's request: a clear way out that's still playful, and a way back. |
| 2026-10-08 | **Clicking the buddy shows the next suggestion;** buttons in the bubble do the going. | Soham asked for suggestions that change on every hover and click. |
| 2026-10-08 | **Tours play on their own** with pause, next and End tour under the buddy. The dim lasts about 2.5 s. Leaving a page by yourself ends a tour. | Soham's request after the first tour version kept the page dimmed and needed clicks. |
| 2026-10-08 | **One step engine** for site tours, page tours and "here it is"; tours are data (`{ to, target, text }`). | One code path to get right; content changes are data edits. |
| 2026-10-08 | **Buddy content must follow site content** (`src/data/buddy.ts` updated in the same change), enforced by `npm run qa:buddy`. | Soham's request: the buddy should always showcase what's actually on the site. |
| 2026-10-08 | **Monitor drawn in CSS** to the reference's proportions (85.5% tall, 16:10 screen, 0.6% bezel, 25.3% neck), on a `#e6e8eb` band. Live PDF on computers, paper cover on phones, scrolling over it scrolls the PDF. | The reference uses a photo of a monitor, which we can't copy. Phones can't show a PDF inside a page. Soham chose "always live" scrolling. |
| 2026-10-09 | **Buddy route guard:** stops, tips and buttons for a page that doesn't exist are dropped, warned about in dev, and reported by `npm run qa:buddy`. | A slug renamed in Lovable sent the 1-minute tour and a Home tip to "Page not found". Content is edited outside the QA flow, so visitors need a safety net. |
| 2026-10-09 | **Note Insight gets a drawn illustration** (`ProjectArt` `Notes`: a SOAP note whose highlighted phrases link to signed-off ICD-10 codes) instead of an AI-generated cover. | Soham's call: match the other projects' illustrations. Real-looking AI scenes read as stock art. |

## Lessons

Bugs worth remembering, so nobody reintroduces them:

- **Seeking restarted videos:** the cause was the host, not the player. See [videos.md](videos.md#why-the-videos-stream-in-pieces-hls).
- **The timeline was invisible on light videos and under rounded corners.** It now has a mid-grey track and
  runs only along the straight edge.
- **The tour dim stuck on every page, and a tour stalled under a resting cursor.**
  See [buddy.md](buddy.md#lessons-bugs-we-hit).
- **The test browser can't play H.264.** Locally, videos fall back to WebM; that's not a site bug.
