# Beam-profile fee: K mechanic-selected counterfactual

This focused diagnostic tests the frozen beam-only fee against I. It does not authorize promotion or a wider K screen, establish a budget price, or certify human difficulty.

I `efb5829c1230dac84337ba0212d92a84a527563b`; source `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`; simulation `a4c7ddde49ec5a64`.

K `94a9325f6a3adc9e94b6b63d45a46eae2c22fe4e`; source `d346b96d7f6b2f6463507c09d87052c560418a1c5b27c06bab6708272538a3ab`; simulation `741fe07b68b4a674`.

The bounded fee changes the existing beam bolt from damage 48/startup 18/recovery 20 to 47/19/22 under the unchanged whole-kit ±3% and identity-field caps. Selection uses mechanics rather than a named actor: the only current playable beam lead is Mox. This roster has one beam profile, so no general beam-population claim follows.

## Selection recorded before outcomes

The runner first wrote and printed the selection, then ran in a second invocation that asserted exact selection/helper/source equality. For each canonical archetype it selected the first and floor(N/2) actors from lexically sorted nonbeam IDs. Neither observed results nor prior win rate determined inclusion.

| Archetype | Eligible nonbeams | Selected first / middle |
| --- | ---: | --- |
| Brawler | 21 | agentsproto / janitor |
| Counter | 48 | accidentallyrich / lilgoldied |
| Footwork | 85 | 86gwei / rmacpdx |
| Hover | 2 | sproto1870 / vaudream |
| Paired | 20 | duo / sproto2210 |
| Pressure | 31 | alpha777 / nate |
| Weapon | 8 | blorfo / sproto1011 |
| Zoning | 38 | aktree / lowernipple |

Each core runs 16 opponents × 8 independent seed pairs × 2 seats × 2 skills = 512 bouts, for 1,024 total. Seed 20261105, skills 4/7 and max 3600 frames use the unchanged common-stream derivation. Every directed fighter/controller/repetition/initial seed key matches across sources. All input/final-state hashes, raw outcomes and measurement tie-breaks are retained.

## Matched outcomes

Natural beam-left outcomes are the primary descriptive estimand below. Reverse seats are a paired bias audit, not extra independent seed pairs. The selected fixed opponents are not a random roster sample. No pooled-seat confidence interval is presented.

| Skill | Natural Mox wins I→K /128 | Paired wins lost / gained | Raw draws I→K | Mean beam projectile damage I→K | Mean duration I→K |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4 | 87 → 84 | 28 / 25 | 0 → 0 | 475.99 → 474.27 | 24.67 → 25.62s |
| 7 | 82 → 89 | 26 / 33 | 0 → 0 | 460.67 → 426.43 | 30.13 → 29.46s |

The fee does not reduce beam win rate uniformly in this panel. Hard projectile damage falls while win count rises, showing that static damage reduction is not an identified causal price for matchup success under an adaptive deterministic policy. The small aggregate differences are not evidence of a population improvement or regression.

| Skill | I reverse-outcome agreement /128 | K agreement /128 | Mox wins across both seats I→K /256 |
| --- | ---: | ---: | ---: |
| 4 | 123 | 128 | 173 → 168 |
| 7 | 127 | 128 | 165 → 178 |

## Opponent-level natural-seat wins

Each cell is Mox wins out of 8 seed pairs; these small cells are descriptive, not 70/30 certificates.

| Opponent | Skill 4 I→K | Skill 7 I→K |
| --- | ---: | ---: |
| agentsproto | 4 → 7 | 7 → 7 |
| janitor | 5 → 5 | 7 → 5 |
| accidentallyrich | 4 → 5 | 3 → 7 |
| lilgoldied | 4 → 6 | 7 → 4 |
| 86gwei | 6 → 5 | 4 → 5 |
| rmacpdx | 4 → 3 | 5 → 6 |
| sproto1870 | 5 → 7 | 5 → 5 |
| vaudream | 6 → 4 | 6 → 7 |
| duo | 5 → 6 | 6 → 6 |
| sproto2210 | 7 → 2 | 4 → 3 |
| alpha777 | 7 → 6 | 6 → 6 |
| nate | 6 → 6 | 3 → 7 |
| blorfo | 7 → 7 | 5 → 4 |
| sproto1011 | 5 → 3 | 4 → 7 |
| aktree | 6 → 5 | 5 → 4 |
| lowernipple | 6 → 7 | 5 → 6 |

## Evidence and limits

The [preselection](K-beam-counterfactual/preselection.json), exact [runner](K-beam-counterfactual/runner.mjs), [raw archive](K-beam-counterfactual/raw.json.gz), and [manifest](K-beam-counterfactual/manifest.json) preserve selection order, source/harness/helper identities, all seeds, outcomes and hashes. Gzip round-trip and source guards passed. The runner paths identify the original frozen checkouts; adjust locations only while retaining the same source and declared helper provenance.

No broader 4k/full K run, transformed-boss test, story endpoint measurement, human playtest or reserved 20261106 acceptance stream was used. No production source was edited by measurement. Historical reports remain unchanged.
