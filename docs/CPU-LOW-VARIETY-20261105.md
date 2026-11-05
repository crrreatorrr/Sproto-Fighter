# Grounded CPU low-variety correction

This minimal patch is based on `db5508c5d` and changes only the selected grounded
jab's high/low variant. It does not alter defense probabilities, reaction delays,
RNG draws, spacing, timing, stats, reference behavior or ducking policy.

The old low condition used `choice < 0.25`. After pressure habits are known,
proactive guard consumes the lower interval while throw reads consume the upper
tail. For Expert with the ordinary 0.16 throw share, the remaining jab interval is
approximately `[0.6426, 0.84]`, entirely above 0.25. The cached strategic label can
also remain `defend` while the controller actually chooses a jab. Both conditions
made ordinary lows unreachable in that situation.

The selected ground-jab interval is now normalized to `[0,1]` before choosing its
variant. Its first quarter selects down+light; the remainder selects light. That
choice uses the actual selected action, rather than the older strategic label.
The earlier guard/throw boundaries, off-interval behavior and airborne variants
remain unchanged. No new random number or observation is consumed.

The causal fixture on the original source produced zero lows in 400 selected
jab decisions for every skill anchor and both throw-share cases when the cached
label was `defend`. The corrected distribution grid covers skills 1/4/7/10, both
habit/throw-share cases and both `defend`/`pressure` labels: exactly 100 low and
300 high inputs per 400 evenly sampled jab-interval decisions. Boundary, read
purity, input-only replay, off-interval and airborne regressions also pass.

Verification: **40 focused tests and TypeScript pass**, using one worker. No heavy
balance, story or endpoint run was started, so existing frozen measurements are
not attributed to this policy. Outcome measurements and broad acceptance must
run after applying the patch to the selected role/tracking candidate.

```sh
npx vitest run tests/cpu-difficulty.test.ts tests/cpu-low-variety.test.ts --maxWorkers=1
npm run check
node scripts/build-sim-bundle.mjs --check
```

Simulation source SHA-256:
`e3c3f0637ebe2f45ec8fe484b4a745da8720dbdcfd49435a03cd2acf82a84663`.
Regenerating the
server bundle leaves `SIM_VERSION` at `373448bdc043a0e8`: `cpuInput` is a pure
input policy, tree-shaken from `serverEntry`, and this patch changes neither
physics nor serialized controller state. No fake fingerprint was forced.
Regenerate/check again on the selected target; its own bundle fingerprint remains
the authority. No primary, hub, artwork or animation files were edited, and
nothing was merged or deployed.
