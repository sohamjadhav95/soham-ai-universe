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
