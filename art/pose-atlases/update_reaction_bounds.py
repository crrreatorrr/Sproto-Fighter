"""Refresh opaque bounds used to floor-align whole-body hit/knockdown poses."""
import json
import math
import numpy as np
from pathlib import Path
from PIL import Image
def hull(points):
    points = sorted(set(points))
    def cross(o,a,b):
        return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    lower=[]
    for p in points:
        while len(lower)>=2 and cross(lower[-2],lower[-1],p)<=0: lower.pop()
        lower.append(p)
    upper=[]
    for p in reversed(points):
        while len(upper)>=2 and cross(upper[-2],upper[-1],p)<=0: upper.pop()
        upper.append(p)
    return lower[:-1]+upper[:-1]

root = Path(__file__).resolve().parents[2]
manifest_path = root / 'public/fighters/pose-atlas.json'
manifest = json.loads(manifest_path.read_text())
for fighter in manifest['fighters'].values():
    for slot in [9,24]:
        frame = fighter['frames'][slot]
        image = Image.open(root / 'public' / frame['url'].lstrip('/')).convert('RGBA')
        bounds = image.getchannel('A').getbbox()
        if bounds is None:
            raise ValueError('Empty hit pose: ' + frame['url'])
        frame['bounds'] = list(bounds)
        ys,xs = np.where(np.array(image.getchannel('A')) > 0)
        frame['contactHull'] = hull([(int(x)+dx,int(y)+dy) for x,y in zip(xs,ys) for dx,dy in [(0,0),(1,0),(1,1),(0,1)]])
        top = ys <= np.quantile(ys,.25)
        feet = ys >= np.quantile(ys,.85)
        lean = math.atan2(float(xs[feet].mean()-xs[top].mean()), float(ys[feet].mean()-ys[top].mean()))
        frame['fallLean'] = round(max(-math.pi/3,min(math.pi/3,lean)),6)
manifest['revision'] = 'whole-pose-throw-reaction-6'
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
print('Updated falling/hit-pose bounds for', len(manifest['fighters']), 'fighters')
