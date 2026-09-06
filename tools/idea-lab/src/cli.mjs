#!/usr/bin/env node
/**
 * YouTube Idea Lab — CLI.
 *
 *   node src/cli.mjs --ref URL --ref URL --ref URL --niche "one piece theory" \
 *                    --goal 500k --ctr 6% --subs 12000
 *
 * With YOUTUBE_API_KEY set it reads live stats for your references and the
 * live view distribution of your niche. Without one, pass --offline and it
 * falls back to the bundled 729-video corpus.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseVideoId, fetchVideos, fetchNiche, YouTubeError } from './youtube.mjs';
import { MODEL, performancePercentile, distributionOf, nicheStats, closestNiche } from './model.mjs';
import { matchFormats } from './formats.mjs';
import { extractEntities } from './entities.mjs';
import { generate } from './generate.mjs';
import { forecast } from './forecast.mjs';
import { renderReport, buildHandoff } from './report.mjs';
import { parseCount, parsePercent, compact } from './format-util.mjs';
import { extractFeatures } from './features.mjs';
import { quantile } from './stats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* --------------------------------------------------------------- arguments */
function parseArgs(argv) {
  const out = { refs: [], limit: 12 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--ref': case '-r': out.refs.push(next()); break;
      case '--niche': case '-n': out.niche = next(); break;
      case '--goal': case '-g': out.goal = next(); break;
      case '--ctr': case '-c': out.ctr = next(); break;
      case '--subs': case '-s': out.subs = next(); break;
      case '--actual-ctr': out.actualCtr = next(); break;
      case '--age-days': out.ageDays = Number(next()); break;
      case '--limit': out.limit = Number(next()); break;
      case '--people': out.people = next(); break;
      case '--offline': out.offline = true; break;
      case '--json': out.json = next(); break;
      case '--html': out.html = next(); break;
      case '--help': case '-h': out.help = true; break;
      default:
        if (a.startsWith('-')) throw new Error(`unknown option: ${a}`);
        out.refs.push(a);
    }
  }
  return out;
}

const USAGE = `
YouTube Idea Lab — generate titles and concepts from measured evidence.

  --ref, -r URL       a reference video you want to be like (pass 3 times)
  --niche, -n TEXT    your niche, e.g. "one piece theory"        [required]
  --goal, -g N        target views, e.g. 500k                    [required]
  --ctr, -c N         target CTR, e.g. 6%                        [required]
  --subs, -s N        your channel's subscriber count      [recommended]
  --people LIST       comma-separated character/person names, e.g. "Luffy,Imu"
                      unlocks title formats that need a named subject
  --actual-ctr N      your real CTR from YouTube Studio, to replace the prior
  --age-days N        horizon for the forecast (default 90)
  --limit N           how many ideas to generate (default 12)
  --offline           skip the live API, use the bundled 729-video corpus
  --json FILE         also write the full result as JSON
  --html FILE         also write a standalone HTML report

Set YOUTUBE_API_KEY for live data. Without it, use --offline.

Example:
  node src/cli.mjs -n "one piece theory" -g 500k -c 6% -s 12000 --offline \\
    -r https://youtu.be/aYx7WKk3_6I -r https://youtu.be/cFJ589shfBk -r https://youtu.be/g7848ecpY5w
`;

/* ------------------------------------------------------------- corpus lookup */
function loadCorpus() {
  const c = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'corpus.json'), 'utf8'));
  const AS_OF = new Date('2026-09-06T00:00:00Z').getTime();
  return c.rows.map(([id, title, views, subs, published, durationSec, likes, comments, query]) => ({
    id, title, views, subs, query, durationSec,
    publishedAt: published,
    ageDays: (AS_OF - new Date(published + 'T00:00:00Z').getTime()) / 86400e3,
  }));
}

/* --------------------------------------------------------------------- main */
export async function run(argv) {
  const args = parseArgs(argv);
  if (args.help || !argv.length) return { text: USAGE, exit: 0 };

  const missing = ['niche', 'goal', 'ctr'].filter((k) => !args[k]);
  if (missing.length) return { text: `Missing required option(s): ${missing.map((m) => '--' + m).join(', ')}\n${USAGE}`, exit: 1 };

  const goalViews = parseCount(args.goal);
  const targetCtr = parsePercent(args.ctr);
  if (!Number.isFinite(goalViews) || goalViews <= 0) return { text: `--goal "${args.goal}" is not a view count (try 500k)`, exit: 1 };
  if (!Number.isFinite(targetCtr) || targetCtr <= 0 || targetCtr >= 1) return { text: `--ctr "${args.ctr}" is not a percentage (try 6%)`, exit: 1 };
  const actualCtr = args.actualCtr ? parsePercent(args.actualCtr) : null;

  const key = process.env.YOUTUBE_API_KEY;
  const live = !args.offline && !!key;
  const warnings = [];
  if (!args.offline && !key) warnings.push('YOUTUBE_API_KEY is not set — falling back to the bundled corpus. Live data would be more accurate.');

  const corpus = loadCorpus();
  const corpusById = new Map(corpus.map((v) => [v.id, v]));

  /* --------------------------------------------- resolve reference videos */
  const refIds = args.refs.map(parseVideoId).filter(Boolean);
  const unparsed = args.refs.length - refIds.length;
  if (unparsed) warnings.push(`${unparsed} reference(s) could not be parsed as YouTube URLs or IDs.`);

  let references = [];
  let dataMode;
  if (live && refIds.length) {
    try {
      references = await fetchVideos(refIds, key);
      dataMode = 'LIVE — YouTube Data API v3 (real current stats)';
    } catch (e) {
      if (!(e instanceof YouTubeError)) throw e;
      warnings.push(`Live fetch failed (${e.message}) — falling back to the bundled corpus.`);
      references = refIds.map((id) => corpusById.get(id)).filter(Boolean);
      dataMode = 'OFFLINE — bundled corpus (live fetch failed)';
    }
  } else {
    references = refIds.map((id) => corpusById.get(id)).filter(Boolean);
    dataMode = `OFFLINE — bundled corpus of ${corpus.length} real videos, collected 2026-09-06`;
    const notFound = refIds.length - references.length;
    if (notFound) warnings.push(`${notFound} reference video(s) are not in the bundled corpus. Set YOUTUBE_API_KEY and drop --offline to analyse any video.`);
  }

  /* --------------------------------------------------- niche distribution */
  let nicheVideos = [];
  let nicheKey = args.niche;
  if (live) {
    try { nicheVideos = await fetchNiche(args.niche, key, { max: 50 }); } catch (e) { warnings.push(`Niche fetch failed (${e.message}).`); }
  }
  if (!nicheVideos.length) {
    const match = closestNiche(args.niche);
    const exact = MODEL.baseline.niches.includes(args.niche) ? args.niche : match?.niche;
    if (exact) {
      nicheKey = exact;
      nicheVideos = corpus.filter((v) => v.query === exact);
      if (exact !== args.niche) warnings.push(`No live data; using the closest corpus niche "${exact}" as the baseline for "${args.niche}".`);
    } else {
      nicheVideos = corpus;
      nicheKey = MODEL.baseline.niches[0];
      warnings.push(`"${args.niche}" does not match a corpus niche; using the whole corpus as a rough baseline. Live data would be much better here.`);
    }
  }
  const usableNiche = nicheVideos.filter((v) => v.ageDays >= 14 && v.views >= 100);
  const nicheDistribution = distributionOf(usableNiche.map((v) => v.views));

  const subs = args.subs ? parseCount(args.subs)
    : (nicheStats(nicheKey)?.subs_p50 ?? quantile(usableNiche.map((v) => v.subs).sort((a, b) => a - b), 0.5) ?? 10000);
  if (!args.subs) warnings.push(`--subs not given; assuming ${compact(subs)} (the median channel in this niche). Pass --subs for an accurate forecast.`);

  /* ------------------------------------------------------- analyse the refs */
  const ageDays = Number.isFinite(args.ageDays) ? args.ageDays : 90;
  references = references.map((v) => ({
    ...v,
    performance: performancePercentile(v.views, { subs: v.subs, ageDays: v.ageDays, niche: nicheKey }),
    formats: matchFormats(v.title, 2),
  }));

  /* --------------------------------------------------- vocabulary + ideas */
  const refTitles = references.map((v) => v.title);
  const nicheTitles = usableNiche.map((v) => v.title);
  const entities = extractEntities(nicheTitles, { boost: refTitles, minCount: 2, limit: 40 });
  const referenceFormats = references.flatMap((v) => v.formats);
  const people = (args.people || '').split(',').map((p) => p.trim()).filter(Boolean);
  const candidates = generate({ entities, referenceTitles: refTitles, referenceFormats, people, limit: args.limit });

  const lens = nicheTitles.map((t) => extractFeatures(t).len).sort((a, b) => a - b);
  const lengthRange = lens.length ? `${Math.round(quantile(lens, 0.25))}–${Math.round(quantile(lens, 0.75))} characters` : 'unknown';

  /* ------------------------------------------------------------- forecast */
  const fc = forecast({ goalViews, targetCtr, subs, niche: nicheKey, nicheDistribution, ageDays, actualCtr });

  const result = {
    input: { niche: args.niche, nicheKey, goalViews, targetCtr, subs, ageDays, actualCtr, people },
    dataMode, warnings, references, nicheDistribution, entities, candidates, forecast: fc, lengthRange,
    modelProvenance: {
      corpusVideos: MODEL.n_videos, niches: MODEL.n_niches,
      baselineCvR2: MODEL.baseline.cv_r2,
      titleFormVerdict: MODEL.title_form_validation.verdict,
      ctrSource: MODEL.ctr.source,
    },
  };
  result.handoff = buildHandoff(result);

  let text = renderReport(result);
  if (warnings.length) text = `NOTES\n${warnings.map((w) => '  ! ' + w).join('\n')}\n` + text;

  if (args.json) { fs.writeFileSync(args.json, JSON.stringify(result, null, 2)); text += `\n\nwrote ${args.json}`; }
  if (args.html) {
    const { renderHtml } = await import('./html.mjs');
    fs.writeFileSync(args.html, renderHtml(result)); text += `\nwrote ${args.html}`;
  }
  return { text, exit: 0, result };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run(process.argv.slice(2))
    .then(({ text, exit }) => { console.log(text); process.exit(exit); })
    .catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
}
