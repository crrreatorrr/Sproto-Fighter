#!/usr/bin/env python3
"""Pack each fighter body's pose frames into one sprite sheet in a built game.

    python3 scripts/build-sheets.py dist            pack every body (uses all CPU cores)
    python3 scripts/build-sheets.py dist --verify   also decode each sheet and prove every
                                                    frame is unchanged (see below)
    python3 scripts/build-sheets.py dist --strip-frames
                                                    then remove the loose frame PNGs and the
                                                    full manifest from dist (release builds)

Runs after `vite build`. For every body file the build emitted under
dist/fighters/pose-atlas/<id>.json, it packs the body's unique frame PNGs
(poses, walk cycle and clips) into dist/fighters/sheets/<id>.webp, lossless
with exact transparent pixels, and adds a `sheet` entry to that body file:

    "sheet": {"url": "/fighters/sheets/<id>.webp?v=<hash>",
              "cells": {"<frame url>": [x, y, w, h, offsetX, offsetY]}}

Each frame is trimmed to its visible pixels plus PAD transparent pixels (about a
fifth of the 256x256 frame on average), so a body decodes to roughly 5x less
memory. (offsetX, offsetY) is where the trimmed rectangle sat inside the frame.
Only the cell records the trim: every other frame field (anchor, bounds, hull,
holdContact) is left exactly as authored, and the game draws the rectangle back
at its offset. PAD keeps a transparent border wide enough that edge smoothing of
a scaled or rotated draw only ever touches transparent pixels (the smallest
draw scale is 0.55 source px per screen px, needing at least 2), and GUTTER keeps
neighbouring cells from bleeding into each other.

--verify decodes each sheet and checks, for every frame, that the trimmed
rectangle is byte-identical to the same rectangle of the PNG and that every
pixel outside it is fully transparent; and that each body file is unchanged
apart from `sheet` and the revision.

It also writes each body's standing pose (frame 0, full size, lossless and exact)
to dist/fighters/previews/<id>.webp and points the split index's preview at it,
so the selection menu does not fetch loose PNGs.

Without --strip-frames the individual PNGs stay in dist as the fallback (the
game ignores the trim when it draws them). The source repository is unchanged. The revision in the
split index and body files gains the sheets' combined hash, so browsers that
cached an older build fetch the new body files. Requires Pillow with WebP.
"""
import hashlib
import io
import json
import os
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

from PIL import Image

MAX_WIDTH = 4096
MAX_HEIGHT = 4096  # the texture size every supported GPU accepts
MAX_DECODED_MB = 20  # per body once decoded; the largest today is about 16
PAD = 4
GUTTER = 2


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


def trim(im):
    """Visible pixels plus PAD, clamped to the frame: (left, top, right, bottom)."""
    box = im.getchannel('A').getbbox()
    if box is None:  # a fully transparent frame still needs a 1x1 region
        return (0, 0, 1, 1)
    left, top, right, bottom = box
    return (max(0, left - PAD), max(0, top - PAD), min(im.width, right + PAD), min(im.height, bottom + PAD))


def shelf(sizes, limit):
    """Shelf packing, tallest first: left to right, new row when the width would pass limit."""
    order = sorted(range(len(sizes)), key=lambda i: (-sizes[i][1], -sizes[i][0], i))
    x = y = row = width = 0
    cells = [None] * len(sizes)
    for i in order:
        w, h = sizes[i]
        if x and x + w > limit:
            x, y, row = 0, y + row + GUTTER, 0
        cells[i] = (x, y)
        x += w + GUTTER
        row = max(row, h)
        width = max(width, x - GUTTER)
    return cells, width, y + row


def pack(sizes):
    """The smallest sheet over shelf widths 512..MAX_WIDTH that fits MAX_HEIGHT.
    Trimmed frames vary in size, so one fixed width wastes a lot of a sheet."""
    best = None
    for limit in range(512, MAX_WIDTH + 1, 128):
        cells, width, height = shelf(sizes, limit)
        if height <= MAX_HEIGHT and (best is None or width * height < best[1] * best[2]):
            best = (cells, width, height)
    return best or shelf(sizes, MAX_WIDTH)


def without_sheet(cfg):
    return {k: v for k, v in cfg.items() if k != 'sheet'}


def build(args):
    """Pack one body; returns (frames, sheet bytes, frame pixels, sheet pixels, version)."""
    body_file, verify = args
    dist = body_file.parent.parent.parent
    doc = json.loads(body_file.read_text())
    (body_id, cfg), = doc['fighters'].items()
    urls = frame_urls(cfg)
    images = []
    for url in urls:
        with Image.open(dist / url.split('?')[0].lstrip('/')) as im:
            images.append(im.convert('RGBA'))
    crops = [trim(im) for im in images]
    pieces = [im.crop(box) for im, box in zip(images, crops)]
    cells, width, height = pack([p.size for p in pieces])
    if width > MAX_WIDTH or height > MAX_HEIGHT:
        raise SystemExit(f'{body_id}: sprite sheet {width}x{height} exceeds {MAX_WIDTH}x{MAX_HEIGHT}')
    if width * height * 4 > MAX_DECODED_MB * 2**20:
        raise SystemExit(f'{body_id}: sprite sheet decodes to {width * height * 4 / 2**20:.1f} MB (budget {MAX_DECODED_MB} MB)')
    sheet = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    for piece, (x, y) in zip(pieces, cells):
        sheet.paste(piece, (x, y))
    buffer = io.BytesIO()
    sheet.save(buffer, 'WEBP', lossless=True, exact=True, quality=100, method=4)
    data = buffer.getvalue()
    if verify:
        decoded = Image.open(io.BytesIO(data)).convert('RGBA')
        for url, im, box, piece, (x, y) in zip(urls, images, crops, pieces, cells):
            if decoded.crop((x, y, x + piece.width, y + piece.height)).tobytes() != im.crop(box).tobytes():
                raise SystemExit(f'{body_id}: {url} differs in the sprite sheet')
            visible = im.getchannel('A').getbbox()
            if visible and not (box[0] <= visible[0] and box[1] <= visible[1] and visible[2] <= box[2] and visible[3] <= box[3]):
                raise SystemExit(f'{body_id}: {url} trim cuts visible pixels')
        source = json.loads((dist / 'fighters' / 'pose-atlas.json').read_text())['fighters'][body_id]
        if without_sheet(cfg) != source:
            raise SystemExit(f'{body_id}: body file differs from the source manifest')
    (dist / 'fighters' / 'sheets' / f'{body_id}.webp').write_bytes(data)
    version = hashlib.sha256(data).hexdigest()[:12]
    # The selection menu's standing pose: frame 0 at its full size (the game checks
    # the size against the metadata), lossless and exact, so it is the same image.
    standing = cfg['frames'][0]
    standing_url = standing if isinstance(standing, str) else standing['url']
    standing_image = images[urls.index(standing_url)]
    buffer = io.BytesIO()
    standing_image.save(buffer, 'WEBP', lossless=True, exact=True, quality=100, method=6)
    preview = buffer.getvalue()
    if verify and Image.open(io.BytesIO(preview)).convert('RGBA').tobytes() != standing_image.tobytes():
        raise SystemExit(f'{body_id}: standing preview differs from {standing_url}')
    (dist / 'fighters' / 'previews' / f'{body_id}.webp').write_bytes(preview)
    preview_url = f'/fighters/previews/{body_id}.webp?v={hashlib.sha256(preview).hexdigest()[:12]}'
    cfg['sheet'] = {'url': f'/fighters/sheets/{body_id}.webp?v={version}',
                    'cells': {u: [x, y, p.width, p.height, box[0], box[1]] for u, (x, y), p, box in zip(urls, cells, pieces, crops)}}
    body_file.write_text(json.dumps(doc, separators=(',', ':')))
    frame_pixels = sum(im.width * im.height for im in images)
    return len(urls), len(data), frame_pixels, width * height, version, body_id, standing_url, preview_url


def set_revision(path, revision):
    doc = json.loads(path.read_text())
    doc['revision'] = revision
    path.write_text(json.dumps(doc, separators=(',', ':')))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 1:
        sys.exit(__doc__)
    dist = Path(args[0])
    bodies = sorted(b for b in (dist / 'fighters' / 'pose-atlas').glob('*.json') if b.name != 'index.json')
    if not bodies:
        sys.exit(f'no split atlas files under {dist}/fighters/pose-atlas (run vite build first)')
    if '--strip-frames' in sys.argv and all('sheet' in json.loads(b.read_text())['fighters'][b.stem] for b in bodies):
        # Already packed (CI packs, runs the frame comparisons, then strips).
        print(f'already packed; removed {strip_frames(dist)} loose frame files and the full manifest')
        return
    (dist / 'fighters' / 'sheets').mkdir(parents=True, exist_ok=True)
    (dist / 'fighters' / 'previews').mkdir(parents=True, exist_ok=True)
    verify = '--verify' in sys.argv
    with Pool(os.cpu_count() or 1) as pool:
        results = pool.map(build, [(b, verify) for b in bodies])
    frames = sum(r[0] for r in results)
    size = sum(r[1] for r in results)
    before = sum(r[2] for r in results) * 4 / 2**20
    after = sum(r[3] for r in results) * 4 / 2**20
    index = dist / 'fighters' / 'pose-atlas' / 'index.json'
    # Idempotent when rerun on the same dist: replace an earlier sheets suffix.
    revision = (json.loads(index.read_text()).get('revision') or '').split('+sheets-')[0]
    revision += '+sheets-' + hashlib.sha256(''.join(r[4] for r in results).encode()).hexdigest()[:12]
    for path in [index, *bodies]:
        set_revision(path, revision)
    # Point each standing preview in the index at its small WebP copy.
    doc = json.loads(index.read_text())
    for r in results:
        body_id, standing_url, preview_url = r[5], r[6], r[7]
        entry = doc['fighters'][body_id]['preview']
        frame = entry['frame']
        if (frame if isinstance(frame, str) else frame['url']) != standing_url:
            raise SystemExit(f'{body_id}: index preview is not frame 0')
        entry['frame'] = preview_url if isinstance(frame, str) else {**frame, 'url': preview_url}
    index.write_text(json.dumps(doc, separators=(',', ':')))
    previews = sum((dist / 'fighters' / 'previews' / f'{r[5]}.webp').stat().st_size for r in results)
    stripped = strip_frames(dist) if '--strip-frames' in sys.argv else 0
    print(f'{len(bodies)} sprite sheets, {frames} frames, {size / 1e6:.1f} MB; '
          f'decoded {after:.0f} MB instead of {before:.0f} MB ({after / before:.0%})'
          + (', every frame verified unchanged' if verify else '')
          + f'; {len(results)} standing previews, {previews / 1e6:.1f} MB'
          + (f'; removed {stripped} loose frame files and the full manifest' if stripped else ''))


FRAME_DIRS = ['poses', 'events', 'motion', 'identity', 'walk', 'assist']


def strip_frames(dist):
    """Release builds: the game reads only the sheets, the previews and the split atlas
    files, so the loose frame PNGs and the monolithic manifest are removed. Without
    them ?atlas=frames and the per-frame fallback have nothing to load; run checks
    that compare sheets with frames (scripts/sheet-render-qa.mjs) before this."""
    fighters = dist / 'fighters'
    index = json.loads((fighters / 'pose-atlas' / 'index.json').read_text())
    for body_id in index['fighters']:
        cfg = json.loads((fighters / 'pose-atlas' / f'{body_id}.json').read_text())['fighters'][body_id]
        if not cfg.get('sheet') or not (fighters / 'previews' / f'{body_id}.webp').exists():
            raise SystemExit(f'{body_id}: no sprite sheet or preview; not stripping frames')
    removed = 0
    for name in FRAME_DIRS:
        folder = fighters / name
        if folder.exists():
            removed += sum(1 for p in folder.rglob('*') if p.is_file())
            shutil.rmtree(folder)
    (fighters / 'pose-atlas.json').unlink(missing_ok=True)
    return removed


if __name__ == '__main__':
    main()
