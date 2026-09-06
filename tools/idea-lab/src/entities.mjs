/**
 * Pulls the real vocabulary of a niche out of real titles.
 *
 * Frequency-based rather than capitalisation-based: YouTube titles are usually
 * Title Case, so capitalisation identifies nothing. A phrase earns its place by
 * recurring across DISTINCT titles, surviving boundary checks that reject
 * sentence fragments, and not being swallowed by a longer phrase.
 */

const STOP = new Set(`a an the and or but if then than that this these those of in on at to for with without from by as is are was were be been being it its his her their they them he she you your we our i my me us do does did doing done have has had can could would should will shall may might must not no nor so too very just only own same now here there when where why how all any both each few other another about into over under again further once`.split(/\s+/));

/** A phrase may not START or END with any of these — they signal a fragment. */
const BOUNDARY_STOP = new Set([
  ...STOP,
  // verbs common in titles
  'explained', 'explain', 'explains', 'revealed', 'reveal', 'reveals', 'predicted', 'predict',
  'became', 'become', 'becomes', 'ranked', 'ranking', 'rank', 'tested', 'tried', 'built',
  'made', 'makes', 'make', 'making', 'got', 'get', 'gets', 'getting', 'went', 'goes', 'go',
  'said', 'says', 'say', 'know', 'knows', 'knew', 'think', 'thinks', 'thought', 'watch',
  'watched', 'watching', 'use', 'used', 'using', 'need', 'needs', 'want', 'wants', 'happened',
  'happens', 'happen', 'changed', 'changes', 'change', 'destroyed', 'destroys', 'beat', 'beats',
  'wins', 'win', 'won', 'lost', 'lose', 'loses', 'explained', 'compared', 'reacts', 'react',
  'breaks', 'broke', 'exposed', 'exposes', 'survived', 'survive', 'solved', 'solve',
  // adjectives / adverbs / quantifiers that modify rather than name
  'best', 'worst', 'most', 'least', 'biggest', 'smallest', 'strongest', 'weakest', 'craziest',
  'greatest', 'broken', 'new', 'old', 'real', 'true', 'complete', 'entire', 'full', 'whole',
  'every', 'insane', 'crazy', 'shocking', 'brutal', 'perfect', 'ultimate', 'top', 'first',
  'last', 'next', 'more', 'much', 'many', 'little', 'big', 'small', 'good', 'bad', 'better',
  'worse', 'actually', 'really', 'finally', 'never', 'always', 'still', 'even', 'also',
  'everything', 'anything', 'nothing', 'something', 'someone', 'everyone', 'nobody',
  // interrogatives and subordinators
  'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how',
  'after', 'before', 'during', 'while', 'since', 'until', 'against', 'between',
  'among', 'through', 'upon', 'within', 'behind', 'beyond', 'across', 'near', 'per', 'via',
  // evaluative adjectives that describe rather than name
  'easy', 'simple', 'quick', 'delicious', 'amazing', 'incredible', 'awesome', 'cheap',
  'free', 'fast', 'slow', 'hot', 'cold', 'dead', 'alive', 'hard', 'soft', 'huge', 'tiny',
  'cool', 'weird', 'strange', 'wild', 'epic', 'legendary', 'iconic', 'famous', 'secret',
  'misunderstood', 'underrated', 'overrated', 'hidden', 'right', 'left', 'caught', 'wrong',
]);

/** Generic nouns that name nothing specific. */
const GENERIC = new Set(`thing things stuff way ways time times day days year years people person guy guys man men woman women world life story stories fact facts truth reason reasons video videos part episode types type kind kinds minute minutes second seconds hour hours week weeks month months recap id ep vol edition series chapter chapters scene scenes clip clips moment moments`.split(/\s+/));

/** Function words may not appear ANYWHERE inside an entity phrase. */
const FUNCTION = new Set(`of in on at to for with without from by as and or but the a an vs versus that this these those into over under about`.split(/\s+/));

const norm = (s) => s
  .toLowerCase()
  .replace(/'s\b/g, '')          // "Imu's Powers" -> "imu powers"
  .replace(/'(?=\s|$)/g, '')     // "Philippines'" -> "philippines"
  .replace(/[^a-z0-9'\s-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/**
 * Split a title at punctuation before extracting n-grams. Without this,
 * "Cold Case Files | True Crime Documentary" yields the phantom phrase
 * "Files True", and "POV Test Drive - Binaural Audio" yields "Drive Binaural".
 */
const segments = (title) =>
  String(title)
    .split(/[|,;:()\[\]{}!?.\u2013\u2014]|\s[-\u2013\u2014]\s/)
    .map(norm)
    .filter(Boolean);

/** Irregular past participles, which the -ed/-ing test cannot catch. */
const IRREGULAR_PARTICIPLE = new Set(['eaten', 'seen', 'done', 'gone', 'taken', 'known', 'given', 'shown', 'found', 'told', 'become', 'begun', 'driven', 'written', 'spoken', 'chosen', 'forgotten', 'hidden', 'broken', 'stolen', 'beaten', 'fallen', 'risen', 'worn', 'torn', 'born']);

/** Participles and gerunds are almost always verb fragments, not entity names. */
const isParticiple = (w) =>
  IRREGULAR_PARTICIPLE.has(w) ||
  (/(?:ed|ing)$/.test(w) && w.length > 5 && !['thing', 'king', 'ring', 'wedding', 'building', 'ending', 'beginning'].includes(w));

function acceptable(words) {
  if (!words.length || words.length > 3) return false;
  const first = words[0], last = words[words.length - 1];
  if (BOUNDARY_STOP.has(first) || BOUNDARY_STOP.has(last)) return false;
  if (isParticiple(last) || isParticiple(first)) return false;
  if (/^\d/.test(first)) return false;                      // "11 Types", "20 Year"
  if (words.some((w) => FUNCTION.has(w))) return false;      // "Fruits in One", "Types of Devil"
  if (GENERIC.has(first)) return false;                      // "Year Old One", "Types of Devil"
  // A phrase ending in a generic unit noun is a fragment, and worse, it
  // subsumes the good phrase inside it: "Devil Fruits Episode" would swallow
  // "Devil Fruits".
  if (GENERIC.has(last)) return false;
  if (words.every((w) => GENERIC.has(w))) return false;
  if (words.some((w) => w.length < 2)) return false;
  if (words.some((w) => /'(?:s|t|ve|re|ll|d|m)$/.test(w))) return false;  // "I've", "don't", "Philippines'"

  if (words.join(' ').length < 4) return false;
  return true;
}

/**
 * Frequent noun-ish phrases across a set of titles.
 * Counts DISTINCT titles (document frequency), so one repeated title cannot
 * manufacture a term. `boost` titles (the user's references) add a bounded
 * bonus so their subject matter leads without inventing vocabulary.
 */
export function extractEntities(titles, { boost = [], minCount = 2, limit = 40 } = {}) {
  const df = new Map();          // phrase -> number of distinct titles containing it
  const inRefs = new Set();

  const scan = (list, markRef) => {
    for (const t of list) {
      const here = new Set();
      for (const seg of segments(t)) {
        const words = seg.split(' ').filter(Boolean);
        for (let i = 0; i < words.length; i++) {
          for (let n = 1; n <= 3 && i + n <= words.length; n++) {
            const w = words.slice(i, i + n);
            if (!acceptable(w)) continue;
            here.add(w.join(' '));
          }
        }
      }
      for (const p of here) {
        df.set(p, (df.get(p) || 0) + 1);
        if (markRef) inRefs.add(p);
      }
    }
  };
  scan(titles, false);
  scan(boost, true);

  // Keep phrases seen in enough distinct titles, or present in the references.
  let cands = [...df.entries()]
    .filter(([p, c]) => c >= minCount || inRefs.has(p))
    .map(([phrase, count]) => ({ phrase, count, words: phrase.split(' ').length, fromRef: inRefs.has(phrase) }));

  // Subsumption: drop a short phrase that a longer phrase almost always carries.
  // "Piece" (df 31) dies to "One Piece" (df 31); "One Piece" survives
  // "One Piece Theory" (df 6) because the longer form is much rarer.
  const byLen = [...cands].sort((a, b) => b.words - a.words);
  const dropped = new Set();
  for (const shortP of cands) {
    for (const longP of byLen) {
      if (longP.words <= shortP.words) break;
      if (!longP.phrase.includes(shortP.phrase)) continue;
      if (longP.count >= 0.7 * shortP.count) { dropped.add(shortP.phrase); break; }
    }
  }
  cands = cands.filter((c) => !dropped.has(c.phrase));

  // Dominance: what share of the niche's titles contain this phrase. A term
  // present in most titles is the franchise/subject itself ("One Piece"), not a
  // countable object in it — so it must not fill a count-noun slot
  // ("The Most Broken One Piece in the World").
  const titleCount = Math.max(1, titles.length);

  return cands
    .map((c) => ({ ...c, weight: c.count + (c.fromRef ? 2 : 0) + (c.words >= 2 ? 1 : 0) }))
    .sort((a, b) => b.weight - a.weight || b.words - a.words)
    .slice(0, limit)
    .map((c) => ({
      phrase: c.phrase, weight: c.weight, count: c.count, words: c.words, fromRef: c.fromRef,
      title: titleCase(c.phrase),
      dominance: +(c.count / titleCount).toFixed(3),
      isFranchise: c.count / titleCount > 0.5,
    }));
}

export const titleCase = (s) =>
  s.split(' ').map((w) => (STOP.has(w) && w.length <= 3 ? w : w[0].toUpperCase() + w.slice(1))).join(' ');
