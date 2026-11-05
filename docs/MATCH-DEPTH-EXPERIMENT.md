# Optional match-depth experiment

Phase 5 is opt-in while the earlier gameplay phases are evaluated. No art, atlas registration,
clip length, or default online configuration is changed.

Open `/?matchDepth` for local Fight against CPU or local versus. Matches use two round wins and a
60-second combat clock; tied timeouts replay the round. Timeout compares remaining HP percentage,
not raw HP. Entrance and defeat presentation is reused between rounds. The clock pauses during
hitstop and presentation, as well as the normal pause menu.

The flag also enables counter-hits (startup: 125% damage and six extra stun, existing hit effect
coloured orange), fractional defense meter (0.15 pip per 100 HP actually removed; 0.03 per block),
just-defend (a new back press within three frames: half blockstun rounded up and 0.08 pip), and an
eight-contact airborne juggle cap. These counters live in serialized combat state. Default rules
remain unchanged when `matchDepth` is absent.

`?matchDepth&modifier=double-meter`, `low-gravity`, `specials-only`, `sudden-death`, or
`reflect-projectiles` selects an explicit local experiment. Low gravity is 0.6. Specials-only allows
movement, dash, projectiles and Team Special and refills Team Special charge to avoid an unplayable
meter lock. Sudden death starts both at 300 HP. Ordinary projectiles reflect from guarding players;
focused beams remain unreflected. Double meter affects all meter awards.

With `?matchDepth`, the final ordinary encounter of each story chapter uses one modifier from that
cycle (in chapter order). Story encounters remain one round. The transformed cinematic boss forms
use a separate controller and keep their existing rules: this experiment does **not** claim modifier
coverage for those six forms. The HUD states the enabled rule.

Open `/?training` and choose a standing or guard dummy for the input display, remaining commitment
and uncancelled advantage readout. Commitment is the remaining move age; it differs from the next
uncancelled action, which starts one tick after move cleanup. Numeric advantage compares that
next-action timing with observed stun for grounded, stationary contacts. It does not predict
hit/block cancels or combo routes. The readout shows “—” for air/landing, dashes, pending movement,
knockdowns, throws, active Specials, live future projectile contacts and ended matches. These
contexts can change readiness or refresh stun beyond the current countdown. Record P1 route captures up to 3600 input frames relative to
P1 facing; Stop ends recording and Loop on standing dummy repeats the route relative to the dummy facing. Guard dummy supports the readout and recording; looping is disabled there because its established movement lock is preserved.
Synthetic dummy inputs are recorded in the ordinary replay input stream. The overlay draws Phase 3's
actual geometry: green hurtboxes, red active hitboxes, blue projectiles, and gray strike protection.
Rendering the overlay is tested to leave the complete simulation state unchanged. Whole-body artwork
envelopes and semantic limb contact still need separate visual review.

Replay exports include the match configuration and between-round transition frames. Input-only
playback can also advance a pending round at its next combat input. Controller state outside the
round state is preserved across round transitions. No human playtest or game-feel approval has been
performed. Browser and integration validation results belong in the final phase report.
