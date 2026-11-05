# Gameplay implementation and review checkpoint

This is a draft implementation, not acceptance of all gameplay targets. The
source plan is the unchanged 228-line document from `3f1b1234`. Work started
from main `209f16eec` after PR #22. Main still points there; concurrent cinematic
PR #23 remains open and was not incorporated or overwritten. Heads of the
still-open stacked PRs #17–21 are already ancestors of this integration baseline.

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
branch is `codex/gameplay-match-depth-review`; the full working checkout is
`/workspace/Sproto-Fighter`.

The matching [hub draft #59](https://github.com/crrreatorrr/metaverse-hub/pull/59)
vendors simulation `7d0ce00ef52b567a`, matching this Fighter implementation.
Fighter main was `af94139cc59e4dfd` while hub main was `dc3a64b592b94faf` before
this work; no claim is made that production is currently in parity. Neither
repository was merged or deployed.

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

## Evidence and limits

The broad frozen calibration ran 33,472 bouts, with independent seeded
repetitions and both seats. The 35–65% gate fails for 107 Normal and 102 Hard
fighters. Canonical Footwork wins about 66%; Zoning about 29%; Weapon about
33–36%; Brawler about 36–37%. The formula omits mobility and is not a calibrated
fairness certificate. See [the full analysis](balance/FINAL-CALIBRATION-20261105.md)
and its compressed raw evidence, source/harness hashes and exact gate failures.
The stricter 40–60% and matchup 70/30 targets are not established.

The frozen final story measurement produced 30 CPU wins in 1,976 encounter
trials against reference v2, which is itself not validated as a decent human.
Thus neither the 15–65% endpoints nor empirical smoothness are accepted.
Separate unintegrated CPU and role-calibration experiments are being measured;
their results must not be substituted for this tested source's results. The
[role experiment branch](https://github.com/crrreatorrr/Sproto-Fighter/tree/codex/gameplay-balance-calibration)
reduces controlled-panel outliers but still fails the gate. Review also found
that strategic zoning in the frozen CPU reads projectile habit counts before
the visual delay. The independently reviewed
[CPU candidate](https://github.com/crrreatorrr/Sproto-Fighter/tree/codex/gameplay-cpu-calibration)
fixes that leak, forecasts commitment using unfrozen ticks, and reserves Expert
jab initiative. Its 20 focused tests pass. Its new fixed-seed checkpoint gives
CPU wins Easy 0/64, Normal 0/64, Hard 9/64, Expert 30/64; the earlier full-curve
640/1,976 result belongs to a superseded candidate and is not this result.
Neither experimental branch is integrated or paired with the published hub
bundle; both need fresh full measurements and broader validation. Delayed
position spacing may additionally bias faster-versus-slower matchups and needs
controlled investigation before more role buffs. These are pre-merge blockers.
Expert meter baiting has not been independently established. Balance CI remains
advisory because the acceptance gate fails; promoting it to a gate is pending.

Enabled optional rules completed 224 matches / 538 rounds across eight named
fighters, covering six canonical archetypes, with no raw draws or cap exhaustion.
Mean rounds were 21.21/21.91 seconds at Normal/Hard. This is CPU measurement,
not human pacing. [Enabled-mode report](balance/report-2026-11-05-final-match-depth.md).

Typecheck, build and 148 unit tests pass. The updated measurement smoke covers
840 complete-state equality checkpoints, including guarded chip. Node and
installed Chromium match at 130 checkpoints across 11 scenarios; the GitHub
three-engine determinism job for this source also passed. Packed sheets verify
all 29,020 frames unchanged. The complete standalone runner finished 70/71
checks; its only failure was stale sprite guard expectations. After updating
those numeric fixtures for chip and faster back-walk, the corrected audit passed:
254 fighters, 2,076,832 runtime samples, 5,588 replay scenarios, zero hard failures
and zero art baseline changes. Its 950 advisory silhouette flags remain a visual
review queue. [Audit evidence](balance/evidence/sprite-audit-final-summary.md)
includes compressed raw output and hashes. The newly added enabled-mode tooling
smoke passed separately. A second complete standalone run was not performed.
The latest documentation/test-only push has a GitHub build still in progress.

Automated Chromium checks exercised Hard CPU play, weapon/paired training,
recording/looping, overlays, pause and replay. A real Round 1 KO advanced to
Round 2 preview and live combat with replay equality at both boundaries.
Jessica's actual heavy contact was frozen at active tick 14 with red/green
geometry. This is automated/static inspection, not a human playtest.

The matching local Nakama stack replayed five logs with exact winner, frame and
state-hash equality and rejected bad versions/malformed logs. Four live relay
duel groups and a two-Chromium wager/rematch passed with Tickets conserved and
local rule flags disabled. Direct WebRTC was not established; its default test
remains strict. TURN and production connectivity were not tested.

No file under `art/` or `public/fighters/`, atlas registration, clip length or
throw grip was edited. Offline hull reports describe whole-body envelopes and
explicit alpha fallbacks; they do not approve semantic fist/blade contact.
Human feel/contact testing remains a required acceptance step.
