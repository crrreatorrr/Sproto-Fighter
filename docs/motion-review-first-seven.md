# First seven: current browser motion sampling

Date: 2026-10-31. Own Chrome tab 1760303253; local `/art/pose-atlas-lab.html`. All browser actions used CUA controls. Original-facing and mirrored-facing live panels were inspected. PNG evidence is actual browser output, not synthetic contact-sheet rendering. Review composites are crops of those screenshots; originals remain beside them.

**Initial verdict (before the isolated fix below): sampled anatomy is connected; full motion approval is NOT granted.** The strongest outstanding issue is head-size discontinuity in newly corrected airborne kick poses (Rivet/Yannix clearly, Bongraker moderately; Dave needs native comparison). Parent was notified and owns any follow-up retouch. Initial QA made no edits. A separately authorized follow-up corrected four airborne head cells; details below. Walks, ground cells, manifests, renderer, and core were not edited by this agent.

## Method and exact scope

- For every fighter, step-controlled scenario frame 12: medium kick, light punch, launcher, airHeavy startup, hit, block, forward attacker grab, forward victim throw, special. Additional airHeavy frames 20 and 24 distinguish contact and recovery. Every fighter also has forward attacker/victim throw and special frame 32.
- Rivet additionally has frame 32 medium/light/launcher/airHeavy/hit/block from the initial run. Their PNGs survived a CUA timeout; associated text records did not. Their filenames record the commanded frame count, not independently retained status text.
- Playback was enabled at 1× and sampled for idle/full-review startup and walking separately. At ¼×, special startup was sampled twice per fighter (core frames 2/3). These are brief playback samples, **not a complete 22-scenario loop or continuous video**. No assertion of smoothness between every frame is justified.
- Stepped screenshots are paused and exact. Playback text was read just before screenshot capture, so recorded playback frame is the status observation, not a guarantee of the screenshot's exact frame.
- Asset reload was used after the eight-frame source-textured stance walk installation. No flat-draft walk is approved here. The captured current walking pairs show separate limbs/feet, but do not cover the full eight-frame cycle or backward walking.
- A hot reload changed Halloween to Morelight during one run. That run was rejected and all nine Halloween frame-12 captures were repeated. The early `zephyr-review.jpg` composite is stale and must not be used; current individual `zephyr-*-12.png` files are authoritative.
- Two long CUA batches timed out; saved captures were retained, the tab was recovered, and unfinished forward release samples were completed. No permission denial occurred.

## Findings by fighter

| Fighter | Anatomy / identity in inspected states | Remaining concern |
|---|---|---|
| Golden Sproto / rivet | Yellow exposed skin, green eye area and black suit remain coherent; extended ground kick and punch connect. Forward hold/release visibly changes victim location; mirrored release remains connected. | Active airborne kick head is visibly smaller than rise/fall heads. Isolated head correction around neck pivot recommended; do not scale whole body. |
| Morelight / vela | Bare blue body, yellow belly and red torso motif remain; kick limbs connect, broad face readable in both facings; hold to release moves victim away. | Special frame12 to32 mostly holds the same upright pose. Anatomy passes these samples, animation richness does not. |
| Fat Head Dave / bront | Muscular blue body, red/blue face and yellow shoulder details remain connected. Slower airHeavy is still chambered at20 and extended at24, matching longer startup. | Head appears small in corrected air states relative to neutral; less conclusive versus airborne chamber. Native22/23 vs8/9 comparison required before choosing scale. Special uses sustained crouched pose. |
| Halloween / zephyr | Swept blue head, red outfit and chest motif remain visible; ground kick, uppercut and air kick connected. Forward held and released victim states readable. | Special samples reuse a presenting-hand pose; this does not establish rich special choreography. |
| Yannix / mox | Shaggy indigo face, teeth and vest buttons survive punch/kick/hit/block/throw samples. Thin arms connect without a duplicated arm. | Active air-kick head is visibly smaller than adjacent rise/fall. Single-profile face still loses some original broad multi-eye identity; retouched teeth/chin do not repair head silhouette. |
| Bongraker / rune | Intentional two-faced head remains one connected head; dark suit and shoes remain coherent. Both kick and throw release preserve blue hands. | Moderate active-air head-size pop. The paired face reverses under whole-sprite mirroring as expected; exact asymmetric anatomy is not separately authored. |
| Juicy / guest07 | Blue bare body, red angular nose/lip retouch and neck connection remain in captured moves. Forward release arms are attached; no baked duplicate arm seen. | Generated head remains too small/simplified to preserve all original wrinkled long-face character. Special repeats an advancing hand pose; power/spit release was not separately checked in this run. |

No detached limb, extra limb, separated neck, or missing face was observed in the stated samples. This is not an all-frame guarantee. The ghost opponent sometimes overlaps a limb; it is a separate fighter, not baked sprite duplication. Root changed main-game attacker foreground ordering during the review; the lab's ghost-opponent rendering was unchanged.

## Uncovered acceptance items

Full 22-scenario loop per fighter; all intermediate startup/contact/recovery frames; back/up/down throw variants; all directional attacks; complete eight-frame forward/backward gait; continuous 1× timing/smoothness; power/projectile presentation in the main game; follow-up verification after any head-size retouch. These remain open rather than silently passed.

## Evidence ledger

[`coverage.json`](evidence/motion-first-seven/coverage.json) contains exact retained status observations. All screenshots and AX text are in `docs/evidence/motion-first-seven/`. Each screenshot shows both facings. Status below is the UI-observed core frame/pose; filename category describes the selected scenario.

| Capture | Core frame | Pose / gait |
|---|---:|---|
| [rivet-airHeavy-20](evidence/motion-first-seven/rivet-airHeavy-20.png) | 20 | 23: airKickFull · gait phase 0.000 · x 500.0 y 443.6 facing 1 |
| [rivet-airHeavy-24](evidence/motion-first-seven/rivet-airHeavy-24.png) | 24 | 9: airFall · gait phase 0.000 · x 500.0 y 451.4 facing 1 |
| [rivet-grab-12](evidence/motion-first-seven/rivet-grab-12.png) | 12 | 27: grabHold · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rivet-grab-32](evidence/motion-first-seven/rivet-grab-32.png) | 32 | 28: throwRelease · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rivet-live1x-a](evidence/motion-first-seven/rivet-live1x-a.png) | 10 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rivet-live1x-b](evidence/motion-first-seven/rivet-live1x-b.png) | 15 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rivet-quarterSpecial-a](evidence/motion-first-seven/rivet-quarterSpecial-a.png) | 2 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rivet-quarterSpecial-b](evidence/motion-first-seven/rivet-quarterSpecial-b.png) | 3 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rivet-special-12](evidence/motion-first-seven/rivet-special-12.png) | 12 | 30: powerRelease · gait phase 0.000 · x 518.0 y 578.0 facing 1 |
| [rivet-special-32](evidence/motion-first-seven/rivet-special-32.png) | 32 | 30: powerRelease · gait phase 0.000 · x 548.0 y 578.0 facing 1 |
| [rivet-victimThrow-12](evidence/motion-first-seven/rivet-victimThrow-12.png) | 12 | 24: hit · gait phase 0.000 · x 512.0 y 552.0 facing 1 |
| [rivet-victimThrow-32](evidence/motion-first-seven/rivet-victimThrow-32.png) | 32 | 24: hit · gait phase 0.000 · x 452.3 y 521.9 facing 1 |
| [rivet-walk1x-a](evidence/motion-first-seven/rivet-walk1x-a.png) | 10 | 4: walkFar · gait phase 0.643 · x 541.1 y 578.0 facing 1 |
| [rivet-walk1x-b](evidence/motion-first-seven/rivet-walk1x-b.png) | 14 | 5: passFar · gait phase 0.918 · x 558.7 y 578.0 facing 1 |
| [vela-airHeavy-12](evidence/motion-first-seven/vela-airHeavy-12.png) | 12 | 22: airKickChamber · gait phase 0.000 · x 500.0 y 478.7 facing 1 |
| [vela-airHeavy-20](evidence/motion-first-seven/vela-airHeavy-20.png) | 20 | 23: airKickFull · gait phase 0.000 · x 500.0 y 461.3 facing 1 |
| [vela-airHeavy-24](evidence/motion-first-seven/vela-airHeavy-24.png) | 24 | 9: airFall · gait phase 0.000 · x 500.0 y 473.0 facing 1 |
| [vela-block-12](evidence/motion-first-seven/vela-block-12.png) | 12 | 25: block · gait phase 0.816 · x 478.8 y 578.0 facing 1 |
| [vela-grab-12](evidence/motion-first-seven/vela-grab-12.png) | 12 | 27: grabHold · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-grab-32](evidence/motion-first-seven/vela-grab-32.png) | 32 | 28: throwRelease · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-hit-12](evidence/motion-first-seven/vela-hit-12.png) | 12 | 24: hit · gait phase 0.000 · x 492.3 y 578.0 facing 1 |
| [vela-launcher-12](evidence/motion-first-seven/vela-launcher-12.png) | 12 | 15: uppercut · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-light-12](evidence/motion-first-seven/vela-light-12.png) | 12 | 12: punchExtended · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-live1x-a](evidence/motion-first-seven/vela-live1x-a.png) | 9 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-live1x-b](evidence/motion-first-seven/vela-live1x-b.png) | 13 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-medium-12](evidence/motion-first-seven/vela-medium-12.png) | 12 | 18: kickFull · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-quarterSpecial-a](evidence/motion-first-seven/vela-quarterSpecial-a.png) | 2 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-quarterSpecial-b](evidence/motion-first-seven/vela-quarterSpecial-b.png) | 3 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-special-12](evidence/motion-first-seven/vela-special-12.png) | 12 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-special-32](evidence/motion-first-seven/vela-special-32.png) | 32 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [vela-victimThrow-12](evidence/motion-first-seven/vela-victimThrow-12.png) | 12 | 24: hit · gait phase 0.000 · x 512.0 y 552.0 facing 1 |
| [vela-victimThrow-32](evidence/motion-first-seven/vela-victimThrow-32.png) | 32 | 24: hit · gait phase 0.000 · x 452.3 y 521.9 facing 1 |
| [vela-walk1x-a](evidence/motion-first-seven/vela-walk1x-a.png) | 9 | 3: passNear · gait phase 0.459 · x 529.4 y 578.0 facing 1 |
| [vela-walk1x-b](evidence/motion-first-seven/vela-walk1x-b.png) | 14 | 4: walkFar · gait phase 0.734 · x 547.0 y 578.0 facing 1 |
| [bront-airHeavy-12](evidence/motion-first-seven/bront-airHeavy-12.png) | 12 | 22: airKickChamber · gait phase 0.000 · x 500.0 y 468.9 facing 1 |
| [bront-airHeavy-20](evidence/motion-first-seven/bront-airHeavy-20.png) | 20 | 22: airKickChamber · gait phase 0.000 · x 500.0 y 443.6 facing 1 |
| [bront-airHeavy-24](evidence/motion-first-seven/bront-airHeavy-24.png) | 24 | 23: airKickFull · gait phase 0.000 · x 500.0 y 451.4 facing 1 |
| [bront-block-12](evidence/motion-first-seven/bront-block-12.png) | 12 | 25: block · gait phase 0.770 · x 474.9 y 578.0 facing 1 |
| [bront-grab-12](evidence/motion-first-seven/bront-grab-12.png) | 12 | 27: grabHold · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-grab-32](evidence/motion-first-seven/bront-grab-32.png) | 32 | 28: throwRelease · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-hit-12](evidence/motion-first-seven/bront-hit-12.png) | 12 | 24: hit · gait phase 0.000 · x 492.3 y 578.0 facing 1 |
| [bront-launcher-12](evidence/motion-first-seven/bront-launcher-12.png) | 12 | 15: uppercut · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-light-12](evidence/motion-first-seven/bront-light-12.png) | 12 | 12: punchExtended · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-live1x-a](evidence/motion-first-seven/bront-live1x-a.png) | 10 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-live1x-b](evidence/motion-first-seven/bront-live1x-b.png) | 14 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-medium-12](evidence/motion-first-seven/bront-medium-12.png) | 12 | 18: kickFull · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-quarterSpecial-a](evidence/motion-first-seven/bront-quarterSpecial-a.png) | 2 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-quarterSpecial-b](evidence/motion-first-seven/bront-quarterSpecial-b.png) | 3 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-special-12](evidence/motion-first-seven/bront-special-12.png) | 12 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-special-32](evidence/motion-first-seven/bront-special-32.png) | 32 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [bront-victimThrow-12](evidence/motion-first-seven/bront-victimThrow-12.png) | 12 | 24: hit · gait phase 0.000 · x 512.0 y 552.0 facing 1 |
| [bront-victimThrow-32](evidence/motion-first-seven/bront-victimThrow-32.png) | 32 | 24: hit · gait phase 0.000 · x 452.3 y 521.9 facing 1 |
| [bront-walk1x-a](evidence/motion-first-seven/bront-walk1x-a.png) | 9 | 4: walkFar · gait phase 0.574 · x 536.7 y 578.0 facing 1 |
| [bront-walk1x-b](evidence/motion-first-seven/bront-walk1x-b.png) | 14 | 5: passFar · gait phase 0.918 · x 558.7 y 578.0 facing 1 |
| [zephyr-airHeavy-12](evidence/motion-first-seven/zephyr-airHeavy-12.png) | 12 | 22: airKickChamber · gait phase 0.000 · x 500.0 y 468.9 facing 1 |
| [zephyr-airHeavy-20](evidence/motion-first-seven/zephyr-airHeavy-20.png) | 20 | 23: airKickFull · gait phase 0.000 · x 500.0 y 443.6 facing 1 |
| [zephyr-airHeavy-24](evidence/motion-first-seven/zephyr-airHeavy-24.png) | 24 | 9: airFall · gait phase 0.000 · x 500.0 y 451.4 facing 1 |
| [zephyr-block-12](evidence/motion-first-seven/zephyr-block-12.png) | 12 | 25: block · gait phase 0.770 · x 474.9 y 578.0 facing 1 |
| [zephyr-grab-12](evidence/motion-first-seven/zephyr-grab-12.png) | 12 | 27: grabHold · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-grab-32](evidence/motion-first-seven/zephyr-grab-32.png) | 32 | 28: throwRelease · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-hit-12](evidence/motion-first-seven/zephyr-hit-12.png) | 12 | 24: hit · gait phase 0.000 · x 492.3 y 578.0 facing 1 |
| [zephyr-launcher-12](evidence/motion-first-seven/zephyr-launcher-12.png) | 12 | 15: uppercut · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-light-12](evidence/motion-first-seven/zephyr-light-12.png) | 12 | 12: punchExtended · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-live1x-a](evidence/motion-first-seven/zephyr-live1x-a.png) | 9 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-live1x-b](evidence/motion-first-seven/zephyr-live1x-b.png) | 14 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-medium-12](evidence/motion-first-seven/zephyr-medium-12.png) | 12 | 18: kickFull · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-quarterSpecial-a](evidence/motion-first-seven/zephyr-quarterSpecial-a.png) | 2 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-quarterSpecial-b](evidence/motion-first-seven/zephyr-quarterSpecial-b.png) | 3 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-special-12](evidence/motion-first-seven/zephyr-special-12.png) | 12 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-special-32](evidence/motion-first-seven/zephyr-special-32.png) | 32 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [zephyr-victimThrow-12](evidence/motion-first-seven/zephyr-victimThrow-12.png) | 12 | 24: hit · gait phase 0.000 · x 512.0 y 552.0 facing 1 |
| [zephyr-victimThrow-32](evidence/motion-first-seven/zephyr-victimThrow-32.png) | 32 | 24: hit · gait phase 0.000 · x 452.3 y 521.9 facing 1 |
| [zephyr-walk1x-a](evidence/motion-first-seven/zephyr-walk1x-a.png) | 10 | 4: walkFar · gait phase 0.643 · x 541.1 y 578.0 facing 1 |
| [zephyr-walk1x-b](evidence/motion-first-seven/zephyr-walk1x-b.png) | 14 | 5: passFar · gait phase 0.918 · x 558.7 y 578.0 facing 1 |
| [mox-airHeavy-12](evidence/motion-first-seven/mox-airHeavy-12.png) | 12 | 22: airKickChamber · gait phase 0.000 · x 500.0 y 468.9 facing 1 |
| [mox-airHeavy-20](evidence/motion-first-seven/mox-airHeavy-20.png) | 20 | 23: airKickFull · gait phase 0.000 · x 500.0 y 443.6 facing 1 |
| [mox-airHeavy-24](evidence/motion-first-seven/mox-airHeavy-24.png) | 24 | 9: airFall · gait phase 0.000 · x 500.0 y 451.4 facing 1 |
| [mox-block-12](evidence/motion-first-seven/mox-block-12.png) | 12 | 25: block · gait phase 0.770 · x 474.9 y 578.0 facing 1 |
| [mox-grab-12](evidence/motion-first-seven/mox-grab-12.png) | 12 | 27: grabHold · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-grab-32](evidence/motion-first-seven/mox-grab-32.png) | 32 | 28: throwRelease · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-hit-12](evidence/motion-first-seven/mox-hit-12.png) | 12 | 24: hit · gait phase 0.000 · x 492.3 y 578.0 facing 1 |
| [mox-launcher-12](evidence/motion-first-seven/mox-launcher-12.png) | 12 | 15: uppercut · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-light-12](evidence/motion-first-seven/mox-light-12.png) | 12 | 12: punchExtended · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-live1x-a](evidence/motion-first-seven/mox-live1x-a.png) | 10 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-live1x-b](evidence/motion-first-seven/mox-live1x-b.png) | 14 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-medium-12](evidence/motion-first-seven/mox-medium-12.png) | 12 | 18: kickFull · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-quarterSpecial-a](evidence/motion-first-seven/mox-quarterSpecial-a.png) | 2 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-quarterSpecial-b](evidence/motion-first-seven/mox-quarterSpecial-b.png) | 3 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [mox-special-12](evidence/motion-first-seven/mox-special-12.png) | 12 | 30: powerRelease · gait phase 0.000 · x 506.0 y 578.0 facing 1 |
| [mox-special-32](evidence/motion-first-seven/mox-special-32.png) | 32 | 30: powerRelease · gait phase 0.000 · x 516.0 y 578.0 facing 1 |
| [mox-victimThrow-12](evidence/motion-first-seven/mox-victimThrow-12.png) | 12 | 24: hit · gait phase 0.000 · x 512.0 y 552.0 facing 1 |
| [mox-victimThrow-32](evidence/motion-first-seven/mox-victimThrow-32.png) | 32 | 24: hit · gait phase 0.000 · x 452.3 y 521.9 facing 1 |
| [mox-walk1x-a](evidence/motion-first-seven/mox-walk1x-a.png) | 9 | 4: walkFar · gait phase 0.574 · x 536.7 y 578.0 facing 1 |
| [mox-walk1x-b](evidence/motion-first-seven/mox-walk1x-b.png) | 15 | 5: passFar · gait phase 0.987 · x 563.1 y 578.0 facing 1 |
| [rune-airHeavy-12](evidence/motion-first-seven/rune-airHeavy-12.png) | 12 | 22: airKickChamber · gait phase 0.000 · x 500.0 y 468.9 facing 1 |
| [rune-airHeavy-20](evidence/motion-first-seven/rune-airHeavy-20.png) | 20 | 23: airKickFull · gait phase 0.000 · x 500.0 y 443.6 facing 1 |
| [rune-airHeavy-24](evidence/motion-first-seven/rune-airHeavy-24.png) | 24 | 9: airFall · gait phase 0.000 · x 500.0 y 451.4 facing 1 |
| [rune-block-12](evidence/motion-first-seven/rune-block-12.png) | 12 | 25: block · gait phase 0.770 · x 474.9 y 578.0 facing 1 |
| [rune-grab-12](evidence/motion-first-seven/rune-grab-12.png) | 12 | 27: grabHold · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-grab-32](evidence/motion-first-seven/rune-grab-32.png) | 32 | 28: throwRelease · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-hit-12](evidence/motion-first-seven/rune-hit-12.png) | 12 | 24: hit · gait phase 0.000 · x 492.3 y 578.0 facing 1 |
| [rune-launcher-12](evidence/motion-first-seven/rune-launcher-12.png) | 12 | 15: uppercut · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-light-12](evidence/motion-first-seven/rune-light-12.png) | 12 | 12: punchExtended · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-live1x-a](evidence/motion-first-seven/rune-live1x-a.png) | 9 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-live1x-b](evidence/motion-first-seven/rune-live1x-b.png) | 15 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-medium-12](evidence/motion-first-seven/rune-medium-12.png) | 12 | 18: kickFull · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-quarterSpecial-a](evidence/motion-first-seven/rune-quarterSpecial-a.png) | 2 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-quarterSpecial-b](evidence/motion-first-seven/rune-quarterSpecial-b.png) | 3 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-special-12](evidence/motion-first-seven/rune-special-12.png) | 12 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-special-32](evidence/motion-first-seven/rune-special-32.png) | 32 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [rune-victimThrow-12](evidence/motion-first-seven/rune-victimThrow-12.png) | 12 | 24: hit · gait phase 0.000 · x 512.0 y 552.0 facing 1 |
| [rune-victimThrow-32](evidence/motion-first-seven/rune-victimThrow-32.png) | 32 | 24: hit · gait phase 0.000 · x 452.3 y 521.9 facing 1 |
| [rune-walk1x-a](evidence/motion-first-seven/rune-walk1x-a.png) | 11 | 4: walkFar · gait phase 0.712 · x 545.5 y 578.0 facing 1 |
| [rune-walk1x-b](evidence/motion-first-seven/rune-walk1x-b.png) | 14 | 5: passFar · gait phase 0.918 · x 558.7 y 578.0 facing 1 |
| [guest07-airHeavy-12](evidence/motion-first-seven/guest07-airHeavy-12.png) | 12 | 22: airKickChamber · gait phase 0.000 · x 500.0 y 468.9 facing 1 |
| [guest07-airHeavy-20](evidence/motion-first-seven/guest07-airHeavy-20.png) | 20 | 23: airKickFull · gait phase 0.000 · x 500.0 y 443.6 facing 1 |
| [guest07-airHeavy-24](evidence/motion-first-seven/guest07-airHeavy-24.png) | 24 | 9: airFall · gait phase 0.000 · x 500.0 y 451.4 facing 1 |
| [guest07-block-12](evidence/motion-first-seven/guest07-block-12.png) | 12 | 25: block · gait phase 0.770 · x 474.9 y 578.0 facing 1 |
| [guest07-grab-12](evidence/motion-first-seven/guest07-grab-12.png) | 12 | 27: grabHold · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-grab-32](evidence/motion-first-seven/guest07-grab-32.png) | 32 | 28: throwRelease · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-hit-12](evidence/motion-first-seven/guest07-hit-12.png) | 12 | 24: hit · gait phase 0.000 · x 492.3 y 578.0 facing 1 |
| [guest07-launcher-12](evidence/motion-first-seven/guest07-launcher-12.png) | 12 | 15: uppercut · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-light-12](evidence/motion-first-seven/guest07-light-12.png) | 12 | 12: punchExtended · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-live1x-a](evidence/motion-first-seven/guest07-live1x-a.png) | 9 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-live1x-b](evidence/motion-first-seven/guest07-live1x-b.png) | 14 | 0: guard · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-medium-12](evidence/motion-first-seven/guest07-medium-12.png) | 12 | 18: kickFull · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-quarterSpecial-a](evidence/motion-first-seven/guest07-quarterSpecial-a.png) | 2 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-quarterSpecial-b](evidence/motion-first-seven/guest07-quarterSpecial-b.png) | 3 | 29: powerCharge · gait phase 0.000 · x 500.0 y 578.0 facing 1 |
| [guest07-special-12](evidence/motion-first-seven/guest07-special-12.png) | 12 | 30: powerRelease · gait phase 0.000 · x 524.0 y 578.0 facing 1 |
| [guest07-special-32](evidence/motion-first-seven/guest07-special-32.png) | 32 | 30: powerRelease · gait phase 0.000 · x 580.0 y 578.0 facing 1 |
| [guest07-victimThrow-12](evidence/motion-first-seven/guest07-victimThrow-12.png) | 12 | 24: hit · gait phase 0.000 · x 512.0 y 552.0 facing 1 |
| [guest07-victimThrow-32](evidence/motion-first-seven/guest07-victimThrow-32.png) | 32 | 24: hit · gait phase 0.000 · x 452.3 y 521.9 facing 1 |
| [guest07-walk1x-a](evidence/motion-first-seven/guest07-walk1x-a.png) | 10 | 4: walkFar · gait phase 0.643 · x 541.1 y 578.0 facing 1 |
| [guest07-walk1x-b](evidence/motion-first-seven/guest07-walk1x-b.png) | 15 | 5: passFar · gait phase 0.987 · x 563.1 y 578.0 facing 1 |


## Follow-up: isolated airborne head repair and current recheck

Parent authorized fixing Rivet and Yannix slots22/23 after the review. `art/pose-atlases/fix_air_head_scale.py` now deterministically enlarges only polygon-isolated heads around fixed neck pivots (Rivet1.28×, Yannix1.30×), from preserved `air-head-baseline` originals. Nearest-neighbor copying preserves the existing palette and Yannix's retouched fangs/chin; no generic replacement face was painted. Mask edges were tightened after magnified review to exclude adjacent fists. The source body/arms were not scaled.

Native and3× views were inspected against unchanged8/9. Current verdict: the severe head-size drop is substantially reduced, neck connections stay closed, and fists remain attached. Generated head silhouettes still differ somewhat between poses; this is an improvement, not a claim of perfect identity/hand-animation consistency. Yannix's single-profile simplification remains. Rune/Dave were not changed.

Verification: four processed PNGs equal public copies by SHA256. The script asserts zero pixel differences outside the union of old and transformed head masks. Reports and exact polygons/pivots are retained in `art/pose-atlases/air-head-scale-report.json` and the script. Review images are `processed/{rivet,mox}/air-head-review.png` and `air-head-review-3x.png`.

After the final source edit and asset reload, actual browser checks for BOTH fighters and BOTH facing panels:

| Scenario frame | Move time | Actual slot | Finding |
|---|---:|---|---|
|15|6|22 airKickChamber|Enlarged head remains attached at neck; guard hands remain readable.|
|20|11|23 airKickFull|Connected extended kick; head proportion is closer to fall/rise; existing facial colors and fangs retained.|
|24|15|9 airFall|Unchanged fall pose; comparison no longer shows the severe previous size collapse.|

[Browser paired-facing evidence](evidence/motion-first-seven/air-head-fixed-browser.jpg); full screenshots and status text: `rivet-air-head-fixed-{15,20,24}` and `mox-air-head-fixed-{15,20,24}`.

Additional requested Morelight medium-recovery check: coreframe22, movetime17, slot13 punchRecover, y578 grounded. Both facing panels show a planted upright recovery, without the former deep crouch10 dip. Evidence: [Morelight recovery](evidence/motion-first-seven/vela-medium-recovery-fixed-22.png). This confirms the sampled recovery mapping, not every transition frame.

No continuous-video approval is added by these stepped rechecks. Full22-scenario/directional coverage remains open as listed above.


## Extended live-sequence pass: completed sampled coverage

Independent Chrome tab1760303261, selected1× playback. All seven traversed Full motion review through scenario22. **462 loop samples were actually captured and visually inspected: three time buckets for each of22 scenarios for each of7 fighters, both facing panels.** Golden initially missed backward walk and early/middle dash between observations; a second live pass filled those5 samples. This is complete scenario-label coverage, not continuous-video or every-frame approval.

Current extra evidence: **56 exact paused walk-frame captures (all8 per fighter),7 forward-hold frame9 captures on `whole-pose-contact-2`, and a paused Golden dash frame5.** All were visually inspected. Earlier standalone walk samples labelled `backwalk-fill`/`backwalk-live` are deliberately excluded as backward evidence: Aim/throw direction does not control walking. The standalone walk scenario runs right then left by age; the full sequence's explicit Walk backward scenario supplies actual backward coverage. Its decreasing x coordinates were verified.

Full-loop passes took roughly44–48 seconds each at selected1×; the first included a capture gap spanning one scenario. No sustained simulation stall was established. Browser/tool observation can miss frames, and screenshot pixels follow AX text by several simulation frames during playback. A stale helper tried the prior closed tab while saving holds; it was replaced, and all7 current holds were explicitly saved afterward. Paused walk/hold frames do not have that playback timing ambiguity. No permission denial occurred.

### Revision boundaries and current findings

First5 loop passes (rivet,vela,bront,zephyr,mox) precede the contact2 hold/idle mapping change. Rune/Juicy loops and all56 walk cells/all7 hold retakes follow it. Source/assets were frozen during each pass. Earlier throw images remain historical; the new holds are the current contact verdict. No source or asset edits were made in this extension.

| Fighter | All8 walk-frame inspection | Current forward hold9 | Other loop observations |
|---|---|---|---|
|rivet|Two dark-shoed legs stay separate; stance narrows/widens without crossed-leg silhouette; guard upper body stable.|Both hands meet Morelight's torso; improved visible catch.|Corrected air head remains coherent in sampled sequence; backward-walk gap filled with actual scenario3.|
|vela|Blue calves and native toes remain attached in all8; yellow belly/red torso motif stable.|Hands meet Golden's chest/upper torso.|Jump, hit, recovery and four throw directions visible; sustained special poses still limited.|
|bront|Muscular thighs, calves and toes connect in all8; no third leg or detached foot.|Forward-reaching hands meet Golden's torso; broad shoulders remain attached.|Dash recovers upright; slower airborne strike timing remains distinct; head-size caveat from earlier review remains.|
|zephyr|Red trouser legs/boots stay distinct in all8; torso/chest emblem stable.|Blue hands connect at Golden's upper torso.|Red body remains connected through jump/landing and all throw-direction samples.|
|mox|Thin indigo legs connect under vest in all8; feet do not cross; guard maintained.|Hands connect at Golden's torso. Faces are close and slightly overlap in this fixture, so paired-art clarity is still imperfect.|Fixed airborne head retained; single-profile identity simplification remains.|
|rune|Black shoes remain distinct in all8; two-face head is stable and intentional.|Reach hands meet Golden's torso; head itself stays connected.|Current four attacker/victim directions sampled; upward victims can leave top of panel.|
|guest07|Blue thighs/calves/toes connect in all8, with an especially readable open stance; no baked spare limb.|Two reaching hands contact Golden's torso; neck remains closed.|Current all-direction throws and advancing special observed; long-face identity remains simplified.|

All56 walk cells show a guarded stance-step/shuffle, not a conventional crossing-leg walk. This is consistent with the intended fighting movement; it should not be described as newly hand-drawn full-body walking. No detached limb/neck, baked extra limb, or missing face was found in visible current samples. Perspective/mirroring reverses asymmetric faces. Upward victims partially leave the lab panel at late samples; hidden pixels cannot be approved from those images. Distinct directional body throws remain limited to shared poses plus trajectories/contact correction.

### Exact loop status frames

Each cell lists early/middle/late core frames from the captured UI text. The associated PNGs may be several frames later because playback continues between the two observations. `evidence/motion-first-seven/loops/coverage.json` retains every label/pose/frame and source filename. All462 PNGs were reviewed through21 paired-facing composites plus the5 corrected gap images. The first Rivet composite retains blank missing cells; `rivet-missing-loop-filled.jpg` supplies them.

|Scenario|rivet|vela|bront|zephyr|mox|rune|guest07|
|---|---|---|---|---|---|---|---|
|1 Idle / breathing|13/20/46|0/20/45|9/22/46|10/21/46|10/22/46|10/22/45|10/22/50|
|2 Walk forward|1/21/45|1/20/45|0/22/45|1/21/45|0/21/46|2/20/46|0/23/50|
|3 Walk backward|5/22/48|1/20/45|1/21/45|1/20/47|1/20/45|2/20/47|2/25/48|
|4 dash|3/21/96|0/20/45|1/20/45|0/20/46|1/20/48|4/21/45|4/20/46|
|5 jump|1/21/45|1/20/46|1/21/45|2/21/46|2/21/47|0/21/47|1/21/49|
|6 light|1/20/46|1/21/46|1/20/46|1/21/46|2/21/47|3/20/48|1/22/49|
|7 medium|1/20/47|1/20/46|2/21/47|0/21/45|0/20/45|1/20/47|5/22/47|
|8 sweep|1/20/45|2/21/46|0/21/45|0/21/47|1/21/47|3/21/45|0/23/47|
|9 launcher|0/21/46|0/21/46|1/22/48|0/20/45|3/22/45|0/21/47|4/20/48|
|10 bolt|1/20/45|1/21/46|1/20/46|0/21/46|3/20/47|3/21/46|0/23/47|
|11 airMedium|1/21/45|0/21/46|1/21/47|1/21/45|2/20/45|3/20/46|2/25/45|
|12 hit|0/21/46|1/20/46|0/20/46|1/22/46|3/20/48|0/21/47|5/21/45|
|13 block|1/20/45|1/21/46|1/21/46|0/20/45|0/21/45|2/23/45|5/23/45|
|14 Attacker throw · forward|1/21/46|0/21/46|1/20/46|0/21/46|2/20/46|2/21/45|2/23/45|
|15 Attacker throw · back|1/20/45|1/21/46|1/22/47|0/20/46|1/21/46|1/22/48|2/23/50|
|16 Attacker throw · up|0/21/46|1/21/45|0/20/46|0/21/46|0/20/47|2/23/47|3/20/47|
|17 Attacker throw · down|1/20/45|1/21/45|1/22/45|1/21/46|1/20/46|3/21/46|0/22/48|
|18 Victim throw · forward|0/20/45|1/21/45|0/21/46|0/20/45|0/20/45|3/21/48|0/22/51|
|19 Victim throw · back|1/20/45|1/21/46|1/22/45|0/20/45|0/20/45|5/25/46|4/24/45|
|20 Victim throw · up|0/20/45|0/20/45|0/20/46|1/22/45|2/20/46|2/25/47|2/24/48|
|21 Victim throw · down|0/21/46|0/21/46|1/21/47|1/21/46|0/21/46|5/20/49|0/23/50|
|22 Team special|1/21/45|1/21/45|1/20/46|3/20/45|2/21/45|5/21/47|3/20/48|

### Exact walk-cell capture frames

Paused via Step1frame; each row is walk sequence indices0–7. Native browser crops `*-walk-review.jpg` preserve both facing views. `hold-contact2-review.jpg` collects all7 current holds; full PNGs remain alongside.

|Fighter|Core frames for walk0/1/2/3/4/5/6/7|
|---|---|
|rivet|1/3/5/7/8/10/12/14|
|vela|1/3/6/8/10/13/15/17|
|bront|1/3/5/7/8/10/12/14|
|zephyr|1/3/5/7/8/10/12/14|
|mox|1/3/5/7/8/10/12/14|
|rune|1/3/5/7/8/10/12/14|
|guest07|1/3/5/7/8/10/12/14|

Remaining limits: no continuous-video smoothness approval; not every intervening contact/recovery frame observed; earlier first5 nonforward holds were not all repeated after contact2 (current forwardhold retakes plus Rune/Juicy all-direction loops are the post-fix evidence); main-game effect/partner choreography and all441 pairings are outside this visual pass. Existing art/pose-reuse/identity limitations above remain. The earlier open item for seven-fighter scenario-label and eight-cell walk coverage is now closed at the stated sampled level.
