# Story browser test: wait for real KO and painted blackout

The build job in [CI run 41974396406](https://github.com/crrreatorrr/Sproto-Fighter/actions/runs/41974396406/job/127069799363)
passed 71 of 72 checks. `story-animation-browser.mjs` failed after 67.8 seconds:
`blackoutPixel` was undefined when the fixture expected `[0,0,0,255]`. Four checks
were running in parallel.

The old `winRegularBout` returned after at most 80 wall-time input attempts,
without proving that the real regular bout had ended. Its caller also read an
asynchronously published RAF observer immediately after that return. A focused
run of the original loop under 8× browser CPU throttling did reach an actual
Vela KO and observe black, so this investigation does not claim to have identified
the exact CI interleaving. Port 5173 occupancy is only a reported correlation;
passing runs also selected another port, and no port behavior was changed.

The corrected fixture:

- Advances actual UI/God Mode gameplay and observes combat-frame progress. It
  requires a regular-bout winner of P1, rival HP zero and no prior boss entry for
  both Vela and VMU. It verifies the expected opponent and active God Mode.
- Uses a 7200 observed combat-frame cap and a 120-second wall cap with bounded
  progress waits. Failure reports recent frames, HP, move ages, scene,
  presentation, boss entries and visibility. A missed transition cannot silently
  fall through to a pixel assertion. Held movement keys are released on exit.
- Samples a following RAF while blackout is active, waits for that observer to
  publish, and retains the exact opaque-black RGBA assertion. Pixel values and
  game winners are read from the real game; no combat/debug settlement is injected.

## Verification

On isolated base `41ca8e82c43f177c81ba194d984447d6ea829c0c` with an isolated Vite
cache and HMR disabled, the final strict-KO fixture passed the entire affected
browser check. All nine cinematic playlists, Nick pause/skip/retry and failed-load
retry, Morelight/VMU progression, keyboard weapons, replay and live God Mode
checks passed. There were no browser errors or failed requests.

The final run observed Vela KO at frame 676 (111 input attempts, 674 observed
combat frames) and VMU KO at frame 496 (83 attempts, 495 observed combat frames).
The blackout sample was real canvas `[0,0,0,255]` at frame 676 with 89 blackout
ticks remaining. The input-attempt counts illustrate why attempts are a poor
progress boundary; they are not used as the new success criterion.

A focused scheduling stress delayed only the test observer's publication by one
second under 8× browser CPU throttling. After an actual UI-produced KO, the
immediate read was still null while blackout had 70 ticks remaining. Waiting for
publication then captured real opaque black with 29 ticks remaining, and input-only
replay verified. This reproduces the missing-wait interleaving without modifying
combat state or inventing a pixel/winner. It does not claim that CI had that exact
artificial observer delay.

[The evidence record](evidence/story-browser-wait-20261105.json) preserves the CI
incident, original focused result, delayed-observer result, full affected-check
records and fixture hash. Simulation source remains
`058d8215776d1db035c948b42cd224684e705f35ddc46fcb2841dd4b8e7ea495`, version
`c662aee33095a523`. No application, art, atlas, animation length or simulation
source changed. These are automated functional/paint checks; no human feel
approval is claimed.
