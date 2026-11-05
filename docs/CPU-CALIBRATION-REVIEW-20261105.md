# CPU calibration review follow-up

This separate candidate addresses three review defects in `bb0452eab`:

- Zoning intent now reads projectile habit counts from its delayed observation,
  alongside attack and low counts. A newly emitted, unobserved projectile cannot
  change strategic intent early.
- Observations carry an unfrozen gameplay counter. Move commitment is projected
  through gameplay ticks, while visual reaction still uses simulation frames.
  Ordinary hitstop and hitstop created by a fresh throw break do not age an attack.
- Proactive forecast defense, jab pressure and throw reads occupy disjoint seeded
  intervals. Forecast guard share is `guard × (1 − grab share) × 0.9`; the published
  visible-attack guard probabilities remain unchanged. Expert therefore retains
  a nonzero jab interval instead of spending all neutral decisions on guard/throw.

The old full-route reports remain historical evidence for `bb0452eab`. In
particular, its 640/1976 CPU wins and 8/8 finale are **not results for this revision**.

## Fresh common-seed checkpoint

The fixed reference v2, eight fighters, seed 20261105, four repetitions per seat
and 3600-frame cap match the previous checkpoint. The raw records pin the source
hash and proposed simulation fingerprint `373448bdc043a0e8`.

| Skill | Original controller | bb045 candidate | Reviewed candidate | Reviewed mean CPU damage |
| --- | ---: | ---: | ---: | ---: |
| Easy · 1 | 0/64 | 0/64 | 0/64 | 263.4 |
| Normal · 4 | 0/64 | 2/64 | 0/64 | 448.8 |
| Hard · 7 | 2/64 | 28/64 | 9/64 | 579.2 |
| Expert · 10 | 4/64 | 62/64 | 30/64 | 768.4 |

No bout was a draw. The corrections remove invalid anticipation and restore
Expert's choices; they are not a promise that every policy revision increases
win rate against one reference. Easy/Normal remain weak in this checkpoint.
Reference-human calibration, the 15–65% story endpoints, empirical smoothness and
the Normal/Hard roster-balance gate remain unmet or unverified. Reverse seats are
paired observations; the small sample is diagnostic.

[Current raw checkpoint](balance/cpu-calibration-checkpoint-reviewed.json).
Reproduce with `scripts/lib/cpu-calibration-checkpoint.mjs` and the fixed metrics
checkout described in the historical report.

Twenty focused CPU/retry tests and TypeScript pass, including delayed projectile
habits, Expert guard/jab/throw choices across seeded decisions, frozen commitment
projection, throw-tech timing, input-only replay, rollback and delayed facing.
No artwork changed. No primary integration, hub or deployment files were edited.
The candidate requires a matching hub bundle and broad validation before online
use; the previously validated primary stack retains its own simulation version.

## Motion-prediction assessment

Mixing an opponent's old position with the fighter's current position can add a
speed-dependent spacing error. Continuing **delayed observed velocity**, through
unfrozen ticks and bounded by known walls/collision, is a reasonable experiment.
It must not read a new direction or velocity before the reaction queue exposes it.
Cast decisions would also need to account for the known release origin and own
startup, without assuming that every opponent continues its motion indefinitely.
This revision does not implement or claim results for that hypothesis.
