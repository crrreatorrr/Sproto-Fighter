# Projectile budget omissions: full-screen whiff lock

Frozen simulation 373448bdc043a0e8; source SHA-256 6dbb1f97b0bdedd2d0de3f21ef694c170f1e2fbd11f8ac74d22d047dd6f4c0f4.

Stationary caster near its left legal wall. Fixed unopposed level casts. Target held above all lanes. Buffered recasts requested every other tick. Observes full-screen whiff lifetime, not expected in-match DPS.

Clash priority, crouch lanes, travel/contact, partner utility and counter-hit decisions are not priced by these observations. Classes with fewer than five actors cannot establish general balance. No geometry/art or fighter values changed.

| Effective trajectory family | Actors | Extra whiff lock min/median/max |
| --- | ---: | --- |
| ordinary | 238 | 66/77/79 |
| gravity | 2 | 20/24/24 |
| bouncing | 4 | 74/75/77 |
| beam | 1 | 0/0/0 |
| wave | 3 | 74/77/77 |
| returning | 3 | 47/72/73 |
| accelerating | 2 | 44/56/56 |
| ground | 1 | 75/75/75 |

Extra lock is the observed wait beyond first cast cleanup before a buffered recast starts. Ordinary startup/recovery threat formulas omit this state-dependent miss cost. A hit or block normally clears a shot earlier, so these whiff costs must not be mistaken for normal firing rates.

Existing rules also make beams win clashes against ordinary shots, while dual-emitter volleys split total damage across two lanes. These utilities require controlled interaction tests; packet count alone is not twice the damage and this diagnostic is not a price recommendation.
