# Final sprite correction inventory

Frozen manifest SHA-256: `c69138664410cb24409c0bf10944e29230ef677b1fe4715a89d5bde1e0f3d249`.

Exactly **19 body atlases** changed against the candidate HEAD manifest. **407 new PNG files** are referenced by the corrected runtime manifest. No original asset path was deleted. No global revision, roster membership, atlas scale, default anchor, hold-contact coordinate, or main throw-contact frame24/26 changed. All fields outside the explicitly listed sequences match HEAD structurally.

Counts below are **timing slots / distinct decoded pixel drawings**, not file names or assumptions. Existing repetitions are preserved; in particular, duo-blue main32 contains31 distinct drawings.

| Body atlas | Changed sequences (slots / distinct) | Main | Walk |
|---|---|---:|---:|
| bront | main 32/32 | 32/32 | 8/8 |
| duo | entrance 8/4; death 16/6; ranged 8/4 | 32/32 | 4/4 |
| duo-blue | entrance 8/4; death 16/6; ranged 8/4 | 32/31 | 4/4 |
| godmod3d | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| gryph-companion | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| guest12 | main 32/32 | 32/32 | 8/8 |
| nosmileclown | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto102 | ranged 8/8 | 32/32 | 8/8 |
| sproto1499-companion | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto1625-companion | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto1815 | walk 4/4; intro 4/4; special 8/8; cast 4/4; recoil 4/4; defeat 12/12 | 32/32 | 4/4 |
| sproto2616 | walk 4/4 | 32/32 | 4/4 |
| sproto2789 | walk 4/4 | 32/32 | 4/4 |
| sproto3224 | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto3224-companion | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto3235 | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto3235-companion | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto832 | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |
| sproto832-companion | dash 6/6; jump 6/6; heavy 8/8; airKick 6/6; victory 6/6 | 32/32 | 8/8 |

## New runtime files

- Jessica: `public/fighters/events/sproto1815/scale-body-128/00.png` through `31.png` —32 files,384×384, explicit root[160,300].
- Bront: `public/fighters/poses/bront/scale-fix/` —11 files replacing main slots8,9,16,17,18,19,22,23,29,30,31.
- Guest12: `public/fighters/poses/guest12/scale-fix/` —4 files replacing main slots8,9,22,23.
- Sproto102: `public/fighters/identity/sproto102/scale-fix/08.png` through `15.png` —8 files.
- Eleven reviewed bodies: `public/fighters/motion/<body>/scale-fix/00.png` through `31.png` —352 files. Bodies: sproto832, sproto832-companion, sproto3235, sproto3235-companion, sproto3224, sproto3224-companion, sproto1499-companion, sproto1625-companion, gryph-companion, godmod3d, nosmileclown.
- Bront, Guest12 and the motion/ranged repair files use416×336 canvases with explicit root[176,274]. Enlarged transparent canvases preserve complete limbs, weapons and effects.

The eleven motion sheets each retain32 distinct original pose drawings across dash6, jump6, heavy8, airKick6 and victory6. One uniform body-specific calibration applies to the entire sheet. The ranged correction retains all eight original drawings.

## Existing coherent-pose substitutions

Jessica, sun god and Retainer each use the four existing main-walk drawings2–5. Their old eight-key optional sources remain on disk; the rejected sun god/Retainer cycles included attack poses. Double Take keeps its original four-key walks because eye landmarks prove the taller stride is intentional. Its incompatible identity art is replaced by coherent whole-body source sequences: entrance8 uses four intro drawings, ranged8 uses four cast drawings, and death16 uses six defeat drawings with lying rest from phase8. Timing remains unchanged; repeated holds are explicit.

## Machine-readable evidence

- `head-structural-diff-inventory.json`: exact changed body/field set versus HEAD and invariants.
- `final-correction-inventory.json`: every replacement path, changed slot, before/after timing count, distinct decoded pixel count, and all407 new runtime asset paths.
- `merge-manifest-patch.json`, `merge-motion-manifest-patch.json`, `merge-guest12-preview-patch.json`: reviewed sidecar hashes and atomic merge records.
- `jessica-calibration.json`, `sun-god-calibration.json`, `duo-retainer-calibration.json`, and `attack-repairs/*metrics.json`: measurements, mappings, source hashes and anchor evidence.

No src/poseAtlas.ts or combat-engine changes were made by this correction pass. New source dimensions remain under the same runtime atlas scale; this addresses artwork calibration, without introducing runtime per-frame fitting.

## Final metadata verification

After the original pixel freeze, eight Sproto102 ranged contact hulls were found to retain coordinates from the unscaled images. Only those eight `contactHull` fields were replaced with convex hulls recomputed from the corrected PNG alpha. All407 PNG hashes, other entry fields, body/clip counts, scales and anchors were verified unchanged. The new manifest SHA above supersedes `05b9d297e3808dce293f84ffd4ce5549e6bb50f56a883d1ab4f3c14a062376d1`. Exact before/after fields and PNG hashes are in `sproto102-hull-correction.json`; the prior manifest is retained as `pre-sproto102-hull-manifest.json`.
