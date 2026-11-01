#!/usr/bin/env python3
"""Bake eight guarded footwork frames from each approved neutral sprite.

This is local pixel retiming/warping, not a generated animation or hand-drawn
in-between claim. It replaces the rejected flat-polygon walk. Each leg retains
its own source shading and foot outline; the full lower body is removed before
repainting, so no stationary duplicate limb remains. Frames retain a fighting
stance with alternating planted/lifted feet, rather than crossing the legs.
The runtime only draws complete PNGs. Cut lines are individually authored in
walk-authoring.json, and every output still requires visual review.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
KEY_SLOTS = ['02-walkNear', '03-passNear', '04-walkFar', '05-passFar']


def preserve_details(src, canvas, cfg, bob):
    if cfg.get('belly'):
        mask = Image.new('L', src.size)
        pixels, source = mask.load(), src.load()
        x0, y0, x1, y1 = cfg['belly']
        for y in range(y0, y1):
            for x in range(x0, x1):
                r, g, b, a = source[x, y]
                if a and r > 140 and g > 90 and b < 100:
                    pixels[x, y] = 255
        mask = mask.filter(ImageFilter.MaxFilter(3))
        patch = src.copy()
        patch.putalpha(Image.composite(src.getchannel('A'), Image.new('L', src.size), mask))
        canvas.alpha_composite(patch, (0, bob))


def build(src, cfg, ident):
    source = np.array(src)
    cx, cut = cfg['center'], cfg['cut']
    # Jahon's coat covers the thighs. Keep the coat intact and articulate the
    # visible calves below its hem, rather than warping a coat tail as a limb.
    if ident == 'guest13' and not cfg.get('pinPelvis'):
        cut = 190
    layers = []
    for side in range(2):
        a = source.copy()
        a[:cut + 1, :, 3] = 0
        if side == 0:
            a[:, cx:, 3] = 0
        else:
            a[:, :cx, 3] = 0
        coords = np.argwhere(a[:, :, 3] > 0)
        if not len(coords):
            raise ValueError(ident + ': missing visible source leg')
        foot = int(coords[:, 0].max())
        ankle = foot - cfg.get('footHeight', 9) + 2
        centers = {}
        for y in range(cut + 1, foot + 1):
            xs = np.flatnonzero(a[y, :, 3] > 0)
            if len(xs):
                centers[y] = float((xs[0] + xs[-1]) / 2)
        if ankle not in centers or ankle <= cut:
            raise ValueError(ident + ': author ankle/cut explicitly')
        layers.append((a, centers, foot, ankle))
    frames, joints = [], []
    for index in range(8):
        phase = index / 8
        bob = round(-math.sin(phase * math.tau) ** 2)
        pixels = np.zeros_like(source)
        frame_joints = []
        for side, (a, centers, foot, source_ankle) in enumerate(layers):
            q = (phase + (.5 if side == 0 else 0)) % 1
            stance = centers[source_ankle] - cx
            reach = min(cfg.get('reachLimit', 9), abs(stance) * .35)
            if q < .5:
                foot_x, lift = cx + stance + reach * (1 - 4 * q), 0
            else:
                foot_x = cx + stance + reach * (-1 + 4 * (q - .5))
                lift = min(4, (source_ankle - cut) * .2) * math.sin((q - .5) * math.tau)
            # Broad open stances need the actual source hip, not an assumed
            # +/-8px hip. Pin the inspected pelvis and bend only below it.
            pinned = cfg.get('pinPelvis', False)
            hip = (centers[min(centers)] if pinned else cx + (-8 if side == 0 else 8), cut + bob + 1)
            ankle = (foot_x, source_ankle - lift)
            knee = ((hip[0] + ankle[0]) / 2 + (2 if lift else 1),
                    hip[1] + (ankle[1] - hip[1]) * .52)
            for y, center in centers.items():
                if y <= source_ankle and pinned:
                    t = (y - (cut + 1)) / (source_ankle - (cut + 1))
                    bend = t * t * (3 - 2 * t)
                    # Zero displacement at the pelvis join; retain the source
                    # inner-thigh contour instead of stretching its seam.
                    dy = y + bob * (1 - t) - lift * bend
                    dx = center + (foot_x - centers[source_ankle]) * bend
                elif y <= source_ankle:
                    t = (y - cut) / (source_ankle - cut)
                    dy = hip[1] + t * (ankle[1] - hip[1])
                    dx = (hip[0] + (knee[0] - hip[0]) * t / .52 if t < .52
                          else knee[0] + (ankle[0] - knee[0]) * (t - .52) / .48)
                    first, last = centers[min(centers)], centers[source_ankle]
                    dx += (center - (first + (last - first) * t)) * .6
                else:
                    dy, dx = y - lift, ankle[0]
                yy = round(dy)
                # Keep each toe row's offset from its own ankle, preserving
                # toe shapes/soles instead of flattening them to generic feet.
                reference_x = centers[source_ankle] if y > source_ankle else center
                offset = round(dx - reference_x)
                for x in np.flatnonzero(a[y, :, 3] > 0):
                    xx = int(x + offset)
                    if not (0 <= xx < src.width and 0 <= yy < src.height):
                        raise ValueError(ident + ': step would clip')
                    color = a[y, x].copy()
                    if side == 0:
                        color[:3] = (color[:3].astype(float) * .78).astype('uint8')
                    pixels[yy, xx] = color
                    if yy > 0 and y < source_ankle and pixels[yy - 1, xx, 3] == 0:
                        pixels[yy - 1, xx] = color
            frame_joints.append({'side': 'far' if side == 0 else 'near',
                                 'hip': hip, 'knee': knee, 'ankle': ankle,
                                 'planted': lift == 0, 'sourceFootY': foot})
        canvas = Image.fromarray(pixels)
        canvas.alpha_composite(src.crop((0, 0, src.width, cut + 2)), (0, bob))
        preserve_details(src, canvas, cfg, bob)
        frames.append(canvas)
        joints.append({'index': index, 'bob': bob, 'legs': frame_joints})
    return frames, joints


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--fighter', action='append')
    parser.add_argument('--install', action='store_true', help='Copy reviewed output into public; no quality approval implied')
    args = parser.parse_args()
    configs = json.loads((ROOT / 'walk-authoring.json').read_text())['fighters']
    manifest_path = ROOT.parents[1] / 'public/fighters/pose-atlas.json'
    manifest = json.loads(manifest_path.read_text())
    report = {}
    for ident, cfg in configs.items():
        if args.fighter and ident not in args.fighter:
            continue
        folder = ROOT / 'processed' / ident
        guard = folder / '00-guard.png'
        if hashlib.sha256(guard.read_bytes()).hexdigest() != cfg['guardSha256']:
            raise ValueError(ident + ': guard changed; inspect cut line before updating its hash')
        frames, joints = build(Image.open(guard).convert('RGBA'), cfg, ident)
        output = folder / 'walk'
        output.mkdir(exist_ok=True)
        strip = Image.new('RGB', (8 * 256, 280), '#526173')
        labels = ImageDraw.Draw(strip)
        for i, frame in enumerate(frames):
            frame.save(output / f'{i:02}.png')
            strip.paste(frame, (i * 256, 20), frame)
            labels.text((i * 256 + 6, 4), ident + ' / ' + str(i), fill='white')
        strip.save(output / 'review-strip.png')
        (output / 'joints.json').write_text(json.dumps(joints, indent=2))
        for slot, i in zip(KEY_SLOTS, [0, 2, 4, 6]):
            frames[i].save(folder / (slot + '.png'))
        if args.install:
            public = ROOT.parents[1] / 'public/fighters/poses' / ident
            (public / 'walk').mkdir(exist_ok=True)
            for i, frame in enumerate(frames):
                frame.save(public / 'walk' / f'{i:02}.png')
            for slot, i in zip(KEY_SLOTS, [0, 2, 4, 6]):
                frames[i].save(public / (slot + '.png'))
            manifest['fighters'][ident]['walkFrames'] = [
                {'url': f'/fighters/poses/{ident}/walk/{i:02}.png', 'width': 256,
                 'height': 256, 'anchor': [112, 210]} for i in range(8)]
            manifest['fighters'][ident]['walkCycleDistance'] = 64
        report[ident] = {'frames': 8, 'installed': args.install,
                         'review': 'requires individual current-frame and browser inspection'}
    if args.install:
        manifest['revision'] = 'whole-pose-pelvis-4'
        manifest_path.write_text(json.dumps(manifest, indent=2))
    (ROOT / 'textured-step-report.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report))


if __name__ == '__main__':
    main()
