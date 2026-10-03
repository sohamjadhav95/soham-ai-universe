# Soham, the product: 52.5 s narrated story ad

This is the third portfolio film, a narrated product ad where the product is Soham:
- 1920×1080, 60 fps, voiceover plus music plus sound effects
- built the way the reference reel Soham shared is built (Damiano Caudullo's "Tally" ad, made with his HyperFrames *Motion Graphics with Claude Code* starter kit)
- it sits beside `../portfolio-video/` ("Heartbeat Signal", 15 s) and `../portfolio-video-keynote/` ("Keynote", 30 s)

**The idea.** "Your AI model says it's accurate. It's *lying* to you." The film opens on a real problem: binary masks snap sub-pixel outlines to whole pixels, which puts about a 10% error into every label. It then shows Soham fixing it with A3, taking the error from 10.19% to 0.03%. From there it runs through the rest of his work as micro-stories:
- Google Summer of Code 2026
- 63× faster than TotalSegmentator
- Convo-Ease in under 3 s
- Copilot automating about 90% of the workflow
- two published papers
- GDG AI & ML Co-Lead

It ends with a wink ("Built in code, with AI. Every single frame.") and a call to action.

**Pix**, a code-drawn pixel mascot, gets snapped and then rescued.

| Section | What happens |
|---|---|
| Story | VO-first. Each spoken phrase gets its own visual beat, and one accent word per line is set in italic serif. |
| Voice | **Kokoro-82M** (open source, Apache-2.0), voice `af_heart`, rendered locally on CPU. The name's pronunciation is fixed via phonemes. |
| Look | Warm light canvas, one hot orange accent, Inter + Instrument Serif *italic* + Archivo Black + JetBrains Mono, with dark "chaos" interludes |
| Sound | Synthesized score (D minor tension → D major lift) ducked under the voice, plus the starter kit's code-made SFX and synthesized hits. −16 LUFS. |

| File | What it is |
|---|---|
| `renders/soham-story-16x9.mp4` | The film |
| `renders/poster.jpg` | Poster frame (for `<video poster>`) |
| `BRIEF.md` | Intent, plus the **Facts** table: the only claims allowed on screen or in the VO |
| `frame.md` | Design system: palette, type roles, the Pix mascot, motion rules |
| `STORYBOARD.md` / `DIRECTOR.md` | Beat-by-beat storyboard keyed to words, and the director's brief plus rubric |
| `docs/VO_SCRIPT.md` | The 18 voiceover lines, voice direction, and how to swap in your own voice |
| `docs/CRITIQUE.md` | Scored critique passes and what each one fixed |
| `docs/critique-snapshots/` | The contact sheets each pass was judged on |
| `index.html` | Root composition: stage, 12 scenes (mounts written by `make_vo.py`), VO + score + SFX tracks |
| `compositions/frames/*.html` | One sub-composition per scene, plus `s00-stage.html` |
| `lib/kit.js` | Shared deterministic helpers: word cues, captions, the Pix mascot, exact pixel coverage, count-ups, shake |
| `lib/cues.js` | Generated: scene starts plus word times from the voiceover |
| `scripts/make_vo.py` | Renders the VO with Kokoro, lays it on the 120 BPM grid, and writes the cues, the scene mounts and the scene durations |
| `scripts/synth_audio.py` | Synthesizes the score and SFX on the same word cues, ducks the music, and levels all three stems to −16 LUFS (lossless FLAC) |
| `assets/sfx/` | The starter kit's code-made sound effects |
| `vendor/` | GSAP plus the kit's OFL fonts, so renders work offline |

## Run it

```bash
cd portfolio-video-story
npm install                         # GSAP (vendored by postinstall)
npm run dev                         # HyperFrames Studio preview
npm run check                       # lint + runtime + layout + motion + WCAG contrast
npm run render                      # → renders/soham-story-16x9.mp4 (CRF 16, 60 fps)

# Re-voice / re-time (optional)
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile scipy
mkdir -p .models && (cd .models && for f in kokoro-v1.0.onnx voices-v1.0.bin; do \
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f; done)
npm run vo                          # Kokoro → lib/cues.js, index.html scene mounts, out/vo_raw.wav
npm run audio                       # score + SFX + levels → assets/audio/*.flac
```

To use **your own voice**, record the 18 lines in `docs/VO_SCRIPT.md` as `assets/audio/lines/L01.wav` … `L18.wav` and run `.venv/bin/python scripts/make_vo.py --lines`. Then run `npm run audio` and re-render. The whole film re-times to your delivery.

Requirements: Node 22+ and FFmpeg, plus Python 3 with numpy and scipy for the audio. In a sandbox without Chrome downloads, set `HYPERFRAMES_BROWSER_PATH=/path/to/headless_shell`.

## Credits

- **Structure and starter kit:** Damiano Caudullo's *Motion Graphics with Claude Code* starter kit (instagram.com/damianodesu). Its SFX are in `assets/sfx/`, and its OFL fonts are in `vendor/fonts/` with their licence.
- **Voice:** Kokoro-82M by hexgrad (Apache-2.0), run via `kokoro-onnx`.
- **Everything else** is drawn and synthesized in code.

## Putting it on the site

`<video src="…/soham-story-16x9.mp4" poster="…/poster.jpg" controls playsinline>`

This one is narrated, so give it controls or an unmute button rather than muted autoplay.
