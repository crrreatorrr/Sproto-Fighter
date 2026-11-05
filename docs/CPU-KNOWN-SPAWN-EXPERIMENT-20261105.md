# CPU known-spawn opening experiment

Frozen source: `7e4bc3c7be66fe8e2c378892299d432411b01c1e`, based on tracking source
`b329efc630deb181ba94d66fea97907245afc873`. Proposed simulation:
`7652495407d4df08`. This experiment is separate from tracking and is not promoted
by its mixed small-panel results.

The controller previously idled for its entire reaction delay at the start,
although the static spawn positions were public during the introduction. The
independent reference begins moving immediately. `createState` now primes one
explicitly tagged frame-zero observation of the two static spawn positions.
While that observation is selected, the CPU can approach in neutral; it cannot
choose an opening attack from that information. Its first post-start movement,
velocity and attack samples still wait the published 28/18/12/8-frame visual
delay. No new opponent input is read directly.

The primed sample is serialized in ordinary combat state and reproduces from
`createState` plus recorded inputs. No new RNG is consumed during priming. A held
throw victim returns neutral unless it selects a legal tech, including at the
opening. No reaction probabilities, fighter stats, roster exceptions, artwork,
reference policy or story skill mapping changed.

## Same-seed checkpoint

The fixed v2 reference, eight fighter IDs, seed 20261105, four repetitions per seat
and 3600-frame cap match the tracking checkpoint. Seats share fighter RNG streams.
These small paired samples are diagnostic and the reference is not a human model.

| Skill | Tracking CPU wins | Known-spawn CPU wins | Tracking mean damage | Known-spawn mean damage |
| --- | ---: | ---: | ---: | ---: |
| Easy · 1 | 0/64 | 2/64 | 314.4 | 358.2 |
| Normal · 4 | 10/64 | 4/64 | 486.3 | 528.6 |
| Hard · 7 | 30/64 | 30/64 | 788.6 | 771.9 |
| Expert · 10 | 48/64 | 51/64 | 900.6 | 946.0 |

No bout was a draw. Easy gains two wins, Normal loses six, Hard is unchanged and
Expert gains three. This is not uniform improvement and does not establish a
15% Easy floor, 65% finale, empirical smoothness or roster balance. Per-encounter
seeded endpoint measurements are being evaluated independently; no outcome from
an earlier source version is attributed to this one.

[Raw tracking baseline](balance/cpu-known-spawn-checkpoint-before.json),
[raw known-spawn checkpoint](balance/cpu-known-spawn-checkpoint-after.json).
Source/reference hashes, initial seeds, controller assignments and raw outcomes
are retained. Reproduce with the existing checkpoint script and pinned metrics
checkout `44f777092c3e4795635879acd9b2fd9171d059b8`.

Thirty-two focused CPU/tracking/opening tests and TypeScript pass. Four new tests
cover immediate neutral movement, no leak of post-start changes, full visual
delay and input-only replay through the opening. Full roster/route acceptance,
three-browser determinism, matching hub bundle, broad gameplay/audit checks and
human playtesting remain outstanding for this proposed version. The primary
stack and both earlier frozen candidates were untouched. Nothing was merged or
deployed by this experiment.
