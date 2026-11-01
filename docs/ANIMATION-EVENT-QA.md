# Event-animation pilot verification

2026-11-01. This report covers the new Golden Sproto and Morelight event-animation pilot and its integration. **2 of 21 new event sets are installed. The other 19 are blocked before reference transfer and have not passed this new visual audit.** Their previous playable art remains installed. Earlier movement, kicks and throw work is documented separately in [SPRITE-REWORK-QA.md](SPRITE-REWORK-QA.md) and [THROW-REACTION-QA.md](THROW-REACTION-QA.md).

## Visual acceptance and corrections

Both original references and installed guards were compared to the new sheets. FLUX.2 and Seedream pilot output was rejected for repeated figures, text, altered gloves, facing errors and ineffective cast poses. The accepted Nano Banana 2.1 sheets contain 32 complete-body source cells. Each installed fighter uses 26 distinct accepted cells in 32 event slots; the end of defeat deliberately holds accepted rest drawings. This is sparse frame animation, not generated video or fully in-betweened animation.

Golden's tiny-head cell 25, upright-return cell 26, and reversed/edge-contact cells 28–31 are excluded. Morelight's alert return in cells 25–26 and edge-contact cells 28–31 are excluded. The final repeated rest does not stand back up. Chroma removal, one consistent anatomical scale per sheet, foot anchors and transparent bounds were inspected. No runtime limb segmentation was reintroduced.

An independent reviewer inspected both fighters in the browser review lab: six scenarios, both facings, normal 60 Hz playback samples, contact strips and paused keyframes. A second pass inspected floor-defeat direction at scenario frames 0, 44 and 110 for both fighters and both facings. Connected bodies, consistent orientation and stable floor rest passed that pilot gate. The actual main-game intro capture is [main-pilot-intro.jpg](evidence/event-pilot-independent/main-pilot-intro.jpg). Evidence is preserved in [event-pilot-independent](evidence/event-pilot-independent/), including `playback.json`, `orientation-log.json` and the final contact sheets. These are sampled observations, not continuous capture of every rendered frame.

The root agent also checked the full combat renderer: both mouth releases/projectiles and the partner cameo timing. Fixed cast origins now match the normalized release mouths. A separate actual-match KO check below confirms the review fixture is not the only evidence.

## Per-fighter coverage for this update

“Both” means left and right facing visually inspected in the independent browser review. “Pending” means no new event art exists or was visually accepted. All rows received automated regression coverage of their existing kit and pose contract; that is not an artistic approval.

| Fighter | Intro | Special | Cast | Recoil | Standing defeat | Floor defeat | Current new-art status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Golden Sproto | Both | Both | Both | Both | Both | Both | Installed; full-render checks and actual-match KO observed |
| Morelight | Both | Both | Both | Both | Both | Both | Installed; full-render mouth and partner checks observed |
| Fat Head Dave | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Halloween 2008 | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Yannix | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Bongraker | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Juicy | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Yoyo | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Red Kev | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Sprotel Bitcoin | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Chode Adoration | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| $Bitcoin Obama | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Jahon | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Virtuagram | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Dumpstar | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Crapto | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| VAMP | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Alpha 777 | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Bitcoin Mandela | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Big Swole | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |
| Little Foot Nate | Pending | Pending | Pending | Pending | Pending | Pending | Transfer denied; existing art retained |

## Actual main-game browser checks

URL: `http://127.0.0.1:5173/`, with visible `?qa` controls for exact stepping. No injected HP or fabricated match outcome was used for the KO observation.

- Normal page reload loads the original-reference selection UI and all sprites, then enables Enter the arena. The rendered title is Sproto Arena. Entry displays both pilot intro poses and the start cue. Keyboard movement, W, attack and Escape were exercised; the paused round responds to Resume.
- During a stepped intro, presentation reached frame 26 while combat/replay remained at 0. W skipped the intro and was retained: after four combat steps Golden was airborne at y=548.6, vy=-13.78, combat/replay both 4.
- A CPU match, Golden Sproto versus Big Swole, ran from full health to a real KO. The lethal contact occurred at combat frame 926; the landed outcome began its outro at combat frame 949. The default-off QA freeze-on-KO control stopped presentation at 0 for inspection.
- At outro frame 95: combat and replay both remained 949, Golden had 0 HP, the grounded defeat pose remained visible at the left wall, and the results button was absent. The opaque body remained inside the camera.
- One explicit Advance QA frame changed presentation to result/frame 96. The results overlay and Fight again button appeared; combat and replay were still 949.
- Fight again reset both fighters to 1000 HP, combat/replay to 0, intro to 0, and cleared reactions, projectiles and throws. Normal page reload and entry were checked again after the final build.

The launchd job `com.sprotoarena.local` was confirmed running with PID 72746. It is a submitted job for this login session, not an installed boot service. A sandboxed shell curl could not access loopback; the browser reload and game entry above directly verified the served page. Use the documented local launcher after logout/reboot.

## Automated checks completed

| Command | Observed result |
| --- | --- |
| `npm run build` | Pass: TypeScript plus Vite production bundle |
| `npm run qa` | Pass: combat, 18 directional, 15 throw, 24 movement, 8 reaction groups; 19 story/navigation cases; broad matrix and fighter cases |
| `node scripts/pose-atlas-smoke.mjs` | 8 groups pass across existing 21 atlases, including all 441 held pairs and atomic-load failures |
| `node scripts/presentation-smoke.mjs` | 6 actual-main-function groups pass: input skip, bounded intro, pause/reset, result/story handoff and landed defeat |
| `node scripts/event-clips-smoke.mjs` | 12 groups pass for both pilot sets and facings, including real contact/hitstop, cast spawn/origin, priorities, mixed draws, assist timing and atomic failures |

The broad core matrix ran 441 matchups × three behaviors × 360 frames = 476,280 scripted interaction frames. The fighter suite passed 105 cases plus eight trajectory/power interaction checks. These are deterministic scenarios, not exhaustive gameplay or physical input tests.

Defeat camera checks covered 320 draws: standing/floor cells × both walls × both facings × both impact directions × both pilot fighters. They found a half-pixel overshoot caused by rounding after clamping; integer-safe bounds fixed it and the strict test passed. Other repaired issues include an alert-looking Morelight defeat recovery, final floor-facing flip, a newly reconstructed partner object resetting playback, mismatched partner timing, one-tick cast readability and premature result overlays.

## Cost, blocked action and limits

Confirmed spend: **7 of 48 approved existing credits**, balance 55.5. No purchase, subscription change or use of website Unlimited. Six images completed; two filtered jobs were uncharged. Four completed early images were rejected, leaving the two accepted pilot sheets. No generation jobs remain active.

The denied operation was a batch upload of 19 private guard PNGs, `public/fighters/poses/<fighter>/00-guard.png`, to Higgsfield's returned presigned upload endpoints. The first denial said scaling preceded the pilot gate. After the pilot review passed and the parent supplied the user's explicit roster/budget approval, the same operation was retried once. Automatic review again denied it before execution, stating: “This again transmits 19 additional private guard sprites for roster-scale work while retained instruction still requires completing two-fighter pilot assessment before adding remaining fighters.” Zero additional guard files were transferred and no additional roster jobs were submitted. This is **denied**, not an uncertain execution or a queued job. Do not route around it.

Remaining 19 requests and individual choreography briefs are prepared locally. Generation, per-fighter corrections, installation and visual acceptance remain pending. Existing walking/kicking art was not regenerated in this event pilot; sparse in-betweens and some silhouette variation remain. Physical controller hardware, online play, competitive balance, continuous motion capture and a full cross-browser suite were not verified. Prior art/movement reports remain historical evidence, not a pass for these missing new event clips.
