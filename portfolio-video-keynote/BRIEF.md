---
workflow: general-video
flow: automation
storyboard: yes
message: "Introducing Soham Jadhav: an AI engineer with research, speed, products, leadership and craft to show for it."
destination: website-hero
aspect: 1920x1080
language: en
audience: "recruiters, research labs and founders hiring AI/ML engineers"
length: 30s
angle: keynote-launch
---

## Intent

A 30-second portfolio film presented like a product keynote: "Introducing Soham Jadhav." It sits beside the
15 s "Heartbeat Signal" film and is deliberately the opposite: light, clean, calm and premium. It is
**clear first**: one chapter per achievement, one statement per chapter, the number large and the caption short.
Every achievement Soham has is shown, not only the GSoC work.

Theme: **Keynote Launch**, a bright studio-white stage with soft shadows, frosted glass cards, an extruded
ceramic "SJ" monogram, and a single cobalt accent.

Closing line, verbatim: **"Building AI for Good Faith of Humanity"**.

## Facts (the only claims allowed on screen)

| Chapter | Claim | Source |
|---|---|---|
| Recognition | Selected for **Google Summer of Code 2026**, contributor at **ML4Sci** (PREDICT1), working with international mentors | `src/data/experience.ts`, predict repo |
| Breakthrough | A3 soft coverage solves the sub-pixel problem: label area error **10.19% → 0.03%** · Agatston error **2.2× lower** · risk agreement **77% → 83%** | predict repo, `soham_segmentation` branch |
| Speed | **63× faster than TotalSegmentator** (CAC inference) | Soham (confirmed) |
| Research | **2 peer-reviewed papers**: *Convo-Ease* (Cureus · Springer Nature · 2025) and *Beyond Text*, a survey of **26+** moderation methods (ICIA · 2025) | `src/pages/Index.tsx` PAPERS |
| Products | **Convo-Ease**: text + image + audio moderation in **< 3 s** · **Copilot for Data Science**: **~90%** of the workflow automated · **Tennis Match Predictor**: **77%** accuracy (XGBoost + LightGBM) · **RenAIssance OCR**: historical Spanish handwriting (ResNet-18 + BiLSTM + CTC) · **NexaOS Flow**: voice → OS commands | `Index.tsx` PROJECTS, repos |
| Community | **GDG On Campus AI & ML Co-Lead** (2024–25): led sessions and mentored peers · open-source contributor to **pgmpy** and **pyaptamer** | `experience.ts`, `Index.tsx` About |
| Foundation | **9 certifications** (Soham's choice of count), including IBM AI Engineering, IBM Deep Learning, IBM Generative AI with LLMs, IBM ML with Python and Microsoft Career Essentials in GenAI · **B.E. AI & Data Science**, MET Nashik, 2022–26 | `Index.tsx` CERTS + STATS |
| Finale | "Building AI for Good Faith of Humanity" · github.com/sohamjadhav95 · soham.ai.engineer@gmail.com · linkedin.com/in/sohamjadhav95 | Soham, `Index.tsx` |

**Never show "3,157×".** No other numbers are allowed beyond this table.

## Customizations

- Sound is a synthesized keynote score: piano, pad and soft pulse in D major, lifting at 15 s and resolving at 25.5 s, plus crisp UI sound effects on every reveal. It reads fully without sound.
- 60 fps, 1920×1080. Web encode of 20 MB or less.

## Notes

- Same sandbox constraints as `portfolio-video/`: vendored libraries and fonts, and `HYPERFRAMES_BROWSER_PATH` pointing at the local headless shell.
- Light theme. It must not drift into generic "AI template" territory: no gradient text, no purple, no centered-everything layouts. Use real hierarchy and edge-anchored zones; centered composition is reserved for the open and the finale.
