"""Normalize inspected full-body event sheets; never synthesize or articulate limbs.

Uses one anatomical scale per sheet, reviewable root anchors, and explicit frame
maps for rejected drawings. Originals and generated sheets remain untouched.
"""
import argparse, importlib.util, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('atlas_import',ROOT/'art/pose-atlases/import_atlas.py')
atlas=importlib.util.module_from_spec(spec);spec.loader.exec_module(atlas)
CLIPS={'intro':list(range(4)), 'special':list(range(4,12)), 'cast':list(range(12,16)),
       'recoil':list(range(16,20)), 'defeat':list(range(20,32))}

def run(source,ident,config,activate=False):
    image=Image.open(source).convert('RGBA');a=np.array(image);rgb=a[:,:,:3].astype(int)
    key=(np.minimum(rgb[:,:,0],rgb[:,:,2])-rgb[:,:,1]>70)&(abs(rgb[:,:,0]-rgb[:,:,2])<65)
    groups=[g for g in atlas.components((a[:,:,3]>=128)&~key) if g['area']>image.width*image.height/32*.025]
    if len(groups)!=32:raise ValueError(f'Expected32 complete actors, found{len(groups)}; inspect before import')
    # Rows need not have identical baselines: floor poses occupy less height.
    groups.sort(key=lambda g:(g['box'][1]+g['box'][3])/2)
    ordered=[]
    for row in range(8):ordered+=sorted(groups[row*4:row*4+4],key=lambda g:(g['box'][0]+g['box'][2])/2)
    guard=Image.open(ROOT/f'public/fighters/poses/{ident}/00-guard.png').convert('RGBA');gb=guard.getbbox()
    neutral=ordered[0]['box'];scale=(gb[3]-gb[1])/(neutral[3]-neutral[1])*config.get('scaleMultiplier',1)
    # Match the neutral sprite's visual center/root offset, then preserve the
    # source cell's lateral posing. Per-frame overrides are inspected metadata.
    offset=((gb[0]+gb[2])/2-112)/scale
    dest=ROOT/f'public/fighters/events/{ident}';dest.mkdir(parents=True,exist_ok=True)
    frames=[];report=[];maps={**CLIPS,**config.get('maps',{})}
    for i,g in enumerate(ordered):
        l,t,r,b=g['box'];pixels=np.zeros_like(a)
        for y,x,z in g['runs']:pixels[y,x:z]=a[y,x:z];pixels[y,x:z,3]=255
        crop=Image.fromarray(pixels).crop((l,t,r,b))
        if i in config.get('flip',[]):crop=crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        default_x=(i%4+.5)*image.width/4-offset
        xroot,yroot=config.get('anchors',{}).get(str(i),[default_x,b])
        if i in config.get('flip',[]):xroot=l+r-xroot
        sw,sh=round(crop.width*scale),round(crop.height*scale)
        crop=crop.resize((sw,sh),Image.Resampling.NEAREST)
        x=round(112-(xroot-l)*scale);y=round(210-(yroot-t)*scale)
        if x<1 or y<1 or x+sw>255 or y+sh>255:raise ValueError(f'{ident} cell{i} would clip canonical canvas')
        normalized=Image.new('RGBA',(256,256));normalized.alpha_composite(crop,(x,y))
        path=dest/f'{i:02}.png';normalized.save(path)
        frames.append({'url':f'/fighters/events/{ident}/{i:02}.png','width':256,'height':256,'anchor':[112,210],'bounds':list(normalized.getbbox())})
        report.append({'sourceCell':i,'sourceBounds':g['box'],'sourceAnchor':[xroot,yroot], 'flipped':i in config.get('flip',[]),'touchesImageEdge':l==0 or t==0 or r==image.width or b==image.height,'canonicalBounds':list(normalized.getbbox())})
    clips={k:[frames[i] for i in indices] for k,indices in maps.items()}
    out=ROOT/f'art/animation-rework/processed/{ident}';out.mkdir(parents=True,exist_ok=True)
    (out/'report.json').write_text(json.dumps({'source':str(source),'uniformScale':scale,'config':config,'frames':report,'clips':clips},indent=2)+'\n')
    board=Image.new('RGB',(768,1536),'#263447');d=ImageDraw.Draw(board)
    for i in range(32):
        tile=Image.open(dest/f'{i:02}.png').resize((192,192),Image.Resampling.NEAREST)
        board.paste(tile,(i%4*192,i//4*192),tile);d.text((i%4*192+6,i//4*192+6),str(i),fill='white')
    board.save(out/'contact.png')
    if activate:
        path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text())
        manifest['revision']='whole-body-events-pilot-1';manifest['fighters'][ident]['clips']=clips
        path.write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({'fighter':ident,'cells':32,'mappedDistinctSourceCells':len(set(sum(maps.values(),[]))),'scale':scale,'active':activate}))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('fighter');p.add_argument('--config',required=True);p.add_argument('--activate',action='store_true');args=p.parse_args()
    run(Path(args.source),args.fighter,json.loads(Path(args.config).read_text()),args.activate)
