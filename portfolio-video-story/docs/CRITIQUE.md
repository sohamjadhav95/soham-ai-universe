# Critique log: "Soham, the product"

The rubric comes from `DIRECTOR.md` and is scored 1–10. Each pass reviews snapshot contact sheets at the word-keyed beats, plus `npx hyperframes check`.

## Pass 0: voice and timing
| Finding | Fix |
|---|---|
| The first VO render ran 60 s, against a target of about 48 s and the reference's 53 s. | Speed 1.08 → 1.14, tighter gaps, and a 16th-note start grid. Four lines were trimmed without changing any facts. Final length: **52.5 s**. |
| Kokoro said "SO-ham JAD-hav". | Phoneme override → "SO-hum JAA-dhuv" (`sˈoʊhəm dʒˈɑːdəv`). |
| Whisper is blocked here, so there was no forced alignment for word timing. | Each line renders sentence by sentence, so sentence onsets (*Exactly.*, *Twice.*, *Every single frame.*) are exact. Comma pauses are matched to voiced segments (15/18 lines), with phoneme-weighted spacing inside each chunk. |

## Pass 1: scenes 1–6
| # | Criterion | Score | Notes |
|---|---|---|---|
| 1 | Story | 8 | Pain → stakes → reveal → proof reads with the sound off. |
| 2 | VO sync | 9 | Fragments rise on their words. The LYING cut lands on "lying". |
| 3 | Punch | 8 | Slam, snap, count and shatter, with a sound under every hit. |
| 4 | Appeal | 7 | The s03 dark interlude rendered light, so WRONG was invisible. The s06 name was missing. |
| 5 | Clarity | 7 | Pix crowded the s05 caption. |
| 6 | Polish | 8 | |
| 7 | Accuracy | 9 | Two s03 cards read like invented cases ("Moderate → Low"). |

**Fixes**

| Finding | Fix |
|---|---|
| s03 background was 0×0. Children of the `.clip` stage don't get a box from `inset: 0`. | Full-frame backgrounds now use explicit 1920×1080. |
| s06 name missing. The inner `#s06-name` collided with the scene's own mount id. | Renamed to `#s06-word`. No inner id reuses a scene id. |
| Pix overlapped the s05 caption and the bar values. | Moved to the card's right edge. Card trimmed. |
| s03 cards implied specific cases. | Rewritten to the Facts only: "2.2× higher", "77% agreement", "misclassified", "off by whole pixels". |

## Pass 2: scenes 7–12
| Finding | Fix |
|---|---|
| "Fewerguesses." and "SohamJadhav": the space between inline-block words inherited the parent's 16 px font. | Moved the type size onto the parent. |
| s08 dock names overlapped ("Tennis PredictorRenAIssance OCR"). | Tile pitch 210 → 250 px. |
| The s08 Copilot caption ran off the frame. | That caption now wraps to two lines at 52 px. |
| s09 GDG dots collided with "ON CAMPUS". | Moved to the year row. |
| s11 "Every single frame." competed with the frame wall. | Stronger scrim plus a text shadow. |
| Contrast: s04 state label at 4.48:1 and the ×2 sticker. | Darker label (`#b8370a`). The sticker text is now ink on orange. |

**After pass 2:** `npx hyperframes check` passes. Lint, runtime, layout and motion all report 0 errors and 0 warnings; the remaining notes are info-level about intentional layering. Contrast passes with no AA failures.

| # | Criterion | Score |
|---|---|---|
| 1 | Story | 9 |
| 2 | VO sync | 9 |
| 3 | Punch | 9 |
| 4 | Appeal | 9 |
| 5 | Clarity | 9 |
| 6 | Polish | 8 |
| 7 | Accuracy | 10 |

## Audio
- −16.0 LUFS integrated, sample peak −1.2 dBFS.
- The voice sits **10.5 dB above the music** while it is speaking: the music is ducked about 7 dB under the VO envelope.
- All three stems share one limiter gain, so they sum exactly as previewed.

## Snapshots (`docs/critique-snapshots/`)
| Folder | What's in it |
|---|---|
| `pass0-hook/` | The first scene on its own, used to validate the kit, captions, fonts and the LYING cut |
| `pass1-scenes-1-6/` | Scenes 1–6 before the fixes: the light s03 and the missing s06 name |
| `pass1-fixes/` | The same beats after the fixes |
| `pass2-scenes-7-12/` | Scenes 7–12 before the fixes: missing word spaces, dock overlap, caption overflow |
| `pass2-fixes/` | After the fixes |
| `render-cues/` | Frames from the final MP4 at word cues (picture and sound lock) |

PNG frames are stored as JPG. To regenerate, run `npm run snapshot`, which writes to `out/snapshots/`.

## Render verification (`renders/soham-story-16x9.mp4`)
- **`ffprobe`:**
  - **52.500 s**, 3150 frames at 60 fps, 1920×1080
  - H.264 High, yuv420p, CRF 16, faststart
  - AAC-LC 48 kHz stereo
  - 18.4 MB
- **Loudness:**
  - The final MP4 measures **−16.7 LUFS** integrated, with a −1.5 dBFS true peak.
  - The stems mix to −16.0 LUFS in the preview; the renderer's track mix lands about 0.7 dB lower.
- **Picture/sound lock:**
  - The rendered audio cross-correlates with the synth's own mix at **0.0 ms lag** (correlation 0.999).
  - Frames grabbed just after 12 key words show the matching beat: LYING, snapped, +10.19%, WRONG, Exactly., 0.03%, 63×, < 3 s, ~90%, ×2, frame., Let's build. (`render-cues/`)
- **Fact gate:**
  - Every on-screen number is from BRIEF.md → Facts: 10.19%, 0.03%, 2.2×, 77% → 83%, 63×, < 3 s, ~90%.
  - "3,157" appears only in BRIEF.md's prohibition and in this log.
