"""Reviewed root registration for Buddhashadow's independently normalized sheets.

Body landmarks agree on +30 source pixels in the walk sheet and +16 in
standing event cels. Floor-rest cels23–31 use a separate centered import rule.
Keep source PNGs, hulls, floor height, runtime scale and core grab grips intact.
"""
from pathlib import PurePosixPath

def apply_registration(cfg):
    for cell in cfg['walkFrames']:
        cell['anchor'] = [142,210]
    for cells in cfg['clips'].values():
        for cell in cells:
            if cell['url'].startswith('/fighters/events/buddhashadow/'):
                slot = int(PurePosixPath(cell['url']).stem)
                if slot < 23:
                    cell['anchor'] = [128,210]
    return cfg
