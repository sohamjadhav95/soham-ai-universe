---
version: 1
name: Heartbeat Signal — Frame
description: >
  Frame-scale design system for Soham Jadhav's 15s portfolio motion graphic. A lab instrument
  reading a human signal: deep tinted ink ground, a single phosphor signal-orange accent, teal
  instrument structure, cream type. Three typographic voices carry the piece's tension —
  machine (Archivo Black), instrument (IBM Plex Mono), human (Fraunces Italic).
unit: the frame — 1920×1080 primary; 1080×1920 later
principle: one accent · one signal · numbers come from the Facts list in BRIEF.md

colors:
  ink: "#07121A"          # ground — tinted toward teal, never pure black
  surface: "#0E2230"      # panels, cards, CT field
  cream: "#FFECD1"        # foreground type
  cream-dim: "#BFB29F"    # secondary type (passes AA on ink at ≥ 24px)
  signal: "#FF7D00"       # THE accent — beam, key numbers, "matters", "humanity"
  teal: "#15616D"         # instrument structure — graticule, rules, HUD brackets
  teal-bright: "#3E9AA6"  # HUD text on ink (AA at ≥ 22px)
  ember: "#78290F"        # glow falloff behind signal, never as a fill
  error: "#E5383B"        # only for the binary-snap error tag in the A3 beat

typography:
  display:      { fontFamily: "Archivo Black", weight: 400, px: 200, lineHeight: 0.9, tracking: "-0.04em", upper: true }
  headline:     { fontFamily: "Archivo Black", weight: 400, px: 120, lineHeight: 0.92, tracking: "-0.035em", upper: true }
  numeral-jumbo:{ fontFamily: "Archivo Black", weight: 400, px: 360, lineHeight: 0.82, tracking: "-0.05em" }
  numeral:      { fontFamily: "Archivo Black", weight: 400, px: 180, lineHeight: 0.85, tracking: "-0.04em" }
  human:        { fontFamily: "Fraunces", style: italic, weight: 400, px: 132, lineHeight: 1.0, tracking: "-0.02em" }
  human-sm:     { fontFamily: "Fraunces", style: italic, weight: 400, px: 64, lineHeight: 1.05 }
  kicker:       { fontFamily: "IBM Plex Mono", weight: 700, px: 24, tracking: "0.22em", upper: true, color: "signal" }
  label:        { fontFamily: "IBM Plex Mono", weight: 400, px: 28, tracking: "0.06em" }
  hud:          { fontFamily: "IBM Plex Mono", weight: 400, px: 22, tracking: "0.16em", upper: true, color: "teal-bright" }
  chip:         { fontFamily: "IBM Plex Mono", weight: 700, px: 26, tracking: "0.04em" }

spacing:
  pad-edge: "96px"      # safe area on all sides — no key text outside it
  pad-region: "64px"
  gap: "28px"
  hairline: "2px"       # video hairline (1px disappears under H.264)

components:
  beam:
    stroke: "{colors.signal}, 4px core + 18px blurred copy at 55% (screen blend)"
    description: "The oscilloscope trace. The single continuity device — every scene either shows the beam or is cut on its pulse."
  graticule:
    stroke: "{colors.teal} at 35%, 2px; major divisions every 120px, minor ticks every 24px"
  hud-bracket:
    stroke: "{colors.teal-bright}, 2px, 28px arms"
    description: "Corner brackets that frame a subject. Draw on with stroke-dashoffset."
  data-chip:
    background: "{colors.surface}"
    border: "2px solid {colors.teal}"
    radius: "4px"
    text: "chip"
    description: "Mono fact chips. Accent variant: border {colors.signal}, text {colors.signal}."
  glow:
    background: "radial {colors.signal} 18% → {colors.ember} 8% → transparent"
    description: "Localized behind the focal element. Never a full-frame linear gradient (bands under H.264)."
  grain:
    description: "Animated film grain, 10–14% opacity, overlay blend, on top of everything, always on."
  vignette:
    description: "Radial ink vignette, 55% at corners. Always on."
---

## Overview

The video is a lab instrument reading a human signal. The oscilloscope beam is the protagonist: it
draws the heartbeat that opens the piece, threads along the bottom of every proof beat, and returns
to underline Soham's name at the end. Everything else is instrument chrome (teal) or the human voice
(Fraunces, signal orange).

## The Frame

- Ground is always `ink`. Depth comes from: a localized `glow`, the `graticule`, ghost numerals at
  12–20% opacity, and the grain + vignette pass.
- Every frame has three layers: background (glow / graticule / ghost type), midground (the message),
  foreground (HUD brackets, mono labels, chips, the persistent beam rail).
- Hero type spans 60–80% of the frame width.

## Composition Rules

- Edge-anchored, zoned layouts: headline pinned top-left or bottom-left, data panel right, HUD in
  corners. Centered composition is allowed **once** — the mission beat — because it is the solemn one.
- Two focal points per frame; the eye travels from the number to its caption.
- Numbers are the readable unit in short beats. Captions ≤ 6 words.

## Typography Voices

- **Machine — Archivo Black**: statements and numbers. Uppercase, tight.
- **Instrument — IBM Plex Mono**: readouts, labels, chips, HUD. Never for statements.
- **Human — Fraunces Italic**: only "matters." and "for Good Faith of Humanity". Its rarity is the point.
- Never two sans-serifs. Extreme weight contrast (Archivo Black vs Plex Mono 400).

## Motion

- Entries `expo.out`, slams `back.out(1.6)`, camera `power4.inOut`, ambient `sine.inOut`. ≥ 3 eases and
  ≥ 2 directions per scene; never every element from `y: 30, opacity: 0`.
- Cuts land on the 120 BPM grid (0.5 s). Impacts get a 3-frame camera shake.
- Decoratives always breathe/drift. Nothing static for more than 0.5 s.

## Do / Don't

- Do: one accent hue; tint neutrals toward teal; let the beam carry continuity.
- Don't: gradient text, cyan/purple neon, identical card grids, full-frame linear gradients, pure
  #000/#fff, Inter / Poppins / Syne / Playfair, centered-everything layouts.
- Don't: show any number not in BRIEF.md's Facts. Never "3,157×".
