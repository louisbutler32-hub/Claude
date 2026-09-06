import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLinear, auc, quantile, normalQuantile, normalCdf, percentileOf, kFolds, mean, sd } from '../src/stats.mjs';
import { extractFeatures, hasShoutWord, designRow, MODEL_FEATURES } from '../src/features.mjs';
import { extractEntities } from '../src/entities.mjs';
import { singularize, pluralize, numberFormFor, generate, formatFamily } from '../src/generate.mjs';
import { FORMATS, matchFormats, TOPIC_SAFE, SHRINKAGE, formatEvidence } from '../src/formats.mjs';
import { expectedViews, probabilityOfReaching, ctrAtPercentile, ctrPercentile, MODEL, distributionOf } from '../src/model.mjs';
import { forecast, ctrRequiredFor } from '../src/forecast.mjs';
import { parseCount, parsePercent, compact, ordinal } from '../src/format-util.mjs';
import { parseVideoId, isoDurationToSec } from '../src/youtube.mjs';
import { run } from '../src/cli.mjs';

/* ------------------------------------------------------------------- stats */
test('OLS recovers known coefficients exactly', () => {
  const { beta, r2 } = fitLinear([[1, 0], [1, 1], [1, 2], [1, 3]], [3, 5, 7, 9]);
  assert.ok(Math.abs(beta[0] - 3) < 1e-9);
  assert.ok(Math.abs(beta[1] - 2) < 1e-9);
  assert.ok(Math.abs(r2 - 1) < 1e-9);
});

test('AUC hits its known bounds and handles ties', () => {
  assert.equal(auc([1, 2, 3, 4], [0, 0, 1, 1]), 1);
  assert.equal(auc([4, 3, 2, 1], [0, 0, 1, 1]), 0);
  assert.equal(auc([1, 1, 1, 1], [0, 0, 1, 1]), 0.5);
  assert.equal(auc([1, 2], [1, 1]), 0.5, 'no negatives -> undefined, defaults to 0.5');
});

test('normal quantile and CDF are mutual inverses', () => {
  for (const p of [0.05, 0.25, 0.5, 0.75, 0.95]) {
    assert.ok(Math.abs(normalCdf(normalQuantile(p)) - p) < 5e-3, `p=${p}`);
  }
});

test('quantile and percentileOf agree on a known sample', () => {
  const s = [1, 2, 3, 4, 5];
  assert.equal(quantile(s, 0.5), 3);
  assert.equal(percentileOf(s, 3), 0.4);
  assert.equal(percentileOf(s, 0), 0);
  assert.equal(percentileOf(s, 99), 1);
});

test('kFolds partitions every index exactly once and is deterministic', () => {
  const a = kFolds(37, 5), b = kFolds(37, 5);
  assert.deepEqual(a, b, 'seeded, so reproducible');
  assert.equal(a.flat().length, 37);
  assert.equal(new Set(a.flat()).size, 37);
});

/* ---------------------------------------------------------------- features */
test('acronyms are not mistaken for shouting', () => {
  assert.equal(hasShoutWord('WW2 and AI Explained'), false);
  assert.equal(hasShoutWord('This Is INSANE'), true);
});

test('feature extraction flags the right devices', () => {
  const f = extractFeatures('12 INSANE One Piece Theories Explained!');
  assert.equal(f.hasNumber, 1);
  assert.equal(f.hasShout, 1);
  assert.equal(f.hasExtreme, 1);
  assert.equal(f.hasVersus, 0);
  assert.equal(extractFeatures('Goku vs Saitama').hasVersus, 1);
  assert.equal(extractFeatures('Why Did This Happen?').hasQuestion, 1);
});

test('design row length matches the declared feature list', () => {
  const row = designRow('Some Title Here', { lenMean: 40, lenSd: 10 });
  assert.equal(row.length, MODEL_FEATURES.length + 1, 'intercept + features');
  assert.ok(row.every(Number.isFinite));
});

/* ---------------------------------------------------------------- entities */
test('entity extraction rejects fragments, participles and function words', () => {
  const titles = [
    'The Most Broken Devil Fruits In One Piece',
    'All 11 Types Of Devil Fruits In One Piece Explained',
    'Devil Fruits Ranked From Worst To Best',
    'Every Devil Fruits Awakening In One Piece',
  ];
  const got = extractEntities(titles, { minCount: 2, limit: 20 }).map((e) => e.phrase);
  assert.ok(got.includes('devil fruits'), `expected "devil fruits", got ${got.join('|')}`);
  for (const bad of ['types of devil', 'fruits in one', 'one piece explained', 'devil fruits explained']) {
    assert.ok(!got.includes(bad), `"${bad}" should be rejected`);
  }
  assert.ok(!got.some((p) => /\b(of|in|to|the|and)\b/.test(p)), 'no function words inside a phrase');
  assert.ok(!got.some((p) => /\b\w+(ed|ing)\b$/.test(p) && p.length > 6), 'no participle endings');
});

test('n-grams never cross punctuation', () => {
  const got = extractEntities(
    ['Cold Case Files | True Crime Documentary', 'Cold Case Files | True Crime Documentary'],
    { minCount: 2, limit: 30 }
  ).map((e) => e.phrase);
  assert.ok(!got.includes('files true'), 'must not bridge the pipe');
});

test('a subsumed short phrase loses to its parent', () => {
  const titles = Array.from({ length: 6 }, (_, i) => `Devil Fruits Episode ${i} Breakdown`);
  const got = extractEntities(titles, { minCount: 2, limit: 20 }).map((e) => e.phrase);
  assert.ok(got.includes('devil fruits'));
  assert.ok(!got.includes('devil'), '"devil" is always part of "devil fruits"');
});

test('a term in most titles is flagged as the franchise', () => {
  const titles = Array.from({ length: 10 }, (_, i) => `One Piece Chapter ${i} Devil Fruits`);
  const ents = extractEntities(titles, { minCount: 2, limit: 20 });
  const op = ents.find((e) => e.phrase === 'one piece');
  assert.ok(op && op.isFranchise, 'the dominant term is the franchise');
});

/* ------------------------------------------------------- number agreement */
test('singularize and pluralize handle regular and irregular forms', () => {
  assert.equal(singularize('Devil Fruits'), 'Devil Fruit');
  assert.equal(singularize('Theories'), 'Theory');
  assert.equal(singularize('Crisis'), 'Crisis');
  assert.equal(singularize('People'), 'Person');
  assert.equal(pluralize('Devil Fruit'), 'Devil Fruits');
  assert.equal(pluralize('Theory'), 'Theories');
  assert.equal(pluralize('Devil Fruits'), 'Devil Fruits', 'already plural');
  assert.equal(pluralize('Box'), 'Boxes');
});

test('number form is read off the format text', () => {
  assert.equal(numberFormFor('Top [number] [superlative] [thing]'), 'plural');
  assert.equal(numberFormFor('Every [thing] Explained'), 'singular');
  assert.equal(numberFormFor('The Truth About [topic]'), null);
});

/* ----------------------------------------------------------------- formats */
test('shrinkage pulls low-evidence means in and leaves high-evidence means alone', () => {
  const rare = FORMATS.find((f) => f.format === 'How [thing] Is Made');        // 169 uses, raw 130.3
  const common = FORMATS.find((f) => f.format === '[person] Reacts to [event]'); // 1419 uses, raw 9.32
  assert.ok(rare.shrunkOutlier < rare.avgOutlier / 2, 'a wild mean on modest evidence is pulled hard');
  assert.ok(Math.abs(common.shrunkOutlier - common.avgOutlier) < 1, 'a mean on heavy evidence barely moves');
  assert.ok(rare.shrinkWeight < common.shrinkWeight);
});

test('every topic-safe format really exists and is fillable', () => {
  const known = new Set(FORMATS.map((f) => f.format));
  for (const f of TOPIC_SAFE) assert.ok(known.has(f), `unknown format: ${f}`);
  assert.ok(TOPIC_SAFE.size >= 30);
});

test('format matching finds the right structure', () => {
  assert.equal(matchFormats('The Truth About Imu', 1)[0].format, 'The Truth About [topic]');
  assert.equal(matchFormats('Top 10 Strongest Devil Fruits', 1)[0].format, 'Top [number] [superlative] [thing]');
  assert.equal(matchFormats('qqqq zzzz xxxx', 1).length, 0);
});

test('format evidence is bounded', () => {
  for (const f of FORMATS) {
    const e = formatEvidence(f);
    assert.ok(e >= 0 && e <= 1, `${f.format} -> ${e}`);
  }
});

/* ------------------------------------------------------------------- model */
test('CTR distribution reproduces YouTube\'s published quartiles', () => {
  assert.ok(Math.abs(ctrAtPercentile(0.25) - 0.02) < 1e-4, 'p25 must be 2%');
  assert.ok(Math.abs(ctrAtPercentile(0.75) - 0.10) < 1e-4, 'p75 must be 10%');
  assert.ok(Math.abs(ctrPercentile(0.02) - 0.25) < 5e-3);
});

test('expected views rise with subscribers and with age', () => {
  const at = (subs, ageDays) => expectedViews({ subs, ageDays, niche: 'naruto explained' }).median;
  assert.ok(at(1e3, 90) < at(1e4, 90));
  assert.ok(at(1e4, 90) < at(1e5, 90));
  assert.ok(at(1e4, 30) < at(1e4, 365), 'older videos accumulate views');
});

test('expected views percentiles are ordered', () => {
  const e = expectedViews({ subs: 50000, ageDays: 90, niche: 'true crime' });
  assert.ok(e.p10 < e.p25 && e.p25 < e.median && e.median < e.p75 && e.p75 < e.p90);
});

test('probability of reaching a goal falls as the goal rises', () => {
  const ctx = { subs: 10000, ageDays: 90, niche: 'naruto explained' };
  const p = [1e4, 1e5, 1e6].map((g) => probabilityOfReaching(g, ctx).p);
  assert.ok(p[0] > p[1] && p[1] > p[2]);
  assert.ok(p.every((x) => x >= 0 && x <= 1));
});

test('the shipped model records the null result and must not claim prediction', () => {
  const v = MODEL.title_form_validation;
  assert.match(v.verdict, /NULL RESULT/);
  assert.ok(Math.abs(v.leave_one_niche_out_auc - 0.5) < 0.05,
    'if this ever moves meaningfully, re-examine before claiming predictive power');
  assert.ok(MODEL.baseline.cv_r2 > 0.4, 'the baseline IS predictive and should stay so');
});

/* ---------------------------------------------------------------- forecast */
test('required impressions is exact arithmetic', () => {
  const f = forecast({ goalViews: 500000, targetCtr: 0.05, subs: 10000, niche: 'naruto explained', nicheDistribution: null });
  assert.equal(f.exact.requiredImpressions, 10000000);
  assert.equal(ctrRequiredFor(500000, 10000000), 0.05);
});

test('forecast reports a verdict and stays internally consistent', () => {
  const dist = distributionOf([1e4, 5e4, 1e5, 2e5, 5e5]);
  const f = forecast({ goalViews: 100000, targetCtr: 0.06, subs: 20000, niche: 'true crime', nicheDistribution: dist });
  assert.ok(['REALISTIC', 'STRETCH', 'AMBITIOUS', 'OUT OF RANGE'].includes(f.verdict.level));
  assert.equal(f.nicheContext.nicheMedianViews, 1e5);
  assert.ok(f.ctrContext.targetCtrPercentile > 0 && f.ctrContext.targetCtrPercentile < 1);
});

/* ------------------------------------------------------------------- utils */
test('count and percent parsing accept the forms people actually type', () => {
  assert.equal(parseCount('500k'), 500000);
  assert.equal(parseCount('1.2M'), 1200000);
  assert.equal(parseCount('12,500'), 12500);
  assert.ok(Number.isNaN(parseCount('banana')));
  assert.equal(parsePercent('6%'), 0.06);
  assert.equal(parsePercent('6'), 0.06);
  assert.equal(parsePercent('0.06'), 0.06);
});

test('compact and ordinal render sanely', () => {
  assert.equal(compact(1500), '1.5K');
  assert.equal(compact(2400000), '2.4M');
  assert.equal(compact(null), '—');
  assert.equal(ordinal(0.81), '81st');
  assert.equal(ordinal(0.12), '12th');
});

test('video ids are parsed from every common URL form', () => {
  for (const u of [
    'https://www.youtube.com/watch?v=aYx7WKk3_6I',
    'https://youtu.be/aYx7WKk3_6I',
    'https://www.youtube.com/shorts/aYx7WKk3_6I',
    'https://www.youtube.com/watch?list=x&v=aYx7WKk3_6I',
    'aYx7WKk3_6I',
  ]) assert.equal(parseVideoId(u), 'aYx7WKk3_6I', u);
  assert.equal(parseVideoId('https://example.com'), null);
  assert.equal(isoDurationToSec('PT1H2M3S'), 3723);
});

/* -------------------------------------------------------------- generation */
test('generated titles are complete, sane and non-duplicated', () => {
  const entities = [
    { phrase: 'devil fruits', title: 'Devil Fruits', words: 2, weight: 9, count: 9, isFranchise: false },
    { phrase: 'one piece', title: 'One Piece', words: 2, weight: 20, count: 20, isFranchise: true },
    { phrase: 'straw hat crew', title: 'Straw Hat Crew', words: 3, weight: 5, count: 5, isFranchise: false },
    { phrase: 'forest god', title: 'Forest God', words: 2, weight: 4, count: 4, isFranchise: false },
    { phrase: 'haki', title: 'Haki', words: 1, weight: 3, count: 3, isFranchise: false },
  ];
  const out = generate({ entities, referenceTitles: ['The Most Broken Devil Fruits In One Piece'], referenceFormats: [], limit: 10 });
  assert.ok(out.length >= 6, `expected several candidates, got ${out.length}`);
  const seen = new Set();
  for (const c of out) {
    assert.ok(!/\[\w+\]/.test(c.title), `unfilled slot: ${c.title}`);
    assert.ok(!/\s{2,}/.test(c.title), `double space: ${c.title}`);
    assert.ok(c.title.length >= 18 && c.title.length <= 100, `bad length: ${c.title}`);
    assert.ok(!seen.has(c.title.toLowerCase()), `duplicate: ${c.title}`);
    seen.add(c.title.toLowerCase());
    assert.ok(c.concept.angle && c.concept.hook && c.concept.beats.length >= 3 && c.concept.payoff);
    assert.ok(c.evidence.formatUses > 0);
  }
});

test('a filler never overlaps another in the same title', () => {
  const entities = [
    { phrase: 'one piece', title: 'One Piece', words: 2, weight: 9, count: 9, isFranchise: false },
    { phrase: 'one piece theory', title: 'One Piece Theory', words: 3, weight: 6, count: 6, isFranchise: false },
    { phrase: 'devil fruits', title: 'Devil Fruits', words: 2, weight: 5, count: 5, isFranchise: false },
    { phrase: 'forest god', title: 'Forest God', words: 2, weight: 4, count: 4, isFranchise: false },
  ];
  for (const c of generate({ entities, referenceTitles: [], referenceFormats: [], limit: 12 })) {
    assert.ok(!/\bOne Piece Theory vs Theory\b/i.test(c.title), c.title);
    // no token run repeated back to back
    assert.ok(!/\b(\w+ \w+) \w* ?\1\b/i.test(c.title), `repeats itself: ${c.title}`);
  }
});

test('the franchise term is kept out of count-noun slots', () => {
  const entities = [
    { phrase: 'one piece', title: 'One Piece', words: 2, weight: 30, count: 30, isFranchise: true },
    { phrase: 'devil fruits', title: 'Devil Fruits', words: 2, weight: 9, count: 9, isFranchise: false },
    { phrase: 'forest god', title: 'Forest God', words: 2, weight: 4, count: 4, isFranchise: false },
    { phrase: 'straw hat crew', title: 'Straw Hat Crew', words: 3, weight: 4, count: 4, isFranchise: false },
  ];
  for (const c of generate({ entities, referenceTitles: [], referenceFormats: [], limit: 12 })) {
    if (/^Top \d+/.test(c.title)) assert.ok(!/One Pieces?\b/.test(c.title), `franchise counted: ${c.title}`);
  }
});

test('person formats stay locked until names are supplied', () => {
  const entities = [
    { phrase: 'devil fruits', title: 'Devil Fruits', words: 2, weight: 9, count: 9, isFranchise: false },
    { phrase: 'forest god', title: 'Forest God', words: 2, weight: 5, count: 5, isFranchise: false },
    { phrase: 'straw hat crew', title: 'Straw Hat Crew', words: 3, weight: 4, count: 4, isFranchise: false },
    { phrase: 'haki', title: 'Haki', words: 1, weight: 3, count: 3, isFranchise: false },
  ];
  const without = generate({ entities, referenceTitles: [], referenceFormats: [], limit: 12 });
  assert.ok(without.every((c) => !c.format.includes('[person]')), 'no person slots without --people');
  const withNames = generate({ entities, referenceTitles: [], referenceFormats: [], people: ['Luffy', 'Imu'], limit: 12 });
  assert.ok(withNames.some((c) => /Luffy|Imu/.test(c.title)), 'supplied names get used');
});

test('candidate families are varied rather than all one type', () => {
  const entities = [
    { phrase: 'devil fruits', title: 'Devil Fruits', words: 2, weight: 9, count: 9, isFranchise: false },
    { phrase: 'forest god', title: 'Forest God', words: 2, weight: 5, count: 5, isFranchise: false },
    { phrase: 'straw hat crew', title: 'Straw Hat Crew', words: 3, weight: 4, count: 4, isFranchise: false },
    { phrase: 'void century', title: 'Void Century', words: 2, weight: 4, count: 4, isFranchise: false },
  ];
  const fams = new Set(generate({ entities, referenceTitles: [], referenceFormats: [], limit: 8 }).map((c) => c.family));
  assert.ok(fams.size >= 4, `expected variety, got ${[...fams].join(',')}`);
});

test('format family classification is stable', () => {
  assert.equal(formatFamily('[thing] vs [thing]: What\'s the Difference'), 'comparison');
  assert.equal(formatFamily('Top [number] [superlative] [thing]'), 'ranking');
  assert.equal(formatFamily('The Truth About [topic]'), 'revelation');
  assert.equal(formatFamily('What If [scenario]'), 'hypothetical');
});

/* ----------------------------------------------------------------- the CLI */
test('CLI rejects a run that is missing required options', async () => {
  const r = await run(['--niche', 'x']);
  assert.equal(r.exit, 1);
  assert.match(r.text, /Missing required option/);
});

test('CLI rejects unparseable numbers', async () => {
  assert.match((await run(['-n', 'x', '-g', 'banana', '-c', '5%'])).text, /not a view count/);
  assert.match((await run(['-n', 'x', '-g', '10k', '-c', 'banana'])).text, /not a percentage/);
});

test('CLI runs end to end offline and reports every section', async () => {
  const { text, exit, result } = await run([
    '-n', 'one piece theory explained', '-g', '500k', '-c', '6%', '-s', '12000', '--offline', '--limit', '6',
    '-r', 'https://youtu.be/aYx7WKk3_6I', '-r', 'https://youtu.be/cFJ589shfBk', '-r', 'https://youtu.be/g7848ecpY5w',
  ]);
  assert.equal(exit, 0);
  assert.equal(result.references.length, 3, 'all three references resolved from the corpus');
  assert.equal(result.candidates.length, 6);
  for (const section of [/YOUR THREE REFERENCE VIDEOS/, /IS YOUR GOAL REACHABLE/, /GENERATED TITLES/, /WHAT THIS TOOL WILL NOT TELL YOU/]) {
    assert.match(text, section);
  }
  assert.match(text, /500K views at 6\.0% CTR requires 8\.3M impressions/, 'exact arithmetic is shown');
  assert.ok(result.references.every((v) => v.performance), 'each reference is scored against its baseline');
});

test('CLI warns instead of failing when a niche is unknown', async () => {
  const { result } = await run(['-n', 'underwater basket weaving', '-g', '10k', '-c', '5%', '-s', '1000', '--offline', '--limit', '3']);
  assert.ok(result.warnings.some((w) => /corpus niche|whole corpus/.test(w)));
  assert.ok(result.candidates.length > 0, 'still produces ideas');
});

test('CLI never claims to predict CTR from a title', async () => {
  const { text } = await run(['-n', 'true crime', '-g', '100k', '-c', '5%', '-s', '5000', '--offline', '--limit', '3']);
  assert.match(text, /NOT a CTR prediction/);
  assert.ok(!/predicted CTR|CTR prediction:/i.test(text.replace(/NOT a CTR prediction/g, '')));
});
