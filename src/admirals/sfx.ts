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
];

// path to the user's own SFX compilation, relative to the footage folder
export const SFX_SOURCE = "../one piece videos/audio/one-piece-sfx.mp4";
