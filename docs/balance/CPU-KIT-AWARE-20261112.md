# Balance tournament re-run and the kit-aware CPU (2026-11-12)

PR #54 rewrote the CPU and then retuned it, and the standard tournament was never run on the
retuned build. This records that run on `main`, the CPU change that followed from it, and the
same run on the changed build. No kit number changed. The simulation fingerprint moved from
`a23b4cb178899af9` to `84f964848ca02602`, so the hub has to rebuild its Fighter bundle.

## 1. Result

Fighters outside 35-65% of decided bouts, of 254, on the standard schedule
(`npm run balance -- --samples 40 --seed 20261105`, 9,347 pairs from both seats, 18,694 bouts
per difficulty):

| | Normal (4) | Hard (7) | Expert (10) |
| --- | ---: | ---: | ---: |
| Before PR #54 (`430df754`, from the 2026-11-11 record) | 7 | 3 | not run |
| First rewrite (`5f842ad9`, the last recorded run) | 6 | 10 | not run |
| `main` after the retune (`4c6de7fd`), first measured here | 13 | 8 | 16 |
| This change (`4e80e936`) | **6** | **3** | 6 |

Archetype averages, percent of decided bouts:

| Archetype (fighters) | Normal, main | Normal, now | Hard, last recorded | Hard, main | Hard, now | Expert, main | Expert, now |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Brawler (21) | 53.8 | 48.0 | 50.0 | 53.1 | 51.5 | 55.2 | 51.4 |
| Counter (49) | 53.2 | 50.6 | 53.9 | 51.5 | 49.3 | 54.6 | 54.5 |
| Footwork (85) | 45.1 | 48.8 | 48.6 | 47.6 | 49.6 | 44.0 | 45.9 |
| Hover (2) | 44.8 | 47.6 | 50.7 | 49.7 | 44.8 | 51.7 | 55.9 |
| Paired (20) | 50.8 | 48.3 | 48.6 | 51.7 | 49.1 | 51.4 | 52.7 |
| Pressure (31) | 49.2 | 48.5 | 46.0 | 45.8 | 49.8 | 53.4 | 49.4 |
| Weapon (8) | 53.6 | 49.8 | 63.9 | 51.6 | 48.0 | 55.6 | 53.5 |
| Zoning (38) | 54.2 | 55.3 | 49.0 | 53.9 | 52.3 | 49.6 | 50.4 |

Against the target for Hard (no more than 3 fighters outside 35-65%, no archetype outside
45-55%):

- **Fighters: met.** 3 outside, from 8 on `main` and 10 at the last recorded run.
- **Archetypes: seven of eight are between 48.0 and 52.3. Hover reads 44.8, which is 0.2 under
  the line.** Hover is two fighters and 286 bouts. Played against all 253 opponents instead of a
  sample of them (1,012 bouts) the same two fighters win 46.3%, and on a second seed of the
  standard schedule they win 50.3%. Section 3 explains why a two-fighter average moves this much.
- The Weapon bias reported after the first rewrite (63.9% at Hard) was already gone on `main`
  (51.6%) and is 48.0% now.

Other figures:

| | Normal, main | Normal, now | Hard, main | Hard, now | Expert, main | Expert, now |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fighters outside 40-60% | 37 | 36 | 35 | 30 | 54 | 42 |
| Spread of fighter win rates (standard deviation, points) | 7.2 | 6.5 | 6.9 | 6.3 | 7.9 | 6.8 |
| Raw draws | 10 | 22 | 37 | 21 | 191 | 192 |
| Bouts at the frame cap | 0 | 0 | 0 | 0 | 17 | 22 |
| Mean bout | 26.7 s | 26.5 s | 29.7 s | 29.8 s | 34.1 s | 35.3 s |

Outside the band now: at Normal `uncmasterflex` 31.4, `marfrog` 32.9, `sirdidit` 34.5 (all
Footwork), `samixsproto` 65.2, `gluttony` 69.6, `guest10` 69.6 (all Zoning); at Hard `melo`
32.7 (Weapon), `benjamin` 32.9 (Footwork), `sprotolg` 67.1 (Zoning); at Expert `sproto818` 31.7,
`sproto651` 32.1, `stonkyleg69` 33.8, `bobdobbs` 34.2 (all Footwork), `sprotomichaelsaylor` 66.4
(Zoning), `guest14` 68.0 (Counter).

A second run at Hard with a seed never used during the work (`--seed 20261112`, 9,371 pairs,
18,742 bouts) gave 2 fighters outside (`sproto102` 30.7, `pirate` 66.4) and every archetype
between 48.4 and 52.8, Hover included.

## 2. How it was measured

- The schedule, seeds, frame cap and tie-breaks are those of `scripts/balance-tournament.mjs`.
  The runs here were split across four processes by a driver that calls the repository's own
  `makeSchedule`, `matchSeeds`, `playMatch`, `resolveSeatPair` and `summarize`. On the `--fast`
  schedule at Hard its report equals the report of `node scripts/balance-tournament.mjs --fast
  --skills 7` in configuration, summary and every recorded bout.
- `main` is `4c6de7fd` (simulation `a23b4cb178899af9`, source SHA-256 in the manifest). The
  changed build is `4e80e936` (simulation `84f964848ca02602`).
- The "last recorded" and "before PR #54" columns are copied from
  [GAMEPLAY-IMPROVEMENT-IMPLEMENTATION-20261111.md](../GAMEPLAY-IMPROVEMENT-IMPLEMENTATION-20261111.md),
  section 2. They used the same command and schedule. Neither was run at Expert.
- Reports: [main](report-2026-11-12-main.md) ([JSON](report-2026-11-12-main.json.gz),
  [manifest](report-2026-11-12-main-manifest.json)), [this change](report-2026-11-12-kit-aware.md)
  ([JSON](report-2026-11-12-kit-aware.json.gz),
  [manifest](report-2026-11-12-kit-aware-manifest.json)), and the
  [second seed](report-2026-11-12-kit-aware-seed20261112.md) (summary only,
  [JSON](report-2026-11-12-kit-aware-seed20261112.json.gz)). The JSON files are gzip, as
  elsewhere in this folder; decompress before `--compare`.

## 3. How much of the fighter count is sampling

This matters for reading every count in section 1, so it comes before the causes.

Each pair is played from both seats with the same two CPU seeds. The two bouts are close to
mirror images: the same fighter wins both in 96% of pairs (95.8% to 96.6% across the six runs
here). A fighter's roughly 147 bouts are therefore about 74 independent results, and a fighter
whose true rate is exactly 50% is measured with a standard deviation of about 5.8 points. With
254 such fighters, about 3 would land outside 35-65% by chance.

Two checks agree with that:

- Splitting the pairs at random into halves and comparing each fighter's rate in the two halves
  gives a correlation of 0.15 at Hard on `main` and 0.05 now. Most of what separates one fighter
  from another in a single run does not repeat.
- Across the builds tried during this work, a fighter's Hard rate in one build barely predicted
  its rate in the next once the CPU's decisions had shifted at all (correlation 0.0 to 0.1),
  while archetype averages for the large archetypes moved by a point or two.

So a count of 3 is about as low as this schedule can show, and the difference between 3 and 5
is not evidence of anything. The spread of fighter rates (6.9 points on `main` at Hard, 6.3 now,
5.8 if there were no real differences at all) and the averages of the six archetypes with 20 or
more fighters are the steadier measures. An average over two fighters (Hover) or eight (Weapon)
is not steady: Hover read 44.1, 44.8, 52.5 and 50.3 at Hard on four runs of the last three
builds and two seeds.

Fighters named as outliers were therefore re-measured against every other fighter (506 bouts
each, Hard):

| Fighter | Standard sample | All 253 opponents |
| --- | ---: | ---: |
| `melo` (Weapon) | 32.7 | 42.1 |
| `benjamin` (Footwork) | 32.9 | 49.8 |
| `sprotolg` (Zoning) | 67.1 | 55.9 |
| `sproto1870` (Hover) | 47.1 | 48.6 |
| `vaudream` (Hover) | 42.5 | 44.0 |
| `mox` (Counter, the beam) | 55.9 | 53.4 |

## 4. What favoured particular kits, and what changed

Four behaviours in `src/sim/cpu.ts` treated every rival as a standard fighter. Each now reads
the numbers from the two kits in the match.

### 4.1 The first jab was decided by a few pixels

Two CPUs walk at each other and each jabs on the first frame its own standing jab reaches. The
fighter with the longer jab therefore struck first almost every time, and with equal reach the
one-frame-slower jab lost. Standing jabs differ by archetype: Pressure reaches 84 px, Footwork
86 px but starts in 6 frames where the rest start in 5, Zoning reaches 94 px.

On `main` at Hard, Pressure won 42.1% and Footwork 45.6% of their bouts against the other six
archetypes. On a build with only the fix of 4.2, a diagnostic that gave every archetype the same
standing jab (not kept, and not a proposal) moved Footwork from 45.7% to 50.0% and Pressure from
40.5% to 45.7% on the same pairs, so the jab explained all of Footwork's deficit and about half
of Pressure's.

The crouching jab is the same for every kit: 95 px, 5 frames. From Normal up:

- A fighter whose standing jab is shorter or slower than this rival's opens with the crouching
  jab from its longer reach on half of its decisions, when the rival is walking in on the
  ground. On the other half the rival's better standing jab still wins the race, so a long jab
  remains an advantage; it is no longer a certainty. Against a rival who keeps jumping in, the
  standing jab stays, because a crouching jab passes under a jump.
- Up close, a fighter whose standing jab is slower than both its own crouching jab and the
  rival's standing jab (Footwork against anyone but Footwork) uses the crouching jab for half of
  its jabs instead of a quarter.

Giving every CPU the long poke all the time was tried and rejected: it removed the jab race
entirely and Zoning, whose long jab is most of what its kit has in the CPU's hands, fell to
43%.

Pressure and Footwork now win 50.1% and 49.1% against the other archetypes at Hard.

### 4.2 A crouching guard stood up into high shots

The CPU guards a projectile crouching, so that it does not walk backwards. It dropped the
crouch when the shot passed its centre. A shot from an emitter higher than a crouch (87 px)
never touches a crouching fighter, so it was still overhead when the CPU stood up, and hit.
About 84 fighters have such an emitter. Shots at crouch height or below were guarded normally.

The CPU now tracks a shot until it has cleared the far side of the body, for a pair's wider
body as well, and holds its guard until then. The same hold fixes a smaller fault for slow
shots: the arrival estimate assumes the CPU keeps walking into the shot, so for a CPU standing
still it ran out a frame or two early.

### 4.3 Guard timing assumed a standard emitter

The arrival time of a cast seen winding up was computed as if every shot started about 40 px in
front of its caster and flew at its listed speed. A pair's shot starts in front of the leading
member (120 px or more ahead), so it arrived up to six frames before the guard. The mind beam
(`mox`) has no travel at all, and its listed speed of 0 made the estimate about a second late,
so it was never guarded or ducked on time. The estimate now starts from the caster's actual
emitter, and treats a beam as landing on its release frame and lasting its full duration.

### 4.4 Casting into a trade

Two CPUs often cast at the same moment. Level shots at the same height cancel; shots at
different heights pass each other and hit whoever is still in recovery. The CPU cast from the
same distance against every rival. It now does not start a cast, against a rival it has seen
cast, from a distance at which that rival's simultaneous cast would land before its own
recovers. That depends on both kits: its own cast length, the rival's startup, shot speed and
emitter position. Against a rival who has not cast, nothing changes.

Projectile damage per bout at Hard, by the caster's emitter (779 pairs, the tournament's damage
observer):

| Emitter | Fighters | Main | Now |
| --- | ---: | ---: | ---: |
| Level, above a crouch | 84 | 140 | 56 |
| Level, crouch height or lower | 133 | 91 | 45 |
| Pair, well ahead of the root | 20 | 172 | 65 |
| Arc, bounce, wave or return | 16 | 137 | 36 |
| Beam | 1 | 362 | 56 |

The groups differed by a factor of four and now differ by less than two. Projectiles are a
smaller share of all damage between two CPUs than before (about 15% to about 6%), because the
unguarded hits that made up most of it were the faults above.

### 4.5 Tuning

The long poke makes the CPU a little harder to walk up to, so the stop-hit read was lowered to
keep the difficulty where the regression bands put it: `read` 0.40 to 0.35 at Normal and 0.48
to 0.40 at Hard. Easy and Expert are unchanged. `CPU_SKILL_VERSION` is 5. The long poke uses
the part of the existing read roll that the stop-hit does not, so the CPU's random stream is
the same length as before.

## 5. What is left, and why

- **Footwork at Expert (45.9%, and four of the six Expert outliers).** Its standing jab is the
  slowest and weakest in the roster (6 frames, 34 damage). Expert punishes and stop-hits almost
  every time, which is where a slow jab costs most. This is the kit; the CPU now plays around it
  as far as the crouching jab allows.
- **Zoning at Normal (55.3%, three of the six Normal outliers).** Its 94 px jab still wins the
  race on half of the decisions, on purpose, and Normal guards fewer of its fast shots (`shot`
  0.75). This is the kit as well.
- **Hover (two fighters).** 46.3% against the whole roster at Hard. What its kit has that others
  do not is a higher jump and a long special, and the CPU rarely jumps and rarely has meter.
  Counted as in the band on the larger sample, but on the low side of it.
- **`melo` (Weapon, sword).** 42.1% against the whole roster. Its identity trades heavy damage
  for a faster heavy, and the CPU's heavies come from confirmed strings where startup hardly
  matters. A kit question.
- **`mox` (the beam).** 55.9% on the standard sample and 53.4% against the whole roster now that
  the beam is ducked, from 61.8% on `main`'s standard sample.
- **Brawler against Hover** is the most lopsided archetype pairing left (Hover wins 36% of 84
  bouts). Not investigated.

## 6. Difficulty for a player

The regression bands in `tests/cpu-exploits.test.ts` are unchanged and pass. Bot win rate,
Easy / Normal / Hard / Expert, 48 matches per cell:

| Bot | Main | Now | Band |
| --- | --- | --- | --- |
| Ranged (exploit) | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | at most 70 / 45 / 25 / 10 |
| Mash (exploit) | 85 / 46 / 23 / 2 | 85 / 50 / 17 / 2 | at most 90 / 60 / 30 / 10 |
| Sweep (exploit) | 88 / 15 / 4 / 0 | 88 / 19 / 6 / 0 | at most 95 / 50 / 20 / 10 |
| Walker | 100 / 79 / 33 / 17 | 100 / 77 / 40 / 15 | 85-100 / 60-80 / 30-50 / below Hard |
| Jumper | 88 / 42 / 35 / 4 | 88 / 46 / 29 / 4 | at least 55 / 30-50 / 15-40 / below Hard |
| Blocker | 98 / 73 / 44 / 2 | 98 / 71 / 33 / 2 | 85-100 / 60-80 / 30-50 / below Hard |

One cell is 48 matches, so a cell moves about seven points from one build to the next without
meaning anything. The blocker at Hard (33) and the walker at Normal (77) are each within three
points of an edge.

The reference bot (`npm run balance -- --fast --bot reference`, 2,032 bouts per difficulty; the
figure is the CPU's win rate): Normal 65.4% on `main`, 70.5% now; Hard 86.4%, 86.0%; Expert
99.8%, 99.8%. The reference bot plays High Sproto and whichever fighter it is paired with, walks
straight in, and guards on an 18-frame-old sighting, so it is the kind of player the long poke
is aimed at. With the shot fixes alone its numbers did not move (65.7% and 87.4%).

## 7. Story

Reference bot (reference v2, High Sproto, seed 20261105, 256 seeds, reference in the first
seat) on three encounters of the 247-encounter route. A gauntlet counts as won only if every
wave is won.

| Encounter | Skill | Reference wins, main | Reference wins, now |
| --- | ---: | ---: | ---: |
| 1, Zephyr | 2.00 | 254/256 = 99.2% | 255/256 = 99.6% |
| 124, Rektina | 5.96 | 104/256 = 40.6% | 67/256 = 26.2% |
| 247, Vela then Vaudream | 10.00 | 0/256 | 0/256 |

Skill sweeps on the changed build, 64 seeds each:

| Skill | 1 | 2 | 3 | 4 | 5 | 7 | 10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Zephyr (one bout) | 100% | 100% | 91% | 42% | 36% | 31% | 0% |
| Vela then Vaudream | | 95% | 81% | 8% | 2% | 0% | 0% |

- **The opener is in line.** The plan's target is about 85% for the reference and the first
  encounter gives 99.6% at skill 2. Skill 3 would give about 91%. Left at 2, which PR #54's QA
  chose.
- **The finale is not in line with the plan's figure** (the reference winning about 35% of the
  time), and was not on `main` either. No setting of the mapping can fix that with this
  instrument: since the CPU rewrite the reference bot wins two bouts in a row 81% of the time at
  skill 3 and 8% at skill 4, so a finale it won 35% of the time would sit below Normal. The
  sensible-play bots say the finale is steep in the same direction but not by how much: at
  Expert they win 2% to 15% of single bouts.
- **`src/difficulty.ts` is unchanged.** `GAMEPLAY-CALIBRATION-DECISIONS-20261105.md` asks for
  the published 2-to-10 table to be kept until the reference bot has been checked against people,
  and says a remap needs the owner's decision; `tests/cpu-difficulty.test.ts` pins both ends. The
  decision that is now due is whether the finale stays at Expert. For reference, the numbers a
  lower ceiling would give are in the six-bot table: at Hard the walker, jumper and blocker win
  40%, 29% and 33% of single bouts.
- The middle of the route is harder for the reference bot than on `main` (26% from 41% at
  encounter 124). Rektina is a Footwork fighter, High Sproto out-reaches and out-speeds her
  standing jab, and the reference bot walks into the crouching jab she now leads with.

These are regular bouts. The story's boss forms and chapter-end rules are not simulated. The rows
above are in [story-2026-11-12-kit-aware.json](story-2026-11-12-kit-aware.json).

## 8. Checks and reproduction

`npm run check`, `npm run test:fast`, `npm run build` and `node scripts/build-sim-bundle.mjs
--check` pass on `4e80e936`; the golden state hashes were regenerated once for it.
`tests/cpu-exploits.test.ts`, `tests/cpu-difficulty.test.ts` and `tests/cpu-low-variety.test.ts`
pass without edits.

```sh
npm run balance -- --samples 40 --seed 20261105 --skills 4,7,10 --out /tmp/kit-aware
npm run balance -- --samples 40 --seed 20261112 --skills 7 --out /tmp/kit-aware-second-seed
npm run balance -- --fast --bot reference --skills 4,7,10 --out /tmp/kit-aware-reference
CPU_EXPLOIT_TABLE=1 npx vitest run tests/cpu-exploits.test.ts
```

One process takes about 40 minutes per difficulty for the full schedule on this machine.

Not done: a human has not played the changed CPU; the 33,472-bout calibration panel of
2026-11-05 was not rebuilt; Easy was not run through the tournament (the jab and casting
changes do not apply below Normal, the guard hold does).

## 9. Story mapping after the owner's decision

The owner decided the finale must be very difficult but beatable, with a firmer middle and the
chapter bosses as clear spikes, so the decision section 7 left open is now made: the finale no
longer runs at Expert. No CPU or kit number changed, so the simulation fingerprint and the hub
bundle are unaffected. `src/difficulty.ts` now has three parts:

- **Route** (every encounter that is not a boss): skill 2 at the opener (unchanged), the existing
  smoothing inside each chapter, then progress t shaped as 1 - (1 - t)^5 (`STORY_ROUTE_CURVE`) up
  to `STORY_ROUTE_END` 3.83. It leaves the opener gently and spends its second half near the top:
  encounter 37 3.00, 124 3.77, 233 3.83. Largest step between neighbouring route encounters 0.044.
- **Boss step:** `STORY_BOSS_STEP` 0.12 on each chapter's closing encounter and every gauntlet
  (`storyBossEncounter`: encounters 36, 72, 108, 144, 181, 217, 245, 246, 247). It replaces the
  old +1 on gauntlets and the last fifteen encounters.
- **Per-boss calibration:** `STORY_BOSS_OFFSETS`, keyed by encounter id and added on top. At one
  skill the reference bot's win rate differs by about 30 points from one rival to the next, so one
  curve cannot make every boss a spike; each offset puts its boss at roughly 20-35% for the
  reference bot and the finale at 10-18%.

With help accepted every encounter is one skill lower (the finale 2.95).

**Why the bosses' skills are not ordered like their difficulty.** Against the reference bot a
single bout loses most of its winnability between skill 3.5 and 4, then flattens at about 35-40%
until skill 5-6, and falls again towards 7-8. A two-wave gauntlet is much harder than a single bout
at the same skill. Several CPU behaviours switch on at exactly skill 4, so a gauntlet at 3.99 is
about twice as winnable as at 4.00 (Sproto865 then Sproto943: 50.0% and 24.2%; Nick then Guest07:
38.3% and 20.3%); the skill is rounded to six decimals so a calibrated 4 is never a hair under.
So the single-bout chapter bosses sit at skills 4.5-7 and the two earlier gauntlets at 4.0, all
above the finale's 3.95, yet every one of them is measured easier than the finale. The finale stays
at 3.95 because 4.0 drops it to about 8%.

Calibration sweeps (reference wins, 64 seeds each unless marked):

- Chapter 1 boss Sproto837: 3.8 76.6%, 3.9 68.8%, 4.0 45.3%, 4.2-5.0 40.6%, 5.5 39.1%, 6 29.7%,
  7 26.6%, 8 4.7%.
- Chapter 2 boss Reverend: 3.8 85.9%, 3.9 76.6%, 4.0 51.6%, 4.2 45.3%, 4.5 50.0%, 5 45.3%,
  5.5 39.1%, 6 32.8%, 7 28.1%, 8 4.7%.
- Chapter 3 boss Sproto3215: 3.8 79.7%, 4.0 45.3%, 4.2 37.5%, 4.5 54.7%, 5 35.9%, 5.5 54.7%,
  6 43.8%, 7 23.4%, 8 6.3%.
- Chapter 4 boss Zippy: 3.8 60.9%, 3.9 67.2%, 4.0 42.2%, 4.2 31.3%, 4.5 43.8%, 5 29.7%, 6 20.3%.
- Chapter 5 boss Sproto2616: 3.8 34.4%, 3.9 31.3%, 4.0 39.1%, 4.2 42.2%, 4.5 34.4%, 5 25.0%, 6 28.1%.
- Chapter 6 boss Sproto3152: 3.8 37.5%, 3.9 35.9%, 4.0 32.8%, 4.2 32.8%, 4.5 31.3%, 5 20.3%, 6 10.9%.
- Chapter 7 gauntlet: 3.6 75.0%, 3.7 70.3%, 3.8 62.5%, 3.9 65.6%, 3.95 56.3%, 4.0 20.3%,
  4.1 14.1%, 4.25 14.1%, 4.5 26.6%; 128 seeds: 3.98 49.2%, 3.99 50.0%, 4.0 24.2%, 4.02 24.2%.
- Chapter 8 gauntlet: 3.6 62.5%, 3.7 56.3%, 3.8 57.8%, 3.9 40.6%, 3.95 39.1%, 4.0 14.1%;
  128 seeds: 3.97 39.1%, 3.98 38.3%, 3.99 38.3%, 4.0 20.3%, 4.05 21.1%, 4.5 18.8%.
- Finale: 3.0 81.3%, 3.2 62.5%, 3.4 50.0%, 3.5 34.4%, 3.6 31.3%, 3.7 25.0%, 3.8 20.3%,
  3.85 18.8%, 3.9 21.9%, 3.95 15.6%, 4.0 7.8%, 4.1 7.8%, 4.25 9.4%; 128 seeds: 3.99 11.7%.
- Route: Rektina (124) 3.0 92.2%, 3.25 95.3%, 3.5 92.2%, 3.75 84.4%, 4.0 51.6%; Gryph (233)
  3.75 65.6%, 4.0 39.1%, 4.25 34.4%, 4.5 39.1%.

Reference bot as in section 7 (reference v2, High Sproto, seed 20261105, reference in the first
seat, the same per-encounter seed streams) at the mapped skills, 128 seeds each:

| Encounter | Kind | Skill | Reference wins |
| --- | --- | ---: | ---: |
| 1, Zephyr | opener | 2.00 | 255/256 = 99.6% (section 7; skill unchanged) |
| 36, Sproto837 | chapter 1 boss | 6.00 | 35/128 = 27.3% |
| 72, Reverend | chapter 2 boss | 6.50 | 34/128 = 26.6% |
| 108, Sproto3215 | chapter 3 boss | 7.00 | 30/128 = 23.4% |
| 124, Rektina | route | 3.77 | 99/128 = 77.3% |
| 143, Sprotomichaelsaylor | route, before a boss | 3.81 | 41/128 = 32.0% |
| 144, Zippy | chapter 4 boss | 5.00 | 33/128 = 25.8% |
| 181, Sproto2616 | chapter 5 boss | 5.00 | 38/128 = 29.7% |
| 216, Bgbadger | route, before a boss | 3.83 | 44/128 = 34.4% |
| 217, Sproto3152 | chapter 6 boss | 4.50 | 40/128 = 31.3% |
| 233, Gryph | route | 3.83 | 78/128 = 60.9% |
| 245, Sproto865 then Sproto943 | chapter 7 gauntlet | 4.00 | 31/128 = 24.2% |
| 246, Nick then Guest07 | chapter 8 gauntlet | 4.00 | 26/128 = 20.3% |
| 247, Vela then Vaudream | finale | 3.95 | 17/128 = 13.3% |

- **Met:** the opener stays clearly winnable; encounter 124 is in the asked 70-80%; every chapter
  boss and gauntlet is between 20.3% and 31.3%; the finale is 13.3%, the hardest point measured.
  With the route running 60-95% around them in the middle of the route (Rektina, Gryph and the
  section 7 sweeps), the bosses are clear spikes there.
- **Close calls:** two route rivals are themselves hard. Sprotomichaelsaylor (143, a Zoning outlier
  in section 1) reads 32.0% before Zippy's 25.8%, and Bgbadger (216) 34.4% before Sproto3152's 31.3%.
  The bosses are below them, but by less than the sampling error. The Chapter 8 gauntlet (20.3%) is
  above the finale (13.3%) by about one sampling error; the next skill down that differs, 3.99,
  reads 38.3%.
- **Not met:** encounter 233 reads 60.9%, above the 45-55% aimed for. Ending the route at 3.9
  instead of 3.83 (curve exponent 3.9, which keeps encounter 124 at 3.77 and 77.3%) gave 62.5%, so
  it was left at 3.83. Gryph moves from about 61% to 39% across 3.9-4.0, where route rivals would
  start to rival the bosses.
- The usual limits apply: the reference bot is not a validated person, these are regular bouts
  without boss forms, 128 seeds give roughly ±8 points, and the offsets are fitted to this
  instrument, so they need recalibrating whenever the CPU, the kits or the route change. The test
  suites were not run for this change (owner's instruction for this round);
  `tests/cpu-difficulty.test.ts` was edited to pin the opener (2), the finale (3.95, assisted 2.95),
  encounter 124 between 3.7 and 3.8, one offset for each of the nine bosses and nothing else, the
  bosses' calibrated skills, every boss more than 0.05 above the route encounter before it, and the
  route rising in steps below 0.05 and staying below the finale.
