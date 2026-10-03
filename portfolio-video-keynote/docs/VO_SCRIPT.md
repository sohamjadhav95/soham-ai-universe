# Voiceover Script — 30 s "Keynote" (optional layer)

The film reads fully with the sound off, since website heroes autoplay muted. The VO is an optional premium
layer. When `assets/audio/vo.wav` exists, it plays and the score is carved underneath it.

**Voice direction:** a keynote presenter, not a hype announcer. Warm and assured, unhurried, about 140 wpm,
third person. Smile slightly on "Introducing". Pause briefly before "Twice". Say "sixty-three" crisply.
Let "good faith of humanity" land slowly. Deliver the file dry; the mix adds the room.

| Cue (s) | Line | Words | On screen |
|---|---|---|---|
| 0.40 – 2.60 | "Introducing… Soham Jadhav." | 3 | 3D monogram, name |
| 3.10 – 5.30 | "Selected for Google Summer of Code, twenty twenty-six." | 8 | GSoC 2026 badge |
| 5.60 – 9.30 | "He solved the sub-pixel problem in cardiac CT. Label error: nearly zero." | 12 | A3 coverage grid, 10.19% → 0.03% |
| 9.60 – 11.80 | "Sixty-three times faster than TotalSegmentator." | 6 | 63× + inference race |
| 12.10 – 14.80 | "Two peer-reviewed papers. Published… twice." | 6 | Paper cards |
| 15.10 – 19.30 | "Five products, built to be used — from moderation to voice." | 10 | Product cover-flow |
| 19.60 – 22.30 | "He leads, mentors, and contributes to open source." | 8 | GDG Co-Lead, pgmpy, pyaptamer |
| 22.60 – 25.30 | "Nine certifications. One solid foundation." | 5 | 9 certifications, degree |
| 25.70 – 27.70 | "Building AI for good faith of humanity." | 7 | Mission |
| 28.10 – 29.60 | "Soham Jadhav. Let's build." | 4 | End card |

Total: 69 words. Each line must finish inside its chapter. Lines may start a little early, but none may cross a cut.

## Recording / generating
- **ElevenLabs:** a narrator voice such as "Brian", "Daniel" or "Charlotte" (or your own clone). Stability 0.5,
  Similarity 0.8, Style 0.1. Generate **one line per file** (`vo_01.wav` … `vo_10.wav`) so each can sit on its cue.
- **Your own voice:** record in a quiet room, 48 kHz / 24-bit WAV, about 15 cm from the mic, one line per take.
- Put the file(s) in `portfolio-video-keynote/assets/audio/`. They then get placed, level-matched and carved under
  the score with `/hyperframes-audio`.
