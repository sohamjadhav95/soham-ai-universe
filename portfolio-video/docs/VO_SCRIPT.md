# Voiceover Script — 15 s (optional layer)

The video is fully readable muted (website heroes autoplay without sound). The VO is a premium
layer: when `assets/audio/vo.wav` exists, it plays and the music bed is carved under it.

**Voice direction:** confident, warm, unhurried authority, about 140–150 wpm. Male or female; a calm
documentary narrator rather than a hype announcer. Leave a breath after "Who builds AI…".
Pronounce "sixty-three" clearly. No reverb on the dry file; the mix adds space.

| Cue (s) | Line | Words | On screen |
|---|---|---|---|
| 0.10 – 1.40 | "Who builds AI… matters." | 4 | WHO BUILDS AI / *matters.* |
| 1.70 – 2.90 | "I'm Soham Jadhav." | 3 | 3D name |
| 3.60 – 5.60 | "Solved sub-pixel error in heart CT." | 6 | A3 grid |
| 6.00 – 6.95 | "Sixty-three times faster." | 3 | 63× |
| 7.05 – 8.40 | "Shipped at Google Summer of Code." | 6 | Split-flap GSoC |
| 8.55 – 9.90 | "Multimodal moderation. Published." | 4 | < 3 s, stamp |
| 10.05 – 11.40 | "A copilot for data science." | 5 | pipeline |
| 11.60 – 13.40 | "Building AI for good faith of humanity." | 7 | mission |
| 13.70 – 14.50 | "Let's build." | 2 | end card |

Total: 40 words. Lines may run a little early or late; each one has to finish inside its scene.

## Recording / generating
- **ElevenLabs:** voice "Brian" or "Daniel" (or your own clone). Stability 0.45, Similarity 0.8, Style 0.15.
  Generate **one line per file** (`vo_01.wav` … `vo_09.wav`) so each can be placed on its cue, or a single take
  if you hit the timing.
- **Your own voice:** record in a quiet room, 48 kHz / 24-bit WAV, about 15 cm from the mic, one line per take.
- Drop the file(s) in `portfolio-video/assets/audio/`. I'll place, level-match and carve the bed under them.
