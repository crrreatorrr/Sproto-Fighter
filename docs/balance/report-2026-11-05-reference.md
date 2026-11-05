# Balance tournament

Source: `209f16eecfd0de1087a65234c9ef18826fa2e120`; simulation `af94139cc59e4dfd`; source SHA-256 `bb507d57a2f6c6d460f0258d7cb0c61070a50fd52a1252a3667758a79c5bb1fa`.

Seed 20261105; 254 fighters; 508 sampled pairs; 3600-frame cap; reference opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. The seed controls opponent sampling; the legacy CPU itself has no randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes are analysis groupings of existing roles, not normalized gameplay templates. Small-sample extremes are diagnostic, not confidence bounds.

The current CPU has no skill parameter. Requested levels were collapsed to a single legacy baseline; Normal/Hard balance claims cannot yet be made.

Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

## Legacy CPU

2032 bouts; raw draws 0.0% (0); unresolved 0.0% (0); timeouts 0. Mean 13.33 s; median 12.90 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 50.0% | 0.0% | 2.45 s |
| 2 | 50.0% | 50.0% | 0.0% | 2.45 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 352 | 50.0% | 50.0% | 0.0% |
| Zoning | 448 | 50.0% | 50.0% | 0.0% |
| Counter | 528 | 50.0% | 50.0% | 0.0% |
| Pressure | 2124 | 49.8% | 49.8% | 0.0% |
| Paired | 288 | 51.4% | 51.4% | 0.0% |
| Weapon | 92 | 50.0% | 50.0% | 0.0% |
| Brawler | 188 | 50.0% | 50.0% | 0.0% |
| Hover | 44 | 50.0% | 50.0% | 0.0% |

CPU win rate against the fixed reference bot: 99.6% measurement-resolved, 99.6% raw decided.

Damage: melee 1888696; projectile 612257; special 336; throw 374.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 20 | 50.0% | 50.0% | 0.0% |
| aaron | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| accidentallyrich | Counter | 12 | 50.0% | 50.0% | 0.0% |
| agentsproto | Brawler | 8 | 50.0% | 50.0% | 0.0% |
| aktree | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| aleksander | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| alpha777 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| anni | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| autistophrenicsprotagonist | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| azkarah | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| benjamin | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| berserk | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| bgbadger | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| bidnehhh | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| bigal | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| bigswole | Brawler | 16 | 50.0% | 50.0% | 0.0% |
| bimba | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| bitcoind1rk | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| blorfo | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| bobdobbs | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| brainsprot | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| bront | Brawler | 8 | 50.0% | 50.0% | 0.0% |
| bs9090eth | Zoning | 24 | 50.0% | 50.0% | 0.0% |
| buddhashadow | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| cam | Brawler | 16 | 50.0% | 50.0% | 0.0% |
| cantankerous | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| captain | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| captainhowdy | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| ceo | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| chaton | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| chonky | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| chrisfowler | Counter | 16 | 50.0% | 50.0% | 0.0% |
| ciphersproto | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| clobrwn | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| contresens | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| corn | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| crapto | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| crippledlover | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| croy | Counter | 12 | 50.0% | 50.0% | 0.0% |
| crumpleii | Brawler | 8 | 50.0% | 50.0% | 0.0% |
| cryptobartender | Zoning | 36 | 50.0% | 50.0% | 0.0% |
| cryptoboy | Counter | 12 | 50.0% | 50.0% | 0.0% |
| cryptomonger | Footwork | 20 | 50.0% | 50.0% | 0.0% |
| cryptorizzler | Counter | 28 | 50.0% | 50.0% | 0.0% |
| cryptoviking420 | Pressure | 28 | 50.0% | 50.0% | 0.0% |
| cyberviber | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| d86 | Zoning | 8 | 50.0% | 50.0% | 0.0% |
| danocrypto | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| davidcd | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| degenpress | Zoning | 24 | 50.0% | 50.0% | 0.0% |
| dollarbitcoin | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| drzmoody | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| dumpstar | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| duo | Paired | 16 | 50.0% | 50.0% | 0.0% |
| durlan | Footwork | 32 | 50.0% | 50.0% | 0.0% |
| emix | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| erik | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| familywagon | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| feistyboi | Counter | 12 | 50.0% | 50.0% | 0.0% |
| felixsprotoarc | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| fiatfudder | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| forchaneth | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| fplgremlin | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| freedfrida | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| frej | Counter | 8 | 50.0% | 50.0% | 0.0% |
| freshprince | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| ghostsprotocol | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| giavannykitchens | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| glow | Counter | 16 | 50.0% | 50.0% | 0.0% |
| gluttony | Zoning | 28 | 50.0% | 50.0% | 0.0% |
| godether | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| godmod3d | Paired | 20 | 50.0% | 50.0% | 0.0% |
| godsson | Counter | 24 | 50.0% | 50.0% | 0.0% |
| gpm | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| greatcharly | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| gryph | Paired | 12 | 50.0% | 50.0% | 0.0% |
| guest07 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| guest08 | Pressure | 24 | 41.7% | 41.7% | 0.0% |
| guest09 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| guest10 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| guest11 | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| guest12 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| guest13 | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| guest14 | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| hdizzy | Zoning | 20 | 50.0% | 50.0% | 0.0% |
| herbpowell | Counter | 20 | 50.0% | 50.0% | 0.0% |
| hermionemichelleamyrose | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| highsproto | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| homosproto | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| indiapolice | Counter | 20 | 50.0% | 50.0% | 0.0% |
| infinitysplitter | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| isaac | Footwork | 20 | 50.0% | 50.0% | 0.0% |
| jameskaminski | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| janitor | Brawler | 24 | 50.0% | 50.0% | 0.0% |
| jasper | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| jayquant | Counter | 16 | 50.0% | 50.0% | 0.0% |
| johnson | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| julian | Counter | 32 | 50.0% | 50.0% | 0.0% |
| kern | Counter | 24 | 50.0% | 50.0% | 0.0% |
| kerrieanne | Counter | 16 | 50.0% | 50.0% | 0.0% |
| laserbach | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| lestrange | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| leviosa | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| lifeisameme | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| lilgoldied | Counter | 12 | 50.0% | 50.0% | 0.0% |
| loadthebags | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| loqi | Counter | 12 | 50.0% | 50.0% | 0.0% |
| lowernipple | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| mandela | Pressure | 12 | 66.7% | 66.7% | 0.0% |
| marfrog | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| maxbiggums | Brawler | 16 | 50.0% | 50.0% | 0.0% |
| melo | Weapon | 16 | 50.0% | 50.0% | 0.0% |
| michael | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| micsash | Counter | 20 | 50.0% | 50.0% | 0.0% |
| mikemike | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| mildtacos | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| mlk | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| moonshiller | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| mox | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| mrgoldrobe | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| mrhorsemeat | Counter | 16 | 50.0% | 50.0% | 0.0% |
| nate | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| nick | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| nomis | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| nosmileclown | Paired | 12 | 50.0% | 50.0% | 0.0% |
| np | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| obamasega420 | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| olnoname | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| onememeaday | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| osho | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| otorps | Counter | 16 | 50.0% | 50.0% | 0.0% |
| pars | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| peterpan | Paired | 16 | 50.0% | 50.0% | 0.0% |
| pilgrim | Brawler | 8 | 50.0% | 50.0% | 0.0% |
| pinewaffle | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| pirate | Pressure | 8 | 25.0% | 25.0% | 0.0% |
| pongohpos10i | Zoning | 36 | 50.0% | 50.0% | 0.0% |
| potocaicai | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| pr0lificeth | Zoning | 20 | 50.0% | 50.0% | 0.0% |
| prim | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| rainman | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| razz | Counter | 12 | 50.0% | 50.0% | 0.0% |
| realityarchitect | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| rektina | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| renzo | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| reverend | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| rivet | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| rlarsson | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| rmacpdx | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| rune | Pressure | 12 | 66.7% | 66.7% | 0.0% |
| saburdo | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| samixsproto | Zoning | 20 | 50.0% | 50.0% | 0.0% |
| satoshi | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| seph0x | Counter | 16 | 50.0% | 50.0% | 0.0% |
| sidelinereferee | Zoning | 24 | 50.0% | 50.0% | 0.0% |
| sirbitcoin | Counter | 16 | 50.0% | 50.0% | 0.0% |
| sirdidit | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sisma | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| slabcorn | Brawler | 12 | 50.0% | 50.0% | 0.0% |
| slakesly | Counter | 16 | 50.0% | 50.0% | 0.0% |
| sober | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| solanadelray | Paired | 12 | 83.3% | 83.3% | 0.0% |
| sprog | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sproteth | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| sproto1011 | Weapon | 36 | 50.0% | 50.0% | 0.0% |
| sproto102 | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| sproto1093 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto1187 | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| sproto1335 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto1345 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sproto1414 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sproto1477 | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| sproto1499 | Paired | 16 | 50.0% | 50.0% | 0.0% |
| sproto1601 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto1625 | Paired | 12 | 50.0% | 50.0% | 0.0% |
| sproto1668 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto1815 | Weapon | 16 | 50.0% | 50.0% | 0.0% |
| sproto1870 | Hover | 16 | 50.0% | 50.0% | 0.0% |
| sproto2010 | Paired | 8 | 50.0% | 50.0% | 0.0% |
| sproto2075 | Paired | 12 | 50.0% | 50.0% | 0.0% |
| sproto2101 | Pressure | 28 | 50.0% | 50.0% | 0.0% |
| sproto215 | Pressure | 28 | 50.0% | 50.0% | 0.0% |
| sproto2177 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sproto2210 | Paired | 12 | 50.0% | 50.0% | 0.0% |
| sproto2322 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto2344 | Paired | 24 | 50.0% | 50.0% | 0.0% |
| sproto2381 | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| sproto2531 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sproto2569 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto2616 | Weapon | 12 | 50.0% | 50.0% | 0.0% |
| sproto2789 | Weapon | 12 | 50.0% | 50.0% | 0.0% |
| sproto282 | Paired | 20 | 50.0% | 50.0% | 0.0% |
| sproto2884 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto3106 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto313 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sproto3152 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto3181 | Paired | 24 | 50.0% | 50.0% | 0.0% |
| sproto3215 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto3224 | Paired | 8 | 50.0% | 50.0% | 0.0% |
| sproto3235 | Paired | 16 | 50.0% | 50.0% | 0.0% |
| sproto651 | Pressure | 20 | 40.0% | 40.0% | 0.0% |
| sproto704 | Paired | 8 | 50.0% | 50.0% | 0.0% |
| sproto763 | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| sproto818 | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| sproto831 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto832 | Paired | 12 | 50.0% | 50.0% | 0.0% |
| sproto834 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sproto837 | Pressure | 28 | 50.0% | 50.0% | 0.0% |
| sproto865 | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sproto943 | Pressure | 24 | 50.0% | 50.0% | 0.0% |
| sproto999 | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sprotocius | Counter | 12 | 50.0% | 50.0% | 0.0% |
| sprotolg | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| sprotomichaelsaylor | Zoning | 12 | 50.0% | 50.0% | 0.0% |
| sprotomidnightfx | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sprotopia | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| sprotopotamus | Pressure | 24 | 41.7% | 41.7% | 0.0% |
| sprotosales | Pressure | 28 | 50.0% | 50.0% | 0.0% |
| sprotosurvivor | Zoning | 16 | 50.0% | 50.0% | 0.0% |
| spruto | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| spunow | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| stonkyleg69 | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| stoto | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| sweatpantstrust | Counter | 20 | 50.0% | 50.0% | 0.0% |
| tdeth | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| teahupoo | Counter | 8 | 50.0% | 50.0% | 0.0% |
| theo | Zoning | 28 | 50.0% | 50.0% | 0.0% |
| thesprotowholivedeth | Zoning | 8 | 50.0% | 50.0% | 0.0% |
| thxobama | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| tingsmol | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| tradertimmy | Counter | 20 | 50.0% | 50.0% | 0.0% |
| twinnyneutron | Paired | 16 | 50.0% | 50.0% | 0.0% |
| uncmasterflex | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| urmometh | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| usedtowels | Counter | 12 | 50.0% | 50.0% | 0.0% |
| vamp | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| vaudream | Hover | 16 | 50.0% | 50.0% | 0.0% |
| vela | Hover | 12 | 50.0% | 50.0% | 0.0% |
| veryseriousinvestor | Footwork | 12 | 50.0% | 50.0% | 0.0% |
| vicoo | Counter | 16 | 50.0% | 50.0% | 0.0% |
| vitaliketh | Pressure | 12 | 50.0% | 50.0% | 0.0% |
| wifebeater | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| willuminati | Pressure | 32 | 50.0% | 50.0% | 0.0% |
| wireitwell | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| wyrmblvnt | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| xalt | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| xav | Pressure | 16 | 50.0% | 50.0% | 0.0% |
| yusuf | Pressure | 8 | 50.0% | 50.0% | 0.0% |
| zakarum | Footwork | 16 | 50.0% | 50.0% | 0.0% |
| zebracorn | Counter | 24 | 50.0% | 50.0% | 0.0% |
| zephyr | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| zepump | Paired | 12 | 50.0% | 50.0% | 0.0% |
| zippy | Pressure | 20 | 50.0% | 50.0% | 0.0% |
| zudi | Counter | 12 | 50.0% | 50.0% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| guest08 vs solanadelray | 4 | 0.0% |
| mandela vs sprotopotamus | 4 | 100.0% |
| pirate vs solanadelray | 4 | 0.0% |
| rune vs sproto651 | 4 | 100.0% |
| 86gwei vs gluttony | 4 | 50.0% |
| 86gwei vs julian | 4 | 50.0% |
| 86gwei vs mildtacos | 4 | 50.0% |
| 86gwei vs nomis | 4 | 50.0% |
| 86gwei vs sproto704 | 4 | 50.0% |
| aaron vs bidnehhh | 4 | 50.0% |
