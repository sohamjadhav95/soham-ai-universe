---
format: 1920x1080
duration: 30s
fps: 60
bpm: 120
message: "Introducing Soham Jadhav: an AI engineer with research, speed, products, leadership and craft to show for it."
arc: Introduction → Recognition → Breakthrough → Speed → Research → Products → Community → Foundation → Promise + Invitation
audience: recruiters, research labs and founders hiring AI/ML engineers
mode: autonomous
---

<!--
120 BPM: a beat is 0.5 s and a bar is 2 s. Chapter boundaries sit on the beat grid. The score lifts at 15.0 s
(Products) and resolves at 25.5 s (Promise). Each chapter eases out in its last 0.3 s, and the next eases in.
Global layer (index.html): the studio stage (floor gradient, light pools) and a chapter progress rail.
-->

## Frame 1 — Introducing

- scene: A ceramic 3D "SJ" monogram turns on a white stage. "Introducing" → "Soham Jadhav." → roles.
- duration: 3s
- transition_in: fade
- status: animated
- src: compositions/frames/01-intro.html
- blueprint: logo-assemble-lockup
- rules: spring-pop-entrance, ambient-glow-bloom
- voiceover: "Introducing Soham Jadhav."

The hero object (three.js, extruded Geist 800, glossy ceramic with a cobalt rim) rises and turns slowly
under a soft key light, with a contact shadow on the floor. Centered: "Introducing" (mono, mute) →
**Soham Jadhav.** (hero type, line-mask reveal) → "AI Engineer · Researcher · Open-source developer".

## Frame 2 — Recognition

- scene: "Selected for Google Summer of Code 2026." A glass badge card rises.
- duration: 2.5s
- status: animated
- src: compositions/frames/02-gsoc.html
- blueprint: titlecard-reveal
- rules: spring-pop-entrance, depth-of-field-blur

Chapter label RECOGNITION. The statement sits top-left over two lines. Right: a glass badge card with
"GSoC 2026" (numeral style), "Google Summer of Code", and ML4Sci · PREDICT1 · international mentors.

## Frame 3 — Breakthrough

- scene: A clean light A3 grid: binary snap → exact coverage; 10.19% → 0.03%.
- duration: 4s
- status: animated
- src: compositions/frames/03-a3.html
- blueprint: comparison-split
- rules: coordinate-target-zoom, counting-dynamic-scale

BREAKTHROUGH / **Solved the sub-pixel problem.** A light pixel grid on a glass card. The binary mask snaps on
in graphite with red over-count cells; then each pixel refills in cobalt to its *exact* coverage (Sutherland–Hodgman,
values printed). Left: "Label area error 10.19% → 0.03%", then two pills: "Agatston error 2.2× lower" ·
"Risk agreement 77% → 83%".

## Frame 4 — Speed

- scene: "63×" as the hero numeral; a clean bar comparison against TotalSegmentator.
- duration: 2.5s
- status: animated
- src: compositions/frames/04-speed.html
- blueprint: dataviz-countup
- rules: counting-dynamic-scale, stat-bars-and-fills

SPEED / **63×** (300 px, cobalt ×) / "faster than TotalSegmentator". Two horizontal bars on glass:
TotalSegmentator (long, graphite) vs PrediCT (short, cobalt, 1/63 of the length), with labels "baseline" and "63× faster".

## Frame 5 — Research

- scene: "Published. Twice." Two paper cards fan out in 3D with real titles and venues.
- duration: 3s
- status: animated
- src: compositions/frames/05-papers.html
- blueprint: grid-card-assemble
- rules: split-tilt-cards, spring-pop-entrance

RESEARCH / **Published. Twice.** Two tall glass "paper" cards tilt into a fan: *Convo-Ease: Intelligent
Multi-Modal Moderation…* (Cureus · Springer Nature · 2025) and *Beyond Text: A Comprehensive Survey of Multimodal
Content Moderation…* (ICIA · 2025 · 26+ methods surveyed).

## Frame 6 — Products

- scene: "Built to be used." Five project cards glide past on a 3D shelf, one stat each.
- duration: 4.5s
- status: animated
- src: compositions/frames/06-products.html
- blueprint: camera-journey
- rules: 3d-camera-flight, spring-pop-entrance

PRODUCTS / **Built to be used.** A row of five glass cards in perspective. The camera trucks right and each card is
lit in turn (about 0.8 s each):
1. Convo-Ease: **< 3 s** text + image + audio moderation
2. Copilot for Data Science: **~90%** of the workflow automated
3. Tennis Match Predictor: **77%** accuracy
4. RenAIssance OCR: historical Spanish handwriting
5. NexaOS Flow: voice → OS commands

## Frame 7 — Community

- scene: "Leads. Mentors. Contributes." GDG Co-Lead card + open-source chips.
- duration: 3s
- status: animated
- src: compositions/frames/07-community.html
- blueprint: titlecard-reveal
- rules: spring-pop-entrance, stagger-cascade

COMMUNITY / **Leads. Mentors. Contributes.** A glass card: "GDG On Campus" · "AI & ML Co-Lead" · "2024–25" ·
"Led hands-on sessions, mentored peers in AI, ML & GenAI." Open-source chips: pgmpy · pyaptamer.

## Frame 8 — Foundation

- scene: "9 certifications." Credential cards stack and fan; degree line.
- duration: 3s
- status: animated
- src: compositions/frames/08-foundation.html
- blueprint: dataviz-countup
- rules: counting-dynamic-scale, stagger-cascade

FOUNDATION / **9** certifications (numeral counts 0 → 9). A cascade of credential cards: IBM AI Engineering
Professional, IBM Deep Learning, IBM Generative AI with LLMs, IBM ML with Python, Microsoft Career
Essentials in GenAI. Below: "B.E. AI & Data Science · MET Nashik · 2022–26".

## Frame 9 — Promise + Invitation

- scene: "Building AI for Good Faith of Humanity." Then the centered end card with the monogram tile.
- duration: 4.5s
- status: animated
- src: compositions/frames/09-finale.html
- blueprint: logo-assemble-lockup
- rules: ambient-glow-bloom, spring-pop-entrance

25.5–27.7 s: centered, the mission line, word by word (25.75 → 26.59 s), with "Good Faith of Humanity" in cobalt.
It holds fully legible until 27.7 s, then lifts away.
27.95–30 s: centered end card: the "SJ" app-icon tile (glint at 28.7 s), **Soham Jadhav**,
"AI Engineer · Researcher · GSoC 2026", "Open to AI/ML engineering roles & research.", and
github.com/sohamjadhav95 · soham.ai.engineer@gmail.com · linkedin.com/in/sohamjadhav95.
Everything is settled by 29.1 s, and the last 0.9 s holds.
