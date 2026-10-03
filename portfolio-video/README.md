# Heartbeat Signal — Soham Jadhav · 15 s portfolio film

A 15-second motion-graphics film (1920×1080, 60 fps, synthesized sound). It is built with
[HyperFrames](https://github.com/heygen-com/hyperframes) (HTML → video), GSAP and Three.js. Everything on
screen is drawn in code: the oscilloscope ECG, the extruded 3D name, the A3 sub-pixel coverage grid
(real Sutherland–Hodgman coverage values), the segmentation flood, the split-flap board, the CSS-3D orbit
and the refracting glass lens. Every sound is synthesized too. No stock footage, samples or AI-generated
frames are used.

| File | What it is |
|---|---|
| `renders/soham-portfolio-16x9.mp4` | The film |
| `renders/poster.jpg` | Poster frame (for `<video poster>`) |
| `BRIEF.md` | Intent, plus the **Facts** table: the only numbers allowed on screen |
| `frame.md` | Design system (palette, type voices, motion rules), treated as brand truth |
| `STORYBOARD.md` / `DIRECTOR.md` | Shot list and director's brief (arc, intent, critique rubric) |
| `docs/CRITIQUE.md` | Scored critique passes and what each one fixed |
| `docs/VO_SCRIPT.md` | Timed voiceover script and voice direction (the VO slot is optional) |
| `docs/ASSET_PROMPTS.md` | Optional upgrades: headshot, screen recordings, AI plates, music |
| `index.html` | Root composition: 9 scenes on a 120 BPM grid, global overlay, 2 audio stems |
| `compositions/frames/*.html` | One sub-composition per scene, plus `00-overlay.html` |
| `lib/kit.js` | Shared deterministic helpers: PRNG, eases, ECG waveform, beam renderer, exact coverage, shake |
| `scripts/synth_audio.py` | Synthesizes `assets/audio/bed.wav` + `sfx.wav` (−16 LUFS) from one cue table |
| `scripts/vendor.mjs` | Copies GSAP, Three.js and fonts into `vendor/` and rewrites CDN references, so renders work offline |
| `scripts/make-typeface.mjs` | Converts Archivo Black into three.js typeface JSON for the 3D name |

## Run it

```bash
cd portfolio-video
npm install                 # also vendors libs + fonts (postinstall)
npm run dev                 # HyperFrames Studio preview in the browser
npm run check               # lint + runtime + layout + motion + WCAG contrast
npm run render              # → renders/soham-portfolio-16x9.mp4 (delivery quality, 60 fps)
npm run audio               # re-synthesize the soundtrack (needs python3 + numpy + scipy + ffmpeg)
```

Requirements: Node 22+ and FFmpeg. In a sandbox without Chrome downloads, point at a local
chrome-headless-shell with `HYPERFRAMES_BROWSER_PATH=/path/to/headless_shell`.

## Adding the voiceover later

Record or generate the lines in `docs/VO_SCRIPT.md`, then drop the file at `assets/audio/vo.wav`. Add it as
`<audio id="vo" src="assets/audio/vo.wav" data-start="0" data-duration="15" ...>` in `index.html`, and
carve the bed under it with `/hyperframes-audio` (`scripts/carve.mjs`).

## Putting it on the site

- **Video:** `<video src="…/soham-portfolio-16x9.mp4" poster="…/poster.jpg" autoplay muted loop playsinline>`.
  It reads fully without sound.
- **Live:** mount the composition with the `@hyperframes/player` web component. It stays crisp at any size.
