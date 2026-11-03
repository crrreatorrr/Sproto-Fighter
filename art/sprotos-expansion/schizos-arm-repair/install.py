"""Install the repaired yellow core poses; retain the blue body and other clips."""
import hashlib
import json
import re
import shutil
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
EXPANSION = HERE.parent
ROOT = EXPANSION.parents[1]
IDENT = 'sproto1625'


def grip(cfg, part):
    slot = 26 if part == 'hand' else 24
    anchor = cfg['frames'][slot].get('anchor', cfg['anchor'])
    point = cfg['holdContact'][part]
    return [(point[i] - anchor[i]) * cfg['scale'] for i in range(2)]


def install():
    jobs = json.loads((EXPANSION / 'jobs.json').read_text())
    job = next(j for j in reversed(jobs) if j['entity'] == IDENT and j['kind'] == 'core')
    assert job.get('status') == 'completed' and job.get('revision') == 'schizos-yellow-arm-1'
    source = EXPANSION / 'processed' / f'{IDENT}-core'
    assert (source / 'source-job.txt').read_text().strip() == job['job_id']
    new = json.loads((source / 'metadata.json').read_text())
    assert len(new['frames']) == 32
    path = ROOT / 'public/fighters/pose-atlas.json'
    manifest = json.loads(path.read_text())
    before = json.loads(json.dumps(manifest['fighters']))
    if not (HERE / 'before-manifest.json').exists():
        (HERE / 'before-manifest.json').write_text(json.dumps({k: before[k] for k in [IDENT, IDENT + '-companion']}, indent=2) + '\n')
    dest = ROOT / 'public/fighters/poses' / IDENT
    for index in range(32):
        frame = source / f'{index:02}.png'
        with Image.open(frame) as image:
            alpha = image.getchannel('A')
            box = alpha.getbbox()
            assert image.mode == 'RGBA' and image.size == (256, 256)
            assert box and 0 < box[0] < box[2] < 256 and 0 < box[1] < box[3] < 256
            assert set(alpha.getdata()) <= {0, 255}
        shutil.copy2(frame, dest / frame.name)
    cfg = {**manifest['fighters'][IDENT], 'frames': new['frames'], 'holdContact': new['holdContact']}
    manifest['fighters'][IDENT] = cfg
    manifest['revision'] = 'schizos-arm-' + hashlib.sha256(json.dumps(cfg, sort_keys=True).encode()).hexdigest()[:12]
    assert all(manifest['fighters'][key] == value for key, value in before.items() if key != IDENT)
    for key in ['walkFrames', 'clips', 'scale', 'walkCycleDistance']:
        assert cfg.get(key) == before[IDENT].get(key)
    path.write_text(json.dumps(manifest, indent=2) + '\n')

    path = ROOT / 'src/sim/roster.ts'
    core = path.read_text()
    core, count = re.subn(r'^sproto1625:\s*\{"hand"[^\n]+\},$', IDENT + ':' + json.dumps({part: grip(cfg, part) for part in ['hand', 'torso']}) + ',', core, flags=re.M)
    assert count == 1
    match = re.search(r'const EXPANSION_PAIR_GRIPS:[^\n]*? = (\{[^\n]*\});', core)
    assert match
    pairs = json.loads(match[1])
    spacing_match = re.search(r'export const BODY_SPACING:[^\n]*? = (\{[^\n]*\});', core)
    spacing = json.loads(spacing_match[1]).get(IDENT, 144)
    pair = pairs[IDENT]
    # Facing left uses the yellow body as the leading hand and torso.
    pair['-1'] = {part: [spacing / 2 + grip(cfg, part)[0], grip(cfg, part)[1]] for part in ['hand', 'torso']}
    core = core[:match.start(1)] + json.dumps(pairs) + core[match.end(1):]
    path.write_text(core)
    print('Installed 32 repaired yellow poses; blue body, gait/event/motion clips and gameplay profiles retained. Refreshed yellow-side throw contacts.')


if __name__ == '__main__':
    install()
