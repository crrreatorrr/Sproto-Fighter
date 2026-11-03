# Current-update QA — 2026-10-31

This records the one-time extensive QA requested for this update. It is not a standing policy for future features. Final rig revision: `24495940b540c6d6`. No known access blocker remains. The game is local-only.

## What changed and what was fixed

- Replaced rejected procedural combat art with all 21 reference-based Higgsfield images, cleaned alpha, 128-pixel working grid and 15 attached parts per fighter. Original submitted images appear on selection cards.
- Removed baked torso hands/arms, repaired Juicy and other silhouettes, restored Jahon's neck, and added bounded source-color joint/neck underlays. Source proportions and individual appearance constraints remain recorded in the roster manifest.
- Added planted-foot gait, five-frame pose transitions, contact-before-hitstop freezing, separate limb paths and individual guards/strike/kick/cast/special choreography. Texture seams at some bends remain a limitation of reconstructing hidden surfaces from one source pose.
- Ground acceleration/reversal now takes three simulation frames, braking two. Air momentum persists, air steering remains available during attacks, dash can transition after its brief commitment, and buffered landing actions resolve on landing.
- A live launcher route revealed the victim falling below the attacker before its finisher; aerial hit velocity alignment was corrected and the four-hit route retested successfully.
- Directional catch/hold/release throws now synchronize both fighters. Corrected a QA harness bug that had pressed throw directions after the grab; final evidence asserts each actual core throw direction.
- Added 21 distinct mechanical profiles and special schedules, with pumpkins, returning rings/links, ground debris, accelerating shots, pulls, drains, and VAMP's movement slow. Acid initially arced above a nearby target; corrected its initial vertical trajectory and retested.
- Story/free-play browsing now preserves paused/running state. Leaving story restores the prior practice setting. Fixed stage label alignment, throw feedback, special charge feedback, and timeout-draw wording.

## Reproducible checks

`npm run build` passes TypeScript and the production bundle. `npm run qa` passes; full output is [qa-current-results.txt](qa-current-results.txt).

| Coverage | Method and result |
| --- | --- |
| All 21 roster combo routes | Each completes light → medium → finisher and earns one pip. |
| Directional attacks / combos | Up chord priority, diagonal launch, low/dive attacks, four spit aims, five-hit ground string, projectile conversion, four-hit air route, dash cancel and no blocked/whiff charge. |
| Directional throws | Forward/back/up/down, hold/release, damage timing, miss, invalid air/stun targets, interruption and simultaneous grab break. |
| Movement | All 21 acceleration/reversal/braking; momentum, steering, dash-to-attack, buffered landing/jump, held jump, lockouts and replay. |
| Round outcomes | Both KO winners, double KO, health-based timeout, equal-health timeout, full 99-second neutral timeout, practice no timer, terminal-state immutability and fresh round. |
| Input interaction matrix | All 441 player/opponent combinations × CPU/dummy/guard configurations ×360 frames =476,280 scripted frames. Repeated, opposing-direction, simultaneous/all-button and directional attack masks; finite/bounded state and identical replay. This deliberately supplies both masks, so it is not 441 full CPU matches. |
| Individual powers | 105 per-fighter cases: four aimed casts plus each charged special's exact contact schedule, damage, spend, recovery and no self-charge. Eight additional bounce/return/drain/slow checks. |
| Story/navigation | 17 controller/actual-hook tests: all worlds, five free stages, opening/transition/ending slots, win/lose/draw, retry, restart, Back/Escape, readiness, pause ownership and mode restoration. DOM stub, not claimed as browser play. |

## Sprite/rig visual coverage

The actual Canvas renderer generated 4,896 samples with zero draw failures: the previous 105 base/combat/throw cases per facing per fighter, plus fighter-specific special contact samples. All 21 pass first-contact pose update followed by eight frozen-frame comparisons. Planted-foot attachment checks for Golden Sproto and Morelight remain below one pixel (Morelight maximum 0.156 px with its revised gait).

Base coverage includes idle, walking phases, rise/fall, crouch, dash, hit/block, aimed casts and special phases. Combat coverage samples startup/contact/recovery for 12 move types and directional branches. Throws cover attacker/victim hold/release in four directions and both facings. The follow-up after individual-kit changes rechecks combat and special sheets at each fighter's own timings. These are sampled rendered states; they do not establish every intermediate frame or transition.

| Fighters | Per-fighter findings and exact revision coverage |
| --- | --- |
| Golden Sproto, Morelight | [QA-first2.md](QA-first2.md) |
| Fat Head Dave, Halloween 2008, Yannix, Bongraker, Juicy, Yoyo | [QA-batch01.md](QA-batch01.md) |
| Red Kev, Sprotel Bitcoin, Chode Adoration, $Bitcoin Obama, Jahon, Virtuagram | [QA-batch02.md](QA-batch02.md) |
| Dumpstar, Crapto, VAMP, Alpha 777, Bitcoin Mandela, Big Swole, Little Foot Nate | [QA-batch03.md](QA-batch03.md) |

Source reference IDs, local originals and appearance requirements: [roster manifest](../art/roster-manifest.json). The withdrawn rig diagram is not used. Bug screenshots are excluded from selection portraits.

## Actual browser/manual coverage

Verified in the Mac in-app browser using native keyboard input and visible UI/Canvas, with a read-only `?qa` panel for evidence:

- All 21 player selections and all 21 opponent selections reset to the correct fighter; [selection log](qa-roster-selection.json). Original reference portraits retain aspect ratio.
- Golden Sproto ground movement/reversal, jump, rising chord, three-hit routes, three-pip charge and partner special. Juicy launcher → jump → air light/medium/finisher, four directional throws, visible catch/release and failed distant grab. Jahon jump/dive, aimed spit and dash-to-medium; neck remains connected in inspected poses. Morelight guard-practice chain caused no damage or meter.
- New individual-kit VAMP projectile, three confirmed ground routes, earned Black Parade special with Golden Sproto cameo and charge consumption. Halloween 2008 visibly throws a pumpkin. All 21 special rigs viewed in animated preview in both orientations at representative phases; earlier all-roster walk/kick playback also inspected. This is not 21 complete manually played matches.
- CPU match played through loss and story retry. All four stage themes inspected in running arena; ranch retained. Story opening/direct-world entry, back paths, free-stage selection, paused-state preservation and guard-mode restoration visibly checked. Full four-win campaign and ending were exercised by controller tests, not won manually.
- Keyboard jump remapped to T and visibly tested airborne, then defaults restored to W. Holding W through landing did not repeat jumping. Pause/resume, restart, selection restart and controls dialog checked. No warning/error logs returned in final browser inspection.

Evidence includes [story worlds](qa-story-worlds.png), [marina](qa-marina-live.png), [Black Parade](qa-black-parade-live.png), [VAMP cast](qa-vamp-power.png), [all-fighter mirrored special playback](qa-all-specials-left.png), and prior [back throw](qa-back-throw.png). Earlier screenshots/logs may show superseded shared-kit labels; final kit definitions are in [FIGHTER_KITS.md](FIGHTER_KITS.md).

## Honest limits

No physical gamepad was available. Gamepad polling/remapping remains implemented but hardware behavior is unverified. Other browsers, mobile/touch, network play, endurance/performance under load and all possible input sequences were not checked. Competitive balance and human preference for animation feel need user playtesting. Combat uses simplified hit regions; individual profiles share the same input/cancel architecture. Cutout joints can show flat hidden-surface fills or rotating stripe/muscle seams; these are not hand-painted frame-by-frame sprites. Four new stages and all story scenes are deliberately labeled placeholders; no final story or cutscene animation was created.
