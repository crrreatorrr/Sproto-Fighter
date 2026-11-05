# Balance tournament

Source: `db5508c5d1f3b94204328fa966f656e4a6b76d20`; simulation `373448bdc043a0e8`; source SHA-256 `6dbb1f97b0bdedd2d0de3f21ef694c170f1e2fbd11f8ac74d22d047dd6f4c0f4`.

Seed 20261105; 254 fighters; 4184 sampled pairs; 2 repetitions; 3600-frame cap; cpu opponents.

Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.

Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.

Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes use canonical BALANCE_KITS assignments when available; legacy cores use analysis groupings of existing roles. Small-sample extremes are diagnostic, not confidence bounds.

The parameterized CPU receives the requested skill for each level.

Reference controller: reference-v2-persistent-delay18. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.

One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.

## Skill 4

16736 bouts; raw draws 0.0% (7); unresolved 0.0% (6); timeouts 0. Mean 28.79 s; median 28.80 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 49.9% | 49.9% | 0.0% | 5.27 s |
| 2 | 50.1% | 50.1% | 0.0% | 5.27 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 11092 | 56.7% | 56.7% | 0.0% |
| Counter | 6632 | 54.5% | 54.5% | 0.1% |
| Pressure | 4064 | 48.7% | 48.7% | 0.0% |
| Zoning | 4964 | 37.3% | 37.3% | 0.0% |
| Paired | 2592 | 45.1% | 45.1% | 0.1% |
| Weapon | 1148 | 51.4% | 51.4% | 0.0% |
| Brawler | 2732 | 40.9% | 40.9% | 0.1% |
| Hover | 248 | 49.2% | 49.2% | 0.0% |

Damage: melee 16995769; projectile 7189929; special 930884; throw 1843715.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 128 | 53.1% | 53.1% | 0.0% |
| aaron | Footwork | 144 | 60.4% | 60.4% | 0.0% |
| accidentallyrich | Counter | 124 | 58.9% | 58.9% | 0.0% |
| agentsproto | Brawler | 104 | 44.2% | 44.2% | 0.0% |
| aktree | Zoning | 112 | 30.4% | 30.4% | 0.0% |
| aleksander | Counter | 116 | 62.1% | 62.1% | 0.0% |
| alpha777 | Pressure | 128 | 50.8% | 50.8% | 0.0% |
| anni | Pressure | 116 | 51.7% | 51.7% | 0.0% |
| autistophrenicsprotagonist | Footwork | 116 | 54.3% | 54.3% | 0.0% |
| azkarah | Zoning | 92 | 45.7% | 45.7% | 0.0% |
| benjamin | Footwork | 144 | 56.9% | 56.9% | 0.0% |
| berserk | Footwork | 120 | 57.5% | 57.5% | 0.0% |
| bgbadger | Zoning | 96 | 32.3% | 32.3% | 0.0% |
| bidnehhh | Pressure | 116 | 50.0% | 50.0% | 0.0% |
| bigal | Brawler | 120 | 35.8% | 35.8% | 0.0% |
| bigswole | Brawler | 112 | 39.3% | 39.3% | 0.0% |
| bimba | Footwork | 140 | 55.0% | 55.0% | 0.0% |
| bitcoind1rk | Footwork | 164 | 60.4% | 60.7% | 0.6% |
| blorfo | Weapon | 168 | 61.3% | 61.3% | 0.0% |
| bobdobbs | Footwork | 152 | 52.6% | 52.6% | 0.0% |
| brainsprot | Footwork | 132 | 61.4% | 61.4% | 0.0% |
| bront | Brawler | 100 | 47.0% | 47.0% | 0.0% |
| bs9090eth | Zoning | 112 | 37.5% | 37.5% | 0.0% |
| buddhashadow | Footwork | 140 | 55.0% | 55.0% | 0.0% |
| cam | Brawler | 132 | 47.0% | 47.0% | 0.0% |
| cantankerous | Pressure | 88 | 43.2% | 43.2% | 0.0% |
| captain | Zoning | 148 | 37.2% | 37.2% | 0.0% |
| captainhowdy | Footwork | 124 | 62.9% | 62.9% | 0.0% |
| ceo | Zoning | 112 | 42.9% | 42.9% | 0.0% |
| chaton | Footwork | 120 | 58.3% | 58.3% | 0.0% |
| chonky | Footwork | 152 | 55.3% | 55.3% | 0.0% |
| chrisfowler | Counter | 116 | 50.0% | 50.0% | 0.0% |
| ciphersproto | Pressure | 160 | 51.2% | 51.2% | 0.0% |
| clobrwn | Footwork | 144 | 43.1% | 43.1% | 0.0% |
| contresens | Zoning | 108 | 31.5% | 31.5% | 0.0% |
| corn | Pressure | 140 | 48.6% | 48.6% | 0.0% |
| crapto | Zoning | 132 | 41.7% | 41.7% | 0.0% |
| crippledlover | Footwork | 120 | 51.7% | 51.7% | 0.0% |
| croy | Counter | 156 | 51.3% | 51.3% | 0.0% |
| crumpleii | Brawler | 120 | 30.8% | 30.8% | 0.0% |
| cryptobartender | Zoning | 140 | 37.1% | 37.1% | 0.0% |
| cryptoboy | Counter | 100 | 52.0% | 52.0% | 0.0% |
| cryptomonger | Footwork | 132 | 66.7% | 66.7% | 0.0% |
| cryptorizzler | Counter | 140 | 45.7% | 45.7% | 0.0% |
| cryptoviking420 | Pressure | 136 | 47.8% | 47.8% | 1.5% |
| cyberviber | Counter | 140 | 55.0% | 55.0% | 0.0% |
| d86 | Zoning | 128 | 26.6% | 26.6% | 0.0% |
| danocrypto | Counter | 140 | 52.9% | 52.9% | 0.0% |
| davidcd | Footwork | 124 | 54.0% | 54.0% | 0.0% |
| degenpress | Zoning | 128 | 40.6% | 40.6% | 0.0% |
| dollarbitcoin | Brawler | 120 | 41.7% | 41.7% | 0.0% |
| drzmoody | Footwork | 156 | 49.4% | 49.4% | 0.0% |
| dumpstar | Brawler | 112 | 58.2% | 58.2% | 1.8% |
| duo | Paired | 164 | 45.7% | 45.7% | 0.0% |
| durlan | Footwork | 160 | 55.0% | 55.0% | 0.0% |
| emix | Footwork | 124 | 50.8% | 50.8% | 0.0% |
| erik | Footwork | 112 | 54.5% | 54.5% | 0.0% |
| familywagon | Brawler | 152 | 37.5% | 37.5% | 0.0% |
| feistyboi | Counter | 116 | 52.6% | 52.6% | 0.0% |
| felixsprotoarc | Zoning | 124 | 33.1% | 33.1% | 0.0% |
| fiatfudder | Counter | 124 | 54.0% | 54.0% | 0.0% |
| forchaneth | Footwork | 108 | 61.1% | 61.1% | 0.0% |
| fplgremlin | Pressure | 116 | 57.8% | 57.8% | 0.0% |
| freedfrida | Footwork | 140 | 50.0% | 50.0% | 0.0% |
| frej | Counter | 112 | 48.2% | 48.2% | 0.0% |
| freshprince | Counter | 156 | 49.4% | 49.4% | 0.0% |
| ghostsprotocol | Zoning | 124 | 34.7% | 34.7% | 0.0% |
| giavannykitchens | Pressure | 148 | 54.7% | 54.7% | 0.0% |
| glow | Counter | 144 | 57.6% | 57.6% | 0.0% |
| gluttony | Zoning | 140 | 35.0% | 35.0% | 0.0% |
| godether | Counter | 124 | 65.3% | 65.3% | 0.0% |
| godmod3d | Paired | 112 | 38.4% | 38.4% | 0.0% |
| godsson | Counter | 156 | 57.1% | 57.1% | 0.0% |
| gpm | Brawler | 136 | 43.3% | 43.3% | 1.5% |
| greatcharly | Footwork | 136 | 65.4% | 65.4% | 0.0% |
| gryph | Paired | 120 | 42.5% | 42.5% | 0.0% |
| guest07 | Pressure | 148 | 60.8% | 60.8% | 0.0% |
| guest08 | Zoning | 180 | 40.0% | 40.0% | 0.0% |
| guest09 | Pressure | 108 | 52.8% | 52.8% | 0.0% |
| guest10 | Zoning | 124 | 34.7% | 34.7% | 0.0% |
| guest11 | Counter | 156 | 45.5% | 45.5% | 1.3% |
| guest12 | Zoning | 136 | 39.7% | 39.7% | 0.0% |
| guest13 | Counter | 124 | 50.0% | 50.0% | 0.0% |
| guest14 | Counter | 152 | 64.7% | 64.7% | 1.3% |
| hdizzy | Zoning | 124 | 35.5% | 35.5% | 0.0% |
| herbpowell | Counter | 120 | 62.5% | 62.5% | 0.0% |
| hermionemichelleamyrose | Footwork | 124 | 58.9% | 58.9% | 0.0% |
| highsproto | Zoning | 144 | 31.3% | 31.3% | 0.0% |
| homosproto | Footwork | 160 | 59.4% | 59.4% | 0.0% |
| indiapolice | Counter | 148 | 42.6% | 42.6% | 0.0% |
| infinitysplitter | Footwork | 148 | 54.1% | 54.1% | 0.0% |
| isaac | Footwork | 144 | 55.6% | 55.6% | 0.0% |
| jameskaminski | Pressure | 136 | 36.8% | 36.8% | 0.0% |
| janitor | Brawler | 156 | 44.2% | 44.2% | 0.0% |
| jasper | Footwork | 132 | 57.6% | 57.6% | 0.0% |
| jayquant | Counter | 132 | 65.9% | 65.9% | 0.0% |
| johnson | Brawler | 136 | 28.7% | 28.7% | 0.0% |
| julian | Counter | 180 | 51.7% | 51.7% | 0.0% |
| kern | Counter | 140 | 58.6% | 58.6% | 0.0% |
| kerrieanne | Counter | 132 | 43.2% | 43.2% | 0.0% |
| laserbach | Pressure | 112 | 37.5% | 37.5% | 0.0% |
| lestrange | Footwork | 120 | 47.5% | 47.5% | 0.0% |
| leviosa | Footwork | 120 | 48.3% | 48.3% | 0.0% |
| lifeisameme | Pressure | 136 | 58.1% | 58.1% | 0.0% |
| lilgoldied | Counter | 128 | 54.7% | 54.7% | 0.0% |
| loadthebags | Pressure | 148 | 51.4% | 51.4% | 0.0% |
| loqi | Counter | 136 | 54.4% | 54.4% | 0.0% |
| lowernipple | Zoning | 160 | 32.5% | 32.5% | 0.0% |
| mandela | Weapon | 124 | 58.1% | 58.1% | 0.0% |
| marfrog | Footwork | 132 | 58.3% | 58.3% | 0.0% |
| maxbiggums | Brawler | 116 | 37.9% | 37.9% | 0.0% |
| melo | Weapon | 152 | 44.1% | 44.1% | 0.0% |
| michael | Weapon | 144 | 50.0% | 50.0% | 0.0% |
| micsash | Counter | 132 | 59.1% | 59.1% | 0.0% |
| mikemike | Brawler | 136 | 31.6% | 31.6% | 0.0% |
| mildtacos | Footwork | 108 | 40.7% | 40.7% | 0.0% |
| mlk | Counter | 116 | 62.9% | 62.9% | 0.0% |
| moonshiller | Brawler | 124 | 40.3% | 40.3% | 0.0% |
| mox | Counter | 104 | 63.5% | 63.5% | 0.0% |
| mrgoldrobe | Counter | 148 | 53.4% | 53.4% | 0.0% |
| mrhorsemeat | Counter | 172 | 51.2% | 51.2% | 0.0% |
| nate | Pressure | 132 | 50.8% | 50.8% | 0.0% |
| nick | Pressure | 124 | 44.4% | 44.4% | 0.0% |
| nomis | Pressure | 120 | 33.3% | 33.3% | 0.0% |
| nosmileclown | Paired | 124 | 45.2% | 45.2% | 0.0% |
| np | Footwork | 148 | 53.4% | 53.4% | 0.0% |
| obamasega420 | Footwork | 140 | 60.0% | 60.0% | 0.0% |
| olnoname | Footwork | 124 | 66.9% | 66.9% | 0.0% |
| onememeaday | Pressure | 144 | 50.0% | 50.0% | 0.0% |
| osho | Footwork | 140 | 52.9% | 52.9% | 0.0% |
| otorps | Counter | 148 | 58.8% | 58.8% | 0.0% |
| pars | Brawler | 152 | 43.4% | 43.4% | 0.0% |
| peterpan | Paired | 120 | 47.5% | 47.5% | 0.0% |
| pilgrim | Brawler | 128 | 47.7% | 47.7% | 0.0% |
| pinewaffle | Pressure | 132 | 49.2% | 49.2% | 0.0% |
| pirate | Footwork | 136 | 61.8% | 61.8% | 0.0% |
| pongohpos10i | Zoning | 168 | 38.1% | 38.1% | 0.0% |
| potocaicai | Counter | 136 | 52.9% | 52.9% | 0.0% |
| pr0lificeth | Zoning | 128 | 32.8% | 32.8% | 0.0% |
| prim | Zoning | 108 | 39.8% | 39.8% | 0.0% |
| rainman | Footwork | 136 | 61.0% | 61.0% | 0.0% |
| razz | Counter | 124 | 45.2% | 45.2% | 0.0% |
| realityarchitect | Counter | 124 | 54.0% | 54.0% | 0.0% |
| rektina | Footwork | 88 | 71.6% | 71.6% | 0.0% |
| renzo | Pressure | 148 | 48.6% | 48.6% | 0.0% |
| reverend | Footwork | 124 | 58.1% | 58.1% | 0.0% |
| rivet | Pressure | 100 | 47.0% | 47.0% | 0.0% |
| rlarsson | Footwork | 144 | 52.8% | 52.8% | 0.0% |
| rmacpdx | Footwork | 148 | 59.5% | 59.5% | 0.0% |
| rune | Counter | 132 | 55.3% | 55.3% | 0.0% |
| saburdo | Pressure | 164 | 48.2% | 48.2% | 0.0% |
| samixsproto | Zoning | 112 | 42.0% | 42.0% | 0.0% |
| satoshi | Pressure | 112 | 42.0% | 42.0% | 0.0% |
| seph0x | Counter | 144 | 49.3% | 49.3% | 0.0% |
| sidelinereferee | Zoning | 148 | 37.8% | 37.8% | 0.0% |
| sirbitcoin | Counter | 120 | 55.8% | 55.8% | 0.0% |
| sirdidit | Footwork | 128 | 55.5% | 55.5% | 0.0% |
| sisma | Pressure | 132 | 45.5% | 45.5% | 0.0% |
| slabcorn | Brawler | 124 | 46.8% | 46.8% | 0.0% |
| slakesly | Counter | 136 | 56.6% | 56.6% | 0.0% |
| sober | Footwork | 124 | 64.5% | 64.5% | 0.0% |
| solanadelray | Paired | 116 | 56.0% | 56.0% | 0.0% |
| sprog | Footwork | 152 | 48.7% | 48.7% | 0.0% |
| sproteth | Footwork | 132 | 51.5% | 51.5% | 0.0% |
| sproto1011 | Weapon | 152 | 57.9% | 57.9% | 0.0% |
| sproto102 | Footwork | 136 | 61.8% | 61.8% | 0.0% |
| sproto1093 | Footwork | 136 | 55.1% | 55.1% | 0.0% |
| sproto1187 | Footwork | 144 | 58.3% | 58.3% | 0.0% |
| sproto1335 | Footwork | 124 | 62.1% | 62.1% | 0.0% |
| sproto1345 | Footwork | 124 | 66.1% | 66.1% | 0.0% |
| sproto1414 | Footwork | 132 | 61.4% | 61.4% | 0.0% |
| sproto1477 | Footwork | 144 | 54.2% | 54.2% | 0.0% |
| sproto1499 | Paired | 132 | 48.5% | 48.5% | 0.0% |
| sproto1601 | Zoning | 116 | 31.0% | 31.0% | 0.0% |
| sproto1625 | Paired | 132 | 42.4% | 42.4% | 0.0% |
| sproto1668 | Footwork | 152 | 63.2% | 63.2% | 0.0% |
| sproto1815 | Weapon | 144 | 48.6% | 48.6% | 0.0% |
| sproto1870 | Hover | 144 | 50.0% | 50.0% | 0.0% |
| sproto2010 | Paired | 124 | 46.0% | 46.0% | 0.0% |
| sproto2075 | Paired | 140 | 47.1% | 47.1% | 0.0% |
| sproto2101 | Footwork | 120 | 65.0% | 65.0% | 0.0% |
| sproto215 | Footwork | 112 | 62.5% | 62.5% | 0.0% |
| sproto2177 | Footwork | 160 | 56.9% | 56.9% | 0.0% |
| sproto2210 | Paired | 128 | 46.1% | 46.1% | 0.0% |
| sproto2322 | Footwork | 140 | 60.0% | 60.0% | 0.0% |
| sproto2344 | Paired | 144 | 43.1% | 43.1% | 0.0% |
| sproto2381 | Footwork | 120 | 51.7% | 51.7% | 0.0% |
| sproto2531 | Zoning | 140 | 45.7% | 45.7% | 0.0% |
| sproto2569 | Footwork | 124 | 53.2% | 53.2% | 0.0% |
| sproto2616 | Weapon | 120 | 29.2% | 29.2% | 0.0% |
| sproto2789 | Weapon | 144 | 57.6% | 57.6% | 0.0% |
| sproto282 | Paired | 140 | 42.1% | 42.1% | 0.0% |
| sproto2884 | Footwork | 100 | 52.0% | 52.0% | 0.0% |
| sproto3106 | Zoning | 148 | 28.4% | 28.4% | 0.0% |
| sproto313 | Footwork | 124 | 62.9% | 62.9% | 0.0% |
| sproto3152 | Zoning | 144 | 47.2% | 47.2% | 0.0% |
| sproto3181 | Paired | 136 | 42.6% | 42.6% | 0.0% |
| sproto3215 | Footwork | 128 | 67.2% | 67.2% | 0.0% |
| sproto3224 | Paired | 116 | 43.9% | 43.4% | 2.6% |
| sproto3235 | Paired | 140 | 39.3% | 39.3% | 0.0% |
| sproto651 | Footwork | 116 | 56.0% | 56.0% | 0.0% |
| sproto704 | Paired | 112 | 43.8% | 43.8% | 0.0% |
| sproto763 | Footwork | 136 | 55.9% | 55.9% | 0.0% |
| sproto818 | Footwork | 132 | 58.3% | 58.3% | 0.0% |
| sproto831 | Footwork | 104 | 60.6% | 60.6% | 0.0% |
| sproto832 | Paired | 132 | 47.7% | 47.7% | 0.0% |
| sproto834 | Footwork | 100 | 56.0% | 56.0% | 0.0% |
| sproto837 | Footwork | 136 | 62.5% | 62.5% | 0.0% |
| sproto865 | Footwork | 112 | 57.1% | 57.1% | 0.0% |
| sproto943 | Footwork | 124 | 54.8% | 54.8% | 0.0% |
| sproto999 | Footwork | 136 | 44.1% | 44.1% | 0.0% |
| sprotocius | Counter | 132 | 50.8% | 50.8% | 0.0% |
| sprotolg | Zoning | 136 | 39.7% | 39.7% | 0.0% |
| sprotomichaelsaylor | Zoning | 136 | 47.1% | 47.1% | 0.0% |
| sprotomidnightfx | Pressure | 140 | 43.6% | 43.6% | 0.0% |
| sprotopia | Zoning | 124 | 41.9% | 41.9% | 0.0% |
| sprotopotamus | Brawler | 148 | 33.8% | 33.8% | 0.0% |
| sprotosales | Footwork | 124 | 64.5% | 64.5% | 0.0% |
| sprotosurvivor | Zoning | 112 | 36.6% | 36.6% | 0.0% |
| spruto | Footwork | 108 | 63.0% | 63.0% | 0.0% |
| spunow | Footwork | 96 | 58.3% | 58.3% | 0.0% |
| stonkyleg69 | Footwork | 140 | 43.6% | 43.6% | 0.0% |
| stoto | Pressure | 144 | 56.9% | 56.9% | 0.0% |
| sweatpantstrust | Counter | 132 | 55.3% | 55.3% | 0.0% |
| tdeth | Pressure | 132 | 39.4% | 39.4% | 0.0% |
| teahupoo | Counter | 132 | 52.3% | 52.3% | 0.0% |
| theo | Zoning | 140 | 40.7% | 40.7% | 0.0% |
| thesprotowholivedeth | Zoning | 148 | 38.5% | 38.5% | 0.0% |
| thxobama | Counter | 132 | 51.5% | 51.5% | 0.0% |
| tingsmol | Footwork | 120 | 53.3% | 53.3% | 0.0% |
| tradertimmy | Counter | 140 | 60.7% | 60.7% | 0.0% |
| twinnyneutron | Paired | 132 | 47.0% | 47.0% | 0.0% |
| uncmasterflex | Footwork | 120 | 65.0% | 65.0% | 0.0% |
| urmometh | Footwork | 128 | 53.9% | 53.9% | 0.0% |
| usedtowels | Counter | 156 | 47.4% | 47.4% | 0.0% |
| vamp | Zoning | 120 | 43.3% | 43.3% | 0.0% |
| vaudream | Hover | 104 | 48.1% | 48.1% | 0.0% |
| vela | Zoning | 148 | 34.5% | 34.5% | 0.0% |
| veryseriousinvestor | Footwork | 140 | 46.4% | 46.4% | 0.0% |
| vicoo | Counter | 152 | 63.2% | 63.2% | 0.0% |
| vitaliketh | Footwork | 144 | 52.8% | 52.8% | 0.0% |
| wifebeater | Brawler | 152 | 46.1% | 46.1% | 0.0% |
| willuminati | Counter | 132 | 46.2% | 46.2% | 0.0% |
| wireitwell | Pressure | 136 | 52.9% | 52.9% | 0.0% |
| wyrmblvnt | Footwork | 140 | 51.4% | 51.4% | 0.0% |
| xalt | Zoning | 124 | 33.9% | 33.9% | 0.0% |
| xav | Footwork | 108 | 57.4% | 57.4% | 0.0% |
| yusuf | Pressure | 132 | 54.5% | 54.5% | 0.0% |
| zakarum | Footwork | 124 | 60.5% | 60.5% | 0.0% |
| zebracorn | Counter | 152 | 59.2% | 59.2% | 0.0% |
| zephyr | Brawler | 152 | 37.5% | 37.5% | 0.0% |
| zepump | Paired | 128 | 48.4% | 48.4% | 0.0% |
| zippy | Pressure | 136 | 44.1% | 44.1% | 0.0% |
| zudi | Counter | 124 | 64.5% | 64.5% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs homosproto | 4 | 0.0% |
| 86gwei vs mildtacos | 4 | 0.0% |
| 86gwei vs mox | 4 | 0.0% |
| 86gwei vs nomis | 4 | 100.0% |
| 86gwei vs peterpan | 4 | 100.0% |
| 86gwei vs pongohpos10i | 4 | 100.0% |
| 86gwei vs sprog | 4 | 0.0% |
| 86gwei vs sproto3181 | 4 | 0.0% |
| 86gwei vs sproto3235 | 4 | 100.0% |
| 86gwei vs sproto704 | 4 | 100.0% |

## Skill 7

16736 bouts; raw draws 0.2% (26); unresolved 0.0% (4); timeouts 22. Mean 34.35 s; median 34.15 s.

| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |
| --- | ---: | ---: | ---: | ---: |
| 1 | 50.0% | 50.0% | 0.2% | 5.96 s |
| 2 | 50.0% | 50.0% | 0.2% | 5.96 s |

| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | ---: | ---: | ---: | ---: |
| Footwork | 11092 | 55.3% | 55.3% | 0.2% |
| Counter | 6632 | 53.1% | 53.1% | 0.1% |
| Pressure | 4064 | 49.6% | 49.7% | 0.2% |
| Zoning | 4964 | 38.8% | 38.8% | 0.2% |
| Paired | 2592 | 46.4% | 46.4% | 0.1% |
| Weapon | 1148 | 50.8% | 50.8% | 0.0% |
| Brawler | 2732 | 45.5% | 45.5% | 0.1% |
| Hover | 248 | 45.6% | 45.6% | 0.0% |

Damage: melee 17473789; projectile 6692516; special 1227432; throw 1352003.

| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |
| --- | --- | ---: | ---: | ---: | ---: |
| 86gwei | Footwork | 128 | 49.2% | 48.4% | 1.6% |
| aaron | Footwork | 144 | 56.9% | 56.9% | 0.0% |
| accidentallyrich | Counter | 124 | 67.7% | 67.7% | 0.0% |
| agentsproto | Brawler | 104 | 42.3% | 42.3% | 0.0% |
| aktree | Zoning | 112 | 25.0% | 25.0% | 0.0% |
| aleksander | Counter | 116 | 48.3% | 48.3% | 0.0% |
| alpha777 | Pressure | 128 | 66.4% | 65.9% | 1.6% |
| anni | Pressure | 116 | 58.6% | 58.6% | 0.0% |
| autistophrenicsprotagonist | Footwork | 116 | 51.7% | 51.7% | 0.0% |
| azkarah | Zoning | 92 | 33.7% | 33.7% | 0.0% |
| benjamin | Footwork | 144 | 54.2% | 54.2% | 0.0% |
| berserk | Footwork | 120 | 50.8% | 50.8% | 0.0% |
| bgbadger | Zoning | 96 | 30.2% | 30.2% | 0.0% |
| bidnehhh | Pressure | 116 | 44.8% | 44.8% | 0.0% |
| bigal | Brawler | 120 | 40.0% | 40.0% | 0.0% |
| bigswole | Brawler | 112 | 50.0% | 50.0% | 0.0% |
| bimba | Footwork | 140 | 35.0% | 35.0% | 0.0% |
| bitcoind1rk | Footwork | 164 | 57.3% | 57.3% | 0.0% |
| blorfo | Weapon | 168 | 53.6% | 53.6% | 0.0% |
| bobdobbs | Footwork | 152 | 56.6% | 56.6% | 0.0% |
| brainsprot | Footwork | 132 | 56.8% | 56.8% | 0.0% |
| bront | Brawler | 100 | 34.0% | 34.0% | 0.0% |
| bs9090eth | Zoning | 112 | 41.1% | 41.1% | 0.0% |
| buddhashadow | Footwork | 140 | 50.0% | 50.0% | 0.0% |
| cam | Brawler | 132 | 50.8% | 50.8% | 0.0% |
| cantankerous | Pressure | 88 | 58.0% | 58.0% | 0.0% |
| captain | Zoning | 148 | 39.9% | 39.9% | 0.0% |
| captainhowdy | Footwork | 124 | 62.9% | 62.9% | 0.0% |
| ceo | Zoning | 112 | 38.4% | 38.4% | 0.0% |
| chaton | Footwork | 120 | 52.5% | 52.5% | 1.7% |
| chonky | Footwork | 152 | 63.2% | 63.2% | 0.0% |
| chrisfowler | Counter | 116 | 55.2% | 56.1% | 1.7% |
| ciphersproto | Pressure | 160 | 41.9% | 42.4% | 1.3% |
| clobrwn | Footwork | 144 | 56.9% | 56.9% | 0.0% |
| contresens | Zoning | 108 | 41.7% | 41.7% | 0.0% |
| corn | Pressure | 140 | 52.1% | 52.1% | 0.0% |
| crapto | Zoning | 132 | 38.6% | 38.6% | 0.0% |
| crippledlover | Footwork | 120 | 55.8% | 55.8% | 0.0% |
| croy | Counter | 156 | 59.0% | 59.0% | 0.0% |
| crumpleii | Brawler | 120 | 46.7% | 46.7% | 0.0% |
| cryptobartender | Zoning | 140 | 30.7% | 30.7% | 0.0% |
| cryptoboy | Counter | 100 | 43.0% | 43.0% | 0.0% |
| cryptomonger | Footwork | 132 | 48.5% | 48.5% | 0.0% |
| cryptorizzler | Counter | 140 | 42.1% | 42.1% | 0.0% |
| cryptoviking420 | Pressure | 136 | 39.7% | 39.7% | 0.0% |
| cyberviber | Counter | 140 | 49.3% | 49.3% | 0.0% |
| d86 | Zoning | 128 | 39.7% | 39.7% | 1.6% |
| danocrypto | Counter | 140 | 59.3% | 59.3% | 0.0% |
| davidcd | Footwork | 124 | 58.1% | 58.1% | 0.0% |
| degenpress | Zoning | 128 | 28.1% | 28.1% | 0.0% |
| dollarbitcoin | Brawler | 120 | 40.8% | 40.8% | 0.0% |
| drzmoody | Footwork | 156 | 45.5% | 45.5% | 0.0% |
| dumpstar | Brawler | 112 | 51.8% | 50.9% | 1.8% |
| duo | Paired | 164 | 42.7% | 42.3% | 0.6% |
| durlan | Footwork | 160 | 49.4% | 49.4% | 0.0% |
| emix | Footwork | 124 | 67.7% | 67.7% | 0.0% |
| erik | Footwork | 112 | 56.3% | 56.3% | 0.0% |
| familywagon | Brawler | 152 | 47.4% | 47.4% | 0.0% |
| feistyboi | Counter | 116 | 62.1% | 62.1% | 0.0% |
| felixsprotoarc | Zoning | 124 | 41.9% | 41.9% | 0.0% |
| fiatfudder | Counter | 124 | 44.4% | 44.4% | 0.0% |
| forchaneth | Footwork | 108 | 51.9% | 51.9% | 0.0% |
| fplgremlin | Pressure | 116 | 68.1% | 68.1% | 0.0% |
| freedfrida | Footwork | 140 | 62.9% | 62.9% | 0.0% |
| frej | Counter | 112 | 58.9% | 58.9% | 0.0% |
| freshprince | Counter | 156 | 50.0% | 50.0% | 0.0% |
| ghostsprotocol | Zoning | 124 | 40.3% | 40.3% | 0.0% |
| giavannykitchens | Pressure | 148 | 50.0% | 50.0% | 0.0% |
| glow | Counter | 144 | 57.6% | 57.6% | 0.0% |
| gluttony | Zoning | 140 | 37.1% | 37.7% | 1.4% |
| godether | Counter | 124 | 48.4% | 48.4% | 0.0% |
| godmod3d | Paired | 112 | 48.2% | 48.2% | 0.0% |
| godsson | Counter | 156 | 47.4% | 47.4% | 0.0% |
| gpm | Brawler | 136 | 42.6% | 42.6% | 0.0% |
| greatcharly | Footwork | 136 | 62.5% | 62.5% | 0.0% |
| gryph | Paired | 120 | 39.2% | 39.2% | 0.0% |
| guest07 | Pressure | 148 | 46.6% | 46.6% | 0.0% |
| guest08 | Zoning | 180 | 42.8% | 42.8% | 0.0% |
| guest09 | Pressure | 108 | 43.4% | 43.4% | 1.9% |
| guest10 | Zoning | 124 | 47.6% | 47.6% | 0.0% |
| guest11 | Counter | 156 | 50.0% | 50.0% | 0.0% |
| guest12 | Zoning | 136 | 35.3% | 34.3% | 1.5% |
| guest13 | Counter | 124 | 58.1% | 58.1% | 0.0% |
| guest14 | Counter | 152 | 61.2% | 61.2% | 0.0% |
| hdizzy | Zoning | 124 | 50.0% | 50.0% | 0.0% |
| herbpowell | Counter | 120 | 43.3% | 43.3% | 0.0% |
| hermionemichelleamyrose | Footwork | 124 | 59.7% | 59.7% | 0.0% |
| highsproto | Zoning | 144 | 47.2% | 47.2% | 0.0% |
| homosproto | Footwork | 160 | 53.8% | 53.8% | 0.0% |
| indiapolice | Counter | 148 | 49.3% | 49.3% | 0.0% |
| infinitysplitter | Footwork | 148 | 57.4% | 57.4% | 0.0% |
| isaac | Footwork | 144 | 59.7% | 59.7% | 0.0% |
| jameskaminski | Pressure | 136 | 48.5% | 48.5% | 0.0% |
| janitor | Brawler | 156 | 43.6% | 43.6% | 0.0% |
| jasper | Footwork | 132 | 59.1% | 60.0% | 1.5% |
| jayquant | Counter | 132 | 57.6% | 57.6% | 0.0% |
| johnson | Brawler | 136 | 44.9% | 44.9% | 0.0% |
| julian | Counter | 180 | 51.1% | 51.1% | 0.0% |
| kern | Counter | 140 | 46.4% | 46.4% | 0.0% |
| kerrieanne | Counter | 132 | 50.8% | 50.8% | 0.0% |
| laserbach | Pressure | 112 | 57.1% | 57.1% | 0.0% |
| lestrange | Footwork | 120 | 57.5% | 57.5% | 0.0% |
| leviosa | Footwork | 120 | 57.5% | 57.5% | 0.0% |
| lifeisameme | Pressure | 136 | 41.2% | 41.2% | 0.0% |
| lilgoldied | Counter | 128 | 46.1% | 46.1% | 0.0% |
| loadthebags | Pressure | 148 | 52.7% | 52.7% | 0.0% |
| loqi | Counter | 136 | 57.4% | 57.0% | 0.7% |
| lowernipple | Zoning | 160 | 23.8% | 23.8% | 0.0% |
| mandela | Weapon | 124 | 41.9% | 41.9% | 0.0% |
| marfrog | Footwork | 132 | 59.1% | 59.1% | 0.0% |
| maxbiggums | Brawler | 116 | 38.8% | 38.8% | 0.0% |
| melo | Weapon | 152 | 52.0% | 52.0% | 0.0% |
| michael | Weapon | 144 | 52.1% | 52.1% | 0.0% |
| micsash | Counter | 132 | 53.0% | 53.0% | 0.0% |
| mikemike | Brawler | 136 | 43.4% | 43.4% | 0.0% |
| mildtacos | Footwork | 108 | 53.7% | 53.7% | 0.0% |
| mlk | Counter | 116 | 62.9% | 62.3% | 1.7% |
| moonshiller | Brawler | 124 | 47.6% | 47.6% | 0.0% |
| mox | Counter | 104 | 67.3% | 67.3% | 0.0% |
| mrgoldrobe | Counter | 148 | 51.4% | 51.4% | 0.0% |
| mrhorsemeat | Counter | 172 | 53.5% | 53.5% | 0.0% |
| nate | Pressure | 132 | 53.8% | 53.8% | 0.0% |
| nick | Pressure | 124 | 41.1% | 41.1% | 0.0% |
| nomis | Pressure | 120 | 50.8% | 50.8% | 0.0% |
| nosmileclown | Paired | 124 | 48.4% | 48.4% | 0.0% |
| np | Footwork | 148 | 50.0% | 50.0% | 0.0% |
| obamasega420 | Footwork | 140 | 52.9% | 52.9% | 0.0% |
| olnoname | Footwork | 124 | 53.2% | 53.2% | 0.0% |
| onememeaday | Pressure | 144 | 44.4% | 44.4% | 0.0% |
| osho | Footwork | 140 | 67.9% | 67.9% | 0.0% |
| otorps | Counter | 148 | 54.7% | 54.7% | 0.0% |
| pars | Brawler | 152 | 45.4% | 45.4% | 0.0% |
| peterpan | Paired | 120 | 52.5% | 52.5% | 0.0% |
| pilgrim | Brawler | 128 | 45.3% | 45.3% | 0.0% |
| pinewaffle | Pressure | 132 | 54.5% | 54.5% | 0.0% |
| pirate | Footwork | 136 | 59.6% | 59.6% | 0.0% |
| pongohpos10i | Zoning | 168 | 38.1% | 38.1% | 0.0% |
| potocaicai | Counter | 136 | 43.4% | 43.4% | 0.0% |
| pr0lificeth | Zoning | 128 | 43.8% | 43.8% | 0.0% |
| prim | Zoning | 108 | 36.1% | 36.1% | 0.0% |
| rainman | Footwork | 136 | 60.3% | 60.3% | 0.0% |
| razz | Counter | 124 | 58.9% | 58.9% | 0.0% |
| realityarchitect | Counter | 124 | 48.4% | 48.4% | 0.0% |
| rektina | Footwork | 88 | 55.7% | 55.7% | 0.0% |
| renzo | Pressure | 148 | 42.6% | 42.6% | 0.0% |
| reverend | Footwork | 124 | 58.9% | 58.9% | 0.0% |
| rivet | Pressure | 100 | 45.0% | 45.0% | 0.0% |
| rlarsson | Footwork | 144 | 56.3% | 56.3% | 0.0% |
| rmacpdx | Footwork | 148 | 57.4% | 57.4% | 0.0% |
| rune | Counter | 132 | 57.6% | 57.6% | 0.0% |
| saburdo | Pressure | 164 | 47.6% | 47.6% | 0.0% |
| samixsproto | Zoning | 112 | 48.2% | 48.2% | 0.0% |
| satoshi | Pressure | 112 | 49.1% | 50.0% | 1.8% |
| seph0x | Counter | 144 | 52.8% | 52.8% | 0.0% |
| sidelinereferee | Zoning | 148 | 41.9% | 41.9% | 0.0% |
| sirbitcoin | Counter | 120 | 55.0% | 55.0% | 0.0% |
| sirdidit | Footwork | 128 | 61.7% | 62.2% | 0.8% |
| sisma | Pressure | 132 | 47.0% | 47.7% | 1.5% |
| slabcorn | Brawler | 124 | 53.2% | 53.2% | 0.0% |
| slakesly | Counter | 136 | 52.9% | 52.9% | 0.0% |
| sober | Footwork | 124 | 50.8% | 50.0% | 1.6% |
| solanadelray | Paired | 116 | 37.9% | 37.9% | 0.0% |
| sprog | Footwork | 152 | 46.7% | 46.7% | 0.0% |
| sproteth | Footwork | 132 | 49.2% | 50.0% | 1.5% |
| sproto1011 | Weapon | 152 | 49.3% | 49.3% | 0.0% |
| sproto102 | Footwork | 136 | 61.8% | 61.8% | 0.0% |
| sproto1093 | Footwork | 136 | 58.1% | 58.1% | 0.0% |
| sproto1187 | Footwork | 144 | 60.4% | 61.3% | 1.4% |
| sproto1335 | Footwork | 124 | 52.4% | 52.4% | 0.0% |
| sproto1345 | Footwork | 124 | 64.5% | 64.5% | 0.0% |
| sproto1414 | Footwork | 132 | 62.1% | 62.1% | 0.0% |
| sproto1477 | Footwork | 144 | 54.9% | 54.9% | 0.0% |
| sproto1499 | Paired | 132 | 46.2% | 46.2% | 0.0% |
| sproto1601 | Zoning | 116 | 39.7% | 39.7% | 0.0% |
| sproto1625 | Paired | 132 | 53.0% | 53.0% | 0.0% |
| sproto1668 | Footwork | 152 | 55.3% | 55.4% | 2.6% |
| sproto1815 | Weapon | 144 | 61.1% | 61.1% | 0.0% |
| sproto1870 | Hover | 144 | 47.2% | 47.2% | 0.0% |
| sproto2010 | Paired | 124 | 42.7% | 42.7% | 0.0% |
| sproto2075 | Paired | 140 | 42.1% | 42.1% | 0.0% |
| sproto2101 | Footwork | 120 | 59.2% | 59.2% | 0.0% |
| sproto215 | Footwork | 112 | 58.0% | 58.0% | 0.0% |
| sproto2177 | Footwork | 160 | 54.4% | 54.4% | 0.0% |
| sproto2210 | Paired | 128 | 41.4% | 41.7% | 0.8% |
| sproto2322 | Footwork | 140 | 63.6% | 63.6% | 0.0% |
| sproto2344 | Paired | 144 | 44.4% | 44.4% | 0.0% |
| sproto2381 | Footwork | 120 | 58.3% | 58.3% | 0.0% |
| sproto2531 | Zoning | 140 | 43.6% | 43.6% | 0.0% |
| sproto2569 | Footwork | 124 | 50.8% | 50.8% | 0.0% |
| sproto2616 | Weapon | 120 | 40.0% | 40.0% | 0.0% |
| sproto2789 | Weapon | 144 | 52.8% | 52.8% | 0.0% |
| sproto282 | Paired | 140 | 45.0% | 45.0% | 0.0% |
| sproto2884 | Footwork | 100 | 58.0% | 58.0% | 0.0% |
| sproto3106 | Zoning | 148 | 52.7% | 52.1% | 1.4% |
| sproto313 | Footwork | 124 | 48.4% | 48.4% | 0.0% |
| sproto3152 | Zoning | 144 | 43.1% | 43.1% | 0.0% |
| sproto3181 | Paired | 136 | 52.9% | 52.9% | 0.0% |
| sproto3215 | Footwork | 128 | 54.7% | 54.7% | 0.0% |
| sproto3224 | Paired | 116 | 53.4% | 53.4% | 0.0% |
| sproto3235 | Paired | 140 | 49.3% | 49.3% | 0.0% |
| sproto651 | Footwork | 116 | 47.4% | 47.4% | 0.0% |
| sproto704 | Paired | 112 | 40.2% | 40.2% | 0.0% |
| sproto763 | Footwork | 136 | 60.3% | 60.3% | 0.0% |
| sproto818 | Footwork | 132 | 53.8% | 53.8% | 0.0% |
| sproto831 | Footwork | 104 | 49.0% | 49.0% | 0.0% |
| sproto832 | Paired | 132 | 53.0% | 53.0% | 0.0% |
| sproto834 | Footwork | 100 | 44.0% | 44.0% | 0.0% |
| sproto837 | Footwork | 136 | 42.6% | 42.6% | 0.0% |
| sproto865 | Footwork | 112 | 58.0% | 58.0% | 0.0% |
| sproto943 | Footwork | 124 | 46.8% | 46.8% | 0.0% |
| sproto999 | Footwork | 136 | 47.8% | 47.8% | 0.0% |
| sprotocius | Counter | 132 | 53.8% | 53.8% | 0.0% |
| sprotolg | Zoning | 136 | 34.6% | 34.6% | 0.0% |
| sprotomichaelsaylor | Zoning | 136 | 27.2% | 27.2% | 0.0% |
| sprotomidnightfx | Pressure | 140 | 46.4% | 46.4% | 0.0% |
| sprotopia | Zoning | 124 | 25.0% | 25.0% | 0.0% |
| sprotopotamus | Brawler | 148 | 46.6% | 46.6% | 0.0% |
| sprotosales | Footwork | 124 | 59.7% | 59.7% | 0.0% |
| sprotosurvivor | Zoning | 112 | 38.4% | 38.4% | 0.0% |
| spruto | Footwork | 108 | 44.3% | 44.3% | 1.9% |
| spunow | Footwork | 96 | 50.0% | 50.0% | 0.0% |
| stonkyleg69 | Footwork | 140 | 57.9% | 57.9% | 0.0% |
| stoto | Pressure | 144 | 53.5% | 53.5% | 0.0% |
| sweatpantstrust | Counter | 132 | 56.1% | 56.1% | 0.0% |
| tdeth | Pressure | 132 | 50.8% | 50.8% | 0.0% |
| teahupoo | Counter | 132 | 53.0% | 53.0% | 0.0% |
| theo | Zoning | 140 | 35.7% | 35.7% | 0.0% |
| thesprotowholivedeth | Zoning | 148 | 40.5% | 40.5% | 0.0% |
| thxobama | Counter | 132 | 50.0% | 50.0% | 0.0% |
| tingsmol | Footwork | 120 | 44.2% | 44.2% | 0.0% |
| tradertimmy | Counter | 140 | 53.6% | 52.9% | 1.4% |
| twinnyneutron | Paired | 132 | 48.5% | 48.5% | 0.0% |
| uncmasterflex | Footwork | 120 | 66.7% | 66.7% | 0.0% |
| urmometh | Footwork | 128 | 59.4% | 59.4% | 0.0% |
| usedtowels | Counter | 156 | 44.9% | 44.9% | 0.0% |
| vamp | Zoning | 120 | 46.7% | 46.7% | 0.0% |
| vaudream | Hover | 104 | 43.3% | 43.3% | 0.0% |
| vela | Zoning | 148 | 44.6% | 44.6% | 0.0% |
| veryseriousinvestor | Footwork | 140 | 50.0% | 50.0% | 0.0% |
| vicoo | Counter | 152 | 51.3% | 51.3% | 0.0% |
| vitaliketh | Footwork | 144 | 56.9% | 56.9% | 0.0% |
| wifebeater | Brawler | 152 | 49.3% | 49.3% | 0.0% |
| willuminati | Counter | 132 | 54.5% | 54.5% | 0.0% |
| wireitwell | Pressure | 136 | 50.0% | 50.0% | 0.0% |
| wyrmblvnt | Footwork | 140 | 47.1% | 47.1% | 0.0% |
| xalt | Zoning | 124 | 38.7% | 39.3% | 1.6% |
| xav | Footwork | 108 | 54.6% | 54.6% | 0.0% |
| yusuf | Pressure | 132 | 52.3% | 52.3% | 0.0% |
| zakarum | Footwork | 124 | 67.7% | 67.2% | 1.6% |
| zebracorn | Counter | 152 | 57.2% | 57.2% | 0.0% |
| zephyr | Brawler | 152 | 48.0% | 48.0% | 0.0% |
| zepump | Paired | 128 | 46.1% | 46.1% | 0.0% |
| zippy | Pressure | 136 | 47.8% | 47.8% | 0.0% |
| zudi | Counter | 124 | 56.5% | 56.5% | 0.0% |

| Largest sampled matchup imbalances | Bouts | First fighter wins |
| --- | ---: | ---: |
| 86gwei vs bidnehhh | 4 | 100.0% |
| 86gwei vs croy | 4 | 0.0% |
| 86gwei vs feistyboi | 4 | 0.0% |
| 86gwei vs glow | 4 | 0.0% |
| 86gwei vs gluttony | 4 | 100.0% |
| 86gwei vs gryph | 4 | 100.0% |
| 86gwei vs homosproto | 4 | 0.0% |
| 86gwei vs np | 4 | 0.0% |
| 86gwei vs renzo | 4 | 0.0% |
| 86gwei vs sproto2381 | 4 | 0.0% |

