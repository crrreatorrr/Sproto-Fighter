# Gameplay mechanics plan (2026-11-05)

This plan improves speed, fairness, difficulty and depth in Sproto Arena by changing only the
combat simulation (`src/sim/`), the CPU and match rules. **No artwork or animation file changes.**

That constraint is workable because the renderer already picks every pose from a move's phase
proportions (`src/poseAtlas.ts`: windup while `t < startup`, contact while active, recovery after).
Changing startup, active or recovery frames retimes the existing drawings automatically. Hitboxes
are pure numbers in the sim and never read pixels, so they can change freely too.

## 1. Where the game is today (measured)

All numbers come from the current `main` (365ccff). A headless prototype ran 20,320 CPU-vs-CPU
matches: every playable fighter against 40 sampled opponents, from both sides, using the real
`step` and `cpuInput`.

| Finding | Evidence | Why it matters |
| --- | --- | --- |
| **Balance is extremely uneven** | Decided-match win rates are bimodal: 10th percentile 2%, median 77%, 90th percentile 96%. gpm and sproto865 win 90%. Sir Sproto, Jessica, Anni and sproto1093 (GodsSon) win 1–3%. | "Any character is fair" is far from true. Weapon fighters sit near the bottom. |
| **Kit numbers drift without a budget** | Heavy damage 76–144, light range 74–112, projectile damage 38–88, projectile startup 10–26 frames, Team Special range 270–850, Team Special total damage 210–444. Many intake kits cycle values by list position (84/86/88/90 light range, heavy damage climbing 94→107). | Strength depends on where a fighter was added, not on a design. |
| **Ranged damage decides matches** | Win rate correlates with projectile damage (r = 0.56) and Team Special range (r = 0.36). Heavy damage barely matters (r = −0.01). | Zoning beats everything; melee identity has no payoff. |
| **55% of CPU matches are draws** | Identical bots trade symmetrically and finish with equal HP. | The bot is too mechanical to test balance or provide a challenge. |
| **No difficulty curve** | Story encounter 1 and encounter 250 use the same `cpuInput`. It acts every other frame, guards on a fixed 65/120-frame cycle and never anti-airs, punishes or breaks throws. | Story never gets harder, and an experienced player learns the loop. |
| **Movement is uniform** | 253 of 254 fighters walk at 5.06 and jump at 15.48. Only Morelight (vela) differs, at 4.05. | Every role plays the same in neutral. |
| **Defense is binary** | Blockstun is a flat 15 frames for every move. Blocking costs nothing (no chip, no guard meter). Throws do 115 (the biggest single hit), start in 6 frames and cannot be broken. | Turtling and throw loops are both strong with no counterplay. |
| **Hit detection is one-dimensional** | Melee checks only forward distance from the body root plus a fixed vertical band (`|dy| < 85`). Crouching only avoids air attacks and high shots. Projectiles use one fixed radius and don't clash. | Whiffs can't be punished by reach, and crouch and jump rarely change what connects. |
| **Matches are one round with no clock** | CPU matches end at a median of 915 frames (15 s). | No comeback arc and no pacing. |

The prototype runner is not checked in yet. Phase 0 turns it into a seedable checked-in script.

## 2. Goals and success measures

1. **Speed**: faster, more fluid neutral and offense. Target: a human-vs-Normal-CPU round lasts
   30–45 s, with more decisions per second and less waiting in recovery.
2. **Fair at any pick**: in free fights every fighter is viable. Target: in the balance tournament
   at Hard CPU, every fighter wins 40–60% of decided matches, draws are under 5%, and no matchup
   exceeds 70/30.
3. **Story difficulty rises steadily**: Target: CPU win rate against a fixed reference player bot
   rises smoothly from about 15% (encounter 1) to about 65% (finale), with no jump over 10 points
   between consecutive encounters except at marked bosses.
4. **More fun**: readable risk and reward (whiff punishes, counter-hits, throw breaks, comebacks)
   using only existing poses.

## 3. Hard rules for every phase

- **No art or animation edits.** Don't touch `public/fighters/**`, `art/**` sources, atlas
  registrations or clip lengths. Keep every move's startup ≥ 3, active ≥ 2 and recovery ≥ 6 frames,
  so each existing phase stays visible for at least one tick.
- **The sim stays deterministic.** No `Math.random`, no clock. Any randomness the CPU needs comes
  from a seeded generator stored in `CombatState`. Only `+ − * /` and `Math.sqrt` (see
  `src/sim/step.ts`).
- **Every sim change is an online-compatibility change.** Regenerate `src/net/simVersion.ts`
  (`node scripts/build-sim-bundle.mjs`), refresh the hub bundle in metaverse-hub, and keep the
  `determinism` CI job green on Chromium, Firefox and WebKit.
- **Pinned fixtures will need deliberate updates.** For example, `scripts/aaron-smoke.mjs` and
  `scripts/sproto3215-smoke.mjs` assert kits equal `art/*/before-gameplay.json`, and smoke tests
  assert throw grips and frame windows. Update these in the same PR with a note, never by deleting
  the check.
- **Hitboxes never come from sprites at runtime.** Offline tooling may *measure* the existing contact
  hulls to propose numbers, but the sim only ever reads frozen numeric tables (see
  `docs/SPRITE-SCALE-WORKFLOW.md`, "do not silently alter combat geometry").
- One phase per PR, each with a before/after balance report attached.

## 4. Phases

### Phase 0: Measurement first (prerequisite, about 1 PR)

- `scripts/balance-tournament.mjs`: the prototype's round-robin, made seedable. It reports win rate
  per fighter, per archetype and by seat, draw rate, match length, damage sources (melee, projectile,
  special, throw) and the worst matchups. It writes `docs/balance/report-<date>.json` and a short
  `.md`.
- `scripts/frame-data.mjs`: exports every fighter's effective `getMove` table (startup, active,
  recovery, on-hit and on-block advantage, range) to CSV. This is the source of truth for tuning and
  for the training-mode readout.
- A **reference player bot**: a scripted "decent human" (spacing, blocking, punishing, combos) at
  fixed skill. It is the measuring stick for the difficulty curve.
- Fix the draw artifact in measurement: break HP ties by total damage dealt, then by seat swap,
  so reports show real strength.
- CI: run the tournament in `--fast` mode (fewer samples) as an advisory step. It becomes a gate
  once Phase 1 lands (no fighter outside 35–65%).

### Phase 1: Balance normalization ("any pick is fair", 2–3 PRs)

Replace free-floating kit numbers with **archetype templates and a budget**.

1. **Archetypes.** Map every fighter's existing `role` to one of about 8 templates: Pressure,
   Footwork, Zoning, Counter, Brawler, Weapon (staff, halberd, sword), Paired, Hover. Each template
   defines baseline walk speed, jump, light, heavy and projectile frame data, Team Special shape and
   damage.
2. **Identity within bounds.** A fighter keeps its flavour through at most 2–3 deltas from its
   template (for example "+8 light range, −4 projectile damage"). A test caps each delta at ±10% and
   requires a budget score within ±3% of the template's.
3. **Budget formula.** Score = damage per frame of commitment, adjusted for safety (recovery and
   on-block advantage), reach and projectile threat (damage × speed ÷ (startup + recovery)). Calibrate
   the weights from the tournament, then lock them in `tests/balance-budget.test.ts`.
4. **Specific normalizations the data already supports:**
   - Team Special *total* damage normalized to one band (about 270–300) by dividing per-contact damage
     by contact count. Currently 2-contact and 6-contact specials differ by 2×.
   - Team Special range by archetype: Zoning long, Brawler short but faster, instead of 270–850 by
     list order.
   - Projectile damage tied to projectile speed and startup: fast shots deal less. Only one of your
     projectiles on screen at a time, a standard fighting-game limit that kills spam.
   - Weapon fighters (Sir Sproto, sun god, retainer, Jessica, melo) get the reach their staff and
     blade imply: longer heavy and sweep range, slower startup. They are currently near 0% with
     melee-length weapons.
   - Paired fighters: their `bodySpread` already adds range, so subtract it from the template
     instead of stacking it.
5. **Tune with the harness until every fighter is 40–60%.** Run at two CPU levels so balance
   doesn't hinge on bot quirks.

### Phase 2: Speed and flow (1–2 PRs)

Every change below only retimes existing poses.

| Change | Now | Proposed start point |
| --- | --- | --- |
| Walk speed (template baseline) | 5.06 everywhere | 5.6 (Footwork 6.2, Brawler 5.2) |
| Dash cooldown `dashLock` | 28 | 20; dash cancels on hit stay one per combo |
| Hold dash = run | none | after the 11-frame dash, holding forward keeps 1.35× walk speed using the walk cycle at a faster `walkCycleDistance` rate |
| Light / medium recovery | 13 / 17 | 11 / 14 |
| Projectile recovery | 20–29 | 18–22 by template |
| Knockdown + get-up | 14 + 6 | 12 + 6, plus a quick-rise and a delayed-rise option (hold down or up on landing) |
| Jump-cancel on hit | none | medium and launcher can be jump-cancelled on hit (air chase already exists for launcher) |
| Input buffer | 14 frames | 8 frames: tighter, less accidental, still forgiving |
| Hitstop | 5 / 8 frames | 4 light, 6 medium, 9 heavy, 12 Team Special final hit |

Track match length and "seconds spent in your own recovery" in the harness.

### Phase 3: Hitboxes, hurtboxes and defense (2 PRs)

**Hitboxes.** Replace `ahead < range && |dy| < 85` with per-move rectangles:
`{forward:[min,max], height:[low,high]}` in world units from the root. Seed them offline by
measuring each move's existing active-pose contact hull, then round them and freeze them in
`src/sim/data/hitboxes.json`. Weapon moves get their real reach.

**Hurtboxes** by state:

| State | Hurtbox |
| --- | --- |
| Standing | full height |
| Crouching | about 60% height, so some high attacks whiff over a crouch and lows must be blocked low |
| Airborne | raised box; anti-air launchers favoured |
| Attacking | the hurtbox *extends* toward the attacker's hitbox during active and recovery frames, so whiffs can be punished at range |

**Defense:**
- Per-move blockstun and pushback (light about 11, heavy about 18), giving real plus and minus
  frames on block.
- Chip damage: heavy, projectile and Team Special deal 10–15% chip. Chip can't KO in story, or chip
  KO can stay as a hard-difficulty rule.
- **Throw break**: press grab within 7 frames of being caught to break (both pushed apart, no
  damage). Throw damage drops from 115 to about 90 so it rewards reads without dominating.
- Projectile clash: opposing projectiles that overlap cancel (beams win against shots).
- Wake-up: the existing 12-frame throw invulnerability stays, and add 3 frames of strike
  invulnerability on rise so "meaty" timing is a skill, not a loop.

### Phase 4: Difficulty curve and CPU (2 PRs)

Rebuild `cpuInput` into a **parameterised bot**, `cpuInput(s, slot, skill)`. Its state (seeded
generator, intent, reaction queue) lives in `CombatState`, so replays and online QA autoplay stay
deterministic.

| Skill knob | Easy (1) | Normal (4) | Hard (7) | Story finale (10) |
| --- | --- | --- | --- | --- |
| Reaction delay | 28 f | 18 f | 12 f | 8 f |
| Blocks a visible attack | 25% | 50% | 70% | 85% |
| Blocks lows correctly | 20% | 45% | 70% | 90% |
| Punishes a whiff or unsafe move | 0% | 30% | 65% | 90% |
| Anti-airs a jump-in | 0% | 25% | 60% | 85% |
| Breaks throws | 0% | 20% | 50% | 75% |
| Completes its combo route | 40% | 70% | 90% | 100% |
| Uses meter optimally | no | sometimes | yes | yes, and baits |

Replace the fixed every-other-frame cadence and the fixed guard cycle with intent states
(approach, zone, pressure, defend, punish), chosen by distance, life lead and the opponent's habits.

**Story mapping (250 encounters):** skill = 1 + 9 × (encounter index ÷ 249), smoothed per chapter.
Gauntlet and boss encounters add +1 (`art`, `nick-juicy`, the final 15). Keep stats fair: no hidden
damage or health bonuses below skill 10. Only the optional post-game "Nightmare" tier may add +10%
CPU damage.

**Fairness aids:** after 3 straight losses on one encounter, offer (never force) a −1 skill retry.
God Mode is unchanged.

**Free fights and versus:** a difficulty selector (Easy, Normal, Hard, Expert, default Normal). The
balance gate from Phase 1 runs at Normal and Hard.

### Phase 5: More fun, using existing poses only (2–3 PRs)

1. **Rounds and timer.** Best of 3, with a 60-second clock and the HP percentage deciding a time-out.
   Round 2 and 3 reuse the existing entrance, intro and defeat clips. This is the biggest single
   boost to comeback arcs and pacing.
2. **Counter-hit.** Hitting an opponent during their startup gives +25% damage and +6 stun. The flash
   uses the existing hit effect with a colour change, a renderer effect rather than art.
3. **Meter from defense.** Gain partial pips from blocking and taking damage (for example 0.15 pip
   per 100 HP lost). The losing player gets their Team Special sooner, which is a comeback mechanic.
4. **Just-defend.** Pressing back within 3 frames before a hit lands halves blockstun and grants a
   small meter bonus. This is high skill with no new art.
5. **Juggle limit.** The existing scaling stops at 45%. Add a juggle counter so air combos end
   cleanly instead of looping, which keeps balance safe after the Phase 2 speed changes.
6. **Training mode upgrades** (UI and sim debug, not art): a frame-advantage readout, a hitbox and
   hurtbox overlay (debug rectangles), an input display and dummy recording/playback.
7. **Story match modifiers** (rule-only variety, one per chapter boss): "Double meter", "Low gravity
   (`GRAVITY` 0.6)", "Specials only", "Sudden death 300 HP", "Projectiles reflect". These are fresh
   fights with zero new assets.

## 5. Order, size and risk

| Phase | Depends on | Risk | Main risk control |
| --- | --- | --- | --- |
| 0 Measurement | none | low | none needed (tooling only) |
| 1 Balance | 0 | medium: every kit changes | budget test and tournament gate, fixture updates |
| 2 Speed | 1 | medium: feel | keep phases ≥ the minimum frames, human playtest |
| 3 Hitboxes and defense | 0, 1 | high: core feel | hitbox overlay, per-move review against poses, determinism CI |
| 4 CPU and difficulty | 0 | medium | reference-bot curve report |
| 5 Fun features | 2–4 | low to medium | each behind a mode flag first |

Suggested order: **0 → 1 → 4 → 2 → 3 → 5**. Difficulty (4) right after balance gives immediate
story improvement, and the bot is then good enough to tune speed and hitboxes against.

## 6. Definition of done for each phase PR

- `npm run check`, `npm run test:all` and `npm run build` pass. The determinism CI job is green.
- The balance report is attached, compared with the previous one.
- `src/net/simVersion.ts` is regenerated, and the hub bundle refresh is noted or done in
  metaverse-hub.
- There is a human playtest note: which fighters and modes were played and at what speed.
  Automated passes aren't enough to approve feel.
- No file under `public/fighters/` or `art/` changes.
