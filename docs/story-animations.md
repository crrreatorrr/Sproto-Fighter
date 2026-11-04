# Story boss animations

Transparent sprite scenes are presentation only. They never advance combat, CPU logic, replay inputs, or damage. Recruitment still saves at KO; one result callback follows the scene. Retry starts the original encounter and reloads its first bout, including Nick's duet entrance.

| Opponent | Before fight | After P1 victory | Ordinary death |
| --- | --- | --- | --- |
| Nick | Nick/Juicy arrival; Juicy backflips offstage | Mount dragon → fire and missiles → one eastward flight cycle | Replaced |
| Juicy | Standard entrance | Robot transformation | Replaced |
| Artchick | Standard entrance | Art duo fusion → Mega Woman grows 50% | Replaced |
| Morelight | Standard entrance | Smoke and grow → mecha boarding → Starstaff wizard → staff flight off the right edge | Retained before smoke |
| VMU | Standard entrance | Shield → black-hole bomb | Replaced |

Artdude retains his existing first-bout presentation. The Nick → Juicy, Art duo, and Morelight → VMU gauntlets and save schema are unchanged. Losses/draws retain normal outros and retry behavior. Free play and online fights do not load or trigger these scenes.

`Skip animation` completes the current scene playlist once. Pause, Settings and the journey dialog freeze playback with the round. Restart cancels the previous scene before retrying. The last result sprite is held while the next bout loads, preventing a flash of the replaced death pose. Loads are transactional and stale responses cannot restore an abandoned scene.

## Sources

- `2026-11-03/use/outputs/Sproto-Fighter-special-animations.zip`: Morelight smoke, art fusion/growth, VMU shield.
- Earlier approved extended Nick/Juicy atlas in `2026-10-31/task/sproto-merge-20261103/public/story-intros/nick-juicy.png`: extends Juicy's leftward exit to the stage boundary.
- `2026-11-03/sproto-fighter-animations-use-higgsfield-and/outputs/Sproto Fighter Videos/Playable Sprites`: Nick mounting, combined fire/missiles, east flight, Juicy robot, Morelight mecha, VMU orbital black-hole bomb.
- The adjacent `Sproto Fighter Videos` folder: transparent Starstaff transformation and staff-flight sheets. The flight ends with five empty frames.

The combined dragon fire/missile clip avoids repeating the standalone attack variants. The directional sheet plays the ten-frame east clip once. VMU's laser and small-bomb alternatives are excluded in favor of the requested shield and black-hole sequence. Runtime PNGs are local, base-path relative, loaded only for the current story opponent, and dimension-checked before the bout starts. No MP4 or remote video service is needed. There is no dedicated mecha-to-wizard transition sheet: the supplied wizard transformation begins from Morelight’s base form, so that boundary is a cut between the existing clips. No mech disassembly footage is invented.

## Verification

- `npm test`: includes actual main-frame-hook checks for all replacement deaths, Morelight's retained death, exact playlist order, intro/countdown order, skip/cancel, repeat-callback prevention, load failures, stale loads, and replay isolation.
- `node scripts/story-flow-smoke.mjs`: real campaign/controller hooks, both bouts, saves/unlocks, losses/draws, retries, failures, and God Mode.
- `node scripts/presentation-smoke.mjs` and `node scripts/versus-smoke.mjs`: existing combat/presentation and preview/controller boundaries.
- `node scripts/story-animation-browser.mjs`: Chrome decodes/renders all thirteen runtime PNG atlases, bounds six playlists, and drives the actual Nick intro through pause, skip and retry. It also forces an HTTP 404 for the duet atlas, verifies the load-error screen, then successfully retries after restoring the asset. It uses an isolated test save and browser context. Set `CHROME_PATH` or `BASE_URL` as needed. The module-render checks cover the boss art; they do not claim full browser playthroughs of the other boss fights.
- `npm run build`: production bundling and TypeScript checks.

Browser evidence lives in `docs/evidence/story-animations-20261104/`.
