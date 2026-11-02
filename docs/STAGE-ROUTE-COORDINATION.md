# Canonical stage route — stage-art integration

Owner workspace: /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay

The canonical gameplay order is exported by `src/stage.ts` as `STORY_STAGE_IDS`. Keep encounter assignments and chapter gates derived from this ordered array.

Intended route for the current Hatchery addition:

1. trenches — Mudline Trenches — chapter 1
2. circuit — Circuit Gate — chapter 2
3. yacht — Tidebreak Marina — chapter 3
4. throne — Crown Relay Chamber — chapter 4
5. bar — Last Light Bar — chapter 5
6. verse — Verse Gate (the portal) — chapter 6
7. hatchery — The Hatchery (beyond the portal) — chapter 7

The Hatchery has been generated from the user's supplied environment screenshot, with all screenshot text, badges, UI and units excluded. Its production background is `public/stages/higgsfield/hatchery.png`. Generation/provenance lives under `art/hatchery-stage/`.

Alternate/free-play arenas `retro`, `castle` and `ranch` stay in `STAGES` but are not primary entries in `STORY_STAGE_IDS`. Expected catalog total after Hatchery installation: 10.

The main workspace currently has a session-based world selector. Persistent unlocks, God Mode and the 100-encounter campaign are implemented and tested separately, still unmerged, in `codex/persistent-story-unlocks`; this stage task does not merge or modify that branch. Integrate the latest `src/stage.ts`, stage assets, selector count/rail support and stage route tests when merging that campaign. Derive chapter counts dynamically so adding this arena does not leave six-world constants behind.

Status: stage catalog, canonical seven-stage route, production art and automated story/asset/build checks are installed. Browser QA passed: The Hatchery selected in free play, movement/punch and left-wall readability sampled, and World7 story entry launched. Full-page screenshot saved as the-hatchery-full-game.png.

Finale coordination received: the penultimate Verse Gate is reserved for twin Sprotos. Final zone The Hatchery hosts Morelight, a health refill, then VMUDream (installed fighter ID `vaudream`) as a single no-death/no-reload gauntlet. The persistent campaign branch owns those boss assignments, recruitment/checkpoint semantics and retries; this stage task supplies the ordered arena metadata and images.

Progression integration handoff received: feature commit `c741cc064b173f38a95dffed12ecc1d11323d29e`; feature-only patch `/Users/kenhiraoka/Documents/Codex/2026-11-02/task-3/persistent-story-unlocks.patch`. That branch has tested this completed Hatchery dependency. Encounter blocks are 1–17 trenches, 18–33 circuit, 34–50 yacht, 51–66 throne, 67–82 bar, 83–98 verse, 99–100 hatchery. Keep this route order stable. No branch merge was performed by the stage-art task.
