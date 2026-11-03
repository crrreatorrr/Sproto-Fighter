import { A, FLOOR, getMove, ROSTER, type Fighter } from './core';
/** Explicit generic stand-ins for unillustrated reference slots. Not traced from their references. */
export function drawPlaceholder(c: CanvasRenderingContext2D, f: Fighter, frame: number, ghost = false) {
    const color = ROSTER[f.id].color, air = f.y < FLOOR, crouch = !!(f.input & A.down) && !air && !f.move;
    const move = f.move, m = move ? getMove(f, move.id) : null, active = !!(move && m && move.t >= m.startup && move.t < m.startup + m.active);
    const h = crouch ? 66 : 120, stride = !air && Math.abs(f.vx) > 1 ? Math.sin(Math.floor(frame / 5) * 1.2) * 17 : 0;
    const rect = (x: number, y: number, w: number, height: number, fill: string) => { c.fillStyle = fill; c.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, w, height); };
    const limb = (x: number, y: number, x2: number, y2: number, width: number, fill: string) => { const n = Math.ceil(Math.max(Math.abs(x2 - x), Math.abs(y2 - y)) / 3); for (let i = 0; i <= n; i++)
        rect(x + (x2 - x) * i / n - width / 2, y + (y2 - y) * i / n - width / 2, width, width, fill); };
    c.save();
    c.translate(Math.round(f.x), Math.round(f.y));
    c.scale(f.facing, 1);
    if (ghost)
        c.globalAlpha = .55;
    const skin = f.flash > 0 ? '#ffffff' : color;
    limb(-9, -h * .4, -18 - stride, air ? -15 : -5, 15, '#182334');
    limb(10, -h * .4, 19 + stride, air ? -10 : -5, 15, skin);
    rect(-23, -h + 34, 43, h * .6 - 20, '#182334');
    rect(-19, -h + 37, 35, h * .6 - 27, skin);
    rect(-25, -h, 47, 37, '#111b2a');
    rect(-21, -h + 4, 39, 29, skin);
    rect(-13, -h + 13, 10, 6, '#132034');
    rect(6, -h + 13, 10, 6, '#132034');
    let reach = active && m ? Math.min(m.range, 130) : 30, y = -h + 55;
    if (move?.id === 'launcher' && active) {
        reach = 35;
        y = -h - 25;
    }
    if (move?.id === 'sweep' && active)
        y = -15;
    if (f.blockstun) {
        reach = 24;
        y = -h + 16;
    }
    limb(-18, -h + 42, -29, -h + 73, 12, skin);
    limb(17, -h + 42, reach, y, 14, skin);
    rect(reach - 7, y - 7, 18, 16, skin);
    c.fillStyle = '#101a28';
    c.font = 'bold 14px "Pixelify Sans", monospace';
    c.textAlign = 'center';
    c.save();c.scale(f.facing,1);c.fillText(f.id.slice(-2), 0, -h + 62);c.restore();
    c.restore();
}
export function drawPlaceholderPortrait(c: CanvasRenderingContext2D, w: number, h: number, index: string, color: string) { c.clearRect(0, 0, w, h); c.fillStyle = '#25364b'; c.fillRect(8, 8, w - 16, h - 16); c.fillStyle = color; c.fillRect(w * .2, h * .15, w * .6, h * .42); c.fillRect(w * .15, h * .61, w * .7, h * .32); c.fillStyle = '#122030'; c.fillRect(w * .3, h * .29, 10, 9); c.fillRect(w * .6, h * .29, 10, 9); c.font = 'bold 22px "Pixelify Sans", monospace'; c.textAlign = 'center'; c.fillText(index, w / 2, h * .84); }
