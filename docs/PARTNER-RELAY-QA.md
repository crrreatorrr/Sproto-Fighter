# Vmudream and #3181 partner relay — November 2, 2026

The same 34 single-body Sprotos that summon Pissing Sproto, including #2322, now have a coordinated partner lineup. Pissing Sproto remains available and participates in the relay.

The four existing special contacts are presented in this order:

1. Pissing Sproto's pelvic-origin yellow stream.
2. Vmudream, still legless and floating, fires a cyan laser from the screen to the opponent.
3. #3181's small yellow creature performs one quick kick; the blue body covers.
4. The dark creature attached to #3181's stomach expands into a large open maw on a connected neck, followed by a large impact wave. The yellow creature covers during this finisher.

Higgsfield GPT Image 2.5 Sunburst generated 96 new assist drawings: 32 each for Vmudream, #3181's blue/stomach body and its small yellow partner. With Pissing Sproto's previous 32 frames, the lineup has 128 dedicated assist drawings. All include entrance, attack, retreat and celebration keys. Existing playable art, health and charging rules are retained. These assists share the lead fighter's four damage contacts; they add no independent health slots or extra hit schedule.

Partner identities are retained separately between frames. Vmudream flies above the grounded actors. Entry chooses an available wall side once per special. #3181's formation uses its new full attack envelope so its two bodies remain separate and inside the camera. Its extra spacing keeps the enlarged maw visible behind the lead fighter in either facing. The lazy loader loads all four helper body atlases, and the selection hint/team banner list the full lineup. Canonical inventory partner lists and both the central and targeted installers preserve the feature.

## Passed checks

- TypeScript and production build.
- Dedicated relay QA: all 34 owners, both facings and three wall/center positions, totaling 204 scenarios; all helper bodies load; blue/yellow roles activate on separate beats; one yellow strike and one larger stomach finisher; paired silhouettes stay separated and camera bounded; rendering does not mutate the combat state; #2322 keeps exactly four damage contacts.
- Full gameplay QA: 510 per-fighter cases across 102 mechanical profiles, plus movement, reactions, throws and navigation checks.
- Expansion QA: 21 groups, all required source assets, current body counts and bounded loading through 72 managed selections/revisions.
- Asset validation: 9,920 frame entries across 118 body atlases at the recorded check, with valid paths, dimensions, hard alpha, anchors and padding.
- Browser samples using the actual combat core/render: #2322's laser contact, yellow kick and enlarged maw finisher; the finisher was checked in both facings. Screenshots are in this chat's outputs. The visible test fixture grants three pips for QA and does not alter normal-game charging.

The older event-clip smoke suite currently fails its blanket no-rotation assertion during separate character-specific defeat presentation changes in the shared project. It is not listed as a passing check for this update. The requested relay's dedicated checks and gameplay/build checks pass. Sampled visual QA does not certify every artistic in-between.

Reproducible requests, job IDs and sources are under `art/sprotos-expansion/partner-relay/`, the shared job ledger and processed `*-assist` folders. No deployment, commit or push was performed.
