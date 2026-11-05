# Balance tournament

Source: `efb5829c1230dac84337ba0212d92a84a527563b`; simulation `a4c7ddde49ec5a64`; source SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`.

Seed 20261105; 254 fighters; 4184 sampled pairs; 2 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes use canonical BALANCE_KITS assignments when available; legacy cores use analysis groupings of existing roles. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 4

16736 bouts; raw draws 0.0% (5); unresolved 0.0% (4); timeouts 0. Mean 28.09 s; median 28.18 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 50.0% | 0.0% | 5.14 s |
| 2 | 50.0% | 50.0% | 0.0% | 5.14 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 11092 | 53.9% | 53.9% | 0.0% |
| Counter | 6632 | 51.7% | 51.7% | 0.0% |
| Pressure | 4064 | 45.9% | 45.9% | 0.0% |
| Zoning | 4964 | 49.8% | 49.8% | 0.0% |
| Paired | 2592 | 44.2% | 44.2% | 0.0% |
| Weapon | 1148 | 49.6% | 49.6% | 0.0% |
| Brawler | 2732 | 42.6% | 42.6% | 0.1% |
| Hover | 248 | 46.0% | 46.0% | 0.0% |

Damage: melee 16889544; projectile 7088531; special 1195706; throw 1700096.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 128 | 44.5% | 44.5% | 0.0% |
| aaron | Footwork | 144 | 45.1% | 45.1% | 0.0% |
| accidentallyrich | Counter | 124 | 55.6% | 55.6% | 0.0% |
| agentsproto | Brawler | 104 | 40.4% | 40.4% | 0.0% |
| aktree | Zoning | 112 | 28.6% | 28.6% | 0.0% |
| aleksander | Counter | 116 | 53.4% | 53.4% | 0.0% |
| alpha777 | Pressure | 128 | 42.2% | 42.2% | 0.0% |
| anni | Pressure | 116 | 55.2% | 55.2% | 0.0% |
| autistophrenicsprotagonist | Footwork | 116 | 51.7% | 51.7% | 0.0% |
| azkarah | Zoning | 92 | 32.6% | 32.6% | 0.0% |
| benjamin | Footwork | 144 | 52.1% | 52.1% | 0.0% |
| berserk | Footwork | 120 | 59.2% | 59.2% | 0.0% |
| bgbadger | Zoning | 96 | 38.5% | 38.5% | 0.0% |
| bidnehhh | Pressure | 116 | 43.1% | 43.1% | 0.0% |
| bigal | Brawler | 120 | 33.3% | 33.3% | 0.0% |
| bigswole | Brawler | 112 | 51.8% | 51.8% | 0.0% |
| bimba | Footwork | 140 | 58.6% | 58.6% | 0.0% |
| bitcoind1rk | Footwork | 164 | 58.5% | 58.5% | 0.0% |
| blorfo | Weapon | 168 | 47.0% | 47.0% | 0.0% |
| bobdobbs | Footwork | 152 | 48.7% | 48.7% | 0.0% |
| brainsprot | Footwork | 132 | 61.4% | 61.4% | 0.0% |
| bront | Brawler | 100 | 45.0% | 45.0% | 0.0% |
| bs9090eth | Zoning | 112 | 48.2% | 48.2% | 0.0% |
| buddhashadow | Footwork | 140 | 58.6% | 58.6% | 0.0% |
| cam | Brawler | 132 | 40.2% | 40.2% | 0.0% |
| cantankerous | Pressure | 88 | 34.1% | 34.1% | 0.0% |
| captain | Zoning | 148 | 60.8% | 60.8% | 0.0% |
| captainhowdy | Footwork | 124 | 62.1% | 62.1% | 0.0% |
| ceo | Zoning | 112 | 45.5% | 45.5% | 0.0% |
| chaton | Footwork | 120 | 58.3% | 58.3% | 0.0% |
| chonky | Footwork | 152 | 55.9% | 55.9% | 0.0% |
| chrisfowler | Counter | 116 | 50.0% | 50.0% | 0.0% |
| ciphersproto | Pressure | 160 | 51.9% | 51.9% | 0.0% |
| clobrwn | Footwork | 144 | 52.8% | 52.8% | 0.0% |
| contresens | Zoning | 108 | 57.4% | 57.4% | 0.0% |
| corn | Pressure | 140 | 42.1% | 42.1% | 0.0% |
| crapto | Zoning | 132 | 58.3% | 58.3% | 0.0% |
| crippledlover | Footwork | 120 | 50.0% | 50.0% | 0.0% |
| croy | Counter | 156 | 43.6% | 43.6% | 0.0% |
| crumpleii | Brawler | 120 | 35.8% | 35.8% | 0.0% |
| cryptobartender | Zoning | 140 | 40.7% | 40.7% | 0.0% |
| cryptoboy | Counter | 100 | 64.0% | 64.0% | 0.0% |
| cryptomonger | Footwork | 132 | 56.8% | 56.8% | 0.0% |
| cryptorizzler | Counter | 140 | 47.1% | 47.1% | 0.0% |
| cryptoviking420 | Pressure | 136 | 48.5% | 48.5% | 1.5% |
| cyberviber | Counter | 140 | 56.4% | 56.4% | 0.0% |
| d86 | Zoning | 128 | 45.3% | 45.3% | 0.0% |
| danocrypto | Counter | 140 | 51.4% | 51.1% | 0.7% |
| davidcd | Footwork | 124 | 58.9% | 58.9% | 0.0% |
| degenpress | Zoning | 128 | 46.9% | 46.9% | 0.0% |
| dollarbitcoin | Brawler | 120 | 36.7% | 36.7% | 0.0% |
| drzmoody | Footwork | 156 | 39.1% | 39.1% | 0.0% |
| dumpstar | Brawler | 112 | 56.4% | 56.4% | 1.8% |
| duo | Paired | 164 | 45.1% | 45.1% | 0.0% |
| durlan | Footwork | 160 | 63.7% | 63.7% | 0.0% |
| emix | Footwork | 124 | 56.5% | 56.5% | 0.0% |
| erik | Footwork | 112 | 51.8% | 51.8% | 0.0% |
| familywagon | Brawler | 152 | 38.2% | 38.2% | 0.0% |
| feistyboi | Counter | 116 | 56.0% | 56.0% | 0.0% |
| felixsprotoarc | Zoning | 124 | 51.6% | 51.6% | 0.0% |
| fiatfudder | Counter | 124 | 53.2% | 53.2% | 0.0% |
| forchaneth | Footwork | 108 | 57.4% | 57.4% | 0.0% |
| fplgremlin | Pressure | 116 | 47.4% | 47.4% | 0.0% |
| freedfrida | Footwork | 140 | 51.4% | 51.4% | 0.0% |
| frej | Counter | 112 | 51.8% | 51.8% | 0.0% |
| freshprince | Counter | 156 | 54.5% | 54.5% | 0.0% |
| ghostsprotocol | Zoning | 124 | 58.1% | 58.1% | 0.0% |
| giavannykitchens | Pressure | 148 | 50.0% | 50.0% | 0.0% |
| glow | Counter | 144 | 56.9% | 56.9% | 0.0% |
| gluttony | Zoning | 140 | 51.4% | 51.4% | 0.0% |
| godether | Counter | 124 | 54.0% | 54.0% | 0.0% |
| godmod3d | Paired | 112 | 43.8% | 43.8% | 0.0% |
| godsson | Counter | 156 | 53.8% | 53.8% | 0.0% |
| gpm | Brawler | 136 | 33.1% | 33.1% | 0.0% |
| greatcharly | Footwork | 136 | 66.2% | 66.2% | 0.0% |
| gryph | Paired | 120 | 42.5% | 42.5% | 0.0% |
| guest07 | Pressure | 148 | 48.0% | 48.0% | 0.0% |
| guest08 | Zoning | 180 | 49.4% | 49.4% | 0.0% |
| guest09 | Pressure | 108 | 46.3% | 46.3% | 0.0% |
| guest10 | Zoning | 124 | 58.1% | 58.1% | 0.0% |
| guest11 | Counter | 156 | 51.3% | 51.3% | 0.0% |
| guest12 | Zoning | 136 | 62.5% | 62.5% | 0.0% |
| guest13 | Counter | 124 | 64.5% | 64.5% | 0.0% |
| guest14 | Counter | 152 | 53.9% | 53.9% | 0.0% |
| hdizzy | Zoning | 124 | 61.3% | 61.3% | 0.0% |
| herbpowell | Counter | 120 | 61.7% | 61.7% | 0.0% |
| hermionemichelleamyrose | Footwork | 124 | 50.0% | 50.0% | 0.0% |
| highsproto | Zoning | 144 | 44.4% | 44.4% | 0.0% |
| homosproto | Footwork | 160 | 45.0% | 45.0% | 0.0% |
| indiapolice | Counter | 148 | 50.0% | 50.0% | 0.0% |
| infinitysplitter | Footwork | 148 | 62.2% | 62.2% | 0.0% |
| isaac | Footwork | 144 | 50.0% | 50.0% | 0.0% |
| jameskaminski | Pressure | 136 | 45.6% | 45.6% | 0.0% |
| janitor | Brawler | 156 | 34.0% | 34.0% | 0.0% |
| jasper | Footwork | 132 | 61.4% | 61.4% | 0.0% |
| jayquant | Counter | 132 | 47.0% | 47.0% | 0.0% |
| johnson | Brawler | 136 | 39.0% | 39.0% | 0.0% |
| julian | Counter | 180 | 54.4% | 54.4% | 0.0% |
| kern | Counter | 140 | 48.6% | 48.6% | 0.0% |
| kerrieanne | Counter | 132 | 49.2% | 49.2% | 0.0% |
| laserbach | Pressure | 112 | 35.7% | 35.7% | 0.0% |
| lestrange | Footwork | 120 | 47.5% | 47.5% | 0.0% |
| leviosa | Footwork | 120 | 58.3% | 58.3% | 0.0% |
| lifeisameme | Pressure | 136 | 52.9% | 52.9% | 0.0% |
| lilgoldied | Counter | 128 | 41.4% | 41.4% | 0.0% |
| loadthebags | Pressure | 148 | 52.7% | 52.7% | 0.0% |
| loqi | Counter | 136 | 56.6% | 56.6% | 0.0% |
| lowernipple | Zoning | 160 | 40.0% | 40.0% | 0.0% |
| mandela | Weapon | 124 | 54.8% | 54.8% | 0.0% |
| marfrog | Footwork | 132 | 54.5% | 54.5% | 0.0% |
| maxbiggums | Brawler | 116 | 46.6% | 46.6% | 0.0% |
| melo | Weapon | 152 | 47.4% | 47.4% | 0.0% |
| michael | Weapon | 144 | 46.5% | 46.5% | 0.0% |
| micsash | Counter | 132 | 63.6% | 63.6% | 0.0% |
| mikemike | Brawler | 136 | 42.6% | 42.6% | 0.0% |
| mildtacos | Footwork | 108 | 51.9% | 51.9% | 0.0% |
| mlk | Counter | 116 | 40.5% | 40.5% | 0.0% |
| moonshiller | Brawler | 124 | 45.2% | 45.2% | 0.0% |
| mox | Counter | 104 | 74.0% | 74.0% | 0.0% |
| mrgoldrobe | Counter | 148 | 46.6% | 46.6% | 0.0% |
| mrhorsemeat | Counter | 172 | 45.9% | 45.9% | 0.0% |
| nate | Pressure | 132 | 50.8% | 50.8% | 0.0% |
| nick | Pressure | 124 | 53.2% | 53.2% | 0.0% |
| nomis | Pressure | 120 | 48.3% | 48.3% | 0.0% |
| nosmileclown | Paired | 124 | 46.8% | 46.8% | 0.0% |
| np | Footwork | 148 | 52.7% | 52.7% | 0.0% |
| obamasega420 | Footwork | 140 | 59.3% | 59.3% | 0.0% |
| olnoname | Footwork | 124 | 46.8% | 46.8% | 0.0% |
| onememeaday | Pressure | 144 | 52.1% | 52.1% | 0.0% |
| osho | Footwork | 140 | 43.6% | 43.6% | 0.0% |
| otorps | Counter | 148 | 41.9% | 41.9% | 0.0% |
| pars | Brawler | 152 | 46.1% | 46.1% | 0.0% |
| peterpan | Paired | 120 | 46.7% | 46.7% | 0.0% |
| pilgrim | Brawler | 128 | 46.9% | 46.9% | 0.0% |
| pinewaffle | Pressure | 132 | 43.9% | 43.9% | 0.0% |
| pirate | Footwork | 136 | 51.5% | 51.5% | 0.0% |
| pongohpos10i | Zoning | 168 | 47.6% | 47.6% | 0.0% |
| potocaicai | Counter | 136 | 50.0% | 50.0% | 0.0% |
| pr0lificeth | Zoning | 128 | 50.0% | 50.0% | 0.0% |
| prim | Zoning | 108 | 51.9% | 51.9% | 0.0% |
| rainman | Footwork | 136 | 61.0% | 61.0% | 0.0% |
| razz | Counter | 124 | 36.3% | 36.3% | 0.0% |
| realityarchitect | Counter | 124 | 47.6% | 47.6% | 0.0% |
| rektina | Footwork | 88 | 56.8% | 56.8% | 0.0% |
| renzo | Pressure | 148 | 41.2% | 41.2% | 0.0% |
| reverend | Footwork | 124 | 45.2% | 45.2% | 0.0% |
| rivet | Pressure | 100 | 38.0% | 38.0% | 0.0% |
| rlarsson | Footwork | 144 | 59.7% | 59.7% | 0.0% |
| rmacpdx | Footwork | 148 | 45.3% | 45.3% | 0.0% |
| rune | Counter | 132 | 66.7% | 66.7% | 0.0% |
| saburdo | Pressure | 164 | 40.2% | 40.2% | 0.0% |
| samixsproto | Zoning | 112 | 50.9% | 50.9% | 0.0% |
| satoshi | Pressure | 112 | 34.8% | 34.8% | 0.0% |
| seph0x | Counter | 144 | 47.2% | 47.2% | 0.0% |
| sidelinereferee | Zoning | 148 | 51.4% | 51.4% | 0.0% |
| sirbitcoin | Counter | 120 | 39.2% | 39.2% | 0.0% |
| sirdidit | Footwork | 128 | 43.8% | 43.8% | 0.0% |
| sisma | Pressure | 132 | 27.3% | 27.3% | 0.0% |
| slabcorn | Brawler | 124 | 41.9% | 41.9% | 0.0% |
| slakesly | Counter | 136 | 45.6% | 45.6% | 0.0% |
| sober | Footwork | 124 | 59.0% | 59.0% | 1.6% |
| solanadelray | Paired | 116 | 48.3% | 48.3% | 0.0% |
| sprog | Footwork | 152 | 53.9% | 53.9% | 0.0% |
| sproteth | Footwork | 132 | 56.8% | 56.8% | 0.0% |
| sproto1011 | Weapon | 152 | 57.9% | 57.9% | 0.0% |
| sproto102 | Footwork | 136 | 48.5% | 48.5% | 0.0% |
| sproto1093 | Footwork | 136 | 52.9% | 52.9% | 0.0% |
| sproto1187 | Footwork | 144 | 67.4% | 67.4% | 0.0% |
| sproto1335 | Footwork | 124 | 57.3% | 57.3% | 0.0% |
| sproto1345 | Footwork | 124 | 59.7% | 59.7% | 0.0% |
| sproto1414 | Footwork | 132 | 53.0% | 53.0% | 0.0% |
| sproto1477 | Footwork | 144 | 45.8% | 45.8% | 0.0% |
| sproto1499 | Paired | 132 | 43.9% | 43.9% | 0.0% |
| sproto1601 | Zoning | 116 | 47.4% | 47.4% | 0.0% |
| sproto1625 | Paired | 132 | 41.7% | 41.7% | 0.0% |
| sproto1668 | Footwork | 152 | 59.2% | 59.2% | 0.0% |
| sproto1815 | Weapon | 144 | 51.4% | 51.4% | 0.0% |
| sproto1870 | Hover | 144 | 42.4% | 42.4% | 0.0% |
| sproto2010 | Paired | 124 | 46.0% | 46.0% | 0.0% |
| sproto2075 | Paired | 140 | 43.6% | 43.6% | 0.0% |
| sproto2101 | Footwork | 120 | 52.5% | 52.5% | 0.0% |
| sproto215 | Footwork | 112 | 62.5% | 62.5% | 0.0% |
| sproto2177 | Footwork | 160 | 64.4% | 64.4% | 0.0% |
| sproto2210 | Paired | 128 | 39.8% | 40.2% | 0.8% |
| sproto2322 | Footwork | 140 | 47.9% | 47.9% | 0.0% |
| sproto2344 | Paired | 144 | 41.7% | 41.7% | 0.0% |
| sproto2381 | Footwork | 120 | 53.3% | 53.3% | 0.0% |
| sproto2531 | Zoning | 140 | 55.0% | 55.0% | 0.0% |
| sproto2569 | Footwork | 124 | 54.8% | 54.8% | 0.0% |
| sproto2616 | Weapon | 120 | 43.3% | 43.3% | 0.0% |
| sproto2789 | Weapon | 144 | 47.9% | 47.9% | 0.0% |
| sproto282 | Paired | 140 | 40.7% | 40.7% | 0.0% |
| sproto2884 | Footwork | 100 | 50.0% | 50.0% | 0.0% |
| sproto3106 | Zoning | 148 | 45.9% | 45.9% | 0.0% |
| sproto313 | Footwork | 124 | 57.3% | 57.3% | 0.0% |
| sproto3152 | Zoning | 144 | 56.9% | 56.9% | 0.0% |
| sproto3181 | Paired | 136 | 49.3% | 49.3% | 0.0% |
| sproto3215 | Footwork | 128 | 53.1% | 53.1% | 0.0% |
| sproto3224 | Paired | 116 | 50.0% | 50.0% | 0.0% |
| sproto3235 | Paired | 140 | 35.0% | 35.0% | 0.0% |
| sproto651 | Footwork | 116 | 45.7% | 45.7% | 0.0% |
| sproto704 | Paired | 112 | 42.9% | 42.9% | 0.0% |
| sproto763 | Footwork | 136 | 55.9% | 55.9% | 0.0% |
| sproto818 | Footwork | 132 | 62.9% | 62.9% | 0.0% |
| sproto831 | Footwork | 104 | 47.1% | 47.1% | 0.0% |
| sproto832 | Paired | 132 | 45.5% | 45.5% | 0.0% |
| sproto834 | Footwork | 100 | 54.0% | 54.0% | 0.0% |
| sproto837 | Footwork | 136 | 53.7% | 53.7% | 0.0% |
| sproto865 | Footwork | 112 | 39.3% | 39.3% | 0.0% |
| sproto943 | Footwork | 124 | 48.4% | 48.4% | 0.0% |
| sproto999 | Footwork | 136 | 46.3% | 46.3% | 0.0% |
| sprotocius | Counter | 132 | 48.5% | 48.5% | 0.0% |
| sprotolg | Zoning | 136 | 58.1% | 58.1% | 0.0% |
| sprotomichaelsaylor | Zoning | 136 | 47.1% | 47.1% | 0.0% |
| sprotomidnightfx | Pressure | 140 | 51.4% | 51.4% | 0.0% |
| sprotopia | Zoning | 124 | 59.7% | 59.7% | 0.0% |
| sprotopotamus | Brawler | 148 | 41.2% | 41.2% | 0.0% |
| sprotosales | Footwork | 124 | 56.5% | 56.5% | 0.0% |
| sprotosurvivor | Zoning | 112 | 42.9% | 42.9% | 0.0% |
| spruto | Footwork | 108 | 55.6% | 55.6% | 0.0% |
| spunow | Footwork | 96 | 64.6% | 64.6% | 0.0% |
| stonkyleg69 | Footwork | 140 | 47.1% | 47.1% | 0.0% |
| stoto | Pressure | 144 | 51.4% | 51.4% | 0.0% |
| sweatpantstrust | Counter | 132 | 53.8% | 53.8% | 0.0% |
| tdeth | Pressure | 132 | 48.5% | 48.5% | 0.0% |
| teahupoo | Counter | 132 | 53.0% | 53.0% | 0.0% |
| theo | Zoning | 140 | 47.1% | 47.1% | 0.0% |
| thesprotowholivedeth | Zoning | 148 | 43.2% | 43.2% | 0.0% |
| thxobama | Counter | 132 | 54.5% | 54.5% | 0.0% |
| tingsmol | Footwork | 120 | 48.3% | 48.3% | 0.0% |
| tradertimmy | Counter | 140 | 53.6% | 53.6% | 0.0% |
| twinnyneutron | Paired | 132 | 50.8% | 50.8% | 0.0% |
| uncmasterflex | Footwork | 120 | 55.0% | 55.0% | 0.0% |
| urmometh | Footwork | 128 | 55.5% | 55.5% | 0.0% |
| usedtowels | Counter | 156 | 47.4% | 47.4% | 0.0% |
| vamp | Zoning | 120 | 61.7% | 61.7% | 0.0% |
| vaudream | Hover | 104 | 51.0% | 51.0% | 0.0% |
| vela | Zoning | 148 | 44.6% | 44.6% | 0.0% |
| veryseriousinvestor | Footwork | 140 | 47.9% | 47.9% | 0.0% |
| vicoo | Counter | 152 | 49.3% | 49.3% | 0.0% |
| vitaliketh | Footwork | 144 | 59.0% | 59.0% | 0.0% |
| wifebeater | Brawler | 152 | 49.3% | 49.3% | 0.0% |
| willuminati | Counter | 132 | 53.8% | 53.8% | 1.5% |
| wireitwell | Pressure | 136 | 46.3% | 46.3% | 0.0% |
| wyrmblvnt | Footwork | 140 | 50.0% | 50.0% | 0.0% |
| xalt | Zoning | 124 | 46.8% | 46.8% | 0.0% |
| xav | Footwork | 108 | 58.3% | 58.3% | 0.0% |
| yusuf | Pressure | 132 | 46.2% | 46.2% | 0.0% |
| zakarum | Footwork | 124 | 53.2% | 53.2% | 0.0% |
| zebracorn | Counter | 152 | 53.3% | 53.3% | 0.0% |
| zephyr | Brawler | 152 | 53.9% | 53.9% | 0.0% |
| zepump | Paired | 128 | 41.4% | 41.4% | 0.0% |
| zippy | Pressure | 136 | 42.6% | 42.6% | 0.0% |
| zudi | Counter | 124 | 51.6% | 51.6% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 4 | 0.0% |
| 86gwei vs feistyboi | 4 | 0.0% |
| 86gwei vs gluttony | 4 | 100.0% |
| 86gwei vs mildtacos | 4 | 0.0% |
| 86gwei vs mox | 4 | 0.0% |
| 86gwei vs np | 4 | 0.0% |
| 86gwei vs pongohpos10i | 4 | 100.0% |
| 86gwei vs sproto704 | 4 | 100.0% |
| 86gwei vs sproto834 | 4 | 0.0% |
| 86gwei vs spruto | 4 | 0.0% |

## Skill 7

16736 bouts; raw draws 0.0% (3); unresolved 0.0% (0); timeouts 2. Mean 32.60 s; median 32.48 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.1% | 50.1% | 0.0% | 5.67 s |
| 2 | 49.9% | 49.9% | 0.0% | 5.67 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 11092 | 50.5% | 50.5% | 0.0% |
| Counter | 6632 | 50.1% | 50.0% | 0.0% |
| Pressure | 4064 | 48.4% | 48.4% | 0.0% |
| Zoning | 4964 | 52.1% | 52.1% | 0.0% |
| Paired | 2592 | 48.4% | 48.4% | 0.0% |
| Weapon | 1148 | 46.4% | 46.4% | 0.0% |
| Brawler | 2732 | 50.2% | 50.2% | 0.1% |
| Hover | 248 | 43.1% | 43.1% | 0.0% |

Damage: melee 17194960; projectile 6605974; special 1605411; throw 1179461.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 128 | 51.6% | 51.6% | 0.0% |
| aaron | Footwork | 144 | 54.2% | 54.2% | 0.0% |
| accidentallyrich | Counter | 124 | 51.6% | 51.6% | 0.0% |
| agentsproto | Brawler | 104 | 44.2% | 44.2% | 0.0% |
| aktree | Zoning | 112 | 37.5% | 37.5% | 0.0% |
| aleksander | Counter | 116 | 56.9% | 56.9% | 0.0% |
| alpha777 | Pressure | 128 | 47.7% | 47.7% | 0.0% |
| anni | Pressure | 116 | 43.1% | 43.1% | 0.0% |
| autistophrenicsprotagonist | Footwork | 116 | 48.3% | 48.3% | 0.0% |
| azkarah | Zoning | 92 | 56.5% | 56.5% | 0.0% |
| benjamin | Footwork | 144 | 45.1% | 45.1% | 0.0% |
| berserk | Footwork | 120 | 48.3% | 48.3% | 0.0% |
| bgbadger | Zoning | 96 | 42.7% | 42.7% | 0.0% |
| bidnehhh | Pressure | 116 | 51.7% | 51.7% | 0.0% |
| bigal | Brawler | 120 | 40.8% | 40.8% | 0.0% |
| bigswole | Brawler | 112 | 37.5% | 37.5% | 0.0% |
| bimba | Footwork | 140 | 49.3% | 49.3% | 0.0% |
| bitcoind1rk | Footwork | 164 | 46.3% | 46.3% | 0.0% |
| blorfo | Weapon | 168 | 50.6% | 50.6% | 0.0% |
| bobdobbs | Footwork | 152 | 52.6% | 52.6% | 0.0% |
| brainsprot | Footwork | 132 | 40.2% | 40.2% | 0.0% |
| bront | Brawler | 100 | 43.0% | 43.0% | 0.0% |
| bs9090eth | Zoning | 112 | 52.7% | 52.7% | 0.0% |
| buddhashadow | Footwork | 140 | 53.6% | 53.6% | 0.0% |
| cam | Brawler | 132 | 42.4% | 42.4% | 0.0% |
| cantankerous | Pressure | 88 | 38.6% | 38.6% | 0.0% |
| captain | Zoning | 148 | 56.1% | 56.1% | 0.0% |
| captainhowdy | Footwork | 124 | 53.2% | 53.2% | 0.0% |
| ceo | Zoning | 112 | 48.2% | 48.2% | 0.0% |
| chaton | Footwork | 120 | 53.3% | 53.3% | 0.0% |
| chonky | Footwork | 152 | 50.7% | 50.7% | 0.0% |
| chrisfowler | Counter | 116 | 44.8% | 44.8% | 0.0% |
| ciphersproto | Pressure | 160 | 47.5% | 47.5% | 0.0% |
| clobrwn | Footwork | 144 | 50.0% | 50.0% | 0.0% |
| contresens | Zoning | 108 | 45.4% | 45.4% | 0.0% |
| corn | Pressure | 140 | 55.7% | 55.7% | 0.0% |
| crapto | Zoning | 132 | 72.0% | 72.5% | 0.8% |
| crippledlover | Footwork | 120 | 50.8% | 50.8% | 0.0% |
| croy | Counter | 156 | 48.7% | 48.7% | 0.0% |
| crumpleii | Brawler | 120 | 51.7% | 51.7% | 0.0% |
| cryptobartender | Zoning | 140 | 52.1% | 52.1% | 0.0% |
| cryptoboy | Counter | 100 | 54.0% | 54.0% | 0.0% |
| cryptomonger | Footwork | 132 | 56.8% | 56.8% | 0.0% |
| cryptorizzler | Counter | 140 | 46.4% | 46.4% | 0.0% |
| cryptoviking420 | Pressure | 136 | 42.6% | 42.6% | 0.0% |
| cyberviber | Counter | 140 | 51.4% | 51.4% | 0.0% |
| d86 | Zoning | 128 | 39.8% | 39.8% | 0.0% |
| danocrypto | Counter | 140 | 46.4% | 46.4% | 0.0% |
| davidcd | Footwork | 124 | 43.5% | 43.5% | 0.0% |
| degenpress | Zoning | 128 | 43.8% | 43.8% | 0.0% |
| dollarbitcoin | Brawler | 120 | 50.8% | 50.8% | 0.0% |
| drzmoody | Footwork | 156 | 44.2% | 44.2% | 0.0% |
| dumpstar | Brawler | 112 | 61.6% | 61.6% | 0.0% |
| duo | Paired | 164 | 42.7% | 42.7% | 0.0% |
| durlan | Footwork | 160 | 48.1% | 48.1% | 0.0% |
| emix | Footwork | 124 | 52.4% | 52.4% | 0.0% |
| erik | Footwork | 112 | 42.0% | 42.0% | 0.0% |
| familywagon | Brawler | 152 | 55.3% | 55.3% | 0.0% |
| feistyboi | Counter | 116 | 56.0% | 56.0% | 0.0% |
| felixsprotoarc | Zoning | 124 | 41.9% | 41.9% | 0.0% |
| fiatfudder | Counter | 124 | 52.4% | 52.4% | 0.0% |
| forchaneth | Footwork | 108 | 52.8% | 52.8% | 0.0% |
| fplgremlin | Pressure | 116 | 51.7% | 51.7% | 0.0% |
| freedfrida | Footwork | 140 | 50.0% | 50.0% | 0.0% |
| frej | Counter | 112 | 51.8% | 51.8% | 0.0% |
| freshprince | Counter | 156 | 53.2% | 52.6% | 1.3% |
| ghostsprotocol | Zoning | 124 | 43.5% | 43.5% | 0.0% |
| giavannykitchens | Pressure | 148 | 38.5% | 38.5% | 0.0% |
| glow | Counter | 144 | 54.2% | 54.2% | 0.0% |
| gluttony | Zoning | 140 | 46.4% | 46.4% | 0.0% |
| godether | Counter | 124 | 48.4% | 48.4% | 0.0% |
| godmod3d | Paired | 112 | 43.8% | 43.8% | 0.0% |
| godsson | Counter | 156 | 37.8% | 37.8% | 0.0% |
| gpm | Brawler | 136 | 51.5% | 51.5% | 0.0% |
| greatcharly | Footwork | 136 | 58.1% | 58.1% | 0.0% |
| gryph | Paired | 120 | 50.0% | 50.0% | 0.0% |
| guest07 | Pressure | 148 | 49.3% | 49.3% | 0.0% |
| guest08 | Zoning | 180 | 56.7% | 56.7% | 0.0% |
| guest09 | Pressure | 108 | 55.6% | 55.6% | 0.0% |
| guest10 | Zoning | 124 | 52.4% | 52.4% | 0.0% |
| guest11 | Counter | 156 | 50.0% | 50.0% | 0.0% |
| guest12 | Zoning | 136 | 60.3% | 60.3% | 0.0% |
| guest13 | Counter | 124 | 66.1% | 66.1% | 0.0% |
| guest14 | Counter | 152 | 54.6% | 54.6% | 0.0% |
| hdizzy | Zoning | 124 | 51.6% | 51.6% | 0.0% |
| herbpowell | Counter | 120 | 43.3% | 43.3% | 0.0% |
| hermionemichelleamyrose | Footwork | 124 | 44.4% | 44.4% | 0.0% |
| highsproto | Zoning | 144 | 47.2% | 47.2% | 0.0% |
| homosproto | Footwork | 160 | 48.1% | 48.1% | 0.0% |
| indiapolice | Counter | 148 | 43.2% | 43.2% | 0.0% |
| infinitysplitter | Footwork | 148 | 39.2% | 39.2% | 0.0% |
| isaac | Footwork | 144 | 45.8% | 45.8% | 0.0% |
| jameskaminski | Pressure | 136 | 44.1% | 44.1% | 0.0% |
| janitor | Brawler | 156 | 62.8% | 63.6% | 1.3% |
| jasper | Footwork | 132 | 62.1% | 62.1% | 0.0% |
| jayquant | Counter | 132 | 47.0% | 47.0% | 0.0% |
| johnson | Brawler | 136 | 51.5% | 51.5% | 0.0% |
| julian | Counter | 180 | 46.7% | 46.7% | 0.0% |
| kern | Counter | 140 | 45.7% | 45.7% | 0.0% |
| kerrieanne | Counter | 132 | 47.7% | 47.7% | 0.0% |
| laserbach | Pressure | 112 | 56.3% | 56.3% | 0.0% |
| lestrange | Footwork | 120 | 42.5% | 42.5% | 0.0% |
| leviosa | Footwork | 120 | 55.0% | 55.0% | 0.0% |
| lifeisameme | Pressure | 136 | 46.3% | 46.3% | 0.0% |
| lilgoldied | Counter | 128 | 48.4% | 48.4% | 0.0% |
| loadthebags | Pressure | 148 | 57.4% | 57.4% | 0.0% |
| loqi | Counter | 136 | 50.0% | 50.0% | 0.0% |
| lowernipple | Zoning | 160 | 48.8% | 48.8% | 0.0% |
| mandela | Weapon | 124 | 41.9% | 41.9% | 0.0% |
| marfrog | Footwork | 132 | 45.5% | 45.5% | 0.0% |
| maxbiggums | Brawler | 116 | 53.4% | 53.4% | 0.0% |
| melo | Weapon | 152 | 46.7% | 46.7% | 0.0% |
| michael | Weapon | 144 | 54.2% | 54.2% | 0.0% |
| micsash | Counter | 132 | 47.0% | 47.0% | 0.0% |
| mikemike | Brawler | 136 | 47.1% | 47.1% | 0.0% |
| mildtacos | Footwork | 108 | 40.7% | 40.7% | 0.0% |
| mlk | Counter | 116 | 51.7% | 51.7% | 0.0% |
| moonshiller | Brawler | 124 | 48.4% | 48.4% | 0.0% |
| mox | Counter | 104 | 51.9% | 51.9% | 0.0% |
| mrgoldrobe | Counter | 148 | 48.6% | 48.6% | 0.0% |
| mrhorsemeat | Counter | 172 | 50.6% | 50.6% | 0.0% |
| nate | Pressure | 132 | 37.9% | 37.9% | 0.0% |
| nick | Pressure | 124 | 43.5% | 43.5% | 0.0% |
| nomis | Pressure | 120 | 53.3% | 53.3% | 0.0% |
| nosmileclown | Paired | 124 | 53.2% | 52.8% | 0.8% |
| np | Footwork | 148 | 43.2% | 43.2% | 0.0% |
| obamasega420 | Footwork | 140 | 52.9% | 52.9% | 0.0% |
| olnoname | Footwork | 124 | 50.8% | 50.8% | 0.0% |
| onememeaday | Pressure | 144 | 44.4% | 44.4% | 0.0% |
| osho | Footwork | 140 | 42.1% | 42.1% | 0.0% |
| otorps | Counter | 148 | 55.4% | 55.4% | 0.0% |
| pars | Brawler | 152 | 47.4% | 47.4% | 0.0% |
| peterpan | Paired | 120 | 51.7% | 51.7% | 0.0% |
| pilgrim | Brawler | 128 | 59.4% | 59.4% | 0.0% |
| pinewaffle | Pressure | 132 | 53.8% | 53.8% | 0.0% |
| pirate | Footwork | 136 | 47.8% | 47.8% | 0.0% |
| pongohpos10i | Zoning | 168 | 58.3% | 58.3% | 0.0% |
| potocaicai | Counter | 136 | 42.6% | 42.6% | 0.0% |
| pr0lificeth | Zoning | 128 | 44.5% | 44.5% | 0.0% |
| prim | Zoning | 108 | 62.0% | 62.0% | 0.0% |
| rainman | Footwork | 136 | 46.3% | 46.3% | 0.0% |
| razz | Counter | 124 | 50.8% | 50.8% | 0.0% |
| realityarchitect | Counter | 124 | 46.0% | 46.0% | 0.0% |
| rektina | Footwork | 88 | 56.8% | 56.8% | 0.0% |
| renzo | Pressure | 148 | 50.0% | 50.0% | 0.0% |
| reverend | Footwork | 124 | 52.4% | 52.4% | 0.0% |
| rivet | Pressure | 100 | 45.0% | 45.0% | 0.0% |
| rlarsson | Footwork | 144 | 50.0% | 50.0% | 0.0% |
| rmacpdx | Footwork | 148 | 58.8% | 58.8% | 0.0% |
| rune | Counter | 132 | 62.9% | 62.9% | 0.0% |
| saburdo | Pressure | 164 | 54.9% | 54.9% | 0.0% |
| samixsproto | Zoning | 112 | 52.7% | 52.7% | 0.0% |
| satoshi | Pressure | 112 | 50.9% | 50.9% | 0.0% |
| seph0x | Counter | 144 | 55.6% | 55.6% | 0.0% |
| sidelinereferee | Zoning | 148 | 54.1% | 54.1% | 0.0% |
| sirbitcoin | Counter | 120 | 51.7% | 51.7% | 0.0% |
| sirdidit | Footwork | 128 | 53.9% | 53.9% | 0.0% |
| sisma | Pressure | 132 | 56.1% | 56.1% | 0.0% |
| slabcorn | Brawler | 124 | 59.7% | 59.7% | 0.0% |
| slakesly | Counter | 136 | 47.1% | 47.1% | 0.0% |
| sober | Footwork | 124 | 62.1% | 62.1% | 0.0% |
| solanadelray | Paired | 116 | 42.2% | 42.2% | 0.0% |
| sprog | Footwork | 152 | 51.3% | 51.3% | 0.0% |
| sproteth | Footwork | 132 | 45.5% | 45.5% | 0.0% |
| sproto1011 | Weapon | 152 | 46.7% | 46.7% | 0.0% |
| sproto102 | Footwork | 136 | 54.4% | 54.4% | 0.0% |
| sproto1093 | Footwork | 136 | 47.1% | 47.1% | 0.0% |
| sproto1187 | Footwork | 144 | 51.4% | 51.4% | 0.0% |
| sproto1335 | Footwork | 124 | 54.8% | 54.8% | 0.0% |
| sproto1345 | Footwork | 124 | 48.4% | 48.4% | 0.0% |
| sproto1414 | Footwork | 132 | 54.5% | 54.5% | 0.0% |
| sproto1477 | Footwork | 144 | 52.8% | 52.8% | 0.0% |
| sproto1499 | Paired | 132 | 47.7% | 47.7% | 0.0% |
| sproto1601 | Zoning | 116 | 67.2% | 67.2% | 0.0% |
| sproto1625 | Paired | 132 | 41.7% | 41.7% | 0.0% |
| sproto1668 | Footwork | 152 | 44.1% | 44.1% | 0.0% |
| sproto1815 | Weapon | 144 | 51.4% | 51.4% | 0.0% |
| sproto1870 | Hover | 144 | 40.3% | 40.3% | 0.0% |
| sproto2010 | Paired | 124 | 58.1% | 58.1% | 0.0% |
| sproto2075 | Paired | 140 | 36.4% | 36.4% | 0.0% |
| sproto2101 | Footwork | 120 | 65.8% | 65.8% | 0.0% |
| sproto215 | Footwork | 112 | 61.6% | 61.6% | 0.0% |
| sproto2177 | Footwork | 160 | 40.0% | 40.0% | 0.0% |
| sproto2210 | Paired | 128 | 51.6% | 51.6% | 0.0% |
| sproto2322 | Footwork | 140 | 46.4% | 46.4% | 0.0% |
| sproto2344 | Paired | 144 | 37.5% | 37.5% | 0.0% |
| sproto2381 | Footwork | 120 | 60.0% | 60.0% | 0.0% |
| sproto2531 | Zoning | 140 | 57.1% | 57.1% | 0.0% |
| sproto2569 | Footwork | 124 | 43.5% | 43.5% | 0.0% |
| sproto2616 | Weapon | 120 | 42.5% | 42.5% | 0.0% |
| sproto2789 | Weapon | 144 | 35.4% | 35.4% | 0.0% |
| sproto282 | Paired | 140 | 48.6% | 48.6% | 0.0% |
| sproto2884 | Footwork | 100 | 56.0% | 56.0% | 0.0% |
| sproto3106 | Zoning | 148 | 54.1% | 54.1% | 0.0% |
| sproto313 | Footwork | 124 | 58.9% | 58.9% | 0.0% |
| sproto3152 | Zoning | 144 | 54.2% | 54.2% | 0.0% |
| sproto3181 | Paired | 136 | 45.6% | 45.6% | 0.0% |
| sproto3215 | Footwork | 128 | 56.3% | 56.3% | 0.0% |
| sproto3224 | Paired | 116 | 50.9% | 50.9% | 0.0% |
| sproto3235 | Paired | 140 | 55.0% | 55.0% | 0.0% |
| sproto651 | Footwork | 116 | 34.5% | 34.5% | 0.0% |
| sproto704 | Paired | 112 | 39.3% | 39.3% | 0.0% |
| sproto763 | Footwork | 136 | 61.0% | 61.0% | 0.0% |
| sproto818 | Footwork | 132 | 55.3% | 55.3% | 0.0% |
| sproto831 | Footwork | 104 | 55.8% | 55.8% | 0.0% |
| sproto832 | Paired | 132 | 67.4% | 67.4% | 0.0% |
| sproto834 | Footwork | 100 | 54.0% | 54.0% | 0.0% |
| sproto837 | Footwork | 136 | 47.8% | 47.8% | 0.0% |
| sproto865 | Footwork | 112 | 56.3% | 56.3% | 0.0% |
| sproto943 | Footwork | 124 | 58.1% | 58.1% | 0.0% |
| sproto999 | Footwork | 136 | 55.1% | 55.1% | 0.0% |
| sprotocius | Counter | 132 | 56.8% | 56.8% | 0.0% |
| sprotolg | Zoning | 136 | 57.4% | 57.4% | 0.0% |
| sprotomichaelsaylor | Zoning | 136 | 54.4% | 54.4% | 0.0% |
| sprotomidnightfx | Pressure | 140 | 50.7% | 50.7% | 0.0% |
| sprotopia | Zoning | 124 | 52.4% | 52.4% | 0.0% |
| sprotopotamus | Brawler | 148 | 47.3% | 47.3% | 0.0% |
| sprotosales | Footwork | 124 | 48.4% | 48.4% | 0.0% |
| sprotosurvivor | Zoning | 112 | 47.3% | 47.3% | 0.0% |
| spruto | Footwork | 108 | 53.7% | 53.7% | 0.0% |
| spunow | Footwork | 96 | 41.7% | 41.7% | 0.0% |
| stonkyleg69 | Footwork | 140 | 40.7% | 40.7% | 0.0% |
| stoto | Pressure | 144 | 41.7% | 41.7% | 0.0% |
| sweatpantstrust | Counter | 132 | 38.6% | 38.6% | 0.0% |
| tdeth | Pressure | 132 | 47.7% | 47.7% | 0.0% |
| teahupoo | Counter | 132 | 52.3% | 52.3% | 0.0% |
| theo | Zoning | 140 | 42.9% | 42.9% | 0.0% |
| thesprotowholivedeth | Zoning | 148 | 43.9% | 43.9% | 0.0% |
| thxobama | Counter | 132 | 51.5% | 51.5% | 0.0% |
| tingsmol | Footwork | 120 | 44.2% | 44.2% | 0.0% |
| tradertimmy | Counter | 140 | 60.7% | 60.7% | 0.0% |
| twinnyneutron | Paired | 132 | 50.0% | 50.0% | 0.0% |
| uncmasterflex | Footwork | 120 | 59.2% | 59.2% | 0.0% |
| urmometh | Footwork | 128 | 60.2% | 60.2% | 0.0% |
| usedtowels | Counter | 156 | 40.4% | 40.4% | 0.0% |
| vamp | Zoning | 120 | 65.8% | 65.8% | 0.0% |
| vaudream | Hover | 104 | 47.1% | 47.1% | 0.0% |
| vela | Zoning | 148 | 58.1% | 58.1% | 0.0% |
| veryseriousinvestor | Footwork | 140 | 50.7% | 50.7% | 0.0% |
| vicoo | Counter | 152 | 44.7% | 44.7% | 0.0% |
| vitaliketh | Footwork | 144 | 47.2% | 47.2% | 0.0% |
| wifebeater | Brawler | 152 | 48.7% | 48.7% | 0.0% |
| willuminati | Counter | 132 | 59.1% | 59.1% | 0.0% |
| wireitwell | Pressure | 136 | 46.3% | 46.3% | 0.0% |
| wyrmblvnt | Footwork | 140 | 49.3% | 49.3% | 0.0% |
| xalt | Zoning | 124 | 51.6% | 51.6% | 0.0% |
| xav | Footwork | 108 | 56.5% | 56.5% | 0.0% |
| yusuf | Pressure | 132 | 52.3% | 52.3% | 0.0% |
| zakarum | Footwork | 124 | 44.4% | 44.4% | 0.0% |
| zebracorn | Counter | 152 | 47.4% | 47.4% | 0.0% |
| zephyr | Brawler | 152 | 45.4% | 45.4% | 0.0% |
| zepump | Paired | 128 | 56.3% | 56.3% | 0.0% |
| zippy | Pressure | 136 | 45.6% | 45.6% | 0.0% |
| zudi | Counter | 124 | 50.8% | 50.8% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs croy | 4 | 0.0% |
| 86gwei vs feistyboi | 4 | 0.0% |
| 86gwei vs freshprince | 4 | 100.0% |
| 86gwei vs gluttony | 4 | 0.0% |
| 86gwei vs homosproto | 4 | 100.0% |
| 86gwei vs indiapolice | 4 | 0.0% |
| 86gwei vs mildtacos | 4 | 100.0% |
| 86gwei vs mox | 4 | 100.0% |
| 86gwei vs nomis | 4 | 0.0% |
| 86gwei vs np | 4 | 100.0% |
