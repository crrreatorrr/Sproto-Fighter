"""Install the reviewed #2344 revision without rewriting other roster entries."""
import hashlib
import json
import re
import shutil
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
EXPANSION = HERE.parent
ROOT = EXPANSION.parents[1]
IDS = ['sproto2344', 'sproto2344-companion']
KINDS = {'core': 'poses', 'walk': 'walk', 'events': 'events', 'motion': 'motion'}


def install(targets=None, revision='2344-curvy-red-chubby-blue-1'):
    targets = IDS if targets is None else targets
    jobs = json.loads((EXPANSION / 'jobs.json').read_text())
    configs = {}
    count = 0
    for ident in targets:
        pieces = {}
        for kind in KINDS:
            folder = EXPANSION / 'processed' / f'{ident}-{kind}'
            job = next(j for j in reversed(jobs) if j['entity'] == ident and j['kind'] == kind)
            assert job['status'] == 'completed'
            assert job.get('revision') == revision
            assert (folder / 'source-job.txt').read_text().strip() == job['job_id']
            pieces[kind] = json.loads((folder / 'metadata.json').read_text())
            assert len(pieces[kind]['frames']) == (8 if kind == 'walk' else 32)
            for index in range(len(pieces[kind]['frames'])):
                with Image.open(folder / f'{index:02}.png') as image:
                    assert image.mode == 'RGBA' and image.size == (256, 256)
                    alpha = image.getchannel('A')
                    box = alpha.getbbox()
                    assert box and box[0] > 0 and box[1] > 0 and box[2] < 256 and box[3] < 256
                    assert set(alpha.getdata()) <= {0, 255}
                count += 1
        cfg = pieces['core']
        cfg['walkFrames'] = pieces['walk']['frames']
        cfg['clips'] = {**pieces['events']['clips'], **pieces['motion']['clips']}
        configs[ident] = cfg

    path = ROOT / 'public/fighters/pose-atlas.json'
    manifest = json.loads(path.read_text())
    unrelated = {k: v for k, v in manifest['fighters'].items() if k not in targets}
    # Preserve installed actor scales and gait travel; only the drawings change.
    for ident, cfg in configs.items():
        old = manifest['fighters'][ident]
        for key in ['scale', 'walkCycleDistance', 'locomotion']:
            if key in old:
                cfg[key] = old[key]
        for kind, category in KINDS.items():
            source = EXPANSION / 'processed' / f'{ident}-{kind}'
            dest = ROOT / 'public/fighters' / category / ident
            dest.mkdir(parents=True, exist_ok=True)
            for frame in source.glob('[0-9][0-9].png'):
                shutil.copy2(frame, dest / frame.name)
    manifest['fighters'].update(configs)
    digest = hashlib.sha256(json.dumps(configs, sort_keys=True).encode()).hexdigest()[:12]
    manifest['revision'] = 'sproto2344-body-shape-' + digest
    assert unrelated == {k: v for k, v in manifest['fighters'].items() if k not in targets}
    path.write_text(json.dumps(manifest, indent=2) + '\n')

    def grip(cfg, part):
        slot = 26 if part == 'hand' else 24
        anchor = cfg['frames'][slot].get('anchor', cfg['anchor'])
        point = cfg['holdContact'][part]
        return [(point[i] - anchor[i]) * cfg['scale'] for i in range(2)]

    path = ROOT / 'src/sim/roster.ts'
    core = path.read_text()
    grips = {part: grip(configs[IDS[0]], part) for part in ['hand', 'torso']}
    core, n = re.subn(r'^sproto2344:\{.*?\},$', 'sproto2344:' + json.dumps(grips) + ',', core, flags=re.M)
    assert n == 1
    pattern = r'(const EXPANSION_PAIR_GRIPS:[^\n]*? = )(\{[^\n]*\})(;)'
    match = re.search(pattern, core)
    assert match
    pair_grips = json.loads(match[2])
    spacing_match = re.search(r'export const BODY_SPACING:[^\n]*? = (\{[^\n]*\});', core)
    spacing = json.loads(spacing_match[1]).get('sproto2344', 144)
    pair_grips['sproto2344'] = {
        str(face): {
            part: [spacing / 2 + grip(manifest['fighters'][ident], part)[0], grip(manifest['fighters'][ident], part)[1]]
            for part in ['hand', 'torso']
        }
        for face, ident in [(-1, IDS[0]), (1, IDS[1])]
    }
    core = core[:match.start(2)] + json.dumps(pair_grips) + core[match.end(2):]
    path.write_text(core)
    print(f'Installed #2344 only: {count} new frame files, {len(targets)} revised bodies and refreshed facing-specific throw contacts.')


if __name__ == '__main__':
    install()
