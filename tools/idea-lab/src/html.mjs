/** Standalone HTML report for a single run. Self-contained, no network. */
import { compact, pct, ordinal } from './format-util.mjs';
import { MODEL } from './model.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function renderHtml(r) {
  const f = r.forecast;
  const v = MODEL.title_form_validation;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Idea Lab — ${esc(r.input.niche)}</title>
<style>
 :root{--bg:#fbfaf8;--fg:#1a1a19;--mut:#6b6b66;--line:#e2e0da;--card:#fff;--accent:#7a4b2a}
 @media (prefers-color-scheme:dark){:root{--bg:#151513;--fg:#eceae5;--mut:#9b9a93;--line:#2e2e2a;--card:#1d1d1a;--accent:#d9a072}}
 *{box-sizing:border-box}
 body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
 .wrap{max-width:860px;margin:0 auto;padding:40px 22px 80px}
 h1{font-size:1.6rem;margin:0 0 4px;letter-spacing:-.02em}
 h2{font-size:1.05rem;margin:44px 0 14px;text-transform:uppercase;letter-spacing:.09em;color:var(--mut);font-weight:600}
 .sub{color:var(--mut);margin:0 0 6px}
 .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px 20px;margin:12px 0}
 .idea h3{margin:0 0 4px;font-size:1.12rem;letter-spacing:-.01em}
 .meta{color:var(--mut);font-size:.85rem;margin-bottom:12px}
 .beat{margin:3px 0 3px 20px}
 .lbl{display:inline-block;min-width:66px;color:var(--mut);font-size:.82rem;text-transform:uppercase;letter-spacing:.06em;vertical-align:top}
 .row{margin:6px 0}
 table{border-collapse:collapse;width:100%;font-size:.9rem}
 td,th{border-bottom:1px solid var(--line);padding:7px 8px;text-align:left}
 td.n{text-align:right;font-variant-numeric:tabular-nums}
 .verdict{font-size:1.25rem;font-weight:600;color:var(--accent)}
 .tier{font-size:.72rem;letter-spacing:.09em;text-transform:uppercase;color:var(--mut);margin:16px 0 4px}
 pre{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:14px;overflow-x:auto;font-size:.83rem;white-space:pre-wrap}
 .warn{border-left:3px solid var(--accent);padding-left:14px;color:var(--mut)}
</style></head><body><div class="wrap">
<h1>YouTube Idea Lab</h1>
<p class="sub">${esc(r.input.niche)} · goal ${compact(r.input.goalViews)} views at ${pct(r.input.targetCtr)} CTR · ${compact(r.input.subs)} subs</p>
<p class="sub" style="font-size:.85rem">${esc(r.dataMode)}</p>

<h2>Reference videos</h2>
${r.references.map((x) => `<div class="card"><strong>${esc(x.title)}</strong>
<div class="meta">${compact(x.views)} views · ${compact(x.subs)} subs · ${Math.round(x.ageDays)}d old${x.performance ? ` · <b>${x.performance.multiple.toFixed(2)}×</b> its channel baseline (${ordinal(x.performance.percentile)} pct)` : ''}</div>
<div style="font-size:.88rem;color:var(--mut)">${x.formats.length ? esc(x.formats.map((y) => `"${y.format}" (${y.uses} uses)`).join(', ')) : 'no attested format matched — original structure'}</div></div>`).join('')}

<h2>Is the goal reachable?</h2>
<div class="card">
 <div class="verdict">${esc(f.verdict.level)} — P ≈ ${pct(f.reach.probability)}</div>
 <div class="tier">Exact — arithmetic</div>
 <table><tr><td>Impressions needed</td><td class="n">${compact(f.exact.requiredImpressions)}</td></tr></table>
 <div class="tier">Measured — real observed videos</div>
 <table>
  <tr><td>Median video in niche</td><td class="n">${compact(f.nicheContext.nicheMedianViews)}</td></tr>
  <tr><td>Goal's percentile in that sample</td><td class="n">${ordinal(f.nicheContext.goalNichePercentile)}</td></tr>
  <tr><td>Expected views at ${compact(r.input.subs)} subs</td><td class="n">${compact(f.reach.expected.median)}</td></tr>
 </table>
 <div class="tier">Modelled — CTR prior from YouTube's published figures</div>
 <table>
  <tr><td>Your ${pct(r.input.targetCtr)} target</td><td class="n">${ordinal(f.ctrContext.targetCtrPercentile)} percentile</td></tr>
  <tr><td>Population median CTR</td><td class="n">${pct(f.ctrContext.populationMedian)}</td></tr>
  ${f.nicheContext.ctrNeededAtTypicalImpressions ? `<tr><td>CTR needed at typical impressions</td><td class="n">${pct(f.nicheContext.ctrNeededAtTypicalImpressions)}</td></tr>` : ''}
 </table>
 ${f.verdict.notes.length ? `<div class="warn" style="margin-top:14px">${f.verdict.notes.map((n) => `<p>${esc(n)}</p>`).join('')}</div>` : ''}
</div>

<h2>Ideas (${r.candidates.length})</h2>
${r.candidates.map((c, i) => `<div class="card idea"><h3>${i + 1}. ${esc(c.title)}</h3>
<div class="meta">${esc(c.family)} · format "${esc(c.format)}" — ${c.evidence.formatUses} real videos, avg ${compact(c.evidence.formatAvgViews)} views</div>
<div class="row"><span class="lbl">Angle</span> ${esc(c.concept.angle)}</div>
<div class="row"><span class="lbl">Hook</span> ${esc(c.concept.hook)}</div>
<div class="row"><span class="lbl">Beats</span></div>
${c.concept.beats.map((b, k) => `<div class="beat">${k + 1}. ${esc(b)}</div>`).join('')}
<div class="row" style="margin-top:8px"><span class="lbl">Payoff</span> ${esc(c.concept.payoff)}</div></div>`).join('')}

<h2>Brief for writing more</h2>
<pre>${esc(r.handoff)}</pre>

<h2>What this tool will not tell you</h2>
<div class="card">
<p>It does <b>not</b> predict CTR or views from a title. That hypothesis was tested on ${MODEL.n_videos} real videos across ${MODEL.n_niches} niches and failed.</p>
<table>
 <tr><th>Test</th><th class="n">AUC</th></tr>
 <tr><td>Hand-built title features, random folds</td><td class="n">${v.random_fold_auc_hand_features.toFixed(3)}</td></tr>
 <tr><td>+ full vocabulary, random folds</td><td class="n">${v.random_fold_auc_plus_words.toFixed(3)}</td></tr>
 <tr><td><b>+ full vocabulary, leave-one-niche-out</b></td><td class="n"><b>${v.leave_one_niche_out_auc.toFixed(3)}</b></td></tr>
 <tr><td>Trained and tested inside one niche</td><td class="n">${v.within_niche_mean_auc.toFixed(3)}</td></tr>
</table>
<p style="color:var(--mut);font-size:.9rem">0.500 is a coin flip. The middle row looks like a result but leaks niche membership — its top-weighted "predictive" words are niche identity terms (film, dragon, football, house, money), not persuasion devices.</p>
<p>Nobody can read a competitor's real CTR: YouTube exposes it only to a video's owner in Studio. Pass <code>--actual-ctr</code> with your own figure to replace the modelled prior.</p>
</div>

<h2>What is measured</h2>
<table>
 <tr><td>Baseline view model, out-of-sample R²</td><td class="n">${MODEL.baseline.cv_r2.toFixed(3)}</td></tr>
 <tr><td>Corpus</td><td class="n">${MODEL.n_videos} videos / ${MODEL.n_niches} niches</td></tr>
 <tr><td>Unexplained spread between videos</td><td class="n">${MODEL.baseline.residual_spread_x}×</td></tr>
 <tr><td>Title formats aggregated over</td><td class="n">18,822 videos</td></tr>
 <tr><td>CTR distribution</td><td class="n">YouTube official, p25 2% / p75 10%</td></tr>
</table>
</div></body></html>`;
}
