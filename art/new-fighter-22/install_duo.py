"""Install the explicitly selected complete-body sequences, retaining the roster.

Blue event17 reads as a punch, and event28–31 are clipped: never select them.
Floor defeat deliberately holds complete26/27 instead of inventing in-betweens.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
base=ROOT/'art/new-fighter-22/processed'
path=ROOT/'public/fighters/pose-atlas.json'
manifest=json.loads(path.read_text())
for entity,ident in [('red','duo'),('blue','duo-blue')]:
    cfg=json.loads((base/f'{entity}-core/metadata.json').read_text())
    cfg['walkFrames']=json.loads((base/f'{entity}-walk-final/metadata.json').read_text())['frames']
    cfg['walkCycleDistance']=176
    cfg['clips']=json.loads((base/f'{entity}-events/metadata.json').read_text())['clips']
    if entity=='blue':
        cfg['clips']['recoil']=[cfg['frames'][24],cfg['clips']['recoil'][0],cfg['clips']['recoil'][2],cfg['clips']['recoil'][3]]
        # The generated recovery19 plants both feet prematurely. Reuse the
        # coherent raised-knee chamber before the runtime's final plant.
        cfg['frames'][19]=cfg['frames'][16].copy()
    cfg['holdContact']={'hand':[158,143] if entity=='red' else [160,137],'torso':[150,155] if entity=='red' else [149,153]}
    manifest['fighters'][ident]=cfg
manifest['revision']='duo-full-body-review-7'
path.write_text(json.dumps(manifest,indent=2)+'\n')
print('Installed two body atlases for one logical duo. Visual review remains required.')
