# Nick — bare-handed playable addition

Added November 2, 2026. Runtime ID `nick`; display name **Nick**. The original source image is preserved at `art/nick/reference.png`. Its blue head/body, red side spikes, yellow top spike, bulging yellow eyes with red irises, yellow muzzle frame and red lips remain recognizable. The cropped lower body is extended with blue limbs/feet and simple navy shorts. Hands are uncovered red skin, with finger/thumb divisions and no boxing gloves, wraps or cuffs.

Three Higgsfield GPT Image 2.5 Sunburst sheets provide 32 combat poses, 8 guarded walking frames and 32 event drawings: intro 4, Bare Knuckle Rush 8, cast 4, recoil 4, defeat 12. Exact jobs, source URLs and prompts are preserved in `art/nick/`. The addition uses separate generation records and an additive installer; it does not rebuild the ongoing bulk roster. Nick's core and portrait entries sit outside the generated expansion blocks so later bulk installs retain him.

Passed `node scripts/nick-smoke.mjs`, the existing floating-machine regression and the production build. Focused Nick checks cover identity, one-body selection, complete gait in both facings, dash/jump/landing, five attack inputs, eight throw directions/facings, and a four-contact special with one meter spend. All 72 image files pass 256×256 RGBA, hard-alpha and transparent-edge checks.

Visual review inspected the three normalized contact sheets for identity, anatomy and uncovered hands. Browser QA selected Nick, launched practice and sampled keyboard movement/attack. This is not exhaustive manual playback of every move. Evidence is saved in the current chat outputs as `nick-in-game.png`.
