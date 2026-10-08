# The site buddy (Nimbus)

A small character lives in the bottom-right corner of every page. It greets visitors, explains
each page, gives tours that play on their own, suggests where to go next and reacts to what the
visitor does. Visitors can close it (it blows away like dust) and bring it back.

The character on the site is **Nimbus** (a cloud). Two more original characters, **Bit** and
**Pico**, are ready to swap in. Switching takes one word.

## Files

| File | What's in it |
|---|---|
| `src/components/buddy/Buddy.tsx` | The site buddy: position, speech bubble, tours, intros, suggestions, reactions, play, close and bring back. Mounted once in `App.tsx`. |
| `src/data/buddy.ts` | **Everything it says and every tour.** Which character is on the site. |
| `src/lib/buddy.ts` | Tiny event bus so pages can talk to it: `buddy.say(text, { actions?, ms? })`, `buddy.feel(feeling, ms)`. |
| `src/components/buddy/Nimbus.tsx`, `Bit.tsx`, `Pico.tsx` | The three characters (SVG, viewBox `0 0 140 150`). |
| `src/components/buddy/types.ts` | `Feeling`, `Gesture`, `CharacterProps`, shared by all characters. |
| `src/components/buddy/parts.tsx` | Shared parts: `Arm` (rotates with GSAP `svgOrigin`), `Extras` (tears, Zzz, hearts, sparkles), `Shadow`, `PixelFilters` + `pixelate()`. |
| `src/components/buddy/shapes.ts` | SVG path helpers (`arcUp`, `heart`, `star4`, …). |
| `src/components/buddy/dust.ts` | The "blow away like dust" effect: `snapshot(svg)` and `dust(canvas, rect, { duration, reverse, tint })`. |
| `src/components/buddy/index.ts` | `CHARACTERS` map and `DUST_TINT` per character. |
| `src/styles/buddy.css` | Character animations plus the site buddy UI (bubble, tour controls, spotlight, close button, dot). |
| `src/pages/BuddyLab.tsx` | Hidden comparison page at `/lab/buddy` (noindex, disallowed in `robots.txt`). |

## Keep the buddy in sync with the site

The buddy showcases the site's content, so **its content must change whenever the site's does.**
When you change content, update `src/data/buddy.ts` in the same change, then run `npm run qa:buddy`.

| You changed… | Update in `src/data/buddy.ts` |
|---|---|
| Added a project | A `NOTES['<slug>']` entry: a one-line `intro`, plus lines for its `highlights`, `video`, `iframe` and `flow`. Its page tour is built automatically from what the page shows. If it's a headline project, consider a stop in `SITE_TOUR`. |
| Removed or renamed a project (slug) | Its `NOTES` entry, and any `SITE_TOUR` stop or tip `go` action with that route |
| Changed a project's numbers, video or paper | The matching `NOTES` lines (they quote numbers), plus `play` / `link` actions |
| Added, removed or reordered a section on Home, Work, About or Contact | That page's `PAGES[...].tour` (and its `tips`) |
| **Renamed a CSS class** a stop points at (`target`) | Every stop and tip with that target. Run `grep -n "<class>" src/data/buddy.ts`. |
| Added a paper, film or tutorial | A stop with a `link` or `play` action, so the buddy can open it |
| Changed a page's purpose or title | That page's `intro` |

`npm run qa:buddy` (`scripts/qa/buddy-targets.mjs`) opens every page and checks that every tour stop and
"show me" tip still points at something that exists. It exits 1 and lists any stop that points at nothing.
The words can still go stale: when a number or title changes, re-read the lines that mention it.

## Characters

All characters take the same props (`CharacterProps`):

- `feeling`: `idle | happy | talking | excited | proud | shy | sad | sleepy | dizzy`
- `gesture`: `rest | wave | point | cheer | cover`
- `point`: the pointing angle in degrees. 0 = right, 90 = down, −90 = up, 180 = left. With `point`,
  the character picks the arm on that side.
- `look`: eye direction, x and y from −1 to 1.

**Switch character:** in `src/data/buddy.ts` set `BUDDY = { character: 'pico', name: 'Pico' }`.
The cloud-shaped "bring back" dot is Nimbus-only; other characters show a mini version of themselves.

**Add a character:**
1. Make `src/components/buddy/<Name>.tsx` that renders `CharacterProps`, reusing `parts.tsx`.
2. Add it to `BuddyCharacter`, `CHARACTERS` and `DUST_TINT`.
3. Check every feeling and gesture at `/lab/buddy`.

## What it says: `src/data/buddy.ts`

| Export | Purpose |
|---|---|
| `PAGES` | For `/`, `/work`, `/about`, `/contact`: `intro` (a few words), `tour` (stops) and `tips`. |
| `NOTES` | Per project: `intro`, plus lines for its videos, live screen (`iframe`), highlights, a notable section, flow and code link. |
| `projectTour(p)` (internal) | Builds a project's tour from what its page shows: videos, iframe, highlights, noted section, flow, sample, gallery, primary link. At most 6 stops. |
| `guideFor(path)` | `{ intro, tour, tips }` for any route. |
| `suggestionsFor(path, seen)` | Shuffled pool for hover and click: page tips, 3 random projects (unseen first), page-tour offer, the 1-minute tour, About, Contact. |
| `introFor(path, seen)` | The intro bubble: page intro + "Tour this page · N s" + one recommendation. |
| `SITE_TOUR` | The 1-minute tour: About (intro text, film, papers, experience), then Sub-pixel CAC, the PrediCT Studio videos and the paper on its screen, then Contact. 9 stops, about 68 s. |
| `LINES` | Everything else: greetings, reactions, paused, tour done. |
| `stepTime(step)` | How long a stop stays: `clamp(2600 + 48 ms × characters, 5200, 9000)`. |

**A tour stop** is `Step = { to, target, nth?, text, actions?, ms? }`:
- `to`: the route.
- `target`: a CSS selector on that page; `nth` picks the nth match (for example, the second `.case-device .video-frame`).
- `text`: what the buddy says while pointing at it.

**Bubble buttons** are `BuddyAction`s:
- `go`: travel to a route, and optionally point at a `target` there.
- `tour`: start the `'site'` or `'page'` tour.
- `link`: open in a new tab.
- `play`: play the video at `target` with sound, or full screen.
- `close`: "Maybe later".

> **If you rename or remove a CSS class that a tour points at, update the tour.** Stops whose
> target is missing still speak, but without walking or pointing. Search `src/data/buddy.ts` for the class.

## How it behaves

### First visit, greeting, intros
- **On the first reveal of a visit:** a time-of-day greeting in IST, with *Take the 1-minute tour*
  and *Maybe later*.
- **Returning visitors:** "Welcome back! You haven't seen X yet."
- **Opening a page by yourself:** a few words about the page, *Tour this page · N s*, and a
  recommendation. This happens once per page per visit.
- **Arriving through the buddy** (a tip's *go* button): the intro is forced, or, if the action had
  a `target`, a one-stop "here it is" explanation.

### Suggestions
- **Hover** (mouse) opens the next suggestion when no bubble is showing.
- **Click or tap** always shows the next suggestion. The buttons inside the bubble do the actual going.
- **Rotation:** suggestions come from a shuffled bag per page (`suggestionsFor`). When the bag runs
  out it reshuffles and avoids repeating the last tip.

### Tours (one engine for everything)
`run` holds the tour in progress: `{ kind: 'site' | 'page' | 'explain', steps, i, shown, paused, held, left, since }`.

For each stop, the buddy:
1. **Travels if needed.** If `step.to` isn't the current page, it travels there (rides the curtain) and continues after the reveal.
2. **Scrolls to the item** with Lenis (centred if it fits, else its top at 12% of the screen).
3. **Moves next to it** (`focus` = the element; `placeNear()` picks the spot) and points at it (`aim = 'focus'`).
4. **After 1 s,** dims the page for 2.6 s (`DIM_MS`), says the text, and starts the stop timer (`stepTime`).
5. **When the timer ends,** goes to the next stop. After the last stop it says "That's the tour!", or
   for page tours "Where next?" with two recommendations.

Where it stands (`placeNear`), in order of preference:
- to the right of the item
- to the left of it
- below it
- above it
- just inside its top-right corner

It always stays inside the screen and clear of the menu button.

Tour controls (`.buddy-tour`, under the buddy, site and page tours only):
- pause / carry on
- stop count with a progress line
- next stop
- **End tour**

These pause, hold or end a tour:

| Event | Effect |
|---|---|
| Visitor scrolls (wheel, touch or keys), about 150 px within 1.2 s | Pauses ("Paused. Take your time, then press ▶."). A one-stop `explain` just ends. |
| A *play*, *full screen* or *link* button | Pauses until ▶ |
| Cursor really over the buddy, its bubble or controls (moved within 6 s) | Holds the current stop |
| Clicking the buddy | Pauses or carries on |
| Going to another page by yourself (no pending travel) | Ends the tour quietly |
| Esc | Ends the tour |
| Closing the buddy | Ends the tour |

**Spotlight** (`.buddy-spot`, z-index 790, always mounted):
- Each frame it follows the live element: `is-on` shows a thin blue ring, and `is-dim` adds the dark wash for 2.6 s.
- If the element leaves the page (`!isConnected`), `focus` is dropped and the spotlight hides.

### Idle, reactions, play
- **Idle:** after 20 s idle it turns sad and points down ("There's more below…"), or offers a tour
  at the page bottom. After 60 s it falls asleep. Any activity wakes it. Idle time is counted only after the
  reveal and never during a tour.
- **Reactions:**
  - hovering papers: excited (once per page)
  - project rows: happy flash
  - typing in the contact form: "Ooh, keep going!"
  - contact sent or failed: proud or sad, via the bus from `Contact.tsx`
  - the About film on screen: "Psst, it has sound"
  - very fast scrolling: dizzy (not during tours, since tour scrolling is fast)
- **Play (desktop):**
  - drag and throw (floaty gravity, bounces, then glides home)
  - rubbing: shy, "Hehe"
  - 5 quick clicks: "stop poking"
  - 7 quick clicks: the page pixelates (`#buddy-px-*` filters), then "A3 to the rescue!"
- **Follow:** when nothing else is going on, on desktop it drifts toward the cursor (up to 18% of
  the screen) and its eyes follow it.

### Close and bring back
- **× button:** faint until hover, always visible on touch screens.
- **Closing:** a sad wave, then `snapshot()` draws the SVG to a canvas and `dust()` blows its pixels away up-left for 1.8 s,
  tinted with `DUST_TINT` so a white character's dust shows on white.
- **The dot:** a small dot (`.buddy-dot`) stays bottom-right. Clicking it plays the dust in reverse (1.2 s) and the buddy says "I'm back!".
- With reduced motion it simply fades.

## State it remembers

| Key | Where | Meaning |
|---|---|---|
| `buddy:closed` | localStorage | `'1'` while closed (the dot shows on every page) |
| `buddy:visits` | localStorage | Visit count, for the welcome-back greeting |
| `buddy:seen` | localStorage | Project slugs opened, for "you haven't seen…" and recommendations |
| `buddy:greeted` | sessionStorage | Greeting shown this visit |
| `buddy:intros` | sessionStorage | Pages already introduced this visit |

To reset while testing, run `localStorage.clear(); sessionStorage.clear()` and reload.
**`?buddyfast` in the URL** shortens the idle timers to 2.5 s (sad) and 6 s (asleep).

## Layers and sizes

- **Size:** 110 × 118 px on desktop, 62 × 66 px on phones (`useIsMobile`: ≤ 800 px or no hover).
- **Layers:** the buddy is at z-index 805; while riding the curtain (`is-riding`) it goes to 950, above the curtain at 900.
  The dust canvas is at 806 and the spotlight at 790. The menu is at 810/820, so an open menu covers the buddy.
- **Bubble placement:** the bubble flips to open rightwards near the left edge (`bubble-start`) and below
  the buddy near the top or under the menu button (`bubble-below`).

## Engine notes for editing `Buddy.tsx`

- **Functions are re-created every render; long-lived listeners call `api.current.*`.** `api` is a
  ref holding the latest versions. Don't call a stale closure from an effect with `[]` deps.
- **One animation loop:** the GSAP ticker (`tick`) does positioning, eye direction, pointing
  (every 5 frames, only when the angle changes by more than 5°), the spotlight, bubble flipping and
  hover-hold. It reads refs, never React state.
- **`pending` carries intent across a page change:** `{ to, run?, target?, nth? }`. The `path` effect consumes it.
  When no pending travel is set, the visitor navigated on their own.
- **`firstPath`:** the very first page is handled by the greeting, not the intro.
- **Timers:** all go through `later(key, fn, ms)` and `cancel(...keys)`, so a new timer with the same key replaces the old.

## Lessons (bugs we hit)

- **The dim stuck over every page.** The spotlight kept an element from the previous page; a
  detached element measures 0×0, so the huge shadow covered everything. Fixes: drop `focus` when
  `!isConnected`, fade the dim after 2.6 s, and end tours on self-navigation.
- **A tour stalled when the buddy floated under a resting cursor.** The browser reported a hover with no
  leave event. Hover-hold now checks the shared pointer position against the buddy's boxes, and only
  if the mouse moved in the last 6 s.
- **The bubble hid under the menu button** in the top-right corner. It now flips below there.
- **Pointing at the bubble with a fixed angle** looked wrong once the bubble could flip. The hand now aims at the
  bubble's real position.
