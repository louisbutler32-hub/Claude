/**
 * Title feature extraction.
 *
 * Every feature is a pure function of the title string alone, so a candidate
 * title that does not exist yet can be scored on exactly the same footing as a
 * real video from the corpus. That symmetry is what makes the fitted model
 * usable for prediction rather than just description.
 */

// Words that are legitimately upper-case and must not count as "shouting".
const ACRONYMS = new Set([
  'A', 'I', 'AI', 'US', 'USA', 'UK', 'EU', 'TV', 'PC', 'DIY', 'FAQ', 'CEO', 'NASA',
  'WW1', 'WW2', 'WWI', 'WWII', 'HD', 'VR', 'AR', 'OP', 'MHA', 'JJK', 'DBZ', 'ORV',
  'LOTM', 'FNAF', 'GTA', 'NBA', 'NFL', 'F1', 'SUV', 'VHS', 'MP4', 'OBS', 'HDMI',
]);

const SUPERLATIVE = /\b(best|worst|biggest|smallest|strongest|weakest|fastest|slowest|richest|greatest|craziest|deadliest|rarest|hardest|easiest|most|least|ultimate|top|#1|number one)\b/i;
const CURIOSITY = /\b(secret|secrets|truth|hidden|nobody|no one|never|actually|really|reason|why|mystery|revealed|exposed|explains?|explained|finally|turns out|the real)\b/i;
const CONTRARIAN = /\b(wrong|mistake|lied|lie|myth|stop|don'?t|isn'?t|wasn'?t|not|worse|overrated|underrated|fake|scam|problem|broken|failed|ruined)\b/i;
const EXTREME = /\b(insane|crazy|shocking|mind[- ]?blowing|brutal|terrifying|unbelievable|impossible|perfect|legendary|epic|god[- ]?tier|op|overpowered|savage|dark)\b/i;
const COMPLETIONIST = /\b(every|all|entire|complete|full|whole)\b/i;
const SECOND_PERSON = /\b(you|your|you'?re|you'?ll|yourself)\b/i;
const QUESTION_WORD = /^(who|what|when|where|why|how|is|are|can|could|would|should|did|does|do|will)\b/i;
const VERSUS = /\b(vs\.?|versus)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

/** Split a title into word-ish tokens, keeping internal apostrophes. */
export const tokenize = (t) => (t.match(/[A-Za-z0-9'’#-]+/g) || []);

/** True when the title contains an all-caps "shout" word that is not an acronym. */
export function hasShoutWord(title) {
  return tokenize(title).some(
    (w) => w.length >= 3 && w === w.toUpperCase() && /[A-Z]/.test(w) && !ACRONYMS.has(w.toUpperCase())
  );
}

/**
 * The full feature vector. Keys are stable — the fitted coefficients in
 * model-coefficients.json are keyed by these exact names.
 */
export function extractFeatures(title) {
  const t = String(title || '');
  const words = tokenize(t);
  return {
    // Shape
    len: t.length,
    words: words.length,
    // Binary devices
    hasNumber: /\d/.test(t) ? 1 : 0,
    hasSuperlative: SUPERLATIVE.test(t) ? 1 : 0,
    hasCuriosity: CURIOSITY.test(t) ? 1 : 0,
    hasContrarian: CONTRARIAN.test(t) ? 1 : 0,
    hasExtreme: EXTREME.test(t) ? 1 : 0,
    hasCompletionist: COMPLETIONIST.test(t) ? 1 : 0,
    hasSecondPerson: SECOND_PERSON.test(t) ? 1 : 0,
    hasVersus: VERSUS.test(t) ? 1 : 0,
    hasQuestion: t.includes('?') || QUESTION_WORD.test(t.trim()) ? 1 : 0,
    hasShout: hasShoutWord(t) ? 1 : 0,
    hasBracket: /[\[\(\|]/.test(t) ? 1 : 0,
    hasEmoji: EMOJI.test(t) ? 1 : 0,
    hasYear: /\b(19|20)\d{2}\b/.test(t) ? 1 : 0,
  };
}

/**
 * Feature names used as MODEL INPUTS, in fixed order.
 * `len` and `words` are transformed before entering the model (see designRow).
 */
export const MODEL_FEATURES = [
  'lenZ', 'lenZSq',
  'hasNumber', 'hasSuperlative', 'hasCuriosity', 'hasContrarian', 'hasExtreme',
  'hasCompletionist', 'hasSecondPerson', 'hasVersus', 'hasQuestion', 'hasShout',
  'hasBracket', 'hasEmoji', 'hasYear',
];

/**
 * Build one model design row (with leading intercept).
 * Title length enters as a standardised value plus its square, because the
 * relationship is expected to be non-monotonic: titles can be too short to
 * carry a hook and too long to survive truncation on a phone.
 */
export function designRow(title, norm) {
  const f = extractFeatures(title);
  const lenZ = (f.len - norm.lenMean) / (norm.lenSd || 1);
  const vals = {
    ...f,
    lenZ,
    lenZSq: lenZ * lenZ,
  };
  return [1, ...MODEL_FEATURES.map((k) => vals[k])];
}
