import { ROSTER } from './core';
import type { StoryCutscene } from './storyCutscene';

const morelight = ROSTER.vela.name;

export const beforeMorelight: StoryCutscene = {
    folder: 'morelight',
    speaker: morelight,
    panels: [
        {
            art: '01-the-horizon',
            description: `${morelight} stands on the stone platform at Iceblue Event Horizon, with the black hole and icy portals behind him.`,
            line: 'You’ve crossed a world built to hide its seams. By now you know a good lie can light up an entire sky.',
        },
        {
            art: '02-the-truth',
            description: `${morelight} opens one hand in the blue glow of the portal as he tells you why the Sprotos were created.`,
            line: 'Sprotos were created to spread truth and reveal the light. Every time one of us speaks plainly, that light reaches someone else.',
        },
        {
            art: '04-stand-your-ground',
            description: `Seen from floor level, ${morelight} raises his fists beneath the tilted portal and the black hole.`,
            line: 'Now show me you can carry that light when someone stands in your way. Keep your eyes open. The first move is mine.',
        },
    ],
};
