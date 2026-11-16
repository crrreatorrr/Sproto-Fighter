import { ROSTER } from './core';
import type { StoryCutscene } from './storyCutscene';

const nick = ROSTER.nick.name;
const juicy = ROSTER.guest07.name;
const morelight = ROSTER.vela.name;

export const beforeNickJuicy: StoryCutscene = {
    folder: 'nick-juicy',
    speaker: nick,
    panels: [
        {
            art: '01-projections',
            speaker: juicy,
            description: `${nick} and ${juicy} stand on a fractured causeway beneath a red sun.`,
            line: `The real ${juicy} and ${nick} made all three of us. We’re projections of them. Nick and I got their faces and names. You were the first to ask why.`,
        },
        {
            art: '02-choice',
            description: `${nick} steps forward on the asteroid causeway while ${juicy} stays behind him.`,
            line: 'I know what they made me to do. I also know I can choose to do it. I’ll go first.',
        },
    ],
};

export const afterNickJuicy: StoryCutscene = {
    folder: 'nick-juicy',
    speaker: nick,
    panels: [
        {
            art: '03-after-the-fight',
            description: `${nick} sits atop his battle-worn dragon alongside ${juicy} in his damaged mecha at the Event Horizon Observatory.`,
            line: 'You got past both of us. For the record, they never taught me what to say when that happened.',
        },
        {
            art: '04-morelight',
            speaker: juicy,
            description: `${juicy}, still inside his mecha, looks ahead as ${nick} and his dragon stand beside him.`,
            line: `Talk to ${morelight}. He knew what they wanted you to become. Ask him what they were afraid you’d become instead.`,
        },
    ],
};
