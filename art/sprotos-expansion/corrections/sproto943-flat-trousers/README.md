# Sproto #943 — trouser contour correction

2026-11-02. Removed the rounded protruding crotch shape from the existing #943 sheets. The edit retains the blue body/trousers, red top/cape/shoes, yellow hair, face and existing pose order. This is an appearance correction, not a new moveset or animation system.

## Scope and provenance

- Built-in image editing produced the three corrected sheets in `raw/`. No Higgsfield credits were used for this correction.
- Existing `art/sprotos-expansion/process.py` normalized those sheets into 32 combat, 8 walking and 32 event frames. All three normalization reports returned zero issues.
- `install_correction.py` copies only the 72 #943 runtime frames and corresponding processed authoring assets, then narrowly updates #943's frame metadata in `public/fighters/pose-atlas.json` and its revision string. Other fighter entries are preserved.
- Existing scale, anchors, gait settings, hold-contact coordinates and event frame order/count are retained. Combat source and timing were not edited for this correction. Frame bounds/contact hulls were recomputed from the corrected pixels.
- Original reference and original Higgsfield source sheets are untouched. Local pre-edit runtime backups are in the sibling workspace folder `sproto943-correction/before/`. This folder contains the old configuration and SHA-256 fingerprints needed to detect concurrent changes before reapplying.
- Normal expansion installation reuses the corrected processed frames. Forced regeneration of #943 from the old source sheets can overwrite the correction; review/reapply explicitly. The processed folders contain `local-edit.json` provenance and retain their original base-job marker.

## Verification actually performed

- `npm run check`: passed.
- `npm run build`: passed.
- `python3 art/sprotos-expansion/corrections/sproto943-flat-trousers/verify_correction.py`: passed all 72 images, dimensions, hard alpha, exact bounds, no edge clipping, runtime/source hashes, manifest paths and preserved configuration.
- Browser at `http://127.0.0.1:5173/art/pose-atlas-lab.html`: inspected all 32 core poses on the four frame pages; sampled live walk, medium kick contact, heavy strike, jump/fall and ranged-power states with mirrored facing panels. The corrected contours are present.
- Browser event lab: intro, special, left-facing cast/recoil and standing defeat through final floor-rest frame were played and sampled. All five complete clips loaded. This is sampled visual verification, not every intermediate frame in both directions.
- Actual game at `http://127.0.0.1:5173/`: selected #943, started a practice match on Amber Ranch, inspected idle and movement at gameplay scale.
- Original image was inspected directly. The event lab reports `Original reference mapping unavailable` for this expansion entry; it does not show the reference beside the animation. That lab limitation is unrelated to this clothing edit and remains.

Browser evidence is in `evidence/`. This pass does not certify all combat interactions or the rest of the expanded roster. The correction is local in the shared authoring checkout and has not been committed, pushed or merged.

## Reapply and verify

From the repository root:

```sh
python3 art/sprotos-expansion/corrections/sproto943-flat-trousers/install_correction.py
python3 art/sprotos-expansion/corrections/sproto943-flat-trousers/verify_correction.py
```

The installer stops if #943 files or configuration differ from both the recorded pre-edit version and this reviewed correction. Inspect concurrent work instead of bypassing that guard.
