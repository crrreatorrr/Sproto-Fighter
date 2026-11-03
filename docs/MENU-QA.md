# Selection menu and untimed rounds — November 1, 2026

This report covers the current menu/stage/timer update. It does not claim that the blocked 19 new fighter event sets were generated or that every animation was re-reviewed in this menu pass.

## Implemented

- Blue, red and yellow arcade selection layout, inspired by the inspected Library reference `libfile_69e5c716c78881919b4815751fed7b53` (preserved in `art/menu-reference/menu-reference.png`). Large opposing fighting sprites, the 21 original supplied portrait images, explicit P1/CPU markers and separate side controls.
- Heavy damage, light reach, walk speed and ranged-power startup read directly from the actual selected fighter's combat data. These are prototype measurements, not invented rating bars.
- Random fighter for the selected side and Random Stage. Random selection is presentation/setup state; the resolved fighter IDs enter a new deterministic match. Random can legitimately choose the existing selection.
- All five stages update the menu preview and actual fight. Four static Higgsfield panoramas plus the original ranch, with shared drawing/loading and procedural fallback if an optional image is unavailable. Previews crop with preserved proportions.
- No match clock, expiry, timeout winner or timeout draw. KO and double KO still end rounds. Intro/outro presentation timing and story progression remain.
- Keyboard and controller menu routes, explicit launch, pause/result navigation and a neutral-release gate that prevents a controller confirm from becoming an attack.

## Browser observations

Root verification used the actual local game at `http://127.0.0.1:5173/` and its read-only diagnostics variant `/?qa`, with real keyboard and mouse input through computer use.

| Area | Observed result |
| --- | --- |
| All 21 P1 choices | Every selected name matched its button; all 21 original portrait images loaded. Exact rows: `docs/evidence/menu-update/selection-checks.json`. |
| CPU side and stats | Yannix selection changed only the rival; Big Swole displayed 132 heavy damage and Yannix 112 light reach. Independent reviewer checked CPU Big Swole separately. |
| Random | Both P1 and CPU random choices updated the intended side. Random Stage reached by keyboard from the stage rail; its selected name matched the subsequent actual arena. |
| Five stages | Ranch, yacht, bar, castle and retro were individually launched and visually inspected in the arena. Returning to selection retained the setup. |
| Story | Four worlds visible; Castle placeholder scene, explicit fight entry, return to selection and selector Back observed. Separate free-play level selector launched the bar with free-play status. Full campaign progression was checked by controller tests, not manually won here. |
| Live combat | Golden movement and W jump observed, projectile damage observed, close J→K→L produced three hits and finisher knockdown. Three qualifying routes earned three pips; P spent them and displayed the partner cameo and special contacts. Initial distant/poorly spaced strings missed, as expected; spacing was corrected before recording the successful route. |
| Throw | Golden forward grab/release at the wall observed through the rendered match and visible throw-state diagnostic. All directional variants also pass the existing scripted suite; they were not all repeated manually in this menu pass. |
| Pause/restart/controls | Escape pause, controls during play, temporary J→H remap and restoration to J, return without accidental start, and Restart restoring health/meter/intro were observed. |
| KO/result/rematch | A live CPU match against Fat Head Dave reached zero health, finished the 96-tick defeat presentation, and displayed the result at simulation frame 956. Fight Again reset both health values, meter, replay and intro; Fighter Select returned without another automatic match. Evidence: `ko-result.txt` and `ko-result.jpg`. |
| Runtime | No warning/error entries were returned by the diagnostic tab's captured browser log. This is not a complete cross-browser or hardware audit. |

Independent specialist review covered all five desktop menu previews at 1512×862 and the ranch selection layout at 390×844. No fighter clipping, name/stat collisions or ambiguous selected states were observed. Original portraits, full fighter bodies and stat hierarchy were readable. The mobile stage rail intentionally scrolls; a visible swipe cue was added after review.

## Defects found and corrected

1. The old 99-second core expiry and timer HUD were removed, including the timeout-only presentation text.
2. Fighter-grid vertical navigation originally trapped the controller in the grid; routes now leave through the side controls and stage rail. Random Stage is reachable from both ends of the rail.
3. Holding controller confirmation across launch could become an attack; gameplay now waits for neutral buttons/stick. Pause/result overlays also have D-pad and confirm/back routes.
4. Wide stage previews originally distorted scenery. They now crop at uniform scale.
5. HUD numeric text was weak against the yacht sky and castle moon. A dark backing and brighter text were inspected in live yacht/bar playback.
6. Bar corner booths extended into the fighting groundline. A code-drawn floor apron now places both corners on a continuous surface. Root and independent before/after review confirmed the ground-placement fix. Its simple grid/plank treatment remains less detailed than the generated background.
7. The tiny VS subtitle inherited a large text shadow; it now has no shadow. Mobile stage scrolling gained an explicit cue.

## Automated coverage

- `npm run qa`: passes the current existing suite: 21-roster basic combos, directional attacks and horizontal spit, 15 throw groups (including all 441 pairs × 4 directions × 2 facings × 3 locations), 24 movement checks, 8 reaction groups, 21 story/controller/main integration checks, 476,280 broad scripted interaction frames and 105 per-fighter kit cases.
- Untimed-round regression: each CPU/dummy/guard mode, with equal and unequal health, remains active after 12,000 simulation frames; later knockout still resolves, and double KO draws. These are deterministic simulation observations, not 200 seconds of manual browser waiting.
- `selection-menu-smoke.mjs`: seven actual selection/main function groups with stub DOM/gamepad: grid exits, Random Stage routes, mode/launch focus, D-pad parity, one launch per confirm press, neutral release and overlay return.
- `stage-preview-smoke.mjs`: all five previews, active-stage isolation, exact loaded-image reuse by the arena, uniform wide scaling and missing-image fallback.
- `presentation-smoke.mjs`: six intro/outro/pause/restart/result/story groups. `event-clips-smoke.mjs`: 12 groups for the two installed event pilots, both facings, including timing, priorities, atomic loading and wall containment.
- TypeScript and production build pass. `git diff --check` passes.

Tests do not certify aesthetic quality or controller hardware. Physical gamepad, Safari/Edge, every fighter/stage combination, mobile combat ergonomics and a complete manual campaign were not verified in this pass. At the crowded right bar corner, one fighter can obscure much of the other; the floor fix does not resolve all close-contact silhouette overlap. Existing sparse key-pose and 19-fighter event-art limitations remain documented in the animation reports. The independent Chrome review briefly encountered a viewport-control timeout; recovery succeeded, mobile/desktop inspections completed, and the temporary viewport override was reset.

## Art cost and access limits

The four text-only Higgsfield panoramas completed for **6 credits**. The generation did not upload any fighter or menu reference. Requests, jobs and unmodified originals are in `art/menu-art/`; installed PNGs are in `public/stages/higgsfield/`. The user subsequently clarified that the 48-credit authorization was only for fighter animation sheets. Applying it to stages was a scope error, disclosed to the parent/user; **no further stage/menu credit spending is authorized**.

Observed account balance decreased from 62.5 to 49.5: 7 fighter-pilot credits plus 6 stage credits, total 13. No credit purchase, subscription change or Unlimited website generation occurred.

The 19 fighter uploads were already sequential individual PUT requests. Every one returned storage HTTP 403; none was confirmed and no later fighter job was submitted. “One by one” does not materially change the failed operation. The retained responses do not identify a provider remedy; the upload access denial needs Higgsfield resolution. No repeated upload or alternative transfer route was attempted.

Evidence is under `docs/evidence/menu-update/` and `docs/evidence/menu-independent/`. Earlier screenshots remain as before-fix evidence; files ending `-fixed` show the corrected bar floor. Existing combat/animation evidence is preserved separately.
