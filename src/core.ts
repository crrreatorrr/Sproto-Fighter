/** Combat is a serializable, fixed-60Hz state machine. No DOM, clock, randomness, or rendering here. */
export const WIDTH = 1280, FLOOR = 578, TICK_RATE = 60;
// Keep broad heads and throw poses inside the arena camera.
export const WALL = 80;
/** Firm neutral jumps; launch/chase impulses retain their combo-specific values. */
export const GRAVITY = .85;
export const A = { left: 1, right: 2, up: 4, down: 8, light: 16, medium: 32, heavy: 64, launcher: 128, bolt: 256, grab: 512, special: 1024, dash: 2048 } as const;
export type Action = keyof typeof A;












/* SPROTOS TYPE BEGIN */
export type SprotoFighterId = 'sproto102' | 'sproto215' | 'sproto282' | 'sproto313' | 'sproto651' | 'sproto704' | 'sproto763' | 'sproto818' | 'sproto831' | 'sproto832' | 'sproto834' | 'sproto837' | 'sproto865' | 'sproto943' | 'sproto999' | 'sproto1011' | 'sproto1093' | 'sproto1187' | 'sproto1335' | 'sproto1345' | 'sproto1414' | 'sproto1477' | 'sproto1499' | 'sproto1601' | 'sproto1625' | 'sproto1668' | 'sproto1815' | 'sproto1870' | 'sproto2010' | 'sproto2075' | 'sproto2101' | 'sproto2177' | 'sproto2210' | 'sproto2322' | 'sproto2344' | 'sproto2381' | 'sproto2531' | 'sproto2569' | 'sproto2616' | 'sproto2789' | 'sproto2884' | 'sproto3106' | 'sproto3152' | 'sproto3181' | 'sproto3215' | 'sproto3224' | 'sproto3235' | 'vaudream' | 'uncmasterflex' | 'gryph' | 'vitaliketh' | 'urmometh' | 'chaton' | 'loadthebags' | 'sisma' | 'captainhowdy' | 'sprotosales' | 'sprog' | 'jasper' | 'aaron' | 'brainsprot' | 'godmod3d' | 'sober' | 'nosmileclown' | 'olnoname' | 'greatcharly';
/* SPROTOS TYPE END */
export type FighterId = 'rivet' | 'vela' | 'bront' | 'zephyr' | 'mox' | 'rune' | 'guest07' | 'guest08' | 'guest09' | 'guest10' | 'guest11' | 'guest12' | 'guest13' | 'guest14' | 'dumpstar' | 'crapto' | 'vamp' | 'alpha777' | 'mandela' | 'bigswole' | 'nate' | 'duo' | SprotoFighterId | 'nick' | 'captain' | 'highsproto' | 'erik' | 'bimba' | 'gpm' | 'leviosa' | 'lifeisameme' | 'thxobama' | 'rlarsson' | 'blorfo' | 'michael' | 'freshprince' | 'mlk';
export const PLAYABLE_FIGHTERS = ['rivet', 'vela', 'bront', 'zephyr', 'mox', 'rune', 'guest07', 'guest08', 'guest09', 'guest10', 'guest11', 'guest12', 'guest13', 'guest14', 'dumpstar', 'crapto', 'vamp', 'alpha777', 'mandela', 'bigswole', 'nate', 'duo', 'nick', 'captain', 'highsproto', 'erik', 'bimba', 'gpm', 'leviosa', 'lifeisameme', 'thxobama', 'rlarsson', 'blorfo', 'michael', 'freshprince', 'mlk', 'sproto102', 'sproto215', 'sproto282', 'sproto313', 'sproto651', 'sproto704', 'sproto763', 'sproto818', 'sproto831', 'sproto832', 'sproto834', 'sproto837', 'sproto865', 'sproto943', 'sproto999', 'sproto1011', 'sproto1093', 'sproto1187', 'sproto1335', 'sproto1345', 'sproto1414', 'sproto1477', 'sproto1499', 'sproto1601', 'sproto1625', 'sproto1668', 'sproto1815', 'sproto1870', 'sproto2010', 'sproto2075', 'sproto2101', 'sproto2177', 'sproto2210', 'sproto2322', 'sproto2344', 'sproto2381', 'sproto2531', 'sproto2569', 'sproto2616', 'sproto2789', 'sproto2884', 'sproto3106', 'sproto3152', 'sproto3181', 'sproto3215', 'sproto3224', 'sproto3235', 'vaudream', 'uncmasterflex', 'gryph', 'vitaliketh', 'urmometh', 'chaton', 'loadthebags', 'sisma', 'captainhowdy', 'sprotosales', 'sprog', 'jasper', 'aaron', 'brainsprot', 'godmod3d', 'sober', 'nosmileclown', 'olnoname', 'greatcharly'] as const;
export type PlayableFighterId = typeof PLAYABLE_FIGHTERS[number];
export type Mode = 'cpu' | 'dummy' | 'guard';
export type MoveId = 'light' | 'medium' | 'heavy' | 'low' | 'sweep' | 'airLight' | 'airMedium' | 'airHeavy' | 'launcher' | 'bolt' | 'grab' | 'special';
interface Move {
    startup: number;
    active: number;
    recovery: number;
    damage: number;
    range: number;
    stun: number;
    push: number;
    rank: number;
    finisher?: boolean;
    launch?: number;
    low?: boolean;
    air?: boolean;
    projectile?: boolean;
}
export const MOVES: Record<MoveId, Move> = {
    light: { startup: 5, active: 4, recovery: 13, damage: 38, range: 82, stun: 23, push: 5, rank: 1 },
    medium: { startup: 7, active: 5, recovery: 17, damage: 60, range: 112, stun: 28, push: 8, rank: 2 },
    heavy: { startup: 11, active: 6, recovery: 23, damage: 95, range: 135, stun: 32, push: 17, rank: 4, finisher: true },
    low: { startup: 5, active: 5, recovery: 14, damage: 34, range: 95, stun: 24, push: 3, rank: 1, low: true },
    sweep: { startup: 10, active: 6, recovery: 24, damage: 85, range: 135, stun: 32, push: 12, rank: 4, finisher: true, low: true },
    airLight: { startup: 4, active: 6, recovery: 11, damage: 36, range: 86, stun: 26, push: 3, rank: 1, air: true },
    airMedium: { startup: 6, active: 6, recovery: 14, damage: 58, range: 113, stun: 28, push: 5, rank: 2, air: true },
    airHeavy: { startup: 8, active: 7, recovery: 21, damage: 92, range: 139, stun: 33, push: 14, rank: 4, air: true, finisher: true },
    launcher: { startup: 8, active: 6, recovery: 23, damage: 64, range: 102, stun: 45, push: 3, rank: 3, launch: 16 },
    bolt: { startup: 16, active: 1, recovery: 27, damage: 55, range: 0, stun: 25, push: 7, rank: 3, projectile: true },
    grab: { startup: 6, active: 3, recovery: 30, damage: 115, range: 72, stun: 35, push: 16, rank: 5, finisher: true },
    special: { startup: 12, active: 40, recovery: 30, damage: 90, range: 680, stun: 28, push: 4, rank: 6 }
};
export const ROSTER: Record<FighterId, {
    name: string;
    color: string;
    dark: string;
    speed: number;
    jump: number;
    partner: FighterId;
    specialPartners?: readonly FighterId[];
    special: string;
    role: string;
    description: string;
}> = {
    rivet: { name: 'Golden Sproto', color: '#ffda55', dark: '#98702e', speed: 5.5, jump: 15.8, partner: 'vela', special: 'CROSSCURRENT', role: 'RUSHDOWN', description: 'Close the gap with fast chains, a quick dash, and an explosive launcher.' },
/* NICK ROSTER BEGIN */
nick:{name:'Nick',color:'#3158ee',dark:'#172763',speed:5.5,jump:15.8,partner:'rivet',special:'BARE KNUCKLE RUSH',role:'BARE HANDS',description:'Uncovered fingered hands, quick palm strikes and a four-contact rush.'},
/* NICK ROSTER END */
/* HIGHSPROTO ROSTER BEGIN */
highsproto:{name:'High Sproto',color:'#79a9e8',dark:'#243458',speed:5.5,jump:15.8,partner:'rivet',special:'SMOKE SIGNAL',role:'SMOKE SHOT',description:'Finger-flick joint shots, relaxed footwork and a four-contact Smoke Signal.'},
/* HIGHSPROTO ROSTER END */
/* ERIK ROSTER BEGIN */
erik:{name:'Erik Stevens Sproto',color:'#f0c94d',dark:'#192944',speed:5.5,jump:15.8,partner:'rivet',special:'EXECUTIVE FINISH',role:'FORMAL',description:'Tailored navy suit, yellow dress shirt and red tie; composed strikes and a four-contact finish.'},
/* ERIK ROSTER END */
/* BIMBA ROSTER BEGIN */
bimba:{name:'BIMBA',color:'#ffd637',dark:'#2543aa',speed:5.5,jump:15.8,partner:'rivet',special:'GOLDEN ENTRANCE',role:'POISE',description:'Tall blue silhouette, broad yellow collar and composed four-contact choreography.'},
/* BIMBA ROSTER END */
/* GPM ROSTER BEGIN */
gpm:{name:'GPM',color:'#f9da38',dark:'#354ba6',speed:5.5,jump:15.8,partner:'rivet',special:'BRIGHT BURST',role:'BULWARK',description:'Round blue furry silhouette, yellow eye markings and a four-contact Bright Burst.'},
/* GPM ROSTER END */
/* LEVIOSA ROSTER BEGIN */
leviosa:{name:'Bitcoinium Leviosa',color:'#ffed48',dark:'#163cc9',speed:5.5,jump:15.8,partner:'rivet',special:'LEVIOSA LIFT',role:'APLOMB',description:'Round blue head, yellow forelock, asymmetric arms and a four-contact Leviosa Lift.'},
/* LEVIOSA ROSTER END */
/* LIFEISAMEME ROSTER BEGIN */
lifeisameme:{"name":"Lifeisameme","color":"#ffe841","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"MEME MOMENT","role":"QUIRK","description":"Reference-based pixel art and a four-contact Meme Moment."},
/* LIFEISAMEME ROSTER END */
/* THXOBAMA ROSTER BEGIN */
thxobama:{"name":"thxObama","color":"#f5d83c","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"THANK YOU","role":"DRY WIT","description":"Reference-based pixel art and a four-contact Thank You."},
/* THXOBAMA ROSTER END */
/* RLARSSON ROSTER BEGIN */
rlarsson:{"name":"rlarsson.eth","color":"#f4df4f","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"ENS ENCORE","role":"STEADY","description":"Reference-based pixel art and a four-contact Ens Encore."},
/* RLARSSON ROSTER END */
/* BLORFO ROSTER BEGIN */
blorfo:{"name":"Blorfo","color":"#4658ef","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"BLORFO BREAK","role":"LONG REACH","description":"Reference-based pixel art and a four-contact Blorfo Break."},
/* BLORFO ROSTER END */
/* MICHAEL ROSTER BEGIN */
michael:{"name":"Michael D. Sproto - Chad Dev","color":"#fff5d4","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"RETAIN RALLY","role":"RETAIN","description":"Reference-based pixel art and a four-contact Retain Rally."},
/* MICHAEL ROSTER END */
/* FRESHPRINCE ROSTER BEGIN */
freshprince:{"name":"FreshPrinceOfBellend","color":"#ffe963","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"ROYAL REBOUND","role":"REGAL","description":"Reference-based pixel art and a four-contact Royal Rebound."},
/* FRESHPRINCE ROSTER END */
/* MLK ROSTER BEGIN */
mlk:{"name":"Bitcoin MLK","color":"#c1a0ff","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"PURPLE RESOLVE","role":"RESOLVE","description":"Reference-based pixel art and a four-contact Purple Resolve."},
/* MLK ROSTER END */
/* CAPTAIN ROSTER BEGIN */
captain:{name:'Captain Sproto',color:'#ef473b',dark:'#243783',speed:5.5,jump:15.8,partner:'rivet',special:'SOLAR SALVO',role:'LASER CAPTAIN',description:'Eye-fired laser bolts and a flowing yellow cape, sturdy kicks and a four-contact Solar Salvo.'},
/* CAPTAIN ROSTER END */
/* SPROTOS ROSTER BEGIN */
sproto102: {"name": "Sproto #102", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 102", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto215: {"name": "Sproto #215", "color": "#b59aff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 215", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto282: {"name": "Sproto #282", "color": "#ff655e", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 282", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto313: {"name": "Sproto #313", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 313", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto651: {"name": "Sproto Picasso", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 651", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto704: {"name": "Sproto #704", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 704", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto763: {"name": "Sproto #763", "color": "#ff655e", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 763", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto818: {"name": "Sproto #818", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 818", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto831: {"name": "Sproto #831", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 831", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto832: {"name": "Sproto #832", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 832", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto834: {"name": "Sproto #834", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 834", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto837: {"name": "Bitcoin Robin Williams", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 837", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto865: {"name": "Sproto #865", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 865", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto943: {"name": "Sproto #943", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 943", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto999: {"name": "Sproto #999", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 999", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1011: {"name": "Sproto #1011", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "STAFF TEMPEST 1011", "role": "STAFF", "description": "Full-length staff thrusts, overhead swings, low sweeps and aerial strikes.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1093: {"name": "Sproto #1093", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1093", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1187: {"name": "Sproto #1187", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1187", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1335: {"name": "Sproto #1335", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1335", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1345: {"name": "Sproto #1345", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1345", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1414: {"name": "Sproto #1414", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1414", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1477: {"name": "Sproto #1477", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1477", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1499: {"name": "Sproto #1499", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 1499", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto1601: {"name": "Sproto #1601", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1601", "role": "THROWER", "description": "Hand-thrown yellow 8s, a heavy kick and a four-contact ranged relay.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1625: {"name": "Sproto #1625", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 1625", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto1668: {"name": "Sproto #1668", "color": "#ffe168", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1668", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1815: {"name": "Sproto #1815", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "HALBERD TEMPEST 1815", "role": "HALBERD", "description": "Hooked halberd thrusts, overhead swings, low sweeps and aerial strikes.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto1870: {"name": "Sproto #1870", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "FLOATING SURGE 1870", "role": "HOVER", "description": "One legless floating Sproto with hovering glides and head rams.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2010: {"name": "Sproto #2010", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2010", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2075: {"name": "Sproto #2075", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2075", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2101: {"name": "Sproto #2101", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2101", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2177: {"name": "Sproto #2177", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2177", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2210: {"name": "Sproto #2210", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2210", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2322: {"name": "Sproto #2322", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2322", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2344: {"name": "Sproto #2344", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2344", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2381: {"name": "Sproto #2381", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2381", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2531: {"name": "Sproto #2531", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2531", "role": "SPITTER", "description": "Sharp white eyes and red gloves; mouth-spit releases a complete miniature Sproto.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2569: {"name": "Sproto #2569", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2569", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2616: {"name": "Sproto #2616", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "STAFF TEMPEST 2616", "role": "STAFF", "description": "Full-length staff thrusts, overhead swings, low sweeps and aerial strikes.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2789: {"name": "Sproto #2789", "color": "#b59aff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "STAFF TEMPEST 2789", "role": "STAFF", "description": "Full-length staff thrusts, overhead swings, low sweeps and aerial strikes.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto2884: {"name": "Sproto #2884", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2884", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto3106: {"name": "Sproto #3106", "color": "#ff655e", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 3106", "role": "THROWER", "description": "Throws the original yellow B with its tilted serif shape, red accents and black outline.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto3152: {"name": "Pissing Sproto", "color": "#b59aff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto2322", "special": "GOLDEN STREAM", "role": "STREAM", "description": "A comic yellow stream fires from the covered pelvis, with a four-pulse Golden Stream finish."},
sproto3181: {"name": "Sproto #3181", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 3181", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto3215: {"name": "Sproto #3215", "color": "#ffe168", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 3215", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile.", "specialPartners": ["sproto3152", "vaudream", "sproto3181"]},
sproto3224: {"name": "Sproto #3224", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 3224", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto3235: {"name": "Sproto #3235", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 3235", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
vaudream: {"name": "\u142f\u156c\u144c\u15de\u1587\u156e\u15cb\u156c", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "DREAM SURGE", "role": "HOVER", "description": "Legless floating machine: hover glides, chassis rams and screen casts."},
uncmasterflex: {"name": "UNC Master Flex", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST uncmasterflex", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
gryph: {"name": "Gryph", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION gryph", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
vitaliketh: {"name": "vitalik.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST vitaliketh", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
urmometh: {"name": "urmom.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST urmometh", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
chaton: {"name": "Chaton von Sproto", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST chaton", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
loadthebags: {"name": "LoadTheBags", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "MIC CHECK", "role": "MC", "description": "Microphone jabs, overhead mic swings and vocal casts."},
sisma: {"name": "SISMA", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "RETAIN SCREAM", "role": "SHOUT", "description": "RETAIN scream sends readable words horizontally across the arena."},
captainhowdy: {"name": "Captain Howdy", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST captainhowdy", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sprotosales: {"name": "Sproto Sales", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST sprotosales", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sprog: {"name": "Sprog", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST sprog", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
jasper: {"name": "Jasper", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST jasper", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
aaron: {"name": "Aaron", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST aaron", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
brainsprot: {"name": "Brain Sprot", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST brainsprot", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
godmod3d: {"name": "GodMod3D.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION godmod3d", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sober: {"name": "Sober", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST sober", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
nosmileclown: {"name": "\ud835\udd79\ud835\udd94\ud835\udd98\ud835\udd92\ud835\udd8e\ud835\udd91\ud835\udd8a\ud835\udd88\ud835\udd91\ud835\udd94\ud835\udd9c\ud835\udd93", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION nosmileclown", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
olnoname: {"name": "ol\u2019 no name", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST olnoname", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
greatcharly: {"name": "Great Charly.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST greatcharly", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
/* SPROTOS ROSTER END */
    duo: { name:'Sproto Duo', color:'#ffcf45', dark:'#294e8b', speed:5.5, jump:15.8, partner:'vela', special:'DOUBLE TAKE', role:'DUET', description:'Two distinct Sprotos, one player: the front actor attacks while its companion covers.' },
    vela: { name: 'Morelight', color: '#6ba9ff', dark: '#244da8', speed: 4.4, jump: 14.8, partner: 'rivet', special: 'PRISM BREAK', role: 'ZONING', description: 'Spit fast eggs to control space, then turn an opening into a full combo.' },
    bront: { name: 'Fat Head Dave', color: '#ed9471', dark: '#8b493f', speed: 3.7, jump: 13.6, partner: 'rivet', special: 'FAULT LINE', role: 'POWER', description: 'Stand your ground with heavier blows and a longer-reaching command grab.' },
    zephyr: { name: 'Halloween 2008', color: '#ffa74f', dark: '#bd5929', speed: 5.1, jump: 15.8, partner: 'vela', special: 'HARVEST MOON', role: 'AERIAL', description: 'Double-jump through the air and turn pumpkin strikes into a Harvest Moon relay.' },
    mox: { name: 'Yannix', color: '#a49eff', dark: '#4d468a', speed: 4.9, jump: 15.2, partner: 'bront', special: 'ECHO DRIVE', role: 'REACH', description: 'Catch an opening with longer-reaching light and medium attacks.' },
    rune: { name: 'Bongraker', color: '#f1b2d6', dark: '#895072', speed: 4.6, jump: 15.1, partner: 'zephyr', special: 'NIGHT BURST', role: 'BALANCED', description: 'Mix steady movement, close-range chains, and stronger, slower bolts.' },
    guest07: { name: 'Juicy', color: '#c3d3df', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest08: { name: 'Yoyo', color: '#accdbf', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest09: { name: 'Red Kev', color: '#d4bdc8', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest10: { name: 'Sprotel Bitcoin', color: '#d9ccaa', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest11: { name: 'Chode Adoration', color: '#b8bedb', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest12: { name: '$Bitcoin Obama', color: '#c4d5b5', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest13: { name: 'Jahon', color: '#d6c3ad', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
 guest14:{name:'Virtuagram',color:'#becfce',dark:'#526070',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites and shared combat kit.'},
 vamp:{name:'VAMP',color:'#5b83f4',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 alpha777:{name:'Alpha 777',color:'#98aa6c',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 mandela:{name:'Bitcoin Mandela',color:'#5288ef',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 bigswole:{name:'Big Swole',color:'#4395fb',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 nate:{name:'Little Foot Nate',color:'#97aee7',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 crapto:{name:'Crapto',color:'#d1a86c',dark:'#745137',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprite art with shared powers and animation timing.'},
 dumpstar:{name:'Dumpstar',color:'#77a9ff',dark:'#345bb3',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Shared Golden Sproto movement and attacks. Face and attire from the supplied reference; shoulder objects omitted.'},
};
export const specialPartnerIds=(id:FighterId):readonly FighterId[]=>ROSTER[id].specialPartners??[ROSTER[id].partner];
for (const id of PLAYABLE_FIGHTERS) {
    if (id !== 'rivet' && id !== 'vela') {
        ROSTER[id].speed = 5.5;
        ROSTER[id].jump = 15.8;
        ROSTER[id].role = 'SHARED KIT';
        ROSTER[id].description = 'Shared Golden Sproto movement, attacks, and Team Special behavior. ' + 'Individual reference-based sprite art; unique powers are deferred.';
    }
}
// Faster footwork retains a distinct burst dash. Final values are shared by
// movement, UI and deterministic replay; the neutral jump arc stays fixed.
for(const id of PLAYABLE_FIGHTERS){ROSTER[id].speed*=.92;ROSTER[id].jump*=.98;}
ROSTER.dumpstar.description = 'Shared Golden Sproto movement, attacks, and Team Special behavior. Reference face and attire; objects above shoulders omitted.';
/** Individual kits: mechanics are simulation data; the renderer uses the same identity. */
export interface CombatStyle {
 role:string; specialName:string; signature:string; lightRange:number; heavy:Partial<Move>; bolt:Partial<Move>;
 projectile:{speed:number;shape:string;beamLength?:number;beamFrames?:number;horizontal?:boolean;origin?:{forward:number;height:number};gravity?:number;bounces?:number;returnAt?:number;wave?:number;accel?:number;ground?:boolean};
 specialFrames:number[]; special:Partial<Move>; advance?:number; power?:'slow'|'drain'|'pull'|'launch'|'slam';
}
const kit=(role:string,specialName:string,signature:string,lightRange:number,heavy:Partial<Move>,bolt:Partial<Move>,projectile:CombatStyle['projectile'],specialFrames:number[],special:Partial<Move>,advance=0,power?:CombatStyle['power']):CombatStyle=>({role,specialName,signature,lightRange,heavy,bolt,projectile,specialFrames,special,advance,power});
export const COMBAT_STYLES:Record<FighterId,CombatStyle>={
/* NICK KIT BEGIN */
 nick:kit('BARE HANDS','BARE KNUCKLE RUSH','Uncovered hands, quick palm strikes and a driving four-contact rush.',84,{range:128,damage:92},{startup:14,damage:54},{speed:11,shape:'spark'},[13,23,35,47],{range:465,damage:76,push:4},3),
/* NICK KIT END */
/* HIGHSPROTO KIT BEGIN */
 highsproto:kit('SMOKE SHOT','SMOKE SIGNAL','Straight joint shots from a finger flick and a four-contact Smoke Signal.',88,{range:129,damage:89},{startup:17,recovery:26,damage:58},{speed:12,shape:'joint',horizontal:true,origin:{"forward": 96.25, "height": 107.5}},[16,28,40,52],{range:560,damage:74,push:4},1),
/* HIGHSPROTO KIT END */
/* ERIK KIT BEGIN */
 erik:kit('FORMAL','EXECUTIVE FINISH','Composed formal footwork, precise strikes and a four-contact Executive Finish.',90,{range:136,damage:96},{startup:16,damage:55},{speed:10,shape:'spark'},[14,24,36,48],{range:510,damage:81,push:5},2),
/* ERIK KIT END */
/* BIMBA KIT BEGIN */
 bimba:kit('POISE','GOLDEN ENTRANCE','Poised footwork, wide palm strikes and a four-contact Golden Entrance.',87,{range:138,damage:93},{startup:15,damage:52},{speed:9,shape:'spark'},[13,25,37,49],{range:525,damage:77,push:5},2),
/* BIMBA KIT END */
/* GPM KIT BEGIN */
 gpm:kit('BULWARK','BRIGHT BURST','Firm footwork, broad palm strikes and a four-contact Bright Burst.',89,{range:140,damage:98},{startup:18,damage:57},{speed:8,shape:'orb'},[16,27,39,51],{range:545,damage:79,push:5},1),
/* GPM KIT END */
/* LEVIOSA KIT BEGIN */
 leviosa:kit('APLOMB','LEVIOSA LIFT','Nimble steps, open palm strikes and a four-contact Leviosa Lift.',83,{range:134,damage:91},{startup:16,damage:60},{speed:13,shape:'orb'},[16,28,40,52],{range:555,damage:81,push:5},1),
/* LEVIOSA KIT END */
/* LIFEISAMEME KIT BEGIN */
 lifeisameme:kit("QUIRK","MEME MOMENT","Distinct strikes and a four-contact Meme Moment.",80,{range:126,damage:91},{startup:14,recovery:25,damage:56},{speed:10,shape:'orb'},[15,27,39,51],{range:560,damage:74,push:4},1),
/* LIFEISAMEME KIT END */
/* THXOBAMA KIT BEGIN */
 thxobama:kit("DRY WIT","THANK YOU","Distinct strikes and a four-contact Thank You.",81,{range:129,damage:92},{startup:15,recovery:25,damage:57},{speed:11,shape:'prism'},[15,27,39,51],{range:572,damage:75,push:4},1),
/* THXOBAMA KIT END */
/* RLARSSON KIT BEGIN */
 rlarsson:kit("STEADY","ENS ENCORE","Distinct strikes and a four-contact Ens Encore.",82,{range:132,damage:93},{startup:16,recovery:25,damage:58},{speed:12,shape:'ring'},[15,27,39,51],{range:584,damage:76,push:4},1),
/* RLARSSON KIT END */
/* BLORFO KIT BEGIN */
 blorfo:kit("LONG REACH","BLORFO BREAK","Distinct strikes and a four-contact Blorfo Break.",83,{range:135,damage:94},{startup:17,recovery:25,damage:59},{speed:13,shape:'arrow'},[15,27,39,51],{range:596,damage:77,push:4},1),
/* BLORFO KIT END */
/* MICHAEL KIT BEGIN */
 michael:kit("RETAIN","RETAIN RALLY","Distinct strikes and a four-contact Retain Rally.",84,{range:138,damage:95},{startup:18,recovery:25,damage:60},{speed:14,shape:'chadCoin',horizontal:true,origin:{forward:47.5,height:95}},[15,27,39,51],{range:608,damage:78,push:4},1),
/* MICHAEL KIT END */
/* FRESHPRINCE KIT BEGIN */
 freshprince:kit("REGAL","ROYAL REBOUND","Distinct strikes and a four-contact Royal Rebound.",85,{range:141,damage:96},{startup:19,recovery:25,damage:61},{speed:15,shape:'pixel'},[15,27,39,51],{range:620,damage:79,push:4},1),
/* FRESHPRINCE KIT END */
/* MLK KIT BEGIN */
 mlk:kit("RESOLVE","PURPLE RESOLVE","Distinct strikes and a four-contact Purple Resolve.",86,{range:144,damage:97},{startup:20,recovery:25,damage:62},{speed:16,shape:'orb'},[15,27,39,51],{range:632,damage:80,push:4},1),
/* MLK KIT END */
/* CAPTAIN KIT BEGIN */
 captain:kit('LASER CAPTAIN','SOLAR SALVO','Straight eye lasers and a driving four-contact Solar Salvo.',86,{range:132,damage:94},{startup:15,recovery:24,damage:64},{speed:22,shape:'eyeLaser',horizontal:true,origin:{"forward": 43.75, "height": 108.75}},[15,25,37,49],{range:680,damage:73,push:4},2),
/* CAPTAIN KIT END */
/* SPROTOS KITS BEGIN */
 sproto102:kit('SKIRMISH','SPROTO BURST 102','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:125,damage:78},{startup:13,damage:46},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:440,damage:61,push:3},2),
 sproto215:kit('SKIRMISH','SPROTO BURST 215','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:126,damage:79},{startup:14,damage:47},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:441,damage:62,push:3},2),
 sproto282:kit('DUET','TWIN FUSION 282','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:127,damage:80},{startup:15,damage:48},{"speed": 11, "shape": "twin"},[14,24,36,48],{range:442,damage:63,push:3},2),
 sproto313:kit('SKIRMISH','SPROTO BURST 313','One connected Sproto with two faces; one body, shared combat controls.',82,{range:128,damage:81},{startup:16,damage:49},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:443,damage:64,push:3},2),
 sproto651:kit('SKIRMISH','SPROTO BURST 651','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:129,damage:82},{startup:17,damage:50},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:444,damage:65,push:3},2),
 sproto704:kit('DUET','TWIN FUSION 704','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:130,damage:83},{startup:18,damage:51},{"speed": 10, "shape": "twin"},[14,24,36,48],{range:445,damage:66,push:3},2),
 sproto763:kit('SKIRMISH','SPROTO BURST 763','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:131,damage:84},{startup:19,damage:52},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:446,damage:67,push:3},2),
 sproto818:kit('SKIRMISH','SPROTO BURST 818','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:132,damage:85},{startup:13,damage:53},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:447,damage:68,push:3},2),
 sproto831:kit('SKIRMISH','SPROTO BURST 831','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:133,damage:86},{startup:14,damage:54},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:448,damage:69,push:3},2),
 sproto832:kit('DUET','TWIN FUSION 832','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:134,damage:87},{startup:15,damage:55},{"speed": 10, "shape": "twin"},[14,24,36,48],{range:449,damage:70,push:3},2),
 sproto834:kit('SKIRMISH','SPROTO BURST 834','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:135,damage:88},{startup:16,damage:56},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:450,damage:71,push:3},2),
 sproto837:kit('SKIRMISH','SPROTO BURST 837','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:136,damage:89},{startup:17,damage:57},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:451,damage:72,push:3},2),
 sproto865:kit('SKIRMISH','SPROTO BURST 865','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:137,damage:90},{startup:18,damage:58},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:452,damage:73,push:3},2),
 sproto943:kit('SKIRMISH','SPROTO BURST 943','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:138,damage:91},{startup:19,damage:46},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:453,damage:74,push:3},2),
 sproto999:kit('SKIRMISH','SPROTO BURST 999','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:139,damage:92},{startup:13,damage:47},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:454,damage:75,push:3},2),
 sproto1011:kit('STAFF','STAFF TEMPEST 1011','Full-length staff thrusts, overhead swings, low sweeps and airborne staff strikes.',82,{range:140,damage:93},{startup:14,damage:48},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:455,damage:76,push:3},2),
 sproto1093:kit('SKIRMISH','SPROTO BURST 1093','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:141,damage:94},{startup:15,damage:49},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:456,damage:77,push:3},2),
 sproto1187:kit('SKIRMISH','SPROTO BURST 1187','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:142,damage:95},{startup:16,damage:50},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:457,damage:78,push:3},2),
 sproto1335:kit('SKIRMISH','SPROTO BURST 1335','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:143,damage:96},{startup:17,damage:51},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:458,damage:79,push:3},2),
 sproto1345:kit('SKIRMISH','SPROTO BURST 1345','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:144,damage:97},{startup:18,damage:52},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:459,damage:80,push:3},2),
 sproto1414:kit('SKIRMISH','SPROTO BURST 1414','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:125,damage:98},{startup:19,damage:53},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:460,damage:81,push:3},2),
 sproto1477:kit('SKIRMISH','SPROTO BURST 1477','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:126,damage:99},{startup:13,damage:54},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:461,damage:82,push:3},2),
 sproto1499:kit('DUET','TWIN FUSION 1499','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:127,damage:100},{startup:14,damage:55},{"speed": 11, "shape": "twin"},[14,24,36,48],{range:462,damage:83,push:3},2),
 sproto1601:kit('THROWER','SPROTO BURST 1601','Hand windup throws a bright yellow 8, with a heavy kick and four-contact relay.',82,{range:128,damage:101},{startup:15,damage:56},{speed:12,shape:'yellowEight',origin:{forward:77.5,height:105}},[14,24,36,48],{range:463,damage:84,push:3},2),
 sproto1625:kit('DUET','TWIN FUSION 1625','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:129,damage:102},{startup:16,damage:57},{"speed": 9, "shape": "twin"},[14,24,36,48],{range:464,damage:85,push:3},2),
 sproto1668:kit('SKIRMISH','SPROTO BURST 1668','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:130,damage:103},{startup:17,damage:58},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:465,damage:86,push:3},2),
 sproto1815:kit('HALBERD','HALBERD TEMPEST 1815','Full-length hooked halberd thrusts, overhead swings, low sweeps and airborne strikes.',82,{range:131,damage:104},{startup:18,damage:46},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:466,damage:87,push:3},2),
 sproto1870:kit('HOVER','FLOATING SURGE 1870','One legless floating Sproto: hover glides, banks and body-ram strikes.',82,{range:132,damage:105},{startup:19,damage:47},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:467,damage:88,push:3},2),
 sproto2010:kit('DUET','TWIN FUSION 2010','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:133,damage:106},{startup:13,damage:48},{"speed": 9, "shape": "twin"},[14,24,36,48],{range:468,damage:89,push:3},2),
 sproto2075:kit('DUET','TWIN FUSION 2075','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:134,damage:107},{startup:14,damage:49},{"speed": 10, "shape": "twin"},[14,24,36,48],{range:469,damage:90,push:3},2),
 sproto2101:kit('SKIRMISH','SPROTO BURST 2101','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:135,damage:108},{startup:15,damage:50},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:470,damage:91,push:3},2),
 sproto2177:kit('SKIRMISH','SPROTO BURST 2177','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:136,damage:109},{startup:16,damage:51},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:471,damage:92,push:3},2),
 sproto2210:kit('DUET','TWIN FUSION 2210','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:137,damage:110},{startup:17,damage:52},{"speed": 9, "shape": "twin"},[14,24,36,48],{range:472,damage:93,push:3},2),
 sproto2322:kit('SKIRMISH','SPROTO BURST 2322','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:138,damage:111},{startup:18,damage:53},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:473,damage:94,push:3},2),
 sproto2344:kit('DUET','TWIN FUSION 2344','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:139,damage:112},{startup:19,damage:54},{"speed": 11, "shape": "twin"},[14,24,36,48],{range:474,damage:95,push:3},2),
 sproto2381:kit('SKIRMISH','SPROTO BURST 2381','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:140,damage:113},{startup:13,damage:55},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:475,damage:96,push:3},2),
 sproto2531:kit('SPITTER','SPROTO BURST 2531','Sharp white eyes and red gloves; mouth-spit releases a complete miniature Sproto.',82,{range:141,damage:114},{startup:14,damage:56},{"speed": 9, "shape": "miniSproto", "horizontal": true, "origin": {"forward": 31.25, "height": 98.75}},[14,24,36,48],{range:476,damage:97,push:3},2),
 sproto2569:kit('SKIRMISH','SPROTO BURST 2569','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:142,damage:115},{startup:15,damage:57},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:477,damage:98,push:3},2),
 sproto2616:kit('STAFF','STAFF TEMPEST 2616','Full-length staff thrusts, overhead swings, low sweeps and airborne staff strikes.',82,{range:143,damage:116},{startup:16,damage:58},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:478,damage:99,push:3},2),
 sproto2789:kit('STAFF','STAFF TEMPEST 2789','Full-length staff thrusts, overhead swings, low sweeps and airborne staff strikes.',82,{range:144,damage:117},{startup:17,damage:46},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:479,damage:100,push:3},2),
 sproto2884:kit('SKIRMISH','SPROTO BURST 2884','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:125,damage:118},{startup:18,damage:47},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:480,damage:101,push:3},2),
 sproto3106:kit('THROWER','SPROTO BURST 3106','Throws the original yellow B with its tilted serif shape, red accents and black outline.',82,{range:126,damage:119},{startup:19,damage:48},{"speed": 10, "shape": "referenceB", "origin": {"forward": 86.25, "height": 106.25}},[14,24,36,48],{range:481,damage:102,push:3},2),
 sproto3152:kit('STREAM','GOLDEN STREAM','Pelvic-origin yellow stream; Golden Stream delivers four coordinated pulses.',82,{range:127,damage:120},{startup:13,damage:49},{"speed": 11, "shape": "pelvicStream", "horizontal": true, "origin": {"forward": 30, "height": 50}},[14,24,36,48],{range:482,damage:103,push:3},2),
 sproto3181:kit('DUET','TWIN FUSION 3181','Attached stomach monster swells, lunges and bites in place of blue actor kicks; the small yellow partner covers.',82,{range:128,damage:121},{startup:14,damage:50},{"speed": 12, "shape": "twin"},[14,24,36,48],{range:483,damage:104,push:3},2),
 sproto3215:kit('SKIRMISH','SPROTO BURST 3215','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:129,damage:122},{startup:15,damage:51},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:484,damage:105,push:3},2),
 sproto3224:kit('DUET','TWIN FUSION 3224','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:130,damage:123},{startup:16,damage:52},{"speed": 10, "shape": "twin"},[14,24,36,48],{range:485,damage:106,push:3},2),
 sproto3235:kit('DUET','TWIN FUSION 3235','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:131,damage:124},{startup:17,damage:53},{"speed": 11, "shape": "twin"},[14,24,36,48],{range:486,damage:107,push:3},2),
 vaudream:kit('HOVER','DREAM SURGE','Legless hovering machine with chassis rams, aerial banks and a four-contact Dream Surge.',82,{range:132,damage:125},{startup:18,damage:54},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:487,damage:108,push:3},2),
 uncmasterflex:kit('SKIRMISH','SPROTO BURST uncmasterflex','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:133,damage:126},{startup:19,damage:55},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:488,damage:109,push:3},2),
 gryph:kit('DUET','TWIN FUSION gryph','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:134,damage:127},{startup:13,damage:56},{"speed": 10, "shape": "twin"},[14,24,36,48],{range:489,damage:110,push:3},2),
 vitaliketh:kit('SKIRMISH','SPROTO BURST vitaliketh','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:135,damage:128},{startup:14,damage:57},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:490,damage:111,push:3},2),
 urmometh:kit('SKIRMISH','SPROTO BURST urmometh','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:136,damage:129},{startup:15,damage:58},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:491,damage:112,push:3},2),
 chaton:kit('SKIRMISH','SPROTO BURST chaton','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:137,damage:130},{startup:16,damage:46},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:492,damage:113,push:3},2),
 loadthebags:kit('MC','MIC CHECK','Microphone jabs, swings and aerial mic strikes, with vocal casts.',82,{range:138,damage:131},{startup:17,damage:47},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:493,damage:114,push:3},2),
 sisma:kit('SHOUT','RETAIN SCREAM','RETAIN scream: I fires the word horizontally; special sends four vocal bursts.',82,{range:139,damage:132},{startup:18,damage:48},{"speed": 11, "shape": "retain", "horizontal": true, "origin": {"forward": 110, "height": 95}},[14,24,36,48],{range:494,damage:115,push:3},2),
 captainhowdy:kit('SKIRMISH','SPROTO BURST captainhowdy','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:140,damage:133},{startup:19,damage:49},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:495,damage:116,push:3},2),
 sprotosales:kit('SKIRMISH','SPROTO BURST sprotosales','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:141,damage:134},{startup:13,damage:50},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:496,damage:117,push:3},2),
 sprog:kit('SKIRMISH','SPROTO BURST sprog','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:142,damage:135},{startup:14,damage:51},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:497,damage:118,push:3},2),
 jasper:kit('SKIRMISH','SPROTO BURST jasper','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:143,damage:136},{startup:15,damage:52},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:498,damage:119,push:3},2),
 aaron:kit('SKIRMISH','SPROTO BURST aaron','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:144,damage:137},{startup:16,damage:53},{"speed": 12, "shape": "spark"},[14,24,36,48],{range:499,damage:120,push:3},2),
 brainsprot:kit('SKIRMISH','SPROTO BURST brainsprot','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:125,damage:138},{startup:17,damage:54},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:500,damage:121,push:3},2),
 godmod3d:kit('DUET','TWIN FUSION godmod3d','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:126,damage:139},{startup:18,damage:55},{"speed": 10, "shape": "twin"},[14,24,36,48],{range:501,damage:122,push:3},2),
 sober:kit('SKIRMISH','SPROTO BURST sober','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:127,damage:140},{startup:19,damage:56},{"speed": 11, "shape": "spark"},[14,24,36,48],{range:502,damage:123,push:3},2),
 nosmileclown:kit('DUET','TWIN FUSION nosmileclown','Coordinated alternating strikes and an acrobatic companion finish.',82,{range:128,damage:141},{startup:13,damage:57},{"speed": 12, "shape": "twin"},[14,24,36,48],{range:503,damage:124,push:3},2),
 olnoname:kit('SKIRMISH','SPROTO BURST olnoname','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:129,damage:142},{startup:14,damage:58},{"speed": 9, "shape": "spark"},[14,24,36,48],{range:504,damage:125,push:3},2),
 greatcharly:kit('SKIRMISH','SPROTO BURST greatcharly','Guarded footwork, a heavy kick and four-contact ranged relay.',82,{range:130,damage:143},{startup:15,damage:46},{"speed": 10, "shape": "spark"},[14,24,36,48],{range:505,damage:126,push:3},2),
/* SPROTOS KITS END */
 duo:kit('DUET','DOUBLE TAKE','Two independent bodies share one health bar. Alternating red/blue pulses end in a double launch.',82,{range:135,damage:87,launch:8,push:5},{startup:14,recovery:24,damage:52},{speed:10,shape:'twin'},[14,24,36,48],{range:460,damage:66,launch:10,push:3},2,'launch'),
 rivet:kit('RUSHDOWN','CROSSCURRENT','Fast jab links and an advancing four-punch relay.',82,{}, {},{speed:9,shape:'spark'},[12,22,32,42],{range:340,damage:68},3),
 vela:kit('ZONING','PRISM BREAK','Quick straight egg spit and a long-range relay.',88,{push:20},{startup:11,recovery:20,damage:62},{speed:12,shape:'egg',horizontal:true,origin:{forward:59,height:103}},[16,32,48],{range:850,damage:86}),
 bront:kit('GRAPPLER','FAULT LINE','Short fists, crushing hammer and a two-impact rising slam.',74,{damage:120,startup:14,launch:11,push:5},{startup:23,damage:80},{speed:6,shape:'boulder',gravity:.12},[18,40],{range:300,damage:135,launch:16},0,'slam'),
 zephyr:kit('PUMPKIN','HARVEST MOON','Lob bouncing pumpkins; the relay launches then drops its victim.',92,{launch:9,damage:88},{startup:19,damage:65},{speed:7,shape:'pumpkin',gravity:.16,bounces:2},[14,28,42],{range:580,damage:88,launch:12},0,'slam'),
 mox:kit('PSYCHIC','ECHO DRIVE','Long pokes and a high mind beam from the forehead. Duck or block the beam; confirm close hits into a finisher.',112,{range:155,damage:80,push:10},{startup:16,damage:52,recovery:26},{speed:0,shape:'mindBeam',horizontal:true,origin:{forward:36.25,height:143.75},beamLength:520,beamFrames:12},[12,20,28,36,44],{range:460,damage:50,push:2},1),
 rune:kit('GRAVITY','NIGHT BURST','Slow drifting orbs and a relay that pulls foes into its final blast.',90,{push:-9,damage:90},{damage:68,stun:32},{speed:5,shape:'orb',wave:.8},[18,36,48],{range:650,damage:86,push:-12},0,'pull'),
 guest07:kit('UPPERCUT','CITRUS RUSH','Rising heavy punch, fast straight juice and an advancing uppercut relay.',82,{launch:13,push:4,damage:88},{startup:13,damage:49},{speed:10,shape:'drop'},[12,26,42],{range:390,damage:84,launch:13},4,'launch'),
 guest08:kit('RETURN','ROUND TRIP','Returning rings control both directions; relay sweeps then pulls back.',100,{range:150,push:7,damage:82},{damage:48,recovery:23},{speed:9,shape:'ring',returnAt:28},[15,30,45],{range:590,damage:86,push:-7},0,'pull'),
 guest09:kit('MOMENTUM','REDLINE','Driving cross, accelerating shots and a three-burst forward relay.',78,{push:25,damage:100},{startup:18,damage:58},{speed:5,shape:'arrow',accel:.22},[12,24,36],{range:340,damage:95,push:9},6),
 guest10:kit('BARRAGE','GIFT STORM','Gift-box lobs, overhead hammer and four rising festive impacts.',86,{launch:7,damage:96},{startup:20,damage:72},{speed:6,shape:'gift',gravity:.2,bounces:1},[16,26,36,46],{range:640,damage:65,launch:8}),
 guest11:kit('RECOVERY','HEARTBREAK','Wide palm strike, fluttering hearts and a health-draining two-pulse relay.',96,{stun:39,damage:80},{damage:48,stun:31},{speed:7,shape:'heart',wave:1.8},[20,40],{range:530,damage:125,push:6},0,'drain'),
 guest12:kit('RICOCHET','COIN ADDRESS','Low skipping coins and three diagonal palm launches.',91,{range:145,launch:6,damage:87},{startup:14,damage:51},{speed:10,shape:'coin',gravity:.18,bounces:3},[14,28,42],{range:660,damage:82,launch:9},0,'launch'),
 guest13:kit('COIL','SERPENT COIL','Long hook, straight serpent spit and an inward-pulling spiral relay.',107,{range:160,push:-5,damage:85},{damage:53,stun:30},{speed:8,shape:'serpent'},[16,32,48],{range:560,damage:90,push:-10},0,'pull'),
 guest14:kit('PHASE','PHASE SHIFT','Fast palm finisher, accelerating pixels and three long phase dashes.',85,{startup:8,damage:76,recovery:19},{startup:10,damage:38},{speed:8,shape:'pixel',accel:.12},[12,30,48],{range:270,damage:92,push:4},8),
 dumpstar:kit('GROUND','CLEANUP CREW','Heavy low sweep and ground debris; relay punishes standing guard.',84,{low:true,push:19,damage:103},{startup:22,damage:70,low:true},{speed:7,shape:'scrap',ground:true},[18,36,48],{range:570,damage:92,low:true,push:11}),
 crapto:kit('ACID','ACID TEST','Acid spit drains health on a hit; the relay siphons three times.',80,{damage:91,stun:36},{startup:18,damage:56},{speed:8,shape:'acid',gravity:.07},[18,34,50],{range:510,damage:80,push:5},0,'drain'),
 vamp:kit('MELANCHOLY','BLACK PARADE','Broken-heart waves briefly slow movement; relay sends three sorrow pulses.',94,{damage:84,stun:37},{startup:18,damage:45},{speed:6,shape:'brokenHeart',wave:1.2},[20,36,50],{range:620,damage:78,stun:34},0,'slow'),
 alpha777:kit('BURST','LUCKY SEVENS','Seven-shaped fast shots and six deterministic jackpot impacts.',89,{damage:77,startup:9},{startup:12,damage:42},{speed:11,shape:'seven'},[14,21,28,35,42,49],{range:480,damage:44,push:2}),
 mandela:kit('CHAIN','FREEDOM CHAIN','Long reaching hands, returning links and a pull-then-release relay.',110,{range:165,damage:86,push:-6},{damage:60,stun:30},{speed:8,shape:'chain',returnAt:40},[18,34,50],{range:720,damage:88,push:-14},0,'pull'),
 bigswole:kit('POWER','ATLAS CRASH','Slow crushing fist, heavy rock and two massive upward/downward impacts.',76,{damage:132,startup:16,push:22},{startup:26,damage:88},{speed:5,shape:'rock',gravity:.1},[20,44],{range:350,damage:145,launch:17},1,'slam'),
 nate:kit('POUNCE','SMALL STEPS','Quick low kick, low hopping shots and three short pounce bursts.',79,{startup:8,damage:78,low:true},{startup:12,damage:44,low:true},{speed:9,shape:'paw',gravity:.12,bounces:2,ground:true},[10,24,38],{range:310,damage:83,low:true,push:6},5),
};
for(const id of PLAYABLE_FIGHTERS){const style=COMBAT_STYLES[id];ROSTER[id].role=style.role;ROSTER[id].special=style.specialName;ROSTER[id].description=style.signature;}

/* CHARACTER ACTIONS BEGIN */
export const CHARACTER_ACTIONS = {"rivet": {"index": 0, "entrance": 0, "entranceDistance": 8, "entranceHeight": 4, "entranceBeat": 5, "defeat": 0, "defeatBeat": 3, "ranged": 0, "replaceRanged": true, "originalProjectile": "spark"}, "vela": {"index": 1, "entrance": 1, "entranceDistance": 9, "entranceHeight": 5, "entranceBeat": 6, "defeat": 1, "defeatBeat": 4, "ranged": 1, "replaceRanged": false, "originalProjectile": "egg"}, "bront": {"index": 2, "entrance": 2, "entranceDistance": 10, "entranceHeight": 6, "entranceBeat": 7, "defeat": 2, "defeatBeat": 5, "ranged": 2, "replaceRanged": false, "originalProjectile": "boulder"}, "zephyr": {"index": 3, "entrance": 3, "entranceDistance": 11, "entranceHeight": 7, "entranceBeat": 8, "defeat": 3, "defeatBeat": 6, "ranged": 3, "replaceRanged": false, "originalProjectile": "pumpkin"}, "mox": {"index": 4, "entrance": 4, "entranceDistance": 12, "entranceHeight": 8, "entranceBeat": 9, "defeat": 4, "defeatBeat": 7, "ranged": 4, "replaceRanged": false, "originalProjectile": "needle"}, "rune": {"index": 5, "entrance": 5, "entranceDistance": 13, "entranceHeight": 9, "entranceBeat": 10, "defeat": 5, "defeatBeat": 3, "ranged": 5, "replaceRanged": true, "originalProjectile": "orb"}, "guest07": {"index": 6, "entrance": 6, "entranceDistance": 14, "entranceHeight": 10, "entranceBeat": 11, "defeat": 6, "defeatBeat": 4, "ranged": 6, "replaceRanged": false, "originalProjectile": "drop"}, "guest08": {"index": 7, "entrance": 7, "entranceDistance": 15, "entranceHeight": 11, "entranceBeat": 5, "defeat": 7, "defeatBeat": 5, "ranged": 7, "replaceRanged": true, "originalProjectile": "ring"}, "guest09": {"index": 8, "entrance": 8, "entranceDistance": 16, "entranceHeight": 12, "entranceBeat": 6, "defeat": 8, "defeatBeat": 6, "ranged": 0, "replaceRanged": true, "originalProjectile": "arrow"}, "guest10": {"index": 9, "entrance": 9, "entranceDistance": 17, "entranceHeight": 13, "entranceBeat": 7, "defeat": 9, "defeatBeat": 7, "ranged": 1, "replaceRanged": false, "originalProjectile": "gift"}, "guest11": {"index": 10, "entrance": 10, "entranceDistance": 18, "entranceHeight": 14, "entranceBeat": 8, "defeat": 0, "defeatBeat": 3, "ranged": 2, "replaceRanged": false, "originalProjectile": "heart"}, "guest12": {"index": 11, "entrance": 11, "entranceDistance": 19, "entranceHeight": 15, "entranceBeat": 9, "defeat": 1, "defeatBeat": 4, "ranged": 3, "replaceRanged": false, "originalProjectile": "coin"}, "guest13": {"index": 12, "entrance": 0, "entranceDistance": 20, "entranceHeight": 16, "entranceBeat": 10, "defeat": 2, "defeatBeat": 5, "ranged": 4, "replaceRanged": false, "originalProjectile": "serpent"}, "guest14": {"index": 13, "entrance": 1, "entranceDistance": 21, "entranceHeight": 4, "entranceBeat": 11, "defeat": 3, "defeatBeat": 6, "ranged": 5, "replaceRanged": true, "originalProjectile": "pixel"}, "dumpstar": {"index": 14, "entrance": 2, "entranceDistance": 22, "entranceHeight": 5, "entranceBeat": 5, "defeat": 4, "defeatBeat": 7, "ranged": 6, "replaceRanged": false, "originalProjectile": "scrap"}, "crapto": {"index": 15, "entrance": 3, "entranceDistance": 23, "entranceHeight": 6, "entranceBeat": 6, "defeat": 5, "defeatBeat": 3, "ranged": 7, "replaceRanged": false, "originalProjectile": "acid"}, "vamp": {"index": 16, "entrance": 4, "entranceDistance": 24, "entranceHeight": 7, "entranceBeat": 7, "defeat": 6, "defeatBeat": 4, "ranged": 0, "replaceRanged": false, "originalProjectile": "brokenHeart"}, "alpha777": {"index": 17, "entrance": 5, "entranceDistance": 8, "entranceHeight": 8, "entranceBeat": 8, "defeat": 7, "defeatBeat": 5, "ranged": 1, "replaceRanged": false, "originalProjectile": "seven"}, "mandela": {"index": 18, "entrance": 6, "entranceDistance": 9, "entranceHeight": 9, "entranceBeat": 9, "defeat": 8, "defeatBeat": 6, "ranged": 2, "replaceRanged": false, "originalProjectile": "chain"}, "bigswole": {"index": 19, "entrance": 7, "entranceDistance": 10, "entranceHeight": 10, "entranceBeat": 10, "defeat": 9, "defeatBeat": 7, "ranged": 3, "replaceRanged": false, "originalProjectile": "rock"}, "nate": {"index": 20, "entrance": 8, "entranceDistance": 11, "entranceHeight": 11, "entranceBeat": 11, "defeat": 0, "defeatBeat": 3, "ranged": 4, "replaceRanged": false, "originalProjectile": "paw"}, "duo": {"index": 21, "entrance": 9, "entranceDistance": 12, "entranceHeight": 12, "entranceBeat": 5, "defeat": 1, "defeatBeat": 4, "ranged": 5, "replaceRanged": true, "originalProjectile": "twin"}, "nick": {"index": 22, "entrance": 10, "entranceDistance": 13, "entranceHeight": 13, "entranceBeat": 6, "defeat": 2, "defeatBeat": 5, "ranged": 6, "replaceRanged": true, "originalProjectile": "spark"}, "captain": {"index": 23, "entrance": 11, "entranceDistance": 14, "entranceHeight": 14, "entranceBeat": 7, "defeat": 3, "defeatBeat": 6, "ranged": 7, "replaceRanged": false, "originalProjectile": "eyeLaser"}, "highsproto": {"index": 24, "entrance": 0, "entranceDistance": 15, "entranceHeight": 15, "entranceBeat": 8, "defeat": 4, "defeatBeat": 7, "ranged": 0, "replaceRanged": false, "originalProjectile": "joint"}, "erik": {"index": 25, "entrance": 1, "entranceDistance": 16, "entranceHeight": 16, "entranceBeat": 9, "defeat": 5, "defeatBeat": 3, "ranged": 1, "replaceRanged": true, "originalProjectile": "spark"}, "bimba": {"index": 26, "entrance": 2, "entranceDistance": 17, "entranceHeight": 4, "entranceBeat": 10, "defeat": 6, "defeatBeat": 4, "ranged": 2, "replaceRanged": true, "originalProjectile": "spark"}, "gpm": {"index": 27, "entrance": 3, "entranceDistance": 18, "entranceHeight": 5, "entranceBeat": 11, "defeat": 7, "defeatBeat": 5, "ranged": 3, "replaceRanged": true, "originalProjectile": "orb"}, "leviosa": {"index": 28, "entrance": 4, "entranceDistance": 19, "entranceHeight": 6, "entranceBeat": 5, "defeat": 8, "defeatBeat": 6, "ranged": 4, "replaceRanged": true, "originalProjectile": "orb"}, "lifeisameme": {"index": 29, "entrance": 5, "entranceDistance": 20, "entranceHeight": 7, "entranceBeat": 6, "defeat": 9, "defeatBeat": 7, "ranged": 5, "replaceRanged": true, "originalProjectile": "orb"}, "thxobama": {"index": 30, "entrance": 6, "entranceDistance": 21, "entranceHeight": 8, "entranceBeat": 7, "defeat": 0, "defeatBeat": 3, "ranged": 6, "replaceRanged": false, "originalProjectile": "prism"}, "rlarsson": {"index": 31, "entrance": 7, "entranceDistance": 22, "entranceHeight": 9, "entranceBeat": 8, "defeat": 1, "defeatBeat": 4, "ranged": 7, "replaceRanged": true, "originalProjectile": "ring"}, "blorfo": {"index": 32, "entrance": 8, "entranceDistance": 23, "entranceHeight": 10, "entranceBeat": 9, "defeat": 2, "defeatBeat": 5, "ranged": 0, "replaceRanged": true, "originalProjectile": "arrow"}, "michael": {"index": 33, "entrance": 9, "entranceDistance": 24, "entranceHeight": 11, "entranceBeat": 10, "defeat": 3, "defeatBeat": 6, "ranged": 1, "replaceRanged": false, "originalProjectile": "chadCoin"}, "freshprince": {"index": 34, "entrance": 10, "entranceDistance": 8, "entranceHeight": 12, "entranceBeat": 11, "defeat": 4, "defeatBeat": 7, "ranged": 2, "replaceRanged": true, "originalProjectile": "pixel"}, "mlk": {"index": 35, "entrance": 11, "entranceDistance": 9, "entranceHeight": 13, "entranceBeat": 5, "defeat": 5, "defeatBeat": 3, "ranged": 3, "replaceRanged": true, "originalProjectile": "orb"}, "sproto102": {"index": 36, "entrance": 0, "entranceDistance": 10, "entranceHeight": 14, "entranceBeat": 6, "defeat": 6, "defeatBeat": 4, "ranged": 4, "replaceRanged": true, "originalProjectile": "spark"}, "sproto215": {"index": 37, "entrance": 1, "entranceDistance": 11, "entranceHeight": 15, "entranceBeat": 7, "defeat": 7, "defeatBeat": 5, "ranged": 5, "replaceRanged": true, "originalProjectile": "spark"}, "sproto282": {"index": 38, "entrance": 2, "entranceDistance": 12, "entranceHeight": 16, "entranceBeat": 8, "defeat": 8, "defeatBeat": 6, "ranged": 6, "replaceRanged": true, "originalProjectile": "twin"}, "sproto313": {"index": 39, "entrance": 3, "entranceDistance": 13, "entranceHeight": 4, "entranceBeat": 9, "defeat": 9, "defeatBeat": 7, "ranged": 7, "replaceRanged": true, "originalProjectile": "spark"}, "sproto651": {"index": 40, "entrance": 4, "entranceDistance": 14, "entranceHeight": 5, "entranceBeat": 10, "defeat": 0, "defeatBeat": 3, "ranged": 0, "replaceRanged": true, "originalProjectile": "spark"}, "sproto704": {"index": 41, "entrance": 5, "entranceDistance": 15, "entranceHeight": 6, "entranceBeat": 11, "defeat": 1, "defeatBeat": 4, "ranged": 1, "replaceRanged": true, "originalProjectile": "twin"}, "sproto763": {"index": 42, "entrance": 6, "entranceDistance": 16, "entranceHeight": 7, "entranceBeat": 5, "defeat": 2, "defeatBeat": 5, "ranged": 2, "replaceRanged": true, "originalProjectile": "spark"}, "sproto818": {"index": 43, "entrance": 7, "entranceDistance": 17, "entranceHeight": 8, "entranceBeat": 6, "defeat": 3, "defeatBeat": 6, "ranged": 3, "replaceRanged": true, "originalProjectile": "spark"}, "sproto831": {"index": 44, "entrance": 8, "entranceDistance": 18, "entranceHeight": 9, "entranceBeat": 7, "defeat": 4, "defeatBeat": 7, "ranged": 4, "replaceRanged": true, "originalProjectile": "spark"}, "sproto832": {"index": 45, "entrance": 9, "entranceDistance": 19, "entranceHeight": 10, "entranceBeat": 8, "defeat": 5, "defeatBeat": 3, "ranged": 5, "replaceRanged": true, "originalProjectile": "twin"}, "sproto834": {"index": 46, "entrance": 10, "entranceDistance": 20, "entranceHeight": 11, "entranceBeat": 9, "defeat": 6, "defeatBeat": 4, "ranged": 6, "replaceRanged": true, "originalProjectile": "spark"}, "sproto837": {"index": 47, "entrance": 11, "entranceDistance": 21, "entranceHeight": 12, "entranceBeat": 10, "defeat": 7, "defeatBeat": 5, "ranged": 7, "replaceRanged": true, "originalProjectile": "spark"}, "sproto865": {"index": 48, "entrance": 0, "entranceDistance": 22, "entranceHeight": 13, "entranceBeat": 11, "defeat": 8, "defeatBeat": 6, "ranged": 0, "replaceRanged": true, "originalProjectile": "spark"}, "sproto943": {"index": 49, "entrance": 1, "entranceDistance": 23, "entranceHeight": 14, "entranceBeat": 5, "defeat": 9, "defeatBeat": 7, "ranged": 1, "replaceRanged": true, "originalProjectile": "spark"}, "sproto999": {"index": 50, "entrance": 2, "entranceDistance": 24, "entranceHeight": 15, "entranceBeat": 6, "defeat": 0, "defeatBeat": 3, "ranged": 2, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1011": {"index": 51, "entrance": 3, "entranceDistance": 8, "entranceHeight": 16, "entranceBeat": 7, "defeat": 1, "defeatBeat": 4, "ranged": 3, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1093": {"index": 52, "entrance": 4, "entranceDistance": 9, "entranceHeight": 4, "entranceBeat": 8, "defeat": 2, "defeatBeat": 5, "ranged": 4, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1187": {"index": 53, "entrance": 5, "entranceDistance": 10, "entranceHeight": 5, "entranceBeat": 9, "defeat": 3, "defeatBeat": 6, "ranged": 5, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1335": {"index": 54, "entrance": 6, "entranceDistance": 11, "entranceHeight": 6, "entranceBeat": 10, "defeat": 4, "defeatBeat": 7, "ranged": 6, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1345": {"index": 55, "entrance": 7, "entranceDistance": 12, "entranceHeight": 7, "entranceBeat": 11, "defeat": 5, "defeatBeat": 3, "ranged": 7, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1414": {"index": 56, "entrance": 8, "entranceDistance": 13, "entranceHeight": 8, "entranceBeat": 5, "defeat": 6, "defeatBeat": 4, "ranged": 0, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1477": {"index": 57, "entrance": 9, "entranceDistance": 14, "entranceHeight": 9, "entranceBeat": 6, "defeat": 7, "defeatBeat": 5, "ranged": 1, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1499": {"index": 58, "entrance": 10, "entranceDistance": 15, "entranceHeight": 10, "entranceBeat": 7, "defeat": 8, "defeatBeat": 6, "ranged": 2, "replaceRanged": true, "originalProjectile": "twin"}, "sproto1601": {"index": 59, "entrance": 11, "entranceDistance": 16, "entranceHeight": 11, "entranceBeat": 8, "defeat": 9, "defeatBeat": 7, "ranged": 3, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1625": {"index": 60, "entrance": 0, "entranceDistance": 17, "entranceHeight": 12, "entranceBeat": 9, "defeat": 0, "defeatBeat": 3, "ranged": 4, "replaceRanged": true, "originalProjectile": "twin"}, "sproto1668": {"index": 61, "entrance": 1, "entranceDistance": 18, "entranceHeight": 13, "entranceBeat": 10, "defeat": 1, "defeatBeat": 4, "ranged": 5, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1815": {"index": 62, "entrance": 2, "entranceDistance": 19, "entranceHeight": 14, "entranceBeat": 11, "defeat": 2, "defeatBeat": 5, "ranged": 6, "replaceRanged": true, "originalProjectile": "spark"}, "sproto1870": {"index": 63, "entrance": 3, "entranceDistance": 20, "entranceHeight": 15, "entranceBeat": 5, "defeat": 3, "defeatBeat": 6, "ranged": 7, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2010": {"index": 64, "entrance": 4, "entranceDistance": 21, "entranceHeight": 16, "entranceBeat": 6, "defeat": 4, "defeatBeat": 7, "ranged": 0, "replaceRanged": true, "originalProjectile": "twin"}, "sproto2075": {"index": 65, "entrance": 5, "entranceDistance": 22, "entranceHeight": 4, "entranceBeat": 7, "defeat": 5, "defeatBeat": 3, "ranged": 1, "replaceRanged": true, "originalProjectile": "twin"}, "sproto2101": {"index": 66, "entrance": 6, "entranceDistance": 23, "entranceHeight": 5, "entranceBeat": 8, "defeat": 6, "defeatBeat": 4, "ranged": 2, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2177": {"index": 67, "entrance": 7, "entranceDistance": 24, "entranceHeight": 6, "entranceBeat": 9, "defeat": 7, "defeatBeat": 5, "ranged": 3, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2210": {"index": 68, "entrance": 8, "entranceDistance": 8, "entranceHeight": 7, "entranceBeat": 10, "defeat": 8, "defeatBeat": 6, "ranged": 4, "replaceRanged": true, "originalProjectile": "twin"}, "sproto2322": {"index": 69, "entrance": 9, "entranceDistance": 9, "entranceHeight": 8, "entranceBeat": 11, "defeat": 9, "defeatBeat": 7, "ranged": 5, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2344": {"index": 70, "entrance": 10, "entranceDistance": 10, "entranceHeight": 9, "entranceBeat": 5, "defeat": 0, "defeatBeat": 3, "ranged": 6, "replaceRanged": true, "originalProjectile": "twin"}, "sproto2381": {"index": 71, "entrance": 11, "entranceDistance": 11, "entranceHeight": 10, "entranceBeat": 6, "defeat": 1, "defeatBeat": 4, "ranged": 7, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2531": {"index": 72, "entrance": 0, "entranceDistance": 12, "entranceHeight": 11, "entranceBeat": 7, "defeat": 2, "defeatBeat": 5, "ranged": 0, "replaceRanged": false, "originalProjectile": "miniSproto"}, "sproto2569": {"index": 73, "entrance": 1, "entranceDistance": 13, "entranceHeight": 12, "entranceBeat": 8, "defeat": 3, "defeatBeat": 6, "ranged": 1, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2616": {"index": 74, "entrance": 2, "entranceDistance": 14, "entranceHeight": 13, "entranceBeat": 9, "defeat": 4, "defeatBeat": 7, "ranged": 2, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2789": {"index": 75, "entrance": 3, "entranceDistance": 15, "entranceHeight": 14, "entranceBeat": 10, "defeat": 5, "defeatBeat": 3, "ranged": 3, "replaceRanged": true, "originalProjectile": "spark"}, "sproto2884": {"index": 76, "entrance": 4, "entranceDistance": 16, "entranceHeight": 15, "entranceBeat": 11, "defeat": 6, "defeatBeat": 4, "ranged": 4, "replaceRanged": true, "originalProjectile": "spark"}, "sproto3106": {"index": 77, "entrance": 5, "entranceDistance": 17, "entranceHeight": 16, "entranceBeat": 5, "defeat": 7, "defeatBeat": 5, "ranged": 5, "replaceRanged": false, "originalProjectile": "referenceB"}, "sproto3152": {"index": 78, "entrance": 6, "entranceDistance": 18, "entranceHeight": 4, "entranceBeat": 6, "defeat": 8, "defeatBeat": 6, "ranged": 6, "replaceRanged": false, "originalProjectile": "pelvicStream"}, "sproto3181": {"index": 79, "entrance": 7, "entranceDistance": 19, "entranceHeight": 5, "entranceBeat": 7, "defeat": 9, "defeatBeat": 7, "ranged": 7, "replaceRanged": true, "originalProjectile": "twin"}, "sproto3215": {"index": 80, "entrance": 8, "entranceDistance": 20, "entranceHeight": 6, "entranceBeat": 8, "defeat": 0, "defeatBeat": 3, "ranged": 0, "replaceRanged": true, "originalProjectile": "spark"}, "sproto3224": {"index": 81, "entrance": 9, "entranceDistance": 21, "entranceHeight": 7, "entranceBeat": 9, "defeat": 1, "defeatBeat": 4, "ranged": 1, "replaceRanged": true, "originalProjectile": "twin"}, "sproto3235": {"index": 82, "entrance": 10, "entranceDistance": 22, "entranceHeight": 8, "entranceBeat": 10, "defeat": 2, "defeatBeat": 5, "ranged": 2, "replaceRanged": true, "originalProjectile": "twin"}, "vaudream": {"index": 83, "entrance": 11, "entranceDistance": 23, "entranceHeight": 9, "entranceBeat": 11, "defeat": 3, "defeatBeat": 6, "ranged": 3, "replaceRanged": true, "originalProjectile": "spark"}, "uncmasterflex": {"index": 84, "entrance": 0, "entranceDistance": 24, "entranceHeight": 10, "entranceBeat": 5, "defeat": 4, "defeatBeat": 7, "ranged": 4, "replaceRanged": true, "originalProjectile": "spark"}, "gryph": {"index": 85, "entrance": 1, "entranceDistance": 8, "entranceHeight": 11, "entranceBeat": 6, "defeat": 5, "defeatBeat": 3, "ranged": 5, "replaceRanged": true, "originalProjectile": "twin"}, "vitaliketh": {"index": 86, "entrance": 2, "entranceDistance": 9, "entranceHeight": 12, "entranceBeat": 7, "defeat": 6, "defeatBeat": 4, "ranged": 6, "replaceRanged": true, "originalProjectile": "spark"}, "urmometh": {"index": 87, "entrance": 3, "entranceDistance": 10, "entranceHeight": 13, "entranceBeat": 8, "defeat": 7, "defeatBeat": 5, "ranged": 7, "replaceRanged": true, "originalProjectile": "spark"}, "chaton": {"index": 88, "entrance": 4, "entranceDistance": 11, "entranceHeight": 14, "entranceBeat": 9, "defeat": 8, "defeatBeat": 6, "ranged": 0, "replaceRanged": true, "originalProjectile": "spark"}, "loadthebags": {"index": 89, "entrance": 5, "entranceDistance": 12, "entranceHeight": 15, "entranceBeat": 10, "defeat": 9, "defeatBeat": 7, "ranged": 1, "replaceRanged": true, "originalProjectile": "spark"}, "sisma": {"index": 90, "entrance": 6, "entranceDistance": 13, "entranceHeight": 16, "entranceBeat": 11, "defeat": 0, "defeatBeat": 3, "ranged": 2, "replaceRanged": false, "originalProjectile": "retain"}, "captainhowdy": {"index": 91, "entrance": 7, "entranceDistance": 14, "entranceHeight": 4, "entranceBeat": 5, "defeat": 1, "defeatBeat": 4, "ranged": 3, "replaceRanged": true, "originalProjectile": "spark"}, "sprotosales": {"index": 92, "entrance": 8, "entranceDistance": 15, "entranceHeight": 5, "entranceBeat": 6, "defeat": 2, "defeatBeat": 5, "ranged": 4, "replaceRanged": true, "originalProjectile": "spark"}, "sprog": {"index": 93, "entrance": 9, "entranceDistance": 16, "entranceHeight": 6, "entranceBeat": 7, "defeat": 3, "defeatBeat": 6, "ranged": 5, "replaceRanged": true, "originalProjectile": "spark"}, "jasper": {"index": 94, "entrance": 10, "entranceDistance": 17, "entranceHeight": 7, "entranceBeat": 8, "defeat": 4, "defeatBeat": 7, "ranged": 6, "replaceRanged": true, "originalProjectile": "spark"}, "aaron": {"index": 95, "entrance": 11, "entranceDistance": 18, "entranceHeight": 8, "entranceBeat": 9, "defeat": 5, "defeatBeat": 3, "ranged": 7, "replaceRanged": true, "originalProjectile": "spark"}, "brainsprot": {"index": 96, "entrance": 0, "entranceDistance": 19, "entranceHeight": 9, "entranceBeat": 10, "defeat": 6, "defeatBeat": 4, "ranged": 0, "replaceRanged": true, "originalProjectile": "spark"}, "godmod3d": {"index": 97, "entrance": 1, "entranceDistance": 20, "entranceHeight": 10, "entranceBeat": 11, "defeat": 7, "defeatBeat": 5, "ranged": 1, "replaceRanged": true, "originalProjectile": "twin"}, "sober": {"index": 98, "entrance": 2, "entranceDistance": 21, "entranceHeight": 11, "entranceBeat": 5, "defeat": 8, "defeatBeat": 6, "ranged": 2, "replaceRanged": true, "originalProjectile": "spark"}, "nosmileclown": {"index": 99, "entrance": 3, "entranceDistance": 22, "entranceHeight": 12, "entranceBeat": 6, "defeat": 9, "defeatBeat": 7, "ranged": 3, "replaceRanged": true, "originalProjectile": "twin"}, "olnoname": {"index": 100, "entrance": 4, "entranceDistance": 23, "entranceHeight": 13, "entranceBeat": 7, "defeat": 0, "defeatBeat": 3, "ranged": 4, "replaceRanged": true, "originalProjectile": "spark"}, "greatcharly": {"index": 101, "entrance": 5, "entranceDistance": 24, "entranceHeight": 14, "entranceBeat": 8, "defeat": 1, "defeatBeat": 4, "ranged": 5, "replaceRanged": true, "originalProjectile": "spark"}} as const;
const SIGNATURE_PROJECTILES:Partial<Record<FighterId,string>> = {"rivet": "signature:0:0", "rune": "signature:5:5", "guest08": "signature:7:7", "guest09": "signature:8:8", "guest14": "signature:13:13", "duo": "signature:21:5", "nick": "signature:22:6", "erik": "signature:25:9", "bimba": "signature:26:10", "gpm": "signature:27:11", "leviosa": "signature:28:12", "lifeisameme": "signature:29:13", "rlarsson": "signature:31:15", "blorfo": "signature:32:0", "freshprince": "signature:34:2", "mlk": "signature:35:3", "sproto102": "signature:36:4", "sproto215": "signature:37:5", "sproto282": "signature:38:6", "sproto313": "signature:39:7", "sproto651": "painting", "sproto704": "signature:41:9", "sproto763": "signature:42:10", "sproto818": "signature:43:11", "sproto831": "signature:44:12", "sproto832": "signature:45:13", "sproto834": "signature:46:14", "sproto837": "signature:47:15", "sproto865": "signature:48:0", "sproto943": "signature:49:1", "sproto999": "signature:50:2", "sproto1011": "signature:51:3", "sproto1093": "signature:52:4", "sproto1187": "signature:53:5", "sproto1335": "signature:54:6", "sproto1345": "signature:55:7", "sproto1414": "signature:56:8", "sproto1477": "signature:57:9", "sproto1499": "signature:58:10", "sproto1601": "signature:59:11", "sproto1625": "signature:60:12", "sproto1668": "signature:61:13", "sproto1815": "signature:62:14", "sproto1870": "signature:63:15", "sproto2010": "signature:64:0", "sproto2075": "signature:65:1", "sproto2101": "signature:66:2", "sproto2177": "signature:67:3", "sproto2210": "signature:68:4", "sproto2322": "signature:69:5", "sproto2344": "signature:70:6", "sproto2381": "signature:71:7", "sproto2569": "signature:73:9", "sproto2616": "signature:74:10", "sproto2789": "signature:75:11", "sproto2884": "signature:76:12", "sproto3181": "signature:79:15", "sproto3215": "signature:80:0", "sproto3224": "signature:81:1", "sproto3235": "signature:82:2", "vaudream": "signature:83:3", "uncmasterflex": "signature:84:4", "gryph": "signature:85:5", "vitaliketh": "signature:86:6", "urmometh": "signature:87:7", "chaton": "signature:88:8", "loadthebags": "signature:89:9", "captainhowdy": "signature:91:11", "sprotosales": "signature:92:12", "sprog": "signature:93:13", "jasper": "signature:94:14", "aaron": "signature:95:15", "brainsprot": "signature:96:0", "godmod3d": "signature:97:1", "sober": "signature:98:2", "nosmileclown": "signature:99:3", "olnoname": "signature:100:4", "greatcharly": "signature:101:5"};
for(const [id,shape]of Object.entries(SIGNATURE_PROJECTILES))COMBAT_STYLES[id as FighterId].projectile.shape=shape!;
/* CHARACTER ACTIONS END */
export type AttackAim = 'level' | 'up' | 'upForward' | 'down';
export type ThrowDirection = 'forward' | 'back' | 'up' | 'down';
export const THROW_HOLD_FRAMES=12, THROW_RECOVERY_FRAMES=18;
export const THROW_CATCH_FRAMES=4, BACK_THROW_LIFT_FRAMES=6, KNOCKDOWN_FRAMES=14, GETUP_FRAMES=6;
export interface HitReaction { kind:'recoil'|'launch'|'knockdown'; phase:'flight'|'down'|'rise'; t:number; direction:number; }
export interface ThrowState {
    attacker:number; victim:number; phase:'hold'|'release'; t:number; direction:ThrowDirection; facing:number;
    startAttackerX:number; startVictimX:number; startVictimY:number;
    gripAttackerX:number; gripVictimX:number; gripVictimY:number;
}
/** Authored gameplay grip geometry in world pixels, independent of image loading.
 * Matched to the installed reaching-hand / hit-torso anchors by contract tests. */
export const THROW_GRIPS:Record<FighterId,{hand:[number,number];torso:[number,number]}> = {
/* SPROTOS GRIPS BEGIN */
sproto102: {"hand": [96.25, -102.5], "torso": [0.0, -58.75]},
sproto215: {"hand": [96.25, -107.5], "torso": [0.0, -67.5]},
sproto282: {"hand": [93.75, -86.25], "torso": [0.0, -67.5]},
sproto313: {"hand": [106.25, -92.5], "torso": [0.0, -63.75]},
sproto651: {"hand": [93.75, -100.0], "torso": [0.0, -61.25]},
sproto704: {"hand": [65.0, -108.75], "torso": [0.0, -66.25]},
sproto763: {"hand": [95.0, -90.0], "torso": [0.0, -55.0]},
sproto818: {"hand": [77.5, -111.25], "torso": [0.0, -65.0]},
sproto831: {"hand": [80.0, -111.25], "torso": [0.0, -61.25]},
sproto832: {"hand": [100.0, -96.25], "torso": [0.0, -63.75]},
sproto834: {"hand": [81.25, -95.0], "torso": [0.0, -63.75]},
sproto837: {"hand": [137.5, -92.5], "torso": [0.0, -60.0]},
sproto865: {"hand": [78.75, -108.75], "torso": [0.0, -66.25]},
sproto943: {"hand": [68.75, -118.75], "torso": [0.0, -66.25]},
sproto999: {"hand": [112.5, -96.25], "torso": [0.0, -66.25]},
sproto1011: {"hand": [167.5, -100.0], "torso": [0.0, -53.75]},
sproto1093: {"hand": [128.75, -95.0], "torso": [0.0, -68.75]},
sproto1187: {"hand": [103.75, -106.25], "torso": [0.0, -68.75]},
sproto1335: {"hand": [92.5, -133.75], "torso": [0.0, -76.25]},
sproto1345: {"hand": [110.0, -102.5], "torso": [0.0, -67.5]},
sproto1414: {"hand": [67.5, -107.5], "torso": [0.0, -60.0]},
sproto1477: {"hand": [100.0, -93.75], "torso": [0.0, -62.5]},
sproto1499: {"hand": [97.5, -92.5], "torso": [0.0, -65.0]},
sproto1601: {"hand": [81.25, -106.25], "torso": [0.0, -66.25]},
sproto1625: {"hand": [76.25, -111.25], "torso": [0.0, -65.0]},
sproto1668: {"hand": [96.25, -101.25], "torso": [0.0, -62.5]},
sproto1815: {"hand": [135.0, -96.25], "torso": [0.0, -65.0]},
sproto1870: {"hand": [67.5, -133.75], "torso": [0.0, -105.0]},
sproto2010: {"hand": [110.0, -95.0], "torso": [0.0, -65.0]},
sproto2075: {"hand": [82.5, -112.5], "torso": [0.0, -67.5]},
sproto2101: {"hand": [95.0, -102.5], "torso": [0.0, -62.5]},
sproto2177: {"hand": [100.0, -102.5], "torso": [0.0, -67.5]},
sproto2210: {"hand": [98.75, -90.0], "torso": [0.0, -61.25]},
sproto2322: {"hand": [77.5, -103.75], "torso": [0.0, -62.5]},
sproto2344: {"hand": [71.25, -93.75], "torso": [0.0, -61.25]},
sproto2381: {"hand": [83.75, -77.5], "torso": [0.0, -62.5]},
sproto2531: {"hand": [62.5, -105.0], "torso": [0.0, -61.25]},
sproto2569: {"hand": [91.25, -98.75], "torso": [0.0, -60.0]},
sproto2616: {"hand": [102.5, -92.5], "torso": [0.0, -57.5]},
sproto2789: {"hand": [165.0, -82.5], "torso": [0.0, -55.0]},
sproto2884: {"hand": [95.0, -98.75], "torso": [0.0, -62.5]},
sproto3106: {"hand": [68.75, -110.0], "torso": [0.0, -61.25]},
sproto3152: {"hand": [127.5, -93.75], "torso": [0.0, -67.5]},
sproto3181: {"hand": [91.25, -103.75], "torso": [0.0, -66.25]},
sproto3215: {"hand": [83.75, -106.25], "torso": [0.0, -57.5]},
sproto3224: {"hand": [91.25, -103.75], "torso": [0.0, -61.25]},
sproto3235: {"hand": [80.0, -105.0], "torso": [0.0, -60.0]},
vaudream:{"hand": [118.75, -60.0], "torso": [0.0, -93.75]},
uncmasterflex:{"hand": [85.0, -93.75], "torso": [0.0, -65.0]},
gryph:{"hand": [92.5, -97.5], "torso": [0.0, -58.75]},
vitaliketh:{"hand": [87.5, -102.5], "torso": [0.0, -66.25]},
urmometh:{"hand": [112.5, -103.75], "torso": [0.0, -67.5]},
chaton:{"hand": [80.0, -96.25], "torso": [0.0, -65.0]},
loadthebags:{"hand": [117.5, -98.75], "torso": [0.0, -65.0]},
sisma:{"hand": [98.75, -90.0], "torso": [0.0, -62.5]},
captainhowdy:{"hand": [63.75, -103.75], "torso": [0.0, -62.5]},
sprotosales:{"hand": [72.5, -102.5], "torso": [0.0, -61.25]},
sprog:{"hand": [80.0, -97.5], "torso": [0.0, -62.5]},
jasper:{"hand": [73.75, -108.75], "torso": [0.0, -66.25]},
aaron:{"hand": [96.25, -96.25], "torso": [0.0, -65.0]},
brainsprot:{"hand": [77.5, -112.5], "torso": [0.0, -70.0]},
godmod3d:{"hand": [101.25, -91.25], "torso": [0.0, -68.75]},
sober:{"hand": [95.0, -111.25], "torso": [0.0, -65.0]},
nosmileclown:{"hand": [112.5, -75.0], "torso": [0.0, -62.5]},
olnoname:{"hand": [88.75, -76.25], "torso": [0.0, -57.5]},
greatcharly:{"hand": [83.75, -116.25], "torso": [0.0, -63.75]},
/* SPROTOS GRIPS END */











/* NICK GRIP BEGIN */
nick:{"hand": [111.25, -93.75], "torso": [0.0, -62.5]},
/* NICK GRIP END */
/* HIGHSPROTO GRIP BEGIN */
highsproto:{"hand": [93.75, -91.25], "torso": [0.0, -62.5]},
/* HIGHSPROTO GRIP END */
/* ERIK GRIP BEGIN */
erik:{"hand": [80.0, -108.75], "torso": [0.0, -62.5]},
/* ERIK GRIP END */
/* BIMBA GRIP BEGIN */
"bimba":{"hand": [83.75, -101.25], "torso": [0.0, -58.75]},
/* BIMBA GRIP END */
/* GPM GRIP BEGIN */
gpm:{"hand": [110.0, -96.25], "torso": [0.0, -67.5]},
/* GPM GRIP END */
/* LEVIOSA GRIP BEGIN */
leviosa:{"hand": [75.0, -87.5], "torso": [0.0, -62.5]},
/* LEVIOSA GRIP END */
/* LIFEISAMEME GRIP BEGIN */
lifeisameme:{"hand": [87.5, -83.75], "torso": [0.0, -60.0]},
/* LIFEISAMEME GRIP END */
/* THXOBAMA GRIP BEGIN */
thxobama:{"hand": [86.25, -87.5], "torso": [0.0, -63.75]},
/* THXOBAMA GRIP END */
/* RLARSSON GRIP BEGIN */
rlarsson:{"hand": [98.75, -91.25], "torso": [0.0, -60.0]},
/* RLARSSON GRIP END */
/* BLORFO GRIP BEGIN */
blorfo:{"hand": [62.5, -103.75], "torso": [0.0, -62.5]},
/* BLORFO GRIP END */
/* MICHAEL GRIP BEGIN */
michael:{"hand": [80.0, -106.25], "torso": [0.0, -63.75]},
/* MICHAEL GRIP END */
/* FRESHPRINCE GRIP BEGIN */
freshprince:{"hand": [98.75, -97.5], "torso": [0.0, -62.5]},
/* FRESHPRINCE GRIP END */
/* MLK GRIP BEGIN */
"mlk":{"hand": [92.5, -96.25], "torso": [0.0, -65.0]},
/* MLK GRIP END */
/* CAPTAIN GRIP BEGIN */
captain:{"hand": [131.25, -92.5], "torso": [0.0, -60.0]},
/* CAPTAIN GRIP END */
"duo":{"hand":[111.25,-75],"torso":[65,-62.5]},"rivet":{"hand":[65.0,-66.25],"torso":[35.0,-57.5]},"vela":{"hand":[76.25,-78.75],"torso":[43.75,-58.75]},"bront":{"hand":[86.25,-73.75],"torso":[65.0,-67.5]},"zephyr":{"hand":[72.5,-68.75],"torso":[45.0,-57.5]},"mox":{"hand": [82.5, -118.75], "torso": [0.0, -65.0]},"rune":{"hand":[53.75,-57.5],"torso":[38.75,-47.5]},"guest07":{"hand":[83.75,-75.0],"torso":[48.75,-58.75]},"guest08":{"hand":[67.5,-70.0],"torso":[40.0,-55.0]},"guest09":{"hand": [72.5, -112.5], "torso": [0.0, -67.5]},"guest10":{"hand": [68.75, -103.75], "torso": [0.0, -58.75]},"guest11":{"hand":[41.25,-68.75],"torso":[31.25,-53.75]},"guest12":{"hand":[50.0,-75.0],"torso":[37.5,-57.5]},"guest13":{"hand":[40.0,-73.75],"torso":[20.0,-61.25]},"guest14":{"hand":[60.0,-62.5],"torso":[35.0,-48.75]},"dumpstar":{"hand":[53.75,-87.5],"torso":[27.5,-66.25]},"crapto":{"hand":[63.75,-86.25],"torso":[35.0,-61.25]},"vamp":{"hand": [71.25, -111.25], "torso": [0.0, -62.5]},"alpha777":{"hand":[43.75,-66.25],"torso":[33.75,-51.25]},"mandela":{"hand":[73.75,-57.5],"torso":[50.0,-52.5]},"bigswole":{"hand":[52.5,-66.25],"torso":[37.5,-51.25]},"nate":{"hand":[66.25,-47.5],"torso":[42.5,-28.75]}};
/** Organic spit follows stance height and always travels horizontally. */
export const HORIZONTAL_SPIT_FIGHTERS:readonly FighterId[] = ['rivet','vela','guest07','guest13','crapto'];
export const isHorizontalSpit = (id:FighterId) => HORIZONTAL_SPIT_FIGHTERS.includes(id);
/** Fixed world-side formation: facing changes never teleport the two bodies
 * through one another. These are combat geometry, not render-only offsets. */












/* SPROTOS PAIRS BEGIN */
export const PAIRED_BODY_IDS:Partial<Record<FighterId,readonly string[]>> = {"duo": ["duo", "duo-blue"], "sproto282": ["sproto282", "sproto282-companion"], "sproto704": ["sproto704", "sproto704-companion"], "sproto832": ["sproto832", "sproto832-companion"], "sproto1499": ["sproto1499", "sproto1499-companion"], "sproto1625": ["sproto1625", "sproto1625-companion"], "sproto2010": ["sproto2010", "sproto2010-companion"], "sproto2075": ["sproto2075", "sproto2075-companion"], "sproto2210": ["sproto2210", "sproto2210-companion"], "sproto2344": ["sproto2344", "sproto2344-companion"], "sproto3181": ["sproto3181", "sproto3181-companion"], "sproto3224": ["sproto3224", "sproto3224-companion"], "sproto3235": ["sproto3235", "sproto3235-companion"], "gryph": ["gryph", "gryph-companion"], "godmod3d": ["godmod3d", "godmod3d-companion"], "nosmileclown": ["nosmileclown", "nosmileclown-companion"]};
export const BODY_SPACING:Partial<Record<FighterId,number>> = {"sproto282": 144, "sproto704": 144, "sproto832": 144, "sproto1499": 144, "sproto1625": 144, "sproto2010": 144, "sproto2075": 144, "sproto2210": 144, "sproto2344": 144, "sproto3181": 112, "sproto3224": 144, "sproto3235": 144, "gryph": 144, "godmod3d": 144, "nosmileclown": 112};
export const bodyAtlasIds=(id:FighterId):readonly string[]=>PAIRED_BODY_IDS[id]??[id];
export const isPairedFighter=(id:FighterId)=>!!PAIRED_BODY_IDS[id];
export const bodyOffsets=(id:FighterId)=>bodyAtlasIds(id).map((_,i)=>(i-(bodyAtlasIds(id).length-1)/2)*(BODY_SPACING[id]??144));
const EXPANSION_PAIR_GRIPS:Partial<Record<FighterId,Record<string,{hand:[number,number];torso:[number,number]}>>> = {"sproto282": {"-1": {"hand": [165.75, -86.25], "torso": [72.0, -67.5]}, "1": {"hand": [167.0, -105.0], "torso": [72.0, -62.5]}}, "sproto704": {"-1": {"hand": [137.0, -108.75], "torso": [72.0, -66.25]}, "1": {"hand": [157.0, -88.75], "torso": [72.0, -67.5]}}, "sproto832": {"-1": {"hand": [172.0, -96.25], "torso": [72.0, -63.75]}, "1": {"hand": [163.25, -93.75], "torso": [72.0, -60.0]}}, "sproto1499": {"-1": {"hand": [169.5, -92.5], "torso": [72.0, -65.0]}, "1": {"hand": [170.75, -85.0], "torso": [72.0, -63.75]}}, "sproto1625": {"-1": {"hand": [148.25, -111.25], "torso": [72.0, -65.0]}, "1": {"hand": [173.25, -91.25], "torso": [72.0, -58.75]}}, "sproto2010": {"-1": {"hand": [182.0, -95.0], "torso": [72.0, -65.0]}, "1": {"hand": [174.5, -97.5], "torso": [72.0, -62.5]}}, "sproto2075": {"-1": {"hand": [154.5, -112.5], "torso": [72.0, -67.5]}, "1": {"hand": [184.5, -103.75], "torso": [72.0, -67.5]}}, "sproto2210": {"-1": {"hand": [170.75, -90.0], "torso": [72.0, -61.25]}, "1": {"hand": [169.5, -95.0], "torso": [72.0, -57.5]}}, "sproto2344": {"-1": {"hand": [143.25, -93.75], "torso": [72.0, -61.25]}, "1": {"hand": [168.25, -102.5], "torso": [72.0, -60.0]}}, "sproto3181": {"-1": {"hand": [147.25, -103.75], "torso": [56.0, -66.25]}, "1": {"hand": [87.2, -48.0], "torso": [56.0, -29.4]}}, "sproto3224": {"-1": {"hand": [163.25, -103.75], "torso": [72.0, -61.25]}, "1": {"hand": [162.0, -86.25], "torso": [72.0, -60.0]}}, "sproto3235": {"-1": {"hand": [152.0, -105.0], "torso": [72.0, -60.0]}, "1": {"hand": [147.0, -107.5], "torso": [72.0, -62.5]}}, "gryph": {"-1": {"hand": [164.5, -97.5], "torso": [72.0, -58.75]}, "1": {"hand": [173.25, -88.75], "torso": [72.0, -62.5]}}, "godmod3d": {"-1": {"hand": [173.25, -91.25], "torso": [72.0, -68.75]}, "1": {"hand": [154.5, -112.5], "torso": [72.0, -67.5]}}, "nosmileclown": {"-1": {"hand": [168.5, -75.0], "torso": [56.0, -62.5]}, "1": {"hand": [84.05, -42.900000000000006], "torso": [56.0, -25.3]}}};
/* SPROTOS PAIRS END */
export const DUO_SPREAD = 72;
export const bodySpread = (id:FighterId) => (bodyAtlasIds(id).length-1)*(BODY_SPACING[id]??144)/2;
export const fighterWall = (id:FighterId) => WALL+bodySpread(id);
/** Duo grips use the front body's inspected art, separately in each facing. */
export function getThrowGrip(f:Pick<Fighter,'id'|'facing'>,part:'hand'|'torso'):[number,number] {
    const pair=EXPANSION_PAIR_GRIPS[f.id];if(pair)return pair[String(f.facing)][part];
    if(f.id!=='duo')return THROW_GRIPS[f.id][part];
    const contact=f.facing===1?{hand:[60,-91.25],torso:[46.25,-71.25]}:{hand:[57.5,-83.75],torso:[47.5,-68.75]};
    return [DUO_SPREAD+contact[part][0],contact[part][1]];
}
/** Mouth anchors in the existing full-body crouch pose, in world pixels. */
const CROUCH_SPIT_ORIGINS:Partial<Record<FighterId,{forward:number;height:number}>> = {
    rivet:{forward:44,height:74}, vela:{forward:49,height:85},
    guest07:{forward:65,height:79}, guest13:{forward:30,height:78}, crapto:{forward:39,height:80},
};
export const isCrouchingSpit = (f:Fighter) => isHorizontalSpit(f.id) && f.y>=FLOOR && f.move?.id==='bolt' && f.move.aim==='down';
export interface Attack {
    id: MoveId;
    t: number;
    hit: boolean;
    connected: boolean;
    wave: number;
    aim?: AttackAim;
    shotX?: number;
    shotY?: number;
    throwDirection?: ThrowDirection;
}
export interface Fighter {
    id: FighterId;
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: number;
    hp: number;
    slow: number;
    reaction:HitReaction|null;
    throwInvuln:number;
    stun: number;
    blockstun: number;
    move: Attack | null;
    prev: number;
    input: number;
    buffer: number;
    bufferLife: number;
    bufferInput: number;
    usedMoves: Partial<Record<MoveId,number>>;
    dashCanceled: boolean;
    jumpBuffer: number;
    jumpDelay: number;
    airJumps: number;
    dash: number;
    dashLock: number;
    dashBuffer:number;
    /** Direction at the dash press, preserved through hitstop/recovery. */
    dashDirection:number;
    pips: number;
    combo: number;
    comboDamage: number;
    lastFinisher: boolean;
    chargeEligible: boolean;
    best: number;
    flash: number;
}
export interface Effect {
    x: number;
    y: number;
    life: number;
    max: number;
    kind: 'hit' | 'block' | 'charge' | 'dash' | 'special' | 'pumpkin';
    color: string;
}
export interface Projectile {
    owner: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    damage: number;
    /** Finite, horizontal single-contact beam; it stays visible after contact. */
    beamLength?:number; beamFrames?:number; beamDirection?:number; beamHit?:boolean;
    age?:number; bounces?:number; shape?:string; gravity?:number; returnAt?:number; wave?:number; accel?:number; ground?:boolean;
}
export interface CombatState {
    throwState: ThrowState | null;
    frame: number;
    fighters: [
        Fighter,
        Fighter
    ];
    projectiles: Projectile[];
    effects: Effect[];
    freeze: number;
    mode: Mode;
    godMode?: boolean;
    winner: number | null;
    notice: string;
    noticeLife: number;
}
const makeFighter = (id: FighterId, x: number, facing: number): Fighter => ({ id, x, y: FLOOR, vx: 0, vy: 0, facing, hp: 1000, slow:0, reaction:null, throwInvuln:0, stun: 0, blockstun: 0, move: null, prev: 0, input: 0, buffer: 0, bufferLife: 0, bufferInput:0, usedMoves:{}, dashCanceled:false, jumpBuffer: 0, jumpDelay: 0, airJumps: 0, dash: 0, dashLock: 0, dashBuffer:0, dashDirection:facing, pips: 0, combo: 0, comboDamage: 0, lastFinisher: false, chargeEligible: true, best: 0, flash: 0 });
export function createState(id: PlayableFighterId = 'rivet', mode: Mode = 'cpu', opponent?: PlayableFighterId): CombatState { if (!PLAYABLE_FIGHTERS.includes(id) || (opponent && !PLAYABLE_FIGHTERS.includes(opponent)))
    throw new Error('Unknown roster selection.'); return { throwState:null, frame: 0, fighters: [makeFighter(id, 380, 1), makeFighter(opponent ?? (id === 'rivet' ? 'vela' : 'rivet'), 900, -1)], projectiles: [], effects: [], freeze: 0, mode, winner: null, notice: 'LIGHT → MEDIUM → FINISHER', noticeLife: 220 }; }
export const grounded = (f: Fighter) => f.y >= FLOOR;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function effect(s: CombatState, x: number, y: number, kind: Effect['kind'], color: string) { const life = kind === 'charge' ? 45 : kind === 'special' ? 28 : 16; s.effects.push({ x, y, kind, color, life, max: life }); }
function finishCombo(s: CombatState, attacker: Fighter) {
    if (!attacker.combo)
        return;
    attacker.best = Math.max(attacker.best, attacker.combo);
    if (attacker.combo >= 3 && attacker.lastFinisher && attacker.chargeEligible) {
        attacker.pips = Math.min(3, attacker.pips + 1);
        effect(s, attacker.x, attacker.y - 130, 'charge', ROSTER[attacker.id].color);
        if (attacker === s.fighters[0]) {
            s.notice = attacker.pips === 3 ? 'RELAY READY — TEAM SPECIAL' : 'CLEAN FINISH  /  +1 RELAY CHARGE';
            s.noticeLife = 150;
        }
    }
    attacker.usedMoves = {};
    attacker.dashCanceled = false;
    attacker.combo = 0;
    attacker.comboDamage = 0;
    attacker.lastFinisher = false;
    attacker.chargeEligible = true;
}
/** Cancel an interrupted catch without teleporting the victim or awarding damage. */
function interruptThrow(s:CombatState):void {
    const hold=s.throwState;if(!hold)return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    if(hold.phase==='hold'){
        b.vx=0;b.vy=grounded(b)?0:2;b.stun=Math.max(b.stun,8);b.throwInvuln=20;
        b.reaction={kind:'recoil',phase:'flight',t:0,direction:hold.facing};
        b.buffer=0;b.bufferLife=0;b.jumpBuffer=0;b.dashBuffer=0;
    }
    if(a.move?.id==='grab')a.move=null;
    s.throwState=null;
}
function positionHeldVictim(s:CombatState):void {
    const hold=s.throwState;if(!hold||hold.phase!=='hold')return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    const t=Math.min(1,hold.t/THROW_CATCH_FRAMES),ease=t*t*(3-2*t);
    a.x=hold.startAttackerX+(hold.gripAttackerX-hold.startAttackerX)*ease;
    b.x=hold.startVictimX+(hold.gripVictimX-hold.startVictimX)*ease;
    b.y=hold.startVictimY+(hold.gripVictimY-hold.startVictimY)*ease;
    a.facing=hold.facing;b.facing=-hold.facing;b.vx=0;b.vy=0;b.stun=1;
}
function beginThrow(s:CombatState,index:number):void {
    const a=s.fighters[index],b=s.fighters[1-index];
    if(s.throwState||a.stun||a.blockstun||!a.move||a.move.id!=='grab'||!grounded(a)||!grounded(b)||b.stun||b.blockstun||b.throwInvuln||a.hp<=0||b.hp<=0)return;
    const hand=getThrowGrip(a,'hand'),torso=getThrowGrip({id:b.id,facing:-a.facing},'torso');
    const gap=hand[0]+torso[0];
    // Clamp the pair as a unit. Four catch frames settle into the authored grip;
    // the victim is never independently squashed into the holder at a corner.
    const aw=fighterWall(a.id),bw=fighterWall(b.id);
    const ax=clamp(a.x,a.facing===-1?Math.max(aw,bw+gap):aw,a.facing===1?Math.min(WIDTH-aw,WIDTH-bw-gap):WIDTH-aw);
    s.throwState={attacker:index,victim:1-index,phase:'hold',t:0,direction:a.move.throwDirection??'forward',facing:a.facing,
        startAttackerX:a.x,startVictimX:b.x,startVictimY:b.y,
        gripAttackerX:ax,gripVictimX:ax+a.facing*gap,gripVictimY:Math.min(FLOOR,a.y+hand[1]-torso[1])};
    a.vx=0;a.vy=0;a.move.hit=true;a.move.connected=false;
    b.move=null;b.dash=0;b.blockstun=0;b.reaction=null;
    for(const f of [a,b]){f.buffer=0;f.bufferLife=0;f.jumpBuffer=0;f.jumpDelay=0;f.dashBuffer=0;}
    positionHeldVictim(s);
}
function updateThrow(s:CombatState):void {
    const hold=s.throwState;if(!hold)return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    if(a.hp<=0||(hold.phase==='hold'&&b.hp<=0)||a.stun||a.blockstun){interruptThrow(s);return;}
    hold.t++;
    if(hold.phase==='hold'){
        positionHeldVictim(s);
        if(hold.t===THROW_CATCH_FRAMES){effect(s,b.x,b.y-65,'block',ROSTER[a.id].color);s.freeze=Math.max(s.freeze,3);}
        if(hold.t>=THROW_HOLD_FRAMES){
            hold.phase='release';hold.t=0;
            const direction=hold.direction==='back'?-hold.facing:hold.facing;
            a.facing=direction;
            damage(s,hold.attacker,getMove(a,'grab'),'grab');
            // Release exactly where the catch ended. Back throws travel over
            // the shoulder instead of teleporting to the other side.
            b.vx=hold.direction==='back'?0:direction*(hold.direction==='up'?3:hold.direction==='down'?6:14);
            b.vy=hold.direction==='up'?-18:hold.direction==='down'?12:hold.direction==='back'?-22:-8;
            b.y=Math.min(b.y,FLOOR-1);
            b.stun=35;b.reaction={kind:'knockdown',phase:'flight',t:0,direction};
            if(a.move)a.move.t=MOVES.grab.startup+MOVES.grab.active;
        }
    }else if(hold.t>=THROW_RECOVERY_FRAMES){
        if(a.move?.id==='grab')a.move=null;
        s.throwState=null;
    }
}
function throwDirection(input:number,facing:number):ThrowDirection {
    const vertical=((input&A.up)?1:0)-((input&A.down)?1:0);
    if(vertical)return vertical>0?'up':'down';
    const horizontal=((input&A.right)?1:0)-((input&A.left)?1:0);
    return horizontal*facing<0?'back':'forward';
}
export const isDown = (f:Fighter) => !!f.reaction && f.reaction.phase!=='flight';
function damage(s: CombatState, index: number, m: Move, kind: MoveId, projectile = false): boolean {
    const a = s.fighters[index], b = s.fighters[1 - index];
    if (b.hp <= 0 || isDown(b))
        return false;
    const hold=s.throwState;
    // A held victim cannot take incidental projectile damage; only release hits.
    if(hold?.phase==='hold' && hold.victim===1-index && kind!=='grab')return false;
    const heldAttacker=!!hold && hold.attacker===1-index;
    const back = b.facing === 1 ? A.left : A.right;
    const guarding = !heldAttacker && kind !== 'grab' && b.stun === 0 && !b.move && b.dash === 0 && (b.input & back) !== 0 && (!m.low || (b.input & A.down) !== 0) && (!m.air || (b.input & A.down) === 0);
    if (guarding) {
        b.blockstun = 15;
        b.vx = a.facing * m.push * .45;
        effect(s, b.x, b.y - 65, 'block', '#85c8ff');
        s.freeze = Math.max(s.freeze, 3);
        return false;
    }
    if(heldAttacker)interruptThrow(s);
    const scaling = Math.max(.45, 1 - a.combo * .08), amount = Math.round(m.damage * scaling);
    b.hp = Math.max(0, b.hp - (s.godMode && index === 1 ? 0 : amount));
    b.stun = m.stun;
    b.blockstun = 0;
    b.move = null;
    b.dash = 0;
    b.buffer = 0;
    b.flash = 10;
    b.vx = a.facing * m.push * (a.combo > 0 && !m.finisher ? .55 : 1);
    if (m.launch) {
        b.vy = -m.launch;
        b.y = Math.min(b.y, FLOOR - 1);
    }
    else if (!grounded(b)) {
        // Keep confirmed aerial chains together instead of leaving the victim below
        // an ascending attacker. Finishers still knock downward; route limits remain.
        b.vy = kind === 'airHeavy' ? 10 : m.air && !grounded(a) ? Math.min(-4.5,a.vy) : -4.5;
    }
    const power=COMBAT_STYLES[a.id].power;
    if(kind==='special'||(projectile&&(a.id==='vamp'||a.id==='crapto'))){
      if(power==='slow')b.slow=90;
      if(power==='drain'&&a.hp>0)a.hp=Math.min(1000,a.hp+Math.round(amount*.2));
      if(kind==='special'&&power==='pull'&&a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1)b.vx=a.facing*18;
      if(kind==='special'&&power==='slam'&&a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1)b.vy=16;
    }
    const finalSpecial=kind==='special' && a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1;
    const hard=!!m.finisher||finalSpecial||b.hp===0||b.reaction?.kind==='knockdown';
    if(hard && grounded(b) && !m.launch){
        b.y=FLOOR-1;b.vy=kind==='sweep'?-5:kind==='airHeavy'?6:-8;
    }
    b.reaction={kind:hard?'knockdown':!grounded(b)?'launch':'recoil',phase:'flight',t:0,direction:a.facing};
    a.combo++;
    a.usedMoves[kind]=(a.usedMoves[kind]??0)+1;
    if(projectile && a.move?.id==='bolt')a.move.connected=true;
    a.comboDamage += amount;
    a.lastFinisher = !!m.finisher;
    if (kind === 'special')
        a.chargeEligible = false;
    if (!projectile && a.move) {
        a.move.hit = true;
        a.move.connected = true;
    }
    effect(s, b.x - a.facing * 18, b.y - 65, kind === 'special' ? 'special' : 'hit', ROSTER[a.id].color);
    s.freeze = Math.max(s.freeze, kind === 'heavy' || kind === 'airHeavy' ? 8 : 5);
    return true;
}
function chooseMove(f: Fighter, buttons: number, directions=f.input): MoveId | null {
    if (buttons & A.special)
        return 'special';
    if (buttons & A.grab)
        return 'grab';
    if (buttons & A.launcher)
        return 'launcher';
    if (buttons & A.heavy)
        return !grounded(f) ? 'airHeavy' : directions & A.down ? 'sweep' : 'heavy';
    if (buttons & A.medium)
        return grounded(f) ? 'medium' : 'airMedium';
    if (buttons & A.light && directions & A.up) return 'launcher';
    if (buttons & A.light)
        return !grounded(f) ? 'airLight' : directions & A.down ? 'low' : 'light';
    if (buttons & A.bolt)
        return 'bolt';
    return null;
}
export function getMove(f: Fighter, id: MoveId): Move {
 const style=COMBAT_STYLES[f.id];
 let m:Move={...MOVES[id],...(id==='light'?{range:style.lightRange}:id==='heavy'||id==='airHeavy'?style.heavy:id==='bolt'?style.bolt:id==='special'?{...style.special,startup:style.specialFrames[0],active:style.specialFrames.at(-1)!-style.specialFrames[0]+1,recovery:30}:{} )};
 const aim = f.move?.id === id ? f.move.aim : undefined;
 if(!m.projectile && id !== 'special' && id !== 'grab'){
   if(aim==='upForward')m={...m,range:155,stun:Math.max(m.stun,32),launch:10};
   if(aim==='up')m={...m,range:95,stun:Math.max(m.stun,32),launch:14};
   if(aim==='down' && grounded(f))m={...m,low:true};
   if(!grounded(f))m={...m,air:true};
 }
 // Melee originates at the front member. The shared root stays between both.
 if(isPairedFighter(f.id)&&!m.projectile&&id!=='special')m.range+=bodySpread(f.id);
 return m;
}
function act(s: CombatState, f: Fighter) {
    if (f.hp<=0 || s.fighters.some(other=>other.hp<=0) || f.stun || f.blockstun || (s.throwState && (s.fighters[s.throwState.attacker]===f || (s.throwState.phase==='hold'&&s.fighters[s.throwState.victim]===f))))
        return;
    const just = f.input & ~f.prev;
    // Up + organic spit is a jump-and-fire input, not a grounded aiming chord.
    const chordAttacks=A.light|A.medium|A.heavy|A.grab|(isHorizontalSpit(f.id)?0:A.bolt);
    const directionalChord = (f.input & A.up) && (just & chordAttacks);
    if (directionalChord) f.jumpBuffer = 0;
    if (f.jumpBuffer > 0 && f.jumpDelay === 0) {
        if (grounded(f) && f.dash <= 8 && (!f.move || (f.move.id === 'launcher' && f.move.connected))) {
            const chasing = f.move?.id === 'launcher';
            f.vy = chasing ? -17 : ROSTER[f.id].jump * -1;
            f.y -= 1;
            f.jumpBuffer = 0;
            f.dash = 0;
            f.dashBuffer = 0;
            f.move = null;
            if (chasing)
                f.vx = f.facing * 3;
        }
    }
    // Resolve a last-instant landing press as a grounded move after physics.
    const landingThisFrame = !grounded(f) && f.vy >= 0 && f.y + f.vy + GRAVITY >= FLOOR;
    // Keep the spit buffered through the normal two-frame jump chord window.
    const waitingForSpitJump = grounded(f) && f.jumpBuffer>0 && isHorizontalSpit(f.id) && chooseMove(f,f.buffer,f.bufferInput)==='bolt' && (f.bufferInput&A.up);
    if (f.bufferLife > 0 && !landingThisFrame && !waitingForSpitJump) {
        const id = chooseMove(f, f.buffer, f.bufferInput);
        if (id) {
            const m = getMove(f, id);
            const used=f.usedMoves[id]??0, limit=id==='light'||id==='airLight'?2:1;
            const withinRoute=f.combo===0||used<limit;
            const linkLight=f.move?.id==='light' && (id==='light'||id==='low');
            const canCancel = f.move && f.move.connected && (m.rank > MOVES[f.move.id].rank || linkLight) && f.move.id !== 'special' && id !== 'grab';
            if (withinRoute && (!f.move || canCancel) && f.dash <= 8 && (id !== 'grab' || grounded(f)) && (id !== 'special' || f.pips === 3)) {
                if (id === 'special') {
                    f.pips = 0;
                    f.chargeEligible = false;
                    s.notice = ROSTER[f.id].special + ' / TEAM RELAY';
                    s.noticeLife = 100;
                }
                const forward = f.facing===1?A.right:A.left;
                const directions=f.bufferInput;
                const aim:AttackAim = directions&A.up ? (directions&forward?'upForward':'up') : directions&A.down?'down':'level';
                const spit=id==='bolt' && (isHorizontalSpit(f.id)||COMBAT_STYLES[f.id].projectile.horizontal===true);
                const vertical = spit?0:directions&A.up?-1:directions&A.down?1:0;
                const horizontal = vertical ? ((directions&A.left)?-1:(directions&A.right)?1:0) : f.facing;
                f.dash = 0;
                // The selected attack wins a simultaneous dash/attack chord.
                f.dashBuffer = 0;
                f.move = { id, t: 0, hit: false, connected: false, wave: -1, aim: spit?(grounded(f)&&(directions&A.down)&&!(directions&A.up)?'down':'level'):id==='launcher' && aim==='level'?'up':aim, shotX:horizontal,shotY:vertical, throwDirection:id==='grab'?throwDirection(directions,f.facing):undefined };

                f.buffer = 0;
                f.bufferLife = 0;
            }
        }
    }
    if (f.dashBuffer>0 && f.dashLock===0 && f.move?.connected && f.combo>0 && !f.dashCanceled && f.move.id!=='special') { f.move=null; f.dashCanceled=true; }
    if (!f.move && !f.jumpBuffer && f.dashBuffer>0 && f.dashLock === 0) {
        f.dash = 11;
        f.dashBuffer=0;
        f.dashLock = 28;
        f.vx = f.dashDirection * (f.id === 'vela' ? 13 : 15);
        effect(s, f.x, f.y - 50, 'dash', ROSTER[f.id].color);
    }
}
export function cpuInput(s: CombatState): number {
    const f = s.fighters[1], p = s.fighters[0], rootDistance = Math.abs(p.x - f.x), toward = p.x < f.x ? A.left : A.right, away = p.x < f.x ? A.right : A.left;
    // Approach and ordinary attacks use the gap between the two front bodies.
    // Root distance alone leaves a wide fighter stuck walking into collision.
    const distance = Math.max(0, rootDistance - bodySpread(f.id) - bodySpread(p.id));
    if (s.mode === 'dummy')
        return 0;
    if (s.mode === 'guard')
        return away | (p.input & A.down);
    if (f.stun || f.blockstun)
        return 0;
    if (f.move?.id === 'launcher' && f.move.connected && grounded(f))
        return A.up | toward;
    let input = distance > 105 ? toward : 0;
    if (s.frame % 2 === 0)
        return input;
    if (f.move?.connected) {
        const rank = MOVES[f.move.id].rank;
        if (rank === 1)
            return input | A.medium;
        if (rank === 2)
            return input | (s.frame % 5 === 1 && grounded(f) ? A.launcher : A.heavy);
    }
    if (f.move)
        return input;
    if (p.move && distance < 180 && s.frame % 120 < 65)
        return away | (p.input & A.down);
    // Specials originate at the shared root; unlike ordinary melee their range
    // does not include the attacker's formation spread.
    if (f.pips === 3 && rootDistance - bodySpread(p.id) < Math.min(450, getMove(f, 'special').range))
        return A.special;
    if (f.id === 'vela' && distance > 260) {
        input = distance < 390 ? away : 0;
        if (s.frame % 45 < 4)
            return input | A.bolt;
    }
    if (distance < 90)
        return input | (s.frame % 150 < 22 ? A.grab : A.light);
    if (distance < 125)
        return input | A.medium;
    if (distance > 260 && s.frame % 90 < 3)
        return input | A.bolt;
    if (distance > 220 && s.frame % 120 < 4)
        return input | A.dash;
    return input;
}
/** Supply exactly one frame-indexed input pair per step. Replays need only initial config + these masks. */
export function step(s: CombatState, inputs: [
    number,
    number
]): void {
    if (s.winner !== null)
        return;
    if(s.godMode){s.fighters[0].hp=1000;s.fighters[0].pips=3;}
    const endingKO=s.fighters.some(f=>f.hp<=0);
    if(endingKO)inputs=[0,0];
    s.frame++;
    s.effects = s.effects.filter(e => --e.life > 0);
    if (s.noticeLife > 0)
        s.noticeLife--;
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i];
        f.input = inputs[i];
        if(s.throwState && ((i===s.throwState.attacker && (s.throwState.phase==='hold'||s.throwState.t<THROW_RECOVERY_FRAMES-6)) || (s.throwState.phase==='hold'&&i===s.throwState.victim))){
            f.buffer=0;f.bufferLife=0;f.jumpBuffer=0;f.jumpDelay=0;f.dashBuffer=0;f.prev=f.input;continue;
        }
        const pressed = f.input & ~f.prev;
        if(pressed&A.dash){
            // Vertical+dash is not stored as a surprise dash after the vertical
            // direction is released. Up retains jump/chord priority; Down crouches.
            f.dashBuffer=(f.input&(A.up|A.down))?0:8;
            const horizontal=((f.input&A.right)?1:0)-((f.input&A.left)?1:0);
            f.dashDirection=horizontal||f.facing;
        }
        if (pressed & A.up) { f.jumpBuffer = 10; f.jumpDelay = 2; }
        const attacks = pressed & (A.light | A.medium | A.heavy | A.launcher | A.bolt | A.grab | A.special);
        if (attacks) {
            f.buffer = attacks;
            f.bufferLife = 14;
            f.bufferInput = f.input;
            if(f.input&A.up && attacks&(A.light|A.medium|A.heavy|A.grab|(isHorizontalSpit(f.id)?0:A.bolt))){f.jumpBuffer=0;f.jumpDelay=0;}
        }
    }
    if (s.freeze > 0) {
        s.freeze--;
        for (const f of s.fighters)
            f.prev = f.input;
        return;
    }
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i], other = s.fighters[1 - i];
        if(f.slow>0)f.slow--;
        if(f.throwInvuln>0)f.throwInvuln--;
        if(f.reaction){
            f.reaction.t++;
            if(f.reaction.kind==='knockdown'){
                if(f.reaction.phase==='flight')f.stun=Math.max(f.stun,2);
                else if(f.reaction.phase==='down'&&f.reaction.t>=KNOCKDOWN_FRAMES){f.reaction.phase='rise';f.reaction.t=0;f.stun=GETUP_FRAMES+1;}
                else if(f.reaction.phase==='rise'&&f.reaction.t>=GETUP_FRAMES){f.reaction=null;f.stun=0;f.throwInvuln=Math.max(f.throwInvuln,12);}
            }else if(f.stun<=1)f.reaction=null;
        }
        if (f.flash > 0)
            f.flash--;
        if (f.stun > 0)
            f.stun--;
        if (f.blockstun > 0)
            f.blockstun--;
        if (f.dashLock > 0)
            f.dashLock--;
        if(s.throwState && (i===s.throwState.attacker || (s.throwState.phase==='hold'&&i===s.throwState.victim))){f.vx=0;f.vy=0;f.prev=f.input;continue;}
        if (grounded(f) && !f.move && !f.stun && !f.blockstun && !f.dash)
            f.facing = other.x >= f.x ? 1 : -1;
        // Once its three committed frames finish, crouch or an opposite
        // direction can brake a dash. Neutral release alone keeps the tap dash.
        const horizontal=((f.input&A.right)?1:0)-((f.input&A.left)?1:0);
        if(f.dash>0&&f.dash<=8&&((f.input&A.down)||(horizontal&&horizontal*f.vx<0))){
            f.dash=0;f.dashBuffer=0;
        }
        act(s, f);
        if (f.dash > 0) {
            f.dash--;
            f.vx *= .94;
        }
        else if (!f.stun && !f.blockstun) {
            const dir = s.mode === 'guard' && i === 1 ? 0 : ((f.input & A.right) ? 1 : 0) - ((f.input & A.left) ? 1 : 0);
            const speed = ROSTER[f.id].speed*(f.slow>0?.65:1);
            const approach = (target:number, amount:number) => f.vx += clamp(target - f.vx, -amount, amount);
            if (!grounded(f)) {
                // Preserve takeoff/dash momentum; attacks permit reduced steering, not braking.
                const steering=f.move?.22:.65;
                // Holding the travel direction must not brake a dash-jump more
                // than releasing it; opposite input still reverses gradually.
                if (dir && (dir*f.vx<=0 || Math.abs(f.vx)<speed)) approach(dir * speed, steering);
                else f.vx *= .995;
            } else if (!f.move) {
                const target = (f.input & A.down) ? 0 : dir * speed;
                const acceleration = target === 0 ? speed * .7 : target * f.vx < 0 ? speed * 1.45 : speed * .55;
                approach(target, acceleration);
            } else if(f.move.id==='special' && f.move.t>=6 && f.move.t<=COMBAT_STYLES[f.id].specialFrames.at(-1)!){f.vx=f.facing*Math.min(COMBAT_STYLES[f.id].advance??0,Math.max(0,(other.x-f.x)*f.facing-65));}
            else f.vx *= .7;
        }
        else
            // Airborne hit reactions retain their release momentum. Ground
            // friction must not stop a back throw before it crosses the holder.
            f.vx *= !grounded(f) && f.reaction?.phase==='flight' ? .985 : .84;
        const release=s.throwState;
        if(release?.phase==='release'&&release.direction==='back'&&release.victim===i){
            // Clear the holder's head before travelling behind their shoulder.
            if(release.t<BACK_THROW_LIFT_FRAMES)f.vx=0;
            else if(release.t===BACK_THROW_LIFT_FRAMES)f.vx=-release.facing*14;
        }
        const nextX=f.x+f.vx;
        f.x = clamp(nextX, fighterWall(f.id), WIDTH - fighterWall(f.id));
        if(nextX!==f.x){f.vx=0;f.dash=0;f.dashBuffer=0;}
        if (!grounded(f) || f.vy < 0) {
            f.vy += GRAVITY;
            f.y += f.vy;
            if (f.y >= FLOOR) {
                f.y = FLOOR;
                f.airJumps = 0;
                f.vy = 0;
                if (f.move && MOVES[f.move.id].air)
                    f.move = null;
                if(f.reaction?.kind==='knockdown'&&f.reaction.phase==='flight'){
                    f.reaction.phase='down';f.reaction.t=0;f.stun=KNOCKDOWN_FRAMES+GETUP_FRAMES+1;
                    f.vx*=.25;effect(s,f.x,FLOOR-8,'hit',ROSTER[f.id].color);
                }
                // Resolve a cross-up before executing a buffered grounded action.
                if(!f.move&&!f.stun&&!f.blockstun&&!f.dash)f.facing=other.x>=f.x?1:-1;
                // Consume buffered jump/attack on touchdown, not one input frame later.
                act(s, f);
            }
        }
        if (f.bufferLife > 0)
            f.bufferLife--;
        if (f.jumpBuffer > 0)
            f.jumpBuffer--;
        if(f.jumpDelay>0)f.jumpDelay--;
        if(f.dashBuffer>0)f.dashBuffer--;
        f.prev = f.input;
    }
    updateThrow(s);
    const [a, b] = s.fighters;
    // A falling/grounded body occupies more floor space than a standing pair.
    // Start separating just before touchdown so the landing does not bury the
    // victim under the standing fighter, especially after a wall back throw.
    const descendingBody=(f:Fighter)=>f.reaction?.kind==='knockdown'&&
        (f.reaction.phase==='down'||(f.reaction.phase==='flight'&&f.reaction.t>0&&f.vy>=0));
    const settling=descendingBody(a)||descendingBody(b);
    const pairGap=((descendingBody(a)&&a.y>FLOOR-40)||(descendingBody(b)&&b.y>FLOOR-40)?115:55)+bodySpread(a.id)+bodySpread(b.id);
    if (s.throwState?.phase!=='hold' && Math.abs(a.x - b.x) < pairGap && Math.abs(a.y - b.y) < 65) {
        // At a flush wall a back throw can land exactly on the holder's x.
        // Preserve the throw's side in that tie; do not send the victim back
        // to the front merely because player zero is processed first.
        const tieDirection=a.reaction?.kind==='knockdown'?-a.reaction.direction:b.reaction?.kind==='knockdown'?b.reaction.direction:1;
        const d = Math.abs(a.x-b.x)<.001 ? tieDirection : a.x<b.x?1:-1;
        // Expand the floor contact over several ticks; a full-width correction
        // on touchdown would jerk a stationary holder sideways in one frame.
        const overlap = Math.min((pairGap - Math.abs(a.x - b.x)) / 2,settling?8:Infinity);
        a.x = clamp(a.x - overlap * d, fighterWall(a.id), WIDTH - fighterWall(a.id));
        b.x = clamp(b.x + overlap * d, fighterWall(b.id), WIDTH - fighterWall(b.id));
    }
    // Collect active melee hits before applying them, so same-frame strikes can trade.
    const hits: {
        i: number;
        m: Move;
        id: MoveId;
    }[] = [];
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i], other = s.fighters[1 - i], attack = f.move;
        if (!attack || (s.throwState&&i===s.throwState.attacker))
            continue;
        attack.t++;
        const m = getMove(f, attack.id);
        // Chamber in the current jump arc. Diving at the button press could
        // land before a slower fighter's heavy attack ever became active.
        if (!grounded(f) && attack.aim === 'down' &&
            (attack.id === 'airHeavy' || attack.id === 'airMedium') && attack.t === m.startup) f.vy = Math.max(f.vy, 8);
        if (m.projectile && attack.t === m.startup) {
            const rawStyle=COMBAT_STYLES[f.id].projectile,spit=isHorizontalSpit(f.id)||rawStyle.horizontal===true;
            const style=spit?{...rawStyle,gravity:0,wave:0,bounces:0,ground:false}:rawStyle;
            const dx=attack.shotX??f.facing,dy=spit?0:attack.shotY??0,length=Math.hypot(dx,dy)||1,speed=style.speed;
            // Reviewed emitting points in the complete-body cast release cels.
            // Keep this immutable combat data; rendering never moves a hitbox.
            const origin=isCrouchingSpit(f)?CROUCH_SPIT_ORIGINS[f.id]!:rawStyle.origin??(f.id==='rivet'?{forward:44,height:109}:f.id==='vela'?{forward:59,height:103}:isPairedFighter(f.id)?{forward:bodySpread(f.id)+65,height:75}:{forward:34,height:95});
            s.projectiles.push({...style,owner:i,x:f.x+f.facing*origin.forward,y:style.ground&&dy===0?FLOOR-22:f.y-origin.height,vx:dx/length*speed,vy:dy/length*speed-(style.bounces&&dy===0&&!style.ground?3:0),life:style.beamFrames??100,damage:m.damage,age:0,
                ...(style.beamLength?{beamDirection:f.facing,beamHit:false}:{})});
        }
        let active = attack.t >= m.startup && attack.t < m.startup + m.active && !attack.hit;
        if (attack.id === 'special') {
            const wave = COMBAT_STYLES[f.id].specialFrames.indexOf(attack.t);
            active = wave >= 0;
            if (active) {
                attack.wave = wave;
            }
        }
        const ahead = (other.x - f.x) * f.facing-bodySpread(other.id);
        const crouched = (other.input & A.down) && grounded(other);
        const dy=other.y-f.y;
        const vertical = attack.id === 'special' ? true : attack.id === 'grab' ? !s.throwState && grounded(f) && grounded(other) && other.stun === 0 && other.blockstun === 0 && other.throwInvuln===0 : attack.aim==='upForward' ? Math.abs(dy+10+Math.max(0,ahead)*.65)<65 : attack.aim==='up' ? dy>-190&&dy<45 : attack.aim==='down'&&!grounded(f) ? dy>-25&&dy<165 : Math.abs(dy)<85;
        if (!endingKO && !isDown(other) && active && !m.projectile && ahead >= -22 && ahead < m.range && vertical && !(crouched && m.air && grounded(f))) {
            attack.hit = true;
            attack.connected = true;
            hits.push({ i, m, id: attack.id });
        }
        if (attack.t >= m.startup + m.active + m.recovery)
            f.move = null;
    }
    if(hits.length===2&&hits.every(h=>h.id==='grab')){
        // Simultaneous grabs break cleanly instead of favoring player index.
        for(const f of s.fighters){f.move=null;f.stun=10;f.vx=-f.facing*7;}
        s.freeze=Math.max(s.freeze,3);
    }else{
        // A same-frame damaging strike interrupts a grab before it can latch.
        for(const hit of hits.filter(h=>h.id!=='grab'))damage(s,hit.i,hit.m,hit.id);
        for(const hit of hits.filter(h=>h.id==='grab'))beginThrow(s,hit.i);
    }
    for (const p of s.projectiles) {
        p.age=(p.age??0)+1;
        if(p.beamLength){
            const owner=s.fighters[p.owner],origin=COMBAT_STYLES[owner.id].projectile.origin!;
            // A focused beam follows the forehead during the committed cast.
            // Hits, cancels and KO break focus immediately; there is no lingering hitbox.
            if(owner.move?.id!=='bolt'||owner.stun||owner.blockstun||owner.hp<=0){p.life=0;continue;}
            p.x=owner.x+(p.beamDirection??owner.facing)*origin.forward;p.y=owner.y-origin.height;
        }
        if(p.returnAt===p.age)p.vx*=-1;
        if(p.accel)p.vx+=Math.sign(p.vx)*p.accel;
        p.vy+=p.gravity??0;
        p.x += p.vx;
        p.y += p.vy+(p.wave?Math.sin(p.age*.3)*p.wave:0);
        if((p.bounces??0)>0&&p.y>=FLOOR-20){p.y=FLOOR-20;p.vy=-Math.max(3,Math.abs(p.vy)*.75);p.bounces!--;}
        else if(p.ground&&p.y>FLOOR-20){p.y=FLOOR-20;p.vy=0;}
        p.life--;
        const target = s.fighters[1 - p.owner];
        const crouching = (target.input & A.down) && grounded(target);
        // Eye beams meet the standing head; crouching still ducks the high shot.
        const crouchedSpitTarget=crouching && isHorizontalSpit(s.fighters[p.owner].id);
        const targetHeight=crouchedSpitTarget?60:crouching?30:(p.shape==='eyeLaser'||p.beamLength)?135:65;
        const targetRadius=crouchedSpitTarget?32:crouching?25:(p.shape==='eyeLaser'||p.beamLength)?40:50;
        const ahead=(target.x-p.x)*(p.beamDirection??1),radius=34+bodySpread(target.id);
        const horizontalContact=p.beamLength
            ? !p.beamHit&&ahead+radius>=0&&ahead-radius<=p.beamLength
            : Math.abs(p.x-target.x)<(p.shape==='retain'?53:34)+bodySpread(target.id);
        if (!endingKO && !isDown(target) && horizontalContact && Math.abs(p.y - (target.y - targetHeight)) < targetRadius) {
            damage(s, p.owner, { ...getMove(s.fighters[p.owner],'bolt'), damage: p.damage }, 'bolt', true);
            if(p.beamLength)p.beamHit=true;else p.life=0;
        }
    }
    s.projectiles = s.projectiles.filter(p => p.life > 0 && p.x > -40 && p.x < WIDTH + 40 && p.y > -120 && p.y < FLOOR + 25);
    for (let i = 0; i < 2; i++) {
        const target = s.fighters[1 - i];
        if (target.stun === 0)
            finishCombo(s, s.fighters[i]);
    }
    const koFalling=s.fighters.some(f=>f.hp<=0&&f.reaction?.kind==='knockdown'&&f.reaction.phase==='flight'&&!grounded(f));
    if ((a.hp <= 0 || b.hp <= 0) && !koFalling) {
        if(s.throwState?.phase==='hold'){
            const held=s.fighters[s.throwState.victim];
            held.y=FLOOR;held.vx=0;held.vy=0;held.stun=0;held.reaction=null;
        }
        s.throwState=null;
        for(const f of s.fighters)if(f.move?.id==='grab')f.move=null;
        finishCombo(s, a);
        finishCombo(s, b);
        s.winner = a.hp === b.hp ? 2 : a.hp > b.hp ? 0 : 1;
        s.throwState=null;
    }
    if(s.godMode){a.hp=1000;a.pips=3;}
    if (s.mode !== 'cpu' && b.stun === 0 && a.combo === 0 && s.frame % 90 === 0)
        b.hp = 1000;
}
