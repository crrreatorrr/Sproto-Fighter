# Phase 3 integration checkpoint

The combined simulation uses numeric move rectangles and standing/crouching/air
hurtboxes, with exposed active/recovery limbs. It includes per-move blockstun,
12% nonlethal chip, seven-tick throw breaks, projectile clashes and three-tick
strike protection on rise. Throw damage is 90; authored grips are unchanged.

The plan supersedes #22's arena-wide, unguardable Team Special behavior:
Specials now have finite forward/vertical rectangles and can be guarded. The
newer active-caster immunity is retained. Chip is nonlethal by default in all
modes; an explicit serialized `chipKO` rule can enable lethal chip. No hidden
story health/damage bonuses are introduced.

All 131 integrated unit tests, typecheck and build pass. Node/installed
Chromium agree at 100 determinism checkpoints. Focused fixture reruns cover
the normalized projectile values, chip, finite Special reach, paired actors,
movement, throws and image/identity contracts. Historical `art/` expectations
remain unchanged; the updated numeric fixture has a separate change record.

The same fast schedule yields mean Normal/Hard bouts of 22.78/22.51 seconds,
versus 30.51/31.83 before geometry/defense. Raw draws are 0.3%/0%. This is not a
human pacing or fairness approval. The observer includes actual chip HP loss.

Offline measurement covers 6,096 scenarios and 29,938 active samples through
the actual renderer, using existing contact hulls or explicitly counted alpha
fallbacks. These whole-body envelopes support review; they do not identify a
semantic fist/blade region or automatically approve the provisional rectangles.
Directional variants, real-match visual contact, human feel, broad final audits
and three-engine CI remain separate requirements.
