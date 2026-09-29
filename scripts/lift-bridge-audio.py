#!/usr/bin/env python3
"""Soundtrack for "Java Players vs Bedrock Players: bridging".

The Short is a shot-for-shot remake of GarrettTheCarrot's "Bridging in
Minecraft (REANIMATED)" and plays on that video's own soundtrack, lifted
untouched so every sound stays on the frame the remake's beats.json was
measured against. It is decoded to WAV rather than stream-copied: ffmpeg
trims the AAC encoder's priming samples on decode, where a copied .m4a
carries them into the render and lands every sound 28 ms late.

Put the source video (the owner's download, never committed) at
public/audio/src/garrett-bridging-reanimated.mp4, then run this.

Writes public/audio/bridge-mix.wav.

  --mux    also lays it under out/java-vs-bedrock-bridging-silent.mp4 and
           writes out/java-vs-bedrock-bridging.mp4. ffmpeg does the final
           mux, not the renderer: the renderer's AAC has no priming edit
           list and plays 28 ms late, where this one measures sample-exact
           against the reference.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src", "garrett-bridging-reanimated.mp4")
OUT = os.path.join(ROOT, "public", "audio", "bridge-mix.wav")
FF = os.environ.get("FFMPEG", "ffmpeg")

if not os.path.exists(SRC):
    sys.exit("missing public/audio/src/garrett-bridging-reanimated.mp4")
subprocess.run([FF, "-loglevel", "error", "-y", "-i", SRC, "-vn", "-c:a", "pcm_s16le", OUT], check=True)
print("wrote", os.path.relpath(OUT, ROOT))

if "--mux" in sys.argv:
    silent = os.path.join(ROOT, "out", "java-vs-bedrock-bridging-silent.mp4")
    final = os.path.join(ROOT, "out", "java-vs-bedrock-bridging.mp4")
    subprocess.run([FF, "-loglevel", "error", "-y", "-i", silent, "-i", OUT, "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", final], check=True)
    print("wrote", os.path.relpath(final, ROOT))
