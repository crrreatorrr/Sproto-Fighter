#!/usr/bin/env python3
"""Pack each fighter body's pose frames into one sprite sheet in a built game.

    python3 scripts/build-sheets.py dist            pack every body (uses all CPU cores)
    python3 scripts/build-sheets.py dist --verify   also decode each sheet and check every
                                                    frame is pixel-identical to its PNG

Runs after `vite build`. For every body file the build emitted under
dist/fighters/pose-atlas/<id>.json, it packs the body's unique frame PNGs
(poses, walk cycle and clips) into dist/fighters/sheets/<id>.webp, lossless
with exact transparent pixels, and adds a `sheet` entry to that body file:

    "sheet": {"url": "/fighters/sheets/<id>.webp?v=<hash>", "cells": {"<frame url>": [x, y]}}

The game then loads one image per body and slices frames from it (one request
instead of 100-140). The individual PNGs stay in dist as the fallback, and the
source repository is unchanged. Requires Pillow with WebP support.
"""
import hashlib
import io
import json
import os
import sys
from multiprocessing import Pool
from pathlib import Path

from PIL import Image

MAX_WIDTH = 4096


def frame_urls(cfg):
    seen = []
    def add(entry):
        url = entry if isinstance(entry, str) else entry.get('url')
        if url and url not in seen:
            seen.append(url)
    for entry in cfg.get('frames', []):
        add(entry)
    for entry in cfg.get('walkFrames') or []:
        add(entry)
    for entries in (cfg.get('clips') or {}).values():
        for entry in entries:
            add(entry)
    return seen


def pack(sizes):
    """Shelf packing: left to right, new row when the width would pass MAX_WIDTH."""
    x = y = row = width = 0
    cells = []
    for w, h in sizes:
        if x + w > MAX_WIDTH:
            x, y, row = 0, y + row, 0
        cells.append((x, y))
        x += w
        row = max(row, h)
        width = max(width, x)
    return cells, width, y + row


def build(args):
    """Pack one body; returns (frames, sheet bytes)."""
    body_file, verify = args
    dist = body_file.parent.parent.parent
    doc = json.loads(body_file.read_text())
    (body_id, cfg), = doc['fighters'].items()
    urls = frame_urls(cfg)
    images = []
    for url in urls:
        with Image.open(dist / url.split('?')[0].lstrip('/')) as im:
            images.append(im.convert('RGBA'))
    cells, width, height = pack([im.size for im in images])
    sheet = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    for im, (x, y) in zip(images, cells):
        sheet.paste(im, (x, y))
    buffer = io.BytesIO()
    sheet.save(buffer, 'WEBP', lossless=True, exact=True, quality=100, method=4)
    data = buffer.getvalue()
    if verify:
        decoded = Image.open(io.BytesIO(data)).convert('RGBA')
        for url, im, (x, y) in zip(urls, images, cells):
            if decoded.crop((x, y, x + im.width, y + im.height)).tobytes() != im.tobytes():
                raise SystemExit(f'{body_id}: {url} differs in the sprite sheet')
    (dist / 'fighters' / 'sheets' / f'{body_id}.webp').write_bytes(data)
    version = hashlib.sha256(data).hexdigest()[:12]
    cfg['sheet'] = {'url': f'/fighters/sheets/{body_id}.webp?v={version}', 'cells': {u: list(c) for u, c in zip(urls, cells)}}
    body_file.write_text(json.dumps(doc, separators=(',', ':')))
    return len(urls), len(data)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 1:
        sys.exit(__doc__)
    dist = Path(args[0])
    bodies = sorted(b for b in (dist / 'fighters' / 'pose-atlas').glob('*.json') if b.name != 'index.json')
    if not bodies:
        sys.exit(f'no split atlas files under {dist}/fighters/pose-atlas (run vite build first)')
    (dist / 'fighters' / 'sheets').mkdir(parents=True, exist_ok=True)
    verify = '--verify' in sys.argv
    with Pool(os.cpu_count() or 1) as pool:
        results = pool.map(build, [(b, verify) for b in bodies])
    frames = sum(r[0] for r in results)
    size = sum(r[1] for r in results)
    print(f'{len(bodies)} sprite sheets, {frames} frames, {size / 1e6:.1f} MB' + (', every frame verified pixel-identical' if verify else ''))


if __name__ == '__main__':
    main()
