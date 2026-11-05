# Within-archetype projectile subgroup observations (candidate v1)

Candidate source SHA-256 `09765d0ac9ac13df58f92265d64da80226c2a5f6ce4f327402d87513e0455b91`; SIM `ec53ae92b417d3bf`.

Frozen metadata SHA-256 `65ec8923a59081d310509cfd3439d979000001ee257b9bfc31c8459d9d0bf610`; controlled comparison SHA-256 `706c562181b2e6df373b99ac0e9972d3c978878ba0cd35d106202a73ac0d5295`.

- Within-archetype observational subgroups; shared traits overlap and original roles can confound them.
- Reverse seats are paired and only two independent seed pairs were used per matchup.
- Low actor count means fewer than five fighters, even if many bouts were recorded; do not infer a general mechanical advantage from those rows.
- Origin bins use the frozen metadata provider’s recorded front-body projectile origin, not new sprite measurements.
- Style power is recorded metadata and is not proof that the power applies to every projectile hit; runtime eligibility differs by existing mechanics.
- Height traits were read from a later template-only source snapshot; projectile roster bytes match commit c367f98c4, and unchanged traits are labeled separately from v1 simulation provenance.
- Four legacy horizontal flags differ from the effective horizontal rule (isHorizontalSpit OR raw.horizontal); the original subgroup tables preserve frozen v1 provider definitions.
- No primary release height reaches155: maximum143.75, so the hypothesized static above-standing-head miss does not occur in this roster. Height97+ can still be ducked by a crouching87-high hurtbox with10-high shot radius.
- No per-fighter bonuses or individual-ID tuning is recommended.

## Skill 4 · Footwork

### originalRole

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| APLOMB | 1 | 76 | 73.68% | 63.16% | 1→0 | 18.14% | LOW ACTOR N |
| CORSAIR | 1 | 60 | 73.33% | 66.67% | 1→1 | 25.06% | LOW ACTOR N |
| DAPPER | 1 | 72 | 63.89% | 66.67% | 0→1 | 39.34% | LOW ACTOR N |
| FOOTWORK | 22 | 1312 | 60.67% | 55.34% | 8→3 | 22.69% |  |
| FORMAL | 2 | 112 | 62.50% | 56.25% | 1→1 | 17.20% | LOW ACTOR N |
| GOLD COLLAR | 1 | 68 | 70.59% | 64.71% | 1→0 | 16.51% | LOW ACTOR N |
| POISE | 1 | 72 | 66.67% | 75.00% | 1→1 | 22.91% | LOW ACTOR N |
| QUICK | 1 | 68 | 58.82% | 64.71% | 0→0 | 30.60% | LOW ACTOR N |
| SHADOW POISE | 1 | 56 | 64.29% | 53.57% | 0→0 | 39.19% | LOW ACTOR N |
| SKIRMISH | 51 | 3180 | 69.37% | 62.37% | 38→22 | 21.01% |  |
| SLY | 1 | 56 | 73.21% | 66.07% | 1→1 | 21.12% | LOW ACTOR N |
| STEADY | 1 | 84 | 66.67% | 64.29% | 1→0 | 23.45% | LOW ACTOR N |
| SWITCH | 1 | 72 | 73.61% | 75.00% | 1→1 | 19.58% | LOW ACTOR N |

### horizontal

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 60 | 3716 | 66.42% | 59.94% | 37→19 | 21.27% |  |
| True | 25 | 1572 | 68.19% | 63.49% | 17→12 | 23.40% |  |

### beam

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 66.94% | 60.99% | 54→31 | 21.92% |  |

### ground

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 66.94% | 60.99% | 54→31 | 21.92% |  |

### stylePower

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| none | 85 | 5288 | 66.94% | 60.99% | 54→31 | 21.92% |  |

### secondaryEmitter

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 66.94% | 60.99% | 54→31 | 21.92% |  |

### frontBodyOriginBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 0–39 | 45 | 2868 | 69.70% | 63.22% | 35→21 | 20.49% |  |
| 40–79 | 26 | 1636 | 67.67% | 62.47% | 16→10 | 24.18% |  |
| 80–119 | 14 | 784 | 55.36% | 49.74% | 3→0 | 22.41% |  |

### primaryHeightBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 97–144 | 26 | 1572 | 64.06% | 59.80% | 14→9 | 21.76% |  |
| <97 | 59 | 3716 | 68.16% | 61.50% | 40→22 | 21.99% |  |

### primaryCanOverlapCrouch

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 26 | 1572 | 64.06% | 59.80% | 14→9 | 21.76% |  |
| True | 59 | 3716 | 68.16% | 61.50% | 40→22 | 21.99% |  |

### staticStandingMiss

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 66.94% | 60.99% | 54→31 | 21.92% |  |

### mechanicalProfile

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 42 | 2664 | 69.52% | 62.77% | 32→18 | 20.76% |  |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 4 | 268 | 67.91% | 61.57% | 2→1 | 23.31% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=80–119 | 14 | 784 | 55.36% | 49.74% | 3→0 | 22.41% |  |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 3 | 204 | 72.06% | 69.12% | 3→3 | 17.16% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 22 | 1368 | 67.62% | 62.65% | 14→9 | 24.35% |  |

## Skill 4 · Zoning

### originalRole

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| ACID | 1 | 64 | 34.38% | 45.31% | 1→0 | 20.35% | LOW ACTOR N |
| BARRAGE | 1 | 56 | 39.29% | 46.43% | 0→0 | 29.09% | LOW ACTOR N |
| BRIGHT EYES | 1 | 56 | 21.43% | 28.57% | 1→1 | 16.20% | LOW ACTOR N |
| DOUBLE SHOT | 1 | 48 | 41.67% | 66.67% | 0→1 | 67.66% | LOW ACTOR N |
| LASER | 1 | 68 | 23.53% | 41.18% | 1→0 | 30.00% | LOW ACTOR N |
| LASER CAPTAIN | 1 | 80 | 30.00% | 43.75% | 1→0 | 19.13% | LOW ACTOR N |
| MELANCHOLY | 1 | 56 | 55.36% | 58.93% | 0→0 | 21.56% | LOW ACTOR N |
| ORANGE AURA | 1 | 48 | 12.50% | 33.33% | 1→1 | 12.17% | LOW ACTOR N |
| PRISM | 1 | 32 | 43.75% | 50.00% | 0→0 | 15.43% | LOW ACTOR N |
| RETURN | 1 | 100 | 33.00% | 33.00% | 1→1 | 22.70% | LOW ACTOR N |
| RICOCHET | 1 | 56 | 28.57% | 21.43% | 1→1 | 34.02% | LOW ACTOR N |
| SMOKE SHOT | 1 | 76 | 10.53% | 29.73% | 1→1 | 21.37% | LOW ACTOR N |
| SPITTER | 1 | 64 | 34.38% | 57.81% | 1→0 | 12.37% | LOW ACTOR N |
| STREAM | 1 | 68 | 35.29% | 29.41% | 0→1 | 72.50% | LOW ACTOR N |
| THROWER | 2 | 140 | 34.29% | 37.86% | 1→1 | 17.27% | LOW ACTOR N |
| TWIN EMITTER | 1 | 60 | 33.33% | 30.00% | 1→1 | 69.72% | LOW ACTOR N |
| ZONING | 21 | 1336 | 26.87% | 32.93% | 15→11 | 27.61% |  |

### horizontal

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 16 | 1080 | 27.78% | 32.04% | 13→10 | 26.93% |  |
| True | 22 | 1328 | 29.89% | 39.22% | 13→10 | 30.35% |  |

### beam

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 38 | 2408 | 28.95% | 35.99% | 26→20 | 28.89% |  |

### ground

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 38 | 2408 | 28.95% | 35.99% | 26→20 | 28.89% |  |

### stylePower

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| drain | 1 | 64 | 34.38% | 45.31% | 1→0 | 20.35% | LOW ACTOR N |
| launch | 1 | 56 | 28.57% | 21.43% | 1→1 | 34.02% | LOW ACTOR N |
| none | 34 | 2132 | 27.91% | 35.63% | 23→18 | 29.57% |  |
| pull | 1 | 100 | 33.00% | 33.00% | 1→1 | 22.70% | LOW ACTOR N |
| slow | 1 | 56 | 55.36% | 58.93% | 0→0 | 21.56% | LOW ACTOR N |

### secondaryEmitter

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 36 | 2300 | 28.57% | 35.51% | 25→18 | 26.45% |  |
| True | 2 | 108 | 37.04% | 46.30% | 1→2 | 68.76% | LOW ACTOR N |

### frontBodyOriginBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 0–39 | 11 | 700 | 34.57% | 40.86% | 7→6 | 34.97% |  |
| 120+ | 1 | 56 | 10.71% | 5.36% | 1→1 | 27.67% | LOW ACTOR N |
| 40–79 | 16 | 948 | 30.49% | 39.45% | 9→5 | 24.56% |  |
| 80–119 | 10 | 704 | 22.73% | 28.92% | 9→8 | 28.18% |  |

### primaryHeightBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 97–144 | 24 | 1516 | 26.78% | 35.07% | 17→13 | 25.70% |  |
| <97 | 14 | 892 | 32.62% | 37.56% | 9→7 | 33.95% |  |

### primaryCanOverlapCrouch

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 24 | 1516 | 26.78% | 35.07% | 17→13 | 25.70% |  |
| True | 14 | 892 | 32.62% | 37.56% | 9→7 | 33.95% |  |

### staticStandingMiss

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 38 | 2408 | 28.95% | 35.99% | 26→20 | 28.89% |  |

### mechanicalProfile

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| horiz=0; beam=0; ground=0; power=drain; secondary=0; origin=0–39 | 1 | 64 | 34.38% | 45.31% | 1→0 | 20.35% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=launch; secondary=0; origin=0–39 | 1 | 56 | 28.57% | 21.43% | 1→1 | 34.02% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 1 | 56 | 39.29% | 46.43% | 0→0 | 29.09% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=120+ | 1 | 56 | 10.71% | 5.36% | 1→1 | 27.67% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 1 | 64 | 28.12% | 45.31% | 1→0 | 19.42% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=80–119 | 9 | 628 | 24.20% | 28.82% | 8→7 | 29.00% |  |
| horiz=0; beam=0; ground=0; power=pull; secondary=0; origin=0–39 | 1 | 100 | 33.00% | 33.00% | 1→1 | 22.70% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=slow; secondary=0; origin=0–39 | 1 | 56 | 55.36% | 58.93% | 0→0 | 21.56% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 4 | 260 | 30.00% | 39.62% | 3→2 | 30.86% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 15 | 884 | 30.66% | 39.03% | 8→5 | 24.92% |  |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=80–119 | 1 | 76 | 10.53% | 29.73% | 1→1 | 21.37% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=1; origin=0–39 | 2 | 108 | 37.04% | 46.30% | 1→2 | 68.76% | LOW ACTOR N |

## Skill 7 · Footwork

### originalRole

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| APLOMB | 1 | 76 | 71.05% | 60.53% | 1→0 | 11.72% | LOW ACTOR N |
| CORSAIR | 1 | 60 | 78.33% | 61.67% | 1→0 | 24.79% | LOW ACTOR N |
| DAPPER | 1 | 72 | 72.22% | 66.67% | 1→1 | 24.26% | LOW ACTOR N |
| FOOTWORK | 22 | 1312 | 60.69% | 50.99% | 8→6 | 19.78% |  |
| FORMAL | 2 | 112 | 69.64% | 55.36% | 2→0 | 11.53% | LOW ACTOR N |
| GOLD COLLAR | 1 | 68 | 55.88% | 41.18% | 0→0 | 17.43% | LOW ACTOR N |
| POISE | 1 | 72 | 80.56% | 75.00% | 1→1 | 22.25% | LOW ACTOR N |
| QUICK | 1 | 68 | 64.71% | 64.71% | 0→0 | 26.59% | LOW ACTOR N |
| SHADOW POISE | 1 | 56 | 60.71% | 50.00% | 0→0 | 28.25% | LOW ACTOR N |
| SKIRMISH | 51 | 3180 | 69.57% | 61.66% | 38→21 | 16.65% |  |
| SLY | 1 | 56 | 67.86% | 60.71% | 1→0 | 13.50% | LOW ACTOR N |
| STEADY | 1 | 84 | 75.00% | 58.33% | 1→0 | 19.26% | LOW ACTOR N |
| SWITCH | 1 | 72 | 58.33% | 58.33% | 0→0 | 15.38% | LOW ACTOR N |

### horizontal

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 60 | 3716 | 66.77% | 58.06% | 36→19 | 17.35% |  |
| True | 25 | 1572 | 68.38% | 60.05% | 18→10 | 18.70% |  |

### beam

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 67.25% | 58.65% | 54→29 | 17.76% |  |

### ground

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 67.25% | 58.65% | 54→29 | 17.76% |  |

### stylePower

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| none | 85 | 5288 | 67.25% | 58.65% | 54→29 | 17.76% |  |

### secondaryEmitter

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 67.25% | 58.65% | 54→29 | 17.76% |  |

### frontBodyOriginBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 0–39 | 45 | 2868 | 70.16% | 62.26% | 35→16 | 16.27% |  |
| 40–79 | 26 | 1636 | 67.50% | 59.05% | 17→10 | 19.61% |  |
| 80–119 | 14 | 784 | 56.12% | 44.64% | 2→3 | 19.59% |  |

### primaryHeightBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 97–144 | 26 | 1572 | 64.59% | 53.50% | 15→9 | 18.57% |  |
| <97 | 59 | 3716 | 68.38% | 60.84% | 39→20 | 17.43% |  |

### primaryCanOverlapCrouch

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 26 | 1572 | 64.59% | 53.50% | 15→9 | 18.57% |  |
| True | 59 | 3716 | 68.38% | 60.84% | 39→20 | 17.43% |  |

### staticStandingMiss

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 85 | 5288 | 67.25% | 58.65% | 54→29 | 17.76% |  |

### mechanicalProfile

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 42 | 2664 | 70.24% | 62.53% | 32→15 | 16.45% |  |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 4 | 268 | 63.53% | 52.99% | 2→1 | 20.72% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=80–119 | 14 | 784 | 56.12% | 44.64% | 2→3 | 19.59% |  |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 3 | 204 | 69.12% | 58.82% | 3→1 | 13.89% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 22 | 1368 | 68.27% | 60.23% | 15→9 | 19.40% |  |

## Skill 7 · Zoning

### originalRole

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| ACID | 1 | 64 | 31.25% | 28.12% | 1→1 | 18.83% | LOW ACTOR N |
| BARRAGE | 1 | 56 | 35.71% | 42.86% | 0→0 | 26.93% | LOW ACTOR N |
| BRIGHT EYES | 1 | 56 | 33.93% | 39.29% | 1→0 | 15.64% | LOW ACTOR N |
| DOUBLE SHOT | 1 | 48 | 45.83% | 66.67% | 0→1 | 77.23% | LOW ACTOR N |
| LASER | 1 | 68 | 35.29% | 44.12% | 0→0 | 25.36% | LOW ACTOR N |
| LASER CAPTAIN | 1 | 80 | 33.75% | 50.00% | 1→0 | 18.11% | LOW ACTOR N |
| MELANCHOLY | 1 | 56 | 42.86% | 55.36% | 0→0 | 18.37% | LOW ACTOR N |
| ORANGE AURA | 1 | 48 | 18.75% | 41.67% | 1→0 | 13.03% | LOW ACTOR N |
| PRISM | 1 | 32 | 50.00% | 31.25% | 0→1 | 16.99% | LOW ACTOR N |
| RETURN | 1 | 100 | 19.00% | 49.00% | 1→0 | 18.17% | LOW ACTOR N |
| RICOCHET | 1 | 56 | 42.86% | 39.29% | 0→0 | 30.26% | LOW ACTOR N |
| SMOKE SHOT | 1 | 76 | 21.05% | 19.74% | 1→1 | 28.47% | LOW ACTOR N |
| SPITTER | 1 | 64 | 32.81% | 51.56% | 1→0 | 10.90% | LOW ACTOR N |
| STREAM | 1 | 68 | 29.41% | 26.47% | 1→1 | 69.77% | LOW ACTOR N |
| THROWER | 2 | 140 | 24.29% | 43.57% | 2→0 | 16.51% | LOW ACTOR N |
| TWIN EMITTER | 1 | 60 | 43.33% | 43.33% | 0→0 | 78.45% | LOW ACTOR N |
| ZONING | 21 | 1336 | 28.46% | 38.76% | 18→7 | 24.58% |  |

### horizontal

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 16 | 1080 | 28.44% | 38.80% | 12→4 | 23.85% |  |
| True | 22 | 1328 | 31.19% | 41.40% | 16→8 | 29.48% |  |

### beam

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 38 | 2408 | 29.96% | 40.23% | 28→12 | 26.99% |  |

### ground

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 38 | 2408 | 29.96% | 40.23% | 28→12 | 26.99% |  |

### stylePower

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| drain | 1 | 64 | 31.25% | 28.12% | 1→1 | 18.83% | LOW ACTOR N |
| launch | 1 | 56 | 42.86% | 39.29% | 0→0 | 30.26% | LOW ACTOR N |
| none | 34 | 2132 | 29.76% | 39.81% | 26→11 | 27.82% |  |
| pull | 1 | 100 | 19.00% | 49.00% | 1→0 | 18.17% | LOW ACTOR N |
| slow | 1 | 56 | 42.86% | 55.36% | 0→0 | 18.37% | LOW ACTOR N |

### secondaryEmitter

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 36 | 2300 | 29.28% | 39.60% | 28→11 | 24.10% |  |
| True | 2 | 108 | 44.44% | 53.70% | 0→1 | 77.89% | LOW ACTOR N |

### frontBodyOriginBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 0–39 | 11 | 700 | 32.43% | 43.00% | 6→3 | 34.48% |  |
| 120+ | 1 | 56 | 19.64% | 33.93% | 1→1 | 19.89% | LOW ACTOR N |
| 40–79 | 16 | 948 | 30.83% | 43.13% | 12→5 | 22.26% |  |
| 80–119 | 10 | 704 | 27.14% | 34.09% | 9→3 | 26.35% |  |

### primaryHeightBin

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 97–144 | 24 | 1516 | 28.97% | 39.89% | 20→7 | 23.76% |  |
| <97 | 14 | 892 | 31.64% | 40.81% | 8→5 | 32.28% |  |

### primaryCanOverlapCrouch

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 24 | 1516 | 28.97% | 39.89% | 20→7 | 23.76% |  |
| True | 14 | 892 | 31.64% | 40.81% | 8→5 | 32.28% |  |

### staticStandingMiss

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| False | 38 | 2408 | 29.96% | 40.23% | 28→12 | 26.99% |  |

### mechanicalProfile

| Shared subgroup | Fighters | Fighter-bout observations | Before | Candidate v1 | Outside 35–65%, before→after | Projectile share, v1 | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| horiz=0; beam=0; ground=0; power=drain; secondary=0; origin=0–39 | 1 | 64 | 31.25% | 28.12% | 1→1 | 18.83% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=launch; secondary=0; origin=0–39 | 1 | 56 | 42.86% | 39.29% | 0→0 | 30.26% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 1 | 56 | 35.71% | 42.86% | 0→0 | 26.93% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=120+ | 1 | 56 | 19.64% | 33.93% | 1→1 | 19.89% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 1 | 64 | 21.88% | 48.44% | 1→0 | 16.99% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=none; secondary=0; origin=80–119 | 9 | 628 | 27.88% | 35.83% | 8→2 | 26.15% |  |
| horiz=0; beam=0; ground=0; power=pull; secondary=0; origin=0–39 | 1 | 100 | 19.00% | 49.00% | 1→0 | 18.17% | LOW ACTOR N |
| horiz=0; beam=0; ground=0; power=slow; secondary=0; origin=0–39 | 1 | 56 | 42.86% | 55.36% | 0→0 | 18.37% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=0–39 | 4 | 260 | 27.69% | 38.08% | 4→1 | 29.26% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=40–79 | 15 | 884 | 31.48% | 42.74% | 11→5 | 22.66% |  |
| horiz=1; beam=0; ground=0; power=none; secondary=0; origin=80–119 | 1 | 76 | 21.05% | 19.74% | 1→1 | 28.47% | LOW ACTOR N |
| horiz=1; beam=0; ground=0; power=none; secondary=1; origin=0–39 | 2 | 108 | 44.44% | 53.70% | 0→1 | 77.89% | LOW ACTOR N |
