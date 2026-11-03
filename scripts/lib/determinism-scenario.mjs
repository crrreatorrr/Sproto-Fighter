// Scripted matches whose state checksums must be identical on every JavaScript
// engine. Pure: no clocks, no Math.random, no DOM. Player 1's inputs come from
// a fixed integer generator; player 2 is the built-in CPU.

/** Matchups chosen to cover wave projectiles (rune orbs, guest11 hearts, VAMP),
 * diagonal aimed shots, paired fighters, the yellow 8 and ordinary melee. */
export const MATCHUPS = [
  ['rune', 'guest11'],
  ['vamp', 'duo'],
  ['peterpan', 'mox'],
  ['sproto1601', 'vela'],
  ['bront', 'zephyr'],
];
export const FRAMES = 2400;
export const CHECK_EVERY = 120;

export function runScenario(core) {
  const { A, createState, step, cpuInput, hashState } = core;
  // Fixed menu of inputs, including diagonal aim and throws.
  const moves = [
    A.right, A.left, A.right | A.light, A.medium, A.heavy, A.launcher, A.up | A.right,
    A.bolt, A.bolt | A.up | A.right, A.bolt | A.up | A.left, A.bolt | A.down | A.right,
    A.grab, A.grab | A.up, A.down | A.light, A.dash, A.up, 0,
  ];
  const stats = { waveFrames: 0, diagonalShots: 0, throws: 0 };
  const results = [];
  for (const [p1, p2] of MATCHUPS) {
    const s = createState(p1, 'cpu', p2);
    let seed = 0x9e3779b9;
    const hashes = [];
    let held = 0;
    for (let frame = 0; frame < FRAMES; frame++) {
      // Keep the fight going so every checkpoint sees live combat.
      for (const f of s.fighters) if (f.hp < 300) f.hp = 1000;
      if (s.winner !== null) s.winner = null;
      if (frame % 8 === 0) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        held = moves[seed % moves.length];
      }
      const projectilesBefore = s.projectiles.length;
      step(s, [held, cpuInput(s)]);
      for (const p of s.projectiles) if (p.wave) stats.waveFrames++;
      if (s.projectiles.length > projectilesBefore && s.projectiles.some(p => p.vx && p.vy && p.age === 1)) stats.diagonalShots++;
      if (s.throwState?.phase === 'hold') stats.throws++;
      if ((frame + 1) % CHECK_EVERY === 0) hashes.push(hashState(s));
    }
    results.push({ matchup: `${p1} vs ${p2}`, hashes });
  }
  return { results, stats };
}
