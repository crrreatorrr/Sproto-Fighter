# Morelight — egg spit

Implemented November 2, 2026. Morelight (runtime ID vela) now fires a tumbling white/cream pixel egg with the normal ranged-power control, I. It uses the existing mouth-spit cast animation and explicit mouth origin +59 forward / 103 above the foot anchor. The egg travels horizontally at 12px/frame with 11-frame startup, 20-frame recovery and 62HP damage on an unblocked hit.

The egg is authored in the existing Canvas pixel-motif system: dark outline, cream shell, tan shadow and white highlight, drawn as hard 2px blocks with age-driven tumble. Morelight's roster description and move signature now describe egg spit.

Focused QA passed 36 ground/air/facing/directional-input cases, four hit/block outcomes, crouch evasion in both facings, repeated casts and egg rendering. Browser freeze QA confirmed an egg at frame11, its tumble/travel at frame15, and one 62HP impact at frame46. Production build and full roster checks pass.

PASS: 510 per-fighter cases, 102 unique mechanical profiles, 8 trajectory/power interaction checks.

✓ built in 4.70s

Screenshot in chat outputs: morelight-egg-spit.png.
