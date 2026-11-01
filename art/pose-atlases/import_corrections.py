#!/usr/bin/env python3
"""Install inspected complete kick poses; never rotate or stretch limb pieces."""
import importlib.util,json
from pathlib import Path
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('atlas_import',ROOT/'import_atlas.py');a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
def extract(image,g):
    l,t,r,b=g['box'];cell=image.crop((l,t,r,b));mask=np.zeros((b-t,r-l),np.uint8)
    for y,x,z in g['runs']:mask[y-t,x-l:z-l]=255
    cell.putalpha(Image.fromarray(mask));return cell
def normalize(cell,scale,reference,air=False):
    alpha=np.array(cell.getchannel('A'));h,w=alpha.shape
    mids=[]
    for row in alpha[round(h*.12):round(h*.34)]:
        xs=np.flatnonzero(row)
        if len(xs):mids.append((int(xs[0])+int(xs[-1]))/2)
    hx=float(np.median(mids))
    # Baseline is a virtual foot-root in air. A fixed extra vertical margin keeps
    # tucked airborne poses from looking stretched down to a standing stance.
    scaled=cell.resize((round(w*scale),round(h*scale)),Image.Resampling.NEAREST)
    x=round(112-hx*scale-reference);y=210-scaled.height-(12 if air else 0)
    if x<0 or y<0 or x+scaled.width>256 or y+scaled.height>256:raise ValueError('Correction exceeds canonical frame')
    frame=Image.new('RGBA',(256,256));frame.alpha_composite(scaled,(x,y));return frame
def kicks(ident):
    image=Image.open(ROOT/'raw'/f'{ident}-kicks.png').convert('RGBA');w,h=image.size
    groups=a.components(np.array(image.getchannel('A'))>=96);actors=[g for g in groups if g['area']>w*h*.015]
    if len(actors)!=4:raise ValueError(f'{ident}: expected4wholeposes, found{len(actors)}')
    actors.sort(key=lambda g:(int((g['box'][1]+g['box'][3])/h),g['box'][0]))
    cells=[extract(image,g) for g in actors]
    scale=128/max(cells[0].height,cells[1].height)
    folder=ROOT/'processed'/ident
    guard=Image.open(folder/'00-guard.png');alpha=np.array(guard.getchannel('A'));box=guard.getchannel('A').getbbox();m=[]
    for row in alpha[box[1]+round((box[3]-box[1])*.12):box[1]+round((box[3]-box[1])*.34)]:
        xs=np.flatnonzero(row)
        if len(xs):m.append((int(xs[0])+int(xs[-1]))/2)
    offset=112-float(np.median(m));records=[]
    for index,slot in enumerate([17,18,22,23]):
        frame=normalize(cells[index],scale,offset,index>=2);name=f'{slot:02}-{a.SLOTS[slot]}.png';frame.save(folder/name);records.append({'slot':slot,'sourceBounds':actors[index]['box'],'uniformScale':scale,'anchor':[112,210],'inspected':'source anatomy inspected; runtime pending'})
    (folder/'kick-corrections.json').write_text(json.dumps(records,indent=2))
    print(ident,'four corrected whole poses')
def bigswole():
    ident='bigswole';image=Image.open(ROOT/'raw'/f'{ident}-32.png').convert('RGBA');h=image.height
    groups=a.components(np.array(image.getchannel('A'))>=96);last=sorted([g for g in groups if g['area']>10000 and g['box'][1]>h*.87],key=lambda g:g['box'][0])
    if len(last)!=5:raise ValueError('BigSwole five-pose last row no longer matches inspected source')
    report=json.load(open(ROOT/'processed'/ident/'report.json'));scale=report['uniformScale']
    for slot,idx in [(28,0),(29,3),(30,4),(31,4)]:
        frame=normalize(extract(image,last[idx]),scale,0);frame.save(ROOT/'processed'/ident/f'{slot:02}-{a.SLOTS[slot]}.png')
    (ROOT/'processed'/ident/'last-row-remap.json').write_text(json.dumps({'sourceContains':5,'mapping':{'28':0,'29':3,'30':4,'31':4},'omitted':[1,2],'reason':'Use overhead charge and ground slam; extra forward punch and low charge omitted.'},indent=2))
    print('bigswole explicit five-pose source remapped')
if __name__=='__main__':
    for item in json.load(open(ROOT/'corrections.json')):kicks(item['id'])
    bigswole()
