"""Install #2531 eyes/spit art and the two requested reference projectiles."""
import hashlib
import json
import re
import shutil
from pathlib import Path
from PIL import Image
from build_power_assets import build_b, build_mini

HERE = Path(__file__).resolve().parent
EXPANSION = HERE.parent
ROOT = EXPANSION.parents[1]


def replace_projectile(core, ident, shot, role, signature):
    pattern = rf'^\s*{ident}:kit\([^\n]+$'
    match = re.search(pattern, core, re.M)
    assert match, ident
    line = match[0]
    start = line.index('{"speed"')
    depth = 0
    for end in range(start, len(line)):
        depth += (line[end] == '{') - (line[end] == '}')
        if depth == 0:
            break
    line = line[:start] + json.dumps(shot) + line[end + 1:]
    line, n = re.subn(r"kit\('[^']*','([^']*)','[^']*',", lambda m: f"kit({role!r},{m[1]!r},{signature!r},", line, count=1)
    assert n == 1, ident
    return core[:match.start()] + line + core[match.end():]


def install():
    jobs = json.loads((EXPANSION / 'jobs.json').read_text())
    pieces = {}
    count = 0
    for kind, category in [('core', 'poses'), ('walk', 'walk'), ('events', 'events')]:
        source = EXPANSION / 'processed' / f'sproto2531-{kind}'
        job = next(j for j in reversed(jobs) if j['entity'] == 'sproto2531' and j['kind'] == kind)
        assert job.get('status') == 'completed' and job.get('revision') == '2531-sharp-eyes-mini-spit-1'
        assert (source / 'source-job.txt').read_text().strip() == job['job_id']
        cfg = json.loads((source / 'metadata.json').read_text())
        assert len(cfg['frames']) == (8 if kind == 'walk' else 32)
        for entry in cfg['frames']:
            path = source / Path(entry['url']).name
            with Image.open(path) as image:
                assert image.size == (256, 256) and image.mode == 'RGBA'
                box = image.getchannel('A').getbbox()
                assert box and 0 < box[0] < box[2] < 256 and 0 < box[1] < box[3] < 256
            count += 1
        pieces[kind] = cfg
    path = ROOT / 'public/fighters/pose-atlas.json'
    manifest = json.loads(path.read_text())
    cfg = {**manifest['fighters']['sproto2531'], **pieces['core']}
    cfg['walkFrames'] = pieces['walk']['frames']
    cfg['clips'] = {**manifest['fighters']['sproto2531'].get('clips', {}), **pieces['events']['clips']}
    for kind, category in [('core', 'poses'), ('walk', 'walk'), ('events', 'events')]:
        source = EXPANSION / 'processed' / f'sproto2531-{kind}'
        dest = ROOT / 'public/fighters' / category / 'sproto2531'
        dest.mkdir(parents=True, exist_ok=True)
        for frame in source.glob('[0-9][0-9].png'):
            shutil.copy2(frame, dest / frame.name)
    manifest['fighters']['sproto2531'] = cfg
    manifest['revision'] = '2531-eyes-spit-' + hashlib.sha256(json.dumps(cfg, sort_keys=True).encode()).hexdigest()[:12]
    path.write_text(json.dumps(manifest, indent=2) + '\n')

    inventory = json.loads((EXPANSION / 'inventory.json').read_text())
    refs = {r['id']: r for r in inventory}
    path = ROOT / 'src/core.ts'
    core = path.read_text()
    definitions = {
        'sproto2531': ({'speed': 9, 'shape': 'miniSproto', 'horizontal': True,
                        'origin': refs['sproto2531']['projectileOrigin']}, 'SPITTER',
                       'Sharp white eyes and red gloves; mouth-spit releases a complete miniature Sproto.'),
        'sproto3106': ({'speed': 10, 'shape': 'referenceB', 'origin': refs['sproto3106']['projectileOrigin']},
                       'THROWER', 'Throws the original yellow B with its tilted serif shape, red accents and black outline.'),
    }
    for ident, (shot, role, signature) in definitions.items():
        core = replace_projectile(core, ident, shot, role, signature)
        match = re.search(rf'^{ident}: (\{{[^\n]+\}}),$', core, re.M)
        assert match
        data = json.loads(match[1])
        data.update(role=role, description=signature)
        core = core[:match.start(1)] + json.dumps(data) + core[match.end(1):]
    grips = {}
    for part, slot in [('hand', 26), ('torso', 24)]:
        anchor = cfg['frames'][slot].get('anchor', cfg['anchor'])
        point = cfg['holdContact'][part]
        grips[part] = [(point[i] - anchor[i]) * cfg['scale'] for i in range(2)]
    core, n = re.subn(r'^sproto2531:\{[^\n]+\},$', 'sproto2531:' + json.dumps(grips) + ',', core, flags=re.M)
    assert n == 1
    path.write_text(core)
    report = {'referenceB': build_b(), 'miniSproto': build_mini(), 'frameFiles': count,
              'origins': {key: refs[key]['projectileOrigin'] for key in definitions}}
    (HERE / 'power-assets.json').write_text(json.dumps(report, indent=2) + '\n')
    print(f'Installed {count} #2531 frames and both reference-derived projectile assets.')


if __name__ == '__main__':
    install()
