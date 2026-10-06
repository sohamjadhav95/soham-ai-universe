# Architecture rules
- Keep personal links in SITE and render footer social icons from their labels, so destinations have one source of truth.
- Use CSS hover/focus states for button fills, so transforms cannot retain a stale animated offset.
- Apply the custom cursor only to fine-pointer devices, preserving native touch and text-editing behavior.
- Keep the next-project thumbnail in a clipped preview area below its title, so hover reveals cannot cover the title or divider.
- Render the shared globe with D3 orthographic projection and bundled World Atlas land data, so real continents rotate without runtime network dependencies.