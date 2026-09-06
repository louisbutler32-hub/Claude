/**
 * Goal feasibility.
 *
 * Three tiers of certainty, kept separate on purpose and labelled as such in the
 * report:
 *   EXACT     — arithmetic. impressions = views / CTR. No assumptions.
 *   MEASURED  — read off real observed view distributions.
 *   MODELLED  — uses YouTube's published CTR distribution as a prior, because
 *               third-party CTR is not observable through any API.
 */
import { expectedViews, probabilityOfReaching, ctrPercentile, ctrAtPercentile, MODEL } from './model.mjs';
import { percentileOf } from './stats.mjs';

export function forecast({ goalViews, targetCtr, subs, niche, nicheDistribution, ageDays = 90, actualCtr = null }) {
  // --- EXACT -------------------------------------------------------------
  const requiredImpressions = goalViews / targetCtr;

  // --- MODELLED: where the target CTR sits in YouTube's own distribution --
  const targetCtrPct = ctrPercentile(targetCtr);
  const medianCtr = MODEL.ctr.median;

  // --- MEASURED: where the goal sits in the niche's real view distribution
  let goalNichePercentile = null, nicheMedianViews = null;
  if (nicheDistribution) {
    nicheMedianViews = nicheDistribution.p50;
    goalNichePercentile = percentileOf(nicheDistribution.sorted, goalViews);
  }

  // --- MODELLED: impression volume implied by a typical video in the niche
  let impressionMultiple = null, ctrNeededAtTypicalImpressions = null, ctrNeededPercentile = null;
  if (nicheMedianViews) {
    const typicalImpressions = nicheMedianViews / medianCtr;
    impressionMultiple = requiredImpressions / typicalImpressions;
    ctrNeededAtTypicalImpressions = goalViews / typicalImpressions;
    ctrNeededPercentile = ctrPercentile(ctrNeededAtTypicalImpressions);
  }

  // --- MODELLED: probability of hitting the goal for this channel ---------
  const reach = probabilityOfReaching(goalViews, { subs, ageDays, niche });

  return {
    exact: { requiredImpressions, goalViews, targetCtr },
    ctrContext: {
      targetCtr,
      targetCtrPercentile: targetCtrPct,
      populationMedian: medianCtr,
      populationP25: MODEL.ctr.p25,
      populationP75: MODEL.ctr.p75,
      isAboveMedian: targetCtr > medianCtr,
      source: MODEL.ctr.source,
      actualCtr,
      actualCtrPercentile: actualCtr ? ctrPercentile(actualCtr) : null,
    },
    nicheContext: { nicheMedianViews, goalNichePercentile, impressionMultiple, ctrNeededAtTypicalImpressions, ctrNeededPercentile },
    reach: { probability: reach.p, zScore: reach.zScore, expected: reach.expected },
    verdict: verdictFor({ p: reach.p, targetCtrPct, goalNichePercentile, impressionMultiple }),
  };
}

function verdictFor({ p, targetCtrPct, goalNichePercentile, impressionMultiple }) {
  const notes = [];
  let level;
  if (p >= 0.35) level = 'REALISTIC';
  else if (p >= 0.12) level = 'STRETCH';
  else if (p >= 0.03) level = 'AMBITIOUS';
  else level = 'OUT OF RANGE';

  if (targetCtrPct > 0.9) notes.push(`A ${(targetCtrPct * 100).toFixed(0)}th-percentile CTR is not a plan you can rely on — it is an outcome you occasionally get.`);
  else if (targetCtrPct < 0.25) notes.push(`Your CTR target is conservative (${(targetCtrPct * 100).toFixed(0)}th percentile), so the goal rests on impression volume, not packaging.`);
  if (goalNichePercentile != null && goalNichePercentile > 0.9) notes.push(`The goal sits above ${(goalNichePercentile * 100).toFixed(0)}% of videos actually returned for this niche.`);
  if (impressionMultiple != null && impressionMultiple > 3) notes.push(`It needs roughly ${impressionMultiple.toFixed(1)}x the impression volume of a typical video in the niche — that is a distribution problem, not a title problem.`);
  return { level, notes };
}

/** Given fixed impressions, what CTR gets you to the goal? Pure arithmetic. */
export const ctrRequiredFor = (goalViews, impressions) => goalViews / impressions;

/** Views implied by an impression count at each decile of the CTR distribution. */
export function viewsByCtrDecile(impressions) {
  return [0.1, 0.25, 0.5, 0.75, 0.9].map((p) => ({
    percentile: p, ctr: ctrAtPercentile(p), views: impressions * ctrAtPercentile(p),
  }));
}
