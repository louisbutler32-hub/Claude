#!/usr/bin/env python3
"""Voice Studio: a small web page for making voice-overs with the local Kokoro model.

    python3 tools/voice-studio/server.py            # http://localhost:8765
    python3 tools/voice-studio/server.py --port 9000

Needs `pip install kokoro-onnx soundfile` and the two model files in .tts/
(kokoro-v1.0.onnx and voices-v1.0.bin, from the kokoro-onnx GitHub
releases page). Same model and voices as scripts/make-vo.py.

Paste a script, pick a voice and speed, and it renders one MP3. Each
paragraph becomes one take, with a pause between takes. Renders are kept
in out/voice-studio/. Kokoro output is for timing and drafts; see
CLAUDE.md on what may ship.
"""
import argparse
import io
import json
import os
import re
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TTS = os.path.join(ROOT, ".tts")
OUT = os.path.join(ROOT, "out", "voice-studio")
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 24000

LANGS = {"a": ("en-us", "American English"), "b": ("en-gb", "British English"),
         "e": ("es", "Spanish"), "f": ("fr-fr", "French"), "h": ("hi", "Hindi"),
         "i": ("it", "Italian"), "p": ("pt-br", "Portuguese (BR)")}

kokoro = Kokoro(os.path.join(TTS, "kokoro-v1.0.onnx"), os.path.join(TTS, "voices-v1.0.bin"))
lock = threading.Lock()


def voices():
    out = []
    for v in sorted(kokoro.get_voices()):
        lang = LANGS.get(v[0])
        if not lang:
            continue  # Japanese / Mandarin voices need extra phonemiser packages
        gender = "Female" if v[1:2] == "f" else "Male"
        out.append({"id": v, "name": v.split("_", 1)[1].title(), "lang": lang[1], "gender": gender})
    return out


def trim(x, thresh=0.008, pad=0.04):
    loud = np.where(np.abs(x) > thresh)[0]
    if len(loud) == 0:
        return x
    p = int(pad * SR)
    return x[max(0, loud[0] - p):min(len(x), loud[-1] + p)]


def synth(text, voice, speed):
    lang = LANGS.get(voice[0], ("en-us",))[0]
    with lock:
        samples, sr = kokoro.create(text, voice=voice, speed=speed, lang=lang)
    assert sr == SR
    return trim(np.asarray(samples, dtype=np.float32))


def render(script, voice, speed, gap):
    paras = [p.strip() for p in re.split(r"\n\s*\n|\n", script) if p.strip()]
    if not paras:
        raise ValueError("The script is empty.")
    pieces, timing, cursor = [], [], 0.0
    silence = np.zeros(int(gap * SR), dtype=np.float32)
    for i, p in enumerate(paras):
        a = synth(p, voice, speed)
        if i:
            pieces.append(silence)
            cursor += gap
        pieces.append(a)
        timing.append({"line": i + 1, "text": p, "start": round(cursor, 3), "end": round(cursor + len(a) / SR, 3)})
        cursor += len(a) / SR
    pieces.append(np.zeros(int(0.3 * SR), dtype=np.float32))
    audio = np.concatenate(pieces)
    os.makedirs(OUT, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    slug = re.sub(r"[^a-z0-9]+", "-", paras[0].lower())[:32].strip("-") or "vo"
    base = os.path.join(OUT, "%s-%s-%s" % (stamp, voice, slug))
    buf = io.BytesIO()
    sf.write(buf, audio, SR, format="WAV")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "wav", "-i", "pipe:0",
                    "-codec:a", "libmp3lame", "-b:a", "192k", base + ".mp3"], input=buf.getvalue(), check=True)
    json.dump({"voice": voice, "speed": speed, "gap": gap, "lines": timing}, open(base + ".json", "w"), indent=1)
    return {"file": os.path.basename(base) + ".mp3", "seconds": round(len(audio) / SR, 2), "lines": timing}


def history():
    if not os.path.isdir(OUT):
        return []
    files = sorted((f for f in os.listdir(OUT) if f.endswith(".mp3")), reverse=True)[:30]
    return [{"file": f, "kb": os.path.getsize(os.path.join(OUT, f)) // 1024} for f in files]


class Handler(BaseHTTPRequestHandler):
    def send(self, code, body, ctype="application/json", extra=None):
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode()
        elif isinstance(body, str):
            body = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path in ("/", "/index.html"):
            return self.send(200, open(os.path.join(HERE, "index.html"), "rb").read(), "text/html; charset=utf-8")
        if u.path == "/api/voices":
            return self.send(200, voices())
        if u.path == "/api/history":
            return self.send(200, history())
        if u.path == "/api/preview":
            q = parse_qs(u.query)
            v = q.get("voice", ["am_liam"])[0]
            text = q.get("text", ["This is how I sound. Ready when you are."])[0][:300]
            a = synth(text, v, float(q.get("speed", ["1"])[0]))
            buf = io.BytesIO()
            sf.write(buf, a, SR, format="WAV")
            return self.send(200, buf.getvalue(), "audio/wav")
        if u.path.startswith("/files/"):
            name = os.path.basename(u.path[7:])
            path = os.path.join(OUT, name)
            if not name.endswith(".mp3") or not os.path.isfile(path):
                return self.send(404, {"error": "not found"})
            dl = parse_qs(u.query).get("download")
            extra = {"Content-Disposition": 'attachment; filename="%s"' % name} if dl else {}
            return self.send(200, open(path, "rb").read(), "audio/mpeg", extra)
        self.send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/api/render":
            return self.send(404, {"error": "not found"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            res = render(body.get("script", ""), body.get("voice", "am_liam"),
                         float(body.get("speed", 1.0)), float(body.get("gap", 0.35)))
            self.send(200, res)
        except ValueError as e:
            self.send(400, {"error": str(e)})
        except Exception as e:  # keep the page alive and say what broke
            self.send(500, {"error": "Render failed: %s" % e})

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--host", default="0.0.0.0")
    a = ap.parse_args()
    print("Voice Studio on http://localhost:%d  (%d voices)" % (a.port, len(voices())), flush=True)
    ThreadingHTTPServer((a.host, a.port), Handler).serve_forever()
