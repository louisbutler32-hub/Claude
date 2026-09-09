# How Long Would You Last on Every Planet?

`PlanetsVideo` — 1920×1080, 30 fps, exactly 3:00 (Mercury, Venus, Mars).
Rendered entirely from code: no stock footage, no purchased assets.

```bash
npm run planets        # render out/planets.mp4
npm run planets:still  # one frame, for a quick look
npm start              # Remotion Studio, scrub the timeline
```

## How it fits together

| file | what it holds |
|---|---|
| `scripts-vo/planets-survival.json` | the script — one entry per narration line, with the scene it drives and the pause after it |
| `scripts/make-vo.py` | synthesises the narration (local Kokoro TTS, `am_liam`), lays the takes out and scales the pauses so the track lands on 180.000 s |
| `src/planets/timing.json` | generated: `{ start, end }` for every line — the master clock |
| `src/planets/kit.tsx` | the drawing kit: wobbly terrain, doodle sun and planets, notes, arrows, thermometer, the survival stamp |
| `src/planets/character.tsx` | the astronaut (six faces, four arm poses), the lander, the Venera probe, the habitat |
| `src/planets/scenes.tsx` | one component per line, plus the scene registry |
| `src/planets/PlanetsVideo.tsx` | mounts each line as a `Sequence` at its narration time |

Change a line of narration in the JSON, re-run `make-vo.py`, and every cut
moves with the voice — the timings are never typed by hand.

## Regenerating the narration

`make-vo.py` needs the Kokoro TTS model, which is too big for the repo and
lives in a gitignored `.tts/` folder. To set it up once:

```bash
pip install numpy onnxruntime soundfile kokoro-onnx
mkdir -p .tts && cd .tts
HF=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
curl -L -o kokoro-v1.0.onnx $HF/onnx/model.onnx
for v in am_liam am_michael bm_george; do curl -L -o $v.bin $HF/voices/$v.bin; done
python3 -c "import numpy as np,glob,os; np.savez('voices-v1.0.bin', \
  **{os.path.basename(f)[:-4]: np.fromfile(f,dtype=np.float32).reshape(510,1,256) \
     for f in glob.glob('*.bin')})"
mv voices-v1.0.bin.npz voices-v1.0.bin
```

`am_liam` is the voice you asked for. `speed` in the script JSON is tuned
per voice so the read fills three minutes with natural pauses: Liam is quick,
so at 0.88 the gaps would have had to stretch to twice their written length.
0.83 puts the gap scale back near 0.9.

There is no music. The reference channel runs its narration dry — the pauses
between its lines are true silence — so the video does the same. (An ambient
bed generator lived at `scripts/make-music.py` if you ever want it back:
`git show fb96b21:scripts/make-music.py`.)

## The look

White paper, `#111` marker outlines with round caps, flat fills, and
Comic Relief for every word on screen (`public/fonts/`). All the wobble is
seeded (`kit.tsx`'s `rng`) so a hand-drawn line is identical on every frame
instead of boiling.

Planet photographs in `public/assets/planets/` are public-domain NASA images
from Wikimedia Commons — Mercury (MESSENGER), Venus (Magellan/JPL),
Mars (Hubble) and Earth (Apollo 17) — cut to discs by fitting the limb.

## Adding the rest of the planets

The video stops at 3:00 mid-Mars-section by design. To continue, append
lines to `scripts-vo/planets-survival.json` (Jupiter, Saturn, Uranus,
Neptune), add a component per new scene to `scenes.tsx` and its entry in
`SCENES`, raise `PLANETS_DURATION_SECONDS`, and re-run `make-vo.py`.
