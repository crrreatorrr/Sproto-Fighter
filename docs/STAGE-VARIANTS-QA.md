# Approved stage variations — story integration

The 24 supplied v2 PNGs are installed unchanged under `public/stages/variations-v2`. SHA-256 hashes and original dimensions are recorded in its manifest. The source pack and all existing backgrounds remain intact. No images or videos were generated, and no credits were used in this integration pass.

`src/stageVariants.ts` maps scenery in contiguous regional blocks without altering opponent order or saved encounter IDs: Trenches → ranch outskirts; city gate → city interiors; yacht pier → deck → salon; castle halls → crown relay; cosmic Verse locations. Bar and Hatchery retain their existing backgrounds. The canonical 100-encounter route now selects these locations at actual story launch. Free play clears that override and retains its selected original arena.

## Observed checks

All 24 locations were rendered in the actual browser review page with the installed Duo and Morelight sprites at the unchanged y=578 combat floor, at the center and both arena edges. All eight full-page screenshots were individually inspected; fighters have visible solid ground beneath their feet and remain readable. No stage-specific floor remap was needed. These are placement checks, not a full fight on every background. One sampled city/yacht walking playback was also captured; no claim is made of continuous video review. Evidence: `docs/evidence/stage-variants/`.

`node scripts/stage-variants-smoke.mjs` passed asset/hash/dimension checks, deterministic mapping of all 24 locations across a 100-encounter fixture, unchanged save/opponent IDs, Bar/Hatchery fallback, and deduplicated loading. `npm run check` passed. The canonical-route test verifies all 24 locations are used, and the actual main launch-hook test verifies story assignment and free-play clearing. In-browser, the first Halloween 2008 encounter loaded Drainage floodgate; keyboard movement, jump, air light, medium, ranged and Team Special were observed there with health/recoil diagnostics. Other backgrounds have placement review, not a full browser fight on each.

## Loading

The animation manifest was minified from 12,764,981 to 2,299,857 bytes with parsed equality asserted. Two old preview pages had invalid TypeScript identifiers; their imports now match the existing exports. Local asset transfers were still slow during verification: the manifest took 9.59 seconds; a 5.6 MB PNG hit the 15-second measurement timeout after 3.7 MB. Browser loading subsequently completed; this is a measured delay, not a resolved performance claim.
