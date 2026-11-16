import type { StoryCutscene } from './storyCutscene';

export const afterVMU: StoryCutscene = {
    folder: 'vmu-after',
    speaker: 'VMU',
    panels: [
        {
            art: '01-the-silence',
            description: 'A wide view of the Violet Final Threshold shows VMU hovering low over the arena floor beneath the eclipse.',
            line: 'I’m tired. You bore me.',
        },
        {
            art: '02-the-look',
            description: 'A close-up catches VMU’s half-lidded stare, with the gate glowing behind his scuffed blue casing.',
            line: 'You wanted an audience with my maker. I’m done being yours.',
        },
        {
            art: '03-the-gate',
            description: 'Seen from high beside the gate, VMU banks above the gold-inlaid floor beneath the portal’s bright blue rim.',
            line: 'Go on. Bore him instead.',
        },
    ],
};
