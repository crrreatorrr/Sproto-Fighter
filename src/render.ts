import {drawDumpstar} from './dumpstarArt';
import { drawBront } from './brontArt';
import { drawZephyr } from './zephyrArt';
import { drawMox } from './moxArt';
import { drawRune } from './runeArt';
import { drawPlaceholder } from './placeholderArt';
import { drawVela } from './velaArt';
import { drawRivet } from './fighterArt';
import { drawStage } from './stage';
import { FLOOR, ROSTER, type CombatState, type Fighter } from './core';
function text(c: CanvasRenderingContext2D, str: string, x: number, y: number, size = 14, color = '#93a5bd', align: CanvasTextAlign = 'left', weight = 600) { c.fillStyle = color; c.font = `${weight} ${size}px system-ui, sans-serif`; c.textAlign = align; c.fillText(str, x, y); }
function line(c: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, color: string, width = 1) { c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = width; c.stroke(); }
function poly(c: CanvasRenderingContext2D, points: number[][], color: string) { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = color; c.fill(); }
function fighter(c: CanvasRenderingContext2D, f: Fighter, frame: number, ghost = false) {
    if (f.id === 'rivet')
        drawRivet(c, f, frame, ghost);
    else if (f.id === 'vela')
        drawVela(c, f, frame, ghost);
    else if (f.id === 'bront')
        drawBront(c, f, frame, ghost);
    else if (f.id === 'zephyr')
        drawZephyr(c, f, frame, ghost);
    else if (f.id === 'mox')
        drawMox(c, f, frame, ghost);
    else if (f.id === 'rune')
        drawRune(c, f, frame, ghost);
    else if(f.id==='dumpstar')drawDumpstar(c,f,frame,ghost);
    else
        drawPlaceholder(c, f, frame, ghost);
    if (f.blockstun > 0) {
        c.save();
        c.strokeStyle = '#85c8ff';
        c.lineWidth = 3;
        c.globalAlpha = .7;
        c.beginPath();
        c.ellipse(f.x + f.facing * 24, f.y - 60, 34, 64, 0, f.facing === 1 ? -1.5 : 1.65, f.facing === 1 ? 1.5 : 4.65);
        c.stroke();
        c.restore();
    }
}
function health(c: CanvasRenderingContext2D, f: Fighter, right: boolean, mode: string) {
    const x = right ? 765 : 55, width = 460, color = ROSTER[f.id].color;
    text(c, ROSTER[f.id].name, right ? 1225 : 55, 55, 24, '#eaf0f7', right ? 'right' : 'left', 850);
    text(c, (right ? (mode === 'cpu' ? 'CPU / ' : 'DUMMY / ') : 'YOU / ') + ROSTER[f.id].role, right ? 1225 : 55, 74, 10, color, right ? 'right' : 'left');
    c.fillStyle = '#2b3547';
    c.fillRect(x, 88, width, 19);
    c.fillStyle = color;
    const w = width * f.hp / 1000;
    c.fillRect(right ? x + width - w : x, 88, w, 19);
    for (let i = 1; i < 10; i++)
        line(c, x + i * 46, 88, x + i * 46, 107, '#101b2b55');
    text(c, `${f.hp} / 1000`, right ? x : x + width, 126, 10, '#7e92ad', right ? 'left' : 'right');
    for (let i = 0; i < 3; i++) {
        const px = right ? x + width - 34 - i * 41 : x + i * 41;
        c.fillStyle = i < f.pips ? color : '#25354a';
        poly(c, [[px + 5, 120], [px + 34, 120], [px + 29, 130], [px, 130]], c.fillStyle as string);
    }
    text(c, f.pips === 3 ? 'TEAM SPECIAL READY' : 'RELAY CHARGE', right ? x + width : x, 151, 9, f.pips === 3 ? color : '#7088a3', right ? 'right' : 'left');
}
export function render(c: CanvasRenderingContext2D, s: CombatState) {
    drawStage(c, s.frame);
    for (const f of s.fighters) {
        c.fillStyle = '#040b1366';
        c.beginPath();
        c.ellipse(f.x, FLOOR + 5, 53 - Math.min(25, (FLOOR - f.y) / 10), 10, 0, 0, Math.PI * 2);
        c.fill();
    }
    for (const f of s.fighters) {
        if (f.move?.id === 'special') {
            const teammate = { ...f, id: ROSTER[f.id].partner, x: f.x - f.facing * 100, y: FLOOR } as Fighter;
            fighter(c, teammate, s.frame, true);
            c.fillStyle = ROSTER[f.id].color + '18';
            c.fillRect(Math.min(f.x, f.x + f.facing * 600), 180, 600, 398);
        }
    }
    fighter(c, s.fighters[0], s.frame);
    fighter(c, s.fighters[1], s.frame);
    for (const p of s.projectiles) {
        c.save();
        c.translate(p.x, p.y);
        c.scale(Math.sign(p.vx), 1);
        c.shadowColor = ROSTER[s.fighters[p.owner].id].color;
        c.shadowBlur = 20;
        poly(c, [[-30, -11], [17, -7], [31, 0], [17, 7], [-30, 11], [-17, 0]], c.shadowColor);
        c.restore();
    }
    for (const e of s.effects) {
        const life = e.life / e.max;
        c.save();
        c.globalAlpha = life;
        c.translate(e.x, e.y);
        c.strokeStyle = e.color;
        c.fillStyle = e.color;
        const r = (1 - life) * 65 + 10;
        c.lineWidth = 2 + life * 4;
        if (e.kind === 'charge') {
            text(c, '+ RELAY', 0, -(1 - life) * 35, 15, e.color, 'center', 800);
        }
        else if (e.kind === 'dash') {
            for (let i = 0; i < 3; i++)
                line(c, -40, -30 + i * 30, 20, -30 + i * 30, e.color, 2);
        }
        else {
            c.beginPath();
            c.arc(0, 0, r * (e.kind === 'special' ? 2 : 1), 0, Math.PI * 2);
            c.stroke();
            if (e.kind !== 'block')
                for (let i = 0; i < 8; i++) {
                    const a = i * Math.PI / 4;
                    line(c, Math.cos(a) * r * .5, Math.sin(a) * r * .5, Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5, e.color, 3);
                }
        }
        c.restore();
    }
    health(c, s.fighters[0], false, s.mode);
    health(c, s.fighters[1], true, s.mode);
    text(c, s.mode === 'cpu' ? String(Math.ceil(s.clock / 60)).padStart(2, '0') : '∞', 640, 92, 50, '#e1e9f2', 'center', 750);
    text(c, 'ROUND 01', 640, 116, 9, '#7b8fa9', 'center');
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i];
        if (f.combo > 1) {
            const x = i === 0 ? 65 : 1215;
            c.fillStyle = '#17202bd9';
            c.fillRect(i === 0 ? 48 : 1057, 188, 175, 112);
            text(c, String(f.combo).padStart(2, '0'), x, 244, 61, ROSTER[f.id].color, i === 0 ? 'left' : 'right', 900);
            text(c, 'HIT COMBO', x, 266, 12, '#d8e4f0', i === 0 ? 'left' : 'right');
            text(c, f.comboDamage + ' DAMAGE', x, 287, 11, '#7d93ab', i === 0 ? 'left' : 'right');
        }
    }
    if (s.noticeLife > 0) {
        c.globalAlpha = Math.min(1, s.noticeLife / 20);
        c.fillStyle = '#17202bce';
        c.fillRect(390, 176, 500, 32);
        text(c, s.notice, 640, 197, 13, '#c6dfd5', 'center', 750);
        c.globalAlpha = 1;
    }
    c.fillStyle = '#18202cba';
    c.fillRect(425, 678, 430, 25);
    text(c, 'HOLD AWAY: BLOCK  /  DOWN: CROUCH', 640, 694, 9, '#b4c3d3', 'center', 500);
}
