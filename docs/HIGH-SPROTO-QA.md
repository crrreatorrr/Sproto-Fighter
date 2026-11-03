# High Sproto — joint projectile fighter

Added November 2, 2026, runtime ID `highsproto`. Original portrait preserved at `art/highsproto/reference.png`. Identity records, exact Higgsfield jobs, source URLs and prompts are in `art/highsproto/`.

Higgsfield GPT Image 2.5 Sunburst generated 32 combat poses, 8 guarded walking frames and 32 event drawings. The pixel interpretation retains the pale yellow crest, sleepy yellow eyelids and red eyes, long blue beard, red lips and red jacket. The cropped body is extended with an opaque red hoodie, navy trousers and dark shoes. The cast uses a forward index/middle-finger flick.

The ranged-power input (I by default) shoots a cartoon joint-shaped projectile: off-white rolled paper, tan end, ash/ember tip and small smoke pixels. It travels straight horizontally at 12 world pixels per simulation frame in either facing and in the air, causes one 58HP hit, and respects normal guarding. Emission is derived from the reviewed cast-release drawing and preserved in `joint-origin.json`. Smoke Signal uses four contacts and the existing three-pip Team Special rule.

Passed the focused High Sproto test, 36 projectile ground/air/facing/direction cases, four hit/block cases and projectile-rendering checks. Nick, Captain Sproto, the legless machine, existing-fighter power checks and the production build also pass. All 72 PNGs pass 256×256 RGBA, hard-alpha and transparent-padding checks.

Visual review inspected the three normalized sheets for identity and connected anatomy. Browser QA selected High Sproto and stepped an actual I input in standing-dummy practice. Frame 20 showed the finger-flick cast and visible projectile; frame 49 registered one hit and removed the projectile, leaving the dummy at 942HP. Screenshot evidence is saved to the current chat outputs as `high-sproto-shot.png`. These are focused checks and sampled browser playback, not exhaustive manual review of every animation.

The additive installer keeps High Sproto outside the generated bulk-roster blocks and retains previous named additions.
