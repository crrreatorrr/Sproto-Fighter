# Gameplay improvement plan (2026-11-09 audit)

## 1. Status

Implemented on 2026-11-11 except D1; see
[GAMEPLAY-IMPROVEMENT-IMPLEMENTATION-20261111.md](GAMEPLAY-IMPROVEMENT-IMPLEMENTATION-20261111.md)
for what shipped, what was measured and what the hub still has to change. The text
below is the plan as written; its line numbers refer to `d1a1d9c6`.

- Audited 2026-11-09 at `1d47c2c9`. Re-read 2026-11-11 at `d1a1d9c6`: two commits landed in
  between (movement-pose alignment, and the Tidebreaker Belt story event after defeating Halloween
  2008). Neither touches `src/sim/cpu.ts`, `src/sim/balance.ts`, `src/render.ts` HUD code or audio,
  so the findings stand. Line numbers below are from `d1a1d9c6`.
- Relation to the 2026-11-05 documents: `GAMEPLAY-PLAN-20261105.md` and
  `GAMEPLAY-IMPLEMENTATION-20261105.md` describe the six-phase mechanics stack, which is merged.
  `GAMEPLAY-CALIBRATION-DECISIONS-20261105.md` leaves the balance gate and the story-difficulty
  mapping open. This plan does not redo that work. It adds what those documents do not cover:
  sound, CPU exploits found with adversarial bots, the hidden rules, presentation, and onboarding.
  Section 8 lists where it touches the open calibration decisions.

## 2. How this was audited and how far to trust it

| Evidence | What was done | Limits |
| --- | --- | --- |
| Browser | Dev server, headless Chromium, keyboard input: member select, partner select, countdown, a full Normal CPU fight to KO, the result overlay, `?training`, the story map. No console errors. | Software rendering in dev mode (about 32 fps, one 1.27 s stall). Frame rate is unverified. |
| Tests | `npx vitest run`: 241 of 241 passed at `1d47c2c9`. | The standalone `scripts/` checks and the three slow roster audits were not run. |
| Headless bots | A bundle of `src/core.ts` driven in Node: three exploit bots against the CPU, a kit census, a random combo search. | Bots are not people. The combo search is random, so its maximum is a lower bound. Not re-run at `d1a1d9c6`. |
| Reading | Balance and calibration docs, online play, hub rewards, story bosses, gamepad. | Not exercised. |

The scripts were not kept. To rebuild the exploit bots: bundle `src/core.ts`, create a CPU match,
and feed player one a fixed policy each frame. "Ranged" stands still and presses the projectile
button whenever it can act. "Mash" walks forward and repeats light, light, medium, finisher.
"Sweep" crouches and repeats the sweep. Each was run for 40 randomly chosen fighters against 6
randomly chosen opponents at each of the four difficulties, CPU as player two via
`cpuInput(s, 1, skill)`.

## 3. What already works and should be kept

- An 8-frame input buffer and throw tech in a 7-frame window.
- Hit stop of 4, 6, 9 and 12 frames by strength (`src/sim/combat.ts:213`).
- Chip damage of 12% that cannot KO.
- Sensible frame data: lights about -5 on block, heavies about -12.
- No infinite found: the random search reached about 370 damage without meter and 490 with a full
  meter, out of 1000 health.
- Rollback online play with the hub running the same simulation.

## 4. Findings

### F1. The game is effectively silent (High)

The only audio in the client is one voice clip (`src/characterVoice.ts:9-11`). There are no hit,
block, whiff, KO or menu sounds and no music. For a fighting game this is the largest single gap in
feel.

### F2. CPU difficulty is inverted against ranged pressure and loses to mashing (High, measured)

Bot win rate against each difficulty:

| Bot | Easy (skill 1) | Normal (4) | Hard (7) | Expert (10) |
| --- | --- | --- | --- | --- |
| Stand still, mash ranged | 18% | 52% | 90% | 88% |
| Walk in, light-light-medium-finisher | 89% | 93% | 94% | 73% |
| Crouch and sweep | 100% | 99% | 93% | 10% |

Cause of the first row: when the CPU has seen a shot and its guard roll succeeds, it holds away
(`src/sim/cpu.ts:135`). The guard chance rises with skill (0.25, 0.50, 0.70, 0.85 at lines 15-18),
so a better CPU retreats from every projectile and never closes the distance. In one traced match
the Hard CPU did not attack once. The story finale uses skill 10, so it has the same weakness. The
second row shows that pressure strings are not blocked and punished reliably below Expert. The
third shows that only Expert punishes a blocked sweep.

### F3. 254 fighters share 36 move kits (High, measured at `1d47c2c9`)

`src/sim/balance.ts:14-24` defines eight archetype templates and every fighter inherits one, with a
small identity delta (`IdentityDelta`, line 45: light range, heavy range, heavy damage, heavy
startup). The census found 36 distinct kits. All 85 Footwork fighters have identical moves, walk
speed and jump. 241 of 254 have no special power. Health is 1000 for everyone. What differs between
most picks is projectile style, partner and art.

### F4. The best rules are hidden behind URL flags (Medium, observed)

Best of three, the 60-second clock, counter-hits, the defense meter and just-defend need
`?matchDepth` (`src/main.ts:70-71`). The hitbox overlay, input and advantage readouts and route
recording need `?training` (`src/main.ts:75`). A player who opens the game normally gets one
untimed round and never sees them.

### F5. The balance gate still fails (Medium, from docs)

`docs/balance/I-ROLE-REACH-FINAL17-20261105.md` records 12 fighters at Normal and 7 at Hard outside
the 35-65% band: mox 74%, crapto 72%, sisma 27%, aktree 29%. Brawler averages 42.6% at Normal. The
calibration document states this openly and asks for a decision.

### F6. Story is long, uniform and trivially easy early (Medium)

247 single-round fights; only 2 of 254 fighters are playable at the start. Per
`GAMEPLAY-CALIBRATION-DECISIONS-20261105.md`, the reference bot loses the first encounter once in
256 runs and the finale CPU wins about 51%.

### F7. Rewards ignore difficulty, and may not be paid at all (Medium)

`planFighterWin` (`src/hub/report.ts:39-54`) sends a flat 20 Tickets (`TICKETS_PER_WIN`,
`src/hub/config.ts:9`) for any unassisted CPU win; the sweep bot beat Easy in about 14 s. The hub
audit of 2026-11-09 found that the server had set the `fighter_win` rule's maximum to 0, so the
call the client sends earns nothing, and that the server's ten 20-Ticket boss rules were never
triggered by the client. The hub has changed since; confirm against the hub's current schema before
acting.

### F8. HUD and KO presentation are weak (Medium, observed)

On a 1280x720 canvas: the health number is 10 px (`src/render.ts:87`), the meter label 9 px (line
97), the round label 9 px (line 231), the block hint 9 px (line 264). "K.O." is 40 px at y 220
(line 272), on top of the notice box at y 176-208 (lines 256-258). A win reads "You found your
flow." and a loss "Run it back." (`src/main.ts:884`). There is no screen shake, slow motion on the
final hit, or particles.

### F9. No tutorial or move list (Medium, observed)

Teaching is one notice ("LIGHT → MEDIUM → FINISHER") and a controls strip below the canvas. Dash
cancel, jump cancel, throw tech and quick-rise are never taught in play.

### F10. Possible stutter (Low, unverified)

One 1.27 s stall mid-fight in headless dev mode. Check on real hardware with a release build before
spending time on it.

## 5. The plan

Effort: S is under a day, M a few days, L a week or more. "Sim change" means anything under
`src/sim`; see section 6 for what that triggers.

### Phase A: quick wins, no sim change

**A1. Clear result text.** `src/main.ts:884`: headline "YOU WIN" / "YOU LOSE" / "DOUBLE K.O.",
with the current flavour lines as the sub-line. Effort S.

**A2. KO banner.** `src/render.ts:272`: draw "K.O." at 96 px, centred at y 330, with a dark band
behind it, and suppress the notice box during the outro. Effort S.

**A3. HUD sizes.** `src/render.ts`: health number 10 to 16 px, meter label 9 to 13 px, round label
9 to 14 px, block hint 9 to 13 px, combo sub-lines 9-12 to 13-14 px. Re-check that nothing overlaps
at 1280x720 and at the smallest supported canvas. Effort S.

**A4. Put the hidden modes in the menu.** In `src/selectionMenu.ts` and `src/main.ts`, add a
"Rules: Classic / Best of 3" choice for CPU and local versus (sets what `?matchDepth` sets today,
`src/main.ts:76`) and a "Training" entry that enables the `TrainingRecorder`. Keep the URL flags
working. Online stays on classic rules until the hub enables otherwise. Effort S-M.

**A5. Impact feedback in the renderer.** Screen shake on heavy and special hits (4-8 px, 6-10
frames), a 20-frame slow motion on the final hit, hit sparks sized by strength. All driven from
existing `s.effects` and `s.freeze`; render only. Effort S-M.

### Phase B: sound, no sim change

**B1. Audio module.** New `src/audio.ts` using Web Audio:

- `play(name, {volume, pan})`, `music(track)`, `setVolume({master, sfx, music})`, unlock on first
  input (browsers block autoplay), settings saved with the existing options.
- Trigger from state the renderer already reads each frame: a new entry in `s.effects` (hit, block,
  spark), a move starting (`f.move.t === 1`: whoosh by strength), `s.freeze` rising (impact),
  projectile spawn, throw start and tech, KO, round start, menu move and confirm, Team Special.
- Pan by fighter x. Never read audio state from the simulation.

| Sound set | Count | Notes |
| --- | --- | --- |
| Hits by strength | 4 | light, medium, heavy, special |
| Block, just-defend, throw, tech | 4 | |
| Whoosh by strength | 3 | |
| Projectile fire and impact | 2 | |
| KO, round start, win, lose | 4 | |
| Menu move, confirm, back | 3 | |
| Music | 2-3 loops | menu, fight, story map |

- Budget: under 1.5 MB total, compressed, loaded after first paint. Sourcing is decision 8.3.
- Tests: unit test that each effect kind maps to a sound name; a browser smoke that the context
  unlocks on input. Effort M.

### Phase C: CPU (sim change)

**C1. Stop retreating from projectiles.** Replace `src/sim/cpu.ts:135`. When a shot has been seen:

- Block in place (hold away only for the frames the shot can connect, crouching when it is low),
  then walk or dash forward in the gap before the next shot.
- From skill 4, jump over a shot when the distance and projectile speed allow it; from skill 7,
  return fire or use a special that beats projectiles when in range.
- Never hold away for more than about 30 consecutive frames without an incoming attack.

**C2. Punish repeated unsafe moves.** The CPU already tracks observations. When the same move has
been blocked twice within about three seconds, raise the punish chance for the next block to at
least 0.6 at skill 4 and 0.9 at skill 7. This addresses the sweep and mash rows.

**C3. Make the exploit bots regression tests.** Add `tests/cpu-exploits.test.ts` with the three
policies on a fixed sample of fighters and seeds. Target bands for the bot's win rate:

| Bot | Easy | Normal | Hard | Expert |
| --- | --- | --- | --- | --- |
| Ranged | at most 70% | at most 45% | at most 25% | at most 10% |
| Mash | at most 90% | at most 60% | at most 30% | at most 10% |
| Sweep | at most 95% | at most 50% | at most 20% | at most 10% |

The rows must fall as skill rises. Existing `tests/cpu-difficulty.test.ts` and
`tests/cpu-low-variety.test.ts` must still pass. Effort M. This will move the calibration numbers
in the 2026-11-05 documents, so re-run the balance tournament afterwards.

### Phase D: roster identity, story and teaching

**D1. Give each archetype one mechanical rule** (sim change, decision 8.1). Examples that need no
new poses: Brawler takes one light hit without flinching during heavy startup; Counter gets a
parry window on a held input; Hover gets an air dash; Footwork gets a faster dash cancel; Zoning
gets a second projectile angle. Spread health 900-1100 by archetype. `src/sim/balance.ts`,
`src/sim/combat.ts`. Effort L. Requires a full balance tournament.

**D2. Interactive tutorial and a pause move list** (no sim change). Six steps built on the training
recorder: move and block, chain to finisher, throw and tech, dash cancel, jump cancel and quick
rise, Team Special. The pause menu lists the current fighter's moves. `src/training.ts`,
`src/main.ts`. Effort M.

**D3. Tighten story** (no sim change). Start around skill 3 instead of 1, apply the existing
chapter-boss modifiers by default, unlock a bonus fighter every few wins so the roster opens faster.
`src/difficulty.ts`, `src/storyProgress.ts`. The save format must keep migrating. Effort M. Tied to
decision 8.4.

**D4. Scale Tickets by difficulty** (no sim change; hub contract). For example 10, 20, 30, 40 by
difficulty, with a first-clear bonus per story encounter. `src/hub/config.ts`, `src/hub/report.ts`.
Needs matching server rules. Effort S on this side.

## 6. Order and batching

1. Phase A in one or two pull requests. No sim change.
2. Phase B. No sim change.
3. Phase C as a single sim change.
4. D2, D3, D4. Then D1 as its own sim change if the owner wants it.

For every sim change:

1. `SIM_VERSION` (`src/net/simVersion.ts`) changes; regenerate it and the golden hashes the tests
   pin.
2. Run `npm run check`, `npm run test:fast`, then `npm run test:all` for the roster audits.
3. Rebuild the hub bundle: `node scripts/build-sim-bundle.mjs --out
   <hub>/server/modules/vendor/sproto-sim.js`, and open the matching metaverse-hub change. Online
   matchmaking keys on `SIM_VERSION` (`src/net/hubDuel.ts:80`), so old and new clients will not be
   matched together; deploy the hub close to the game release.
4. Re-run the balance tournament in `docs/balance/README.md` and record the result.

## 7. Hub integration

- Client behaviour today: every unassisted CPU win sends `fighter_win` for 20 Tickets; a story win
  in world 1 also sends `fighter.story_level_complete`, which is the Tidebreaker Belt trigger
  (`src/hub/report.ts:39-54`, commit `d1a1d9c6`).
- From the hub audit (verify against current hub code): the server paid 0 for `fighter_win`, had
  boss rules keyed on `fighter.boss_defeated` that this client never sends, held the Belt grant,
  showed no leaderboard for this game, and offered a 10-Ticket wager that players could not fund
  because the game earned nothing.
- Action for this repo: agree with the hub which event pays, then send exactly that. If the boss
  rules are kept, send `fighter.boss_defeated` with the encounter id on story boss wins and stop
  sending `fighter_win`.
- Caps that applied to every game at the audit: 200 Tickets per session, 1,000 per game per day,
  10 Tickets to 1 Verse.

## 8. Decisions for the owner

1. **Shared kits or distinct archetypes?** Options: keep 36 kits and present the roster honestly as
   skins of eight styles; or do D1. Recommendation: D1, after the CPU work, because it also gives
   the balance gate fewer, clearer levers.
2. **Should best-of-three with a clock be the default locally, and later online?** Recommendation:
   default for CPU and local versus once A4 has been played by people; online needs the hub.
3. **Audio scope and sourcing.** Synthesised effects cost no assets and can ship first; recorded
   effects and music need a source that fits the project's rules.
4. **Story difficulty.** The calibration document is waiting on a choice (keep the table, continue
   research, or remap). Phase C will shift those measurements, so decide after C lands.

## 9. How to verify

- Exploit bots within the bands in C3, falling as skill rises.
- Balance tournament: count of fighters outside 35-65% no worse than 12 at Normal and 7 at Hard
  after Phase C.
- Release build on real hardware: steady 60 fps through a full fight, no stalls.
- Human playtest checklist: Can a new player say who won within a second of the KO? Can they read
  their health number at arm's length? Do they find Training and Best of 3 without being told? Does
  Hard feel harder than Normal whatever they try? After the tutorial, can they perform a dash
  cancel?

## 10. Not audited

Online play against a deployed hub, a real controller, the three slow roster audits, the standalone
scripts, mobile, and art.
