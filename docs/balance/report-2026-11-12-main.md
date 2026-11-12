# Balance tournament

Source: `4c6de7fd013b291400fb88ec4f8ea357b22c0144`; simulation `a23b4cb178899af9`; source SHA-256 `6ff4717b2f6f23bffd2db987312eb9b70cddf31b4926c1d52804f91262e097b9`.

Seed 20261105; 254 fighters; 9347 sampled pairs; 1 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes use canonical BALANCE_KITS assignments when available; legacy cores use analysis groupings of existing roles. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 4

18694 bouts; raw draws 0.1% (10); unresolved 0.0% (8); timeouts 0. Mean 26.74 s; median 26.83 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 49.8% | 49.8% | 0.1% | 4.97 s |
| 2 | 50.2% | 50.2% | 0.1% | 4.97 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 12422 | 45.1% | 45.1% | 0.1% |
| Counter | 7260 | 53.2% | 53.2% | 0.1% |
| Pressure | 4572 | 49.2% | 49.2% | 0.0% |
| Brawler | 3120 | 53.8% | 53.8% | 0.0% |
| Paired | 2924 | 50.8% | 50.9% | 0.1% |
| Zoning | 5578 | 54.2% | 54.2% | 0.0% |
| Weapon | 1226 | 53.6% | 53.6% | 0.0% |
| Hover | 286 | 44.8% | 44.8% | 0.0% |

Damage: melee 22103149; projectile 4862854; special 984229; throw 2492055.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 45.5% | 45.5% | 0.0% |
| aaron | Footwork | 158 | 47.5% | 47.5% | 0.0% |
| accidentallyrich | Counter | 136 | 42.6% | 42.6% | 0.0% |
| agentsproto | Brawler | 154 | 48.7% | 48.7% | 0.0% |
| aktree | Zoning | 144 | 45.8% | 45.8% | 0.0% |
| aleksander | Counter | 150 | 55.3% | 55.3% | 0.0% |
| alpha777 | Pressure | 150 | 49.3% | 49.3% | 0.0% |
| anni | Pressure | 136 | 68.4% | 68.4% | 0.0% |
| autistophrenicsprotagonist | Footwork | 134 | 45.5% | 45.5% | 1.5% |
| azkarah | Zoning | 132 | 57.6% | 57.6% | 0.0% |
| benjamin | Footwork | 152 | 40.8% | 40.8% | 0.0% |
| berserk | Footwork | 138 | 41.9% | 41.9% | 1.4% |
| bgbadger | Zoning | 144 | 61.1% | 61.1% | 0.0% |
| bidnehhh | Pressure | 140 | 55.7% | 55.7% | 0.0% |
| bigal | Brawler | 128 | 53.9% | 53.9% | 0.0% |
| bigswole | Brawler | 142 | 55.6% | 55.6% | 0.0% |
| bimba | Footwork | 142 | 33.8% | 33.8% | 0.0% |
| bitcoind1rk | Footwork | 168 | 53.0% | 53.0% | 0.0% |
| blorfo | Weapon | 156 | 55.1% | 55.1% | 0.0% |
| bobdobbs | Footwork | 154 | 38.3% | 38.3% | 0.0% |
| brainsprot | Footwork | 146 | 37.0% | 37.0% | 0.0% |
| bront | Brawler | 138 | 57.2% | 57.2% | 0.0% |
| bs9090eth | Zoning | 148 | 56.8% | 56.8% | 0.0% |
| buddhashadow | Footwork | 162 | 42.6% | 42.6% | 0.0% |
| cam | Brawler | 148 | 57.4% | 57.4% | 0.0% |
| cantankerous | Pressure | 124 | 52.4% | 52.4% | 0.0% |
| captain | Zoning | 142 | 61.3% | 61.3% | 0.0% |
| captainhowdy | Footwork | 144 | 46.5% | 46.5% | 0.0% |
| ceo | Zoning | 148 | 58.8% | 58.8% | 0.0% |
| chaton | Footwork | 146 | 52.1% | 52.1% | 0.0% |
| chonky | Footwork | 156 | 42.9% | 42.9% | 0.0% |
| chrisfowler | Counter | 126 | 57.9% | 57.9% | 0.0% |
| ciphersproto | Pressure | 154 | 44.8% | 44.8% | 0.0% |
| clobrwn | Footwork | 144 | 59.0% | 59.0% | 0.0% |
| contresens | Zoning | 148 | 53.4% | 53.4% | 0.0% |
| corn | Pressure | 148 | 59.5% | 59.5% | 0.0% |
| crapto | Zoning | 134 | 49.3% | 49.3% | 0.0% |
| crippledlover | Footwork | 146 | 31.5% | 31.5% | 0.0% |
| croy | Counter | 152 | 48.7% | 48.7% | 0.0% |
| crumpleii | Brawler | 158 | 54.4% | 54.4% | 0.0% |
| cryptobartender | Zoning | 148 | 54.7% | 54.7% | 0.0% |
| cryptoboy | Counter | 146 | 48.6% | 48.6% | 0.0% |
| cryptomonger | Footwork | 132 | 47.7% | 47.7% | 0.0% |
| cryptorizzler | Counter | 168 | 50.0% | 50.0% | 0.0% |
| cryptoviking420 | Pressure | 162 | 53.1% | 53.1% | 0.0% |
| cyberviber | Counter | 170 | 45.3% | 45.3% | 0.0% |
| d86 | Zoning | 168 | 53.0% | 53.0% | 0.0% |
| danocrypto | Counter | 140 | 56.4% | 56.4% | 0.0% |
| davidcd | Footwork | 146 | 43.8% | 43.8% | 0.0% |
| degenpress | Zoning | 148 | 50.0% | 50.0% | 0.0% |
| dollarbitcoin | Brawler | 136 | 58.8% | 58.8% | 0.0% |
| drzmoody | Footwork | 154 | 45.5% | 45.5% | 0.0% |
| dumpstar | Brawler | 144 | 48.6% | 48.6% | 0.0% |
| duo | Paired | 164 | 53.7% | 53.7% | 0.0% |
| durlan | Footwork | 158 | 50.6% | 50.6% | 0.0% |
| emix | Footwork | 140 | 39.3% | 39.3% | 0.0% |
| erik | Footwork | 130 | 56.9% | 56.9% | 0.0% |
| familywagon | Brawler | 150 | 49.3% | 49.3% | 0.0% |
| feistyboi | Counter | 134 | 54.5% | 54.5% | 1.5% |
| felixsprotoarc | Zoning | 146 | 53.4% | 53.4% | 0.0% |
| fiatfudder | Counter | 138 | 53.7% | 53.7% | 1.4% |
| forchaneth | Footwork | 128 | 53.1% | 53.1% | 0.0% |
| fplgremlin | Pressure | 144 | 47.2% | 47.2% | 0.0% |
| freedfrida | Footwork | 146 | 47.9% | 47.9% | 0.0% |
| frej | Counter | 140 | 51.4% | 51.4% | 0.0% |
| freshprince | Counter | 162 | 61.7% | 61.7% | 0.0% |
| ghostsprotocol | Zoning | 142 | 47.9% | 47.9% | 0.0% |
| giavannykitchens | Pressure | 140 | 53.6% | 53.6% | 0.0% |
| glow | Counter | 156 | 45.5% | 45.5% | 0.0% |
| gluttony | Zoning | 138 | 52.2% | 52.2% | 0.0% |
| godether | Counter | 134 | 44.0% | 44.0% | 0.0% |
| godmod3d | Paired | 136 | 49.3% | 49.3% | 0.0% |
| godsson | Counter | 154 | 61.0% | 61.0% | 0.0% |
| gpm | Brawler | 154 | 48.1% | 48.1% | 0.0% |
| greatcharly | Footwork | 150 | 42.0% | 42.0% | 0.0% |
| gryph | Paired | 130 | 48.5% | 48.5% | 0.0% |
| guest07 | Pressure | 154 | 44.2% | 44.2% | 0.0% |
| guest08 | Zoning | 170 | 58.8% | 58.6% | 0.6% |
| guest09 | Pressure | 142 | 38.7% | 38.7% | 0.0% |
| guest10 | Zoning | 138 | 50.0% | 50.0% | 0.0% |
| guest11 | Counter | 144 | 51.4% | 51.4% | 0.0% |
| guest12 | Zoning | 140 | 54.3% | 54.3% | 0.0% |
| guest13 | Counter | 156 | 49.4% | 49.4% | 0.0% |
| guest14 | Counter | 174 | 44.8% | 44.8% | 0.0% |
| hdizzy | Zoning | 134 | 50.0% | 50.0% | 0.0% |
| herbpowell | Counter | 126 | 69.0% | 69.0% | 0.0% |
| hermionemichelleamyrose | Footwork | 138 | 41.3% | 41.3% | 0.0% |
| highsproto | Zoning | 162 | 55.6% | 55.6% | 0.0% |
| homosproto | Footwork | 166 | 45.8% | 45.8% | 0.0% |
| indiapolice | Counter | 148 | 52.7% | 52.7% | 0.0% |
| infinitysplitter | Footwork | 150 | 34.0% | 34.0% | 0.0% |
| isaac | Footwork | 154 | 33.1% | 33.1% | 0.0% |
| jameskaminski | Pressure | 156 | 62.2% | 62.2% | 0.0% |
| janitor | Brawler | 158 | 41.1% | 41.1% | 0.0% |
| jasper | Footwork | 138 | 42.8% | 42.8% | 0.0% |
| jayquant | Counter | 144 | 52.8% | 52.8% | 0.0% |
| johnson | Brawler | 144 | 56.3% | 56.3% | 0.0% |
| julian | Counter | 170 | 52.9% | 52.9% | 0.0% |
| kern | Counter | 144 | 63.2% | 63.2% | 0.0% |
| kerrieanne | Counter | 144 | 61.1% | 61.1% | 0.0% |
| laserbach | Pressure | 138 | 50.0% | 50.0% | 0.0% |
| lestrange | Footwork | 146 | 49.3% | 49.3% | 0.0% |
| leviosa | Footwork | 140 | 40.0% | 40.0% | 0.0% |
| lifeisameme | Pressure | 146 | 51.4% | 51.4% | 0.0% |
| lilgoldied | Counter | 156 | 55.8% | 55.8% | 0.0% |
| loadthebags | Pressure | 166 | 45.8% | 45.8% | 0.0% |
| loqi | Counter | 138 | 61.6% | 61.6% | 0.0% |
| lowernipple | Zoning | 154 | 49.4% | 49.4% | 0.0% |
| mandela | Weapon | 148 | 44.6% | 44.6% | 0.0% |
| marfrog | Footwork | 146 | 43.2% | 43.2% | 0.0% |
| maxbiggums | Brawler | 144 | 56.9% | 56.9% | 0.0% |
| melo | Weapon | 156 | 52.6% | 52.6% | 0.0% |
| michael | Weapon | 156 | 53.2% | 53.2% | 0.0% |
| micsash | Counter | 142 | 52.1% | 52.1% | 0.0% |
| mikemike | Brawler | 164 | 62.8% | 62.8% | 0.0% |
| mildtacos | Footwork | 136 | 47.1% | 47.1% | 0.0% |
| mlk | Counter | 142 | 54.2% | 54.2% | 0.0% |
| moonshiller | Brawler | 152 | 63.8% | 63.8% | 0.0% |
| mox | Counter | 152 | 67.1% | 67.1% | 0.0% |
| mrgoldrobe | Counter | 142 | 47.9% | 47.9% | 0.0% |
| mrhorsemeat | Counter | 180 | 53.3% | 53.3% | 0.0% |
| nate | Pressure | 144 | 41.7% | 41.7% | 0.0% |
| nick | Pressure | 150 | 42.0% | 42.0% | 0.0% |
| nomis | Pressure | 142 | 47.2% | 47.2% | 0.0% |
| nosmileclown | Paired | 150 | 55.3% | 55.3% | 0.0% |
| np | Footwork | 178 | 50.0% | 50.0% | 0.0% |
| obamasega420 | Footwork | 150 | 36.0% | 36.0% | 0.0% |
| olnoname | Footwork | 140 | 43.6% | 43.6% | 0.0% |
| onememeaday | Pressure | 158 | 50.6% | 50.3% | 0.6% |
| osho | Footwork | 152 | 42.8% | 42.8% | 0.0% |
| otorps | Counter | 146 | 52.7% | 52.7% | 0.0% |
| pars | Brawler | 164 | 57.3% | 57.3% | 0.0% |
| peterpan | Paired | 140 | 52.1% | 52.1% | 0.0% |
| pilgrim | Brawler | 144 | 45.1% | 45.1% | 0.0% |
| pinewaffle | Pressure | 150 | 52.0% | 52.0% | 0.0% |
| pirate | Footwork | 138 | 55.1% | 55.1% | 0.0% |
| pongohpos10i | Zoning | 158 | 50.0% | 50.0% | 0.0% |
| potocaicai | Counter | 154 | 50.6% | 50.6% | 0.0% |
| pr0lificeth | Zoning | 158 | 55.7% | 55.7% | 0.0% |
| prim | Zoning | 138 | 66.7% | 66.7% | 0.0% |
| rainman | Footwork | 150 | 52.7% | 52.7% | 0.0% |
| razz | Counter | 144 | 54.2% | 54.2% | 0.0% |
| realityarchitect | Counter | 146 | 45.9% | 45.9% | 0.0% |
| rektina | Footwork | 134 | 50.7% | 50.7% | 0.0% |
| renzo | Pressure | 148 | 43.9% | 43.9% | 0.0% |
| reverend | Footwork | 146 | 46.6% | 46.6% | 0.0% |
| rivet | Pressure | 116 | 35.3% | 35.3% | 0.0% |
| rlarsson | Footwork | 146 | 47.9% | 47.9% | 0.0% |
| rmacpdx | Footwork | 152 | 45.4% | 45.4% | 0.0% |
| rune | Counter | 146 | 54.8% | 54.8% | 0.0% |
| saburdo | Pressure | 168 | 57.1% | 57.1% | 0.0% |
| samixsproto | Zoning | 138 | 60.9% | 60.9% | 0.0% |
| satoshi | Pressure | 132 | 47.0% | 47.0% | 0.0% |
| seph0x | Counter | 148 | 54.1% | 54.1% | 0.0% |
| sidelinereferee | Zoning | 142 | 54.9% | 54.9% | 0.0% |
| sirbitcoin | Counter | 140 | 50.0% | 50.0% | 0.0% |
| sirdidit | Footwork | 142 | 43.0% | 43.0% | 0.0% |
| sisma | Pressure | 144 | 50.7% | 50.7% | 0.0% |
| slabcorn | Brawler | 138 | 51.4% | 51.4% | 0.0% |
| slakesly | Counter | 148 | 52.7% | 52.7% | 0.0% |
| sober | Footwork | 154 | 37.7% | 37.7% | 0.0% |
| solanadelray | Paired | 144 | 49.3% | 49.3% | 0.0% |
| sprog | Footwork | 150 | 43.3% | 43.3% | 0.0% |
| sproteth | Footwork | 144 | 52.1% | 52.1% | 0.0% |
| sproto1011 | Weapon | 158 | 61.4% | 61.4% | 0.0% |
| sproto102 | Footwork | 154 | 41.6% | 41.6% | 0.0% |
| sproto1093 | Footwork | 134 | 47.0% | 47.0% | 0.0% |
| sproto1187 | Footwork | 166 | 49.4% | 49.4% | 0.0% |
| sproto1335 | Footwork | 144 | 63.9% | 63.9% | 0.0% |
| sproto1345 | Footwork | 148 | 57.4% | 57.4% | 0.0% |
| sproto1414 | Footwork | 162 | 47.5% | 47.5% | 0.0% |
| sproto1477 | Footwork | 158 | 44.9% | 44.9% | 0.0% |
| sproto1499 | Paired | 154 | 45.5% | 45.5% | 0.0% |
| sproto1601 | Zoning | 148 | 56.1% | 56.1% | 0.0% |
| sproto1625 | Paired | 148 | 48.0% | 48.0% | 0.0% |
| sproto1668 | Footwork | 162 | 41.4% | 41.4% | 0.0% |
| sproto1815 | Weapon | 164 | 51.2% | 51.2% | 0.0% |
| sproto1870 | Hover | 140 | 47.1% | 47.1% | 0.0% |
| sproto2010 | Paired | 134 | 59.0% | 59.0% | 0.0% |
| sproto2075 | Paired | 150 | 54.0% | 54.0% | 0.0% |
| sproto2101 | Footwork | 134 | 31.3% | 31.3% | 0.0% |
| sproto215 | Footwork | 140 | 55.7% | 55.7% | 0.0% |
| sproto2177 | Footwork | 162 | 46.3% | 46.3% | 0.0% |
| sproto2210 | Paired | 142 | 53.5% | 53.5% | 0.0% |
| sproto2322 | Footwork | 156 | 43.6% | 43.6% | 0.0% |
| sproto2344 | Paired | 152 | 46.1% | 46.1% | 0.0% |
| sproto2381 | Footwork | 148 | 36.5% | 36.5% | 0.0% |
| sproto2531 | Zoning | 152 | 53.9% | 53.9% | 0.0% |
| sproto2569 | Footwork | 134 | 40.3% | 40.3% | 0.0% |
| sproto2616 | Weapon | 144 | 56.3% | 56.3% | 0.0% |
| sproto2789 | Weapon | 144 | 54.2% | 54.2% | 0.0% |
| sproto282 | Paired | 150 | 56.0% | 56.0% | 0.0% |
| sproto2884 | Footwork | 146 | 40.4% | 40.4% | 0.0% |
| sproto3106 | Zoning | 132 | 47.7% | 47.7% | 0.0% |
| sproto313 | Footwork | 136 | 52.2% | 52.2% | 1.5% |
| sproto3152 | Zoning | 152 | 47.4% | 47.4% | 0.0% |
| sproto3181 | Paired | 150 | 42.0% | 42.0% | 0.0% |
| sproto3215 | Footwork | 150 | 46.7% | 46.7% | 0.0% |
| sproto3224 | Paired | 144 | 43.1% | 43.1% | 0.0% |
| sproto3235 | Paired | 154 | 54.5% | 54.5% | 0.0% |
| sproto651 | Footwork | 134 | 47.0% | 47.0% | 0.0% |
| sproto704 | Paired | 140 | 46.4% | 46.4% | 0.0% |
| sproto763 | Footwork | 152 | 33.6% | 33.6% | 0.0% |
| sproto818 | Footwork | 128 | 58.6% | 58.6% | 0.0% |
| sproto831 | Footwork | 130 | 42.2% | 42.2% | 1.5% |
| sproto832 | Paired | 144 | 59.0% | 59.4% | 0.7% |
| sproto834 | Footwork | 122 | 37.7% | 37.7% | 0.0% |
| sproto837 | Footwork | 144 | 47.2% | 47.2% | 0.0% |
| sproto865 | Footwork | 140 | 46.4% | 46.4% | 0.0% |
| sproto943 | Footwork | 130 | 41.5% | 41.5% | 0.0% |
| sproto999 | Footwork | 156 | 40.4% | 40.4% | 0.0% |
| sprotocius | Counter | 146 | 49.3% | 49.3% | 0.0% |
| sprotolg | Zoning | 146 | 49.3% | 49.3% | 0.0% |
| sprotomichaelsaylor | Zoning | 132 | 68.2% | 68.2% | 0.0% |
| sprotomidnightfx | Pressure | 160 | 48.1% | 48.1% | 0.0% |
| sprotopia | Zoning | 138 | 53.6% | 53.6% | 0.0% |
| sprotopotamus | Brawler | 158 | 58.9% | 58.9% | 0.0% |
| sprotosales | Footwork | 136 | 33.8% | 33.8% | 0.0% |
| sprotosurvivor | Zoning | 146 | 56.2% | 56.2% | 0.0% |
| spruto | Footwork | 138 | 58.7% | 58.7% | 0.0% |
| spunow | Footwork | 126 | 50.8% | 50.8% | 0.0% |
| stonkyleg69 | Footwork | 146 | 46.6% | 46.6% | 0.0% |
| stoto | Pressure | 166 | 34.9% | 34.9% | 0.0% |
| sweatpantstrust | Counter | 140 | 50.7% | 50.7% | 0.0% |
| tdeth | Pressure | 140 | 49.3% | 49.3% | 0.0% |
| teahupoo | Counter | 138 | 52.2% | 52.2% | 0.0% |
| theo | Zoning | 162 | 59.3% | 59.3% | 0.0% |
| thesprotowholivedeth | Zoning | 146 | 52.7% | 52.7% | 0.0% |
| thxobama | Counter | 140 | 57.1% | 57.1% | 0.0% |
| tingsmol | Footwork | 138 | 42.8% | 42.8% | 0.0% |
| tradertimmy | Counter | 144 | 64.6% | 64.6% | 0.0% |
| twinnyneutron | Paired | 146 | 54.1% | 54.5% | 0.7% |
| uncmasterflex | Footwork | 156 | 46.8% | 46.8% | 0.0% |
| urmometh | Footwork | 140 | 52.2% | 52.2% | 1.4% |
| usedtowels | Counter | 158 | 42.4% | 42.4% | 0.0% |
| vamp | Zoning | 152 | 55.9% | 55.9% | 0.0% |
| vaudream | Hover | 146 | 42.5% | 42.5% | 0.0% |
| vela | Zoning | 158 | 48.1% | 48.1% | 0.0% |
| veryseriousinvestor | Footwork | 144 | 46.5% | 46.5% | 1.4% |
| vicoo | Counter | 150 | 51.3% | 51.3% | 0.0% |
| vitaliketh | Footwork | 156 | 51.3% | 51.3% | 0.0% |
| wifebeater | Brawler | 146 | 50.0% | 50.0% | 0.0% |
| willuminati | Counter | 150 | 46.7% | 46.7% | 0.0% |
| wireitwell | Pressure | 148 | 51.4% | 51.4% | 0.0% |
| wyrmblvnt | Footwork | 156 | 38.5% | 38.5% | 0.0% |
| xalt | Zoning | 152 | 51.3% | 51.3% | 0.0% |
| xav | Footwork | 140 | 40.0% | 40.0% | 0.0% |
| yusuf | Pressure | 144 | 48.6% | 48.6% | 0.0% |
| zakarum | Footwork | 158 | 43.7% | 43.7% | 0.0% |
| zebracorn | Counter | 164 | 58.5% | 58.5% | 0.0% |
| zephyr | Brawler | 156 | 53.8% | 53.8% | 0.0% |
| zepump | Paired | 152 | 47.4% | 47.4% | 0.0% |
| zippy | Pressure | 162 | 49.4% | 49.4% | 0.0% |
| zudi | Counter | 150 | 56.7% | 56.7% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 2 | 100.0% |
| 86gwei vs alpha777 | 2 | 0.0% |
| 86gwei vs bidnehhh | 2 | 0.0% |
| 86gwei vs bitcoind1rk | 2 | 100.0% |
| 86gwei vs bront | 2 | 0.0% |
| 86gwei vs buddhashadow | 2 | 0.0% |
| 86gwei vs cam | 2 | 0.0% |
| 86gwei vs ciphersproto | 2 | 100.0% |
| 86gwei vs croy | 2 | 0.0% |
| 86gwei vs drzmoody | 2 | 100.0% |

## Skill 7

18694 bouts; raw draws 0.2% (37); unresolved 0.2% (32); timeouts 0. Mean 29.67 s; median 29.70 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 49.8% | 49.8% | 0.2% | 5.44 s |
| 2 | 50.2% | 50.2% | 0.2% | 5.45 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 12422 | 47.6% | 47.6% | 0.2% |
| Counter | 7260 | 51.5% | 51.5% | 0.2% |
| Pressure | 4572 | 45.8% | 45.8% | 0.2% |
| Brawler | 3120 | 53.1% | 53.1% | 0.1% |
| Paired | 2924 | 51.7% | 51.8% | 0.2% |
| Zoning | 5578 | 53.9% | 53.9% | 0.3% |
| Weapon | 1226 | 51.6% | 51.6% | 0.2% |
| Hover | 286 | 49.7% | 49.7% | 0.0% |

Damage: melee 23922569; projectile 4344597; special 923921; throw 1234785.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 46.8% | 46.8% | 0.0% |
| aaron | Footwork | 158 | 51.3% | 51.3% | 0.0% |
| accidentallyrich | Counter | 136 | 63.2% | 63.2% | 0.0% |
| agentsproto | Brawler | 154 | 48.7% | 48.7% | 0.0% |
| aktree | Zoning | 144 | 48.6% | 48.6% | 0.0% |
| aleksander | Counter | 150 | 57.4% | 57.4% | 1.3% |
| alpha777 | Pressure | 150 | 41.3% | 41.3% | 0.0% |
| anni | Pressure | 136 | 52.9% | 52.9% | 0.0% |
| autistophrenicsprotagonist | Footwork | 134 | 52.2% | 52.2% | 0.0% |
| azkarah | Zoning | 132 | 52.3% | 52.3% | 1.5% |
| benjamin | Footwork | 152 | 46.7% | 46.7% | 0.0% |
| berserk | Footwork | 138 | 34.1% | 34.1% | 0.0% |
| bgbadger | Zoning | 144 | 47.9% | 47.9% | 0.0% |
| bidnehhh | Pressure | 140 | 39.3% | 39.3% | 0.0% |
| bigal | Brawler | 128 | 57.9% | 57.9% | 1.6% |
| bigswole | Brawler | 142 | 46.5% | 46.5% | 0.0% |
| bimba | Footwork | 142 | 45.1% | 45.1% | 0.0% |
| bitcoind1rk | Footwork | 168 | 55.4% | 55.4% | 1.2% |
| blorfo | Weapon | 156 | 54.5% | 54.5% | 0.0% |
| bobdobbs | Footwork | 154 | 41.6% | 41.6% | 0.0% |
| brainsprot | Footwork | 146 | 59.6% | 59.6% | 0.0% |
| bront | Brawler | 138 | 47.1% | 47.1% | 0.0% |
| bs9090eth | Zoning | 148 | 56.8% | 56.8% | 0.0% |
| buddhashadow | Footwork | 162 | 53.1% | 53.1% | 0.0% |
| cam | Brawler | 148 | 44.6% | 44.6% | 0.0% |
| cantankerous | Pressure | 124 | 51.6% | 51.6% | 1.6% |
| captain | Zoning | 142 | 57.7% | 57.7% | 0.0% |
| captainhowdy | Footwork | 144 | 34.5% | 34.5% | 1.4% |
| ceo | Zoning | 148 | 63.7% | 63.7% | 1.4% |
| chaton | Footwork | 146 | 44.5% | 44.5% | 0.0% |
| chonky | Footwork | 156 | 47.4% | 47.4% | 1.3% |
| chrisfowler | Counter | 126 | 47.6% | 47.6% | 0.0% |
| ciphersproto | Pressure | 154 | 45.5% | 45.5% | 0.0% |
| clobrwn | Footwork | 144 | 45.1% | 45.1% | 0.0% |
| contresens | Zoning | 148 | 58.1% | 58.1% | 0.0% |
| corn | Pressure | 148 | 51.4% | 51.4% | 1.4% |
| crapto | Zoning | 134 | 45.5% | 45.5% | 0.0% |
| crippledlover | Footwork | 146 | 44.5% | 44.5% | 0.0% |
| croy | Counter | 152 | 50.7% | 50.7% | 0.0% |
| crumpleii | Brawler | 158 | 44.9% | 44.9% | 0.0% |
| cryptobartender | Zoning | 148 | 42.6% | 42.6% | 0.0% |
| cryptoboy | Counter | 146 | 43.8% | 43.8% | 0.0% |
| cryptomonger | Footwork | 132 | 53.8% | 53.8% | 0.0% |
| cryptorizzler | Counter | 168 | 50.6% | 50.6% | 0.0% |
| cryptoviking420 | Pressure | 162 | 36.3% | 36.3% | 1.2% |
| cyberviber | Counter | 170 | 47.6% | 47.6% | 1.2% |
| d86 | Zoning | 168 | 41.7% | 41.7% | 0.0% |
| danocrypto | Counter | 140 | 57.9% | 57.9% | 0.0% |
| davidcd | Footwork | 146 | 41.1% | 41.1% | 0.0% |
| degenpress | Zoning | 148 | 52.0% | 52.0% | 0.0% |
| dollarbitcoin | Brawler | 136 | 56.0% | 56.0% | 1.5% |
| drzmoody | Footwork | 154 | 52.6% | 52.6% | 0.0% |
| dumpstar | Brawler | 144 | 57.6% | 57.6% | 0.0% |
| duo | Paired | 164 | 57.9% | 58.3% | 0.6% |
| durlan | Footwork | 158 | 60.1% | 60.1% | 0.0% |
| emix | Footwork | 140 | 60.0% | 60.0% | 0.0% |
| erik | Footwork | 130 | 33.1% | 33.1% | 0.0% |
| familywagon | Brawler | 150 | 50.7% | 50.7% | 0.0% |
| feistyboi | Counter | 134 | 47.0% | 47.0% | 0.0% |
| felixsprotoarc | Zoning | 146 | 61.6% | 61.6% | 0.0% |
| fiatfudder | Counter | 138 | 52.2% | 52.2% | 0.0% |
| forchaneth | Footwork | 128 | 49.2% | 49.2% | 0.0% |
| fplgremlin | Pressure | 144 | 45.8% | 45.8% | 0.0% |
| freedfrida | Footwork | 146 | 43.8% | 43.8% | 0.0% |
| frej | Counter | 140 | 54.3% | 54.3% | 0.0% |
| freshprince | Counter | 162 | 42.6% | 42.6% | 0.0% |
| ghostsprotocol | Zoning | 142 | 62.7% | 62.7% | 0.0% |
| giavannykitchens | Pressure | 140 | 47.1% | 47.1% | 0.0% |
| glow | Counter | 156 | 46.8% | 46.5% | 0.6% |
| gluttony | Zoning | 138 | 42.0% | 42.0% | 0.0% |
| godether | Counter | 134 | 57.5% | 57.5% | 0.0% |
| godmod3d | Paired | 136 | 46.3% | 46.3% | 0.0% |
| godsson | Counter | 154 | 51.3% | 51.3% | 0.0% |
| gpm | Brawler | 154 | 66.2% | 66.2% | 0.0% |
| greatcharly | Footwork | 150 | 42.0% | 42.0% | 0.0% |
| gryph | Paired | 130 | 42.3% | 42.3% | 0.0% |
| guest07 | Pressure | 154 | 40.3% | 40.3% | 0.0% |
| guest08 | Zoning | 170 | 42.4% | 42.4% | 0.0% |
| guest09 | Pressure | 142 | 36.6% | 36.6% | 0.0% |
| guest10 | Zoning | 138 | 61.0% | 61.0% | 1.4% |
| guest11 | Counter | 144 | 46.5% | 46.5% | 0.0% |
| guest12 | Zoning | 140 | 65.7% | 65.7% | 0.0% |
| guest13 | Counter | 156 | 50.0% | 50.0% | 0.0% |
| guest14 | Counter | 174 | 50.0% | 50.0% | 0.0% |
| hdizzy | Zoning | 134 | 50.0% | 50.0% | 0.0% |
| herbpowell | Counter | 126 | 52.4% | 52.4% | 1.6% |
| hermionemichelleamyrose | Footwork | 138 | 42.8% | 42.8% | 0.0% |
| highsproto | Zoning | 162 | 53.1% | 53.1% | 1.2% |
| homosproto | Footwork | 166 | 47.0% | 47.0% | 0.0% |
| indiapolice | Counter | 148 | 52.7% | 52.7% | 1.4% |
| infinitysplitter | Footwork | 150 | 45.9% | 45.9% | 1.3% |
| isaac | Footwork | 154 | 49.4% | 49.4% | 0.0% |
| jameskaminski | Pressure | 156 | 50.0% | 50.0% | 0.0% |
| janitor | Brawler | 158 | 56.3% | 56.3% | 0.0% |
| jasper | Footwork | 138 | 41.3% | 41.3% | 0.0% |
| jayquant | Counter | 144 | 54.2% | 54.2% | 0.0% |
| johnson | Brawler | 144 | 51.4% | 51.4% | 0.0% |
| julian | Counter | 170 | 52.4% | 52.4% | 0.0% |
| kern | Counter | 144 | 59.0% | 59.0% | 0.0% |
| kerrieanne | Counter | 144 | 63.4% | 63.4% | 1.4% |
| laserbach | Pressure | 138 | 44.2% | 44.2% | 0.0% |
| lestrange | Footwork | 146 | 43.8% | 43.8% | 0.0% |
| leviosa | Footwork | 140 | 49.3% | 49.3% | 0.0% |
| lifeisameme | Pressure | 146 | 45.2% | 45.2% | 0.0% |
| lilgoldied | Counter | 156 | 59.6% | 59.6% | 0.0% |
| loadthebags | Pressure | 166 | 44.6% | 44.6% | 0.0% |
| loqi | Counter | 138 | 63.8% | 63.8% | 0.0% |
| lowernipple | Zoning | 154 | 59.9% | 59.9% | 1.3% |
| mandela | Weapon | 148 | 45.2% | 45.2% | 1.4% |
| marfrog | Footwork | 146 | 34.2% | 34.2% | 0.0% |
| maxbiggums | Brawler | 144 | 52.8% | 52.8% | 0.0% |
| melo | Weapon | 156 | 52.6% | 52.6% | 0.0% |
| michael | Weapon | 156 | 46.2% | 46.2% | 0.0% |
| micsash | Counter | 142 | 52.9% | 52.9% | 1.4% |
| mikemike | Brawler | 164 | 48.8% | 48.8% | 0.0% |
| mildtacos | Footwork | 136 | 51.5% | 51.5% | 0.0% |
| mlk | Counter | 142 | 40.8% | 40.8% | 0.0% |
| moonshiller | Brawler | 152 | 52.6% | 52.6% | 0.0% |
| mox | Counter | 152 | 61.8% | 61.8% | 0.0% |
| mrgoldrobe | Counter | 142 | 48.6% | 48.6% | 0.0% |
| mrhorsemeat | Counter | 180 | 53.9% | 53.9% | 1.1% |
| nate | Pressure | 144 | 34.7% | 34.7% | 0.0% |
| nick | Pressure | 150 | 44.7% | 44.7% | 0.0% |
| nomis | Pressure | 142 | 40.1% | 40.4% | 0.7% |
| nosmileclown | Paired | 150 | 53.3% | 53.3% | 0.0% |
| np | Footwork | 178 | 49.4% | 49.4% | 0.0% |
| obamasega420 | Footwork | 150 | 52.0% | 52.0% | 0.0% |
| olnoname | Footwork | 140 | 43.6% | 43.6% | 0.0% |
| onememeaday | Pressure | 158 | 50.6% | 50.6% | 0.0% |
| osho | Footwork | 152 | 56.0% | 56.0% | 1.3% |
| otorps | Counter | 146 | 56.8% | 56.8% | 0.0% |
| pars | Brawler | 164 | 59.1% | 59.1% | 0.0% |
| peterpan | Paired | 140 | 50.7% | 50.7% | 0.0% |
| pilgrim | Brawler | 144 | 47.2% | 47.2% | 0.0% |
| pinewaffle | Pressure | 150 | 53.3% | 53.3% | 0.0% |
| pirate | Footwork | 138 | 52.2% | 52.2% | 0.0% |
| pongohpos10i | Zoning | 158 | 42.4% | 42.4% | 0.0% |
| potocaicai | Counter | 154 | 53.9% | 53.9% | 0.0% |
| pr0lificeth | Zoning | 158 | 47.5% | 47.5% | 0.0% |
| prim | Zoning | 138 | 51.4% | 50.7% | 1.4% |
| rainman | Footwork | 150 | 48.7% | 48.7% | 0.0% |
| razz | Counter | 144 | 54.2% | 54.2% | 0.0% |
| realityarchitect | Counter | 146 | 50.0% | 50.0% | 0.0% |
| rektina | Footwork | 134 | 59.0% | 59.0% | 0.0% |
| renzo | Pressure | 148 | 53.4% | 53.4% | 0.0% |
| reverend | Footwork | 146 | 44.5% | 44.5% | 0.0% |
| rivet | Pressure | 116 | 50.0% | 50.0% | 0.0% |
| rlarsson | Footwork | 146 | 54.9% | 54.9% | 1.4% |
| rmacpdx | Footwork | 152 | 52.6% | 52.6% | 0.0% |
| rune | Counter | 146 | 49.3% | 49.3% | 0.0% |
| saburdo | Pressure | 168 | 48.2% | 48.2% | 1.2% |
| samixsproto | Zoning | 138 | 63.0% | 63.0% | 0.0% |
| satoshi | Pressure | 132 | 47.7% | 47.7% | 0.0% |
| seph0x | Counter | 148 | 54.7% | 54.7% | 0.0% |
| sidelinereferee | Zoning | 142 | 57.0% | 57.0% | 0.0% |
| sirbitcoin | Counter | 140 | 47.1% | 47.1% | 0.0% |
| sirdidit | Footwork | 142 | 47.9% | 47.9% | 0.0% |
| sisma | Pressure | 144 | 56.9% | 56.9% | 0.0% |
| slabcorn | Brawler | 138 | 58.0% | 58.0% | 0.0% |
| slakesly | Counter | 148 | 47.3% | 47.3% | 0.0% |
| sober | Footwork | 154 | 51.3% | 51.3% | 0.0% |
| solanadelray | Paired | 144 | 48.6% | 48.6% | 0.0% |
| sprog | Footwork | 150 | 53.3% | 53.3% | 0.0% |
| sproteth | Footwork | 144 | 44.4% | 44.4% | 0.0% |
| sproto1011 | Weapon | 158 | 59.5% | 59.5% | 0.0% |
| sproto102 | Footwork | 154 | 44.2% | 44.2% | 0.0% |
| sproto1093 | Footwork | 134 | 46.3% | 46.3% | 0.0% |
| sproto1187 | Footwork | 166 | 39.2% | 39.2% | 0.0% |
| sproto1335 | Footwork | 144 | 52.8% | 52.8% | 0.0% |
| sproto1345 | Footwork | 148 | 42.6% | 42.6% | 0.0% |
| sproto1414 | Footwork | 162 | 50.6% | 50.6% | 1.2% |
| sproto1477 | Footwork | 158 | 41.1% | 41.1% | 0.0% |
| sproto1499 | Paired | 154 | 48.7% | 48.7% | 0.0% |
| sproto1601 | Zoning | 148 | 60.1% | 59.9% | 0.7% |
| sproto1625 | Paired | 148 | 52.7% | 52.7% | 0.0% |
| sproto1668 | Footwork | 162 | 36.4% | 36.4% | 0.0% |
| sproto1815 | Weapon | 164 | 43.3% | 43.3% | 0.0% |
| sproto1870 | Hover | 140 | 54.3% | 54.3% | 0.0% |
| sproto2010 | Paired | 134 | 58.2% | 57.9% | 0.7% |
| sproto2075 | Paired | 150 | 50.7% | 50.7% | 0.0% |
| sproto2101 | Footwork | 134 | 45.5% | 45.5% | 0.0% |
| sproto215 | Footwork | 140 | 52.1% | 52.1% | 0.0% |
| sproto2177 | Footwork | 162 | 48.1% | 48.1% | 0.0% |
| sproto2210 | Paired | 142 | 45.8% | 46.1% | 0.7% |
| sproto2322 | Footwork | 156 | 46.8% | 46.8% | 0.0% |
| sproto2344 | Paired | 152 | 63.8% | 63.8% | 0.0% |
| sproto2381 | Footwork | 148 | 40.4% | 40.4% | 1.4% |
| sproto2531 | Zoning | 152 | 53.9% | 53.9% | 0.0% |
| sproto2569 | Footwork | 134 | 45.5% | 45.5% | 1.5% |
| sproto2616 | Weapon | 144 | 53.5% | 53.5% | 0.0% |
| sproto2789 | Weapon | 144 | 59.0% | 59.0% | 0.0% |
| sproto282 | Paired | 150 | 56.0% | 56.0% | 0.0% |
| sproto2884 | Footwork | 146 | 45.9% | 45.9% | 0.0% |
| sproto3106 | Zoning | 132 | 37.9% | 37.9% | 0.0% |
| sproto313 | Footwork | 136 | 51.5% | 51.5% | 0.0% |
| sproto3152 | Zoning | 152 | 51.3% | 51.3% | 0.0% |
| sproto3181 | Paired | 150 | 54.0% | 54.4% | 0.7% |
| sproto3215 | Footwork | 150 | 48.0% | 48.0% | 0.0% |
| sproto3224 | Paired | 144 | 55.6% | 55.6% | 0.0% |
| sproto3235 | Paired | 154 | 47.4% | 47.4% | 0.0% |
| sproto651 | Footwork | 134 | 44.8% | 44.8% | 0.0% |
| sproto704 | Paired | 140 | 57.1% | 57.1% | 0.0% |
| sproto763 | Footwork | 152 | 47.4% | 47.4% | 0.0% |
| sproto818 | Footwork | 128 | 55.5% | 55.5% | 0.0% |
| sproto831 | Footwork | 130 | 51.5% | 51.5% | 0.0% |
| sproto832 | Paired | 144 | 54.9% | 54.9% | 0.0% |
| sproto834 | Footwork | 122 | 52.5% | 52.5% | 0.0% |
| sproto837 | Footwork | 144 | 45.8% | 45.8% | 0.0% |
| sproto865 | Footwork | 140 | 50.7% | 50.7% | 1.4% |
| sproto943 | Footwork | 130 | 52.3% | 52.3% | 0.0% |
| sproto999 | Footwork | 156 | 38.5% | 38.5% | 0.0% |
| sprotocius | Counter | 146 | 50.7% | 50.7% | 0.0% |
| sprotolg | Zoning | 146 | 54.8% | 54.8% | 0.0% |
| sprotomichaelsaylor | Zoning | 132 | 61.4% | 61.4% | 0.0% |
| sprotomidnightfx | Pressure | 160 | 52.5% | 52.5% | 0.0% |
| sprotopia | Zoning | 138 | 64.5% | 64.5% | 0.0% |
| sprotopotamus | Brawler | 158 | 51.9% | 51.9% | 0.0% |
| sprotosales | Footwork | 136 | 40.4% | 40.4% | 0.0% |
| sprotosurvivor | Zoning | 146 | 54.8% | 54.8% | 0.0% |
| spruto | Footwork | 138 | 50.0% | 50.0% | 0.0% |
| spunow | Footwork | 126 | 47.6% | 47.6% | 0.0% |
| stonkyleg69 | Footwork | 146 | 37.0% | 37.0% | 0.0% |
| stoto | Pressure | 166 | 36.1% | 36.1% | 0.0% |
| sweatpantstrust | Counter | 140 | 52.2% | 52.2% | 1.4% |
| tdeth | Pressure | 140 | 44.3% | 44.3% | 0.0% |
| teahupoo | Counter | 138 | 47.1% | 47.1% | 0.0% |
| theo | Zoning | 162 | 60.0% | 60.0% | 1.2% |
| thesprotowholivedeth | Zoning | 146 | 51.4% | 51.4% | 0.0% |
| thxobama | Counter | 140 | 61.4% | 61.4% | 0.0% |
| tingsmol | Footwork | 138 | 59.4% | 59.4% | 0.0% |
| tradertimmy | Counter | 144 | 47.2% | 47.2% | 0.0% |
| twinnyneutron | Paired | 146 | 43.8% | 44.1% | 0.7% |
| uncmasterflex | Footwork | 156 | 56.4% | 56.4% | 0.0% |
| urmometh | Footwork | 140 | 52.9% | 52.9% | 0.0% |
| usedtowels | Counter | 158 | 44.9% | 44.9% | 0.0% |
| vamp | Zoning | 152 | 55.3% | 55.3% | 0.0% |
| vaudream | Hover | 146 | 45.2% | 45.2% | 0.0% |
| vela | Zoning | 158 | 55.7% | 55.7% | 0.0% |
| veryseriousinvestor | Footwork | 144 | 45.8% | 45.8% | 0.0% |
| vicoo | Counter | 150 | 56.7% | 56.7% | 0.0% |
| vitaliketh | Footwork | 156 | 52.6% | 52.6% | 0.0% |
| wifebeater | Brawler | 146 | 61.6% | 61.6% | 0.0% |
| willuminati | Counter | 150 | 32.0% | 32.0% | 0.0% |
| wireitwell | Pressure | 148 | 41.9% | 41.9% | 0.0% |
| wyrmblvnt | Footwork | 156 | 53.2% | 53.2% | 0.0% |
| xalt | Zoning | 152 | 63.8% | 63.8% | 0.0% |
| xav | Footwork | 140 | 42.1% | 42.1% | 0.0% |
| yusuf | Pressure | 144 | 54.9% | 54.9% | 0.0% |
| zakarum | Footwork | 158 | 37.8% | 37.8% | 1.3% |
| zebracorn | Counter | 164 | 43.3% | 43.3% | 0.0% |
| zephyr | Brawler | 156 | 56.4% | 56.4% | 0.0% |
| zepump | Paired | 152 | 45.4% | 45.4% | 0.0% |
| zippy | Pressure | 162 | 40.7% | 40.7% | 0.0% |
| zudi | Counter | 150 | 48.0% | 48.0% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 2 | 100.0% |
| 86gwei vs alpha777 | 2 | 100.0% |
| 86gwei vs bidnehhh | 2 | 0.0% |
| 86gwei vs bitcoind1rk | 2 | 0.0% |
| 86gwei vs bront | 2 | 100.0% |
| 86gwei vs buddhashadow | 2 | 100.0% |
| 86gwei vs cam | 2 | 100.0% |
| 86gwei vs ciphersproto | 2 | 0.0% |
| 86gwei vs croy | 2 | 100.0% |
| 86gwei vs drzmoody | 2 | 100.0% |

## Skill 10

18694 bouts; raw draws 1.0% (191); unresolved 0.8% (154); timeouts 17. Mean 34.14 s; median 34.02 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.1% | 50.1% | 1.0% | 5.84 s |
| 2 | 49.9% | 49.9% | 1.0% | 5.84 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 12422 | 44.0% | 44.0% | 1.0% |
| Counter | 7260 | 54.6% | 54.6% | 0.9% |
| Pressure | 4572 | 53.4% | 53.4% | 0.9% |
| Brawler | 3120 | 55.2% | 55.3% | 1.7% |
| Paired | 2924 | 51.4% | 51.5% | 1.3% |
| Zoning | 5578 | 49.6% | 49.6% | 1.0% |
| Weapon | 1226 | 55.6% | 55.6% | 0.9% |
| Hover | 286 | 51.7% | 51.7% | 0.0% |

Damage: melee 27175442; projectile 2971385; special 548952; throw 528243.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 44.7% | 44.7% | 1.3% |
| aaron | Footwork | 158 | 48.1% | 47.4% | 1.3% |
| accidentallyrich | Counter | 136 | 56.1% | 56.1% | 2.9% |
| agentsproto | Brawler | 154 | 45.4% | 45.4% | 1.3% |
| aktree | Zoning | 144 | 59.2% | 59.2% | 1.4% |
| aleksander | Counter | 150 | 60.0% | 60.0% | 0.0% |
| alpha777 | Pressure | 150 | 54.1% | 53.4% | 2.7% |
| anni | Pressure | 136 | 60.4% | 60.4% | 1.5% |
| autistophrenicsprotagonist | Footwork | 134 | 50.0% | 50.0% | 0.0% |
| azkarah | Zoning | 132 | 59.8% | 59.8% | 0.0% |
| benjamin | Footwork | 152 | 44.4% | 44.4% | 5.3% |
| berserk | Footwork | 138 | 39.9% | 39.9% | 0.0% |
| bgbadger | Zoning | 144 | 51.4% | 51.4% | 0.0% |
| bidnehhh | Pressure | 140 | 53.6% | 53.6% | 0.0% |
| bigal | Brawler | 128 | 70.3% | 70.3% | 0.0% |
| bigswole | Brawler | 142 | 49.3% | 49.3% | 0.0% |
| bimba | Footwork | 142 | 36.6% | 36.2% | 0.7% |
| bitcoind1rk | Footwork | 168 | 47.0% | 47.3% | 0.6% |
| blorfo | Weapon | 156 | 56.4% | 56.4% | 0.0% |
| bobdobbs | Footwork | 154 | 60.0% | 60.0% | 2.6% |
| brainsprot | Footwork | 146 | 43.8% | 44.1% | 0.7% |
| bront | Brawler | 138 | 43.4% | 43.4% | 1.4% |
| bs9090eth | Zoning | 148 | 62.2% | 62.2% | 0.0% |
| buddhashadow | Footwork | 162 | 37.5% | 37.5% | 1.2% |
| cam | Brawler | 148 | 53.4% | 53.4% | 1.4% |
| cantankerous | Pressure | 124 | 57.3% | 57.3% | 0.0% |
| captain | Zoning | 142 | 49.3% | 49.3% | 2.8% |
| captainhowdy | Footwork | 144 | 41.0% | 41.0% | 0.0% |
| ceo | Zoning | 148 | 50.0% | 50.0% | 0.0% |
| chaton | Footwork | 146 | 34.9% | 34.5% | 0.7% |
| chonky | Footwork | 156 | 34.0% | 34.2% | 0.6% |
| chrisfowler | Counter | 126 | 50.0% | 50.0% | 0.0% |
| ciphersproto | Pressure | 154 | 50.6% | 51.0% | 0.6% |
| clobrwn | Footwork | 144 | 50.7% | 50.7% | 0.0% |
| contresens | Zoning | 148 | 53.4% | 53.4% | 0.0% |
| corn | Pressure | 148 | 67.8% | 67.8% | 1.4% |
| crapto | Zoning | 134 | 48.5% | 48.5% | 3.0% |
| crippledlover | Footwork | 146 | 53.4% | 53.4% | 0.0% |
| croy | Counter | 152 | 54.7% | 54.7% | 1.3% |
| crumpleii | Brawler | 158 | 55.7% | 55.7% | 0.0% |
| cryptobartender | Zoning | 148 | 37.8% | 37.8% | 0.0% |
| cryptoboy | Counter | 146 | 57.5% | 57.5% | 0.0% |
| cryptomonger | Footwork | 132 | 54.5% | 54.5% | 0.0% |
| cryptorizzler | Counter | 168 | 52.4% | 52.4% | 1.2% |
| cryptoviking420 | Pressure | 162 | 55.0% | 55.0% | 1.2% |
| cyberviber | Counter | 170 | 56.5% | 56.5% | 0.0% |
| d86 | Zoning | 168 | 43.1% | 43.1% | 4.8% |
| danocrypto | Counter | 140 | 56.5% | 56.5% | 1.4% |
| davidcd | Footwork | 146 | 46.6% | 46.6% | 0.0% |
| degenpress | Zoning | 148 | 44.6% | 44.6% | 0.0% |
| dollarbitcoin | Brawler | 136 | 72.3% | 72.3% | 4.4% |
| drzmoody | Footwork | 154 | 44.1% | 44.1% | 1.3% |
| dumpstar | Brawler | 144 | 45.1% | 45.1% | 1.4% |
| duo | Paired | 164 | 50.0% | 50.6% | 1.2% |
| durlan | Footwork | 158 | 48.7% | 48.7% | 1.3% |
| emix | Footwork | 140 | 56.5% | 56.5% | 1.4% |
| erik | Footwork | 130 | 48.4% | 48.4% | 3.1% |
| familywagon | Brawler | 150 | 38.4% | 38.4% | 2.7% |
| feistyboi | Counter | 134 | 45.5% | 45.5% | 0.0% |
| felixsprotoarc | Zoning | 146 | 46.5% | 46.5% | 1.4% |
| fiatfudder | Counter | 138 | 47.8% | 47.8% | 1.4% |
| forchaneth | Footwork | 128 | 50.0% | 50.0% | 0.0% |
| fplgremlin | Pressure | 144 | 56.3% | 56.3% | 0.0% |
| freedfrida | Footwork | 146 | 49.3% | 49.3% | 0.0% |
| frej | Counter | 140 | 52.1% | 52.1% | 0.0% |
| freshprince | Counter | 162 | 49.4% | 49.4% | 0.0% |
| ghostsprotocol | Zoning | 142 | 49.3% | 49.3% | 0.0% |
| giavannykitchens | Pressure | 140 | 55.7% | 55.7% | 0.0% |
| glow | Counter | 156 | 52.6% | 52.6% | 0.0% |
| gluttony | Zoning | 138 | 48.5% | 48.5% | 1.4% |
| godether | Counter | 134 | 51.5% | 51.5% | 1.5% |
| godmod3d | Paired | 136 | 52.9% | 52.6% | 0.7% |
| godsson | Counter | 154 | 62.5% | 62.0% | 2.6% |
| gpm | Brawler | 154 | 56.6% | 56.6% | 1.3% |
| greatcharly | Footwork | 150 | 34.0% | 34.0% | 0.0% |
| gryph | Paired | 130 | 65.6% | 65.9% | 3.1% |
| guest07 | Pressure | 154 | 43.5% | 43.5% | 0.0% |
| guest08 | Zoning | 170 | 52.4% | 52.4% | 0.0% |
| guest09 | Pressure | 142 | 43.0% | 43.0% | 0.0% |
| guest10 | Zoning | 138 | 56.6% | 56.6% | 1.4% |
| guest11 | Counter | 144 | 47.2% | 47.2% | 0.0% |
| guest12 | Zoning | 140 | 60.9% | 60.9% | 1.4% |
| guest13 | Counter | 156 | 53.2% | 53.2% | 0.0% |
| guest14 | Counter | 174 | 56.4% | 56.4% | 1.1% |
| hdizzy | Zoning | 134 | 51.5% | 51.5% | 3.0% |
| herbpowell | Counter | 126 | 57.1% | 57.1% | 0.0% |
| hermionemichelleamyrose | Footwork | 138 | 42.8% | 42.8% | 0.0% |
| highsproto | Zoning | 162 | 38.5% | 38.5% | 3.7% |
| homosproto | Footwork | 166 | 41.5% | 41.5% | 1.2% |
| indiapolice | Counter | 148 | 54.1% | 54.1% | 1.4% |
| infinitysplitter | Footwork | 150 | 48.6% | 48.6% | 1.3% |
| isaac | Footwork | 154 | 31.8% | 31.8% | 0.0% |
| jameskaminski | Pressure | 156 | 40.9% | 40.9% | 1.3% |
| janitor | Brawler | 158 | 46.2% | 46.2% | 1.3% |
| jasper | Footwork | 138 | 49.3% | 49.3% | 1.4% |
| jayquant | Counter | 144 | 57.6% | 57.6% | 0.0% |
| johnson | Brawler | 144 | 62.0% | 62.0% | 1.4% |
| julian | Counter | 170 | 55.9% | 55.4% | 1.2% |
| kern | Counter | 144 | 63.2% | 62.9% | 0.7% |
| kerrieanne | Counter | 144 | 52.8% | 52.8% | 0.0% |
| laserbach | Pressure | 138 | 47.8% | 47.8% | 2.9% |
| lestrange | Footwork | 146 | 50.0% | 50.0% | 0.0% |
| leviosa | Footwork | 140 | 37.0% | 37.5% | 2.9% |
| lifeisameme | Pressure | 146 | 52.8% | 52.8% | 1.4% |
| lilgoldied | Counter | 156 | 59.6% | 59.6% | 0.0% |
| loadthebags | Pressure | 166 | 57.4% | 57.4% | 2.4% |
| loqi | Counter | 138 | 60.4% | 61.4% | 4.3% |
| lowernipple | Zoning | 154 | 44.2% | 44.2% | 0.0% |
| mandela | Weapon | 148 | 54.7% | 54.7% | 0.0% |
| marfrog | Footwork | 146 | 41.8% | 41.8% | 0.0% |
| maxbiggums | Brawler | 144 | 53.5% | 53.5% | 0.0% |
| melo | Weapon | 156 | 51.9% | 51.9% | 0.0% |
| michael | Weapon | 156 | 51.9% | 51.9% | 0.0% |
| micsash | Counter | 142 | 45.0% | 45.0% | 1.4% |
| mikemike | Brawler | 164 | 58.5% | 58.5% | 0.0% |
| mildtacos | Footwork | 136 | 41.8% | 41.8% | 1.5% |
| mlk | Counter | 142 | 52.1% | 52.1% | 0.0% |
| moonshiller | Brawler | 152 | 59.5% | 59.5% | 2.6% |
| mox | Counter | 152 | 61.8% | 61.8% | 0.0% |
| mrgoldrobe | Counter | 142 | 42.1% | 42.1% | 1.4% |
| mrhorsemeat | Counter | 180 | 52.2% | 52.2% | 1.1% |
| nate | Pressure | 144 | 55.6% | 55.6% | 0.0% |
| nick | Pressure | 150 | 48.6% | 49.3% | 2.7% |
| nomis | Pressure | 142 | 56.3% | 56.3% | 0.0% |
| nosmileclown | Paired | 150 | 49.3% | 49.3% | 1.3% |
| np | Footwork | 178 | 50.6% | 50.6% | 1.1% |
| obamasega420 | Footwork | 150 | 57.4% | 57.4% | 1.3% |
| olnoname | Footwork | 140 | 41.4% | 41.4% | 0.0% |
| onememeaday | Pressure | 158 | 60.8% | 60.8% | 0.0% |
| osho | Footwork | 152 | 45.4% | 45.4% | 0.0% |
| otorps | Counter | 146 | 53.4% | 53.4% | 0.0% |
| pars | Brawler | 164 | 68.8% | 69.3% | 6.7% |
| peterpan | Paired | 140 | 41.4% | 41.7% | 0.7% |
| pilgrim | Brawler | 144 | 58.3% | 58.3% | 0.0% |
| pinewaffle | Pressure | 150 | 58.0% | 58.0% | 0.0% |
| pirate | Footwork | 138 | 52.9% | 54.5% | 4.3% |
| pongohpos10i | Zoning | 158 | 35.9% | 35.9% | 1.3% |
| potocaicai | Counter | 154 | 62.3% | 62.1% | 0.6% |
| pr0lificeth | Zoning | 158 | 55.1% | 55.1% | 0.0% |
| prim | Zoning | 138 | 48.6% | 48.2% | 0.7% |
| rainman | Footwork | 150 | 37.3% | 37.3% | 0.0% |
| razz | Counter | 144 | 48.6% | 48.6% | 1.4% |
| realityarchitect | Counter | 146 | 61.6% | 61.6% | 0.0% |
| rektina | Footwork | 134 | 55.2% | 55.2% | 0.0% |
| renzo | Pressure | 148 | 59.5% | 59.5% | 0.0% |
| reverend | Footwork | 146 | 49.3% | 49.3% | 1.4% |
| rivet | Pressure | 116 | 60.5% | 60.5% | 1.7% |
| rlarsson | Footwork | 146 | 41.7% | 41.7% | 1.4% |
| rmacpdx | Footwork | 152 | 44.7% | 44.7% | 1.3% |
| rune | Counter | 146 | 48.6% | 48.3% | 2.1% |
| saburdo | Pressure | 168 | 47.0% | 47.0% | 0.0% |
| samixsproto | Zoning | 138 | 62.3% | 62.3% | 0.0% |
| satoshi | Pressure | 132 | 50.0% | 50.0% | 1.5% |
| seph0x | Counter | 148 | 57.6% | 57.6% | 2.7% |
| sidelinereferee | Zoning | 142 | 57.9% | 57.9% | 1.4% |
| sirbitcoin | Counter | 140 | 60.3% | 60.3% | 2.9% |
| sirdidit | Footwork | 142 | 33.8% | 33.8% | 0.0% |
| sisma | Pressure | 144 | 50.0% | 50.0% | 0.0% |
| slabcorn | Brawler | 138 | 57.4% | 57.4% | 1.4% |
| slakesly | Counter | 148 | 58.9% | 58.9% | 1.4% |
| sober | Footwork | 154 | 46.8% | 46.8% | 0.0% |
| solanadelray | Paired | 144 | 50.0% | 49.6% | 2.1% |
| sprog | Footwork | 150 | 43.3% | 43.3% | 0.0% |
| sproteth | Footwork | 144 | 53.6% | 52.9% | 4.2% |
| sproto1011 | Weapon | 158 | 53.9% | 53.9% | 2.5% |
| sproto102 | Footwork | 154 | 33.8% | 33.8% | 0.0% |
| sproto1093 | Footwork | 134 | 46.1% | 46.1% | 4.5% |
| sproto1187 | Footwork | 166 | 43.4% | 43.4% | 0.0% |
| sproto1335 | Footwork | 144 | 42.4% | 42.4% | 0.0% |
| sproto1345 | Footwork | 148 | 43.8% | 43.8% | 1.4% |
| sproto1414 | Footwork | 162 | 50.0% | 50.0% | 0.0% |
| sproto1477 | Footwork | 158 | 48.1% | 48.1% | 2.5% |
| sproto1499 | Paired | 154 | 53.3% | 53.3% | 2.6% |
| sproto1601 | Zoning | 148 | 47.9% | 47.9% | 1.4% |
| sproto1625 | Paired | 148 | 52.7% | 52.1% | 1.4% |
| sproto1668 | Footwork | 162 | 33.3% | 33.3% | 0.0% |
| sproto1815 | Weapon | 164 | 58.0% | 58.4% | 1.8% |
| sproto1870 | Hover | 140 | 52.1% | 52.1% | 0.0% |
| sproto2010 | Paired | 134 | 54.5% | 54.5% | 1.5% |
| sproto2075 | Paired | 150 | 52.7% | 52.7% | 1.3% |
| sproto2101 | Footwork | 134 | 34.8% | 34.8% | 1.5% |
| sproto215 | Footwork | 140 | 42.0% | 42.0% | 1.4% |
| sproto2177 | Footwork | 162 | 27.8% | 27.8% | 0.0% |
| sproto2210 | Paired | 142 | 48.6% | 48.6% | 0.0% |
| sproto2322 | Footwork | 156 | 44.9% | 44.2% | 1.3% |
| sproto2344 | Paired | 152 | 51.3% | 51.3% | 1.3% |
| sproto2381 | Footwork | 148 | 43.8% | 43.1% | 2.7% |
| sproto2531 | Zoning | 152 | 52.0% | 52.0% | 0.0% |
| sproto2569 | Footwork | 134 | 34.3% | 34.6% | 0.7% |
| sproto2616 | Weapon | 144 | 59.0% | 59.0% | 0.0% |
| sproto2789 | Weapon | 144 | 59.3% | 59.3% | 2.8% |
| sproto282 | Paired | 150 | 54.1% | 54.1% | 1.3% |
| sproto2884 | Footwork | 146 | 53.4% | 53.4% | 0.0% |
| sproto3106 | Zoning | 132 | 50.8% | 50.8% | 1.5% |
| sproto313 | Footwork | 136 | 36.8% | 36.3% | 0.7% |
| sproto3152 | Zoning | 152 | 46.7% | 46.7% | 0.0% |
| sproto3181 | Paired | 150 | 46.7% | 47.3% | 1.3% |
| sproto3215 | Footwork | 150 | 38.0% | 38.0% | 0.0% |
| sproto3224 | Paired | 144 | 46.5% | 46.9% | 0.7% |
| sproto3235 | Paired | 154 | 55.8% | 55.8% | 0.0% |
| sproto651 | Footwork | 134 | 35.8% | 35.8% | 0.0% |
| sproto704 | Paired | 140 | 55.0% | 54.7% | 0.7% |
| sproto763 | Footwork | 152 | 42.7% | 42.7% | 1.3% |
| sproto818 | Footwork | 128 | 44.5% | 44.5% | 0.0% |
| sproto831 | Footwork | 130 | 38.5% | 38.5% | 0.0% |
| sproto832 | Paired | 144 | 50.7% | 50.7% | 1.4% |
| sproto834 | Footwork | 122 | 46.7% | 46.2% | 2.5% |
| sproto837 | Footwork | 144 | 45.8% | 45.8% | 0.0% |
| sproto865 | Footwork | 140 | 50.0% | 50.0% | 0.0% |
| sproto943 | Footwork | 130 | 42.3% | 42.3% | 0.0% |
| sproto999 | Footwork | 156 | 41.0% | 41.0% | 0.0% |
| sprotocius | Counter | 146 | 59.6% | 60.0% | 0.7% |
| sprotolg | Zoning | 146 | 45.2% | 45.2% | 0.0% |
| sprotomichaelsaylor | Zoning | 132 | 61.4% | 61.4% | 0.0% |
| sprotomidnightfx | Pressure | 160 | 50.0% | 50.0% | 1.3% |
| sprotopia | Zoning | 138 | 47.8% | 47.8% | 2.9% |
| sprotopotamus | Brawler | 158 | 50.0% | 50.0% | 5.1% |
| sprotosales | Footwork | 136 | 37.5% | 37.5% | 0.0% |
| sprotosurvivor | Zoning | 146 | 45.9% | 45.9% | 0.0% |
| spruto | Footwork | 138 | 50.7% | 50.4% | 0.7% |
| spunow | Footwork | 126 | 40.3% | 40.3% | 1.6% |
| stonkyleg69 | Footwork | 146 | 47.2% | 47.2% | 1.4% |
| stoto | Pressure | 166 | 48.8% | 49.1% | 1.8% |
| sweatpantstrust | Counter | 140 | 55.0% | 55.0% | 0.0% |
| tdeth | Pressure | 140 | 55.8% | 55.8% | 1.4% |
| teahupoo | Counter | 138 | 50.0% | 50.0% | 0.0% |
| theo | Zoning | 162 | 50.6% | 50.6% | 1.2% |
| thesprotowholivedeth | Zoning | 146 | 40.4% | 40.4% | 0.0% |
| thxobama | Counter | 140 | 47.8% | 47.8% | 1.4% |
| tingsmol | Footwork | 138 | 45.7% | 45.7% | 0.0% |
| tradertimmy | Counter | 144 | 62.7% | 62.7% | 1.4% |
| twinnyneutron | Paired | 146 | 51.4% | 51.4% | 2.7% |
| uncmasterflex | Footwork | 156 | 47.4% | 46.7% | 3.8% |
| urmometh | Footwork | 140 | 38.6% | 39.1% | 1.4% |
| usedtowels | Counter | 158 | 57.6% | 58.0% | 0.6% |
| vamp | Zoning | 152 | 44.1% | 44.1% | 0.0% |
| vaudream | Hover | 146 | 51.4% | 51.4% | 0.0% |
| vela | Zoning | 158 | 38.5% | 38.5% | 1.3% |
| veryseriousinvestor | Footwork | 144 | 43.8% | 43.8% | 0.0% |
| vicoo | Counter | 150 | 62.8% | 62.8% | 1.3% |
| vitaliketh | Footwork | 156 | 37.0% | 37.0% | 1.3% |
| wifebeater | Brawler | 146 | 58.2% | 58.2% | 0.0% |
| willuminati | Counter | 150 | 52.7% | 52.7% | 1.3% |
| wireitwell | Pressure | 148 | 50.0% | 50.0% | 1.4% |
| wyrmblvnt | Footwork | 156 | 61.7% | 61.7% | 1.3% |
| xalt | Zoning | 152 | 54.6% | 55.0% | 0.7% |
| xav | Footwork | 140 | 39.9% | 39.9% | 1.4% |
| yusuf | Pressure | 144 | 64.6% | 64.6% | 0.0% |
| zakarum | Footwork | 158 | 33.3% | 33.8% | 2.5% |
| zebracorn | Counter | 164 | 51.8% | 51.5% | 0.6% |
| zephyr | Brawler | 156 | 60.5% | 60.5% | 2.6% |
| zepump | Paired | 152 | 48.0% | 48.0% | 1.3% |
| zippy | Pressure | 162 | 47.5% | 47.5% | 0.0% |
| zudi | Counter | 150 | 44.6% | 44.6% | 1.3% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 2 | 0.0% |
| 86gwei vs alpha777 | 2 | 100.0% |
| 86gwei vs bidnehhh | 2 | 100.0% |
| 86gwei vs bitcoind1rk | 2 | 0.0% |
| 86gwei vs bront | 2 | 0.0% |
| 86gwei vs buddhashadow | 2 | 0.0% |
| 86gwei vs cam | 2 | 0.0% |
| 86gwei vs ciphersproto | 2 | 100.0% |
| 86gwei vs croy | 2 | 100.0% |
| 86gwei vs drzmoody | 2 | 0.0% |

