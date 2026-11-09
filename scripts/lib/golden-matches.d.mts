// Types for golden-matches.mjs, so tests/golden-state-hashes.test.ts can import it.
export interface CpuMatchSpec { id: string; p1: string; p2: string; skills: [number, number]; seeds: [number, number]; maxFrames: number; matchDepth?: boolean }
export interface CpuMatchResult {
  id: string; frames: number; simFrame: number; winner: number | null; hp: number[];
  inputHash: number; finalHash: number; hashes: number[];
}
export interface Goldens {
  version: number;
  scenario: { stats: Record<string, number>; results: { matchup: string; hashes: number[] }[] };
  cpu: CpuMatchResult[];
}
export const GOLDEN_VERSION: number;
export const CPU_CHECK_EVERY: number;
export const CPU_MATCHES: CpuMatchSpec[];
export function runCpuMatch(core: unknown, spec: CpuMatchSpec): CpuMatchResult;
export function computeGoldens(core: unknown): Goldens;
