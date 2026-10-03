# Critique Log — "Keynote"

The rubric comes from `DIRECTOR.md` and is scored 1–10. Each pass reviews snapshot contact sheets taken at chapter midpoints and transitions, along with `npx hyperframes check` (lint, runtime, layout, motion, WCAG contrast).

## Pass 0: intro alone (stage + chapter 1)
| Finding | Fix |
|---|---|
| The 3D monogram sat on top of "Introducing". | Camera re-aimed (look-at y 1.05) and rise path lowered, so the monogram clears the type with a contact shadow between them. |
| The cobalt "J" rendered lavender under ACES tone mapping. | Switched to `NeutralToneMapping` at exposure 0.95 and a deeper base colour (`#1f3ce6`). |

## Pass 1: first full 30 s assembly
| # | Criterion | Score | Notes |
|---|---|---|---|
| 1 | Clarity | 7 | Every chapter makes one claim. Two exceptions: the intro role line was fully visible for only ~0.4 s, and the mission line ("Building AI for Good Faith of Humanity.") was complete for only ~0.1 s before the end card. **Fixed below.** |
| 2 | Appeal | 8 | Paper stage, glass cards with long soft shadows, ceramic 3D monogram and cover-flow: it reads as a launch event, not a template. |
| 3 | Completeness | 9 | Every Facts row is on screen: GSoC/ML4Sci, A3 (10.19 → 0.03%, 2.2×, 77 → 83%), 63×, both papers, 5 products, GDG + pgmpy + pyaptamer, 9 certifications + degree, mission, contacts. |
| 4 | Hierarchy | 8 | Chapter label → statement → proof holds in every chapter. Numbers are the largest element in their frames. |
| 5 | Rhythm | 8 | Cuts sit on the 120 BPM grid, the lift lands at 15.0 s (Products) and the resolve at 25.5 s (mission). |
| 6 | Polish | 7 | `check` reported 3 layout errors: the GSoC card label against "2026", and the SPEED and FOUNDATION labels against the giant numerals. |
| 7 | Accuracy | 10 | Every number traces to BRIEF.md → Facts. Speed is **63× faster than TotalSegmentator**. No "3,157" anywhere. |

**Fixes**
| Finding | Fix |
|---|---|
| Intro role line read for ~0.4 s. | Name reveal 1.2 → 1.0 s, roles 1.75 → 1.4 s (now ~1.0 s of full hold before the cut). The audio `title` cue moved with it. |
| Mission line barely complete before the end card. | Words now stagger 0.14 s from 0.25 s and the line holds fully until 27.7 s (~1.1 s complete, 2 s readable). The end card starts at 27.95 s. Mission ticks, end-card chime and glint were re-cued in `synth_audio.py`. |
| The end card was top-left heavy, leaving the right half of the frame empty. | Rebuilt it as a centered keynote lockup: app-icon tile → name (136 px) → role → availability → three link pills. |
| GSoC label overlapped the "2026" text box. | Label raised 14 px and the year lowered 10 px. |
| SPEED / FOUNDATION / A3 labels flagged against giant numerals. | Ink is 40+ px clear. The overlap is only the font's ascent box, so the numerals carry `data-layout-allow-overlap`. |
| Off-screen product cards flagged as overflowing the canvas. | Intentional (cover-flow), so the cards are marked `data-layout-allow-overflow`. |

## Pass 2: retimed intro, mission hold, centered end card
| Frame | Check |
|---|---|
| 1.6 s / 2.4 s | Name and role line are both fully legible by 1.6 s. |
| 27.0 s / 27.6 s | "Building AI for / Good Faith of Humanity." is complete and centered. Cobalt second line. |
| 28.2 s → 29.95 s | Centered end card builds icon → name → role → availability → links and holds clean. |

**After pass 2:** `npx hyperframes check` passes. Lint has 0 findings, runtime has 0 errors (SwiftShader perf notes only), layout has 0 errors and 0 warnings, motion has 0 findings, and contrast is **29/29 WCAG AA**.

| # | Criterion | Score |
|---|---|---|
| 1 | Clarity | 9 |
| 2 | Appeal | 9 |
| 3 | Completeness | 9 |
| 4 | Hierarchy | 9 |
| 5 | Rhythm | 9 |
| 6 | Polish | 8 |
| 7 | Accuracy | 10 |
