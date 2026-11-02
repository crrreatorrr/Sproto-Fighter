"""Extract the exact reference B; derive the mini from the reviewed Sproto art."""
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
EXPANSION = HERE.parent
ROOT = EXPANSION.parents[1]
DEST = ROOT / 'public/fighters/powers'


def build_b():
    source = EXPANSION / 'references/sproto-gremlin-3106.png'
    image = Image.open(source).convert('RGB')
    region = (610, 20, 995, 440)
    rgb = np.array(image.crop(region))
    border = np.concatenate([rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3),
                             rgb[:, :6].reshape(-1, 3), rgb[:, -6:].reshape(-1, 3)])
    background = np.median(border, axis=0)
    mask = np.max(abs(rgb.astype(float) - background), axis=2) > 21
    cutout = Image.fromarray(np.dstack([rgb, (mask * 255).astype('uint8')]))
    bounds = cutout.getchannel('A').getbbox()
    cutout = cutout.crop(bounds)
    # Retained opaque RGB values are original source pixels, without recoloring.
    original = np.array(image.crop((region[0] + bounds[0], region[1] + bounds[1],
                                   region[0] + bounds[2], region[1] + bounds[3])))
    pixels = np.array(cutout)
    assert np.array_equal(pixels[:, :, :3][pixels[:, :, 3] > 0], original[pixels[:, :, 3] > 0])
    DEST.mkdir(parents=True, exist_ok=True)
    cutout.save(DEST / 'sproto3106-reference-b.png')
    return {'source': str(source.relative_to(ROOT)), 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'sourceRegion': region, 'trim': bounds, 'size': cutout.size, 'opaqueColors': 'unchanged source RGB'}


def build_mini():
    source = EXPANSION / 'processed/sproto2531-core/08.png'
    image = Image.open(source).convert('RGBA')
    crop = image.crop(image.getchannel('A').getbbox())
    # A complete tucked airborne Sproto; never a loose head or generic orb.
    height = 42
    crop = crop.resize((round(crop.width * height / crop.height), height), Image.Resampling.NEAREST)
    canvas = Image.new('RGBA', (crop.width + 4, crop.height + 4))
    canvas.alpha_composite(crop, (2, 2))
    DEST.mkdir(parents=True, exist_ok=True)
    canvas.save(DEST / 'sproto2531-mini.png')
    return {'source': str(source.relative_to(ROOT)), 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'size': canvas.size, 'sampling': 'nearest', 'pose': 'complete airborne body, slot08'}


if __name__ == '__main__':
    report = {'referenceB': build_b(), 'miniSproto': build_mini()}
    (HERE / 'power-assets.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))
