# Reference-led selection revision — November 1, 2026

The selection layout is implemented and browser-checked. The proposed additional Higgsfield decorative artwork is **awaiting separate approval**; no generation was submitted and no credits were spent during this revision. The earlier fighter-upload HTTP 403 remains unresolved.

## Composition and implementation

The exact reference, Library ID `libfile_69e5c716c78881919b4815751fed7b53`, was inspected locally at `art/menu-reference/menu-reference.png`. Its retained Library file-ID metadata matches. The new layout follows its centered MEMBER SELECT masthead, dark framed surface, narrow side panels, large opposing fighters, selected-name bars, dense two-row portrait grid and faint oversized portraits at the edges. Red marks P1, blue marks the rival and yellow highlights selected controls and values.

The reference's countdown circle is replaced by VS, preserving untimed rounds. The side panels contain real combat statistics, and the stage scenery remains visible behind the fighters. The original supplied portrait images retain their proportions. These are deliberate adaptations to the requested working controls, stats, stage preview and no-timer rules.

- `src/arcadeSelection.css` contains the new desktop/mobile composition, imported after `style.css` by `src/main.ts`. Existing combat and dialog styling remains in the original stylesheet.
- `src/selectionMenu.ts` adds the masthead, portrait echoes, selected-name bars and red/blue fighter platforms. The existing selection, random, launch and controller logic is retained.
- `scripts/selection-menu-smoke.mjs` adds the Canvas methods needed by the preview's platform drawing to its test fixture.
- Combat timings, fighter assets, stage rendering and the no-timer core were not changed by this layout revision.

## Actual browser coverage

The running build was checked at `http://127.0.0.1:5173/` in the in-app browser, with an independent review in Chrome.

| Area | Observed result in this revision |
| --- | --- |
| Desktop composition | Inspected the actual rendered layout, selected fighters, stat stacks, two portrait rows, stage rail and launch controls. Final image: `docs/evidence/menu-reference-revision/desktop-final.jpg`. |
| All 21 player selections | Clicked each fighter and checked the selected-name text. All passed. Original text content retains exact capitalization; CSS displays selected names in uppercase. Results: `all-selections.json`. All 21 portrait images subsequently reported loaded with nonzero natural width. |
| Long names and mobile | Chode Adoration / $Bitcoin Obama checked on desktop and at 390×844. Both fighters, name bars and stat panels remain visible. The stage rail scrolls with a visible cue. Root and independent reviewer inspected the corrected mobile layout. |
| Rival/random | Switching to CPU and using Random Fighter changed the rival to Jahon while the selected player stayed Golden Sproto. |
| Stage and launch | Keyboard navigation reached Random Stage from the stage rail. It selected Neon Tomorrow; Start Fight launched the actual Neon Tomorrow arena with the chosen fighters. The match HUD had no countdown. Returned to selection afterward. |
| Navigation | Story Worlds opened four worlds and Back returned; Controls opened with bindings and Close returned. Practice mode selection/launch was checked, then setup was restored to CPU. |
| Runtime | Final tab log query returned no captured warnings or errors. Local game tab is retained as a deliverable. |

The first mobile rendering inherited both top and bottom coordinates for the stage label, stretching a dark rectangle over the fighters. The mobile rule now explicitly uses `top: 4px; bottom: auto`, and the preview canvas fills its actual container height. The corrected image was independently rechecked. Before/fixed evidence is retained under `docs/evidence/menu-independent/arcade-mobile*.png`.

An initial all-selection comparison was case-sensitive against rendered `innerText`; the new uppercase CSS made that assertion inappropriate. Rechecking exact DOM text and expected rendered uppercase passed all 21 choices. This was a verification correction, not a fighter-name defect.

## Checks completed

All of these completed successfully after the layout/mobile fixes:

```sh
npm run check
npm run build
node scripts/selection-menu-smoke.mjs
node scripts/stage-preview-smoke.mjs
node scripts/story-smoke.mjs
node scripts/presentation-smoke.mjs
git diff --check
```

Coverage: 7 selection/main integration groups; 2 stage-preview groups covering all five stages and arena image reuse; 21 story/controller checks; 6 presentation checks. These scripted checks use their existing fixtures and do not establish visual quality or physical-controller behavior. The prior wider combat/no-timeout pass is separately recorded in [MENU-QA.md](MENU-QA.md).

This layout pass did not repeat every combat move, every fighter's motion audit, all five stages in live matches, a full manual campaign or controller hardware testing. A W-jump input was sent during launch checks, but a clean airborne frame was not captured in this revision, so no new visual jump-verification claim is made. Existing gameplay and animation limitations remain in [CLAUDE-HANDOFF.md](CLAUDE-HANDOFF.md).

## Proposed Higgsfield artwork and access status

Read-only model lookup and exact cost preflight returned **2 credits** for one **Nano Banana 2.1**, **2K**, **16:9**, high-thinking image. The proposal is an empty pixel-art ornamental menu background in red, blue, yellow and charcoal, with no baked-in controls, portraits, text or logos. Working buttons and statistics remain real DOM elements. There is no revision allowance in this proposal.

The prompt, returned quote and status are saved in `art/menu-reference-revision/proposal.json`. No reference image or media URL was sent; the local reference informed the authored layout and descriptive prompt only. Approval was requested for these 2 menu-art credits separately from the 48-credit fighter-animation authorization. **Pending approval is not a completed generation.**

No fighter upload was retried. The earlier 19 failed uploads were already separate sequential PUT requests, each returning HTTP 403, so the user's one-by-one suggestion does not change that operation. Their retained responses provide no specific provider remediation. Upload access still needs Higgsfield resolution; no alternate transfer route was used. The previous cost ledger remains 7 fighter-pilot credits plus 6 stage credits, with the stage-budget scope error disclosed in the prior report.
