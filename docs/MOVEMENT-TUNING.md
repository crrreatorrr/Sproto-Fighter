# Movement tuning and checks

Updated 2026-11-01. The current update increases walking speed by 15% relative to the October31 build (roster multiplier 0.80 → 0.92). Ground acceleration and reversal reach the requested speed in two simulation frames; braking takes two. Neutral air steering increases from0.55 to0.65 px/frame², attacking air steering from0.18 to0.22. Dash impulse increases14→15 (Morelight12→13), with cooldown35→28frames. The three committed dash frames and jump/chord rules remain.

| Fighter | Old walk | Current walk | Jump impulse | Apex above floor | Airborne frames |
|---|---:|---:|---:|---:|---:|
| Golden Sproto / other19 | 4.4 | 5.06 | 15.484 | 134.362 px | 35 |
| Morelight | 3.52 | 4.048 | 14.504 | 117.518 px | 33 |

Gravity remains0.85px/frame². Launcher launch/chase impulses retain their combo values. W is the default keyboard jump; controller up remains directional jump. Holding jump does not repeat it. The two-frame chord window permits W+attack without an accidental jump.

A browser check found downward air-heavy attacks could force a fighter to land during startup. The dive impulse now starts on the first active strike frame, preserving the normal arc during anticipation. An added test starts a real neutral jump for every fighter and verifies its downward heavy strikes while airborne. A low, late attempt can still land before startup: landing cancels the air move rather than granting an automatic hit.

Input transition repairs preserve dash direction at the original press, prioritize jump/attack over conflicting dash chords, permit crouch/opposite-direction braking after commitment, clear outward velocity at walls, retain takeoff momentum, and resolve landing facing before buffered grounded actions. Airborne facing stays stable through a crossing. Attack timings, damage, combo limits and meter costs were not shortened for this pace change.

Validation: `npm run qa` passed after the change, including24 focused movement cases,20 directional groups,11 throw groups and all21 real-jump dive checks. The four-hit launcher/air route still earns a pip for all21 fighters. Actual keyboard play also reproduced the ground3-hit route, launcher/air4-hit route, three completed combos earning0→1→2→3pips, P spending3→0 with a partner cameo, four throw directions and grounded directional attacks. Big Swole's downward heavy hit in browser from a real W jump (132damage, while airborne). See `docs/evidence/2026-11-01-main/`.

Each fighter received individual 1× browser movement samples and paused pose checks. Exact coverage is in the three motion-review reports. These are sampled observations, not continuous-video review or measured hardware latency. Guarded shuffling still has limited body counter-motion; world-space foot locking and full natural strides are not established. Physical gamepad hardware was unavailable.

Design references were the official [SNK battle-system manual](https://www.snk-corp.co.jp/webmanual/kofxv/en/howtoplay2.php), for directional moves and conditional cancels, and [Guilty Gear dash/input corrections](https://www.guiltygear.com/ggst/en/news/post-2963/), for deferred directions and aerial trajectories. Numeric tuning is specific to this prototype. These sources were documentation comparisons, not firsthand retail-game or latency comparisons.
