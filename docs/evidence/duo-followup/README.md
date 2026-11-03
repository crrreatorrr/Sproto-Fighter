# Twin follow-up evidence

These are browser screenshots, visible QA readouts and saved check output from the isolated local follow-up. They are observations, not a continuous video or proof that every intervening frame was examined. A normal-speed screenshot can be a few frames later than its preceding text readout.

Final visual anchors:

- `menu-scale-final-desktop.png`: duo and Morelight at equal per-body menu scale.
- `menu-scale-final-four-bodies.png`: all four bodies fit in a duo mirror preview.
- `menu-scale-600-duo-mirror.png`, `menu-scale-375-duo-mirror.png`: responsive previews; temporary viewport overrides were reset.
- `final-main-blue-kick-extension.png`, `final-main-blue-kick-rechamber-t14.png`, `final-main-blue-kick-plant.png`, `final-main-blue-kick-return.png`: observed extension, raised-knee recovery, plant and neutral in the actual game.
- `blue-air-fixed-*`: final tucked startup, extension, falling recovery and landing.
- `special-cameo-left-wall-final-*`, `special-cameo-right-wall-final-contact3.png`, `special-cameo-center-right-final-*`, `special-cameo-center-left-contact2.png`: partner clearance after the corrections. Left-wall filenames ending `contact1-final` predate the HUD inset correction and are intermediate evidence.
- `main-three-earned-pips.png`: real combo-earned meter, not injected state.
- `main-cpu-mirror-ko.png`, `main-ko-animation-live.png`: actual CPU pressure, KO and floor defeat.
- `throw-*`, `victim-*`: exact hold/release/floor/recovery fixtures. `main-player-grab-contact`, `main-player-grab-hold-late`, `main-throw-returned-to-control` are actual keyboard gameplay samples.

Known-defect/intermediate screenshots are preserved deliberately. `air-kick-right-*` precedes the blue startup correction. `main-team-special-1x-*` reveals the original cameo overlap; non-final left-wall cameo captures reveal the first placement overlapping the combo HUD. `main-grab-during-kick-lockout.png` is a correctly rejected early grab, not successful contact. Some screenshots crop part of the viewport; use the final full-render anchors above for judging anatomy/framing.

`visual-readouts.json` contains the actual displayed states with descriptive labels. The `sproto-twin-final-*.txt` files contain command output. Consult `../../DUO-QA.md` for coverage and limitations; old tests' static 'all21' labels should not be interpreted as fresh visual coverage of the full current roster.
