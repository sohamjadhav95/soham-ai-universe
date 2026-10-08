# Videos

Every video on the site plays through one component, `src/components/VideoPlayer.tsx`,
and streams in small pieces (HLS). This page explains both and how to add a video.

## Where videos appear

| Page | Video | Data |
|---|---|---|
| About | 50-second story film | hard-coded in `src/pages/About.tsx` (`/videos/soham-story…`) |
| PrediCT Studio | promo loop (no sound) | `videos[0]` of `predict-studio` in `src/data/projects.ts` |
| PrediCT Studio | "Workflow Tutorial" (sound, 1x/2x, full screen) | `videos[1]` of `predict-studio` |

Project pages render `project.video` or every entry of `project.videos` (see
[content-model.md](content-model.md)). The first video is full-bleed; later ones sit in a
rounded block (`.video-block.is-rounded`) with an optional title.

## The player (what the visitor gets)

- **A clean frame:** the video fills its block edge to edge, with no grey matte (light grey only while loading).
- **Autoplay:** muted and looping while at least 35% of it is on screen; it pauses when scrolled away.
  If the visitor paused it themselves, it stays paused.
- **Play / pause:** tap or click anywhere on the video (`.video-surface`, a full-cover button).
- **Sound toggle** (`sound: true`): a round button at the bottom right.
- **Full screen** (`fullscreen: true`): a button next to the sound toggle. Entering full screen
  turns the sound on and plays. Sound stays on after leaving.
  - Desktop and Android put the whole frame in full screen, so the custom controls stay.
  - iPhone can't do element full screen, so it falls back to the system player (`webkitEnterFullscreen`).
- **Speed toggle** (`speedup: true`): a 1x / 2x button at the top right.
- **Timeline:** a 2 px hairline on the very bottom edge, 5 px on hover, with a 24 px invisible strip that is easy to grab.
  - Click or drag to seek. The video holds still while you drag and carries on after.
  - With keyboard focus, the arrow keys jump ±5 s.
  - The track is mid grey, so it shows on both light and dark footage.
  - On rounded frames the bar runs only along the straight part of the bottom edge (inset by `--video-radius`), so neither end hides under a corner.
  - Buttons sit above the seek strip (z-index 11 vs 10), so tapping a button never seeks.
- **No other controls.** This is a design rule in `AGENTS.md`.

### Props

| Prop | Meaning |
|---|---|
| `src` | MP4 (H.264), the fallback file |
| `webm` | optional WebM fallback, for browsers without H.264 |
| `stream` | HLS playlist `/videos/<name>/index.m3u8`. **Preferred whenever set.** |
| `poster` | image shown before playback |
| `title` | used in aria labels |
| `sound`, `speedup`, `fullscreen` | show those buttons |
| `crop` | legacy flag (adds `.crop-bars`, which currently has no CSS) |

## Why the videos stream in pieces (HLS)

**The host can't send part of a file.** The live site is on Cloudflare Pages, which does not support HTTP
range requests: it always answers `200` with the whole file, never `206 Partial Content`
([cloudflare/workers-sdk#3861](https://github.com/cloudflare/workers-sdk/issues/3861)).

**So a plain MP4 restarts when you seek.** A browser playing a big MP4 needs range requests to jump into
the middle. Without them, Chrome restarts the video from 0 whenever you click a part of the
timeline that hasn't downloaded yet. Several earlier "fixes" only changed click handling; that was
never the problem.

**The fix is HLS.** `scripts/make-hls.sh` cuts each MP4 into a playlist plus ~4-second pieces
(`index.m3u8`, `init.mp4`, `000.m4s`, `001.m4s`, …). Each piece is its own small file, so a jump
only loads the right piece. This works on any static host.

How `VideoPlayer` picks a source (the stream is attached only once the video is within half a
screen of the viewport):

1. Apple devices (`navigator.vendor` is Apple) that can play HLS natively get `video.src = stream`.
2. Everywhere else with Media Source Extensions: **hls.js** (the light build,
   `import('hls.js/light')`), loaded only at that moment as its own chunk (about 118 KB gzipped).
3. Otherwise, native HLS if the browser can play it.
4. Otherwise, or after any fatal hls.js error (for example a codec it can't play), the `<source>`
   MP4/WebM files are rendered and loaded. This is `useFiles` state.

## Add or replace a video

1. Put the MP4 (H.264 + AAC, 720p or 1080p, under 25 MB) in `public/videos/<name>.mp4`.
   Optionally add a WebM copy and a poster image.
2. Make the stream: `npm run hls -- public/videos/<name>.mp4`, or `scripts/make-hls.sh` for every MP4.
   This needs `ffmpeg`. Video and audio are copied as they are (`-c copy`), so there is no quality
   loss. Pieces are cut at keyframes, so they may run 4–8 s.
3. Point the data at it, for example in `projects.ts`:
   ```ts
   video: { src: '/videos/<name>.mp4', stream: '/videos/<name>/index.m3u8', poster: '/videos/<name>.webp', sound: true }
   ```
4. **Replacing a video: run step 2 again.** The stream folder is a copy; an old stream keeps
   playing the old video.

Limits: Cloudflare Pages serves files up to 25 MiB each and 20,000 files per site. Pieces are
small, so this is only a concern for the MP4 fallback.

## Testing videos locally

- **The test browser can't play H.264.** The Chromium that Playwright uses here can't decode
  H.264, so locally the player falls back to the WebM (the About film has no WebM, so it shows its
  poster). In real Chrome, Safari and Edge the H.264 stream plays.
- **Reproduce the live host:** `python3 scripts/qa/no-range-server.py` serves `dist/` the way
  Cloudflare does (it ignores `Range`). A plain MP4 restarts on seek there; a stream doesn't.
- **Test the stream in that browser:** make a VP9 copy of the stream, for testing only. Copy the
  WebM into HLS with the same ffmpeg flags as `make-hls.sh`, and serve it in place of the real stream folder.
- **Throttle the network** with the Chrome DevTools Protocol (`Network.emulateNetworkConditions`)
  so the clicked spot isn't already downloaded.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Clicking the timeline restarts the video | The video has no `stream`, or its stream is stale. Run `make-hls.sh` and set `stream`. |
| Video never starts locally | The test browser lacks H.264 and there's no WebM. Expected; try real Chrome. |
| Full screen but silent on iPhone | iPhone uses the system player. `toggleFullscreen` clears `muted` right after opening it, so check the phone's silent switch first. |
| Timeline invisible on a light video | Someone changed `.video-progress-track` back to white. Keep the mid-grey track. |
