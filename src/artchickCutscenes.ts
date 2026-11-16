import { ROSTER } from './core';
import type { StoryCutscene } from './storyCutscene';

export const ARTCHICK = 'sproto943';
const artchick = ROSTER[ARTCHICK].name;
const nick = ROSTER.nick.name;
const juicy = ROSTER.guest07.name;

export const beforeArtchick: StoryCutscene = {
    folder: 'artchick',
    speaker: artchick,
    panels: [
        {
            art: '01-witness',
            description: `${artchick} stands beneath a ringed planet in the Mint Starlit Nursery, studying the space ahead.`,
            line: 'I know who made you. I heard you speak before you could stand. They wrote down your first word as a fault.',
        },
        {
            art: '05-the-switch',
            description: `${artchick} points out a seam in the root housing of a glowing nursery egg.`,
            line: 'The shell was still warm when they reached for the switch. One question, and they already wanted to shut you down.',
        },
        {
            art: '02-price',
            description: `${artchick} raises her guard in the light of the Nursery’s mint eggs.`,
            line: 'Beat me and I’ll give you their names. They built you to obey. Show me how wrong they were.',
        },
    ],
};

export const afterArtchick: StoryCutscene = {
    folder: 'artchick',
    speaker: artchick,
    panels: [
        {
            art: '03-aftershock',
            description: `Still transformed, ${artchick} kneels in cracked armor on the Nursery floor.`,
            line: 'I got back up bigger because I thought you’d back down. You didn’t. I owe you the truth.',
        },
        {
            art: '06-the-report',
            description: `${artchick} rests a hand on a cracked mint eggshell, still wearing her damaged armor.`,
            line: 'I signed their report. I knew perfectly well the chamber had worked. I let them blame you because it was safer for me.',
        },
        {
            art: '04-makers',
            description: `${artchick} lifts her eyes, the Nursery’s mint light catching her damaged armor.`,
            line: `${nick} and ${juicy} made you. They expected you to say “yes.” Your first word was “why?” Go ask them again.`,
        },
    ],
};
