// Answer lists and answer checking.
// Each data/<id>.json holds [name, tier, [other accepted spellings]] rows, most famous first.

const fs = require("fs");
const path = require("path");

const TIERS = [
  { name: "Bread Basket", pts: 10 },
  { name: "Side Dish", pts: 25 },
  { name: "Main Course", pts: 50 },
  { name: "Chef's Secret", pts: 100 },
];
const MIN_ANSWERS = 8; // small fixed sets (EU countries, World Cup winners) are fine

// case, accents, punctuation, spaces and a leading "the" never matter
function norm(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and").replace(/\$/g, "s").replace(/^\s*the\s+/, "").replace(/[^a-z0-9]/g, "");
}

// edit distance that counts a swapped pair of letters as one typo; gives up past `max`
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let pp = null, prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (pp && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    pp = prev; prev = cur;
  }
  return prev[b.length];
}

// "Real Madrid Club de Fútbol" reads as "Real Madrid"; the full name still counts
const CLUB_SUFFIX = /\s*\b(F\.?\s?C\.?|A\.?\s?F\.?\s?C\.?|C\.?\s?F\.?|S\.?\s?C\.?|Club de Fútbol|Football Club|Futebol Clube|Fußball-Club)\b\.?\s*/gi;
function shortenClub(a) {
  const short = a.name.replace(CLUB_SUFFIX, " ").replace(/\s+/g, " ").trim();
  return short && short.length >= 3 && short !== a.name ? { ...a, name: short, alts: [a.name, ...a.alts] } : a;
}

// extra spellings people actually type: without company endings, "Jr", roman numerals or brackets
const TRIM = [
  /\s*\([^)]*\)\s*/g,
  /[,\s]+(inc|ltd|llc|plc|corp|corporation|company|co|group|holdings|ag|sa|se|gmbh|limited)\.?$/i,
  /[,\s]+(jr|sr|junior|senior|ii|iii|iv)\.?$/i,
];
function looseForms(name) {
  const out = new Set();
  let s = name;
  for (const re of TRIM) { s = s.replace(re, " ").trim(); out.add(s); }
  return [...out].filter((x) => x && x !== name);
}

function buildCategory(raw) {
  let answers = raw.answers.map(([name, tier, alts]) => ({ name, tier, alts: alts || [] }));
  if (raw.id === "club") answers = answers.map(shortenClub);

  // most famous first, so a shared spelling belongs to the better-known answer
  const exact = new Map();
  const add = (k, i) => { if (k && !exact.has(k)) exact.set(k, i); };
  answers.forEach((a, i) => { add(norm(a.name), i); a.alts.forEach((x) => add(norm(x), i)); });
  // looser forms only after every real spelling, so they never steal a better match
  answers.forEach((a, i) => { for (const n of [a.name, ...a.alts]) looseForms(n).forEach((x) => add(norm(x), i)); });

  // a lone first or last name counts when exactly one answer has it ("LeBron", "Haaland");
  // when several do ("Curry", "Jordan") the player is asked which
  const shared = new Set();
  if (raw.kind === "person" || raw.kind === "character") {
    const names = new Map();
    answers.forEach((a, i) => {
      const words = a.name.split(/\s+/).map(norm).filter(Boolean);
      if (words.length < 2) return;
      for (const w of new Set([words[0], words[words.length - 1]])) {
        if (w.length < 4 || exact.has(w)) continue;
        names.set(w, names.has(w) ? -1 : i);
      }
    });
    for (const [w, i] of names) i >= 0 ? exact.set(w, i) : shared.add(w);
  }
  // typo candidates, bucketed by length so a check only looks at spellings within two letters
  // (the answer index is looked up in `exact`, so each bucket is just the spellings)
  const fuzzy = new Map();
  for (const k of exact.keys()) {
    if (k.length < 5 || /\d/.test(k)) continue;
    if (!fuzzy.has(k.length)) fuzzy.set(k.length, []);
    fuzzy.get(k.length).push(k);
  }
  return { answers, exact, fuzzy, shared };
}

// Lists run to tens of thousands of answers, so a category's index is built the first time a
// game serves it and only the most recently used ones stay in memory. Everything else about a
// category (prompt, size, ...) is always there.
const KEEP = Number(process.env.CATEGORY_CACHE) || 24;
const built = new Map(); // id -> built index, oldest first

class Category {
  constructor(raw, file) {
    Object.assign(this, { id: raw.id, group: raw.group, emoji: raw.emoji, prompt: raw.prompt, kind: raw.kind, size: raw.answers.length, file });
  }
  get index() {
    let b = built.get(this.id);
    if (b) { built.delete(this.id); built.set(this.id, b); return b; }
    b = buildCategory(JSON.parse(fs.readFileSync(this.file, "utf8")));
    built.set(this.id, b);
    while (built.size > KEEP) built.delete(built.keys().next().value);
    return b;
  }
  get answers() { return this.index.answers; }
  get exact() { return this.index.exact; }
  get fuzzy() { return this.index.fuzzy; }
  get shared() { return this.index.shared; }
}

function loadCategories(dir) {
  const cats = new Map();
  let total = 0;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const file = path.join(dir, f);
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const n = raw.answers ? raw.answers.length : 0;
    if (n < MIN_ANSWERS) { console.warn(`skipping ${raw.id}: only ${n} answers`); continue; }
    cats.set(raw.id, new Category(raw, file));
    total += n;
  }
  console.log(`loaded ${cats.size} categories, ${total.toLocaleString()} answers`);
  return cats;
}

const WHICH = -2;
// returns an answer index, -1 for no match, or WHICH when a lone name fits several answers
function matchAnswer(cat, input) {
  const k = norm(input);
  if (!k) return -1;
  const { exact, shared, fuzzy } = cat.index || cat;
  if (exact.has(k)) return exact.get(k);
  if (shared.has(k)) return WHICH;
  // plural or singular of a listed answer ("Lambos", "Pringle", "Tacos")
  for (const v of [k.replace(/es$/, ""), k.replace(/s$/, ""), k + "s", k + "es", k.replace(/ies$/, "y"), k.replace(/y$/, "ies")]) {
    if (v !== k && v.length >= 3 && exact.has(v)) return exact.get(v);
  }
  // typo help only on longer answers, never on numbers (Toy Story 2 is not 3)
  if (k.length < 6 || /\d/.test(k)) return -1;
  const max = k.length >= 9 ? 2 : 1;
  let best = -1, bestD = max + 1;
  for (let len = k.length - max; len <= k.length + max; len++) {
    for (const key of fuzzy.get(len) || []) {
      const d = dist(k, key, max);
      if (d > max) continue;
      const i = exact.get(key);
      if (d < bestD || (d === bestD && i < best)) { bestD = d; best = i; }
    }
  }
  return best;
}

module.exports = { TIERS, WHICH, norm, loadCategories, matchAnswer };
