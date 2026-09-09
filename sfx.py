"""Procedural sound effects. No samples - everything synthesised with numpy."""
import numpy as np
SR = 22050


def _t(d):
    return np.arange(int(d * SR)) / SR


def _env(n, a=.005, r=.25, curve=2.0):
    """Attack/release envelope. Ramps are clamped to n so short sounds
    (release longer than the sound itself) still produce a valid envelope."""
    if n <= 0:
        return np.ones(0, np.float32)
    e = np.ones(n)
    ai = min(max(1, int(a * SR)), n)
    ri = min(max(1, int(r * SR)), n)
    e[:ai] = np.linspace(0, 1, ai)
    e[-ri:] *= np.linspace(1, 0, ri) ** curve
    return e


def _noise(d, seed=0):
    return np.random.default_rng(seed).standard_normal(int(d * SR)).astype(np.float32)


def _lp(x, a=.2):
    """One-pole low pass, vectorised via lfilter-style recursion."""
    from scipy.signal import lfilter
    return lfilter([a], [1, -(1 - a)], x).astype(np.float32)


def _sweep(d, f0, f1):
    t = _t(d)
    f = np.geomspace(max(f0, 1), max(f1, 1), len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def whoosh(d=.34, seed=1, up=True):
    n = _noise(d, seed)
    t = np.linspace(0, 1, len(n))
    a = .30 if up else .06
    y = _lp(n, a) * (t if up else (1 - t)) + _lp(n, .12)
    return (y * _env(len(n), .02, .22) * np.sin(np.pi * t) ** .6).astype(np.float32) * .9


def pop(d=.09, f=760, seed=2):
    t = _t(d)
    y = np.sin(2 * np.pi * f * t * np.exp(-3.2 * t)) + .3 * _noise(d, seed) * np.exp(-45 * t)
    return (y * _env(len(t), .001, .07, 3)).astype(np.float32) * .55


def click(d=.05, f=1500):
    t = _t(d)
    return (np.sin(2 * np.pi * f * t) * np.exp(-60 * t)).astype(np.float32) * .4


def ding(d=.9, f=880):
    t = _t(d)
    y = sum(np.sin(2 * np.pi * f * m * t) * w for m, w in [(1, 1), (2.01, .45), (3.02, .22), (4.5, .1)])
    return (y * np.exp(-4.2 * t)).astype(np.float32) * .32


def thud(d=.55, f=92, seed=3):
    t = _t(d)
    y = np.sin(2 * np.pi * f * t * np.exp(-2.4 * t)) * np.exp(-7 * t)
    y += .45 * _lp(_noise(d, seed), .08) * np.exp(-16 * t)
    return y.astype(np.float32) * .85


def boom(d=1.5, seed=4):
    t = _t(d)
    y = np.sin(2 * np.pi * 44 * t * np.exp(-1.2 * t)) * np.exp(-2.6 * t)
    y += .6 * _lp(_noise(d, seed), .03) * np.exp(-3.4 * t)
    return y.astype(np.float32) * .95


def beep(d=.16, f=1050):
    t = _t(d)
    return (np.sign(np.sin(2 * np.pi * f * t)) * .35 * _env(len(t), .004, .06)).astype(np.float32)


def alarm(d=1.0, f=760):
    t = _t(d)
    g = (np.sin(2 * np.pi * 5.5 * t) > 0).astype(np.float32)
    return (np.sin(2 * np.pi * f * t) * g * _env(len(t), .01, .2)).astype(np.float32) * .28


def wind(d=3.0, seed=5, level=.5):
    n = _lp(_noise(d, seed), .035)
    t = np.linspace(0, 1, len(n))
    mod = .6 + .4 * np.sin(2 * np.pi * .5 * t * d)
    return (n * mod * _env(len(n), .5, .8)).astype(np.float32) * level * 2.2


def rumble(d=2.2, seed=6, level=.6):
    n = _lp(_noise(d, seed), .012)
    return (n * _env(len(n), .35, .7)).astype(np.float32) * level * 3.0


def sparkle(d=1.1, seed=7):
    out = np.zeros(int(d * SR), np.float32)
    rng = np.random.default_rng(seed)
    for _ in range(9):
        f = 1400 + rng.random() * 2200
        st = int(rng.random() * .6 * SR)
        s = ding(.42, f) * .5
        n = min(len(s), len(out) - st)
        out[st:st + n] += s[:n]
    return out


def hiss(d=1.4, seed=8, level=.5):
    n = _noise(d, seed)
    y = n - _lp(n, .25)                      # high-passed -> escaping-gas hiss
    return (y * _env(len(y), .06, .6)).astype(np.float32) * level


def zap(d=.4, seed=9):
    t = _t(d)
    y = _sweep(d, 2600, 180) * np.exp(-6 * t) + .4 * _noise(d, seed) * np.exp(-22 * t)
    return y.astype(np.float32) * .5


def riser(d=1.6, seed=10):
    t = _t(d)
    y = _sweep(d, 120, 1500) * .35
    n = _lp(_noise(d, seed), .12) * np.linspace(0, 1, int(d * SR)) ** 2
    return ((y + n) * _env(len(t), .3, .12)).astype(np.float32) * .55


def flyby(d=1.2, seed=11):
    n = _lp(_noise(d, seed), .18)
    t = np.linspace(0, 1, len(n))
    return (n * np.sin(np.pi * t) ** 1.5).astype(np.float32) * .75


class Bed:
    """Simple mixer: place cues on a timeline."""

    def __init__(self, seconds):
        self.buf = np.zeros(int(seconds * SR) + SR, np.float32)

    def add(self, t, sound, gain=1.0):
        i = int(max(0, t) * SR)
        n = min(len(sound), len(self.buf) - i)
        if n > 0:
            self.buf[i:i + n] += sound[:n] * gain

    def out(self, peak=.55):
        p = np.abs(self.buf).max() or 1.0
        return (self.buf / p * peak).astype(np.float32)
