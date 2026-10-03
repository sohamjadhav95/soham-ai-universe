"""Synthesizes the whole soundtrack for "Heartbeat Signal" — no samples.

Outputs (48 kHz, 24-bit stereo, 15.0 s, all starting at t=0):
  assets/audio/bed.wav   music: lub-dub heartbeat kick @120 BPM, drone, bass pulse, hats, mission pad
  assets/audio/sfx.wav   every sound effect, placed on the same cue table as the visuals
  out/mix_preview.wav    bed + sfx, for listening / loudness QA

The two stems share one limiter gain envelope, so bed + sfx in the composition equals the
limited preview mix exactly. Loudness target: -16 LUFS integrated, true peak <= -1 dBTP.

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
DUR = 15.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM  # 0.5 s

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "assets" / "audio"
OUT_DIR = ROOT / "out"

# --------------------------------------------------------------------------------------------
# Cue table — the single source of truth for sound placement. Times are seconds on the master
# timeline and mirror STORYBOARD.md frame boundaries (1.5, 3.5, 6.0, 7.0, 8.5, 10.0, 11.5, 13.5).
# --------------------------------------------------------------------------------------------
CUES = {
    # Frame 1 — hook (0–1.5)
    "hook_beeps": [0.04, 0.5, 1.0],          # monitor beep on each drawn heartbeat spike
    "hook_slam": 0.5,                          # "WHO BUILDS AI" lands
    "matters_hit": 1.0,                        # "matters." lands — sub boom
    # Frame 2 — identity (1.5–3.5)
    "identity_whoosh": 1.38,
    "letter_flips": [1.62 + i * 0.065 for i in range(11)],  # S O H A M · J A D H A V
    "bevel_shimmer": 2.55,
    # Frame 3 — A3 sub-pixel (3.5–6.0)
    "a3_cut": 3.5,
    "a3_snap": 3.8,                            # binary snap + error glitch
    "a3_cells": [3.8 + i * 0.018 for i in range(14)],
    "a3_refill": [4.5 + i * 0.07 for i in range(8)],  # coverage chime arpeggio
    "a3_counter": (5.1, 5.6),                  # 10.19% -> 0.03% roll
    "a3_chips": [5.62, 5.8],
    # Frame 4 — 63× (6.0–7.0)
    "speed_cut": 6.0,
    "speed_roll": (6.0, 6.43),
    "speed_slam": 6.45,
    "mask_steps": [6.05 + i * 0.06 for i in range(6)],
    # Frame 5 — PrediCT Studio / GSoC (7.0–8.5)
    "flap_cascade": (7.0, 7.85),
    "flap_land": 7.9,
    "studio_tilt": 7.25,
    # Frame 6 — Convo-Ease (8.5–10.0)
    "orbit_whooshes": [8.5, 8.68, 8.86],
    "orbit_snap": 9.25,
    "stamp": 9.6,
    # Frame 7 — Copilot (10.0–11.5)
    "typing": [10.02 + i * 0.035 for i in range(14)],
    "submit": 10.55,
    "pipeline_nodes": [10.62, 10.72, 10.82, 10.92, 11.02],
    "version_roll": (10.9, 11.2),
    "riser": (10.35, 11.5),
    # Frame 8 — mission (11.5–13.5)
    "drop": 11.5,
    "glass_rise": 11.6,
    "light_sweep": 12.6,
    # Frame 9 — end card (13.5–15.0)
    "end_lubs": [13.5, 14.25],                 # slower, calmer heartbeat (bed)
    "end_beep": 14.25,
    "end_shimmer": 13.62,
}

RNG_SEED = 20261003


def rng(seed: int) -> np.random.Generator:
    return np.random.default_rng(RNG_SEED + seed)


def t_axis(d: float) -> np.ndarray:
    return np.arange(int(d * SR)) / SR


def sos(kind: str, freq, order: int = 2):
    return butter(order, freq, btype=kind, fs=SR, output="sos")


def filt(x: np.ndarray, kind: str, freq, order: int = 2) -> np.ndarray:
    return sosfilt(sos(kind, freq, order), x)


def noise(d: float, seed: int) -> np.ndarray:
    return rng(seed).standard_normal(int(d * SR))


def sine_sweep(f: np.ndarray) -> np.ndarray:
    """Sine with an instantaneous-frequency array (phase-continuous)."""
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def svf_sweep(x: np.ndarray, f_start: float, f_end: float, q: float = 2.0, mode: str = "bp") -> np.ndarray:
    """Chamberlin state-variable filter with an exponential cutoff sweep (used for whooshes/risers)."""
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
        out[i] = bp if mode == "bp" else lp
    return out


def soft_sat(x: np.ndarray, drive: float = 1.5) -> np.ndarray:
    return np.tanh(drive * x) / np.tanh(drive)


# --------------------------------------------------------------------------------------------
# Instruments
# --------------------------------------------------------------------------------------------
def heart_thump(strength: float = 1.0, high: bool = False) -> np.ndarray:
    """One heart sound: pitched body thump + low-passed noise thud. 'dub' is higher and shorter."""
    d = 0.5
    t = t_axis(d)
    f0, fa, tau = (58, 105, 0.13) if high else (44, 92, 0.19)
    f = f0 + fa * np.exp(-t / 0.032)
    body = sine_sweep(f) * np.exp(-t / tau) * (1 - np.exp(-t / 0.0015))
    thud = filt(noise(d, 11 if high else 12), "lowpass", 190, 4) * np.exp(-t / 0.035) * 1.6
    return soft_sat((body + thud * 0.45) * strength, 1.8)


def lub_dub(strength: float = 1.0) -> list[tuple[np.ndarray, float, float]]:
    """(signal, offset, gain) pairs: lub on the beat, dub 0.16 s later."""
    return [(heart_thump(strength), 0.0, 1.0), (heart_thump(strength * 0.75, high=True), 0.16, 0.72)]


def monitor_beep(f: float = 988.0, d: float = 0.11) -> np.ndarray:
    t = t_axis(d)
    x = np.sin(2 * np.pi * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    env = np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.02)
    return x * env * 0.6


def sub_boom(d: float = 1.8, f_hi: float = 52, f_lo: float = 31) -> np.ndarray:
    t = t_axis(d)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.25)
    x = sine_sweep(f) * np.exp(-t / 0.55) * (1 - np.exp(-t / 0.003))
    click = filt(noise(0.02, 21), "highpass", 1500) * np.exp(-t_axis(0.02) / 0.003) * 0.4
    x[: len(click)] += click
    return soft_sat(x, 1.4)


def impact(d: float = 1.0, seed: int = 31) -> np.ndarray:
    t = t_axis(d)
    burst = filt(noise(d, seed), "bandpass", (70, 2400), 2) * np.exp(-t / 0.09)
    low = sine_sweep(70 + 60 * np.exp(-t / 0.05)) * np.exp(-t / 0.22)
    crack = filt(noise(d, seed + 1), "highpass", 3000) * np.exp(-t / 0.008) * 0.6
    return soft_sat(0.7 * burst + 0.9 * low + crack, 1.6) * 0.9


def whoosh(d: float = 0.55, up: bool = True, seed: int = 41) -> np.ndarray:
    x = noise(d, seed)
    y = svf_sweep(x, 300, 5200, 1.6) if up else svf_sweep(x, 5200, 300, 1.6)
    t = t_axis(d)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    if up:
        env *= np.clip(t / d, 0, 1) ** 0.6
    return y * env * 0.9


def tick(f: float = 2600, d: float = 0.014, seed: int = 51) -> np.ndarray:
    t = t_axis(d)
    click = filt(noise(d, seed), "highpass", 2500) * np.exp(-t / 0.0025)
    blip = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004)
    return (0.6 * click + 0.5 * blip) * 0.7


def flap_clack(seed: int) -> np.ndarray:
    d = 0.06
    t = t_axis(d)
    x = np.zeros(len(t))
    for off, g in ((0.0, 1.0), (0.017, 0.55)):
        i = int(off * SR)
        tt = t[: len(t) - i]
        x[i:] += g * filt(noise(len(tt) / SR, seed + int(off * 1000)), "bandpass", (1400, 6000)) * np.exp(-tt / 0.004)
    x += 0.35 * np.sin(2 * np.pi * 860 * t) * np.exp(-t / 0.012)
    return x * 0.55


def glitch(d: float = 0.22, seed: int = 61) -> np.ndarray:
    r = rng(seed)
    out = np.zeros(int(d * SR))
    seg = int(0.028 * SR)
    for k in range(0, len(out) - seg, seg):
        f = r.uniform(180, 2200)
        tt = t_axis(seg / SR)
        sq = np.sign(np.sin(2 * np.pi * f * tt))
        sq = np.repeat(sq[::8], 8)[:seg]  # sample-rate reduction
        out[k:k + seg] = np.round(sq * 7) / 7 * r.uniform(0.3, 0.8)
    return out * 0.32


def fm_bell(f: float, d: float = 0.9, index: float = 2.2) -> np.ndarray:
    t = t_axis(d)
    mod = np.sin(2 * np.pi * f * 1.4 * t) * index * np.exp(-t / 0.18)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.35) * (1 - np.exp(-t / 0.002))
    return x * 0.35


def shimmer(d: float = 1.4, seed: int = 71) -> np.ndarray:
    t = t_axis(d)
    air = filt(noise(d, seed), "highpass", 6500) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 0.25
    x = air.copy()
    for k, f in enumerate((1760, 2217, 2637, 3520)):
        b = fm_bell(f, d - 0.04 * k, 1.1) * 0.6
        o = int(0.04 * k * SR)
        x[o:o + len(b)] += b[: len(x) - o]
    return x * 0.8


def stamp(seed: int = 81) -> np.ndarray:
    d = 0.4
    t = t_axis(d)
    thud = sine_sweep(95 + 70 * np.exp(-t / 0.02)) * np.exp(-t / 0.07)
    slap = filt(noise(d, seed), "bandpass", (600, 4000)) * np.exp(-t / 0.012)
    return soft_sat(thud + 0.7 * slap, 1.5) * 0.8


def riser(d: float, seed: int = 91) -> np.ndarray:
    t = t_axis(d)
    swept = svf_sweep(noise(d, seed), 250, 7000, 3.0)
    tone = sine_sweep(180 * (6.0 ** (t / d))) * 0.25
    env = (t / d) ** 2.2
    return (swept * 0.8 + tone) * env


def hat(seed: int, open_: bool = False) -> np.ndarray:
    d = 0.18 if open_ else 0.05
    t = t_axis(d)
    return filt(noise(d, seed), "highpass", 7500, 4) * np.exp(-t / (0.06 if open_ else 0.018))


def additive_saw(f: float, d: float, harmonics: int = 24) -> np.ndarray:
    t = t_axis(d)
    x = np.zeros(len(t))
    for h in range(1, harmonics + 1):
        if f * h > 9000:
            break
        x += np.sin(2 * np.pi * f * h * t) / h
    return x


# --------------------------------------------------------------------------------------------
# Bus helpers
# --------------------------------------------------------------------------------------------
class Bus:
    def __init__(self) -> None:
        self.buf = np.zeros((2, N))

    def add(self, sig: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0) -> None:
        i = int(round(at * SR))
        if i >= N:
            return
        sig = sig[: N - i]
        theta = (pan + 1) * np.pi / 4  # constant-power pan
        self.buf[0, i:i + len(sig)] += sig * gain * np.cos(theta)
        self.buf[1, i:i + len(sig)] += sig * gain * np.sin(theta)


def reverb_ir(d: float = 2.4, seed: int = 101) -> np.ndarray:
    t = t_axis(d)
    ir = np.stack([noise(d, seed), noise(d, seed + 1)]) * np.exp(-t / 0.55)
    ir = np.stack([filt(ch, "lowpass", 5200) for ch in ir])
    ir[:, : int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))  # pre-delay softening
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def apply_reverb(dry: np.ndarray, mix: float) -> np.ndarray:
    ir = reverb_ir()
    wet = np.stack([fftconvolve(dry[c], ir[c])[:N] for c in range(2)])
    return wet * mix


# --------------------------------------------------------------------------------------------
# Score
# --------------------------------------------------------------------------------------------
def build_bed() -> np.ndarray:
    bed = Bus()
    # Hook heartbeats under the drawn ECG spikes (quiet — the beeps lead), then the groove.
    for at, s in ((0.5, 0.55), (1.0, 0.7)):
        for sig, off, g in lub_dub(s):
            bed.add(sig, at + off, g)
    # Groove: lub-dub on every beat 1.5 → 11.5 (the drop takes over at 11.5).
    k = 0
    at = 1.5
    while at < 11.5 - 1e-6:
        accent = 1.0 if k % 2 == 0 else 0.82
        for sig, off, g in lub_dub(accent):
            bed.add(sig, at + off, g * 0.95)
        at += BEAT
        k += 1
    # Mission: half-time heartbeat for warmth; end card: the last two calm beats.
    for at in (12.0, 13.0):
        for sig, off, g in lub_dub(0.7):
            bed.add(sig, at + off, g * 0.7)
    for at in CUES["end_lubs"]:
        for sig, off, g in lub_dub(0.6):
            bed.add(sig, at + off, g * 0.75)

    # Drone: A1 + A2, slow tremolo, fades in at 1.5, swells into the drop, decays at the end.
    t = t_axis(DUR)
    drone = np.sin(2 * np.pi * 55 * t) + 0.35 * np.sin(2 * np.pi * 110 * t + 0.3)
    drone *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.5 * t)
    env = np.interp(t, [0, 1.4, 2.2, 11.4, 11.5, 13.8, 15.0], [0, 0, 0.55, 0.75, 0.45, 0.35, 0])
    bed.add(filt(drone * env, "lowpass", 400) * 0.22, 0)

    # Bass pulse (8ths, A1 → E1 → F#1 → D1 every bar), ducked by each lub for pump.
    roots = [55.0, 41.2, 46.25, 36.71]
    at = 3.5
    while at < 11.5 - 1e-6:
        bar = int((at - 3.5) // (4 * BEAT))
        f = roots[bar % 4]
        d = BEAT / 2 * 0.92
        tt = t_axis(d)
        note = filt(additive_saw(f, d, 8), "lowpass", 220) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.2)
        beat_pos = ((at - 3.5) / (BEAT / 2)) % 2
        bed.add(note, at, 0.32 if beat_pos == 1 else 0.16)
        at += BEAT / 2

    # Hats: closed 16ths with off-beat accents across the proof montage; open hat into the drop.
    at = 3.5
    k = 0
    while at < 11.5 - 1e-6:
        g = 0.16 if k % 4 == 2 else (0.07 if k % 2 == 1 else 0.05)
        bed.add(hat(200 + k), at, g, pan=0.25 if k % 2 else -0.15)
        at += BEAT / 4
        k += 1

    # Mission pad: A major add9, detuned saws, slow attack — the warm turn.
    pad = np.zeros(int(3.5 * SR))
    for f in (110.0, 164.81, 220.0, 246.94, 277.18):
        for det in (-0.12, 0.0, 0.11):
            pad += additive_saw(f * 2 ** (det / 12), 3.5, 18)
    tp = t_axis(3.5)
    pad = filt(pad, "lowpass", 1400) * np.interp(tp, [0, 0.45, 2.6, 3.5], [0, 1, 0.8, 0]) * 0.05
    bed.add(pad, 11.5, 1.0, pan=-0.1)
    bed.add(pad, 11.52, 0.85, pan=0.15)

    dry = bed.buf
    return dry + apply_reverb(dry * 0.6, 0.12)


def build_sfx() -> np.ndarray:
    sfx = Bus()
    send = Bus()  # reverb send for impacts / beeps / bells

    for at in CUES["hook_beeps"]:
        b = monitor_beep()
        sfx.add(b, at, 0.55)
        send.add(b, at, 0.5)
    sfx.add(impact(0.8, 31), CUES["hook_slam"], 0.55)
    boom = sub_boom()
    sfx.add(boom, CUES["matters_hit"], 0.9)
    send.add(impact(1.0, 33), CUES["matters_hit"], 0.4)
    sfx.add(riser(1.0, 95), 0.0, 0.18)

    sfx.add(whoosh(0.5, True, 41), CUES["identity_whoosh"], 0.5)
    for k, at in enumerate(CUES["letter_flips"]):
        sfx.add(tick(1200 + 40 * k, 0.02, 500 + k), at, 0.35, pan=-0.6 + k * 0.12)
    sh = shimmer(1.0, 71)
    sfx.add(sh, CUES["bevel_shimmer"], 0.35)
    send.add(sh, CUES["bevel_shimmer"], 0.4)

    sfx.add(impact(0.7, 35), CUES["a3_cut"], 0.45)
    sfx.add(glitch(0.25, 61), CUES["a3_snap"], 0.55)
    for k, at in enumerate(CUES["a3_cells"]):
        sfx.add(tick(3000, 0.012, 600 + k), at, 0.22, pan=-0.3 + 0.05 * k)
    for k, (at, f) in enumerate(zip(CUES["a3_refill"], (880, 987.8, 1108.7, 1318.5, 1480, 1760, 1975.5, 2217.5))):
        bell = fm_bell(f, 0.7, 1.6)
        sfx.add(bell, at, 0.42, pan=-0.4 + 0.11 * k)
        send.add(bell, at, 0.5)
    a, b = CUES["a3_counter"]
    for k, at in enumerate(np.arange(a, b, 0.032)):
        sfx.add(tick(2200 + 30 * k, 0.012, 700 + k), float(at), 0.25)
    for at in CUES["a3_chips"]:
        sfx.add(fm_bell(1318.5, 0.35, 0.8), at, 0.3)

    sfx.add(impact(0.9, 37), CUES["speed_cut"], 0.5)
    a, b = CUES["speed_roll"]
    for k, at in enumerate(np.arange(a, b, 0.028)):
        sfx.add(tick(1800 + 45 * k, 0.012, 800 + k), float(at), 0.28)
    for k, at in enumerate(CUES["mask_steps"]):
        st = filt(noise(0.05, 900 + k), "bandpass", (300, 1600)) * np.exp(-t_axis(0.05) / 0.012)
        sfx.add(st, at, 0.25)
    sfx.add(sub_boom(1.4, 60, 34), CUES["speed_slam"], 0.8)
    sfx.add(impact(0.9, 39), CUES["speed_slam"], 0.6)
    send.add(impact(0.9, 39), CUES["speed_slam"], 0.35)

    a, b = CUES["flap_cascade"]
    for k, at in enumerate(np.arange(a, b, 0.024)):
        sfx.add(flap_clack(1000 + k), float(at), 0.4 * (0.7 + 0.3 * np.sin(k)), pan=float(np.sin(k * 1.7) * 0.5))
    sfx.add(flap_clack(1999), CUES["flap_land"], 0.7)
    sfx.add(whoosh(0.45, False, 43), CUES["studio_tilt"], 0.3)

    for k, at in enumerate(CUES["orbit_whooshes"]):
        sfx.add(whoosh(0.4, k % 2 == 0, 45 + k), at, 0.4, pan=(-0.6, 0.6, 0.0)[k])
    sfx.add(glitch(0.16, 63), CUES["orbit_snap"], 0.5)
    sfx.add(sub_boom(1.0, 58, 36), CUES["orbit_snap"], 0.55)
    sfx.add(stamp(), CUES["stamp"], 0.75)

    for k, at in enumerate(CUES["typing"]):
        sfx.add(tick(1500 + (k * 137) % 600, 0.016, 1100 + k), at, 0.3, pan=-0.2 + (k % 3) * 0.2)
    sfx.add(flap_clack(1200), CUES["submit"], 0.6)
    for k, (at, f) in enumerate(zip(CUES["pipeline_nodes"], (659.3, 784.0, 880.0, 1046.5, 1318.5))):
        bell = fm_bell(f, 0.45, 1.2)
        sfx.add(bell, at, 0.35, pan=-0.5 + 0.25 * k)
        send.add(bell, at, 0.3)
    a, b = CUES["version_roll"]
    for k, at in enumerate(np.arange(a, b, 0.03)):
        sfx.add(tick(2600, 0.01, 1300 + k), float(at), 0.2)
    a, b = CUES["riser"]
    sfx.add(riser(b - a, 97), a, 0.42)

    boom = sub_boom(2.6, 48, 28)
    sfx.add(boom, CUES["drop"], 1.0)
    sfx.add(impact(1.2, 41), CUES["drop"], 0.6)
    send.add(impact(1.2, 41), CUES["drop"], 0.7)
    gl = shimmer(1.6, 73)
    sfx.add(gl, CUES["glass_rise"], 0.3)
    send.add(gl, CUES["glass_rise"], 0.5)
    sfx.add(whoosh(0.7, True, 49), CUES["light_sweep"], 0.22)

    sh = shimmer(1.4, 75)
    sfx.add(sh, CUES["end_shimmer"], 0.3)
    send.add(sh, CUES["end_shimmer"], 0.5)
    b = monitor_beep(988, 0.14)
    sfx.add(b, CUES["end_beep"], 0.5)
    send.add(b, CUES["end_beep"], 0.6)

    return sfx.buf + apply_reverb(send.buf, 0.55)


# --------------------------------------------------------------------------------------------
# Mastering: shared limiter envelope + loudness normalization
# --------------------------------------------------------------------------------------------
def limiter_gain(mix: np.ndarray, ceiling_db: float = -1.2, release_s: float = 0.08) -> np.ndarray:
    ceiling = 10 ** (ceiling_db / 20)
    peak = np.max(np.abs(mix), axis=0)
    # 2 ms lookahead: take the max over the upcoming window so gain drops before the transient.
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


def integrated_lufs(path: Path) -> float:
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1])


def write_wav(path: Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(x, -1, 1)
    ints = (pcm.T * (2 ** 23 - 1)).astype("<i4").reshape(-1)
    # 24-bit PCM: keep the low three bytes of each little-endian int32 sample.
    raw = np.frombuffer(ints.tobytes(), dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(raw)


def main() -> None:
    bed = build_bed()
    sfx = build_sfx()

    # Fade the last 120 ms so the loop point is clean.
    fade = np.ones(N)
    fade[-int(0.12 * SR):] = np.linspace(1, 0, int(0.12 * SR))
    bed *= fade
    sfx *= fade

    # Loudness: measure the raw mix, gain toward -16 LUFS, then shared limiter, then re-measure.
    OUT_DIR.mkdir(exist_ok=True)
    tmp = OUT_DIR / "_raw_mix.wav"
    write_wav(tmp, (bed + sfx) * 0.5)
    lufs = integrated_lufs(tmp) + 20 * np.log10(2)  # undo the 0.5 safety scale
    gain = 10 ** ((-16.0 - lufs) / 20)
    bed *= gain
    sfx *= gain
    for _ in range(3):  # limiter costs a little loudness; converge on target
        g = limiter_gain(bed + sfx)
        write_wav(tmp, (bed + sfx) * g)
        lufs_now = integrated_lufs(tmp)
        if abs(lufs_now + 16.0) < 0.3:
            break
        trim = 10 ** ((-16.0 - lufs_now) / 20)
        bed *= trim
        sfx *= trim
    bed *= g
    sfx *= g
    tmp.unlink(missing_ok=True)

    write_wav(AUDIO_DIR / "bed.wav", bed)
    write_wav(AUDIO_DIR / "sfx.wav", sfx)
    write_wav(OUT_DIR / "mix_preview.wav", bed + sfx)
    final = integrated_lufs(OUT_DIR / "mix_preview.wav")
    peak_db = 20 * np.log10(np.max(np.abs(bed + sfx)) + 1e-12)
    report = {"integrated_lufs": round(final, 2), "sample_peak_db": round(float(peak_db), 2), "duration_s": DUR}
    (OUT_DIR / "audio_report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report))


if __name__ == "__main__":
    main()
