#!/usr/bin/env python3
"""Generate the small WebP images the game downloads instead of large originals.

Portraits

The original supplied portraits (listed in src/originalPortraits.ts, mostly
1000x1000 PNGs, ~83 MB in total) stay in art/ as the source of truth. The game
loads these generated copies instead:

  public/portraits/thumb/<id>.webp   192 px  selection grid, campaign map (shown at ~96 px)
  public/portraits/large/<id>.webp   640 px  versus screen and selection echoes (shown up to ~340 px)

public/portraits/manifest.json records each source's SHA-256.

Stage previews

The menu draws stage thumbnails and the match preview from the full fight
backgrounds (up to ~5 MB each; opening the menu used to fetch ~50 MB of them).
It now loads public/stages/previews/<id>.webp (640x360) and downloads a full
background only for the stage being fought on. Sources are the stage list in
src/stage.ts; public/stages/previews/manifest.json records their SHA-256.

Run after adding or changing a portrait or stage:

  python3 scripts/build-images.py            # only missing or changed images
  python3 scripts/build-images.py --all      # regenerate everything

scripts/portraits-smoke.mjs and scripts/stage-previews-smoke.mjs report
missing or stale copies. Requires Pillow with WebP support.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_LIST = ROOT / 'src' / 'originalPortraits.ts'
OUT = ROOT / 'public' / 'portraits'
SIZES = {'thumb': (192, 82), 'large': (640, 86)}  # name: (longest side px, WebP quality)


def sources():
    text = SOURCE_LIST.read_text()
    found = re.findall(r"^\s*([A-Za-z0-9_$]+)\s*:\s*new URL\('\.\./(art/[^']+)'", text, re.M)
    if not found:
        sys.exit('no portraits found in src/originalPortraits.ts')
    return {fighter: ROOT / path for fighter, path in found}


STAGE_LIST = ROOT / 'src' / 'stage.ts'
STAGE_OUT = ROOT / 'public' / 'stages' / 'previews'
STAGE_SIZE = (640, 360)


def stage_sources():
    found = {}
    for line in STAGE_LIST.read_text().splitlines():
        m = re.match(r"""\s*\{\s*"?id"?\s*:\s*['"]([^'"]+)['"]""", line)
        if not m:
            continue
        image = re.search(r'"?image"?\s*:\s*[\'"]([^\'"]+)[\'"]', line)
        found[m.group(1)] = ROOT / 'public' / (image.group(1) if image else f'/stages/higgsfield/{m.group(1)}.png').lstrip('/')
    if not found:
        sys.exit('no stages found in src/stage.ts')
    return found


def generate(items, out_dir, outputs_for, render, everything):
    """Regenerate items whose source changed. Returns (built, total)."""
    manifest_path = out_dir / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    entries, built = {}, 0
    for key, source in sorted(items.items()):
        entry = {'source': str(source.relative_to(ROOT)), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()}
        entries[key] = entry
        outputs = outputs_for(key)
        if not everything and manifest.get(key) == entry and all(p.exists() for p in outputs):
            continue
        with Image.open(source) as image:
            render(image.convert('RGBA'), outputs)
        built += 1
    for output in {p.parent for key in entries for p in outputs_for(key)}:
        for stale in output.glob('*.webp'):
            if stale.stem not in entries:
                stale.unlink()
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(entries, indent=1, sort_keys=True) + '\n')
    return built, len(entries)


def render_portrait(image, outputs):
    for output, (size, quality) in zip(outputs, SIZES.values()):
        copy = image.copy()
        copy.thumbnail((size, size), Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True, exist_ok=True)
        copy.save(output, 'WEBP', quality=quality, method=6)


def render_stage(image, outputs):
    # Same 16:9 frame as the 1280x720 arena; drawing code uses source-relative coordinates.
    copy = image.convert('RGB').resize(STAGE_SIZE, Image.Resampling.LANCZOS)
    outputs[0].parent.mkdir(parents=True, exist_ok=True)
    copy.save(outputs[0], 'WEBP', quality=84, method=6)


def main():
    everything = '--all' in sys.argv
    built, total = generate(sources(), OUT, lambda k: [OUT / name / f'{k}.webp' for name in SIZES], render_portrait, everything)
    print(f'portraits: {built} regenerated, {total - built} up to date.')
    built, total = generate(stage_sources(), STAGE_OUT, lambda k: [STAGE_OUT / f'{k}.webp'], render_stage, everything)
    print(f'stage previews: {built} regenerated, {total - built} up to date.')


if __name__ == '__main__':
    main()
