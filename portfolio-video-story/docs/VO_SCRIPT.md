# Voiceover: "Soham, the product" (52.5 s)

**Voice.** Kokoro-82M, voice `af_heart` (warm US female), speed 1.14. It's open source (Apache-2.0) and runs on CPU from `scripts/make_vo.py`. Soham picked it by ear from a six-voice sample pack: af_heart, af_bella, am_michael, am_fenrir, am_puck and bm_george.

**Name.** Kokoro reads "Soham Jadhav" as *SO-ham JAD-hav*. The script overrides the phonemes to `sˈoʊhəm dʒˈɑːdəv`, which sounds like *SO-hum JAA-dhuv*.

**Direction**, if you re-voice it yourself or with ElevenLabs:
- Conversational, confident and quick, like a product ad, not a documentary.
- Lean on the accent word in each line: *accurate*, *lying*, *snapped*, *ten percent*, *Exactly*, *almost nothing*, *sixty-three*, *ninety*, *Twice*, *actually*, *every single frame*, *build*.

| # | Line | Scene |
|---|---|---|
| L01 | Your AI model says it's accurate. | Hook |
| L02 | It's lying to you. | Hook |
| L03 | Every outline gets snapped to whole pixels. | Pain |
| L04 | A ten percent error, baked into every label. | Pain |
| L05 | Wrong scores. Wrong risk tiers. | Stakes |
| L06 | Then Soham Jadhav measured every pixel. Exactly. | Reveal |
| L07 | Error: from ten percent, to almost nothing. | Proof |
| L08 | Selected for Google Summer of Code. | Name |
| L09 | The standard tool takes its time. | Speed |
| L10 | His pipeline runs sixty-three times faster. | Speed |
| L11 | He ships products people use. | Products |
| L12 | Text, image and audio moderation, in under three seconds. | Products |
| L13 | A copilot that automates about ninety percent of the data-science workflow. | Products |
| L14 | Published. Twice. | Research |
| L15 | He co-leads AI and ML at Google Developer Groups, on campus. | People |
| L16 | Fewer guesses. AI you can actually trust. | Payoff |
| L17 | Oh, and this whole video? Built in code, with AI. Every single frame. | Meta |
| L18 | Soham Jadhav. Let's build. | End card |

Total: 124 words.

## Using your own voice instead

The whole timeline follows the voiceover, so a new voice re-times the film automatically.

1. Record or generate one WAV per line and name them `assets/audio/lines/L01.wav` … `L18.wav`. Keep about 50 ms of silence at each end.
2. Run `.venv/bin/python scripts/make_vo.py --lines`. This re-lays the lines on the beat grid, rewrites `lib/cues.js` and the scene mounts in `index.html`, and updates each scene's duration.
3. Run `npm run audio` to rebuild the score, SFX and levels around the new voice, then `npm run check` and `npm run render`.
