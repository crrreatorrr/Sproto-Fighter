# Balance tournament

Source: `c5e2a7a53bbb8a4d4bb94246c3ff067445914859`; simulation `2855383f5d100ea4`; source SHA-256 `873d1a19e5d3c79d9b4fc521f53df0110b80379b58af9709dac62d8edfcc7c29`.

Seed 20261105; 254 fighters; 508 sampled pairs; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. The seed controls opponent sampling; the legacy CPU itself has no randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes are analysis groupings of existing roles, not normalized gameplay templates. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

## Skill 4

1016 bouts; raw draws 0.2% (2); unresolved 0.0% (0); timeouts 0. Mean 26.20 s; median 26.63 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 59.3% | 59.3% | 0.2% | 5.21 s |
| 2 | 40.7% | 40.7% | 0.2% | 4.89 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 176 | 61.9% | 62.1% | 1.1% |
| Zoning | 224 | 24.1% | 24.1% | 0.0% |
| Counter | 264 | 54.9% | 54.9% | 0.0% |
| Pressure | 1062 | 53.8% | 53.8% | 0.2% |
| Paired | 144 | 42.4% | 42.4% | 0.0% |
| Weapon | 46 | 30.4% | 30.4% | 0.0% |
| Brawler | 94 | 56.4% | 56.4% | 0.0% |
| Hover | 22 | 40.9% | 40.9% | 0.0% |

Damage: melee 489089; projectile 1276016; special 1032; throw 4807.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 10 | 80.0% | 80.0% | 0.0% |
| aaron | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| accidentallyrich | Counter | 6 | 33.3% | 33.3% | 0.0% |
| agentsproto | Brawler | 4 | 25.0% | 25.0% | 0.0% |
| aktree | Zoning | 6 | 33.3% | 33.3% | 0.0% |
| aleksander | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| alpha777 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| anni | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| autistophrenicsprotagonist | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| azkarah | Zoning | 8 | 0.0% | 0.0% | 0.0% |
| benjamin | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| berserk | Footwork | 6 | 50.0% | 50.0% | 0.0% |
| bgbadger | Zoning | 6 | 50.0% | 50.0% | 0.0% |
| bidnehhh | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| bigal | Brawler | 6 | 66.7% | 66.7% | 0.0% |
| bigswole | Brawler | 8 | 37.5% | 37.5% | 0.0% |
| bimba | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| bitcoind1rk | Pressure | 10 | 80.0% | 80.0% | 0.0% |
| blorfo | Pressure | 6 | 83.3% | 83.3% | 0.0% |
| bobdobbs | Footwork | 8 | 37.5% | 37.5% | 0.0% |
| brainsprot | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| bront | Brawler | 4 | 75.0% | 75.0% | 0.0% |
| bs9090eth | Zoning | 12 | 33.3% | 33.3% | 0.0% |
| buddhashadow | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| cam | Brawler | 8 | 75.0% | 75.0% | 0.0% |
| cantankerous | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| captain | Zoning | 6 | 16.7% | 16.7% | 0.0% |
| captainhowdy | Pressure | 12 | 41.7% | 41.7% | 0.0% |
| ceo | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| chaton | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| chonky | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| chrisfowler | Counter | 8 | 75.0% | 75.0% | 0.0% |
| ciphersproto | Pressure | 10 | 40.0% | 40.0% | 0.0% |
| clobrwn | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| contresens | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| corn | Pressure | 10 | 40.0% | 40.0% | 0.0% |
| crapto | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| crippledlover | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| croy | Counter | 6 | 50.0% | 50.0% | 0.0% |
| crumpleii | Brawler | 4 | 75.0% | 75.0% | 0.0% |
| cryptobartender | Zoning | 18 | 27.8% | 27.8% | 0.0% |
| cryptoboy | Counter | 6 | 50.0% | 50.0% | 0.0% |
| cryptomonger | Footwork | 10 | 50.0% | 55.6% | 10.0% |
| cryptorizzler | Counter | 14 | 50.0% | 50.0% | 0.0% |
| cryptoviking420 | Pressure | 14 | 71.4% | 71.4% | 0.0% |
| cyberviber | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| d86 | Zoning | 4 | 75.0% | 75.0% | 0.0% |
| danocrypto | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| davidcd | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| degenpress | Zoning | 12 | 16.7% | 16.7% | 0.0% |
| dollarbitcoin | Brawler | 6 | 66.7% | 66.7% | 0.0% |
| drzmoody | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| dumpstar | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| duo | Paired | 8 | 50.0% | 50.0% | 0.0% |
| durlan | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| emix | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| erik | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| familywagon | Brawler | 6 | 50.0% | 50.0% | 0.0% |
| feistyboi | Counter | 6 | 66.7% | 66.7% | 0.0% |
| felixsprotoarc | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| fiatfudder | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| forchaneth | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| fplgremlin | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| freedfrida | Footwork | 6 | 83.3% | 83.3% | 0.0% |
| frej | Counter | 4 | 75.0% | 75.0% | 0.0% |
| freshprince | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| ghostsprotocol | Zoning | 6 | 0.0% | 0.0% | 0.0% |
| giavannykitchens | Pressure | 10 | 30.0% | 30.0% | 0.0% |
| glow | Counter | 8 | 25.0% | 25.0% | 0.0% |
| gluttony | Zoning | 14 | 14.3% | 14.3% | 0.0% |
| godether | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| godmod3d | Paired | 10 | 60.0% | 60.0% | 0.0% |
| godsson | Counter | 12 | 58.3% | 58.3% | 0.0% |
| gpm | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| greatcharly | Pressure | 12 | 41.7% | 41.7% | 0.0% |
| gryph | Paired | 6 | 16.7% | 16.7% | 0.0% |
| guest07 | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| guest08 | Pressure | 12 | 41.7% | 41.7% | 0.0% |
| guest09 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| guest10 | Pressure | 8 | 25.0% | 25.0% | 0.0% |
| guest11 | Pressure | 12 | 25.0% | 25.0% | 0.0% |
| guest12 | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| guest13 | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| guest14 | Pressure | 12 | 66.7% | 66.7% | 0.0% |
| hdizzy | Zoning | 10 | 40.0% | 40.0% | 0.0% |
| herbpowell | Counter | 10 | 50.0% | 50.0% | 0.0% |
| hermionemichelleamyrose | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| highsproto | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| homosproto | Footwork | 6 | 83.3% | 83.3% | 0.0% |
| indiapolice | Counter | 10 | 40.0% | 40.0% | 0.0% |
| infinitysplitter | Pressure | 10 | 80.0% | 80.0% | 0.0% |
| isaac | Footwork | 10 | 80.0% | 77.8% | 10.0% |
| jameskaminski | Pressure | 12 | 41.7% | 41.7% | 0.0% |
| janitor | Brawler | 12 | 58.3% | 58.3% | 0.0% |
| jasper | Pressure | 6 | 33.3% | 33.3% | 0.0% |
| jayquant | Counter | 8 | 75.0% | 75.0% | 0.0% |
| johnson | Brawler | 6 | 50.0% | 50.0% | 0.0% |
| julian | Counter | 16 | 56.3% | 56.3% | 0.0% |
| kern | Counter | 12 | 58.3% | 58.3% | 0.0% |
| kerrieanne | Counter | 8 | 50.0% | 50.0% | 0.0% |
| laserbach | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| lestrange | Footwork | 6 | 66.7% | 66.7% | 0.0% |
| leviosa | Pressure | 12 | 58.3% | 58.3% | 0.0% |
| lifeisameme | Pressure | 8 | 12.5% | 12.5% | 0.0% |
| lilgoldied | Counter | 6 | 83.3% | 83.3% | 0.0% |
| loadthebags | Pressure | 12 | 33.3% | 33.3% | 0.0% |
| loqi | Counter | 6 | 33.3% | 33.3% | 0.0% |
| lowernipple | Pressure | 6 | 0.0% | 0.0% | 0.0% |
| mandela | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| marfrog | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| maxbiggums | Brawler | 8 | 62.5% | 62.5% | 0.0% |
| melo | Weapon | 8 | 12.5% | 12.5% | 0.0% |
| michael | Pressure | 12 | 75.0% | 75.0% | 0.0% |
| micsash | Counter | 10 | 90.0% | 90.0% | 0.0% |
| mikemike | Brawler | 6 | 16.7% | 16.7% | 0.0% |
| mildtacos | Footwork | 6 | 66.7% | 66.7% | 0.0% |
| mlk | Pressure | 4 | 25.0% | 25.0% | 0.0% |
| moonshiller | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| mox | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| mrgoldrobe | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| mrhorsemeat | Counter | 8 | 75.0% | 75.0% | 0.0% |
| nate | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| nick | Pressure | 6 | 33.3% | 40.0% | 16.7% |
| nomis | Pressure | 6 | 16.7% | 16.7% | 0.0% |
| nosmileclown | Paired | 6 | 66.7% | 66.7% | 0.0% |
| np | Footwork | 6 | 50.0% | 50.0% | 0.0% |
| obamasega420 | Footwork | 8 | 37.5% | 37.5% | 0.0% |
| olnoname | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| onememeaday | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| osho | Pressure | 4 | 0.0% | 0.0% | 0.0% |
| otorps | Counter | 8 | 75.0% | 75.0% | 0.0% |
| pars | Brawler | 6 | 66.7% | 66.7% | 0.0% |
| peterpan | Paired | 8 | 12.5% | 12.5% | 0.0% |
| pilgrim | Brawler | 4 | 50.0% | 50.0% | 0.0% |
| pinewaffle | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| pirate | Pressure | 4 | 100.0% | 100.0% | 0.0% |
| pongohpos10i | Zoning | 18 | 16.7% | 16.7% | 0.0% |
| potocaicai | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| pr0lificeth | Zoning | 10 | 40.0% | 40.0% | 0.0% |
| prim | Pressure | 4 | 25.0% | 25.0% | 0.0% |
| rainman | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| razz | Counter | 6 | 50.0% | 50.0% | 0.0% |
| realityarchitect | Pressure | 12 | 66.7% | 66.7% | 0.0% |
| rektina | Pressure | 6 | 83.3% | 83.3% | 0.0% |
| renzo | Pressure | 6 | 83.3% | 83.3% | 0.0% |
| reverend | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| rivet | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| rlarsson | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| rmacpdx | Pressure | 8 | 25.0% | 25.0% | 0.0% |
| rune | Pressure | 6 | 0.0% | 0.0% | 0.0% |
| saburdo | Pressure | 10 | 30.0% | 30.0% | 0.0% |
| samixsproto | Zoning | 10 | 10.0% | 10.0% | 0.0% |
| satoshi | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| seph0x | Counter | 8 | 25.0% | 25.0% | 0.0% |
| sidelinereferee | Zoning | 12 | 25.0% | 25.0% | 0.0% |
| sirbitcoin | Counter | 8 | 37.5% | 37.5% | 0.0% |
| sirdidit | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sisma | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| slabcorn | Brawler | 6 | 66.7% | 66.7% | 0.0% |
| slakesly | Counter | 8 | 50.0% | 50.0% | 0.0% |
| sober | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| solanadelray | Paired | 6 | 16.7% | 16.7% | 0.0% |
| sprog | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| sproteth | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| sproto1011 | Weapon | 18 | 27.8% | 27.8% | 0.0% |
| sproto102 | Pressure | 10 | 90.0% | 90.0% | 0.0% |
| sproto1093 | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| sproto1187 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto1335 | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| sproto1345 | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| sproto1414 | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| sproto1477 | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| sproto1499 | Paired | 8 | 25.0% | 25.0% | 0.0% |
| sproto1601 | Pressure | 6 | 33.3% | 33.3% | 0.0% |
| sproto1625 | Paired | 6 | 50.0% | 50.0% | 0.0% |
| sproto1668 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| sproto1815 | Weapon | 8 | 50.0% | 50.0% | 0.0% |
| sproto1870 | Hover | 8 | 37.5% | 37.5% | 0.0% |
| sproto2010 | Paired | 4 | 50.0% | 50.0% | 0.0% |
| sproto2075 | Paired | 6 | 50.0% | 50.0% | 0.0% |
| sproto2101 | Pressure | 14 | 35.7% | 35.7% | 0.0% |
| sproto215 | Pressure | 14 | 64.3% | 64.3% | 0.0% |
| sproto2177 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto2210 | Paired | 6 | 50.0% | 50.0% | 0.0% |
| sproto2322 | Pressure | 4 | 100.0% | 100.0% | 25.0% |
| sproto2344 | Paired | 12 | 58.3% | 58.3% | 0.0% |
| sproto2381 | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| sproto2531 | Pressure | 8 | 0.0% | 0.0% | 0.0% |
| sproto2569 | Pressure | 4 | 25.0% | 25.0% | 0.0% |
| sproto2616 | Weapon | 6 | 50.0% | 50.0% | 0.0% |
| sproto2789 | Weapon | 6 | 16.7% | 16.7% | 0.0% |
| sproto282 | Paired | 10 | 30.0% | 30.0% | 0.0% |
| sproto2884 | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| sproto3106 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| sproto313 | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| sproto3152 | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| sproto3181 | Paired | 12 | 25.0% | 25.0% | 0.0% |
| sproto3215 | Pressure | 6 | 16.7% | 16.7% | 0.0% |
| sproto3224 | Paired | 4 | 50.0% | 50.0% | 0.0% |
| sproto3235 | Paired | 8 | 62.5% | 62.5% | 0.0% |
| sproto651 | Pressure | 10 | 40.0% | 40.0% | 0.0% |
| sproto704 | Paired | 4 | 25.0% | 25.0% | 0.0% |
| sproto763 | Pressure | 10 | 80.0% | 80.0% | 0.0% |
| sproto818 | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| sproto831 | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| sproto832 | Paired | 6 | 50.0% | 50.0% | 0.0% |
| sproto834 | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| sproto837 | Pressure | 14 | 42.9% | 42.9% | 0.0% |
| sproto865 | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| sproto943 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto999 | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| sprotocius | Counter | 6 | 50.0% | 50.0% | 0.0% |
| sprotolg | Zoning | 8 | 50.0% | 50.0% | 0.0% |
| sprotomichaelsaylor | Zoning | 6 | 0.0% | 0.0% | 0.0% |
| sprotomidnightfx | Pressure | 6 | 16.7% | 16.7% | 0.0% |
| sprotopia | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| sprotopotamus | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sprotosales | Pressure | 14 | 64.3% | 64.3% | 0.0% |
| sprotosurvivor | Zoning | 8 | 37.5% | 37.5% | 0.0% |
| spruto | Pressure | 6 | 83.3% | 83.3% | 0.0% |
| spunow | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| stonkyleg69 | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| stoto | Pressure | 6 | 33.3% | 33.3% | 0.0% |
| sweatpantstrust | Counter | 10 | 50.0% | 50.0% | 0.0% |
| tdeth | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| teahupoo | Counter | 4 | 75.0% | 75.0% | 0.0% |
| theo | Zoning | 14 | 7.1% | 7.1% | 0.0% |
| thesprotowholivedeth | Zoning | 4 | 25.0% | 25.0% | 0.0% |
| thxobama | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| tingsmol | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| tradertimmy | Counter | 10 | 60.0% | 60.0% | 0.0% |
| twinnyneutron | Paired | 8 | 62.5% | 62.5% | 0.0% |
| uncmasterflex | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| urmometh | Pressure | 10 | 80.0% | 80.0% | 0.0% |
| usedtowels | Counter | 6 | 33.3% | 33.3% | 0.0% |
| vamp | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| vaudream | Hover | 8 | 62.5% | 62.5% | 0.0% |
| vela | Hover | 6 | 16.7% | 16.7% | 0.0% |
| veryseriousinvestor | Footwork | 6 | 50.0% | 50.0% | 0.0% |
| vicoo | Counter | 8 | 50.0% | 50.0% | 0.0% |
| vitaliketh | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| wifebeater | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| willuminati | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| wireitwell | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| wyrmblvnt | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| xalt | Pressure | 4 | 0.0% | 0.0% | 0.0% |
| xav | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| yusuf | Pressure | 4 | 25.0% | 25.0% | 0.0% |
| zakarum | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| zebracorn | Counter | 12 | 50.0% | 50.0% | 0.0% |
| zephyr | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| zepump | Paired | 6 | 33.3% | 33.3% | 0.0% |
| zippy | Pressure | 10 | 40.0% | 40.0% | 0.0% |
| zudi | Counter | 6 | 66.7% | 66.7% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs gluttony | 2 | 100.0% |
| 86gwei vs nomis | 2 | 100.0% |
| 86gwei vs sproto704 | 2 | 100.0% |
| accidentallyrich vs mrhorsemeat | 2 | 0.0% |
| agentsproto vs sproto3235 | 2 | 0.0% |
| aktree vs sproto215 | 2 | 0.0% |
| aleksander vs yusuf | 2 | 100.0% |
| anni vs captain | 2 | 100.0% |
| anni vs hermionemichelleamyrose | 2 | 0.0% |
| autistophrenicsprotagonist vs sproto2569 | 2 | 100.0% |

## Skill 7

1016 bouts; raw draws 0.0% (0); unresolved 0.0% (0); timeouts 0. Mean 26.76 s; median 27.57 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 51.6% | 51.6% | 0.0% | 5.11 s |
| 2 | 48.4% | 48.4% | 0.0% | 5.13 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 176 | 68.2% | 68.2% | 0.0% |
| Zoning | 224 | 23.7% | 23.7% | 0.0% |
| Counter | 264 | 49.6% | 49.6% | 0.0% |
| Pressure | 1062 | 54.2% | 54.2% | 0.0% |
| Paired | 144 | 38.2% | 38.2% | 0.0% |
| Weapon | 46 | 43.5% | 43.5% | 0.0% |
| Brawler | 94 | 51.1% | 51.1% | 0.0% |
| Hover | 22 | 59.1% | 59.1% | 0.0% |

Damage: melee 570788; projectile 1150147; special 7491; throw 9722.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 10 | 90.0% | 90.0% | 0.0% |
| aaron | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| accidentallyrich | Counter | 6 | 66.7% | 66.7% | 0.0% |
| agentsproto | Brawler | 4 | 50.0% | 50.0% | 0.0% |
| aktree | Zoning | 6 | 33.3% | 33.3% | 0.0% |
| aleksander | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| alpha777 | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| anni | Pressure | 6 | 16.7% | 16.7% | 0.0% |
| autistophrenicsprotagonist | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| azkarah | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| benjamin | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| berserk | Footwork | 6 | 66.7% | 66.7% | 0.0% |
| bgbadger | Zoning | 6 | 66.7% | 66.7% | 0.0% |
| bidnehhh | Pressure | 10 | 10.0% | 10.0% | 0.0% |
| bigal | Brawler | 6 | 16.7% | 16.7% | 0.0% |
| bigswole | Brawler | 8 | 25.0% | 25.0% | 0.0% |
| bimba | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| bitcoind1rk | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| blorfo | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| bobdobbs | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| brainsprot | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| bront | Brawler | 4 | 50.0% | 50.0% | 0.0% |
| bs9090eth | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| buddhashadow | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| cam | Brawler | 8 | 50.0% | 50.0% | 0.0% |
| cantankerous | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| captain | Zoning | 6 | 33.3% | 33.3% | 0.0% |
| captainhowdy | Pressure | 12 | 41.7% | 41.7% | 0.0% |
| ceo | Zoning | 8 | 25.0% | 25.0% | 0.0% |
| chaton | Pressure | 10 | 80.0% | 80.0% | 0.0% |
| chonky | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| chrisfowler | Counter | 8 | 50.0% | 50.0% | 0.0% |
| ciphersproto | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| clobrwn | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| contresens | Zoning | 8 | 0.0% | 0.0% | 0.0% |
| corn | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| crapto | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| crippledlover | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| croy | Counter | 6 | 33.3% | 33.3% | 0.0% |
| crumpleii | Brawler | 4 | 50.0% | 50.0% | 0.0% |
| cryptobartender | Zoning | 18 | 22.2% | 22.2% | 0.0% |
| cryptoboy | Counter | 6 | 66.7% | 66.7% | 0.0% |
| cryptomonger | Footwork | 10 | 50.0% | 50.0% | 0.0% |
| cryptorizzler | Counter | 14 | 57.1% | 57.1% | 0.0% |
| cryptoviking420 | Pressure | 14 | 57.1% | 57.1% | 0.0% |
| cyberviber | Pressure | 6 | 33.3% | 33.3% | 0.0% |
| d86 | Zoning | 4 | 25.0% | 25.0% | 0.0% |
| danocrypto | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| davidcd | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| degenpress | Zoning | 12 | 16.7% | 16.7% | 0.0% |
| dollarbitcoin | Brawler | 6 | 16.7% | 16.7% | 0.0% |
| drzmoody | Footwork | 8 | 75.0% | 75.0% | 0.0% |
| dumpstar | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| duo | Paired | 8 | 25.0% | 25.0% | 0.0% |
| durlan | Footwork | 16 | 68.8% | 68.8% | 0.0% |
| emix | Pressure | 10 | 40.0% | 40.0% | 0.0% |
| erik | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| familywagon | Brawler | 6 | 50.0% | 50.0% | 0.0% |
| feistyboi | Counter | 6 | 66.7% | 66.7% | 0.0% |
| felixsprotoarc | Zoning | 8 | 0.0% | 0.0% | 0.0% |
| fiatfudder | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| forchaneth | Pressure | 4 | 0.0% | 0.0% | 0.0% |
| fplgremlin | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| freedfrida | Footwork | 6 | 83.3% | 83.3% | 0.0% |
| frej | Counter | 4 | 75.0% | 75.0% | 0.0% |
| freshprince | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| ghostsprotocol | Zoning | 6 | 16.7% | 16.7% | 0.0% |
| giavannykitchens | Pressure | 10 | 10.0% | 10.0% | 0.0% |
| glow | Counter | 8 | 62.5% | 62.5% | 0.0% |
| gluttony | Zoning | 14 | 7.1% | 7.1% | 0.0% |
| godether | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| godmod3d | Paired | 10 | 60.0% | 60.0% | 0.0% |
| godsson | Counter | 12 | 33.3% | 33.3% | 0.0% |
| gpm | Pressure | 6 | 83.3% | 83.3% | 0.0% |
| greatcharly | Pressure | 12 | 83.3% | 83.3% | 0.0% |
| gryph | Paired | 6 | 33.3% | 33.3% | 0.0% |
| guest07 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| guest08 | Pressure | 12 | 41.7% | 41.7% | 0.0% |
| guest09 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| guest10 | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| guest11 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| guest12 | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| guest13 | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| guest14 | Pressure | 12 | 91.7% | 91.7% | 0.0% |
| hdizzy | Zoning | 10 | 10.0% | 10.0% | 0.0% |
| herbpowell | Counter | 10 | 50.0% | 50.0% | 0.0% |
| hermionemichelleamyrose | Footwork | 8 | 50.0% | 50.0% | 0.0% |
| highsproto | Zoning | 8 | 12.5% | 12.5% | 0.0% |
| homosproto | Footwork | 6 | 66.7% | 66.7% | 0.0% |
| indiapolice | Counter | 10 | 20.0% | 20.0% | 0.0% |
| infinitysplitter | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| isaac | Footwork | 10 | 70.0% | 70.0% | 0.0% |
| jameskaminski | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| janitor | Brawler | 12 | 66.7% | 66.7% | 0.0% |
| jasper | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| jayquant | Counter | 8 | 50.0% | 50.0% | 0.0% |
| johnson | Brawler | 6 | 100.0% | 100.0% | 0.0% |
| julian | Counter | 16 | 43.8% | 43.8% | 0.0% |
| kern | Counter | 12 | 58.3% | 58.3% | 0.0% |
| kerrieanne | Counter | 8 | 50.0% | 50.0% | 0.0% |
| laserbach | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| lestrange | Footwork | 6 | 100.0% | 100.0% | 0.0% |
| leviosa | Pressure | 12 | 58.3% | 58.3% | 0.0% |
| lifeisameme | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| lilgoldied | Counter | 6 | 66.7% | 66.7% | 0.0% |
| loadthebags | Pressure | 12 | 58.3% | 58.3% | 0.0% |
| loqi | Counter | 6 | 66.7% | 66.7% | 0.0% |
| lowernipple | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| mandela | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| marfrog | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| maxbiggums | Brawler | 8 | 75.0% | 75.0% | 0.0% |
| melo | Weapon | 8 | 50.0% | 50.0% | 0.0% |
| michael | Pressure | 12 | 58.3% | 58.3% | 0.0% |
| micsash | Counter | 10 | 60.0% | 60.0% | 0.0% |
| mikemike | Brawler | 6 | 16.7% | 16.7% | 0.0% |
| mildtacos | Footwork | 6 | 50.0% | 50.0% | 0.0% |
| mlk | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| moonshiller | Pressure | 8 | 87.5% | 87.5% | 0.0% |
| mox | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| mrgoldrobe | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| mrhorsemeat | Counter | 8 | 25.0% | 25.0% | 0.0% |
| nate | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| nick | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| nomis | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| nosmileclown | Paired | 6 | 83.3% | 83.3% | 0.0% |
| np | Footwork | 6 | 50.0% | 50.0% | 0.0% |
| obamasega420 | Footwork | 8 | 87.5% | 87.5% | 0.0% |
| olnoname | Pressure | 4 | 25.0% | 25.0% | 0.0% |
| onememeaday | Pressure | 10 | 30.0% | 30.0% | 0.0% |
| osho | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| otorps | Counter | 8 | 87.5% | 87.5% | 0.0% |
| pars | Brawler | 6 | 66.7% | 66.7% | 0.0% |
| peterpan | Paired | 8 | 37.5% | 37.5% | 0.0% |
| pilgrim | Brawler | 4 | 75.0% | 75.0% | 0.0% |
| pinewaffle | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| pirate | Pressure | 4 | 100.0% | 100.0% | 0.0% |
| pongohpos10i | Zoning | 18 | 50.0% | 50.0% | 0.0% |
| potocaicai | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| pr0lificeth | Zoning | 10 | 40.0% | 40.0% | 0.0% |
| prim | Pressure | 4 | 0.0% | 0.0% | 0.0% |
| rainman | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| razz | Counter | 6 | 33.3% | 33.3% | 0.0% |
| realityarchitect | Pressure | 12 | 58.3% | 58.3% | 0.0% |
| rektina | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| renzo | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| reverend | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| rivet | Pressure | 4 | 100.0% | 100.0% | 0.0% |
| rlarsson | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| rmacpdx | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| rune | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| saburdo | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| samixsproto | Zoning | 10 | 20.0% | 20.0% | 0.0% |
| satoshi | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| seph0x | Counter | 8 | 0.0% | 0.0% | 0.0% |
| sidelinereferee | Zoning | 12 | 41.7% | 41.7% | 0.0% |
| sirbitcoin | Counter | 8 | 25.0% | 25.0% | 0.0% |
| sirdidit | Pressure | 8 | 12.5% | 12.5% | 0.0% |
| sisma | Pressure | 4 | 25.0% | 25.0% | 0.0% |
| slabcorn | Brawler | 6 | 50.0% | 50.0% | 0.0% |
| slakesly | Counter | 8 | 62.5% | 62.5% | 0.0% |
| sober | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| solanadelray | Paired | 6 | 33.3% | 33.3% | 0.0% |
| sprog | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| sproteth | Pressure | 10 | 80.0% | 80.0% | 0.0% |
| sproto1011 | Weapon | 18 | 61.1% | 61.1% | 0.0% |
| sproto102 | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| sproto1093 | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| sproto1187 | Pressure | 12 | 41.7% | 41.7% | 0.0% |
| sproto1335 | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| sproto1345 | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| sproto1414 | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| sproto1477 | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| sproto1499 | Paired | 8 | 12.5% | 12.5% | 0.0% |
| sproto1601 | Pressure | 6 | 0.0% | 0.0% | 0.0% |
| sproto1625 | Paired | 6 | 0.0% | 0.0% | 0.0% |
| sproto1668 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| sproto1815 | Weapon | 8 | 37.5% | 37.5% | 0.0% |
| sproto1870 | Hover | 8 | 50.0% | 50.0% | 0.0% |
| sproto2010 | Paired | 4 | 50.0% | 50.0% | 0.0% |
| sproto2075 | Paired | 6 | 16.7% | 16.7% | 0.0% |
| sproto2101 | Pressure | 14 | 71.4% | 71.4% | 0.0% |
| sproto215 | Pressure | 14 | 71.4% | 71.4% | 0.0% |
| sproto2177 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto2210 | Paired | 6 | 33.3% | 33.3% | 0.0% |
| sproto2322 | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| sproto2344 | Paired | 12 | 58.3% | 58.3% | 0.0% |
| sproto2381 | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| sproto2531 | Pressure | 8 | 25.0% | 25.0% | 0.0% |
| sproto2569 | Pressure | 4 | 75.0% | 75.0% | 0.0% |
| sproto2616 | Weapon | 6 | 16.7% | 16.7% | 0.0% |
| sproto2789 | Weapon | 6 | 16.7% | 16.7% | 0.0% |
| sproto282 | Paired | 10 | 10.0% | 10.0% | 0.0% |
| sproto2884 | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| sproto3106 | Pressure | 6 | 83.3% | 83.3% | 0.0% |
| sproto313 | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| sproto3152 | Pressure | 6 | 0.0% | 0.0% | 0.0% |
| sproto3181 | Paired | 12 | 66.7% | 66.7% | 0.0% |
| sproto3215 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| sproto3224 | Paired | 4 | 50.0% | 50.0% | 0.0% |
| sproto3235 | Paired | 8 | 12.5% | 12.5% | 0.0% |
| sproto651 | Pressure | 10 | 60.0% | 60.0% | 0.0% |
| sproto704 | Paired | 4 | 0.0% | 0.0% | 0.0% |
| sproto763 | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| sproto818 | Pressure | 8 | 62.5% | 62.5% | 0.0% |
| sproto831 | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| sproto832 | Paired | 6 | 50.0% | 50.0% | 0.0% |
| sproto834 | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| sproto837 | Pressure | 14 | 57.1% | 57.1% | 0.0% |
| sproto865 | Pressure | 4 | 100.0% | 100.0% | 0.0% |
| sproto943 | Pressure | 12 | 58.3% | 58.3% | 0.0% |
| sproto999 | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| sprotocius | Counter | 6 | 50.0% | 50.0% | 0.0% |
| sprotolg | Zoning | 8 | 12.5% | 12.5% | 0.0% |
| sprotomichaelsaylor | Zoning | 6 | 0.0% | 0.0% | 0.0% |
| sprotomidnightfx | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| sprotopia | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| sprotopotamus | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sprotosales | Pressure | 14 | 57.1% | 57.1% | 0.0% |
| sprotosurvivor | Zoning | 8 | 12.5% | 12.5% | 0.0% |
| spruto | Pressure | 6 | 50.0% | 50.0% | 0.0% |
| spunow | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| stonkyleg69 | Footwork | 8 | 87.5% | 87.5% | 0.0% |
| stoto | Pressure | 6 | 66.7% | 66.7% | 0.0% |
| sweatpantstrust | Counter | 10 | 40.0% | 40.0% | 0.0% |
| tdeth | Pressure | 10 | 10.0% | 10.0% | 0.0% |
| teahupoo | Counter | 4 | 75.0% | 75.0% | 0.0% |
| theo | Zoning | 14 | 14.3% | 14.3% | 0.0% |
| thesprotowholivedeth | Zoning | 4 | 0.0% | 0.0% | 0.0% |
| thxobama | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| tingsmol | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| tradertimmy | Counter | 10 | 40.0% | 40.0% | 0.0% |
| twinnyneutron | Paired | 8 | 50.0% | 50.0% | 0.0% |
| uncmasterflex | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| urmometh | Pressure | 10 | 50.0% | 50.0% | 0.0% |
| usedtowels | Counter | 6 | 50.0% | 50.0% | 0.0% |
| vamp | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| vaudream | Hover | 8 | 62.5% | 62.5% | 0.0% |
| vela | Hover | 6 | 66.7% | 66.7% | 0.0% |
| veryseriousinvestor | Footwork | 6 | 50.0% | 50.0% | 0.0% |
| vicoo | Counter | 8 | 62.5% | 62.5% | 0.0% |
| vitaliketh | Pressure | 6 | 83.3% | 83.3% | 0.0% |
| wifebeater | Pressure | 8 | 75.0% | 75.0% | 0.0% |
| willuminati | Pressure | 16 | 18.8% | 18.8% | 0.0% |
| wireitwell | Pressure | 10 | 70.0% | 70.0% | 0.0% |
| wyrmblvnt | Pressure | 8 | 37.5% | 37.5% | 0.0% |
| xalt | Pressure | 4 | 25.0% | 25.0% | 0.0% |
| xav | Pressure | 8 | 25.0% | 25.0% | 0.0% |
| yusuf | Pressure | 4 | 50.0% | 50.0% | 0.0% |
| zakarum | Footwork | 8 | 62.5% | 62.5% | 0.0% |
| zebracorn | Counter | 12 | 50.0% | 50.0% | 0.0% |
| zephyr | Pressure | 10 | 30.0% | 30.0% | 0.0% |
| zepump | Paired | 6 | 50.0% | 50.0% | 0.0% |
| zippy | Pressure | 10 | 40.0% | 40.0% | 0.0% |
| zudi | Counter | 6 | 66.7% | 66.7% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs gluttony | 2 | 100.0% |
| 86gwei vs julian | 2 | 100.0% |
| 86gwei vs nomis | 2 | 100.0% |
| 86gwei vs sproto704 | 2 | 100.0% |
| aaron vs bidnehhh | 2 | 100.0% |
| aaron vs sproto3235 | 2 | 100.0% |
| aaron vs xav | 2 | 100.0% |
| accidentallyrich vs mrhorsemeat | 2 | 100.0% |
| agentsproto vs alpha777 | 2 | 0.0% |
| agentsproto vs sproto3235 | 2 | 100.0% |
