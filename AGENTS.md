# Architecture rules
- Keep personal links in SITE and render footer social icons from their labels, so destinations have one source of truth.
- Use CSS hover/focus states for button fills, so transforms cannot retain a stale animated offset.
- Apply the custom cursor only to fine-pointer devices, preserving native touch and text-editing behavior.
- Keep the next-project thumbnail in a clipped preview area below its title, so hover reveals cannot cover the title or divider.
- Render the shared globe with D3 orthographic projection and bundled World Atlas land data, so real continents rotate without runtime network dependencies.
- Cursor-following labels (hover previews, the next-project ball) read the shared position in `src/lib/pointer.ts` and move with GSAP `quickTo`, never with CSS hover offsets.
- Videos play inside the shared laptop (`DeviceVideo`): muted and looping while visible, sound only after the viewer asks. Ship an MP4 (H.264) plus a WebM fallback.
