# Keynote — Soham Jadhav · 30 s portfolio film

A 30-second portfolio film in the style of an Apple keynote launch: 1920×1080, 60 fps, with a synthesized keynote score and UI sound effects.
It is the second film, separate from the 15 s "Heartbeat Signal" film in `../portfolio-video/`.

**How it looks:** light paper stage, glass cards with long soft shadows, Geist type and a single cobalt accent.
**How it plays:** nine chapters, each making one clear claim backed by one proof.

Everything is built in code with [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML → video), GSAP and Three.js:
- the ceramic 3D "SJ" monogram
- the A3 sub-pixel coverage grid, using real Sutherland–Hodgman coverage values
- the inference race
- the paper cards and product cover-flow
- the credentials cascade

No stock footage, samples or AI-generated frames are used.

| Time (s) | Chapter | On screen |
|---|---|---|
| 0–3 | Introducing | 3D "SJ" monogram → **Soham Jadhav.** → AI Engineer · Researcher · Open-source developer |
| 3–5.5 | Recognition | Selected for **Google Summer of Code 2026**: ML4Sci, PREDICT1 · CAC scoring |
| 5.5–9.5 | Breakthrough | **A3: solved the sub-pixel problem.** Label area error **10.19% → 0.03%**, Agatston error 2.2× lower, risk agreement 77% → 83% |
| 9.5–12 | Speed | **63× faster than TotalSegmentator**, with an inference-time race |
| 12–15 | Research | **Published. Twice.** *Convo-Ease* (Cureus · Springer Nature) and *Beyond Text* survey (ICIA), 2025 |
| 15–19.5 | Products | **Built to be used.** Convo-Ease < 3 s · Copilot for Data Science ~90% · Tennis Predictor 77% · RenAIssance OCR · NexaOS Flow |
| 19.5–22.5 | Community | **Leads. Mentors. Contributes.** GDG On Campus AI & ML Co-Lead (2024–25), pgmpy, pyaptamer |
| 22.5–25.5 | Foundation | **9 certifications** (IBM AI Engineering, Deep Learning, GenAI with LLMs, ML with Python, Microsoft GenAI) plus B.E. AI & DS |
| 25.5–30 | Promise | "Building AI for **Good Faith of Humanity.**" → end card with links |

The music has four sections:
- piano intro
- a pulse that enters at 3 s
- a full lift at 15 s (Products)
- a resolve at 25.5 s (the mission), with a chime on the end card

| File | What it is |
|---|---|
| `renders/soham-keynote-16x9.mp4` | The film (H.264 High, CRF 16, 60 fps, 14.6 MB, faststart — web-ready as is) |
| `renders/poster.jpg` | Poster frame (for `<video poster>`) |
| `BRIEF.md` | Intent, plus the **Facts** table: the only claims allowed on screen |
| `frame.md` | Design system: palette, type, glass cards, motion rules |
| `STORYBOARD.md` / `DIRECTOR.md` | Shot list and director's brief (arc, clarity rules, critique rubric) |
| `docs/CRITIQUE.md` | Scored critique passes and what each one fixed |
| `docs/critique-snapshots/` | The contact sheets and frames each critique pass was judged on, plus cue frames from the final render |
| `docs/VO_SCRIPT.md` | Optional timed voiceover script and voice direction |
| `index.html` | Root composition: stage, 9 chapters on a 120 BPM grid, progress rail, 2 audio stems |
| `compositions/frames/*.html` | One sub-composition per chapter, plus `00-stage.html` and `99-rail.html` |
| `lib/kit.js` | Shared deterministic helpers: scene in/out, count-ups, eases, exact pixel coverage |
| `scripts/synth_audio.py` | Synthesizes `assets/audio/score.wav` and `sfx.wav` (−16 LUFS) from one cue table |
| `scripts/vendor.mjs` | Copies GSAP, Three.js and the Geist fonts into `vendor/`, so renders work offline |
| `scripts/make-typeface.mjs` | Converts Geist 800 into three.js typeface JSON for the 3D monogram |

## Run it

```bash
cd portfolio-video-keynote
npm install                 # also vendors libs + fonts (postinstall)
npm run dev                 # HyperFrames Studio preview in the browser
npm run check               # lint + runtime + layout + motion + WCAG contrast
npm run render              # → renders/soham-keynote-16x9.mp4 (CRF 16, 60 fps)
npm run audio               # re-synthesize the soundtrack (needs python3 + numpy + scipy + ffmpeg)
```

Requirements: Node 22+ and FFmpeg. In a sandbox without Chrome downloads, point at a local
chrome-headless-shell with `HYPERFRAMES_BROWSER_PATH=/path/to/headless_shell`.

## Adding the voiceover later

1. Record or generate the lines in `docs/VO_SCRIPT.md`.
2. Put the file at `assets/audio/vo.wav`.
3. Add it to `index.html` as `<audio id="vo" src="assets/audio/vo.wav" data-start="0" data-duration="30" ...>`.
4. Carve the score under it with `/hyperframes-audio`.

## Putting it on the site

- **Video:** `<video src="…/soham-keynote-16x9.mp4" poster="…/poster.jpg" autoplay muted loop playsinline>`.
  It reads fully without sound.
- **Live:** mount the composition with the `@hyperframes/player` web component. It stays crisp at any size.
