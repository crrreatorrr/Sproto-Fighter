# Phase 5 integrated validation

Simulation fingerprint: `7d0ce00ef52b567a`. Optional rules are selected with
`?matchDepth`; training uses `?training`. Default online match rules remain
single-round. This phase contains no artwork, atlas or clip-length edits.

All 148 unit tests, typecheck and build pass. Node and installed Chromium agree
at 130 state checkpoints across 11 matchups/rule scenarios. Exact training
geometry is tested to leave simulation state unchanged. Just-defend halves the
effective per-move blockstun, and actual chip HP loss contributes defense meter.

The default-rules fast tournament is unchanged from Phase 3: Normal/Hard mean
22.78/22.51 seconds and raw draws 0.3%/0%. Enabled-rule evidence separately runs
224 complete matches / 538 rounds across eight specified fighters (six canonical
archetypes), with no raw draws or cap exhaustion. Mean complete matches are
50.19/53.42 seconds; mean rounds 21.21/21.91 seconds. See the adjacent enabled
sample report and its compressed raw JSON/hash manifest. These are CPU
measurements, not human pacing or fairness approval.

Automated Chromium gameplay covered High Sproto against Hard Fat Head Dave with
the optional clock; Jessica versus candles and the reverse in standing-dummy
training; approach/heavy/projectile input, route recording/looping, exact overlay,
pause and replay equality. No browser errors were recorded. Static screenshots
are diagnostic evidence, not human playtesting.

A local Nakama/Postgres stack loaded the matching hub bundle. Five Goja replays
matched Node's winner, end frame and state hash exactly; mismatched/malformed
logs were rejected. Four live relay duel groups passed: wager settlement,
stopped-stream forfeits, quitting and insufficient balance. Two actual Chromium
clients then completed a hub-verified wager and rematch over the relay with
Tickets conserved and local experimental flags disabled. Direct WebRTC was not
established in this environment; the default direct-link test remains strict.

Packed-sheet verification preserved all 29,020 frames. The full runner passed
70/71 checks; its sole stale guard fixture was corrected, then the complete
sprite audit passed with 2,076,832 runtime samples, 5,588 replay scenarios and no
hard failures or art baseline changes. Three-engine CI passed for this simulation
source. Human feel/contact review, calibrated story targets and full-roster
fairness remain acceptance criteria. Transformed boss forms retain their
dedicated controller and are excluded from the optional modifier/difficulty
claims. Nothing was merged or deployed to production.
