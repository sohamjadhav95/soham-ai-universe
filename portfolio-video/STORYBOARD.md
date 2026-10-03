---
format: 1920x1080
duration: 15s
fps: 60
bpm: 120
message: "Soham Jadhav builds AI that reads the human signal — rigorously, and for good."
arc: Hook → Identity → Proof montage (5 works) → Promise → Invitation
audience: recruiters, research labs and founders hiring AI/ML engineers
mode: autonomous
---

<!--
Beat grid: 120 BPM → one beat = 0.5 s. Every scene boundary sits on the grid.
Global layers in index.html (whole 15 s): grain, vignette, a persistent HUD frame, and the
"beam rail" — a thin oscilloscope trace along the bottom edge that pulses lub-dub on every beat
(the continuity device). Facts must match BRIEF.md → Facts.
-->

## Frame 1 — Hook: the signal

- scene: An oscilloscope beam draws a heartbeat. "WHO BUILDS AI" slams in, then "matters."
- duration: 1.5s
- poster: 1.2s
- transition_in: cut
- status: animated
- voiceover: "Who builds AI… matters."
- src: compositions/frames/01-hook.html
- blueprint: kinetic-type-beats
- rules: svg-path-draw, kinetic-beat-slam, ambient-glow-bloom
- registry: oscilloscope-trace (re-skinned: ECG waveform, signal orange on teal graticule)

Cold open on the instrument. The beam sweeps left→right and spikes twice (lub-dub at 0.5 s and 1.0 s).
"WHO BUILDS AI" lands top-left on the first spike (Archivo Black, back.out slam). "matters." (Fraunces
Italic, signal) lands bottom-right on the second spike. A HUD readout reads `CH1 · 120 BPM · REC ●`.

## Frame 2 — Identity

- scene: Beveled 3D letters "SOHAM JADHAV" flip up; HUD readouts tick in.
- duration: 2s
- poster: 1.6s
- transition_in: cut
- status: animated
- voiceover: "I'm Soham Jadhav."
- src: compositions/frames/02-identity.html
- blueprint: logo-assemble-lockup
- rules: ai-tracking-box, svg-path-draw, discrete-text-sequence
- registry: extruded-logo (Archivo Black typeface JSON, matte cream with signal rim light)

The beam flatlines into a baseline that the 3D name stands on. Its letters flip up one by one and
the light runs across the bevels. HUD brackets draw around the name, and three mono readouts tick
in on the right: `AI ENGINEER`, `RESEARCHER`, `GSoC '26 @ ML4SCI`.

## Frame 3 — Proof 1 (hero): solved the sub-pixel problem

- scene: Macro pixel grid. Binary snap shows +10.19% error; soft coverage fixes it to 0.03%.
- duration: 2.5s
- poster: 2.1s
- transition_in: cut
- status: animated
- voiceover: "Solved sub-pixel error in heart CT."
- src: compositions/frames/03-a3-subpixel.html
- blueprint: comparison-split
- rules: coordinate-target-zoom, counting-dynamic-scale, chromatic-glitch, stat-bars-and-fills
- registry: none — custom deterministic canvas (exact Sutherland–Hodgman coverage)

Kicker `A3 · SOFT COVERAGE`, headline **SOLVED THE SUB-PIXEL PROBLEM** (top-left). Right: a 14×9 pixel
grid, macro push-in, with a radiologist's smooth outline (signal-orange vector).
① 0.3 s: the binary snap. Teal blocks pop on jaggedly, and a red `+10.19% AREA ERROR` tag glitches.
② 1.0 s: the coverage pass. Each pixel re-fills to its true fraction, and boundary cells show
mono values (0.13 · 0.57 · 0.92).
③ 1.6 s: the error counter rolls 10.19% → 0.03%, and the chips pop: `AGATSTON ERROR 2.2× LOWER` ·
`RISK AGREEMENT 77 → 83%`.

## Frame 4 — Proof 2: 63×

- scene: CT slice with segmentation masks flooding on; "63×" slams.
- duration: 1s
- poster: 0.8s
- transition_in: cut
- status: animated
- voiceover: "Sixty-three times faster."
- src: compositions/frames/04-speed.html
- blueprint: dataviz-countup
- rules: kinetic-beat-slam, counting-dynamic-scale, ai-tracking-box
- registry: segmentation-flood (masks over a procedural CT slice), camera-shake, beat-accent

A hard cut on the beat. Left: a procedural axial CT slice (seeded noise rings, no patient data) with
quantized mask flood and `CAC` label chips. Right, huge: **63×** (a tick-roll from 1×, slam at 0.45 s),
with `FASTER THAN TOTALSEGMENTATOR` in mono below it.

## Frame 5 — Proof 3: PrediCT Studio at GSoC

- scene: Split-flap "GOOGLE SUMMER OF CODE 2026"; a workstation UI tilts in behind it.
- duration: 1.5s
- poster: 1.2s
- transition_in: cut
- status: animated
- voiceover: "Shipped at Google Summer of Code."
- src: compositions/frames/05-predict-studio.html
- blueprint: device-surface-showcase
- rules: split-tilt-cards, depth-of-field-blur
- registry: split-flap-board (re-skinned), ui-3d-reveal pattern

A Solari board cascades to `GOOGLE SUMMER OF CODE 2026 · ML4SCI`. Behind it, a code-drawn PrediCT
Studio workstation (panels: ARGUMENT · INSTRUMENT · CONTACT SHEET · ANATOMY) tilts into perspective with
depth-of-field. Caption: "PrediCT Studio — *auditable* clinical AI".

## Frame 6 — Proof 4: Convo-Ease

- scene: TEXT / IMAGE / AUDIO cards orbit a core and snap in; "< 3 s" lands; published stamp.
- duration: 1.5s
- poster: 1.2s
- transition_in: cut
- status: animated
- voiceover: "Multimodal moderation. Published."
- src: compositions/frames/06-convo-ease.html
- blueprint: constellation-hub
- rules: orbit-3d-entry, spring-pop-entrance, kinetic-beat-slam
- registry: three-orbiting-cards (Three.js)

Three cards orbit a glowing core in real 3D, then snap inward on the beat. **< 3 s** slams in
(bottom-left). Chips: `+8.3 PP VS GENERIC SAFETY · p = 0.004`. A stamp: `PUBLISHED · SPRINGER NATURE`.

## Frame 7 — Proof 5: Copilot for Data Science

- scene: A prompt types, explodes into a pipeline; version rolls v1.0 → v4.9.
- duration: 1.5s
- poster: 1.2s
- transition_in: cut
- status: animated
- voiceover: "A copilot for data science."
- src: compositions/frames/07-copilot.html
- blueprint: prompt-type-submit-generate
- rules: discrete-text-sequence, depth-scatter-assemble, vertical-spring-ticker
- registry: none — custom (typed prompt + pipeline nodes)

`> predict churn from sales.csv` types in, and submit fires. The line explodes into a pipeline of
nodes (CLEAN → FEATURES → AUTOML → XAI → RAG) with connectors drawing. A slot reel rolls
`v1.0 → v4.9`. Caption: `~90% OF THE WORKFLOW, AUTOMATED`. It exits through a lens-warp toward the mission.

## Frame 8 — Promise

- scene: A glass object turns in front of a giant "BUILDING AI"; "for Good Faith of Humanity" rises.
- duration: 2s
- poster: 1.7s
- transition_in: cut
- status: animated
- voiceover: "Building AI for good faith of humanity."
- src: compositions/frames/08-mission.html
- blueprint: titlecard-reveal
- rules: ambient-glow-bloom, spring-pop-entrance
- registry: glass-hero (re-skinned: Archivo Black headline, signal glow)

The one centered, solemn beat. "BUILDING AI" (Archivo Black, cream) fills the frame. A glass orb
rises and turns in front of it, so the letters bend and split through the glass. Then *for Good Faith
of Humanity* (Fraunces Italic, signal) rises word by word beneath it, and a light sweep crosses.

## Frame 9 — Invitation

- scene: The beam returns as a calm pulse under the name; contact lockup.
- duration: 1.5s
- poster: 1.3s
- transition_in: cut
- status: animated
- voiceover: "Let's build."
- src: compositions/frames/09-endcard.html
- blueprint: logo-assemble-lockup
- rules: svg-path-draw, spring-pop-entrance
- registry: cta-lockup pattern

The callback: the beam draws one last, slower heartbeat and settles into the underline of **SOHAM JADHAV**.
Below that: `GSoC '26 · 2 PAPERS · 6+ SHIPPED`, then `Open to AI/ML roles & research`, then
`github.com/sohamjadhav95 · soham.ai.engineer@gmail.com`. The last 0.5 s holds clean so it can loop.
