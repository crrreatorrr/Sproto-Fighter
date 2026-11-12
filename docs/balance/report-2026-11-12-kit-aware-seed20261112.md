# Balance tournament

Source: `4e80e9364ed116ae30025cc3ec02ce54576cb2aa`; simulation `84f964848ca02602`; source SHA-256 `38ae377905409b90b4d957b3b384aa8e75408bba6976890eede23d639aa838a5`.

Seed 20261112; 254 fighters; 9371 sampled pairs; 1 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes use canonical BALANCE_KITS assignments when available; legacy cores use analysis groupings of existing roles. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 7

18742 bouts; raw draws 0.1% (22); unresolved 0.1% (12); timeouts 0. Mean 29.90 s; median 30.03 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.1% | 50.1% | 0.1% | 5.42 s |
| 2 | 49.9% | 49.9% | 0.1% | 5.42 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 12630 | 48.4% | 48.4% | 0.1% |
| Counter | 7160 | 49.7% | 49.7% | 0.1% |
| Brawler | 3076 | 52.3% | 52.3% | 0.1% |
| Pressure | 4748 | 48.8% | 48.8% | 0.1% |
| Zoning | 5530 | 52.8% | 52.8% | 0.1% |
| Weapon | 1148 | 51.5% | 51.5% | 0.0% |
| Paired | 2898 | 51.2% | 51.2% | 0.3% |
| Hover | 294 | 50.3% | 50.3% | 0.7% |

Damage: melee 25281492; projectile 1800484; special 1425746; throw 1426352.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 52.6% | 52.6% | 0.0% |
| aaron | Footwork | 150 | 50.7% | 50.7% | 0.0% |
| accidentallyrich | Counter | 146 | 43.8% | 43.8% | 0.0% |
| agentsproto | Brawler | 128 | 48.4% | 48.4% | 0.0% |
| aktree | Zoning | 140 | 60.0% | 60.0% | 0.0% |
| aleksander | Counter | 160 | 58.1% | 58.1% | 0.0% |
| alpha777 | Pressure | 162 | 38.3% | 38.3% | 0.0% |
| anni | Pressure | 160 | 57.5% | 57.5% | 0.0% |
| autistophrenicsprotagonist | Footwork | 160 | 58.1% | 58.2% | 1.3% |
| azkarah | Zoning | 154 | 55.8% | 55.8% | 0.0% |
| benjamin | Footwork | 154 | 57.8% | 57.8% | 0.0% |
| berserk | Footwork | 142 | 56.3% | 56.3% | 0.0% |
| bgbadger | Zoning | 134 | 54.5% | 54.5% | 0.0% |
| bidnehhh | Pressure | 154 | 43.5% | 43.5% | 0.0% |
| bigal | Brawler | 140 | 57.1% | 57.1% | 0.0% |
| bigswole | Brawler | 154 | 52.6% | 52.6% | 0.0% |
| bimba | Footwork | 144 | 50.0% | 50.0% | 0.0% |
| bitcoind1rk | Footwork | 140 | 45.7% | 45.7% | 0.0% |
| blorfo | Weapon | 140 | 52.9% | 52.9% | 0.0% |
| bobdobbs | Footwork | 144 | 54.9% | 54.9% | 0.0% |
| brainsprot | Footwork | 140 | 48.6% | 48.6% | 0.0% |
| bront | Brawler | 162 | 55.6% | 55.6% | 0.0% |
| bs9090eth | Zoning | 148 | 43.2% | 43.2% | 0.0% |
| buddhashadow | Footwork | 152 | 44.7% | 44.7% | 0.0% |
| cam | Brawler | 144 | 61.1% | 61.1% | 0.0% |
| cantankerous | Pressure | 150 | 52.0% | 52.0% | 0.0% |
| captain | Zoning | 144 | 56.9% | 56.9% | 0.0% |
| captainhowdy | Footwork | 156 | 36.5% | 36.5% | 0.0% |
| ceo | Zoning | 148 | 56.8% | 56.8% | 0.0% |
| chaton | Footwork | 152 | 49.3% | 49.3% | 0.0% |
| chonky | Footwork | 142 | 47.9% | 47.9% | 0.0% |
| chrisfowler | Counter | 138 | 44.2% | 44.2% | 0.0% |
| ciphersproto | Pressure | 162 | 43.2% | 43.2% | 0.0% |
| clobrwn | Footwork | 146 | 43.2% | 43.2% | 0.0% |
| contresens | Zoning | 136 | 52.2% | 52.2% | 0.0% |
| corn | Pressure | 152 | 58.6% | 58.6% | 0.0% |
| crapto | Zoning | 166 | 57.2% | 57.9% | 1.2% |
| crippledlover | Footwork | 158 | 51.9% | 51.9% | 0.0% |
| croy | Counter | 134 | 53.0% | 53.0% | 0.0% |
| crumpleii | Brawler | 144 | 56.3% | 56.3% | 0.0% |
| cryptobartender | Zoning | 160 | 53.8% | 53.8% | 0.0% |
| cryptoboy | Counter | 154 | 50.6% | 50.6% | 0.0% |
| cryptomonger | Footwork | 146 | 63.0% | 63.0% | 0.0% |
| cryptorizzler | Counter | 158 | 60.1% | 60.1% | 0.0% |
| cryptoviking420 | Pressure | 146 | 48.6% | 48.6% | 0.0% |
| cyberviber | Counter | 126 | 57.9% | 57.9% | 0.0% |
| d86 | Zoning | 128 | 46.9% | 46.9% | 0.0% |
| danocrypto | Counter | 140 | 48.6% | 48.6% | 0.0% |
| davidcd | Footwork | 150 | 55.3% | 55.3% | 0.0% |
| degenpress | Zoning | 142 | 50.7% | 50.7% | 0.0% |
| dollarbitcoin | Brawler | 142 | 52.8% | 52.8% | 0.0% |
| drzmoody | Footwork | 178 | 47.2% | 47.2% | 0.0% |
| dumpstar | Brawler | 154 | 56.5% | 56.5% | 0.0% |
| duo | Paired | 148 | 55.4% | 55.1% | 0.7% |
| durlan | Footwork | 152 | 52.0% | 52.0% | 1.3% |
| emix | Footwork | 140 | 51.4% | 51.4% | 0.0% |
| erik | Footwork | 132 | 40.0% | 40.0% | 1.5% |
| familywagon | Brawler | 132 | 47.0% | 47.0% | 0.0% |
| feistyboi | Counter | 168 | 53.0% | 53.0% | 0.0% |
| felixsprotoarc | Zoning | 140 | 41.4% | 41.4% | 0.0% |
| fiatfudder | Counter | 138 | 47.1% | 47.1% | 0.0% |
| forchaneth | Footwork | 166 | 53.6% | 53.6% | 0.0% |
| fplgremlin | Pressure | 116 | 56.9% | 56.9% | 0.0% |
| freedfrida | Footwork | 150 | 54.0% | 54.0% | 0.0% |
| frej | Counter | 132 | 42.4% | 42.4% | 0.0% |
| freshprince | Counter | 142 | 45.8% | 45.8% | 0.0% |
| ghostsprotocol | Zoning | 156 | 47.4% | 47.4% | 0.0% |
| giavannykitchens | Pressure | 132 | 50.8% | 50.8% | 0.0% |
| glow | Counter | 132 | 51.5% | 51.1% | 0.8% |
| gluttony | Zoning | 124 | 42.7% | 42.7% | 0.0% |
| godether | Counter | 156 | 39.7% | 39.7% | 0.0% |
| godmod3d | Paired | 132 | 54.5% | 54.2% | 0.8% |
| godsson | Counter | 158 | 51.3% | 51.3% | 0.0% |
| gpm | Brawler | 168 | 47.0% | 47.0% | 0.0% |
| greatcharly | Footwork | 148 | 44.6% | 44.6% | 0.0% |
| gryph | Paired | 152 | 48.7% | 48.7% | 0.0% |
| guest07 | Pressure | 156 | 52.6% | 52.6% | 0.0% |
| guest08 | Zoning | 138 | 56.5% | 56.5% | 0.0% |
| guest09 | Pressure | 136 | 45.6% | 45.6% | 0.0% |
| guest10 | Zoning | 142 | 54.2% | 54.2% | 0.0% |
| guest11 | Counter | 152 | 57.9% | 57.9% | 0.0% |
| guest12 | Zoning | 158 | 62.0% | 62.0% | 0.0% |
| guest13 | Counter | 160 | 56.3% | 56.3% | 0.0% |
| guest14 | Counter | 150 | 44.7% | 44.7% | 0.0% |
| hdizzy | Zoning | 164 | 47.0% | 47.0% | 0.0% |
| herbpowell | Counter | 140 | 50.0% | 50.0% | 0.0% |
| hermionemichelleamyrose | Footwork | 148 | 61.5% | 61.5% | 0.0% |
| highsproto | Zoning | 156 | 50.0% | 50.0% | 0.0% |
| homosproto | Footwork | 150 | 55.3% | 55.3% | 0.0% |
| indiapolice | Counter | 130 | 47.7% | 47.7% | 0.0% |
| infinitysplitter | Footwork | 140 | 61.4% | 61.4% | 0.0% |
| isaac | Footwork | 138 | 50.7% | 50.7% | 0.0% |
| jameskaminski | Pressure | 162 | 45.7% | 45.7% | 0.0% |
| janitor | Brawler | 156 | 50.6% | 50.6% | 0.0% |
| jasper | Footwork | 134 | 41.8% | 41.8% | 0.0% |
| jayquant | Counter | 126 | 51.6% | 51.6% | 0.0% |
| johnson | Brawler | 136 | 50.0% | 50.0% | 0.0% |
| julian | Counter | 130 | 47.7% | 47.7% | 0.0% |
| kern | Counter | 148 | 52.0% | 52.0% | 0.0% |
| kerrieanne | Counter | 146 | 47.9% | 47.9% | 0.0% |
| laserbach | Pressure | 164 | 43.9% | 43.9% | 0.0% |
| lestrange | Footwork | 172 | 53.5% | 53.5% | 0.0% |
| leviosa | Footwork | 150 | 48.0% | 47.7% | 0.7% |
| lifeisameme | Pressure | 154 | 46.8% | 46.8% | 0.0% |
| lilgoldied | Counter | 156 | 46.2% | 46.2% | 0.0% |
| loadthebags | Pressure | 146 | 47.3% | 47.6% | 0.7% |
| loqi | Counter | 152 | 47.3% | 47.3% | 1.3% |
| lowernipple | Zoning | 128 | 50.0% | 50.0% | 0.0% |
| mandela | Weapon | 138 | 55.1% | 55.1% | 0.0% |
| marfrog | Footwork | 142 | 43.0% | 43.0% | 0.0% |
| maxbiggums | Brawler | 152 | 56.0% | 56.0% | 1.3% |
| melo | Weapon | 144 | 50.0% | 50.0% | 0.0% |
| michael | Weapon | 144 | 56.9% | 56.9% | 0.0% |
| micsash | Counter | 160 | 53.1% | 53.1% | 0.0% |
| mikemike | Brawler | 166 | 50.0% | 50.0% | 0.0% |
| mildtacos | Footwork | 146 | 50.0% | 50.0% | 0.0% |
| mlk | Counter | 158 | 41.8% | 41.8% | 0.0% |
| moonshiller | Brawler | 144 | 60.4% | 60.4% | 0.0% |
| mox | Counter | 142 | 41.5% | 41.5% | 0.0% |
| mrgoldrobe | Counter | 154 | 54.5% | 54.5% | 0.0% |
| mrhorsemeat | Counter | 140 | 47.9% | 47.9% | 0.0% |
| nate | Pressure | 160 | 44.4% | 44.4% | 0.0% |
| nick | Pressure | 150 | 55.4% | 55.4% | 1.3% |
| nomis | Pressure | 146 | 55.5% | 55.5% | 0.0% |
| nosmileclown | Paired | 134 | 51.5% | 51.5% | 0.0% |
| np | Footwork | 134 | 53.7% | 53.7% | 0.0% |
| obamasega420 | Footwork | 146 | 45.9% | 45.9% | 0.0% |
| olnoname | Footwork | 130 | 49.2% | 49.2% | 0.0% |
| onememeaday | Pressure | 146 | 45.2% | 45.2% | 0.0% |
| osho | Footwork | 138 | 39.1% | 39.1% | 0.0% |
| otorps | Counter | 152 | 41.4% | 41.4% | 0.0% |
| pars | Brawler | 140 | 52.9% | 52.9% | 0.0% |
| peterpan | Paired | 144 | 52.8% | 52.8% | 0.0% |
| pilgrim | Brawler | 146 | 56.2% | 56.2% | 0.0% |
| pinewaffle | Pressure | 144 | 52.1% | 52.1% | 0.0% |
| pirate | Footwork | 146 | 66.4% | 66.4% | 0.0% |
| pongohpos10i | Zoning | 120 | 45.0% | 45.0% | 0.0% |
| potocaicai | Counter | 156 | 55.1% | 55.1% | 0.0% |
| pr0lificeth | Zoning | 164 | 54.3% | 54.3% | 0.0% |
| prim | Zoning | 144 | 59.0% | 59.0% | 0.0% |
| rainman | Footwork | 158 | 50.0% | 50.0% | 0.0% |
| razz | Counter | 152 | 45.4% | 45.4% | 0.0% |
| realityarchitect | Counter | 160 | 51.2% | 50.6% | 1.3% |
| rektina | Footwork | 154 | 46.1% | 46.1% | 0.0% |
| renzo | Pressure | 170 | 49.4% | 49.4% | 0.0% |
| reverend | Footwork | 156 | 39.6% | 39.6% | 1.3% |
| rivet | Pressure | 162 | 55.6% | 55.6% | 0.0% |
| rlarsson | Footwork | 154 | 50.6% | 50.6% | 0.0% |
| rmacpdx | Footwork | 140 | 49.3% | 49.3% | 0.0% |
| rune | Counter | 144 | 45.1% | 45.1% | 0.0% |
| saburdo | Pressure | 162 | 51.9% | 51.9% | 0.0% |
| samixsproto | Zoning | 150 | 48.0% | 48.0% | 1.3% |
| satoshi | Pressure | 168 | 50.0% | 50.0% | 0.0% |
| seph0x | Counter | 154 | 41.6% | 41.6% | 0.0% |
| sidelinereferee | Zoning | 128 | 48.4% | 48.4% | 0.0% |
| sirbitcoin | Counter | 128 | 47.7% | 47.7% | 0.0% |
| sirdidit | Footwork | 176 | 43.8% | 43.8% | 0.0% |
| sisma | Pressure | 160 | 45.6% | 45.6% | 0.0% |
| slabcorn | Brawler | 138 | 44.2% | 44.2% | 0.0% |
| slakesly | Counter | 156 | 55.1% | 55.1% | 0.0% |
| sober | Footwork | 142 | 50.7% | 50.7% | 0.0% |
| solanadelray | Paired | 152 | 44.7% | 45.0% | 0.7% |
| sprog | Footwork | 146 | 42.5% | 42.5% | 0.0% |
| sproteth | Footwork | 130 | 55.4% | 55.4% | 0.0% |
| sproto1011 | Weapon | 172 | 40.1% | 40.1% | 0.0% |
| sproto102 | Footwork | 140 | 30.7% | 30.7% | 0.0% |
| sproto1093 | Footwork | 162 | 41.4% | 41.4% | 0.0% |
| sproto1187 | Footwork | 142 | 58.5% | 58.5% | 0.0% |
| sproto1335 | Footwork | 142 | 44.4% | 44.4% | 0.0% |
| sproto1345 | Footwork | 142 | 45.8% | 45.8% | 0.0% |
| sproto1414 | Footwork | 144 | 36.1% | 36.1% | 0.0% |
| sproto1477 | Footwork | 154 | 48.1% | 48.1% | 0.0% |
| sproto1499 | Paired | 158 | 52.5% | 52.9% | 0.6% |
| sproto1601 | Zoning | 144 | 54.9% | 54.9% | 0.0% |
| sproto1625 | Paired | 138 | 52.9% | 52.6% | 0.7% |
| sproto1668 | Footwork | 178 | 48.9% | 48.9% | 0.0% |
| sproto1815 | Weapon | 138 | 46.4% | 46.4% | 0.0% |
| sproto1870 | Hover | 134 | 56.1% | 56.1% | 1.5% |
| sproto2010 | Paired | 156 | 55.8% | 55.8% | 0.0% |
| sproto2075 | Paired | 138 | 51.4% | 51.4% | 0.0% |
| sproto2101 | Footwork | 158 | 41.8% | 41.8% | 0.0% |
| sproto215 | Footwork | 140 | 47.1% | 47.5% | 0.7% |
| sproto2177 | Footwork | 152 | 38.8% | 38.8% | 0.0% |
| sproto2210 | Paired | 144 | 49.3% | 49.7% | 0.7% |
| sproto2322 | Footwork | 164 | 50.0% | 50.0% | 0.0% |
| sproto2344 | Paired | 140 | 42.1% | 42.1% | 0.0% |
| sproto2381 | Footwork | 168 | 47.6% | 47.3% | 0.6% |
| sproto2531 | Zoning | 142 | 64.1% | 64.1% | 0.0% |
| sproto2569 | Footwork | 150 | 52.0% | 52.0% | 0.0% |
| sproto2616 | Weapon | 144 | 52.8% | 52.8% | 0.0% |
| sproto2789 | Weapon | 128 | 60.9% | 60.9% | 0.0% |
| sproto282 | Paired | 136 | 43.4% | 43.4% | 0.0% |
| sproto2884 | Footwork | 150 | 48.7% | 48.7% | 0.0% |
| sproto3106 | Zoning | 152 | 54.6% | 54.6% | 0.0% |
| sproto313 | Footwork | 140 | 42.9% | 42.9% | 0.0% |
| sproto3152 | Zoning | 136 | 43.4% | 43.4% | 0.0% |
| sproto3181 | Paired | 148 | 52.0% | 51.7% | 0.7% |
| sproto3215 | Footwork | 166 | 42.2% | 42.2% | 0.0% |
| sproto3224 | Paired | 142 | 54.2% | 54.2% | 0.0% |
| sproto3235 | Paired | 142 | 64.1% | 64.1% | 0.0% |
| sproto651 | Footwork | 140 | 56.4% | 56.4% | 0.0% |
| sproto704 | Paired | 146 | 52.1% | 52.4% | 0.7% |
| sproto763 | Footwork | 144 | 42.4% | 42.4% | 0.0% |
| sproto818 | Footwork | 132 | 42.4% | 42.4% | 0.0% |
| sproto831 | Footwork | 140 | 49.3% | 49.3% | 0.0% |
| sproto832 | Paired | 154 | 55.8% | 55.8% | 0.0% |
| sproto834 | Footwork | 158 | 51.9% | 51.9% | 0.0% |
| sproto837 | Footwork | 152 | 35.5% | 35.5% | 0.0% |
| sproto865 | Footwork | 156 | 46.8% | 46.8% | 1.3% |
| sproto943 | Footwork | 154 | 51.3% | 51.3% | 0.0% |
| sproto999 | Footwork | 146 | 52.1% | 52.4% | 0.7% |
| sprotocius | Counter | 150 | 48.7% | 48.7% | 0.0% |
| sprotolg | Zoning | 162 | 50.6% | 50.6% | 1.2% |
| sprotomichaelsaylor | Zoning | 150 | 50.7% | 50.7% | 0.0% |
| sprotomidnightfx | Pressure | 148 | 39.9% | 39.9% | 0.0% |
| sprotopia | Zoning | 142 | 54.9% | 54.9% | 0.0% |
| sprotopotamus | Brawler | 148 | 52.7% | 52.7% | 0.0% |
| sprotosales | Footwork | 138 | 54.4% | 54.4% | 1.4% |
| sprotosurvivor | Zoning | 130 | 58.5% | 58.5% | 0.0% |
| spruto | Footwork | 140 | 47.9% | 47.9% | 0.0% |
| spunow | Footwork | 142 | 48.6% | 48.6% | 0.0% |
| stonkyleg69 | Footwork | 160 | 45.6% | 45.6% | 0.0% |
| stoto | Pressure | 166 | 37.3% | 37.3% | 0.0% |
| sweatpantstrust | Counter | 156 | 60.3% | 60.3% | 0.0% |
| tdeth | Pressure | 154 | 45.5% | 45.5% | 0.0% |
| teahupoo | Counter | 152 | 50.7% | 50.7% | 0.0% |
| theo | Zoning | 160 | 50.6% | 50.6% | 1.3% |
| thesprotowholivedeth | Zoning | 142 | 56.3% | 56.3% | 0.0% |
| thxobama | Counter | 124 | 43.5% | 43.5% | 0.0% |
| tingsmol | Footwork | 154 | 35.7% | 35.7% | 0.0% |
| tradertimmy | Counter | 150 | 50.0% | 50.0% | 0.0% |
| twinnyneutron | Paired | 136 | 46.3% | 46.3% | 0.0% |
| uncmasterflex | Footwork | 134 | 43.3% | 43.3% | 0.0% |
| urmometh | Footwork | 156 | 48.7% | 48.7% | 0.0% |
| usedtowels | Counter | 152 | 52.0% | 52.0% | 0.0% |
| vamp | Zoning | 144 | 59.0% | 59.0% | 0.0% |
| vaudream | Hover | 160 | 45.6% | 45.6% | 0.0% |
| vela | Zoning | 156 | 54.5% | 54.5% | 0.0% |
| veryseriousinvestor | Footwork | 142 | 50.7% | 50.7% | 0.0% |
| vicoo | Counter | 124 | 55.6% | 55.6% | 0.0% |
| vitaliketh | Footwork | 154 | 51.9% | 51.9% | 0.0% |
| wifebeater | Brawler | 140 | 38.6% | 38.6% | 0.0% |
| willuminati | Counter | 140 | 42.9% | 42.9% | 0.0% |
| wireitwell | Pressure | 156 | 54.5% | 54.5% | 0.0% |
| wyrmblvnt | Footwork | 140 | 54.3% | 54.3% | 0.0% |
| xalt | Zoning | 158 | 54.4% | 54.4% | 0.0% |
| xav | Footwork | 144 | 39.6% | 39.6% | 0.0% |
| yusuf | Pressure | 144 | 56.3% | 56.3% | 0.0% |
| zakarum | Footwork | 146 | 47.3% | 47.3% | 0.0% |
| zebracorn | Counter | 154 | 58.4% | 58.4% | 0.0% |
| zephyr | Brawler | 142 | 50.7% | 50.7% | 0.0% |
| zepump | Paired | 158 | 44.9% | 44.9% | 0.0% |
| zippy | Pressure | 160 | 47.5% | 47.5% | 0.0% |
| zudi | Counter | 130 | 50.8% | 50.8% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs aaron | 2 | 0.0% |
| 86gwei vs accidentallyrich | 2 | 0.0% |
| 86gwei vs agentsproto | 2 | 100.0% |
| 86gwei vs alpha777 | 2 | 100.0% |
| 86gwei vs autistophrenicsprotagonist | 2 | 0.0% |
| 86gwei vs benjamin | 2 | 0.0% |
| 86gwei vs berserk | 2 | 100.0% |
| 86gwei vs bidnehhh | 2 | 100.0% |
| 86gwei vs brainsprot | 2 | 100.0% |
| 86gwei vs buddhashadow | 2 | 100.0% |

