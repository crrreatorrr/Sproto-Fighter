# Story, recruitment and UI update — 2 November 2026

This is a focused follow-up to the integrated build at `9020dfc0`. It does not
claim a new full-roster animation audit. No remote push, paid generation or
cutscene production was performed.

## Resulting behavior

- High Sproto is the initial P1 and a starter. Fat Head Dave remains available.
  Golden Sproto is encounter 98 for new campaigns, immediately before the
  Morelight/Vaudream final pair. Encounters 82–97 remain the paired rivals.
- God Mode story wins recruit and advance through the same path as ordinary
  wins. Free-play wins do not change the campaign. Settings testing remains
  available immediately and turns off on reload. P1 recruitment locks apply
  in both modes; choosing any CPU rival remains possible.
- Locked portraits are clickable previews with art, stats and a named unlock
  explanation. The fight CTA is disabled. Story launch also blocks a locked
  P1 preview and explains how to return to an unlocked P1. The user's earlier
  wording about an *unlocked* fighter was corrected; no such user defect is
  claimed as reproduced.
- The story map opens fitted to the whole image. Region/node selection or
  Find next fight zooms to readable detail; Fit map restores the overview.
  Zoom and resizing preserve useful controls. Small overview markers retain
  accessible names; detailed view shows numbered rivals.
- Ornate controls have safe text insets. Long names, captions, dialogs,
  controls and status lines wrap. Mobile stat labels stack above values;
  paired stat panels have a gap. Mobile preview feet reserve measured space
  above the panels. Combat scale and simulation are unchanged by these UI edits.

## Save preservation

`sproto-arena-story-v1` is retained without writes. Its frozen opponent order is
migrated by fighter ID to `sproto-arena-story-v2`, not by encounter number.
Recognized v1 saves keep Golden, earned recruits and completed-campaign status.
Removing High from the rival order can shift an encounter number down one;
the next undefeated fighter is retained. New v2 saves start with High/Dave and
recruit Golden late. The stable `story-v1-<fighter>` encounter IDs are retained.

Selection/launch refresh progress, and storage/focus/pageshow events merge
progress from other tabs. These are preventative stale-state protections.
The two-boss finale still has no saved midpoint; Morelight's recruitment
persists even if the pair must be restarted.

## Changed files

- `src/storyProgress.ts`: v2 record, legacy migration, roster order, save sync.
- `src/storyMode.ts`: common win path and locked-P1 launch explanation.
- `src/main.ts`: High initial loading/default, refreshed launch gate, God Mode
  applies to story whether selected as a reward or Settings test option.
- `src/selectionMenu.ts`: locked previews, accurate loading/error states,
  recruitment-aware launch, measured mobile stat-panel clearance.
- `src/campaignMapViewport.ts`, `campaignMap.ts`, `campaignMap.css`: fit/detail
  geometry, responsive map and text-safe controls.
- `src/mysticUI.css`, `index.html`: text layout and accurate Settings copy.
- `scripts/story-smoke.mjs`, `campaign-map-smoke.mjs`,
  `selection-menu-smoke.mjs`: focused regression cases.

## Verification performed

Automated checks on the final code are recorded in `evidence/story-update/`:

- Production build and TypeScript.
- 39 story/persistence/God Mode groups: ordinary/God wins, reload, old-save
  migration, completed saves, partial/invalid storage, same-session finale,
  locked story previews and recruited launch, damage immunity and replay.
- 14 stub-DOM/gamepad selection groups: locked preview vs launch, unlocked
  launch, fresh save defaults, saved recruitment refresh, keyboard/grid
  navigation, CPU/random choices and confirm-release behavior.
- Map geometry at five desktop/mobile sizes; 100 bounded unique nodes and
  detail zoom; all 24 stage mappings. Stage checks preserve hashes, dimensions,
  loading deduplication and fallback behavior.

Actual browser checks used Chrome initially and the in-app browser afterward.
Concurrent source edits caused live reloads during early play, so final match
testing used a fixed production snapshot on `127.0.0.1:5192`, with separate
origin storage from the user's 5173 campaign. No hidden game-state or storage
injection was used. Native keyboard controls, DOM clicks and a short sequence
of the existing visible freeze/advance QA controls drove the fight.

Observed in the browser:

- Fresh High starter; Golden preview with art/stats, disabled fight CTA and
  explanatory story launch block.
- God Mode story encounter 1: High took incoming hits while remaining at
 1,000 health; repeated Team Specials reduced Halloween 2008 to zero.
  The result said **Halloween 2008 recruited**, and Yannix's encounter became
  available. Reload retained both. Halloween then launched as P1 in a normal
  fight with God Mode off; normal opponent damage reduced his health and KO'd
  him. A normal-mode story victory was covered automatically, not replayed
  manually in this focused pass.
- Whole map visible at first opening on desktop and 390×844, region zoom,
  Fit reset, next rival, 100 nodes and Golden at 98. Settings, free-level and
  placeholder-scene dialogs inspected. Main 5173 reopened successfully with High
  ready, 100 fitted nodes and the existing 0-cleared progress unchanged. Production mobile page has no
  horizontal overflow; the optional QA log can extend farther.
- Long Michael D. Sproto name/stat cards, normal and paired mobile previews;
  the first pass found vertical letter wrapping and overlapping pair panels,
  which were fixed and rechecked. Evidence retains before/after images.

No physical controller test, per the user's instruction. Controller checks
above use stubs. No full manual 100-match campaign, new all-frame sprite audit,
or systematic cross-browser performance run is claimed.

## Parallel work and expansion constraints

The separate **Convert sproto sprites to fighters (6)** task was active during
this update. Its `hly3` rename in `src/core.ts` / expansion inventory and its
new authoring folders were preserved and excluded from this focused checkpoint.
The production snapshot includes the observed name but no unfinished new roster
integration is claimed. During final verification the parallel task also installed
`satoshi`, `xalt` and `potocaicai`, taking the live working tree to 105 fighters.
These three are not yet in the 100-encounter route. Their code/assets are outside
this checkpoint, and the fixed preview preserves the 102-fighter tested snapshot. No other task was interrupted or merged by this pass.

The newly requested 150-fighter campaign is separate pending clarification and
asset work. At this checkpoint the installed baseline is 102 fighters and 100
unique opponents. 150 unique opponents would need 152 total fighters with the
two current starters. Do not pad the route with duplicate opponents silently.
Before expanding, replace fixed 100/98/99 route assumptions, assign new regional
paths/stage variants, and explicitly migrate v2 by identity so new encounters
inserted before Golden/finale do not erase earned endgame progress. Preserve
the frozen v1 migration. The current fit helper assumes a 16:9 map; adapt it if
the new map has another aspect ratio.

The inspected map reference is `public/story/campaign-map.webp` (1920×1080),
derived from retained `art/story-map/approved-map.png` (3840×2160). A reference
copy was saved to Library as `libfile_ad0f2750c7648191881d118d470659dd`.
Layout: lower-left trenches → left neon city → central Bitcoin yacht marina →
upper-center crowned castle → right amber bar district → upper-right Verse
portal. Hatchery nodes currently sit beyond the portal rather than inside a
large illustrated Hatchery region. A larger map should give that zone its own
space. Actual encounter buttons are separate from decorative painted markers.

## Run and review

Use `http://127.0.0.1:5173/` on this Mac or launch **Play Sproto Arena.command**.
For a stopped server, run `npm run dev -- --port 5173 --strictPort`. Progress is per browser origin; other ports have
independent saves. The temporary 5192 snapshot was for verification only.

Relevant commands: `npm run build`, `npm run story-smoke`,
`node scripts/selection-menu-smoke.mjs`, `node scripts/campaign-map-smoke.mjs`,
`node scripts/stage-variants-smoke.mjs`, `git diff --check`.
