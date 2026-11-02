# Vitalik.eth Ethereum projectile and defeat caption

Implemented November 2, 2026.

Vitalik.eth now throws the supplied Ethereum symbol from his hands. The symbol is held through anticipation, released with his existing ranged animation, and tumbles during flight. The original transparent PNG pixels are preserved; only transparent padding was cropped. Source and reproducible asset processing are in `art/vitalik-ethereum/`.

His defeat caption is exactly: **HarryPotterObamaSonic10Inu is not a scam**. It appears when Vitalik reaches zero health, works for either player, appears once in a double knockout, and clears when the round restarts. It remains visible through knockout and result rendering.

Projectile balance is preserved: startup 14 frames, speed 11, damage 57, and the existing four-contact special. The release anchor is 100 units forward and 100 units above his floor position. Import metadata retains the Ethereum shape when the roster assets are rebuilt.

Validation:

- `node scripts/vitalik-ethereum-smoke.mjs`: 36 facing/air/aim combinations, four hit/block outcomes, original-image rendering and rotation, held/released item, exact caption, either losing player, double knockout, and restart clearing.
- `node scripts/reference-projectiles-smoke.mjs`: 72 reference-projectile cases and eight hit/block cases pass.
- `node scripts/signature-projectiles-qa.mjs`: all 77 configured projectile owners pass.
- `node scripts/fighter-qa.mjs`: 655 cases across 131 mechanical profiles and eight trajectory/power interactions pass.
- `npm run build`, targeted `git diff --check`, and Python asset-builder compilation pass.
- Browser action viewer uses the actual combat renderer: release at age 14, flight at age 22, and zero-health defeat at age 95 inspected. Exact caption is fully visible; no browser warnings or errors. The viewer's defeat fixture now sets health to zero so health-dependent effects can be inspected.

Screenshots are saved in the chat outputs as `vitalik-ethereum-throw.png`, `vitalik-ethereum-flight.png`, and `vitalik-death-in-game.png`.
