# sun god — solar ranged attack and roster names

Completed November 2, 2026. Sproto #2616 is now sun god and casts a golden solar disc with eight rotating rays using I. The sun launches from the curled staff tip, matching the existing staff release pose. Reviewed source point [238,146] maps to world +157.5 forward and 80 above the foot anchor. The projectile preserves the existing 16-frame startup, 11px/frame speed and 58HP unblocked damage, with directional aiming.

The custom sun uses the existing Canvas pixel-power system. Generic ranged pose/projectile overrides are excluded for this character so the authored staff cast and sun stay paired. Identity-action profiles/audit and expansion installation metadata retain the requested custom power.

Focused validation passed 36 ground/air/facing/aim cases, four hit/block outcomes, crouch evasion, staff-tip emission, rotating sun rays and cast follow-through. Browser QA sampled the CPU sun god firing left at combat frame18, with its sun visible clearing the staff tip. Hit outcomes were verified in deterministic tests. No campaign progression was changed for browser testing.

PASS: 635 per-fighter cases, 127 unique mechanical profiles, 8 trajectory/power interaction checks.

Build: ✓ built in 7.34s

| Sproto | Name |
|---|---|
| #2789 | retainer |
| #2616 | sun god |
| #2569 | Clownie |
| #3235 | Cyclops and Joey |
| #3224 | Comedy Club |
| #3215 | Captain Green |
| #2531 | Sproto Gremlin |
| #2381 | Catso |
| #2322 | Whitey |
| #2210 | Suburban Couple |
| #2177 | Spronic |
| #2101 | The Jay |
| #2075 | Twinners |
| #2010 | Tartarian Soldiers |
| #1815 | Jessica |
| #1668 | Goldie |

Screenshot: sun-god-sun-attack.png.
