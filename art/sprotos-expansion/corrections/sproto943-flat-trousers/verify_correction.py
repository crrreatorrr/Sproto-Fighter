"""Check the installed #943 appearance correction without changing any files."""
import hashlib
import json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
original = json.loads((HERE / 'before-config.json').read_text())
current = json.loads((REPO / 'public/fighters/pose-atlas.json').read_text())['fighters']['sproto943']
visual_keys = {'frames', 'walkFrames', 'clips'}
assert {k: v for k, v in original.items() if k not in visual_keys} == {
    k: v for k, v in current.items() if k not in visual_keys
}, 'Scale, anchors, contact coordinates or other gameplay-facing metadata changed'
assert current['clips'].keys() == original['clips'].keys()
for name, clip in current['clips'].items():
    assert [frame['url'] for frame in clip] == [frame['url'] for frame in original['clips'][name]], f'{name} frame count/order changed'

count = 0
for kind, category, expected in [('core', 'poses', 32), ('walk', 'walk', 8), ('events', 'events', 32)]:
    source = HERE / 'processed' / f'sproto943-{kind}'
    meta = json.loads((source / 'metadata.json').read_text())
    assert len(meta['frames']) == expected
    for index, frame in enumerate(meta['frames']):
        path = REPO / 'public' / frame['url'].lstrip('/')
        assert path == REPO / 'public/fighters' / category / 'sproto943' / f'{index:02}.png'
        assert hashlib.sha256(path.read_bytes()).digest() == hashlib.sha256((source / path.name).read_bytes()).digest()
        with Image.open(path) as im:
            assert im.size == (256, 256) and im.mode == 'RGBA'
            alpha = im.getchannel('A')
            assert set(alpha.getdata()) <= {0, 255}, f'{path.name}: soft alpha'
            bounds = alpha.getbbox()
            assert list(bounds) == frame['bounds'], f'{path.name}: bounds mismatch'
            assert 0 < bounds[0] < bounds[2] < 256 and 0 < bounds[1] < bounds[3] < 256, f'{path.name}: edge clipping'
            assert all(0 <= x < 256 and 0 <= y < 256 for x, y in frame['contactHull'])
        count += 1
    installed = current['frames'] if kind == 'core' else current['walkFrames'] if kind == 'walk' else None
    if installed is not None:
        assert installed == meta['frames']
    else:
        assert current['clips'] == meta['clips']
assert count == 72
print('PASS: 72 installed RGBA frames; hard alpha, exact bounds, no edge clipping, manifest paths and hashes match.')
print('PASS: existing scale, anchors, hold coordinates, gait settings and event frame order/count are unchanged.')
