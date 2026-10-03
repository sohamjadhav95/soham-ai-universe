"""Voiceover + timeline for "Soham, the product" (VO-first timing).

Renders every script line with Kokoro-82M (open source, Apache-2.0; voice af_heart), lays the lines out
on a 120 BPM sixteenth-note grid, estimates word timings inside each line, then writes:

  out/vo_raw.wav          the full voiceover track (48 kHz); scripts/synth_audio.py levels it into assets/audio/vo.wav
  lib/cues.js             window.CUES — scene starts, line and word times (read by every scene)
  out/vo_cues.json        the same data, for the audio script and verification
  index.html              the scene <div>s between <!-- scenes:begin --> and <!-- scenes:end -->

Setup (once):
  python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile scipy
  mkdir -p .models && cd .models && for f in kokoro-v1.0.onnx voices-v1.0.bin; do
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f; done
Run:   .venv/bin/python scripts/make_vo.py

To use a recorded voice instead, put one WAV per line in assets/audio/lines/L01.wav … and pass --lines.
"""
import json, re, sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
VOICE, SPEED = "af_heart", 1.14
SR_OUT, FPS, BEAT = 48000, 60, 0.5
GRID = BEAT / 4  # lines start on sixteenth notes

# The script. Third person: Soham is the product. Every number traces to BRIEF.md → Facts.
LINES = [
    ("L01", "Your AI model says it's accurate."),
    ("L02", "It's lying to you."),
    ("L03", "Every outline gets snapped to whole pixels."),
    ("L04", "A ten percent error, baked into every label."),
    ("L05", "Wrong scores. Wrong risk tiers."),
    ("L06", "Then Soham Jadhav measured every pixel. Exactly."),
    ("L07", "Error: from ten percent, to almost nothing."),
    ("L08", "Selected for Google Summer of Code."),
    ("L09", "The standard tool takes its time."),
    ("L10", "His pipeline runs sixty-three times faster."),
    ("L11", "He ships products people use."),
    ("L12", "Text, image and audio moderation, in under three seconds."),
    ("L13", "A copilot that automates about ninety percent of the data-science workflow."),
    ("L14", "Published. Twice."),
    ("L15", "He co-leads AI and ML at Google Developer Groups, on campus."),
    ("L16", "Fewer guesses. AI you can actually trust."),
    ("L17", "Building AI for good faith of humanity."),
    ("L18", "Let's build together."),
]
# The mission and the sign-off get a slower, warmer read, and the mission holds before the contact card.
SPEED_OVERRIDE = {"L17": 1.0, "L18": 1.04}
HOLD_AFTER = {"L17": 0.8}
# Kokoro reads the name as "SO-ham JAD-hav"; these phonemes give "SO-hum JAA-dhuv".
PHONEME_FIX = {"sˈoʊhæm": "sˈoʊhəm", "dʒˈædhæv": "dʒˈɑːdəv"}

# Scene id → lines it carries, and how long the visual leads the voice into the scene.
SCENES = [
    ("s01-hook", ["L01", "L02"]),
    ("s02-pain", ["L03", "L04"]),
    ("s03-stakes", ["L05"]),
    ("s04-reveal", ["L06"]),
    ("s05-proof", ["L07"]),
    ("s06-name", ["L08"]),
    ("s07-speed", ["L09", "L10"]),
    ("s08-products", ["L11", "L12", "L13"]),
    ("s09-research", ["L14", "L15"]),
    ("s10-payoff", ["L16"]),
    ("s11-mission", ["L17"]),
    ("s12-end", ["L18"]),
]
FIRST_LINE_AT = 0.5   # the hook card is on screen for half a second before the first word
LEAD = 0.3            # each later scene arrives this long before its first word
GAP_IN_SCENE = 0.1    # minimum silence between lines in the same scene
GAP_SCENE = 0.12      # minimum silence across a scene change (plus LEAD)
END_HOLD = 2.7        # end card holds after the last word


def snap_up(t, q=GRID):
    return float(np.ceil(t / q - 1e-9) * q)


def frames(t):
    return round(t * FPS) / FPS


def voiced_segments(y, sr, thr_db=-38.0, min_gap=0.11):
    """Voiced spans (seconds) by short-time energy; gaps shorter than min_gap are merged."""
    hop, win = int(0.005 * sr), int(0.02 * sr)
    e = np.array([np.sqrt(np.mean(y[i:i + win] ** 2) + 1e-12) for i in range(0, max(1, len(y) - win), hop)])
    on = 20 * np.log10(e) > thr_db
    segs, start = [], None
    for i, v in enumerate(on):
        t = i * hop / sr
        if v and start is None:
            start = t
        if not v and start is not None:
            segs.append([start, t])
            start = None
    if start is not None:
        segs.append([start, len(y) / sr])
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [m for m in merged if m[1] - m[0] > 0.04]


def word_weights(words, phonemize):
    return [max(2, len(phonemize(re.sub(r"[^\w'-]", "", w) or w))) for w in words]


def align_words(text, segs, phonemize):
    """Map words to time: split text at punctuation into chunks; if the voiced segments match the
    chunk count, place each chunk in its segment, else spread the whole line over the voiced span.
    Inside a chunk, words get time in proportion to their phoneme count."""
    words = text.split()
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.,?!:;]$", w):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    spans = segs if len(segs) == len(chunks) else [[segs[0][0], segs[-1][1]]]
    groups = chunks if len(segs) == len(chunks) else [words]
    out = []
    for (a, b), grp in zip(spans, groups):
        wts = word_weights(grp, phonemize)
        tot, acc = float(sum(wts)), 0.0
        for w, wt in zip(grp, wts):
            out.append({"w": w, "t0": a + (b - a) * acc / tot, "t1": a + (b - a) * (acc + wt) / tot})
            acc += wt
    return out, len(segs) == len(chunks)


SENT_PAUSE = 0.2  # silence between sentences inside one line


def sentences(text):
    return [x for x in re.split(r"(?<=[.?!])\s+", text.strip()) if x]


def trim(y):
    segs = voiced_segments(y, SR_OUT)
    a = max(0.0, segs[0][0] - 0.03)
    b = min(len(y) / SR_OUT, segs[-1][1] + 0.06)
    return y[int(a * SR_OUT):int(b * SR_OUT)]


def render_lines(use_recorded):
    """Returns ({id: [mono float32 clip per sentence]}, phonemize fn). Recorded lines are one clip each."""
    if use_recorded:
        clips = {}
        for lid, _ in LINES:
            y, sr = sf.read(ROOT / f"assets/audio/lines/{lid}.wav", dtype="float32", always_2d=True)
            y = y.mean(axis=1)
            clips[lid] = [trim(resample_poly(y, SR_OUT, sr).astype(np.float32) if sr != SR_OUT else y)]
        return clips, (lambda w: w)
    from kokoro_onnx import Kokoro
    k = Kokoro(str(ROOT / ".models/kokoro-v1.0.onnx"), str(ROOT / ".models/voices-v1.0.bin"))
    ph = lambda t: k.tokenizer.phonemize(t, "en-us")
    clips = {}
    for lid, text in LINES:
        parts = []
        for sent in sentences(text):
            p = ph(sent)
            for a, b in PHONEME_FIX.items():
                p = p.replace(a, b)
            y, sr = k.create(p, voice=VOICE, speed=SPEED_OVERRIDE.get(lid, SPEED), is_phonemes=True)
            parts.append(trim(resample_poly(y, SR_OUT, sr).astype(np.float32)))
        clips[lid] = parts
        print(f"  {lid}  {sum(len(x) for x in parts) / SR_OUT + SENT_PAUSE * (len(parts) - 1):5.2f}s  {text}")
    return clips, ph


def main():
    use_recorded = "--lines" in sys.argv
    print("rendering voice:", "recorded lines" if use_recorded else f"Kokoro {VOICE} @ {SPEED}")
    clips, ph = render_lines(use_recorded)
    texts = dict(LINES)
    scene_of = {lid: sid for sid, lids in SCENES for lid in lids}

    # Trim each clip to its voiced span (+30 ms) and lay the lines on the eighth-note grid.
    lines, t, prev_scene, prev_lid = {}, None, None, None
    for lid, text in LINES:
        parts = clips[lid]
        sents = sentences(text) if len(parts) > 1 else [text]
        gap = np.zeros(int(SENT_PAUSE * SR_OUT), dtype=np.float32)
        y = np.concatenate([x for i, p in enumerate(parts) for x in ((gap, p) if i else (p,))])
        if t is None:
            start = FIRST_LINE_AT
        else:
            gap_s = GAP_IN_SCENE if scene_of[lid] == prev_scene else GAP_SCENE + LEAD
            start = snap_up(t + gap_s + HOLD_AFTER.get(prev_lid, 0.0))
        words, matched, off = [], True, 0.0
        for sent, p in zip(sents, parts):
            segs = voiced_segments(p, SR_OUT)
            w, ok = align_words(sent, segs, ph)
            words += [{"w": x["w"], "t0": off + x["t0"], "t1": off + x["t1"]} for x in w]
            matched = matched and ok
            off += len(p) / SR_OUT + SENT_PAUSE
        lines[lid] = {
            "text": text, "scene": scene_of[lid], "t0": start, "t1": start + len(y) / SR_OUT, "aligned": matched,
            "sentences": len(parts),
            "words": [{"w": w["w"], "t0": round(start + w["t0"], 3), "t1": round(start + w["t1"], 3)} for w in words],
            "_y": y,
        }
        t, prev_scene, prev_lid = lines[lid]["t1"], scene_of[lid], lid

    total = frames(snap_up(t + END_HOLD))
    scenes, order = {}, [s for s, _ in SCENES]
    for i, (sid, lids) in enumerate(SCENES):
        st = 0.0 if i == 0 else frames(lines[lids[0]]["t0"] - LEAD)
        scenes[sid] = {"start": st}
    for i, sid in enumerate(order):
        end = scenes[order[i + 1]]["start"] if i + 1 < len(order) else total
        scenes[sid]["dur"] = round(end - scenes[sid]["start"], 4)

    # Full VO track.
    vo = np.zeros(int(total * SR_OUT) + 1, dtype=np.float32)
    for L in lines.values():
        i0 = int(round(L["t0"] * SR_OUT))
        vo[i0:i0 + len(L["_y"])] += L.pop("_y")
    vo *= 0.89 / max(1e-6, np.abs(vo).max())
    (ROOT / "out").mkdir(exist_ok=True)
    sf.write(ROOT / "out/vo_raw.wav", vo, SR_OUT, subtype="FLOAT")

    for L in lines.values():
        L["t0"], L["t1"] = round(L["t0"], 3), round(L["t1"], 3)
    cues = {"fps": FPS, "bpm": 120, "total": total, "voice": VOICE if not use_recorded else "recorded",
            "scenes": scenes, "lines": lines}
    (ROOT / "out").mkdir(exist_ok=True)
    (ROOT / "out/vo_cues.json").write_text(json.dumps(cues, indent=1))
    (ROOT / "lib/cues.js").write_text(
        "/* Generated by scripts/make_vo.py: do not edit by hand. */\nwindow.CUES = " + json.dumps(cues) + ";\n")

    # Scene mounts in index.html.
    idx = ROOT / "index.html"
    html = idx.read_text()
    rows = []
    for sid in order:
        s = scenes[sid]
        rows.append(
            f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/frames/{sid}.html"\n'
            f'        data-start="{s["start"]:g}" data-duration="{s["dur"]:g}" data-track-index="1" data-width="1920" data-height="1080"></div>')
    block = "<!-- scenes:begin -->\n" + "\n".join(rows) + "\n      <!-- scenes:end -->"
    html = re.sub(r"<!-- scenes:begin -->.*?<!-- scenes:end -->", block, html, flags=re.S)
    html = re.sub(r'(id="root"[^>]*data-duration=")[^"]*(")', rf"\g<1>{total:g}\2", html)
    html = re.sub(r'(<audio id="(?:vo|score|sfx)"[^>]*data-duration=")[^"]*(")', rf"\g<1>{total:g}\2", html)
    html = re.sub(r'(<div id="stage"[^>]*data-duration=")[^"]*(")', rf"\g<1>{total:g}\2", html)
    idx.write_text(html)
    # Keep each scene file's own data-duration in step with the timeline.
    for sid, dur in [(s, scenes[s]["dur"]) for s in order] + [("s00-stage", total)]:
        f = ROOT / f"compositions/frames/{sid}.html"
        if f.exists():
            f.write_text(re.sub(r'data-duration="[^"]*"', f'data-duration="{dur:g}"', f.read_text()))

    print(f"\ntotal {total:.2f}s")
    for sid in order:
        s = scenes[sid]
        print(f"  {sid:13s} {s['start']:6.2f} +{s['dur']:5.2f}")
    misaligned = [k for k, L in lines.items() if not L["aligned"]]
    print("sentence spans exact; comma pauses matched in", f"{len(lines) - len(misaligned)}/{len(lines)} lines",
          ("(proportional inside a sentence: " + ", ".join(misaligned) + ")") if misaligned else "")


if __name__ == "__main__":
    main()
