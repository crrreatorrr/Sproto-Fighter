# Roster A visual size/framing sampling

Reviewed 65 selectable identities (PLAYABLE_FIGHTERS indices 0–64), 72 live body atlases, 1152 displayed source-cel samples (1125 distinct path/hash pairs). All 24 overview pages, 18 runtime supplement pages, and the named detail sheets were opened with image-view and inspected.

## Method and limits

Every cel is rendered at its manifest source-pixel scale and own anchor, with a cyan root/ground guide. Overview/supplement use one sheet pixel per world pixel; detail comparisons use a common 1.5 sheet pixels per world pixel (hover detail 1.0). Images are never fit separately to alpha bounds. Alpha bounds are measurements only. Orange overview borders identify contact-sheet viewport cropping; they are not asset-clipping findings.

This is static visual sampling, not every installed cel, continuous animation, collision, camera, or full gameplay QA. Samples include pose 0, two actual walk keys, representative jump, kick 18, heavy/punch, cast, ranged, special 0/4, recoil, and installed defeat 6. When clips are absent, the overview falls back to a relevant pose; its legacy defeat fallback 24 is an unrotated reaction comparison, not a simulated final defeat. The runtime supplement adds breathe 1, death 8, active airKick 2 or pose 23, and special 7 or pose 13. All 72 bodies in this range had death clips, so every supplementary death sample uses the runtime-preferred death sequence. Runtime reaction rotations/airborne translation and paired formation offsets are not applied in these source-cel sheets.

Overview and supplement were captured at separate manifest snapshots while correction owners were working; hashes and exact paths in coverage.json and supplement-coverage.json record what was inspected. Jessica event samples already reference the initial scale-body-128 candidate. Original defect sheets are preserved and should not be regenerated over the baseline.

## Confirmed findings before correction

| Fighter/body | Finding | Evidence |
|---|---|---|
|bront|Air-kick slots 22/23 have smaller head/shoulder mass; independently reviewed repair of slots 8,9,16-19,22,23,29-31 in both facings, preserving tuck/reach/crouch.|page-01.png; supplement-01.png|
|guest12|Air-kick 22/23 eye area 52/56 vs idle 111/breathe 109; primary eye 7x8 vs 12x12. Jump 8 also smaller; original head width 31 vs idle 43.|page-04.png; supplement-03.png|
|duo|Original identity ranged 12 has 18x19 left eye vs guard 12x13; death identity 24 repeats huge-head style. Existing event cast/defeat drawings preserve proportions. Walk eye 12x13 unchanged; total height+10% comes from straighter stride and was intentionally preserved.|page-08.png; supplement-06.png|
|duo-blue|Original identity ranged/death changes face colors and proportions; existing cast/defeat are coherent. Walk size increase is posture: eye 14x12 unchanged.|page-08.png; supplement-06.png|
|sproto102|Ranged identity 12 left eye 23x20 vs idle 18x18; area 282 vs 223. Entire head/torso enlarged across sampled identity ranged keys.|page-13.png; supplement-10.png|
|sproto832|Motion jump 08 eye 24x27 vs core 08 21x23; yellow area 468 vs 324. Motion heavy 15 eye 23x25 vs core 18 21x22. Air-kick 22 also enlarged.|page-17.png; supplement-13.png|
|sproto832-companion|Yellow crown 30x29 idle vs 36x35 jump/36x37 heavy; lower face 47x12 vs 58x15/56x16. Air-kick sample also enlarged.|page-17.png; supplement-13.png|
|sproto1499-companion|Motion jump/heavy enlarge head/torso. Heavy 15 left eye 26x23 vs idle 22x21; combined eye area 646 vs 479.|page-22.png; supplement-16.png|
|sproto1625-companion|Motion jump/heavy enlarge head/torso. Core kick 18 left eye 17x16 vs heavy 15 21x20; source motion 08 and 15 compared directly with core 08/18.|page-23.png; supplement-17.png|

Visual severity, exact source filenames/sequences and landmark comparisons are recorded in [confirmed-findings.csv](confirmed-findings.csv). Severity describes the visible size/identity discontinuity, not gameplay impact. High denotes a pronounced mass or identity mismatch; moderate denotes a clear but smaller size change. Measurements above are source pixels, before the common atlas scale.

## Preserved intentional changes and modest advisories

Duo walk height increases are not a character-scale defect: red eyes remain 12×13 source pixels, blue eyes 14×12. Straightening from bent-knee guard increases the envelope. Original walk artwork was preserved. sproto1870 intentionally hovers and stretches/tilts during ram attacks. Weapon, kicked-foot, and effect reach should not drive body normalization. Matched core/motion detail comparisons of sproto704 pair, sproto1499 primary and sproto2010 companion did not justify a whole-body size correction. sproto282 companion has a modest 16–18% eye-size difference in heavy and was referred for review; SirSproto1011 has modest art-style variation, weapon extension and arm occlusion rather than a confirmed uniform scaling defect.

## Per-fighter coverage

All entries are static samples only; full-motion and all-cel review are false in both CSVs. Both actual paired bodies are recorded separately in coverage-by-body.csv.

|Index|Fighter|Bodies|Sample cells|Finding summary|
|---:|---|---|---:|---|
|0|rivet|rivet|16|rivet: no confirmed drift in sampled cels|
|1|vela|vela|16|vela: no confirmed drift in sampled cels|
|2|bront|bront|16|bront: confirmed; repair candidate statically accepted|
|3|zephyr|zephyr|16|zephyr: no confirmed drift in sampled cels|
|4|mox|mox|16|mox: no confirmed drift in sampled cels|
|5|rune|rune|16|rune: no confirmed drift in sampled cels|
|6|guest07|guest07|16|guest07: no confirmed drift in sampled cels|
|7|guest08|guest08|16|guest08: no confirmed drift in sampled cels|
|8|guest09|guest09|16|guest09: no confirmed drift in sampled cels|
|9|guest10|guest10|16|guest10: no confirmed drift in sampled cels|
|10|guest11|guest11|16|guest11: no confirmed drift in sampled cels|
|11|guest12|guest12|16|guest12: confirmed; repair candidate statically accepted|
|12|guest13|guest13|16|guest13: no confirmed drift in sampled cels|
|13|guest14|guest14|16|guest14: no confirmed drift in sampled cels|
|14|dumpstar|dumpstar|16|dumpstar: no confirmed drift in sampled cels|
|15|crapto|crapto|16|crapto: no confirmed drift in sampled cels|
|16|vamp|vamp|16|vamp: no confirmed drift in sampled cels|
|17|alpha777|alpha777|16|alpha777: no confirmed drift in sampled cels|
|18|mandela|mandela|16|mandela: no confirmed drift in sampled cels|
|19|bigswole|bigswole|16|bigswole: no confirmed drift in sampled cels|
|20|nate|nate|16|nate: no confirmed drift in sampled cels|
|21|duo|duo; duo-blue|32|duo: confirmed; identity clips; duo-blue: confirmed; identity clips|
|22|nick|nick|16|nick: no confirmed drift in sampled cels|
|23|captain|captain|16|captain: no confirmed drift in sampled cels|
|24|highsproto|highsproto|16|highsproto: no confirmed drift in sampled cels|
|25|erik|erik|16|erik: no confirmed drift in sampled cels|
|26|bimba|bimba|16|bimba: no confirmed drift in sampled cels|
|27|gpm|gpm|16|gpm: no confirmed drift in sampled cels|
|28|leviosa|leviosa|16|leviosa: no confirmed drift in sampled cels|
|29|lifeisameme|lifeisameme|16|lifeisameme: no confirmed drift in sampled cels|
|30|thxobama|thxobama|16|thxobama: no confirmed drift in sampled cels|
|31|rlarsson|rlarsson|16|rlarsson: no confirmed drift in sampled cels|
|32|blorfo|blorfo|16|blorfo: no confirmed drift in sampled cels|
|33|michael|michael|16|michael: no confirmed drift in sampled cels|
|34|freshprince|freshprince|16|freshprince: no confirmed drift in sampled cels|
|35|mlk|mlk|16|mlk: no confirmed drift in sampled cels|
|36|sproto102|sproto102|16|sproto102: confirmed; ranged clip|
|37|sproto215|sproto215|16|sproto215: no confirmed drift in sampled cels|
|38|sproto282|sproto282; sproto282-companion|32|sproto282: no confirmed drift in sampled cels; sproto282-companion: advisory; modest action difference|
|39|sproto313|sproto313|16|sproto313: no confirmed drift in sampled cels|
|40|sproto651|sproto651|16|sproto651: no confirmed drift in sampled cels|
|41|sproto704|sproto704; sproto704-companion|32|sproto704: no confirmed drift in sampled cels; sproto704-companion: no confirmed drift in sampled cels|
|42|sproto763|sproto763|16|sproto763: no confirmed drift in sampled cels|
|43|sproto818|sproto818|16|sproto818: no confirmed drift in sampled cels|
|44|sproto831|sproto831|16|sproto831: no confirmed drift in sampled cels|
|45|sproto832|sproto832; sproto832-companion|32|sproto832: confirmed; action clips; sproto832-companion: confirmed; action clips|
|46|sproto834|sproto834|16|sproto834: no confirmed drift in sampled cels|
|47|sproto837|sproto837|16|sproto837: no confirmed drift in sampled cels|
|48|sproto865|sproto865|16|sproto865: no confirmed drift in sampled cels|
|49|sproto943|sproto943|16|sproto943: no confirmed drift in sampled cels|
|50|sproto999|sproto999|16|sproto999: no confirmed drift in sampled cels|
|51|sproto1011|sproto1011|16|sproto1011: advisory reviewed; preserve|
|52|sproto1093|sproto1093|16|sproto1093: no confirmed drift in sampled cels|
|53|sproto1187|sproto1187|16|sproto1187: no confirmed drift in sampled cels|
|54|sproto1335|sproto1335|16|sproto1335: no confirmed drift in sampled cels|
|55|sproto1345|sproto1345|16|sproto1345: no confirmed drift in sampled cels|
|56|sproto1414|sproto1414|16|sproto1414: no confirmed drift in sampled cels|
|57|sproto1477|sproto1477|16|sproto1477: no confirmed drift in sampled cels|
|58|sproto1499|sproto1499; sproto1499-companion|32|sproto1499: no confirmed drift in sampled cels; sproto1499-companion: confirmed; action clips|
|59|sproto1601|sproto1601|16|sproto1601: no confirmed drift in sampled cels|
|60|sproto1625|sproto1625; sproto1625-companion|32|sproto1625: no confirmed drift in sampled cels; sproto1625-companion: confirmed; action clips|
|61|sproto1668|sproto1668|16|sproto1668: no confirmed drift in sampled cels|
|62|sproto1815|sproto1815|16|sproto1815: existing correction observed|
|63|sproto1870|sproto1870|16|sproto1870: no confirmed drift in sampled cels|
|64|sproto2010|sproto2010; sproto2010-companion|32|sproto2010: no confirmed drift in sampled cels; sproto2010-companion: no confirmed drift in sampled cels|

## Independent correction review

Accepted seven body candidates after independent fixed-scale inspection: Bront's 11 pose corrections; Guest12's four jump/air-kick corrections; all 32 action cels each for sproto832, sproto832 companion, sproto1499 companion and sproto1625 companion; and all eight sproto102 ranged cels. Every corrected cel was viewed in both facings. That is 151 unique corrected cels / 302 corrected-cel displays, separately from the roster sampling above.

The changes restore head/torso mass while preserving all of these candidate source poses and effect variations. Full-motion and runtime installation remain root-owned checks. Detailed acceptance notes, evidence links and asset/sheet hashes are in [correction-review.md](correction-review.md) and correction-review.json. Duo identity ranged/death remains a separate manifest-owner correction; original duo walks were intentionally preserved.
