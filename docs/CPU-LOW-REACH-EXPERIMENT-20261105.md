# G: select neutral jab range from the chosen variant

Frozen source `76279a021976aebdb30d7b5928894624224a6f1b` is a separate candidate
from F `7b1ab9d19eef10f30bf9b701b2130d8b2d302ed0`. Both server bundles retain
`c662aee33095a523`; this is a pure input-policy correction, not a physics/state
change. Source hashes are embedded in the measurement records.

F chooses high/low only after testing high-jab range. Its approach/initiative
threshold also uses high range. Thus a selected low with range 95 closes to the
shorter high-jab range first (for example Brawler 80 or Paired 82), giving up its
legal reach. The new fixture reproduced this for both archetypes at all four
skill anchors; the old controller walked forward and did not start the low.

G computes the same existing variant before spacing, then uses effective
`getMove(f,'low').range` for a selected **neutral grounded** low. High jabs retain
their high reach. Guard/throw partitions, the normalized 25% low share, RNG draws,
reaction anchors and all frame/damage data are unchanged. Airborne attacks and
confirmed-combo movement retain their previous range behavior. No fighter IDs,
reference conditions, new ducking policy or art changes are present.

## Verification

54 focused tests and TypeScript pass, including all previous low-variety and CPU
tests. Fourteen new cases cover Brawler/Paired reach across skills, an actual
low contact through `step`, unchanged high/guard/throw/air/combo behavior, pure
reads and input-only replay. The hidden-habit fixture moves from gap 90 to 100,
outside both legal high and low reaches, so its original information-leak check
does not accidentally assert the old spacing bug.

Independent review found no material issue: all 54 focused tests pass, and
24,384 bundled-core comparisons across 254 actors, four skills and eight gaps
preserve high, airborne and confirmed-combo behavior. Bundle regeneration/check
passes with the unchanged fingerprint. No broad outcome gate or human playtest
is claimed.

## Common-seed outcome diagnostics

The fixed v2 reference, eight fighter IDs, seed 20261105, four independent
repetitions per seat and 3600-frame cap match both checkpoint runs. Reverse seats
share fighter RNG streams, so these paired observations are not independent
human samples.

| Skill | F CPU wins | G CPU wins | F mean CPU damage | G mean CPU damage |
| --- | ---: | ---: | ---: | ---: |
| Easy · 1 | 0/64 | 0/64 | 291.5 | 285.7 |
| Normal · 4 | 4/64 | 6/64 | 473.8 | 476.7 |
| Hard · 7 | 14/64 | 12/64 | 584.6 | 578.2 |
| Expert · 10 | 27/64 | 23/64 | 724.7 | 678.1 |

No checkpoint bout was a draw. The outcomes are mixed, not uniform improvement.
[Raw F checkpoint](balance/cpu-low-reach-checkpoint-before.json),
[raw G checkpoint](balance/cpu-low-reach-checkpoint-after.json).

The actual first encounter, ordinary Zephyr at skill 1, was tested with 256 seed
pairs, the same reference High Sproto and exact context `story-v1-zephyr:0`.
Both F and G produce **1/256 CPU wins (0.390625%)**, 255 reference wins and no
draws. Every reverse-seat outcome matches. This reproduces F's endpoint and
demonstrates no opening win-rate gain in this panel. The approximately 15% goal
remains unmet against this uncalibrated reference.
[Raw F opening](balance/cpu-low-reach-first-before.json),
[raw G opening](balance/cpu-low-reach-first-after.json).

No finale, broad roster or another tracking combination was run for G. Existing
F broader jobs were left untouched. This experiment establishes action-range
correctness; its diagnostics alone do not justify strategic promotion. Further
selection/measurement belongs on a new frozen source, with no results borrowed
from earlier policies. No primary, hub, deployment, artwork or animation files
were changed.
