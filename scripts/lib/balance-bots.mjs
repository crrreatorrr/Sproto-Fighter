// Fixed, independent reference controller. This is a reproducible instrument, not a validated human model.
export const REFERENCE_BOT_VERSION = 'reference-v2-persistent-delay18';

export function createReferenceBot(core) {
  const { A, FLOOR, MOVES, getMove, bodySpread, grounded } = core;
  const history = [];
  let lastFrame = -1, held = 0;
  return (s, slot) => {
    if (s.frame === lastFrame) throw new Error('Reference bot must be called once per simulation frame');
    lastFrame = s.frame;
    const f = s.fighters[slot], target = s.fighters[1 - slot];
    history.push({ x:target.x, y:target.y, input:target.input,
      move:target.move ? { id:target.move.id, t:target.move.t, data:getMove(target, target.move.id) } : null });
    if (history.length > 19) history.shift();
    const p = history[0];
    const toward = target.x < f.x ? A.left : A.right, away = target.x < f.x ? A.right : A.left;
    const gap = Math.max(0, Math.abs(target.x - f.x) - bodySpread(f.id) - bodySpread(target.id));
    if (f.stun || f.blockstun) return away | (p.input & A.down);
    if (s.throwState?.victim === slot) return 0;
    if (f.move?.id === 'launcher' && f.move.connected && grounded(f)) return A.up | toward;
    if (f.move) {
      held = 0;
      if (s.frame % 4 === 0 && f.move.connected) {
        const rank = MOVES[f.move.id].rank;
        if (rank === 1) return A.medium;
        if (rank === 2) return A.heavy;
      }
      return 0;
    }
    if (s.frame % 4 !== 0) return held;
    const jabRange = getMove(f, 'light').range - bodySpread(f.id);
    held = gap > jabRange - 6 ? toward : 0;
    if (p.move && gap < 200 && p.move.t < p.move.data.startup + p.move.data.active) {
      held = away | (p.move.data.low ? A.down : 0);
      return held;
    }
    if (gap < 190 && s.frame % 120 >= 40 && s.frame % 120 < 64) {
      held = away | (p.input & A.down);
      return held;
    }
    if (p.y < FLOOR - 45 && gap < 155) { held=0; return A.launcher; }
    if (f.pips === 3) { held=0; return A.special; }
    if (p.move && p.move.t + 18 >= p.move.data.startup + p.move.data.active && gap < getMove(f, 'heavy').range - bodySpread(f.id)) { held=0; return A.heavy; }
    if (gap < jabRange - 4) { held=0; return A.light; }
    if (gap < getMove(f, 'medium').range - bodySpread(f.id) - 4) { held=0; return A.medium; }
    if (gap > 240 && s.frame % 100 === 0) return held | A.bolt;
    if (gap > 280 && s.frame % 120 === 0) return held | A.dash;
    return held;
  };
}

