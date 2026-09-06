/** Terminal report. Plain strings so output can be piped, redirected or tested. */
import { compact, pct, ordinal } from './format-util.mjs';
import { MODEL } from './model.mjs';

const W = 78;
const line = (c = '─') => c.repeat(W);
const head = (t) => `\n${t.toUpperCase()}\n${line()}`;
/** "label" plus body, wrapped with a hanging indent that lines up under the body. */
const field = (label, body, indent = 6, labelWidth = 9) => {
  const pre = ' '.repeat(indent);
  const head = pre + label.padEnd(labelWidth);
  const bodyIndent = indent + labelWidth;
  const wrapped = wrap(body, bodyIndent).slice(bodyIndent); // drop the leading pad of line 1
  return head + wrapped;
};
const wrap = (s, indent = 0, width = W) => {
  const pre = ' '.repeat(indent);
  const out = []; let cur = pre;
  for (const word of String(s).split(/\s+/)) {
    if (cur.length + word.length + 1 > width && cur.trim()) { out.push(cur); cur = pre + word; }
    else cur += (cur.trim() ? ' ' : '') + word;
  }
  if (cur.trim()) out.push(cur);
  return out.join('\n');
};

export function renderReport(r) {
  const L = [];
  L.push(line('═'));
  L.push('  YOUTUBE IDEA LAB — title & concept generation from measured evidence');
  L.push(line('═'));
  L.push(`  niche: ${r.input.niche}`);
  L.push(`  goal:  ${compact(r.input.goalViews)} views at ${pct(r.input.targetCtr)} CTR${r.input.subs ? `  ·  channel: ${compact(r.input.subs)} subs` : ''}`);
  L.push(`  data:  ${r.dataMode}`);

  /* ---------------------------------------------------- reference analysis */
  L.push(head('1. your three reference videos'));
  if (!r.references.length) {
    L.push(wrap('No reference videos could be resolved. Pass --ref with YouTube URLs, or run with --offline against videos present in the bundled corpus.', 2));
  } else {
    for (const v of r.references) {
      L.push(`  ▸ ${v.title}`);
      const bits = [`${compact(v.views)} views`, `${compact(v.subs)} subs`, `${Math.round(v.ageDays)}d old`];
      L.push(`    ${bits.join('  ·  ')}`);
      if (v.performance) {
        const m = v.performance.multiple;
        const verdict = m >= 2 ? 'genuine overperformer' : m >= 1 ? 'above the expected line' : 'below the expected line';
        L.push(`    vs expected for a channel this size, this age, this niche: ${m.toFixed(2)}x  (${ordinal(v.performance.percentile)} pct) — ${verdict}`);
      }
      L.push(`    format: ${v.formats.length ? v.formats.map((f) => `"${f.format}" (${f.uses} real uses)`).join(', ') : 'no attested format matched — this is an original structure'}`);
      L.push('');
    }
    const over = r.references.filter((v) => v.performance && v.performance.multiple >= 1.5).length;
    L.push(wrap(over === r.references.length
      ? `All ${r.references.length} references genuinely outperformed their channel baseline. These are good models to copy.`
      : over === 0
        ? `WARNING: none of your references beat the expected line for their channel size. They may look big only because the channels are big. Copying them copies the channel, not the idea.`
        : `${over} of ${r.references.length} references genuinely outperformed their channel baseline. Weight those more heavily.`, 2));
  }

  /* ------------------------------------------------------ goal feasibility */
  const f = r.forecast;
  L.push(head('2. is your goal reachable?'));
  L.push(`  VERDICT: ${f.verdict.level}     P(reaching ${compact(r.input.goalViews)} views) ≈ ${pct(f.reach.probability, 1)}`);
  L.push('');
  L.push('  EXACT (arithmetic, no assumptions):');
  L.push(`    ${compact(r.input.goalViews)} views at ${pct(r.input.targetCtr)} CTR requires ${compact(f.exact.requiredImpressions)} impressions.`);
  L.push('');
  L.push('  MEASURED (from real observed videos):');
  if (f.nicheContext.nicheMedianViews) {
    L.push(`    Median video in this niche: ${compact(f.nicheContext.nicheMedianViews)} views (n=${r.nicheDistribution.n}).`);
    L.push(`    Your goal sits at the ${ordinal(f.nicheContext.goalNichePercentile)} percentile of that sample.`);
  } else L.push('    No niche sample available.');
  L.push(`    Expected views for a ${compact(r.input.subs)}-sub channel here: median ${compact(f.reach.expected.median)} (p25 ${compact(f.reach.expected.p25)} – p75 ${compact(f.reach.expected.p75)}).`);
  L.push('');
  L.push('  MODELLED (CTR prior from YouTube\'s own published figures):');
  L.push(`    Your ${pct(r.input.targetCtr)} target is the ${ordinal(f.ctrContext.targetCtrPercentile)} percentile of all YouTube videos.`);
  L.push(`    Population median CTR is ${pct(f.ctrContext.populationMedian)}; the middle 50% runs ${pct(f.ctrContext.populationP25, 0)}–${pct(f.ctrContext.populationP75, 0)}.`);
  if (f.nicheContext.ctrNeededAtTypicalImpressions) {
    L.push(`    At the impression volume a typical video in this niche gets, you would need ${pct(f.nicheContext.ctrNeededAtTypicalImpressions)} CTR (${ordinal(f.nicheContext.ctrNeededPercentile)} pct).`);
    L.push(`    Or the same CTR with ${f.nicheContext.impressionMultiple.toFixed(1)}x the impressions.`);
  }
  if (f.ctrContext.actualCtr) {
    L.push('');
    L.push(`  YOUR REAL CTR (from Studio): ${pct(f.ctrContext.actualCtr)} — ${ordinal(f.ctrContext.actualCtrPercentile)} percentile.`);
    L.push(`    At that CTR, ${compact(r.input.goalViews)} views needs ${compact(r.input.goalViews / f.ctrContext.actualCtr)} impressions.`);
  }
  if (f.verdict.notes.length) { L.push(''); f.verdict.notes.forEach((n) => L.push(wrap('• ' + n, 2))); }

  /* ------------------------------------------------------------ candidates */
  L.push(head(`3. generated titles + concepts (${r.candidates.length})`));
  L.push(wrap('Ranked by EVIDENCE: how well-attested the underlying format is, and how closely it reflects your three references. This is NOT a CTR prediction — see section 5.', 2));
  L.push('');
  r.candidates.forEach((c, i) => {
    L.push(`  ${String(i + 1).padStart(2)}. ${c.title}`);
    L.push(`      format   "${c.format}" — ${c.evidence.formatUses} real videos use it, averaging ${compact(c.evidence.formatAvgViews)} views`);
    L.push(`      type     ${c.family}${c.matchesReferenceStructure ? '  ·  same structure as one of your references' : ''}`);
    L.push(field('angle', c.concept.angle));
    L.push(field('hook', c.concept.hook));
    c.concept.beats.forEach((b, k) => L.push(field(k === 0 ? 'beats' : '', `${k + 1}. ${b}`)));
    L.push(field('payoff', c.concept.payoff));
    L.push('');
  });

  /* ------------------------------------------------------------ handoff */
  L.push(head('4. brief for writing more'));
  L.push(wrap('Paste this into an LLM to generate further titles constrained by the same evidence:', 2));
  L.push('');
  r.handoff.split('\n').forEach((l) => L.push('  │ ' + l));

  /* ------------------------------------------------------------ honesty */
  L.push(head('5. what this tool will not tell you'));
  const v = MODEL.title_form_validation;
  L.push(wrap(`This tool does NOT predict CTR or views from a title, because that hypothesis was tested on ${MODEL.n_videos} real videos across ${MODEL.n_niches} niches and FAILED.`, 2));
  L.push('');
  L.push(`    hand-built title features, random folds .......... AUC ${v.random_fold_auc_hand_features.toFixed(3)}  (p = ${v.permutation_p_hand_features})`);
  L.push(`    + full title vocabulary, random folds ............ AUC ${v.random_fold_auc_plus_words.toFixed(3)}`);
  L.push(`    + full vocabulary, LEAVE-ONE-NICHE-OUT ........... AUC ${v.leave_one_niche_out_auc.toFixed(3)}  <- the honest split`);
  L.push(`    trained and tested inside a single niche ......... AUC ${v.within_niche_mean_auc.toFixed(3)}`);
  L.push('');
  L.push(wrap('AUC 0.50 is a coin flip. The middle line looks like a result, but it leaks: the top-weighted "predictive" words are niche identity terms (film, dragon, football, house, money), not persuasion devices. Split so the model must predict a niche it has never seen, and the signal is exactly chance.', 4));
  L.push('');
  L.push(wrap('Practical consequence: stop A/B-ing ALL CAPS, emoji, numbers and superlatives. In this data they carry no measurable effect on how a video performs relative to its channel. What does move: topic choice, and impression volume.', 2));
  L.push('');
  L.push(wrap(`Also: nobody can read a competitor's real CTR. YouTube exposes impressions and CTR only to a video's own owner in Studio. Any tool that shows you a rival's CTR is inferring it. Feed your own real CTR in with --actual-ctr to replace the modelled prior.`, 2));

  L.push(head('what IS measured here'));
  L.push(`    baseline view model, out-of-sample R² ............ ${MODEL.baseline.cv_r2.toFixed(3)}  (n=${MODEL.n_videos})`);
  L.push(`    unexplained spread between videos ............... ${MODEL.baseline.residual_spread_x}x`);
  L.push(`    title formats, real videos aggregated ........... 18,822`);
  L.push(`    CTR distribution ............................... YouTube official, p25 2% / p75 10%`);
  L.push('');
  L.push(line('═'));
  return L.join('\n');
}

/** The LLM handoff brief — all the real evidence, none of the invented claims. */
export function buildHandoff(r) {
  const ents = r.entities.slice(0, 14).map((e) => e.title).join(', ');
  const fmts = r.candidates.slice(0, 6).map((c) => `"${c.format}" (${c.evidence.formatUses} real uses)`).join('\n  - ');
  return [
    `Write 15 YouTube titles for the "${r.input.niche}" niche.`,
    ``,
    `The three reference videos I want to be like:`,
    ...r.references.map((v) => `  - "${v.title}" — ${compact(v.views)} views on a ${compact(v.subs)}-sub channel${v.performance ? ` (${v.performance.multiple.toFixed(1)}x its channel baseline)` : ''}`),
    ``,
    `Vocabulary that really occurs in this niche (use these, not invented terms):`,
    `  ${ents}`,
    ``,
    `Title structures with measured real-world usage:`,
    `  - ${fmts}`,
    ``,
    `Constraints derived from real data:`,
    `  - Median video in this niche gets ${compact(r.nicheDistribution?.p50)} views.`,
    `  - Title length in this niche typically runs ${r.lengthRange}.`,
    `  - Do NOT rely on ALL CAPS, emoji, numbers or superlatives to carry a title: measured across ${MODEL.n_videos} videos in ${MODEL.n_niches} niches, these have no effect on performance relative to channel size (leave-one-niche-out AUC 0.499).`,
    `  - Make the SUBJECT do the work. Topic choice is the lever that showed up in the data; packaging is not.`,
    ``,
    `For each title also give: the angle in one sentence, and the single strongest reason a viewer clicks it.`,
  ].join('\n');
}
