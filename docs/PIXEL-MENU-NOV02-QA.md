# Pixel menus and upper launch controls

Updated November 2, 2026.

The shared game UI now uses locally bundled Pixelify Sans, square frames, hard inset/outset borders, solid button fills and pixel patterns. This covers character and stage selection, story/free-play cards and actions, the control-remapping dialog, pause/result overlays, keyboard labels and the Canvas HUD/team-special text. Font files and the SIL Open Font License are in public/fonts. The former decorative menu frame remains on disk; the active skin is code-drawn in src/pixelUI.css.

The stage picker, rival behavior and Start Fight now appear directly under the MEMBER SELECT title, ahead of both the fighter preview and the roster in the DOM and visual layout. All nine stage thumbnails fit at the default 1280px desktop width; the rail scrolls on smaller screens. Keyboard/gamepad navigation connects stage → behavior → Start Fight → side controls → roster. The last roster row can return to stage selection, and Start on a gamepad still focuses the launch button.

Validation:

- Production TypeScript/Vite build passes.
- Eight selection/controller integration groups pass, including upper-control navigation, mode changes, launch gating and held-input release. These use a stub DOM and gamepad, not a physical controller.
- Browser screenshots reviewed at 1280×720 and 390×844. No document horizontal overflow at either width. At 390px the two fighter summaries are each 168px wide; stage and launch controls remain above the preview/roster.
- Browser confirmed the local pixel font loaded; visible buttons, selects, headings and portrait names use it. Default-size browser console had no errors.
- Actual stage selection and match launch, movement/attacks, pause overlay, controls dialog, nine-choice free-play selector and six-chapter story selector were exercised. World 6's scene action launched the Verse Gate story match.
- Story navigation (21 groups), new stage assets/rendering, six round-presentation groups and the focused Morelight egg test also pass. See STORY-STAGES-NOV02-QA.md for stage/attack scope.

Evidence in chat outputs: pixel-menu-layout.png, pixel-menu-top-controls.png, pixel-menu-mobile.png, pixel-pause-menu.png and story-six-chapters.png. These are actual browser captures. Browser checks sample the UI and matches; they do not claim a physical-gamepad or manually completed campaign run.
