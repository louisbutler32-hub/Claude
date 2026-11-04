// Player profiles: a name and a 4-6 digit PIN, no email. Each profile keeps lifetime stats and
// three streaks (daily play, wins in a row, best in-game hot streak).
//
// Storage: Postgres when DATABASE_URL is set (survives redeploys), otherwise a JSON file in
// STORAGE_DIR (default ./storage), which a free host may wipe on every deploy.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const NAME_RE = /^[A-Za-z0-9 _.-]{3,16}$/;
const PIN_RE = /^\d{4,6}$/;
const MAX_TOKENS = 6;

const keyOf = (name) => String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const hashPin = (pin, salt) => crypto.scryptSync(String(pin), salt, 32).toString("hex");

function freshStats() {
  return { games: 0, wins: 0, points: 0, best: 0, served: 0, kisses: 0, bestFind: null, dayStreak: 0, bestDayStreak: 0, lastDay: null, winStreak: 0, bestWinStreak: 0, bestHotStreak: 0 };
}

/* ---------- storage backends ---------- */

class FileStore {
  constructor(dir) { this.file = path.join(dir, "accounts.json"); this.dir = dir; this.timer = null; }
  async load() {
    try { return JSON.parse(fs.readFileSync(this.file, "utf8")).accounts || {}; } catch { return {}; }
  }
  save(all) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      fs.mkdirSync(this.dir, { recursive: true });
      const tmp = this.file + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify({ accounts: all }));
      fs.renameSync(tmp, this.file);
    }, 500);
  }
}

class PgStore {
  constructor(url) {
    const { Pool } = require("pg");
    this.pool = new Pool({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } });
  }
  async load() {
    await this.pool.query("CREATE TABLE IF NOT EXISTS hp_accounts (key text PRIMARY KEY, data jsonb NOT NULL)");
    const { rows } = await this.pool.query("SELECT key, data FROM hp_accounts");
    return Object.fromEntries(rows.map((r) => [r.key, r.data]));
  }
  saveOne(acct) {
    this.pool.query("INSERT INTO hp_accounts (key, data) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data", [acct.key, acct])
      .catch((e) => console.error("saving profile failed:", e.message));
  }
}

/* ---------- accounts ---------- */

class Accounts {
  constructor() {
    this.all = {};
    this.store = process.env.DATABASE_URL ? new PgStore(process.env.DATABASE_URL) : new FileStore(process.env.STORAGE_DIR || path.join(__dirname, "..", "storage"));
    this.fails = new Map(); // key -> { n, until }
  }

  async init() {
    try { this.all = await this.store.load(); }
    catch (e) { console.error("couldn't load profiles, starting empty:", e.message); this.all = {}; }
    console.log(`profiles: ${Object.keys(this.all).length} (${this.store instanceof PgStore ? "postgres" : "file"})`);
  }

  persist(acct) {
    if (this.store instanceof PgStore) this.store.saveOne(acct);
    else this.store.save(this.all);
  }

  issueToken(acct) {
    const token = crypto.randomBytes(24).toString("hex");
    acct.tokens = [sha(token), ...(acct.tokens || [])].slice(0, MAX_TOKENS);
    this.persist(acct);
    return token;
  }

  signup(name, pin, emoji, tz) {
    name = String(name || "").trim().replace(/\s+/g, " ");
    if (!NAME_RE.test(name)) return { error: "Names are 3 to 16 letters, numbers, spaces, dots, dashes or underscores." };
    if (!PIN_RE.test(String(pin || ""))) return { error: "Your PIN needs 4 to 6 digits." };
    const key = keyOf(name);
    if (this.all[key]) return { error: "That name is taken. Sign in, or pick another." };
    const salt = crypto.randomBytes(16).toString("hex");
    const acct = { key, name, emoji, salt, pin: hashPin(pin, salt), tokens: [], tz: Number(tz) || 0, created: Date.now(), stats: freshStats() };
    this.all[key] = acct;
    return { acct, token: this.issueToken(acct) };
  }

  login(name, pin, tz) {
    const key = keyOf(name);
    const acct = this.all[key];
    const f = this.fails.get(key);
    if (f && f.until > Date.now()) return { error: "Too many wrong PINs. Try again in a few minutes." };
    if (!acct || hashPin(pin, acct.salt) !== acct.pin) {
      const n = (f && f.until > Date.now() - 600000 ? f.n : 0) + 1;
      this.fails.set(key, { n, until: n >= 8 ? Date.now() + 5 * 60000 : 0 });
      return { error: "That name and PIN don't match." };
    }
    this.fails.delete(key);
    acct.tz = Number(tz) || acct.tz || 0;
    return { acct, token: this.issueToken(acct) };
  }

  fromToken(token) {
    if (!token) return null;
    const h = sha(String(token));
    return Object.values(this.all).find((a) => a.tokens && a.tokens.includes(h)) || null;
  }

  logout(acct, token) {
    acct.tokens = (acct.tokens || []).filter((t) => t !== sha(String(token || "")));
    this.persist(acct);
  }

  setEmoji(acct, emoji) { acct.emoji = emoji; this.persist(acct); }
  setImg(acct, img) {
    const ok = img === null || (typeof img === "string" && img.length <= 12000 && /^data:image\/(png|jpeg|webp);base64,/.test(img));
    if (ok) { acct.img = img; this.persist(acct); }
  }

  // what the player's own screen shows
  view(acct) { return { name: acct.name, emoji: acct.emoji, img: acct.img || null, stats: { ...acct.stats, dayStreak: this.liveDayStreak(acct) } }; }

  // called once per finished game for every signed-in player who sat down for it
  record(acct, { score, served, won, multiplayer, best, hotStreak, kisses }) {
    const s = acct.stats;
    s.kisses = (s.kisses || 0) + (kisses || 0);
    s.games++; s.points += score; s.served += served;
    s.best = Math.max(s.best, score);
    s.bestHotStreak = Math.max(s.bestHotStreak, hotStreak || 0);
    if (best && (!s.bestFind || best.tier > s.bestFind.tier || (best.tier === s.bestFind.tier && best.rank > (s.bestFind.rank || 0)))) s.bestFind = best;
    if (multiplayer) {
      if (won) { s.wins++; s.winStreak++; s.bestWinStreak = Math.max(s.bestWinStreak, s.winStreak); }
      else s.winStreak = 0;
    }
    // daily streak, counted in the player's own time zone
    const day = Math.floor((Date.now() - (acct.tz || 0) * 60000) / 86400000);
    if (s.lastDay !== day) {
      s.dayStreak = s.lastDay === day - 1 ? s.dayStreak + 1 : 1;
      s.bestDayStreak = Math.max(s.bestDayStreak, s.dayStreak);
      s.lastDay = day;
    }
    this.persist(acct);
  }

  // a streak that lapsed (no game yesterday or today) reads as 0 until they play again
  liveDayStreak(acct) {
    const day = Math.floor((Date.now() - (acct.tz || 0) * 60000) / 86400000);
    const s = acct.stats;
    return s.lastDay === day || s.lastDay === day - 1 ? s.dayStreak : 0;
  }
}

module.exports = { Accounts };
