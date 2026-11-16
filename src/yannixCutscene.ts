import { ROSTER } from './core';
import type { StoryCutscene } from './storyCutscene';

const yannix = ROSTER.mox.name;

export const afterYannix: StoryCutscene = {
    folder: 'yannix',
    speaker: yannix,
    panels: [
        {
            art: '01-awake',
            description: `${yannix} kneels at the Drainage floodgate, looking at the dead receiver in his hand.`,
            line: 'You woke me up. Thank you. I could hear myself talking, but I couldn’t stop their words coming out.',
        },
        {
            art: '02-with-you',
            description: `${yannix} braces himself to stand beneath the floodgate lamp, his eyes clear and the receiver still dark.`,
            line: 'They rig the crypto market down here. Prices, bets, even who throws the next punch. The signal kept us fighting while they got paid.',
        },
        {
            art: '03-makers',
            description: `${yannix} watches the water repeat at the floodgate beside a seam in the concrete.`,
            line: 'Look at the water. The same splash, over and over. Somebody built this world to look real. They built us, too. I’m with you. Let’s wake the others and find our makers.',
        },
    ],
};
