# YouTube Idea Lab

Paste three videos you want to be like, plus your niche, goal views and target
CTR. Get back title + concept ideas, and an honest read on whether the goal is
reachable.

Zero dependencies. Runs on plain Node 20+.

```bash
cd tools/idea-lab

node src/cli.mjs \
  --niche "one piece theory" \
  --goal 500k \
  --ctr 6% \
  --subs 12000 \
  --people "Luffy,Imu,Shanks" \
  --ref https://youtu.be/aYx7WKk3_6I \
  --ref https://youtu.be/cFJ589shfBk \
  --ref https://youtu.be/g7848ecpY5w
```

Set `YOUTUBE_API_KEY` for live data; add `--offline` to run against the bundled
729-video corpus instead. `--html report.html` and `--json result.json` write the
run out. `npm test` runs 39 tests.

---

## Read this before you show anyone the output

**This tool does not predict CTR or views from a title, because that does not
work.** I tested it properly before building on it, and it failed:

| test | AUC |
|---|---|
| hand-built title features (caps, emoji, numbers, superlatives), random folds | 0.519 (p = 0.22) |
| + the full title vocabulary, random folds | 0.590 |
| **+ the full vocabulary, leave-one-niche-out** | **0.499** |
| trained and tested inside a single niche | 0.467 |

AUC 0.500 is a coin flip. The third row is the one that counts.

Row two looks like a finding — and if I had stopped there I could have shipped a
confident-looking "title score". It is an artefact of the split. Random folds put
videos from the same niche in both train and test, so the model learns niche
membership, not title craft. Its top-weighted "predictive" words are *film,
dragon, football, house, money* — niche identity terms. Force it to predict a
niche it has never seen and the signal disappears completely.

Corpus: 677 usable videos across 19 niches, real public stats, collected
2026-09-06.

**What this means for you.** Stop A/B-ing ALL CAPS, emoji, numbers and
superlatives — in this data they have no measurable effect on how a video does
relative to its channel. The levers that survive measurement are *what the video
is about* and *how many impressions it gets*.

**And nobody can read a competitor's CTR.** YouTube exposes impressions and CTR
only to a video's own owner, in Studio. There is no public or partner API for
it. Any tool that shows you a rival's CTR is inferring or inventing it. Pass your
own real figure with `--actual-ctr 4.2%` to replace the modelled prior.

## What is actually measured

| | |
|---|---|
| Baseline view model, **out-of-sample** R² | **0.515** |
| Corpus | 729 videos, 19 niches, real public stats |
| Title formats | aggregated over 18,822 real videos |
| CTR distribution | YouTube official: p25 2%, p75 10% |
| Unexplained spread between videos | 3.86× |

The baseline model — `log(views) ~ log(subscribers) + log(age) + niche` — is the
genuinely predictive part. It answers "what view count is normal for a channel
my size, in my niche" and therefore how ambitious a goal really is.

The CTR distribution is derived, not guessed. YouTube states that *"half of all
channels and videos on YouTube have an impressions CTR that can range between 2%
and 10%"* — that is an interquartile range, which pins a log-normal exactly:
median **4.47%**. The derivation round-trips to 2.00% / 10.00%.

## How the report is organised

Every number is labelled by how much you can trust it:

- **EXACT** — arithmetic. `impressions = views ÷ CTR`. No assumptions.
- **MEASURED** — read off real observed view distributions.
- **MODELLED** — uses the CTR prior, because third-party CTR is unobservable.

## How ideas are generated

Ideas are not free-associated. Each one is a real, repeatedly-used title
**format** filled with vocabulary that really occurs in your niche:

1. Your three references get resolved to real stats and scored against the
   baseline — so you find out whether they actually overperformed, or just sit on
   big channels. (A reference that only looks big because the channel is big will
   teach you nothing.)
2. Niche vocabulary is extracted from real titles by document frequency, with
   boundary rules that reject fragments and n-grams that cross punctuation.
3. Formats are filled with number agreement, overlap rejection, and a curated
   `topic_safe` list — `How [thing] Is Made` is excluded because *"How One Piece
   Theory Is Made"* is nonsense even though the slot type matches.
4. Candidates are ranked by **evidence** — how well-attested the format is, and
   how closely it reflects your references — then spread across families so you
   get a comparison, a ranking, a revelation, a what-if, and so on.

Ranking by evidence is explicitly **not** a performance prediction. Section 5 of
every report says so.

Each idea ships with a production brief: angle, hook, four structural beats, and
the payoff the format has to deliver.

The report also prints a **handoff brief** — paste it into an LLM to write more
titles under the same evidence constraints.

## Layout

```
src/
  cli.mjs         entry point, argument handling, orchestration
  model.mjs       baseline view model + CTR distribution      (what we may claim)
  forecast.mjs    goal feasibility, split by certainty tier
  generate.mjs    candidate generation, number agreement, diversity
  entities.mjs    niche vocabulary extraction
  formats.mjs     title formats + James-Stein-style shrinkage
  features.mjs    title feature extraction
  stats.mjs       OLS/ridge, logistic, AUC, k-fold, distributions
  youtube.mjs     YouTube Data API v3 client
  report.mjs      terminal report
  html.mjs        standalone HTML report
data/
  corpus.json     729 real videos with provenance + exclusion rules
  formats.json    100 real title formats, 18,822 videos aggregated
  benchmarks.json YouTube's official CTR statements, quoted
  model.json      fitted baseline + the validation record
scripts/
  build-model.mjs rebuild model.json and re-run validation
  power-test.mjs  permutation test + richer-model comparison
  within-niche.mjs within-niche predictive test
  ingest.mjs      merge new search results into the corpus
```

## Rebuilding on new data

```bash
node scripts/ingest.mjs <dir-of-search-results>   # dedupes on video id
node scripts/build-model.mjs                      # refits + revalidates
npm test
```

`build-model.mjs` re-runs the leave-one-niche-out test every time. A test in the
suite asserts the null result still holds. **If that ever starts passing, check
for leakage before claiming predictive power** — that is exactly the trap row two
of the table above sets.

## Data quality notes

Two sources were deliberately rejected:

- **vidIQ's `outlierScore`** — not reproducible from the fields returned, and
  erratic: `NARUTO vs SASUKE` = 983.98 at 4.04M views / 462K subs, while
  `GOKU vs NARUTO vs LUFFY` = 5687.77 at 3.81M / 334K, and one history video =
  10328.32. The corpus computes its own transparent label instead.
- **"Viral words" ranked by outlier multiplier** — the top-ranked word was `xm`
  at 11,722×, followed by `realtor` and `zurich`. That is small-sample mean
  inflation with no baseline correction, not a finding.

`formats.json` keeps `avg_outlier` but shrinks it before it can move a ranking:
it is an arithmetic mean of a heavy-tailed quantity, so `How [thing] Is Made`
reports 130.3× off 169 uses. Shrunk toward the corpus median with weight
`uses/(uses+150)`, that becomes 46.2×, while a 1,419-use format barely moves.

Videos are excluded from the fit when under 14 days old, under 100 views, or from
auto-generated `- Topic` channels — the first two follow YouTube's own warning
that such figures are unstable.
