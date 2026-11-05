// A fixed measuring stick. Its memory belongs to the harness, not CombatState.
// No production CPU logic is reused, so CPU tuning does not change this opponent.
export const REFERENCE_BOT_VERSION = 'reference-v1-delay18';

export function createReferenceBot(core) {
  const { A, FLOOR, MOVES, getMove, bodySpread, grounded } = core;
  const history = [];
  let lastFrame = -1;
  return (s, slot) => {
    if (s.frame === lastFrame) throw new Error('Reference bot must be called once per simulation frame');
    lastFrame = s.frame;
    const f = s.fighters[slot], opponent = s.fighters[1 - slot];
    history.push({ x:opponent.x, y:opponent.y, input:opponent.input,
      move:opponent.move ? { id:opponent.move.id, t:opponent.move.t, data:getMove(opponent, opponent.move.id) } : null });
    if (history.length > 19) history.shift();
    // An opening observation is available immediately; subsequent changes take 18 frames.
    const p = history[0];
    const toward = p.x < f.x ? A.left : A.right, away = p.x < f.x ? A.right : A.left;
    const gap = Math.max(0, Math.abs(p.x - f.x) - bodySpread(f.id) - bodySpread(opponent.id));
    if (f.stun || f.blockstun || s.throwState?.victim === slot) return 0;
    if (f.move?.id === 'launcher' && f.move.connected && grounded(f)) return A.up | toward;
    // Four-frame decisions plus one-frame button releases produce deliberate presses.
    const movement = gap > 96 ? toward : gap < 72 ? away : 0;
    if (s.frame % 4 !== 0) return movement;
    if (f.move?.connected) {
      const rank = MOVES[f.move.id].rank;
      if (rank === 1) return A.medium;
      if (rank === 2) return A.heavy;
    }
    if (f.move) return 0;
    if (p.move && gap < 200 && p.move.t < p.move.data.startup + p.move.data.active)
      return away | (p.move.data.low ? A.down : 0);
    // Planned guard windows supplement visual reactions to unreactably fast jabs.
    if (gap < 190 && s.frame % 120 >= 40 && s.frame % 120 < 64)
      return away | (p.input & A.down);
    if (p.y < FLOOR - 45 && gap < 155) return A.launcher;
    if (f.pips === 3 && gap < getMove(f, 'special').range) return A.special;
    if (p.move && p.move.t >= p.move.data.startup + p.move.data.active && gap < getMove(f, 'heavy').range) return A.heavy;
    if (gap < getMove(f, 'light').range - 4) return A.light;
    if (gap < getMove(f, 'medium').range - 4) return A.medium;
    if (gap > 240 && s.frame % 100 === 0) return toward | A.bolt;
    if (gap > 280 && s.frame % 120 === 0) return toward | A.dash;
    return movement;
  };
}
