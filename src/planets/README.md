# How Long Would You Last on Every Planet?

`PlanetsVideo` — 1920×1080, 30 fps, exactly 8:00, all eight planets.
Rendered entirely from code: no stock footage, no purchased assets.

```bash
npm run planets        # render out/planets.mp4
npm run planets:still  # one frame, for a quick look
npm start              # Remotion Studio, scrub the timeline
```

| chapter | in | out |
|---|---|---|
| Mercury | 0:00 | 1:08 |
| Venus | 1:08 | 2:00 |
| Mars | 2:00 | 3:04 |
| Jupiter | 3:04 | 4:39 |
| Saturn | 4:39 | 6:02 |
| Uranus | 6:02 | 6:59 |
| Neptune | 6:59 | 7:39 |
| the board | 7:39 | 8:00 |

## How it fits together

| file | what it holds |
|---|---|
| `scripts-vo/planets-survival.json` | the script — one entry per narration line, with the scene it drives and the pause after it |
| `scripts/make-vo.py` | synthesises the narration (local Kokoro TTS, `am_liam`), lays the takes out and scales the pauses so the track lands on 480.000 s |
| `src/planets/timing.json` | generated: `{ start, end }` for every line — the master clock |
| `src/planets/kit.tsx` | the drawing kit: wobbly terrain, doodle sun and planets, notes, arrows, thermometer, the survival stamp |
| `src/planets/character.tsx` | the astronaut (six faces, four arm poses), the lander, the Venera probe, the habitat |
| `src/planets/scenes.tsx` | the rocky planets — one component per line — plus the scene registry |
| `src/planets/outer.tsx` | the gas and ice giants, plus the closing board: cross-sections, falls, wind streaks, diamond rain |
| `src/planets/PlanetsVideo.tsx` | mounts each line as a `Sequence` at its narration time |

Change a line of narration in the JSON, re-run `make-vo.py`, and every cut
moves with the voice — the timings are never typed by hand. A line's `id`
prefix picks its chapter title (`m`ercury, `v`enus, ma`r`s, `j`upiter,
`s`aturn, `u`ranus, `n`eptune, `z` for the closing board, which has none).

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
per voice so the read fills the runtime with natural pauses: Liam is quick,
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

The rocky planets are scenes you stand in; the giants have no surface, so
those are falls and cross-sections instead. Saturn is the one planet drawn
rather than photographed — cutting a photo to a disc would lose the rings.

Planet photographs in `public/assets/planets/` are public-domain NASA images
from Wikimedia Commons — Mercury (MESSENGER), Venus (Magellan/JPL), Earth
(Apollo 17), Mars (Hubble), Jupiter (Hubble), Uranus and Neptune (Voyager 2)
— cut to discs by fitting the limb.

## Changing the runtime

`duration` in `scripts-vo/planets-survival.json` sets the length; the pause
scaling in `make-vo.py` absorbs the difference and warns if the script no
longer fits. Keep `PLANETS_DURATION_SECONDS` in `PlanetsVideo.tsx` equal to it.
