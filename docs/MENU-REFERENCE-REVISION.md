# Reference-led selection revision — November 1, 2026

The selection layout and the separately approved Higgsfield decorative artwork are **installed and browser-checked**. Exactly one image was generated for the authorized **2 credits**. The earlier fighter-upload HTTP 403 remains unresolved.

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

## Approved Higgsfield artwork and access status

Read-only model lookup and exact cost preflight returned **2 credits** for one **Nano Banana 2.1**, **2K**, **16:9**, high-thinking image. The user separately approved that amount. Job `558ee637-d69a-480a-a5e5-329b41dbd6e1` completed and its actual 2752×1536 RGB image was inspected. The ornamental background uses red, blue, yellow and charcoal, with no baked-in controls, portraits, text or logos. Working buttons and statistics remain real DOM elements. No additional image or revision was submitted.

The prompt, returned quote, submission and completion are saved in `art/menu-reference-revision/`. The unmodified generated original and installed `public/menu/higgsfield/arcade-frame.png` have identical SHA-256 hashes. No reference image or media URL was sent; the local reference informed the authored layout and descriptive prompt only. These 2 credits belong to a separate approved menu-art budget. Balance changed from 49.5 to 47.5, matching the quote.

After installation, actual browser screenshots were checked at desktop size and 390×844, including the scrolled mobile stage/launch area. A dark backing and brighter control-help text improve readability over the border. Last Light Bar was selected and launched; its actual arena, CPU projectile and player damage were observed before returning to selection. The final menu was restored to the yacht stage and left open. The viewport override was reset. Evidence: `higgsfield-desktop.png`, `higgsfield-mobile.png`, `higgsfield-mobile-lower.png`, and `higgsfield-match.png` under `docs/evidence/menu-reference-revision/`. Build, seven selection/controller regressions and diff whitespace checks passed after the integration. The earlier all-21 selection checks remain applicable; fighter code and portraits were not changed by the art layer.

No fighter upload was retried. The earlier 19 failed uploads were already separate sequential PUT requests, each returning HTTP 403, so the user's one-by-one suggestion does not change that operation. Their retained responses provide no specific provider remediation. Upload access still needs Higgsfield resolution; no alternate transfer route was used. Total observed account spend is now 15: 7 fighter-pilot credits, 6 earlier stage credits, and these 2 separately approved menu credits. The earlier stage-budget scope error remains disclosed in the prior report.
