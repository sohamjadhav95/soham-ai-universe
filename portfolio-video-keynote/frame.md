---
version: 1
name: Keynote Launch — Frame
description: >
  A product-keynote stage for a person. Bright studio-white ground, graphite type, one cobalt accent,
  frosted glass cards with long soft shadows, and an extruded ceramic "SJ" monogram as the hero object.
  Calm, generous, unmistakably clear: one statement and one number per chapter.
unit: the frame — 1920×1080
principle: clarity first · one accent · numbers come from BRIEF.md → Facts

colors:
  paper: "#F6F6F3"      # stage — never pure white
  paper2: "#ECECE7"     # floor / secondary surface
  ink: "#111317"        # primary type
  ink2: "#454A52"       # secondary type (AA on paper at any size)
  mute: "#767B83"       # tertiary labels, >= 22px only
  accent: "#2747F5"     # cobalt — chapter labels, key numbers, focus
  accentSoft: "#E6EBFF" # tinted fills behind accent content
  glass: "rgba(255,255,255,0.72)"

typography:
  hero:      { fontFamily: "Geist", weight: 800, px: 168, lineHeight: 0.95, tracking: "-0.055em" }
  statement: { fontFamily: "Geist", weight: 700, px: 104, lineHeight: 1.0, tracking: "-0.045em" }
  numeral:   { fontFamily: "Geist", weight: 800, px: 300, lineHeight: 0.85, tracking: "-0.06em" }
  subline:   { fontFamily: "Geist", weight: 400, px: 38, lineHeight: 1.3, tracking: "-0.01em", color: "ink2" }
  chapter:   { fontFamily: "Geist Mono", weight: 500, px: 24, tracking: "0.18em", upper: true, color: "accent" }
  label:     { fontFamily: "Geist Mono", weight: 400, px: 22, tracking: "0.08em", upper: true, color: "mute" }
  card-title:{ fontFamily: "Geist", weight: 700, px: 40, tracking: "-0.03em" }
  card-stat: { fontFamily: "Geist", weight: 800, px: 72, tracking: "-0.05em", color: "accent" }

spacing:
  pad-edge: "120px"
  gap: "32px"
  radius-card: "28px"

components:
  glass-card:
    background: "{colors.glass} over a 1px inner white highlight"
    border: "1px solid rgba(17,19,23,0.08)"
    shadow: "0 40px 80px -20px rgba(17,19,23,0.18), 0 12px 24px -12px rgba(17,19,23,0.12)"
    radius: "{spacing.radius-card}"
  light-pool:
    background: "radial white bloom behind the focal element + a cobalt 6–10% tint at the floor"
  floor:
    background: "a soft horizon: paper → paper2 radial at the bottom third; contact shadows under 3D objects"
---

## Overview
Apple-keynote clarity, applied to a person. Each chapter opens with a cobalt mono **chapter label**
(RECOGNITION, BREAKTHROUGH, …) and then makes one **statement** in heavy Geist. The proof is a single large number or a
clean visual on glass cards. Motion is smooth and expensive: soft springs, slow dolly, depth of field.
It never slams.

## Composition Rules
- Statement is top-left; the visual or number sits on the right or below. Centered composition is used only for the open and the finale.
- One focal point at a time. Supporting text is no more than 8 words.
- Everything sits on a stage: soft floor gradient, contact shadows and light pools. Nothing floats in a void.

## Motion
- Entries use `expo.out` / `power3.out` over 0.5–0.8 s. Line reveals come up from a mask. Cards rise with a soft overshoot (`back.out(1.2)`).
- Camera moves use `power2.inOut` dollies of 2–4% scale or 60–120 px.
- Transitions between chapters: the outgoing scene eases out (−40 px, 6 px blur, fade) in its last 0.3 s, and the new one eases in. They are soft, never hard flashes.
- Ambient: a slow rotation on the 3D monogram, and light pools that breathe.

## Do / Don't
- Do: generous whitespace, real hierarchy, one cobalt accent, numbers as heroes.
- Don't: gradient text, purple, neon, pure #fff/#000, Inter / Poppins / Syne, everything centered, more than 8 words of support text.
