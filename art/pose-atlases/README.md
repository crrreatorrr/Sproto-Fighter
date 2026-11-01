# Installed complete-body pose assets

The runtime source of truth is `../../public/fighters/pose-atlas.json` and the PNGs it references. The 32-slot contract is in `../../src/poseAtlas.ts`. Each installed image is RGBA 256×256, usually anchored at 112,210 with scale 1.25. All 21 fighters have32 main entries plus 8 guarded-step entries. Four main entries duplicate selected step images.

These are Higgsfield-generated whole-pose drawings with local corrections, plus locally baked footwork from each neutral sprite. They are not generated animation videos or a complete hand-drawn animation production. Current coverage and limits: `../../docs/SPRITE-REWORK-QA.md`.

## Source and processing records

- `raw/`: preserved whole-pose and focused correction sheets; `generations.json` and `corrections.json` record available job/source URLs. The earlier Morelight pilot/source is preserved in raw files and its processed metadata.
- `import_atlas.py`: connected-component extraction and normalization. Preserves full connected shapes/overhang instead of blindly cutting through fixed grid boundaries. Import output requires visual inspection.
- `processed/<fighter>/`: normalized PNGs, metadata, correction baselines and review strips. Some early contact sheets are historical; use current individual files and dated QA reports for final state.
- `restore_ground_kicks.py`: restores only17/18 for six inspected fighters, preserving all other image hashes; retains targeted shoes/identity work.
- `restore_consistent_kicks.py`: restores17/18/22/23 for VAMP, Nate and Virtuagram; retouches VAMP footwear and Virtuagram pupils.
- `fix_identity_details.py`, `identity-details-config.json`: local face corrections for Yannix, Juicy and Yoyo from preserved baselines.
- `fix_virtuagram.py`, `fix_virtuagram.json`: explicit eye masks/four-pupil placement. Some poses partially occlude the eyes intentionally.
- `fix_air_head_scale.py`: isolated, neck-anchored Rivet/Yannix22/23 head correction. Reports assert no changes outside old/new head-mask union.
- `fix_rune_sweep_foot.py`, `rune-sweep-foot-patch.json`: exact inspected pixel patch replayed from a SHA-checked baseline.
- `author_textured_steps.py`, `walk-authoring.json`: current eight-frame guarded footwork. Source hash gates and individual cut lines preserve each neutral body's feet/shading; Jahon keeps the coat hem intact. `author_walks.py` is a rejected flat-polygon draft and is **not** the installed walk.
- `throw-contact.json`: inspected source-pixel hand 26 and torso 24 points, also installed as `holdContact` in the public manifest. Runtime applies bounded presentation offsets; this data does not create paired throw art.
- `autosprite-attempts.json`: three failed external animation jobs. No outputs from those jobs are installed.

## Validation and safe editing

```sh
python3 art/pose-atlases/verify_pose_assets.py
node scripts/pose-atlas-smoke.mjs
npm run build
```

Do not rerun a bulk importer over the installed files without preserving subsequent corrections. Several corrections deliberately restored original cells because an entire replacement body had changed scale. Scripts write the paths described in their headers; some only update processed files, while restoration/head/foot scripts also synchronize public copies. Inspect those destinations before running. Source PNGs and baseline copies permit local reproduction of each targeted fix; a clean one-command art rebuild is not provided.

After changing images or contact data, increment the public manifest revision, load the review lab and inspect the affected character/action at actual runtime scale in both facings. `--install` on the footwork script copies its reviewed output but does not imply visual approval. The game itself fetches only local files and needs no Higgsfield connection.

## November1 pelvis follow-up

`author_textured_steps.py` now supports `pinPelvis` and `reachLimit`. Eight observed problem silhouettes use individually inspected cut lines: Vela184, Bront170, Yoyo182, Sprotel182, Obama181, Jahon192, Mandela174 and BigSwole176. The baker preserves source pixels through that join, uses the actual source hip center and applies zero displacement at the join with smoothstep growth toward the foot. This removes the central split artifacts without painting over the leg gap. The other13 configs remain unchanged after individual inspection.

Installed revision is `whole-pose-pelvis-4`. Running a subset updates only those fighters; do not infer full roster review from a subset report. Main slots2–5 duplicate gait0/2/4/6. These are baked guarded steps, not a generated walk video or a guarantee of world-space foot locking.
