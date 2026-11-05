# Balance tournament

Source: `209f16eecfd0de1087a65234c9ef18826fa2e120`; simulation `af94139cc59e4dfd`; source SHA-256 `bb507d57a2f6c6d460f0258d7cb0c61070a50fd52a1252a3667758a79c5bb1fa`.

Seed 20261105; 254 fighters; 508 sampled pairs; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. The seed controls opponent sampling; the legacy CPU itself has no randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes are analysis groupings of existing roles, not normalized gameplay templates. Small-sample extremes are diagnostic, not confidence bounds.

The current CPU has no skill parameter. Requested levels were collapsed to a single legacy baseline; Normal/Hard balance claims cannot yet be made.

Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

## Legacy CPU

1016 bouts; raw draws 54.5% (554); unresolved 54.3% (552); timeouts 0. Mean 15.28 s; median 15.28 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 49.8% | 54.5% | 1.15 s |
| 2 | 50.0% | 50.2% | 54.5% | 1.15 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 176 | 67.9% | 67.9% | 68.2% |
| Zoning | 224 | 59.2% | 59.2% | 56.3% |
| Counter | 264 | 62.1% | 62.1% | 56.1% |
| Pressure | 1062 | 47.5% | 47.6% | 51.3% |
| Paired | 144 | 27.6% | 25.0% | 61.1% |
| Weapon | 46 | 15.4% | 16.0% | 45.7% |
| Brawler | 94 | 61.9% | 61.9% | 55.3% |
| Hover | 22 | 28.6% | 28.6% | 36.4% |

Damage: melee 1682197; projectile 338105; special 0; throw 0.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 10 | 100.0% | 100.0% | 80.0% |
| aaron | Pressure | 8 | 0.0% | 0.0% | 25.0% |
| accidentallyrich | Counter | 6 | 50.0% | 50.0% | 33.3% |
| agentsproto | Brawler | 4 | 100.0% | 100.0% | 0.0% |
| aktree | Zoning | 6 | 100.0% | 100.0% | 33.3% |
| aleksander | Pressure | 6 | n/a | n/a | 100.0% |
| alpha777 | Pressure | 8 | 0.0% | 0.0% | 25.0% |
| anni | Pressure | 6 | 0.0% | 0.0% | 33.3% |
| autistophrenicsprotagonist | Footwork | 8 | 50.0% | 50.0% | 50.0% |
| azkarah | Zoning | 8 | n/a | n/a | 100.0% |
| benjamin | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| berserk | Footwork | 6 | 100.0% | 100.0% | 66.7% |
| bgbadger | Zoning | 6 | 100.0% | 100.0% | 66.7% |
| bidnehhh | Pressure | 10 | 100.0% | 100.0% | 40.0% |
| bigal | Brawler | 6 | 0.0% | 0.0% | 66.7% |
| bigswole | Brawler | 8 | 0.0% | 0.0% | 25.0% |
| bimba | Pressure | 8 | 100.0% | 100.0% | 0.0% |
| bitcoind1rk | Pressure | 10 | 25.0% | 25.0% | 20.0% |
| blorfo | Pressure | 6 | 100.0% | 100.0% | 66.7% |
| bobdobbs | Footwork | 8 | 0.0% | 0.0% | 75.0% |
| brainsprot | Pressure | 10 | 100.0% | 100.0% | 20.0% |
| bront | Brawler | 4 | 0.0% | 0.0% | 0.0% |
| bs9090eth | Zoning | 12 | 100.0% | 100.0% | 83.3% |
| buddhashadow | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| cam | Brawler | 8 | 66.7% | 66.7% | 25.0% |
| cantankerous | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| captain | Zoning | 6 | n/a | n/a | 100.0% |
| captainhowdy | Pressure | 12 | 0.0% | 0.0% | 33.3% |
| ceo | Zoning | 8 | 66.7% | 66.7% | 25.0% |
| chaton | Pressure | 10 | 0.0% | 0.0% | 80.0% |
| chonky | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| chrisfowler | Counter | 8 | 100.0% | 100.0% | 75.0% |
| ciphersproto | Pressure | 10 | 100.0% | 100.0% | 80.0% |
| clobrwn | Footwork | 8 | 100.0% | 100.0% | 50.0% |
| contresens | Zoning | 8 | 0.0% | 0.0% | 0.0% |
| corn | Pressure | 10 | 0.0% | 0.0% | 80.0% |
| crapto | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| crippledlover | Footwork | 8 | 0.0% | 0.0% | 50.0% |
| croy | Counter | 6 | 50.0% | 50.0% | 33.3% |
| crumpleii | Brawler | 4 | n/a | n/a | 100.0% |
| cryptobartender | Zoning | 18 | 100.0% | 100.0% | 55.6% |
| cryptoboy | Counter | 6 | 100.0% | 100.0% | 0.0% |
| cryptomonger | Footwork | 10 | 100.0% | 100.0% | 80.0% |
| cryptorizzler | Counter | 14 | 100.0% | 100.0% | 85.7% |
| cryptoviking420 | Pressure | 14 | 100.0% | 100.0% | 71.4% |
| cyberviber | Pressure | 6 | 0.0% | 0.0% | 66.7% |
| d86 | Zoning | 4 | 100.0% | 100.0% | 50.0% |
| danocrypto | Pressure | 8 | n/a | n/a | 100.0% |
| davidcd | Pressure | 8 | 0.0% | 0.0% | 25.0% |
| degenpress | Zoning | 12 | 100.0% | 100.0% | 33.3% |
| dollarbitcoin | Brawler | 6 | 100.0% | 100.0% | 33.3% |
| drzmoody | Footwork | 8 | 100.0% | 100.0% | 50.0% |
| dumpstar | Pressure | 8 | 100.0% | 100.0% | 0.0% |
| duo | Paired | 8 | 0.0% | 0.0% | 75.0% |
| durlan | Footwork | 16 | 25.0% | 25.0% | 50.0% |
| emix | Pressure | 10 | 50.0% | 50.0% | 60.0% |
| erik | Pressure | 6 | 100.0% | 100.0% | 66.7% |
| familywagon | Brawler | 6 | 100.0% | 100.0% | 66.7% |
| feistyboi | Counter | 6 | 100.0% | 100.0% | 33.3% |
| felixsprotoarc | Zoning | 8 | 0.0% | 0.0% | 50.0% |
| fiatfudder | Pressure | 6 | 100.0% | 100.0% | 66.7% |
| forchaneth | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| fplgremlin | Pressure | 8 | 100.0% | 100.0% | 50.0% |
| freedfrida | Footwork | 6 | n/a | n/a | 100.0% |
| frej | Counter | 4 | n/a | n/a | 100.0% |
| freshprince | Pressure | 10 | 100.0% | 100.0% | 80.0% |
| ghostsprotocol | Zoning | 6 | 0.0% | 0.0% | 33.3% |
| giavannykitchens | Pressure | 10 | 80.0% | 80.0% | 0.0% |
| glow | Counter | 8 | n/a | n/a | 100.0% |
| gluttony | Zoning | 14 | 0.0% | 0.0% | 0.0% |
| godether | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| godmod3d | Paired | 10 | 100.0% | 100.0% | 80.0% |
| godsson | Counter | 12 | 100.0% | 100.0% | 33.3% |
| gpm | Pressure | 6 | 100.0% | 100.0% | 0.0% |
| greatcharly | Pressure | 12 | 0.0% | 0.0% | 66.7% |
| gryph | Paired | 6 | n/a | n/a | 100.0% |
| guest07 | Pressure | 8 | 0.0% | 0.0% | 25.0% |
| guest08 | Pressure | 12 | 0.0% | 0.0% | 0.0% |
| guest09 | Pressure | 6 | 100.0% | 100.0% | 33.3% |
| guest10 | Pressure | 8 | n/a | n/a | 100.0% |
| guest11 | Pressure | 12 | n/a | n/a | 100.0% |
| guest12 | Pressure | 8 | 33.3% | 33.3% | 25.0% |
| guest13 | Pressure | 10 | 100.0% | 100.0% | 20.0% |
| guest14 | Pressure | 12 | 0.0% | 0.0% | 0.0% |
| hdizzy | Zoning | 10 | 100.0% | 100.0% | 80.0% |
| herbpowell | Counter | 10 | 0.0% | 0.0% | 40.0% |
| hermionemichelleamyrose | Footwork | 8 | 100.0% | 100.0% | 50.0% |
| highsproto | Zoning | 8 | 50.0% | 50.0% | 50.0% |
| homosproto | Footwork | 6 | 100.0% | 100.0% | 66.7% |
| indiapolice | Counter | 10 | 0.0% | 0.0% | 40.0% |
| infinitysplitter | Pressure | 10 | 100.0% | 100.0% | 80.0% |
| isaac | Footwork | 10 | 100.0% | 100.0% | 60.0% |
| jameskaminski | Pressure | 12 | 66.7% | 66.7% | 50.0% |
| janitor | Brawler | 12 | n/a | n/a | 100.0% |
| jasper | Pressure | 6 | 0.0% | 0.0% | 33.3% |
| jayquant | Counter | 8 | n/a | n/a | 100.0% |
| johnson | Brawler | 6 | 100.0% | 100.0% | 33.3% |
| julian | Counter | 16 | 50.0% | 50.0% | 75.0% |
| kern | Counter | 12 | 66.7% | 66.7% | 50.0% |
| kerrieanne | Counter | 8 | 100.0% | 100.0% | 75.0% |
| laserbach | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| lestrange | Footwork | 6 | n/a | n/a | 100.0% |
| leviosa | Pressure | 12 | 100.0% | 100.0% | 66.7% |
| lifeisameme | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| lilgoldied | Counter | 6 | 33.3% | 33.3% | 0.0% |
| loadthebags | Pressure | 12 | 0.0% | 0.0% | 16.7% |
| loqi | Counter | 6 | 100.0% | 100.0% | 66.7% |
| lowernipple | Pressure | 6 | 50.0% | 50.0% | 33.3% |
| mandela | Pressure | 6 | 0.0% | 0.0% | 0.0% |
| marfrog | Footwork | 8 | 100.0% | 100.0% | 75.0% |
| maxbiggums | Brawler | 8 | 100.0% | 100.0% | 50.0% |
| melo | Weapon | 8 | 50.0% | 50.0% | 50.0% |
| michael | Pressure | 12 | 33.3% | 33.3% | 50.0% |
| micsash | Counter | 10 | 100.0% | 100.0% | 40.0% |
| mikemike | Brawler | 6 | n/a | n/a | 100.0% |
| mildtacos | Footwork | 6 | n/a | n/a | 100.0% |
| mlk | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| moonshiller | Pressure | 8 | n/a | n/a | 100.0% |
| mox | Pressure | 6 | 100.0% | 100.0% | 0.0% |
| mrgoldrobe | Pressure | 10 | 100.0% | 100.0% | 20.0% |
| mrhorsemeat | Counter | 8 | 0.0% | 0.0% | 75.0% |
| nate | Pressure | 8 | 0.0% | 0.0% | 50.0% |
| nick | Pressure | 6 | 33.3% | 33.3% | 0.0% |
| nomis | Pressure | 6 | n/a | n/a | 100.0% |
| nosmileclown | Paired | 6 | 100.0% | 100.0% | 66.7% |
| np | Footwork | 6 | n/a | n/a | 100.0% |
| obamasega420 | Footwork | 8 | 100.0% | 100.0% | 50.0% |
| olnoname | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| onememeaday | Pressure | 10 | 66.7% | 66.7% | 40.0% |
| osho | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| otorps | Counter | 8 | 0.0% | 0.0% | 25.0% |
| pars | Brawler | 6 | 50.0% | 50.0% | 33.3% |
| peterpan | Paired | 8 | 100.0% | 100.0% | 75.0% |
| pilgrim | Brawler | 4 | 100.0% | 100.0% | 50.0% |
| pinewaffle | Pressure | 8 | 0.0% | 0.0% | 75.0% |
| pirate | Pressure | 4 | n/a | n/a | 100.0% |
| pongohpos10i | Zoning | 18 | 100.0% | 100.0% | 66.7% |
| potocaicai | Pressure | 10 | 50.0% | 50.0% | 60.0% |
| pr0lificeth | Zoning | 10 | 100.0% | 100.0% | 20.0% |
| prim | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| rainman | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| razz | Counter | 6 | n/a | n/a | 100.0% |
| realityarchitect | Pressure | 12 | 66.7% | 66.7% | 50.0% |
| rektina | Pressure | 6 | n/a | n/a | 100.0% |
| renzo | Pressure | 6 | 100.0% | 100.0% | 66.7% |
| reverend | Pressure | 10 | 25.0% | 25.0% | 20.0% |
| rivet | Pressure | 4 | 100.0% | 100.0% | 0.0% |
| rlarsson | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| rmacpdx | Pressure | 8 | n/a | n/a | 100.0% |
| rune | Pressure | 6 | n/a | n/a | 100.0% |
| saburdo | Pressure | 10 | n/a | n/a | 100.0% |
| samixsproto | Zoning | 10 | 0.0% | 0.0% | 40.0% |
| satoshi | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| seph0x | Counter | 8 | 100.0% | 100.0% | 75.0% |
| sidelinereferee | Zoning | 12 | 100.0% | 100.0% | 83.3% |
| sirbitcoin | Counter | 8 | 100.0% | 100.0% | 50.0% |
| sirdidit | Pressure | 8 | 50.0% | 50.0% | 50.0% |
| sisma | Pressure | 4 | 0.0% | 0.0% | 50.0% |
| slabcorn | Brawler | 6 | n/a | n/a | 100.0% |
| slakesly | Counter | 8 | 66.7% | 66.7% | 25.0% |
| sober | Pressure | 6 | 50.0% | 50.0% | 33.3% |
| solanadelray | Paired | 6 | 100.0% | 100.0% | 33.3% |
| sprog | Pressure | 8 | 0.0% | 0.0% | 50.0% |
| sproteth | Pressure | 10 | 66.7% | 66.7% | 40.0% |
| sproto1011 | Weapon | 18 | 0.0% | 0.0% | 38.9% |
| sproto102 | Pressure | 10 | 0.0% | 0.0% | 40.0% |
| sproto1093 | Pressure | 4 | n/a | n/a | 100.0% |
| sproto1187 | Pressure | 12 | 0.0% | 0.0% | 16.7% |
| sproto1335 | Pressure | 6 | 0.0% | 0.0% | 0.0% |
| sproto1345 | Pressure | 8 | 33.3% | 33.3% | 25.0% |
| sproto1414 | Pressure | 8 | 100.0% | 100.0% | 50.0% |
| sproto1477 | Pressure | 10 | 100.0% | 100.0% | 80.0% |
| sproto1499 | Paired | 8 | n/a | n/a | 100.0% |
| sproto1601 | Pressure | 6 | 100.0% | 100.0% | 66.7% |
| sproto1625 | Paired | 6 | 0.0% | 0.0% | 66.7% |
| sproto1668 | Pressure | 6 | n/a | n/a | 100.0% |
| sproto1815 | Weapon | 8 | 0.0% | 0.0% | 50.0% |
| sproto1870 | Hover | 8 | 0.0% | 0.0% | 75.0% |
| sproto2010 | Paired | 4 | 0.0% | 0.0% | 0.0% |
| sproto2075 | Paired | 6 | 0.0% | 0.0% | 33.3% |
| sproto2101 | Pressure | 14 | 0.0% | 0.0% | 42.9% |
| sproto215 | Pressure | 14 | 0.0% | 0.0% | 57.1% |
| sproto2177 | Pressure | 8 | 33.3% | 33.3% | 25.0% |
| sproto2210 | Paired | 6 | 0.0% | 0.0% | 33.3% |
| sproto2322 | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| sproto2344 | Paired | 12 | 0.0% | 0.0% | 66.7% |
| sproto2381 | Pressure | 10 | 100.0% | 100.0% | 40.0% |
| sproto2531 | Pressure | 8 | 100.0% | 100.0% | 0.0% |
| sproto2569 | Pressure | 4 | n/a | n/a | 100.0% |
| sproto2616 | Weapon | 6 | 100.0% | 100.0% | 66.7% |
| sproto2789 | Weapon | 6 | 0.0% | 0.0% | 33.3% |
| sproto282 | Paired | 10 | 0.0% | 0.0% | 0.0% |
| sproto2884 | Pressure | 4 | n/a | n/a | 100.0% |
| sproto3106 | Pressure | 6 | 0.0% | 0.0% | 33.3% |
| sproto313 | Pressure | 8 | 0.0% | 0.0% | 0.0% |
| sproto3152 | Pressure | 6 | 0.0% | 0.0% | 66.7% |
| sproto3181 | Paired | 12 | 0.0% | 0.0% | 83.3% |
| sproto3215 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| sproto3224 | Paired | 4 | 0.0% | 0.0% | 0.0% |
| sproto3235 | Paired | 8 | 0.0% | 0.0% | 50.0% |
| sproto651 | Pressure | 10 | 100.0% | 100.0% | 20.0% |
| sproto704 | Paired | 4 | 0.0% | 0.0% | 50.0% |
| sproto763 | Pressure | 10 | 0.0% | 0.0% | 40.0% |
| sproto818 | Pressure | 8 | 0.0% | 0.0% | 25.0% |
| sproto831 | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| sproto832 | Paired | 6 | 100.0% | 100.0% | 66.7% |
| sproto834 | Pressure | 6 | n/a | n/a | 100.0% |
| sproto837 | Pressure | 14 | 100.0% | 100.0% | 71.4% |
| sproto865 | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| sproto943 | Pressure | 12 | 0.0% | 0.0% | 83.3% |
| sproto999 | Pressure | 6 | 0.0% | 0.0% | 0.0% |
| sprotocius | Counter | 6 | 100.0% | 100.0% | 0.0% |
| sprotolg | Zoning | 8 | 100.0% | 100.0% | 75.0% |
| sprotomichaelsaylor | Zoning | 6 | 100.0% | 100.0% | 66.7% |
| sprotomidnightfx | Pressure | 6 | 100.0% | 100.0% | 66.7% |
| sprotopia | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| sprotopotamus | Pressure | 12 | 100.0% | 100.0% | 83.3% |
| sprotosales | Pressure | 14 | 0.0% | 0.0% | 28.6% |
| sprotosurvivor | Zoning | 8 | n/a | n/a | 100.0% |
| spruto | Pressure | 6 | 0.0% | 0.0% | 66.7% |
| spunow | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| stonkyleg69 | Footwork | 8 | n/a | n/a | 100.0% |
| stoto | Pressure | 6 | 0.0% | 0.0% | 33.3% |
| sweatpantstrust | Counter | 10 | 100.0% | 100.0% | 60.0% |
| tdeth | Pressure | 10 | 0.0% | 0.0% | 60.0% |
| teahupoo | Counter | 4 | n/a | n/a | 100.0% |
| theo | Zoning | 14 | 100.0% | 100.0% | 85.7% |
| thesprotowholivedeth | Zoning | 4 | 100.0% | 100.0% | 50.0% |
| thxobama | Pressure | 4 | 100.0% | 100.0% | 50.0% |
| tingsmol | Footwork | 8 | 100.0% | 100.0% | 75.0% |
| tradertimmy | Counter | 10 | 0.0% | 0.0% | 40.0% |
| twinnyneutron | Paired | 8 | 100.0% | 100.0% | 87.5% |
| uncmasterflex | Pressure | 8 | 100.0% | 100.0% | 25.0% |
| urmometh | Pressure | 10 | 50.0% | 50.0% | 60.0% |
| usedtowels | Counter | 6 | 100.0% | 100.0% | 66.7% |
| vamp | Pressure | 8 | n/a | n/a | 100.0% |
| vaudream | Hover | 8 | 0.0% | 0.0% | 0.0% |
| vela | Hover | 6 | 100.0% | 100.0% | 33.3% |
| veryseriousinvestor | Footwork | 6 | 0.0% | 0.0% | 33.3% |
| vicoo | Counter | 8 | 0.0% | 0.0% | 50.0% |
| vitaliketh | Pressure | 6 | 100.0% | 100.0% | 66.7% |
| wifebeater | Pressure | 8 | 66.7% | 66.7% | 25.0% |
| willuminati | Pressure | 16 | 0.0% | 0.0% | 87.5% |
| wireitwell | Pressure | 10 | 0.0% | 0.0% | 10.0% |
| wyrmblvnt | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| xalt | Pressure | 4 | n/a | n/a | 100.0% |
| xav | Pressure | 8 | 100.0% | 100.0% | 75.0% |
| yusuf | Pressure | 4 | n/a | n/a | 100.0% |
| zakarum | Footwork | 8 | 100.0% | 100.0% | 75.0% |
| zebracorn | Counter | 12 | 100.0% | 100.0% | 50.0% |
| zephyr | Pressure | 10 | n/a | n/a | 100.0% |
| zepump | Paired | 6 | 100.0% | 100.0% | 83.3% |
| zippy | Pressure | 10 | n/a | n/a | 100.0% |
| zudi | Counter | 6 | n/a | n/a | 100.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs gluttony | 2 | 100.0% |
| aaron vs bidnehhh | 2 | 0.0% |
| aaron vs wyrmblvnt | 2 | 0.0% |
| aaron vs xav | 2 | 0.0% |
| accidentallyrich vs brainsprot | 2 | 0.0% |
| accidentallyrich vs sproto1011 | 2 | 100.0% |
| agentsproto vs alpha777 | 2 | 100.0% |
| agentsproto vs sproto3235 | 2 | 100.0% |
| aktree vs nick | 2 | 100.0% |
| aktree vs sproto215 | 2 | 100.0% |

