# Virtuagram four-pupil correction

2026-10-31. All current 32 processed poses were retouched using `art/pose-atlases/fix_virtuagram.py` and explicit per-frame eye polygons/pupil coordinates in `art/pose-atlases/fix_virtuagram.json`.

Each eye now has two distinct dark pupils separated by white. Edits are confined to the existing eye interiors; yellow spectacle surrounds, head outline, body and alpha are unchanged. Half-lidded slots21/27 use manually selected eye bounds and preserve the lowered lids. The tiny pupils use a deliberately simple dark pixel-oval construction; original large-image highlights are not reproduced at this scale.

Inspected all32 poses in both orientations (64views) at native whole-sprite size and4x enlarged faces, using `eye-audit-{0,1,2,3}-native.png` and `eye-audit-{0,1,2,3}-4x.png`. Four pupils are readable across these views; half-lidded eyes are understandably more compressed. This is static identity-retouch verification, not animation approval or final browser raster verification.

Practical checks: all32 frames preserve every pixel outside their explicit eye polygons; alpha unchanged; a second script run produced identical hashes for every frame. Total changed pixels:6892. Unretouched backups are in `eye-retouch-originals/` for reproducibility.

Pending replacement kick poses17,18,22,23 need new eye-coordinate review when imported. Default script deliberately uses saved original frames for idempotence: after replacing a pose, update its JSON coordinates and use `--refresh 17 18 22 23` to accept those fresh sources. Until then, `--skip 17 18 22 23` preserves replacements. Never refresh from an already-retouched frame. No public-installed files were changed by this task.

## Replacement kick follow-up

Replacement slots17,18,22,23 were subsequently imported by the parent. Inspected their actual unretouched pixels, replaced only those four coordinate records, refreshed their original backups with `--refresh 17 18 22 23`, then retouched. Inspected updated `eye-audit-2-native.png` and `eye-audit-2-4x.png` in both facings. All four retain two separate pupils in each eye with exterior face outlines preserved. Narrower replacement eye interiors use2px-wide pupils where necessary.

These replacements have coherent kick silhouettes, but their heads appear approximately20%smaller than adjacent original chamber/recovery16/19. That proportion discontinuity remains a motion-review concern independent of the completed pupil correction. The former pending-replacement warning above is now historical for these four current files; future replacements still require fresh coordinates/backups.
