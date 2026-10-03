"""Score, SFX and the final voiceover level for "Soham, the product". No samples except the starter kit's code-made SFX.

Reads  out/vo_cues.json + out/vo_raw.wav (from scripts/make_vo.py) and assets/sfx/*.wav (Motion Graphics starter kit).
Writes (48 kHz, 24-bit stereo, full film length, all starting at t=0):
  assets/audio/vo.flac     the voiceover, levelled          (lossless FLAC keeps the repo small;
  assets/audio/score.flac  music, ducked under the voice     WAV copies go to out/ for QA)
  assets/audio/sfx.flac    hits placed on the same word cues the scenes use
  out/mix_preview.wav      vo + score + sfx, for listening / loudness QA

Music: D minor tension for the problem (0–11.2 s) → a hard boom on "LYING" → drone + hits under "WRONG" → D major
lift on the reveal (11.2 s) → full groove through the features → drums out and a swelling chord under the mission line
→ a gentle resolve under "Let's build together." on the contact card.
All three stems share one limiter gain; target -16 LUFS integrated, sample peak <= -1 dBFS.

Run:  python3 scripts/synth_audio.py      (needs numpy, scipy, ffmpeg on PATH)
"""

import json
import re
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
CUES = json.loads((ROOT / "out/vo_cues.json").read_text())
SR = 48_000
DUR = CUES["total"]
N = int(round(SR * DUR))
BEAT = 0.5
BAR = 4 * BEAT
RNG_SEED = 20261003


def S(sid):
    return CUES["scenes"][sid]["start"]


def norm(w):
    return re.sub(r"[^a-z0-9'-]", "", w.lower())


def W(lid, word, n=0, end=False):
    k = 0
    for w in CUES["lines"][lid]["words"]:
        if norm(w["w"]) == norm(word):
            if k == n:
                return w["t1"] if end else w["t0"]
            k += 1
    raise KeyError((lid, word, n))


def L(lid):
    return CUES["lines"][lid]


# ------------------------------------------------------------------------------------------ dsp
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


# ------------------------------------------------------------------------------------------ instruments
def piano(note, d=2.4, vel=0.7, seed=0):
    f0 = midi(note)
    t = t_axis(d)
    x = np.zeros(len(t))
    for det in (-0.7, 0.7):
        f = f0 * 2 ** (det / 1200)
        for k in range(1, 12):
            fk = k * f * np.sqrt(1 + 0.00035 * k * k)
            if fk > 12000:
                break
            amp = (1 / k ** 1.15) * (0.6 + 0.4 * vel) ** (k * 0.25)
            decay = 1.6 / (1 + 0.35 * k) * (1.2 - 0.004 * (note - 60))
            x += amp * np.sin(2 * np.pi * fk * t + 0.3 * k) * np.exp(-t / max(0.12, decay))
    x *= 0.5
    hammer = filt(noise(0.03, 300 + note + seed), "bandpass", (800, 5000)) * np.exp(-t_axis(0.03) / 0.006) * 0.08
    x[: len(hammer)] += hammer
    return x * np.minimum(1, t / 0.003) * np.minimum(1, (d - t) / 0.3) * vel * 0.32


def pluck(note, d=0.45, bright=1.0):
    f = midi(note)
    t = t_axis(d)
    x = sum(np.sin(2 * np.pi * k * f * t) / k ** (1.9 - 0.5 * bright) * np.exp(-t / (0.2 / k)) for k in range(1, 6))
    return x * np.minimum(1, t / 0.002) * 0.2


def pad_chord(notes, d, cutoff=1600):
    t = t_axis(d)
    x = np.zeros(len(t))
    for n in notes:
        for det in (-0.09, 0.0, 0.1):
            f = midi(n) * 2 ** (det / 12)
            for h in range(1, 9):
                x += np.sin(2 * np.pi * f * h * t + h) / h
    x = filt(x, "lowpass", cutoff)
    return x * np.interp(t, [0, min(0.6, d / 3), max(d - 0.8, d * 0.7), d], [0, 1, 0.85, 0]) * 0.012


def kick(soft=1.0):
    t = t_axis(0.4)
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
    return x * 0.17


def hat(seed, amp=0.11):
    t = t_axis(0.05)
    return filt(noise(0.05, seed), "highpass", 8000, 4) * np.exp(-t / 0.016) * amp


def bass(note, d):
    f = midi(note)
    t = t_axis(d)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return x * np.minimum(1, t / 0.01) * np.exp(-t / 0.35) * 0.22


def bell(f, d=1.2, index=1.4, amp=0.3):
    t = t_axis(d)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * index * np.exp(-t / 0.08)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.45) * (1 - np.exp(-t / 0.002)) * amp


def boom(seed=0, d=1.6):
    """Cinematic low hit: sub drop + filtered noise burst."""
    t = t_axis(d)
    sub = np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.5)
    burst = filt(noise(d, seed), "lowpass", 2400) * np.exp(-t / 0.12) * 0.5
    return np.tanh(1.6 * (sub + burst)) * 0.6


def shatter(seed=0, d=0.9):
    t = t_axis(d)
    x = filt(noise(d, seed), "highpass", 2500) * np.exp(-t / 0.18)
    for k in range(14):
        r = rng(seed + k)
        at, f = r.uniform(0.0, 0.35), r.uniform(3000, 7000)
        i = int(at * SR)
        tt = np.arange(len(x) - i) / SR
        x[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.03) * 0.25
    return x * 0.22


def thock(seed=0):
    t = t_axis(0.25)
    body = np.sin(2 * np.pi * np.cumsum(140 + 90 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.05)
    click = filt(noise(0.25, seed), "bandpass", (1200, 6000)) * np.exp(-t / 0.004) * 0.4
    return (body + click) * 0.42


def swish(d=0.45, seed=0, up=True):
    y = svf_sweep(noise(d, seed), 500, 4500, 1.2) if up else svf_sweep(noise(d, seed), 4500, 500, 1.2)
    return y * np.sin(np.pi * np.clip(t_axis(d) / d, 0, 1)) ** 2 * 0.2


def riser(d, seed=0):
    t = t_axis(d)
    return svf_sweep(noise(d, seed), 300, 6000, 2.2) * (t / d) ** 2.4 * 0.3


def kit(name):
    sr, x = wavfile.read(ROOT / f"assets/sfx/{name}.wav")
    x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if np.abs(x).max() > 1.5:
        x /= 32768.0
    assert sr == SR, (name, sr)
    return x


# ------------------------------------------------------------------------------------------ buses
class Bus:
    def __init__(self):
        self.buf = np.zeros((2, N))

    def add(self, sig, at, gain=1.0, pan=0.0):
        i = int(round(at * SR))
        if i >= N or i + len(sig) <= 0:
            return
        if i < 0:
            sig, i = sig[-i:], 0
        sig = sig[: N - i]
        th = (pan + 1) * np.pi / 4
        self.buf[0, i:i + len(sig)] += sig * gain * np.cos(th)
        self.buf[1, i:i + len(sig)] += sig * gain * np.sin(th)


def reverb(dry, mix, d=2.6, tau=0.7, seed=101):
    t = t_axis(d)
    ir = np.stack([noise(d, seed), noise(d, seed + 1)]) * np.exp(-t / tau)
    ir = np.stack([filt(c, "lowpass", 6500) for c in ir])
    ir[:, : int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    ir /= np.sqrt(np.sum(ir ** 2) / 2)
    return np.stack([fftconvolve(dry[c], ir[c])[:N] for c in range(2)]) * mix


MINOR = [(50, [62, 65, 69, 74], [50, 57, 62, 65]),  # Dm
         (46, [62, 65, 70, 74], [46, 53, 62, 65]),  # Bb
         (41, [60, 65, 69, 72], [41, 48, 60, 65]),  # F
         (48, [60, 64, 67, 72], [48, 55, 60, 64])]  # C
MAJOR = [(50, [62, 66, 69, 74], [50, 57, 62, 66]),  # D
         (45, [61, 64, 69, 73], [45, 52, 61, 64]),  # A
         (47, [62, 66, 71, 74], [47, 54, 62, 66]),  # Bm
         (43, [62, 67, 71, 74], [43, 50, 59, 62])]  # G


def grid(a, b, step):
    t = np.ceil(a / step - 1e-9) * step
    while t < b - 1e-9:
        yield float(t)
        t += step


def build_score():
    s, send = Bus(), Bus()
    CUT = W("L02", "lying") - 0.04
    REV, NAME, SPEED, META, END = S("s04-reveal"), S("s06-name"), S("s07-speed"), S("s11-mission"), S("s12-end")
    STAKES = S("s03-stakes")

    def chord_at(t):
        return (MINOR if t < REV else MAJOR)[int(t // BAR) % 4]

    # hook: a quiet, slightly uneasy open
    for k, n in enumerate([62, 65, 69, 74]):
        sig = piano(n, 2.4, 0.45)
        s.add(sig, 0.05 + k * 0.03, 0.8, pan=-0.3 + 0.2 * k)
        send.add(sig, 0.05 + k * 0.03, 0.6)
    s.add(pad_chord([50, 57, 62, 65], CUT + 0.2, 1200), 0.0, 0.9)
    # pain: dark pulse
    for t in grid(S("s02-pain"), STAKES, BEAT):
        s.add(kick(0.6), t, 1.0)
    for t in grid(S("s02-pain") + 0.25, STAKES, BEAT / 2):
        root, voicing, _ = chord_at(t)
        k = int(round(t / (BEAT / 2)))
        p = pluck(voicing[k % 4], 0.4, 0.6)
        s.add(p, t, 0.7, pan=-0.4 + 0.27 * (k % 4))
        send.add(p, t, 0.25)
    for t in grid(S("s02-pain"), STAKES, BEAT / 2):
        s.add(bass(chord_at(t)[0] - 12, BEAT / 2 * 0.9), t, 0.9)
    for t in grid(S("s02-pain") + 2.0, STAKES, BEAT / 4):
        k = int(round(t / (BEAT / 4)))
        s.add(hat(600 + k, 0.07 if k % 2 else 0.04), t, 1.0, pan=0.25)
    for t in grid(0, STAKES, BAR):
        if t >= S("s02-pain") - 0.2:
            s.add(pad_chord(chord_at(t)[2], BAR + 0.6, 1100), t, 0.9)
    # stakes: drone + sub, riser into the reveal
    s.add(pad_chord([38, 45, 50, 53], REV - STAKES + 0.3, 700), STAKES, 1.4)
    s.add(riser(1.0, 7), REV - 1.0, 0.8)
    # reveal → name: bright major chord, arp, light pulse
    for k, n in enumerate([62, 66, 69, 74, 78]):
        sig = piano(n, 3.0, 0.62)
        s.add(sig, REV + k * 0.025, 1.0, pan=-0.4 + 0.2 * k)
        send.add(sig, REV + k * 0.025, 0.8)
    for t in grid(REV, META, BAR):
        root, voicing, padv = chord_at(t)
        s.add(pad_chord(padv, BAR + 0.6, 1800), t, 1.1)
        if t >= NAME:
            for k, n in enumerate(voicing):
                s.add(piano(n, 1.8, 0.42), t + k * 0.015, 0.7, pan=-0.3 + 0.2 * k)
    for t in grid(REV, META, BEAT / 2):
        k = int(round(t / (BEAT / 2)))
        voicing = chord_at(t)[1]
        p = pluck(voicing[k % 4] + 12, 0.42, 1.0)
        s.add(p, t, 0.55 if t < SPEED else 0.45, pan=-0.45 + 0.3 * (k % 4))
        send.add(p, t, 0.3)
    for t in grid(SPEED, META, BEAT / 4):
        k = int(round(t / (BEAT / 4)))
        voicing = chord_at(t)[1]
        if k % 2:
            s.add(pluck(voicing[(k // 2) % 4] + 12, 0.3, 1.0), t, 0.32, pan=0.35 - 0.2 * (k % 4))
    for t in grid(NAME, META, BEAT):
        s.add(kick(0.8 if t < SPEED else 1.0), t, 1.0)
        if t >= SPEED and int(round(t / BEAT)) % 2 == 1:
            s.add(clap(400 + int(t * 10)), t, 1.0, pan=0.05)
    for t in grid(SPEED, META, BEAT / 2):
        k = int(round(t / (BEAT / 2)))
        s.add(hat(700 + k), t, 1.0 if k % 2 else 0.55, pan=0.3 if k % 2 else -0.2)
        s.add(bass(chord_at(t)[0] - 12, BEAT / 2 * 0.9), t, 1.0)
    s.add(riser(1.6, 9), SPEED - 1.6, 0.5)
    # mission: drums out, a swelling D major chord under "Building AI for good faith of humanity."
    s.add(riser(0.9, 11), META - 0.9, 0.5)
    for k, n in enumerate([50, 57, 62, 66, 69, 74, 78]):
        sig = piano(n, 4.6, 0.64)
        s.add(sig, META + k * 0.03, 1.0, pan=-0.45 + 0.15 * k)
        send.add(sig, META + k * 0.03, 0.9)
    s.add(pad_chord([50, 57, 62, 66, 69, 74], END - META + 0.8, 2400), META, 1.7)
    th = W("L17", "humanity.")
    for k, n in enumerate([81, 86, 90]):
        b = bell(midi(n), 1.8, 0.7, 0.12)
        s.add(b, th + k * 0.08, 1.0, pan=-0.2 + 0.2 * k)
        send.add(b, th + k * 0.08, 0.9)
    # contact card: a gentle resolve
    for k, n in enumerate([62, 66, 69, 74]):
        sig = piano(n, 3.6, 0.48)
        s.add(sig, END + k * 0.03, 1.0, pan=-0.3 + 0.2 * k)
        send.add(sig, END + k * 0.03, 0.8)
    s.add(pad_chord([50, 57, 62, 66, 69], DUR - END, 2000), END, 1.3)
    tb = W("L18", "together.")
    for k, n in enumerate([74, 78, 81, 86]):
        b = bell(midi(n), 2.2, 0.9, 0.16)
        s.add(b, tb + k * 0.06, 1.0, pan=-0.3 + 0.2 * k)
        send.add(b, tb + k * 0.06, 0.9)
    return s.buf + reverb(send.buf, 0.32)


def build_sfx():
    x, send = Bus(), Bus()
    K = {n: kit(n) for n in ["chime", "counter", "fill", "pop", "snap", "star", "success", "switch", "tick"]}

    def hit(name, at, g=1.0, pan=0.0, wet=0.0):
        sig = K[name] if isinstance(name, str) else name
        x.add(sig, at, g, pan)
        if wet:
            send.add(sig, at, wet)

    # s01 hook
    hit("success", W("L01", "accurate.") - 0.04, 0.8, 0.2, 0.3)
    hit("switch", W("L02", "It's"), 0.7, -0.2)
    hit("switch", W("L02", "It's") + 0.08, 0.5, 0.2)
    cut = W("L02", "lying") - 0.04
    hit(boom(1), cut, 1.0)
    hit(shatter(2), cut, 0.9)
    # s02 pain
    ts = W("L03", "snapped")
    hit("snap", ts - 0.02, 1.0, 0.0, 0.2)
    for k in range(8):
        hit("tick", ts + k * 0.03, 0.35, -0.4 + 0.1 * k)
    hit("counter", W("L04", "ten"), 0.7)
    for k, w in enumerate(["baked", "into", "every"]):
        hit("pop", W("L04", w) - 0.04, 0.6, 0.2 + 0.1 * k)
    # s03 stakes
    for n in (0, 1):
        tw = W("L05", "Wrong", n)
        hit(boom(10 + n, 1.0), tw - 0.03, 0.75)
        hit(thock(20 + n), tw - 0.03, 0.9)
    # s04 reveal
    hit(swish(0.4, 30, True), S("s04-reveal") - 0.15, 0.6)
    hit("fill", W("L06", "measured"), 0.7)
    tx = W("L06", "Exactly.")
    hit("star", tx - 0.04, 0.9, 0.2, 0.4)
    hit("chime", tx - 0.02, 0.8, 0.0, 0.5)
    # s05 proof
    hit("counter", W("L07", "ten"), 0.6)
    hit("success", W("L07", "nothing.") + 0.2, 0.8, 0.0, 0.3)
    hit("pop", W("L07", "to") - 0.02, 0.5, -0.2)
    hit("pop", W("L07", "to") + 0.18, 0.5, 0.2)
    # s06 name
    hit("pop", S("s06-name") + 0.02, 0.8)
    hit(swish(0.35, 40, True), S("s06-name") + 0.06, 0.5)
    hit("chime", W("L08", "Code.") - 0.05, 0.7, 0.0, 0.4)
    # s07 speed
    tr = W("L10", "runs")
    hit("switch", tr, 0.7)
    hit(swish(0.3, 50, True), tr, 0.7, 0.3)
    hit("success", tr + 0.28, 0.7, 0.3)
    t63 = W("L10", "sixty-three")
    hit("counter", t63, 0.6)
    hit(thock(51), t63 + 0.6, 1.0)
    hit(boom(52, 0.8), t63 + 0.6, 0.45)
    # s08 products
    tp = W("L11", "products") - 0.08
    for k in range(5):
        hit("pop", tp + k * 0.1, 0.55, -0.4 + 0.2 * k)
    for w in ["Text,", "image", "audio"]:
        hit("pop", W("L12", w) - 0.05, 0.6, -0.4)
    tm = W("L12", "moderation,")
    for k in range(3):
        hit(swish(0.3, 60 + k, True), tm + k * 0.08, 0.45, -0.2 + 0.2 * k)
    hit("success", W("L12", "three") - 0.04, 0.8, 0.2, 0.3)
    t13 = L("L13")["t0"]
    for k in range(14):
        hit("tick", t13 + k * 0.06, 0.25, 0.1)
    ta = W("L13", "automates")
    for k in range(5):
        hit("pop", ta + k * 0.13, 0.5, -0.4 + 0.2 * k)
    hit("counter", W("L13", "ninety"), 0.6)
    hit(thock(61), W("L13", "ninety") + 0.52, 0.8)
    # s09 research
    tpub = W("L14", "Published.")
    hit(swish(0.35, 70, False), tpub - 0.12, 0.5)
    hit("snap", tpub + 0.48, 0.9)
    hit(thock(71), tpub + 0.48, 0.6)
    ttw = W("L14", "Twice.")
    hit(swish(0.35, 72, False), ttw - 0.12, 0.5, 0.3)
    hit("pop", ttw + 0.12, 0.8, 0.3)
    hit("chime", W("L15", "co-leads") - 0.06, 0.6, 0.2, 0.4)
    for k in range(6):
        hit("tick", W("L15", "co-leads") + 0.4 + k * 0.45, 0.22, -0.3 + 0.12 * k)
    # s10 payoff
    hit(thock(80), W("L16", "Fewer") - 0.05, 0.7)
    hit(thock(81), W("L16", "guesses.") - 0.05, 0.8)
    hit(swish(0.3, 82, True), W("L16", "guesses.") + 0.2, 0.4)
    hit("chime", W("L16", "trust."), 0.7, 0.0, 0.5)
    # s11 mission
    hit(swish(0.5, 90, True), S("s11-mission") - 0.05, 0.6)
    hit("pop", S("s11-mission") + 0.25, 0.4, -0.3)
    hit("star", W("L17", "humanity.") - 0.04, 0.7, 0.0, 0.5)
    # s12 end
    hit("pop", S("s12-end") + 0.06, 0.8)
    hit("star", W("L18", "together.") - 0.04, 0.6, 0.0, 0.4)
    hit("success", L("L18")["t1"] + 0.22, 0.6, 0.0, 0.3)
    return x.buf + reverb(send.buf, 0.4, d=2.2, tau=0.55, seed=211)


# ------------------------------------------------------------------------------------------ mix
def vo_track():
    sr, v = wavfile.read(ROOT / "out/vo_raw.wav")
    v = v.astype(np.float64)
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    v = filt(v, "highpass", 80)
    return np.stack([v, v])


def envelope(mono, att=0.01, rel=0.18):
    a, r = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    x = np.abs(mono)
    out = np.empty_like(x)
    cur = 0.0
    for i in range(len(x)):
        c = a if x[i] > cur else r
        cur = c * cur + (1 - c) * x[i]
        out[i] = cur
    return out


def limiter_gain(mix, ceiling_db=-1.2, release_s=0.1):
    ceiling = 10 ** (ceiling_db / 20)
    peak = np.max(np.abs(mix), axis=0)
    look = int(0.002 * SR)
    ahead = np.lib.stride_tricks.sliding_window_view(np.concatenate([peak, np.zeros(look)]), look + 1).max(axis=1)[:N]
    target = np.minimum(1.0, ceiling / np.maximum(ahead, 1e-9))
    g = np.empty(N)
    cur, rel = 1.0, np.exp(-1 / (release_s * SR))
    for i in range(N):
        cur = target[i] if target[i] < cur else rel * cur + (1 - rel) * target[i]
        g[i] = cur
    return g


def lufs(x, tmp):
    write_wav(tmp, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(tmp), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
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
    out = ROOT / "out"
    tmp = out / "_tmp.wav"
    vo, score, sfx = vo_track(), build_score(), build_sfx()
    # relative levels: VO at -17, music bed -25 (before ducking), SFX -27 LUFS
    for name, target in (("vo", -17.0), ("score", -25.0), ("sfx", -27.0)):
        x = {"vo": vo, "score": score, "sfx": sfx}[name]
        x *= 10 ** ((target - lufs(x * 0.5, tmp) - 6.02) / 20)
    # duck the music under the voice (~ -7 dB while she speaks)
    env = envelope(vo[0])
    env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
    duck = 1 - 0.55 * env
    score *= duck
    fade = np.ones(N)
    fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 1.5
    score *= fade
    sfx *= fade
    for _ in range(4):
        g = limiter_gain(vo + score + sfx)
        now = lufs((vo + score + sfx) * g, tmp)
        if abs(now + 16.0) < 0.2:
            break
        trim = 10 ** ((-16.0 - now) / 20)
        vo *= trim
        score *= trim
        sfx *= trim
    vo, score, sfx = vo * g, score * g, sfx * g
    tmp.unlink(missing_ok=True)
    adir = ROOT / "assets/audio"
    adir.mkdir(parents=True, exist_ok=True)
    for name, x in (("vo", vo), ("score", score), ("sfx", sfx)):
        write_wav(out / f"{name}.wav", x)
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(out / f"{name}.wav"), "-c:a", "flac",
                        "-compression_level", "8", str(adir / f"{name}.flac")], check=True)
    write_wav(out / "mix_preview.wav", vo + score + sfx)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(out / "mix_preview.wav"), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    talking = env > 0.3
    vo_rms = np.sqrt(np.mean(vo[0][talking] ** 2))
    music_rms = np.sqrt(np.mean(score[0][talking] ** 2))
    report = {"integrated_lufs": float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1]),
              "sample_peak_db": round(float(20 * np.log10(np.max(np.abs(vo + score + sfx)))), 2),
              "vo_over_music_db_while_speaking": round(float(20 * np.log10(vo_rms / music_rms)), 1),
              "duration_s": DUR}
    (out / "audio_report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report))


if __name__ == "__main__":
    main()
