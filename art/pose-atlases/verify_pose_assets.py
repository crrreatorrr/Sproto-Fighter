#!/usr/bin/env python3
"""Check installed sprite files and metadata. This is not visual QA."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads((ROOT / 'public/fighters/pose-atlas.json').read_text())
assert manifest['version'] == 1
assert len(manifest['fighters']) == 21
checked = 0
for ident, cfg in manifest['fighters'].items():
    assert len(cfg['frames']) == 32, ident
    assert len(cfg.get('walkFrames', [])) == 8, ident
    for frame in cfg['frames'] + cfg['walkFrames']:
        assert frame['url'].startswith('/fighters/poses/' + ident + '/'), frame
        path = ROOT / 'public' / frame['url'].lstrip('/')
        assert path.is_file(), path
        with Image.open(path) as im:
            assert im.size == (frame.get('width', cfg['width']), frame.get('height', cfg['height'])), path
            assert im.mode == 'RGBA', path
            alpha = im.getchannel('A')
            assert set(alpha.getdata()) <= {0, 255}, (path, 'soft alpha halo')
            box = alpha.getbbox()
            assert box and box[0] > 0 and box[1] > 0 and box[2] < im.width and box[3] < im.height, (path, 'empty or edge-clipped')
            anchor = frame.get('anchor', cfg['anchor'])
            assert 0 <= anchor[0] < im.width and 0 <= anchor[1] < im.height, path
        checked += 1
print(f'PASS: {checked} frame entries / 21 fighters; paths, sizes, anchors, hard alpha and transparent padding. Visual motion is a separate check.')
