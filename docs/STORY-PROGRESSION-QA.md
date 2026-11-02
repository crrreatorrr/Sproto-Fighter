# Persistent story progression — November 2, 2026

Implemented in isolated worktree `/Users/kenhiraoka/Documents/Codex/2026-11-02/task-3/sproto-unlocks`, branch `codex/persistent-story-unlocks`. Nothing merged to main. No generation tools, videos or paid credits used by this task.

## Behavior

- 102 installed roster entries: Golden Sproto (`rivet`) and Fat Head Dave (`bront`) are starter choices. Each of the other 100 fighters is a unique story rival and unlocks permanently when defeated. Morelight is withheld for the finale rather than being a starter. CPU/free-play rival selection still permits any installed rival; locked portraits explain recruitment and random P1 selection uses unlocked fighters only.
- Fixed, versioned encounter IDs derive from fighter identity. Adding arenas or rearranging the menu roster does not change save identity. Scene slots appear at major location boundaries, without final dialogue or video.
- `STORY_STAGE_IDS` is the canonical stage order supplied by the stage chat. Assignments reserve the penultimate location for the 16 paired Sprotos and the final location for the two bosses. The normal 82 encounters divide consecutively among earlier locations.

| Location | Encounters | Role |
| --- | --- | --- |
| Mudline Trenches | 1–17 | Opening route |
| Circuit Gate | 18–33 | City |
| Tidebreak Marina | 34–50 | Yacht |
| Crown Relay Chamber | 51–66 | Castle |
| Last Light Bar | 67–82 | Hidden doorway |
| Verse Gate | 83–98 | Paired/twin rivals; red/blue Sproto Duo is #98 |
| The Hatchery | 99–100 | Morelight, then Vaudream |

- Victory saves at the confirmed combat KO, before the presentation outro. Losses and draws give no recruitment or progress. Duplicate results and replays do not advance another encounter. Completed locations can be replayed without deleting unlocks. No destructive save-reset UI is added.
- **Finale:** defeat Morelight (`vela`, #99), automatically load Vaudream (`vaudream`, #100) with the same hero at full 1000 HP, normal rules and fresh meter. The boss assets preload together. Both victories must happen in that page session without a defeat/draw/abandon/restart. Morelight's recruitment saves immediately, but the campaign checkpoint stays at 98 until Vaudream is beaten. Reload, death/draw, return to fighter select or restart in the second fight goes back to Morelight; even a forged call to the save service cannot clear #100 without its in-memory Morelight victory flag. Pausing is allowed.
- **God Mode default chosen for unspecified details:** completing all 100 unlocks an optional free-play checkbox. It starts off every reload, prevents P1 health loss, and replenishes Team Special charge; it does not grant super armor or stop hit reactions. Story always disables it. Replay version 2 records the God Mode option and replays deterministically. The similarly named roster fighter `godmod3d` is separate from this option.
- Storage key `sproto-arena-story-v1` is scoped to the same browser profile/origin (including port). Invalid data is sanitized and noncontiguous clears cannot skip ahead. Existing session-only story progress had no saved data to migrate. Blocked storage/quota errors preserve in-memory progress and visibly report the limitation. Writes merge longer progress and recruits from other tabs; storage events refresh the menu.

## Validation

- `npm run story-smoke`: 25 groups passed, including 100 distinct rivals, full route, stage gates, persistence across new service instances, malformed/blocked storage, stale-tab merges, every defeat/draw retry, duplicate events, asynchronous failures and double clicks, all finale restart/reload branches, automatic full health via actual main hooks, locked fighter/God Mode enforcement, melee/projectile/throw damage, unlimited specials and deterministic God Mode replay.
- `node scripts/selection-menu-smoke.mjs`: 10 groups passed, including recruitment updates, random-selection restrictions, God Mode gate, keyboard/controller focus and confirm behavior. Gamepad tests use simulated pads; no physical-controller claim.
- `node scripts/story-stages-smoke.mjs`: ten arenas, seven locations in order, all nine raster backgrounds load, Hatchery present, distinct new backgrounds, same art in previews/matches.
- `npm run smoke`: passed the existing core/102-roster, directional, throw, movement and hit-reaction suites after the additive God Mode core changes.
- `npm run build`: passed TypeScript and production bundling.
- Browser checks on isolated port 5183: actual UI displays all seven gated locations with correct encounter ranges; first actual story launch assigns Halloween 2008 rather than the chosen free-play rival; Hatchery launch assigns Morelight; completion enables God Mode in free play, reload defaults it off, and a story launch forces normal rules. A temporary UI test fixture invoked the real save service to confirm 2→3 unlocked fighters persists over a reload, Morelight→reload→Vaudream is blocked, both boss victories in one session complete 102/102 recruits, and completion persists. Those injected results were fixture checks, not manually fought wins. Test storage and fixture removed afterward. A 100-match human playthrough and all attack artwork playback were not performed.

## Integration

Main's shared worktree was heavily modified by active chats. To preserve it, this branch has separate dependency snapshots:

1. `f468a95a2533046f765cd6082164d10db9155a7c` captures existing shared source/scripts at task start (not authored by this progression task).
2. `ad158a35` captures the stage chat's canonical Hatchery stage, background and stage-smoke changes for local integration testing (not authored by this progression task).
3. The subsequent progression feature commit contains only this task's source, tests and documentation. Integrate that feature commit after the other chats' source/roster/stage changes are ready; do not blindly cherry-pick the dependency snapshots onto an already updated main.

Files owned by this feature: `src/storyProgress.ts`, `src/storyMode.ts`, narrow integration edits in `src/main.ts`, `src/core.ts`, `src/selectionMenu.ts`, `src/arcadeSelection.css`, `scripts/story-smoke.mjs`, `scripts/selection-menu-smoke.mjs`, this report and current-story README sections. Preserve concurrent combat/render changes, including the directional-spit branch. Stage art/canonical route ownership stays with the stage chat. The cutscene chat must use the final twin → Morelight → Vaudream order and retain script approval before video generation.

Local-only dependency assets copied into this worktree remain untracked; they are existing work from other chats, not new feature deliverables. Main already has their originals. Rebuilding this checkout elsewhere requires those roster assets from the shared project. No cloud sync/account save was requested or added.
