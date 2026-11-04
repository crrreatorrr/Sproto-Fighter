# Morelight mecha explosion and ejection

Reference-guided Higgsfield generation requested to bridge the completed mecha boarding and Starstaff wizard transformation.

- Model: Seedance 2.5, 8 seconds, 720p, 4:3, high bitrate, no generated audio.
- Generation job: `e97463ff-c23a-4abc-9b42-c1237e8e74e0`.
- Initial quoted cost: 56 credits.
- Chest-bomb removal edit: `a32f68d2-b924-49a3-aea7-beff995a8538`, quoted at 61 credits. The edit changed the panel into a round light, so that edit was rejected and is not used in the runtime.
- `start.png`: closed mecha from frame 239 of the existing boarding sheet, plus 8 px vertical padding.
- `end.png`: regular Morelight at the wizard sheet's first frame, shifted 13 px horizontally and 34 px vertically to share the same origin.
- The greenscreen background is removed during export; runtime uses transparent RGBA frames, not remote video playback.

`build.py <downloaded-source.mp4>` exports 16 fps frames at 320 × 240 px, a local animated preview and a runtime atlas. The exact reference mecha replaces all intact-mecha frames (0–25), eliminating the generator’s added chest orb and white flash. The generated explosion starts at frame 26. The exact preexisting mecha/regular poses anchor the first and final frames; the last quarter-second settles into the regular pose. All mecha/ejection/wizard/flight clips use the same 1.4 world scale; the final regular pilot is approximately 158 px tall, matching the normal combat sprite.

The raw MP4 and preview are retained in the local task's `morelight-ejection-output` folder. Production acceptance requires visual inspection of the source and extracted contact sheet, browser playback and scene-order tests.
