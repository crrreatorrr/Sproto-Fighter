// Fighter roster, kits, throw grips, paired-body spacing and other generated per-fighter data.
// Art installers under art/ insert and replace marked blocks in this file.
import characterActions from './data/character-actions.json';
import signatureProjectiles from './data/signature-projectiles.json';
import { FLOOR, WALL } from './constants';
import { Fighter } from './types';
import { BalancedKit, buildBalancedKit } from './balance';
/* SPROTOS TYPE BEGIN */
export type SprotoFighterId = 'sproto102' | 'sproto215' | 'sproto282' | 'sproto313' | 'sproto651' | 'sproto704' | 'sproto763' | 'sproto818' | 'sproto831' | 'sproto832' | 'sproto834' | 'sproto837' | 'sproto865' | 'sproto943' | 'sproto999' | 'sproto1011' | 'sproto1093' | 'sproto1187' | 'sproto1335' | 'sproto1345' | 'sproto1414' | 'sproto1477' | 'sproto1499' | 'sproto1601' | 'sproto1625' | 'sproto1668' | 'sproto1815' | 'sproto1870' | 'sproto2010' | 'sproto2075' | 'sproto2101' | 'sproto2177' | 'sproto2210' | 'sproto2322' | 'sproto2344' | 'sproto2381' | 'sproto2531' | 'sproto2569' | 'sproto2616' | 'sproto2789' | 'sproto2884' | 'sproto3106' | 'sproto3152' | 'sproto3181' | 'sproto3215' | 'sproto3224' | 'sproto3235' | 'vaudream' | 'uncmasterflex' | 'gryph' | 'vitaliketh' | 'urmometh' | 'chaton' | 'loadthebags' | 'sisma' | 'captainhowdy' | 'sprotosales' | 'sprog' | 'jasper' | 'aaron' | 'brainsprot' | 'godmod3d' | 'sober' | 'nosmileclown' | 'olnoname' | 'greatcharly';
/* SPROTOS TYPE END */
export type FighterId = 'rivet' | 'vela' | 'bront' | 'zephyr' | 'mox' | 'rune' | 'guest07' | 'guest08' | 'guest09' | 'guest10' | 'guest11' | 'guest12' | 'guest13' | 'guest14' | 'dumpstar' | 'crapto' | 'vamp' | 'alpha777' | 'mandela' | 'bigswole' | 'nate' | 'duo' | SprotoFighterId | 'nick' | 'captain' | 'highsproto' | 'erik' | 'bimba' | 'gpm' | 'leviosa' | 'lifeisameme' | 'thxobama' | 'rlarsson' | 'blorfo' | 'michael' | 'freshprince' | 'mlk' | 'satoshi' | 'xalt' | 'potocaicai' | 'reverend' | 'zepump' | 'sprotopotamus' | 'willuminati' | 'pirate' | 'prim' | 'benjamin' | 'maxbiggums' | 'xav' | 'emix' | 'peterpan' | 'anni' | 'pinewaffle' | 'rainman' | 'wifebeater' | 'fiatfudder' | 'moonshiller' | 'godether' | 'aleksander' | 'cyberviber' | 'realityarchitect' | 'mrgoldrobe' | 'solanadelray' | 'sproteth' | 'danocrypto' | 'buddhashadow' | 'theo' | "nomis" | "clobrwn" | "thesprotowholivedeth" | "sirbitcoin" | "saburdo" | "hermionemichelleamyrose" | "pongohpos10i" | "julian" | 'stoto' | 'herbpowell' | 'sirdidit' | 'ceo' | 'ciphersproto' | 'sprotocius' | 'rmacpdx' | 'azkarah' | 'mrhorsemeat' | 'wyrmblvnt' | 'aktree' | 'fplgremlin' | 'chrisfowler' | 'spruto' | 'ghostsprotocol' | 'tdeth' | 'vicoo' | 'chonky' | 'degenpress' | 'giavannykitchens' | 'seph0x' | 'rektina' | 'twinnyneutron' | 'melo' | 'kern' | 'bs9090eth' | 'renzo' | 'micsash' | 'davidcd' | 'samixsproto' | 'wireitwell' | 'cryptoboy' | 'osho' | 'pr0lificeth' | 'bidnehhh' | 'jayquant' | 'infinitysplitter' | 'hdizzy' | 'cryptoviking420' | 'sweatpantstrust' | 'spunow' | 'sprotomichaelsaylor' | 'zippy' | 'lilgoldied' | 'bitcoind1rk' | 'felixsprotoarc' | 'onememeaday' | 'zudi' | 'forchaneth' | 'frej' | 'crippledlover' | 'pilgrim' | 'usedtowels' | 'drzmoody' | 'cam' | 'croy' | 'stonkyleg69' | 'janitor' | 'indiapolice' | 'veryseriousinvestor' | 'agentsproto' | 'glow' | 'tingsmol' | 'johnson' | 'loqi' | 'marfrog' | 'familywagon' | 'otorps' | 'berserk' | 'crumpleii' | 'feistyboi' | 'isaac' | 'mikemike' | 'godsson' | 'tradertimmy' | 'durlan' | 'dollarbitcoin' | 'lowernipple' | 'obamasega420' | 'bigal' | 'cryptorizzler' | 'cryptomonger' | 'teahupoo' | 'homosproto' | 'pars' | 'accidentallyrich' | 'np' | 'slabcorn' | 'sprotopia' | 'lestrange' | 'cryptobartender' | 'razz' | 'laserbach' | 'freedfrida' | 'contresens' | 'sprotomidnightfx' | 'mildtacos' | 'sprotosurvivor' | 'd86' | 'cantankerous' | 'autistophrenicsprotagonist' | 'sprotolg' | 'kerrieanne' | 'yusuf' | 'bobdobbs' | 'gluttony' | 'slakesly' | 'jameskaminski' | '86gwei' | 'sidelinereferee' | 'zebracorn' | 'corn' | 'zakarum' | 'bgbadger';
export const PLAYABLE_FIGHTERS = ['rivet', 'vela', 'bront', 'zephyr', 'mox', 'rune', 'guest07', 'guest08', 'guest09', 'guest10', 'guest11', 'guest12', 'guest13', 'guest14', 'dumpstar', 'crapto', 'vamp', 'alpha777', 'mandela', 'bigswole', 'nate', 'duo', 'nick', 'captain', 'highsproto', 'erik', 'bimba', 'gpm', 'leviosa', 'lifeisameme', 'thxobama', 'rlarsson', 'blorfo', 'michael', 'freshprince', 'mlk', 'sproto102', 'sproto215', 'sproto282', 'sproto313', 'sproto651', 'sproto704', 'sproto763', 'sproto818', 'sproto831', 'sproto832', 'sproto834', 'sproto837', 'sproto865', 'sproto943', 'sproto999', 'sproto1011', 'sproto1093', 'sproto1187', 'sproto1335', 'sproto1345', 'sproto1414', 'sproto1477', 'sproto1499', 'sproto1601', 'sproto1625', 'sproto1668', 'sproto1815', 'sproto1870', 'sproto2010', 'sproto2075', 'sproto2101', 'sproto2177', 'sproto2210', 'sproto2322', 'sproto2344', 'sproto2381', 'sproto2531', 'sproto2569', 'sproto2616', 'sproto2789', 'sproto2884', 'sproto3106', 'sproto3152', 'sproto3181', 'sproto3215', 'sproto3224', 'sproto3235', 'vaudream', 'uncmasterflex', 'gryph', 'vitaliketh', 'urmometh', 'chaton', 'loadthebags', 'sisma', 'captainhowdy', 'sprotosales', 'sprog', 'jasper', 'aaron', 'brainsprot', 'godmod3d', 'sober', 'nosmileclown', 'olnoname', 'greatcharly', 'satoshi', 'xalt', 'potocaicai', 'reverend', 'zepump', 'sprotopotamus', 'willuminati', 'pirate', 'prim', 'benjamin', 'maxbiggums', 'xav', 'emix', 'peterpan', 'anni', 'pinewaffle', 'rainman', 'wifebeater', 'fiatfudder', 'moonshiller', 'godether', 'aleksander', 'cyberviber', 'realityarchitect', 'mrgoldrobe', 'solanadelray', 'sproteth', 'danocrypto', 'buddhashadow', 'theo', "nomis", "clobrwn", "thesprotowholivedeth", "sirbitcoin", "saburdo", "hermionemichelleamyrose", "pongohpos10i", "julian", 'stoto', 'herbpowell', 'sirdidit', 'ceo', 'ciphersproto', 'sprotocius', 'rmacpdx', 'azkarah', 'mrhorsemeat', 'wyrmblvnt', 'aktree', 'fplgremlin', 'chrisfowler', 'spruto', 'ghostsprotocol', 'tdeth', 'vicoo', 'chonky', 'degenpress', 'giavannykitchens', 'seph0x', 'rektina', 'twinnyneutron', 'melo', 'kern', 'bs9090eth', 'renzo', 'micsash', 'davidcd', 'samixsproto', 'wireitwell', 'cryptoboy', 'osho', 'pr0lificeth', 'bidnehhh', 'jayquant', 'infinitysplitter', 'hdizzy', 'cryptoviking420', 'sweatpantstrust', 'spunow', 'sprotomichaelsaylor', 'zippy', 'lilgoldied', 'bitcoind1rk', 'felixsprotoarc', 'onememeaday', 'zudi', 'forchaneth', 'frej', 'crippledlover', 'pilgrim', 'usedtowels', 'drzmoody', 'cam', 'croy', 'stonkyleg69', 'janitor', 'indiapolice', 'veryseriousinvestor', 'agentsproto', 'glow', 'tingsmol', 'johnson', 'loqi', 'marfrog', 'familywagon', 'otorps', 'berserk', 'crumpleii', 'feistyboi', 'isaac', 'mikemike', 'godsson', 'tradertimmy', 'durlan', 'dollarbitcoin', 'lowernipple', 'obamasega420', 'bigal', 'cryptorizzler', 'cryptomonger', 'teahupoo', 'homosproto', 'pars', 'accidentallyrich', 'np', 'slabcorn', 'sprotopia', 'lestrange', 'cryptobartender', 'razz', 'laserbach', 'freedfrida', 'contresens', 'sprotomidnightfx', 'mildtacos', 'sprotosurvivor', 'd86', 'cantankerous', 'autistophrenicsprotagonist', 'sprotolg', 'kerrieanne', 'yusuf', 'bobdobbs', 'gluttony', 'slakesly', 'jameskaminski', '86gwei', 'sidelinereferee', 'zebracorn', 'corn', 'zakarum', 'bgbadger'] as const;
export type PlayableFighterId = typeof PLAYABLE_FIGHTERS[number];
/** New reference additions are available in free play outside the fixed campaign. */
export const isFreePlayAddition = (id:FighterId) => (['reverend','zepump','sprotopotamus','willuminati','pirate','prim','benjamin','maxbiggums','xav','emix','peterpan','anni','pinewaffle','rainman','wifebeater','fiatfudder','moonshiller','godether','aleksander','cyberviber','realityarchitect','mrgoldrobe','solanadelray','sproteth','danocrypto', 'buddhashadow'] as readonly FighterId[]).includes(id);
/** 'cpu', 'dummy' and 'guard' put the built-in CPU in slot 1; 'versus' is two human players. */
export type Mode = 'cpu' | 'dummy' | 'guard' | 'versus';
/** Practice modes: slot 1 is a training dummy whose health refills. */
export const isPracticeMode = (mode: Mode) => mode === 'dummy' || mode === 'guard';
export type MoveId = 'light' | 'medium' | 'heavy' | 'low' | 'sweep' | 'airLight' | 'airMedium' | 'airHeavy' | 'launcher' | 'bolt' | 'grab' | 'special';
export interface Move {
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
    blockstun?: number;
    blockPush?: number;
    chip?: number;
}
export const MOVES: Record<MoveId, Move> = {
    light: { startup: 5, active: 4, recovery: 11, damage: 38, range: 82, stun: 23, push: 5, rank: 1 },
    medium: { startup: 7, active: 5, recovery: 14, damage: 60, range: 112, stun: 28, push: 8, rank: 2 },
    heavy: { startup: 11, active: 6, recovery: 23, damage: 95, range: 135, stun: 32, push: 17, rank: 4, finisher: true },
    low: { startup: 5, active: 5, recovery: 14, damage: 34, range: 95, stun: 24, push: 3, rank: 1, low: true },
    sweep: { startup: 10, active: 6, recovery: 24, damage: 85, range: 135, stun: 32, push: 12, rank: 4, finisher: true, low: true },
    airLight: { startup: 4, active: 6, recovery: 11, damage: 36, range: 86, stun: 26, push: 3, rank: 1, air: true },
    airMedium: { startup: 6, active: 6, recovery: 14, damage: 58, range: 113, stun: 28, push: 5, rank: 2, air: true },
    airHeavy: { startup: 8, active: 7, recovery: 21, damage: 92, range: 139, stun: 33, push: 14, rank: 4, air: true, finisher: true },
    launcher: { startup: 8, active: 6, recovery: 23, damage: 64, range: 102, stun: 45, push: 3, rank: 3, launch: 16 },
    bolt: { startup: 16, active: 2, recovery: 27, damage: 55, range: 0, stun: 25, push: 7, rank: 3, projectile: true },
    grab: { startup: 6, active: 3, recovery: 30, damage: 90, range: 72, stun: 35, push: 16, rank: 5, finisher: true },
    special: { startup: 12, active: 40, recovery: 30, damage: 90, range: 680, stun: 28, push: 4, rank: 6 }
};
export const ROSTER: Record<FighterId, {
    name: string;
    color: string;
    dark: string;
    speed: number;
    jump: number;
    partner: FighterId;
    special: string;
    role: string;
    description: string;
}> = {
/* NOV03 LATE ROSTER BEGIN */
    "sprotopia": {"name": "Sprotopia", "color": "#ff9129", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTOPIA RELAY", "role": "ORANGE AURA", "description": "Orange aura surrounds Sprotopia during each mouth-fired ranged attack."},
    "lestrange": {"name": "LeStrange", "color": "#fae341", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "LESTRANGE RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "cryptobartender": {"name": "CryptoBARTENDER", "color": "#ff7d3a", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "CRYPTOBARTENDER RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "razz": {"name": "Razz", "color": "#f8d747", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "RAZZ RELAY", "role": "COUNTER", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "laserbach": {"name": "Laserbach", "color": "#ff412f", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "LASERBACH RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "freedfrida": {"name": "Freed Frida", "color": "#f6dc3d", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "FREED FRIDA RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "contresens": {"name": "Contre-Sens", "color": "#ffd338", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "CONTRE-SENS RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "sprotomidnightfx": {"name": "SprotoMidnightFX", "color": "#ffda3c", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTOMIDNIGHTFX RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "mildtacos": {"name": "mildtacos", "color": "#ff6749", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "MILDTACOS RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "sprotosurvivor": {"name": "Sproto Survivor", "color": "#e9d044", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO SURVIVOR RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "d86": {"name": "D86", "color": "#ff6b3e", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "D86 RELAY", "role": "DOUBLE SHOT", "description": "Two synchronized shots fire from D86\u2019s lower nipples."},
    "cantankerous": {"name": "Can Tankerous", "color": "#ffd447", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "CAN TANKEROUS RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "autistophrenicsprotagonist": {"name": "Autistophrenic Sprotagonist", "color": "#ff9b39", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "AUTISTOPHRENIC SPROTAGONIST RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "sprotolg": {"name": "Sproto LG", "color": "#ffe33c", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO LG RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "kerrieanne": {"name": "Kerrie Anne", "color": "#fce44e", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "KERRIE ANNE RELAY", "role": "COUNTER", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "yusuf": {"name": "Yusuf", "color": "#f0b945", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "YUSUF RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "bobdobbs": {"name": "Bob Dobbs", "color": "#f6dc51", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "BOB DOBBS RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "gluttony": {"name": "GLUTTONY", "color": "#ffdc30", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "GLUTTONY RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "slakesly": {"name": "Slakesly", "color": "#a7d842", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SLAKESLY RELAY", "role": "COUNTER", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "jameskaminski": {"name": "James Kaminski", "color": "#ff4f45", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "JAMES KAMINSKI RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "86gwei": {"name": "86.gwei", "color": "#ffe039", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "86.GWEI RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "sidelinereferee": {"name": "The Sideline Referee", "color": "#fcea53", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "THE SIDELINE REFEREE RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "zebracorn": {"name": "Zebracorn", "color": "#ffe64b", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "ZEBRACORN RELAY", "role": "COUNTER", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "corn": {"name": "CORN", "color": "#ffc934", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "CORN RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "zakarum": {"name": "Zakarum", "color": "#ffd43c", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "ZAKARUM RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "bgbadger": {"name": "BGBadger", "color": "#ff5041", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "BGBADGER RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
/* NOV03 LATE ROSTER END */
/* FINAL INTAKE ROSTER BEGIN */
    tradertimmy: {"name":"TraderTimmy","color":"#ffde38","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"MARKET SURGE","role":"COUNTER","description":"Guarded footwork, a straight mouth shot and a four-contact Market Surge."},
    durlan: {"name":"Durlan","color":"#ff575a","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"REDLINE RUSH","role":"FOOTWORK","description":"Guarded footwork, a straight mouth shot and a four-contact Redline Rush."},
    dollarbitcoin: {"name":"$Bitcoin","color":"#5cb3ff","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"GOLD STANDARD","role":"BRAWLER","description":"Guarded footwork, a straight mouth shot and a four-contact Gold Standard."},
    lowernipple: {"name":"SPROTO","color":"#ffde38","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"DOUBLE SIGNAL","role":"TWIN EMITTER","description":"Twin lower-torso shots and a four-contact Double Signal."},
    obamasega420: {"name":"YES_WE_CAN_OBAMASEGA_420","color":"#ff575a","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"YES WE CAN","role":"FOOTWORK","description":"Guarded footwork, a straight mouth shot and a four-contact Yes We Can."},
    bigal: {"name":"Big al","color":"#5cb3ff","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"BIG AL BARRAGE","role":"BRAWLER","description":"Guarded footwork, a straight mouth shot and a four-contact Big Al Barrage."},
    cryptorizzler: {"name":"CryptoRizzler","color":"#ffde38","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"CHARM OFFENSIVE","role":"COUNTER","description":"Guarded footwork, a straight mouth shot and a four-contact Charm Offensive."},
    cryptomonger: {"name":"Crypto Monger","color":"#ff575a","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"MONGER MOMENTUM","role":"FOOTWORK","description":"Guarded footwork, a straight mouth shot and a four-contact Monger Momentum."},
    teahupoo: {"name":"0xTeahupoo","color":"#ffde38","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"REEF BREAK","role":"COUNTER","description":"Guarded footwork, a straight mouth shot and a four-contact Reef Break."},
    homosproto: {"name":"I Am Homo Sproto","color":"#ff575a","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"SPIRAL SALUTE","role":"FOOTWORK","description":"Guarded footwork, a straight mouth shot and a four-contact Spiral Salute."},
    pars: {"name":"PARS SPRO TOTO","color":"#5cb3ff","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"PARS PARADE","role":"BRAWLER","description":"Guarded footwork, a straight mouth shot and a four-contact Pars Parade."},
    accidentallyrich: {"name":"AccidentallyRich.eth","color":"#ffde38","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"LUCKY BREAK","role":"COUNTER","description":"Guarded footwork, a straight mouth shot and a four-contact Lucky Break."},
    np: {"name":"NP","color":"#ff575a","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"BIG GRIN","role":"FOOTWORK","description":"Guarded footwork, a straight mouth shot and a four-contact Big Grin."},
    slabcorn: {"name":"Slabcorn","color":"#5cb3ff","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"SLAB SHOCK","role":"BRAWLER","description":"Guarded footwork, a straight mouth shot and a four-contact Slab Shock."},
/* FINAL INTAKE ROSTER END */
/* NAMED INTAKE NOV03 ROSTER BEGIN */
    frej: {"name":"FREJ","color":"#ffde38","dark":"#253783","speed":5.35,"jump":15.2,"partner":"rivet","special":"SCARLET STEP","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Scarlet Step."},
    crippledlover: {"name":"Crippled lover","color":"#ff575a","dark":"#253783","speed":5.449999999999999,"jump":15.399999999999999,"partner":"rivet","special":"SPIKE RUSH","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Spike Rush."},
    pilgrim: {"name":"pilgrim","color":"#5cb3ff","dark":"#253783","speed":5.55,"jump":15.6,"partner":"rivet","special":"PILGRIM PARADE","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact Pilgrim Parade."},
    usedtowels: {"name":"usedtowels","color":"#ffde38","dark":"#253783","speed":5.6499999999999995,"jump":15.799999999999999,"partner":"rivet","special":"SUNBURST SPIN","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Sunburst Spin."},
    drzmoody: {"name":"DrZMoody","color":"#ff575a","dark":"#253783","speed":5.75,"jump":15.2,"partner":"rivet","special":"MOODY COUNTER","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Moody Counter."},
    cam: {"name":"Cam","color":"#5cb3ff","dark":"#253783","speed":5.35,"jump":15.399999999999999,"partner":"rivet","special":"CAT SCRAMBLE","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact Cat Scramble."},
    croy: {"name":"Croy","color":"#ffde38","dark":"#253783","speed":5.449999999999999,"jump":15.6,"partner":"rivet","special":"FIVE EYE FEINT","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Five Eye Feint."},
    stonkyleg69: {"name":"StonkyLeg69","color":"#ff575a","dark":"#253783","speed":5.55,"jump":15.799999999999999,"partner":"rivet","special":"STONKY STAMPEDE","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Stonky Stampede."},
    janitor: {"name":"Janitor","color":"#5cb3ff","dark":"#253783","speed":5.6499999999999995,"jump":15.2,"partner":"rivet","special":"CLEAN SWEEP","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact Clean Sweep."},
    indiapolice: {"name":"IndiaPolice","color":"#ffde38","dark":"#253783","speed":5.75,"jump":15.399999999999999,"partner":"rivet","special":"TRIPLE SIGNAL","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Triple Signal."},
    veryseriousinvestor: {"name":"veryseriousinvestor","color":"#ff575a","dark":"#253783","speed":5.35,"jump":15.6,"partner":"rivet","special":"MARKET BREAKOUT","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Market Breakout."},
    agentsproto: {"name":"Agent SPROTO","color":"#5cb3ff","dark":"#253783","speed":5.449999999999999,"jump":15.799999999999999,"partner":"rivet","special":"AGENT STRIKE","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact Agent Strike."},
    glow: {"name":"glow","color":"#ffde38","dark":"#253783","speed":5.55,"jump":15.2,"partner":"rivet","special":"PRISM FLARE","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Prism Flare."},
    tingsmol: {"name":"tingsmol","color":"#ff575a","dark":"#253783","speed":5.6499999999999995,"jump":15.399999999999999,"partner":"rivet","special":"SMOL SURGE","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Smol Surge."},
    johnson: {"name":"Johnson","color":"#5cb3ff","dark":"#253783","speed":5.75,"jump":15.6,"partner":"rivet","special":"ONE EYE DRIVE","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact One Eye Drive."},
    loqi: {"name":"loqi","color":"#ffde38","dark":"#253783","speed":5.35,"jump":15.799999999999999,"partner":"rivet","special":"HOOK AND FLASH","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Hook And Flash."},
    marfrog: {"name":"MarFrog","color":"#ff575a","dark":"#253783","speed":5.449999999999999,"jump":15.2,"partner":"rivet","special":"GOLDEN TRIFECTA","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Golden Trifecta."},
    familywagon: {"name":"familywagon.eth","color":"#5cb3ff","dark":"#253783","speed":5.55,"jump":15.399999999999999,"partner":"rivet","special":"WAGON RUSH","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact Wagon Rush."},
    otorps: {"name":"Otorps","color":"#ffde38","dark":"#253783","speed":5.6499999999999995,"jump":15.6,"partner":"rivet","special":"REVERSE SWERVE","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Reverse Swerve."},
    berserk: {"name":"𝔅𝔢𝔯𝔰𝔢𝔯𝔎","color":"#ff575a","dark":"#253783","speed":5.75,"jump":15.799999999999999,"partner":"rivet","special":"DOUBLE GRIN","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Double Grin."},
    crumpleii: {"name":"c𝘙𝘶𝘮ple 𝐈𝐈","color":"#5cb3ff","dark":"#253783","speed":5.35,"jump":15.2,"partner":"rivet","special":"CRUMPLE ZONE","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact Crumple Zone."},
    feistyboi: {"name":"Feisty boi","color":"#ffde38","dark":"#253783","speed":5.449999999999999,"jump":15.399999999999999,"partner":"rivet","special":"FEISTY FINALE","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Feisty Finale."},
    isaac: {"name":"Isaac","color":"#ff575a","dark":"#253783","speed":5.55,"jump":15.6,"partner":"rivet","special":"BLUE BARRAGE","role":"FOOTWORK","description":"Guarded footwork, a palm cast and the four-contact Blue Barrage."},
    mikemike: {"name":"Mike Mike","color":"#5cb3ff","dark":"#253783","speed":5.6499999999999995,"jump":15.799999999999999,"partner":"rivet","special":"EMERALD DRIVE","role":"BRAWLER","description":"Guarded footwork, a palm cast and the four-contact Emerald Drive."},
    godsson: {"name":"GodsSon","color":"#ffde38","dark":"#253783","speed":5.75,"jump":15.2,"partner":"rivet","special":"GOLDEN FLEX","role":"COUNTER","description":"Guarded footwork, a palm cast and the four-contact Golden Flex."},
/* NAMED INTAKE NOV03 ROSTER END */
/* NOV03 NINE ROSTER BEGIN */
    "nomis": {"name": "nomis", "color": "#60aaff", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "NOMIS RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "clobrwn": {"name": "CloBrwn", "color": "#ee5151", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "CLOBRWN RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "thesprotowholivedeth": {"name": "thesprotowholived.eth", "color": "#ffdf50", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "THESPROTOWHOLIVED.ETH RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "sirbitcoin": {"name": "sir bitcoin", "color": "#a995ff", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SIR BITCOIN RELAY", "role": "COUNTER", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "saburdo": {"name": "saburdo", "color": "#60aaff", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SABURDO RELAY", "role": "PRESSURE", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "hermionemichelleamyrose": {"name": "HermioneMichelleAmyRose", "color": "#ee5151", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "HERMIONEMICHELLEAMYROSE RELAY", "role": "FOOTWORK", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "pongohpos10i": {"name": "Pongo HPOS10I", "color": "#ffdf50", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "PONGO HPOS10I RELAY", "role": "ZONING", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
    "julian": {"name": "JULIAN", "color": "#a995ff", "dark": "#24386d", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "JULIAN RELAY", "role": "COUNTER", "description": "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay."},
/* NOV03 NINE ROSTER END */
    rivet: { name: 'Golden Sproto', color: '#ffda55', dark: '#98702e', speed: 5.5, jump: 15.8, partner: 'vela', special: 'CROSSCURRENT', role: 'RUSHDOWN', description: 'Close the gap with fast chains, a quick dash, and an explosive launcher.' },
/* NICK ROSTER BEGIN */
nick:{name:'Nick',color:'#3158ee',dark:'#172763',speed:5.5,jump:15.8,partner:'rivet',special:'BARE KNUCKLE RUSH',role:'BARE HANDS',description:'Uncovered fingered hands, quick palm strikes and a four-contact rush.'},
/* NICK ROSTER END */
/* HIGHSPROTO ROSTER BEGIN */
highsproto:{name:'High Sproto',color:'#79a9e8',dark:'#243458',speed:5.5,jump:15.8,partner:'rivet',special:'SMOKE SIGNAL',role:'SMOKE SHOT',description:'Finger-flick joint shots, relaxed footwork and a four-contact Smoke Signal.'},
/* HIGHSPROTO ROSTER END */
/* ERIK ROSTER BEGIN */
erik:{name:'Erik Stevens',color:'#f0c94d',dark:'#192944',speed:5.5,jump:15.8,"partner":"sproto1601",special:'EXECUTIVE FINISH',role:'FORMAL',description:'Tailored navy suit, yellow dress shirt and red tie; composed strikes and a four-contact finish.'},
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
captain:{name:'Yelnacio Globulous',color:'#ef473b',dark:'#243783',speed:5.5,jump:15.8,partner:'rivet',special:'SOLAR SALVO',role:'LASER CAPTAIN',description:'Eye-fired laser bolts and a flowing yellow cape, sturdy kicks and a four-contact Solar Salvo.'},
/* CAPTAIN ROSTER END */
/* SPROTOS ROSTER BEGIN */
sproto102: {"name": "Collector", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 102", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto215: {"name": "Muzzle", "color": "#b59aff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 215", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto282: {"name": "hly3", "color": "#ff655e", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 282", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto313: {"name": "duality", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 313", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto651: {"name": "Sproto Picasso", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 651", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto704: {"name": "bill and John", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 704", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto763: {"name": "Snarf", "color": "#ff655e", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 763", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto818: {"name": "lab experiment", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 818", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto831: {"name": "The Villain", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 831", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto832: {"name": "Frog and Tonic", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 832", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto834: {"name": "Sproto #834", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 834", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto837: {"name": "Bitcoin Robin Williams", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 837", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto865: {"name": "Artdude", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 865", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto943: {"name": "Artchick", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 943", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto999: {"name": "999", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 999", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1011: {"name": "Sir Sproto", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "STAFF TEMPEST 1011", "role": "STAFF", "description": "Full-length staff thrusts, overhead swings, low sweeps and aerial strikes."},
sproto1093: {"name": "GodsSon", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 1093", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1187: {"name": "Dad", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 1187", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1335: {"name": "Crackhead", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1335", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1345: {"name": "whale head", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 1345", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1414: {"name": "Chiller", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 1414", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1477: {"name": "Stalker", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 1477", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1499: {"name": "Dancing Partners", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 1499", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto1601: {"name": "888", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 1601", "role": "THROWER", "description": "Hand-thrown yellow 8s, a heavy kick and a four-contact ranged relay."},
sproto1625: {"name": "schizos", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 1625", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto1668: {"name": "Goldie", "color": "#ffe168", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 1668", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto1815: {"name": "Jessica", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "HALBERD TEMPEST 1815", "role": "HALBERD", "description": "Hooked halberd thrusts, overhead swings, low sweeps and aerial strikes."},
sproto1870: {"name": "Error 333", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "FLOATING SURGE 1870", "role": "HOVER", "description": "One legless floating Sproto with hovering glides and head rams."},
sproto2010: {"name": "Tartarian Soldiers", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2010", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2075: {"name": "Twinners", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2075", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2101: {"name": "The Jay", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 2101", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto2177: {"name": "Spronic", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2177", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto2210: {"name": "Suburban Couple", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2210", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2322: {"name": "Whitey", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 2322", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto2344: {"name": "Sproto #2344", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 2344", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto2381: {"name": "𝒮𝗉𝗋𝗈𝗋𝖺𝖾𝗆𝗈𝗇", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 2381", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto2531: {"name": "Sproto Gremlin", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 2531", "role": "SPITTER", "description": "Sharp white eyes and red gloves; mouth-spit releases a complete miniature Sproto."},
sproto2569: {"name": "Clownie", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 2569", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto2616: {"name": "sun god", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "STAFF TEMPEST 2616", "role": "STAFF", "description": "Full-length staff strikes and a radiant sun projectile launched from the staff tip."},
sproto2789: {"name": "retainer", "color": "#b59aff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "STAFF TEMPEST 2789", "role": "STAFF", "description": "Full-length staff thrusts, overhead swings, low sweeps and aerial strikes."},
sproto2884: {"name": "Sprite", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "vaudream", "special": "SPROTO BURST 2884", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto3106: {"name": "Bitcoin Sheriff", "color": "#ff655e", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3181", "special": "SPROTO BURST 3106", "role": "THROWER", "description": "Throws the original yellow B with its tilted serif shape, red accents and black outline."},
sproto3152: {"name": "Pissing Sproto", "color": "#b59aff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto2322", "special": "GOLDEN STREAM", "role": "STREAM", "description": "A comic yellow stream fires from the covered pelvis, with a four-pulse Golden Stream finish."},
sproto3181: {"name": "10 Inu", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 3181", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto3215: {"name": "Captain Green", "color": "#ffe168", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "sproto3152", "special": "SPROTO BURST 3215", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sproto3224: {"name": "Comedy Club", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 3224", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sproto3235: {"name": "Cyclops and Joey", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION 3235", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
vaudream: {"name": "\u142f\u156c\u144c\u15de\u1587\u156e\u15cb\u156c", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "DREAM SURGE", "role": "HOVER", "description": "Legless floating machine: hover glides, chassis rams and screen casts."},
uncmasterflex: {"name": "UNC Master Flex", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto215", "special": "SPROTO BURST uncmasterflex", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
gryph: {"name": "gryph", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION gryph", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
vitaliketh: {"name": "vitalik.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto818", "special": "SPROTO BURST vitaliketh", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
urmometh: {"name": "urmom.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto1414", "special": "SPROTO BURST urmometh", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
chaton: {"name": "Chaton von Sproto", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST chaton", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
loadthebags: {"name": "LoadTheBags", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto313", "special": "MIC CHECK", "role": "MC", "description": "Microphone jabs, overhead mic swings and vocal casts."},
sisma: {"name": "SISMA", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "RETAIN SCREAM", "role": "SHOUT", "description": "RETAIN scream sends readable words horizontally across the arena."},
captainhowdy: {"name": "Captain Howdy", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST captainhowdy", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sprotosales: {"name": "Sproto Sales", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST sprotosales", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
sprog: {"name": "Sprog", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST sprog", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
jasper: {"name": "Jasper", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST jasper", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
aaron: {"name": "Aaron", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto834", "special": "SPROTO BURST aaron", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
brainsprot: {"name": "Brain Sprot", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto2075", "special": "SPROTO BURST brainsprot", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
godmod3d: {"name": "GodMod3D.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION godmod3d", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
sober: {"name": "Sober", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto282", "special": "SPROTO BURST sober", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
nosmileclown: {"name": "\ud835\udd79\ud835\udd94\ud835\udd98\ud835\udd92\ud835\udd8e\ud835\udd91\ud835\udd8a\ud835\udd88\ud835\udd91\ud835\udd94\ud835\udd9c\ud835\udd93", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "TWIN FUSION nosmileclown", "role": "DUET", "description": "Two separate animated bodies with one health pool and alternating contacts."},
olnoname: {"name": "ol\u2019 no name", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner":"sproto1815", "special": "SPROTO BURST olnoname", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
greatcharly: {"name": "Great Charly.eth", "color": "#60aaff", "dark": "#263c64", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SPROTO BURST greatcharly", "role": "SKIRMISH", "description": "Reference-based full-body pixel art; shared controls and individual combat profile."},
/* SPROTOS ROSTER END */
/* SATOSHI ROSTER BEGIN */
satoshi:{"name":"Satoshi Sprototo","color":"#ffd347","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"GENESIS RELAY","role":"ORIGIN","description":"Mouth-spit pressure and a four-contact Genesis Relay."},
/* SATOSHI ROSTER END */
/* XALT ROSTER BEGIN */
xalt:{"name":"Xalt","color":"#ff655b","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"SCARLET SURGE","role":"BRIGHT EYES","description":"Mouth-spit pressure and a four-contact Scarlet Surge."},
/* XALT ROSTER END */
/* POTOCAICAI ROSTER BEGIN */
potocaicai:{"name":"Poto Cai Cai","color":"#ffe85b","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"CAI CAI CASCADE","role":"CROWN TRICK","description":"Mouth-spit pressure and a four-contact Cai Cai Cascade."},
/* POTOCAICAI ROSTER END */
/* MIDDAY ROSTER BEGIN */
reverend:{"name": "Reverend Cloud", "color": "#ffdf39", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SUNDAY SERVICE", "role": "FORMAL", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
zepump:{"name": "H.E. ZEPUMP", "color": "#ffe34b", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "DOUBLE DIP", "role": "DUET", "description": "Two separately animated bodies coordinate strikes and acrobatic kicks with shared health."},
sprotopotamus:{"name": "Sprotopotamus", "color": "#ffdf39", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "HIPPO HUSTLE", "role": "HEAVY", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
willuminati:{"name": "WILLUMINATI", "color": "#ffe227", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "RED SUN RALLY", "role": "RADIANT", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
pirate:{"name": "P| RAT\u039e", "color": "#fff1b8", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "JOLLY ROGER", "role": "CORSAIR", "description": "Boarding strikes, a flowing cape and a hand-thrown spinning skull and crossbones."},
prim:{"name": "prim", "color": "#ffdf41", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "PRIMETIME", "role": "PRISM", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
benjamin:{"name": "Benjamin Button", "color": "#ffe14d", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "BUTTON UP", "role": "DAPPER", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
maxbiggums:{"name": "Max Biggums", "color": "#ffe14d", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "BIG FINISH", "role": "BRAWLER", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
xav:{"name": "Xav", "color": "#ffe33d", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SLEEPWALK SWEEP", "role": "SLY", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
emix:{"name": "0xEmix0", "color": "#ffdd38", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "RED EYE RELAY", "role": "SWITCH", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
peterpan:{"name": "0xPeterPan", "color": "#ffe844", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "NEVERLAND RELAY", "role": "DUET", "description": "Two separately animated bodies coordinate strikes and acrobatic kicks with shared health."},
anni:{"name": "ANNI niM.A.T.", "color": "#ff4a39", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "CROWN CRASH", "role": "GRIN", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
pinewaffle:{"name": "pinewaffle", "color": "#ffe64d", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "WAFFLE RALLY", "role": "CHEER", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
rainman:{"name": "Rainman_four20", "color": "#ffdf42", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "RAIN CHECK", "role": "QUICK", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
wifebeater:{"name": "wifebeater.eth", "color": "#ffe341", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "BOWTIE BREAK", "role": "HEAVY", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
fiatfudder:{"name": "FIAT FUDDER", "color": "#ffe441", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "FUD BREAKER", "role": "CAPED", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
moonshiller:{"name": "MoonShiller", "color": "#e43b32", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "LUNAR ROLL", "role": "ROUND", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
godether:{"name": "GodEther.eth", "color": "#ffe141", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "ETHER RISE", "role": "REGAL", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
aleksander:{"name": "Aleksander", "color": "#ffe341", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "THIRD ACT", "role": "TRICK", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
cyberviber:{"name": "cyberviber", "color": "#ffce32", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "QUAD VIBE", "role": "FOUR EYES", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
realityarchitect:{"name": "RealityArchitect.eth", "color": "#ffe147", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "REALITY SHIFT", "role": "DESIGN", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
mrgoldrobe:{"name": "MrGoldRobe.eth", "color": "#ffe14c", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "GOLDEN HOUR", "role": "GOLD", "description": "Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish."},
/* MIDDAY ROSTER END */
/* SPROTETH ROSTER BEGIN */
sproteth:{"name":"sprot.eth","color":"#ffe34d","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"GOLDEN GREETING","role":"GOLD COLLAR","description":"Mouth-spit pressure and a four-contact Golden Greeting."},
/* SPROTETH ROSTER END */
/* DANOCRYPTO ROSTER BEGIN */
danocrypto:{"name": "Dano Crypto", "color": "#f5dd44", "dark": "#223aa4", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "DANO SURGE", "role": "RED EYES", "description": "Guarded footwork, palm casts and a four-contact Dano Surge."},
/* DANOCRYPTO ROSTER END */
/* SOLANA ROSTER BEGIN */
solanadelray:{"name": "Solana Del Ray", "color": "#ffe353", "dark": "#253783", "speed": 5.5, "jump": 15.8, "partner": "rivet", "special": "SUNSET SERENADE", "role": "DUET", "description": "An agile red striker and a blue powerhouse share health and trade acrobatic attacks."},
/* SOLANA ROSTER END */
/* BUDDHASHADOW ROSTER BEGIN */
buddhashadow:{"name":"SPROTO BUDDHA (Shadow Mode)","color":"#ffe238","dark":"#242424","speed":5.1,"jump":15.2,"partner":"rivet","special":"SHADOW AWAKENING","role":"SHADOW POISE","description":"Dark rings from a mouth-spit release and a four-contact Shadow Awakening."},
/* BUDDHASHADOW ROSTER END */
    stoto: {"name": "stoto", "color": "#f5d941", "dark": "#20357f", "speed": 4.8, "jump": 14.8, "partner": "rivet", "special": "GOLDEN RUSH", "role": "PRESSURE", "description": "Guarded footwork, a ring ranged attack and a four-contact Golden Rush."},
    herbpowell: {"name": "Herb Powell", "color": "#f64a3f", "dark": "#20357f", "speed": 4.91, "jump": 14.98, "partner": "rivet", "special": "POWELL PRESS", "role": "COUNTER", "description": "Guarded footwork, a drop ranged attack and a four-contact Powell Press."},
    sirdidit: {"name": "sirdidit", "color": "#ffcc35", "dark": "#20357f", "speed": 5.02, "jump": 15.16, "partner": "rivet", "special": "GRIN AND WIN", "role": "SKIRMISH", "description": "Guarded footwork, a pixel ranged attack and a four-contact Grin And Win."},
    ceo: {"name": "CEO", "color": "#a8b0ff", "dark": "#20357f", "speed": 5.13, "jump": 15.34, "partner": "rivet", "special": "CEO SURGE", "role": "ZONING", "description": "Guarded footwork, a prism ranged attack and a four-contact Ceo Surge."},
    ciphersproto: {"name": "Cipher Sproto", "color": "#53c7f1", "dark": "#20357f", "speed": 5.24, "jump": 15.52, "partner": "rivet", "special": "CIPHER SURGE", "role": "PRESSURE", "description": "Guarded footwork, a orb ranged attack and a four-contact Cipher Surge."},
    sprotocius: {"name": "sprotocius", "color": "#fd8758", "dark": "#20357f", "speed": 5.35, "jump": 15.7, "partner": "rivet", "special": "SPROTOCIUS SURGE", "role": "COUNTER", "description": "Guarded footwork, a spark ranged attack and a four-contact Sprotocius Surge."},
    rmacpdx: {"name": "RMacPDX", "color": "#79b4ff", "dark": "#20357f", "speed": 5.46, "jump": 15.88, "partner": "rivet", "special": "RMACPDX SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a arrow ranged attack and a four-contact Rmacpdx Surge."},
    azkarah: {"name": "Azkarah", "color": "#f0a6df", "dark": "#20357f", "speed": 5.57, "jump": 14.8, "partner": "rivet", "special": "AZKARAH SURGE", "role": "ZONING", "description": "Guarded footwork, a needle ranged attack and a four-contact Azkarah Surge."},
    mrhorsemeat: {"name": "Mr. Horse Meat", "color": "#f64a3f", "dark": "#20357f", "speed": 4.8, "jump": 15.16, "partner": "rivet", "special": "MR. SURGE", "role": "COUNTER", "description": "Guarded footwork, a drop ranged attack and a four-contact Mr. Surge."},
    wyrmblvnt: {"name": "wyrmblvnt", "color": "#ffcc35", "dark": "#20357f", "speed": 4.91, "jump": 15.34, "partner": "rivet", "special": "WYRMBLVNT SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a pixel ranged attack and a four-contact Wyrmblvnt Surge."},
    aktree: {"name": "Ak Tree", "color": "#a8b0ff", "dark": "#20357f", "speed": 5.02, "jump": 15.52, "partner": "rivet", "special": "AK SURGE", "role": "ZONING", "description": "Guarded footwork, a prism ranged attack and a four-contact Ak Surge."},
    fplgremlin: {"name": "FPL Gremlin", "color": "#53c7f1", "dark": "#20357f", "speed": 5.13, "jump": 15.7, "partner": "rivet", "special": "FPL SURGE", "role": "PRESSURE", "description": "Guarded footwork, a orb ranged attack and a four-contact Fpl Surge."},
    chrisfowler: {"name": "Chris Fowler", "color": "#fd8758", "dark": "#20357f", "speed": 5.24, "jump": 15.88, "partner": "rivet", "special": "CHRIS SURGE", "role": "COUNTER", "description": "Guarded footwork, a spark ranged attack and a four-contact Chris Surge."},
    spruto: {"name": "Spruto", "color": "#79b4ff", "dark": "#20357f", "speed": 5.35, "jump": 14.8, "partner": "rivet", "special": "SPRUTO SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a arrow ranged attack and a four-contact Spruto Surge."},
    ghostsprotocol: {"name": "ghost sprotocol", "color": "#f0a6df", "dark": "#20357f", "speed": 5.46, "jump": 14.98, "partner": "rivet", "special": "GHOST SURGE", "role": "ZONING", "description": "Guarded footwork, a needle ranged attack and a four-contact Ghost Surge."},
    tdeth: {"name": "TD.eth", "color": "#f5d941", "dark": "#20357f", "speed": 5.57, "jump": 15.16, "partner": "rivet", "special": "TD.ETH SURGE", "role": "PRESSURE", "description": "Guarded footwork, a ring ranged attack and a four-contact Td.Eth Surge."},
    vicoo: {"name": "sprotolicious", "color": "#f64a3f", "dark": "#20357f", "speed": 5.68, "jump": 15.34, "partner": "rivet", "special": "SPROTOLICIOUS SURGE", "role": "COUNTER", "description": "Guarded footwork, a drop ranged attack and a four-contact Sprotolicious Surge."},
    chonky: {"name": "Chonky", "color": "#ffcc35", "dark": "#20357f", "speed": 4.8, "jump": 15.52, "partner": "rivet", "special": "CHONKY SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a pixel ranged attack and a four-contact Chonky Surge."},
    degenpress: {"name": "degenpress.base.eth", "color": "#a8b0ff", "dark": "#20357f", "speed": 4.91, "jump": 15.7, "partner": "rivet", "special": "DEGENPRESS.BASE.ETH SURGE", "role": "ZONING", "description": "Guarded footwork, a prism ranged attack and a four-contact Degenpress.Base.Eth Surge."},
    giavannykitchens: {"name": "Giavanny Kitchens", "color": "#53c7f1", "dark": "#20357f", "speed": 5.02, "jump": 15.88, "partner": "rivet", "special": "GIAVANNY SURGE", "role": "PRESSURE", "description": "Guarded footwork, a orb ranged attack and a four-contact Giavanny Surge."},
    seph0x: {"name": "Seph0x", "color": "#fd8758", "dark": "#20357f", "speed": 5.13, "jump": 14.8, "partner": "rivet", "special": "SEPH0X SURGE", "role": "COUNTER", "description": "Guarded footwork, a spark ranged attack and a four-contact Seph0X Surge."},
    rektina: {"name": "rektina", "color": "#79b4ff", "dark": "#20357f", "speed": 5.24, "jump": 14.98, "partner": "rivet", "special": "REKTINA SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a arrow ranged attack and a four-contact Rektina Surge."},
    twinnyneutron: {"name": "twinny neutron", "color": "#f0a6df", "dark": "#20357f", "speed": 5.35, "jump": 15.16, "partner": "rivet", "special": "NEUTRON RELAY", "role": "DUET", "description": "Two separate twins share health and alternate their strikes."},
    melo: {"name": "melo", "color": "#f5d941", "dark": "#20357f", "speed": 5.46, "jump": 15.34, "partner": "rivet", "special": "GILDED CUT", "role": "SWORD", "description": "A red and gold sword, sweeping cuts and a four-contact Gilded Cut."},
    kern: {"name": "Kern", "color": "#f64a3f", "dark": "#20357f", "speed": 5.57, "jump": 15.52, "partner": "rivet", "special": "KERN SURGE", "role": "COUNTER", "description": "Guarded footwork, a drop ranged attack and a four-contact Kern Surge."},
    bs9090eth: {"name": "bs9090.eth", "color": "#a8b0ff", "dark": "#20357f", "speed": 4.8, "jump": 15.88, "partner": "rivet", "special": "BS9090.ETH SURGE", "role": "ZONING", "description": "Guarded footwork, a prism ranged attack and a four-contact Bs9090.Eth Surge."},
    renzo: {"name": "RENZO", "color": "#53c7f1", "dark": "#20357f", "speed": 4.91, "jump": 14.8, "partner": "rivet", "special": "RENZO SURGE", "role": "PRESSURE", "description": "Guarded footwork, a orb ranged attack and a four-contact Renzo Surge."},
    micsash: {"name": "Micsash __/acc", "color": "#fd8758", "dark": "#20357f", "speed": 5.02, "jump": 14.98, "partner": "rivet", "special": "MICSASH SURGE", "role": "COUNTER", "description": "Guarded footwork, a spark ranged attack and a four-contact Micsash Surge."},
    davidcd: {"name": "(Da,vid) DC", "color": "#79b4ff", "dark": "#20357f", "speed": 5.13, "jump": 15.16, "partner": "rivet", "special": "(DA,VID) SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a arrow ranged attack and a four-contact (Da,Vid) Surge."},
    samixsproto: {"name": "samiXsproto", "color": "#f0a6df", "dark": "#20357f", "speed": 5.24, "jump": 15.34, "partner": "rivet", "special": "SAMIXSPROTO SURGE", "role": "ZONING", "description": "Guarded footwork, a needle ranged attack and a four-contact Samixsproto Surge."},
    wireitwell: {"name": "_wireitwell_", "color": "#f5d941", "dark": "#20357f", "speed": 5.35, "jump": 15.52, "partner": "rivet", "special": "_WIREITWELL_ SURGE", "role": "PRESSURE", "description": "Guarded footwork, a ring ranged attack and a four-contact _Wireitwell_ Surge."},
    cryptoboy: {"name": "CryptoBoy", "color": "#f64a3f", "dark": "#20357f", "speed": 5.46, "jump": 15.7, "partner": "rivet", "special": "CRYPTOBOY SURGE", "role": "COUNTER", "description": "Guarded footwork, a drop ranged attack and a four-contact Cryptoboy Surge."},
    osho: {"name": "Osho", "color": "#ffcc35", "dark": "#20357f", "speed": 5.57, "jump": 15.88, "partner": "rivet", "special": "OSHO SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a pixel ranged attack and a four-contact Osho Surge."},
    pr0lificeth: {"name": "Pr0lific.eth", "color": "#a8b0ff", "dark": "#20357f", "speed": 5.68, "jump": 14.8, "partner": "rivet", "special": "PR0LIFIC.ETH SURGE", "role": "ZONING", "description": "Guarded footwork, a prism ranged attack and a four-contact Pr0Lific.Eth Surge."},
    bidnehhh: {"name": "Bidnehhh", "color": "#53c7f1", "dark": "#20357f", "speed": 4.8, "jump": 14.98, "partner": "rivet", "special": "BIDNEHHH SURGE", "role": "PRESSURE", "description": "Guarded footwork, a orb ranged attack and a four-contact Bidnehhh Surge."},
    jayquant: {"name": "JayQuant", "color": "#fd8758", "dark": "#20357f", "speed": 4.91, "jump": 15.16, "partner": "rivet", "special": "JAYQUANT SURGE", "role": "COUNTER", "description": "Guarded footwork, a spark ranged attack and a four-contact Jayquant Surge."},
    infinitysplitter: {"name": "infinitysplitter", "color": "#79b4ff", "dark": "#20357f", "speed": 5.02, "jump": 15.34, "partner": "rivet", "special": "INFINITYSPLITTER SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a arrow ranged attack and a four-contact Infinitysplitter Surge."},
    hdizzy: {"name": "HDIZZY ~ 197 IQ", "color": "#f0a6df", "dark": "#20357f", "speed": 5.13, "jump": 15.52, "partner": "rivet", "special": "HDIZZY SURGE", "role": "ZONING", "description": "Guarded footwork, a needle ranged attack and a four-contact Hdizzy Surge."},
    cryptoviking420: {"name": "420cryptoviking", "color": "#f5d941", "dark": "#20357f", "speed": 5.24, "jump": 15.7, "partner": "rivet", "special": "420CRYPTOVIKING SURGE", "role": "PRESSURE", "description": "Guarded footwork, a ring ranged attack and a four-contact 420Cryptoviking Surge."},
    sweatpantstrust: {"name": "in sweatpants we trust", "color": "#f64a3f", "dark": "#20357f", "speed": 5.35, "jump": 15.88, "partner": "rivet", "special": "IN SURGE", "role": "COUNTER", "description": "Guarded footwork, a drop ranged attack and a four-contact In Surge."},
    spunow: {"name": "spunow habichuelas", "color": "#ffcc35", "dark": "#20357f", "speed": 5.46, "jump": 14.8, "partner": "rivet", "special": "SPUNOW SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a pixel ranged attack and a four-contact Spunow Surge."},
    sprotomichaelsaylor: {"name": "SprotoMichaelSaylor", "color": "#a8b0ff", "dark": "#20357f", "speed": 5.57, "jump": 14.98, "partner": "rivet", "special": "SPROTOMICHAELSAYLOR SURGE", "role": "ZONING", "description": "Guarded footwork, a prism ranged attack and a four-contact Sprotomichaelsaylor Surge."},
    zippy: {"name": "zippy", "color": "#53c7f1", "dark": "#20357f", "speed": 5.68, "jump": 15.16, "partner": "rivet", "special": "ZIPPY SURGE", "role": "PRESSURE", "description": "Guarded footwork, a orb ranged attack and a four-contact Zippy Surge."},
    lilgoldied: {"name": "LilGoldieD", "color": "#fd8758", "dark": "#20357f", "speed": 4.8, "jump": 15.34, "partner": "rivet", "special": "LILGOLDIED SURGE", "role": "COUNTER", "description": "Guarded footwork, a spark ranged attack and a four-contact Lilgoldied Surge."},
    bitcoind1rk: {"name": "BITCOIN D1RK D1GGLER", "color": "#79b4ff", "dark": "#20357f", "speed": 4.91, "jump": 15.52, "partner": "rivet", "special": "BITCOIN SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a arrow ranged attack and a four-contact Bitcoin Surge."},
    felixsprotoarc: {"name": "felix (sproto arc)", "color": "#f0a6df", "dark": "#20357f", "speed": 5.02, "jump": 15.7, "partner": "rivet", "special": "FELIX SURGE", "role": "ZONING", "description": "Guarded footwork, a needle ranged attack and a four-contact Felix Surge."},
    onememeaday: {"name": "1 meme a day til $10", "color": "#f5d941", "dark": "#20357f", "speed": 5.13, "jump": 15.88, "partner": "rivet", "special": "1 SURGE", "role": "PRESSURE", "description": "Guarded footwork, a ring ranged attack and a four-contact 1 Surge."},
    zudi: {"name": "Zudi", "color": "#f64a3f", "dark": "#20357f", "speed": 5.24, "jump": 14.8, "partner": "rivet", "special": "ZUDI SURGE", "role": "COUNTER", "description": "Guarded footwork, a drop ranged attack and a four-contact Zudi Surge."},
    forchaneth: {"name": "Forchan.eth", "color": "#ffcc35", "dark": "#20357f", "speed": 5.35, "jump": 14.98, "partner": "rivet", "special": "FORCHAN.ETH SURGE", "role": "SKIRMISH", "description": "Guarded footwork, a pixel ranged attack and a four-contact Forchan.Eth Surge."},
    theo: {
        name: 'Theo', color: '#527dff', dark: '#183a93', speed: 5.25, jump: 15.6,
        partner: 'rivet', special: 'TWIN FLASH', role: 'LASER',
        description: 'Twin chest lasers, guarded footwork and a four-contact Twin Flash.',
    },
    duo: { name:'candles', color:'#ffcf45', dark:'#294e8b', speed:5.5, jump:15.8, partner:'vela', special:'DOUBLE TAKE', role:'DUET', description:'Two distinct Sprotos, one player: the front actor attacks while its companion covers.' },
    vela: { name: 'Morelight', color: '#6ba9ff', dark: '#244da8', speed: 4.4, jump: 14.8, "partner":"sproto2789", special: 'PRISM BREAK', role: 'ZONING', description: 'Spit fast eggs to control space, then turn an opening into a full combo.' },
    bront: { name: 'Fat Head Dave', color: '#ed9471', dark: '#8b493f', speed: 3.7, jump: 13.6, "partner":"sproto704", special: 'FAULT LINE', role: 'POWER', description: 'Stand your ground with heavier blows and a longer-reaching command grab.' },
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
 alpha777:{name:'Alpha 777',color:'#98aa6c',dark:'#263c64',speed:5.5,jump:15.8,"partner":"sproto2884",special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 mandela:{name:'Bitcoin Mandela',color:'#5288ef',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 bigswole:{name:'Big Swole',color:'#4395fb',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 nate:{name:'Little Foot Nate',color:'#97aee7',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 crapto:{name:'Crapto',color:'#d1a86c',dark:'#745137',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprite art with shared powers and animation timing.'},
 dumpstar:{name:'Dumpstar',color:'#77a9ff',dark:'#345bb3',speed:5.5,jump:15.8,"partner":"sproto102",special:'TEAM RELAY',role:'SHARED KIT',description:'Shared Golden Sproto movement and attacks. Face and attire from the supplied reference; shoulder objects omitted.'},
};
/** One roster identity per assist. Its complete twin body set is resolved by bodyAtlasIds. */
export const fighterPartner=(fighter:Pick<Fighter,'id'|'partner'>):FighterId=>fighter.partner??ROSTER[fighter.id].partner;
export const specialPartnerIds=(id:FighterId):readonly FighterId[]=>[ROSTER[id].partner];
/** Authored partner choreography and confirmed-contact properties. One identity
 * still shares the main fighter's meter and contact clock; twins alternate bodies. */
export interface PartnerAttack {
 name:string;
 kind:'prism'|'geyser'|'comet'|'vortex'|'blitz'|'dive'|'halberd'|'eights'|'storm'|'frost'|'crossfire'|'quakeDive'|'boomerang';
 motion:'hover'|'rise'|'orbit'|'rush'|'dive'|'sweep'|'throw'|'pulse'|'paired';
 color:string;
 bodyAttacks?:readonly string[];
 hits:readonly {push:number;stun:number;launch?:number;low?:boolean}[];
}
export const PARTNER_ATTACKS:Partial<Record<FighterId,PartnerAttack>> = {
 sproto313: {"name": "FOUR-EYE PINBALL", "kind": "prism", "motion": "hover", "color": "#6bf5ff", "hits": [{"push": 5, "stun": 32}]},
 sproto1414: {"name": "BLUE GEYSER", "kind": "geyser", "motion": "rise", "color": "#378dff", "hits": [{"push": 2, "stun": 34, "launch": 6}]},
 sproto2884: {"name": "CAP COMET", "kind": "comet", "motion": "orbit", "color": "#ffe55b", "hits": [{"push": 8, "stun": 30}]},
 sproto215: {"name": "RED-EYE VORTEX", "kind": "vortex", "motion": "hover", "color": "#fa587f", "hits": [{"push": -5, "stun": 36}]},
 sproto102: {"name": "SHOULDER BLITZ", "kind": "blitz", "motion": "rush", "color": "#ffaf4c", "hits": [{"push": 11, "stun": 29}]},
 sproto834: {"name": "CRIMSON DIVE", "kind": "dive", "motion": "dive", "color": "#ff416b", "hits": [{"push": 3, "stun": 33, "launch": 4}]},
 sproto1815: {"name": "HOOKED REAPER", "kind": "halberd", "motion": "sweep", "color": "#ff4747", "hits": [{"push": -3, "stun": 35, "low": true}]},
 sproto1601: {"name": "LUCKY EIGHT RAIN", "kind": "eights", "motion": "throw", "color": "#ffe45a", "hits": [{"push": 4, "stun": 31}]},
 sproto2789: {"name": "STORMSTAFF", "kind": "storm", "motion": "rise", "color": "#c791ff", "hits": [{"push": 1, "stun": 39, "launch": 5}]},
 sproto818: {"name": "FROST ECHO", "kind": "frost", "motion": "pulse", "color": "#9cecff", "hits": [{"push": 0, "stun": 42, "low": true}]},
 sproto282: {"name": "RED / BLUE CROSSFIRE", "kind": "crossfire", "motion": "paired", "color": "#f77294", "hits": [{"push": 7, "stun": 32}, {"push": -2, "stun": 35}], "bodyAttacks": ["Red fan shot", "Blue ground zigzag"]},
 sproto2075: {"name": "SKY / QUAKE", "kind": "quakeDive", "motion": "paired", "color": "#ffe368", "hits": [{"push": 2, "stun": 34, "launch": 7}, {"push": 10, "stun": 37, "low": true, "launch": -9}], "bodyAttacks": ["Small Sproto sky dive", "Large Sproto earthquake stomp"]},
 sproto704: {"name": "BOULDER / BOOMERANG", "kind": "boomerang", "motion": "paired", "color": "#7be7c1", "hits": [{"push": 13, "stun": 30}, {"push": -4, "stun": 38}], "bodyAttacks": ["Large Sproto boulder throw", "Small Sproto returning boomerang"]},
};
/** Fixed identities alternate independently of facing, so both twins attack. */
export function partnerContactIndex(t:number,contacts:readonly number[]):number {
 let beat=0;for(let i=1;i<contacts.length&&contacts[i]<=t;i++)beat=i;return beat;
}
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
interface ShotOrigin {
 forward:number;
 height:number;
}
export interface CombatStyle {
 role:string; specialName:string; signature:string; lightRange:number; heavy:Partial<Move>; bolt:Partial<Move>;
 projectile:{speed:number;shape:string;beamLength?:number;beamFrames?:number;horizontal?:boolean;origin?:ShotOrigin;secondaryOrigin?:ShotOrigin;originByFacing?:{left:ShotOrigin;right:ShotOrigin};gravity?:number;bounces?:number;returnAt?:number;wave?:number;accel?:number;ground?:boolean};
 specialFrames:number[]; special:Partial<Move>; advance?:number; power?:'slow'|'drain'|'pull'|'launch'|'slam';
}
export const kit=(role:string,specialName:string,signature:string,lightRange:number,heavy:Partial<Move>,bolt:Partial<Move>,projectile:CombatStyle['projectile'],specialFrames:number[],special:Partial<Move>,advance=0,power?:CombatStyle['power']):CombatStyle=>({role,specialName,signature,lightRange,heavy,bolt,projectile,specialFrames,special,advance,power});
const twinLaserBolt = { startup: 15, recovery: 24, damage: 64 };
const twinLaserShot = { speed: 22, shape: 'eyeLaser', horizontal: true };
export const COMBAT_STYLES:Record<FighterId,CombatStyle>={
/* NOV03 LATE KITS BEGIN */
    "sprotopia": kit("ORANGE AURA", "SPROTOPIA RELAY", "Orange aura surrounds Sprotopia during each mouth-fired ranged attack.", 84, {range:136, damage:94}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 37.5, "height": 105.0}, "horizontal": true}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "lestrange": kit("FOOTWORK", "LESTRANGE RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:137, damage:94}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 106.25, "height": 95.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "cryptobartender": kit("ZONING", "CRYPTOBARTENDER RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:138, damage:94}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 107.5, "height": 103.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "razz": kit("COUNTER", "RAZZ RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 90, {range:139, damage:94}, {startup:18, recovery:28, damage:62}, {"speed": 14, "shape": "coin", "origin": {"forward": 108.75, "height": 87.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "laserbach": kit("PRESSURE", "LASERBACH RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:140, damage:94}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 100.0, "height": 96.25}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "freedfrida": kit("FOOTWORK", "FREED FRIDA RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:141, damage:94}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 97.5, "height": 102.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "contresens": kit("ZONING", "CONTRE-SENS RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:142, damage:94}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 86.25, "height": 116.25}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "sprotomidnightfx": kit("PRESSURE", "SPROTOMIDNIGHTFX RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:144, damage:94}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 106.25, "height": 88.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "mildtacos": kit("FOOTWORK", "MILDTACOS RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:145, damage:94}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 97.5, "height": 102.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "sprotosurvivor": kit("ZONING", "SPROTO SURVIVOR RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:146, damage:94}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 131.25, "height": 105.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "d86": kit("DOUBLE SHOT", "D86 RELAY", "Two synchronized shots fire from D86\u2019s lower nipples.", 90, {range:147, damage:94}, {startup:18, recovery:28, damage:62}, {"speed": 14, "shape": "spark", "origin": {"forward": 28.75, "height": 42.5}, "horizontal": true, "secondaryOrigin": {"forward": -6.25, "height": 42.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "cantankerous": kit("PRESSURE", "CAN TANKEROUS RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:148, damage:94}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 122.5, "height": 105.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "autistophrenicsprotagonist": kit("FOOTWORK", "AUTISTOPHRENIC SPROTAGONIST RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:136, damage:95}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 72.5, "height": 108.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "sprotolg": kit("ZONING", "SPROTO LG RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:137, damage:95}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 102.5, "height": 98.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "kerrieanne": kit("COUNTER", "KERRIE ANNE RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 90, {range:138, damage:95}, {startup:18, recovery:28, damage:62}, {"speed": 14, "shape": "coin", "origin": {"forward": 108.75, "height": 95.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "yusuf": kit("PRESSURE", "YUSUF RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:139, damage:95}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 81.25, "height": 105.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "bobdobbs": kit("FOOTWORK", "BOB DOBBS RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:140, damage:95}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 91.25, "height": 112.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "gluttony": kit("ZONING", "GLUTTONY RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:141, damage:95}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 98.75, "height": 115.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "slakesly": kit("COUNTER", "SLAKESLY RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 90, {range:142, damage:95}, {startup:18, recovery:28, damage:62}, {"speed": 14, "shape": "coin", "origin": {"forward": 91.25, "height": 101.25}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "jameskaminski": kit("PRESSURE", "JAMES KAMINSKI RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:143, damage:95}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 105.0, "height": 96.25}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "86gwei": kit("FOOTWORK", "86.GWEI RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:144, damage:95}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 108.75, "height": 101.25}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "sidelinereferee": kit("ZONING", "THE SIDELINE REFEREE RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:145, damage:95}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 105.0, "height": 95.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "zebracorn": kit("COUNTER", "ZEBRACORN RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 90, {range:146, damage:95}, {startup:18, recovery:28, damage:62}, {"speed": 14, "shape": "coin", "origin": {"forward": 103.75, "height": 100.0}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "corn": kit("PRESSURE", "CORN RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:147, damage:95}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 95.0, "height": 92.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "zakarum": kit("FOOTWORK", "ZAKARUM RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:148, damage:95}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 95.0, "height": 101.25}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "bgbadger": kit("ZONING", "BGBADGER RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:136, damage:96}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 105.0, "height": 101.25}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
/* NOV03 LATE KITS END */
/* FINAL INTAKE KITS BEGIN */
    tradertimmy: kit("COUNTER", "MARKET SURGE", "Guarded footwork, a straight mouth shot and a four-contact Market Surge.", 83, {range: 136, damage: 95}, {startup: 14, recovery: 26, damage: 53}, {"speed":11,"shape":"orb","horizontal":true,"origin":{"forward":40.0,"height":97.5}}, [15, 27, 39, 51], {range: 545, damage: 74, push: 4}, 1),
    durlan: kit("FOOTWORK", "REDLINE RUSH", "Guarded footwork, a straight mouth shot and a four-contact Redline Rush.", 84, {range: 137, damage: 96}, {startup: 15, recovery: 26, damage: 54}, {"speed":12,"shape":"spark","horizontal":true,"origin":{"forward":37.5,"height":102.5}}, [15, 27, 39, 51], {range: 551, damage: 75, push: 4}, 1),
    dollarbitcoin: kit("BRAWLER", "GOLD STANDARD", "Guarded footwork, a straight mouth shot and a four-contact Gold Standard.", 85, {range: 138, damage: 97}, {startup: 16, recovery: 26, damage: 55}, {"speed":13,"shape":"ring","horizontal":true,"origin":{"forward":30.0,"height":98.75}}, [15, 27, 39, 51], {range: 557, damage: 76, push: 4}, 1),
    lowernipple: kit("TWIN EMITTER", "DOUBLE SIGNAL", "Twin lower-torso shots and a four-contact Double Signal.", 86, {range: 139, damage: 98}, {startup: 17, recovery: 26, damage: 56}, {"speed":14,"shape":"lowerTorsoBolt","horizontal":true,"origin":{"forward":7.5,"height":50.0},"secondaryOrigin":{"forward":-16.25,"height":55.0}}, [15, 27, 39, 51], {range: 563, damage: 77, push: 4}, 1),
    obamasega420: kit("FOOTWORK", "YES WE CAN", "Guarded footwork, a straight mouth shot and a four-contact Yes We Can.", 87, {range: 140, damage: 99}, {startup: 18, recovery: 26, damage: 57}, {"speed":11,"shape":"orb","horizontal":true,"origin":{"forward":53.75,"height":98.75}}, [15, 27, 39, 51], {range: 569, damage: 78, push: 4}, 1),
    bigal: kit("BRAWLER", "BIG AL BARRAGE", "Guarded footwork, a straight mouth shot and a four-contact Big Al Barrage.", 88, {range: 141, damage: 100}, {startup: 19, recovery: 26, damage: 58}, {"speed":12,"shape":"spark","horizontal":true,"origin":{"forward":36.25,"height":107.5}}, [15, 27, 39, 51], {range: 575, damage: 79, push: 4}, 1),
    cryptorizzler: kit("COUNTER", "CHARM OFFENSIVE", "Guarded footwork, a straight mouth shot and a four-contact Charm Offensive.", 89, {range: 142, damage: 101}, {startup: 14, recovery: 26, damage: 59}, {"speed":13,"shape":"ring","horizontal":true,"origin":{"forward":35.0,"height":88.75}}, [15, 27, 39, 51], {range: 581, damage: 80, push: 4}, 1),
    cryptomonger: kit("FOOTWORK", "MONGER MOMENTUM", "Guarded footwork, a straight mouth shot and a four-contact Monger Momentum.", 90, {range: 143, damage: 102}, {startup: 15, recovery: 26, damage: 60}, {"speed":14,"shape":"prism","horizontal":true,"origin":{"forward":51.25,"height":103.75}}, [15, 27, 39, 51], {range: 587, damage: 81, push: 4}, 1),
    teahupoo: kit("COUNTER", "REEF BREAK", "Guarded footwork, a straight mouth shot and a four-contact Reef Break.", 92, {range: 145, damage: 104}, {startup: 17, recovery: 26, damage: 53}, {"speed":12,"shape":"spark","horizontal":true,"origin":{"forward":45.0,"height":103.75}}, [15, 27, 39, 51], {range: 599, damage: 83, push: 4}, 1),
    homosproto: kit("FOOTWORK", "SPIRAL SALUTE", "Guarded footwork, a straight mouth shot and a four-contact Spiral Salute.", 93, {range: 146, damage: 105}, {startup: 18, recovery: 26, damage: 54}, {"speed":13,"shape":"ring","horizontal":true,"origin":{"forward":48.75,"height":101.25}}, [15, 27, 39, 51], {range: 605, damage: 84, push: 4}, 1),
    pars: kit("BRAWLER", "PARS PARADE", "Guarded footwork, a straight mouth shot and a four-contact Pars Parade.", 94, {range: 147, damage: 106}, {startup: 19, recovery: 26, damage: 55}, {"speed":14,"shape":"prism","horizontal":true,"origin":{"forward":32.5,"height":107.5}}, [15, 27, 39, 51], {range: 611, damage: 85, push: 4}, 1),
    accidentallyrich: kit("COUNTER", "LUCKY BREAK", "Guarded footwork, a straight mouth shot and a four-contact Lucky Break.", 95, {range: 148, damage: 107}, {startup: 14, recovery: 26, damage: 56}, {"speed":11,"shape":"orb","horizontal":true,"origin":{"forward":32.5,"height":97.5}}, [15, 27, 39, 51], {range: 617, damage: 86, push: 4}, 1),
    np: kit("FOOTWORK", "BIG GRIN", "Guarded footwork, a straight mouth shot and a four-contact Big Grin.", 96, {range: 149, damage: 108}, {startup: 15, recovery: 26, damage: 57}, {"speed":12,"shape":"spark","horizontal":true,"origin":{"forward":36.25,"height":98.75}}, [15, 27, 39, 51], {range: 623, damage: 87, push: 4}, 1),
    slabcorn: kit("BRAWLER", "SLAB SHOCK", "Guarded footwork, a straight mouth shot and a four-contact Slab Shock.", 97, {range: 150, damage: 109}, {startup: 16, recovery: 26, damage: 58}, {"speed":13,"shape":"ring","horizontal":true,"origin":{"forward":32.5,"height":96.25}}, [15, 27, 39, 51], {range: 629, damage: 88, push: 4}, 1),
/* FINAL INTAKE KITS END */
/* NAMED INTAKE NOV03 KITS BEGIN */
    frej: kit("COUNTER", "SCARLET STEP", "Guarded footwork, a palm cast and the four-contact Scarlet Step.", 84, {range: 136, damage: 92}, {startup: 14, recovery: 26, damage: 53}, {"speed":10,"shape":"orb","origin":{"forward":102.5,"height":88.75}}, [15, 27, 39, 51], {range: 545, damage: 73, push: 4}, 1),
    crippledlover: kit("FOOTWORK", "SPIKE RUSH", "Guarded footwork, a palm cast and the four-contact Spike Rush.", 85, {range: 137, damage: 93}, {startup: 15, recovery: 26, damage: 54}, {"speed":11,"shape":"spark","origin":{"forward":82.5,"height":88.125}}, [15, 27, 39, 51], {range: 548, damage: 74, push: 4}, 1),
    pilgrim: kit("BRAWLER", "PILGRIM PARADE", "Guarded footwork, a palm cast and the four-contact Pilgrim Parade.", 86, {range: 138, damage: 94}, {startup: 16, recovery: 26, damage: 55}, {"speed":12,"shape":"ring","origin":{"forward":85.0,"height":92.5}}, [15, 27, 39, 51], {range: 551, damage: 75, push: 4}, 1),
    usedtowels: kit("COUNTER", "SUNBURST SPIN", "Guarded footwork, a palm cast and the four-contact Sunburst Spin.", 87, {range: 139, damage: 95}, {startup: 17, recovery: 26, damage: 56}, {"speed":13,"shape":"prism","origin":{"forward":111.25,"height":90.625}}, [15, 27, 39, 51], {range: 554, damage: 76, push: 4}, 1),
    drzmoody: kit("FOOTWORK", "MOODY COUNTER", "Guarded footwork, a palm cast and the four-contact Moody Counter.", 88, {range: 140, damage: 96}, {startup: 18, recovery: 26, damage: 57}, {"speed":14,"shape":"orb","origin":{"forward":105.0,"height":91.875}}, [15, 27, 39, 51], {range: 557, damage: 77, push: 4}, 1),
    cam: kit("BRAWLER", "CAT SCRAMBLE", "Guarded footwork, a palm cast and the four-contact Cat Scramble.", 89, {range: 141, damage: 97}, {startup: 19, recovery: 26, damage: 58}, {"speed":10,"shape":"spark","origin":{"forward":91.25,"height":89.375}}, [15, 27, 39, 51], {range: 560, damage: 78, push: 4}, 1),
    croy: kit("COUNTER", "FIVE EYE FEINT", "Guarded footwork, a palm cast and the four-contact Five Eye Feint.", 90, {range: 142, damage: 98}, {startup: 14, recovery: 26, damage: 59}, {"speed":11,"shape":"ring","origin":{"forward":105.0,"height":88.75}}, [15, 27, 39, 51], {range: 563, damage: 79, push: 4}, 1),
    stonkyleg69: kit("FOOTWORK", "STONKY STAMPEDE", "Guarded footwork, a palm cast and the four-contact Stonky Stampede.", 91, {range: 143, damage: 99}, {startup: 15, recovery: 26, damage: 60}, {"speed":12,"shape":"prism","origin":{"forward":93.75,"height":93.75}}, [15, 27, 39, 51], {range: 566, damage: 80, push: 4}, 1),
    janitor: kit("BRAWLER", "CLEAN SWEEP", "Guarded footwork, a palm cast and the four-contact Clean Sweep.", 92, {range: 144, damage: 100}, {startup: 16, recovery: 26, damage: 61}, {"speed":13,"shape":"orb","origin":{"forward":82.5,"height":89.375}}, [15, 27, 39, 51], {range: 569, damage: 81, push: 4}, 1),
    indiapolice: kit("COUNTER", "TRIPLE SIGNAL", "Guarded footwork, a palm cast and the four-contact Triple Signal.", 93, {range: 145, damage: 101}, {startup: 17, recovery: 26, damage: 53}, {"speed":14,"shape":"spark","origin":{"forward":90.0,"height":93.75}}, [15, 27, 39, 51], {range: 572, damage: 82, push: 4}, 1),
    veryseriousinvestor: kit("FOOTWORK", "MARKET BREAKOUT", "Guarded footwork, a palm cast and the four-contact Market Breakout.", 94, {range: 146, damage: 102}, {startup: 18, recovery: 26, damage: 54}, {"speed":10,"shape":"ring","origin":{"forward":103.75,"height":83.125}}, [15, 27, 39, 51], {range: 575, damage: 83, push: 4}, 1),
    agentsproto: kit("BRAWLER", "AGENT STRIKE", "Guarded footwork, a palm cast and the four-contact Agent Strike.", 95, {range: 147, damage: 103}, {startup: 19, recovery: 26, damage: 55}, {"speed":11,"shape":"prism","origin":{"forward":113.75,"height":96.25}}, [15, 27, 39, 51], {range: 578, damage: 84, push: 4}, 1),
    glow: kit("COUNTER", "PRISM FLARE", "Guarded footwork, a palm cast and the four-contact Prism Flare.", 96, {range: 148, damage: 104}, {startup: 14, recovery: 26, damage: 56}, {"speed":12,"shape":"orb","origin":{"forward":92.5,"height":81.25}}, [15, 27, 39, 51], {range: 581, damage: 85, push: 4}, 1),
    tingsmol: kit("FOOTWORK", "SMOL SURGE", "Guarded footwork, a palm cast and the four-contact Smol Surge.", 97, {range: 149, damage: 105}, {startup: 15, recovery: 26, damage: 57}, {"speed":13,"shape":"spark","origin":{"forward":98.75,"height":84.375}}, [15, 27, 39, 51], {range: 584, damage: 86, push: 4}, 1),
    johnson: kit("BRAWLER", "ONE EYE DRIVE", "Guarded footwork, a palm cast and the four-contact One Eye Drive.", 98, {range: 150, damage: 106}, {startup: 16, recovery: 26, damage: 58}, {"speed":14,"shape":"ring","origin":{"forward":97.5,"height":84.375}}, [15, 27, 39, 51], {range: 587, damage: 87, push: 4}, 1),
    loqi: kit("COUNTER", "HOOK AND FLASH", "Guarded footwork, a palm cast and the four-contact Hook And Flash.", 99, {range: 151, damage: 107}, {startup: 17, recovery: 26, damage: 59}, {"speed":10,"shape":"prism","origin":{"forward":73.75,"height":91.875}}, [15, 27, 39, 51], {range: 590, damage: 88, push: 4}, 1),
    marfrog: kit("FOOTWORK", "GOLDEN TRIFECTA", "Guarded footwork, a palm cast and the four-contact Golden Trifecta.", 100, {range: 152, damage: 108}, {startup: 18, recovery: 26, damage: 60}, {"speed":11,"shape":"orb","origin":{"forward":63.75,"height":95.625}}, [15, 27, 39, 51], {range: 593, damage: 89, push: 4}, 1),
    familywagon: kit("BRAWLER", "WAGON RUSH", "Guarded footwork, a palm cast and the four-contact Wagon Rush.", 84, {range: 153, damage: 109}, {startup: 19, recovery: 26, damage: 61}, {"speed":12,"shape":"spark","origin":{"forward":85.0,"height":91.875}}, [15, 27, 39, 51], {range: 596, damage: 90, push: 4}, 1),
    otorps: kit("COUNTER", "REVERSE SWERVE", "Guarded footwork, a palm cast and the four-contact Reverse Swerve.", 85, {range: 136, damage: 110}, {startup: 14, recovery: 26, damage: 53}, {"speed":13,"shape":"ring","origin":{"forward":70.0,"height":85.625}}, [15, 27, 39, 51], {range: 599, damage: 91, push: 4}, 1),
    berserk: kit("FOOTWORK", "DOUBLE GRIN", "Guarded footwork, a palm cast and the four-contact Double Grin.", 86, {range: 137, damage: 111}, {startup: 15, recovery: 26, damage: 54}, {"speed":14,"shape":"prism","origin":{"forward":82.5,"height":93.125}}, [15, 27, 39, 51], {range: 602, damage: 73, push: 4}, 1),
    crumpleii: kit("BRAWLER", "CRUMPLE ZONE", "Guarded footwork, a palm cast and the four-contact Crumple Zone.", 87, {range: 138, damage: 112}, {startup: 16, recovery: 26, damage: 55}, {"speed":10,"shape":"orb","origin":{"forward":102.5,"height":88.125}}, [15, 27, 39, 51], {range: 605, damage: 74, push: 4}, 1),
    feistyboi: kit("COUNTER", "FEISTY FINALE", "Guarded footwork, a palm cast and the four-contact Feisty Finale.", 88, {range: 139, damage: 92}, {startup: 17, recovery: 26, damage: 56}, {"speed":11,"shape":"spark","origin":{"forward":73.75,"height":86.25}}, [15, 27, 39, 51], {range: 608, damage: 75, push: 4}, 1),
    isaac: kit("FOOTWORK", "BLUE BARRAGE", "Guarded footwork, a palm cast and the four-contact Blue Barrage.", 89, {range: 140, damage: 93}, {startup: 18, recovery: 26, damage: 57}, {"speed":12,"shape":"ring","origin":{"forward":78.75,"height":92.5}}, [15, 27, 39, 51], {range: 611, damage: 76, push: 4}, 1),
    mikemike: kit("BRAWLER", "EMERALD DRIVE", "Guarded footwork, a palm cast and the four-contact Emerald Drive.", 90, {range: 141, damage: 94}, {startup: 19, recovery: 26, damage: 58}, {"speed":13,"shape":"prism","origin":{"forward":91.25,"height":85.0}}, [15, 27, 39, 51], {range: 614, damage: 77, push: 4}, 1),
    godsson: kit("COUNTER", "GOLDEN FLEX", "Guarded footwork, a palm cast and the four-contact Golden Flex.", 91, {range: 142, damage: 95}, {startup: 14, recovery: 26, damage: 59}, {"speed":14,"shape":"orb","origin":{"forward":96.25,"height":87.5}}, [15, 27, 39, 51], {range: 617, damage: 78, push: 4}, 1),
/* NAMED INTAKE NOV03 KITS END */
/* NOV03 NINE KITS BEGIN */
    "nomis": kit("PRESSURE", "NOMIS RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:136, damage:94}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 80.0, "height": 108.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "clobrwn": kit("FOOTWORK", "CLOBRWN RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:137, damage:94}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 76.25, "height": 112.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "thesprotowholivedeth": kit("ZONING", "THESPROTOWHOLIVED.ETH RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:138, damage:94}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 88.75, "height": 113.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "sirbitcoin": kit("COUNTER", "SIR BITCOIN RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 90, {range:139, damage:94}, {startup:18, recovery:28, damage:62}, {"speed": 14, "shape": "coin", "origin": {"forward": 101.25, "height": 92.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "saburdo": kit("PRESSURE", "SABURDO RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 84, {range:140, damage:94}, {startup:15, recovery:25, damage:56}, {"speed": 11, "shape": "ring", "origin": {"forward": 107.5, "height": 97.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "hermionemichelleamyrose": kit("FOOTWORK", "HERMIONEMICHELLEAMYROSE RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 86, {range:141, damage:94}, {startup:16, recovery:26, damage:58}, {"speed": 12, "shape": "spark", "origin": {"forward": 92.5, "height": 102.5}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "pongohpos10i": kit("ZONING", "PONGO HPOS10I RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 88, {range:142, damage:94}, {startup:17, recovery:27, damage:60}, {"speed": 13, "shape": "prism", "origin": {"forward": 81.25, "height": 113.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
    "julian": kit("COUNTER", "JULIAN RELAY", "Guarded footwork, a side kick, palm-fired pressure and a four-contact relay.", 90, {range:143, damage:94}, {startup:18, recovery:28, damage:62}, {"speed": 14, "shape": "coin", "origin": {"forward": 85.0, "height": 103.75}}, [15, 27, 39, 51], {range:620, damage:80, push:4}, 1),
/* NOV03 NINE KITS END */
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
 captain:kit('LASER CAPTAIN','SOLAR SALVO','Straight eye lasers and a driving four-contact Solar Salvo.',86,{range:132,damage:94},twinLaserBolt,{...twinLaserShot,origin:{forward:43.75,height:108.75}},[15,25,37,49],{range:680,damage:73,push:4},2),
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
 sproto2616:kit('STAFF','STAFF TEMPEST 2616','Full-length staff strikes and a radiant sun cast from its curled tip.',82,{range:143,damage:116},{startup:16,damage:58},{speed:11,shape:'sun',origin:{forward:157.5,height:80}},[14,24,36,48],{range:478,damage:99,push:3},2),
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
 vitaliketh:kit('SKIRMISH','SPROTO BURST vitaliketh','Hand-thrown Ethereum symbols, a heavy kick and four-contact ranged relay.',82,{range:135,damage:128},{startup:14,damage:57},{"speed": 11, "shape": "ethereum", "origin": {"forward": 100, "height": 100}},[14,24,36,48],{range:490,damage:111,push:3},2),
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
/* SATOSHI KIT BEGIN */
 satoshi:kit("ORIGIN","GENESIS RELAY","Straight mouth spit, distinctive footwork and a four-contact Genesis Relay.",87,{range:143,damage:94},{startup:16,recovery:27,damage:59},{speed:11,shape:'ring',horizontal:true,origin:{"forward": 60.0, "height": 107.5}},[15,27,39,51],{range:640,damage:81,push:4},1),
/* SATOSHI KIT END */
/* XALT KIT BEGIN */
 xalt:kit("BRIGHT EYES","SCARLET SURGE","Straight mouth spit, distinctive footwork and a four-contact Scarlet Surge.",88,{range:147,damage:95},{startup:17,recovery:28,damage:60},{speed:12,shape:'prism',horizontal:true,origin:{"forward": 48.75, "height": 105.0}},[15,27,39,51],{range:658,damage:82,push:4},1),
/* XALT KIT END */
/* POTOCAICAI KIT BEGIN */
 potocaicai:kit("CROWN TRICK","CAI CAI CASCADE","Straight mouth spit, distinctive footwork and a four-contact Cai Cai Cascade.",89,{range:151,damage:96},{startup:18,recovery:29,damage:61},{speed:13,shape:'coin',horizontal:true,origin:{"forward": 42.5, "height": 73.75}},[15,27,39,51],{range:676,damage:83,push:4},1),
/* POTOCAICAI KIT END */
/* MIDDAY KITS BEGIN */
 reverend:kit('FORMAL','SUNDAY SERVICE','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',82,{range:130,damage:90},{startup:14,recovery:25,damage:52},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 38.75, "height": 92.35}},[14,26,38,50],{range:520,damage:72,push:4},1),
 zepump:kit('DUET','DOUBLE DIP','Two separately animated bodies coordinate strikes and acrobatic kicks with shared health.',83,{range:131,damage:91},{startup:15,recovery:25,damage:53},{"speed": 12, "shape": "twin", "horizontal": true, "origin": {"forward": 109.75, "height": 112}, "originByFacing": {"left": {"forward": 109.75, "height": 112}, "right": {"forward": 95.4, "height": 80.83}}},[14,26,38,50],{range:527,damage:73,push:4},1),
 sprotopotamus:kit('HEAVY','HIPPO HUSTLE','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',84,{range:132,damage:92},{startup:16,recovery:25,damage:54},{"speed": 13, "shape": "ring", "horizontal": true, "origin": {"forward": 56.25, "height": 97.4}},[14,26,38,50],{range:534,damage:74,push:4},1),
 willuminati:kit('RADIANT','RED SUN RALLY','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',85,{range:133,damage:93},{startup:17,recovery:25,damage:55},{"speed": 14, "shape": "prism", "horizontal": true, "origin": {"forward": 48.75, "height": 83.25}},[14,26,38,50],{range:541,damage:75,push:4},1),
 pirate:kit('CORSAIR','JOLLY ROGER','Boarding strikes, a flowing cape and a hand-thrown spinning skull and crossbones.',86,{range:134,damage:94},{startup:18,recovery:25,damage:56},{"speed": 12, "shape": "skullBones", "horizontal": true, "origin": {"forward": 67.5, "height": 101.25}, "returnAt": 36},[14,26,38,50],{range:548,damage:76,push:4},1),
 prim:kit('PRISM','PRIMETIME','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',87,{range:135,damage:95},{startup:19,recovery:25,damage:57},{"speed": 12, "shape": "orb", "horizontal": true, "origin": {"forward": 53.75, "height": 79.07}},[14,26,38,50],{range:555,damage:77,push:4},1),
 benjamin:kit('DAPPER','BUTTON UP','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',88,{range:136,damage:96},{startup:14,recovery:25,damage:58},{"speed": 13, "shape": "ring", "horizontal": true, "origin": {"forward": 42.5, "height": 81.83}},[14,26,38,50],{range:562,damage:78,push:4},1),
 maxbiggums:kit('BRAWLER','BIG FINISH','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',89,{range:137,damage:97},{startup:15,recovery:25,damage:59},{"speed": 14, "shape": "prism", "horizontal": true, "origin": {"forward": 50.0, "height": 88.65}},[14,26,38,50],{range:569,damage:79,push:4},1),
 xav:kit('SLY','SLEEPWALK SWEEP','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',90,{range:138,damage:98},{startup:16,recovery:25,damage:60},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 42.5, "height": 92.78}},[14,26,38,50],{range:576,damage:80,push:4},1),
 emix:kit('SWITCH','RED EYE RELAY','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',91,{range:139,damage:99},{startup:17,recovery:25,damage:61},{"speed": 12, "shape": "orb", "horizontal": true, "origin": {"forward": 50.0, "height": 106.4}},[14,26,38,50],{range:583,damage:81,push:4},1),
 peterpan:kit('DUET','NEVERLAND RELAY','Two separately animated bodies coordinate strikes and acrobatic kicks with shared health.',92,{range:140,damage:100},{startup:18,recovery:25,damage:62},{"speed": 13, "shape": "twin", "horizontal": true, "origin": {"forward": 105.5, "height": 106.33}, "originByFacing": {"left": {"forward": 105.5, "height": 106.33}, "right": {"forward": 101.75, "height": 91.0}}},[14,26,38,50],{range:590,damage:82,push:4},1),
 anni:kit('GRIN','CROWN CRASH','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',93,{range:141,damage:101},{startup:19,recovery:25,damage:52},{"speed": 14, "shape": "prism", "horizontal": true, "origin": {"forward": 48.125, "height": 110.0}},[14,26,38,50],{range:597,damage:83,push:4},1),
 pinewaffle:kit('CHEER','WAFFLE RALLY','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',94,{range:142,damage:102},{startup:14,recovery:25,damage:53},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 46.25, "height": 99.9}},[14,26,38,50],{range:604,damage:84,push:4},1),
 rainman:kit('QUICK','RAIN CHECK','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',95,{range:143,damage:103},{startup:15,recovery:25,damage:54},{"speed": 12, "shape": "orb", "horizontal": true, "origin": {"forward": 43.75, "height": 95.62}},[14,26,38,50],{range:611,damage:85,push:4},1),
 wifebeater:kit('HEAVY','BOWTIE BREAK','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',96,{range:144,damage:104},{startup:16,recovery:25,damage:55},{"speed": 13, "shape": "ring", "horizontal": true, "origin": {"forward": 43.75, "height": 101.8}},[14,26,38,50],{range:618,damage:86,push:4},1),
 fiatfudder:kit('CAPED','FUD BREAKER','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',97,{range:145,damage:105},{startup:17,recovery:25,damage:56},{"speed": 14, "shape": "prism", "horizontal": true, "origin": {"forward": 37.5, "height": 89.68}},[14,26,38,50],{range:625,damage:87,push:4},1),
 moonshiller:kit('ROUND','LUNAR ROLL','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',98,{range:146,damage:106},{startup:18,recovery:25,damage:57},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 78.75, "height": 108.83}},[14,26,38,50],{range:632,damage:88,push:4},1),
 godether:kit('REGAL','ETHER RISE','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',99,{range:147,damage:107},{startup:19,recovery:25,damage:58},{"speed": 12, "shape": "orb", "horizontal": true, "origin": {"forward": 40.0, "height": 79.72}},[14,26,38,50],{range:639,damage:89,push:4},1),
 aleksander:kit('TRICK','THIRD ACT','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',100,{range:148,damage:108},{startup:14,recovery:25,damage:59},{"speed": 13, "shape": "ring", "horizontal": true, "origin": {"forward": 36.25, "height": 98.17}},[14,26,38,50],{range:646,damage:90,push:4},1),
 cyberviber:kit('FOUR EYES','QUAD VIBE','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',101,{range:149,damage:109},{startup:15,recovery:25,damage:60},{"speed": 14, "shape": "prism", "horizontal": true, "origin": {"forward": 52.5, "height": 87.88}},[14,26,38,50],{range:653,damage:91,push:4},1),
 realityarchitect:kit('DESIGN','REALITY SHIFT','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',102,{range:150,damage:110},{startup:16,recovery:25,damage:61},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 47.5, "height": 95.15}},[14,26,38,50],{range:660,damage:92,push:4},1),
 mrgoldrobe:kit('GOLD','GOLDEN HOUR','Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.',103,{range:151,damage:111},{startup:17,recovery:25,damage:62},{"speed": 12, "shape": "orb", "horizontal": true, "origin": {"forward": 43.75, "height": 81.75}},[14,26,38,50],{range:667,damage:93,push:4},1),
/* MIDDAY KITS END */
/* SPROTETH KIT BEGIN */
 sproteth:kit("GOLD COLLAR","GOLDEN GREETING","Straight mouth spit, distinctive footwork and a four-contact Golden Greeting.",91,{range:153,damage:101},{startup:17,recovery:26,damage:62},{speed:13,shape:'ring',horizontal:true,origin:{"forward": 56.25, "height": 105.0}},[16,28,40,52],{range:652,damage:84,push:4},1),
/* SPROTETH KIT END */
/* DANOCRYPTO KIT BEGIN */
 danocrypto:kit("RED EYES","DANO SURGE","Guarded footwork, a firm side kick and palm-fired pressure, with a four-contact Dano Surge.",89,{range:146,damage:97},{startup:16,recovery:25,damage:59},{speed:12,shape:'ring',origin:{"forward": 87.5, "height": 100}},[15,27,39,51],{range:610,damage:79,push:4},1),
/* DANOCRYPTO KIT END */
/* SOLANA KITS BEGIN */
 solanadelray:kit('DUET','SUNSET SERENADE','An agile red striker and a blue powerhouse share health and trade acrobatic attacks.',111,{range:156,damage:113},{startup:18,recovery:25,damage:64},{"speed": 11, "shape": "twin", "horizontal": true, "origin": {"forward": 93.3, "height": 112}, "originByFacing": {"left": {"forward": 93.3, "height": 112}, "right": {"forward": 127.8, "height": 94.9}}},[13,25,39,53],{range:680,damage:97,push:4},1),
/* SOLANA KITS END */
/* BUDDHASHADOW KIT BEGIN */
 buddhashadow:kit("SHADOW POISE","SHADOW AWAKENING","Dark mouth-spit rings, distinctive footwork and a four-contact Shadow Awakening.",90,{range:155,damage:104},{startup:19,recovery:28,damage:65},{speed:10,shape:'darkRing',horizontal:true,origin:{"forward": 41.25, "height": 85.0}},[17,29,41,53],{range:648,damage:85,push:4},1),
/* BUDDHASHADOW KIT END */
 stoto:kit("PRESSURE","GOLDEN RUSH","Guarded footwork, a ring ranged attack and a four-contact Golden Rush.",86,{"range": 136, "damage": 94},{"startup": 14, "recovery": 25, "damage": 52},{"speed": 10, "shape": "ring", "horizontal": true, "origin": {"forward": 51.25, "height": 88.75}},[13, 25, 37, 49],{"range": 570, "damage": 78, "push": 4},1),
 herbpowell:kit("COUNTER","POWELL PRESS","Guarded footwork, a drop ranged attack and a four-contact Powell Press.",87,{"range": 137, "damage": 95},{"startup": 15, "recovery": 26, "damage": 53},{"speed": 11, "shape": "drop", "horizontal": true, "origin": {"forward": 53.75, "height": 100.0}},[14, 26, 38, 50],{"range": 573, "damage": 79, "push": 4},1),
 sirdidit:kit("SKIRMISH","GRIN AND WIN","Guarded footwork, a pixel ranged attack and a four-contact Grin And Win.",88,{"range": 138, "damage": 96},{"startup": 16, "recovery": 27, "damage": 54},{"speed": 12, "shape": "pixel", "horizontal": true, "origin": {"forward": 42.5, "height": 80.0}},[15, 27, 39, 51],{"range": 576, "damage": 80, "push": 4},1),
 ceo:kit("ZONING","CEO SURGE","Guarded footwork, a prism ranged attack and a four-contact Ceo Surge.",89,{"range": 139, "damage": 97},{"startup": 17, "recovery": 25, "damage": 55},{"speed": 13, "shape": "prism", "horizontal": true, "origin": {"forward": 47.5, "height": 101.25}},[16, 28, 40, 52],{"range": 579, "damage": 81, "push": 4},1),
 ciphersproto:kit("PRESSURE","CIPHER SURGE","Guarded footwork, a orb ranged attack and a four-contact Cipher Surge.",90,{"range": 140, "damage": 98},{"startup": 18, "recovery": 26, "damage": 56},{"speed": 10, "shape": "orb", "horizontal": true, "origin": {"forward": 51.25, "height": 96.25}},[17, 29, 41, 53],{"range": 582, "damage": 82, "push": 4},1),
 sprotocius:kit("COUNTER","SPROTOCIUS SURGE","Guarded footwork, a spark ranged attack and a four-contact Sprotocius Surge.",91,{"range": 141, "damage": 99},{"startup": 19, "recovery": 27, "damage": 57},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 48.75, "height": 112.5}},[13, 25, 37, 49],{"range": 585, "damage": 83, "push": 4},1),
 rmacpdx:kit("SKIRMISH","RMACPDX SURGE","Guarded footwork, a arrow ranged attack and a four-contact Rmacpdx Surge.",92,{"range": 142, "damage": 100},{"startup": 14, "recovery": 25, "damage": 58},{"speed": 12, "shape": "arrow", "horizontal": true, "origin": {"forward": 53.75, "height": 111.25}},[14, 26, 38, 50],{"range": 588, "damage": 84, "push": 4},1),
 azkarah:kit("ZONING","AZKARAH SURGE","Guarded footwork, a needle ranged attack and a four-contact Azkarah Surge.",93,{"range": 143, "damage": 101},{"startup": 15, "recovery": 26, "damage": 59},{"speed": 13, "shape": "needle", "horizontal": true, "origin": {"forward": 46.25, "height": 113.75}},[15, 27, 39, 51],{"range": 591, "damage": 85, "push": 4},1),
 mrhorsemeat:kit("COUNTER","MR. SURGE","Guarded footwork, a drop ranged attack and a four-contact Mr. Surge.",95,{"range": 145, "damage": 103},{"startup": 17, "recovery": 25, "damage": 61},{"speed": 11, "shape": "drop", "horizontal": true, "origin": {"forward": 45.0, "height": 103.75}},[17, 29, 41, 53],{"range": 597, "damage": 87, "push": 4},1),
 wyrmblvnt:kit("SKIRMISH","WYRMBLVNT SURGE","Guarded footwork, a pixel ranged attack and a four-contact Wyrmblvnt Surge.",96,{"range": 146, "damage": 104},{"startup": 18, "recovery": 26, "damage": 62},{"speed": 12, "shape": "pixel", "horizontal": true, "origin": {"forward": 43.75, "height": 113.75}},[13, 25, 37, 49],{"range": 600, "damage": 88, "push": 4},1),
 aktree:kit("ZONING","AK SURGE","Guarded footwork, a prism ranged attack and a four-contact Ak Surge.",97,{"range": 147, "damage": 105},{"startup": 19, "recovery": 27, "damage": 63},{"speed": 13, "shape": "prism", "horizontal": true, "origin": {"forward": 50.0, "height": 108.75}},[14, 26, 38, 50],{"range": 603, "damage": 89, "push": 4},1),
 fplgremlin:kit("PRESSURE","FPL SURGE","Guarded footwork, a orb ranged attack and a four-contact Fpl Surge.",86,{"range": 148, "damage": 106},{"startup": 14, "recovery": 25, "damage": 64},{"speed": 10, "shape": "orb", "horizontal": true, "origin": {"forward": 40.0, "height": 113.75}},[15, 27, 39, 51],{"range": 606, "damage": 90, "push": 4},1),
 chrisfowler:kit("COUNTER","CHRIS SURGE","Guarded footwork, a spark ranged attack and a four-contact Chris Surge.",87,{"range": 149, "damage": 107},{"startup": 15, "recovery": 26, "damage": 65},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 47.5, "height": 100.0}},[16, 28, 40, 52],{"range": 609, "damage": 91, "push": 4},1),
 spruto:kit("SKIRMISH","SPRUTO SURGE","Guarded footwork, a arrow ranged attack and a four-contact Spruto Surge.",88,{"range": 150, "damage": 108},{"startup": 16, "recovery": 27, "damage": 66},{"speed": 12, "shape": "arrow", "horizontal": true, "origin": {"forward": 55.0, "height": 107.5}},[17, 29, 41, 53],{"range": 612, "damage": 92, "push": 4},1),
 ghostsprotocol:kit("ZONING","GHOST SURGE","Guarded footwork, a needle ranged attack and a four-contact Ghost Surge.",89,{"range": 151, "damage": 109},{"startup": 17, "recovery": 25, "damage": 52},{"speed": 13, "shape": "needle", "horizontal": true, "origin": {"forward": 53.75, "height": 110.0}},[13, 25, 37, 49],{"range": 615, "damage": 93, "push": 4},1),
 tdeth:kit("PRESSURE","TD.ETH SURGE","Guarded footwork, a ring ranged attack and a four-contact Td.Eth Surge.",90,{"range": 152, "damage": 110},{"startup": 18, "recovery": 26, "damage": 53},{"speed": 10, "shape": "ring", "horizontal": true, "origin": {"forward": 47.5, "height": 92.5}},[14, 26, 38, 50],{"range": 618, "damage": 94, "push": 4},1),
 vicoo:kit("COUNTER","SPROTOLICIOUS SURGE","Guarded footwork, a drop ranged attack and a four-contact Sprotolicious Surge.",91,{"range": 136, "damage": 111},{"startup": 19, "recovery": 27, "damage": 54},{"speed": 11, "shape": "drop", "horizontal": true, "origin": {"forward": 50.0, "height": 105.0}},[15, 27, 39, 51],{"range": 621, "damage": 95, "push": 4},1),
 chonky:kit("SKIRMISH","CHONKY SURGE","Guarded footwork, a pixel ranged attack and a four-contact Chonky Surge.",92,{"range": 137, "damage": 112},{"startup": 14, "recovery": 25, "damage": 55},{"speed": 12, "shape": "pixel", "horizontal": true, "origin": {"forward": 46.25, "height": 96.25}},[16, 28, 40, 52],{"range": 624, "damage": 96, "push": 4},1),
 degenpress:kit("ZONING","DEGENPRESS.BASE.ETH SURGE","Guarded footwork, a prism ranged attack and a four-contact Degenpress.Base.Eth Surge.",93,{"range": 138, "damage": 113},{"startup": 15, "recovery": 26, "damage": 56},{"speed": 13, "shape": "prism", "horizontal": true, "origin": {"forward": 38.75, "height": 96.25}},[17, 29, 41, 53],{"range": 627, "damage": 97, "push": 4},1),
 giavannykitchens:kit("PRESSURE","GIAVANNY SURGE","Guarded footwork, a orb ranged attack and a four-contact Giavanny Surge.",94,{"range": 139, "damage": 114},{"startup": 16, "recovery": 27, "damage": 57},{"speed": 10, "shape": "orb", "horizontal": true, "origin": {"forward": 67.5, "height": 107.5}},[13, 25, 37, 49],{"range": 630, "damage": 78, "push": 4},1),
 seph0x:kit("COUNTER","SEPH0X SURGE","Guarded footwork, a spark ranged attack and a four-contact Seph0X Surge.",95,{"range": 140, "damage": 115},{"startup": 17, "recovery": 25, "damage": 58},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 50.0, "height": 108.75}},[14, 26, 38, 50],{"range": 633, "damage": 79, "push": 4},1),
 rektina:kit("SKIRMISH","REKTINA SURGE","Guarded footwork, a arrow ranged attack and a four-contact Rektina Surge.",96,{"range": 141, "damage": 116},{"startup": 18, "recovery": 26, "damage": 59},{"speed": 12, "shape": "arrow", "horizontal": true, "origin": {"forward": 45.0, "height": 98.75}},[15, 27, 39, 51],{"range": 636, "damage": 80, "push": 4},1),
 twinnyneutron:kit("DUET","NEUTRON RELAY","Two separate twins share health and alternate their strikes.",97,{"range": 142, "damage": 117},{"startup": 19, "recovery": 27, "damage": 60},{"speed": 13, "shape": "needle", "horizontal": true, "origin": {"forward": 41.25, "height": 91.25}, "originByFacing": {"left": {"forward": 109.25, "height": 91.25}, "right": {"forward": 146.75, "height": 88.75}}},[16, 28, 40, 52],{"range": 639, "damage": 81, "push": 4},1),
 melo:kit("SWORD","GILDED CUT","A red and gold sword, sweeping cuts and a four-contact Gilded Cut.",86,{"range": 143, "damage": 118},{"startup": 14, "recovery": 25, "damage": 61},{"speed": 10, "shape": "ring", "horizontal": true, "origin": {"forward": 31.25, "height": 92.5}},[17, 29, 41, 53],{"range": 642, "damage": 82, "push": 4},1),
 kern:kit("COUNTER","KERN SURGE","Guarded footwork, a drop ranged attack and a four-contact Kern Surge.",87,{"range": 144, "damage": 119},{"startup": 15, "recovery": 26, "damage": 62},{"speed": 11, "shape": "drop", "horizontal": true, "origin": {"forward": 48.75, "height": 101.25}},[13, 25, 37, 49],{"range": 645, "damage": 83, "push": 4},1),
 bs9090eth:kit("ZONING","BS9090.ETH SURGE","Guarded footwork, a prism ranged attack and a four-contact Bs9090.Eth Surge.",89,{"range": 146, "damage": 121},{"startup": 17, "recovery": 25, "damage": 64},{"speed": 13, "shape": "prism", "horizontal": true, "origin": {"forward": 52.5, "height": 98.75}},[15, 27, 39, 51],{"range": 651, "damage": 85, "push": 4},1),
 renzo:kit("PRESSURE","RENZO SURGE","Guarded footwork, a orb ranged attack and a four-contact Renzo Surge.",90,{"range": 147, "damage": 122},{"startup": 18, "recovery": 26, "damage": 65},{"speed": 10, "shape": "orb", "horizontal": true, "origin": {"forward": 45.0, "height": 107.5}},[16, 28, 40, 52],{"range": 654, "damage": 86, "push": 4},1),
 micsash:kit("COUNTER","MICSASH SURGE","Guarded footwork, a spark ranged attack and a four-contact Micsash Surge.",91,{"range": 148, "damage": 123},{"startup": 19, "recovery": 27, "damage": 66},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 27.5, "height": 91.25}},[17, 29, 41, 53],{"range": 657, "damage": 87, "push": 4},1),
 davidcd:kit("SKIRMISH","(DA,VID) SURGE","Guarded footwork, a arrow ranged attack and a four-contact (Da,Vid) Surge.",92,{"range": 149, "damage": 124},{"startup": 14, "recovery": 25, "damage": 52},{"speed": 12, "shape": "arrow", "horizontal": true, "origin": {"forward": 48.75, "height": 92.5}},[13, 25, 37, 49],{"range": 660, "damage": 88, "push": 4},1),
 samixsproto:kit("ZONING","SAMIXSPROTO SURGE","Guarded footwork, a needle ranged attack and a four-contact Samixsproto Surge.",93,{"range": 150, "damage": 125},{"startup": 15, "recovery": 26, "damage": 53},{"speed": 13, "shape": "needle", "horizontal": true, "origin": {"forward": 40.0, "height": 113.75}},[14, 26, 38, 50],{"range": 663, "damage": 89, "push": 4},1),
 wireitwell:kit("PRESSURE","_WIREITWELL_ SURGE","Guarded footwork, a ring ranged attack and a four-contact _Wireitwell_ Surge.",94,{"range": 151, "damage": 126},{"startup": 16, "recovery": 27, "damage": 54},{"speed": 10, "shape": "ring", "horizontal": true, "origin": {"forward": 52.5, "height": 93.75}},[15, 27, 39, 51],{"range": 666, "damage": 90, "push": 4},1),
 cryptoboy:kit("COUNTER","CRYPTOBOY SURGE","Guarded footwork, a drop ranged attack and a four-contact Cryptoboy Surge.",95,{"range": 152, "damage": 127},{"startup": 17, "recovery": 25, "damage": 55},{"speed": 11, "shape": "drop", "horizontal": true, "origin": {"forward": 52.5, "height": 75.0}},[16, 28, 40, 52],{"range": 669, "damage": 91, "push": 4},1),
 osho:kit("SKIRMISH","OSHO SURGE","Guarded footwork, a pixel ranged attack and a four-contact Osho Surge.",96,{"range": 136, "damage": 128},{"startup": 18, "recovery": 26, "damage": 56},{"speed": 12, "shape": "pixel", "horizontal": true, "origin": {"forward": 47.5, "height": 110.0}},[17, 29, 41, 53],{"range": 672, "damage": 92, "push": 4},1),
 pr0lificeth:kit("ZONING","PR0LIFIC.ETH SURGE","Guarded footwork, a prism ranged attack and a four-contact Pr0Lific.Eth Surge.",97,{"range": 137, "damage": 129},{"startup": 19, "recovery": 27, "damage": 57},{"speed": 13, "shape": "prism", "horizontal": true, "origin": {"forward": 42.5, "height": 83.75}},[13, 25, 37, 49],{"range": 675, "damage": 93, "push": 4},1),
 bidnehhh:kit("PRESSURE","BIDNEHHH SURGE","Guarded footwork, a orb ranged attack and a four-contact Bidnehhh Surge.",86,{"range": 138, "damage": 130},{"startup": 14, "recovery": 25, "damage": 58},{"speed": 10, "shape": "orb", "horizontal": true, "origin": {"forward": 38.75, "height": 88.75}},[14, 26, 38, 50],{"range": 678, "damage": 94, "push": 4},1),
 jayquant:kit("COUNTER","JAYQUANT SURGE","Guarded footwork, a spark ranged attack and a four-contact Jayquant Surge.",87,{"range": 139, "damage": 131},{"startup": 15, "recovery": 26, "damage": 59},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 48.75, "height": 106.25}},[15, 27, 39, 51],{"range": 681, "damage": 95, "push": 4},1),
 infinitysplitter:kit("SKIRMISH","INFINITYSPLITTER SURGE","Guarded footwork, a arrow ranged attack and a four-contact Infinitysplitter Surge.",88,{"range": 140, "damage": 132},{"startup": 16, "recovery": 27, "damage": 60},{"speed": 12, "shape": "arrow", "horizontal": true, "origin": {"forward": 66.25, "height": 105.0}},[16, 28, 40, 52],{"range": 684, "damage": 96, "push": 4},1),
 hdizzy:kit("ZONING","HDIZZY SURGE","Guarded footwork, a needle ranged attack and a four-contact Hdizzy Surge.",89,{"range": 141, "damage": 133},{"startup": 17, "recovery": 25, "damage": 61},{"speed": 13, "shape": "needle", "horizontal": true, "origin": {"forward": 52.5, "height": 85.0}},[17, 29, 41, 53],{"range": 687, "damage": 97, "push": 4},1),
 cryptoviking420:kit("PRESSURE","420CRYPTOVIKING SURGE","Guarded footwork, a ring ranged attack and a four-contact 420Cryptoviking Surge.",90,{"range": 142, "damage": 134},{"startup": 18, "recovery": 26, "damage": 62},{"speed": 10, "shape": "ring", "horizontal": true, "origin": {"forward": 51.25, "height": 95.0}},[13, 25, 37, 49],{"range": 690, "damage": 78, "push": 4},1),
 sweatpantstrust:kit("COUNTER","IN SURGE","Guarded footwork, a drop ranged attack and a four-contact In Surge.",91,{"range": 143, "damage": 135},{"startup": 19, "recovery": 27, "damage": 63},{"speed": 11, "shape": "drop", "horizontal": true, "origin": {"forward": 40.0, "height": 111.25}},[14, 26, 38, 50],{"range": 693, "damage": 79, "push": 4},1),
 spunow:kit("SKIRMISH","SPUNOW SURGE","Guarded footwork, a pixel ranged attack and a four-contact Spunow Surge.",92,{"range": 144, "damage": 136},{"startup": 14, "recovery": 25, "damage": 64},{"speed": 12, "shape": "pixel", "horizontal": true, "origin": {"forward": 43.75, "height": 102.5}},[15, 27, 39, 51],{"range": 696, "damage": 80, "push": 4},1),
 sprotomichaelsaylor:kit("ZONING","SPROTOMICHAELSAYLOR SURGE","Guarded footwork, a prism ranged attack and a four-contact Sprotomichaelsaylor Surge.",93,{"range": 145, "damage": 137},{"startup": 15, "recovery": 26, "damage": 65},{"speed": 13, "shape": "prism", "horizontal": true, "origin": {"forward": 51.25, "height": 100.0}},[16, 28, 40, 52],{"range": 699, "damage": 81, "push": 4},1),
 zippy:kit("PRESSURE","ZIPPY SURGE","Guarded footwork, a orb ranged attack and a four-contact Zippy Surge.",94,{"range": 146, "damage": 138},{"startup": 16, "recovery": 27, "damage": 66},{"speed": 10, "shape": "orb", "horizontal": true, "origin": {"forward": 40.0, "height": 93.75}},[17, 29, 41, 53],{"range": 702, "damage": 82, "push": 4},1),
 lilgoldied:kit("COUNTER","LILGOLDIED SURGE","Guarded footwork, a spark ranged attack and a four-contact Lilgoldied Surge.",95,{"range": 147, "damage": 139},{"startup": 17, "recovery": 25, "damage": 52},{"speed": 11, "shape": "spark", "horizontal": true, "origin": {"forward": 40.0, "height": 113.75}},[13, 25, 37, 49],{"range": 705, "damage": 83, "push": 4},1),
 bitcoind1rk:kit("SKIRMISH","BITCOIN SURGE","Guarded footwork, a arrow ranged attack and a four-contact Bitcoin Surge.",96,{"range": 148, "damage": 140},{"startup": 18, "recovery": 26, "damage": 53},{"speed": 12, "shape": "arrow", "horizontal": true, "origin": {"forward": 45.0, "height": 98.75}},[14, 26, 38, 50],{"range": 708, "damage": 84, "push": 4},1),
 felixsprotoarc:kit("ZONING","FELIX SURGE","Guarded footwork, a needle ranged attack and a four-contact Felix Surge.",97,{"range": 149, "damage": 141},{"startup": 19, "recovery": 27, "damage": 54},{"speed": 13, "shape": "needle", "horizontal": true, "origin": {"forward": 52.5, "height": 85.0}},[15, 27, 39, 51],{"range": 711, "damage": 85, "push": 4},1),
 onememeaday:kit("PRESSURE","1 SURGE","Guarded footwork, a ring ranged attack and a four-contact 1 Surge.",86,{"range": 150, "damage": 142},{"startup": 14, "recovery": 25, "damage": 55},{"speed": 10, "shape": "ring", "horizontal": true, "origin": {"forward": 53.75, "height": 113.75}},[16, 28, 40, 52],{"range": 714, "damage": 86, "push": 4},1),
 zudi:kit("COUNTER","ZUDI SURGE","Guarded footwork, a drop ranged attack and a four-contact Zudi Surge.",87,{"range": 151, "damage": 143},{"startup": 15, "recovery": 26, "damage": 56},{"speed": 11, "shape": "drop", "horizontal": true, "origin": {"forward": 38.75, "height": 95.0}},[17, 29, 41, 53],{"range": 717, "damage": 87, "push": 4},1),
 forchaneth:kit("SKIRMISH","FORCHAN.ETH SURGE","Guarded footwork, a pixel ranged attack and a four-contact Forchan.Eth Surge.",88,{"range": 152, "damage": 144},{"startup": 16, "recovery": 27, "damage": 57},{"speed": 12, "shape": "pixel", "horizontal": true, "origin": {"forward": 57.5, "height": 100.0}},[13, 25, 37, 49],{"range": 720, "damage": 88, "push": 4},1),
 theo:kit(
    'LASER', 'TWIN FLASH', 'Twin chest lasers, guarded footwork and a four-contact Twin Flash.',
    91, {range:148,damage:110}, twinLaserBolt,
    {...twinLaserShot,origin:{forward:58.75,height:112.5}},
    [14,26,38,50], {range:650,damage:91,push:4}, 1,
 ),
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
// Entrance, defeat and ranged-action timing per fighter (generated by the identity-actions batch).
export const CHARACTER_ACTIONS = characterActions;
export const SIGNATURE_PROJECTILES:Partial<Record<FighterId,string>> = signatureProjectiles;
// Hand-authored powers that postdate the identity-actions batch. That batch was
// computed from an older snapshot and must not replace them.
export const AUTHORED_PROJECTILES=new Set<FighterId>(['sproto1601']); // yellow 8: docs/1601-YELLOW-EIGHT-QA.md
/** True when a fighter keeps its hand-authored throw (projectile and cast animation) over the batch ranged clip. */
export const hasAuthoredProjectile=(id:FighterId)=>AUTHORED_PROJECTILES.has(id);
for(const [id,shape]of Object.entries(SIGNATURE_PROJECTILES))if(!AUTHORED_PROJECTILES.has(id as FighterId))COMBAT_STYLES[id as FighterId].projectile.shape=shape!;
/* CHARACTER ACTIONS END */
export type AttackAim = 'level' | 'up' | 'upForward' | 'down';
export type ThrowDirection = 'forward' | 'back' | 'up' | 'down';
export const THROW_HOLD_FRAMES=12, THROW_RECOVERY_FRAMES=18;
export const THROW_CATCH_FRAMES=4, BACK_THROW_LIFT_FRAMES=6, KNOCKDOWN_FRAMES=12, GETUP_FRAMES=6;
export interface HitReaction { kind:'recoil'|'launch'|'knockdown'; phase:'flight'|'down'|'rise'; t:number; direction:number; }
export interface ThrowState {
    attacker:number; victim:number; phase:'hold'|'release'; t:number; direction:ThrowDirection; facing:number;
    startAttackerX:number; startVictimX:number; startVictimY:number;
    gripAttackerX:number; gripVictimX:number; gripVictimY:number;
}
/** Authored gameplay grip geometry in world pixels, independent of image loading.
 * Matched to the installed reaching-hand / hit-torso anchors by contract tests. */
export const THROW_GRIPS:Record<FighterId,{hand:[number,number];torso:[number,number]}> = {
/* NOV03 LATE GRIPS BEGIN */
    "sprotopia": {"hand": [97.5, -111.25], "torso": [0.0, -62.5]},
    "lestrange": {"hand": [92.5, -92.5], "torso": [0.0, -61.25]},
    "cryptobartender": {"hand": [92.5, -108.75], "torso": [0.0, -67.5]},
    "razz": {"hand": [100.0, -98.75], "torso": [0.0, -63.75]},
    "laserbach": {"hand": [103.75, -87.5], "torso": [0.0, -60.0]},
    "freedfrida": {"hand": [101.25, -87.5], "torso": [0.0, -65.0]},
    "contresens": {"hand": [67.5, -101.25], "torso": [0.0, -60.0]},
    "sprotomidnightfx": {"hand": [110.0, -93.75], "torso": [0.0, -62.5]},
    "mildtacos": {"hand": [91.25, -95.0], "torso": [0.0, -62.5]},
    "sprotosurvivor": {"hand": [110.0, -95.0], "torso": [0.0, -63.75]},
    "d86": {"hand": [103.75, -97.5], "torso": [0.0, -68.75]},
    "cantankerous": {"hand": [83.75, -115.0], "torso": [0.0, -70.0]},
    "autistophrenicsprotagonist": {"hand": [67.5, -101.25], "torso": [0.0, -61.25]},
    "sprotolg": {"hand": [80.0, -102.5], "torso": [0.0, -61.25]},
    "kerrieanne": {"hand": [90.0, -83.75], "torso": [0.0, -61.25]},
    "yusuf": {"hand": [93.75, -93.75], "torso": [0.0, -65.0]},
    "bobdobbs": {"hand": [101.25, -103.75], "torso": [0.0, -65.0]},
    "gluttony": {"hand": [102.5, -100.0], "torso": [0.0, -66.25]},
    "slakesly": {"hand": [83.75, -113.75], "torso": [0.0, -62.5]},
    "jameskaminski": {"hand": [87.5, -97.5], "torso": [0.0, -62.5]},
    "86gwei": {"hand": [92.5, -100.0], "torso": [0.0, -60.0]},
    "sidelinereferee": {"hand": [110.0, -88.75], "torso": [0.0, -65.0]},
    "zebracorn": {"hand": [86.25, -100.0], "torso": [0.0, -66.25]},
    "corn": {"hand": [87.5, -93.75], "torso": [0.0, -65.0]},
    "zakarum": {"hand": [103.75, -95.0], "torso": [0.0, -62.5]},
    "bgbadger": {"hand": [90.0, -100.0], "torso": [0.0, -58.75]},
/* NOV03 LATE GRIPS END */
/* FINAL INTAKE GRIPS BEGIN */
    tradertimmy: {"hand":[91.25,-108.75],"torso":[0.0,-60.0]},
    durlan: {"hand":[80.0,-111.25],"torso":[0.0,-67.5]},
    dollarbitcoin: {"hand":[80.0,-98.75],"torso":[0.0,-65.0]},
    lowernipple: {"hand":[87.5,-93.75],"torso":[0.0,-57.5]},
    obamasega420: {"hand":[95.0,-82.5],"torso":[0.0,-60.0]},
    bigal: {"hand":[82.5,-97.5],"torso":[0.0,-60.0]},
    cryptorizzler: {"hand":[88.75,-93.75],"torso":[0.0,-63.75]},
    cryptomonger: {"hand":[85.0,-96.25],"torso":[0.0,-60.0]},
    teahupoo: {"hand":[107.5,-98.75],"torso":[0.0,-62.5]},
    homosproto: {"hand":[93.75,-87.5],"torso":[0.0,-60.0]},
    pars: {"hand":[98.75,-90.0],"torso":[0.0,-62.5]},
    accidentallyrich: {"hand":[80.0,-103.75],"torso":[0.0,-60.0]},
    np: {"hand":[82.5,-93.75],"torso":[0.0,-60.0]},
    slabcorn: {"hand":[75.0,-100.0],"torso":[0.0,-60.0]},
/* FINAL INTAKE GRIPS END */
/* NAMED INTAKE NOV03 GRIPS BEGIN */
    frej: {"hand":[77.5,-108.75],"torso":[0.0,-60.0]},
    crippledlover: {"hand":[113.75,-103.75],"torso":[0.0,-62.5]},
    pilgrim: {"hand":[73.75,-91.25],"torso":[0.0,-60.0]},
    usedtowels: {"hand":[95.0,-101.25],"torso":[0.0,-63.75]},
    drzmoody: {"hand":[78.75,-111.25],"torso":[0.0,-71.25]},
    cam: {"hand":[85.0,-102.5],"torso":[0.0,-67.5]},
    croy: {"hand":[105.0,-102.5],"torso":[0.0,-62.5]},
    stonkyleg69: {"hand":[90.0,-100.0],"torso":[0.0,-63.75]},
    janitor: {"hand":[92.5,-103.75],"torso":[0.0,-62.5]},
    indiapolice: {"hand":[105.0,-96.25],"torso":[0.0,-62.5]},
    veryseriousinvestor: {"hand":[73.75,-103.75],"torso":[0.0,-61.25]},
    agentsproto: {"hand":[130.0,-107.5],"torso":[0.0,-67.5]},
    glow: {"hand":[97.5,-76.25],"torso":[0.0,-60.0]},
    tingsmol: {"hand":[97.5,-87.5],"torso":[0.0,-60.0]},
    johnson: {"hand":[101.25,-91.25],"torso":[0.0,-61.25]},
    loqi: {"hand":[81.25,-113.75],"torso":[0.0,-63.75]},
    marfrog: {"hand":[76.25,-105.0],"torso":[0.0,-67.5]},
    familywagon: {"hand":[92.5,-93.75],"torso":[0.0,-60.0]},
    otorps: {"hand":[82.5,-105.0],"torso":[0.0,-63.75]},
    berserk: {"hand":[108.75,-101.25],"torso":[0.0,-63.75]},
    crumpleii: {"hand":[92.5,-87.5],"torso":[0.0,-65.0]},
    feistyboi: {"hand":[82.5,-96.25],"torso":[0.0,-61.25]},
    isaac: {"hand":[100.0,-110.0],"torso":[0.0,-67.5]},
    mikemike: {"hand":[80.0,-100.0],"torso":[0.0,-61.25]},
    godsson: {"hand":[97.5,-91.25],"torso":[0.0,-65.0]},
/* NAMED INTAKE NOV03 GRIPS END */
/* NOV03 NINE GRIPS BEGIN */
    "nomis": {"hand": [85.0, -108.75], "torso": [0.0, -62.5]},
    "clobrwn": {"hand": [71.25, -111.25], "torso": [0.0, -66.25]},
    "thesprotowholivedeth": {"hand": [77.5, -108.75], "torso": [0.0, -65.0]},
    "sirbitcoin": {"hand": [91.25, -96.25], "torso": [0.0, -65.0]},
    "saburdo": {"hand": [93.75, -98.75], "torso": [0.0, -61.25]},
    "hermionemichelleamyrose": {"hand": [85.0, -102.5], "torso": [0.0, -65.0]},
    "pongohpos10i": {"hand": [76.25, -111.25], "torso": [0.0, -61.25]},
    "julian": {"hand": [106.25, -103.75], "torso": [0.0, -65.0]},
/* NOV03 NINE GRIPS END */
/* SOLANA GRIPS BEGIN */
solanadelray:{"hand": [77.05, -90.85], "torso": [0.0, -56.349999999999994]},
/* SOLANA GRIPS END */


/* MIDDAY GRIPS BEGIN */
reverend:{"hand": [76.25, -102.5], "torso": [0.0, -63.75]},
zepump:{"hand": [75.0, -117.5], "torso": [0.0, -67.5]},
sprotopotamus:{"hand": [102.5, -102.5], "torso": [0.0, -66.25]},
willuminati:{"hand": [96.25, -92.5], "torso": [0.0, -65.0]},
pirate:{"hand": [70.0, -105.0], "torso": [0.0, -61.25]},
prim:{"hand": [115.0, -88.75], "torso": [0.0, -67.5]},
benjamin:{"hand": [86.25, -91.25], "torso": [0.0, -65.0]},
maxbiggums:{"hand": [111.25, -95.0], "torso": [0.0, -68.75]},
xav:{"hand": [96.25, -105.0], "torso": [0.0, -63.75]},
emix:{"hand": [87.5, -105.0], "torso": [0.0, -62.5]},
peterpan:{"hand": [92.5, -98.75], "torso": [0.0, -65.0]},
anni:{"hand": [122.375, -104.5], "torso": [0.0, -68.75]},
pinewaffle:{"hand": [108.75, -106.25], "torso": [0.0, -65.0]},
rainman:{"hand": [101.25, -91.25], "torso": [0.0, -65.0]},
wifebeater:{"hand": [86.25, -105.0], "torso": [0.0, -65.0]},
fiatfudder:{"hand": [121.25, -93.75], "torso": [0.0, -65.0]},
moonshiller:{"hand": [111.25, -121.25], "torso": [0.0, -65.0]},
godether:{"hand": [110.0, -93.75], "torso": [0.0, -57.5]},
aleksander:{"hand": [93.75, -92.5], "torso": [0.0, -67.5]},
cyberviber:{"hand": [107.5, -100.0], "torso": [0.0, -65.0]},
realityarchitect:{"hand": [95.0, -96.25], "torso": [0.0, -65.0]},
mrgoldrobe:{"hand": [86.25, -100.0], "torso": [0.0, -62.5]},
/* MIDDAY GRIPS END */





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
sproto1625:{"hand": [76.25, -111.25], "torso": [0.0, -66.25]},
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
/* SATOSHI GRIP BEGIN */
satoshi:{"hand": [95.0, -108.75], "torso": [0.0, -65.0]},
/* SATOSHI GRIP END */
/* XALT GRIP BEGIN */
xalt:{"hand": [75.0, -98.75], "torso": [0.0, -60.0]},
/* XALT GRIP END */
/* POTOCAICAI GRIP BEGIN */
potocaicai:{"hand": [131.25, -91.25], "torso": [0.0, -62.5]},
/* POTOCAICAI GRIP END */
/* SPROTETH GRIP BEGIN */
sproteth:{"hand": [77.5, -105.0], "torso": [0.0, -61.25]},
/* SPROTETH GRIP END */
/* DANOCRYPTO GRIP BEGIN */
danocrypto:{"hand": [100.0, -98.75], "torso": [0.0, -65.0]},
/* DANOCRYPTO GRIP END */
/* BUDDHASHADOW GRIP BEGIN */
buddhashadow:{"hand": [70.0, -97.5], "torso": [0.0, -60.0]},
/* BUDDHASHADOW GRIP END */
stoto: {"hand": [83.75, -95.0], "torso": [0.0, -61.25]},
herbpowell: {"hand": [106.25, -110.0], "torso": [0.0, -67.5]},
sirdidit: {"hand": [86.25, -108.75], "torso": [0.0, -66.25]},
ceo: {"hand": [115.0, -97.5], "torso": [0.0, -62.5]},
ciphersproto: {"hand": [80.0, -108.75], "torso": [0.0, -61.25]},
sprotocius: {"hand": [86.25, -110.0], "torso": [0.0, -63.75]},
rmacpdx: {"hand": [85.0, -102.5], "torso": [0.0, -65.0]},
azkarah: {"hand": [100.0, -102.5], "torso": [0.0, -65.0]},
mrhorsemeat: {"hand": [96.25, -102.5], "torso": [0.0, -65.0]},
wyrmblvnt: {"hand": [93.75, -101.25], "torso": [0.0, -63.75]},
aktree: {"hand": [90.0, -110.0], "torso": [0.0, -63.75]},
fplgremlin: {"hand": [70.0, -110.0], "torso": [0.0, -61.25]},
chrisfowler: {"hand": [110.0, -100.0], "torso": [0.0, -63.75]},
spruto: {"hand": [77.5, -106.25], "torso": [0.0, -65.0]},
ghostsprotocol: {"hand": [100.0, -91.25], "torso": [0.0, -62.5]},
tdeth: {"hand": [102.5, -101.25], "torso": [0.0, -63.75]},
vicoo: {"hand": [108.75, -97.5], "torso": [0.0, -57.5]},
chonky: {"hand": [82.5, -96.25], "torso": [0.0, -57.5]},
degenpress: {"hand": [93.75, -97.5], "torso": [0.0, -62.5]},
giavannykitchens: {"hand": [108.75, -96.25], "torso": [0.0, -63.75]},
seph0x: {"hand": [90.0, -91.25], "torso": [0.0, -62.5]},
rektina: {"hand": [90.0, -90.0], "torso": [0.0, -67.5]},
twinnyneutron: {"hand": [82.5, -103.75], "torso": [0.0, -62.5]},
melo: {"hand": [116.25, -81.25], "torso": [0.0, -53.75]},
kern: {"hand": [106.25, -87.5], "torso": [0.0, -60.0]},
bs9090eth: {"hand": [90.0, -95.0], "torso": [0.0, -58.75]},
renzo: {"hand": [75.0, -101.25], "torso": [0.0, -61.25]},
micsash: {"hand": [75.0, -97.5], "torso": [0.0, -60.0]},
davidcd: {"hand": [82.5, -107.5], "torso": [0.0, -62.5]},
samixsproto: {"hand": [107.5, -96.25], "torso": [0.0, -61.25]},
wireitwell: {"hand": [87.5, -103.75], "torso": [0.0, -62.5]},
cryptoboy: {"hand": [85.0, -93.75], "torso": [0.0, -58.75]},
osho: {"hand": [100.0, -95.0], "torso": [0.0, -63.75]},
pr0lificeth: {"hand": [93.75, -82.5], "torso": [0.0, -60.0]},
bidnehhh: {"hand": [82.5, -88.75], "torso": [0.0, -61.25]},
jayquant: {"hand": [72.5, -98.75], "torso": [0.0, -60.0]},
infinitysplitter: {"hand": [115.0, -91.25], "torso": [0.0, -62.5]},
hdizzy: {"hand": [97.5, -88.75], "torso": [0.0, -60.0]},
cryptoviking420: {"hand": [100.0, -101.25], "torso": [0.0, -67.5]},
sweatpantstrust: {"hand": [85.0, -97.5], "torso": [0.0, -58.75]},
spunow: {"hand": [95.0, -88.75], "torso": [0.0, -61.25]},
sprotomichaelsaylor: {"hand": [97.5, -102.5], "torso": [0.0, -60.0]},
zippy: {"hand": [90.0, -101.25], "torso": [0.0, -65.0]},
lilgoldied: {"hand": [106.25, -98.75], "torso": [0.0, -63.75]},
bitcoind1rk: {"hand": [82.5, -111.25], "torso": [0.0, -63.75]},
felixsprotoarc: {"hand": [105.0, -91.25], "torso": [0.0, -60.0]},
onememeaday: {"hand": [91.25, -112.5], "torso": [0.0, -66.25]},
zudi: {"hand": [91.25, -91.25], "torso": [0.0, -60.0]},
forchaneth: {"hand": [97.5, -86.25], "torso": [0.0, -62.5]},
theo: {"hand": [63.75, -116.25], "torso": [0.0, -63.75]},
"duo":{"hand":[111.25,-75],"torso":[65,-62.5]},"rivet":{"hand":[65.0,-66.25],"torso":[38.5,-63.25]},"vela":{"hand":[76.25,-78.75],"torso":[47.25,-63.45]},"bront":{"hand":[86.25,-73.75],"torso":[79.3,-82.35]},"zephyr":{"hand":[72.5,-68.75],"torso":[50.4,-64.4]},"mox":{"hand": [82.5, -118.75], "torso": [0.0, -65.0]},"rune":{"hand":[53.75,-57.5],"torso":[42.625,-52.25]},"guest07":{"hand":[83.75,-75.0],"torso":[60.45,-72.85]},"guest08":{"hand":[67.5,-70.0],"torso":[44.0,-60.5]},"guest09":{"hand": [72.5, -112.5], "torso": [0.0, -67.5]},"guest10":{"hand": [68.75, -103.75], "torso": [0.0, -58.75]},"guest11":{"hand":[41.25,-68.75],"torso":[35.625,-61.275]},"guest12":{"hand":[50.0,-75.0],"torso":[37.5,-57.5]},"guest13":{"hand":[40.0,-73.75],"torso":[20.0,-61.25]},"guest14":{"hand":[60.0,-62.5],"torso":[37.8,-52.65]},"dumpstar":{"hand":[53.75,-87.5],"torso":[30.8,-74.2]},"crapto":{"hand":[63.75,-86.25],"torso":[37.8,-66.15]},"vamp":{"hand": [71.25, -111.25], "torso": [0.0, -62.5]},"alpha777":{"hand":[43.75,-66.25],"torso":[38.475,-58.425]},"mandela":{"hand":[73.75,-57.5],"torso":[58.0,-60.9]},"bigswole":{"hand":[52.5,-66.25],"torso":[42.0,-57.4]},"nate":{"hand":[66.25,-47.5],"torso":[42.5,-28.75]}};
/** Organic spit follows stance height and always travels horizontally. */
export const HORIZONTAL_SPIT_FIGHTERS:readonly FighterId[] = ['rivet','vela','guest07','guest13','crapto','reverend','zepump','sprotopotamus','willuminati','prim','benjamin','maxbiggums','xav','emix','peterpan','anni','pinewaffle','rainman','wifebeater','fiatfudder','moonshiller','godether','aleksander','cyberviber','realityarchitect','mrgoldrobe','solanadelray'];
export const isHorizontalSpit = (id:FighterId) => HORIZONTAL_SPIT_FIGHTERS.includes(id);
/** Fixed world-side formation: facing changes never teleport the two bodies
 * through one another. These are combat geometry, not render-only offsets. */












/* SPROTOS PAIRS BEGIN */
export const PAIRED_BODY_IDS:Partial<Record<FighterId,readonly string[]>> = {"twinnyneutron": ["twinnyneutron", "twinnyneutron-companion"], "duo": ["duo", "duo-blue"], "sproto282": ["sproto282", "sproto282-companion"], "sproto704": ["sproto704", "sproto704-companion"], "sproto832": ["sproto832", "sproto832-companion"], "sproto1499": ["sproto1499", "sproto1499-companion"], "sproto1625": ["sproto1625", "sproto1625-companion"], "sproto2010": ["sproto2010", "sproto2010-companion"], "sproto2075": ["sproto2075", "sproto2075-companion"], "sproto2210": ["sproto2210", "sproto2210-companion"], "sproto2344": ["sproto2344", "sproto2344-companion"], "sproto3181": ["sproto3181", "sproto3181-companion"], "sproto3224": ["sproto3224", "sproto3224-companion"], "sproto3235": ["sproto3235", "sproto3235-companion"], "gryph": ["gryph", "gryph-companion"], "godmod3d": ["godmod3d", "godmod3d-companion"], "nosmileclown": ["nosmileclown", "nosmileclown-companion"]};
export const BODY_SPACING:Partial<Record<FighterId,number>> = {"twinnyneutron": 136, "sproto282": 144, "sproto704": 144, "sproto832": 144, "sproto1499": 144, "sproto1625": 144, "sproto2010": 144, "sproto2075": 144, "sproto2210": 144, "sproto2344": 144, "sproto3181": 112, "sproto3224": 144, "sproto3235": 144, "gryph": 144, "godmod3d": 144, "nosmileclown": 112};
export const bodyAtlasIds=(id:FighterId):readonly string[]=>PAIRED_BODY_IDS[id]??[id];
export const isPairedFighter=(id:FighterId)=>!!PAIRED_BODY_IDS[id];
export const bodyOffsets=(id:FighterId)=>bodyAtlasIds(id).map((_,i)=>(i-(bodyAtlasIds(id).length-1)/2)*(BODY_SPACING[id]??144));
export const EXPANSION_PAIR_GRIPS:Partial<Record<FighterId,Record<string,{hand:[number,number];torso:[number,number]}>>> = {"twinnyneutron": {"-1": {"hand": [150.5, -103.75], "torso": [68.0, -62.5]}, "1": {"hand": [158.0, -88.75], "torso": [68.0, -58.75]}}, "sproto282": {"-1": {"hand": [165.75, -86.25], "torso": [72.0, -67.5]}, "1": {"hand": [167.0, -105.0], "torso": [72.0, -62.5]}}, "sproto704": {"-1": {"hand": [137.0, -108.75], "torso": [72.0, -66.25]}, "1": {"hand": [157.0, -88.75], "torso": [72.0, -67.5]}}, "sproto832": {"-1": {"hand": [172.0, -96.25], "torso": [72.0, -63.75]}, "1": {"hand": [163.25, -93.75], "torso": [72.0, -60.0]}}, "sproto1499": {"-1": {"hand": [169.5, -92.5], "torso": [72.0, -65.0]}, "1": {"hand": [170.75, -85.0], "torso": [72.0, -63.75]}}, "sproto1625": {"-1": {"hand": [148.25, -111.25], "torso": [72.0, -66.25]}, "1": {"hand": [173.25, -91.25], "torso": [72.0, -58.75]}}, "sproto2010": {"-1": {"hand": [182.0, -95.0], "torso": [72.0, -65.0]}, "1": {"hand": [174.5, -97.5], "torso": [72.0, -62.5]}}, "sproto2075": {"-1": {"hand": [154.5, -112.5], "torso": [72.0, -67.5]}, "1": {"hand": [184.5, -103.75], "torso": [72.0, -67.5]}}, "sproto2210": {"-1": {"hand": [170.75, -90.0], "torso": [72.0, -61.25]}, "1": {"hand": [169.5, -95.0], "torso": [72.0, -57.5]}}, "sproto2344": {"-1": {"hand": [143.25, -93.75], "torso": [72.0, -61.25]}, "1": {"hand": [168.25, -102.5], "torso": [72.0, -60.0]}}, "sproto3181": {"-1": {"hand": [147.25, -103.75], "torso": [56.0, -66.25]}, "1": {"hand": [87.2, -48.0], "torso": [56.0, -29.4]}}, "sproto3224": {"-1": {"hand": [163.25, -103.75], "torso": [72.0, -61.25]}, "1": {"hand": [162.0, -86.25], "torso": [72.0, -60.0]}}, "sproto3235": {"-1": {"hand": [152.0, -105.0], "torso": [72.0, -60.0]}, "1": {"hand": [147.0, -107.5], "torso": [72.0, -62.5]}}, "gryph": {"-1": {"hand": [164.5, -97.5], "torso": [72.0, -58.75]}, "1": {"hand": [173.25, -88.75], "torso": [72.0, -62.5]}}, "godmod3d": {"-1": {"hand": [173.25, -91.25], "torso": [72.0, -68.75]}, "1": {"hand": [154.5, -112.5], "torso": [72.0, -67.5]}}, "nosmileclown": {"-1": {"hand": [168.5, -75.0], "torso": [56.0, -62.5]}, "1": {"hand": [84.05, -42.900000000000006], "torso": [56.0, -25.3]}}};
/* SPROTOS PAIRS END */

export const DUO_SPREAD = 72;
/* SOLANA PAIRS BEGIN */
Object.assign(PAIRED_BODY_IDS,{"solanadelray": ["solanadelray", "solanadelray-companion"]});
Object.assign(BODY_SPACING,{"solanadelray": 136});
Object.assign(EXPANSION_PAIR_GRIPS,{"solanadelray": {"-1": {"hand": [145.05, -90.85], "torso": [68.0, -56.349999999999994]}, "1": {"hand": [178.5, -92.3], "torso": [68.0, -63.7]}}});
/* SOLANA PAIRS END */


/* MIDDAY PAIRS BEGIN */
Object.assign(PAIRED_BODY_IDS,{"zepump": ["zepump", "zepump-companion"], "peterpan": ["peterpan", "peterpan-companion"]});
Object.assign(BODY_SPACING,{"zepump": 132, "peterpan": 136});
Object.assign(EXPANSION_PAIR_GRIPS,{"zepump": {"-1": {"hand": [141.0, -117.5], "torso": [66.0, -67.5]}, "1": {"hand": [151.05, -84.0], "torso": [66.0, -50.400000000000006]}}, "peterpan": {"-1": {"hand": [160.5, -98.75], "torso": [68.0, -65.0]}, "1": {"hand": [148.0, -97.5], "torso": [68.0, -63.75]}}});
/* MIDDAY PAIRS END */

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
export const CROUCH_SPIT_ORIGINS:Partial<Record<FighterId,{forward:number;height:number}>> = {
/* SOLANA CROUCH BEGIN */
solanadelray:{"forward": 113, "height": 62},
/* SOLANA CROUCH END */


/* MIDDAY CROUCH BEGIN */
reverend:{"forward": 45, "height": 62},
zepump:{"forward": 111, "height": 62},
sprotopotamus:{"forward": 45, "height": 62},
willuminati:{"forward": 45, "height": 62},
prim:{"forward": 45, "height": 62},
benjamin:{"forward": 45, "height": 62},
maxbiggums:{"forward": 45, "height": 62},
xav:{"forward": 45, "height": 62},
emix:{"forward": 45, "height": 62},
peterpan:{"forward": 113, "height": 62},
anni:{"forward": 49.5, "height": 68.2},
pinewaffle:{"forward": 45, "height": 62},
rainman:{"forward": 45, "height": 62},
wifebeater:{"forward": 45, "height": 62},
fiatfudder:{"forward": 45, "height": 62},
moonshiller:{"forward": 45, "height": 62},
godether:{"forward": 45, "height": 62},
aleksander:{"forward": 45, "height": 62},
cyberviber:{"forward": 45, "height": 62},
realityarchitect:{"forward": 45, "height": 62},
mrgoldrobe:{"forward": 45, "height": 62},
/* MIDDAY CROUCH END */





    rivet:{forward:44,height:74}, vela:{forward:49,height:85},
    guest07:{forward:65,height:79}, guest13:{forward:30,height:78}, crapto:{forward:39,height:80},
};
export const isCrouchingSpit = (f:Fighter) => isHorizontalSpit(f.id) && f.y>=FLOOR && f.move?.id==='bolt' && f.move.aim==='down';

/** Effective kits are independent of generated intake-list tuning values. */
export const BALANCE_KITS = Object.fromEntries(PLAYABLE_FIGHTERS.map(id=>{
    const style=COMBAT_STYLES[id],balanced=buildBalancedKit(style.role,isPairedFighter(id),style.specialFrames.length,MOVES);
    ROSTER[id].speed=balanced.template.speed;
    ROSTER[id].jump=balanced.template.jump;
    style.lightRange=balanced.moves.light.range;
    style.heavy={...balanced.moves.heavy};
    style.bolt={...balanced.moves.bolt};
    style.projectile.speed=style.projectile.beamLength?0:balanced.projectileSpeed;
    style.specialFrames=[...balanced.specialFrames];
    style.special={...balanced.moves.special};
    return [id,balanced];
})) as Record<FighterId,BalancedKit>;
