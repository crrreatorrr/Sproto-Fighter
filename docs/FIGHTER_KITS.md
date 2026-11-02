# Individual fighter kits

All use the same keyboard/controller action layout and combo-earned three-pip Team Special rule. Differences below affect simulation, not only color. Core collisions remain simplified; balance is provisional. J/K/L are light/medium/finisher, I casts the power, P performs the charged relay. Directional inputs remain available.

| Fighter | Style / attacks and power | Team Special | Contact frames |
| --- | --- | --- | --- |
| Golden Sproto | Fast jab links and an advancing four-punch relay. | CROSSCURRENT | 12, 22, 32, 42 |
| Morelight | Quick straight spit and a long-range beam relay. | PRISM BREAK | 16, 32, 48 |
| Fat Head Dave | Short fists, crushing hammer and a two-impact rising slam. | FAULT LINE | 18, 40 |
| Halloween 2008 | Lob bouncing pumpkins; the relay launches then drops its victim. | HARVEST MOON | 14, 28, 42 |
| Yannix | Long light pokes, narrow fast darts and five piercing relay strikes. | ECHO DRIVE | 12, 20, 28, 36, 44 |
| Bongraker | Slow drifting orbs and a relay that pulls foes into its final blast. | NIGHT BURST | 18, 36, 48 |
| Juicy | Rising heavy punch, fast straight juice and an advancing uppercut relay. | CITRUS RUSH | 12, 26, 42 |
| Yoyo | Returning rings control both directions; relay sweeps then pulls back. | ROUND TRIP | 15, 30, 45 |
| Red Kev | Driving cross, accelerating shots and a three-burst forward relay. | REDLINE | 12, 24, 36 |
| Sprotel Bitcoin | Gift-box lobs, overhead hammer and four rising festive impacts. | GIFT STORM | 16, 26, 36, 46 |
| Chode Adoration | Wide palm strike, fluttering hearts and a health-draining two-pulse relay. | HEARTBREAK | 20, 40 |
| $Bitcoin Obama | Low skipping coins and three diagonal palm launches. | COIN ADDRESS | 14, 28, 42 |
| Jahon | Long hook, straight serpent spit and an inward-pulling spiral relay. | SERPENT COIL | 16, 32, 48 |
| Virtuagram | Fast palm finisher, accelerating pixels and three long phase dashes. | PHASE SHIFT | 12, 30, 48 |
| Dumpstar | Heavy low sweep and ground debris; relay punishes standing guard. | CLEANUP CREW | 18, 36, 48 |
| Crapto | Acid spit drains health on a hit; the relay siphons three times. | ACID TEST | 18, 34, 50 |
| VAMP | Broken-heart waves briefly slow movement; relay sends three sorrow pulses. | BLACK PARADE | 20, 36, 50 |
| Alpha 777 | Seven-shaped fast shots and six deterministic jackpot impacts. | LUCKY SEVENS | 14, 21, 28, 35, 42, 49 |
| Bitcoin Mandela | Long reaching hands, returning links and a pull-then-release relay. | FREEDOM CHAIN | 18, 34, 50 |
| Big Swole | Slow crushing fist, heavy rock and two massive upward/downward impacts. | ATLAS CRASH | 20, 44 |
| Little Foot Nate | Quick low kick, low hopping shots and three short pounce bursts. | SMALL STEPS | 10, 24, 38 |
| Sproto Duo | Two separate visual bodies share one fighter; lead/support melee, red/blue ribbon power and alternating relay contacts. | DOUBLE TAKE | 14, 24, 36, 48 |

VAMP slow lasts up to 90 simulation frames and reduces movement speed to 65%; blocked hits do not apply it. Drain restores 20% of confirmed damage, capped at full health. Returning projectiles can hit once; bounce counts and burst schedules are deterministic.

Golden Sproto, Morelight, Juicy, Jahon and Crapto always spit horizontally, on the ground or in the air. Other powers retain directional inputs and their characteristic trajectories.

The original21 fighters use their own Higgsfield complete-body pose sheets, not the superseded runtime limb-cutout rig. Each has32 main slots and eight locally derived guarded-step frames; four main walk slots duplicate selected step images. Sproto Duo adds two body atlases with four authored walking keys each, but one selectable fighter and health pool. The action vocabulary is shared and in-between drawings remain sparse. Distinct mechanical profiles and individual art do not mean22 bespoke frame-by-frame animation systems. See the [current handoff](CLAUDE-HANDOFF.md) and [duo coverage](DUO-QA.md).
