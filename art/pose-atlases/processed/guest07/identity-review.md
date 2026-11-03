# Local identity-retouch verification

Inspected all32 current processed frames in full-body native contact and nearest-neighbor4x face views; original reference inspected before editing. Angular central red nose ridge, layered lip folds and sparse throat creases restricted to existing blue skin.

The generated head remains smaller/narrower than the original broad wrinkled face. Slot30 retains its punching body gesture; facial detail repair does not repair that cast gesture.

Reproducible script: art/pose-atlases/fix_identity_details.py, with explicit per-frame anchors in identity-details-config.json. Original imported processed frames retained under identity-baseline/. Source hashes and changed-pixel bounds recorded in identity-retouch-report.json. An immediate repeated run produced byte-identical output for all96 frames. One prior comparison observed an intervening change; parent notified to coordinate pending imports.

No original references, raw atlas sources, importer, combat timings or body pose geometry changed. Pending new mox/guest08 kick frames17/18/22/23 require coordinated baseline refresh, reapplication and visual inspection. Run with --refresh-slots only immediately after importing those new unretouched frames, not on already retouched outputs.
