// SFX cue sheet for the Admirals video. Each cue is placed at an exact
// frame (30fps). `src` from the user's own sound-effects compilation is a
// timestamp reference into that file — the editor drops the real sound in
// at that mark. These render as on-screen markers only in the cue-review
// composition; the main render stays silent until real audio is wired.

export type SfxCue = {
  frame: number; // when it fires (30fps)
  label: string; // human description from the blueprint
  ref: string; // timestamp in the user's SFX source file
};

export const SFX_CUES: SfxCue[] = [
  { frame: 0, label: "Sudden warning alert", ref: "5:41" },
  { frame: 90, label: "Uncovering coat", ref: "6:01" },
  { frame: 240, label: "Speed of light teleportation", ref: "2:32" },
  { frame: 300, label: "Explosion", ref: "0:28" },
  { frame: 375, label: "Awkward dumb moment (Sengoku)", ref: "2:13" },
  { frame: 420, label: "Floor/wall breaks", ref: "0:21" },
  { frame: 600, label: "Breaking through floor/wall", ref: "0:24" },
  { frame: 780, label: "Ridicule", ref: "2:06" },
  { frame: 840, label: "Idk moment", ref: "2:25" },
  { frame: 900, label: "Deathly stare / conqueror's haki terror", ref: "3:18" },
  { frame: 990, label: "Actual conqueror's haki", ref: "3:52" },
  // Chapter 1 — betrayal (0:35–1:05)
  { frame: 1050, label: "Wano transition", ref: "3:33" },
  { frame: 1140, label: "Flashback in the past", ref: "1:40" },
  { frame: 1230, label: "Flashback 2", ref: "1:45" },
  { frame: 1350, label: "Blood/tears dripping, slow rain", ref: "6:04" },
  { frame: 1440, label: "Fist against table", ref: "5:36" },
  { frame: 1500, label: "Floor wall breaks", ref: "0:21" },
  // Akainu (1:05–1:40)
  { frame: 1950, label: "Enemy first appearance / intro", ref: "1:26" },
  { frame: 2160, label: "Armament haki", ref: "3:47" },
  { frame: 2550, label: "Jet pistol punch", ref: "5:23" },
  { frame: 2610, label: "Explosion", ref: "0:28" },
  { frame: 2670, label: "Spitting blood", ref: "0:37" },
  // Kuzan (1:40–2:15)
  { frame: 3000, label: "Enemy intro 2", ref: "1:29" },
  { frame: 3060, label: "How dumb can you be 3", ref: "2:21" },
  { frame: 3240, label: "Aokiji ice age", ref: "7:11" },
  { frame: 3600, label: "Pushed back", ref: "0:32" },
  // Kizaru (2:15–2:45)
  { frame: 4050, label: "Speed of light teleportation", ref: "2:32" },
  { frame: 4110, label: "Enemy intro 3", ref: "1:31" },
  { frame: 4260, label: "Teleportation 2", ref: "2:33" },
  { frame: 4320, label: "Consecutive kicks", ref: "4:11" },
  { frame: 4380, label: "Bone cracking (oof)", ref: "4:10" },
  { frame: 4650, label: "Extreme laser shoot", ref: "6:16" },
  { frame: 4710, label: "Powerful beam", ref: "4:45" },
  // Synergy + reaction (2:45–3:20)
  { frame: 4950, label: "Powerful clash of swords", ref: "1:10" },
  { frame: 5010, label: "Multiple clashes", ref: "1:13" },
  { frame: 5400, label: "Observation haki", ref: "4:06" },
  { frame: 5460, label: "Horrifying", ref: "3:27" },
  { frame: 5700, label: "Whoosh swing throw", ref: "5:39" },
  { frame: 5790, label: "Enemy intro / cliffhanger", ref: "1:21" },
  { frame: 5880, label: "To be continued", ref: "8:41" },
  // ── Target 1: Big Mom (3:20–4:00) ──
  { frame: 6000, label: "Enemy first appearance / intro", ref: "1:26" },
  { frame: 6060, label: "Sudden warning alert", ref: "5:41" },
  { frame: 6240, label: "Aokiji ice age", ref: "7:11" },
  { frame: 6360, label: "Floor wall breaks", ref: "0:21" },
  { frame: 6480, label: "Speed of light teleportation", ref: "2:32" },
  { frame: 6540, label: "Flying quick slice", ref: "1:08" },
  { frame: 6600, label: "Consecutive kicks", ref: "4:11" },
  { frame: 6840, label: "Jet pistol punch", ref: "5:23" },
  { frame: 6900, label: "Extreme laser shoot", ref: "6:16" },
  { frame: 6960, label: "Falling on knees", ref: "0:15" },
  { frame: 7020, label: "Spitting blood", ref: "0:37" },
  // ── Target 2: Kaido (4:00–4:45) ──
  { frame: 7200, label: "Wano transition", ref: "3:33" },
  { frame: 7260, label: "Enemy intro 3", ref: "1:31" },
  { frame: 7440, label: "Extreme jump", ref: "2:30" },
  { frame: 7500, label: "Breaking through floor/wall", ref: "0:24" },
  { frame: 7560, label: "Pushed back", ref: "0:32" },
  { frame: 7800, label: "Armament haki", ref: "3:47" },
  { frame: 7860, label: "Powerful clash of swords", ref: "1:10" },
  { frame: 7920, label: "Explosion", ref: "0:28" },
  { frame: 8100, label: "Falling on knees", ref: "0:15" },
  { frame: 8160, label: "Bone cracking (oof)", ref: "4:10" },
  { frame: 8250, label: "To be continued", ref: "8:41" },
  // ── Section 3: Shanks (4:45–5:40) ──
  { frame: 8550, label: "Actual conqueror's haki", ref: "3:52" },
  { frame: 8610, label: "Deathly stare / terror", ref: "3:18" },
  { frame: 8850, label: "Sheath and unsheathe", ref: "0:49" },
  { frame: 8910, label: "Shooting", ref: "3:04" },
  { frame: 8970, label: "High jump", ref: "2:28" },
  { frame: 9300, label: "Sword movement", ref: "0:44" },
  { frame: 9360, label: "Powerful cut (extreme)", ref: "0:57" },
  { frame: 9420, label: "Multiple clashes", ref: "1:13" },
  { frame: 9840, label: "Extreme laser shoot", ref: "6:16" },
  { frame: 9900, label: "Slashed", ref: "0:42" },
  { frame: 9960, label: "Falling into building", ref: "0:17" },
  // ── Blackbeard (5:40–6:40) ──
  { frame: 10200, label: "ZEHAHAHAH (Blackbeard laugh)", ref: "5:49" },
  { frame: 10260, label: "Horrifying", ref: "3:27" },
  { frame: 10560, label: "Running rush havoc", ref: "2:35" },
  { frame: 10620, label: "Jet gattling shots", ref: "5:05" },
  { frame: 10680, label: "Spitting blood", ref: "0:37" },
  { frame: 10860, label: "Quake quake fruit extreme power", ref: "5:54" },
  { frame: 10920, label: "Floor wall breaks", ref: "0:21" },
  { frame: 11340, label: "Moon walk / sky walk (geppo)", ref: "4:23" },
  { frame: 11400, label: "Powerful beam", ref: "4:45" },
  { frame: 11460, label: "Explosion", ref: "0:28" },
  // ── Conclusion (6:40–7:00) ──
  { frame: 12000, label: "Falling on knees", ref: "0:15" },
  { frame: 12060, label: "Fist clutching", ref: "1:38" },
  { frame: 12240, label: "Golden bell ring", ref: "7:50" },
  { frame: 12480, label: "Was that a pop", ref: "8:47" },
];

// path to the user's own SFX compilation, relative to the footage folder
export const SFX_SOURCE = "../one piece videos/audio/one-piece-sfx.mp4";
