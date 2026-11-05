# CPU own-kit zoning interpretation prototype — 2026-11-05

Frozen I's delayed projectile-majority label can make every own role counter-zone while tied or behind. The isolated K prototype makes grounded, uncommitted melee kits approach that pressure and reserves most long-range bolt plans for public ranged kits. Causal fixtures pass, but the small free-fight panel produces mixed role outcomes; it does **not** establish better roster fairness or authorize promotion. No Story experiment or mapping change was performed.

## Source and minimal policy change

Baseline I: `efb5829c1230dac84337ba0212d92a84a527563b`, simulation-source SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`.

K code: `531c32cae0f33d91ab4884bb22bed42faaa8b6be`, simulation-source SHA-256 `6f9d4323303198bdd21e6d347a524edbae9637894aff77586e15029957d45dc4`.

The authoritative bundle fingerprint stays `a4c7ddde49ec5a64`: this pure input controller is tree-shaken from the server entry, and the bundle generator check passes without a fabricated version change. Source hashes distinguish the policies.

On I, one already-observed bolt out of one observed attack satisfies projectile majority. At observed gap 400, a tied/behind Brawler's stored label becomes `zone`; a non-pulse read returns 0, and neutral pulse choices below .65 cast. At gap 280 the same zone plan retreats. Six melee-role fixtures reproduce this independently of any fighter ID or reference policy.

K interprets that existing label within `cpuInput`, using only its own public kit and delayed opponent HP:

- `Zoning` archetype or a public positive `projectile.beamLength` keeps ranged eligibility. Beam Counter kits therefore remain specialists.
- A grounded, uncommitted non-specialist ignores the zone label unless its own current HP exceeds delayed observed opponent HP by at least 100. The 100 HP lead is a documented provisional strategy threshold (10% of standard full health), not a new stat or a calibrated target.
- Those neutral non-specialists use a .20 long-range bolt choice interval instead of .65. Zoning/beam profiles retain .65. Non-beam Hover is also a non-specialist while grounded; all airborne policy is preserved.
- Existing dash choice boundary stays .65. Freed .20–.65 choices approach normally; they do not gain extra dash probability.

RNG advances, observation timing, stored strategic intent, published guard/low/tech/combo probabilities, throw/jab partitions, low share, move data and reference remain unchanged. Existing committed moves, combo movement and airborne paths retain their former zoning interpretation and bolt share. This does not change delayed-position tracking, projectile-threat detection or startup observation behavior.

## Focused verification

`vitest run tests/cpu-own-kit-intent.test.ts tests/cpu-difficulty.test.ts tests/cpu-low-variety.test.ts`: **61 tests pass**, including 21 new tests for all six melee roles tied/behind, retreat/stall cases, lead threshold, Zoning/beam eligibility, exact .20/.65 bolt distributions, delayed HP causality, guard/close/air preservation, input purity and input-only replay with hitstop. TypeScript check and `node scripts/build-sim-bundle.mjs --check` pass.

An independent before/after bundled-core comparison covers all 254 actors at skills 1/4/7/10 with common choice samples and multiple gaps: **308,864 identical input comparisons** on protected paths. Breakdown: close 32,512; airborne 48,768; blockstun 48,768; visible incoming defense 32,512; observed-shot defense 48,768; connected combo 48,768; other own commitment 48,768. This finite fixture matrix supports exact preservation on those cases, not every possible game state.

## Small free-fight panel

No reference bot is used. Both seats use the selected source's production CPU at the same skill. The roster is the first public non-beam representative of each of eight archetypes plus the first public beam profile, selected before the outcome comparison. All 36 unordered pairs run two repetitions, both paired seats, at skills 4 and 7: 288 bouts per source, **576 total**, capped at 3600 frames. Seed 20261105 and context `own-kit-freefight-diagnostic-v1` preserve common fighter streams; reserved 20261106 is unused. The worker runs I then K sequentially.

Every recorded winner is a raw game result; **zero draws and zero timeouts** on either source. No measurement adjudication is needed. Per-fighter totals below include 32 paired-seat bouts (16 seed pairs across eight different opponents), so paired seats must not be treated as independent trials. Two seeds per matchup are far too small to certify 70/30 or 35–65 acceptance bounds.

| Actor | Public role | I Normal | K Normal | I Hard | K Hard |
| --- | --- | ---: | ---: | ---: | ---: |
| rivet | Pressure | 12/32 | 12/32 | 8/32 | 14/32 |
| erik | Footwork | 22/32 | 22/32 | 18/32 | 16/32 |
| bront | Brawler | 16/32 | 13/32 | 14/32 | 13/32 |
| mandela | Weapon | 12/32 | 14/32 | 15/32 | 16/32 |
| duo | Paired | 24/32 | 15/32 | 18/32 | 16/32 |
| rune | Counter | 12/32 | 24/32 | 19/32 | 16/32 |
| sproto1870 | Hover | 17/32 | 8/32 | 16/32 | 13/32 |
| vela | Zoning | 12/32 | 20/32 | 16/32 | 22/32 |
| mox | Counter (beam) | 17/32 | 16/32 | 20/32 | 18/32 |

Mean bout time falls from 27.65 to 23.41 seconds at Normal, and 31.92 to 29.10 at Hard. This is an observed panel outcome, not human round-duration validation. Several role results improve while others regress; Zoning wins more often, and Brawler does not strengthen on this panel. The causal stall correction is therefore separate from an empirical fairness improvement. This prototype remains isolated for review; broad all-roster measurements, other policy interactions and human play remain outstanding. No Story run was performed while owner direction was pending.

## Evidence and reproduction

[Raw panel and preservation archives plus runners](cpu-own-kit/) preserve hashes, complete bouts, raw outcomes, input/final hashes, initial seeds and source fingerprints. [Manifest](cpu-own-kit/manifest.json) records raw/gzip SHA-256 values. The archived scripts use explicit frozen workspace roots and the frozen diagnostic harness at `/tmp/sproto-curve-diagnosis`; update only root paths to reproduce in another workspace. `panel-runner.mjs` declares the K commit abbreviated to `531c32cae` in the original JSON; the full source commit and hash above identify it unambiguously. Neither runner writes production files.
