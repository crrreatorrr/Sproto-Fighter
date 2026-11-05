# Delayed projectile threat hypothesis J

This is an isolated CPU experiment from F (`7b1ab9d19`), not a selected balance change. No production integration, deployment or human playtesting was performed.

## Frozen candidates

- J1 reactive forecast: `87c925046`, source SHA256 `a97ecfb7e1e3f8f133958c2c355f026ab9cd39e32e907f681cc4a9b01d0f35c4`, branch `codex/gameplay-cpu-cast-threat`.
- J2 adds seeded learned instant-ray anticipation: `a0c3645d6`, source SHA256 `4b9bbaef5f5683a46679d5c2a46f0e603678508014cc6dd29ce0d2a77b2a8564`, branch `codex/gameplay-cpu-beam-habit`.
- Verifier simulation fingerprint remains `c662aee33095a523`: `cpuInput` is excluded by tree shaking from the input-driven server verifier bundle. Observation schema, simulation stepping, RNG advancement, attack kits, numeric contact geometry, origins and artwork are unchanged.

J1 replaces the visible-cast projectile branch's fixed 220-unit guard cutoff and emission-only lifetime with a conservative public-profile flight envelope. It uses the delayed cast x/y/age and unfrozen clock against the defender's current position. Published attack-roll guard probabilities remain unchanged. Grounded horizontal profiles permit a duck only if every possible authored emission lane clears the numeric crouch hull. Both standing and crouching mouth origins are considered because queued current input does not expose latched cast aim. Returning and wide retainer shots use their respective conservative lifetime/width.

J2 anticipates a possible ray only when the selected delayed observation contains no visible attack and only after a delayed projectile-majority habit, when the public ray startup fits inside that skill's visual delay. It uses the existing seeded forecast-guard share, without reading a new hidden cast, consuming RNG, or changing published visible-attack guard/low anchors. It cannot add a second habit guard chance after a visible attack fails its guard roll; an earlier J2 trial that permitted that is superseded by the frozen source and data here. No fighter ID selects behavior.

## Checks

J2: TypeScript check and 57 focused tests passed (17 threat/anticipation, 20 difficulty/replay, 20 low-variety). Causal fixtures include a real traveling Vela shot before first contact and a crouch-spit whose attacker releases down during startup. Additional assertions cover long beam range, unfrozen expiry, returning/wide shots, hidden state independence, reaction delay, mirrored defense, guard anchors and habit gating. Independent Speed review found the returning-width and latched-aim issues before the frozen candidates above; they are corrected with regressions.

## Bounded common-seed panel

`J1.json` and `J2.json` contain complete per-bout outcomes, actual source hashes, initial seeds, input/final hashes, HP, damage, raw results and measurement resolutions. `panel.mjs` reproduces the current checkout against F's exact CPU source, using unchanged simulation/instrumentation. Run it from repository root with an optional output JSON path. Each comparison is 272 bouts: 136 per source, seed 20261105, two independent seed repetitions, both seats, 3600-frame cap. All raw outcomes were KOs; raw draws and measurement tie-breaks were zero.

Mox versus High Sproto, Rivet, Vela, Bront and retainer (`sproto2789`), CPU versus CPU:

| Skill | F Mox wins | J1 Mox wins | J2 Mox wins | Trials per source |
| --- | ---: | ---: | ---: | ---: |
| Normal | 18 | 18 | 18 | 20 |
| Hard | 14 | 18 | 18 | 20 |

Six projectile fighters (Mox, Vela, Rivet, Bront, D86, retainer) versus the fixed High Sproto reference, crossing seats:

| Skill | F CPU wins | J1 CPU wins | J2 CPU wins | Trials per source |
| --- | ---: | ---: | ---: | ---: |
| Easy | 0 | 0 | 0 | 24 |
| Normal | 0 | 0 | 0 | 24 |
| Hard | 0 | 4 | 4 | 24 |
| Expert | 4 | 8 | 8 | 24 |

Excluding Mox, ordinary projectile reference wins are F→J1/J2: Easy 0→0, Normal 0→0, Hard 0→2, Expert 2→8, each out of 20. These small samples establish neither population balance nor difficulty targets. Generic defense helps both contestants, and Hard Mox dominance worsened here. Neither candidate is recommended for selection on this evidence.

## Limits

This is a conservative threat envelope, not a reconstruction of projectile physics. Observations do not retain cast-facing, latched aim or release pose; inferred direction faces the defender's present position. Curved/returning trajectories can overpredict danger, and default origins are approximate; uncertified default lanes never permit a safe-duck claim. A cast is forgotten once the selected delayed observation stops showing it; this does not add full-lifetime shot tracking. The old delayed `seen.shot` observation still uses its existing distance cutoff. First equal-startup rays remain visually unreactable at Normal; J2's later habit read is probabilistic. No current enemy position, projectile array or future input is consulted by the added logic.
