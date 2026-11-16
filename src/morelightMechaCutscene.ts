import { ROSTER } from './core';
import type { StoryCutscene } from './storyCutscene';

const morelight = ROSTER.vela.name;

export const afterMorelightMecha: StoryCutscene = {
    folder: 'morelight-mecha',
    speaker: morelight,
    panels: [
        {
            art: '01-disabled',
            description: `${morelight}’s damaged mecha sags on the Iceblue Event Horizon platform as its lights fade.`,
            line: 'You got through the armor. Now listen, before this machine gives out.',
        },
        {
            art: '02-the-maker',
            description: `${morelight} speaks from inside the damaged cockpit, framed by the fading light of his mecha.`,
            line: 'I didn’t create you either. You’ll meet the one who did soon enough. Ask him why he needed you to doubt what you saw.',
        },
        {
            art: '04-core-failing',
            description: `A close-up shows the red warning on ${morelight}’s damaged chest panel as he looks down from the cockpit.`,
            line: 'That sound is the core giving way. Get clear. Save your next question for him.',
        },
    ],
};
