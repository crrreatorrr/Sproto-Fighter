# Directional spit — isolated implementation, 2026-11-02

Branch: `codex/directional-spit`, based on `ba09fa6`.
Worktree: `/Users/kenhiraoka/Documents/Codex/2026-11-02/task/sproto-directional-spit`.
The original working checkout and its ongoing changes were left in place. Nothing was merged or pushed.

## Behavior

- Golden Sproto, Morelight, Juicy, Jahon and Crapto retain horizontal spit in both facings. Vertical velocity, gravity, wave and bounces remain zero.
- Down + ranged selects a lower shot from the existing complete crouch pose. Its mouth origins are authored world geometry, independent of rendering. The crouched pose remains through startup, release and recovery, including when Down is released after the attack is buffered.
- Up + ranged now buffers through the ordinary two-frame jump chord window, jumps, and spits horizontally from the actual jump arc. Up is the jump input; there is no extra high origin offset. After landing, holding Up and pressing ranged again fires at the normal grounded height and does not jump again.
- Down in the air does not lower the mouth or aim downward. A cast completing on landing uses its real release position.
- Lower spit meets the existing crouched silhouette. Against organic spit, the crouched target band is 28–92 pixels above the feet; neutral origins are 95–109 pixels and still pass above this band. Standing and non-spit projectile collision bounds are preserved. This changes height, not guard classification: it does not grant an unblockable or low-guard property.
- Other directional attacks retain their chord priority. Non-spit powers retain their aiming and trajectories.

## Automated verification

All passed; logs are in [the evidence folder](evidence/2026-11-02-directional-spit/).

- `npm run build`: TypeScript and production build.
- `npm run qa`: combat, directional, new spit checks, throws, movement, reactions, story, broad matchup matrix, and per-fighter powers. The existing broad matrix covers 476,280 interaction frames.
- `node scripts/spit-smoke.mjs` is now part of `npm run smoke`. Its 43 groups cover all five spit fighters in both facings; horizontal direction combinations; simultaneous Up/Down; Up+ranged at 0/1/2/5-frame delays; held Up after landing; Down in flight; landing casts; buffering and hit-stop; standing, crouched and airborne collision outcomes.
- `node scripts/pose-atlas-smoke.mjs`: nine groups, including crouch pose selection throughout real casts and no render mutation of combat state.
- `node scripts/event-clips-smoke.mjs`: 12 groups for the installed Golden Sproto and Morelight event clips, both facings; neutral cast release and mouth origins remain intact.
- Differential comparison against `git show HEAD:src/core.ts`: all 704 non-spit direction/facing/ground-air cases matched exactly for 120 frames each (84,480 complete state comparisons), including crouching targets.
- `git diff --check`: clean.

## Actual browser verification

Ran the isolated Vite server at `http://127.0.0.1:5194/?qa`, selected Standing dummy, and used real keyboard input plus the existing visible QA freeze/frame controls. No combat state injection was used. Full-page screenshots were inspected in the browser tool output.

| Input and position | Fighter feet Y | Projectile Y | Projectile VX / VY | Observed result |
| --- | ---: | ---: | --- | --- |
| I, right-facing Golden Sproto | 578 | 469 | +9 / 0 | Normal standing cast; dummy takes 55 damage |
| S + I, right-facing | 578 | 504 | +9 / 0 | Full crouch pose, mouth-aligned lower shot |
| W + I, right-facing | 444.9 | 335.9 | +9 / 0 | Actual jump, horizontal shot above grounded opponent |
| S + I, left-facing after jumping across opponent | 578 | 504 | −9 / 0 | Mirrored crouch and lower horizontal shot; dummy takes 55 damage |
| W + I, left-facing | 444.9 | 335.9 | −9 / 0 | Actual jump and mirrored high horizontal shot |
| W + I, Halloween 2008 | 578 | 469.5 at cast age 20 | 0 / −6.68 | Grounded upward pumpkin cast retains its aimed/gravity trajectory |

Keyboard browser checks supplement the deterministic all-fighter collision tests. A physical gamepad was not available; it feeds the same action bits into the tested combat state machine.

## Integration and conflicts

This branch deliberately starts from the committed base, excluding the original checkout's uncommitted story, roster, art and combat work. Do not replace those files wholesale or merge while that work remains active.

A read-only `git apply --check` of this branch's tracked diff against the current original checkout found overlapping edits in `src/core.ts`, `src/poseAtlas.ts`, and `scripts/pose-atlas-smoke.mjs`. The current original core also supports additional horizontal non-spit powers, custom `rawStyle.origin` geometry, paired fighters and an eye-laser collision band. During eventual integration, preserve those additions: apply crouch/jump behavior only to `isHorizontalSpit` organic fighters, prefer crouch origins only for their crouched casts, and retain all existing custom/paired origins and eye-laser bounds otherwise. The remaining tracked hunks passed the dry-run check at verification time; new files must also be included.

Crouched cast rendering reuses the authored crouch pose; no new dedicated crouched spit animation frames were generated. This avoids deforming a standing cast or moving hitboxes from rendering code.
