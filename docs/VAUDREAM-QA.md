# ᐯᕬᑌᗞᖇᕮᗋᕬ — floating machine addition

Added November 2, 2026. Runtime ID: `vaudream`. This is one legless foreground machine; the smaller character behind it in the supplied reference is excluded.

The original reference is preserved in `art/sprotos-expansion/references/vaudream.png`. Separate floating-character and floating-jobs records preserve this additive request alongside the concurrent larger roster expansion. `prepare.py` retains the machine when rebuilding the original image catalog.

Higgsfield GPT Image 2.5 Sunburst generated three completed sheets: 32 combat poses, 8 hover/glide frames, and 32 event drawings (intro 4, Dream Surge 8, cast 4, recoil 4, defeat 12). Quoted generation total: 11.25 credits. The three exact job IDs and source URLs are in `art/sprotos-expansion/floating-jobs.json`. All 72 installed drawings show a machine chassis without legs, feet, arms or humanoid torso. Attacks use chassis rams, banking and screen-facing cast attitudes. The shared engine retains its standard keyboard/controller inputs and jump mechanics.

Standing/hover drawings use source anchor y=234, giving the chassis 30 world pixels of ground clearance. Floor-defeat drawings use their opaque bottom anchor. The original asymmetric eyes, screen, buttons, top spikes and yellow grille remain recognizable in the generated pixel interpretation.

Validation passed: `node scripts/vaudream-smoke.mjs`, TypeScript checking, production build, and file checks of all 72 images for 256×256 RGBA, binary alpha and transparent edge padding. Focused checks cover both facings of the complete hover cycle, dash, jump/landing, five attack inputs, eight directional/facing throw cases, and a four-contact Dream Surge with one meter spend. Browser samples inspected hover clearance and special playback in both facings. Normalized core/event sheets were inspected separately. This does not claim exhaustive visual playback of every move or completion of the larger roster's QA.

The new character is selectable in the main game and the pose-atlas lab. Screenshot evidence is saved to the current chat's outputs as `vaudream-in-game.png`.
