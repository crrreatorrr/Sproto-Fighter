# First-seven browser follow-up — 2026-11-01

Scope: rivet (Golden), vela (Morelight), bront (Dave), zephyr (Halloween), mox (Yannix), rune (Bongraker), guest07 (Juicy). Dedicated Chrome tab 1760303274, local pose-atlas lab. All interactions used CUA UI; no source or asset changes by this reviewer.

## Evidence and exact coverage

Evidence is in `docs/evidence/2026-11-01-first-seven/`. `capture-ledger.json` records the browser's state text per capture. PNGs include both normal and mirrored panels. Contact sheets are crops of these browser screenshots, not synthetic sprite rendering.

For EACH fighter, inspected all eight gait cells 0–7 (56 paired captures), plus current main slots 2/3/4/5 in full-page browser screenshots. Morelight and Dave were recaptured after the final pelvis corrections; their old captures are retained in `pre-fix/`. Final magnified contact sheets: `vela-walk-fixed-review.jpg`, `bront-walk-fixed-review.jpg`, and `all-main-walk-review.jpg`.

For EACH fighter, paused and inspected medium frames 4/12/22, light 6/18, launcher 9/25, jump 3/20/32/36/45, dash 3, forward grab 9. These 14 paired states per fighter cover anticipation/contact/recovery, aerial rise/fall/landing and the catch. Most attack samples precede the final speed-only update; guest07 and final movement retakes follow it. Final dash frame 3 was retaken for all seven after the update. No attack art changed during that speed update.

Final 1× playback was run for forward walking, reverse walking, stopping, jumping and dashing on all seven. Actual sampled core frames:

| Fighter | Walk: forward, reverse, stop | Jump: rise, fall, landed | Dash samples |
|---|---|---|---|
| rivet | 18, 71, 126 | 17, 32, 40 | 14, 19 |
| vela | 18, 70, 126 | 16, 32, 41 | 13, 18 |
| bront | 17, 70, 126 | 17, 32, 41 | 14, 17 |
| zephyr | 17, 70, 126 | 17, 32, 41 | 14, 18 |
| mox | 15, 71, 126 | 17, 32, 40 | 13, 18 |
| rune | 16, 70, 127 | 17, 32, 40 | 14, 18 |
| guest07 | 17, 70, 126 | 17, 33, 40 | 13, 17 |

The walk fixture applies right before frame60, left through119, then neutral. Stop samples show guard and floor y578. `final-capture-ledger.json` preserves movement coordinates. Dash playback captures mostly reached its end/recovery because tool latency skipped the early active window; separate exact paused frame3 captures close that pose gap. These are discrete actual-browser observations, NOT continuous-video approval or a measured framerate claim. State reads precede screenshot acquisition during playback, so the image can be several frames later. No browser throttling measurement was taken.

## Findings per fighter

| Fighter | Current findings |
|---|---|
| Golden | Black trouser pelvis remains joined in all eight steps and main2–5; no extra bag or detached shape. Extended kick and landing retain two connected legs. Dash3 and catch9 readable. |
| Morelight | User screenshots showed a compressed bootlike near leg and stretched far-leg/belly bridge. After root's cut184/pinned-pelvis/reach6 fix, all eight current steps retain rounded belly and two distinct feet; neither reported severe artifact appears. Narrow frames still have a deliberately broad monster foot, but no oversized merged boot. |
| Dave | The initial downward central blue/dark spur was a genuine gait-baker defect, not merely a source crease. After root's cut170 pelvis pin it is absent in all eight refreshed steps and main2–5. Muscular thighs remain joined. Aerial kick head looks smaller than guard; this is a remaining proportion inconsistency, not a detached head. |
| Halloween | Red trouser crotch stays connected across eight cells; no loose inner-leg bag. Long legs and foot outlines survive kick and falling poses. |
| Yannix | Thin blue legs/black vest remain connected; no crotch spur in current gait/main cells. Fangs are visible in inspected attack poses. The narrow profile remains stylistically different from the broader original identity; this review does not certify complete reference fidelity. |
| Bongraker | Black trouser join is intact in narrow and wide steps, with distinct shoes. Two facial profiles are intentional reference features. No additional duplicate limb observed. |
| Juicy | Blue thigh/calf joins remain intact; narrow stance does not create a hanging bag. Red facial feature remains visible. Head remains relatively small and facial detail simplified at gameplay scale. |

No new blocking detached/duplicated-limb defect was found in these checked states. The translucent opponent visible behind attacks is the lab opponent, not baked sprite anatomy. Forward catch9 shows attacker hand meeting the opponent torso; these samples do not establish direction-specific paired throw animation quality.

## Final down-air-heavy regression retake

After root moved downward dive acceleration to the first active frame, reloaded the page/assets and selected airHeavy + down. For EACH fighter inspected paused core frames12,20,24,28,36,44 plus three 1× samples (filenames contain actual sampled frames), both facing panels: 63 paired captures total. See `*-down-air-review.jpg` and ledger. All seven visibly reach an extended aerial kick before returning to landing/guard. Dave has later extension (24/28); others show it at20. Morelight's first live sample arrived at26 and missed active extension, so its exact paused20 capture is the evidence for extension. Other sampled live captures include extension or startup; no continuous playback guarantee is implied. No new detached limbs or neck gaps appear in these captures. Dave's smaller aerial head remains a moderate art consistency issue.

Root implemented the pelvis/core fixes. This reviewer only captured, inspected and documented evidence. No permission or environment blocker remains. Historical exhaustive 22-scenario coverage is in `docs/motion-review-first-seven.md`; it was not repeated wholesale today.
