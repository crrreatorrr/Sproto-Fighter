# Scale correction provenance

These three deterministic Pillow/NumPy scripts reproduce the 375 Bront, Obama, motion and ranged PNG corrections from preserved source pixels and frozen `repair-inputs.json`. They write correction PNGs and sidecar/evidence files; they do not install the manifest. Run only when deliberately reproducing this repair. macOS Menlo is used for evidence labels.

Jessica’s additional 32 cells and the coherent-walk/twin sequence mappings are documented in `docs/evidence/scale-consistency-20261102`; original assets remain in place. The source body’s calibrated scale stays constant throughout each motion sheet.

Automated verification: `npm run sprite-scale-qa`. Anatomy and timing still require the explicit visual workflow in `docs/SPRITE-SCALE-WORKFLOW.md`.
