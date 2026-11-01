# Optional whole-body walk sequences

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

`getPoseAtlasDebug()` adds `sequence` (`"poses"` or `"walk"`), zero-based `frameIndex`, and `sequenceLength`. Its `slot` and `name` still describe the compatible main pose slot. The lab prints both sequence selection and main pose slot. `drawPoseAtlasSample(..., slotOverride)` explicitly shows the requested main slot; omitting the override uses current sequence playback.

Optional medium/kick sequences are not implemented. Ground medium continues to use the existing main poses and actual `getMove()` timing. Sequence support alone does not establish that any supplied gait has correct anatomy, foot planting, depth alternation, or visual continuity; those require inspecting the installed frames and live motion.

## Current contact and idle corrections

The installed manifest also supplies optional `holdContact: { hand: [x,y], torso: [x,y] }` source-pixel points, individually inspected for reaching pose26 and victim hit pose24. A bounded presentation offset brings the victim torso to the reaching hands at initial latch. Forward holds retain this correction; other directions fade it while the core lift/arc takes over. Forward releases blend the offset out over eight simulation frames. World positions, collisions, damage and replay state are unchanged. This is a contact correction, not separately authored paired throw animation.

Medium recovery now uses a brief half-extension, chamber, planted recovery and guard instead of inserting the deep crouch/landing pose. Neutral idle timing restarts at guard after movement/actions; it no longer selects a different breathing pose immediately based on the global match clock. Rendering rounds world translation to whole pixels. All of these remain presentation choices; combat move timing is unchanged.
