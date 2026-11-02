# Thirteen additional partners — November 2, 2026

The requested expansion adds ten single Sprotos plus three twin Sproto identities. The identities were randomly sampled once from the existing inventory, excluding partners already assigned before this expansion. Their assignments are fixed and reproducible in the source and canonical inventory. Selecting a main fighter selects its assigned partner; there is no new separate partner-picker UI.

Each identity has a distinct attack silhouette, trajectory/body motion, and confirmed-contact behavior. Both members of every new twin pair perform their own attack. Twins alternate fixed body identities across the main fighter's existing special contacts in either facing; the other member covers. The original three separated partners and their 34 assignments remain intact.

## Assignments and attacks

| Main fighter | Partner | Special attack | Behavior |
| --- | --- | --- | --- |
| LoadTheBags (`loadthebags`) | Sproto #313 (`sproto313`) | FOUR-EYE PINBALL | Four angled prism rays and a ring impact; modest knockback. |
| urmom.eth (`urmometh`) | Sproto #1414 (`sproto1414`) | BLUE GEYSER | Ground geysers rise under the target and launch it upward. |
| Alpha 777 (`alpha777`) | Sproto #2884 (`sproto2884`) | CAP COMET | A yellow cap follows a high comet arc, ending in a stronger shove. |
| UNC Master Flex (`uncmasterflex`) | Sproto #215 (`sproto215`) | RED-EYE VORTEX | A red spiral vortex pulls the opponent toward the main fighter. |
| Dumpstar (`dumpstar`) | Sproto #102 (`sproto102`) | SHOULDER BLITZ | The whole partner rushes forward with shoulder streaks and a heavy impact. |
| Aaron (`aaron`) | Sproto #834 (`sproto834`) | CRIMSON DIVE | A high leap and diving approach, crimson trails and a light launch. |
| ol’ no name (`olnoname`) | Sproto #1815 (`sproto1815`) | HOOKED REAPER | A low red halberd crescent hooks the opponent inward; requires crouch blocking. |
| Erik Stevens Sproto (`erik`) | Sproto #1601 (`sproto1601`) | LUCKY EIGHT RAIN | Three yellow 8s follow staggered falling arcs. |
| Morelight (`vela`) | Sproto #2789 (`sproto2789`) | STORMSTAFF | A staff-fed storm forks into several lightning branches and a launch. |
| vitalik.eth (`vitaliketh`) | Sproto #818 (`sproto818`) | FROST ECHO | Grounded ice spikes, longer stun, and 90 frames of slow on a confirmed hit; crouch blocking stops the low attack and slow. |
| Sober (`sober`) | Sproto #282 (`sproto282`) | RED / BLUE CROSSFIRE | Red member fires an upper fan with knockback; blue member sends a lower zigzag that pulls inward. |
| Brain Sprot (`brainsprot`) | Sproto #2075 (`sproto2075`) | SKY / QUAKE | Small member dives from above and launches; large member stomps with ground ripples, low contact and a downward impact. |
| Fat Head Dave (`bront`) | Sproto #704 (`sproto704`) | BOULDER / BOOMERANG | Large member throws a boulder with heavy knockback; small member sends a returning golden boomerang with pullback. |

## Implementation

`src/core.ts` stores the 13 partner attack profiles and the selected main-to-partner assignments. Confirmed special contacts use the selected partner's push, stun, launch, and low-contact properties. Frost applies slow only after a successful hit. The main fighter's damage amounts, meter spending, contact times, maximum contact count, and two combat slots remain authoritative; drawing cannot add damage. A partner's explicit launch/height properties take precedence over inherited main-fighter special properties so, for example, the boulder relay does not accidentally inherit Dave's large rising launch and push the opponent outside the next contact's range.

`src/partnerEffects.ts` draws the 13 distinct pixel effects. `src/teamSpecial.ts` plans entrance, rush/flight positioning, retreat, and per-body effect origins. Custom effects render in front of the fighters so a cap, 8, boulder, or boomerang remains visible on impact. The new profiles replace the shared generic special motif for these assignments. Existing partner effects retain their prior behavior.

`src/poseAtlas.ts` reuses the supplied full-body intro, special, signature-cast, aerial, and heavy drawings, with partner-specific timing and whole-body translation. It does not split characters into limb cutouts. New twin contact ownership uses fixed entity indices, never facing-dependent identity swaps. The small #2075 member's leap follows its own contact clock independently of the large member's stomp.

The runtime roster and the canonical expansion inventory agree on assignments, including named mains. The existing central and relay installers preserve them. Selection hints show the partner's attack name; the special banner identifies the main and its single partner.

## Verification

- `npm run build`: TypeScript and production Vite build passed.
- `npm run partners-qa`: the original 612 roster/facing/position cases and 32 twin identity cases pass; 78 additional attack cases cover all 13 new assignments in both facings and at three wall/center positions. Checks include exact loading, body identity, camera bounds, silhouette clearance, active versus covering drawings, both twin members attacking, all expected contacts at center, unchanged meter and combat slots, low blocking, confirmed frost slow, deterministic distinct effect geometry, distinct contact properties, and no combat mutation from rendering. The new twin tests captured 840 attacking frames across their scenarios.
- `node scripts/selection-menu-smoke.mjs`: nine controller/selection groups passed, including every player/CPU selection naming its one partner and the new attack titles.
- `node scripts/fighter-qa.mjs`: 510 cases across all 102 profiles and eight additional power interactions passed.
- `npm run smoke`: passed the core, directional, throw, movement, and reaction groups.

The actual browser gallery at `art/partner-expansion-lab.html` renders all ten single attacks and both attacks from each twin pair (16 cards). It reported 13 partners, 16 attacks, and zero failures facing right. The three twin pairs were additionally checked facing left with all six fixed body identities active in turn. The gallery supports filters, facing changes, and PNG export. [All 13 partners facing right](evidence/partner-expansion/all-partners-right.png) and [both attacks from all three twin pairs facing left](evidence/partner-expansion/twins-left.png) are saved from the final rendering. The regular `art/pissing-assist-lab.html` still supports playback/frame stepping and now displays the partner attack profile and per-body contact ownership.

The browser fixture grants three pips for inspection only. It uses the actual combat core and render pipeline; it does not alter normal-game charging. Browser inspection samples authored poses and effects and is not a claim that every in-between frame was individually reviewed. Existing supplied sprite art is reused; this update generates no new paid image assets.

## Integration status

Continues branch `codex/independent-partner-assists` from separation commit `2e67fa4d`, in `/Users/kenhiraoka/Documents/Codex/2026-11-02/task-6/sproto-partners`. No other checkout was edited, and no merge, push, or deployment was performed.

When integrating, keep both this follow-up and the original separation fix. Overlapping files are `src/core.ts`, `src/poseAtlas.ts`, `src/selectionMenu.ts`, `src/teamSpecial.ts`, `scripts/selection-menu-smoke.mjs`, `package.json`, and the canonical inventory. Preserve other branches' directional spit, stage, story, and paired-menu changes. Run the combined build and `npm run partners-qa` after resolving overlaps.
