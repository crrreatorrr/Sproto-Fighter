# sprot.eth

Added the supplied reference as one playable free-play fighter (`sproteth`). The original portrait is retained. Cobalt swept head, enormous yellow eyes, red smiling lips, yellow lower jaw, black outfit and thick gold collar are consistent throughout.

Higgsfield GPT Image 2.5 Sunburst, high quality: four reviewed sheets. Core/events/identity at 4K; walking at 2K. Full source jobs, prompts and originals are retained in this directory. A shared undithered 16-color palette preserves the generated silhouettes and binary alpha.

104 installed drawings: 32 combat, 8 walking, 32 events and 32 identity (entrance 8, mouth-spit 8, defeat 16). All are 256×256 RGBA, with transparent margins and bounds matching the manifest. Installed files exactly match reviewed frames. No clipping detected. The defeat ends side-lying, head left and feet right.

The custom entrance adjusts the gold collar and greets the opponent. Ranged release frame12 has its mouth lip at canonical [157,126], giving the engine origin forward56.25/height105 at scale1.25. A straight gold ring projectile releases at startup17. The four-contact Golden Greeting special follows current combat guidelines.

Validation on 2026-11-02:

- `node scripts/sproteth-smoke.mjs`: passed 104-frame contract, all entrance/ranged/death frames, gait in both facings, dash, jump/landing, five attacks, eight directional throws, four-contact special, 36 ground/air/facing/aim mouth-spit cases, exact release/spawn, single hit/block and recovery.
- Asset audit: all104 reviewed files installed; binary alpha, correct dimensions/bounds/padding and shared16-color palette.
- `node scripts/fighter-qa.mjs`: passed645 cases,129 unique profiles and8 trajectory/power interaction checks.
- `npm run build`: passed TypeScript and Vite build.
- Live browser: selected sprot.eth for P1 against a standing dummy. Verified entrance, forward/back movement and jumping. Stepped ranged release at t17; gold ring exits the mouth. The shot hit once for62HP (rival1000→938) and recovered to neutral.

Gameplay evidence: `/Users/kenhiraoka/Documents/Codex/2026-11-01/u/outputs/sprot-eth-in-game.png`.

The running local Vite server's asset index was refreshed so newly installed sprites load at port5173.
