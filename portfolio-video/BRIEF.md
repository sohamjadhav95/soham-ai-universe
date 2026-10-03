---
workflow: general-video
flow: automation
storyboard: yes
message: "Soham Jadhav builds AI that reads the human signal — rigorously, and for good."
destination: website-hero
aspect: 1920x1080
language: en
audience: "recruiters, research labs and founders hiring AI/ML engineers"
length: 15s
angle: portfolio-sizzle
---

## Intent

A 15-second, ad-quality motion graphic that showcases Soham Jadhav, an AI engineer and researcher. It is a
portfolio sizzle reel to be used as the hero video on his site and as a social clip. It should feel
like this week's best Opus-made launch films: real 3D, beat-synced sound, designed and not generic.
It should not feel like a template. Concept: **Heartbeat Signal**. A lab oscilloscope beam draws a
heartbeat, and that one signal threads through his work: coronary-artery CT, multimodal moderation,
data-science agents. It ends on his promise.

Closing line, verbatim from Soham: **"Building AI for Good Faith of Humanity"**.

## Facts (the only numbers allowed on screen)

| Work | Fact | Source |
|---|---|---|
| PrediCT, A3 soft coverage | Solves the sub-pixel boundary problem: label area error 10.19% → 0.03% | `predict` repo, `soham_segmentation` branch |
| PrediCT, A3 | Agatston error 2.2× lower (median 42.97 → 19.27) | same |
| PrediCT, A3 | 6-tier risk agreement 77.3% → 83.3% | same |
| PrediCT | 63× faster than TotalSegmentator (CAC inference) | Soham (confirmed) |
| PrediCT Studio | Auditable clinical workstation: "the evidence behind every number"; GSoC 2026 @ ML4Sci | `predict_software` branch |
| Convo-Ease | Text + image + audio moderation, < 3 s; +8.3 pp accuracy vs generic safety (p = 0.004); published in Cureus (Springer Nature) | `convo-ease` repo, portfolio |
| Copilot for Data Science | Natural language → ML pipelines; v1.0 → v4.9 over 4 phases; ~90% of the workflow automated | `copilot-for-data-science` repo, portfolio |
| Overall | GSoC 2026 · 2 papers (Springer Nature, ICIA) · 6+ projects shipped | portfolio |

**Never show "3,157×".** That figure on the current site is wrong.

## Assets

- None from Soham yet. Optional upgrades are listed in `docs/ASSET_PROMPTS.md`: a headshot, screen recordings, AI plates, and a reference video.
- Slot: `assets/audio/vo.wav`, the voiceover recorded from `docs/VO_SCRIPT.md`. When it's present, the bed is carved under it.

## Customizations

- The A3 coverage values are computed for real, using Sutherland–Hodgman polygon/pixel clipping in JS.
- The audio bed's kick drum is a synthesized "lub-dub" heartbeat at 120 BPM. All SFX are synthesized and no samples are used.
- Delivery targets 60 fps. The smoke test measured about 0.75 s per frame on a software GPU, which is feasible.

## Notes

- **Sandbox:** jsDelivr, HuggingFace and HeyGen are unreachable. GSAP, Three.js and Fraunces are vendored under `vendor/`, and `node scripts/vendor.mjs` runs after every `hyperframes add`. Render with `HYPERFRAMES_BROWSER_PATH` set to a local chrome-headless-shell.
- **Avoid:** WebGPU blocks and HTML-in-canvas blocks (Chrome 141 here).
- **Look:** must not use cyan-on-dark, purple gradients, centered-everything layouts, or the banned fonts. See `frame.md`.
