# Gameplay fixture updates

`gameplay-balance.json` pins effective numeric expectations independently of the
historical `art/**/before-gameplay.json` snapshots. The latter remain unchanged.

After Phase 2, Footwork speed is 6.2 and its projectile recovery is 18; Zoning
recovery is 21; Weapon recovery is 22. The existing threat formula consequently
gives Footwork shots 45 damage, Zoning shots 43, Weapon shots 53 and Counter
shots 48. Startup, projectile artwork, release points and trajectory contracts
remain covered by the named fighter scripts.

The fixture also pins all eight templates and their effective ranged moves.
`lib/gameplay-fixtures.mjs` checks these fixed numbers before projectile contact
tests use `getMove()` for their expected hit and 12% guarded-chip outcomes.
Stationary focused beams retain zero travel velocity.

Phase 3 makes guard chip nonlethal and gives crouching an explicit 87-unit
hurtbox. The Sun God staff-tip shot now intersects that box; crouch alone is not
an evasion. High beam/eye/egg/hand lanes retain duck checks. Michael's slower
coin needs a 100-tick contact window against a retreating guard instead of 65.

The duo CPU Special reach fixture now advances real ticks to fill the bot's
observation queue and tests Hard decision pulses inside/outside the same root
range; it no longer assumes an instantaneous CPU response. Artwork, pose slots,
paired identities, throw grips and playback checks remain in place.
