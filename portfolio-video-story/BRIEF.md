---
workflow: general-video
flow: automation
storyboard: yes
message: "Your AI model is lying to you. Soham Jadhav is the engineer who finds the error everyone else ships, and fixes it."
destination: website-hero, LinkedIn, YouTube
aspect: 1920x1080
language: en
audience: "recruiters, research labs and founders hiring AI/ML engineers"
length: 52.5s (voiceover-driven)
angle: narrated product ad; Soham is the product
---

## Intent

This is the third portfolio film. It sits beside "Heartbeat Signal" (15 s) and "Keynote" (30 s), and works differently from both: **a narrated story ad**. The voiceover is the spine, and every spoken phrase gets its own visual beat.

The structure follows the reference reel Soham shared (Damiano Caudullo's "Tally" ad, made with his HyperFrames starter kit):

1. **Pain with a number.** "Your AI model says it's accurate. It's *lying* to you."
2. **Agitation.** What goes wrong, and what it costs.
3. **The reveal.** Soham is the fix.
4. **Features as micro-stories.**
5. **Payoff.**
6. **Meta twist.** "Built in code, with AI. Every single frame."
7. **CTA.**

It stays professional and punchy. The playful elements are a pixel mascot (a nod to his sub-pixel work) and an italic accent word in every line.

**Voice:** Kokoro-82M (open source, Apache-2.0), voice **af_heart** (warm US female). Soham picked it by ear from a six-voice sample pack. Two settings were overridden:
- **Speed:** 1.14.
- **Name pronunciation:** the phonemes are fixed to "SO-hum JAA-dhuv".

Closing line on screen, verbatim: **"Building AI for Good Faith of Humanity"**.

## Facts (the only claims allowed on screen or in the VO)

| Topic | Claim | Source |
|---|---|---|
| Breakthrough | A3 soft coverage solves the sub-pixel problem. **Label area error 10.19% → 0.03%**, **Agatston error 2.2× lower**, **risk agreement 77% → 83%**. Binary masks snap outlines to whole pixels (`cv2.fillPoly`). | predict repo, `soham_segmentation` branch |
| Recognition | Selected for **Google Summer of Code 2026**, contributor at **ML4Sci** (PREDICT1) | `src/data/experience.ts` |
| Speed | **63× faster than TotalSegmentator** (CAC inference) | Soham (confirmed) |
| Products | **Convo-Ease**: text + image + audio moderation in **< 3 s**. **Copilot for Data Science**: **~90%** of the data-science workflow automated. Also Tennis Match Predictor (77%), RenAIssance OCR and NexaOS Flow. | `Index.tsx` PROJECTS, repos |
| Research | **2 peer-reviewed papers**: *Convo-Ease* (Cureus · Springer Nature · 2025) and *Beyond Text* (ICIA · 2025) | `Index.tsx` PAPERS |
| Community | **GDG On Campus AI & ML Co-Lead** (2024–25) | `experience.ts` |
| Finale | "Building AI for Good Faith of Humanity" · github.com/sohamjadhav95 · soham.ai.engineer@gmail.com · linkedin.com/in/sohamjadhav95 | Soham |

**Never show "3,157×".** No other numbers are allowed beyond this table.

The hook's "✓ Accurate" badge is a generic model readout, not a claim about any real model.

## Customizations

- **Timing:** the voiceover comes first. `scripts/make_vo.py` renders it, places the lines on a 120 BPM sixteenth-note grid, and writes the scene timing and the word cues in `lib/cues.js`. To use your own recorded lines, see the README.
- **Sound:** a light pulsing bed carved under the VO, plus the starter kit's code-made SFX (pop, tick, counter, snap, chime, success, switch, star, fill) and a few synthesized hits.
- **Format:** 60 fps, 1920×1080.

## Notes

- Same sandbox constraints as the other films: vendored GSAP and fonts, and `HYPERFRAMES_BROWSER_PATH` pointing at the local headless shell.
- The fonts come from the starter kit (SIL OFL 1.1): Inter, Instrument Serif (plus italic), Archivo Black and JetBrains Mono.
