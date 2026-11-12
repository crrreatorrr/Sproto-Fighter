# Balance tournament

Source: `4e80e9364ed116ae30025cc3ec02ce54576cb2aa`; simulation `84f964848ca02602`; source SHA-256 `38ae377905409b90b4d957b3b384aa8e75408bba6976890eede23d639aa838a5`.

Seed 20261105; 254 fighters; 9347 sampled pairs; 1 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes use canonical BALANCE_KITS assignments when available; legacy cores use analysis groupings of existing roles. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 4

18694 bouts; raw draws 0.1% (22); unresolved 0.1% (18); timeouts 0. Mean 26.48 s; median 26.63 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 50.0% | 0.1% | 4.86 s |
| 2 | 50.0% | 50.0% | 0.1% | 4.86 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 12422 | 48.8% | 48.8% | 0.1% |
| Counter | 7260 | 50.6% | 50.6% | 0.1% |
| Pressure | 4572 | 48.5% | 48.5% | 0.3% |
| Brawler | 3120 | 48.0% | 48.0% | 0.1% |
| Paired | 2924 | 48.3% | 48.3% | 0.1% |
| Zoning | 5578 | 55.3% | 55.3% | 0.1% |
| Weapon | 1226 | 49.8% | 49.8% | 0.2% |
| Hover | 286 | 47.6% | 47.6% | 0.0% |

Damage: melee 22977436; projectile 2997508; special 1398149; throw 2618765.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 60.4% | 60.4% | 0.0% |
| aaron | Footwork | 158 | 46.2% | 46.2% | 0.0% |
| accidentallyrich | Counter | 136 | 48.5% | 48.5% | 1.5% |
| agentsproto | Brawler | 154 | 49.4% | 49.4% | 0.0% |
| aktree | Zoning | 144 | 52.8% | 52.8% | 0.0% |
| aleksander | Counter | 150 | 51.3% | 51.3% | 0.0% |
| alpha777 | Pressure | 150 | 47.3% | 47.3% | 0.0% |
| anni | Pressure | 136 | 62.5% | 62.5% | 0.0% |
| autistophrenicsprotagonist | Footwork | 134 | 49.3% | 49.3% | 0.0% |
| azkarah | Zoning | 132 | 62.1% | 62.1% | 0.0% |
| benjamin | Footwork | 152 | 62.5% | 62.5% | 0.0% |
| berserk | Footwork | 138 | 49.3% | 49.3% | 0.0% |
| bgbadger | Zoning | 144 | 57.6% | 57.6% | 0.0% |
| bidnehhh | Pressure | 140 | 52.1% | 52.1% | 0.0% |
| bigal | Brawler | 128 | 57.0% | 57.0% | 0.0% |
| bigswole | Brawler | 142 | 38.0% | 38.0% | 0.0% |
| bimba | Footwork | 142 | 52.1% | 52.1% | 0.0% |
| bitcoind1rk | Footwork | 168 | 45.2% | 45.2% | 0.0% |
| blorfo | Weapon | 156 | 48.7% | 48.7% | 0.0% |
| bobdobbs | Footwork | 154 | 53.9% | 53.9% | 0.0% |
| brainsprot | Footwork | 146 | 47.3% | 47.3% | 0.0% |
| bront | Brawler | 138 | 54.3% | 54.3% | 0.0% |
| bs9090eth | Zoning | 148 | 41.9% | 41.9% | 0.0% |
| buddhashadow | Footwork | 162 | 43.2% | 43.2% | 0.0% |
| cam | Brawler | 148 | 54.1% | 54.1% | 0.0% |
| cantankerous | Pressure | 124 | 48.4% | 48.4% | 0.0% |
| captain | Zoning | 142 | 43.7% | 43.7% | 0.0% |
| captainhowdy | Footwork | 144 | 41.0% | 41.0% | 0.0% |
| ceo | Zoning | 148 | 55.4% | 55.4% | 0.0% |
| chaton | Footwork | 146 | 47.3% | 47.3% | 0.0% |
| chonky | Footwork | 156 | 52.6% | 52.6% | 1.3% |
| chrisfowler | Counter | 126 | 57.9% | 57.9% | 0.0% |
| ciphersproto | Pressure | 154 | 48.1% | 48.1% | 0.0% |
| clobrwn | Footwork | 144 | 46.5% | 46.5% | 0.0% |
| contresens | Zoning | 148 | 50.7% | 50.7% | 0.0% |
| corn | Pressure | 148 | 53.4% | 53.4% | 1.4% |
| crapto | Zoning | 134 | 53.7% | 53.7% | 0.0% |
| crippledlover | Footwork | 146 | 50.7% | 50.7% | 0.0% |
| croy | Counter | 152 | 57.9% | 57.9% | 0.0% |
| crumpleii | Brawler | 158 | 41.8% | 41.8% | 0.0% |
| cryptobartender | Zoning | 148 | 52.7% | 52.7% | 0.0% |
| cryptoboy | Counter | 146 | 52.1% | 51.7% | 0.7% |
| cryptomonger | Footwork | 132 | 47.0% | 47.0% | 0.0% |
| cryptorizzler | Counter | 168 | 44.6% | 44.6% | 1.2% |
| cryptoviking420 | Pressure | 162 | 52.5% | 52.5% | 0.0% |
| cyberviber | Counter | 170 | 51.2% | 51.2% | 0.0% |
| d86 | Zoning | 168 | 58.3% | 58.3% | 0.0% |
| danocrypto | Counter | 140 | 51.4% | 51.4% | 0.0% |
| davidcd | Footwork | 146 | 53.4% | 53.4% | 0.0% |
| degenpress | Zoning | 148 | 41.9% | 41.9% | 0.0% |
| dollarbitcoin | Brawler | 136 | 41.9% | 41.9% | 0.0% |
| drzmoody | Footwork | 154 | 50.0% | 50.0% | 0.0% |
| dumpstar | Brawler | 144 | 42.3% | 42.3% | 1.4% |
| duo | Paired | 164 | 43.9% | 43.9% | 0.0% |
| durlan | Footwork | 158 | 57.0% | 57.0% | 0.0% |
| emix | Footwork | 140 | 37.1% | 37.1% | 0.0% |
| erik | Footwork | 130 | 42.3% | 42.3% | 0.0% |
| familywagon | Brawler | 150 | 47.3% | 47.3% | 0.0% |
| feistyboi | Counter | 134 | 56.7% | 56.7% | 0.0% |
| felixsprotoarc | Zoning | 146 | 55.5% | 55.5% | 0.0% |
| fiatfudder | Counter | 138 | 47.1% | 47.1% | 0.0% |
| forchaneth | Footwork | 128 | 51.6% | 51.6% | 0.0% |
| fplgremlin | Pressure | 144 | 38.7% | 38.7% | 1.4% |
| freedfrida | Footwork | 146 | 58.2% | 58.2% | 0.0% |
| frej | Counter | 140 | 57.1% | 57.1% | 0.0% |
| freshprince | Counter | 162 | 49.4% | 49.4% | 0.0% |
| ghostsprotocol | Zoning | 142 | 59.9% | 59.9% | 0.0% |
| giavannykitchens | Pressure | 140 | 49.3% | 49.3% | 0.0% |
| glow | Counter | 156 | 50.0% | 50.0% | 0.0% |
| gluttony | Zoning | 138 | 69.6% | 69.6% | 0.0% |
| godether | Counter | 134 | 44.0% | 44.0% | 0.0% |
| godmod3d | Paired | 136 | 48.5% | 48.5% | 0.0% |
| godsson | Counter | 154 | 44.8% | 44.8% | 0.0% |
| gpm | Brawler | 154 | 46.8% | 46.8% | 0.0% |
| greatcharly | Footwork | 150 | 58.7% | 58.7% | 0.0% |
| gryph | Paired | 130 | 52.3% | 52.3% | 0.0% |
| guest07 | Pressure | 154 | 44.7% | 44.7% | 1.3% |
| guest08 | Zoning | 170 | 55.9% | 55.9% | 0.0% |
| guest09 | Pressure | 142 | 47.9% | 47.9% | 0.0% |
| guest10 | Zoning | 138 | 69.6% | 69.6% | 0.0% |
| guest11 | Counter | 144 | 45.1% | 45.1% | 1.4% |
| guest12 | Zoning | 140 | 53.6% | 53.6% | 0.0% |
| guest13 | Counter | 156 | 44.9% | 44.9% | 0.0% |
| guest14 | Counter | 174 | 46.6% | 46.6% | 0.0% |
| hdizzy | Zoning | 134 | 53.0% | 53.0% | 0.0% |
| herbpowell | Counter | 126 | 58.7% | 58.7% | 0.0% |
| hermionemichelleamyrose | Footwork | 138 | 50.7% | 50.7% | 0.0% |
| highsproto | Zoning | 162 | 51.9% | 51.9% | 0.0% |
| homosproto | Footwork | 166 | 47.6% | 47.6% | 0.0% |
| indiapolice | Counter | 148 | 50.7% | 50.7% | 0.0% |
| infinitysplitter | Footwork | 150 | 62.0% | 62.0% | 0.0% |
| isaac | Footwork | 154 | 58.4% | 58.4% | 0.0% |
| jameskaminski | Pressure | 156 | 46.2% | 46.2% | 0.0% |
| janitor | Brawler | 158 | 48.1% | 48.1% | 0.0% |
| jasper | Footwork | 138 | 39.1% | 39.1% | 0.0% |
| jayquant | Counter | 144 | 47.9% | 47.9% | 0.0% |
| johnson | Brawler | 144 | 50.0% | 50.0% | 0.0% |
| julian | Counter | 170 | 46.4% | 46.4% | 1.2% |
| kern | Counter | 144 | 54.2% | 54.2% | 0.0% |
| kerrieanne | Counter | 144 | 60.4% | 60.4% | 0.0% |
| laserbach | Pressure | 138 | 58.7% | 58.7% | 0.0% |
| lestrange | Footwork | 146 | 47.9% | 47.9% | 0.0% |
| leviosa | Footwork | 140 | 37.9% | 37.9% | 0.0% |
| lifeisameme | Pressure | 146 | 42.5% | 42.5% | 0.0% |
| lilgoldied | Counter | 156 | 50.6% | 50.6% | 0.0% |
| loadthebags | Pressure | 166 | 44.6% | 44.6% | 0.0% |
| loqi | Counter | 138 | 52.9% | 52.9% | 0.0% |
| lowernipple | Zoning | 154 | 53.9% | 53.9% | 1.3% |
| mandela | Weapon | 148 | 45.3% | 45.6% | 0.7% |
| marfrog | Footwork | 146 | 32.9% | 32.9% | 0.0% |
| maxbiggums | Brawler | 144 | 43.1% | 43.1% | 0.0% |
| melo | Weapon | 156 | 40.4% | 40.4% | 0.0% |
| michael | Weapon | 156 | 53.2% | 53.2% | 0.0% |
| micsash | Counter | 142 | 50.0% | 50.0% | 0.0% |
| mikemike | Brawler | 164 | 54.3% | 54.3% | 0.0% |
| mildtacos | Footwork | 136 | 55.9% | 55.9% | 0.0% |
| mlk | Counter | 142 | 47.9% | 47.9% | 0.0% |
| moonshiller | Brawler | 152 | 53.9% | 53.9% | 0.0% |
| mox | Counter | 152 | 60.5% | 60.5% | 0.0% |
| mrgoldrobe | Counter | 142 | 50.7% | 50.7% | 0.0% |
| mrhorsemeat | Counter | 180 | 57.2% | 57.2% | 0.0% |
| nate | Pressure | 144 | 44.4% | 44.4% | 0.0% |
| nick | Pressure | 150 | 45.3% | 45.3% | 0.0% |
| nomis | Pressure | 142 | 45.8% | 45.8% | 0.0% |
| nosmileclown | Paired | 150 | 56.7% | 56.7% | 0.0% |
| np | Footwork | 178 | 54.5% | 54.5% | 0.0% |
| obamasega420 | Footwork | 150 | 52.7% | 52.7% | 0.0% |
| olnoname | Footwork | 140 | 42.1% | 42.1% | 0.0% |
| onememeaday | Pressure | 158 | 50.0% | 50.0% | 1.3% |
| osho | Footwork | 152 | 57.9% | 57.9% | 0.0% |
| otorps | Counter | 146 | 45.9% | 45.9% | 0.0% |
| pars | Brawler | 164 | 47.6% | 47.6% | 0.0% |
| peterpan | Paired | 140 | 51.4% | 51.4% | 0.0% |
| pilgrim | Brawler | 144 | 47.9% | 47.9% | 0.0% |
| pinewaffle | Pressure | 150 | 56.1% | 56.1% | 1.3% |
| pirate | Footwork | 138 | 48.6% | 48.6% | 0.0% |
| pongohpos10i | Zoning | 158 | 63.9% | 63.9% | 0.0% |
| potocaicai | Counter | 154 | 42.9% | 42.9% | 0.0% |
| pr0lificeth | Zoning | 158 | 50.0% | 50.0% | 0.0% |
| prim | Zoning | 138 | 55.8% | 55.8% | 0.0% |
| rainman | Footwork | 150 | 48.7% | 48.7% | 0.0% |
| razz | Counter | 144 | 39.6% | 39.6% | 0.0% |
| realityarchitect | Counter | 146 | 53.4% | 53.4% | 0.0% |
| rektina | Footwork | 134 | 41.0% | 41.0% | 0.0% |
| renzo | Pressure | 148 | 39.7% | 39.7% | 1.4% |
| reverend | Footwork | 146 | 45.9% | 45.9% | 0.0% |
| rivet | Pressure | 116 | 45.7% | 45.7% | 0.0% |
| rlarsson | Footwork | 146 | 43.2% | 43.2% | 0.0% |
| rmacpdx | Footwork | 152 | 52.0% | 52.0% | 0.0% |
| rune | Counter | 146 | 46.6% | 46.6% | 0.0% |
| saburdo | Pressure | 168 | 47.6% | 47.6% | 0.0% |
| samixsproto | Zoning | 138 | 65.2% | 65.2% | 0.0% |
| satoshi | Pressure | 132 | 54.5% | 54.5% | 0.0% |
| seph0x | Counter | 148 | 51.4% | 51.4% | 0.0% |
| sidelinereferee | Zoning | 142 | 62.0% | 62.0% | 0.0% |
| sirbitcoin | Counter | 140 | 54.3% | 54.3% | 0.0% |
| sirdidit | Footwork | 142 | 34.5% | 34.5% | 0.0% |
| sisma | Pressure | 144 | 52.8% | 52.8% | 0.0% |
| slabcorn | Brawler | 138 | 37.7% | 37.7% | 0.0% |
| slakesly | Counter | 148 | 52.7% | 52.7% | 0.0% |
| sober | Footwork | 154 | 43.5% | 43.5% | 0.0% |
| solanadelray | Paired | 144 | 39.6% | 39.2% | 0.7% |
| sprog | Footwork | 150 | 56.7% | 56.7% | 0.0% |
| sproteth | Footwork | 144 | 49.3% | 49.3% | 0.0% |
| sproto1011 | Weapon | 158 | 47.5% | 47.5% | 0.0% |
| sproto102 | Footwork | 154 | 47.4% | 47.4% | 0.0% |
| sproto1093 | Footwork | 134 | 42.5% | 42.5% | 0.0% |
| sproto1187 | Footwork | 166 | 42.1% | 42.1% | 1.2% |
| sproto1335 | Footwork | 144 | 57.6% | 57.6% | 0.0% |
| sproto1345 | Footwork | 148 | 51.4% | 51.4% | 0.0% |
| sproto1414 | Footwork | 162 | 49.4% | 49.4% | 0.0% |
| sproto1477 | Footwork | 158 | 57.6% | 57.6% | 0.0% |
| sproto1499 | Paired | 154 | 52.6% | 52.6% | 0.0% |
| sproto1601 | Zoning | 148 | 60.1% | 60.1% | 0.0% |
| sproto1625 | Paired | 148 | 45.9% | 45.9% | 0.0% |
| sproto1668 | Footwork | 162 | 45.7% | 45.7% | 0.0% |
| sproto1815 | Weapon | 164 | 54.3% | 54.3% | 0.0% |
| sproto1870 | Hover | 140 | 46.4% | 46.4% | 0.0% |
| sproto2010 | Paired | 134 | 53.0% | 53.0% | 0.0% |
| sproto2075 | Paired | 150 | 47.3% | 47.3% | 0.0% |
| sproto2101 | Footwork | 134 | 49.3% | 49.3% | 0.0% |
| sproto215 | Footwork | 140 | 50.0% | 50.0% | 0.0% |
| sproto2177 | Footwork | 162 | 53.7% | 53.4% | 0.6% |
| sproto2210 | Paired | 142 | 57.7% | 57.7% | 0.0% |
| sproto2322 | Footwork | 156 | 48.1% | 48.1% | 0.0% |
| sproto2344 | Paired | 152 | 39.5% | 39.7% | 0.7% |
| sproto2381 | Footwork | 148 | 50.7% | 50.7% | 0.0% |
| sproto2531 | Zoning | 152 | 52.0% | 52.0% | 0.0% |
| sproto2569 | Footwork | 134 | 44.8% | 44.8% | 0.0% |
| sproto2616 | Weapon | 144 | 53.5% | 53.5% | 0.0% |
| sproto2789 | Weapon | 144 | 55.6% | 55.6% | 1.4% |
| sproto282 | Paired | 150 | 50.0% | 50.0% | 0.0% |
| sproto2884 | Footwork | 146 | 39.0% | 39.3% | 0.7% |
| sproto3106 | Zoning | 132 | 52.3% | 52.3% | 0.0% |
| sproto313 | Footwork | 136 | 44.9% | 44.9% | 0.0% |
| sproto3152 | Zoning | 152 | 57.2% | 57.2% | 0.0% |
| sproto3181 | Paired | 150 | 48.0% | 48.0% | 0.0% |
| sproto3215 | Footwork | 150 | 52.0% | 52.0% | 1.3% |
| sproto3224 | Paired | 144 | 48.6% | 48.6% | 0.0% |
| sproto3235 | Paired | 154 | 53.2% | 52.9% | 0.6% |
| sproto651 | Footwork | 134 | 53.7% | 53.7% | 0.0% |
| sproto704 | Paired | 140 | 41.4% | 41.7% | 0.7% |
| sproto763 | Footwork | 152 | 38.2% | 38.2% | 0.0% |
| sproto818 | Footwork | 128 | 53.9% | 53.9% | 0.0% |
| sproto831 | Footwork | 130 | 50.0% | 50.0% | 0.0% |
| sproto832 | Paired | 144 | 47.9% | 47.9% | 0.0% |
| sproto834 | Footwork | 122 | 39.3% | 39.3% | 0.0% |
| sproto837 | Footwork | 144 | 38.9% | 38.9% | 0.0% |
| sproto865 | Footwork | 140 | 44.3% | 44.3% | 0.0% |
| sproto943 | Footwork | 130 | 56.2% | 56.2% | 0.0% |
| sproto999 | Footwork | 156 | 48.1% | 48.1% | 0.0% |
| sprotocius | Counter | 146 | 45.9% | 45.9% | 0.0% |
| sprotolg | Zoning | 146 | 42.5% | 42.5% | 0.0% |
| sprotomichaelsaylor | Zoning | 132 | 50.0% | 50.0% | 0.0% |
| sprotomidnightfx | Pressure | 160 | 39.4% | 39.4% | 0.0% |
| sprotopia | Zoning | 138 | 58.0% | 58.0% | 0.0% |
| sprotopotamus | Brawler | 158 | 51.9% | 51.9% | 0.0% |
| sprotosales | Footwork | 136 | 44.1% | 44.1% | 0.0% |
| sprotosurvivor | Zoning | 146 | 54.1% | 54.1% | 0.0% |
| spruto | Footwork | 138 | 58.7% | 58.7% | 0.0% |
| spunow | Footwork | 126 | 42.9% | 42.9% | 0.0% |
| stonkyleg69 | Footwork | 146 | 50.0% | 50.0% | 0.0% |
| stoto | Pressure | 166 | 53.0% | 53.0% | 0.0% |
| sweatpantstrust | Counter | 140 | 51.4% | 51.4% | 0.0% |
| tdeth | Pressure | 140 | 50.0% | 50.0% | 0.0% |
| teahupoo | Counter | 138 | 53.6% | 53.6% | 0.0% |
| theo | Zoning | 162 | 58.6% | 58.6% | 0.0% |
| thesprotowholivedeth | Zoning | 146 | 48.6% | 48.6% | 0.0% |
| thxobama | Counter | 140 | 50.0% | 50.0% | 0.0% |
| tingsmol | Footwork | 138 | 55.1% | 55.1% | 0.0% |
| tradertimmy | Counter | 144 | 55.6% | 55.6% | 0.0% |
| twinnyneutron | Paired | 146 | 42.5% | 42.5% | 0.0% |
| uncmasterflex | Footwork | 156 | 31.4% | 31.4% | 0.0% |
| urmometh | Footwork | 140 | 47.9% | 47.9% | 0.0% |
| usedtowels | Counter | 158 | 45.6% | 45.6% | 0.0% |
| vamp | Zoning | 152 | 62.7% | 62.7% | 1.3% |
| vaudream | Hover | 146 | 48.6% | 48.6% | 0.0% |
| vela | Zoning | 158 | 55.1% | 55.1% | 0.0% |
| veryseriousinvestor | Footwork | 144 | 63.2% | 63.2% | 0.0% |
| vicoo | Counter | 150 | 61.3% | 61.3% | 0.0% |
| vitaliketh | Footwork | 156 | 59.0% | 59.0% | 0.0% |
| wifebeater | Brawler | 146 | 49.3% | 49.3% | 0.0% |
| willuminati | Counter | 150 | 53.3% | 53.3% | 0.0% |
| wireitwell | Pressure | 148 | 45.9% | 45.9% | 0.0% |
| wyrmblvnt | Footwork | 156 | 44.2% | 44.2% | 0.0% |
| xalt | Zoning | 152 | 61.2% | 61.2% | 0.0% |
| xav | Footwork | 140 | 39.3% | 39.3% | 0.0% |
| yusuf | Pressure | 144 | 50.7% | 50.7% | 0.0% |
| zakarum | Footwork | 158 | 53.2% | 53.2% | 0.0% |
| zebracorn | Counter | 164 | 45.7% | 45.7% | 0.0% |
| zephyr | Brawler | 156 | 50.0% | 50.0% | 0.0% |
| zepump | Paired | 152 | 46.7% | 46.7% | 0.0% |
| zippy | Pressure | 162 | 47.5% | 47.5% | 1.2% |
| zudi | Counter | 150 | 44.7% | 44.7% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 2 | 100.0% |
| 86gwei vs alpha777 | 2 | 100.0% |
| 86gwei vs bidnehhh | 2 | 100.0% |
| 86gwei vs bitcoind1rk | 2 | 100.0% |
| 86gwei vs bront | 2 | 0.0% |
| 86gwei vs buddhashadow | 2 | 0.0% |
| 86gwei vs cam | 2 | 100.0% |
| 86gwei vs ciphersproto | 2 | 100.0% |
| 86gwei vs croy | 2 | 100.0% |
| 86gwei vs drzmoody | 2 | 0.0% |

## Skill 7

18694 bouts; raw draws 0.1% (21); unresolved 0.1% (18); timeouts 0. Mean 29.85 s; median 29.93 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.1% | 50.1% | 0.1% | 5.43 s |
| 2 | 49.9% | 49.9% | 0.1% | 5.43 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 12422 | 49.6% | 49.6% | 0.1% |
| Counter | 7260 | 49.3% | 49.3% | 0.1% |
| Pressure | 4572 | 49.8% | 49.8% | 0.2% |
| Brawler | 3120 | 51.5% | 51.5% | 0.1% |
| Paired | 2924 | 49.1% | 49.1% | 0.1% |
| Zoning | 5578 | 52.3% | 52.3% | 0.1% |
| Weapon | 1226 | 48.0% | 48.0% | 0.2% |
| Hover | 286 | 44.8% | 44.8% | 0.0% |

Damage: melee 25137849; projectile 1836108; special 1409042; throw 1415179.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 50.0% | 50.0% | 0.0% |
| aaron | Footwork | 158 | 43.7% | 43.7% | 0.0% |
| accidentallyrich | Counter | 136 | 46.3% | 46.3% | 1.5% |
| agentsproto | Brawler | 154 | 52.6% | 52.6% | 0.0% |
| aktree | Zoning | 144 | 46.5% | 46.5% | 0.0% |
| aleksander | Counter | 150 | 53.3% | 53.3% | 0.0% |
| alpha777 | Pressure | 150 | 51.3% | 51.3% | 0.0% |
| anni | Pressure | 136 | 51.5% | 51.5% | 2.9% |
| autistophrenicsprotagonist | Footwork | 134 | 57.5% | 57.5% | 0.0% |
| azkarah | Zoning | 132 | 49.2% | 49.2% | 0.0% |
| benjamin | Footwork | 152 | 32.9% | 32.9% | 0.0% |
| berserk | Footwork | 138 | 50.0% | 50.0% | 0.0% |
| bgbadger | Zoning | 144 | 61.1% | 61.1% | 0.0% |
| bidnehhh | Pressure | 140 | 49.3% | 49.3% | 0.0% |
| bigal | Brawler | 128 | 49.2% | 49.2% | 0.0% |
| bigswole | Brawler | 142 | 42.3% | 42.3% | 0.0% |
| bimba | Footwork | 142 | 48.6% | 48.6% | 0.0% |
| bitcoind1rk | Footwork | 168 | 51.2% | 51.2% | 0.0% |
| blorfo | Weapon | 156 | 60.9% | 60.9% | 0.0% |
| bobdobbs | Footwork | 154 | 61.7% | 61.7% | 0.0% |
| brainsprot | Footwork | 146 | 55.5% | 55.5% | 0.0% |
| bront | Brawler | 138 | 48.5% | 48.5% | 1.4% |
| bs9090eth | Zoning | 148 | 58.8% | 58.8% | 0.0% |
| buddhashadow | Footwork | 162 | 51.2% | 51.2% | 0.0% |
| cam | Brawler | 148 | 48.6% | 48.6% | 0.0% |
| cantankerous | Pressure | 124 | 50.0% | 50.0% | 0.0% |
| captain | Zoning | 142 | 50.7% | 50.7% | 0.0% |
| captainhowdy | Footwork | 144 | 54.9% | 54.9% | 0.0% |
| ceo | Zoning | 148 | 64.4% | 64.4% | 1.4% |
| chaton | Footwork | 146 | 45.9% | 45.9% | 0.0% |
| chonky | Footwork | 156 | 46.8% | 46.8% | 0.0% |
| chrisfowler | Counter | 126 | 35.7% | 35.7% | 0.0% |
| ciphersproto | Pressure | 154 | 44.8% | 44.8% | 0.0% |
| clobrwn | Footwork | 144 | 56.3% | 56.3% | 1.4% |
| contresens | Zoning | 148 | 57.4% | 57.4% | 0.0% |
| corn | Pressure | 148 | 57.4% | 57.4% | 0.0% |
| crapto | Zoning | 134 | 56.7% | 56.7% | 0.0% |
| crippledlover | Footwork | 146 | 51.4% | 51.4% | 1.4% |
| croy | Counter | 152 | 48.7% | 48.7% | 0.0% |
| crumpleii | Brawler | 158 | 54.4% | 54.4% | 0.0% |
| cryptobartender | Zoning | 148 | 52.1% | 52.1% | 1.4% |
| cryptoboy | Counter | 146 | 54.1% | 54.1% | 0.0% |
| cryptomonger | Footwork | 132 | 57.6% | 57.6% | 0.0% |
| cryptorizzler | Counter | 168 | 45.2% | 45.2% | 0.0% |
| cryptoviking420 | Pressure | 162 | 54.3% | 54.3% | 0.0% |
| cyberviber | Counter | 170 | 50.6% | 50.6% | 0.0% |
| d86 | Zoning | 168 | 35.1% | 35.1% | 0.0% |
| danocrypto | Counter | 140 | 55.0% | 55.0% | 0.0% |
| davidcd | Footwork | 146 | 55.6% | 55.6% | 1.4% |
| degenpress | Zoning | 148 | 52.7% | 52.7% | 0.0% |
| dollarbitcoin | Brawler | 136 | 51.5% | 51.5% | 0.0% |
| drzmoody | Footwork | 154 | 50.6% | 50.6% | 0.0% |
| dumpstar | Brawler | 144 | 55.6% | 55.6% | 0.0% |
| duo | Paired | 164 | 48.2% | 48.2% | 0.0% |
| durlan | Footwork | 158 | 49.4% | 49.4% | 0.0% |
| emix | Footwork | 140 | 43.6% | 43.6% | 0.0% |
| erik | Footwork | 130 | 35.9% | 35.9% | 1.5% |
| familywagon | Brawler | 150 | 44.0% | 44.0% | 0.0% |
| feistyboi | Counter | 134 | 53.0% | 53.0% | 0.0% |
| felixsprotoarc | Zoning | 146 | 52.1% | 52.1% | 0.0% |
| fiatfudder | Counter | 138 | 55.8% | 55.8% | 0.0% |
| forchaneth | Footwork | 128 | 64.1% | 64.1% | 0.0% |
| fplgremlin | Pressure | 144 | 44.4% | 44.4% | 0.0% |
| freedfrida | Footwork | 146 | 50.7% | 50.7% | 0.0% |
| frej | Counter | 140 | 42.1% | 42.1% | 0.0% |
| freshprince | Counter | 162 | 45.1% | 45.1% | 0.0% |
| ghostsprotocol | Zoning | 142 | 47.9% | 47.9% | 0.0% |
| giavannykitchens | Pressure | 140 | 39.1% | 39.1% | 1.4% |
| glow | Counter | 156 | 48.1% | 48.1% | 0.0% |
| gluttony | Zoning | 138 | 37.7% | 37.7% | 0.0% |
| godether | Counter | 134 | 49.3% | 49.3% | 0.0% |
| godmod3d | Paired | 136 | 56.6% | 56.6% | 0.0% |
| godsson | Counter | 154 | 50.7% | 50.7% | 1.3% |
| gpm | Brawler | 154 | 48.1% | 48.1% | 0.0% |
| greatcharly | Footwork | 150 | 54.0% | 54.0% | 0.0% |
| gryph | Paired | 130 | 58.5% | 58.5% | 0.0% |
| guest07 | Pressure | 154 | 42.2% | 41.8% | 0.6% |
| guest08 | Zoning | 170 | 46.5% | 46.5% | 0.0% |
| guest09 | Pressure | 142 | 50.7% | 50.7% | 0.0% |
| guest10 | Zoning | 138 | 47.1% | 46.7% | 0.7% |
| guest11 | Counter | 144 | 46.5% | 46.5% | 0.0% |
| guest12 | Zoning | 140 | 62.1% | 62.1% | 0.0% |
| guest13 | Counter | 156 | 54.5% | 54.5% | 0.0% |
| guest14 | Counter | 174 | 44.3% | 44.3% | 0.0% |
| hdizzy | Zoning | 134 | 47.8% | 47.8% | 0.0% |
| herbpowell | Counter | 126 | 44.4% | 44.4% | 0.0% |
| hermionemichelleamyrose | Footwork | 138 | 63.2% | 63.2% | 1.4% |
| highsproto | Zoning | 162 | 64.2% | 64.2% | 0.0% |
| homosproto | Footwork | 166 | 46.4% | 46.4% | 0.0% |
| indiapolice | Counter | 148 | 52.7% | 52.7% | 1.4% |
| infinitysplitter | Footwork | 150 | 52.0% | 52.0% | 0.0% |
| isaac | Footwork | 154 | 42.9% | 42.9% | 0.0% |
| jameskaminski | Pressure | 156 | 61.5% | 61.5% | 0.0% |
| janitor | Brawler | 158 | 53.2% | 53.2% | 0.0% |
| jasper | Footwork | 138 | 42.6% | 42.6% | 1.4% |
| jayquant | Counter | 144 | 48.6% | 48.6% | 0.0% |
| johnson | Brawler | 144 | 58.3% | 58.3% | 0.0% |
| julian | Counter | 170 | 53.5% | 53.5% | 0.0% |
| kern | Counter | 144 | 46.5% | 46.5% | 0.0% |
| kerrieanne | Counter | 144 | 56.9% | 56.9% | 0.0% |
| laserbach | Pressure | 138 | 39.1% | 39.1% | 0.0% |
| lestrange | Footwork | 146 | 52.1% | 52.1% | 0.0% |
| leviosa | Footwork | 140 | 42.1% | 42.1% | 0.0% |
| lifeisameme | Pressure | 146 | 56.2% | 56.2% | 0.0% |
| lilgoldied | Counter | 156 | 48.1% | 48.1% | 0.0% |
| loadthebags | Pressure | 166 | 47.6% | 47.6% | 0.0% |
| loqi | Counter | 138 | 52.9% | 52.9% | 0.0% |
| lowernipple | Zoning | 154 | 46.8% | 46.8% | 0.0% |
| mandela | Weapon | 148 | 54.7% | 54.7% | 0.0% |
| marfrog | Footwork | 146 | 47.9% | 47.9% | 0.0% |
| maxbiggums | Brawler | 144 | 41.7% | 41.7% | 0.0% |
| melo | Weapon | 156 | 32.7% | 32.7% | 0.0% |
| michael | Weapon | 156 | 53.2% | 53.2% | 1.3% |
| micsash | Counter | 142 | 41.5% | 41.5% | 0.0% |
| mikemike | Brawler | 164 | 51.2% | 51.2% | 0.0% |
| mildtacos | Footwork | 136 | 61.8% | 61.8% | 0.0% |
| mlk | Counter | 142 | 57.0% | 57.0% | 0.0% |
| moonshiller | Brawler | 152 | 58.6% | 58.6% | 0.0% |
| mox | Counter | 152 | 55.9% | 55.9% | 0.0% |
| mrgoldrobe | Counter | 142 | 49.3% | 49.3% | 0.0% |
| mrhorsemeat | Counter | 180 | 49.4% | 49.4% | 0.0% |
| nate | Pressure | 144 | 43.1% | 43.1% | 0.0% |
| nick | Pressure | 150 | 44.7% | 44.7% | 0.0% |
| nomis | Pressure | 142 | 54.9% | 54.9% | 0.0% |
| nosmileclown | Paired | 150 | 58.0% | 58.0% | 0.0% |
| np | Footwork | 178 | 56.2% | 56.2% | 0.0% |
| obamasega420 | Footwork | 150 | 59.3% | 59.3% | 0.0% |
| olnoname | Footwork | 140 | 44.3% | 44.3% | 0.0% |
| onememeaday | Pressure | 158 | 47.5% | 47.5% | 0.0% |
| osho | Footwork | 152 | 52.6% | 52.6% | 0.0% |
| otorps | Counter | 146 | 47.9% | 47.9% | 0.0% |
| pars | Brawler | 164 | 56.7% | 56.7% | 0.0% |
| peterpan | Paired | 140 | 40.7% | 40.7% | 0.0% |
| pilgrim | Brawler | 144 | 52.8% | 52.8% | 0.0% |
| pinewaffle | Pressure | 150 | 50.0% | 50.0% | 0.0% |
| pirate | Footwork | 138 | 60.9% | 60.9% | 0.0% |
| pongohpos10i | Zoning | 158 | 52.5% | 52.5% | 0.0% |
| potocaicai | Counter | 154 | 53.2% | 53.2% | 0.0% |
| pr0lificeth | Zoning | 158 | 53.2% | 53.2% | 0.0% |
| prim | Zoning | 138 | 53.6% | 53.6% | 0.0% |
| rainman | Footwork | 150 | 49.3% | 49.3% | 0.0% |
| razz | Counter | 144 | 43.1% | 43.1% | 0.0% |
| realityarchitect | Counter | 146 | 36.3% | 36.3% | 0.0% |
| rektina | Footwork | 134 | 60.4% | 60.4% | 0.0% |
| renzo | Pressure | 148 | 49.3% | 49.3% | 0.0% |
| reverend | Footwork | 146 | 50.0% | 50.0% | 0.0% |
| rivet | Pressure | 116 | 49.1% | 49.1% | 0.0% |
| rlarsson | Footwork | 146 | 56.8% | 56.8% | 0.0% |
| rmacpdx | Footwork | 152 | 50.0% | 50.0% | 0.0% |
| rune | Counter | 146 | 50.7% | 50.7% | 0.0% |
| saburdo | Pressure | 168 | 55.4% | 55.4% | 0.0% |
| samixsproto | Zoning | 138 | 55.8% | 55.8% | 0.0% |
| satoshi | Pressure | 132 | 45.5% | 45.5% | 0.0% |
| seph0x | Counter | 148 | 59.5% | 59.5% | 0.0% |
| sidelinereferee | Zoning | 142 | 49.3% | 49.3% | 0.0% |
| sirbitcoin | Counter | 140 | 45.7% | 45.7% | 0.0% |
| sirdidit | Footwork | 142 | 35.0% | 35.0% | 1.4% |
| sisma | Pressure | 144 | 45.8% | 45.8% | 0.0% |
| slabcorn | Brawler | 138 | 51.4% | 51.4% | 0.0% |
| slakesly | Counter | 148 | 50.7% | 50.7% | 0.0% |
| sober | Footwork | 154 | 53.2% | 53.2% | 0.0% |
| solanadelray | Paired | 144 | 45.8% | 45.5% | 0.7% |
| sprog | Footwork | 150 | 46.7% | 46.7% | 0.0% |
| sproteth | Footwork | 144 | 47.9% | 47.9% | 0.0% |
| sproto1011 | Weapon | 158 | 43.7% | 43.7% | 0.0% |
| sproto102 | Footwork | 154 | 40.9% | 40.9% | 0.0% |
| sproto1093 | Footwork | 134 | 44.0% | 44.0% | 0.0% |
| sproto1187 | Footwork | 166 | 51.8% | 51.8% | 0.0% |
| sproto1335 | Footwork | 144 | 54.2% | 54.2% | 0.0% |
| sproto1345 | Footwork | 148 | 50.0% | 50.0% | 0.0% |
| sproto1414 | Footwork | 162 | 43.2% | 43.2% | 0.0% |
| sproto1477 | Footwork | 158 | 39.9% | 39.9% | 0.0% |
| sproto1499 | Paired | 154 | 46.1% | 46.1% | 0.0% |
| sproto1601 | Zoning | 148 | 49.3% | 49.3% | 0.0% |
| sproto1625 | Paired | 148 | 46.6% | 46.6% | 0.0% |
| sproto1668 | Footwork | 162 | 42.6% | 42.6% | 0.0% |
| sproto1815 | Weapon | 164 | 48.8% | 48.8% | 0.0% |
| sproto1870 | Hover | 140 | 47.1% | 47.1% | 0.0% |
| sproto2010 | Paired | 134 | 44.0% | 44.0% | 0.0% |
| sproto2075 | Paired | 150 | 46.0% | 46.3% | 0.7% |
| sproto2101 | Footwork | 134 | 53.0% | 53.0% | 0.0% |
| sproto215 | Footwork | 140 | 46.4% | 46.4% | 0.0% |
| sproto2177 | Footwork | 162 | 54.3% | 54.3% | 0.0% |
| sproto2210 | Paired | 142 | 43.7% | 43.7% | 0.0% |
| sproto2322 | Footwork | 156 | 51.9% | 51.9% | 0.0% |
| sproto2344 | Paired | 152 | 47.4% | 47.4% | 0.0% |
| sproto2381 | Footwork | 148 | 37.2% | 37.4% | 0.7% |
| sproto2531 | Zoning | 152 | 50.7% | 50.7% | 0.0% |
| sproto2569 | Footwork | 134 | 44.8% | 44.8% | 0.0% |
| sproto2616 | Weapon | 144 | 51.4% | 51.4% | 0.0% |
| sproto2789 | Weapon | 144 | 38.9% | 38.9% | 0.0% |
| sproto282 | Paired | 150 | 55.3% | 55.3% | 0.0% |
| sproto2884 | Footwork | 146 | 43.8% | 43.8% | 0.0% |
| sproto3106 | Zoning | 132 | 53.0% | 53.0% | 0.0% |
| sproto313 | Footwork | 136 | 44.9% | 44.9% | 0.0% |
| sproto3152 | Zoning | 152 | 55.9% | 55.9% | 0.0% |
| sproto3181 | Paired | 150 | 52.0% | 52.0% | 0.0% |
| sproto3215 | Footwork | 150 | 42.0% | 42.0% | 0.0% |
| sproto3224 | Paired | 144 | 55.6% | 55.6% | 0.0% |
| sproto3235 | Paired | 154 | 50.0% | 50.0% | 0.0% |
| sproto651 | Footwork | 134 | 49.3% | 49.3% | 0.0% |
| sproto704 | Paired | 140 | 44.3% | 44.3% | 0.0% |
| sproto763 | Footwork | 152 | 40.8% | 40.8% | 0.0% |
| sproto818 | Footwork | 128 | 43.8% | 43.8% | 0.0% |
| sproto831 | Footwork | 130 | 52.3% | 52.3% | 0.0% |
| sproto832 | Paired | 144 | 54.2% | 54.2% | 0.0% |
| sproto834 | Footwork | 122 | 45.9% | 45.9% | 0.0% |
| sproto837 | Footwork | 144 | 41.7% | 41.7% | 0.0% |
| sproto865 | Footwork | 140 | 37.1% | 37.1% | 0.0% |
| sproto943 | Footwork | 130 | 46.2% | 46.2% | 0.0% |
| sproto999 | Footwork | 156 | 53.8% | 53.8% | 0.0% |
| sprotocius | Counter | 146 | 47.9% | 47.9% | 0.0% |
| sprotolg | Zoning | 146 | 67.1% | 67.1% | 0.0% |
| sprotomichaelsaylor | Zoning | 132 | 45.5% | 45.5% | 0.0% |
| sprotomidnightfx | Pressure | 160 | 55.6% | 55.6% | 0.0% |
| sprotopia | Zoning | 138 | 59.4% | 59.4% | 0.0% |
| sprotopotamus | Brawler | 158 | 47.5% | 47.5% | 0.0% |
| sprotosales | Footwork | 136 | 47.1% | 47.1% | 0.0% |
| sprotosurvivor | Zoning | 146 | 44.5% | 44.5% | 0.0% |
| spruto | Footwork | 138 | 52.9% | 52.9% | 0.0% |
| spunow | Footwork | 126 | 63.5% | 63.5% | 0.0% |
| stonkyleg69 | Footwork | 146 | 61.6% | 61.6% | 0.0% |
| stoto | Pressure | 166 | 52.4% | 52.4% | 0.0% |
| sweatpantstrust | Counter | 140 | 47.9% | 47.9% | 0.0% |
| tdeth | Pressure | 140 | 55.7% | 55.7% | 0.0% |
| teahupoo | Counter | 138 | 50.0% | 50.0% | 0.0% |
| theo | Zoning | 162 | 46.9% | 46.9% | 0.0% |
| thesprotowholivedeth | Zoning | 146 | 47.3% | 47.3% | 0.0% |
| thxobama | Counter | 140 | 45.7% | 45.7% | 0.0% |
| tingsmol | Footwork | 138 | 44.2% | 44.2% | 0.0% |
| tradertimmy | Counter | 144 | 45.8% | 45.8% | 0.0% |
| twinnyneutron | Paired | 146 | 43.8% | 43.8% | 0.0% |
| uncmasterflex | Footwork | 156 | 58.3% | 58.3% | 0.0% |
| urmometh | Footwork | 140 | 47.1% | 47.1% | 0.0% |
| usedtowels | Counter | 158 | 48.1% | 48.1% | 0.0% |
| vamp | Zoning | 152 | 55.9% | 55.9% | 0.0% |
| vaudream | Hover | 146 | 42.5% | 42.5% | 0.0% |
| vela | Zoning | 158 | 51.9% | 51.9% | 0.0% |
| veryseriousinvestor | Footwork | 144 | 54.2% | 54.2% | 0.0% |
| vicoo | Counter | 150 | 46.7% | 46.7% | 0.0% |
| vitaliketh | Footwork | 156 | 55.2% | 55.2% | 1.3% |
| wifebeater | Brawler | 146 | 60.3% | 60.3% | 0.0% |
| willuminati | Counter | 150 | 47.3% | 47.3% | 0.0% |
| wireitwell | Pressure | 148 | 52.7% | 52.7% | 0.0% |
| wyrmblvnt | Footwork | 156 | 45.5% | 45.5% | 0.0% |
| xalt | Zoning | 152 | 59.2% | 59.2% | 0.0% |
| xav | Footwork | 140 | 44.3% | 44.3% | 0.0% |
| yusuf | Pressure | 144 | 46.5% | 46.5% | 0.0% |
| zakarum | Footwork | 158 | 55.7% | 55.7% | 0.0% |
| zebracorn | Counter | 164 | 59.8% | 59.8% | 0.0% |
| zephyr | Brawler | 156 | 53.8% | 53.8% | 0.0% |
| zepump | Paired | 152 | 46.1% | 46.4% | 0.7% |
| zippy | Pressure | 162 | 53.7% | 53.7% | 0.0% |
| zudi | Counter | 150 | 49.3% | 49.3% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 2 | 100.0% |
| 86gwei vs alpha777 | 2 | 0.0% |
| 86gwei vs bidnehhh | 2 | 0.0% |
| 86gwei vs bitcoind1rk | 2 | 100.0% |
| 86gwei vs bront | 2 | 100.0% |
| 86gwei vs buddhashadow | 2 | 100.0% |
| 86gwei vs cam | 2 | 100.0% |
| 86gwei vs ciphersproto | 2 | 100.0% |
| 86gwei vs croy | 2 | 100.0% |
| 86gwei vs drzmoody | 2 | 0.0% |

## Skill 10

18694 bouts; raw draws 1.0% (192); unresolved 0.8% (146); timeouts 22. Mean 35.27 s; median 35.20 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.1% | 50.1% | 1.0% | 6.00 s |
| 2 | 49.9% | 49.9% | 1.0% | 6.00 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 12422 | 45.9% | 45.9% | 0.9% |
| Counter | 7260 | 54.5% | 54.5% | 1.0% |
| Pressure | 4572 | 49.4% | 49.4% | 1.2% |
| Brawler | 3120 | 51.4% | 51.5% | 1.2% |
| Paired | 2924 | 52.7% | 52.7% | 1.1% |
| Zoning | 5578 | 50.4% | 50.4% | 1.1% |
| Weapon | 1226 | 53.5% | 53.5% | 1.3% |
| Hover | 286 | 55.9% | 55.9% | 0.0% |

Damage: melee 28931539; projectile 1061222; special 691270; throw 529742.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 154 | 47.4% | 47.4% | 1.3% |
| aaron | Footwork | 158 | 39.7% | 39.7% | 1.3% |
| accidentallyrich | Counter | 136 | 55.2% | 55.2% | 1.5% |
| agentsproto | Brawler | 154 | 48.7% | 48.7% | 1.3% |
| aktree | Zoning | 144 | 47.9% | 47.9% | 1.4% |
| aleksander | Counter | 150 | 56.7% | 56.7% | 0.0% |
| alpha777 | Pressure | 150 | 52.7% | 52.7% | 1.3% |
| anni | Pressure | 136 | 50.8% | 50.8% | 2.9% |
| autistophrenicsprotagonist | Footwork | 134 | 49.3% | 49.3% | 0.0% |
| azkarah | Zoning | 132 | 46.9% | 46.9% | 1.5% |
| benjamin | Footwork | 152 | 39.5% | 39.5% | 0.0% |
| berserk | Footwork | 138 | 55.1% | 55.1% | 0.0% |
| bgbadger | Zoning | 144 | 47.2% | 47.2% | 0.0% |
| bidnehhh | Pressure | 140 | 54.3% | 54.3% | 0.0% |
| bigal | Brawler | 128 | 45.2% | 45.2% | 1.6% |
| bigswole | Brawler | 142 | 55.6% | 55.6% | 0.0% |
| bimba | Footwork | 142 | 43.6% | 43.6% | 1.4% |
| bitcoind1rk | Footwork | 168 | 36.0% | 36.0% | 2.4% |
| blorfo | Weapon | 156 | 54.5% | 54.5% | 1.3% |
| bobdobbs | Footwork | 154 | 34.2% | 34.2% | 1.3% |
| brainsprot | Footwork | 146 | 48.6% | 47.9% | 1.4% |
| bront | Brawler | 138 | 50.0% | 50.0% | 1.4% |
| bs9090eth | Zoning | 148 | 45.2% | 44.4% | 2.7% |
| buddhashadow | Footwork | 162 | 38.3% | 38.3% | 0.0% |
| cam | Brawler | 148 | 44.5% | 44.5% | 1.4% |
| cantankerous | Pressure | 124 | 54.8% | 54.8% | 0.0% |
| captain | Zoning | 142 | 39.4% | 39.4% | 0.0% |
| captainhowdy | Footwork | 144 | 46.5% | 46.5% | 0.0% |
| ceo | Zoning | 148 | 48.6% | 48.6% | 0.0% |
| chaton | Footwork | 146 | 50.7% | 50.7% | 1.4% |
| chonky | Footwork | 156 | 37.7% | 37.7% | 1.3% |
| chrisfowler | Counter | 126 | 50.8% | 50.8% | 1.6% |
| ciphersproto | Pressure | 154 | 52.0% | 52.0% | 1.3% |
| clobrwn | Footwork | 144 | 56.3% | 56.3% | 1.4% |
| contresens | Zoning | 148 | 60.1% | 60.1% | 0.0% |
| corn | Pressure | 148 | 50.0% | 50.0% | 2.7% |
| crapto | Zoning | 134 | 49.2% | 49.2% | 1.5% |
| crippledlover | Footwork | 146 | 56.3% | 56.3% | 1.4% |
| croy | Counter | 152 | 53.9% | 53.9% | 0.0% |
| crumpleii | Brawler | 158 | 57.7% | 58.1% | 1.9% |
| cryptobartender | Zoning | 148 | 64.2% | 64.2% | 0.0% |
| cryptoboy | Counter | 146 | 47.9% | 47.9% | 0.0% |
| cryptomonger | Footwork | 132 | 47.7% | 48.1% | 0.8% |
| cryptorizzler | Counter | 168 | 50.0% | 50.0% | 2.4% |
| cryptoviking420 | Pressure | 162 | 38.3% | 38.3% | 0.0% |
| cyberviber | Counter | 170 | 52.9% | 52.9% | 0.0% |
| d86 | Zoning | 168 | 38.0% | 38.0% | 1.2% |
| danocrypto | Counter | 140 | 63.8% | 64.2% | 2.1% |
| davidcd | Footwork | 146 | 51.4% | 50.7% | 1.4% |
| degenpress | Zoning | 148 | 50.7% | 51.0% | 0.7% |
| dollarbitcoin | Brawler | 136 | 53.0% | 53.4% | 3.7% |
| drzmoody | Footwork | 154 | 50.7% | 50.3% | 1.9% |
| dumpstar | Brawler | 144 | 45.8% | 45.8% | 0.0% |
| duo | Paired | 164 | 54.3% | 54.0% | 0.6% |
| durlan | Footwork | 158 | 39.7% | 39.7% | 1.3% |
| emix | Footwork | 140 | 44.3% | 44.3% | 0.0% |
| erik | Footwork | 130 | 43.8% | 43.8% | 1.5% |
| familywagon | Brawler | 150 | 45.9% | 45.9% | 2.7% |
| feistyboi | Counter | 134 | 57.7% | 57.7% | 3.0% |
| felixsprotoarc | Zoning | 146 | 47.9% | 47.5% | 4.8% |
| fiatfudder | Counter | 138 | 53.6% | 53.6% | 0.0% |
| forchaneth | Footwork | 128 | 57.3% | 57.3% | 3.1% |
| fplgremlin | Pressure | 144 | 39.4% | 39.7% | 2.1% |
| freedfrida | Footwork | 146 | 50.7% | 50.7% | 0.0% |
| frej | Counter | 140 | 61.6% | 61.6% | 1.4% |
| freshprince | Counter | 162 | 51.2% | 51.2% | 1.2% |
| ghostsprotocol | Zoning | 142 | 53.5% | 53.5% | 0.0% |
| giavannykitchens | Pressure | 140 | 56.5% | 56.5% | 1.4% |
| glow | Counter | 156 | 52.6% | 53.2% | 1.3% |
| gluttony | Zoning | 138 | 57.2% | 57.5% | 2.9% |
| godether | Counter | 134 | 48.5% | 48.5% | 3.0% |
| godmod3d | Paired | 136 | 47.8% | 48.1% | 0.7% |
| godsson | Counter | 154 | 58.4% | 58.4% | 0.0% |
| gpm | Brawler | 154 | 53.9% | 53.9% | 1.3% |
| greatcharly | Footwork | 150 | 40.0% | 40.0% | 0.0% |
| gryph | Paired | 130 | 57.7% | 57.5% | 2.3% |
| guest07 | Pressure | 154 | 47.3% | 47.3% | 2.6% |
| guest08 | Zoning | 170 | 41.2% | 41.2% | 0.0% |
| guest09 | Pressure | 142 | 52.1% | 51.8% | 0.7% |
| guest10 | Zoning | 138 | 50.7% | 50.7% | 1.4% |
| guest11 | Counter | 144 | 44.3% | 44.3% | 2.8% |
| guest12 | Zoning | 140 | 52.9% | 52.9% | 0.0% |
| guest13 | Counter | 156 | 57.7% | 58.1% | 0.6% |
| guest14 | Counter | 174 | 68.0% | 68.0% | 1.1% |
| hdizzy | Zoning | 134 | 61.9% | 61.9% | 0.0% |
| herbpowell | Counter | 126 | 52.4% | 52.0% | 0.8% |
| hermionemichelleamyrose | Footwork | 138 | 46.4% | 46.4% | 0.0% |
| highsproto | Zoning | 162 | 43.1% | 43.1% | 1.2% |
| homosproto | Footwork | 166 | 41.0% | 41.0% | 0.0% |
| indiapolice | Counter | 148 | 55.4% | 55.1% | 0.7% |
| infinitysplitter | Footwork | 150 | 49.3% | 49.3% | 0.0% |
| isaac | Footwork | 154 | 46.8% | 46.8% | 0.0% |
| jameskaminski | Pressure | 156 | 62.8% | 62.8% | 0.0% |
| janitor | Brawler | 158 | 52.5% | 52.5% | 0.0% |
| jasper | Footwork | 138 | 52.2% | 51.5% | 2.9% |
| jayquant | Counter | 144 | 52.1% | 52.1% | 1.4% |
| johnson | Brawler | 144 | 61.8% | 61.8% | 0.0% |
| julian | Counter | 170 | 53.5% | 53.5% | 0.0% |
| kern | Counter | 144 | 58.5% | 58.5% | 1.4% |
| kerrieanne | Counter | 144 | 63.9% | 64.3% | 0.7% |
| laserbach | Pressure | 138 | 48.5% | 48.5% | 1.4% |
| lestrange | Footwork | 146 | 45.9% | 45.9% | 0.0% |
| leviosa | Footwork | 140 | 55.0% | 55.0% | 0.0% |
| lifeisameme | Pressure | 146 | 52.7% | 52.7% | 0.0% |
| lilgoldied | Counter | 156 | 58.4% | 58.4% | 1.3% |
| loadthebags | Pressure | 166 | 43.4% | 43.4% | 0.0% |
| loqi | Counter | 138 | 53.6% | 53.6% | 0.0% |
| lowernipple | Zoning | 154 | 44.2% | 44.2% | 0.0% |
| mandela | Weapon | 148 | 50.7% | 50.7% | 2.7% |
| marfrog | Footwork | 146 | 44.4% | 44.4% | 1.4% |
| maxbiggums | Brawler | 144 | 48.6% | 48.6% | 1.4% |
| melo | Weapon | 156 | 50.0% | 50.0% | 2.6% |
| michael | Weapon | 156 | 45.5% | 45.5% | 1.3% |
| micsash | Counter | 142 | 49.3% | 49.3% | 0.0% |
| mikemike | Brawler | 164 | 44.4% | 44.4% | 2.4% |
| mildtacos | Footwork | 136 | 55.3% | 55.3% | 2.9% |
| mlk | Counter | 142 | 52.2% | 52.2% | 2.8% |
| moonshiller | Brawler | 152 | 61.2% | 61.2% | 0.0% |
| mox | Counter | 152 | 53.3% | 53.3% | 0.0% |
| mrgoldrobe | Counter | 142 | 62.9% | 62.9% | 1.4% |
| mrhorsemeat | Counter | 180 | 62.2% | 62.2% | 0.0% |
| nate | Pressure | 144 | 57.9% | 57.9% | 2.8% |
| nick | Pressure | 150 | 54.1% | 54.1% | 1.3% |
| nomis | Pressure | 142 | 35.9% | 35.9% | 0.0% |
| nosmileclown | Paired | 150 | 52.0% | 52.0% | 0.0% |
| np | Footwork | 178 | 46.6% | 46.6% | 0.0% |
| obamasega420 | Footwork | 150 | 42.7% | 42.7% | 0.0% |
| olnoname | Footwork | 140 | 39.3% | 39.3% | 0.0% |
| onememeaday | Pressure | 158 | 48.1% | 48.1% | 1.3% |
| osho | Footwork | 152 | 53.9% | 53.9% | 0.0% |
| otorps | Counter | 146 | 54.8% | 54.8% | 0.0% |
| pars | Brawler | 164 | 50.0% | 50.0% | 0.0% |
| peterpan | Paired | 140 | 50.7% | 50.7% | 4.3% |
| pilgrim | Brawler | 144 | 54.9% | 54.9% | 1.4% |
| pinewaffle | Pressure | 150 | 53.3% | 53.3% | 0.0% |
| pirate | Footwork | 138 | 47.1% | 47.1% | 0.0% |
| pongohpos10i | Zoning | 158 | 53.2% | 53.2% | 1.3% |
| potocaicai | Counter | 154 | 38.8% | 39.3% | 2.6% |
| pr0lificeth | Zoning | 158 | 55.8% | 55.8% | 1.3% |
| prim | Zoning | 138 | 41.2% | 41.2% | 1.4% |
| rainman | Footwork | 150 | 46.6% | 46.6% | 2.7% |
| razz | Counter | 144 | 64.3% | 64.3% | 2.8% |
| realityarchitect | Counter | 146 | 49.3% | 49.3% | 1.4% |
| rektina | Footwork | 134 | 53.8% | 53.8% | 3.0% |
| renzo | Pressure | 148 | 38.5% | 38.5% | 0.0% |
| reverend | Footwork | 146 | 49.3% | 48.6% | 2.7% |
| rivet | Pressure | 116 | 53.4% | 53.4% | 0.0% |
| rlarsson | Footwork | 146 | 44.4% | 44.8% | 2.1% |
| rmacpdx | Footwork | 152 | 44.7% | 44.7% | 1.3% |
| rune | Counter | 146 | 48.6% | 48.6% | 1.4% |
| saburdo | Pressure | 168 | 56.1% | 56.1% | 2.4% |
| samixsproto | Zoning | 138 | 55.1% | 55.5% | 0.7% |
| satoshi | Pressure | 132 | 42.4% | 42.4% | 0.0% |
| seph0x | Counter | 148 | 48.6% | 48.6% | 0.0% |
| sidelinereferee | Zoning | 142 | 58.5% | 58.5% | 0.0% |
| sirbitcoin | Counter | 140 | 55.1% | 55.1% | 1.4% |
| sirdidit | Footwork | 142 | 47.2% | 47.2% | 0.0% |
| sisma | Pressure | 144 | 48.6% | 49.3% | 2.8% |
| slabcorn | Brawler | 138 | 45.7% | 45.7% | 0.0% |
| slakesly | Counter | 148 | 62.2% | 62.2% | 0.0% |
| sober | Footwork | 154 | 48.1% | 48.1% | 0.0% |
| solanadelray | Paired | 144 | 54.9% | 54.2% | 1.4% |
| sprog | Footwork | 150 | 47.3% | 47.3% | 0.0% |
| sproteth | Footwork | 144 | 51.4% | 51.4% | 0.0% |
| sproto1011 | Weapon | 158 | 56.4% | 56.4% | 1.3% |
| sproto102 | Footwork | 154 | 50.7% | 50.7% | 1.3% |
| sproto1093 | Footwork | 134 | 46.2% | 45.8% | 2.2% |
| sproto1187 | Footwork | 166 | 45.8% | 45.8% | 0.0% |
| sproto1335 | Footwork | 144 | 45.8% | 45.8% | 0.0% |
| sproto1345 | Footwork | 148 | 45.3% | 45.3% | 0.0% |
| sproto1414 | Footwork | 162 | 51.2% | 51.2% | 1.2% |
| sproto1477 | Footwork | 158 | 42.9% | 42.9% | 1.3% |
| sproto1499 | Paired | 154 | 51.3% | 51.3% | 0.0% |
| sproto1601 | Zoning | 148 | 45.9% | 45.9% | 1.4% |
| sproto1625 | Paired | 148 | 56.8% | 56.6% | 2.0% |
| sproto1668 | Footwork | 162 | 45.1% | 45.1% | 0.0% |
| sproto1815 | Weapon | 164 | 55.5% | 55.5% | 0.0% |
| sproto1870 | Hover | 140 | 51.4% | 51.4% | 0.0% |
| sproto2010 | Paired | 134 | 59.1% | 58.8% | 2.2% |
| sproto2075 | Paired | 150 | 44.0% | 44.0% | 0.0% |
| sproto2101 | Footwork | 134 | 47.0% | 47.7% | 1.5% |
| sproto215 | Footwork | 140 | 38.6% | 39.1% | 1.4% |
| sproto2177 | Footwork | 162 | 42.6% | 40.8% | 3.1% |
| sproto2210 | Paired | 142 | 54.9% | 54.6% | 0.7% |
| sproto2322 | Footwork | 156 | 42.3% | 42.3% | 0.0% |
| sproto2344 | Paired | 152 | 59.3% | 59.3% | 1.3% |
| sproto2381 | Footwork | 148 | 47.3% | 46.9% | 0.7% |
| sproto2531 | Zoning | 152 | 48.0% | 48.0% | 2.6% |
| sproto2569 | Footwork | 134 | 46.3% | 46.6% | 0.7% |
| sproto2616 | Weapon | 144 | 56.3% | 56.3% | 1.4% |
| sproto2789 | Weapon | 144 | 59.0% | 59.0% | 0.0% |
| sproto282 | Paired | 150 | 54.7% | 54.7% | 1.3% |
| sproto2884 | Footwork | 146 | 51.4% | 51.4% | 1.4% |
| sproto3106 | Zoning | 132 | 59.1% | 59.1% | 0.0% |
| sproto313 | Footwork | 136 | 41.0% | 41.0% | 1.5% |
| sproto3152 | Zoning | 152 | 44.1% | 44.1% | 0.0% |
| sproto3181 | Paired | 150 | 59.3% | 59.3% | 0.0% |
| sproto3215 | Footwork | 150 | 51.3% | 51.3% | 0.0% |
| sproto3224 | Paired | 144 | 58.3% | 58.5% | 1.4% |
| sproto3235 | Paired | 154 | 38.3% | 38.3% | 0.0% |
| sproto651 | Footwork | 134 | 32.1% | 32.6% | 1.5% |
| sproto704 | Paired | 140 | 43.6% | 44.2% | 1.4% |
| sproto763 | Footwork | 152 | 44.1% | 44.1% | 0.0% |
| sproto818 | Footwork | 128 | 31.7% | 31.7% | 1.6% |
| sproto831 | Footwork | 130 | 50.0% | 50.0% | 0.0% |
| sproto832 | Paired | 144 | 58.3% | 58.3% | 0.0% |
| sproto834 | Footwork | 122 | 44.3% | 43.3% | 1.6% |
| sproto837 | Footwork | 144 | 36.1% | 36.1% | 0.0% |
| sproto865 | Footwork | 140 | 45.7% | 45.7% | 0.0% |
| sproto943 | Footwork | 130 | 46.2% | 46.2% | 0.0% |
| sproto999 | Footwork | 156 | 48.7% | 48.7% | 0.0% |
| sprotocius | Counter | 146 | 61.0% | 61.0% | 0.0% |
| sprotolg | Zoning | 146 | 55.5% | 55.5% | 0.0% |
| sprotomichaelsaylor | Zoning | 132 | 66.4% | 66.4% | 3.0% |
| sprotomidnightfx | Pressure | 160 | 57.7% | 57.4% | 3.1% |
| sprotopia | Zoning | 138 | 53.7% | 54.1% | 2.2% |
| sprotopotamus | Brawler | 158 | 57.7% | 57.7% | 1.3% |
| sprotosales | Footwork | 136 | 44.9% | 44.9% | 0.0% |
| sprotosurvivor | Zoning | 146 | 47.9% | 47.9% | 2.7% |
| spruto | Footwork | 138 | 50.0% | 50.4% | 2.2% |
| spunow | Footwork | 126 | 46.0% | 46.8% | 1.6% |
| stonkyleg69 | Footwork | 146 | 33.8% | 33.8% | 2.7% |
| stoto | Pressure | 166 | 48.2% | 48.2% | 1.2% |
| sweatpantstrust | Counter | 140 | 51.4% | 51.4% | 1.4% |
| tdeth | Pressure | 140 | 44.3% | 44.3% | 0.0% |
| teahupoo | Counter | 138 | 43.5% | 43.5% | 0.0% |
| theo | Zoning | 162 | 51.2% | 51.2% | 1.2% |
| thesprotowholivedeth | Zoning | 146 | 47.2% | 47.2% | 1.4% |
| thxobama | Counter | 140 | 52.9% | 52.9% | 1.4% |
| tingsmol | Footwork | 138 | 53.6% | 53.6% | 0.0% |
| tradertimmy | Counter | 144 | 54.9% | 55.6% | 1.4% |
| twinnyneutron | Paired | 146 | 50.0% | 49.7% | 0.7% |
| uncmasterflex | Footwork | 156 | 49.4% | 49.4% | 0.0% |
| urmometh | Footwork | 140 | 41.4% | 42.3% | 2.1% |
| usedtowels | Counter | 158 | 49.4% | 49.0% | 0.6% |
| vamp | Zoning | 152 | 49.3% | 49.3% | 0.0% |
| vaudream | Hover | 146 | 60.3% | 60.3% | 0.0% |
| vela | Zoning | 158 | 39.7% | 40.0% | 1.9% |
| veryseriousinvestor | Footwork | 144 | 45.1% | 45.1% | 1.4% |
| vicoo | Counter | 150 | 54.7% | 54.7% | 1.3% |
| vitaliketh | Footwork | 156 | 46.2% | 46.2% | 0.0% |
| wifebeater | Brawler | 146 | 53.5% | 53.5% | 1.4% |
| willuminati | Counter | 150 | 50.7% | 50.0% | 1.3% |
| wireitwell | Pressure | 148 | 45.9% | 45.9% | 1.4% |
| wyrmblvnt | Footwork | 156 | 45.5% | 45.5% | 0.0% |
| xalt | Zoning | 152 | 62.2% | 62.2% | 2.6% |
| xav | Footwork | 140 | 39.3% | 39.3% | 0.0% |
| yusuf | Pressure | 144 | 54.9% | 54.9% | 1.4% |
| zakarum | Footwork | 158 | 49.4% | 49.4% | 0.0% |
| zebracorn | Counter | 164 | 55.6% | 55.3% | 1.8% |
| zephyr | Brawler | 156 | 48.1% | 48.1% | 1.3% |
| zepump | Paired | 152 | 50.7% | 51.0% | 2.0% |
| zippy | Pressure | 162 | 38.6% | 38.6% | 2.5% |
| zudi | Counter | 150 | 59.3% | 59.3% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 2 | 100.0% |
| 86gwei vs alpha777 | 2 | 100.0% |
| 86gwei vs bidnehhh | 2 | 0.0% |
| 86gwei vs bitcoind1rk | 2 | 100.0% |
| 86gwei vs bront | 2 | 100.0% |
| 86gwei vs buddhashadow | 2 | 0.0% |
| 86gwei vs cam | 2 | 100.0% |
| 86gwei vs ciphersproto | 2 | 100.0% |
| 86gwei vs croy | 2 | 0.0% |
| 86gwei vs drzmoody | 2 | 100.0% |

