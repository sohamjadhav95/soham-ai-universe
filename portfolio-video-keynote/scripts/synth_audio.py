"""Synthesizes the 30 s keynote score + UI sound effects for the "Keynote" film — no samples.

Outputs (48 kHz, 24-bit stereo, 30.0 s, all starting at t=0):
  assets/audio/score.wav   music: modelled piano, warm pad, soft pulse, arp, bass (D major, 120 BPM)
  assets/audio/sfx.wav     UI sounds placed on the same cue table as the visuals
  out/mix_preview.wav      score + sfx for listening / loudness QA

Shape: intro (piano only) → pulse enters at 3.0 s → arp at 5.5 s → riser 13.5–15.0 → full lift at 15.0 s
→ resolve at 25.5 s (drums out, big held chord) → final chime at 27.95 s → tail.
Both stems share one limiter gain envelope; target -16 LUFS integrated, true peak <= -1 dBTP.

Run:  python3 scripts/synth_audio.py      (needs numpy, scipy, ffmpeg on PATH)
"""

import json
import re
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48_000
DUR = 30.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "assets" / "audio"
OUT_DIR = ROOT / "out"

# Chapter boundaries (STORYBOARD.md) — every chapter change gets a soft swish + a glass tink on landing.
CHAPTERS = [3.0, 5.5, 9.5, 12.0, 15.0, 19.5, 22.5, 25.5, 27.95]
CUES = {
    "intro_air": 0.15,
    "introducing": 0.7,
    "title": 1.05,
    "monogram_glint": 2.2,
    "card_lands": [c + 0.42 for c in CHAPTERS[:7]],
    "a3_cells": [6.35 + i * 0.022 for i in range(12)],
    "a3_refill": [7.2 + i * 0.075 for i in range(8)],
    "a3_counter": (7.9, 8.45),
    "a3_pills": [8.55, 8.75],
    "speed_count": (9.75, 10.3),
    "speed_land": 10.35,
    "speed_bars": 10.55,
    "paper_cards": [12.4, 12.6],
    "product_focus": [15.45, 16.25, 17.05, 17.85, 18.65],
    "community_chips": [20.55, 20.75],
    "cert_count": (22.85, 23.4),
    "cert_cards": [23.5, 23.68, 23.86, 24.04, 24.22],
    "mission_words": [25.75 + i * 0.14 for i in range(7)],
    "end_card": 27.95,
    "end_glint": 28.7,
}

RNG_SEED = 20261003


def rng(seed):
    return np.random.default_rng(RNG_SEED + seed)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, freq, order=2):
    return sosfilt(butter(order, freq, btype=kind, fs=SR, output="sos"), x)


def noise(d, seed):
    return rng(seed).standard_normal(int(d * SR))


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def svf_sweep(x, f_start, f_end, q=1.4):
    n = len(x)
    fc = f_start * (f_end / f_start) ** (np.arange(n) / max(n - 1, 1))
    f = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    damp = 1 / q
    lp = bp = 0.0
    out = np.empty(n)
    for i in range(n):
        hp = x[i] - lp - damp * bp
        bp += f[i] * hp
        lp += f[i] * bp
        out[i] = bp
    return out


# ------------------------------------------------------------------------------------------
# Instruments
# ------------------------------------------------------------------------------------------
def piano(note, d=2.6, vel=0.7, seed=0):
    """Modelled piano: inharmonic partials, two detuned strings, per-partial decay, hammer noise."""
    f0 = midi(note)
    t = t_axis(d)
    B = 0.00035
    x = np.zeros(len(t))
    for det in (-0.7, 0.7):
        f = f0 * 2 ** (det / 1200)
        for k in range(1, 13):
            fk = k * f * np.sqrt(1 + B * k * k)
            if fk > 12000:
                break
            amp = (1 / k ** 1.15) * (0.6 + 0.4 * vel) ** (k * 0.25)
            decay = 1.6 / (1 + 0.35 * k) * (1.2 - 0.004 * (note - 60))
            x += amp * np.sin(2 * np.pi * fk * t + 0.3 * k) * np.exp(-t / max(0.12, decay))
    x *= 0.5
    hammer = filt(noise(0.03, 300 + note + seed), "bandpass", (800, 5000)) * np.exp(-t_axis(0.03) / 0.006) * 0.08
    x[: len(hammer)] += hammer
    env = np.minimum(1, t / 0.003) * np.minimum(1, (d - t) / 0.3)
    return x * env * vel * 0.32


def pluck(note, d=0.5, seed=0):
    f = midi(note)
    t = t_axis(d)
    x = np.zeros(len(t))
    for k in (1, 2, 3, 4, 5):
        x += np.sin(2 * np.pi * k * f * t) / k ** 1.6 * np.exp(-t / (0.22 / k))
    return x * np.minimum(1, t / 0.002) * 0.22


def pad_chord(notes, d, seed=0):
    t = t_axis(d)
    x = np.zeros(len(t))
    for n in notes:
        for det in (-0.09, 0.0, 0.1):
            f = midi(n) * 2 ** (det / 12)
            for h in range(1, 10):
                x += np.sin(2 * np.pi * f * h * t + h) / h
    x = filt(x, "lowpass", 1600)
    env = np.interp(t, [0, 0.6, d - 0.8, d], [0, 1, 0.85, 0])
    return x * env * 0.012


def kick(soft=1.0):
    d = 0.4
    t = t_axis(d)
    f = 48 + 70 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) * (1 - np.exp(-t / 0.002))
    return np.tanh(1.4 * x) * 0.55 * soft


def clap(seed):
    d = 0.25
    t = t_axis(d)
    x = filt(noise(d, seed), "bandpass", (900, 5200)) * np.exp(-t / 0.05)
    for off in (0.008, 0.017):
        i = int(off * SR)
        x[i:] += filt(noise(d, seed + 9), "bandpass", (900, 5200))[: len(x) - i] * np.exp(-t[: len(x) - i] / 0.012) * 0.5
    return x * 0.18


def hat(seed):
    d = 0.05
    t = t_axis(d)
    return filt(noise(d, seed), "highpass", 8000, 4) * np.exp(-t / 0.016) * 0.12


def bass(note, d):
    f = midi(note)
    t = t_axis(d)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return x * np.minimum(1, t / 0.01) * np.exp(-t / 0.35) * 0.22


def bell(f, d=1.2, index=1.4, amp=0.3):
    t = t_axis(d)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * index * np.exp(-t / 0.08)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.45) * (1 - np.exp(-t / 0.002)) * amp


def tick(f=3200, d=0.012, seed=0, amp=0.35):
    t = t_axis(d)
    return (0.5 * filt(noise(d, seed), "highpass", 3000) * np.exp(-t / 0.002) + np.sin(2 * np.pi * f * t) * np.exp(-t / 0.003)) * amp


def swish(d=0.5, seed=0, up=True):
    x = noise(d, seed)
    y = svf_sweep(x, 500, 4500, 1.2) if up else svf_sweep(x, 4500, 500, 1.2)
    t = t_axis(d)
    return y * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 0.22


def riser(d, seed=0):
    t = t_axis(d)
    y = svf_sweep(noise(d, seed), 300, 6000, 2.2)
    return y * (t / d) ** 2.4 * 0.35


def thock(seed=0):
    d = 0.25
    t = t_axis(d)
    body = np.sin(2 * np.pi * np.cumsum(140 + 90 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.05)
    click = filt(noise(d, seed), "bandpass", (1200, 6000)) * np.exp(-t / 0.004) * 0.4
    return (body + click) * 0.4


# ------------------------------------------------------------------------------------------
class Bus:
    def __init__(self):
        self.buf = np.zeros((2, N))

    def add(self, sig, at, gain=1.0, pan=0.0):
        i = int(round(at * SR))
        if i >= N:
            return
        sig = sig[: N - i]
        th = (pan + 1) * np.pi / 4
        self.buf[0, i:i + len(sig)] += sig * gain * np.cos(th)
        self.buf[1, i:i + len(sig)] += sig * gain * np.sin(th)


def reverb(dry, mix, d=3.0, tau=0.8, seed=101):
    t = t_axis(d)
    ir = np.stack([noise(d, seed), noise(d, seed + 1)]) * np.exp(-t / tau)
    ir = np.stack([filt(c, "lowpass", 6500) for c in ir])
    ir[:, : int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    ir /= np.sqrt(np.sum(ir ** 2) / 2)
    return np.stack([fftconvolve(dry[c], ir[c])[:N] for c in range(2)]) * mix


# D major, I–V–vi–IV: (root, chord tones for piano voicing, pad tones)
PROG = [
    (50, [62, 66, 69, 74], [50, 57, 62, 66]),   # D
    (45, [61, 64, 69, 73], [45, 52, 61, 64]),   # A
    (47, [62, 66, 71, 74], [47, 54, 62, 66]),   # Bm
    (43, [62, 67, 71, 74], [43, 50, 59, 62]),   # G
]


def build_score():
    s = Bus()
    send = Bus()
    n_bars = int(DUR / BAR) + 1
    for b in range(n_bars):
        at = b * BAR
        if at >= 25.5:
            break
        root, voicing, padv = PROG[b % 4]
        # Piano: rolled chord on the bar, a softer re-strike on beat 3.
        for k, n in enumerate(voicing):
            sig = piano(n, 2.4, 0.55 + 0.05 * k)
            s.add(sig, at + k * 0.018, 1.0, pan=-0.3 + 0.2 * k)
            send.add(sig, at + k * 0.018, 0.6)
        if at >= 3.0:
            for k, n in enumerate(voicing[1:]):
                s.add(piano(n, 1.4, 0.4), at + 2 * BEAT + k * 0.012, 0.8, pan=0.2 - 0.15 * k)
        # Pad underneath everything after the open.
        if at >= 2.0:
            pd = pad_chord(padv, BAR + 0.6)
            s.add(pd, at, 1.0 if at < 14 else 1.3, pan=0.0)
    # Pulse: soft kick on 1 & 3 from 3.0, on every beat from the lift (15.0) to the resolve (25.5).
    at = 3.0
    while at < 25.5 - 1e-6:
        on_beat = int(round(at / BEAT))
        if at >= 15.0 or on_beat % 2 == 0:
            s.add(kick(0.75 if at < 15 else 1.0), at, 1.0)
        if at >= 15.0 and on_beat % 2 == 1:
            s.add(clap(400 + on_beat), at, 1.0, pan=0.05)
        at += BEAT
    # Hats: 8ths after the lift.
    at = 15.0
    k = 0
    while at < 25.5 - 1e-6:
        s.add(hat(500 + k), at, 1.0 if k % 2 else 0.6, pan=0.3 if k % 2 else -0.2)
        at += BEAT / 2
        k += 1
    # Arp: 8ths from 5.5, 16ths after the lift, chord tones an octave up.
    at = 5.5
    k = 0
    while at < 25.5 - 1e-6:
        root, voicing, _ = PROG[int(at // BAR) % 4]
        note = voicing[k % 4] + 12
        step = BEAT / 2 if at < 15.0 else BEAT / 4
        p = pluck(note, 0.45)
        s.add(p, at, 0.75 if at < 15 else 0.6, pan=-0.45 + 0.3 * (k % 4))
        send.add(p, at, 0.3)
        at += step
        k += 1
    # Bass: 8ths on the root after the lift.
    at = 15.0
    while at < 25.5 - 1e-6:
        root, _, _ = PROG[int(at // BAR) % 4]
        s.add(bass(root - 12, BEAT / 2 * 0.9), at, 1.0)
        at += BEAT / 2
    # Resolve: a big held D major chord, piano + pad swell, then the final chime at the end card.
    for k, n in enumerate([50, 57, 62, 66, 69, 74, 78]):
        sig = piano(n, 4.4, 0.6)
        s.add(sig, 25.5 + k * 0.025, 1.0, pan=-0.45 + 0.15 * k)
        send.add(sig, 25.5 + k * 0.025, 0.8)
    s.add(pad_chord([50, 57, 62, 66, 69], 4.6), 25.5, 1.6)
    for k, n in enumerate([74, 78, 81, 86]):
        b = bell(midi(n), 2.2, 0.9, 0.18)
        s.add(b, CUES["end_card"] + k * 0.06, 1.0, pan=-0.3 + 0.2 * k)
        send.add(b, CUES["end_card"] + k * 0.06, 0.9)
    return s.buf + reverb(send.buf, 0.32)


def build_sfx():
    x = Bus()
    send = Bus()
    x.add(swish(0.9, 1, True), CUES["intro_air"], 0.8)
    x.add(tick(2400, 0.012, 2, 0.25), CUES["introducing"], 1.0)
    b = bell(midi(86), 1.6, 0.8, 0.22)
    x.add(b, CUES["title"], 1.0)
    send.add(b, CUES["title"], 0.8)
    g = bell(midi(93), 1.2, 0.6, 0.12)
    x.add(g, CUES["monogram_glint"], 1.0, pan=0.3)
    send.add(g, CUES["monogram_glint"], 0.8)
    for k, c in enumerate(CHAPTERS):
        x.add(swish(0.45, 10 + k, k % 2 == 0), c - 0.18, 0.8, pan=(-0.3 if k % 2 else 0.3))
    for k, c in enumerate(CUES["card_lands"]):
        tk = bell(midi(88 + (k % 3) * 2), 0.9, 1.0, 0.16)
        x.add(tk, c, 1.0)
        send.add(tk, c, 0.6)
    for k, c in enumerate(CUES["a3_cells"]):
        x.add(tick(2800, 0.01, 40 + k, 0.2), c, 1.0, pan=-0.3 + 0.05 * k)
    for k, (c, n) in enumerate(zip(CUES["a3_refill"], (74, 76, 78, 81, 83, 86, 88, 90))):
        bl = bell(midi(n), 0.8, 0.9, 0.14)
        x.add(bl, c, 1.0, pan=-0.4 + 0.1 * k)
        send.add(bl, c, 0.5)
    a, b2 = CUES["a3_counter"]
    for k, c in enumerate(np.arange(a, b2, 0.04)):
        x.add(tick(2200 + 25 * k, 0.01, 60 + k, 0.18), float(c), 1.0)
    for c in CUES["a3_pills"]:
        x.add(thock(70), c, 0.8)
    a, b2 = CUES["speed_count"]
    for k, c in enumerate(np.arange(a, b2, 0.035)):
        x.add(tick(1800 + 40 * k, 0.01, 80 + k, 0.2), float(c), 1.0)
    x.add(thock(90), CUES["speed_land"], 1.2)
    x.add(swish(0.6, 91, True), CUES["speed_bars"], 0.7)
    for k, c in enumerate(CUES["paper_cards"]):
        x.add(swish(0.35, 100 + k, False), c, 0.8, pan=-0.3 + 0.6 * k)
    for k, c in enumerate(CUES["product_focus"]):
        bl = bell(midi(81 + [0, 2, 4, 7, 9][k]), 0.7, 0.8, 0.14)
        x.add(bl, c, 1.0, pan=-0.5 + 0.25 * k)
        send.add(bl, c, 0.5)
        x.add(tick(3000, 0.01, 120 + k, 0.15), c - 0.02, 1.0)
    for c in CUES["community_chips"]:
        x.add(thock(130), c, 0.6)
    a, b2 = CUES["cert_count"]
    for k, c in enumerate(np.linspace(a, b2, 9)):
        x.add(tick(2000 + 120 * k, 0.012, 140 + k, 0.22), float(c), 1.0)
    for k, c in enumerate(CUES["cert_cards"]):
        x.add(tick(2600, 0.014, 160 + k, 0.18), c, 1.0, pan=-0.4 + 0.2 * k)
    for k, c in enumerate(CUES["mission_words"]):
        x.add(tick(3400, 0.01, 180 + k, 0.08), c, 1.0)
    x.add(riser(1.5, 7), 13.5, 0.8)
    x.add(swish(1.2, 8, True), 25.0, 0.6)
    gl = bell(midi(98), 1.6, 0.5, 0.1)
    x.add(gl, CUES["end_glint"], 1.0)
    send.add(gl, CUES["end_glint"], 1.0)
    return x.buf + reverb(send.buf, 0.4, d=2.4, tau=0.6, seed=211)


# ------------------------------------------------------------------------------------------
def limiter_gain(mix, ceiling_db=-1.2, release_s=0.1):
    ceiling = 10 ** (ceiling_db / 20)
    peak = np.max(np.abs(mix), axis=0)
    look = int(0.002 * SR)
    padded = np.concatenate([peak, np.zeros(look)])
    ahead = np.lib.stride_tricks.sliding_window_view(padded, look + 1).max(axis=1)[:N]
    target = np.minimum(1.0, ceiling / np.maximum(ahead, 1e-9))
    g = np.empty(N)
    cur = 1.0
    rel = np.exp(-1 / (release_s * SR))
    for i in range(N):
        cur = target[i] if target[i] < cur else rel * cur + (1 - rel) * target[i]
        g[i] = cur
    return g


def integrated_lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


def write_wav(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    ints = (np.clip(x, -1, 1).T * (2 ** 23 - 1)).astype("<i4").reshape(-1)
    raw = np.frombuffer(ints.tobytes(), dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(raw)


def main():
    score = build_score()
    sfx = build_sfx()
    fade = np.ones(N)
    fade[-int(0.8 * SR):] = np.linspace(1, 0, int(0.8 * SR)) ** 1.5
    score *= fade
    sfx *= fade
    OUT_DIR.mkdir(exist_ok=True)
    tmp = OUT_DIR / "_raw_mix.wav"
    write_wav(tmp, (score + sfx) * 0.5)
    gain = 10 ** ((-16.0 - (integrated_lufs(tmp) + 20 * np.log10(2))) / 20)
    score *= gain
    sfx *= gain
    for _ in range(3):
        g = limiter_gain(score + sfx)
        write_wav(tmp, (score + sfx) * g)
        now = integrated_lufs(tmp)
        if abs(now + 16.0) < 0.3:
            break
        trim = 10 ** ((-16.0 - now) / 20)
        score *= trim
        sfx *= trim
    score *= g
    sfx *= g
    tmp.unlink(missing_ok=True)
    write_wav(AUDIO_DIR / "score.wav", score)
    write_wav(AUDIO_DIR / "sfx.wav", sfx)
    write_wav(OUT_DIR / "mix_preview.wav", score + sfx)
    final = integrated_lufs(OUT_DIR / "mix_preview.wav")
    report = {"integrated_lufs": round(final, 2), "sample_peak_db": round(float(20 * np.log10(np.max(np.abs(score + sfx)))), 2), "duration_s": DUR}
    (OUT_DIR / "audio_report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report))


if __name__ == "__main__":
    main()
