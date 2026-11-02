# Sproto #1601 — yellow 8 throw

Implemented November 2, 2026. The normal ranged-power control (I) now throws a bright yellow numeral 8. It is visible in the actor's hands during the two windup poses, then launches from the reviewed open-hand point in cast cel14: source [174,126], world +77.5 forward / 105 above the foot anchor. The full-body release cel stays visible for eight animation frames while the digit clears the hand; combat timing remains at 15-frame startup, 27-frame recovery, 12px/frame travel and 56HP damage.

The numeral uses the existing Canvas pixel-motif system, with a dark outline, yellow fill/highlight/shadow and two transparent holes. A small wobble keeps it readable. Aimed travel supports the existing directional controls; the glyph stays upright in every trajectory. The roster description, THROWER role and generated-install metadata describe the new power. The existing special partner remains sproto3152.

Focused tests pass 36 ground/air/facing/directional-aim cases, four hit/block outcomes, crouch evasion, hand emission, numeral rendering and visible throw follow-through. Morelight egg regression passes. The full roster power/profile regression and production build also pass. Expansion installer Python syntax compiles.

Browser freeze QA inspected the held 8 at frame11, the hand release and free-flight 8 at frame18, and one 56HP impact at frame49. Screenshots: 1601-yellow-8-windup.png and 1601-yellow-8-throw.png.

PASS: 510 per-fighter cases, 102 unique mechanical profiles, 8 trajectory/power interaction checks.

✓ built in 4.34s
