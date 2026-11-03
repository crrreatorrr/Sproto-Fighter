# Sprite scale audit

Manifest: late-0c4068a62c0a9b94-reviewed-airkick-20261102 (b2fa20d1ff99)

131 selectable fighters; 150 installed bodies; 15444 frame entries; both facings.
0 hard failures; 950 advisory frame flags; 2449546 composed body draws; 2882 rendered/control replay scenarios.

A passing transform audit does not approve anatomical consistency. Weapons, effects, crouches and jumps change silhouettes. Equal silhouette height can hide a smaller head and torso.

| Body | Scale | Walk height / guard height | Walk floor delta | Advisory flags |
|---|---:|---:|---:|---:|
| rivet | 1.25 | 0.9921–1.0079 | -2.5–-1.25 | 44 |
| vela | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| bront | 1.25 | 0.9764–1.0079 | -5–-1.25 | 34 |
| zephyr | 1.25 | 0.9921–1.0079 | -2.5–-1.25 | 42 |
| mox | 1.25 | 0.9922–1 | 0–0 | 0 |
| rune | 1.25 | 1–1.0079 | -1.25–-1.25 | 40 |
| guest07 | 1.25 | 0.9843–1.0079 | -3.75–-1.25 | 42 |
| guest08 | 1.25 | 0.9921–1.0079 | -2.5–-1.25 | 44 |
| guest09 | 1.25 | 0.9922–1 | 0–0 | 0 |
| guest10 | 1.25 | 1–1.0234 | 0–0 | 0 |
| guest11 | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| guest12 | 1.25 | 0.9921–1.0079 | -2.5–-1.25 | 41 |
| guest13 | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| guest14 | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| dumpstar | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| crapto | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| vamp | 1.25 | 1–1 | 0–0 | 0 |
| alpha777 | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| mandela | 1.25 | 0.9921–1.0079 | -2.5–-1.25 | 42 |
| bigswole | 1.25 | 1–1.0079 | -1.25–-1.25 | 38 |
| nate | 1.25 | 0.9921–1.0079 | -2.5–-1.25 | 42 |
| duo | 1.25 | 1.1016–1.1094 | 0–0 | 0 |
| duo-blue | 1.25 | 1.1484–1.1563 | 0–0 | 5 |
| sproto102 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto215 | 1.25 | 0.9844–1 | 0–0 | 0 |
| sproto282 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto282-companion | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto313 | 1.25 | 0.9922–1.0156 | 0–0 | 0 |
| sproto651 | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| sproto704 | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto704-companion | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto763 | 1.25 | 1–1.0234 | 0–0 | 0 |
| sproto818 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto831 | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto832 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto832-companion | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| sproto837 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto865 | 1.25 | 0.9844–1.0156 | 0–0 | 0 |
| sproto943 | 1.25 | 0.9844–1 | 0–0 | 0 |
| sproto999 | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| sproto1011 | 1.25 | 1.0847–1.1017 | 0–0 | 0 |
| sproto1093 | 1.25 | 1–1.0234 | 0–0 | 0 |
| sproto1335 | 1.25 | 0.9844–1 | 0–0 | 0 |
| sproto1414 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto1477 | 1.25 | 1–1.0313 | 0–0 | 0 |
| sproto1499 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto1499-companion | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto1601 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto1625 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto1625-companion | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| sproto1668 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto1870 | 1.25 | 0.9922–1.0078 | -37.5–-37.5 | 119 |
| sproto2101 | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| sproto2177 | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| sproto2210 | 1.25 | 1–1 | 0–0 | 0 |
| sproto2210-companion | 1.25 | 1–1 | 0–0 | 0 |
| sproto2322 | 1.25 | 1–1.0234 | 0–0 | 0 |
| sproto2381 | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto2531 | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| sproto2569 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto2616 | 1.25 | 0.9375–1 | 0–0 | 0 |
| sproto2789 | 1.25 | 0.9685–1 | 0–0 | 0 |
| sproto2884 | 1.25 | 1–1 | 0–0 | 0 |
| sproto3106 | 1.25 | 0.9922–1.0156 | 0–0 | 0 |
| sproto3181 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto3215 | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| sproto3235 | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto3235-companion | 1.25 | 0.9922–1 | 0–0 | 0 |
| vaudream | 1.25 | 1–1.0547 | -30–-30 | 151 |
| nick | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| captain | 1.25 | 0.9922–1.0156 | 0–0 | 0 |
| highsproto | 1.25 | 0.9922–1.0156 | 0–0 | 0 |
| erik | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto834 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto1187 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto1345 | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto1815 | 1.25 | 0.9609–1 | 0–0 | 0 |
| sproto2010 | 1.25 | 0.9688–1 | 0–0 | 0 |
| sproto2010-companion | 1.25 | 0.9844–1 | 0–0 | 0 |
| sproto2075 | 1.25 | 1–1.0078 | 0–0 | 0 |
| sproto2075-companion | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| sproto2344 | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto2344-companion | 1.25 | 0.9922–1 | 0–0 | 0 |
| sproto3152 | 1.25 | 0.9922–1.0313 | 0–0 | 0 |
| sproto3181-companion | 0.6 | 1–1.0156 | 0–0 | 0 |
| sproto3224 | 1.25 | 1.0079–1.0157 | 0–0 | 0 |
| sproto3224-companion | 1.25 | 0.9922–1.0156 | 0–0 | 0 |
| bimba | 1.25 | 0.9766–1 | 0–0 | 0 |
| gpm | 1.25 | 0.9922–1 | 0–0 | 0 |
| leviosa | 1.25 | 1–1.0078 | 0–0 | 0 |
| uncmasterflex | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| gryph | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| gryph-companion | 1.25 | 0.9922–1 | 0–0 | 0 |
| vitaliketh | 1.25 | 1–1.0156 | 0–0 | 0 |
| urmometh | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| chaton | 1.25 | 0.9922–1.0234 | 0–0 | 0 |
| loadthebags | 1.25 | 0.9922–1.0234 | 0–0 | 0 |
| sisma | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| captainhowdy | 1.25 | 1.0579–1.0744 | 0–0 | 0 |
| sprotosales | 1.25 | 0.9922–1 | 0–0 | 0 |
| sprog | 1.25 | 1–1 | 0–0 | 0 |
| jasper | 1.25 | 1–1 | 0–0 | 0 |
| aaron | 1.25 | 1–1.0156 | 0–0 | 0 |
| brainsprot | 1.25 | 1–1.0078 | 0–0 | 0 |
| godmod3d | 1.25 | 0.9922–1.0313 | 0–0 | 0 |
| godmod3d-companion | 1.25 | 0.9922–1.0156 | 0–0 | 0 |
| sober | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| nosmileclown | 1.25 | 0.9844–1 | 0–0 | 0 |
| nosmileclown-companion | 0.55 | 0.9922–1 | 0–0 | 0 |
| lifeisameme | 1.25 | 1–1.0234 | 0–0 | 0 |
| thxobama | 1.25 | 0.9766–1.0078 | 0–0 | 0 |
| rlarsson | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| blorfo | 1.25 | 0.9922–1 | 0–0 | 0 |
| michael | 1.25 | 0.9922–1 | 0–0 | 0 |
| freshprince | 1.25 | 0.9922–1 | 0–0 | 0 |
| mlk | 1.25 | 0.9922–1 | 0–0 | 0 |
| olnoname | 1.25 | 1–1.0156 | 0–0 | 0 |
| greatcharly | 1.25 | 0.9922–1 | 0–0 | 0 |
| satoshi | 1.25 | 0.9844–1.0234 | 0–0 | 0 |
| xalt | 1.25 | 1–1.0234 | 0–0 | 0 |
| potocaicai | 1.25 | 1.008–1.024 | 0–0 | 0 |
| reverend | 1.25 | 1–1.0078 | 0–0 | 0 |
| zepump | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| zepump-companion | 1.05 | 0.9922–1.0156 | 0–0 | 0 |
| sprotopotamus | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| willuminati | 1.25 | 1–1 | 0–0 | 0 |
| pirate | 1.25 | 1–1.0078 | 0–0 | 0 |
| prim | 1.25 | 1–1.0078 | 0–0 | 0 |
| benjamin | 1.25 | 1–1.0078 | 0–0 | 0 |
| maxbiggums | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| xav | 1.25 | 1–1 | 0–0 | 0 |
| emix | 1.25 | 0.9922–1 | 0–0 | 0 |
| peterpan | 1.25 | 0.9922–1.0156 | 0–0 | 0 |
| peterpan-companion | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| anni | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| pinewaffle | 1.25 | 0.9922–1.0078 | 0–0 | 0 |
| rainman | 1.25 | 0.9922–1 | 0–0 | 0 |
| wifebeater | 1.25 | 1–1.0078 | 0–0 | 0 |
| fiatfudder | 1.25 | 0.9844–1.0078 | 0–0 | 0 |
| moonshiller | 1.25 | 1–1 | 0–0 | 0 |
| godether | 1.25 | 0.9922–1 | 0–0 | 0 |
| aleksander | 1.25 | 1–1.0078 | 0–0 | 0 |
| cyberviber | 1.25 | 0.9844–1 | 0–0 | 0 |
| realityarchitect | 1.25 | 1–1.0313 | 0–0 | 0 |
| mrgoldrobe | 1.25 | 1–1 | 0–0 | 0 |
| solanadelray | 1.15 | 0.9922–1 | 0–0 | 0 |
| solanadelray-companion | 1.3 | 0.9922–1.0078 | 0–0 | 0 |
| sproteth | 1.25 | 1–1.0078 | 0–0 | 0 |
| danocrypto | 1.25 | 1–1.0078 | 0–0 | 0 |
| buddhashadow | 1.25 | 1–1.0156 | 0–0 | 0 |

See report.json for each sequence, source anchor, decoded alpha bounds, hash and baseline change; frames.csv contains every installed cel. Advisory flags are a review queue, not automatic corrections.

- No browser visual approval. PNG alpha, complete draw matrices and deterministic state histories are checked.
- Rotation, translation, floor-safe knockdown pivots, hover/ram motion, paired spacing, and separate effects can be intentional. Only source-pixel body scale/shear is invariant.
- Runtime anchor-offset ranges are measured against the core root plus each companion body offset. Reaction pivots, camera/formation corrections, hover travel and pixel rounding can intentionally change them. Pixel envelopes are source-oriented; facing is checked on actual matrices.
- Floor support uses decoded alpha pixel squares, allowing half a world pixel of translation rounding and one transformed source-pixel footprint for the installed origin/boundary hull conventions.
- All installed cels are directly checked; runtime coverage counts distinguish selected cels from shadowed clips.
- Core contact uses range/vertical thresholds, bodySpread and projectile radii, not per-pixel sprite hit/hurt boxes. Replay equality proves render independence, not visual contact accuracy.
- Jessica mask: alpha>128, B>R+40, B>G+20, largest 8-connected component. Advisory for this blue head only; occlusion and rotation may change it.
