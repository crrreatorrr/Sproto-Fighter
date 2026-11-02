# Movement review continuation — 2 November 2026

This checkpoint was prepared on `codex/movement-followup-20261102`, based on local main `89ee9f9a`. The user requested integration of completed work now, without waiting for the unfinished live-motion audit. The four reviewed aerial-kick repairs and functional review fixtures are ready for that local checkpoint. No remote push is authorized; full visual completion is not claimed.

## Confirmed aerial-kick defect and repair

Direct pixel inspection covered all six optional aerial-kick cels and nine relevant core/air/kick poses for Gryph, its companion, Nosmileclown and its small companion. The first active slot used a punch or planted standing pose; the next active slot contained the genuine extended-leg kick. This was an artwork-selection defect, not a missing limb rig or a simulation timing problem.

Each of those four `airKick` clips now uses its existing full-kick drawing in both active slots. Preparation and recovery remain unchanged. There are six timing slots, five distinct drawings and one deliberate contact hold. No pixels were redrawn, no generated animation was purchased, and all original files remain present. No global scale, anchors, collision rules, movement velocities or attack timings changed.

`art/movement-followup-20261102/remap_air_kicks.py` reproduces the four-entry remap. Its review record pins the inspected source image hashes and refuses to reuse changed art without reinspection. A structural comparison against main confirms that only those four atlas entries and the revision changed.

The regression test failed against the original sequence at Gryph's first active air-medium frame, then passed after the remap: 248 actual-renderer phase samples, 52 active contact samples and 8 recovery checks across both actual facings. It also verifies two complete bodies are drawn and painting does not mutate the combat state. Contact sheets were inspected in both mirrored orientations; they are static evidence, not browser recordings.

## Expanded review itinerary

The lab's previous “Full motion review” omitted heavy, low and several aerial/directional actions. The itinerary now has 52 scenarios:

- idle; forward/back walking, reversal and stopping;
- forward/back dash; neutral, forward, backward and held-jump landing; crouch;
- every core ground/air move, rising and diagonal attacks;
- ground and airborne ranged casts with all four aim choices;
- recoil, heavy knockdown, launch, standing and crouching guard;
- all four directions as throw attacker and victim;
- ground and airborne Team Special body animation.

The real-match entrance, defeat, victory and full partner/effect sequence are still separate visual checks. The mirrored lab panel is only a mirrored drawing: paired fighters must also be run with the actual Start facing selector set left and right to exercise both lead-body identities.

The old standing-guard fixture started too far away:130 of 131 fighters walked out of light-attack range before contact. Its closer starting gap now produces genuine blockstun for every fighter. The scenario test checks the actual attack/reaction/throw state instead of trusting the menu label. The existing up+light command is correctly recorded as a launcher, including its aerial form.

The lab stops with an error if a scripted scenario fails to recover within 900 ticks. “Reload page assets” now reloads the page and its cached atlas; it resets the lab selection. None of these controls alter saved story progression.

## Checks completed

- Production build passed.
- All 131 fighters × 52 review scenarios × 2 actual facings passed: 13,624 cases and 2,043,600 core ticks. These are functional checks, not aesthetic approval.
- The full sprite audit passed again: 150 bodies, 15,444 cel entries, 30,888 facing checks, 14,726 hull checks, 524 grips, 2,449,546 composed draws, and 2,882 rendered/control replay scenarios. Zero hard failures; 950 previously documented heuristic advisories remain.
- Final atlas SHA-256: `b2fa20d1ff993819cc9e73acb688736fb2f13ec178918805c08ca88afcdf1fca`.

Evidence: [per-fighter coverage](evidence/movement-followup-20261102/per-fighter-coverage.csv), [individual functional cases](evidence/movement-followup-20261102/scenario-cases.csv), [scenario summary](evidence/movement-followup-20261102/itinerary-summary.json), and before/after contact sheets alongside them. Every row explicitly leaves new live visual approval blocked/unperformed. The previous 16-fighter sampled browser scope is retained as context, not promoted to a 52-scenario pass.

## Blocker and unfinished work

The local filesystem and shell are available, but the browser-control tool is not currently exposed; the app-status connector has recovered, but does not provide browser controls. No alternate UI-control route was used. No additional live-motion observations were completed in this follow-up. All 131 fighters still require completion of their requested live state review; 115 have no recorded live sampling in the preceding combined pass, while 16 have only the narrower checks recorded there.

The isolated candidate is served at `http://127.0.0.1:5196/`; its review page is `http://127.0.0.1:5196/art/pose-atlas-lab.html`. Server/HTTP availability does not count as browser verification. The original game remains on 5173. The latest user instruction permits this tested local checkpoint; actual playback/contact review remains open and will continue separately.

The 150-unique-fighter goal remains 19 supplied entries/assets short. Shared/legacy clips and other previously documented source-art limitations remain; this repair does not claim every fighter has newly authored animations. Physical controller tests remain skipped as requested.

## Reproduce

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/sproto-motion-followup
npm run aerial-kick-art-smoke
npm run motion-review-smoke -- /tmp/sproto-motion-review
npm run sprite-scale-qa -- --out /tmp/sproto-scale-followup
npm run build
npm run dev -- --port 5196 --strictPort
```

The development server is a local process, not an installed startup service. No remote push or publication occurred.
