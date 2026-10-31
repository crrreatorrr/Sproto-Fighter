# Movement tuning and checks

Current neutral movement uses 80% of the prior roster walk speed, 98% of its prior jump impulse, and gravity of 0.85 pixels per simulation frame squared. Dash impulse remains 14 pixels/frame (12 for Morelight), with the same three committed frames. Launcher launch/chase impulses retain their combo-specific values.

Measured through the actual fixed-step core with a one-frame Up tap:

| Fighter | Walk speed | Jump impulse | Apex above floor | Airborne frames |
|---|---:|---:|---:|---:|
| Golden Sproto | 4.4 | 15.484 | 134.362 px | 35 |
| Morelight | 3.52 | 14.504 | 117.518 px | 33 |

Golden Sproto's previous neutral arc was 185.2 pixels high over 47 airborne frames. Both retain the two-frame Up chord window, letting Up plus attack become a directional attack rather than an unintended jump. Frame counts exclude grounded anticipation and count the interval between first airborne and touchdown frames.

Input transition repairs preserve dash direction at the original press, explicitly prioritize jump/attack over conflicting dash chords, permit crouch/opposite-direction dash braking after commitment, clear outward velocity at walls, preserve airborne momentum equally for neutral and same-direction input, and resolve landing facing before buffered grounded actions. Airborne facing remains stable across crossings. Run acceleration, reversal, and braking still settle in three, three, and two frames respectively.

Validation: `npm run check` and `npm run smoke` passed. Movement checks now include 24 focused cases. The human-paced launcher → jump → air light → air medium → air heavy route produced four hits and one charge pip for all 21 fighters after the gravity change. Other suites cover directional inputs, throws, ordinary combos, CPU/replay behavior, and special charging. These are fixed-step checks, not claims about browser latency, controller hardware, subjective animation quality, or every possible combo route.

Design references were the official [SNK battle-system manual](https://www.snk-corp.co.jp/webmanual/kofxv/en/howtoplay2.php), which distinguishes directional moves and cancel conditions, and [Guilty Gear's dash-input transition corrections](https://www.guiltygear.com/ggst/en/news/post-2963/), which illustrate why deferred dash/chord semantics need explicit rules. The prototype's numeric tuning is its own measured design choice, not a reproduction of either game's physics.
