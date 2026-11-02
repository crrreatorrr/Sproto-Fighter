# Michael: full-circle rotation and KO transformation

The existing supplied white circle icon is reused for both the ranged projectile and the KO. The latest supplied circle reference is retained as `ko-circle-reference.png`.

Ranged icon:48px, rotation in the picture plane only. Removed horizontal compression and reversal. The full circle stays face-on at every angle.

KO:when Michael reaches0HP, his body is replaced by the112px circle. An independent visual clock keeps it rotating through the KO and result screen without stepping combat or replay state. QA freeze and frame advance also control rotation. Living Michael and other fighters retain their normal body art. The RETAIN callout and projectile combat behavior remain intact.

Validation:

- `node scripts/michael-smoke.mjs`:gait,both facings,dash/jump/landing,five attacks,eight throws,special,36 ground/air/aim ranged cases,hit/block,full source image dimensions,distinct rotation angles and no scale/flip calls passed. KO selection checks cover living/defeated Michael and other fighters,including ages beyond96.
- Live browser:CPU Michael's ranged circle captured at release. Then four complete Shadow Awakening sequences defeated him through normal combat. At combat frame393,Michael0HP and outro frame0,his body was replaced with the complete white circle. Stepping20presentation frames changed its rotation while combat frame393 and fighter state remained frozen.
- Full roster QA655cases/131profiles and production build passed.

Evidence:
`/Users/kenhiraoka/Documents/Codex/2026-11-01/u/outputs/buddha-and-michael-projectiles.png`
`/Users/kenhiraoka/Documents/Codex/2026-11-01/u/outputs/michael-spinning-circle-ko.png`
