# Movement and rigging rework — current QA

This pass follows the user's rejection of the earlier movement/rig quality. Earlier green checks did not establish acceptable animation quality. The current build is available locally at http://127.0.0.1:5173/; it has not been published.

## Root causes and changes

- Rear-arm attacks were painted behind the torso and head. Working forearms/hands now render in front; neutral hands sit outside the torso silhouette.
- Foreshortened source wrists were treated as full anatomical arm lengths. Consistent bone proportions, shoulder protraction and body weight transfer now give the attack a readable reach. Texture stretching is capped at 1.45×; source-colored support fills previously hidden surfaces instead of stretching tiny sleeve fragments into ribbons.
- Strike extension was zero until the first active frame. The last three startup frames now accelerate into contact. Kicks lift the knee, extend, rechamber and return; the working leg renders in front of the pelvis. Knee-strike guards are separated from the boot.
- A fixed wide stance made short-legged fighters unable to reach the floor. Neutral hip height and stance now derive from each rig. Crouch/dash stances use that stance instead of a universal wide spread.
- Gait phase depended on facing and walking-only position history. It now preserves phase across turns, updates position history through other states, and accumulates only grounded locomotion. Short-legged rigs use a longer return cycle instead of a rapid shuffle. Transition blends shorten to 2 frames for attacks and 3 for locomotion; hitstop remains frozen.
- Controls now capture buffered dash direction, resolve jump/attack/dash priority explicitly, brake dashes after their commitment, clear wall momentum, retain dash-jump momentum with forward input and resolve facing on landing.
- Walk speed is 80% of the old value; gravity is 0.85 with 98% jump impulse. Golden Sproto's neutral jump changed from 185 px /47 airborne frames to 134 px /35 frames. Dash impulse is unchanged. See MOVEMENT-TUNING.md for measurements and tradeoffs.

## Evidence and checks

`npm run build` and `npm run qa` passed. The latter includes 24 movement checks, 19 directional checks, 11 throw checks, story tests, 441 roster pairings in three opponent modes (476,280 scripted frames), and 105 per-fighter power cases plus 8 trajectory/power interactions. These are scripted checks, not 441 completed human-played matches.

The actual renderer produced 4,896 sampled poses in both facings. Generation is not visual approval. Structural checks covered 1,134 move/phase/facing samples, bounded texture transforms and working-limb draw order. Hitstop checks covered all 21 fighters. Ground-contact checks now cover idle/crouch/dash for all 21 (63 pose checks); walking plant drift was below 0.15 pixels per sampled step in the measured planted intervals for all 21.

Browser checks used the user's Chrome and real keyboard events. VAMP and Yannix were exercised through reversals, W-jump and aerial kick during development. Final tuning was played with Big Swole through dash braking/reversal, W-jump, aerial kick, crossing the opponent, landing into opposite facing and a successful down throw. Golden Sproto completed three qualifying combos over the session, reached three pips and spent them on Crosscurrent with partner cameo and damage. Two intervening attempts whiffed because approach distance was insufficient; those granted no charge. The test was repeated from close range successfully.

The original pose lab is instantaneous sampling. The new `/art/higgsfield/movement-lab.html` runs persistent real combat states and the gameplay renderer for all 21 fighters, with start/stop/reverse, jump/landing, dash/corner and attack-transition scenarios. It has play/pause, single-frame stepping, quarter-speed playback, mirrored spawn and visible state readouts. Browser inspection included all-roster neutral, grounded movement frame40, mirrored jump frame40 and landing frame70. The subsequent stance correction was checked with all-roster grounded-pose assertions and refreshed sheets; the final browser recheck is recorded below. The lab is a QA tool, not proof of subjective feel.

## Visual coverage ledger

P = general sheet's 32 poses, including idle, three walk samples, jump/fall, crouch/dash, strike samples, aimed casts, air attacks, grab, hit/block, specials and throw/victim samples. C = combat sheet's 57 sampled move/phase/direction poses. R/L = facing. All fighters also received browser roster-grid punch/kick contact inspection and mirrored kick startup/recovery inspection. Not every frame of every move was manually inspected.

| Fighter | Detailed sampled inspection | Live browser coverage this pass |
|---|---|---|
| Golden Sproto | P R/L | Manual combos/meter/special; persistent movement grid |
| Morelight | P R/L | Opponent in manual match; persistent grid |
| Fat Head Dave | C R | First-eight pose playback; persistent grid |
| Halloween 2008 | C R | Rear punches/kicks playback; persistent grid |
| Yannix | C R/L | Manual jump/kick; targeted sleeve/guard review; persistent grid |
| Bongraker | C R | Targeted sleeve/stride playback; persistent grid |
| Juicy | P R/L | First-eight pose playback; persistent grid |
| Yoyo | C R | Rear punches/kicks playback; persistent grid |
| Red Kev | P+C R/L | Persistent grid |
| Sprotel Bitcoin | P+C R/L, targeted repeat | Persistent grid |
| Chode Adoration | P+C R/L | Persistent grid |
| $Bitcoin Obama | P+C R/L | Persistent grid |
| Jahon | P+C R/L, targeted repeat | Persistent grid |
| Virtuagram | P+C R/L | Persistent grid |
| Dumpstar | P+C R/L | Persistent grid |
| Crapto | P+C R/L, targeted repeat | Persistent grid |
| VAMP | P R/L | Manual jump/kick; persistent grid |
| Alpha 777 | P+C R/L | Persistent grid |
| Bitcoin Mandela | P+C R/L | Persistent grid |
| Big Swole | P+C R/L | Final manual dash/jump/crossing/down throw; persistent grid |
| Little Foot Nate | P+C R/L, targeted repeat | Persistent grid |

Independent reviewers found the hidden working arm and stretched-sleeve defects, challenged the first fix, then confirmed the improvements in their inspected samples. The 12-fighter reviewer inspected 48 sheets/2,136 poses and rechecked four affected fighters in 16 sheets/712 samples. No severe duplicated-limb or disconnected-head/foot defect was found in those rechecks. Root additionally inspected the four P R/L sets and all-roster grids. The stance correction came after those detailed reviews and was separately checked across all rigs.

## Reference use and honest limits

Official [SNK battle controls](https://www.snk-corp.co.jp/webmanual/kofxv/en/howtoplay2.php) informed directional/cancel expectations. [Guilty Gear Strive's documented dash-input transition fixes](https://www.guiltygear.com/ggst/en/news/post-2963/) informed explicit treatment of dash chords and direction changes. These sources describe real-game behavior; we did not run those commercial games side by side or measure their input latency, nor copy their physics. Numeric tuning here is an original measured design choice.

Remaining minor visual polish: some raised gloves overlap one eye/mouth, and same-blue arms can blend into the torso on Crapto/Mandela/Big Swole. The source art is still single-pose Higgsfield imagery animated as articulated cutouts with reconstructed hidden surfaces, not newly generated frame-by-frame animation sheets. No physical gamepad was available for verification. Browser event automation is not a human latency measurement. Static sampling and scripted playback do not certify every animation frame or guarantee that the user will find the feel satisfactory. Story/menu broad coverage from the prior update remains documented in ART_QA.md; those unchanged flows were not all manually replayed again during this focused repair.

Renderer source SHA256 at final sheet generation: `392ff385f7d1df254d84955f46b8dc81d52ba77b4e0dc78e972031e071f54651`. Asset revision remains `24495940b540c6d6` because source PNGs were preserved.

Final browser recheck: after the per-rig stance correction, all 21 persistent mirrored jump scenarios were advanced to frame70 and visually inspected after landing; screenshot `qa-movement-landing.png`. Chrome reported no error logs in the final game tab. The normal game URL was reopened and left ready. `qa-browser-combo-special.txt` records actual manual charge/spend events; `qa-updated-special.png` captures the partner cameo. HTTP200 was verified from the Mac. The existing launchd session server remains in use; the README launcher remains the restart path after logout/reboot.
