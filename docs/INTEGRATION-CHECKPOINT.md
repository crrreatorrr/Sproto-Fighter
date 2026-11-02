# Integration checkpoint — 2026-11-02

This checkout is `codex/integration-20261102`, based on local `main` commit
`ba09fa6`. It is a **working integration checkpoint, not a completed main merge**.
The shared authoring checkout and every other task's checkout are preserved.

Included here: a copy of the available tracked and untracked local game, roster,
runtime art, authoring files, documentation and scripts from `neon-relay`, plus
the paired formation/gait/menu fixes and Yannix's mind beam from the isolated
review snapshot. Ignored dependency/build/cache files are not versioned.

Manual conflict resolution preserves the newer miniature-projectile cast hold
and relay-assist architecture while adding beam hold timing and clearance for
paired fighters' ordinary special cameos. The ten walking-anchor corrections
were applied only where their source body metadata still matched the reviewed
baseline. No combat scale or collision geometry was changed for menu framing.

The local authoring tree contains approximately 4.5 GB of files. This checkpoint
is local only. A focused scan found no private keys, GitHub tokens, AWS access
keys or quoted credential assignments in the scanned text files; this is not a
guarantee that every possible secret format was detected.

Completed in this integration checkout:

- Directional-spit commit `d3e2360` is incorporated, retaining crouched organic
  spit and Yannix's separate forehead beam. Both core/renderer conflicts were
  resolved explicitly rather than choosing an entire side.
- Build, type check, broad scripted QA and the focused pose/duo/menu/spit/beam/
  formation checks pass. Actual game-page checks confirmed Duo movement and
  grab contact, and Yannix's beam in both facings and in the air.
- All 16 paired selection previews were inspected after correcting caption
  overlap. Their cast/special states were rechecked in the integrated renderer.
  See [the detailed handoff](PAIRED-INTEGRATION-HANDOFF.md) and its coverage CSV.

Pending before main (latest read-only inventory, 2 November):

| Work | Recorded state | Integration action |
| --- | --- | --- |
| Persistent progression / testing God Mode | Completed branch `codex/persistent-story-unlocks`, latest `37777c20` after `c741cc06` | Reconcile main/core/selection/story overlaps and canonical Hatchery dependency. |
| Hatchery/Ranch detail and stage floor alignment | Completed branch `codex/hatchery-ranch-detail`, latest `07369627` after `79a49c59` | Preserve ten-stage mapping and verified bridge/dock/courtyard floor corrections. |
| Twin display and spacing follow-up | Thread `01a19b3a-7134-7170-88ec-3c0207274012` still in progress | Reconcile its active hub/mobile layout and spacing with this preview implementation. Do not overwrite it. |
| Independent partner attacks | Thread `01a19b39-3c1b-72fc-bcd9-bafd95c54039`, `codex/independent-partner-assists`, uncommitted work | Wait for its completed core, renderer, selection and relay updates; recheck wall/paired overlap afterward. |
| Mystical UI / borders and cutscene script | Thread `01a19b2a-d8a7-7446-8956-d31a8262701b` still in progress | Retain approved UI changes and script approval boundary. No video generation here. |
| Roster entrance/defeat/ranged expansion | Thread `01a19b11-b6bd-7613-bc9b-c23fd1b6e942` still in progress | Collect final local deltas, not an older snapshot; compare changed atlases and recheck affected states. |
| 24 redesigned stage variants | Completed image pack in `/Users/kenhiraoka/Documents/Codex/2026-11-02/task-2/stage-variations-v2`; not installed | Map the eight themes, retain current stages, check fight lanes before enabling variants. |

The 24-stage pack's preview sheets have been inspected. It excludes Last Light
Bar and predates the Hatchery addition. Its manifest lists stage-name folders,
while the extracted files are grouped into `trench-circuit`, `neon-yacht`,
`castle` and `verse-ranch`; resolve each basename to the actual file rather
than assuming the manifest's relative path exists. No generation or credits
were used by this integration pass.

Main and remote are unchanged. The user authorizes the final main integration
only once **all** current work is finished, including relevant local changes.
This branch is a recoverable local checkpoint, not that final main merge.
