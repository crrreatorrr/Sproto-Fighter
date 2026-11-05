# Gameplay implementation and review checkpoint

This is a draft implementation; the quantitative and human acceptance targets
are not complete. The reviewed CPU fixes are integrated, and further controlled
role/controller calibration is documented below. Nothing has been merged or deployed.

Selected calibration [draft #30](https://github.com/crrreatorrr/Sproto-Fighter/pull/30)
is stacked on #29. Its shared-role changes are Footwork light startup/damage 6/34,
Zoning light reach 94, Brawler light reach 86 and Paired light reach 86. Weapon stays
unchanged; tracking, spawn and additional habit/threat experiments are unselected.
It includes the reviewed low-variety correction. Simulation `a4c7ddde49ec5a64`,
production source SHA-256
`612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`.
The matching [hub draft #59](https://github.com/crrreatorrr/metaverse-hub/pull/59)
has been refreshed to `a4c7ddde49ec5a64`. Production/live parity is not claimed: before
this work Fighter main expected `af94139cc59e4dfd` and hub main `dc3a64b592b94faf`.

The unchanged 228-line plan comes from `3f1b1234`. Integration began at main
`209f16eec` after PR #22; the heads of still-open PRs #17–21 were already its
ancestors. Concurrent cinematic PR #23 was preserved and remains separate.

## Reviewable changes

| Phase | Draft | Coverage | Acceptance remaining |
| --- | --- | --- | --- |
| 0 | [#24](https://github.com/crrreatorrr/Sproto-Fighter/pull/24) | Seeded paired-seat tournaments, raw/resolved draws, reference controller, damage attribution, frame CSV, advisory CI | Reference controller is not calibrated as human skill |
| 4 | [#25](https://github.com/crrreatorrr/Sproto-Fighter/pull/25) | Step-owned seeded CPU state, delayed decisions, difficulty selector, actual 247-encounter mapping, optional easier retries | Empirical difficulty targets and transformed boss controller |
| 1 | [#26](https://github.com/crrreatorrr/Sproto-Fighter/pull/26) | Eight templates, bounded identity deltas, budget tests, Special damage band, weapon reach, one projectile volley | Fairness gate fails; budget weights need empirical tuning |
| 2 | [#27](https://github.com/crrreatorrr/Sproto-Fighter/pull/27) | Movement/run, recovery, buffer, confirmed jump cancels, hitstop, rise choices | Human feel and human round-duration target |
| 3 | [#28](https://github.com/crrreatorrr/Sproto-Fighter/pull/28) | Numeric hit/hurt rectangles, chip/blockstun, throw tech, clash, wake-up protection, offline measurements | Semantic limb contact and human visual approval |
| 5 | [#29](https://github.com/crrreatorrr/Sproto-Fighter/pull/29) | Local opt-in rounds/timer, counter-hit, defense meter, just-defend, juggle cap, modifiers, training/recording/exact overlay | Full-roster enabled-mode balance, transformed boss modifiers, human feel |

These are stacked branches, in the table's order. Later branches include fixture
reconciliation needed by the combined rules. They remain drafts. The integration
branch is `codex/gameplay-calibration-review`; the full working checkout is
`/workspace/Sproto-Fighter`.

## Deliberate rule decisions

- Specials use the plan's finite rectangles and permit guard. Active-caster
  immunity from #22 is preserved. Clean default-partner Special damage is tested
  for all 254 fighters in the 270–300 band; nominal 285 can become 297 when a
  long contact gap ends the combo.
- Paired reach is scored at the nearest bodies, avoiding a second spread
  subtraction that would make some paired lights unable to reach collision.
- Chip is 12%, nonlethal by default. Harder serialized rules can enable chip KO.
  Throws deal 90; authored grips and historical art fixtures are unchanged.
- Story uses the installed 247-encounter route, not a hardcoded 250 divisor.
  Easier retries are optional and preserve ordinary reward eligibility.
- `?matchDepth` enables the new local round/depth rules. Dedicated transformed
  boss forms use their separate controller and are excluded from difficulty and
  modifier claims. Chapter modifiers use the last eligible ordinary encounter.
- `?training` provides actual collision rectangles, input/advantage readouts and
  facing-relative route recording. Looping uses a standing dummy; guard dummy
  supports readout/recording while retaining its established movement lock.

## Selected I evidence and acceptance status

The full 33,472-bout common-seed I run leaves **12 Normal and 7 Hard fighters**
outside the observed 35–65% gate. The prior reviewed CPU had 28/18, and F 17/7.
The gate still fails. Raw draws are 5/3 and remain separate from resolved results.
Brawler and Paired Hard means are 50.18%/48.38%; their Normal means 42.64%/44.17%.
No per-ID bonuses, HP/speed changes or artwork were used.
[Full I report](balance/I-ROLE-REACH-FINAL17-20261105.md).

The unchanged fixed reference still beats the opening CPU 255/256 times; the
finale CPU wins 131/256 (51.17%). Finale complete trial payloads are identical to F;
opening trajectories change despite equal aggregate rates. The opening sweep
shows 15% point estimates only near skills 7–9, with wide uncertainty. Neither a
remap nor a target/reference change is authorized by these diagnostics.
[Independent-seed I story report](balance/STORY-I-DIAGNOSTICS-20261105.md).

I passes typecheck, build, **196 unit tests and 68/68 fast standalone checks**.
The preceding F source passed the literal full local command: 195 unit tests and
72/72 standalone checks. I's final packed-sheet audit verifies all 274 sheets /
29,020 frames unchanged. Both full GitHub CI runs on functional commit
`724c8d22c` pass, including Chromium/Firefox/WebKit determinism:
[runs 41981168622](https://github.com/crrreatorrr/Sproto-Fighter/actions/runs/41981168622)
and [41981168254](https://github.com/crrreatorrr/Sproto-Fighter/actions/runs/41981168254).

The reported story-browser assertion was corrected by waiting for actual regular
KO and observer publication, preserving the exact black RGBA assertion. The
previous fixture could silently exhaust a wall-loop bound and race rendering.
The original CI failure's precise cause is not proved; port occupancy is not
claimed as causal. The affected test, delayed-observer stress and final CI pass.

The actual 247-encounter route has 218 CPU wins / 1,976 paired-seat trials, with
no raw draws. Four independent pairs per encounter remain screening evidence,
not certification of adjacent difficulty smoothness.
[Full route](balance/I-FINAL-ROUTE-20261105.md).

[Calibration decisions](GAMEPLAY-CALIBRATION-DECISIONS-20261105.md) preserves failed
gates and proposed choices. [Human playtest form](GAMEPLAY-HUMAN-PLAYTEST-20261105.md)
is a proposed protocol with blank results; no human playtest is claimed.

## Reviewed-CPU checkpoint evidence

The same 33,472-bout, all-254-fighter schedule, two independent seed pairs per
matchup and both seats was rerun after the reviewed CPU integration. Raw draws
remain separate from measurement tie-breaks. Each matchup has only four paired
rows; these data cannot certify the population 70/30 matchup bound.

| Observed result | Prior `7d0ce00ef52b567a` | Reviewed `373448bdc043a0e8` |
| --- | ---: | ---: |
| Outside 35–65%, Normal / Hard | 107 / 102 | 28 / 18 |
| Outside 40–60%, Normal / Hard | Not a pass | 81 / 51 |
| Mean bout seconds, Normal / Hard | 22.39 / 22.38 | 28.79 / 34.35 |
| Raw draws, Normal / Hard | 0.06% / 0.18% | 0.04% / 0.16% |
| Actual-route CPU wins / 1,976 paired-seat rows | 30 | 212 |

The observed 35–65% gate still fails. Normal/Hard Zoning rates are 37.35/38.84%,
Brawler 40.87/45.53%, Footwork 56.72/55.27%. See the
[current controlled report](balance/POST-CPU-REVIEW-CALIBRATION-20261105.md),
raw gzip/hash manifest and [historical baseline](balance/FINAL-CALIBRATION-20261105.md).
CPU duration does not establish the human 30–45 second pacing target.

Larger actual endpoint diagnostics use 256 independent seed pairs, with Story's
natural seat as primary. The reviewed CPU wins 0/256 at encounter one and
165/255 decided at the regular-fighter finale (64.71%, plus one raw draw).
The finale is near the target; the opening clearly fails. Reverse seats agree
for every pair and must not double the effective sample size. The fixed
reference is unchanged and unvalidated as a decent human. See
[story target diagnosis and proposed decisions](balance/STORY-TARGET-DIAGNOSIS-20261105.md).
The sparse full-route rows do not certify adjacent 10-point smoothness.
Dedicated transformed boss controllers are outside these measurements.

Tracking from delayed motion and a known-spawn prototype remain unselected.
Their endpoint rates are 1.56%/90.23% and 3.125%/94.14%, respectively: greater
capability does not meet both endpoints. The all-roster tracking pilot is mixed
across skills. Controlled expansions compare identical Footwork/Zoning role
changes with and without tracking before any promotion. Earlier Brawler/Weapon
buffs are being omitted because the reviewed CPU changed their effects.

Budget identity bounds are tested, but the production weights are not a fairness
certificate. Experimental budgets include mobility and actual action-ready
block advantage. Held-out fits are modest and policy-dependent; constant safety
features cannot be priced empirically without interventions. Expert meter
baiting is not independently established. Balance CI remains advisory until the
initial gate passes. No reference, target, hidden stats or per-fighter bonuses
are changed to manufacture a pass.

The prior optional-mode sample completed 224 matches / 538 rounds across eight
fighters and six archetypes, with no raw draws/cap exhaustion. It is not a
full-roster optional-mode or human-pacing certificate.
[Enabled-mode report](balance/report-2026-11-05-final-match-depth.md).

## Validation and practical limits

The reviewed CPU checkpoint passes typecheck, build, 159 unit tests and all 68
fast standalone checks when the two browser checks are rerun with system
Chromium. The initial fast command passed 66/68 and failed only to launch those
browsers because the Chromium path was absent. Both targeted reruns pass.
The later training-readout correction passed typecheck and all 172 unit tests;
its real-step probes check +7 light hit, -5 light block and -12 heavy block.
Movement, knockdown, throw, Special and future-projectile contexts show no
numeric advantage rather than misleading stun arithmetic. It does not predict
cancels or combo routes. The subsequent low-choice correction passed 40 focused
tests and the full 192-test unit suite; final outcome measurements follow selection.

Node/Chromium agree at 130 checkpoints over 11 scenarios. Three-engine
[determinism CI](https://github.com/crrreatorrr/Sproto-Fighter/actions/runs/41969600478)
passed for the reviewed CPU checkpoint, including the full gameplay/art/story
audit. The later training UI regression checks are separate until the final
candidate CI run.

At the prior `7d0ce00ef52b567a` checkpoint, packed sheets verified all 29,020
frames unchanged. The full standalone runner passed 70/71; its stale guard
expectations were corrected, then the complete sprite audit passed across 254
fighters, 2,076,832 runtime samples and 5,588 replay scenarios, with zero hard
failures or art baseline changes. Its 950 silhouette advisories remain a visual
review queue. [Audit evidence](balance/evidence/sprite-audit-final-summary.md).
This is versioned prior evidence, not an unperformed final full-suite run.

Automated Chromium exercised Hard CPU play, weapon/paired training, recording,
overlays, pause and replay. Actual Round 1 KO → Round 2 preview/live boundaries
were replay-equal. Reviewed-CPU browser reruns also passed the campaign's 48
new stage launches, 121 selectors, desktop/mobile map and actual cinematic/boss
progression. These are automated checks, not human playtesting.

The matching local Nakama verifier replayed five logs with exact winner/frame/
hash equality and rejected bad versions/malformed logs. Four live relay duel
groups passed on final I. The final I two-Chromium relay wager/rematch conserved
Tickets and rejected local experiment flags. [Final I logs and manifest](balance/evidence/I-validation-manifest-20261105.json).
Direct WebRTC was not established; its default
test remains strict. TURN and production connectivity were not verified.

No `art/**`, `public/fighters/**`, atlas registration, clip length or throw grip
was edited. Frozen collision rectangles are provisional numeric geometry;
offline body-hull measurements do not approve semantic fist/blade contact.
Human feel/contact testing remains a required acceptance step.

## Isolated crouch correctness follow-up

The separate [T/HoldCrouch branch](https://github.com/crrreatorrr/Sproto-Fighter/tree/codex/gameplay-cpu-hold-crouch)
fixes a confirmed CPU stance defect: committed low/sweep inputs release crouch,
so a high jab can hit the standing numeric hurtbox during a low move. T holds
only down through those moves, preserving earlier combo-cancel behavior. Its
80 focused tests and 365,760 protected-path comparisons pass; 7,620 changed
outputs are confined to the intended grounded low/sweep cases. Its 576-bout
representative panel is mixed and opening wins remain 2/256. It is a reviewable
follow-up, not silently included in I's source-specific quantitative results.
[Source and evidence](https://github.com/crrreatorrr/Sproto-Fighter/blob/codex/gameplay-cpu-hold-crouch/docs/balance/CPU-HOLD-CROUCH-EXPERIMENT-20261105.md).
