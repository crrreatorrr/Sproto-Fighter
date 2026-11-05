# I actual-story diagnostic — 2026-11-05

The shared Brawler/Paired light-reach correction leaves the measured first endpoint at **1/256 CPU wins (0.39%)**, well below the plan's approximately 15% target. The regular-fighter finale remains **131/256 (51.17%)**. This is a diagnostic result against a fixed independent reference, not human validation or an acceptance certificate. No production source, mapping, probability knob or reference was changed here.

## Frozen source and protocol

- I commit: `efb5829c1230dac84337ba0212d92a84a527563b` (Brawler/Paired light range 86 relative to F).
- Simulation-source SHA-256: `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`.
- Server simulation fingerprint: `a4c7ddde49ec5a64`.
- Route SHA-256: `423ddc19a4e4bc93d4560b3d007110b23b45689c23e8084d80a6f0d4c57cea97` (247 encounters).
- Reference: High Sproto, `reference-v2-persistent-delay18`, source SHA-256 `2aada800cc5ac2e80c41942a14db8a9a6bb8f541a8a9bc4cbdf5d640a364f4ff`.
- Portable runner: `scripts/lib/story-target-diagnosis.mjs`, SHA-256 `e5ebb83bb932216c1dd9565f49210d26fa9f7242082da8ab5c638eb89bc34453` (identical in I and the diagnostic worktree).

Master seed 20261105, repetitions 0–255 for each endpoint, and 0–63 for each opening-sweep level. Seed 20261106 was not used. Contexts are the actual encounter ID plus `:` plus wave; common seeds are retained across levels and both seats. Each bout is capped at 3600 frames. Finale Vela then Vaudream advances only after a reference win, with health and controller history reset for the next wave. Raw draws stop an encounter and remain draws.

The primary analysis uses reference slot 0 and CPU slot 1. Reverse seats audit bias and do not add independent trials. All reverse outcomes agree with their paired natural seat. The single worker ran endpoints then opening sweep sequentially.

## Actual endpoints and paired F comparison

| Encounter | Skill | I CPU wins | Pointwise Wilson 95% | F CPU wins |
| --- | ---: | ---: | ---: | ---: |
| Ordinary Zephyr opening | 1 | 1/256 = 0.39% | 0.07–2.18% | 1/256 |
| Vela + Vaudream finale | 10 | 131/256 = 51.17% | 45.08–57.23% | 131/256 |

No endpoint trial drew. All 512 finale trial payloads are byte-identical to F, including bout details, seeds, hashes, damage and frames; those participants' roles are unchanged. The opening's equal aggregate is **not** trajectory equivalence: 360/512 paired-seat trial payloads differ. Natural-seat repeat 30 changed CPU win → reference win; repeat 201 changed reference win → CPU win, mirrored in reverse seats. The other opening outcomes agree.

The native endpoint report's subset-derived `markedBoss` flag incorrectly marks the first encounter. Preserve that raw field as original instrument output; use `naturalSeatAnalysis.actualMarkedBoss=false` for this ordinary opening. It has no boss exemption. The portable opening-sweep report already corrects this marker.

## Opening sweep (diagnostic overrides only)

The actual first encounter is tested at skills 1–10 without changing its product mapping from skill 1. Every level uses the same 64 independent seed pairs. There are no draws or reverse-seat disagreements.

| Skill | CPU wins | Rate | Pointwise Wilson 95% |
| ---: | ---: | ---: | ---: |
| 1 | 0/64 | 0.00% | 0.00%–5.66% |
| 2 | 0/64 | 0.00% | 0.00%–5.66% |
| 3 | 0/64 | 0.00% | 0.00%–5.66% |
| 4 | 2/64 | 3.12% | 0.86%–10.70% |
| 5 | 1/64 | 1.56% | 0.28%–8.33% |
| 6 | 2/64 | 3.12% | 0.86%–10.70% |
| 7 | 9/64 | 14.06% | 7.58%–24.62% |
| 8 | 5/64 | 7.81% | 3.38%–17.02% |
| 9 | 14/64 | 21.88% | 13.50%–33.43% |
| 10 | 17/64 | 26.56% | 17.30%–38.48% |

Skill 7's point estimate is near 15%, but the broad interval and skill 8 reversal do not establish a calibrated remap or monotone population curve. Skills share seed pairs, and these are pointwise intervals, not simultaneous coverage for all levels. Endpoints and sweep overlap in their first 64 seeds; do not pool them. The fixed reference is not a validated decent-human model. Per-encounter smoothness, broad fairness, fresh reserved-stream acceptance and human playtesting remain separate outstanding gates.

## Reproduction and evidence

From a source checkout pinned to I and a frozen harness checkout containing the reference hash above:

```sh
node scripts/lib/story-target-diagnosis.mjs CORE_ROOT FIXED_HARNESS_ROOT /tmp/I-endpoints.json endpoints 256 efb5829c1230dac84337ba0212d92a84a527563b
node scripts/lib/story-target-diagnosis.mjs CORE_ROOT FIXED_HARNESS_ROOT /tmp/I-opening-sweep.json opening-sweep 64 efb5829c1230dac84337ba0212d92a84a527563b
```

Compressed original I endpoints, I opening sweep and F endpoint baseline are in [story-I-diagnostics](story-I-diagnostics/). The [manifest](story-I-diagnostics/manifest.json) records raw and gzip hashes and sizes. Gzip is lossless with deterministic metadata; the original JSON provenance, outcome hashes and draw records are preserved. The successful runner asserts the fixed reference hash before simulating and records the exact source/route fingerprints. No production tests were rerun because this branch adds reports only; both requested simulation jobs completed successfully.
