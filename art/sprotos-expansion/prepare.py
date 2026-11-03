"""Prepare reference-preserving expansion jobs. Never submits or installs art."""
import hashlib, json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
# Each tuple is a separate visual body. Paired references remain one playable
# selection with two independently animated bodies, as in the existing duo.
IDENTITIES = {
102: ('Blue swept spikes, huge yellow round eyes with black pupils, red round nose and wide toothy red smile, yellow sleeves/arms and black vest with red pendant. Slim yellow legs and black/yellow shoes.',),
215: ('Lavender spiky figure, two protruding large red oval eyes with black pupils, red lips and yellow rounded belly with two dark oval markings. Lavender arms and low legs; no extra character on the belly.',),
282: ('ONLY the RED figure on the LEFT: dark red spikes, yellow half-lidded eyes, dark red broad muzzle, yellow long sleeves and black vest. Exclude the blue figure.', 'ONLY the BLUE figure on the RIGHT: blue spikes, yellow half-lidded eyes, dark red broad muzzle, blue neck/body, yellow arms. Exclude the red figure.'),
313: ('ONLY the LEFT of the two BLUE figures: blue swept spikes, two yellow eyes and red broad muzzle, blue torso and yellow bent arms. Exclude the right figure.', 'ONLY the RIGHT of the two BLUE figures: blue swept spikes, yellow eyes, broad red muzzle, blue torso and yellow bent arms. Exclude the left figure.'),
651: ('Round blue bald head with one oversized white eye and one yellow half-lidded eye, protruding red lips, yellow ear and muzzle accents, blue neck and open red collar/shirt.',),
704: ('ONLY the LARGE BLUE figure on the LEFT: blue pointed ears/head spikes, yellow eyes, wide red smile, black vest and yellow collar/arms. Exclude the smaller figure.', 'ONLY the SMALL figure on the RIGHT: tall blue crown-like spikes, yellow round eyes, red round muzzle, blue torso and black/yellow trim. Exclude the large figure.'),
763: ('Red swept spiky head, white round eyes with black pupils, red broad nose/muzzle, blue neck/torso, yellow arms with red hands. Simple low blue legs and red feet.',),
818: ('Blue asymmetrical face, drooping yellow left eye above broad red muzzle and oversized round white right eye with black pupil. Black coat and yellow pointed collar. Retain asymmetry.',),
831: ('Blue swept spikes, yellow side accents, large white eyes with black pupils, huge red open smile with large square yellow teeth, red high collar/scarf. Blue torso/arms and legs.',),
832: ('ONLY the LARGE BLUE figure on the LEFT: blue pointed ears/spikes, huge yellow eyes, red round muzzle, blue round body and thin blue low legs. Exclude crowned figure.', 'ONLY the SMALL CROWNED figure on the RIGHT: yellow pointed crown touching blue head, large red lips and black torso with yellow belly/arms. Exclude large blue figure.'),
834: ('Slim blue swept spiky figure, white oval eyes, broad red smile and dark round nose, long bare blue neck/body, thin yellow arms and red hands, red feet. Preserve slim form.',),
837: ('Blue cat-like figure with two tall triangular ears, narrow yellow eyes, broad red protruding lips, yellow pointed whiskers on cheeks and yellow curved chest accent. Blue low legs.',),
865: ('Blue humanoid vampire, sharp dark-blue swept hair, half-lidded yellow eyes with red upper lids, sharp red toothy grin with white fangs, bare blue muscular chest/arms. Slim blue legs.',),
943: ('Blue humanoid with huge tall radiating yellow spikes, single visible white side-view eye and red lips, red open cape/shirt around blue chest. Keep yellow hair attached.',),
999: ('Blue swept head with yellow brow and drooping yellow eyes, broad red smile, red torso whose lower belly has two large oval eye markings. Yellow arms/hands. Belly markings are part of one body, not a companion.',),
1011: ('Blue swept spiky head, yellow narrow eyes, dark red broad lips, black torso with yellow collar and red pendant, yellow arms. Red/yellow curled staff held in one hand; attached accessory, never an extra limb.',),
1093: ('Blue swept spikes and blue round head, large yellow eyes, small red nose and broad red smile, yellow torso with broad yellow looping shoulder/arm shapes and black lower vest with red pendant. Keep loops anatomically attached.',),
1187: ('Round bald blue head with three forehead wrinkles, yellow half-lidded eyes and broad red lips, huge yellow spiked crest behind the head, red and yellow high collar. Blue arms and low legs.',),
1335: ('ONE dark blue round spiky monster with four yellow eyes across its brow, enormous black open mouth and red lips, scattered yellow spots and protrusions on blue belly. Two arms and two low legs; do not turn spots into more bodies.',),
1345: ('Asymmetrical blue head with long sideways ORANGE spike fan on left, huge yellow eyes, red mouth and large white teeth, yellow torso/arms and small red neck pendant. Orange spikes stay on head.',),
1414: ('Blue swept spiky head, yellow half-lidded eyes, red eyelids and broad red smile, long thin bare blue neck/torso with yellow round belly accents. Thin blue arms and low legs.',),
1477: ('Blue spiky head, large yellow eyes, raised yellow brow, broad red smile with small white triangular teeth, blue bare torso, yellow eye-like chest markings and small yellow object in hand. Two arms, two legs.',),
1499: ('ONLY the LEFT figure: blue wavy head, yellow outlined rectangular eyes, open red mouth with two white square teeth, yellow torso/arms and blue briefs/low legs. Exclude right figure.', 'ONLY the RIGHT figure: blue wavy head, yellow eyes, red broad protruding lips, long blue body with red oval chest mark, yellow arms and low blue legs. Exclude left figure.'),
1601: ('Dark blue broad spiky head, yellow narrow eyes and red thin lips, three large yellow round figure-eight markings across blue belly, black waistband and yellow/red accents. Markings are body decoration.',),
1625: ('ONLY the SMALL LEFT figure: yellow spiky head, yellow eyes, broad red lips, blue lower body/garment. Exclude large blue figure.', 'ONLY the LARGE RIGHT figure: bright blue swept spikes, yellow round eyes and huge red lips, blue torso with red and yellow collar circles, red/yellow sleeve stripes. Exclude yellow figure.'),
1668: ('Yellow swept spiky head, round yellow eyes with black pupils and yellow brow, broad red lips, thin yellow arms and black vest with small yellow chest symbol. Yellow low legs and black shoes.',),
1815: ('Slim blue humanoid with swept blue-and-yellow spikes, huge white eyes and red lids, red smiling thin mouth and small white teeth, bare blue slender torso/arms, simple red trunks. Blue low legs.',),
1870: ('ONLY the LARGE LEFT figure: red and blue swept head, yellow forehead and narrow yellow eyes, yellow muzzle/chest, blue/red collar. Exclude the smaller figure.', 'ONLY the SMALL LOWER RIGHT figure: blue swept head, two large round yellow eyes and red muzzle, small blue torso with yellow belly. Exclude the large figure.'),
2010: ('ONLY the RED LEFT figure: red rounded head with huge yellow triangular top spikes, yellow round eyes, wide red mouth with square white teeth, long yellow torso. Exclude blue figure.', 'ONLY the BLUE RIGHT figure: blue round hood-like head, white oval eyes and red broad lips, blue torso and yellow bow-like chest shapes. Exclude red figure.'),
2075: ('ONLY the SMALL BACK LEFT figure: blue head with yellow spiky crest, red lips and red/yellow collar, black vest. Exclude the large front figure.', 'ONLY the LARGE FRONT RIGHT figure: round blue head with small upper spikes, huge single oval yellow visible eye, large broad blue muzzle with red smile, blue torso and yellow belly. Exclude back figure.'),
2101: ('Blue swept spiky head, huge yellow round eyes, broad red toothy smile with square yellow teeth, yellow pointed collar and black vest with red tie/pendant. Yellow arms and low legs.',),
2177: ('Blue-violet spiky head, yellow eyes, black round nose, broad yellow smiling muzzle, black torso and large white collar. Blue-violet arms/legs and yellow hands/feet.',),
2210: ('ONLY the LARGE LEFT figure: blue swept head, huge yellow eyes and red round nose/muzzle, yellow torso and arms. Exclude slim right figure.', 'ONLY the SLIM RIGHT figure: blue swept head, yellow visible eye and small red nose/lips, long slim blue body and limbs. Exclude large left figure.'),
2322: ('Pale mint swept spiky head, huge yellow circular eyes and broad red smile, yellow pointed collar, red sleeves and pale blue torso with paired oval chest markings. Simple mint/blue low legs.',),
2344: ('ONLY the BACK LEFT figure: round blue head with yellow half-lidded eyes and broad red lips, red torso and arms. Exclude pointed front figure.', 'ONLY the FRONT RIGHT figure: dark blue elongated head with red pointed top, yellow half-lidded eyes, large red nose and open red mouth with white teeth. Long blue body. Exclude back figure.'),
2381: ('Blue swept spiky head with tiny pointed ears, very large yellow eyes and black pupils, massive yellow smiling muzzle outlined in red, black vest and red/yellow pointed collar. Yellow arms and low legs.',),
2531: ('Blue swept spiky head with yellow stripe/crest behind head, large white half-lidded eyes with black pupils, broad red lips, blue muzzle/chest and red high collar. Blue arms and low legs.',),
2569: ('Blue head with backward yellow spiky fan, huge yellow eyes and red round nose, very broad toothy red smile with square yellow teeth, yellow neck/chest with blue shoulders. Low yellow legs.',),
2616: ('Blue bald wrinkled round head with large round yellow ears, half-lidded yellow eyes, round red nose, yellow muzzle with red lips, yellow and blue torso with coiled red/yellow chest accessory. Keep accessories attached.',),
2789: ('Lavender blue swept spiky head, yellow eyes and broad red lips, lavender blue torso with paired red oval chest marks, yellow hand holding red/yellow twisted staff. Slim lavender low legs.',),
2884: ('Round fuzzy blue head, yellow half-lidded eyes with red outlines, red round protruding nose, broad yellow smiling muzzle with black line, small yellow cap on head, red high collar. Blue arms and low legs.',),
3106: ('Tall red swept head with wrinkled forehead, huge yellow eyes and black pupils, enormous red smile with square white teeth, black vest, yellow star-like pendant and yellow sleeves. Red low legs. Omit the floating background letter.',),
3152: ('Lavender swept spiky head, narrow yellow eyes, broad red lips, dark neck band, lavender torso and yellow hands/feet. Small smoking accessory held near one hand, attached; no floating background splash.',),
3181: ('Large dark blue swept spiky head, narrow red eyes/lids, dark red broad lips, blue torso and yellow sleeves, with small stylized cartoon chest patch. Omit background number bubble and detached background motifs.',),
3215: ('Green swept spiky head with yellow inner ear and brow, sleepy yellow eyes, yellow smiling muzzle bordered by red lips, black vest and yellow collar/arms. Green low legs.',),
3224: ('ONLY the BLUE LEFT figure: blue swept spiky head, yellow narrow eyes and huge red toothy smile with yellow square teeth, blue body and small red bow tie. Exclude yellow/red right figure.', 'ONLY the RIGHT figure: yellow tall pointed head cap, blue face accents, yellow round eyes and broad red lips, yellow torso and arms. Exclude blue left figure.'),
3235: ('ONLY the FRONT LEFT figure: blue swept spiky head, huge yellow eyes and broad red protruding lips, yellow neck/body and blue lower accents. Exclude back figure.', 'ONLY the BACK RIGHT figure: round blue bald head with forehead wrinkles, yellow half-lidded visible eye, small red smile and blue neck/body. Exclude front figure.'),
}

def prepare():
    refs = sorted((HERE/'references').glob('*.png'), key=lambda p:int(p.stem.split('-')[-1]))
    assert len(refs) == len(IDENTITIES) == 47
    data=[]
    for path in refs:
        n=int(path.stem.split('-')[-1]); ident=f'sproto{n}'
        with Image.open(path) as im: size=list(im.size)
        entities=[dict(id=ident if i==0 else ident+'-companion', description=d) for i,d in enumerate(IDENTITIES[n])]
        data.append(dict(id=ident,number=n,name=f'Sproto #{n}',reference=str(path.relative_to(ROOT)),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),size=size,entities=entities,status='awaiting-generation',visualQA='pending'))
    # Preserve the subsequently supplied legless machine when rebuilding the
    # original 47-image catalog. It has its own immutable reference record.
    floating=HERE/'floating-character.json'
    if floating.exists():data.append(json.loads(floating.read_text()))
    (HERE/'inventory.json').write_text(json.dumps(data,indent=2)+'\n')
    print(f'{len(data)} references; {sum(len(d["entities"]) for d in data)} separately animated bodies')

if __name__=='__main__': prepare()
