# Independent partner assists — November 2, 2026

The follow-up [13-partner expansion](PARTNER-EXPANSION-QA.md) adds ten single Sprotos and three twin pairs with distinct attacks. This report records the original separation fix.

Each main fighter now summons exactly one roster partner. The 34 former three-partner relays are split among Pissing Sproto, Vmudream, and #3181. The existing roster IDs are `sproto3152`, `vaudream`, and `sproto3181`; the display name for `vaudream` is stylized Unicode in the supplied roster. No identities or art were guessed or regenerated.

The one-partner rule is shared by rendering, lazy asset loading, the character selection announcement, and the special banner. A twin remains one partner identity with its complete authored pair. #3181 therefore retains exactly its large blue actor and small yellow actor; its stomach creature remains attached artwork, not a third fighter. Its four contacts alternate yellow strike and blue stomach attack, with the covering body idle on each beat. Combat contacts, charge spending, damage, and the two combat health slots retain their existing behavior.

The assignments follow the prior expansion roster order, cycling between the three partners. They are explicit in both the runtime roster and canonical inventory; both installers preserve the one-partner rule. No separate partner-picker UI was added: choosing a main selects its assigned partner, consistent with the existing game.

| Assigned partner | Mains | Main fighter IDs |
| --- | ---: | --- |
| Pissing Sproto (#3152) | 12 | #102, #651, #831, #865, #1011, #1335, #1477, #1815, #2177, #2531, #2789, #3215 |
| Vmudream (`vaudream`) | 11 | #215, #763, #834, #943, #1093, #1345, #1601, #1870, #2322, #2569, #2884 |
| #3181 (blue + small yellow pair) | 11 | #313, #818, #837, #999, #1187, #1414, #1668, #2101, #2381, #2616, #3106 |

## Verification

- `npm run build`: TypeScript and Vite production build passed.
- `node scripts/pissing-assist-qa.mjs`: 102 mains × two facings × three wall/center positions = 612 scenarios; no more than one rendered partner identity, exact roster identity, camera-bounded #3181 bodies, no combat mutation from drawing, correct banners, dedicated entrance/attack/exit clips, all four assigned contacts, and unchanged four-hit #2322 special. It additionally exercises all 16 authored twin selections as sole partners in both facings (32 scenarios), and independently checks lazy loading for each of the three assignments.
- `node scripts/selection-menu-smoke.mjs`: nine groups passed, including all 102 selections on both player and CPU sides announcing exactly their assigned partner. The existing fixture lacked the checkpoint's `drawSelectionPose` stub; the fixture now supplies it.
- `node scripts/sprotos-expansion-qa.mjs`: 21 groups passed, including complete twin bodies, both facings, shared damage schedule, exact reference assets, #3181 body count/scale, and bounded loading through all 72 inventory selections.
- `npm run smoke`: passed movement, throws, directional attacks, reactions, and meter/KO checks.
- `node scripts/fighter-qa.mjs`: 510 cases across 102 profiles plus eight trajectory/power interactions passed.

## Browser review

The updated `art/pissing-assist-lab.html` uses the actual combat core, sprite renderer and special renderer, with three pips granted only by the QA fixture. It supports every main, both facings, frame stepping, playback, and PNG evidence export. Query parameters `fighter`, `facing`, `frames`, and `position=wall` reproduce sampled states. The fixture does not change normal-game charging.

Chrome samples confirmed #102 + Pissing Sproto, #215 + Vmudream (also #763 + Vmudream), and #313 + #3181's two-body pair at its first yellow strike. Further browser samples confirmed #313 + #3181's left-facing stomach finisher (four-hit combo) and #102 + Pissing Sproto alone at the right wall facing left (a whiff at long range). Vmudream's screen laser was also checked facing left with #215, completing browser samples in both facings for all three partners. Saved PNGs in `docs/evidence/independent-partners/` capture the real canvas and annotate selected identities, facing, and special time.

## Integration

Branch: `codex/independent-partner-assists`, based on shared integration checkpoint `aa4e4960`. Worktree: `/Users/kenhiraoka/Documents/Codex/2026-11-02/task-6/sproto-partners`. No other checkout was edited. No merge, push or deployment was performed.

Integration must retain the independent-partner roster assignments and single-source `specialPartnerIds` helper when combining overlapping `src/core.ts`, `src/poseAtlas.ts`, and `src/selectionMenu.ts` changes from other tasks. The two-body assist alternation is one line in `eventSelection`; preserve other pose/facing/selection updates around it. `scripts/selection-menu-smoke.mjs` also overlaps an existing fixture-stub repair in the integration checkout.

Automated checks validate all affected assignments and facings; browser review samples representative artwork and does not certify every artistic in-between. Partner selection remains assigned per main. Recheck the combined build after other branches land.
