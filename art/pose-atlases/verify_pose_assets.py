#!/usr/bin/env python3
"""Check installed sprite files and metadata. This is not visual QA."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads((ROOT / 'public/fighters/pose-atlas.json').read_text())
assert manifest['version'] == 1
assert len(manifest['fighters']) == 23  #22 selectable fighters;duo has two bodies.
checked = 0
for ident, cfg in manifest['fighters'].items():
    assert len(cfg['frames']) == 32, ident
    assert len(cfg.get('walkFrames', [])) == (4 if ident in ('duo','duo-blue') else 8), ident
    sequences=cfg['frames']+cfg['walkFrames']+[frame for clip in cfg.get('clips',{}).values() for frame in clip]
    for frame in sequences:
        assert any(frame['url'].startswith('/fighters/'+category+'/'+ident+'/') for category in ('poses','walk','events')), frame
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
print(f'PASS: {checked} frame entries /23 body atlases for22 fighters; paths, sizes, anchors, hard alpha and transparent padding. Visual motion is a separate check.')
