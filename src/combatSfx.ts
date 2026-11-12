/**
 * Recorded combat clips. Win, lose, round start and the menu sounds are not here:
 * those stay on the synthesised voices (menus use the shared UI click).
 * A light, medium, heavy, shot or special file already contains the impact, so the
 * matching SoundNames share one clip and the fight voices it once.
 */
import type { SoundName } from './audioEvents';

export const COMBAT_SFX_DIR = 'audio/sfx/combat/';
/** Shipped, not played. ko_01 is the K.O. that the fight uses. */
export const KO_ALTERNATE_FILE = 'ko_02.mp3';
/** special_vamp_black_parade_01.mp3 is about 10 dB quieter than the other clips. */
export const VAMP_SPECIAL_GAIN = 10 ** (10 / 20);

type SynthName = 'roundStart' | 'win' | 'lose' | 'menuMove' | 'menuConfirm' | 'menuBack';
type CombatName = Exclude<SoundName, SynthName>;

/** Shared clips. teamSpecial and hitSpecial are the default for a fighter without their own file. */
const SHARED = {
    whooshLight: 'atk_light_01.mp3',
    hitLight: 'atk_light_01.mp3',
    whooshMedium: 'atk_medium_01.mp3',
    hitMedium: 'atk_medium_01.mp3',
    whooshHeavy: 'atk_heavy_01.mp3',
    hitHeavy: 'atk_heavy_01.mp3',
    throw: 'atk_grab_01.mp3',
    shot: 'atk_ranged_01.mp3',
    shotImpact: 'atk_ranged_01.mp3',
    block: 'atk_block_01.mp3',
    justDefend: 'atk_justdefend_01.mp3',
    tech: 'atk_tech_01.mp3',
    dash: 'atk_dash_01.mp3',
    charge: 'atk_charge_01.mp3',
    teamSpecial: 'atk_special_01.mp3',
    hitSpecial: 'atk_special_01.mp3',
    ko: 'ko_01.mp3',
} as const satisfies Record<CombatName, string>;

/** Fighter id to that fighter's team-special recording. Matched from the manifest's character name. */
export const FIGHTER_SPECIAL_FILES: Record<string, string> = {
    rivet: 'special_golden_sproto_crosscurrent_01.mp3',
    vela: 'special_morelight_prism_break_01.mp3',
    bront: 'special_fat_head_dave_fault_line_01.mp3',
    zephyr: 'special_halloween_2008_harvest_moon_01.mp3',
    mox: 'special_yannix_echo_drive_01.mp3',
    rune: 'special_bongraker_night_burst_01.mp3',
    guest07: 'special_juicy_citrus_rush_01.mp3',
    guest08: 'special_yoyo_round_trip_01.mp3',
    guest09: 'special_red_kev_redline_01.mp3',
    guest10: 'special_sprotel_bitcoin_gift_storm_01.mp3',
    guest11: 'special_chode_adoration_heartbreak_01.mp3',
    guest12: 'special_bitcoin_obama_coin_address_01.mp3',
    guest13: 'special_jahon_serpent_coil_01.mp3',
    guest14: 'special_virtuagram_phase_shift_01.mp3',
    dumpstar: 'special_dumpstar_cleanup_crew_01.mp3',
    crapto: 'special_crapto_acid_test_01.mp3',
    vamp: 'special_vamp_black_parade_01.mp3',
    alpha777: 'special_alpha_777_lucky_sevens_01.mp3',
    mandela: 'special_bitcoin_mandela_freedom_chain_01.mp3',
    bigswole: 'special_big_swole_atlas_crash_01.mp3',
    nate: 'special_little_foot_nate_small_steps_01.mp3',
    duo: 'special_candles_double_take_01.mp3',
    nick: 'special_nick_bare_knuckle_rush_01.mp3',
    highsproto: 'special_high_sproto_smoke_signal_01.mp3',
    captain: 'special_yelnacio_globulous_solar_salvo_01.mp3',
    theo: 'special_theo_twin_flash_01.mp3',
    leviosa: 'special_bitcoinium_leviosa_leviosa_lift_01.mp3',
};

const VAMP_SPECIAL_FILE = 'special_vamp_black_parade_01.mp3';

export interface CombatClip { path: string; gain: number }

/** The clip to play, or null when this name stays synthesised. */
export function combatClip(name: SoundName, fighterId?: string): CombatClip | null {
    const shared = (SHARED as Partial<Record<SoundName, string>>)[name];
    if (!shared) return null;
    const own = (name === 'teamSpecial' || name === 'hitSpecial') && fighterId ? FIGHTER_SPECIAL_FILES[fighterId] : undefined;
    const file = own || shared;
    return { path: COMBAT_SFX_DIR + file, gain: file === VAMP_SPECIAL_FILE ? VAMP_SPECIAL_GAIN : 1 };
}

/** Every clip the player preloads. ko_02 is not included. */
export function combatClipPaths(): string[] {
    const paths = new Set<string>();
    for (const file of Object.values(SHARED)) paths.add(COMBAT_SFX_DIR + file);
    for (const file of Object.values(FIGHTER_SPECIAL_FILES)) paths.add(COMBAT_SFX_DIR + file);
    return [...paths].sort();
}
