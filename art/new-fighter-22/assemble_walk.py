"""Select reviewed complete poses into a four-key guarded gait.

No joints, limb masks, warps or synthetic in-betweens. The two accepted grid
cells plus two single-pose corrections preserve alternating leg identity.
Default output is a review candidate; --install copies explicitly selected PNGs.
"""
import argparse, importlib.util, json, shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('duo_import',Path(__file__).with_name('import_duo.py'))
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
RAW=Path(__file__).with_name('raw')
CHOICES={
 'red':[('red-walk-r2.png',0),('red-walk-r2.png',2),('red-walk-contact-far.png',None),('red-walk-pass-far-fixed.png',None)],
 'blue':[('blue-walk-contact-near.png',None),('blue-walk-r3.png',2),('blue-walk-r3.png',0),('blue-walk-pass-far.png',None)]
}
def extract(filename,index):
    a=np.array(Image.open(RAW/filename).convert('RGBA'));rgb=a[:,:,:3].astype(int)
    key=(np.minimum(rgb[:,:,0],rgb[:,:,2])-rgb[:,:,1]>65)&(abs(rgb[:,:,0]-rgb[:,:,2])<80)
    groups=[g for g in lib.atlas.components((a[:,:,3]>=128)&~key) if g['area']>a.shape[0]*a.shape[1]*.002]
    if index is None:
        if len(groups)!=1:raise ValueError((filename,'expected one connected figure',len(groups)))
        g=groups[0]
    else:
        if len(groups)!=8:raise ValueError((filename,'expected eight connected figures',len(groups)))
        groups.sort(key=lambda g:(g['box'][1]+g['box'][3])/2)
        ordered=[]
        for row in range(2):ordered+=sorted(groups[row*4:row*4+4],key=lambda g:(g['box'][0]+g['box'][2])/2)
        g=ordered[index]
    l,t,r,b=g['box'];pixels=np.zeros((b-t,r-l,4),dtype=np.uint8)
    for y,x,z in g['runs']:pixels[y-t,x-l:z-l]=a[y,x:z];pixels[y-t,x-l:z-l,3]=255
    return pixels,g['box']
def run(install):
    for entity,choices in CHOICES.items():
        out=ROOT/f'art/new-fighter-22/processed/{entity}-walk-final';out.mkdir(parents=True,exist_ok=True)
        ident='duo' if entity=='red' else 'duo-blue';frames=[];report=[]
        board=Image.new('RGB',(1024,256),'#293747');draw=ImageDraw.Draw(board)
        for i,(filename,index) in enumerate(choices):
            pixels,box=extract(filename,index);height,width=pixels.shape[:2]
            # Match head/anatomical scale to the bent-knee guard. Straight walk
            # legs make the whole body taller; forcing guard height shrank heads.
            # Passing keys rise one pixel while the support sole stays grounded.
            standing_height=141 if entity=='red' else 147
            scale=(standing_height+(i%2))/height;centers=[]
            for row in range(round(height*.12),round(height*.34)):
                xs=np.flatnonzero(pixels[row,:,3])
                if len(xs):centers.append((xs[0]+xs[-1])/2)
            target=118 if entity=='red' else 112
            x=round(target-float(np.median(centers))*scale)
            crop=Image.fromarray(pixels).resize((round(width*scale),round(height*scale)),Image.Resampling.NEAREST)
            normalized=Image.new('RGBA',(256,256));normalized.alpha_composite(crop,(x,210-crop.height))
            bounds=list(normalized.getbbox())
            if min(bounds)<1 or max(bounds)>255:raise ValueError((entity,i,'clipped'))
            name=f'key-{i:02}.png';normalized.save(out/name)
            frames.append({'url':f'/fighters/walk/{ident}/{name}','width':256,'height':256,'anchor':[112,210],'bounds':bounds,'contactHull':lib.hull(np.array(normalized.getchannel('A'))>0)})
            report.append({'frame':i,'source':filename,'cell':index,'sourceBounds':box,'scale':scale,'bounds':bounds})
            board.paste(normalized,(i*256,0),normalized);draw.text((i*256+8,8),str(i),fill='white')
        board.save(out/'contact.png');(out/'metadata.json').write_text(json.dumps({'frames':frames},indent=2)+'\n')
        (out/'report.json').write_text(json.dumps({'entity':entity,'keys':report,'notes':'Four authored keys; not eight unique in-between frames.'},indent=2)+'\n')
        if install:
            dest=ROOT/f'public/fighters/walk/{ident}';dest.mkdir(parents=True,exist_ok=True)
            for i in range(4):shutil.copy2(out/f'key-{i:02}.png',dest/f'key-{i:02}.png')
        print(entity,'four whole-body gait keys prepared','installed' if install else 'candidate only')
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--install',action='store_true');run(p.parse_args().install)
