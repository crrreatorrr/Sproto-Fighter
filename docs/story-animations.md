# Story boss animations

Cinematics pause combat and replay input. For encounters with a playable boss, recruitment and story progress wait until the final form is defeated. Retry returns to the first regular bout of the encounter.

| Opponent | Story sequence | Regular defeat pose |
| --- | --- | --- |
| Nick | Duet entrance → regular fight → Nick mounts and rides the dragon alone → dragon boss → flight exit → Juicy's regular bout | Replaced by standing mount scene |
| Juicy | Regular fight → robot transformation → mecha boss | Replaced |
| Artchick | Regular fight → fusion with Artdude → growth → Mega Artchick boss | Replaced |
| Morelight | Regular fight → smoke and growth → giant boss → shrink to normal size → mecha boarding → mecha boss → ejection, wizard transformation and exit | Retained before smoke |
| VMU | Regular fight → VMU boss in the same form → bomb portal pulls the player in → congratulations | Skipped |

Artdude keeps his existing first-bout presentation. These boss phases only run in Story mode. Pause and Settings freeze the fight or scene. Skip completes the current cinematic and enters the next playable form when one is due. Settings can toggle God Mode during a fight without restarting it.

## Fixed-screen boss controls

Move with A/D or the arrows. Space jumps and can be pressed again in the air. Shift dashes, X shields, C fires a piercing beam, and V launches a bouncing explosive ball. Shooting is automatic in the direction the player faces. R retries and Escape pauses. Each boss form rotates through three telegraphed attacks. Every boss entry restores the player to full health and animates the refill in the HUD, including Morelight’s mecha phase.

The boss runtime uses Sproto Arcade's 60 Hz grounded movement, projectile physics, dash and shield timing, and recharge times, with hitboxes fitted to Fighter's larger sprites. The six projectile graphics in `src/story-boss-art` are copied from Arcade's `art/gameplay/projectiles`. The original five four-pose attack sheets were generated with Nano Banana Pro in Higgsfield's Unlimited mode. Each sheet has one shared anticipation pose and three attack-specific release poses, keyed and aligned to the existing idle sprite.

## Sources

- `2026-11-03/use/outputs/Sproto-Fighter-special-animations.zip`: Morelight smoke, art fusion/growth, VMU shield.
- Earlier approved extended Nick/Juicy atlas in `2026-10-31/task/sproto-merge-20261103/public/story-intros/nick-juicy.png`: extends Juicy's leftward exit to the stage boundary.
- `2026-11-03/sproto-fighter-animations-use-higgsfield-and/outputs/Sproto Fighter Videos/Playable Sprites`: Nick mounting, combined fire/missiles, east flight, Juicy robot, Morelight mecha, VMU orbital black-hole bomb.
- The adjacent `Sproto Fighter Videos` folder: transparent Starstaff transformation and staff-flight sheets. The flight ends with five empty frames.

The existing dragon attack clip supplies the mounted idle sprite. The new attack sheet supplies its windup and release poses. The directional sheet plays the ten-frame east clip once. VMU's laser and small-bomb alternatives are excluded in favor of the requested shield and black-hole sequence. Runtime PNGs are local, base-path relative, loaded only for the current story opponent, and dimension-checked before the bout starts. The new Higgsfield Seedance 2.5 transition fills the mecha-to-wizard boundary: an explosion ejects Morelight, he lands in regular form, and the final sprite matches the wizard transformation’s first frame. The regular pilot is rendered at about 158 px tall, matching the existing normal combat Morelight (about 159 px), instead of retaining his grown/mecha size. The exact original blue-and-gold mecha replaces all intact frames before the blast, so no generated chest bomb, round light, or added device appears. Chrome verifies those 26 frames pixel for pixel against the reference. The raw eight-second video is retained locally; runtime uses a transparent 16 fps atlas and needs no remote video playback. Generation references and provenance are in `art/story-morelight-ejection/`.

## Verification

- `npm test`: includes actual main-frame-hook checks for all replacement deaths, Morelight's retained death, exact playlist order, intro/countdown order, skip/cancel, repeat-callback prevention, load failures, stale loads, and replay isolation.
- `node scripts/story-flow-smoke.mjs`: real campaign/controller hooks, both bouts, saves/unlocks, losses/draws, retries, failures, and God Mode.
- `node scripts/presentation-smoke.mjs` and `node scripts/versus-smoke.mjs`: existing combat/presentation and preview/controller boundaries.
- `node scripts/story-animation-browser.mjs`: Chrome decodes the cinematic and attack atlases, checks nine cinematic playlists, and drives the actual Nick intro through pause, skip and retry. It also forces an HTTP 404 for the duet atlas, verifies the load-error screen, then successfully retries after restoring the asset. It uses an isolated test save and browser context. The check starts its own local Vite server and uses installed Playwright Chromium in CI (Chrome on macOS). Set `CHROME_PATH` or `BASE_URL` to override. The browser also plays through both Morelight phases and VMU’s boss fight, checks the shrink-to-boarding boundary, and verifies C/V, live God Mode, replay, and the portal victory. The other boss sequences and attack physics have targeted automated coverage.
- `npm run build`: production bundling and TypeScript checks.

Browser evidence lives in `docs/evidence/story-animations-20261104/`.
