import type { StoryCutscene } from './storyCutscene';

export const beforeVMU: StoryCutscene = {
    folder: 'vmu',
    speaker: 'VMU',
    panels: [
        {
            art: '01-the-guard',
            description: 'VMU hovers over the Violet Final Threshold platform with its enormous blue gate behind him.',
            line: 'Morelight was right to send you. My maker is yours. He built me to guard the way back to him.',
        },
        {
            art: '02-the-creator',
            description: 'The gate’s blue light reflects across VMU’s screen as the violet eclipse burns behind him.',
            line: 'I know where to find THE CREATOR. The gate behind me leads to the room where he writes this world.',
        },
        {
            art: '03-the-last-order',
            description: 'VMU tilts into a fighting stance in front of the gate, his screen glowing against the eclipsed sky.',
            line: 'He gave me one order. Keep you here. If you want to ask him why he made you, get past me.',
        },
    ],
};
