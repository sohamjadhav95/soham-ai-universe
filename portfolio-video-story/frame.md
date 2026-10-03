# frame.md: "Soham, the product" design system

## Palette
| Token | Hex | Use |
|---|---|---|
| canvas | `#F3F2EE` | The warm light stage. Never pure white. |
| card | `#FFFFFF` at 0.9 | UI cards, with a 1 px `rgba(20,21,24,0.08)` border and long soft shadows |
| ink | `#141518` | Primary type |
| ink2 | `#4A4F57` | Fragments and secondary type |
| mute | `#6E737B` | Mono labels, 22 px and up only |
| hot | `#FF5A1F` | **The single accent**: the mascot, hero pills, the italic accent word, and big numerals |
| hotDeep | `#D9400B` | Accent used as small text on light (AA) |
| hotSoft | `#FFE6DB` | Accent tint behind pills |
| villain | `#6E56CF` | The error and its "glitch" characters (the reference's purple fees monster) |
| bad | `#E5484D` | ✕ marks and wrong values, sparingly |
| good | `#2FB36B` | The "✓ Accurate" lie badge in the hook only |
| night | `#0F1013` | Dark chaos interlude (s03) and the meta beat (s11) |

## Type
- **Fragment voice.** Inter 400 at 50–56 px, ink2. These are the spoken words, appearing word by word on the voice.
- **Accent word.** Instrument Serif *italic* at 1.25× the fragment size, colour hot. One per line, the emotional word: *lying*, *snapped*, *gone*, *exactly*, *almost nothing*, *sixty-three*, *ninety*, *twice*, *actually*, *every single frame*.
- **Slam type.** Archivo Black, all caps, for the kinetic beats: LYING., WRONG., 63×.
- **UI and numbers.** Inter 700 with tight tracking (−0.04em). Labels are JetBrains Mono 400, uppercase, with 0.14em tracking.

## The mascot: "Pix"
A single pixel: a soft rounded square (hot orange, glossy highlight, contact shadow) with two eyes, brows and a mouth.

| Mood | When |
|---|---|
| neutral | Default |
| worried | Brows up and in, flat mouth |
| shock | Eyes wide, an "o" mouth |
| happy | ^ ^ eyes and a smile |
| proud | Smile and a little hop |

Pix gets **snapped** (split into a jagged staircase) in s02 and **rescued** (smooth again) in s04. After that Pix reappears as Soham's sidekick: waiting at the race, handing over the products, and giving the CTA wink.

## Layout
- The fragment caption sits in the top zone (around y 150–260), centred. The visual proof sits below it, centred or slightly offset.
- The dark interludes cut hard on the beat. Light scenes hand off with a quick rise and unblur, and exit with a lift and blur (0.25 s).
- Safe area: 96 px.

## Motion
- Words enter on their VO onset: rise 18 px with a 6 px unblur over 0.28 s (power3.out).
- Hits use `back.out(1.8)` pops, `expo.out` slams, and a 3-frame seek-safe shake (`HFKit.shake`).
- The ambient layer is always moving: drifting glossy spheres on the stage.

## Do / don't
- Do: one idea per beat, a number as the protagonist, and SFX on every hit.
- Don't: gradient text, neon, generic stock icons, or more than about 8 words of fragment on screen at once.
