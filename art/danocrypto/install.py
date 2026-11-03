"""Install Dano Crypto only; preserve concurrent roster and artwork changes."""
import hashlib, json, re, shutil
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
IDENT = 'danocrypto'
TAG = 'DANOCRYPTO'

def block(section, text):
    return f'/* {TAG} {section} BEGIN */\n{text}\n/* {TAG} {section} END */\n'

def install():
    info = json.loads((HERE / 'identity.json').read_text())
    parts = {kind: json.loads((HERE / 'processed' / f'{IDENT}-{kind}' / 'metadata.json').read_text()) for kind in ['core', 'walk', 'events', 'identity']}
    cfg = parts['core']
    cfg['walkFrames'] = parts['walk']['frames']
    cfg['clips'] = {**parts['events']['clips'], **parts['identity']['clips']}
    assert len(cfg['frames']) == 32 and len(cfg['walkFrames']) == 8
    assert all(len(cfg['clips'][name]) == n for name, n in [('entrance', 8), ('ranged', 8), ('death', 16)])
    for kind, category in [('core', 'poses'), ('walk', 'walk'), ('events', 'events'), ('identity', 'identity')]:
        src = HERE / 'processed' / f'{IDENT}-{kind}'
        dest = ROOT / 'public/fighters' / category / IDENT
        dest.mkdir(parents=True, exist_ok=True)
        for frame in src.glob('[0-9][0-9].png'): shutil.copy2(frame, dest / frame.name)
    path = ROOT / 'public/fighters/pose-atlas.json'
    manifest = json.loads(path.read_text())
    manifest['fighters'][IDENT] = cfg
    manifest['revision'] = IDENT + '-' + hashlib.sha256(json.dumps(cfg, sort_keys=True).encode()).hexdigest()[:16]
    path.write_text(json.dumps(manifest, indent=2) + '\n')

    path = ROOT / 'src/sim/roster.ts'
    core = path.read_text()
    for section in ['ROSTER', 'KIT', 'GRIP']:
        core = re.sub(r'/\* ' + TAG + ' ' + section + r' BEGIN \*/.*?/\* ' + TAG + ' ' + section + r' END \*/\n', '', core, flags=re.S)
    match = re.search(r'export type FighterId = (.*?);', core)
    if repr(IDENT) not in match[1]: core = core[:match.end()-1] + ' | ' + repr(IDENT) + core[match.end()-1:]
    match = re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;', core)
    if repr(IDENT) not in match[1]:
        at = match.end() - len('] as const;')
        core = core[:at] + ', ' + repr(IDENT) + core[at:]
    policy = core.index('export const isFreePlayAddition =')
    close = core.index('] as readonly FighterId[]', policy)
    if repr(IDENT) not in core[policy:close]: core = core[:close] + ', ' + repr(IDENT) + core[close:]
    roster = dict(name=info['name'], color='#f5dd44', dark='#223aa4', speed=5.5, jump=15.8, partner='rivet', special='DANO SURGE', role='RED EYES', description='Guarded footwork, palm casts and a four-contact Dano Surge.')
    needle = '    duo: { name:'
    assert core.count(needle) == 1
    core = core.replace(needle, block('ROSTER', IDENT + ':' + json.dumps(roster) + ',') + needle, 1)
    # Match the authored palm at release; retained as explicit, serializable data.
    origin = info['palmOrigin']
    kit = ' danocrypto:kit("RED EYES","DANO SURGE","Guarded footwork, a firm side kick and palm-fired pressure, with a four-contact Dano Surge.",89,{range:146,damage:97},{startup:16,recovery:25,damage:59},{speed:12,shape:\'ring\',origin:' + json.dumps(origin) + '},[15,27,39,51],{range:610,damage:79,push:4},1),'
    needle = ' duo:kit('
    assert core.count(needle) == 1
    core = core.replace(needle, block('KIT', kit) + needle, 1)
    grips = {}
    for label, slot in [('hand', 26), ('torso', 24)]:
        anchor = cfg['frames'][slot].get('anchor', cfg['anchor'])
        point = cfg['holdContact'][label]
        grips[label] = [(point[i] - anchor[i]) * cfg['scale'] for i in range(2)]
    at = core.index('"duo":', core.index('export const THROW_GRIPS:'))
    core = core[:at] + block('GRIP', IDENT + ':' + json.dumps(grips) + ',') + core[at:]
    path.write_text(core)

    path = ROOT / 'src/originalPortraits.ts'
    portraits = path.read_text()
    portraits = re.sub(r'/\* ' + TAG + r' PORTRAIT BEGIN \*/.*?/\* ' + TAG + r' PORTRAIT END \*/\n', '', portraits, flags=re.S)
    needle = ' duo:new URL('
    assert portraits.count(needle) == 1
    portraits = portraits.replace(needle, block('PORTRAIT', " danocrypto:new URL('../art/danocrypto/reference.png',import.meta.url).href,") + needle, 1)
    path.write_text(portraits)
    info.update(status='installed-playable', installedFrames=104)
    (HERE / 'identity.json').write_text(json.dumps(info, indent=2) + '\n')
    path = ROOT / 'art/roster-manifest.json'
    roster = json.loads(path.read_text())
    roster = [entry for entry in roster if entry.get('name') != IDENT]
    roster.append(dict(name=IDENT, display_name=info['name'], local_reference=info['reference'], inspected=True, requirement='Reference identity, complete body, guarded walk, entrance8, palm-cast8 and death16.', status='Playable free-play addition; 104 authored drawings. See art/danocrypto/qa.json.'))
    path.write_text(json.dumps(roster, indent=2) + '\n')
    print('Dano Crypto installed with 104 authored drawings and original portrait.')

if __name__ == '__main__': install()
