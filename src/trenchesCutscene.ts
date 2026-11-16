import { ROSTER } from './core';
import type { StoryCutscene } from './storyCutscene';

const highSproto = ROSTER.highsproto.name;
const yannix = ROSTER.mox.name;
const collector = ROSTER.sproto102.name;
const dad = ROSTER.sproto1187.name;
const snarf = ROSTER.sproto763.name;

export const trenchesCutscene: StoryCutscene = {
    folder: 'trenches',
    speaker: highSproto,
    panels: [
        {
            art: '01-wake',
            description: `Under a distant skyline, ${highSproto} stands ankle-deep in the flooded trench.`,
            line: 'My hands won’t stop shaking. That feels real. So why can’t I remember how I got down here?',
        },
        {
            art: '02-reflection',
            description: `${highSproto} peers into a puddle. A magenta band cuts across the eyes of his reflection.`,
            line: 'I blinked. The face in the water kept staring. For a second, I thought it was waiting for me to copy it.',
        },
        {
            art: '03-march',
            description: `${yannix}, ${collector}, ${dad}, and ${snarf} march in lockstep past ${highSproto}’s hiding place, their eyes glowing magenta.`,
            line: `${collector}. ${dad}. ${snarf}. Every boot hits the water on the same beat. ${yannix} has a tear on his cheek. He keeps marching.`,
        },
        {
            art: '04-relay',
            description: `A relay sends a magenta signal to ${yannix} and ${collector}. The receiver beside ${highSproto}’s ear glows the same color.`,
            line: 'Those receivers are feeding them orders. Mine’s doing it too. I hear my own voice say, “Fight him.” I never opened my mouth.',
        },
        {
            art: '05-choice',
            description: `${highSproto} holds his disconnected receiver and reaches toward ${yannix}, whose eye still glows magenta.`,
            line: `I pulled mine out. The voice stopped. ${yannix}, I’m taking yours off too. If the signal makes you swing at me, I’ll get close enough to free you.`,
        },
    ],
};
