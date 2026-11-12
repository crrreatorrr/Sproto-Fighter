# Gameplay improvement plan: what shipped (2026-11-11)

This records the implementation of
[GAMEPLAY-IMPROVEMENT-PLAN-20261109.md](GAMEPLAY-IMPROVEMENT-PLAN-20261109.md) on branch
`claude/trusting-ramanujan-63h582`. Everything except D1 is implemented. One simulation
change was made (Phase C), so the simulation fingerprint moved and the hub's bundle has to
follow before online play.

## 0. QA follow-up: the retune (read this first)

**Update, 2026-11-12.** The tournament has since been re-run on the retuned build and the CPU
changed again so that it reads both kits' numbers:
[balance/CPU-KIT-AWARE-20261112.md](balance/CPU-KIT-AWARE-20261112.md). The fingerprint is now
`84f964848ca02602`, `read` is 0.35 at Normal and 0.40 at Hard, and the bot table below has moved
by a few points. The rest of this section describes the build as merged in PR #54.

QA found the first CPU rewrite closed the exploits but left Hard a wall for ordinary play, and
that Weapon fighters had drifted to about 58% CPU against CPU. The CPU was retuned in a second
simulation change. **The current fingerprint is `a23b4cb178899af9`**; where sections 2 to 4
below say `0caf6cd9cf7c1c5c`, or quote the first rewrite's tuning, tournament and story skill,
they describe the build QA rejected and are kept as the record of it.

What changed in `src/sim/cpu.ts`:

- **Range tracking scales with skill** (`track`: 28, 10, 7, 6 frames for Easy, Normal, Hard,
  Expert). The first rewrite gave every difficulty a six-frame-old view of where the rival
  stood, which was most of what made Easy and Normal hard to walk up to.
- **Fewer reads below Expert** (`read` 0.15 / 0.40 / 0.48 / 0.97) and less wake-up guard at Hard
  (`wake` 0.75). Anti-air is a little more likely (0.32 at Normal, 0.72 at Hard) and from Hard
  up comes out as soon as the jump is read.
- **A read also confirms the hit**: a guarded jab is not followed into an unsafe finisher.
- **A rival who guards more than they are hit** is thrown more often and jabbed low more often.
- **Weapon bias, found and fixed.** After a medium landed at the edge of its range the CPU always
  threw the finisher. It whiffed for every kit except the long-reach ones, which were the only
  fighters to convert a stop-hit. The CPU now follows up only with a button that will still
  reach after the pushback, and does not use a finisher follow-up from further than a standard
  kit could. Weapon fighters win 54.0% CPU against CPU at skill 7 (480 bouts; 51.0% on main by
  the same measure, about 60% before the fix). No kit numbers changed.

Bot win rate after the retune, on the fixed sample in `tests/cpu-exploits.test.ts` (48 matches
per cell; Easy / Normal / Hard / Expert):

| Bot | Rate | Band |
| --- | --- | --- |
| Ranged (exploit) | 0 / 0 / 0 / 0 | at most 70 / 45 / 25 / 10 |
| Mash (exploit) | 85 / 46 / 23 / 2 | at most 90 / 60 / 30 / 10 |
| Sweep (exploit) | 88 / 15 / 4 / 0 | at most 95 / 50 / 20 / 10 |
| Walker: walks in, guards half, light-light-medium-finisher | 100 / 79 / 33 / 17 | 85-100 / 60-80 / 30-50 / below Hard |
| Jumper: jumps in, never guards | 88 / 42 / 35 / 4 | at least 55 / 30-50 / 15-40 / below Hard |
| Blocker: guards two in three, punishes | 98 / 73 / 44 / 2 | 85-100 / 60-80 / 30-50 / below Hard |

The three sensible-play bots were rebuilt from QA's descriptions, so they are not QA's bots.
On the rejected build they scored walker 90 / 63 / 25, jumper 44 / 17 / 15 and blocker
77 / 60 / 27 where QA measured 92 / 58 / 14, 36 / 14 / 8 and 89 / 53 / 3: close, and a few
points kinder at Hard. The jumper's Hard ceiling in the test is 40 rather than QA's 35 for that
reason; on a 120-match sample it lands at 31. These bands have floors, so a later CPU change
that makes Hard a wall again fails the test.

Also changed:

- **Story opens at skill 2**, not 3. Easy (skill 1) is beaten 88-100% of the time by all three
  sensible bots and Normal (4) 42-79%; 2 keeps the opener clearly winnable while no longer
  being the old skill-1 walkover.
- **Boss Tickets toast.** The vendored SDK's `reportEvent` returns only `{ granted }` and drops
  the `tickets` the server credited, so the first version announced every paid boss win as
  unpaid. The client now reads the Ticket balance before and after the report and toasts the
  real difference; if the balance cannot be read it says only "Boss defeated / Reported to the
  hub". The test's fake SDK now has the real SDK's return shape. Update 2026-11-12: hub SDK
  0.7.1 (vendored from hub `main` e19c27a) returns `tickets` from `reportEvent`, and the toast
  now uses it directly. The balance difference remains only as the fallback for a server that
  leaves `tickets` out.
- Best of 3 results show the match winner and the round score; the footer names the round rule
  in force; the wager eligibility message no longer mentions CPU wins; the pause move list has
  room for its last row.

The balance tournament in section 2 was not re-run after the retune.

## 1. Status by item

| Item | Status | Where | Notes |
| --- | --- | --- | --- |
| A1 result text | Done | `src/main.ts` | YOU WIN / YOU LOSE / DOUBLE K.O.; the old lines are the sub-line. Online result titles are unchanged (an online check matches them). |
| A2 K.O. banner | Done | `src/render.ts` | 96 px on a dark band centred at y 330; the notice box is not drawn once the round is decided. |
| A3 HUD sizes | Done | `src/render.ts` | Health 16 px, meter label 13 px, round label 14 px, block hint 13 px, combo sub-lines 13-14 px. Widths were measured in the game font at 1280x720; the canvas is a fixed 1280x720 scaled by CSS, so smaller windows scale the same layout. |
| A4 hidden modes in the menu | Done | `src/selectionMenu.ts`, `src/main.ts` | Rules: Classic / Best of 3 for CPU and local versus. Rival behavior: Training (and the Tutorial, D2). `?matchDepth` and `?training` still work. Classic stays the default (decision 8.2 asks for playtests first). Online is unchanged. |
| A5 impact feedback | Done | `src/render.ts`, `src/main.ts` | Shake on heavy and special hits, sparks sized by hit stop, the final hit at 0.4x for 20 steps (local play only). Render and frame pacing only. |
| B1 sound | Done | `src/audio.ts`, `src/audioEvents.ts` | Synthesised with Web Audio: 23 effects and three music loops, no audio files. Volumes in Settings. Nobody has listened to it yet: see section 6. |
| C1 projectiles | Done | `src/sim/cpu.ts` | See section 2. "Return fire" from skill 7 was not added: the CPU answers with a ready Team Special instead, which the plan allows, and a cast of its own would stop it guarding. |
| C2 repeated moves | Done | `src/sim/cpu.ts` | Punish floor 0.6 at skill 4 and 0.9 at skill 7 for a move guarded twice in three seconds. |
| C3 exploit tests | Done | `tests/cpu-exploits.test.ts` | Bands hold and fall with skill; see section 2. |
| D1 archetype rules, health spread | **Not done** | | A second simulation change that needs a full balance tournament and tuning rounds. It could not be completed and measured in this session, so nothing was started. |
| D2 tutorial and move list | Done | `src/tutorial.ts`, `src/moveList.ts`, `src/main.ts` | Six lessons; the pause menu lists the fighter's moves with the player's bindings. |
| D3 story | Done | `src/difficulty.ts`, `src/storyProgress.ts`, `src/main.ts` | Opens at skill 2 (3 before the retune), chapter-end rules by default, a bonus recruit with every third new clear (never on load, so fighters added to an already cleared route still have to be earned). The save stays version 3. Decision 8.4 (remap the whole curve) is still open: see section 5. |
| D4 Tickets | Partly | `src/hub/config.ts`, `src/hub/report.ts`, `src/hub/link.ts` | The client now sends the one event the server pays for and no longer sends the call it refuses. Scaling by difficulty and a first-clear bonus need server rules that do not exist: see section 4. |

## 2. The CPU change (Phase C)

`SIM_VERSION` `a4c7ddde49ec5a64` → `0caf6cd9cf7c1c5c`. `CPU_SKILL_VERSION` 3 → 4. Golden
state hashes regenerated. The CPU memory has new fields, so every state hash changed.

What the CPU does differently:

- **Projectiles.** It knows when a shot will arrive, from the shot in flight or from the cast
  it saw winding up, guards it in place with a crouching block for the frames it can connect,
  and walks or dashes in between shots. From skill 4 it jumps a straight shot when the timing
  allows; from skill 7 it answers one with a ready Team Special. A cast inside reach is hit.
  It does not start a cast of its own while a shot is on its way, and it zones only with a
  life lead against a rival who is not out-shooting it.
- **Retreat limit.** With nothing incoming it backs away for at most 30 frames, then has to
  step back in for 45.
- **Repeated moves.** Guards are remembered. A move guarded twice within three seconds is
  punished with the strongest button that reaches before its owner recovers; a punish that
  cannot reach is not thrown.
- **Getting up.** Guard is held through the end of hit stun and knockdown.
- **Range.** Recognising a move still takes the full reaction time (28, 18, 12, 8 frames), but
  range is judged from a sighting at most six frames old, with a walking rival extrapolated.
  This is the largest single cause of the mash and sweep rows moving, and the one most worth a
  human opinion: it makes every difficulty harder to walk up to.
- **Reads.** A rival walking in is stop-hit with a medium, or guarded in place once it is too
  late to swing. A crouching rival is jabbed low. A crouching low-poke habit is jumped and
  dived on.

New published tuning per skill (Easy, Normal, Hard, Expert): `wake` 0.30 / 0.60 / 0.85 / 0.97,
`shot` 0.45 / 0.75 / 0.92 / 0.99, `read` 0.15 / 0.60 / 0.85 / 0.97, `repeat` 0.20 / 0.60 / 0.90 / 0.98.

### Exploit bots

The audit's scripts were not kept, so the bots were rebuilt from the plan's description. Two
details had to be chosen: the mash bot walks until its light can reach before it starts
pressing (a bot that swings from across the screen never arrives), and the sweep bot sweeps
when the rival is inside sweep range. A 90-second cap is decided on remaining health.

Bot win rate on the fixed sample in `tests/cpu-exploits.test.ts` (12 fighters x 4 rivals,
48 matches per cell):

| Bot | | Easy | Normal | Hard | Expert |
| --- | --- | ---: | ---: | ---: | ---: |
| Ranged | plan's audit | 18% | 52% | 90% | 88% |
| | before | 17% | 50% | 90% | 83% |
| | after | 0% | 0% | 0% | 0% |
| | band | 70% | 45% | 25% | 10% |
| Mash | plan's audit | 89% | 93% | 94% | 73% |
| | before | 85% | 94% | 83% | 65% |
| | after | 71% | 40% | 10% | 2% |
| | band | 90% | 60% | 30% | 10% |
| Sweep | plan's audit | 100% | 99% | 93% | 10% |
| | before | 88% | 92% | 83% | 29% |
| | after | 90% | 15% | 0% | 0% |
| | band | 95% | 50% | 20% | 10% |

A larger sample of 40 fighters x 6 rivals (240 per cell) gave ranged 0 / 0 / 0 / 0, mash
78 / 37 / 10 / 3 and sweep 79 / 8 / 0 / 0, and a second sample with a different seed
(180 per cell) gave mash 79 / 42 / 9 / 3 and sweep 83 / 9 / 0 / 0.

Read this with care:

- The ranged row is 0% everywhere because a bot that stands still and casts loses to anyone who
  walks in and hits it. Easy does that by walking through the shots. It says the retreat is
  gone; it does not say Easy is hard.
- Bots are not people. A player who mixes these patterns is not measured here.
- CPU against CPU, the skill ladder got steeper: Normal beats Easy 85% of the time (78% before),
  Hard beats Normal 85% (67%), Expert beats Hard 72% (68%), on 80 mirrored matches each.

### Balance tournament

The plan's check is "fighters outside 35-65% no worse than 12 at Normal and 7 at Hard". Those
counts come from a 33,472-bout panel with its own harness
(`docs/balance/I-ROLE-REACH-FINAL17-20261105.md`), which was not rebuilt. What was run instead
is the standard tournament, on the same schedule, on the commit before the CPU change
(`430df754`) and after it (`5f842ad9` onwards):
`npm run balance -- --samples 40 --seed 20261105` (254 fighters, 9,347 pairs, both seats,
18,694 bouts per skill, at least 116 bouts per fighter).

| | Normal, before | Normal, after | Hard, before | Hard, after |
| --- | ---: | ---: | ---: | ---: |
| Fighters outside 35-65% (of 254) | 7 | 6 | 3 | 10 |
| Raw draws | 7 | 74 | 9 | 169 |
| Bouts at the frame cap | 0 | 0 | 6 | 0 |
| Mean bout | 28.0 s | 27.3 s | 32.5 s | 31.7 s |
| Brawler | 45.9% | 48.2% | 47.1% | 50.0% |
| Counter | 51.3% | 53.1% | 49.8% | 53.9% |
| Footwork | 53.7% | 47.0% | 51.4% | 48.6% |
| Hover | 48.3% | 53.1% | 46.2% | 50.7% |
| Paired | 42.8% | 50.4% | 49.1% | 48.6% |
| Pressure | 46.8% | 44.6% | 47.2% | 46.0% |
| Weapon | 49.4% | 57.6% | 47.6% | 63.9% |
| Zoning | 48.9% | 56.0% | 52.3% | 49.0% |

Outside the band after the change: at Normal `lifeisameme` 27%, `fplgremlin` 33%, `drzmoody`
34%, `nate` 35% (just under), `vamp` 65% (just over), `xalt` 66%; at Hard `sprotolg` and
`saburdo` 35% (just under), `micsash`, `wifebeater`, `seph0x` and `blorfo` 66%, `sproto1815` and
`mox` 68%, `sproto2616` 72%, `michael` 76%.

What this says:

- Normal is level with before (6 against 7). Hard is worse (10 against 3). Against the plan's
  own thresholds, taken on a different panel, Normal passes (6 against 12) and Hard does not
  (10 against 7).
- **Weapon fighters are now too strong against the CPU, most of all at Hard (63.9%).** The CPU
  now judges range accurately and punishes with the longest button that reaches, and Weapon
  kits have 175 px heavies. The old CPU hid that reach by misjudging distance. This is a kit
  balance question (a lever for D1 or a calibration pass), not something to hide in the
  controller. No kit numbers were changed here.
- Double K.O.s rose from about 0.05% to 0.4% at Normal and 0.9% at Hard, because both sides
  attack more.
- An 8-sample run of the same tournament (4,026 bouts per skill) was also taken before and
  after. At 16 bouts per fighter the per-fighter counts are noise (54 and 42 outside before,
  62 and 63 after); it showed the same Weapon shift and is not otherwise used.

The balance gate in `GAMEPLAY-CALIBRATION-DECISIONS-20261105.md` and the story measurements
were taken with the old CPU. They should be re-measured on their own panels before anyone
tunes against them.

## 3. Checks

Run on the final code of this branch, on a machine shared with other work (load average
around 30 on 4 cores, which is why the timings are long):

| Check | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm run build` | Pass |
| `npm run test:fast` | Pass: vitest 28 files, 294 tests; `scripts/run-all.mjs --fast` 69 of 69 |
| Slow audits after the sim change | `game-qa.mjs`, `throw-smoke.mjs` and `sheet-render-qa.mjs` pass (the first two took 55 minutes here). `sprite-scale-qa.mjs` did not finish inside a 30-minute limit and was not re-run; it reads art, not the simulation. So `npm run test:all` was not completed as one command. |
| `node scripts/build-sim-bundle.mjs --check` | Pass (`a23b4cb178899af9` after the retune in section 0) |

Two earlier full runs under that load failed for reasons that were not the code: one ended with
a vitest worker RPC timeout after every test had passed (the exploit test now yields between
matches), and one had three unrelated tests hit vitest's 5-second timeout. One was a real
failure: `story-smoke.mjs` caught the first version of the bonus recruit unlocking fighters on
load, which is fixed (section 1, D3).

Seen in headless Chromium through the dev server, in screenshots: the menu's Rules, Training
and Tutorial entries, the HUD, the K.O. banner, the result overlay, the tutorial card and
the pause move list. Not seen: anything in motion, anything on a controller, a hub visit.

## 4. What the hub has to change

Checked against `metaverse-hub` at `f02208d` (`server/modules/src/schema.ts`, migration
`0031_story_boss_tickets`, and `docs/plans/2026-11-09-gameplay-improvement-plan.md` section 7.1).

What the client does now:

- It no longer calls `tickets.earn` with reason `fighter_win`. The server's ceiling for it is
  0, so every call was refused with `amount_over_rule`.
- A story round won against one of the ten bosses the server lists (`sproto3215`, `sproto2616`,
  `sproto3152`, `rivet`, `sproto865`, `sproto943`, `nick`, `guest07`, `vela`, `vaudream`)
  reports `fighter.boss_defeated` with `{ boss, world, stage, fighter, difficulty, skill,
  firstClear }` and a key that is stable per win. The server pays 20 Tickets once per boss per
  player per UTC day; the toast shows the change in the Ticket balance (section 0).
- The Tidebreaker Belt event is unchanged: `fighter.story_level_complete` with `{ world: 1 }`
  after defeating Halloween 2008.

What the hub has to do:

1. **Rebuild the simulation bundle** from this branch once it is merged:
   `node scripts/build-sim-bundle.mjs --out <hub>/server/modules/vendor/sproto-sim.js`, update
   `sproto-sim.pin.json`, and deploy the hub close to the game release. Until then online duels
   between a new client and the hub fail with `sim_mismatch`. The new fingerprint is
   `a23b4cb178899af9` (after the retune in section 0) and stays that as long as nothing the bundle
   reaches changes before the merge: `src/sim`, `src/core.ts`, `src/net/matchLog.ts` and
   `src/net/serverEntry.ts`. `node scripts/build-sim-bundle.mjs --check` confirms it.
2. **Decide the difficulty scale** (plan D4: 10 / 20 / 30 / 40 Tickets by difficulty, plus a
   first-clear bonus per story encounter). No server rule pays an ordinary CPU win or reads
   `difficulty`, so today a Fighter player can earn at most 200 Tickets a day, all from the ten
   bosses, and nothing from CPU sparring. A rule keyed on the `difficulty` and `firstClear`
   fields the boss event already carries needs no client change. Paying non-boss wins needs a
   new event and a client change to send it. These reports come from the client, so the
   amounts should stay small or wait for server-side verification.
3. **Release the Tidebreaker Belt.** The grant is still held (`grant_hold`), so the Belt event
   lights nothing (hub plan item B3).
4. **Wager eligibility.** `not_eligible` asks for three `fighter_win` earns, which can no
   longer happen. The wager flag is off, so nothing breaks today, but the rule has to count
   boss events or be removed before `sproto_duel_wager` is switched on.
5. Done 2026-11-12: hub SDK 0.7.1 returns `tickets` from `reportEvent` (`EventResult.tickets`),
   and `src/hub/link.ts` uses it, keeping the before/after balance difference as a fallback.
6. The ten boss ids still match the story (`STORY_BOSSES` in `src/hub/config.ts` is tested
   against the route). Halloween 2008 (`zephyr`), the Belt rival, is not one of them and pays no
   Tickets.

## 5. Decisions still open

- **8.1 distinct archetypes (D1).** Not started. It is its own simulation change.
- **8.2 Best of 3 as the default.** Left on Classic until people have played the menu option.
- **8.3 audio sourcing.** Synthesised effects and music shipped. Recorded audio is still a
  sourcing decision.
- **8.4 story difficulty.** D3's "start at 3" is in. The calibration measurements in the
  2026-11-05 documents were taken with the old CPU and the old curve and no longer describe
  the game. The route was not re-measured.

## 6. What a QA pass should look at first

1. **Play the CPU at each difficulty.** The numbers say it no longer runs from projectiles and
   that it punishes repeated sweeps. Whether Normal now feels fair, and whether Easy is still
   easy for a new player, is not something a bot can answer. Try walking up and attacking: the
   stop-hit is new at every level.
2. **Listen.** Every sound is synthesised and has only been checked for "plays without error".
   Balance between effects and music, harshness of the heavy hit and K.O., and whether the
   loops get tiring all need ears. Volumes are in Settings.
3. **Story, first three fights and one chapter end.** The opener is skill 2 with the new CPU.
   The last standard rival of each chapter now has a 60-second clock and a modifier
   (specials only and sudden death are the two most likely to confuse).
4. **The tutorial end to end** on keyboard and on a controller. Lesson 5 asks the player to be
   hit by a sweep on purpose.
5. **K.O. presentation.** Slow motion, shake and the banner have been seen in screenshots, not
   in motion on real hardware. The plan's F10 stutter was not investigated.
6. **A hub visit.** Nothing here ran against a hub. The boss event and its toast are covered by
   unit tests with a fake SDK only.
