# Documentation index

Most files here are dated QA and handoff reports written as work landed. They
stay in place because they link to each other, to `evidence/` and to `../art/`
by relative path. Use this page to find the current material first.

## Start here

| Document | What it is |
| --- | --- |
| [../README.md](../README.md) | How to run, play and check the game; architecture; hub notes |
| [GAMEPLAY-PLAN-20261105.md](GAMEPLAY-PLAN-20261105.md) | Gameplay mechanics plan: measured balance, speed, hitboxes, difficulty curve, phased rollout |
| [WEAPON-SCALE-QA-20261104.md](WEAPON-SCALE-QA-20261104.md) | Weapon-wielder sprite size repair, `walkRegistration`, Anni size and the GodsSon rename |
| [INTEGRATION-20261103.md](INTEGRATION-20261103.md) | Latest integration: 131 fighters, 73 stages, hub adapter, checks run |
| [GITHUB-INTEGRATION-20261103.md](GITHUB-INTEGRATION-20261103.md) | How the full history reached GitHub; repository size |
| [perf/README.md](perf/README.md) | Fighter-art loading: trimmed sprite sheets, menu previews, cache, budgets; before/after measurements |
| [MULTIPLAYER-PLAN.md](MULTIPLAYER-PLAN.md) | Online play design and implementation status: rollback, transport, loading, trusted results, 10-Ticket wagers |
| [CLAUDE-HANDOFF.md](CLAUDE-HANDOFF.md) | Running handoff log (older counts; read its newest notes first) |
| [STORY-UI-UPDATE.md](STORY-UI-UPDATE.md), [CAMPAIGN-EXPANSION-UPDATE.md](CAMPAIGN-EXPANSION-UPDATE.md) | Campaign, saves, map and story UI |
| [STAGE-CATALOGUE-20261102.md](STAGE-CATALOGUE-20261102.md) | Stage counts and file mapping |
| [PAIRED-QA-COVERAGE.csv](PAIRED-QA-COVERAGE.csv) | Per-pair coverage for twin fighters |

## Reference

These describe systems rather than one day's work. Roster counts in older ones
predate the 131-fighter roster.

- [ROSTER.md](ROSTER.md), [FIGHTER_KITS.md](FIGHTER_KITS.md): fighters and their mechanical kits
- [SPRITE-SCALE-WORKFLOW.md](SPRITE-SCALE-WORKFLOW.md), [SPRITE-REWORK-DESIGN.md](SPRITE-REWORK-DESIGN.md), [pose-atlas-sequences.md](pose-atlas-sequences.md): sprite scale, atlas layout and pose sequences
- [MOVEMENT-TUNING.md](MOVEMENT-TUNING.md), [THROW-REACTION-QA.md](THROW-REACTION-QA.md): movement and throw/reaction rules
- [STORY-SCRIPT-DRAFT.md](STORY-SCRIPT-DRAFT.md): placeholder story text awaiting approval

## History

Dated reports, kept as evidence of what was checked and when.

- **Integration checkpoints:** [COMBINED-UPDATE-20261102](COMBINED-UPDATE-20261102.md), [INTEGRATION-CHECKPOINT-20261102](INTEGRATION-CHECKPOINT-20261102.md), [INTEGRATION-CHECKPOINT](INTEGRATION-CHECKPOINT.md), [PAIRED-INTEGRATION-HANDOFF](PAIRED-INTEGRATION-HANDOFF.md), [TWIN-INTEGRATION](TWIN-INTEGRATION.md), [CLAUDE-HANDOFF-THROWS](CLAUDE-HANDOFF-THROWS.md), [REPOSITORY-PUSH-PLAN](REPOSITORY-PUSH-PLAN.md), [archive/](archive/)
- **Per-fighter QA:** [1601-YELLOW-EIGHT-QA](1601-YELLOW-EIGHT-QA.md), [3215-AARON-LIKENESS-QA](3215-AARON-LIKENESS-QA.md), [3215-CLEAN-COLORS-QA](3215-CLEAN-COLORS-QA.md), [BIMBA-QA](BIMBA-QA.md), [CAPTAIN-SPROTO-QA](CAPTAIN-SPROTO-QA.md), [DUO-QA](DUO-QA.md), [ERIK-STEVENS-SPROTO-QA](ERIK-STEVENS-SPROTO-QA.md), [GPM-QA](GPM-QA.md), [HIGH-SPROTO-QA](HIGH-SPROTO-QA.md), [MORELIGHT-EGG-QA](MORELIGHT-EGG-QA.md), [NICK-QA](NICK-QA.md), [SOLANA-DEL-RAY-QA](SOLANA-DEL-RAY-QA.md), [SUN-GOD-AND-NAMES-QA](SUN-GOD-AND-NAMES-QA.md), [VAUDREAM-QA](VAUDREAM-QA.md), [VITALIK-ETHEREUM-QA](VITALIK-ETHEREUM-QA.md), [NEW-FIGHTER-22-STATUS](NEW-FIGHTER-22-STATUS.md)
- **Roster batches:** [NAMED-NOV02-QA](NAMED-NOV02-QA.md), [LATE-NAMED-NOV02-QA](LATE-NAMED-NOV02-QA.md), [MIDDAY-ROSTER-QA](MIDDAY-ROSTER-QA.md), [SPROTOS-EXPANSION-QA](SPROTOS-EXPANSION-QA.md), [IDENTITY-ACTIONS-QA](IDENTITY-ACTIONS-QA.md), [DIRECTIONAL-SPIT-QA](DIRECTIONAL-SPIT-QA.md)
- **Partners and specials:** [INDEPENDENT-PARTNERS-QA](INDEPENDENT-PARTNERS-QA.md), [PARTNER-EXPANSION-QA](PARTNER-EXPANSION-QA.md), [PARTNER-RELAY-QA](PARTNER-RELAY-QA.md), [PISSING-SPROTO-ASSIST-QA](PISSING-SPROTO-ASSIST-QA.md)
- **Movement and animation:** [MOVEMENT-FOLLOWUP-20261102](MOVEMENT-FOLLOWUP-20261102.md), [MOVEMENT-LIVE-REVIEW-20261102](MOVEMENT-LIVE-REVIEW-20261102.md), [MOVEMENT-RIG-QA](MOVEMENT-RIG-QA.md), [MOTION-ROSTER-LAB](MOTION-ROSTER-LAB.md), [ANIMATION-EVENT-QA](ANIMATION-EVENT-QA.md), [REACTION-SIZE-QA-20261102](REACTION-SIZE-QA-20261102.md), [SPRITE-REWORK-QA](SPRITE-REWORK-QA.md), [ART_QA](ART_QA.md), QA batches ([first2](QA-first2.md), [01](QA-batch01.md), [02](QA-batch02.md), [03](QA-batch03.md)), atlas reviews ([first seven](atlas-review-first-seven.md), [middle seven](atlas-review-middle-seven.md), [last six](atlas-review-last-six.md)), motion reviews ([first seven](motion-review-first-seven.md), [middle seven](motion-review-middle-seven.md), [last seven](motion-review-last-seven.md), [2026-11-01 first](motion-review-first-seven-2026-11-01.md), [2026-11-01 last](motion-review-last-seven-2026-11-01.md))
- **Menus and UI:** [MENU-QA](MENU-QA.md), [MENU-REFERENCE-REVISION](MENU-REFERENCE-REVISION.md), [PIXEL-MENU-NOV02-QA](PIXEL-MENU-NOV02-QA.md), [TWIN-MENU-SIZE-QA](TWIN-MENU-SIZE-QA.md)
- **Story and stages:** [STORY-PROGRESSION-QA](STORY-PROGRESSION-QA.md), [STORY-STAGES-NOV02-QA](STORY-STAGES-NOV02-QA.md), [CAMPAIGN-MAP-QA](CAMPAIGN-MAP-QA.md), [STAGE-VARIANTS-QA](STAGE-VARIANTS-QA.md), [STAGE-FLOOR-ALIGNMENT-QA](STAGE-FLOOR-ALIGNMENT-QA.md), [STAGE-ROUTE-COORDINATION](STAGE-ROUTE-COORDINATION.md), [HATCHERY-STAGE-QA](HATCHERY-STAGE-QA.md), [HATCHERY-RANCH-DETAIL-COORDINATION](HATCHERY-RANCH-DETAIL-COORDINATION.md), [RANCH-NOV02-QA](RANCH-NOV02-QA.md)
- **Scans:** `PUBLIC-EXPORT-SCAN.json`, `PUBLIC-HISTORY-SCAN-20261103.json`, `private-repo-secret-scan.json`

Screenshots and recorded readouts live under `evidence/`. Most of that folder
is excluded from the partial checkout used by CI.
