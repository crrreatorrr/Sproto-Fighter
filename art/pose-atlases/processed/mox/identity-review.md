# Local identity-retouch verification

Inspected all32 current processed frames in full-body native contact and nearest-neighbor4x face views; original reference inspected before editing. Separated tapered fangs, maroon mouth aperture and jagged lower cheek/chin edge.

Existing side-profile head still lacks the broad three-quarter cheeks and distinct far eye of the original. This detail retouch is not a complete head reconstruction. Block25 naturally occludes mouth.

Reproducible script: art/pose-atlases/fix_identity_details.py, with explicit per-frame anchors in identity-details-config.json. Original imported processed frames retained under identity-baseline/. Source hashes and changed-pixel bounds recorded in identity-retouch-report.json. An immediate repeated run produced byte-identical output for all96 frames. One prior comparison observed an intervening change; parent notified to coordinate pending imports.

No original references, raw atlas sources, importer, combat timings or body pose geometry changed. Pending new mox/guest08 kick frames17/18/22/23 require coordinated baseline refresh, reapplication and visual inspection. Run with --refresh-slots only immediately after importing those new unretouched frames, not on already retouched outputs.

Update: parent completed focused kick import. Refreshed source baselines for17/18/22/23, reapplied facial corrections, and inspected those new poses at native and4x. New kick figures retain connected limbs but have visibly smaller/differently shaped heads than surrounding old cells; this is an imported source continuity issue, not solved by facial detail retouch. Ownership released after this update.
