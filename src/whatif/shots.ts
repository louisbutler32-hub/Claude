// Scene-by-scene shot list for the "What If The Straw Hats Were Reborn"
// essay edit. Times are in seconds, matching the provided breakdown exactly.
//
// Every `slots` entry is a placeholder for a licensed image/clip the editor
// supplies: drop the file in public/assets/ and set `src` (e.g.
// src: "assets/ace-death.png") to replace the placeholder with the real art.
// `sfx` strings are editing cues only — they render nowhere, they're notes
// for the audio pass.

export const FPS = 30;

export type Slot = {
  id: string;
  label: string;
  desc?: string;
  src?: string;
};

export type Shot = {
  t: [number, number];
  kind: "black" | "impact" | "type" | "scene" | "narrator";
  text?: string;
  texts?: string[]; // cycled big overlay words
  embers?: boolean;
  bg?: string; // full-bleed background image (public/ path) with slow Ken Burns zoom
  slots?: Slot[];
  layout?: "row" | "ring" | "column";
  bubbles?: string[];
  pin?: string;
  qmarks?: boolean;
  hearts?: boolean;
  fx?: string[];
  icons?: string[]; // narrator side-icon labels
  sfx?: string;
};

const s = (id: string, label: string, desc?: string): Slot => ({ id, label, desc });

export const shots: Shot[] = [
  // ── 00:00–00:21 | INTRODUCTION & THE PREMISE ─────────────────────────
  { t: [0, 8], kind: "black" },
  { t: [8, 9], kind: "impact", text: "HAVE YOU" },
  { t: [9, 10], kind: "impact", text: "WONDER" },
  {
    t: [10, 11], kind: "scene", fx: ["whitebg"], qmarks: true,
    slots: [{ ...s("luffy-young-confused", "Young Luffy", "confused, sweating expression"), src: "assets/luffy-kid.png" }],
    sfx: "anime surprise boing/whistle",
  },
  {
    t: [11, 12], kind: "scene", layout: "ring",
    slots: [
      s("zoro-two-swords", "Zoro", "two swords, center"),
      s("ace-head", "Ace headshot"), s("rayleigh-head", "Rayleigh headshot"),
      s("crocodile-head", "Crocodile headshot"), { ...s("akainu-head", "Akainu"), src: "assets/akainu.png" },
      { ...s("kizaru-head", "Kizaru"), src: "assets/kizaru.png" }, s("kaido-head", "Kaido headshot"),
    ],
  },
  {
    t: [12, 13], kind: "scene", layout: "ring",
    slots: [
      s("usopp-goofy", "Usopp", "goofy pose, center"),
      s("ace-head", "Ace headshot"), s("rayleigh-head", "Rayleigh headshot"),
      s("crocodile-head", "Crocodile headshot"), { ...s("akainu-head", "Akainu"), src: "assets/akainu.png" },
      { ...s("kizaru-head", "Kizaru"), src: "assets/kizaru.png" }, s("kaido-head", "Kaido headshot"),
    ],
  },
  {
    t: [13, 14], kind: "scene", fx: ["greyscale", "shake"],
    slots: [s("ace-death", "Ace dying in Luffy's arms", "Marineford")],
    sfx: "sad dramatic music underlay, swoosh",
  },
  {
    t: [14, 15], kind: "scene", fx: ["greyscale"],
    bg: "assets/backgrounds/sabaody-1.jpg",
    slots: [s("kuma-sabaody", "Kuma separating the Straw Hats", "Sabaody")],
  },
  {
    t: [15, 16], kind: "scene", fx: ["greyscale"],
    slots: [s("nami-young-crying", "Young Nami crying uncontrollably")],
  },
  {
    t: [16, 17], kind: "scene", fx: ["greyscale"],
    slots: [s("merry-burning", "Straw Hats watching the Going Merry burn")],
    sfx: "fire crackling",
  },
  {
    t: [17, 19], kind: "scene",
    bg: "assets/backgrounds/sunny-2.jpg",
    slots: [s("crew-sunny", "Post-timeskip full crew photo", "Thousand Sunny — Jinbe, Robin, Brook, Zoro, Luffy, Usopp, Franky, Chopper, Nami")],
  },
  { t: [19, 20], kind: "impact", text: "WELL", embers: true },
  { t: [20, 21], kind: "impact", text: "ANSWER" },

  // ── 00:21–01:14 | PART 1: LUFFY'S REBIRTH ────────────────────────────
  {
    t: [21, 23], kind: "scene",
    bg: "assets/backgrounds/beach.jpg",
    slots: [{ ...s("luffy-young-smiling", "Young Luffy smiling, arms crossed"), src: "assets/luffy-kid.png" }],
    sfx: "happy anime chime / comedic laugh",
  },
  {
    t: [23, 28], kind: "scene", qmarks: true,
    bg: "assets/backgrounds/beach.jpg",
    slots: [s("luffy-hat-gag", "Luffy hat gag", "straw hat disappears → black long-sleeve shirt, flabbergasted sweat drops → whistles, hat pops back on")],
    sfx: "whistling, comedic slide whistle",
  },
  {
    t: [29, 34], kind: "scene", layout: "column", fx: ["slideup"],
    slots: [
      s("manga-bite", "Manga panel — Luffy & Ace biting each other"),
      s("manga-sake", "Manga panel — sake cups toast"),
      s("manga-training", "Manga panel — training in the forest"),
    ],
    sfx: "manga page turn / paper slide",
  },
  {
    t: [35, 38], kind: "scene",
    bg: "assets/backgrounds/beach.jpg",
    slots: [{ ...s("luffy-young-whistle", "Young Luffy whistling"), src: "assets/luffy-kid.png" }],
    bubbles: ["I can't wait to meet Zoro and Sanji!"],
  },
  {
    t: [38, 40], kind: "scene", qmarks: true,
    slots: [s("ace-fire-confused", "Young Ace, fire hands", "extremely confused")],
  },
  {
    t: [40, 43], kind: "scene",
    slots: [s("luffy-nika-bite", "Young Luffy biting the purple Nika Fruit")],
  },
  {
    t: [43, 45], kind: "scene", fx: ["greyscale", "redx"],
    slots: [s("shanks-arm", "Shanks holding young Luffy in the ocean", "after losing his arm")],
    sfx: "harsh wrong/denied buzzer",
  },
  {
    t: [45, 48], kind: "scene", fx: ["punch"],
    slots: [s("higuma-wanted", "Higuma wanted poster", "₿8,000,000")],
    sfx: "heavy punch impact",
  },
  {
    t: [48, 52], kind: "scene", fx: ["haki"],
    slots: [s("luffy-anchor-haki", "Young Luffy in ANCHOR shirt", "eyes glowing red, Conqueror's Haki aura — Windmill Village")],
    sfx: "deep bass drop / haki rumble",
  },
  {
    t: [52, 54], kind: "scene", fx: ["punch"],
    slots: [s("bluejam-flames", "Bluejam smiling in flames")],
    sfx: "whoosh / punch",
  },
  { t: [55, 57], kind: "narrator", icons: ["Young Ace", "Young Sabo"] },
  {
    t: [58, 64], kind: "scene", layout: "row",
    slots: [
      s("sabo-luffy-ace", "Sabo talking with Luffy & Ace"),
      s("marco-ace", "Marco standing next to Ace"),
      s("sabo-revarmy", "Sabo with Revolutionary Army", "Karasu / Morley / Lindbergh"),
    ],
  },
  { t: [65, 68], kind: "scene", bg: "assets/backgrounds/beach.jpg", slots: [{ ...s("luffy-17-sky", "17-year-old Luffy smiling"), src: "assets/luffy.png" }] },
  { t: [68, 70], kind: "scene", texts: ["We are!"], bg: "assets/backgrounds/sunny-1.jpg", slots: [{ ...s("luffy-boat", "Luffy celebrating"), src: "assets/luffy.png" }] },
  { t: [70, 72], kind: "scene", slots: [s("koby-panic", "Luffy meeting young Koby", "screaming in panic")] },
  {
    t: [72, 74], kind: "scene", fx: ["pan"], pin: "SHELLSTOWN",
    slots: [s("shellstown", "Alvida's ship wood grain → Shellstown", "camera pan")],
  },

  // ── 01:14–02:30 | PART 2: ZORO'S REBIRTH ─────────────────────────────
  { t: [74, 75], kind: "impact", text: "NOW" },
  { t: [75, 76], kind: "impact", text: "DO THAT" },
  { t: [76, 78], kind: "narrator", icons: ["Zoro"] },
  { t: [79, 80], kind: "scene", slots: [s("zoro-cliff", "Young Zoro on a cliff edge", "overlooking home village")] },
  { t: [80, 81], kind: "scene", slots: [s("zoro-leaf", "Young Zoro close-up", "leaf in mouth, smiling")] },
  { t: [81, 82], kind: "impact", text: "OBSOLETE" },
  { t: [82, 83], kind: "impact", text: "NOW THAT" },
  {
    t: [84, 87], kind: "scene", layout: "row",
    slots: [
      s("zoro-training", "Young Zoro, black outfit", "two wooden training swords"),
      s("zoro-dojo-loss", "Thought bubble", "losing in the dojo to Kuina / Koushirou"),
    ],
  },
  { t: [87, 89], kind: "scene", slots: [s("wano-zoro", "Wano Zoro", "Enma / Wado Ichimonji stance")] },
  {
    t: [89, 91], kind: "scene", fx: ["shake"],
    slots: [s("zoro-beats-kuina", "Young Zoro parrying & beating Kuina", "forest duel")],
    sfx: "sword clash / metal hit",
  },
  {
    t: [91, 93], kind: "scene", bubbles: ["YOU'RE TOO STRONG"],
    slots: [s("kuina-defeated", "Young Kuina sitting on steps", "looking defeated")],
  },
  { t: [94, 98], kind: "scene", slots: [s("zoro-kuina-moon", "Zoro & Kuina holding hands", "massive full moon, starry night")] },
  { t: [98, 99], kind: "impact", text: "WITH HIS" },
  { t: [99, 100], kind: "impact", text: "MEMORIES" },
  { t: [100, 103], kind: "scene", fx: ["greyscale"], slots: [s("kuina-coffin", "Kuina's coffin with white flowers")] },
  {
    t: [104, 105], kind: "scene", bubbles: ["BE CAREFUL WITH THE [STAIRS]"],
    slots: [s("zoro-shouting", "Young Zoro shouting at Kuina")],
  },
  { t: [106, 108], kind: "scene", slots: [s("zoro-dojo-strike", "Young Zoro striking Koushirou in the dojo")] },
  { t: [108, 110], kind: "scene", slots: [s("wado-handover", "Koushirou kneeling, handing over the Wado Ichimonji")] },
  { t: [110, 112], kind: "scene", slots: [s("koushirou-smile", "Close-up — Koushirou's smiling face")] },
  { t: [113, 116], kind: "type", text: "GROWING TIRED OF HIS LITTLE VILLAGE" },
  {
    t: [116, 119], kind: "scene", fx: ["sepia"],
    slots: [s("zoro-leaving", "Stylized artwork — young Zoro leaving the island", "bandaged face, sword on back")],
  },
  { t: [120, 123], kind: "narrator", icons: ["Zoro training clip (inset)"] },
  {
    t: [123, 126], kind: "scene", fx: ["glitch"],
    slots: [s("zoro-marines", "Zoro tied up facing Marines", "swords crossed over him")],
    sfx: "distortion glitch",
  },
  {
    t: [127, 129], kind: "scene", bubbles: ["WAIT, IT'S NOT THIS ARC YET"],
    slots: [s("wano-zoro-2", "Wano Zoro holding swords")],
  },
  { t: [129, 132], kind: "scene", qmarks: true, bg: "assets/backgrounds/marine-base.jpg", slots: [s("zoro-marine-base", "Zoro (confused)")] },
  { t: [133, 135], kind: "scene", bg: "assets/backgrounds/ship-deck.jpg", slots: [{ ...s("luffy-laughing-boat", "Luffy laughing"), src: "assets/luffy.png" }] },
  { t: [135, 137], kind: "scene", slots: [s("morgan", "Axe-Hand Morgan standing tall")] },
  {
    t: [137, 139], kind: "scene", fx: ["flash", "shake"],
    slots: [s("zoro-cuts-morgan", "Zoro cuts Morgan — flash frame", "black bandana close-up")],
  },
  { t: [139, 141], kind: "scene", slots: [s("marines-terrified", "Marines terrified, broad swords")] },
  { t: [141, 144], kind: "scene", texts: ["FEW DAYS", "AROUND"], slots: [s("zoro-laughing", "Zoro laughing hysterically in a room")] },
  {
    t: [145, 148], kind: "scene", fx: ["shake"], bubbles: ["ZOROOOO!!!"],
    slots: [s("bar-reunion", "Luffy & Zoro reunite at a bar")],
  },
  { t: [148, 150], kind: "scene", slots: [s("sail-salute", "Riding off on a small sailboat", "past saluting Marines")] },

  // ── 02:31–04:26 | PART 3: NAMI'S REBIRTH & ORANGE TOWN ───────────────
  { t: [151, 153], kind: "type", text: "ON THEIR WAY TO ORANGE TOWN" },
  {
    t: [153, 156], kind: "scene", layout: "row",
    bg: "assets/backgrounds/ship-deck.jpg",
    slots: [
      s("luffy-deck", "Luffy lying on boat deck", "Zoro sitting behind"),
      s("zoro-reminisce", "Thought bubble", "young Zoro reminiscing"),
    ],
  },
  { t: [157, 159], kind: "scene", pin: "ORANGE TOWN", slots: [s("buggy-crew", "Buggy's crew", "Cabaji, Mohji, Richie")] },
  { t: [159, 162], kind: "scene", texts: ["HAHAHA"], slots: [s("nami-laughing", "Post-timeskip Nami, center", "stylized laughing")] },
  { t: [162, 165], kind: "scene", slots: [s("buggy-bowing", "Buggy bowing/crying at a table")] },
  { t: [165, 168], kind: "scene", slots: [s("nami-scold-buggy", "Nami scolding Buggy", "holding a treasure sack")] },
  { t: [169, 170], kind: "impact", text: "HOW DID" },
  { t: [170, 171], kind: "impact", text: "WELL TO" },
  { t: [171, 172], kind: "impact", text: "W3LL T0", },
  { t: [172, 174], kind: "narrator", icons: ["Nami"] },
  {
    t: [175, 180], kind: "scene", fx: ["vignette"],
    slots: [s("nojiko-baby-nami", "Young Nojiko carrying baby Nami", "ruined war-torn village rocks")],
  },
  {
    t: [181, 183], kind: "scene", texts: ["PRACTICALLY", "FOR NAMI", "AFTER THAT"],
    slots: [s("nami-maps", "Young Nami drawing maps")],
  },
  { t: [183, 186], kind: "scene", hearts: true, slots: [s("nami-bellmere", "Nami hugging Bell-mère")] },
  {
    t: [187, 189], kind: "scene", fx: ["redtint"],
    slots: [s("nami-running", "Silhouette — young Nami running with treasure", "from pirates")],
  },
  { t: [189, 190], kind: "narrator" },
  { t: [190, 193], kind: "scene", slots: [s("treasure-chest", "Nami & Nojiko unearthing a chest", "bags of gold and jewels")] },
  { t: [194, 196], kind: "scene", slots: [s("arlong-pirates", "Arlong and the Arlong Pirates", "standing threateningly")] },
  { t: [196, 197], kind: "scene", fx: ["static"], slots: [] },
  { t: [197, 198], kind: "impact", text: "WHY?" },
  { t: [198, 199], kind: "impact", text: "DON'T WORRY" },
  { t: [199, 200], kind: "impact", text: "EXPLAIN THAT" },
  { t: [200, 201], kind: "impact", text: "SOON ENOUGH" },
  { t: [202, 204], kind: "scene", qmarks: true, slots: [s("nami-orange-hair", "Nami with orange hair")] },
  { t: [204, 206], kind: "scene", fx: ["shake"], slots: [s("nami-climatact", "Nami wielding her Clima-Tact", "knocking out fodder pirates")] },
  { t: [206, 208], kind: "scene", texts: ["GRAND LINE"], slots: [s("map-grandline", "Cartography panel", "Grand Line being drawn")] },
  { t: [208, 211], kind: "scene", texts: ["NAVIGATION"], slots: [s("nami-book", "Young Nami smiling, reading a book")] },
  { t: [212, 215], kind: "type", text: "ONCE IT FINALLY CAME TIME FOR NAMI TO LEAVE" },
  { t: [215, 217], kind: "scene", bg: "assets/backgrounds/sunny-1.jpg", slots: [s("crew-image", "Full Straw Hat crew, post-timeskip")] },
  { t: [217, 218], kind: "scene", slots: [s("nami-uncertain", "Nami looking uncertain")] },
  { t: [218, 220], kind: "scene", bubbles: ["WE'LL BE FINE!"], slots: [s("nojiko-smile", "Nojiko smiling")] },
  { t: [220, 222], kind: "scene", slots: [s("nami-rowboat", "Nami rowing a wooden rowboat", "sunny clouds")] },
  { t: [223, 225], kind: "scene", slots: [s("nami-smiling", "Nami smiling")] },
  { t: [225, 228], kind: "scene", slots: [s("nami-moneysack", "Nami holding a money sack", "East Blue outfit")] },
  { t: [228, 231], kind: "scene", fx: ["greyscale"], slots: [s("buggy-defeat", "Mohji & Cabaji screaming in defeat")] },
  { t: [232, 235], kind: "scene", slots: [s("nami-scold-duo", "Nami scolding Luffy & Zoro", "sitting on the ground with head bumps")] },
  { t: [235, 237], kind: "scene", slots: [s("buggy-flying", "Buggy flying through the air in panic")] },
  { t: [237, 240], kind: "scene", fx: ["speedlines"], slots: [s("blast-off", "Buggy / Cabaji / Mohji sent blasting off")] },
  { t: [240, 242], kind: "scene", texts: ["MAYOR BOODLE"], slots: [s("boodle", "Orange Town Mayor smoking a pipe", "red arrow pointing at him")] },
  { t: [242, 245], kind: "scene", bubbles: ["THIS IS FOR THE TOWN"], slots: [s("nami-two-sacks", "Nami holding two massive money sacks")] },
  { t: [245, 248], kind: "narrator", icons: ["Beat-up Luffy (on money pile)", "Beat-up Zoro (on money pile)"] },
  { t: [249, 252], kind: "scene", slots: [s("nami-pull-faces", "Nami playfully pulling Luffy & Zoro's beat-up faces")] },
  { t: [252, 255], kind: "scene", slots: [s("nami-money-eyes", "Nami with $ eyes", "hugging a pile of gold crowns, cups, jewels")] },
  { t: [255, 258], kind: "scene", fx: ["greyscale"], slots: [s("bellmere-shot", "Silhouette memory — Bell-mère shot by Arlong")] },
  { t: [259, 262], kind: "scene", fx: ["speedlines"], slots: [s("boats-side", "Luffy & Zoro's boats sailing side-by-side")] },
  { t: [262, 264], kind: "scene", slots: [s("syrup-village", "Syrup Village landscape")] },
  { t: [264, 266], kind: "scene", bg: "assets/backgrounds/beach.jpg", slots: [s("trio-merry", "Luffy, Nami & Zoro on the coast", "Going Merry in the distance")] },

  // ── 04:27–04:45 | PART 4: USOPP TEASER & CONCLUSION ──────────────────
  { t: [267, 267.5], kind: "impact", text: "WHEN USOPP" },
  { t: [267.5, 268], kind: "impact", text: "WAS REBORN" },
  { t: [269, 272], kind: "scene", slots: [s("usopp-mother", "Young Usopp with his sick mother Banchina", "in bed")] },
  {
    t: [272, 276], kind: "scene", layout: "row",
    slots: [
      s("usopp-cheering", "Usopp cheering her up"),
      s("usopp-thought", "Thought bubble", "moments with the crew & Thousand Sunny"),
    ],
  },
  { t: [277, 279], kind: "type", text: "ONCE HIS MOTHER PASSED AWAY" },
  { t: [279, 281], kind: "scene", slots: [s("usopp-kaya", "Usopp waving from a tree branch", "outside Kaya's window")] },
  { t: [281, 282.5], kind: "scene", slots: [s("kuro-glasses", "Captain Kuro adjusting his glasses", "palm/claw style")] },
  { t: [282.5, 284], kind: "scene", fx: ["vignette"], slots: [s("kuro-shadows", "Kuro backed by red-eyed shadow figures")] },
  { t: [284, 285], kind: "scene", slots: [s("kuro-cliff", "Captain Kuro on a cliff facing Usopp")] },
  // video ends mid-narration
];

export const WHATIF_DURATION_IN_FRAMES = Math.round(285 * FPS); // 4:45
