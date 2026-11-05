# Seeded measurements and the reference curve

The Phase 0 reports remain frozen with their original harness and reference-bot
versions. Harness v2 adds independent CPU streams per matchup, controller
assignment and repetition. A reverse-seat bout retains the same fighter streams,
so those two observations are paired. Each bout records its initial CPU seeds,
input-stream hash, final-state hash and raw outcome. Increasing repetitions on a
legacy CPU without RNG simply repeats identical behavior.

```sh
node scripts/balance-tournament.mjs --fast --repeats 1 --out docs/balance/seeded-fast
node scripts/balance-tournament.mjs --samples 40 --repeats 20 --skills 4,7 --out docs/balance/seeded-full
node scripts/difficulty-curve.mjs --repeats 1 --out docs/balance/story-curve
```

One repetition gives one independent CPU seed pair per matchup and controller
assignment, tested in both seats. Small-sample matchup extremes do not establish
the plan's 70/30 population target. More samples, uncertainty and representative
opponents are required. The initial 35–65% sampled gate is a separate criterion.

Reference v2 preserves guard intent between decisions, stops backing away during
its own attack startup and accounts for paired-body spread in spacing. It is a
fixed, reproducible controller with an 18-frame attack-observation delay, not a
validated model of a decent human. Reports using different reference versions
are not directly comparable. Calibration remains outstanding.

The curve script uses the actual installed encounter route and `storyDifficulty`
mapping. It uses the fixed High Sproto reference fighter by default. Each trial
must win every sequential fighter wave, with health refilled between waves; a raw
draw or defeat stops the encounter trial. These regular combat simulations do
not exercise dedicated Story boss-form attacks, transformations or side-scroller
mechanics. No 15–65% endpoint or smooth empirical win-curve claim follows from
skill interpolation alone. The advisory report retains raw draws, sample counts
and approximate Wilson intervals; paired seats can make those intervals optimistic.

Damage observation wraps the real simulation function inside a headless-only
bundle. It records actual target HP loss across chip, normal damage, god-mode
and KO-cap branches. Production simulation files stay unchanged. Effective
per-move blockstun is used by the nominal frame-data export once available.
