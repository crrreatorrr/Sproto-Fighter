> Canonical kit analysis and gate results are in FINAL-CALIBRATION-20261105.md and final-calibration-manifest.json. The raw runner archetype grouping is historical heuristic data.

# Balance tournament

Source: `6f768d2e6f292e71f707494bb7d9ee5078b61518`; simulation `7d0ce00ef52b567a`; source SHA-256 `e151e77bbf53dc08bb3241921ffda7fee57615454e0b18a62be57dc7f4f20377`.

Seed 20261105; 254 fighters; 4184 sampled pairs; 2 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes are analysis groupings of existing roles, not normalized gameplay templates. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 4

16736 bouts; raw draws 0.1% (10); unresolved 0.1% (10); timeouts 0. Mean 22.39 s; median 22.27 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 50.0% | 0.1% | 3.93 s |
| 2 | 50.0% | 50.0% | 0.1% | 3.93 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 2968 | 58.5% | 58.5% | 0.1% |
| Counter | 4376 | 48.6% | 48.6% | 0.0% |
| Pressure | 17460 | 56.4% | 56.4% | 0.0% |
| Zoning | 3060 | 26.8% | 26.8% | 0.0% |
| Paired | 2592 | 44.9% | 44.9% | 0.2% |
| Weapon | 712 | 29.2% | 29.2% | 0.0% |
| Brawler | 1908 | 33.7% | 33.7% | 0.1% |
| Hover | 396 | 46.7% | 46.7% | 0.0% |

Damage: melee 18267728; projectile 7294453; special 314523; throw 117610.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 128 | 43.0% | 43.0% | 0.0% |
| aaron | Pressure | 144 | 63.9% | 63.9% | 0.0% |
| accidentallyrich | Counter | 124 | 58.9% | 58.9% | 0.0% |
| agentsproto | Brawler | 104 | 11.5% | 11.5% | 0.0% |
| aktree | Zoning | 112 | 29.5% | 29.5% | 0.0% |
| aleksander | Pressure | 116 | 48.3% | 48.3% | 0.0% |
| alpha777 | Pressure | 128 | 56.3% | 56.3% | 0.0% |
| anni | Pressure | 116 | 62.1% | 62.1% | 0.0% |
| autistophrenicsprotagonist | Footwork | 116 | 60.3% | 60.3% | 0.0% |
| azkarah | Zoning | 92 | 34.8% | 34.8% | 0.0% |
| benjamin | Pressure | 144 | 54.9% | 54.9% | 1.4% |
| berserk | Footwork | 120 | 50.0% | 50.0% | 0.0% |
| bgbadger | Zoning | 96 | 20.8% | 20.8% | 0.0% |
| bidnehhh | Pressure | 116 | 60.3% | 60.3% | 0.0% |
| bigal | Brawler | 120 | 46.7% | 46.7% | 0.0% |
| bigswole | Brawler | 112 | 39.3% | 39.3% | 0.0% |
| bimba | Pressure | 140 | 65.7% | 65.7% | 0.0% |
| bitcoind1rk | Pressure | 164 | 69.5% | 69.5% | 0.0% |
| blorfo | Pressure | 168 | 35.7% | 35.7% | 0.0% |
| bobdobbs | Footwork | 152 | 47.4% | 47.4% | 0.0% |
| brainsprot | Pressure | 132 | 77.3% | 77.3% | 0.0% |
| bront | Brawler | 100 | 52.0% | 52.0% | 0.0% |
| bs9090eth | Zoning | 112 | 37.5% | 37.5% | 0.0% |
| buddhashadow | Pressure | 140 | 55.7% | 55.7% | 0.0% |
| cam | Brawler | 132 | 24.2% | 24.2% | 0.0% |
| cantankerous | Pressure | 88 | 38.6% | 38.6% | 0.0% |
| captain | Zoning | 148 | 32.4% | 32.4% | 0.0% |
| captainhowdy | Pressure | 124 | 74.2% | 74.2% | 0.0% |
| ceo | Zoning | 112 | 32.1% | 32.1% | 0.0% |
| chaton | Pressure | 120 | 68.3% | 68.3% | 0.0% |
| chonky | Pressure | 152 | 80.3% | 80.3% | 0.0% |
| chrisfowler | Counter | 116 | 62.1% | 62.1% | 0.0% |
| ciphersproto | Pressure | 160 | 48.8% | 48.8% | 0.0% |
| clobrwn | Footwork | 144 | 65.3% | 65.3% | 0.0% |
| contresens | Zoning | 108 | 18.5% | 18.5% | 0.0% |
| corn | Pressure | 140 | 42.9% | 42.9% | 0.0% |
| crapto | Pressure | 132 | 29.5% | 29.5% | 0.0% |
| crippledlover | Footwork | 120 | 61.7% | 61.7% | 0.0% |
| croy | Counter | 156 | 46.2% | 46.2% | 0.0% |
| crumpleii | Brawler | 120 | 25.0% | 25.0% | 0.0% |
| cryptobartender | Zoning | 140 | 25.7% | 25.7% | 0.0% |
| cryptoboy | Counter | 100 | 55.0% | 55.0% | 0.0% |
| cryptomonger | Footwork | 132 | 50.0% | 50.0% | 0.0% |
| cryptorizzler | Counter | 140 | 52.1% | 52.1% | 0.0% |
| cryptoviking420 | Pressure | 136 | 42.6% | 42.6% | 0.0% |
| cyberviber | Pressure | 140 | 47.9% | 47.9% | 0.0% |
| d86 | Zoning | 128 | 43.8% | 43.8% | 0.0% |
| danocrypto | Pressure | 140 | 40.0% | 40.0% | 0.0% |
| davidcd | Pressure | 124 | 56.5% | 56.5% | 0.0% |
| degenpress | Zoning | 128 | 28.1% | 28.1% | 0.0% |
| dollarbitcoin | Brawler | 120 | 35.8% | 35.8% | 0.0% |
| drzmoody | Footwork | 156 | 51.3% | 51.3% | 0.0% |
| dumpstar | Pressure | 112 | 67.9% | 67.9% | 0.0% |
| duo | Paired | 164 | 46.9% | 46.9% | 1.2% |
| durlan | Footwork | 160 | 66.9% | 66.9% | 0.0% |
| emix | Pressure | 124 | 72.6% | 72.6% | 0.0% |
| erik | Pressure | 112 | 62.5% | 62.5% | 0.0% |
| familywagon | Brawler | 152 | 32.9% | 32.9% | 0.0% |
| feistyboi | Counter | 116 | 50.0% | 50.0% | 0.0% |
| felixsprotoarc | Zoning | 124 | 26.6% | 26.6% | 0.0% |
| fiatfudder | Pressure | 124 | 50.0% | 50.0% | 0.0% |
| forchaneth | Pressure | 108 | 72.2% | 72.2% | 0.0% |
| fplgremlin | Pressure | 116 | 44.8% | 44.8% | 0.0% |
| freedfrida | Footwork | 140 | 48.6% | 48.6% | 0.0% |
| frej | Counter | 112 | 39.3% | 39.3% | 0.0% |
| freshprince | Pressure | 156 | 60.3% | 60.3% | 0.0% |
| ghostsprotocol | Zoning | 124 | 40.3% | 40.3% | 0.0% |
| giavannykitchens | Pressure | 148 | 58.1% | 58.1% | 0.0% |
| glow | Counter | 144 | 43.8% | 43.8% | 0.0% |
| gluttony | Zoning | 140 | 33.6% | 33.6% | 0.0% |
| godether | Pressure | 124 | 62.9% | 62.9% | 0.0% |
| godmod3d | Paired | 112 | 42.0% | 42.0% | 0.0% |
| godsson | Counter | 156 | 48.7% | 48.7% | 0.0% |
| gpm | Pressure | 136 | 26.5% | 26.5% | 0.0% |
| greatcharly | Pressure | 136 | 66.2% | 66.2% | 0.0% |
| gryph | Paired | 120 | 40.0% | 40.0% | 0.0% |
| guest07 | Pressure | 148 | 65.5% | 65.5% | 0.0% |
| guest08 | Pressure | 180 | 38.3% | 38.3% | 0.0% |
| guest09 | Pressure | 108 | 63.0% | 63.0% | 0.0% |
| guest10 | Pressure | 124 | 41.1% | 41.1% | 0.0% |
| guest11 | Pressure | 156 | 52.6% | 52.6% | 0.0% |
| guest12 | Pressure | 136 | 32.4% | 32.4% | 0.0% |
| guest13 | Pressure | 124 | 67.7% | 67.7% | 0.0% |
| guest14 | Pressure | 152 | 64.5% | 64.5% | 0.0% |
| hdizzy | Zoning | 124 | 22.6% | 22.6% | 0.0% |
| herbpowell | Counter | 120 | 51.7% | 51.7% | 0.0% |
| hermionemichelleamyrose | Footwork | 124 | 49.2% | 49.2% | 1.6% |
| highsproto | Zoning | 144 | 11.1% | 11.1% | 0.0% |
| homosproto | Footwork | 160 | 69.4% | 69.4% | 0.0% |
| indiapolice | Counter | 148 | 28.4% | 28.4% | 0.0% |
| infinitysplitter | Pressure | 148 | 75.7% | 75.7% | 0.0% |
| isaac | Footwork | 144 | 76.4% | 76.4% | 0.0% |
| jameskaminski | Pressure | 136 | 27.9% | 27.9% | 0.0% |
| janitor | Brawler | 156 | 33.3% | 33.3% | 0.0% |
| jasper | Pressure | 132 | 70.5% | 70.5% | 0.0% |
| jayquant | Counter | 132 | 59.1% | 59.1% | 0.0% |
| johnson | Brawler | 136 | 28.4% | 28.4% | 1.5% |
| julian | Counter | 180 | 41.1% | 41.1% | 0.0% |
| kern | Counter | 140 | 48.6% | 48.6% | 0.0% |
| kerrieanne | Counter | 132 | 44.6% | 44.6% | 1.5% |
| laserbach | Pressure | 112 | 33.9% | 33.9% | 0.0% |
| lestrange | Footwork | 120 | 52.5% | 52.5% | 0.0% |
| leviosa | Pressure | 120 | 70.0% | 70.0% | 0.0% |
| lifeisameme | Pressure | 136 | 54.4% | 54.4% | 0.0% |
| lilgoldied | Counter | 128 | 56.3% | 56.3% | 0.0% |
| loadthebags | Pressure | 148 | 54.1% | 54.1% | 0.0% |
| loqi | Counter | 136 | 52.9% | 52.9% | 0.0% |
| lowernipple | Pressure | 160 | 32.5% | 32.5% | 0.0% |
| mandela | Pressure | 124 | 41.9% | 41.9% | 0.0% |
| marfrog | Footwork | 132 | 78.8% | 78.8% | 0.0% |
| maxbiggums | Brawler | 116 | 32.8% | 32.8% | 0.0% |
| melo | Weapon | 152 | 30.3% | 30.3% | 0.0% |
| michael | Pressure | 144 | 40.3% | 40.3% | 0.0% |
| micsash | Counter | 132 | 48.5% | 48.5% | 0.0% |
| mikemike | Brawler | 136 | 27.9% | 27.9% | 0.0% |
| mildtacos | Footwork | 108 | 50.0% | 50.0% | 0.0% |
| mlk | Pressure | 116 | 62.1% | 62.1% | 0.0% |
| moonshiller | Pressure | 124 | 22.6% | 22.6% | 0.0% |
| mox | Pressure | 104 | 59.6% | 59.6% | 0.0% |
| mrgoldrobe | Pressure | 148 | 56.8% | 56.8% | 0.0% |
| mrhorsemeat | Counter | 172 | 54.7% | 54.7% | 0.0% |
| nate | Pressure | 132 | 50.8% | 50.8% | 0.0% |
| nick | Pressure | 124 | 53.2% | 53.2% | 0.0% |
| nomis | Pressure | 120 | 40.0% | 40.0% | 0.0% |
| nosmileclown | Paired | 124 | 36.3% | 36.3% | 0.0% |
| np | Footwork | 148 | 69.9% | 69.9% | 1.4% |
| obamasega420 | Footwork | 140 | 60.0% | 60.0% | 0.0% |
| olnoname | Pressure | 124 | 58.1% | 58.1% | 0.0% |
| onememeaday | Pressure | 144 | 43.0% | 43.0% | 1.4% |
| osho | Pressure | 140 | 58.6% | 58.6% | 0.0% |
| otorps | Counter | 148 | 49.3% | 49.3% | 0.0% |
| pars | Brawler | 152 | 40.1% | 40.1% | 0.0% |
| peterpan | Paired | 120 | 43.3% | 43.3% | 0.0% |
| pilgrim | Brawler | 128 | 29.7% | 29.7% | 0.0% |
| pinewaffle | Pressure | 132 | 62.1% | 62.1% | 0.0% |
| pirate | Pressure | 136 | 70.6% | 70.6% | 0.0% |
| pongohpos10i | Zoning | 168 | 16.7% | 16.7% | 0.0% |
| potocaicai | Pressure | 136 | 52.2% | 52.2% | 1.5% |
| pr0lificeth | Zoning | 128 | 23.4% | 23.4% | 0.0% |
| prim | Pressure | 108 | 29.6% | 29.6% | 0.0% |
| rainman | Pressure | 136 | 62.5% | 62.5% | 0.0% |
| razz | Counter | 124 | 42.7% | 42.7% | 0.0% |
| realityarchitect | Pressure | 124 | 50.8% | 50.8% | 0.0% |
| rektina | Pressure | 88 | 79.5% | 79.5% | 0.0% |
| renzo | Pressure | 148 | 39.9% | 39.9% | 0.0% |
| reverend | Pressure | 124 | 72.6% | 72.6% | 0.0% |
| rivet | Pressure | 100 | 45.0% | 45.0% | 0.0% |
| rlarsson | Pressure | 144 | 68.1% | 68.1% | 0.0% |
| rmacpdx | Pressure | 148 | 58.8% | 58.8% | 0.0% |
| rune | Pressure | 132 | 53.8% | 53.8% | 0.0% |
| saburdo | Pressure | 164 | 33.5% | 33.5% | 0.0% |
| samixsproto | Zoning | 112 | 20.5% | 20.5% | 0.0% |
| satoshi | Pressure | 112 | 42.9% | 42.9% | 0.0% |
| seph0x | Counter | 144 | 51.4% | 51.4% | 0.0% |
| sidelinereferee | Zoning | 148 | 14.9% | 14.9% | 0.0% |
| sirbitcoin | Counter | 120 | 35.0% | 35.0% | 0.0% |
| sirdidit | Pressure | 128 | 68.8% | 68.8% | 0.0% |
| sisma | Pressure | 132 | 45.5% | 45.5% | 0.0% |
| slabcorn | Brawler | 124 | 46.8% | 46.8% | 0.0% |
| slakesly | Counter | 136 | 52.9% | 52.9% | 0.0% |
| sober | Pressure | 124 | 64.5% | 64.5% | 0.0% |
| solanadelray | Paired | 116 | 45.7% | 45.7% | 0.0% |
| sprog | Pressure | 152 | 61.8% | 61.8% | 0.0% |
| sproteth | Pressure | 132 | 75.8% | 75.8% | 0.0% |
| sproto1011 | Weapon | 152 | 39.5% | 39.5% | 0.0% |
| sproto102 | Pressure | 136 | 72.1% | 72.1% | 0.0% |
| sproto1093 | Pressure | 136 | 70.6% | 70.6% | 0.0% |
| sproto1187 | Pressure | 144 | 71.5% | 71.5% | 0.0% |
| sproto1335 | Pressure | 124 | 79.0% | 79.0% | 0.0% |
| sproto1345 | Pressure | 124 | 72.6% | 72.6% | 0.0% |
| sproto1414 | Pressure | 132 | 60.6% | 60.6% | 0.0% |
| sproto1477 | Pressure | 144 | 65.3% | 65.3% | 0.0% |
| sproto1499 | Paired | 132 | 43.9% | 43.9% | 0.0% |
| sproto1601 | Pressure | 116 | 24.1% | 24.1% | 0.0% |
| sproto1625 | Paired | 132 | 43.9% | 43.9% | 0.0% |
| sproto1668 | Pressure | 152 | 68.4% | 68.4% | 0.0% |
| sproto1815 | Weapon | 144 | 29.2% | 29.2% | 0.0% |
| sproto1870 | Hover | 144 | 49.3% | 49.3% | 0.0% |
| sproto2010 | Paired | 124 | 41.9% | 41.9% | 0.0% |
| sproto2075 | Paired | 140 | 49.3% | 49.3% | 1.4% |
| sproto2101 | Pressure | 120 | 70.0% | 70.0% | 0.0% |
| sproto215 | Pressure | 112 | 80.4% | 80.4% | 0.0% |
| sproto2177 | Pressure | 160 | 68.8% | 68.8% | 0.0% |
| sproto2210 | Paired | 128 | 46.9% | 46.9% | 0.0% |
| sproto2322 | Pressure | 140 | 70.0% | 70.0% | 0.0% |
| sproto2344 | Paired | 144 | 43.8% | 43.8% | 0.0% |
| sproto2381 | Pressure | 120 | 65.0% | 65.0% | 0.0% |
| sproto2531 | Pressure | 140 | 40.0% | 40.0% | 0.0% |
| sproto2569 | Pressure | 124 | 69.4% | 69.4% | 0.0% |
| sproto2616 | Weapon | 120 | 18.3% | 18.3% | 0.0% |
| sproto2789 | Weapon | 144 | 26.4% | 26.4% | 0.0% |
| sproto282 | Paired | 140 | 37.9% | 37.9% | 0.0% |
| sproto2884 | Pressure | 100 | 66.0% | 66.0% | 0.0% |
| sproto3106 | Pressure | 148 | 25.7% | 25.7% | 0.0% |
| sproto313 | Pressure | 124 | 71.8% | 71.8% | 0.0% |
| sproto3152 | Pressure | 144 | 31.9% | 31.9% | 0.0% |
| sproto3181 | Paired | 136 | 47.1% | 47.1% | 0.0% |
| sproto3215 | Pressure | 128 | 67.2% | 67.2% | 0.0% |
| sproto3224 | Paired | 116 | 46.6% | 46.6% | 0.0% |
| sproto3235 | Paired | 140 | 39.3% | 39.3% | 0.0% |
| sproto651 | Pressure | 116 | 75.9% | 75.9% | 0.0% |
| sproto704 | Paired | 112 | 39.3% | 39.3% | 0.0% |
| sproto763 | Pressure | 136 | 77.9% | 77.9% | 0.0% |
| sproto818 | Pressure | 132 | 65.9% | 65.9% | 0.0% |
| sproto831 | Pressure | 104 | 78.8% | 78.8% | 0.0% |
| sproto832 | Paired | 132 | 59.1% | 59.1% | 0.0% |
| sproto834 | Pressure | 100 | 72.0% | 72.0% | 0.0% |
| sproto837 | Pressure | 136 | 76.5% | 76.5% | 0.0% |
| sproto865 | Pressure | 112 | 75.0% | 75.0% | 0.0% |
| sproto943 | Pressure | 124 | 61.3% | 61.3% | 0.0% |
| sproto999 | Pressure | 136 | 61.8% | 61.8% | 0.0% |
| sprotocius | Counter | 132 | 50.0% | 50.0% | 0.0% |
| sprotolg | Zoning | 136 | 26.5% | 26.5% | 0.0% |
| sprotomichaelsaylor | Zoning | 136 | 38.2% | 38.2% | 0.0% |
| sprotomidnightfx | Pressure | 140 | 30.0% | 30.0% | 0.0% |
| sprotopia | Pressure | 124 | 26.6% | 26.6% | 0.0% |
| sprotopotamus | Pressure | 148 | 32.4% | 32.4% | 0.0% |
| sprotosales | Pressure | 124 | 69.4% | 69.4% | 0.0% |
| sprotosurvivor | Zoning | 112 | 12.5% | 12.5% | 0.0% |
| spruto | Pressure | 108 | 73.1% | 73.1% | 0.0% |
| spunow | Pressure | 96 | 81.3% | 81.3% | 0.0% |
| stonkyleg69 | Footwork | 140 | 64.3% | 64.3% | 0.0% |
| stoto | Pressure | 144 | 53.5% | 53.5% | 0.0% |
| sweatpantstrust | Counter | 132 | 47.0% | 47.0% | 0.0% |
| tdeth | Pressure | 132 | 65.2% | 65.2% | 0.0% |
| teahupoo | Counter | 132 | 51.5% | 51.5% | 0.0% |
| theo | Zoning | 140 | 29.3% | 29.3% | 0.0% |
| thesprotowholivedeth | Zoning | 148 | 27.0% | 27.0% | 0.0% |
| thxobama | Pressure | 132 | 57.6% | 57.6% | 0.0% |
| tingsmol | Footwork | 120 | 60.0% | 60.0% | 0.0% |
| tradertimmy | Counter | 140 | 47.9% | 47.9% | 0.0% |
| twinnyneutron | Paired | 132 | 53.0% | 53.0% | 0.0% |
| uncmasterflex | Pressure | 120 | 70.0% | 70.0% | 0.0% |
| urmometh | Pressure | 128 | 75.8% | 75.8% | 0.0% |
| usedtowels | Counter | 156 | 29.5% | 29.5% | 0.0% |
| vamp | Pressure | 120 | 44.2% | 44.2% | 0.0% |
| vaudream | Hover | 104 | 53.8% | 53.8% | 0.0% |
| vela | Hover | 148 | 39.2% | 39.2% | 0.0% |
| veryseriousinvestor | Footwork | 140 | 40.7% | 40.7% | 0.0% |
| vicoo | Counter | 152 | 63.8% | 63.8% | 0.0% |
| vitaliketh | Pressure | 144 | 62.5% | 62.5% | 0.0% |
| wifebeater | Pressure | 152 | 43.4% | 43.4% | 0.0% |
| willuminati | Pressure | 132 | 59.1% | 59.1% | 0.0% |
| wireitwell | Pressure | 136 | 47.8% | 47.8% | 0.0% |
| wyrmblvnt | Pressure | 140 | 60.7% | 60.7% | 0.0% |
| xalt | Pressure | 124 | 24.6% | 24.6% | 1.6% |
| xav | Pressure | 108 | 71.3% | 71.3% | 0.0% |
| yusuf | Pressure | 132 | 38.6% | 38.6% | 0.0% |
| zakarum | Footwork | 124 | 64.5% | 64.5% | 0.0% |
| zebracorn | Counter | 152 | 40.1% | 40.1% | 0.0% |
| zephyr | Pressure | 152 | 48.7% | 48.7% | 0.0% |
| zepump | Paired | 128 | 50.0% | 50.0% | 0.0% |
| zippy | Pressure | 136 | 36.8% | 36.8% | 0.0% |
| zudi | Counter | 124 | 60.5% | 60.5% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 4 | 0.0% |
| 86gwei vs bidnehhh | 4 | 0.0% |
| 86gwei vs freshprince | 4 | 0.0% |
| 86gwei vs gluttony | 4 | 100.0% |
| 86gwei vs homosproto | 4 | 0.0% |
| 86gwei vs julian | 4 | 100.0% |
| 86gwei vs mildtacos | 4 | 0.0% |
| 86gwei vs mox | 4 | 0.0% |
| 86gwei vs pongohpos10i | 4 | 100.0% |
| 86gwei vs sproto2789 | 4 | 0.0% |

## Skill 7

16736 bouts; raw draws 0.2% (30); unresolved 0.2% (30); timeouts 0. Mean 22.38 s; median 22.28 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 50.0% | 0.2% | 3.83 s |
| 2 | 50.0% | 50.0% | 0.2% | 3.83 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 2968 | 59.0% | 59.0% | 0.1% |
| Counter | 4376 | 49.4% | 49.4% | 0.0% |
| Pressure | 17460 | 55.8% | 55.8% | 0.2% |
| Zoning | 3060 | 28.9% | 28.9% | 0.5% |
| Paired | 2592 | 43.8% | 43.8% | 0.2% |
| Weapon | 712 | 33.7% | 33.7% | 0.8% |
| Brawler | 1908 | 35.8% | 35.8% | 0.1% |
| Hover | 396 | 35.9% | 35.9% | 0.0% |

Damage: melee 19012258; projectile 6546418; special 494484; throw 79082.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 128 | 50.8% | 50.8% | 0.0% |
| aaron | Pressure | 144 | 59.0% | 59.0% | 0.0% |
| accidentallyrich | Counter | 124 | 66.9% | 66.9% | 0.0% |
| agentsproto | Brawler | 104 | 32.7% | 32.7% | 0.0% |
| aktree | Zoning | 112 | 28.6% | 28.6% | 0.0% |
| aleksander | Pressure | 116 | 58.6% | 58.6% | 0.0% |
| alpha777 | Pressure | 128 | 57.8% | 57.8% | 0.0% |
| anni | Pressure | 116 | 57.8% | 57.8% | 0.0% |
| autistophrenicsprotagonist | Footwork | 116 | 60.3% | 60.3% | 0.0% |
| azkarah | Zoning | 92 | 26.7% | 26.7% | 2.2% |
| benjamin | Pressure | 144 | 62.5% | 62.5% | 0.0% |
| berserk | Footwork | 120 | 53.3% | 53.3% | 0.0% |
| bgbadger | Zoning | 96 | 14.9% | 14.9% | 2.1% |
| bidnehhh | Pressure | 116 | 50.0% | 50.0% | 0.0% |
| bigal | Brawler | 120 | 30.0% | 30.0% | 0.0% |
| bigswole | Brawler | 112 | 48.2% | 48.2% | 0.0% |
| bimba | Pressure | 140 | 74.3% | 74.3% | 0.0% |
| bitcoind1rk | Pressure | 164 | 62.2% | 62.2% | 0.0% |
| blorfo | Pressure | 168 | 41.7% | 41.7% | 0.0% |
| bobdobbs | Footwork | 152 | 55.3% | 55.3% | 0.0% |
| brainsprot | Pressure | 132 | 72.7% | 72.7% | 0.0% |
| bront | Brawler | 100 | 34.0% | 34.0% | 0.0% |
| bs9090eth | Zoning | 112 | 42.9% | 42.9% | 0.0% |
| buddhashadow | Pressure | 140 | 65.7% | 65.7% | 0.0% |
| cam | Brawler | 132 | 40.9% | 40.9% | 0.0% |
| cantankerous | Pressure | 88 | 31.8% | 31.8% | 0.0% |
| captain | Zoning | 148 | 31.8% | 31.8% | 0.0% |
| captainhowdy | Pressure | 124 | 71.0% | 71.0% | 0.0% |
| ceo | Zoning | 112 | 23.6% | 23.6% | 1.8% |
| chaton | Pressure | 120 | 72.5% | 72.5% | 0.0% |
| chonky | Pressure | 152 | 71.3% | 71.3% | 1.3% |
| chrisfowler | Counter | 116 | 43.1% | 43.1% | 0.0% |
| ciphersproto | Pressure | 160 | 50.0% | 50.0% | 0.0% |
| clobrwn | Footwork | 144 | 62.0% | 62.0% | 1.4% |
| contresens | Zoning | 108 | 29.6% | 29.6% | 0.0% |
| corn | Pressure | 140 | 42.9% | 42.9% | 0.0% |
| crapto | Pressure | 132 | 22.7% | 22.7% | 0.0% |
| crippledlover | Footwork | 120 | 76.7% | 76.7% | 0.0% |
| croy | Counter | 156 | 45.5% | 45.5% | 0.0% |
| crumpleii | Brawler | 120 | 38.3% | 38.3% | 0.0% |
| cryptobartender | Zoning | 140 | 29.3% | 29.3% | 0.0% |
| cryptoboy | Counter | 100 | 65.0% | 65.0% | 0.0% |
| cryptomonger | Footwork | 132 | 63.6% | 63.6% | 0.0% |
| cryptorizzler | Counter | 140 | 58.6% | 58.6% | 0.0% |
| cryptoviking420 | Pressure | 136 | 51.5% | 51.5% | 0.0% |
| cyberviber | Pressure | 140 | 40.0% | 40.0% | 0.0% |
| d86 | Zoning | 128 | 39.1% | 39.1% | 0.0% |
| danocrypto | Pressure | 140 | 35.7% | 35.7% | 0.0% |
| davidcd | Pressure | 124 | 67.7% | 67.7% | 0.0% |
| degenpress | Zoning | 128 | 25.0% | 25.0% | 0.0% |
| dollarbitcoin | Brawler | 120 | 39.0% | 39.0% | 1.7% |
| drzmoody | Footwork | 156 | 46.2% | 46.2% | 0.0% |
| dumpstar | Pressure | 112 | 42.0% | 42.0% | 0.0% |
| duo | Paired | 164 | 50.6% | 50.6% | 1.2% |
| durlan | Footwork | 160 | 74.4% | 74.4% | 0.0% |
| emix | Pressure | 124 | 65.3% | 65.3% | 0.0% |
| erik | Pressure | 112 | 75.0% | 75.0% | 0.0% |
| familywagon | Brawler | 152 | 34.2% | 34.2% | 0.0% |
| feistyboi | Counter | 116 | 55.2% | 55.2% | 0.0% |
| felixsprotoarc | Zoning | 124 | 24.2% | 24.2% | 0.0% |
| fiatfudder | Pressure | 124 | 49.2% | 49.2% | 0.0% |
| forchaneth | Pressure | 108 | 75.0% | 75.0% | 0.0% |
| fplgremlin | Pressure | 116 | 50.0% | 50.0% | 0.0% |
| freedfrida | Footwork | 140 | 47.1% | 47.1% | 0.0% |
| frej | Counter | 112 | 46.4% | 46.4% | 0.0% |
| freshprince | Pressure | 156 | 50.0% | 50.0% | 0.0% |
| ghostsprotocol | Zoning | 124 | 19.7% | 19.7% | 1.6% |
| giavannykitchens | Pressure | 148 | 52.7% | 52.7% | 0.0% |
| glow | Counter | 144 | 47.2% | 47.2% | 0.0% |
| gluttony | Zoning | 140 | 41.4% | 41.4% | 0.0% |
| godether | Pressure | 124 | 57.3% | 57.3% | 0.0% |
| godmod3d | Paired | 112 | 42.0% | 42.0% | 0.0% |
| godsson | Counter | 156 | 53.8% | 53.8% | 0.0% |
| gpm | Pressure | 136 | 29.4% | 29.4% | 0.0% |
| greatcharly | Pressure | 136 | 69.1% | 69.1% | 0.0% |
| gryph | Paired | 120 | 38.3% | 38.3% | 0.0% |
| guest07 | Pressure | 148 | 51.4% | 51.4% | 0.0% |
| guest08 | Pressure | 180 | 29.4% | 29.4% | 0.0% |
| guest09 | Pressure | 108 | 63.9% | 63.9% | 0.0% |
| guest10 | Pressure | 124 | 32.8% | 32.8% | 1.6% |
| guest11 | Pressure | 156 | 52.6% | 52.6% | 0.0% |
| guest12 | Pressure | 136 | 44.1% | 44.1% | 0.0% |
| guest13 | Pressure | 124 | 69.4% | 69.4% | 0.0% |
| guest14 | Pressure | 152 | 38.0% | 38.0% | 1.3% |
| hdizzy | Zoning | 124 | 38.7% | 38.7% | 0.0% |
| herbpowell | Counter | 120 | 44.2% | 44.2% | 0.0% |
| hermionemichelleamyrose | Footwork | 124 | 46.8% | 46.8% | 0.0% |
| highsproto | Zoning | 144 | 20.1% | 20.1% | 0.0% |
| homosproto | Footwork | 160 | 68.1% | 68.1% | 0.0% |
| indiapolice | Counter | 148 | 43.2% | 43.2% | 0.0% |
| infinitysplitter | Pressure | 148 | 77.0% | 77.0% | 0.0% |
| isaac | Footwork | 144 | 65.3% | 65.3% | 0.0% |
| jameskaminski | Pressure | 136 | 35.3% | 35.3% | 0.0% |
| janitor | Brawler | 156 | 33.3% | 33.3% | 0.0% |
| jasper | Pressure | 132 | 78.8% | 78.8% | 0.0% |
| jayquant | Counter | 132 | 58.3% | 58.3% | 0.0% |
| johnson | Brawler | 136 | 28.7% | 28.7% | 0.0% |
| julian | Counter | 180 | 49.4% | 49.4% | 0.0% |
| kern | Counter | 140 | 48.6% | 48.6% | 0.0% |
| kerrieanne | Counter | 132 | 34.1% | 34.1% | 0.0% |
| laserbach | Pressure | 112 | 40.2% | 40.2% | 0.0% |
| lestrange | Footwork | 120 | 49.2% | 49.2% | 0.0% |
| leviosa | Pressure | 120 | 68.3% | 68.3% | 0.0% |
| lifeisameme | Pressure | 136 | 47.1% | 47.1% | 0.0% |
| lilgoldied | Counter | 128 | 57.8% | 57.8% | 0.0% |
| loadthebags | Pressure | 148 | 51.4% | 51.4% | 0.0% |
| loqi | Counter | 136 | 58.1% | 58.1% | 0.0% |
| lowernipple | Pressure | 160 | 42.5% | 42.5% | 0.0% |
| mandela | Pressure | 124 | 37.1% | 37.1% | 0.0% |
| marfrog | Footwork | 132 | 63.6% | 63.6% | 0.0% |
| maxbiggums | Brawler | 116 | 33.6% | 33.6% | 0.0% |
| melo | Weapon | 152 | 35.3% | 35.3% | 1.3% |
| michael | Pressure | 144 | 41.0% | 41.0% | 0.0% |
| micsash | Counter | 132 | 55.4% | 55.4% | 1.5% |
| mikemike | Brawler | 136 | 39.0% | 39.0% | 0.0% |
| mildtacos | Footwork | 108 | 53.7% | 53.7% | 0.0% |
| mlk | Pressure | 116 | 51.7% | 51.7% | 0.0% |
| moonshiller | Pressure | 124 | 45.2% | 45.2% | 0.0% |
| mox | Pressure | 104 | 42.3% | 42.3% | 0.0% |
| mrgoldrobe | Pressure | 148 | 52.7% | 52.7% | 0.0% |
| mrhorsemeat | Counter | 172 | 58.1% | 58.1% | 0.0% |
| nate | Pressure | 132 | 40.9% | 40.9% | 0.0% |
| nick | Pressure | 124 | 56.7% | 56.7% | 3.2% |
| nomis | Pressure | 120 | 60.0% | 60.0% | 0.0% |
| nosmileclown | Paired | 124 | 35.5% | 35.5% | 0.0% |
| np | Footwork | 148 | 78.4% | 78.4% | 0.0% |
| obamasega420 | Footwork | 140 | 67.1% | 67.1% | 0.0% |
| olnoname | Pressure | 124 | 52.4% | 52.4% | 0.0% |
| onememeaday | Pressure | 144 | 47.9% | 47.9% | 1.4% |
| osho | Pressure | 140 | 69.3% | 69.3% | 0.0% |
| otorps | Counter | 148 | 47.3% | 47.3% | 0.0% |
| pars | Brawler | 152 | 42.1% | 42.1% | 0.0% |
| peterpan | Paired | 120 | 46.7% | 46.7% | 0.0% |
| pilgrim | Brawler | 128 | 35.9% | 35.9% | 0.0% |
| pinewaffle | Pressure | 132 | 45.5% | 45.5% | 0.0% |
| pirate | Pressure | 136 | 68.4% | 68.4% | 0.0% |
| pongohpos10i | Zoning | 168 | 28.6% | 28.6% | 0.0% |
| potocaicai | Pressure | 136 | 52.9% | 52.9% | 0.0% |
| pr0lificeth | Zoning | 128 | 28.2% | 28.2% | 3.1% |
| prim | Pressure | 108 | 29.6% | 29.6% | 0.0% |
| rainman | Pressure | 136 | 70.6% | 70.6% | 0.0% |
| razz | Counter | 124 | 42.7% | 42.7% | 0.0% |
| realityarchitect | Pressure | 124 | 48.4% | 48.4% | 0.0% |
| rektina | Pressure | 88 | 72.7% | 72.7% | 0.0% |
| renzo | Pressure | 148 | 50.0% | 50.0% | 0.0% |
| reverend | Pressure | 124 | 66.1% | 66.1% | 0.0% |
| rivet | Pressure | 100 | 43.0% | 43.0% | 0.0% |
| rlarsson | Pressure | 144 | 75.7% | 75.7% | 0.0% |
| rmacpdx | Pressure | 148 | 66.2% | 66.2% | 0.0% |
| rune | Pressure | 132 | 47.0% | 47.0% | 0.0% |
| saburdo | Pressure | 164 | 36.6% | 36.6% | 0.0% |
| samixsproto | Zoning | 112 | 34.8% | 34.8% | 0.0% |
| satoshi | Pressure | 112 | 46.4% | 46.4% | 0.0% |
| seph0x | Counter | 144 | 51.4% | 51.4% | 0.0% |
| sidelinereferee | Zoning | 148 | 28.8% | 28.8% | 1.4% |
| sirbitcoin | Counter | 120 | 43.3% | 43.3% | 0.0% |
| sirdidit | Pressure | 128 | 64.8% | 64.8% | 0.0% |
| sisma | Pressure | 132 | 40.0% | 40.0% | 1.5% |
| slabcorn | Brawler | 124 | 27.4% | 27.4% | 0.0% |
| slakesly | Counter | 136 | 36.8% | 36.8% | 0.0% |
| sober | Pressure | 124 | 62.9% | 62.9% | 0.0% |
| solanadelray | Paired | 116 | 44.8% | 44.8% | 0.0% |
| sprog | Pressure | 152 | 70.7% | 70.7% | 1.3% |
| sproteth | Pressure | 132 | 59.1% | 59.1% | 0.0% |
| sproto1011 | Weapon | 152 | 35.8% | 35.8% | 2.6% |
| sproto102 | Pressure | 136 | 75.0% | 75.0% | 0.0% |
| sproto1093 | Pressure | 136 | 69.1% | 69.1% | 0.0% |
| sproto1187 | Pressure | 144 | 68.8% | 68.8% | 0.0% |
| sproto1335 | Pressure | 124 | 70.2% | 70.2% | 0.0% |
| sproto1345 | Pressure | 124 | 80.6% | 80.6% | 0.0% |
| sproto1414 | Pressure | 132 | 68.2% | 68.2% | 0.0% |
| sproto1477 | Pressure | 144 | 62.5% | 62.5% | 0.0% |
| sproto1499 | Paired | 132 | 46.2% | 46.2% | 0.0% |
| sproto1601 | Pressure | 116 | 24.1% | 24.1% | 0.0% |
| sproto1625 | Paired | 132 | 47.7% | 47.7% | 0.0% |
| sproto1668 | Pressure | 152 | 63.2% | 63.2% | 0.0% |
| sproto1815 | Weapon | 144 | 40.3% | 40.3% | 0.0% |
| sproto1870 | Hover | 144 | 47.2% | 47.2% | 0.0% |
| sproto2010 | Paired | 124 | 43.5% | 43.5% | 0.0% |
| sproto2075 | Paired | 140 | 51.4% | 51.4% | 1.4% |
| sproto2101 | Pressure | 120 | 69.2% | 69.2% | 0.0% |
| sproto215 | Pressure | 112 | 72.7% | 72.7% | 1.8% |
| sproto2177 | Pressure | 160 | 73.8% | 73.8% | 0.0% |
| sproto2210 | Paired | 128 | 43.0% | 43.0% | 0.0% |
| sproto2322 | Pressure | 140 | 67.9% | 67.9% | 0.0% |
| sproto2344 | Paired | 144 | 34.0% | 34.0% | 0.0% |
| sproto2381 | Pressure | 120 | 72.5% | 72.5% | 0.0% |
| sproto2531 | Pressure | 140 | 37.9% | 37.9% | 0.0% |
| sproto2569 | Pressure | 124 | 74.2% | 74.2% | 0.0% |
| sproto2616 | Weapon | 120 | 18.3% | 18.3% | 0.0% |
| sproto2789 | Weapon | 144 | 36.1% | 36.1% | 0.0% |
| sproto282 | Paired | 140 | 45.0% | 45.0% | 0.0% |
| sproto2884 | Pressure | 100 | 58.0% | 58.0% | 0.0% |
| sproto3106 | Pressure | 148 | 25.7% | 25.7% | 0.0% |
| sproto313 | Pressure | 124 | 63.7% | 63.7% | 0.0% |
| sproto3152 | Pressure | 144 | 34.7% | 34.7% | 0.0% |
| sproto3181 | Paired | 136 | 54.4% | 54.4% | 0.0% |
| sproto3215 | Pressure | 128 | 68.8% | 68.8% | 0.0% |
| sproto3224 | Paired | 116 | 39.7% | 39.7% | 0.0% |
| sproto3235 | Paired | 140 | 42.9% | 42.9% | 0.0% |
| sproto651 | Pressure | 116 | 81.0% | 81.0% | 0.0% |
| sproto704 | Paired | 112 | 45.5% | 45.5% | 1.8% |
| sproto763 | Pressure | 136 | 73.5% | 73.5% | 0.0% |
| sproto818 | Pressure | 132 | 68.9% | 68.9% | 0.0% |
| sproto831 | Pressure | 104 | 68.3% | 68.3% | 0.0% |
| sproto832 | Paired | 132 | 43.9% | 43.9% | 0.0% |
| sproto834 | Pressure | 100 | 72.0% | 72.0% | 0.0% |
| sproto837 | Pressure | 136 | 72.7% | 72.7% | 2.9% |
| sproto865 | Pressure | 112 | 66.1% | 66.1% | 0.0% |
| sproto943 | Pressure | 124 | 67.7% | 67.7% | 0.0% |
| sproto999 | Pressure | 136 | 64.0% | 64.0% | 0.0% |
| sprotocius | Counter | 132 | 41.7% | 41.7% | 0.0% |
| sprotolg | Zoning | 136 | 19.1% | 19.1% | 0.0% |
| sprotomichaelsaylor | Zoning | 136 | 35.3% | 35.3% | 0.0% |
| sprotomidnightfx | Pressure | 140 | 39.3% | 39.3% | 0.0% |
| sprotopia | Pressure | 124 | 29.5% | 29.5% | 1.6% |
| sprotopotamus | Pressure | 148 | 48.6% | 48.6% | 0.0% |
| sprotosales | Pressure | 124 | 79.0% | 79.0% | 0.0% |
| sprotosurvivor | Zoning | 112 | 18.8% | 18.8% | 0.0% |
| spruto | Pressure | 108 | 71.3% | 71.3% | 0.0% |
| spunow | Pressure | 96 | 77.1% | 77.1% | 0.0% |
| stonkyleg69 | Footwork | 140 | 54.3% | 54.3% | 0.0% |
| stoto | Pressure | 144 | 43.8% | 43.8% | 0.0% |
| sweatpantstrust | Counter | 132 | 50.0% | 50.0% | 0.0% |
| tdeth | Pressure | 132 | 39.4% | 39.4% | 0.0% |
| teahupoo | Counter | 132 | 50.0% | 50.0% | 0.0% |
| theo | Zoning | 140 | 32.1% | 32.1% | 0.0% |
| thesprotowholivedeth | Zoning | 148 | 27.7% | 27.7% | 0.0% |
| thxobama | Pressure | 132 | 51.5% | 51.5% | 0.0% |
| tingsmol | Footwork | 120 | 51.7% | 51.7% | 0.0% |
| tradertimmy | Counter | 140 | 44.3% | 44.3% | 0.0% |
| twinnyneutron | Paired | 132 | 35.6% | 35.6% | 0.0% |
| uncmasterflex | Pressure | 120 | 70.0% | 70.0% | 0.0% |
| urmometh | Pressure | 128 | 79.7% | 79.7% | 0.0% |
| usedtowels | Counter | 156 | 32.7% | 32.7% | 0.0% |
| vamp | Pressure | 120 | 30.0% | 30.0% | 0.0% |
| vaudream | Hover | 104 | 40.4% | 40.4% | 0.0% |
| vela | Hover | 148 | 21.6% | 21.6% | 0.0% |
| veryseriousinvestor | Footwork | 140 | 54.3% | 54.3% | 0.0% |
| vicoo | Counter | 152 | 57.9% | 57.9% | 0.0% |
| vitaliketh | Pressure | 144 | 63.9% | 63.9% | 0.0% |
| wifebeater | Pressure | 152 | 34.2% | 34.2% | 0.0% |
| willuminati | Pressure | 132 | 49.2% | 49.2% | 0.0% |
| wireitwell | Pressure | 136 | 52.9% | 52.9% | 0.0% |
| wyrmblvnt | Pressure | 140 | 57.1% | 57.1% | 0.0% |
| xalt | Pressure | 124 | 26.6% | 26.6% | 0.0% |
| xav | Pressure | 108 | 66.7% | 66.7% | 0.0% |
| yusuf | Pressure | 132 | 52.3% | 52.3% | 0.0% |
| zakarum | Footwork | 124 | 48.4% | 48.4% | 0.0% |
| zebracorn | Counter | 152 | 44.1% | 44.1% | 0.0% |
| zephyr | Pressure | 152 | 43.4% | 43.4% | 0.0% |
| zepump | Paired | 128 | 43.0% | 43.0% | 0.0% |
| zippy | Pressure | 136 | 47.0% | 47.0% | 2.9% |
| zudi | Counter | 124 | 53.2% | 53.2% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs croy | 4 | 100.0% |
| 86gwei vs forchaneth | 4 | 0.0% |
| 86gwei vs glow | 4 | 0.0% |
| 86gwei vs homosproto | 4 | 0.0% |
| 86gwei vs julian | 4 | 100.0% |
| 86gwei vs mildtacos | 4 | 0.0% |
| 86gwei vs nomis | 4 | 0.0% |
| 86gwei vs np | 4 | 0.0% |
| 86gwei vs pongohpos10i | 4 | 100.0% |
| 86gwei vs sproto2381 | 4 | 0.0% |
