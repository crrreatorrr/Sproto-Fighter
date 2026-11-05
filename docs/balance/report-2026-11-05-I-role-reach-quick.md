# Balance tournament

Source: `efb5829c1230dac84337ba0212d92a84a527563b`; simulation `a4c7ddde49ec5a64`; source SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`.

Seed 20261105; 254 fighters; 508 sampled pairs; 2 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes use canonical BALANCE_KITS assignments when available; legacy cores use analysis groupings of existing roles. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 4

2032 bouts; raw draws 0.0% (0); unresolved 0.0% (0); timeouts 0. Mean 28.14 s; median 28.25 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.3% | 50.3% | 0.0% | 5.14 s |
| 2 | 49.7% | 49.7% | 0.0% | 5.13 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 1368 | 53.0% | 53.0% | 0.0% |
| Zoning | 632 | 51.6% | 51.6% | 0.0% |
| Counter | 820 | 52.6% | 52.6% | 0.0% |
| Pressure | 492 | 42.9% | 42.9% | 0.0% |
| Paired | 288 | 46.2% | 46.2% | 0.0% |
| Weapon | 140 | 42.1% | 42.1% | 0.0% |
| Brawler | 292 | 44.9% | 44.9% | 0.0% |
| Hover | 32 | 50.0% | 50.0% | 0.0% |

Damage: melee 2077599; projectile 851276; special 140733; throw 200340.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| aaron | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| accidentallyrich | Counter | 12 | 50.0% | 50.0% | 0.0% |
| agentsproto | Brawler | 8 | 50.0% | 50.0% | 0.0% |
| aktree | Zoning | 12 | 33.3% | 33.3% | 0.0% |
| aleksander | Counter | 12 | 33.3% | 33.3% | 0.0% |
| alpha777 | Pressure | 16 | 12.5% | 12.5% | 0.0% |
| anni | Pressure | 12 | 83.3% | 83.3% | 0.0% |
| autistophrenicsprotagonist | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| azkarah | Zoning | 16 | 12.5% | 12.5% | 0.0% |
| benjamin | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| berserk | Footwork | 12 | 83.3% | 83.3% | 0.0% |
| bgbadger | Zoning | 12 | 66.7% | 66.7% | 0.0% |
| bidnehhh | Pressure | 20 | 30.0% | 30.0% | 0.0% |
| bigal | Brawler | 12 | 16.7% | 16.7% | 0.0% |
| bigswole | Brawler | 16 | 25.0% | 25.0% | 0.0% |
| bimba | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| bitcoind1rk | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| blorfo | Weapon | 12 | 33.3% | 33.3% | 0.0% |
| bobdobbs | Footwork | 16 | 75.0% | 75.0% | 0.0% |
| brainsprot | Footwork | 20 | 40.0% | 40.0% | 0.0% |
| bront | Brawler | 8 | 25.0% | 25.0% | 0.0% |
| bs9090eth | Zoning | 24 | 50.0% | 50.0% | 0.0% |
| buddhashadow | Footwork | 16 | 75.0% | 75.0% | 0.0% |
| cam | Brawler | 16 | 37.5% | 37.5% | 0.0% |
| cantankerous | Pressure | 8 | 0.0% | 0.0% | 0.0% |
| captain | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| captainhowdy | Footwork | 24 | 50.0% | 50.0% | 0.0% |
| ceo | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| chaton | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| chonky | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| chrisfowler | Counter | 16 | 50.0% | 50.0% | 0.0% |
| ciphersproto | Pressure | 20 | 40.0% | 40.0% | 0.0% |
| clobrwn | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| contresens | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| corn | Pressure | 20 | 10.0% | 10.0% | 0.0% |
| crapto | Zoning | 12 | 83.3% | 83.3% | 0.0% |
| crippledlover | Footwork | 16 | 75.0% | 75.0% | 0.0% |
| croy | Counter | 12 | 33.3% | 33.3% | 0.0% |
| crumpleii | Brawler | 8 | 25.0% | 25.0% | 0.0% |
| cryptobartender | Zoning | 36 | 55.6% | 55.6% | 0.0% |
| cryptoboy | Counter | 12 | 50.0% | 50.0% | 0.0% |
| cryptomonger | Footwork | 20 | 70.0% | 70.0% | 0.0% |
| cryptorizzler | Counter | 28 | 39.3% | 39.3% | 0.0% |
| cryptoviking420 | Pressure | 28 | 50.0% | 50.0% | 0.0% |
| cyberviber | Counter | 12 | 83.3% | 83.3% | 0.0% |
| d86 | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| danocrypto | Counter | 16 | 50.0% | 50.0% | 0.0% |
| davidcd | Footwork | 16 | 75.0% | 75.0% | 0.0% |
| degenpress | Zoning | 24 | 41.7% | 41.7% | 0.0% |
| dollarbitcoin | Brawler | 12 | 33.3% | 33.3% | 0.0% |
| drzmoody | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| dumpstar | Brawler | 16 | 62.5% | 62.5% | 0.0% |
| duo | Paired | 16 | 68.8% | 68.8% | 0.0% |
| durlan | Footwork | 32 | 37.5% | 37.5% | 0.0% |
| emix | Footwork | 20 | 70.0% | 70.0% | 0.0% |
| erik | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| familywagon | Brawler | 12 | 33.3% | 33.3% | 0.0% |
| feistyboi | Counter | 12 | 66.7% | 66.7% | 0.0% |
| felixsprotoarc | Zoning | 16 | 75.0% | 75.0% | 0.0% |
| fiatfudder | Counter | 12 | 50.0% | 50.0% | 0.0% |
| forchaneth | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| fplgremlin | Pressure | 16 | 0.0% | 0.0% | 0.0% |
| freedfrida | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| frej | Counter | 8 | 50.0% | 50.0% | 0.0% |
| freshprince | Counter | 20 | 40.0% | 40.0% | 0.0% |
| ghostsprotocol | Zoning | 12 | 83.3% | 83.3% | 0.0% |
| giavannykitchens | Pressure | 20 | 30.0% | 30.0% | 0.0% |
| glow | Counter | 16 | 100.0% | 100.0% | 0.0% |
| gluttony | Zoning | 28 | 42.9% | 42.9% | 0.0% |
| godether | Counter | 16 | 93.8% | 93.8% | 0.0% |
| godmod3d | Paired | 20 | 55.0% | 55.0% | 0.0% |
| godsson | Counter | 24 | 58.3% | 58.3% | 0.0% |
| gpm | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| greatcharly | Footwork | 24 | 75.0% | 75.0% | 0.0% |
| gryph | Paired | 12 | 50.0% | 50.0% | 0.0% |
| guest07 | Pressure | 16 | 12.5% | 12.5% | 0.0% |
| guest08 | Zoning | 24 | 62.5% | 62.5% | 0.0% |
| guest09 | Pressure | 12 | 83.3% | 83.3% | 0.0% |
| guest10 | Zoning | 16 | 87.5% | 87.5% | 0.0% |
| guest11 | Counter | 24 | 41.7% | 41.7% | 0.0% |
| guest12 | Zoning | 16 | 87.5% | 87.5% | 0.0% |
| guest13 | Counter | 20 | 50.0% | 50.0% | 0.0% |
| guest14 | Counter | 24 | 50.0% | 50.0% | 0.0% |
| hdizzy | Zoning | 20 | 60.0% | 60.0% | 0.0% |
| herbpowell | Counter | 20 | 60.0% | 60.0% | 0.0% |
| hermionemichelleamyrose | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| highsproto | Zoning | 16 | 25.0% | 25.0% | 0.0% |
| homosproto | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| indiapolice | Counter | 20 | 50.0% | 50.0% | 0.0% |
| infinitysplitter | Footwork | 20 | 70.0% | 70.0% | 0.0% |
| isaac | Footwork | 20 | 40.0% | 40.0% | 0.0% |
| jameskaminski | Pressure | 24 | 33.3% | 33.3% | 0.0% |
| janitor | Brawler | 24 | 37.5% | 37.5% | 0.0% |
| jasper | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| jayquant | Counter | 16 | 25.0% | 25.0% | 0.0% |
| johnson | Brawler | 12 | 66.7% | 66.7% | 0.0% |
| julian | Counter | 32 | 62.5% | 62.5% | 0.0% |
| kern | Counter | 24 | 33.3% | 33.3% | 0.0% |
| kerrieanne | Counter | 16 | 25.0% | 25.0% | 0.0% |
| laserbach | Pressure | 8 | 0.0% | 0.0% | 0.0% |
| lestrange | Footwork | 12 | 16.7% | 16.7% | 0.0% |
| leviosa | Footwork | 24 | 58.3% | 58.3% | 0.0% |
| lifeisameme | Pressure | 16 | 62.5% | 62.5% | 0.0% |
| lilgoldied | Counter | 12 | 50.0% | 50.0% | 0.0% |
| loadthebags | Pressure | 24 | 66.7% | 66.7% | 0.0% |
| loqi | Counter | 12 | 50.0% | 50.0% | 0.0% |
| lowernipple | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| mandela | Weapon | 12 | 33.3% | 33.3% | 0.0% |
| marfrog | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| maxbiggums | Brawler | 16 | 62.5% | 62.5% | 0.0% |
| melo | Weapon | 16 | 25.0% | 25.0% | 0.0% |
| michael | Weapon | 24 | 20.8% | 20.8% | 0.0% |
| micsash | Counter | 20 | 60.0% | 60.0% | 0.0% |
| mikemike | Brawler | 12 | 41.7% | 41.7% | 0.0% |
| mildtacos | Footwork | 12 | 83.3% | 83.3% | 0.0% |
| mlk | Counter | 8 | 50.0% | 50.0% | 0.0% |
| moonshiller | Brawler | 16 | 62.5% | 62.5% | 0.0% |
| mox | Counter | 12 | 50.0% | 50.0% | 0.0% |
| mrgoldrobe | Counter | 20 | 50.0% | 50.0% | 0.0% |
| mrhorsemeat | Counter | 16 | 62.5% | 62.5% | 0.0% |
| nate | Pressure | 16 | 68.8% | 68.8% | 0.0% |
| nick | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| nomis | Pressure | 12 | 33.3% | 33.3% | 0.0% |
| nosmileclown | Paired | 12 | 58.3% | 58.3% | 0.0% |
| np | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| obamasega420 | Footwork | 16 | 31.3% | 31.3% | 0.0% |
| olnoname | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| onememeaday | Pressure | 20 | 70.0% | 70.0% | 0.0% |
| osho | Footwork | 8 | 0.0% | 0.0% | 0.0% |
| otorps | Counter | 16 | 31.3% | 31.3% | 0.0% |
| pars | Brawler | 12 | 66.7% | 66.7% | 0.0% |
| peterpan | Paired | 16 | 25.0% | 25.0% | 0.0% |
| pilgrim | Brawler | 8 | 25.0% | 25.0% | 0.0% |
| pinewaffle | Pressure | 16 | 25.0% | 25.0% | 0.0% |
| pirate | Footwork | 8 | 25.0% | 25.0% | 0.0% |
| pongohpos10i | Zoning | 36 | 66.7% | 66.7% | 0.0% |
| potocaicai | Counter | 20 | 80.0% | 80.0% | 0.0% |
| pr0lificeth | Zoning | 20 | 40.0% | 40.0% | 0.0% |
| prim | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| rainman | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| razz | Counter | 12 | 16.7% | 16.7% | 0.0% |
| realityarchitect | Counter | 24 | 66.7% | 66.7% | 0.0% |
| rektina | Footwork | 12 | 83.3% | 83.3% | 0.0% |
| renzo | Pressure | 12 | 66.7% | 66.7% | 0.0% |
| reverend | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| rivet | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| rlarsson | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| rmacpdx | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| rune | Counter | 12 | 83.3% | 83.3% | 0.0% |
| saburdo | Pressure | 20 | 60.0% | 60.0% | 0.0% |
| samixsproto | Zoning | 20 | 60.0% | 60.0% | 0.0% |
| satoshi | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| seph0x | Counter | 16 | 37.5% | 37.5% | 0.0% |
| sidelinereferee | Zoning | 24 | 50.0% | 50.0% | 0.0% |
| sirbitcoin | Counter | 16 | 37.5% | 37.5% | 0.0% |
| sirdidit | Footwork | 16 | 25.0% | 25.0% | 0.0% |
| sisma | Pressure | 8 | 0.0% | 0.0% | 0.0% |
| slabcorn | Brawler | 12 | 0.0% | 0.0% | 0.0% |
| slakesly | Counter | 16 | 25.0% | 25.0% | 0.0% |
| sober | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| solanadelray | Paired | 12 | 33.3% | 33.3% | 0.0% |
| sprog | Footwork | 16 | 68.8% | 68.8% | 0.0% |
| sproteth | Footwork | 20 | 50.0% | 50.0% | 0.0% |
| sproto1011 | Weapon | 36 | 52.8% | 52.8% | 0.0% |
| sproto102 | Footwork | 20 | 80.0% | 80.0% | 0.0% |
| sproto1093 | Footwork | 8 | 0.0% | 0.0% | 0.0% |
| sproto1187 | Footwork | 24 | 66.7% | 66.7% | 0.0% |
| sproto1335 | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| sproto1345 | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| sproto1414 | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| sproto1477 | Footwork | 20 | 50.0% | 50.0% | 0.0% |
| sproto1499 | Paired | 16 | 37.5% | 37.5% | 0.0% |
| sproto1601 | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| sproto1625 | Paired | 12 | 58.3% | 58.3% | 0.0% |
| sproto1668 | Footwork | 12 | 83.3% | 83.3% | 0.0% |
| sproto1815 | Weapon | 16 | 100.0% | 100.0% | 0.0% |
| sproto1870 | Hover | 16 | 37.5% | 37.5% | 0.0% |
| sproto2010 | Paired | 8 | 62.5% | 62.5% | 0.0% |
| sproto2075 | Paired | 12 | 66.7% | 66.7% | 0.0% |
| sproto2101 | Footwork | 28 | 50.0% | 50.0% | 0.0% |
| sproto215 | Footwork | 28 | 64.3% | 64.3% | 0.0% |
| sproto2177 | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| sproto2210 | Paired | 12 | 33.3% | 33.3% | 0.0% |
| sproto2322 | Footwork | 8 | 25.0% | 25.0% | 0.0% |
| sproto2344 | Paired | 24 | 45.8% | 45.8% | 0.0% |
| sproto2381 | Footwork | 20 | 30.0% | 30.0% | 0.0% |
| sproto2531 | Zoning | 16 | 75.0% | 75.0% | 0.0% |
| sproto2569 | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| sproto2616 | Weapon | 12 | 33.3% | 33.3% | 0.0% |
| sproto2789 | Weapon | 12 | 25.0% | 25.0% | 0.0% |
| sproto282 | Paired | 20 | 40.0% | 40.0% | 0.0% |
| sproto2884 | Footwork | 8 | 0.0% | 0.0% | 0.0% |
| sproto3106 | Zoning | 12 | 33.3% | 33.3% | 0.0% |
| sproto313 | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| sproto3152 | Zoning | 12 | 83.3% | 83.3% | 0.0% |
| sproto3181 | Paired | 24 | 45.8% | 45.8% | 0.0% |
| sproto3215 | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| sproto3224 | Paired | 8 | 50.0% | 50.0% | 0.0% |
| sproto3235 | Paired | 16 | 25.0% | 25.0% | 0.0% |
| sproto651 | Footwork | 20 | 50.0% | 50.0% | 0.0% |
| sproto704 | Paired | 8 | 0.0% | 0.0% | 0.0% |
| sproto763 | Footwork | 20 | 30.0% | 30.0% | 0.0% |
| sproto818 | Footwork | 16 | 43.8% | 43.8% | 0.0% |
| sproto831 | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| sproto832 | Paired | 12 | 66.7% | 66.7% | 0.0% |
| sproto834 | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| sproto837 | Footwork | 28 | 60.7% | 60.7% | 0.0% |
| sproto865 | Footwork | 8 | 37.5% | 37.5% | 0.0% |
| sproto943 | Footwork | 24 | 75.0% | 75.0% | 0.0% |
| sproto999 | Footwork | 12 | 16.7% | 16.7% | 0.0% |
| sprotocius | Counter | 12 | 16.7% | 16.7% | 0.0% |
| sprotolg | Zoning | 16 | 56.3% | 56.3% | 0.0% |
| sprotomichaelsaylor | Zoning | 12 | 0.0% | 0.0% | 0.0% |
| sprotomidnightfx | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sprotopia | Zoning | 8 | 75.0% | 75.0% | 0.0% |
| sprotopotamus | Brawler | 24 | 45.8% | 45.8% | 0.0% |
| sprotosales | Footwork | 28 | 28.6% | 28.6% | 0.0% |
| sprotosurvivor | Zoning | 16 | 37.5% | 37.5% | 0.0% |
| spruto | Footwork | 12 | 66.7% | 66.7% | 0.0% |
| spunow | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| stonkyleg69 | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| stoto | Pressure | 12 | 83.3% | 83.3% | 0.0% |
| sweatpantstrust | Counter | 20 | 60.0% | 60.0% | 0.0% |
| tdeth | Pressure | 20 | 40.0% | 40.0% | 0.0% |
| teahupoo | Counter | 8 | 75.0% | 75.0% | 0.0% |
| theo | Zoning | 28 | 28.6% | 28.6% | 0.0% |
| thesprotowholivedeth | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| thxobama | Counter | 8 | 25.0% | 25.0% | 0.0% |
| tingsmol | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| tradertimmy | Counter | 20 | 60.0% | 60.0% | 0.0% |
| twinnyneutron | Paired | 16 | 50.0% | 50.0% | 0.0% |
| uncmasterflex | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| urmometh | Footwork | 20 | 40.0% | 40.0% | 0.0% |
| usedtowels | Counter | 12 | 50.0% | 50.0% | 0.0% |
| vamp | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| vaudream | Hover | 16 | 62.5% | 62.5% | 0.0% |
| vela | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| veryseriousinvestor | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| vicoo | Counter | 16 | 50.0% | 50.0% | 0.0% |
| vitaliketh | Footwork | 12 | 66.7% | 66.7% | 0.0% |
| wifebeater | Brawler | 16 | 62.5% | 62.5% | 0.0% |
| willuminati | Counter | 32 | 68.8% | 68.8% | 0.0% |
| wireitwell | Pressure | 20 | 30.0% | 30.0% | 0.0% |
| wyrmblvnt | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| xalt | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| xav | Footwork | 16 | 93.8% | 93.8% | 0.0% |
| yusuf | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| zakarum | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| zebracorn | Counter | 24 | 58.3% | 58.3% | 0.0% |
| zephyr | Brawler | 20 | 70.0% | 70.0% | 0.0% |
| zepump | Paired | 12 | 50.0% | 50.0% | 0.0% |
| zippy | Pressure | 20 | 60.0% | 60.0% | 0.0% |
| zudi | Counter | 12 | 83.3% | 83.3% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs gluttony | 4 | 100.0% |
| 86gwei vs mildtacos | 4 | 0.0% |
| 86gwei vs sproto704 | 4 | 100.0% |
| aaron vs sproto3235 | 4 | 100.0% |
| aaron vs wyrmblvnt | 4 | 0.0% |
| aaron vs xav | 4 | 0.0% |
| aktree vs sproto215 | 4 | 0.0% |
| aleksander vs yusuf | 4 | 0.0% |
| alpha777 vs felixsprotoarc | 4 | 0.0% |
| alpha777 vs forchaneth | 4 | 0.0% |

## Skill 7

2032 bouts; raw draws 0.0% (0); unresolved 0.0% (0); timeouts 0. Mean 32.46 s; median 32.37 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.1% | 50.1% | 0.0% | 5.64 s |
| 2 | 49.9% | 49.9% | 0.0% | 5.63 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 1368 | 50.2% | 50.2% | 0.0% |
| Zoning | 632 | 49.5% | 49.5% | 0.0% |
| Counter | 820 | 53.2% | 53.2% | 0.0% |
| Pressure | 492 | 48.0% | 48.0% | 0.0% |
| Paired | 288 | 48.3% | 48.3% | 0.0% |
| Weapon | 140 | 47.9% | 47.9% | 0.0% |
| Brawler | 292 | 47.9% | 47.9% | 0.0% |
| Hover | 32 | 43.8% | 43.8% | 0.0% |

Damage: melee 2099721; projectile 781527; special 188709; throw 144757.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 20 | 40.0% | 40.0% | 0.0% |
| aaron | Footwork | 16 | 56.3% | 56.3% | 0.0% |
| accidentallyrich | Counter | 12 | 33.3% | 33.3% | 0.0% |
| agentsproto | Brawler | 8 | 75.0% | 75.0% | 0.0% |
| aktree | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| aleksander | Counter | 12 | 83.3% | 83.3% | 0.0% |
| alpha777 | Pressure | 16 | 37.5% | 37.5% | 0.0% |
| anni | Pressure | 12 | 0.0% | 0.0% | 0.0% |
| autistophrenicsprotagonist | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| azkarah | Zoning | 16 | 62.5% | 62.5% | 0.0% |
| benjamin | Footwork | 16 | 43.8% | 43.8% | 0.0% |
| berserk | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| bgbadger | Zoning | 12 | 83.3% | 83.3% | 0.0% |
| bidnehhh | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| bigal | Brawler | 12 | 16.7% | 16.7% | 0.0% |
| bigswole | Brawler | 16 | 25.0% | 25.0% | 0.0% |
| bimba | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| bitcoind1rk | Footwork | 20 | 45.0% | 45.0% | 0.0% |
| blorfo | Weapon | 12 | 33.3% | 33.3% | 0.0% |
| bobdobbs | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| brainsprot | Footwork | 20 | 20.0% | 20.0% | 0.0% |
| bront | Brawler | 8 | 50.0% | 50.0% | 0.0% |
| bs9090eth | Zoning | 24 | 37.5% | 37.5% | 0.0% |
| buddhashadow | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| cam | Brawler | 16 | 50.0% | 50.0% | 0.0% |
| cantankerous | Pressure | 8 | 25.0% | 25.0% | 0.0% |
| captain | Zoning | 12 | 100.0% | 100.0% | 0.0% |
| captainhowdy | Footwork | 24 | 50.0% | 50.0% | 0.0% |
| ceo | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| chaton | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| chonky | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| chrisfowler | Counter | 16 | 37.5% | 37.5% | 0.0% |
| ciphersproto | Pressure | 20 | 40.0% | 40.0% | 0.0% |
| clobrwn | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| contresens | Zoning | 16 | 25.0% | 25.0% | 0.0% |
| corn | Pressure | 20 | 70.0% | 70.0% | 0.0% |
| crapto | Zoning | 12 | 33.3% | 33.3% | 0.0% |
| crippledlover | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| croy | Counter | 12 | 33.3% | 33.3% | 0.0% |
| crumpleii | Brawler | 8 | 75.0% | 75.0% | 0.0% |
| cryptobartender | Zoning | 36 | 55.6% | 55.6% | 0.0% |
| cryptoboy | Counter | 12 | 66.7% | 66.7% | 0.0% |
| cryptomonger | Footwork | 20 | 80.0% | 80.0% | 0.0% |
| cryptorizzler | Counter | 28 | 57.1% | 57.1% | 0.0% |
| cryptoviking420 | Pressure | 28 | 35.7% | 35.7% | 0.0% |
| cyberviber | Counter | 12 | 83.3% | 83.3% | 0.0% |
| d86 | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| danocrypto | Counter | 16 | 25.0% | 25.0% | 0.0% |
| davidcd | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| degenpress | Zoning | 24 | 66.7% | 66.7% | 0.0% |
| dollarbitcoin | Brawler | 12 | 33.3% | 33.3% | 0.0% |
| drzmoody | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| dumpstar | Brawler | 16 | 50.0% | 50.0% | 0.0% |
| duo | Paired | 16 | 37.5% | 37.5% | 0.0% |
| durlan | Footwork | 32 | 25.0% | 25.0% | 0.0% |
| emix | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| erik | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| familywagon | Brawler | 12 | 41.7% | 41.7% | 0.0% |
| feistyboi | Counter | 12 | 66.7% | 66.7% | 0.0% |
| felixsprotoarc | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| fiatfudder | Counter | 12 | 66.7% | 66.7% | 0.0% |
| forchaneth | Footwork | 8 | 25.0% | 25.0% | 0.0% |
| fplgremlin | Pressure | 16 | 87.5% | 87.5% | 0.0% |
| freedfrida | Footwork | 12 | 66.7% | 66.7% | 0.0% |
| frej | Counter | 8 | 0.0% | 0.0% | 0.0% |
| freshprince | Counter | 20 | 80.0% | 80.0% | 0.0% |
| ghostsprotocol | Zoning | 12 | 16.7% | 16.7% | 0.0% |
| giavannykitchens | Pressure | 20 | 30.0% | 30.0% | 0.0% |
| glow | Counter | 16 | 50.0% | 50.0% | 0.0% |
| gluttony | Zoning | 28 | 57.1% | 57.1% | 0.0% |
| godether | Counter | 16 | 37.5% | 37.5% | 0.0% |
| godmod3d | Paired | 20 | 40.0% | 40.0% | 0.0% |
| godsson | Counter | 24 | 41.7% | 41.7% | 0.0% |
| gpm | Brawler | 12 | 16.7% | 16.7% | 0.0% |
| greatcharly | Footwork | 24 | 75.0% | 75.0% | 0.0% |
| gryph | Paired | 12 | 75.0% | 75.0% | 0.0% |
| guest07 | Pressure | 16 | 62.5% | 62.5% | 0.0% |
| guest08 | Zoning | 24 | 62.5% | 62.5% | 0.0% |
| guest09 | Pressure | 12 | 83.3% | 83.3% | 0.0% |
| guest10 | Zoning | 16 | 37.5% | 37.5% | 0.0% |
| guest11 | Counter | 24 | 41.7% | 41.7% | 0.0% |
| guest12 | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| guest13 | Counter | 20 | 80.0% | 80.0% | 0.0% |
| guest14 | Counter | 24 | 58.3% | 58.3% | 0.0% |
| hdizzy | Zoning | 20 | 40.0% | 40.0% | 0.0% |
| herbpowell | Counter | 20 | 50.0% | 50.0% | 0.0% |
| hermionemichelleamyrose | Footwork | 16 | 37.5% | 37.5% | 0.0% |
| highsproto | Zoning | 16 | 62.5% | 62.5% | 0.0% |
| homosproto | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| indiapolice | Counter | 20 | 40.0% | 40.0% | 0.0% |
| infinitysplitter | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| isaac | Footwork | 20 | 70.0% | 70.0% | 0.0% |
| jameskaminski | Pressure | 24 | 33.3% | 33.3% | 0.0% |
| janitor | Brawler | 24 | 58.3% | 58.3% | 0.0% |
| jasper | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| jayquant | Counter | 16 | 37.5% | 37.5% | 0.0% |
| johnson | Brawler | 12 | 16.7% | 16.7% | 0.0% |
| julian | Counter | 32 | 43.8% | 43.8% | 0.0% |
| kern | Counter | 24 | 50.0% | 50.0% | 0.0% |
| kerrieanne | Counter | 16 | 81.3% | 81.3% | 0.0% |
| laserbach | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| lestrange | Footwork | 12 | 33.3% | 33.3% | 0.0% |
| leviosa | Footwork | 24 | 58.3% | 58.3% | 0.0% |
| lifeisameme | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| lilgoldied | Counter | 12 | 50.0% | 50.0% | 0.0% |
| loadthebags | Pressure | 24 | 66.7% | 66.7% | 0.0% |
| loqi | Counter | 12 | 66.7% | 66.7% | 0.0% |
| lowernipple | Zoning | 12 | 66.7% | 66.7% | 0.0% |
| mandela | Weapon | 12 | 50.0% | 50.0% | 0.0% |
| marfrog | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| maxbiggums | Brawler | 16 | 75.0% | 75.0% | 0.0% |
| melo | Weapon | 16 | 37.5% | 37.5% | 0.0% |
| michael | Weapon | 24 | 50.0% | 50.0% | 0.0% |
| micsash | Counter | 20 | 40.0% | 40.0% | 0.0% |
| mikemike | Brawler | 12 | 8.3% | 8.3% | 0.0% |
| mildtacos | Footwork | 12 | 0.0% | 0.0% | 0.0% |
| mlk | Counter | 8 | 75.0% | 75.0% | 0.0% |
| moonshiller | Brawler | 16 | 25.0% | 25.0% | 0.0% |
| mox | Counter | 12 | 50.0% | 50.0% | 0.0% |
| mrgoldrobe | Counter | 20 | 30.0% | 30.0% | 0.0% |
| mrhorsemeat | Counter | 16 | 62.5% | 62.5% | 0.0% |
| nate | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| nick | Pressure | 12 | 33.3% | 33.3% | 0.0% |
| nomis | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| nosmileclown | Paired | 12 | 50.0% | 50.0% | 0.0% |
| np | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| obamasega420 | Footwork | 16 | 43.8% | 43.8% | 0.0% |
| olnoname | Footwork | 8 | 0.0% | 0.0% | 0.0% |
| onememeaday | Pressure | 20 | 40.0% | 40.0% | 0.0% |
| osho | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| otorps | Counter | 16 | 56.3% | 56.3% | 0.0% |
| pars | Brawler | 12 | 33.3% | 33.3% | 0.0% |
| peterpan | Paired | 16 | 62.5% | 62.5% | 0.0% |
| pilgrim | Brawler | 8 | 75.0% | 75.0% | 0.0% |
| pinewaffle | Pressure | 16 | 37.5% | 37.5% | 0.0% |
| pirate | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| pongohpos10i | Zoning | 36 | 50.0% | 50.0% | 0.0% |
| potocaicai | Counter | 20 | 50.0% | 50.0% | 0.0% |
| pr0lificeth | Zoning | 20 | 40.0% | 40.0% | 0.0% |
| prim | Zoning | 8 | 75.0% | 75.0% | 0.0% |
| rainman | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| razz | Counter | 12 | 33.3% | 33.3% | 0.0% |
| realityarchitect | Counter | 24 | 66.7% | 66.7% | 0.0% |
| rektina | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| renzo | Pressure | 12 | 83.3% | 83.3% | 0.0% |
| reverend | Footwork | 20 | 70.0% | 70.0% | 0.0% |
| rivet | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| rlarsson | Footwork | 16 | 25.0% | 25.0% | 0.0% |
| rmacpdx | Footwork | 16 | 75.0% | 75.0% | 0.0% |
| rune | Counter | 12 | 100.0% | 100.0% | 0.0% |
| saburdo | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| samixsproto | Zoning | 20 | 50.0% | 50.0% | 0.0% |
| satoshi | Pressure | 16 | 37.5% | 37.5% | 0.0% |
| seph0x | Counter | 16 | 25.0% | 25.0% | 0.0% |
| sidelinereferee | Zoning | 24 | 33.3% | 33.3% | 0.0% |
| sirbitcoin | Counter | 16 | 75.0% | 75.0% | 0.0% |
| sirdidit | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| sisma | Pressure | 8 | 25.0% | 25.0% | 0.0% |
| slabcorn | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| slakesly | Counter | 16 | 62.5% | 62.5% | 0.0% |
| sober | Footwork | 12 | 66.7% | 66.7% | 0.0% |
| solanadelray | Paired | 12 | 41.7% | 41.7% | 0.0% |
| sprog | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| sproteth | Footwork | 20 | 60.0% | 60.0% | 0.0% |
| sproto1011 | Weapon | 36 | 69.4% | 69.4% | 0.0% |
| sproto102 | Footwork | 20 | 80.0% | 80.0% | 0.0% |
| sproto1093 | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| sproto1187 | Footwork | 24 | 50.0% | 50.0% | 0.0% |
| sproto1335 | Footwork | 12 | 83.3% | 83.3% | 0.0% |
| sproto1345 | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| sproto1414 | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| sproto1477 | Footwork | 20 | 70.0% | 70.0% | 0.0% |
| sproto1499 | Paired | 16 | 31.3% | 31.3% | 0.0% |
| sproto1601 | Zoning | 12 | 33.3% | 33.3% | 0.0% |
| sproto1625 | Paired | 12 | 41.7% | 41.7% | 0.0% |
| sproto1668 | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| sproto1815 | Weapon | 16 | 37.5% | 37.5% | 0.0% |
| sproto1870 | Hover | 16 | 37.5% | 37.5% | 0.0% |
| sproto2010 | Paired | 8 | 75.0% | 75.0% | 0.0% |
| sproto2075 | Paired | 12 | 41.7% | 41.7% | 0.0% |
| sproto2101 | Footwork | 28 | 42.9% | 42.9% | 0.0% |
| sproto215 | Footwork | 28 | 64.3% | 64.3% | 0.0% |
| sproto2177 | Footwork | 16 | 25.0% | 25.0% | 0.0% |
| sproto2210 | Paired | 12 | 66.7% | 66.7% | 0.0% |
| sproto2322 | Footwork | 8 | 25.0% | 25.0% | 0.0% |
| sproto2344 | Paired | 24 | 33.3% | 33.3% | 0.0% |
| sproto2381 | Footwork | 20 | 50.0% | 50.0% | 0.0% |
| sproto2531 | Zoning | 16 | 25.0% | 25.0% | 0.0% |
| sproto2569 | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| sproto2616 | Weapon | 12 | 50.0% | 50.0% | 0.0% |
| sproto2789 | Weapon | 12 | 16.7% | 16.7% | 0.0% |
| sproto282 | Paired | 20 | 50.0% | 50.0% | 0.0% |
| sproto2884 | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| sproto3106 | Zoning | 12 | 16.7% | 16.7% | 0.0% |
| sproto313 | Footwork | 16 | 62.5% | 62.5% | 0.0% |
| sproto3152 | Zoning | 12 | 66.7% | 66.7% | 0.0% |
| sproto3181 | Paired | 24 | 41.7% | 41.7% | 0.0% |
| sproto3215 | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| sproto3224 | Paired | 8 | 75.0% | 75.0% | 0.0% |
| sproto3235 | Paired | 16 | 43.8% | 43.8% | 0.0% |
| sproto651 | Footwork | 20 | 20.0% | 20.0% | 0.0% |
| sproto704 | Paired | 8 | 25.0% | 25.0% | 0.0% |
| sproto763 | Footwork | 20 | 80.0% | 80.0% | 0.0% |
| sproto818 | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| sproto831 | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| sproto832 | Paired | 12 | 58.3% | 58.3% | 0.0% |
| sproto834 | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| sproto837 | Footwork | 28 | 28.6% | 28.6% | 0.0% |
| sproto865 | Footwork | 8 | 12.5% | 12.5% | 0.0% |
| sproto943 | Footwork | 24 | 50.0% | 50.0% | 0.0% |
| sproto999 | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| sprotocius | Counter | 12 | 66.7% | 66.7% | 0.0% |
| sprotolg | Zoning | 16 | 62.5% | 62.5% | 0.0% |
| sprotomichaelsaylor | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| sprotomidnightfx | Pressure | 12 | 83.3% | 83.3% | 0.0% |
| sprotopia | Zoning | 8 | 50.0% | 50.0% | 0.0% |
| sprotopotamus | Brawler | 24 | 75.0% | 75.0% | 0.0% |
| sprotosales | Footwork | 28 | 35.7% | 35.7% | 0.0% |
| sprotosurvivor | Zoning | 16 | 25.0% | 25.0% | 0.0% |
| spruto | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| spunow | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| stonkyleg69 | Footwork | 16 | 43.8% | 43.8% | 0.0% |
| stoto | Pressure | 12 | 16.7% | 16.7% | 0.0% |
| sweatpantstrust | Counter | 20 | 50.0% | 50.0% | 0.0% |
| tdeth | Pressure | 20 | 30.0% | 30.0% | 0.0% |
| teahupoo | Counter | 8 | 50.0% | 50.0% | 0.0% |
| theo | Zoning | 28 | 46.4% | 46.4% | 0.0% |
| thesprotowholivedeth | Zoning | 8 | 50.0% | 50.0% | 0.0% |
| thxobama | Counter | 8 | 50.0% | 50.0% | 0.0% |
| tingsmol | Footwork | 16 | 25.0% | 25.0% | 0.0% |
| tradertimmy | Counter | 20 | 60.0% | 60.0% | 0.0% |
| twinnyneutron | Paired | 16 | 50.0% | 50.0% | 0.0% |
| uncmasterflex | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| urmometh | Footwork | 20 | 80.0% | 80.0% | 0.0% |
| usedtowels | Counter | 12 | 50.0% | 50.0% | 0.0% |
| vamp | Zoning | 16 | 87.5% | 87.5% | 0.0% |
| vaudream | Hover | 16 | 50.0% | 50.0% | 0.0% |
| vela | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| veryseriousinvestor | Footwork | 12 | 16.7% | 16.7% | 0.0% |
| vicoo | Counter | 16 | 62.5% | 62.5% | 0.0% |
| vitaliketh | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| wifebeater | Brawler | 16 | 75.0% | 75.0% | 0.0% |
| willuminati | Counter | 32 | 56.3% | 56.3% | 0.0% |
| wireitwell | Pressure | 20 | 70.0% | 70.0% | 0.0% |
| wyrmblvnt | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| xalt | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| xav | Footwork | 16 | 56.3% | 56.3% | 0.0% |
| yusuf | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| zakarum | Footwork | 16 | 25.0% | 25.0% | 0.0% |
| zebracorn | Counter | 24 | 33.3% | 33.3% | 0.0% |
| zephyr | Brawler | 20 | 60.0% | 60.0% | 0.0% |
| zepump | Paired | 12 | 66.7% | 66.7% | 0.0% |
| zippy | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| zudi | Counter | 12 | 66.7% | 66.7% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs gluttony | 4 | 0.0% |
| 86gwei vs mildtacos | 4 | 100.0% |
| 86gwei vs nomis | 4 | 0.0% |
| aaron vs wyrmblvnt | 4 | 100.0% |
| accidentallyrich vs brainsprot | 4 | 100.0% |
| accidentallyrich vs mrhorsemeat | 4 | 0.0% |
| accidentallyrich vs sproto1011 | 4 | 0.0% |
| agentsproto vs sproto3235 | 4 | 100.0% |
| aleksander vs emix | 4 | 100.0% |
| aleksander vs hdizzy | 4 | 100.0% |
