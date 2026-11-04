# Weapon-wielder sprite scale repair (2026-11-04)

The staff, halberd and sword fighters changed size between animations. Each was drawn as several
separately generated sheets (combat poses, walk cycle, event clips, identity clips), and some sheets
came out at a different pixel density. A weapon makes the whole silhouette about the same height in
every sheet, which hid the change from envelope checks. See
[SPRITE-SCALE-WORKFLOW.md](SPRITE-SCALE-WORKFLOW.md) for the rules this follows.

## What was checked

All five weapon wielders in the roster: Sir Sproto (`sproto1011`, staff), Jessica (`sproto1815`,
halberd), sun god (`sproto2616`, staff), retainer (`sproto2789`, staff) and melo (sword).

The reference is each body's approved neutral guard pose (`frames[0]`), which also fixes the throw
grips. Every walk, event and identity frame was compared with it using head landmarks:

- head-colour component area and width (blue head/hair),
- the eye pair (retainer, whose blue body merges with the head),
- head-only template matching across scales,
- side-by-side renders at a fixed density on a shared floor line (`evidence/weapon-scale-20261104/`).

No single cue is reliable on its own: hair spikes, head turns and lying poses all move them. Each
correction below is where they agree, and the result was checked visually.

## Corrections

All are reviewed source-sheet calibrations with `anchorOffset: [0, 0]`, so feet stay on the
authored anchor. One value covers each sheet, as the workflow requires. PNGs are unchanged.

| Fighter | Sequences | Before (head vs guard) | `pixelScale` |
| --- | --- | --- | --- |
| Sir Sproto | walk cycle | about 1.10× | 0.91 (`walkRegistration`) |
| Sir Sproto | intro, special, cast, recoil, defeat | about 1.12× | 0.89 |
| Sir Sproto | entrance, death, ranged | about 1.09× | 0.91 |
| retainer | intro, special, cast, recoil, defeat | about 0.89× | 1.12 |
| Jessica | entrance, death, ranged | about 0.90× | 1.11 |

After the change, head size measures 0.99–1.03 of guard for Sir Sproto and Jessica. The retainer's
eye height measures 1.01–1.08 against a combat-pose median of 1.04.

No change was needed for:

- **sun god**: every sheet is already within a few percent.
- **melo**: the numbers suggested drift, but renders showed hair and head turns causing it. The
  head is the same size across sheets.
- **Jessica's walk and event clips**: the walk reuses main poses, and the event clips were
  recalibrated before (`scale-body-128`).

## Loader change

`walkFrames` had no registration hook, so `PoseAtlasConfig.walkRegistration` was added. It has the
same validation as `clipRegistration` (density 0.5–2, finite offset, requires `walkFrames`).
`sprite-scale-qa` reads it. Its walk-envelope advisory now compares rendered heights rather than raw
source pixels. Two smoke tests (`event-clips-smoke`, `identity-presentation-qa`) assumed every clip
was drawn at density 1. They now apply the clip's registration when measuring drawn edges.

Combat is unaffected. Registration is presentation-only, and the sprite-scale replay checks confirm
it.

## Same change set

- Anni (`anni`, "ANNI niM.A.T.") is 10% bigger at the owner's request: body `scale` 1.25 → 1.375.
  Her core throw grips and her standing and crouching spit origins were scaled by the same 1.1 so
  they still match her hands and mouth. Hit ranges and hurt geometry are unchanged.
- `sproto1093` is renamed from Birdie to GodsSon at the owner's request. The separate `godsson`
  fighter is also called GodsSon.

## Not done

This covers measurement and side-by-side review at a fixed density. Nobody has played these
fighters at full speed in a real match since the change.
