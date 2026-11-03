"""Prepare matching walking, event and identity animation requests."""
import json, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / 'art/sprotos-expansion'))
import make_requests as m

info = json.loads((HERE / 'identity.json').read_text())
base = json.loads((HERE / 'core-request.json').read_text())[0]['params']
core = next(j for j in json.loads((HERE / 'jobs.json').read_text()) if j['kind'] == 'core')
assert core['status'] == 'completed'
entrance = [
    'relaxed broad red smile, both blue hands beside waist',
    'swept blue head turns slightly toward viewer, red eye surrounds remain clear',
    'near blue hand rises toward thick yellow collar',
    'near fingertips adjust yellow collar, far hand rests at hip',
    'near open palm makes a short confident greeting to RIGHT',
    'near hand curls into fist while far fist rises',
    'near foot steps outward and knees settle into guard',
    'balanced two-fist fighting guard, long blue chin and narrow yellow eyes'
]
ranged = [
    'both blue hands coil at chest, eyes focus RIGHT',
    'near elbow draws back while far fist covers red lips',
    'knees lower and torso turns with near palm chambered',
    'weight transfers forward, near palm begins thrust RIGHT',
    'near blue open palm fully extends RIGHT at chest height, far hand guards chin; no projectile',
    'palm stays extended briefly with wrist firm and low hips',
    'near elbow folds back, shoulders return square',
    'both blue fists restored to guard with broad red smile'
]
death = [
    'narrow yellow eyes widen inside red surrounds, broad smile droops',
    'long head tilts back and blue arms spread to balance',
    'near palm touches yellow collar as knees start to wobble',
    'knees buckle, far hand reaches toward floor',
    'hips sink low, head and shoulders sway',
    'seated collapse with feet forward, both hands brace beside hips',
    'roll onto left side, blue head LEFT and red shoes RIGHT',
    'fully side-lying, near elbow briefly props large blue head',
    'supporting elbow folds and large head lowers',
    'blue cheek approaches floor while red lips relax',
    'shoulder settles onto floor, legs extend gently RIGHT',
    'yellow eyes half close inside intact red eye surrounds',
    'blue fingers relax beside yellow collar',
    'tiny final shoulder drop in same side-lying body',
    'eyes close and complete side-lying body becomes still',
    'final completely still side-lying rest, head LEFT feet RIGHT'
]
actions = entrance + ranged + death
identity = 'Exactly 32 complete drawings in a strict FOUR-column EIGHT-row grid. Rows1-2 eight ENTRANCE frames, rows3-4 eight PALM-CAST frames, rows5-8 sixteen DEATH frames. Read left to right then top to bottom. Same single actor. No projectile, text, opponent, floor shadow or effects. Frames24-31 entirely side-lying head LEFT feet RIGHT, never upright/kneeling.\n' + '\n'.join('Row ' + str(row + 1) + ': ' + '; '.join(actions[row*4:row*4+4]) + '.' for row in range(8))
requests = []
for index, kind, poses in [(1, 'walk', m.WALK), (2, 'events', m.EVENTS), (3, 'identity', identity)]:
    params = {**base, 'resolution': '2k' if kind == 'walk' else '4k', 'aspect_ratio': '4:3' if kind == 'walk' else '9:16', 'medias': base['medias'] + [dict(role='image', value=core['job_id'])], 'prompt': m.STYLE + '\nIDENTITY: ' + info['identity'] + '\nImage2 is the reviewed combat sheet: copy its EXACT head size, face, complete outfit and body proportions.\n' + poses + '\n' + info['appearanceRule']}
    req = dict(index=index, entity=info['id'], fighter=info['id'], kind=kind, params=params)
    if kind == 'identity': req.update(ranged=True, deathStart=16, frameCount=32)
    requests.append(req)
(HERE / 'sequence-requests.json').write_text(json.dumps(requests, indent=2) + '\n')
