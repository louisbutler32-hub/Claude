/**
 * Candidate title + concept generation.
 *
 * Every candidate is a real, well-attested title FORMAT filled with vocabulary
 * that really occurs in the user's niche and reference videos. Nothing is
 * invented from nothing, and every candidate carries the evidence behind it.
 */
import { FORMATS, formatEvidence, matchFormats, TOPIC_SAFE, PERSON_ONLY } from './formats.mjs';
import { titleCase } from './entities.mjs';
import { extractFeatures } from './features.mjs';

const YEAR = new Date().getFullYear();

/**
 * Slot types we can fill responsibly. Formats needing anything else are skipped.
 * `person` is deliberately NOT here: frequency analysis cannot tell "Luffy" from
 * "Devil Fruits", and filling a person slot with an object noun produces
 * nonsense ("Broken Devil Fruits Reacts to ..."). Pass --people to unlock it.
 */
const FILLABLE_BASE = ['number', 'superlative', 'year', 'duration', 'adjective', 'thing', 'topic', 'event', 'place', 'spine', 'scenario'];

const NUMBERS = [3, 5, 7, 10, 12];
const SUPERLATIVES = ['Strongest', 'Most Broken', 'Biggest', 'Craziest', 'Most Overpowered', 'Worst', 'Best', 'Most Dangerous'];
const ADJECTIVES = ['Broken', 'Hidden', 'Forgotten', 'Underrated', 'Overpowered', 'Overlooked'];
const DURATIONS = ['10 Minutes', '24 Hours', 'A Week', '30 Days'];

/* ------------------------------------------------------------ number agreement */

const IRREGULAR_S = { people: 'person', men: 'man', women: 'woman', children: 'child', teeth: 'tooth' };
const IRREGULAR_P = { person: 'people', man: 'men', woman: 'women', child: 'children', tooth: 'teeth' };

/** Singularise the LAST word of a phrase: "Devil Fruits" -> "Devil Fruit". */
export function singularize(phrase) {
  const parts = phrase.split(' ');
  const w = parts[parts.length - 1];
  const lower = w.toLowerCase();
  if (IRREGULAR_S[lower]) { parts[parts.length - 1] = matchCase(w, IRREGULAR_S[lower]); return parts.join(' '); }
  if (/(ss|us|is|sis)$/i.test(w)) return phrase;              // "Bass", "Crisis" are already singular
  let out = w;
  if (/ies$/i.test(w) && w.length > 4) out = w.slice(0, -3) + 'y';   // Theories -> Theory
  else if (/(ches|shes|xes|zes|ses)$/i.test(w)) out = w.slice(0, -2);
  else if (/s$/i.test(w) && !/s$/i.test(w.slice(0, -1))) out = w.slice(0, -1);
  parts[parts.length - 1] = out;
  return parts.join(' ');
}

/** Pluralise the LAST word of a phrase: "Devil Fruit" -> "Devil Fruits". */
export function pluralize(phrase) {
  const parts = phrase.split(' ');
  const w = parts[parts.length - 1];
  const lower = w.toLowerCase();
  if (IRREGULAR_P[lower]) { parts[parts.length - 1] = matchCase(w, IRREGULAR_P[lower]); return parts.join(' '); }
  if (/s$/i.test(w)) return phrase;                          // already plural
  let out = w;
  if (/[^aeiou]y$/i.test(w)) out = w.slice(0, -1) + 'ies';    // Theory -> Theories
  else if (/(s|sh|ch|x|z)$/i.test(w)) out = w + 'es';
  else out = w + 's';
  parts[parts.length - 1] = out;
  return parts.join(' ');
}

const matchCase = (src, dst) => (src[0] === src[0].toUpperCase() ? dst[0].toUpperCase() + dst.slice(1) : dst);

/**
 * Does this format want a singular or plural subject?
 * Derived from the literal text around the slot, e.g. a preceding [number]
 * forces plural ("Top 10 Strongest Devil Fruits"), while "Every [thing]" and
 * "Is [thing] the..." force singular.
 */
export function numberFormFor(format) {
  if (/\[number\][^\[]*\[(?:superlative\]\s*\[)?thing\]/.test(format)) return 'plural';
  if (/\bRanked from\b/.test(format)) return 'plural';
  if (/\bEvery \[|\bIs \[thing\]|\bBetter Than \[|\ba \[/i.test(format)) return 'singular';
  if (/\[superlative\] \[thing\] (Ever|of All Time|in the World)/.test(format)) return 'singular';
  return null;
}

/** Which kind of video a format implies — drives the concept brief. */
export function formatFamily(format) {
  const f = format.toLowerCase();
  if (/\bvs\b|difference|better than|which is/.test(f)) return 'comparison';
  if (/^top \[number\]|ranking|ranked|\[number\] best/.test(f)) return 'ranking';
  if (/truth|secret|never tell|real reason|exposes|hidden|no one talks|lied|not what you think/.test(f)) return 'revelation';
  if (/what if|what happens when|can you|is \[thing\] the/.test(f)) return 'hypothetical';
  if (/explained|how to|guide|everything you need|how \[thing\]/.test(f)) return 'explainer';
  if (/story|history|downfall|collapse|evolution|what happened|the end of/.test(f)) return 'narrative';
  if (/i tried|i tested|i built|i spent|i ranked/.test(f)) return 'firstperson';
  return 'superlative';
}

const CONCEPTS = {
  comparison: {
    angle: (s) => `Put ${s.a} directly against ${s.b} and force a verdict instead of hedging.`,
    hook: (s) => `State the matchup and promise a definitive answer in the first ten seconds — "${s.a} or ${s.b}. One of these is not close."`,
    beats: (s) => [`Set the two sides and the criteria you will judge on`, `Case for ${s.a}, strongest evidence first`, `Case for ${s.b}, including the argument your audience will shout in the comments`, `Commit to a verdict and say what would change your mind`],
    payoff: 'A stated verdict. Comparison videos that refuse to conclude get punished in the comments.',
  },
  ranking: {
    angle: (s) => `Rank the ${s.a} your audience already argues about, with a defensible criterion.`,
    hook: () => `Open on the #1 for two seconds, then pull back — "we will get there, but you will disagree about #4."`,
    beats: (s) => [`Say the ranking criterion out loud so the list is arguable, not arbitrary`, `Work up the list, one clear reason each`, `Place one genuinely controversial entry deliberately high or low`, `Land #1 and defend it`],
    payoff: 'A ranked list people can quote and dispute. The controversial placement is what drives comments.',
  },
  revelation: {
    angle: (s) => `Take the thing people think they know about ${s.a} and show the part they have wrong.`,
    hook: (s) => `Lead with the common belief, then break it — "everyone says ${s.a}. Here is what the source actually shows."`,
    beats: (s) => [`State the accepted version fairly and completely`, `Introduce the detail that does not fit`, `Build the corrected account from evidence`, `Say what it changes going forward`],
    payoff: 'A genuine correction. This format collapses if the "truth" turns out to be trivial, so only use it when you actually have the receipts.',
  },
  hypothetical: {
    angle: (s) => `Run a disciplined what-if on ${s.a} and follow the consequences honestly.`,
    hook: (s) => `Pose the premise in one sentence and immediately name the surprising consequence you will land on.`,
    beats: (s) => [`Set the premise and, importantly, the rules — what stays fixed`, `First-order consequences, the ones people expect`, `Second-order consequences, the ones they do not`, `The scenario's end state, and what it reveals about the real story`],
    payoff: 'Rules stated up front. What-if videos lose the audience the moment the scenario feels arbitrary.',
  },
  explainer: {
    angle: (s) => `Make ${s.a} genuinely clear for someone who has been nodding along without understanding it.`,
    hook: () => `Name the confusion directly — "everyone uses this term. Almost nobody can define it."`,
    beats: (s) => [`The one-sentence version`, `The mechanism, built up in order`, `The edge case that shows you understand it properly`, `A compact recap the viewer can repeat to someone else`],
    payoff: 'A viewer who can now explain it themselves. That is what gets the video shared.',
  },
  narrative: {
    angle: (s) => `Tell the story of ${s.a} as a causal chain, not a list of events.`,
    hook: (s) => `Open at the most dramatic moment, then rewind — "this is how it ended. Here is how it started."`,
    beats: (s) => [`Cold open at the turning point`, `Rewind to the origin and set the stakes`, `The chain of decisions that made the ending inevitable`, `Return to the opening moment, now fully loaded`],
    payoff: 'Causation, not chronology. The rewind structure is what makes the ending land.',
  },
  firstperson: {
    angle: (s) => `Put yourself through ${s.a} and report what actually happened.`,
    hook: () => `Show the result first, then promise the process.`,
    beats: (s) => [`Why you did it and what you expected`, `The attempt, including what went wrong`, `The turning point`, `What you would tell someone about to try it`],
    payoff: 'Honest reporting including the failures. Sanitised attempts read as advertising.',
  },
  superlative: {
    angle: (s) => `Make the case that ${s.a} genuinely deserves the superlative, rather than asserting it.`,
    hook: (s) => `Name the claim and immediately acknowledge the obvious counter-argument.`,
    beats: (s) => [`State the claim and the standard you are judging against`, `The evidence, strongest first`, `Take the best counter-argument seriously`, `Restate the claim, now earned`],
    payoff: 'A defended claim. Superlative titles that do not defend the superlative feel like bait.',
  },
};

/** Build filler pools from real niche + reference vocabulary. */
function buildFillers(entities, people = []) {
  const franchise = new Set(entities.filter((e) => e.isFranchise).map((e) => e.title));
  const strong = entities.filter((e) => e.words >= 2).map((e) => e.title);
  const single = entities.filter((e) => e.words === 1).map((e) => e.title);
  // Multi-word entities name something specific ("Devil Fruits"); bare single
  // words are usually too thin to carry a title ("Theory"). Prefer the former
  // whenever the niche gives us enough of them.
  const subjectPool = strong.length >= 4 ? strong : [...strong, ...single];
  const pool = [...strong, ...single];
  if (!pool.length) return null;
  // Count-noun slots exclude the franchise term and any named person: you can
  // rank "Devil Fruits", but "Top 7 Craziest Madara Uchihas" is wrong.
  const named = new Set(people.map((p) => p.toLowerCase()));
  const countable = subjectPool.filter((t) => !franchise.has(t) && !named.has(t.toLowerCase()));
  return {
    thing: subjectPool, topic: subjectPool, event: subjectPool, place: subjectPool, spine: subjectPool,
    _countable: countable.length >= 3 ? countable : subjectPool,
    ...(people.length ? { person: people } : {}),
    number: NUMBERS.map(String),
    superlative: SUPERLATIVES,
    adjective: ADJECTIVES,
    year: [String(YEAR)],
    duration: DURATIONS,
    scenario: buildScenarios(people.length ? [...people, ...subjectPool] : subjectPool),
  };
}

function buildScenarios(pool) {
  const shapes = [
    (a) => `${a} Never Existed`,
    (a, b) => `${a} And ${b} Swapped Places`,
    (a) => `${a} Won`,
    (a) => `${a} Was The Villain`,
    (a) => `Nobody Believed ${a}`,
    (a, b) => `${a} Replaced ${b}`,
  ];
  const out = [];
  for (let i = 0; i < pool.length && out.length < 24; i++) {
    const a = pool[i], b = pool[(i + 3) % pool.length];
    if (a === b) continue;
    shapes.forEach((s) => out.push(s(a, b)));
  }
  return out;
}

/** Fill one format, cycling fillers so a single run produces variety. */
function fill(format, fillers, seedIdx) {
  const used = new Set();
  const bySlot = {};
  const numberForm = numberFormFor(format);
  const needsCountNoun = /\[superlative\]\s*\[thing\]|\[number\]/.test(format);
  let ok = true;
  const filled = format.replace(/\[(\w+)\]/g, (_, slot) => {
    const pool = (needsCountNoun && NOUNY.has(slot) && fillers._countable) ? fillers._countable : fillers[slot];
    if (!pool || !pool.length) { ok = false; return `[${slot}]`; }
    // Walk from a per-candidate offset so repeated slots in one title differ.
    for (let k = 0; k < pool.length; k++) {
      const raw = pool[(seedIdx + k * 7 + used.size * 11) % pool.length];
      // Never pick a value that overlaps one already used: "One Piece Theory vs Theory".
      if (overlapsAny(raw, used)) continue;
      const v = applyNumberForm(raw, slot, numberForm);
      if (overlapsAny(v, used)) continue;
      used.add(v); (bySlot[slot] ||= []).push(v); return v;
    }
    ok = false; return pool[0];
  });
  return ok ? { text: filled, fillers: [...used], bySlot } : null;
}

/** True if `v` contains, or is contained by, anything already used. */
function overlapsAny(v, used) {
  const a = v.toLowerCase();
  for (const u of used) {
    const b = u.toLowerCase();
    if (a === b || a.includes(b) || b.includes(a)) return true;
  }
  return false;
}

const NOUNY = new Set(['thing', 'topic', 'event', 'place', 'spine']);
function applyNumberForm(v, slot, form) {
  if (!form || !NOUNY.has(slot)) return v;
  return form === 'plural' ? pluralize(v) : singularize(v);
}

/** Reject malformed or unusable output before it ever reaches the user. */
function isSane(t) {
  if (!t || /\[\w+\]/.test(t)) return false;
  if (t.length < 18 || t.length > 100) return false;
  if (/\s{2,}/.test(t)) return false;
  const words = t.toLowerCase().split(/\s+/);
  // Reject a title that repeats the same significant word three or more times.
  const counts = new Map();
  for (const w of words) if (w.length > 3) counts.set(w, (counts.get(w) || 0) + 1);
  if ([...counts.values()].some((c) => c >= 3)) return false;
  return true;
}

/**
 * Generate ranked candidates.
 * Ranking is by EVIDENCE (how well-attested the format is, and how closely the
 * candidate reflects the three references) — explicitly not a CTR prediction.
 */
export function generate({ entities, referenceTitles, referenceFormats, people = [], limit = 12 }) {
  const fillers = buildFillers(entities, people);
  if (!fillers) return [];
  const FILLABLE = new Set(people.length ? [...FILLABLE_BASE, 'person'] : FILLABLE_BASE);
  const refWords = new Set(referenceTitles.flatMap((t) => t.toLowerCase().split(/\W+/)).filter((w) => w.length > 3));
  const refFormatNames = new Set(referenceFormats.map((f) => f.format));

  // Only formats that are curated as grammatical for an abstract subject, plus
  // person formats when the caller supplied real names.
  const allowed = (f) => TOPIC_SAFE.has(f.format) || (people.length && PERSON_ONLY.has(f.format));
  const usable = FORMATS
    .filter((f) => allowed(f) && f.slots.length > 0 && f.slots.every((s) => FILLABLE.has(s)))
    .sort((a, b) => formatEvidence(b) - formatEvidence(a));

  const seen = new Set();
  const out = [];
  for (let variant = 0; variant < 12 && out.length < limit * 4; variant++) {
    for (const f of usable) {
      const made = fill(f.format, fillers, variant * 5 + f.uses);
      if (!made || !isSane(made.text)) continue;
      const key = made.text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      // Similarity to the references: shared vocabulary + shared structure.
      const candWords = new Set(made.text.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
      let shared = 0; for (const w of candWords) if (refWords.has(w)) shared++;
      const vocabSim = shared / Math.max(1, candWords.size);
      const structureSim = refFormatNames.has(f.format) ? 1 : 0;
      const similarity = 0.7 * vocabSim + 0.3 * structureSim;

      out.push({
        title: made.text,
        format: f.format,
        family: formatFamily(f.format),
        evidence: {
          formatUses: f.uses,
          formatAvgViews: f.avgViews,
          formatOutlierRaw: f.avgOutlier,
          formatOutlierShrunk: +f.shrunkOutlier.toFixed(2),
          formatExample: f.example,
          formatEvidenceScore: +formatEvidence(f).toFixed(3),
        },
        similarityToReferences: +similarity.toFixed(3),
        matchesReferenceStructure: structureSim === 1,
        fillers: made.fillers,
        bySlot: made.bySlot,
        features: extractFeatures(made.text),
      });
    }
  }

  const ranked = out
    .map((c) => ({ ...c, score: +(0.6 * c.evidence.formatEvidenceScore + 0.4 * c.similarityToReferences).toFixed(4) }))
    .sort((a, b) => b.score - a.score);

  return diversify(ranked, limit).map((c) => ({ ...c, concept: buildConcept(c) }));
}

/**
 * Take the best candidates while keeping the list varied.
 * Pure evidence ranking returns the same handful of high-usage formats for
 * every niche, which makes a set of ideas feel templated. This walks the
 * ranking in family order so the user gets a comparison, a ranking, a
 * revelation, a what-if and so on, still best-first inside each family.
 */
function diversify(ranked, limit) {
  const byFamily = new Map();
  for (const c of ranked) {
    if (!byFamily.has(c.family)) byFamily.set(c.family, []);
    byFamily.get(c.family).push(c);
  }
  const queues = [...byFamily.values()];
  const picked = [];
  const usedFormats = new Set();
  while (picked.length < limit && queues.some((q) => q.length)) {
    for (const q of queues) {
      if (picked.length >= limit) break;
      // Never show the same format twice.
      while (q.length && usedFormats.has(q[0].format)) q.shift();
      if (!q.length) continue;
      const next = q.shift();
      usedFormats.add(next.format);
      picked.push(next);
    }
  }
  return picked.sort((a, b) => b.score - a.score);
}

/** A production brief, derived from the format's family. */
export function buildConcept(candidate) {
  const tmpl = CONCEPTS[candidate.family] ?? CONCEPTS.superlative;
  const bs = candidate.bySlot || {};
  // Name the actual subject. Superlatives, numbers and years are decoration.
  const subjects = [...(bs.thing || []), ...(bs.topic || []), ...(bs.person || []), ...(bs.scenario || []), ...(bs.event || []), ...(bs.place || [])];
  const s = { a: subjects[0] ?? candidate.fillers[0] ?? 'the subject', b: subjects[1] ?? 'the alternative' };
  return {
    angle: tmpl.angle(s),
    hook: tmpl.hook(s),
    beats: tmpl.beats(s),
    payoff: tmpl.payoff,
  };
}

export { matchFormats };
