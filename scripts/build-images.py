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

Fight backgrounds, animations, menu art and the font

The game loads a WebP copy next to each original under public/: every stage
background and story scenery (quality 95 at the original size, since the arena
samples them nearest-neighbour), and lossless, exact copies of the story
animation sheets, menu frames and buttons and power sprites (pixel-identical,
checked on write). The UI font gets a WOFF2 copy. The originals stay in public/
for the checks and authoring scripts and are left out of dist/ (DIST_EXCLUDE in
vite.config.ts). scripts/manifests/media-copies.json records each source's
SHA-256. The font copy needs fontTools and brotli (pip install fonttools brotli).

Run after adding or changing a portrait or stage:

  python3 scripts/build-images.py            # only missing or changed images
  python3 scripts/build-images.py --all      # regenerate everything

scripts/portraits-smoke.mjs, scripts/stage-previews-smoke.mjs and
scripts/media-copies-smoke.mjs report missing or stale copies. Requires Pillow with WebP support.
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
    found = re.findall(
        r"""^\s*(?:([A-Za-z_$][\w$]*)|["']([\w$-]+)["'])\s*:\s*new URL\('\.\./(art/[^']+)'""",
        text, re.M,
    )
    if not found:
        sys.exit('no portraits found in src/originalPortraits.ts')
    return {identifier or quoted: ROOT / path for identifier, quoted, path in found}


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


COPY_MANIFEST = ROOT / 'scripts' / 'manifests' / 'media-copies.json'
STORY_LOCATION_LIST = ROOT / 'src' / 'stageVariants.ts'
STAGE_QUALITY = 95
# Lossless, exact copies: every pixel (and the colour under transparent pixels) is
# unchanged, so the game draws exactly what it drew from the PNG.
LOSSLESS_GLOBS = ['story-animations/*.png', 'menu/higgsfield/*.png', 'menu/higgsfield/mystic/*.png', 'fighters/powers/*.png']
FONTS = ['fonts/PixelifySans.ttf']


def webp_copy(source):
    return source.with_suffix('.webp')


def copy_sources():
    """{public-relative source: kind} for every file the game loads as a generated copy."""
    found = {}
    stage_images = {str(p.relative_to(ROOT / 'public')) for p in stage_sources().values()}
    stage_images |= {p.lstrip('/') for p in re.findall(r'"image"\s*:\s*"([^"]+)"', STORY_LOCATION_LIST.read_text())}
    for path in sorted(stage_images):
        found[path] = 'stage'
    for pattern in LOSSLESS_GLOBS:
        for path in sorted((ROOT / 'public').glob(pattern)):
            found[str(path.relative_to(ROOT / 'public'))] = 'lossless'
    for path in FONTS:
        found[path] = 'font'
    return found


def render_copy(kind, source, output):
    if kind == 'font':
        from fontTools.ttLib import TTFont  # pip install fonttools brotli
        font = TTFont(source)
        font.flavor = 'woff2'
        font.save(output)
        return
    with Image.open(source) as image:
        if kind == 'stage':
            # Fight backgrounds are opaque and drawn nearest-neighbour from their own
            # size, so they keep it: a smaller copy would sample different pixels.
            image.convert('RGB').save(output, 'WEBP', quality=STAGE_QUALITY, method=6)
            return
        rgba = image.convert('RGBA')
        rgba.save(output, 'WEBP', lossless=True, exact=True, quality=100, method=6)
    with Image.open(output) as decoded:
        if decoded.convert('RGBA').tobytes() != rgba.tobytes():
            sys.exit(f'{output}: lossless copy differs from {source}')


def build_copies(everything):
    """Generated WebP/WOFF2 copies next to their sources. The sources stay in public/
    for the checks and authoring scripts; vite.config.ts keeps them out of dist/."""
    previous = json.loads(COPY_MANIFEST.read_text()) if COPY_MANIFEST.exists() else {}
    entries, built = {}, 0
    for path, kind in copy_sources().items():
        source = ROOT / 'public' / path
        output = source.with_suffix('.woff2') if kind == 'font' else webp_copy(source)
        entry = {'kind': kind, 'copy': str(output.relative_to(ROOT / 'public')), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()}
        entries[path] = entry
        if not everything and previous.get(path) == entry and output.exists():
            continue
        render_copy(kind, source, output)
        built += 1
    for path, entry in previous.items():
        if path not in entries:
            (ROOT / 'public' / entry['copy']).unlink(missing_ok=True)
    COPY_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    COPY_MANIFEST.write_text(json.dumps(entries, indent=1, sort_keys=True) + '\n')
    return built, len(entries)


def main():
    everything = '--all' in sys.argv
    built, total = build_copies(everything)
    print(f'stage, animation, menu and font copies: {built} regenerated, {total - built} up to date.')
    built, total = generate(sources(), OUT, lambda k: [OUT / name / f'{k}.webp' for name in SIZES], render_portrait, everything)
    print(f'portraits: {built} regenerated, {total - built} up to date.')
    built, total = generate(stage_sources(), STAGE_OUT, lambda k: [STAGE_OUT / f'{k}.webp'], render_stage, everything)
    print(f'stage previews: {built} regenerated, {total - built} up to date.')


if __name__ == '__main__':
    main()
