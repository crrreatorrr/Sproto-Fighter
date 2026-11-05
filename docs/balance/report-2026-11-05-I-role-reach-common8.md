# Balance tournament

Source: `efb5829c1230dac84337ba0212d92a84a527563b`; simulation `a4c7ddde49ec5a64`; source SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`.

Seed 20261105; 254 fighters; 2013 sampled pairs; 2 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes use canonical BALANCE_KITS assignments when available; legacy cores use analysis groupings of existing roles. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 4

8052 bouts; raw draws 0.0% (3); unresolved 0.0% (2); timeouts 0. Mean 28.02 s; median 28.07 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 50.0% | 0.0% | 5.13 s |
| 2 | 50.0% | 50.0% | 0.0% | 5.12 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 5288 | 54.3% | 54.3% | 0.0% |
| Counter | 3260 | 51.3% | 51.3% | 0.1% |
| Zoning | 2408 | 50.1% | 50.1% | 0.0% |
| Pressure | 1968 | 44.9% | 44.9% | 0.0% |
| Paired | 1212 | 44.2% | 44.3% | 0.1% |
| Brawler | 1260 | 42.9% | 42.9% | 0.0% |
| Hover | 120 | 50.8% | 50.8% | 0.0% |
| Weapon | 588 | 47.4% | 47.4% | 0.0% |

Damage: melee 8180571; projectile 3332280; special 578075; throw 827693.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 60 | 43.3% | 43.3% | 0.0% |
| aaron | Footwork | 88 | 47.7% | 47.7% | 0.0% |
| accidentallyrich | Counter | 64 | 54.7% | 54.7% | 0.0% |
| agentsproto | Brawler | 40 | 35.0% | 35.0% | 0.0% |
| aktree | Zoning | 52 | 30.8% | 30.8% | 0.0% |
| aleksander | Counter | 56 | 46.4% | 46.4% | 0.0% |
| alpha777 | Pressure | 60 | 38.3% | 38.3% | 0.0% |
| anni | Pressure | 48 | 66.7% | 66.7% | 0.0% |
| autistophrenicsprotagonist | Footwork | 56 | 39.3% | 39.3% | 0.0% |
| azkarah | Zoning | 48 | 45.8% | 45.8% | 0.0% |
| benjamin | Footwork | 72 | 52.8% | 52.8% | 0.0% |
| berserk | Footwork | 48 | 70.8% | 70.8% | 0.0% |
| bgbadger | Zoning | 44 | 50.0% | 50.0% | 0.0% |
| bidnehhh | Pressure | 52 | 38.5% | 38.5% | 0.0% |
| bigal | Brawler | 60 | 36.7% | 36.7% | 0.0% |
| bigswole | Brawler | 56 | 39.3% | 39.3% | 0.0% |
| bimba | Footwork | 72 | 63.9% | 63.9% | 0.0% |
| bitcoind1rk | Footwork | 96 | 56.3% | 56.3% | 0.0% |
| blorfo | Weapon | 96 | 47.9% | 47.9% | 0.0% |
| bobdobbs | Footwork | 56 | 57.1% | 57.1% | 0.0% |
| brainsprot | Footwork | 68 | 60.3% | 60.3% | 0.0% |
| bront | Brawler | 44 | 50.0% | 50.0% | 0.0% |
| bs9090eth | Zoning | 68 | 38.2% | 38.2% | 0.0% |
| buddhashadow | Footwork | 56 | 57.1% | 57.1% | 0.0% |
| cam | Brawler | 56 | 30.4% | 30.4% | 0.0% |
| cantankerous | Pressure | 40 | 25.0% | 25.0% | 0.0% |
| captain | Zoning | 80 | 61.3% | 61.3% | 0.0% |
| captainhowdy | Footwork | 76 | 63.2% | 63.2% | 0.0% |
| ceo | Zoning | 60 | 43.3% | 43.3% | 0.0% |
| chaton | Footwork | 64 | 53.1% | 53.1% | 0.0% |
| chonky | Footwork | 64 | 56.3% | 56.3% | 0.0% |
| chrisfowler | Counter | 64 | 53.1% | 53.1% | 0.0% |
| ciphersproto | Pressure | 68 | 42.6% | 42.6% | 0.0% |
| clobrwn | Footwork | 80 | 50.0% | 50.0% | 0.0% |
| contresens | Zoning | 60 | 50.0% | 50.0% | 0.0% |
| corn | Pressure | 68 | 44.1% | 44.1% | 0.0% |
| crapto | Zoning | 64 | 73.4% | 73.4% | 0.0% |
| crippledlover | Footwork | 56 | 57.1% | 57.1% | 0.0% |
| croy | Counter | 80 | 43.8% | 43.8% | 0.0% |
| crumpleii | Brawler | 52 | 30.8% | 30.8% | 0.0% |
| cryptobartender | Zoning | 80 | 45.0% | 45.0% | 0.0% |
| cryptoboy | Counter | 44 | 61.4% | 61.4% | 0.0% |
| cryptomonger | Footwork | 72 | 61.1% | 61.1% | 0.0% |
| cryptorizzler | Counter | 72 | 48.6% | 48.6% | 0.0% |
| cryptoviking420 | Pressure | 64 | 46.9% | 46.9% | 0.0% |
| cyberviber | Counter | 60 | 51.7% | 51.7% | 0.0% |
| d86 | Zoning | 48 | 50.0% | 50.0% | 0.0% |
| danocrypto | Counter | 72 | 61.1% | 60.6% | 1.4% |
| davidcd | Footwork | 68 | 64.7% | 64.7% | 0.0% |
| degenpress | Zoning | 80 | 47.5% | 47.5% | 0.0% |
| dollarbitcoin | Brawler | 44 | 31.8% | 31.8% | 0.0% |
| drzmoody | Footwork | 64 | 45.3% | 45.3% | 0.0% |
| dumpstar | Brawler | 52 | 57.7% | 57.7% | 0.0% |
| duo | Paired | 76 | 46.1% | 46.1% | 0.0% |
| durlan | Footwork | 92 | 56.5% | 56.5% | 0.0% |
| emix | Footwork | 72 | 63.9% | 63.9% | 0.0% |
| erik | Footwork | 48 | 58.3% | 58.3% | 0.0% |
| familywagon | Brawler | 68 | 39.7% | 39.7% | 0.0% |
| feistyboi | Counter | 48 | 60.4% | 60.4% | 0.0% |
| felixsprotoarc | Zoning | 60 | 48.3% | 48.3% | 0.0% |
| fiatfudder | Counter | 60 | 55.0% | 55.0% | 0.0% |
| forchaneth | Footwork | 44 | 45.5% | 45.5% | 0.0% |
| fplgremlin | Pressure | 56 | 35.7% | 35.7% | 0.0% |
| freedfrida | Footwork | 44 | 61.4% | 61.4% | 0.0% |
| frej | Counter | 56 | 46.4% | 46.4% | 0.0% |
| freshprince | Counter | 76 | 50.0% | 50.0% | 0.0% |
| ghostsprotocol | Zoning | 52 | 69.2% | 69.2% | 0.0% |
| giavannykitchens | Pressure | 68 | 52.9% | 52.9% | 0.0% |
| glow | Counter | 64 | 64.1% | 64.1% | 0.0% |
| gluttony | Zoning | 76 | 50.0% | 50.0% | 0.0% |
| godether | Counter | 64 | 70.3% | 70.3% | 0.0% |
| godmod3d | Paired | 56 | 55.4% | 55.4% | 0.0% |
| godsson | Counter | 84 | 58.3% | 58.3% | 0.0% |
| gpm | Brawler | 64 | 39.1% | 39.1% | 0.0% |
| greatcharly | Footwork | 76 | 63.2% | 63.2% | 0.0% |
| gryph | Paired | 68 | 42.6% | 42.6% | 0.0% |
| guest07 | Pressure | 68 | 41.2% | 41.2% | 0.0% |
| guest08 | Zoning | 100 | 49.0% | 49.0% | 0.0% |
| guest09 | Pressure | 52 | 57.7% | 57.7% | 0.0% |
| guest10 | Zoning | 56 | 67.9% | 67.9% | 0.0% |
| guest11 | Counter | 84 | 47.6% | 47.6% | 0.0% |
| guest12 | Zoning | 56 | 53.6% | 53.6% | 0.0% |
| guest13 | Counter | 68 | 61.8% | 61.8% | 0.0% |
| guest14 | Counter | 92 | 54.3% | 54.3% | 0.0% |
| hdizzy | Zoning | 72 | 55.6% | 55.6% | 0.0% |
| herbpowell | Counter | 52 | 69.2% | 69.2% | 0.0% |
| hermionemichelleamyrose | Footwork | 60 | 70.0% | 70.0% | 0.0% |
| highsproto | Zoning | 76 | 34.2% | 34.2% | 0.0% |
| homosproto | Footwork | 52 | 42.3% | 42.3% | 0.0% |
| indiapolice | Counter | 68 | 47.1% | 47.1% | 0.0% |
| infinitysplitter | Footwork | 64 | 56.3% | 56.3% | 0.0% |
| isaac | Footwork | 56 | 51.8% | 51.8% | 0.0% |
| jameskaminski | Pressure | 84 | 45.2% | 45.2% | 0.0% |
| janitor | Brawler | 64 | 40.6% | 40.6% | 0.0% |
| jasper | Footwork | 56 | 51.8% | 51.8% | 0.0% |
| jayquant | Counter | 76 | 39.5% | 39.5% | 0.0% |
| johnson | Brawler | 68 | 45.6% | 45.6% | 0.0% |
| julian | Counter | 92 | 51.1% | 51.1% | 0.0% |
| kern | Counter | 76 | 48.7% | 48.7% | 0.0% |
| kerrieanne | Counter | 68 | 38.2% | 38.2% | 0.0% |
| laserbach | Pressure | 56 | 37.5% | 37.5% | 0.0% |
| lestrange | Footwork | 48 | 41.7% | 41.7% | 0.0% |
| leviosa | Footwork | 76 | 57.9% | 57.9% | 0.0% |
| lifeisameme | Pressure | 72 | 55.6% | 55.6% | 0.0% |
| lilgoldied | Counter | 56 | 35.7% | 35.7% | 0.0% |
| loadthebags | Pressure | 80 | 55.0% | 55.0% | 0.0% |
| loqi | Counter | 68 | 47.1% | 47.1% | 0.0% |
| lowernipple | Zoning | 60 | 56.7% | 56.7% | 0.0% |
| mandela | Weapon | 68 | 50.0% | 50.0% | 0.0% |
| marfrog | Footwork | 76 | 55.3% | 55.3% | 0.0% |
| maxbiggums | Brawler | 56 | 48.2% | 48.2% | 0.0% |
| melo | Weapon | 88 | 45.5% | 45.5% | 0.0% |
| michael | Weapon | 64 | 31.3% | 31.3% | 0.0% |
| micsash | Counter | 72 | 66.7% | 66.7% | 0.0% |
| mikemike | Brawler | 68 | 41.2% | 41.2% | 0.0% |
| mildtacos | Footwork | 40 | 50.0% | 50.0% | 0.0% |
| mlk | Counter | 52 | 38.5% | 38.5% | 0.0% |
| moonshiller | Brawler | 64 | 43.8% | 43.8% | 0.0% |
| mox | Counter | 52 | 55.8% | 55.8% | 0.0% |
| mrgoldrobe | Counter | 68 | 42.6% | 42.6% | 0.0% |
| mrhorsemeat | Counter | 84 | 40.5% | 40.5% | 0.0% |
| nate | Pressure | 72 | 51.4% | 51.4% | 0.0% |
| nick | Pressure | 68 | 50.0% | 50.0% | 0.0% |
| nomis | Pressure | 56 | 42.9% | 42.9% | 0.0% |
| nosmileclown | Paired | 64 | 43.8% | 43.8% | 0.0% |
| np | Footwork | 48 | 41.7% | 41.7% | 0.0% |
| obamasega420 | Footwork | 60 | 60.0% | 60.0% | 0.0% |
| olnoname | Footwork | 60 | 45.0% | 45.0% | 0.0% |
| onememeaday | Pressure | 80 | 55.0% | 55.0% | 0.0% |
| osho | Footwork | 52 | 46.2% | 46.2% | 0.0% |
| otorps | Counter | 68 | 39.7% | 39.7% | 0.0% |
| pars | Brawler | 68 | 41.2% | 41.2% | 0.0% |
| peterpan | Paired | 56 | 50.0% | 50.0% | 0.0% |
| pilgrim | Brawler | 56 | 57.1% | 57.1% | 0.0% |
| pinewaffle | Pressure | 60 | 43.3% | 43.3% | 0.0% |
| pirate | Footwork | 60 | 45.0% | 45.0% | 0.0% |
| pongohpos10i | Zoning | 96 | 47.9% | 47.9% | 0.0% |
| potocaicai | Counter | 52 | 46.2% | 46.2% | 0.0% |
| pr0lificeth | Zoning | 52 | 50.0% | 50.0% | 0.0% |
| prim | Zoning | 32 | 37.5% | 37.5% | 0.0% |
| rainman | Footwork | 68 | 60.3% | 60.3% | 0.0% |
| razz | Counter | 56 | 42.9% | 42.9% | 0.0% |
| realityarchitect | Counter | 68 | 61.8% | 61.8% | 0.0% |
| rektina | Footwork | 36 | 61.1% | 61.1% | 0.0% |
| renzo | Pressure | 80 | 38.8% | 38.8% | 0.0% |
| reverend | Footwork | 64 | 48.4% | 48.4% | 0.0% |
| rivet | Pressure | 48 | 33.3% | 33.3% | 0.0% |
| rlarsson | Footwork | 84 | 57.1% | 57.1% | 0.0% |
| rmacpdx | Footwork | 80 | 37.5% | 37.5% | 0.0% |
| rune | Counter | 52 | 73.1% | 73.1% | 0.0% |
| saburdo | Pressure | 64 | 48.4% | 48.4% | 0.0% |
| samixsproto | Zoning | 60 | 48.3% | 48.3% | 0.0% |
| satoshi | Pressure | 48 | 29.2% | 29.2% | 0.0% |
| seph0x | Counter | 72 | 38.9% | 38.9% | 0.0% |
| sidelinereferee | Zoning | 88 | 45.5% | 45.5% | 0.0% |
| sirbitcoin | Counter | 48 | 41.7% | 41.7% | 0.0% |
| sirdidit | Footwork | 64 | 43.8% | 43.8% | 0.0% |
| sisma | Pressure | 72 | 27.8% | 27.8% | 0.0% |
| slabcorn | Brawler | 48 | 33.3% | 33.3% | 0.0% |
| slakesly | Counter | 64 | 37.5% | 37.5% | 0.0% |
| sober | Footwork | 52 | 68.0% | 68.0% | 3.8% |
| solanadelray | Paired | 48 | 37.5% | 37.5% | 0.0% |
| sprog | Footwork | 88 | 47.7% | 47.7% | 0.0% |
| sproteth | Footwork | 68 | 55.9% | 55.9% | 0.0% |
| sproto1011 | Weapon | 84 | 59.5% | 59.5% | 0.0% |
| sproto102 | Footwork | 72 | 52.8% | 52.8% | 0.0% |
| sproto1093 | Footwork | 44 | 61.4% | 61.4% | 0.0% |
| sproto1187 | Footwork | 76 | 63.2% | 63.2% | 0.0% |
| sproto1335 | Footwork | 64 | 65.6% | 65.6% | 0.0% |
| sproto1345 | Footwork | 52 | 46.2% | 46.2% | 0.0% |
| sproto1414 | Footwork | 72 | 44.4% | 44.4% | 0.0% |
| sproto1477 | Footwork | 56 | 50.0% | 50.0% | 0.0% |
| sproto1499 | Paired | 68 | 36.8% | 36.8% | 0.0% |
| sproto1601 | Zoning | 64 | 45.3% | 45.3% | 0.0% |
| sproto1625 | Paired | 60 | 33.3% | 33.3% | 0.0% |
| sproto1668 | Footwork | 52 | 53.8% | 53.8% | 0.0% |
| sproto1815 | Weapon | 64 | 56.3% | 56.3% | 0.0% |
| sproto1870 | Hover | 60 | 43.3% | 43.3% | 0.0% |
| sproto2010 | Paired | 52 | 50.0% | 50.0% | 0.0% |
| sproto2075 | Paired | 52 | 55.8% | 55.8% | 0.0% |
| sproto2101 | Footwork | 64 | 45.3% | 45.3% | 0.0% |
| sproto215 | Footwork | 64 | 62.5% | 62.5% | 0.0% |
| sproto2177 | Footwork | 80 | 67.5% | 67.5% | 0.0% |
| sproto2210 | Paired | 60 | 43.3% | 44.1% | 1.7% |
| sproto2322 | Footwork | 52 | 48.1% | 48.1% | 0.0% |
| sproto2344 | Paired | 72 | 38.9% | 38.9% | 0.0% |
| sproto2381 | Footwork | 60 | 63.3% | 63.3% | 0.0% |
| sproto2531 | Zoning | 64 | 59.4% | 59.4% | 0.0% |
| sproto2569 | Footwork | 64 | 53.1% | 53.1% | 0.0% |
| sproto2616 | Weapon | 60 | 43.3% | 43.3% | 0.0% |
| sproto2789 | Weapon | 64 | 42.2% | 42.2% | 0.0% |
| sproto282 | Paired | 72 | 44.4% | 44.4% | 0.0% |
| sproto2884 | Footwork | 36 | 33.3% | 33.3% | 0.0% |
| sproto3106 | Zoning | 76 | 47.4% | 47.4% | 0.0% |
| sproto313 | Footwork | 64 | 59.4% | 59.4% | 0.0% |
| sproto3152 | Zoning | 68 | 61.8% | 61.8% | 0.0% |
| sproto3181 | Paired | 64 | 50.0% | 50.0% | 0.0% |
| sproto3215 | Footwork | 68 | 58.8% | 58.8% | 0.0% |
| sproto3224 | Paired | 48 | 50.0% | 50.0% | 0.0% |
| sproto3235 | Paired | 60 | 33.3% | 33.3% | 0.0% |
| sproto651 | Footwork | 48 | 52.1% | 52.1% | 0.0% |
| sproto704 | Paired | 56 | 42.9% | 42.9% | 0.0% |
| sproto763 | Footwork | 76 | 57.9% | 57.9% | 0.0% |
| sproto818 | Footwork | 64 | 54.7% | 54.7% | 0.0% |
| sproto831 | Footwork | 48 | 47.9% | 47.9% | 0.0% |
| sproto832 | Paired | 56 | 44.6% | 44.6% | 0.0% |
| sproto834 | Footwork | 40 | 50.0% | 50.0% | 0.0% |
| sproto837 | Footwork | 72 | 62.5% | 62.5% | 0.0% |
| sproto865 | Footwork | 56 | 41.1% | 41.1% | 0.0% |
| sproto943 | Footwork | 68 | 55.9% | 55.9% | 0.0% |
| sproto999 | Footwork | 60 | 43.3% | 43.3% | 0.0% |
| sprotocius | Counter | 64 | 53.1% | 53.1% | 0.0% |
| sprotolg | Zoning | 52 | 59.6% | 59.6% | 0.0% |
| sprotomichaelsaylor | Zoning | 52 | 42.3% | 42.3% | 0.0% |
| sprotomidnightfx | Pressure | 68 | 41.2% | 41.2% | 0.0% |
| sprotopia | Zoning | 48 | 62.5% | 62.5% | 0.0% |
| sprotopotamus | Brawler | 76 | 43.4% | 43.4% | 0.0% |
| sprotosales | Footwork | 68 | 50.0% | 50.0% | 0.0% |
| sprotosurvivor | Zoning | 56 | 42.9% | 42.9% | 0.0% |
| spruto | Footwork | 56 | 60.7% | 60.7% | 0.0% |
| spunow | Footwork | 44 | 68.2% | 68.2% | 0.0% |
| stonkyleg69 | Footwork | 56 | 46.4% | 46.4% | 0.0% |
| stoto | Pressure | 56 | 58.9% | 58.9% | 0.0% |
| sweatpantstrust | Counter | 68 | 58.8% | 58.8% | 0.0% |
| tdeth | Pressure | 84 | 42.9% | 42.9% | 0.0% |
| teahupoo | Counter | 44 | 54.5% | 54.5% | 0.0% |
| theo | Zoning | 68 | 41.2% | 41.2% | 0.0% |
| thesprotowholivedeth | Zoning | 56 | 55.4% | 55.4% | 0.0% |
| thxobama | Counter | 64 | 50.0% | 50.0% | 0.0% |
| tingsmol | Footwork | 64 | 43.8% | 43.8% | 0.0% |
| tradertimmy | Counter | 72 | 54.2% | 54.2% | 0.0% |
| twinnyneutron | Paired | 56 | 46.4% | 46.4% | 0.0% |
| uncmasterflex | Footwork | 48 | 58.3% | 58.3% | 0.0% |
| urmometh | Footwork | 68 | 52.9% | 52.9% | 0.0% |
| usedtowels | Counter | 80 | 52.5% | 52.5% | 0.0% |
| vamp | Zoning | 56 | 51.8% | 51.8% | 0.0% |
| vaudream | Hover | 60 | 58.3% | 58.3% | 0.0% |
| vela | Zoning | 72 | 47.2% | 47.2% | 0.0% |
| veryseriousinvestor | Footwork | 72 | 50.0% | 50.0% | 0.0% |
| vicoo | Counter | 68 | 48.5% | 48.5% | 0.0% |
| vitaliketh | Footwork | 64 | 56.3% | 56.3% | 0.0% |
| wifebeater | Brawler | 80 | 52.5% | 52.5% | 0.0% |
| willuminati | Counter | 80 | 51.3% | 51.3% | 2.5% |
| wireitwell | Pressure | 80 | 37.5% | 37.5% | 0.0% |
| wyrmblvnt | Footwork | 64 | 56.3% | 56.3% | 0.0% |
| xalt | Zoning | 56 | 42.9% | 42.9% | 0.0% |
| xav | Footwork | 56 | 62.5% | 62.5% | 0.0% |
| yusuf | Pressure | 44 | 43.2% | 43.2% | 0.0% |
| zakarum | Footwork | 52 | 57.7% | 57.7% | 0.0% |
| zebracorn | Counter | 76 | 55.3% | 55.3% | 0.0% |
| zephyr | Brawler | 76 | 52.6% | 52.6% | 0.0% |
| zepump | Paired | 68 | 44.1% | 44.1% | 0.0% |
| zippy | Pressure | 52 | 57.7% | 57.7% | 0.0% |
| zudi | Counter | 72 | 52.8% | 52.8% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs accidentallyrich | 4 | 0.0% |
| 86gwei vs feistyboi | 4 | 0.0% |
| 86gwei vs gluttony | 4 | 100.0% |
| 86gwei vs mildtacos | 4 | 0.0% |
| 86gwei vs np | 4 | 0.0% |
| 86gwei vs sproto704 | 4 | 100.0% |
| 86gwei vs xav | 4 | 100.0% |
| 86gwei vs zippy | 4 | 0.0% |
| aaron vs alpha777 | 4 | 100.0% |
| aaron vs autistophrenicsprotagonist | 4 | 0.0% |

## Skill 7

8052 bouts; raw draws 0.0% (1); unresolved 0.0% (0); timeouts 0. Mean 32.65 s; median 32.58 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.1% | 50.1% | 0.0% | 5.68 s |
| 2 | 49.9% | 49.9% | 0.0% | 5.68 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 5288 | 50.8% | 50.8% | 0.0% |
| Counter | 3260 | 50.3% | 50.3% | 0.0% |
| Zoning | 2408 | 51.4% | 51.4% | 0.0% |
| Pressure | 1968 | 49.2% | 49.2% | 0.0% |
| Paired | 1212 | 46.1% | 46.1% | 0.1% |
| Brawler | 1260 | 50.0% | 50.0% | 0.0% |
| Hover | 120 | 50.8% | 50.8% | 0.0% |
| Weapon | 588 | 45.7% | 45.7% | 0.0% |

Damage: melee 8326895; projectile 3147404; special 775498; throw 562402.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 60 | 43.3% | 43.3% | 0.0% |
| aaron | Footwork | 88 | 51.1% | 51.1% | 0.0% |
| accidentallyrich | Counter | 64 | 53.1% | 53.1% | 0.0% |
| agentsproto | Brawler | 40 | 45.0% | 45.0% | 0.0% |
| aktree | Zoning | 52 | 42.3% | 42.3% | 0.0% |
| aleksander | Counter | 56 | 50.0% | 50.0% | 0.0% |
| alpha777 | Pressure | 60 | 41.7% | 41.7% | 0.0% |
| anni | Pressure | 48 | 50.0% | 50.0% | 0.0% |
| autistophrenicsprotagonist | Footwork | 56 | 57.1% | 57.1% | 0.0% |
| azkarah | Zoning | 48 | 62.5% | 62.5% | 0.0% |
| benjamin | Footwork | 72 | 40.3% | 40.3% | 0.0% |
| berserk | Footwork | 48 | 50.0% | 50.0% | 0.0% |
| bgbadger | Zoning | 44 | 59.1% | 59.1% | 0.0% |
| bidnehhh | Pressure | 52 | 57.7% | 57.7% | 0.0% |
| bigal | Brawler | 60 | 43.3% | 43.3% | 0.0% |
| bigswole | Brawler | 56 | 35.7% | 35.7% | 0.0% |
| bimba | Footwork | 72 | 41.7% | 41.7% | 0.0% |
| bitcoind1rk | Footwork | 96 | 37.5% | 37.5% | 0.0% |
| blorfo | Weapon | 96 | 46.9% | 46.9% | 0.0% |
| bobdobbs | Footwork | 56 | 50.0% | 50.0% | 0.0% |
| brainsprot | Footwork | 68 | 33.8% | 33.8% | 0.0% |
| bront | Brawler | 44 | 52.3% | 52.3% | 0.0% |
| bs9090eth | Zoning | 68 | 54.4% | 54.4% | 0.0% |
| buddhashadow | Footwork | 56 | 53.6% | 53.6% | 0.0% |
| cam | Brawler | 56 | 51.8% | 51.8% | 0.0% |
| cantankerous | Pressure | 40 | 35.0% | 35.0% | 0.0% |
| captain | Zoning | 80 | 56.3% | 56.3% | 0.0% |
| captainhowdy | Footwork | 76 | 52.6% | 52.6% | 0.0% |
| ceo | Zoning | 60 | 50.0% | 50.0% | 0.0% |
| chaton | Footwork | 64 | 53.1% | 53.1% | 0.0% |
| chonky | Footwork | 64 | 53.1% | 53.1% | 0.0% |
| chrisfowler | Counter | 64 | 46.9% | 46.9% | 0.0% |
| ciphersproto | Pressure | 68 | 50.0% | 50.0% | 0.0% |
| clobrwn | Footwork | 80 | 52.5% | 52.5% | 0.0% |
| contresens | Zoning | 60 | 45.0% | 45.0% | 0.0% |
| corn | Pressure | 68 | 70.6% | 70.6% | 0.0% |
| crapto | Zoning | 64 | 62.5% | 63.5% | 1.6% |
| crippledlover | Footwork | 56 | 64.3% | 64.3% | 0.0% |
| croy | Counter | 80 | 45.0% | 45.0% | 0.0% |
| crumpleii | Brawler | 52 | 38.5% | 38.5% | 0.0% |
| cryptobartender | Zoning | 80 | 43.8% | 43.8% | 0.0% |
| cryptoboy | Counter | 44 | 59.1% | 59.1% | 0.0% |
| cryptomonger | Footwork | 72 | 59.7% | 59.7% | 0.0% |
| cryptorizzler | Counter | 72 | 47.2% | 47.2% | 0.0% |
| cryptoviking420 | Pressure | 64 | 50.0% | 50.0% | 0.0% |
| cyberviber | Counter | 60 | 46.7% | 46.7% | 0.0% |
| d86 | Zoning | 48 | 37.5% | 37.5% | 0.0% |
| danocrypto | Counter | 72 | 45.8% | 45.8% | 0.0% |
| davidcd | Footwork | 68 | 41.2% | 41.2% | 0.0% |
| degenpress | Zoning | 80 | 42.5% | 42.5% | 0.0% |
| dollarbitcoin | Brawler | 44 | 50.0% | 50.0% | 0.0% |
| drzmoody | Footwork | 64 | 28.1% | 28.1% | 0.0% |
| dumpstar | Brawler | 52 | 55.8% | 55.8% | 0.0% |
| duo | Paired | 76 | 46.1% | 46.1% | 0.0% |
| durlan | Footwork | 92 | 46.7% | 46.7% | 0.0% |
| emix | Footwork | 72 | 52.8% | 52.8% | 0.0% |
| erik | Footwork | 48 | 33.3% | 33.3% | 0.0% |
| familywagon | Brawler | 68 | 52.9% | 52.9% | 0.0% |
| feistyboi | Counter | 48 | 62.5% | 62.5% | 0.0% |
| felixsprotoarc | Zoning | 60 | 36.7% | 36.7% | 0.0% |
| fiatfudder | Counter | 60 | 58.3% | 58.3% | 0.0% |
| forchaneth | Footwork | 44 | 54.5% | 54.5% | 0.0% |
| fplgremlin | Pressure | 56 | 50.0% | 50.0% | 0.0% |
| freedfrida | Footwork | 44 | 65.9% | 65.9% | 0.0% |
| frej | Counter | 56 | 46.4% | 46.4% | 0.0% |
| freshprince | Counter | 76 | 55.3% | 55.3% | 0.0% |
| ghostsprotocol | Zoning | 52 | 46.2% | 46.2% | 0.0% |
| giavannykitchens | Pressure | 68 | 38.2% | 38.2% | 0.0% |
| glow | Counter | 64 | 50.0% | 50.0% | 0.0% |
| gluttony | Zoning | 76 | 47.4% | 47.4% | 0.0% |
| godether | Counter | 64 | 50.0% | 50.0% | 0.0% |
| godmod3d | Paired | 56 | 48.2% | 48.2% | 0.0% |
| godsson | Counter | 84 | 46.4% | 46.4% | 0.0% |
| gpm | Brawler | 64 | 34.4% | 34.4% | 0.0% |
| greatcharly | Footwork | 76 | 60.5% | 60.5% | 0.0% |
| gryph | Paired | 68 | 39.7% | 39.7% | 0.0% |
| guest07 | Pressure | 68 | 44.1% | 44.1% | 0.0% |
| guest08 | Zoning | 100 | 52.0% | 52.0% | 0.0% |
| guest09 | Pressure | 52 | 53.8% | 53.8% | 0.0% |
| guest10 | Zoning | 56 | 60.7% | 60.7% | 0.0% |
| guest11 | Counter | 84 | 47.6% | 47.6% | 0.0% |
| guest12 | Zoning | 56 | 67.9% | 67.9% | 0.0% |
| guest13 | Counter | 68 | 73.5% | 73.5% | 0.0% |
| guest14 | Counter | 92 | 58.7% | 58.7% | 0.0% |
| hdizzy | Zoning | 72 | 47.2% | 47.2% | 0.0% |
| herbpowell | Counter | 52 | 46.2% | 46.2% | 0.0% |
| hermionemichelleamyrose | Footwork | 60 | 45.0% | 45.0% | 0.0% |
| highsproto | Zoning | 76 | 47.4% | 47.4% | 0.0% |
| homosproto | Footwork | 52 | 48.1% | 48.1% | 0.0% |
| indiapolice | Counter | 68 | 38.2% | 38.2% | 0.0% |
| infinitysplitter | Footwork | 64 | 40.6% | 40.6% | 0.0% |
| isaac | Footwork | 56 | 57.1% | 57.1% | 0.0% |
| jameskaminski | Pressure | 84 | 40.5% | 40.5% | 0.0% |
| janitor | Brawler | 64 | 64.1% | 64.1% | 0.0% |
| jasper | Footwork | 56 | 67.9% | 67.9% | 0.0% |
| jayquant | Counter | 76 | 36.8% | 36.8% | 0.0% |
| johnson | Brawler | 68 | 42.6% | 42.6% | 0.0% |
| julian | Counter | 92 | 45.7% | 45.7% | 0.0% |
| kern | Counter | 76 | 42.1% | 42.1% | 0.0% |
| kerrieanne | Counter | 68 | 45.6% | 45.6% | 0.0% |
| laserbach | Pressure | 56 | 57.1% | 57.1% | 0.0% |
| lestrange | Footwork | 48 | 41.7% | 41.7% | 0.0% |
| leviosa | Footwork | 76 | 60.5% | 60.5% | 0.0% |
| lifeisameme | Pressure | 72 | 47.2% | 47.2% | 0.0% |
| lilgoldied | Counter | 56 | 32.1% | 32.1% | 0.0% |
| loadthebags | Pressure | 80 | 57.5% | 57.5% | 0.0% |
| loqi | Counter | 68 | 61.8% | 61.8% | 0.0% |
| lowernipple | Zoning | 60 | 53.3% | 53.3% | 0.0% |
| mandela | Weapon | 68 | 41.2% | 41.2% | 0.0% |
| marfrog | Footwork | 76 | 44.7% | 44.7% | 0.0% |
| maxbiggums | Brawler | 56 | 60.7% | 60.7% | 0.0% |
| melo | Weapon | 88 | 48.9% | 48.9% | 0.0% |
| michael | Weapon | 64 | 54.7% | 54.7% | 0.0% |
| micsash | Counter | 72 | 44.4% | 44.4% | 0.0% |
| mikemike | Brawler | 68 | 41.2% | 41.2% | 0.0% |
| mildtacos | Footwork | 40 | 20.0% | 20.0% | 0.0% |
| mlk | Counter | 52 | 46.2% | 46.2% | 0.0% |
| moonshiller | Brawler | 64 | 43.8% | 43.8% | 0.0% |
| mox | Counter | 52 | 48.1% | 48.1% | 0.0% |
| mrgoldrobe | Counter | 68 | 52.9% | 52.9% | 0.0% |
| mrhorsemeat | Counter | 84 | 54.8% | 54.8% | 0.0% |
| nate | Pressure | 72 | 36.1% | 36.1% | 0.0% |
| nick | Pressure | 68 | 47.1% | 47.1% | 0.0% |
| nomis | Pressure | 56 | 53.6% | 53.6% | 0.0% |
| nosmileclown | Paired | 64 | 51.6% | 50.8% | 1.6% |
| np | Footwork | 48 | 58.3% | 58.3% | 0.0% |
| obamasega420 | Footwork | 60 | 56.7% | 56.7% | 0.0% |
| olnoname | Footwork | 60 | 53.3% | 53.3% | 0.0% |
| onememeaday | Pressure | 80 | 43.8% | 43.8% | 0.0% |
| osho | Footwork | 52 | 44.2% | 44.2% | 0.0% |
| otorps | Counter | 68 | 69.1% | 69.1% | 0.0% |
| pars | Brawler | 68 | 52.9% | 52.9% | 0.0% |
| peterpan | Paired | 56 | 48.2% | 48.2% | 0.0% |
| pilgrim | Brawler | 56 | 64.3% | 64.3% | 0.0% |
| pinewaffle | Pressure | 60 | 50.0% | 50.0% | 0.0% |
| pirate | Footwork | 60 | 43.3% | 43.3% | 0.0% |
| pongohpos10i | Zoning | 96 | 47.9% | 47.9% | 0.0% |
| potocaicai | Counter | 52 | 42.3% | 42.3% | 0.0% |
| pr0lificeth | Zoning | 52 | 50.0% | 50.0% | 0.0% |
| prim | Zoning | 32 | 62.5% | 62.5% | 0.0% |
| rainman | Footwork | 68 | 45.6% | 45.6% | 0.0% |
| razz | Counter | 56 | 39.3% | 39.3% | 0.0% |
| realityarchitect | Counter | 68 | 50.0% | 50.0% | 0.0% |
| rektina | Footwork | 36 | 61.1% | 61.1% | 0.0% |
| renzo | Pressure | 80 | 47.5% | 47.5% | 0.0% |
| reverend | Footwork | 64 | 60.9% | 60.9% | 0.0% |
| rivet | Pressure | 48 | 41.7% | 41.7% | 0.0% |
| rlarsson | Footwork | 84 | 46.4% | 46.4% | 0.0% |
| rmacpdx | Footwork | 80 | 66.3% | 66.3% | 0.0% |
| rune | Counter | 52 | 71.2% | 71.2% | 0.0% |
| saburdo | Pressure | 64 | 62.5% | 62.5% | 0.0% |
| samixsproto | Zoning | 60 | 60.0% | 60.0% | 0.0% |
| satoshi | Pressure | 48 | 50.0% | 50.0% | 0.0% |
| seph0x | Counter | 72 | 47.2% | 47.2% | 0.0% |
| sidelinereferee | Zoning | 88 | 50.0% | 50.0% | 0.0% |
| sirbitcoin | Counter | 48 | 58.3% | 58.3% | 0.0% |
| sirdidit | Footwork | 64 | 53.1% | 53.1% | 0.0% |
| sisma | Pressure | 72 | 58.3% | 58.3% | 0.0% |
| slabcorn | Brawler | 48 | 58.3% | 58.3% | 0.0% |
| slakesly | Counter | 64 | 53.1% | 53.1% | 0.0% |
| sober | Footwork | 52 | 73.1% | 73.1% | 0.0% |
| solanadelray | Paired | 48 | 33.3% | 33.3% | 0.0% |
| sprog | Footwork | 88 | 52.3% | 52.3% | 0.0% |
| sproteth | Footwork | 68 | 44.1% | 44.1% | 0.0% |
| sproto1011 | Weapon | 84 | 51.2% | 51.2% | 0.0% |
| sproto102 | Footwork | 72 | 58.3% | 58.3% | 0.0% |
| sproto1093 | Footwork | 44 | 36.4% | 36.4% | 0.0% |
| sproto1187 | Footwork | 76 | 47.4% | 47.4% | 0.0% |
| sproto1335 | Footwork | 64 | 62.5% | 62.5% | 0.0% |
| sproto1345 | Footwork | 52 | 42.3% | 42.3% | 0.0% |
| sproto1414 | Footwork | 72 | 50.0% | 50.0% | 0.0% |
| sproto1477 | Footwork | 56 | 57.1% | 57.1% | 0.0% |
| sproto1499 | Paired | 68 | 42.6% | 42.6% | 0.0% |
| sproto1601 | Zoning | 64 | 65.6% | 65.6% | 0.0% |
| sproto1625 | Paired | 60 | 41.7% | 41.7% | 0.0% |
| sproto1668 | Footwork | 52 | 46.2% | 46.2% | 0.0% |
| sproto1815 | Weapon | 64 | 43.8% | 43.8% | 0.0% |
| sproto1870 | Hover | 60 | 46.7% | 46.7% | 0.0% |
| sproto2010 | Paired | 52 | 53.8% | 53.8% | 0.0% |
| sproto2075 | Paired | 52 | 36.5% | 36.5% | 0.0% |
| sproto2101 | Footwork | 64 | 57.8% | 57.8% | 0.0% |
| sproto215 | Footwork | 64 | 56.3% | 56.3% | 0.0% |
| sproto2177 | Footwork | 80 | 43.8% | 43.8% | 0.0% |
| sproto2210 | Paired | 60 | 53.3% | 53.3% | 0.0% |
| sproto2322 | Footwork | 52 | 48.1% | 48.1% | 0.0% |
| sproto2344 | Paired | 72 | 38.9% | 38.9% | 0.0% |
| sproto2381 | Footwork | 60 | 60.0% | 60.0% | 0.0% |
| sproto2531 | Zoning | 64 | 56.3% | 56.3% | 0.0% |
| sproto2569 | Footwork | 64 | 53.1% | 53.1% | 0.0% |
| sproto2616 | Weapon | 60 | 45.0% | 45.0% | 0.0% |
| sproto2789 | Weapon | 64 | 31.3% | 31.3% | 0.0% |
| sproto282 | Paired | 72 | 41.7% | 41.7% | 0.0% |
| sproto2884 | Footwork | 36 | 61.1% | 61.1% | 0.0% |
| sproto3106 | Zoning | 76 | 44.7% | 44.7% | 0.0% |
| sproto313 | Footwork | 64 | 62.5% | 62.5% | 0.0% |
| sproto3152 | Zoning | 68 | 64.7% | 64.7% | 0.0% |
| sproto3181 | Paired | 64 | 31.3% | 31.3% | 0.0% |
| sproto3215 | Footwork | 68 | 55.9% | 55.9% | 0.0% |
| sproto3224 | Paired | 48 | 52.1% | 52.1% | 0.0% |
| sproto3235 | Paired | 60 | 48.3% | 48.3% | 0.0% |
| sproto651 | Footwork | 48 | 33.3% | 33.3% | 0.0% |
| sproto704 | Paired | 56 | 42.9% | 42.9% | 0.0% |
| sproto763 | Footwork | 76 | 63.2% | 63.2% | 0.0% |
| sproto818 | Footwork | 64 | 62.5% | 62.5% | 0.0% |
| sproto831 | Footwork | 48 | 54.2% | 54.2% | 0.0% |
| sproto832 | Paired | 56 | 69.6% | 69.6% | 0.0% |
| sproto834 | Footwork | 40 | 45.0% | 45.0% | 0.0% |
| sproto837 | Footwork | 72 | 43.1% | 43.1% | 0.0% |
| sproto865 | Footwork | 56 | 58.9% | 58.9% | 0.0% |
| sproto943 | Footwork | 68 | 55.9% | 55.9% | 0.0% |
| sproto999 | Footwork | 60 | 53.3% | 53.3% | 0.0% |
| sprotocius | Counter | 64 | 64.1% | 64.1% | 0.0% |
| sprotolg | Zoning | 52 | 57.7% | 57.7% | 0.0% |
| sprotomichaelsaylor | Zoning | 52 | 42.3% | 42.3% | 0.0% |
| sprotomidnightfx | Pressure | 68 | 55.9% | 55.9% | 0.0% |
| sprotopia | Zoning | 48 | 54.2% | 54.2% | 0.0% |
| sprotopotamus | Brawler | 76 | 52.6% | 52.6% | 0.0% |
| sprotosales | Footwork | 68 | 50.0% | 50.0% | 0.0% |
| sprotosurvivor | Zoning | 56 | 42.9% | 42.9% | 0.0% |
| spruto | Footwork | 56 | 67.9% | 67.9% | 0.0% |
| spunow | Footwork | 44 | 50.0% | 50.0% | 0.0% |
| stonkyleg69 | Footwork | 56 | 41.1% | 41.1% | 0.0% |
| stoto | Pressure | 56 | 37.5% | 37.5% | 0.0% |
| sweatpantstrust | Counter | 68 | 47.1% | 47.1% | 0.0% |
| tdeth | Pressure | 84 | 51.2% | 51.2% | 0.0% |
| teahupoo | Counter | 44 | 59.1% | 59.1% | 0.0% |
| theo | Zoning | 68 | 39.7% | 39.7% | 0.0% |
| thesprotowholivedeth | Zoning | 56 | 51.8% | 51.8% | 0.0% |
| thxobama | Counter | 64 | 46.9% | 46.9% | 0.0% |
| tingsmol | Footwork | 64 | 42.2% | 42.2% | 0.0% |
| tradertimmy | Counter | 72 | 58.3% | 58.3% | 0.0% |
| twinnyneutron | Paired | 56 | 50.0% | 50.0% | 0.0% |
| uncmasterflex | Footwork | 48 | 52.1% | 52.1% | 0.0% |
| urmometh | Footwork | 68 | 61.8% | 61.8% | 0.0% |
| usedtowels | Counter | 80 | 40.0% | 40.0% | 0.0% |
| vamp | Zoning | 56 | 69.6% | 69.6% | 0.0% |
| vaudream | Hover | 60 | 55.0% | 55.0% | 0.0% |
| vela | Zoning | 72 | 51.4% | 51.4% | 0.0% |
| veryseriousinvestor | Footwork | 72 | 47.2% | 47.2% | 0.0% |
| vicoo | Counter | 68 | 38.2% | 38.2% | 0.0% |
| vitaliketh | Footwork | 64 | 40.6% | 40.6% | 0.0% |
| wifebeater | Brawler | 80 | 62.5% | 62.5% | 0.0% |
| willuminati | Counter | 80 | 65.0% | 65.0% | 0.0% |
| wireitwell | Pressure | 80 | 46.3% | 46.3% | 0.0% |
| wyrmblvnt | Footwork | 64 | 37.5% | 37.5% | 0.0% |
| xalt | Zoning | 56 | 41.1% | 41.1% | 0.0% |
| xav | Footwork | 56 | 62.5% | 62.5% | 0.0% |
| yusuf | Pressure | 44 | 56.8% | 56.8% | 0.0% |
| zakarum | Footwork | 52 | 38.5% | 38.5% | 0.0% |
| zebracorn | Counter | 76 | 36.8% | 36.8% | 0.0% |
| zephyr | Brawler | 76 | 46.1% | 46.1% | 0.0% |
| zepump | Paired | 68 | 55.9% | 55.9% | 0.0% |
| zippy | Pressure | 52 | 42.3% | 42.3% | 0.0% |
| zudi | Counter | 72 | 52.8% | 52.8% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs croy | 4 | 0.0% |
| 86gwei vs feistyboi | 4 | 0.0% |
| 86gwei vs gluttony | 4 | 0.0% |
| 86gwei vs mildtacos | 4 | 100.0% |
| 86gwei vs nomis | 4 | 0.0% |
| 86gwei vs np | 4 | 100.0% |
| 86gwei vs sproto2381 | 4 | 0.0% |
| 86gwei vs sweatpantstrust | 4 | 100.0% |
| aaron vs autistophrenicsprotagonist | 4 | 0.0% |
| aaron vs captain | 4 | 0.0% |
