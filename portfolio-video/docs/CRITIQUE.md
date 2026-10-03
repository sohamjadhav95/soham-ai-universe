# Critique Log

Rubric is from `DIRECTOR.md`, scored 1–10. Each pass reviews a snapshot contact sheet of scene midpoints and impacts, plus `npx hyperframes check`.

## Pass 1: first full assembly
| # | Criterion | Score | Notes |
|---|---|---|---|
| 1 | Hook | 9 | Instrument + heartbeat + question within 1 s. The camera push carried the headline past the 96 px safe line. **Fixed:** push 1.045 → 1.03, origin moved left. |
| 2 | Anti-generic | 8 | Edge-anchored layouts, three type voices, no gradient text or neon. |
| 3 | Readability | 7 | `check`: contrast at 4.0–4.3:1 on teal HUD text. **Fixed:** teal-bright `#2A8E9C` → `#3E9AA6`; state caption red brightened. Two overlaps were fixed: the A3 label against its number, and the 63× kicker against the scaled number. |
| 4 | Depth | 8 | Glow + graticule + ghost numerals behind, message in the middle, HUD and beam rail in front. |
| 5 | Beat sync | 8 | The Convo-Ease stamp landed 0.14 s after its thud. **Fixed:** re-timed to 1.10 s. |
| 6 | Polish | 7 | The keyframe-based shakes weren't reliably seek-safe. **Fixed:** replaced with `HFKit.shake` (a pure function of time). |
| 7 | Continuity | 9 | The beam carries hook → baseline → rail → end-card underline. |
| 8 | Accuracy | 10 | Every number traces to BRIEF.md → Facts. No "3,157". |

## Pass 2: transitional moments + weak beats
| Finding | Fix |
|---|---|
| Convo-Ease cards flew in across the title (8.75 s). | Cards now arrive from depth (z −1400 → orbit) and never cross the title. |
| The mission glass was barely visible. | Lens scale 0.76 → 0.96, IOR 1.32 → 1.5, thickness 0.65 → 1.1, dispersion 1.1, stronger warm env strip, and the path now centers over "DIN". |
| The end-card heartbeat was squished against the right edge (ease-out sweep). | Linear timebase. The beat lands at about 79% across, clear of the name. |
| The 63× CT slice read as flat shapes. | Soft radial tissue, ribs, chamber, 1.5 px blur and seeded noise. |
| `check` false positive: the vignette `<div>` and full-frame rail canvas counted as opaque covers. | Vignette painted on a canvas at 0.59 opacity (same look); rail canvas cropped to the bottom 90 px strip. |

**After pass 2:** `npx hyperframes check` passes. Lint has 0 findings, runtime has 0 errors (4 SwiftShader perf notes), layout has 0 errors, motion has 0 findings, and contrast passes **97/97 WCAG AA**.

| # | Criterion | Score |
|---|---|---|
| 1 | Hook | 9 |
| 2 | Anti-generic | 9 |
| 3 | Readability | 8 |
| 4 | Depth | 9 |
| 5 | Beat sync | 8 (verified on the rendered file; see below) |
| 6 | Polish | 8 |
| 7 | Continuity | 9 |
| 8 | Accuracy | 10 |

## Render verification (v1)
- **Master:** `hyperframes render --quality looks --fps 60 --workers 3` took 6 m 43 s (beginframe capture, SwiftShader).
  The output is 15.000 s, 1920×1080, 60 fps, H.264 + AAC 48 kHz stereo.
- **Web encode:** `renders/soham-portfolio-16x9.mp4`, two-pass x264 at 7.4 Mbps, +faststart, 14.1 MB, 900 frames.
  Against the master, PSNR is 34.2 dB (the SSIM gap is mostly the per-frame random grain). 1:1 crops of 17–30 px text stay crisp.
- **Loudness:** −16.0 LUFS integrated, LRA 1.4 LU, peak −3.0 dBFS.
- **Picture/sound lock:**

  | | Times (s) |
  |---|---|
  | Visual cuts (ffmpeg `scdet`) | 0.500 · 1.000 · 1.500 · 3.500 · 6.000 · 6.467 · 7.000 · 7.917 · 8.500 · 9.600 · 10.000 · 10.917 · 11.500 · 13.500 |
  | Audio onsets on hard hits | 0.500 · 1.000 · 3.500 · 6.000 · 6.450 · 7.000 · 8.500 · 9.250 · 9.600 · 14.250 |

  The audio onsets land within 0 ms of the cue table. Soft-attack sounds measure ±25–60 ms.
- **Fact gate:** no composition, script or kit file contains "3,157". The only mentions are docs rules forbidding it.

## Snapshots (`docs/critique-snapshots/`)
These are the frames each pass was judged on. PNG frames are stored as JPG.

| Folder | What's in it |
|---|---|
| `scenes/01-hook`, `02-identity`, `03-a3-subpixel` | Scene-by-scene build checks of the hook, the 3D name and the A3 coverage grid, made while those scenes were being built |
| `pass1/` | First full 15 s assembly: 16 frames at scene midpoints and impacts, plus contact sheets |
| `pass2-b/`, `pass2-c/` | Pass 2 re-shoots of the transitional moments and weak beats: the Convo-Ease orbit, the mission lens, the end-card heartbeat and the CT slice |
| `final-render-sheet.jpg` | Contact sheet of frames pulled from the final MP4 |

Regenerate fresh snapshots with `npm run snapshot` (they go to `out/snapshots/`).
