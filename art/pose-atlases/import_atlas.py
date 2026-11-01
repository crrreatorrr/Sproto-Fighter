#!/usr/bin/env python3
"""Import an inspected 4x4 full-pose sheet without deforming character anatomy.

All frames share one scale. Per-frame foot anchors remain reviewable in report.json;
no automatic publication or activation in the game. Only writes chosen output dir.
"""
import argparse,json,math
from pathlib import Path
from PIL import Image
import numpy as np
SLOTS=['guard','breathe','walkNear','passNear','walkFar','passFar','dash','jumpAnticipation','airRise','airFall','crouchLanding','punchWindup','punchExtended','punchRecover','upperWindup','uppercut','kickChamber','kickHalf','kickFull','kickRecover','sweep','sweepRecover','airKickChamber','airKickFull','hit','block','grabReach','grabHold','throwRelease','powerCharge','powerRelease','special']
OLD_SLOTS=['guard','walkLeft','walkPass','walkRight','punchWindup','punchExtended','punchRecover','uppercut','kickChamber','kickHalf','kickFull','kickRecover','air','crouchGuard','hit','cast']
def components(mask):
    """Connected opaque scanline runs; preserves a limb crossing a cell border.

    Generation cells are a layout hint, not destructive rectangular cut lines.
    Detached marks are reported rather than baked into the actor sprite.
    """
    parent=[];runs=[];previous=[]
    def root(n):
        while parent[n]!=n:parent[n]=parent[parent[n]];n=parent[n]
        return n
    for y,row in enumerate(mask):
        changes=np.flatnonzero(np.diff(np.r_[False,row,False].astype(np.int8)))
        current=[];cursor=0
        for a,b in changes.reshape(-1,2):
            a,b=int(a),int(b);n=len(parent);parent.append(n)
            while cursor<len(previous) and previous[cursor][1]<a:cursor+=1
            j=cursor
            while j<len(previous) and previous[j][0]<=b:
                parent[root(n)]=root(previous[j][2]);j+=1
            runs.append((y,a,b,n));current.append((a,b,n))
        previous=current
    groups={}
    for y,a,b,n in runs:
        k=root(n);g=groups.setdefault(k,{'area':0,'box':[a,y,b,y+1],'runs':[]})
        g['area']+=b-a;g['box']=[min(g['box'][0],a),min(g['box'][1],y),max(g['box'][2],b),y+1];g['runs'].append((y,a,b))
    return sorted(groups.values(),key=lambda g:g['area'],reverse=True)
def run(src,out,ident,anchor_file=None,rows=8):
    image=Image.open(src).convert('RGBA');w,h=image.size
    slots=SLOTS if rows==8 else OLD_SLOTS
    cw,ch=w/4,h/rows
    anchors=json.loads(Path(anchor_file).read_text()) if anchor_file else {}
    mask=np.array(image.getchannel('A'))>=96
    groups=components(mask);assigned={};extras=[]
    for g in groups:
        l,t,r,b=g['box'];col=min(3,max(0,int((l+r)/2/cw)));row=min(rows-1,max(0,int((t+b)/2/ch)));i=row*4+col
        if i not in assigned and g['area']>cw*ch*.015:assigned[i]=g
        else:extras.append({'cell':i,'area':g['area'],'bounds':g['box']})
    if len(assigned)!=len(slots):raise ValueError(f'Expected {len(slots)} connected actors, found {len(assigned)}; inspect disconnected bodies/grid')
    cells=[];report=[]
    for i,name in enumerate(slots):
        g=assigned[i];l,t,r,b=g['box'];crop=(max(0,l-2),max(0,t-2),min(w,r+2),min(h,b+2));cell=image.crop(crop)
        alpha=Image.new('L',cell.size);ap=np.zeros((cell.height,cell.width),dtype=np.uint8)
        for y,a,z in g['runs']:ap[y-crop[1],a-crop[0]:z-crop[0]]=255
        alpha=Image.fromarray(ap);cell.putalpha(alpha)
        box=alpha.getbbox()
        if box is None:raise ValueError(f'{name}: empty cell')
        # Baseline is observable; horizontal anchor is explicitly reviewable,
        # estimated from the lowest opaque band only when no authored value exists.
        pix=alpha.load();bottom=box[3]-1
        xs=[x for y in range(max(box[1],bottom-5),bottom+1) for x in range(box[0],box[2]) if pix[x,y]]
        # A foot centroid jumps sideways when support changes. Align the broad
        # head/upper trunk instead; retain one neutral offset to the foot root.
        # This estimate is still reviewed per fighter and can be overridden.
        bh=box[3]-box[1]
        head_rows=[]
        for yy in range(box[1]+round(bh*.12),box[1]+round(bh*.34)):
            row=np.flatnonzero(ap[yy])
            if len(row):head_rows.append((int(row[0])+int(row[-1]))/2)
        hx=float(np.median(head_rows))
        if i==0:neutral_offset=sum(xs)/len(xs)-hx
        source_anchor=anchors.get(name,[hx+neutral_offset+crop[0],bottom+1+crop[1]])
        anchor=[source_anchor[0]-crop[0],source_anchor[1]-crop[1]]
        cells.append((cell,box,anchor));report.append({'slot':i,'name':name,'bounds':g['box'],'sourceAnchor':source_anchor,'anchorStatus':'authored' if name in anchors else 'upper-trunk-estimate-needs-visual-review','discardedComponents':[g for g in extras if g['cell']==i and g['area']>8]})
    # Preserve body proportions across all frames; do not stretch each pose to
    # the same height (which would turn crouches into tall standing characters).
    neutral_h=cells[0][1][3]-cells[0][1][1];scale=128/neutral_h
    canvas_size=256;target=(112,210);dest=Path(out);dest.mkdir(parents=True,exist_ok=True)
    for i,(cell,box,anchor) in enumerate(cells):
        scaled=cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.NEAREST)
        x=round(target[0]-anchor[0]*scale);y=round(target[1]-anchor[1]*scale)
        b=scaled.getchannel('A').getbbox()
        if b[0]+x<1 or b[1]+y<1 or b[2]+x>=canvas_size or b[3]+y>=canvas_size:raise ValueError(f'{slots[i]}: canonical canvas would clip; author anchor or increase padding')
        frame=Image.new('RGBA',(canvas_size,canvas_size));frame.alpha_composite(scaled,(x,y));frame.save(dest/f'{i:02}-{slots[i]}.png')
        report[i]['canonicalBounds']=frame.getchannel('A').getbbox();report[i]['canonicalAnchor']=target
    manifest={'frames':[{'url':f'/fighters/poses/{ident}/{i:02}-{name}.png','width':canvas_size,'height':canvas_size,'anchor':target} for i,name in enumerate(slots)],'width':canvas_size,'height':canvas_size,'anchor':target,'scale':1.25,'facing':1,'walkCycleDistance':72}
    (dest/'metadata.json').write_text(json.dumps(manifest,indent=2));(dest/'report.json').write_text(json.dumps({'source':str(src),'sourceSize':[w,h],'uniformScale':scale,'threshold':96,'status':'requires visual acceptance and authored anchors','frames':report},indent=2))
    contact=Image.new('RGBA',(canvas_size*4,canvas_size*rows),'#27364b')
    for i,name in enumerate(slots):contact.alpha_composite(Image.open(dest/f'{i:02}-{name}.png'),(i%4*canvas_size,i//4*canvas_size))
    contact.save(dest/'contact.png');print(json.dumps({'frames':len(slots),'output':str(dest),'activated':False,'discardedComponents':len(extras)}))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('output');p.add_argument('fighter');p.add_argument('--anchors');p.add_argument('--rows',type=int,choices=[4,8],default=8);a=p.parse_args();run(a.source,a.output,a.fighter,a.anchors,a.rows)
