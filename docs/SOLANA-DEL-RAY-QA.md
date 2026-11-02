# Solana Del Ray — 2 November 2026

One playable twin selection, `solanadelray`, with two independent bodies:

- Red lead: `solanadelray`, red forelock, large round yellow eyes, broad red muzzle, two nostril dots and blue chin band. Opaque red athletic clothing extends the cropped reference.
- Blue partner: `solanadelray-companion`, periwinkle blue body, huge projecting yellow eyes, yellow muzzle, red smile and yellow rear horn/spike.

The source background and watermark are excluded from the fighter sprites. The original supplied image remains available as the reference portrait.

Each body has **104 full-body drawings**: 32 combat poses, eight guarded walking frames, 32 event drawings and 32 additional motion drawings. The pair totals **208** installed drawings. Event clips cover entrance (4), special (8), mouth-spit (4), recoil (4), and collapse/side-lying rest (12). Additional motion includes dash (6), jump (6), heavy kick (8), aerial kick (6) and victory (6).

The two bodies share one health pool, preserve fixed world-side positions, and alternate special contacts. **SUNSET SERENADE** uses four contact beats at frames 13, 25, 39 and 53. The red body renders at scale 1.15 and the larger blue body at 1.3; spacing is 136 world pixels. Standing spit uses separate reviewed mouth anchors for the front body in each facing. The selection is immediately playable in free play without altering saved campaign progress.

Artwork was generated through Higgsfield, primarily GPT Image 2.5 Sunburst at high quality (4K combat/events/motion, 2K walking). Raw sheets, accepted/rejected job receipts and normalized frame reports are retained in `art/solanadelray/`. The accepted face revision updates combat, walking and acrobatic drawings to better match the broad round muzzle and yellow eyes. The original approved event drawings remain in use: later candidates changed body proportions, omitted floor poses or altered facial colors. GPT Image 2.5 and FLUX 3 editing candidates, including rejected results, remain in a separate `face-revision/` directory with explicit review verdicts.

## Checks

- `node scripts/solanadelray-smoke.mjs`: **25** focused runtime cases, covering the eight-frame gait in both facings, dash/jump/landing, five attacks, six directional cast inputs, confirmed projectile impacts in both facings, eight directional throws, four-contact special and actual entrance/cast/death selection.
- `node scripts/fighter-qa.mjs`: **650** cases across **130** mechanically distinct profiles, plus eight trajectory/power interactions, passed at this review snapshot.
- `node scripts/paired-wall-motion-smoke.mjs`: **7,600** checks, zero silhouette bleed beyond arena edges.
- `npm run build`: passes.
- All 208 sprites validate as 256×256 RGBA, binary alpha and unclipped bounds. All eight accepted core/walk/event/motion sheets received visual review.

Browser checks on the actual game: custom entrance; blue front-body spit release at frame 18; one 64 HP projectile impact; jump and aerial-heavy at frame 61. The final animation viewer selected authored defeat frame 11/11 in both facings, with both bodies lying fully on the floor. All 208 installed frame URLs return PNG data on the user dev server. Final browser warnings/errors: none. Final screenshots are retained with this chat's outputs. The normal dev server's static-file inventory was refreshed after new files were installed.

Installation is scoped to this fighter's assets, roster/kit/grip/portrait entries and twin registration. Existing source changes and other fighters' assets are preserved. The pair registration lives outside bulk-generated expansion blocks so subsequent imports retain it.
