#!/usr/bin/env python3
"""Replay the inspected shoe-only pixel correction; leave anatomy/alpha intact."""
from pathlib import Path
import hashlib
import json
from PIL import Image
root = Path(__file__).resolve().parent
patch = json.loads((root / 'rune-sweep-foot-patch.json').read_text())
source = root / patch['source']
assert hashlib.sha256(source.read_bytes()).hexdigest() == patch['sha256']
im = Image.open(source).convert('RGBA')
for x, y, rgba in patch['changes']:
    assert rgba[3] == im.getpixel((x, y))[3]
    im.putpixel((x, y), tuple(rgba))
im.save(root / patch['target'])
im.save(root.parents[1] / 'public/fighters/poses/rune/20-sweep.png')
print('Replayed', len(patch['changes']), 'shoe pixels; no alpha or silhouette changes.')
