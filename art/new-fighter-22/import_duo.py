"""Import reviewed Higgsfield whole-body drawings. No limb rigging or synthesis.

Raw sheets stay unchanged. Output uses one scale per sheet, binary transparency,
nearest pixel sampling, inspected root anchors and complete opaque hulls.
"""
import argparse, importlib.util, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('atlas_import', ROOT/'art/pose-atlases/import_atlas.py')
atlas = importlib.util.module_from_spec(spec); spec.loader.exec_module(atlas)
CLIPS = {'intro': list(range(4)), 'special': list(range(4,12)), 'cast': list(range(12,16)),
         'recoil': list(range(16,20)), 'defeat': list(range(20,32))}

def hull(mask):
    yy, xx = np.where(mask)
    points = sorted(set(zip(xx.tolist(), yy.tolist())))
    cross = lambda a,b,c: (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    lower=[]; upper=[]
    for p in points:
        while len(lower)>1 and cross(lower[-2],lower[-1],p)<=0: lower.pop()
        lower.append(p)
    for p in reversed(points):
        while len(upper)>1 and cross(upper[-2],upper[-1],p)<=0: upper.pop()
        upper.append(p)
    return [list(p) for p in lower[:-1]+upper[:-1]]

def run(entity, kind):
    folder=ROOT/'art/new-fighter-22'; source=folder/f'raw/{entity}-{kind}.png'
    image=Image.open(source).convert('RGBA'); a=np.array(image); rgb=a[:,:,:3].astype(int)
    key=(np.minimum(rgb[:,:,0],rgb[:,:,2])-rgb[:,:,1]>65)&(abs(rgb[:,:,0]-rgb[:,:,2])<80)
    mask=(a[:,:,3]>=128)&~key
    rows=2 if kind=='walk' else 8; count=rows*4
    components=atlas.components(mask)
    groups=[g for g in components if g['area']>image.width*image.height/count*.02]
    if len(groups)!=count: raise ValueError(f'{entity}-{kind}: expected {count} complete figures, got {len(groups)}')
    groups.sort(key=lambda g:(g['box'][1]+g['box'][3])/2)
    ordered=[]
    for row in range(rows): ordered+=sorted(groups[row*4:row*4+4],key=lambda g:(g['box'][0]+g['box'][2])/2)
    config_path=folder/f'{entity}-{kind}-anchors.json'
    config=json.loads(config_path.read_text()) if config_path.exists() else {}
    scale=config.get('scale',128/(ordered[0]['box'][3]-ordered[0]['box'][1]))
    ident='duo' if entity=='red' else 'duo-blue'
    category={'core':'poses','walk':'walk','events':'events'}[kind]
    dest=ROOT/f'public/fighters/{category}/{ident}'; dest.mkdir(parents=True,exist_ok=True)
    out=folder/f'processed/{entity}-{kind}';out.mkdir(parents=True,exist_ok=True)
    frames=[]; report=[]
    for i,g in enumerate(ordered):
        l,t,r,b=g['box']; pixels=np.zeros((b-t,r-l,4),dtype=np.uint8)
        for y,x,z in g['runs']: pixels[y-t,x-l:z-l]=a[y,x:z];pixels[y-t,x-l:z-l,3]=255
        crop=Image.fromarray(pixels)
        # Align the upper trunk/head relative to a stable standing foot root.
        # Overrides preserve intentional lean and air poses after visual review.
        height=b-t; centers=[]
        for row in range(round(height*.12),round(height*.34)):
            xs=np.flatnonzero(pixels[row,:,3])
            if len(xs): centers.append((xs[0]+xs[-1])/2+l)
        hx=float(np.median(centers))
        if i==0:
            ys,xs=np.where(pixels[max(0,height-6):,:,3]>0)
            offset=float(np.mean(xs)+l-hx)
        floor_pose=kind=='events' and i>=24
        default_root=[(l+r)/2 if floor_pose else hx+offset,b]
        root=config.get('anchors',{}).get(str(i),default_root)
        root=[root[0]+(0 if floor_pose else config.get('rootShiftPixels',0))/scale,root[1]]
        w,h=round(crop.width*scale),round(crop.height*scale)
        crop=crop.resize((w,h),Image.Resampling.NEAREST)
        x=round(112-(root[0]-l)*scale);y=round(210-(root[1]-t)*scale)
        if min(x,y)<1 or x+w>255 or y+h>255: raise ValueError(f'{entity}-{kind} {i} clips canvas')
        normalized=Image.new('RGBA',(256,256));normalized.alpha_composite(crop,(x,y))
        filename=f'{i:02}-{atlas.SLOTS[i]}.png' if kind=='core' else f'{i:02}.png'
        normalized.save(dest/filename)
        bounds=list(normalized.getbbox());outline=hull(np.array(normalized.getchannel('A'))>0)
        frames.append({'url':f'/fighters/{category}/{ident}/{filename}','width':256,'height':256,'anchor':[112,210],'bounds':bounds,'contactHull':outline})
        report.append({'cell':i,'sourceBounds':g['box'],'sourceRoot':root,'rootAuthored':str(i) in config.get('anchors',{}),'bounds':bounds,'touchesSourceEdge':l==0 or t==0 or r==image.width or b==image.height})
    metadata={'frames':frames,'width':256,'height':256,'anchor':[112,210],'scale':1.25,'facing':1,'walkCycleDistance':72}
    if kind=='events': metadata={'clips':{name:[frames[i] for i in config.get('maps',{}).get(name,indices)] for name,indices in CLIPS.items()}}
    (out/'metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
    (out/'report.json').write_text(json.dumps({'entity':entity,'kind':kind,'uniformScale':scale,'sourceSize':list(image.size),'frames':report,'status':'requires individual visual review'},indent=2)+'\n')
    board=Image.new('RGB',(768,192*rows),'#293747');d=ImageDraw.Draw(board)
    for i,entry in enumerate(frames):
        cell=Image.open(ROOT/'public'/entry['url'].lstrip('/')).resize((192,192),Image.Resampling.NEAREST)
        board.paste(cell,(i%4*192,i//4*192),cell);d.text((i%4*192+5,i//4*192+5),str(i),fill='white')
    board.save(out/'contact.png')
    print(json.dumps({'entity':entity,'kind':kind,'frames':count,'scale':scale,'installedManifest':False}))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('entity',choices=['red','blue']);p.add_argument('kind',choices=['core','walk','events']);args=p.parse_args();run(args.entity,args.kind)
