# Local integration checkpoint

Checked combined branch: `codex/combined-readiness-20261102`, integration commit `fbf9ede5` plus subsequent review evidence. The candidate is in `../sproto-combined-readiness`, previewed at `http://127.0.0.1:5194/` while its local process is running.

Preservation captures `41be5642` and `146ab4ff` retain all completed local project files available at their capture times. All inspected other task branches already included in the earlier main integration remain preserved. No remote push occurred.

Main promotion was deliberately stopped **before any mutation**: the hash/file-list guard detected two new active-work paths, `src/mysticUI.css` and `src/stageGroups.ts`, and the roster/stage chat had resumed a new zone→variation selection task. Other files subsequently changed as that task continued. The live `neon-relay` main remained `17f35080` with its index and local changes intact. It must not be overwritten or treated as clean.

When that active task finishes, capture its final working-tree delta using the same isolated-index preservation method, integrate it into the checked candidate, reconcile selection/controller/lock behavior, and run the affected UI/build/browser checks. Only then promote main after revalidating every live path against the new preservation snapshot. The user authorized local integration after all current tasks finish, not an unconditional overwrite of a live checkout.

Git housekeeping also reported a pre-existing malformed duplicate reference, `refs/heads/codex/persistent-story-unlocks 2`, during automatic garbage collection. Commits and merges used valid refs and succeeded. No duplicate refs were deleted and no history cleanup was attempted.

See [the factual handoff](COMBINED-UPDATE-20261102.md) for implemented scope, coverage, known limitations and run commands. The unavailable remainder of the150-fighter target is19 supplied fighter entries/assets, not uncommitted hidden characters.
