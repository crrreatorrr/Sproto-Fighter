# New fighter request — November 1, 2026

**Prepared, not installed or playable.** The original reference was successfully materialized using the current Library helper, verified readable and visually inspected. Library ID: `libfile_93cd6daf56a48191a895f354e1f1bdda`; version 0; local file: `art/new-fighter-22/reference/original.png`. Exact identity, hash, observations and returned quotes are in `art/new-fighter-22/proposal.json`.

## Decisions and access still needed

The image shows a slim red figure on the left and a blue figure with a yellow top hat on the right. The user clarified that **both are separate entities acting together as one selectable fighter**. Each must retain its own body, neck, legs and independent movement. **Legs attach to the lower part of each body, never high on the torso.** The display name is still pending. The feet are partially cropped in the original, so a complete fighting design will require extending the visible design.

Exact cost preflights for Nano Banana 2.1, high thinking, returned 3 credits per 4K sheet and 2 per 2K sheet. **Each entity** needs a 32-pose combat sheet, an eight-frame movement sheet and a 32-frame event sheet. Four 4K sheets quote exactly 12 credits; two 2K movement sheets quote exactly 4: **16 credits total**. Up to one 4K correction per entity adds 6: **22-credit maximum requested**, pending separate approval. This replaces the withdrawn 8-base/11-cap proposal made before the two-entity clarification. No new-fighter generation has been submitted and no fighter credits have been spent for this request. The approved 2-credit menu image is a different budget.

Read-only Higgsfield checks succeeded: same authenticated account as the existing assets, an available private workspace with owner role and Plus plan, and 47.5 remaining credits after the approved menu image. There was no reconnect prompt. These checks establish account read access; they do not establish storage upload permission or repair the earlier 403.

The prior 19 uploads were already individual sequential PUTs. Every request returned HTTP 403, with no successful confirmation and no detailed remediation body retained. No new transfer, endpoint change, attachment relay or website upload was attempted. The provider needs to clarify or repair storage access before reference-dependent generation. No text-only substitute fighter was generated.

## Integration prepared for the selected identity

The existing runtime accepts 32 complete-body pose slots, an optional eight-frame movement sequence and event clips with intro 4 / special 8 / cast 4 / recoil 4 / defeat 12 frames. The proposed duo uses two complete sets, each on its own 256×256 RGBA canvases with individually inspected foot anchors, opaque bounds and measured contacts. Character shape and proportions must be checked before installation; file dimensions alone are insufficient. Both lower-body/hip joins must stay continuous through the full gait and kick arcs.

Once accepted art is available, integration touches `src/core.ts` (one ID, one health/meter/input state, individual move profile, measured contacts), `src/originalPortraits.ts`, `public/fighters/pose-atlas.json`, local PNGs, roster provenance and affected roster-count assertions/UI labels. The visual extension needs two stable full-body playback identities with separate gait phases and authored lead/support attack choreography. Both positions remain within a bounded shared combat envelope; the second drawing must not add damage, targets or player inputs. Throws remain a single catch/release transaction with inspected contact across the pair and victim. This is a design, not installed code. No joint-cutout rig has been added, and the existing 21-fighter build is preserved.

## Required individual QA record

This is a prepared coverage record, **not completed QA**. Every row below is currently not run because the new fighter and animation assets do not yet exist.

| Area | Required visual and functional checks | Current result |
| --- | --- | --- |
| Reference likeness | Both heads, eyes, mouths, palettes, hat/props; both facings and menu mapping | Original inspected; duo confirmed; generated art pending |
| Idle / walk / reverse / dash | Full cycles at normal speed and stepped frames; feet, hips, neck, arm overlap, pelvis continuity, corners | Not run |
| Jump / land / crouch / guard | Rise/fall transitions, joint coherence, grounded recovery, diagonal inputs, no repeated held-W jump | Not run |
| Light / medium / heavy / low / launcher | Anticipation, contact and recovery; kick hip-knee-ankle arc, planted support foot; both facings | Not run |
| Aerial attacks | Chamber, extension, descent and landing; cancellation into/from air routes | Not run |
| Power and recoil | Measured cast origin, intended trajectory, contact recoil and block feedback | Not run |
| Directional throws | Catch, hold, forward/back/up/down release, victim joins, whiff and interruption; center and corners | Not run |
| Combo / meter / special | Multiple ground/air routes, qualifying finisher charge, three-pip spend, partner cameo and contact frames | Not run |
| Intro / defeat | Continuous entry, skip behavior, standing and floor defeat, settling and result transition | Not run |
| Integration | P1 and CPU selection, random pool, all stages, restart, replay and focused regressions | Not run |
| Duo integrity | Separate low-attached legs on both bodies, gait phase offset, no body merging, coherent shared target/contact geometry, both bodies inside corners, no duplicate damage | Not run |

Actual browser checks during this request cover the separately approved menu image on desktop/mobile, stage-to-match entry and return, and a running existing-roster match. They do not count as new-fighter animation or rigging verification.
