# Sproto #3215 — clean color revision

Completed November 2, 2026. The user confirmed the requested fighter is #3215.

Cleaned all 72 frames: 32 combat poses, 8 walk frames and 32 event drawings. The hero design retains its green swept head, blue eyelids, yellow face/body, red costume details and black cape with red lining. Higgsfield GPT Image 2.5 Sunburst cleaned each approved atlas, followed by shared undithered palette normalization for production assets.

The previous neutral sprite used 5,716 distinct opaque colors, including 4,981 singleton shades. Every installed cleaned frame now uses at most 24 colors from the same explicit palette. Color normalization preserves the new normalized silhouette alpha exactly; all PNGs retain hard transparency and padded 256×256 canvases. No smoothing was added. The enlarged before/after preview demonstrates the flatter fills and reduced colored edge noise.

Reviewed all three contact sheets and an enlarged neutral comparison. Actual browser practice loaded #3215 and sampled keyboard walking/punching. Focused QA passed the full gait in both facings, dash/jump/landing, five attacks, eight directional throws, four-contact special and exact preservation of existing name/kit/gameplay values. Manual playback is sampled rather than exhaustive.

PASS: 510 per-fighter cases, 102 unique mechanical profiles, 8 trajectory/power interaction checks.

Build: ✓ built in 2.51s

Prompts, completed Higgsfield jobs, original sheets, fixed palette, per-frame palette report, previous installed art and current normalized sources are in art/sproto3215-clean-colors. Canonical expansion sources/latest-job records are synchronized. To reproduce the palette stage, run that directory's process.py before install.py.

Evidence in this chat outputs: 3215-color-comparison.png and 3215-clean-colors-in-game.png.
