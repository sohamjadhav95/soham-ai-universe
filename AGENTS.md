# Start here
Read `docs/README.md` first. It maps the docs: architecture, content model, buddy, videos, testing, workflow, decisions.

# Working rules
- Fetch `main` before starting: Soham, Lovable's bot and Claude all commit to it.
- **Keep the buddy in sync with the site.** When site content changes (a project, a page section, a video, a paper, numbers, or a CSS class a tour points at), update `src/data/buddy.ts` in the same change (`NOTES`, `PAGES`, `SITE_TOUR`, tips), then run `npm run qa:buddy`. See `docs/buddy.md`.
- Keep the docs true: when a change alters how something works, update its doc in `docs/` in the same change.
- Before pushing: `npx tsc -p tsconfig.app.json --noEmit`, `npm run lint`, `npm run build`, `npm run qa` and `npm run qa:buddy` (see `docs/testing.md`).
- Add new dependencies to both `package-lock.json` and `bun.lock` (see `docs/workflow.md`).
- Never copy the reference site's (dennissnellenberg.com) code, assets, copy or font. Match layout, interaction and feel only.

# Architecture rules
- Keep personal links in SITE and render footer social icons from their labels, so destinations have one source of truth.
- Use CSS hover/focus states for button fills, so transforms cannot retain a stale animated offset.
- Apply the custom cursor only to fine-pointer devices, preserving native touch and text-editing behavior.
- Keep the next-project thumbnail in a clipped preview area below its title, so hover reveals cannot cover the title or divider.
- Render the shared globe with D3 orthographic projection and bundled World Atlas land data, so real continents rotate without runtime network dependencies.
- Cursor-following labels (hover previews, the next-project ball) read the shared position in `src/lib/pointer.ts` and move with GSAP `quickTo`, never with CSS hover offsets.
- Videos use the shared `VideoPlayer`: a clean frame that fills its block edge to edge (no grey matte; light grey only while loading), muted and looping while visible, tap to play/pause, a sound toggle bottom-right and a hairline seek bar on the bottom edge (kept on the straight part of rounded frames, with a grey track that shows on light and dark footage). Long tutorials may add a full-screen button beside the sound toggle (`fullscreen: true`), which turns the sound on; no other controls. Ship an MP4 (H.264) plus a WebM fallback, and an HLS stream made with `scripts/make-hls.sh` passed as `stream`: the host has no HTTP range support, so seeking inside a single file restarts it.
- Every route change plays the page-transition curtain, including browser back/forward: routes render `useShownLocation()` from `src/lib/transition.tsx`, which only switches to the new URL while the curtain covers the screen.
- The site buddy is mounted once in `App.tsx` and reads `useShownLocation()`. Its character is picked by `BUDDY.character` in `src/data/buddy.ts` (all characters share `CharacterProps`), its words live in that file, and pages talk to it only through `buddy.say()` / `buddy.feel()` in `src/lib/buddy.ts`. Every tour (site, page, one-stop "here it is") runs through the one step engine in `Buddy.tsx`: a stop is `{ to, target, text }`, the spotlight follows the live element and drops it once it leaves the page, the dim fades after about 2.5 s, and leaving a page by yourself ends any tour.
- The project-page monitor is drawn in CSS (`src/components/Monitor.tsx`, `src/styles/device.css`): every size is a share of its own width (`cqw`). Keep the reference proportions (85.5% tall, 16:10 screen, 0.6% bezel, 25.3% neck) and the full-width `#e6e8eb` band. PDFs show live on computers with the viewer toolbar hidden; phones show the paper cover from `iframe.cover`.
- Project images: Hover previews and list thumbnails must use `object-fit: contain` to display the project's background color as a letterbox border (matching the reference site). Hero images on the project page itself should use `object-fit: cover` to fill the frame seamlessly.
