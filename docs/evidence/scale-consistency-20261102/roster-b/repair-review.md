# Independent repair review — roster B

Accepted the seven motion corrections and the sproto2789 walk remap for static size and framing. The live manifest exactly matches the reviewed replacement entries at the recorded snapshot.

Snapshot: `05b9d297e3808dce293f84ffd4ce5549e6bb50f56a883d1ab4f3c14a062376d1` at `2026-11-02T18:54:46.239458+00:00`.

Viewed all 32 corrected motion drawings per body in both facings, plus each compact before/after comparison: 224 unique corrected assets and 448 corrected cel views. These sheets preserve actual atlas scale and frame anchors. This is source-art acceptance, not live browser or temporal acceptance.

| Body | Uniform source factor | Static result | Evidence |
|---|---:|---|---|
| sproto3224 | 0.82 | Accepted: head/torso agree with core, intended poses retained | [Comparison](../attack-repairs/sproto3224-all-motion-candidate-compact.png), [all right](../attack-repairs/sproto3224-all-motion-after-right.png), [all left](../attack-repairs/sproto3224-all-motion-after-left.png) |
| sproto3224-companion | 0.87 | Accepted: head/torso agree with core, intended poses retained | [Comparison](../attack-repairs/sproto3224-companion-all-motion-candidate-compact.png), [all right](../attack-repairs/sproto3224-companion-all-motion-after-right.png), [all left](../attack-repairs/sproto3224-companion-all-motion-after-left.png) |
| sproto3235 | 0.71 | Accepted: head/torso agree with core, intended poses retained | [Comparison](../attack-repairs/sproto3235-all-motion-candidate-compact.png), [all right](../attack-repairs/sproto3235-all-motion-after-right.png), [all left](../attack-repairs/sproto3235-all-motion-after-left.png) |
| sproto3235-companion | 0.82 | Accepted: head/torso agree with core, intended poses retained | [Comparison](../attack-repairs/sproto3235-companion-all-motion-candidate-compact.png), [all right](../attack-repairs/sproto3235-companion-all-motion-after-right.png), [all left](../attack-repairs/sproto3235-companion-all-motion-after-left.png) |
| gryph-companion | 0.80 | Accepted: head/torso agree with core, intended poses retained | [Comparison](../attack-repairs/gryph-companion-all-motion-candidate-compact.png), [all right](../attack-repairs/gryph-companion-all-motion-after-right.png), [all left](../attack-repairs/gryph-companion-all-motion-after-left.png) |
| godmod3d | 0.79 | Accepted: head/torso agree with core, intended poses retained | [Comparison](../attack-repairs/godmod3d-all-motion-candidate-compact.png), [all right](../attack-repairs/godmod3d-all-motion-after-right.png), [all left](../attack-repairs/godmod3d-all-motion-after-left.png) |
| nosmileclown | 0.84 | Accepted: head/torso agree with core, intended poses retained | [Comparison](../attack-repairs/nosmileclown-all-motion-candidate-compact.png), [all right](../attack-repairs/nosmileclown-all-motion-after-right.png), [all left](../attack-repairs/nosmileclown-all-motion-after-left.png) |

All corrected PNGs were independently read back: alpha bounds end exactly at the foot anchor (floor delta 0), transparent padding is at least 62 source pixels, and all 224 original inputs retain their recorded repair-input hashes. No visible cropping or floor misalignment was found in either facing.

The current sproto2789 walk uses canonical poses 02–05. All four cels in both facings match idle head, torso and staff size, with stride poses and stable floor alignment. [Walk review](sproto2789-walk-repair-review.png).

Selected independent source-pixel landmarks corroborate the visual match. Width × height and opaque component area are shown; alpha-envelope height was not used as the scale target.

| Body / landmark | Core 0 | Corrected jump 0 | Corrected heavy 4 |
|---|---|---|---|
| sproto3235 / isolated blue head component | 53×45; area 1198 | 55×46; area 1236 | 55×42; area 1208 |
| sproto3224-companion / blue glasses component | 41×21; area 272 | 41×22; area 283 | 40×21; area 289 |
| gryph-companion / isolated blue head component | 58×57; area 1491 | 60×54; area 1470 | 60×55; area 1485 |
| godmod3d / isolated blue head component | 53×42; area 870 | 55×39; area 969 | 53×42; area 935 |
| nosmileclown / isolated blue head component | 86×45; area 1545 | 86×43; area 1570 | 87×44; area 1618 |

Exact asset paths, hashes, anchors, scales and evidence hashes are in [repair-review.json](repair-review.json). Raw measured components are in [repair-blue-components.json](repair-blue-components.json). The other two bodies have joined blue head/body components, so their acceptance rests on direct head/torso visual comparison.

Remaining coverage limits: live timing, transitions, physics offsets, reaction rotation, paired-body spacing and camera behavior were not checked here. Unselected unchanged cels on the other 70 bodies remain outside this sampled pass. The small sproto3181 companion has minor drawing-proportion variation, but no confirmed uniform scale defect. Existing gryph-companion and nosmileclown airKick action-semantic quirks are separate from size/framing and were preserved.

No unresolved size/framing blocker remains among the original eight confirmed bodies within this static review scope.
