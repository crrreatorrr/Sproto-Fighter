# Gameplay measurement

The source plan is `docs/GAMEPLAY-PLAN-20261105.md`, copied unchanged from
`3f1b1234`. Phase 0 measures the integration baseline `209f16eec`, including
the merged Story campaign and Partner Select changes from PR #22. PRs #17–21
remain open drafts but all their heads are ancestors of this baseline. PR #23
is concurrent cinematic work and is excluded from this task.

```sh
npm run balance -- --fast --out docs/balance/fast
npm run balance -- --samples 40 --seed 20261105 --out docs/balance/full
npm run balance -- --fast --bot reference --out docs/balance/reference
npm run frame-data -- --out docs/balance/frame-data.csv
```

The JSON report preserves the exact schedule, source hash, controller version,
seat assignments, per-bout outcomes and damage. Raw draws and timeouts remain
visible even if remaining HP, cumulative damage or the reverse-seat result
resolves a measurement tie. Perfectly symmetric ties remain unresolved.
Reusing a seed reproduces sampling; the baseline CPU has no behavioral RNG.
Frame advantage is nominal arithmetic, with contextual limitations in the CSV.
The observer runs only in an instrumented headless bundle and must produce the
same complete combat state as the unmodified core.

Reports from different configurations are not directly comparable. Use
`--compare <previous.json>` to require the same schedule and controller setup.
Fast CI measurements are advisory in Phase 0. `--gate` requires actual Normal
and Hard CPU levels, then checks the plan's initial 35–65% acceptance band.
The stricter 40–60%, matchup and raw draw targets require broader validation;
passing a sampled gate alone does not establish them.

No assets, atlas registrations, clip lengths or historical `art/` fixtures are
changed by measurement. Human feel and human round-duration targets require
human playtesting. Browser automation and numerical checks do not approve feel.

The most recent full tournament is recorded in
[CPU-KIT-AWARE-20261112.md](CPU-KIT-AWARE-20261112.md). Its section 3 explains how much of a
"fighters outside 35-65%" count is sampling: the two seats of a pair nearly always agree, so a
fighter's bouts are about half as many independent results as they look.
