# Optional whole-body walk and event sequences

The version-1 `/fighters/pose-atlas.json` contract still requires exactly 32 main `frames`. Existing pose slots, explicit-slot sampling, combat timing, and manifests without sequences are unchanged.

A fighter may additionally provide `walkFrames`, an array of **2–64** complete-body images in cyclic playback order. Each entry has the same format as a main frame: a local URL string, or `{ "url": "…", "width": 128, "height": 128, "anchor": [64,120] }`. Omitted dimensions and anchor inherit the fighter defaults. All frames share the fighter's `scale` or canonical `worldHeight` scaling; per-frame dimensions do not rescale the body. Anchors are source-pixel foot-contact coordinates.

Example addition to an otherwise complete fighter configuration:

```json
{
  "walkCycleDistance": 72,
  "walkFrames": [
    "pose-atlases/vela/walk-00.png",
    "pose-atlases/vela/walk-01.png",
    "pose-atlases/vela/walk-02.png",
    "pose-atlases/vela/walk-03.png",
    "pose-atlases/vela/walk-04.png",
    "pose-atlases/vela/walk-05.png",
    "pose-atlases/vela/walk-06.png",
    "pose-atlases/vela/walk-07.png"
  ]
}
```

Use the project's actual installed paths; this example does not install assets. Increment the manifest `revision` when replacing images to change cache-busting URLs.

The existing persistent signed travel phase selects `floor(phase * walkFrames.length)`. One whole sequence spans `walkCycleDistance` world pixels (default 72). Forward walking advances the phase; backward walking reverses it. Hitstop holds travel. Only ordinary grounded walking uses this sequence: dash, jumps, attacks, stun, block, and throws retain the main poses. No frame blending, limb deformation, or synthesized in-between poses are added. Without `walkFrames`, slots 2–5 remain the four-frame gait.

All optional frames load and validate alongside the main atlas. Empty/out-of-range arrays, invalid URLs/metadata, failed images, or dimension mismatches reject the manifest load; a declared broken sequence never silently falls back to its four main walk slots. The existing atomic roster installation behavior remains.

`getPoseAtlasDebug()` adds `sequence` (`"poses"`, `"walk"`, or an event clip name), zero-based `frameIndex`, and `sequenceLength`. Its `slot` still describes the compatible main pose slot; `name` is the selected event name during event playback and otherwise the main pose name. The lab prints both sequence selection and main pose slot. `drawPoseAtlasSample(..., slotOverride)` explicitly shows the requested main slot; omitting the override uses current sequence playback.

Optional medium/kick sequences are not implemented. Ground medium continues to use the existing main poses and actual `getMove()` timing. Sequence support alone does not establish that any supplied gait has correct anatomy, foot planting, depth alternation, or visual continuity; those require inspecting the installed frames and live motion.

## Current contact and idle corrections

The installed manifest also supplies optional `holdContact: { hand: [x,y], torso: [x,y] }` source-pixel points, individually inspected for reaching pose26 and victim hit pose24. A bounded presentation offset brings the victim torso to the reaching hands at initial latch. Forward holds retain this correction; other directions fade it while the core lift/arc takes over. Forward releases blend the offset out over eight simulation frames. World positions, collisions, damage and replay state are unchanged. This is a contact correction, not separately authored paired throw animation.

Medium recovery now uses a brief half-extension, chamber, planted recovery and guard instead of inserting the deep crouch/landing pose. Neutral idle timing restarts at guard after movement/actions; it no longer selects a different breathing pose immediately based on the global match clock. Rendering rounds world translation to whole pixels. All of these remain presentation choices; combat move timing is unchanged.


## Optional event clips

`clips` is an optional object on each fighter configuration. Recognized keys and required exact counts:

| Key | Frames | Selection |
|---|---:|---|
| intro | 4 | Actual round participants during intro, sampled by presentation frame |
| special | 8 | Special move time, using that fighter's real COMBAT_STYLES contact schedule |
| cast | 4 | Bolt startup/active/recovery, using actual getMove timing |
| recoil | 4 | Ordinary grounded recoil, sampled by reaction.t |
| defeat | 12 | Losing participant(s) during outro/result; repeats may be deliberate holds |

Each clip entry accepts the same local URL or PoseFrameConfig as the main frames, including per-frame dimensions, anchor and opaque bounds. Unknown keys, incorrect counts, failed images, invalid metadata and dimension mismatches reject the whole roster load. Main32, walk and all supplied clips load together before installation. Omit a clip entirely to retain the existing main-pose path; a supplied broken clip is never silently ignored. No event assets are installed by this code change.

Example shape (not a complete valid manifest): `clips: { intro: [frame0, frame1, frame2, frame3] }`. Use real frame objects or local URLs, not these identifiers, when authoring a manifest. Preserve full-body identity and consistent world scale across all drawings. Defeat drawings must carry their intended floor contact in each source anchor; event playback draws that anchor at the fighter's core position, with no secondary rotation or limb deformation. Bounds are validated and retained as source metadata, but do not override the authored event anchor.

Call `setPoseAtlasPresentation(presentation, fighters)` each render with the actual stable fighter objects, or pass null to disable presentation selection. Intro affects those participants only, never a teammate with the same roster ID. Outro/result selects the loser; winner2 means both lose/draw. A `fromFloor` outro starts at defeat frame4 rather than replaying the upright collapse; the final frame9 holds during result. With no installed defeat clip the pre-existing fall/throw pose path remains. Presentation clocks do not modify combat/replay state.

Call `setPoseAtlasAssistTiming(assist, contacts)` for a stable teammate object, then assign its `move.t` from the owner's clock. A WeakMap overrides only that assist object's special contact schedule. Ordinary fighters continue to use their own combat style. Clip timing itself is provided by the pure samplers in `animationEvents.ts`.

Selection priority is round presentation, throw exclusion, grounded ordinary recoil, then special/cast. Throws and knockdowns retain their current full-body fall/release path. Authored event clips bypass the legacy reaction rotation, so an already drawn recoil or collapse is not rotated a second time. Explicit main-slot review remains unchanged.

`getPoseAtlasClipInventory()` returns installed per-ID clip names and lengths; it does not advertise clips until the atomic load succeeds. `getPoseAtlasDebug()` reports the actual event `sequence`, zero-based `frameIndex`, and its exact `sequenceLength` while preserving the fallback main `slot`.

### Development verification

Focused stub-image checks passed for inventory, intro, loser/draw defeat, floor-origin frame4, final frame9, assist contacts, cast active timing, grounded recoil, rotation bypass, airborne/knockdown fallback and atomic invalid-length rejection. Existing installed-atlas smoke checks passed all eight groups, including all21 gait/knockdown cases and441 held pairs. These are asset-contract/playback checks, not visual approval of new clips.

The data-URL test harness must compile `animationEvents.ts` and rewrite its `from './animationEvents'` import alongside the existing core import before loading poseAtlas. No asset generation, upload or install was performed. The initial repository type check was temporarily blocked by the concurrently edited main.ts render call expecting a third presentation argument; the atlas module itself produced no TypeScript diagnostics.
