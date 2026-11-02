# Sproto Duo — follow-up QA, November 2, 2026

This is the isolated `codex/twin-fixes` follow-up to public snapshot `f1c43ba`. It corrects the old pending CPU approach, blue kick and throw-fixture findings. It also includes the newly requested menu-size fix and partner-cameo occlusion found during actual play. No push, generation or credit use occurred in this pass. Physical controller testing was explicitly skipped.

The two bodies were examined separately within one logical fighter. Evidence combines exact paused frames, samples taken during normal 1× playback, and keyboard play in the actual game. These are not continuous recordings or inspection of every intervening frame. Tests are mechanical evidence, not aesthetic approval.

## Findings fixed and rechecked

- **CPU collision dead zone:** AI used root distance while two-body collision stopped approach at approximately 194px. Ordinary AI decisions now use the front-body gap; specials retain their root-based reach. The CPU attacked, threw, launched and won a duo mirror match in the browser. 172 automated contact scenarios cover both duo roles, all 22 opponents, both facings and center/wall placements.
- **Blue grounded kick:** core slot 19 planted prematurely. It now reuses coherent raised-knee slot 16. Browser observations include extension at move tick 7, rechamber at 14, plant at 20, and neutral afterward. The raw generated drawing is preserved; this is corrected pose selection, not new animation art.
- **Blue airborne startup:** slot 22 was fully extended before the active kick. It now reuses tucked slot 8, followed by active 23 and falling 9. Right-facing startup/contact/recovery/landing was rechecked after the fix; the red lead was sampled in the opposite facing. Both airMedium and airHeavy mappings pass automated checks; a separate final airHeavy visual pass was not performed.
- **Two throw test failures:** initial fixtures used single-body gaps/walls. Formation-aware fixtures were already present in the shared authoring checkout at resume and were retained, then strengthened with initial and per-tick body-bound assertions. All 15 groups pass. No throw-lifecycle code was changed to make the assertions pass.
- **Menu size:** a twin-only 0.60 multiplier made both bodies too small. Both now use the same preview scale as the rival, with stats below and stage text above. Duo/single and duo/duo layouts were inspected at desktop size; duo/duo was also inspected at 600px and 375px viewport widths. Combat scale is unchanged. Expansion fighters in another chat were not available in this isolated 22-fighter baseline.
- **Partner cameo:** main-game special playback showed Morelight hidden behind the rear twin. The cameo now stays behind the complete formation when there is room, or uses an inset elevated lane at a wall. The lane is retained for the attack so it cannot jump vertically as the owner advances. An intermediate wall position overlapped the combo HUD; the final inset position was rechecked clear of the HUD and twins at both walls. Center playback was also rechecked in both facings.

## Individual body coverage

“Both” means both actual starting facings where stated, not merely the lab's mirrored duplicate panel. Red leads ordinary attacks facing left; blue leads facing right. Throws can retain the original catching body through a facing change.

| State | Red body | Blue body | Evidence / limitation |
| --- | --- | --- | --- |
| Idle, walking, reversal, stop | Sampled in both facings | Sampled in both facings | Exact-frame travel/reversal/stop and normal 1× gait samples; four-key walk remains stepped. No foot-locking or latency measurement. |
| Dash | Active and settled, both facings | Active and settled, both facings | `dash-*-active/recovered`; actual Shift input also exercised. |
| Jump / landing | Rise, fall, grounded, both facings | Rise, fall, grounded, both facings | `jump-*`; actual W input confirmed. |
| Ground kick | Left-leading contact/rechamber | Right-leading chamber/contact/rechamber/plant and 1× samples | `kick-left-*`, `blue-kick-*`, `final-main-blue-kick-*`; final t14 shows a bent knee, not a planted foot. |
| Air kick | Left-leading chamber/extension/landing | Corrected startup/extension/fall/land | `air-kick-left-*`, `blue-air-fixed-*`; airHeavy metadata tested separately. |
| Ordinary attacks / combo | Companion/lead seen in mirror CPU play and special | Actual J→K→L string and kick contact | Three qualifying routes earned three pips; whiffs did not. Not a new per-direction visual sweep of every move. |
| Four directional throws | Hold/release as attacker and victim | Hold/release as attacker and victim | Duo mirror, four directions × two facings; back-throw catcher retained. Down/recovery sampled. |
| Wall victim contact / recovery | Held, floor and return with separate body | Held, floor and return with separate body | Golden Sproto throws the duo at both walls; final recovery observed. Not every 22×22 pair visually inspected. |
| Recoil and launch | Recoil both facings; launch/fall/recovery left | Same shared reaction inspected separately | `recoil-*`, `launched-left*`. Natural opponent occlusion during close contact remains possible. |
| Intro | Right-facing start and 1× samples | Right-facing start and 1× samples | Original source and earlier left-facing checks are historical; no new complete left-facing intro sequence. |
| Team Special | Alternating contact poses | Alternating contact poses | Right contacts 1–4; left contacts 1, 2, 4 and recovery. Main game earned/spent three pips. Final partner placement checked in full-render lab, center/both walls. |
| Standing defeat | Right-facing 1× samples and terminal | Right-facing 1× samples and terminal | `defeat-right-*`; prior opposite-facing coverage is historical. |
| Floor defeat / actual KO | Left floor-origin samples; actual mirror KO | Same | `defeat-floor-left-*`, `main-cpu-mirror-ko`, `main-ko-animation-live`; no upright pop observed. Result and rematch verified. |
| Menu | Full-size red on either side | Full-size blue on either side | `menu-scale-final-desktop`, `menu-scale-final-four-bodies`, responsive screenshots. |

Actual browser checks also covered forward grab contact→release→flight→down→rise→return to control, attack recovery rejecting an early grab, pause, return to selection and rematch resetting health. Final game launch and W jump/ground kick were repeated after the presentation/menu changes. Browser warning/error logs were empty at the final sampled checkpoint.

## Automated checks

All commands below passed. Saved outputs are in `docs/evidence/duo-followup/sproto-twin-final-*.txt`.

| Command | Actual coverage |
| --- | --- |
| `npm run build` | TypeScript and production bundle. Repeated after the final runtime edits. |
| `npm run qa` | Smoke/directional checks; 15 throw groups; 24 movement groups; 8 reaction groups; 21 existing story/navigation stub checks; 6 broad groups including 522,720 scripted frames; 110 fighter cases and 8 power interactions across 22 profiles. |
| `node scripts/duo-smoke.mjs` | 13 groups including 172 CPU contact probes, both blue mappings, body identities/gait, throw ownership, special damage, shared HP and layout bounds. |
| `node scripts/pose-atlas-smoke.mjs` | 8 original 21-fighter pose/grip contract groups; separate duo coverage above. |
| `node scripts/event-clips-smoke.mjs` | 12 event groups for Golden Sproto and Morelight; not all 22 event sets. |
| `node scripts/presentation-smoke.mjs` | Intro/outro, pause/restart and result/story boundary contracts. |
| `node scripts/selection-menu-smoke.mjs` | 7 DOM-stub/gamepad-input navigation checks; no hardware claim. |
| `node scripts/stage-preview-smoke.mjs` | 5 previews and optional-image fallback. |
| `python3 art/pose-atlases/verify_pose_assets.py` | 1,040 frame entries, 23 body atlases, paths/sizes/anchors/binary alpha/padding. |

The full mechanics suite passed before the last menu/cameo presentation edits; build, duo, selection, presentation and event checks were repeated after those edits. No core or atlas changes followed the mechanics run.

## Remaining limits

- Four-key locomotion, repeated holds and simplified whole-body throws remain visible stylistic limitations. This is not continuous generated motion, articulated limb rigging or a claim of perfect animation quality.
- Some directions share drawings. The final mapping repairs reuse approved complete-body poses; no new art was generated.
- Earlier 21-fighter art QA is historical. This follow-up's fresh visual focus was the two bodies of Sproto Duo, plus Morelight as the assist/opponent and Golden Sproto as the throw fixture.
- Physical controller testing was skipped as requested. No full cross-browser/device matrix, long-session test, every match-up's visual overlap, or measured input-to-display latency was performed.
- The other chats' roster expansion and 100-encounter story/God Mode are not integrated here. Existing four-world placeholder tests do not prove that new campaign works.

See [CLAUDE-HANDOFF.md](CLAUDE-HANDOFF.md) for the run path and [TWIN-INTEGRATION.md](TWIN-INTEGRATION.md) for safe integration. No independent final reviewer approved this follow-up; the earlier reviewer stopped at a usage limit.
