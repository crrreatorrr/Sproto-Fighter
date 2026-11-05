# Balance tournament

Source: `209f16eecfd0de1087a65234c9ef18826fa2e120`; simulation `af94139cc59e4dfd`; source SHA-256 `bb507d57a2f6c6d460f0258d7cb0c61070a50fd52a1252a3667758a79c5bb1fa`.

Seed 20261105; 254 fighters; 9347 sampled pairs; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. The seed controls opponent sampling; the legacy CPU itself has no randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes are analysis groupings of existing roles, not normalized gameplay templates. Small-sample extremes are diagnostic, not confidence bounds.

The current CPU has no skill parameter. Requested levels were collapsed to a single legacy baseline; Normal/Hard balance claims cannot yet be made.

Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

## Legacy CPU

18694 bouts; raw draws 55.2% (10323); unresolved 55.1% (10294); timeouts 0. Mean 15.29 s; median 15.25 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 49.9% | 55.2% | 1.15 s |
| 2 | 50.0% | 50.1% | 55.2% | 1.15 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 3260 | 67.4% | 67.3% | 65.5% |
| Counter | 4720 | 53.2% | 53.2% | 58.3% |
| Pressure | 19544 | 50.7% | 50.7% | 51.8% |
| Brawler | 2210 | 52.9% | 52.7% | 59.2% |
| Paired | 2924 | 33.6% | 33.2% | 61.4% |
| Zoning | 3520 | 50.5% | 50.5% | 57.3% |
| Hover | 444 | 38.7% | 38.8% | 32.7% |
| Weapon | 766 | 15.9% | 16.0% | 47.7% |

Damage: melee 30928600; projectile 6249654; special 0; throw 0.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 87.5% | 87.5% | 68.8% |
| aaron | Pressure | 158 | 4.1% | 4.1% | 38.0% |
| accidentallyrich | Counter | 136 | 84.0% | 84.0% | 63.2% |
| agentsproto | Brawler | 154 | 37.9% | 37.9% | 62.3% |
| aktree | Zoning | 144 | 87.5% | 87.5% | 66.7% |
| aleksander | Pressure | 150 | 80.0% | 80.0% | 73.3% |
| alpha777 | Pressure | 150 | 3.7% | 3.7% | 28.0% |
| anni | Pressure | 136 | 4.4% | 4.4% | 33.8% |
| autistophrenicsprotagonist | Footwork | 134 | 83.3% | 83.3% | 64.2% |
| azkarah | Zoning | 132 | 90.0% | 90.0% | 69.7% |
| benjamin | Pressure | 152 | 81.0% | 81.0% | 72.4% |
| berserk | Footwork | 138 | 90.0% | 90.0% | 71.0% |
| bgbadger | Zoning | 144 | 77.3% | 77.3% | 69.4% |
| bidnehhh | Pressure | 140 | 83.3% | 83.3% | 65.7% |
| bigal | Brawler | 128 | 67.9% | 67.9% | 56.3% |
| bigswole | Brawler | 142 | 0.0% | 0.0% | 9.9% |
| bimba | Pressure | 142 | 83.6% | 83.6% | 22.5% |
| bitcoind1rk | Pressure | 168 | 3.7% | 3.7% | 35.7% |
| blorfo | Pressure | 156 | 83.3% | 83.3% | 69.2% |
| bobdobbs | Footwork | 154 | 78.3% | 78.3% | 70.1% |
| brainsprot | Pressure | 146 | 98.5% | 99.2% | 13.0% |
| bront | Brawler | 138 | 0.0% | 0.0% | 17.4% |
| bs9090eth | Zoning | 148 | 78.6% | 78.6% | 62.2% |
| buddhashadow | Pressure | 162 | 95.3% | 95.2% | 48.1% |
| cam | Brawler | 148 | 73.1% | 73.1% | 64.9% |
| cantankerous | Pressure | 124 | 73.7% | 73.7% | 69.4% |
| captain | Zoning | 142 | 72.7% | 72.7% | 84.5% |
| captainhowdy | Pressure | 144 | 0.0% | 0.0% | 23.6% |
| ceo | Zoning | 148 | 81.5% | 81.5% | 63.5% |
| chaton | Pressure | 146 | 9.1% | 9.1% | 84.9% |
| chonky | Pressure | 156 | 76.5% | 76.5% | 78.2% |
| chrisfowler | Counter | 126 | 81.0% | 81.0% | 66.7% |
| ciphersproto | Pressure | 154 | 69.7% | 69.7% | 57.1% |
| clobrwn | Footwork | 144 | 80.8% | 80.8% | 63.9% |
| contresens | Zoning | 148 | 0.0% | 0.0% | 1.4% |
| corn | Pressure | 148 | 78.3% | 78.3% | 68.9% |
| crapto | Pressure | 134 | 94.0% | 98.4% | 4.5% |
| crippledlover | Footwork | 146 | 29.2% | 29.2% | 67.1% |
| croy | Counter | 152 | 82.4% | 82.4% | 77.6% |
| crumpleii | Brawler | 158 | 76.0% | 75.5% | 69.0% |
| cryptobartender | Zoning | 148 | 71.4% | 71.4% | 62.2% |
| cryptoboy | Counter | 146 | 90.0% | 90.0% | 58.9% |
| cryptomonger | Footwork | 132 | 92.9% | 92.9% | 78.8% |
| cryptorizzler | Counter | 168 | 88.0% | 88.0% | 70.2% |
| cryptoviking420 | Pressure | 162 | 97.0% | 97.0% | 59.3% |
| cyberviber | Pressure | 170 | 76.9% | 76.9% | 69.4% |
| d86 | Zoning | 168 | 78.3% | 78.3% | 45.2% |
| danocrypto | Pressure | 140 | 72.7% | 72.7% | 68.6% |
| davidcd | Pressure | 146 | 5.8% | 5.8% | 28.8% |
| degenpress | Zoning | 148 | 85.7% | 85.7% | 62.2% |
| dollarbitcoin | Brawler | 136 | 81.5% | 81.1% | 61.0% |
| drzmoody | Footwork | 154 | 70.4% | 70.4% | 64.9% |
| dumpstar | Pressure | 144 | 100.0% | 100.0% | 20.8% |
| duo | Paired | 164 | 42.9% | 42.9% | 74.4% |
| durlan | Footwork | 158 | 33.3% | 33.3% | 46.8% |
| emix | Pressure | 140 | 80.0% | 80.0% | 64.3% |
| erik | Pressure | 130 | 41.9% | 41.9% | 52.3% |
| familywagon | Brawler | 150 | 76.0% | 76.0% | 66.7% |
| feistyboi | Counter | 134 | 73.9% | 73.9% | 65.7% |
| felixsprotoarc | Zoning | 146 | 17.8% | 17.8% | 38.4% |
| fiatfudder | Pressure | 138 | 77.3% | 77.3% | 68.1% |
| forchaneth | Pressure | 128 | 87.5% | 87.1% | 75.8% |
| fplgremlin | Pressure | 144 | 92.9% | 92.9% | 61.1% |
| freedfrida | Footwork | 146 | 77.8% | 77.8% | 75.3% |
| frej | Counter | 140 | 4.9% | 4.9% | 41.4% |
| freshprince | Pressure | 162 | 83.3% | 83.3% | 63.0% |
| ghostsprotocol | Zoning | 142 | 7.8% | 7.8% | 28.2% |
| giavannykitchens | Pressure | 140 | 82.9% | 82.9% | 50.0% |
| glow | Counter | 156 | 86.4% | 86.4% | 71.8% |
| gluttony | Zoning | 138 | 0.0% | 0.0% | 2.9% |
| godether | Pressure | 134 | 75.0% | 75.0% | 64.2% |
| godmod3d | Paired | 136 | 88.9% | 88.9% | 73.5% |
| godsson | Counter | 154 | 89.5% | 89.5% | 75.3% |
| gpm | Pressure | 154 | 98.6% | 98.6% | 9.1% |
| greatcharly | Pressure | 150 | 2.1% | 2.1% | 37.3% |
| gryph | Paired | 130 | 88.9% | 88.9% | 86.2% |
| guest07 | Pressure | 154 | 1.9% | 1.9% | 31.2% |
| guest08 | Pressure | 170 | 0.0% | 0.0% | 2.4% |
| guest09 | Pressure | 142 | 100.0% | 100.0% | 14.1% |
| guest10 | Pressure | 138 | 80.0% | 80.0% | 92.8% |
| guest11 | Pressure | 144 | 20.0% | 20.0% | 93.1% |
| guest12 | Pressure | 140 | 6.7% | 6.7% | 35.7% |
| guest13 | Pressure | 156 | 98.6% | 98.6% | 6.4% |
| guest14 | Pressure | 174 | 1.4% | 1.4% | 18.4% |
| hdizzy | Zoning | 134 | 92.0% | 91.8% | 63.4% |
| herbpowell | Counter | 126 | 9.8% | 9.8% | 34.9% |
| hermionemichelleamyrose | Footwork | 138 | 88.0% | 88.0% | 63.8% |
| highsproto | Zoning | 162 | 77.4% | 77.4% | 61.7% |
| homosproto | Footwork | 166 | 23.1% | 23.1% | 53.0% |
| indiapolice | Counter | 148 | 2.1% | 2.1% | 36.5% |
| infinitysplitter | Pressure | 150 | 85.0% | 85.0% | 73.3% |
| isaac | Footwork | 154 | 85.7% | 85.5% | 64.3% |
| jameskaminski | Pressure | 156 | 79.2% | 79.2% | 69.2% |
| janitor | Brawler | 158 | 82.1% | 82.1% | 64.6% |
| jasper | Pressure | 138 | 10.0% | 10.1% | 28.3% |
| jayquant | Counter | 144 | 83.3% | 83.3% | 66.7% |
| johnson | Brawler | 144 | 86.4% | 86.4% | 69.4% |
| julian | Counter | 170 | 78.8% | 78.8% | 61.2% |
| kern | Counter | 144 | 76.2% | 76.2% | 70.8% |
| kerrieanne | Counter | 144 | 75.0% | 75.0% | 66.7% |
| laserbach | Pressure | 138 | 82.6% | 82.6% | 66.7% |
| lestrange | Footwork | 146 | 81.0% | 81.0% | 71.2% |
| leviosa | Pressure | 140 | 82.4% | 82.4% | 75.7% |
| lifeisameme | Pressure | 146 | 88.0% | 88.0% | 65.8% |
| lilgoldied | Counter | 156 | 7.3% | 7.3% | 29.5% |
| loadthebags | Pressure | 166 | 4.0% | 4.0% | 39.8% |
| loqi | Counter | 138 | 80.0% | 80.0% | 56.5% |
| lowernipple | Pressure | 154 | 50.0% | 50.0% | 48.1% |
| mandela | Pressure | 148 | 5.8% | 5.8% | 6.8% |
| marfrog | Footwork | 146 | 71.4% | 70.9% | 62.3% |
| maxbiggums | Brawler | 144 | 78.9% | 78.9% | 73.6% |
| melo | Weapon | 156 | 91.3% | 91.3% | 70.5% |
| michael | Pressure | 156 | 66.7% | 66.7% | 65.4% |
| micsash | Counter | 142 | 80.0% | 80.0% | 57.7% |
| mikemike | Brawler | 164 | 73.1% | 73.1% | 68.3% |
| mildtacos | Footwork | 136 | 75.0% | 75.0% | 70.6% |
| mlk | Pressure | 142 | 81.0% | 81.0% | 70.4% |
| moonshiller | Pressure | 152 | 79.2% | 79.2% | 68.4% |
| mox | Pressure | 152 | 97.6% | 97.6% | 46.1% |
| mrgoldrobe | Pressure | 142 | 78.6% | 78.6% | 60.6% |
| mrhorsemeat | Counter | 180 | 78.8% | 78.8% | 63.3% |
| nate | Pressure | 144 | 0.0% | 0.0% | 34.7% |
| nick | Pressure | 150 | 39.5% | 39.5% | 49.3% |
| nomis | Pressure | 142 | 87.0% | 87.0% | 67.6% |
| nosmileclown | Paired | 150 | 92.3% | 92.3% | 82.7% |
| np | Footwork | 178 | 86.7% | 86.7% | 66.3% |
| obamasega420 | Footwork | 150 | 65.6% | 65.6% | 57.3% |
| olnoname | Pressure | 140 | 100.0% | 100.0% | 47.1% |
| onememeaday | Pressure | 158 | 95.7% | 95.7% | 70.9% |
| osho | Pressure | 152 | 77.8% | 77.8% | 64.5% |
| otorps | Counter | 146 | 6.1% | 6.1% | 32.9% |
| pars | Brawler | 164 | 53.3% | 53.3% | 63.4% |
| peterpan | Paired | 140 | 84.2% | 84.2% | 72.9% |
| pilgrim | Brawler | 144 | 76.7% | 76.3% | 59.0% |
| pinewaffle | Pressure | 150 | 9.8% | 9.8% | 32.0% |
| pirate | Pressure | 138 | 63.6% | 63.6% | 68.1% |
| pongohpos10i | Zoning | 158 | 77.8% | 77.8% | 65.8% |
| potocaicai | Pressure | 154 | 76.7% | 76.7% | 61.0% |
| pr0lificeth | Zoning | 158 | 74.2% | 74.2% | 60.8% |
| prim | Pressure | 138 | 74.3% | 74.3% | 49.3% |
| rainman | Pressure | 150 | 38.7% | 38.7% | 58.7% |
| razz | Counter | 144 | 77.4% | 77.4% | 56.9% |
| realityarchitect | Pressure | 146 | 79.2% | 79.2% | 67.1% |
| rektina | Pressure | 134 | 85.0% | 85.0% | 70.1% |
| renzo | Pressure | 148 | 100.0% | 100.0% | 62.2% |
| reverend | Pressure | 146 | 7.7% | 7.7% | 28.8% |
| rivet | Pressure | 116 | 97.5% | 97.5% | 31.0% |
| rlarsson | Pressure | 146 | 92.3% | 92.3% | 82.2% |
| rmacpdx | Pressure | 152 | 88.9% | 88.9% | 76.3% |
| rune | Pressure | 146 | 100.0% | 100.0% | 95.9% |
| saburdo | Pressure | 168 | 82.6% | 82.6% | 72.6% |
| samixsproto | Zoning | 138 | 9.3% | 9.3% | 37.7% |
| satoshi | Pressure | 132 | 78.3% | 77.8% | 65.9% |
| seph0x | Counter | 148 | 85.2% | 85.2% | 63.5% |
| sidelinereferee | Zoning | 142 | 65.4% | 65.4% | 63.4% |
| sirbitcoin | Counter | 140 | 78.6% | 78.6% | 60.0% |
| sirdidit | Pressure | 142 | 17.5% | 17.5% | 43.7% |
| sisma | Pressure | 144 | 3.9% | 4.0% | 29.9% |
| slabcorn | Brawler | 138 | 93.8% | 93.8% | 76.8% |
| slakesly | Counter | 148 | 60.0% | 60.0% | 66.2% |
| sober | Pressure | 154 | 53.1% | 53.1% | 58.4% |
| solanadelray | Paired | 144 | 100.0% | 100.0% | 72.2% |
| sprog | Pressure | 150 | 6.0% | 6.0% | 33.3% |
| sproteth | Pressure | 144 | 81.8% | 81.8% | 54.2% |
| sproto1011 | Weapon | 158 | 1.8% | 1.8% | 29.7% |
| sproto102 | Pressure | 154 | 2.2% | 2.2% | 40.3% |
| sproto1093 | Pressure | 134 | 9.1% | 9.1% | 83.6% |
| sproto1187 | Pressure | 166 | 5.5% | 5.5% | 33.7% |
| sproto1335 | Pressure | 144 | 2.0% | 2.0% | 29.9% |
| sproto1345 | Pressure | 148 | 2.1% | 2.1% | 36.5% |
| sproto1414 | Pressure | 162 | 95.3% | 95.3% | 21.0% |
| sproto1477 | Pressure | 158 | 33.3% | 33.3% | 50.6% |
| sproto1499 | Paired | 154 | 85.0% | 85.0% | 74.0% |
| sproto1601 | Pressure | 148 | 78.6% | 78.6% | 81.1% |
| sproto1625 | Paired | 148 | 94.7% | 94.7% | 74.3% |
| sproto1668 | Pressure | 162 | 86.5% | 86.5% | 54.3% |
| sproto1815 | Weapon | 164 | 3.6% | 3.6% | 32.9% |
| sproto1870 | Hover | 140 | 2.1% | 2.1% | 31.4% |
| sproto2010 | Paired | 134 | 1.8% | 1.8% | 15.7% |
| sproto2075 | Paired | 150 | 3.4% | 3.4% | 21.3% |
| sproto2101 | Pressure | 134 | 4.7% | 4.7% | 35.8% |
| sproto215 | Pressure | 140 | 2.9% | 2.9% | 50.0% |
| sproto2177 | Pressure | 162 | 8.9% | 8.9% | 44.4% |
| sproto2210 | Paired | 142 | 7.1% | 7.1% | 40.8% |
| sproto2322 | Pressure | 156 | 55.1% | 55.1% | 37.2% |
| sproto2344 | Paired | 152 | 63.6% | 63.6% | 71.1% |
| sproto2381 | Pressure | 148 | 75.0% | 75.0% | 67.6% |
| sproto2531 | Pressure | 152 | 100.0% | 100.0% | 36.8% |
| sproto2569 | Pressure | 134 | 85.7% | 85.7% | 68.7% |
| sproto2616 | Weapon | 144 | 46.7% | 46.7% | 79.2% |
| sproto2789 | Weapon | 144 | 1.9% | 1.9% | 27.8% |
| sproto282 | Paired | 150 | 0.0% | 0.0% | 20.7% |
| sproto2884 | Pressure | 146 | 30.0% | 30.0% | 86.3% |
| sproto3106 | Pressure | 132 | 4.2% | 4.2% | 27.3% |
| sproto313 | Pressure | 136 | 4.2% | 4.2% | 29.4% |
| sproto3152 | Pressure | 152 | 3.8% | 3.8% | 31.6% |
| sproto3181 | Paired | 150 | 13.9% | 13.9% | 52.0% |
| sproto3215 | Pressure | 150 | 76.7% | 76.7% | 20.0% |
| sproto3224 | Paired | 144 | 13.3% | 13.3% | 58.3% |
| sproto3235 | Paired | 154 | 6.1% | 6.1% | 57.1% |
| sproto651 | Pressure | 134 | 92.9% | 93.7% | 17.2% |
| sproto704 | Paired | 140 | 13.3% | 13.3% | 57.1% |
| sproto763 | Pressure | 152 | 6.4% | 6.4% | 38.2% |
| sproto818 | Pressure | 128 | 2.2% | 2.2% | 30.5% |
| sproto831 | Pressure | 130 | 67.4% | 68.1% | 30.0% |
| sproto832 | Paired | 144 | 100.0% | 100.0% | 75.0% |
| sproto834 | Pressure | 122 | 60.9% | 60.9% | 62.3% |
| sproto837 | Pressure | 144 | 80.0% | 80.0% | 58.3% |
| sproto865 | Pressure | 140 | 98.2% | 98.2% | 20.0% |
| sproto943 | Pressure | 130 | 0.0% | 0.0% | 67.7% |
| sproto999 | Pressure | 156 | 1.6% | 1.6% | 19.2% |
| sprotocius | Counter | 146 | 67.9% | 67.9% | 61.6% |
| sprotolg | Zoning | 146 | 64.0% | 64.0% | 65.8% |
| sprotomichaelsaylor | Zoning | 132 | 81.0% | 81.0% | 68.2% |
| sprotomidnightfx | Pressure | 160 | 93.1% | 93.1% | 63.7% |
| sprotopia | Pressure | 138 | 87.0% | 87.0% | 66.7% |
| sprotopotamus | Pressure | 158 | 16.0% | 16.0% | 68.4% |
| sprotosales | Pressure | 136 | 23.5% | 23.5% | 25.0% |
| sprotosurvivor | Zoning | 146 | 60.0% | 60.0% | 65.8% |
| spruto | Pressure | 138 | 81.0% | 80.5% | 70.3% |
| spunow | Pressure | 126 | 82.6% | 82.6% | 63.5% |
| stonkyleg69 | Footwork | 146 | 68.8% | 68.8% | 78.1% |
| stoto | Pressure | 166 | 5.8% | 5.8% | 37.3% |
| sweatpantstrust | Counter | 140 | 74.2% | 74.2% | 55.7% |
| tdeth | Pressure | 140 | 14.3% | 14.3% | 30.0% |
| teahupoo | Counter | 138 | 2.5% | 2.5% | 42.0% |
| theo | Zoning | 162 | 71.4% | 71.4% | 91.4% |
| thesprotowholivedeth | Zoning | 146 | 71.4% | 70.7% | 71.9% |
| thxobama | Pressure | 140 | 91.7% | 91.7% | 65.7% |
| tingsmol | Footwork | 138 | 95.2% | 95.2% | 69.6% |
| tradertimmy | Counter | 144 | 7.5% | 7.6% | 45.1% |
| twinnyneutron | Paired | 146 | 100.0% | 100.0% | 80.1% |
| uncmasterflex | Pressure | 156 | 100.0% | 100.0% | 17.9% |
| urmometh | Pressure | 140 | 80.8% | 80.8% | 62.9% |
| usedtowels | Counter | 158 | 76.7% | 76.7% | 62.0% |
| vamp | Pressure | 152 | 33.3% | 33.3% | 96.1% |
| vaudream | Hover | 146 | 12.2% | 12.4% | 33.6% |
| vela | Hover | 158 | 96.2% | 96.2% | 32.9% |
| veryseriousinvestor | Footwork | 144 | 30.6% | 30.6% | 50.0% |
| vicoo | Counter | 150 | 17.1% | 17.1% | 45.3% |
| vitaliketh | Pressure | 156 | 93.8% | 93.8% | 79.5% |
| wifebeater | Pressure | 146 | 82.6% | 82.6% | 68.5% |
| willuminati | Pressure | 150 | 85.7% | 85.7% | 62.7% |
| wireitwell | Pressure | 148 | 13.9% | 14.1% | 52.0% |
| wyrmblvnt | Pressure | 156 | 85.7% | 85.7% | 64.1% |
| xalt | Pressure | 152 | 73.1% | 73.1% | 65.8% |
| xav | Pressure | 140 | 86.4% | 86.4% | 68.6% |
| yusuf | Pressure | 144 | 87.5% | 87.5% | 77.8% |
| zakarum | Footwork | 158 | 73.1% | 73.1% | 67.1% |
| zebracorn | Counter | 164 | 72.4% | 72.4% | 64.6% |
| zephyr | Pressure | 156 | 0.0% | 0.0% | 98.7% |
| zepump | Paired | 152 | 16.1% | 16.0% | 67.1% |
| zippy | Pressure | 162 | 84.4% | 84.4% | 60.5% |
| zudi | Counter | 150 | 84.0% | 84.0% | 66.7% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs alpha777 | 2 | 100.0% |
| 86gwei vs bitcoind1rk | 2 | 100.0% |
| 86gwei vs bront | 2 | 100.0% |
| 86gwei vs ghostsprotocol | 2 | 100.0% |
| 86gwei vs gluttony | 2 | 100.0% |
| 86gwei vs greatcharly | 2 | 100.0% |
| 86gwei vs guest09 | 2 | 0.0% |
| 86gwei vs guest12 | 2 | 100.0% |
| 86gwei vs guest13 | 2 | 0.0% |
| 86gwei vs guest14 | 2 | 100.0% |

