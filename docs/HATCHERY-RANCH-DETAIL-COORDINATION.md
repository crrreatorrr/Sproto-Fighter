# Hatchery and Sproto Ranch artwork coordination

Branch: `codex/hatchery-ranch-detail`.
Workspace: `/Users/kenhiraoka/Documents/Codex/2026-11-02/task-5/sproto-stage-detail`.
Snapshot baseline: `fd5d2f6b` (contains existing shared game changes, not this task's patch).

## Completed

Original Hatchery and Ranch references were located in the source workspace at `art/hatchery-stage/reference.png` and `art/references/ranch.jpg`, visually inspected, and copied to `art/stage-detail/references/`. Existing stage screenshots were also inspected. The Ranch is currently procedural 320x180 scenery; the Hatchery is a Higgsfield panorama resampled through 640x360. Both references are available; no replacement reference is required.

Two detailed reference-based prompts are in `art/stage-detail/requests.json`. Planned model: Higgsfield GPT Image 2.5 (`gpt_image_2_5`), Sunburst, high quality, 4K, 16:9, one image per arena. Higgsfield cost preflight returned 4.25 exact credits for one image and 8.5 exact credits for two. The user explicitly approved 8.5 credits for both images in this chat. Both jobs completed successfully with those exact parameters; no additional generations or retries were submitted. No story videos were generated.

## Integration ownership

This task changes two stage backgrounds and narrow Ranch image-loader support in `src/stage.ts`. The loader now includes `ranch.png`; menu thumbnails and combat use it, and `drawRanch` remains the fallback on load failure. The display label is now Sproto Ranch; its stable stage ID remains ranch. Both completed 3840x2160 sources were normalized directly to 1280x720 with nearest-neighbor sampling to retain finer detail than the prior 640x360 intermediate. See `art/stage-detail/art-report.json` for provenance and hashes.

Preserve stage IDs and `STORY_STAGE_IDS`: trenches, circuit, yacht, throne, bar, verse, hatchery. Ranch remains a free-play arena. Preserve chapter metadata, 100-encounter assignments, recruitment/unlocks, God Mode and finale gauntlet ownership. The campaign branch `codex/persistent-story-unlocks` owns those behaviors. Combat/roster integration is active at `sproto-integration`; do not overwrite its source files or cherry-pick this snapshot commit wholesale. Review or cherry-pick only the eventual narrow artwork commit after all current tasks finish. No merge to main is authorized during this task.

## Validation

Originals and completed images were visually inspected. Both final arenas were checked in the browser at http://127.0.0.1:5195 in selection and combat with Golden Sproto / Morelight, plus movement to both arena edges. Screenshots are in `docs/evidence/stage-detail/`. Fighters and HUD remain readable, floors and corners are clear, and source overlays are absent. The background stone wall, crystals, eggs and structures remain behind the play space. This was a focused stage-art check, not a full campaign or all-roster combat review. At the right edge both fighters push together; that inherited combat behavior was not changed here.

`npm run check`, `npm run build`, `node scripts/story-stages-smoke.mjs`, and `git diff --check` passed. Stage checks cover all ten raster backgrounds, distinct assets, dimensions, shared preview rendering, canonical seven-stage route and independent Ranch load-failure fallback.

Final art job IDs: Hatchery `27746ff6-7846-4c89-9589-de5c3112a406`; Ranch `0f17148a-66ab-481f-9ed2-db00019d1801`. The source reference upload for Ranch is `2f78b1dc-510a-4061-830c-ec1f69e2599d`; Hatchery reused its confirmed original reference and prior arena for camera guidance. Model, prompts, approval and submission records are in `art/stage-detail/`.
